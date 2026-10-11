'use strict';
/* Teewald City — capítulo 4: os sapatos sem dono (Modelo Hilde, tamancos, botina de bico de aço), o contramestre
   fantasma, O Couro (mini-chefe do curtume) e a Moça do Serão; projéteis (agulhas, fôrma, costura, cola) e o cenário
   animado da fábrica (balancim, esteira, fulão, sonâmbulas, costureiras, relógio de ponto, estrela de neon) */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  var base = K.base, drawSprite = K.drawSprite, genericHit = K.genericHit, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W;
  var GY = 192;
  function art() { return TC.ART.ch4Init(); }
  function hasteK(e) { return e.hasted > 0 ? 1.45 : 1; }

  /* ================= SAPATOS SEM DONO (o Modelo Hilde) =================
     Um par de escarpins vermelhos andando sozinho; chega perto, encolhe e dá um pulo com o bico. */
  function Shoes(x, y, opt) {
    base(this, 'shoes', x, y);
    this.w = 16; this.h = 12;
    this.hp = this.maxHp = hpFor(3);
    this.name = 'en.shoes';
    this.score = 120;
    this.state = 'enter'; this.alpha = 0;
    this.cool = frames(40 + TC.rnd.int(0, 50), TC.diff().cool);
    this.useArena = true; this.onGround = false;
    this.speed = 0.75 + TC.rnd() * 0.2;
    this.hasted = 0;
  }
  Shoes.prototype.attacking = function () { return this.state === 'crouch' || this.state === 'leap'; };
  Shoes.prototype.hurtBox = function () { return { x: this.x - 10, y: this.y - 26, w: 20, h: 26 }; };
  Shoes.prototype.hit = function (st, d, dir, kb, id, atk) { if (this.state === 'enter' && this.alpha < 0.5) return false; return genericHit(this, st, d, dir, kb, id, atk); };
  Shoes.prototype.onHit = function (st, dmg, dir, kb) {
    TC.audio.sfx('hit');
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 1.1; this.vy = -2.2;
  };
  Shoes.prototype.die = function (st, dir) {
    this.dying = true; this.t = 0;
    st.addScore(this.score); st.kill(this);
    TC.audio.sfx('break');
    for (var i = 0; i < 12; i++) st.parts.add({ x: this.x, y: this.y - 6, vx: TC.rnd.range(-2, 2) + (dir || 0), vy: TC.rnd.range(-3, -1), ay: 0.18, life: 40, color: TC.rnd.pick(['#c82020', '#8a1414', '#f0a0a0', '#140808']), size: TC.rnd.int(1, 2), fade: true });
  };
  Shoes.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.hasted > 0) this.hasted--;
    if (this.dying) { this.alpha -= 0.08; if (this.alpha <= 0) this.alive = false; return; }
    var p = st.player, dx = p.x - this.x, play = st.mode === 'play', D = TC.diff();
    switch (this.state) {
      case 'enter':
        this.alpha = Math.min(1, this.alpha + 0.04);
        this.face = dx < 0 ? -1 : 1;
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk':
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, Math.abs(dx) > 34 ? this.face * this.speed * hasteK(this) : 0, 0.08);
        if (this.onGround && Math.abs(this.vx) > 0.3 && this.t % 14 === 0) TC.audio.sfx('step');
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 60 && Math.abs(p.y - this.y) < 24 && this.onGround) {
          if (st.mayAttack(this)) { this.state = 'crouch'; this.t = 0; }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'crouch':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= frames(22, D.windup)) {
          this.state = 'leap'; this.t = 0;
          this.vx = this.face * 2.6 * D.speed * hasteK(this); this.vy = -3.4;
          TC.audio.sfx('swing');
        }
        break;
      case 'leap':
        if (this.onGround && this.t > 4) { this.state = 'recover'; this.t = 0; st.dust(this.x, this.y); }
        break;
      case 'recover':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 26) { this.state = 'walk'; this.t = 0; this.cool = frames(60 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        if (this.onGround && this.t > 6) this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= 20 && this.onGround) { this.state = 'walk'; this.t = 0; this.cool = Math.max(this.cool, 24); }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'leap') contact(this, st, 1);
    else if (this.state === 'walk') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Shoes.prototype.draw = function (c, cx, cy) {
    var S = art().shoes, img;
    if (this.state === 'crouch' || this.state === 'leap') img = this.state === 'leap' ? S.kick : S.walk[0];
    else if (this.state === 'hurt') img = S.hurt;
    else img = Math.abs(this.vx) > 0.2 ? S.walk[Math.floor(this.t / 6) % 4] : S.walk[0];
    var sq = this.state === 'crouch' ? ((this.t >> 1) % 2) : 0;
    drawSprite(c, img, this.x - cx + sq, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Shoes.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - 8 - cy, 16, '#ff6060', 0.35 * this.alpha); };

  /* ================= TAMANCOS =================
     Os tamancos de madeira dos colonos, saltitando aos pares (claque-claque) e dando um coice duplo. */
  function Clog(x, y, opt) {
    Shoes.call(this, x, y, opt);
    this.type = 'clog';
    this.name = 'en.clog';
    this.hp = this.maxHp = hpFor(3);
    this.score = 140;
    this.speed = 1.0 + TC.rnd() * 0.2;
  }
  Clog.prototype = Object.create(Shoes.prototype);
  Clog.prototype.update = function (st) {
    var wasGround = this.onGround;
    // sempre aos pulinhos
    if (!this.dying && this.state === 'walk' && this.onGround && this.t % 18 === 0) { this.vy = -1.8; }
    Shoes.prototype.update.call(this, st);
    if (!wasGround && this.onGround && !this.dying && Math.abs(this.x - st.camX - 128) < 160) TC.audio.sfx('clack');
  };
  Clog.prototype.draw = function (c, cx, cy) {
    var S = art().clog, img;
    if (this.state === 'leap' || this.state === 'crouch') img = S.hop;
    else if (this.state === 'hurt') img = S.hurt;
    else img = S.walk[Math.floor(this.t / 5) % 4];
    drawSprite(c, img, this.x - cx, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Clog.prototype.light = function () { };

  /* ================= BOTINA DE BICO DE AÇO =================
     A botina de segurança dos operários, pesada: chega aos saltos, agacha e pisa — o chão treme dos dois lados. */
  function Boot(x, y, opt) {
    base(this, 'boot', x, y);
    this.w = 20; this.h = 26;
    this.hp = this.maxHp = hpFor(7);
    this.name = 'en.boot';
    this.score = 350;
    this.state = 'enter'; this.alpha = 0;
    this.cool = frames(60 + TC.rnd.int(0, 40), TC.diff().cool);
    this.useArena = true; this.onGround = false;
    this.hasted = 0;
  }
  Boot.prototype.attacking = function () { return this.state === 'squat' || this.state === 'jump'; };
  Boot.prototype.hurtBox = function () { return { x: this.x - 11, y: this.y - 30, w: 22, h: 30 }; };
  Boot.prototype.hit = function (st, d, dir, kb, id, atk) { if (this.state === 'enter' && this.alpha < 0.5) return false; return genericHit(this, st, d, dir, kb, id, atk); };
  Boot.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    if (this.state === 'jump') return;
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 0.5;
  };
  Boot.prototype.die = function (st, dir) {
    this.dying = true; this.t = 0;
    st.addScore(this.score); st.kill(this);
    TC.audio.sfx('break'); TC.audio.sfx('ghostDie');
    for (var i = 0; i < 16; i++) st.parts.add({ x: this.x, y: this.y - 12, vx: TC.rnd.range(-2, 2), vy: TC.rnd.range(-3, -0.5), ay: 0.15, life: 44, color: TC.rnd.pick(['#2a2420', '#5a3a20', '#8a8a96', '#d8c8a0']), size: 2, fade: true });
  };
  Boot.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    if (this.hasted > 0) this.hasted--;
    if (this.dying) { this.alpha -= 0.05; if (this.alpha <= 0) this.alive = false; return; }
    var p = st.player, dx = p.x - this.x, play = st.mode === 'play', D = TC.diff();
    switch (this.state) {
      case 'enter':
        this.alpha = Math.min(1, this.alpha + 0.03);
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk':
        this.face = dx < 0 ? -1 : 1;
        // anda aos saltos curtos
        if (this.onGround && this.t % 34 === 0 && Math.abs(dx) > 30) { this.vy = -2.4; this.vx = this.face * 1.0 * hasteK(this); }
        if (this.onGround && this.t % 34 > 4) this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 90 && this.onGround) {
          if (st.mayAttack(this)) { this.state = 'squat'; this.t = 0; TC.audio.sfx('growl'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'squat':
        this.vx = 0;
        if (this.t >= frames(30, D.windup)) {
          this.state = 'jump'; this.t = 0;
          this.tx = TC.clamp(p.x, st.camX + 20, st.camX + W - 20);
          this.vy = -5.2;
          this.vx = (this.tx - this.x) / (2 * 5.2 / E.GRAV);
        }
        break;
      case 'jump':
        if (this.onGround && this.t > 4) {
          this.state = 'land'; this.t = 0; this.vx = 0;
          TC.audio.sfx('stomp'); TC.fx.shake(3, 12);
          st.dust(this.x - 12, this.y); st.dust(this.x + 12, this.y);
          for (var w = -1; w <= 1; w += 2) st.deco.push(new Shock(this.x + w * 12, this.y, w * 2.6 * D.speed));
          if (play && p.onGround && Math.abs(p.x - this.x) < 24) p.damage(st, 2, p.x < this.x ? -1 : 1, true);
        }
        break;
      case 'land':
        if (this.t >= frames(40, D.cool)) { this.state = 'walk'; this.t = 0; this.cool = frames(90 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'jump' && this.vy > 0) contact(this, st, 2, true);
    else if (this.state === 'walk') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Boot.prototype.draw = function (c, cx, cy) {
    var S = art().boot, img;
    switch (this.state) {
      case 'squat': img = S.squat[0]; break;
      case 'jump': img = this.vy < 0 ? S.hop[0] : S.stomp[0]; break;
      case 'land': img = this.t < 10 ? S.stomp[0] : S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      default: img = this.onGround ? S.idle[Math.floor(this.t / 20) % 2] : S.hop[0];
    }
    var sh = this.state === 'squat' && this.t > 14 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    // sombra-alvo da pisada
    if (this.state === 'jump' && this.tx != null) { c.fillStyle = 'rgba(160,40,20,0.35)'; TC.fillEllipse(c, Math.round(this.tx - cx), GY - 1 - cy, 14, 3); }
    drawSprite(c, img, this.x - cx + sh, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Boot.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - 16 - cy, this.state === 'squat' ? 22 : 12, '#ff8030', 0.6 * this.alpha); };

  /* onda de choque da pisada (corre rente ao chão; é só pular) */
  function Shock(x, y, vx) { this.x = x; this.y = y; this.vx = vx; this.t = 0; this.alive = true; }
  Shock.prototype.update = function (st) {
    this.t++;
    this.x += this.vx;
    if (this.t % 3 === 0) st.parts.add({ x: this.x, y: this.y - 2, vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.4), ay: 0.06, life: 16, color: TC.rnd.pick(['#a8a8b0', '#6a6a72', '#d8d8e0']), size: 2, fade: true });
    if (this.t > 50 || this.x < st.camX - 10 || this.x > st.camX + W + 10) this.alive = false;
    var p = st.player;
    if (st.mode === 'play' && p.onGround && Math.abs(p.x - this.x) < 7) { if (p.damage(st, 1, Math.sign(this.vx))) this.alive = false; }
  };
  Shock.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    c.fillStyle = '#d8d8e0';
    for (var i = -4; i <= 4; i++) { var h = Math.round(5 * (1 - Math.abs(i) / 5)); c.fillRect(x + i, y - h, 1, 1); }
  };

  /* ================= O CONTRAMESTRE =================
     O fantasma do capataz do pesponto: mantém distância, joga fôrmas de madeira e apita — "A META!" —
     e aí todos os sapatos da sala apressam o passo. */
  function Foreman(x, y, opt) {
    base(this, 'foreman', x, y);
    this.w = 14; this.h = 34;
    this.hp = this.maxHp = hpFor(7);
    this.name = 'en.foreman';
    this.score = 400;
    this.state = 'spawn'; this.alpha = 0;
    this.cool = frames(70, TC.diff().cool);
    this.useArena = true; this.onGround = false;
    this.lieT = 0; this.casts = 0;
  }
  Foreman.prototype.attacking = function () { return this.state === 'windup' || this.state === 'throw' || this.state === 'whistle'; };
  Foreman.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 36, w: 14, h: 36 }; };
  Foreman.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'spawn') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Foreman.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    if (atk.heavy || this.hp <= 0) { this.state = 'down'; this.t = 0; this.vx = dir * kb * 0.7; this.vy = atk.lift || -2.5; this.lieT = 0; }
    else { this.state = 'hurt'; this.t = 0; this.vx = dir * kb * 0.6; }
  };
  Foreman.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score); st.kill(this);
    TC.audio.sfx('ghostDie');
  };
  Foreman.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV); E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      if (this.t > 30) { this.alpha -= 0.04; if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-10, 10), y: this.y - TC.rnd.range(0, 12), vy: -0.8, life: 30, color: '#c8d0e8', size: 1, fade: true, layer: 1 }); }
      if (this.alpha <= 0) this.alive = false;
      return;
    }
    switch (this.state) {
      case 'spawn':
        this.alpha = Math.min(1, this.alpha + 0.03);
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk': {
        this.face = dx < 0 ? -1 : 1;
        var want = Math.abs(dx) > 100 ? this.face * 0.55 : Math.abs(dx) < 70 ? -this.face * 0.5 : 0;
        this.vx = TC.approach(this.vx, want, 0.05);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dx) < 180) {
          if (st.mayAttack(this)) {
            this.casts++;
            var others = st.enemies.some(function (e) { return e.alive && !e.dying && e.type !== 'foreman' && !e.isBoss; });
            this.state = (others && this.casts % 3 === 2) ? 'whistle' : 'windup'; this.t = 0;
          } else this.cool = TC.rnd.int(20, 45);
        }
        break;
      }
      case 'windup':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(28, D.windup)) {
          this.state = 'throw'; this.t = 0;
          var air = 52;
          st.orbs.push(new Last(this.x + this.face * 8, this.y - 30, (p.x - this.x) / air, -3.4, false, null));
          TC.audio.sfx('swing2');
        }
        break;
      case 'throw':
        if (this.t >= 22) { this.state = 'walk'; this.t = 0; this.cool = frames(90 + TC.rnd.int(0, 60), D.cool); }
        break;
      case 'whistle':
        this.vx = 0;
        if (this.t === 10) {
          TC.audio.sfx('whistle');
          st.floatText(this.x, this.y - 46, TC.t('c4.meta'), '#ffe060');
          st.enemies.forEach(function (e) { if (e.alive && !e.dying && e.hasted != null) { e.hasted = 240; e.cool = Math.min(e.cool || 0, 20); } });
        }
        if (this.t >= 40) { this.state = 'walk'; this.t = 0; this.cool = frames(100 + TC.rnd.int(0, 50), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          if (++this.lieT > 50) { this.state = 'walk'; this.t = 0; this.cool = 30; }
        }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
    E.moveBody(this, st.level);
    if (this.state === 'walk') contact(this, st, 1, false, true);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Foreman.prototype.draw = function (c, cx, cy) {
    var S = art().foreman, img;
    switch (this.state) {
      case 'walk': img = Math.abs(this.vx) > 0.1 ? S.walk[Math.floor(this.t / 9) % 6] : S.idle[Math.floor(this.t / 30) % 2]; break;
      case 'windup': img = S.windup[0]; break;
      case 'throw': img = S.throw[0]; break;
      case 'whistle': img = S.whistle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    drawSprite(c, img, this.x - cx, this.y - cy + 1, this.face, this.flash > 0, this.alpha * 0.9);
  };
  Foreman.prototype.light = function (L, cx, cy) { if (!this.dying) L.add(this.x - cx, this.y - 26 - cy, 26, '#a0b0e0', 0.4 * this.alpha); };

  /* fôrma de madeira arremessada (em arco). Um soco a devolve; devolvida, machuca quem a jogou. */
  function Last(x, y, vx, vy, fromBoss, boss) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.t = 0; this.alive = true;
    this.isOrb = true; this.lastHit = -1; this.returned = false; this.boss = boss; this.fromBoss = fromBoss;
  }
  Last.prototype.hurtBox = function () { return { x: this.x - 8, y: this.y - 7, w: 16, h: 14 }; };
  Last.prototype.hit = function (st, dmg, dir, kb, id) {
    if (id === this.lastHit || this.returned) return false;
    this.lastHit = id;
    TC.audio.sfx('wood');
    st.spark(this.x, this.y, true);
    var tgt = this.boss && this.boss.alive && !this.boss.dying ? this.boss : null;
    if (!tgt) { this.alive = false; return true; }
    this.returned = true;
    var dx = tgt.x - this.x, dy = (tgt.y - 40) - this.y, L = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    this.vx = dx / L * 4.6; this.vy = dy / L * 4.6;
    st.floatText(this.x, this.y - 10, '!', '#ffe060');
    return true;
  };
  Last.prototype.update = function (st) {
    this.t++;
    if (!this.returned) this.vy += 0.13;
    this.x += this.vx; this.y += this.vy;
    var p = st.player;
    if (this.returned) {
      var b = this.boss;
      if (b && b.alive && !b.dying && TC.overlap(this.hurtBox(), b.hurtBox())) { b.takeLast(st, this); this.alive = false; return; }
    } else if (st.mode === 'play' && TC.overlap(this.hurtBox(), p.hurtBox())) {
      if (p.damage(st, 1, this.vx > 0 ? 1 : -1)) { this.alive = false; TC.audio.sfx('wood'); return; }
    }
    if (this.y > GY - 2 && !this.returned) {
      TC.audio.sfx('wood');
      for (var i = 0; i < 6; i++) st.parts.add({ x: this.x, y: GY - 3, vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-2.5, -0.8), ay: 0.15, life: 30, color: TC.rnd.pick(['#b07a44', '#6a4020']), size: 2, fade: true });
      this.alive = false;
    }
    if (this.t > 240 || this.x < st.camX - 40 || this.x > st.camX + W + 40 || this.y < -60) this.alive = false;
  };
  Last.prototype.light = function (L, cx, cy) { if (this.returned) L.add(this.x - cx, this.y - cy, 18, '#ffe080', 0.6); };
  Last.prototype.draw = function (c, cx, cy) {
    var img = TC.rotCached(art().last, this.t * 0.25 * (this.vx < 0 ? -1 : 1), 16);
    c.drawImage(this.returned ? TC.tintCached(img, '#ffe080', 0.4) : img, Math.round(this.x - img.width / 2 - cx), Math.round(this.y - img.height / 2 - cy));
  };

  /* agulha de costura (em leque); um soco quebra */
  function Needle(x, y, vx, vy) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.t = 0; this.alive = true; this.isOrb = true; this.lastHit = -1;
  }
  Needle.prototype.hurtBox = function () { return { x: this.x - 4, y: this.y - 4, w: 8, h: 8 }; };
  Needle.prototype.hit = function (st, dmg, dir, kb, id) { if (id === this.lastHit) return false; this.alive = false; TC.audio.sfx('hit'); st.spark(this.x, this.y); return true; };
  Needle.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.y += this.vy;
    if (this.t > 200 || this.y > GY + 4 || this.x < st.camX - 20 || this.x > st.camX + W + 20) this.alive = false;
    var p = st.player;
    if (st.mode === 'play' && TC.overlap({ x: this.x - 3, y: this.y - 3, w: 6, h: 6 }, p.hurtBox())) { if (p.damage(st, 1, this.vx > 0 ? 1 : -1)) this.alive = false; }
  };
  Needle.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 10, '#d0e0ff', 0.4); };
  Needle.prototype.draw = function (c, cx, cy) {
    var L = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1, ux = this.vx / L, uy = this.vy / L;
    var x = this.x - cx, y = this.y - cy;
    c.fillStyle = '#e8ecf8';
    for (var i = 0; i < 7; i++) c.fillRect(Math.round(x - ux * i), Math.round(y - uy * i), 1, 1);
    c.fillStyle = '#d81818'; c.fillRect(Math.round(x - ux * 8), Math.round(y - uy * 8), 1, 1); c.fillRect(Math.round(x - ux * 9 + uy), Math.round(y - uy * 9 - ux), 1, 1);
  };

  /* a costura: uma linha pontilhada que corre pelo chão e prende os pés de quem estiver em cima */
  function Seam(boss, x, dir, speed) {
    this.boss = boss; this.x0 = x; this.x = x; this.dir = dir; this.speed = speed; this.t = 0; this.alive = true; this.kind = 'seam'; this.stop = false; this.fade = 1;
  }
  Seam.prototype.update = function (st) {
    this.t++;
    var a = this.boss.arena;
    if (!this.stop) {
      this.x += this.dir * this.speed;
      if (this.t % 4 === 0 && Math.abs(this.x - st.camX - 128) < 150) TC.audio.sfx('stitch');
      if (this.x < a.x0 + 6 || this.x > a.x0 + W - 6 || Math.abs(this.x - this.x0) > 236) this.stop = true;
      var p = st.player;
      if (st.mode === 'play' && p.onGround && Math.abs(p.x - this.x) < 8 && p.inv <= 0) {
        if (p.damage(st, 1, this.dir)) {
          st.stitchT = frames(40, TC.diff().windup);
          st.floatText(p.x, p.y - 40, TC.t('c4.stitched'), '#ff9090');
          this.stop = true;
        }
      }
    } else {
      this.fade -= 0.025;
      if (this.fade <= 0) this.alive = false;
    }
    if (!this.boss.alive || this.boss.state === 'dying') this.stop = true;
  };
  Seam.prototype.draw = function (c, cx, cy) {
    var y = GY - 1 - cy, a = Math.min(1, this.fade);
    c.globalAlpha = a;
    var from = Math.min(this.x0, this.x), to = Math.max(this.x0, this.x);
    for (var x = from; x <= to; x += 4) {
      c.fillStyle = '#d81818'; c.fillRect(Math.round(x - cx), y, 2, 1);
      c.fillStyle = '#ff8080'; c.fillRect(Math.round(x - cx), y - 1, 1, 1);
    }
    if (!this.stop) {
      // a agulha que vai costurando
      var hx = Math.round(this.x - cx), bob = (this.t >> 1) % 2 ? -3 : -6;
      c.fillStyle = '#e8ecf8'; c.fillRect(hx, y + bob, 1, 6 - (bob + 3));
      c.fillStyle = '#ffffff'; c.fillRect(hx, y + bob - 1, 1, 1);
    }
    c.globalAlpha = 1;
  };

  /* poça de cola de sapateiro: deixa lento; na segunda metade da luta, uma fagulha põe fogo nela */
  function Glue(x, life, permanent) {
    this.x = x; this.y = GY; this.r = 18; this.t = 0; this.life = life || 600; this.alive = true; this.permanent = !!permanent; this.burn = 0; this.kind = 'glue';
  }
  Glue.prototype.update = function (st) {
    this.t++;
    if (!this.permanent && this.t > this.life) this.alive = false;
    if (this.burn > 0) {
      this.burn--;
      if (this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-this.r, this.r), y: GY - 2, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-1.6, -0.6), life: TC.rnd.int(16, 30), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010'], size: TC.rnd.int(1, 2), fade: true, layer: 1, add: true });
      var p = st.player;
      if (st.mode === 'play' && this.burn % 20 === 0 && p.onGround && Math.abs(p.x - this.x) < this.r) p.damage(st, 1, p.x < this.x ? -1 : 1);
      if (this.burn === 0 && !this.permanent) this.alive = false;
    }
  };
  Glue.prototype.inside = function (p) { return p.onGround && Math.abs(p.x - this.x) < this.r - 2; };
  Glue.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = GY - cy;
    var a = this.permanent ? 1 : Math.min(1, (this.life - this.t) / 60, this.t / 10);
    c.globalAlpha = Math.max(0, a);
    c.fillStyle = '#2a5a1a'; TC.fillEllipse(c, x, y, this.r, 3);
    c.fillStyle = '#5a9a2a'; TC.fillEllipse(c, x - 1, y - 1, this.r - 3, 2);
    c.fillStyle = '#b0e070'; c.fillRect(x - 6 + ((this.t >> 4) % 8), y - 2, 3, 1); c.fillRect(x + 4 - ((this.t >> 5) % 6), y, 2, 1);
    c.globalAlpha = 1;
  };
  Glue.prototype.light = function (L, cx) { L.add(this.x - cx, GY - 4, this.burn > 0 ? 46 : 22, this.burn > 0 ? '#ff9040' : '#80c040', this.burn > 0 ? 1 : 0.45); };

  /* ================= O COURO (mini-chefe do curtume) =================
     Sai do tanque de tanino e voa feito arraia: rasante, mergulho de cima (sair da sombra!) e o abraço —
     se pegar o Arno, enrola: soque/aperte várias vezes para se soltar. */
  function Couro(x, y, opt) {
    base(this, 'couro', x, y);
    this.w = 56; this.h = 20;
    this.hp = this.maxHp = Math.max(12, Math.round(TC.diff().bossHp * 0.7));
    this.name = 'en.couro';
    this.score = 3000;
    this.state = 'rise'; this.alpha = 0;
    this.baseY = GY - 4;
    this.hy = 120;
    this.attacks = 0;
    this.miniBoss = true;
    this.isBoss = true;   // a barra fica só embaixo (e ela nunca chama onBossDead)
    this.bar = { name: '#f0c8a0', back: '#200c04', fill: '#a05a2a', hi: '#f0b070' };
    this.y = GY + 10;
  }
  Couro.prototype.attacking = function () { var s = this.state; return s === 'swoopPrep' || s === 'swoop' || s === 'diveUp' || s === 'diveTrack' || s === 'drop' || s === 'wrap'; };
  Couro.prototype.set = function (s) { this.state = s; this.t = 0; };
  Couro.prototype.hurtBox = function () {
    if (this.state === 'flat') return { x: this.x - 34, y: this.y - 10, w: 68, h: 12 };
    return { x: this.x - 30, y: this.y - 16, w: 60, h: 26 };
  };
  Couro.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'rise' || this.state === 'wrap' || this.state === 'diveUp' || this.state === 'diveTrack') return false;
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) { TC.audio.sfx(atk.heavy ? 'hit2' : 'hit'); TC.audio.sfx('hideflap'); if (this.state === 'glide') this.vx += dir * 0.8; }
    return ok;
  };
  Couro.prototype.die = function (st) {
    this.set('dead');
    st.addScore(this.score);
    TC.audio.sfx('hideflap'); TC.audio.sfx('ghostDie');
    if (st.player.state === 'cine' && this.holding) { st.player.setState('normal'); st.player.inv = 60; }
    this.holding = false;
  };
  Couro.prototype.L = function () { return this.arena ? this.arena.x0 + 40 : st0().camX + 40; };
  Couro.prototype.botJump = function (p) {
    // pula o rasante baixo
    return this.state === 'swoop' && p.onGround && Math.abs(p.x - this.x) < 70 && (p.x - this.x) * Math.sign(this.vx) > 0 && this.y > GY - 40;
  };
  Couro.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff(), play = st.mode === 'play';
    var ax0 = st.arena ? st.arena.x0 : st.camX;
    var Lx = ax0 + 30, Rx = ax0 + W - 30;
    var spd = (this.hp < this.maxHp * 0.5 ? 1.15 : 1) * D.speed;
    switch (this.state) {
      case 'rise':
        this.alpha = Math.min(1, this.alpha + 0.02);
        this.y = TC.lerp(GY + 10, this.hy, TC.ease.outCubic(Math.min(1, t / 90)));
        if (t % 6 === 0) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y + 10, vy: 1.4, ay: 0.1, life: 30, color: '#7a3a1c', size: 2 });
        if (t === 1) TC.audio.sfx('hideflap');
        if (t > 100) this.set('glide');
        break;
      case 'glide': {
        var tx = p.x + Math.sin(t * 0.02) * 70;
        this.vx = TC.approach(this.vx, TC.clamp((tx - this.x) * 0.02, -1.4, 1.4) * spd, 0.04);
        this.x += this.vx;
        this.y += (this.hy + Math.sin(t * 0.05) * 14 - this.y) * 0.06;
        if (t % 40 === 0) TC.audio.sfx('hideflap');
        if (t > frames(80, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks;
          this.set(n % 3 === 0 ? 'diveUp' : 'swoopPrep');
        }
        break;
      }
      case 'swoopPrep':
        if (t === 1) { this.side = p.x < ax0 + W / 2 ? 1 : -1; TC.audio.sfx('growl'); }
        this.x += ((this.side > 0 ? Rx : Lx) - this.x) * 0.06;
        this.y += (this.hy - 10 - this.y) * 0.08;
        if (t > frames(40, D.windup)) { this.set('swoop'); this.vx = -this.side * 3.2 * spd; TC.audio.sfx('whoosh'); }
        break;
      case 'swoop':
        // rasante: desce até a altura do peito e varre a arena
        this.x += this.vx;
        this.y += (GY - 20 - this.y) * 0.12;
        if (play && !this.holding && TC.overlap(this.hurtBox(), p.hurtBox()) && p.inv <= 0 && p.state !== 'down' && p.state !== 'dead') {
          // enrolou o Arno
          if (p.damage(st, 1, Math.sign(this.vx))) {
            this.holding = true; this.set('wrap'); this.mash = 0; this.need = { easy: 4, normal: 6, hard: 8 }[TC.opts.diff] || 6;
            p.setState('cine'); p.pose = 'kneel'; p.vx = 0;
            TC.audio.sfx('hideflap');
          }
        }
        if (this.state === 'swoop' && ((this.vx > 0 && this.x > Rx + 10) || (this.vx < 0 && this.x < Lx - 10))) this.set('glide');
        break;
      case 'wrap':
        // enrolado: o Arno se debate (ataque, pulo ou o piloto automático)
        this.x += (p.x - this.x) * 0.3; this.y += (p.y - 12 - this.y) * 0.3;
        p.x = TC.clamp(p.x, Lx - 20, Rx + 20);
        if (t % 50 === 25) { p.hp = Math.max(0.25, p.hp - 0.25 * D.dmg); TC.audio.sfx('hurt'); }
        if (TC.input.pressed('attack') || TC.input.pressed('jump') || (TC.params.bot && t % 8 === 0)) {
          this.mash++; if (this.mash % 2) this.flash = 2; TC.fx.shake(1, 4); TC.audio.sfx('hit');
          if (this.mash % 2 === 0) st.floatText(p.x, p.y - 44, TC.t('c4.wrap'), '#ffe0a0');
        }
        if (this.mash >= this.need || t > 600) {
          this.holding = false;
          p.setState('normal'); p.inv = 70; p.vy = -2;
          this.set('stunned'); this.vy = -1; this.vx = (this.x < p.x ? -1 : 1) * 1.5;
          TC.audio.sfx('hit2'); st.spark(this.x, this.y, true);
        }
        break;
      case 'stunned':
        // tonto e baixinho: é a hora de bater
        this.x += this.vx; this.vx *= 0.94;
        this.y += (GY - 14 - this.y) * 0.1;
        if (t % 16 === 0) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 20, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(120, D.cool)) this.set('glide');
        break;
      case 'diveUp':
        this.y -= 3.2;
        if (this.y < -40) { this.set('diveTrack'); }
        break;
      case 'diveTrack':
        this.x += (TC.clamp(p.x, Lx, Rx) - this.x) * (t < frames(70, 1) ? 0.08 : 0);
        if (t > frames(70, 1) + frames(26, D.windup)) { this.set('drop'); this.vy = 3; TC.audio.sfx('whoosh'); }
        break;
      case 'drop':
        this.vy = Math.min(9, this.vy + 0.5);
        this.y += this.vy;
        if (this.y >= GY - 4) {
          this.y = GY - 4; this.set('flat');
          TC.fx.shake(3, 12); TC.audio.sfx('hideflap'); TC.audio.sfx('land');
          st.dust(this.x - 24, GY); st.dust(this.x + 24, GY);
          if (play && p.onGround && Math.abs(p.x - this.x) < 34 && p.state !== 'cine') p.damage(st, 2, p.x < this.x ? -1 : 1, true);
        }
        break;
      case 'flat':
        // estendido no chão, vulnerável
        if (t > frames(110, D.cool)) { this.set('glide'); this.y = GY - 4; }
        break;
      case 'dead':
        this.y += 1.2; this.alpha -= 0.012;
        if (t % 4 === 0) st.parts.add({ x: this.x + TC.rnd.range(-30, 30), y: this.y, vy: -0.6, life: 40, colors: ['#8a5232', '#4a2414', '#2a140a'], size: 2, fade: true });
        if (this.alpha <= 0 || t > 120) { this.alive = false; this.dying = true; st.kill(this); }
        break;
    }
    this.x = TC.clamp(this.x, ax0 + 10, ax0 + W - 10);
    if (this.state === 'swoop' && !this.holding) contact(this, st, 1);
    else if (this.state === 'glide') contact(this, st, 1, false, true);
  };
  Couro.prototype.draw = function (c, cx, cy) {
    var S = art().couro, img;
    if (this.state === 'wrap' || this.state === 'stunned') img = S.wrap[(this.t >> 3) % 2];
    else if (this.state === 'swoopPrep' || this.state === 'drop' || this.state === 'swoop') img = this.state === 'swoopPrep' && (this.t >> 2) % 2 ? S.dive[0] : S.fly[Math.floor(this.t / 3) % 6];
    else if (this.state === 'flat') img = S.dive[0];
    else img = S.fly[Math.floor(this.t / 6) % 6];
    var face = this.vx < -0.1 ? -1 : this.vx > 0.1 ? 1 : (this.face || 1);
    if (Math.abs(this.vx) > 0.1) this.face = face;
    // sombra do mergulho
    if (this.state === 'diveTrack' || this.state === 'drop') {
      var k = Math.min(1, this.t / 20);
      c.fillStyle = 'rgba(80,30,10,' + (0.3 + 0.2 * Math.sin(this.t * 0.4)).toFixed(2) + ')';
      TC.fillEllipse(c, Math.round(this.x - cx), GY - 1 - cy, Math.round(34 * k), 3);
    }
    if (this.state === 'diveTrack') return;
    drawSprite(c, img, this.x - cx, this.y - cy, face, this.flash > 0, this.alpha);
  };
  Couro.prototype.light = function (L, cx, cy) { L.add(this.x + (this.face || 1) * 34 - cx, this.y - 6 - cy, 20, '#ffd030', 0.6 * this.alpha); };
  function st0() { return TC.game.scene; }

  /* ================= A MOÇA DO SERÃO (chefe) ================= */
  function Hilde(x, y, opt) {
    base(this, 'hilde', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.w = 24; this.h = 74;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.5);
    this.name = 'boss4.name';
    this.isBoss = true;
    this.score = 12000;
    this.state = 'intro';
    this.pose = 'sew';
    this.attacks = 0;
    this.stagger = 0;
    this.projs = [];
    this.shield = false; this.shieldT = 0;
    this.bar = { name: '#ffd0e0', back: '#200814', fill: '#e05080', hi: '#ffa0c0' };
    this.gy = GY - 4;
  }
  Hilde.prototype.set = function (s) { this.state = s; this.t = 0; };
  Hilde.prototype.phase2 = function () { return this.hp <= this.maxHp * 0.5; };
  Hilde.prototype.L = function () { return this.arena.x0 + 30; };
  Hilde.prototype.R = function () { return this.arena.x0 + W - 30; };
  Hilde.prototype.attacking = function () {
    var s = this.state;
    return s === 'seamPrep' || s === 'needlePrep' || s === 'lastPrep' || s === 'spoolUp' || s === 'spoolTrack' || s === 'drop' || s === 'gluePrep' || s === 'ignite';
  };
  Hilde.prototype.hurtBox = function () {
    if (this.state === 'spoolUp' || this.state === 'spoolTrack') return { x: this.x - 1, y: -200, w: 2, h: 2 };
    return { x: this.x - 12, y: this.y - 78, w: 24, h: 74 };
  };
  Hilde.prototype.doorsLeft = function () { var L = TC.game.scene && TC.game.scene.level; return L && L.doors ? L.doors.filter(function (d) { return !d.open; }).length : 0; };
  Hilde.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'intro' || this.state === 'dying' || this.state === 'downed' || this.state === 'burnTrans') return false;
    if (this.state === 'spoolUp' || this.state === 'spoolTrack') return false;
    if (this.shield) {
      if (id === this.lastHit) return false;
      this.lastHit = id;
      TC.audio.sfx('flame');
      for (var i = 0; i < 5; i++) st.parts.add({ x: this.x - dir * 10, y: this.y - TC.rnd.range(20, 60), vx: -dir * TC.rnd.range(0.5, 2), vy: TC.rnd.range(-1.5, 0), life: 20, colors: ['#ffe080', '#ff9030', '#c03010'], size: 2, fade: true, layer: 1, add: true });
      return false;
    }
    var ok = genericHit(this, st, d, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      this.stagger += d;
      if (this.stagger >= 12 && this.state === 'hover') { this.stagger = 0; this.set('stagger'); this.vx = dir * 1.6; }
    }
    return ok;
  };
  // a fôrma devolvida acerta em cheio (atravessa até o fogo)
  Hilde.prototype.takeLast = function (st, lst) {
    if (this.state === 'dying' || this.state === 'downed' || this.state === 'burnTrans') return;
    this.hp -= 4; this.flash = 8;
    TC.audio.sfx('hit2'); TC.fx.shake(3, 10);
    st.spark(lst.x, lst.y, true);
    st.showEnemyBar(this);
    st.addScore(300);
    if (this.hp <= 0) { this.hp = 0; this.die(st); return; }
    if (this.state === 'hover' || this.state === 'recover') { this.set('stagger'); this.vx = (this.x < st.player.x ? -1 : 1) * 1.8; }
  };
  Hilde.prototype.die = function (st) {
    this.set('dying'); this.hp = 0; this.shield = false;
    TC.audio.stopMusic(0.3);
    st.killAllMinions();
    this.projs.forEach(function (pj) { pj.alive = false; });
    if (st.glue) st.glue.forEach(function (g) { if (!g.permanent) g.alive = false; });
  };
  Hilde.prototype.onDoor = function (st) {
    var left = this.doorsLeft();
    this.shield = false;
    this.shieldT = left > 0 ? frames({ easy: 600, normal: 460, hard: 330 }[TC.opts.diff] || 460, 1) : 0;
    if (this.state === 'hover' || this.state === 'recover' || this.state === 'needlePrep' || this.state === 'lastPrep') { this.set('stagger'); this.vx = 0; }
    TC.audio.sfx('ghost');
    st.floatText(this.x, this.y - 90, TC.t('c4.door'), '#c8e0ff');
  };
  Hilde.prototype.botJump = function (p) {
    if (!p.onGround) return false;
    for (var i = 0; i < this.projs.length; i++) {
      var pj = this.projs[i];
      if (pj.kind === 'seam' && pj.alive && !pj.stop && (p.x - pj.x) * pj.dir > 0 && Math.abs(p.x - pj.x) < 40) return true;
    }
    return false;
  };
  Hilde.prototype.hand = function () { return { x: this.x + this.face * 22, y: this.y - 54 }; };
  Hilde.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff(), play = st.mode === 'play';
    var dx = p.x - this.x;
    var spd = (this.phase2() ? 1.2 : 1) * D.speed;
    this.projs = this.projs.filter(function (pj) { return pj.alive; });
    // metade da energia: o incêndio de 1967 volta
    if (!this.p2 && this.phase2() && this.state !== 'dying' && this.state !== 'downed') {
      this.p2 = true;
      this.set('burnTrans');
    }
    // o escudo de fogo volta se ainda tiver porta trancada
    if (this.p2 && !this.shield && this.shieldT > 0 && this.state !== 'dying' && this.state !== 'downed') {
      if (--this.shieldT <= 0 && this.doorsLeft() > 0) { this.shield = true; TC.audio.sfx('fireburst'); st.floatText(this.x, this.y - 90, TC.t('c4.shield'), '#ffb070'); }
    }
    if (this.shield && t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-14, 14), y: this.y - TC.rnd.range(0, 70), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.6, -0.6), life: TC.rnd.int(14, 26), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
    var bob = Math.sin(t * 0.06) * 3;
    switch (this.state) {
      case 'intro':
        this.face = dx < 0 ? -1 : 1;
        if (t % 6 === 0) TC.audio.sfx('stitch');
        break;
      case 'hover': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * 96, this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx || 0, Math.abs(gap) > 8 ? Math.sign(gap) * 1.0 * spd : 0, 0.06);
        this.x += this.vx;
        this.y += (this.gy + bob - this.y) * 0.1;
        if (t > frames(this.phase2() ? 50 : 72, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks, close = Math.abs(dx) < 56;
          var glue = st.glue ? st.glue.filter(function (g) { return !g.permanent && g.alive && !g.burn; }).length : 0;
          if (this.phase2() && glue > 0 && n % 3 === 0) this.set('ignite');
          else if (close) this.set(n % 2 ? 'spoolUp' : 'needlePrep');
          else this.set(['seamPrep', 'needlePrep', 'lastPrep', 'gluePrep', 'spoolUp', 'lastPrep'][n % 6]);
        }
        break;
      }
      case 'seamPrep':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        if (t === 1) TC.audio.sfx('thread');
        if (t > frames(34, D.windup)) {
          var sm = new Seam(this, this.x + this.face * 20, this.face, 2.7 * spd);
          this.projs.push(sm); st.deco.push(sm);
          this.set('recover');
        }
        break;
      case 'needlePrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('needle');
        if (t > frames(30, D.windup)) {
          var h = this.hand(), nn = D.attackers <= 1 ? 3 : 5;
          var base0 = Math.atan2((p.y - 16) - h.y, p.x - h.x);
          for (var i = 0; i < nn; i++) {
            var a = base0 + (i - (nn - 1) / 2) * 0.24;
            st.orbs.push(new Needle(h.x, h.y, Math.cos(a) * 2.6 * D.speed, Math.sin(a) * 2.6 * D.speed));
          }
          TC.audio.sfx('needle');
          this.set('recover');
        }
        break;
      case 'lastPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t > frames(26, D.windup)) {
          var hh = this.hand(), air = 56;
          var ls = new Last(hh.x, hh.y, (p.x - hh.x) / air, -3.6, true, this);
          st.orbs.push(ls);
          TC.audio.sfx('swing2');
          if (!this.lastHinted) { this.lastHinted = true; st.hint = { key: 'hint.boss4', t: 300 }; }
          this.set('recover');
        }
        break;
      case 'spoolUp':
        // sobe pela linha até sumir no teto
        this.y -= 3.4;
        if (t === 1) TC.audio.sfx('thread');
        if (this.y < -60) { this.set('spoolTrack'); this.sx = p.x; }
        break;
      case 'spoolTrack':
        if (t < frames(70, 1)) this.sx += (TC.clamp(p.x, this.L(), this.R()) - this.sx) * 0.07;
        if (t > frames(70, 1) + frames(26, D.windup)) { this.set('drop'); this.x = this.sx; this.vy = 4; TC.audio.sfx('whoosh'); }
        break;
      case 'drop':
        this.vy = Math.min(10, this.vy + 0.6);
        this.y += this.vy;
        if (this.y >= this.gy) {
          this.y = this.gy;
          TC.fx.shake(4, 14); TC.audio.sfx('hit2'); TC.audio.sfx('land');
          st.dust(this.x - 16, GY); st.dust(this.x + 16, GY);
          if (play && p.onGround && Math.abs(p.x - this.x) < 24) p.damage(st, 2, p.x < this.x ? -1 : 1, true);
          this.set('landed');
        }
        break;
      case 'landed':
        if (t > frames(56, D.cool)) this.set('hover');
        break;
      case 'gluePrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('squish');
        if (t === frames(28, D.windup)) {
          // três bolotas de cola que viram poças
          var xs = [p.x - 56, p.x, p.x + 56];
          var self = this;
          xs.forEach(function (gx, k) {
            gx = TC.clamp(gx, self.L() - 14, self.R() + 14);
            st.deco.push(new Glob(self.hand().x, self.hand().y, gx, 30 + k * 6, st));
          });
          TC.audio.sfx('squish');
        }
        if (t > frames(28, D.windup) + 20) this.set('recover');
        break;
      case 'ignite': {
        // uma fagulha voa até as poças de cola
        if (t === 1) { TC.audio.sfx('fireburst'); }
        if (t === frames(30, D.windup)) {
          var gs = st.glue ? st.glue.filter(function (g) { return !g.permanent && g.alive && !g.burn; }) : [];
          gs.forEach(function (g) { g.burn = 100; g.life = Math.max(g.life, g.t + 110); });
          TC.audio.sfx('fireburst');
        }
        if (t > frames(30, D.windup) + 20) this.set('recover');
        break;
      }
      case 'recover':
        this.y += (this.gy + bob - this.y) * 0.1;
        if (t > frames(32, D.cool)) this.set('hover');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        this.y += (this.gy + bob - this.y) * 0.1;
        if (t > 50) this.set('hover');
        break;
      case 'burnTrans':
        // o fogo de 67: grita, as portas batem e trancam, o fogo a envolve
        this.vx = 0;
        this.y += (this.gy - 6 - this.y) * 0.1;
        if (t === 1) { TC.audio.stopMusic(0.3); TC.audio.sfx('fireburst'); TC.fx.flash('#ff6020', 0.5, 0.02); st.floatText(this.x, this.y - 96, TC.t('c4.fire'), '#ffb070'); }
        if (t === 30 || t === 50 || t === 70) { TC.audio.sfx('doorslam'); TC.fx.shake(4, 14); }
        if (t === 90) { this.shield = true; TC.audio.music('boss4b', 0.2); st.hint = { key: 'hint.doors', t: 420 }; }
        if (t > 110) this.set('hover');
        break;
      case 'dying':
        this.shield = false;
        this.y += (GY - 2 - this.y) * 0.05;
        if (t % 8 === 0) {
          for (var q = 0; q < 4; q++) st.parts.add({ x: this.x + TC.rnd.range(-14, 14), y: this.y - TC.rnd.range(0, 60), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.2, -0.3), life: 40, colors: ['#ffffff', '#c8d4ff', '#6a74a0'], size: TC.rnd.int(1, 3), fade: true });
          this.flash = 2;
        }
        if (t === 120) { this.set('downed'); this.dying = true; st.addScore(this.score); st.onBossDead(this); }
        break;
      case 'downed':
        break;
    }
    if (this.state !== 'drop' && this.state !== 'spoolTrack' && this.state !== 'spoolUp') this.x = TC.clamp(this.x, this.arena.x0 + 14, this.arena.x0 + W - 14);
    if (this.state === 'hover' && !this.shield) contact(this, st, 1, false, true);
    if (this.shield && st.mode === 'play' && TC.overlap({ x: this.x - 10, y: this.y - 70, w: 20, h: 66 }, p.hurtBox()) && t % 30 === 0) p.damage(st, 1, p.x < this.x ? -1 : 1);
  };
  Hilde.prototype.frame = function () {
    var S = art().hilde, t = this.t;
    switch (this.state) {
      case 'intro': return S.sew[(t >> 3) % 2];
      case 'seamPrep': return S.point[0];
      case 'needlePrep': case 'lastPrep': return t < 18 ? S.raise[0] : S.throw[0];
      case 'gluePrep': return S.spit[0];
      case 'ignite': return S.raise[0];
      case 'spoolUp': case 'drop': return S.raise[0];
      case 'landed': return t < 30 ? S.kneel[0] : S.float[0];
      case 'stagger': return S.hurt[0];
      case 'burnTrans': return S.burn[(t >> 3) % 2];
      case 'dying': case 'downed': return S.kneel[0];
    }
    return this.shield ? S.burn[(t >> 4) % 2] : S.float[(t >> 5) % 2];
  };
  Hilde.prototype.draw = function (c, cx, cy) {
    // sombra do carretel (onde ela vai cair)
    if (this.state === 'spoolTrack' || this.state === 'drop') {
      var sx = this.state === 'drop' ? this.x : this.sx, k = Math.min(1, this.t / 20);
      c.fillStyle = 'rgba(200,40,60,' + (0.3 + 0.2 * Math.sin(this.t * 0.4)).toFixed(2) + ')';
      TC.fillEllipse(c, Math.round(sx - cx), GY - 1 - cy, Math.round(18 * k), 3);
      // a linha descendo do teto
      c.fillStyle = 'rgba(216,24,24,0.7)';
      if (this.state === 'drop') c.fillRect(Math.round(this.x - cx), 0, 1, Math.max(0, Math.round(this.y - 80 - cy)));
      if (this.state === 'spoolTrack') return;
    }
    if (this.state === 'spoolUp') { c.fillStyle = 'rgba(216,24,24,0.7)'; c.fillRect(Math.round(this.x - cx), 0, 1, Math.max(0, Math.round(this.y - 80 - cy))); }
    var img = this.frame();
    var shake = this.state === 'burnTrans' || this.state === 'dying' ? TC.rnd.int(-1, 1) : ((this.state === 'seamPrep' || this.state === 'needlePrep') && this.t > 14 ? ((this.t >> 1) % 2 ? 1 : -1) : 0);
    var a = 0.82 + Math.sin(this.t * 0.12) * 0.08;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha * a);
    // brilho das agulhas antes de atirar
    if ((this.state === 'needlePrep' || this.state === 'seamPrep') && (this.t >> 2) % 2) {
      var h = this.hand();
      c.fillStyle = '#ffffff'; c.fillRect(Math.round(h.x - cx), Math.round(h.y - cy) - 2, 1, 5); c.fillRect(Math.round(h.x - cx) - 2, Math.round(h.y - cy), 5, 1);
    }
  };
  Hilde.prototype.light = function (L, cx, cy) {
    L.add(this.x - cx, this.y - 50 - cy, 70, '#a8b8ff', 0.55);
    if (this.shield || this.state === 'burnTrans') L.add(this.x - cx, this.y - 40 - cy, 90 + Math.sin(this.t * 0.3) * 6, '#ff8030', 1.1);
  };
  Hilde.prototype.glow = function (c, cx, cy) {
    if (this.shield) TC.Lighting.glow(c, this.x - cx, this.y - 40 - cy, 30, '#ff7020', 0.35);
  };

  /* bolota de cola voando em arco até virar poça */
  function Glob(x, y, tx, airT, st) {
    this.x = x; this.y = y; this.t = 0; this.alive = true; this.air = airT; this.tx = tx;
    this.vx = (tx - x) / airT; this.vy = -3; this.g = 2 * ((GY - 2) - y - this.vy * airT) / (airT * airT);
  }
  Glob.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.vy += this.g; this.y += this.vy;
    if (this.t >= this.air) {
      this.alive = false;
      st.glue = st.glue || [];
      var g = new Glue(this.tx, frames(520, 1), false);
      st.glue.push(g); st.deco.push(g);
      TC.audio.sfx('squish');
      if (!st.glueHinted) { st.glueHinted = true; st.hint = { key: 'hint.glue', t: 240 }; }
    }
  };
  Glob.prototype.draw = function (c, cx, cy) { c.fillStyle = '#6aaa3a'; TC.fillCircle(c, this.x - cx, this.y - cy, 3); c.fillStyle = '#c0f080'; c.fillRect(Math.round(this.x - cx) - 1, Math.round(this.y - cy) - 2, 1, 1); };

  /* ================= CENÁRIO ANIMADO ================= */
  /* balancim: a prensa de corte desce de tempos em tempos (aviso: luz vermelha e tremida) */
  function Press(x, offset) { this.x = x; this.t = offset || 0; this.alive = true; this.state = 'idle'; this.st = 0; this.headY = 0; }
  Press.prototype.cycle = function () { var D = TC.diff(); return { idle: frames(110, D.cool), warn: frames(40, D.windup), slam: 6, hold: 26, rise: 40 }; };
  Press.prototype.danger = function () { return this.state === 'warn' || this.state === 'slam' || this.state === 'hold'; };
  Press.prototype.update = function (st) {
    this.t++; this.st++;
    var C = this.cycle(), near = Math.abs(this.x - st.camX - 128) < 180;
    switch (this.state) {
      case 'idle': this.headY = 0; if (this.st > C.idle) { this.state = 'warn'; this.st = 0; } break;
      case 'warn': if (this.st > C.warn) { this.state = 'slam'; this.st = 0; } break;
      case 'slam':
        this.headY = Math.min(1, this.st / C.slam);
        if (this.st === C.slam) {
          if (near) { TC.audio.sfx('press'); TC.fx.shake(2, 8); }
          var p = st.player;
          if (st.mode === 'play' && Math.abs(p.x - this.x) < 18) p.damage(st, 2, p.x < this.x ? -1 : 1, true);
          st.enemies.forEach(function (e) { if (e.alive && !e.dying && !e.isBoss && e.y >= GY - 2 && Math.abs(e.x - this.x) < 16 && e.hp != null) { e.hp = 0; e.die(st, 1); } }, this);
          if (near) for (var i = 0; i < 6; i++) st.parts.add({ x: this.x + TC.rnd.range(-16, 16), y: GY - 4, vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-2, -0.5), ay: 0.15, life: 20, color: '#ffe0a0', size: 1, layer: 1 });
        }
        if (this.st > C.slam) { this.state = 'hold'; this.st = 0; }
        break;
      case 'hold': this.headY = 1; if (this.st > C.hold) { this.state = 'rise'; this.st = 0; } break;
      case 'rise': this.headY = 1 - this.st / C.rise; if (this.st > C.rise) { this.state = 'idle'; this.st = 0; } break;
    }
  };
  Press.prototype.draw = function (c, cx) {
    var x = Math.round(this.x - cx);
    if (x < -40 || x > W + 40) return;
    var fr = this.frameCv || (this.frameCv = TC.ART.ch4.pressFrame());
    c.drawImage(fr, x - 24, GY - 120 - 40 + 40);
    var head = art().pressHeadImg;
    var top = GY - 112, bottom = GY - 22;
    var hy = Math.round(top + (bottom - top) * this.headY) + (this.state === 'warn' ? ((this.st >> 1) % 2) : 0);
    c.fillStyle = '#8a8a96'; c.fillRect(x - 2, GY - 120, 4, Math.max(0, hy - (GY - 120)));   // pistão
    c.drawImage(head, x - 18, hy);
  };
  Press.prototype.light = function (L, cx) {
    if (this.state === 'warn') L.add(this.x - cx, GY - 118, 26, '#ff3020', (this.st >> 2) % 2 ? 1 : 0.4);
  };

  /* esteira rolante: o chão anda (empurra o Arno e os sapatos) */
  function Conveyor(x0, x1, speed) { this.x0 = x0; this.x1 = x1; this.speed = speed; this.t = 0; this.alive = true; }
  Conveyor.prototype.on = function (b) { return b.onGround && b.y >= GY - 1 && b.y <= GY + 1 && b.x > this.x0 && b.x < this.x1; };
  Conveyor.prototype.update = function (st) {
    this.t++;
    var p = st.player, L = st.level, self = this;
    if (this.on(p) && p.state !== 'cine' && p.state !== 'dead') p.x = TC.clamp(p.x + this.speed, L.minX + 6, L.maxX - 6);
    st.enemies.forEach(function (e) { if (!e.dying && !e.isBoss && self.on(e)) e.x = TC.clamp(e.x + self.speed, L.minX + 8, L.maxX - 8); });
    if (this.t % 30 === 0 && Math.abs((this.x0 + this.x1) / 2 - st.camX - 128) < 200) TC.audio.sfx('step');
  };
  Conveyor.prototype.draw = function (c, cx) {
    var a = Math.round(this.x0 - cx), b = Math.round(this.x1 - cx);
    if (b < -10 || a > W + 10) return;
    c.fillStyle = '#26262c'; c.fillRect(a, GY - 3, b - a, 5);
    c.fillStyle = '#4a4a54'; c.fillRect(a, GY - 3, b - a, 1);
    var off = Math.round(this.t * this.speed) % 8;
    c.fillStyle = '#8a8a96';
    for (var x = a - 8 + ((off + 8) % 8); x < b; x += 8) if (x >= a) { c.fillRect(x, GY - 2, 2, 1); c.fillRect(x + (this.speed > 0 ? 1 : -1), GY - 1, 2, 1); c.fillRect(x, GY, 2, 1); }
    c.fillStyle = '#5a5a66'; c.fillRect(a, GY + 2, b - a, 1);
    c.fillStyle = '#d8b030';
    var arr = this.speed > 0 ? '▶' : '◀';
    if ((this.t >> 4) % 2) TC.font.draw(c, arr, (a + b) / 2, GY + 5, '#d8b030', { align: 'center' });
    // os rolos das pontas
    c.fillStyle = '#5a5a66'; TC.fillCircle(c, a, GY, 3); TC.fillCircle(c, b, GY, 3);
  };

  /* o fulão girando */
  function Drum(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; }
  Drum.prototype.update = function (st) { this.t++; if (this.t % 90 === 0 && Math.abs(this.x - st.camX - 128) < 180) TC.audio.sfx('wood'); };
  Drum.prototype.draw = function (c, cx) {
    var x = this.x - cx;
    if (x < -60 || x > W + 60) return;
    var fr = this.fr || (this.fr = TC.ART.ch4.drumFrame());
    c.drawImage(fr, Math.round(x - 42), Math.round(this.y - 30));
    TC.drawRot(c, art().drumImg, x, this.y, this.t * 0.015, 96);
  };

  /* mulher sonâmbula atravessando a vila (decoração; some na neblina e recomeça) */
  function Sleeper(x0, x1, y, k, phase) {
    this.x0 = x0; this.x1 = x1; this.x = x0 + (x1 - x0) * (phase || 0); this.y = y; this.k = k; this.t = TC.rnd.int(0, 100); this.alive = true; this.alpha = 0; this.speed = 0.32 + TC.rnd() * 0.08;
  }
  Sleeper.prototype.update = function () {
    this.t++;
    this.x += this.speed;
    var near0 = (this.x - this.x0) / 60, near1 = (this.x1 - this.x) / 60;
    this.alpha = TC.clamp(Math.min(near0, near1), 0, 0.85);
    if (this.x > this.x1) this.x = this.x0;
  };
  Sleeper.prototype.draw = function (c, cx, cy) {
    if (this.x - cx < -40 || this.x - cx > W + 40) return;
    var set = TC.ART.castInit().sleepers[this.k % 4];
    TC.ART.drawCast(c, set, 'walk', this.x - cx, this.y - cy, 1, this.t, this.t, this.alpha);
  };

  /* costureira sonâmbula na máquina de pesponto (decoração) */
  function Seamstress(x, k, face) { this.x = x; this.k = k; this.face = face || 1; this.t = TC.rnd.int(0, 60); this.alive = true; this.awake = false; }
  Seamstress.prototype.update = function (st) {
    this.t++;
    if (!this.awake && this.t % 50 === 0 && Math.abs(this.x - st.camX - 128) < 140 && TC.rnd() < 0.3) TC.audio.sfx('stitch');
  };
  Seamstress.prototype.draw = function (c, cx, cy) {
    var x = this.x - cx;
    if (x < -50 || x > W + 50) return;
    var m = this.mcv || (this.mcv = TC.ART.ch4.machine());
    var set = TC.ART.castInit().sleepers[this.k % 4];
    TC.ART.drawCast(c, set, this.awake ? 'awake' : 'sew', x - this.face * 22, GY - cy, this.face, this.t * 2, 0, 0.92, ['#b8c8ff', 0.3]);
    c.drawImage(this.face > 0 ? m : TC.flip(m), Math.round(x - 20), GY - 40 - cy);
  };

  /* relógio de ponto: o ponto de retorno do capítulo 4 */
  function TimeClock(x, cp) { this.x = x; this.cp = cp; this.lit = false; this.t = 0; this.alive = true; }
  TimeClock.prototype.update = function (st) {
    this.t++;
    var p = st.player;
    if (!this.lit && st.mode === 'play' && Math.abs(p.x - this.x) < 14) {
      this.lit = true;
      TC.audio.sfx('checkpoint'); TC.audio.sfx('tick');
      if (this.cp > st.cp) { st.cp = this.cp; st.save(); }
      st.floatText(this.x, 130, TC.t('c4.punch'), '#a0ffa0');
      p.hp = Math.min(p.maxHp, p.hp + 2);
      for (var k = 0; k < 10; k++) st.parts.add({ x: this.x, y: 156, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.5, -0.3), life: 40, color: '#a0ffa0', size: 1, layer: 1, fade: true });
    }
  };
  TimeClock.prototype.draw = function (c, cx, cy) {
    var x = this.x - cx;
    if (x < -30 || x > W + 30) return;
    var img = this.lit ? art().clockOn : art().clockOff;
    c.drawImage(img, Math.round(x - 10), GY + 1 - img.height - cy);
  };
  TimeClock.prototype.light = function (L, cx) { if (this.lit) L.add(this.x - cx + 4, GY - 26, 18, '#80ff80', 0.6); };

  /* estrela de neon que pisca (o letreiro da Morgenstern) */
  function NeonStar(x, y, big) { this.x = x; this.y = y; this.big = big; this.t = 0; this.alive = true; this.on = 1; this.dead = false; }
  NeonStar.prototype.update = function (st) {
    this.t++;
    var h = TC.hash2(this.t >> 3, 5, 9);
    this.on = this.dead ? 0 : h > 0.9 ? 0.15 : h > 0.84 ? 0.6 : 1;
    if (this.on < 1 && this.t % 8 === 0 && Math.abs(this.x - st.camX - 128) < 140) TC.audio.sfx('neon');
  };
  NeonStar.prototype.draw = function (c, cx, cy) {
    var img = this.big ? art().starBig : art().star;
    c.globalAlpha = 0.25 + this.on * 0.75;
    c.drawImage(img, Math.round(this.x - img.width / 2 - cx), Math.round(this.y - img.height / 2 - cy));
    c.globalAlpha = 1;
  };
  NeonStar.prototype.light = function (L, cx, cy) { if (this.on > 0.2) L.add(this.x - cx, this.y - cy, this.big ? 60 : 40, '#ff60c0', this.on * 0.9); };

  TC.ENEMIES.shoes = Shoes;
  TC.ENEMIES.clog = Clog;
  TC.ENEMIES.boot = Boot;
  TC.ENEMIES.foreman = Foreman;
  TC.ENEMIES.couro = Couro;
  TC.ENEMIES.hilde = Hilde;
  TC.ch4 = { Last: Last, Needle: Needle, Seam: Seam, Glue: Glue, Press: Press, Conveyor: Conveyor, Drum: Drum, Sleeper: Sleeper, Seamstress: Seamstress, TimeClock: TimeClock, NeonStar: NeonStar, Shock: Shock };
})();
