'use strict';
/* Teewald City — Capítulo 5: "A Noite Grande"
   Prólogo: fim de tarde na praça da Matriz; os postes não acendem. A Dona Rosa, kujà kaingang, conta a lenda da
   Noite Grande, da Boiguaçu que virou boitatá, do fogo do morro e do que os colonos fizeram lá em 1888.
   Final: a Boitatá sobe para engolir o sol e estoura em mil vaga-lumes; os postes de Teewald acendem um por um;
   mas a cerração desce a serra feito um rio, e o rádio fala da Linha Esperança. */
(function () {
  var A = TC.ART;
  var co = TC.co;
  var W = TC.W, H = TC.H;
  var GY = 192;

  function drawFig(c, set, pose, x, y, face, t, anim, alpha, tint) {
    if (!set) return;
    var arr = set[pose] || set.idle;
    var fr = (pose === 'run' || pose === 'walk') ? arr[Math.floor((anim || 0) / 5) % arr.length] : arr[Math.floor((t || 0) / 32) % arr.length];
    if (tint) fr = TC.tintCached(fr, tint[0], tint[1]);
    var img = face < 0 ? TC.flip(fr) : fr;
    var ox = fr.ox != null ? (face < 0 ? fr.width - fr.ox : fr.ox) : fr.width / 2;
    var oy = fr.oy != null ? fr.oy : fr.height;
    c.globalAlpha = alpha == null ? 1 : alpha;
    c.drawImage(img, Math.round(x - ox), Math.round(y - oy + 1));
    c.globalAlpha = 1;
  }
  function say(dlg, who, key, face, pos) { return TC.ui.say(dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }
  function skyGrad(p, w, h, top, bot) { for (var y = 0; y < h; y++) { p.fillStyle = TC.mix(top, bot, y / h); p.fillRect(0, y, w, 1); } }
  function lit(scene, pc, ambient, lights) {
    var L = scene.light;
    L.begin(ambient);
    lights.forEach(function (l) { L.add(l[0], l[1], l[2], l[3], l[4]); });
    scene.mask.ctx.clearRect(0, 0, W, H);
    scene.mask.ctx.drawImage(scene.pf, 0, 0);
    L.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(scene.mask, 0, 0);
    pc.globalCompositeOperation = 'source-over';
  }
  /* uma pilha de balaios trançados (a banca da Dona Rosa) */
  function balaios() {
    var cv = TC.canvas(64, 34), c = cv.ctx;
    function one(x, y, w, h, k) {
      for (var yy = 0; yy < h; yy++) {
        var hw = w / 2 - (yy > h - 4 ? yy - (h - 4) : 0);
        for (var xx = -hw; xx <= hw; xx++) {
          var q = ((Math.round(xx) + 20) + (yy >> 1) * 2 + k) % 4;
          c.fillStyle = TC.col(yy === 0 ? '#e0c890' : q < 2 ? '#c8a060' : '#7a5a30');
          c.fillRect(Math.round(x + xx), y + yy, 1, 1);
        }
      }
      c.fillStyle = TC.col('#5a3a18'); c.fillRect(Math.round(x - w / 2), y + 1, w, 1);
    }
    one(14, 18, 24, 15, 0); one(40, 20, 22, 13, 1); one(27, 6, 18, 12, 2); one(54, 26, 14, 7, 3);
    // esteira de palha por baixo
    c.fillStyle = TC.col('#8a7040'); c.fillRect(0, 32, 64, 2);
    return cv;
  }

  /* ==================================================================
     PRÓLOGO: a praça da Matriz ao entardecer
     ================================================================== */
  function Ch5IntroScene() {
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.shot = 'card';
    this.texts = [];
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.dusk = 0;            // 0 = fim de tarde, 1 = noite
    this.panel = null; this.panelA = 0; this.panelT = 0;
    this.memory = 0;          // clarão branco da lembrança do acidente (nunca mostrado)
    this.arno = { x: -30, face: 1, pose: 'walk', anim: 0 };
    this.ewald = { x: -54, face: 1, pose: 'walk', anim: 0 };
    this.prepare();
    this.script = new TC.Script(this.run());
  }
  Ch5IntroScene.prototype.prepare = function () {
    this.C3 = A.ch3Init();
    this.C5 = A.ch5Init();
    this.cast = A.castInit();
    this.church = A.church();
    this.arau = A.araucaria(5150, 196);
    this.arau2 = A.araucaria(5151, 160, { sil: '#120e1c', rim: '#3a2a3a' });
    this.bench = A.bench();
    this.post = A.lampPostOff(118);
    this.balaios = balaios();
    this.hills = A.hills(W, 90, { seed: 64, color: '#1e1430', rim: '#4a2a40', base: 0.4, amp: 0.5, trees: 50, treeMin: 8, treeMax: 16, period: 3, arauc: 0.9 });
    this.tw = A.twinkles(W, 100, 30, 9);
    this.moon = A.moon(9);
    var T = A.tiles();
    var ground = TC.canvas(W, 32), g = ground.ctx;
    for (var x = 0; x < W; x += 16) { g.drawImage(T.hexTop[(x >> 4) % 2], x, 0); g.drawImage(T.cobble[(x >> 4) % 2], x, 16); }
    this.ground = ground;
  };
  Ch5IntroScene.prototype.enter = function () { TC.fx.bright = 0; TC.audio.ambience('windy'); };
  Ch5IntroScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ch5IntroScene.prototype.walk = function* (who, tx, spd) {
    who.pose = 'walk';
    while (Math.abs(who.x - tx) > 1) { who.x += Math.sign(tx - who.x) * spd; who.face = tx > who.x ? 1 : -1; who.anim++; if (who.anim % 12 === 0) TC.audio.sfx('step'); yield; }
    who.pose = 'idle';
  };
  Ch5IntroScene.prototype.run = function* () {
    var self = this, dlg = this.dlg, ar = this.arno, ew = this.ewald;
    function text(str, x, y, col) { var o = { str: str, x: x, y: y, a: 0, col: col || '#e0e0f0' }; self.texts.push(o); return o; }
    TC.fx.bright = 15;
    var t1 = text(TC.t('ch5.card1'), 128, 92, '#d0d0e8');
    var t2 = text(TC.t('ch5.card2'), 128, 110, '#e0b070');
    TC.audio.sfx('bell');
    yield* co.tween(t1, 'a', 1, 60);
    yield* co.tween(t2, 'a', 1, 60);
    yield* co.wait(100);
    yield* co.all(co.tween(t1, 'a', 0, 50), co.tween(t2, 'a', 0, 50));
    this.texts = [];
    // o rádio do caminhão de alguém, estacionado na praça
    yield* co.wait(20);
    TC.audio.static(5, 0.08);
    yield* TC.ui.say(dlg, [{ who: 'radio', key: 'p5.radio', speed: 0.55 }], { pos: 'top' });
    // a praça
    this.shot = 'plaza';
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(60);
    TC.audio.music('praca5', 1.5);
    yield* co.all(this.walk(ar, 92, 0.7), this.walk(ew, 64, 0.7));
    ar.face = 1; ew.face = 1;
    yield* co.wait(20);
    yield* say(dlg, 'ewald', 'p5.1');
    yield* say(dlg, 'rosa', 'p5.2');
    yield* say(dlg, 'frida', 'p5.3');
    yield* say(dlg, 'rosa', 'p5.4');
    TC.audio.stopMusic(1.5);
    // a lenda, em quatro quadros
    var panels = [
      ['hill', [['rosa', 'p5.l1'], ['rosa', 'p5.l2']]],
      ['night', [['rosa', 'p5.l3'], ['rosa', 'p5.l4'], ['rosa', 'p5.l5']]],
      ['tree', [['rosa', 'p5.l6'], ['rosa', 'p5.l7'], ['frida', 'p5.l8'], ['rosa', 'p5.l9']]],
      ['dawn', [['rosa', 'p5.l10'], ['rosa', 'p5.l11'], ['ewald', 'p5.l12'], ['rosa', 'p5.l13']]]
    ];
    TC.audio.music('lore');
    for (var i = 0; i < panels.length; i++) {
      this.panel = panels[i][0];
      this.panelT = 0;
      yield* co.tween(this, 'panelA', 1, 30);
      yield* co.wait(30);
      for (var j = 0; j < panels[i][1].length; j++) yield* say(dlg, panels[i][1][j][0], panels[i][1][j][1], null, 'bottom');
      yield* co.tween(this, 'panelA', 0, 30);
      this.dusk = Math.min(1, this.dusk + 0.22);
    }
    this.panel = null;
    TC.audio.music('praca5', 1.5);
    yield* say(dlg, 'rosa', 'p5.5');
    yield* say(dlg, 'rosa', 'p5.5b');
    ar.pose = 'look';
    yield* say(dlg, 'arno', 'p5.6');
    // a lembrança: dois faróis na cerração, e o branco
    TC.audio.sfx('heartbeat');
    yield* co.tween(this, 'memory', 1, 40);
    yield* co.wait(30);
    yield* say(dlg, 'arno', 'p5.7', 'hurt');
    yield* co.tween(this, 'memory', 0, 50);
    ar.pose = 'idle';
    yield* say(dlg, 'rosa', 'p5.8');
    yield* say(dlg, 'rosa', 'p5.9');
    yield* say(dlg, 'rosa', 'p5.10');
    yield* say(dlg, 'ewald', 'p5.11');
    yield* say(dlg, 'arno', 'p5.12');
    yield* co.tween(this, 'dusk', 1, 40);
    ar.face = -1; ew.face = -1;
    yield* co.all(this.walk(ar, -30, 1.0), this.walk(ew, -50, 1.0));
    TC.fx.fadeOut(60);
    TC.audio.stopMusic(1.5);
    yield* co.wait(70);
    TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 5 }); }, 10);
    while (true) yield;
  };
  Ch5IntroScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('start') && !TC.game.fading() && this.t > 30) {
      TC.audio.stopMusic(0.5);
      TC.game.fadeTo(function () { return new TC.StageScene({ chapter: 5 }); }, 30);
    }
    this.panelT++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    if (this.shot === 'plaza' && this.t % 18 === 0) {
      var ls = A.leaves()[TC.rnd.int(0, 2)];
      this.parts.add({ x: TC.rnd.range(0, W + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6, sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
    }
  };
  Ch5IntroScene.prototype.draw = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (this.shot === 'plaza') this.drawPlaza(c);
    for (var i = 0; i < this.texts.length; i++) {
      var tx = this.texts[i];
      if (tx.a <= 0) continue;
      c.globalAlpha = TC.clamp(tx.a, 0, 1);
      TC.font.draw(c, tx.str, tx.x, tx.y, tx.col, { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
    if (this.panel && this.panelA > 0) this.drawPanel(c);
    if (this.memory > 0) {
      // dois faróis vindo na cerração, e o clarão (o acidente nunca aparece)
      c.globalAlpha = Math.min(1, this.memory * 1.4);
      c.fillStyle = '#0a0a14'; c.fillRect(0, 0, W, H);
      var k = Math.min(1, this.memory * 1.2);
      TC.Lighting.glow(c, 110, 110, 10 + k * 40, '#fff6d0', 0.8);
      TC.Lighting.glow(c, 146, 110, 10 + k * 40, '#fff6d0', 0.8);
      c.fillStyle = 'rgba(255,255,250,' + Math.max(0, (this.memory - 0.6) * 2.5).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
    this.dlg.draw(c);
    if (this.t < 400) {
      c.globalAlpha = TC.clamp((400 - this.t) / 60, 0, 1) * 0.8;
      TC.font.draw(c, TC.t('intro.skip'), 250, 210, '#8088b0', { align: 'right', shadow: '#000' });
      c.globalAlpha = 1;
    }
  };
  Ch5IntroScene.prototype.drawPlaza = function (c) {
    var t = this.t, d = this.dusk, pc = this.pf.ctx;
    // céu do entardecer escurecendo
    for (var y = 0; y < H; y++) {
      var k = y / H;
      var eve = k < 0.55 ? TC.mix('#3a2a5a', '#c86a4a', k / 0.55) : TC.mix('#c86a4a', '#ffb070', (k - 0.55) / 0.45);
      var night = TC.mix('#05060f', '#22244a', k);
      c.fillStyle = TC.mix(eve, night, d);
      c.fillRect(0, y, W, 1);
    }
    if (d > 0.4) { c.globalAlpha = (d - 0.4) / 0.6; A.drawTwinkles(c, this.tw, t, 0, 0); c.drawImage(this.moon, 40 - this.moon.width / 2, 34 - this.moon.height / 2); c.globalAlpha = 1; }
    // o sol se pondo atrás da serra
    var sunY = 118 + d * 40;
    TC.Lighting.glow(c, 196, sunY, 50, '#ff9050', 0.5 * (1 - d));
    c.fillStyle = TC.mix('#ffd080', '#ff7040', d); TC.fillCircle(c, 196, Math.round(sunY), 11);
    c.drawImage(this.hills, 0, 104);
    pc.clearRect(0, 0, W, H);
    // a Matriz ao fundo, os postes apagados, a araucária com a banca de balaios
    pc.drawImage(this.church, -60, GY + 2 - this.church.height);
    pc.drawImage(this.arau2, 150 - this.arau2.baseX, GY + 2 - this.arau2.height);
    var post = this.post;
    pc.drawImage(post, 118 - post.poleX, GY + 3 - post.height);
    pc.drawImage(this.arau, 214 - this.arau.baseX, GY + 2 - this.arau.height);
    pc.drawImage(this.bench, 132, GY + 1 - this.bench.height);
    pc.drawImage(this.balaios, 200, GY + 1 - this.balaios.height);
    pc.drawImage(this.ground, 0, GY);
    var C = this.cast;
    drawFig(pc, C.frida, 'cuia', 150, GY, -1, t);
    drawFig(pc, C.rosa, 'idle', 188, GY, -1, t);
    drawFig(pc, this.C3.ewald, this.ewald.pose, this.ewald.x, GY, this.ewald.face, t, this.ewald.anim);
    drawFig(pc, A.arno, this.arno.pose === 'walk' ? 'run' : this.arno.pose, this.arno.x, GY, this.arno.face, t, this.arno.anim);
    this.parts.draw(pc, 0, 0, 0);
    var amb = TC.mix('#d0a080', '#3a3a68', d);
    lit(this, pc, amb, [[196, sunY, 160, '#ffa060', 0.8 * (1 - d)], [this.arno.x, GY - 16, 40, '#8080b0', 0.4], [208, GY - 10, 50, '#ffb070', 0.3 + 0.3 * d]]);
    c.drawImage(this.pf, 0, 0);
  };

  /* ---------- os quadros da lenda (livro de histórias: sépia, azul e o laranja do fogo) ---------- */
  Ch5IntroScene.prototype.drawPanel = function (c) {
    var t = this.panelT || 0, a = this.panelA;
    var px = 16, py = 28, pw = 224, ph = 108;
    c.globalAlpha = a;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    var cv = this.panelCv || (this.panelCv = TC.canvas(pw, ph));
    var p = cv.ctx;
    p.clearRect(0, 0, pw, ph);
    if (this.panel === 'hill') this.panelHill(p, pw, ph, t);
    else if (this.panel === 'night') this.panelNight(p, pw, ph, t);
    else if (this.panel === 'tree') this.panelTree(p, pw, ph, t);
    else this.panelDawn(p, pw, ph, t);
    c.drawImage(cv, px, py);
    c.fillStyle = '#c8a870'; c.fillRect(px - 3, py - 3, pw + 6, 2); c.fillRect(px - 3, py + ph + 1, pw + 6, 2);
    c.fillRect(px - 3, py - 3, 2, ph + 6); c.fillRect(px + pw + 1, py - 3, 2, ph + 6);
    c.fillStyle = '#6a4a28'; c.fillRect(px - 1, py - 1, pw + 2, 1); c.fillRect(px - 1, py + ph, pw + 2, 1);
    c.fillRect(px - 1, py - 1, 1, ph + 2); c.fillRect(px + pw, py - 1, 1, ph + 2);
    // cantoneiras trançadas, como as do balaio
    [[px - 4, py - 4], [px + pw, py - 4], [px - 4, py + ph], [px + pw, py + ph]].forEach(function (q) {
      for (var yy = 0; yy < 4; yy++) for (var xx = 0; xx < 4; xx++) { c.fillStyle = (xx + yy) % 2 ? '#e8d090' : '#8a6030'; c.fillRect(q[0] + xx, q[1] + yy, 1, 1); }
    });
    c.globalAlpha = 1;
  };
  /* gente em silhueta para os quadros da lenda (x = centro, y = pés). opt: hat, gun, child, hair, sit, skirt, scarf, torch, lamp */
  function person(p, x, y, col, opt) {
    opt = opt || {};
    var k = opt.child ? 0.7 : 1, f = opt.face || 1;
    function R(dx, dy, w, h) { p.fillRect(Math.round(x + dx * k), Math.round(y + dy * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))); }
    p.fillStyle = col;
    if (opt.sit) {
      R(-3, -10, 6, 6);                    // tronco
      R(-3, -4, 9, 3);                     // coxas
      R(4, -2, 2, 2);                      // canelas
      R(-1, -11, 2, 1);
      TC.fillCircle(p, x, y - 13 * k, 2.4 * k);
    } else {
      if (opt.skirt) TC.fillPoly(p, [[x - 3 * k, y - 9 * k], [x + 3 * k, y - 9 * k], [x + 5 * k, y], [x - 5 * k, y]]);
      else { R(-3, -6, 2, 6); R(1, -6, 2, 6); }
      R(-3, -13, 6, 7);                    // tronco
      R(-4, -12, 1, 6); R(3, -12, 1, 6);   // braços
      R(-1, -14, 2, 1);
      TC.fillCircle(p, x, y - 16 * k, 2.4 * k);
    }
    var hy = y - (opt.sit ? 13 : 16) * k;
    if (opt.hat) { R(-5, opt.sit ? -16 : -19, 10, 1); R(-2, opt.sit ? -18 : -21, 5, 2); }
    if (opt.hair) R(-f * 3 - (f < 0 ? 1 : 0), opt.sit ? -14 : -17, 1, 9);
    if (opt.scarf) { p.fillStyle = '#e8e4dc'; p.fillRect(Math.round(x - 3), Math.round(hy - 3), 6, 2); p.fillStyle = col; }
    if (opt.gun) R(f * 4, -26, 1, 16);
    if (opt.torch) { R(-f * 5, -18, 1, 9); p.fillStyle = '#ff9030'; p.fillRect(Math.round(x - f * 5 * k - 1), Math.round(y - 22 * k), 3, 4); p.fillStyle = '#ffe080'; p.fillRect(Math.round(x - f * 5 * k), Math.round(y - 21 * k), 1, 2); p.fillStyle = col; }
    if (opt.lamp) { p.fillStyle = '#ffe080'; p.fillRect(Math.round(x + f * 6 * k), Math.round(y - 9 * k), 2, 3); p.fillStyle = col; }
  }
  function morro(p, w, h, col, rim) {
    p.fillStyle = col;
    TC.fillPoly(p, [[0, h], [0, 70], [40, 50], [90, 22], [130, 18], [170, 34], [224, 60], [224, h]]);
    if (rim) { p.fillStyle = rim; for (var x = 40; x < 180; x++) { var y = x < 90 ? 50 - (x - 40) * 0.56 : x < 130 ? 22 - (x - 90) * 0.1 : 18 + (x - 130) * 0.4; p.fillRect(x, Math.round(y), 1, 1); } }
  }
  function smallArau(p, x, base, h, col) {
    p.fillStyle = col;
    p.fillRect(x, base - h, 1, h);
    var cw = Math.round(h * 0.45);
    for (var k = 0; k < 3; k++) { var y = base - h + k * 2; for (var d = -cw + k; d <= cw - k; d++) p.fillRect(x + d, y - Math.round(Math.abs(d) * 0.25), 1, 2); }
  }
  // 1. o morro antes do navio: a boca da caverna com o fogo de nó de pinho, e a cobra dormindo lá dentro
  Ch5IntroScene.prototype.panelHill = function (p, w, h, t) {
    skyGrad(p, w, h, '#0c0e26', '#2a2448');
    for (var i = 0; i < 26; i++) { p.fillStyle = '#8088b8'; p.fillRect((i * 37) % w, (i * 23) % 40, 1, 1); }
    morro(p, w, h, '#2a1c18', '#5a3a2a');
    for (var k = 0; k < 9; k++) smallArau(p, 20 + k * 24 + (k % 2) * 6, 58 - Math.round(Math.sin(k / 8 * Math.PI) * 30) + (k % 3) * 2, 16 + (k % 3) * 4, '#120c0a');
    // a boca da caverna
    p.fillStyle = '#060302'; TC.fillEllipse(p, 112, 84, 22, 18);
    p.fillStyle = '#2a1c18'; p.fillRect(80, 86, 70, 30);
    // lá dentro, enrolada, a Boiguaçu dormindo (só o contorno)
    p.fillStyle = '#1a2416';
    for (var s = 0; s < 22; s++) { var a = s * 0.55; TC.fillCircle(p, 112 + Math.cos(a) * (12 - s * 0.35), 80 + Math.sin(a) * (6 - s * 0.15), 3 - s * 0.08); }
    // o fogo de nó de pinho na boca
    var fx = 112, fy = 96;
    for (var f = -3; f <= 3; f++) {
      var fh = 4 + Math.round(Math.abs(Math.sin(t * 0.25 + f * 1.7)) * 6);
      p.fillStyle = '#ff9030'; p.fillRect(fx + f * 2, fy - fh, 2, fh);
      p.fillStyle = '#ffe080'; p.fillRect(fx + f * 2, fy - Math.max(1, fh - 3), 1, Math.max(1, fh - 3));
    }
    TC.Lighting.glow(p, fx, fy - 4, 30, '#ff9040', 0.55 + Math.sin(t * 0.3) * 0.05);
    // gente em volta do fogo, em silhueta: dois adultos sentados e uma criança
    person(p, 94, 100, '#0a0606', { sit: true, face: 1, hair: true });
    person(p, 131, 100, '#0a0606', { sit: true, face: -1 });
    person(p, 141, 102, '#0a0606', { child: true, face: -1 });
    // pinhas no chão
    p.fillStyle = '#5a4a20'; [[60, 104], [170, 106], [180, 102]].forEach(function (q) { TC.fillCircle(p, q[0], q[1], 2); });
  };
  // 2. a Noite Grande: a chuva que não para, os bichos no escuro e a cobra que acende
  Ch5IntroScene.prototype.panelNight = function (p, w, h, t) {
    skyGrad(p, w, h, '#050508', '#14141e');
    morro(p, w, h, '#0e0a0a');
    // os bichos mortos (silhuetas deitadas)
    p.fillStyle = '#1a1414';
    [[40, 100], [70, 104], [180, 102]].forEach(function (q) { TC.fillEllipse(p, q[0], q[1], 9, 3); p.fillRect(q[0] + 7, q[1] - 3, 4, 3); });
    // a cobra comendo a luz dos olhos: corpo cada vez mais aceso
    var glow = Math.min(1, t / 200);
    for (var s = 0; s < 24; s++) {
      var x = 70 + s * 4 + Math.sin(t * 0.05 + s * 0.5) * 3, y = 74 - Math.sin(s * 0.3) * 10 + Math.cos(t * 0.04 + s * 0.4) * 2;
      p.fillStyle = TC.mix('#1a2416', '#ffb040', glow * (1 - s / 30));
      TC.fillCircle(p, x, y, 4 - s * 0.1);
      if ((s + (t >> 3)) % 4 === 0) { p.fillStyle = '#ffffff'; p.fillRect(Math.round(x), Math.round(y) - 1, 1, 1); }
    }
    TC.Lighting.glow(p, 80, 70, 24, '#ffa040', 0.6 * glow);
    // olhinhos indo para a boca
    for (var k = 0; k < 4; k++) {
      var q = ((t * 0.01 + k * 0.25) % 1);
      var ex = 40 + (70 - 40) * q + k * 30 * (1 - q), ey = 100 + (72 - 100) * q;
      p.fillStyle = '#e8f0b0'; p.fillRect(Math.round(ex), Math.round(ey), 2, 1);
    }
    // chuva
    p.fillStyle = 'rgba(120,130,170,0.6)';
    for (var r = 0; r < 70; r++) { var rx = (r * 53 + t * 3) % (w + 20) - 10, ry = (r * 31 + t * 7) % h; p.fillRect(rx, ry, 1, 4); }
  };
  // 3. 1852: as duas mulheres amarrando o Antigo nas raízes do Pinheiro Velho, juntas
  Ch5IntroScene.prototype.panelTree = function (p, w, h, t) {
    skyGrad(p, w, 80, '#0c0e26', '#22264c');
    for (var y = 80; y < h; y++) { p.fillStyle = TC.mix('#2a1c14', '#120c08', (y - 80) / (h - 80)); p.fillRect(0, y, w, 1); }
    var ar = this.pArau || (this.pArau = A.araucaria(1852, 86, { sil: '#05060c', rim: '#2a3060' }));
    p.drawImage(ar, 112 - ar.baseX, 82 - ar.height);
    p.fillStyle = '#3a2a1c';
    for (var rr = 0; rr < 7; rr++) { var ang = 0.5 + rr * 0.35; for (var s = 0; s < 40; s++) p.fillRect(Math.round(112 + Math.cos(ang) * s * 1.4 - 28 * Math.cos(ang)), Math.round(82 + Math.sin(ang) * s * 0.8), 2, 2); }
    // o Antigo encolhido entre as raízes, amarrado
    var S = A.ch2.demon.crouch[0];
    var small = this.pDem || (this.pDem = TC.silhouette(TC.scaleCanvas(S, 0.5), '#d8ccb8'));
    p.globalAlpha = 0.75 + Math.sin(t * 0.1) * 0.15;
    p.drawImage(small, 112 - small.width / 2, h - small.height - 4);
    p.globalAlpha = 1;
    // as cordas: uma de fita bordada, uma de taquara trançada
    var cols = A.ch2.RIBBON_COLS;
    for (var k = 0; k < 5; k++) { p.fillStyle = k % 2 ? '#c8a060' : cols[k]; for (var x = 92; x < 134; x += 2) p.fillRect(x, h - 18 + k * 3 + Math.round(Math.sin(x * 0.3 + k) * 1), 2, 1); }
    // à esquerda, a Hedwig moça com o lenço branco e o lampião
    person(p, 62, 84, '#0a0806', { skirt: true, scarf: true, lamp: true, face: 1 });
    TC.Lighting.glow(p, 69, 76, 10, '#ffb050', 0.6 + Math.sin(t * 0.3) * 0.1);
    // à direita, a avó da Dona Rosa, kujà, com o tição de nó de pinho e o cabelo comprido
    person(p, 162, 84, '#0a0806', { skirt: true, hair: true, torch: true, face: -1 });
    TC.Lighting.glow(p, 167, 63, 12, '#ff9040', 0.6 + Math.sin(t * 0.37) * 0.08);
    TC.font.draw(p, '1852', w - 8, h - 14, '#e8d090', { align: 'right', shadow: '#000' });
  };
  // 4. 1888: madrugada, os bugreiros na boca da caverna; o fogo apagado, só fumaça
  Ch5IntroScene.prototype.panelDawn = function (p, w, h, t) {
    skyGrad(p, w, h, '#2a2a4a', '#8a6a6a');
    morro(p, w, h, '#2a1c18', '#6a4a3a');
    p.fillStyle = '#060302'; TC.fillEllipse(p, 112, 84, 22, 18);
    p.fillStyle = '#2a1c18'; p.fillRect(80, 86, 70, 30);
    // o fogo apagado: brasa morta e fumaça subindo
    p.fillStyle = '#3a3030'; p.fillRect(106, 94, 12, 2);
    for (var s = 0; s < 14; s++) {
      var k = ((t * 0.006 + s / 14) % 1);
      p.globalAlpha = 0.5 * (1 - k);
      p.fillStyle = '#8a8a96';
      TC.fillCircle(p, 112 + Math.sin(k * 6 + s) * 6 * k, 94 - k * 60, 2 + k * 5);
    }
    p.globalAlpha = 1;
    // os homens de chapéu e espingarda
    [[40, 102, 1], [58, 104, 1], [176, 103, -1], [194, 101, -1]].forEach(function (q) { person(p, q[0], q[1], '#0a0808', { hat: true, gun: true, face: q[2] }); });
    TC.font.draw(p, '1888', w - 8, h - 14, '#e8d090', { align: 'right', shadow: '#000' });
  };
  Ch5IntroScene.prototype.onHide = function () { };
  TC.Ch5IntroScene = Ch5IntroScene;

  /* ==================================================================
     FINAL: o maior olho de todos, os vaga-lumes e a cerração que desce
     ================================================================== */
  function Ending5Scene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.dlg = new TC.Dialog();
    this.phase = 'sky';
    this.C3 = A.ch3Init();
    this.C5 = A.ch5Init();
    this.cast = A.castInit();
    this.light = new TC.Lighting(W, H);
    this.pf = TC.canvas(W, H);
    this.mask = TC.canvas(W, H);
    this.parts = new TC.Particles();
    this.flies = [];
    this.dawn = 0.55;
    this.sunY = 126;
    this.snake = { x: 40, y: 150, t: 0, a: 1, pts: [] };
    for (var i = 0; i < 16; i++) this.snake.pts.push({ x: 40 - i * 8, y: 150 });
    this.burst = 0;
    this.townLit = 0;
    this.fog = 0;
    this.textA = 0;
    this.hills = A.hills(W, 90, { seed: 66, color: '#1a1a3a', rim: '#4a4a7a', base: 0.42, amp: 0.55, trees: 50, treeMin: 6, treeMax: 14, period: 3, arauc: 0.95 });
    this.hillsWarm = TC.tint(this.hills, '#8a5a5a', 0.45);
    this.arau = [A.araucaria(5501, 150, { sil: '#0a0a14', rim: '#3a3050' }), A.araucaria(5502, 120, { sil: '#0a0a14', rim: '#3a3050' }), A.araucaria(5503, 170, { sil: '#0a0a14', rim: '#3a3050' })];
    var town = [], r = TC.RNG(19);
    for (i = 0; i < 40; i++) town.push({ x: r.int(30, 226), y: r.int(150, 176), c: r() < 0.7 ? '#ffb050' : '#ffe0a0', o: r() * 0.5 });
    town.sort(function (a, b) { return a.o - b.o; });
    this.town = town;
    this.fogBand = A.fog(512, 52, 51, '#c8c8e0');
    this.ar = { x: 176, face: 1, pose: 'idle', anim: 0 };
    this.ew = { x: 154, face: 1, pose: 'idle', anim: 0 };
    this.ro = { x: 296, face: -1, pose: 'walk', anim: 0 };
    this.fr = { x: 318, face: -1, pose: 'walk', anim: 0 };
    this.script = new TC.Script(this.run());
  }
  Ending5Scene.prototype.enter = function () { TC.fx.bright = 0; TC.fx.letterbox = 22; TC.fx.fadeIn(60); TC.audio.ambience('night'); };
  Ending5Scene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  Ending5Scene.prototype.walk = function* (who, tx, spd) {
    who.pose = 'walk';
    while (Math.abs(who.x - tx) > 1) { who.x += Math.sign(tx - who.x) * spd; who.face = tx > who.x ? 1 : -1; who.anim++; yield; }
    who.pose = 'idle';
  };
  Ending5Scene.prototype.run = function* () {
    var self = this, dlg = this.dlg, i;
    TC.audio.music('dawn', 2);
    yield* co.wait(50);
    // a Boitatá sobe para engolir o sol
    var sn = this.snake;
    for (i = 0; i < 160; i++) {
      var k = i / 160;
      sn.x = 40 + (196 - 40) * TC.ease.inOutSine(k) + Math.sin(i * 0.08) * 16;
      sn.y = 160 - (160 - (this.sunY + 4)) * TC.ease.inOutSine(k) + Math.cos(i * 0.1) * 8;
      if (i === 40) yield* say(dlg, 'arno', 'e5.1');
      if (i === 90) yield* say(dlg, 'ewald', 'e5.2');
      yield;
    }
    // e estoura em mil luzes
    TC.audio.sfx('c5swell');
    yield* co.wait(20);
    TC.audio.sfx('explode'); TC.audio.sfx('c5fly');
    TC.fx.flash('#fff8e0', 1, 0.02);
    sn.a = 0;
    this.burst = 1;
    for (i = 0; i < 260; i++) {
      var a = TC.rnd() * TC.TAU, s = TC.rnd.range(0.3, 2.6);
      this.flies.push({ x: 196, y: this.sunY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, ph: TC.rnd() * 6, sp: TC.rnd.range(0.05, 0.12), life: TC.rnd.int(900, 1600) });
    }
    yield* co.wait(90);
    yield* say(dlg, 'arno', 'e5.3');
    // lá embaixo, os postes de Teewald acendem um por um
    for (i = 0; i < this.town.length; i++) { this.townLit = i + 1; if (i % 4 === 0) TC.audio.sfx('blip', 1200 + i * 20); yield* co.wait(8); }
    yield* say(dlg, 'ewald', 'e5.4');
    this.cap = 0;
    for (i = 0; i < 150; i++) { this.cap = Math.min(TC.t('e5.cap').length, this.cap + 0.4); yield; }
    yield* co.wait(90);
    this.cap = null;
    TC.fx.fadeOut(60);
    yield* co.wait(66);
    // a curva da serra: o caminhão parado; a Dona Rosa e a Dona Frida chegam pela trilha
    this.phase = 'curve';
    TC.fx.fadeIn(60);
    yield* co.wait(40);
    yield* co.all(this.walk(this.ro, 212, 0.6), this.walk(this.fr, 234, 0.6));
    this.ro.face = -1; this.fr.face = -1;
    this.ar.face = 1; this.ew.face = 1;
    yield* say(dlg, 'rosa', 'e5.5');
    yield* say(dlg, 'arno', 'e5.6');
    yield* co.wait(30);
    yield* say(dlg, 'frida', 'e5.7');
    // a cerração desce a serra feito um rio
    TC.audio.stopMusic(2);
    TC.audio.music('dread', 2);
    this.ar.face = -1; this.ew.face = -1; this.ro.face = -1; this.fr.face = -1;
    yield* co.tween(this, 'fog', 1, 200);
    yield* say(dlg, 'ewald', 'e5.8');
    TC.audio.static(5, 0.08);
    yield* TC.ui.say(dlg, [{ who: 'radio', key: 'e5.r1', speed: 0.55 }], { pos: 'top' });
    yield* co.wait(30);
    yield* say(dlg, 'ewald', 'e5.9');
    yield* co.wait(40);
    TC.fx.fadeOut(80);
    TC.audio.stopMusic(2);
    yield* co.wait(90);
    // fim do capítulo
    TC.fx.letterbox = 0;
    this.phase = 'tbc';
    TC.fx.bright = 15;
    yield* co.tween(this, 'textA', 1, 90);
    this.tbcChars = 0;
    for (i = 0; i < 90; i++) { this.tbcChars += 0.4; yield; }
    var w = 0;
    while (w++ < 360 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    yield* co.tween(this, 'textA', 0, 60);
    // créditos, com os vaga-lumes
    this.phase = 'credits';
    TC.audio.music('dawn');
    this.credY = H + 10;
    this.credLines = [
      ['cred.1', 2, '#ffffff'], ['', 1], ['cred5.2', 1, '#ffd890'], ['', 1], ['', 1],
      ['cred5.3', 1, '#a0a8d0'], ['cred5.4', 1, '#ffffff'], ['cred5.5', 1, '#ffffff'], ['cred5.6', 1, '#ffffff'], ['', 1], ['', 1],
      ['cred5.7', 1, '#ffe0a0'], ['cred5.8', 1, '#ffe0a0'], ['', 1], ['', 1],
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
    // a história continua: a Linha Esperança (capítulo 6)
    TC.game.fadeTo(function () { return TC.chapterReady(6) ? TC.chapterStart(6) : new TC.TitleScene(); }, 60);
    while (true) yield;
  };
  Ending5Scene.prototype.update = function () {
    this.t++;
    this.dlg.update();
    this.script.update();
    this.parts.update();
    var sn = this.snake;
    // o corpo da cobra de fogo segue a cabeça
    if (sn.a > 0) {
      var P = sn.pts; P[0].x = sn.x; P[0].y = sn.y;
      for (var i = 1; i < P.length; i++) { var dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y, d = Math.max(0.01, Math.sqrt(dx * dx + dy * dy)); P[i].x = P[i - 1].x + dx / d * 7; P[i].y = P[i - 1].y + dy / d * 7; }
      if (this.t % 2 === 0) this.parts.add({ x: P[(this.t >> 1) % P.length].x, y: P[(this.t >> 1) % P.length].y, vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-0.4, 0.4), life: 30, colors: ['#fff0a0', '#ffb040', '#e06010'], size: 1, fade: true, layer: 1, add: true });
    }
    if (this.phase === 'sky') this.dawn = Math.min(1, this.dawn + 0.0006);
    // os vaga-lumes descem devagar sobre as araucárias
    for (var k = this.flies.length - 1; k >= 0; k--) {
      var f = this.flies[k];
      f.vx *= 0.97; f.vy = f.vy * 0.97 + 0.012;
      if (f.vy > 0.35) f.vy = 0.35;
      f.x += f.vx + Math.sin(this.t * 0.03 + f.ph) * 0.2; f.y += f.vy;
      if (--f.life <= 0 || f.y > H + 10) this.flies.splice(k, 1);
    }
    if (this.phase === 'credits' && this.t % 6 === 0 && this.flies.length < 120) this.flies.push({ x: TC.rnd.range(0, W), y: -4, vx: TC.rnd.range(-0.2, 0.2), vy: 0.2, ph: TC.rnd() * 6, sp: TC.rnd.range(0.05, 0.12), life: 1400 });
  };
  Ending5Scene.prototype.draw = function (c) {
    if (this.phase === 'sky') this.drawSky(c);
    else if (this.phase === 'curve') this.drawCurve(c);
    else if (this.phase === 'tbc') this.drawTbc(c);
    else this.drawCredits(c);
    this.dlg.draw(c);
  };
  Ending5Scene.prototype.drawFlies = function (c) {
    var t = this.t;
    this.flies.forEach(function (f) {
      var b = 0.5 + 0.5 * Math.sin(t * f.sp + f.ph);
      if (b < 0.2) return;
      c.fillStyle = b > 0.8 ? '#fffbd0' : '#d8f080';
      c.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      if (b > 0.7) TC.Lighting.glow(c, f.x, f.y, 3, '#e8ff90', 0.35 * b);
    });
  };
  Ending5Scene.prototype.drawSky = function (c) {
    var t = this.t, d = this.dawn, i;
    for (var y = 0; y < H; y++) {
      var k = y / H;
      var morn = k < 0.5 ? TC.mix('#3a5a9a', '#e8a070', k * 2) : TC.mix('#e8a070', '#ffe0a0', (k - 0.5) * 2);
      var pre = TC.mix('#141a40', '#7a5a7a', k);
      c.fillStyle = TC.mix(pre, morn, TC.clamp((d - 0.5) * 2, 0, 1));
      c.fillRect(0, y, W, 1);
    }
    // o sol nascendo atrás da serra
    TC.Lighting.glow(c, 196, this.sunY, 70, '#ffb060', 0.45 + this.burst * 0.2);
    c.fillStyle = TC.mix('#ff9040', '#fff0c0', d); TC.fillCircle(c, 196, this.sunY, 13);
    c.drawImage(this.hills, 0, 104);
    c.globalAlpha = TC.clamp(d, 0, 1); c.drawImage(this.hillsWarm, 0, 104); c.globalAlpha = 1;
    // o vale de Teewald, com os postes voltando
    c.fillStyle = TC.col('#14142a'); TC.fillPoly(c, [[0, H], [0, 150], [60, 146], [128, 152], [200, 144], [256, 150], [256, H]]);
    var lit = this.townLit;
    this.town.forEach(function (l, k) {
      c.fillStyle = k < lit ? l.c : '#2a2a3a';
      c.fillRect(l.x, l.y, 1, 1);
      if (k < lit) TC.Lighting.glow(c, l.x, l.y, 3, l.c, 0.5);
    });
    // a Boitatá subindo
    var sn = this.snake;
    if (sn.a > 0) {
      for (i = sn.pts.length - 1; i >= 0; i--) {
        var pt = sn.pts[i], r = 5 - i * 0.22;
        TC.Lighting.glow(c, pt.x, pt.y, r * 2.2, '#ffa030', 0.6);
        c.fillStyle = i === 0 ? '#fff0b0' : '#ffb040'; TC.fillCircle(c, pt.x, pt.y, r);
        if (i % 3 === 0) { c.fillStyle = '#ffffff'; c.fillRect(Math.round(pt.x), Math.round(pt.y) - 1, 1, 1); }
      }
    }
    // araucárias em primeiro plano
    var a0 = this.arau;
    c.drawImage(a0[0], 8 - a0[0].baseX, H + 8 - a0[0].height);
    c.drawImage(a0[1], 62 - a0[1].baseX, H + 16 - a0[1].height);
    c.drawImage(a0[2], 252 - a0[2].baseX, H + 10 - a0[2].height);
    this.parts.draw(c, 0, 0, 1);
    this.drawFlies(c);
    if (this.cap != null) TC.font.draw(c, TC.t('e5.cap'), 128, 196, '#fff0d0', { align: 'center', shadow: '#000', max: Math.floor(this.cap) });
  };
  Ending5Scene.prototype.drawCurve = function (c) {
    var t = this.t;
    for (var y = 0; y < H; y++) { var k = y / H; c.fillStyle = k < 0.5 ? TC.mix('#4a6aaa', '#e8b080', k * 2) : TC.mix('#e8b080', '#ffe0b0', (k - 0.5) * 2); c.fillRect(0, y, W, 1); }
    TC.Lighting.glow(c, 210, 60, 60, '#ffd090', 0.4);
    c.fillStyle = '#fff4d0'; TC.fillCircle(c, 210, 60, 12);
    c.drawImage(this.hillsWarm, 0, 96);
    // o rio de cerração descendo o vale
    if (this.fog > 0) {
      c.globalAlpha = this.fog * 0.85;
      var o = Math.round(t * 0.6) % 512;
      c.drawImage(this.fogBand, -o, 118); c.drawImage(this.fogBand, 512 - o, 118);
      o = Math.round(t * 0.9) % 512;
      c.drawImage(this.fogBand, -o, 134); c.drawImage(this.fogBand, 512 - o, 134);
      c.globalAlpha = 1;
    }
    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    // a estrada da serra e a defensa
    pc.fillStyle = TC.col('#2a2a34'); pc.fillRect(0, GY, W, 32);
    pc.fillStyle = TC.col('#c8a040'); for (var x = 0; x < W; x += 30) pc.fillRect(x, GY + 14, 14, 2);
    pc.fillStyle = TC.col('#7a7a88'); pc.fillRect(0, GY - 12, W, 3);
    for (x = 6; x < W; x += 32) { pc.fillStyle = TC.col('#3a3a44'); pc.fillRect(x, GY - 12, 3, 12); }
    var a0 = this.arau;
    pc.drawImage(a0[1], 250 - a0[1].baseX, GY + 2 - a0[1].height);
    // o caminhão parado na curva, com os faróis apagados (o Arno e o pai do lado da cabine)
    var tr = this.C5.truckImg, tx = -158, ty = GY - tr.bedTop + 2;
    pc.drawImage(tr, tx, ty);
    var wh = this.C5.wheelImg;
    tr.wheels.forEach(function (w) { pc.drawImage(wh, tx + w[0] - (wh.width >> 1), ty + w[1] - (wh.height >> 1)); });
    var C = this.cast;
    drawFig(pc, this.C3.ewald, this.ew.pose, this.ew.x, GY, this.ew.face, t, this.ew.anim);
    drawFig(pc, A.arno, this.ar.pose === 'walk' ? 'run' : this.ar.pose, this.ar.x, GY, this.ar.face, t, this.ar.anim);
    drawFig(pc, C.rosa, this.ro.pose, this.ro.x, GY, this.ro.face, t, this.ro.anim);
    drawFig(pc, C.frida, this.fr.pose, this.fr.x, GY, this.fr.face, t, this.fr.anim);
    lit(this, pc, '#e8c8b0', [[210, 60, 200, '#ffd090', 0.7]]);
    c.drawImage(this.pf, 0, 0);
    this.drawFlies(c);
  };
  Ending5Scene.prototype.drawTbc = function (c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.globalAlpha = TC.clamp(this.textA, 0, 1);
    var big = TC.ui.bigText(TC.t('end5.chapter'), 2, '#ffffff', '#ffc080', '#06050c');
    c.drawImage(big, 128 - Math.floor(big.width / 2), 80);
    if (this.tbcChars) {
      TC.font.draw(c, TC.t('end5.next'), 128, 116, '#c8a878', { align: 'center', max: Math.floor(this.tbcChars) });
      TC.font.draw(c, TC.t('end.tbc'), 128, 134, '#8088b0', { align: 'center', max: Math.max(0, Math.floor(this.tbcChars) - 20) });
    }
    c.globalAlpha = 1;
  };
  Ending5Scene.prototype.drawCredits = function (c) {
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#1a2a5a', '#e8a878', y / H); c.fillRect(0, y, W, 1); }
    c.drawImage(this.hillsWarm, 0, 134);
    var a0 = this.arau;
    c.drawImage(a0[0], 30 - a0[0].baseX, H + 30 - a0[0].height);
    c.drawImage(a0[2], 236 - a0[2].baseX, H + 40 - a0[2].height);
    c.fillStyle = 'rgba(0,0,10,0.4)'; c.fillRect(0, 0, W, H);
    this.drawFlies(c);
    var yy0 = this.credY, self = this;
    this.credLines.forEach(function (l, k) {
      var yy = Math.round(yy0 + k * 16);
      if (yy < -30 || yy > H + 10 || !l[0]) return;
      var str = l[0] === '@score' ? (TC.t('hud.score') + '  ' + (self.opts.score || 0)) : TC.t(l[0]);
      if (l[1] > 1) { var b = TC.ui.bigText(str, l[1], l[2], '#c08060', '#000000'); c.drawImage(b, 128 - Math.floor(b.width / 2), yy - 4); }
      else TC.font.draw(c, str, 128, yy, l[2], { align: 'center', shadow: '#000' });
    });
  };
  Ending5Scene.prototype.onHide = function () { };
  TC.Ending5Scene = Ending5Scene;
})();
