'use strict';
/* Teewald City — laço principal, gerenciador de cenas, escala de tela e pós-processamento */
(function () {
  var screen = document.getElementById('screen');
  var wrap = document.getElementById('wrap');
  var crt = document.getElementById('crt');
  var sctx = screen.getContext('2d');
  sctx.imageSmoothingEnabled = false;
  var frame = TC.canvas(TC.W, TC.H);
  var mosaicCv = TC.canvas(TC.W, TC.H);

  var game = TC.game = {
    scene: null,
    t: 0,
    paused: false,
    go: function (scene) {
      if (game.scene && game.scene.exit) game.scene.exit();
      game.scene = scene;
      TC.fx.shakeT = 0; TC.fx.ox = TC.fx.oy = 0;
      if (scene && scene.enter) scene.enter();
    },
    /* escurece, troca de cena e clareia (fade de 16 passos como no SNES) */
    fadeTo: function (factory, frames, opts) {
      if (game._fade) return;
      frames = frames == null ? 30 : frames;
      opts = opts || {};
      game._fade = { factory: factory, frames: frames, stage: 0, mosaic: !!opts.mosaic, hold: opts.hold || 0, noFadeIn: !!opts.noFadeIn };
      TC.fx.tween('bright', 0, frames);
      if (opts.mosaic) TC.fx.tween('mosaic', 12, frames);
    },
    fading: function () { return !!game._fade; }
  };

  function processFade() {
    var f = game._fade;
    if (!f) return;
    if (f.stage === 0 && !TC.fx.busy('bright')) {
      if (f.hold > 0) { f.hold--; return; }
      f.stage = 1;
      game.go(f.factory());
      TC.fx.mosaic = 1;
      TC.fx.tween('mosaic', 1, 0);
      if (!f.noFadeIn) TC.fx.tween('bright', 15, f.frames);
      game._fade = null;
    }
  }

  /* ---------- escala da tela ----------
     No celular/tablet o controle virtual reserva espaço: nas laterais (deitado)
     ou embaixo da imagem (em pé), como num portátil. */
  function resize() {
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    var par = TC.opts.aspect === 'tv' ? 8 / 7 : 1;
    var dpr = window.devicePixelRatio || 1;
    var touchUI = TC.input.touchUI();
    var L = TC.input.layout;
    var box = touchUI ? L.box(vw, vh, par) : { x: 0, y: 0, w: vw, h: vh };
    // escala em pixels do aparelho: prefere múltiplo inteiro quando se perde pouco
    var sd = Math.min(box.w / (TC.W * par), box.h / TC.H) * dpr;
    if (sd >= 2) {
      var si = Math.floor(sd);
      if (sd - si < 0.35 || (sd - si) / sd < 0.08) sd = si;
    }
    var s = Math.max(0.5, sd / dpr);
    var w = Math.floor(TC.W * par * s * dpr) / dpr, h = Math.floor(TC.H * s * dpr) / dpr;
    var x = Math.round((box.x + (box.w - w) / 2) * dpr) / dpr;
    var y = Math.round((box.align === 'top' ? box.y : box.y + (box.h - h) / 2) * dpr) / dpr;
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    crt.style.backgroundSize = '100% 100%, 100% ' + (h / TC.H).toFixed(3) + 'px';
    L.show(touchUI);
    if (touchUI) L.place(vw, vh, { x: x, y: y, w: w, h: h });
    applyFilters();
  }
  function applyFilters() {
    crt.classList.toggle('on', !!TC.opts.crt);
    screen.classList.toggle('chroma', !!TC.opts.chroma);
  }
  TC.applyDisplay = function () { resize(); };
  var resizeT = 0;
  function resizeSoon() {
    resize();
    // girar o aparelho muda o tamanho em etapas em alguns navegadores: confere de novo
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 250);
  }
  window.addEventListener('resize', resizeSoon);
  window.addEventListener('orientationchange', resizeSoon);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeSoon);
  document.addEventListener('fullscreenchange', resizeSoon);
  document.addEventListener('webkitfullscreenchange', resizeSoon);

  function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  TC.enterFullscreen = function () {
    var el = document.documentElement;
    if (isFull()) return;
    try {
      var p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(function () { /* o navegador recusou */ });
    } catch (e) { /* sem tela cheia */ }
  };
  TC.toggleFullscreen = function () {
    var d = document;
    if (!isFull()) { TC.enterFullscreen(); return; }
    try {
      var p = (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      if (p && p.catch) p.catch(function () { /* ignore */ });
    } catch (e) { /* sem tela cheia */ }
  };

  /* ---------- áudio só começa após gesto do usuário ---------- */
  function unlockAudio() { TC.audio.init(); }
  TC.input.onKey(function (e) {
    unlockAudio();
    if (e.code === 'KeyF') TC.toggleFullscreen();
    if (e.code === 'KeyM') TC.audio.toggleMute();
  });
  window.addEventListener('pointerdown', unlockAudio);
  // no iPhone o áudio só é liberado ao soltar o dedo
  window.addEventListener('pointerup', unlockAudio);
  window.addEventListener('touchend', unlockAudio, { passive: true });

  /* app em segundo plano (trocou de app, ligação, tela bloqueada): pausa o jogo */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && game.scene && game.scene.onHide) game.scene.onHide();
  });

  /* ícone para "Adicionar à tela de início" do iPhone, desenhado com a arte do jogo */
  function homeIcon() {
    try {
      var A = TC.ART, cv = TC.canvas(60, 60), c = cv.ctx;
      c.drawImage(A.sky(60, 60, [[0, '#020309'], [0.6, '#0a0d2a'], [1, '#262a58']], 5, 0.01), 0, 0);
      var moon = A.moon(9);
      c.drawImage(moon, 40 - moon.width / 2, 17 - moon.height / 2);
      var ar = A.araucaria(7, 44, { sil: '#05060c' });
      c.drawImage(ar, 20 - ar.width / 2, 60 - ar.height + 3);
      c.fillStyle = '#05060c';
      c.fillRect(0, 56, 60, 4);
      var big = TC.canvas(180, 180);
      big.ctx.drawImage(cv, 0, 0, 180, 180);
      var link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = big.toDataURL('image/png');
      document.head.appendChild(link);
    } catch (e) { /* sem ícone */ }
  }

  /* ---------- renderização ---------- */
  function render() {
    var c = frame.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.imageSmoothingEnabled = false;
    if (game.scene && game.scene.draw) game.scene.draw(c);

    var fx = TC.fx;
    var src = frame;
    var m = Math.round(fx.mosaic);
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalAlpha = 1;
    sctx.globalCompositeOperation = 'source-over';
    sctx.fillStyle = '#000';
    if (fx.ox || fx.oy) sctx.fillRect(0, 0, TC.W, TC.H);
    if (m > 1) {
      var mw = Math.ceil(TC.W / m), mh = Math.ceil(TC.H / m);
      mosaicCv.ctx.clearRect(0, 0, TC.W, TC.H);
      mosaicCv.ctx.drawImage(frame, 0, 0, TC.W, TC.H, 0, 0, mw, mh);
      sctx.drawImage(mosaicCv, 0, 0, mw, mh, fx.ox, fx.oy, mw * m, mh * m);
    } else {
      sctx.drawImage(src, fx.ox, fx.oy);
    }
    if (fx.letterbox > 0) {
      var lb = Math.round(fx.letterbox);
      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, TC.W, lb);
      sctx.fillRect(0, TC.H - lb, TC.W, lb);
    }
    var b = Math.round(TC.clamp(fx.bright, 0, 15));
    if (b < 15) {
      sctx.fillStyle = 'rgba(0,0,0,' + (1 - b / 15).toFixed(3) + ')';
      sctx.fillRect(0, 0, TC.W, TC.H);
    }
    if (fx.flashA > 0) {
      sctx.globalAlpha = Math.min(1, fx.flashA);
      sctx.fillStyle = fx.flashCol;
      sctx.fillRect(0, 0, TC.W, TC.H);
      sctx.globalAlpha = 1;
    }
  }

  /* ---------- laço com passo fixo de 60 Hz ---------- */
  var STEP = 1000 / 60;
  var acc = 0, last = 0;
  function tick() {
    TC.input.update();
    if (game.scene && game.scene.update) game.scene.update();
    TC.fx.update();
    processFade();
    game.t++;
  }
  function loop(now) {
    if (!last) last = now;
    var dt = now - last;
    last = now;
    if (dt > 250) dt = 250;
    acc += dt;
    var n = 0;
    while (acc >= STEP && n < 6) { tick(); acc -= STEP; n++; }
    if (n >= 6) acc = 0;
    render();
    window.requestAnimationFrame(loop);
  }

  /* ---------- início ---------- */
  function start() {
    TC.input.init();
    resize();
    homeIcon();
    if (TC.params.audio) TC.audio.init();
    if (TC.params.sfxtest) {
      setTimeout(function () {
        console.log('AUDIO state ' + (TC.audio.ctx && TC.audio.ctx.state));
        TC.audio.sfxNames.forEach(function (n) { try { TC.audio.sfx(n, 500); } catch (e) { console.log('SFXERR ' + n + ' ' + e.message); } });
        Object.keys(TC.SONGS).forEach(function (s) { try { TC.audio.music(s, 0); } catch (e) { console.log('SONGERR ' + s + ' ' + e.message); } });
        try { TC.audio.engineStart(); TC.audio.engineSet(0.5, 0.1); TC.audio.static(1, 0.1); TC.audio.ambience('night'); TC.audio.engineStop(0.1); } catch (e) { console.log('MISCERR ' + e.message); }
        console.log('SFXTEST done');
      }, 300);
    }
    var sc = TC.params.scene;
    var map = {
      debug: function () { return new TC.DebugScene(); },
      title: function () { return new TC.TitleScene(); },
      intro: function () { return new TC.IntroScene(); },
      stage: function () { return new TC.StageScene({ fromIntro: TC.params.wake === '1' }); },
      ending: function () { return new TC.EndingScene(); },
      boot: function () { return new TC.BootScene(); }
    };
    if (sc && map[sc]) {
      if (!TC.opts.lang) TC.opts.lang = TC.params.lang || 'pt';
      if (TC.params.lang) TC.opts.lang = TC.params.lang;
      game.go(map[sc]());
    } else {
      game.go(new TC.BootScene());
    }
    // depuração: avança N quadros instantaneamente (?ff=N), com entradas simuladas (?press=quadro:ação,...)
    var ff = parseInt(TC.params.ff || '0', 10);
    if (ff > 0) {
      var presses = {};
      (TC.params.press || '').split(',').forEach(function (p) {
        var kv = p.split(':');
        if (kv.length === 2) (presses[kv[0]] = presses[kv[0]] || []).push(kv[1]);
      });
      var holds = [];
      (TC.params.hold || '').split(',').forEach(function (h) {
        var m = /^(\w+):(\d+)-(\d+)$/.exec(h);
        if (m) holds.push({ a: m[1], from: +m[2], to: +m[3] });
      });
      // ?every=ação:início:intervalo:fim  (toques repetidos)
      var everys = [];
      (TC.params.every || '').split(',').forEach(function (h) {
        var m = /^(\w+):(\d+):(\d+):(\d+)$/.exec(h);
        if (m) everys.push({ a: m[1], from: +m[2], step: +m[3], to: +m[4] });
      });
      for (var i = 0; i < ff; i++) {
        var sim = (presses[i] || []).slice();
        everys.forEach(function (e) { if (i >= e.from && i <= e.to && (i - e.from) % e.step === 0) sim.push(e.a); });
        TC.input._sim = sim.length ? sim : null;
        TC.input._hold = holds.filter(function (h) { return i >= h.from && i <= h.to; }).map(function (h) { return h.a; });
        tick();
        TC.input._sim = null;
        TC.input._hold = null;
      }
    }
    if (TC.params.perf) {
      var t0 = performance.now(), n = 120;
      for (var k = 0; k < n; k++) { tick(); render(); }
      console.log('PERF ' + TC.params.scene + ' ' + ((performance.now() - t0) / n).toFixed(2) + ' ms/quadro');
    }
    window.requestAnimationFrame(loop);
  }
  TC.start = start;
  start();
})();
