'use strict';
/* Teewald City — Capítulo 3: "O Baile Debaixo da Terra"
   Prólogo: o Arno desce a escada de pedra de dentro do toco, com os nomes dos sumidos riscados nos degraus.
   Final: o baile acorda, o Ewald reencontra o filho, e o sol nasce em Teewald pela primeira vez desde maio. */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GY = 192;

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
  function say(dlg, who, key, face, pos) { return TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }

  /* ==================================================================
     PRÓLOGO: a escada dentro do toco
     ================================================================== */
  var FLIGHTS = [[36, 110, 206, 190], [214, 206, 44, 286], [36, 302, 206, 382], [214, 398, 120, 446]];
  function Ch3IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.arno = { x: 36, y: 110, face: 1, pose: 'idle', anim: 0 };
    this.camY = 0;
    this.prepare();
    this.script = new TC.Script(this.run());
  }
  Ch3IntroScene.prototype.prepare = function () {
    A.ch3Init();
    var WH = 520;
    var cv = TC.canvas(W, WH), c = cv.ctx, r = TC.RNG(3);
    for (var y = 0; y < WH; y++) { c.fillStyle = TC.mix('#1e1610', '#0a0605', y / WH); c.fillRect(0, y, W, 1); }
    for (var k = 0; k < 900; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#2a1e16' : '#120c08'); c.fillRect(r.int(0, W), r.int(0, WH), r.int(1, 3), 1); }
    // raízes do Pinheiro Velho atravessando o poço
    for (k = 0; k < 14; k++) {
      var x0 = r.int(0, W), len = r.int(80, 300);
      for (var t = 0; t < len; t++) {
        var x = x0 + Math.sin(t * 0.05 + k) * 10, th = Math.max(1, 6 - t / 60);
        c.fillStyle = TC.col(t % 11 === 0 ? '#5a3e26' : '#3e2a1a');
        c.fillRect(Math.round(x - th / 2), t + k * 20, Math.ceil(th), 1);
      }
    }
    // os lances da escada, com nomes riscados nos degraus
    var names = ['SCHMITT 1898', 'WEBER 1931', 'KESSLER 1997', 'BECKER 1977'];
    FLIGHTS.forEach(function (f, i) {
      var n = 9;
      for (var s = 0; s < n; s++) {
        var sx = f[0] + (f[2] - f[0]) * s / n, sy = f[1] + (f[3] - f[1]) * s / n;
        var sw = Math.abs(f[2] - f[0]) / n + 2, x0 = Math.min(sx, sx + (f[2] - f[0]) / n);
        c.fillStyle = TC.col('#6e6454'); c.fillRect(Math.round(x0), Math.round(sy), Math.round(sw), 4);
        c.fillStyle = TC.col('#8e8472'); c.fillRect(Math.round(x0), Math.round(sy), Math.round(sw), 1);
        c.fillStyle = TC.col('#3a342c'); c.fillRect(Math.round(x0), Math.round(sy) + 4, Math.round(sw), 9);
      }
      var mid = n >> 1, mx = f[0] + (f[2] - f[0]) * mid / n, my = f[1] + (f[3] - f[1]) * mid / n;
      TC.font.draw(c, names[i], Math.round(mx), Math.round(my) + 14, '#a89a80', { align: 'center' });
      // nicho com vela no patamar
      var px = f[2] < f[0] ? f[2] - 6 : f[2] + 6;
      c.fillStyle = TC.col('#0e0806'); c.fillRect(px - 5, f[3] - 22, 10, 12);
      c.fillStyle = TC.col('#e8e0d0'); c.fillRect(px - 1, f[3] - 16, 2, 5);
    });
    this.world = cv;
    this.WH = WH;
  };
  Ch3IntroScene.prototype.enter = function () { TC.fx.bright = 0; TC.audio.ambience('windy'); };
  Ch3IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };
  Ch3IntroScene.prototype.walkFlight = function* (i, stopAt) {
    var f = FLIGHTS[i], ar = this.arno;
    ar.face = f[2] > f[0] ? 1 : -1; ar.pose = 'run';
    var n = Math.round(Math.abs(f[2] - f[0]) / 0.9);
    var end = stopAt == null ? n : Math.round(n * stopAt);
    for (var k = 0; k <= end; k++) {
      ar.x = f[0] + (f[2] - f[0]) * k / n;
      ar.y = f[1] + (f[3] - f[1]) * k / n;
      ar.anim++;
      if (k % 10 === 0) TC.audio.sfx('step');
      yield;
    }
    ar.pose = 'idle';
  };
  Ch3IntroScene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    TC.fx.bright = 15;
    var t1 = text(TC.t('ch3.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('ch3.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('door');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(100);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    this.shot = 'stairs';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.music('bandinha', 2);
    yield* co.wait(60);
    yield* say(dlg, 'arno', 'p3.1');
    yield* this.walkFlight(0);
    yield* say(dlg, 'voice', 'p3.2');
    yield* this.walkFlight(1, 0.5);
    yield* say(dlg, 'arno', 'p3.3');
    yield* this.walkFlight(1);
    yield* this.walkFlight(2, 0.6);
    ar.pose = 'shock';
    TC.audio.sfx('heartbeat');
    yield* say(dlg, 'arno', 'p3.4', 'shock');
    yield* this.walkFlight(2);
    yield* this.walkFlight(3);
    yield* co.wait(20);
    yield* say(dlg, 'arno', 'p3.5');
    TC.fx.fadeOut(60);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 3 }); }, 10);
    while (true) yield;
  };
  Ch3IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 3 }); }, 30);
    }
    this.dlg.update();
    this.script.update();
    this.parts.update();
    var target = TC.clamp(this.arno.y - 120, 0, this.WH - H + 22);
    this.camY += (target - this.camY) * 0.06;
    if (this.t % 6 === 0) this.parts.add({ x: TC.rnd.range(0, W), y: this.camY + TC.rnd.range(0, H), vy: 0.3, life: 120, color: '#c8b898', size: 1, fade: true, wobble: 0.04 });
  };
  Ch3IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'stairs') {
      var t = this.t, cy = Math.round(this.camY), pc = this.pf.ctx;
      pc.clearRect(0, 0, W, H);
      pc.drawImage(this.world, 0, -cy);
      var ar = this.arno;
      drawFig(pc, A.arno, ar.pose, ar.x, ar.y - cy, ar.face, t, ar.anim);
      this.parts.draw(pc, 0, cy, 0);
      var L = this.light;
      L.begin('#2a2028');
      L.add(ar.x, ar.y - 16 - cy, 66, '#c8a070', 0.9);
      FLIGHTS.forEach(function (f) {
        var px = f[2] < f[0] ? f[2] - 6 : f[2] + 6;
        L.add(px, f[3] - 18 - cy, 30, '#ffb060', 0.8 + Math.sin(t * 0.3 + px) * 0.08);
      });
      // a luz quente da festa lá embaixo
      L.add(128, this.WH - cy + 10, 160, '#ffb060', 1.1);
      this.mask.ctx.clearRect(0, 0, W, H);
      this.mask.ctx.drawImage(this.pf, 0, 0);
      L.apply(pc);
      pc.globalCompositeOperation = 'destination-in';
      pc.drawImage(this.mask, 0, 0);
      pc.globalCompositeOperation = 'source-over';
      c.drawImage(this.pf, 0, 0);
      FLIGHTS.forEach(function (f) {
        var px = f[2] < f[0] ? f[2] - 6 : f[2] + 6;
        TC.Lighting.glow(c, px, f[3] - 18 - cy, 4, '#ffe0a0', 0.8);
      });
    }
    for (var i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
    this.dlg.draw(c);
    if (this.t < 360) {
      c.globalAlpha = TC.clamp((360 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  Ch3IntroScene.prototype.onHide = function () { };
  TC.Ch3IntroScene = Ch3IntroScene;

  /* ==================================================================
     FINAL: o baile acorda, o pai, e o primeiro amanhecer
     ================================================================== */
  function Ending3Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'hall';
    var C3 = A.ch3Init(), C2 = A.ch2Init();
    this.C3 = C3;
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.arno = { x: 70, face: 1, pose: 'idle', anim: 0 };
    this.ewald = { x: 196, face: -1, pose: 'idle', anim: 0, a: 0 };
    this.ingrid = { x: 150, face: -1, pose: 'idle', a: 1 };
    this.wake = 0;        // 0 = fantasmas azulados, 1 = gente de verdade
    this.dawn = 0;        // 0 = noite, 1 = manhã
    this.sunY = 150;
    this.textA = 0;
    // o salão
    var hall = TC.canvas(W, H), c = hall.ctx, r = TC.RNG(12);
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#1e1612', '#0e0a08', y / H); c.fillRect(0, y, W, 1); }
    for (var k = 0; k < 400; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#2a201a' : '#0e0a08'); c.fillRect(r.int(0, W), r.int(0, 150), r.int(1, 3), 1); }
    for (var x = 0; x < W; x++) { c.fillStyle = TC.col(x % 24 === 0 ? '#1a0e08' : (x % 24 < 2 ? '#5a3a20' : '#3a2414')); c.fillRect(x, 154, 1, 38); }
    c.fillStyle = TC.col('#6a4a2a'); c.fillRect(0, 152, W, 3);
    for (x = 0; x < W; x += 16) c.drawImage(C3.T.parquetTop[(x >> 4) % 2], x, GY);
    for (x = 0; x < W; x += 16) c.drawImage(C3.T.parquet, x, GY + 16);
    c.drawImage(C3.banner('FESTA DA BATATA 1997'), 40, 70);
    c.drawImage(C3.banner('FESTA 1977', '#f0d8b0'), 170, 84);
    c.drawImage(C3.feastTable(5), 6, GY + 1 - 30);
    this.hall = hall;
    this.lanterns = [];
    for (k = 0; k < 9; k++) this.lanterns.push({ x: 12 + k * 29, y: 48 + Math.round(Math.sin(k / 8 * Math.PI) * 12), col: C3.lanternColors[k % 6] });
    // a clareira do toco ao amanhecer
    this.stump = C2.stump({ bare: true });
    this.arau = [A.araucaria(5001, 200), A.araucaria(5002, 172), A.araucaria(5003, 214)];
    this.hills = A.hills(W, 90, { seed: 63, color: '#121534', rim: '#2a3060', base: 0.38, amp: 0.5, trees: 50, treeMin: 8, treeMax: 18, period: 3, arauc: 0.9 });
    this.fogBand = A.fog(512, 52, 47, '#a8a8c8');
    this.frida = { x: -20, a: 1 };
    this.crowd = [];
    this.script = new TC.Script(this.run());
  }
  Ending3Scene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
  };
  Ending3Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ending3Scene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, ew = this.ewald;
    yield* co.wait(60);
    // as lanternas esquentam e os dançarinos voltam a ser gente
    TC.audio.sfx('bell');
    yield* co.tween(this, 'wake', 1, 120);
    yield* say(dlg, 'ingrid', 'e3.1');
    // o pai aparece no meio do povo
    yield* co.tween(ew, 'a', 1, 40);
    ew.pose = 'walk';
    while (ew.x > 110) { ew.x -= 0.6; ew.anim++; yield; }
    ew.pose = 'idle';
    TC.audio.music('dawn', 2);
    yield* say(dlg, 'ewald', 'e3.2');
    yield* say(dlg, 'arno', 'e3.3');
    yield* say(dlg, 'ewald', 'e3.4');
    ew.pose = 'watch';
    yield* co.wait(30);
    yield* say(dlg, 'ewald', 'e3.5');
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'e3.6', 'shock');
    ew.pose = 'idle';
    ar.pose = 'idle';
    yield* say(dlg, 'ewald', 'e3.7');
    yield* say(dlg, 'arno', 'e3.8');
    TC.fx.fadeOut(70);
    yield* co.wait(80);

    // lá em cima, na clareira: o céu clareando
    this.phase = 'dawn';
    ar.x = 70; ar.face = 1; ar.pose = 'idle'; ar.a = 0;
    ew.x = 104; ew.face = 1; ew.pose = 'idle'; ew.a = 0;
    TC.audio.ambience('night');
    TC.fx.fadeIn(80);
    yield* co.wait(40);
    // saem do toco, um por um
    var exits = [['arno', ar], ['ewald', ew]];
    for (var k = 0; k < exits.length; k++) {
      var who = exits[k][1];
      who.x = 128; who.a = 0; who.pose = 'walk';
      for (var i = 0; i < 40; i++) { who.a = i / 40; who.x -= k === 0 ? 1.4 : 0.6; who.anim++; yield; }
      who.pose = 'idle';
    }
    for (k = 0; k < 6; k++) {
      this.crowd.push({ x: 128, tx: 150 + k * 16 + (k % 2) * 6, a: 0, f: k, anim: 0 });
      yield* co.wait(24);
    }
    // nasce o sol
    var birds = 0;
    for (i = 0; i < 360; i++) {
      this.dawn = TC.ease.inOutSine(i / 360);
      this.sunY = 150 - this.dawn * 90;
      if (i % 70 === 30) { TC.audio.sfx('bird'); birds++; }
      yield;
    }
    TC.audio.sfx('bell');
    yield* say(dlg, 'arno', 'e3.12');
    TC.audio.sfx('tick');
    ew.pose = 'watch';
    yield* co.wait(50);
    ew.pose = 'idle';
    // a Dona Frida chega com a cuia
    while (this.frida.x < 40) { this.frida.x += 0.5; yield; }
    yield* say(dlg, 'frida', 'e3.9');
    yield* say(dlg, 'ewald', 'e3.10');
    yield* say(dlg, 'frida', 'e3.11');
    yield* co.wait(40);
    this.cap = 0;
    for (i = 0; i < 160; i++) { this.cap = Math.min(TC.t('e3.cap').length, this.cap + 0.4); yield; }
    yield* co.wait(150);
    TC.fx.fadeOut(80);
    TC.audio.stopMusic(2.5);
    yield* co.wait(90);

    // fim do capítulo
    TC.fx.letterbox = 0;
    this.phase = 'tbc';
    TC.fx.bright = 15;
    yield* co.tween(this, 'textA', 1, 90);
    var w = 0;
    while (w++ < 360 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);

    // créditos, com o céu da manhã
    this.phase = 'credits';
    TC.audio.music('dawn');
    this.credY = H + 10;
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred3.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred3.3', 1, '#a0a8d0'], ['cred3.4', 1, '#ffffff'], ['cred3.5', 1, '#ffffff'], ['cred3.6', 1, '#ffffff'], ['', 1], ['', 1],
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

    // na curva da serra, a cerração que sobrou
    this.phase = 'road';
    this.lights = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.ambience('windy');
    yield* co.wait(120);
    TC.audio.sfx('click');
    for (i = 0; i < 6; i++) { this.lights = i % 2 ? 0 : 1; yield* co.wait(6); }
    this.lights = 1;
    TC.audio.static(4, 0.08);
    yield* TC.ui.say(dlg, [{ who: 'radio', key: 'e3.r1', speed: 0.5 }], { pos: 'top' });
    yield* co.wait(40);
    this.tbcRoad = 0;
    for (i = 0; i < 60; i++) { this.tbcRoad = i / 60; yield; }
    w = 0;
    while (w++ < 300 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    // a história continua: o caminhão desce para a baixada da fábrica (capítulo 4)
    TC.game.fadeTo(function () { return TC.chapterReady(4) ? TC.chapterStart(4) : new TC.TitleScene(); }, 60);
    while (true) yield;
  };

  Ending3Scene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    var self = this;
    this.crowd.forEach(function (p) { if (p.x < p.tx) { p.x += 0.6; p.anim++; } p.a = Math.min(1, p.a + 0.03); });
    if (this.phase === 'hall' && this.t % 10 === 0) this.parts.add({ x: TC.rnd.range(0, W), y: TC.rnd.range(40, 90), vy: 0.15, life: 160, color: TC.rnd.pick(this.C3.lanternColors), size: 1, fade: true, wobble: 0.04 });
    if (this.phase === 'dawn' && this.dawn > 0.2 && this.t % 30 === 0) this.parts.add({ x: TC.rnd.range(-20, W), y: TC.rnd.range(30, 90), vx: TC.rnd.range(0.6, 1.2), vy: TC.rnd.range(-0.2, 0.1), life: 300, color: '#1a1410', size: 2 });
  };

  Ending3Scene.prototype.draw = function (c) {
    if (this.phase === 'hall') this.drawHall(c);
    else if (this.phase === 'dawn') this.drawDawn(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else if (this.phase === 'credits') this.drawCredits(c);
    else this.drawRoad(c);
    this.dlg.draw(c);
  };

  Ending3Scene.prototype.drawHall = function (c) {
    var t = this.t, pc = this.pf.ctx, C3 = this.C3, self = this;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.hall, 0, 0);
    // os casais que acordam (de azulados para gente de verdade)
    var S = C3.couple.waltz;
    [30, 214, 236].forEach(function (x, k) {
      var img = S[k % 4];
      var real = TC.tintCached(img, '#d8a070', 0.35);
      pc.globalAlpha = 1 - self.wake; pc.drawImage(img, x - img.ox, GY - img.oy + 1);
      pc.globalAlpha = self.wake; pc.drawImage(real, x - img.ox, GY - img.oy + 1);
      pc.globalAlpha = 1;
    });
    var ing = this.ingrid;
    drawFig(pc, C3.ingrid, 'idle', ing.x, GY, ing.face, t, 0, 1);
    drawFig(pc, A.arno, this.arno.pose, this.arno.x, GY, this.arno.face, t, this.arno.anim);
    var ew = this.ewald;
    if (ew.a > 0) drawFig(pc, C3.ewald, ew.pose, ew.x, GY, ew.face, t, ew.anim, ew.a);
    // lanterninhas
    A.drawWire(pc, 0, 46, W, 46, 16, '#2a2020');
    this.lanterns.forEach(function (l) { pc.fillStyle = l.col; TC.fillEllipse(pc, l.x, l.y + 4, 3, 4); });
    this.parts.draw(pc, 0, 0, 0);
    var L = this.light;
    L.begin(TC.mix('#2a2a50', '#4a3a3a', this.wake));
    this.lanterns.forEach(function (l) { L.add(l.x, l.y + 4, 30 + self.wake * 14, self.wake > 0.5 ? l.col : '#8098ff', 0.6); });
    L.add(this.arno.x, GY - 16, 50, '#c8a070', 0.7);
    this.mask.ctx.clearRect(0, 0, W, H);
    this.mask.ctx.drawImage(this.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);
    this.lanterns.forEach(function (l) { TC.Lighting.glow(c, l.x, l.y + 4, 5, l.col, 0.6); });
  };

  Ending3Scene.prototype.drawDawn = function (c) {
    var t = this.t, d = this.dawn, i;
    // céu: da noite para a manhã, faixa por faixa
    for (var y = 0; y < H; y++) {
      var k = y / H;
      var night = TC.mix('#020309', '#262a5a', k);
      var morn = k < 0.5 ? TC.mix('#3a5a9a', '#e8a070', k * 2) : TC.mix('#e8a070', '#ffe0a0', (k - 0.5) * 2);
      c.fillStyle = TC.mix(night, morn, d);
      c.fillRect(0, y, W, 1);
    }
    // estrelas apagando
    if (d < 0.6) {
      var r = TC.RNG(7);
      c.globalAlpha = 1 - d / 0.6;
      for (i = 0; i < 40; i++) { c.fillStyle = '#c8d0f0'; c.fillRect(r.int(0, W), r.int(0, 100), 1, 1); }
      c.globalAlpha = 1;
    }
    // o sol nascendo atrás da serra
    TC.Lighting.glow(c, 170, this.sunY, 70, '#ffb060', 0.5 * d);
    c.fillStyle = TC.mix('#ff9040', '#fff0c0', d);
    TC.fillCircle(c, 170, Math.round(this.sunY), 14);
    var hillsTint = this.hillsTint || (this.hillsTint = TC.tint(this.hills, '#4a3a5a', 0.5));
    c.drawImage(this.hills, 0, 100);
    c.globalAlpha = d; c.drawImage(hillsTint, 0, 100); c.globalAlpha = 1;
    c.globalAlpha = 0.5 * (1 - d) + 0.15;
    var o = (t >> 2) % 512;
    c.drawImage(this.fogBand, -o, 146); c.drawImage(this.fogBand, 512 - o, 146);
    c.globalAlpha = 1;

    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    var a0 = this.arau;
    pc.drawImage(a0[0], 10 - a0[0].baseX, GY + 2 - a0[0].height);
    pc.drawImage(a0[1], 236 - a0[1].baseX, GY + 2 - a0[1].height);
    pc.drawImage(a0[2], 290 - a0[2].baseX, GY + 2 - a0[2].height);
    var st = this.stump, sx = Math.round(128 - st.width / 2), sy = GY + 4 - st.height;
    pc.drawImage(st, sx, sy);
    var T = this.C3 && A.ch2.T;
    for (var x = 0; x < W; x += 16) { pc.drawImage(T.grimpaTop[(x >> 4) % 2], x, GY); pc.drawImage(T.taipa[(x >> 4) % 2], x, GY + 16); }
    // o povo que saiu do toco (silhuetas contra o sol)
    var crowdFr = [A.ch2.kessler.stand[0], this.C3.ingrid.idle[0], A.ch2.colono.stand[0], A.ch2.colona.stand[0], this.C3.ingrid.scared[0], A.ch2.colono.stand[0]];
    this.crowd.forEach(function (p) {
      var fr = crowdFr[p.f % crowdFr.length];
      pc.globalAlpha = p.a;
      var im = TC.tintCached(fr, '#1e1614', 0.72);
      pc.drawImage(p.f % 2 ? TC.flip(im) : im, Math.round(p.x - (p.f % 2 ? fr.width - fr.ox : fr.ox)), GY - fr.oy + 1);
      pc.globalAlpha = 1;
    });
    var ar = this.arno, ew = this.ewald;
    if (ar.a > 0) drawFig(pc, A.arno, ar.pose, ar.x, GY, ar.face, t, ar.anim, ar.a);
    if (ew.a > 0) drawFig(pc, this.C3.ewald, ew.pose, ew.x, GY, ew.face, t, ew.anim, ew.a);
    if (this.frida.x > -10 && A.frida) pc.drawImage(A.frida, Math.round(this.frida.x - 6), GY - A.frida.height + 1);
    this.parts.draw(pc, 0, 0, 0);
    var L = this.light;
    L.begin(TC.mix('#3a3a72', '#e8c8a8', d));
    L.add(170, this.sunY, 160, '#ffc080', d);
    L.add(sx + st.crackX, GY - 20, 40, '#ffb060', 0.5 * (1 - d));
    this.mask.ctx.clearRect(0, 0, W, H);
    this.mask.ctx.drawImage(this.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);
    // raios de sol entre as araucárias
    if (d > 0.3) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (i = 0; i < 4; i++) {
        c.fillStyle = 'rgba(255,200,120,' + (0.05 * d).toFixed(3) + ')';
        var bx = 120 + i * 30;
        TC.fillPoly(c, [[170, this.sunY], [bx - 20, H], [bx + 6, H]]);
      }
      c.restore();
    }
    if (this.cap != null) {
      var txt = TC.t('e3.cap');
      TC.font.draw(c, txt, 128, 206, '#fff0d0', { align: 'center', shadow: '#000', max: Math.floor(this.cap) });
    }
  };

  Ending3Scene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000';
    c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end3.chapter'), 2, '#ffffff', '#ffc080', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 96);
    c.globalAlpha = 1;
  };

  Ending3Scene.prototype.drawCredits = function (c) {
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#3a5a9a', '#ffd8a0', y / H); c.fillRect(0, y, W, 1); }
    TC.fillCircle(c, 200, 60, 12);
    c.drawImage(this.hills, 0, 134);
    c.fillStyle = 'rgba(0,0,10,0.35)';
    c.fillRect(0, 0, W, H);
    var yy0 = this.credY, self = this;
    this.credLines.forEach(function (l, k) {
      var yy = Math.round(yy0 + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) {
        var b = TC.ui.bigText(str, l[1], l[2], '#c08060', '#000000');
        c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4);
      } else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
  };

  /* a curva da serra: o caminhão do Arno, sozinho, acende os faróis */
  Ending3Scene.prototype.drawRoad = function (c) {
    var t = this.t;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#05060e', '#2a2a40', y / H); c.fillRect(0, y, W, 1); }
    var road = this.road || (this.road = (function () {
      var cv = TC.canvas(W, H), x = cv.ctx;
      x.fillStyle = TC.col('#0a0a12');
      TC.fillPoly(x, [[0, 150], [W, 132], [W, H], [0, H]]);
      x.fillStyle = TC.col('#26242e');
      TC.fillPoly(x, [[0, 168], [W, 146], [W, 172], [0, 200]]);
      x.fillStyle = TC.col('#8a7030');
      for (var k = 0; k < W; k += 14) x.fillRect(k, Math.round(184 - k * 0.1), 7, 1);
      var r = TC.RNG(4);
      for (k = 0; k < 7; k++) {
        var tr = A.araucaria(900 + k, r.int(60, 110), { sil: '#05060c', rim: '#1a1e3a' });
        x.drawImage(tr, r.int(0, W) - tr.baseX, 150 - tr.height + r.int(-10, 6));
      }
      return cv;
    })());
    c.drawImage(road, 0, 0);
    var truck = this.truck || (this.truck = TC.scaleCanvas(A.truckSmall(), 2));
    var tx = 70, ty = 164 - truck.height;
    c.drawImage(truck, tx, ty);
    if (this.lights) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,220,140,0.18)';
      TC.fillPoly(c, [[tx + truck.width - 4, ty + 12], [W, ty - 10], [W, ty + 50]]);
      c.restore();
      TC.Lighting.glow(c, tx + truck.width - 4, ty + 13, 8, '#ffe0a0', 0.9);
    }
    c.globalAlpha = 0.6;
    var o = Math.round(t * 0.3) % 512;
    c.drawImage(this.fogBand, -o, 140); c.drawImage(this.fogBand, 512 - o, 140);
    c.drawImage(this.fogBand, -((o * 2) % 512), 170); c.drawImage(this.fogBand, 512 - ((o * 2) % 512), 170);
    c.globalAlpha = 1;
    if (this.tbcRoad) {
      c.globalAlpha = this.tbcRoad;
      TC.font.draw(c, TC.t('end.tbc'), 128, 200, '#c8a878', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  TC.Ending3Scene = Ending3Scene;
})();
