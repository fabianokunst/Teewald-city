'use strict';
/* Teewald City — Fase 3: "O Baile Debaixo da Terra"
   Das raízes do Pinheiro Velho, pela Mina Santa Bárbara (fechada desde o desabamento de 1931), o elevador de carga,
   a gruta do Rio Escuro, até o salão do baile onde todos os que sumiram ainda dançam — e o Moço do Baile toca a última música. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;

  TC.buildLevel3 = function () {
    var A = TC.ART, C2 = A.ch2Init(), C3 = A.ch3Init();
    var W = 300, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 3, music: 'stage3', cardNum: 'stage3.num', cardName: 'stage3.name', comboY: 38,
      playerLight: { r: 66, col: '#c8a070', a: 0.85 }
    };
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    var x, i;
    var ZONE = { roots: 0, mine: 40, lift: 97, cave: 114, ball: 182, boss: 262 };
    L.ZONE = ZONE;

    /* ---------- chão e estilos ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) {
      L.style[x] = x < ZONE.mine ? 'roots' : x < ZONE.lift ? 'mine' : x < ZONE.cave ? 'lift' : x < ZONE.ball ? 'cave' : 'ballroom';
    }
    // pontes de raiz
    fill(13, 18, 9, 9, 2);
    fill(30, 34, 8, 8, 2);
    // andaimes da mina
    fill(60, 63, 9, 9, 2);
    fill(65, 67, 7, 7, 2);
    fill(86, 89, 10, 10, 2);
    // o Rio Escuro (duas travessias)
    fill(140, 151, 13, 13, 4); fill(140, 151, 12, 12, 0);
    [142, 145, 148, 151].forEach(function (sx) { set(sx, 12, 3); });   // pedras com vão de 2 blocos
    fill(139, 139, 12, 13, 3); fill(152, 152, 12, 13, 3);
    fill(166, 172, 13, 13, 4); fill(166, 172, 12, 12, 0);
    fill(165, 173, 10, 10, 2);     // arco de pedra por cima
    fill(165, 165, 12, 13, 3); fill(173, 173, 12, 13, 3);
    // ressaltos de pedra
    fill(157, 159, 11, 11, 3);
    // palco da bandinha no salão
    fill(194, 201, 10, 10, 2);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1931);
    function back(cv, px, py, z, extra) {
      var o = { cv: cv, x: Math.round(px), y: Math.round(py), z: z || 0 };
      if (extra) for (var k in extra) o[k] = extra[k];
      L.back.push(o);
      return o;
    }
    function sign(tx, key, cv, y) {
      if (cv) back(cv, tx * TS - Math.round(cv.width / 2), y != null ? y : GY + 2 - cv.height, 2);
      L.signs.push({ x: tx * TS, y: GY, key: key });
    }
    function glow(o, dx, dy, rr, col, a, flicker) {
      (o.lights = o.lights || []).push({ dx: dx, dy: dy, r: rr, col: col, a: a, flicker: flicker });
      (o.glows = o.glows || []).push({ dx: dx, dy: dy, r: Math.max(3, rr / 8), col: col, a: 0.5, flicker: flicker });
    }

    // --- a escada que desce do toco ---
    var stairs = C3.stairs();
    back(stairs, -46, GY + 2 - stairs.height, 0);
    sign(7, 'sign3.board', C2.sign(76, 30, [['QUEM DESCE PRO', '#e8d8b0'], ['BAILE NÃO SOBE', '#e8d8b0'], ['ANTES DA ÚLTIMA', '#e8c070']], { legs: 10, bg: '#3a2a1c' }));

    // --- as raízes do Pinheiro Velho ---
    for (x = 3 * TS; x < ZONE.mine * TS; x += 256) back(C3.rootWall(256, x), x, 40, -2);
    [[13, 18, 9], [30, 34, 8]].forEach(function (b) {
      var cv = C3.rootBridge((b[1] - b[0] + 1) * TS);
      back(cv, b[0] * TS - 10, b[2] * TS - 8, 1);
    });
    for (x = 4; x < ZONE.mine; x += r.int(3, 6)) {
      var m = back(C3.mushroom(x), x * TS, GY + 1 - 12, 2);
      glow(m, 7, 4, 22, r() < 0.5 ? '#40e0c0' : '#6090ff', 0.6, false);
    }

    // --- a Mina Santa Bárbara ---
    for (x = ZONE.mine * TS; x < ZONE.lift * TS; x += 256) back(C3.mineWall(Math.min(256, ZONE.lift * TS - x), x), x, 32, -2);
    var mineSign = C2.sign(120, 30, [['MINA SANTA BÁRBARA', '#f0e0b0'], ['CIA. CARBONÍFERA', '#d8c890'], ['DE TEEWALD - 1904', '#d8c890']], { bg: '#2a2a30', trim: '#6a6a76' });
    sign(42, 'sign3.mine', mineSign, 60);
    for (x = ZONE.mine * TS + 24; x < ZONE.lift * TS - 40; x += 112) {
      var pr = C3.prop(GY - 40);
      var po = back(pr, x, 40, 1);
      var broken = (x / 112 | 0) % 3 === 2;
      po.lights = [{ dx: pr.lampX, dy: pr.lampY, r: 54, col: '#ffd890', a: 0.95, flicker: broken }];
      po.glows = [{ dx: pr.lampX, dy: pr.lampY, r: 6, col: '#fff0c0', a: 0.8, flicker: broken }];
    }
    [50, 71, 92].forEach(function (tx) { back(C3.cartImg, tx * TS, GY + 1 - C3.cartImg.height, 2); });
    sign(48, 'sign3.grisu', C2.sign(70, 22, [['PERIGO: GRISU', '#ffd040'], ['NADA DE FOGO', '#f0e0b0']], { legs: 14, bg: '#5a1a14', trim: '#a04030' }));
    sign(69, 'sign3.barbara', null);
    (function () {
      // nicho de Santa Bárbara cavado na parede, com velas
      var cv = TC.canvas(36, 46), c = cv.ctx;
      c.fillStyle = TC.col('#14100e'); TC.fillPoly(c, [[2, 46], [2, 14], [18, 2], [34, 14], [34, 46]]);
      c.fillStyle = TC.col('#e8e0d0'); c.fillRect(15, 12, 6, 20); TC.fillCircle(c, 18, 10, 3);
      c.fillStyle = TC.col('#a02828'); c.fillRect(14, 18, 8, 14);
      c.fillStyle = TC.col('#c8b070'); c.fillRect(17, 4, 2, 3);
      c.fillStyle = TC.col('#e8e0d0'); c.fillRect(8, 36, 2, 6); c.fillRect(26, 36, 2, 6);
      c.fillStyle = TC.col('#ffe080'); c.fillRect(8, 34, 2, 2); c.fillRect(26, 34, 2, 2);
      var o = back(cv, 69 * TS - 18, 96, 1);
      glow(o, 18, 32, 30, '#ffc070', 0.8, true);
      o.candle = false;
    })();
    sign(95, 'sign3.lift', null);

    // --- o elevador de carga ---
    L._lift = back(C3.liftFrame(), ZONE.lift * TS, 0, 1);
    L._lift.lights = [{ dx: 128, dy: 60, r: 80, col: '#c8c0b0', a: 0.5 }];

    // --- a gruta do Rio Escuro ---
    for (x = ZONE.cave * TS; x < ZONE.ball * TS; x += 192) back(C3.stalactites(192, x), x, 0, 2);
    for (x = ZONE.cave + 2; x < ZONE.ball; x += r.int(4, 8)) {
      if ((x >= 139 && x <= 152) || (x >= 165 && x <= 173)) continue;
      var sg = C3.stalagmite(r.int(16, 44), x);
      back(sg, x * TS - sg.baseX, GY + 2 - sg.height, 0);
    }
    [122, 136, 156, 176].forEach(function (tx, k) {
      var cr = back(C3.crystal(tx), tx * TS, GY + 1 - 22, 2);
      glow(cr, 10, 8, 34, '#b070ff', 0.8, false);
    });
    [[139, 13], [165, 8]].forEach(function (b) {
      var cv = TC.canvas(b[1] * TS + 32, 40), c = cv.ctx;
      for (var y = 0; y < 40; y++) { c.fillStyle = TC.mix('#0a0e18', '#04060a', y / 40); c.fillRect(0, y, cv.width, 1); }
      back(cv, b[0] * TS - 16, GY - 14, -1);
    });
    sign(137, 'sign3.river', null);

    // --- o salão do baile ---
    (function () {
      var w = (W - ZONE.ball) * TS, cv = TC.canvas(w, 150), c = cv.ctx, rr = TC.RNG(77);
      for (var y = 0; y < 150; y++) { c.fillStyle = TC.mix('#1e1612', '#120c0a', y / 150); c.fillRect(0, y, w, 1); }
      for (var k = 0; k < w / 3; k++) { c.fillStyle = TC.col(rr() < 0.5 ? '#2a201a' : '#0e0a08'); c.fillRect(rr.int(0, w), rr.int(0, 110), rr.int(1, 3), 1); }
      // lambri de madeira escura embaixo
      for (var xx = 0; xx < w; xx++) {
        c.fillStyle = TC.col(xx % 24 === 0 ? '#1a0e08' : (xx % 24 < 2 ? '#5a3a20' : '#3a2414'));
        c.fillRect(xx, 112, 1, 38);
      }
      c.fillStyle = TC.col('#6a4a2a'); c.fillRect(0, 110, w, 3);
      var o = back(cv, ZONE.ball * TS, GY + 2 - 150, -2);
      L._hall = o;
    })();
    // faixas de todos os anos em que alguém sumiu
    [['KERB 1852', 186], ['FESTA 1898', 205], ['BAILE 1931', 228], ['FESTA 1977', 250], ['FESTA DA BATATA 1997', 270]].forEach(function (b, k) {
      back(C3.banner(b[0], k === 3 ? '#f0d8b0' : '#e8dcc0'), b[1] * TS, 60 + (k % 2) * 10, 1);
    });
    sign(188, 'sign3.ballroom', C2.sign(110, 30, [['BAILE DE KERB', '#f0e0b0'], ['ENTRADA FRANCA', '#e8c070'], ['BANDINHA DO ERWIN', '#e8c070']], { legs: 8, bg: '#4a1a1a', trim: '#a04040' }));
    // cordões de lanterninhas de papel (balões) de ponta a ponta
    for (x = ZONE.ball * TS; x < W * TS - 64; x += 96) {
      var lc = TC.canvas(96, 30), lctx = lc.ctx, lo = back(lc, x, 40, 2);
      lo.lights = []; lo.glows = [];
      A.drawWire(lctx, 0, 4, 96, 4, 14, '#2a2020');
      for (var q = 1; q < 6; q++) {
        var qx = q * 16, qy = Math.round(4 + Math.sin(q / 6 * Math.PI) * 14) + 2;
        var col = C3.lanternColors[(q + x / 96) % C3.lanternColors.length | 0];
        lctx.fillStyle = TC.col(col); TC.fillEllipse(lctx, qx, qy + 3, 3, 4);
        lctx.fillStyle = TC.col('#1a1010'); lctx.fillRect(qx - 1, qy - 1, 3, 1);
        lo.lights.push({ dx: qx, dy: qy + 3, r: 26, col: col, a: 0.55, flicker: false });
        lo.glows.push({ dx: qx, dy: qy + 3, r: 4, col: col, a: 0.7, flicker: false });
      }
    }
    [189, 208, 234, 255].forEach(function (tx, k) { back(C3.feastTable(tx), tx * TS, GY + 1 - 30, 2); });
    (function () {
      var cv = TC.canvas(40, 32), c = cv.ctx, b = A.barrel_ || A.barrel();
      c.drawImage(b, 0, 16); c.drawImage(b, 14, 16); c.drawImage(b, 7, 0);
      back(cv, 216 * TS, GY + 1 - 32, 2);
      back(cv, 260 * TS, GY + 1 - 32, 2);
    })();
    back(A.poster(), 212 * TS, 146, 2);
    L.signs.push({ x: 212 * TS + 6, y: GY, key: 'sign3.queen' });
    L._bandX = 198 * TS; L._bandY = 160;
    // o lustre de raízes sobre a pista
    (function () {
      var cv = C3.chandelier(), o = back(cv, 282 * TS + 128 - 60, 0, 2);
      o.lights = cv.candles.map(function (c) { return { dx: c.x, dy: c.y, r: 46, col: '#ffc070', a: 0.7, flicker: true }; });
      o.glows = cv.candles.map(function (c) { return { dx: c.x, dy: c.y, r: 4, col: '#ffe0a0', a: 0.8, flicker: true }; });
      o.candle = false;
    })();

    /* ---------- primeiro plano ---------- */
    var rock = TC.sprite([
      '.....kkk........',
      '...kkkkkkk..kk..',
      '..kkkkkkkkkkkkk.',
      '.kkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#050304' });
    var root = TC.canvas(10, 70); root.ctx.fillStyle = '#050304';
    for (i = 0; i < 70; i++) root.ctx.fillRect(Math.round(4 + Math.sin(i * 0.12) * 3), i, Math.max(1, 4 - i / 20), 1);
    for (x = 140; x < L.pxW; x += r.int(160, 300)) L.front.push({ cv: r() < 0.6 ? rock : root, x: x, y: r() < 0.6 ? 219 : 0 });

    /* ---------- itens e quebráveis ---------- */
    [[10, 'crate', 'balas'], [26, 'barrel', 'cuca'], [45, 'cart', 'balas'], [57, 'cart', 'linguica'], [74, 'cart', 'balas'], [83, 'barrel', 'chimarrao'],
      [94, 'cart', 'cuca'], [120, 'crate', 'balas'], [133, 'barrel', 'linguica'], [155, 'crate', 'chimarrao'], [178, 'crate', 'balas'],
      [186, 'barrel', 'cuca'], [202, 'barrel', 'chimarrao'], [221, 'crate', 'balas'], [240, 'barrel', 'linguica'], [258, 'crate', 'cuca'], [277, 'barrel', 'chimarrao']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[15, 9], [16, 9], [31, 8], [32, 8], [61, 9], [62, 9], [87, 10], [88, 10], [145, 12], [148, 12], [168, 10], [170, 10], [196, 10], [199, 10]].forEach(function (p) {
      L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 66 * TS + 8, y: 7 * TS - 6 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('bat', 12, 44); sp('ghost', 36, 150);
    sp('bat', 47, 40); sp('miner', 65, GY); sp('bat', 90, 44);
    sp('bat', 136, 40); sp('bat', 145, 36); sp('ghost', 149, GY, { rise: true });
    sp('bat', 162, 40); sp('dancer', 178, GY);
    sp('dancer', 222, GY); sp('possesso', 238, GY, { kind: 'colona' });
    sp('dancer', 270, GY); sp('bat', 274, 40);

    /* ---------- arenas ---------- */
    function bat(side, y) { return { t: 'bat', side: side, y: y || 60, opt: { fly: side === 'l' ? 1 : -1 } }; }
    function mi(side) { return { t: 'miner', side: side, y: GY }; }
    function drop(at) { return { t: 'miner', drop: at }; }
    function dn(side) { return { t: 'dancer', side: side, y: GY }; }
    function pc(side, kind) { return { t: 'possesso', side: side, y: GY, opt: { kind: kind || (side === 'l' ? 'colona' : 'colono') } }; }
    function g(side, y) { return { t: 'ghost', side: side, y: y || 140 }; }
    function gr(at) { return { t: 'ghost', rise: at }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function s(side) { return { t: 'shade', side: side }; }
    L.arenas = [
      { x0: 20 * TS, waves: [[bat('r'), bat('l')], [s('r'), gr(70), gr(190)], [bat('r'), s('l'), g('r')]] },
      { x0: 52 * TS, waves: [[mi('r')], [mi('l'), mi('r')], [mi('r'), f('l'), bat('r')]] },
      { x0: 76 * TS, waves: [[mi('l'), f('r')], [mi('r'), mi('l'), bat('l')], [s('r'), mi('l'), f('r')]] },
      { x0: ZONE.lift * TS, lift: true, waves: [[bat('l', 50), bat('r', 70), bat('r', 40)], [drop(60), drop(190)], [bat('l'), drop(128), f('r'), bat('r', 40)]] },
      { x0: 118 * TS, waves: [[gr(80), gr(170), bat('r')], [s('l'), s('r')], [gr(60), gr(200), bat('l'), f('r')]] },
      { x0: 153 * TS, waves: [[dn('r')], [dn('l'), g('r')], [dn('r'), s('l'), bat('r')]] },
      { x0: 189 * TS, waves: [[pc('l'), pc('r')], [dn('l'), dn('r')], [dn('r'), pc('l', 'colona'), g('r')]] },
      { x0: 210 * TS, waves: [[dn('l'), dn('r')], [pc('l'), pc('r'), dn('r')], [dn('l'), dn('r'), s('r'), f('l')]] },
      { x0: 244 * TS, waves: [[dn('r'), pc('l'), g('r')], [dn('l'), dn('r'), bat('r')], [pc('l', 'colona'), pc('r'), dn('l'), f('r')]] },
      { x0: 282 * TS, boss: true, waves: [] }
    ];
    L.liftArena = L.arenas[3];
    L.fatherArena = L.arenas[7];
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 20 * TS + 30 }, { x: 44 * TS + 8, shrine: true }, { x: 52 * TS + 30 }, { x: 76 * TS + 30 },
      { x: 94 * TS + 8, shrine: true }, { x: ZONE.lift * TS + 30 }, { x: 118 * TS + 30 }, { x: 152 * TS + 8, shrine: true },
      { x: 153 * TS + 30 }, { x: 184 * TS + 8, shrine: true }, { x: 189 * TS + 30 }, { x: 210 * TS + 30 }, { x: 244 * TS + 30 },
      { x: 279 * TS + 8, shrine: true }, { x: 282 * TS + 30 }
    ];
    var acp = [1, 3, 4, 6, 7, 9, 11, 12, 13, 15];
    L.arenas.forEach(function (a, k) { a.cp = acp[k]; });
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });

    /* falas ao passar */
    L.barks = [
      { x: 6 * TS, key: 'b3.lamp' },
      { x: 30 * TS, key: 'b3.roots' },
      { x: 43 * TS, key: 'b3.mine' },
      { x: 69 * TS, key: 'b3.barbara' },
      { x: 95 * TS, key: 'b3.lift' },
      { x: 136 * TS, key: 'b3.cave' },
      { x: 185 * TS, key: 'b3.ballroom', face: 'shock' },
      { x: 266 * TS, key: 'b3.stage' }
    ];

    /* zonas: luz ambiente e neblina (poeira) */
    L.zones = [
      { x: 0, ambient: '#3a3440', fog: 0.3 },
      { x: ZONE.mine * TS, ambient: '#3a3536', fog: 0.25 },
      { x: ZONE.lift * TS, ambient: '#3a3844', fog: 0.15 },
      { x: ZONE.cave * TS, ambient: '#323e5c', fog: 0.35 },
      { x: ZONE.ball * TS, ambient: '#4a3c42', fog: 0.2 },
      { x: ZONE.boss * TS, ambient: '#463440', fog: 0.25 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C2, C3);
    return L;
  };

  /* =================================================================== */
  function hooks(L, C2, C3) {
    var A = TC.ART, E = TC.ent;
    var baseT = null;
    var Z = L.ZONE;
    var st0 = null;

    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#040303'], [0.5, '#0e0a08'], [1, '#1a120e']], 3, 0);
      bg.tw = A.twinkles(SW, 46, 44, 61);   // vaga-lumes de caverna no teto
      bg.moon = null;
      bg.far = A.hills(512, 70, { seed: 41, color: '#140f0c', rim: '#2a2018', base: 0.35, amp: 0.85, period: 7 });
      bg.mid = A.hills(512, 90, { seed: 47, color: '#0c0908', rim: '#221812', base: 0.45, amp: 0.7, period: 6 });
      var tl = TC.canvas(768, 140), c = tl.ctx, r = TC.RNG(808);
      for (var i = 0; i < 26; i++) {
        var sg = TC.silhouette(C3.stalagmite(r.int(40, 120), i + 9), '#0a0806');
        var tx = r.int(0, 767);
        [-768, 0, 768].forEach(function (o) { c.drawImage(sg, tx - sg.baseX + o, 140 - sg.height); });
      }
      c.fillStyle = TC.col('#0a0806'); c.fillRect(0, 130, 768, 10);
      bg.trees = tl;
      var ceil = TC.silhouette(C3.stalactites(512, 99), '#060404');
      bg.fog = A.fog(512, 52, 29, '#6a5a48');
      bg.fogFront = A.fog(512, 40, 31, '#7a6a58');
      bg.extra = function (cc, camX, t) {
        var o = Math.round(camX * 0.4) % 512;
        cc.drawImage(ceil, -o, 0); cc.drawImage(ceil, 512 - o, 0);
        // o poço do elevador: paredes de rocha e vigas que sobem enquanto a plataforma desce
        var lx = Z.lift * TS - camX;
        if (lx > -300 && lx < SW + 40) drawShaft(cc, lx, st0 ? st0.liftY || 0 : 0);
      };
      return bg;
    };
    var shaftCv = null;
    function drawShaft(c, lx, ly) {
      if (!shaftCv) {
        shaftCv = TC.canvas(256, 256);
        var s = shaftCv.ctx, r = TC.RNG(5);
        for (var y = 0; y < 256; y++) { s.fillStyle = TC.mix('#1a1614', '#120e0c', (y % 64) / 64); s.fillRect(0, y, 256, 1); }
        for (var k = 0; k < 300; k++) { s.fillStyle = TC.col(r() < 0.5 ? '#2a2420' : '#0a0806'); s.fillRect(r.int(0, 255), r.int(0, 255), r.int(1, 4), r.int(1, 3)); }
        for (y = 0; y < 256; y += 64) {
          s.fillStyle = TC.col('#3a2414'); s.fillRect(0, y, 256, 6);
          s.fillStyle = TC.col('#5a3e26'); s.fillRect(0, y, 256, 1);
        }
        s.fillStyle = TC.col('#2a1a10'); s.fillRect(30, 0, 6, 256); s.fillRect(220, 0, 6, 256);
      }
      var off = Math.round(ly) % 256;
      c.save();
      c.beginPath(); c.rect(Math.round(lx), 0, 256, GY); c.clip();
      c.drawImage(shaftCv, Math.round(lx), -off); c.drawImage(shaftCv, Math.round(lx), 256 - off);
      c.restore();
    }

    L.tileFor = function (code, open, st, v) {
      var T = C3.T;
      if (!baseT) baseT = A.tiles();
      if (code === 1) {
        if (st === 'roots') return open ? T.rootTop[v] : T.earth[v];
        if (st === 'mine') return open ? T.railTop[v] : T.coal[v];
        if (st === 'lift') return open ? T.grate[v] : T.grate[(v + 1) % 2];
        if (st === 'cave') return open ? T.caveTop[v] : T.cave[v];
        if (st === 'ballroom') return open ? T.parquetTop[v] : T.parquet;
      }
      if (code === 3) return open ? T.caveTop[v] : T.cave[v];
      if (code === 2 && st === 'roots') return false;
      if (code === 2 && st === 'cave') return T.caveTop[v];
      return null;
    };

    /* ---------- partículas: poeira, esporos e gotas d'água ---------- */
    L.particles = function (st) {
      var cx = st.camX, x = st.player.x;
      if (st.t % 9 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(30, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.1, 0.1), life: 200, color: x < Z.mine * TS ? '#80e0c0' : '#c8b898', size: 1, fade: true, wobble: 0.03, layer: 2 });
      if (x > Z.cave * TS && x < Z.ball * TS && st.t % 23 === 0) {
        var dx = cx + TC.rnd.range(0, SW);
        st.parts.add({ x: dx, y: 10, vy: 2.4, ay: 0.15, life: 70, color: '#a0d0ff', size: 1, layer: 1 });
        if (TC.rnd() < 0.3) TC.audio.sfx('drip');
      }
      if (x > Z.ball * TS && st.t % 13 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(40, 90), vy: 0.15, life: 160, color: TC.rnd.pick(C3.lanternColors), size: 1, fade: true, wobble: 0.04, layer: 2 });
    };

    /* ---------- início ---------- */
    L.init = function (st, save) {
      st0 = st;
      var D = TC.diff();
      st.gun = { ammo: save && save.ammo != null ? save.ammo : 12 };
      st.fireGun = function (p) { TC.ch2.fireGun(st, p); };
      st.liftY = 0; st.liftV = 0;
      st.liftDone = !!(save && save.lift) || L.liftArena.done;
      st.fatherSeen = !!(save && save.father) || L.fatherArena.done;
      st.props = st.props.map(function (pr) { return pr.kind === 'cart' ? new E.Cart(pr.x, pr.y, pr.drop) : pr; });
      st.deco.push(new E.Band(L._bandX, L._bandY));
      st.deco.push(new E.BallDancers(238 * TS, 260, 6));
      st.deco.push(new E.BallDancers(282 * TS + 128, 200, 5));
      var baseKill = st.kill;
      st.kill = function (e) {
        baseKill.call(st, e);
        if (e && !e.isBoss && !st.noDrops && e.y < L.pxH && st.gun.ammo < 12 && TC.rnd() < 0.08 + D.drop * 0.5) {
          st.items.push(new E.Item('balas', e.x, Math.min(e.y, GY - 8), true));
        }
      };
    };
    L.saveExtra = function (st, s) {
      s.ammo = st.gun ? st.gun.ammo : 12;
      s.lift = st.liftDone;
      s.father = st.fatherSeen;
    };
    L.onRespawn = function (st) {
      if (st.gun && st.gun.ammo < 3) st.gun.ammo = 3;
      st.ambientOverride = null;
      st.liftV = 0;
      if (st.fatherActors) { st.fatherActors.forEach(function (a) { a.alive = false; }); st.fatherActors = null; }
      if (st.ingrid) { st.ingrid.alive = false; st.ingrid = null; }
    };

    L.afterCard = function* (st) {
      st.banner = { kind: 'mission', t: 0 };
      TC.audio.sfx('bell');
      var w = 0;
      while (w++ < 240 && !(w > 40 && (TC.input.pressed('confirm') || TC.input.pressed('attack') || TC.input.pressed('start')))) yield;
      st.banner = null;
    };
    L.drawBanner = function (st, c, b) {
      if (b.kind !== 'mission') return;
      var k = TC.clamp(b.t / 20, 0, 1);
      var h = Math.round(74 * TC.ease.outCubic(k));
      TC.ui.box(c, 20, 80 - h / 2, 216, Math.max(4, h), 'dark', 0.94);
      if (k < 1) return;
      var big = TC.ui.bigText(TC.t('mission'), 2, '#ffe0a0', '#c07030', '#06050c');
      c.drawImage(big, 128 - Math.floor(big.width / 2), 48);
      TC.font.wrap(TC.t('mission3.2'), 190).forEach(function (ln, i) { TC.font.draw(c, ln, 128, 76 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
    };

    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, 36, 11);
      c.drawImage(C2.gunIcon, 5, 27);
      var am = st.gun ? st.gun.ammo : 0;
      TC.font.draw(c, (am < 10 ? '0' : '') + am, 17, 27, am ? '#ffe0a0' : ((st.t >> 3) % 2 ? '#ff6050' : '#802020'), { shadow: '#000' });
    };

    /* ---------- eventos da fase ---------- */
    L.update = function (st) {
      var p = st.player;
      // o elevador desce enquanto a arena dele dura
      var la = L.liftArena;
      if (st.arena === la && !st.liftDone) {
        if (!st.liftOn) { st.liftOn = true; TC.audio.sfx('lift'); TC.fx.shake(3, 20); }
        st.liftV = TC.approach(st.liftV, 1.6, 0.02);
      } else if (st.liftOn && la.done) {
        st.liftOn = false; st.liftDone = true;
        TC.audio.sfx('lift'); TC.audio.sfx('hit2'); TC.fx.shake(4, 24);
        st.save();
      } else if (!st.liftOn) st.liftV = TC.approach(st.liftV, 0, 0.05);
      st.liftY += st.liftV;
      if (st.liftOn && st.t % 50 === 0) TC.audio.sfx('step');
      // o pai no meio dos dançarinos
      if (!st.fatherSeen && st.mode === 'play' && !st.arena && p.x > 207 * TS && p.x < 214 * TS && p.onGround && p.state === 'normal') {
        st.fatherSeen = true;
        st.cine = new TC.Script(fatherSeq(st));
      }
      // a música: a polca nos túneis, a valsa da bandinha no salão
      if ((st.mode === 'play' || st.mode === 'dialog') && !st.boss && !st.cine) {
        var want = p.x > Z.ball * TS - 24 ? 'bandinha' : L.music;
        if (TC.audio.musicName() !== want) TC.audio.music(want, 1.2);
      }
    };

    function* fatherSeq(st) {
      var p = st.player;
      st.mode = 'cine';
      p.setState('cine'); p.pose = 'idle'; p.face = 1; p.vx = 0;
      TC.fx.tween('letterbox', 22, 30);
      // o Ewald valsando com uma moça fantasma, sem enxergar ninguém
      var ew = new E.Actor(C3.ewald, p.x + 120, GY, -1); ew.pose = 'dance'; ew.speed = 16; ew.alpha = 0;
      var girl = new E.Actor({ idle: C3.ingrid.idle, dance: C3.ingrid.dance }, p.x + 136, GY, -1); girl.pose = 'dance'; girl.ghost = true; girl.speed = 16; girl.alpha = 0;
      girl.face = 1; girl.x = ew.x - 14;
      st.deco.push(girl, ew);
      st.fatherActors = [ew, girl];
      for (var i = 0; i < 40; i++) { ew.alpha = girl.alpha = i / 40; yield; }
      yield* co.wait(30);
      p.pose = 'shock';
      yield* st.say('fa.1', 'shock');
      yield* TC.ui.say(st.dlg, [{ who: 'ewald', key: 'fa.2' }], { pos: 'top' });
      p.pose = 'run';
      for (i = 0; i < 30; i++) { p.x += 1.2; p.anim++; yield; }
      p.pose = 'idle';
      yield* st.say('fa.3');
      // os dançarinos param e olham para o Arno
      TC.audio.stopMusic(0.4);
      TC.audio.sfx('ghost');
      yield* co.wait(40);
      yield* TC.ui.say(st.dlg, [{ who: 'voice', key: 'fa.4' }], { pos: 'top' });
      ew.vx = 0.5; ew.face = 1;
      for (i = 0; i < 60; i++) { ew.alpha = girl.alpha = 1 - i / 60; girl.x += 0.5; yield; }
      ew.alive = girl.alive = false;
      st.fatherActors = null;
      yield* st.say('fa.5');
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
      TC.audio.music('bandinha', 0.5);
      // a arena trava logo ali
      if (!L.fatherArena.done && !L.fatherArena.started) { st.startArena(L.fatherArena); st.waveDelay = 20; }
    }

    /* ---------- o chefe: o Moço do Baile ---------- */
    L.bossSeq = function* (st, a) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround; });
      p.setState('cine'); p.pose = 'idle'; p.face = 1;
      TC.fx.tween('letterbox', 22, 40);
      st.ambientOverride = '#2c2230';
      var boss = st.spawnEnemy('moco', a.x0 + 170, GY, { arena: a });
      if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
      boss.pose = 'dance'; boss.face = -1;
      st.boss = boss;
      var ing = new E.Actor(C3.ingrid, a.x0 + 156, GY, 1); ing.pose = 'dance'; ing.speed = 14;
      st.deco.push(ing); st.ingrid = ing;
      if (TC.audio.musicName() !== 'bandinha') TC.audio.music('bandinha', 0.5);
      yield* co.wait(90);
      TC.audio.stopMusic(0.3);
      TC.audio.sfx('hoof');
      boss.pose = null; boss.face = -1;
      ing.pose = 'scared';
      yield* co.wait(30);
      if (!a.seen) {
        a.seen = true;
        yield* st.say('m.1', null, 'moco', 'bottom');
        yield* st.say('m.2', 'shock', 'arno', 'bottom');
        yield* st.say('m.3', null, 'moco', 'bottom');
        yield* st.say('m.4', null, 'moco', 'bottom');
        yield* st.say('m.4b', null, 'moco', 'bottom');
        yield* st.say('m.5', null, 'arno', 'bottom');
        boss.pose = 'gaita';
        TC.audio.sfx('demon');
        yield* st.say('m.6', null, 'moco', 'bottom');
      } else {
        boss.pose = 'gaita';
        yield* co.wait(30);
      }
      // a Rainha da Batata corre para a beira da pista
      ing.pose = 'idle'; ing.face = -1;
      for (var i = 0; i < 40; i++) { ing.x -= 2.6; yield; }
      ing.x = Math.max(ing.x, a.x0 + 14); ing.pose = 'scared'; ing.face = 1; ing.alpha = 0.7;
      boss.pose = null;
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music('boss3');
      st.banner = { kind: 'fight', t: 0 };
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.boss3', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    };

    /* ---------- vitória: o pé de bode aparece e ele afunda no chão ---------- */
    L.clearSeq = function* (st) {
      var p = st.player, boss = null;
      st.enemies.forEach(function (e) { if (e.isBoss) boss = e; });
      st.mode = 'cine';
      st.killAllMinions();
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      if (boss) p.face = boss.x > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 40);
      yield* co.wait(40);
      if (boss) {
        yield* TC.ui.say(st.dlg, [{ who: 'moco', face: 'reveal', key: 'm.8' }], { pos: 'top' });
        TC.audio.sfx('sulfur');
        TC.fx.flash('#e0e070', 0.5, 0.02);
        for (var k = 0; k < 90; k++) {
          boss.sinkT = k * 0.5;
          boss.alpha = Math.max(0, 1 - k / 80);
          if (k % 3 === 0) st.parts.add({ x: boss.x + TC.rnd.range(-16, 16), y: boss.y - TC.rnd.range(0, 60), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-1.6, -0.4), life: 60, colors: ['#e8e070', '#a0a040', '#4a4a20'], size: TC.rnd.int(2, 4), fade: true });
          yield;
        }
        boss.alive = false;
      }
      st.ambientOverride = null;
      yield* co.wait(30);
      yield* st.say('m.9');
      if (st.ingrid) { st.ingrid.pose = 'idle'; st.ingrid.alpha = 1; }
      yield* co.wait(30);
      TC.fx.tween('letterbox', 0, 30);
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { return TC.Ending3Scene ? new TC.Ending3Scene({ score: score }) : new TC.TitleScene(); };
  }
})();
