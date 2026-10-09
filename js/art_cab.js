'use strict';
/* Teewald City — arte da cutscene da estrada: cabine do caminhão, volante, placas, caminhão visto de longe */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;

  /* ---------- cabine (sobreposição estática, para-brisa transparente) ---------- */
  ART.cabOverlay = function () {
    var W = TC.W, H = TC.H;
    var cv = TC.canvas(W, H), c = cv.ctx;
    // teto
    c.fillStyle = TC.col('#0c0a10');
    c.fillRect(0, 0, W, 13);
    c.fillStyle = TC.col('#1e1a24');
    c.fillRect(0, 12, W, 2);
    // quebra-sóis
    [[18, 92], [164, 238]].forEach(function (v) {
      c.fillStyle = TC.col('#241c20');
      TC.fillPoly(c, [[v[0], 12], [v[1], 12], [v[1] - 4, 26], [v[0] + 4, 26]]);
      c.fillStyle = TC.col('#3a2e32');
      c.fillRect(v[0] + 3, 13, v[1] - v[0] - 6, 1);
      c.fillStyle = TC.col('#16121a');
      for (var x = v[0] + 8; x < v[1] - 8; x += 4) c.fillRect(x, 23, 2, 1);
    });
    // colunas (A-pillars)
    c.fillStyle = TC.col('#0e0c12');
    TC.fillPoly(c, [[0, 0], [20, 0], [34, 150], [0, 150]]);
    TC.fillPoly(c, [[W, 0], [W - 20, 0], [W - 34, 150], [W, 150]]);
    c.fillStyle = TC.col('#24202a');
    for (var y = 14; y < 148; y++) {
      c.fillRect(Math.round(20 + (y / 150) * 14), y, 1, 1);
      c.fillRect(Math.round(W - 21 - (y / 150) * 14), y, 1, 1);
    }
    // retrovisor
    c.fillStyle = TC.col('#16141a');
    c.fillRect(126, 12, 4, 6);
    c.fillStyle = TC.col('#0a090e');
    c.fillRect(102, 17, 52, 12);
    c.fillStyle = TC.col('#1c2038');
    c.fillRect(104, 19, 48, 8);
    c.fillStyle = TC.col('#2c3256');
    c.fillRect(104, 19, 48, 2);
    c.fillStyle = TC.col('#3c4470');
    c.fillRect(110, 21, 10, 1);
    // painel
    var dashTop = function (x) { return 142 + Math.round(Math.pow((x - 128) / 128, 2) * -6); };
    for (var x = 0; x < W; x++) {
      var t = dashTop(x);
      c.fillStyle = TC.col('#3e3438');
      c.fillRect(x, t, 1, 1);
      c.fillStyle = TC.col('#2a2226');
      c.fillRect(x, t + 1, 1, 3);
      c.fillStyle = TC.col('#1a1418');
      c.fillRect(x, t + 4, 1, H - t - 4);
    }
    // textura do painel
    var r = TC.RNG(5);
    for (var i = 0; i < 500; i++) {
      var px = r.int(0, W - 1), py = r.int(148, H - 1);
      c.fillStyle = TC.col(r() < 0.5 ? '#221a1e' : '#140f12');
      c.fillRect(px, py, 1, 1);
    }
    // capô do painel de instrumentos
    c.fillStyle = TC.col('#120e10');
    TC.fillEllipse(c, 128, 160, 44, 14);
    c.fillStyle = TC.col('#0a0809');
    TC.fillEllipse(c, 128, 166, 40, 11);
    // mostradores
    [[108, 167], [148, 167]].forEach(function (g, gi) {
      c.fillStyle = TC.col('#2a2428');
      TC.fillCircle(c, g[0], g[1], 12);
      c.fillStyle = TC.col('#060506');
      TC.fillCircle(c, g[0], g[1], 10);
      c.fillStyle = TC.col('#c08030');
      for (var k = 0; k <= 8; k++) {
        var a = Math.PI * 0.75 + k * (Math.PI * 1.5 / 8);
        c.fillRect(Math.round(g[0] + Math.cos(a) * 8), Math.round(g[1] + Math.sin(a) * 8), 1, 1);
      }
    });
    // luzes de aviso
    [[124, 176, '#204020'], [128, 176, '#402010'], [132, 176, '#202040']].forEach(function (l) { c.fillStyle = TC.col(l[2]); c.fillRect(l[0], l[1], 2, 2); });
    // rádio
    c.fillStyle = TC.col('#0a0a0c');
    c.fillRect(184, 158, 46, 16);
    c.fillStyle = TC.col('#2a2a30');
    c.fillRect(184, 158, 46, 1);
    c.fillStyle = TC.col('#062010');
    c.fillRect(192, 162, 24, 7);
    c.fillStyle = TC.col('#3a3a44');
    TC.fillCircle(c, 188, 166, 2); TC.fillCircle(c, 224, 166, 2);
    // foto no painel (pai e filho com o caminhão)
    c.fillStyle = TC.col('#d8d0b8');
    c.fillRect(36, 146, 16, 12);
    c.fillStyle = TC.col('#8a7458');
    c.fillRect(37, 147, 14, 10);
    c.fillStyle = TC.col('#5a4a3a');
    c.fillRect(39, 150, 3, 6); c.fillRect(44, 152, 2, 4);
    c.fillStyle = TC.col('#3a2e24');
    c.fillRect(46, 153, 5, 3);
    c.fillStyle = TC.col('#b0a080');
    c.fillRect(40, 149, 1, 1);
    // saídas de ar
    [[60, 150], [196, 150]].forEach(function (v) {
      c.fillStyle = TC.col('#0a0809');
      c.fillRect(v[0], v[1], 18, 6);
      c.fillStyle = TC.col('#2a2226');
      for (var q = 0; q < 6; q += 2) c.fillRect(v[0] + 1, v[1] + q, 16, 1);
    });
    return cv;
  };

  /* volante (gira com o efeito de rotação), mãos incluídas */
  ART.wheel = function () {
    var S = 160, cx = 80, cy = 80;
    var pb = new TC.PixBuf(S, S);
    var rim = u32('#1c1818'), rimL = u32('#3e3434'), rimD = u32('#0c0a0a');
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var dx = x - cx + 0.5, dy = y - cy + 0.5;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d >= 63 && d <= 70) {
        var a = Math.atan2(dy, dx);
        var c = rim;
        if (d < 64.5) c = rimD;
        else if (d > 68.5) c = rimD;
        else if (Math.sin(a) < -0.3 && d > 65 && d < 67.5) c = rimL;
        if (Math.floor((a + Math.PI) * 30) % 3 === 0 && d > 64.5 && d < 68.5) c = c === rimL ? rim : c;
        pb.set(x, y, c);
      }
    }
    // raios
    function spoke(ang, w) {
      for (var t = 12; t < 64; t++) {
        for (var k = -w; k <= w; k++) {
          var px = cx + Math.cos(ang) * t - Math.sin(ang) * k;
          var py = cy + Math.sin(ang) * t + Math.cos(ang) * k;
          pb.set(Math.round(px), Math.round(py), Math.abs(k) === w ? rimD : (k < 0 ? rimL : rim));
        }
      }
    }
    spoke(Math.PI, 3); spoke(0, 3); spoke(Math.PI / 2, 4);
    // cubo
    for (y = -15; y <= 15; y++) for (x = -15; x <= 15; x++) {
      var dd = x * x + y * y;
      if (dd <= 225) pb.set(cx + x, cy + y, dd > 180 ? rimD : (y < -4 ? u32('#2e2626') : u32('#221c1c')));
    }
    for (y = -3; y <= 3; y++) for (x = -3; x <= 3; x++) if (x * x + y * y <= 9) pb.set(cx + x, cy + y - 2, u32('#8a8a96'));
    // mãos às 10 e 2 horas
    [-150, -30].forEach(function (deg) {
      var a = deg * Math.PI / 180;
      var hx = cx + Math.cos(a) * 66, hy = cy + Math.sin(a) * 66;
      for (var yy = -5; yy <= 5; yy++) for (var xx = -6; xx <= 6; xx++) {
        var e = (xx * xx) / 36 + (yy * yy) / 25;
        if (e > 1) continue;
        var col = yy < -1 ? '#e8aa76' : yy < 2 ? '#c88a5a' : '#9a5e3a';
        if ((xx + 6) % 3 === 0 && yy < 0) col = '#b07048';
        pb.set(Math.round(hx + xx), Math.round(hy + yy), u32(col));
      }
    });
    var cv = pb.toCanvas();
    cv.cx = cx; cv.cy = cy;
    return cv;
  };

  /* braços (mangas xadrez) até as mãos no volante */
  ART.drawArms = function (ctx, wcx, wcy, ang) {
    var plaidA = '#b03428', plaidB = '#6a1e20';
    [[-150, 36, 250], [-30, 220, 250]].forEach(function (h) {
      var a = h[0] * Math.PI / 180 + ang;
      var hx = wcx + Math.cos(a) * 66, hy = wcy + Math.sin(a) * 66;
      var sx = h[1], sy = h[2];
      var dx = hx - sx, dy = hy - sy;
      var n = Math.ceil(Math.sqrt(dx * dx + dy * dy));
      for (var i = 0; i < n - 4; i++) {
        var t = i / n;
        var x = sx + dx * t, y = sy + dy * t;
        var w = 9 - t * 2.5;
        ctx.fillStyle = TC.col((Math.floor(i / 3) % 2) ? plaidA : plaidB);
        TC.fillCircle(ctx, x, y, w);
      }
      // punho da camisa
      ctx.fillStyle = TC.col('#3a1418');
      TC.fillCircle(ctx, sx + dx * ((n - 5) / n), sy + dy * ((n - 5) / n), 6);
    });
  };

  /* terço pendurado no retrovisor */
  ART.drawRosary = function (ctx, x, y, ang) {
    for (var i = 1; i <= 9; i++) {
      var bx = x + Math.sin(ang) * i * 3.2, by = y + Math.cos(ang) * i * 3.2;
      ctx.fillStyle = TC.col(i % 3 === 0 ? '#c0a070' : '#7a5a3a');
      ctx.fillRect(Math.round(bx), Math.round(by), 2, 2);
    }
    var cx = x + Math.sin(ang) * 33, cy = y + Math.cos(ang) * 33;
    ctx.fillStyle = TC.col('#d0d0d8');
    ctx.fillRect(Math.round(cx), Math.round(cy), 2, 7);
    ctx.fillRect(Math.round(cx) - 2, Math.round(cy) + 2, 6, 2);
  };

  /* ponteiro de mostrador */
  ART.drawNeedle = function (ctx, cx, cy, v) {
    var a = Math.PI * 0.75 + TC.clamp(v, 0, 1) * Math.PI * 1.5;
    ctx.fillStyle = TC.col('#ff4020');
    for (var t = 0; t < 8; t++) ctx.fillRect(Math.round(cx + Math.cos(a) * t), Math.round(cy + Math.sin(a) * t), 1, 1);
    ctx.fillStyle = TC.col('#e0e0e0');
    ctx.fillRect(cx, cy, 1, 1);
  };

  /* ---------- placas de estrada ---------- */
  function signCanvas(w, h, bg, border, lines, fg, postH) {
    var cv = TC.canvas(w, h + (postH || 0));
    var c = cv.ctx;
    if (postH) {
      c.fillStyle = TC.col('#7a7a80');
      c.fillRect(Math.floor(w / 2) - 2, h - 2, 4, postH + 2);
      c.fillStyle = TC.col('#4a4a50');
      c.fillRect(Math.floor(w / 2) + 1, h - 2, 1, postH + 2);
    }
    c.fillStyle = TC.col(border);
    c.fillRect(0, 0, w, h);
    c.fillStyle = TC.col(bg);
    c.fillRect(2, 2, w - 4, h - 4);
    lines.forEach(function (l, i) {
      TC.font.draw(c, l, Math.floor(w / 2), 5 + i * 11, fg, { align: 'center' });
    });
    return cv;
  }
  ART.roadSigns = function () {
    var S = {};
    S.city = signCanvas(76, 28, '#1e6a3a', '#e8e8e0', ['TEEWALD CITY', '12 km'], '#f0f0f0', 26);
    S.city2 = signCanvas(76, 28, '#1e6a3a', '#e8e8e0', ['TEEWALD CITY', '3 km'], '#f0f0f0', 26);
    S.brake = signCanvas(84, 28, '#f0f0e8', '#1a1a1a', ['USE FREIO', 'MOTOR'], '#1a1a1a', 26);
    // losango amarelo de declive
    var d = TC.canvas(34, 34 + 26), c = d.ctx;
    c.fillStyle = TC.col('#7a7a80'); c.fillRect(15, 30, 4, 30);
    c.fillStyle = TC.col('#1a1a1a'); TC.fillPoly(c, [[17, 0], [34, 17], [17, 34], [0, 17]]);
    c.fillStyle = TC.col('#e8c020'); TC.fillPoly(c, [[17, 2], [32, 17], [17, 32], [2, 17]]);
    c.fillStyle = TC.col('#1a1a1a');
    TC.fillPoly(c, [[8, 21], [26, 12], [26, 23], [8, 23]]);
    c.fillStyle = TC.col('#e8c020'); c.fillRect(14, 15, 6, 3);
    c.fillStyle = TC.col('#1a1a1a'); c.fillRect(12, 13, 9, 4);
    S.slope = d;
    // marco quilométrico
    var k = TC.canvas(12, 20); c = k.ctx;
    c.fillStyle = TC.col('#e8e8e0'); c.fillRect(0, 0, 12, 20);
    c.fillStyle = TC.col('#2a2a2a'); c.fillRect(0, 0, 12, 3);
    TC.font.draw(c, '47', 2, 6, '#1a1a1a');
    S.km = k;
    // delineador de curva (preto e amarelo)
    var ch = TC.canvas(20, 30); c = ch.ctx;
    c.fillStyle = TC.col('#7a7a80'); c.fillRect(9, 14, 2, 16);
    c.fillStyle = TC.col('#e8c020'); c.fillRect(0, 0, 20, 14);
    c.fillStyle = TC.col('#1a1a1a');
    for (var i = 0; i < 3; i++) TC.fillPoly(c, [[3 + i * 6, 2], [7 + i * 6, 7], [3 + i * 6, 12], [5 + i * 6, 12], [9 + i * 6, 7], [5 + i * 6, 2]]);
    S.chevronR = ch;
    S.chevronL = TC.flip(ch);
    // poste de madeira com luz
    S.pole = ART.lampPost(110);
    return S;
  };

  /* ---------- caminhão "bicudo" visto de lado (pequeno) ---------- */
  ART.truckSmall = function () {
    return TC.sprite([
      '...................................',
      '....wwwwwwwwwwwwwwwwwww............',
      '...wWWWWWWWWWWWWWWWWWWw..kkkkk.....',
      '...wWbWbWbWbWbWbWbWbWWw.krrrrrk....',
      '...wWWWWWWWWWWWWWWWWWWw.krggrrk....',
      '...wWbWbWbWbWbWbWbWbWWw.krggrrrkkk.',
      '...wWWWWWWWWWWWWWWWWWWwkrrrrrrrrrrk',
      '..kkkkkkkkkkkkkkkkkkkkkkrrrrrrrrRRy',
      '..kgggkkkkkkkgggkkkkkkkkkkgggkkkkk.',
      '...ggg.......ggg..........ggg......'
    ], { w: '#6a5038', W: '#8a6a48', b: '#4a3828', k: '#141016', r: '#a03028', R: '#701e1a', g: '#2a2a30', y: '#ffe090' });
  };

  /* ---------- rosto que aparece de relance (subliminar) ---------- */
  ART.flashFace = function () {
    var f = ART.flameHead.open;
    return TC.scaleCanvas(f, 9);
  };
})();
