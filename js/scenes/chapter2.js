'use strict';
/* Teewald City — Capítulo 2: "A Trilha das Fitas"
   Prólogo: dentro da igreja, a Dona Frida conta a lenda do Antigo (painéis ilustrados) e entrega o 38 do Arno.
   Final: o toco do Pinheiro Velho se abre, uma bandinha toca lá embaixo... e alguém chama o Arno. */
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

  /* ==================================================================
     PRÓLOGO
     ================================================================== */
  function Ch2IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.arno = { x: 98, y: 186, face: 1, pose: 'sit', a: 1, anim: 0 };
    this.frida = { x: 184, a: 1, cuia: true };
    this.panel = null;
    this.panelA = 0;
    this.gunShow = 0;
    this.prepare();
    this.script = new TC.Script(this.run());
  }

  Ch2IntroScene.prototype.prepare = function () {
    A.ch2Init();
    // interior da igreja: nave escura, colunas, vitrais com a lua, bancos e altar
    var cv = TC.canvas(W, H), c = cv.ctx;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#14122a', '#0a0814', y / H); c.fillRect(0, y, W, 1); }
    // arcos ogivais e colunas
    for (var k = 0; k < 4; k++) {
      var ax = 8 + k * 66;
      c.fillStyle = TC.col('#1e1c36');
      c.fillRect(ax, 40, 10, 156);
      c.fillStyle = TC.col('#2a2846');
      c.fillRect(ax, 40, 2, 156);
      // vitral
      if (k < 3) {
        var wx = ax + 24, wy = 56, ww = 22, wh = 64;
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
    // abóbada
    c.fillStyle = TC.col('#0c0a18');
    for (var x = 0; x < W; x++) { var vy = 30 - Math.round(Math.abs(Math.sin(x / 66 * Math.PI)) * 18); c.fillRect(x, 0, 1, vy + 8); }
    // altar
    c.fillStyle = TC.col('#3a2a20'); c.fillRect(196, 150, 56, 42);
    c.fillStyle = TC.col('#e8e0d0'); c.fillRect(194, 146, 60, 6);
    c.fillStyle = TC.col('#c8b070'); c.fillRect(194, 152, 60, 2);
    c.fillStyle = TC.col('#c8b070'); c.fillRect(223, 92, 3, 40); c.fillRect(216, 100, 17, 3);
    // castiçais
    [202, 246].forEach(function (cx) { c.fillStyle = TC.col('#c8b070'); c.fillRect(cx, 130, 2, 16); c.fillRect(cx - 3, 144, 8, 2); c.fillStyle = TC.col('#e8e0d0'); c.fillRect(cx, 122, 2, 8); });
    // chão de tábuas
    for (x = 0; x < W; x++) for (y = GY; y < H; y++) {
      c.fillStyle = TC.col(x % 24 === 0 ? '#1a1008' : (y - GY) % 6 === 0 ? '#2a1a10' : '#3a2616');
      c.fillRect(x, y, 1, 1);
    }
    this.church = cv;
    // bancos (na frente do Arno e atrás)
    var pew = TC.canvas(70, 30), p = pew.ctx;
    p.fillStyle = TC.col('#4a2e1c'); p.fillRect(0, 0, 4, 30); p.fillRect(66, 0, 4, 30);
    p.fillStyle = TC.col('#5a3a24'); p.fillRect(0, 8, 70, 4); p.fillRect(0, 16, 70, 3);
    p.fillStyle = TC.col('#6a4a2e'); p.fillRect(0, 8, 70, 1);
    p.fillStyle = TC.col('#2a1a10'); p.fillRect(6, 19, 2, 11); p.fillRect(62, 19, 2, 11);
    this.pew = pew;
    this.frid = A.frida || null;
    this.fog = A.fog(512, 52, 44, '#8a8ab8');
  };

  Ch2IntroScene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.audio.ambience('windy');
  };
  Ch2IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ch2IntroScene.prototype.run = function* () {
    var self = this, ar = this.arno, dlg = this.dlg;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    // cartão do capítulo
    TC.fx.bright = 15;
    var t1 = text(TC.t('ch2.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('ch2.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('bell');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(110);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    yield* co.wait(20);

    // dentro da igreja
    this.shot = 'church';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.music('church');
    yield* co.wait(80);
    yield* say(dlg, 'frida', 'p2.1');
    ar.pose = 'idle';
    yield* say(dlg, 'arno', 'p2.2');
    yield* say(dlg, 'frida', 'p2.3');
    TC.audio.stopMusic(1.5);

    // a lenda, em quatro quadros
    var panels = [['ship', ['p2.l1', 'p2.l2']], ['tree', ['p2.l3', 'p2.l4']], ['dance', ['p2.l5', 'p2.l6']], ['cut', ['p2.l7', 'p2.l8', 'p2.l9']]];
    TC.audio.music('lore');
    for (var i = 0; i < panels.length; i++) {
      this.panel = panels[i][0];
      this.panelT = 0;
      yield* co.tween(this, 'panelA', 1, 30);
      yield* co.wait(30);
      for (var j = 0; j < panels[i][1].length; j++) yield* say(dlg, 'frida', panels[i][1][j], null, 'bottom');
      yield* co.tween(this, 'panelA', 0, 30);
    }
    this.panel = null;
    TC.audio.music('church');

    // a missão
    yield* say(dlg, 'arno', 'p2.4');
    yield* say(dlg, 'frida', 'p2.5');
    yield* say(dlg, 'frida', 'p2.6');
    yield* say(dlg, 'arno', 'p2.7');
    // o revólver do porta-luvas
    TC.audio.sfx('reload');
    yield* co.tween(this, 'gunShow', 1, 30);
    yield* say(dlg, 'frida', 'p2.8');
    ar.pose = 'shock';
    yield* say(dlg, 'arno', 'p2.9', 'shock');
    yield* say(dlg, 'frida', 'p2.10');
    ar.pose = 'idle';
    yield* co.tween(this, 'gunShow', 0, 20);
    yield* say(dlg, 'frida', 'p2.11');
    yield* say(dlg, 'arno', 'p2.12');
    // levanta e sai pela porta
    ar.face = -1; ar.pose = 'run';
    while (ar.x > 30) { ar.x -= 1.1; ar.anim++; yield; }
    TC.audio.sfx('door');
    TC.fx.fadeOut(60);
    TC.audio.stopMusic(1.5);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 2 }); }, 10);
    while (true) yield;
  };

  Ch2IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 2 }); }, 30);
    }
    if (this.panelT != null) this.panelT++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.shot === 'church' && this.t % 5 === 0) {
      // poeira dourada nas luzes das velas
      this.parts.add({ x: TC.rnd.range(170, 256), y: TC.rnd.range(100, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.15, 0.05), life: 120, color: '#ffe0a0', size: 1, fade: true, layer: 1 });
    }
  };

  Ch2IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'church') this.drawChurch(c);
    for (var i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
    if (this.panel && this.panelA > 0) this.drawPanel(c);
    this.dlg.draw(c);
    if (this.t < 400) {
      c.globalAlpha = TC.clamp((400 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };

  Ch2IntroScene.prototype.drawChurch = function (c) {
    var t = this.t, pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    pc.drawImage(this.church, 0, 0);
    pc.drawImage(this.pew, 20, GY - 30);
    // Arno sentado no banco da frente
    drawArno(pc, this.arno, t);
    pc.drawImage(this.pew, 100, GY - 30);
    // Dona Frida com a cuia
    var F = this.frid;
    if (F) pc.drawImage(F, Math.round(this.frida.x - 6), GY - F.height + 1);
    // velas acesas no altar
    [[203, 121], [247, 121]].concat([[176, 140], [182, 142]]).forEach(function (v, k) {
      var fl = (Math.floor(t / 5) + k) % 3;
      pc.fillStyle = '#ffe080'; pc.fillRect(v[0] + (fl === 1 ? -1 : fl === 2 ? 1 : 0), v[1] - 3, 1, 3);
    });
    this.parts.draw(pc, 0, 0, 0);
    var L = this.light;
    L.begin('#3a3a68');
    var fl1 = 0.9 + Math.sin(t * 0.3) * 0.08 + TC.hash2(t >> 2, 3, 1) * 0.06;
    L.add(203, 118, 50 * fl1, '#ffb060', 1);
    L.add(247, 118, 50 * fl1, '#ffb060', 1);
    L.add(179, 136, 40 * fl1, '#ffa040', 0.9);
    // luar pelos vitrais
    [43, 109, 175].forEach(function (x) { L.add(x, 90, 30, '#6a7ad0', 0.6); L.add(x + 30, 170, 34, '#5a6ab8', 0.35); });
    // de vez em quando uma cabeça-de-fogo passa lá fora
    var pass = (t % 520) / 520;
    if (pass < 0.25) { var px = -20 + pass * 4 * 300; L.add(px, 80, 40, '#ff9040', 0.9); }
    this.mask.ctx.clearRect(0, 0, W, H);
    this.mask.ctx.drawImage(this.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);
    TC.Lighting.glow(c, 203, 119, 6, '#ffe0a0', 0.8 * fl1);
    TC.Lighting.glow(c, 247, 119, 6, '#ffe0a0', 0.8 * fl1);
    if (pass < 0.25) TC.Lighting.glow(c, -20 + pass * 1200, 80, 14, '#ff8030', 0.4);
    // feixes de luar
    c.save();
    c.globalCompositeOperation = 'lighter';
    [43, 109, 175].forEach(function (x) {
      c.fillStyle = 'rgba(90,100,190,0.06)';
      TC.fillPoly(c, [[x - 10, 60], [x + 12, 60], [x + 46, GY], [x + 10, GY]]);
    });
    c.restore();
    this.parts.draw(c, 0, 0, 1);
    // o 38 em destaque
    if (this.gunShow > 0) {
      var g = A.items.revolver;
      c.globalAlpha = this.gunShow;
      c.fillStyle = 'rgba(0,0,8,0.6)'; c.fillRect(100, 92, 56, 34);
      TC.ui.box(c, 98, 90, 60, 38, 'dark', 0.9);
      c.drawImage(TC.scaleCanvas(g, 3), 128 - g.width * 1.5, 96);
      c.globalAlpha = 1;
    }
  };

  /* ---------- painéis da lenda (estilo livro de histórias, em tons de sépia e azul) ---------- */
  Ch2IntroScene.prototype.drawPanel = function (c) {
    var t = this.panelT || 0, a = this.panelA;
    var px = 16, py = 28, pw = 224, ph = 108;
    c.globalAlpha = a;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    var cv = this.panelCv || (this.panelCv = TC.canvas(pw, ph));
    var p = cv.ctx;
    p.clearRect(0, 0, pw, ph);
    if (this.panel === 'ship') this.panelShip(p, pw, ph, t);
    else if (this.panel === 'tree') this.panelTree(p, pw, ph, t);
    else if (this.panel === 'dance') this.panelDance(p, pw, ph, t);
    else this.panelCut(p, pw, ph, t);
    c.drawImage(cv, px, py);
    // moldura
    c.fillStyle = '#c8a870'; c.fillRect(px - 3, py - 3, pw + 6, 2); c.fillRect(px - 3, py + ph + 1, pw + 6, 2);
    c.fillRect(px - 3, py - 3, 2, ph + 6); c.fillRect(px + pw + 1, py - 3, 2, ph + 6);
    c.fillStyle = '#6a4a28'; c.fillRect(px - 1, py - 1, pw + 2, 1); c.fillRect(px - 1, py + ph, pw + 2, 1);
    c.fillRect(px - 1, py - 1, 1, ph + 2); c.fillRect(px + pw, py - 1, 1, ph + 2);
    [[px - 4, py - 4], [px + pw, py - 4], [px - 4, py + ph], [px + pw, py + ph]].forEach(function (q) { c.fillStyle = '#e8d090'; c.fillRect(q[0], q[1], 4, 4); });
    c.globalAlpha = 1;
  };
  function skyGrad(p, w, h, top, bot) { for (var y = 0; y < h; y++) { p.fillStyle = TC.mix(top, bot, y / h); p.fillRect(0, y, w, 1); } }

  // 1852: o veleiro no mar escuro, e dois olhos no porão
  Ch2IntroScene.prototype.panelShip = function (p, w, h, t) {
    skyGrad(p, w, h, '#0a0c22', '#2a2a4a');
    var moon = this.pMoon || (this.pMoon = A.moon(8));
    p.drawImage(moon, 170 - moon.width / 2, 26 - moon.height / 2);
    for (var i = 0; i < 30; i++) { p.fillStyle = '#8088b8'; p.fillRect((i * 53) % w, (i * 31) % 50, 1, 1); }
    // mar
    for (var y = 84; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var wv = Math.sin(x * 0.12 + t * 0.05 + y * 0.6) > 0.82;
        p.fillStyle = wv ? '#3a4a7a' : TC.mix('#141a3a', '#0a0c1e', (y - 84) / (h - 84));
        p.fillRect(x, y, 1, 1);
      }
    }
    // reflexo da lua
    for (y = 86; y < h; y += 3) { var rw = 6 + Math.round(Math.sin(y + t * 0.1) * 3); p.fillStyle = '#8a90c0'; p.fillRect(170 - rw / 2, y, rw, 1); }
    // veleiro balançando
    var bob = Math.sin(t * 0.04) * 2, rot = Math.sin(t * 0.03) * 0.04;
    p.save();
    p.translate(90, 86 + bob);
    p.rotate(rot);
    p.fillStyle = '#0a0806';
    TC.fillPoly(p, [[-46, -8], [44, -8], [34, 8], [-38, 8]]);
    p.fillRect(-2, -66, 3, 60); p.fillRect(-30, -50, 2, 44); p.fillRect(26, -46, 2, 40);
    p.fillStyle = '#d8ccb0';
    TC.fillPoly(p, [[2, -62], [24, -50], [24, -14], [2, -14]]);
    TC.fillPoly(p, [[-26, -46], [-4, -40], [-4, -14], [-26, -14]]);
    p.fillStyle = '#b0a488';
    TC.fillPoly(p, [[30, -42], [44, -20], [30, -16]]);
    // olhos no porão
    if ((t >> 5) % 4 !== 3) { p.fillStyle = '#e0f4ff'; p.fillRect(-14, -2, 2, 1); p.fillRect(-9, -2, 2, 1); }
    p.restore();
    TC.font.draw(p, '1852', w - 8, h - 14, '#e8d090', { align: 'right', shadow: '#000' });
  };
  // o Pinheiro Velho, com o bicho amarrado nas raízes e a Oma Hedwig com o lampião
  Ch2IntroScene.prototype.panelTree = function (p, w, h, t) {
    skyGrad(p, w, 80, '#0c0e26', '#22264c');
    // terra em corte
    for (var y = 80; y < h; y++) { p.fillStyle = TC.mix('#2a1c14', '#120c08', (y - 80) / (h - 80)); p.fillRect(0, y, w, 1); }
    var ar = this.pArau || (this.pArau = A.araucaria(1852, 86, { sil: '#05060c', rim: '#2a3060' }));
    p.drawImage(ar, 112 - ar.baseX, 82 - ar.height);
    // fitas enroladas no tronco
    var cols = A.ch2.RIBBON_COLS;
    for (var k = 0; k < 7; k++) { p.fillStyle = cols[k]; p.fillRect(108, 46 + k * 4, 9, 2); }
    // raízes descendo
    p.fillStyle = '#3a2a1c';
    for (var r = 0; r < 7; r++) {
      var ang = 0.5 + r * 0.35;
      for (var s = 0; s < 40; s++) { p.fillRect(Math.round(112 + Math.cos(ang) * s * 1.4 - 28 * Math.cos(ang)), Math.round(82 + Math.sin(ang) * s * 0.8), 2, 2); }
    }
    // o bicho encolhido lá embaixo
    var S = A.ch2.demon.crouch[0];
    var small = this.pDem || (this.pDem = TC.silhouette(TC.scaleCanvas(S, 0.5), '#d8ccb8'));
    p.globalAlpha = 0.75 + Math.sin(t * 0.1) * 0.15;
    p.drawImage(small, 112 - small.width / 2, h - small.height - 4);
    p.globalAlpha = 1;
    p.fillStyle = '#e0f4ff'; if ((t >> 4) % 5 !== 0) p.fillRect(124, h - 22, 2, 1);
    // a benzedeira com o lampião
    p.fillStyle = '#0a0806';
    TC.fillPoly(p, [[60, 82], [72, 82], [69, 60], [63, 60]]);
    TC.fillCircle(p, 66, 57, 4);
    TC.Lighting.glow(p, 74, 64, 10, '#ffb050', 0.6 + Math.sin(t * 0.3) * 0.1);
    p.fillStyle = '#ffe080'; p.fillRect(74, 63, 2, 3);
  };
  // a dança do pau-de-fita em volta do pinheiro
  Ch2IntroScene.prototype.panelDance = function (p, w, h, t) {
    skyGrad(p, w, h, '#1a1430', '#4a2a3a');
    for (var y = 96; y < h; y++) { p.fillStyle = TC.mix('#2a3a24', '#141c10', (y - 96) / (h - 96)); p.fillRect(0, y, w, 1); }
    var cx = 112, topY = 14;
    p.fillStyle = '#3a2418'; p.fillRect(cx - 2, topY, 5, 96);
    p.fillStyle = '#1a3a24'; TC.fillEllipse(p, cx, topY, 26, 6);
    var cols = A.ch2.RIBBON_COLS;
    var dancers = [];
    for (var k = 0; k < 7; k++) {
      var ang = t * 0.025 + k / 7 * TC.TAU;
      var dx = cx + Math.cos(ang) * 70, dy = 104 + Math.sin(ang) * 12;
      dancers.push({ x: dx, y: dy, k: k, z: Math.sin(ang) });
    }
    dancers.sort(function (a, b) { return a.z - b.z; });
    dancers.forEach(function (d) {
      p.fillStyle = cols[d.k];
      var n = 30;
      for (var s = 0; s <= n; s++) { var q = s / n; p.fillRect(Math.round(cx + (d.x - cx) * q), Math.round(topY + 4 + (d.y - 18 - topY - 4) * q + Math.sin(q * Math.PI) * 6), 1, 1); }
      // moça de saia rodada
      var sk = d.z > 0 ? '#e8e0d0' : '#a8a090';
      p.fillStyle = '#0a0806';
      TC.fillCircle(p, d.x, d.y - 20, 2);
      p.fillStyle = cols[d.k];
      TC.fillPoly(p, [[d.x - 2, d.y - 17], [d.x + 2, d.y - 17], [d.x + 6, d.y - 6], [d.x - 6, d.y - 6]]);
      p.fillStyle = sk; p.fillRect(d.x - 5, d.y - 7, 10, 1);
      p.fillStyle = '#0a0806'; p.fillRect(d.x - 2, d.y - 6, 1, 6); p.fillRect(d.x + 1, d.y - 6, 1, 6);
    });
    // lanternas de festa
    for (var i = 0; i < 8; i++) TC.Lighting.glow(p, 14 + i * 28, 20 + (i % 2) * 6, 5, '#ffc060', 0.6);
  };
  // 1997: o pinheiro derrubado, a cerração e o bicho saindo do toco
  Ch2IntroScene.prototype.panelCut = function (p, w, h, t) {
    skyGrad(p, w, h, '#0a0a1a', '#2a2840');
    for (var y = 92; y < h; y++) { p.fillStyle = TC.mix('#2a2018', '#100c08', (y - 92) / (h - 92)); p.fillRect(0, y, w, 1); }
    var stump = this.pStump || (this.pStump = TC.scaleCanvas(A.ch2.stump({ bare: true }), 0.5));
    p.drawImage(stump, 70 - stump.width / 2, 96 - stump.height + 4);
    // o tronco caído, com a marca da serra
    p.fillStyle = '#3a2618'; p.fillRect(100, 84, 120, 10);
    p.fillStyle = '#c89a64'; TC.fillEllipse(p, 100, 89, 3, 5);
    p.fillStyle = '#2a1a10'; for (var x = 104; x < 220; x += 6) p.fillRect(x, 85 + (x % 3), 3, 1);
    // o bicho saindo de quatro de dentro do toco
    var k = Math.min(1, t / 160);
    var S = A.ch2.demon.crawl[Math.floor(t / 8) % 6];
    var dem = this.pDem2 || (this.pDem2 = A.ch2.demon.crawl.map(function (f) { return TC.scaleCanvas(f, 0.55); }));
    var img = dem[Math.floor(t / 8) % 6];
    p.globalAlpha = k;
    p.drawImage(TC.flip(img), Math.round(60 + k * 20 - img.width / 2), 96 - img.height + 2);
    p.globalAlpha = 1;
    // cerração rolando
    var fog = this.fog;
    p.globalAlpha = 0.55;
    var o = Math.round(t * 0.4) % 512;
    p.drawImage(fog, -o, 70); p.drawImage(fog, 512 - o, 70);
    p.drawImage(fog, -((o * 2) % 512), 92); p.drawImage(fog, 512 - ((o * 2) % 512), 92);
    p.globalAlpha = 1;
    TC.font.draw(p, '1997', w - 8, h - 14, '#e8d090', { align: 'right', shadow: '#000' });
  };

  Ch2IntroScene.prototype.onHide = function () { };
  TC.Ch2IntroScene = Ch2IntroScene;

  /* ==================================================================
     FINAL DO CAPÍTULO 2: o toco se abre e lá embaixo a festa não acabou
     ================================================================== */
  function Ending2Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'stump';
    A.ch2Init();
    this.sky = A.sky(W, H, [[0, '#020309'], [0.5, '#0a0c28'], [1, '#22244e']], 91, 0.007);
    this.tw = A.twinkles(W, 110, 34, 15);
    this.moon = A.moon(14);
    this.moonRed = A.moon(14, true);
    this.hills = A.hills(W, 90, { seed: 63, color: '#121534', rim: '#2a3060', base: 0.38, amp: 0.5, trees: 50, treeMin: 8, treeMax: 18, period: 3, arauc: 0.9 });
    this.arau = [A.araucaria(4001, 200), A.araucaria(4002, 176), A.araucaria(4003, 214)];
    this.stump = A.ch2.stump({ bare: true });
    this.T = A.ch2.T;
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.fogBand = A.fog(512, 52, 47, '#8a8ab8');
    this.fogA = 0.5;
    this.open = 0;      // a fenda do toco se abrindo
    this.warm = 0;      // luz quente vinda de baixo
    this.redMoon = 0;
    this.arno = { x: 60, y: GY, face: 1, pose: 'idle', a: 1, anim: 0 };
    this.parts = new TC.Particles();
    this.textA = 0;
    this.script = new TC.Script(this.run());
  }
  Ending2Scene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.ambience('night');
  };
  Ending2Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ending2Scene.prototype.run = function* () {
    var self = this, ar = this.arno, dlg = this.dlg;
    function* s(who, key, face) { yield* TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: 'top' }); }
    yield* co.wait(90);
    yield* s('arno', 'e2.1');
    yield* co.tween(this, 'fogA', 0.15, 120);
    yield* co.wait(60);
    ar.face = -1;
    yield* co.wait(40);
    ar.face = 1;
    yield* s('arno', 'e2.2');
    yield* co.wait(60);
    // de dentro do toco, bem baixinho, uma bandinha
    TC.audio.music('bandinha', 3);
    yield* co.wait(150);
    ar.pose = 'shock';
    yield* s('arno', 'e2.3', 'shock');
    ar.pose = 'idle';
    TC.audio.sfx('wood');
    TC.fx.shake(2, 30);
    yield* co.all(co.tween(this, 'open', 1, 160, TC.ease.inOutSine), co.tween(this, 'warm', 1, 200));
    yield* co.wait(40);
    // vozes e risadas lá embaixo
    yield* s('voice', 'e2.4');
    yield* s('voice', 'e2.5');
    ar.pose = 'run';
    while (ar.x < 104) { ar.x += 0.7; ar.anim++; yield; }
    ar.pose = 'idle';
    yield* co.wait(40);
    yield* s('voice', 'e2.6');
    ar.pose = 'shock';
    yield* co.tween(this, 'redMoon', 1, 90);
    yield* s('arno', 'e2.7', 'shock');
    yield* co.wait(50);
    // corte para o preto
    TC.audio.stopMusic(0.05);
    TC.audio.sfx('heartbeat');
    TC.fx.bright = 0;
    TC.fx.letterbox = 0;
    yield* co.wait(150);
    this.phase = 'tbc';
    TC.fx.bright = 15;
    yield* co.tween(this, 'textA', 1, 90);
    this.tbcChars = 0;
    for (var c = 0; c < 80; c++) { this.tbcChars += 0.25; yield; }
    var w = 0;
    while (w++ < 420 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);
    // créditos curtos sobre a lenda
    this.phase = 'credits';
    TC.audio.music('lore');
    this.credY = H + 10;
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred2.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred2.3', 1, '#a0a8d0'], ['cred2.4', 1, '#e0e0f0'], ['cred2.5', 1, '#e0e0f0'], ['cred2.6', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['cred.3', 1, '#a0a8d0'], ['cred.4', 1, '#e0e0f0'], ['', 1], ['', 1],
      ['@score', 1, '#ffe060'], ['', 1], ['', 1], ['cred.8', 2, '#ffd890']
    ];
    this.credH = this.credLines.length * 16 + 20;
    while (this.credY > -this.credH + 70) {
      this.credY -= TC.input.down('confirm') || TC.input.down('jump') ? 1.6 : 0.36;
      yield;
    }
    this.credDone = true;
    while (!(TC.input.pressed('confirm') || TC.input.pressed('start'))) yield;
    TC.audio.stopMusic(1.5);
    // a história continua: o Arno desce a escada do toco (capítulo 3)
    TC.game.fadeTo(function () { return TC.Ch3IntroScene ? new TC.Ch3IntroScene() : new TC.TitleScene(); }, 60);
    while (true) yield;
  };

  Ending2Scene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.phase === 'stump') {
      if (this.t % 16 === 0) {
        var ls = A.leaves()[TC.rnd.int(0, 2)];
        this.parts.add({ x: TC.rnd.range(0, W + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6,
          sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
      }
      if (this.warm > 0.3 && this.t % 4 === 0) {
        // fagulhas douradas saindo da fenda
        this.parts.add({ x: 128 + TC.rnd.range(-6, 6), y: this.crackY || 170, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1, -0.4), life: 50, colors: ['#ffffff', '#ffe080', '#ff9030'], size: 1, fade: true, layer: 1, add: true });
      }
    }
  };

  Ending2Scene.prototype.draw = function (c) {
    if (this.phase === 'stump') this.drawStump(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else this.drawCredits(c);
    this.dlg.draw(c);
  };

  Ending2Scene.prototype.drawStump = function (c) {
    var t = this.t, i;
    c.drawImage(this.sky, 0, 0);
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moon, 196 - this.moon.width / 2, 40 - this.moon.height / 2);
    if (this.redMoon > 0) {
      c.globalAlpha = this.redMoon;
      c.drawImage(this.moonRed, 196 - this.moonRed.width / 2, 40 - this.moonRed.height / 2);
      c.globalAlpha = 1;
    }
    c.drawImage(this.hills, 0, 100);
    c.globalAlpha = 0.2 + this.fogA * 0.5;
    var o = (t >> 2) % 512;
    c.drawImage(this.fogBand, -o, 146); c.drawImage(this.fogBand, 512 - o, 146);
    c.globalAlpha = 1;

    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    var a0 = this.arau;
    pc.drawImage(a0[0], -10 - a0[0].baseX + 20, GY + 2 - a0[0].height);
    pc.drawImage(a0[1], 236 - a0[1].baseX, GY + 2 - a0[1].height);
    pc.drawImage(a0[2], 290 - a0[2].baseX, GY + 2 - a0[2].height);
    var st = this.stump, sx = Math.round(128 - st.width / 2), sy = GY + 4 - st.height;
    pc.drawImage(st, sx, sy);
    // a fenda se abre: escada de pedra descendo e luz quente
    var cx = sx + st.crackX, cy = sy + 40;
    this.crackY = cy + 30;
    var ow = Math.round(this.open * 13);
    if (ow > 0) {
      pc.fillStyle = TC.col('#140a06');
      TC.fillPoly(pc, [[cx - ow, cy], [cx + ow, cy], [cx + ow + 4, GY + 2], [cx - ow - 4, GY + 2]]);
      for (var k = 0; k < 6; k++) {
        var yy = cy + 6 + k * 7, sw = ow + 1 + k * 0.6;
        pc.fillStyle = TC.col(TC.mix('#ffd080', '#5a3a20', k / 6));
        pc.fillRect(Math.round(cx - sw), yy, Math.round(sw * 2), 2);
      }
    }
    var T = this.T;
    for (var x = 0; x < W; x += 16) { pc.drawImage(T.grimpaTop[(x >> 4) % 2], x, GY); pc.drawImage(A.ch2.T.taipa[(x >> 4) % 2], x, GY + 16); }
    drawArno(pc, this.arno, t);
    this.parts.draw(pc, 0, 0, 0);
    var L = this.light;
    L.begin(TC.mix('#3a3a72', '#4a2a3a', this.redMoon));
    L.add(this.arno.x, GY - 16, 40, '#7a7aa8', 0.5);
    if (this.warm > 0) {
      L.add(cx, cy + 20, 30 + this.warm * 70, '#ffb060', this.warm * 1.2);
      L.add(cx, GY, 20 + this.warm * 40, '#ffc070', this.warm);
    }
    this.mask.ctx.clearRect(0, 0, W, H);
    this.mask.ctx.drawImage(this.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);
    if (this.warm > 0) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,190,110,' + (0.14 * this.warm).toFixed(3) + ')';
      TC.fillPoly(c, [[cx - ow, cy], [cx + ow, cy], [cx + ow + 50, 0], [cx - ow - 50, 0]]);
      c.restore();
      TC.Lighting.glow(c, cx, cy + 16, 18, '#ffd080', 0.5 * this.warm);
    }
    c.globalAlpha = this.fogA * 0.6;
    c.drawImage(this.fogBand, -((t >> 1) % 512), 188); c.drawImage(this.fogBand, 512 - ((t >> 1) % 512), 188);
    c.globalAlpha = 1;
    this.parts.draw(c, 0, 0, 1);
  };

  Ending2Scene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000';
    c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end2.chapter'), 2, '#ffffff', '#8890d0', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 80);
    if (this.tbcChars) {
      TC.font.draw(c, TC.t('end2.next'), 128, 116, '#c8a878', { align: 'center', max: Math.floor(this.tbcChars) });
      TC.font.draw(c, TC.t('end.tbc'), 128, 134, '#8088b0', { align: 'center', max: Math.max(0, Math.floor(this.tbcChars) - 20) });
    }
    c.globalAlpha = 1;
  };

  Ending2Scene.prototype.drawCredits = function (c) {
    var t = this.t;
    c.drawImage(this.sky, 0, 0);
    A.drawTwinkles(c, this.tw, t, 0, 0);
    c.drawImage(this.moonRed, 196 - this.moonRed.width / 2, 40 - this.moonRed.height / 2);
    c.drawImage(this.hills, 0, 134);
    c.fillStyle = 'rgba(0,0,10,0.45)';
    c.fillRect(0, 0, W, H);
    var y = this.credY, self = this;
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
  TC.Ending2Scene = Ending2Scene;
})();
