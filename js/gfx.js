'use strict';
/* Teewald City — utilitários gráficos: canvas, buffers de pixel, sprites, rotação (estilo Mode 7), ruído */
(function () {
  TC.canvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, w | 0);
    c.height = Math.max(1, h | 0);
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    c.ctx = x;
    return c;
  };

  /* ---------- buffer de pixels rápido ---------- */
  function PixBuf(w, h) {
    this.w = w | 0;
    this.h = h | 0;
    this.img = new ImageData(this.w, this.h);
    this.d = new Uint32Array(this.img.data.buffer);
  }
  PixBuf.prototype.set = function (x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = c;
  };
  PixBuf.prototype.get = function (x, y) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[y * this.w + x];
  };
  PixBuf.prototype.rect = function (x, y, w, h, c) {
    var x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
    var x1 = Math.min(this.w, (x + w) | 0), y1 = Math.min(this.h, (y + h) | 0);
    for (var j = y0; j < y1; j++) {
      var o = j * this.w;
      for (var i = x0; i < x1; i++) this.d[o + i] = c;
    }
  };
  /* mistura com alfa (0..1) em cima do pixel existente */
  PixBuf.prototype.blend = function (x, y, hex, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    var i = y * this.w + x, o = this.d[i];
    var p = TC.parse(hex);
    var oa = (o >>> 24) & 255;
    if (oa === 0) { this.d[i] = TC.u32rgb(p[0], p[1], p[2], Math.round(a * 255)); return; }
    var r = o & 255, g = (o >> 8) & 255, b = (o >> 16) & 255;
    this.d[i] = TC.u32rgb(r + (p[0] - r) * a, g + (p[1] - g) * a, b + (p[2] - b) * a, Math.max(oa, Math.round(a * 255)));
  };
  PixBuf.prototype.circle = function (cx, cy, r, c) {
    for (var dy = -r; dy <= r; dy++) {
      var w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.8));
      for (var dx = -w; dx <= w; dx++) this.set(cx + dx, cy + dy, c);
    }
  };
  PixBuf.prototype.ellipse = function (cx, cy, rx, ry, c) {
    for (var dy = -ry; dy <= ry; dy++) {
      var w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5))));
      for (var dx = -w; dx <= w; dx++) this.set(cx + dx, cy + dy, c);
    }
  };
  PixBuf.prototype.line = function (x0, y0, x1, y1, c, th) {
    th = th || 1;
    var dx = x1 - x0, dy = y1 - y0;
    var n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (var i = 0; i <= n; i++) {
      var x = Math.round(x0 + dx * i / n), y = Math.round(y0 + dy * i / n);
      if (th === 1) this.set(x, y, c);
      else this.rect(x - (th >> 1), y - (th >> 1), th, th, c);
    }
  };
  PixBuf.prototype.toCanvas = function () {
    var cv = TC.canvas(this.w, this.h);
    cv.ctx.putImageData(this.img, 0, 0);
    return cv;
  };
  TC.PixBuf = PixBuf;

  TC.bufFrom = function (cv) {
    var pb = new PixBuf(cv.width, cv.height);
    var id = cv.ctx.getImageData(0, 0, cv.width, cv.height);
    pb.img.data.set(id.data);
    return pb;
  };

  /* ---------- sprites a partir de mapas de caracteres ---------- */
  // rows: array de strings; pal: { char: '#hex' | function(x,y)->'#hex' }; '.' e ' ' = transparente
  TC.sprite = function (rows, pal, scale) {
    scale = scale || 1;
    var h = rows.length, w = 0, i;
    for (i = 0; i < h; i++) w = Math.max(w, rows[i].length);
    var pb = new PixBuf(w * scale, h * scale);
    var cache = {};
    for (var y = 0; y < h; y++) {
      var row = rows[y];
      for (var x = 0; x < row.length; x++) {
        var ch = row.charAt(x);
        if (ch === '.' || ch === ' ') continue;
        var p = pal[ch];
        if (p == null) continue;
        var c;
        if (typeof p === 'function') c = TC.u32(p(x, y));
        else { c = cache[ch]; if (c == null) c = cache[ch] = TC.u32(p); }
        if (scale === 1) pb.d[y * pb.w + x] = c;
        else pb.rect(x * scale, y * scale, scale, scale, c);
      }
    }
    return pb.toCanvas();
  };

  TC.flip = function (cv) {
    if (cv._flip) return cv._flip;
    var f = TC.canvas(cv.width, cv.height);
    f.ctx.translate(cv.width, 0);
    f.ctx.scale(-1, 1);
    f.ctx.drawImage(cv, 0, 0);
    cv._flip = f;
    f._flip = cv;
    return f;
  };

  TC.flipV = function (cv) {
    var f = TC.canvas(cv.width, cv.height);
    f.ctx.translate(0, cv.height);
    f.ctx.scale(1, -1);
    f.ctx.drawImage(cv, 0, 0);
    return f;
  };

  /* rotação por vizinho mais próximo (efeito de rotação "Mode 7" em sprites) */
  TC.rotate = function (cv, ang) {
    var sw = cv.width, sh = cv.height;
    var src = cv.ctx.getImageData(0, 0, sw, sh);
    var s32 = new Uint32Array(src.data.buffer);
    var dsz = Math.ceil(Math.sqrt(sw * sw + sh * sh)) + 2;
    var out = new PixBuf(dsz, dsz);
    var c = Math.cos(ang), s = Math.sin(ang);
    var scx = sw / 2, scy = sh / 2, dc = dsz / 2;
    for (var y = 0; y < dsz; y++) {
      var dy = y - dc + 0.5;
      for (var x = 0; x < dsz; x++) {
        var dx = x - dc + 0.5;
        var sx = Math.floor(c * dx + s * dy + scx);
        var sy = Math.floor(-s * dx + c * dy + scy);
        if (sx >= 0 && sy >= 0 && sx < sw && sy < sh) out.d[y * dsz + x] = s32[sy * sw + sx];
      }
    }
    return out.toCanvas();
  };

  TC.rotCached = function (cv, ang, steps) {
    steps = steps || 64;
    var k = Math.round(((ang % TC.TAU) + TC.TAU) % TC.TAU / TC.TAU * steps) % steps;
    if (!cv._rot) cv._rot = {};
    var key = steps + ':' + k;
    if (!cv._rot[key]) cv._rot[key] = TC.rotate(cv, k / steps * TC.TAU);
    return cv._rot[key];
  };

  /* desenha centralizado e rotacionado */
  TC.drawRot = function (ctx, cv, cx, cy, ang, steps) {
    var r = TC.rotCached(cv, ang, steps);
    ctx.drawImage(r, Math.round(cx - r.width / 2), Math.round(cy - r.height / 2));
  };

  /* cópia com cor misturada (para flash branco, neblina, sombras) */
  TC.tint = function (cv, hex, amt) {
    var pb = TC.bufFrom(cv);
    var p = TC.parse(hex);
    for (var i = 0; i < pb.d.length; i++) {
      var o = pb.d[i];
      var a = (o >>> 24) & 255;
      if (!a) continue;
      var r = o & 255, g = (o >> 8) & 255, b = (o >> 16) & 255;
      pb.d[i] = TC.u32rgb(r + (p[0] - r) * amt, g + (p[1] - g) * amt, b + (p[2] - b) * amt, a);
    }
    return pb.toCanvas();
  };

  TC.tintCached = function (cv, hex, amt) {
    if (!cv._tint) cv._tint = {};
    var k = hex + ':' + amt;
    if (!cv._tint[k]) cv._tint[k] = TC.tint(cv, hex, amt);
    return cv._tint[k];
  };

  TC.silhouette = function (cv, hex) { return TC.tint(cv, hex, 1); };

  /* contorno de 1px em volta das partes opacas */
  TC.outline = function (cv, hex, pad) {
    pad = pad == null ? 1 : pad;
    var w = cv.width + pad * 2, h = cv.height + pad * 2;
    var src = TC.canvas(w, h);
    src.ctx.drawImage(cv, pad, pad);
    var pb = TC.bufFrom(src);
    var oc = TC.u32(hex);
    var copy = new Uint32Array(pb.d);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = y * w + x;
        if ((copy[i] >>> 24) > 0) continue;
        var n = (x > 0 && (copy[i - 1] >>> 24) > 0) || (x < w - 1 && (copy[i + 1] >>> 24) > 0) ||
          (y > 0 && (copy[i - w] >>> 24) > 0) || (y < h - 1 && (copy[i + w] >>> 24) > 0);
        if (n) pb.d[i] = oc;
      }
    }
    return pb.toCanvas();
  };

  TC.scaleCanvas = function (cv, sx, sy) {
    sy = sy == null ? sx : sy;
    var o = TC.canvas(Math.max(1, Math.round(cv.width * sx)), Math.max(1, Math.round(cv.height * sy)));
    o.ctx.drawImage(cv, 0, 0, o.width, o.height);
    return o;
  };

  TC.crop = function (cv, x, y, w, h) {
    var o = TC.canvas(w, h);
    o.ctx.drawImage(cv, x, y, w, h, 0, 0, w, h);
    return o;
  };

  /* círculo preenchido por scanlines (bordas nítidas, como janelas do SNES) */
  TC.fillCircle = function (ctx, cx, cy, r) {
    cx = Math.round(cx); cy = Math.round(cy);
    if (r < 0.5) { ctx.fillRect(cx, cy, 1, 1); return; }
    var ri = Math.ceil(r);
    for (var dy = -ri; dy <= ri; dy++) {
      var v = r * r - dy * dy;
      if (v < 0) continue;
      var w = Math.floor(Math.sqrt(v));
      ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    }
  };
  TC.fillEllipse = function (ctx, cx, cy, rx, ry) {
    cx = Math.round(cx); cy = Math.round(cy);
    var ri = Math.ceil(ry);
    for (var dy = -ri; dy <= ri; dy++) {
      var t = 1 - (dy * dy) / (ry * ry);
      if (t < 0) continue;
      var w = Math.floor(rx * Math.sqrt(t));
      ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    }
  };

  /* linha grossa nítida */
  TC.thickLine = function (ctx, x0, y0, x1, y1, th) {
    var dx = x1 - x0, dy = y1 - y0;
    var n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    var h = th / 2;
    for (var i = 0; i <= n; i++) {
      var x = x0 + dx * i / n, y = y0 + dy * i / n;
      if (th <= 1.5) ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      else TC.fillCircle(ctx, x, y, h);
    }
  };

  /* polígono nítido por scanline */
  TC.fillPoly = function (ctx, pts) {
    var minY = Infinity, maxY = -Infinity, i;
    for (i = 0; i < pts.length; i++) { minY = Math.min(minY, pts[i][1]); maxY = Math.max(maxY, pts[i][1]); }
    minY = Math.floor(minY); maxY = Math.ceil(maxY);
    for (var y = minY; y <= maxY; y++) {
      var yc = y + 0.5, xs = [];
      for (i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
          xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
      }
      xs.sort(function (p, q) { return p - q; });
      for (i = 0; i + 1 < xs.length; i += 2) {
        var x0 = Math.round(xs[i]), x1 = Math.round(xs[i + 1]);
        if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
      }
    }
  };

  /* padrões de dithering 4x4 (Bayer) */
  TC.BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  TC.dither = function (x, y, t) { return (TC.BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 < t; };

  /* ---------- ruído ---------- */
  TC.hash2 = function (x, y, seed) {
    var h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  function smooth(t) { return t * t * (3 - 2 * t); }
  TC.vnoise2 = function (x, y, seed, px, py) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var x0 = xi, x1 = xi + 1, y0 = yi, y1 = yi + 1;
    if (px) { x0 = ((x0 % px) + px) % px; x1 = ((x1 % px) + px) % px; }
    if (py) { y0 = ((y0 % py) + py) % py; y1 = ((y1 % py) + py) % py; }
    var a = TC.hash2(x0, y0, seed), b = TC.hash2(x1, y0, seed);
    var c = TC.hash2(x0, y1, seed), d = TC.hash2(x1, y1, seed);
    var u = smooth(xf), v = smooth(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  TC.fbm2 = function (x, y, seed, oct, px, py) {
    var s = 0, amp = 0.5, f = 1, n = 0;
    for (var i = 0; i < (oct || 4); i++) {
      s += amp * TC.vnoise2(x * f, y * f, seed + i * 17, px ? px * f : 0, py ? py * f : 0);
      n += amp; amp *= 0.5; f *= 2;
    }
    return s / n;
  };
  TC.vnoise1 = function (x, seed, period) {
    var xi = Math.floor(x), xf = x - xi;
    var a = xi, b = xi + 1;
    if (period) { a = ((a % period) + period) % period; b = ((b % period) + period) % period; }
    var u = smooth(xf);
    return TC.hash2(a, 7, seed) * (1 - u) + TC.hash2(b, 7, seed) * u;
  };
  TC.fbm1 = function (x, seed, oct, period) {
    var s = 0, amp = 0.5, f = 1, n = 0;
    for (var i = 0; i < (oct || 4); i++) {
      s += amp * TC.vnoise1(x * f, seed + i * 31, period ? period * f : 0);
      n += amp; amp *= 0.5; f *= 2;
    }
    return s / n;
  };

  /* ---------- estampas de luz (cache) ---------- */
  var stampCache = {};
  // círculos concêntricos com faixas (banding estilo SNES) para composição aditiva
  TC.lightStamp = function (r, hex, bands) {
    r = Math.max(2, Math.round(r));
    bands = bands || 4;
    var key = r + hex + bands;
    if (stampCache[key]) return stampCache[key];
    var cv = TC.canvas(r * 2 + 1, r * 2 + 1);
    var x = cv.ctx;
    var p = TC.parse(hex);
    for (var i = 0; i < bands; i++) {
      var rr = r * (1 - i / bands);
      x.fillStyle = 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + (1 / bands).toFixed(3) + ')';
      TC.fillCircle(x, r, r, rr);
    }
    stampCache[key] = cv;
    return cv;
  };
})();
