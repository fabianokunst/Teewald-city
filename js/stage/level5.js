'use strict';
/* Teewald City — Fase 5: "A Noite Grande"
   Do potreiro da Linha Becker, pelas ruínas da ervateira e pela mata de araucária, até as casas subterrâneas
   kaingang no alto do morro e a boca da caverna, onde o bugreiro de 1888 ainda monta guarda. Lá dentro,
   a caverna dos olhos e o tesouro de luz da cobra; e depois, morro abaixo, na carroceria do caminhão. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;
  var Z = { pasture: 0, erva: 56, forest: 104, village: 164, mouth: 186, cave: 208, boss: 284, wall: 300, road: 306, end: 322 };

  TC.buildLevel5 = function () {
    var A = TC.ART, C2 = A.ch2Init(), C3 = A.ch3Init(), C5 = A.ch5Init();
    var W = Z.end, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 5, music: 'stage5', cardNum: 'stage5.num', cardName: 'stage5.name', comboY: 38,
      allowCover: false
    };
    L.ZONE = Z;
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    var x, i;

    /* ---------- chão, estilos e relevo ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) {
      L.style[x] = x < Z.erva ? 'pasture' : x < Z.forest ? 'erva' : x < Z.village ? 'forest' : x < Z.mouth ? 'village' :
        x < 206 ? 'mouth' : x < Z.wall ? 'cave' : x < Z.road ? 'wall' : 'bed';
    }
    // a sanga do potreiro (um pulo)
    fill(33, 34, 12, 12, 0); fill(33, 34, 13, 13, 4);
    // os raídos empilhados (plataforma; o desenho vem do cenário)
    fill(81, 84, 10, 10, 2);
    // ressaltos de basalto subindo o morro
    fill(108, 110, 11, 11, 3); fill(111, 114, 10, 11, 3); fill(115, 116, 11, 11, 3);
    fill(139, 140, 11, 11, 3); fill(141, 143, 10, 11, 3); fill(144, 145, 11, 11, 3);
    // prateleira de pedra na caverna e o poço d'água
    fill(234, 236, 10, 10, 2);
    fill(243, 244, 12, 12, 0); fill(243, 244, 13, 13, 4);
    // a parede que separa a caverna da estrada (ninguém passa: o caminho é o caminhão)
    fill(Z.wall, Z.road - 1, 0, 13, 3);
    L.pits = [[167, 168], [172, 173], [178, 179]];
    L.pits.forEach(function (pp) { L.style[pp[0]] = 'pitL'; L.style[pp[1]] = 'pitR'; });

    /* ---------- cenário ---------- */
    var r = TC.RNG(1888);
    var seed = 500;
    function back(cv, px, py, z, extra) {
      var o = { cv: cv, x: Math.round(px), y: Math.round(py), z: z || 0 };
      if (extra) for (var k in extra) o[k] = extra[k];
      L.back.push(o);
      return o;
    }
    function tree(px, kind, h, z) {
      var cv = kind === 'a' ? A.araucaria(seed++, h || r.int(150, 210)) : kind === 'p' ? A.pine(seed++, h || r.int(80, 110)) : kind === 'e' ? C2.erva(seed++, h || r.int(36, 54)) : A.autumnTree(seed++, h || r.int(80, 104));
      return back(cv, px - cv.baseX, GY + 2 - cv.height, z == null ? 1 : z);
    }
    function sign(tx, key, cv, y) {
      if (cv) back(cv, tx * TS - Math.round(cv.width / 2), y != null ? y : GY + 2 - cv.height, 2);
      L.signs.push({ x: tx * TS, y: GY, key: key });
    }
    function glow(o, dx, dy, rr, col, a, flicker) {
      (o.lights = o.lights || []).push({ dx: dx, dy: dy, r: rr, col: col, a: a, flicker: flicker });
      (o.glows = o.glows || []).push({ dx: dx, dy: dy, r: Math.max(3, rr / 8), col: col, a: 0.5, flicker: flicker });
    }

    // --- 1. o potreiro da Linha Becker ---
    sign(3, 's5.linha', C2.sign(92, 22, [['POTREIRO BECKER', '#f0e0b0'], ['LINHA BECKER', '#d8c890']], { legs: 12, bg: '#3a2a1c' }));
    back(C5.gate(), 5 * TS, GY + 2 - 40, 1);
    for (x = 9 * TS; x < Z.erva * TS - 40; x += 128) back(C5.fence(128, x > 26 * TS && x < 40 * TS), x, GY + 2 - 30, 0);
    [[11, 0, 1], [18, 1, -1], [24, 2, 1], [44, 1, -1], [49, 0, 1]].forEach(function (cw) {
      var cv = C5.cowStatic(cw[1]);
      var o = back(cw[2] < 0 ? TC.flip(cv) : cv, cw[0] * TS, GY - 7 - cv.height + 8, -1);
      o.cow = true;
    });
    back(C5.cowLying(), 28 * TS, GY - 30, -1);
    back(C5.trough(), 21 * TS, GY + 1 - 14, 1);
    [8, 30, 46].forEach(function (tx) { tree(tx * TS, 'o', r.int(84, 100), 0); });
    [15, 37, 52].forEach(function (tx) { tree(tx * TS, 'a', r.int(160, 200), -1); });

    // --- 2. as ruínas da ervateira dos Becker ---
    (function () {
      var sg = C2.sign(124, 22, [['ERVATEIRA BECKER', '#f0e0b0'], ['DESDE 1889', '#c8d8a0']], { legs: 12, bg: '#2a3a24', trim: '#5a7a4a' });
      var tilt = TC.rotate(sg, 0.12);
      back(tilt, 59 * TS - tilt.width / 2, GY + 5 - (tilt.height + sg.height) / 2, 2);
      L.signs.push({ x: 59 * TS, y: GY, key: 's5.erva' });
    })();
    for (x = Z.erva; x < Z.forest; x += r.int(2, 4)) {
      if (x >= 80 && x <= 95) continue;
      var k2 = r();
      tree(x * TS + r.int(0, 8), k2 < 0.2 ? 'a' : 'e', k2 < 0.2 ? r.int(150, 200) : r.int(30, 50), k2 < 0.2 ? -1 : 0);
    }
    back(C5.raidos(4), 81 * TS - 6, 10 * TS - 16, 2);
    back(C5.raidos(3), 76 * TS, GY + 2 - 30, 1);
    back(C5.carijoRuin(), 70 * TS, GY + 2 - 70, 0);
    back(C5.barbaqua(), 90 * TS, GY + 2 - 90, -1);

    // --- 3. a mata de araucária subindo o morro ---
    for (x = Z.forest; x < Z.village; x += r.int(3, 5)) tree(x * TS + r.int(0, 10), 'a', r.int(170, 230), r() < 0.5 ? -1 : 0);
    [[106, 30, 18], [124, 36, 20], [133, 24, 14], [152, 40, 22], [160, 30, 18]].forEach(function (rk, k) { back(C5.rock(rk[0] + k, rk[1], rk[2]), rk[0] * TS, GY + 2 - rk[2], 1); });
    // ressaltos: pedra de basalto
    sign(138, 's5.gralha', C2.sign(84, 22, [['NÃO CORTE', '#f0e0b0'], ['O PINHEIRO', '#d8c890']], { legs: 10, bg: '#3a2a1c' }));
    L.gralhas = [[107, 10 * TS + 8 + 2], [113, 9 * TS + 18], [128, GY], [142, 9 * TS + 18], [158, GY], [166, GY]];

    // --- 4. as casas subterrâneas kaingang ---
    [[165, 'a', 220], [171, 'a', 200], [176, 'a', 236], [182, 'a', 210]].forEach(function (tp) { tree(tp[0] * TS, tp[1], tp[2], -1); });
    (function () {
      var pg = C5.petroglyph();
      back(pg, 175 * TS - pg.width / 2, GY + 2 - pg.height, 1);
      L.signs.push({ x: 175 * TS, y: GY, key: 's5.stone' });
    })();

    // --- 5. a boca da caverna ---
    (function () {
      var cm = C5.caveMouth();
      L._mouth = back(cm, 206 * TS - cm.mouthX, GY + 2 - cm.height, -1);
      L._mouth.lights = [];
      var cs = C2.sign(100, 22, [['CAVERNA DOS BUGRES', '#f0e0b0'], ['PONTO TURÍSTICO - 1950', '#c8b890']], { legs: 12, bg: '#4a3020', trim: '#7a5a3a' });
      var csr = TC.rotate(cs, -0.06);
      back(csr, 187 * TS - csr.width / 2, GY + 4 - (csr.height + cs.height) / 2, 2);
      L.signs.push({ x: 187 * TS + 4, y: GY, key: 's5.cavesign' });
      var fp = C5.firePit();
      L._fireX = 197 * TS; L._firePit = back(fp, L._fireX - 20, GY + 1 - 14, 2);
    })();
    tree(188 * TS, 'a', 214, -2);

    // --- 6. a caverna dos olhos ---
    (function () {
      // velas e lampiões espalhados (o caminho do tesouro)
      [216, 228, 248, 262].forEach(function (tx, k) {
        var cv = TC.canvas(4, 3); cv.ctx.fillStyle = TC.col('#3a2a20'); cv.ctx.fillRect(0, 0, 4, 3);
        var o = back(cv, tx * TS + k * 3, GY + 1 - 3, 2, { candle: true });
        o.lights = [{ dx: 6, dy: -5, r: 30, col: '#ffc070', a: 0.7, flicker: true }];
        o.glows = [{ dx: 6, dy: -6, r: 4, col: '#ffe0a0', a: 0.7, flicker: true }];
      });
      var tr = C5.treasure(7);
      var tro = back(tr, 267 * TS, GY + 2 - tr.height, 1);
      tro.lights = []; tro.glows = [];
      tr.lights.forEach(function (l) { tro.lights.push({ dx: l.x, dy: l.y, r: l.big ? 50 : 24, col: l.col, a: 0.6, flicker: false }); tro.glows.push({ dx: l.x, dy: l.y, r: l.big ? 8 : 3, col: l.col, a: 0.6, flicker: false }); });
      sign(230, 's5.candles', null);
    })();
    // pontos de retorno da caverna: lampiões apagados que o Arno reacende
    L.lanterns = [];
    [[238, 15], [278, 17]].forEach(function (lp) {
      var cv = TC.canvas(12, 22), c = cv.ctx;
      c.fillStyle = TC.col('#2a2a30'); c.fillRect(5, 0, 2, 6); c.fillRect(1, 6, 10, 2); c.fillRect(2, 18, 8, 3);
      c.fillStyle = TC.col('#4a4a54'); c.fillRect(2, 8, 1, 10); c.fillRect(9, 8, 1, 10);
      c.fillStyle = TC.col('#3a3440'); c.fillRect(3, 8, 6, 10);
      var o = back(cv, lp[0] * TS - 6, GY + 1 - 22, 2);
      L.lanterns.push({ x: lp[0] * TS + 8, cp: lp[1], o: o, lit: false });
    });

    // --- 7. a toca da cobra e o tesouro de luz ---
    (function () {
      var x0 = Z.boss * TS;
      var tr = C5.treasure(3);
      var tro = back(tr, x0 + 60, GY + 2 - tr.height, 0);
      tro.lights = []; tro.glows = [];
      tr.lights.forEach(function (l) { tro.lights.push({ dx: l.x, dy: l.y, r: l.big ? 60 : 28, col: l.col, a: 0.75, flicker: false }); tro.glows.push({ dx: l.x, dy: l.y, r: l.big ? 9 : 4, col: l.col, a: 0.7, flicker: false }); });
      L._treasure = tro;
      // o caminhão do Arno, lá no fundo, enrolado pela cobra
      var truck = TC.scaleCanvas(A.truckSmall(), 2);
      L._truck5 = back(truck, x0 + 150, GY + 2 - truck.height - 30, -1);
      L._truck5.lights = [{ dx: truck.width - 2, dy: 13, r: 20, col: '#ffe0a0', a: 0.4 }];
      // a toca: um buraco escuro no paredão da direita
      var hole = TC.canvas(48, 40), hc = hole.ctx;
      hc.fillStyle = TC.col('#2a1810'); TC.fillEllipse(hc, 24, 20, 23, 19);
      hc.fillStyle = TC.col('#0a0503'); TC.fillEllipse(hc, 24, 21, 18, 15);
      back(hole, x0 + SW - 46, GY - 62, 1);
    })();

    /* ---------- primeiro plano ---------- */
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
    var rock = TC.sprite([
      '.....kkk........',
      '...kkkkkkk..kk..',
      '..kkkkkkkkkkkkk.',
      '.kkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#050304' });
    for (x = 120; x < Z.wall * TS * 1.25; x += r.int(150, 300)) {
      var wx = x / 1.25;
      L.front.push({ cv: wx > Z.cave * TS ? rock : wx > Z.forest * TS ? fern : grass, x: x, y: wx > Z.cave * TS ? 219 : wx > Z.forest * TS ? 217 : 218 });
    }

    /* ---------- itens e quebráveis ---------- */
    [[10, 'bale', 'cuca'], [26, 'bale', 'balas'], [31, 'bale', 'linguica'], [47, 'bale', 'chimarrao'],
      [66, 'raido', 'balas'], [74, 'raido', 'cuca'], [96, 'raido', 'linguica'], [101, 'raido', 'chimarrao'],
      [117, 'barrel', 'balas'], [126, 'crate', 'pinhao'], [150, 'barrel', 'cuca'], [157, 'crate', 'balas'],
      [190, 'crate', 'chimarrao'], [211, 'barrel', 'balas'], [222, 'crate', 'linguica'], [240, 'barrel', 'chimarrao'],
      [256, 'crate', 'balas'], [264, 'barrel', 'cuca'], [281, 'barrel', 'chimarrao']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[82, 10], [83, 10], [112, 10], [113, 10], [142, 10], [235, 10]].forEach(function (p) { L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 }); });
    [[109, 11], [145, 11], [170, 12], [181, 12]].forEach(function (p) { L.items.push({ type: 'pinhao', x: p[0] * TS + 8, y: p[1] * TS - 6 }); });
    L.items.push({ type: 'medalha', x: 142 * TS + 8, y: 10 * TS - 22 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('c5ox', 10, GY, { face: 1 });
    sp('c5ox', 59, GY); sp('c5erv', 76, GY); sp('c5dog', 98, GY);
    sp('flame', 112, 70); sp('c5dog', 130, GY); sp('crow', 140, 70); sp('c5dog', 155, GY);
    sp('bat', 220, 50); sp('c5eye', 236, 140); sp('bat', 247, 44); sp('c5eye', 270, 140); sp('bat', 275, 50);

    /* ---------- arenas ---------- */
    function ox(side) { return { t: 'c5ox', side: side, y: GY }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function ev(side) { return { t: 'c5erv', side: side, y: GY }; }
    function dg(side) { return { t: 'c5dog', side: side, y: GY }; }
    function cr(side) { return { t: 'crow', side: side, y: 60 }; }
    function bt(side, y) { return { t: 'bat', side: side, y: y || 56, opt: { fly: side === 'l' ? 1 : -1 } }; }
    function ey(side) { return { t: 'c5eye', side: side, y: 130 }; }
    L.arenas = [
      { x0: 14 * TS, waves: [[ox('r')], [f('l'), f('r')], [ox('l'), f('r')]] },
      { x0: 39 * TS, waves: [[ox('r')], [ox('l'), f('r')], [ox('r'), ox('l')]] },
      { x0: 63 * TS, waves: [[ev('r'), ev('l')], [dg('r'), dg('l')], [ev('r'), dg('l'), ev('l')]] },
      { x0: 87 * TS, waves: [[dg('r'), dg('r')], [ev('l'), ev('r'), dg('r')], [ox('r'), dg('l')]] },
      { x0: 120 * TS, waves: [[f('r'), cr('r')], [dg('l'), dg('r'), f('l')], [cr('l'), dg('r'), ev('r')]] },
      { x0: 147 * TS, waves: [[dg('r'), f('l')], [ev('r'), dg('l')], [f('l'), dg('r'), ox('r')]] },
      { x0: 189 * TS, boss: true, kind: 'jacob', waves: [] },
      { x0: 214 * TS, waves: [[ey('r')], [bt('l'), bt('r'), ey('l')], [f('r'), ey('l'), bt('r')]] },
      { x0: 250 * TS, waves: [[ey('l'), ey('r')], [bt('l'), f('r'), ey('r')], [ey('l'), bt('r'), ey('r')]] },
      { x0: Z.boss * TS, boss: true, kind: 'boig', waves: [] },
      { x0: Z.road * TS, boss: true, kind: 'boit', waves: [] }
    ];
    L.jacobArena = L.arenas[6];
    L.boigArena = L.arenas[9];
    L.roadArena = L.arenas[10];
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 14 * TS + 30 }, { x: 38 * TS + 8, shrine: true }, { x: 39 * TS + 30 }, { x: 61 * TS + 8, shrine: true },
      { x: 63 * TS + 30 }, { x: 85 * TS + 8, shrine: true }, { x: 87 * TS + 30 }, { x: 118 * TS + 8, shrine: true },
      { x: 120 * TS + 30 }, { x: 146 * TS + 8, shrine: true }, { x: 147 * TS + 30 }, { x: 189 * TS + 30 }, { x: 204 * TS + 8 },
      { x: 214 * TS + 30 }, { x: 238 * TS + 8 }, { x: 250 * TS + 30 }, { x: 278 * TS + 8 }, { x: Z.boss * TS + 30 }, { x: Z.road * TS + 100 }
    ];
    var acp = [1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 19];
    L.arenas.forEach(function (a, k) { a.cp = acp[k]; });
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });
    L.FIRE_CP = 13;

    /* falas ao passar */
    L.barks = [
      { x: 9 * TS, key: 'b5.pasture', face: 'shock' },
      { x: 37 * TS, key: 'b5.fence' },
      { x: 57 * TS, key: 'b5.erva' },
      { x: 105 * TS, key: 'b5.forest' },
      { x: 165 * TS, key: 'b5.village' },
      { x: 180 * TS, key: 'b5.village2' },
      { x: 186 * TS, key: 'b5.mouth', face: 'shock' },
      { x: 209 * TS, key: 'b5.cave', face: 'shock' },
      { x: 268 * TS, key: 'b5.treasure' },
      { x: 280 * TS, key: 'b5.truck', face: 'shock' }
    ];

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#4c4e80', fog: 0.35 },
      { x: Z.erva * TS, ambient: '#4a4474', fog: 0.4 },
      { x: Z.forest * TS, ambient: '#3c4472', fog: 0.45 },
      { x: Z.village * TS, ambient: '#424e74', fog: 0.3 },
      { x: Z.mouth * TS, ambient: '#3a3656', fog: 0.3 },
      { x: Z.cave * TS, ambient: '#2c2228', fog: 0.12 },
      { x: Z.boss * TS, ambient: '#2e2428', fog: 0.08 },
      { x: Z.wall * TS, ambient: '#3a3a60', fog: 0 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C2, C3, C5);
    return L;
  };

  /* =================================================================== */
  function hooks(L, C2, C3, C5) {
    var A = TC.ART, E = TC.ent;
    var baseT = null;
    var st0 = null;

    /* ---------- quebráveis: fardo de feno e saco de erva ---------- */
    function Bale(kind, x, y, drop) { E.Breakable.call(this, 'crate', x, y, drop); this.kind5 = kind; this.name = kind === 'bale' ? 'en.c5bale' : 'en.c5raido'; this.w = 15; this.h = kind === 'bale' ? 13 : 15; }
    Bale.prototype = Object.create(E.Breakable.prototype);
    Bale.prototype.hit = function (st, dmg, dir, kb, id) {
      var res = E.Breakable.prototype.hit.call(this, st, dmg, dir, kb, id);
      if (res && !this.alive) for (var i = 0; i < 12; i++) st.parts.add({ x: this.x, y: this.y - 8, vx: TC.rnd.range(-2, 2) + dir, vy: TC.rnd.range(-3, -1), ay: 0.15, life: 50, color: TC.rnd.pick(this.kind5 === 'bale' ? ['#e8c870', '#c8a048', '#8a6a28'] : ['#3a5a2a', '#5a7a3a', '#a08a5a']), size: 1, fade: true, wobble: 0.1 });
      return res;
    };
    Bale.prototype.draw = function (c, cx, cy) {
      var img = this.kind5 === 'bale' ? C5.bale : C5.raidoImg;
      var sx = this.shake ? ((this.shake % 2) ? 1 : -1) : 0;
      c.drawImage(img, Math.round(this.x - img.width / 2 - cx + sx), Math.round(this.y - img.height - cy));
    };

    /* ---------- fundo: o céu da serra, a caverna dos olhos e a estrada ---------- */
    var wallCv = null, eyesList = null, roadBits = null;
    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#020309'], [0.45, '#0a0c2a'], [0.8, '#1c1c48'], [1, '#2c2a5c']], 1888, 0.007);
      bg.tw = A.twinkles(SW, 110, 34, 55);
      bg.moon = A.moon(12);
      bg.far = A.hills(512, 70, { seed: 55, color: '#1c2046', rim: '#363e78', base: 0.42, amp: 0.7, trees: 50, treeMin: 5, treeMax: 10, period: 6, arauc: 0.9 });
      bg.mid = A.hills(512, 90, { seed: 59, color: '#111430', rim: '#262c58', base: 0.34, amp: 0.6, trees: 90, treeMin: 8, treeMax: 18, period: 6, arauc: 0.95 });
      var tl = TC.canvas(768, 140), c = tl.ctx, rr = TC.RNG(5555);
      for (var i = 0; i < 42; i++) {
        var h = rr.int(70, 135);
        var tr = A.araucaria(800 + i, h, { sil: '#0b0d20', rim: '#1c2350' });
        var tx = rr.int(0, 767);
        [-768, 0, 768].forEach(function (o) { c.drawImage(tr, tx - tr.baseX + o, 140 - tr.height); });
      }
      c.fillStyle = TC.col('#0b0d20'); c.fillRect(0, 128, 768, 12);
      bg.trees = tl;
      bg.spire = TC.silhouette(TC.scaleCanvas(A.church(), 0.36), '#14183a');
      bg.fog = A.fog(512, 52, 25, '#8a8ab8');
      bg.fogFront = A.fog(512, 40, 37, '#9a9ac8');
      prepareCave(A);
      prepareRoad(A);
      bg.extra = function (cc, camX, t) {
        var st = st0;
        if (camX + SW > Z.cave * TS - 20 && camX < Z.wall * TS) drawCave(cc, camX, t, st);
        if (camX >= Z.wall * TS - 8) drawRoad(cc, camX, t, st);
      };
      return bg;
    };

    function prepareCave(A) {
      var Wd = 512, Hd = 200;
      wallCv = TC.canvas(Wd, Hd);
      var c = wallCv.ctx, rr = TC.RNG(207);
      for (var y = 0; y < Hd; y++) {
        for (var x = 0; x < Wd; x++) {
          var n = TC.fbm2(x / 40, y / 18, 208, 3, Wd / 40, 0);
          var col = n > 0.6 ? '#2a1810' : n > 0.45 ? '#20120c' : n > 0.32 ? '#180e0a' : '#120a06';
          if (y % 9 === 0 && TC.hash2(x >> 3, y, 209) > 0.5) col = '#0c0604';
          c.fillStyle = col; c.fillRect(x, y, 1, 1);
        }
      }
      // teto com estalactites de arenito
      var ceil = TC.tint(C3.stalactites(Wd, 21), '#2a1a12', 0.6);
      c.drawImage(ceil, 0, 0);
      c.fillStyle = TC.col('#0a0503'); c.fillRect(0, 0, Wd, 8);
      // as órbitas dos olhos (os olhos são desenhados por cima, vivos)
      eyesList = [];
      for (var k = 0; k < 26; k++) {
        var ex = rr.int(8, Wd - 8), ey = rr.int(40, 150), s = rr() < 0.3 ? 2 : 1;
        var ok = true;
        for (var j = 0; j < eyesList.length; j++) if (Math.abs(eyesList[j].x - ex) < 22 && Math.abs(eyesList[j].y - ey) < 16) ok = false;
        if (!ok) continue;
        eyesList.push({ x: ex, y: ey, s: s, ph: rr() * 100, sp: 0.004 + rr() * 0.01 });
        c.fillStyle = TC.col('#060302'); TC.fillEllipse(c, ex, ey, 6 * s, 3 * s + 1);
      }
    }
    var ROAD_W = 512;
    function prepareRoad(A) {
      roadBits = {};
      roadBits.night = A.sky(SW, TC.H, [[0, '#04050f'], [0.5, '#0c0e2c'], [1, '#262850']], 3, 0.004);
      roadBits.dawn = A.sky(SW, TC.H, [[0, '#2a3a7a'], [0.45, '#7a6a9a'], [0.7, '#e8907a'], [1, '#ffd8a0']], 4, 0);
      roadBits.tw = A.twinkles(SW, 100, 40, 61);
      roadBits.far = A.hills(ROAD_W, 80, { seed: 71, color: '#1a1e44', rim: '#3a4280', base: 0.5, amp: 0.7, trees: 40, treeMin: 5, treeMax: 9, period: 5, arauc: 0.9 });
      roadBits.farDawn = TC.tint(roadBits.far, '#6a4a6a', 0.5);
      // o vale: Teewald lá embaixo, quase toda apagada
      var v = TC.canvas(ROAD_W, 70), vc = v.ctx, rr = TC.RNG(72);
      vc.fillStyle = TC.col('#0c0e22'); TC.fillPoly(vc, [[0, 70], [0, 30], [80, 24], [200, 34], [300, 22], [420, 32], [512, 26], [512, 70]]);
      roadBits.townLights = [];
      for (var k = 0; k < 46; k++) { var lx = rr.int(60, 470), ly = rr.int(36, 64); roadBits.townLights.push({ x: lx, y: ly, on: rr() < 0.2, c: rr() < 0.7 ? '#ffb050' : '#ffe0a0' }); }
      var church = TC.silhouette(TC.scaleCanvas(A.church(), 0.22), '#0c0e22');
      vc.drawImage(church, 250, 40 - church.height + 10);
      roadBits.valley = v;
      roadBits.mid = A.hills(ROAD_W, 90, { seed: 73, color: '#0e1028', rim: '#22285a', base: 0.36, amp: 0.5, trees: 70, treeMin: 10, treeMax: 22, period: 4, arauc: 1 });
      var near = TC.canvas(ROAD_W, 180), nc = near.ctx, r2 = TC.RNG(74);
      for (k = 0; k < 7; k++) {
        var tr = A.araucaria(900 + k, r2.int(130, 180), { sil: '#06070e', rim: '#141836' });
        var tx = r2.int(0, ROAD_W);
        [-ROAD_W, 0, ROAD_W].forEach(function (o) { nc.drawImage(tr, tx - tr.baseX + o, 180 - tr.height); });
      }
      roadBits.near = near;
      // defensa metálica da estrada
      var rail = TC.canvas(ROAD_W, 18), rc = rail.ctx;
      for (var x = 0; x < ROAD_W; x += 32) { rc.fillStyle = TC.col('#2a2a34'); rc.fillRect(x + 2, 6, 3, 12); }
      rc.fillStyle = TC.col('#5a5a68'); rc.fillRect(0, 5, ROAD_W, 4); rc.fillStyle = TC.col('#8a8a96'); rc.fillRect(0, 5, ROAD_W, 1);
      roadBits.rail = rail;
    }

    function drawCave(c, camX, t, st) {
      var x0 = Math.max(0, Z.cave * TS - camX - 8), x1 = Math.min(SW, Z.wall * TS - camX);
      if (x1 <= x0) return;
      c.save();
      c.beginPath(); c.rect(x0, 0, x1 - x0, GY + 2); c.clip();
      var par = 0.6, o = Math.round(camX * par) % 512;
      c.drawImage(wallCv, -o, -6); c.drawImage(wallCv, 512 - o, -6);
      // os olhos da parede: piscam e seguem o Arno
      var gl = st && st.glare, warnK = 0, flash = false;
      if (gl && gl.phase === 'warn') warnK = Math.min(1, gl.t / gl.warn);
      if (gl && gl.phase === 'flash') flash = true;
      var p = st ? st.player : null, psx = p ? p.x - camX : 128, psy = p ? p.y - 20 : 160;
      var IR = C5.iris.wall;
      for (var rep = 0; rep < 2; rep++) {
        for (var i = 0; i < eyesList.length; i++) {
          var e = eyesList[i], ex = e.x - o + rep * 512, ey = e.y - 6;
          if (ex < x0 - 12 || ex > x1 + 12) continue;
          var open = Math.max(0, Math.sin(t * e.sp + e.ph) * 1.6 - 0.2);
          if (warnK > 0) open = Math.max(open, warnK * 1.2);
          if (flash) open = 1.3;
          open = Math.min(1, open);
          if (open <= 0.05) continue;
          drawWallEye(c, ex, ey, e.s, open, psx, psy, warnK, flash);
          if (warnK > 0.3 || flash) TC.Lighting.glow(c, ex, ey, 6 * e.s + warnK * 4, '#f0ffb0', flash ? 0.9 : warnK * 0.6);
        }
      }
      c.restore();
    }

    /* um olho da parede: amêndoa clara, íris âmbar com pupila em fenda, pálpebra escura */
    function drawWallEye(c, ex, ey, s, open, psx, psy, warnK, flash) {
      var rw = 6 * s + 1, rh = Math.max(1, Math.round(3.6 * s * open));
      c.fillStyle = '#2a1408'; TC.fillEllipse(c, ex, ey, rw + 1, rh + 1);
      c.fillStyle = flash ? '#ffffff' : TC.mix('#b8ac78', '#f4ffc0', Math.max(open * 0.4, warnK));
      TC.fillEllipse(c, ex, ey, rw, rh);
      c.fillRect(ex - rw - 1, ey, 2, 1); c.fillRect(ex + rw, ey, 2, 1);
      if (flash) return;
      var ri = Math.max(1, Math.min(rh, Math.round(2.6 * s)));
      var ix = Math.round(ex + TC.clamp((psx - ex) / 70, -1, 1) * (rw - ri - 1)), iy = Math.round(ey + TC.clamp((psy - ey) / 70, -1, 1) * Math.max(0, rh - ri));
      c.fillStyle = warnK > 0.5 ? '#ffe060' : '#a86818'; TC.fillCircle(c, ix, iy, ri);
      c.fillStyle = warnK > 0.5 ? '#fff4a0' : '#d89a28'; TC.fillCircle(c, ix, iy, Math.max(0.5, ri - 1));
      c.fillStyle = '#0a0402'; c.fillRect(ix, iy - ri + 1, 1, Math.max(1, ri * 2 - 1));
      if (ri > 1) { c.fillStyle = '#ffffff'; c.fillRect(ix - 1, iy - 1, 1, 1); }
      if (rh > 2) { c.fillStyle = 'rgba(160,40,30,0.6)'; c.fillRect(ex - rw + 1, ey, 2, 1); c.fillRect(ex + rw - 2, ey + 1, 2, 1); }
    }

    function drawRoad(c, camX, t, st) {
      var d = st && st.dawn || 0, lean = st && st.roadLean || 0;
      c.save();
      if (lean) { c.translate(128, 224); c.rotate(lean * 0.05); c.translate(-128, -224); }
      c.drawImage(roadBits.night, -20, -10, SW + 40, TC.H + 20);
      if (d > 0) { c.globalAlpha = d; c.drawImage(roadBits.dawn, -20, -10, SW + 40, TC.H + 20); c.globalAlpha = 1; }
      if (d < 0.7) { c.globalAlpha = 1 - d / 0.7; A.drawTwinkles(c, roadBits.tw, t, 0, 0); c.globalAlpha = 1; }
      // o sol querendo nascer atrás da serra
      if (d > 0.2) TC.Lighting.glow(c, 210, 112 - d * 20, 60 + d * 30, '#ffb070', 0.35 * d);
      var o = Math.round(t * 0.2) % ROAD_W;
      c.drawImage(roadBits.far, -o, 80); c.drawImage(roadBits.far, ROAD_W - o, 80);
      if (d > 0) { c.globalAlpha = d; c.drawImage(roadBits.farDawn, -o, 80); c.drawImage(roadBits.farDawn, ROAD_W - o, 80); c.globalAlpha = 1; }
      o = Math.round(t * 0.45) % ROAD_W;
      c.drawImage(roadBits.valley, -o, 120); c.drawImage(roadBits.valley, ROAD_W - o, 120);
      var lit = st && st.townLit || 0;
      roadBits.townLights.forEach(function (l, k) {
        if (!(l.on || k < lit)) return;
        for (var rep = 0; rep < 2; rep++) {
          var lx = l.x - o + rep * ROAD_W;
          if (lx < -4 || lx > SW + 4) continue;
          c.fillStyle = l.c; c.fillRect(lx, 120 + l.y, 1, 1);
          if (k < lit) TC.Lighting.glow(c, lx, 120 + l.y, 3, l.c, 0.5);
        }
      });
      o = Math.round(t * 1.3) % ROAD_W;
      c.drawImage(roadBits.mid, -o, 118); c.drawImage(roadBits.mid, ROAD_W - o, 118);
      o = Math.round(t * 3.4) % ROAD_W;
      c.globalAlpha = 0.95;
      c.drawImage(roadBits.near, -o, 30); c.drawImage(roadBits.near, ROAD_W - o, 30);
      c.globalAlpha = 1;
      o = Math.round(t * 6) % ROAD_W;
      c.drawImage(roadBits.rail, -o, 184); c.drawImage(roadBits.rail, ROAD_W - o, 184);
      // o asfalto
      c.fillStyle = '#16161e'; c.fillRect(-20, 206, SW + 40, 30);
      c.fillStyle = '#c8a040';
      o = Math.round(t * 8) % 40;
      for (var x = -o; x < SW + 40; x += 40) c.fillRect(x, 216, 20, 2);
      c.restore();
    }

    L.tileFor = function (code, open, st, v) {
      var T = C5.T;
      if (!baseT) baseT = A.tiles();
      if (st === 'bed') return false;
      if (code === 1) {
        if (st === 'pasture') return open ? T.pastTop[v] : baseT.dirt[v];
        if (st === 'erva') return open ? T.redTop[v] : T.red[v];
        if (st === 'forest') return open ? C2.T.grimpaTop[v] : baseT.dirt[v];
        if (st === 'village') return open ? T.villTop[v] : baseT.dirt[v];
        if (st === 'mouth') return open ? T.villTop[v] : baseT.dirt[v];
        if (st === 'cave' || st === 'wall') return open ? T.sandTop[v] : T.sand[v];
        if (st === 'pitL') return open ? T.pitL : baseT.dirt[v];
        if (st === 'pitR') return open ? T.pitR : baseT.dirt[v];
      }
      if (code === 3) {
        if (st === 'cave' || st === 'wall') return open ? T.sandTop[v] : T.sand[v];
        return open ? T.rockTop[v] : T.rock[v];
      }
      if (code === 2 && st === 'erva') return false;
      if (code === 2 && st === 'cave') return T.sandTop[v];
      return null;
    };

    /* ---------- partículas ---------- */
    L.particles = function (st) {
      var cx = st.camX, x = st.player.x;
      if (x > Z.wall * TS) {
        // vento da estrada
        if (st.t % 3 === 0) st.parts.add({ x: cx + SW + 10, y: TC.rnd.range(20, 190), vx: -TC.rnd.range(6, 10), vy: 0, life: 50, color: (st.dawn || 0) > 0.5 ? '#ffe8c8' : '#a8b0e0', size: 1, layer: 2, fade: true });
        return;
      }
      if (x > Z.cave * TS) {
        if (st.t % 9 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(30, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.1, 0.1), life: 200, color: '#c8a888', size: 1, fade: true, wobble: 0.03, layer: 2 });
        if (st.t % 29 === 0) { st.parts.add({ x: cx + TC.rnd.range(0, SW), y: 10, vy: 2.4, ay: 0.15, life: 70, color: '#a0c0e0', size: 1, layer: 1 }); if (TC.rnd() < 0.3) TC.audio.sfx('drip'); }
        return;
      }
      if (x > Z.forest * TS && x < Z.village * TS) {
        // grimpa (as folhas secas da araucária) caindo
        if (st.t % 12 === 0) st.parts.add({ x: cx + TC.rnd.range(-10, SW + 30), y: -6, vx: TC.rnd.range(-0.5, -0.1), vy: TC.rnd.range(0.4, 0.8), life: 400, color: TC.rnd.pick(['#7a4a24', '#5a3a1c', '#8a5a2a']), size: 1, wobble: 0.06, phase: TC.rnd() * 6, layer: 2 });
        return;
      }
      // fogos-fátuos sobre o potreiro e a cerração rasteira
      if (st.t % 16 === 0) {
        var ls = A.leaves()[TC.rnd.int(0, 2)];
        st.parts.add({ x: cx + TC.rnd.range(-10, SW + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6, layer: 2, sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
      }
      if (x < Z.forest * TS && st.t % 50 === 0) st.parts.add({ x: cx + TC.rnd.range(20, SW - 20), y: TC.rnd.range(150, 186), vx: TC.rnd.range(-0.2, 0.2), vy: -0.05, life: 180, color: '#90c8ff', size: 1, fade: true, wobble: 0.05, layer: 1, add: true });
    };

    /* ---------- início ---------- */
    L.init = function (st, save) {
      st0 = st;
      var D = TC.diff();
      st.gun = { ammo: save && save.ammo != null ? save.ammo : 12 };
      st.fireGun = function (p) { TC.ch2.fireGun(st, p); };
      st.glare = { phase: 'idle', t: 0, warn: 0 };
      st.dazzle = 0;
      st.glareT = frames(260);
      st.coneT = frames(120);
      st.fireLit = !!(save && save.fire);
      st.props = st.props.map(function (pr) { return (pr.kind === 'bale' || pr.kind === 'raido') ? new Bale(pr.kind, pr.x, pr.y, pr.drop) : pr; });
      st.roadLean = 0;
      L.gralhas.forEach(function (g) { st.deco.push(new E.c5Gralha(g[0] * TS + 4, g[1], TC.rnd() < 0.5 ? -1 : 1)); });
      var baseKill = st.kill;
      st.kill = function (e) {
        baseKill.call(st, e);
        if (e && !e.isBoss && e.type !== 'c5orb' && !st.noDrops && e.y < L.pxH && st.gun.ammo < 12 && TC.rnd() < 0.08 + D.drop * 0.5) st.items.push(new E.Item('balas', e.x, Math.min(e.y, GY - 8), true));
      };
      // a camada de efeitos: os olhos, o ofuscamento, a curva, a luz alta
      var baseOverlay = st.drawOverlay;
      st.drawOverlay = function (c) { overlay(st, c); baseOverlay.call(st, c); };
      var baseExit = st.exit;
      st.exit = function () { TC.audio.engineStop(0.3); baseExit.call(st); };
      // registro para os testes: onde o Arno caiu e onde morreu
      st._log = { falls: [], deaths: [] };
      if (window.__stats) window.__stats.c5log = st._log;
      var baseFell = st.playerFell, baseDead = st.onPlayerDead;
      st.playerFell = function (p) {
        var near = st.enemies.filter(function (e) { return e.alive && Math.abs(e.x - p.x) < 120; }).map(function (e) { return e.type + ':' + e.state + '@' + Math.round(e.x); }).join('|');
        st._log.falls.push(Math.round(p.x) + (TC.params.bot ? ' s=' + p.state + ' safe=' + Math.round(p.lastSafe.x) + ' ' + near : ''));
        return baseFell.call(st, p);
      };
      st.onPlayerDead = function () { st._log.deaths.push(Math.round(st.player.x) + (st.boss ? ':' + st.boss.type : '')); return baseDead.call(st); };
      L.lanterns.forEach(function (l) { l.lit = false; l.o.lights = null; l.o.glows = null; l.o.candle = false; });
      if (save && save.cp != null) L.lanterns.forEach(function (l) { if (l.cp <= save.cp) lightLantern(l, true); });
    };
    L.saveExtra = function (st, s) {
      s.ammo = st.gun ? st.gun.ammo : 12;
      s.fire = !!st.fireLit;
    };
    L.onRespawn = function (st) {
      if (st.gun && st.gun.ammo < 4) st.gun.ammo = 4;
      st.glare = { phase: 'idle', t: 0, warn: 0 };
      st.dazzle = 0;
      st.curveT = 0; L.curveT = 0; st.roadLean = 0;
      if (L.beam) L.beam.t = 0;
      if (st.truck) { st.truck.beam = 0; st.truck.shout = null; }
      st.deco.forEach(function (d) { if (d instanceof E.c5FirePatch || d instanceof E.c5Pinha || d.isTransient) d.alive = false; });
      st.glareT = frames(300);
      if (!st.roadOn) st.ambientOverride = null;
      TC.fx.mosaic = 1;
    };
    L.speedMul = function (st, p) { return st.dazzle > 0 ? 0.5 : 1; };
    L.debugInfo = function (st) {
      return { glare: st.glare.phase, dazzle: st.dazzle, fire: st.fireLit, road: !!st.roadOn, dawn: Math.round((st.dawn || 0) * 100) / 100, ammo: st.gun ? st.gun.ammo : 0, log: st._log };
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
      TC.font.wrap(TC.t('mission5'), 190).forEach(function (ln, i) { TC.font.draw(c, ln, 128, 76 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
    };

    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, 36, 11);
      c.drawImage(C2.gunIcon, 5, 27);
      var am = st.gun ? st.gun.ammo : 0;
      TC.font.draw(c, (am < 10 ? '0' : '') + am, 17, 27, am ? '#ffe0a0' : ((st.t >> 3) % 2 ? '#ff6050' : '#802020'), { shadow: '#000' });
    };

    /* ---------- a camada de efeitos de tela ---------- */
    function overlay(st, c) {
      var gl = st.glare, p = st.player, t = st.t;
      if (gl.phase === 'warn') {
        var k = Math.min(1, gl.t / gl.warn);
        c.fillStyle = 'rgba(240,255,200,' + (0.06 + 0.12 * k).toFixed(3) + ')';
        c.fillRect(0, 0, SW, TC.H);
        if ((gl.t >> 3) % 2 === 0 || k > 0.7) {
          var big = TC.ui.bigText(TC.t('c5.eyes'), 2, '#ffffff', '#e8f070', '#1a1408');
          c.drawImage(big, 128 - Math.floor(big.width / 2), 58);
        }
        if (p.covering) drawLids(c, 0.6);
      } else if (gl.phase === 'flash') {
        var f = 1 - gl.t / 36;
        if (gl.safe) {
          drawLids(c, 1);
          c.fillStyle = 'rgba(255,240,200,' + (0.25 * f).toFixed(3) + ')'; c.fillRect(0, 0, SW, TC.H);
        } else { c.fillStyle = 'rgba(255,255,240,' + (0.6 + 0.4 * f).toFixed(3) + ')'; c.fillRect(0, 0, SW, TC.H); }
      }
      if (st.dazzle > 0) {
        var dz = st.dazzle / gl.dazMax;
        c.fillStyle = 'rgba(255,255,236,' + (0.85 * dz).toFixed(3) + ')';
        c.fillRect(0, 0, SW, TC.H);
        // manchas verdes da vista ofuscada
        TC.Lighting.glow(c, 128 + Math.sin(t * 0.05) * 30, 100, 40, '#a0ff80', 0.3 * dz);
        if (st.dazzle > 20 && (t >> 4) % 2 === 0) TC.font.draw(c, TC.t('c5.dazzled'), 128, 150, '#806040', { align: 'center' });
      } else if (p.covering && gl.phase === 'idle') drawLids(c, 0.45);
      if (L.curveT > 0 && L.curveWarn > 0) {
        var cb = TC.ui.bigText(TC.t('c5.curve'), 2, '#ffffff', '#ffb040', '#200800');
        if ((t >> 3) % 2 === 0) c.drawImage(cb, 128 - Math.floor(cb.width / 2), 60);
      }
      if (L.beam && L.beam.t > 0) {
        var bt = L.beam.t;
        if (bt < 60 && (t >> 3) % 2 === 0) { var bb = TC.ui.bigText(TC.t('c5.beam'), 2, '#ffffff', '#fff0a0', '#201800'); c.drawImage(bb, 128 - Math.floor(bb.width / 2), 60); }
        if (st.truck && st.truck.beam > 0) {
          c.save(); c.globalCompositeOperation = 'lighter';
          c.fillStyle = 'rgba(255,246,200,' + (0.22 * st.truck.beam).toFixed(3) + ')';
          TC.fillPoly(c, [[SW, 170], [SW - 70, 120], [SW - 70, 200]]);
          c.restore();
          TC.Lighting.glow(c, SW - 2, 182, 30, '#fff8d0', 0.8 * st.truck.beam);
        }
      }
    }
    function drawLids(c, k) {
      // de olhos fechados: o escuro vermelho das pálpebras
      var h = Math.round(TC.H / 2 * k);
      c.fillStyle = 'rgba(20,4,4,0.8)';
      c.fillRect(0, 0, SW, h); c.fillRect(0, TC.H - h, SW, h);
      if (k >= 1) { c.fillStyle = 'rgba(40,8,8,0.85)'; c.fillRect(0, 0, SW, TC.H); }
    }

    /* ---------- os mil olhos: aviso, clarão e ofuscamento ---------- */
    L.glare = function (st, warn, src) {
      if (st.glare.phase !== 'idle') return;
      st.glare = { phase: 'warn', t: 0, warn: warn, src: src || null, dazMax: frames(120) };
      TC.audio.sfx('c5eyes');
      TC.audio.sfx('c5hiss');
      if (!st.coverHint) { st.coverHint = true; st.hint = { key: 'hint.c5cover', t: Math.max(240, warn + 60) }; }
    };
    function glareUpdate(st) {
      var gl = st.glare, p = st.player;
      if (gl.phase === 'warn') {
        gl.t++;
        if (gl.t % 20 === 0) TC.audio.sfx('c5eyes');
        if (gl.t > gl.warn * 0.5) TC.fx.shake(1, 4);
        if (gl.t >= gl.warn) {
          gl.phase = 'flash'; gl.t = 0;
          gl.safe = !!p.covering;
          if (st._log) (st._log.glare = st._log.glare || []).push(gl.safe ? 'safe' : 'dazed');
          TC.audio.sfx('c5glare');
          if (!gl.safe) {
            st.dazzle = gl.dazMax || frames(120);
            p.damage(st, 1, -p.face);
            TC.audio.sfx('c5daze');
            TC.fx.mosaic = 4; TC.fx.tween('mosaic', 1, 90);
            st.floatText(p.x, p.y - 40, TC.t('c5.dazzle'), '#fff0a0');
          } else st.floatText(p.x, p.y - 40, TC.t('c5.safe'), '#e0f0ff');
        }
      } else if (gl.phase === 'flash') {
        gl.t++;
        // o clarão cega os bichos também
        st.enemies.forEach(function (e) { if (!e.isBoss && e.alive && !e.dying) e.hitstop = Math.max(e.hitstop || 0, 2); });
        if (gl.t >= 36) { gl.phase = 'idle'; gl.t = 0; }
      }
      if (st.dazzle > 0) st.dazzle--;
    }

    /* ---------- pontos de retorno da caverna ---------- */
    function lightLantern(l, quiet) {
      l.lit = true;
      l.o.lights = [{ dx: 6, dy: 12, r: 44, col: '#ffc070', a: 0.85, flicker: false }];
      l.o.glows = [{ dx: 6, dy: 12, r: 5, col: '#ffe0a0', a: 0.8, flicker: false }];
      l.o.candle = false;
      if (!quiet) {
        var st = st0;
        TC.audio.sfx('checkpoint');
        if (l.cp > st.cp) { st.cp = l.cp; st.save(); }
        st.floatText(l.x, 140, TC.t('checkpoint'), '#ffe090');
        st.player.hp = Math.min(st.player.maxHp, st.player.hp + 2);
        for (var k = 0; k < 12; k++) st.parts.add({ x: l.x, y: 168, vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-1.5, -0.3), life: 40, color: '#ffe080', size: 1, layer: 1, fade: true });
      }
    }

    /* ---------- eventos da fase ---------- */
    L.update = function (st) {
      var p = st.player, D = TC.diff();
      var px = p.x;
      // a fogueira acesa (retomando o jogo ou pulando direto para depois do bugreiro)
      if (!st.fireLit && L.jacobArena.done && !st.campCine) lightFire(st, true);
      if (!st.fireActors && st.fireLit) placeCamp(st);
      // a lamparina: na caverna o Arno leva a luz que a cobra quer
      L.playerLight = px > Z.cave * TS - 60 ? { r: 64, col: '#c8a070', a: 0.85 } : null;
      L.allowCover = px > Z.mouth * TS;
      // o caminhão (a estrada começa direto, num teste, ou depois de morrer lá)
      if (px > Z.wall * TS && !st.truck) setupRoad(st);
      // pontos de retorno dos lampiões
      L.lanterns.forEach(function (l) { if (!l.lit && Math.abs(px - l.x) < 14 && st.mode === 'play') lightLantern(l); });
      // os mil olhos da parede (entre as arenas também)
      if (st.mode === 'play') {
        if (px > Z.cave * TS + 16 && px < Z.boss * TS && st.glare.phase === 'idle' && !st.boss) {
          // (nunca em cima do poço d'água: dá tempo de atravessar antes)
          if (--st.glareT <= 0 && Math.abs(px - 243.5 * TS) > 64 && p.onGround) {
            L.glare(st, frames(st.firstGlare ? 96 : 140, D.windup));
            st.firstGlare = true;
            st.glareT = frames(660 + TC.rnd.int(0, 240), D.cool);
          }
        }
        glareUpdate(st);
      }
      // pinhas caindo na mata
      if (st.mode === 'play' && !st.arena && px > Z.forest * TS + 32 && px < Z.village * TS - 16) {
        if (--st.coneT <= 0) {
          var cxp = TC.clamp(px + p.vx * 30 + TC.rnd.range(-30, 30), st.camX + 12, st.camX + SW - 12);
          st.deco.push(new E.c5Pinha(cxp, frames(74, D.windup)));
          if (!st.coneHint) { st.coneHint = true; st.hint = { key: 'hint.c5pinha', t: 260 }; }
          st.coneT = frames(130 + TC.rnd.int(0, 90), D.cool);
        }
      }
      // a música de cada lugar
      if ((st.mode === 'play' || st.mode === 'dialog') && !st.boss && !st.cine && !st.roadOn) {
        var want = px < Z.village * TS - 24 ? 'stage5' : px < Z.mouth * TS - 8 ? 'lore' : 'cave5';
        if (TC.audio.musicName() !== want) TC.audio.music(want, 1.2);
      }
      if (st.roadOn) roadUpdate(st);
    };

    /* ---------- o acampamento na boca da caverna ---------- */
    function lightFire(st, quiet) {
      st.fireLit = true;
      if (!st.fireDeco) { st.fireDeco = new E.Fire(L._fireX, GY - 3, 70); st.deco.push(st.fireDeco); }
      L._mouth.lights = [{ dx: L._mouth.cv.mouthX, dy: 150, r: 90, col: '#ff9040', a: 0.7, flicker: false }, { dx: L._mouth.cv.mouthX - 40, dy: 120, r: 60, col: '#ffb060', a: 0.5 }];
      if (!quiet) { TC.audio.sfx('c5fire'); TC.audio.sfx('flame'); TC.fx.flash('#ffb060', 0.4, 0.03); }
    }
    function placeCamp(st) {
      var cast = A.castInit();
      var fr = new E.Actor(cast.frida, L._fireX - 30, GY, 1); fr.pose = 'cuia'; fr.speed = 30;
      var ro = new E.Actor(cast.rosa, L._fireX + 26, GY, -1); ro.pose = 'idle'; ro.speed = 30;
      var ew = new E.Actor(C3.ewald, L._fireX - 52, GY, 1); ew.pose = 'idle'; ew.speed = 32;
      st.deco.push(fr, ro, ew);
      st.fireActors = { frida: fr, rosa: ro, ewald: ew };
    }

    /* ---------- a estrada: o caminhão, a curva, a luz alta, o amanhecer ---------- */
    function setupRoad(st) {
      var a = L.roadArena;
      st.truck = new E.c5Truck(a.x0 - 10, GY);
      st.deco.push(st.truck);
      st.roadOn = true;
      st.dawn = 0;
      L.curveTimer = frames(520, TC.diff().cool);
      L.beamTimer = frames(420, TC.diff().cool);
      L.curveT = 0; L.beam = { t: 0 };
      TC.audio.engineStart();
      TC.audio.engineSet(0.7, 0.07);
    }
    function roadUpdate(st) {
      var p = st.player, D = TC.diff(), bs = st.boss, a = L.roadArena;
      if (bs && bs.type === 'c5boit' && bs.state !== 'dying' && bs.state !== 'downed') {
        st.dawn = TC.clamp(1 - bs.hp / (bs.maxHp * 0.5), 0, 1) * 0.85;
        st.ambientOverride = TC.mix('#30305a', '#a08a88', st.dawn);
      }
      if (!bs || st.mode !== 'play' || bs.type !== 'c5boit') { if (L.curveT > 0) L.curveT = 0; st.roadLean *= 0.9; return; }
      // "Curva!": o Ewald grita, a carroceria inclina e o Arno escorrega
      if (L.curveT > 0) {
        L.curveT--;
        if (L.curveWarn > 0) L.curveWarn--;
        else {
          st.roadLean += (L.curveDir - st.roadLean) * 0.08;
          if (p.state !== 'cine' && p.state !== 'dead') {
            var nx = p.x + L.curveDir * 0.85;
            p.x = TC.clamp(nx, L.minX + 6, L.maxX - 6);
          }
        }
        if (L.curveT <= 0) { st.truck.shout = null; }
      } else {
        st.roadLean *= 0.92;
        if (--L.curveTimer <= 0 && bs.state === 'fly' && st.glare.phase === 'idle') {
          L.curveDir = TC.rnd() < 0.5 ? -1 : 1;
          L.curveWarn = frames(46, D.windup);
          L.curveT = L.curveWarn + 120;
          st.truck.shout = 'curve';
          TC.audio.sfx('horn'); TC.audio.sfx('skid');
          st.floatText(a.x0 + 232, 120, TC.t('c5.curve2'), '#d8a878');
          L.curveTimer = frames(800 + TC.rnd.int(0, 300), D.cool);
        }
      }
      // a luz alta: a Boitatá não resiste
      var bm = L.beam;
      if (bm.t > 0) {
        bm.t++;
        st.truck.beam = bm.t < 20 ? bm.t / 20 : bm.t > 120 ? Math.max(0, 1 - (bm.t - 120) / 30) : 1;
        if (bm.t === 24 && bs.state === 'fly') bs.set('gulp');
        if (bm.t > 150) { bm.t = 0; st.truck.beam = 0; st.truck.shout = null; }
      } else if (--L.beamTimer <= 0 && bs.state === 'fly' && L.curveT <= 0 && st.glare.phase === 'idle') {
        bm.t = 1;
        st.truck.shout = 'beam';
        TC.audio.sfx('c5beams');
        if (!st.beamHint) { st.beamHint = true; st.hint = { key: 'hint.c5beam', t: 300 }; }
        L.beamTimer = frames(640 + TC.rnd.int(0, 160), D.cool);
      }
    }

    /* ---------- piloto automático (testes): olhos fechados, sair da mira, ir na cabeça tonta ---------- */
    L.botGoal = function (st, p) {
      var gl = st.glare;
      if (gl.phase === 'flash' || (gl.phase === 'warn' && gl.t > gl.warn - 52)) return p.onGround ? { duck: true } : null;
      var goal = null, i;
      // pinhas: sair de baixo da sombra
      for (i = 0; i < st.deco.length; i++) {
        var d = st.deco[i];
        if (d instanceof E.c5Pinha && !d.landed && d.t > d.delay - 56 && Math.abs(p.x - d.x) < 18) {
          var away = p.x < d.x ? -1 : 1;
          if (p.x + away * 40 < (L.minX || 0) + 10 || p.x + away * 40 > (L.maxX || L.pxW) - 10) away = -away;
          return { x: d.x + away * 36, noAtk: true };
        }
        if (d instanceof E.c5FirePatch && Math.abs(p.x - d.x) < d.hw + 10 && d.life > 10) {
          var aw = p.x < d.x ? -1 : 1;
          if (p.x + aw * 40 < (L.minX || 0) + 10 || p.x + aw * 40 > (L.maxX || L.pxW) - 10) aw = -aw;
          goal = { x: d.x + aw * (d.hw + 22) };
        }
      }
      if (goal) return goal;
      for (i = 0; i < st.enemies.length; i++) {
        var e = st.enemies[i];
        if (!e.alive || e.dying) continue;
        if (e.type === 'c5ox' && e.botJump(p)) return { jump: true };
        if (e.type === 'c5eye' && e.state === 'charge' && e.t >= frames(40, TC.diff().windup) && e.beamHits(p.hurtBox())) return { jump: true };
        if (e.type === 'c5jacob') {
          if (e.state === 'lock' || (e.state === 'aim' && e.t > frames(26, TC.diff().windup))) {
            var dir = p.x < e.tx ? -1 : 1;
            if (e.tx + dir * 50 < e.arena.x0 + 12 || e.tx + dir * 50 > e.arena.x0 + SW - 12) dir = -dir;
            return { x: e.tx + dir * 52, noAtk: true };
          }
        }
        if (e.type === 'c5boig') {
          if ((e.state === 'aim' && e.t > frames(40, TC.diff().windup)) || e.state === 'strike') {
            var d2 = p.x < e.tx ? -1 : 1;
            if (e.tx + d2 * 50 < e.arena.x0 + 14 || e.tx + d2 * 50 > e.arena.x0 + SW - 30) d2 = -d2;
            return { x: e.tx + d2 * 54, noAtk: true };
          }
          if (e.state === 'stuck') return { x: e.hx + (p.x < e.hx ? -20 : 20), keepAttack: true };
          if (e.state === 'sweepPrep') return { x: e.arena.x0 + 128 };
        }
        if (e.type === 'c5boit') {
          if ((e.state === 'biteAim' && e.t > frames(36, TC.diff().windup)) || e.state === 'bite') {
            var d3 = p.x < e.tx ? -1 : 1;
            if (e.tx + d3 * 50 < L.minX + 8 || e.tx + d3 * 50 > L.maxX - 8) d3 = -d3;
            return { x: e.tx + d3 * 54, noAtk: true };
          }
          if (e.state === 'stuck' || e.state === 'dizzy') return { x: e.hx + (p.x < e.hx ? -20 : 20), keepAttack: true };
          if (e.state === 'gulp') return { x: e.arena.x0 + 168 };
          if (e.state === 'fly' || e.state === 'firePrep' || e.state === 'fireRun' || e.state === 'cones' || e.state === 'rise') return { x: e.arena.x0 + 110 + (L.curveT > 0 && !L.curveWarn ? -L.curveDir * 30 : 0), noAtk: true };
        }
      }
      return null;
    };

    /* =================== AS LUTAS =================== */
    L.bossSeq = function (st, a) {
      if (a.kind === 'jacob') return jacobSeq(st, a);
      if (a.kind === 'boig') return boigSeq(st, a);
      return roadSeq(st, a);
    };

    function* lockPlayer(st, face) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return (p.onGround && p.state !== 'hurt' && p.state !== 'down' && p.state !== 'getup' && p.state !== 'dead') || p.state === 'cine'; });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      if (face) p.face = face;
    }
    function say(st, who, key, face, pos) { return TC.ui.say(st.dlg, [{ who: who, key: key, face: face }], { pos: pos || 'top' }); }

    /* ----- O BUGREIRO ----- */
    function* jacobSeq(st, a) {
      var p = st.player;
      yield* lockPlayer(st, 1);
      TC.audio.stopMusic(1.2);
      TC.fx.tween('letterbox', 22, 40);
      var j = st.spawnEnemy('c5jacob', a.x0 + 186, GY, { arena: a });
      if (TC.params.bosshp) j.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) j.hp = TC.clamp(a.bossHpLeft, 1, j.maxHp);
      j.face = -1;
      st.boss = j;
      TC.audio.sfx('c5bark');
      yield* co.wait(70);
      if (!a.seen) {
        a.seen = true;
        yield* say(st, 'jacob', 'c5.j1', null, 'bottom');
        p.pose = 'shock';
        yield* say(st, 'arno', 'c5.j2', 'shock', 'bottom');
        p.pose = 'idle';
        yield* say(st, 'jacob', 'c5.j3', null, 'bottom');
        yield* say(st, 'arno', 'c5.j4', null, 'bottom');
        yield* say(st, 'jacob', 'c5.j5', null, 'bottom');
        yield* say(st, 'arno', 'c5.j6', null, 'bottom');
      } else yield* co.wait(20);
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music('bug5');
      st.banner = { kind: 'fight', t: 0 };
      j.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.c5jacob', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    }
    L.onJacobHalf = function (st, j) {
      if (st.cine) return;
      st.cine = new TC.Script((function* () {
        st.mode = 'cine';
        yield* say(st, 'jacob', 'c5.j7', null, 'bottom');
        yield* say(st, 'arno', 'c5.j7b', null, 'bottom');
        if (st.mode === 'cine') st.mode = 'play';
      })());
    };
    L.onJacobDown = function (st, j) {
      st.cine = new TC.Script(campSeq(st, j));
    };
    function* campSeq(st, j) {
      var p = st.player, a = L.jacobArena;
      st.killAllMinions();
      st.deco.forEach(function (d) { if (d instanceof E.c5FirePatch) d.alive = false; });
      st.campCine = true;
      yield* lockPlayer(st, j.x > p.x ? 1 : -1);
      TC.fx.tween('letterbox', 22, 30);
      yield* co.wait(20);
      yield* say(st, 'jacob', 'c5.j8');
      TC.audio.sfx('ghostDie');
      for (var k = 0; k < 70; k++) {
        j.alpha = Math.max(0, 1 - k / 60);
        if (k % 2 === 0) st.parts.add({ x: j.x + TC.rnd.range(-12, 12), y: j.y - TC.rnd.range(0, 60), vx: TC.rnd.range(-0.3, 0.3), vy: TC.rnd.range(-1.4, -0.4), life: 50, colors: ['#ffffff', '#b8d0d8', '#5a7080'], size: TC.rnd.int(1, 3), fade: true, layer: 1 });
        yield;
      }
      j.alive = false;
      st.boss = null; st.bossBarFill = 0;
      yield* co.wait(30);
      yield* say(st, 'arno', 'c5.j9');
      // a Dona Frida, o Ewald e a Dona Rosa chegam pela trilha, com os nós de pinho
      TC.audio.music('lore', 1.5);
      var cast = A.castInit();
      var fr = new E.Actor(cast.frida, a.x0 - 20, GY, 1); fr.pose = 'walk'; fr.speed = 6;
      var ro = new E.Actor(cast.rosa, a.x0 - 44, GY, 1); ro.pose = 'walk'; ro.speed = 6;
      var ew = new E.Actor(C3.ewald, a.x0 - 4, GY, 1); ew.pose = 'walk'; ew.speed = 6;
      st.deco.push(fr, ro, ew);
      p.face = -1;
      var tgt = { fr: L._fireX - 30, ro: L._fireX + 26, ew: L._fireX - 52 };
      for (k = 0; k < 400; k++) {
        var done = true;
        [[fr, tgt.fr], [ro, tgt.ro], [ew, tgt.ew]].forEach(function (q) { if (q[0].x < q[1] - 1) { q[0].x += 0.8; done = false; } else q[0].pose = 'idle'; });
        if (done) break;
        yield;
      }
      ro.face = -1;
      // o Arno vem até o fogo
      var stand = L._fireX + 56;
      p.pose = 'run';
      for (k = 0; k < 300 && Math.abs(p.x - stand) > 3; k++) { p.face = stand > p.x ? 1 : -1; p.x += p.face * 1.1; p.anim++; if (p.anim % 16 === 0) TC.audio.sfx('step'); yield; }
      p.pose = 'idle';
      p.face = -1;
      yield* say(st, 'ewald', 'c5.c1');
      yield* say(st, 'arno', 'c5.c2');
      yield* say(st, 'ewald', 'c5.c3');
      yield* say(st, 'rosa', 'c5.c4');
      // a Dona Rosa acende o fogo e reza
      ro.pose = 'pray'; ro.face = -1;
      TC.audio.stopMusic(1.5);
      yield* co.wait(40);
      yield* TC.ui.say(st.dlg, [{ who: null, key: 'c5.cpray' }], { pos: 'top' });
      lightFire(st, false);
      st.fireActors = { frida: fr, rosa: ro, ewald: ew };
      yield* co.wait(60);
      fr.pose = 'cuia';
      ro.pose = 'idle';
      TC.audio.music('lore', 1.5);
      yield* say(st, 'frida', 'c5.c5');
      yield* say(st, 'rosa', 'c5.c6');
      yield* say(st, 'ewald', 'c5.c7');
      // ponto de retorno: o fogo aceso
      if (L.FIRE_CP > st.cp) { st.cp = L.FIRE_CP; }
      st.save();
      p.hp = p.maxHp;
      TC.audio.sfx('checkpoint');
      st.floatText(L._fireX, 140, TC.t('c5.firecp'), '#ffd090');
      TC.fx.tween('letterbox', 0, 30);
      st.endArena();
      st.campCine = false;
      p.setState('normal');
      st.mode = 'play';
    }

    /* ----- A BOIGUAÇU ----- */
    function* boigSeq(st, a) {
      var p = st.player;
      yield* lockPlayer(st, 1);
      TC.audio.stopMusic(1.5);
      TC.fx.tween('letterbox', 22, 40);
      var b = st.spawnEnemy('c5boig', a.x0 + 200, GY, { arena: a });
      if (TC.params.bosshp) b.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) b.hp = TC.clamp(a.bossHpLeft, 1, b.maxHp);
      st.boss = b;
      TC.audio.sfx('c5hiss');
      TC.fx.shake(2, 50);
      yield* co.wait(90);
      TC.audio.sfx('roar');
      p.pose = 'shock';
      yield* co.wait(30);
      if (!a.seen) {
        a.seen = true;
        yield* say(st, 'arno', 'c5.k1', 'shock', 'bottom');
        p.pose = 'idle';
        yield* say(st, 'arno', 'c5.k2', null, 'bottom');
      }
      p.pose = 'idle';
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music('boss5a');
      st.banner = { kind: 'fight', t: 0 };
      b.set('hover');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.c5boss1', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    }
    /* na metade: a cobra engole o tesouro, pega fogo e vira a Boitatá */
    L.onBoigHalf = function (st, b) { st.cine = new TC.Script(transformSeq(st, b)); };
    function* transformSeq(st, b) {
      var p = st.player, a = L.boigArena;
      st.killAllMinions();
      st.deco.forEach(function (d) { if (d instanceof E.c5FirePatch || d instanceof E.c5Pinha) d.alive = false; });
      st.glare = { phase: 'idle', t: 0, warn: 0 }; st.dazzle = 0;
      yield* lockPlayer(st, 1);
      TC.audio.stopMusic(0.6);
      TC.fx.tween('letterbox', 22, 30);
      // ela se enrola no tesouro
      var tro = L._treasure, tx = tro.x + 96, ty = tro.y + 40;
      for (var k = 0; k < 70; k++) { b.moveHead(tx, ty - 30, 0.06); yield; }
      TC.audio.sfx('c5hiss');
      // e engole as luzes: riscos de luz entrando na boca
      for (k = 0; k < 150; k++) {
        b.moveHead(tx + Math.sin(k * 0.08) * 10, ty - 40, 0.08);
        b.mouth = true;
        if (k % 3 === 0) {
          var l = tro.lights[TC.rnd.int(0, tro.lights.length - 1)];
          var sx = tro.x + l.dx, sy = tro.y + l.dy;
          st.parts.add({ x: sx, y: sy, vx: 0, vy: 0, life: 40, color: TC.rnd.pick(['#ffffff', '#ffe0a0', '#ffb050', '#ff80a0']), size: 2, layer: 1, add: true,
            update: (function (bb) { return function (pt) { pt.vx += (bb.hx - pt.x) * 0.02; pt.vy += (bb.hy - pt.y) * 0.02; pt.vx *= 0.9; pt.vy *= 0.9; }; })(b) });
        }
        tro.lights.forEach(function (lt) { lt.a = Math.max(0, lt.a - 0.005); });
        tro.glows.forEach(function (lt) { lt.a = Math.max(0, lt.a - 0.005); });
        b.mix = Math.min(1, k / 140);
        if (k % 30 === 0) TC.audio.sfx('c5swell');
        yield;
      }
      tro.lights.forEach(function (lt) { lt.a = 0; }); tro.glows.forEach(function (lt) { lt.a = 0; });
      // o tesouro fica apagado: postes, lampiões, velas e a estrela, tudo sem luz
      tro.cv = TC.tint(tro.cv, '#100808', 0.55);
      L._truck5.lights = null;
      // pega fogo
      TC.audio.sfx('roar'); TC.audio.sfx('flame');
      TC.fx.flash('#ffb040', 0.8, 0.03);
      b.mix = 1;
      st.ambientOverride = '#5a3a30';
      p.pose = 'shock';
      yield* co.wait(40);
      // arrebenta o teto da caverna
      b.free = true;
      for (k = 0; k < 60; k++) { b.moveHead(a.x0 + 140, 20, 0.05); yield; }
      TC.audio.sfx('c5crack'); TC.fx.shake(7, 60);
      // o buraco no teto: lá fora, a madrugada
      (function () {
        var hw = 70, hh = 40, hole = TC.canvas(hw * 2, hh), hc = hole.ctx;
        for (var yy = 0; yy < hh; yy++) {
          var half = Math.round(hw * Math.sqrt(Math.max(0, 1 - yy / hh)) * (0.8 + TC.hash2(yy, 3, 9) * 0.2));
          hc.fillStyle = TC.mix('#3a4a8a', '#1a1e40', yy / hh); hc.fillRect(hw - half, yy, half * 2, 1);
          hc.fillStyle = '#2a1810'; hc.fillRect(hw - half - 2, yy, 2, 1); hc.fillRect(hw + half, yy, 2, 1);
        }
        for (var s = 0; s < 12; s++) { hc.fillStyle = '#c8d0f0'; hc.fillRect(hw - 50 + ((s * 37) % 100), (s * 7) % 20, 1, 1); }
        var o = { cv: hole, x: a.x0 + 150 - hw, y: 0, z: 5, lights: [{ dx: hw, dy: 30, r: 90, col: '#8090c0', a: 0.6 }, { dx: hw, dy: 150, r: 70, col: '#6070a8', a: 0.45 }] };
        L.back.push(o);
        L._hole = o;
      })();
      for (k = 0; k < 90; k++) {
        if (k % 2 === 0) st.parts.add({ x: a.x0 + TC.rnd.range(60, 220), y: -10, vx: TC.rnd.range(-0.6, 0.6), vy: TC.rnd.range(1, 3), ay: 0.2, life: 70, color: TC.rnd.pick(['#6a3e26', '#8a5a38', '#4a2a1a']), size: TC.rnd.int(2, 4) });
        b.moveHead(a.x0 + 150, -120, 0.03);
        yield;
      }
      b.state = 'gone'; b.alive = false;
      st.boss = null; st.bossBarFill = 0;
      st.ambientOverride = '#4a4048';
      yield* co.wait(30);
      p.pose = 'idle';
      yield* say(st, 'arno', 'c5.k3', 'shock');
      // o Ewald chega correndo
      var ew = new E.Actor(C3.ewald, a.x0 - 10, GY, 1); ew.pose = 'walk'; ew.speed = 4;
      st.deco.push(ew);
      p.face = -1;
      for (k = 0; k < 120 && ew.x < p.x - 34; k++) { ew.x += 1.4; yield; }
      ew.pose = 'idle';
      yield* say(st, 'ewald', 'c5.k4');
      yield* say(st, 'arno', 'c5.k5');
      TC.fx.fadeOut(40);
      yield* co.wait(46);
      // corte: morro abaixo, na carroceria
      ew.alive = false;
      a.done = true;
      st.arena = null;
      L.minX = 0; L.maxX = L.pxW;
      st.ambientOverride = null;
      var ra = L.roadArena;
      p.x = L.cps[ra.cp].x; p.y = GY; p.vx = p.vy = 0; p.face = 1;
      st.camX = ra.x0;
      if (!st.truck) setupRoad(st);
      st.cp = Math.max(st.cp, ra.cp); st.save();
      TC.fx.tween('letterbox', 22, 1);
      TC.fx.fadeIn(40);
      st.startArena(ra);
    }

    /* ----- A BOITATÁ, MORRO ABAIXO ----- */
    function* roadSeq(st, a) {
      var p = st.player;
      if (!st.truck) setupRoad(st);
      L.minX = a.x0 + 8; L.maxX = a.x0 + 204;
      yield* lockPlayer(st, 1);
      TC.fx.tween('letterbox', 22, 30);
      TC.audio.stopMusic(1);
      var b = st.spawnEnemy('c5boit', a.x0 - 60, 60, { arena: a });
      b.hp = Math.round(b.maxHp * 0.5);
      if (TC.params.bosshp) b.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) b.hp = TC.clamp(a.bossHpLeft, 1, b.maxHp);
      st.boss = b;
      st.dawn = TC.clamp(1 - b.hp / (b.maxHp * 0.5), 0, 1) * 0.85;
      TC.audio.sfx('flame');
      yield* co.until(function () { return b.hx > a.x0 + 120; });
      TC.audio.sfx('c5hiss');
      if (!a.seen) {
        a.seen = true;
        yield* say(st, 'ewald', 'c5.r1', null, 'bottom');
        yield* say(st, 'arno', 'c5.r2', null, 'bottom');
      }
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 40);
      TC.audio.music('boss5b');
      st.banner = { kind: 'fight', t: 0 };
      b.set('fly');
      L.beamTimer = Math.min(L.beamTimer, frames(320, TC.diff().cool));
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.c5road', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    }

    /* ---------- vitória: ela sobe atrás do sol ---------- */
    L.clearSeq = function* (st) {
      var p = st.player;
      st.mode = 'cine';
      st.killAllMinions();
      st.deco.forEach(function (d) { if (d instanceof E.c5FirePatch || d instanceof E.c5Pinha) d.alive = false; });
      st.glare = { phase: 'idle', t: 0, warn: 0 }; st.dazzle = 0;
      L.curveT = 0; if (L.beam) L.beam.t = 0;
      if (st.truck) { st.truck.beam = 0; st.truck.shout = null; }
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0; p.face = 1;
      TC.fx.tween('letterbox', 22, 40);
      for (var k = 0; k < 120; k++) { st.dawn = Math.min(1, (st.dawn || 0) + 0.004); st.ambientOverride = TC.mix('#30305a', '#c8a090', st.dawn); st.roadLean *= 0.9; yield; }
      p.pose = 'point';
      yield* say(st, 'arno', 'c5.v1');
      yield* say(st, 'ewald', 'c5.v2');
      TC.audio.engineSet(0.3, 0.05);
      p.pose = 'idle';
      yield* co.wait(30);
      TC.fx.tween('letterbox', 0, 30);
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { TC.audio.engineStop(0.5); return TC.Ending5Scene ? new TC.Ending5Scene({ score: score }) : new TC.TitleScene(); };
  }

  function frames(n, k) { return Math.round(n * (k == null ? 1 : k)); }
})();
