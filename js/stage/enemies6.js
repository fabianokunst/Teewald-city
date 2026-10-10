'use strict';
/* Teewald City — capítulo 6: o espantalho, a barba-de-velho que cai das árvores e agarra, o jogador de bolão possuído,
   as bolas de bolão (do inimigo, do Arno e as largadas no chão), os nove pinos, e o chefe: o Pelznickel
   (corrente, saco, vara de marmelo, bola de musgo, "Tu rezou?") que vira o mestre-escola Johann Vogt
   (palmatória, giz arremessado e a lista dos nomes caindo do alto). */
(function () {
  var E = TC.ent;
  var K = TC.enemyKit;
  var base = K.base, drawSprite = K.drawSprite, genericHit = K.genericHit, contact = K.contact, hpFor = K.hpFor, frames = K.frames;
  var W = TC.W;
  function art() { return TC.ART.ch6Init(); }
  function is6(st) { return st.level && st.level.chapter === 6; }
  function byDiff(e, n, h) { var d = TC.opts.diff; return d === 'easy' ? e : d === 'hard' ? h : n; }
  var MAXBALL = 3;
  TC.ch6 = TC.ch6 || {};
  TC.ch6.MAXBALL = MAXBALL;

  /* ================= BOLAS DE BOLÃO ================= */
  function countPickups(st) { var n = 0; st.deco.forEach(function (d) { if (d.c6pickup && d.alive) n++; }); return n; }
  function dropBall(st, x, y) {
    if (!is6(st) || countPickups(st) >= 4) return false;
    var a = st.arena;
    if (a) x = TC.clamp(x, a.x0 + 12, a.x0 + W - 12);
    st.deco.push(new BallPickup(x, Math.min(y, st.groundAt(x))));
    return true;
  }
  TC.ch6.dropBall = dropBall;

  /* bola parada no chão: passando por cima, o Arno pega (até três) */
  function BallPickup(x, y) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.w = 10; this.h = 10; this.t = 0; this.alive = true;
    this.c6pickup = true; this.onGround = false;
  }
  BallPickup.prototype.update = function (st) {
    this.t++;
    if (!this.onGround) { this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV); E.moveBody(this, st.level); }
    var p = st.player;
    if (this.t > 20 && p.alive && st.mode === 'play' && p.state !== 'cine' && (st.ball || 0) < MAXBALL &&
        TC.overlap({ x: this.x - 7, y: this.y - 12, w: 14, h: 14 }, p.hurtBox())) {
      this.alive = false;
      st.ball = (st.ball || 0) + 1;
      TC.audio.sfx('pickup');
      st.floatText(this.x, this.y - 22, TC.t('item.c6ball'), '#ffd060');
      if (!st.c6ballHint) { st.c6ballHint = true; st.hint = { key: 'hint.c6ball', t: 420 }; }
    }
  };
  BallPickup.prototype.draw = function (c, cx, cy) {
    var B = art().ball[0];
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (x < -20 || x > W + 20) return;
    c.drawImage(B, x - 6, y - 11);
    if (this.t % 50 < 5) { c.fillStyle = '#ffffff'; c.fillRect(x - 3, y - 9, 1, 1); }
  };
  BallPickup.prototype.light = function (L, cx, cy) { if ((st0 && (st0.ball || 0) < MAXBALL)) L.add(this.x - cx, this.y - 6 - cy, 14, '#ffe0a0', 0.35); };
  var st0 = null;
  TC.ch6.setStage = function (st) { st0 = st; };

  /* a bola que o Arno arremessa: rola rente ao chão e derruba tudo o que encontra */
  var BALL_ATK = { dmg: 4, kb: 3.6, lift: -2.8, stop: 5, heavy: true };
  var ballSeq = 1;
  function ThrownBall(x, y, dir, air) {
    this.x = x; this.y = y; this.dir = dir; this.vx = dir * 4.6; this.vy = air ? 0.5 : 0;
    this.t = 0; this.alive = true; this.hits = []; this.id = 700000 + (ballSeq++) * 16; this.rot = 0; this.c6proj = true; this.bounced = 0;
  }
  ThrownBall.prototype.update = function (st) {
    this.t++;
    var gy = st.groundAt(this.x);
    this.vy = Math.min(6.5, this.vy + 0.28);
    this.y += this.vy;
    if (this.y >= gy) { if (this.vy > 2) { TC.audio.sfx('land'); st.dust(this.x, gy); } this.y = gy; this.vy = 0; }
    this.x += this.vx;
    this.rot += this.vx;
    if (this.t % 16 === 0) TC.audio.sfx('c6bowl');
    var stop = false;
    // parede
    if (E.isSolid(st.level.tile(Math.floor((this.x + this.dir * 6) / 16), Math.floor((this.y - 6) / 16)))) stop = true;
    // bordas da arena: bate e volta um pouco
    var a = st.arena;
    if (a && ((this.vx < 0 && this.x < a.x0 + 8) || (this.vx > 0 && this.x > a.x0 + W - 8))) { this.vx = -this.vx * 0.25; this.bounced++; TC.audio.sfx('wood'); }
    // inimigos e quebráveis no caminho (cada um uma vez)
    var box = { x: this.x - 6, y: this.y - 13, w: 12, h: 13 };
    var lists = [st.enemies, st.props];
    for (var li = 0; li < lists.length; li++) {
      var arr = lists[li];
      for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (!e.alive || e.dying || !e.hurtBox || this.hits.indexOf(e) >= 0) continue;
        var hb = e.hurtBox();
        if (!TC.overlap(box, { x: hb.x, y: hb.y, w: hb.w, h: hb.h + 4 })) continue;
        this.hits.push(e);
        if (e.hit(st, BALL_ATK.dmg, Math.sign(this.vx) || this.dir, BALL_ATK.kb, this.id + this.hits.length, BALL_ATK)) {
          st.spark(this.x, this.y - 8, true);
          TC.audio.sfx('c6pins');
          TC.fx.shake(2, 6);
          if (!e.isProp) { st.combo++; st.comboT = 80; st.addScore(20 * Math.min(st.combo, 10)); }
          this.vx *= 0.82;
        }
      }
    }
    // os nove pinos
    if (st.c6pins && !st.c6pins.down && Math.abs(this.x - st.c6pins.x) < 14 && Math.abs(this.y - st.c6pins.y) < 20) st.c6pins.knock(st);
    this.vx *= 0.996;
    if (Math.abs(this.vx) < 0.45 || this.bounced > 2) stop = true;
    if (this.x < st.camX - 30 || this.x > st.camX + W + 30) { this.alive = false; return; }
    if (stop) { this.alive = false; if (!dropBall(st, this.x - this.dir * 4, this.y)) st.spark(this.x, this.y - 6); }
  };
  ThrownBall.prototype.draw = function (c, cx, cy) {
    var B = art().ball;
    var img = B[((Math.floor(this.rot / 6) % 4) + 4) % 4];
    c.drawImage(img, Math.round(this.x - 6 - cx), Math.round(this.y - 11 - cy));
  };
  TC.ch6.throwBall = function (st, p) {
    st.ball = Math.max(0, (st.ball || 0) - 1);
    p.throwing = true;
    var air = !p.onGround;
    st.deco.push(new ThrownBall(p.x + p.face * 10, air ? p.y - 8 : p.y, p.face, air));
    TC.audio.sfx('c6bowl');
    TC.audio.sfx('swing2');
    p.vx -= p.face * 0.4;
  };

  /* a bola rolada pelos jogadores de bolão possuídos: é só pular */
  function EnemyBall(owner, x, y, vx) {
    this.owner = owner; this.x = x; this.y = y; this.vx = vx; this.t = 0; this.alive = true; this.rot = 0;
    this.c6eball = true; this.c6proj = true; this.alpha = 1; this.fading = false;
  }
  EnemyBall.prototype.update = function (st) {
    this.t++;
    if (this.fading) { this.alpha -= 0.05; if (this.alpha <= 0) this.alive = false; return; }
    this.x += this.vx; this.rot += this.vx;
    this.y = st.groundAt(this.x);
    if (this.t % 16 === 0) TC.audio.sfx('c6bowl');
    var p = st.player, stop = false;
    if (st.mode === 'play' && TC.overlap({ x: this.x - 6, y: this.y - 11, w: 12, h: 11 }, p.hurtBox())) {
      if (p.damage(st, 1, Math.sign(this.vx))) { this.vx = -this.vx * 0.3; stop = true; }
    }
    var a = st.arena;
    if (a && (this.x < a.x0 + 8 || this.x > a.x0 + W - 8)) stop = true;
    if (E.isSolid(st.level.tile(Math.floor((this.x + Math.sign(this.vx) * 6) / 16), Math.floor((this.y - 6) / 16)))) stop = true;
    if (this.x < st.camX - 40 || this.x > st.camX + W + 40 || this.t > 400) { this.alive = false; return; }
    this.vx *= 0.997;
    if (Math.abs(this.vx) < 0.35) stop = true;
    if (stop) { if (dropBall(st, this.x, this.y)) this.alive = false; else this.fading = true; }
  };
  EnemyBall.prototype.draw = function (c, cx, cy) {
    var B = art().ball;
    c.globalAlpha = this.alpha;
    c.drawImage(B[((Math.floor(this.rot / 6) % 4) + 4) % 4], Math.round(this.x - 6 - cx), Math.round(this.y - 11 - cy));
    c.globalAlpha = 1;
  };

  /* os nove pinos no fundo da cancha: "Alle Neune!" */
  var PIN_POS = [[-12, -3], [-6, -6], [0, -9], [-6, 0], [0, -3], [6, -6], [0, 3], [6, 0], [12, -3]];
  function PinSet(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; this.down = false; this.fall = []; }
  PinSet.prototype.knock = function (st) {
    if (this.down) return;
    this.down = true; this.t = 0;
    var self = this;
    this.fall = PIN_POS.map(function (p, i) { return { x: p[0], vx: (p[0] + TC.rnd.range(-3, 3)) * 0.15 + 0.8, vy: TC.rnd.range(-3.2, -1.4), y: 0, rot: 0, k: i }; });
    TC.audio.sfx('c6pins');
    TC.fx.shake(2, 8);
    st.floatText(this.x, this.y - 40, TC.t('c6.alle'), '#ffe060');
    st.addScore(900);
    for (var i = 0; i < 10; i++) st.parts.add({ x: self.x + TC.rnd.range(-12, 12), y: self.y - 8, vx: TC.rnd.range(-1.5, 2.5), vy: TC.rnd.range(-2.5, -0.5), ay: 0.15, life: 30, color: TC.rnd.pick(['#f0ece0', '#c02828', '#b8b0a0']), size: 1, fade: true });
  };
  PinSet.prototype.update = function () {
    this.t++;
    if (this.down) {
      this.fall.forEach(function (f) { if (f.y < 0 || f.vy < 0) { f.vy += 0.25; f.y += f.vy; f.x += f.vx; if (f.y > 0) { f.y = 0; f.vy = 0; f.vx = 0; } } });
      if (this.t > 420) { this.down = false; this.t = 0; }
    }
  };
  PinSet.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (x < -40 || x > W + 40) return;
    var C6 = art();
    if (!this.down) {
      PIN_POS.slice().sort(function (a, b) { return a[1] - b[1]; }).forEach(function (p) {
        c.drawImage(p[1] < -4 ? TC.tintCached(C6.pinUp, '#5a5048', 0.35) : C6.pinUp, x + p[0] - 2, y - 13 + Math.round(p[1] / 3) - (p[1] < 0 ? 2 : 0));
      });
    } else {
      this.fall.forEach(function (f) {
        var img = f.y < -2 ? C6.pinUp : C6.pinDown;
        c.drawImage(img, Math.round(x + f.x - img.width / 2), Math.round(y + f.y - img.height));
      });
    }
  };

  /* ================= ESPANTALHO =================
     Roupa velha de colono e chapéu de palha. Fica parado no moirão até o Arno chegar perto;
     aí desce pulando num pé só e bate com o braço de pau. */
  function Scare(x, y, opt) {
    base(this, 'c6scare', x, y);
    opt = opt || {};
    this.w = 14; this.h = 44;
    this.hp = this.maxHp = hpFor(6);
    this.name = 'en.c6scare';
    this.score = 250;
    this.state = opt.pole ? 'pole' : 'enter';
    this.cool = frames(50, TC.diff().cool);
    this.useArena = true;
    this.onGround = false;
    this.hopT = TC.rnd.int(0, 12);
    this.lieT = 0;
    if (opt.pole) this.y = y - 20;
  }
  Scare.prototype.attacking = function () { return this.state === 'windup' || this.state === 'swing'; };
  Scare.prototype.hurtBox = function () { return { x: this.x - 8, y: this.y - 46, w: 16, h: 46 }; };
  Scare.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup') return false;
    if (this.state === 'pole') { this.state = 'jump'; this.t = 0; this.vy = -2.6; }
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Scare.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    for (var i = 0; i < 4; i++) st.parts.add({ x: this.x, y: this.y - 26, vx: TC.rnd.range(-1.5, 1.5) + dir, vy: TC.rnd.range(-2, 0), ay: 0.12, life: 30, color: TC.rnd.pick(['#d8c070', '#a88a40']), size: 1 });
    if (atk.heavy || this.hp <= 0) { this.state = 'down'; this.t = 0; this.vx = dir * kb * 0.7; this.vy = atk.lift || -2.5; this.lieT = 0; }
    else { this.state = 'hurt'; this.t = 0; this.vx = dir * kb * 0.6; }
  };
  Scare.prototype.die = function (st, dir) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('c6straw');
    for (var i = 0; i < 26; i++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - TC.rnd.range(6, 40), vx: TC.rnd.range(-2, 2) + (dir || 0), vy: TC.rnd.range(-3, -0.5), ay: 0.1, life: TC.rnd.int(40, 70), color: TC.rnd.pick(['#e0c060', '#d8c070', '#a88a40', '#4a5a8a']), size: TC.rnd.int(1, 2), fade: true, wobble: 0.1 });
    // o chapéu de palha voa
    st.parts.add({ x: this.x, y: this.y - 48, vx: (dir || 1) * 1.2, vy: -2.4, ay: 0.08, life: 80, color: '#b89a50', size: 4, fade: true });
  };
  Scare.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y, play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV); E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      if (this.t > 24) { this.alpha -= 0.05; if (this.alpha <= 0) this.alive = false; }
      return;
    }
    switch (this.state) {
      case 'pole':
        this.face = dx < 0 ? -1 : 1;
        if (play && Math.abs(dx) < 84 && Math.abs(dy) < 50) { this.state = 'jump'; this.t = 0; this.vy = -2.8; this.vx = this.face * 0.9; TC.audio.sfx('c6straw'); }
        return;
      case 'jump':
        if (this.onGround && this.t > 4) { this.state = 'walk'; this.t = 0; st.dust(this.x, this.y); TC.audio.sfx('land'); }
        break;
      case 'enter':
      case 'walk': {
        this.face = dx < 0 ? -1 : 1;
        var adx = Math.abs(dx);
        // anda aos pulinhos, como quem só tem um pé
        if (this.onGround) {
          this.vx = TC.approach(this.vx, 0, 0.2);
          if (++this.hopT > 18 && adx > 26) { this.hopT = 0; this.vy = -2.1; this.vx = this.face * (0.9 + TC.rnd() * 0.2) * D.speed; TC.audio.sfx('step'); }
        }
        if (this.state === 'enter' && this.t > 30) this.state = 'walk';
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && this.onGround && adx < 42 && Math.abs(dy) < 24) {
          if (st.mayAttack(this)) { this.state = 'windup'; this.t = 0; TC.audio.sfx('c6straw'); }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      }
      case 'windup':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= frames(26, D.windup)) { this.state = 'swing'; this.t = 0; this.vx = this.face * 1.0; TC.audio.sfx('swing2'); }
        break;
      case 'swing':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 3 && this.t <= 9 && play) {
          var bx = this.face > 0 ? this.x + 2 : this.x - 40;
          if (TC.overlap({ x: bx, y: this.y - 40, w: 38, h: 22 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (this.t >= 16) { this.state = 'recover'; this.t = 0; }
        break;
      case 'recover':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= 28) { this.state = 'walk'; this.t = 0; this.cool = frames(60 + TC.rnd.int(0, 40), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = Math.max(this.cool, 24); }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          if (++this.lieT > 48) { this.state = 'getup'; this.t = 0; }
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
  Scare.prototype.draw = function (c, cx, cy) {
    var S = art().scare, img;
    switch (this.state) {
      case 'pole': img = S.idle[Math.floor(this.t / 40) % 2]; break;
      case 'jump': case 'enter': case 'walk': img = this.onGround ? S.idle[0] : S.hop[this.vy < 0 ? 0 : 1]; break;
      case 'windup': img = S.windup[0]; break;
      case 'swing': img = this.t < 12 ? S.swing[0] : S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      case 'getup': img = S.hop[1]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    if (this.state === 'pole') {
      c.fillStyle = '#3a2614'; c.fillRect(Math.round(this.x - cx - 1), Math.round(this.y - cy - 22), 3, 42);
      c.fillStyle = '#5a3e22'; c.fillRect(Math.round(this.x - cx - 1), Math.round(this.y - cy - 22), 1, 42);
    }
    var shake = this.state === 'windup' && this.t > 12 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Scare.prototype.light = function (L, cx, cy) {
    if (this.dying || this.state === 'down' || this.state === 'pole') return;
    L.add(this.x + this.face * 2 - cx, this.y - 40 - cy, this.state === 'windup' ? 16 : 8, '#ff8020', 0.7);
  };

  /* ================= BARBA-DE-VELHO =================
     Tufo de barba-de-pau que se solta dos galhos quando alguém passa embaixo, rasteja e pula na cabeça.
     Agarrado, deixa o Arno lento e vai tirando energia: é preciso se sacudir (atacar, pular) para soltar. */
  function Barba(x, y, opt) {
    base(this, 'c6barba', x, y);
    opt = opt || {};
    this.w = 12; this.h = 14;
    this.hp = this.maxHp = hpFor(3);
    this.name = 'en.c6barba';
    this.score = 150;
    this.useArena = true;
    this.onGround = false;
    this.cool = frames(40 + TC.rnd.int(0, 40), TC.diff().cool);
    if (y < 0) this.state = 'fall';
    else if (opt.hang) this.state = 'hang';
    else this.state = 'crawl';
    this.shakes = 0; this.lastAtk = -1;
  }
  Barba.prototype.attacking = function () { return this.state === 'leapPrep' || this.state === 'leap' || this.state === 'grab'; };
  Barba.prototype.hurtBox = function () { return { x: this.x - 9, y: this.y - 28, w: 18, h: 28 }; };
  Barba.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'grab' && !(atk && atk.around)) return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Barba.prototype.onHit = function (st, dmg, dir, kb) {
    TC.audio.sfx('c6tuft');
    if (this.state === 'grab') this.release(st, dir);
    if (this.state === 'hang') { this.state = 'fall'; this.t = 0; return; }
    this.state = 'hurt'; this.t = 0;
    this.vx = dir * kb * 0.9; this.vy = -1.4;
  };
  Barba.prototype.die = function (st, dir) {
    if (this.state === 'grab') this.release(st, dir || 1);
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('c6tuft');
    for (var i = 0; i < 20; i++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - TC.rnd.range(2, 16), vx: TC.rnd.range(-1.4, 1.4), vy: TC.rnd.range(-2, -0.2), ay: 0.06, life: TC.rnd.int(30, 60), color: TC.rnd.pick(['#8a9a7a', '#a8b498', '#6a7a5a', '#c0c8b0']), size: 1, fade: true, wobble: 0.15 });
  };
  Barba.prototype.release = function (st, dir) {
    if (st.c6grab === this) st.c6grab = null;
    this.state = 'stun'; this.t = 0;
    this.vx = (dir || -st.player.face) * 1.8; this.vy = -2.4;
    this.cool = frames(90, TC.diff().cool);
  };
  Barba.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y, play = st.mode === 'play', D = TC.diff();
    if (this.dying) { this.alpha -= 0.08; this.y -= 0.3; if (this.alpha <= 0) this.alive = false; return; }
    switch (this.state) {
      case 'hang':
        this.face = dx < 0 ? -1 : 1;
        if (play && Math.abs(dx) < 34 && p.y > this.y) { this.state = 'fall'; this.t = 0; this.vy = 0; TC.audio.sfx('c6tuft'); }
        return;
      case 'fall':
        if (this.onGround) { this.state = 'land'; this.t = 0; TC.audio.sfx('land'); st.dust(this.x, this.y); }
        break;
      case 'land':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t > 14) { this.state = 'crawl'; this.t = 0; }
        break;
      case 'crawl':
        this.face = dx < 0 ? -1 : 1;
        this.vx = TC.approach(this.vx, Math.abs(dx) > 18 ? this.face * 0.7 * D.speed : 0, 0.05);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && this.onGround && Math.abs(dx) < 72 && Math.abs(dy) < 20 && !st.c6grab) {
          if (st.mayAttack(this)) { this.state = 'leapPrep'; this.t = 0; }
          else this.cool = TC.rnd.int(20, 45);
        }
        break;
      case 'leapPrep':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(26, D.windup)) {
          this.state = 'leap'; this.t = 0;
          this.vx = this.face * TC.clamp(Math.abs(dx) / 20, 1.6, 2.9) * D.speed; this.vy = -3.6;
          TC.audio.sfx('c6tuft');
        }
        break;
      case 'leap':
        if (play && !st.c6grab && p.alive && p.inv <= 0 && (p.state === 'normal' || p.state === 'attack' || p.state === 'shoot') &&
            TC.overlap({ x: this.x - 6, y: this.y - 14, w: 12, h: 14 }, p.hurtBox())) {
          this.state = 'grab'; this.t = 0; st.c6grab = this; this.shakes = 0; this.lastAtk = p.atkId; this.lastFace = p.face;
          TC.audio.sfx('c6sack');
          st.floatText(p.x, p.y - 44, TC.t('c6.grab'), '#c0d8a0');
          if (!st.c6grabHint) { st.c6grabHint = true; st.hint = { key: 'hint.c6grab', t: 300 }; }
          break;
        }
        if (this.onGround && this.t > 4) { this.state = 'crawl'; this.t = 0; this.cool = frames(70 + TC.rnd.int(0, 40), D.cool); }
        break;
      case 'grab': {
        this.x = p.x; this.y = p.y - 18; this.vx = this.vy = 0;
        // cada golpe, pulo ou virada conta como uma sacudida
        if (p.atkId !== this.lastAtk) { this.lastAtk = p.atkId; this.shakes++; this.flash = 4; TC.audio.sfx('c6tuft'); }
        if (p.jumpBuf === 7) { this.shakes++; this.flash = 4; }
        if (p.face !== this.lastFace) { this.lastFace = p.face; this.shakes += 0.5; }
        if (this.t % 50 === 49 && p.hp > 1) { p.hp = Math.max(1, Math.round((p.hp - 0.25) * 4) / 4); st.spark(p.x, p.y - 30); }
        var need = byDiff(3, 4, 6);
        if (this.shakes >= need || this.t > 330 || !p.alive || p.state === 'down' || p.state === 'dead' || p.state === 'cine' || st.mode !== 'play' || p.inSack) {
          this.release(st, -p.face);
          this.y = p.y - 10;
          st.floatText(p.x, p.y - 44, TC.t('c6.shake'), '#e0f0c0');
        }
        return;
      }
      case 'stun':
        if (this.onGround) this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t > 80) { this.state = 'crawl'; this.t = 0; }
        break;
      case 'hurt':
        if (this.onGround) this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'crawl'; this.t = 0; this.cool = Math.max(this.cool, 30); }
        break;
    }
    this.vy = Math.min(E.MAXFALL, this.vy + (this.state === 'fall' ? 0.22 : E.GRAV));
    E.moveBody(this, st.level);
    if (this.y > st.level.pxH + 30) { this.alive = false; st.kill(this); }
  };
  Barba.prototype.frame = function () {
    var B = art().barba;
    switch (this.state) {
      case 'hang': return B.hang[Math.floor(this.t / 20) % 2];
      case 'fall': return B.leap[0];
      case 'leap': return B.leap[0];
      case 'leapPrep': return B.crawl[(this.t >> 2) % 2];
      case 'grab': return B.grab[(this.t >> 3) % 2];
      case 'stun': case 'land': return B.stun[0];
      default: return B.crawl[Math.floor(this.t / 12) % 2];
    }
  };
  Barba.prototype.draw = function (c, cx, cy) {
    if (this.state === 'grab' && st0 && st0.c6grabOverlay) return;   // a fase desenha por cima do Arno
    this.drawAt(c, cx, cy);
  };
  Barba.prototype.drawAt = function (c, cx, cy) {
    var img = this.frame();
    if (this.state === 'hang') {
      // o fio de onde ele pende
      c.fillStyle = '#6a7a5a';
      for (var y = this.y - 70; y < this.y - 20; y += 2) c.fillRect(Math.round(this.x - cx + Math.sin(y * 0.1 + this.t * 0.03)), Math.round(y - cy), 1, 1);
    }
    var shake = this.state === 'leapPrep' ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Barba.prototype.light = function (L, cx, cy) {
    if (this.dying) return;
    L.add(this.x - cx, this.y - 10 - cy, this.state === 'leapPrep' || this.state === 'grab' ? 14 : 8, '#d0f080', 0.5);
  };

  /* ================= JOGADOR DE BOLÃO POSSUÍDO =================
     "Gut Holz!" — os bolonistas da Linha Esperança rolam as bolas pelo chão; de perto, dão um empurrão. */
  function Bowler(x, y, opt) {
    base(this, 'c6bowler', x, y);
    this.kind = 'c6bowler';
    this.w = 14; this.h = 34;
    this.hp = this.maxHp = hpFor(6);
    this.name = 'en.c6bowler';
    this.score = 300;
    this.state = 'spawn';
    this.alpha = 0;
    this.cool = frames(50, TC.diff().cool);
    this.onGround = false;
    this.speed = 0.55 + TC.rnd() * 0.12;
    this.useArena = true;
    this.lieT = 0;
    this.dist = 96 + TC.rnd.int(0, 34);
  }
  Bowler.prototype.attacking = function () { var s = this.state; return s === 'bowlPrep' || s === 'bowl' || s === 'windup' || s === 'swing'; };
  Bowler.prototype.hurtBox = function () { return { x: this.x - 7, y: this.y - 36, w: 14, h: 36 }; };
  Bowler.prototype.hit = function (st, d, dir, kb, id, atk) {
    if (this.state === 'down' || this.state === 'getup' || this.state === 'spawn') return false;
    return genericHit(this, st, d, dir, kb, id, atk);
  };
  Bowler.prototype.onHit = function (st, dmg, dir, kb, atk) {
    TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
    this.face = -dir;
    if (atk.heavy || this.hp <= 0) { this.state = 'down'; this.t = 0; this.vx = dir * kb * 0.7; this.vy = atk.lift || -2.5; this.lieT = 0; }
    else { this.state = 'hurt'; this.t = 0; this.vx = dir * kb * 0.6; }
  };
  Bowler.prototype.die = function (st) {
    this.dying = true; this.t = 0;
    st.addScore(this.score);
    st.kill(this);
    TC.audio.sfx('die');
  };
  Bowler.prototype.myBalls = function (st) { var n = 0, self = this; st.deco.forEach(function (d) { if (d.c6eball && d.owner === self && d.alive && !d.fading) n++; }); return n; };
  Bowler.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, dx = p.x - this.x, dy = p.y - this.y, play = st.mode === 'play', D = TC.diff();
    if (this.dying) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV); E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
      if (this.t > 24 && this.t < 70 && this.t % 2 === 0) st.parts.add({ x: this.x + TC.rnd.range(-10, 10), y: this.y - TC.rnd.range(2, 10), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.6, -0.6), life: 40, colors: ['#3a2a50', '#2a1e3a', '#140e1e'], size: TC.rnd.int(2, 4), fade: true });
      if (this.t === 46) {
        TC.audio.sfx('ghostDie');
        st.floatText(this.x, this.y - 30, TC.t('freed.m'), '#e0f0ff');
        // a bola dele fica no chão
        dropBall(st, this.x + this.face * 8, this.y);
      }
      if (this.t > 70) { this.alpha -= 0.03; if (this.alpha <= 0) this.alive = false; }
      return;
    }
    switch (this.state) {
      case 'spawn':
        this.alpha = Math.min(1, this.alpha + 0.025);
        this.face = dx < 0 ? -1 : 1;
        if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-8, 8), y: this.y - TC.rnd.range(0, 34), vy: -0.5, life: 30, colors: ['#8a8ab8', '#3a3a5a'], size: 2, fade: true });
        if (this.alpha >= 1) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk': {
        this.face = dx < 0 ? -1 : 1;
        var adx = Math.abs(dx), side = this.x < p.x ? -1 : 1;
        var tx = p.x + side * this.dist;
        if (st.arena) tx = TC.clamp(tx, st.arena.x0 + 18, st.arena.x0 + W - 18);
        var gap = tx - this.x;
        var want = adx < 30 ? this.face * this.speed : (Math.abs(gap) > 8 ? Math.sign(gap) * this.speed : 0);
        this.vx = TC.approach(this.vx, want, 0.06);
        if (this.cool > 0) this.cool--;
        if (play && this.cool <= 0 && Math.abs(dy) < 24 && this.onGround) {
          if (adx < 34) {
            if (st.mayAttack(this)) { this.state = 'windup'; this.t = 0; TC.audio.sfx('growl'); } else this.cool = TC.rnd.int(20, 45);
          } else if (adx < 210 && this.myBalls(st) === 0) {
            if (st.mayAttack(this)) { this.state = 'bowlPrep'; this.t = 0; } else this.cool = TC.rnd.int(20, 45);
          }
        }
        break;
      }
      case 'bowlPrep':
        this.vx = TC.approach(this.vx, 0, 0.2);
        this.face = dx < 0 ? -1 : 1;
        if (this.t >= frames(36, D.windup)) {
          this.state = 'bowl'; this.t = 0;
          st.deco.push(new EnemyBall(this, this.x + this.face * 12, this.y, this.face * 2.3 * D.speed));
          TC.audio.sfx('c6bowl');
          if (TC.rnd() < 0.4) st.floatText(this.x, this.y - 44, TC.t('c6.gutholz'), '#e8e0c0');
        }
        break;
      case 'bowl':
        if (this.t >= 22) { this.state = 'recover'; this.t = 0; }
        break;
      case 'windup':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= frames(28, D.windup)) { this.state = 'swing'; this.t = 0; TC.audio.sfx('swing2'); this.vx = this.face * 1.3; }
        break;
      case 'swing':
        this.vx = TC.approach(this.vx, 0, 0.12);
        if (this.t >= 2 && this.t <= 8 && play) {
          var bx = this.face > 0 ? this.x + 2 : this.x - 30;
          if (TC.overlap({ x: bx, y: this.y - 34, w: 28, h: 26 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (this.t >= 16) { this.state = 'recover'; this.t = 0; }
        break;
      case 'recover':
        this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t >= 30) { this.state = 'walk'; this.t = 0; this.cool = frames(80 + TC.rnd.int(0, 60), D.cool); }
        break;
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 16) { this.state = 'walk'; this.t = 0; this.cool = Math.max(this.cool, 24); }
        break;
      case 'down':
        if (this.onGround && this.t > 5) {
          this.vx = TC.approach(this.vx, 0, 0.25);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); }
          if (++this.lieT > 50) { this.state = 'getup'; this.t = 0; }
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
  Bowler.prototype.draw = function (c, cx, cy) {
    var S = art().bowler, img;
    switch (this.state) {
      case 'walk': img = Math.abs(this.vx) > 0.08 ? S.walk[Math.floor(this.t / 9) % 6] : S.idle[Math.floor(this.t / 30) % 2]; break;
      case 'bowlPrep': img = S.bowlPrep[0]; break;
      case 'bowl': img = this.t < 14 ? S.bowl[0] : S.idle[0]; break;
      case 'windup': img = S.windup[0]; break;
      case 'swing': img = this.t < 12 ? S.swing[0] : S.idle[0]; break;
      case 'hurt': img = S.hurt[0]; break;
      case 'down': img = this.onGround && this.t > 5 ? S.lie[0] : S.hurt[0]; break;
      case 'getup': img = S.kneel[0]; break;
      default: img = S.idle[0];
    }
    if (this.dying) img = this.onGround ? S.lie[0] : S.hurt[0];
    var shake = (this.state === 'windup' || this.state === 'bowlPrep') && this.t > 16 ? ((this.t >> 1) % 2 ? 1 : -1) : 0;
    drawSprite(c, img, this.x - cx + shake, this.y - cy + 1, this.face, this.flash > 0, this.alpha);
  };
  Bowler.prototype.light = function (L, cx, cy) {
    if (this.dying || this.alpha < 0.3 || this.state === 'down') return;
    L.add(this.x + this.face * 3 - cx, this.y - 33 - cy, this.state === 'bowlPrep' ? 16 : 9, '#d0ff60', 0.6);
  };

  /* ================= O PELZNICKEL / JOHANN VOGT ================= */
  function Pelz(x, y, opt) {
    base(this, 'c6pelz', x, y);
    opt = opt || {};
    this.arena = opt.arena;
    this.isBoss = true;
    this.hp = this.maxHp = Math.round(TC.diff().bossHp * 1.8);
    this.form = opt.vogt ? 'vogt' : 'pelz';
    this.setForm(this.form);
    this.score = 12000;
    this.state = 'intro';
    this.stagger = 0;
    this.attacks = 0;
    this.projs = [];
    this.marks = [];
    this.useArena = true;
    this.rollAng = 0;
    this.face = -1;
  }
  Pelz.prototype.setForm = function (f) {
    this.form = f;
    if (f === 'pelz') { this.name = 'boss6.name'; this.bar = { name: '#d8f0b8', back: '#101a0c', fill: '#6a9a4a', hi: '#c0e8a0' }; }
    else { this.name = 'boss6b.name'; this.bar = { name: '#f0ece0', back: '#141018', fill: '#b8b0a0', hi: '#ffffff' }; }
  };
  Pelz.prototype.L = function () { return this.arena.x0 + 28; };
  Pelz.prototype.R = function () { return this.arena.x0 + W - 28; };
  Pelz.prototype.set = function (s) { this.state = s; this.t = 0; };
  Pelz.prototype.phase2 = function () { return this.form === 'vogt'; };
  Pelz.prototype.vuln = function () { var s = this.state; return s === 'rollDizzy' || s === 'burning' || s === 'dizzy'; };
  Pelz.prototype.attacking = function () {
    var s = this.state;
    return s === 'chainPrep' || s === 'chainThrow' || s === 'sackPrep' || s === 'sackLunge' || s === 'sackHold' || s === 'switchPrep' || s === 'switch' ||
      s === 'rollPrep' || s === 'roll' || s === 'markPrep' || s === 'markWait' || s === 'paddleRun' || s === 'paddleWind' || s === 'paddle' ||
      s === 'chalkPrep' || s === 'listPrep' || s === 'listWait';
  };
  Pelz.prototype.hurtBox = function () {
    if (this.form === 'vogt') return { x: this.x - 9, y: this.y - 74, w: 18, h: 72 };
    if (this.state === 'roll') return { x: this.x - 15, y: this.y - 32, w: 30, h: 32 };
    if (this.state === 'rollPrep' || this.state === 'rollDizzy') return { x: this.x - 18, y: this.y - 44, w: 36, h: 44 };
    return { x: this.x - 16, y: this.y - 66, w: 32, h: 64 };
  };
  Pelz.prototype.hand = function () {
    if (this.form === 'vogt') return { x: this.x + this.face * 13, y: this.y - 54 };
    return { x: this.x + this.face * 22, y: this.y - 44 };
  };
  Pelz.prototype.hit = function (st, d, dir, kb, id, atk) {
    var s = this.state;
    if (s === 'intro' || s === 'transform' || s === 'dying' || s === 'downed' || s === 'sackHold' || s === 'burning' && this.t < 4) return false;
    if (s === 'roll') { if (id !== this.lastHit) { this.lastHit = id; TC.audio.sfx('c6tuft'); st.spark(this.x, this.y - 16); } return false; }
    var dd = d;
    if (this.form === 'pelz' && !this.vuln()) dd = d * 0.5;          // o musgo amortece os golpes
    if (this.form === 'pelz') dd = Math.min(dd, Math.max(0.25, this.hp - this.maxHp * 0.45));
    var ok = genericHit(this, st, dd, dir, kb, id, atk);
    if (ok) {
      TC.audio.sfx(atk.heavy ? 'hit2' : 'hit');
      if (this.form === 'pelz') for (var i = 0; i < 4; i++) st.parts.add({ x: this.x + dir * 8, y: this.y - TC.rnd.range(20, 56), vx: dir * TC.rnd.range(0.5, 2), vy: TC.rnd.range(-1.5, 0), ay: 0.08, life: 30, color: TC.rnd.pick(['#8a9a7a', '#a8b498', '#6a7a5a']), size: 1, fade: true });
      else for (var j = 0; j < 3; j++) st.parts.add({ x: this.x + dir * 6, y: this.y - TC.rnd.range(30, 60), vx: dir * TC.rnd.range(0.3, 1.2), vy: TC.rnd.range(-1, 0), life: 26, color: '#e8e8e0', size: 1, fade: true });
      if (!this.vuln()) {
        this.stagger += d;
        if (this.stagger >= 14 && s !== 'stagger') { this.stagger = 0; this.set('stagger'); this.vx = dir * 1.6; }
      }
      if (this.form === 'pelz' && this.hp <= this.maxHp * 0.5 + 0.01) this.startTransform(st);
    }
    return ok;
  };
  Pelz.prototype.startTransform = function (st) {
    if (this.form !== 'pelz' || this.state === 'transform') return;
    this.releaseSack(st, true);
    this.clearProjs();
    this.set('transform');
    if (st.level.c6transform) st.level.c6transform(st, this);
  };
  Pelz.prototype.clearProjs = function () {
    this.projs.forEach(function (p) { p.alive = false; });
    this.marks.forEach(function (m) { m.alive = false; });
    this.projs = []; this.marks = [];
  };
  Pelz.prototype.die = function (st) {
    this.releaseSack(st, true);
    this.clearProjs();
    this.set('dying');
    this.hp = 0;
    TC.audio.stopMusic(0.3);
    st.killAllMinions();
  };
  /* o piloto automático pula a corrente, a bola de musgo, a investida do saco e o giz que vem baixo */
  Pelz.prototype.botJump = function (p) {
    if (!p.onGround) return false;
    var dx = p.x - this.x;
    if (this.state === 'roll' && dx * Math.sign(this.vx) > 0 && Math.abs(dx) < 62) return true;
    if (this.state === 'sackLunge' && dx * this.face > 0 && Math.abs(dx) < 64) return true;
    for (var i = 0; i < this.projs.length; i++) {
      var pj = this.projs[i];
      if (!pj.alive) continue;
      if (pj.kind === 'chain' && !pj.ret && (p.x - pj.x) * pj.dir > 0 && Math.abs(p.x - pj.x) < 48) return true;
      if (pj.kind === 'chalk' && pj.y > p.y - 26 && (p.x - pj.x) * Math.sign(pj.vx) > 0 && Math.abs(p.x - pj.x) < 34) return true;
    }
    return false;
  };
  Pelz.prototype.capturable = function (p) {
    var s = p.state;
    return p.alive && p.inv <= 0 && (s === 'normal' || s === 'attack' || s === 'shoot' || s === 'hurt');
  };
  Pelz.prototype.capture = function (st) {
    var p = st.player;
    st.c6sack = { mash: 0, need: byDiff(5, 7, 10), t: 0 };
    p.setState('cine'); p.pose = 'idle'; p.inSack = true; p.vx = 0; p.vy = 0;
    this.set('sackHold');
    TC.audio.sfx('c6sack');
    TC.fx.shake(3, 12);
    st.hint = { key: 'hint.c6sack', t: 300 };
  };
  Pelz.prototype.releaseSack = function (st, won) {
    var p = st.player;
    if (!p.inSack) return;
    p.inSack = false;
    st.c6sack = null;
    if (p.state === 'cine' && st.mode === 'play') p.setState('normal');
    p.x = TC.clamp(this.x + this.face * 26, this.arena.x0 + 10, this.arena.x0 + W - 10);
    p.y = st.groundAt(p.x);
    p.vy = -3; p.vx = this.face * 2;
    if (won) p.inv = Math.max(p.inv, 60);
  };
  Pelz.prototype.minions = function (st) { var n = 0; st.enemies.forEach(function (e) { if (e.alive && !e.dying && !e.isBoss) n++; }); return n; };
  Pelz.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    if (this.flash > 0) this.flash--;
    var p = st.player, t = this.t, D = TC.diff(), G = st.groundY, self = this;
    var vogt = this.form === 'vogt';
    var spd = (vogt ? 1.2 : 1) * D.speed;
    var play = st.mode === 'play';
    var dx = p.x - this.x;
    this.projs = this.projs.filter(function (pj) { return pj.alive; });
    this.marks = this.marks.filter(function (m) { return m.alive; });
    switch (this.state) {
      case 'intro':
        this.face = dx < 0 ? -1 : 1;
        break;
      case 'stalk': {
        this.face = dx < 0 ? -1 : 1;
        var side = this.x < p.x ? -1 : 1;
        var tx = TC.clamp(p.x + side * (vogt ? 80 : 70), this.L(), this.R());
        var gap = tx - this.x;
        this.vx = TC.approach(this.vx || 0, Math.abs(gap) > 8 ? Math.sign(gap) * (vogt ? 1.15 : 0.7) * spd : 0, 0.08);
        this.x += this.vx;
        if (!vogt && t % 26 === 0 && Math.abs(this.vx) > 0.3) TC.audio.sfx('c6chain');
        if (t > frames(vogt ? 48 : 64, D.cool) && play && st.mayAttack(this)) {
          var n = ++this.attacks;
          var close = Math.abs(dx) < 56;
          if (!vogt) {
            if (close) this.set(n % 2 ? 'switchPrep' : 'sackPrep');
            else this.set(['chainPrep', 'rollPrep', 'markPrep', 'sackPrep', 'chainPrep', 'rollPrep'][n % 6]);
          } else {
            if (close) this.set(n % 3 === 0 ? 'markPrep' : 'paddleWind');
            else this.set(['chalkPrep', 'listPrep', 'paddleRun', 'markPrep', 'chalkPrep', 'paddleRun'][n % 6]);
          }
        }
        break;
      }
      /* ---------- corrente ---------- */
      case 'chainPrep':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        if (t % 14 === 1) TC.audio.sfx('c6chain');
        if (t > frames(40, D.windup)) {
          var h = this.hand();
          var ch = new Chain(this, h.x, G - 24, this.face, 5.2 * spd, 156);
          this.projs.push(ch); st.deco.push(ch);
          TC.audio.sfx('whoosh');
          this.set('chainThrow');
        }
        break;
      case 'chainThrow':
        if ((t > 20 && !this.projs.some(function (pj) { return pj.kind === 'chain'; })) || t > 120) this.set('recover');
        break;
      /* ---------- o saco ---------- */
      case 'sackPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('growl');
        if (t > frames(38, D.windup)) { this.set('sackLunge'); this.vx = this.face * 3.0 * spd; TC.audio.sfx('whoosh'); }
        break;
      case 'sackLunge':
        this.x += this.vx;
        if (t % 4 === 0) st.dust(this.x - this.face * 14, G);
        if (play && this.capturable(p) && TC.overlap({ x: this.x + this.face * 10 - 14, y: this.y - 46, w: 28, h: 40 }, p.hurtBox())) { this.capture(st); break; }
        if (t > 40 || this.x <= this.L() - 10 || this.x >= this.R() + 10) { this.set('recover'); this.vx = 0; }
        break;
      case 'sackHold': {
        var S = st.c6sack;
        if (!S || !p.inSack) { this.set('recover'); break; }
        S.t++;
        p.x = TC.clamp(this.x + this.face * 20, this.arena.x0 + 8, this.arena.x0 + W - 8); p.y = G; p.vx = 0;
        if (S.t > 4 && (p.atkBuf === 8 || p.jumpBuf === 7)) { S.mash++; this.sackShake = 8; TC.audio.sfx('c6tuft'); st.spark(p.x + TC.rnd.range(-6, 6), p.y - 18); }
        if (this.sackShake > 0) this.sackShake--;
        if (S.t % 45 === 44 && p.hp > 1) { p.hp = Math.max(1, Math.round((p.hp - 0.25) * 4) / 4); TC.audio.sfx('hurt'); }
        if (S.mash >= S.need) {
          this.releaseSack(st, true);
          this.set('dizzy');
          st.floatText(this.x, this.y - 80, TC.t('c6.torn'), '#ffe090');
          TC.audio.sfx('break'); TC.fx.shake(3, 10);
          for (var q = 0; q < 14; q++) st.parts.add({ x: p.x, y: p.y - 16, vx: TC.rnd.range(-2, 2), vy: TC.rnd.range(-3, -0.5), ay: 0.15, life: 40, color: TC.rnd.pick(['#8a7044', '#a08858', '#6a5430']), size: 2, fade: true });
        } else if (S.t > 330) {
          // não se soltou a tempo: é arremessado para fora
          this.releaseSack(st, false);
          p.damage(st, 2, this.face, true);
          this.set('recover');
        }
        break;
      }
      /* ---------- vara de marmelo ---------- */
      case 'switchPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t > frames(18, D.windup)) this.set('switch');
        break;
      case 'switch': {
        var k = t % 11;
        if (k === 1) { TC.audio.sfx('c6switch'); this.lashF = (this.lashF || 0) + 1; }
        if (k >= 1 && k <= 4 && play) {
          var bx = this.face > 0 ? this.x + 4 : this.x - 46;
          if (TC.overlap({ x: bx, y: this.y - 54, w: 42, h: 38 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (t > 34) this.set('recover');
        break;
      }
      /* ---------- a bola de barba-de-velho ---------- */
      case 'rollPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t % 6 === 0) TC.audio.sfx('c6tuft');
        if (t > frames(42, D.windup)) {
          this.set('roll');
          this.vx = (dx < 0 ? -1 : 1) * 3.3 * spd;
          TC.audio.sfx('whoosh');
        }
        break;
      case 'roll':
        this.x += this.vx;
        this.rollAng += this.vx / 15;
        if (t % 5 === 0) st.dust(this.x - Math.sign(this.vx) * 12, G);
        if (t % 14 === 0) TC.audio.sfx('c6bowl');
        if (play) {
          var hb = this.hurtBox();
          if (TC.overlap({ x: hb.x + 3, y: hb.y + 4, w: hb.w - 6, h: hb.h - 4 }, p.hurtBox())) p.damage(st, 2, Math.sign(this.vx), true);
        }
        if (this.vx > 0 && this.x >= this.R() + 8) {
          if (this.form === 'pelz' && this.arena.furnace === 'right') { this.x = this.R() + 8; this.set('burning'); }
          else { this.set('rollDizzy'); TC.fx.shake(3, 10); TC.audio.sfx('hit2'); }
        } else if (this.vx < 0 && this.x <= this.L() - 8) {
          this.set('rollDizzy'); TC.fx.shake(3, 10); TC.audio.sfx('wood');
        } else if (t > 170) this.set('rollDizzy');
        break;
      case 'rollDizzy':
        this.vx = 0;
        if (t % 18 === 0) for (var s2 = 0; s2 < 3; s2++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 50, vx: Math.cos(t * 0.3 + s2 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(90, D.cool)) this.set('stalk');
        break;
      case 'burning':
        // bateu na fornalha da estufa: o musgo seco pega fogo
        if (t === 1) {
          var dmg = Math.round(this.maxHp * 0.12);
          this.hp = Math.max(1, this.hp - dmg);
          this.flash = 10;
          st.showEnemyBar(this);
          TC.audio.sfx('c6fire'); TC.audio.sfx('hit2');
          TC.fx.shake(5, 24); TC.fx.flash('#ff8030', 0.4, 0.03);
          st.floatText(this.x, this.y - 82, TC.t('c6.fire'), '#ffb040');
          st.addScore(2000);
          this.x -= 18;
        }
        if (t % 2 === 0) for (var f = 0; f < 3; f++) st.parts.add({ x: this.x + TC.rnd.range(-16, 16), y: this.y - TC.rnd.range(0, 60), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-2, -0.6), life: TC.rnd.int(16, 34), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010', '#401008'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
        if (t > 70) this.startTransform(st);
        break;
      /* ---------- "Tu rezou?": o X de giz no chão ---------- */
      case 'markPrep':
        this.face = dx < 0 ? -1 : 1;
        this.vx = 0;
        if (t === 1) { st.floatText(this.x, this.y - (vogt ? 86 : 80), TC.t('c6.gebetet'), '#f0f0e0'); TC.audio.sfx(vogt ? 'c6chalk' : 'c6chain'); }
        if (t === 22) {
          var nm = byDiff(3, 4, 5), base0 = TC.clamp(p.x, this.arena.x0 + 14, this.arena.x0 + W - 14);
          for (var m = 0; m < nm; m++) {
            var off = m === 0 ? 0 : (m % 2 ? 1 : -1) * Math.ceil(m / 2) * 46;
            var mx = base0 + off;
            if (mx < this.arena.x0 + 12 || mx > this.arena.x0 + W - 12) mx = base0 - off;
            mx = TC.clamp(mx, this.arena.x0 + 12, this.arena.x0 + W - 12);
            var mk = new Mark(this, mx, G, frames(70, D.windup) + m * 10);
            this.marks.push(mk); st.deco.push(mk);
          }
          TC.audio.sfx('c6chalk');
        }
        if (t > 22) this.set('markWait');
        break;
      case 'markWait':
        if ((t > 10 && this.marks.every(function (mm) { return mm.struck; })) || t > 220) this.set('recover');
        break;
      /* ---------- Vogt: palmatória ---------- */
      case 'paddleRun':
        this.face = dx < 0 ? -1 : 1;
        this.x += this.face * 2.2 * spd;
        if (t % 6 === 0) st.dust(this.x - this.face * 8, G);
        if (Math.abs(dx) < 34 || t > 40 || this.x <= this.L() - 10 || this.x >= this.R() + 10) this.set('paddleWind');
        break;
      case 'paddleWind':
        this.face = dx < 0 ? -1 : 1;
        if (t > frames(16, D.windup)) { this.set('paddle'); TC.audio.sfx('c6switch'); this.x += this.face * 4; }
        break;
      case 'paddle':
        if (t >= 2 && t <= 7 && play) {
          var px = this.face > 0 ? this.x + 2 : this.x - 36;
          if (TC.overlap({ x: px, y: this.y - 46, w: 34, h: 36 }, p.hurtBox())) p.damage(st, 1, this.face);
        }
        if (t === 4) TC.audio.sfx('wood');
        if (t > 18) {
          if (!this.second && this.attacks % 2 === 0) { this.second = true; this.set('paddleWind'); }
          else { this.second = false; this.set('recover'); }
        }
        break;
      /* ---------- Vogt: giz arremessado em leque ---------- */
      case 'chalkPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) TC.audio.sfx('c6chalk');
        if (t > frames(30, D.windup)) {
          var hh = this.hand(), nc = byDiff(3, 4, 5);
          var ang = Math.atan2((p.y - 14) - hh.y, p.x - hh.x);
          for (var c2 = 0; c2 < nc; c2++) {
            var a2 = ang + (c2 - (nc - 1) / 2) * 0.24;
            var ck = new Chalk(this, hh.x, hh.y, Math.cos(a2) * 2.5 * spd, Math.sin(a2) * 2.5 * spd);
            this.projs.push(ck); st.deco.push(ck);
          }
          TC.audio.sfx('whoosh');
          this.set('chalkThrow');
        }
        break;
      case 'chalkThrow':
        if (t > 26) this.set('recover');
        break;
      /* ---------- Vogt: a chamada (os nomes de giz caem do alto) ---------- */
      case 'listPrep':
        this.face = dx < 0 ? -1 : 1;
        if (t === 1) { st.floatText(this.x, this.y - 88, TC.t('c6.list'), '#f0ece0'); TC.audio.sfx('c6chalk'); }
        if (t > frames(36, D.windup)) {
          var names = ['SCHMITT 1898', 'WEBER 1931', 'BECKER 1977', 'KESSLER 1997', 'BECKER 1997'];
          var nn = byDiff(3, 4, 5), cx0 = TC.clamp(p.x, this.arena.x0 + 30, this.arena.x0 + W - 30);
          for (var q2 = 0; q2 < nn; q2++) {
            var off2 = q2 === 0 ? 0 : (q2 % 2 ? 1 : -1) * Math.ceil(q2 / 2) * 62;
            var nx = TC.clamp(cx0 + off2, this.arena.x0 + 30, this.arena.x0 + W - 30);
            var fn = new FallingName(this, nx, G, names[(q2 + this.attacks) % names.length], frames(56, D.windup) + q2 * 12);
            this.marks.push(fn); st.deco.push(fn);
          }
          this.set('listWait');
        }
        break;
      case 'listWait':
        if ((t > 10 && this.marks.every(function (mm) { return mm.struck; })) || t > 240) this.set('recover');
        break;
      /* ---------- comuns ---------- */
      case 'recover':
        this.vx = 0;
        if (t > frames(vogt ? 26 : 38, D.cool)) this.set('stalk');
        break;
      case 'stagger':
        this.x += this.vx; this.vx *= 0.9;
        if (t > 46) this.set('stalk');
        break;
      case 'dizzy':
        if (t % 18 === 0) for (var s3 = 0; s3 < 3; s3++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 78, vx: Math.cos(t * 0.3 + s3 * 2) * 0.6, vy: -0.4, life: 24, color: '#ffe080', size: 1, layer: 1 });
        if (t > frames(100, D.cool)) this.set('stalk');
        break;
      case 'transform':
        if (!st.level.c6transform && t > 120) { this.setForm('vogt'); this.set('stalk'); }
        break;
      case 'dying':
        TC.fx.shake(2, 4);
        if (t % 5 === 0) {
          for (var d2 = 0; d2 < 5; d2++) st.parts.add({ x: this.x + TC.rnd.range(-12, 12), y: this.y - TC.rnd.range(4, 70), vx: TC.rnd.range(-0.5, 0.5), vy: TC.rnd.range(-1.2, -0.2), life: 60, colors: ['#ffffff', '#e8e8e0', '#a8a8a0'], size: TC.rnd.int(1, 3), fade: true, wobble: 0.1 });
          if (t % 20 === 0) TC.audio.sfx('c6chalk');
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
    if (this.state === 'stalk' || this.state === 'recover') contact(this, st, 1, false, true);
  };
  Pelz.prototype.frame = function () {
    var t = this.t;
    if (this.form === 'vogt') {
      var V = art().vogt;
      switch (this.state) {
        case 'stalk': return Math.abs(this.vx) > 0.2 ? V.walk[Math.floor(t / 8) % 4] : V.idle[Math.floor(t / 30) % 2];
        case 'paddleRun': return V.walk[Math.floor(t / 4) % 4];
        case 'paddleWind': return V.paddlePrep[0];
        case 'paddle': return t < 12 ? V.paddle[0] : V.idle[0];
        case 'chalkPrep': case 'listPrep': return V.write[0];
        case 'chalkThrow': return t < 14 ? V.throw[0] : V.idle[0];
        case 'markPrep': case 'markWait': case 'listWait': return V.point[0];
        case 'stagger': case 'dizzy': case 'rollDizzy': return V.hurt[0];
        case 'dying': return V.hurt[0];
        case 'downed': return V.kneel[0];
      }
      return V.idle[Math.floor(t / 30) % 2];
    }
    var S = art().pelz;
    switch (this.state) {
      case 'intro': return this.pose && S[this.pose] ? S[this.pose][Math.floor(t / 20) % S[this.pose].length] : S.idle[Math.floor(t / 30) % 2];
      case 'stalk': return Math.abs(this.vx) > 0.2 ? S.walk[Math.floor(t / 10) % 4] : S.idle[Math.floor(t / 30) % 2];
      case 'chainPrep': return S.chainPrep[0];
      case 'chainThrow': return t < 18 ? S.chainThrow[0] : S.idle[0];
      case 'sackPrep': return S.sackPrep[0];
      case 'sackLunge': return S.sackLunge[0];
      case 'sackHold': return S.sackHold[0];
      case 'switchPrep': return S.switchPrep[0];
      case 'switch': return S.switch[(this.lashF || 0) % 2];
      case 'rollPrep': return S.curl[0];
      case 'rollDizzy': case 'dizzy': case 'stagger': return S.dizzy[0];
      case 'markPrep': case 'markWait': return S.point[0];
      case 'burning': case 'transform': return S.hurt[0];
      case 'recover': return S.idle[0];
      case 'dying': return S.hurt[0];
      case 'downed': return S.kneel[0];
    }
    return S.idle[0];
  };
  Pelz.prototype.draw = function (c, cx, cy) {
    var x = this.x - cx, y = this.y - cy;
    if (this.state === 'roll') {
      TC.drawRot(c, art().pelz.ball, Math.round(x), Math.round(y - 18), this.rollAng, 32);
      return;
    }
    var img = this.frame();
    var shake = this.state === 'dying' ? TC.rnd.int(-1, 1) :
      ((this.state === 'rollPrep' || this.state === 'sackPrep' || this.state === 'chainPrep' || this.state === 'paddleWind') && this.t > 10 ? ((this.t >> 1) % 2 ? 1 : -1) : 0);
    if (this.state === 'transform' && this.form === 'pelz' && this.burnK != null) {
      // o musgo queimando revela o mestre-escola por baixo
      var V = art().vogt.hurt[0];
      drawSprite(c, TC.tintCached(img, '#ff6020', 0.5), x + shake, y + 1, this.face, false, 1 - this.burnK);
      drawSprite(c, V, x, y + 1, this.face, false, this.burnK);
      return;
    }
    var tint = this.state === 'burning' ? TC.tintCached(img, '#ff7020', 0.45) : img;
    drawSprite(c, tint, x + shake, y + 1, this.face, this.flash > 0, this.alpha);
    if (this.state === 'chainPrep') {
      // a corrente girando por cima da cabeça
      var h = this.hand(), hx = Math.round(h.x - cx), hy = Math.round(this.y - 98 - cy);
      for (var k = 0; k < 12; k++) {
        var a = this.t * 0.4 + k / 12 * TC.TAU;
        c.fillStyle = k % 2 ? '#8a8a96' : '#c8c8d0';
        c.fillRect(Math.round(hx + Math.cos(a) * 16), Math.round(hy + Math.sin(a) * 5), 2, 2);
      }
    }
    if (this.state === 'sackHold') {
      var hs = this.hand(), S = art().kidSackImg, fr = S[this.sackShake > 0 ? 1 + ((this.t >> 1) % 2) : 0];
      var sx = Math.round(this.x + this.face * 20 - cx), sy = Math.round(this.y - cy + 1);
      c.drawImage(this.face < 0 ? TC.flip(fr) : fr, sx - fr.ox, sy - fr.oy);
      c.fillStyle = '#2a1a10';
      TC.thickLine(c, Math.round(hs.x - cx), Math.round(hs.y - cy), sx, sy - 30, 1.5);
    }
  };
  Pelz.prototype.light = function (L, cx, cy) {
    var vogt = this.form === 'vogt';
    var hy = vogt ? this.y - 70 : this.y - 84;
    if (this.state === 'roll') { L.add(this.x - cx, this.y - 18 - cy, 30, '#a0c080', 0.5); return; }
    var hot = this.attacking() && this.state !== 'stalk';
    L.add(this.x + this.face * 2 - cx, hy - cy, hot ? 26 : 16, vogt ? '#e0f0c0' : '#f0f090', hot ? 0.9 : 0.6);
    L.add(this.x - cx, this.y - 40 - cy, 70, vogt ? '#a8a0b0' : '#8a9a7a', 0.5);
    if (this.state === 'burning' || this.state === 'transform') L.add(this.x - cx, this.y - 40 - cy, 90, '#ff8030', 1.2);
  };
  Pelz.prototype.glow = function (c, cx, cy) {
    if (this.state === 'roll' || this.state === 'downed') return;
    var vogt = this.form === 'vogt';
    TC.Lighting.glow(c, this.x + this.face * 2 - cx, (vogt ? this.y - 70 : this.y - 84) - cy, 4, vogt ? '#f0f8d0' : '#f8f8a0', 0.6);
  };

  /* corrente: vai na altura do peito e volta para a mão */
  function Chain(boss, x, y, dir, speed, range) {
    this.boss = boss; this.x = x; this.y = y; this.x0 = x; this.dir = dir; this.vx = dir * speed; this.range = range;
    this.t = 0; this.alive = true; this.ret = false; this.kind = 'chain'; this.c6proj = true;
  }
  Chain.prototype.update = function (st) {
    this.t++;
    var b = this.boss;
    if (!b.alive || b.state === 'dying' || b.state === 'downed' || b.state === 'transform') { this.alive = false; return; }
    if (!this.ret) {
      this.x += this.vx;
      if (Math.abs(this.x - this.x0) > this.range || this.t > 60) this.ret = true;
      var p = st.player;
      if (st.mode === 'play' && TC.overlap({ x: this.x - 8, y: this.y - 5, w: 16, h: 10 }, p.hurtBox())) {
        if (p.damage(st, 1, this.dir)) TC.audio.sfx('c6chain');
        this.ret = true;
      }
      var a = b.arena;
      if (this.x < a.x0 + 4 || this.x > a.x0 + W - 4) { this.ret = true; TC.audio.sfx('c6chain'); st.spark(this.x, this.y); }
    } else {
      var h = b.hand();
      this.x += (h.x - this.x) * 0.18;
      this.y += (h.y - this.y) * 0.12;
      if (Math.abs(this.x - h.x) < 10) this.alive = false;
    }
  };
  Chain.prototype.draw = function (c, cx, cy) {
    var h = this.boss.hand();
    var n = Math.max(2, Math.round(Math.abs(this.x - h.x) / 3));
    for (var i = 0; i <= n; i++) {
      var k = i / n;
      c.fillStyle = i % 2 ? '#8a8a96' : '#c8c8d0';
      c.fillRect(Math.round(h.x + (this.x - h.x) * k - cx), Math.round(h.y + (this.y - h.y) * k + Math.sin(k * Math.PI) * 5 - cy), 2, 2);
    }
    c.fillStyle = '#5a5a66';
    c.fillRect(Math.round(this.x - cx) - 2, Math.round(this.y - cy) - 2, 5, 5);
    c.fillStyle = '#e8e8f0'; c.fillRect(Math.round(this.x - cx) - 1, Math.round(this.y - cy) - 1, 2, 1);
  };

  /* X de giz no chão: pisca e aí cai o golpe */
  function Mark(boss, x, y, delay) {
    this.boss = boss; this.x = x; this.y = y; this.delay = delay; this.t = 0; this.alive = true; this.struck = false; this.c6proj = true; this.c6mark = true;
  }
  Mark.prototype.update = function (st) {
    this.t++;
    if (!this.boss.alive || this.boss.state === 'dying' || this.boss.state === 'transform') { this.alive = false; return; }
    if (this.t === this.delay) {
      this.struck = true;
      TC.audio.sfx('c6strike');
      TC.fx.shake(2, 6);
      for (var i = 0; i < 14; i++) st.parts.add({ x: this.x + TC.rnd.range(-6, 6), y: this.y - 2, vx: TC.rnd.range(-1.6, 1.6), vy: TC.rnd.range(-2.6, -0.4), ay: 0.1, life: 30, color: TC.rnd.pick(['#ffffff', '#e8e8e0', '#a8a8a0']), size: TC.rnd.int(1, 2), fade: true });
      var p = st.player;
      if (st.mode === 'play' && Math.abs(p.x - this.x) < 14 && p.y > this.y - 34) p.damage(st, 1, p.x < this.x ? -1 : 1);
    }
    if (this.t > this.delay + 24) this.alive = false;
  };
  Mark.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var left = this.delay - this.t;
    if (!this.struck) {
      var blink = left < 24 ? (this.t >> 1) % 2 : left < 50 ? (this.t >> 2) % 2 : 0;
      c.fillStyle = blink ? '#ff9070' : '#f0f0e8';
      for (var k = -5; k <= 5; k++) { c.fillRect(x + k, y - 3 + Math.round(k * 0.3), 1, 1); c.fillRect(x + k, y - 3 - Math.round(k * 0.3), 1, 1); }
      c.fillRect(x - 6, y - 1, 13, 1);
    } else {
      var a = 1 - (this.t - this.delay) / 24;
      c.globalAlpha = Math.max(0, a);
      c.fillStyle = '#ffffff';
      var top = Math.max(0, y - 120 + (this.t - this.delay) * 10);
      c.fillRect(x - 1, top, 3, y - top);
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x - 4, top, 9, y - top);
      c.globalAlpha = 1;
    }
  };
  Mark.prototype.light = function (L, cx, cy) { if (!this.struck) L.add(this.x - cx, this.y - 4 - cy, 14, '#f0f0e0', 0.5); };

  /* giz arremessado */
  function Chalk(boss, x, y, vx, vy) {
    this.boss = boss; this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.t = 0; this.alive = true; this.kind = 'chalk'; this.c6proj = true;
  }
  Chalk.prototype.update = function (st) {
    this.t++;
    this.vy += 0.03;
    this.x += this.vx; this.y += this.vy;
    var p = st.player, G = st.groundAt(this.x);
    if (st.mode === 'play' && TC.overlap({ x: this.x - 3, y: this.y - 3, w: 6, h: 6 }, p.hurtBox())) {
      if (p.damage(st, 1, this.vx > 0 ? 1 : -1)) { this.alive = false; return; }
    }
    var a = this.boss.arena;
    if (this.y >= G || this.x < a.x0 || this.x > a.x0 + W || this.t > 200) {
      this.alive = false;
      for (var i = 0; i < 5; i++) st.parts.add({ x: this.x, y: Math.min(this.y, G) - 1, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.5, -0.3), ay: 0.1, life: 18, color: '#e8e8e0', size: 1, fade: true });
    }
  };
  Chalk.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy), a = this.t * 0.4;
    c.fillStyle = '#ffffff';
    for (var k = -2; k <= 2; k++) c.fillRect(Math.round(x + Math.cos(a) * k), Math.round(y + Math.sin(a) * k), 1, 1);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - Math.round(this.vx * 2), y - Math.round(this.vy * 2), 1, 1);
  };
  Chalk.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 10, '#ffffff', 0.4); };

  /* a lista: um nome de giz que cai do alto (a sombra avisa onde) */
  function FallingName(boss, x, gy, txt, delay) {
    this.boss = boss; this.x = x; this.gy = gy; this.txt = txt; this.delay = delay; this.t = 0; this.alive = true; this.struck = false;
    this.y = -20; this.vy = 0; this.w = TC.font.measure(txt) + 4; this.c6proj = true; this.c6mark = true;
  }
  FallingName.prototype.update = function (st) {
    this.t++;
    if (!this.boss.alive || this.boss.state === 'dying') { this.alive = false; return; }
    if (this.t > this.delay && !this.struck) {
      this.vy += 0.35; this.y += this.vy;
      if (this.y >= this.gy - 4) {
        this.struck = true; this.y = this.gy - 4;
        TC.audio.sfx('c6strike');
        var p = st.player;
        if (st.mode === 'play' && Math.abs(p.x - this.x) < this.w / 2 + 3 && p.y > this.gy - 40) p.damage(st, 1, p.x < this.x ? -1 : 1);
        for (var i = 0; i < 18; i++) st.parts.add({ x: this.x + TC.rnd.range(-this.w / 2, this.w / 2), y: this.gy - 4, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2, -0.3), ay: 0.1, life: 26, color: TC.rnd.pick(['#ffffff', '#e8e8e0']), size: 1, fade: true });
      }
    }
    if (this.struck && this.t > this.delay + 60) this.alive = false;
  };
  FallingName.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx);
    if (!this.struck) {
      var k = TC.clamp(this.t / this.delay, 0, 1);
      c.fillStyle = 'rgba(10,10,20,' + (0.25 + 0.35 * k).toFixed(2) + ')';
      TC.fillEllipse(c, x, Math.round(this.gy - cy - 1), Math.round(this.w / 2 * (0.5 + k * 0.5)), 2);
      if (this.t > this.delay) TC.font.draw(c, this.txt, x, Math.round(this.y - cy - 8), '#ffffff', { align: 'center', outline: '#1a1a2a' });
    } else {
      c.globalAlpha = Math.max(0, 1 - (this.t - this.delay) / 60);
      TC.font.draw(c, this.txt, x, Math.round(this.gy - cy - 10), '#e8e8e0', { align: 'center', outline: '#1a1a2a' });
      c.globalAlpha = 1;
    }
  };

  /* o saco com as crianças, largado num canto do pátio durante a luta */
  function KidSack(x, y) { this.x = x; this.y = y; this.t = 0; this.alive = true; this.shake = 0; this.open = false; }
  KidSack.prototype.update = function (st) {
    this.t++;
    if (this.open) return;
    if (this.shake > 0) this.shake--;
    else if (TC.rnd() < 0.01) this.shake = 24;
    if (this.t % 600 === 300 && st.mode === 'play' && Math.abs(this.x - st.camX - 128) < 150) st.floatText(this.x, this.y - 44, TC.t(TC.rnd() < 0.5 ? 'c6.mae' : 'c6.socorro'), '#c0d8ff');
  };
  KidSack.prototype.draw = function (c, cx, cy) {
    var C6 = art();
    if (this.open) { var o = C6.sackOpenImg; c.drawImage(o, Math.round(this.x - cx - o.ox), Math.round(this.y - cy - o.oy + 1)); return; }
    var fr = C6.kidSackImg[this.shake > 0 ? 1 + ((this.t >> 2) % 2) : 0];
    c.drawImage(fr, Math.round(this.x - cx - fr.ox), Math.round(this.y - cy - fr.oy + 1));
  };

  /* o quadro-negro: a mão invisível do giz escrevendo os nomes */
  function Board(x, y, lines) { this.x = x; this.y = y; this.lines = lines; this.chars = 0; this.t = 0; this.alive = true; this.writing = false; }
  Board.prototype.update = function () {
    this.t++;
    if (this.writing) {
      var total = this.lines.join('').length;
      var prev = Math.floor(this.chars);
      this.chars = Math.min(total, this.chars + 0.12);
      if (Math.floor(this.chars) !== prev && prev % 2 === 0) TC.audio.sfx('c6chalk');
      if (this.chars >= total) this.writing = false;
    }
  };
  Board.prototype.draw = function (c, cx, cy) {
    var n = Math.floor(this.chars), x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (x < -120 || x > W + 120) return;
    for (var i = 0; i < this.lines.length && n > 0; i++) {
      var ln = this.lines[i];
      TC.font.draw(c, ln, x, y + i * 10, i === this.lines.length - 1 ? '#ffd0c0' : '#e8ece0', { align: 'center', max: n });
      n -= ln.length;
    }
  };

  TC.ENEMIES.c6scare = Scare;
  TC.ENEMIES.c6barba = Barba;
  TC.ENEMIES.c6bowler = Bowler;
  TC.ENEMIES.c6pelz = Pelz;
  E.C6BallPickup = BallPickup;
  E.C6PinSet = PinSet;
  E.C6KidSack = KidSack;
  E.C6Board = Board;
})();
