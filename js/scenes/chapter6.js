'use strict';
/* Teewald City — Capítulo 6: "A Noite do Pelznickel"
   Prólogo: na Matriz, o Seu Arnoldo chega com a notícia das crianças levadas; na cabine, o Ewald no volante recita o
   Erlkönig, como fazia para o Arno guri; a porteira da Linha Esperança. Final: o mestre-escola de joelhos, o saco se abre,
   as crianças correm para casa, o Vogt vira pó de giz — e lá longe o sino da Matriz bate sete vezes sozinho. */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GY = 192;

  function say(dlg, who, key, face, pos) { return TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }
  function drawArno(c, ar, t) {
    var arr = A.arno[ar.pose] || A.arno.idle;
    var fr = ar.pose === 'run' ? arr[Math.floor(ar.anim / 5) % 8] : ar.pose === 'idle' ? arr[Math.floor(t / 32) % 2] : arr[0];
    var img = ar.face < 0 ? TC.flip(fr) : fr;
    var ox = ar.face < 0 ? fr.width - fr.ox : fr.ox;
    c.globalAlpha = ar.a == null ? 1 : ar.a;
    c.drawImage(img, Math.round(ar.x - ox), Math.round((ar.y || GY) - fr.oy + 1));
    c.globalAlpha = 1;
  }
  function fig(c, set, a, t) {
    if (!a || a.a <= 0) return;
    A.drawCast(c, set, a.pose, a.x, a.y || GY, a.face, t, a.anim, a.a == null ? 1 : a.a, a.tint);
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

  /* ==================================================================
     PRÓLOGO
     ================================================================== */
  function Ch6IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.C6 = A.ch6Init();
    this.C3 = A.ch3Init();
    this.CAST = A.castInit();
    this.arno = { x: 84, face: 1, pose: 'idle', anim: 0 };
    this.frida = { x: 196, face: -1, pose: 'cuia', anim: 0 };
    this.rosa = { x: 168, face: -1, pose: 'idle', anim: 0 };
    this.ewald = { x: 122, face: 1, pose: 'idle', anim: 0 };
    this.arnoldo = { x: -20, face: 1, pose: 'run', anim: 0, a: 0 };
    this.doorA = 0;
    this.prepareChurch();
    this.script = new TC.Script(this.run());
  }
  Ch6IntroScene.prototype.prepareChurch = function () {
    var cv = TC.canvas(W, H), c = cv.ctx;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#16142c', '#0a0814', y / H); c.fillRect(0, y, W, 1); }
    for (var k = 0; k < 4; k++) {
      var ax = 30 + k * 62;
      c.fillStyle = TC.col('#1e1c36'); c.fillRect(ax, 40, 10, 156);
      c.fillStyle = TC.col('#2a2846'); c.fillRect(ax, 40, 2, 156);
      if (k < 3) {
        var wx = ax + 22, wy = 56, ww = 20, wh = 60;
        c.fillStyle = TC.col('#0a0a16');
        TC.fillPoly(c, [[wx - 2, wy + wh + 2], [wx - 2, wy + 12], [wx + ww / 2, wy - 6], [wx + ww + 2, wy + 12], [wx + ww + 2, wy + wh + 2]]);
        var cols = ['#2a3a7a', '#5a2a4a', '#2a5a6a', '#6a5a2a', '#3a2a6a'];
        for (var yy = wy; yy < wy + wh; yy++) for (var xx = wx; xx < wx + ww; xx++) {
          var top = wy + 12 - (ww / 2 - Math.abs(xx - wx - ww / 2)) * 1.4;
          if (yy < top) continue;
          var cc = cols[(Math.floor(xx / 4) + Math.floor(yy / 5) + k) % 5];
          if ((xx - wx) % 7 === 0 || (yy - wy) % 9 === 0) cc = '#0a0a16';
          c.fillStyle = TC.col(cc); c.fillRect(xx, yy, 1, 1);
        }
      }
    }
    c.fillStyle = TC.col('#0c0a18');
    for (var x = 0; x < W; x++) { var vy = 30 - Math.round(Math.abs(Math.sin(x / 62 * Math.PI)) * 18); c.fillRect(x, 0, 1, vy + 8); }
    // altar
    c.fillStyle = TC.col('#3a2a20'); c.fillRect(206, 150, 50, 42);
    c.fillStyle = TC.col('#e8e0d0'); c.fillRect(204, 146, 54, 6);
    c.fillStyle = TC.col('#c8b070'); c.fillRect(204, 152, 54, 2); c.fillRect(230, 92, 3, 40); c.fillRect(223, 100, 17, 3);
    [212, 250].forEach(function (cx) { c.fillStyle = TC.col('#c8b070'); c.fillRect(cx, 130, 2, 16); c.fillRect(cx - 3, 144, 8, 2); c.fillStyle = TC.col('#e8e0d0'); c.fillRect(cx, 122, 2, 8); });
    // a porta grande de madeira (à esquerda) — o batente
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(0, 96, 26, 96);
    c.fillStyle = TC.col('#0a0606'); c.fillRect(2, 100, 22, 92);
    // chão de tábuas
    for (x = 0; x < W; x++) for (y = GY; y < H; y++) { c.fillStyle = TC.col(x % 24 === 0 ? '#1a1008' : (y - GY) % 6 === 0 ? '#2a1a10' : '#3a2616'); c.fillRect(x, y, 1, 1); }
    this.church = cv;
    var pew = TC.canvas(64, 30), p = pew.ctx;
    p.fillStyle = TC.col('#4a2e1c'); p.fillRect(0, 0, 4, 30); p.fillRect(60, 0, 4, 30);
    p.fillStyle = TC.col('#5a3a24'); p.fillRect(0, 8, 64, 4); p.fillRect(0, 16, 64, 3);
    p.fillStyle = TC.col('#6a4a2e'); p.fillRect(0, 8, 64, 1);
    p.fillStyle = TC.col('#2a1a10'); p.fillRect(6, 19, 2, 11); p.fillRect(56, 19, 2, 11);
    this.pew = pew;
    // a folha da porta (abre girando para fora)
    var door = TC.canvas(22, 92), d = door.ctx;
    d.fillStyle = TC.col('#4a2e1a'); d.fillRect(0, 0, 22, 92);
    d.fillStyle = TC.col('#3a2414'); for (x = 3; x < 22; x += 5) d.fillRect(x, 0, 1, 92);
    d.fillStyle = TC.col('#8a7a5a'); d.fillRect(17, 46, 2, 3);
    this.doorLeaf = door;
    this.fog = A.fog(256, 40, 61, '#8a8ab8');
  };
  Ch6IntroScene.prototype.enter = function () { TC.fx.bright = 0; TC.audio.ambience('windy'); };
  Ch6IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.audio.engineStop(0.3); TC.fx.letterbox = 0; };

  Ch6IntroScene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, ew = this.ewald, an = this.arnoldo;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    TC.fx.bright = 15;
    var t1 = text(TC.t('ch6.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('ch6.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('bell');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(100);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    yield* co.wait(20);

    // dentro da Matriz: o mate depois da noite da cobra de fogo
    this.shot = 'church';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.music('church');
    yield* co.wait(70);
    yield* say(dlg, 'frida', 'c6p.0');
    yield* say(dlg, 'ewald', 'c6p.0b');
    yield* co.wait(30);
    // a porta bate
    TC.audio.stopMusic(0.3);
    TC.audio.sfx('door');
    TC.audio.sfx('hit2');
    TC.fx.shake(3, 16);
    yield* co.tween(this, 'doorA', 1, 14);
    ar.face = -1; ew.face = -1;
    this.frida.pose = 'idle';
    an.a = 1;
    TC.audio.music('hunt', 0.4);
    while (an.x < 52) { an.x += 1.5; an.anim++; if (an.anim % 8 === 0) TC.audio.sfx('step'); yield; }
    an.pose = 'scared';
    yield* say(dlg, 'arnoldo', 'c6p.1');
    an.pose = 'point';
    yield* say(dlg, 'arnoldo', 'c6p.2');
    an.pose = 'scared';
    yield* co.wait(20);
    this.frida.face = 1;
    yield* say(dlg, 'frida', 'c6p.3');
    ar.face = 1; ar.pose = 'shock';
    yield* say(dlg, 'arno', 'c6p.4', 'shock');
    ar.pose = 'idle';
    yield* say(dlg, 'frida', 'c6p.5');
    this.rosa.pose = 'talk';
    yield* say(dlg, 'rosa', 'c6p.6');
    this.rosa.pose = 'idle';
    this.frida.pose = 'point';
    yield* say(dlg, 'frida', 'c6p.7');
    yield* say(dlg, 'frida', 'c6p.8');
    this.frida.pose = 'idle';
    ew.face = 1;
    yield* co.wait(20);
    TC.audio.sfx('c6keys');
    this.keysT = 1;
    yield* co.wait(30);
    ew.face = -1;
    yield* say(dlg, 'ewald', 'c6p.9');
    // saem pela porta
    ew.pose = 'walk'; ar.pose = 'run'; ar.face = -1;
    TC.audio.stopMusic(1.5);
    for (var i = 0; i < 70; i++) { ew.x -= 1.2; ew.anim++; ar.x -= 1.1; ar.anim++; yield; }
    TC.fx.fadeOut(40);
    yield* co.wait(46);

    // a cabine: o pai no volante, o filho no banco do carona
    this.prepareCab();
    this.shot = 'cab';
    TC.fx.letterbox = 0;
    TC.audio.ambience('night');
    TC.audio.engineStart();
    TC.audio.engineSet(0.45, 0.1);
    var t3 = text(TC.t('ch6.card3'), 128, 196, '#f0e0b0');
    TC.fx.fadeIn(50);
    yield* co.tween(t3, 'a', 1, 40);
    TC.audio.music('c6erl', 1.5);
    yield* co.wait(90);
    yield* co.tween(t3, 'a', 0, 40);
    this.texts = [];
    yield* say(dlg, 'ewald', 'c6c.1');
    yield* co.wait(20);
    yield* say(dlg, 'arno', 'c6c.2');
    yield* say(dlg, 'ewald', 'c6c.3');
    yield* co.wait(30);
    this.placeAhead(this.k.sign, 1.5, 18, 90);
    yield* say(dlg, 'arno', 'c6c.4');
    yield* co.wait(30);
    yield* say(dlg, 'ewald', 'c6c.5');
    yield* co.wait(60);
    yield* co.tween(this, 'speed', 0, 120);
    TC.audio.stopMusic(1.5);
    TC.fx.fadeOut(40);
    yield* co.wait(46);

    // a porteira da Linha Esperança nos faróis
    this.prepareGate();
    this.shot = 'gate';
    TC.fx.letterbox = 22;
    TC.audio.engineSet(0.3, 0.05);
    TC.fx.fadeIn(60);
    yield* co.wait(80);
    yield* say(dlg, 'arno', 'c6c.6');
    yield* say(dlg, 'ewald', 'c6c.7');
    yield* co.wait(40);
    TC.fx.fadeOut(60);
    TC.audio.engineStop(1.2);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 6 }); }, 10);
    while (true) yield;
  };

  /* ---------- a estrada da linha vista da cabine ---------- */
  Ch6IntroScene.prototype.prepareCab = function () {
    var k = this.k = {};
    var C6 = this.C6;
    k.overlay = C6.cabOverlay();
    k.wheel = A.wheel();
    k.profile = C6.ewaldProfile();
    k.knee = C6.arnoKnee();
    k.sky = A.sky(W, 90, [[0, '#020309'], [0.6, '#10123a'], [1, '#262a58']], 66, 0.007);
    k.tw = A.twinkles(W, 70, 22, 19);
    k.moon = A.moon(11);
    k.far = A.hills(512, 44, { seed: 61, color: '#14173a', rim: '#2a3064', base: 0.5, amp: 0.6, period: 6 });
    k.near = A.hills(512, 52, { seed: 63, color: '#0c0e22', rim: '#1e2448', base: 0.55, amp: 0.5, trees: 60, treeMin: 6, treeMax: 14, period: 6, arauc: 0.7 });
    k.arau = [1, 2, 3, 4].map(function (s) { return A.araucaria(s * 23, 100 + s * 8); });
    k.corn = [0, 1].map(function (s) { return C6.cornRow(60, 50, 90 + s); });
    k.post = (function () { var cv = TC.canvas(4, 26); cv.ctx.fillStyle = TC.col('#4a3420'); cv.ctx.fillRect(0, 0, 4, 26); return cv; })();
    k.estufa = C6.estufa(17, false);
    k.sign = (function () {
      var cv = TC.canvas(80, 54), c = cv.ctx;
      c.fillStyle = TC.col('#7a7a80'); c.fillRect(38, 26, 4, 28);
      c.fillStyle = TC.col('#e8e8e0'); c.fillRect(0, 0, 80, 28);
      c.fillStyle = TC.col('#1e6a3a'); c.fillRect(2, 2, 76, 24);
      TC.font.draw(c, 'LINHA ESPERANÇA', 40, 5, '#f0f0f0', { align: 'center' });
      TC.font.draw(c, '2 km', 40, 15, '#f0f0f0', { align: 'center' });
      return cv;
    })();
    var self = this, r = TC.RNG(1871);
    this.road = new TC.Road({ w: W, h: 150, horizon: 74, drawDist: 110, gen: function (rd) {
      var start = rd.segments.length;
      if (start === 0) rd.addRoad(20, 30, 20, 0, 0);
      else rd.addRoad(r.int(14, 26), r.int(10, 30), r.int(14, 26), r.pick([0, -2, 2, -3, 3, -4, 4]), r.pick([0, 10, -10, 18, -18]));
      var end = rd.segments.length;
      for (var i = start; i < end; i++) {
        if (i < 6) continue;
        var m = i % 4;
        if (m === 0 && r() < 0.55) rd.addSprite(i, r() < 0.6 ? r.pick(k.corn) : r.pick(k.arau), -(2.0 + r() * 4), r() < 0.6 ? 6 : r.range(24, 30));
        else if (m === 2 && r() < 0.45) rd.addSprite(i, r() < 0.5 ? r.pick(k.arau) : r.pick(k.corn), 2.0 + r() * 4, 24);
        if (i % 3 === 1) rd.addSprite(i, k.post, 1.25, 5);
        if (i % 90 === 45) rd.addSprite(i, k.estufa, -2.6, 14);
      }
    } });
    this.road.colors = { road: ['#3a302a', '#342b26'], grass: ['#16241a', '#132016'], rumble: ['#2e3a22', '#26321c'], edge: '#3a302a', center: '#3a302a' };
    this.road.fogColor = '#2a2c48';
    this.road.fogDist = 60;
    this.road.playerX = 0.0;
    this.speed = 42;
    this.wheelAng = 0;
    this.ros = { a: 0, v: 0 };
    this.startY = null;
  };
  Ch6IntroScene.prototype.placeAhead = function (cv, off, s, ahead) {
    var base = Math.floor(this.road.position / this.road.segLen);
    this.road.ensure();
    this.road.addSprite(base + ahead, cv, off, s);
  };
  Ch6IntroScene.prototype.prepareGate = function () {
    var g = this.g = {}, C6 = this.C6;
    g.sky = A.sky(W, H, [[0, '#03030c'], [0.5, '#0e0e2c'], [1, '#2a2650']], 1871, 0.008);
    g.tw = A.twinkles(W, 100, 30, 23);
    g.moon = A.moon(11);
    g.hills = A.hills(W, 80, { seed: 71, color: '#12142e', rim: '#262a58', base: 0.45, amp: 0.5, trees: 40, treeMin: 6, treeMax: 14, period: 3, arauc: 0.8 });
    g.por = TC.scaleCanvas(C6.porteira(), 1);
    g.tree = C6.bigTree(5);
    g.corn = C6.cornRow(256, 50, 404, { stalk: '#141c12', leaf: '#1a2416', leafL: '#22301c', tassel: '#5a5030', ear: '#3a3420' });
    g.fence = C6.fence(256);
    g.fog = A.fog(512, 50, 72, '#9a9ac8');
  };

  Ch6IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5);
      TC.audio.engineStop(0.2);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 6 }); }, 30);
    }
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.keysT) this.keysT++;
    if (this.shot === 'church') {
      if (this.t % 5 === 0) this.parts.add({ x: TC.rnd.range(180, 256), y: TC.rnd.range(100, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.15, 0.05), life: 120, color: '#ffe0a0', size: 1, fade: true, layer: 1 });
      if (this.doorA > 0.5 && this.t % 3 === 0) this.parts.add({ x: TC.rnd.range(0, 20), y: TC.rnd.range(110, 190), vx: TC.rnd.range(0.3, 1.0), vy: TC.rnd.range(-0.1, 0.1), life: 90, color: '#8a8ab8', size: 2, fade: true });
    }
    if (this.shot === 'cab') this.updateCab();
  };
  Ch6IntroScene.prototype.updateCab = function () {
    var road = this.road, t = this.t;
    road.position += this.speed;
    var curve = road.curveAt();
    road.skyX += curve * this.speed * 0.0016;
    var targetX = 0.0 - curve * 0.02;
    road.playerX += (targetX - road.playerX) * 0.03;
    var targetW = -curve * 0.11 + Math.sin(t * 0.06) * 0.012;
    this.wheelAng += (targetW - this.wheelAng) * 0.08;
    var ros = this.ros, lateral = curve * this.speed * 0.00035;
    ros.v += -0.012 * Math.sin(ros.a) - 0.02 * ros.v + lateral * 0.08 + (TC.rnd() - 0.5) * 0.002;
    ros.a = TC.clamp(ros.a + ros.v, -1.4, 1.4);
    TC.audio.engineSet(0.35 + this.speed / 140);
  };

  Ch6IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'church') this.drawChurch(c);
    else if (this.shot === 'cab') this.drawCab(c);
    else if (this.shot === 'gate') this.drawGate(c);
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

  Ch6IntroScene.prototype.drawChurch = function (c) {
    var t = this.t, pc = this.pf.ctx, self = this, CAST = this.CAST, C3 = this.C3;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.church, 0, 0);
    // a porta: aberta, a cerração entrando
    if (this.doorA > 0) {
      pc.fillStyle = TC.col('#1a1c34'); pc.fillRect(2, 100, 22, 92);
      var o = (t >> 1) % 256;
      pc.globalAlpha = 0.5 * this.doorA;
      pc.drawImage(this.fog, -o, 150); pc.drawImage(this.fog, 256 - o, 150);
      pc.globalAlpha = 1;
    }
    var dw = Math.max(2, Math.round(22 * (1 - this.doorA)));
    pc.drawImage(this.doorLeaf, 0, 0, 22, 92, 2, 100, dw, 92);
    pc.drawImage(this.pew, 132, GY - 30);
    fig(pc, C3.ewald, this.ewald, t);
    drawArno(pc, this.arno, t);
    fig(pc, CAST.rosa, this.rosa, t);
    fig(pc, CAST.frida, this.frida, t);
    if (this.arnoldo.a > 0) fig(pc, CAST.arnoldo, this.arnoldo, t);
    pc.drawImage(this.pew, 56, GY - 26);
    [[213, 121], [251, 121], [186, 142], [192, 144]].forEach(function (v, k) {
      var fl = (Math.floor(t / 5) + k) % 3;
      pc.fillStyle = '#ffe080'; pc.fillRect(v[0] + (fl === 1 ? -1 : fl === 2 ? 1 : 0), v[1] - 3, 1, 3);
    });
    // as chaves do caminhão na mão do Ewald
    if (this.keysT && this.keysT < 90) {
      var kx = Math.round(this.ewald.x + 8), ky = 150 + Math.round(Math.sin(this.keysT * 0.4) * 2);
      pc.fillStyle = '#c8c8d0'; pc.fillRect(kx, ky, 2, 4); pc.fillRect(kx + 2, ky + 2, 3, 1);
      pc.fillStyle = '#e8c040'; pc.fillRect(kx - 1, ky + 4, 4, 2);
    }
    this.parts.draw(pc, 0, 0, 0);
    var fl1 = 0.9 + Math.sin(t * 0.3) * 0.08 + TC.hash2(t >> 2, 3, 1) * 0.06;
    lit(this, c, '#3a3a68', function (L) {
      L.add(213, 118, 50 * fl1, '#ffb060', 1);
      L.add(251, 118, 50 * fl1, '#ffb060', 1);
      L.add(189, 138, 40 * fl1, '#ffa040', 0.9);
      L.add(110, 150, 70, '#a08070', 0.5);
      [61, 123, 185].forEach(function (x) { L.add(x, 90, 30, '#6a7ad0', 0.6); L.add(x + 30, 170, 34, '#5a6ab8', 0.35); });
      if (self.doorA > 0) L.add(14, 150, 60, '#7a80c0', 0.7 * self.doorA);
    });
    TC.Lighting.glow(c, 213, 119, 6, '#ffe0a0', 0.8 * fl1);
    TC.Lighting.glow(c, 251, 119, 6, '#ffe0a0', 0.8 * fl1);
    c.save();
    c.globalCompositeOperation = 'lighter';
    [61, 123, 185].forEach(function (x) { c.fillStyle = 'rgba(90,100,190,0.06)'; TC.fillPoly(c, [[x - 10, 60], [x + 12, 60], [x + 46, GY], [x + 10, GY]]); });
    c.restore();
    this.parts.draw(c, 0, 0, 1);
  };

  Ch6IntroScene.prototype.drawCab = function (c) {
    var k = this.k, road = this.road, t = this.t, self = this, C6 = this.C6;
    var cv = road.render(function (rc, skyX, playerY) {
      if (self.startY == null) self.startY = playerY;
      var dy = TC.clamp((playerY - self.startY) * 0.004, -20, 30);
      rc.drawImage(k.sky, 0, Math.round(-8 + dy * 0.3));
      A.drawTwinkles(rc, k.tw, t, 0, 0);
      var mx = ((Math.round(150 - skyX * 1.5) % 360) + 360) % 360 - 50;
      rc.globalAlpha = 0.75;
      rc.drawImage(k.moon, mx - k.moon.width / 2, Math.round(30 + dy * 0.3) - k.moon.height / 2);
      rc.globalAlpha = 1;
      var fo = Math.round(skyX * 3) % 512; if (fo < 0) fo += 512;
      rc.drawImage(k.far, -fo, Math.round(38 + dy * 0.4)); rc.drawImage(k.far, 512 - fo, Math.round(38 + dy * 0.4));
      var no = Math.round(skyX * 5) % 512; if (no < 0) no += 512;
      var ny = Math.round(32 + dy * 0.6);
      rc.drawImage(k.near, -no, ny); rc.drawImage(k.near, 512 - no, ny);
      rc.fillStyle = TC.col('#0c0e22'); rc.fillRect(0, ny + 52, W, 150);
      rc.globalAlpha = 0.35; rc.fillStyle = TC.col('#3a3a5e'); rc.fillRect(0, 0, W, 150); rc.globalAlpha = 1;
    });
    c.drawImage(cv, 0, 0);
    // luz dos faróis na cerração
    TC.Lighting.glow(c, 128, 118, 60, '#6a6a88', 0.3);
    c.drawImage(k.overlay, 0, 0);
    A.drawRosary(c, 127, 28, this.ros.a);
    A.drawNeedle(c, 50, 166, this.speed / 110);
    A.drawNeedle(c, 82, 166, 0.3 + this.speed / 160);
    TC.Lighting.glow(c, 50, 166, 11, '#c08030', 0.14);
    TC.Lighting.glow(c, 82, 166, 11, '#c08030', 0.14);
    TC.font.draw(c, '104.5', 132, 160, '#40d070', { align: 'center' });
    // o pai no volante: perfil na contraluz do painel, mangas da jaqueta de couro
    c.drawImage(k.profile, -16, 44);
    C6.drawEwaldArms(c, 62, 236, this.wheelAng);
    TC.drawRot(c, k.wheel, 62, 236, this.wheelAng, 128);
    // o joelho do Arno no banco do carona, com a mão em cima
    c.drawImage(k.knee, 176, 196);
  };

  Ch6IntroScene.prototype.drawGate = function (c) {
    var g = this.g, t = this.t;
    c.drawImage(g.sky, 0, 0);
    A.drawTwinkles(c, g.tw, t, 0, 0);
    c.drawImage(g.moon, 200 - g.moon.width / 2, 36 - g.moon.height / 2);
    c.drawImage(g.hills, 0, 96);
    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(g.tree, 220 - g.tree.baseX, GY + 1 - g.tree.height);
    pc.drawImage(g.corn, 0, GY + 2 - g.corn.height + 6);
    pc.drawImage(g.fence, -60, GY - 28);
    pc.drawImage(g.por, 150 - g.por.width / 2, GY + 1 - g.por.height);
    for (var x = 0; x < W; x += 16) { pc.drawImage(this.C6.T.roadTop[(x >> 4) % 2], x, GY); pc.drawImage(this.C6.T.earth[(x >> 4) % 2], x, GY + 16); }
    lit(this, c, '#2c2c50', function (L) {
      L.add(150, 150, 110, '#ffe0a0', 1.1);
      L.add(150, 120, 70, '#ffe0a0', 0.7);
      L.add(40, 180, 50, '#ffe0a0', 0.5);
    });
    // os fachos de luz dos faróis vindos da esquerda
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,224,160,0.12)';
    TC.fillPoly(c, [[-10, 176], [230, 120], [240, 196], [-10, 186]]);
    c.fillStyle = 'rgba(255,224,160,0.08)';
    TC.fillPoly(c, [[-10, 168], [256, 96], [256, 196], [-10, 190]]);
    c.restore();
    TC.Lighting.glow(c, 0, 180, 14, '#fff0c0', 0.8);
    c.globalAlpha = 0.5;
    var o = Math.round(t * 0.4) % 512;
    c.drawImage(g.fog, -o, 150); c.drawImage(g.fog, 512 - o, 150);
    c.drawImage(g.fog, -((o * 2) % 512), 176); c.drawImage(g.fog, 512 - ((o * 2) % 512), 176);
    c.globalAlpha = 1;
  };
  Ch6IntroScene.prototype.onHide = function () { };
  TC.Ch6IntroScene = Ch6IntroScene;

  /* ==================================================================
     FINAL: o mestre-escola, as crianças, as sete badaladas
     ================================================================== */
  function Ending6Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'yard';
    this.C6 = A.ch6Init(); this.C3 = A.ch3Init(); this.CAST = A.castInit(); A.ch2Init();
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.arno = { x: 112, face: 1, pose: 'idle', anim: 0 };
    this.vogt = { x: 156, face: -1, a: 1, pose: 'kneel' };
    this.sack = { x: 66, open: false, shake: 0 };
    var K = this.CAST.kids;
    this.kids = [
      { set: K.boy, x: 66, face: -1, pose: 'scared', a: 0, anim: 0 },
      { set: K.girl, x: 70, face: -1, pose: 'scared', a: 0, anim: 0 },
      { set: K.small, x: 62, face: -1, pose: 'scared', a: 0, anim: 0 }
    ];
    this.arnoldo = { x: -24, face: 1, pose: 'run', anim: 0, a: 1 };
    this.moms = [{ set: this.CAST.sleepers[0], x: -40, face: 1, pose: 'run', anim: 0, a: 1 }, { set: this.CAST.sleepers[2], x: -60, face: 1, pose: 'run', anim: 0, a: 1 }];
    this.ewald = { x: -30, face: 1, pose: 'walk', anim: 0, a: 1 };
    this.prepareYard();
    this.textA = 0;
    this.redMoon = 0;
    this.tolls = 0;
    this.rings = [];
    this.script = new TC.Script(this.run());
  }
  Ending6Scene.prototype.prepareYard = function () {
    var C6 = this.C6;
    this.sky = A.sky(W, H, [[0, '#03030c'], [0.5, '#0e0e2c'], [1, '#2a2650']], 66, 0.008);
    this.tw = A.twinkles(W, 100, 30, 29);
    this.moon = A.moon(12);
    this.moonRed = A.moon(12, true);
    this.hills = A.hills(W, 80, { seed: 73, color: '#12142e', rim: '#262a58', base: 0.45, amp: 0.5, trees: 40, treeMin: 6, treeMax: 14, period: 3, arauc: 0.8 });
    var yard = TC.canvas(W, H), c = yard.ctx;
    var sch = C6.school();
    c.drawImage(sch, -150, GY + 1 - sch.height);
    var est = C6.estufa(11, true);
    this.estX = W - 4 - est.width + 22; this.est = est;
    c.drawImage(est, this.estX, GY + 1 - est.height);
    c.drawImage(C6.bellPost(), 92, GY + 1 - 70);
    c.drawImage(C6.tobaccoRack(60, 31), 168, GY + 1 - 40);
    for (var x = 0; x < W; x += 16) { c.drawImage(C6.T.yardTop[(x >> 4) % 2], x, GY); c.drawImage(C6.T.earth[(x >> 4) % 2], x, GY + 16); }
    this.yard = yard;
    this.fogBand = A.fog(512, 52, 74, '#9a9ac8');
    // o vale de Teewald lá embaixo, com a torre da Matriz
    this.valleyFar = A.hills(W, 70, { seed: 81, color: '#181a3c', rim: '#2e3470', base: 0.4, amp: 0.6, trees: 30, treeMin: 4, treeMax: 8, period: 3 });
    this.valleyNear = A.hills(W, 90, { seed: 83, color: '#0c0e22', rim: '#1e2448', base: 0.3, amp: 0.8, trees: 50, treeMin: 6, treeMax: 16, period: 3, arauc: 0.9 });
    this.spire = TC.silhouette(TC.scaleCanvas(A.church(), 0.22), '#0a0c1e');
    var town = TC.canvas(140, 40), tc = town.ctx, r = TC.RNG(7);
    for (var k = 0; k < 16; k++) {
      var hx = r.int(0, 130), hw = r.int(8, 14), hh = r.int(6, 12);
      tc.fillStyle = TC.col('#0a0c1e'); tc.fillRect(hx, 40 - hh, hw, hh); TC.fillPoly(tc, [[hx - 1, 40 - hh], [hx + hw / 2, 40 - hh - 5], [hx + hw + 1, 40 - hh]]);
      if (r() < 0.6) { tc.fillStyle = TC.col('#e8b050'); tc.fillRect(hx + 2 + r.int(0, hw - 5), 40 - hh + 3, 1, 2); }
    }
    this.town = town;
  };
  Ending6Scene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.ambience('night');
  };
  Ending6Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ending6Scene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, vg = this.vogt, i;
    yield* co.wait(70);
    TC.audio.music('c6school', 2);
    yield* say(dlg, 'vogt', 'e6.1', 'sad');
    yield* say(dlg, 'arno', 'e6.2');
    yield* say(dlg, 'vogt', 'e6.3', 'sad');
    yield* say(dlg, 'vogt', 'e6.4', 'sad');
    // o saco se abre
    TC.audio.sfx('c6sack');
    this.sack.shake = 30;
    yield* co.wait(40);
    TC.audio.sfx('c6tuft');
    this.sack.open = true;
    for (i = 0; i < 16; i++) this.parts.add({ x: this.sack.x + TC.rnd.range(-10, 10), y: GY - 14, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2, -0.5), ay: 0.1, life: 40, color: TC.rnd.pick(['#8a7044', '#a08858', '#c8b080']), size: 1, fade: true });
    for (i = 0; i < 40; i++) { this.kids.forEach(function (kd, k) { kd.a = Math.min(1, i / 30); kd.x = self.sack.x + (k - 1) * 12 * Math.min(1, i / 30); }); yield; }
    yield* co.wait(30);
    // o Seu Arnoldo e as mães chegando correndo
    TC.audio.music('c6home', 1.5);
    var an = this.arnoldo;
    while (an.x < 22) { an.x += 1.4; an.anim++; this.moms.forEach(function (m) { m.x += 1.4; m.anim++; }); yield; }
    an.pose = 'idle';
    this.moms.forEach(function (m) { m.pose = 'awake'; });
    var lena = this.kids[1];
    lena.pose = 'walk'; lena.face = -1;
    yield* say(dlg, 'lena', 'e6.5');
    while (lena.x > an.x + 12) { lena.x -= 1.2; lena.anim++; yield; }
    lena.pose = 'idle';
    yield* say(dlg, 'arnoldo', 'e6.6');
    this.kids[0].pose = 'walk'; this.kids[2].pose = 'walk';
    var tg = [this.moms[0].x + 12, this.moms[1].x + 12];
    for (i = 0; i < 80; i++) {
      [0, 2].forEach(function (k, j) { var kd = self.kids[k]; if (kd.x > tg[j]) { kd.x -= 1.1; kd.anim++; } else kd.pose = 'idle'; });
      yield;
    }
    this.kids[0].pose = 'idle'; this.kids[2].pose = 'idle';
    // o Ewald chega também
    var ew = this.ewald;
    while (ew.x < 88) { ew.x += 0.9; ew.anim++; yield; }
    ew.pose = 'idle';
    yield* co.wait(30);
    // o mestre-escola se desfaz em pó de giz
    ar.face = 1;
    yield* say(dlg, 'vogt', 'e6.7', 'sad');
    TC.audio.stopMusic(2);
    TC.audio.sfx('c6chalk');
    for (i = 0; i < 120; i++) {
      vg.a = 1 - i / 120;
      if (i % 2 === 0) for (var q = 0; q < 3; q++) this.parts.add({ x: vg.x + TC.rnd.range(-10, 10), y: GY - TC.rnd.range(4, 56), vx: TC.rnd.range(0.1, 0.8), vy: TC.rnd.range(-0.8, -0.1), life: 90, colors: ['#ffffff', '#e8e8e0', '#a8a8a0'], size: TC.rnd.int(1, 2), fade: true, wobble: 0.08 });
      if (i % 30 === 0) TC.audio.sfx('c6chalk');
      yield;
    }
    vg.a = 0;
    yield* co.wait(60);
    // longe, o sino da Matriz
    TC.audio.sfx('c6toll');
    this.tolls = 1;
    ar.pose = 'shock';
    yield* co.wait(90);
    TC.fx.fadeOut(40);
    yield* co.wait(46);

    // o vale: a cerração de todas as linhas escorre para a cidade, a lua fica vermelha
    this.phase = 'valley';
    TC.fx.fadeIn(50);
    for (var n = 2; n <= 7; n++) {
      yield* co.wait(n === 2 ? 40 : 70);
      TC.audio.sfx('c6toll');
      this.tolls = n;
      this.rings.push({ t: 0 });
      this.redMoon = Math.min(1, (n - 1) / 6);
    }
    yield* co.wait(90);
    yield* say(dlg, 'ewald', 'e6.8');
    yield* say(dlg, 'arno', 'e6.9');
    this.cap = 0;
    for (i = 0; i < 180; i++) { this.cap = Math.min(TC.t('e6.cap').length, this.cap + 0.45); yield; }
    yield* co.wait(150);
    TC.fx.fadeOut(80);
    yield* co.wait(90);

    // fim do capítulo
    TC.fx.letterbox = 0;
    this.phase = 'tbc';
    TC.fx.bright = 15;
    TC.audio.sfx('c6toll');
    yield* co.tween(this, 'textA', 1, 90);
    this.tbcChars = 0;
    for (i = 0; i < 80; i++) { this.tbcChars += 0.35; yield; }
    var w = 0;
    while (w++ < 360 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);

    // créditos curtos
    this.phase = 'credits';
    TC.audio.music('c6home');
    this.credY = H + 10;
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred6.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred6.3', 1, '#a0a8d0'], ['cred6.4', 1, '#e0e0f0'], ['cred6.5', 1, '#e0e0f0'], ['cred6.6', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['cred.3', 1, '#a0a8d0'], ['cred.4', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['@score', 1, '#ffe060'], ['', 1], ['', 1], ['cred.8', 2, '#ffd890']
    ];
    this.credH = this.credLines.length * 16 + 20;
    while (this.credY > -this.credH + 70) {
      this.credY -= TC.input.down('confirm') || TC.input.down('jump') ? 1.6 : 0.36;
      yield;
    }
    yield* co.wait(60);
    TC.audio.stopMusic(1.5);
    // a história continua: a noite das sete badaladas na Matriz (capítulo 7)
    TC.game.fadeTo(function () { return TC.chapterReady(7) ? TC.chapterStart(7) : new TC.TitleScene(); }, 60);
    while (true) yield;
  };

  Ending6Scene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.sack.shake > 0) this.sack.shake--;
    this.rings.forEach(function (r) { r.t++; });
    this.rings = this.rings.filter(function (r) { return r.t < 120; });
    if (this.phase === 'yard' && this.t % 4 === 0) {
      var fx = this.estX + this.est.furnaceX;
      this.parts.add({ x: fx + TC.rnd.range(-6, 6), y: GY - 6, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-1, -0.4), life: 26, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    }
  };

  Ending6Scene.prototype.draw = function (c) {
    if (this.phase === 'yard') this.drawYard(c);
    else if (this.phase === 'valley') this.drawValley(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else this.drawCredits(c);
    this.dlg.draw(c);
  };

  Ending6Scene.prototype.drawYard = function (c) {
    var t = this.t, self = this, C6 = this.C6, CAST = this.CAST;
    c.drawImage(this.sky, 0, 0);
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moon, 210 - this.moon.width / 2, 34 - this.moon.height / 2);
    c.drawImage(this.hills, 0, 100);
    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.yard, 0, 0);
    // o saco
    var sk = this.sack;
    if (sk.open) { var o = C6.sackOpenImg; pc.drawImage(o, Math.round(sk.x - o.ox), GY - o.oy + 1); }
    else { var fr = C6.kidSackImg[sk.shake > 0 ? 1 + ((t >> 2) % 2) : (t % 200 < 20 ? 1 : 0)]; pc.drawImage(fr, Math.round(sk.x - fr.ox), GY - fr.oy + 1); }
    this.moms.forEach(function (m) { fig(pc, m.set, m, t); });
    fig(pc, CAST.arnoldo, this.arnoldo, t);
    this.kids.forEach(function (kd) { fig(pc, kd.set, kd, t); });
    fig(pc, this.C3.ewald, this.ewald, t);
    drawArno(pc, this.arno, t);
    if (this.vogt.a > 0) {
      var vf = C6.vogt.kneel[0], vx = Math.round(this.vogt.x - (vf.width - vf.ox));
      pc.globalAlpha = this.vogt.a;
      pc.drawImage(TC.flip(vf), vx, GY - vf.oy + 1);
      pc.globalAlpha = 1;
    }
    this.parts.draw(pc, 0, 0, 0);
    var fx = this.estX + this.est.furnaceX;
    lit(this, c, '#34345c', function (L) {
      L.add(fx, GY - 10, 80 + Math.sin(t * 0.3) * 4, '#ff9040', 1.1);
      L.add(self.arno.x, GY - 16, 46, '#a0a0c8', 0.5);
      if (self.vogt.a > 0) L.add(self.vogt.x, GY - 40, 30, '#e0e8d0', 0.4 * self.vogt.a);
    });
    TC.Lighting.glow(c, fx, GY - 10, 10, '#ffb060', 0.5);
    this.parts.draw(c, 0, 0, 1);
    c.globalAlpha = 0.35;
    var fo = (t >> 1) % 512;
    c.drawImage(this.fogBand, -fo, 168); c.drawImage(this.fogBand, 512 - fo, 168);
    c.globalAlpha = 1;
  };

  Ending6Scene.prototype.drawValley = function (c) {
    var t = this.t, i, self = this;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix(TC.mix('#03030c', '#140408', this.redMoon * 0.6), TC.mix('#2a2650', '#4a1a28', this.redMoon * 0.7), y / H); c.fillRect(0, y, W, 1); }
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moon, 196 - this.moon.width / 2, 40 - this.moon.height / 2);
    if (this.redMoon > 0) {
      c.globalAlpha = this.redMoon; c.drawImage(this.moonRed, 196 - this.moonRed.width / 2, 40 - this.moonRed.height / 2); c.globalAlpha = 1;
      TC.Lighting.glow(c, 196, 40, 40, '#ff4030', 0.25 * this.redMoon);
    }
    c.drawImage(this.valleyFar, 0, 96);
    // a cidade lá embaixo, com a torre da Matriz
    var sx = 118, sy = 160;
    c.drawImage(this.town, sx - 70, sy - 36);
    c.drawImage(this.spire, sx - Math.round(this.spire.width / 2), sy - this.spire.height);
    this.rings.forEach(function (r) {
      var rr = 4 + r.t * 0.9;
      c.globalAlpha = Math.max(0, 0.5 - r.t / 240);
      c.fillStyle = '#d0c8ff';
      for (var a = 0; a < TC.TAU; a += 0.06) c.fillRect(Math.round(sx + Math.cos(a) * rr), Math.round(sy - self.spire.height + 10 + Math.sin(a) * rr * 0.5), 1, 1);
      c.globalAlpha = 1;
    });
    if (this.tolls > 0 && t % 120 < 60) TC.Lighting.glow(c, sx, sy - this.spire.height + 10, 8, '#ffe0a0', 0.35);
    // a cerração das linhas descendo como um rio
    var fb = this.fogBand;
    for (i = 0; i < 4; i++) {
      var o = Math.round(t * (0.6 + i * 0.25)) % 512;
      c.globalAlpha = 0.25 + i * 0.08;
      var yy = 120 + i * 14;
      c.drawImage(fb, -512 + o, yy); c.drawImage(fb, o, yy);
      c.drawImage(fb, W + 512 - o - 512, yy + 6); c.drawImage(fb, W - o, yy + 6);
    }
    c.globalAlpha = 1;
    c.drawImage(this.valleyNear, 0, 136);
    c.globalAlpha = 0.5;
    var o2 = Math.round(t * 0.8) % 512;
    c.drawImage(fb, -o2, 176); c.drawImage(fb, 512 - o2, 176);
    c.globalAlpha = 1;
    if (this.tolls > 0) TC.font.draw(c, String(this.tolls), 248, 30, '#c8b0b0', { align: 'right', shadow: '#000' });
    if (this.cap != null) TC.font.draw(c, TC.t('e6.cap'), 128, 206, '#fff0d0', { align: 'center', shadow: '#000', max: Math.floor(this.cap) });
  };

  Ending6Scene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end6.chapter'), 2, '#ffffff', '#c06060', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 84);
    if (this.tbcChars) TC.font.draw(c, TC.t('end6.next'), 128, 120, '#c8a878', { align: 'center', max: Math.floor(this.tbcChars) });
    c.globalAlpha = 1;
  };

  Ending6Scene.prototype.drawCredits = function (c) {
    var t = this.t;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#140408', '#4a1a28', y / H); c.fillRect(0, y, W, 1); }
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moonRed, 196 - this.moonRed.width / 2, 40 - this.moonRed.height / 2);
    c.drawImage(this.valleyNear, 0, 134);
    c.fillStyle = 'rgba(0,0,10,0.45)'; c.fillRect(0, 0, W, H);
    var yy0 = this.credY, self = this;
    this.credLines.forEach(function (l, k) {
      var yy = Math.round(yy0 + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) {
        var b = TC.ui.bigText(str, l[1], l[2], '#c06060', '#000000');
        c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4);
      } else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
  };
  TC.Ending6Scene = Ending6Scene;
})();

TC.READY[6] = true;
