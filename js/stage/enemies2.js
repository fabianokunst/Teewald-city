'use strict';
/* Teewald City — capítulo 2: colonos possuídos, lobisomem, o Demônio Antigo; o revólver 38, as balas,
   as fitas bentas, sacos de batata e os cenários animados (roda d'água, serra circular, fogo do carijó) */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  var base = K.base, drawSprite = K.drawSprite, genericHit = K.genericHit, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W;
  function art() { return TC.ART.ch2Init(); }

  /* ================= COLONO POSSUÍDO =================
     Gente de Teewald levada pela cerração. Anda devagar e golpeia com a ferramenta da roça;
     derrotado, a sombra sai do corpo e a pessoa volta a si. */
  function Possesso(x, y, opt) {
    base(this, 'possesso', x, y);
    opt = opt || {};
    this.npc = opt.npc || null;
    this.kind = this.npc === 'kessler' ? 'kessler' : (opt.kind || (TC.rnd() < 0.5 ? 'colono' : 'colona'));
    this.w = 14; this.h = 34;
    this.hp = this.maxHp = hpFor(this.npc ? 9 : 5);
    this.name = this.npc ? 'en.kessler' : (this.kind === 'colona' ? 'en.colona' : 'en.colono');
    this.score = this.npc ? 800 : 250;
    this.state = 'spawn';
    this.alpha = 0;
    this.cool = 40;
    this.onGround = false;
    this.speed = 0.5 + TC.rnd() * 0.12;
    this.useArena = true;
    this.lieT = 0;
  }
  Possesso.prototype.attacking = function () { return this.state === 'windup' || this.state === 'swing'; };
  Possesso.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 36, w: 14, h: 36 }; };
  Possesso.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup' || this.state === 'spawn') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Possesso.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    if (atk.heavy || this.hp <= 0) {
      this.state = 'down'; this.t = 0;
      this.vx = dir * kb * 0.7; this.vy = atk.lift || -2.5;
      this.lieT = 0;
    } else {
      this.state = 'hurt'; this.t = 0;
      this.vx = dir * kb * 0.6;
    }
  };
  Possesso.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('die');
  };
  Possesso.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player;
    var dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play';
    var D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      // a sombra sai do corpo
      if (this.t > 24 && this.t < 70 && this.t % 2 === 0) {
        st.parts.add({ x: this.x + TC.rnd.range(-10, 10), y: this.y - TC.rnd.range(2, 10), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.6, -0.6), life: 40, colors: ['#3a2a50', '#2a1e3a', '#140e1e'], size: TC.rnd.int(2, 4), fade: true });
      }
      if (this.t === 46) {
        TC.audio.sfx('ghostDie');
        st.floatText(this.x, this.y - 30, TC.t(this.kind === 'colona' ? 'freed.f' : 'freed.m'), '#e0f0ff');
        if (this.npc && st.level.onFreed) { this.alive = false; st.level.onFreed(st, this); return; }
      }
      if (this.t > 70) {
        this.alpha -= 0.03;
        if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(0, 8), vy: -0.5, life: 30, color: '#e8f0ff', size: 1, fade: true, layer: 1 });
        if (this.alpha <= 0) this.alive = false;
      }
      return;
    }
    switch (this.state) {
      case 'spawn':
        this.alpha = Math.min(1, this.alpha + 0.025);
        this.face = dx < 0 ? -1 : 1;
        if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(0, 34), vy: -0.5, life: 30, colors: ['#8a8ab8', '#3a3a5a'], size: 2, fade: true });
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk':
        this.face = dx < 0 ? -1 : 1;
        if (Math.abs(dx) > 24) this.vx = TC.approach(this.vx, this.face * this.speed, 0.06);
        else this.vx = TC.approach(this.vx, 0, 0.1);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 36 && Math.abs(dy) < 20) {
          if (st.mayAttack(this)) { this.state = 'windup'; this.t = 0; TC.audio.sfx('growl'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'windup':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= frames(30, D.windup)) { this.state = 'swing'; this.t = 0; TC.audio.sfx('swing2'); this.vx = this.face * 1.3; }
        break;
      case 'swing':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 2 && this.t <= 8 && play) {
          var bx = this.face > 0 ? this.x + 2 : this.x - 34;
          if (TC.overlap({ x: bx, y: this.y - 40, w: 32, h: 34 }, p.hurtBox())) p.damage(st, 2, this.face, true);
        }
        if (this.t === 6) { TC.audio.sfx('land'); st.dust(this.x + this.face * 26, this.y); }
        if (this.t >= 16) { this.state = 'recover'; this.t = 0; }
        break;
      case 'recover':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= 30) { this.state = 'walk'; this.t = 0; this.cool = frames(50 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = 24; }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          this.lieT++;
          if (this.lieT > 50) { this.state = 'getup'; this.t = 0; }
        }
        break;
      case 'getup':
        if (this.t >= 20) { this.state = 'walk'; this.t = 0; this.cool = 30; }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'walk' || this.state === 'recover') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Possesso.prototype.draw = function (c, cx, cy) {
    var S = art()[this.kind], img;
    switch (this.state) {
      case 'walk': img = Math.abs(this.vx) > 0.08 ? S.walk[Math.floor(this.t / 9) % 6] : S.idle[Math.floor(this.t / 30) % 2]; break;
      case 'windup': img = S.windup[0]; break;
      case 'swing': img = this.t < 12 ? S.swing[0] : S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      case 'getup': img = S.kneel[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    var shake = this.state === 'windup' && this.t > 16 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Possesso.prototype.light = function (L, cx, cy) {
    if (this.dying || this.alpha < 0.3 || this.state === 'down') return;
    L.add(this.x + this.face * 3 - cx, this.y - 33 - cy, this.state === 'windup' ? 16 : 9, '#d0ff60', 0.6);
  };

  /* ================= LOBISOMEM =================
     O sétimo filho homem vira bicho em noite de sexta-feira. Este anda em volta, se agacha e dá o bote. */
  function Wolf(x, y, opt) {
    base(this, 'wolf', x, y);
    opt = opt || {};
    this.w = 22; this.h = 26;
    this.hp = this.maxHp = hpFor(7);
    this.name = 'en.wolf';
    this.score = 400;
    this.state = opt.howl ? 'howl' : 'enter';
    this.cool = frames(60 + TC.rnd.int(0, 40), TC.diff().cool);
    this.useArena = true;
    this.onGround = false;
    this.dist = 64 + TC.rnd.int(-6, 22);
    this.lieT = 0;
  }
  Wolf.prototype.attacking = function () { var s = this.state; return s === 'crouch' || s === 'leap' || s === 'slashPrep' || s === 'slash'; };
  Wolf.prototype.hurtBox = function () {
    if (this.state === 'howl') return { x: this.x - 9, y: this.y - 34, w: 18, h: 34 };
    return { x: this.x - 12, y: this.y - 26, w: 24, h: 26 };
  };
  Wolf.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Wolf.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    if (atk.heavy || this.hp <= 0 || this.state === 'leap') {
      this.state = 'down'; this.t = 0;
      this.vx = dir * kb * 0.8; this.vy = atk.lift || -2.6;
      this.lieT = 0;
    } else {
      this.state = 'hurt'; this.t = 0;
      this.vx = dir * kb * 0.7;
    }
  };
  Wolf.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('die');
  };
  Wolf.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player;
    var dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play';
    var D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      if (this.t > 30) {
        this.alpha -= 0.035;
        if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(0, 10), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.4), life: 40, colors: ['#4a3a2c', '#2a221c', '#140e0a'], size: TC.rnd.int(2, 4), fade: true });
        if (this.alpha <= 0) this.alive = false;
      }
      return;
    }
    switch (this.state) {
      case 'howl':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t === 10) TC.audio.sfx('howl');
        if (this.t >= 80) { this.state = 'enter'; this.t = 0; }
        break;
      case 'enter':
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, this.face * 2.0, 0.12);
        if (Math.abs(dx) < this.dist + 10 || this.t > 100) { this.state = 'prowl'; this.t = 0; }
        break;
      case 'prowl': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = p.x + side * this.dist;
        if (st.arena) tx = TC.clamp(tx, st.arena.x0 + 20, st.arena.x0 + W - 20);
        var gap = tx - this.x;
        var adx = Math.abs(dx);
        var want = Math.abs(gap) > 8 ? Math.sign(gap) * (adx < 30 ? 1.7 : 1.15) : 0;
        this.vx = TC.approach(this.vx, want, 0.1);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && adx < 120 && Math.abs(dy) < 30) {
          if (st.mayAttack(this)) {
            this.state = adx < 34 ? 'slashPrep' : 'crouch'; this.t = 0;
            TC.audio.sfx('growl');
          } else this.cool = TC.rnd.int(20, 45);
        }
        break;
      }
      case 'crouch':
        this.vx = TC.approach(this.vx, 0, 0.25);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(32, D.windup)) {
          this.state = 'leap'; this.t = 0;
          this.vx = this.face * TC.clamp(Math.abs(dx) / 24, 2.0, 3.4) * D.speed;
          this.vy = -4.2;
          TC.audio.sfx('swing2');
        }
        break;
      case 'leap':
        if (this.onGround && this.t > 4) { this.state = 'land'; this.t = 0; this.vx *= 0.5; st.dust(this.x, this.y); TC.audio.sfx('land'); }
        break;
      case 'land':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 40) { this.state = 'prowl'; this.t = 0; this.cool = frames(80 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'slashPrep':
        this.vx = TC.approach(this.vx, 0, 0.3);
        if (this.t >= frames(16, D.windup)) { this.state = 'slash'; this.t = 0; this.vx = this.face * 1.4; TC.audio.sfx('swing'); }
        break;
      case 'slash':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 2 && this.t <= 7 && play) {
          var bx = this.face > 0 ? this.x + 2 : this.x - 30;
          if (TC.overlap({ x: bx, y: this.y - 30, w: 28, h: 24 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (this.t >= 22) { this.state = 'prowl'; this.t = 0; this.cool = frames(70 + TC.rnd.int(0, 40), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 14) { this.state = 'prowl'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          this.lieT++;
          if (this.lieT > 45) { this.state = 'getup'; this.t = 0; }
        }
        break;
      case 'getup':
        if (this.t >= 16) { this.state = 'prowl'; this.t = 0; this.cool = 40; }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'leap') contact(this, st, 2, true);
    else if (this.state === 'prowl' || this.state === 'enter') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Wolf.prototype.draw = function (c, cx, cy) {
    var S = art().wolf, img;
    switch (this.state) {
      case 'howl': img = this.t > 8 && this.t < 70 ? S.howl[0] : S.idle[0]; break;
      case 'enter': case 'prowl': img = Math.abs(this.vx) > 0.3 ? S.run[Math.floor(this.t / 5) % 6] : S.idle[Math.floor(this.t / 24) % 2]; break;
      case 'crouch': case 'slashPrep': img = S.crouch[0]; break;
      case 'leap': img = S.leap[0]; break;
      case 'land': img = this.t < 12 ? S.slash[0] : S.idle[0]; break;
      case 'slash': img = S.slash[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      case 'getup': img = S.crouch[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    var shake = (this.state === 'crouch' && this.t > 14) ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Wolf.prototype.light = function (L, cx, cy) {
    if (this.dying || this.state === 'down') return;
    var hy = this.state === 'howl' ? 38 : 24;
    L.add(this.x + this.face * 12 - cx, this.y - hy - cy, this.state === 'crouch' ? 16 : 8, '#ff4020', 0.7);
  };

  /* ================= O DEMÔNIO ANTIGO =================
     der Alte, o Mão-Comprida. Anda de quatro, investe feito boi brabo (pule por cima!),
     salta onde o Arno estava (saia de baixo da sombra!) e se ergue para varrer com as garras. */
  function Demon(x, y, opt) {
    base(this, 'demon', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.w = 60; this.h = 36;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.1);
    this.name = 'boss2.name';
    this.isBoss = true;
    this.score = 8000;
    this.state = 'intro';
    this.stagger = 0;
    this.attacks = 0;
    this.vy = 0;
    this.bar = { name: '#f0e0d0', back: '#200c10', fill: '#d84030', hi: '#ffb0a0' };
  }
  Demon.prototype.attacking = function () {
    var s = this.state;
    return s === 'chargePrep' || s === 'charge' || s === 'leapPrep' || s === 'leap' || s === 'rear' || s === 'swipe' || s === 'summon';
  };
  Demon.prototype.L = function () { return this.arena.x0 + 36; };
  Demon.prototype.R = function () { return this.arena.x0 + W - 36; };
  Demon.prototype.tall = function () { var s = this.state; return s === 'rear' || s === 'swipe' || s === 'summon' || s === 'scream'; };
  Demon.prototype.hurtBox = function () {
    if (this.tall()) return { x: this.x - 16, y: this.y - 92, w: 34, h: 88 };
    if (this.state === 'charge') return { x: this.x - 32, y: this.y - 32, w: 64, h: 30 };
    if (this.state === 'leap') return { x: this.x - 30, y: this.y - 54, w: 60, h: 40 };
    if (this.state === 'dizzy' || this.state === 'stagger') return { x: this.x - 28, y: this.y - 44, w: 52, h: 42 };
    return { x: this.x - 34, y: this.y - 44, w: 68, h: 40 };
  };
  Demon.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'dying' || this.state === 'downed') return false;
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      this.stagger += d;
      var vuln = this.state === 'dizzy' || this.state === 'landed';
      if (this.stagger >= 12 && !vuln && this.state !== 'charge' && this.state !== 'leap') {
        this.stagger = 0; this.set('stagger'); this.vx = dir * 1.6; TC.audio.sfx('demon');
      }
    }
    return ok;
  };
  Demon.prototype.die = function (st) {
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.3);
    st.killAllMinions();
  };
  Demon.prototype.set = function (s) { this.state = s; this.t = 0; };
  Demon.prototype.phase2 = function () { return this.hp <= this.maxHp * 0.5; };
  /* o piloto automático de testes pula a investida, como um jogador faria */
  Demon.prototype.botJump = function (p) {
    if (this.state === 'charge') return p.onGround && (p.x - this.x) * this.face > 0 && Math.abs(p.x - this.x) < 74;
    if (this.state === 'leap' && this.vy > 0) return false;
    return false;
  };
  Demon.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t;
    var G = st.groundY;
    var D = TC.diff();
    var spd = (this.phase2() ? 1.2 : 1) * D.speed;
    var play = st.mode === 'play';
    var dx = p.x - this.x;
    this.gy = G;
    switch (this.state) {
      case 'intro':
        // cai do alto da araucária
        if (this.y < G) {
          this.vy = Math.min(9, this.vy + 0.35);
          this.y += this.vy;
          if (this.y >= G) { this.y = G; TC.fx.shake(5, 24); TC.audio.sfx('land'); TC.audio.sfx('hit2'); st.dust(this.x - 30, G); st.dust(this.x + 30, G); this.landedAt = t; }
        }
        this.face = dx < 0 ? -1 : 1;
        break;
      case 'stalk': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * 92, this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx, Math.abs(gap) > 10 ? Math.sign(gap) * 1.1 * spd : 0, 0.08);
        this.x += this.vx;
        if (t % 18 === 0 && Math.abs(this.vx) > 0.4) TC.audio.sfx('skitter');
        if (t > frames(this.phase2() ? 50 : 75, D.cool) && play && st.mayAttack(this)) {
          this.attacks++;
          var n = this.attacks;
          if (this.phase2() && n % 4 === 0 && this.minions(st) < 2) this.set('summon');
          else if (Math.abs(dx) < 74 && n % 3 !== 1) this.set('rear');
          else if (n % 2 === 1) this.set('chargePrep');
          else this.set('leapPrep');
        }
        break;
      }
      case 'chargePrep': {
        if (t === 1) { this.side = this.x < this.arena.x0 + W / 2 ? -1 : 1; TC.audio.sfx('demon'); }
        var ex = this.side < 0 ? this.L() - 6 : this.R() + 6;
        this.x += (ex - this.x) * 0.08;
        this.face = -this.side;
        if (t % 6 === 0) st.dust(this.x - this.face * 24, G);
        if (t > frames(44, D.windup)) { this.set('charge'); TC.audio.sfx('skitter'); }
        break;
      }
      case 'charge':
        this.face = -this.side;
        if (t > 6) this.x += this.face * 4.4 * spd;
        if (t % 4 === 0) { st.dust(this.x - this.face * 28, G); TC.audio.sfx('step'); }
        if ((this.face > 0 && this.x > this.R() + 8) || (this.face < 0 && this.x < this.L() - 8)) {
          this.set('dizzy');
          TC.fx.shake(4, 14); TC.audio.sfx('wood'); TC.audio.sfx('hit2');
          for (var k = 0; k < 10; k++) st.parts.add({ x: this.x + this.face * 30, y: G - TC.rnd.range(10, 60), vx: -this.face * TC.rnd.range(0.5, 2), vy: TC.rnd.range(-2, 0), ay: 0.12, life: 40, color: TC.rnd.pick(['#4a3428', '#2c1e18', '#6a5040']), size: 2, fade: true });
        }
        break;
      case 'dizzy':
        if (t % 20 === 0) for (var s = 0; s < 3; s++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 52, vx: Math.cos(t * 0.3 + s * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(this.phase2() ? 80 : 110, D.cool)) this.set('stalk');
        break;
      case 'leapPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('growl');
        this.tx = TC.clamp(p.x, this.L(), this.R());
        if (t > frames(36, D.windup)) {
          this.set('leap');
          this.vy = -6.4;
          var air = 2 * 6.4 / 0.3;
          this.vx = (this.tx - this.x) / air;
          TC.audio.sfx('demon');
        }
        break;
      case 'leap':
        this.x += this.vx;
        this.vy += 0.3;
        this.y += this.vy;
        if (this.y >= G && this.vy > 0) {
          this.y = G;
          this.set('landed');
          TC.fx.shake(4, 16); TC.audio.sfx('hit2'); TC.audio.sfx('land');
          st.dust(this.x - 36, G); st.dust(this.x + 36, G); st.dust(this.x - 20, G); st.dust(this.x + 20, G);
          // onda de choque no chão: só pega quem estiver perto e no chão
          if (play && p.onGround && Math.abs(p.x - this.x) < 46) p.damage(st, 1, p.x < this.x ? -1 : 1);
        }
        break;
      case 'landed':
        if (t > frames(this.phase2() ? 45 : 60, D.cool)) this.set('stalk');
        break;
      case 'rear':
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx || 0, 0, 0.2);
        if (t === 1) TC.audio.sfx('growl');
        if (t > frames(30, D.windup)) { this.set('swipe'); TC.audio.sfx('swing2'); }
        break;
      case 'swipe':
        if (t >= 6 && t <= 13 && play) {
          var bx = this.face > 0 ? this.x + 4 : this.x - 72;
          if (TC.overlap({ x: bx, y: this.y - 84, w: 68, h: 76 }, p.hurtBox())) p.damage(st, 2, this.face, true);
        }
        if (t === 8) { TC.fx.shake(2, 6); st.dust(this.x + this.face * 50, G); }
        if (t > 34) this.set('stalk');
        break;
      case 'summon':
        if (t === 1) { TC.audio.sfx('demon'); TC.fx.flash('#401020', 0.4, 0.03); }
        if (t === 30) {
          var nGhost = D.attackers <= 1 ? 1 : 2;
          for (var g = 0; g < nGhost; g++) st.spawnEnemy('ghost', TC.clamp(p.x + (g ? 70 : -70), this.L(), this.R()), G, { rise: true });
          if (D.attackers > 2) st.spawnEnemy('possesso', TC.clamp(p.x + 90, this.L(), this.R()), G, {});
        }
        if (t > 80) this.set('stalk');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        if (t > 50) this.set('stalk');
        break;
      case 'dying':
        TC.fx.shake(2, 4);
        this.x += (this.arena.x0 + 172 - this.x) * 0.03;   // cambaleia de volta para perto do toco
        if (t % 10 === 0) {
          TC.audio.sfx(t % 30 === 0 ? 'demon' : 'hit');
          for (var q = 0; q < 8; q++) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y - TC.rnd.range(10, 60), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2, -0.5), life: 30, colors: ['#ffffff', '#c8d8ff', '#6070c0'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
          this.flash = 3;
        }
        if (t === 130) {
          TC.fx.flash('#ffffff', 0.8, 0.03);
          TC.audio.sfx('crash');
          this.set('downed');
          this.dying = true;
          st.addScore(this.score);
          st.onBossDead(this);
        }
        break;
      case 'downed':
        break;
    }
    this.x = TC.clamp(this.x, this.arena.x0 + 10, this.arena.x0 + W - 10);
    if (this.state === 'charge') contact(this, st, 2, true);
    else if (this.state === 'leap' && this.vy > 0) contact(this, st, 2, true);
    else if (this.state === 'stalk') contact(this, st, 1, false, true);
  };
  Demon.prototype.minions = function (st) {
    var n = 0;
    st.enemies.forEach(function (e) { if (e.alive && !e.dying && !e.isBoss) n++; });
    return n;
  };
  Demon.prototype.frame = function () {
    var S = art().demon, t = this.t;
    switch (this.state) {
      case 'intro': return this.y < (this.gy || 192) ? S.leap[0] : (this.landedAt && t - this.landedAt < 30 ? S.land[0] : S.scream[0]);
      case 'stalk': return Math.abs(this.vx) > 0.2 ? S.crawl[Math.floor(t / 6) % 6] : S.idle[Math.floor(t / 24) % 2];
      case 'chargePrep': return S.crouch[0];
      case 'charge': return S.charge[Math.floor(t / 3) % 4];
      case 'dizzy': case 'stagger': return S.dizzy[Math.floor(t / 14) % 2];
      case 'leapPrep': return S.crouch[0];
      case 'leap': return S.leap[0];
      case 'landed': return t < 14 ? S.land[0] : S.idle[0];
      case 'rear': return S.rear[0];
      case 'swipe': return t < 8 ? S.swipe[0] : t < 22 ? S.swipe[1] : S.rear[0];
      case 'summon': case 'scream': return S.scream[0];
      case 'dying': return S.hurt[0];
      case 'downed': return S.dead[0];
    }
    return S.idle[0];
  };
  Demon.prototype.draw = function (c, cx, cy) {
    var st0 = this.gy || 192;
    // sombra-alvo do salto
    if ((this.state === 'leapPrep' || this.state === 'leap') && this.tx != null) {
      var k = this.state === 'leap' ? 1 : Math.min(1, this.t / 20);
      var rx = Math.round(30 * k), x0 = Math.round(this.tx - cx);
      c.fillStyle = 'rgba(160,20,30,' + (0.35 + 0.2 * Math.sin(this.t * 0.4)).toFixed(2) + ')';
      TC.fillEllipse(c, x0, Math.round(st0 - cy - 1), rx, Math.max(1, Math.round(4 * k)));
    }
    var img = this.frame();
    var shake = this.state === 'dying' ? TC.rnd.int(-2, 2) : (this.state === 'chargePrep' && this.t > 20 ? ((this.t >> 1) % 2 ? 1 : -1) : 0);
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
    if (this.ribbons) drawRibbonsOn(c, this, cx, cy);
  };
  function drawRibbonsOn(c, e, cx, cy) {
    var cols = TC.ART.ch2.RIBBON_COLS;
    for (var i = 0; i < e.ribbons; i++) {
      var bx = e.x - e.face * (14 - i * 6) - cx, by = e.y - 48 + (i % 2) * 4 - cy;
      c.fillStyle = cols[i % 7];
      for (var j = 0; j < 9; j++) c.fillRect(Math.round(bx - e.face * j * 1.2), Math.round(by + j + Math.sin(e.t * 0.2 + i + j * 0.5) * 1.5), 1, 2);
    }
  }
  Demon.prototype.eye = function () {
    var tall = this.tall();
    return { x: this.x + this.face * (tall ? 12 : 30), y: this.y - (tall ? 64 : this.state === 'charge' ? 32 : 40) };
  };
  Demon.prototype.light = function (L, cx, cy) {
    var e = this.eye();
    var hot = this.state === 'chargePrep' || this.state === 'leapPrep' || this.state === 'rear' || this.state === 'summon';
    L.add(e.x - cx, e.y - cy, hot ? 40 : 26, '#b0d8ff', hot ? 0.9 : 0.55);
    L.add(this.x - cx, this.y - 30 - cy, 60, '#8a7a9a', 0.35);
  };
  Demon.prototype.glow = function (c, cx, cy) {
    var e = this.eye();
    TC.Lighting.glow(c, e.x - cx, e.y - cy, 6, '#d0f0ff', 0.6);
  };

  /* demônio decorativo (aparições roteirizadas: a serraria, o final) */
  function DemonProp(x, y) {
    this.x = x; this.y = y; this.face = -1; this.t = 0; this.alive = true;
    this.pose = 'idle'; this.alpha = 1; this.ribbons = 0; this.vx = 0; this.vy = 0;
  }
  DemonProp.prototype.update = function () { this.t++; };
  DemonProp.prototype.draw = function (c, cx, cy) {
    var S = art().demon;
    var arr = S[this.pose] || S.idle;
    var img = arr[Math.floor(this.t / (this.pose === 'crawl' ? 6 : this.pose === 'charge' ? 3 : 24)) % arr.length];
    if (this.x - cx < -100 || this.x - cx > W + 100) return;
    drawSprite(c, img, this.x - cx, this.y - cy + 1, this.face, false, this.alpha);
    if (this.ribbons) drawRibbonsOn(c, this, cx, cy);
  };
  DemonProp.prototype.light = function (L, cx, cy) {
    L.add(this.x + this.face * 30 - cx, this.y - 40 - cy, 26, '#b0d8ff', 0.55 * this.alpha);
  };

  /* NPC de cena (o Seu Kessler depois de liberto) */
  function Npc(kind, x, y, face) {
    this.kind = kind; this.x = x; this.y = y; this.face = face || 1; this.t = 0; this.alive = true;
    this.pose = 'kneel'; this.alpha = 1; this.vx = 0;
  }
  Npc.prototype.update = function () {
    this.t++;
    this.x += this.vx;
  };
  Npc.prototype.draw = function (c, cx, cy) {
    var S = art()[this.kind];
    var img = this.pose === 'walk' ? S.walk[Math.floor(this.t / 9) % 6] : (S[this.pose] || S.stand)[0];
    drawSprite(c, img, this.x - cx, this.y - cy + 1, this.face, false, this.alpha);
  };

  /* ================= O REVÓLVER 38 ================= */
  var BULLET_ATK = { dmg: 3, kb: 2.8, lift: -1.8, stop: 5, heavy: true };
  var bulletSeq = 1;
  function Bullet(x, y, dir) {
    this.x = x; this.y = y; this.dir = dir;
    this.vx = dir * 9;
    this.t = 0; this.alive = true;
    this.id = 900000 + (bulletSeq++);
    this.x0 = x;
  }
  Bullet.prototype.update = function (st) {
    this.t++;
    for (var s = 0; s < 3 && this.alive; s++) {
      this.x += this.vx / 3;
      var box = { x: this.x - 3, y: this.y - 2, w: 6, h: 4 };
      var lists = [st.enemies, st.props];
      for (var li = 0; li < lists.length && this.alive; li++) {
        var arr = lists[li];
        for (var i = 0; i < arr.length; i++) {
          var e = arr[i];
          if (!e.alive || e.dying || !e.hurtBox) continue;
          if (!TC.overlap(box, e.hurtBox())) continue;
          if (e.hit(st, BULLET_ATK.dmg, this.dir, BULLET_ATK.kb, this.id, BULLET_ATK)) {
            st.spark(this.x, this.y, true);
            if (!e.isProp) {
              st.combo++; st.comboT = 80;
              st.addScore(10 * Math.min(st.combo, 10));
            }
            this.alive = false;
            break;
          }
        }
      }
      var tl = st.level.tile(Math.floor(this.x / 16), Math.floor(this.y / 16));
      if (this.alive && E.isSolid(tl)) { st.spark(this.x, this.y); this.alive = false; }
    }
    if (this.x < st.camX - 20 || this.x > st.camX + W + 20 || this.t > 40) this.alive = false;
  };
  Bullet.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var tail = Math.round(Math.max(Math.abs(this.x - this.x0), 2));
    var len = Math.min(14, tail);
    c.fillStyle = 'rgba(255,220,140,0.6)';
    c.fillRect(this.dir > 0 ? x - len : x, y, len, 1);
    c.fillStyle = '#fff8d0';
    c.fillRect(this.dir > 0 ? x - 3 : x, y, 3, 1);
  };
  Bullet.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 16, '#ffd080', 0.7); };

  var MAX_AMMO = 30;
  TC.ch2 = TC.ch2 || {};
  TC.ch2.MAX_AMMO = MAX_AMMO;
  TC.ch2.fireGun = function (st, p) {
    var g = st.gun;
    if (!g || g.ammo <= 0) {
      p.gunEmpty = true;
      TC.audio.sfx('click');
      if (!(st.t - (st._emptyT || -999) < 50)) { st._emptyT = st.t; st.floatText(p.x, p.y - 40, TC.t('gun.empty'), '#ff9070'); }
      return;
    }
    p.gunEmpty = false;
    g.ammo--;
    var fr = art().gun.aim;
    var mx = p.x + p.face * (fr.muzzleX - fr.ox), my = p.y - fr.oy + 1 + fr.muzzleY;
    st.deco.push(new Bullet(mx, my, p.face));
    TC.audio.sfx('shot');
    TC.fx.shake(2, 5);
    TC.input.haptic(30);
    p.vx -= p.face * (p.onGround ? 1.0 : 0.5);
    st.flashLight = { x: mx, y: my, t: 6 };
    for (var i = 0; i < 6; i++) st.parts.add({ x: mx, y: my, vx: p.face * TC.rnd.range(0.8, 2.6), vy: TC.rnd.range(-0.8, 0.8), life: 8, colors: ['#ffffff', '#ffe080', '#ff9030'], size: 2, fade: true, layer: 1, add: true });
    st.parts.add({ x: mx - p.face * 6, y: my, vx: -p.face * TC.rnd.range(0.6, 1.2), vy: -2.2, ay: 0.2, life: 34, color: '#e0b040', size: 1 });
    for (i = 0; i < 4; i++) st.parts.add({ x: mx, y: my, vx: p.face * TC.rnd.range(0.2, 0.6), vy: TC.rnd.range(-0.5, -0.1), life: 30, color: '#8a8a9a', size: 2, fade: true });
  };
  // itens: o 38 e a caixa de balas (o nome sai pela linha de cima do Item.collect)
  E.ITEM.balas = {
    heal: 0, score: 50,
    collect: function (st, it) {
      st.gun = st.gun || { ammo: 0 };
      var before = st.gun.ammo;
      st.gun.ammo = Math.min(MAX_AMMO, st.gun.ammo + 6);
      TC.audio.sfx('reload');
      st.floatText(it.x, it.y - 16, '+' + (st.gun.ammo - before) + ' ' + TC.t('gun.bullets'), '#ffe0a0');
    }
  };
  E.ITEM.revolver = {
    heal: 0, score: 200,
    collect: function (st, it) {
      st.gun = st.gun || { ammo: 0 };
      st.gun.ammo = Math.min(MAX_AMMO, st.gun.ammo + 6);
      TC.audio.sfx('reload');
      st.floatText(it.x, it.y - 16, '+6 ' + TC.t('gun.bullets'), '#ffe0a0');
      st.hint = { key: 'hint.gun', t: 420 };
    }
  };

  /* ================= FITA BENTA ================= */
  function Ribbon(idx, x, y) {
    this.idx = idx; this.x = x; this.y = y; this.y0 = y;
    this.t = 0; this.alive = true; this.pull = false;
  }
  Ribbon.prototype.update = function (st) {
    this.t++;
    var p = st.player;
    var tx = p.x, ty = p.y - 18;
    if (!this.pull && Math.abs(tx - this.x) < 40 && Math.abs(ty - this.y) < 96 && p.state !== 'dead') this.pull = true;
    if (this.pull) {
      this.x += (tx - this.x) * 0.16;
      this.y += (ty - this.y) * 0.16;
    } else this.y = this.y0 + Math.sin(this.t * 0.07) * 3;
    if (this.t % 6 === 0) st.parts.add({ x: this.x + TC.rnd.range(-4, 4), y: this.y + TC.rnd.range(-6, 6), vy: -0.3, life: 24, color: TC.ART.ch2.RIBBON_COLS[this.idx], size: 1, fade: true, layer: 1 });
    if (TC.overlap({ x: this.x - 5, y: this.y - 7, w: 10, h: 14 }, p.hurtBox()) && st.mode === 'play' && !st.arena) {
      this.alive = false;
      if (st.level.collectRibbon) st.level.collectRibbon(st, this);
    }
  };
  Ribbon.prototype.draw = function (c, cx, cy) {
    var fr = art().ribbons[this.idx][Math.floor(this.t / 10) % 2];
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (x < -20 || x > W + 20) return;
    c.drawImage(fr, x - (fr.width >> 1), y - (fr.height >> 1));
    if ((this.t % 50) < 4) { c.fillStyle = '#ffffff'; c.fillRect(x - 2, y - 5, 1, 1); }
  };
  Ribbon.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 22, TC.ART.ch2.RIBBON_COLS[this.idx], 0.8); };

  /* ================= SACO DE BATATA (quebrável) ================= */
  function Sack(x, y, drop) {
    E.Breakable.call(this, 'crate', x, y, drop);
    this.name = 'en.sack';
    this.w = 14;
  }
  Sack.prototype = Object.create(E.Breakable.prototype);
  Sack.prototype.hit = function (st, dmg, dir, kb, id) {
    var r = E.Breakable.prototype.hit.call(this, st, dmg, dir, kb, id);
    if (r && !this.alive) {
      var pot = art().potato;
      for (var i = 0; i < 6; i++) st.parts.add({ x: this.x, y: this.y - 8, vx: TC.rnd.range(-2, 2) + dir, vy: TC.rnd.range(-3.5, -1.5), ay: 0.22, life: 50, sprite: pot });
    }
    return r;
  };
  Sack.prototype.draw = function (c, cx, cy) {
    var img = art().sackImg;
    var sx = this.shake ? ((this.shake % 2) ? 1 : -1) : 0;
    c.drawImage(img, Math.round(this.x - 7 - cx + sx), Math.round(this.y - img.height - cy));
  };

  /* ================= CENÁRIO ANIMADO ================= */
  function Wheel(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; }
  Wheel.prototype.update = function (st) {
    this.t++;
    if (this.t % 3 === 0 && Math.abs(this.x - st.camX - 128) < 200) {
      st.parts.add({ x: this.x + TC.rnd.range(0, 8), y: this.y - 50, vx: TC.rnd.range(-0.2, 0.2), vy: 1.2, ay: 0.12, life: 34, color: TC.rnd.pick(['#8aa0c8', '#c0d0f0', '#5a6a9a']), size: 1 });
    }
  };
  Wheel.prototype.draw = function (c, cx) {
    var x = this.x - cx;
    if (x < -50 || x > W + 50) return;
    TC.drawRot(c, art().wheelImg, x, this.y, this.t * 0.02, 96);
  };

  function Saw(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; }
  Saw.prototype.update = function (st) {
    this.t++;
    if (this.t % 4 === 0 && Math.abs(this.x - st.camX - 128) < 180) st.parts.add({ x: this.x - 4, y: this.y - 6, vx: TC.rnd.range(-1.8, -0.6), vy: TC.rnd.range(-1.6, -0.4), ay: 0.1, life: 26, color: TC.rnd.pick(['#e8d098', '#c8a868']), size: 1 });
  };
  Saw.prototype.draw = function (c, cx) {
    var x = this.x - cx;
    if (x < -30 || x > W + 30) return;
    TC.drawRot(c, art().sawImg, x, this.y, this.t * 0.45, 24);
  };

  function Fire(x, y, r) { this.x = x; this.y = y; this.r = r || 50; this.t = 0; this.alive = true; }
  Fire.prototype.update = function (st) {
    this.t++;
    if (Math.abs(this.x - st.camX - 128) > 220) return;
    if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-16, 16), y: this.y, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-1.0, -0.4), life: TC.rnd.int(16, 30), colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    if (this.t % 7 === 0) st.parts.add({ x: this.x + TC.rnd.range(-10, 10), y: this.y - 6, vx: TC.rnd.range(-0.1, 0.25), vy: -0.4, life: 90, color: '#5a5a6a', size: 2, fade: true, wobble: 0.08 });
  };
  Fire.prototype.draw = function (c, cx) {
    var x = Math.round(this.x - cx);
    if (x < -40 || x > W + 40) return;
    for (var i = -3; i <= 3; i++) {
      var h = 3 + Math.round(Math.abs(Math.sin(this.t * 0.3 + i * 1.7)) * 4);
      c.fillStyle = '#ff9030';
      c.fillRect(x + i * 4, this.y - h, 2, h);
      c.fillStyle = '#ffe080';
      c.fillRect(x + i * 4, this.y - Math.max(1, h - 2), 1, Math.max(1, h - 2));
    }
  };
  Fire.prototype.light = function (L, cx) {
    var f = 0.85 + Math.sin(this.t * 0.33) * 0.1 + TC.hash2(this.t >> 2, 7, 3) * 0.1;
    L.add(this.x - cx, this.y - 8, this.r * f, '#ff9040', 1);
  };

  TC.ENEMIES.possesso = Possesso;
  TC.ENEMIES.wolf = Wolf;
  TC.ENEMIES.demon = Demon;
  TC.ent.Bullet = Bullet;
  TC.ent.Ribbon = Ribbon;
  TC.ent.Sack = Sack;
  TC.ent.Wheel = Wheel;
  TC.ent.Saw = Saw;
  TC.ent.Fire = Fire;
  TC.ent.DemonProp = DemonProp;
  TC.ent.Npc = Npc;
})();
