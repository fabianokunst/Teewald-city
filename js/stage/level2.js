'use strict';
/* Teewald City — Fase 2: "A Trilha das Fitas"
   Da praça da igreja, pela rua da cervejaria, o pavilhão novo da Festa da Batata, a atafona dos Weber,
   a serraria Kessler e a ervateira dos Becker, até o toco do Pinheiro Velho, onde o Mão-Comprida volta para dormir. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;

  TC.buildLevel2 = function () {
    var A = TC.ART, C2 = A.ch2Init();
    var W = 300, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 2, music: 'stage2', cardNum: 'stage2.num', cardName: 'stage2.name', comboY: 38
    };
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    var x, i;

    /* ---------- chão e estilos ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) {
      L.style[x] = x < 10 ? 'square' : x < 56 ? 'street' : x < 99 ? 'deck' : x < 146 ? 'grass' : x < 198 ? 'sawdust' : x < 264 ? 'forest' : 'clearing';
    }
    // palco da bandinha (plataforma) dentro do pavilhão
    fill(88, 93, 10, 10, 2);
    // arroio da atafona: ponte de tábuas com duas tábuas soltas
    fill(116, 127, 12, 12, 5);
    fill(116, 127, 13, 13, 4);
    [120, 124].forEach(function (gx) { set(gx, 12, 0); });
    fill(114, 115, 12, 13, 3);
    fill(128, 129, 12, 13, 3);
    fill(121, 122, 9, 9, 2);
    // pilhas de toras na serraria (plataformas vazadas; o desenho vem do cenário)
    fill(160, 165, 10, 10, 2);
    fill(161, 164, 8, 8, 2);
    fill(184, 187, 10, 10, 2);
    // taipas na ervateira
    fill(222, 225, 11, 11, 3);
    fill(240, 242, 10, 11, 3);
    fill(243, 244, 11, 11, 3);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1997);
    var seed = 40;
    function back(cv, px, py, z, extra) {
      var o = { cv: cv, x: Math.round(px), y: Math.round(py), z: z || 0 };
      if (extra) for (var k in extra) o[k] = extra[k];
      L.back.push(o);
      return o;
    }
    function lamp(tx, broken) {
      var cv = A.lampPost(118);
      var px = tx * TS;
      var o = back(cv, px - cv.poleX, GY + 3 - cv.height, 3);
      o.lights = [
        { dx: cv.lampX, dy: cv.lampY + 4, r: 70, col: '#ffb060', a: 1, flicker: broken },
        { dx: cv.lampX, dy: cv.height - 6, r: 40, col: '#ffc070', a: 0.6, flicker: broken }
      ];
      o.glows = [{ dx: cv.lampX, dy: cv.lampY + 1, r: 9, col: '#ffe0a0', a: 0.9, flicker: broken }, { dx: cv.lampX, dy: cv.lampY + 2, r: 22, col: '#ffa040', a: 0.25, flicker: broken }];
      L.wires.push({ x: o.x + 1, y: o.y + cv.wireY, x2: o.x + 18 });
      return o;
    }
    function house(px, opt) {
      opt = opt || {};
      opt.seed = seed++;
      if (opt.lit == null) opt.lit = 0.25;
      var cv = A.house(opt);
      var o = back(cv, px, GY + 1 - cv.height, 0);
      o.lights = cv.lights.map(function (l) { return { dx: l.x, dy: l.y, r: 18, col: '#ffc070', a: 0.7 }; });
      o.glows = cv.lights.map(function (l) { return { dx: l.x, dy: l.y, r: 7, col: '#ffd080', a: 0.25 }; });
      return o;
    }
    function tree(px, kind, h, z) {
      var cv = kind === 'a' ? A.araucaria(seed++, h || r.int(150, 200)) : kind === 'p' ? A.pine(seed++, h || r.int(80, 110)) : kind === 'e' ? C2.erva(seed++, h || r.int(36, 52)) : A.autumnTree(seed++, h || r.int(80, 104));
      back(cv, px - cv.baseX, GY + 2 - cv.height, z == null ? 1 : z);
    }
    function sign(tx, key, cv, y) {
      if (cv) back(cv, tx * TS - Math.round(cv.width / 2), y != null ? y : GY + 2 - cv.height, 2);
      L.signs.push({ x: tx * TS, y: GY, key: key });
    }

    // --- praça da igreja (de onde o Arno sai) ---
    (function () {
      var cv = A.church();
      var o = back(cv, 0, GY + 2 - cv.height, 0);
      o.lights = [
        { dx: 27, dy: 150, r: 26, col: '#ffc070', a: 0.6 },
        { dx: cv.width - 27, dy: 150, r: 26, col: '#ffc070', a: 0.6 },
        { dx: cv.doorX, dy: cv.doorY + 10, r: 34, col: '#ffb060', a: 0.7 }
      ];
    })();
    tree(-6 * TS + 4, 'a', 190, -1);
    lamp(10, false);

    // --- rua da cervejaria ---
    var brewery = house(13 * TS, { w: 144, floors: 2, lit: 0.6, wall: 'yellow', roof: 'eave', doorPanel: 2 });
    sign(17, 'sign2.brewery', C2.sign(104, 22, [['CERVEJARIA SCHMITT', '#f0e0b0'], ['CHOPP COLONIAL - 1923', '#e8c070']]), brewery.y + brewery.cv.height - 76);
    // barris empilhados na frente
    (function () {
      var cv = TC.canvas(40, 32), c = cv.ctx, b = A.barrel_ || A.barrel();
      c.drawImage(b, 0, 16); c.drawImage(b, 14, 16); c.drawImage(b, 7, 0);
      back(cv, 23 * TS, GY + 1 - 32, 2);
    })();
    lamp(22, false);
    tree(25 * TS, 'o', 96);
    house(27 * TS, { w: 96, floors: 2, lit: 0.2 });
    lamp(34, true);
    tree(34 * TS + 4, 'a', 180, 0);
    var club = house(36 * TS, { w: 112, floors: 2, lit: 0.3, wall: 'white', roof: 'gable' });
    (function () {
      var cv = C2.sign(96, 30, [['SOCIEDADE DE TIRO', '#f0e0b0'], ['TEEWALD - 1898', '#e8c070']], { bg: '#2a3a2a', trim: '#5a7a5a' });
      // alvo
      var c = cv.ctx;
      [[7, '#e8e0d0'], [5, '#c03028'], [3, '#e8e0d0'], [1, '#c03028']].forEach(function (q) { c.fillStyle = TC.col(q[1]); TC.fillCircle(c, 88, 15, q[0]); });
      sign(42, 'sign2.tiro', cv, club.y + club.cv.height - 74);
    })();
    lamp(46, false);
    house(48 * TS, { w: 112, floors: 3, lit: 0.15, wall: 'pink' });
    tree(55 * TS, 'a', 196, 0);
    [[20, 'sign2.missing2'], [31, 'sign2.rainha']].forEach(function (p) {
      back(A.poster(), p[0] * TS - 6, 146, 2);
      L.signs.push({ x: p[0] * TS, y: GY, key: p[1] });
    });

    // --- pavilhão da Festa da Batata ---
    var pav = back(C2.pavilion(42 * TS), 56 * TS, GY + 2 - 150, 0);
    pav.lights = [];
    pav.glows = [];
    for (x = 26; x < 42 * TS; x += 48) {
      var broken = (x / 48 | 0) % 3 === 1;
      pav.lights.push({ dx: x, dy: 60, r: 40, col: '#ffc070', a: 0.75, flicker: broken });
      pav.glows.push({ dx: x, dy: 57, r: 4, col: '#fff0c0', a: 0.9, flicker: broken });
    }
    (function () {
      var st = C2.stage();
      back(st, 88 * TS, 160 - 36, 1);
    })();
    sign(60, 'sign2.pavilion', A.signPost());
    // sacos de batata ao lado do palco
    (function () {
      var cv = TC.canvas(48, 28), c = cv.ctx, s = C2.sackImg;
      c.drawImage(s, 0, 12); c.drawImage(s, 13, 12); c.drawImage(s, 26, 12); c.drawImage(s, 6, 0); c.drawImage(s, 19, 0);
      back(cv, 82 * TS, GY + 1 - 28, 2);
    })();

    // --- atafona dos Weber e o arroio ---
    tree(100 * TS, 'o', 100);
    var millCv = C2.mill();
    var mill = back(millCv, 104 * TS, GY + 2 - millCv.height, 0);
    mill.lights = [{ dx: 67, dy: 45, r: 14, col: '#ffb060', a: 0.4 }];
    L._wheel = { x: mill.x + millCv.wheelX, y: mill.y + millCv.wheelY };
    sign(103, 'sign2.mill', A.signPost());
    (function () {
      var cv = TC.canvas(16 * TS, 40), c = cv.ctx;
      for (var y = 0; y < 40; y++) { c.fillStyle = TC.mix('#0a0c1a', '#05060c', y / 40); c.fillRect(0, y, cv.width, 1); }
      var rr = TC.RNG(12);
      for (var k = 0; k < 40; k++) {
        var rx = rr.int(0, cv.width), rh = rr.int(6, 16);
        c.fillStyle = TC.col(rr() < 0.5 ? '#1a2a1e' : '#22362a');
        c.fillRect(rx, 14 - rh, 1, rh + 2);
      }
      back(cv, 114 * TS, GY - 14, -1);
    })();
    tree(113 * TS, 'a', 170);
    tree(131 * TS, 'a', 190);
    tree(137 * TS, 'o', 92);
    lamp(130, true);
    tree(141 * TS, 'p', 100);

    // --- serraria Kessler ---
    var shedCv = C2.shed(30 * TS);
    back(shedCv, 147 * TS, GY + 2 - shedCv.height, 0);
    var fnm = C2.fnm();
    back(fnm, 149 * TS, GY + 3 - fnm.height, 1);
    L._fnm = 149 * TS + 75;
    var pile1 = C2.logPile(6, 2, 31), pile2 = C2.logPile(4, 2, 32), pile3 = C2.logPile(4, 2, 33);
    back(pile1, 160 * TS - 2, 160 - 4, 2);
    back(pile2, 161 * TS - 2, 128 - 4, 2);
    back(pile3, 184 * TS - 2, 160 - 4, 2);
    L._pile = { x: 162.5 * TS, y: 128 };
    var bench = C2.sawBench();
    back(bench, 170 * TS, GY + 1 - bench.height, 2);
    L._saw = { x: 170 * TS + 40, y: GY + 1 - bench.height + 8 };
    sign(147, 'sign2.sawmill', A.signPost());
    lamp(158, false);
    lamp(178, true);
    for (x = 190 * TS; x < 197 * TS; x += 40) back(C2.logPile(2, 1, x), x, GY + 2 - 20, 1);

    // --- a ervateira dos Becker ---
    sign(200, 'sign2.ervateira', C2.sign(124, 22, [['ERVATEIRA BECKER', '#f0e0b0'], ['ERVA SAPECADA NO CARIJÓ', '#c8d8a0']], { legs: 12, bg: '#2a3a24', trim: '#5a7a4a' }));
    var carijo = C2.carijo();
    var cj = back(carijo, 210 * TS, GY + 2 - carijo.height, 1);
    L._fire = { x: cj.x + carijo.fireX, y: GY - 1 };
    for (x = 198; x < 262; x += r.int(3, 6)) {
      if (x >= 209 && x <= 218) continue;
      var k2 = r();
      tree(x * TS + r.int(0, 10), k2 < 0.35 ? 'a' : k2 < 0.75 ? 'e' : 'p', null, k2 < 0.35 ? 0 : 1);
    }
    for (x = 226 * TS; x < 240 * TS; x += 64) back(A.fence(64), x, GY + 1 - 30, 1);
    lamp(236, true);

    // --- a clareira do Pinheiro Velho ---
    [266, 274, 296, 299].forEach(function (tx, k) { tree(tx * TS, 'a', 200 + k * 6, 0); });
    tree(270 * TS, 'e', 46);
    tree(278 * TS, 'e', 40);
    var stump = C2.stump();
    L._stump = back(stump, 282 * TS + 128 - stump.width / 2, GY + 4 - stump.height, 1);
    L._stump.lights = [{ dx: stump.crackX, dy: stump.crackY, r: 30, col: '#8a3a5a', a: 0.4 }];
    sign(264, 'sign2.stump', C2.sign(88, 22, [['HIER WIRD NICHT', '#f0e0c0'], ['GEHAUEN - 1852', '#e8c080']], { legs: 12, bg: '#3a2a1c' }));

    /* ---------- primeiro plano (silhuetas) ---------- */
    var grass = TC.sprite([
      '..k......k...k..',
      '..k..k...k..kk..',
      '.kk..k..kk..k...',
      '.k..kk..k..kk.k.',
      'kk..k..kk.kk..k.',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#04050a' });
    var fern = TC.sprite([
      '......k.......',
      '...k..k...k...',
      '....k.k..k....',
      'k....kkkk....k',
      '.kk..kkkk..kk.',
      '...kkkkkkkk...',
      'kkkkkkkkkkkkkk'
    ], { k: '#04050a' });
    for (x = 120; x < L.pxW; x += r.int(140, 300)) L.front.push({ cv: x > 198 * TS ? fern : grass, x: x, y: x > 198 * TS ? 217 : 218 });

    /* ---------- itens, caixotes, barris e sacos ---------- */
    [[16, 'barrel', 'chimarrao'], [21, 'barrel', 'bolinho'], [40, 'crate', 'balas'], [43, 'crate', 'balas'], [52, 'crate', 'cuca'],
      [64, 'sack', 'bolinho'], [75, 'sack', 'linguica'], [80, 'sack', 'balas'], [96, 'barrel', 'chimarrao'],
      [108, 'crate', 'cuca'], [134, 'crate', 'balas'], [143, 'barrel', 'linguica'],
      [156, 'crate', 'balas'], [175, 'crate', 'cuca'], [192, 'barrel', 'chimarrao'],
      [205, 'crate', 'linguica'], [228, 'crate', 'balas'], [249, 'barrel', 'cuca'], [258, 'crate', 'balas'], [276, 'barrel', 'chimarrao']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[89, 10], [90, 10], [92, 10], [121, 9], [122, 9], [162, 8], [163, 8], [185, 10], [186, 10], [223, 11], [241, 10]].forEach(function (p) {
      L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 163 * TS + 8, y: 8 * TS - 20 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('crow', 47, 80);
    sp('possesso', 52, GY, { kind: 'colono' });
    sp('ghost', 66, 150);
    sp('flame', 101, 70);
    sp('wolf', 112, GY, { howl: true });
    sp('crow', 126, 60, { fly: -1 });
    sp('possesso', 172, GY, { kind: 'colona' });
    sp('crow', 166, 70, { fly: -1 });
    sp('ghost', 206, GY, { rise: true }); sp('ghost', 209, GY, { rise: true });
    sp('wolf', 220, GY);
    sp('flame', 250, 80);
    sp('possesso', 254, GY, { kind: 'colono' });

    /* ---------- arenas ---------- */
    function pc(side, kind) { return { t: 'possesso', side: side, y: GY, kind: kind }; }
    function wf(side) { return { t: 'wolf', side: side, y: GY }; }
    function g(side, y) { return { t: 'ghost', side: side, y: y || 140 }; }
    function gr(at) { return { t: 'ghost', rise: at }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function s(side) { return { t: 'shade', side: side }; }
    function cr(side) { return { t: 'crow', side: side, y: 60 }; }
    L.arenas = [
      { x0: 26 * TS, waves: [[pc('r', 'colono')], [pc('l', 'colona'), pc('r', 'colono')], [pc('r'), g('l', 140), cr('r')]] },
      { x0: 70 * TS, waves: [[pc('l'), pc('r')], [f('r'), pc('l', 'colona'), g('r', 130)], [pc('r'), pc('l'), s('r'), f('l')]] },
      { x0: 131 * TS, waves: [[wf('r')], [wf('l'), g('r', 150)], [wf('r'), pc('l'), cr('l')]] },
      { x0: 176 * TS, waves: [[pc('r', 'colono'), pc('l', 'colona')], [wf('r'), s('l')], [{ t: 'possesso', side: 'r', y: GY, npc: 'kessler' }]] },
      { x0: 228 * TS, waves: [[gr(60), gr(190), wf('r')], [wf('l'), wf('r')], [f('l'), f('r'), pc('r'), gr(120)]] },
      { x0: 262 * TS, waves: [[wf('l'), pc('r'), f('r')], [s('l'), s('r'), wf('r'), gr(130)]] },
      { x0: 282 * TS, boss: true, waves: [] }
    ];
    // ondas: possuídos e lobisomens entram pelas bordas (o tipo de colono e o Kessler vêm nas opções)
    L.arenas.forEach(function (a) {
      a.waves.forEach(function (w) { w.forEach(function (sx) { if (sx.kind || sx.npc) sx.opt = { kind: sx.kind, npc: sx.npc }; }); });
    });
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 26 * TS + 30 }, { x: 70 * TS + 30 }, { x: 104 * TS + 8, shrine: true }, { x: 131 * TS + 30 },
      { x: 146 * TS + 8, shrine: true }, { x: 176 * TS + 30 }, { x: 199 * TS + 8, shrine: true },
      { x: 228 * TS + 30 }, { x: 262 * TS + 30 }, { x: 280 * TS + 8, shrine: true }, { x: 282 * TS + 30 }
    ];
    L.arenas[0].cp = 1; L.arenas[1].cp = 2; L.arenas[2].cp = 4; L.arenas[3].cp = 6;
    L.arenas[4].cp = 8; L.arenas[5].cp = 9; L.arenas[6].cp = 11;
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });

    /* falas ao passar por certos pontos */
    L.barks = [
      { x: 57 * TS, key: 'b2.pavilion' },
      { x: 105 * TS, key: 'b2.mill' },
      { x: 147 * TS + 8, key: 'b2.sawmill' },
      { x: 151 * TS, key: 'b2.fnm' },
      { x: 201 * TS, key: 'b2.ervateira' },
      { x: 258 * TS, key: 'b2.clearing', face: 'shock' }
    ];

    /* as fitas bentas: o rastro que o Mão-Comprida deixou (a 5ª o Seu Kessler entrega) */
    L.ribbonAt = [
      { x: 19 * TS, y: 162 }, { x: 91 * TS, y: 138 }, { x: 121.5 * TS, y: 128 }, { x: 165 * TS, y: 112 },
      { x: 195 * TS, y: 162 }, { x: 214 * TS, y: 150 }, { x: 279 * TS, y: 160 }
    ];

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#4c4c86', fog: 0.2 },
      { x: 56 * TS, ambient: '#524a80', fog: 0.22 },
      { x: 100 * TS, ambient: '#40467a', fog: 0.35 },
      { x: 146 * TS, ambient: '#463e6c', fog: 0.3 },
      { x: 198 * TS, ambient: '#383a66', fog: 0.5 },
      { x: 262 * TS, ambient: '#34346a', fog: 0.55 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C2);
    return L;
  };

  /* =================================================================== */
  function hooks(L, C2) {
    var A = TC.ART, E = TC.ent;
    var baseT = null;

    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#020309'], [0.45, '#0a0c28'], [0.8, '#1a1c46'], [1, '#2a2a5c']], 88, 0.006);
      bg.tw = A.twinkles(SW, 110, 30, 37);
      bg.moon = A.moon(13);
      bg.far = A.hills(512, 70, { seed: 15, color: '#1c2046', rim: '#363e78', base: 0.45, amp: 0.65, trees: 50, treeMin: 5, treeMax: 10, period: 6 });
      bg.mid = A.hills(512, 90, { seed: 19, color: '#111430', rim: '#262c58', base: 0.38, amp: 0.55, trees: 80, treeMin: 8, treeMax: 18, period: 6, arauc: 0.85 });
      var tl = TC.canvas(768, 140), c = tl.ctx;
      var r = TC.RNG(5151);
      for (var i = 0; i < 40; i++) {
        var h = r.int(70, 135);
        var tr = r() < 0.8 ? A.araucaria(700 + i, h, { sil: '#0b0d20', rim: '#1c2350' }) : A.pine(760 + i, Math.round(h * 0.6), { sil: '#0b0d20' });
        var tx = r.int(0, 767);
        c.drawImage(tr, tx - tr.baseX, 140 - tr.height);
        c.drawImage(tr, tx - tr.baseX - 768, 140 - tr.height);
        c.drawImage(tr, tx - tr.baseX + 768, 140 - tr.height);
      }
      c.fillStyle = TC.col('#0b0d20');
      c.fillRect(0, 128, 768, 12);
      bg.trees = tl;
      bg.fog = A.fog(512, 52, 23, '#8a8ab8');
      bg.fogFront = A.fog(512, 40, 35, '#9a9ac8');
      return bg;
    };

    L.tileFor = function (code, open, st, v) {
      var T = C2.T;
      if (!baseT) baseT = A.tiles();
      if (code === 1) {
        if (st === 'deck') return open ? T.deckTop[v] : T.deckFill;
        if (st === 'sawdust') return open ? T.sawdustTop[v] : baseT.dirt[v];
        if (st === 'forest' || st === 'clearing') return open ? T.grimpaTop[v] : baseT.dirt[v];
      }
      if (code === 3 && (st === 'forest' || st === 'clearing')) return open ? T.taipaTop[v] : T.taipa[v];
      if (code === 2 && st === 'sawdust') return false;
      return null;
    };

    /* ---------- início: revólver, fitas, cenário animado ---------- */
    L.init = function (st, save) {
      var D = TC.diff();
      st.ribbons = (save && save.ribbons) ? save.ribbons.slice(0, 7) : [false, false, false, false, false, false, false];
      while (st.ribbons.length < 7) st.ribbons.push(false);
      st.gun = { ammo: save && save.ammo != null ? save.ammo : 6 };
      st.teaserDone = !!(save && save.teaser);
      st.kesslerDone = !!(save && save.kessler);
      st.fireGun = function (p) { TC.ch2.fireGun(st, p); };
      // sacos de batata no lugar dos caixotes marcados como 'sack'
      st.props = st.props.map(function (pr) { return pr.kind === 'sack' ? new E.Sack(pr.x, pr.y, pr.drop) : pr; });
      // se o capítulo foi retomado depois da serraria, a fita do Kessler fica no caminho
      if (L.arenas[3].done && !st.kesslerDone) st.kesslerDone = true;
      L.ribbonAt.forEach(function (rp, idx) {
        if (st.ribbons[idx]) return;
        if (idx === 4 && !st.kesslerDone) return;
        st.deco.push(new E.Ribbon(idx, rp.x, rp.y));
      });
      st.deco.push(new E.Wheel(L._wheel.x, L._wheel.y));
      st.deco.push(new E.Saw(L._saw.x, L._saw.y));
      st.deco.push(new E.Fire(L._fire.x, L._fire.y, 56));
      // inimigos derrotados às vezes deixam cair balas
      var baseKill = st.kill;
      st.kill = function (e) {
        baseKill.call(st, e);
        if (e && !e.isBoss && !st.noDrops && e.y < L.pxH && st.gun.ammo < 12 && TC.rnd() < 0.08 + D.drop * 0.5) {
          st.items.push(new E.Item('balas', e.x, Math.min(e.y, GY - 8), true));
        }
      };
      if (TC.params.ribbons) for (var k = 0; k < Math.min(7, +TC.params.ribbons); k++) st.ribbons[k] = true;
    };

    L.saveExtra = function (st, s) {
      s.ribbons = st.ribbons.slice();
      s.ammo = st.gun ? st.gun.ammo : 6;
      s.teaser = st.teaserDone;
      s.kessler = st.kesslerDone;
    };

    L.onRespawn = function (st) {
      // o revólver nunca fica vazio de vez depois de um tombo
      if (st.gun && st.gun.ammo < 3) st.gun.ammo = 3;
      st.ambientOverride = null;
    };

    /* ---------- depois do cartão da fase: a missão ---------- */
    L.afterCard = function* (st) {
      st.banner = { kind: 'mission', t: 0 };
      TC.audio.sfx('ribbon');
      var w = 0;
      while (w++ < 240 && !(w > 40 && (TC.input.pressed('confirm') || TC.input.pressed('attack') || TC.input.pressed('start')))) yield;
      st.banner = null;
      st.hint = { key: 'hint.gun', t: 480 };
    };
    L.drawBanner = function (st, c, b) {
      if (b.kind !== 'mission') return;
      var k = TC.clamp(b.t / 20, 0, 1);
      var h = Math.round(74 * TC.ease.outCubic(k));
      TC.ui.box(c, 20, 80 - h / 2, 216, Math.max(4, h), 'dark', 0.94);
      if (k < 1) return;
      var big = TC.ui.bigText(TC.t('mission'), 2, '#ffe0a0', '#c07030', '#06050c');
      c.drawImage(big, 128 - Math.floor(big.width / 2), 48);
      var lines = TC.font.wrap(TC.t('mission.2'), 190);
      lines.forEach(function (ln, i) { TC.font.draw(c, ln, 128, 76 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
      for (var i = 0; i < 7; i++) c.drawImage(C2.ribbonIcon[i], 128 - 24 + i * 7, 104);
    };

    /* ---------- HUD: balas do 38 e fitas encontradas ---------- */
    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, 92, 11);
      c.drawImage(C2.gunIcon, 5, 27);
      var am = st.gun ? st.gun.ammo : 0;
      TC.font.draw(c, (am < 10 ? '0' : '') + am, 17, 27, am ? '#ffe0a0' : ((st.t >> 3) % 2 ? '#ff6050' : '#802020'), { shadow: '#000' });
      for (var i = 0; i < 7; i++) c.drawImage(st.ribbons[i] ? C2.ribbonIcon[i] : C2.ribbonIconOff, 40 + i * 7, 28);
    };

    /* ---------- fita encontrada: um verso da reza da Oma Hedwig ---------- */
    L.collectRibbon = function (st, rib) {
      var idx = rib.idx;
      if (st.ribbons[idx]) return;
      st.ribbons[idx] = true;
      var n = st.ribbons.filter(Boolean).length;
      TC.audio.sfx('ribbon');
      st.flashLight = { x: rib.x, y: rib.y, t: 10 };
      for (var k = 0; k < 18; k++) st.parts.add({ x: rib.x, y: rib.y, vx: TC.rnd.range(-1.5, 1.5), vy: TC.rnd.range(-1.8, 0.4), life: 40, color: TC.rnd.pick([C2.RIBBON_COLS[idx], '#ffffff', '#ffe080']), size: 1, fade: true, layer: 1 });
      st.player.hp = Math.min(st.player.maxHp, st.player.hp + 1);
      st.save();
      var entries = [{ who: 'fita', face: idx, text: TC.t('rib.count').replace('%n', n) + '\n«' + TC.t('rib.v' + idx) + '»' }];
      if (n === 1) entries.push({ who: 'arno', key: 'rib.first' });
      if (n === 4) entries.push({ who: 'arno', key: 'rib.mid' });
      if (n === 7) entries.push({ who: 'arno', key: 'rib.last' });
      st.mode = 'dialog';
      st.dlg.open(entries, { pos: 'top' });
    };

    /* ---------- eventos da fase ---------- */
    L.update = function (st) {
      var p = st.player;
      // a aparição na serraria
      if (!st.teaserDone && st.mode === 'play' && !st.arena && p.x > L._pile.x - 120 && p.onGround && p.state === 'normal' &&
        st.enemies.every(function (e) { return !e.alive || e.dying || Math.abs(e.x - p.x) > 220; })) {
        st.teaserDone = true;
        st.cine = new TC.Script(teaserSeq(st));
      }
      // escuridão quando o chefe passa da metade
      if (st.boss && st.boss.state !== 'intro' && st.mode === 'play') st.ambientOverride = st.boss.phase2() ? '#1a1a3c' : '#262650';
    };

    function* teaserSeq(st) {
      var p = st.player;
      st.mode = 'cine';
      p.setState('cine'); p.pose = 'idle'; p.face = 1; p.vx = 0;
      TC.fx.tween('letterbox', 22, 30);
      TC.audio.stopMusic(1);
      var d = new E.DemonProp(L._pile.x, L._pile.y);
      d.face = -1; d.pose = 'idle'; d.alpha = 0;
      d.ribbons = 7 - st.ribbons.filter(Boolean).length - (st.kesslerDone ? 0 : 1);
      st.deco.push(d);
      TC.audio.sfx('skitter');
      yield* co.wait(20);
      TC.audio.music('hunt');
      for (var i = 0; i < 50; i++) { d.alpha = i / 50; yield; }
      d.alpha = 1;
      p.pose = 'shock';
      yield* st.say('tz.1', 'shock');
      d.pose = 'scream';
      TC.audio.sfx('demon');
      TC.fx.shake(3, 40);
      yield* co.wait(70);
      // salta para o mato e some
      d.pose = 'leap';
      TC.audio.sfx('wood');
      for (i = 0; i < 70; i++) {
        d.x += 4.2; d.y += -3.4 + i * 0.12; d.face = 1;
        if (i % 6 === 0) st.parts.add({ x: d.x - 20, y: d.y - 10, vx: -1, vy: 1, ay: 0.1, life: 30, color: TC.rnd.pick(['#c89a64', '#6a4024']), size: 2, fade: true });
        yield;
      }
      d.alive = false;
      p.pose = 'idle';
      yield* co.wait(20);
      yield* st.say('tz.2');
      TC.fx.tween('letterbox', 0, 30);
      TC.audio.music(L.music);
      p.setState('normal');
      st.mode = 'play';
      st.save();
    }

    /* o Seu Kessler, liberto na serraria */
    L.onFreed = function (st, e) {
      var npc = new E.Npc('kessler', e.x, e.y, e.face);
      npc.pose = 'kneel';
      st.deco.push(npc);
      st.cine = new TC.Script(kesslerSeq(st, npc));
    };
    function* kesslerSeq(st, npc) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'attack' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      p.face = npc.x > p.x ? 1 : -1;
      npc.face = -p.face;
      TC.fx.tween('letterbox', 22, 30);
      yield* co.wait(40);
      function* k(key, who, face) { yield* TC.ui.say(st.dlg, [{ who: who || 'kessler', key: key, face: face }], { pos: 'top' }); }
      yield* k('k.1');
      yield* k('k.2', 'arno');
      npc.pose = 'stand';
      yield* co.wait(20);
      yield* k('k.3');
      yield* k('k.4');
      yield* k('k.5');
      yield* k('k.6');
      // entrega a fita que ficou presa na serragem
      var rp = L.ribbonAt[4];
      rp.x = npc.x + npc.face * 10; rp.y = npc.y - 22;
      st.deco.push(new E.Ribbon(4, rp.x, rp.y));
      TC.audio.sfx('ribbon');
      st.kesslerDone = true;
      yield* co.wait(30);
      yield* k('k.7', 'arno');
      yield* k('k.8');
      p.pose = 'shock';
      yield* k('k.9', 'arno', 'shock');
      yield* k('k.10');
      p.pose = 'idle';
      yield* co.wait(20);
      // vai embora para a igreja
      npc.pose = 'walk'; npc.face = -1; npc.vx = -0.6;
      for (var i = 0; i < 90; i++) { if (i > 50) npc.alpha = 1 - (i - 50) / 40; yield; }
      npc.alive = false;
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
    }

    /* ---------- o chefe: o Demônio Antigo ---------- */
    L.bossSeq = function* (st, a) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround; });
      p.setState('cine'); p.pose = 'idle'; p.face = 1;
      TC.audio.stopMusic(1.5);
      TC.fx.tween('letterbox', 22, 40);
      st.ambientOverride = '#262650';
      yield* co.wait(40);
      if (!a.seen) yield* st.say('boss2.a1');
      TC.audio.sfx('skitter');
      TC.fx.shake(1, 30);
      yield* co.wait(30);
      var boss = st.spawnEnemy('demon', a.x0 + 196, -70, { arena: a });
      if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
      st.boss = boss;
      yield* co.until(function () { return boss.landedAt && boss.t > boss.landedAt + 34; });
      TC.audio.sfx('demon');
      TC.fx.shake(5, 40);
      TC.fx.flash('#c0d8ff', 0.3, 0.02);
      p.pose = 'shock';
      yield* co.wait(40);
      if (!a.seen) {
        a.seen = true;
        yield* st.say('boss2.d1', null, 'demon', 'bottom');
        yield* st.say('boss2.d2', null, 'demon', 'bottom');
        yield* st.say('boss2.a2', 'shock', 'arno', 'bottom');
        p.pose = 'idle';
        yield* st.say('boss2.a3', null, 'arno', 'bottom');
      }
      p.pose = 'idle';
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music('boss2');
      st.banner = { kind: 'fight', t: 0 };
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.boss2', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    };

    /* ---------- vitória: a amarração com as sete fitas, depois a contagem ---------- */
    L.clearSeq = function* (st) {
      var p = st.player;
      var demon = null;
      st.enemies.forEach(function (e) { if (e.isBoss) demon = e; });
      st.mode = 'cine';
      st.killAllMinions();
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      TC.fx.tween('letterbox', 22, 40);
      // o Arno se afasta do bicho caído (para o lado do toco) antes de rezar
      if (demon) {
        var mid = L.arenas[6].x0 + SW / 2;
        var tx = TC.clamp(demon.x + (demon.x > mid ? -86 : 86), L.arenas[6].x0 + 24, L.arenas[6].x0 + SW - 24);
        if (Math.abs(p.x - tx) > 4) {
          p.pose = 'run'; p.face = tx > p.x ? 1 : -1;
          while (Math.abs(p.x - tx) > 2) { p.x += p.face * 1.4; p.anim++; yield; }
          p.pose = 'idle';
        }
        p.face = demon.x > p.x ? 1 : -1;
      }
      yield* co.wait(50);
      yield* st.say('bind.1');
      TC.audio.music('church');
      var binds = [];
      for (var i = 0; i < 7; i++) {
        var b = new Bind(i, p.x, p.y - 22, demon || { x: p.x + 60, y: p.y });
        binds.push(b);
        st.deco.push(b);
        TC.audio.sfx('ribbon');
        // a cena congela os enfeites enquanto há diálogo: as fitas são movidas aqui mesmo
        st.dlg.open([{ who: 'arno', text: '«' + TC.t('rib.v' + i) + '»' }], { pos: 'top' });
        while (st.dlg.active) { binds.forEach(function (bb) { bb.update(st); }); if (demon) demon.t++; yield; }
      }
      // o bicho se desfaz em cinza, sugado para dentro do toco
      TC.audio.sfx('demon');
      TC.fx.flash('#ffffff', 1, 0.02);
      TC.fx.shake(4, 80);
      var sx = L._stump.x + L._stump.cv.crackX, sy = L._stump.y + L._stump.cv.crackY;
      for (var k = 0; k < 110; k++) {
        if (demon) {
          demon.alpha = Math.max(0, 1 - k / 90);
          for (var q = 0; q < 3; q++) {
            var ax = demon.x + TC.rnd.range(-40, 40), ay = demon.y - TC.rnd.range(4, 60);
            st.parts.add({ x: ax, y: ay, vx: (sx - ax) / 50, vy: (sy - ay) / 50, life: 50, colors: ['#e8e0d0', '#8a8090', '#3a3040'], size: TC.rnd.int(1, 2), fade: true });
          }
        }
        yield;
      }
      if (demon) demon.alive = false;
      binds.forEach(function (bb) { bb.free = true; });
      st.ambientOverride = null;
      TC.audio.stopMusic(2);
      yield* co.wait(60);
      yield* st.say('bind.2');
      TC.fx.tween('letterbox', 0, 30);
      // a contagem de sempre (vitória, pontos) e o final do capítulo
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { return TC.Ending2Scene ? new TC.Ending2Scene({ score: score }) : new TC.TitleScene(); };
  }

  /* fita que voa do bolso do Arno e se enrola no bicho */
  function Bind(i, x, y, target) {
    this.i = i; this.x = x; this.y = y; this.t = 0; this.alive = true; this.tg = target;
    this.col = TC.ART.ch2.RIBBON_COLS[i];
    this.free = false;
  }
  Bind.prototype.update = function (st) {
    this.t++;
    var tg = this.tg;
    var ang = this.t * 0.07 + this.i * 0.9;
    var tx = tg.x + Math.cos(ang) * 34, ty = tg.y - 30 + Math.sin(ang) * 14 + (this.i - 3) * 3;
    if (this.free) { ty -= 2; this.fade = (this.fade || 1) - 0.02; if (this.fade <= 0) this.alive = false; }
    var k = Math.min(1, this.t / 30);
    this.x += (tx - this.x) * (0.08 + k * 0.2);
    this.y += (ty - this.y) * (0.08 + k * 0.2);
    if (this.t % 4 === 0) st.parts.add({ x: this.x, y: this.y, vy: -0.2, life: 20, color: this.col, size: 1, fade: true, layer: 1 });
  };
  Bind.prototype.draw = function (c, cx, cy) {
    var fr = TC.ART.ch2.ribbons[this.i][Math.floor(this.t / 6) % 2];
    if (this.fade != null) c.globalAlpha = Math.max(0, this.fade);
    c.drawImage(fr, Math.round(this.x - cx - fr.width / 2), Math.round(this.y - cy - fr.height / 2));
    c.globalAlpha = 1;
  };
  Bind.prototype.light = function (L, cx, cy) { L.add(this.x - cx, this.y - cy, 26, this.col, 0.9 * (this.fade == null ? 1 : this.fade)); };
})();
