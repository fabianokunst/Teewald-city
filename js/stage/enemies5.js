'use strict';
/* Teewald City — capítulo 5: o boi sem olho, os cães do bugreiro, os ervateiros possuídos, o olho voador,
   o mini-chefe O Bugreiro (o fantasma de Jacob Becker, 1888) e o chefe em duas fases: a Boiguaçu (a cobra grande
   e cega, na caverna) e a Boitatá (a cobra de fogo, ao lado do caminhão, morro abaixo). Também: pinhas que caem,
   fogo no chão, a gralha-azul e o caminhão do Arno com o Ewald no volante. */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  var base = K.base, drawSprite = K.drawSprite, genericHit = K.genericHit, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W;
  var GY = 192;
  function art() { return TC.ART.ch5Init(); }
  function sgn(v) { return v < 0 ? -1 : 1; }

  /* ================= O BOI SEM OLHO =================
     O gado da Linha Becker que amanheceu sem os olhos. Anda às cegas e investe contra a luz da lamparina. */
  function Ox(x, y, opt) {
    art();
    base(this, 'c5ox', x, y);
    this.w = 32; this.h = 26;
    this.hp = this.maxHp = hpFor(7);
    this.name = 'en.c5ox';
    this.score = 400;
    this.state = 'wander';
    this.cool = frames(70 + TC.rnd.int(0, 50), TC.diff().cool);
    this.useArena = true;
    this.onGround = false;
    this.dirT = 0;
    this.lieT = 0;
    this.face = opt && opt.face ? opt.face : -1;
  }
  Ox.prototype.attacking = function () { return this.state === 'lower' || this.state === 'charge'; };
  Ox.prototype.hurtBox = function () { return { x: this.x - 18, y: this.y - 30, w: 36, h: 28 }; };
  Ox.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'calm') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Ox.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    if (this.state === 'charge') return;   // investindo, nem sente
    if (atk.heavy || this.state === 'dizzy') { this.state = 'hurt'; this.t = 0; this.vx = dir * kb * 0.5; }
  };
  Ox.prototype.die = function (st) {
    this.dying = true; this.state = 'calm'; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('c5moo');
  };
  Ox.prototype.botJump = function (p) {
    return this.state === 'charge' && p.onGround && (p.x - this.x) * this.face > 0 && Math.abs(p.x - this.x) < 70;
  };
  Ox.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.vx = TC.approach(this.vx, 0, 0.2);
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      // a maldição sai do corpo como fumaça escura, e o boi fica deitado, quieto
      if (this.t > 20 && this.t < 70 && this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-14, 14), y: this.y - TC.rnd.range(6, 20), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.4, -0.5), life: 40, colors: ['#4a2a3a', '#2a1a28', '#140c14'], size: TC.rnd.int(2, 4), fade: true });
      if (this.t === 50) st.floatText(this.x, this.y - 38, TC.t('c5.oxcalm'), '#e0f0ff');
      if (this.t > 160) { this.alpha -= 0.02; if (this.alpha <= 0) this.alive = false; }
      return;
    }
    var near = Math.abs(dx) < 160 && Math.abs(dy) < 60;
    switch (this.state) {
      case 'wander':
        if (near) this.face = dx < 0 ? -1 : 1;
        else if (--this.dirT <= 0) { this.dirT = TC.rnd.int(60, 140); this.face = TC.rnd() < 0.5 ? -1 : 1; }
        this.vx = TC.approach(this.vx, (near && Math.abs(dx) > 60 ? 0.45 : 0.2) * this.face, 0.05);
        if (this.cool > 0) this.cool--;
        if (play && near && this.cool <= 0 && Math.abs(dy) < 30) {
          if (st.mayAttack(this)) { this.state = 'lower'; this.t = 0; TC.audio.sfx('c5moo'); }
          else this.cool = TC.rnd.int(25, 50);
        }
        break;
      case 'lower':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t % 14 === 0) { st.dust(this.x + this.face * 14, this.y); TC.audio.sfx('step'); }
        if (this.t >= frames(52, D.windup)) { this.state = 'charge'; this.t = 0; this.x0 = this.x; TC.audio.sfx('growl'); }
        break;
      case 'charge':
        this.vx = this.face * 3.2 * D.speed;
        if (this.t % 5 === 0) { st.dust(this.x - this.face * 14, this.y); TC.audio.sfx('step'); }
        if (this.hitWall || Math.abs(this.x - this.x0) > 230 || this.t > 110) {
          this.state = 'dizzy'; this.t = 0; this.vx = -this.face * 1.2;
          if (this.hitWall) { TC.fx.shake(3, 10); TC.audio.sfx('wood'); }
        }
        break;
      case 'dizzy':
        this.vx = TC.approach(this.vx, 0, 0.1);
        if (this.t % 20 === 0) for (var s = 0; s < 3; s++) st.parts.add({ x: this.x + this.face * 16 + TC.rnd.range(-4, 4), y: this.y - 34, vx: Math.cos(this.t * 0.3 + s * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (this.t >= frames(80, D.cool)) { this.state = 'wander'; this.t = 0; this.cool = frames(70 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 18) { this.state = 'wander'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'charge') contact(this, st, 2, true);
    else if (this.state === 'wander') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Ox.prototype.draw = function (c, cx, cy) {
    var S = art().ox, img;
    switch (this.state) {
      case 'wander': img = Math.abs(this.vx) > 0.1 ? S.walk[Math.floor(this.t / 10) % 4] : S.idle[Math.floor(this.t / 40) % 2]; break;
      case 'lower': img = S.lower[(this.t >> 3) % 2]; break;
      case 'charge': img = S.charge[(this.t >> 2) % 2]; break;
      case 'dizzy': img = S.dizzy[(this.t >> 4) % 2]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'calm': img = this.t > 16 ? S.lie[0] : S.hurt[0]; break;
      default: img = S.stand[0];
    }
    var shake = this.state === 'lower' && this.t > 24 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Ox.prototype.light = function (L, cx, cy) {
    if (this.alpha < 0.3) return;
    L.add(this.x - cx, this.y - 16 - cy, 44, '#b09080', 0.32 * this.alpha);
    if (!this.dying) L.add(this.x + this.face * 18 - cx, this.y - 22 - cy, this.state === 'lower' ? 14 : 8, '#ff3020', 0.6);
  };

  /* ================= CÃO DO BUGREIRO =================
     Os cachorros de caça que os bugreiros levavam. Fantasmas: ligeiros, rodeiam e mordem. */
  function Dog(x, y, opt) {
    art();
    base(this, 'c5dog', x, y);
    this.w = 20; this.h = 20;
    this.hp = this.maxHp = hpFor(3);
    this.name = 'en.c5dog';
    this.score = 200;
    this.state = 'enter';
    this.alpha = 0;
    this.cool = frames(50 + TC.rnd.int(0, 40), TC.diff().cool);
    this.useArena = true;
    this.onGround = false;
    this.dist = 54 + TC.rnd.int(-6, 20);
    this.lieT = 0;
  }
  Dog.prototype.attacking = function () { var s = this.state; return s === 'crouch' || s === 'leap' || s === 'bitePrep' || s === 'bite'; };
  Dog.prototype.hurtBox = function () { return { x: this.x - 11, y: this.y - 24, w: 22, h: 24 }; };
  Dog.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup' || (this.state === 'enter' && this.alpha < 0.5)) return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Dog.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    if (atk.heavy || this.hp <= 0 || this.state === 'leap') { this.state = 'down'; this.t = 0; this.vx = dir * kb * 0.8; this.vy = atk.lift || -2.4; this.lieT = 0; }
    else { this.state = 'hurt'; this.t = 0; this.vx = dir * kb * 0.8; }
  };
  Dog.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('ghostDie');
  };
  Dog.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      this.alpha -= 0.03;
      if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-10, 10), y: this.y - TC.rnd.range(2, 16), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-1.4, -0.4), life: 34, colors: ['#ffffff', '#c0d0ff', '#6070c0'], size: TC.rnd.int(1, 2), fade: true, layer: 1 });
      if (this.alpha <= 0) this.alive = false;
      return;
    }
    switch (this.state) {
      case 'enter':
        this.alpha = Math.min(1, this.alpha + 0.04);
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, this.face * 2.2, 0.14);
        if (this.t === 4) TC.audio.sfx('c5bark');
        if (Math.abs(dx) < this.dist + 10 || this.t > 90) { this.state = 'prowl'; this.t = 0; this.alpha = 1; }
        break;
      case 'prowl': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = p.x + side * this.dist + Math.sin(this.t * 0.05) * 12;
        if (st.arena) tx = TC.clamp(tx, st.arena.x0 + 16, st.arena.x0 + W - 16);
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx, Math.abs(gap) > 6 ? sgn(gap) * 1.5 : 0, 0.12);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 110 && Math.abs(dy) < 30) {
          if (st.mayAttack(this)) { this.state = Math.abs(dx) < 30 ? 'bitePrep' : 'crouch'; this.t = 0; TC.audio.sfx('growl'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      }
      case 'crouch':
        this.vx = TC.approach(this.vx, 0, 0.3);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(24, D.windup)) {
          this.state = 'leap'; this.t = 0;
          this.vx = this.face * TC.clamp(Math.abs(dx) / 22, 1.8, 3.2) * D.speed;
          this.vy = -3.6;
          TC.audio.sfx('c5bark');
        }
        break;
      case 'leap':
        if (this.onGround && this.t > 4) { this.state = 'land'; this.t = 0; this.vx *= 0.4; st.dust(this.x, this.y); }
        break;
      case 'land':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 32) { this.state = 'prowl'; this.t = 0; this.cool = frames(60 + TC.rnd.int(0, 40), D.cool); }
        break;
      case 'bitePrep':
        this.vx = TC.approach(this.vx, 0, 0.3);
        if (this.t >= frames(14, D.windup)) { this.state = 'bite'; this.t = 0; this.vx = this.face * 1.6; TC.audio.sfx('c5bite'); }
        break;
      case 'bite':
        this.vx = TC.approach(this.vx, 0, 0.14);
        if (this.t >= 2 && this.t <= 7 && play) {
          var bx = this.face > 0 ? this.x + 2 : this.x - 24;
          if (TC.overlap({ x: bx, y: this.y - 22, w: 22, h: 18 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (this.t >= 20) { this.state = 'prowl'; this.t = 0; this.cool = frames(55 + TC.rnd.int(0, 40), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 14) { this.state = 'prowl'; this.t = 0; this.cool = Math.max(this.cool, 26); }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          if (++this.lieT > 40) { this.state = 'getup'; this.t = 0; }
        }
        break;
      case 'getup':
        if (this.t >= 14) { this.state = 'prowl'; this.t = 0; this.cool = 34; }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'leap') contact(this, st, 1, false);
    else if (this.state === 'prowl') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Dog.prototype.draw = function (c, cx, cy) {
    var S = art().dog, img;
    switch (this.state) {
      case 'enter': case 'prowl': img = Math.abs(this.vx) > 0.3 ? S.run[Math.floor(this.t / 4) % 4] : S.idle[Math.floor(this.t / 20) % 2]; break;
      case 'crouch': case 'bitePrep': img = S.crouch[0]; break;
      case 'leap': img = S.leap[0]; break;
      case 'bite': img = this.t < 10 ? S.bite[0] : S.idle[0]; break;
      case 'land': img = S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': case 'getup': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = S.lie[0];
    var shake = this.state === 'crouch' && this.t > 10 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha * (0.78 + Math.sin(this.t * 0.2) * 0.08));
  };
  Dog.prototype.light = function (L, cx, cy) {
    if (this.alpha < 0.2) return;
    L.add(this.x - cx, this.y - 12 - cy, 26, '#8098ff', 0.45 * this.alpha);
  };

  /* ================= ERVATEIRO POSSUÍDO =================
     Os peões da ervateira dos Becker, com o facão de podar erva. Derrotados, voltam a si e somem. */
  var Possesso = TC.ENEMIES.possesso;
  function Ervateiro(x, y, opt) {
    art();
    Possesso.call(this, x, y, { kind: 'c5erv' });
    this.type = 'c5erv';
    this.kind = 'c5erv';
    this.name = 'en.c5erv';
    this.hp = this.maxHp = hpFor(5);
    this.score = 260;
    this.speed = 0.52 + TC.rnd() * 0.12;
  }
  Ervateiro.prototype = Object.create(Possesso.prototype);

  /* ================= O OLHO VOADOR =================
     Um olho da Boitatá que se soltou. Ronda o Arno, carrega e solta um clarão em feixe. */
  function Eye(x, y, opt) {
    art();
    base(this, 'c5eye', x, y);
    this.hp = this.maxHp = hpFor(3);
    this.name = 'en.c5eye';
    this.score = 220;
    this.state = 'enter';
    this.cool = frames(70 + TC.rnd.int(0, 50), TC.diff().cool);
    this.phase = TC.rnd() * 6;
    this.blink = 0;
    this.side = x < (opt && opt.cx || x + 1) ? -1 : 1;
    this.lookX = 0; this.lookY = 0;
  }
  Eye.prototype.attacking = function () { return this.state === 'charge' || this.state === 'beam'; };
  Eye.prototype.hurtBox = function () { return { x: this.x - 10, y: this.y - 10, w: 20, h: 20 }; };
  Eye.prototype.hit = function (st, d, dir, kb, id, atk) { return genericHit(this, st, d, dir, kb, id, atk); };
  Eye.prototype.onHit = function (st, dmg, dir, kb) {
    TC.audio.sfx('hit');
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 1.1; this.vy = -kb * 0.3;
  };
  Eye.prototype.die = function (st, dir) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('flameDie');
    for (var i = 0; i < 18; i++) {
      var a = TC.rnd() * TC.TAU, s = TC.rnd.range(0.4, 2.4);
      st.parts.add({ x: this.x, y: this.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: TC.rnd.int(20, 40), colors: ['#ffffff', '#ffe080', '#e8a020', '#6a2010'], size: TC.rnd.int(1, 2), fade: true, layer: 1, add: true });
    }
    st.flashLight = { x: this.x, y: this.y, t: 10 };
  };
  Eye.prototype.beamDir = function () { return { x: Math.cos(this.ang), y: Math.sin(this.ang) }; };
  /* o feixe acerta o Arno? (amostra pontos ao longo do raio) */
  Eye.prototype.beamHits = function (box) {
    var d = this.beamDir();
    for (var s = 8; s < 220; s += 4) {
      var px = this.x + d.x * s, py = this.y + d.y * s;
      if (px > box.x - 2 && px < box.x + box.w + 2 && py > box.y - 2 && py < box.y + box.h + 2) return true;
    }
    return false;
  };
  Eye.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.dying) { this.alive = false; return; }
    var p = st.player, dx = p.x - this.x, dy = (p.y - 20) - this.y;
    var play = st.mode === 'play', D = TC.diff();
    this.face = dx < 0 ? -1 : 1;
    var lx = TC.clamp(dx / 40, -1, 1), ly = TC.clamp(dy / 40, -1, 1);
    this.lookX += (lx - this.lookX) * 0.2; this.lookY += (ly - this.lookY) * 0.2;
    if (this.blink > 0) this.blink--;
    else if (TC.rnd() < 0.006 && this.state !== 'charge' && this.state !== 'beam') this.blink = 10;
    switch (this.state) {
      case 'enter':
      case 'hover': {
        var tx = p.x + this.side * 66, ty = p.y - 24 + Math.sin(this.t * 0.06 + this.phase) * 7;
        tx = TC.clamp(tx, st.camX + 16, st.camX + W - 16);
        this.vx += (tx - this.x) * 0.004; this.vy += (ty - this.y) * 0.006;
        this.vx *= 0.92; this.vy *= 0.92;
        if (this.state === 'enter' && this.t > 50) { this.state = 'hover'; this.t = 0; }
        if (this.cool > 0) this.cool--;
        if (this.state === 'hover' && play && this.cool <= 0 && Math.abs(dx) < 150) {
          if (st.mayAttack(this)) { this.state = 'charge'; this.t = 0; TC.audio.sfx('c5charge'); this.ang = Math.atan2(dy, dx); }
          else this.cool = TC.rnd.int(25, 50);
        }
        break;
      }
      case 'charge': {
        this.vx *= 0.85; this.vy *= 0.85;
        var lock = frames(46, D.windup);
        if (this.t < lock) this.ang = Math.atan2((p.y - 18) - this.y, p.x - this.x);
        if (this.t >= lock + frames(18, D.windup)) { this.state = 'beam'; this.t = 0; TC.audio.sfx('c5beam'); }
        break;
      }
      case 'beam':
        if (this.t <= 10 && play && this.beamHits(p.hurtBox())) p.damage(st, 1, sgn(Math.cos(this.ang)));
        if (this.t % 2 === 0) { var d = this.beamDir(); var s = TC.rnd.range(10, 180); st.parts.add({ x: this.x + d.x * s, y: this.y + d.y * s, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-0.5, 0.2), life: 16, color: '#fff0c0', size: 1, fade: true, layer: 1, add: true }); }
        if (this.t >= 16) { this.state = 'recover'; this.t = 0; this.side = -this.side; }
        break;
      case 'recover':
        this.vx *= 0.9; this.vy *= 0.9;
        if (this.t >= 30) { this.state = 'hover'; this.t = 0; this.cool = frames(90 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx *= 0.88; this.vy *= 0.88;
        if (this.t >= 16) { this.state = 'hover'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.x += this.vx; this.y += this.vy;
    this.y = TC.clamp(this.y, 40, st.groundY - 14);
    if (st.arena) this.x = TC.clamp(this.x, st.camX + 8, st.camX + W - 8);
    if (this.state === 'hover' || this.state === 'enter') contact(this, st, 1, false, true);
  };
  Eye.prototype.draw = function (c, cx, cy) {
    var C5 = art();
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var ch = this.state === 'charge';
    var shake = ch && this.t > 30 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    var ball = this.blink > 3 && this.blink < 8 ? C5.eyeBall.shut : this.blink > 0 ? C5.eyeBall.half : C5.eyeBall.open;
    var img = this.flash > 0 ? TC.tintCached(ball, '#ffffff', 0.7) : ball;
    c.drawImage(img, x - (ball.width >> 1) + shake, y - (ball.height >> 1));
    if (ball === C5.eyeBall.open) {
      var ir = ch && this.t > frames(46, TC.diff().windup) ? C5.iris.bigGlow : C5.iris.big;
      var ix = ch ? Math.cos(this.ang) * 4 : this.lookX * 4, iy = ch ? Math.sin(this.ang) * 4 : this.lookY * 4;
      c.drawImage(ir, Math.round(x + ix - ir.width / 2) + shake, Math.round(y + iy - ir.height / 2));
    }
    // linha de mira (fina) e o feixe
    if (ch) {
      var d = this.beamDir(), locked = this.t >= frames(46, TC.diff().windup);
      c.fillStyle = locked ? ((this.t >> 1) % 2 ? '#fff0a0' : '#ff8040') : 'rgba(255,220,140,0.35)';
      for (var s = 14; s < 220; s += locked ? 3 : 6) c.fillRect(Math.round(x + d.x * s), Math.round(y + d.y * s), 1, 1);
    }
    if (this.state === 'beam' && this.t <= 12) {
      var d2 = this.beamDir();
      c.save(); c.globalCompositeOperation = 'lighter';
      for (var w = -2; w <= 2; w++) {
        c.fillStyle = Math.abs(w) === 2 ? 'rgba(255,160,60,0.5)' : Math.abs(w) === 1 ? 'rgba(255,230,150,0.8)' : '#ffffff';
        for (var s2 = 10; s2 < 220; s2 += 1) c.fillRect(Math.round(x + d2.x * s2 - d2.y * w), Math.round(y + d2.y * s2 + d2.x * w), 1, 1);
      }
      c.restore();
    }
  };
  Eye.prototype.light = function (L, cx, cy) {
    var ch = this.state === 'charge' ? 1 + Math.min(1, this.t / 40) : 1;
    L.add(this.x - cx, this.y - cy, 30 * ch, '#ffd080', 0.6 * ch);
    if (this.state === 'beam') { var d = this.beamDir(); for (var s = 30; s < 200; s += 40) L.add(this.x + d.x * s - cx, this.y + d.y * s - cy, 34, '#fff0c0', 0.8); }
  };
  Eye.prototype.glow = function (c, cx, cy) { TC.Lighting.glow(c, this.x - cx, this.y - cy, 8, '#ffe0a0', this.state === 'charge' ? 0.6 : 0.25); };

  /* ================= OLHO CUSPIDO (projétil da Boiguaçu) =================
     Lento e teleguiado. Cai com um soco ou com um tiro do 38. */
  function EyeOrb(x, y, opt) {
    art();
    base(this, 'c5orb', x, y);
    opt = opt || {};
    this.hp = this.maxHp = 1;
    this.name = 'en.c5orb';
    this.vx = opt.vx || 0; this.vy = opt.vy || -1;
    this.life = 420;
    this.fire = !!opt.fire;
  }
  EyeOrb.prototype.attacking = function () { return false; };
  EyeOrb.prototype.hurtBox = function () { return { x: this.x - 8, y: this.y - 8, w: 16, h: 16 }; };
  EyeOrb.prototype.hit = function (st, d, dir, kb, id) {
    if (!this.alive || this.dying || id === this.lastHit) return false;
    this.lastHit = id;
    this.die(st);
    return true;
  };
  EyeOrb.prototype.die = function (st) {
    this.dying = true; this.alive = false;
    TC.audio.sfx('hit');
    st.addScore(30);
    for (var i = 0; i < 10; i++) st.parts.add({ x: this.x, y: this.y, vx: TC.rnd.range(-1.6, 1.6), vy: TC.rnd.range(-1.6, 1.2), life: 22, colors: ['#ffffff', '#e8d070', '#8a6a20'], size: 1, fade: true, layer: 1, add: true });
  };
  EyeOrb.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    var p = st.player, D = TC.diff();
    var tx = p.x - this.x, ty = (p.y - 18) - this.y, d = Math.max(1, Math.sqrt(tx * tx + ty * ty));
    var spd = 0.75 * D.speed;
    this.vx += (tx / d * spd - this.vx) * 0.03;
    this.vy += (ty / d * spd - this.vy) * 0.03;
    this.x += this.vx; this.y += this.vy;
    if (this.t % 4 === 0) st.parts.add({ x: this.x + TC.rnd.range(-2, 2), y: this.y + TC.rnd.range(-2, 2), life: 14, color: this.fire ? '#ffa040' : '#c8d890', size: 1, fade: true });
    if (--this.life <= 0) { this.die(st); return; }
    if (st.mode === 'play' && TC.overlap(this.hurtBox(), p.hurtBox())) { if (p.damage(st, 1, sgn(this.vx))) this.die(st); }
  };
  EyeOrb.prototype.draw = function (c, cx, cy) {
    var C5 = art(), b = C5.eyeSmall.open;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    c.drawImage(b, x - (b.width >> 1), y - (b.height >> 1));
    var ir = C5.iris.small, p = 2;
    c.drawImage(ir, Math.round(x + TC.clamp(this.vx * 3, -p, p) - ir.width / 2), Math.round(y + TC.clamp(this.vy * 3, -p, p) - ir.height / 2));
  };
  EyeOrb.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 18, this.fire ? '#ffa040' : '#d0e090', 0.7); };
  EyeOrb.prototype.glow = function (c, cx, cy) { TC.Lighting.glow(c, this.x - cx, this.y - cy, 5, this.fire ? '#ffc060' : '#e0f0a0', 0.4); };

  /* ================= PINHA QUE CAI (perigo) =================
     A sombra cresce no chão; depois a pinha despenca. Às vezes se abre e solta pinhão. */
  function Pinha(x, delay, opt) {
    opt = opt || {};
    this.x = x; this.delay = delay || 60; this.t = 0; this.alive = true;
    this.y = -20; this.vy = 0; this.landed = false; this.drop = opt.drop == null ? 0.22 : opt.drop;
    this.top = opt.top == null ? -20 : opt.top;
  }
  Pinha.prototype.update = function (st) {
    this.t++;
    if (this.gy == null) this.gy = st.groundAt(this.x);
    var fallT = 22;
    if (!this.landed) {
      if (this.t < this.delay - fallT) this.y = this.top;
      else {
        var k = (this.t - (this.delay - fallT)) / fallT;
        this.y = this.top + (this.gy - this.top) * k * k;
      }
      if (this.t >= this.delay) {
        this.landed = true; this.t = 0; this.y = this.gy;
        TC.audio.sfx('c5cone');
        st.dust(this.x, this.gy);
        var p = st.player;
        if (st.mode === 'play' && Math.abs(p.x - this.x) < 11 && p.y > this.gy - 34 && p.y <= this.gy + 2) p.damage(st, 1, p.x < this.x ? -1 : 1);
        for (var i = 0; i < 6; i++) st.parts.add({ x: this.x, y: this.gy - 4, vx: TC.rnd.range(-1.6, 1.6), vy: TC.rnd.range(-2.6, -0.8), ay: 0.2, life: 30, color: TC.rnd.pick(['#5a6a2a', '#6a4a24', '#3a4a1c']), size: 1 });
        if (TC.rnd() < this.drop) st.items.push(new E.Item('pinhao', this.x, this.gy - 6, true));
      }
    } else if (this.t > 40) this.alive = false;
  };
  Pinha.prototype.draw = function (c, cx, cy) {
    var C5 = art();
    var x = Math.round(this.x - cx);
    if (x < -20 || x > W + 20) return;
    if (!this.landed) {
      var k = TC.clamp(this.t / this.delay, 0, 1);
      var sh = C5.pinhaShadow;
      c.globalAlpha = 0.3 + 0.6 * k;
      var sw = Math.round(sh.width * (0.4 + 0.6 * k));
      c.drawImage(sh, x - (sw >> 1), this.gy - 3 - cy, sw, sh.height);
      c.globalAlpha = 1;
      // aviso piscando quando está quase caindo
      if (k > 0.55 && (this.t >> 2) % 2) { c.fillStyle = '#ffd040'; c.fillRect(x - 1, this.gy - 12 - cy, 2, 5); c.fillRect(x - 1, this.gy - 6 - cy, 2, 1); }
    }
    if (this.landed || this.y > -14) {
      var img = C5.pinha;
      c.globalAlpha = this.landed ? Math.max(0, 1 - this.t / 40) : 1;
      c.drawImage(img, x - (img.width >> 1), Math.round(this.y - img.height - cy + 1));
      c.globalAlpha = 1;
    }
  };

  /* ================= FOGO NO CHÃO (tocha do bugreiro, rastro da Boitatá) ================= */
  function FirePatch(x, y, life, opt) {
    opt = opt || {};
    this.x = x; this.y = y; this.life = life || 90; this.max = this.life; this.t = 0; this.alive = true;
    this.hw = opt.hw || 14; this.col = opt.col || '#ff9040';
  }
  FirePatch.prototype.update = function (st) {
    this.t++;
    if (--this.life <= 0) { this.alive = false; return; }
    var p = st.player;
    if (st.mode === 'play' && this.t > 6 && Math.abs(p.x - this.x) < this.hw + 4 && p.y > this.y - 10 && p.y <= this.y + 2) p.damage(st, 1, p.x < this.x ? -1 : 1);
    if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-this.hw, this.hw), y: this.y - 2, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-1.2, -0.4), life: TC.rnd.int(14, 26), colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    if (this.t % 20 === 1) TC.audio.sfx('c5fire');
  };
  FirePatch.prototype.draw = function (c, cx) {
    var x = Math.round(this.x - cx);
    if (x < -40 || x > W + 40) return;
    var k = Math.min(1, this.life / 20, this.t / 8);
    for (var i = -this.hw; i <= this.hw; i += 3) {
      var h = Math.round((3 + Math.abs(Math.sin(this.t * 0.3 + i * 1.7)) * 6) * k);
      c.fillStyle = '#c03010'; c.fillRect(x + i, this.y - h, 3, h);
      c.fillStyle = '#ff9030'; c.fillRect(x + i, this.y - Math.max(1, h - 2), 2, Math.max(1, h - 2));
      c.fillStyle = '#ffe080'; c.fillRect(x + i, this.y - Math.max(1, h - 4), 1, Math.max(1, h - 4));
    }
  };
  FirePatch.prototype.light = function (L, cx) { L.add(this.x - cx, this.y - 8, 40 * Math.min(1, this.life / 30), this.col, 1); };

  /* tocha arremessada (vira fogo no chão) */
  function Torch(x, y, tx, opt) {
    this.x = x; this.y = y; this.t = 0; this.alive = true;
    var T = 46;
    this.vx = (tx - x) / T; this.vy = -4.2; this.g = (2 * ((GY - 2) - y - this.vy * T)) / (T * T);
    this.fireLife = opt && opt.life || 150;
  }
  Torch.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.vy += this.g; this.y += this.vy;
    if (this.t % 2 === 0) st.parts.add({ x: this.x, y: this.y, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-0.6, 0), life: 18, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    var gy = st.groundAt(this.x);
    if (this.vy > 0 && this.y >= gy - 2) {
      this.alive = false;
      TC.audio.sfx('c5torch');
      st.deco.push(new FirePatch(this.x, gy, frames(this.fireLife, TC.diff().cool > 1.5 ? 0.85 : 1), { hw: 16 }));
      var p = st.player;
      if (st.mode === 'play' && Math.abs(p.x - this.x) < 14 && p.y > gy - 30) p.damage(st, 1, p.x < this.x ? -1 : 1);
    }
  };
  Torch.prototype.draw = function (c, cx) {
    var x = Math.round(this.x - cx), y = Math.round(this.y);
    var a = this.t * 0.4;
    c.fillStyle = '#5a3a20';
    for (var i = -5; i <= 5; i++) c.fillRect(Math.round(x + Math.cos(a) * i), Math.round(y + Math.sin(a) * i), 1, 1);
    c.fillStyle = '#ffd060'; c.fillRect(Math.round(x + Math.cos(a) * 6) - 1, Math.round(y + Math.sin(a) * 6) - 1, 3, 3);
  };
  Torch.prototype.light = function (L, cx) { L.add(this.x - cx, this.y, 34, '#ff9040', 1); };

  /* ================= O BUGREIRO: JACOB BECKER (1888) =================
     Espingarda com linha de mira (saia de onde a mira aponta), tocha arremessada (fogo no chão),
     os cães que ele assobia e a "batida" (corre de baioneta: pule por cima). */
  function Jacob(x, y, opt) {
    art();
    base(this, 'c5jacob', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.w = 20; this.h = 58;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 0.75);
    this.name = 'boss5j.name';
    this.isBoss = true;
    this.score = 3000;
    this.state = 'intro';
    this.attacks = 0;
    this.stagger = 0;
    this.useArena = true;
    this.torch = true;
    this.alpha = 0;
    this.bar = { name: '#d8f0e8', back: '#0c1a18', fill: '#60a898', hi: '#b8f0e0' };
  }
  Jacob.prototype.attacking = function () { var s = this.state; return s === 'aim' || s === 'lock' || s === 'throwPrep' || s === 'rushPrep' || s === 'rush' || s === 'whistle'; };
  Jacob.prototype.L = function () { return this.arena.x0 + 24; };
  Jacob.prototype.R = function () { return this.arena.x0 + W - 24; };
  Jacob.prototype.hurtBox = function () { return { x: this.x - 10, y: this.y - 60, w: 20, h: 58 }; };
  Jacob.prototype.set = function (s) { this.state = s; this.t = 0; };
  Jacob.prototype.phase2 = function () { return this.hp <= this.maxHp * 0.5; };
  Jacob.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'dying' || this.state === 'gone') return false;
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      this.stagger += d;
      if (this.stagger >= 10 && this.state !== 'rush') { this.stagger = 0; this.set('stagger'); this.vx = dir * 1.8; }
    }
    return ok;
  };
  Jacob.prototype.die = function (st) {
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.4);
    st.killAllMinions();
    TC.audio.sfx('ghostDie');
  };
  Jacob.prototype.dogs = function (st) {
    var n = 0;
    st.enemies.forEach(function (e) { if (e.alive && !e.dying && e.type === 'c5dog') n++; });
    return n;
  };
  Jacob.prototype.botJump = function (p) {
    if (!p.onGround) return false;
    return this.state === 'rush' && (p.x - this.x) * this.face > 0 && Math.abs(p.x - this.x) < 60;
  };
  Jacob.prototype.muzzle = function () { return { x: this.x + this.face * 30, y: this.y - 36 }; };
  Jacob.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff();
    var play = st.mode === 'play';
    var dx = p.x - this.x;
    var spd = (this.phase2() ? 1.15 : 1) * D.speed;
    if (this.alpha < 1 && this.state !== 'dying' && this.state !== 'gone') this.alpha = Math.min(1, this.alpha + 0.02);
    if (!this.half && this.phase2() && this.state !== 'dying' && this.state !== 'gone' && st.level.onJacobHalf) { this.half = true; st.level.onJacobHalf(st, this); }
    switch (this.state) {
      case 'intro':
        this.face = dx < 0 ? -1 : 1;
        break;
      case 'stalk': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * 104, this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx || 0, Math.abs(gap) > 8 ? sgn(gap) * 0.9 * spd : 0, 0.08);
        this.x += this.vx;
        if (t > frames(this.phase2() ? 48 : 66, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks;
          var maxDogs = D.attackers <= 1 ? 1 : 2;
          if (n % 4 === 0 && this.dogs(st) === 0) this.set('whistle');
          else if (Math.abs(dx) < 70 && n % 2 === 0) this.set('rushPrep');
          else this.set(['aim', 'throwPrep', 'aim', 'rushPrep'][n % 4]);
          this.maxDogs = maxDogs;
        }
        break;
      }
      case 'aim':
        this.vx = 0;
        this.face = dx < 0 ? -1 : 1;
        this.tx = TC.clamp(p.x, this.arena.x0 + 8, this.arena.x0 + W - 8);
        if (t === 1) TC.audio.sfx('c5cock');
        if (t > frames(36, D.windup)) { this.set('lock'); TC.audio.sfx('c5cock'); }
        break;
      case 'lock':
        if (t > frames(28, D.windup)) {
          // disparo: a carga de chumbo acerta onde a mira travou
          TC.audio.sfx('c5rifle'); TC.fx.shake(3, 10);
          var m = this.muzzle();
          st.flashLight = { x: m.x, y: m.y, t: 10 };
          for (var i = 0; i < 16; i++) st.parts.add({ x: this.tx + TC.rnd.range(-20, 20), y: GY - TC.rnd.range(0, 30), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2, 0), life: 20, colors: ['#ffffff', '#ffe080', '#a08060'], size: 1, fade: true, layer: 1 });
          for (i = 0; i < 6; i++) st.parts.add({ x: m.x, y: m.y, vx: this.face * TC.rnd.range(0.8, 2.6), vy: TC.rnd.range(-0.8, 0.8), life: 10, colors: ['#ffffff', '#ffe080', '#ff9030'], size: 2, fade: true, layer: 1, add: true });
          st.dust(this.tx, GY);
          if (play && Math.abs(p.x - this.tx) < 22 && p.y > GY - 40) p.damage(st, 2, sgn(p.x - this.x), true);
          this.set('fire');
        }
        break;
      case 'fire':
        if (t > frames(40, D.cool)) this.set('stalk');
        break;
      case 'throwPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('c5fire');
        if (t > frames(30, D.windup)) {
          var tgt = TC.clamp(p.x + p.vx * 18, this.arena.x0 + 20, this.arena.x0 + W - 20);
          st.deco.push(new Torch(this.x - this.face * 6, this.y - 56, tgt, { life: 150 }));
          TC.audio.sfx('c5torch');
          this.torch = false; this.torchT = 0;
          this.set('throw');
        }
        break;
      case 'throw':
        if (t > frames(36, D.cool)) this.set('stalk');
        break;
      case 'whistle':
        if (t === 1) { TC.audio.sfx('c5bark'); st.floatText(this.x, this.y - 70, TC.t('c5.whistle'), '#d8f0e8'); }
        if (t === 24) {
          var nd = this.maxDogs || 1;
          for (var k = 0; k < nd; k++) {
            var e = st.spawnEnemy('c5dog', k ? this.arena.x0 - 12 : this.arena.x0 + W + 12, GY, {});
            e.boss = this;
          }
        }
        if (t > 50) this.set('stalk');
        break;
      case 'rushPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t % 10 === 1) st.dust(this.x - this.face * 8, GY);
        if (t > frames(30, D.windup)) { this.set('rush'); TC.audio.sfx('growl'); }
        break;
      case 'rush':
        this.x += this.face * 3.5 * spd;
        if (t % 5 === 0) { st.dust(this.x - this.face * 10, GY); TC.audio.sfx('step'); }
        if ((this.face > 0 && this.x >= this.R() + 4) || (this.face < 0 && this.x <= this.L() - 4) || t > 110) {
          this.set('winded'); TC.fx.shake(2, 8); TC.audio.sfx('wood');
        }
        break;
      case 'winded':
        if (t % 18 === 0) st.parts.add({ x: this.x + this.face * 4, y: this.y - 62, vx: 0, vy: -0.4, life: 24, color: '#d8f0e8', size: 1, layer: 1 });
        if (t > frames(this.phase2() ? 60 : 80, D.cool)) this.set('stalk');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        if (t > 44) this.set('stalk');
        break;
      case 'dying':
        this.vx = 0;
        if (t % 6 === 0) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(0, 56), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.3), life: 50, colors: ['#ffffff', '#b8d0d8', '#5a7080'], size: TC.rnd.int(1, 3), fade: true, layer: 1 });
        if (t === 80 && st.level.onJacobDown) { this.set('gone'); st.level.onJacobDown(st, this); }
        break;
      case 'gone':
        break;
    }
    if (!this.torch && this.state === 'stalk' && ++this.torchT > 120) this.torch = true;
    if (this.torch && this.t % 3 === 0 && (this.state === 'stalk' || this.state === 'intro' || this.state === 'throwPrep' || this.state === 'whistle' || this.state === 'fire' || this.state === 'winded')) {
      var tpx = this.x - this.face * (this.state === 'throwPrep' ? 4 : 11), tpy = this.y - (this.state === 'throwPrep' ? 70 : 58);
      st.parts.add({ x: tpx + TC.rnd.range(-1, 1), y: tpy, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-0.9, -0.3), life: 16, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    }
    this.x = TC.clamp(this.x, this.arena.x0 + 10, this.arena.x0 + W - 10);
    if (this.state === 'rush') contact(this, st, 2, true);
    else if (this.state === 'stalk') contact(this, st, 1, false, true);
  };
  Jacob.prototype.frame = function () {
    var S = art().jacob, t = this.t;
    switch (this.state) {
      case 'stalk': return Math.abs(this.vx) > 0.15 ? S.walk[Math.floor(t / 8) % 6] : S.idle[Math.floor(t / 30) % 2];
      case 'aim': case 'lock': return S.aim[0];
      case 'fire': return t < 10 ? S.shoot[0] : S.aim[0];
      case 'throwPrep': return S.throw[0];
      case 'throw': return t < 14 ? S.throw[1] : S.idle[0];
      case 'whistle': return S.idle[(t >> 3) % 2];
      case 'rushPrep': case 'rush': return S.rush[(t >> 3) % 2];
      case 'winded': case 'stagger': return S.hurt[0];
      case 'dying': case 'gone': return S.kneel[0];
    }
    return S.idle[Math.floor(t / 30) % 2];
  };
  Jacob.prototype.draw = function (c, cx, cy) {
    var img = this.frame();
    var shake = this.state === 'lock' ? ((this.t >> 1) % 2 ? 1 : -1) : this.state === 'rushPrep' && this.t > 16 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    var a = this.alpha * (0.82 + Math.sin(this.t * 0.15) * 0.06);
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, a);
    // a mira: linha pontilhada do cano até o chão onde a carga vai cair
    if (this.state === 'aim' || this.state === 'lock') {
      var m = this.muzzle(), lock = this.state === 'lock';
      var x0 = m.x - cx, y0 = m.y - cy, x1 = this.tx - cx, y1 = GY - 6 - cy;
      var n = Math.max(2, Math.round(Math.abs(x1 - x0) / 3));
      c.fillStyle = lock ? ((this.t >> 1) % 2 ? '#ff4030' : '#ffd0c0') : 'rgba(255,80,60,0.55)';
      for (var i = 0; i <= n; i++) { var k = i / n; c.fillRect(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), 1, 1); }
      if (lock) {
        c.fillStyle = 'rgba(255,60,40,0.35)'; TC.fillEllipse(c, Math.round(x1), GY - 1 - cy, 22, 3);
        c.fillStyle = '#ff4030'; c.fillRect(Math.round(x1) - 22, GY - 1 - cy, 3, 1); c.fillRect(Math.round(x1) + 20, GY - 1 - cy, 3, 1);
      }
    }
  };
  Jacob.prototype.light = function (L, cx, cy) {
    L.add(this.x - cx, this.y - 36 - cy, 64, '#a0c0c8', 0.68 * this.alpha);
    if (this.torch && this.state !== 'dying' && this.state !== 'gone' && this.state !== 'aim' && this.state !== 'lock' && this.state !== 'rush' && this.state !== 'rushPrep') {
      var f = 0.9 + Math.sin(this.t * 0.4) * 0.08;
      L.add(this.x - this.face * 12 - cx, this.y - 54 - cy, 56 * f, '#ff9040', 0.9 * this.alpha);
    }
  };
  Jacob.prototype.glow = function (c, cx, cy) {
    if (this.torch && (this.state === 'stalk' || this.state === 'intro' || this.state === 'throwPrep' || this.state === 'whistle' || this.state === 'fire' || this.state === 'winded')) {
      var tx = this.x - this.face * (this.state === 'throwPrep' ? 4 : 11), ty = this.y - (this.state === 'throwPrep' ? 70 : 58);
      TC.Lighting.glow(c, tx - cx, ty - cy, 6, '#ffb040', 0.7 * this.alpha);
    }
    // olhos frios
    TC.Lighting.glow(c, this.x + this.face * 3 - cx, this.y - 52 - cy, 3, '#b8f0e8', 0.5 * this.alpha);
  };

  /* ================= CORPO DE COBRA (corrente de gomos) ================= */
  function Chain(n, gap, x, y) {
    this.pts = [];
    for (var i = 0; i < n; i++) this.pts.push({ x: x + i * gap, y: y });
    this.gap = gap;
  }
  /* FABRIK: cabeça num ponto, rabo preso numa âncora (a toca) */
  Chain.prototype.solveAnchored = function (hx, hy, ax, ay, floor) {
    var P = this.pts, n = P.length, g = this.gap, i, k;
    for (var it = 0; it < 3; it++) {
      P[0].x = hx; P[0].y = hy;
      for (i = 1; i < n; i++) { k = g / Math.max(0.001, TC.dist(P[i - 1].x, P[i - 1].y, P[i].x, P[i].y)); P[i].x = P[i - 1].x + (P[i].x - P[i - 1].x) * k; P[i].y = P[i - 1].y + (P[i].y - P[i - 1].y) * k; }
      P[n - 1].x = ax; P[n - 1].y = ay;
      for (i = n - 2; i >= 0; i--) { k = g / Math.max(0.001, TC.dist(P[i + 1].x, P[i + 1].y, P[i].x, P[i].y)); P[i].x = P[i + 1].x + (P[i].x - P[i + 1].x) * k; P[i].y = P[i + 1].y + (P[i].y - P[i + 1].y) * k; }
    }
    P[0].x = hx; P[0].y = hy;
    if (floor != null) for (i = 1; i < n; i++) P[i].y = Math.min(P[i].y, floor - Math.max(4, 12 - i * 0.55));
  };
  /* corrente solta (a Boitatá voando): cada gomo segue o anterior; o vento da estrada empurra para trás */
  Chain.prototype.follow = function (hx, hy, wind, t) {
    var P = this.pts, n = P.length, g = this.gap;
    P[0].x = hx; P[0].y = hy;
    for (var i = 1; i < n; i++) {
      P[i].x -= wind;
      P[i].y += Math.sin(t * 0.1 + i * 0.7) * 0.6;
      var dx = P[i].x - P[i - 1].x, dy = P[i].y - P[i - 1].y, d = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
      P[i].x = P[i - 1].x + dx / d * g; P[i].y = P[i - 1].y + dy / d * g;
    }
  };

  /* desenha a cobra: gomos do rabo para a cabeça e a cabeça girada */
  function drawSnake(c, self, cx, cy, kind, eyesOpen, mix) {
    var S = art().snake, set = S[kind];
    var P = self.body.pts;
    for (var i = P.length - 1; i >= 1; i--) {
      var arr = eyesOpen ? set.segOpen : set.seg;
      var img = arr[Math.min(arr.length - 1, i)];
      var x = Math.round(P[i].x - cx - img.width / 2), y = Math.round(P[i].y - cy - img.height / 2);
      if (mix > 0 && kind === 'dark') {
        c.drawImage(img, x, y);
        c.globalAlpha = mix; c.drawImage((eyesOpen ? S.fire.segOpen : S.fire.seg)[Math.min(15, i)], x, y); c.globalAlpha = 1;
      } else c.drawImage(self.flash > 0 ? TC.tintCached(img, '#ffffff', 0.6) : img, x, y);
    }
    var h = self.mouth ? set.headOpen : set.head;
    var ang = self.ang || 0, left = Math.cos(ang) < 0;
    var src = left ? TC.flip(h) : h;
    var a2 = left ? ang - Math.PI : ang;
    if (self.flash > 0) src = TC.tintCached(src, '#ffffff', 0.6);
    var sc = self.swell || 1;
    var r = TC.rotCached(src, a2, 64);
    var w = Math.round(r.width * sc), hh = Math.round(r.height * sc);
    c.drawImage(r, Math.round(self.hx - cx - w / 2), Math.round(self.hy - cy - hh / 2), w, hh);
    if (mix > 0 && kind === 'dark') {
      var hf = self.mouth ? S.fire.headOpen : S.fire.head;
      var rf = TC.rotCached(left ? TC.flip(hf) : hf, a2, 64);
      c.globalAlpha = mix; c.drawImage(rf, Math.round(self.hx - cx - rf.width / 2), Math.round(self.hy - cy - rf.height / 2)); c.globalAlpha = 1;
    }
  }

  /* ================= A BOIGUAÇU (fase 1: na caverna) =================
     Cobra grande, escura e cega. Bote (crava a cabeça no chão: a hora de bater!), varrida (pule),
     olhos cuspidos (derrube a soco ou tiro) e os mil olhos (segure ↓). */
  function Boiguacu(x, y, opt) {
    art();
    base(this, 'c5boig', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.8);
    this.name = 'boss5a.name';
    this.isBoss = true;
    this.score = 0;
    this.state = 'intro';
    this.attacks = 0;
    this.ax = this.arena.x0 + W - 22; this.ay = GY - 40;     // a toca, na parede da direita
    this.hx = this.ax; this.hy = this.ay; this.ang = Math.PI;
    this.body = new Chain(15, 11, this.ax, this.ay);
    this.mouth = false;
    this.eyes = false;
    this.bar = { name: '#d8e8c0', back: '#0c140a', fill: '#5a8a3a', hi: '#b8e890' };
    this.x = this.hx; this.y = this.hy;
  }
  Boiguacu.prototype.attacking = function () { var s = this.state; return s === 'aim' || s === 'strike' || s === 'sweepPrep' || s === 'sweep' || s === 'spit' || s === 'glare'; };
  Boiguacu.prototype.set = function (s) { this.state = s; this.t = 0; };
  Boiguacu.prototype.L = function () { return this.arena.x0 + 20; };
  Boiguacu.prototype.R = function () { return this.arena.x0 + W - 36; };
  Boiguacu.prototype.vulnerable = function () { return this.state === 'stuck'; };
  Boiguacu.prototype.hurtBox = function () {
    if (this.state === 'stuck') return { x: this.hx - 22, y: this.hy - 22, w: 44, h: 30 };
    return { x: this.hx - 16, y: this.hy - 12, w: 32, h: 24 };
  };
  Boiguacu.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'transform' || this.state === 'gone') return false;
    if (id === this.lastHit) return false;
    if (!this.vulnerable()) {
      // fora do bote o couro é duro: quase não entra
      var ok = genericHit(this, st, d * 0.25, dir, kb, id, atk);
      if (ok) { TC.audio.sfx('hit'); if (!this.hardT || st.t - this.hardT > 60) { this.hardT = st.t; st.floatText(this.hx, this.hy - 24, TC.t('c5.hard'), '#c8d8b0'); } }
      return ok;
    }
    var ok2 = genericHit(this, st, d, dir, kb, id, atk);
    if (ok2) TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    return ok2;
  };
  Boiguacu.prototype.die = function (st) {
    // a fase 1 nunca morre: na metade ela vira a Boitatá
    this.hp = Math.max(1, this.hp);
  };
  Boiguacu.prototype.botJump = function (p) {
    if (!p.onGround) return false;
    if (this.state === 'sweep') return (p.x - this.hx) * this.sweepDir > -6 && Math.abs(p.x - this.hx) < 46;
    return false;
  };
  Boiguacu.prototype.moveHead = function (tx, ty, k) { this.hx += (tx - this.hx) * k; this.hy += (ty - this.hy) * k; };
  Boiguacu.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; if (!this.free) this.body.solveAnchored(this.hx, this.hy, this.ax, this.ay, GY); return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff();
    var play = st.mode === 'play';
    var phx = this.hx, phy = this.hy;
    var half = this.maxHp * 0.5;
    if (this.hp <= half && this.state !== 'transform' && this.state !== 'gone' && this.state !== 'intro') {
      this.hp = half;
      this.set('transform');
      this.mouth = false;
      if (st.level.onBoigHalf) st.level.onBoigHalf(st, this);
    }
    this.mouth = false;
    switch (this.state) {
      case 'intro':
        // sai da toca devagar
        this.moveHead(this.arena.x0 + 170, 110 + Math.sin(t * 0.05) * 6, 0.02);
        break;
      case 'hover': {
        var tx = TC.clamp(p.x + (p.x < this.arena.x0 + 128 ? 54 : -54), this.L() + 20, this.R());
        this.moveHead(tx, 112 + Math.sin(t * 0.045) * 14, 0.025);
        if (t > frames(this.attacks % 3 === 2 ? 50 : 66, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks;
          if (n % 5 === 0) this.set('glare');
          else if (n % 5 === 2) this.set('sweepPrep');
          else if (n % 5 === 4) this.set('spit');
          else this.set('aim');
        }
        break;
      }
      case 'aim': {
        // empina sobre a lamparina do Arno, de boca aberta
        this.mouth = true;
        var lock = frames(52, D.windup);
        if (t <= lock) this.tx = TC.clamp(p.x, this.L(), this.R() + 10);
        this.moveHead(this.tx, 64 + Math.sin(t * 0.3) * 2, 0.08);
        if (t === 1) TC.audio.sfx('c5hiss');
        if (t > lock + frames(14, D.windup)) { this.set('strike'); TC.audio.sfx('whoosh'); }
        break;
      }
      case 'strike':
        this.mouth = true;
        this.moveHead(this.tx, GY - 10, 0.34);
        if (Math.abs(this.hy - (GY - 10)) < 3) {
          this.hy = GY - 10;
          TC.audio.sfx('c5bite'); TC.audio.sfx('hit2'); TC.fx.shake(5, 16);
          st.dust(this.hx - 16, GY); st.dust(this.hx + 16, GY); st.dust(this.hx, GY);
          for (var q = 0; q < 10; q++) st.parts.add({ x: this.hx + TC.rnd.range(-18, 18), y: GY - 2, vx: TC.rnd.range(-1.6, 1.6), vy: TC.rnd.range(-3, -1), ay: 0.18, life: 34, color: TC.rnd.pick(['#8a5a38', '#6a3e26', '#b88a5a']), size: 2, fade: true });
          if (play && Math.abs(p.x - this.hx) < 22 && p.y > GY - 30) p.damage(st, 2, sgn(p.x - this.hx), true);
          this.set('stuck');
          if (!this.stuckHint) { this.stuckHint = true; st.hint = { key: 'hint.c5stuck', t: 240 }; }
        }
        break;
      case 'stuck':
        // a cabeça cravada no chão, tonta: agora!
        this.hy = GY - 10 + (t < 6 ? 2 : 0);
        if (t % 16 === 0) for (var s2 = 0; s2 < 3; s2++) st.parts.add({ x: this.hx + TC.rnd.range(-8, 8), y: this.hy - 22, vx: Math.cos(t * 0.3 + s2 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(84, D.windup)) { this.set('pull'); TC.audio.sfx('c5hiss'); }
        break;
      case 'pull':
        this.moveHead(this.hx, 112, 0.06);
        if (t > 40) this.set('hover');
        break;
      case 'sweepPrep':
        // o corpo raspa o chão de um canto: vai varrer a caverna
        if (t === 1) { this.sweepDir = this.hx > this.arena.x0 + 128 ? -1 : 1; TC.audio.sfx('c5hiss'); }
        this.moveHead(this.sweepDir > 0 ? this.L() - 4 : this.R() + 14, GY - 10, 0.08);
        if (t % 6 === 0) st.dust(this.hx, GY);
        if (t > frames(46, D.windup)) { this.set('sweep'); TC.audio.sfx('whoosh'); }
        break;
      case 'sweep':
        this.mouth = true;
        this.hx += this.sweepDir * 3.4 * D.speed; this.hy = GY - 10;
        if (t % 4 === 0) st.dust(this.hx - this.sweepDir * 10, GY);
        if (play && p.y > GY - 20 && Math.abs(p.x - this.hx) < 20) p.damage(st, 1, this.sweepDir, false);
        if ((this.sweepDir > 0 && this.hx > this.R() + 10) || (this.sweepDir < 0 && this.hx < this.L()) || t > 120) this.set('pull');
        break;
      case 'spit':
        this.moveHead(this.arena.x0 + 128 + Math.sin(t * 0.04) * 40, 96, 0.05);
        var every = frames(34, D.windup);
        if (t % every > every - 12) this.mouth = true;
        if (t % every === 0 && t <= every * 3) {
          var a = Math.atan2(p.y - 20 - this.hy, p.x - this.hx);
          st.spawnEnemy('c5orb', this.hx + Math.cos(a) * 14, this.hy + Math.sin(a) * 14, { vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2 });
          TC.audio.sfx('orb');
          if (!this.spitHint) { this.spitHint = true; st.hint = { key: 'hint.c5spit', t: 240 }; }
        }
        if (t > every * 3 + 30) this.set('hover');
        break;
      case 'glare':
        this.moveHead(this.arena.x0 + 128, 84, 0.05);
        this.eyes = true;
        if (t === 1 && st.level.glare) st.level.glare(st, frames(84, D.windup), this);
        if (t > 30 && (!st.glare || st.glare.phase === 'idle')) { this.eyes = false; this.set('hover'); }
        break;
      case 'transform':
        break;
      case 'gone':
        break;
    }
    this.mouth = this.mouth || this.state === 'stuck';
    // ângulo da cabeça: para onde se mexe (ou para o Arno)
    var vx = this.hx - phx, vy = this.hy - phy;
    var want;
    if (this.state === 'stuck') want = this.face > 0 ? 0.55 : Math.PI - 0.55;
    else if (Math.abs(vx) + Math.abs(vy) > 1.2) want = Math.atan2(vy, vx);
    else want = Math.atan2((p.y - 20) - this.hy, p.x - this.hx) * 0.4 + (p.x < this.hx ? Math.PI * 0.6 : 0) * 0;
    if (this.state !== 'stuck') this.face = p.x < this.hx ? -1 : 1;
    if (Math.abs(vx) + Math.abs(vy) <= 1.2 && this.state !== 'stuck') want = this.face > 0 ? 0.1 : Math.PI - 0.1;
    var da = Math.atan2(Math.sin(want - this.ang), Math.cos(want - this.ang));
    this.ang += da * 0.2;
    if (this.free) this.body.follow(this.hx, this.hy, 0, st.t);
    else this.body.solveAnchored(this.hx, this.hy, this.ax, this.ay, GY);
    this.x = this.hx; this.y = this.hy + 12;
    // contato do bote e o corpo grosso
    if (this.state === 'strike' && play && TC.overlap({ x: this.hx - 14, y: this.hy - 10, w: 28, h: 20 }, p.hurtBox())) p.damage(st, 2, sgn(p.x - this.hx), true);
  };
  Boiguacu.prototype.draw = function (c, cx, cy) {
    var shake = this.state === 'aim' && this.t > 30 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    var hx = this.hx; this.hx += shake;
    drawSnake(c, this, cx, cy, 'dark', this.eyes || this.state === 'transform' && this.mix > 0.2, this.mix || 0);
    this.hx = hx;
  };
  Boiguacu.prototype.light = function (L, cx, cy) {
    L.add(this.hx - cx, this.hy - cy, 64, '#7a8a6a', 0.45);
    var P = this.body.pts;
    for (var i = 2; i < P.length; i += 4) L.add(P[i].x - cx, P[i].y - cy, 34, '#5a6a4a', 0.3);
    if (this.eyes) for (i = 1; i < P.length; i += 2) L.add(P[i].x - cx, P[i].y - cy, 26, '#e8f090', 0.7);
    if (this.mix > 0) L.add(this.hx - cx, this.hy - cy, 90, '#ff9040', this.mix);
  };
  Boiguacu.prototype.glow = function (c, cx, cy) {
    if (this.eyes || this.mix > 0) {
      var P = this.body.pts;
      for (var i = 1; i < P.length; i++) TC.Lighting.glow(c, P[i].x - cx, P[i].y - cy, 6, this.mix > 0.5 ? '#ffb040' : '#e8f090', 0.35 + (this.mix || 0) * 0.3);
    }
  };

  /* ================= A BOITATÁ (fase 2: ao lado do caminhão) =================
     Mordida (a cabeça fica presa na beirada: soque!), rastro de fogo, pinhas, mil olhos e
     a LUZ ALTA do Ewald: gulosa, ela engole a luz, incha e fica tonta perto da carroceria. */
  function Boitata(x, y, opt) {
    art();
    base(this, 'c5boit', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.8);
    this.name = 'boss5b.name';
    this.isBoss = true;
    this.score = 12000;
    this.state = 'enter';
    this.attacks = 0;
    this.hx = this.arena.x0 - 60; this.hy = 60; this.ang = 0;
    this.body = new Chain(16, 10, this.hx, this.hy);
    for (var i = 0; i < 16; i++) this.body.pts[i].x = this.hx - i * 10;
    this.mouth = false; this.swell = 1; this.eyes = true;
    this.bar = { name: '#fff0c0', back: '#2a0c04', fill: '#ff8020', hi: '#ffe0a0' };
    this.x = this.hx; this.y = this.hy;
  }
  Boitata.prototype.attacking = function () { var s = this.state; return s === 'biteAim' || s === 'bite' || s === 'fireRun' || s === 'firePrep' || s === 'cones' || s === 'glare'; };
  Boitata.prototype.set = function (s) { this.state = s; this.t = 0; };
  Boitata.prototype.bedL = function () { return this.arena.x0 + 14; };
  Boitata.prototype.bedR = function () { return this.arena.x0 + 200; };
  Boitata.prototype.vulnerable = function () { return this.state === 'stuck' || this.state === 'dizzy'; };
  Boitata.prototype.hurtBox = function () {
    if (this.vulnerable()) return { x: this.hx - 22, y: this.hy - 20, w: 44, h: 32 };
    return { x: this.hx - 16, y: this.hy - 12, w: 32, h: 24 };
  };
  Boitata.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'enter' || this.state === 'dying' || this.state === 'downed' || this.state === 'intro') return false;
    if (id === this.lastHit) return false;
    var dmg = this.vulnerable() ? d : d * 0.25;
    var ok = genericHit(this, st, dmg, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      for (var i = 0; i < 5; i++) st.parts.add({ x: this.hx + TC.rnd.range(-8, 8), y: this.hy + TC.rnd.range(-8, 8), vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-2, 0), life: 20, colors: ['#ffffff', '#ffe080', '#ff9030'], size: 1, fade: true, layer: 1, add: true });
      if (!this.vulnerable() && (!this.hardT || st.t - this.hardT > 60)) { this.hardT = st.t; st.floatText(this.hx, this.hy - 24, TC.t('c5.hard2'), '#ffe0a0'); }
    }
    return ok;
  };
  Boitata.prototype.die = function (st) {
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.4);
    st.killAllMinions();
    st.deco.forEach(function (d) { if (d instanceof FirePatch || d instanceof Pinha) d.alive = false; });
  };
  Boitata.prototype.botJump = function (p) { return false; };
  Boitata.prototype.moveHead = function (tx, ty, k) { this.hx += (tx - this.hx) * k; this.hy += (ty - this.hy) * k; };
  Boitata.prototype.update = function (st) {
    var wind = 1.6;
    if (this.hitstop > 0) { this.hitstop--; this.body.follow(this.hx, this.hy, wind, st.t); return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff();
    var play = st.mode === 'play';
    var phx = this.hx, phy = this.hy;
    var spd = D.speed;
    this.mouth = false;
    this.swell += ((this.state === 'dizzy' ? 1.35 : 1) - this.swell) * 0.08;
    switch (this.state) {
      case 'enter':
        this.moveHead(this.arena.x0 + 150, 70, 0.025);
        break;
      case 'fly': {
        var cx0 = this.arena.x0 + 110;
        this.moveHead(cx0 + Math.sin(t * 0.021) * 80, 66 + Math.sin(t * 0.05) * 16, 0.04);
        var lvl = st.level;
        if (t > frames(56, D.cool) && play && st.mayAttack(this) && !(lvl.curveT > 0) && !(lvl.beam && lvl.beam.t > 0)) {
          var n = ++this.attacks;
          if (n % 6 === 0) this.set('glare');
          else if (n % 3 === 1) this.set('biteAim');
          else if (n % 3 === 2) this.set('firePrep');
          else this.set('cones');
        }
        break;
      }
      case 'biteAim': {
        var lock = frames(50, D.windup);
        if (t <= lock) this.tx = TC.clamp(p.x, this.bedL() + 10, this.bedR() - 10);
        this.moveHead(this.tx, 50 + Math.sin(t * 0.3) * 2, 0.07);
        this.mouth = t > lock * 0.5;
        if (t === 1) TC.audio.sfx('c5hiss');
        if (t > lock + frames(14, D.windup)) { this.set('bite'); TC.audio.sfx('whoosh'); }
        break;
      }
      case 'bite':
        this.mouth = true;
        this.moveHead(this.tx, GY - 12, 0.32);
        if (Math.abs(this.hy - (GY - 12)) < 3) {
          this.hy = GY - 12;
          TC.audio.sfx('c5bite'); TC.audio.sfx('wood'); TC.fx.shake(4, 12);
          for (var q = 0; q < 12; q++) st.parts.add({ x: this.hx + TC.rnd.range(-16, 16), y: GY - 2, vx: TC.rnd.range(-1.6, 1.6), vy: TC.rnd.range(-3, -1), ay: 0.18, life: 30, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
          if (play && Math.abs(p.x - this.hx) < 22 && p.y > GY - 32) p.damage(st, 2, sgn(p.x - this.hx), true);
          this.set('stuck');
          if (!this.stuckHint) { this.stuckHint = true; st.hint = { key: 'hint.c5bite', t: 240 }; }
        }
        break;
      case 'stuck':
        this.mouth = true;
        this.hy = GY - 12;
        if (t % 16 === 0) for (var s2 = 0; s2 < 3; s2++) st.parts.add({ x: this.hx + TC.rnd.range(-8, 8), y: this.hy - 24, vx: Math.cos(t * 0.3 + s2 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(80, D.windup)) { this.set('rise'); TC.audio.sfx('c5hiss'); }
        break;
      case 'rise':
        this.moveHead(this.hx, 70, 0.06);
        if (t > 36) this.set('fly');
        break;
      case 'firePrep':
        if (t === 1) { this.dir = this.hx < this.arena.x0 + 110 ? 1 : -1; TC.audio.sfx('c5fire'); }
        this.moveHead(this.dir > 0 ? this.arena.x0 + 4 : this.arena.x0 + 214, 54, 0.06);
        if (t > frames(36, D.windup)) { this.set('fireRun'); TC.audio.sfx('flame'); }
        break;
      case 'fireRun':
        this.mouth = true;
        this.hx += this.dir * 2.2 * spd; this.hy = 54 + Math.sin(t * 0.2) * 3;
        var gap = Math.round(frames(16, D.cool > 1.5 ? 1.25 : 1));
        if (t % gap === 0 && this.hx > this.bedL() && this.hx < this.bedR()) st.deco.push(new Fireball(this.hx, this.hy + 10, this.dir * 0.4));
        if ((this.dir > 0 && this.hx > this.arena.x0 + 224) || (this.dir < 0 && this.hx < this.arena.x0 - 4) || t > 160) this.set('fly');
        break;
      case 'cones': {
        this.moveHead(this.arena.x0 + 110 + Math.sin(t * 0.05) * 60, 26, 0.05);
        if (t === 10) {
          TC.audio.sfx('wood');
          var nc = D.attackers <= 1 ? 3 : D.attackers <= 2 ? 4 : 5;
          var xs = [];
          xs.push(TC.clamp(p.x, this.bedL() + 6, this.bedR() - 6));
          for (var k = 1; k < nc; k++) xs.push(TC.clamp(this.bedL() + 12 + ((k * 53 + (p.x | 0)) % 170), this.bedL() + 6, this.bedR() - 6));
          xs.forEach(function (cx1, k2) { st.deco.push(new Pinha(cx1, frames(56 + k2 * 10, TC.diff().windup), { drop: 0.15, top: -20 })); });
          if (!this.coneHint) { this.coneHint = true; st.hint = { key: 'hint.c5cones', t: 200 }; }
        }
        if (t > 110) this.set('fly');
        break;
      }
      case 'glare':
        this.moveHead(this.arena.x0 + 110, 50, 0.05);
        if (t === 1 && st.level.glare) st.level.glare(st, frames(84, D.windup), this);
        if (t > 30 && (!st.glare || st.glare.phase === 'idle')) this.set('fly');
        break;
      case 'gulp':
        // a luz alta do Ewald: vem engolir o farol, ao lado da cabine
        this.mouth = true;
        if (t < 40) this.moveHead(this.arena.x0 + 262, GY - 40, 0.09);
        else this.moveHead(this.arena.x0 + 190, GY - 26, 0.07);
        if (t === 40) { TC.audio.sfx('c5swell'); TC.fx.flash('#fff0c0', 0.45, 0.04); }
        if (t > 40) this.swell = Math.min(1.35, this.swell + 0.01);
        if (t > 70 && Math.abs(this.hx - (this.arena.x0 + 190)) < 8) this.set('dizzy');
        break;
      case 'dizzy':
        this.hx = this.arena.x0 + 192 + Math.sin(t * 0.08) * 3; this.hy = GY - 26 + Math.sin(t * 0.13) * 2;
        if (t % 16 === 0) for (var s3 = 0; s3 < 3; s3++) st.parts.add({ x: this.hx + TC.rnd.range(-8, 8), y: this.hy - 26, vx: Math.cos(t * 0.3 + s3 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(170, D.windup)) { this.set('rise'); }
        break;
      case 'dying':
        if (t % 6 === 0) { TC.audio.sfx(t % 24 === 0 ? 'explode' : 'flameDie'); this.flash = 2; }
        this.moveHead(this.arena.x0 + 128, 40 - t * 0.3, 0.03);
        if (t % 2 === 0) st.parts.add({ x: this.hx + TC.rnd.range(-20, 20), y: this.hy + TC.rnd.range(-10, 10), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.6, 0.4), life: 50, colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010'], size: TC.rnd.int(1, 2), fade: true, layer: 1, add: true });
        if (t === 120) { this.set('downed'); this.dying = true; st.addScore(this.score); st.onBossDead(this); }
        break;
      case 'downed':
        this.moveHead(this.arena.x0 + 128, -80, 0.02);
        break;
    }
    // ângulo da cabeça
    var vx = this.hx - phx, vy = this.hy - phy, want;
    if (this.state === 'stuck') want = this.face > 0 ? 0.6 : Math.PI - 0.6;
    else if (this.state === 'dizzy' || this.state === 'gulp') want = 0.15;
    else if (Math.abs(vx) + Math.abs(vy) > 1) want = Math.atan2(vy, vx);
    else want = p.x < this.hx ? Math.PI - 0.1 : 0.1;
    if (this.state !== 'stuck') this.face = Math.cos(want) < 0 ? -1 : 1;
    var da = Math.atan2(Math.sin(want - this.ang), Math.cos(want - this.ang));
    this.ang += da * 0.18;
    this.body.follow(this.hx, this.hy, wind, st.t);
    this.x = this.hx; this.y = this.hy + 12;
    if (st.t % 2 === 0) {
      var P = this.body.pts, j = 1 + ((st.t >> 1) % (P.length - 1));
      st.parts.add({ x: P[j].x + TC.rnd.range(-3, 3), y: P[j].y + TC.rnd.range(-3, 3), vx: -wind * 0.6, vy: TC.rnd.range(-0.6, 0.1), life: TC.rnd.int(14, 30), colors: ['#fff0a0', '#ffb040', '#e06010', '#802008'], size: TC.rnd.int(1, 2), fade: true, layer: 1, add: true });
    }
    if (this.state === 'bite' && play && TC.overlap({ x: this.hx - 14, y: this.hy - 10, w: 28, h: 20 }, p.hurtBox())) p.damage(st, 2, sgn(p.x - this.hx), true);
  };
  Boitata.prototype.draw = function (c, cx, cy) {
    var shake = (this.state === 'biteAim' && this.t > 30) ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    var hx = this.hx; this.hx += shake;
    drawSnake(c, this, cx, cy, 'fire', true, 0);
    this.hx = hx;
    // aviso no assoalho onde a mordida vai cair
    if (this.state === 'biteAim') {
      var k = Math.min(1, this.t / 30);
      c.fillStyle = 'rgba(255,140,40,' + (0.25 + 0.25 * Math.sin(this.t * 0.4)).toFixed(2) + ')';
      TC.fillEllipse(c, Math.round(this.tx - cx), GY - 1 - cy, Math.round(22 * k), 3);
    }
  };
  Boitata.prototype.light = function (L, cx, cy) {
    var P = this.body.pts;
    L.add(this.hx - cx, this.hy - cy, 70 * this.swell, '#ffb050', 1);
    for (var i = 2; i < P.length; i += 3) L.add(P[i].x - cx, P[i].y - cy, 40, '#ff9040', 0.7);
  };
  Boitata.prototype.glow = function (c, cx, cy) {
    var P = this.body.pts;
    for (var i = 1; i < P.length; i++) TC.Lighting.glow(c, P[i].x - cx, P[i].y - cy, 7 - i * 0.2, '#ffa030', 0.45);
    TC.Lighting.glow(c, this.hx - cx, this.hy - cy, 14 * this.swell, '#ffc060', 0.5);
  };

  /* bola de fogo que a Boitatá cospe sobre as tábuas */
  function Fireball(x, y, vx) { this.x = x; this.y = y; this.vx = vx; this.vy = 0.5; this.t = 0; this.alive = true; }
  Fireball.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.vy += 0.16; this.y += this.vy;
    if (this.t % 2 === 0) st.parts.add({ x: this.x, y: this.y, vx: TC.rnd.range(-0.3, 0.3), vy: -0.4, life: 14, colors: ['#ffe080', '#ff9030', '#c03010'], size: 1, fade: true, layer: 1, add: true });
    var p = st.player;
    if (st.mode === 'play' && TC.overlap({ x: this.x - 4, y: this.y - 4, w: 8, h: 8 }, p.hurtBox())) { p.damage(st, 1, sgn(this.vx)); this.alive = false; return; }
    if (this.y >= GY - 1) {
      this.alive = false;
      TC.audio.sfx('c5fire');
      st.deco.push(new FirePatch(this.x, GY, frames(66, 1), { hw: 10 }));
    }
  };
  Fireball.prototype.draw = function (c, cx) {
    var x = Math.round(this.x - cx), y = Math.round(this.y);
    c.fillStyle = '#c03010'; TC.fillCircle(c, x, y, 3);
    c.fillStyle = '#ffb040'; TC.fillCircle(c, x, y, 2);
    c.fillStyle = '#fff0a0'; c.fillRect(x, y - 1, 1, 1);
  };
  Fireball.prototype.light = function (L, cx) { L.add(this.x - cx, this.y, 26, '#ff9040', 0.9); };

  /* ================= A GRALHA-AZUL (cenário) =================
     A que planta as araucárias: enterra o pinhão e esquece onde. Voa quando o Arno chega perto. */
  function Gralha(x, y, face) { this.x = x; this.y = y; this.face = face || 1; this.t = TC.rnd.int(0, 60); this.alive = true; this.fly = false; this.vx = 0; this.vy = 0; }
  Gralha.prototype.update = function (st) {
    this.t++;
    if (!this.fly && Math.abs(st.player.x - this.x) < 56 && Math.abs(st.player.y - this.y) < 120) {
      this.fly = true; this.vx = (st.player.x < this.x ? 1 : -1) * 1.6; this.vy = -1.4; this.face = this.vx > 0 ? 1 : -1;
      TC.audio.sfx('c5gralha');
    }
    if (this.fly) { this.x += this.vx; this.y += this.vy; this.vy = Math.max(-2.2, this.vy - 0.02); if (this.y < -30) this.alive = false; }
  };
  Gralha.prototype.draw = function (c, cx, cy) {
    var G = art().gralha, img;
    if (this.fly) img = G.fly[(this.t >> 2) % 2];
    else img = (this.t % 90) < 8 ? G.hop : G.perch;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (x < -20 || x > W + 20) return;
    c.drawImage(this.face < 0 ? TC.flip(img) : img, x - (img.width >> 1), y - img.height);
  };

  /* ================= O CAMINHÃO DO ARNO (fase 2) =================
     Carroceria, cabine com o Ewald no volante, rodas girando, fumaça do escapamento e os faróis. */
  function Truck(x, groundY) {
    this.x = x; this.gy = groundY; this.t = 0; this.alive = true;
    this.beam = 0;       // farol alto (0..1)
    this.lean = 0;       // a carroceria inclinando na curva
    this.shout = null;
  }
  Truck.prototype.update = function (st) {
    this.t++;
    var C5 = art(), tr = C5.truckImg;
    if (this.t % 5 === 0) st.parts.add({ x: this.x + 2, y: this.gy + 22, vx: -TC.rnd.range(1.6, 2.6), vy: TC.rnd.range(-0.4, 0.1), life: 40, color: TC.rnd.pick(['#5a5a6a', '#4a4a58', '#6a6a7a']), size: 2, fade: true, wobble: 0.05 });
  };
  Truck.prototype.draw = function (c, cx, cy) {
    var C5 = art(), tr = C5.truckImg;
    var bump = (this.t >> 3) % 7 === 0 ? 1 : 0;
    var x = Math.round(this.x - cx), y = Math.round(this.gy - tr.bedTop - cy) + bump;
    c.drawImage(tr, x, y);
    // o Ewald no volante
    var ew = C5.ewaldDriving(this.shout ? 1 : 0);
    c.drawImage(ew, x + tr.winX + 2, y + tr.winY - 2 + (this.t >> 4) % 2);
    // rodas
    var ang = this.t * 0.35;
    tr.wheels.forEach(function (w) { TC.drawRot(c, C5.wheelImg, x + w[0], y + w[1], ang, 16); });
  };
  Truck.prototype.light = function (L, cx, cy) {
    var C5 = art(), tr = C5.truckImg;
    var x = this.x - cx, y = this.gy - tr.bedTop - cy;
    L.add(x + tr.lampX, y + tr.lampY, 24, '#fff0c0', 0.9);
    L.add(x + 238, y + 20, 26, '#ffc070', 0.5);    // a luz do painel
    if (this.beam > 0) for (var k = 1; k < 5; k++) L.add(x + tr.lampX + k * 22, y + tr.lampY + k * 2, 26 + k * 10, '#fff6d0', this.beam);
  };

  TC.ENEMIES.c5ox = Ox;
  TC.ENEMIES.c5dog = Dog;
  TC.ENEMIES.c5erv = Ervateiro;
  TC.ENEMIES.c5eye = Eye;
  TC.ENEMIES.c5orb = EyeOrb;
  TC.ENEMIES.c5jacob = Jacob;
  TC.ENEMIES.c5boig = Boiguacu;
  TC.ENEMIES.c5boit = Boitata;
  E.c5Pinha = Pinha;
  E.c5FirePatch = FirePatch;
  E.c5Gralha = Gralha;
  E.c5Truck = Truck;
  E.c5drawSnake = drawSnake;
  E.c5Chain = Chain;
  E.ITEM.pinhao = { heal: 2, score: 60 };
})();
