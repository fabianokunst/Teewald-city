'use strict';
/* Teewald City — estrada pseudo-3D com sprites escalados (estilo Top Gear / Out Run no SNES) */
(function () {
  function Road(opt) {
    opt = opt || {};
    this.W = opt.w || TC.W;
    this.H = opt.h || 150;
    this.horizon = opt.horizon || Math.round(this.H * 0.5);
    this.segLen = 200;
    this.rumbleLen = 3;
    this.roadWidth = opt.roadWidth || 1300;
    this.camHeight = opt.camHeight || 1150;
    this.camDepth = 1 / Math.tan((opt.fov || 96) / 2 * Math.PI / 180);
    this.drawDist = opt.drawDist || 130;
    this.fogDist = this.drawDist;
    this.fogColor = opt.fogColor || '#181a36';
    this.headlights = 1;
    this.segments = [];
    this.position = 0;
    this.playerX = 0;
    this.gen = opt.gen || null;
    this.cv = TC.canvas(this.W, this.H);
    this.skyX = 0;
    this.camY = 0;
    this.colors = opt.colors || {
      road: ['#33313c', '#2d2b36'], grass: ['#1b2c22', '#17261e'], rumble: ['#5a5650', '#3a3834'],
      edge: '#c8c8c0', center: '#d0a030'
    };
    this.rampCache = {};
  }

  Road.prototype.lastY = function () {
    var n = this.segments.length;
    return n ? this.segments[n - 1].p2.world.y : 0;
  };
  Road.prototype.addSegment = function (curve, y) {
    var n = this.segments.length;
    this.segments.push({
      index: n,
      p1: { world: { y: this.lastY(), z: n * this.segLen }, camera: {}, screen: {} },
      p2: { world: { y: y, z: (n + 1) * this.segLen }, camera: {}, screen: {} },
      curve: curve,
      sprites: [],
      dark: Math.floor(n / this.rumbleLen) % 2,
      clip: this.H
    });
  };
  function easeIn(a, b, t) { return a + (b - a) * Math.pow(t, 2); }
  function easeInOut(a, b, t) { return a + (b - a) * ((-Math.cos(t * Math.PI) / 2) + 0.5); }
  Road.prototype.addRoad = function (enter, hold, leave, curve, hill) {
    enter = Math.max(1, Math.round(enter)); hold = Math.max(0, Math.round(hold)); leave = Math.max(1, Math.round(leave));
    var startY = this.lastY();
    var endY = startY + hill * this.segLen;
    var total = enter + hold + leave, n;
    for (n = 0; n < enter; n++) this.addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
    for (n = 0; n < hold; n++) this.addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
    for (n = 0; n < leave; n++) this.addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
  };
  Road.prototype.ensure = function () {
    var base = Math.floor(this.position / this.segLen);
    var guard = 0;
    while (this.segments.length < base + this.drawDist + 60 && this.gen && guard++ < 50) this.gen(this);
  };
  Road.prototype.segAt = function (z) {
    return this.segments[Math.max(0, Math.floor(z / this.segLen)) % this.segments.length];
  };
  Road.prototype.curveAt = function () {
    this.ensure();
    var s = this.segAt(this.position);
    return s ? s.curve : 0;
  };
  Road.prototype.addSprite = function (segIndex, cv, offset, scale) {
    var s = this.segments[segIndex];
    if (s) s.sprites.push({ cv: cv, off: offset, s: scale || 1 });
  };

  /* rampa de cor: luz dos faróis (perto) e neblina (longe) */
  Road.prototype.shade = function (base, h, f) {
    var hq = Math.round(h * 6), fq = Math.round(f * 10);
    var key = base + '|' + hq + '|' + fq + '|' + this.fogColor;
    var c = this.rampCache[key];
    if (c) return c;
    var lit = TC.mix(base, '#ffe0a8', 0.32);
    var col = TC.mix(base, lit, hq / 6);
    col = TC.mix(col, this.fogColor, Math.pow(fq / 10, 0.9));
    this.rampCache[key] = col;
    return col;
  };

  function project(p, camX, camY, camZ, depth, W, H, horizon, roadW) {
    p.camera.x = (p.world.x || 0) - camX;
    p.camera.y = p.world.y - camY;
    p.camera.z = p.world.z - camZ;
    p.screen.scale = depth / p.camera.z;
    p.screen.x = W / 2 + p.screen.scale * p.camera.x * W / 2;
    p.screen.y = horizon - p.screen.scale * p.camera.y * W / 2;
    p.screen.w = p.screen.scale * roadW * W / 2;
  }

  /* desenha a estrada; bgFn(ctx, skyX, camY) desenha o fundo antes */
  Road.prototype.render = function (bgFn) {
    this.ensure();
    var c = this.cv.ctx, W = this.W, H = this.H;
    var segLen = this.segLen;
    var base = this.segAt(this.position);
    var pct = (this.position % segLen) / segLen;
    var playerY = base.p1.world.y + (base.p2.world.y - base.p1.world.y) * pct;
    var camY = playerY + this.camHeight;
    this.camY = camY;
    this.playerY = playerY;
    if (bgFn) bgFn(c, this.skyX, playerY);
    var maxy = H;
    var x = 0, dx = -(base.curve * pct);
    var col = this.colors, n, seg;
    var drawn = [];
    for (n = 0; n < this.drawDist; n++) {
      seg = this.segments[base.index + n];
      if (!seg) break;
      project(seg.p1, this.playerX * this.roadWidth - x, camY, this.position, this.camDepth, W, H, this.horizon, this.roadWidth);
      project(seg.p2, this.playerX * this.roadWidth - x - dx, camY, this.position, this.camDepth, W, H, this.horizon, this.roadWidth);
      x += dx;
      dx += seg.curve;
      seg.n = n;
      seg.clip = maxy;
      if (seg.p1.camera.z <= this.camDepth || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxy) continue;
      var h = TC.clamp(1 - n / 26, 0, 1) * this.headlights;
      var f = TC.clamp(n / this.fogDist, 0, 1);
      var road = this.shade(col.road[seg.dark], h, f);
      var grass = this.shade(col.grass[seg.dark], h * 0.6, f);
      var rumble = this.shade(col.rumble[seg.dark], h, f);
      var edge = this.shade(col.edge, h, f);
      var center = this.shade(col.center, h, f);
      var y1 = seg.p1.screen.y, y2 = seg.p2.screen.y;
      var top = Math.max(0, Math.ceil(y2)), bot = Math.min(maxy, Math.ceil(y1), H);
      for (var r = top; r < bot; r++) {
        var t = (r - y2) / (y1 - y2);
        var sx = seg.p2.screen.x + (seg.p1.screen.x - seg.p2.screen.x) * t;
        var sw = seg.p2.screen.w + (seg.p1.screen.w - seg.p2.screen.w) * t;
        var rw = Math.max(1, sw / 7);
        var lw = Math.max(1, Math.round(sw / 40));
        c.fillStyle = grass;
        c.fillRect(0, r, W, 1);
        c.fillStyle = rumble;
        c.fillRect(Math.round(sx - sw - rw), r, Math.round(rw), 1);
        c.fillRect(Math.round(sx + sw), r, Math.round(rw), 1);
        c.fillStyle = road;
        c.fillRect(Math.round(sx - sw), r, Math.round(sw * 2), 1);
        c.fillStyle = edge;
        c.fillRect(Math.round(sx - sw + lw), r, lw, 1);
        c.fillRect(Math.round(sx + sw - lw * 2), r, lw, 1);
        if (!seg.dark) {
          c.fillStyle = center;
          c.fillRect(Math.round(sx - lw * 1.5), r, lw, 1);
          c.fillRect(Math.round(sx + lw * 0.5), r, lw, 1);
        }
      }
      maxy = Math.min(maxy, Math.max(0, Math.ceil(y2)));
      drawn.push(seg);
    }
    // sprites do mais longe para o mais perto
    for (n = this.drawDist - 1; n >= 0; n--) {
      seg = this.segments[base.index + n];
      if (!seg || !seg.sprites.length) continue;
      if (seg.p1.camera.z <= this.camDepth) continue;
      var scale = seg.p1.screen.scale;
      var fogLv = Math.min(5, Math.floor(TC.clamp(n / this.fogDist, 0, 1) * 6));
      for (var i = 0; i < seg.sprites.length; i++) {
        var sp = seg.sprites[i];
        var img = fogLv > 0 ? TC.tintCached(sp.cv, this.fogColor, Math.min(0.95, fogLv / 5.5)) : sp.cv;
        var dw = sp.cv.width * sp.s * scale * W / 2;
        var dh = sp.cv.height * sp.s * scale * W / 2;
        if (dw < 1 || dh < 1) continue;
        var bx = sp.cv.baseX != null ? sp.cv.baseX / sp.cv.width : 0.5;
        var dX = seg.p1.screen.x + sp.off * seg.p1.screen.w - dw * bx;
        var dY = seg.p1.screen.y - dh;
        if (dX > W || dX + dw < 0) continue;
        var clip = seg.clip;
        var visH = Math.min(dh, clip - dY);
        if (visH <= 0) continue;
        var srcH = sp.cv.height * (visH / dh);
        c.drawImage(img, 0, 0, sp.cv.width, Math.max(1, Math.round(srcH)), Math.round(dX), Math.round(dY), Math.round(dw), Math.round(visH));
      }
    }
    return this.cv;
  };

  TC.Road = Road;
})();
