'use strict';
/* Teewald City — capítulo 3: mineiros soterrados de 1931, morcegos, pares de dançarinos fantasmas
   e o chefe, o Moço do Baile (o Tanzteufel dos colonos), com laço, boleadeira, rodopio e pisada de casco */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  var base = K.base, drawSprite = K.drawSprite, genericHit = K.genericHit, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W;
  function art() { return TC.ART.ch3Init(); }

  /* ================= MINEIRO SOTERRADO =================
     Os doze da Mina Santa Bárbara, que ficaram lá embaixo no desabamento de 1931. Golpeiam com a picareta. */
  var Possesso = TC.ENEMIES.possesso;
  function Miner(x, y, opt) {
    art();
    Possesso.call(this, x, y, { kind: 'colono' });
    this.type = 'miner';
    this.kind = 'miner';
    this.name = 'en.miner';
    this.hp = this.maxHp = hpFor(6);
    this.score = 300;
    this.speed = 0.45 + TC.rnd() * 0.1;
  }
  Miner.prototype = Object.create(Possesso.prototype);
  Miner.prototype.light = function (L, cx, cy) {
    if (this.dying || this.alpha < 0.3 || this.state === 'down') return;
    // a lamparina de carbureto do capacete
    L.add(this.x + this.face * 4 - cx, this.y - 38 - cy, this.state === 'windup' ? 36 : 28, '#ffe090', 0.75);
  };

  /* ================= MORCEGO ================= */
  var Crow = TC.ENEMIES.crow;
  function Bat(x, y, opt) {
    Crow.call(this, x, y, opt);
    this.type = 'bat';
    this.name = 'en.bat';
    this.score = 60;
    this.cry = 'bat';
  }
  Bat.prototype = Object.create(Crow.prototype);
  Bat.prototype.draw = function (c, cx, cy) {
    if (this.state === 'away') return;
    var B = art().bat;
    var img = this.state === 'perch' ? B.perch : B.fly[Math.floor(this.t / 4) % 2];
    var f = this.face > 0 ? TC.flip(img) : img;
    c.drawImage(this.flash ? TC.tintCached(f, '#ffffff', 0.7) : f, Math.round(this.x - img.width / 2 - cx), Math.round(this.y - img.height - cy));
  };
  Bat.prototype.light = function (L, cx, cy) { if (this.state !== 'away') L.add(this.x - cx, this.y - 5 - cy, 10, '#ff5030', 0.4); };

  /* ================= PAR DE DANÇARINOS =================
     Convidados do baile que nunca pararam de valsar. Rodeiam o Arno no compasso de três e dão um rodopio. */
  function Dancer(x, y, opt) {
    base(this, 'dancer', x, y);
    this.w = 24; this.h = 48;
    this.hp = this.maxHp = hpFor(5);
    this.name = 'en.dancer';
    this.score = 300;
    this.state = 'enter';
    this.alpha = 0;
    this.cool = frames(70 + TC.rnd.int(0, 40), TC.diff().cool);
    this.phase = TC.rnd() * 6;
    this.useArena = true;
    this.onGround = false;
    this.dist = 70 + TC.rnd.int(0, 30);
  }
  Dancer.prototype.attacking = function () { return this.state === 'bow' || this.state === 'spin'; };
  Dancer.prototype.hurtBox = function () { return { x: this.x - 12, y: this.y - 50, w: 24, h: 48 }; };
  Dancer.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'enter' && this.alpha < 0.6) return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Dancer.prototype.onHit = function (st, dmg, dir, kb) {
    TC.audio.sfx('hit');
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 0.8;
  };
  Dancer.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('ghostDie');
    st.floatText(this.x, this.y - 54, TC.t('freed.p'), '#e0f0ff');
  };
  Dancer.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.alpha -= 0.025;
      this.y -= 0.3;
      if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(0, 44), vy: -0.6, life: 36, colors: ['#ffffff', '#c0d0ff', '#6070c0'], size: 1, fade: true, layer: 1 });
      if (this.alpha <= 0) this.alive = false;
      return;
    }
    switch (this.state) {
      case 'enter':
        this.alpha = Math.min(1, this.alpha + 0.03);
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, this.face * 0.8, 0.05);
        if (this.alpha >= 1) { this.state = 'waltz'; this.t = 0; }
        break;
      case 'waltz': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = p.x + side * this.dist + Math.sin(this.t * 0.03 + this.phase) * 20;
        if (st.arena) tx = TC.clamp(tx, st.arena.x0 + 18, st.arena.x0 + W - 18);
        // compasso de valsa: um passo forte e dois leves
        var beat = Math.floor(this.t / 18) % 3 === 0 ? 1.3 : 0.5;
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx, Math.abs(gap) > 6 ? Math.sign(gap) * beat : 0, 0.08);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 140 && Math.abs(dy) < 30) {
          if (st.mayAttack(this)) { this.state = 'bow'; this.t = 0; TC.audio.sfx('ghost'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      }
      case 'bow':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(28, D.windup)) { this.state = 'spin'; this.t = 0; this.vx = this.face * 2.6 * D.speed; TC.audio.sfx('spin'); }
        break;
      case 'spin':
        if (this.hitWall) this.t = 999;
        if (this.t >= 46) { this.state = 'dizzy'; this.t = 0; }
        break;
      case 'dizzy':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 36) { this.state = 'waltz'; this.t = 0; this.cool = frames(80 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 14) { this.state = 'waltz'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'spin') contact(this, st, 2, true);
    else if (this.state === 'waltz') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Dancer.prototype.draw = function (c, cx, cy) {
    var S = art().couple, img;
    if (this.state === 'bow') img = S.bow;
    else if (this.state === 'spin') img = S.spin[(this.t >> 2) % 2];
    else if (this.state === 'hurt' || this.state === 'dizzy') img = this.state === 'hurt' ? S.hurt : S.waltz[(this.t >> 4) % 4];
    else img = S.waltz[Math.floor(this.t / 10) % 4];
    var bob = this.state === 'waltz' ? Math.round(Math.abs(Math.sin(this.t * Math.PI / 18)) * -2) : 0;
    drawSprite(c, img, this.x - cx, this.y - cy + 1 + bob, this.face, this.flash > 0, this.alpha * 0.9);
  };
  Dancer.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - 28 - cy, 30, '#8098ff', 0.45 * this.alpha); };

  /* ================= O MOÇO DO BAILE ================= */
  function Moco(x, y, opt) {
    base(this, 'moco', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.w = 24; this.h = 72;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.6);
    this.name = 'boss3.name';
    this.dodgeCD = 0;
    this.isBoss = true;
    this.score = 10000;
    this.state = 'intro';
    this.stagger = 0;
    this.attacks = 0;
    this.projs = [];
    this.useArena = true;
    this.bar = { name: '#ffd0c0', back: '#200808', fill: '#c02020', hi: '#ff9080' };
  }
  Moco.prototype.attacking = function () {
    var s = this.state;
    return s === 'lassoPrep' || s === 'throw' || s === 'bolaPrep' || s === 'spinPrep' || s === 'spin' || s === 'stompPrep' || s === 'summon';
  };
  Moco.prototype.L = function () { return this.arena.x0 + 30; };
  Moco.prototype.R = function () { return this.arena.x0 + W - 30; };
  Moco.prototype.hurtBox = function () {
    if (this.state === 'spin') return { x: this.x - 20, y: this.y - 32, w: 40, h: 30 };
    return { x: this.x - 12, y: this.y - 74, w: 24, h: 72 };
  };
  Moco.prototype.set = function (s) { this.state = s; this.t = 0; };
  Moco.prototype.phase2 = function () { return this.hp <= this.maxHp * 0.5; };
  Moco.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'dying' || this.state === 'downed') return false;
    // às vezes ele esquiva com um passo de valsa para trás (mais no difícil)
    if (this.state === 'stalk' && this.dodgeCD <= 0 && TC.rnd() < ({ easy: 0.12, normal: 0.25, hard: 0.4 })[TC.opts.diff]) {
      this.dodgeCD = 100; this.set('dodge'); this.vx = dir * 3.2; TC.audio.sfx('whoosh');
      st.floatText(this.x, this.y - 84, TC.t('m.dodge'), '#ffd0c0');
      return false;
    }
    if (this.state === 'dodge') return false;
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      this.stagger += d;
      if (this.stagger >= 12 && this.state !== 'dizzy' && this.state !== 'spin') { this.stagger = 0; this.set('stagger'); this.vx = dir * 1.8; }
    }
    return ok;
  };
  Moco.prototype.die = function (st) {
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.3);
    st.killAllMinions();
    this.projs.forEach(function (pj) { pj.alive = false; });
  };
  Moco.prototype.minions = function (st) {
    var n = 0;
    st.enemies.forEach(function (e) { if (e.alive && !e.dying && !e.isBoss) n++; });
    return n;
  };
  /* o piloto automático de testes pula o laço, a boleadeira, o rodopio e as ondas da pisada */
  Moco.prototype.botJump = function (p) {
    if (!p.onGround) return false;
    if (this.state === 'spin' && (p.x - this.x) * Math.sign(this.vx) > 0 && Math.abs(p.x - this.x) < 66) return true;
    for (var i = 0; i < this.projs.length; i++) {
      var pj = this.projs[i];
      if (!pj.alive || pj.ret) continue;
      var dir = Math.sign(pj.vx || 0);
      if ((p.x - pj.x) * dir > 0 && Math.abs(p.x - pj.x) < (pj.kind === 'lasso' ? 46 : 40)) return true;
    }
    return false;
  };
  Moco.prototype.hand = function () { return { x: this.x + this.face * 14, y: this.y - 50 }; };
  Moco.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff();
    var spd = (this.phase2() ? 1.2 : 1) * D.speed;
    var play = st.mode === 'play';
    var dx = p.x - this.x;
    var G = st.groundY;
    if (this.dodgeCD > 0) this.dodgeCD--;
    this.projs = this.projs.filter(function (pj) { return pj.alive; });
    // passou da metade: a música acelera
    if (!this.p2 && this.phase2() && this.state !== 'dying' && this.state !== 'downed') {
      this.p2 = true;
      st.floatText(this.x, this.y - 88, TC.t('m.fast'), '#ffb0a0');
      TC.audio.music('boss3b', 0.2);
      TC.fx.flash('#ff3010', 0.25, 0.03);
    }
    switch (this.state) {
      case 'intro':
        this.face = dx < 0 ? -1 : 1;
        break;
      case 'stalk': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * 100, this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx || 0, Math.abs(gap) > 8 ? Math.sign(gap) * 1.0 * spd : 0, 0.08);
        this.x += this.vx;
        if (t > frames(this.phase2() ? 45 : 70, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks;
          var close = Math.abs(dx) < 60;
          if (this.phase2() && n % 5 === 0 && this.minions(st) < 2) this.set('summon');
          else if (close) this.set(n % 2 ? 'stompPrep' : 'spinPrep');
          else this.set(['lassoPrep', 'bolaPrep', 'spinPrep', 'stompPrep'][n % 4]);
        }
        break;
      }
      case 'lassoPrep':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        if (t % 12 === 1) TC.audio.sfx('lasso');
        if (t > frames(40, D.windup)) {
          var h = this.hand();
          var lz = new Lasso(this, h.x, G - 22, this.face, 4.4 * spd, 176);
          this.projs.push(lz); st.deco.push(lz);
          TC.audio.sfx('whoosh');
          this.set('throw');
        }
        break;
      case 'throw':
        if (t > 20 && !this.projs.some(function (pj) { return pj.kind === 'lasso' && pj.alive; })) this.set('stalk');
        if (t > 140) this.set('stalk');
        break;
      case 'bolaPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t % 10 === 1) TC.audio.sfx('swing');
        if (t > frames(30, D.windup)) {
          var b = new Bola(this, this.x + this.face * 12, G - 6, this.face * 3.2 * spd);
          this.projs.push(b); st.deco.push(b);
          TC.audio.sfx('bola');
          this.set('recover');
        }
        break;
      case 'spinPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('growl');
        if (t > frames(30, D.windup)) { this.set('spin'); this.vx = this.face * 3.4 * spd; TC.audio.sfx('spin'); }
        break;
      case 'spin':
        this.x += this.vx;
        if (t % 8 === 0) { TC.audio.sfx('spin'); st.dust(this.x, G); }
        if ((this.vx > 0 && this.x >= this.R() + 4) || (this.vx < 0 && this.x <= this.L() - 4) || t > 120) {
          this.set('dizzy'); TC.fx.shake(2, 8); TC.audio.sfx('hit2');
        }
        break;
      case 'dizzy':
        if (t % 18 === 0) for (var s2 = 0; s2 < 3; s2++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 76, vx: Math.cos(t * 0.3 + s2 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(this.phase2() ? 70 : 100, D.cool)) this.set('stalk');
        break;
      case 'stompPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t > frames(26, D.windup)) {
          TC.audio.sfx('hoof'); TC.fx.shake(3, 12);
          st.dust(this.x - 10, G); st.dust(this.x + 10, G);
          for (var w = -1; w <= 1; w += 2) { var wv = new Wave(this, this.x + w * 14, G, w * 3 * spd); this.projs.push(wv); st.deco.push(wv); }
          if (play && p.onGround && Math.abs(dx) < 26) p.damage(st, 1, dx < 0 ? -1 : 1);
          this.set('recover');
        }
        break;
      case 'recover':
        if (t > frames(36, D.cool)) this.set('stalk');
        break;
      case 'summon':
        if (t === 1) TC.audio.sfx('demon');
        if (t === 20) {
          var nd = D.attackers <= 1 ? 1 : 2;
          for (var k = 0; k < nd; k++) st.spawnEnemy('dancer', TC.clamp(p.x + (k ? 80 : -80), this.L(), this.R()), G, {});
        }
        if (t > 80) this.set('stalk');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        if (t > 50) this.set('stalk');
        break;
      case 'dodge':
        this.x += this.vx; this.vx *= 0.88;
        if (t % 3 === 0) st.parts.add({ x: this.x, y: this.y - 40, life: 14, color: '#3a3040', size: 3, fade: true });
        if (t > 22) this.set('stalk');
        break;
      case 'dying':
        TC.fx.shake(2, 4);
        if (t % 6 === 0) {
          // fumaça de enxofre
          for (var q = 0; q < 4; q++) st.parts.add({ x: this.x + TC.rnd.range(-14, 14), y: this.y - TC.rnd.range(0, 50), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-1.4, -0.4), life: 50, colors: ['#e8e070', '#a0a040', '#4a4a20'], size: TC.rnd.int(2, 4), fade: true });
          if (t % 18 === 0) TC.audio.sfx('sulfur');
          this.flash = 2;
        }
        if (t === 130) {
          this.set('downed');
          this.dying = true;
          st.addScore(this.score);
          st.onBossDead(this);
        }
        break;
      case 'downed':
        break;
    }
    this.x = TC.clamp(this.x, this.arena.x0 + 12, this.arena.x0 + W - 12);
    if (this.state === 'spin') contact(this, st, 2, true);
    else if (this.state === 'stalk') contact(this, st, 1, false, true);
  };
  Moco.prototype.frame = function () {
    var S = art().moco, t = this.t;
    switch (this.state) {
      case 'intro': return this.pose ? (S[this.pose] || S.idle)[Math.floor(t / 14) % (S[this.pose] || S.idle).length] : S.idle[Math.floor(t / 30) % 2];
      case 'stalk': return Math.abs(this.vx) > 0.2 ? S.glide[Math.floor(t / 8) % 4] : S.idle[Math.floor(t / 30) % 2];
      case 'lassoPrep': return S.twirl[0];
      case 'throw': return t < 16 ? S.throw[0] : S.idle[0];
      case 'bolaPrep': return S.twirl[0];
      case 'recover': return t < 14 ? S.bola[0] : S.idle[0];
      case 'spinPrep': return S.bow[0];
      case 'spin': case 'dodge': return S.spin[(t >> 2) % 2];
      case 'dizzy': case 'stagger': return S.dizzy[0];
      case 'stompPrep': return S.stomp[0];
      case 'summon': return S.gaita[(t >> 4) % 2];
      case 'dying': case 'downed': return S.reveal[0];
    }
    return S.idle[0];
  };
  Moco.prototype.draw = function (c, cx, cy) {
    var img = this.frame();
    var shake = this.state === 'dying' ? TC.rnd.int(-1, 1) : ((this.state === 'stompPrep' || this.state === 'spinPrep') && this.t > 14 ? ((this.t >> 1) % 2 ? 1 : -1) : 0);
    var sink = this.state === 'downed' ? Math.min(40, (this.sinkT || 0)) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1 + sink, this.face, this.flash > 0, this.alpha);
    // laço girando sobre a cabeça / boleadeira na mão
    if (this.state === 'lassoPrep' || this.state === 'bolaPrep') {
      var hx = Math.round(this.x + this.face * 6 - cx), hy = Math.round(this.y - 86 - cy);
      var ang = this.t * 0.45;
      if (this.state === 'lassoPrep') {
        c.fillStyle = '#c8a870';
        for (var a = 0; a < TC.TAU; a += 0.15) c.fillRect(Math.round(hx + Math.cos(a) * 14), Math.round(hy + Math.sin(a) * 4 * Math.cos(ang)), 1, 1);
        c.fillRect(hx, hy, 1, 10);
      } else drawBolas(c, hx, hy + 4, ang, 8);
    }
  };
  Moco.prototype.light = function (L, cx, cy) {
    var hot = this.state === 'spinPrep' || this.state === 'stompPrep' || this.state === 'lassoPrep' || this.state === 'summon';
    L.add(this.x + this.face * 3 - cx, this.y - 68 - cy, hot ? 30 : 18, '#ff4010', hot ? 0.9 : 0.6);
    L.add(this.x - cx, this.y - 40 - cy, 64, '#b89090', 0.55);   // o terno preto precisa de luz para aparecer
    if (this.state === 'dying' || this.state === 'downed') L.add(this.x - cx, this.y - 30 - cy, 50, '#c0c040', 0.6);
  };
  Moco.prototype.glow = function (c, cx, cy) {
    TC.Lighting.glow(c, this.x + this.face * 3 - cx, this.y - 68 - cy, 4, '#ff6030', 0.7);
  };

  function drawBolas(c, x, y, ang, r) {
    for (var k = 0; k < 3; k++) {
      var a = ang + k * TC.TAU / 3;
      var bx = Math.round(x + Math.cos(a) * r), by = Math.round(y + Math.sin(a) * r * 0.6);
      c.fillStyle = '#8a6a40';
      var n = 6;
      for (var s = 1; s < n; s++) c.fillRect(Math.round(x + (bx - x) * s / n), Math.round(y + (by - y) * s / n), 1, 1);
      c.fillStyle = '#5a5a66'; c.fillRect(bx - 1, by - 1, 3, 3);
      c.fillStyle = '#a0a0ac'; c.fillRect(bx - 1, by - 1, 1, 1);
    }
  }

  /* laço: vai na altura do peito e volta para a mão do Moço */
  function Lasso(boss, x, y, dir, speed, range) {
    this.boss = boss; this.x = x; this.y = y; this.x0 = x; this.dir = dir;
    this.vx = dir * speed; this.range = range; this.t = 0; this.alive = true; this.ret = false; this.kind = 'lasso';
  }
  Lasso.prototype.update = function (st) {
    this.t++;
    var b = this.boss;
    if (!b.alive || b.state === 'dying' || b.state === 'downed') { this.alive = false; return; }
    if (!this.ret) {
      this.x += this.vx;
      if (Math.abs(this.x - this.x0) > this.range || this.t > 70) this.ret = true;
      var p = st.player;
      if (st.mode === 'play' && TC.overlap({ x: this.x - 8, y: this.y - 6, w: 16, h: 12 }, p.hurtBox())) {
        if (p.damage(st, 1, this.dir)) {
          p.vx = -this.dir * 2.8;   // o laço puxa o Arno para perto
          TC.audio.sfx('lasso');
        }
        this.ret = true;
      }
    } else {
      var h = b.hand();
      this.x += (h.x - this.x) * 0.16;
      this.y += (h.y - this.y) * 0.1;
      if (Math.abs(this.x - h.x) < 10) this.alive = false;
    }
  };
  Lasso.prototype.draw = function (c, cx, cy) {
    var h = this.boss.hand();
    c.fillStyle = '#c8a870';
    var n = Math.max(2, Math.round(Math.abs(this.x - h.x) / 2));
    for (var i = 0; i <= n; i++) {
      var k = i / n;
      c.fillRect(Math.round(h.x + (this.x - h.x) * k - cx), Math.round(h.y + (this.y - h.y) * k + Math.sin(k * Math.PI) * 6 - cy), 1, 1);
    }
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    for (var a = 0; a < TC.TAU; a += 0.3) c.fillRect(Math.round(x + Math.cos(a) * 6), Math.round(y + Math.sin(a) * 8), 1, 1);
  };

  /* boleadeira: rola baixinho pelo chão — é só pular */
  function Bola(boss, x, y, vx) {
    this.boss = boss; this.x = x; this.y = y; this.vx = vx; this.t = 0; this.alive = true; this.kind = 'bola';
  }
  Bola.prototype.update = function (st) {
    this.t++;
    this.x += this.vx;
    var a = this.boss.arena;
    if (this.x < a.x0 - 10 || this.x > a.x0 + W + 10 || this.t > 160) this.alive = false;
    var p = st.player;
    if (st.mode === 'play' && TC.overlap({ x: this.x - 7, y: this.y - 7, w: 14, h: 12 }, p.hurtBox())) {
      if (p.damage(st, 2, Math.sign(this.vx), true)) this.alive = false;
    }
  };
  Bola.prototype.draw = function (c, cx, cy) { drawBolas(c, Math.round(this.x - cx), Math.round(this.y - cy), this.t * 0.5 * Math.sign(this.vx), 7); };

  /* onda da pisada do casco: corre rente ao chão */
  function Wave(boss, x, y, vx) {
    this.boss = boss; this.x = x; this.y = y; this.vx = vx; this.t = 0; this.alive = true; this.kind = 'wave';
  }
  Wave.prototype.update = function (st) {
    this.t++;
    this.x += this.vx;
    if (this.t % 3 === 0) st.parts.add({ x: this.x, y: this.y - 2, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.4), ay: 0.06, life: 18, color: TC.rnd.pick(['#c8a070', '#8a6a40', '#e8c890']), size: 2, fade: true });
    var a = this.boss.arena;
    if (this.t > 70 || this.x < a.x0 || this.x > a.x0 + W) this.alive = false;
    var p = st.player;
    if (st.mode === 'play' && p.onGround && Math.abs(p.x - this.x) < 8) {
      if (p.damage(st, 1, Math.sign(this.vx))) this.alive = false;
    }
  };
  Wave.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    c.fillStyle = '#e8c890';
    for (var i = -5; i <= 5; i++) { var h = Math.round(6 * (1 - Math.abs(i) / 6)); c.fillRect(x + i, y - h, 1, 1); }
    c.fillStyle = 'rgba(255,220,160,0.5)'; c.fillRect(x - 4, y - 2, 9, 2);
  };

  /* vagonete de carvão (quebrável) */
  function Cart(x, y, drop) {
    E.Breakable.call(this, 'crate', x, y, drop);
    this.name = 'en.cart';
    this.w = 18; this.h = 12;
  }
  Cart.prototype = Object.create(E.Breakable.prototype);
  Cart.prototype.hit = function (st, dmg, dir, kb, id) {
    var r = E.Breakable.prototype.hit.call(this, st, dmg, dir, kb, id);
    if (r && !this.alive) for (var i = 0; i < 10; i++) st.parts.add({ x: this.x, y: this.y - 8, vx: TC.rnd.range(-2, 2) + dir, vy: TC.rnd.range(-3, -1), ay: 0.2, life: 40, color: TC.rnd.pick(['#141214', '#2a2626', '#4a4a56']), size: 2, fade: true });
    return r;
  };
  Cart.prototype.draw = function (c, cx, cy) {
    var img = art().cartImg;
    var sx = this.shake ? ((this.shake % 2) ? 1 : -1) : 0;
    c.drawImage(img, Math.round(this.x - img.width / 2 - cx + sx), Math.round(this.y - img.height - cy));
  };

  /* figura de cena (o Ewald, a Ingrid, o Moço dançando): conjunto de poses + posição */
  function Actor(set, x, y, face) {
    this.set = set; this.pose = 'idle'; this.x = x; this.y = y; this.face = face || 1;
    this.t = 0; this.alive = true; this.alpha = 1; this.vx = 0; this.speed = 14; this.lightCol = null; this.ghost = false;
  }
  Actor.prototype.update = function () { this.t++; this.x += this.vx; };
  Actor.prototype.draw = function (c, cx, cy) {
    var arr = this.set[this.pose] || this.set.idle;
    if (!arr || !arr.length) arr = [arr];
    var img = arr[Math.floor(this.t / this.speed) % arr.length];
    if (this.x - cx < -60 || this.x - cx > W + 60) return;
    drawSprite(c, this.ghost ? TC.tintCached(img, '#b8c8ff', 0.5) : img, this.x - cx, this.y - cy + 1, this.face, false, this.alpha * (this.ghost ? 0.75 : 1));
  };
  Actor.prototype.light = function (L, cx, cy) { if (this.lightCol) L.add(this.x - cx, this.y - 30 - cy, 34, this.lightCol, 0.5 * this.alpha); };

  /* casais valsando ao fundo do salão (só enfeite) */
  function BallDancers(cx, w, n) {
    this.cx = cx; this.w = w; this.n = n; this.t = 0; this.alive = true; this.alpha = 1;
  }
  BallDancers.prototype.update = function () { this.t++; };
  BallDancers.prototype.draw = function (c, cx, cy) {
    if (Math.abs(this.cx - cx - 128) > this.w / 2 + 200) return;
    var S = art().couple.waltz;
    var list = [];
    for (var k = 0; k < this.n; k++) {
      var a = this.t * 0.006 + k / this.n * TC.TAU;
      list.push({ x: this.cx + Math.cos(a) * this.w / 2, z: Math.sin(a), k: k });
    }
    list.sort(function (p, q) { return p.z - q.z; });
    var self = this;
    list.forEach(function (d) {
      var img = S[Math.floor((self.t + d.k * 7) / 10) % 4];
      var sc = d.z < 0 ? 0.75 : 1;
      var fl = d.z < 0 ? 1 : -1;
      c.globalAlpha = (0.25 + 0.25 * (d.z + 1)) * self.alpha;
      var im = fl < 0 ? TC.flip(img) : img;
      var w = Math.round(img.width * sc), h = Math.round(img.height * sc);
      c.drawImage(im, Math.round(d.x - cx - w / 2), Math.round(184 - h + (d.z < 0 ? -8 : 0) - cy), w, h);
      c.globalAlpha = 1;
    });
  };

  /* a bandinha do Erwin, tocando sem parar desde 1852 */
  function Band(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; this.playing = true; }
  Band.prototype.update = function (st) {
    this.t++;
    if (this.playing && this.t % 24 === 0 && Math.abs(this.x - st.camX - 128) < 200) st.parts.add({ x: this.x + TC.rnd.range(-50, 50), y: this.y - 50, vx: TC.rnd.range(-0.2, 0.2), vy: -0.5, life: 60, color: '#c0d0ff', size: 1, fade: true, layer: 1 });
  };
  Band.prototype.draw = function (c, cx, cy) {
    var B = art().band;
    var img = B[this.playing ? (this.t >> 4) % 2 : 0];
    if (this.x - cx < -100 || this.x - cx > W + 100) return;
    c.globalAlpha = 0.85;
    c.drawImage(img, Math.round(this.x - img.ox - cx), Math.round(this.y - img.oy - cy));
    c.globalAlpha = 1;
  };
  Band.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - 30 - cy, 70, '#8098ff', 0.5); };

  TC.ENEMIES.miner = Miner;
  TC.ENEMIES.bat = Bat;
  TC.ENEMIES.dancer = Dancer;
  TC.ENEMIES.moco = Moco;
  TC.ent.Cart = Cart;
  TC.ent.Actor = Actor;
  TC.ent.BallDancers = BallDancers;
  TC.ent.Band = Band;
})();
