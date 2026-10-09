'use strict';
/* Teewald City — base das entidades da fase: física com tiles, itens, caixotes, projéteis, textos flutuantes */
(function () {
  var TS = 16;
  var E = TC.ent = {};
  E.TS = TS;
  E.GRAV = 0.28;
  E.MAXFALL = 6.5;

  /* tiles: 0 vazio, 1 chão, 2 plataforma vazada, 3 pedra, 4 água, 5 tábua sólida */
  E.isSolid = function (code) { return code === 1 || code === 3 || code === 5; };

  /* move um corpo (x = centro, y = pés) colidindo com os tiles */
  E.moveBody = function (b, level) {
    var hw = b.w / 2;
    // horizontal
    b.x += b.vx;
    var top = b.y - b.h + 1, bot = b.y - 1;
    var ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
    var ty, tx;
    b.hitWall = 0;
    if (b.vx > 0) {
      tx = Math.floor((b.x + hw) / TS);
      for (ty = ty0; ty <= ty1; ty++) if (E.isSolid(level.tile(tx, ty))) { b.x = tx * TS - hw - 0.01; b.vx = 0; b.hitWall = 1; break; }
    } else if (b.vx < 0) {
      tx = Math.floor((b.x - hw) / TS);
      for (ty = ty0; ty <= ty1; ty++) if (E.isSolid(level.tile(tx, ty))) { b.x = (tx + 1) * TS + hw + 0.01; b.vx = 0; b.hitWall = -1; break; }
    }
    var minX = b.useArena ? level.minX : 0, maxX = b.useArena ? level.maxX : level.pxW;
    if (b.x - hw < minX) { b.x = minX + hw; b.vx = Math.max(0, b.vx); b.hitWall = -1; }
    if (b.x + hw > maxX) { b.x = maxX - hw; b.vx = Math.min(0, b.vx); b.hitWall = 1; }
    // vertical
    var prevY = b.y;
    b.y += b.vy;
    var tx0 = Math.floor((b.x - hw + 1) / TS), tx1 = Math.floor((b.x + hw - 1) / TS);
    b.onGround = false;
    if (b.vy >= 0) {
      ty = Math.floor(b.y / TS);
      var pty = Math.floor((prevY - 0.01) / TS);
      for (tx = tx0; tx <= tx1; tx++) {
        var c = level.tile(tx, ty);
        if (E.isSolid(c) || (c === 2 && pty < ty && !b.dropThrough)) {
          b.y = ty * TS; b.vy = 0; b.onGround = true; break;
        }
      }
    } else {
      ty = Math.floor((b.y - b.h) / TS);
      for (tx = tx0; tx <= tx1; tx++) {
        if (E.isSolid(level.tile(tx, ty))) { b.y = (ty + 1) * TS + b.h; b.vy = 0; break; }
      }
    }
  };

  E.box = function (b) { return { x: b.x - b.w / 2, y: b.y - b.h, w: b.w, h: b.h }; };

  /* ---------- itens ---------- */
  var ITEM = {
    cuca: { heal: 3, score: 50 },
    linguica: { heal: 2, score: 50 },
    chimarrao: { heal: 99, score: 100 },
    pinhao: { heal: 0, score: 100 },
    medalha: { heal: 0, score: 500, life: 1 }
  };
  function Item(type, x, y, pop) {
    this.type = type;
    this.x = x; this.y = y;
    this.w = 12; this.h = 10;
    this.vx = pop ? TC.rnd.range(-0.8, 0.8) : 0;
    this.vy = pop ? -3.2 : 0;
    this.t = 0;
    this.alive = true;
    this.floating = !pop;
    this.life = pop ? 60 * 12 : -1;
  }
  Item.prototype.update = function (st) {
    this.t++;
    if (!this.floating) {
      this.vy = Math.min(E.MAXFALL, this.vy + E.GRAV);
      E.moveBody(this, st.level);
      if (this.onGround) this.vx *= 0.8;
    }
    if (this.life > 0 && --this.life <= 0) this.alive = false;
    var p = st.player;
    if (p.alive && TC.overlap(E.box(this), p.hurtBox())) this.collect(st);
  };
  Item.prototype.collect = function (st) {
    var d = ITEM[this.type], p = st.player;
    this.alive = false;
    st.addScore(d.score);
    if (d.life) { st.lives++; TC.audio.sfx('oneup'); st.floatText(this.x, this.y - 18, TC.t('item.1up'), '#ffe060'); return; }
    if (d.heal) {
      p.hp = Math.min(p.maxHp, p.hp + d.heal);
      TC.audio.sfx('heal');
      st.floatText(this.x, this.y - 18, TC.t('item.' + this.type), '#a0ff90');
      st.parts.add({ x: p.x, y: p.y - 16, vy: -0.6, life: 30, color: '#a0ffa0', size: 2, fade: true });
    } else {
      TC.audio.sfx('coin');
      st.floatText(this.x, this.y - 14, '+' + d.score, '#ffd060');
    }
  };
  Item.prototype.draw = function (c, cx, cy) {
    if (this.life > 0 && this.life < 120 && (this.t >> 2) % 2) return;
    var img = TC.ART.items[this.type];
    var bob = this.floating ? Math.round(Math.sin(this.t * 0.08) * 2) : 0;
    c.drawImage(img, Math.round(this.x - img.width / 2 - cx), Math.round(this.y - img.height - cy + bob));
    if (this.type === 'pinhao' || this.type === 'medalha') {
      if ((this.t % 40) < 4) { c.fillStyle = '#ffffff'; c.fillRect(Math.round(this.x - cx + 2), Math.round(this.y - img.height - cy + bob + 1), 1, 1); }
    }
  };
  E.Item = Item;

  /* ---------- caixotes e barris quebráveis ---------- */
  function Breakable(kind, x, y, drop) {
    this.kind = kind;
    this.x = x; this.y = y;
    this.w = kind === 'barrel' ? 14 : 16;
    this.h = 16;
    this.hp = 2;
    this.drop = drop;
    this.alive = true;
    this.shake = 0;
    this.lastHit = -1;
    this.isProp = true;
    this.name = 'en.' + kind;
    this.maxHp = 2;
  }
  Breakable.prototype.update = function () { if (this.shake > 0) this.shake--; };
  Breakable.prototype.hurtBox = function () { return E.box(this); };
  Breakable.prototype.hit = function (st, dmg, dir, kb, id) {
    if (id === this.lastHit) return false;
    this.lastHit = id;
    this.hp -= 1;
    this.shake = 10;
    TC.audio.sfx('hit');
    st.showEnemyBar(this);
    if (this.hp <= 0) {
      this.alive = false;
      TC.audio.sfx('break');
      for (var i = 0; i < 12; i++) {
        st.parts.add({ x: this.x, y: this.y - 8, vx: TC.rnd.range(-2, 2) + dir, vy: TC.rnd.range(-3.5, -1), ay: 0.2, life: 40, color: TC.rnd.pick(['#7a5a38', '#a07850', '#4a3420']), size: TC.rnd.int(1, 3), fade: true });
      }
      if (this.drop) st.items.push(new Item(this.drop, this.x, this.y - 4, true));
      st.addScore(20);
    }
    return true;
  };
  Breakable.prototype.draw = function (c, cx, cy) {
    var img = this.kind === 'barrel' ? TC.ART.barrel_ : TC.ART.crate_;
    var sx = this.shake ? ((this.shake % 2) ? 1 : -1) : 0;
    c.drawImage(img, Math.round(this.x - img.width / 2 - cx + sx), Math.round(this.y - img.height - cy));
  };
  E.Breakable = Breakable;

  /* ---------- projétil (orbes do chefe) ---------- */
  function Orb(x, y, vx, vy) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.w = 8; this.h = 8;
    this.t = 0;
    this.alive = true;
    this.hp = 1;
    this.isOrb = true;
    this.lastHit = -1;
  }
  Orb.prototype.update = function (st) {
    this.t++;
    this.x += this.vx; this.y += this.vy;
    if (this.t % 3 === 0) st.parts.add({ x: this.x + TC.rnd.range(-2, 2), y: this.y + TC.rnd.range(-2, 2), life: 16, color: '#60ff80', size: 2, fade: true, shrink: true });
    if (this.t > 300 || this.y > TC.H + 20 || this.x < st.camX - 40 || this.x > st.camX + TC.W + 40) this.alive = false;
    var p = st.player;
    if (p.alive && TC.overlap({ x: this.x - 4, y: this.y - 4, w: 8, h: 8 }, p.hurtBox())) {
      if (p.damage(st, 1, this.vx > 0 ? 1 : -1)) this.alive = false;
    }
  };
  Orb.prototype.hurtBox = function () { return { x: this.x - 5, y: this.y - 5, w: 10, h: 10 }; };
  Orb.prototype.hit = function (st, dmg, dir, kb, id) {
    if (id === this.lastHit) return false;
    this.alive = false;
    TC.audio.sfx('hit');
    st.spark(this.x, this.y, 1);
    return true;
  };
  Orb.prototype.draw = function (c, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    c.fillStyle = '#20a040'; TC.fillCircle(c, x, y, 4);
    c.fillStyle = '#80ff90'; TC.fillCircle(c, x, y, 3);
    c.fillStyle = '#ffffff'; TC.fillCircle(c, x - 1, y - 1, 1);
  };
  E.Orb = Orb;

  /* ---------- texto flutuante ---------- */
  function FloatText(x, y, str, col) { this.x = x; this.y = y; this.str = str; this.col = col; this.t = 0; this.alive = true; }
  FloatText.prototype.update = function () { this.t++; this.y -= 0.4; if (this.t > 70) this.alive = false; };
  FloatText.prototype.draw = function (c, cx, cy) {
    if (this.t > 50 && (this.t >> 1) % 2) return;
    TC.font.draw(c, this.str, Math.round(this.x - cx), Math.round(this.y - cy), this.col, { align: 'center', outline: '#000000' });
  };
  E.FloatText = FloatText;
})();
