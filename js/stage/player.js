'use strict';
/* Teewald City — Arno: movimento de plataforma + combos de beat 'em up */
(function () {
  var E = TC.ent;

  // box: [dx a partir do centro (na direção do rosto), dy a partir dos pés, largura, altura]
  var ATK = {
    punch1: { frames: 15, active: [4, 7], box: [5, -27, 17, 11], dmg: 1, kb: 1.6, lift: 0, stop: 3, pose: 'punch1', next: 'punch2', window: 4, sfx: 'swing', step: 0.4 },
    punch2: { frames: 16, active: [4, 8], box: [5, -27, 19, 11], dmg: 1, kb: 1.9, lift: 0, stop: 4, pose: 'punch2', next: 'kick', window: 4, sfx: 'swing', step: 0.8 },
    kick: { frames: 26, active: [7, 13], box: [3, -23, 23, 14], dmg: 2, kb: 4.4, lift: -2.8, stop: 7, pose: 'kick', heavy: true, sfx: 'swing2', step: 1.1 },
    airkick: { box: [2, -20, 20, 16], dmg: 2, kb: 3.4, lift: -1.6, stop: 6, heavy: true, sfx: 'swing2' },
    spin: { box: [-26, -32, 52, 34], dmg: 1, kb: 3.6, lift: -2.4, stop: 4, heavy: true, sfx: 'spin', around: true }
  };
  TC.ATK = ATK;
  var attackSeq = 1;

  function Player(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.w = 12; this.h = 30;
    this.face = 1;
    this.maxHp = 10; this.hp = 10;
    this.state = 'normal';
    this.t = 0;
    this.anim = 0;
    this.inv = 0;
    this.coyote = 0; this.jumpBuf = 0; this.atkBuf = 0;
    this.alive = true;
    this.control = true;
    this.pose = 'idle'; this.poseFrame = 0;
    this.lastSafe = { x: x, y: y };
    this.hitstop = 0;
    this.airAttacked = false;
    this.dropThrough = 0;
    this.onGround = false;
    this.lieT = 0;
    this.spinHit = false;
    this.useArena = true;
  }

  Player.prototype.setState = function (s) { this.state = s; this.t = 0; };
  Player.prototype.hurtBox = function () { return { x: this.x - 6, y: this.y - 30, w: 12, h: 30 }; };
  Player.prototype.atkBox = function (b) {
    if (b === ATK.spin.box) return { x: this.x + b[0], y: this.y + b[1], w: b[2], h: b[3] };
    var x = this.face > 0 ? this.x + b[0] : this.x - b[0] - b[2];
    return { x: x, y: this.y + b[1], w: b[2], h: b[3] };
  };

  Player.prototype.startAttack = function (name) {
    var a = ATK[name];
    this.setState('attack');
    this.atk = name;
    this.queued = false;
    this.atkId = attackSeq++;
    TC.audio.sfx(a.sfx);
  };

  Player.prototype.jump = function (st) {
    this.vy = -5.6;
    this.jumpBuf = 0;
    this.coyote = 0;
    this.airAttacked = false;
    TC.audio.sfx('jump');
    st.dust(this.x, this.y);
  };

  Player.prototype.damage = function (st, dmg, dir, heavy) {
    if (!this.alive || this.inv > 0 || this.state === 'spin' || this.state === 'down' || this.state === 'getup' || this.state === 'dead' || this.state === 'cine') return false;
    if (st.mode !== 'play') return false;
    this.hp -= dmg;
    TC.fx.shake(dmg > 1 ? 3 : 2, 8);
    st.spark(this.x, this.y - 18, 1);
    TC.audio.sfx('hurt');
    if (this.hp <= 0) {
      this.hp = 0;
      this.setState('dead');
      this.vy = -4; this.vx = dir * 2.2;
      this.alive = true;
      TC.audio.sfx('die');
      st.onPlayerDying();
      return true;
    }
    if (dmg >= 2 || heavy) {
      this.setState('down');
      this.vy = -3.2; this.vx = dir * 2.4;
      this.lieT = 0;
      this.inv = 110;
    } else {
      this.setState('hurt');
      this.vx = dir * 2.2;
      if (this.onGround) this.vy = -1.6;
      this.inv = 70;
    }
    this.face = -dir;
    return true;
  };

  Player.prototype.update = function (st) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    this.t++;
    this.anim++;
    if (this.inv > 0) this.inv--;
    var I = TC.input;
    var ctl = this.control && st.mode === 'play';
    var left = ctl && I.down('left'), right = ctl && I.down('right');
    var jumpP = ctl && I.pressed('jump'), jumpD = ctl && I.down('jump');
    if (jumpP) this.jumpBuf = 7; else if (this.jumpBuf > 0) this.jumpBuf--;
    if (ctl && I.pressed('attack')) this.atkBuf = 8; else if (this.atkBuf > 0) this.atkBuf--;
    var spP = ctl && I.pressed('special');
    if (TC.params.bot && ctl) {
      var B = this.bot(st);
      left = B.left; right = B.right; jumpD = B.jump;
      if (B.jump && !this._bj) this.jumpBuf = 7;
      this._bj = B.jump;
      if (B.atk) this.atkBuf = 8;
      spP = B.sp;
    }
    var wasGround = this.onGround, prevVy = this.vy;
    var a;

    switch (this.state) {
      case 'normal': {
        var dir = (right ? 1 : 0) - (left ? 1 : 0);
        var accel = this.onGround ? 0.34 : 0.24, max = 1.9;
        if (dir) { this.vx = TC.approach(this.vx, dir * max, accel); this.face = dir; }
        else this.vx = TC.approach(this.vx, 0, this.onGround ? 0.4 : 0.06);
        if (this.onGround) { this.coyote = 6; this.airAttacked = false; }
        else if (this.coyote > 0) this.coyote--;
        if (this.jumpBuf && this.coyote) {
          if (ctl && I.down('down') && st.level.tile(Math.floor(this.x / 16), Math.floor(this.y / 16)) === 2) {
            this.dropThrough = 10; this.jumpBuf = 0; this.vy = 1; this.onGround = false;
          } else this.jump(st);
        }
        if (!jumpD && this.vy < -2.4) this.vy = -2.4;
        if (this.atkBuf) {
          this.atkBuf = 0;
          if (this.onGround) this.startAttack('punch1');
          else if (!this.airAttacked) { this.setState('airkick'); this.airAttacked = true; this.atkId = attackSeq++; TC.audio.sfx('swing2'); }
        }
        if (spP) this.startSpin(st);
        if (this.onGround && Math.abs(this.vx) > 0.5 && this.anim % 16 === 0) TC.audio.sfx('step');
        break;
      }
      case 'attack': {
        a = ATK[this.atk];
        var act = this.t >= a.active[0] && this.t <= a.active[1];
        this.vx = TC.approach(this.vx, act ? this.face * a.step : 0, 0.3);
        if (act) st.playerAttack(this, a, this.atkBox(a.box), this.atkId);
        if (this.atkBuf && a.next && this.t >= a.window) { this.queued = true; this.atkBuf = 0; }
        if (this.queued && this.t > a.active[1] + 1) {
          if (left && this.face > 0) this.face = -1;
          if (right && this.face < 0) this.face = 1;
          this.startAttack(a.next);
          break;
        }
        if (this.jumpBuf && this.t > a.active[1] && this.onGround) { this.setState('normal'); this.jump(st); break; }
        if (spP) { this.startSpin(st); break; }
        if (this.t >= a.frames) this.setState('normal');
        break;
      }
      case 'airkick': {
        var d2 = (right ? 1 : 0) - (left ? 1 : 0);
        if (d2) this.vx = TC.approach(this.vx, d2 * 1.9, 0.12);
        if (this.t >= 3) st.playerAttack(this, ATK.airkick, this.atkBox(ATK.airkick.box), this.atkId);
        if (this.onGround || this.t > 44) this.setState('normal');
        break;
      }
      case 'spin': {
        this.vx = TC.approach(this.vx, this.face * 0.8, 0.2);
        if (this.t % 9 === 1) { this.atkId = attackSeq++; TC.audio.sfx('spin'); }
        if (st.playerAttack(this, ATK.spin, this.atkBox(ATK.spin.box), this.atkId)) this.spinHit = true;
        if (this.t >= 36) {
          if (this.spinHit && this.hp > 1) this.hp -= 1;
          this.setState('normal');
          this.inv = Math.max(this.inv, 10);
        }
        break;
      }
      case 'hurt':
        this.vx = TC.approach(this.vx, 0, 0.15);
        if (this.t >= 18) this.setState('normal');
        break;
      case 'down':
        if (this.onGround && this.t > 6) {
          this.vx = TC.approach(this.vx, 0, 0.3);
          if (this.lieT === 0) { TC.audio.sfx('land'); st.dust(this.x, this.y); TC.fx.shake(2, 6); }
          this.lieT++;
          if (this.lieT > 40) this.setState('getup');
        }
        break;
      case 'getup':
        this.vx = 0;
        if (this.t >= 18) this.setState('normal');
        break;
      case 'dead':
        if (this.onGround) this.vx = TC.approach(this.vx, 0, 0.2);
        if (this.t === 150) st.onPlayerDead();
        break;
      case 'cine':
        this.vx = TC.approach(this.vx, this.cineVx || 0, 0.3);
        break;
    }

    var g = this.state === 'airkick' ? 0.24 : E.GRAV;
    this.vy = Math.min(E.MAXFALL, this.vy + g);
    this.dropThroughFlag();
    E.moveBody(this, st.level);
    if (!wasGround && this.onGround && prevVy > 2.5 && this.state !== 'down' && this.state !== 'dead') {
      TC.audio.sfx('land');
      st.dust(this.x, this.y);
    }
    if (this.onGround && this.state !== 'dead') {
      var under = st.level.tile(Math.floor(this.x / 16), Math.floor(this.y / 16));
      if (under !== 4) { this.lastSafe.x = this.x; this.lastSafe.y = this.y; }
    }
    if (this.y > st.level.pxH + 24 && this.state !== 'dead') st.playerFell(this);
  };

  /* piloto automático para testes (?bot=1) */
  Player.prototype.bot = function (st) {
    var o = { left: false, right: false, jump: false, atk: false, sp: false };
    var best = null, bd = 1e9, self = this;
    st.enemies.forEach(function (e) {
      if (!e.alive || e.dying || e.state === 'away' || e.state === 'intro') return;
      if (e.x < st.camX - 10 || e.x > st.camX + TC.W + 10) return;
      var d = Math.abs(e.x - self.x) + Math.abs(e.y - self.y) * 0.5;
      if (d < bd) { bd = d; best = e; }
    });
    st.props.forEach(function (p) {
      var d = p.x - self.x;
      if (d > -10 && d < 40 && !best) { best = p; bd = Math.abs(d); }
    });
    var lvl = st.level;
    if (best) {
      var dx = best.x - this.x, dy = best.y - this.y;
      if (Math.abs(dx) > 18) { o.right = dx > 0; o.left = dx < 0; }
      else if ((dx > 0) !== (this.face > 0)) { o.right = dx > 0; o.left = dx < 0; }
      if (Math.abs(dx) < 30 && dy > -40 && st.t % 6 === 0) o.atk = true;
      if (Math.abs(dx) < 34 && dy < -36 && this.onGround && st.t % 30 === 0) o.jump = true;
      if (!this.onGround && dy < -20 && Math.abs(dx) < 30 && st.t % 5 === 0) o.atk = true;
      if (this.hp > 4 && st.t % 240 === 0) o.sp = true;
    } else {
      o.right = true;
    }
    var ax = this.x + (o.right ? 22 : o.left ? -22 : this.face * 22);
    var tx = Math.floor(ax / 16), ty = Math.floor((this.y + 4) / 16);
    var below = lvl.tile(tx, ty);
    var wall = TC.ent.isSolid(lvl.tile(Math.floor((this.x + (o.left ? -12 : 12)) / 16), Math.floor((this.y - 8) / 16)));
    if (this.onGround && (o.left || o.right) && (!TC.ent.isSolid(below) && below !== 2 || wall)) o.jump = true;
    if (!this.onGround && this.vy < 0) o.jump = true;
    return o;
  };

  // enquanto dropThrough > 0 o corpo atravessa plataformas vazadas (moveBody)
  Player.prototype.dropThroughFlag = function () {
    if (this.dropThrough > 0) this.dropThrough--;
  };

  Player.prototype.startSpin = function (st) {
    if (this.state === 'spin' || this.hp <= 0) return;
    this.setState('spin');
    this.spinHit = false;
    this.inv = Math.max(this.inv, 4);
    this.vy = Math.min(this.vy, this.onGround ? -1.5 : this.vy);
    this.atkId = attackSeq++;
  };

  Player.prototype.frame = function () {
    var A = TC.ART.arno;
    var s = this.state, a;
    switch (s) {
      case 'normal':
        if (!this.onGround) return this.vy < 0 ? A.jump[0] : A.fall[0];
        if (Math.abs(this.vx) > 0.25) return A.run[Math.floor(this.anim / 5) % 8];
        return A.idle[Math.floor(this.anim / 32) % 2];
      case 'attack':
        a = ATK[this.atk];
        var arr = A[a.pose];
        if (this.t < a.active[0]) return arr[0];
        if (this.t <= a.active[1] + 1) return arr[1];
        return arr[2];
      case 'airkick': return A.airkick[0];
      case 'spin': return A.spin[Math.floor(this.t / 3) % 2];
      case 'hurt': return A.hurt[0];
      case 'down': return this.onGround && this.t > 6 ? A.lie[0] : A.hurt[0];
      case 'getup': return A.kneel[0];
      case 'dead': return this.onGround && this.t > 10 ? A.lie[0] : A.hurt[0];
      case 'cine': {
        var arr2 = A[this.pose] || A.idle;
        if (this.pose === 'run') return arr2[Math.floor(this.anim / 5) % 8];
        if (this.pose === 'idle') return arr2[Math.floor(this.anim / 32) % 2];
        return arr2[this.poseFrame % arr2.length];
      }
    }
    return A.idle[0];
  };

  Player.prototype.draw = function (c, cx, cy) {
    if (this.inv > 0 && this.state !== 'down' && this.state !== 'spin' && (this.inv >> 1) % 2) return;
    if (this.state === 'dead' && this.t > 90 && (this.t >> 1) % 2) return;
    var f = this.frame();
    var face = this.face;
    if (this.state === 'spin') face = (Math.floor(this.t / 3) % 2) ? -this.face : this.face;
    var img = face < 0 ? TC.flip(f) : f;
    var ox = face < 0 ? f.width - f.ox : f.ox;
    c.drawImage(img, Math.round(this.x - ox - cx), Math.round(this.y - f.oy - cy) + 1);
    if (this.state === 'spin') {
      // rastro do giro
      c.globalAlpha = 0.35;
      c.drawImage(TC.flip(img), Math.round(this.x - (f.width - ox) - cx), Math.round(this.y - f.oy - cy) + 1);
      c.globalAlpha = 1;
    }
  };

  TC.Player = Player;
})();
