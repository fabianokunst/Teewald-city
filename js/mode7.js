'use strict';
/* Teewald City — plano em perspectiva "Mode 7" (rotação e escala por scanline), com as casas, a igreja,
   os postes e as árvores erguidos em 3D por cima dele, e o mapa da cidade */
(function () {
  // luz da lua: vem do lado em que a lua aparece no céu da tela-título
  var MX = 0.646, MY = 0.471, MZ = 0.6;

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
    this.zb = new Float32Array(this.W * this.H);
    this.xs = new Float32Array(8);
    this.ys = new Float32Array(8);
    this.list = [];
    this.pending = [];
    this.lights = [];
    this.tick = 0;
  }
  // cam: {x, y, angle, height, horizon, focal, fog: '#hex', fogDist}; objs: objetos 3D sobre o plano (opcional)
  Mode7.prototype.render = function (cam, objs) {
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
    this.lights.length = 0;
    if (objs) this.drawObjects(cam, objs);
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

  /* ---------- objetos 3D: pintados de trás para a frente, com a mesma neblina do chão ---------- */
  Mode7.prototype.drawObjects = function (cam, objs) {
    var sa = Math.sin(cam.angle), ca = Math.cos(cam.angle);
    var focal = cam.focal || 160, fogDist = cam.fogDist || 900;
    var V = this.view = {
      x: cam.x, y: cam.y, h: cam.height, sa: sa, ca: ca, focal: focal, hz: cam.horizon,
      fogDist: fogDist, fog: TC.parse(cam.fog || '#101028'), f: 0,
      mr: MX * ca + MY * sa          // de que lado da tela a lua ilumina as copas
    };
    this.tick++;
    this.zb.fill(1e9);
    var list = this.list, lim = (this.W / 2 + 24) / focal, i;
    list.length = 0;
    for (i = 0; i < objs.length; i++) {
      var o = objs[i];
      var dx = o.x - cam.x, dy = o.y - cam.y;
      var fwd = dx * sa - dy * ca;
      if (fwd < (o.near || 10) || fwd > fogDist) continue;
      if (Math.abs(dx * ca + dy * sa) - (o.rad || 2) > fwd * lim) continue;
      o._f = fwd;
      list.push(o);
    }
    list.sort(function (a, b) { return b._f - a._f; });
    this.pending.length = 0;
    for (i = 0; i < list.length; i++) DRAW[list[i].k](this, list[i]);
    // brilhos dos postes e das velas, só onde nada passou na frente
    for (i = 0; i < this.pending.length; i++) {
      var L = this.pending[i], px = Math.floor(L.x), py = Math.floor(L.y);
      if (px >= 0 && py >= 0 && px < this.W && py < this.H && this.zb[py * this.W + px] < L.f - 0.5) continue;
      this.lights.push(L);
    }
  };
  Mode7.prototype.fogFor = function (fwd) {
    var V = this.view, f = Math.min(1, Math.pow(fwd / V.fogDist, 1.4));
    V.f = Math.round(f * 12) / 12;
  };
  // cor com luz k e neblina (fm < 1 = atravessa a neblina, como janela acesa)
  Mode7.prototype.col = function (rgb, k, fm) {
    var V = this.view, f = fm == null ? V.f : V.f * fm, nf = 1 - f, F = V.fog;
    var r = Math.min(255, rgb[0] * k * nf + F[0] * f) | 0;
    var g = Math.min(255, rgb[1] * k * nf + F[1] * f) | 0;
    var b = Math.min(255, rgb[2] * k * nf + F[2] * f) | 0;
    return (255 << 24 | (b & 0xF8) << 16 | (g & 0xF8) << 8 | (r & 0xF8)) >>> 0;
  };
  Mode7.prototype.p3 = function (wx, wy, wz) {
    var V = this.view, dx = wx - V.x, dy = wy - V.y;
    var fwd = dx * V.sa - dy * V.ca;
    if (fwd < 1) fwd = 1;
    var k = V.focal / fwd;
    this.px = this.W / 2 + (dx * V.ca + dy * V.sa) * k;
    this.py = V.hz + (V.h - wz) * k;
    return fwd;
  };
  // vértice i do polígono, em coordenadas locais do objeto (u ao longo da cumeeira, v de lado)
  Mode7.prototype.lv = function (i, o, u, v, z) {
    this.p3(o.x + u * o.ux - v * o.uy, o.y + u * o.uy + v * o.ux, z);
    this.xs[i] = this.px; this.ys[i] = this.py;
  };
  Mode7.prototype.wv = function (i, wx, wy, z) {
    this.p3(wx, wy, z);
    this.xs[i] = this.px; this.ys[i] = this.py;
  };
  Mode7.prototype.span = function (y, xl, xr, col, z) {
    if (y < 0 || y >= this.H) return;
    var a = Math.ceil(xl - 0.5), b = Math.floor(xr - 0.5);
    if (b < a) a = b = Math.floor((xl + xr) / 2);   // fatia fina: pelo menos um pixel
    if (a < 0) a = 0;
    if (b > this.W - 1) b = this.W - 1;
    var d = this.buf.d, zb = this.zb, o = y * this.W;
    for (var x = a; x <= b; x++) { d[o + x] = col; zb[o + x] = z; }
  };
  // polígono convexo (vértices em xs/ys)
  Mode7.prototype.fill = function (n, col, z) {
    var xs = this.xs, ys = this.ys, y0 = 1e9, y1 = -1e9, i, j;
    for (i = 0; i < n; i++) { if (ys[i] < y0) y0 = ys[i]; if (ys[i] > y1) y1 = ys[i]; }
    var ya = Math.max(0, Math.ceil(y0 - 0.5)), yb = Math.min(this.H - 1, Math.floor(y1 - 0.5));
    for (var y = ya; y <= yb; y++) {
      var sy = y + 0.5, xl = 1e9, xr = -1e9;
      for (i = 0, j = n - 1; i < n; j = i++) {
        var p = ys[j], q = ys[i];
        if ((p <= sy) !== (q <= sy)) {
          var x = xs[j] + (sy - p) * (xs[i] - xs[j]) / (q - p);
          if (x < xl) xl = x;
          if (x > xr) xr = x;
        }
      }
      if (xl <= xr) this.span(y, xl, xr, col, z);
    }
  };
  Mode7.prototype.dot = function (x, y, col, z) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return;
    var i = y * this.W + x;
    this.buf.d[i] = col; this.zb[i] = z;
  };
  Mode7.prototype.line = function (x0, y0, x1, y1, col, z) {
    var dx = x1 - x0, dy = y1 - y0, n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))) || 1;
    for (var i = 0; i <= n; i++) this.dot(x0 + dx * i / n, y0 + dy * i / n, col, z);
  };
  // linha entre dois pontos locais do objeto
  Mode7.prototype.seg = function (o, u0, v0, z0, u1, v1, z1, col) {
    this.lv(6, o, u0, v0, z0); this.lv(7, o, u1, v1, z1);
    this.line(this.xs[6], this.ys[6], this.xs[7], this.ys[7], col, o._f);
  };
  // tronco, poste: coluna vertical com largura w
  Mode7.prototype.vline = function (x, y0, y1, w, col, z) {
    var x0 = Math.round(x - w / 2);
    for (var y = Math.floor(Math.min(y0, y1)); y <= Math.floor(Math.max(y0, y1)); y++)
      for (var k = 0; k < w; k++) this.dot(x0 + k, y, col, z);
  };
  Mode7.prototype.ell = function (cx, cy, rx, ry, col, z) {
    if (ry < 0.75) { this.span(Math.floor(cy), cx - rx, cx + rx, col, z); return; }
    var ya = Math.max(0, Math.ceil(cy - ry - 0.5)), yb = Math.min(this.H - 1, Math.floor(cy + ry - 0.5));
    for (var y = ya; y <= yb; y++) {
      var t = (y + 0.5 - cy) / ry;
      var w = rx * Math.sqrt(Math.max(0, 1 - t * t));
      this.span(y, cx - w, cx + w, col, z);
    }
  };
  Mode7.prototype.light = function (x, y, f, r, col, a, flick) {
    this.pending.push({ x: x, y: y, f: f, r: r, col: col, a: a, flick: flick });
  };

  var P = TC.parse;
  var TIMBER = P('#2e2220'), DOOR = P('#3a2418'), WIN_LIT = P('#ffc860'), WIN_DARK = P('#1c1c2c'), CHIM = P('#5a3430');
  var CHURCH_WIN = P('#e0a050'), TRUNK = P('#2a201a'), ARAU_T = P('#3a6a4c'), ARAU_U = P('#142a1e');
  var POST = P('#22201e'), LAMP = P('#fff0c0'), CANDLE = P('#ffc070'), CROSS = P('#e8c878');

  function hash(o, a, b, c) { return ((((o.seed * 31 + a) * 31 + b) * 31 + c) * 2654435761 >>> 0) % 7; }

  // a parede com essa normal (no mundo) é a fachada que dá para a rua?
  function facesStreet(o, nx, ny) { return nx * o.fx + ny * o.fy > 0.5; }

  // janela (com arco ogival na igreja); longe, só as acesas aparecem, como pontinhos
  function window3(M, o, side, w, u, z0, z1, lit, near, k) {
    var c = lit ? M.col(o.church ? CHURCH_WIN : WIN_LIT, 1, 0.35) : M.col(WIN_DARK, k);
    if (!near) {
      if (!lit) return;
      if (side.e) M.lv(0, o, side.s * o.a, u, (z0 + z1) / 2);
      else M.lv(0, o, u, side.s * o.b, (z0 + z1) / 2);
      M.dot(M.xs[0], M.ys[0], c, o._f);
      return;
    }
    var n = 4;
    if (side.e) {
      var ue = side.s * o.a;
      M.lv(0, o, ue, u - w, z0); M.lv(1, o, ue, u + w, z0); M.lv(2, o, ue, u + w, z1);
      if (o.church) { M.lv(3, o, ue, u, z1 + w * 1.4); M.lv(4, o, ue, u - w, z1); n = 5; } else M.lv(3, o, ue, u - w, z1);
    } else {
      var v = side.s * o.b;
      M.lv(0, o, u - w, v, z0); M.lv(1, o, u + w, v, z0); M.lv(2, o, u + w, v, z1);
      if (o.church) { M.lv(3, o, u, v, z1 + w * 1.4); M.lv(4, o, u - w, v, z1); n = 5; } else M.lv(3, o, u - w, v, z1);
    }
    M.fill(n, c, o._f);
  }

  /* casa: caixa com telhado de duas águas; de perto aparecem o enxaimel, as janelas e a porta */
  function drawHouse(M, o) {
    var V = M.view, z = o._f, s = V.focal / z;
    M.fogFor(z);
    var a = o.a, b = o.b, hw = o.hw, hr = o.hr, rise = hr - hw, ov = o.church ? 0.4 : 0.7;
    var ex = V.x - o.x, ey = V.y - o.y;
    var cu = ex * o.ux + ey * o.uy, cv = -ex * o.uy + ey * o.ux;
    var mu = MX * o.ux + MY * o.uy, mv = -MX * o.uy + MY * o.ux;
    var near = s * hw >= 5.5, sv, su, k, i, fl, lit;
    var floors = hw >= 6.5 && !o.church ? 2 : 1, fh = hw / floors;
    // paredes compridas
    for (sv = -1; sv <= 1; sv += 2) {
      if (sv * (cv - sv * b) <= 0) continue;
      k = 0.5 + 0.5 * Math.max(0, sv * mv);
      M.lv(0, o, -a, sv * b, 0); M.lv(1, o, a, sv * b, 0); M.lv(2, o, a, sv * b, hw); M.lv(3, o, -a, sv * b, hw);
      M.fill(4, M.col(o.wall, k), z);
      var side = { e: false, s: sv };
      var front = facesStreet(o, -o.uy * sv, o.ux * sv);
      if (o.church) {
        for (i = 0; i < 4; i++) window3(M, o, side, 0.55, -a + (i + 0.5) * 2 * a / 4, 2.2, 6.2, true, near, k);
        continue;
      }
      var nb = Math.max(3, Math.round(2 * a / 2.3)), bw = 2 * a / nb, tc = near && o.enx ? M.col(TIMBER, k) : 0;
      if (tc) {
        // enxaimel: esteios, travessas e as mãos-francesas dos cantos
        for (i = 0; i <= nb; i++) M.seg(o, -a + i * bw, sv * b, 0.1, -a + i * bw, sv * b, hw, tc);
        for (fl = 0; fl < floors; fl++) {
          M.seg(o, -a, sv * b, fl * fh + fh * 0.3, a, sv * b, fl * fh + fh * 0.3, tc);
          M.seg(o, -a, sv * b, fl * fh + fh * 0.78, a, sv * b, fl * fh + fh * 0.78, tc);
        }
        M.seg(o, -a, sv * b, 0.1, -a + bw, sv * b, fh * 0.3, tc);
        M.seg(o, a, sv * b, 0.1, a - bw, sv * b, fh * 0.3, tc);
      }
      for (fl = 0; fl < floors; fl++) for (i = 0; i < nb; i++) {
        var uc = -a + (i + 0.5) * bw;
        if (front && fl === 0 && i === (nb >> 1)) {
          if (near) { M.lv(0, o, uc - 0.6, sv * b, 0); M.lv(1, o, uc + 0.6, sv * b, 0); M.lv(2, o, uc + 0.6, sv * b, fh * 0.78); M.lv(3, o, uc - 0.6, sv * b, fh * 0.78); M.fill(4, M.col(DOOR, k), z); }
          continue;
        }
        if ((i + fl) % 2 === 1 && nb > 3) continue;
        lit = o.lit && hash(o, sv, i, fl) < o.lit;
        window3(M, o, side, Math.min(0.5, bw * 0.28), uc, fl * fh + fh * 0.3, fl * fh + fh * 0.78, lit, near, k);
      }
    }
    // empenas
    for (su = -1; su <= 1; su += 2) {
      if (su * (cu - su * a) <= 0) continue;
      k = 0.5 + 0.5 * Math.max(0, su * mu);
      M.lv(0, o, su * a, -b, 0); M.lv(1, o, su * a, b, 0); M.lv(2, o, su * a, b, hw); M.lv(3, o, su * a, 0, hr); M.lv(4, o, su * a, -b, hw);
      M.fill(5, M.col(o.wall, k), z);
      var side2 = { e: true, s: su };
      if (o.church) {
        // rosácea no fundo da nave
        M.lv(0, o, su * a, 0, hw + rise * 0.3);
        M.ell(M.xs[0], M.ys[0], 1.3 * s, 1.3 * s, M.col(CHURCH_WIN, 1, 0.35), z);
        continue;
      }
      var front2 = facesStreet(o, o.ux * su, o.uy * su);
      if (near && o.enx) {
        var tc2 = M.col(TIMBER, k);
        M.seg(o, su * a, -b, hw, su * a, b, hw, tc2);
        M.seg(o, su * a, 0, 0.1, su * a, 0, hr - 0.4, tc2);
        for (fl = 0; fl < floors; fl++) M.seg(o, su * a, -b, fl * fh + fh * 0.3, su * a, b, fl * fh + fh * 0.3, tc2);
        M.seg(o, su * a, -b * 0.5, hw, su * a, 0, hr - 0.4, tc2);
        M.seg(o, su * a, b * 0.5, hw, su * a, 0, hr - 0.4, tc2);
      }
      for (fl = 0; fl < floors; fl++) for (i = -1; i <= 1; i += 2) {
        lit = o.lit && hash(o, 3 + su, i, fl) < o.lit;
        window3(M, o, side2, 0.5, i * b * 0.5, fl * fh + fh * 0.3, fl * fh + fh * 0.78, lit, near, k);
      }
      if (front2 && near) {
        M.lv(0, o, su * a, -0.6, 0); M.lv(1, o, su * a, 0.6, 0); M.lv(2, o, su * a, 0.6, fh * 0.78); M.lv(3, o, su * a, -0.6, fh * 0.78);
        M.fill(4, M.col(DOOR, k), z);
      }
      // janelinha do sótão
      lit = o.lit && hash(o, 7 + su, 0, 0) < o.lit - 1;
      window3(M, o, side2, 0.4, 0, hw + rise * 0.2, hw + rise * 0.45, lit, near, k);
    }
    // telhado
    var drop = ov * rise / b;
    for (sv = -1; sv <= 1; sv += 2) {
      var nv = sv * rise, nz = b;
      if (nv * cv + nz * (V.h - hr) <= 0) continue;
      k = 0.42 + 0.58 * Math.max(0, (nv * mv + nz * MZ) / Math.sqrt(nv * nv + nz * nz));
      M.lv(0, o, -a - ov, sv * (b + ov), hw - drop); M.lv(1, o, a + ov, sv * (b + ov), hw - drop);
      M.lv(2, o, a + ov, 0, hr); M.lv(3, o, -a - ov, 0, hr);
      M.fill(4, M.col(o.roof, k), z);
      if (s * b >= 4) {
        // fiadas de telha
        var tl = M.col(o.roof, k * 0.78);
        for (i = 1; i <= 2; i++) {
          var t = i / 3;
          M.seg(o, -a - ov, sv * (b + ov) * t, hr - (rise + drop) * t, a + ov, sv * (b + ov) * t, hr - (rise + drop) * t, tl);
        }
      }
    }
    if (near || s * rise >= 2.5) M.seg(o, -a - ov, 0, hr, a + ov, 0, hr, M.col(o.roof, 1.35));
    // chaminé em cima da cumeeira
    if (o.chim != null && s >= 0.7) {
      var cu0 = o.chim;
      box3(M, o, cu0, 0, 0.55, 0.55, hr - 0.8, hr + 1.5, CHIM, cu, cv);
    }
  }

  // caixa em coordenadas locais do objeto (chaminé)
  function box3(M, o, uc, vc, hu, hv, z0, z1, rgb, cu, cv) {
    var mu = MX * o.ux + MY * o.uy, mv = -MX * o.uy + MY * o.ux, z = o._f, k;
    for (var s = -1; s <= 1; s += 2) {
      if (s * (cu - uc - s * hu) > 0) {
        k = 0.5 + 0.5 * Math.max(0, s * mu);
        M.lv(0, o, uc + s * hu, vc - hv, z0); M.lv(1, o, uc + s * hu, vc + hv, z0); M.lv(2, o, uc + s * hu, vc + hv, z1); M.lv(3, o, uc + s * hu, vc - hv, z1);
        M.fill(4, M.col(rgb, k), z);
      }
      if (s * (cv - vc - s * hv) > 0) {
        k = 0.5 + 0.5 * Math.max(0, s * mv);
        M.lv(0, o, uc - hu, vc + s * hv, z0); M.lv(1, o, uc + hu, vc + s * hv, z0); M.lv(2, o, uc + hu, vc + s * hv, z1); M.lv(3, o, uc - hu, vc + s * hv, z1);
        M.fill(4, M.col(rgb, k), z);
      }
    }
    M.lv(0, o, uc - hu, vc - hv, z1); M.lv(1, o, uc + hu, vc - hv, z1); M.lv(2, o, uc + hu, vc + hv, z1); M.lv(3, o, uc - hu, vc + hv, z1);
    M.fill(4, M.col(rgb, 0.4), z);
  }

  /* caixa alinhada aos eixos do mundo: túmulos, muro do cemitério, guarda-corpo da ponte */
  function drawBox(M, o) {
    var V = M.view, z = o._f;
    M.fogFor(z);
    var x0 = o.x - o.hx, x1 = o.x + o.hx, y0 = o.y - o.hy, y1 = o.y + o.hy, h = o.h;
    if (V.x > x1) { M.wv(0, x1, y0, 0); M.wv(1, x1, y1, 0); M.wv(2, x1, y1, h); M.wv(3, x1, y0, h); M.fill(4, M.col(o.c, 0.5 + 0.5 * MX), z); }
    if (V.x < x0) { M.wv(0, x0, y0, 0); M.wv(1, x0, y1, 0); M.wv(2, x0, y1, h); M.wv(3, x0, y0, h); M.fill(4, M.col(o.c, 0.5), z); }
    if (V.y > y1) { M.wv(0, x0, y1, 0); M.wv(1, x1, y1, 0); M.wv(2, x1, y1, h); M.wv(3, x0, y1, h); M.fill(4, M.col(o.c, 0.5 + 0.5 * MY), z); }
    if (V.y < y0) { M.wv(0, x0, y0, 0); M.wv(1, x1, y0, 0); M.wv(2, x1, y0, h); M.wv(3, x0, y0, h); M.fill(4, M.col(o.c, 0.5), z); }
    M.wv(0, x0, y0, h); M.wv(1, x1, y0, h); M.wv(2, x1, y1, h); M.wv(3, x0, y1, h);
    M.fill(4, M.col(o.c, 0.5 + 0.5 * MZ + 0.15), z);
    if (o.candle) {
      M.p3(o.x, o.y, h + 0.5);
      M.dot(M.px, M.py, M.col(CANDLE, 1, 0.2), z);
      M.light(M.px, M.py, z, TC.clamp(V.focal / z * 2.6, 2, 6), '#ff9040', 0.5, true);
    }
  }

  /* torre da igreja com a agulha e a cruz */
  function drawTower(M, o) {
    var V = M.view, z = o._f, s = V.focal / z, t = o.t, ht = o.ht, hp = o.hp;
    M.fogFor(z);
    var near = s * t >= 2.5;
    var sides = [[1, 0], [-1, 0], [0, 1], [0, -1]], i;
    for (i = 0; i < 4; i++) {
      var nx = sides[i][0], ny = sides[i][1];
      if (nx * (V.x - o.x - nx * t) + ny * (V.y - o.y - ny * t) <= 0) continue;
      var k = 0.5 + 0.5 * Math.max(0, nx * MX + ny * MY);
      var px = -ny, py = nx;   // ao longo da parede
      var bx = o.x + nx * t, by = o.y + ny * t;
      M.wv(0, bx - px * t, by - py * t, 0); M.wv(1, bx + px * t, by + py * t, 0);
      M.wv(2, bx + px * t, by + py * t, ht); M.wv(3, bx - px * t, by - py * t, ht);
      M.fill(4, M.col(o.wall, k), z);
      // aberturas do campanário e o relógio
      var w = 0.75;
      M.wv(0, bx - px * w, by - py * w, ht - 5); M.wv(1, bx + px * w, by + py * w, ht - 5);
      M.wv(2, bx + px * w, by + py * w, ht - 2); M.wv(3, bx, by, ht - 1.2); M.wv(4, bx - px * w, by - py * w, ht - 2);
      M.fill(5, M.col(WIN_DARK, 1), z);
      M.p3(bx, by, ht - 8);
      if (near) M.ell(M.px, M.py, 1.1 * s, 1.1 * s, M.col(LAMP, 0.85, 0.5), z);
      else M.dot(M.px, M.py, M.col(LAMP, 0.85, 0.5), z);
      if (near) {
        // janelas ogivais da torre
        M.wv(0, bx - px * 0.6, by - py * 0.6, ht - 15); M.wv(1, bx + px * 0.6, by + py * 0.6, ht - 15);
        M.wv(2, bx + px * 0.6, by + py * 0.6, ht - 12); M.wv(3, bx, by, ht - 11); M.wv(4, bx - px * 0.6, by - py * 0.6, ht - 12);
        M.fill(5, M.col(CHURCH_WIN, 1, 0.35), z);
      }
    }
    // agulha: pirâmide de quatro faces
    var tt = t + 0.4;
    for (i = 0; i < 4; i++) {
      var nx2 = sides[i][0], ny2 = sides[i][1];
      if ((hp - ht) * (nx2 * (V.x - o.x) + ny2 * (V.y - o.y)) + tt * (V.h - hp) <= 0) continue;
      var nl = Math.sqrt((hp - ht) * (hp - ht) + tt * tt);
      var k2 = 0.42 + 0.58 * Math.max(0, ((hp - ht) * (nx2 * MX + ny2 * MY) + tt * MZ) / nl);
      var px2 = -ny2, py2 = nx2, bx2 = o.x + nx2 * tt, by2 = o.y + ny2 * tt;
      M.wv(0, bx2 - px2 * tt, by2 - py2 * tt, ht); M.wv(1, bx2 + px2 * tt, by2 + py2 * tt, ht); M.wv(2, o.x, o.y, hp);
      M.fill(3, M.col(o.roof, k2), z);
    }
    var cc = M.col(CROSS, 1, 0.5);
    M.p3(o.x, o.y, hp); var x0 = M.px, y0 = M.py;
    M.p3(o.x, o.y, hp + 3.2);
    M.line(x0, y0, M.px, M.py, cc, z);
    var sa = V.sa, ca = V.ca;
    M.p3(o.x - ca * 1.1, o.y - sa * 1.1, hp + 2.2); var xa = M.px, ya = M.py;
    M.p3(o.x + ca * 1.1, o.y + sa * 1.1, hp + 2.2);
    M.line(xa, ya, M.px, M.py, cc, z);
  }

  /* araucária: tronco reto e a copa em "taça", vista quase de lado */
  function crown(M, x, y, zc, rr, z, s) {
    var V = M.view;
    M.p3(x, y, zc - 1.5);
    var rx = rr * 0.72 * s;
    M.ell(M.px, M.py, rx, Math.abs(rx * (V.h - zc + 1.5) / z) + 0.6 * s, M.col(ARAU_U, 1), z);
    M.p3(x, y, zc);
    rx = rr * s;
    var ry = Math.abs(rx * (V.h - zc) / z);
    M.ell(M.px, M.py, rx, ry, M.col(ARAU_T, 0.75), z);
    if (rx >= 3) M.ell(M.px + V.mr * rx * 0.2, M.py - ry * 0.25, rx * 0.6, ry * 0.5, M.col(ARAU_T, 1.05), z);
  }
  function drawArau(M, o) {
    var V = M.view, z = o._f, s = V.focal / z;
    M.fogFor(z);
    M.p3(o.x, o.y, 0); var bx = M.px, by = M.py;
    M.p3(o.x, o.y, o.h - 1);
    M.vline(bx, by, M.py, Math.max(1, Math.round(0.5 * s)), M.col(TRUNK, 1), z);
    for (var i = o.tiers - 1; i >= 0; i--) crown(M, o.x, o.y, o.h - i * 3.4, o.r * (1 - i * 0.3), z, s);
  }
  /* árvore de outono (copa redonda, laranja) e cipreste do cemitério */
  function drawTree(M, o) {
    var V = M.view, z = o._f, s = V.focal / z;
    M.fogFor(z);
    M.p3(o.x, o.y, 0); var bx = M.px, by = M.py;
    M.p3(o.x, o.y, o.h * 0.55);
    M.vline(bx, by, M.py, Math.max(1, Math.round(0.4 * s)), M.col(TRUNK, 1), z);
    M.p3(o.x, o.y, o.h - o.r * 0.9);
    var R = o.r * s, ry = o.tall ? o.h * 0.5 * s : R * 0.9;
    if (o.tall) M.p3(o.x, o.y, o.h * 0.5);
    M.ell(M.px, M.py, R, ry, M.col(o.c2, 1), z);
    if (R >= 1.5) M.ell(M.px + V.mr * R * 0.22, M.py - ry * 0.2, R * 0.66, ry * 0.62, M.col(o.c1, 1), z);
  }
  /* poste de luz */
  function drawLamp(M, o) {
    var V = M.view, z = o._f, s = V.focal / z;
    M.fogFor(z);
    M.p3(o.x, o.y, 0); var bx = M.px, by = M.py;
    M.p3(o.x, o.y, 5.4);
    M.vline(bx, by, M.py, 1, M.col(POST, 1), z);
    M.dot(M.px, M.py, M.col(LAMP, 1, 0.2), z);
    if (s >= 2) M.dot(M.px, M.py + 1, M.col(LAMP, 0.8, 0.2), z);
    M.light(M.px, M.py, z, TC.clamp(s * 7, 2, 16), '#ffb050', 0.55);
  }
  var DRAW = { house: drawHouse, tower: drawTower, arau: drawArau, tree: drawTree, lamp: drawLamp, box: drawBox };

  TC.Mode7 = Mode7;

  /* ---------- mapa da cidade visto de cima (textura 512x512) e os objetos 3D em cima dele ---------- */
  TC.ART.townMap = function () {
    var S = 512, pb = new TC.PixBuf(S, S), d = pb.d, x, y, i;
    var r = TC.RNG(1852);
    var cx = 256, cy = 256;
    var objs = [];
    var occ = new Uint8Array(S * S);   // o que já está ocupado: ruas, rio, praça, casas, quintais
    function at(xx, yy) { return (Math.round(yy) & 511) * S + (Math.round(xx) & 511); }
    function mark(x0, y0, x1, y1) {
      for (var yy = Math.floor(y0); yy <= Math.ceil(y1); yy++) for (var xx = Math.floor(x0); xx <= Math.ceil(x1); xx++) occ[at(xx, yy)] = 1;
    }
    function free(x0, y0, x1, y1) {
      for (var yy = Math.floor(y0); yy <= Math.ceil(y1); yy++) for (var xx = Math.floor(x0); xx <= Math.ceil(x1); xx++) if (occ[at(xx, yy)]) return false;
      return true;
    }
    function put(xx, yy, hex) { d[at(xx, yy)] = TC.u32(hex); }
    function darken(xx, yy, f) {
      var k = at(xx, yy), c = d[k];
      d[k] = TC.u32rgb((c & 255) * f, ((c >> 8) & 255) * f, ((c >> 16) & 255) * f);
    }
    function ellD(xx, yy) { var ex = (xx - cx) / 1.3, ey = (yy - cy) / 1.05; return Math.sqrt(ex * ex + ey * ey); }

    // floresta e a clareira da colônia
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var n = TC.fbm2(x / 40, y / 40, 9, 4, S / 40, S / 40);
      var clearing = TC.clamp(1 - (ellD(x, y) - 100) / 40, 0, 1);
      var col = n > 0.55 ? '#16281c' : n > 0.45 ? '#12221a' : '#0e1c16';
      if (clearing > 0.5 && n < 0.62) col = n > 0.5 ? '#2a3a26' : '#24341f';
      d[y * S + x] = TC.u32(col);
    }
    // roças em volta da cidade, com as fileiras da plantação
    var FIELDS = ['#2c3a22', '#34381f', '#2e2a20', '#263822', '#383626', '#30301e'];
    for (var gy = 150; gy < 366; gy += 16) for (var gx = 96; gx < 420; gx += 22) {
      var jx = gx + r.int(-2, 2), jy = gy + r.int(-2, 2), fw = r.int(17, 22), fh = r.int(12, 15);
      if (jx + fw > 184 && jx < 328 && jy + fh > 188 && jy < 312) continue;
      if (jy < cy + 24 && jy + fh > cy - 24) continue;   // pasto na beira da estrada
      if (ellD(jx + fw / 2, jy + fh / 2) > 118 || r() < 0.18) continue;
      var fc = r.pick(FIELDS), fd = TC.shade(fc, 0.8), vert = r() < 0.5;
      for (y = 1; y < fh - 1; y++) for (x = 1; x < fw - 1; x++) put(jx + x, jy + y, ((vert ? x : y) % 2) ? fc : fd);
    }

    function road(pts, w, colHex, edgeHex) {
      var c = TC.u32(colHex), e = TC.u32(edgeHex || colHex);
      for (var k = 0; k < pts.length - 1; k++) {
        var a = pts[k], b = pts[k + 1];
        var nn = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])));
        for (var t = 0; t <= nn; t++) {
          var px = a[0] + (b[0] - a[0]) * t / nn, py = a[1] + (b[1] - a[1]) * t / nn;
          for (var yy = -w - 1; yy <= w + 1; yy++) for (var xx = -w - 1; xx <= w + 1; xx++) {
            var dd = xx * xx + yy * yy;
            if (dd <= w * w) d[at(px + xx, py + yy)] = c;
            else if (dd <= (w + 1) * (w + 1) && edgeHex) {
              var idx = at(px + xx, py + yy);
              if (d[idx] !== c) d[idx] = e;
            }
          }
          mark(px - w - 1, py - w - 1, px + w + 1, py + w + 1);
        }
      }
    }
    // arroio serpenteando ao sul da cidade
    function riverY(xx) { var t = xx / S * TC.TAU; return 324 + Math.sin(t * 2 + 1) * 9 + Math.sin(t * 5) * 4; }
    var river = [];
    for (i = 0; i <= 128; i++) river.push([i * 4, riverY(i * 4)]);
    road(river, 4, '#14204a', '#2a3a60');
    for (x = 0; x < S; x++) mark(x, riverY(x) - 7, x, riverY(x) + 7);
    var bridgeY = riverY(cx);
    // estrada da serra chegando do sul, até a ponte
    var serra = [];
    for (i = 0; i <= 40; i++) { var u = i / 40; serra.push([cx + Math.sin(u * 7) * 50 * (1 - u), 511 - u * (511 - bridgeY - 8)]); }
    road(serra, 3, '#3a3840', '#5a5650');
    // ruas: [x0, y0, x1, y1, meia largura, densidade de casas, recuo extra]
    var MAIN = '#4a4650', MAINE = '#6a6660', SIDE = '#3e3a44';
    var streets = [
      [104, cy, 408, cy, 3, 0.9, 0],          // rua principal, de leste a oeste
      [cx, cy + 14, cx, bridgeY - 6, 3, 0.95, 0],  // da praça até a ponte
      [cx, bridgeY + 6, cx, bridgeY + 9, 3, 0, 0],
      [196, 206, 316, 206, 2, 0.95, 0],       // rua de trás da igreja
      [196, 292, 316, 292, 2, 0.9, 0],        // rua da beira do arroio
      [200, 200, 200, 298, 2, 0.95, 0],
      [312, 200, 312, 298, 2, 0.95, 0],
      [cx, 150, cx, 206, 2, 0.6, 1]           // estrada para as roças do norte
    ];
    streets.forEach(function (st) {
      var main = st[4] >= 3;
      road([[st[0], st[1]], [st[2], st[3]]], st[4], main ? MAIN : SIDE, main ? MAINE : null);
    });
    // a rua principal some na mata dos dois lados
    road([[64, cy + 4], [104, cy]], 2, '#3a3840');
    road([[408, cy], [450, cy - 6]], 2, '#3a3840');
    // ponte de madeira sobre o arroio
    for (x = cx - 5; x <= cx + 5; x++) for (y = -7; y <= 7; y++) put(x, bridgeY + y, (y + 7) % 3 ? '#6a4a30' : '#3a2818');
    mark(cx - 6, bridgeY - 8, cx + 6, bridgeY + 8);
    [-1, 1].forEach(function (sx) {
      for (var k = -2; k <= 2; k++) objs.push({ k: 'box', x: cx + sx * 5.2, y: bridgeY + k * 3, hx: 0.35, hy: 1.5, h: 1.2, c: P('#5a4030'), rad: 2 });
    });
    // praça de lajotas
    for (y = -14; y <= 14; y++) for (x = -14; x <= 14; x++) put(cx + x, cy + y, ((x + y) & 3) ? '#6a5a50' : '#5a4a42');
    mark(cx - 15, cy - 15, cx + 15, cy + 15);
    // igreja: nave virada para a praça, com a torre na frente
    for (y = 210; y <= 242; y++) for (x = 246; x <= 266; x++) put(x, y, ((x + y) & 3) ? '#4a4248' : '#423a40');
    mark(245, 209, 267, 243);
    objs.push({ k: 'house', church: true, x: cx, y: 224, ux: 0, uy: 1, a: 11, b: 6, hw: 9, hr: 16, wall: P('#c4c4d4'), roof: P('#3a3a52'), seed: 1, fx: 0, fy: 1, rad: 14 });
    objs.push({ k: 'tower', x: cx, y: 238.5, t: 3.5, ht: 27, hp: 46, wall: P('#d0d0dc'), roof: P('#34344c'), rad: 6 });
    // cemitério, a leste, com muro, ciprestes e velas
    var CX0 = 352, CY0 = 216, CX1 = 386, CY1 = 244;
    for (y = CY0; y <= CY1; y++) for (x = CX0; x <= CX1; x++) put(x, y, ((x * 7 + y * 3) % 5) ? '#223222' : '#1e2c1e');
    mark(CX0 - 2, CY0 - 2, CX1 + 2, CY1 + 2);
    road([[369, CY1], [369, cy - 3]], 1, '#3e3a44');
    var WALL = P('#6a6874');
    for (x = CX0; x < CX1; x += 6) {
      objs.push({ k: 'box', x: x + 3, y: CY0, hx: 3, hy: 0.35, h: 1.4, c: WALL, rad: 4 });
      if (Math.abs(x + 3 - 369) > 4) objs.push({ k: 'box', x: x + 3, y: CY1, hx: 3, hy: 0.35, h: 1.4, c: WALL, rad: 4 });
    }
    for (y = CY0; y < CY1; y += 7) {
      objs.push({ k: 'box', x: CX0, y: y + 3.5, hx: 0.35, hy: 3.5, h: 1.4, c: WALL, rad: 4 });
      objs.push({ k: 'box', x: CX1, y: y + 3.5, hx: 0.35, hy: 3.5, h: 1.4, c: WALL, rad: 4 });
    }
    var STONE = P('#8a8a9a');
    for (y = CY0 + 4; y < CY1 - 2; y += 4) for (x = CX0 + 4; x < CX1 - 2; x += 4) {
      if (Math.abs(x - 369) < 2) continue;
      objs.push({ k: 'box', x: x, y: y, hx: 0.5, hy: 0.25, h: 1.2, c: STONE, candle: r() < 0.3, rad: 1 });
    }
    [[CX0 + 2, CY0 + 2], [CX1 - 2, CY0 + 2], [CX0 + 2, CY1 - 2], [CX1 - 2, CY1 - 2]].forEach(function (p) {
      objs.push({ k: 'tree', tall: true, x: p[0], y: p[1], h: 11, r: 1.6, c1: P('#22402e'), c2: P('#12261a'), rad: 2 });
    });

    // postes nas ruas, alternando os lados
    function lampsAlong(x0, y0, x1, y1, off, stepL) {
      var horiz = y0 === y1, len = horiz ? x1 - x0 : y1 - y0, sd = 1;
      for (var p = 6; p < len - 2; p += stepL) {
        var lx = horiz ? x0 + p : x0 + sd * off, ly = horiz ? y0 + sd * off : y0 + p;
        sd = -sd;
        if (Math.abs(lx - cx) < 17 && Math.abs(ly - cy) < 17) continue;
        objs.push({ k: 'lamp', x: lx, y: ly, rad: 3 });
      }
    }
    lampsAlong(120, cy, 392, cy, 4.6, 17);
    lampsAlong(cx, cy, cx, bridgeY - 8, 4.6, 17);
    lampsAlong(200, 206, 316, 206, 3.6, 24);
    lampsAlong(200, 292, 316, 292, 3.6, 24);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { objs.push({ k: 'lamp', x: cx + q[0] * 13.5, y: cy + q[1] * 13.5, rad: 3 }); });
    objs.push({ k: 'lamp', x: cx - 6.5, y: bridgeY - 9, rad: 3 }, { k: 'lamp', x: cx + 6.5, y: bridgeY + 9, rad: 3 });

    // casas ao longo das ruas, sempre recuadas da calçada; umas com o oitão para a rua, outras deitadas
    var WALLS = ['#aaa6b6', '#aaa6b6', '#aaa6b6', '#b2aa8c', '#98a2b2', '#b29a92'];
    var ROOFS = ['#6a3430', '#5a2a2a', '#7a3c30', '#4a3a48', '#3a3040', '#6a3a2a'];
    var houses = [];
    function addHouse(x0, y0, x1, y1, alongX, fx, fy, big) {
      var w = x1 - x0, h = y1 - y0;
      var o = {
        k: 'house', x: (x0 + x1) / 2, y: (y0 + y1) / 2,
        ux: alongX ? 1 : 0, uy: alongX ? 0 : 1,
        a: (alongX ? w : h) / 2, b: (alongX ? h : w) / 2,
        wall: P(r.pick(WALLS)), roof: P(r.pick(ROOFS)), enx: r() < 0.75,
        seed: r.int(1, 99999), lit: r() < 0.7 ? r.int(2, 4) : 0, fx: fx, fy: fy
      };
      o.hw = big ? 6 : r() < 0.22 ? 7 : r.pick([4.5, 5, 5, 5.5]);
      o.hr = o.hw + o.b * 1.15;
      o.chim = r() < 0.6 ? r.range(-0.5, 0.5) * o.a : null;
      o.rad = Math.max(o.a, o.b) + 2;
      objs.push(o);
      houses.push(o);
      mark(x0 - 1, y0 - 1, x1 + 1, y1 + 1);
      return o;
    }
    // a Sociedade de Tiro, um salão comprido na entrada oeste
    addHouse(146, 262, 174, 274, true, 0, -1, true).enx = false;
    function housesAlong(st, extraSet) {
      var horiz = st[1] === st[3], hw = st[4], dens = st[5];
      var s0 = horiz ? st[0] : st[1], s1 = horiz ? st[2] : st[3], c0 = horiz ? st[1] : st[0];
      [-1, 1].forEach(function (side) {
        var p = s0 + r.int(1, 4);
        while (p < s1 - 4) {
          var gable = r() < 0.5;
          var along = gable ? r.int(6, 8) : r.int(9, 12), deep = gable ? r.int(9, 11) : r.int(6, 8);
          var set = hw + 2 + r.int(0, 1) + (extraSet || 0) + st[6];
          var n0 = c0 + (side > 0 ? set : -set - deep), n1 = n0 + deep;
          var x0 = horiz ? p : n0, x1 = horiz ? p + along : n1, y0 = horiz ? n0 : p, y1 = horiz ? n1 : p + along;
          if (p + along <= s1 && r() < dens && free(x0 - 1, y0 - 1, x1 + 1, y1 + 1)) {
            // a fachada olha para a rua
            var fx = horiz ? 0 : -side, fy = horiz ? -side : 0;
            addHouse(x0, y0, x1, y1, horiz ? !gable : gable, fx, fy);
            p += along + r.int(2, 5);
          } else p += r.int(2, 3);
        }
      });
    }
    // primeiro as casas viradas para a praça, depois as ruas
    housesAlong([234, cy, 278, cy, 14, 1, 0]);
    housesAlong([cx, 234, cx, 278, 14, 1, 0]);
    streets.forEach(function (st) { housesAlong(st); });
    // sítios afastados ao longo das estradas
    housesAlong([64, cy, 120, cy, 3, 0.35, 6]);
    housesAlong([392, cy, 450, cy, 3, 0.35, 6]);
    // quintais com horta atrás das casas e as sombras da lua
    houses.forEach(function (o) {
      if (o.church) return;
      var bx = -o.fx, by = -o.fy;
      var half = o.fx ? (o.ux ? o.b : o.a) : (o.ux ? o.a : o.b);   // meia largura na direção da rua
      var dep = o.fx ? (o.ux ? o.a : o.b) : (o.ux ? o.b : o.a);    // meia profundidade
      if (r() < 0.55) {
        var gd = r.int(4, 7);
        var gx0, gy0, gx1, gy1;
        if (bx) { gx0 = bx > 0 ? o.x + dep + 2 : o.x - dep - 2 - gd; gx1 = gx0 + gd; gy0 = o.y - half; gy1 = o.y + half; }
        else { gy0 = by > 0 ? o.y + dep + 2 : o.y - dep - 2 - gd; gy1 = gy0 + gd; gx0 = o.x - half; gx1 = o.x + half; }
        if (free(gx0, gy0, gx1, gy1)) {
          for (var yy = gy0; yy <= gy1; yy++) for (var xx = gx0; xx <= gx1; xx++) put(xx, yy, ((bx ? yy : xx) % 2) ? '#2e3c22' : '#3a3424');
          mark(gx0, gy0, gx1, gy1);
        }
      }
    });
    var shadow = new Uint8Array(S * S);
    objs.forEach(function (o) {
      if (o.k !== 'house' && o.k !== 'tower') return;
      var hx = o.k === 'tower' ? o.t : (o.ux ? o.a : o.b), hy = o.k === 'tower' ? o.t : (o.ux ? o.b : o.a);
      var len = Math.round((o.hr || o.ht) * 0.45);
      for (var t = 0; t <= len; t++) for (var yy = -hy - 1; yy <= hy + 1; yy++) for (var xx = -hx - 1; xx <= hx + 1; xx++)
        shadow[at(o.x + xx - t * 0.8, o.y + yy - t * 0.6)] = 1;
    });

    // árvores
    var AUTUMN = [['#c0702e', '#7a3a1e'], ['#d08a34', '#8a4a20'], ['#a85a2a', '#6a3018'], ['#b8a040', '#6a5a20']];
    function addTree(o) {
      if (!free(o.x - 2, o.y - 2, o.x + 2, o.y + 2)) return false;
      mark(o.x - 1, o.y - 1, o.x + 1, o.y + 1);
      var rr = Math.round(o.r * 0.8);
      for (var yy = -rr; yy <= rr; yy++) for (var xx = -rr; xx <= rr; xx++) if (xx * xx + yy * yy <= rr * rr) shadow[at(o.x + xx - 2, o.y + yy - 1.5)] = 1;
      objs.push(o);
      return true;
    }
    function autumn(xx, yy) {
      var c = r.pick(AUTUMN);
      return { k: 'tree', x: xx, y: yy, h: r.range(6, 8.5), r: r.range(2, 2.8), c1: P(c[0]), c2: P(c[1]), rad: 4 };
    }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { objs.push(autumn(cx + q[0] * 10, cy + q[1] * 10)); });
    for (i = 0; i < 140; i++) addTree(autumn(r.range(186, 326), r.range(192, 310)));
    for (i = 0; i < 40; i++) addTree(autumn(r.range(100, 412), r.range(cy - 26, cy + 26)));
    function arau(xx, yy, small) {
      return { k: 'arau', x: xx, y: yy, h: small ? r.range(12, 16) : r.range(15, 23), r: small ? r.range(2.8, 3.8) : r.range(3.4, 5.2), tiers: r() < 0.55 ? 2 : 1, rad: 7, near: 26 };
    }
    for (i = 0; i < 900; i++) {
      var ang = r() * TC.TAU, rad = r.range(70, 330);
      var ax = cx + Math.cos(ang) * rad * 1.2, ay = cy + Math.sin(ang) * rad;
      var ed = ellD(ax, ay);
      // a câmera gira a 175 do centro olhando para a igreja: entre ela e a cidade não pode ter árvore alta
      var dc = Math.sqrt((ax - cx) * (ax - cx) + (ay - cy) * (ay - cy));
      if (dc > 112 && dc < 215) continue;
      if (dc <= 112 && r() < 0.75) continue;    // na clareira, só umas araucárias soltas no meio das roças
      if (ed > 150 && r() < 0.45) continue;
      addTree(arau(ax, ay, dc <= 112));
    }
    // copas da mata vistas de cima (o chão da floresta)
    for (i = 0; i < 1400; i++) {
      var ax2 = r.int(0, 511), ay2 = r.int(0, 511);
      if (ellD(ax2, ay2) < 112 && r() < 0.95) continue;
      if (occ[at(ax2, ay2)]) continue;
      var rr2 = r.int(2, 4);
      for (y = -rr2; y <= rr2; y++) for (x = -rr2; x <= rr2; x++) {
        var d2 = x * x + y * y;
        if (d2 > rr2 * rr2) continue;
        put(ax2 + x, ay2 + y, d2 < 2 ? '#0a140e' : (x + y < -1 ? '#2e5a3e' : '#1a3426'));
      }
    }
    // sombras das casas e das árvores ao luar
    for (i = 0; i < S * S; i++) if (shadow[i]) darken(i & 511, i >> 9, 0.72);
    var cv = pb.toCanvas();
    cv.objs = objs;
    return cv;
  };
})();
