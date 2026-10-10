'use strict';
/* Teewald City — efeitos de tela (brilho, mosaico, tremor, flash), partículas e iluminação */
(function () {
  /* ---------- efeitos globais de tela (aplicados no pós-processamento) ---------- */
  var fx = TC.fx = {
    bright: 15,       // 0..15 como o registrador INIDISP do SNES
    mosaic: 1,        // 1..16
    shakeAmt: 0, shakeT: 0,
    ox: 0, oy: 0,
    flashA: 0, flashCol: '#ffffff', flashDecay: 0.08,
    letterbox: 0,     // altura das barras de cinema
    _tweens: []
  };

  fx.reset = function () {
    fx.bright = 15; fx.mosaic = 1; fx.shakeAmt = 0; fx.shakeT = 0; fx.flashA = 0; fx.letterbox = 0;
    fx._tweens = [];
  };
  fx.tween = function (key, to, frames, ease) {
    fx._tweens = fx._tweens.filter(function (t) { return t.key !== key; });
    if (frames <= 0) { fx[key] = to; return; }
    fx._tweens.push({ key: key, from: fx[key], to: to, t: 0, n: frames, ease: ease || TC.ease.linear });
  };
  fx.busy = function (key) {
    return fx._tweens.some(function (t) { return !key || t.key === key; });
  };
  fx.fadeOut = function (frames) { fx.tween('bright', 0, frames == null ? 30 : frames); };
  fx.fadeIn = function (frames) { fx.tween('bright', 15, frames == null ? 30 : frames); };
  fx.shake = function (amt, frames) {
    fx.shakeAmt = Math.max(fx.shakeAmt, amt);
    fx.shakeT = Math.max(fx.shakeT, frames || 10);
    if (TC.input && TC.input.shake) TC.input.shake(amt, frames || 10);   // e o controle treme junto
  };
  fx.flash = function (col, a, decay) {
    fx.flashCol = col || '#ffffff';
    fx.flashA = a == null ? 1 : a;
    fx.flashDecay = decay || 0.08;
  };
  fx.update = function () {
    for (var i = fx._tweens.length - 1; i >= 0; i--) {
      var t = fx._tweens[i];
      t.t++;
      var k = Math.min(1, t.t / t.n);
      fx[t.key] = t.from + (t.to - t.from) * t.ease(k);
      if (k >= 1) fx._tweens.splice(i, 1);
    }
    if (fx.shakeT > 0) {
      fx.shakeT--;
      var a = fx.shakeAmt * Math.min(1, fx.shakeT / 8 + 0.2);
      fx.ox = Math.round((Math.random() * 2 - 1) * a);
      fx.oy = Math.round((Math.random() * 2 - 1) * a);
      if (fx.shakeT <= 0) { fx.shakeAmt = 0; fx.ox = fx.oy = 0; }
    } else { fx.ox = fx.oy = 0; }
    if (fx.flashA > 0) fx.flashA = Math.max(0, fx.flashA - fx.flashDecay);
  };

  /* ---------- partículas ---------- */
  function Particles() { this.list = []; }
  Particles.prototype.add = function (p) {
    p.life = p.life || 30;
    p.max = p.life;
    p.vx = p.vx || 0; p.vy = p.vy || 0;
    p.ax = p.ax || 0; p.ay = p.ay || 0;
    p.size = p.size || 1;
    p.drag = p.drag == null ? 1 : p.drag;
    this.list.push(p);
    return p;
  };
  Particles.prototype.update = function () {
    var l = this.list;
    for (var i = l.length - 1; i >= 0; i--) {
      var p = l[i];
      p.vx = p.vx * p.drag + p.ax;
      p.vy = p.vy * p.drag + p.ay;
      p.x += p.vx; p.y += p.vy;
      if (p.wobble) p.x += Math.sin((p.max - p.life) * p.wobble + (p.phase || 0)) * 0.3;
      if (p.update) p.update(p);
      if (--p.life <= 0) l.splice(i, 1);
    }
  };
  Particles.prototype.draw = function (ctx, cx, cy, layer) {
    cx = cx || 0; cy = cy || 0;
    var l = this.list;
    for (var i = 0; i < l.length; i++) {
      var p = l[i];
      if ((p.layer || 0) !== (layer || 0)) continue;
      var x = Math.round(p.x - cx), y = Math.round(p.y - cy);
      var k = p.life / p.max;
      if (p.sprite) {
        var sp = typeof p.sprite === 'function' ? p.sprite(p, k) : p.sprite;
        if (sp) ctx.drawImage(sp, x - (sp.width >> 1), y - (sp.height >> 1));
        continue;
      }
      var col = p.colors ? p.colors[Math.min(p.colors.length - 1, Math.floor((1 - k) * p.colors.length))] : p.color;
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      if (p.fade) ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
      ctx.fillStyle = col;
      var s = p.shrink ? Math.max(1, Math.round(p.size * k)) : p.size;
      if (s <= 1) ctx.fillRect(x, y, 1, 1);
      else if (p.round) TC.fillCircle(ctx, x, y, s / 2);
      else ctx.fillRect(x - (s >> 1), y - (s >> 1), s, s);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  };
  Particles.prototype.clear = function () { this.list.length = 0; };
  TC.Particles = Particles;

  /* ---------- iluminação: buffer de luz multiplicado sobre a cena ---------- */
  function Lighting(w, h) {
    this.w = w || TC.W; this.h = h || TC.H;
    this.cv = TC.canvas(this.w, this.h);
    this.ctx = this.cv.ctx;
    this.ambient = '#404070';
    this.lights = [];
  }
  Lighting.prototype.begin = function (ambient) {
    this.ambient = ambient || this.ambient;
    this.lights.length = 0;
  };
  // x, y em coordenadas de tela; r raio; col cor; a intensidade (0..1+)
  Lighting.prototype.add = function (x, y, r, col, a) {
    if (x + r < 0 || x - r > this.w || y + r < 0 || y - r > this.h) return;
    this.lights.push({ x: x, y: y, r: r, col: col, a: a == null ? 1 : a });
  };
  Lighting.prototype.apply = function (target) {
    var c = this.ctx;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = TC.col(this.ambient);
    c.fillRect(0, 0, this.w, this.h);
    c.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.lights.length; i++) {
      var L = this.lights[i];
      var st = TC.lightStamp(Math.round(L.r), L.col, 4);
      c.globalAlpha = Math.min(1, L.a);
      c.drawImage(st, Math.round(L.x - st.width / 2), Math.round(L.y - st.height / 2));
      if (L.a > 1) {
        c.globalAlpha = Math.min(1, L.a - 1);
        c.drawImage(st, Math.round(L.x - st.width / 2), Math.round(L.y - st.height / 2));
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    target.globalCompositeOperation = 'multiply';
    target.drawImage(this.cv, 0, 0);
    target.globalCompositeOperation = 'source-over';
  };
  /* brilho aditivo (bloom) para lâmpadas e chamas */
  Lighting.glow = function (ctx, x, y, r, col, a) {
    var st = TC.lightStamp(Math.round(r), col, 4);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a == null ? 0.5 : a;
    ctx.drawImage(st, Math.round(x - st.width / 2), Math.round(y - st.height / 2));
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
  TC.Lighting = Lighting;

  /* ---------- corrotinas para roteiros de cutscene ---------- */
  function Script(gen) {
    this.stack = [gen];
    this.done = false;
  }
  Script.prototype.update = function () {
    if (this.done) return;
    var r = this.stack[0].next();
    if (r.done) this.done = true;
  };
  TC.Script = Script;

  TC.co = {
    wait: function* (frames) { for (var i = 0; i < frames; i++) yield; },
    until: function* (fn) { while (!fn()) yield; },
    tween: function* (obj, key, to, frames, ease) {
      var from = obj[key];
      ease = ease || TC.ease.linear;
      for (var i = 1; i <= frames; i++) {
        obj[key] = from + (to - from) * ease(i / frames);
        yield;
      }
    },
    /* executa vários geradores em paralelo até todos terminarem */
    all: function* () {
      var gens = Array.prototype.slice.call(arguments);
      var alive = gens.map(function () { return true; });
      while (alive.some(Boolean)) {
        for (var i = 0; i < gens.length; i++) {
          if (alive[i] && gens[i].next().done) alive[i] = false;
        }
        if (alive.some(Boolean)) yield;
      }
    }
  };
})();
