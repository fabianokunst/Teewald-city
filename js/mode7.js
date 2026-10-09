'use strict';
/* Teewald City — plano em perspectiva "Mode 7" (rotação e escala por scanline) e mapa da cidade */
(function () {
  function Mode7(tex, w, h) {
    this.tw = tex.width;
    this.th = tex.height;
    this.mask = this.tw - 1;
    var id = tex.ctx.getImageData(0, 0, this.tw, this.th);
    this.tex = new Uint32Array(id.data.buffer.slice(0));
    this.W = w || TC.W;
    this.H = h || TC.H;
    this.buf = new TC.PixBuf(this.W, this.H);
    this.cv = TC.canvas(this.W, this.H);
  }
  // cam: {x, y, angle, height, horizon, focal, fog: '#hex', fogDist}
  Mode7.prototype.render = function (cam) {
    var W = this.W, H = this.H, d = this.buf.d, tex = this.tex, tw = this.tw, mask = this.mask;
    d.fill(0);
    var hz = Math.floor(cam.horizon);
    var sa = Math.sin(cam.angle), ca = Math.cos(cam.angle);
    var fx = sa, fy = -ca, rx = ca, ry = sa;
    var focal = cam.focal || 160;
    var fogP = TC.parse(cam.fog || '#101028');
    var fr = fogP[0], fg = fogP[1], fb = fogP[2];
    var fogDist = cam.fogDist || 900;
    for (var y = Math.max(0, hz + 1); y < H; y++) {
      var dy = y - hz;
      var dist = cam.height * focal / dy;
      var step = dist / focal;
      var sx = cam.x + fx * dist - rx * step * W / 2;
      var sy = cam.y + fy * dist - ry * step * W / 2;
      var ddx = rx * step, ddy = ry * step;
      var f = Math.min(1, Math.pow(dist / fogDist, 1.4));
      f = Math.round(f * 12) / 12;            // faixas de neblina, como degradê de cor do SNES
      var nf = 1 - f;
      var o = y * W;
      for (var x = 0; x < W; x++) {
        var c = tex[((sy | 0) & mask) * tw + ((sx | 0) & mask)];
        var r = (c & 255) * nf + fr * f;
        var g = ((c >> 8) & 255) * nf + fg * f;
        var b = ((c >> 16) & 255) * nf + fb * f;
        d[o + x] = (255 << 24 | (b & 0xF8) << 16 | (g & 0xF8) << 8 | (r & 0xF8)) >>> 0;
        sx += ddx; sy += ddy;
      }
    }
    this.cv.ctx.putImageData(this.buf.img, 0, 0);
    return this.cv;
  };
  /* projeta um ponto do mundo para a tela (para sprites sobre o plano) */
  Mode7.prototype.project = function (cam, wx, wy) {
    var dx = wx - cam.x, dy = wy - cam.y;
    var sa = Math.sin(cam.angle), ca = Math.cos(cam.angle);
    var fwd = dx * sa - dy * ca;
    var right = dx * ca + dy * sa;
    if (fwd <= 1) return null;
    var focal = cam.focal || 160;
    var sy = cam.horizon + cam.height * focal / fwd;
    var sx = this.W / 2 + right * focal / fwd;
    return { x: sx, y: sy, s: focal / fwd };
  };
  TC.Mode7 = Mode7;

  /* ---------- mapa da cidade visto de cima (textura 512x512) ---------- */
  TC.ART.townMap = function () {
    var S = 512, pb = new TC.PixBuf(S, S), x, y, i;
    var r = TC.RNG(1852);
    var cx = 256, cy = 256;
    // floresta / campo
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var n = TC.fbm2(x / 40, y / 40, 9, 4, S / 40, S / 40);
      var dc = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      var clearing = TC.clamp(1 - (dc - 70) / 50, 0, 1);
      var col = n > 0.55 ? '#16281c' : n > 0.45 ? '#12221a' : '#0e1c16';
      if (clearing > 0.5 && n < 0.62) col = n > 0.5 ? '#2a3a26' : '#24341f';
      pb.d[y * S + x] = TC.u32(col);
    }
    function road(pts, w, colHex, edgeHex) {
      var c = TC.u32(colHex), e = TC.u32(edgeHex || colHex);
      for (var k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1];
        var n = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])));
        for (var t = 0; t <= n; t++) {
          var px = a[0] + (b[0] - a[0]) * t / n, py = a[1] + (b[1] - a[1]) * t / n;
          for (var yy = -w - 1; yy <= w + 1; yy++) for (var xx = -w - 1; xx <= w + 1; xx++) {
            var dd = xx * xx + yy * yy;
            if (dd <= w * w) pb.set(Math.round(px + xx) & 511, Math.round(py + yy) & 511, c);
            else if (dd <= (w + 1) * (w + 1) && edgeHex) {
              var idx = (Math.round(py + yy) & 511) * S + (Math.round(px + xx) & 511);
              if (pb.d[idx] !== c) pb.d[idx] = e;
            }
          }
        }
      }
    }
    // arroio serpenteando
    var river = [];
    for (i = 0; i <= 64; i++) { var t = i / 64; river.push([t * 512, 330 + Math.sin(t * 9) * 26 + Math.sin(t * 23) * 8]); }
    road(river, 4, '#14204a', '#2a3a60');
    // estrada da serra chegando do sul (curvas)
    var serra = [];
    for (i = 0; i <= 40; i++) { var u = i / 40; serra.push([cx + Math.sin(u * 7) * 60 * (1 - u), 511 - u * 240]); }
    road(serra, 3, '#3a3840', '#5a5650');
    // ruas da cidade
    road([[cx - 90, cy], [cx + 90, cy]], 3, '#4a4650', '#6a6660');
    road([[cx, cy - 90], [cx, cy + 90]], 3, '#4a4650', '#6a6660');
    road([[cx - 70, cy - 50], [cx + 70, cy - 50]], 2, '#3e3a44');
    road([[cx - 70, cy + 50], [cx + 70, cy + 50]], 2, '#3e3a44');
    road([[cx - 50, cy - 80], [cx - 50, cy + 80]], 2, '#3e3a44');
    road([[cx + 50, cy - 80], [cx + 50, cy + 80]], 2, '#3e3a44');
    // ponte
    for (x = cx - 5; x <= cx + 5; x++) for (y = 0; y < 14; y++) pb.set(x, 324 + y, TC.u32((y % 3) ? '#6a4a30' : '#3a2818'));
    // praça
    for (y = -16; y <= 16; y++) for (x = -16; x <= 16; x++) pb.set(cx + x, cy + y, TC.u32(((x + y) & 3) ? '#7a5a48' : '#6a4a3a'));
    // igreja
    for (y = -26; y <= -14; y++) for (x = -8; x <= 8; x++) pb.set(cx + x, cy + y, TC.u32(x === 0 ? '#f0f0f8' : x < 0 ? '#d8d8e4' : '#9a9ab0'));
    for (y = -32; y <= -24; y++) for (x = -3; x <= 3; x++) pb.set(cx + x, cy + y, TC.u32('#5a5a74'));
    // casas (telhados vistos de cima)
    for (i = 0; i < 90; i++) {
      var hx = cx + r.int(-80, 80), hy = cy + r.int(-80, 80);
      if (Math.abs(hx - cx) < 20 && Math.abs(hy - cy) < 34) continue;
      var w = r.int(6, 10), h = r.int(5, 8);
      var roofCol = r.pick(['#5a2a2a', '#4a3a48', '#6a3430', '#3a3040']);
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        var cc = y === Math.floor(h / 2) ? '#8a5a50' : (y < h / 2 ? roofCol : TC.shade(roofCol, 0.7));
        pb.set(hx + x, hy + y, TC.u32(cc));
      }
      if (r() < 0.25) pb.set(hx + r.int(1, w - 2), hy + h, TC.u32('#ffc060'));
    }
    // cemitério
    for (y = 0; y < 30; y++) for (x = 0; x < 34; x++) {
      var gx = cx + 100 + x, gy = cy - 60 + y;
      pb.set(gx, gy, TC.u32((x % 4 === 1 && y % 4 === 1) ? '#9a9aa8' : '#2a3a2a'));
    }
    // copas de araucárias vistas de cima
    for (i = 0; i < 900; i++) {
      var ax = r.int(0, 511), ay = r.int(0, 511);
      var dc2 = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
      if (dc2 < 95 && r() < 0.9) continue;
      var rr = r.int(2, 4);
      for (y = -rr; y <= rr; y++) for (x = -rr; x <= rr; x++) {
        var d2 = x * x + y * y;
        if (d2 > rr * rr) continue;
        var c2 = d2 < 2 ? '#0a140e' : (x + y < -1 ? '#3a6a4a' : '#1e3a2a');
        pb.set((ax + x) & 511, (ay + y) & 511, TC.u32(c2));
      }
    }
    // postes acesos ao longo das ruas
    var lamps = [];
    for (i = -80; i <= 80; i += 20) { lamps.push([cx + i, cy - 5]); lamps.push([cx + 5, cy + i]); }
    lamps.forEach(function (l) {
      for (y = -2; y <= 2; y++) for (x = -2; x <= 2; x++) {
        var dd = x * x + y * y;
        if (dd <= 4) pb.set(l[0] + x, l[1] + y, TC.u32(dd === 0 ? '#ffe0a0' : dd <= 1 ? '#e09040' : '#6a4a30'));
      }
    });
    var cv = pb.toCanvas();
    cv.lamps = lamps;
    return cv;
  };
})();
