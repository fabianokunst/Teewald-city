'use strict';
/* Teewald City — capítulo 7: os ecos do Ciclope e do Moço do Baile (enfraquecidos, sem encerrar a fase), der Alte em
   forma verdadeira (a nave, o porão do Hoffnung, o pau-de-fita), as mãos compridas (vitrais, tábuas e as que agarram gente),
   as assinaturas em X, o laço bento do Arno e as figuras de cena: o Seu Helmut na janela, a nave com o povo nos bancos
   (que vira o porão do navio e depois a roda do pau-de-fita), a Oma Hedwig com o lampião, a corda do sino, a Hilde,
   os vaga-lumes, as engrenagens do relógio e os pombos da torre. */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  if (!K) return;
  var base = K.base, drawSprite = K.drawSprite, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W, GY = 192, CEIL = 26;
  function art() { return TC.ART.ch7Init(); }
  function sgn(v) { return v < 0 ? -1 : 1; }

  /* ================= ECO DO CICLOPE ================= */
  var Boss = TC.ENEMIES.boss;
  function EchoCyclops(x, y, opt) {
    opt = opt || {};
    Boss.call(this, x, y, opt.arena);
    this.type = 'c7cyclops';
    this.hp = this.maxHp = Math.max(8, Math.round(TC.diff().bossHp * 0.4));
    if (opt.arena && opt.arena.bossHpLeft) this.hp = TC.clamp(opt.arena.bossHpLeft, 1, this.maxHp);
    this.name = 'c7.echo1';
    this.score = 3000;
    this.echo = true;
    this.bar = { name: '#c8e0ff', back: '#0c1420', fill: '#80b0e0', hi: '#d8f0ff' };
  }
  EchoCyclops.prototype = Object.create(Boss.prototype);
  EchoCyclops.prototype.update = function (st) {
    if (this.state === 'gone') { echoFade(this, st); return; }
    if (this.state === 'intro' && this.t >= 130 && st.mode === 'play') this.set('hover');
    if (this.state === 'dying' && this.t >= 148) { echoGone(this, st); return; }
    var n0 = st.orbs.length;
    st.c7dmgMul = 0.5;
    Boss.prototype.update.call(this, st);
    st.c7dmgMul = 0;
    for (var i = n0; i < st.orbs.length; i++) weaken(st.orbs[i]);
  };
  EchoCyclops.prototype.draw = function (c, cx, cy) {
    var B = TC.ART.boss, img;
    switch (this.state) {
      case 'swoop': img = B.swoop[0]; break;
      case 'cast': case 'castPrep': case 'summon': img = B.cast[0]; break;
      case 'stagger': case 'tired': img = B.hurt[0]; break;
      case 'dying': case 'gone': img = B.dead[0]; break;
      default: img = B.hover[Math.floor(this.t / 6) % 6];
    }
    var shake = this.state === 'dying' ? TC.rnd.int(-2, 2) : 0;
    var oy = this.state === 'swoop' ? 26 : 4;
    var a = (this.state === 'gone' ? this.alpha : 1) * (0.74 + Math.sin(this.t * 0.15) * 0.1);
    drawSprite(c, TC.tintCached(img, '#b8d0ff', 0.45), this.x - cx + shake, this.y - cy + oy, this.face, this.flash > 0, a);
  };
  EchoCyclops.prototype.light = function (L, cx, cy) {
    L.add(this.x + this.face - cx, this.y - 56 - cy, 60, '#80b8ff', 0.6 * (this.state === 'gone' ? this.alpha : 1));
  };
  EchoCyclops.prototype.glow = function (c, cx, cy) { if (this.state !== 'gone') TC.Lighting.glow(c, this.x + this.face - cx, this.y - 56 - cy, 9, '#c0e0ff', 0.5); };

  /* ================= ECO DO MOÇO DO BAILE ================= */
  var Moco = TC.ENEMIES.moco;
  function EchoMoco(x, y, opt) {
    opt = opt || {};
    Moco.call(this, x, y, opt);
    this.type = 'c7moco';
    this.hp = this.maxHp = Math.max(8, Math.round(TC.diff().bossHp * 0.45));
    if (opt.arena && opt.arena.bossHpLeft) this.hp = TC.clamp(opt.arena.bossHpLeft, 1, this.maxHp);
    this.name = 'c7.echo2';
    this.score = 3000;
    this.echo = true;
    this.p2 = true;   // o eco não troca a música nem grita na metade
    this.alpha = 0;
    this.bar = { name: '#ffd8e0', back: '#200810', fill: '#c06080', hi: '#ffb0c0' };
  }
  EchoMoco.prototype = Object.create(Moco.prototype);
  EchoMoco.prototype.update = function (st) {
    if (this.state === 'gone') { echoFade(this, st); return; }
    if (this.state === 'intro') {
      this.alpha = Math.min(1, this.alpha + 0.02);
      if (this.t % 4 === 0) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(0, 70), vy: -0.5, life: 30, color: '#c0b0e0', size: 1, fade: true });
      if (this.t > 80 && st.mode === 'play') this.set('stalk');
    }
    if (this.state === 'dying' && this.t >= 128) { echoGone(this, st); return; }
    st.c7dmgMul = 0.5;
    Moco.prototype.update.call(this, st);
    st.c7dmgMul = 0;
    this.projs.forEach(weaken);
  };
  EchoMoco.prototype.draw = function (c, cx, cy) {
    var a0 = this.alpha;
    this.alpha = a0 * (0.74 + Math.sin(this.t * 0.13) * 0.1);
    Moco.prototype.draw.call(this, c, cx, cy);
    this.alpha = a0;
  };
  /* golpes que saem dos ecos (orbes, laço, boleadeira, onda) também batem com metade da força */
  function weaken(o) {
    if (!o || o._c7weak) return;
    o._c7weak = true;
    var u = o.update;
    o.update = function (st) { st.c7dmgMul = 0.5; u.call(this, st); st.c7dmgMul = 0; };
  }
  function echoGone(e, st) {
    e.state = 'gone'; e.t = 0; e.alpha = 1; e.dying = true;
    st.addScore(e.score);
    if (st.boss === e) st.boss = null;
    TC.audio.sfx('ghostDie');
    if (e.projs) e.projs.forEach(function (pj) { pj.alive = false; });
  }
  function echoFade(e, st) {
    e.t++;
    e.alpha -= 0.02;
    if (e.t % 2 === 0) st.parts.add({ x: e.x + TC.rnd.range(-16, 16), y: e.y - TC.rnd.range(0, 70), vx: TC.rnd.range(-0.5, 0.5), vy: TC.rnd.range(-1.2, -0.3), life: 50, colors: ['#ffffff', '#c0d0ff', '#6070c0'], size: TC.rnd.int(1, 3), fade: true, layer: 1 });
    if (e.alpha <= 0) e.alive = false;
  }

  /* ================= DER ALTE — O ANTIGO ================= */
  function Alte(x, y, opt) {
    base(this, 'c7alte', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.w = 80; this.h = 40;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 2.0);
    this.name = 'boss7.name';
    this.isBoss = true;
    this.score = 25000;
    this.state = 'intro';
    this.phase = 1;
    this.ribbons = 0;
    this.attacks = 0;
    this.stagger = 0;
    this.vx = 0; this.vy = 0;
    this.hidden = 0;
    this.dazzleCD = 0;
    this.grab = null;
    this.bar = { name: '#f4ecd8', back: '#1a080c', fill: '#d8ccb8', hi: '#ffffff' };
  }
  var AP = Alte.prototype;
  AP.L = function () { return this.arena.x0 + 44; };
  AP.R = function () { return this.arena.x0 + W - 44; };
  AP.mid = function () { return this.arena.x0 + W / 2; };
  AP.set = function (s) { this.state = s; this.t = 0; };
  AP.third = function () { return this.maxHp * 0.33; };
  AP.floorHp = function () {
    if (this.phase === 1) return this.maxHp * 0.66;
    if (this.phase === 2) return this.maxHp * 0.33;
    return this.third() * Math.max(0, 7 - this.ribbons) / 7;
  };
  AP.attacking = function () {
    var s = this.state;
    return s === 'rear' || s === 'swipe' || s === 'chargePrep' || s === 'charge' || s === 'dropPrep' || s === 'drop' || s === 'fogPrep' || s === 'lunge' || s === 'sig' || s === 'floorCall' || s === 'grabCall';
  };
  AP.invuln = function () {
    var s = this.state;
    return s === 'intro' || s === 'phase' || s === 'wall' || s === 'ceil' || s === 'dropPrep' || s === 'fogBreath' || s === 'fogHide' || s === 'fogPrep' ||
      s === 'kneel' || s === 'dying' || s === 'gone' || this.hidden > 0.5 || this.inPhase;
  };
  AP.tall = function () { var s = this.state; return s === 'rear' || s === 'swipe' || s === 'sig' || s === 'fogBreath' || s === 'grabCall' || s === 'floorCall' || s === 'intro'; };
  AP.hurtBox = function () {
    var s = this.state;
    if (s === 'wall' || s === 'ceil' || s === 'dropPrep') return { x: this.x - 30, y: -200, w: 60, h: 40 };
    if (this.tall()) return { x: this.x - 24, y: this.y - 120, w: 48, h: 118 };
    if (s === 'charge' || s === 'lunge') return { x: this.x - 40, y: this.y - 32, w: 80, h: 30 };
    return { x: this.x - 42, y: this.y - 58, w: 84, h: 56 };
  };
  AP.hit = function (st, d, dir, kb, id, atk) {
    if (!this.alive || this.invuln() || id === this.lastHit) return false;
    this.lastHit = id;
    var dmg = d * (this.state === 'dazzled' ? 1.5 : 1);
    this.applyDamage(st, dmg);
    this.flash = 6;
    this.hitstop = (atk && atk.stop) || 3;
    TC.audio.sfx(atk && atk.heavy ? 'hit2' : 'hit');
    this.stagger += dmg;
    var s = this.state;
    if (this.stagger >= 14 && (s === 'stalk' || s === 'rear' || s === 'sig' || s === 'floorCall' || s === 'grabCall')) {
      this.stagger = 0; this.set('stagger'); this.vx = dir * 1.4; TC.audio.sfx('demon');
    }
    return true;
  };
  AP.applyDamage = function (st, dmg) {
    this.hp = Math.max(this.floorHp(), this.hp - dmg);
    if (this.phase === 3 && st.level.c7danceBonus) st.level.c7danceBonus(st, dmg);
    this.checkPhase(st);
  };
  /* golpes nas mãos também ferem o dono delas */
  AP.handHit = function (st, dmg) {
    if (this.invuln() && this.state !== 'ceil' && this.state !== 'wall' && this.state !== 'dropPrep' && this.state !== 'fogHide') return;
    if (this.inPhase || this.state === 'kneel' || this.state === 'dying' || this.state === 'gone') return;
    this.flash = 4;
    this.applyDamage(st, dmg * 0.8);
  };
  AP.checkPhase = function (st) {
    if (this.inPhase) return;
    if (this.phase === 1 && this.hp <= this.maxHp * 0.66 + 0.001 && st.level.c7phase) st.level.c7phase(st, this, 2);
    else if (this.phase === 2 && this.hp <= this.maxHp * 0.33 + 0.001 && st.level.c7phase) st.level.c7phase(st, this, 3);
  };
  AP.die = function () { this.hp = Math.max(1, this.hp); };   // só o sino manda ele embora
  AP.botJump = function (p) {
    if ((this.state === 'charge' || this.state === 'lunge') && this.t > 3) return p.onGround && (p.x - this.x) * this.face > 0 && Math.abs(p.x - this.x) < 94;
    return false;
  };
  AP.chooseAttack = function (st, adx) {
    var n = ++this.attacks, k, seq;
    if (this.phase === 1) {
      seq = ['charge', 'climb', 'rear', 'fog', 'charge', 'grab', 'rear', 'climb'];
      k = seq[n % seq.length];
      if (k === 'grab' && !(st.level.c7canGrab && st.level.c7canGrab(st))) k = 'rear';
    } else if (this.phase === 2) {
      seq = ['sig', 'floor', 'rear', 'charge', 'sig', 'floor', 'rear'];
      k = seq[n % seq.length];
    } else {
      seq = ['grabD', 'rear', 'sig', 'grabD', 'rear', 'charge'];
      k = seq[n % seq.length];
      if (k === 'grabD' && !(st.level.c7canGrabDancer && st.level.c7canGrabDancer(st))) k = 'rear';
      if (k === 'charge' && this.ribbons >= 4) k = 'sig';
    }
    if (k === 'charge' && adx < 70) k = 'rear';
    if (k === 'rear' && adx > 120) k = this.phase === 2 ? 'sig' : 'charge';
    if (k === 'charge' && this.phase === 3 && this.ribbons >= 4) k = 'sig';
    if (k === 'rear') this.set('rear');
    else if (k === 'charge') this.set('chargePrep');
    else if (k === 'climb') { this.side = this.x < this.mid() ? -1 : 1; this.set('climb'); }
    else if (k === 'fog') this.set('fogBreath');
    else if (k === 'grab') { this.grabMode = 'grab'; this.set('grabCall'); }
    else if (k === 'grabD') { this.grabMode = 'grabD'; this.set('grabCall'); }
    else if (k === 'sig') this.set('sig');
    else if (k === 'floor') this.set('floorCall');
  };
  AP.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.dazzleCD > 0) this.dazzleCD--;
    var p = st.player, t = this.t, G = st.groundY, D = TC.diff(), play = st.mode === 'play';
    var slow = this.phase === 3 ? (1 - this.ribbons * 0.07) : 1;
    var spd = D.speed * slow * (this.phase === 2 ? 0.92 : 1);
    var dx = p.x - this.x;
    if (this.grab && !this.grab.alive) this.grab = null;
    if (this.state !== 'fogHide' && this.state !== 'fogPrep' && this.state !== 'fogWait') this.hidden = Math.max(0, this.hidden - 0.08);
    switch (this.state) {
      case 'intro': case 'phase':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        break;
      case 'stalk': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * 100, this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx, Math.abs(gap) > 10 ? Math.sign(gap) * 1.0 * spd : 0, 0.07);
        this.x += this.vx;
        if (t % 18 === 0 && Math.abs(this.vx) > 0.4) TC.audio.sfx('skitter');
        var hed = st.c7hedwig;
        if (this.phase === 2 && hed && hed.alpha > 0.7 && this.dazzleCD <= 0 && Math.abs(hed.x - this.x) < 62) {
          this.set('dazzled'); this.vx = sgn(this.x - hed.x) * 1.6; this.dazzleCD = 360;
          TC.audio.sfx('demon'); TC.fx.flash('#ffe0a0', 0.35, 0.05);
          st.floatText(this.x, this.y - 96, TC.t('c7.dazzle'), '#ffe0a0');
          break;
        }
        var cool = frames(this.phase === 1 ? 80 : this.phase === 2 ? 72 : 92, D.cool);
        if (!this.grab && t > cool && play && st.mayAttack(this)) this.chooseAttack(st, Math.abs(dx));
        break;
      }
      case 'rear':
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (t === 1) TC.audio.sfx('growl');
        if (t > frames(34, D.windup) / slow) { this.set('swipe'); TC.audio.sfx('swing2'); }
        break;
      case 'swipe':
        if (t >= 6 && t <= 12 && play) {
          // as fitas amarram os braços: o alcance encurta a cada fita
          var reach = 70 - this.ribbons * 4;
          var bx = this.face > 0 ? this.x + 6 : this.x - 6 - reach;
          if (TC.overlap({ x: bx, y: this.y - 110, w: reach, h: 100 }, p.hurtBox())) p.damage(st, 2, this.face, true);
        }
        if (t === 8) { TC.fx.shake(2, 6); st.dust(this.x + this.face * 60, G); }
        if (t > 36) this.set('stalk');
        break;
      case 'chargePrep': {
        if (t === 1) { this.side = this.x < this.mid() ? -1 : 1; TC.audio.sfx('demon'); }
        var ex = this.side < 0 ? this.L() - 14 : this.R() + 14;
        this.x += (ex - this.x) * 0.08;
        this.face = -this.side;
        if (t % 6 === 0) st.dust(this.x - this.face * 30, G);
        if (t > frames(48, D.windup) / slow) { this.set('charge'); TC.audio.sfx('skitter'); }
        break;
      }
      case 'charge':
        this.face = -this.side;
        if (t > 6) this.x += this.face * 4.2 * spd;
        if (t % 4 === 0) { st.dust(this.x - this.face * 34, G); TC.audio.sfx('step'); }
        if ((this.face > 0 && this.x > this.R() + 16) || (this.face < 0 && this.x < this.L() - 16)) {
          this.set('dizzy'); TC.fx.shake(4, 14); TC.audio.sfx('wood'); TC.audio.sfx('hit2');
        }
        break;
      case 'dizzy': case 'landed':
        if (this.state === 'dizzy' && t % 20 === 0) for (var s3 = 0; s3 < 3; s3++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 74, vx: Math.cos(t * 0.3 + s3 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(this.state === 'landed' ? 78 : (this.phase === 2 ? 80 : 100), D.cool)) this.set('stalk');
        break;
      case 'climb': {
        var wx = this.side < 0 ? this.arena.x0 + 22 : this.arena.x0 + W - 22;
        this.face = this.side;
        this.x = TC.approach(this.x, wx, 2.4 * spd);
        if (t % 10 === 0) TC.audio.sfx('skitter');
        if (Math.abs(this.x - wx) < 1 || t > 120) { this.x = wx; this.set('wall'); }
        break;
      }
      case 'wall':
        this.face = this.side;
        this.y -= 2.6;
        if (t % 8 === 0) { TC.audio.sfx('skitter'); st.parts.add({ x: this.x + this.side * 14, y: this.y - 40, vx: -this.side * 0.4, vy: 0.6, ay: 0.1, life: 30, color: '#8a8698', size: 1 }); }
        if (this.y <= 96) { this.y = CEIL; this.set('ceil'); this.face = -this.side; }
        break;
      case 'ceil': {
        var cx2 = TC.clamp(p.x, this.L(), this.R());
        this.face = cx2 < this.x ? -1 : 1;
        this.x = TC.approach(this.x, cx2, 1.7 * spd);
        if (t % 14 === 0) TC.audio.sfx('skitter');
        if (t === 26 && st.level.c7spawnSlam) st.level.c7spawnSlam(st, this, p.x, 0);
        if (t === 70 && D.attackers > 1 && st.level.c7spawnSlam) st.level.c7spawnSlam(st, this, p.x + (p.x < this.mid() ? 40 : -40), 0);
        if ((t > 90 && Math.abs(this.x - p.x) < 14) || t > 170) { this.set('dropPrep'); TC.audio.sfx('growl'); }
        break;
      }
      case 'dropPrep':
        if (t < frames(22, D.windup)) this.x = TC.approach(this.x, TC.clamp(p.x, this.L(), this.R()), 0.9);
        if (t % 6 === 0) st.parts.add({ x: this.x + TC.rnd.range(-20, 20), y: CEIL + 4, vy: 1.4, ay: 0.12, life: 40, color: '#8a8698', size: 1 });
        if (t > frames(54, D.windup)) { this.set('drop'); this.y = CEIL + 110; this.vy = 1; TC.audio.sfx('demon'); }
        break;
      case 'drop':
        this.vy += 0.45;
        this.y += this.vy;
        if (this.y >= G) {
          this.y = G; this.set('landed');
          TC.fx.shake(5, 18); TC.audio.sfx('hit2'); TC.audio.sfx('land');
          st.dust(this.x - 40, G); st.dust(this.x + 40, G); st.dust(this.x - 18, G); st.dust(this.x + 18, G);
          if (play && p.onGround && Math.abs(p.x - this.x) < 48) p.damage(st, 2, p.x < this.x ? -1 : 1, true);
        }
        break;
      case 'fogBreath':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) { TC.audio.sfx('c7fog'); TC.audio.sfx('demon'); }
        if (t === 20) st.c7fogT = 0.88;
        if (t % 3 === 0) st.parts.add({ x: this.x + this.face * 40, y: this.y - 80, vx: this.face * TC.rnd.range(1, 2.5), vy: TC.rnd.range(-0.5, 0.5), life: 50, color: '#a0a0c8', size: 3, fade: true, layer: 1 });
        if (t > 44) { this.set('fogHide'); if (st.hint == null || st.hint.key !== 'hint.c7fog') st.hint = { key: 'hint.c7fog', t: 240 }; }
        break;
      case 'fogHide':
        this.hidden = Math.min(1, this.hidden + 0.05);
        this.x += Math.sin(t * 0.03) * 0.8;
        this.x = TC.clamp(this.x, this.L(), this.R());
        if (t > frames(70, 1)) {
          this.side = p.x < this.mid() ? 1 : -1;
          this.x = this.side > 0 ? this.R() + 22 : this.L() - 22;
          this.face = -this.side;
          this.set('fogPrep');
        }
        break;
      case 'fogPrep':
        this.hidden = 1;
        if (t === 1) TC.audio.sfx('growl');
        if (t === Math.round(frames(48, D.windup) * 0.5)) TC.audio.sfx('demon');
        if (t > frames(52, D.windup)) { this.set('lunge'); this.hidden = 0.6; TC.audio.sfx('skitter'); }
        break;
      case 'lunge':
        this.hidden = Math.max(0, this.hidden - 0.1);
        this.face = -this.side;
        this.x += this.face * 4.6 * spd;
        if (t % 4 === 0) st.dust(this.x - this.face * 30, G);
        if ((this.face > 0 && this.x > this.R() + 18) || (this.face < 0 && this.x < this.L() - 18)) {
          this.set('dizzy'); st.c7fogT = 0; TC.fx.shake(3, 10); TC.audio.sfx('wood');
        }
        break;
      case 'grabCall':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        if (t === 1) TC.audio.sfx('demon');
        if (t === 16 && st.level.c7spawnGrab) this.grab = st.level.c7spawnGrab(st, this, this.grabMode);
        if (t > 40) this.set('stalk');
        break;
      case 'sig': {
        this.face = dx < 0 ? -1 : 1;
        if (t === 18 || t === 50) {
          var n = this.phase === 2 ? Math.min(5, D.orbs) : 3;
          var ox = this.x + this.face * 20, oy = this.y - 96;
          var ba = Math.atan2((p.y - 16) - oy, p.x - ox);
          for (var i = 0; i < n; i++) {
            var an = ba + (i - (n - 1) / 2) * 0.3;
            st.orbs.push(new SigX(ox, oy, Math.cos(an) * 1.7 * D.speed, Math.sin(an) * 1.7 * D.speed));
          }
          TC.audio.sfx('c7x');
        }
        if (t > 74) this.set('stalk');
        break;
      }
      case 'floorCall':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('demon');
        if (t === 10 && st.level.c7spawnFloor) {
          var nn = D.attackers > 1 ? 3 : 2;
          for (var k = 0; k < nn; k++) st.level.c7spawnFloor(st, this, p.x + (k === 0 ? 0 : k === 1 ? -48 : 48), k * 18);
        }
        if (t > 50) this.set('stalk');
        break;
      case 'dazzled':
        this.x += this.vx; this.vx *= 0.92;
        if (t % 10 === 0) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y - TC.rnd.range(20, 70), vy: -0.6, life: 30, color: '#ffe0a0', size: 1, fade: true, layer: 1 });
        if (t > frames(100, 1)) this.set('stalk');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        if (t > 50) this.set('stalk');
        break;
      case 'kneel':
        this.vx = 0;
        if (t % 30 === 0) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y - TC.rnd.range(10, 60), vy: -0.4, life: 40, color: '#c0c0d8', size: 2, fade: true });
        break;
      case 'dying':
        TC.fx.shake(2, 4);
        if (t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-40, 40), y: this.y - TC.rnd.range(4, 80), vx: TC.rnd.range(-0.6, 0.6), vy: TC.rnd.range(-1.6, -0.4), life: 70, colors: ['#e8e8f8', '#a0a0c8', '#5a5a80'], size: TC.rnd.int(2, 4), fade: true, layer: 1 });
        if (t % 20 === 0) { this.flash = 3; TC.audio.sfx(t % 40 === 0 ? 'demon' : 'c7fog'); }
        if (t === 100) {
          this.dying = true;
          this.set('gone');
          st.addScore(this.score);
          st.onBossDead(this);
        }
        break;
      case 'gone':
        break;
    }
    if (this.state !== 'wall' && this.state !== 'ceil' && this.state !== 'dropPrep' && this.state !== 'drop' && this.state !== 'climb') this.x = TC.clamp(this.x, this.arena.x0 - 30, this.arena.x0 + W + 30);
    if (this.state === 'charge' || this.state === 'lunge') contact(this, st, 2, true);
    else if (this.state === 'drop') contact(this, st, 2, true);
    else if (this.state === 'stalk') contact(this, st, 0.5, false, true);   // só no difícil (encostar)
  };
  AP.frame = function () {
    var S = art().alte, t = this.t;
    switch (this.state) {
      case 'intro': case 'fogBreath': case 'grabCall': case 'floorCall': return S.scream[0];
      case 'phase': return Math.abs(this.vx) > 0.2 ? S.crawl[Math.floor(t / 5) % 6] : S.idle[Math.floor(t / 24) % 2];
      case 'stalk': return Math.abs(this.vx) > 0.2 ? S.crawl[Math.floor(t / 6) % 6] : S.idle[Math.floor(t / 24) % 2];
      case 'climb': return S.crawl[Math.floor(t / 4) % 6];
      case 'wall': return S.wall[Math.floor(t / 5) % 6];
      case 'ceil': case 'dropPrep': return S.ceil[Math.floor(t / 6) % 6];
      case 'drop': return S.leap[0];
      case 'landed': return t < 14 ? S.land[0] : S.idle[0];
      case 'chargePrep': case 'fogPrep': return S.crouch[0];
      case 'charge': case 'lunge': return S.charge[Math.floor(t / 3) % 4];
      case 'dizzy': case 'stagger': case 'dazzled': return S.dizzy[Math.floor(t / 14) % 2];
      case 'rear': case 'sig': return S.rear[0];
      case 'swipe': return t < 8 ? S.swipe[0] : t < 22 ? S.swipe[1] : S.rear[0];
      case 'fogHide': return S.crawl[Math.floor(t / 8) % 6];
      case 'kneel': return S.dizzy[0];
      case 'dying': case 'gone': return S.hurt[0];
    }
    return S.idle[0];
  };
  AP.eye = function () {
    var s = this.state;
    if (s === 'wall') return { x: this.x - this.face * 2, y: this.y - 60 - 40 };
    if (s === 'ceil' || s === 'dropPrep') return { x: this.x + this.face * 40, y: CEIL + 54 };
    var tall = this.tall();
    return { x: this.x + this.face * (tall ? 16 : 40), y: this.y - (tall ? 86 : (s === 'charge' || s === 'lunge') ? 43 : 54) };
  };
  AP.draw = function (c, cx, cy) {
    var G = 192, s = this.state, img = this.frame();
    // sombra do bote do teto
    if (s === 'ceil' || s === 'dropPrep' || s === 'drop') {
      var k = s === 'drop' ? 1 : s === 'dropPrep' ? Math.min(1, this.t / 20) : 0.35;
      c.fillStyle = 'rgba(160,20,30,' + (0.3 + 0.2 * Math.sin(this.t * 0.4)).toFixed(2) + ')';
      TC.fillEllipse(c, Math.round(this.x - cx), Math.round(G - cy - 1), Math.round(40 * k + 6), Math.max(1, Math.round(4 * k)));
    }
    var a = this.alpha * (1 - this.hidden);
    if (a <= 0.02) return;
    var shake = s === 'dying' ? TC.rnd.int(-2, 2) : (s === 'chargePrep' && this.t > 20) || s === 'kneel' ? ((this.t >> 1) % 2 ? 1 : -1) * (s === 'kneel' ? 0 : 1) : 0;
    if (s === 'wall') drawSprite(c, img, this.x - cx, this.y - cy - 64, this.face, this.flash > 0, a);
    else drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, a);
    if (this.ribbons > 0 && s !== 'wall' && s !== 'ceil' && s !== 'dropPrep') drawRibbons(c, this, cx, cy, a);
  };
  function drawRibbons(c, e, cx, cy, a) {
    var cols = art().FITAS;
    c.globalAlpha = a;
    var bodyY = e.y - 52 - cy, x0 = e.x - cx;
    for (var i = 0; i < e.ribbons; i++) {
      var ox = (i - 3) * 11 * e.face, oy = (i % 2) * 10 - 4;
      c.fillStyle = cols[i % 7];
      for (var j = 0; j < 12; j++) c.fillRect(Math.round(x0 + ox - 3 + j * 0.5), Math.round(bodyY + oy - 6 + j), 3, 1);
      // ponta solta tremulando
      for (var q = 0; q < 8; q++) c.fillRect(Math.round(x0 + ox + 3 + q * 1.2 * -e.face), Math.round(bodyY + oy + 6 + Math.sin(e.t * 0.25 + i + q * 0.6) * 1.5), 1, 2);
    }
    c.globalAlpha = 1;
  }
  AP.light = function (L, cx, cy) {
    if (this.state === 'gone') return;
    var e = this.eye(), a = this.alpha;
    var hot = this.state === 'chargePrep' || this.state === 'fogPrep' || this.state === 'rear' || this.state === 'dropPrep' || this.state === 'grabCall';
    L.add(e.x - cx, e.y - cy, hot ? 44 : 28, '#b0d8ff', (hot ? 0.95 : 0.6) * a);
    if (this.hidden < 0.5) L.add(this.x - cx, (this.state === 'ceil' || this.state === 'dropPrep' ? CEIL + 60 : this.y - 46) - cy, 84, '#8a7a9a', 0.42 * a * (1 - this.hidden));
  };
  AP.glow = function (c, cx, cy) {
    if (this.state === 'gone' || this.hidden > 0.5) return;
    var e = this.eye();
    TC.Lighting.glow(c, e.x - cx, e.y - cy, 7, '#d0f4ff', 0.6 * this.alpha);
  };

  /* ================= MÃO COMPRIDA ================= */
  function Hand(x, y, opt) {
    base(this, 'c7hand', x, y);
    opt = opt || {};
    this.mode = opt.mode || 'slam';
    this.boss = opt.boss || null;
    this.tx = opt.tx != null ? opt.tx : x;
    this.sx = opt.sx != null ? opt.sx : x; this.sy = opt.sy != null ? opt.sy : 0;
    this.hx = this.sx; this.hy = this.sy;
    this.target = opt.target || null;
    this.room = opt.room || null;
    this.delay = opt.delay || 0;
    var grabby = this.mode === 'grab' || this.mode === 'grabD';
    this.hp = this.maxHp = hpFor(grabby ? 3 : 4);
    this.name = 'en.c7hand';
    this.score = 150;
    this.state = this.delay > 0 ? 'wait' : (grabby ? 'reach' : 'warn');
    this.w = 20; this.h = 20;
    this.holdT = grabby ? ({ easy: 600, normal: 480, hard: 380 })[TC.opts.diff] || 480 : 0;
  }
  var HP_ = Hand.prototype;
  HP_.set = function (s) { this.state = s; this.t = 0; };
  HP_.attacking = function () { return this.state === 'warn' || this.state === 'strike' || this.state === 'burst'; };
  HP_.hurtBox = function () {
    var s = this.state;
    if (this.mode === 'slam' && (s === 'plant' || s === 'strike')) return { x: this.hx - 12, y: GY - 24, w: 24, h: 24 };
    if (this.mode === 'floor' && (s === 'plant' || s === 'burst')) return { x: this.tx - 11, y: this.hy - 4, w: 22, h: GY - this.hy + 4 };
    if ((this.mode === 'grab' || this.mode === 'grabD') && (s === 'hold' || s === 'reach')) return { x: this.hx - 12, y: this.hy - 14, w: 24, h: 26 };
    return { x: -9999, y: -9999, w: 1, h: 1 };
  };
  HP_.hit = function (st, d, dir, kb, id, atk) {
    if (!this.alive || this.dying || id === this.lastHit) return false;
    var hb = this.hurtBox();
    if (hb.x < -9000) return false;
    this.lastHit = id;
    this.hp -= d;
    this.flash = 6;
    this.hitstop = 3;
    st.showEnemyBar(this);
    TC.audio.sfx('hit');
    if ((this.mode === 'slam' || this.mode === 'floor') && this.boss && this.boss.alive) this.boss.handHit(st, d);
    if (this.hp <= 0) this.release(st, true);
    return true;
  };
  HP_.release = function (st, freed) {
    if (this.state === 'retract' || this.state === 'sink') return;
    this.dying = true;
    if (this.target && (this.mode === 'grab' || this.mode === 'grabD')) {
      if (freed) {
        this.target.grabbed = null;
        this.target.yoff = Math.min(0, this.hy + 24 - (this.target.baseY || GY));
        this.target.vy = 0;
        st.floatText(this.hx, this.hy - 20, TC.t('c7.freed'), '#e0ffe0');
        st.addScore(this.score);
        TC.audio.sfx('c7sparkle');
      }
    }
    if (freed) for (var i = 0; i < 10; i++) st.parts.add({ x: this.hx + TC.rnd.range(-8, 8), y: this.hy + TC.rnd.range(-8, 8), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.5, 0), life: 30, colors: ['#e8e0d0', '#a89c88', '#5a5048'], size: 2, fade: true });
    this.set(this.mode === 'floor' ? 'sink' : 'retract');
  };
  HP_.die = function (st) { this.release(st, true); };
  HP_.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, D = TC.diff(), play = st.mode === 'play', t = this.t;
    if (this.boss && (!this.boss.alive || this.boss.inPhase || this.boss.state === 'kneel' || this.boss.state === 'dying') && this.state !== 'retract' && this.state !== 'sink') this.release(st, true);
    switch (this.state) {
      case 'wait':
        if (t >= this.delay) this.set(this.mode === 'grab' || this.mode === 'grabD' ? 'reach' : 'warn');
        break;
      case 'warn':
        if (t === 1) {
          if (this.mode === 'slam') {
            TC.audio.sfx('c7glass');
            for (var g = 0; g < 14; g++) st.parts.add({ x: this.sx + TC.rnd.range(-8, 8), y: this.sy + TC.rnd.range(-20, 20), vx: TC.rnd.range(-1.2, 1.2), vy: TC.rnd.range(-1, 1), ay: 0.12, life: 60, color: TC.rnd.pick(['#e8b050', '#c84838', '#5070c8', '#58a868', '#d8c870']), size: 2 });
          } else TC.audio.sfx('creak');
        }
        if (this.mode === 'floor' && t % 6 === 0) st.dust(this.tx + TC.rnd.range(-8, 8), GY);
        if (t > frames(52, D.windup)) {
          if (this.mode === 'slam') { this.set('strike'); TC.audio.sfx('whoosh'); }
          else { this.set('burst'); this.hy = GY + 20; TC.audio.sfx('c7thud'); TC.fx.shake(3, 10); }
        }
        break;
      case 'strike': {
        var k = Math.min(1, t / 8);
        this.hx = TC.lerp(this.sx, this.tx, k); this.hy = TC.lerp(this.sy, GY, k);
        if (t === 8) {
          TC.audio.sfx('c7thud'); TC.fx.shake(3, 10); st.dust(this.tx - 10, GY); st.dust(this.tx + 10, GY);
          if (play && p.onGround && Math.abs(p.x - this.tx) < 18) p.damage(st, 2, p.x < this.tx ? -1 : 1, true);
          this.set('plant');
        }
        break;
      }
      case 'plant':
        if (this.mode === 'slam') { this.hx = this.tx; this.hy = GY; }
        if (t > frames(this.mode === 'slam' ? 64 : 46, 1)) this.release(st, false);
        break;
      case 'burst':
        this.hy = TC.approach(this.hy, GY - 30, 7);
        if (t === 3 && play && Math.abs(p.x - this.tx) < 15 && p.y > GY - 28) p.damage(st, 2, p.x < this.tx ? -1 : 1, true);
        if (t > 6) this.set('plant');
        break;
      case 'sink':
        this.hy += 4;
        if (this.hy > GY + 26) this.alive = false;
        break;
      case 'reach': {
        if (!this.target) { this.release(st, false); break; }
        if (t === 1) TC.audio.sfx('c7glass');
        var tgX = this.target.x, tgY = 158;
        var kk = Math.min(1, t / 34);
        this.hx = TC.lerp(this.sx, tgX, TC.ease.outQuad(kk)); this.hy = TC.lerp(this.sy, tgY, TC.ease.outQuad(kk));
        if (kk >= 1) {
          this.target.grabbed = this;
          this.set('hold');
          TC.audio.sfx('gasp'); TC.audio.sfx('crowd');
          st.floatText(this.hx, this.hy - 30, TC.t(this.mode === 'grabD' ? 'c7.grabbed' : 'hint.c7grab'), '#ff9080');
          if (this.mode === 'grab') st.hint = { key: 'hint.c7grab', t: 200 };
        }
        break;
      }
      case 'hold':
        this.hx = this.target.x + Math.sin(t * 0.3) * 2;
        this.hy = 160 + Math.sin(t * 0.13) * 2;
        if (t % 40 === 0) TC.audio.sfx('gasp');
        if (t > this.holdT) this.set('carry');
        break;
      case 'carry':
        this.hx = TC.approach(this.hx, this.sx, 3); this.hy = TC.approach(this.hy, this.sy, 3);
        if (Math.abs(this.hy - this.sy) < 4) {
          if (st.level.c7grabLost) st.level.c7grabLost(st, this);
          this.alive = false;
        }
        break;
      case 'retract':
        this.hx = TC.approach(this.hx, this.sx, 9); this.hy = TC.approach(this.hy, this.sy, 9);
        if (Math.abs(this.hx - this.sx) < 10 && Math.abs(this.hy - this.sy) < 10) this.alive = false;
        break;
    }
  };
  HP_.draw = function (c, cx, cy) {
    var H7 = art().hand, s = this.state;
    var shadow = (s === 'warn' && this.mode === 'slam') || (s === 'wait' && this.mode === 'slam' && this.delay - this.t < 20);
    if (shadow) {
      var k = Math.min(1, this.t / 24);
      c.fillStyle = 'rgba(170,20,30,' + (0.3 + 0.2 * Math.sin(this.t * 0.5)).toFixed(2) + ')';
      TC.fillEllipse(c, Math.round(this.tx - cx), GY - 1 - cy, Math.round(6 + 14 * k), Math.max(1, Math.round(3 * k)));
    }
    if (this.mode === 'floor') {
      // rachadura nas tábuas e a mão saindo do chão
      if (s === 'warn' || s === 'wait') {
        var kc = s === 'warn' ? Math.min(1, this.t / 30) : 0;
        c.fillStyle = '#100604';
        for (var i = -6; i <= 6; i++) if (Math.abs(i) < 6 * kc + 1) c.fillRect(Math.round(this.tx - cx + i * 2), GY - cy + (i % 2), 2, 1);
        c.fillStyle = 'rgba(170,20,30,' + (0.25 + 0.2 * Math.sin(this.t * 0.5)).toFixed(2) + ')';
        TC.fillEllipse(c, Math.round(this.tx - cx), GY - 1 - cy, Math.round(6 + 10 * kc), 2);
      } else {
        c.save();
        c.beginPath(); c.rect(0, 0, W, GY - cy + 1); c.clip();
        armLine(c, this.tx - cx, GY + 30 - cy, this.tx - cx, this.hy + 14 - cy, 6);
        var im = H7.up;
        c.drawImage(this.flash ? TC.tintCached(im, '#ffffff', 0.7) : im, Math.round(this.tx - cx - im.ox), Math.round(this.hy - cy - im.oy + 18));
        c.restore();
      }
      return;
    }
    if (s === 'wait' || s === 'warn') return;
    // braço comprido saindo da janela (ou do teto) até a mão
    armLine(c, this.sx - cx, this.sy - cy, this.hx - cx, this.hy - cy - 2, 6);
    var hand = (s === 'hold' || s === 'carry' || (s === 'reach' && this.t > 28)) ? H7.grab : H7.down;
    c.drawImage(this.flash ? TC.tintCached(hand, '#ffffff', 0.7) : hand, Math.round(this.hx - cx - hand.ox), Math.round(this.hy - cy - hand.oy - (this.mode === 'slam' ? 22 : 0)));
  };
  function armLine(c, x0, y0, x1, y1, th) {
    c.fillStyle = '#120a0e'; TC.thickLine(c, x0, y0, x1, y1, th + 2);
    c.fillStyle = '#d4c8b4'; TC.thickLine(c, x0, y0, x1, y1, th);
    c.fillStyle = '#a89c88'; TC.thickLine(c, x0 + 2, y0, x1 + 2, y1, Math.max(1, th - 4));
    var jx = x0 + (x1 - x0) * 0.55, jy = y0 + (y1 - y0) * 0.55;
    c.fillStyle = '#ece4d4'; TC.fillCircle(c, jx, jy, th * 0.7);
  }
  HP_.light = function (L, cx, cy) {
    if (this.state === 'hold' || this.state === 'reach') L.add(this.hx - cx, this.hy - cy, 26, '#c0c0e0', 0.5);
  };

  /* ================= ASSINATURA EM X ================= */
  function SigX(x, y, vx, vy) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.t = 0; this.alive = true; this.isOrb = true; this.lastHit = -1; this.hp = 1;
  }
  SigX.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.y += this.vy;
    if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-2, 2), y: this.y + TC.rnd.range(-2, 2), life: 18, color: '#3a1018', size: 2, fade: true, shrink: true });
    if (this.t > 260 || this.y > GY + 6 || this.x < st.camX - 30 || this.x > st.camX + W + 30) this.alive = false;
    var p = st.player;
    if (p.alive && TC.overlap({ x: this.x - 5, y: this.y - 5, w: 10, h: 10 }, p.hurtBox())) {
      if (p.damage(st, 1, this.vx > 0 ? 1 : -1)) this.alive = false;
    }
  };
  SigX.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 7, w: 14, h: 14 }; };
  SigX.prototype.hit = function (st) {
    if (!this.alive) return false;
    this.alive = false;
    TC.audio.sfx('hit');
    st.spark(this.x, this.y, 1);
    for (var i = 0; i < 6; i++) st.parts.add({ x: this.x, y: this.y, vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-1.5, 1), life: 26, color: '#e8dcc0', size: 1, fade: true });
    return true;
  };
  SigX.prototype.draw = function (c, cx, cy) {
    var img = art().x;
    var wob = Math.round(Math.sin(this.t * 0.3) * 1);
    c.drawImage(img, Math.round(this.x - cx - img.width / 2), Math.round(this.y - cy - img.height / 2 + wob));
  };

  /* ================= O LAÇO BENTO ================= */
  var LASSO_ATK = { dmg: 2, kb: 2.6, lift: -2.2, stop: 6, heavy: true };
  var lassoSeq = 1;
  function Lasso(st, p) {
    this.p = p; this.dir = p.face; this.t = 0; this.len = 0; this.alive = true; this.phase = 'out';
    this.id = 950000 + (lassoSeq++); this.max = 74; this.caught = null;
    this.ox = p.x; this.oy = p.y - 22;
  }
  Lasso.prototype.update = function (st) {
    this.t++;
    var p = this.p;
    this.ox = p.x + this.dir * 8; this.oy = p.y - 22;
    if (p.state === 'hurt' || p.state === 'down' || p.state === 'dead') this.phase = 'back';
    if (this.phase === 'out') {
      this.len = Math.min(this.max, this.len + 10);
      var ex = this.ox + this.dir * this.len, ey = this.oy;
      var box = { x: ex - 10, y: ey - 10, w: 20, h: 20 };
      var lists = [st.enemies, st.props, st.orbs];
      for (var li = 0; li < lists.length && this.phase === 'out'; li++) {
        var arr = lists[li];
        for (var i = 0; i < arr.length; i++) {
          var e = arr[i];
          if (!e.alive || e.dying || !e.hurtBox) continue;
          if (!TC.overlap(box, e.hurtBox())) continue;
          if (e.hit(st, LASSO_ATK.dmg, this.dir, LASSO_ATK.kb, this.id, LASSO_ATK)) {
            st.spark(ex, ey, true);
            TC.audio.sfx('hit2');
            if (!e.isProp && !e.isOrb) {
              st.combo++; st.comboT = 80; st.addScore(10 * Math.min(st.combo, 10));
              if (!e.isBoss && e.type !== 'c7hand') { e.vx = -this.dir * 2.2; this.caught = e; }
            }
            this.phase = 'back';
            break;
          }
        }
      }
      if (this.len >= this.max) this.phase = 'back';
    } else {
      this.len -= 9;
      if (this.caught && this.caught.alive && !this.caught.isBoss && this.len > 12) {
        this.caught.x = TC.approach(this.caught.x, this.ox + this.dir * Math.max(16, this.len), 2);
      }
      if (this.len <= 0) this.alive = false;
    }
  };
  Lasso.prototype.draw = function (c, cx, cy) {
    var x0 = this.ox - cx, y0 = this.oy - cy, len = this.len;
    if (len <= 0) return;
    var x1 = x0 + this.dir * len, n = Math.max(2, Math.round(len / 2));
    c.fillStyle = '#d8b070';
    for (var i = 0; i <= n; i++) {
      var k = i / n;
      c.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + Math.sin(k * Math.PI) * 3 * (1 - len / this.max * 0.5)), 1, 1);
    }
    c.fillStyle = '#f0d898';
    for (var a = 0; a < TC.TAU; a += 0.35) c.fillRect(Math.round(x1 + this.dir * 5 + Math.cos(a) * 6), Math.round(y0 + Math.sin(a) * 5), 1, 1);
  };
  Lasso.prototype.light = function (L, cx, cy) { L.add(this.ox + this.dir * this.len - cx, this.oy - cy, 14, '#ffe0a0', 0.5); };
  TC.c7fireLasso = function (st, p) {
    st.deco.push(new Lasso(st, p));
    TC.audio.sfx('lassoWhip');
  };

  /* ================= SEU HELMUT NA JANELA ================= */
  function Helmut(L) {
    this.L = L; this.t = 0; this.alive = true; this.cd = 160; this.shot = null; this.win = null;
    this.interval = ({ easy: 250, normal: 340, hard: 500 })[TC.opts.diff] || 340;
  }
  Helmut.prototype.update = function (st) {
    this.t++;
    var L = this.L, camX = st.camX;
    this.win = null;
    if (camX < L.c7squareEnd) {
      var best = null, bd = 1e9;
      L.c7windows.forEach(function (w) {
        if (w.x < camX + 10 || w.x > camX + W - 10) return;
        var d = Math.abs(w.x - (camX + 128));
        if (d < bd) { bd = d; best = w; }
      });
      this.win = best;
    }
    if (this.shot && --this.shot.t <= 0) this.shot = null;
    if (!st.arena || st.mode !== 'play' || camX > L.c7squareEnd || st.arena.boss) return;
    if (--this.cd > 0) return;
    var cands = st.enemies.filter(function (e) {
      return e.alive && !e.dying && !e.isBoss && e.x > camX + 10 && e.x < camX + W - 10 && e.state !== 'spawn' && e.state !== 'rise' && e.state !== 'away' && (e.alpha == null || e.alpha > 0.5);
    });
    if (!cands.length) { this.cd = 30; return; }
    var e = cands[Math.floor(TC.rnd() * cands.length)];
    var fx = this.win ? this.win.x : camX - 4, fy = this.win ? this.win.y + 6 : 80;
    var dir = e.x < fx ? -1 : 1;
    e.hit(st, 8, dir, 3, 970000 + this.t, { dmg: 8, kb: 3, lift: -2, stop: 4, heavy: true });
    this.shot = { x0: fx, y0: fy, x1: e.x, y1: e.y - 16, t: 8 };
    TC.audio.sfx('shot');
    st.floatText(fx, fy - 14, TC.t('c7.bang'), '#ffe0a0');
    st.flashLight = { x: fx, y: fy, t: 7 };
    this.cd = this.interval + TC.rnd.int(0, 80);
  };
  Helmut.prototype.draw = function (c, cx, cy) {
    var w = this.win;
    if (!w) return;
    var H = art().CAST.helmut;
    var img = this.sil || (this.sil = TC.silhouette(H.aim[0], '#1a0e0c'));
    c.save();
    c.beginPath(); c.rect(Math.round(w.x - cx - 8), w.top, 16, w.bot - w.top); c.clip();
    c.drawImage(img, Math.round(w.x - cx - 14), Math.round(w.bot - 30), Math.round(img.width * 0.62), Math.round(img.height * 0.62));
    c.restore();
    // o cano da espingarda para fora da janela
    c.fillStyle = '#1a1a20';
    c.fillRect(Math.round(w.x - cx + 6), Math.round(w.bot - 18), 7, 1);
  };

  /* ================= A NAVE (o povo nos bancos, o porão, a roda do pau-de-fita) ================= */
  function Room(L, x0) {
    this.L = L; this.x0 = x0; this.t = 0; this.alive = true;
    this.mode = 'pews';
    this.people = [];
    var self = this;
    [20, 44, 70, 94, 162, 186, 212, 236].forEach(function (dx, i) {
      self.people.push({ x: x0 + dx, v: i % 8, baseY: 186, grabbed: null, taken: 0, yoff: 0, vy: 0 });
    });
    this.dancers = [1, 3, 7, 0, 5, 6, 2].map(function (v, k) { return { k: k, v: v, grabbed: null, x: x0 + 128, baseY: 184, yoff: 0, vy: 0, taken: 0 }; });
    this.danceAng = 0; this.danceOn = false; this.halted = false; this.rate = 1 / 420;
    this.flying = [];
    this.watchA = 0;
    this.lanterns = [x0 + 52, x0 + 128, x0 + 204];
    this.poleX = x0 + 128; this.poleY = 46;
  }
  Room.prototype.update = function (st) {
    this.t++;
    var self = this;
    if (this.mode === 'dance') this.watchA = Math.min(1, this.watchA + 0.02); else this.watchA = Math.max(0, this.watchA - 0.05);
    this.halted = this.dancers.some(function (d) { return d.grabbed; });
    if (this.danceOn && !this.halted) this.danceAng += this.rate;
    // posição dos dançarinos na roda
    var cx = this.poleX;
    this.dancers.forEach(function (d) {
      var a = self.danceAng * TC.TAU + d.k / 7 * TC.TAU;
      d.a = a;
      if (!d.grabbed) d.x = cx + Math.cos(a) * 80;
      d.z = Math.sin(a);
      d.baseY = 183 + Math.round(d.z * 5);
    });
    [this.people, this.dancers].forEach(function (list) {
      list.forEach(function (q) {
        if (q.taken > 0) { q.taken--; if (q.taken === 0) { q.yoff = -150; q.vy = 0; } }
        if (!q.grabbed && q.yoff < 0) { q.vy += 0.35; q.yoff = Math.min(0, q.yoff + q.vy); if (q.yoff === 0) { q.vy = 0; st.dust(q.x, q.baseY); } }
      });
    });
    this.flying = this.flying.filter(function (f) {
      f.t++;
      var b = f.boss, tx = b ? b.x : f.x, ty = b ? b.y - 50 : f.y;
      f.x += (tx - f.x) * 0.08; f.y += (ty - f.y) * 0.08 + Math.sin(f.t * 0.3) * 0.6;
      if (f.t % 2 === 0) st.parts.add({ x: f.x, y: f.y, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-0.3, 0.3), life: 30, color: art().FITAS[f.k], size: 1, fade: true, layer: 1 });
      if (Math.abs(f.x - tx) < 6 && Math.abs(f.y - ty) < 6) { if (f.done) f.done(); return false; }
      return f.t < 200;
    });
  };
  Room.prototype.figFor = function (v) { return art().folk[v]; };
  Room.prototype.draw = function (c, cx, cy) {
    var C7 = art(), t = this.t, self = this;
    if (this.x0 - cx > W + 20 || this.x0 + W - cx < -20) return;
    if (this.mode === 'pews') {
      // encosto dos bancos atrás e o povo sentado (de perfil, olhando para o altar)
      this.people.forEach(function (q, i) {
        var x = Math.round(q.x - cx), by = q.baseY - cy;
        c.fillStyle = '#2a1a10'; c.fillRect(x - 12, by - 22, 3, 20); c.fillStyle = '#4a2e1c'; c.fillRect(x - 12, by - 22, 24, 3);
        if (q.grabbed || q.taken > 0) return;
        C7.drawFig(c, self.figFor(q.v), q.yoff < 0 ? 'scared' : (i % 3 === 1 ? 'sitPray' : 'sit'), x, by + q.yoff, 1, t + i * 13, 0);
        c.drawImage(C7.pew, x + 3, by - 14);
      });
    } else if (this.mode === 'hold') {
      // lampiões balançando no porão
      this.lanterns.forEach(function (lx, i) {
        var a = Math.sin(t * 0.03 + i) * 0.35, len = 34;
        var px = lx - cx, py = 18 - cy, ex = px + Math.sin(a) * len, ey = py + Math.cos(a) * len;
        c.fillStyle = '#3a2a1a';
        for (var k = 0; k < len; k += 1) c.fillRect(Math.round(px + Math.sin(a) * k), Math.round(py + Math.cos(a) * k), 1, 1);
        c.fillStyle = '#2a2a30'; c.fillRect(Math.round(ex - 3), Math.round(ey), 7, 9);
        c.fillStyle = '#ffd070'; c.fillRect(Math.round(ex - 2), Math.round(ey + 2), 5, 5);
      });
    } else if (this.mode === 'dance') {
      c.globalAlpha = this.watchA;
      // o povo que não dança bate palmas lá atrás; a bandinha toca no canto
      var band = C7.bandReal[(t >> 4) % 2];
      c.drawImage(band, Math.round(this.x0 + 34 - cx - band.ox * 0.62), Math.round(176 - cy - band.oy * 0.62), Math.round(band.width * 0.62), Math.round(band.height * 0.62));
      var CAST = C7.CAST;
      var watchers = [[this.x0 + 182, CAST.frida, 'cuia'], [this.x0 + 200, C7.ewaldYoung, 'idle'], [this.x0 + 218, CAST.rosa, 'idle'], [this.x0 + 236, this.figFor(4), 'clap'], [this.x0 + 76, this.figFor(2), 'clap']];
      if (this.ewaldStep) watchers[1][0] = this.x0 + 200 - Math.min(30, this.ewaldStep);
      watchers.forEach(function (w, i) {
        var tint = ['#1a1830', 0.25];
        C7.drawFig(c, w[1], w[2], w[0] - cx, 176 - cy, -1, t + i * 7, 0, self.watchA, tint, 0.86);
      });
      c.globalAlpha = 1;
      // a coluna central com a argola das fitas
      var px = this.poleX - cx, py = this.poleY - cy;
      c.fillStyle = '#c8a040'; TC.fillEllipse(c, px, py, 13, 3);
      c.fillStyle = '#7a5a20'; TC.fillEllipse(c, px, py + 1, 11, 2);
      // dançarinos, do fundo para a frente, cada um com a sua fita
      var list = this.dancers.slice().sort(function (a, b) { return a.z - b.z; });
      list.forEach(function (d) {
        if (d.taken > 0) return;
        var fx = d.grabbed ? d.grabbed.hx : d.x, fy = d.grabbed ? d.grabbed.hy + 24 : d.baseY + d.yoff;
        var hand = { x: fx - cx + (d.z > 0 ? 4 : -4), y: fy - cy - 34 };
        c.fillStyle = C7.FITAS[d.k];
        var n = Math.max(8, Math.round(Math.max(Math.abs(hand.x - px), Math.abs(hand.y - py))));
        for (var s = 0; s <= n; s++) {
          var q = s / n;
          c.fillRect(Math.round(px + (hand.x - px) * q), Math.round(py + 3 + (hand.y - py - 3) * q + Math.sin(q * Math.PI) * 5), 1, 1);
        }
        var face = d.grabbed ? 1 : (Math.cos(d.a) < 0 ? 1 : -1);
        if (Math.sin(d.a) < 0) face = -face;
        C7.drawFig(c, self.figFor(d.v), d.grabbed ? 'scared' : 'dance', fx - cx, fy - cy, face, t, Math.floor(t * 0.9) + d.k * 5, 1, d.z < 0 ? ['#1a1830', 0.3] : null, d.z < 0 ? 0.86 : 1);
      });
    }
    // fitas voando da coluna para o Antigo
    this.flying.forEach(function (f) {
      c.fillStyle = C7.FITAS[f.k];
      for (var k = 0; k < 10; k++) c.fillRect(Math.round(f.x - cx - k * 1.4), Math.round(f.y - cy + Math.sin(f.t * 0.3 + k * 0.7) * 2), 2, 1);
    });
    // gente agarrada pela mão comprida (fora da roda/dos bancos)
    if (this.mode === 'pews') this.people.forEach(function (q) {
      if (!q.grabbed) return;
      var h = q.grabbed;
      C7.drawFig(c, self.figFor(q.v), 'scared', h.hx - cx, h.hy + 24 - cy, 1, t, 0);
    });
  };
  Room.prototype.light = function (L, cx, cy) {
    var x0 = this.x0 - cx, t = this.t;
    if (x0 > W + 60 || x0 + W < -60) return;
    if (this.mode === 'hold') {
      var self = this;
      this.lanterns.forEach(function (lx, i) {
        var a = Math.sin(t * 0.03 + i) * 0.35;
        L.add(lx - cx + Math.sin(a) * 34, 18 + Math.cos(a) * 34 + 5 - cy, 64, '#ffb860', 0.95);
      });
      return;
    }
    var f = 0.9 + Math.sin(t * 0.3) * 0.06;
    L.add(x0 + 230, 119 - cy, 40 * f, '#ffb060', 0.9); L.add(x0 + 251, 119 - cy, 40 * f, '#ffb060', 0.9);
    [49, 97, 177, 225].forEach(function (wx) { L.add(x0 + wx, 90 - cy, 34, '#6a7ad0', 0.45); });
    if (this.mode === 'dance') {
      L.add(this.poleX - cx, 70 - cy, 90, '#ffc070', 0.7 * this.watchA);
      L.add(x0 + 34, 160 - cy, 50, '#ffb060', 0.6 * this.watchA);
    } else L.add(x0 + 128, 170 - cy, 70, '#c09060', 0.4);
  };
  Room.prototype.startRibbon = function (k, boss, done) {
    this.flying.push({ k: k, x: this.poleX, y: this.poleY, t: 0, boss: boss, done: done });
  };

  /* ================= OMA HEDWIG (fantasma com o lampião) ================= */
  function Hedwig(x) { this.x = x; this.y = GY; this.t = 0; this.alive = true; this.alpha = 0; this.target = 1; this.face = 1; }
  Hedwig.prototype.update = function (st) {
    this.t++;
    this.alpha = TC.approach(this.alpha, this.target, 0.025);
    if (this.target <= 0 && this.alpha <= 0) { this.alive = false; return; }
    var p = st.player, a = st.arena || null;
    var tx = p.x - p.face * 30;
    if (a) tx = TC.clamp(tx, a.x0 + 16, a.x0 + W - 16);
    this.x = TC.approach(this.x, tx, 0.9);
    this.face = p.x < this.x ? -1 : 1;
    if (this.t % 5 === 0) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(4, 40), vy: -0.4, life: 40, color: '#ffe8c0', size: 1, fade: true, layer: 1 });
    // perto do lampião da benzedeira, o Arno se recupera devagar
    if (this.alpha > 0.8 && st.mode === 'play' && this.t % 100 === 0 && Math.abs(p.x - this.x) < 44 && p.hp > 0 && p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + 0.5);
      for (var i = 0; i < 6; i++) st.parts.add({ x: p.x + TC.rnd.range(-6, 6), y: p.y - TC.rnd.range(6, 28), vy: -0.5, life: 26, color: '#ffe0a0', size: 1, fade: true, layer: 1 });
    }
  };
  Hedwig.prototype.draw = function (c, cx, cy) {
    var C7 = art(), bob = Math.round(Math.sin(this.t * 0.06) * 2);
    C7.drawFig(c, C7.hedwigG, 'idle', this.x - cx, this.y - cy - 4 + bob, this.face, this.t, 0, this.alpha * 0.85);
  };
  Hedwig.prototype.light = function (L, cx, cy) {
    var f = 0.92 + Math.sin(this.t * 0.3) * 0.06;
    L.add(this.x + this.face * 6 - cx, this.y - 22 - cy, 76 * f, '#ffc070', 1.1 * this.alpha);
    L.add(this.x + this.face * 6 - cx, this.y - 22 - cy, 26, '#fff0c0', 0.8 * this.alpha);
  };

  /* ================= A CORDA DO SINO DO HOFFNUNG ================= */
  function Rope(x) { this.x = x; this.t = 0; this.alive = true; this.pullT = 0; this.active = false; this.pulls = 0; this.cd = 0; }
  Rope.prototype.update = function () { this.t++; if (this.pullT > 0) this.pullT--; if (this.cd > 0) this.cd--; };
  Rope.prototype.draw = function (c, cx, cy) {
    var x = this.x - cx;
    if (x < -20 || x > W + 20) return;
    var down = this.pullT > 0 ? Math.sin((1 - this.pullT / 24) * Math.PI) * 12 : 0;
    var sway = Math.sin(this.t * 0.03) * 1.5;
    var endY = 148 + down;
    c.fillStyle = '#a08050';
    for (var y = 0; y < endY; y++) c.fillRect(Math.round(x + sway * (y / endY)), y - cy, 1, 1);
    c.fillStyle = '#c8a870';
    for (y = 2; y < endY; y += 4) c.fillRect(Math.round(x + sway * (y / endY)), y - cy, 1, 2);
    // o pegador de lã listrada (vermelho e branco), como nas igrejas da colônia
    var gx = Math.round(x + sway), gy = Math.round(endY - cy);
    for (var k = 0; k < 18; k++) { c.fillStyle = (k >> 2) % 2 ? '#f0e8e0' : '#c02828'; c.fillRect(gx - 2, gy + k, 5, 1); }
    c.fillStyle = '#a08050'; c.fillRect(gx, gy + 18, 1, 8);
    if (this.active && (this.t >> 4) % 2 === 0) TC.font.draw(c, '▼', gx + 1, gy - 14, '#ffe090', { align: 'center', outline: '#000' });
  };
  Rope.prototype.light = function (L, cx, cy) { if (this.active) L.add(this.x - cx, 160 - cy, 30, '#ffe0a0', 0.6); };

  /* ================= HILDE (costura a passarela) ================= */
  function Hilde(x, y, g0, g1) { this.x = x; this.y = y; this.g0 = g0; this.g1 = g1; this.t = 0; this.alive = true; this.alpha = 0; this.pose = 'free'; this.sew = 0; this.vx = 0; this.vy = 0; }
  Hilde.prototype.update = function (st) {
    this.t++; this.x += this.vx; this.y += this.vy;
    if (this.t % 6 === 0 && this.alpha > 0.2) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(4, 44), vy: -0.3, life: 40, color: '#ffc0c0', size: 1, fade: true, layer: 1 });
  };
  Hilde.prototype.draw = function (c, cx, cy) {
    var C7 = art(), bob = Math.round(Math.sin(this.t * 0.05) * 3);
    if (this.sew > 0) {
      // a linha vermelha em zigue-zague formando a passarela
      var x0 = this.g0 - cx, x1 = this.g0 + (this.g1 - this.g0) * this.sew - cx;
      c.fillStyle = '#e02828';
      for (var x = x0; x < x1; x++) { var yy = GY - cy + ((Math.floor(x / 3) % 2) ? 1 : 5); c.fillRect(Math.round(x), yy, 1, 1); c.fillRect(Math.round(x), GY - cy + 3, 1, 1); }
      TC.Lighting.glow(c, x1, GY - cy + 3, 5, '#ffa0a0', 0.8);
    }
    C7.drawFig(c, C7.hilde, this.pose, this.x - cx, this.y - cy + bob, -1, this.t, this.t, this.alpha * 0.85);
  };
  Hilde.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - 30 - cy, 60, '#ffb0b0', 0.8 * this.alpha); };

  /* ================= VAGA-LUMES DA BOITATÁ ================= */
  function Flies(x, y, n) {
    this.list = [];
    for (var i = 0; i < n; i++) this.list.push({ x: x + TC.rnd.range(-40, 40), y: y + TC.rnd.range(-20, 20), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1, 1), ph: TC.rnd() * 6 });
    this.alive = true; this.t = 0; this.on = 0;
  }
  Flies.prototype.update = function (st) {
    this.t++;
    this.on = Math.min(1, this.on + 0.01);
    var p = st.player, t = this.t;
    this.list.forEach(function (f, i) {
      var tx = p.x + Math.cos(t * 0.02 + i * 0.9) * (30 + (i % 4) * 8), ty = p.y - 34 + Math.sin(t * 0.027 + i * 1.7) * 26;
      f.vx += (tx - f.x) * 0.004 + TC.rnd.range(-0.06, 0.06);
      f.vy += (ty - f.y) * 0.004 + TC.rnd.range(-0.06, 0.06);
      f.vx *= 0.95; f.vy *= 0.95;
      f.x += f.vx; f.y += f.vy;
    });
  };
  Flies.prototype.draw = function (c, cx, cy) {
    var t = this.t;
    this.list.forEach(function (f) {
      var b = 0.5 + 0.5 * Math.sin(t * 0.12 + f.ph);
      if (b < 0.25) return;
      c.fillStyle = b > 0.7 ? '#f0ffa0' : '#a8e050';
      var sz = b > 0.8 ? 2 : 1;
      c.fillRect(Math.round(f.x - cx), Math.round(f.y - cy), sz, sz);
    });
  };
  Flies.prototype.light = function (L, cx, cy) {
    var t = this.t, on = this.on;
    this.list.forEach(function (f) {
      var b = 0.5 + 0.5 * Math.sin(t * 0.12 + f.ph);
      L.add(f.x - cx, f.y - cy, 22, '#c8ff60', 0.6 * b * on);
    });
  };

  /* ================= A MÁQUINA DO RELÓGIO E OS POMBOS ================= */
  function Gears(list) { this.list = list; this.t = 0; this.alive = true; }
  Gears.prototype.update = function () { this.t++; };
  Gears.prototype.draw = function (c, cx, cy) {
    var t = this.t;
    this.list.forEach(function (g) {
      var x = g.x - cx;
      if (x < -60 || x > W + 60) return;
      TC.drawRot(c, g.img, x, g.y - cy, t * g.sp, 64);
    });
  };
  function Pigeons(list) { this.list = list.map(function (p) { return { x: p[0], y: p[1], st: 'perch', vx: 0, vy: 0, t: 0 }; }); this.alive = true; this.t = 0; }
  Pigeons.prototype.update = function (st) {
    this.t++;
    var p = st.player;
    this.list.forEach(function (q) {
      q.t++;
      if (q.st === 'perch' && Math.abs(p.x - q.x) < 70) { q.st = 'fly'; q.vx = (q.x < p.x ? -1 : 1) * TC.rnd.range(0.8, 1.4); q.vy = -1.4; TC.audio.sfx('whoosh'); }
      if (q.st === 'fly') { q.x += q.vx; q.y += q.vy; q.vy = Math.max(-2, q.vy - 0.01); if (q.y < -20) q.st = 'gone'; }
    });
  };
  Pigeons.prototype.draw = function (c, cx, cy) {
    var P = art().pigeons, t = this.t;
    this.list.forEach(function (q) {
      if (q.st === 'gone') return;
      var x = q.x - cx;
      if (x < -20 || x > W + 20) return;
      var img = q.st === 'perch' ? P.perch : P.fly[(t >> 2) % 2];
      if (q.vx > 0 || (q.st === 'perch' && (Math.floor(q.x / 37) % 2))) img = TC.flip(img);
      c.drawImage(img, Math.round(x - img.width / 2), Math.round(q.y - cy - img.height));
    });
  };

  TC.ENEMIES.c7cyclops = EchoCyclops;
  TC.ENEMIES.c7moco = EchoMoco;
  TC.ENEMIES.c7alte = Alte;
  TC.ENEMIES.c7hand = Hand;
  TC.c7ent = { SigX: SigX, Lasso: Lasso, Helmut: Helmut, Room: Room, Hedwig: Hedwig, Rope: Rope, Hilde: Hilde, Flies: Flies, Gears: Gears, Pigeons: Pigeons, CEIL: CEIL };
})();
