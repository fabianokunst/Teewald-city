'use strict';
/* Teewald City — arte procedural do ambiente: céu, lua, serras, araucárias, casas de enxaimel, igreja, postes, adereços, tiles */
(function () {
  var ART = TC.ART = TC.ART || {};
  var u32 = TC.u32;

  ART.PAL = {
    sky0: '#03040c', sky1: '#080b22', sky2: '#121840', sky3: '#232a5c', skyH: '#3a3c70',
    moon: '#f4f0d8', moonD: '#c8c4a8', moonHalo: '#8890c0',
    hillFar: '#1a1d40', hillMid: '#12142e', hillNear: '#0b0c1e',
    rimFar: '#2e3466', rimMid: '#262b55',
    trunk: '#4a3428', trunkD: '#2c1e18', trunkL: '#7a6050',
    needle: '#1e3a2c', needleD: '#10241c', needleL: '#3a6a4a', needleM: '#2a5038',
    leafO: '#c86a28', leafR: '#a03a20', leafY: '#e0a040', leafD: '#6a2a18',
    wall: '#e4dccc', wallS: '#b8ae9c', wallD: '#8a8070',
    wallP: '#d8a898', wallPS: '#a87870',
    wallY: '#e0c890', wallYS: '#b09a68',
    timber: '#4a2a1e', timberD: '#2a160e', timberR: '#6a3022',
    roof: '#3a3040', roofD: '#221c28', roofL: '#5a4a5a', roofR: '#5a2a2a', roofRD: '#3a1a1c',
    stone: '#6a6670', stoneD: '#46424e', stoneL: '#8e8a96',
    glass: '#1a2240', glassL: '#4a5a8a', glassW: '#ffc860', glassWD: '#d08a30',
    frame: '#e8e4dc',
    sodium: '#ffb050', sodiumL: '#ffe0a0',
    pole: '#3a2a22', poleD: '#22180f',
    iron: '#1c1c24', ironL: '#4a4a5a'
  };
  var P = ART.PAL;

  /* ---------- céu em degradê por scanline (como HDMA) ---------- */
  ART.sky = function (w, h, stops, seed, starDensity) {
    var pb = new TC.PixBuf(w, h);
    for (var y = 0; y < h; y++) {
      var t = y / (h - 1), a = stops[0], b = stops[stops.length - 1];
      for (var i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i][0] && t <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
      }
      var k = (t - a[0]) / Math.max(0.0001, b[0] - a[0]);
      var c = u32(TC.mix(a[1], b[1], k));
      for (var x = 0; x < w; x++) pb.d[y * w + x] = c;
    }
    if (starDensity) {
      var r = TC.RNG(seed || 7);
      var n = Math.floor(w * h * starDensity);
      for (var s = 0; s < n; s++) {
        var sx = r.int(0, w - 1), sy = Math.floor(Math.pow(r(), 1.6) * h * 0.85);
        var br = r();
        var col = br > 0.92 ? '#ffffff' : br > 0.7 ? '#c8d0f0' : br > 0.4 ? '#8088b8' : '#4a5080';
        pb.set(sx, sy, u32(col));
        if (br > 0.97) {
          pb.set(sx - 1, sy, u32('#6a70a0')); pb.set(sx + 1, sy, u32('#6a70a0'));
          pb.set(sx, sy - 1, u32('#6a70a0')); pb.set(sx, sy + 1, u32('#6a70a0'));
        }
      }
    }
    return pb.toCanvas();
  };

  /* estrelas que piscam (posições para desenhar dinamicamente) */
  ART.twinkles = function (w, h, n, seed) {
    var r = TC.RNG(seed || 99), out = [];
    for (var i = 0; i < n; i++) out.push({ x: r.int(0, w - 1), y: Math.floor(Math.pow(r(), 1.5) * h), p: r() * 100, s: 0.03 + r() * 0.06 });
    return out;
  };
  ART.drawTwinkles = function (ctx, list, t, ox, oy, wrapW) {
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var v = Math.sin(t * s.s + s.p);
      if (v < 0.2) continue;
      var x = s.x - (ox || 0);
      if (wrapW) x = ((x % wrapW) + wrapW) % wrapW;
      var y = s.y - (oy || 0);
      ctx.fillStyle = v > 0.85 ? '#ffffff' : v > 0.55 ? '#c0c8f0' : '#6870a8';
      ctx.fillRect(x, y, 1, 1);
      if (v > 0.93) {
        ctx.fillStyle = '#5860a0';
        ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
      }
    }
  };

  /* ---------- lua cheia com halo ---------- */
  ART.moon = function (r, tintRed) {
    var halo = r * 3;
    var size = halo * 2 + 2;
    var cv = TC.canvas(size, size), c = cv.ctx;
    var cx = size / 2, cy = size / 2;
    var haloCol = tintRed ? '#a04040' : P.moonHalo;
    for (var i = 5; i >= 1; i--) {
      c.fillStyle = TC.rgba(haloCol, 0.07 + (5 - i) * 0.015);
      TC.fillCircle(c, cx, cy, r + (halo - r) * i / 5);
    }
    var pb = TC.bufFrom(cv);
    var base = tintRed ? '#e8b0a0' : P.moon, dark = tintRed ? '#b07868' : P.moonD;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var d = x * x + y * y;
        if (d > r * r) continue;
        var n = TC.fbm2((x + 40) / 5, (y + 40) / 5, 3, 3);
        var col = n > 0.58 ? dark : base;
        if (d > (r - 1.2) * (r - 1.2) && x < 0) col = TC.mix(col, dark, 0.5);
        pb.set(cx + x, cy + y, u32(col));
      }
    }
    return pb.toCanvas();
  };

  /* ---------- silhuetas de serras com araucárias (repetíveis horizontalmente) ---------- */
  ART.hills = function (w, h, opt) {
    opt = opt || {};
    var seed = opt.seed || 1;
    var pb = new TC.PixBuf(w, h);
    var fill = u32(opt.color || P.hillMid), rim = u32(opt.rim || P.rimMid);
    var tops = [];
    var period = opt.period || 8;
    for (var x = 0; x < w; x++) {
      var n = TC.fbm1(x / w * period, seed, 4, period);
      var top = Math.round(h * (opt.base || 0.4) + (n - 0.5) * h * (opt.amp || 0.6));
      tops.push(top);
      for (var y = Math.max(0, top); y < h; y++) pb.d[y * w + x] = fill;
      if (top >= 0 && top < h) pb.d[top * w + x] = rim;
    }
    if (opt.trees) {
      var r = TC.RNG(seed * 13 + 5);
      var count = opt.trees;
      for (var i = 0; i < count; i++) {
        var tx = r.int(0, w - 1);
        var th = r.int(opt.treeMin || 8, opt.treeMax || 18);
        var kind = r() < (opt.arauc == null ? 0.7 : opt.arauc) ? 'a' : 'p';
        treeSil(pb, tx, tops[tx] + 2, th, kind, fill, rim, r, w);
      }
    }
    return pb.toCanvas();
  };

  // pequena árvore em silhueta (para planos de fundo)
  function treeSil(pb, x, base, h, kind, fill, rim, r, wrapW) {
    function px(xx, yy, c) { pb.set(((xx % wrapW) + wrapW) % wrapW, yy, c); }
    if (kind === 'a') {
      for (var y = 0; y < h; y++) px(x, base - y, fill);
      var crownW = Math.round(h * 0.55);
      var topY = base - h;
      // copa em forma de taça (candelabro)
      for (var yy = 0; yy < Math.max(2, h * 0.28); yy++) {
        var ww = Math.round(crownW * (0.55 + 0.45 * (1 - yy / (h * 0.28))));
        for (var dx = -ww; dx <= ww; dx++) {
          if (yy === 0 && r() < 0.3) continue;
          px(x + dx, topY + yy, fill);
        }
      }
      for (var b = -crownW; b <= crownW; b += Math.max(2, Math.round(crownW / 3))) {
        px(x + b, topY - 1, fill);
        if (b > 0) px(x + b, topY - 1, rim);
      }
      // ramos
      for (var k = 0; k < 3; k++) {
        var by = topY + Math.round(h * 0.28) + k * 2;
        var bw = Math.round(crownW * (0.7 - k * 0.15));
        for (var d = 1; d <= bw; d++) { px(x - d, by - Math.round(d * 0.5), fill); px(x + d, by - Math.round(d * 0.5), fill); }
      }
    } else {
      for (var j = 0; j < h; j++) {
        var hw = Math.round((j / h) * h * 0.3);
        for (var q = -hw; q <= hw; q++) px(x + q, base - h + j, fill);
        if (j % 3 === 0) px(x + hw, base - h + j, rim);
      }
    }
  }

  /* ---------- araucária detalhada ---------- */
  // H = altura total; opt.sil = cor única; opt.lit = luz da lua pela direita
  ART.araucaria = function (seed, H, opt) {
    opt = opt || {};
    var r = TC.RNG(seed);
    var crownW = Math.round(H * r.range(0.36, 0.48));
    var W = crownW * 2 + 14;
    var pb = new TC.PixBuf(W, H + 4);
    var cx = Math.floor(W / 2);
    var sil = opt.sil ? u32(opt.sil) : 0;
    var rim = opt.rim ? u32(opt.rim) : 0;
    var C = {
      trunk: sil || u32(P.trunk), trunkD: sil || u32(P.trunkD), trunkL: sil || u32(P.trunkL),
      nd: sil || u32(P.needleD), n: sil || u32(P.needle), nm: sil || u32(P.needleM), nl: sil || u32(P.needleL),
      br: sil || u32(P.trunkD)
    };
    var topY = 4;
    var crownH = Math.round(H * r.range(0.2, 0.27));
    var crownBase = topY + crownH;
    var sz = Math.max(2, H / 24);
    // tronco reto e alto
    var tw = Math.max(1, Math.round(H / 46));
    for (var y = topY + Math.round(crownH * 0.3); y < H + 4; y++) {
      var k = (y - topY) / H;
      var w = Math.max(1, Math.round(tw * (0.7 + 0.6 * k)));
      for (var dx = -w; dx <= w; dx++) {
        var c = C.trunk;
        if (dx === -w) c = C.trunkD;
        else if (dx === w && !sil) c = C.trunkL;
        if (!sil && ((y * 7 + dx * 3) % 13 === 0)) c = C.trunkD;
        pb.set(cx + dx, y, c);
      }
      if (rim && w > 0) pb.set(cx + w, y, (y % 3) ? rim : sil);
    }
    var tufts = [];
    function branch(x0, y0, x1, y1, pw) {
      var n = Math.ceil(Math.abs(x1 - x0) * 1.4) + 2;
      for (var s = 0; s <= n; s++) {
        var t = s / n;
        var bx = x0 + (x1 - x0) * t;
        var by = y0 + (y1 - y0) * Math.pow(t, pw);
        pb.set(Math.round(bx), Math.round(by), C.br);
        if (H > 70) pb.set(Math.round(bx), Math.round(by) + 1, C.br);
      }
    }
    // verticilos: galhos saem quase horizontais e sobem na ponta (candelabro de topo achatado)
    var whorls = r.int(4, 6);
    for (var i = 0; i < whorls; i++) {
      var wy = crownBase - Math.round(i * crownH * 0.7 / whorls) + r.int(-1, 1);
      var reach = crownW * (1 - i * 0.13) * r.range(0.85, 1.0);
      [-1, 1].forEach(function (side) {
        var len = reach * r.range(0.8, 1.0);
        var tipX = cx + side * len;
        var tipY = topY + r.int(0, 2) + (i === 0 ? r.int(1, 4) : 0);
        branch(cx, wy, tipX, tipY, 2.6);
        tufts.push({ x: tipX, y: tipY, s: sz * r.range(0.9, 1.25) });
        if (len > 10) {
          var t2 = r.range(0.5, 0.7);
          tufts.push({ x: cx + side * len * t2, y: wy + (tipY - wy) * Math.pow(t2, 2.6) - 1, s: sz * 0.75 });
        }
      });
      if (r() < 0.7) {
        var fl = reach * r.range(0.25, 0.5), fs = r.sign();
        tufts.push({ x: cx + fs * fl, y: topY + 2 + r.int(0, 3), s: sz * 0.9 });
      }
    }
    // galho seco caído (árvores velhas)
    if (H > 70 && r() < 0.7) {
      var ds = r.sign(), dl = crownW * r.range(0.35, 0.55);
      var dy0 = crownBase + r.int(4, 10);
      branch(cx, dy0, cx + ds * dl, dy0 + dl * 0.35, 1);
      tufts.push({ x: cx + ds * dl, y: dy0 + dl * 0.35, s: sz * 0.6 });
    }
    tufts.push({ x: cx, y: topY + 1, s: sz * 0.9 });
    // tufos achatados com acículas para cima
    tufts.forEach(function (tf) {
      var rx = Math.max(2, Math.round(tf.s * 2.1)), ry = Math.max(1, Math.round(tf.s * 0.8));
      for (var yy = -ry - 2; yy <= ry; yy++) {
        for (var xx = -rx; xx <= rx; xx++) {
          var e = (xx * xx) / (rx * rx) + (yy * yy) / (ry * ry);
          var jag = TC.hash2(Math.round(tf.x + xx), Math.round(tf.y + yy), seed);
          var lim = yy < 0 ? 1 + jag * 1.6 : 1 + jag * 0.2;
          if (e > lim) continue;
          if (yy < -ry && ((Math.round(tf.x + xx)) & 1)) continue;
          var col;
          if (sil) col = (rim && yy <= -ry + 0 && xx > -rx * 0.3) ? rim : sil;
          else if (yy < 0 && xx > -rx * 0.3) col = (jag > 0.45) ? C.nl : C.nm;
          else if (yy > ry * 0.3) col = C.nd;
          else col = jag > 0.6 ? C.nm : C.n;
          pb.set(Math.round(tf.x + xx), Math.round(tf.y + yy), col);
        }
      }
    });
    var cv = pb.toCanvas();
    cv.baseX = cx;
    return cv;
  };

  /* ---------- pinheiro (pinus) ---------- */
  ART.pine = function (seed, H, opt) {
    opt = opt || {};
    var r = TC.RNG(seed);
    var W = Math.round(H * 0.6) + 4;
    var pb = new TC.PixBuf(W, H + 2);
    var cx = Math.floor(W / 2);
    var sil = opt.sil ? u32(opt.sil) : 0;
    var nd = sil || u32(P.needleD), n = sil || u32(P.needle), nl = sil || u32(P.needleL), tr = sil || u32(P.trunkD);
    for (var y = Math.round(H * 0.7); y < H + 2; y++) { pb.set(cx, y, tr); pb.set(cx + 1, y, tr); }
    var tiers = Math.max(3, Math.round(H / 10));
    for (var i = 0; i < tiers; i++) {
      var ty = Math.round(i * H * 0.82 / tiers);
      var th = Math.round(H * 0.82 / tiers * 1.6);
      var tw = Math.round((W / 2 - 1) * (0.35 + 0.65 * (i + 1) / tiers));
      for (var j = 0; j < th; j++) {
        var hw = Math.round(tw * j / th);
        for (var dx = -hw; dx <= hw; dx++) {
          var col = dx > hw * 0.4 ? nl : (j > th * 0.7 ? nd : n);
          if (sil) col = sil;
          if (j === th - 1 && TC.hash2(dx, i, seed) > 0.5) continue;
          pb.set(cx + dx, ty + j, col);
        }
      }
    }
    var cv = pb.toCanvas();
    cv.baseX = cx;
    return cv;
  };

  /* ---------- árvore de outono (folhagem laranja) ---------- */
  ART.autumnTree = function (seed, H, opt) {
    opt = opt || {};
    var r = TC.RNG(seed);
    var W = Math.round(H * 0.9);
    var pb = new TC.PixBuf(W, H + 2);
    var cx = Math.floor(W / 2);
    var sil = opt.sil ? u32(opt.sil) : 0;
    var tr = sil || u32(P.trunk), trd = sil || u32(P.trunkD), trl = sil || u32('#8a8478');
    // tronco claro (como plátanos) com galhos
    for (var y = Math.round(H * 0.45); y < H + 2; y++) {
      var w = y > H * 0.85 ? 3 : 2;
      for (var dx = -w; dx <= w; dx++) pb.set(cx + dx, y, dx === -w ? trd : dx > 0 ? trl : tr);
    }
    for (var b = 0; b < 4; b++) {
      var side = b % 2 ? 1 : -1;
      var by = Math.round(H * (0.5 + b * 0.06));
      var len = Math.round(W * r.range(0.18, 0.3));
      for (var s = 0; s < len; s++) pb.set(cx + side * s, by - Math.round(s * 0.8), trd);
    }
    var blobs = [];
    var nb = r.int(9, 14);
    for (var i = 0; i < nb; i++) {
      var a = r.range(Math.PI * 1.05, Math.PI * 1.95);
      var d = r.range(0, W * 0.28);
      blobs.push({ x: cx + Math.cos(a) * d * 1.3, y: H * 0.36 + Math.sin(a) * d * 0.9, r: r.range(W * 0.12, W * 0.2) });
    }
    var palette = opt.green ? ['#1a3a2a', '#2a5038', '#3e6a44', '#4e8050'] :
      [P.leafD, P.leafR, P.leafO, P.leafY];
    blobs.forEach(function (bl) {
      for (var yy = -bl.r; yy <= bl.r; yy++) {
        for (var xx = -bl.r; xx <= bl.r; xx++) {
          var e = (xx * xx + yy * yy) / (bl.r * bl.r);
          var jag = TC.hash2(Math.round(bl.x + xx), Math.round(bl.y + yy), seed) * 0.35;
          if (e > 1 - jag) continue;
          var light = (-yy / bl.r) * 0.5 + (xx / bl.r) * 0.35 + TC.hash2(Math.round(xx * 2), Math.round(yy * 2), seed + 1) * 0.6;
          var idx = TC.clamp(Math.floor(light * 2.2 + 1), 0, 3);
          pb.set(Math.round(bl.x + xx), Math.round(bl.y + yy), sil || u32(palette[idx]));
        }
      }
    });
    var cv = pb.toCanvas();
    cv.baseX = cx;
    return cv;
  };

  /* ---------- casa em enxaimel (fachada frontal, vista lateral do jogo) ---------- */
  // opt: floors, w, wall ('white'|'pink'|'yellow'), roof ('gable'|'eave'), lit (janelas acesas), seed
  ART.house = function (opt) {
    opt = opt || {};
    var r = TC.RNG(opt.seed || 1);
    var floors = opt.floors || r.int(2, 3);
    var W = opt.w || r.int(5, 7) * 16;
    var FH = 46;                 // altura do andar
    var baseH = opt.stoneBase === false ? 0 : 14; // embasamento de pedra
    var gable = (opt.roof || (r() < 0.65 ? 'gable' : 'eave')) === 'gable';
    var roofH = gable ? Math.round(W * 0.62) : 34;
    var H = baseH + floors * FH + roofH;
    var pb = new TC.PixBuf(W + 8, H + 2);
    var ox = 4;
    var wallKind = opt.wall || r.pick(['white', 'white', 'white', 'pink', 'yellow']);
    var wallC = wallKind === 'pink' ? [P.wallP, P.wallPS] : wallKind === 'yellow' ? [P.wallY, P.wallYS] : [P.wall, P.wallS];
    var wl = u32(wallC[0]), ws = u32(wallC[1]);
    var tm = u32(opt.timber || (r() < 0.3 ? P.timberR : P.timber)), tmd = u32(P.timberD);
    var roofCols = r() < 0.5 ? [P.roof, P.roofD, P.roofL] : [P.roofR, P.roofRD, '#7a3a34'];
    var rf = u32(roofCols[0]), rfd = u32(roofCols[1]), rfl = u32(roofCols[2]);
    var wallTop = roofH;
    var wallBot = H - baseH;
    var x, y;

    // parede (reboco com textura leve)
    for (y = wallTop; y < wallBot; y++) {
      for (x = 0; x < W; x++) {
        var n = TC.hash2(x, y, opt.seed || 1);
        pb.set(ox + x, y, n > 0.93 ? ws : wl);
      }
    }
    // sombra sob o beiral
    for (y = wallTop; y < wallTop + 4; y++) for (x = 0; x < W; x++) pb.set(ox + x, y, ws);

    // estrutura de madeira (enxaimel)
    function beamH(yy, th) { for (var t = 0; t < th; t++) for (var xx = 0; xx < W; xx++) pb.set(ox + xx, yy + t, t === th - 1 ? tmd : tm); }
    function beamV(xx, y0, y1, th) { for (var yy = y0; yy < y1; yy++) for (var t = 0; t < th; t++) pb.set(ox + xx + t, yy, t === th - 1 ? tmd : tm); }
    function diag(x0, y0, x1, y1, th) {
      var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (var i = 0; i <= n; i++) {
        var xx = Math.round(x0 + (x1 - x0) * i / n), yy = Math.round(y0 + (y1 - y0) * i / n);
        for (var t = 0; t < th; t++) pb.set(ox + xx + t, yy, tm);
      }
    }
    var posts = [];
    var nPosts = Math.max(3, Math.round(W / 18));
    for (var i = 0; i <= nPosts; i++) posts.push(Math.min(W - 3, Math.round(i * (W - 3) / nPosts)));
    var windows = [];
    for (var f = 0; f < floors; f++) {
      var fy0 = wallTop + f * FH;
      var fy1 = fy0 + FH;
      beamH(fy0, 3);
      if (f === floors - 1) beamH(fy1 - 3, 3);
      for (var p = 0; p < posts.length; p++) beamV(posts[p], fy0, fy1, 3);
      // painéis: janela ou diagonal
      for (p = 0; p < posts.length - 1; p++) {
        var px0 = posts[p] + 3, px1 = posts[p + 1];
        var pw = px1 - px0;
        var isDoor = f === floors - 1 && opt.door !== false && p === (opt.doorPanel != null ? opt.doorPanel : Math.floor((posts.length - 1) / 2));
        if (isDoor) { windows.push({ door: true, x: px0 + Math.floor((pw - 14) / 2), y: fy1 - 3 - 26, w: 14, h: 26 }); continue; }
        var hasWin = r() < (f === floors - 1 ? 0.6 : 0.75) && pw >= 12;
        // trava horizontal no meio (peitoril)
        var sill = fy0 + Math.round(FH * 0.62);
        if (hasWin) {
          var ww = Math.min(12, pw - 4), wh = 16;
          var wx = px0 + Math.floor((pw - ww) / 2), wy = fy0 + 9;
          windows.push({ x: wx, y: wy, w: ww, h: wh, lit: opt.lit && r() < opt.lit, flowers: r() < 0.4 });
          for (x = px0; x < px1; x++) { pb.set(ox + x, sill + 2, tm); pb.set(ox + x, sill + 3, tmd); }
          // diagonais abaixo da janela (cruz de Santo André)
          diag(px0, sill + 4, px1 - 2, fy1 - 2, 2);
          diag(px1 - 2, sill + 4, px0, fy1 - 2, 2);
        } else {
          var kind = r.int(0, 2);
          if (kind === 0) { diag(px0, fy0 + 3, px1 - 2, fy1 - 3, 2); }
          else if (kind === 1) { diag(px1 - 2, fy0 + 3, px0, fy1 - 3, 2); }
          else {
            for (x = px0; x < px1; x++) { pb.set(ox + x, sill, tm); pb.set(ox + x, sill + 1, tmd); }
            diag(px0, fy0 + 3, px1 - 2, sill, 2);
            diag(px1 - 2, sill + 2, px0, fy1 - 3, 2);
          }
        }
      }
    }
    // janelas e porta
    windows.forEach(function (w) {
      var fr = u32(P.frame), g = u32(w.lit ? P.glassW : P.glass), gl = u32(w.lit ? P.glassWD : P.glassL);
      if (w.door) {
        for (var yy = w.y; yy < w.y + w.h; yy++) for (var xx = w.x - 2; xx < w.x + w.w + 2; xx++) pb.set(ox + xx, yy, tmd);
        for (yy = w.y + 2; yy < w.y + w.h; yy++) for (xx = w.x; xx < w.x + w.w; xx++) {
          var cc = (xx - w.x) % 4 === 0 ? u32('#3a2014') : u32('#5a3420');
          if (yy < w.y + 5 && (xx - w.x < 2 || xx - w.x > w.w - 3)) cc = tmd;
          pb.set(ox + xx, yy, cc);
        }
        pb.set(ox + w.x + w.w - 3, w.y + 15, u32('#d0b060'));
        return;
      }
      for (var yy2 = w.y - 1; yy2 < w.y + w.h + 1; yy2++) for (var xx2 = w.x - 1; xx2 < w.x + w.w + 1; xx2++) pb.set(ox + xx2, yy2, fr);
      for (yy2 = w.y; yy2 < w.y + w.h; yy2++) {
        for (xx2 = w.x; xx2 < w.x + w.w; xx2++) {
          var col = g;
          if (!w.lit && (xx2 - w.x) + (yy2 - w.y) * 0.6 < 4) col = gl;
          if (w.lit && yy2 > w.y + w.h * 0.6) col = gl;
          pb.set(ox + xx2, yy2, col);
        }
      }
      var mx = w.x + Math.floor(w.w / 2), my = w.y + Math.floor(w.h / 2) - 1;
      for (yy2 = w.y; yy2 < w.y + w.h; yy2++) pb.set(ox + mx, yy2, fr);
      for (xx2 = w.x; xx2 < w.x + w.w; xx2++) pb.set(ox + xx2, my, fr);
      // venezianas
      if (opt.shutters !== false) {
        var sc = u32(r() < 0.5 ? '#2a4a3a' : '#5a3a28'), scd = u32('#1a2a22');
        for (yy2 = w.y - 1; yy2 < w.y + w.h + 1; yy2++) {
          for (var t = 0; t < 4; t++) {
            pb.set(ox + w.x - 6 + t, yy2, (yy2 % 2) ? sc : scd);
            pb.set(ox + w.x + w.w + 2 + t, yy2, (yy2 % 2) ? sc : scd);
          }
        }
      }
      if (w.flowers) {
        for (xx2 = w.x - 1; xx2 < w.x + w.w + 1; xx2++) {
          pb.set(ox + xx2, w.y + w.h + 1, u32('#5a3420'));
          pb.set(ox + xx2, w.y + w.h + 2, u32('#3a2014'));
          if (TC.hash2(xx2, w.y, 5) > 0.35) pb.set(ox + xx2, w.y + w.h, u32(TC.hash2(xx2, 3, 9) > 0.5 ? '#d04050' : '#e080a0'));
          if (TC.hash2(xx2, w.y, 6) > 0.6) pb.set(ox + xx2, w.y + w.h - 1, u32('#3a7040'));
        }
      }
    });
    // embasamento de pedra
    if (baseH) {
      for (y = wallBot; y < H; y++) {
        for (x = -1; x < W + 1; x++) {
          var row = Math.floor((y - wallBot) / 5);
          var bx = (x + (row % 2) * 6) % 12;
          var c2 = (bx === 0 || (y - wallBot) % 5 === 0) ? u32(P.stoneD) : (TC.hash2(Math.floor((x + (row % 2) * 6) / 12), row, 3) > 0.5 ? u32(P.stone) : u32(P.stoneL));
          pb.set(ox + x, y, c2);
        }
      }
      // degraus da porta
      windows.forEach(function (w) {
        if (!w.door) return;
        for (var s = 0; s < 3; s++) {
          for (var xx = w.x - 4 - s * 2; xx < w.x + w.w + 4 + s * 2; xx++) {
            for (var yy = 0; yy < 4; yy++) pb.set(ox + xx, wallBot + s * 4 + yy + 1, yy === 0 ? u32(P.stoneL) : u32(P.stone));
          }
        }
        for (var yy3 = w.y + w.h; yy3 <= wallBot; yy3++) for (var xx3 = w.x - 2; xx3 < w.x + w.w + 2; xx3++) pb.set(ox + xx3, yy3, tmd);
      });
    }
    // telhado
    if (gable) {
      var apexX = W / 2;
      for (y = 0; y < roofH; y++) {
        var half = (y / roofH) * (W / 2 + 4);
        // empena: parede triangular com enxaimel
        var inner = half - 4;
        for (x = Math.round(apexX - half); x <= Math.round(apexX + half); x++) {
          var dxa = Math.abs(x - apexX);
          var cc3;
          if (dxa > inner) cc3 = (dxa > half - 1) ? rfd : (x < apexX ? rf : rfl);
          else {
            cc3 = TC.hash2(x, y, 9) > 0.93 ? ws : wl;
            if (Math.abs(x - apexX) < 1.5 && y > 4) cc3 = tm;
            if (y === roofH - 1 || y === roofH - 2) cc3 = tm;
            if (y === Math.round(roofH * 0.55) || y === Math.round(roofH * 0.55) + 1) cc3 = tm;
          }
          pb.set(ox + x, y, cc3);
        }
      }
      // diagonais na empena + janelinha do sótão
      var gy = Math.round(roofH * 0.55);
      diag(Math.round(apexX - gy * 0.5), gy, Math.round(apexX - 2), roofH - 3, 2);
      diag(Math.round(apexX + gy * 0.5), gy, Math.round(apexX + 1), roofH - 3, 2);
      var aw = 8, ah = 9, ax = Math.round(apexX - aw / 2), ay = Math.round(roofH * 0.25);
      for (var yy4 = ay - 1; yy4 < ay + ah + 1; yy4++) for (var xx4 = ax - 1; xx4 < ax + aw + 1; xx4++) pb.set(ox + xx4, yy4, u32(P.frame));
      for (yy4 = ay; yy4 < ay + ah; yy4++) for (xx4 = ax; xx4 < ax + aw; xx4++) pb.set(ox + xx4, yy4, u32(opt.lit && r() < 0.5 ? P.glassW : P.glass));
      // beiral (madeira escura) acompanhando o telhado
      for (y = 0; y < roofH; y++) {
        var hf = (y / roofH) * (W / 2 + 4);
        for (var t2 = 0; t2 < 3; t2++) {
          pb.set(ox + Math.round(apexX - hf) + t2, y, t2 === 0 ? rfd : rf);
          pb.set(ox + Math.round(apexX + hf) - t2, y, t2 === 0 ? rfd : rfl);
        }
      }
    } else {
      // telhado de beiral (água para a rua) com telhas
      for (y = 0; y < roofH; y++) {
        var inset = Math.round((roofH - y) * 0.45);
        for (x = -4 + inset; x < W + 4 - inset; x++) {
          var tile = ((x + (Math.floor(y / 4) % 2) * 3) % 6 === 0) || y % 4 === 3;
          pb.set(ox + x, y, tile ? rfd : (y < 3 ? rfl : rf));
        }
      }
      // água-furtada (lucarna)
      if (W > 70) {
        var dx0 = Math.round(W / 2 - 8);
        for (y = 6; y < roofH - 2; y++) for (x = dx0; x < dx0 + 16; x++) pb.set(ox + x, y, wl);
        for (y = 2; y < 8; y++) for (x = dx0 - 2 + (8 - y); x < dx0 + 18 - (8 - y); x++) pb.set(ox + x, y, rfd);
        for (y = 10; y < roofH - 5; y++) for (x = dx0 + 3; x < dx0 + 13; x++) pb.set(ox + x, y, u32(opt.lit && r() < 0.5 ? P.glassW : P.glass));
        for (y = 10; y < roofH - 5; y++) pb.set(ox + dx0 + 8, y, u32(P.frame));
      }
    }
    // chaminé
    if (r() < 0.55) {
      var chx = gable ? Math.round(W * 0.7) : Math.round(W * r.range(0.2, 0.8));
      var chTop = gable ? Math.round(roofH * (1 - (W * 0.7 - W / 2) / (W / 2 + 4))) - 14 : -10;
      if (chTop > 0) for (y = chTop; y < chTop + 16; y++) for (x = chx; x < chx + 6; x++) pb.set(ox + x, y, ((x + y) % 4 === 0) ? u32(P.stoneD) : u32('#6a3a30'));
    }
    var cv = pb.toCanvas();
    cv.lights = windows.filter(function (w) { return w.lit; }).map(function (w) { return { x: w.x + ox + w.w / 2, y: w.y + w.h / 2 }; });
    cv.H = H;
    return cv;
  };

  /* ---------- igreja gótica branca ---------- */
  ART.church = function () {
    var W = 132, H = 214;
    var pb = new TC.PixBuf(W, H);
    var cx = W / 2;
    var wl = u32('#e8e8f0'), ws = u32('#b0b0c4'), wd = u32('#7a7a94'), ed = u32('#4a4a60');
    var x, y;
    function rect(x0, y0, w, h, c) { pb.rect(x0, y0, w, h, c); }
    function wallRect(x0, y0, w, h) {
      for (var yy = y0; yy < y0 + h; yy++) for (var xx = x0; xx < x0 + w; xx++) {
        var c = TC.hash2(xx, yy, 21) > 0.95 ? ws : wl;
        if ((yy - y0) % 9 === 8 && TC.hash2(xx >> 3, yy, 2) > 0.3) c = ws;
        pb.set(xx, yy, c);
      }
      for (yy = y0; yy < y0 + h; yy++) { pb.set(x0, yy, ws); pb.set(x0 + w - 1, yy, wd); }
    }
    function lancet(x0, y0, w, h, lit) {
      for (var yy = y0 - 1; yy < y0 + h + 1; yy++) {
        for (var xx = x0 - 1; xx < x0 + w + 1; xx++) {
          var top = y0 + w * 0.6;
          if (yy < top) {
            var dxx = Math.abs(xx - (x0 + w / 2 - 0.5));
            var lim = (w / 2 + 1) * Math.sqrt(Math.max(0, (yy - y0 + 1) / (w * 0.6 + 1)));
            if (dxx > lim) continue;
          }
          pb.set(xx, yy, ed);
        }
      }
      for (yy = y0; yy < y0 + h; yy++) {
        for (xx = x0; xx < x0 + w; xx++) {
          var top2 = y0 + w * 0.6;
          var dx2 = Math.abs(xx - (x0 + w / 2 - 0.5));
          if (yy < top2 && dx2 > (w / 2) * Math.sqrt(Math.max(0, (yy - y0) / (w * 0.6)))) continue;
          var stained = ['#3a2a6a', '#6a2a3a', '#2a4a6a', '#6a5a2a'][(Math.floor(xx / 2) + Math.floor(yy / 3)) % 4];
          var c = lit ? TC.mix(stained, '#ffc070', 0.45) : stained;
          pb.set(xx, yy, (xx - x0) === Math.floor(w / 2) ? ed : u32(c));
        }
      }
    }
    // nave (corpo principal)
    var naveY = 112, naveX = 14, naveW = W - 28;
    wallRect(naveX, naveY, naveW, H - naveY);
    // telhado da nave (frontão)
    for (y = 0; y < 30; y++) {
      var hw = (y / 30) * (naveW / 2 + 2);
      for (x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) pb.set(x, naveY - 30 + y, Math.abs(x - cx) > hw - 2 ? ed : (TC.hash2(x, y, 4) > 0.94 ? ws : wl));
    }
    // contrafortes e pináculos
    [naveX - 6, naveX + naveW - 2].forEach(function (bx) {
      for (y = naveY - 10; y < H; y++) for (x = bx; x < bx + 8; x++) pb.set(x, y, x === bx ? ws : x === bx + 7 ? wd : wl);
      for (y = 0; y < 18; y++) {
        var w2 = Math.max(0, Math.round(4 - y / 4.5));
        for (x = bx + 4 - w2; x <= bx + 3 + w2; x++) pb.set(x, naveY - 28 + y, y < 2 ? ws : wl);
      }
      pb.set(bx + 3, naveY - 30, ed); pb.set(bx + 4, naveY - 30, ed);
    });
    // torre central
    var tw = 40, tx = Math.round(cx - tw / 2), ty = 58;
    wallRect(tx, ty, tw, naveY - ty + 10);
    // relógio
    var clx = Math.round(cx), cly = ty + 20;
    for (y = -8; y <= 8; y++) for (x = -8; x <= 8; x++) {
      var d = x * x + y * y;
      if (d <= 64) pb.set(clx + x, cly + y, d > 49 ? ed : u32('#f4f0e0'));
    }
    pb.line(clx, cly, clx, cly - 6, ed); pb.line(clx, cly, clx + 4, cly + 1, ed);
    // campanário (aberturas)
    for (var k = 0; k < 2; k++) lancet(tx + 8 + k * 16, ty + 34, 8, 16, false);
    rect(tx + 8, ty + 46, 24, 2, ed);
    // flecha (agulha) da torre
    var spireH = 52;
    for (y = 0; y < spireH; y++) {
      var sw = (y / spireH) * (tw / 2 + 3);
      for (x = Math.round(cx - sw); x <= Math.round(cx + sw); x++) {
        var c3 = x < cx ? u32('#5a5a74') : u32('#3a3a50');
        if ((y % 6 === 0)) c3 = ed;
        pb.set(x, ty - spireH + y, c3);
      }
    }
    // pináculos da torre
    [tx - 2, tx + tw - 4].forEach(function (px) {
      for (y = 0; y < 14; y++) { var w3 = Math.round(3 - y / 5); for (x = px + 3 - w3; x <= px + 3 + w3; x++) pb.set(x, ty - 14 + y, wl); }
    });
    // cruz
    var crY = ty - spireH - 12;
    rect(Math.round(cx) - 1, crY, 2, 12, u32('#d8c890'));
    rect(Math.round(cx) - 4, crY + 3, 8, 2, u32('#d8c890'));
    // rosácea
    var rx = Math.round(cx), ry = naveY + 8;
    for (y = -10; y <= 10; y++) for (x = -10; x <= 10; x++) {
      var d2 = Math.sqrt(x * x + y * y);
      if (d2 > 10.5) continue;
      var ang = Math.atan2(y, x);
      var c4;
      if (d2 > 9) c4 = ed;
      else if (d2 < 2.5) c4 = u32('#c08040');
      else if (Math.abs(((ang / (Math.PI / 4)) % 1 + 1) % 1 - 0.5) > 0.38) c4 = ed;
      else c4 = u32(['#6a2a4a', '#3a3a7a', '#7a5a2a', '#2a5a6a'][Math.floor((ang + Math.PI) / (Math.PI / 2)) % 4]);
      pb.set(rx + x, ry + y, c4);
    }
    // janelas laterais em arco ogival
    lancet(naveX + 8, naveY + 26, 10, 36, true);
    lancet(naveX + naveW - 18, naveY + 26, 10, 36, true);
    // portal em ogiva com arquivoltas
    var dw = 26, dh = 46, dx0 = Math.round(cx - dw / 2), dy0 = H - dh - 8;
    for (var arc = 3; arc >= 0; arc--) {
      var aw = dw + arc * 4, ax0 = Math.round(cx - aw / 2), ay0 = dy0 - arc * 3;
      for (y = ay0; y < H - 8; y++) for (x = ax0; x < ax0 + aw; x++) {
        var top = ay0 + aw * 0.55;
        var dxx = Math.abs(x - (cx - 0.5));
        if (y < top && dxx > (aw / 2) * Math.sqrt(Math.max(0, (y - ay0) / (aw * 0.55)))) continue;
        pb.set(x, y, arc === 0 ? u32('#4a2a1a') : (arc % 2 ? ws : wd));
      }
    }
    for (y = dy0 + 16; y < H - 8; y++) { pb.set(Math.round(cx) - 1, y, u32('#2a160e')); pb.set(Math.round(cx), y, u32('#2a160e')); }
    for (y = dy0 + 18; y < H - 8; y += 6) for (x = dx0 + 2; x < dx0 + dw - 2; x++) if (x !== Math.round(cx) && x !== Math.round(cx) - 1) pb.set(x, y, u32('#3a2014'));
    // escadaria
    for (var s = 0; s < 4; s++) {
      for (y = 0; y < 2; y++) for (x = dx0 - 8 - s * 5; x < dx0 + dw + 8 + s * 5; x++) pb.set(x, H - 8 + s * 2 + y, y === 0 ? u32(P.stoneL) : u32(P.stone));
    }
    var cv = pb.toCanvas();
    cv.doorX = cx; cv.doorY = dy0 + dh / 2;
    return cv;
  };

  /* ---------- poste de madeira com luminária de sódio ---------- */
  ART.lampPost = function (h) {
    h = h || 118;
    var W = 34;
    var pb = new TC.PixBuf(W, h);
    var px = 8;
    for (var y = 4; y < h; y++) {
      pb.set(px, y, u32(P.poleD)); pb.set(px + 1, y, u32(P.pole)); pb.set(px + 2, y, u32('#5a4232'));
      if (y % 13 === 0) pb.set(px + 1, y, u32(P.poleD));
    }
    // travessa e isoladores
    for (var x = 0; x < 20; x++) { pb.set(x, 8, u32(P.pole)); pb.set(x, 9, u32(P.poleD)); }
    [1, 6, 15].forEach(function (ix) { pb.set(ix, 6, u32('#a0a8b0')); pb.set(ix, 7, u32('#707880')); });
    // braço curvo da luminária
    for (x = 0; x < 18; x++) {
      var yy = 20 - Math.round(Math.sqrt(x) * 1.2);
      pb.set(px + 3 + x, yy, u32('#2a2a30'));
    }
    var lx = px + 19, ly = 14;
    for (x = -4; x <= 5; x++) { pb.set(lx + x, ly, u32('#3a3a44')); pb.set(lx + x, ly + 1, u32('#2a2a30')); }
    for (x = -3; x <= 4; x++) pb.set(lx + x, ly + 2, u32(P.sodiumL));
    for (x = -2; x <= 3; x++) pb.set(lx + x, ly + 3, u32(P.sodium));
    var cv = pb.toCanvas();
    cv.lampX = lx + 0.5; cv.lampY = ly + 3; cv.poleX = px + 1; cv.wireY = 6;
    return cv;
  };

  /* poste apagado/quebrado */
  ART.lampPostOff = function (h) {
    var cv = ART.lampPost(h);
    var c = cv.ctx;
    c.fillStyle = TC.col('#4a4a50');
    c.fillRect(cv.lampX - 3, cv.lampY - 1, 8, 2);
    var o = TC.canvas(cv.width, cv.height);
    o.ctx.drawImage(cv, 0, 0);
    o.lampX = cv.lampX; o.lampY = cv.lampY; o.poleX = cv.poleX; o.wireY = cv.wireY;
    return o;
  };

  /* ---------- adereços ---------- */
  ART.bench = function () {
    return TC.sprite([
      '..kkkkkkkkkkkkkkkkkkkk..',
      '.kwwwwwwwwwwwwwwwwwwwwk.',
      '.kWWWWWWWWWWWWWWWWWWWWk.',
      '..kkkkkkkkkkkkkkkkkkkk..',
      '.kwwwwwwwwwwwwwwwwwwwwk.',
      'kwwwwwwwwwwwwwwwwwwwwwwk',
      'kWWWWWWWWWWWWWWWWWWWWWWk',
      '.kkikkkkkkkkkkkkkkkkikk.',
      '...i................i...',
      '..ii................ii..',
      '..i.................i...'
    ], { k: '#1a1010', w: '#6a4a30', W: '#4a3020', i: '#2a2a34' });
  };

  ART.fence = function (w) {
    w = w || 64;
    var h = 30;
    var pb = new TC.PixBuf(w, h);
    var c = u32(P.iron), cl = u32(P.ironL);
    for (var x = 0; x < w; x++) { pb.set(x, 8, c); pb.set(x, 22, c); pb.set(x, 9, cl); }
    for (x = 1; x < w; x += 5) {
      for (var y = 3; y < h; y++) pb.set(x, y, c);
      pb.set(x, 2, c); pb.set(x - 1, 3, c); pb.set(x + 1, 3, c); pb.set(x, 1, cl);
    }
    for (x = 0; x < w; x += 20) {
      for (y = 0; y < h; y++) { pb.set(x, y, c); pb.set(x + 1, y, c); pb.set(x + 2, y, cl); }
      pb.rect(x - 1, 0, 5, 2, c);
    }
    return pb.toCanvas();
  };

  ART.tomb = function (kind, seed) {
    var r = TC.RNG(seed || 1);
    var g = '#6a6676', gd = '#4a4656', gl = '#8e8a9a', moss = '#3a5a3a';
    var rows;
    if (kind === 0) {
      rows = [
        '...kkkkkk...',
        '..kllllllk..',
        '.kllggggggk.',
        '.klggggggdk.',
        '.klgg++ggdk.',
        '.klg++++gdk.',
        '.klgg++ggdk.',
        '.klgg++ggdk.',
        '.klggggggdk.',
        '.klggggggdk.',
        '.klmggggmdk.',
        '.kmmgggmmdk.',
        'kkkkkkkkkkkk'
      ];
    } else if (kind === 1) {
      rows = [
        '....kkk....',
        '....klk....',
        '....klk....',
        '.kkkklkkkk.',
        '.klllgggdk.',
        '.kkkkgkkkk.',
        '....klk....',
        '....kgk....',
        '....kgk....',
        '....kgk....',
        '...kmgmk...',
        '..kkkkkkk..'
      ];
    } else {
      rows = [
        '.kkkkkkkkkkkkk.',
        'kllllllllllllgk',
        'klgggggggggggdk',
        'klg---------gdk',
        'klgggggggggggdk',
        'klg-------ggddk',
        'klgggggggggggdk',
        'kmmgggggggmmddk',
        'kkkkkkkkkkkkkkk'
      ];
    }
    return TC.sprite(rows, { k: '#16141c', l: gl, g: g, d: gd, m: moss, '+': '#3a3644', '-': '#3a3644' });
  };

  ART.candle = function () {
    return [0, 1, 2].map(function (f) {
      return TC.sprite([
        f === 0 ? '..y..' : f === 1 ? '.y...' : '...y.',
        '.yoy.',
        '.yoy.',
        '..k..',
        '.www.',
        '.wwW.',
        '.wwW.',
        '.wwW.'
      ], { y: '#ffe080', o: '#ff9030', k: '#2a2020', w: '#e8e0d0', W: '#b0a898' });
    });
  };

  ART.crate = function () {
    return TC.sprite([
      'kkkkkkkkkkkkkkkk',
      'kllllllllllllllk',
      'klwwwwwwwwwwwwdk',
      'klwkwwwwwwwwkwdk',
      'klwwkwwwwwwkwwdk',
      'klwwwkwwwwkwwwdk',
      'klwwwwkwwkwwwwdk',
      'klwwwwwkkwwwwwdk',
      'klwwwwwkkwwwwwdk',
      'klwwwwkwwkwwwwdk',
      'klwwwkwwwwkwwwdk',
      'klwwkwwwwwwkwwdk',
      'klwkwwwwwwwwkwdk',
      'klwwwwwwwwwwwwdk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#1e140c', l: '#a07850', w: '#7a5a38', d: '#4a3420' });
  };

  ART.barrel = function () {
    return TC.sprite([
      '..kkkkkkkkkk..',
      '.kllwwwwwwwdk.',
      'kiiiiiiiiiiiik',
      'klwwwwwwwwwwdk',
      'klwwwwwwwwwwdk',
      'klwwwwwwwwwwdk',
      'kiiiiiiiiiiiik',
      'klwwwwwwwwwwdk',
      'klwwwwwwwwwwdk',
      'klwwwwwwwwwwdk',
      'kiiiiiiiiiiiik',
      'klwwwwwwwwwwdk',
      'klwwwwwwwwwwdk',
      'kiiiiiiiiiiiik',
      '.kdddddddddk..',
      '..kkkkkkkkkk..'
    ], { k: '#1a120c', l: '#9a7048', w: '#6a4a2c', d: '#3a2818', i: '#4a4a56' });
  };

  ART.signPost = function () {
    return TC.sprite([
      'kkkkkkkkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwwwwwwwk',
      'kwbbbbbbbbbbbbbbbbwk',
      'kwbwwwbbwwbwbbwwbbwk',
      'kwbbbbbbbbbbbbbbbbwk',
      'kwbwwbwwwbbwwbwbbbwk',
      'kwbbbbbbbbbbbbbbbbwk',
      'kwwwwwwwwwwwwwwwwwwk',
      'kkkkkkkkpkkpkkkkkkkk',
      '........p..p........',
      '........p..p........',
      '........p..p........',
      '........p..p........',
      '........p..p........',
      '........p..p........',
      '.......pp..pp.......'
    ], { k: '#1a1410', w: '#d8d0b8', b: '#2a4a6a', p: '#4a3428' });
  };

  ART.poster = function () {
    return TC.sprite([
      'kkkkkkkkkkkk',
      'kwwwwwwwwwwk',
      'kwrrrrrrrrwk',
      'kwwwwwwwwwwk',
      'kwbbwbbbwbwk',
      'kwwwwwwwwwwk',
      'kwbbbwbbwbwk',
      'kwwwwwwwwwwk',
      'kwwbbbbbwwwk',
      'kwwwwwwwww.k',
      'kwwwwwwww..k',
      'kkkkkkkk...k'
    ], { k: '#2a2420', w: '#d8ccb0', r: '#a03028', b: '#5a5048' });
  };

  /* coreto (quiosque da praça) */
  ART.coreto = function () {
    var W = 96, H = 96;
    var pb = new TC.PixBuf(W, H);
    var cx = W / 2, x, y;
    var wl = u32('#e0dcd0'), ws = u32('#9a96a0'), rf = u32('#5a2a2a'), rfd = u32('#3a1a1c'), rfl = u32('#7a3a34');
    for (y = 0; y < 30; y++) {
      var hw = 6 + y * 1.45;
      for (x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        var c = (Math.round(x - cx) % 8 === 0) ? rfd : (x < cx ? rf : rfl);
        if (y === 29 || y === 28) c = u32('#e8e0d0');
        pb.set(x, 8 + y, c);
      }
    }
    for (y = 0; y < 8; y++) { pb.set(Math.round(cx), y, u32('#c8b070')); }
    pb.set(Math.round(cx) - 1, 2, u32('#c8b070')); pb.set(Math.round(cx) + 1, 2, u32('#c8b070'));
    // lambrequim (renda de madeira)
    for (x = Math.round(cx - 48); x < cx + 48; x++) { if (x % 4 < 2) pb.set(x, 38, wl); if (x % 4 === 1) pb.set(x, 39, wl); }
    // colunas
    [-40, -20, 0, 20, 40].forEach(function (o) {
      for (y = 38; y < 80; y++) { pb.set(Math.round(cx + o), y, wl); pb.set(Math.round(cx + o) + 1, y, ws); }
    });
    // guarda-corpo
    for (x = Math.round(cx - 44); x < cx + 44; x++) { pb.set(x, 64, wl); pb.set(x, 65, ws); if (x % 4 === 0) for (y = 66; y < 80; y++) pb.set(x, y, wl); }
    // base
    for (y = 80; y < H; y++) for (x = Math.round(cx - 46); x < cx + 46; x++) pb.set(x, y, ((x + Math.floor(y / 4) * 3) % 8 === 0 || y % 4 === 0) ? u32(P.stoneD) : u32(P.stone));
    return pb.toCanvas();
  };

  /* fios elétricos entre postes */
  ART.drawWire = function (ctx, x0, y0, x1, y1, sag, col) {
    ctx.fillStyle = col || '#0c0c14';
    var n = Math.max(2, Math.abs(x1 - x0));
    var lastY = null;
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var x = Math.round(x0 + (x1 - x0) * t);
      var y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag);
      if (lastY != null && Math.abs(y - lastY) > 1) ctx.fillRect(x, Math.min(y, lastY), 1, Math.abs(y - lastY));
      else ctx.fillRect(x, y, 1, 1);
      lastY = y;
    }
  };

  /* ---------- neblina (faixa repetível) ---------- */
  ART.fog = function (w, h, seed, col) {
    var pb = new TC.PixBuf(w, h);
    var p = TC.parse(col || '#8a8ab0');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var n = TC.fbm2(x / 48, y / 16, seed || 3, 4, w / 48, 0);
        var vy = Math.sin((y / h) * Math.PI);
        var a = TC.clamp((n - 0.38) * 2.2, 0, 1) * vy;
        a = Math.round(a * 4) / 4;   // faixas de transparência
        if (a <= 0) continue;
        pb.d[y * w + x] = TC.u32rgb(p[0], p[1], p[2], Math.round(a * 150));
      }
    }
    return pb.toCanvas();
  };

  /* folha de outono caindo */
  ART.leaves = function () {
    if (ART._leaves) return ART._leaves;
    return (ART._leaves = ['#e0a040', '#c86a28', '#a03a20'].map(function (c) {
      return [TC.sprite(['.c.', 'cCc', '.c.'], { c: c, C: TC.shade(c, 0.7) }), TC.sprite(['cc', 'Cc'], { c: c, C: TC.shade(c, 0.7) })];
    }));
  };

  /* ---------- tiles 16x16 ---------- */
  ART.tiles = function () {
    var T = {};
    function tile(fn) {
      var pb = new TC.PixBuf(16, 16);
      for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
        var c = fn(x, y);
        if (c) pb.d[y * 16 + x] = u32(c);
      }
      return pb.toCanvas();
    }
    // calçada de pedra (topo) — vista em leve perspectiva
    T.walkTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        if (y === 0) return '#b8b0a4';
        if (y < 6) {
          var bx = (x + v * 8 + (y > 2 ? 4 : 0)) % 8;
          if (bx === 0) return '#6a645e';
          if (y === 3) return '#7a746e';
          return TC.hash2(x + v * 16, y, 4) > 0.8 ? '#a49c90' : '#928a80';
        }
        if (y === 6) return '#5a5450';
        if (y < 9) return '#c4beb4';    // meio-fio
        if (y === 9) return '#6a6460';
        var row = Math.floor((y - 10) / 3);
        var bx2 = (x + v * 8 + row * 5) % 9;
        if (bx2 === 0 || (y - 10) % 3 === 2) return '#26222a';
        return TC.hash2(x + v * 16, y, 8) > 0.7 ? '#46404a' : '#3a3540';
      });
    });
    // paralelepípedos (preenchimento)
    T.cobble = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var row = Math.floor(y / 4);
        var bx = (x + v * 8 + row * 4) % 8;
        if (bx === 0 || y % 4 === 3) return '#1c1a20';
        var n = TC.hash2(Math.floor((x + v * 8 + row * 4) / 8) + v * 3, row, 12);
        if (y % 4 === 0) return n > 0.5 ? '#4a4450' : '#444050';
        return n > 0.5 ? '#36323c' : '#2e2a34';
      });
    });
    // piso sextavado da praça (topo)
    T.hexTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        if (y === 0) return '#c09070';
        if (y < 7) {
          var xx = x + v * 16;
          var cell = (xx + (y % 2) * 4) % 8;
          if (cell === 0 || y === 3 || y === 6) return '#5a3a2c';
          return TC.hash2(Math.floor(xx / 8), y > 3 ? 1 : 0, 7) > 0.5 ? '#9a6a50' : '#8a5e48';
        }
        if (y === 7) return '#4a2e22';
        var rr = Math.floor((y - 8) / 4);
        var bb = (x + v * 8 + rr * 4) % 8;
        if (bb === 0 || (y - 8) % 4 === 3) return '#1e1416';
        return TC.hash2(x >> 3, rr, v + 20) > 0.5 ? '#3e2a28' : '#342224';
      });
    });
    // terra com grama (cemitério)
    T.grassTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var gh = 3 + Math.round(TC.hash2(x + v * 16, 1, 30) * 2);
        if (y < gh - 2) return TC.hash2(x + v * 16, y, 31) > 0.55 ? '#3a6040' : null;
        if (y < gh) return '#2a4a32';
        if (y === gh) return '#1e3626';
        var n = TC.hash2(x + v * 16, y, 33);
        return n > 0.85 ? '#5a4234' : n > 0.4 ? '#3a2a22' : '#30221c';
      });
    });
    T.dirt = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var n = TC.hash2(x + v * 16, y, 40);
        return n > 0.9 ? '#5a4234' : n > 0.45 ? '#33251e' : '#2a1e18';
      });
    });
    // tábuas de madeira (ponte / plataforma)
    T.plank = tile(function (x, y) {
      if (y === 0) return '#a07850';
      if (y === 1 || y === 2) return (x % 8 === 7) ? '#3a2818' : '#7a5a38';
      if (y === 3) return '#4a3420';
      if (y === 4) return '#2a1c10';
      if (y > 4 && (x === 3 || x === 12) && y < 12) return y % 3 ? '#3a2818' : '#2a1c10';
      return null;
    });
    // bloco de pedra (muros, escadas)
    T.stone = tile(function (x, y) {
      var row = Math.floor(y / 8);
      var bx = (x + row * 8) % 16;
      if (bx === 0 || y % 8 === 7) return '#2a2832';
      if (y % 8 === 0) return '#9a96a2';
      var n = TC.hash2(Math.floor((x + row * 8) / 16), row, 50);
      return n > 0.5 ? '#6e6a78' : '#625e6c';
    });
    T.stoneTop = tile(function (x, y) {
      if (y === 0) return '#c8c4cc';
      if (y === 1) return '#9a96a2';
      var row = Math.floor((y - 2) / 7);
      var bx = (x + row * 8) % 16;
      if (bx === 0 || (y - 2) % 7 === 6) return '#2a2832';
      return TC.hash2(x >> 4, row, 51) > 0.5 ? '#6e6a78' : '#625e6c';
    });
    // água do arroio
    T.water = [0, 1, 2, 3].map(function (f) {
      return tile(function (x, y) {
        if (y < 3) return null;
        if (y === 3) return ((x + f * 2) % 8 < 3) ? '#8aa0c8' : '#3a4a78';
        var n = Math.sin((x + f * 4) * 0.8 + y * 1.3);
        return n > 0.85 ? '#4a5a8a' : y > 10 ? '#121830' : '#1a2448';
      });
    });
    return T;
  };
})();
