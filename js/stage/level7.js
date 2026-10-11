'use strict';
/* Teewald City — Fase 7: "A Última Fita"
   O cerco na praça da Matriz (com o Seu Helmut atirando da janela), o cemitério da colônia, a porta lateral e a cripta
   com o Livro de Bordo do Hoffnung, a torre do sino (os ecos do Ciclope e do Moço, a Hilde costurando o caminho,
   os vaga-lumes da Boitatá) e, na nave, der Alte em forma verdadeira: a nave, o porão do Hoffnung e o pau-de-fita. */
(function () {
  var TS = 16;
  var GY = 192;
  var co = TC.co;
  var SW = TC.W;

  TC.buildLevel7 = function () {
    var A = TC.ART, C7 = A.ch7Init(), C2 = C7.C2, CAST = C7.CAST;
    var W = 300, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS,
      chapter: 7, music: 'stage7', cardNum: 'stage7.num', cardName: 'stage7.name', comboY: 38
    };
    L.tile = function (tx, ty) {
      if (tx < 0 || tx >= W) return 1;
      if (ty < 0 || ty >= H) return 0;
      return L.tiles[ty * W + tx];
    };
    function set(tx, ty, c) { if (tx >= 0 && tx < W && ty >= 0 && ty < H) L.tiles[ty * W + tx] = c; }
    function fill(x0, x1, y0, y1, c) { for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) set(x, y, c); }
    L.set = set;
    var x, i;
    var Z = { square: 0, cem: 70, crypt: 130, tower: 176, gap0: 213, gap1: 220, dark: 222, flies: 226, darkEnd: 240, bell: 252, nave: 264, boss: 282 };
    L.ZONE = Z;

    /* ---------- chão e estilos ---------- */
    fill(0, W - 1, 12, 13, 1);
    for (x = 0; x < W; x++) L.style[x] = x < Z.cem ? 'square' : x < Z.crypt ? 'grass' : x < Z.tower ? 'crypt' : x < Z.nave ? 'tower' : 'nave';
    // jazigo de pedra no cemitério
    fill(84, 86, 11, 11, 3);
    // sarcófagos na cripta
    fill(135, 136, 11, 11, 3); fill(166, 168, 11, 11, 3);
    // a subida da torre: degraus de tábua e andaimes
    fill(178, 181, 11, 11, 5); fill(182, 185, 10, 11, 5); fill(186, 187, 11, 11, 5);
    fill(182, 185, 7, 7, 2);
    fill(195, 199, 8, 8, 2);
    fill(208, 209, 11, 11, 5);
    // o vão que a Hilde costura
    fill(Z.gap0, Z.gap1, 12, 13, 0);
    fill(230, 232, 11, 11, 5);
    fill(248, 251, 8, 8, 2);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1855);
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
      var cv = A.lampPost(118), px = tx * TS;
      var o = back(cv, px - cv.poleX, GY + 3 - cv.height, 3);
      o.lights = [{ dx: cv.lampX, dy: cv.lampY + 4, r: 70, col: '#ffb060', a: 1, flicker: broken }, { dx: cv.lampX, dy: cv.height - 6, r: 40, col: '#ffc070', a: 0.6, flicker: broken }];
      o.glows = [{ dx: cv.lampX, dy: cv.lampY + 1, r: 9, col: '#ffe0a0', a: 0.9, flicker: broken }];
      L.wires.push({ x: o.x + 1, y: o.y + cv.wireY, x2: o.x + 18 });
    }
    function tree(px, kind, h) {
      var cv = kind === 'a' ? A.araucaria(r.int(1, 999), h || r.int(150, 200)) : A.autumnTree(r.int(1, 999), h || r.int(80, 104));
      back(cv, px - cv.baseX, GY + 2 - cv.height, 1);
    }

    // --- a praça: a parede lateral da Matriz, com os vitrais acesos ---
    var wallW = Z.cem * TS;
    var wall = C7.sideWall(wallW), wo = back(wall, 0, GY - wall.height, -1);
    L.c7windows = [];
    L.c7squareEnd = wallW - 60;
    wall.windows.forEach(function (w) {
      glow(wo, w.x, w.y, 40, '#ffc070', 0.62, false);
      if (w.x < 4 * TS - 8 || w.x > 4 * TS + 104) L.c7windows.push({ x: w.x, y: wo.y + w.y, top: wo.y + w.top, bot: wo.y + w.bot });
    });
    var portal = C7.portal(), po = back(portal, 4 * TS, GY + 2 - portal.height, 0);
    portal.lamps.forEach(function (l) { glow(po, l.x, l.y, 30, '#ffc070', 0.9, true); });
    po.candle = false;
    sign(9, 'c7.s.matriz', null);
    (function () { var cv = A.coreto(), o = back(cv, 34 * TS - 48, GY + 1 - cv.height, 1); o.lights = [{ dx: 48, dy: 50, r: 30, col: '#ffb060', a: 0.5 }]; })();
    [15, 29, 43, 57].forEach(function (tx, k) { lamp(tx, k === 2); });
    [20, 52].forEach(function (tx) { back(A.bench(), tx * TS, GY + 1 - 11, 2); });
    tree(64 * TS, 'a', 190); tree(68 * TS, 'o', 96);

    // --- o cemitério da colônia, atrás da igreja ---
    back(C7.gate(), Z.cem * TS + 20, GY + 1 - 96, 0);
    for (x = (Z.cem + 6) * TS; x < 127 * TS; x += 64) back(A.fence(64), x, GY + 1 - 30, 0);
    (function () {
      var cv = TC.canvas(64, 70), c = cv.ctx;
      c.fillStyle = TC.col('#5a5664'); c.fillRect(6, 24, 52, 46);
      c.fillStyle = TC.col('#46424e'); for (var y = 24; y < 70; y += 6) c.fillRect(6, y, 52, 1);
      c.fillStyle = TC.col('#3a3644'); TC.fillPoly(c, [[0, 26], [32, 4], [64, 26]]);
      c.fillStyle = TC.col('#6a6676'); TC.fillPoly(c, [[6, 24], [32, 8], [58, 24]]);
      c.fillStyle = TC.col('#c8b070'); c.fillRect(31, 0, 2, 10); c.fillRect(28, 3, 8, 2);
      c.fillStyle = TC.col('#0a0a12'); c.fillRect(24, 38, 16, 32); TC.fillEllipse(c, 32, 38, 8, 5);
      back(cv, 85 * TS + 8 - 32, 11 * TS + 1 - 70, 1);
    })();
    var becker = C7.beckerTomb(); back(becker, 91 * TS - becker.width / 2, GY + 1 - becker.height, 2);
    L.signs.push({ x: 91 * TS, y: GY, key: 'c7.s.becker' });
    for (x = (Z.cem + 4) * TS; x < 126 * TS; x += r.int(28, 44)) {
      var tx2 = Math.floor(x / TS);
      if ((tx2 >= 83 && tx2 <= 93) || (tx2 >= 104 && tx2 <= 120 && r() < 0.5)) continue;
      var tk = A.tomb(r.int(0, 2), r.int(1, 99));
      var tomb = back(TC.tint(tk, '#20203a', 0.35), x, GY + 1 - tk.height - r.int(0, 3), 2);
      if (r() < 0.55) {
        tomb.candle = true;
        tomb.lights = [{ dx: tk.width + 3, dy: tk.height - 4, r: 22, col: '#ffa040', a: 0.9, flicker: true }];
        tomb.glows = [{ dx: tk.width + 3, dy: tk.height - 6, r: 5, col: '#ffe080', a: 0.8, flicker: true }];
      }
    }
    [74, 97, 118].forEach(function (tx) { tree(tx * TS, 'a'); });
    tree(108 * TS, 'o', 90);
    [80, 112].forEach(function (tx, k) { lamp(tx, k === 0); });
    var sdoor = C7.sideDoor(); back(sdoor, 128 * TS - sdoor.width / 2, GY + 1 - sdoor.height, 1);
    L.signs.push({ x: 128 * TS, y: GY, key: 'c7.s.door' });

    // --- a cripta ---
    var cw = C7.cryptWall((Z.tower - Z.crypt) * TS, 7), co2 = back(cw, Z.crypt * TS, GY - cw.height, -2);
    cw.candles.forEach(function (cd) { glow(co2, cd.x, cd.y, 30, '#ffb060', 0.85, true); });
    co2.candle = false;
    (function () {
      // sarcófagos de pedra sobre os blocos
      [[135, 2], [166, 3]].forEach(function (s) {
        var w = s[1] * TS, cv = TC.canvas(w + 4, 22), c = cv.ctx;
        c.fillStyle = TC.col('#7a7686'); c.fillRect(0, 2, w + 4, 6);
        c.fillStyle = TC.col('#9e9aaa'); c.fillRect(0, 2, w + 4, 2);
        c.fillStyle = TC.col('#4a4656'); c.fillRect(w / 2 + 1, 3, 2, 4); c.fillRect(w / 2 - 2, 4, 8, 1);
        back(cv, s[0] * TS - 2, 11 * TS - 8, 2);
      });
    })();
    var fstone = C7.foundation(), fo = back(fstone, 160 * TS - 20, GY + 1 - fstone.height, 1);
    glow(fo, fstone.bookX, fstone.bookY, 44, '#d0ffd8', 0.65, false);
    L.signs.push({ x: 160 * TS, y: GY, key: 'c7.s.stone' });
    L.signs.push({ x: 166 * TS - 4, y: GY, key: 'c7.s.book' });
    L.signs.push({ x: 148 * TS + 8, y: GY, key: 'c7.s.padre' });

    // --- a torre do sino ---
    for (i = 0; Z.tower * TS + i * 256 < Z.nave * TS; i++) {
      var tw = C7.towerWall(Math.min(256, Z.nave * TS - (Z.tower * TS + i * 256)), i, 30 + i), to = back(tw, Z.tower * TS + i * 256, 0, -2);
      tw.windows.forEach(function (w) { glow(to, w.x, w.y, 40, '#7a8ad0', 0.5, false); });
    }
    var clock = C7.clockBack(), clo = back(clock, 203 * TS - clock.width / 2, 40, -1);
    clo.lights = [{ dx: clock.width / 2, dy: clock.height / 2, r: 60, col: '#c8d0f0', a: 0.6 }];
    sign(178, 'c7.s.tower', C2.sign(100, 22, [['TORRE DO SINO', '#f0e0b0'], ['SÓ COM O SACRISTÃO', '#d8c890']], { legs: 8, bg: '#3a2a20' }));
    L.signs.push({ x: 204 * TS, y: GY, key: 'c7.s.clock' });
    var bell = C7.bigBell(), bo = back(bell, 255 * TS - bell.width / 2, 2, 1);
    bo.lights = [{ dx: bell.width / 2, dy: 60, r: 70, col: '#ffd890', a: 0.5 }];
    L.signs.push({ x: 255 * TS, y: GY, key: 'c7.s.bell' });

    // --- a entrada da nave (coro e órgão) e a arena final ---
    back(C7.nave(false), Z.nave * TS, 0, -2);
    back(C7.nave(false), Z.nave * TS + 32, 0, -2);
    L._live = { cv: TC.canvas(256, 192), x: Z.boss * TS, y: 0, z: -1 };
    L.back.push(L._live);
    L._naveN = C7.nave(false); L._naveD = C7.nave(true); L._hold = C7.hold();

    /* ---------- primeiro plano ---------- */
    var grass = TC.sprite([
      '..k......k...k..',
      '..k..k...k..kk..',
      '.kk..k..kk..k...',
      '.k..kk..k..kk.k.',
      'kk..k..kk.kk..k.',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#04050a' });
    for (x = 140; x < Z.crypt * TS; x += r.int(160, 320)) L.front.push({ cv: grass, x: x, y: 218 });
    var chain = TC.canvas(4, 90); chain.ctx.fillStyle = '#060406';
    for (i = 0; i < 90; i += 4) chain.ctx.fillRect(i % 8 ? 1 : 0, i, i % 8 ? 2 : 4, 3);
    for (x = Z.tower * TS * 1.25; x < Z.nave * TS * 1.25; x += r.int(220, 380)) L.front.push({ cv: chain, x: x, y: 0 });

    /* ---------- itens e quebráveis ---------- */
    [[12, 'crate', 'cuca'], [31, 'barrel', 'linguica'], [40, 'crate', 'chimarrao'], [61, 'barrel', 'cuca'], [77, 'crate', 'linguica'],
      [95, 'barrel', 'chimarrao'], [123, 'crate', 'cuca'], [138, 'barrel', 'linguica'], [158, 'crate', 'chimarrao'], [171, 'barrel', 'cuca'],
      [188, 'crate', 'linguica'], [210, 'barrel', 'chimarrao'], [227, 'crate', 'cuca'], [240, 'barrel', 'linguica'], [261, 'crate', 'chimarrao'],
      [272, 'barrel', 'cuca'], [278, 'crate', 'chimarrao']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[183, 7], [184, 7], [196, 8], [198, 8], [249, 8], [250, 8], [85, 10], [231, 11]].forEach(function (p) {
      L.items.push({ type: 'bolinho', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 197 * TS + 8, y: 8 * TS - 6 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('crow', 16, 70); sp('ghost', 40, 140); sp('crow', 62, 60);
    sp('ghost', 80, GY, { rise: true }); sp('ghost', 92, GY, { rise: true }); sp('shade', 99, GY); sp('ghost', 125, 130);
    sp('bat', 134, 50); sp('ghost', 163, GY, { rise: true }); sp('bat', 169, 44);
    sp('bat', 183, 46); sp('shade', 204, GY);
    sp('bat', 229, 50); sp('bat', 234, 40); sp('shade', 237, GY);
    sp('bat', 261, 46); sp('ghost', 270, 140); sp('flame', 276, 70);

    /* ---------- arenas ---------- */
    function bat(side, y) { return { t: 'bat', side: side, y: y || 60, opt: { fly: side === 'l' ? 1 : -1 } }; }
    function mi(side) { return { t: 'miner', side: side, y: GY }; }
    function dn(side) { return { t: 'dancer', side: side, y: GY }; }
    function pc(side, kind) { return { t: 'possesso', side: side, y: GY, opt: { kind: kind || (side === 'l' ? 'colona' : 'colono') } }; }
    function g(side, y) { return { t: 'ghost', side: side, y: y || 140 }; }
    function gr(at) { return { t: 'ghost', rise: at }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function s(side) { return { t: 'shade', side: side }; }
    function cr(side) { return { t: 'crow', side: side, y: 60 }; }
    function wolf(side) { return { t: 'wolf', side: side, y: GY, opt: { howl: true } }; }
    L.arenas = [
      { x0: 0, waves: [[gr(150), gr(210)], [cr('r'), f('r')], [pc('r', 'colono'), gr(180)]] },
      { x0: 24 * TS, waves: [[wolf('r')], [mi('l'), bat('r'), bat('l')], [dn('r'), pc('l', 'colona')]] },
      { x0: 46 * TS, waves: [[s('l'), s('r')], [f('l'), f('r'), g('r')], [wolf('l'), dn('r'), gr(128)]] },
      { x0: 104 * TS, waves: [[gr(60), gr(130), gr(200)], [s('r'), pc('l', 'colona'), g('r')], [wolf('r'), gr(80), gr(180), f('l')]] },
      { x0: 140 * TS, waves: [[gr(80), gr(176), bat('r')], [mi('l'), mi('r')], [gr(60), gr(200), s('r'), f('l')]] },
      { x0: 190 * TS, echo: 1, waves: [[{ t: 'c7cyclops', drop: 170 }]] },
      { x0: 242 * TS, echo: 2, waves: [[{ t: 'c7moco', rise: 190 }]] },
      { x0: Z.boss * TS, boss: true, waves: [] }
    ];
    L.echo1Arena = L.arenas[5]; L.echo2Arena = L.arenas[6]; L.bossArena = L.arenas[7];
    L.arenas[5].waves[0][0].opt = { arena: L.arenas[5] };
    L.arenas[6].waves[0][0].opt = { arena: L.arenas[6] };
    L.c7extraFoes = extraFoes;
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 24 * TS + 30 }, { x: 46 * TS + 30 }, { x: 68 * TS + 8, shrine: true }, { x: 104 * TS + 30 },
      { x: 126 * TS + 8, shrine: true }, { x: 140 * TS + 30 }, { x: 172 * TS + 8, shrine: true }, { x: 190 * TS + 30 },
      { x: 209 * TS + 8, shrine: true }, { x: 223 * TS + 8, shrine: true }, { x: 242 * TS + 30 }, { x: 262 * TS + 8, shrine: true },
      { x: Z.boss * TS + 30 }
    ];
    var acp = [0, 1, 2, 4, 6, 8, 11, 13];
    L.arenas.forEach(function (a, k) { a.cp = acp[k]; });
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });

    /* falas ao passar */
    L.barks = [
      { x: 18 * TS, key: 'c7.b.square' },
      { x: 73 * TS, key: 'c7.b.cem' },
      { x: 125 * TS, key: 'c7.b.door' },
      { x: 131 * TS, key: 'c7.b.lamp' },
      { x: 157 * TS, key: 'c7.b.book', face: 'shock' },
      { x: 177 * TS, key: 'c7.b.tower' },
      { x: 207 * TS, key: 'c7.b.clock' },
      { x: 222 * TS + 4, key: 'c7.b.dark', face: 'shock' },
      { x: 259 * TS, key: 'c7.b.bell', face: 'shock' }
    ];

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#4c4c88', fog: 0.25 },
      { x: Z.cem * TS, ambient: '#3c3c74', fog: 0.5 },
      { x: Z.crypt * TS, ambient: '#3a3644', fog: 0.12 },
      { x: Z.tower * TS, ambient: '#36343e', fog: 0.08 },
      { x: Z.dark * TS, ambient: '#0c0c14', fog: 0.02 },
      { x: Z.darkEnd * TS, ambient: '#34343e', fog: 0.08 },
      { x: Z.nave * TS, ambient: '#3c3a56', fog: 0.12 },
      { x: Z.boss * TS, ambient: '#3c3a56', fog: 0.12 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });

    hooks(L, C7);
    return L;
  };

  /* inimigos dos capítulos 4 a 6, se já existirem (protegido: só entram os que estiverem carregados) */
  // só os que lutam no chão (os que voam mantendo distância ou agarram travariam o cerco do piloto automático)
  function extraFoes() {
    function have(list) { return list.filter(function (k) { return !!TC.ENEMIES[k]; }); }
    return { c4: have(['shoes', 'boot', 'clog']), c5: have(['c5dog', 'c5erv']), c6: have(['c6scare', 'c6bowler']) };
  }

  /* =================================================================== */
  function hooks(L, C7) {
    var A = TC.ART, E = TC.ent, X = TC.c7ent;
    var Z = L.ZONE;
    var st0 = null;

    /* ---------- fundo ---------- */
    L.prepareBg = function (A) {
      var bg = {};
      bg.sky = A.sky(SW, TC.H, [[0, '#030208'], [0.45, '#140a1e'], [0.8, '#2a1830'], [1, '#3a2034']], 1997, 0.006);
      bg.tw = A.twinkles(SW, 110, 26, 71);
      bg.moon = A.moon(13, true);
      bg.far = A.hills(512, 70, { seed: 75, color: '#1c1430', rim: '#3a2848', base: 0.45, amp: 0.6, trees: 40, treeMin: 5, treeMax: 10, period: 6 });
      bg.mid = A.hills(512, 90, { seed: 79, color: '#110c22', rim: '#2a1e3a', base: 0.4, amp: 0.5, trees: 55, treeMin: 8, treeMax: 16, period: 6 });
      var tl = TC.canvas(768, 140), c = tl.ctx, r = TC.RNG(7777);
      for (var i = 0; i < 24; i++) {
        var h = r.int(70, 130);
        var tr = A.araucaria(700 + i, h, { sil: '#0b0a1a', rim: '#241a3a' });
        var tx = r.int(0, 767);
        [-768, 0, 768].forEach(function (o) { c.drawImage(tr, tx - tr.baseX + o, 140 - tr.height); });
      }
      c.fillStyle = TC.col('#0b0a1a'); c.fillRect(0, 128, 768, 12);
      bg.trees = tl;
      var church = A.church();
      var ch = TC.scaleCanvas(church, 0.78);
      var chN = TC.tint(ch, '#141030', 0.72);
      bg.fog = A.fog(512, 52, 51, '#8a7aa8');
      bg.fogFront = A.fog(512, 40, 53, '#9a8ab8');
      var cryptBg = TC.canvas(SW, TC.H), cc = cryptBg.ctx;
      for (var y = 0; y < TC.H; y++) { cc.fillStyle = TC.mix('#0c0a10', '#050408', y / TC.H); cc.fillRect(0, y, SW, 1); }
      var towerBg = TC.canvas(SW, TC.H), tc = towerBg.ctx;
      for (y = 0; y < TC.H; y++) { tc.fillStyle = TC.mix('#100c0a', '#060404', y / TC.H); tc.fillRect(0, y, SW, 1); }
      bg.extra = function (cc2, camX, t) {
        // a torre da Matriz, iluminada por dentro, olhando por cima da praça e do cemitério
        var inX = Z.crypt * TS - camX;
        if (inX > 0) {
          var chx = Math.round(118 - camX * 0.07);
          if (chx > -ch.width) {
            cc2.drawImage(chN, chx, 176 - ch.height);
            var f = 0.85 + Math.sin(t * 0.07) * 0.08;
            TC.Lighting.glow(cc2, chx + 20, 176 - ch.height + Math.round(150 * 0.78), 10, '#ffc070', 0.45 * f);
            TC.Lighting.glow(cc2, chx + ch.width - 20, 176 - ch.height + Math.round(150 * 0.78), 10, '#ffc070', 0.45 * f);
            TC.Lighting.glow(cc2, chx + ch.width / 2, 176 - ch.height + Math.round(120 * 0.78), 8, '#ffb060', 0.4 * f);
            TC.Lighting.glow(cc2, chx + ch.width / 2, 176 - ch.height + Math.round(78 * 0.78), 6, '#f0f0d0', 0.3);
          }
        }
        // por dentro (cripta, torre, nave): sem céu
        if (inX < SW) {
          var x0 = Math.max(0, inX);
          cc2.save(); cc2.beginPath(); cc2.rect(x0, 0, SW - x0, TC.H); cc2.clip();
          cc2.drawImage(camX + 128 < Z.tower * TS ? cryptBg : towerBg, 0, 0);
          cc2.restore();
        }
      };
      return bg;
    };

    L.tileFor = function (code, open, st, v) {
      var T = C7.T;
      if (st === 'crypt' && (code === 1 || code === 3)) return open ? T.cryptTop[v] : T.crypt[v];
      if (st === 'tower' && (code === 1 || code === 3 || code === 5)) return open ? T.towerTop[v] : T.tower;
      if (st === 'nave' && (code === 1 || code === 3)) return open ? T.naveTop[v] : T.nave[v];
      return null;
    };
    /* troca o desenho do chão de um trecho (nave <-> convés do Hoffnung, passarela da Hilde) */
    function retile(st, tx0, tx1, kind) {
      var c = st.tileCv.ctx, T = C7.T;
      for (var tx = tx0; tx <= tx1; tx++) {
        var v = (tx * 7 + 12 * 3) % 2;
        c.clearRect(tx * TS, 12 * TS, TS, 2 * TS);
        if (kind === 'deck') { c.drawImage(T.deckTop[v], tx * TS, 12 * TS); c.drawImage(T.deck, tx * TS, 13 * TS); }
        else if (kind === 'stitch') { c.drawImage(T.stitch[v], tx * TS, 12 * TS); }
        else { c.drawImage(T.naveTop[v], tx * TS, 12 * TS); c.drawImage(T.nave[(v + 1) % 2], tx * TS, 13 * TS); }
      }
    }
    function applyWalkway(st) {
      for (var tx = Z.gap0; tx <= Z.gap1; tx++) L.set(tx, 12, 5);
      retile(st, Z.gap0, Z.gap1, 'stitch');
    }
    /* o fundo da arena final: a nave de noite, o porão do navio e a manhã entrando pelos vitrais */
    function renderLive(st) {
      var R = st.c7room, c = L._live.cv.ctx;
      var key = Math.round((R ? R.mix : 0) * 24) + ':' + Math.round((st.c7sun || 0) * 24);
      if (L._liveKey === key) return;
      L._liveKey = key;
      c.clearRect(0, 0, 256, 192);
      c.drawImage(L._naveN, 0, 0);
      var sun = st.c7sun || 0;
      if (sun > 0) { c.globalAlpha = sun; c.drawImage(L._naveD, 0, 0); c.globalAlpha = 1; }
      var m = R ? R.mix : 0;
      if (m > 0) { c.globalAlpha = m; c.drawImage(L._hold, 0, 0); c.globalAlpha = 1; }
    }

    /* ---------- partículas ---------- */
    L.particles = function (st) {
      var cx = st.camX, x = st.player.x;
      if (x < Z.crypt * TS) {
        if (st.t % 14 === 0) {
          var ls = A.leaves()[TC.rnd.int(0, 2)];
          st.parts.add({ x: cx + TC.rnd.range(-10, SW + 40), y: -6, vx: TC.rnd.range(-0.6, -0.1), vy: TC.rnd.range(0.35, 0.7), life: 420, wobble: 0.05, phase: TC.rnd() * 6, layer: 2, sprite: function (p) { return ls[Math.floor((p.max - p.life) / 12) % 2]; } });
        }
      } else if (x < Z.tower * TS) {
        if (st.t % 9 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(30, 180), vx: TC.rnd.range(-0.1, 0.1), vy: TC.rnd.range(-0.1, 0.1), life: 200, color: '#c8b898', size: 1, fade: true, wobble: 0.03, layer: 2 });
        if (st.t % 31 === 0) { st.parts.add({ x: cx + TC.rnd.range(0, SW), y: 8, vy: 2.4, ay: 0.15, life: 70, color: '#a0c0e0', size: 1, layer: 1 }); if (TC.rnd() < 0.3) TC.audio.sfx('drip'); }
      } else if (x < Z.dark * TS || (x > Z.darkEnd * TS && x < Z.nave * TS)) {
        if (st.t % 10 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(20, 180), vx: TC.rnd.range(-0.15, 0.15), vy: TC.rnd.range(0.05, 0.2), life: 220, color: '#b8a888', size: 1, fade: true, wobble: 0.04, layer: 2 });
        if (st.t % 90 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: -4, vx: TC.rnd.range(-0.3, 0.3), vy: 0.4, life: 400, color: '#d8d8e0', size: 2, wobble: 0.08, layer: 2 });
      } else if (x >= Z.nave * TS) {
        var R = st.c7room;
        if (st.t % 12 === 0) st.parts.add({ x: cx + TC.rnd.range(0, SW), y: TC.rnd.range(40, 170), vy: TC.rnd.range(-0.1, 0.1), life: 180, color: (st.c7sun || 0) > 0.3 ? '#fff0c0' : '#c8c0e0', size: 1, fade: true, wobble: 0.04, layer: 2 });
        if (R && R.mode === 'dance' && R.danceOn && st.t % 8 === 0) st.parts.add({ x: R.poleX + TC.rnd.range(-90, 90), y: TC.rnd.range(60, 120), vy: 0.3, life: 120, color: TC.rnd.pick(C7.FITAS), size: 1, fade: true, wobble: 0.06, layer: 2 });
      }
    };

    /* ---------- início ---------- */
    L.init = function (st, save) {
      st0 = st;
      // o laço bento no lugar do revólver
      st.gun = { ammo: 99, lasso: true };
      st.fireGun = function (p) { TC.c7fireLasso(st, p); };
      var p = st.player, baseFrame = TC.Player.prototype.frame, baseDamage = p.damage;
      // os ecos dos chefes são só lembrança: batem com metade da força
      p.damage = function (s2, dmg, dir, heavy) { if (s2.c7dmgMul) dmg *= s2.c7dmgMul; return baseDamage.call(this, s2, dmg, dir, heavy); };
      p.frame = function () {
        if (this.state === 'shoot') return this.t < 4 ? C7.arnoLasso.spin : C7.arnoLasso.throw;
        return baseFrame.call(this);
      };
      // os inimigos dos outros capítulos entram no cerco, se existirem
      var extra = L.c7extraFoes();
      function wave(list) { return list.slice(0, 2).map(function (t, k) { return { t: t, side: k % 2 ? 'l' : 'r', y: GY }; }); }
      if (extra.c4.length) L.arenas[1].waves.push(wave(extra.c4));
      if (extra.c5.length) L.arenas[2].waves.push(wave(extra.c5));
      if (extra.c6.length) L.arenas[3].waves.push(wave(extra.c6));
      st.deco.push(new X.Helmut(L));
      st.deco.push(new X.Gears([
        { x: 201 * TS, y: 70, img: C7.gears[2], sp: 0.01 }, { x: 205 * TS + 6, y: 96, img: C7.gears[0], sp: -0.0136 },
        { x: 207 * TS + 4, y: 64, img: C7.gears[1], sp: 0.021 }
      ]));
      st.deco.push(new X.Pigeons([[180 * TS, 22], [181 * TS + 6, 22], [215 * TS, 128], [245 * TS, 22], [246 * TS + 8, 22], [262 * TS, 128]]));
      st.c7room = new X.Room(L, Z.boss * TS); st.c7room.mix = 0;
      st.deco.push(st.c7room);
      st.c7rope = new X.Rope(Z.boss * TS + 40);
      st.deco.push(st.c7rope);
      st.c7fog = 0; st.c7fogT = 0; st.c7sun = 0;
      if (save) {
        if (save.hilde) { st.hildeDone = true; applyWalkway(st); }
        if (save.flies) st.fliesOn = true;
        if (save.bossHp) L.bossArena.bossHpLeft = save.bossHp;
        if (save.ribbons) L.bossArena.c7ribbons = save.ribbons;
      }
      renderLive(st);
      // desenhos por cima do jogo e por baixo da interface (cerração, raios de sol, contador de fitas, o verso)
      var baseOverlay = st.drawOverlay;
      st.drawOverlay = function (c) { preOverlay(this, c); baseOverlay.call(this, c); postOverlay(this, c); };
    };
    L.saveExtra = function (st, s) {
      s.hilde = !!st.hildeDone;
      s.flies = !!st.fliesOn;
      var b = st.boss && st.boss.type === 'c7alte' ? st.boss : null;
      s.bossHp = b ? b.hp : (L.bossArena.bossHpLeft || 0);
      s.ribbons = L.bossArena.c7ribbons || 0;
    };
    L.onRespawn = function (st) {
      st.c7fog = st.c7fogT = 0;
      st.c7verse = null; st.c7pullT = 0;
      if (st.c7hedwig) { st.c7hedwig.alive = false; st.c7hedwig = null; }
      var R = st.c7room;
      R.mode = 'pews'; R.mix = 0; R.danceOn = false; R.ewaldStep = 0; R.flying = [];
      R.people.concat(R.dancers).forEach(function (q) { q.grabbed = null; q.taken = 0; q.yoff = 0; q.vy = 0; });
      st.c7rope.active = false; st.c7rope.pulls = 0;
      st.c7sun = 0;
      // golpes que ficaram voando (laço, boleadeira e onda do eco do Moço)
      st.deco = st.deco.filter(function (d) { return !(d.boss && d.kind); });
      retile(st, Z.boss, Z.boss + 16, 'nave');
      renderLive(st);
      var a = L.bossArena, lb = st.c7lastBoss;
      if (!a.done && lb) {
        var max = lb.maxHp;
        if (!TC.diff().keepBoss) {
          if (lb.phase === 3) { a.bossHpLeft = Math.floor(max * 0.33); a.c7ribbons = 0; }
          else if (lb.phase === 2) a.bossHpLeft = Math.floor(max * 0.66);
          else a.bossHpLeft = 0;
        } else if (a.bossHpLeft) {
          if (lb.phase === 2) a.bossHpLeft = Math.min(a.bossHpLeft, Math.floor(max * 0.66));
          if (lb.phase === 3) a.bossHpLeft = Math.min(a.bossHpLeft, Math.floor(max * 0.33));
        }
      }
      st.c7lastBoss = null;
    };

    L.afterCard = function* (st) {
      st.banner = { kind: 'mission', t: 0 };
      TC.audio.sfx('bellToll');
      var w = 0;
      while (w++ < 260 && !(w > 40 && (TC.input.pressed('confirm') || TC.input.pressed('attack') || TC.input.pressed('start')))) yield;
      st.banner = null;
      st.hint = { key: 'hint.lasso', t: 460 };
    };
    L.drawBanner = function (st, c, b) {
      if (b.kind !== 'mission') return;
      var k = TC.clamp(b.t / 20, 0, 1);
      var h = Math.round(84 * TC.ease.outCubic(k));
      TC.ui.box(c, 20, 82 - h / 2, 216, Math.max(4, h), 'dark', 0.94);
      if (k < 1) return;
      var big = TC.ui.bigText(TC.t('mission'), 2, '#ffe0a0', '#c07030', '#06050c');
      c.drawImage(big, 128 - Math.floor(big.width / 2), 46);
      TC.font.wrap(TC.t('mission7'), 190).forEach(function (ln, i) { TC.font.draw(c, ln, 128, 74 + i * 12, '#f0e8d0', { align: 'center', shadow: '#000' }); });
      C7.fitaIcon.forEach(function (ic, i) { c.drawImage(ic, 128 - 35 + i * 10, 108); });
    };

    L.hud = function (st, c) {
      if (st.mode === 'cine' && !st.boss) return;
      c.fillStyle = 'rgba(4,4,12,0.55)';
      c.fillRect(2, 25, 46, 13);
      c.drawImage(C7.lasso, 4, 27);
      TC.font.draw(c, TC.t('c7.hud.lasso'), 18, 28, '#f0d898', { shadow: '#000' });
    };

    /* ---------- desenhos por cima ---------- */
    function preOverlay(st, c) {
      var camX = st.camX;
      // o tiro do Seu Helmut
      st.deco.forEach(function (d) {
        if (!(d instanceof X.Helmut) || !d.shot) return;
        var s = d.shot, a = s.t / 8;
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(255,230,160,' + (0.8 * a).toFixed(2) + ')';
        TC.thickLine(c, s.x0 - camX, s.y0, s.x1 - camX, s.y1, 1);
        c.restore();
        TC.Lighting.glow(c, s.x0 - camX, s.y0, 8, '#ffe0a0', 0.8 * a);
      });
      // a cerração que o Antigo sopra: só os olhos aparecem
      if (st.c7fog > 0.01) {
        c.fillStyle = TC.rgba('#8a8ab8', (st.c7fog * 0.92).toFixed(3));
        c.fillRect(0, 0, SW, TC.H);
        var bf = st.c7fogBand || (st.c7fogBand = A.fog(512, 60, 91, '#c8c8e8'));
        var o = Math.round(st.t * 0.6) % 512;
        c.globalAlpha = st.c7fog * 0.8;
        c.drawImage(bf, -o, 120); c.drawImage(bf, 512 - o, 120); c.drawImage(bf, -((o * 2) % 512), 60); c.drawImage(bf, 512 - ((o * 2) % 512), 60);
        c.globalAlpha = 1;
        var b = st.boss;
        if (b && b.type === 'c7alte' && b.state !== 'gone') {
          var e = b.eye(), hot = b.state === 'fogPrep';
          var fl = hot ? 0.7 + 0.3 * Math.sin(b.t * 0.6) : 0.5;
          TC.Lighting.glow(c, e.x - camX, e.y, hot ? 12 : 6, '#e0f8ff', fl);
          c.fillStyle = '#ffffff'; c.fillRect(Math.round(e.x - camX - 3), Math.round(e.y), 2, 1); c.fillRect(Math.round(e.x - camX + 2), Math.round(e.y), 2, 1);
        }
      }
      // o sol entrando pelos vitrais
      var sun = st.c7sun || 0;
      if (sun > 0.02) {
        var x0 = Z.boss * TS - camX;
        c.save(); c.globalCompositeOperation = 'lighter';
        [49, 97, 177, 225].forEach(function (wx, i) {
          var col = ['255,220,140', '255,180,150', '170,210,255', '200,255,190'][i];
          c.fillStyle = 'rgba(' + col + ',' + (0.12 * sun).toFixed(3) + ')';
          TC.fillPoly(c, [[x0 + wx - 9, 50], [x0 + wx + 9, 50], [x0 + wx + 46, GY], [x0 + wx + 10, GY]]);
        });
        c.restore();
      }
    }
    function postOverlay(st, c) {
      var b = st.boss;
      // o contador das sete fitas, no pau-de-fita
      if (b && b.type === 'c7alte' && b.phase === 3 && st.c7room && st.c7room.mode === 'dance' && st.mode !== 'cine') {
        var x0 = 128 - 7 * 6;
        c.fillStyle = 'rgba(4,4,12,0.55)'; c.fillRect(x0 - 4, 24, 7 * 12 + 6, 20);
        for (var i = 0; i < 7; i++) {
          var ic = i < b.ribbons ? C7.fitaIcon[i] : TC.tintCached(C7.fitaIcon[i], '#1a1a24', 0.75);
          c.drawImage(ic, x0 + i * 12, 26);
        }
        var R = st.c7room, lap = R.danceAng - Math.floor(R.danceAng);
        c.fillStyle = '#000'; c.fillRect(x0 - 1, 37, 7 * 12 + 1, 4);
        c.fillStyle = R.halted ? ((st.t >> 3) % 2 ? '#ff6050' : '#801818') : '#ffd060';
        c.fillRect(x0, 38, Math.round((7 * 12 - 1) * lap), 2);
      }
      // o último verso, dito pela cidade inteira
      var v = st.c7verse;
      if (v && v.a > 0) {
        c.fillStyle = 'rgba(0,0,8,' + (0.65 * v.a).toFixed(3) + ')';
        c.fillRect(0, 0, SW, TC.H);
        c.globalAlpha = v.a;
        var y = 62;
        for (var k = 0; k <= v.line && k < v.lines.length; k++) {
          var txt = TC.t(v.lines[k]);
          var n = k < v.line ? txt.length : Math.floor(v.chars);
          var col = k === 0 ? '#c8b0ff' : '#fff0d0';
          TC.font.wrap(txt, 230).forEach(function (ln, j, arr) {
            var before = 0;
            for (var q = 0; q < j; q++) before += arr[q].length + 1;
            var m = Math.max(0, Math.min(ln.length, n - before));
            if (m > 0) TC.font.draw(c, ln, 128, y, col, { align: 'center', shadow: '#000', max: m });
            y += 11;
          });
          y += k === 0 ? 8 : 4;
        }
        c.globalAlpha = 1;
      }
    }

    /* ---------- o piloto automático de testes ---------- */
    L.c7danger = function (st) {
      var out = [], b = st.boss;
      st.enemies.forEach(function (e) {
        if (e.type === 'c7hand' && e.alive && !e.dying && (e.state === 'warn' || e.state === 'wait') && (e.mode === 'slam' || e.mode === 'floor')) out.push({ x: e.tx, r: 28 });
      });
      if (b && b.type === 'c7alte' && (b.state === 'dropPrep' || b.state === 'drop' || (b.state === 'ceil' && b.t > 80))) out.push({ x: b.x, r: 56 });
      return out;
    };
    L.botGoal = function (st, p) {
      var g = { shoot: false };
      // o piloto do motor só pula na borda do botão: encostado num degrau com o pulo ainda apertado, ficaria parado
      if (p.onGround && p.state === 'normal' && st.t % 16 === 0 && E.isSolid(L.tile(Math.floor((p.x + p.face * 12) / TS), Math.floor((p.y - 8) / TS)))) p._bj = false;
      var rp = st.c7rope;
      if (rp && rp.active) {
        g.x = rp.x; g.noAtk = true;
        if (Math.abs(rp.x - p.x) < 10 && st.t % 20 === 0) g.use = true;
        return g;
      }
      var b = st.boss, a = st.arena;
      function clampA(x) { return a ? TC.clamp(x, a.x0 + 16, a.x0 + SW - 16) : x; }
      if (b && b.type === 'c7alte' && st.mode === 'play') {
        var dz = L.c7danger(st);
        for (var i = 0; i < dz.length; i++) {
          var d = dz[i];
          if (Math.abs(p.x - d.x) < d.r) {
            var away = p.x < d.x ? -1 : 1;
            var tx = clampA(d.x + away * (d.r + 34));
            if (Math.abs(tx - d.x) < d.r) tx = clampA(d.x - away * (d.r + 34));
            g.x = tx; g.noAtk = true;
            return g;
          }
        }
        if (b.state === 'rear' && Math.abs(p.x - b.x) < 100 && (p.x - b.x) * b.face > -10) {
          g.x = clampA(b.x - b.face * 120); g.noAtk = true;
          return g;
        }
        var gh = null;
        st.enemies.forEach(function (e) { if (e.type === 'c7hand' && e.alive && !e.dying && (e.state === 'hold' || e.state === 'reach') && (e.mode === 'grab' || e.mode === 'grabD')) gh = e; });
        if (gh) { g.x = p.x < gh.hx ? gh.hx - 15 : gh.hx + 15; g.keepAttack = true; return g; }
      }
      // o laço bento: de meia distância, de vez em quando
      if (st.t % 40 === 0) {
        st.enemies.forEach(function (e) {
          if (g.shoot || !e.alive || e.dying || e.isBoss || e.type === 'c7hand') return;
          var dx = e.x - p.x;
          if (Math.abs(dx) > 34 && Math.abs(dx) < 78 && Math.abs((e.y - 14) - (p.y - 22)) < 30 && dx * p.face > 0) g.shoot = true;
        });
      }
      return g;
    };

    /* ---------- eventos da fase ---------- */
    function dialog(st, entries) {
      st.mode = 'dialog';
      st.dlg.open(entries, { pos: 'top' });
    }
    L.update = function (st) {
      var p = st.player, R = st.c7room, a = st.arena;
      var x = p.x;
      // luz do Arno: o lampião da cripta, a escuridão da torre, os vaga-lumes
      if (x < Z.crypt * TS) L.playerLight = null;
      else if (x < Z.tower * TS) L.playerLight = { r: 70, col: '#c8a070', a: 0.85 };
      else if (x >= Z.dark * TS && x < Z.darkEnd * TS) L.playerLight = st.fliesOn ? { r: 64, col: '#c8ff80', a: 0.85 } : { r: 26, col: '#8080a0', a: 0.45 };
      else if (x < Z.nave * TS) L.playerLight = { r: 58, col: '#a89880', a: 0.7 };
      else L.playerLight = { r: 50, col: '#9090b0', a: 0.6 };
      // o Seu Helmut abre fogo
      if (a === L.arenas[0] && !st.c7helmut && st.mode === 'play') { st.c7helmut = true; dialog(st, [{ who: 'helmut', key: 'c7.h1' }]); }
      // ecos dos chefes
      var echo = null;
      st.enemies.forEach(function (e) { if (e.echo && e.alive && e.state !== 'gone') echo = e; });
      if (echo) {
        if (st.boss !== echo && echo.state !== 'dying') { st.boss = echo; st.bossBarFill = st.bossBarFill || 0; }
        st.bossBarFill = Math.min(1, (st.bossBarFill || 0) + 0.02);
        if (echo.type === 'c7cyclops' && !st.c7e1 && echo.t > 50 && st.mode === 'play') { st.c7e1 = true; dialog(st, [{ who: 'arno', key: 'c7.e1a', face: 'shock' }, { who: 'arno', key: 'c7.e1b' }]); }
        if (echo.type === 'c7moco' && !st.c7e2 && echo.t > 30 && st.mode === 'play') { st.c7e2 = true; dialog(st, [{ who: 'moco', key: 'c7.e2a' }, { who: 'arno', key: 'c7.e2b' }, { who: 'moco', key: 'c7.e2c' }]); }
      } else if (st.boss && st.boss.echo) st.boss = null;
      if (L.echo1Arena.done && st.c7e1 && !st.c7e1d && st.mode === 'play' && !st.arena) { st.c7e1d = true; dialog(st, [{ who: 'arno', key: 'c7.e1c' }]); }
      if (L.echo2Arena.done && st.c7e2 && !st.c7e2d && st.mode === 'play' && !st.arena) { st.c7e2d = true; dialog(st, [{ who: 'moco', key: 'c7.e2d' }]); }
      // a Hilde costura o caminho
      if (!st.hildeDone && st.mode === 'play' && !st.cine && !st.arena && x > Z.gap0 * TS - 76) {
        st.hildeDone = true;
        if (x < Z.gap0 * TS + 8) st.cine = new TC.Script(hildeSeq(st));
        else applyWalkway(st);
      }
      // os vaga-lumes da Boitatá
      if (!st.fliesOn && st.mode === 'play' && !st.arena && x > Z.flies * TS) {
        st.fliesOn = true;
        st.deco.push(new X.Flies(x + 120, 70, 26));
        TC.audio.sfx('c7sparkle');
        dialog(st, [{ who: 'arno', key: 'c7.b.flies' }]);
      }
      // a música de cada lugar
      if ((st.mode === 'play' || st.mode === 'dialog') && !st.boss && !st.cine) {
        var want = x < Z.crypt * TS - 20 ? 'stage7' : x < Z.tower * TS ? 'crypt7' : x < Z.nave * TS ? 'tower7' : 'vigil7';
        if (a && a.echo === 1 && !a.done) want = 'c7echo1';
        if (a && a.echo === 2 && !a.done) want = 'c7echo2';
        if (TC.audio.musicName() !== want && TC.SONGS[want]) TC.audio.music(want, 1.2);
      }
      // a cerração do Antigo
      st.c7fog = TC.approach(st.c7fog || 0, st.c7fogT || 0, 0.02);
      // o fundo da arena final
      if (R) {
        renderLive(st);
        var b = st.boss && st.boss.type === 'c7alte' ? st.boss : null;
        if (b) st.c7lastBoss = b;
        // o porão do Hoffnung balança
        if (b && b.phase === 2 && R.mode === 'hold' && st.mode === 'play' && p.onGround && (p.state === 'normal' || p.state === 'attack')) {
          var sway = Math.sin(st.t * 0.012) * 0.32;
          p.x = TC.clamp(p.x + sway, L.minX + 8, L.maxX - 8);
          if (st.t % 240 === 0) TC.audio.sfx('creak');
          if (st.t % 420 === 210) TC.audio.sfx('wave');
        }
        // o pau-de-fita: cada volta da dança amarra uma fita no Antigo
        if (b && b.phase === 3 && R.mode === 'dance' && R.danceOn && st.mode === 'play' && b.state !== 'kneel' && b.state !== 'dying' && b.state !== 'gone') {
          R.rate = 1 / (({ easy: 360, normal: 420, hard: 480 })[TC.opts.diff] || 420);
          var tied = st.c7tied || 0;
          if (Math.floor(R.danceAng) > tied) {
            st.c7tied = tied + 1;
            var k = st.c7tied - 1;
            TC.audio.sfx('ribbon');
            st.floatText(R.poleX, 60, TC.t('c7.tie').replace('{n}', st.c7tied), C7.FITAS[k]);
            R.startRibbon(k, b, function () {
              b.ribbons = Math.max(b.ribbons, k + 1);
              L.bossArena.c7ribbons = b.ribbons;
              b.hp = Math.min(b.hp, b.floorHp());
              b.flash = 8;
              TC.audio.sfx('c7sparkle'); TC.fx.flash('#fff0c0', 0.25, 0.05);
              if (b.ribbons >= 7 && b.state !== 'kneel') st.cine = new TC.Script(kneelSeq(st, b));
            });
          }
        }
        // a manhã
        if ((st.c7sun || 0) > 0) L.zones[L.zones.length - 1].ambient = TC.mix('#3c3a56', '#e8d0b0', st.c7sun);
      }
      // a última vela antes da nave enche a energia toda
      var lastSh = L.shrines[L.shrines.length - 1];
      if (lastSh && lastSh.lit && !st.c7fullHeal) { st.c7fullHeal = true; if (p.hp < p.maxHp) { p.hp = p.maxHp; TC.audio.sfx('heal'); } }
      // a corda do sino
      var rp = st.c7rope;
      if (rp && rp.active && st.mode === 'play' && rp.cd <= 0) {
        var near = Math.abs(p.x - rp.x) < 16 && p.onGround;
        var press = TC.input.pressed('attack') || TC.input.pressed('shoot') || p.botUse;
        if (near && press) pullRope(st, rp);
      }
      if (st.c7pullT > 0 && --st.c7pullT === 0 && p.state === 'cine' && st.mode === 'play') p.setState('normal');
    };

    /* ---------- a Hilde ---------- */
    function* hildeSeq(st) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'attack' || p.state === 'shoot'); });
      p.setState('cine'); p.pose = 'idle'; p.face = 1; p.vx = 0;
      TC.fx.tween('letterbox', 22, 30);
      yield* co.wait(20);
      yield* st.say('c7.hi1', null);
      var gx0 = Z.gap0 * TS, gx1 = (Z.gap1 + 1) * TS;
      var hi = new X.Hilde((gx0 + gx1) / 2, 150, gx0, gx1);
      st.deco.push(hi);
      TC.audio.sfx('c7choir');
      for (var i = 0; i < 50; i++) { hi.alpha = i / 50; yield; }
      p.pose = 'shock';
      yield* TC.ui.say(st.dlg, [{ who: 'hilde', key: 'c7.hi2', face: 'free' }], { pos: 'top' });
      p.pose = 'idle';
      hi.pose = 'sew';
      for (i = 0; i <= 120; i++) {
        hi.sew = i / 120;
        hi.x = gx0 + (gx1 - gx0) * hi.sew;
        if (i % 12 === 0) TC.audio.sfx('c7stitch');
        yield;
      }
      applyWalkway(st);
      TC.audio.sfx('c7sparkle');
      for (i = 0; i < 16; i++) st.parts.add({ x: gx0 + TC.rnd.range(0, gx1 - gx0), y: GY, vx: TC.rnd.range(-0.5, 0.5), vy: TC.rnd.range(-1.5, -0.4), life: 50, color: '#ff8080', size: 1, fade: true, layer: 1 });
      hi.sew = 0;
      hi.pose = 'free';
      yield* st.say('c7.hi3', null);
      yield* TC.ui.say(st.dlg, [{ who: 'hilde', key: 'c7.hi4', face: 'free' }], { pos: 'top' });
      hi.pose = 'dance'; hi.vx = 0.6; hi.vy = -0.35;
      for (i = 0; i < 70; i++) { hi.alpha = 1 - i / 70; yield; }
      hi.alive = false;
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
      st.save();
    }

    /* ---------- o chefe: der Alte ---------- */
    function hedwigIn(st, instant) {
      if (st.c7hedwig && st.c7hedwig.alive) { st.c7hedwig.target = 1; if (instant) st.c7hedwig.alpha = 1; return st.c7hedwig; }
      var h = new X.Hedwig(st.player.x - 30);
      if (instant) h.alpha = 1;
      st.c7hedwig = h;
      st.deco.push(h);
      return h;
    }
    function setRoom(st, phase, instant, b) {
      var R = st.c7room;
      if (phase === 2) {
        R.mode = 'hold'; if (instant) R.mix = 1;
        retile(st, Z.boss, Z.boss + 16, 'deck');
        hedwigIn(st, instant);
      } else {
        if (instant) R.mix = 0;
        retile(st, Z.boss, Z.boss + 16, 'nave');
        if (st.c7hedwig) { st.c7hedwig.target = 0; }
        if (phase === 3) {
          R.mode = 'dance';
          if (instant) { R.watchA = 1; R.danceOn = true; }
          var rb = b ? b.ribbons : 0;
          R.danceAng = rb; st.c7tied = rb;
        } else R.mode = 'pews';
      }
      renderLive(st);
    }
    function clearHands(st) {
      st.enemies.forEach(function (e) { if (e.type === 'c7hand' && e.alive) e.release(st, true); });
      st.orbs.length = 0;
    }
    L.bossSeq = function* (st, a) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.until(function () { return p.onGround; });
      p.setState('cine'); p.pose = 'idle'; p.face = 1; p.vx = 0;
      TC.fx.tween('letterbox', 22, 40);
      var boss = st.spawnEnemy('c7alte', a.x0 + 196, GY, { arena: a });
      if (TC.params.bosshp) boss.hp = parseInt(TC.params.bosshp, 10);
      if (a.bossHpLeft) boss.hp = TC.clamp(a.bossHpLeft, 1, boss.maxHp);
      if (TC.params.ribbons && !a.c7ribbons) a.c7ribbons = Math.min(6, +TC.params.ribbons);
      boss.phase = boss.hp > boss.maxHp * 0.66 + 0.01 ? 1 : boss.hp > boss.maxHp * 0.33 + 0.01 ? 2 : 3;
      if (boss.phase === 3) { boss.ribbons = a.c7ribbons || 0; boss.hp = Math.min(boss.hp, boss.floorHp() + boss.third() / 7); }
      boss.alpha = 0; boss.set('intro');
      st.boss = boss; st.c7lastBoss = boss;
      setRoom(st, boss.phase, true, boss);
      if (!a.seen) {
        a.seen = true;
        TC.audio.stopMusic(1);
        TC.audio.sfx('bellToll');
        st.c7fogT = 0.5;
        yield* co.wait(50);
        TC.audio.sfx('c7glass');
        for (var i = 0; i < 70; i++) { boss.alpha = i / 70; yield; }
        st.c7fogT = 0;
        TC.audio.sfx('demon'); TC.fx.shake(4, 30);
        p.pose = 'shock';
        yield* st.say('c7.a1', null, 'alte', 'top');
        yield* st.say('c7.a2', null, 'alte', 'top');
        p.pose = 'idle';
        yield* st.say('c7.a3', null, 'arno', 'top');
        yield* st.say('c7.a4', null, 'alte', 'top');
        yield* st.say('c7.a5', null, 'arno', 'top');
      } else {
        for (var j = 0; j < 30; j++) { boss.alpha = j / 30; yield; }
      }
      boss.alpha = 1;
      p.pose = 'idle';
      st.bossBarFill = 0;
      TC.fx.tween('letterbox', 0, 30);
      yield* co.tween(st, 'bossBarFill', 1, 50);
      TC.audio.music(boss.phase === 1 ? 'boss7' : boss.phase === 2 ? 'boss7b' : 'boss7c');
      st.banner = { kind: 'fight', t: 0 };
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: boss.phase === 1 ? 'hint.c7p1' : boss.phase === 2 ? 'hint.c7p2' : 'hint.c7p3', t: 360 };
      yield* co.wait(60);
      st.banner = null;
    };
    /* janelas da nave por onde entram as mãos */
    function windowFor(x0, tx) {
      var ws = [49, 97, 177, 225], best = ws[0], bd = 1e9;
      ws.forEach(function (w) { var d = Math.abs(x0 + w - tx); if (d < bd) { bd = d; best = w; } });
      return { x: x0 + best, y: 88 };
    }
    L.c7spawnSlam = function (st, boss, tx, delay) {
      var a = boss.arena;
      tx = TC.clamp(tx, a.x0 + 20, a.x0 + SW - 20);
      var w = windowFor(a.x0, tx);
      return st.spawnEnemy('c7hand', tx, GY, { mode: 'slam', boss: boss, tx: tx, sx: w.x, sy: w.y, delay: delay || 0 });
    };
    L.c7spawnFloor = function (st, boss, tx, delay) {
      var a = boss.arena;
      tx = TC.clamp(tx, a.x0 + 20, a.x0 + SW - 20);
      return st.spawnEnemy('c7hand', tx, GY, { mode: 'floor', boss: boss, tx: tx, sx: tx, sy: GY + 30, delay: delay || 0 });
    };
    L.c7canGrab = function (st) {
      var R = st.c7room;
      return R && R.mode === 'pews' && R.people.some(function (q) { return !q.grabbed && !q.taken && q.yoff === 0; });
    };
    L.c7canGrabDancer = function (st) {
      var R = st.c7room;
      return R && R.mode === 'dance' && R.danceOn && !R.halted && R.dancers.some(function (d) { return !d.grabbed && !d.taken; });
    };
    L.c7spawnGrab = function (st, boss, mode) {
      var R = st.c7room, p = st.player, cand, tgt = null, bd = -1;
      if (mode === 'grabD') {
        cand = R.dancers.filter(function (d) { return !d.grabbed && !d.taken; });
        // agarra quem estiver mais longe do Arno (dá tempo de correr até lá)
        cand.forEach(function (d) { var dd = Math.abs(d.x - p.x); if (dd > bd && d.z > -0.6) { bd = dd; tgt = d; } });
      } else {
        cand = R.people.filter(function (q) { return !q.grabbed && !q.taken && q.yoff === 0; });
        cand.forEach(function (q) { var dd = Math.abs(q.x - p.x); if (dd > bd && dd < 200) { bd = dd; tgt = q; } });
      }
      if (!tgt) return null;
      var sx = mode === 'grabD' ? tgt.x : windowFor(boss.arena.x0, tgt.x).x, sy = mode === 'grabD' ? 0 : 88;
      tgt.grabbed = null;
      var h = st.spawnEnemy('c7hand', tgt.x, GY, { mode: mode, boss: boss, target: tgt, sx: sx, sy: sy, room: R });
      return h;
    };
    /* a mão levou alguém embora: o medo alimenta o Antigo (a pessoa volta logo depois) */
    L.c7grabLost = function (st, hand) {
      var tg = hand.target, b = hand.boss;
      if (tg) { tg.grabbed = null; tg.taken = 160; }
      if (b && b.alive) {
        if (hand.mode === 'grabD') { var R = st.c7room; R.danceAng = Math.floor(R.danceAng); }
        else b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.06);
        st.floatText(b.x, b.y - 100, TC.t('c7.heal'), '#ff8070');
        TC.audio.sfx('demon');
      }
    };
    L.c7danceBonus = function (st, dmg) {
      var R = st.c7room;
      if (R && R.danceOn && !R.halted) R.danceAng += dmg * 0.035;
    };
    L.c7phase = function (st, boss, n) {
      if (boss.inPhase) return;
      boss.inPhase = true;
      boss.phase = n;
      boss.set('phase');
      st.c7fogT = 0;
      st.cine = new TC.Script(phaseSeq(st, boss, n));
    };
    function* phaseSeq(st, boss, n) {
      var p = st.player, R = st.c7room, i;
      st.mode = 'cine';
      clearHands(st);
      st.killAllMinions();
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'attack' || p.state === 'shoot' || p.state === 'cine'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0; p.face = boss.x > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 30);
      st.save();
      if (n === 2) {
        TC.audio.stopMusic(0.6);
        yield* co.wait(20);
        yield* st.say('c7.s1', null, 'alte', 'top');
        for (i = 0; i < 3; i++) { TC.audio.sfx('bellToll'); TC.fx.shake(3, 22); TC.fx.flash('#c8d8ff', 0.4, 0.04); yield* co.wait(44); }
        TC.fx.tween('mosaic', 8, 30);
        yield* co.wait(30);
        R.mode = 'hold';
        for (i = 0; i <= 20; i++) { R.mix = i / 20; renderLive(st); yield; }
        setRoom(st, 2, false, boss);
        st.c7hedwig.alpha = 0;
        TC.audio.sfx('wave'); TC.audio.sfx('creak');
        TC.fx.tween('mosaic', 1, 30);
        yield* co.wait(40);
        p.pose = 'shock';
        yield* st.say('c7.s2', 'shock', 'arno', 'top');
        TC.audio.sfx('c7choir');
        yield* co.until(function () { return st.c7hedwig.alpha >= 0.95; });
        p.pose = 'idle';
        yield* st.say('c7.s3', null, 'hedwig', 'top');
        yield* st.say('c7.s5', null, 'arno', 'top');
        yield* st.say('c7.s4', null, 'hedwig', 'top');
        TC.audio.music('boss7b');
        st.hint = { key: 'hint.c7p2', t: 360 };
      } else {
        TC.audio.stopMusic(0.6);
        yield* co.wait(20);
        yield* st.say('c7.d1', null, 'hedwig', 'top');
        TC.fx.flash('#ffe0a0', 0.85, 0.03); TC.audio.sfx('c7choir'); TC.audio.sfx('bellToll', 130);
        for (i = 0; i <= 40; i++) { R.mix = 1 - i / 40; renderLive(st); yield; }
        setRoom(st, 3, false, boss);
        TC.audio.sfx('crowd');
        yield* co.until(function () { return R.watchA >= 0.95; });
        yield* st.say('c7.d2', null, 'frida', 'top');
        yield* st.say('c7.d3', null, 'erwin', 'top');
        TC.audio.music('boss7c');
        R.danceOn = true;
        st.hint = { key: 'hint.c7p3', t: 360 };
      }
      TC.fx.tween('letterbox', 0, 30);
      boss.inPhase = false;
      boss.set('stalk');
      p.setState('normal');
      st.mode = 'play';
    }
    /* a sétima fita: ele cai de joelhos */
    function* kneelSeq(st, b) {
      var p = st.player, R = st.c7room, i;
      st.mode = 'cine';
      b.set('kneel');
      clearHands(st);
      st.killAllMinions();
      R.danceOn = false;
      TC.audio.stopMusic(1.5);
      TC.audio.sfx('demon'); TC.fx.shake(5, 40); TC.fx.flash('#ffffff', 0.6, 0.03);
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'attack' || p.state === 'shoot' || p.state === 'cine'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0; p.face = b.x > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 30);
      yield* co.wait(60);
      yield* st.say('c7.k1', null, 'alte', 'top');
      for (i = 0; i < 30; i++) { R.ewaldStep = i; yield; }
      yield* st.say('c7.k2', null, 'ewald', 'top');
      yield* st.say('c7.k3', null, 'arno', 'top');
      R.ewaldStep = 0;
      yield* st.say('c7.k4', null, 'frida', 'top');
      yield* st.say('c7.k5', null, 'frida', 'top');
      // o último verso, letra por letra
      TC.audio.music('verse7', 1);
      TC.audio.sfx('crowd');
      var v = st.c7verse = { lines: ['c7.v0', 'c7.v1', 'c7.v2', 'c7.v3', 'c7.v4'], line: 0, chars: 0, a: 0 };
      yield* co.tween(v, 'a', 1, 40);
      for (var k = 0; k < v.lines.length; k++) {
        v.line = k; v.chars = 0;
        var len = TC.t(v.lines[k]).length;
        while (v.chars < len) { v.chars += (TC.input.down('confirm') || TC.input.down('attack')) ? 1.6 : 0.5; yield; }
        if (k === 0) TC.audio.sfx('c7choir');
        yield* co.wait(40);
      }
      yield* co.wait(60);
      TC.audio.sfx('c7sparkle');
      yield* co.tween(v, 'a', 0, 40);
      st.c7verse = null;
      st.c7rope.active = true;
      TC.fx.tween('letterbox', 0, 30);
      p.setState('normal');
      st.mode = 'play';
      st.hint = { key: 'hint.c7rope', t: 99999 };
    }
    function pullRope(st, rp) {
      var p = st.player, b = st.boss && st.boss.type === 'c7alte' ? st.boss : null;
      rp.pulls++; rp.cd = 46; rp.pullT = 24;
      p.setState('cine'); p.pose = 'point'; p.vx = 0;
      st.c7pullT = 26;
      TC.audio.sfx('c7pull');
      TC.audio.sfx('bellToll', 98 - rp.pulls * 6);
      TC.fx.shake(4, 22); TC.fx.flash('#fff0c0', 0.5, 0.04);
      st.floatText(rp.x, 118, TC.t('c7.pull'), '#ffe090');
      st.c7sun = Math.max(st.c7sun || 0, rp.pulls * 0.18);
      if (b) { b.flash = 10; for (var i = 0; i < 14; i++) st.parts.add({ x: b.x + TC.rnd.range(-40, 40), y: b.y - TC.rnd.range(10, 70), vx: TC.rnd.range(-1, 1), vy: TC.rnd.range(-2, -0.5), life: 50, colors: ['#ffffff', '#c8c8e8', '#6a6a90'], size: 2, fade: true, layer: 1 }); }
      if (rp.pulls === 1) dialog(st, [{ who: 'arno', key: 'c7.k6' }]);
      if (rp.pulls >= 3) {
        rp.active = false;
        st.hint = null;
        st.cine = new TC.Script(finalSeq(st, b));
      }
    }
    function* finalSeq(st, b) {
      var p = st.player;
      st.mode = 'cine';
      yield* co.wait(30);
      p.setState('cine'); p.pose = 'point';
      yield* st.say('c7.k7', null, 'arno', 'top');
      TC.audio.sfx('bellToll', 80); TC.fx.flash('#ffffff', 1, 0.02);
      for (var i = 0; i < 40; i++) { st.c7sun = Math.min(1, (st.c7sun || 0) + 0.012); yield; }
      if (b) b.set('dying');
      else { st.onBossDead(null); }
      while (true) { st.c7sun = Math.min(1, (st.c7sun || 0) + 0.006); yield; }
    }
    /* vitória: o sol entra pelos vitrais e o Antigo vira cerração, escorrendo pelas janelas até o mar */
    L.clearSeq = function* (st) {
      var p = st.player, b = null;
      st.enemies.forEach(function (e) { if (e.type === 'c7alte') b = e; });
      st.mode = 'cine';
      st.killAllMinions();
      yield* co.until(function () { return p.onGround && (p.state === 'normal' || p.state === 'cine' || p.state === 'shoot' || p.state === 'attack'); });
      p.setState('cine'); p.pose = 'idle'; p.vx = 0;
      if (b) p.face = b.x > p.x ? 1 : -1;
      TC.fx.tween('letterbox', 22, 40);
      if (b) {
        yield* st.say('c7.c0', null, 'alte', 'top');
        var x0 = L.bossArena.x0, wins = [49, 97, 177, 225];
        for (var k = 0; k < 160; k++) {
          b.alpha = Math.max(0, 1 - k / 150);
          st.c7sun = Math.min(1, (st.c7sun || 0) + 0.008);
          if (k % 2 === 0) {
            var wx = x0 + wins[k % 4];
            st.parts.add({ x: b.x + TC.rnd.range(-40, 40), y: b.y - TC.rnd.range(10, 70), vx: (wx - b.x) / 70, vy: (70 - b.y) / 70, life: 70, colors: ['#e8e8f8', '#b0b0d0', '#8080a8'], size: TC.rnd.int(2, 4), fade: true, layer: 1 });
          }
          if (k % 30 === 0) TC.audio.sfx('c7fog');
          yield;
        }
        b.alive = false;
      }
      st.c7sun = 1;
      if (st.c7room && st.c7room.mode === 'dance') { st.c7room.danceOn = true; st.c7room.rate = 1 / 600; }
      TC.audio.music('morning7', 2);
      TC.audio.sfx('c7cheer');
      yield* co.wait(40);
      p.pose = 'victory';
      yield* st.say('c7.c1', null, 'arno', 'top');
      yield* st.say('c7.c2', null, 'frida', 'top');
      TC.fx.tween('letterbox', 0, 30);
      yield* st.clearSeq();
    };
    L.nextScene = function (score) { return TC.Ending7Scene ? new TC.Ending7Scene({ score: score }) : new TC.TitleScene(); };
    L.debugInfo = function (st) {
      var b = st.c7lastBoss;
      return { phase: b ? b.phase : 0, ribbons: b ? b.ribbons : 0, bossHp: b ? Math.round(b.hp) : null, hilde: !!st.hildeDone, flies: !!st.fliesOn, rope: st.c7rope ? st.c7rope.pulls : 0, extra: L.c7extraFoes() };
    };
  }
})();
