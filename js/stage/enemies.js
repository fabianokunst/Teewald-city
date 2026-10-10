'use strict';
/* Teewald City — criaturas: assombrações, cabeças-de-fogo, vultos, corvos e o Ciclope Gigante */
(function () {
  var E = TC.ent;
  var A = TC.ART;

  function base(self, type, x, y) {
    self.type = type;
    self.x = x; self.y = y;
    self.vx = 0; self.vy = 0;
    self.face = -1;
    self.t = 0;
    self.alive = true;
    self.lastHit = -1;
    self.hitstop = 0;
    self.flash = 0;
    self.inv = 0;
    self.dying = false;
    self.alpha = 1;
  }
  function drawSprite(c, img, x, y, face, flash, alpha) {
    if (!img) return;
    var f = face < 0 ? TC.flip(img) : img;
    var ox = img.ox != null ? (face < 0 ? img.width - img.ox : img.ox) : img.width / 2;
    var oy = img.oy != null ? img.oy : img.height;
    if (alpha != null && alpha < 1) c.globalAlpha = Math.max(0, alpha);
    c.drawImage(flash ? TC.tintCached(f, '#ffffff', 0.75) : f, Math.round(x - ox), Math.round(y - oy));
    c.globalAlpha = 1;
  }
  function genericHit(self, st, dmg, dir, kb, id, atk) {
    if (!self.alive || self.dying || id === self.lastHit || self.inv > 0) return false;
    self.lastHit = id;
    self.hp -= dmg;
    self.flash = 6;
    self.hitstop = atk.stop || 3;
    st.showEnemyBar(self);
    if (self.onHit) self.onHit(st, dmg, dir, kb, atk);
    if (self.hp <= 0) { self.hp = 0; self.die(st, dir); }
    return true;
  }
  // passive: só encostar (sem estar atacando) — no fácil e no normal isso não machuca
  function contact(self, st, dmg, heavy, passive) {
    var p = st.player;
    if (!p.alive || st.mode !== 'play') return;
    if (passive && !TC.diff().touch) return;
    if (TC.overlap(self.hurtBox(), p.hurtBox())) p.damage(st, dmg, p.x < self.x ? -1 : 1, heavy);
  }
  function hpFor(n) { return Math.max(1, Math.round(n * TC.diff().enemyHp)); }
  function frames(n, k) { return Math.round(n * k); }

  /* ================= ASSOMBRAÇÃO ================= */
  function Ghost(x, y, opt) {
    base(this, 'ghost', x, y);
    opt = opt || {};
    this.w = 14; this.h = 18;
    this.hp = this.maxHp = hpFor(3);
    this.name = 'en.ghost';
    this.score = 100;
    this.state = opt.rise ? 'rise' : 'float';
    this.alpha = opt.rise ? 0 : 1;
    this.cool = frames(40 + TC.rnd.int(0, 60), TC.diff().cool);
    this.phase = TC.rnd() * 6;
    if (opt.rise) this.inv = 40;
  }
  Ghost.prototype.attacking = function () { return this.state === 'windup' || this.state === 'lunge'; };
  Ghost.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 20, w: 14, h: 18 }; };
  Ghost.prototype.hit = function (st, d, dir, kb, id, atk) { return genericHit(this, st, d, dir, kb, id, atk); };
  Ghost.prototype.onHit = function (st, dmg, dir, kb) {
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 1.2; this.vy = -kb * 0.25;
    TC.audio.sfx('hit');
  };
  Ghost.prototype.die = function (st, dir) {
    this.dying = true;
    this.t = 0;
    this.vx = dir * 2;
    TC.audio.sfx('ghostDie');
    st.addScore(this.score);
    st.kill(this);
    for (var i = 0; i < 16; i++) {
      st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - TC.rnd.range(4, 18), vx: TC.rnd.range(-0.6, 0.6), vy: TC.rnd.range(-1.6, -0.4), life: TC.rnd.int(30, 60), colors: ['#ffffff', '#c0d0ff', '#6070c0'], size: TC.rnd.int(1, 3), fade: true, wobble: 0.2 });
    }
  };
  Ghost.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.inv > 0) this.inv--;
    if (this.dying) {
      this.alpha -= 0.06; this.y -= 0.8; this.x += this.vx * 0.3;
      if (this.alpha <= 0) this.alive = false;
      return;
    }
    var p = st.player;
    var dx = p.x - this.x, dy = (p.y - 16) - this.y + 10;
    var play = st.mode === 'play';
    var D = TC.diff();
    switch (this.state) {
      case 'rise':
        this.alpha = Math.min(1, this.alpha + 0.03);
        this.y -= 0.55;
        if (this.t >= 40) { this.state = 'float'; this.t = 0; }
        break;
      case 'float':
        this.face = dx < 0 ? -1 : 1;
        var ty = p.y - 10 + Math.sin(this.t * 0.06 + this.phase) * 8;
        // quando encostar não machuca, a assombração ronda a uma certa distância em vez de grudar no Arno
        var adx = Math.abs(dx), want = Math.sign(dx) * 0.7;
        if (!D.touch) want = adx > 30 ? this.face * 0.7 : adx < 20 ? -this.face * 0.5 : 0;
        this.vx = TC.approach(this.vx, want, 0.04);
        this.vy = TC.approach(this.vy, TC.clamp((ty - this.y) * 0.05, -0.7, 0.7), 0.05);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 70 && Math.abs(dy) < 34) {
          if (st.mayAttack(this)) { this.state = 'windup'; this.t = 0; TC.audio.sfx('ghost'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'windup':
        this.vx *= 0.85; this.vy *= 0.85;
        if (this.t >= frames(26, D.windup)) {
          this.state = 'lunge'; this.t = 0;
          this.vx = this.face * 3.1 * D.speed;
          this.vy = TC.clamp(((p.y - 12) - this.y) / 22, -1.5, 1.5);
        }
        break;
      case 'lunge':
        if (this.t >= 28) { this.state = 'recover'; this.t = 0; this.cool = frames(70 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'recover':
        this.vx *= 0.93; this.vy *= 0.93;
        if (this.t >= 30) { this.state = 'float'; this.t = 0; }
        break;
      case 'hurt':
        this.vx *= 0.9; this.vy *= 0.9;
        if (this.t >= 16) { this.state = 'float'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.x += this.vx; this.y += this.vy;
    this.y = TC.clamp(this.y, 50, st.groundY + 2);
    if (st.arena) this.x = TC.clamp(this.x, st.camX - 30, st.camX + TC.W + 30);
    if (this.state === 'lunge') contact(this, st, 1);
    else if (this.state !== 'rise' && this.state !== 'hurt') contact(this, st, 1, false, true);
  };
  Ghost.prototype.draw = function (c, cx, cy) {
    var img = A.ghost[Math.floor(this.t / 8) % 4];
    var shake = this.state === 'windup' ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    var bob = Math.round(Math.sin(this.t * 0.1 + this.phase) * 1.5);
    var a = this.alpha * (0.78 + Math.sin(this.t * 0.2) * 0.08);
    drawSprite(c, img, this.x - cx + shake, this.y - cy + bob, this.face, this.flash > 0, a);
  };
  Ghost.prototype.light = function (L, cx, cy) {
    L.add(this.x - cx, this.y - 10 - cy, 24, '#5070ff', 0.45 * this.alpha);
  };

  /* ================= CABEÇA-DE-FOGO ================= */
  function Flame(x, y, opt) {
    base(this, 'flame', x, y);
    this.w = 16; this.h = 18;
    this.hp = this.maxHp = hpFor(4);
    this.name = 'en.flame';
    this.score = 200;
    this.state = 'enter';
    this.side = x < (opt && opt.cx || 0) ? -1 : 1;
    this.hoverT = frames(TC.rnd.int(90, 150), TC.diff().cool);
    this.phase = TC.rnd() * 6;
  }
  Flame.prototype.attacking = function () { return this.state === 'aim' || this.state === 'dash'; };
  Flame.prototype.hurtBox = function () { return { x: this.x - 11, y: this.y - 25, w: 22, h: 24 }; };
  Flame.prototype.hit = function (st, d, dir, kb, id, atk) { return genericHit(this, st, d, dir, kb, id, atk); };
  Flame.prototype.onHit = function (st, dmg, dir, kb) {
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 1.1; this.vy = -kb * 0.4;
    TC.audio.sfx('hit');
    for (var i = 0; i < 6; i++) st.parts.add({ x: this.x, y: this.y - 10, vx: TC.rnd.range(-2, 2), vy: TC.rnd.range(-2, 0.5), life: 20, colors: ['#ffe080', '#ff9030', '#c03010'], size: 2, fade: true, layer: 1, add: true });
  };
  Flame.prototype.die = function (st, dir) {
    this.dying = true; this.t = 0;
    TC.audio.sfx('flameDie');
    st.addScore(this.score);
    st.kill(this);
    TC.fx.shake(2, 8);
    for (var i = 0; i < 28; i++) {
      var a = TC.rnd() * TC.TAU, s = TC.rnd.range(0.5, 3);
      st.parts.add({ x: this.x, y: this.y - 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, ay: -0.02, life: TC.rnd.int(20, 50), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010', '#401008'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
    }
    st.flashLight = { x: this.x, y: this.y - 10, t: 14 };
  };
  Flame.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.dying) { this.alive = false; return; }
    var p = st.player;
    var dx = p.x - this.x;
    var play = st.mode === 'play';
    var D = TC.diff();
    // brasas na cauda
    if (this.t % 3 === 0) {
      var back = this.vx > 0.3 ? -1 : this.vx < -0.3 ? 1 : -this.face;
      st.parts.add({ x: this.x + back * 16 + TC.rnd.range(-3, 3), y: this.y - 13 + TC.rnd.range(-5, 5), vx: back * TC.rnd.range(0.2, 0.8), vy: TC.rnd.range(-0.8, -0.2), life: TC.rnd.int(14, 28), colors: ['#ffe080', '#ff9030', '#c03010', '#401008'], size: TC.rnd.int(1, 2), fade: true, layer: 1, add: true });
    }
    switch (this.state) {
      case 'enter':
      case 'hover': {
        var tx = p.x + this.side * 72, ty = p.y - 52 + Math.sin(this.t * 0.05 + this.phase) * 10;
        tx = TC.clamp(tx, st.camX + 16, st.camX + TC.W - 16);
        this.vx += (tx - this.x) * 0.0035; this.vy += (ty - this.y) * 0.004;
        this.vx *= 0.94; this.vy *= 0.94;
        this.face = dx < 0 ? -1 : 1;
        if (this.state === 'enter' && this.t > 60) { this.state = 'hover'; this.t = 0; }
        if (this.state === 'hover' && play && this.t > this.hoverT) {
          if (st.mayAttack(this)) { this.state = 'aim'; this.t = 0; TC.audio.sfx('screech'); }
          else this.hoverT = this.t + TC.rnd.int(20, 50);
        }
        break;
      }
      case 'aim':
        this.vx *= 0.85; this.vy *= 0.85;
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(34, D.windup)) {
          this.state = 'dash'; this.t = 0;
          this.vx = this.face * 4.3 * D.speed;
          this.vy = TC.clamp(((p.y - 14) - this.y) / 20, -2.5, 2.5);
          TC.audio.sfx('flame');
        }
        break;
      case 'dash':
        this.vy *= 0.98;
        if (this.t >= 36) { this.state = 'hover'; this.t = 0; this.side = -this.side; this.hoverT = frames(TC.rnd.int(80, 140), D.cool); }
        break;
      case 'hurt':
        this.vx *= 0.9; this.vy *= 0.9;
        if (this.t >= 14) { this.state = 'hover'; this.t = 0; }
        break;
    }
    this.x += this.vx; this.y += this.vy;
    this.y = TC.clamp(this.y, 30, st.groundY - 2);
    if (this.state === 'dash') contact(this, st, 2, true);
    else if (this.state !== 'hurt' && this.state !== 'enter') contact(this, st, 1, false, true);
  };
  Flame.prototype.draw = function (c, cx, cy) {
    var moving = Math.abs(this.vx) > 0.6 ? Math.sign(this.vx) : this.face;
    var fl = A.flames[Math.floor(this.t / 4) % 4];
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var shake = this.state === 'aim' ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    c.globalCompositeOperation = 'lighter';
    if (moving > 0) c.drawImage(fl, x - fl.width + 1 + shake, y - 26);
    else c.drawImage(TC.flip(fl), x - 1 + shake, y - 26);
    c.globalCompositeOperation = 'source-over';
    var face = (this.state === 'aim' || this.state === 'dash') ? A.flameHead.open : A.flameHead.closed;
    drawSprite(c, face, x + shake, y, this.face, this.flash > 0, 1);
  };
  Flame.prototype.light = function (L, cx, cy) {
    var f = Math.sin(this.t * 0.4) * 4;
    L.add(this.x - cx, this.y - 13 - cy, 56 + f, '#ff9040', this.state === 'aim' ? 1.4 : 1.0);
  };
  Flame.prototype.glow = function (c, cx, cy) {
    TC.Lighting.glow(c, this.x - cx, this.y - 13 - cy, 22, '#ff8030', 0.35);
  };

  /* ================= VULTO ================= */
  function Shade(x, y, opt) {
    base(this, 'shade', x, y);
    this.w = 14; this.h = 40;
    this.hp = this.maxHp = hpFor(6);
    this.name = 'en.shade';
    this.score = 300;
    this.state = 'spawn';
    this.alpha = 0;
    this.cool = 30;
    this.onGround = false;
    this.speed = 0.7 + TC.rnd() * 0.15;
    this.useArena = true;
  }
  Shade.prototype.attacking = function () { return this.state === 'windup' || this.state === 'swipe'; };
  Shade.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 40, w: 14, h: 40 }; };
  Shade.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup' || this.state === 'spawn') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Shade.prototype.onHit = function (st, dmg, dir, kb, atk) {
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
  Shade.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('die');
  };
  Shade.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player;
    var dx = p.x - this.x, dy = p.y - this.y;
    var play = st.mode === 'play';
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      if (this.t > 30) {
        this.alpha -= 0.04;
        if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(0, 10), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.4), life: 40, colors: ['#3a2a50', '#2a1e3a', '#140e1e'], size: TC.rnd.int(2, 4), fade: true });
        if (this.alpha <= 0) this.alive = false;
      }
      return;
    }
    switch (this.state) {
      case 'spawn':
        this.alpha = Math.min(1, this.alpha + 0.025);
        this.face = dx < 0 ? -1 : 1;
        if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(0, 40), vy: -0.6, life: 30, colors: ['#3a2a50', '#140e1e'], size: 2, fade: true });
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk':
        this.face = dx < 0 ? -1 : 1;
        if (Math.abs(dx) > 22) this.vx = TC.approach(this.vx, this.face * this.speed, 0.08);
        else this.vx = TC.approach(this.vx, 0, 0.1);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 32 && Math.abs(dy) < 20) {
          if (st.mayAttack(this)) { this.state = 'windup'; this.t = 0; }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'windup':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= frames(22, TC.diff().windup)) { this.state = 'swipe'; this.t = 0; TC.audio.sfx('swing2'); this.vx = this.face * 1.2; }
        break;
      case 'swipe':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 2 && this.t <= 8 && play) {
          var bx = this.face > 0 ? this.x + 4 : this.x - 30;
          if (TC.overlap({ x: bx, y: this.y - 36, w: 26, h: 24 }, p.hurtBox())) p.damage(st, 2, this.face, true);
        }
        if (this.t >= 14) { this.state = 'recover'; this.t = 0; }
        break;
      case 'recover':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= 26) { this.state = 'walk'; this.t = 0; this.cool = frames(40 + TC.rnd.int(0, 50), TC.diff().cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = 20; }
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
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Shade.prototype.draw = function (c, cx, cy) {
    var S = A.shade, img;
    switch (this.state) {
      case 'walk': img = Math.abs(this.vx) > 0.1 ? S.walk[Math.floor(this.t / 8) % 6] : S.idle[Math.floor(this.t / 30) % 2]; break;
      case 'windup': img = S.windup[0]; break;
      case 'swipe': img = this.t < 9 ? S.swipe[0] : S.idle[0]; break;
      case 'recover': img = S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      case 'getup': img = S.windup[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    var shake = this.state === 'windup' && this.t > 12 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
    if (this.state === 'swipe' && this.t < 8) {
      // rastro das garras
      c.fillStyle = 'rgba(200,180,255,0.6)';
      var sx = Math.round(this.x - cx + this.face * 18), sy = Math.round(this.y - cy - 26);
      for (var i = 0; i < 3; i++) c.fillRect(sx - 6 + (this.face > 0 ? i * 2 : -i * 2), sy + i * 4, 12, 1);
    }
  };
  Shade.prototype.light = function (L, cx, cy) {
    if (this.alpha <= 0.3 || this.state === 'down') return;
    L.add(this.x + this.face * 2 - cx, this.y - 37 - cy, this.state === 'windup' ? 18 : 10, '#ff4020', 0.7);
  };

  /* ================= CORVO ================= */
  function Crow(x, y, opt) {
    base(this, 'crow', x, y);
    this.w = 12; this.h = 8;
    this.hp = this.maxHp = 1;
    this.name = 'en.crow';
    this.score = 50;
    this.state = opt && opt.fly ? 'swoop' : 'perch';
    this.homeY = y;
    this.ay = 0.055;
    if (this.state === 'swoop') this.startSwoop(opt.fly);
  }
  Crow.prototype.startSwoop = function (dir, st) {
    this.state = 'swoop'; this.t = 0;
    this.face = dir;
    this.vx = dir * 2.6;
    this.vy = 2.0;
    this.aimed = false;
    if (st) this.aim(st);
  };
  /* parábola cujo ponto mais baixo fica na altura da cabeça do Arno, bem em cima dele */
  Crow.prototype.aim = function (st) {
    var p = st.player;
    var dist = Math.max(40, Math.abs(p.x - this.x));
    var drop = Math.max(20, (p.y - 18) - this.y);
    var T = TC.clamp(dist / 2.6, 50, 110) / TC.diff().speed;
    this.vx = this.face * dist / T;
    this.vy = 2 * drop / T;
    this.ay = 2 * drop / (T * T);
    this.aimed = true;
  };
  Crow.prototype.hurtBox = function () { return { x: this.x - 6, y: this.y - 10, w: 12, h: 10 }; };
  Crow.prototype.hit = function (st, d, dir, kb, id, atk) { return genericHit(this, st, d, dir, kb, id, atk); };
  Crow.prototype.onHit = function () { TC.audio.sfx('hit'); };
  Crow.prototype.die = function (st, dir) {
    this.dying = true; this.alive = false;
    st.addScore(this.score);
    st.kill(this);
    for (var i = 0; i < 10; i++) st.parts.add({ x: this.x, y: this.y - 5, vx: TC.rnd.range(-1.5, 1.5) + dir, vy: TC.rnd.range(-2, 0), ay: 0.06, life: 50, color: TC.rnd.pick(['#1e1a28', '#3a3450', '#0c0a10']), size: 2, fade: true, wobble: 0.15 });
  };
  Crow.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player;
    var dx = p.x - this.x;
    switch (this.state) {
      case 'perch':
        this.face = dx < 0 ? -1 : 1;
        if (st.mode === 'play' && Math.abs(dx) < 120) { TC.audio.sfx(this.cry || 'caw'); this.startSwoop(this.face, st); }
        break;
      case 'swoop':
        if (!this.aimed) this.aim(st);
        this.vy -= this.ay;
        this.x += this.vx; this.y += this.vy;
        if (this.y < -20 || this.x < st.camX - 40 || this.x > st.camX + TC.W + 40) {
          this.state = 'away'; this.t = 0;
          // fora das arenas o corvo desiste depois de alguns rasantes (nas arenas ele volta até ser derrotado)
          this.passes = (this.passes || 0) + 1;
          if (!this.wave && this.passes >= 3) this.alive = false;
        }
        break;
      case 'away':
        if (this.t > 70) {
          var fromLeft = TC.rnd() < 0.5;
          this.x = fromLeft ? st.camX - 16 : st.camX + TC.W + 16;
          this.y = TC.rnd.range(40, 90);
          this.startSwoop(fromLeft ? 1 : -1, st);
          TC.audio.sfx(this.cry || 'caw');
        }
        break;
    }
    if (this.state === 'swoop') contact(this, st, 1);
  };
  Crow.prototype.draw = function (c, cx, cy) {
    if (this.state === 'away') return;
    var img = this.state === 'perch' ? A.crow.perch : A.crow.fly[Math.floor(this.t / 5) % 2];
    var f = this.face > 0 ? TC.flip(img) : img;
    c.drawImage(this.flash ? TC.tintCached(f, '#ffffff', 0.7) : f, Math.round(this.x - img.width / 2 - cx), Math.round(this.y - img.height - cy));
  };

  /* ================= O CICLOPE GIGANTE ================= */
  function Boss(x, y, arena) {
    base(this, 'boss', x, y);
    this.arena = arena;
    this.w = 30; this.h = 58;
    this.hp = this.maxHp = TC.diff().bossHp;
    this.name = 'boss.name';
    this.isBoss = true;
    this.score = 5000;
    this.state = 'intro';
    this.stagger = 0;
    this.attacks = 0;
    this.bob = 0;
  }
  Boss.prototype.attacking = function () { var s = this.state; return s === 'swoopPrep' || s === 'swoop' || s === 'castPrep' || s === 'cast'; };
  Boss.prototype.L = function () { return this.arena.x0 + 30; };
  Boss.prototype.R = function () { return this.arena.x0 + TC.W - 30; };
  Boss.prototype.hurtBox = function () {
    if (this.state === 'swoop') return { x: this.x - 26, y: this.y - 32, w: 52, h: 26 };
    return { x: this.x - 15, y: this.y - 64, w: 30, h: 56 };
  };
  Boss.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'dying') return false;
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      this.stagger += d;
      if (this.stagger >= 12 && this.state !== 'tired') { this.stagger = 0; this.set('stagger'); this.vx = dir * 1.5; TC.audio.sfx('roar'); }
    }
    return ok;
  };
  Boss.prototype.die = function (st) {
    this.dying = false;
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.3);
    st.killAllMinions();
  };
  Boss.prototype.set = function (s) { this.state = s; this.t = 0; };
  Boss.prototype.phase2 = function () { return this.hp <= this.maxHp * 0.5; };
  Boss.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t;
    var G = st.groundY;
    var D = TC.diff();
    var spd = (this.phase2() ? 1.25 : 1) * D.speed;
    switch (this.state) {
      case 'intro':
        this.y = TC.lerp(-30, 118, TC.ease.outCubic(Math.min(1, t / 130)));
        this.face = p.x < this.x ? -1 : 1;
        break;
      case 'hover': {
        if (t === 1) this.tx = TC.clamp(p.x + (p.x < this.arena.x0 + 128 ? 70 : -70) + TC.rnd.range(-20, 20), this.L(), this.R());
        this.x += (this.tx - this.x) * 0.03;
        this.y += (112 + Math.sin(t * 0.06) * 8 - this.y) * 0.08;
        this.face = p.x < this.x ? -1 : 1;
        if (t > frames(this.phase2() ? 60 : 90, D.cool) && st.mode === 'play' && st.mayAttack(this)) {
          this.attacks++;
          if (this.phase2() && this.attacks % 3 === 0) this.set('summon');
          else if (this.attacks % 2 === 1) this.set('swoopPrep');
          else this.set('castPrep');
        }
        break;
      }
      case 'swoopPrep': {
        if (t === 1) { this.side = p.x < this.arena.x0 + 128 ? 1 : -1; TC.audio.sfx('screech'); }
        var sx = this.side > 0 ? this.R() + 10 : this.L() - 10;
        this.x += (sx - this.x) * 0.06;
        this.y += (84 - this.y) * 0.06;
        this.face = -this.side;
        if (t > frames(46, D.windup)) { this.set('swoop'); TC.audio.sfx('roar'); }
        break;
      }
      case 'swoop': {
        this.face = -this.side;
        var targetY = G;
        this.y += (targetY - this.y) * 0.12;
        if (t > 10) this.x += this.face * 4.6 * spd;
        if (t % 4 === 0) st.dust(this.x - this.face * 10, G);
        if ((this.face > 0 && this.x > this.R()) || (this.face < 0 && this.x < this.L())) { this.set('tired'); TC.fx.shake(3, 10); TC.audio.sfx('land'); }
        break;
      }
      case 'tired':
        this.y += (G - this.y) * 0.2;
        if (t > frames(this.phase2() ? 70 : 95, D.cool)) this.set('hover');
        break;
      case 'castPrep':
        this.x += (this.arena.x0 + 128 - this.x) * 0.05;
        this.y += (88 - this.y) * 0.05;
        this.face = p.x < this.x ? -1 : 1;
        if (t > frames(40, D.windup)) { this.set('cast'); this.volley = 0; }
        break;
      case 'cast': {
        this.face = p.x < this.x ? -1 : 1;
        if (t % 40 === 10) {
          var n = this.phase2() ? D.orbs : 3;
          var ex = this.x + this.face * 4, ey = this.y - 52;
          var base = Math.atan2((p.y - 16) - ey, p.x - ex);
          for (var i = 0; i < n; i++) {
            var a = base + (i - (n - 1) / 2) * 0.26;
            st.orbs.push(new E.Orb(ex, ey, Math.cos(a) * 2.2 * D.speed, Math.sin(a) * 2.2 * D.speed));
          }
          TC.audio.sfx('orb');
          this.volley++;
        }
        if (this.volley >= 2 && t % 40 === 30) this.set('hover');
        break;
      }
      case 'summon':
        if (t === 20) {
          TC.audio.sfx('roar');
          st.spawnEnemy('ghost', TC.clamp(p.x - 60, this.L(), this.R()), G, { rise: true });
          st.spawnEnemy('ghost', TC.clamp(p.x + 60, this.L(), this.R()), G, { rise: true });
        }
        if (t > 70) this.set('hover');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        this.y += (G - 10 - this.y) * 0.08;
        if (t > 50) this.set('hover');
        break;
      case 'dying':
        TC.fx.shake(3, 4);
        if (t % 8 === 0) {
          TC.audio.sfx('explode');
          var ox = TC.rnd.range(-24, 24), oy = TC.rnd.range(-70, -10);
          for (var k = 0; k < 10; k++) st.parts.add({ x: this.x + ox, y: this.y + oy, vx: TC.rnd.range(-2, 2), vy: TC.rnd.range(-2, 2), life: 24, colors: ['#ffffff', '#a0ffb0', '#40c060', '#104020'], size: TC.rnd.int(2, 4), fade: true, layer: 1, add: true });
          this.flash = 3;
        }
        this.y += (G - 4 - this.y) * 0.02;
        if (t === 150) {
          TC.fx.flash('#ffffff', 1, 0.03);
          TC.audio.sfx('crash');
          for (var j = 0; j < 60; j++) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y - TC.rnd.range(0, 80), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2.5, -0.3), life: TC.rnd.int(40, 90), colors: ['#ffffff', '#a0ffb0', '#40c060', '#104020'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
          this.alive = false;
          st.addScore(this.score);
          st.onBossDead(this);
        }
        break;
    }
    if (this.state !== 'dying' && this.state !== 'intro') {
      if (this.state === 'swoop') contact(this, st, 2, true);
      else if (this.state !== 'tired' && this.state !== 'stagger') {
        var hb = this.hurtBox();
        if (st.mode === 'play' && D.touch && TC.overlap({ x: hb.x + 6, y: hb.y + 10, w: hb.w - 12, h: hb.h - 14 }, p.hurtBox())) p.damage(st, 1, p.x < this.x ? -1 : 1);
      }
    }
  };
  Boss.prototype.draw = function (c, cx, cy) {
    var B = A.boss, img;
    switch (this.state) {
      case 'swoop': img = B.swoop[0]; break;
      case 'cast': case 'castPrep': case 'summon': img = B.cast[0]; break;
      case 'stagger': img = B.hurt[0]; break;
      case 'tired': img = B.hurt[0]; break;
      case 'dying': img = B.dead[0]; break;
      default: img = B.hover[Math.floor(this.t / 6) % 6];
    }
    var shake = this.state === 'dying' ? TC.rnd.int(-2, 2) : 0;
    var oy = this.state === 'swoop' ? 26 : 4;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + oy, this.face, this.flash > 0, 1);
  };
  Boss.prototype.light = function (L, cx, cy) {
    var ex = this.x + this.face * 1 - cx, ey = this.y - 56 - cy;
    var pulse = (this.state === 'cast' || this.state === 'castPrep') ? 1.5 : 1;
    L.add(ex, ey, 70 * pulse, '#40ff70', 0.55 * pulse);
  };
  Boss.prototype.glow = function (c, cx, cy) {
    TC.Lighting.glow(c, this.x + this.face - cx, this.y - 56 - cy, 10, '#80ffa0', 0.6);
  };

  TC.ENEMIES = { ghost: Ghost, flame: Flame, shade: Shade, crow: Crow, boss: Boss };
  // utilitários compartilhados com as criaturas dos outros capítulos (stage/enemies2.js)
  TC.enemyKit = { base: base, drawSprite: drawSprite, genericHit: genericHit, contact: contact, hpFor: hpFor, frames: frames };
})();
