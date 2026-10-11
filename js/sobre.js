'use strict';
/* Teewald City — página "Sobre" (sobre.html): créditos e links do autor.
   Reaproveita a arte do jogo, desenhada em código: céu estrelado, lua, serras com araucárias,
   folhas de outono, a fonte bitmap e o logotipo da tela-título. */
(function () {
  var A = TC.ART;

  var TXT = {
    pt: {
      title: 'Sobre — Teewald City',
      back: 'Voltar ao jogo',
      kicker: 'SOBRE',
      by: 'Jogo desenvolvido por',
      role: 'UX/UI/CX Designer · Web · 3D · Ilustração',
      place: 'Santa Maria do Herval, RS — Brasil',
      bio: 'Designer desde 2008, com foco em experiência do cliente, UX/UI, web design, ilustração digital e modelagem 3D. É UX/UI/CX Designer Sênior no Grupo Herval, fundador da agência FKweb e bacharel em Artes Visuais pela Feevale.',
      links: 'LINKS',
      site: 'Site pessoal',
      fkweb: 'fkweb.com.br · agência de sites',
      mail: 'E-mail',
      cv: 'Currículo',
      thanks: 'OBRIGADO POR JOGAR!',
      hint: 'ESC volta ao jogo'
    },
    en: {
      title: 'About — Teewald City',
      back: 'Back to the game',
      kicker: 'ABOUT',
      by: 'A game by',
      role: 'UX/UI/CX Designer · Web · 3D · Illustration',
      place: 'Santa Maria do Herval, RS — Brazil',
      bio: 'Designer since 2008, focused on customer experience, UX/UI, web design, digital illustration and 3D modeling. Senior UX/UI/CX Designer at Grupo Herval, founder of the FKweb studio, with a degree in Visual Arts from Feevale University.',
      links: 'LINKS',
      site: 'Personal site',
      fkweb: 'fkweb.com.br · web studio',
      mail: 'E-mail',
      cv: 'Résumé',
      thanks: 'THANKS FOR PLAYING!',
      hint: 'ESC goes back to the game'
    }
  };

  var lang = TC.params.lang || TC.store.get('lang', null) || (/^pt/i.test(navigator.language || '') ? 'pt' : 'en');
  if (!TXT[lang]) lang = 'pt';
  var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* coloca um canvas no lugar do texto, ampliado pelo CSS (--w = largura em pixels do jogo) */
  function putCanvas(el, cv, label) {
    cv.style.setProperty('--w', cv.width);
    el.textContent = '';
    el.appendChild(cv);
    if (label) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', label); }
  }
  /* texto na fonte do jogo, com a sombra preta dos menus */
  function pixText(str, col) {
    var cv = TC.canvas(TC.font.measure(str) + 1, 12);
    TC.font.draw(cv.ctx, str, 0, 2, col, { shadow: '#000000' });
    return cv;
  }

  /* logotipo: mesma composição da tela-título (TEEWALD grande, CITY abaixo à direita) */
  var logo = (function () {
    var l1 = TC.ui.bigText('TEEWALD', 4, '#f4f0ff', '#5866a8', '#06050c');
    var l2 = TC.ui.bigText('CITY', 2, '#ffd890', '#c06030', '#06050c');
    var x1 = -Math.floor(l1.width / 2), y1 = -Math.floor(l1.height / 2);
    var x2 = 38 - Math.floor(l2.width / 2), y2 = 22 - Math.floor(l2.height / 2);
    var x0 = Math.min(x1, x2), y0 = Math.min(y1, y2);
    var w = Math.max(x1 + l1.width, x2 + l2.width) - x0, h = Math.max(y1 + l1.height, y2 + l2.height) - y0;
    var base = TC.canvas(w, h);
    base.ctx.drawImage(l1, x1 - x0, y1 - y0);
    base.ctx.drawImage(l2, x2 - x0, y2 - y0);
    var cv = TC.canvas(w, h);
    cv.ctx.drawImage(base, 0, 0);
    return { cv: cv, base: base, x: x1 - x0, w: l1.width, shining: false };
  })();
  putCanvas(document.querySelector('.logo'), logo.cv);

  /* brilho que atravessa o logotipo, como na tela-título (só pinta sobre as letras) */
  function shine(t) {
    var sx = ((t + 180) % 300) * 1.6 - 60;
    var on = sx > -20 && sx < logo.cv.height * 0.5 + logo.w + 20;
    if (!on && !logo.shining) return;
    var c = logo.cv.ctx;
    c.clearRect(0, 0, logo.cv.width, logo.cv.height);
    c.drawImage(logo.base, 0, 0);
    logo.shining = on;
    if (!on) return;
    c.save();
    c.globalCompositeOperation = 'source-atop';
    c.globalAlpha = 0.5;
    c.fillStyle = '#ffffff';
    for (var y = 0; y < logo.cv.height; y++) c.fillRect(Math.round(logo.x + sx - y * 0.5), y, 3, 1);
    c.restore();
  }

  putCanvas(document.querySelector('[data-big]'), TC.ui.bigText('FABIANO KUNST', 2, '#ffd890', '#c06030', '#06050c'), 'Fabiano Kunst');
  $$('[data-leaf]').forEach(function (el) {
    var leaf = A.leaves()[+el.getAttribute('data-leaf')][0];
    var cv = TC.canvas(leaf.width, leaf.height);
    cv.ctx.drawImage(leaf, 0, 0);
    el.appendChild(cv);
  });

  function render() {
    var T = TXT[lang];
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = T.title;
    $$('[data-t]').forEach(function (el) { el.textContent = T[el.getAttribute('data-t')]; });
    $$('[data-pix]').forEach(function (el) {
      var s = T[el.getAttribute('data-pix')];
      putCanvas(el, pixText(s, el.getAttribute('data-col') || '#ffffff'), s);
    });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    try { history.replaceState(null, '', '?lang=' + lang); } catch (e) { /* aberto como arquivo */ }
  }
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.getAttribute('data-lang'); render(); });
  });
  render();

  /* voltar: a aba foi aberta pelo jogo, então basta fechá-la; senão, carrega o jogo */
  function back(e) {
    if (e) e.preventDefault();
    if (window.opener && !window.opener.closed) window.close();
    setTimeout(function () { if (!window.closed) location.href = 'index.html'; }, 60);
  }
  document.querySelector('.back').addEventListener('click', back);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') back(e);
  });

  /* ---------- fundo animado ---------- */
  var sky = document.getElementById('sky'), sc = sky.getContext('2d');
  var moon = A.moon(11);
  var ridge = A.hills(512, 40, { seed: 31, color: '#0c0e22', rim: '#2a3060', base: 0.55, amp: 0.7, trees: 60, treeMin: 5, treeMax: 11, period: 6 });
  var ridge2 = A.hills(512, 30, { seed: 77, color: '#161a3a', rim: '#30386a', base: 0.5, amp: 0.8, period: 5 });
  var leafS = A.leaves();
  var lamps = [], r = TC.RNG(23);
  for (var i = 0; i < 16; i++) lamps.push({ x: r.int(4, 508), y: r.int(2, 9), p: r() * 6, k: r.range(4, 8) });
  var B = null, leaves = [], t = 0;

  function build() {
    var px = window.innerWidth >= 1400 ? 4 : 3;
    var w = Math.ceil(window.innerWidth / px), h = Math.ceil(window.innerHeight / px);
    if (B && B.w === w && B.h === h) return;
    sky.width = w;
    sky.height = h;
    sc.imageSmoothingEnabled = false;
    B = { w: w, h: h, grad: skyCanvas(w, h), tw: A.twinkles(w, Math.round(h * 0.75), Math.round(w * h / 1400), 7) };
  }
  /* céu da tela-título; numa tela alta as cores de 15 bits do jogo viram faixas largas,
     então o degradê aqui é suave e só as estrelas ficam em pixel */
  function skyCanvas(w, h) {
    var cv = TC.canvas(w, h), c = cv.ctx;
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#020309');
    g.addColorStop(0.6, '#0a0d2a');
    g.addColorStop(1, '#262a58');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    var rs = TC.RNG(12), n = Math.floor(w * h * 0.006);
    for (var s = 0; s < n; s++) {
      var sx = rs.int(0, w - 1), sy = Math.floor(Math.pow(rs(), 1.6) * h * 0.85), br = rs();
      c.fillStyle = br > 0.92 ? '#ffffff' : br > 0.7 ? '#c8d0f0' : br > 0.4 ? '#8088b8' : '#4a5080';
      c.fillRect(sx, sy, 1, 1);
    }
    return cv;
  }

  function step() {
    t++;
    if (t % 9 === 0) {
      for (var n = Math.max(1, Math.round(B.w / 256)); n > 0; n--) {
        leaves.push({ x: TC.rnd.range(-20, B.w + 4), y: -6, vx: TC.rnd.range(0.2, 0.7), vy: TC.rnd.range(0.35, 0.7), ph: TC.rnd() * 6, age: 0, s: leafS[TC.rnd.int(0, 2)] });
      }
    }
    for (var j = leaves.length - 1; j >= 0; j--) {
      var p = leaves[j];
      p.age++;
      p.x += p.vx + Math.sin(p.ph + p.age * 0.05) * 0.3;
      p.y += p.vy;
      if (p.y > B.h + 6 || p.x > B.w + 10) leaves.splice(j, 1);
    }
  }

  function draw() {
    var w = B.w, h = B.h, x;
    sc.drawImage(B.grad, 0, 0);
    A.drawTwinkles(sc, B.tw, t, 0, 0);
    sc.drawImage(moon, Math.round(w * 0.8 - moon.width / 2), Math.round(Math.min(h * 0.16, 44) - moon.height / 2));
    var o2 = Math.floor(t * 0.02) % 512, o1 = Math.floor(t * 0.045) % 512;
    for (x = -o2; x < w; x += 512) sc.drawImage(ridge2, x, h - 44);
    sc.fillStyle = '#161a3a';
    sc.fillRect(0, h - 15, w, 15);
    // neblina sobre a serra do fundo
    for (var y = 0; y < 12; y++) {
      sc.fillStyle = TC.rgba('#3a3e70', 0.22 * (1 - y / 12));
      sc.fillRect(0, h - 40 + y, w, 1);
    }
    for (x = -o1; x < w; x += 512) sc.drawImage(ridge, x, h - 40);
    // luzes de sódio da cidade lá embaixo
    for (var k = 0; k < lamps.length; k++) {
      var L = lamps[k];
      for (x = L.x - o1; x < w + 10; x += 512) {
        if (x < -10) continue;
        var ly = h - L.y, a = 0.32 + 0.08 * Math.sin(t * 0.03 + L.p);
        var g = sc.createRadialGradient(x, ly, 0, x, ly, L.k);
        g.addColorStop(0, TC.rgba('#ffb050', a));
        g.addColorStop(1, TC.rgba('#ffb050', 0));
        sc.fillStyle = g;
        sc.fillRect(x - L.k, ly - L.k, L.k * 2, L.k * 2);
        sc.fillStyle = '#ffd890';
        sc.fillRect(x, ly, 1, 1);
      }
    }
    for (var j = 0; j < leaves.length; j++) {
      var p = leaves[j];
      sc.drawImage(p.s[Math.floor(p.age / 12) % 2], Math.round(p.x), Math.round(p.y));
    }
  }

  /* ---------- controle (joystick): direcional escolhe o link, A abre, B volta ---------- */
  var padPrev = {};
  function pollPad() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [], gp = null;
    for (var q = 0; q < pads.length; q++) if (pads[q] && pads[q].connected) { gp = pads[q]; break; }
    if (!gp) return;
    function b(n) { return !!(gp.buttons[n] && gp.buttons[n].pressed); }
    var ay = gp.axes[1] || 0, ax = gp.axes[0] || 0;
    var st = { a: b(0), b: b(1) || b(9), prev: b(12) || b(14) || ay < -0.6 || ax < -0.6, next: b(13) || b(15) || ay > 0.6 || ax > 0.6 };
    function hit(k) { return st[k] && !padPrev[k]; }
    if (hit('b')) back();
    if (hit('prev') || hit('next')) {
      var list = $$('.menu a, .btn');
      var cur = list.indexOf(document.activeElement);
      var nx = cur < 0 ? 0 : (cur + (hit('next') ? 1 : -1) + list.length) % list.length;
      list[nx].focus();
    }
    if (hit('a') && document.activeElement && document.activeElement !== document.body) document.activeElement.click();
    padPrev = st;
  }

  var last = 0, acc = 0;
  function frame(now) {
    build();
    acc += Math.min(100, now - (last || now));
    last = now;
    if (!still) {
      while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
      shine(t);
    }
    draw();
    pollPad();
    requestAnimationFrame(frame);
  }
  build();
  draw();
  requestAnimationFrame(frame);
})();
