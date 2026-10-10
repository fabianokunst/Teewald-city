'use strict';
/* Teewald City — Fase 6: "A Noite do Pelznickel"
   A Linha Esperança, a primeira picada de 1852: a estrada de chão com as estufas de fumo, o milharal na cerração,
   a venda do Seu Arnoldo e a cancha de bolão, o cemitério de família e a casa de pedra da Oma Hedwig (o diário),
   a escola da linha — e no pátio, ao lado da fornalha da estufa, o Pelznickel. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;

  TC.buildLevel6 = function () {
    var A = TC.ART, C2 = A.ch2Init(), C3 = A.ch3Init(), C6 = A.ch6Init(), CAST = A.castInit();
    var W = 300, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 6, music: 'stage6', cardNum: 'stage6.num', cardName: 'stage6.name', comboY: 38
    };
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    var x, i;
    var Z = { road: 0, corn: 64, venda: 118, bolao: 134, cem: 172, house: 198, school: 212, inside: 232, yard: 256, boss: 266 };
    L.ZONE = Z;

    /* ---------- chão e estilos ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) {
      L.style[x] = x < Z.corn ? 'road' : x < Z.venda ? 'field' : x < Z.bolao ? 'road' : x < Z.cem ? 'lane' : x < Z.school ? 'grass' : x < Z.inside ? 'yard' : x < Z.yard ? 'floor' : 'yard';
    }
    // a caçamba da carroça (plataforma) e uma pilha de feno
    fill(29, 32, 10, 10, 2);
    fill(95, 97, 10, 10, 2);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1852);
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
    function ground(cv, px, z, extra) { return back(cv, px, GY + 1 - cv.height, z, extra); }

    // --- 1. a estrada de chão, a porteira, as estufas de fumo ---
    (function () {
      var truck = TC.scaleCanvas(A.truckSmall(), 2);
      var o = ground(truck, 6, 1);
      o.lights = [{ dx: truck.width - 2, dy: 15, r: 70, col: '#ffe0a0', a: 0.9 }, { dx: truck.width + 40, dy: 18, r: 50, col: '#ffe0a0', a: 0.5 }];
      o.glows = [{ dx: truck.width - 3, dy: 15, r: 6, col: '#fff0c0', a: 0.9 }];
      L._truck = o;
    })();
    var por = C6.porteira();
    ground(por, 8 * TS - por.width / 2, 0);
    L.signs.push({ x: 8 * TS, y: GY, key: 'sign6.porteira' });
    ground(C6.roadCross(), 3 * TS, 1, { candle: false });
    ground(C6.fence(220), 12 * TS, -1);
    var est1 = C6.estufa(3, false), e1 = ground(est1, 16 * TS, -1);
    glow(e1, est1.furnaceX, est1.furnaceY, 70, '#ff9040', 1.0, true);
    ground(C6.tobaccoRack(64, 3), 22 * TS, 0);
    sign(21, 'sign6.estufa', C2.sign(68, 22, [['ESTUFA DE FUMO', '#f0e0b0'], ['NÃO DEIXE APAGAR', '#e8c070']], { legs: 12 }));
    ground(C6.carroca(), 28 * TS - 6, 1);
    var tree1 = C6.bigTree(5);
    ground(tree1, 35 * TS - tree1.baseX, -1);
    ground(C6.fence(300), 38 * TS, -1);
    var tree2 = C6.bigTree(9);
    ground(tree2, 54 * TS - tree2.baseX, -1);
    var est2 = C6.estufa(7, true), e2 = ground(est2, 44 * TS, -2);
    glow(e2, est2.furnaceX, est2.furnaceY, 70, '#ff9040', 1.0, true);
    ground(C6.tobaccoRack(80, 9), 58 * TS, 0);

    // --- 2. o milharal na cerração ---
    for (x = Z.corn * TS; x < Z.venda * TS; x += 256) {
      back(C6.cornRow(256, 70, x, { stalk: '#26321e', leaf: '#2e3e24', leafL: '#3a4a2c', tassel: '#8a7a48', ear: '#6a6038' }), x, GY + 1 - 86, -2);
      back(C6.cornRow(256, 56, x + 7), x, GY + 1 - 56, -1);
    }
    [70, 84, 104].forEach(function (tx) {
      // espantalhos de enfeite nos moirões, lá no meio do milho
      var sc = TC.tint(C6.scare.idle[0], '#1a2030', 0.55), cv = TC.canvas(sc.width, sc.height + 22), c = cv.ctx;
      c.fillStyle = TC.col('#1a1612'); c.fillRect(Math.round(sc.ox) - 1, sc.height - 20, 3, 42);
      c.drawImage(sc, 0, 0);
      back(cv, tx * TS - sc.ox, GY + 1 - 90, -1);
    });
    ground(C6.fence(200), 108 * TS, 0);
    // pés de milho em primeiro plano (paralaxe), esparsos para não esconder a briga
    for (i = 0; i < 9; i++) {
      var fc = C6.cornRow(70, 54, 300 + i, { stalk: '#06080a', leaf: '#0a0e0c', leafL: '#0e1410', tassel: '#2a2618', ear: '#1a1810' });
      L.front.push({ cv: fc, x: Math.round(Z.corn * TS * 1.25 + 120 + i * 190 + r.int(0, 60)), y: 224 - 46 });
    }

    // --- 3. a venda do Seu Arnoldo e a cancha de bolão ---
    var ven = C6.venda(), vo = ground(ven, 119 * TS, 0);
    glow(vo, ven.lampX, ven.lampY, 46, '#ffc060', 0.9, true);
    glow(vo, ven.doorX, 96, 40, '#ffb050', 0.7, true);
    ground(C6.vendaProps(), 120 * TS - 4, 1);
    L.signs.push({ x: 126 * TS, y: GY, key: 'sign6.venda' });
    var can = C6.cancha(38 * TS), co2 = ground(can, Z.bolao * TS, -1);
    can.bulbs.forEach(function (b) { glow(co2, b.x, b.y, 52, '#ffe0a0', 0.85, false); });
    var pd = C6.pinDeck();
    ground(pd, 168 * TS, 0);
    L._pinsX = 169 * TS + 14;
    sign(140, 'sign6.bolao', C2.sign(86, 30, [['SOCIEDADE DE BOLÃO', '#f0e0b0'], ['ESPERANÇA - 1903', '#e8c070'], ['GUT HOLZ!', '#ffffff']], { legs: 8, bg: '#3a2a1a' }));

    // --- 4. o cemitério de família e a casa de pedra ---
    ground(C6.cemWall(100), Z.cem * TS, 0);
    ground(C6.cemWall(120), 186 * TS, -1);
    [175, 179, 183, 188, 192, 195].forEach(function (tx, k) {
      var cr = k % 3 === 1 ? C6.gravestone(tx) : C6.ironCross(tx);
      ground(cr, tx * TS, k % 2 ? 1 : 0);
    });
    L.signs.push({ x: 179 * TS + 12, y: GY, key: 'sign6.cross' });
    L.signs.push({ x: 190 * TS, y: GY, key: 'sign6.grave' });
    var ar1 = A.araucaria(6611, 150, { sil: '#0a0c18', rim: '#1e2448' });
    ground(ar1, 181 * TS - ar1.baseX, -2);
    var tree3 = C6.bigTree(13);
    ground(tree3, 196 * TS - tree3.baseX, -2);
    var house = C6.stoneHouse(false);
    L._house = ground(house, 199 * TS, 0);
    L._houseOpen = C6.stoneHouse(true);
    L._houseDoor = 199 * TS + house.doorX;

    // --- 5. a escola da linha (por fora e por dentro) ---
    var sch = C6.school(), so = ground(sch, 213 * TS, -1);
    L.signs.push({ x: 213 * TS + sch.doorX, y: GY, key: 'sign6.school' });
    ground(C6.bellPost(), 229 * TS, 0);
    ground(C6.fence(140), 222 * TS, -2);
    var clsW = (Z.yard - Z.inside) * TS, boardX = 236;
    var cls = C6.classroom(clsW, boardX), clo = back(cls, Z.inside * TS, 0, -3);
    glow(clo, cls.lampX, cls.lampY + 4, 70, '#ffc070', 0.85, true);
    cls.windows.forEach(function (wx) { (clo.lights = clo.lights || []).push({ dx: wx, dy: 70, r: 40, col: '#7080c0', a: 0.5 }); });
    L._boardX = Z.inside * TS + boardX + 48; L._boardY = 44;
    var deskXs = [234, 237, 240, 243];
    deskXs.forEach(function (tx) { ground(C6.desk(), tx * TS, 1); });
    L._deskXs = deskXs;
    L.signs.push({ x: 238 * TS + 8, y: GY, key: 'sign6.alfabeto' });
    // portas de entrada e dos fundos da sala
    [Z.inside * TS - 4, Z.yard * TS - 10].forEach(function (dx) {
      var dcv = TC.canvas(14, 64), d = dcv.ctx;
      d.fillStyle = TC.col('#2a1a10'); d.fillRect(0, 0, 14, 64);
      d.fillStyle = TC.col('#0c1020'); d.fillRect(3, 3, 8, 61);
      back(dcv, dx, GY + 1 - 64, 0);
    });

    // --- 6. o pátio da escola e a estufa grande com a fornalha ---
    var bossX0 = Z.boss * TS;
    var est3 = C6.estufa(11, true);
    var e3x = bossX0 + SW - 18 - est3.furnaceX;
    var e3 = ground(est3, e3x, -1);
    glow(e3, est3.furnaceX, est3.furnaceY, 90, '#ff9040', 1.2, true);
    L._furnaceX = e3x + est3.furnaceX;
    ground(C6.tobaccoRack(70, 21), bossX0 + 120, -2);
    ground(C6.fence(160), bossX0 + 60, -3);
    ground(C6.bellPost(), bossX0 + 90, -2);
    ground(C6.tobaccoRack(90, 27), (Z.boss + 18) * TS + 40, -1);
    L._chimneys = [e1, e2, e3].map(function (o) { return { x: o.x + o.cv.width - 31, y: o.y + 4 }; });

    /* ---------- quebráveis e itens ---------- */
    [[11, 'crate', 'cuca'], [26, 'barrel', 'balas'], [41, 'crate', 'linguica'], [60, 'barrel', 'chimarrao'], [74, 'crate', 'balas'],
      [92, 'barrel', 'cuca'], [113, 'crate', 'linguica'], [124, 'barrel', 'chimarrao'], [131, 'crate', 'balas'], [150, 'barrel', 'cuca'],
      [164, 'crate', 'linguica'], [176, 'crate', 'balas'], [185, 'barrel', 'chimarrao'], [210, 'crate', 'cuca'], [228, 'barrel', 'balas'],
      [258, 'crate', 'chimarrao'], [262, 'barrel', 'linguica']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[30, 9], [31, 9], [96, 9], [100, 11], [146, 11], [147, 11], [205, 11], [246, 11], [247, 11]].forEach(function (p) {
      L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 32 * TS + 8, y: 9 * TS - 6 });
    // bolas de bolão largadas na frente da venda e na cancha
    L.ballsAt = [126, 132, 139, 145, 158, 166].map(function (tx) { return tx * TS + 8; });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('c6scare', 14, GY, { pole: true });
    sp('c6barba', 33, 132, { hang: true }); sp('c6barba', 37, 128, { hang: true });
    sp('crow', 40, 70);
    sp('c6scare', 68, GY, { pole: true }); sp('crow', 86, 60); sp('c6scare', 92, GY, { pole: true });
    sp('crow', 108, 66); sp('c6scare', 114, GY, { pole: true });
    sp('c6bowler', 129, GY);
    sp('ghost', 177, 150); sp('flame', 186, 80);
    sp('c6barba', 195, 120, { hang: true });
    sp('c6scare', 226, GY, { pole: true });

    /* ---------- arenas ---------- */
    function sc(side) { return { t: 'c6scare', side: side, y: GY }; }
    function bb(at) { return { t: 'c6barba', drop: at }; }
    function bw(side) { return { t: 'c6bowler', side: side, y: GY }; }
    function cr(side, y) { return { t: 'crow', side: side, y: y || 60, opt: { fly: side === 'l' ? 1 : -1 } }; }
    function gr(at) { return { t: 'ghost', rise: at }; }
    function fl(side) { return { t: 'flame', side: side, y: 70 }; }
    function pc(side, kind) { return { t: 'possesso', side: side, y: GY, opt: { kind: kind || 'colono' } }; }
    L.arenas = [
      { x0: 24 * TS, waves: [[sc('r')], [sc('l'), sc('r')], [sc('r'), bb(128)]] },
      { x0: 46 * TS, waves: [[bb(84), bb(176)], [sc('l'), bb(128)], [sc('r'), cr('l'), bb(64)]] },
      { x0: 78 * TS, waves: [[sc('r'), cr('l')], [sc('l'), sc('r')], [cr('r'), cr('l', 50), sc('r')]] },
      { x0: 100 * TS, waves: [[sc('l'), bb(110)], [sc('r'), sc('l'), cr('r')], [bb(60), bb(190), sc('r')]] },
      { x0: 136 * TS, waves: [[bw('r')], [bw('l'), bw('r')], [bw('r'), sc('l')]] },
      { x0: 152 * TS, waves: [[bw('r'), bw('l')], [bw('r'), bb(128)], [bw('l'), bw('r'), sc('r')]] },
      { x0: 178 * TS, waves: [[gr(70), gr(190)], [fl('r'), sc('l')], [sc('r'), bb(128), fl('l')]] },
      { x0: 215 * TS, waves: [[sc('l'), sc('r')], [pc('r', 'colona'), bw('l')], [sc('r'), pc('l'), cr('r'), bb(128)]] },
      { x0: bossX0, boss: true, furnace: 'right', waves: [] }
    ];
    L.bossArena = L.arenas[8];
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 24 * TS + 30 }, { x: 46 * TS + 30 }, { x: 62 * TS + 8, shrine: true }, { x: 78 * TS + 30 }, { x: 100 * TS + 30 },
      { x: 117 * TS + 8, shrine: true }, { x: 136 * TS + 30 }, { x: 152 * TS + 30 }, { x: 173 * TS + 8, shrine: true },
      { x: 178 * TS + 30 }, { x: 212 * TS + 8, shrine: true }, { x: 215 * TS + 30 }, { x: 260 * TS + 8, shrine: true }, { x: bossX0 + 30 }
    ];
    var acp = [1, 2, 4, 5, 7, 8, 10, 12, 14];
    L.arenas.forEach(function (a, k) { a.cp = acp[k]; });
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });

    /* falas ao passar */
    L.barks = [
      { x: 5 * TS, key: 'b6.start' },
      { x: 17 * TS, key: 'b6.estufa' },
      { x: 33 * TS, key: 'b6.tree' },
      { x: 65 * TS, key: 'b6.corn' },
      { x: 119 * TS, key: 'b6.venda' },
      { x: 134 * TS + 8, key: 'b6.bolao' },
      { x: 173 * TS + 20, key: 'b6.cem' },
      { x: 212 * TS + 30, key: 'b6.school' },
      { x: 233 * TS, key: 'b6.inside', face: 'shock' },
      { x: 257 * TS, key: 'b6.yard' }
    ];

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#4a4a7c', fog: 0.3 },
      { x: Z.corn * TS, ambient: '#3c4470', fog: 0.55 },
      { x: Z.venda * TS, ambient: '#4a4672', fog: 0.3 },
      { x: Z.bolao * TS, ambient: '#4a4064', fog: 0.22 },
      { x: Z.cem * TS, ambient: '#363a68', fog: 0.5 },
      { x: Z.house * TS, ambient: '#3a3a66', fog: 0.42 },
      { x: Z.school * TS, ambient: '#40406e', fog: 0.3 },
      { x: Z.inside * TS, ambient: '#3c3448', fog: 0.06 },
      { x: Z.yard * TS, ambient: '#3a3864', fog: 0.36 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C2, C3, C6, CAST);
    return L;
  };

  /* =================================================================== */
  function hooks(L, C2, C3, C6, CAST) {
    var A = TC.ART, E = TC.ent;
    var baseT = null;
    var Z = L.ZONE;

    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#03030c'], [0.45, '#0c0c2a'], [0.8, '#1e1a44'], [1, '#2e2852']], 1852, 0.007);
      bg.tw = A.twinkles(SW, 110, 34, 66);
      bg.moon = A.moon(12);
      bg.far = A.hills(512, 70, { seed: 61, color: '#1a1c42', rim: '#343a74', base: 0.5, amp: 0.55, trees: 40, treeMin: 5, treeMax: 9, period: 6 });
      bg.mid = A.hills(512, 90, { seed: 66, color: '#10122c', rim: '#262a56', base: 0.45, amp: 0.4, trees: 60, treeMin: 7, treeMax: 15, period: 6, arauc: 0.8 });
      var tl = TC.canvas(768, 140), c = tl.ctx;
      var row = C6.farmRow(768, 6606);
      c.drawImage(row, 0, 140 - row.height);
      bg.trees = tl;
      bg.fog = A.fog(512, 52, 66, '#8a8ab8');
      bg.fogFront = A.fog(512, 40, 67, '#9a9ac8');
      return bg;
    };

    L.tileFor = function (code, open, st, v) {
      var T = C6.T;
      if (!baseT) baseT = A.tiles();
      if (code === 1) {
        if (st === 'road') return open ? T.roadTop[v] : T.earth[v];
        if (st === 'field') return open ? T.fieldTop[v] : T.earth[v];
        if (st === 'lane') return open ? T.laneTop[v] : baseT.dirt[v];
        if (st === 'grass') return open ? baseT.grassTop[v] : baseT.dirt[v];
        if (st === 'yard') return open ? T.yardTop[v] : T.earth[v];
        if (st === 'floor') return open ? T.floorTop[v] : baseT.dirt[v];
      }
      if (code === 2 && st === 'road') return false;     // a caçamba da carroça está no cenário
      return null;
    };

    /* ---------- partículas: cerração, vaga-lumes no milharal, pó de giz na escola ---------- */
    L.particles = function (st) {
      var cx = st.camX, px = st.player.x;
      if (st.t % 11 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(110, 185), vx: TC.rnd.range(0.1, 0.35), vy: TC.rnd.range(-0.05, 0.05), life: 220, color: '#8a8ab0', size: 2, fade: true, wobble: 0.02, layer: 2 });
      if (px > Z.corn * TS && px < Z.venda * TS && st.t % 17 === 0) {
        st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(90, 180), vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-0.2, 0.1), life: 120, colors: ['#e0ff80', '#a0d040', '#e0ff80', '#405020'], size: 1, wobble: 0.08, layer: 1, add: true });
      }
      if (px > Z.cem * TS && px < Z.school * TS && st.t % 40 === 0) {
        st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(130, 180), vx: TC.rnd.range(-0.15, 0.15), vy: -0.1, life: 160, colors: ['#a0c0ff', '#6080d0', '#203060'], size: 2, fade: true, wobble: 0.05, layer: 1, add: true });
      }
      if (px > Z.inside * TS && px < Z.yard * TS && st.t % 9 === 0) {
        st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(40, 180), vx: TC.rnd.range(-0.05, 0.05), vy: TC.rnd.range(-0.06, 0.06), life: 200, color: '#e8dcc0', size: 1, fade: true, wobble: 0.03, layer: 2 });
      }
      if (st.t % 9 === 0) {
        // fumaça das chaminés das estufas
        L._chimneys.forEach(function (ch) {
          if (ch.x < cx - 40 || ch.x > cx + SW + 40) return;
          st.parts.add({ x: ch.x + TC.rnd.range(-2, 2), y: ch.y, vx: TC.rnd.range(0.1, 0.4), vy: TC.rnd.range(-0.7, -0.4), life: 110, colors: ['#8a8a96', '#6a6a76', '#4a4a56'], size: TC.rnd.int(2, 3), fade: true, wobble: 0.05 });
        });
      }
    };

    /* ---------- início ---------- */
    L.init = function (st, save) {
      var D = TC.diff();
      TC.ch6.setStage(st);
      st.c6grabOverlay = true;
      st.gun = { ammo: save && save.ammo != null ? save.ammo : 12 };
      st.ball = save && save.ball != null ? save.ball : 0;
      st.diaryDone = !!(save && save.diary);
      st.schoolDone = !!(save && save.school);
      // a bola de bolão no lugar do 38 enquanto o Arno carrega uma
      st.fireGun = function (p) {
        if (st.ball > 0) TC.ch6.throwBall(st, p);
        else { p.throwing = false; TC.ch2.fireGun(st, p); }
      };
      var p = st.player;
      var baseFrame = p.frame, baseDraw = p.draw;
      p.frame = function () {
        if (this.state === 'shoot' && (this.throwing || (this.t < 3 && st.ball > 0))) {
          var B = C6.arnoBowl;
          return this.throwing ? (this.t < 12 ? B.throw : B.follow) : B.prep;
        }
        return baseFrame.call(this);
      };
      p.draw = function (c, cx, cy) {
        if (this.inSack) return;
        baseDraw.call(this, c, cx, cy);
        // a bola levada na cintura e a barba-de-velho agarrada na cabeça
        if (st.ball > 0 && this.state !== 'shoot' && this.state !== 'dead' && this.state !== 'down') {
          var bi = C6.ballIcon;
          c.drawImage(bi, Math.round(this.x - this.face * 7 - cx - 2), Math.round(this.y - 15 - cy));
        }
        if (st.c6grab && st.c6grab.alive) st.c6grab.drawAt(c, cx, cy);
      };
      st.props = st.props.map(function (pr) { return pr; });
      // os nove pinos e as bolas largadas
      st.c6pins = new E.C6PinSet(L._pinsX, GY);
      st.deco.push(st.c6pins);
      var startX = L.cps[st.cp].x;
      L.ballsAt.forEach(function (bx) { if (bx > startX - 20) st.deco.push(new E.C6BallPickup(bx, GY)); });
      // o Ewald esperando junto do caminhão
      if (st.cp === 0) {
        var ew = new E.Actor(C3.ewald, 78, GY, 1); ew.lightCol = '#ffd8a0';
        st.deco.push(ew); st.c6ewald = ew;
      }
      // a sala de aula: as crianças rezando e o vulto no quadro-negro
      st.c6board = new E.C6Board(L._boardX, L._boardY, ['SCHMITT 1898', 'WEBER 1931', 'BECKER 1977', 'KESSLER 1997', 'BECKER 1997']);
      st.deco.push(st.c6board);
      if (st.schoolDone) st.c6board.chars = 999;
      else setupClass(st);
      if (st.diaryDone) L._house.cv = L._houseOpen;
      // inimigos derrotados às vezes deixam cair balas
      var baseKill = st.kill;
      st.kill = function (e) {
        baseKill.call(st, e);
        if (e && !e.isBoss && !st.noDrops && e.y < L.pxH && st.gun.ammo < 12 && TC.rnd() < 0.08 + D.drop * 0.5) {
          st.items.push(new E.Item('balas', e.x, Math.min(e.y, GY - 8), true));
        }
      };
      if (TC.params.balls) st.ball = Math.min(3, +TC.params.balls);
    };
    function setupClass(st) {
      var kidsSets = [CAST.kids.boy, CAST.kids.girl, CAST.kids.small];
      st.c6kids = [];
      [0, 1, 2].forEach(function (k) {
        var a = new E.Actor({ idle: kidsSets[k].sit, sit: kidsSets[k].sit, scared: kidsSets[k].scared }, L._deskXs[k] * TS + 8, GY - 9, 1);
        a.pose = 'sit'; a.speed = 40; a.lightCol = null;
        st.deco.push(a); st.c6kids.push(a);
      });
      var pz = new E.Actor({ idle: C6.pelz.idle, write: C6.pelz.write, point: C6.pelz.point, walk: C6.pelz.walk, curl: C6.pelz.curl }, L._boardX + 20, GY, 1);
      pz.pose = 'write'; pz.speed = 26;
      st.deco.push(pz); st.c6pelzActor = pz;
    }
    L.saveExtra = function (st, s) {
      s.ammo = st.gun ? st.gun.ammo : 12;
      s.ball = st.ball || 0;
      s.diary = st.diaryDone;
      s.school = st.schoolDone;
    };
    L.onRespawn = function (st) {
      var p = st.player;
      if (st.gun && st.gun.ammo < 3) st.gun.ammo = 3;
      st.ambientOverride = null;
      if (st.c6grab) st.c6grab = null;
      p.inSack = false; st.c6sack = null; p.throwing = false;
      st.deco = st.deco.filter(function (d) { return !d.c6proj; });
      st.banner = null;
    };
    L.speedMul = function (st) { return st.c6grab ? 0.45 : 1; };

    L.afterCard = function* (st) {
      if (st.c6ewald && st.cp === 0) {
        yield* TC.ui.say(st.dlg, [{ who: 'ewald', key: 'ew6.1' }], { pos: 'top' });
      }
      st.banner = { kind: 'mission', t: 0 };
      TC.audio.sfx('bell');
      var w = 0;
      while (w++ < 240 && !(w > 40 && (TC.input.pressed('confirm') || TC.input.pressed('attack') || TC.input.pressed('start')))) yield;
      st.banner = null;
    };
    L.drawBanner = function (st, c, b) {
      if (b.kind === 'diary') { drawDiary(st, c, b); return; }
      if (b.kind !== 'mission') return;
      var k = TC.clamp(b.t / 20, 0, 1);
      var h = Math.round(74 * TC.ease.outCubic(k));
      TC.ui.box(c, 20, 80 - h / 2, 216, Math.max(4, h), 'dark', 0.94);
      if (k < 1) return;
      var big = TC.ui.bigText(TC.t('mission'), 2, '#ffe0a0', '#c07030', '#06050c');
      c.drawImage(big, 128 - Math.floor(big.width / 2), 48);
      TC.font.wrap(TC.t('mission6'), 190).forEach(function (ln, i) { TC.font.draw(c, ln, 128, 76 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
    };

    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      var nb = st.ball || 0;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, 36 + (nb ? 8 + nb * 7 : 0), 11);
      c.drawImage(C2.gunIcon, 5, 27);
      var am = st.gun ? st.gun.ammo : 0;
      TC.font.draw(c, (am < 10 ? '0' : '') + am, 17, 27, am ? '#ffe0a0' : ((st.t >> 3) % 2 ? '#ff6050' : '#802020'), { shadow: '#000' });
      for (var i = 0; i < nb; i++) c.drawImage(C6.ballIcon, 40 + i * 7, 28);
    };

    /* ---------- o piloto automático (testes): bolas, X de giz, nomes caindo, o saco ---------- */
    L.botGoal = function (st, p) {
      if (p.inSack) return { keepAttack: true };
      var g = null;
      // sair de cima dos X de giz e da sombra dos nomes
      var danger = [];
      st.deco.forEach(function (d) { if (d.c6mark && d.alive && !d.struck) danger.push({ x: d.x, r: d.w ? d.w / 2 + 8 : 18 }); });
      if (danger.length) {
        var bad = function (x) { for (var k = 0; k < danger.length; k++) if (Math.abs(x - danger[k].x) < danger[k].r) return true; return false; };
        if (bad(p.x)) {
          var a = st.arena, lo = a ? a.x0 + 10 : p.x - 120, hi = a ? a.x0 + SW - 10 : p.x + 120, best = null;
          for (var dd = 8; dd < 140 && best == null; dd += 6) {
            if (p.x + dd <= hi && !bad(p.x + dd)) best = p.x + dd;
            else if (p.x - dd >= lo && !bad(p.x - dd)) best = p.x - dd;
          }
          if (best != null) return { x: best, noAtk: true };
        }
      }
      // pular as bolas que vêm rolando
      for (var i = 0; i < st.deco.length; i++) {
        var b = st.deco[i];
        if (b.c6eball && b.alive && !b.fading && (p.x - b.x) * Math.sign(b.vx) > 0 && Math.abs(p.x - b.x) < 44) return { jump: true };
      }
      // carregando bola: arremessa no inimigo que estiver na frente
      if (st.ball > 0 && st.t % 24 === 0) {
        var tgt = null;
        st.enemies.forEach(function (e) {
          if (!e.alive || e.dying || e.state === 'roll' || e.state === 'intro' || e.state === 'transform') return;
          var ex = e.x - p.x;
          if (Math.sign(ex) === p.face && Math.abs(ex) > 26 && Math.abs(ex) < 190 && Math.abs(e.y - p.y) < 30) tgt = e;
        });
        if (tgt) return { shoot: true };
      }
      // juntar as bolas largadas quando não tem ninguém perto
      if ((st.ball || 0) < TC.ch6.MAXBALL) {
        var near = false;
        st.enemies.forEach(function (e) { if (e.alive && !e.dying && Math.abs(e.x - p.x) < 60 && e.state !== 'pole' && e.state !== 'hang') near = true; });
        if (!near) {
          var pk = null, pd = 1e9;
          st.deco.forEach(function (d) {
            if (!d.c6pickup || !d.alive || d.t < 20) return;
            var dx = Math.abs(d.x - p.x);
            if (dx < 110 && dx < pd && (!st.arena || (d.x > st.arena.x0 && d.x < st.arena.x0 + SW))) { pd = dx; pk = d; }
          });
          if (pk) g = { x: pk.x, noAtk: true };
        }
      }
      return g;
    };
    L.debugInfo = function (st) {
      var b = st.boss;
      return { ball: st.ball, diary: st.diaryDone, school: st.schoolDone, form: b ? b.form : null, vogtArena: !!L.bossArena.vogt };
    };

    /* ---------- eventos da fase ---------- */
    L.update = function (st) {
      var p = st.player;
      if (p.state !== 'shoot') p.throwing = false;
      // a casa de pedra: o diário
      if (!st.diaryDone && st.mode === 'play' && !st.arena && p.x > L._houseDoor - 26 && p.x < L._houseDoor + 60 && p.onGround && p.state === 'normal') {
        st.diaryDone = true;
        st.cine = new TC.Script(diarySeq(st));
      }
      // a sala de aula: o vulto escrevendo os nomes
      if (!st.schoolDone && st.mode === 'play' && !st.arena && p.x > 244 * TS && p.x < Z.yard * TS && p.onGround && p.state === 'normal') {
        st.schoolDone = true;
        st.cine = new TC.Script(schoolSeq(st));
      }
      // a música: o xote na estrada, a reza baixinha dentro da escola
      if ((st.mode === 'play' || st.mode === 'dialog') && !st.boss && !st.cine) {
        var want = (p.x > Z.inside * TS - 8 && p.x < Z.yard * TS && !st.schoolDone) ? 'c6school' : L.music;
        if (TC.audio.musicName() !== want) TC.audio.music(want, 1.2);
      }
      // o Ewald acena e volta para a cabine quando o Arno se afasta
      if (st.c6ewald && p.x > 300 && st.c6ewald.alive) {
        st.c6ewald.alpha -= 0.02;
        if (st.c6ewald.alpha <= 0) { st.c6ewald.alive = false; st.c6ewald = null; }
      }
    };

    /* ---------- o diário da Oma Hedwig ---------- */
    var PANELS = ['book', 'calm', 'hold', 'vogt', 'pen', 'sign', 'spit', 'wind'];
    var panelCache = {};
    function* diarySeq(st) {
      var p = st.player;
      st.mode = 'cine';
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      TC.fx.tween('letterbox', 22, 30);
      var door = L._houseDoor;
      p.face = door > p.x ? 1 : -1; p.pose = 'run';
      while (Math.abs(p.x - door) > 3) { p.x += Math.sign(door - p.x) * 1.1; p.anim++; yield; }
      p.pose = 'idle'; p.face = 1;
      yield* co.wait(20);
      yield* st.say('d6.1');
      TC.audio.sfx('door');
      L._house.cv = L._houseOpen;
      L._house.lights = [{ dx: L._houseOpen.doorX, dy: 100, r: 60, col: '#ffc060', a: 1, flicker: true }];
      L._house.glows = [{ dx: L._houseOpen.doorX, dy: 100, r: 10, col: '#ffd080', a: 0.6, flicker: true }];
      yield* co.wait(40);
      yield* st.say('d6.2');
      TC.fx.fadeOut(30);
      TC.audio.stopMusic(1);
      yield* co.wait(34);
      st.banner = { kind: 'diary', t: 0, panel: 0, a: 1 };
      TC.fx.fadeIn(30);
      TC.audio.music('lore', 0.5);
      var lines = [['d6.h0'], ['d6.h1', 'd6.h1b'], ['d6.h2'], ['d6.h3'], ['d6.h4', 'd6.h4b'], ['d6.h5'], ['d6.h6'], ['d6.h7', 'd6.h7b']];
      for (var k = 0; k < PANELS.length; k++) {
        st.banner.panel = k; st.banner.pt = 0;
        yield* co.tween(st.banner, 'a', 1, k ? 20 : 1);
        yield* co.wait(24);
        for (var j = 0; j < lines[k].length; j++) yield* TC.ui.say(st.dlg, [{ who: 'hedwig', key: lines[k][j] }], { pos: 'bottom' });
        if (k < PANELS.length - 1) yield* co.tween(st.banner, 'a', 0, 16);
      }
      TC.fx.fadeOut(30);
      yield* co.wait(34);
      st.banner = null;
      TC.fx.fadeIn(30);
      TC.audio.music(L.music, 1);
      yield* co.wait(30);
      p.pose = 'shock';
      yield* st.say('d6.a', 'shock');
      p.pose = 'idle';
      yield* st.say('d6.b');
      yield* st.say('d6.c');
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
      st.save();
    }
    function drawDiary(st, c, b) {
      b.pt = (b.pt || 0) + 1;
      var kind = PANELS[b.panel || 0];
      var cv = panelCache[kind] || (panelCache[kind] = C6.diaryPanel(kind));
      var px = 16, py = 24, pw = 224, ph = 108, t = st.t;
      c.fillStyle = '#000'; c.fillRect(0, 0, SW, TC.H);
      c.globalAlpha = TC.clamp(b.a, 0, 1);
      // folha de papel atrás do quadro
      c.fillStyle = '#d8c090'; c.fillRect(px - 8, py - 8, pw + 16, ph + 16);
      c.fillStyle = '#a88a58'; c.fillRect(px - 8, py + ph + 6, pw + 16, 2);
      var bob = kind === 'calm' || kind === 'wind' ? Math.round(Math.sin(t * 0.04) * 1) : 0;
      c.drawImage(cv, px, py + bob);
      // detalhes animados: a chama da vela, o lampião, os olhos no escuro, a água
      if (cv.candle) TC.Lighting.glow(c, px + cv.candle.x, py + cv.candle.y, 10 + Math.sin(t * 0.3) * 1.5, '#ffc060', 0.6);
      if (cv.lamp) { var sw = kind === 'hold' ? Math.sin(t * 0.05) * 6 : 0; TC.Lighting.glow(c, px + cv.lamp.x + sw, py + cv.lamp.y, 22 + Math.sin(t * 0.3) * 2, '#f0c070', 0.45); }
      if (cv.eyes && (t >> 5) % 5 !== 4) { c.fillStyle = '#f8f0d8'; c.fillRect(px + cv.eyes.x, py + cv.eyes.y, 2, 1); c.fillRect(px + cv.eyes.x + 6, py + cv.eyes.y, 2, 1); }
      // moldura
      c.fillStyle = '#6a4a28'; c.fillRect(px - 2, py - 2, pw + 4, 2); c.fillRect(px - 2, py + ph, pw + 4, 2); c.fillRect(px - 2, py, 2, ph); c.fillRect(px + pw, py, 2, ph);
      TC.font.draw(c, TC.t('d6.cap' + (b.panel || 0)), 128, py + ph + 10, '#e8d4a8', { align: 'center', shadow: '#000' });
      c.globalAlpha = 1;
    }

    /* ---------- a sala de aula: a lista no quadro-negro ---------- */
    function* schoolSeq(st) {
      var p = st.player;
      st.mode = 'cine';
      p.setState('cine'); p.pose = 'idle'; p.vx = 0; p.face = 1;
      TC.fx.tween('letterbox', 22, 30);
      var pz = st.c6pelzActor, kids = st.c6kids || [];
      yield* co.wait(30);
      yield* TC.ui.say(st.dlg, [{ who: 'lena', key: 'k6.1' }], { pos: 'top' });
      st.c6board.writing = true;
      st.c6board.chars = Math.max(st.c6board.chars, 0);
      var w = 0;
      while (st.c6board.writing && w++ < 520) { st.c6board.chars += 0.13; yield; }
      st.c6board.chars = 999;
      p.pose = 'shock';
      yield* st.say('s6.1', 'shock');
      yield* st.say('s6.2', 'shock');
      // o vulto vira
      TC.audio.stopMusic(0.3);
      TC.audio.sfx('c6chain');
      if (pz) { pz.face = -1; pz.pose = 'point'; }
      TC.fx.shake(2, 20);
      yield* co.wait(30);
      yield* TC.ui.say(st.dlg, [{ who: 'pelz', key: 'p6.1' }], { pos: 'top' });
      p.pose = 'idle';
      yield* st.say('s6.3');
      yield* TC.ui.say(st.dlg, [{ who: 'pelz', key: 'p6.2' }], { pos: 'top' });
      // as crianças para dentro do saco, uma por uma
      for (var k = 0; k < kids.length; k++) {
        var kd = kids[k];
        kd.pose = 'scared';
        yield* co.wait(14);
        TC.audio.sfx('c6sack');
        for (var q = 0; q < 14; q++) st.parts.add({ x: kd.x + TC.rnd.range(-8, 8), y: kd.y - TC.rnd.range(4, 30), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.6, -0.2), life: 40, color: TC.rnd.pick(['#8a9a7a', '#a8b498', '#6a7a5a']), size: 2, fade: true });
        st.floatText(kd.x, kd.y - 40, TC.t(k === 1 ? 'c6.vo' : 'c6.mae'), '#c0d8ff');
        kd.alive = false;
        yield* co.wait(16);
      }
      st.c6kids = null;
      // e ele pula pela janela dos fundos
      if (pz) {
        pz.face = 1; pz.pose = 'walk';
        TC.audio.sfx('whoosh');
        for (var i = 0; i < 50; i++) { pz.x += 2.6; pz.y -= i < 25 ? 1.2 : -1.2; pz.alpha = 1 - i / 50; yield; }
        TC.audio.sfx('break'); TC.fx.shake(3, 14);
        pz.alive = false; st.c6pelzActor = null;
      }
      yield* st.say('s6.4');
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
      TC.audio.music(L.music, 0.8);
      st.save();
    }

    /* ---------- o chefe: o Pelznickel ---------- */
    L.bossSeq = function* (st, a) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround; });
      p.setState('cine'); p.pose = 'idle'; p.face = 1;
      TC.fx.tween('letterbox', 22, 40);
      st.ambientOverride = '#34304e';
      TC.audio.stopMusic(0.8);
      var half = Math.round(TC.diff().bossHp * 1.8) * 0.5;
      var startVogt = !!a.vogt && (a.bossHpLeft == null || a.bossHpLeft <= half + 0.5);
      var boss = st.spawnEnemy('c6pelz', a.x0 + 176, GY, { arena: a, vogt: startVogt });
      if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
      if (!startVogt && boss.hp <= boss.maxHp * 0.5) boss.hp = Math.ceil(boss.maxHp * 0.5) + 1;
      boss.state = 'intro'; boss.face = -1;
      st.boss = boss;
      if (!st.c6kidsack) { st.c6kidsack = new E.C6KidSack(a.x0 + 40, GY); st.deco.push(st.c6kidsack); }
      // pula lá de cima do telhado da estufa
      var y0 = -60;
      boss.y = y0;
      yield* co.wait(30);
      TC.audio.sfx('whoosh');
      for (var i = 1; i <= 34; i++) { boss.y = TC.lerp(y0, GY, TC.ease.inQuad(i / 34)); yield; }
      boss.y = GY;
      TC.fx.shake(5, 24); TC.audio.sfx('hit2'); TC.audio.sfx('c6chain');
      st.dust(boss.x - 20, GY); st.dust(boss.x + 20, GY);
      p.pose = 'shock';
      yield* co.wait(30);
      if (!a.seen) {
        a.seen = true;
        p.pose = 'idle';
        yield* st.say('bs6.1', null, 'arno', 'bottom');
        yield* st.say(startVogt ? 'v6.2' : 'bs6.2', null, startVogt ? 'vogt' : 'pelz', 'bottom');
        if (!startVogt) yield* st.say('bs6.3', null, 'arno', 'bottom');
      } else yield* co.wait(20);
      p.pose = 'idle';
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music(startVogt ? 'boss6b' : 'boss6');
      st.banner = { kind: 'fight', t: 0 };
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: startVogt ? 'hint.boss6b' : 'hint.boss6', t: 380 };
      yield* co.wait(60);
      if (st.banner && st.banner.kind === 'fight') st.banner = null;
    };

    /* o musgo queima: por baixo está o mestre-escola Johann Vogt */
    L.c6transform = function (st, boss) {
      st.cine = new TC.Script(transformSeq(st, boss));
    };
    function* transformSeq(st, boss) {
      var p = st.player, a = boss.arena;
      st.mode = 'cine';
      st.banner = null;
      st.killAllMinions();
      st.deco = st.deco.filter(function (d) { return !d.c6proj; });
      TC.audio.stopMusic(0.6);
      TC.fx.tween('letterbox', 22, 30);
      var w = 0;
      while (w++ < 120 && !(p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot' || p.state === 'attack'))) yield;
      p.setState('cine'); p.pose = 'idle'; p.vx = 0; p.face = boss.x > p.x ? 1 : -1;
      boss.state = 'transform'; boss.t = 0; boss.burnK = 0;
      TC.audio.sfx('c6fire');
      for (var i = 0; i < 110; i++) {
        boss.burnK = TC.clamp((i - 30) / 70, 0, 1);
        if (i % 2 === 0) for (var f = 0; f < 3; f++) st.parts.add({ x: boss.x + TC.rnd.range(-16, 16), y: boss.y - TC.rnd.range(0, 70), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-2.2, -0.6), life: TC.rnd.int(18, 36), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010', '#401008'], size: TC.rnd.int(1, 3), fade: true, layer: 1, add: true });
        if (i % 20 === 0) TC.audio.sfx(i % 40 ? 'flame' : 'c6fire');
        if (i % 6 === 0) st.parts.add({ x: boss.x + TC.rnd.range(-14, 14), y: boss.y - TC.rnd.range(10, 70), vx: TC.rnd.range(-0.3, 0.3), vy: -0.6, life: 80, color: '#3a3a40', size: 3, fade: true, wobble: 0.06 });
        yield;
      }
      boss.setForm('vogt');
      boss.burnK = null;
      boss.state = 'intro'; boss.t = 0;
      TC.fx.flash('#ffffff', 0.6, 0.03);
      TC.audio.sfx('c6chalk');
      a.vogt = true;
      p.pose = 'shock';
      yield* co.wait(30);
      if (!a.vogtSeen) {
        a.vogtSeen = true;
        yield* st.say('v6.1', 'shock', 'arno', 'bottom');
        yield* st.say('v6.2', null, 'vogt', 'bottom');
      }
      p.pose = 'idle';
      TC.fx.tween('letterbox', 0, 30);
      TC.audio.music('boss6b', 0.3);
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.boss6b', t: 320 };
    }

    /* ---------- vitória: o mestre-escola de joelhos ---------- */
    L.clearSeq = function* (st) {
      var p = st.player, boss = null;
      st.enemies.forEach(function (e) { if (e.isBoss) boss = e; });
      st.mode = 'cine';
      st.killAllMinions();
      st.deco = st.deco.filter(function (d) { return !d.c6proj; });
      if (p.inSack) { p.inSack = false; st.c6sack = null; }
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      if (boss) p.face = boss.x > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 40);
      st.ambientOverride = null;
      yield* co.wait(50);
      yield* TC.ui.say(st.dlg, [{ who: 'vogt', face: 'sad', key: 'c6e.1' }], { pos: 'top' });
      yield* st.say('c6e.2');
      yield* co.wait(20);
      TC.fx.tween('letterbox', 0, 30);
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { return TC.Ending6Scene ? new TC.Ending6Scene({ score: score }) : new TC.TitleScene(); };
  }
})();
