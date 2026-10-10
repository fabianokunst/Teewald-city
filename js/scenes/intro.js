'use strict';
/* Teewald City — cutscene de abertura: a serra, a cabine do caminhão, a perda de controle e o despertar */
(function () {
  var A = TC.ART;
  var co = TC.co;

  function IntroScene() {
    this.t = 0;
    this.shot = 'card';
    this.dlg = new TC.Dialog();
    this.texts = [];
    this.rng = TC.RNG(1997);
    this.roadPhase = 'calm';
    this.fogAmt = 0;
    this.lidOpen = 0;
    this.radioStatic = false;
    this.chaos = 0;
    this.prepareEstablish();
    this.script = new TC.Script(this.run());
  }

  /* ---------- preparação de arte ---------- */
  IntroScene.prototype.prepareEstablish = function () {
    var P = A.PAL;
    this.e = {};
    var e = this.e;
    e.sky = A.sky(TC.W, 300, [[0, '#010207'], [0.45, P.sky1], [0.8, P.sky2], [1, P.sky3]], 21, 0.005);
    e.tw = A.twinkles(TC.W, 220, 30, 5);
    e.moon = A.moon(15);
    e.far = A.hills(TC.W, 90, { seed: 3, color: '#20244c', rim: '#3a4280', base: 0.45, amp: 0.55, trees: 26, treeMin: 6, treeMax: 12, period: 3 });
    e.mid = A.hills(TC.W, 120, { seed: 8, color: '#141834', rim: '#2a3060', base: 0.35, amp: 0.45, trees: 34, treeMin: 10, treeMax: 22, period: 3 });
    // encosta próxima com a estrada
    var near = TC.canvas(TC.W, 220), c = near.ctx;
    var roadY = function (x) { return 70 + x * 0.16 + Math.sin(x / 34) * 7; };
    e.roadY = roadY;
    c.fillStyle = TC.col(P.hillNear);
    for (var x = 0; x < TC.W; x++) {
      var top = Math.round(26 + Math.sin(x / 50) * 10 + Math.sin(x / 17) * 4 - x * 0.05);
      c.fillRect(x, top, 1, 220 - top);
      c.fillStyle = TC.col('#1a1c36');
      c.fillRect(x, top, 1, 1);
      c.fillStyle = TC.col(P.hillNear);
    }
    for (x = 0; x < TC.W; x++) {
      var ry = Math.round(roadY(x));
      c.fillStyle = TC.col('#26242e'); c.fillRect(x, ry, 1, 7);
      c.fillStyle = TC.col('#3a3844'); c.fillRect(x, ry, 1, 1);
      if (x % 8 < 4) { c.fillStyle = TC.col('#8a7030'); c.fillRect(x, ry + 3, 1, 1); }
      c.fillStyle = TC.col('#14121c'); c.fillRect(x, ry + 7, 1, 2);
      if (x % 12 === 0) { c.fillStyle = TC.col('#6a6a74'); c.fillRect(x, ry + 6, 1, 4); }
    }
    var r = TC.RNG(44);
    for (var i = 0; i < 18; i++) {
      var tx = r.int(-10, 250);
      var big = r() < 0.4;
      var tree = A.araucaria(100 + i, big ? r.int(60, 80) : r.int(30, 46), { sil: '#06070f', rim: '#1a1e3a' });
      var ty = r() < 0.5 ? roadY(tx) - 4 : roadY(tx) + r.int(40, 120);
      c.drawImage(tree, tx - tree.baseX, ty - tree.height);
    }
    e.near = near;
    e.fog = A.fog(512, 60, 8, '#7a7aa8');
    e.truck = A.truckSmall();
  };

  IntroScene.prototype.prepareCab = function () {
    var P = A.PAL;
    var k = this.k = {};
    k.overlay = A.cabOverlay();
    k.wheel = A.wheel();
    k.sky = A.sky(TC.W, 90, [[0, '#020309'], [0.6, P.sky1], [1, '#262a58']], 33, 0.007);
    k.tw = A.twinkles(TC.W, 70, 20, 9);
    k.moon = A.moon(12);
    k.far = A.hills(512, 44, { seed: 13, color: '#14173a', rim: '#2a3064', base: 0.5, amp: 0.7, period: 6 });
    k.near = A.hills(512, 52, { seed: 19, color: '#0c0e22', rim: '#1e2448', base: 0.55, amp: 0.6, trees: 70, treeMin: 6, treeMax: 16, period: 6 });
    k.arau = [1, 2, 3, 4, 5, 6].map(function (s) { return A.araucaria(s * 17, 100 + s * 7); });
    k.pine = [1, 2].map(function (s) { return A.pine(s * 9, 70 + s * 10); });
    k.aut = [1, 2, 3].map(function (s) { return A.autumnTree(s * 5, 64 + s * 6); });
    k.signs = A.roadSigns();
    k.face = A.flashFace();
    var self = this;
    this.road = new TC.Road({ w: TC.W, h: 150, horizon: 74, drawDist: 120, gen: function (rd) { self.genRoad(rd); } });
    this.road.playerX = 0.25;
    this.speed = 0;
    this.wheelAng = 0;
    this.ros = { a: 0, v: 0 };
    this.viewRot = 0;
    this.startY = null;
  };

  IntroScene.prototype.genRoad = function (road) {
    var r = this.rng, k = this.k;
    var start = road.segments.length;
    if (start === 0) road.addRoad(20, 30, 20, 0, 0);
    else if (this.roadPhase === 'descent') road.addRoad(r.int(10, 18), r.int(8, 20), r.int(10, 18), r.pick([-5, -4, 4, 5, -3, 3]), -r.int(28, 44));
    else road.addRoad(r.int(15, 30), r.int(10, 40), r.int(15, 30), r.pick([0, 0, -2, 2, -3, 3, -4, 4]), r.pick([0, 0, 12, -12, 20, -20]));
    var end = road.segments.length;
    // trechos de mata fechada alternam com clareiras (para ver a lua e a serra)
    var dens = start < 40 ? 0.35 : r.pick([1, 0.8, 0.5, 0.2, 0.12]);
    for (var i = start; i < end; i++) {
      if (i < 6) continue;
      var m = i % 4;
      if (m === 0 && r() < dens) road.addSprite(i, r.pick(k.arau), -(2.2 + r() * 4.5), r.range(24, 30));
      else if (m === 2 && r() < dens) road.addSprite(i, r() < 0.7 ? r.pick(k.arau) : r.pick(k.aut), 2.2 + r() * 4.5, r.range(24, 30));
      else if (m === 1 && r() < dens * 0.6) road.addSprite(i, r() < 0.5 ? r.pick(k.pine) : r.pick(k.aut), (r() < 0.5 ? -1 : 1) * (3.5 + r() * 4), 26);
      else if (m === 3 && r() < 0.25) road.addSprite(i, r.pick(k.arau), (r() < 0.5 ? -1 : 1) * (7 + r() * 6), 30);
      if (i % 24 === 0) road.addSprite(i, k.signs.km, 1.3, 8);
      if (i % 40 === 20 && this.roadPhase === 'calm') road.addSprite(i, k.signs.pole, -1.4, 22);
    }
  };

  IntroScene.prototype.placeAhead = function (cv, off, s, ahead) {
    var base = Math.floor(this.road.position / this.road.segLen);
    this.road.ensure();
    this.road.addSprite(base + ahead, cv, off, s);
  };

  /* ---------- roteiro ---------- */
  IntroScene.prototype.run = function* () {
    var self = this;
    var fx = TC.fx;
    function* say(key, who, face) { yield* TC.ui.say(self.dlg, [{ who: who || 'arno', key: key, face: face }]); }
    function text(str, x, y, col, opt) {
      var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0', opt: opt || {}, chars: 0 };
      self.texts.push(o);
      return o;
    }

    // 1) cartão de abertura
    fx.bright = 15;
    var t1 = text(TC.t('intro.place'), 128, 96, '#d0d0e8', { align: 'center' });
    var t2 = text(TC.t('intro.date'), 128, 112, '#a08a68', { align: 'center' });
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(100);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    yield* co.wait(20);

    // 2) plano geral: a serra ao luar
    this.shot = 'establish';
    TC.fx.letterbox = 22;
    this.camY = 0;
    this.truckX = -40;
    TC.audio.music('drive');
    TC.audio.engineStart();
    TC.audio.engineSet(0.35, 0.05);
    fx.bright = 0;
    fx.fadeIn(60);
    yield* co.wait(40);
    yield* co.tween(this, 'camY', 196, 330, TC.ease.inOutSine);
    var t3 = text(TC.t('intro.road'), 10, 186, '#f0e0b0', { shadow: '#000' });
    t3.a = 1; t3.type = true;
    yield* co.until(function () { return self.truckX > 250; });
    yield* co.wait(10);
    fx.fadeOut(30);
    yield* co.wait(34);
    this.texts = [];

    // 3) dentro da cabine
    TC.fx.letterbox = 0;
    this.prepareCab();
    this.shot = 'cab';
    this.speed = 52;
    TC.audio.engineSet(0.45, 0.13);
    fx.fadeIn(40);
    yield* co.wait(80);
    yield* say('intro.d1');
    yield* co.wait(40);
    this.placeAhead(this.k.signs.city, 1.55, 18, 110);
    yield* say('intro.d2');
    yield* co.wait(50);
    yield* say('intro.d3');
    yield* co.wait(30);
    yield* say('intro.d4');
    yield* co.wait(20);
    yield* say('intro.d5');
    yield* co.wait(90);

    // o rádio chia
    this.radioStatic = true;
    TC.audio.static(1.2, 0.1);
    TC.audio.stopMusic(2.5);
    yield* co.wait(70);
    TC.audio.static(5, 0.08);
    yield* TC.ui.say(this.dlg, [{ who: 'radio', key: 'intro.r1', speed: 0.5 }, { who: 'radio', key: 'intro.r2', speed: 0.45 }]);
    this.radioStatic = false;
    yield* co.wait(30);
    yield* say('intro.d6');
    TC.audio.music('dread');
    // a neblina chega
    this.roadPhase = 'fog';
    var road = this.road;
    yield* co.all(
      co.tween(this, 'fogAmt', 1, 240, TC.ease.inOutSine),
      co.tween(road, 'fogDist', 34, 240, TC.ease.inOutSine),
      (function* () { for (var i = 0; i <= 240; i++) { if (i % 30 === 0) road.fogColor = TC.mix('#181a36', '#3e3e5e', i / 240); yield; } })()
    );
    yield* say('intro.d7', 'arno', 'shock');
    this.placeAhead(this.k.signs.slope, 1.6, 22, 40);
    this.placeAhead(this.k.signs.brake, -1.7, 18, 70);
    this.placeAhead(this.k.signs.chevronR, 1.4, 16, 95);
    yield* co.wait(100);
    this.roadPhase = 'descent';
    yield* say('intro.d8');
    yield* co.tween(this, 'speed', 66, 120);
    yield* co.wait(70);

    // 4) do nada: perde o controle — o acidente não é mostrado
    this.chaos = 0.01;
    this.faceT = 6;
    fx.flash('#ffffff', 0.35, 0.05);
    TC.audio.sfx('screech');
    TC.audio.sfx('skid');
    TC.audio.sfx('horn');
    TC.audio.stopMusic(0.1);
    yield* co.tween(this, 'chaos', 1, 70, TC.ease.inQuad);
    // corte seco para o preto
    this.shot = 'black';
    TC.audio.engineStop(0.02);
    TC.audio.sfx('crash');
    fx.shakeT = 0;
    this.dlg.active = false;
    yield* co.wait(200);
    TC.audio.sfx('heartbeat');
    yield* co.wait(70);
    TC.audio.sfx('heartbeat');
    yield* co.wait(90);
    var dots = text('...', 128, 106, '#8088b0', { align: 'center' });
    yield* co.tween(dots, 'a', 1, 40);
    yield* co.wait(70);
    yield* co.tween(dots, 'a', 0, 30);
    this.texts = [];

    // 5) o despertar: olhando para o céu
    this.prepareWake();
    this.shot = 'wake';
    TC.fx.letterbox = 0;
    TC.audio.music('wake');
    TC.audio.ambience('night');
    fx.mosaic = 10;
    fx.tween('mosaic', 1, 260);
    this.lidOpen = 0;
    yield* co.tween(this, 'lidOpen', 0.35, 70, TC.ease.outQuad);
    yield* co.tween(this, 'lidOpen', 0.05, 22);
    yield* co.wait(20);
    yield* co.tween(this, 'lidOpen', 0.7, 60, TC.ease.outQuad);
    yield* co.tween(this, 'lidOpen', 0.3, 18);
    yield* co.tween(this, 'lidOpen', 1, 80, TC.ease.outCubic);
    TC.audio.sfx('bell');
    yield* co.wait(50);
    yield* say('wake.1', 'arno', 'hurt');
    yield* co.wait(30);
    TC.game.fadeTo(function () { return new TC.StageScene({ fromIntro: true }); }, 50);
    while (true) yield;
  };

  /* vista de quem está deitado na rua: céu, beirais das casas e galhos de araucária */
  IntroScene.prototype.prepareWake = function () {
    var w = this.w = {};
    var W = 284, H = 252;
    var cv = TC.canvas(W, H), c = cv.ctx;
    c.drawImage(A.sky(W, H, [[0, '#03040d'], [0.55, '#0c0f2c'], [1, '#20245a']], 41, 0.007), 0, 0);
    var moon = A.moon(14);
    c.drawImage(moon, 186 - moon.width / 2, 62 - moon.height / 2);
    A.drawWire(c, -10, 150, W + 10, 96, 22, '#05060c');
    A.drawWire(c, -10, 160, W + 10, 108, 24, '#05060c');
    var dark = '#04050b', rimC = '#232a58';
    // galhos de araucária vindos do canto superior esquerdo
    var r = TC.RNG(8);
    for (var k = 0; k < 11; k++) {
      var a = 0.05 + k * 0.14 + r.range(-0.04, 0.04);
      var L = r.range(70, 150);
      var x0 = -20, y0 = -24;
      var x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
      c.fillStyle = TC.col(dark);
      TC.thickLine(c, x0, y0, x1, y1, 3);
      for (var q = 0; q < 3; q++) {
        var t = 0.55 + q * 0.2;
        var tx = x0 + (x1 - x0) * t, ty = y0 + (y1 - y0) * t;
        var s = 5 + q * 2;
        c.fillStyle = TC.col(dark);
        TC.fillEllipse(c, tx, ty, s * 1.8, s * 0.9);
        c.fillStyle = TC.col(rimC);
        for (var e = -s; e <= s; e += 2) c.fillRect(Math.round(tx + e * 1.6), Math.round(ty + s * 0.9 - 1 + Math.abs(e) * 0.15), 1, 1);
      }
    }
    // beirais das casas (silhuetas com borda iluminada pela lua)
    function roof(pts) {
      c.fillStyle = TC.col(dark);
      TC.fillPoly(c, pts);
      c.fillStyle = TC.col(rimC);
      for (var i = 0; i < pts.length - 1; i++) {
        var p = pts[i], q2 = pts[i + 1];
        var n = Math.max(Math.abs(q2[0] - p[0]), Math.abs(q2[1] - p[1]));
        for (var j = 0; j <= n; j++) c.fillRect(Math.round(p[0] + (q2[0] - p[0]) * j / n), Math.round(p[1] + (q2[1] - p[1]) * j / n), 1, 1);
      }
    }
    roof([[0, H], [0, 150], [34, 118], [58, 156], [88, 176], [96, H]]);
    roof([[W, H], [W, 168], [240, 140], [214, 170], [196, 188], [186, H]]);
    // janela apagada e enxaimel visto de baixo
    c.fillStyle = TC.col('#0c0e1c');
    c.fillRect(30, 190, 16, 20);
    c.fillStyle = TC.col('#14182c');
    c.fillRect(37, 190, 2, 20); c.fillRect(30, 199, 16, 2);
    // luminária na parede da direita
    c.fillStyle = TC.col('#16141c');
    TC.thickLine(c, 214, 186, 196, 172, 2);
    c.fillStyle = TC.col('#2a2a34');
    c.fillRect(188, 168, 12, 4);
    c.fillStyle = TC.col('#ffe0a0');
    c.fillRect(190, 172, 8, 2);
    w.scene = cv;
    w.tw = A.twinkles(W, 140, 40, 13);
    w.lamp = { x: 194, y: 174 };
  };

  /* ---------- atualização ---------- */
  IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.engineStop(0.2);
      TC.audio.stopMusic(0.5);
      TC.game.fadeTo(function () { return new TC.StageScene({ fromIntro: true }); }, 30);
    }
    this.dlg.update();
    this.script.update();
    var i;
    for (i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.type) tx.chars = Math.min(tx.str.length, tx.chars + 0.5);
    }
    if (this.shot === 'establish') {
      if (this.camY > 120) this.truckX += 0.9;
    } else if (this.shot === 'cab') {
      this.updateCab();
    }
  };

  IntroScene.prototype.updateCab = function () {
    var road = this.road;
    var t = this.t;
    road.position += this.speed;
    var curve = road.curveAt();
    road.skyX += curve * this.speed * 0.0016;
    var ch = this.chaos;
    var targetX = 0.25 - curve * 0.02;
    road.playerX += (targetX - road.playerX) * 0.03;
    var targetW = -curve * 0.11 + Math.sin(t * 0.07) * 0.015;
    if (ch > 0) {
      road.playerX += Math.sin(t * 0.21) * 0.09 * ch + ch * 0.02;
      targetW = Math.sin(t * 0.45) * 2.6 * ch + ch * 1.5;
      this.viewRot = Math.sin(t * 0.13) * 0.28 * ch + ch * 0.18;
      TC.fx.shake(1 + ch * 4, 4);
    }
    this.wheelAng += (targetW - this.wheelAng) * (ch > 0 ? 0.35 : 0.08);
    // terço como pêndulo
    var ros = this.ros;
    var lateral = curve * this.speed * 0.00035 + (ch > 0 ? Math.sin(t * 0.33) * 0.15 * ch : 0);
    ros.v += -0.012 * Math.sin(ros.a) - 0.02 * ros.v + lateral * 0.08 + (TC.rnd() - 0.5) * 0.002;
    ros.a += ros.v;
    ros.a = TC.clamp(ros.a, -1.4, 1.4);
    if (this.faceT > 0) this.faceT--;
    TC.audio.engineSet(0.4 + this.speed / 140 + ch * 0.4);
  };

  /* ---------- desenho ---------- */
  IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000';
    c.fillRect(0, 0, TC.W, TC.H);
    if (this.shot === 'establish') this.drawEstablish(c);
    else if (this.shot === 'cab') this.drawCab(c);
    else if (this.shot === 'wake') this.drawWake(c);
    for (var i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: tx.opt.align, shadow: tx.opt.shadow || '#000', max: tx.type ? Math.floor(tx.chars) : undefined });
      c.globalAlpha = 1;
    }
    this.dlg.draw(c);
    if (this.t < 420 && this.shot === 'card') {
      c.globalAlpha = TC.clamp((420 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };

  IntroScene.prototype.drawEstablish = function (c) {
    var e = this.e, cy = this.camY, t = this.t;
    var rest = 196 - cy;
    c.drawImage(e.sky, 0, Math.round(-cy * 0.35));
    A.drawTwinkles(c, e.tw, t, 0, Math.round(cy * 0.35));
    c.drawImage(e.moon, 186 - e.moon.width / 2, Math.round(36 + rest * 0.35 - e.moon.height / 2));
    c.drawImage(e.far, 0, Math.round(40 + rest * 0.6));
    c.globalAlpha = 0.3;
    c.drawImage(e.fog, -((t >> 2) % 512), Math.round(78 + rest * 0.7));
    c.globalAlpha = 1;
    c.drawImage(e.mid, 0, Math.round(62 + rest * 0.8));
    var ny = Math.round(92 + rest);
    c.drawImage(e.near, 0, ny);
    // caminhão com faróis
    var tx = Math.round(this.truckX);
    var ty = Math.round(ny + e.roadY(tx + 17) - 8);
    var hx = tx + 35, hy = ty + 7;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,220,140,0.16)';
    TC.fillPoly(c, [[hx, hy - 1], [hx + 70, hy - 8], [hx + 70, hy + 14]]);
    c.fillStyle = 'rgba(255,220,140,0.16)';
    TC.fillPoly(c, [[hx, hy], [hx + 44, hy - 3], [hx + 44, hy + 8]]);
    c.restore();
    var ang = Math.atan(0.16 + Math.cos((tx + 17) / 34) * 7 / 34);
    TC.drawRot(c, e.truck, tx + 17, ty + 5, ang, 128);
    TC.Lighting.glow(c, hx, hy, 5, '#ffe0a0', 0.9);
    c.fillStyle = '#ff3020';
    c.fillRect(tx + 2, ty + 7, 1, 1);
    // neblina no vale
    var fo = Math.round(t * 0.3) % 512;
    c.globalAlpha = 0.55;
    c.drawImage(e.fog, -fo, ny + 120); c.drawImage(e.fog, 512 - fo, ny + 120);
    c.globalAlpha = 0.35;
    c.drawImage(e.fog, -((fo * 2) % 512), ny + 160); c.drawImage(e.fog, 512 - ((fo * 2) % 512), ny + 160);
    c.globalAlpha = 1;
  };

  IntroScene.prototype.drawCab = function (c) {
    var k = this.k, road = this.road, t = this.t, self = this;
    var cv = road.render(function (rc, skyX, playerY) {
      if (self.startY == null) self.startY = playerY;
      var dy = TC.clamp((playerY - self.startY) * 0.004, -20, 30);
      rc.drawImage(k.sky, 0, Math.round(-8 + dy * 0.3));
      A.drawTwinkles(rc, k.tw, t, 0, 0);
      var mx = Math.round(184 - skyX * 1.5);
      mx = ((mx % 360) + 360) % 360 - 50;
      rc.globalAlpha = 1 - self.fogAmt * 0.8;
      rc.drawImage(k.moon, mx - k.moon.width / 2, Math.round(34 + dy * 0.3) - k.moon.height / 2);
      rc.globalAlpha = 1;
      // serra e mata do fundo: estão longe, então giram devagar (pouco mais que a lua) nas curvas
      var fo = Math.round(skyX * 3) % 512; if (fo < 0) fo += 512;
      var fy = Math.round(38 + dy * 0.4);
      rc.drawImage(k.far, -fo, fy); rc.drawImage(k.far, 512 - fo, fy);
      var no = Math.round(skyX * 5) % 512; if (no < 0) no += 512;
      var ny = Math.round(32 + dy * 0.6);
      rc.drawImage(k.near, -no, ny); rc.drawImage(k.near, 512 - no, ny);
      rc.fillStyle = TC.col('#0c0e22');
      rc.fillRect(0, ny + 52, TC.W, 150);
      if (self.fogAmt > 0) {
        rc.globalAlpha = self.fogAmt * 0.85;
        rc.fillStyle = TC.col('#3e3e5e');
        rc.fillRect(0, 0, TC.W, 150);
        rc.globalAlpha = 1;
      }
    });
    if (this.viewRot) {
      c.save();
      c.translate(128, 80);
      c.rotate(this.viewRot);
      c.scale(1.25, 1.25);
      c.drawImage(cv, -128, -80);
      c.restore();
    } else {
      c.drawImage(cv, 0, 0);
    }
    // rosto de relance (subliminar)
    if (this.faceT > 0 && this.faceT % 2 === 0) {
      c.globalAlpha = 0.85;
      c.drawImage(k.face, 128 - k.face.width / 2, 74 - k.face.height / 2);
      c.globalAlpha = 1;
    }
    // névoa clara dos faróis
    if (this.fogAmt > 0.2) {
      TC.Lighting.glow(c, 128, 120, 60, '#5a5a78', this.fogAmt * 0.35);
    }
    // cabine
    c.drawImage(k.overlay, 0, 0);
    A.drawRosary(c, 127, 28, this.ros.a);
    A.drawNeedle(c, 108, 167, this.speed / 110 + (this.chaos ? Math.random() * 0.1 : 0));
    A.drawNeedle(c, 148, 167, 0.3 + this.speed / 160 + this.chaos * 0.5);
    // painel aceso
    TC.Lighting.glow(c, 108, 167, 12, '#c08030', 0.12);
    TC.Lighting.glow(c, 148, 167, 12, '#c08030', 0.12);
    TC.font.draw(c, '104.5', 204, 162, this.radioStatic && t % 4 < 2 ? '#a0ffc0' : '#40d070', { align: 'center' });
    if (this.chaos > 0.2 && t % 8 < 4) { c.fillStyle = '#ff2010'; c.fillRect(128, 176, 2, 2); }
    A.drawArms(c, 128, 236, this.wheelAng);
    TC.drawRot(c, k.wheel, 128, 236, this.wheelAng, 128);
  };

  IntroScene.prototype.drawWake = function (c) {
    var w = this.w, t = this.t;
    var sx = Math.round(-14 + Math.sin(t * 0.025) * 4), sy = Math.round(-14 + Math.cos(t * 0.019) * 3);
    c.drawImage(w.scene, sx, sy);
    A.drawTwinkles(c, w.tw, t, -sx, -sy);
    TC.Lighting.glow(c, w.lamp.x + sx, w.lamp.y + sy, 30, '#ffb050', 0.45 + Math.sin(t * 0.3) * 0.04);
    TC.Lighting.glow(c, w.lamp.x + sx, w.lamp.y + sy, 10, '#ffe0a0', 0.6);
    // pálpebras
    var lid = Math.round((1 - this.lidOpen) * 114);
    if (lid > 0) {
      c.fillStyle = '#000';
      c.fillRect(0, 0, TC.W, lid);
      c.fillRect(0, TC.H - lid, TC.W, lid);
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillRect(0, lid, TC.W, 6);
      c.fillRect(0, TC.H - lid - 6, TC.W, 6);
    }
  };

  IntroScene.prototype.exit = function () { TC.fx.letterbox = 0; };
  TC.IntroScene = IntroScene;
})();
