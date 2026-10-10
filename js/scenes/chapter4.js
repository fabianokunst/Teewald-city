'use strict';
/* Teewald City — Capítulo 4: "O Último Turno"
   Prólogo: na curva da serra, o caminhão do Arno desce sozinho para a baixada; o apito da fábrica toca e as mulheres
   de Teewald passam de camisola, dormindo, rumo à Calçados Morgenstern.
   Final: as costureiras acordam; na doca, o caminhão "come" a luz da estrela de neon e sobe o Morro dos Bugres. */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GY = 192;

  function say(dlg, who, key, face, pos) { return TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }
  function drawFig(c, frames, pose, x, y, face, t, anim, alpha) {
    var arr = frames[pose] || frames.idle;
    var fr = pose === 'run' || pose === 'walk' ? arr[Math.floor(anim / 5) % arr.length] : pose === 'idle' ? arr[Math.floor(t / 32) % arr.length] : arr[0];
    var img = face < 0 ? TC.flip(fr) : fr;
    var ox = fr.ox != null ? (face < 0 ? fr.width - fr.ox : fr.ox) : fr.width / 2;
    var oy = fr.oy != null ? fr.oy : fr.height;
    c.globalAlpha = alpha == null ? 1 : alpha;
    c.drawImage(img, Math.round(x - ox), Math.round(y - oy + 1));
    c.globalAlpha = 1;
  }
  function lit(scene, c, ambient, addLights) {
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
  function roadY(x) { return 172 + x * 0.07; }

  /* a vista da serra à noite: o vale com as luzes de Teewald e, lá embaixo, a estrela da Morgenstern */
  function valleyView(seed) {
    var cv = TC.canvas(W, H), c = cv.ctx;
    c.drawImage(A.sky(W, H, [[0, '#020309'], [0.5, '#0a0c28'], [1, '#262a5a']], seed, 0.007), 0, 0);
    c.drawImage(A.hills(W, 80, { seed: seed + 1, color: '#161a3c', rim: '#2e3466', base: 0.5, amp: 0.6, trees: 30, treeMin: 5, treeMax: 10, period: 3 }), 0, 70);
    // o vale
    for (var y = 112; y < 160; y++) { c.fillStyle = TC.mix('#0e1028', '#080a1a', (y - 112) / 48); c.fillRect(0, y, W, 1); }
    var r = TC.RNG(seed + 2);
    for (var k = 0; k < 40; k++) { c.fillStyle = TC.col(r() < 0.7 ? '#ffb060' : '#ffd890'); c.fillRect(r.int(10, 200), r.int(118, 150), 1, 1); }
    // a fábrica lá na baixada
    c.drawImage(A.ch4Init().factoryFar(120, '#0a0c1e', '#2a3458'), 140, 96);
    // a encosta e a estrada
    c.fillStyle = TC.col('#07070f');
    TC.fillPoly(c, [[0, 160], [W, 168], [W, H], [0, H]]);
    c.fillStyle = TC.col('#24222c');
    TC.fillPoly(c, [[0, roadY(0) - 6], [W, roadY(W) - 6], [W, roadY(W) + 14], [0, roadY(0) + 14]]);
    c.fillStyle = TC.col('#8a7030');
    for (k = 0; k < W; k += 14) c.fillRect(k, Math.round(roadY(k) + 4), 7, 1);
    for (k = 0; k < 6; k++) {
      var tr = A.araucaria(960 + k, r.int(70, 120), { sil: '#05060c', rim: '#1a1e3a' });
      var tx = [8, 40, 214, 244, 120, 176][k];
      c.drawImage(tr, tx - tr.baseX, roadY(tx) - 8 - tr.height);
    }
    return cv;
  }

  /* ==================================================================
     PRÓLOGO: a curva da serra
     ================================================================== */
  function Ch4IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    var C4 = A.ch4Init(), C3 = A.ch3Init();
    this.C4 = C4; this.C3 = C3; this.cast = A.castInit();
    this.view = valleyView(41);
    this.fogBand = A.fog(512, 52, 47, '#8a8ab8');
    this.truck = { x: 112, lights: 1, gone: false };
    this.arno = { x: -20, face: 1, pose: 'walk', anim: 0 };
    this.ewald = { x: -44, face: 1, pose: 'walk', anim: 0 };
    this.sleepers = [];
    this.star = 1;
    this.script = new TC.Script(this.run());
  }
  Ch4IntroScene.prototype.enter = function () { TC.fx.bright = 0; TC.audio.ambience('windy'); };
  Ch4IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.audio.engineStop(0.3); TC.fx.letterbox = 0; };
  Ch4IntroScene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, ew = this.ewald, tk = this.truck;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    TC.fx.bright = 15;
    var t1 = text(TC.t('c4.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('c4.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('door');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(100);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    this.shot = 'road';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.engineStart(); TC.audio.engineSet(0.15, 0.05);
    // o Arno e o pai chegam a pé
    while (ar.x < 74) { ar.x += 0.7; ew.x += 0.7; ar.anim++; ew.anim++; yield; }
    ar.pose = 'idle'; ew.pose = 'idle';
    yield* co.wait(30);
    yield* say(dlg, 'arno', 'c4.p1');
    yield* say(dlg, 'ewald', 'c4.p2');
    // ele vai até o caminhão... e o caminhão desce sozinho
    ar.pose = 'walk';
    for (var i = 0; i < 24; i++) { ar.x += 0.6; ar.anim++; yield; }
    ar.pose = 'idle';
    TC.audio.engineSet(0.7, 0.12);
    TC.audio.sfx('horn');
    yield* co.wait(20);
    var v = 0;
    for (i = 0; i < 200; i++) { v = Math.min(2.2, v + 0.03); tk.x += v; if (i === 60) { ar.pose = 'run'; } if (ar.pose === 'run' && ar.x < 150) { ar.x += 1.3; ar.anim++; } yield; }
    tk.gone = true;
    TC.audio.engineStop(1.5);
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'c4.p3', 'shock');
    ar.pose = 'idle';
    yield* say(dlg, 'arno', 'c4.p4');
    yield* co.wait(30);
    // o apito da fábrica, lá de baixo
    TC.audio.sfx('siren');
    yield* co.wait(150);
    ew.face = 1;
    yield* say(dlg, 'ewald', 'c4.p5');
    TC.audio.music('dread', 2);
    // as mulheres passam pela estrada, de camisola e olhos fechados
    for (var k = 0; k < 5; k++) this.sleepers.push({ x: -24 - k * 34, k: k, anim: k * 7, a: 0 });
    yield* co.wait(150);
    ar.pose = 'shock'; ar.face = -1;
    yield* say(dlg, 'arno', 'c4.p6', 'shock');
    ar.pose = 'idle';
    yield* co.wait(40);
    yield* say(dlg, 'arno', 'c4.p7');
    yield* co.wait(60);
    ar.face = -1;
    yield* say(dlg, 'ewald', 'c4.p8');
    yield* say(dlg, 'arno', 'c4.p9');
    yield* say(dlg, 'ewald', 'c4.p10');
    yield* co.wait(30);
    ar.face = 1;
    yield* say(dlg, 'arno', 'c4.p11');
    // corre atrás delas, estrada abaixo
    ar.pose = 'run';
    for (i = 0; i < 110; i++) { ar.x += 1.6; ar.anim++; yield; }
    TC.fx.fadeOut(60);
    TC.audio.stopMusic(1.5);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 4 }); }, 10);
    while (true) yield;
  };
  Ch4IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5); TC.audio.engineStop(0.3);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 4 }); }, 30);
    }
    this.dlg.update();
    this.script.update();
    this.parts.update();
    this.sleepers.forEach(function (s) { s.x += 0.36; s.anim++; s.a = TC.clamp(Math.min((s.x + 20) / 40, (W + 10 - s.x) / 40), 0, 0.9); });
    this.star = TC.hash2(this.t >> 3, 3, 7) > 0.88 ? 0.2 : 1;
  };
  Ch4IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'road') this.drawRoad(c);
    for (var i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
    this.dlg.draw(c);
    if (this.t < 400) {
      c.globalAlpha = TC.clamp((400 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  Ch4IntroScene.prototype.drawRoad = function (c) {
    var t = this.t, self = this, pc = this.pf.ctx, C4 = this.C4, tk = this.truck;
    c.drawImage(this.view, 0, 0);
    // a estrela de neon lá embaixo
    var sx = 168, sy = 140;
    c.fillStyle = TC.rgba('#ff70d0', 0.4 + this.star * 0.6);
    c.fillRect(sx - 1, sy, 3, 1); c.fillRect(sx, sy - 1, 1, 3);
    TC.Lighting.glow(c, sx, sy, 5, '#ff60c0', 0.6 * this.star);
    pc.clearRect(0, 0, W, H);
    if (!tk.gone) {
      var timg = C4.truckImg, ty = roadY(tk.x + 60) - timg.height + 6;
      pc.drawImage(timg, Math.round(tk.x), Math.round(ty));
    }
    this.sleepers.forEach(function (s) { A.drawCast(pc, self.cast.sleepers[s.k % 4], 'walk', s.x, roadY(s.x), 1, t, s.anim, s.a); });
    drawFig(pc, this.C3.ewald, this.ewald.pose, this.ewald.x, roadY(this.ewald.x), this.ewald.face, t, this.ewald.anim);
    drawFig(pc, A.arno, this.arno.pose, this.arno.x, roadY(this.arno.x), this.arno.face, t, this.arno.anim);
    this.parts.draw(pc, 0, 0, 0);
    lit(this, c, '#3a3a6a', function (L) {
      L.add(self.arno.x, roadY(self.arno.x) - 16, 40, '#7a7aa8', 0.5);
      if (!tk.gone) { L.add(tk.x + C4.truckImg.lampX + 30, roadY(tk.x + 140) - 20, 70, '#fff0b0', 1); L.add(tk.x + 2, roadY(tk.x) - 14, 16, '#ff4020', 0.8); }
    });
    if (!tk.gone) {
      var lx = tk.x + C4.truckImg.lampX, ly = roadY(tk.x + 60) - C4.truckImg.height + 6 + C4.truckImg.lampY;
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,220,140,0.16)';
      TC.fillPoly(c, [[lx, ly - 1], [lx + 130, ly + 6], [lx + 130, ly + 40]]);
      c.restore();
      TC.Lighting.glow(c, lx, ly, 7, '#ffe0a0', 0.9);
      TC.Lighting.glow(c, tk.x + 2, ly + 4, 4, '#ff3020', 0.8);
    }
    c.globalAlpha = 0.6;
    var o = Math.round(t * 0.3) % 512;
    c.drawImage(this.fogBand, -o, 150); c.drawImage(this.fogBand, 512 - o, 150);
    c.drawImage(this.fogBand, -((o * 2) % 512), 176); c.drawImage(this.fogBand, 512 - ((o * 2) % 512), 176);
    c.globalAlpha = 1;
  };
  Ch4IntroScene.prototype.onHide = function () { };
  TC.Ch4IntroScene = Ch4IntroScene;

  /* ==================================================================
     FINAL: as costureiras acordam e o caminhão come a luz
     ================================================================== */
  function Ending4Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'hall';
    var C4 = A.ch4Init(), C3 = A.ch3Init();
    this.C4 = C4; this.C3 = C3; this.cast = A.castInit();
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.arno = { x: 60, face: 1, pose: 'idle', anim: 0 };
    this.ewald = { x: -30, face: 1, pose: 'walk', anim: 0, a: 1 };
    this.frida = { x: -50, face: 1, pose: 'walk', anim: 0 };
    this.wake = 0;
    this.textA = 0;
    // o pesponto
    var hall = TC.canvas(W, H), c = hall.ctx;
    c.drawImage(C4.wallStitch(W, 3), 0, 0);
    for (var x = 0; x < W; x += 16) { c.drawImage(C4.T.woodTop[(x >> 4) % 2], x, GY); c.drawImage(C4.T.wood, x, GY + 16); }
    this.hall = hall;
    this.machine = C4.machine();
    // o pátio da fábrica à noite, com a doca e o letreiro
    var yard = TC.canvas(W, H), y2 = yard.ctx;
    y2.drawImage(A.sky(W, H, [[0, '#020309'], [0.5, '#0a0c28'], [1, '#22244e']], 44, 0.007), 0, 0);
    y2.drawImage(C4.facade(W, 2), 0, GY + 2 - 160);
    y2.drawImage(C4.dock(), 96, GY + 2 - 60);
    this.gate = C4.gate();
    for (x = 0; x < W; x += 16) { y2.drawImage(C4.T.yardTop[(x >> 4) % 2], x, GY); y2.drawImage(C4.T.yard[(x >> 4) % 2], x, GY + 16); }
    this.yard = yard;
    this.truck = { x: 110, y: GY - 44 - 4, lights: 1, gone: false, vx: 0, vy: 0 };
    this.starOn = 1; this.starDead = false;
    this.walkers = [];
    this.fogBand = A.fog(512, 52, 47, '#8a8ab8');
    this.script = new TC.Script(this.run());
  }
  Ending4Scene.prototype.enter = function () { TC.fx.bright = 0; TC.fx.letterbox = 22; TC.fx.fadeIn(60); };
  Ending4Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.audio.engineStop(0.3); TC.fx.letterbox = 0; };
  Ending4Scene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, ew = this.ewald, fr = this.frida, tk = this.truck, i;
    TC.audio.music('dawn', 2);
    yield* co.wait(40);
    // as costureiras acordam
    yield* co.tween(this, 'wake', 1, 90);
    yield* say(dlg, 'ingrid', 'c4.f1');
    yield* say(dlg, 'arno', 'c4.f2');
    TC.fx.fadeOut(60);
    yield* co.wait(70);

    // no pátio: as mulheres saem pelo portão; o caminhão na doca
    this.phase = 'yard';
    ar.x = 40; ar.face = 1; ar.pose = 'idle';
    TC.audio.stopMusic(1.5);
    TC.audio.ambience('night');
    for (var k = 0; k < 6; k++) this.walkers.push({ x: 150 + k * 20, k: k, anim: k * 9, a: 1, face: -1 });
    TC.fx.fadeIn(60);
    TC.audio.engineStart(); TC.audio.engineSet(0.15, 0.05);
    yield* co.wait(120);
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'c4.f3', 'shock');
    ar.pose = 'run';
    for (i = 0; i < 30; i++) { ar.x += 1.2; ar.anim++; yield; }
    ar.pose = 'idle';
    // os faróis puxam a luz da estrela de neon
    TC.audio.engineSet(0.5, 0.1);
    for (i = 0; i < 180; i++) {
      this.pull = i / 180;
      if (i % 2 === 0) {
        var s = this.starPos();
        this.parts.add({ x: s.x + TC.rnd.range(-6, 6), y: s.y + TC.rnd.range(-6, 6), life: 60, colors: ['#ffffff', '#ffa0e0', '#ff60c0'], size: 1, layer: 1, add: true,
          update: (function (tx, ty) { return function (p) { p.x += (tx - p.x) * 0.06; p.y += (ty - p.y) * 0.06; }; })(tk.x + self.C4.truckImg.lampX, tk.y + self.C4.truckImg.lampY) });
      }
      if (i % 20 === 0) TC.audio.sfx('neon');
      this.starOn = 1 - this.pull;
      yield;
    }
    this.starDead = true; this.starOn = 0;
    TC.audio.sfx('flameDie');
    tk.lights = 1.6;
    yield* co.wait(40);
    yield* say(dlg, 'arno', 'c4.f4');
    // o caminhão dá ré, vira e sobe a estrada do morro
    TC.audio.engineSet(0.9, 0.14);
    TC.audio.sfx('horn');
    for (i = 0; i < 220; i++) { tk.vx = Math.min(2.6, tk.vx + 0.03); tk.x += tk.vx; tk.y -= tk.vx * 0.12; yield; }
    tk.gone = true;
    TC.audio.engineStop(2);
    yield* co.wait(40);
    // o pai e a Dona Frida chegam
    while (ew.x < 20) { ew.x += 0.8; fr.x += 0.8; ew.anim++; fr.anim++; yield; }
    ew.pose = 'idle'; fr.pose = 'cuia';
    ar.face = -1;
    yield* say(dlg, 'ewald', 'c4.f5');
    yield* say(dlg, 'arno', 'c4.f6');
    yield* say(dlg, 'ewald', 'c4.f7');
    yield* say(dlg, 'frida', 'c4.f8');
    yield* co.wait(40);
    TC.fx.fadeOut(80);
    yield* co.wait(90);

    // fim do capítulo
    TC.fx.letterbox = 0;
    this.phase = 'tbc';
    TC.fx.bright = 15;
    yield* co.tween(this, 'textA', 1, 90);
    var w = 0;
    while (w++ < 300 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);

    // créditos
    this.phase = 'credits';
    TC.audio.music('drive');
    this.credY = H + 10;
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred4.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred4.3', 1, '#a0a8d0'], ['cred4.4', 1, '#ffffff'], ['cred4.5', 1, '#ffffff'], ['cred4.6', 1, '#ffffff'], ['', 1], ['', 1],
      ['cred.3', 1, '#a0a8d0'], ['cred.4', 1, '#ffffff'], ['', 1], ['', 1],
      ['@score', 1, '#ffe060'], ['', 1], ['', 1], ['cred.8', 2, '#ffd890']
    ];
    this.credH = this.credLines.length * 16 + 20;
    while (this.credY > -this.credH + 70) {
      this.credY -= TC.input.down('confirm') || TC.input.down('jump') ? 1.6 : 0.36;
      yield;
    }
    yield* co.wait(60);
    TC.audio.stopMusic(1.5);
    TC.fx.fadeOut(60);
    yield* co.wait(70);

    // na Linha Becker, o rádio da madrugada
    this.phase = 'radio';
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.ambience('windy');
    yield* co.wait(90);
    TC.audio.static(5, 0.08);
    yield* TC.ui.say(dlg, [{ who: 'radio', key: 'c4.r1', speed: 0.5 }], { pos: 'top' });
    yield* co.wait(40);
    this.tbcRoad = 0;
    for (i = 0; i < 60; i++) { this.tbcRoad = i / 60; yield; }
    w = 0;
    while (w++ < 300 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    TC.game.fadeTo(function () { return TC.chapterReady(5) ? TC.chapterStart(5) : new TC.TitleScene(); }, 60);
    while (true) yield;
  };
  Ending4Scene.prototype.starPos = function () { return { x: 128 - this.gate.width / 2 + this.gate.starX, y: GY + 2 - this.gate.height + this.gate.starY }; };
  Ending4Scene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    var self = this;
    this.walkers.forEach(function (w) { w.x -= 0.4; w.anim++; if (w.x < 120) w.a = Math.max(0, w.a - 0.02); });
    if (!this.starDead && TC.hash2(this.t >> 3, 9, 2) > 0.9) this.starFlick = 0.3; else this.starFlick = 1;
    if (this.phase === 'hall' && this.t % 7 === 0) this.parts.add({ x: TC.rnd.range(0, W), y: TC.rnd.range(30, 170), vy: -0.1, life: 160, color: '#d8d0c0', size: 1, fade: true, wobble: 0.03 });
  };
  Ending4Scene.prototype.draw = function (c) {
    if (this.phase === 'hall') this.drawHall(c);
    else if (this.phase === 'yard') this.drawYard(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else if (this.phase === 'credits') this.drawCredits(c);
    else this.drawRadio(c);
    this.dlg.draw(c);
  };
  Ending4Scene.prototype.drawHall = function (c) {
    var t = this.t, pc = this.pf.ctx, self = this;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.hall, 0, 0);
    // as costureiras acordando nas máquinas
    [[34, 0, 1], [96, 1, -1], [176, 2, 1], [226, 3, -1]].forEach(function (s) {
      var set = self.cast.sleepers[s[1]];
      A.drawCast(pc, set, self.wake > 0.5 ? 'awake' : 'sew', s[0] - s[2] * 12, GY, s[2], t, 0, 0.9 + self.wake * 0.1, self.wake < 0.5 ? ['#b8c8ff', 0.4] : null);
      pc.drawImage(s[2] > 0 ? self.machine : TC.flip(self.machine), s[0] - 20, GY - 40);
    });
    drawFig(pc, A.arno, this.arno.pose, 130, GY, -1, t, 0);
    this.parts.draw(pc, 0, 0, 0);
    lit(this, c, TC.mix('#2a2a50', '#4a4040', this.wake), function (L) {
      [36, 120, 204].forEach(function (x) { L.add(x, 40, 60, '#e0e8d0', 0.6 + self.wake * 0.2); });
      L.add(130, GY - 16, 40, '#c8a070', 0.6);
    });
  };
  Ending4Scene.prototype.drawYard = function (c) {
    var t = this.t, pc = this.pf.ctx, self = this, C4 = this.C4, tk = this.truck;
    c.drawImage(this.yard, 0, 0);
    pc.clearRect(0, 0, W, H);
    var gx = Math.round(128 - this.gate.width / 2);
    pc.drawImage(this.gate, gx, GY + 2 - this.gate.height);
    var sp = this.starPos(), son = this.starOn * this.starFlick;
    pc.globalAlpha = 0.2 + son * 0.8;
    pc.drawImage(C4.star, sp.x - C4.star.width / 2, sp.y - C4.star.height / 2);
    pc.globalAlpha = 1;
    if (!tk.gone) pc.drawImage(C4.truckImg, Math.round(tk.x), Math.round(tk.y));
    this.walkers.forEach(function (w) { if (w.a > 0) A.drawCast(pc, self.cast.sleepers[w.k % 4], 'walk', w.x, GY, w.face, t, w.anim, w.a); });
    drawFig(pc, this.C3.ewald, this.ewald.pose, this.ewald.x, GY, this.ewald.face, t, this.ewald.anim);
    if (this.frida.x > -20) A.drawCast(pc, this.cast.frida, this.frida.pose, this.frida.x, GY, 1, t, this.frida.anim);
    drawFig(pc, A.arno, this.arno.pose, this.arno.x, GY, this.arno.face, t, this.arno.anim);
    this.parts.draw(pc, 0, 0, 0);
    lit(this, c, '#3a3a66', function (L) {
      if (son > 0.1) L.add(sp.x, sp.y, 70, '#ff60c0', son);
      if (!tk.gone) L.add(tk.x + C4.truckImg.lampX + 30, tk.y + C4.truckImg.lampY + 10, 70 * tk.lights, '#fff0b0', Math.min(1.4, tk.lights));
      L.add(self.arno.x, GY - 16, 40, '#7a7aa8', 0.5);
      if (self.ewald.x > -20) { L.add(self.ewald.x, GY - 16, 40, '#9a8aa8', 0.6); L.add(self.frida.x, GY - 30, 30, '#ffb060', 0.7); }
    });
    if (son > 0.1) TC.Lighting.glow(c, sp.x, sp.y, 12, '#ff60c0', 0.5 * son);
    if (!tk.gone) {
      var lx = tk.x + C4.truckImg.lampX, ly = tk.y + C4.truckImg.lampY;
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,220,140,' + (0.12 * tk.lights).toFixed(3) + ')';
      TC.fillPoly(c, [[lx, ly - 1], [lx + 120, ly - 10], [lx + 120, ly + 30]]);
      c.restore();
      TC.Lighting.glow(c, lx, ly, 6 * tk.lights, '#ffe0a0', 0.9);
    }
    this.parts.draw(c, 0, 0, 1);
    c.globalAlpha = 0.4;
    var o = Math.round(t * 0.3) % 512;
    c.drawImage(this.fogBand, -o, 170); c.drawImage(this.fogBand, 512 - o, 170);
    c.globalAlpha = 1;
  };
  Ending4Scene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end4.chapter'), 2, '#ffffff', '#ff90c0', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 96);
    c.globalAlpha = 1;
  };
  Ending4Scene.prototype.drawCredits = function (c) {
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#060816', '#2a1a3a', y / H); c.fillRect(0, y, W, 1); }
    var yy0 = this.credY, self = this;
    this.credLines.forEach(function (l, k) {
      var yy = Math.round(yy0 + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) {
        var b = TC.ui.bigText(str, l[1], l[2], '#c06090', '#000000');
        c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4);
      } else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
  };
  /* o potreiro da Linha Becker de madrugada: cerca de arame farpado e uma vaca parada no escuro */
  Ending4Scene.prototype.drawRadio = function (c) {
    var t = this.t;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#04050c', '#1a1a30', y / H); c.fillRect(0, y, W, 1); }
    var bgc = this.pasture || (this.pasture = (function () {
      var cv = TC.canvas(W, H), x = cv.ctx;
      x.drawImage(A.hills(W, 80, { seed: 91, color: '#0c0e20', rim: '#20264a', base: 0.5, amp: 0.4, trees: 20, treeMin: 6, treeMax: 12, period: 3, arauc: 0.9 }), 0, 100);
      x.fillStyle = TC.col('#06060c'); x.fillRect(0, 168, W, 56);
      // cerca de arame farpado
      for (var k = 0; k < W; k += 40) { x.fillStyle = TC.col('#2a2018'); x.fillRect(k + 10, 148, 3, 24); }
      x.fillStyle = TC.col('#4a4a56'); x.fillRect(0, 154, W, 1); x.fillRect(0, 162, W, 1);
      for (k = 0; k < W; k += 6) { x.fillRect(k, 153, 1, 3); x.fillRect(k + 3, 161, 1, 3); }
      // a vaca parada (silhueta), sem o brilho dos olhos
      x.fillStyle = TC.col('#14121a');
      TC.fillPoly(x, [[150, 176], [190, 176], [196, 168], [200, 160], [194, 156], [184, 158], [156, 158], [148, 164]]);
      x.fillRect(152, 176, 3, 12); x.fillRect(160, 176, 3, 12); x.fillRect(180, 176, 3, 12); x.fillRect(188, 176, 3, 12);
      TC.fillPoly(x, [[194, 156], [206, 152], [210, 160], [200, 164]]);
      return cv;
    })());
    c.drawImage(bgc, 0, 0);
    c.globalAlpha = 0.5;
    var o = Math.round(t * 0.25) % 512;
    c.drawImage(this.fogBand, -o, 150); c.drawImage(this.fogBand, 512 - o, 150);
    c.globalAlpha = 1;
    if (this.tbcRoad) {
      c.globalAlpha = this.tbcRoad;
      TC.font.draw(c, TC.t('end.tbc'), 128, 200, '#c8a878', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  TC.Ending4Scene = Ending4Scene;

  TC.READY[4] = true;
})();
