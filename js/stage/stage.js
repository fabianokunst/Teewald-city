'use strict';
/* Teewald City — cena da fase: jogo, câmera, arenas, iluminação, HUD e sequências roteirizadas */
(function () {
  var A = TC.ART;
  var E = TC.ent;
  var co = TC.co;
  var W = TC.W, H = TC.H;

  function StageScene(opts) {
    this.opts = opts || {};
    this.t = 0;
    this.level = TC.buildLevel1();
    this.groundY = 192;
    A.crate_ = A.crate_ || A.crate();
    A.barrel_ = A.barrel_ || A.barrel();
    A.shrineOff = A.shrineOff || shrineSprite(false);
    A.shrineOn = A.shrineOn || shrineSprite(true);
    this.candles = A.candles_ = A.candles_ || A.candle();
    this.prepareBackground();
    this.tileCv = this.renderTiles();
    this.pf = TC.canvas(W, H);
    this.maskCv = TC.canvas(W, H);
    this.light = new TC.Lighting(W, H);
    this.parts = new TC.Particles();
    this.dlg = new TC.Dialog();
    this.enemies = []; this.items = []; this.props = []; this.orbs = []; this.texts = []; this.deco = [];
    this.score = 0; this.lives = TC.diff().lives; this.time = 0;
    this.cp = 0;
    this.arena = null;
    this.combo = 0; this.comboT = 0;
    this.mode = 'play';
    this.goT = 0;
    this.hint = null;
    this.banner = null;
    this.ebar = null;
    this.boss = null;
    this.bossBarFill = 0;
    var L = this.level, self = this;
    L.props.forEach(function (p) { self.props.push(new E.Breakable(p.kind, p.x, self.groundAt(p.x), p.drop)); });
    L.items.forEach(function (it) { self.items.push(new E.Item(it.type, it.x, it.y, false)); });
    var px = 64;
    if (this.opts.save) {
      var s = this.opts.save;
      this.cp = s.cp || 0; this.score = s.score || 0; this.lives = s.lives || TC.diff().lives;
      px = L.cps[this.cp].x;
      L.arenas.forEach(function (a) { if (a.cp < self.cp || a.x0 + W < px - 40) a.done = true; });
      L.spawns.forEach(function (sp) { if (sp.x < px + 120) sp.done = true; });
      L.barks.forEach(function (b) { if (b.x < px) b.done = true; });
      L.shrines.forEach(function (sh) { if (sh.cp <= self.cp) sh.lit = true; });
    }
    this.player = new TC.Player(px, this.groundAt(px));
    this.camX = TC.clamp(px - 100, 0, L.pxW - W);
    this.hudFace = TC.crop(A.arno.idle[0], 14, 12, 17, 15);
    var self2 = this;
    this.pauseMenu = new TC.Menu([
      { label: function () { return TC.t('pause.resume'); }, act: function () { self2.mode = 'play'; TC.input.clear(); } },
      { label: function () { return TC.t('opt.diff'); }, value: function () { return TC.t('diff.' + TC.opts.diff); }, left: function () { TC.cycleDiff(-1); }, right: function () { TC.cycleDiff(1); } },
      { label: function () { return TC.t('opt.lang'); }, value: function () { return TC.t('lang.name'); }, left: toggleLang, right: toggleLang },
      { label: function () { return TC.t('opt.music'); }, value: function () { return String(TC.opts.music); }, left: function () { vol('music', -1); }, right: function () { vol('music', 1); } },
      { label: function () { return TC.t('opt.crt'); }, value: function () { return TC.t(TC.opts.crt ? 'on' : 'off'); }, left: toggle('crt'), right: toggle('crt') },
      { label: function () { return TC.t('pause.quit'); }, act: function () { self2.quit(); } }
    ], { back: function () { self2.mode = 'play'; TC.input.clear(); } });
    function toggleLang() { TC.opts.lang = TC.opts.lang === 'pt' ? 'en' : 'pt'; TC.saveOpts(); }
    function vol(k, d) { TC.opts[k] = TC.clamp(TC.opts[k] + d, 0, 10); TC.saveOpts(); TC.audio.setVolumes(); }
    function toggle(k) { return function () { TC.opts[k] = !TC.opts[k]; TC.saveOpts(); TC.applyDisplay(); }; }
  }

  function shrineSprite(lit) {
    return TC.sprite([
      '......kk......',
      '.....kyyk.....',
      '......kk......',
      '....kkkkkk....',
      '...kwwwwwwk...',
      '..kwwwwwwwwk..',
      '.kwwwwwwwwwwk.',
      '.kwkkkkkkkkwk.',
      '.kwkddddddkwk.',
      '.kwkd' + (lit ? 'f' : 'd') + 'dd' + (lit ? 'f' : 'd') + 'dkwk.',
      '.kwkdcddcdkwk.',
      '.kwkdcddcdkwk.',
      '.kwkkkkkkkkwk.',
      '.kwwwwwwwwwwk.',
      '.kkkkkkkkkkkk.',
      '.....kppk.....',
      '.....kppk.....',
      '.....kppk.....',
      '.....kppk.....',
      '.....kppk.....',
      '.....kppk.....',
      '....kkppkk....'
    ], { k: '#1a1414', w: '#e0dcd0', y: '#c8b070', d: '#2a2030', c: '#e8e0d0', f: '#ffd060', p: '#5a3a28' });
  }

  /* ---------- preparação ---------- */
  StageScene.prototype.prepareBackground = function () {
    var bg = this.bg = {};
    bg.sky = A.sky(W, H, [[0, '#020309'], [0.45, '#0a0d2a'], [0.8, '#1a1e48'], [1, '#2a2e60']], 77, 0.006);
    bg.tw = A.twinkles(W, 110, 30, 31);
    bg.moon = A.moon(13);
    bg.far = A.hills(512, 70, { seed: 5, color: '#1c2046', rim: '#363e78', base: 0.45, amp: 0.6, trees: 40, treeMin: 5, treeMax: 10, period: 6 });
    bg.mid = A.hills(512, 90, { seed: 9, color: '#111430', rim: '#262c58', base: 0.4, amp: 0.5, trees: 55, treeMin: 8, treeMax: 16, period: 6 });
    var tl = TC.canvas(768, 140), c = tl.ctx;
    var r = TC.RNG(4242);
    for (var i = 0; i < 26; i++) {
      var h = r.int(70, 130);
      var tr = r() < 0.75 ? A.araucaria(500 + i, h, { sil: '#0b0d20', rim: '#1c2350' }) : A.pine(600 + i, Math.round(h * 0.6), { sil: '#0b0d20' });
      var tx = r.int(0, 767);
      c.drawImage(tr, tx - tr.baseX, 140 - tr.height);
      c.drawImage(tr, tx - tr.baseX - 768, 140 - tr.height);
      c.drawImage(tr, tx - tr.baseX + 768, 140 - tr.height);
    }
    c.fillStyle = TC.col('#0b0d20');
    c.fillRect(0, 128, 768, 12);
    bg.trees = tl;
    var ch = A.church();
    bg.spire = TC.silhouette(TC.scaleCanvas(ch, 0.42), '#121530');
    bg.fog = A.fog(512, 52, 21, '#8a8ab8');
    bg.fogFront = A.fog(512, 40, 33, '#9a9ac8');
  };

  StageScene.prototype.renderTiles = function () {
    var L = this.level, T = A.tiles();
    this.T = T;
    var cv = TC.canvas(L.pxW, L.pxH), c = cv.ctx;
    for (var tx = 0; tx < L.w; tx++) {
      for (var ty = 0; ty < L.h; ty++) {
        var code = L.tile(tx, ty);
        if (!code || code === 4) continue;
        var above = L.tile(tx, ty - 1);
        var openAbove = !E.isSolid(above) && above !== 2;
        var st = L.style[tx];
        var v = (tx * 7 + ty * 3) % 2;
        var img;
        if (code === 1) {
          if (openAbove) img = st === 'square' ? T.hexTop[v] : (st === 'grass' || st === 'stairs') ? T.grassTop[v] : T.walkTop[v];
          else img = (st === 'grass' || st === 'stairs') ? T.dirt[v] : st === 'square' ? T.cobble[v] : T.cobble[v];
        } else if (code === 3) img = openAbove ? T.stoneTop : T.stone;
        else if (code === 2 || code === 5) img = T.plank;
        if (img) c.drawImage(img, tx * 16, ty * 16);
      }
    }
    return cv;
  };

  StageScene.prototype.groundAt = function (x) {
    var L = this.level, tx = Math.floor(x / 16);
    for (var ty = 0; ty < L.h; ty++) if (E.isSolid(L.tile(tx, ty)) || L.tile(tx, ty) === 2) return ty * 16;
    return this.groundY;
  };

  /* ---------- ciclo de vida ---------- */
  StageScene.prototype.enter = function () {
    TC.audio.ambience('night');
    if (this.opts.fromIntro) this.cine = new TC.Script(this.wakeSeq());
    else this.cine = new TC.Script(this.startSeq());
    if (TC.params.x) {
      var x = parseInt(TC.params.x, 10);
      this.player.x = x; this.player.y = this.groundAt(x);
      this.camX = TC.clamp(x - 100, 0, this.level.pxW - W);
      this.level.arenas.forEach(function (a) { if (a.x0 + W < x) a.done = true; });
      this.level.spawns.forEach(function (sp) { if (sp.x < x) sp.done = true; });
      this.level.barks.forEach(function (b) { if (b.x < x + 40) b.done = true; });
      this.cine = new TC.Script(this.startSeq());
      if (TC.params.god) this.player.maxHp = this.player.hp = 99;
    }
  };
  StageScene.prototype.exit = function () { TC.audio.ambienceStop(); TC.fx.letterbox = 0; };

  StageScene.prototype.quit = function () {
    TC.audio.stopMusic(0.6);
    this.mode = 'leaving';
    TC.game.fadeTo(function () { return new TC.TitleScene(); }, 40);
  };

  StageScene.prototype.save = function () {
    TC.store.set('save', { cp: this.cp, score: this.score, lives: this.lives });
  };

  /* ---------- API usada pelas entidades ---------- */
  StageScene.prototype.addScore = function (n) { this.score += n; };
  StageScene.prototype.floatText = function (x, y, str, col) { this.texts.push(new E.FloatText(x, y, str, col)); };
  StageScene.prototype.spark = function (x, y, big) {
    var S = A.spark;
    this.parts.add({ x: x, y: y, life: 10, layer: 1, sprite: function (p, k) { return S[k > 0.66 ? 0 : k > 0.33 ? 1 : 2]; } });
    if (big) for (var i = 0; i < 6; i++) this.parts.add({ x: x, y: y, vx: TC.rnd.range(-2.5, 2.5), vy: TC.rnd.range(-2.5, 1), life: 14, color: '#ffe0a0', size: 1, layer: 1 });
  };
  StageScene.prototype.dust = function (x, y) {
    var D = A.dust;
    for (var i = -1; i <= 1; i += 2) this.parts.add({ x: x + i * 4, y: y - 2, vx: i * 0.5, vy: -0.2, life: 16, sprite: function (p, k) { return D[k > 0.5 ? 0 : 1]; } });
  };
  StageScene.prototype.showEnemyBar = function (e) { this.ebar = { e: e, t: 150 }; };
  StageScene.prototype.kill = function (e) {
    this.comboT = Math.max(this.comboT, 60);
    // no fácil e no normal, às vezes o inimigo derrotado deixa cair comida
    if (e && !e.isBoss && !this.noDrops && e.y < this.level.pxH && TC.rnd() < TC.diff().drop) {
      this.items.push(new E.Item(TC.rnd() < 0.5 ? 'linguica' : 'cuca', e.x, Math.min(e.y, this.groundY - 8), true));
    }
  };
  /* limita quantos inimigos atacam ao mesmo tempo (no fácil, um de cada vez) */
  StageScene.prototype.mayAttack = function (who) {
    var busy = 0, max = TC.diff().attackers;
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (e !== who && e.alive && !e.dying && e.attacking && e.attacking()) busy++;
    }
    return busy < max;
  };
  StageScene.prototype.spawnEnemy = function (type, x, y, opt) {
    opt = opt || {};
    var C = TC.ENEMIES[type];
    var e;
    if (type === 'boss') e = new C(x, y, opt.arena);
    else e = new C(x, y, opt);
    if (type === 'flame') e.side = x < this.camX + W / 2 ? -1 : 1;
    this.enemies.push(e);
    return e;
  };
  StageScene.prototype.killAllMinions = function () {
    var self = this;
    this.noDrops = true;
    this.enemies.forEach(function (e) { if (e.alive && !e.isBoss && !e.dying) e.die(self, 1); });
    this.noDrops = false;
    this.orbs.length = 0;
  };

  StageScene.prototype.playerAttack = function (p, atk, box, id) {
    var hitAny = false, self = this;
    var lists = [this.enemies, this.props, this.orbs];
    for (var li = 0; li < lists.length; li++) {
      var arr = lists[li];
      for (var i = 0; i < arr.length; i++) {
        var t = arr[i];
        if (!t.alive || t.dying) continue;
        var hb = t.hurtBox();
        if (!TC.overlap(box, hb)) continue;
        var dir = atk.around ? (t.x < p.x ? -1 : 1) : p.face;
        if (t.hit(self, atk.dmg, dir, atk.kb, id, atk)) {
          hitAny = true;
          var sx = (Math.max(box.x, hb.x) + Math.min(box.x + box.w, hb.x + hb.w)) / 2;
          var sy = (Math.max(box.y, hb.y) + Math.min(box.y + box.h, hb.y + hb.h)) / 2;
          this.spark(sx, sy, atk.heavy);
          if (!t.isProp && !t.isOrb) {
            p.hitstop = atk.stop;
            this.combo++;
            this.comboT = 80;
            this.addScore(10 * Math.min(this.combo, 10));
            if (atk.heavy) TC.fx.shake(2, 6);
            if (p.state === 'airkick') p.vy = Math.min(p.vy, -2.4);
            if (!this.firstHitHint) { this.firstHitHint = true; this.hint = { key: 'hint.combo', t: 300 }; }
          }
        }
      }
    }
    return hitAny;
  };

  StageScene.prototype.playerFell = function (p) {
    p.hp -= 2 * TC.diff().dmg;
    TC.audio.sfx('hurt');
    for (var i = 0; i < 14; i++) this.parts.add({ x: p.x, y: 208, vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-3, -1), ay: 0.15, life: 30, color: TC.rnd.pick(['#8aa0c8', '#c0d0f0', '#4a5a8a']), size: 2, fade: true });
    if (p.hp <= 0) {
      p.hp = 0;
      p.x = p.lastSafe.x; p.y = p.lastSafe.y;
      p.setState('dead'); p.t = 140; p.vx = 0; p.vy = 0;
      return;
    }
    var back = p.face > 0 ? -18 : 18;
    p.x = p.lastSafe.x + back * 0; p.y = p.lastSafe.y - 1;
    p.vx = 0; p.vy = 0;
    p.inv = Math.round(100 * TC.diff().inv);
    p.setState('normal');
  };

  StageScene.prototype.onPlayerDying = function () { this.combo = 0; };
  StageScene.prototype.onPlayerDead = function () {
    var self = this;
    this.lives--;
    if (this.lives > 0) {
      this.mode = 'respawn';
      TC.fx.fadeOut(30);
      this.cine = new TC.Script((function* () {
        yield* co.wait(34);
        self.respawn();
        TC.fx.fadeIn(30);
        self.mode = 'play';
      })());
    } else {
      this.mode = 'continue';
      this.contT = 10 * 60 - 1;
      TC.audio.music('gameover');
    }
  };

  StageScene.prototype.respawn = function () {
    var L = this.level, p = this.player;
    var cpx = L.cps[this.cp].x;
    p.x = cpx; p.y = this.groundAt(cpx);
    p.vx = p.vy = 0;
    p.hp = p.maxHp;
    p.setState('normal');
    p.inv = Math.round(120 * TC.diff().inv);
    this.enemies = []; this.orbs = [];
    if (this.arena) {
      this.arena = null;
      L.minX = 0; L.maxX = L.pxW;
    }
    if (this.boss) {
      if (TC.diff().keepBoss && this.boss.hp > 0) this.boss.arena.bossHpLeft = this.boss.hp;
      this.boss = null; this.bossBarFill = 0; TC.audio.stopMusic(0.3);
    }
    L.arenas.forEach(function (a) { if (!a.done) a.started = false; });
    this.camX = TC.clamp(p.x - 100, 0, L.pxW - W);
    this.combo = 0;
    if (TC.audio.musicName() !== 'stage1') TC.audio.music('stage1');
  };

  /* ---------- arenas ---------- */
  StageScene.prototype.startArena = function (a) {
    var L = this.level;
    this.arena = a;
    a.started = true;
    this.waveIdx = 0;
    this.waveDelay = 40;
    L.minX = a.x0 + 2;
    L.maxX = a.x0 + W - 2;
    if (a.cp != null && a.cp > this.cp) { this.cp = a.cp; this.save(); }
    if (a === L.arenas[1]) this.hint = { key: 'hint.special', t: 320 };
    if (a.boss) this.cine = new TC.Script(this.bossSeq(a));
  };
  StageScene.prototype.spawnWave = function () {
    var a = this.arena, self = this;
    var w = a.waves[this.waveIdx];
    this.waveTag = (this.waveTag || 0) + 1;
    var tag = this.waveTag;
    w.forEach(function (s) {
      var x, y, opt = {};
      if (s.rise != null) { x = a.x0 + s.rise; y = self.groundAt(x); opt.rise = true; }
      else {
        x = s.side === 'l' ? a.x0 - 16 : a.x0 + W + 16;
        y = s.t === 'shade' ? self.groundAt(TC.clamp(x, a.x0 + 4, a.x0 + W - 4)) : s.y;
        if (s.t === 'crow') opt.fly = s.side === 'l' ? 1 : -1;
        if (s.t === 'shade') x = s.side === 'l' ? a.x0 + 10 : a.x0 + W - 10;
      }
      var e = self.spawnEnemy(s.t, x, y, opt);
      e.wave = tag;
    });
  };
  StageScene.prototype.updateArena = function () {
    var L = this.level, p = this.player;
    if (!this.arena) {
      for (var i = 0; i < L.arenas.length; i++) {
        var a = L.arenas[i];
        if (a.done || a.started) continue;
        if (p.x > a.x0 + (a.boss ? 96 : 112) && p.x < a.x0 + W && this.mode === 'play') { this.startArena(a); break; }
      }
      return;
    }
    var ar = this.arena;
    if (ar.boss) return;
    if (this.mode !== 'play') return;
    if (this.waveDelay > 0) {
      if (--this.waveDelay === 0) this.spawnWave();
      return;
    }
    var tag = this.waveTag, alive = false;
    for (var k = 0; k < this.enemies.length; k++) if (this.enemies[k].alive && this.enemies[k].wave === tag && !this.enemies[k].dying) { alive = true; break; }
    if (!alive) {
      this.waveIdx++;
      if (this.waveIdx >= ar.waves.length) this.endArena();
      else this.waveDelay = 50;
    }
  };
  StageScene.prototype.endArena = function () {
    var L = this.level;
    this.arena.done = true;
    this.arena = null;
    L.minX = 0; L.maxX = L.pxW;
    this.goT = 220;
    TC.audio.sfx('go');
  };

  StageScene.prototype.updateSpawns = function () {
    var L = this.level, self = this;
    L.spawns.forEach(function (s) {
      if (s.done) return;
      if (s.x < self.camX + W + 30 && s.x > self.camX - 30) {
        s.done = true;
        self.spawnEnemy(s.t, s.x, s.y, s.opt);
      }
    });
  };

  StageScene.prototype.updateTriggers = function () {
    var L = this.level, p = this.player, self = this;
    if (this.mode !== 'play') return;
    // falas
    for (var i = 0; i < L.barks.length; i++) {
      var b = L.barks[i];
      if (!b.done && p.x > b.x && !this.arena) {
        b.done = true;
        this.mode = 'dialog';
        this.dlg.open([{ who: 'arno', key: b.key, face: b.face }], { pos: 'top' });
        return;
      }
    }
    // capelinhas (pontos de retorno)
    L.shrines.forEach(function (sh) {
      if (!sh.lit && Math.abs(p.x - sh.x) < 14) {
        sh.lit = true;
        TC.audio.sfx('checkpoint');
        if (sh.cp > self.cp) { self.cp = sh.cp; self.save(); }
        self.floatText(sh.x, 130, TC.t('checkpoint'), '#ffe090');
        p.hp = Math.min(p.maxHp, p.hp + 2);
        for (var k = 0; k < 12; k++) self.parts.add({ x: sh.x, y: 160, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.5, -0.3), life: 40, color: '#ffe080', size: 1, layer: 1, fade: true });
      }
    });
    // placas
    this.nearSign = null;
    if (p.onGround && p.state === 'normal') {
      for (var j = 0; j < L.signs.length; j++) {
        var s = L.signs[j];
        if (Math.abs(p.x - s.x) < 16) { this.nearSign = s; break; }
      }
    }
    if (this.nearSign && TC.input.pressed('up')) {
      this.mode = 'dialog';
      TC.audio.sfx('select');
      this.dlg.open([{ who: null, text: TC.t(this.nearSign.key) }], { pos: 'top' });
    }
    // dica de quebrar caixotes
    if (!this.breakHint && p.x > 17 * 16 && p.x < 22 * 16) { this.breakHint = true; this.hint = { key: 'hint.break', t: 260 }; }
  };

  /* ---------- câmera ---------- */
  StageScene.prototype.updateCamera = function () {
    var L = this.level, p = this.player;
    var target;
    if (this.arena) target = this.arena.x0;
    else target = p.x - 120 + p.face * 18;
    target = TC.clamp(target, 0, L.pxW - W);
    var k = this.arena ? 0.08 : 0.12;
    this.camX += (target - this.camX) * k;
    if (Math.abs(target - this.camX) < 0.3) this.camX = target;
  };

  /* ---------- atualização ---------- */
  StageScene.prototype.update = function () {
    this.t++;
    var I = TC.input;
    if (this.mode === 'paused') { this.pauseMenu.update(); return; }
    if (this.mode === 'continue') { this.updateContinue(); return; }
    if (this.mode === 'gameover' || this.mode === 'leaving') return;
    if (this.mode === 'play' && I.pressed('start') && !TC.game.fading()) {
      this.mode = 'paused';
      this.pauseMenu.sel = 0;
      TC.audio.sfx('pause');
      return;
    }
    if (this.dlg.active) this.dlg.update();
    if (this.cine) { this.cine.update(); if (this.cine && this.cine.done) this.cine = null; }
    if (this.mode === 'dialog' && !this.dlg.active) { this.mode = 'play'; TC.input.clear(); }
    var freeze = this.dlg.active || this.mode === 'respawn';
    if (!freeze) {
      if (this.mode === 'play') this.time++;
      this.player.update(this);
      var i;
      for (i = 0; i < this.enemies.length; i++) this.enemies[i].update(this);
      for (i = 0; i < this.props.length; i++) this.props[i].update(this);
      for (i = 0; i < this.items.length; i++) this.items[i].update(this);
      for (i = 0; i < this.orbs.length; i++) this.orbs[i].update(this);
      for (i = 0; i < this.deco.length; i++) this.deco[i].update(this);
      this.enemies = this.enemies.filter(function (e) { return e.alive; });
      this.props = this.props.filter(function (e) { return e.alive; });
      this.items = this.items.filter(function (e) { return e.alive; });
      this.orbs = this.orbs.filter(function (e) { return e.alive; });
      this.deco = this.deco.filter(function (e) { return e.alive; });
      this.updateSpawns();
      this.updateArena();
      this.updateTriggers();
    }
    for (var k = 0; k < this.texts.length; k++) this.texts[k].update();
    this.texts = this.texts.filter(function (e) { return e.alive; });
    this.parts.update();
    this.updateCamera();
    if (this.goT > 0) this.goT--;
    if (this.hint && --this.hint.t <= 0) this.hint = null;
    if (this.ebar && --this.ebar.t <= 0) this.ebar = null;
    if (this.comboT > 0 && --this.comboT === 0) this.combo = 0;
    if (this.banner) this.banner.t++;
    if (this.flashLight && --this.flashLight.t <= 0) this.flashLight = null;
    // folhas de outono
    if (this.t % 14 === 0) {
      var ls = A.leaves()[TC.rnd.int(0, 2)];
      this.parts.add({ x: this.camX + TC.rnd.range(-10, W + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6, layer: 2,
        sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
    }
  };

  StageScene.prototype.updateContinue = function () {
    var I = TC.input;
    this.contT--;
    if (I.pressed('confirm') || I.pressed('start')) {
      if (this.contT > 30) {
        TC.audio.sfx('confirm');
        this.lives = TC.diff().lives;
        this.score = 0;
        this.respawn();
        this.mode = 'play';
        return;
      }
    }
    if ((I.pressed('attack') || I.pressed('back')) && this.contT > 60) this.contT = Math.min(this.contT, 60 * Math.floor(this.contT / 60) - 1);
    if (this.contT <= 0) {
      this.mode = 'gameover';
      TC.store.set('save', null);
      this.cine = null;
      TC.game.fadeTo(function () { return new TC.TitleScene(); }, 90, { hold: 60 });
    }
  };

  /* ---------- sequências ---------- */
  StageScene.prototype.say = function* (key, face, who, pos) {
    yield* TC.ui.say(this.dlg, [{ who: who === undefined ? 'arno' : who, key: key, face: face }], { pos: pos || 'top' });
  };

  StageScene.prototype.stageCard = function* () {
    this.banner = { kind: 'stage', t: 0 };
    TC.audio.sfx('whoosh');
    yield* co.wait(170);
    this.banner = { kind: 'fight', t: 0 };
    TC.audio.sfx('fanfare');
    TC.audio.sfx('go');
    yield* co.wait(60);
    this.banner = null;
  };

  StageScene.prototype.startSeq = function* () {
    var p = this.player;
    this.mode = 'cine';
    p.setState('cine'); p.pose = 'idle';
    TC.fx.bright = 0;
    TC.fx.fadeIn(40);
    TC.audio.music('stage1');
    yield* this.stageCard();
    p.setState('normal');
    this.mode = 'play';
  };

  StageScene.prototype.wakeSeq = function* () {
    var p = this.player;
    this.mode = 'cine';
    p.setState('cine'); p.pose = 'lie'; p.face = 1;
    TC.fx.bright = 0;
    TC.fx.letterbox = 22;
    TC.fx.fadeIn(90);
    TC.audio.music('wake');
    yield* co.wait(100);
    TC.audio.sfx('gasp');
    yield* this.say('wake.2', 'hurt');
    p.pose = 'kneel';
    yield* co.wait(45);
    p.pose = 'idle';
    yield* co.wait(30);
    yield* this.say('wake.3');
    p.face = -1;
    yield* co.wait(45);
    p.face = 1;
    yield* co.wait(30);
    yield* this.say('wake.4');
    yield* this.say('wake.5');
    yield* co.wait(20);
    // a cabeça-de-fogo cruza o céu ao longe
    TC.audio.stopMusic(1);
    this.deco.push(new Flyby(this.camX + W + 30, 58));
    TC.audio.sfx('screech');
    yield* co.wait(110);
    this.startArena(this.level.arenas[0]);
    this.waveDelay = 0;
    this.spawnWave();
    yield* co.wait(40);
    TC.audio.sfx('ghost');
    p.pose = 'shock';
    yield* co.wait(30);
    yield* this.say('wake.6', 'shock');
    TC.fx.tween('letterbox', 0, 30);
    TC.audio.music('stage1');
    yield* this.stageCard();
    p.setState('normal');
    this.mode = 'play';
    this.hint = { key: 'hint.move', t: 420 };
  };

  StageScene.prototype.bossSeq = function* (a) {
    var p = this.player;
    this.mode = 'cine';
    yield* co.until(function () { return p.onGround; });
    p.setState('cine'); p.pose = 'idle'; p.face = 1;
    TC.audio.stopMusic(1.5);
    TC.fx.tween('letterbox', 22, 40);
    this.ambientOverride = '#30346a';
    yield* co.wait(50);
    TC.audio.sfx('screech');
    TC.fx.shake(2, 40);
    var boss = this.spawnEnemy('boss', a.x0 + 170, -30, { arena: a });
    if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
    if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
    this.boss = boss;
    yield* co.until(function () { return boss.t > 130; });
    TC.audio.sfx('roar');
    TC.fx.shake(5, 40);
    TC.fx.flash('#40ff70', 0.3, 0.02);
    p.pose = 'shock';
    yield* co.wait(40);
    // as falas só na primeira vez; ao tentar de novo, a luta começa logo
    if (!a.seen) {
      a.seen = true;
      yield* this.say('boss.1', 'shock', 'arno', 'bottom');
      p.pose = 'idle';
      yield* this.say('boss.2', null, 'arno', 'bottom');
    }
    p.pose = 'idle';
    this.bossBarFill = 0;
    TC.fx.tween('letterbox', 0, 30);
    yield* co.tween(this, 'bossBarFill', 1, 50);
    TC.audio.music('boss');
    this.banner = { kind: 'fight', t: 0 };
    boss.set('hover');
    p.setState('normal');
    this.mode = 'play';
    yield* co.wait(60);
    this.banner = null;
  };

  StageScene.prototype.onBossDead = function () {
    this.boss = null;
    this.cine = new TC.Script(this.clearSeq());
  };

  StageScene.prototype.clearSeq = function* () {
    var p = this.player;
    this.mode = 'cine';
    this.ambientOverride = null;
    this.killAllMinions();
    yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine'); });
    p.setState('cine'); p.pose = 'idle';
    TC.fx.tween('letterbox', 22, 40);
    yield* co.wait(80);
    p.pose = 'victory';
    TC.audio.music('clear');
    yield* co.wait(100);
    var secs = Math.floor(this.time / 60);
    this.tally = { score: this.score, time: Math.max(0, 900 - secs) * 10, hp: Math.round(p.hp * 300), shown: 0, total: 0 };
    this.tally.total = this.tally.score + this.tally.time + this.tally.hp;
    yield* co.wait(40);
    var tl = this.tally;
    for (var k = 0; k <= 60; k++) {
      tl.shown = k / 60;
      if (k % 4 === 0) TC.audio.sfx('blip', 900);
      yield;
    }
    this.score = tl.total;
    TC.audio.sfx('coin');
    var w = 0;
    while (w++ < 420 && !(w > 60 && (TC.input.pressed('confirm') || TC.input.pressed('start')))) yield;
    TC.store.set('save', null);
    var sc = this.score;
    TC.audio.stopMusic(1);
    TC.game.fadeTo(function () { return new TC.EndingScene({ score: sc }); }, 60);
  };

  /* cabeça-de-fogo decorativa cruzando o céu */
  function Flyby(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; }
  Flyby.prototype.update = function (st) {
    this.t++;
    this.x -= 3.2;
    this.y += Math.sin(this.t * 0.05) * 0.6;
    if (this.t % 2 === 0) st.parts.add({ x: this.x + 10, y: this.y + TC.rnd.range(-3, 3), vx: 0.6, vy: -0.3, life: 20, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    if (this.x < st.camX - 60) this.alive = false;
  };
  Flyby.prototype.draw = function (c, cx) {
    var fl = A.flames[Math.floor(this.t / 4) % 4];
    c.globalCompositeOperation = 'lighter';
    c.drawImage(TC.flip(fl), Math.round(this.x - cx - 1), Math.round(this.y - 26));
    c.globalCompositeOperation = 'source-over';
    var f = TC.flip(A.flameHead.open);
    c.drawImage(f, Math.round(this.x - cx - f.width / 2), Math.round(this.y - f.height + 1));
  };
  Flyby.prototype.light = function (L, cx) { L.add(this.x - cx, this.y - 10, 46, '#ff9040', 1); };

  /* ---------- desenho ---------- */
  StageScene.prototype.ambientAt = function (x) {
    if (this.ambientOverride) return this.ambientOverride;
    var Z = this.level.zones, a = Z[0], b = null;
    for (var i = 0; i < Z.length; i++) if (x >= Z[i].x) { a = Z[i]; b = Z[i + 1]; }
    if (!b) return a.ambient;
    var k = TC.clamp((x - (b.x - 160)) / 160, 0, 1);
    return k > 0 ? TC.mix(a.ambient, b.ambient, k) : a.ambient;
  };
  StageScene.prototype.fogAt = function (x) {
    var Z = this.level.zones, f = Z[0].fog;
    for (var i = 0; i < Z.length; i++) if (x >= Z[i].x) f = Z[i].fog;
    return f;
  };

  function flick(t, seed, broken) {
    if (broken) {
      var h = TC.hash2(Math.floor(t / 5), seed, 77);
      return h > 0.85 ? 0.1 : h > 0.78 ? 0.55 : 1;
    }
    return 1;
  }
  function candleFlick(t, seed) { return 0.8 + Math.sin(t * 0.33 + seed) * 0.12 + TC.hash2(t >> 2, seed, 3) * 0.1; }

  StageScene.prototype.draw = function (c) {
    var camX = Math.round(this.camX), t = this.t, L = this.level, bg = this.bg, i;
    // ----- fundo -----
    c.drawImage(bg.sky, 0, 0);
    A.drawTwinkles(c, bg.tw, t, 0, 0);
    c.drawImage(bg.moon, 206 - bg.moon.width / 2, 36 - bg.moon.height / 2);
    var o = Math.round(camX * 0.05) % 512;
    c.drawImage(bg.far, -o, 98); c.drawImage(bg.far, 512 - o, 98);
    if (camX < 3900) {
      c.globalAlpha = TC.clamp((3900 - camX) / 300, 0, 1);
      c.drawImage(bg.spire, Math.round(236 - camX * 0.045), 150 - bg.spire.height);
      c.globalAlpha = 1;
    }
    o = Math.round(camX * 0.12) % 512;
    c.drawImage(bg.mid, -o, 112); c.drawImage(bg.mid, 512 - o, 112);
    o = Math.round(camX * 0.32) % 768;
    c.drawImage(bg.trees, -o, 62); c.drawImage(bg.trees, 768 - o, 62);
    var fog = this.fogAt(camX + 128);
    o = Math.round(camX * 0.5 + t * 0.15) % 512;
    c.globalAlpha = 0.3 + fog * 0.5;
    c.drawImage(bg.fog, -o, 150); c.drawImage(bg.fog, 512 - o, 150);
    c.globalAlpha = 1;

    // ----- plano de jogo (recebe iluminação) -----
    var pc = this.pf.ctx;
    pc.clearRect(0, 0, W, H);
    for (i = 0; i < L.back.length; i++) {
      var d = L.back[i];
      if (d.x > camX + W || d.x + d.cv.width + 8 < camX) continue;
      pc.drawImage(d.cv, d.x - camX, d.y);
      if (d.candle) {
        var cf = this.candles[(Math.floor(t / 6) + i) % 3];
        pc.drawImage(cf, d.x - camX + d.cv.width, d.y + d.cv.height - cf.height);
      }
    }
    // fios entre postes
    for (i = 0; i < L.wires.length - 1; i++) {
      var w1 = L.wires[i], w2 = L.wires[i + 1];
      if (w2.x - w1.x2 > 300) continue;
      if (w2.x < camX || w1.x2 > camX + W) continue;
      A.drawWire(pc, w1.x2 - camX, w1.y, w2.x - camX, w2.y, 10, '#0c0c16');
      A.drawWire(pc, w1.x - camX, w1.y + 1, w2.x - camX + 1, w2.y + 1, 12, '#0c0c16');
    }
    // capelinhas
    L.shrines.forEach(function (sh) {
      if (sh.x < camX - 20 || sh.x > camX + W + 20) return;
      var img = sh.lit ? A.shrineOn : A.shrineOff;
      pc.drawImage(img, Math.round(sh.x - camX - img.width / 2), 193 - img.height);
    });
    pc.drawImage(this.tileCv, camX, 0, W, H, 0, 0, W, H);
    // água animada
    var wf = this.T.water[Math.floor(t / 10) % 4];
    for (var tx = Math.floor(camX / 16); tx <= Math.floor((camX + W) / 16); tx++) {
      if (L.tile(tx, 13) === 4) pc.drawImage(wf, tx * 16 - camX, 13 * 16);
    }
    for (i = 0; i < this.props.length; i++) this.props[i].draw(pc, camX, 0);
    for (i = 0; i < this.items.length; i++) this.items[i].draw(pc, camX, 0);
    for (i = 0; i < this.deco.length; i++) this.deco[i].draw(pc, camX, 0);
    var ens = this.enemies.slice().sort(function (a, b) { return (a.isBoss ? -1 : 0) - (b.isBoss ? -1 : 0); });
    for (i = 0; i < ens.length; i++) ens[i].draw(pc, camX, 0);
    this.player.draw(pc, camX, 0);
    for (i = 0; i < this.orbs.length; i++) this.orbs[i].draw(pc, camX, 0);
    this.parts.draw(pc, camX, 0, 0);

    // ----- iluminação -----
    var Lt = this.light;
    Lt.begin(this.ambientAt(camX + 128));
    for (i = 0; i < L.back.length; i++) {
      var b = L.back[i];
      if (!b.lights || b.x > camX + W + 80 || b.x + b.cv.width < camX - 80) continue;
      for (var j = 0; j < b.lights.length; j++) {
        var l = b.lights[j];
        var f = l.flicker ? (b.candle ? candleFlick(t, i) : flick(t, i, true)) : 1;
        Lt.add(b.x + l.dx - camX, b.y + l.dy, l.r * (b.candle ? (0.9 + f * 0.1) : 1), l.col, l.a * f);
      }
    }
    L.shrines.forEach(function (sh) { if (sh.lit) Lt.add(sh.x - camX, 172, 26, '#ffc060', 0.9 * candleFlick(t, sh.x)); });
    for (i = 0; i < this.enemies.length; i++) if (this.enemies[i].light) this.enemies[i].light(Lt, camX, 0);
    for (i = 0; i < this.deco.length; i++) if (this.deco[i].light) this.deco[i].light(Lt, camX, 0);
    for (i = 0; i < this.orbs.length; i++) Lt.add(this.orbs[i].x - camX, this.orbs[i].y, 20, '#60ff80', 0.7);
    var p = this.player;
    Lt.add(p.x - camX, p.y - 16, 42, '#7a7aa8', 0.55);
    if (this.flashLight) Lt.add(this.flashLight.x - camX, this.flashLight.y, 90, '#ffa050', this.flashLight.t / 10);
    this.maskCv.ctx.clearRect(0, 0, W, H);
    this.maskCv.ctx.drawImage(this.pf, 0, 0);
    Lt.apply(pc);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(this.maskCv, 0, 0);
    pc.globalCompositeOperation = 'source-over';
    c.drawImage(this.pf, 0, 0);

    // ----- brilhos aditivos -----
    for (i = 0; i < L.back.length; i++) {
      var g = L.back[i];
      if (!g.glows || g.x > camX + W + 40 || g.x + g.cv.width < camX - 40) continue;
      for (var q = 0; q < g.glows.length; q++) {
        var gl = g.glows[q];
        var gf = gl.flicker ? (g.candle ? candleFlick(t, i) : flick(t, i, true)) : 1;
        TC.Lighting.glow(c, g.x + gl.dx - camX, g.y + gl.dy, gl.r, gl.col, gl.a * gf);
      }
    }
    for (i = 0; i < this.enemies.length; i++) if (this.enemies[i].glow) this.enemies[i].glow(c, camX, 0);
    this.parts.draw(c, camX, 0, 1);
    for (i = 0; i < this.texts.length; i++) this.texts[i].draw(c, camX, 0);

    // ----- primeiro plano -----
    for (i = 0; i < L.front.length; i++) {
      var fr = L.front[i];
      var fx = Math.round(fr.x - camX * 1.25);
      if (fx > W || fx + fr.cv.width < 0) continue;
      c.drawImage(fr.cv, fx, fr.y);
    }
    o = Math.round(camX * 1.3 + t * 0.4) % 512;
    c.globalAlpha = fog * 0.55;
    c.drawImage(bg.fogFront, -o, 184); c.drawImage(bg.fogFront, 512 - o, 184);
    c.globalAlpha = 1;
    this.parts.draw(c, camX, 0, 2);

    this.drawOverlay(c);
  };

  /* ---------- HUD e sobreposições ---------- */
  function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

  StageScene.prototype.drawHUD = function (c) {
    var p = this.player;
    c.fillStyle = 'rgba(4,4,12,0.55)';
    c.fillRect(2, 2, 92, 22);
    c.drawImage(this.hudFace, 4, 5);
    TC.font.draw(c, 'ARNO', 23, 3, '#f0c060', { shadow: '#000' });
    TC.font.draw(c, 'x' + Math.max(0, this.lives), 52, 3, '#e0e0f0', { shadow: '#000' });
    // barra de energia segmentada
    var bx = 23, by = 15;
    c.fillStyle = '#000';
    c.fillRect(bx - 1, by - 1, p.maxHp * 6 + 1, 7);
    // a energia pode ter frações (fácil e normal): o último segmento fica parcialmente cheio
    var low = p.hp <= 3 && (this.t >> 3) % 2;
    for (var i = 0; i < p.maxHp; i++) {
      var part = TC.clamp(p.hp - i, 0, 1);
      var pw = part > 0 ? Math.max(1, Math.round(5 * part)) : 0;
      c.fillStyle = '#3a1418';
      c.fillRect(bx + i * 6, by, 5, 5);
      if (!pw) continue;
      c.fillStyle = low ? '#ff9060' : '#e8382c';
      c.fillRect(bx + i * 6, by, pw, 5);
      c.fillStyle = low ? '#ffd0a0' : '#ff8a70';
      c.fillRect(bx + i * 6, by, pw, 1);
    }
    // pontos
    TC.font.draw(c, TC.t('hud.score'), 252, 3, '#a0a8d0', { align: 'right', shadow: '#000' });
    TC.font.draw(c, pad(this.score, 7), 252, 13, '#ffffff', { align: 'right', shadow: '#000' });
    // inimigo atingido
    if (this.ebar && !this.ebar.e.isBoss) {
      var e = this.ebar.e;
      TC.font.draw(c, TC.t(e.name), 166, 3, '#ff9070', { align: 'right', shadow: '#000' });
      c.fillStyle = '#000'; c.fillRect(105, 14, 62, 6);
      c.fillStyle = '#3a1418'; c.fillRect(106, 15, 60, 4);
      c.fillStyle = '#ffb030'; c.fillRect(106, 15, Math.round(60 * Math.max(0, e.hp) / e.maxHp), 4);
    }
    // combo
    if (this.combo >= 3) {
      TC.font.draw(c, this.combo + ' HITS', 6, 28, (this.t >> 2) % 2 ? '#ffe060' : '#ff9030', { outline: '#000' });
    }
    // chefe
    var bs = this.boss || (this.bossDead ? null : null);
    if (bs && this.bossBarFill > 0) {
      TC.font.draw(c, TC.t(bs.name), 128, 196, '#c0ffc0', { align: 'center', outline: '#000' });
      var bw = 190, bxx = 33;
      c.fillStyle = '#000'; c.fillRect(bxx - 1, 208, bw + 2, 8);
      c.fillStyle = '#102010'; c.fillRect(bxx, 209, bw, 6);
      var fill = Math.round(bw * Math.min(this.bossBarFill, bs.hp / bs.maxHp));
      c.fillStyle = '#40d060'; c.fillRect(bxx, 209, fill, 6);
      c.fillStyle = '#a0ffb0'; c.fillRect(bxx, 209, fill, 1);
    }
  };

  StageScene.prototype.drawOverlay = function (c) {
    var t = this.t;
    if (this.mode !== 'cine' || this.boss) this.drawHUD(c);
    // placa próxima
    if (this.nearSign && this.mode === 'play' && (t >> 4) % 2 === 0) {
      TC.font.draw(c, TC.t('hint.read'), Math.round(this.nearSign.x - this.camX), 140, '#ffe090', { align: 'center', outline: '#000' });
    }
    // SIGA ->
    if (this.goT > 0 && (this.goT >> 3) % 2 === 0) {
      var gx = 236 + ((t >> 2) % 4);
      TC.font.draw(c, TC.t('go') + ' ▶', gx, 96, '#ffe060', { align: 'right', outline: '#000', scale: 2 });
    }
    // dicas
    if (this.hint && this.mode === 'play') {
      var a = Math.min(1, this.hint.t / 30);
      c.globalAlpha = a;
      var str = TC.t(this.hint.key);
      var w = TC.font.measure(str) + 12;
      c.fillStyle = 'rgba(4,4,16,0.7)';
      c.fillRect(128 - w / 2, 200, w, 14);
      TC.font.draw(c, str, 128, 202, '#f0e8c0', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }
    if (this.banner) this.drawBanner(c);
    this.dlg.draw(c);
    if (this.tally) this.drawTally(c);
    if (this.mode === 'paused') {
      c.fillStyle = 'rgba(0,0,8,0.6)';
      c.fillRect(0, 0, W, H);
      TC.ui.box(c, 28, 50, 200, 128, 'menu', 0.95);
      TC.font.draw(c, TC.t('pause'), 128, 58, '#ffd890', { align: 'center', shadow: '#000', scale: 2 });
      this.pauseMenu.draw(c, 50, 90, { valueX: 162, lineH: 13 });
    }
    if (this.mode === 'continue' || this.mode === 'gameover') this.drawContinue(c);
    if (TC.params.dbg) {
      var ai = this.arena ? this.level.arenas.indexOf(this.arena) + ':' + this.waveIdx : '-';
      TC.font.draw(c, 'x' + Math.round(this.player.x) + ' ' + this.mode + ' ar' + ai + ' en' + this.enemies.length + ' t' + this.t + ' cp' + this.cp, 4, 40, '#80ff80', { outline: '#000' });
    }
  };

  StageScene.prototype.drawBanner = function (c) {
    var b = this.banner, t = b.t;
    if (b.kind === 'stage') {
      var k = TC.clamp(t / 40, 0, 1);
      var out = TC.clamp((t - 140) / 25, 0, 1);
      var big = TC.ui.bigText(TC.t('stage1.num'), 3, '#ffffff', '#8890d0', '#06050c');
      var s = (1 - TC.ease.outBack(k)) * 5 + 1;
      var rot = (1 - TC.ease.outCubic(k)) * 3;
      c.save();
      c.globalAlpha = (1 - out) * Math.min(1, k * 2);
      c.translate(128, 84);
      c.rotate(rot);
      c.scale(s, s);
      c.drawImage(big, -Math.floor(big.width / 2), -Math.floor(big.height / 2));
      c.restore();
      if (t > 40) {
        var sub = TC.ui.bigText(TC.t('stage1.name'), 1, '#ffe0a0', '#c07030', '#06050c');
        var reveal = TC.clamp((t - 40) / 30, 0, 1);
        var sw = Math.round(sub.width * reveal);
        c.globalAlpha = 1 - out;
        c.fillStyle = 'rgba(0,0,10,0.6)';
        c.fillRect(128 - sub.width / 2 - 8, 106, sub.width + 16, 18);
        c.drawImage(sub, 0, 0, sw, sub.height, Math.round(128 - sub.width / 2), 109, sw, sub.height);
        c.globalAlpha = 1;
      }
    } else if (b.kind === 'fight') {
      var f = TC.ui.bigText(TC.t('fight'), 4, '#fff0a0', '#e03020', '#140404');
      var kk = TC.clamp(t / 12, 0, 1);
      var sc = 0.3 + TC.ease.outBack(kk) * 0.7;
      c.save();
      c.globalAlpha = TC.clamp(1 - (t - 40) / 20, 0, 1);
      c.translate(128, 96);
      c.scale(sc, sc);
      c.drawImage(f, -Math.floor(f.width / 2), -Math.floor(f.height / 2));
      c.restore();
    }
  };

  StageScene.prototype.drawTally = function (c) {
    var tl = this.tally;
    TC.ui.box(c, 36, 50, 184, 112, 'menu', 0.94);
    var cl = TC.ui.bigText(TC.t('clear'), 2, '#ffffff', '#ffc060', '#1a0c04');
    c.drawImage(cl, 128 - Math.floor(cl.width / 2), 56);
    var rows = [['tally.score', tl.score], ['tally.time', tl.time], ['tally.hp', tl.hp]];
    rows.forEach(function (r, i) {
      TC.font.draw(c, TC.t(r[0]), 48, 90 + i * 14, '#c8c8e8', { shadow: '#000' });
      TC.font.draw(c, pad(Math.round(r[1] * tl.shown), 7), 208, 90 + i * 14, '#ffffff', { align: 'right', shadow: '#000' });
    });
    c.fillStyle = '#8088b0'; c.fillRect(48, 132, 160, 1);
    TC.font.draw(c, TC.t('tally.total'), 48, 138, '#ffe090', { shadow: '#000' });
    TC.font.draw(c, pad(Math.round(tl.total * tl.shown), 7), 208, 138, '#ffe090', { align: 'right', shadow: '#000' });
  };

  StageScene.prototype.drawContinue = function (c) {
    c.fillStyle = 'rgba(0,0,6,0.7)';
    c.fillRect(0, 0, W, H);
    if (this.mode === 'gameover') {
      var go = TC.ui.bigText(TC.t('gameover'), 3, '#ff6050', '#801010', '#000000');
      c.drawImage(go, 128 - Math.floor(go.width / 2), 90);
      return;
    }
    var n = Math.max(0, Math.ceil(this.contT / 60) - 1);
    var ct = TC.ui.bigText(TC.t('continue'), 2, '#ffffff', '#8890d0', '#000000');
    c.drawImage(ct, 128 - Math.floor(ct.width / 2), 70);
    var num = TC.ui.bigText(String(n), 5, '#ffe060', '#e06020', '#000000');
    var k = (this.contT % 60) / 60;
    var s = 0.8 + k * 0.4;
    c.save();
    c.translate(128, 130);
    c.scale(s, s);
    c.drawImage(num, -Math.floor(num.width / 2), -Math.floor(num.height / 2));
    c.restore();
    TC.font.draw(c, 'START / Z', 128, 176, '#a0a8d0', { align: 'center', shadow: '#000' });
  };

  TC.StageScene = StageScene;
})();
