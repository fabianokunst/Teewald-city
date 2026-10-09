'use strict';
/* Teewald City — entrada: teclado, controle (Gamepad API) e toque (controle virtual na tela) */
(function () {
  var ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'attack', 'special', 'start', 'confirm', 'back'];

  var KEYMAP = {
    ArrowLeft: ['left'], KeyA: ['left'],
    ArrowRight: ['right'], KeyD: ['right'],
    ArrowUp: ['up'], KeyW: ['up'],
    ArrowDown: ['down'], KeyS: ['down'],
    KeyZ: ['jump', 'confirm'], Space: ['jump', 'confirm'], KeyK: ['jump', 'confirm'],
    KeyX: ['attack', 'back'], KeyJ: ['attack'],
    KeyC: ['special'], KeyL: ['special'],
    Enter: ['start', 'confirm'], NumpadEnter: ['start', 'confirm'],
    Escape: ['start', 'back'], Backspace: ['back'], KeyP: ['start']
  };
  /* o que cada botão da tela aciona (A = pular/confirmar, B = atacar/voltar, como no teclado) */
  var TOUCHMAP = {
    jump: ['jump', 'confirm'], attack: ['attack', 'back'], special: ['special'], start: ['start', 'confirm']
  };

  var keys = {};       // estado bruto das teclas
  var hits = {};       // ações acionadas desde o último update (para toques rápidos)
  var touch = {};      // ações ativas via toque
  var cur = {}, prev = {};
  var anyHit = false;
  var listeners = [];
  var tapNext = null;  // toque/clique na imagem do jogo, em pixels do jogo

  ACTIONS.forEach(function (a) { cur[a] = prev[a] = false; touch[a] = false; });

  /* último tipo de entrada usado: o controle na tela some quando se usa teclado ou controle físico */
  var canTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var device = canTouch && coarse ? 'touch' : 'key';
  function touchShown() {
    if (TC.params.touch === '1') return true;
    if (TC.params.touch === '0') return false;
    return canTouch && device === 'touch';
  }
  function setDevice(d) {
    if (d === device) return;
    var was = touchShown();
    device = d;
    if (touchShown() !== was && TC.applyDisplay) TC.applyDisplay();
  }

  /* opções do controle na tela (guardadas à parte das opções gerais) */
  TC.opts.tsize = TC.clamp(TC.store.get('tsize', 1) | 0, 0, 2);
  TC.opts.vibe = TC.store.get('vibe', true) !== false;
  var SIZE = [0.84, 1, 1.18];

  function buzz(ms) {
    if (!TC.opts.vibe || !navigator.vibrate) return;
    try { navigator.vibrate(ms); } catch (e) { /* sem vibração */ }
  }

  function onKey(e, down) {
    var acts = KEYMAP[e.code];
    if (down) {
      anyHit = true;
      setDevice('key');
      listeners.forEach(function (fn) { fn(e); });
    }
    if (!acts) return;
    e.preventDefault();
    if (down && !e.repeat) acts.forEach(function (a) { hits[a] = true; });
    keys[e.code] = down;
  }
  window.addEventListener('keydown', function (e) { onKey(e, true); });
  window.addEventListener('keyup', function (e) { onKey(e, false); });
  window.addEventListener('blur', function () { keys = {}; releaseAll(); });

  function keyDown(action) {
    for (var code in KEYMAP) {
      if (keys[code] && KEYMAP[code].indexOf(action) >= 0) return true;
    }
    return false;
  }

  /* ---------- gamepad ---------- */
  var padState = {};
  var anyPadDown = false, anyPadPrev = false;
  function pollPad() {
    ACTIONS.forEach(function (a) { padState[a] = false; });
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i];
      if (!p || !p.connected) continue;
      var b = function (n) { return p.buttons[n] && p.buttons[n].pressed; };
      var ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      if (b(14) || ax < -0.45) padState.left = true;
      if (b(15) || ax > 0.45) padState.right = true;
      if (b(12) || ay < -0.5) padState.up = true;
      if (b(13) || ay > 0.5) padState.down = true;
      if (b(0)) { padState.jump = true; padState.confirm = true; }
      if (b(1)) { padState.attack = true; padState.back = true; }
      if (b(2)) padState.attack = true;
      if (b(3) || b(5) || b(7)) padState.special = true;
      if (b(9)) { padState.start = true; padState.confirm = true; }
      if (b(8)) padState.back = true;
      for (var k = 0; k < p.buttons.length; k++) if (b(k)) anyPadDown = true;
      if (Math.abs(ax) > 0.6 || Math.abs(ay) > 0.6) anyPadDown = true;
    }
    if (anyPadDown) setDevice('pad');
  }

  /* ---------- controle virtual na tela ----------
     Os elementos são só desenho; o toque é decidido por geometria, com áreas
     de acerto maiores que os botões, e o dedo pode deslizar de um botão a outro. */
  var T = {
    root: null, shown: false, portrait: false, D: 128,
    pad: { x: 0, y: 0, el: null, cross: null, cls: '' },
    btns: [],     // {act, x, y, el}
    pills: [],    // {act, x, y, w, h, el}
    brand: null, body: null,
    labels: ''
  };
  var pointers = {};   // pointerId -> {kind:'pad'|'btn'|'pill', act, dirs, inside}

  function pixText(str, color, shadow) {
    var cv = TC.canvas(TC.font.measure(str) + 2, 12);
    TC.font.draw(cv.ctx, str, 0, 2, color, shadow ? { shadow: shadow } : null);
    return cv;
  }
  /* ícones em pixel art para os botões pequenos */
  var ICONS = {
    sound: ['....#....', '...##..#.', '####.#..#', '####..#.#', '####..#.#', '####.#..#', '...##..#.', '....#....'],
    mute: ['....#....', '...##....', '####.#.#.', '####..#..', '####.#.#.', '####.....', '...##....', '....#....'],
    full: ['###...###', '#.......#', '#.......#', '.........', '.........', '#.......#', '#.......#', '###...###']
  };
  function iconCanvas(rows, color) {
    var cv = TC.canvas(rows[0].length, rows.length);
    cv.ctx.fillStyle = color;
    rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r.charAt(x) === '#') cv.ctx.fillRect(x, y, 1, 1); });
    return cv;
  }
  function setPix(el, cv, k) {
    el.innerHTML = '';
    cv.style.width = cv.width * k + 'px';
    cv.style.height = cv.height * k + 'px';
    el.appendChild(cv);
  }

  function build() {
    var old = document.getElementById('touch');
    if (old) old.parentNode.removeChild(old);
    var root = T.root = document.createElement('div');
    root.id = 'touch';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<div class="t-body"></div><div class="t-brand"></div>' +
      '<div class="t-pad"><div class="t-well"></div><div class="t-cross">' +
      '<i class="t-hub"></i><i class="t-arm t-u"></i><i class="t-arm t-d"></i><i class="t-arm t-l"></i><i class="t-arm t-r"></i></div></div>';
    document.body.appendChild(root);
    T.body = root.querySelector('.t-body');
    T.brand = root.querySelector('.t-brand');
    T.pad.el = root.querySelector('.t-pad');
    T.pad.cross = root.querySelector('.t-cross');
    [['special', 'Y'], ['attack', 'B'], ['jump', 'A']].forEach(function (d) {
      var el = document.createElement('div');
      el.className = 't-btn ' + d[0];
      el.innerHTML = '<div class="t-cap"></div><div class="t-lbl"></div>';
      root.appendChild(el);
      T.btns.push({ act: d[0], letter: d[1], x: 0, y: 0, el: el });
    });
    ['mute', 'full', 'start'].forEach(function (a) {
      var el = document.createElement('div');
      el.className = 't-pill';
      root.appendChild(el);
      T.pills.push({ act: a, x: 0, y: 0, w: 0, h: 0, el: el });
    });
    var probe = document.createElement('div');
    probe.id = 'safe-probe';
    document.body.appendChild(probe);
  }

  /* textos em pixel art (refeitos quando muda o idioma ou o tamanho) */
  function paintLabels(k) {
    var key = TC.opts.lang + '|' + k + '|' + (TC.audio && TC.audio.muted);
    if (key === T.labels) return;
    T.labels = key;
    T.btns.forEach(function (b) {
      setPix(b.el.querySelector('.t-cap'), pixText(b.letter, 'rgba(20,8,16,0.62)'), k + 1);
      setPix(b.el.querySelector('.t-lbl'), pixText(TC.t('tb.' + b.act), '#9ca2cc', '#000'), k);
    });
    T.pills.forEach(function (p) {
      var cv = p.act === 'start' ? pixText('START', '#c8cce4', '#000')
        : iconCanvas(ICONS[p.act === 'full' ? 'full' : (TC.audio && TC.audio.muted ? 'mute' : 'sound')], '#c8cce4');
      setPix(p.el, cv, k);
    });
    if (TC.ui && TC.ui.bigText) {
      var logo = TC.ui.bigText('TEEWALD CITY', 1, '#5a5f92', '#2e3150', '#05060c');
      var c2 = TC.canvas(logo.width, logo.height);
      c2.ctx.drawImage(logo, 0, 0);
      setPix(T.brand, c2, k);
    }
  }

  function safeArea() {
    var el = document.getElementById('safe-probe');
    var s = { t: 0, r: 0, b: 0, l: 0 };
    if (!el) return s;
    var cs = window.getComputedStyle(el);
    s.t = parseFloat(cs.paddingTop) || 0;
    s.r = parseFloat(cs.paddingRight) || 0;
    s.b = parseFloat(cs.paddingBottom) || 0;
    s.l = parseFloat(cs.paddingLeft) || 0;
    return s;
  }

  /* geometria do grupo de botões A/B/Y em torno do centro (cx, cy) */
  function btnSpots(cx, cy, D) {
    var r = D * 0.42;
    return { special: [cx - r, cy - r * 0.5], attack: [cx, cy + r * 0.5], jump: [cx + r, cy - r * 0.5] };
  }

  /* 1ª etapa: decide o espaço da imagem do jogo, reservando lugar para os controles */
  T.box = function (vw, vh, par) {
    var s = T.safe = safeArea();
    var D = T.D = Math.round(TC.clamp(Math.min(vw, vh) * 0.33, 104, 150) * SIZE[TC.opts.tsize]);
    var m = Math.round(D * 0.16);
    T.portrait = vh > vw * 1.05;
    if (T.portrait) {
      var ctrl = Math.round(D * 1.25 + 56 + m);       // direcional + botões + fileira do START
      return { x: s.l, y: s.t, w: vw - s.l - s.r, h: Math.max(TC.H * 0.5, vh - s.t - s.b - ctrl), align: 'top' };
    }
    var gl = s.l * 0.6 + m + D + m * 0.5;            // largura que o direcional precisa
    var gr = s.r * 0.6 + m + D * 1.28 + m * 0.5;     // largura que os botões precisam
    var G = Math.max(gl, gr);
    var full = { x: s.l, y: s.t, w: vw - s.l - s.r, h: vh - s.t - s.b };
    var fit = function (b) { return Math.min(b.w / (TC.W * par), b.h / TC.H); };
    var sFull = fit(full);
    var res = { x: G, y: s.t, w: Math.max(TC.W * 0.5, vw - 2 * G), h: full.h };
    if (fit(res) >= sFull * 0.86) return res;
    // não cabe sem sobrepor: aceita os controles por cima das bordas, sem encolher demais a imagem
    var w = Math.min(full.w, TC.W * par * sFull * 0.86);
    return { x: (vw - w) / 2, y: s.t, w: w, h: full.h };
  };

  /* 2ª etapa: com a imagem do jogo já posicionada, distribui os controles */
  T.place = function (vw, vh, g) {
    var s = T.safe, D = T.D, m = Math.round(D * 0.16);
    var k = Math.max(1, Math.round(D / 64));
    var r = D * 0.42, br = D * 0.22;
    var pillH = Math.max(26, Math.round(D * 0.21));
    T.root.style.setProperty('--D', D + 'px');
    T.root.classList.toggle('portrait', T.portrait);
    paintLabels(k);
    var padX, padY, bx, by, pills = {};
    var bottomExt = Math.max(D * 0.5, r * 0.5 + br + 6 + 12 * k);   // até o rótulo embaixo do B
    if (T.portrait) {
      var top = g.y + g.h, bot = vh - s.b;
      T.body.style.top = top + 'px';
      padY = Math.round(Math.min(bot - m - bottomExt, bot - Math.max(D * 0.7, (bot - top) * 0.38)));
      padX = Math.round(s.l + m + D / 2);
      bx = Math.round(vw - s.r - m - br - r);
      by = padY;
      var gap = padY - D / 2 - top;
      T.brand.style.display = gap > 90 ? '' : 'none';
      T.brand.style.left = Math.round(vw / 2) + 'px';
      T.brand.style.top = Math.round(top + gap * 0.3) + 'px';
      var py = Math.round(top + (gap > 90 ? gap * 0.68 : gap * 0.5) - pillH / 2);
      var pw = Math.round(pillH * 1.7), sw = Math.round(pillH * 3.2), sp = Math.round(pillH * 0.5);
      var nfull = canFullscreen() ? 1 : 0;
      var x0 = Math.round(vw / 2 - (pw * (1 + nfull) + sw + sp * (1 + nfull)) / 2);
      pills.mute = [x0, py, pw]; pills.full = [x0 + pw + sp, py, pw]; pills.start = [x0 + (1 + nfull) * (pw + sp), py, sw];
    } else {
      var rowY = vh - s.b - m * 0.6 - bottomExt;
      padX = Math.round(s.l * 0.6 + m + D / 2);
      padY = Math.round(Math.min(rowY, vh * 0.5 + D * 0.5 + 10));
      bx = Math.round(vw - s.r * 0.6 - m - br - r);
      by = padY;
      var ty = Math.round(s.t + Math.max(10, m * 0.6));
      var pw2 = Math.round(pillH * 1.7), sw2 = Math.round(pillH * 3.2);
      var lx = Math.round(Math.max(s.l * 0.6 + m, g.x / 2 - pw2 - 4));
      pills.mute = [lx, ty, pw2]; pills.full = [lx + pw2 + 8, ty, pw2];
      pills.start = [Math.round(Math.min(vw - s.r * 0.6 - m - sw2, g.x + g.w + (vw - g.x - g.w) / 2 - sw2 / 2)), ty, sw2];
    }
    T.pad.x = padX; T.pad.y = padY;
    var pe = T.pad.el;
    pe.style.left = Math.round(padX - D / 2) + 'px';
    pe.style.top = Math.round(padY - D / 2) + 'px';
    var spots = btnSpots(bx, by, D);
    T.btns.forEach(function (b) {
      b.x = spots[b.act][0]; b.y = spots[b.act][1];
      b.el.style.left = Math.round(b.x - br) + 'px';
      b.el.style.top = Math.round(b.y - br) + 'px';
    });
    var fsOk = canFullscreen();
    T.pills.forEach(function (p) {
      var q = pills[p.act];
      p.x = q[0]; p.y = q[1]; p.w = q[2]; p.h = pillH;
      p.hidden = p.act === 'full' && !fsOk;
      p.el.classList.toggle('hide', p.hidden);
      p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px';
      p.el.style.width = p.w + 'px'; p.el.style.height = p.h + 'px';
    });
    // o que fica por cima da imagem do jogo fica mais transparente
    var overlaps = function (x, y, w, h) { return !T.portrait && x < g.x + g.w && x + w > g.x && y < g.y + g.h && y + h > g.y; };
    pe.classList.toggle('over', overlaps(padX - D * 0.42, padY - D * 0.42, D * 0.84, D * 0.84));
    T.btns.forEach(function (b) { b.el.classList.toggle('over', overlaps(b.x - br, b.y - br, br * 2, br * 2)); });
    T.pills.forEach(function (p) { p.el.classList.toggle('over', overlaps(p.x, p.y, p.w, p.h)); });
  };

  function canFullscreen() {
    var d = document, el = d.documentElement;
    if (window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches)) return false;
    return !!(el.requestFullscreen || el.webkitRequestFullscreen) && (d.fullscreenEnabled !== false || d.webkitFullscreenEnabled);
  }

  /* ---------- toque: classificação por geometria ---------- */
  function inPill(p, x, y, pad) {
    return !p.hidden && x >= p.x - pad && x <= p.x + p.w + pad && y >= p.y - pad && y <= p.y + p.h + pad;
  }
  function nearestBtn(x, y, reach) {
    var best = null, bd = Infinity;
    for (var i = 0; i < T.btns.length; i++) {
      var b = T.btns[i], d = TC.dist(x, y, b.x, b.y);
      if (d < bd) { bd = d; best = b; }
    }
    return bd <= T.D * reach ? { b: best, d: bd / (T.D * reach) } : null;
  }
  function classify(x, y) {
    for (var i = 0; i < T.pills.length; i++) {
      if (inPill(T.pills[i], x, y, 8)) return { kind: 'pill', act: T.pills[i].act, pill: T.pills[i], inside: true };
    }
    var dp = TC.dist(x, y, T.pad.x, T.pad.y) / (T.D * 0.85);
    var nb = nearestBtn(x, y, 0.36);
    if (nb && (dp > 1 || nb.d < dp)) return { kind: 'btn', act: nb.b.act };
    if (dp <= 1) return { kind: 'pad', dirs: {} };
    return null;
  }
  /* direções do direcional: a faixa horizontal é mais larga (±37°), para que andar
     com o polegar meio torto não aperte ↑ sem querer perto das placas */
  function padDirs(x, y) {
    var dx = x - T.pad.x, dy = y - T.pad.y, o = {};
    var ax = Math.abs(dx), ay = Math.abs(dy), dead = T.D * 0.11;
    if (ax < dead && ay < dead) return o;
    if (ax > ay * 0.45) o[dx < 0 ? 'left' : 'right'] = true;
    if (ay > ax * 0.75) o[dy < 0 ? 'up' : 'down'] = true;
    return o;
  }
  function press(act) {
    (TOUCHMAP[act] || [act]).forEach(function (a) { hits[a] = true; });
  }

  function refresh() {
    ACTIONS.forEach(function (a) { touch[a] = false; });
    var on = {}, dx = 0, dy = 0;
    Object.keys(pointers).forEach(function (id) {
      var p = pointers[id];
      if (p.kind === 'pad') {
        Object.keys(p.dirs).forEach(function (d) { touch[d] = true; });
      } else if (p.kind === 'btn' && p.act) {
        TOUCHMAP[p.act].forEach(function (a) { touch[a] = true; });
        on[p.act] = true;
      } else if (p.kind === 'pill' && p.inside) {
        if (p.act === 'start') TOUCHMAP.start.forEach(function (a) { touch[a] = true; });
        on['pill-' + p.act] = true;
      }
    });
    if (touch.left) dx = -1; else if (touch.right) dx = 1;
    if (touch.up) dy = -1; else if (touch.down) dy = 1;
    var cls = (dy < 0 ? ' u' : dy > 0 ? ' d' : '') + (dx < 0 ? ' l' : dx > 0 ? ' r' : '');
    if (cls !== T.pad.cls) {
      T.pad.cls = cls;
      var over = T.pad.el.classList.contains('over');
      T.pad.el.className = 't-pad' + cls + (over ? ' over' : '');
      T.pad.cross.style.transform = cls ? 'perspective(' + (T.D * 3) + 'px) rotateX(' + (-dy * 12) + 'deg) rotateY(' + (dx * 12) + 'deg)' : '';
    }
    T.btns.forEach(function (b) { b.el.classList.toggle('on', !!on[b.act]); });
    T.pills.forEach(function (p) { p.el.classList.toggle('on', !!on['pill-' + p.act]); });
  }
  function releaseAll() { pointers = {}; refresh(); }

  function pillAction(act) {
    if (act === 'mute') { TC.audio.init(); TC.audio.toggleMute(); T.labels = ''; paintLabels(Math.max(1, Math.round(T.D / 64))); }
    else if (act === 'full') TC.toggleFullscreen();
  }

  function screenTap(x, y) {
    var sc = document.getElementById('screen');
    if (!sc) return false;
    var r = sc.getBoundingClientRect();
    if (x < r.left || y < r.top || x > r.right || y > r.bottom) return false;
    tapNext = { x: (x - r.left) / r.width * TC.W, y: (y - r.top) / r.height * TC.H };
    anyHit = true;
    hits.confirm = true;
    listeners.forEach(function (fn) { fn({ code: 'Pointer' }); });
    return true;
  }

  var autoFull = true;   // primeiro toque no celular entra em tela cheia (onde o navegador deixa)
  function onDown(e) {
    var isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    if (isTouch) setDevice('touch');
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var x = e.clientX, y = e.clientY;
    if (T.shown) {
      var c = classify(x, y);
      if (c) {
        if (e.cancelable) e.preventDefault();
        anyHit = true;
        pointers[e.pointerId] = c;
        if (c.kind === 'pad') {
          c.dirs = padDirs(x, y);
          Object.keys(c.dirs).forEach(function (d) { hits[d] = true; });
        } else if (c.kind === 'btn') {
          press(c.act);
          buzz(12);
        } else if (c.act === 'start') {
          press('start');
          buzz(12);
        }
        refresh();
        return;
      }
    }
    screenTap(x, y);
  }
  function onMove(e) {
    var p = pointers[e.pointerId];
    if (!p) return;
    var x = e.clientX, y = e.clientY;
    if (p.kind === 'pad') {
      var nd = padDirs(x, y), changed = false;
      Object.keys(nd).forEach(function (d) { if (!p.dirs[d]) { hits[d] = true; changed = true; } });
      Object.keys(p.dirs).forEach(function (d) { if (!nd[d]) changed = true; });
      if (changed) { p.dirs = nd; refresh(); }
    } else if (p.kind === 'btn') {
      // desliza de um botão para outro (ex.: do B para o A sem levantar o dedo)
      var nb = nearestBtn(x, y, 0.46), act = nb ? nb.b.act : null;
      if (act !== p.act) {
        p.act = act;
        if (act) { press(act); buzz(8); }
        refresh();
      }
    } else if (p.kind === 'pill') {
      var ins = inPill(p.pill, x, y, 14);
      if (ins !== p.inside) { p.inside = ins; refresh(); }
    }
  }
  function onUp(e) {
    var p = pointers[e.pointerId];
    if (p) {
      delete pointers[e.pointerId];
      if (p.kind === 'pill' && p.inside && e.type === 'pointerup') { buzz(10); pillAction(p.act); }
      refresh();
    }
    // tela cheia precisa de um gesto "completo" (o navegador só libera no soltar do dedo)
    if (autoFull && e.type === 'pointerup' && e.pointerType === 'touch' && canFullscreen() && !(p && p.act === 'full')) {
      autoFull = false;
      TC.enterFullscreen && TC.enterFullscreen();
    }
  }

  function setupPointers() {
    window.addEventListener('pointerdown', onDown, { passive: false });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    // segurar o dedo não abre menu de contexto nem lupa
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });
  }

  /* chamado pela escala de tela (main.js) */
  T.show = function (on) {
    T.shown = on;
    if (T.root) T.root.classList.toggle('on', on);
    if (!on) releaseAll();
  };

  /* opções do controle na tela, inseridas antes de "TELA CHEIA" no menu de opções */
  function touchOptions(items) {
    if (!canTouch && TC.params.touch !== '1') return;
    var idx = items.length - 2;
    for (var i = 0; i < items.length; i++) {
      var lb = typeof items[i].label === 'function' ? items[i].label() : items[i].label;
      if (lb === TC.t('opt.full')) { idx = i; break; }
    }
    var sizeT = function (d) { return function () { TC.opts.tsize = (TC.opts.tsize + d + 3) % 3; TC.store.set('tsize', TC.opts.tsize); if (TC.applyDisplay) TC.applyDisplay(); }; };
    var vibeT = function () { TC.opts.vibe = !TC.opts.vibe; TC.store.set('vibe', TC.opts.vibe); buzz(30); };
    var add = [{ label: function () { return TC.t('opt.tsize'); }, value: function () { return TC.t('tsize.' + TC.opts.tsize); }, left: sizeT(-1), right: sizeT(1) }];
    if (navigator.vibrate) add.push({ label: function () { return TC.t('opt.vibe'); }, value: function () { return TC.t(TC.opts.vibe ? 'on' : 'off'); }, left: vibeT, right: vibeT });
    Array.prototype.splice.apply(items, [idx, 0].concat(add));
  }

  TC.input = {
    init: function () { build(); setupPointers(); },
    update: function () {
      pollPad();
      if (this._sim) this._sim.forEach(function (a) { hits[a] = true; });
      if (this._hold) this._hold.forEach(function (a) { hits[a] = true; });
      ACTIONS.forEach(function (a) {
        prev[a] = cur[a];
        var d = keyDown(a) || padState[a] || touch[a];
        cur[a] = d || !!hits[a];
        // um toque muito rápido ainda gera um "pressed"
        if (hits[a] && prev[a] && !d) prev[a] = false;
      });
      this._any = anyHit || (anyPadDown && !anyPadPrev);
      anyPadPrev = anyPadDown;
      anyPadDown = false;
      anyHit = false;
      this._hits = hits;
      hits = {};
      this._tap = tapNext;
      tapNext = null;
      if (TC.params.tap) this._simTap();
    },
    down: function (a) { return cur[a]; },
    pressed: function (a) { return cur[a] && !prev[a]; },
    released: function (a) { return !cur[a] && prev[a]; },
    any: function () { return !!this._any; },
    /* toque/clique na imagem do jogo neste quadro: {x, y} em pixels do jogo, ou null */
    tap: function () { return this._tap; },
    onKey: function (fn) { listeners.push(fn); },
    clear: function () { ACTIONS.forEach(function (a) { prev[a] = cur[a] = true; }); },
    touchUI: touchShown,
    touchCapable: function () { return canTouch || TC.params.touch === '1'; },
    haptic: buzz,
    touchOptions: touchOptions,
    layout: T,
    // depuração: ?tap=quadro:x:y,... simula toques na imagem do jogo (com ?ff=)
    _frame: 0,
    _simTap: function () {
      var f = this._frame++;
      var self = this;
      TC.params.tap.split(',').forEach(function (s) {
        var m = /^(\d+):(\d+):(\d+)$/.exec(s);
        if (m && +m[1] === f) { self._tap = { x: +m[2], y: +m[3] }; cur.confirm = true; prev.confirm = false; }
      });
    }
  };
})();
