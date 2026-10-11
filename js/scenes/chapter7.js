'use strict';
/* Teewald City — Capítulo 7: "A Última Fita"
   Prólogo: a cidade inteira abrigada na Matriz; o último verso que não se borda; as sete fitas, uma de cada capítulo;
   o laço do Moço, agora bento; e o sino batendo sete vezes sozinho.
   Final (o fim do jogo): a manhã pelos vitrais, o relógio do Ewald voltando a andar e os vinte anos chegando de uma vez,
   os quatro epílogos, o caminhão descendo a serra com o pai no banco do carona, FIM e os créditos dos sete capítulos. */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GYS = 196;   // pés das figuras nas cenas da igreja

  function say(dlg, who, key, face, pos) { return TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }
  function floorStrip(day) {
    var cv = TC.canvas(W, 32), c = cv.ctx;
    for (var y = 0; y < 32; y++) for (var x = 0; x < W; x++) {
      var plank = Math.floor((x + (Math.floor(y / 8) % 2) * 20) / 40);
      c.fillStyle = TC.col(y % 8 === 0 ? (day ? '#6a4428' : '#1a0e08') : ((x + (Math.floor(y / 8) % 2) * 20) % 40 === 0 ? (day ? '#5a3a20' : '#140a06') : (TC.hash2(plank, Math.floor(y / 8), 7) > 0.5 ? (day ? '#a87850' : '#3a2416') : (day ? '#9a6c46' : '#321e12'))));
      c.fillRect(x, y, 1, 1);
    }
    return cv;
  }
  function lightPass(scene, c, ambient, addLights) {
    var pc = scene.pf.ctx, L = scene.light;
    L.begin(ambient);
    addLights(L);
    scene.mask.ctx.clearRect(0, 0, W, H);
    scene.mask.ctx.drawImage(scene.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(scene.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(scene.pf, 0, 0);
  }
  function drawTexts(c, texts) {
    for (var i = 0; i < texts.length; i++) {
      var tx = texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
  }
  /* o povo nos bancos, ao fundo (de perfil, olhando para o altar) */
  function drawPews(c, C7, t, y, pose, alpha, tint) {
    for (var i = 0; i < 8; i++) {
      var x = 22 + i * 29;
      c.fillStyle = tint ? '#160c08' : '#2a1a10';
      c.fillRect(x - 12, y - 20, 3, 18);
      c.fillStyle = tint ? '#22140c' : '#4a2e1c';
      c.fillRect(x - 12, y - 20, 24, 3);
      var p = typeof pose === 'function' ? pose(i) : pose;
      C7.drawFig(c, C7.folk[(i * 3) % 8], p, x, y, 1, t + i * 11, t + i * 5, alpha, tint, 0.86);
      c.globalAlpha = alpha == null ? 1 : alpha;
      c.drawImage(tint ? TC.tintCached(C7.pew, tint[0], tint[1]) : C7.pew, x + 2, y - 13);
      c.globalAlpha = 1;
    }
  }

  /* ==================================================================
     PRÓLOGO
     ================================================================== */
  function Ch7IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    var C7 = this.C7 = A.ch7Init();
    this.nave = C7.nave(false);
    this.floor = floorStrip(false);
    var C2 = C7.C2, C3 = C7.C3, CAST = C7.CAST;
    var cast = [
      ['kessler', C2.kessler, 'stand', 16, 1], ['helmut', CAST.helmut, 'idle', 36, 1], ['arnoldo', CAST.arnoldo, 'idle', 56, 1],
      ['lena', CAST.kids.girl, 'idle', 73, 1], ['arno', A.arno, 'idle', 100, 1], ['ewald', C7.ewaldYoung, 'idle', 122, -1], ['ingrid', C3.ingrid, 'idle', 142, -1],
      ['erwin', C7.erwin, 'idle', 162, -1], ['gerhard', CAST.gerhard, 'idle', 186, -1],
      ['rosa', CAST.rosa, 'idle', 212, -1], ['frida', CAST.frida, 'cuia', 236, -1],
      ['kidb', CAST.kids.boy, 'idle', 84, 1, 4], ['kids', CAST.kids.small, 'idle', 198, -1, 4]
    ];
    this.cast = {};
    this.order = [];
    var self = this;
    cast.forEach(function (c) { var o = { id: c[0], set: c[1], pose: c[2], base: c[2], x: c[3], x0: c[3], face: c[4], anim: 0, dy: c[5] || 0 }; self.cast[c[0]] = o; self.order.push(o); });
    this.slots = [];
    this.flying = [];
    this.fogWin = 0;
    this.lassoShow = 0;
    this.tolls = 0;
    this.cap = null; this.capA = 0;
    this.pray = false;
    this.script = new TC.Script(this.run());
  }
  Ch7IntroScene.prototype.enter = function () { TC.fx.bright = 0; TC.audio.ambience('windy'); };
  Ch7IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };
  Ch7IntroScene.prototype.step = function* (o, to, n) {
    var from = o.x;
    for (var i = 1; i <= n; i++) { o.x = from + (to - from) * i / n; o.anim++; yield; }
  };
  Ch7IntroScene.prototype.toll = function () {
    this.tolls++;
    TC.audio.sfx('bellToll');
    TC.fx.shake(2, 24);
    this.fogWin = Math.min(1, this.tolls / 5);
    this.pray = true;
    for (var i = 0; i < 10; i++) this.parts.add({ x: TC.rnd.range(0, W), y: TC.rnd.range(0, 30), vy: TC.rnd.range(0.4, 1.2), ay: 0.02, life: 120, color: '#8a8698', size: 1, fade: true });
  };
  Ch7IntroScene.prototype.run = function* () {
    var self = this, dlg = this.dlg, K = this.cast, ar = K.arno, i;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    TC.fx.bright = 15;
    var t1 = text(TC.t('ch7.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('ch7.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('bell');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(110);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    yield* co.wait(20);

    // dentro da Matriz: a cidade inteira
    this.shot = 'church';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.music('vigil7');
    yield* co.wait(90);
    yield* say(dlg, 'frida', 'c7.p1');
    yield* say(dlg, 'frida', 'c7.p2');
    yield* say(dlg, 'ewald', 'c7.p3');
    yield* say(dlg, 'frida', 'c7.p4');

    // as sete fitas, uma de cada um
    var givers = [['frida', 'c7.f1', 'bless'], ['arno', 'c7.f2', 'offer'], ['ingrid', 'c7.f3', 'idle'], ['gerhard', 'c7.f4', 'reach'], ['rosa', 'c7.f5', 'talk'], ['lena', 'c7.f6', 'wave'], ['arno', 'c7.f7', 'offer']];
    for (var k = 0; k < givers.length; k++) {
      var g = K[givers[k][0]];
      g.pose = givers[k][2];
      if (g !== ar) yield* this.step(g, g.x0 + (ar.x < g.x ? -8 : 8), 10);
      yield* say(dlg, givers[k][0], givers[k][1]);
      this.flying.push({ k: k, x: g.x, y: GYS - 34, sx: g.x, sy: GYS - 34, t: 0 });
      TC.audio.sfx('ribbon');
      this.cap = 'c7.r' + (k + 1); this.capA = 1;
      yield* co.wait(44);
      g.pose = g.base;
      if (g !== ar) yield* this.step(g, g.x0, 10);
      if (k === 6) { K.ewald.pose = 'step'; yield* say(dlg, 'ewald', 'c7.f7b'); K.ewald.pose = 'idle'; }
    }
    yield* co.wait(20);

    // o laço do Moço, agora bento
    var er = K.erwin;
    er.pose = 'offer';
    yield* this.step(er, er.x0 - 22, 20);
    yield* say(dlg, 'erwin', 'c7.p5');
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'c7.p6', 'shock');
    ar.pose = 'idle';
    K.frida.pose = 'bless';
    TC.audio.sfx('c7sparkle');
    yield* co.tween(this, 'lassoShow', 1, 30);
    yield* say(dlg, 'frida', 'c7.p7');
    yield* co.tween(this, 'lassoShow', 0, 20);
    K.frida.pose = 'cuia';
    er.pose = 'idle';
    yield* this.step(er, er.x0, 20);
    K.helmut.pose = 'aim';
    yield* say(dlg, 'helmut', 'c7.p8');
    K.helmut.pose = 'idle';

    // o sino bate sete vezes, sozinho
    TC.audio.stopMusic(2);
    yield* co.wait(40);
    for (i = 0; i < 3; i++) { this.toll(); yield* co.wait(80); }
    K.kessler.pose = 'stand';
    yield* say(dlg, 'kessler', 'c7.p9');
    for (i = 0; i < 2; i++) { this.toll(); yield* co.wait(70); }
    TC.audio.music('crypt7', 2);
    yield* say(dlg, 'frida', 'c7.p10');
    this.toll();
    yield* co.wait(40);
    K.ewald.pose = 'step';
    yield* say(dlg, 'ewald', 'c7.p11');
    K.ewald.pose = 'idle';
    this.toll();
    yield* co.wait(30);
    yield* say(dlg, 'arno', 'c7.p12');
    // o Arno sai pela porta da frente
    ar.face = -1; ar.pose = 'run';
    while (ar.x > -14) { ar.x -= 1.2; ar.anim++; yield; }
    TC.audio.sfx('door');
    TC.fx.fadeOut(60);
    TC.audio.stopMusic(1.5);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 7 }); }, 10);
    while (true) yield;
  };
  Ch7IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 7 }); }, 30);
    }
    this.dlg.update();
    this.script.update();
    this.parts.update();
    var self = this;
    this.flying = this.flying.filter(function (f) {
      f.t++;
      var tx = 128 - 3 * 22 + f.k * 22, ty = 146;
      var k = Math.min(1, f.t / 36);
      f.x = TC.lerp(f.sx, tx, TC.ease.inOutQuad(k)); f.y = TC.lerp(f.sy, ty, k) - Math.sin(k * Math.PI) * 30;
      if (f.t % 2 === 0) self.parts.add({ x: f.x, y: f.y, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-0.3, 0.3), life: 30, color: self.C7.FITAS[f.k], size: 1, fade: true, layer: 1 });
      if (k >= 1) { self.slots[f.k] = true; TC.audio.sfx('c7sparkle'); return false; }
      return true;
    });
    if (this.capA > 0 && !this.flying.length) this.capA = Math.max(0, this.capA - 0.006);
    if (this.shot === 'church' && this.t % 5 === 0) this.parts.add({ x: TC.rnd.range(180, 256), y: TC.rnd.range(100, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.15, 0.05), life: 120, color: '#ffe0a0', size: 1, fade: true, layer: 1 });
  };
  Ch7IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'church') this.drawChurch(c);
    drawTexts(c, this.texts);
    this.dlg.draw(c);
    if (this.t < 400) {
      c.globalAlpha = TC.clamp((400 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  Ch7IntroScene.prototype.drawChurch = function (c) {
    var C7 = this.C7, t = this.t, pc = this.pf.ctx, self = this;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.nave, 0, 0);
    pc.drawImage(this.floor, 0, 192);
    // a porta de entrada, à esquerda
    pc.fillStyle = TC.col('#0a0606'); TC.fillPoly(pc, [[0, 192], [0, 146], [10, 136], [22, 146], [22, 192]]);
    pc.fillStyle = TC.col('#4a2a18'); pc.fillRect(2, 150, 18, 42);
    pc.fillStyle = TC.col('#2a160c'); pc.fillRect(10, 150, 1, 42);
    // a bandinha no coro, junto do órgão
    var band = C7.bandReal[(t >> 4) % 2];
    pc.drawImage(band, 22 - Math.round(band.ox * 0.42), 92 - Math.round(band.oy * 0.42), Math.round(band.width * 0.42), Math.round(band.height * 0.42));
    // o povo nos bancos
    drawPews(pc, C7, t, 180, function (i) { return self.pray && i % 2 ? 'sitPray' : 'sit'; }, 1, ['#141228', 0.5]);
    // os que trouxeram as fitas
    this.order.forEach(function (o) {
      var set = o.set, pose = o.pose;
      if (o.id === 'arno') { C7.drawFig(pc, A.arno, pose === 'run' ? 'run' : pose, o.x, GYS, o.face, t, o.anim); return; }
      if (!set[pose]) pose = set.idle ? 'idle' : 'stand';
      C7.drawFig(pc, set, self.pray && o.dy && pose === 'idle' ? 'scared' : pose, o.x, GYS + o.dy, o.face, t, o.anim);
    });
    this.parts.draw(pc, 0, 0, 0);
    var fw = this.fogWin;
    lightPass(this, c, TC.mix('#3a3664', '#2a2a40', fw), function (L) {
      var f = 0.9 + Math.sin(t * 0.3) * 0.06 + TC.hash2(t >> 2, 3, 1) * 0.05;
      L.add(230, 118, 52 * f, '#ffb060', 1); L.add(251, 118, 52 * f, '#ffb060', 1);
      L.add(128, 160, 110, '#ffa860', 0.5);
      [40, 110, 180].forEach(function (x) { L.add(x, 182, 64, '#ffb878', 0.45); });
      [49, 97, 177, 225].forEach(function (x) { L.add(x, 90, 34, TC.mix('#6a7ad0', '#8a8aa0', fw), 0.6 * (1 - fw * 0.5)); });
      L.add(22, 80, 40, '#ffb060', 0.5);
    });
    TC.Lighting.glow(c, 230, 119, 6, '#ffe0a0', 0.8);
    TC.Lighting.glow(c, 251, 119, 6, '#ffe0a0', 0.8);
    // feixes de luar pelos vitrais (e a cerração encostando no vidro)
    c.save(); c.globalCompositeOperation = 'lighter';
    [49, 97, 177, 225].forEach(function (x) {
      c.fillStyle = 'rgba(90,100,190,' + (0.06 * (1 - fw)).toFixed(3) + ')';
      TC.fillPoly(c, [[x - 9, 50], [x + 9, 50], [x + 44, 192], [x + 10, 192]]);
    });
    c.restore();
    if (fw > 0) {
      var wins = this.nave.windows;
      c.globalAlpha = fw * 0.75;
      wins.forEach(function (w) {
        c.fillStyle = '#a8a8c0';
        TC.fillPoly(c, [[w.x - w.w / 2, w.bot], [w.x - w.w / 2, w.top + 10], [w.x, w.top - 6], [w.x + w.w / 2, w.top + 10], [w.x + w.w / 2, w.bot]]);
      });
      c.globalAlpha = 1;
    }
    this.parts.draw(c, 0, 0, 1);
    // as sete fitas reunidas
    var sx = 128 - 3 * 22;
    var by = 134, shown = this.slots.length || this.flying.length;
    if (shown) TC.ui.box(c, sx - 14, by, 7 * 22 + 6, 26, 'dark', 0.85);
    for (var k = 0; k < 7 && shown; k++) {
      var x = sx + k * 22;
      c.fillStyle = '#0a0808'; c.fillRect(x - 8, by + 3, 16, 20);
      if (this.slots[k]) c.drawImage(C7.fitaBig[k], x - 7, by + 4);
    }
    this.flying.forEach(function (f) { c.drawImage(C7.fitaBig[f.k], Math.round(f.x - 7), Math.round(f.y - 9)); });
    if (this.cap && this.capA > 0) {
      c.globalAlpha = Math.min(1, this.capA * 2);
      TC.font.draw(c, TC.t(this.cap), 128, 122, C7.FITAS[+this.cap.slice(5) - 1] || '#ffffff', { align: 'center', outline: '#000' });
      c.globalAlpha = 1;
    }
    // o laço bento em destaque
    if (this.lassoShow > 0) {
      c.globalAlpha = this.lassoShow;
      TC.ui.box(c, 88, 70, 80, 52, 'dark', 0.92);
      var big = this.lassoBig || (this.lassoBig = TC.scaleCanvas(C7.lasso, 3));
      c.drawImage(big, 128 - big.width / 2, 74);
      TC.Lighting.glow(c, 128, 90, 22, '#ffe0a0', 0.4 * this.lassoShow);
      TC.font.draw(c, TC.t('c7.lasso'), 128, 108, '#f0d898', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  Ch7IntroScene.prototype.onHide = function () { };
  TC.Ch7IntroScene = Ch7IntroScene;

  /* ==================================================================
     O FIM
     ================================================================== */
  function Ending7Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'church';
    var C7 = this.C7 = A.ch7Init();
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.nave = C7.nave(true);
    this.floor = floorStrip(true);
    var C2 = C7.C2, C3 = C7.C3, CAST = C7.CAST;
    var cast = [
      ['kessler', C2.kessler, 'stand', 16, 1], ['helmut', CAST.helmut, 'idle', 36, 1], ['arnoldo', CAST.arnoldo, 'idle', 56, 1],
      ['arno', A.arno, 'idle', 98, 1], ['ewald', C7.ewaldYoung, 'idle', 122, -1], ['ingrid', C3.ingrid, 'idle', 144, -1],
      ['erwin', C7.erwin, 'play', 164, -1], ['gerhard', CAST.gerhard, 'idle', 188, -1], ['lena', CAST.kids.girl, 'wave', 74, 1],
      ['rosa', CAST.rosa, 'idle', 214, -1], ['frida', CAST.frida, 'cuia', 238, -1],
      ['kidb', CAST.kids.boy, 'wave', 86, 1, 4], ['kids', CAST.kids.small, 'wave', 200, -1, 4]
    ];
    this.cast = {}; this.order = [];
    var self = this;
    cast.forEach(function (c) { var o = { id: c[0], set: c[1], pose: c[2], base: c[2], x: c[3], face: c[4], anim: 0, dy: c[5] || 0 }; self.cast[c[0]] = o; self.order.push(o); });
    this.age = 0;
    this.watchMin = 47;
    this.vig = -1; this.vigA = 0; this.capKey = null; this.cap = 0; this.cap2Key = null; this.cap2 = 0; this.plaqueA = 0; this.gutA = 0;
    this.fimA = 0;
    this.vigs = [C7.vFactory(), C7.vCave(), C7.vLinha(), C7.vFesta()];
    this.script = new TC.Script(this.run());
  }
  Ending7Scene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
  };
  Ending7Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.audio.engineStop(0.3); TC.fx.letterbox = 0; };
  Ending7Scene.prototype.waitKey = function* (n) {
    var w = 0;
    while (w++ < n && !(w > 50 && (TC.input.pressed('confirm') || TC.input.pressed('start') || TC.input.pressed('attack')))) yield;
  };
  Ending7Scene.prototype.run = function* () {
    var self = this, dlg = this.dlg, K = this.cast, ar = K.arno, ew = K.ewald, i, k;
    // 1) a manhã pelos vitrais: a cidade comemora
    TC.audio.music('morning7');
    TC.audio.sfx('c7cheer');
    yield* co.wait(90);
    yield* say(dlg, 'ingrid', 'c7.z1');
    yield* say(dlg, 'arnoldo', 'c7.z2');
    K.helmut.pose = 'aim';
    yield* say(dlg, 'helmut', 'c7.z3');
    K.helmut.pose = 'idle';
    ew.pose = 'watch';
    yield* say(dlg, 'ewald', 'c7.z4');
    // 2) o relógio do Ewald: 23:47... 23:48
    TC.fx.fadeOut(30);
    yield* co.wait(34);
    this.phase = 'watch';
    TC.fx.letterbox = 0;
    TC.fx.fadeIn(30);
    yield* co.wait(120);
    TC.audio.sfx('tick');
    this.watchMin = 48;
    TC.fx.flash('#fff0c0', 0.35, 0.05);
    yield* co.wait(130);
    TC.fx.fadeOut(30);
    yield* co.wait(34);
    this.phase = 'church';
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(30);
    ew.pose = 'idle';
    yield* co.wait(30);
    // os vinte anos chegando de uma vez
    TC.audio.sfx('c7age');
    for (i = 0; i <= 150; i++) {
      this.age = TC.ease.inOutSine(i / 150);
      if (i % 3 === 0) this.parts.add({ x: ew.x + TC.rnd.range(-10, 10), y: GYS - TC.rnd.range(4, 46), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-0.9, -0.2), life: 50, colors: ['#ffffff', '#fff0c0', '#d8c8a0'], size: 1, fade: true, layer: 1 });
      yield;
    }
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'c7.z5', 'shock');
    ew.pose = 'laugh';
    yield* say(dlg, 'ewaldOld', 'c7.z6');
    yield* say(dlg, 'ewaldOld', 'c7.z7');
    ar.pose = 'idle'; ew.pose = 'idle';
    K.frida.pose = 'cuia';
    yield* say(dlg, 'frida', 'c7.z8');
    yield* co.wait(40);
    TC.fx.fadeOut(70);
    TC.audio.stopMusic(2);
    yield* co.wait(80);
    // 3) os epílogos
    this.phase = 'epi';
    TC.fx.letterbox = 0;
    TC.audio.music('dawn', 1);
    for (k = 0; k < 4; k++) {
      this.vig = k; this.vigA = 0; this.vigT = 0;
      this.capKey = 'c7.ep' + (k + 1); this.cap = 0; this.cap2Key = null; this.cap2 = 0; this.plaqueA = 0; this.gutA = 0;
      TC.fx.fadeIn(40);
      yield* co.tween(this, 'vigA', 1, 30);
      var len = TC.t(this.capKey).length;
      while (this.cap < len) { this.cap = Math.min(len, this.cap + ((TC.input.down('confirm') || TC.input.down('attack')) ? 2 : 0.6)); yield; }
      if (k === 0) { TC.audio.sfx('c7sparkle'); yield* co.tween(this, 'plaqueA', 1, 30); }
      if (k === 1) yield* say(dlg, 'rosa', 'c7.ep2r', null, 'top');
      if (k === 2) { TC.audio.sfx('c7thud'); TC.audio.sfx('c7cheer'); yield* co.tween(this, 'gutA', 1, 20); }
      if (k === 3) { this.cap2Key = 'c7.ep4b'; var l2 = TC.t(this.cap2Key).length; while (this.cap2 < l2) { this.cap2 += 0.5; yield; } }
      yield* this.waitKey(200);
      TC.fx.fadeOut(40);
      yield* co.wait(44);
    }
    TC.audio.stopMusic(1.5);
    // 4) a última cena: o caminhão desce a serra, com o pai no banco do carona
    this.phase = 'roadcard';
    this.vig = -1;
    TC.fx.bright = 15;
    this.cardA = 0;
    yield* co.tween(this, 'cardA', 1, 60);
    yield* co.wait(90);
    yield* co.tween(this, 'cardA', 0, 40);
    this.prepareRoad();
    this.phase = 'road';
    TC.fx.bright = 0;
    TC.fx.fadeIn(60);
    TC.audio.engineStart();
    TC.audio.engineSet(0.4, 0.06);
    TC.audio.ambience('windy');
    yield* co.wait(110);
    yield* say(dlg, 'arno', 'c7.y1');
    yield* co.wait(30);
    yield* say(dlg, 'ewaldOld', 'c7.y2');
    yield* co.wait(40);
    this.radio = true;
    TC.audio.static(1.5, 0.06);
    yield* TC.ui.say(dlg, [{ who: 'radio', key: 'c7.y3', speed: 0.55 }], { pos: 'top' });
    this.radio = false;
    yield* co.wait(30);
    yield* say(dlg, 'arno', 'c7.y4');
    yield* say(dlg, 'ewaldOld', 'c7.y5');
    yield* say(dlg, 'arno', 'c7.y6');
    this.whistle = true;
    TC.audio.engineSet(0.38, 0.03);
    TC.audio.music('whistle7', 1);
    yield* this.waitKey(720);
    TC.fx.fadeOut(90);
    TC.audio.engineStop(1.5);
    TC.audio.stopMusic(2.5);
    yield* co.wait(110);
    yield* this.endRun();
  };
  /* FIM e os créditos dos sete capítulos (START durante o final pula direto para cá) */
  Ending7Scene.prototype.endRun = function* () {
    this.whistle = false;
    TC.audio.engineStop(0.2);
    this.phase = 'fim';
    TC.fx.letterbox = 0;
    TC.fx.bright = 15;
    this.fimA = 0;
    yield* co.wait(40);
    TC.audio.sfx('bellToll', 147);
    yield* co.tween(this, 'fimA', 1, 90);
    yield* this.waitKey(260);
    yield* co.tween(this, 'fimA', 0, 50);
    this.phase = 'credits';
    TC.audio.music('credits7');
    this.credY = H + 10;
    var g = '#ffd890', w = '#f0ecdc', s = '#a8b0d8';
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['cred7.2', 1, g], ['', 1], ['', 1],
      ['cred7.c1', 1, w], ['cred7.c2', 1, w], ['cred7.c3', 1, w], ['cred7.c4', 1, w], ['cred7.c5', 1, w], ['cred7.c6', 1, w], ['cred7.c7', 1, '#ffe0a0'], ['', 1], ['', 1],
      ['cred7.leg', 1, s], ['cred7.l1', 1, w], ['cred7.l2', 1, w], ['cred7.l3', 1, w], ['cred7.l4', 1, w], ['cred7.l5', 1, w], ['cred7.l6', 1, w], ['', 1], ['', 1],
      ['cred7.pla', 1, s], ['cred7.p1', 1, w], ['cred7.p2', 1, w], ['cred7.p3', 1, w], ['cred7.p4', 1, w], ['', 1], ['', 1],
      ['cred7.peo', 1, s], ['cred7.g1', 1, w], ['cred7.g2', 1, w], ['cred7.g3', 1, w], ['cred7.g4', 1, w], ['', 1], ['', 1],
      ['cred7.code', 1, s], ['cred7.code2', 1, w], ['', 1], ['', 1],
      ['@score', 1, '#ffe060'], ['', 1], ['', 1],
      ['cred7.ded', 1, '#e8d0b0'], ['', 1], ['', 1], ['', 1],
      ['cred7.thanks', 2, g]
    ];
    this.credH = this.credLines.length * 16 + 20;
    while (this.credY > -this.credH + 110) {
      this.credY -= TC.input.down('confirm') || TC.input.down('jump') ? 1.6 : 0.34;
      yield;
    }
    this.credDone = true;
    yield* this.waitKey(900);
    TC.audio.stopMusic(1.5);
    TC.store.set('save', null);
    TC.game.fadeTo(function () { return new TC.TitleScene(); }, 60);
    while (true) yield;
  };
  Ending7Scene.prototype.prepareRoad = function () {
    var k = this.k = {}, self = this;
    k.overlay = A.cabOverlay();
    k.wheel = A.wheel();
    k.sky = A.sky(W, 90, [[0, '#3a5aa0'], [0.5, '#9a90b8'], [0.8, '#f0a880'], [1, '#ffe0a8']], 61, 0);
    k.far = A.hills(512, 44, { seed: 13, color: '#6a6a9a', rim: '#b0a8d0', base: 0.5, amp: 0.7, period: 6 });
    k.near = A.hills(512, 52, { seed: 19, color: '#3a4a50', rim: '#7a8a80', base: 0.55, amp: 0.6, trees: 70, treeMin: 6, treeMax: 16, period: 6 });
    k.arau = [1, 2, 3, 4, 5, 6].map(function (s) { return A.araucaria(s * 23, 100 + s * 7); });
    k.aut = [1, 2, 3].map(function (s) { return A.autumnTree(s * 7, 64 + s * 6); });
    k.signs = A.roadSigns();
    k.ew = [this.C7.cabEwald(false), this.C7.cabEwald(true)];
    var rng = TC.RNG(1998);
    this.road = new TC.Road({
      w: W, h: 150, horizon: 74, drawDist: 120,
      colors: { road: ['#5a5866', '#545260'], grass: ['#4a6a3a', '#42603a'], rumble: ['#a8a098', '#7a7470'], edge: '#e8e8e0', center: '#e0b030' },
      gen: function (rd) {
        var start = rd.segments.length;
        if (start === 0) rd.addRoad(20, 30, 20, 0, 0);
        else rd.addRoad(rng.int(15, 30), rng.int(10, 30), rng.int(15, 30), rng.pick([0, -2, 2, -3, 3, -4, 4]), -rng.int(6, 22));
        var end = rd.segments.length;
        for (var i = start; i < end; i++) {
          if (i < 6) continue;
          var m = i % 4;
          if (m === 0 && rng() < 0.6) rd.addSprite(i, rng.pick(k.arau), -(2.2 + rng() * 4.5), rng.range(24, 30));
          else if (m === 2 && rng() < 0.6) rd.addSprite(i, rng() < 0.7 ? rng.pick(k.arau) : rng.pick(k.aut), 2.2 + rng() * 4.5, rng.range(24, 30));
          if (i % 24 === 0) rd.addSprite(i, k.signs.km, 1.3, 8);
        }
        if (start === 0) rd.addSprite(60, k.signs.city2, 1.55, 18);
      }
    });
    this.road.headlights = 0;
    this.road.fogColor = '#d8c0b8';
    this.road.playerX = 0.25;
    this.speed = 44;
    this.wheelAng = 0;
    this.ros = { a: 0, v: 0 };
    this.notes = [];
  };
  Ending7Scene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && this.t > 40 && !this.skipped && this.phase !== 'fim' && this.phase !== 'credits' && !TC.game.fading()) {
      this.skipped = true;
      this.dlg.active = false;
      TC.audio.stopMusic(0.5);
      TC.fx.tween('bright', 15, 10);
      this.script = new TC.Script(this.endRun());
    }
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.vig >= 0) this.vigT = (this.vigT || 0) + 1;
    if (this.phase === 'church') {
      if (this.t % 4 === 0) this.parts.add({ x: TC.rnd.range(0, W), y: -4, vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(0.4, 0.9), life: 300, color: TC.rnd.pick(this.C7.FITAS), size: 1, wobble: 0.08, phase: TC.rnd() * 6, layer: 1 });
      if (this.t % 6 === 0) this.parts.add({ x: TC.rnd.range(30, 240), y: TC.rnd.range(60, 180), vy: -0.05, life: 160, color: '#fff0c0', size: 1, fade: true, layer: 1 });
    }
    if (this.phase === 'road' && this.road) {
      var road = this.road, t = this.t;
      road.position += this.speed;
      var curve = road.curveAt();
      road.skyX += curve * this.speed * 0.0016;
      road.playerX += ((0.25 - curve * 0.02) - road.playerX) * 0.03;
      this.wheelAng += ((-curve * 0.11 + Math.sin(t * 0.05) * 0.01) - this.wheelAng) * 0.08;
      var ros = this.ros, lat = curve * this.speed * 0.00035;
      ros.v += -0.012 * Math.sin(ros.a) - 0.02 * ros.v + lat * 0.08;
      ros.a = TC.clamp(ros.a + ros.v, -1.4, 1.4);
      TC.audio.engineSet(0.36 + this.speed / 160);
      if (this.whistle && t % 22 === 0) this.notes.push({ x: 196, y: 102, t: 0, k: (t / 22) % 2 });
      this.notes = this.notes.filter(function (n) { n.t++; n.x -= 0.25; n.y -= 0.45; return n.t < 80; });
    }
  };
  Ending7Scene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.phase === 'church') this.drawChurch(c);
    else if (this.phase === 'watch') this.drawWatch(c);
    else if (this.phase === 'epi') this.drawEpi(c);
    else if (this.phase === 'roadcard') {
      c.globalAlpha = TC.clamp(this.cardA || 0, 0, 1);
      TC.font.draw(c, TC.t('c7.yc'), 128, 104, '#f0e0b0', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    } else if (this.phase === 'road') this.drawRoad(c);
    else if (this.phase === 'fim') this.drawFim(c);
    else this.drawCredits(c);
    this.dlg.draw(c);
  };
  Ending7Scene.prototype.drawChurch = function (c) {
    var C7 = this.C7, t = this.t, pc = this.pf.ctx, self = this;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.nave, 0, 0);
    pc.drawImage(this.floor, 0, 192);
    var band = C7.bandReal[(t >> 3) % 2];
    pc.drawImage(band, 22 - Math.round(band.ox * 0.42), 92 - Math.round(band.oy * 0.42), Math.round(band.width * 0.42), Math.round(band.height * 0.42));
    // o povo pulando de alegria
    for (var i = 0; i < 8; i++) {
      var x = 22 + i * 29, hop = ((t >> 4) + i) % 2;
      C7.drawFig(pc, C7.folk[(i * 3 + 1) % 8], 'cheer', x, 182 - hop * 2, i % 2 ? 1 : -1, t + i * 9, 0, 1, ['#e8c8a0', 0.12], 0.86);
    }
    this.order.forEach(function (o) {
      if (o.id === 'arno') { C7.drawFig(pc, A.arno, o.pose, o.x, GYS, o.face, t, o.anim); return; }
      if (o.id === 'ewald') {
        var yp = o.pose, op = C7.ewaldOld[yp] ? yp : 'idle', ypp = C7.ewaldYoung[yp] ? yp : 'idle';
        if (self.age < 1) C7.drawFig(pc, C7.ewaldYoung, ypp, o.x, GYS, o.face, t, o.anim, 1 - self.age);
        if (self.age > 0) C7.drawFig(pc, C7.ewaldOld, op, o.x, GYS, o.face, t, o.anim, self.age);
        return;
      }
      var pose = o.set[o.pose] ? o.pose : (o.set.idle ? 'idle' : 'stand');
      C7.drawFig(pc, o.set, pose, o.x, GYS + (o.dy || 0), o.face, t + (o.dy ? 14 : 0), o.anim);
    });
    this.parts.draw(pc, 0, 0, 0);
    lightPass(this, c, '#e8d8c0', function (L) {
      [49, 97, 177, 225].forEach(function (x, k) { L.add(x + 24, 170, 70, ['#ffe0a0', '#ffc0b0', '#b0d0ff', '#c8ffc0'][k], 0.6); });
      if (self.age > 0 && self.age < 1) L.add(self.cast.ewald.x, GYS - 22, 40, '#fff8e0', Math.sin(self.age * Math.PI));
    });
    // o sol entrando pelos vitrais
    c.save(); c.globalCompositeOperation = 'lighter';
    [49, 97, 177, 225].forEach(function (x, k) {
      c.fillStyle = 'rgba(' + ['255,220,140', '255,180,150', '170,210,255', '200,255,190'][k] + ',0.12)';
      TC.fillPoly(c, [[x - 9, 50], [x + 9, 50], [x + 46, 192], [x + 10, 192]]);
    });
    c.restore();
    this.parts.draw(c, 0, 0, 1);
  };
  /* close no relógio de bolso do Ewald */
  Ending7Scene.prototype.drawWatch = function (c) {
    var t = this.t, cx = 128, cy = 104, R = 58;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#3a2418', '#100806', Math.abs(y - cy) / H * 1.6); c.fillRect(0, y, W, 1); }
    TC.Lighting.glow(c, cx, cy, 90, '#ffd8a0', 0.25);
    // a corrente e a coroa
    c.fillStyle = '#c8c8d0';
    for (var k = 0; k < 14; k++) TC.fillCircle(c, cx - 4 - k * 5, cy - R - 10 - Math.sin(k * 0.3) * 6 + k * 3, 2);
    c.fillStyle = '#a8a8b4'; c.fillRect(cx - 5, cy - R - 12, 10, 8);
    c.fillStyle = '#d8d8e0'; c.fillRect(cx - 3, cy - R - 16, 6, 5);
    // caixa de prata e mostrador
    c.fillStyle = '#5a5a66'; TC.fillCircle(c, cx, cy, R + 6);
    c.fillStyle = '#c8c8d4'; TC.fillCircle(c, cx, cy, R + 4);
    c.fillStyle = '#e8e8f0'; TC.fillCircle(c, cx - 1, cy - 1, R + 2);
    c.fillStyle = '#f4ecd8'; TC.fillCircle(c, cx, cy, R);
    c.fillStyle = '#e4dac4'; TC.fillCircle(c, cx + 4, cy + 4, R - 10);
    c.fillStyle = '#f4ecd8'; TC.fillCircle(c, cx, cy, R - 12);
    c.fillStyle = '#2a2018';
    for (var h = 0; h < 60; h++) {
      var a = h / 60 * TC.TAU - Math.PI / 2, big = h % 5 === 0;
      var r0 = big ? R - 9 : R - 5;
      for (var q = r0; q < R - 2; q++) c.fillRect(Math.round(cx + Math.cos(a) * q), Math.round(cy + Math.sin(a) * q), big ? 2 : 1, big ? 2 : 1);
    }
    ['XII', 'III', 'VI', 'IX'].forEach(function (s, i) {
      var a = i / 4 * TC.TAU - Math.PI / 2;
      TC.font.draw(c, s, Math.round(cx + Math.cos(a) * (R - 18)), Math.round(cy + Math.sin(a) * (R - 18) - 4), '#2a2018', { align: 'center' });
    });
    TC.font.draw(c, 'TEEWALD', cx, cy + 16, '#8a6a40', { align: 'center' });
    // os ponteiros: 11:47... 11:48
    var mm = this.watchMin, sec = (t * 1.0) % 60;
    var ah = ((11 + mm / 60) / 12) * TC.TAU - Math.PI / 2, am = (mm / 60) * TC.TAU - Math.PI / 2, as = (this.watchMin === 47 ? 0 : sec / 60) * TC.TAU - Math.PI / 2;
    c.fillStyle = '#1a1410'; TC.thickLine(c, cx, cy, cx + Math.cos(ah) * R * 0.5, cy + Math.sin(ah) * R * 0.5, 4);
    c.fillStyle = '#1a1410'; TC.thickLine(c, cx, cy, cx + Math.cos(am) * R * 0.8, cy + Math.sin(am) * R * 0.8, 2.5);
    c.fillStyle = '#a02020'; TC.thickLine(c, cx, cy, cx + Math.cos(as) * R * 0.86, cy + Math.sin(as) * R * 0.86, 1);
    c.fillStyle = '#c8a040'; TC.fillCircle(c, cx, cy, 3);
    // brilho do vidro
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,255,255,0.1)'; TC.fillPoly(c, [[cx - R + 10, cy - 20], [cx - 20, cy - R + 10], [cx - 8, cy - R + 14], [cx - R + 14, cy - 8]]);
    c.restore();
    var str = '23:' + this.watchMin;
    var b = TC.ui.bigText(str, 2, this.watchMin === 48 ? '#fff0b0' : '#d8d0c0', '#c08040', '#140804');
    c.drawImage(b, 128 - Math.floor(b.width / 2), 180);
  };
  Ending7Scene.prototype.drawEpi = function (c) {
    var k = this.vig;
    if (k < 0) return;
    var C7 = this.C7, t = this.vigT || 0, img = this.vigs[k], px = 16, py = 24;
    c.globalAlpha = this.vigA;
    var cv = this.vigCv || (this.vigCv = TC.canvas(224, 112)), p = cv.ctx;
    p.clearRect(0, 0, 224, 112);
    p.drawImage(img, 0, 0);
    var CAST = C7.CAST;
    if (k === 0) {
      C7.drawFig(p, CAST.gerhard, t > 60 ? 'reach' : 'idle', 40, 100, 1, t, t);
      if (this.plaqueA > 0) TC.Lighting.glow(p, img.plaqueX, img.plaqueY, 8, '#ffd070', 0.5 * this.plaqueA);
    } else if (k === 1) {
      // o fogo de nó-de-pinho na boca da caverna
      for (var f = -4; f <= 4; f++) {
        var fh = 4 + Math.round(Math.abs(Math.sin(t * 0.3 + f * 1.7)) * 7);
        p.fillStyle = '#ff9030'; p.fillRect(img.fireX + f * 3, img.fireY - fh, 2, fh);
        p.fillStyle = '#ffe080'; p.fillRect(img.fireX + f * 3, img.fireY - Math.max(1, fh - 3), 1, Math.max(1, fh - 3));
      }
      TC.Lighting.glow(p, img.fireX, img.fireY - 6, 26, '#ff9040', 0.5 + Math.sin(t * 0.2) * 0.05);
      C7.drawFig(p, CAST.rosa, 'idle', img.fireX - 22, 101, 1, t, t);
      C7.drawFig(p, CAST.frida, 'cuia', img.fireX + 24, 101, -1, t, t);
    } else if (k === 2) {
      var kids = CAST.kids;
      C7.drawFig(p, kids.boy, 'wave', 30, 97, 1, t, t, 1, null, 0.8); C7.drawFig(p, kids.girl, 'wave', 46, 97, -1, t + 14, t, 1, null, 0.8); C7.drawFig(p, kids.small, 'walk', 62 + (t * 0.3) % 18, 97, 1, t, t, 1, null, 0.8);
      C7.drawFig(p, CAST.arnoldo, 'idle', 158, 98, -1, t, t, 1, null, 0.8);
      C7.drawFig(p, kids.girl, 'wave', 145, 98, 1, t + 7, t, 1, null, 0.7);
      // a bola de bolão rolando na cancha
      var bx = 182 + (t * 0.8) % 34;
      p.fillStyle = '#3a2a1a'; TC.fillCircle(p, bx, 85, 2);
    } else if (k === 3) {
      // as moças dançando o pau-de-fita em volta da araucária nova
      var list = [];
      for (var d = 0; d < 7; d++) { var a = t * 0.02 + d / 7 * TC.TAU; list.push({ x: img.poleX + Math.cos(a) * 56, y: 100 + Math.sin(a) * 6, z: Math.sin(a), d: d, a: a }); }
      list.sort(function (q, r) { return q.z - r.z; });
      list.forEach(function (q) {
        p.fillStyle = C7.FITAS[q.d];
        var nn = Math.max(10, Math.round(Math.max(Math.abs(q.x - img.poleX), Math.abs(q.y - 34 - img.poleY))));
        for (var s = 0; s <= nn; s++) { var u = s / nn; p.fillRect(Math.round(img.poleX + (q.x - img.poleX) * u), Math.round(img.poleY + (q.y - 34 - img.poleY) * u + Math.sin(u * Math.PI) * 4), 1, 1); }
        C7.drawFig(p, C7.folk[[1, 3, 7, 5, 1, 3, 7][q.d]], 'dance', q.x, q.y, Math.cos(q.a) > 0 ? -1 : 1, t, t + q.d * 4, 1, q.z < 0 ? ['#2a3a2a', 0.2] : null, q.z < 0 ? 0.8 : 0.9);
      });
      C7.drawFig(p, C7.C2.kessler, 'stand', 196, 102, -1, t, t);
    }
    c.drawImage(cv, px, py);
    // moldura dourada, como nos quadros da lenda
    c.fillStyle = '#c8a870'; c.fillRect(px - 3, py - 3, 230, 2); c.fillRect(px - 3, py + 113, 230, 2); c.fillRect(px - 3, py - 3, 2, 118); c.fillRect(px + 225, py - 3, 2, 118);
    c.fillStyle = '#6a4a28'; c.fillRect(px - 1, py - 1, 226, 1); c.fillRect(px - 1, py + 112, 226, 1);
    [[px - 4, py - 4], [px + 224, py - 4], [px - 4, py + 112], [px + 224, py + 112]].forEach(function (q) { c.fillStyle = '#e8d090'; c.fillRect(q[0], q[1], 4, 4); });
    c.globalAlpha = 1;
    // a legenda
    if (this.capKey) {
      var lines = TC.font.wrap(TC.t(this.capKey), 228), n = Math.floor(this.cap), y = 146;
      lines.forEach(function (ln) { var m = Math.max(0, Math.min(ln.length, n)); if (m > 0) TC.font.draw(c, ln, 128, y, '#f0e8d0', { align: 'center', shadow: '#000', max: m }); n -= ln.length + 1; y += 11; });
      if (this.cap2Key) TC.font.draw(c, TC.t(this.cap2Key), 128, y + 6, '#ffe0a0', { align: 'center', shadow: '#000', max: Math.floor(this.cap2) });
    }
    if (k === 0 && this.plaqueA > 0) {
      c.globalAlpha = this.plaqueA;
      var p1 = 'ÀS PESPONTADEIRAS DE 1967.', p2 = 'HILDE WEBER E SUAS COLEGAS.';
      var bw = Math.max(TC.font.measure(p1), TC.font.measure(p2)) + 16;
      c.fillStyle = '#3a2408'; c.fillRect(128 - bw / 2 - 2, 186, bw + 4, 30);
      c.fillStyle = '#b8862c'; c.fillRect(128 - bw / 2, 188, bw, 26);
      c.fillStyle = '#e0b850'; c.fillRect(128 - bw / 2, 188, bw, 1);
      TC.font.draw(c, p1, 128, 191, '#3a2408', { align: 'center' });
      TC.font.draw(c, p2, 128, 202, '#3a2408', { align: 'center' });
      c.globalAlpha = 1;
    }
    if (k === 2 && this.gutA > 0) {
      var gb = TC.ui.bigText(TC.t('c7.ep3b'), 3, '#fff0b0', '#e08030', '#140804');
      var sc = 0.4 + TC.ease.outBack(this.gutA) * 0.6;
      c.save(); c.translate(128, 196); c.scale(sc, sc); c.drawImage(gb, -Math.floor(gb.width / 2), -Math.floor(gb.height / 2)); c.restore();
    }
  };
  Ending7Scene.prototype.drawRoad = function (c) {
    var k = this.k, road = this.road, t = this.t, self = this;
    if (!road) return;
    var cv = road.render(function (rc, skyX, playerY) {
      if (self.startY == null) self.startY = playerY;
      var dy = TC.clamp((playerY - self.startY) * 0.004, -20, 30);
      rc.drawImage(k.sky, 0, Math.round(-8 + dy * 0.3));
      // o sol nascendo atrás da serra
      var sx = Math.round(170 - skyX * 1.2);
      sx = ((sx % 360) + 360) % 360 - 50;
      TC.Lighting.glow(rc, sx, 46, 40, '#ffd080', 0.5);
      rc.fillStyle = '#fff4d0'; TC.fillCircle(rc, sx, Math.round(48 + dy * 0.3), 9);
      var fo = Math.round(skyX * 3) % 512; if (fo < 0) fo += 512;
      var fy = Math.round(38 + dy * 0.4);
      rc.drawImage(k.far, -fo, fy); rc.drawImage(k.far, 512 - fo, fy);
      var no = Math.round(skyX * 5) % 512; if (no < 0) no += 512;
      var ny = Math.round(32 + dy * 0.6);
      rc.drawImage(k.near, -no, ny); rc.drawImage(k.near, 512 - no, ny);
      rc.fillStyle = TC.col('#3a4a50');
      rc.fillRect(0, ny + 52, W, 150);
    });
    c.drawImage(cv, 0, 0);
    // o pai no banco do carona, de cabelo branco
    var ew = k.ew[this.whistle && (t >> 4) % 2 ? 1 : 0];
    c.drawImage(ew, 162, 30 + Math.round(Math.sin(t * 0.09) * 0.6));
    c.drawImage(k.overlay, 0, 0);
    A.drawRosary(c, 127, 28, this.ros.a);
    // a fitinha azul de volta no retrovisor
    c.fillStyle = TC.col('#3a78e0');
    for (var q = 0; q < 12; q++) c.fillRect(Math.round(131 + Math.sin(this.ros.a * 0.8) * q * 0.9 + Math.sin(t * 0.1 + q * 0.5) * 0.6), 28 + q, 2, 1);
    A.drawNeedle(c, 108, 167, this.speed / 110);
    A.drawNeedle(c, 148, 167, 0.3 + this.speed / 160);
    TC.font.draw(c, '104.5', 204, 162, this.radio && t % 4 < 2 ? '#a0ffc0' : '#40d070', { align: 'center' });
    A.drawArms(c, 128, 236, this.wheelAng);
    TC.drawRot(c, k.wheel, 128, 236, this.wheelAng, 128);
    // as notas do assobio
    this.notes.forEach(function (n) {
      c.globalAlpha = Math.max(0, 1 - n.t / 80);
      c.fillStyle = '#fff0c0';
      var x = Math.round(n.x), y = Math.round(n.y + Math.sin(n.t * 0.2) * 2);
      c.fillRect(x, y, 2, 2); c.fillRect(x + 1, y - 5, 1, 5); if (n.k) c.fillRect(x + 2, y - 5, 2, 1);
      c.globalAlpha = 1;
    });
  };
  Ending7Scene.prototype.drawFim = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.fimA, 0, 1);
    var big = TC.ui.bigText(TC.t('c7.fim'), 5, '#fff8e0', '#e0a060', '#140804');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 112 - Math.floor(big.height / 2));
    var C7 = this.C7;
    C7.fitaIcon.forEach(function (ic, i) { c.drawImage(ic, 128 - 35 + i * 10, 150); });
    c.globalAlpha = 1;
  };
  Ending7Scene.prototype.drawCredits = function (c) {
    var t = this.t;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#3a5a9a', '#ffd8a0', y / H); c.fillRect(0, y, W, 1); }
    c.fillStyle = '#fff4d0'; TC.fillCircle(c, 200, 70, 12);
    TC.Lighting.glow(c, 200, 70, 50, '#ffd080', 0.3);
    var hills = this.credHills || (this.credHills = A.hills(512, 90, { seed: 63, color: '#3a4a6a', rim: '#7a8ab0', base: 0.38, amp: 0.5, trees: 50, treeMin: 8, treeMax: 18, period: 3, arauc: 0.9 }));
    var o = Math.round(t * 0.1) % 512;
    c.drawImage(hills, -o, 134); c.drawImage(hills, 512 - o, 134);
    // o caminhão descendo a serra, lá longe
    var truck = this.credTruck || (this.credTruck = A.truckSmall());
    var tx = ((t * 0.18) % 330) - 40;
    c.drawImage(truck, Math.round(tx), 196 + Math.round(tx * 0.03));
    c.fillStyle = 'rgba(0,0,10,0.35)';
    c.fillRect(0, 0, W, H);
    var yy0 = this.credY, self = this;
    (this.credLines || []).forEach(function (l, k) {
      var yy = Math.round(yy0 + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) {
        var b = TC.ui.bigText(str, l[1], l[2], '#c08060', '#000000');
        c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4);
      } else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
    if (this.credDone && (t >> 5) % 2 === 0) TC.font.draw(c, TC.t('boot.press'), 128, 210, '#ffffff', { align: 'center', shadow: '#000' });
  };
  Ending7Scene.prototype.onHide = function () { };
  TC.Ending7Scene = Ending7Scene;
})();

TC.READY[7] = true;
