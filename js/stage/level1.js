'use strict';
/* Teewald City — Fase 1: "A Cidade Adormecida" (rua de entrada, rua principal, ponte, cemitério, ladeira, praça da igreja) */
(function () {
  var TS = 16;
  var GY = 192; // linha do chão

  TC.buildLevel1 = function () {
    var A = TC.ART;
    var W = 284, H = 14;
    var L = {
      w: W, h: H, pxW: W * TS, pxH: H * TS,
      tiles: new Uint8Array(W * H),
      style: [],
      back: [], front: [], wires: [],
      signs: [], shrines: [], props: [], items: [], spawns: [], arenas: [], barks: [], cps: [],
      minX: 0, maxX: W * TS
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
      L.style[x] = x < 132 ? 'street' : x < 160 ? 'bridge' : x < 232 ? 'grass' : x < 250 ? 'stairs' : 'square';
    }
    // ponte sobre o arroio
    fill(134, 157, 12, 12, 5);
    fill(134, 157, 13, 13, 4);
    [140, 141, 147, 148, 153, 154].forEach(function (gx) { set(gx, 12, 0); });
    fill(132, 133, 12, 13, 3);
    fill(158, 159, 12, 13, 3);
    // plataformas (sacadas e tábuas)
    fill(41, 42, 10, 10, 2);
    fill(44, 47, 8, 8, 2);
    fill(88, 91, 9, 9, 2);
    fill(118, 120, 9, 9, 2);
    fill(145, 148, 9, 9, 2);
    // jazigo no cemitério
    fill(196, 199, 10, 11, 3);
    fill(214, 215, 11, 11, 3);
    // ladeira de pedra
    fill(234, 236, 11, 11, 3);
    fill(237, 239, 10, 11, 3);
    fill(240, 244, 9, 11, 3);
    fill(245, 247, 10, 11, 3);
    fill(248, 249, 11, 11, 3);

    /* ---------- cenário ---------- */
    var r = TC.RNG(1852);
    var seed = 10;
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
      if (opt.lit == null) opt.lit = 0.3;
      var cv = A.house(opt);
      var o = back(cv, px, GY + 1 - cv.height, 0);
      o.lights = cv.lights.map(function (l) { return { dx: l.x, dy: l.y, r: 18, col: '#ffc070', a: 0.7 }; });
      o.glows = cv.lights.map(function (l) { return { dx: l.x, dy: l.y, r: 7, col: '#ffd080', a: 0.25 }; });
      return cv.width;
    }
    function tree(px, kind, h) {
      var cv = kind === 'a' ? A.araucaria(seed++, h || r.int(150, 200)) : kind === 'p' ? A.pine(seed++, h || r.int(80, 110)) : A.autumnTree(seed++, h || r.int(80, 104));
      back(cv, px - cv.baseX, GY + 2 - cv.height, 1);
    }

    // rua de entrada e rua principal: casas em enxaimel
    var cur = -30;
    while (cur < 2040) {
      var hw = r.int(5, 7) * 16;
      var floors = r() < 0.2 ? 3 : 2;
      var bakery = cur > 1420 && cur < 1560 && !L._bakery;
      var w2 = house(cur, { w: hw, floors: floors, lit: bakery ? 0.9 : 0.3, wall: bakery ? 'yellow' : undefined });
      if (bakery) {
        L._bakery = true;
        var bs = TC.canvas(48, 26), bc = bs.ctx;
        bc.fillStyle = TC.col('#2a2020'); bc.fillRect(22, 0, 2, 6); bc.fillRect(4, 4, 40, 2);
        bc.fillStyle = TC.col('#5a3a20'); bc.fillRect(4, 8, 40, 16);
        bc.fillStyle = TC.col('#8a6040'); bc.fillRect(5, 9, 38, 14);
        TC.font.draw(bc, 'PADARIA', 24, 12, '#f0e0b0', { align: 'center' });
        var bx = cur + Math.round(w2 / 2) - 24;
        back(bs, bx, 112, 2);
        L.signs.push({ x: bx + 24, y: GY, key: 'sign.bakery' });
      }
      cur += w2 + r.int(6, 34);
      if (r() < 0.75) tree(cur - r.int(8, 20), r() < 0.55 ? 'a' : 'o');
    }
    // postes ao longo da rua
    [6, 17, 28, 39, 50, 61, 72, 83, 94, 105, 116, 127].forEach(function (tx, k) { lamp(tx, k === 5 || k === 9); });
    // bancos e cercas
    [23, 57, 99].forEach(function (tx) { back(A.bench(), tx * TS, GY + 1 - 11, 2); });
    // placa de boas-vindas
    (function () {
      var cv = TC.canvas(64, 44), c = cv.ctx;
      c.fillStyle = TC.col('#3a2a20'); c.fillRect(8, 18, 4, 26); c.fillRect(52, 18, 4, 26);
      c.fillStyle = TC.col('#1a1410'); c.fillRect(0, 0, 64, 24);
      c.fillStyle = TC.col('#1e5a34'); c.fillRect(1, 1, 62, 22);
      c.fillStyle = TC.col('#e8e0c8'); c.fillRect(2, 2, 60, 1); c.fillRect(2, 21, 60, 1);
      TC.font.draw(c, 'TEEWALD', 32, 4, '#f0f0e0', { align: 'center' });
      TC.font.draw(c, 'CITY', 32, 13, '#f0d080', { align: 'center' });
      back(cv, 12 * TS - 32, GY + 2 - 44, 2);
      L.signs.push({ x: 12 * TS, y: GY, key: 'sign.welcome' });
    })();
    // cartazes nas paredes
    [[40, 'sign.festa'], [66, 'sign.missing']].forEach(function (p) {
      var cv = A.poster();
      back(cv, p[0] * TS - 6, 146, 2);
      L.signs.push({ x: p[0] * TS, y: GY, key: p[1] });
    });

    // ponte do arroio: barranco escuro e juncos atrás
    (function () {
      var cv = TC.canvas(28 * TS, 40), c = cv.ctx;
      for (var y = 0; y < 40; y++) { c.fillStyle = TC.mix('#0a0c1a', '#05060c', y / 40); c.fillRect(0, y, cv.width, 1); }
      var rr = TC.RNG(5);
      for (var k = 0; k < 60; k++) {
        var rx = rr.int(0, cv.width), rh = rr.int(6, 16);
        c.fillStyle = TC.col(rr() < 0.5 ? '#1a2a1e' : '#22362a');
        c.fillRect(rx, 14 - rh, 1, rh + 2);
      }
      back(cv, 132 * TS, GY - 14, -1);
    })();
    tree(131 * TS, 'a', 190);
    tree(161 * TS, 'o', 96);
    lamp(130, false);
    L.signs.push({ x: 129 * TS + 8, y: GY, key: 'sign.bridge' });
    back(A.signPost(), 129 * TS - 2, GY + 2 - 16, 2);

    // cemitério
    (function () {
      // portão
      var g = TC.canvas(72, 96), c = g.ctx;
      [[0, 14], [58, 14]].forEach(function (p) {
        c.fillStyle = TC.col('#6a6670'); c.fillRect(p[0], 30, p[1], 66);
        c.fillStyle = TC.col('#8e8a96'); c.fillRect(p[0], 30, p[1], 2);
        c.fillStyle = TC.col('#46424e'); c.fillRect(p[0] + p[1] - 2, 32, 2, 64);
        c.fillStyle = TC.col('#8e8a96'); c.fillRect(p[0] - 2, 26, p[1] + 4, 5);
      });
      c.fillStyle = TC.col('#1c1c24');
      for (var a = 0; a <= 20; a++) {
        var ax = 14 + a * 2.2, ay = 24 - Math.sin(a / 20 * Math.PI) * 18;
        c.fillRect(Math.round(ax), Math.round(ay), 2, 2);
      }
      c.fillRect(35, 0, 2, 10); c.fillRect(32, 3, 8, 2);
      for (var bx = 16; bx < 58; bx += 5) c.fillRect(bx, 30, 1, 66);
      back(g, 161 * TS - 36, GY + 1 - 96, 0);
    })();
    for (x = 165 * TS; x < 232 * TS; x += 64) back(A.fence(64), x, GY + 1 - 30, 0);
    // capela mortuária sobre o jazigo
    (function () {
      var cv = TC.canvas(80, 100), c = cv.ctx;
      c.fillStyle = TC.col('#5a5664'); c.fillRect(8, 40, 64, 60);
      c.fillStyle = TC.col('#46424e'); for (var y = 40; y < 100; y += 6) c.fillRect(8, y, 64, 1);
      c.fillStyle = TC.col('#3a3644'); TC.fillPoly(c, [[2, 42], [40, 10], [78, 42]]);
      c.fillStyle = TC.col('#6a6676'); TC.fillPoly(c, [[8, 40], [40, 15], [72, 40]]);
      c.fillStyle = TC.col('#c8b070'); c.fillRect(39, 0, 2, 14); c.fillRect(35, 4, 10, 2);
      c.fillStyle = TC.col('#0a0a12'); c.fillRect(30, 56, 20, 30);
      TC.fillEllipse(c, 40, 56, 10, 6);
      c.fillStyle = TC.col('#1c1c24'); for (var bx2 = 31; bx2 < 50; bx2 += 3) c.fillRect(bx2, 52, 1, 34);
      back(cv, 198 * TS - 40, GY - 32 + 1 - 100 + 32, 1);
    })();
    // lápides e velas
    var tombs = [0, 1, 2];
    for (x = 166 * TS; x < 231 * TS; x += r.int(26, 46)) {
      var tx = Math.floor(x / TS);
      if (tx >= 195 && tx <= 200) continue;
      var tk = r.pick(tombs);
      var tc = A.tomb(tk, r.int(1, 99));
      var tomb = back(TC.tint(tc, '#20203a', 0.35), x, GY + 1 - tc.height - r.int(0, 3), 2);
      if (r() < 0.5) {
        tomb.candle = true;
        tomb.lights = [{ dx: tc.width + 3, dy: tc.height - 4, r: 22, col: '#ffa040', a: 0.9, flicker: true }];
        tomb.glows = [{ dx: tc.width + 3, dy: tc.height - 6, r: 5, col: '#ffe080', a: 0.8, flicker: true }];
      }
    }
    [170, 186, 204, 222].forEach(function (tx) { tree(tx * TS, r() < 0.6 ? 'a' : 'p'); });
    [175, 212].forEach(function (tx, k) { lamp(tx, k === 0); });

    // ladeira e praça
    [233, 251].forEach(function (tx) { tree(tx * TS, 'a', 200); });
    tree(242 * TS, 'o', 110);
    [238, 247].forEach(function (tx) { lamp(tx, false); });
    house(250 * TS - 120, { w: 112, floors: 2, lit: 0.5 });
    // coreto
    (function () {
      var cv = A.coreto();
      var o = back(cv, 256 * TS - 48, GY + 1 - cv.height, 1);
      o.lights = [{ dx: 48, dy: 50, r: 30, col: '#ffb060', a: 0.5 }];
    })();
    [253, 260].forEach(function (tx) { back(A.bench(), tx * TS, GY + 1 - 11, 2); });
    [264, 276].forEach(function (tx) { lamp(tx, false); });
    tree(261 * TS, 'o', 100);
    tree(280 * TS, 'o', 92);
    // igreja
    (function () {
      var cv = A.church();
      var o = back(cv, 270 * TS - cv.width / 2, GY + 2 - cv.height, 0);
      o.lights = [
        { dx: 27, dy: 150, r: 26, col: '#ffc070', a: 0.6 },
        { dx: cv.width - 27, dy: 150, r: 26, col: '#ffc070', a: 0.6 },
        { dx: cv.width / 2, dy: 120, r: 22, col: '#ffb060', a: 0.4 }
      ];
      L.church = o;
    })();
    house(278 * TS, { w: 96, floors: 2, lit: 0.4 });

    /* ---------- primeiro plano (silhuetas) ---------- */
    var grass = TC.sprite([
      '..k......k...k..',
      '..k..k...k..kk..',
      '.kk..k..kk..k...',
      '.k..kk..k..kk.k.',
      'kk..k..kk.kk..k.',
      'kkkkkkkkkkkkkkkk'
    ], { k: '#04050a' });
    var post = TC.canvas(8, 60); post.ctx.fillStyle = '#04050a'; post.ctx.fillRect(2, 0, 4, 60); post.ctx.fillRect(0, 8, 8, 2);
    for (x = 120; x < L.pxW; x += r.int(160, 320)) {
      L.front.push({ cv: r() < 0.7 ? grass : post, x: x, y: r() < 0.7 ? 218 : 170 });
    }

    /* ---------- itens e caixotes ---------- */
    [[20, 'crate', 'pinhao'], [27, 'barrel', 'cuca'], [48, 'crate', 'pinhao'], [58, 'crate', 'linguica'], [74, 'barrel', null],
      [76, 'crate', 'pinhao'], [100, 'barrel', 'chimarrao'], [108, 'crate', 'cuca'], [124, 'crate', 'linguica'],
      [166, 'barrel', 'cuca'], [192, 'crate', 'pinhao'], [226, 'barrel', 'chimarrao'], [252, 'crate', 'cuca'], [258, 'barrel', 'linguica']
    ].forEach(function (p) { L.props.push({ kind: p[1], x: p[0] * TS + 8, drop: p[2] }); });
    [[45, 8], [46, 8], [47, 8], [89, 9], [90, 9], [119, 9], [197, 10], [198, 10], [241, 9], [243, 9], [136, 11], [151, 11]].forEach(function (p) {
      L.items.push({ type: 'pinhao', x: p[0] * TS + 8, y: p[1] * TS - 4 });
    });
    L.items.push({ type: 'medalha', x: 146 * TS + 16, y: 9 * TS - 4 });

    /* ---------- inimigos avulsos ---------- */
    function sp(t, tx, y, opt) { L.spawns.push({ t: t, x: tx * TS, y: y, opt: opt || {} }); }
    sp('crow', 61, 82);
    sp('ghost', 68, 150); sp('ghost', 72, 130);
    sp('shade', 102, GY);
    sp('crow', 116, 82);
    sp('crow', 142, 60, { fly: -1 }); sp('crow', 151, 50, { fly: -1 });
    sp('ghost', 167, GY, { rise: true }); sp('ghost', 169, GY, { rise: true });
    sp('ghost', 190, 140); sp('shade', 202, GY);
    sp('shade', 229, GY); sp('flame', 240, 80); sp('ghost', 246, 120);
    sp('flame', 256, 70);

    /* ---------- arenas (a câmera trava até derrotar as ondas) ---------- */
    function g(side, y) { return { t: 'ghost', side: side, y: y || 140 }; }
    function gr(at) { return { t: 'ghost', rise: at }; }
    function f(side) { return { t: 'flame', side: side, y: 70 }; }
    function s(side) { return { t: 'shade', side: side }; }
    function cr(side) { return { t: 'crow', side: side, y: 60 }; }
    L.arenas = [
      { x0: 0, waves: [[gr(180), gr(222)], [g('r', 150), g('l', 140), gr(200)]] },
      { x0: 34 * TS, waves: [[g('r'), f('r')], [f('l'), g('r', 150), g('l', 120)], [f('r'), f('l')]] },
      { x0: 82 * TS, waves: [[s('r')], [s('l'), g('r')], [f('r'), s('r'), g('l')]] },
      { x0: 112 * TS, waves: [[f('l'), f('r')], [s('r'), s('l')], [gr(60), gr(190), cr('r'), f('l')]] },
      { x0: 172 * TS, waves: [[gr(70), gr(140), gr(210)], [cr('l'), cr('r'), gr(100), gr(180)], [s('r'), gr(60), gr(200), f('l')]] },
      { x0: 208 * TS, waves: [[s('r'), s('l'), f('r')], [f('l'), f('r'), gr(90), gr(170)], [s('r'), s('l'), f('r'), g('l')]] },
      { x0: 262 * TS, boss: true, waves: [] }
    ];
    /* pontos de retorno */
    L.cps = [
      { x: 64 }, { x: 34 * TS + 30 }, { x: 82 * TS + 30 }, { x: 112 * TS + 30 },
      { x: 128 * TS + 8, shrine: true }, { x: 165 * TS + 8, shrine: true },
      { x: 172 * TS + 30 }, { x: 208 * TS + 30 }, { x: 250 * TS + 8, shrine: true }, { x: 262 * TS + 30 }
    ];
    L.arenas[0].cp = 0; L.arenas[1].cp = 1; L.arenas[2].cp = 2; L.arenas[3].cp = 3;
    L.arenas[4].cp = 6; L.arenas[5].cp = 7; L.arenas[6].cp = 9;
    L.cps.forEach(function (cp, k) { if (cp.shrine) L.shrines.push({ x: cp.x, cp: k }); });

    /* falas ao passar por certos pontos */
    L.barks = [
      { x: 133 * TS, key: 'mid.bridge' },
      { x: 166 * TS, key: 'mid.cemetery', face: 'shock' },
      { x: 252 * TS, key: 'mid.square' }
    ];
    L.signs.push({ x: 163 * TS, y: GY, key: 'sign.cemetery' });

    /* zonas: luz ambiente e neblina */
    L.zones = [
      { x: 0, ambient: '#4c4c86', fog: 0.18 },
      { x: 128 * TS, ambient: '#44447c', fog: 0.25 },
      { x: 162 * TS, ambient: '#34346a', fog: 0.55 },
      { x: 230 * TS, ambient: '#40407a', fog: 0.3 },
      { x: 252 * TS, ambient: '#4a4a84', fog: 0.2 }
    ];
    L.back.sort(function (a, b) { return a.z - b.z; });
    return L;
  };
})();
