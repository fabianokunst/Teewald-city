'use strict';
/* Teewald City — Fase 4: "O Último Turno"
   A vila operária da Calçados Morgenstern, o portão com a estrela de neon, o curtume (com O Couro no tanque de tanino),
   o corte e a montagem (esteiras e balancins), o escritório do velho Gerhard, o pesponto e a sala de cola,
   e no fundo do salão a Moça do Serão, que ainda espera fechar o pedido de 1967. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;

  TC.buildLevel4 = function () {
    var A = TC.ART, C2 = A.ch2Init(), C4 = A.ch4Init();
    var W = 300, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 4, music: 'stage4', cardNum: 'stage4.num', cardName: 'stage4.name', comboY: 38
    };
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    var x, i;
    var Z = { vila: 0, gate: 46, curtume: 58, fabrica: 118, office: 174, pesponto: 188, cola: 234, boss: 270 };
    L.ZONE = Z;

    /* ---------- chão e estilos ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) {
      L.style[x] = x < Z.gate ? 'vila' : x < Z.curtume ? 'gate' : x < Z.fabrica ? 'yard' : x < Z.pesponto ? 'factory' : 'wood';
    }
    // tanques de tanino no pátio (buracos de 3 blocos: um pulo comum)
    fill(85, 87, 12, 12, 0); fill(85, 87, 13, 13, 4);
    fill(113, 115, 12, 12, 0); fill(113, 115, 13, 13, 4);
    // varais de couro (a viga de cima é plataforma)
    fill(72, 76, 9, 9, 2);
    fill(89, 93, 9, 9, 2);
    // passarela de grade sobre a montagem
    fill(140, 145, 8, 8, 2);
    fill(160, 164, 9, 9, 2);
    // prateleiras do pesponto
    fill(205, 208, 9, 9, 2);
    fill(226, 229, 9, 9, 2);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1967);
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
    function lamp(tx, broken) {
      var cv = A.lampPost(118), o = back(cv, tx * TS - cv.poleX, GY + 3 - cv.height, 3);
      o.lights = [{ dx: cv.lampX, dy: cv.lampY + 4, r: 70, col: '#ffb060', a: 1, flicker: broken }, { dx: cv.lampX, dy: cv.height - 6, r: 40, col: '#ffc070', a: 0.6, flicker: broken }];
      o.glows = [{ dx: cv.lampX, dy: cv.lampY + 1, r: 9, col: '#ffe0a0', a: 0.9, flicker: broken }, { dx: cv.lampX, dy: cv.lampY + 2, r: 22, col: '#ffa040', a: 0.25, flicker: broken }];
      L.wires.push({ x: o.x + 1, y: o.y + cv.wireY, x2: o.x + 18 });
    }

    // --- a vila operária ---
    var cur = -20, seed = 400;
    while (cur < Z.gate * TS - 80) {
      var hw = r.int(4, 5) * 16;
      back(C4.rowHouse(seed++, hw), cur, GY + 1 - 84, 0);
      cur += hw + (r() < 0.3 ? r.int(10, 24) : 0);
      if (r() < 0.25) { back(A.araucaria(seed++, r.int(140, 180)), cur - 40, 0, -1); }
    }
    [3, 14, 25, 36].forEach(function (tx, k) { lamp(tx, k === 2); });
    back(C4.bikes(), 18 * TS, GY + 1 - 30, 2);
    (function () {
      var bt = C4.boteco(), bo = back(bt, 22 * TS, GY + 1 - bt.height, 0);
      bo.lights = [{ dx: bt.tvX, dy: bt.tvY + 6, r: 40, col: '#8ab0e0', a: 0.8, flicker: true }];
      bo.glows = [{ dx: bt.tvX, dy: bt.tvY, r: 5, col: '#c0e0ff', a: 0.7, flicker: true }];
    })();
    back(C4.clothesline(110, 5), 28 * TS, GY - 70, 1);
    back(C4.clothesline(80, 6), 9 * TS, GY - 66, 1);
    sign(7, 'sign4.vila', C2.sign(110, 30, [['VILA OPERÁRIA', '#f0e0b0'], ['MORGENSTERN', '#e8c070'], ['ALUGUEL NA FOLHA', '#d8c890']], { legs: 10, bg: '#2a3a5a', trim: '#5a7aaa' }));

    // --- o portão e a portaria ---
    var gate = C4.gate();
    L._gate = back(gate, Z.gate * TS + 8, GY + 2 - gate.height, 1);
    back(C4.guardhouse(), (Z.gate + 10) * TS, GY + 1 - 64, 1);
    sign(Z.gate + 2, 'sign4.closed', C2.sign(64, 26, [['COMUNICADO', '#f0e0b0'], ['31/03/1997', '#e8c070']], { legs: 12, bg: '#e8e4dc', trim: '#c02020', border: '#2a2a30' }));
    L.signs.push({ x: (Z.gate + 6) * TS, y: GY, key: 'sign4.gate' });

    // --- o curtume ---
    for (x = Z.curtume * TS; x < Z.fabrica * TS; x += 256) back(C4.facade(Math.min(256, Z.fabrica * TS - x), x % 7), x, GY + 2 - 160, -2);
    for (x = Z.curtume + 3; x < Z.fabrica - 2; x += 10) {
      var wl = C4.wallLamp(), wo = back(wl, x * TS, 64, 1), wb = (x % 3) === 0;
      wo.lights = [{ dx: wl.lightX, dy: wl.lightY + 10, r: 70, col: '#ffc070', a: 0.95, flicker: wb }, { dx: wl.lightX, dy: GY - 70, r: 46, col: '#ffb060', a: 0.5, flicker: wb }];
      wo.glows = [{ dx: wl.lightX, dy: wl.lightY, r: 7, col: '#ffe0a0', a: 0.8, flicker: wb }];
    }
    back(C4.paintedSign('CURTUME MORGENSTERN'), 60 * TS, 44, -1);
    back(C4.paintedSign('CALÇADOS PARA O MUNDO'), 104 * TS, 44, -1);
    back(C4.dock(), 72 * TS, GY + 2 - 60, -1);
    L._truck = back(C4.truckImg, 73 * TS + 30, GY - 44 - 26, -1);
    glow(L._truck, C4.truckImg.lampX, C4.truckImg.lampY, 60, '#fff0b0', 1, false);
    L._truck.lights.push({ dx: C4.truckImg.lampX + 40, dy: C4.truckImg.lampY + 20, r: 50, col: '#fff0b0', a: 0.6 });
    [[72, 76], [89, 93]].forEach(function (b) { back(C4.hideRack((b[1] - b[0] + 1) * TS + 8, b[0]), b[0] * TS - 4, 9 * TS - 1, 1); });
    [[85, 87], [113, 115]].forEach(function (b) { back(C4.tankRim((b[1] - b[0] + 1) * TS), b[0] * TS - 4, GY - 2, 2); });
    back(C4.barkPile(1), 64 * TS, GY + 1 - 26, 2);
    back(C4.barkPile(2), 106 * TS, GY + 1 - 26, 2);
    sign(62, 'sign4.curtume', C2.sign(110, 30, [['CURTUME MORGENSTERN', '#f0e0b0'], ['TANINO DE ACÁCIA', '#d8c890'], ['NÃO FUME PERTO DO FULÃO', '#e8a070']], { bg: '#3a2a20', trim: '#8a6040' }), 66);
    // o grande tanque atrás da arena d'O Couro
    (function () {
      var w = 160, cv = TC.canvas(w, 40), c = cv.ctx;
      c.fillStyle = TC.col('#6a645c'); c.fillRect(0, 0, w, 40);
      c.fillStyle = TC.col('#9a948c'); c.fillRect(0, 0, w, 2);
      c.fillStyle = TC.col('#4a1c0c'); c.fillRect(6, 4, w - 12, 10);
      c.fillStyle = TC.col('#7a3a1c'); for (var k = 6; k < w - 6; k += 5) c.fillRect(k, 4, 3, 1);
      c.fillStyle = TC.col('#3a3632'); for (k = 0; k < w; k += 20) c.fillRect(k, 16, 1, 24);
      back(cv, 100 * TS, GY + 2 - 40, 0);
    })();

    // --- dentro da fábrica: corte e montagem ---
    for (x = Z.fabrica * TS; x < Z.pesponto * TS; x += 256) back(C4.wallIndustrial(Math.min(256, Z.pesponto * TS - x), x % 13), x, 0, -2);
    [124, 150, 166].forEach(function (tx, k) { back(C4.shelf(tx), tx * TS - 35, GY + 1 - 90, 0); });
    [134, 157].forEach(function (tx) { back(C4.lastRack(), tx * TS, GY - 70, 0); });
    for (x = Z.fabrica + 4; x < Z.pesponto - 2; x += 9) {
      var tl = C4.tubeLamp(), lo = back(tl, x * TS, 20, 2), brk = (x % 4) === 1;
      lo.lights = [{ dx: tl.lightX, dy: tl.lightY + 4, r: 64, col: '#d0e8f0', a: 0.75, flicker: brk }];
      lo.glows = [{ dx: tl.lightX, dy: tl.lightY, r: 8, col: '#f0ffff', a: 0.6, flicker: brk }];
    }
    [[136, 146], [156, 163]].forEach(function (b) { back(C4.conveyorBase((b[1] - b[0]) * TS), b[0] * TS, GY + 1, 1); });
    back(C4.conveyorBase(6 * TS), 140 * TS, 8 * TS + 2, 1);
    sign(124, 'sign4.acidentes', C2.sign(104, 30, [['HÁ 10.963 DIAS', '#f0e0b0'], ['SEM ACIDENTES', '#80e080'], ['(DESDE 1967)', '#d8c890']], { bg: '#1a3a24', trim: '#3a7a4a' }), 60);
    sign(139, 'sign4.meta', C2.sign(96, 22, [['META DO DIA', '#f0e0b0'], ['2.400 PARES', '#ffd040']], { bg: '#5a1a14', trim: '#a04030' }), 52);
    sign(158, 'sign4.poster', C2.sign(72, 34, [['MODELO HILDE', '#ffd0d0'], ['1967', '#f0e0b0'], ['EXPORT USA', '#e8c070']], { bg: '#7a1414', trim: '#c84040' }), 74);
    // o escritório do velho Gerhard
    var off = C4.officeGlass();
    L._office = back(off, Z.office * TS, GY + 2 - off.height, 0);
    L._officeShoes = { x: Z.office * TS + off.shoesX, y: GY + 2 - off.height + off.shoesY };
    glow(L._office, 66, 68, 56, '#ffd090', 0.9, false);
    glow(L._office, 142, 50, 30, '#ffe0c0', 0.6, false);

    // --- o pesponto ---
    for (x = Z.pesponto * TS; x < Z.boss * TS + 256; x += 256) back(C4.wallStitch(Math.min(256, Z.boss * TS + 256 - x), x % 11), x, 0, -2);
    sign(200, 'sign4.clock', null);
    back(C4.wallClock(), 200 * TS - 11, 106, 1);
    for (x = Z.pesponto + 3; x < W - 2; x += 8) {
      var tl2 = C4.tubeLamp(), lo2 = back(tl2, x * TS, 16, 2), brk2 = (x % 3) === 0;
      lo2.lights = [{ dx: tl2.lightX, dy: tl2.lightY + 4, r: 58, col: '#e0e8d0', a: 0.65, flicker: brk2 }];
      lo2.glows = [{ dx: tl2.lightX, dy: tl2.lightY, r: 7, col: '#f8fff0', a: 0.5, flicker: brk2 }];
    }
    [[205, 208], [226, 229]].forEach(function (b) {
      var cv = TC.canvas((b[1] - b[0] + 1) * TS, 50), c = cv.ctx;
      c.fillStyle = TC.col('#4a2c18'); c.fillRect(0, 0, cv.width, 4);
      c.fillStyle = TC.col('#6a4428'); c.fillRect(0, 0, cv.width, 1);
      c.fillStyle = TC.col('#2a1a10'); c.fillRect(2, 4, 3, 46); c.fillRect(cv.width - 5, 4, 3, 46);
      for (var k = 4; k < cv.width - 8; k += 12) { c.fillStyle = TC.col(k % 24 ? '#b89a6a' : '#a88a5a'); c.fillRect(k, -10, 10, 10); }
      back(cv, b[0] * TS, 9 * TS, 1);
    });
    // a sala de cola
    back(C4.glueBarrels(), 238 * TS, GY + 1 - 30, 1);
    back(C4.glueBarrels(), 252 * TS, GY + 1 - 30, 1);
    sign(Z.cola + 3, 'sign4.cola', C2.sign(96, 30, [['SALA DE COLA', '#f0e0b0'], ['INFLAMÁVEL!', '#ffd040'], ['TRANCADA APÓS 22H', '#d8c890']], { bg: '#2a4a2a', trim: '#5a8a4a' }), 60);

    // --- a sala do chefe: a parede do fundo e as três portas ---
    var bx0 = 284 * TS;
    back(C4.bossWall(), bx0, 0, -1);
    L.doors = [
      { x: bx0 + 20, wide: false },
      { x: bx0 + 128, wide: true },
      { x: bx0 + 236, wide: false }
    ];
    L.doors.forEach(function (d) {
      var cv = d.wide ? C4.doors.closedWide : C4.doors.closed;
      d.o = back(cv, Math.round(d.x - cv.width / 2), GY + 1 - cv.height, 0);
      d.open = false;
    });

    /* ---------- primeiro plano ---------- */
    var post = TC.canvas(6, 120); post.ctx.fillStyle = '#06050a'; post.ctx.fillRect(0, 0, 6, 120);
    var crate = TC.canvas(26, 22); crate.ctx.fillStyle = '#06050a'; crate.ctx.fillRect(0, 0, 26, 22);
    for (x = 200; x < L.pxW; x += r.int(220, 360)) L.front.push({ cv: r() < 0.5 ? post : crate, x: x, y: r() < 0.5 ? 104 : 204 });

    /* ---------- itens e quebráveis ---------- */
    [[10, 'crate', 'cuca'], [22, 'barrel', 'balas'], [33, 'crate', 'linguica'], [44, 'barrel', 'chimarrao'], [60, 'crate', 'balas'], [80, 'barrel', 'cuca'],
      [95, 'crate', 'balas'], [109, 'barrel', 'chimarrao'], [121, 'crate', 'linguica'], [131, 'crate', 'balas'], [148, 'barrel', 'cuca'], [170, 'crate', 'balas'],
      [192, 'barrel', 'chimarrao'], [203, 'crate', 'balas'], [215, 'barrel', 'linguica'], [232, 'crate', 'cuca'], [246, 'barrel', 'balas'], [262, 'crate', 'chimarrao'], [278, 'barrel', 'cuca']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[73, 9], [75, 9], [90, 9], [92, 9], [141, 8], [144, 8], [161, 9], [163, 9], [206, 9], [207, 9], [227, 9], [228, 9]].forEach(function (p) {
      L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 142 * TS + 8, y: 8 * TS - 6 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('shoes', 9, GY); sp('crow', 26, 60); sp('clog', 42, GY);
    sp('shoes', 62, GY); sp('ghost', 82, 140); sp('clog', 110, GY);
    sp('shoes', 130, GY); sp('foreman', 168, GY);
    sp('ghost', 194, 140); sp('shoes', 214, GY); sp('clog', 240, GY); sp('foreman', 266, GY);

    /* ---------- arenas ---------- */
    function e(t, side) { return { t: t, side: side, y: GY }; }
    function g(side, y) { return { t: 'ghost', side: side, y: y || 140 }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function s(side) { return { t: 'shade', side: side }; }
    L.arenas = [
      { x0: 16 * TS, waves: [[e('shoes', 'r'), e('shoes', 'l')], [e('clog', 'r'), e('shoes', 'l'), e('shoes', 'r')], [g('r'), e('clog', 'l')]] },
      { x0: 36 * TS, waves: [[e('boot', 'r')], [e('shoes', 'l'), e('shoes', 'r'), e('clog', 'r')], [e('boot', 'l'), g('r')]] },
      { x0: 66 * TS, waves: [[e('shoes', 'r'), e('clog', 'l')], [e('boot', 'r'), s('l')], [e('clog', 'r'), e('clog', 'l'), f('r')]] },
      { x0: 96 * TS, couro: true, waves: [[{ t: 'couro', rise: 150 }]] },
      { x0: 126 * TS, waves: [[e('foreman', 'r')], [e('shoes', 'l'), e('shoes', 'r'), e('boot', 'l')], [e('foreman', 'l'), e('clog', 'r'), e('clog', 'r')]] },
      { x0: 148 * TS, waves: [[e('boot', 'r'), e('shoes', 'l')], [e('foreman', 'r'), s('l')], [e('clog', 'l'), e('clog', 'r'), e('boot', 'r')]] },
      { x0: 194 * TS, waves: [[e('foreman', 'l'), e('shoes', 'r')], [g('r'), g('l'), e('clog', 'r')], [e('boot', 'l'), e('foreman', 'r')]] },
      { x0: 216 * TS, waves: [[s('r'), e('shoes', 'l'), e('shoes', 'r')], [e('foreman', 'r'), e('boot', 'l')], [e('clog', 'l'), e('clog', 'r'), f('r'), g('l')]] },
      { x0: 248 * TS, waves: [[e('shoes', 'l'), e('shoes', 'r'), e('clog', 'r')], [e('foreman', 'l'), e('foreman', 'r')], [e('boot', 'r'), s('l'), f('r')]] },
      { x0: 284 * TS, boss: true, waves: [] }
    ];
    L.couroArena = L.arenas[3];
    /* pontos de retorno (os relógios de ponto fazem o papel das capelinhas) */
    L.cps = [
      { x: 64 }, { x: 16 * TS + 30 }, { x: 30 * TS, clock: true }, { x: 36 * TS + 30 }, { x: 56 * TS, clock: true }, { x: 66 * TS + 30 },
      { x: 92 * TS + 8, clock: true }, { x: 96 * TS + 30 }, { x: 118 * TS, clock: true }, { x: 126 * TS + 30 }, { x: 148 * TS + 30 },
      { x: 186 * TS, clock: true }, { x: 194 * TS + 30 }, { x: 216 * TS + 30 }, { x: 236 * TS, clock: true }, { x: 248 * TS + 30 },
      { x: 280 * TS, clock: true }, { x: 284 * TS + 30 }
    ];
    var acp = [1, 3, 5, 7, 9, 10, 12, 13, 15, 17];
    L.arenas.forEach(function (a, k) { a.cp = acp[k]; });
    L.clocks = [];
    L.cps.forEach(function (cp, k) { if (cp.clock) L.clocks.push({ x: cp.x, cp: k }); });

    /* falas ao passar */
    L.barks = [
      { x: 4 * TS, key: 'c4.b.vila' },
      { x: 11 * TS, key: 'c4.b.sleep' },
      { x: 48 * TS, key: 'c4.b.gate' },
      { x: 59 * TS, key: 'c4.b.curtume' },
      { x: 70 * TS, key: 'c4.b.truck', face: 'shock' },
      { x: 94 * TS, key: 'c4.b.fulao' },
      { x: 119 * TS, key: 'c4.b.inside' },
      { x: 129 * TS, key: 'c4.b.press' },
      { x: 189 * TS, key: 'c4.b.pesponto' },
      { x: 235 * TS, key: 'c4.b.cola' },
      { x: 277 * TS, key: 'c4.b.boss' }
    ];

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#3a3a5c', fog: 0.45 },
      { x: Z.gate * TS, ambient: '#3c3858', fog: 0.4 },
      { x: Z.curtume * TS, ambient: '#463c52', fog: 0.32 },
      { x: Z.fabrica * TS, ambient: '#3a3c4a', fog: 0.12 },
      { x: Z.pesponto * TS, ambient: '#363440', fog: 0.1 },
      { x: Z.cola * TS, ambient: '#2e3e30', fog: 0.35 },
      { x: Z.boss * TS, ambient: '#363040', fog: 0.15 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C2, C4);
    return L;
  };

  /* =================================================================== */
  function hooks(L, C2, C4) {
    var A = TC.ART, E = TC.ent, X = TC.ch4;
    var Z = L.ZONE;

    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#020309'], [0.45, '#0a0d2a'], [0.8, '#1e1a40'], [1, '#2e2448']], 81, 0.006);
      bg.tw = A.twinkles(SW, 110, 30, 81);
      bg.moon = A.moon(12);
      bg.far = A.hills(512, 70, { seed: 81, color: '#1c1e44', rim: '#363c74', base: 0.5, amp: 0.55, trees: 30, treeMin: 5, treeMax: 10, period: 6 });
      // a baixada: a fábrica e a vila ao longe
      var mid = TC.canvas(512, 90), mc = mid.ctx;
      mc.drawImage(A.hills(512, 90, { seed: 82, color: '#121434', rim: '#262c58', base: 0.6, amp: 0.3, period: 6 }), 0, 0);
      mc.drawImage(C4.factoryFar(300, '#0e1028', '#3a4878'), 120, 0);
      bg.mid = mid;
      var tl = TC.canvas(768, 140), c = tl.ctx, r = TC.RNG(4747);
      for (var i = 0; i < 22; i++) {
        var h = r.int(70, 130);
        var tr = r() < 0.6 ? A.araucaria(700 + i, h, { sil: '#0b0d20', rim: '#1c2350' }) : A.pine(800 + i, Math.round(h * 0.7), { sil: '#0b0d20' });
        var tx = r.int(0, 767);
        [-768, 0, 768].forEach(function (o) { c.drawImage(tr, tx - tr.baseX + o, 140 - tr.height); });
      }
      c.fillStyle = TC.col('#0b0d20'); c.fillRect(0, 128, 768, 12);
      bg.trees = tl;
      bg.fog = A.fog(512, 52, 47, '#8a8ab8');
      bg.fogFront = A.fog(512, 40, 49, '#9a9ac8');
      // a fumaça da chaminé ao longe
      bg.extra = function (cc, camX, t) {
        if (camX > Z.fabrica * 16) return;
        var sx = 120 + 300 - 30 + 4 - Math.round(camX * 0.12) % 512;
        for (var k = 0; k < 8; k++) {
          var yy = 112 + 4 - ((t * 0.2 + k * 14) % 110);
          cc.fillStyle = 'rgba(70,74,110,' + (0.35 - k * 0.03).toFixed(2) + ')';
          TC.fillCircle(cc, sx + Math.sin((t * 0.01 + k)) * 6 + k * 2, yy, 3 + k);
        }
      };
      return bg;
    };

    L.tileFor = function (code, open, st, v) {
      var T = C4.T;
      if (code === 1) {
        if (st === 'vila' || st === 'gate') return null;
        if (st === 'yard') return open ? T.yardTop[v] : T.yard[v];
        if (st === 'factory') return open ? T.floorTop[v] : T.floor[v];
        if (st === 'wood') return open ? T.woodTop[v] : T.wood;
      }
      if (code === 2 && st === 'yard') return false;
      if (code === 2 && st === 'factory') return T.grate[v];
      if (code === 2 && st === 'wood') return false;
      return null;
    };

    /* ---------- partículas: fiapos de couro e pó de cola ---------- */
    L.particles = function (st) {
      var cx = st.camX, x = st.player.x;
      if (x < Z.fabrica * 16) {
        if (st.t % 14 === 0) {
          var ls = A.leaves()[TC.rnd.int(0, 2)];
          st.parts.add({ x: cx + TC.rnd.range(-10, SW + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6, layer: 2, sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
        }
      } else if (st.t % 10 === 0) {
        var green = x > Z.cola * 16 && x < Z.boss * 16;
        st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(30, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.12, 0.05), life: 200, color: green ? '#a0d070' : '#d8d0c0', size: 1, fade: true, wobble: 0.03, layer: 2 });
      }
    };

    /* ---------- início ---------- */
    L.init = function (st, save) {
      var D = TC.diff();
      st.gun = { ammo: save && save.ammo != null ? save.ammo : 12 };
      st.fireGun = function (p) { TC.ch2.fireGun(st, p); };
      st.glue = [];
      st.stitchT = 0;
      st.hasKey = !!(save && save.key);
      st.officeDone = st.hasKey;
      // relógios de ponto
      st.clocks = L.clocks.map(function (c) { var tc = new X.TimeClock(c.x, c.cp); if (save && c.cp <= (save.cp || 0)) tc.lit = true; st.deco.push(tc); return tc; });
      // cenário animado
      st.deco.push(new X.NeonStar(L._gate.x + L._gate.cv.starX, L._gate.y + L._gate.cv.starY, false));
      st.deco.push(new X.Drum(100 * 16 + 214, GY - 70));
      [132, 152, 168].forEach(function (tx, k) { st.deco.push(new X.Press(tx * 16 + 8, k * 50)); });
      st.presses = st.deco.filter(function (d) { return d instanceof X.Press; });
      st.conveyors = [new X.Conveyor(136 * 16, 146 * 16, 0.6), new X.Conveyor(156 * 16, 163 * 16, -0.6)];
      st.conveyors.forEach(function (cv) { st.deco.push(cv); });
      // as sonâmbulas atravessando a vila rumo ao portão
      for (var k = 0; k < 6; k++) st.deco.push(new X.Sleeper(2 * 16, (Z.gate + 4) * 16, GY - 2, k, k / 6));
      // as costureiras no pesponto
      for (var x = Z.pesponto + 4, n = 0; x < Z.boss + 12; x += 6, n++) {
        if (x > 204 && x < 210) continue;
        if (x > 225 && x < 231) continue;
        if (x > Z.cola - 1 && x < Z.boss - 2) continue;
        st.deco.push(new X.Seamstress(x * 16, n, n % 2 ? -1 : 1));
      }
      st.seamstresses = st.deco.filter(function (d) { return d instanceof X.Seamstress; });
      // poças de cola permanentes na sala de cola
      [239, 244, 250].forEach(function (tx) { var gl = new X.Glue(tx * 16 + 8, 0, true); gl.r = 20; st.glue.push(gl); st.deco.push(gl); });
      // os sapatos vermelhos na vitrine do escritório
      st.deco.push({ alive: true, update: function () { }, draw: function (c, cx) { L.drawShoes(c, cx); } });
      var baseKill = st.kill;
      st.kill = function (en) {
        baseKill.call(st, en);
        if (en && !en.isBoss && !st.noDrops && en.y < L.pxH && st.gun.ammo < 12 && TC.rnd() < 0.08 + D.drop * 0.5) st.items.push(new E.Item('balas', en.x, Math.min(en.y, GY - 8), true));
      };
      // a água animada dos tanques é tanino
      var T2 = Object.create(st.T); T2.water = C4.T.tannin; st.T = T2;
    };
    L.saveExtra = function (st, s) {
      s.ammo = st.gun ? st.gun.ammo : 12;
      s.key = !!st.hasKey;
    };
    L.onRespawn = function (st) {
      if (st.gun && st.gun.ammo < 3) st.gun.ammo = 3;
      st.ambientOverride = null;
      st.stitchT = 0;
      st.glue = st.glue.filter(function (g) { if (!g.permanent) g.alive = false; return g.permanent; });
      st.deco.forEach(function (d) { if (d instanceof X.Seam) d.alive = false; });
      if (st.hildeActor) { st.hildeActor.alive = false; st.hildeActor = null; }
      if (st.gerhard) { st.gerhard.alive = false; st.gerhard = null; }
      // as portas voltam a trancar (o incêndio recomeça na próxima tentativa)
      L.doors.forEach(function (d) { d.open = false; d.o.cv = d.wide ? C4.doors.closedWide : C4.doors.closed; });
      if (st.player.state === 'cine' && !st.cine) st.player.setState('normal');
    };

    L.afterCard = function* (st) {
      st.banner = { kind: 'mission', t: 0 };
      TC.audio.sfx('siren');
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
      TC.font.wrap(TC.t('mission4'), 190).forEach(function (ln, i) { TC.font.draw(c, ln, 128, 76 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
    };

    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, st.hasKey ? 60 : 36, 11);
      c.drawImage(C2.gunIcon, 5, 27);
      var am = st.gun ? st.gun.ammo : 0;
      TC.font.draw(c, (am < 10 ? '0' : '') + am, 17, 27, am ? '#ffe0a0' : ((st.t >> 3) % 2 ? '#ff6050' : '#802020'), { shadow: '#000' });
      if (st.hasKey) { c.drawImage(A.items.chave, 37, 27); c.drawImage(A.items.sapatos, 49, 25); }
      // "↑ ABRIR" sobre as portas trancadas enquanto o fogo protege a Moça
      var bs = st.boss;
      if (bs && bs.type === 'hilde' && bs.shield && st.mode === 'play') {
        L.doors.forEach(function (d) {
          if (d.open || (st.t >> 4) % 2) return;
          TC.font.draw(c, TC.t('c4.doorhint'), Math.round(d.x - st.camX), 120, '#c8e0ff', { align: 'center', outline: '#000' });
        });
      }
    };

    /* a cola deixa lento; costurado, quase não anda */
    L.speedMul = function (st, p) {
      if (st.stitchT > 0) return 0.15;
      for (var i = 0; i < st.glue.length; i++) if (st.glue[i].alive && st.glue[i].inside(p)) return 0.5;
      return 1;
    };

    /* o piloto automático: espera o balancim subir, vai abrir as portas e foge da sombra do carretel */
    L.botGoal = function (st, p) {
      var bs = st.boss;
      if (bs && bs.type === 'hilde') {
        if (bs.state === 'spoolTrack' || bs.state === 'drop') {
          var sx = bs.state === 'drop' ? bs.x : bs.sx;
          if (Math.abs(p.x - sx) < 40) return { x: TC.clamp(sx + (p.x < sx ? -60 : 60), bs.arena.x0 + 14, bs.arena.x0 + 242), noAtk: true };
        }
        if (bs.shield) {
          var best = null;
          L.doors.forEach(function (d) { if (!d.open && (!best || Math.abs(d.x - p.x) < Math.abs(best.x - p.x))) best = d; });
          if (best) return { x: best.x, use: Math.abs(best.x - p.x) < 12, noAtk: true };
        }
        return null;
      }
      if (bs && bs.type === 'couro' && bs.state === 'diveTrack' && Math.abs(p.x - bs.x) < 46) return { x: p.x + (p.x < bs.x ? -60 : 60), noAtk: true };
      if (st.presses) {
        for (var i = 0; i < st.presses.length; i++) {
          var pr = st.presses[i], d = pr.x - p.x;
          if (Math.abs(d) < 44 && (pr.danger() || pr.state === 'idle' && pr.st > pr.cycle().idle - 30)) {
            if (Math.abs(d) < 20) return { x: pr.x + (d > 0 ? -40 : 40), noAtk: true };
            return { x: p.x, noAtk: false, keepAttack: true };
          }
        }
      }
      return null;
    };

    L.debugInfo = function (st) { return { key: !!st.hasKey, doors: L.doors.filter(function (d) { return d.open; }).length, en: st.enemies.map(function (e) { return e.type + '@' + Math.round(e.x) + ',' + Math.round(e.y) + ':' + e.state + ' hp' + e.hp + ' a' + e.alpha + ' g' + e.onGround + ' hs' + e.hitstop; }), p: st.player.state + ' f' + st.player.face + ' t' + st.player.t + ' vx' + st.player.vx.toFixed(2) + ' y' + st.player.y + ' g' + st.player.onGround }; };

    /* ---------- eventos da fase ---------- */
    L.update = function (st) {
      var p = st.player;
      if (st.stitchT > 0) st.stitchT--;
      // começando depois do escritório (save ou depuração), a chave e os sapatos já estão com o Arno
      if (!st._ofc) { st._ofc = true; if (p.x > (Z.office + 12) * 16) { st.officeDone = st.hasKey = true; L._shoesTaken = true; } }
      st.glue = st.glue.filter(function (g) { return g.alive; });
      // O Couro: mini-chefe com barra enquanto vive
      if (st.arena === L.couroArena) {
        var cu = null;
        st.enemies.forEach(function (e) { if (e.type === 'couro' && e.alive && e.state !== 'dead') cu = e; });
        if (cu && !st.boss) { st.boss = cu; cu.arena = L.couroArena; st.bossBarFill = 1; TC.audio.music('boss', 0.4); }
        if (!cu && st.boss && st.boss.type === 'couro') { st.boss = null; st.bossBarFill = 0; }
      } else if (st.boss && st.boss.type === 'couro') { st.boss = null; st.bossBarFill = 0; }
      if (L.couroArena.done && !L._couroMusic) { L._couroMusic = true; TC.audio.music(L.music, 1); }
      // o escritório do Gerhard
      if (!st.officeDone && st.mode === 'play' && !st.arena && p.x > (Z.office + 5) * 16 && p.x < (Z.office + 12) * 16 && p.onGround && p.state === 'normal') {
        st.officeDone = true;
        st.cine = new TC.Script(officeSeq(st));
      }
      // as portas da luta: ↑ perto de uma porta trancada (com o fogo aceso)
      var bs = st.boss;
      if (bs && bs.type === 'hilde' && bs.p2 && st.mode === 'play' && p.onGround && p.state === 'normal') {
        for (var i = 0; i < L.doors.length; i++) {
          var d = L.doors[i];
          if (d.open || Math.abs(p.x - d.x) > 14) continue;
          if (TC.input.pressed('up') || p.botUse) {
            d.open = true;
            d.o.cv = d.wide ? C4.doors.openWide : C4.doors.open;
            d.o.lights = [{ dx: d.o.cv.width / 2, dy: 30, r: 60, col: '#8090d0', a: 0.9 }];
            TC.audio.sfx('unlock'); TC.audio.sfx('door');
            for (var k = 0; k < 12; k++) st.parts.add({ x: d.x + TC.rnd.range(-10, 10), y: GY - TC.rnd.range(4, 50), vx: TC.rnd.range(-1.2, 1.2), vy: TC.rnd.range(-1, 0), life: 50, color: '#c8d8ff', size: 1, fade: true, layer: 1 });
            // uma costureira acorda e foge pela porta
            var awake = new E.Actor(A.castInit().sleepers[i % 4], d.x - 30, GY, 1); awake.pose = 'run'; awake.speed = 4; awake.vx = 0.9;
            awake.set = { idle: A.castInit().sleepers[i % 4].awake, run: A.castInit().sleepers[i % 4].run };
            st.deco.push(awake);
            st.floatText(d.x, GY - 70, TC.t('freed.f'), '#e0f0ff');
            bs.onDoor(st);
            break;
          }
        }
      }
      // o incêndio de 1967 enquanto houver porta trancada: luz de fogo e labaredas no rodapé
      if (bs && bs.type === 'hilde' && bs.p2 && bs.state !== 'dying' && bs.state !== 'downed') {
        var left = L.doors.filter(function (d) { return !d.open; }).length;
        st.ambientOverride = left ? TC.mix('#6e3622', '#5a3028', 1 - left / 3) : '#363450';
        if (left) {
          var fx0 = st.arena ? st.arena.x0 : st.camX;
          st.parts.add({ x: fx0 + TC.rnd.range(0, 256), y: GY - 1, vx: TC.rnd.range(-0.2, 0.2), vy: TC.rnd.range(-2.2, -0.6), life: TC.rnd.int(18, 40), colors: ['#ffffff', '#ffe080', '#ff9030', '#c03010', '#401008'], size: TC.rnd.int(2, 4), fade: true, layer: 1, add: true });
          if (st.t % 6 === 0) st.parts.add({ x: fx0 + TC.rnd.range(0, 256), y: TC.rnd.range(60, 150), vx: TC.rnd.range(-0.2, 0.3), vy: -0.3, life: 120, color: '#2a2224', size: 3, fade: true, wobble: 0.05, layer: 2 });
        }
      }
      // a música da fase: o xote lá fora e dentro, o silêncio perto do chefe
      if ((st.mode === 'play' || st.mode === 'dialog') && !st.boss && !st.cine) {
        var want = L.music;
        if (p.x > (Z.boss + 6) * 16 && p.x < 284 * 16) want = null;
        if (want && TC.audio.musicName() !== want) TC.audio.music(want, 1.2);
        if (!want && TC.audio.musicName()) TC.audio.stopMusic(2);
      }
    };

    /* o velho Gerhard no escritório: a chave da porta e os sapatos vermelhos */
    function* officeSeq(st) {
      var p = st.player;
      st.mode = 'cine';
      p.setState('cine'); p.pose = 'idle'; p.face = 1; p.vx = 0;
      TC.fx.tween('letterbox', 22, 30);
      var C = A.castInit();
      var gx = Z.office * 16 + 96;
      var ger = new E.Actor(C.gerhard, gx, GY, -1); ger.alpha = 0;
      st.deco.push(ger); st.gerhard = ger;
      for (var i = 0; i < 30; i++) { ger.alpha = i / 30; yield; }
      // anda até perto da cadeira
      p.pose = 'run';
      while (p.x < gx - 58) { p.x += 1.1; p.anim++; yield; }
      p.pose = 'idle';
      yield* st.say('c4.g1', null, 'gerhard');
      p.pose = 'shock';
      yield* st.say('c4.g2', 'shock');
      p.pose = 'idle';
      yield* st.say('c4.g3', null, 'gerhard');
      yield* st.say('c4.g4');
      ger.pose = 'bow';
      yield* st.say('c4.g5', null, 'gerhard');
      yield* st.say('c4.g6', null, 'gerhard');
      ger.pose = 'reach';
      yield* st.say('c4.g7', null, 'gerhard');
      TC.audio.sfx('unlock');
      st.hasKey = true;
      st.floatText(p.x, p.y - 44, TC.t('item.chave'), '#ffe060');
      yield* co.wait(30);
      ger.pose = 'idle';
      p.face = -1;
      yield* st.say('c4.g8');
      yield* st.say('c4.g9', null, 'gerhard');
      // pega os sapatos da vitrine
      p.pose = 'offer';
      L._shoesTaken = true;
      TC.audio.sfx('pickup');
      st.floatText(p.x, p.y - 44, TC.t('item.sapatos'), '#ff9090');
      yield* co.wait(20);
      p.face = 1;
      yield* st.say('c4.g10');
      p.pose = 'idle';
      st.save();
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
    }

    /* vitrine com os sapatos (enquanto não forem pegos) */
    L.drawShoes = function (c, camX) {
      if (L._shoesTaken) return;
      var s = A.items.sapatos;
      c.drawImage(s, Math.round(L._officeShoes.x - s.width / 2 - camX), Math.round(L._officeShoes.y - s.height));
    };

    /* ---------- o chefe: a Moça do Serão ---------- */
    L.bossSeq = function* (st, a) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround; });
      p.setState('cine'); p.pose = 'idle'; p.face = 1;
      TC.fx.tween('letterbox', 22, 40);
      st.ambientOverride = '#2c2a3a';
      var boss = st.spawnEnemy('hilde', a.x0 + 176, GY - 4, { arena: a });
      if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
      boss.face = 1; boss.alpha = 0;
      st.boss = boss;
      // a máquina onde ela costura
      var machCv = C4.machine();
      var mach = { x: a.x0 + 200, t: 0, alive: true, update: function () { this.t++; }, draw: function (c, cx) { c.drawImage(machCv, Math.round(this.x - 20 - cx), GY - 40); } };
      st.deco.push(mach);
      for (var i = 0; i < 60; i++) { boss.alpha = i / 60; yield; }
      TC.audio.stopMusic(0.5);
      if (!a.seen) {
        a.seen = true;
        yield* st.say('c4.h1', null, 'hilde', 'bottom');
        yield* st.say('c4.h2', null, 'arno', 'bottom');
        boss.face = -1;
        TC.audio.sfx('ghost');
        yield* st.say('c4.h3', null, 'hilde', 'bottom');
        yield* st.say('c4.h4', null, 'hilde', 'bottom');
        yield* st.say('c4.h5', null, 'arno', 'bottom');
        TC.audio.sfx('thread');
        yield* st.say('c4.h6', null, 'hilde', 'bottom');
      } else {
        boss.face = -1;
        yield* co.wait(30);
      }
      mach.alive = false;
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music('boss4');
      st.banner = { kind: 'fight', t: 0 };
      boss.set('hover');
      p.setState('normal');
      st.mode = 'play';
      yield* co.wait(60);
      st.banner = null;
    };

    /* ---------- vitória: os sapatos vermelhos ---------- */
    L.clearSeq = function* (st) {
      var p = st.player, boss = null;
      st.enemies.forEach(function (e) { if (e.isBoss) boss = e; });
      st.mode = 'cine';
      st.killAllMinions();
      st.glue.forEach(function (g) { if (!g.permanent) g.alive = false; });
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      st.stitchT = 0;
      var hx = boss ? boss.x : p.x + 60;
      p.face = hx > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 40);
      // todas as portas se abrem (o fogo apaga)
      L.doors.forEach(function (d) { if (!d.open) { d.open = true; d.o.cv = d.wide ? C4.doors.openWide : C4.doors.open; d.o.lights = [{ dx: d.o.cv.width / 2, dy: 30, r: 60, col: '#8090d0', a: 0.9 }]; } });
      st.ambientOverride = '#3a3c5a';
      var hil = new E.Actor(C4.hilde, hx, GY - 4, hx > p.x ? -1 : 1);
      hil.set = { idle: C4.hilde.kneel, kneel: C4.hilde.kneel, freeKneel: C4.hilde.freeKneel, free: C4.hilde.free, human: C4.hilde.human, dance: C4.hilde.dance, walk: C4.hilde.walk };
      hil.pose = 'kneel'; hil.alpha = 0.9;
      st.deco.push(hil); st.hildeActor = hil;
      if (boss) boss.alive = false;
      yield* co.wait(40);
      // chega perto dela
      p.pose = 'run';
      var ax0 = st.arena ? st.arena.x0 : st.camX;
      if (hx > ax0 + 220) { hx = ax0 + 200; }
      if (hx < ax0 + 36) { hx = ax0 + 56; }
      p.face = hx > p.x ? 1 : -1;
      hil.x = hx; hil.face = -p.face;
      var stopAt = TC.clamp(hx - p.face * 34, ax0 + 14, ax0 + 242);
      for (var wk = 0; wk < 400 && Math.abs(p.x - stopAt) > 1; wk++) { p.x += Math.sign(stopAt - p.x) * Math.min(1, Math.abs(stopAt - p.x)); p.anim++; yield; }
      p.face = hx > p.x ? 1 : -1;
      p.pose = 'idle';
      yield* st.say('c4.e1', null, 'hilde');
      yield* st.say('c4.e2');
      p.pose = 'offer';
      TC.audio.sfx('pickup');
      yield* st.say('c4.e3');
      // os pontos dos olhos se soltam
      TC.audio.sfx('thread');
      hil.pose = 'freeKneel';
      for (var k = 0; k < 14; k++) st.parts.add({ x: hil.x + TC.rnd.range(-4, 4), y: hil.y - 60, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.2, 0.2), ay: 0.05, life: 50, color: '#e01818', size: 1, fade: true, layer: 1 });
      yield* co.wait(40);
      yield* st.say('c4.e4', 'free', 'hilde');
      p.pose = 'idle';
      // calça os sapatos: vira gente de novo
      TC.fx.flash('#ffe0d0', 0.7, 0.03);
      TC.audio.sfx('ribbon');
      hil.pose = 'human'; hil.alpha = 1; hil.y = GY;
      L._shoesTaken = true;
      for (k = 0; k < 24; k++) st.parts.add({ x: hil.x + TC.rnd.range(-12, 12), y: GY - TC.rnd.range(0, 70), vx: TC.rnd.range(-0.4, 0.4), vy: TC.rnd.range(-1.4, -0.3), life: 60, colors: ['#ffffff', '#ffd0d0', '#ff8080'], size: 1, fade: true, layer: 1 });
      yield* co.wait(30);
      yield* st.say('c4.e5', 'human', 'hilde');
      yield* st.say('c4.e6', 'human', 'hilde');
      // e sai dançando pela porta do meio, ao som da valsa
      TC.audio.music('bandinha', 1);
      hil.pose = 'dance'; hil.speed = 18;
      var door = L.doors[1];
      while (Math.abs(hil.x - door.x) > 2) { hil.x += Math.sign(door.x - hil.x) * 0.7; hil.face = door.x > hil.x ? 1 : -1; yield; }
      for (k = 0; k < 80; k++) { hil.alpha = 1 - k / 80; hil.y -= 0.1; yield; }
      hil.alive = false; st.hildeActor = null;
      st.ambientOverride = null;
      yield* co.wait(30);
      TC.fx.tween('letterbox', 0, 30);
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { return TC.Ending4Scene ? new TC.Ending4Scene({ score: score }) : new TC.TitleScene(); };
  }
})();
