'use strict';
/* Teewald City — tela-título: voo em Mode 7 sobre a cidade, logotipo com rotação e escala */
(function () {
  var HORIZON = 92;

  function TitleScene() {
    var A = TC.ART;
    this.t = 0;
    this.state = 'logo';
    this.map = A.townMap();
    this.m7 = new TC.Mode7(this.map);
    this.sky = A.sky(TC.W, HORIZON + 4, [[0, '#020309'], [0.55, '#0a0d2a'], [1, '#262a58']], 12, 0.006);
    this.twinkles = A.twinkles(TC.W, HORIZON - 10, 28, 7);
    this.moon = A.moon(11);
    this.ridge = A.hills(512, 40, { seed: 31, color: '#0c0e22', rim: '#2a3060', base: 0.55, amp: 0.7, trees: 60, treeMin: 5, treeMax: 11, period: 6 });
    this.ridge2 = A.hills(512, 30, { seed: 77, color: '#161a3a', rim: '#30386a', base: 0.5, amp: 0.8, period: 5 });
    this.logo1 = TC.ui.bigText('TEEWALD', 4, '#f4f0ff', '#5866a8', '#06050c');
    this.logo2 = TC.ui.bigText('CITY', 2, '#ffd890', '#c06030', '#06050c');
    this.leafSprites = A.leaves();
    this.parts = new TC.Particles();
    this.save = TC.store.get('save', null);
    this.buildMenus();
  }

  TitleScene.prototype.buildMenus = function () {
    var self = this;
    this.main = new TC.Menu([
      { label: function () { return TC.t('menu.new'); }, act: function () { self.chapter = 1; self.state = 'diff'; self.diffMenu.sel = TC.DIFFS.indexOf(TC.opts.diff); } },
      { label: function () { return TC.t('menu.continue'); }, act: function () { self.continueGame(); }, disabled: !this.save },
      { label: function () { return TC.t('menu.chapters'); }, act: function () { self.state = 'chapters'; self.chapMenu.sel = 0; } },
      { label: function () { return TC.t('menu.options'); }, act: function () { self.state = 'options'; self.opt.sel = 0; } },
      { label: function () { return TC.t('menu.controls'); }, act: function () { self.state = 'controls'; } }
    ], { startConfirms: true });
    // escolha da dificuldade antes de começar o novo jogo
    this.diffMenu = new TC.Menu(TC.DIFFS.map(function (k) {
      return { label: function () { return TC.t('diff.' + k); }, act: function () { TC.opts.diff = k; TC.saveOpts(); self.fromDiff = true; self.newGame(); } };
    }), { startConfirms: true, back: function () { self.state = self.chapter > 1 ? 'chapters' : 'menu'; } });
    // escolha do capítulo (todos liberados), depois a dificuldade
    this.chapNums = TC.chapterList();
    this.chapMenu = new TC.Menu(this.chapNums.map(function (n) {
      return { label: function () { return TC.t('chap.' + n); }, act: function () { self.chapter = n; self.state = 'diff'; self.diffMenu.sel = TC.DIFFS.indexOf(TC.opts.diff); } };
    }), { startConfirms: true, back: function () { self.state = 'menu'; } });
    function toggle(key) { return function () { TC.opts[key] = !TC.opts[key]; TC.saveOpts(); TC.applyDisplay(); }; }
    function vol(key, d) { return function () { TC.opts[key] = TC.clamp(TC.opts[key] + d, 0, 10); TC.saveOpts(); TC.audio.setVolumes(); }; }
    function bar(v) { var s = ''; for (var i = 0; i < 10; i++) s += i < v ? '|' : '·'; return s; }
    var langT = function () { TC.opts.lang = TC.opts.lang === 'pt' ? 'en' : 'pt'; TC.saveOpts(); };
    var aspT = function () { TC.opts.aspect = TC.opts.aspect === 'tv' ? 'square' : 'tv'; TC.saveOpts(); TC.applyDisplay(); };
    this.opt = new TC.Menu([
      { label: function () { return TC.t('opt.diff'); }, value: function () { return TC.t('diff.' + TC.opts.diff); }, left: function () { TC.cycleDiff(-1); }, right: function () { TC.cycleDiff(1); } },
      { label: function () { return TC.t('opt.lang'); }, value: function () { return TC.t('lang.name'); }, left: langT, right: langT },
      { label: function () { return TC.t('opt.crt'); }, value: function () { return TC.t(TC.opts.crt ? 'on' : 'off'); }, left: toggle('crt'), right: toggle('crt') },
      { label: function () { return TC.t('opt.chroma'); }, value: function () { return TC.t(TC.opts.chroma ? 'on' : 'off'); }, left: toggle('chroma'), right: toggle('chroma') },
      { label: function () { return TC.t('opt.aspect'); }, value: function () { return TC.t('aspect.' + TC.opts.aspect); }, left: aspT, right: aspT },
      { label: function () { return TC.t('opt.music'); }, value: function () { return bar(TC.opts.music); }, left: vol('music', -1), right: vol('music', 1), repeat: true },
      { label: function () { return TC.t('opt.sfx'); }, value: function () { return bar(TC.opts.sfx); }, left: vol('sfx', -1), right: vol('sfx', 1), repeat: true },
      { label: function () { return TC.t('opt.full'); }, act: function () { TC.toggleFullscreen(); } },
      { label: function () { return TC.t('opt.back'); }, act: function () { self.state = 'menu'; } }
    ], { back: function () { self.state = 'menu'; } });
    TC.input.touchOptions(this.opt.items);   // tamanho dos botões na tela e vibração (só em telas de toque)
    // controle físico: logo antes de "TELA CHEIA"
    var items = this.opt.items, fi = items.length - 2;
    for (var i = 0; i < items.length; i++) if (items[i].label() === TC.t('opt.full')) { fi = i; break; }
    items.splice(fi, 0, { label: function () { return TC.t('opt.pad'); }, act: function () { self.state = 'pad'; self.padMenu.sel = 0; } });
    var vibeT = function () {
      TC.opts.vibe = !TC.opts.vibe;
      TC.store.set('vibe', TC.opts.vibe);
      if (TC.opts.vibe) TC.input.rumble(0.7, 0.7, 220);
    };
    this.padMenu = new TC.Menu([
      { label: function () { return TC.t('pad.map'); }, act: function () { self.startPadMap(); } },
      { label: function () { return TC.t('opt.vibe'); }, value: function () { return TC.t(TC.opts.vibe ? 'on' : 'off'); }, left: vibeT, right: vibeT },
      { label: function () { return TC.t('pad.reset'); }, act: function () { TC.ui.toast([TC.t(TC.input.padReset() ? 'pad.reseted' : 'pad.none')]); } },
      { label: function () { return TC.t('opt.back'); }, act: function () { self.state = 'options'; } }
    ], { back: function () { self.state = 'options'; } });
  };

  /* configuração dos botões: o jogo pede cada ação e grava o que for apertado */
  TitleScene.prototype.startPadMap = function () {
    var self = this;
    var ok = TC.input.padConfig.start(function (saved) {
      self.state = 'pad';
      TC.ui.toast([TC.t(saved ? 'pad.saved' : 'pad.cancel')]);
      if (saved) TC.audio.sfx('confirm');
    });
    if (ok) this.state = 'padmap';
    else TC.ui.toast([TC.t('pad.none'), TC.t('pad.none2')], 3000);
  };

  /* a cena que abre cada capítulo (o prólogo) */
  TC.chapterStart = function (n) {
    var S = n > 1 && TC.chapterReady(n) ? TC['Ch' + n + 'IntroScene'] : null;
    if (S) return new S();
    return new TC.IntroScene();
  };

  TitleScene.prototype.enter = function () {
    TC.audio.music('title');
    TC.audio.ambience('night');
  };
  TitleScene.prototype.exit = function () { TC.audio.ambienceStop(); };

  TitleScene.prototype.newGame = function () {
    TC.store.set('save', null);
    TC.audio.stopMusic(1.2);
    var n = this.chapter || 1;
    TC.game.fadeTo(function () { return TC.chapterStart(n); }, 50);
    this.state = 'leaving';
  };
  TitleScene.prototype.continueGame = function () {
    var s = this.save;
    TC.audio.stopMusic(1.0);
    // terminou um capítulo e ainda não começou o seguinte: começa pelo prólogo dele
    if (s && s.ch > 1 && !TC.chapterReady(s.ch)) s = null;
    if (!s) TC.game.fadeTo(function () { return new TC.TitleScene(); }, 40);
    else if (s.ch > 1 && s.fresh) TC.game.fadeTo(function () { return TC.chapterStart(s.ch); }, 40);
    else TC.game.fadeTo(function () { return new TC.StageScene({ save: s }); }, 40);
    this.state = 'leaving';
  };

  TitleScene.prototype.update = function () {
    this.t++;
    var t = this.t;
    // folhas de outono caindo
    if (t % 9 === 0) {
      var ls = this.leafSprites[TC.rnd.int(0, 2)];
      this.parts.add({ x: TC.rnd.range(-20, 260), y: -6, vx: TC.rnd.range(0.2, 0.7), vy: TC.rnd.range(0.35, 0.7), life: 520, wobble: 0.05, phase: TC.rnd() * 6,
        sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
    }
    this.parts.update();
    if (TC.game.fading()) return;
    if (this.state === 'logo') {
      if (t > 120 || (t > 20 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) { this.state = 'menu'; this.t = Math.max(this.t, 120); TC.input.clear(); }
    } else if (this.state === 'menu') {
      this.main.update();
    } else if (this.state === 'diff') {
      this.diffMenu.update();
    } else if (this.state === 'chapters') {
      this.chapMenu.update();
    } else if (this.state === 'options') {
      this.opt.update();
    } else if (this.state === 'pad') {
      this.padMenu.update();
    } else if (this.state === 'padmap') {
      // o controle está sendo lido pela configuração: cancela pelo teclado (ESC) ou tocando na tela
      if (TC.input.pressed('back') || TC.input.tap()) TC.input.padConfig.cancel();
    } else if (this.state === 'controls') {
      if (TC.input.pressed('confirm') || TC.input.pressed('back') || TC.input.pressed('start')) { TC.audio.sfx('cancel'); this.state = 'menu'; }
    }
  };

  TitleScene.prototype.drawLogo = function (c) {
    var t = this.t;
    var k = TC.clamp(t / 100, 0, 1);
    var e = TC.ease.outCubic(k);
    var scale = 7 - 6 * e;
    var rot = (1 - e) * -2.4;
    var cx = 128, cy = 38;
    c.save();
    c.translate(cx, cy);
    c.rotate(rot);
    c.scale(scale, scale);
    c.globalAlpha = TC.clamp(k * 2, 0, 1);
    c.drawImage(this.logo1, -Math.floor(this.logo1.width / 2), -Math.floor(this.logo1.height / 2));
    c.restore();
    c.globalAlpha = 1;
    if (t > 90) {
      var k2 = TC.ease.outBack(TC.clamp((t - 90) / 30, 0, 1));
      var w2 = Math.max(1, Math.round(this.logo2.width * k2)), h2 = Math.max(1, Math.round(this.logo2.height * k2));
      c.drawImage(this.logo2, 128 - Math.floor(w2 / 2) + 38, 60 - Math.floor(h2 / 2), w2, h2);
      // brilho que atravessa o logotipo
      var sx = ((t - 120) % 300) * 1.6 - 60;
      if (sx > -20 && sx < 300) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.5;
        c.fillStyle = '#ffffff';
        for (var yy = 18; yy < 58; yy++) {
          var off = sx - (yy - 18) * 0.5;
          var lx = Math.round(128 - this.logo1.width / 2 + off);
          if (lx < 128 + this.logo1.width / 2 && lx > 128 - this.logo1.width / 2) c.fillRect(lx, yy, 3, 1);
        }
        c.restore();
      }
    }
  };

  TitleScene.prototype.draw = function (c) {
    var t = this.t;
    // câmera orbitando a cidade
    var th = t * 0.0022 + 0.6;
    var R = 175;
    var cam = {
      x: 256 - Math.sin(th) * R, y: 256 + Math.cos(th) * R,
      height: 34 + Math.sin(t * 0.004) * 4, horizon: HORIZON, focal: 150,
      fog: '#14183c', fogDist: 520
    };
    cam.angle = Math.atan2(256 - cam.x, -(256 - cam.y));
    // céu
    c.drawImage(this.sky, 0, 0);
    TC.ART.drawTwinkles(c, this.twinkles, t, 0, 0);
    var ang = ((cam.angle % TC.TAU) + TC.TAU) % TC.TAU;
    var da = (((2.2 - ang) % TC.TAU) + TC.TAU + Math.PI) % TC.TAU - Math.PI;
    var mx = Math.round(128 + da * 150);
    if (mx > -60 && mx < 316) c.drawImage(this.moon, mx - this.moon.width / 2, 26 - this.moon.height / 2);
    var off2 = Math.round((ang / TC.TAU) * 512 * 0.6) % 512;
    c.drawImage(this.ridge2, -off2, HORIZON - 26); c.drawImage(this.ridge2, 512 - off2, HORIZON - 26);
    var off = Math.round((ang / TC.TAU) * 512) % 512;
    c.drawImage(this.ridge, -off, HORIZON - 30); c.drawImage(this.ridge, 512 - off, HORIZON - 30);
    // plano Mode 7
    var plane = this.m7.render(cam);
    c.drawImage(plane, 0, 0);
    // luzes da cidade sobre o plano
    var lamps = this.map.lamps;
    for (var i = 0; i < lamps.length; i++) {
      var p = this.m7.project(cam, lamps[i][0], lamps[i][1]);
      if (!p || p.y < HORIZON || p.y > TC.H) continue;
      var r = TC.clamp(p.s * 7, 2, 16);
      TC.Lighting.glow(c, p.x, p.y, r, '#ffb050', 0.55);
    }
    // neblina no horizonte
    for (var y = 0; y < 14; y++) {
      c.fillStyle = TC.rgba('#3a3e70', 0.32 * (1 - y / 14));
      c.fillRect(0, HORIZON - 4 + y, TC.W, 1);
    }
    this.parts.draw(c);
    this.drawLogo(c);

    if (t > 110) {
      if (this.state === 'diff' || (this.state === 'leaving' && this.fromDiff)) {
        TC.ui.box(c, 20, 88, 216, 128, 'menu', 0.94);
        TC.font.draw(c, TC.t('diff.title'), 128, 96, '#ffd890', { align: 'center', shadow: '#000' });
        this.diffMenu.draw(c, 128, 114, { align: 'center' });
        var key = TC.DIFFS[this.diffMenu.sel];
        TC.font.wrap(TC.t('diff.' + key + '.d'), 196).forEach(function (ln, k) {
          TC.font.draw(c, ln, 128, 160 + k * 11, '#c8c8e8', { align: 'center', shadow: '#000' });
        });
        TC.font.draw(c, TC.t('diff.change'), 128, 202, '#6a70a0', { align: 'center', shadow: '#000' });
      } else if (this.state === 'chapters') {
        // com muitos capítulos a lista fica mais junta e a caixa sobe
        var nch = this.chapNums.length, lhc = nch > 4 ? 10 : 14;
        var listH = nch * lhc, by0 = Math.min(86, 216 - (44 + listH + 26));
        TC.ui.box(c, 20, by0, 216, 216 - by0 - 2, 'menu', 0.94);
        TC.font.draw(c, TC.t('chap.title'), 128, by0 + 8, '#ffd890', { align: 'center', shadow: '#000' });
        this.chapMenu.draw(c, 128, by0 + 24, { align: 'center', lineH: lhc });
        var dy0 = by0 + 24 + listH + 6;
        TC.font.wrap(TC.t('chap.' + this.chapNums[this.chapMenu.sel] + '.d'), 196).forEach(function (ln, k) {
          TC.font.draw(c, ln, 128, dy0 + k * 11, '#c8c8e8', { align: 'center', shadow: '#000' });
        });
      } else if (this.state === 'menu' || this.state === 'leaving') {
        TC.ui.box(c, 72, 126, 112, 78, 'menu', 0.85);
        this.main.draw(c, 128, 134, { align: 'center' });
        TC.font.draw(c, TC.t('title.copy'), 128, 210, '#6a70a0', { align: 'center', shadow: '#000' });
      } else if (this.state === 'logo') {
        if ((t >> 5) % 2 === 0) TC.font.draw(c, TC.t('boot.press'), 128, 160, '#f0e0c0', { align: 'center', shadow: '#000' });
      } else if (this.state === 'options') {
        // a caixa cresce para cima conforme o número de opções (em telas de toque há duas a mais)
        var n = this.opt.items.length, lh = n >= 12 ? 10 : n >= 10 ? 11 : 13;
        var bh = 26 + n * lh, by = 216 - bh;
        TC.ui.box(c, 16, by, 224, bh, 'menu', 0.94);
        TC.font.draw(c, TC.t('opt.title'), 128, by + 8, '#ffd890', { align: 'center', shadow: '#000' });
        this.opt.draw(c, 36, by + 24, { valueX: 186, lineH: lh });
      } else if (this.state === 'controls') {
        TC.ui.box(c, 12, 70, 232, 146, 'menu', 0.94);
        TC.font.draw(c, TC.t('ctrl.title'), 128, 78, '#ffd890', { align: 'center', shadow: '#000' });
        var rows = [['ctrl.move', 'ctrl.keys1'], ['ctrl.jump', 'ctrl.keys2'], ['ctrl.attack', 'ctrl.keys3'], ['ctrl.special', 'ctrl.keys4'], ['ctrl.pause', 'ctrl.keys5'], ['ctrl.read', 'ctrl.keys6'], ['ctrl.shoot', 'ctrl.keys7']];
        rows.forEach(function (r2, k) {
          TC.font.draw(c, TC.t(r2[0]), 24, 94 + k * 13, '#e0e0f0', { shadow: '#000' });
          TC.font.draw(c, TC.t(r2[1]), 232, 94 + k * 13, '#ffc070', { shadow: '#000', align: 'right' });
        });
        TC.font.draw(c, TC.t('ctrl.pad'), 128, 188, '#9098c0', { align: 'center', shadow: '#000' });
        if (!TC.input.touchUI() && TC.input.device() !== 'pad') TC.font.draw(c, 'F: ' + TC.t('opt.full') + '   M: MUTE', 128, 201, '#6a70a0', { align: 'center', shadow: '#000' });
      } else if (this.state === 'pad') {
        this.drawPad(c);
      } else if (this.state === 'padmap') {
        this.drawPadMap(c);
      }
    }
  };

  var CENTER = { align: 'center', shadow: '#000' };
  /* tela do controle: modelo detectado, opções e um teste ao vivo dos botões */
  TitleScene.prototype.drawPad = function (c) {
    TC.ui.box(c, 12, 70, 232, 146, 'menu', 0.94);
    TC.font.draw(c, TC.t('pad.title'), 128, 78, '#ffd890', CENTER);
    var info = TC.input.pad();
    if (info) {
      var bad = info.fam === 'gen' && !info.custom;
      TC.font.draw(c, TC.t('pad.fam.' + info.fam), 128, 92, '#ffffff', CENTER);
      TC.font.draw(c, TC.t(info.custom ? 'pad.custom' : bad ? 'pad.gen' : 'pad.std'), 128, 103, bad ? '#ff9070' : '#9098c0', CENTER);
    } else {
      TC.font.draw(c, TC.t('pad.none'), 128, 92, '#ff9070', CENTER);
      TC.font.draw(c, TC.t('pad.none2'), 128, 103, '#9098c0', CENTER);
    }
    this.padMenu.draw(c, 40, 118, { valueX: 176, lineH: 13 });
    // cada ação acende enquanto o botão dela está apertado
    var rows = [
      [['', TC.t('pad.test') + ':'], ['up', '↑'], ['down', '↓'], ['left', '◀'], ['right', '▶']],
      [['jump', TC.t('tb.jump')], ['attack', TC.t('tb.attack')], ['special', TC.t('tb.special')], ['shoot', TC.t('pad.shoot')], ['start', 'START']]
    ];
    rows.forEach(function (row, r) {
      var w = 0, gap = 8;
      row.forEach(function (it) { w += TC.font.measure(it[1]) + gap; });
      var x = Math.round(128 - (w - gap) / 2);
      row.forEach(function (it) {
        var on = it[0] && TC.input.down(it[0]);
        TC.font.draw(c, it[1], x, 176 + r * 12, !it[0] ? '#9098c0' : on ? '#ffe090' : '#4a5078', { shadow: '#000' });
        x += TC.font.measure(it[1]) + gap;
      });
    });
  };

  TitleScene.prototype.drawPadMap = function (c) {
    TC.ui.box(c, 12, 70, 232, 146, 'menu', 0.94);
    TC.font.draw(c, TC.t('padmap.title'), 128, 78, '#ffd890', CENTER);
    var s = TC.input.padConfig.state();
    if (!s) return;
    TC.font.draw(c, (s.step + 1) + ' / ' + s.n, 128, 92, '#9098c0', CENTER);
    TC.font.draw(c, TC.t(s.wait ? 'padmap.release' : 'padmap.press'), 128, 112, '#c8c8e0', CENTER);
    var col = s.wait ? '#6a70a0' : (this.t >> 4) % 2 ? '#ffffff' : '#ffe090';
    TC.font.draw(c, TC.t('padmap.' + s.act), 128, 128, col, { align: 'center', shadow: '#000', scale: 2 });
    if (s.err) TC.font.draw(c, TC.t('padmap.used'), 128, 160, '#ff7060', CENTER);
    else if (s.optional && !s.wait) TC.font.draw(c, TC.t('padmap.skip') + s.left + 's', 128, 160, '#9098c0', CENTER);
    TC.font.draw(c, TC.t('padmap.cancel'), 128, 200, '#6a70a0', CENTER);
  };
  TC.TitleScene = TitleScene;
})();
