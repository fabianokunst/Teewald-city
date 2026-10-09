'use strict';
/* Teewald City — final do capítulo: a igreja, Dona Frida, "continua..." e créditos */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GY = 192;

  var FRIDA = TC.sprite([
    '....kkkk....',
    '...kppppk...',
    '..kpPppppk..',
    '..kpsssspk..',
    '..kpskskpk..',
    '..kpssssk...',
    '...ksssk....',
    '...kkkkk..y.',
    '..kddddddkok',
    '..kdddddkkwk',
    '.kdddddddkwk',
    '.kddddddkhhk',
    '.kdddddddkk.',
    '.kggggggggk.',
    '.kgGggggggk.',
    'kggGgggggggk',
    'kgggGggggggk',
    'kggggGgggggk',
    'kgggggggGggk',
    'kggggggggggk',
    '.kkkkkkkkkk.',
    '..bb....bb..'
  ], { k: '#120c12', p: '#5a3a6a', P: '#7a5a8a', s: '#d8a070', d: '#2a1e2a', g: '#3a2a20', G: '#4a3828', y: '#ffe080', o: '#ff9030', w: '#e8e0d0', h: '#d8a070', b: '#1a1210' });
  A.frida = FRIDA;   // a Dona Frida também aparece no capítulo 2

  function EndingScene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'church';
    var P = A.PAL;
    this.sky = A.sky(W, H, [[0, '#020309'], [0.5, '#0a0d2a'], [1, '#262a5a']], 88, 0.007);
    this.tw = A.twinkles(W, 110, 34, 5);
    this.moon = A.moon(14);
    this.hills = A.hills(W, 90, { seed: 61, color: '#121534', rim: '#2a3060', base: 0.38, amp: 0.5, trees: 40, treeMin: 8, treeMax: 16, period: 3 });
    this.church = A.church();
    this.coreto = A.coreto();
    this.lampL = A.lampPost(118);
    this.arau = A.araucaria(808, 190);
    this.arau2 = A.araucaria(809, 170);
    this.T = A.tiles();
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.fogBand = A.fog(512, 52, 44, '#8a8ab8');
    this.fogA = 0.6;
    this.door = 0;
    this.fridaA = 0;
    this.arno = { x: 70, face: 1, pose: 'idle', a: 1, anim: 0 };
    this.flames = [];
    this.textA = 0;
    this.texts = [];
    this.parts = new TC.Particles();
    this.script = new TC.Script(this.run());
  }

  EndingScene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.ambience('night');
  };
  EndingScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  EndingScene.prototype.run = function* () {
    var self = this, ar = this.arno;
    function* say(who, key, face) { yield* TC.ui.say(self.dlg, [{ who: who, key: key, face: face }], { pos: 'top' }); }
    yield* co.wait(80);
    yield* say('arno', 'end.1');
    yield* co.wait(40);
    // o sino toca
    for (var i = 0; i < 3; i++) {
      TC.audio.sfx('bell');
      TC.fx.shake(1, 20);
      yield* co.tween(this, 'fogA', this.fogA - 0.15, 90);
    }
    TC.audio.music('church');
    yield* co.wait(30);
    TC.audio.sfx('door');
    yield* co.tween(this, 'door', 1, 120, TC.ease.inOutSine);
    yield* say('voice', 'end.2');
    ar.pose = 'shock';
    yield* say('arno', 'end.3', 'shock');
    yield* co.tween(this, 'fridaA', 1, 60);
    ar.pose = 'idle';
    yield* say('frida', 'end.4');
    yield* say('arno', 'end.5', 'shock');
    yield* say('frida', 'end.6');
    yield* say('frida', 'end.7');
    yield* say('frida', 'end.8');
    // lá nas colinas, dezenas de luzes de fogo acendem
    TC.audio.sfx('screech');
    ar.face = -1;
    var r = TC.RNG(66);
    for (var k = 0; k < 34; k++) {
      this.flames.push({ x: r.int(6, 250), y: r.int(112, 150), t: 0, p: r() * 6 });
      if (k % 6 === 0) TC.audio.sfx('flame');
      yield* co.wait(k < 10 ? 8 : 3);
    }
    TC.audio.sfx('screech');
    yield* co.wait(50);
    ar.face = 1;
    yield* say('arno', 'end.9');
    // Arno entra na igreja
    ar.pose = 'run';
    while (ar.x < 126) { ar.x += 1.0; ar.anim++; yield; }
    ar.pose = 'idle';
    yield* co.all(co.tween(ar, 'a', 0, 40), co.tween(this, 'fridaA', 0, 40));
    TC.audio.sfx('door');
    yield* co.tween(this, 'door', 0, 70, TC.ease.inQuad);
    TC.audio.sfx('hit2');
    TC.fx.shake(3, 12);
    yield* co.wait(90);
    TC.fx.fadeOut(70);
    TC.audio.stopMusic(2.5);
    yield* co.wait(90);
    // fim do capítulo
    TC.fx.letterbox = 0;
    this.phase = 'tbc';
    TC.fx.bright = 15;
    this.textA = 0;
    yield* co.tween(this, 'textA', 1, 90);
    this.tbcChars = 0;
    for (var c = 0; c < 60; c++) { this.tbcChars += 0.25; yield; }
    var w = 0;
    while (w++ < 360 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);
    // créditos
    this.phase = 'credits';
    this.prepareCredits();
    TC.audio.music('drive');
    TC.fx.bright = 0;
    TC.fx.fadeIn(80);
    this.credY = H + 10;
    while (this.credY > -this.credH + 70) {
      this.credY -= TC.input.down('confirm') || TC.input.down('jump') ? 1.6 : 0.32;
      yield;
    }
    this.credDone = true;
    while (!(TC.input.pressed('confirm') || TC.input.pressed('start'))) yield;
    TC.audio.stopMusic(1.5);
    // a história continua direto no capítulo 2
    TC.game.fadeTo(function () { return TC.Ch2IntroScene ? new TC.Ch2IntroScene() : new TC.TitleScene(); }, 60);
    while (true) yield;
  };

  EndingScene.prototype.prepareCredits = function () {
    this.map = A.townMap();
    this.m7 = new TC.Mode7(this.map);
    this.csky = A.sky(W, 100, [[0, '#020309'], [0.6, '#0a0d2a'], [1, '#262a58']], 12, 0.006);
    this.cridge = A.hills(512, 40, { seed: 31, color: '#0c0e22', rim: '#2a3060', base: 0.55, amp: 0.7, trees: 60, treeMin: 5, treeMax: 11, period: 6 });
    var lines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred.3', 1, '#a0a8d0'], ['cred.4', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['cred.5', 1, '#e0e0f0'], ['cred.6', 1, '#e0e0f0'], ['cred.7', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['@score', 1, '#ffe060'], ['', 1], ['', 1], ['cred.8', 2, '#ffd890']
    ];
    this.credLines = lines;
    this.credH = lines.length * 16 + 20;
  };

  EndingScene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.phase === 'church') {
      if (this.t % 18 === 0) {
        var ls = A.leaves()[TC.rnd.int(0, 2)];
        this.parts.add({ x: TC.rnd.range(0, W + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6,
          sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
      }
      for (var i = 0; i < this.flames.length; i++) this.flames[i].t++;
    }
  };

  EndingScene.prototype.draw = function (c) {
    if (this.phase === 'church') this.drawChurch(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else this.drawCredits(c);
    this.dlg.draw(c);
  };

  EndingScene.prototype.drawChurch = function (c) {
    var t = this.t, i;
    c.drawImage(this.sky, 0, 0);
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moon, 210 - this.moon.width / 2, 34 - this.moon.height / 2);
    c.drawImage(this.hills, 0, 96);
    // luzes de fogo nas colinas
    for (i = 0; i < this.flames.length; i++) {
      var f = this.flames[i];
      var fl = 0.8 + Math.sin(f.t * 0.3 + f.p) * 0.2;
      var fx = f.x + Math.sin(f.t * 0.02 + f.p) * 3;
      TC.Lighting.glow(c, fx, f.y, 8 * Math.min(1, f.t / 10), '#ff8030', 0.7 * fl);
      c.fillStyle = '#ffe080';
      c.fillRect(Math.round(fx), Math.round(f.y), 1, 1);
    }
    c.globalAlpha = 0.25 + this.fogA * 0.5;
    var o = (t >> 2) % 512;
    c.drawImage(this.fogBand, -o, 144); c.drawImage(this.fogBand, 512 - o, 144);
    c.globalAlpha = 1;

    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.arau, -30 - this.arau.baseX + 30, GY + 2 - this.arau.height);
    pc.drawImage(this.arau2, 236 - this.arau2.baseX, GY + 2 - this.arau2.height);
    pc.drawImage(this.coreto, -40, GY + 1 - this.coreto.height);
    var ch = this.church, chx = 128 - ch.width / 2, chy = GY + 2 - ch.height;
    pc.drawImage(ch, chx, chy);
    // porta se abrindo
    var dX = Math.round(ch.doorX + chx), dY = Math.round(chy + ch.doorY - 7);
    var open = Math.round(this.door * 11);
    if (open > 0) {
      pc.fillStyle = TC.col('#ffc070');
      pc.fillRect(dX - open, dY - 12, open * 2, 42);
      pc.fillStyle = TC.col('#ffe0a0');
      pc.fillRect(dX - Math.max(1, open - 3), dY - 8, Math.max(2, open * 2 - 6), 38);
    }
    if (this.fridaA > 0) {
      pc.globalAlpha = this.fridaA;
      pc.drawImage(FRIDA, dX - 6, dY + 30 - FRIDA.height + 1);
      pc.globalAlpha = 1;
    }
    var T = this.T;
    for (var x = 0; x < W; x += 16) { pc.drawImage(T.hexTop[(x >> 4) % 2], x, GY); pc.drawImage(T.cobble[(x >> 4) % 2], x, GY + 16); }
    pc.drawImage(this.lampL, 196 - this.lampL.poleX, GY + 3 - this.lampL.height);
    // Arno
    var ar = this.arno;
    var arr = A.arno[ar.pose] || A.arno.idle;
    var fr = ar.pose === 'run' ? arr[Math.floor(ar.anim / 5) % 8] : ar.pose === 'idle' ? arr[Math.floor(t / 32) % 2] : arr[0];
    var img = ar.face < 0 ? TC.flip(fr) : fr;
    var ox = ar.face < 0 ? fr.width - fr.ox : fr.ox;
    pc.globalAlpha = ar.a;
    pc.drawImage(img, Math.round(ar.x - ox), GY - fr.oy + 1);
    pc.globalAlpha = 1;
    this.parts.draw(pc, 0, 0, 0);
    // luz
    var L = this.light;
    L.begin('#4a4a84');
    L.add(196 - this.lampL.poleX + this.lampL.lampX, GY + 3 - this.lampL.height + this.lampL.lampY + 4, 70, '#ffb060', 1);
    L.add(27 + chx, chy + 150, 26, '#ffc070', 0.6);
    L.add(ch.width - 27 + chx, chy + 150, 26, '#ffc070', 0.6);
    if (this.door > 0) {
      L.add(dX, dY + 20, 30 + this.door * 50, '#ffc070', 0.6 + this.door * 0.8);
      L.add(dX, GY + 6, 20 + this.door * 40, '#ffc070', this.door);
    }
    if (this.fridaA > 0) L.add(dX + 4, dY + 14, 22, '#ffa040', this.fridaA);
    L.add(ar.x, GY - 16, 40, '#7a7aa8', 0.5);
    this.mask.ctx.clearRect(0, 0, W, H);
    this.mask.ctx.drawImage(this.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);
    TC.Lighting.glow(c, 196 - this.lampL.poleX + this.lampL.lampX, GY + 3 - this.lampL.height + this.lampL.lampY + 1, 9, '#ffe0a0', 0.9);
    if (this.door > 0) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,190,110,' + (0.12 * this.door).toFixed(3) + ')';
      TC.fillPoly(c, [[dX - open, GY], [dX + open, GY], [dX + open + 30, H], [dX - open - 30, H]]);
      c.restore();
    }
    c.globalAlpha = this.fogA * 0.6;
    c.drawImage(this.fogBand, -((t >> 1) % 512), 186); c.drawImage(this.fogBand, 512 - ((t >> 1) % 512), 186);
    c.globalAlpha = 1;
    this.parts.draw(c, 0, 0, 1);
  };

  EndingScene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000';
    c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end.chapter'), 2, '#ffffff', '#8890d0', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 86);
    if (this.tbcChars) TC.font.draw(c, TC.t('end.tbc'), 128, 124, '#c8a878', { align: 'center', max: Math.floor(this.tbcChars) });
    c.globalAlpha = 1;
  };

  EndingScene.prototype.drawCredits = function (c) {
    var t = this.t;
    var th = t * 0.0018;
    var cam = { x: 256 - Math.sin(th) * 150, y: 256 + Math.cos(th) * 150, height: 46, horizon: 90, focal: 150, fog: '#14183c', fogDist: 520 };
    cam.angle = Math.atan2(256 - cam.x, -(256 - cam.y));
    c.drawImage(this.csky, 0, -6);
    var ang = ((cam.angle % TC.TAU) + TC.TAU) % TC.TAU;
    var off = Math.round((ang / TC.TAU) * 512) % 512;
    c.drawImage(this.cridge, -off, 62); c.drawImage(this.cridge, 512 - off, 62);
    c.drawImage(this.m7.render(cam), 0, 0);
    var lamps = this.map.lamps;
    for (var i = 0; i < lamps.length; i++) {
      var p = this.m7.project(cam, lamps[i][0], lamps[i][1]);
      if (!p || p.y < 90 || p.y > H) continue;
      TC.Lighting.glow(c, p.x, p.y, TC.clamp(p.s * 7, 2, 16), '#ffb050', 0.55);
    }
    c.fillStyle = 'rgba(0,0,10,0.45)';
    c.fillRect(0, 0, W, H);
    var y = this.credY;
    var self = this;
    this.credLines.forEach(function (l, k) {
      var yy = Math.round(y + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) {
        var b = TC.ui.bigText(str, l[1], l[2], '#8890d0', '#000000');
        c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4);
      } else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
    if (this.credDone && (t >> 5) % 2 === 0) TC.font.draw(c, TC.t('boot.press'), 128, 206, '#a0a8d0', { align: 'center', shadow: '#000' });
  };

  TC.EndingScene = EndingScene;
})();
