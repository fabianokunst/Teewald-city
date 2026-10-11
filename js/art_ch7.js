'use strict';
/* Teewald City — Capítulo 7: arte procedural ("A Última Fita").
   O povo de Teewald (para os bancos da igreja, o pau-de-fita e a festa), o Seu Erwin da bandinha, o Ewald de cabelo branco,
   a Oma Hedwig moça (fantasma de luz quente), a Hilde (do capítulo 4, ou uma substituta), der Alte em tamanho verdadeiro
   (de quatro, na parede e no teto), as mãos compridas, as assinaturas em X, o laço bento, as sete fitas;
   a parede lateral da Matriz com os vitrais acesos, o cemitério, a cripta e o Livro de Bordo, a torre do relógio,
   o sino do Hoffnung, a nave (de noite e de manhã), o porão do veleiro, as vinhetas do epílogo e o pai no banco do carona. */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline;
  var C7 = ART.ch7 = {};
  var H2 = TC.hash2;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      skirt: o.skirt == null ? 0 : o.skirt, sit: !!o.sit, acc: !!o.acc, lasso: !!o.lasso
    };
  }
  function walkPoses(n, amp, lean, extra) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var q = i / n * TC.TAU;
      var o = {
        lean: lean,
        legF: [amp * Math.sin(q), -(0.08 + amp * 1.4 * Math.max(0, Math.cos(q)))],
        legB: [amp * Math.sin(q + Math.PI), -(0.08 + amp * 1.4 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [-0.35 * Math.sin(q) + 0.15, 0.5], armB: [0.35 * Math.sin(q) + 0.1, 0.5]
      };
      if (extra) for (var k in extra) o[k] = typeof extra[k] === 'function' ? extra[k](q) : extra[k];
      out.push(P(o));
    }
    return out;
  }
  function tile(fn) {
    var pb = new TC.PixBuf(16, 16);
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) { var c = fn(x, y); if (c) pb.d[y * 16 + x] = u32(c); }
    return pb.toCanvas();
  }
  function keepO(dst, src) { dst.ox = src.ox; dst.oy = src.oy; if (src.handX != null) { dst.handX = src.handX; dst.handY = src.handY; } return dst; }
  function tinted(cv, col, amt) { return keepO(TC.tint(cv, col, amt), cv); }
  function grad(c, x, y, w, h, top, bot) { for (var i = 0; i < h; i++) { c.fillStyle = TC.mix(top, bot, i / Math.max(1, h - 1)); c.fillRect(x, y + i, w, 1); } }
  function ellipseFill(pb, cx, cy, rx, ry, fn) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) { var c = fn(x, y, dx, dy); if (c) pb.set(x, y, c); }
    }
  }
  function portraitBG(pb, top, bot) { for (var y = 0; y < 40; y++) for (var x = 0; x < 40; x++) pb.d[y * 40 + x] = u32(TC.mix(top, bot, y / 39)); }
  function face(pb, skin, skinS, skinD, skinL, cx, cy, rx, ry) {
    ellipseFill(pb, cx || 20, cy || 21, rx || 10, ry || 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? skinL : l > -0.25 ? skin : l > -0.6 ? skinS : skinD);
    });
  }

  /* ====================== AS SETE FITAS ====================== */
  // batizado (branca), Oma Hedwig (roxa), Rainha (dourada), Hilde (vermelha), taquara (palha), Kerb (verde), retrovisor (azul)
  C7.FITAS = ['#f4f0e8', '#9a52d0', '#f0c030', '#e02828', '#d8b070', '#30a850', '#3a78e0'];
  var FITA_ROWS = [
    'kk.kk..',
    'kckck..',
    '.kck...',
    '.kcdk..',
    '..kcdk.',
    '..kcdk.',
    '.kcdk..',
    '.kcdk..',
    '..kk...'
  ];
  function fitaIcons(scale) {
    return C7.FITAS.map(function (col) { return TC.sprite(FITA_ROWS, { k: '#100808', c: col, d: TC.shade(col, 0.62) }, scale); });
  }

  /* ====================== O LAÇO BENTO ====================== */
  C7.lassoIcon = function () {
    return TC.sprite([
      '...kkkkk....',
      '..kyyyyyk...',
      '.kyk...kyk..',
      'kyk.....kyk.',
      'kyk.....kyk.',
      '.kyk...kyk..',
      '..kyyYyyk...',
      '....kYk.....',
      '....kyk.....',
      '.....ky.....'
    ], { y: '#d8b070', Y: '#f0d898', k: '#3a2410' });
  };
  function arnoLasso() {
    var A = ART.arno;
    function copy(src) { var cv = TC.canvas(src.width, src.height); cv.ctx.drawImage(src, 0, 0); return keepO(cv, src); }
    var spin = copy(A.point[0]), c = spin.ctx;
    var hx = Math.round(A.point[0].handX || 30), hy = Math.round(A.point[0].handY || 10);
    c.fillStyle = TC.col('#d8b070');
    for (var a = 0; a < TC.TAU; a += 0.2) c.fillRect(Math.round(hx + Math.cos(a) * 8), Math.max(0, Math.round(hy - 3 + Math.sin(a) * 2.5)), 1, 1);
    var thr = copy(A.punch1[1]), c2 = thr.ctx;
    var tx = Math.round(A.punch1[1].handX || 34), ty = Math.round(A.punch1[1].handY || 22);
    c2.fillStyle = TC.col('#d8b070');
    for (var k = 0; k < 6; k++) c2.fillRect(tx + k, ty + (k > 3 ? 1 : 0), 1, 1);
    // rodilha na outra mão
    c2.fillStyle = TC.col('#a08050');
    for (var r = 0; r < 3; r++) c2.fillRect(tx - 14 + r, ty + 2, 1, 4);
    return { spin: spin, throw: thr };
  }

  /* ====================== O POVO DE TEEWALD ====================== */
  var HEADS = {
    hat: ['...cccc....', '..cCcccc...', '..ccccccc..', 'bbbbbbbbbbb', '.hfffffff..', '.hffffeff..', '..fffffff..', '..FmmmmmF..', '...FFFF....'],
    hair: ['...hhhh....', '..hHhhhhh..', '.hhhhhhhh..', '.hhffffff..', '.hffffeff..', '..fffffff..', '..FmmmmmF..', '...FFFF....'],
    scarf: ['...LLLL....', '..LlLLLLL..', '.LLLLLLLLL.', '.LhhfffhL..', 'LLffffeffL.', 'L.fffffff..', 'L.fFfmff...', '...FFFF....'],
    bun: ['.hhh.......', 'hhhhhhh....', 'hhHhhhhh...', 'hhhffffh...', '.hffffeff..', '.hfffffff..', '..fFfmff...', '...FFFF....']
  };
  var FOLK = [
    { head: 'hat', hat: '#5a4630', hatL: '#7a6448', brim: '#3a2c1c', hair: '#4a3020', skin: '#e0a878', skinS: '#a87050', must: '#4a2a18', shirt: '#a8b8c8', shirtD: '#7888a0', pants: '#5a4838', susp: '#3a2418' },
    { head: 'scarf', f: true, scarf: '#a03030', scarfL: '#c85050', hair: '#5a3a28', skin: '#e8c0a0', skinS: '#b88a70', lip: '#a05050', dress: '#2e3e6a', dressD: '#1e2a4a', apron: '#d8d0bc' },
    { head: 'hair', hair: '#a8a8b0', hairL: '#c8c8d0', skin: '#d8a888', skinS: '#a07860', must: '#d0d0d8', shirt: '#e0dcd0', shirtD: '#b0aca0', vest: '#4a4a54', pants: '#3a3a44' },
    { head: 'bun', f: true, hair: '#e0c060', hairL: '#c09030', skin: '#f0c8a8', skinS: '#c09078', lip: '#c04050', dress: '#3a6a3a', dressD: '#2a4a2a' },
    { head: 'hat', hat: '#d8c080', hatL: '#f0d898', brim: '#b09050', hair: '#3a2414', skin: '#d89868', skinS: '#a06840', shirt: '#e8e4d8', shirtD: '#b8b4a8', pants: '#2a2a34', susp: '#5a3a20' },
    { head: 'scarf', f: true, scarf: '#1a1a20', scarfL: '#3a3a44', hair: '#c8c8d0', skin: '#d8b098', skinS: '#a07a68', lip: '#8a5a50', dress: '#3a2a44', dressD: '#2a1e32' },
    { head: 'hair', hair: '#2a1a10', hairL: '#4a3020', skin: '#e8b080', skinS: '#b07850', shirt: '#a83a2a', shirtD: '#7a2a1e', pants: '#3a4a6a' },
    { head: 'bun', f: true, hair: '#6a3a20', hairL: '#8a5a30', skin: '#e8c0a0', skinS: '#b88a70', lip: '#b05060', dress: '#8a4a6a', dressD: '#6a3a50', apron: '#e8e0d0' }
  ];
  function folkHead(v) {
    var pal = { f: v.skin, F: v.skinS, e: '#1a1010', h: v.hair, H: v.hairL || v.hair };
    if (v.head === 'hat') { pal.c = v.hat; pal.C = v.hatL; pal.b = v.brim; pal.m = v.must || v.skinS; }
    else if (v.head === 'hair') { pal.m = v.must || v.skinS; }
    else if (v.head === 'scarf') { pal.L = v.scarf; pal.l = v.scarfL; pal.m = v.lip; }
    else { pal.m = v.lip; }
    return TC.sprite(HEADS[v.head], pal);
  }
  function folkSpec(v) {
    var f = !!v.f;
    var S = {
      W: 48, H: 56, ox: 22, groundY: 53,
      thigh: 7, shin: 7, legT: f ? 3.4 : 4, footH: 2, footL: f ? 3 : 4, shinThin: 0.6,
      torso: 10, hipW: f ? 6 : 7, shW: f ? 8 : 9,
      upper: 5, fore: 5, armT: f ? 2.8 : 3.3, fist: 2.8, foreThin: 0.4,
      head: folkHead(v), headOff: { x: -4, y: -9 },
      col: {
        pants: solid(f ? '#e0c0a8' : v.pants), pantsB: solid(f ? '#b09080' : TC.shade(v.pants, 0.7)),
        boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: f ? solid(v.dress) : (v.vest ? (function () { var a = u32(v.vest), b = u32(v.shirt); return function (x) { return (x % 6 === 0) ? b : a; }; })() : solid(v.shirt)),
        sleeve: solid(f ? v.dress : v.shirt), sleeveB: solid(f ? v.dressD : v.shirtD),
        skin: solid(v.skin), skinB: solid(v.skinS), outline: '#100a0a'
      }
    };
    S.after = function (pb, info, pose) {
      var hx = info.hx, hy = info.hy;
      if (f) {
        var d = solid(v.dress), dd = solid(v.dressD);
        if (pose.sit) poly(pb, [[hx - 5, hy - 3], [hx + 5, hy - 3], [hx + 12, hy + 2], [hx + 11, hy + 6], [hx - 5, hy + 5]], function (x, y) { return (x & 3) === 0 ? dd(x, y) : d(x, y); });
        else poly(pb, [[hx - 5, hy - 3], [hx + 5, hy - 3], [hx + 7 + pose.skirt, S.groundY - 4], [hx - 7 - pose.skirt, S.groundY - 4]], function (x, y) { return (x & 3) === 0 ? dd(x, y) : d(x, y); });
        if (v.apron && !pose.sit) poly(pb, [[hx - 1, hy - 2], [hx + 5, hy - 2], [hx + 6, hy + 10], [hx - 1, hy + 10]], solid(v.apron));
      } else if (v.susp) {
        thick(pb, info.sx - 2, info.sy + 1, hx - 2, hy - 1, 1, solid(v.susp));
        thick(pb, info.sx + 2, info.sy + 1, hx + 2, hy - 1, 1, solid(v.susp));
      }
    };
    return S;
  }
  function buildFolk(v) {
    var S = folkSpec(v), R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04 }), S), R(P({ lean: 0.04, breath: 1 }), S)];
    out.sit = [R(P({ lean: 0.06, legF: [1.5, -1.45], legB: [1.45, -1.5], armF: [0.7, 0.9], armB: [0.5, 1.0], lowest: 9, sit: true }), S)];
    out.sitPray = [R(P({ lean: 0.1, legF: [1.5, -1.45], legB: [1.45, -1.5], armF: [0.9, 1.6], armB: [0.7, 1.7], headY: 1, lowest: 9, sit: true }), S)];
    out.pray = [R(P({ lean: 0.08, armF: [0.9, 1.6], armB: [0.7, 1.7], headY: 1 }), S)];
    out.cheer = [R(P({ armF: [2.8, 0.2], armB: [2.6, 0.3] }), S), R(P({ armF: [2.6, 0.4], armB: [2.8, 0.1], dy: -3, legF: [0.3, -0.5], legB: [-0.2, -0.4] }), S)];
    out.dance = walkPoses(4, 0.35, 0.05, { armF: [2.5, 0.25], skirt: 2 }).map(function (p) { return R(p, S); });
    out.walk = walkPoses(6, 0.3, 0.12, { skirt: 1 }).map(function (p) { return R(p, S); });
    out.scared = [R(P({ lean: -0.2, armF: [0.9, 1.6], armB: [0.7, 1.7], legF: [0.35, -0.5], legB: [-0.25, -0.4] }), S)];
    out.clap = [R(P({ armF: [1.2, 1.2], armB: [0.9, 1.3] }), S), R(P({ armF: [1.05, 1.5], armB: [1.0, 1.5] }), S)];
    out.female = !!v.f;
    return out;
  }

  /* a bandinha (tuba, gaita, clarinete e bumbo), feita com os homens do povo — 2 quadros, 128x60 */
  function buildBand(folk) {
    return [0, 1].map(function (f) {
      var cv = TC.canvas(128, 60), c = cv.ctx;
      [{ x: 8, v: 0, inst: 'tuba' }, { x: 38, v: 4, inst: 'gaita' }, { x: 68, v: 2, inst: 'clar' }, { x: 98, v: 6, inst: 'bumbo' }].forEach(function (pl, k) {
        var fig = folk[pl.v].clap[(f + k) % 2 ? 0 : 0];
        c.drawImage(fig, pl.x - fig.ox + 6, 59 - fig.oy + ((f + k) % 2));
        var hx = pl.x + 10, hy = 34 + ((f + k) % 2);
        if (pl.inst === 'tuba') {
          c.fillStyle = TC.col('#c8a030'); TC.fillCircle(c, hx + 2, hy - 8, 7);
          c.fillStyle = TC.col('#8a6a18'); TC.fillCircle(c, hx + 2, hy - 8, 4);
          c.fillStyle = TC.col('#e8d070'); c.fillRect(hx - 2, hy, 5, 6);
        } else if (pl.inst === 'gaita') {
          c.fillStyle = TC.col('#a01818'); c.fillRect(hx - 6, hy - 4, 4, 9); c.fillRect(hx + 6 + f * 2, hy - 4, 4, 9);
          c.fillStyle = TC.col('#e8e0d0'); for (var b = 0; b < 4 + f; b++) c.fillRect(hx - 2 + b * 2, hy - 3, 1, 7);
        } else if (pl.inst === 'clar') {
          c.fillStyle = TC.col('#1a1a1a'); c.fillRect(hx, hy - 10, 2, 16);
          c.fillStyle = TC.col('#c8c8d0'); c.fillRect(hx - 1, hy + 5, 4, 2);
        } else {
          c.fillStyle = TC.col('#e8e0d0'); TC.fillCircle(c, hx + 2, hy + 4, 8);
          c.fillStyle = TC.col('#a02020'); c.fillRect(hx - 6, hy - 1, 17, 2); c.fillRect(hx - 6, hy + 9, 17, 2);
          c.fillStyle = TC.col('#6a4a2a'); c.fillRect(hx + 6, hy - 6 + f * 3, 2, 6);
        }
      });
      cv.ox = 64; cv.oy = 60;
      return cv;
    });
  }

  /* ====================== SEU ERWIN (o da bandinha) ====================== */
  var ERWIN_HEAD = TC.sprite([
    '....p......',
    '...gpgg....',
    '..gGgggg...',
    'GGGGGGGGG..',
    '..fffffff..',
    '..ffffeff..',
    '.rfffffffr.',
    '..MMMMMMM..',
    '...FFFF....'
  ], { p: '#c84040', g: '#3a5a3a', G: '#2a3a2a', f: '#e8a878', r: '#e07060', E: '#1a1010', e: '#1a1010', M: '#8a7a6a', F: '#b07850' });
  function buildErwin() {
    var S = {
      W: 56, H: 56, ox: 24, groundY: 53,
      thigh: 6, shin: 6, legT: 4.8, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 9, shW: 11,
      upper: 5, fore: 5, armT: 3.8, fist: 3.2, foreThin: 0.4,
      head: ERWIN_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#5a3a20'), pantsB: solid('#3a2414'), boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: (function () { var v = u32('#a02828'), w = u32('#e8e4d8'), b = u32('#e8c040'); return function (x, y) { return (x % 9 === 4) ? w : ((x % 9 === 2 && y % 3 === 0) ? b : v); }; })(),
        sleeve: solid('#e8e4d8'), sleeveB: solid('#b8b4a8'), skin: solid('#e8a878'), skinB: solid('#b07850'), outline: '#100a0a'
      },
      after: function (pb, info, pose) {
        thick(pb, info.sx - 3, info.sy + 1, info.hx - 3, info.hy - 1, 1, solid('#3a2418'));
        thick(pb, info.sx + 3, info.sy + 1, info.hx + 3, info.hy - 1, 1, solid('#3a2418'));
        if (pose.acc && info.hand) {
          var hx = info.hand.x, hy = info.hand.y;
          pb.rect(Math.round(hx - 12), Math.round(hy - 6), 6, 11, u32('#a01818'));
          for (var b = 0; b < 5; b++) pb.rect(Math.round(hx - 6 + b * 2), Math.round(hy - 5 + (b % 2)), 1, 9, u32(b % 2 ? '#e8e0d0' : '#2a1414'));
          pb.rect(Math.round(hx + 4), Math.round(hy - 6), 5, 11, u32('#a01818'));
          pb.rect(Math.round(hx + 5), Math.round(hy - 5), 3, 8, u32('#f0e8d8'));
        }
        if (pose.lasso && info.hand) {
          for (var r = 0; r < 4; r++) thick(pb, info.hand.x - 2 + r, info.hand.y + 1, info.hand.x + r, info.hand.y + 7, 1, solid('#d8b070'));
        }
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04 }), S), R(P({ lean: 0.04, breath: 1 }), S)];
    out.play = [R(P({ lean: 0.0, armF: [1.0, 0.9], armB: [0.7, 1.1], acc: true }), S), R(P({ lean: 0.04, armF: [1.2, 0.7], armB: [0.6, 1.2], acc: true, breath: 1 }), S)];
    out.offer = [R(P({ lean: 0.05, armF: [1.35, 0.5], armB: [1.1, 0.6], lasso: true }), S)];
    out.walk = walkPoses(6, 0.3, 0.1).map(function (p) { return R(p, S); });
    return out;
  }
  function erwinPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a1a14', '#080404');
    ellipseFill(pb, 20, 44, 19, 11, function (x) { return u32(x % 9 === 4 ? '#e8e4d8' : '#a02828'); });
    pb.rect(16, 28, 8, 6, u32('#b07850'));
    face(pb, '#e8a878', '#c08a60', '#8a5a40', '#f8c898', 20, 22, 11, 11);
    // bochechas vermelhas, bigodão grisalho
    pb.rect(11, 24, 3, 2, u32('#e07060')); pb.rect(27, 24, 3, 2, u32('#e07060'));
    for (var x = 12; x <= 28; x++) for (var y = 27; y <= 29 + (Math.abs(x - 20) > 5 ? 1 : 0); y++) pb.set(x, y, u32(y === 27 ? '#a89a8a' : '#8a7a6a'));
    pb.rect(14, 20, 4, 2, u32('#e8e0d0')); pb.rect(23, 20, 4, 2, u32('#e8e0d0'));
    pb.rect(15, 20, 2, 2, u32('#2a1a10')); pb.rect(24, 20, 2, 2, u32('#2a1a10'));
    pb.rect(20, 21, 1, 5, u32('#c08a60'));
    // chapéu tirolês verde com pena vermelha
    ellipseFill(pb, 20, 10, 10, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#4a6a4a' : '#3a5a3a'); });
    ellipseFill(pb, 20, 14, 15, 2.4, function (x, y, dx, dy) { return u32(dy < 0 ? '#2a3a2a' : '#1a2a1a'); });
    pb.line(27, 9, 33, 2, u32('#c84040'), 2);
    pb.rect(12, 12, 16, 1, u32('#c8a040'));
    return pb.toCanvas();
  }

  /* ====================== EWALD (de cabelo branco) ====================== */
  function ewaldHead(hair, must, skin, skinS) {
    return TC.sprite([
      '...cccc....',
      '..cCcccc...',
      '..ccccccc..',
      'bbbbbbbbbbb',
      'hhfffffff..',
      'hhffffeff..',
      'h.fffffff..',
      '..FMMMMMf..',
      '...FFFF....'
    ], { c: '#5a4630', C: '#7a6448', b: '#3a2c1c', h: hair, f: skin, F: skinS, e: '#1a1010', M: must });
  }
  function ewaldSpec(old) {
    var skin = old ? '#e0a880' : '#e8aa76', skinS = old ? '#a87458' : '#b06e4a';
    return {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3.2, foreThin: 0.4,
      head: ewaldHead(old ? '#e8e8ee' : '#4a3020', old ? '#f0f0f4' : '#4a2a18', skin, skinS), headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#6a5a44'), pantsB: solid('#4a3e30'), boot: solid('#3a2414'), bootB: solid('#24160c'),
        shirt: (function () { var a = u32('#6a4228'), b = u32('#8a5a38'); return function (x, y) { return (x + y * 2) % 7 === 0 ? b : a; }; })(),
        sleeve: solid('#6a4228'), sleeveB: solid('#4a2c18'), skin: solid(skin), skinB: solid(skinS), outline: '#120a0e'
      }
    };
  }
  function buildEwaldOld() {
    var S = ewaldSpec(true), R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.08 }), S), R(P({ lean: 0.08, breath: 1 }), S)];
    out.walk = walkPoses(8, 0.4, 0.14).map(function (p) { return R(p, S); });
    out.watch = [R(P({ lean: 0.1, armF: [1.0, 1.6], armB: [0.8, 1.6], headY: 1 }), S)];
    out.laugh = [R(P({ lean: -0.2, armF: [0.6, 1.4], armB: [-0.4, 1.3] }), S), R(P({ lean: -0.25, armF: [0.7, 1.5], armB: [-0.5, 1.2], breath: 1 }), S)];
    out.step = [R(P({ lean: 0.1, legF: [0.45, -0.2], legB: [-0.3, -0.1], armF: [0.6, 0.4] }), S)];
    return out;
  }
  function buildEwaldYoungExtra() {
    var S = ewaldSpec(false), R = ART.renderFigure;
    return {
      laugh: [R(P({ lean: -0.2, armF: [0.6, 1.4], armB: [-0.4, 1.3] }), S), R(P({ lean: -0.25, armF: [0.7, 1.5], armB: [-0.5, 1.2], breath: 1 }), S)],
      step: [R(P({ lean: 0.1, legF: [0.45, -0.2], legB: [-0.3, -0.1], armF: [0.6, 0.4] }), S)]
    };
  }
  /* retrato do Ewald velho: o retrato do capítulo 3, com o cabelo e o bigode embranquecidos e rugas */
  function ewaldOldPortrait() {
    var src = ART.portrait('ewald', 'normal');
    var pb = new TC.PixBuf(40, 40);
    if (src) {
      var b = TC.bufFrom(src);
      var map = {};
      map[u32('#4a3020')] = u32('#d8d8e0');
      map[u32('#4a2a18')] = u32('#ececf2');
      map[u32('#6a4028')] = u32('#c8c8d2');
      for (var i = 0; i < b.d.length; i++) pb.d[i] = map[b.d[i]] != null ? map[b.d[i]] : b.d[i];
    } else portraitBG(pb, '#2a1a10', '#080404');
    // rugas na testa e nos olhos
    pb.rect(15, 17, 10, 1, u32('#a87458'));
    pb.set(12, 22, u32('#a87458')); pb.set(11, 23, u32('#a87458')); pb.set(28, 22, u32('#8a5a40')); pb.set(29, 23, u32('#8a5a40'));
    pb.rect(14, 24, 1, 3, u32('#a87458')); pb.rect(26, 24, 1, 3, u32('#a87458'));
    return pb.toCanvas();
  }

  /* ====================== OMA HEDWIG (moça, fantasma de luz quente) ====================== */
  function buildHedwigGhost(CAST) {
    var H = CAST.hedwig, out = {};
    Object.keys(H).forEach(function (k) { out[k] = H[k].map(function (f) { return tinted(f, '#ffe8c0', 0.5); }); });
    return out;
  }

  /* ====================== HILDE (capítulo 4, ou substituta) ====================== */
  function buildHilde(CAST) {
    var H = null;
    try { if (ART.ch4Init) { var C4 = ART.ch4Init(); if (C4 && C4.hilde) H = C4.hilde; } } catch (e) { H = null; }
    if (H && (H.free || H.float)) {
      C7.hildeFallback = false;
      return {
        free: H.free || H.float, float: H.float || H.free, sew: H.sew || H.float || H.free,
        dance: H.dance || H.walk || H.free, human: H.human || H.free
      };
    }
    C7.hildeFallback = true;
    var s = CAST.sleepers[0];
    function g(f) { return tinted(f, '#f0f4ff', 0.5); }
    return { free: s.idle.map(g), float: s.idle.map(g), sew: s.sew.map(g), dance: s.walk.map(g), human: s.idle };
  }
  function hildePortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a2030', '#080608');
    ellipseFill(pb, 20, 44, 18, 11, function () { return u32('#e8e4e8'); });
    pb.rect(16, 28, 8, 6, u32('#c8b8c0'));
    ellipseFill(pb, 20, 18, 12, 12, function (x, y) { return u32((x + y) % 5 === 0 ? '#4a3020' : '#5a3a28'); });
    face(pb, '#f0e0e0', '#d0c0c8', '#a898a8', '#ffffff');
    pb.rect(14, 21, 4, 2, u32('#ffffff')); pb.rect(23, 21, 4, 2, u32('#ffffff'));
    pb.rect(15, 21, 2, 2, u32('#4a6a8a')); pb.rect(24, 21, 2, 2, u32('#4a6a8a'));
    pb.rect(18, 29, 5, 1, u32('#c08080'));
    // a linha vermelha, agora uma fitinha no cabelo
    pb.rect(26, 9, 5, 2, u32('#e02828')); pb.line(29, 11, 32, 18, u32('#c02020'));
    return pb.toCanvas();
  }

  /* ====================== DER ALTE, EM TAMANHO VERDADEIRO ====================== */
  function bigDemon(C2) {
    var S = C2.demon, K = 1.35, out = {};
    Object.keys(S).forEach(function (k) {
      out[k] = S[k].map(function (f) { var s = TC.scaleCanvas(f, K); s.ox = Math.round(f.ox * K); s.oy = Math.round(f.oy * K); return s; });
    });
    // de cabeça para baixo no teto: os pés ficam em cima
    out.ceil = out.crawl.map(function (f) { var v = TC.flipV(f); v.ox = f.ox; v.oy = f.height - f.oy; return v; });
    // subindo a parede (virado para a direita = parede da direita)
    out.wall = out.crawl.map(function (f) { var r = TC.rotate(f, -Math.PI / 2); r.ox = Math.round(r.width / 2); r.oy = Math.round(r.height / 2); return r; });
    return out;
  }
  function altePortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a0408', '#000000');
    ellipseFill(pb, 20, 22, 11, 16, function (x, y, dx, dy) {
      var l = -dx * 0.5 - dy * 0.3;
      return u32(l > 0.3 ? '#f0e8d8' : l > -0.3 ? '#d4c8b4' : '#8a7e6e');
    });
    [[14, 17], [25, 17]].forEach(function (e) {
      ellipseFill(pb, e[0] + 0.5, e[1] + 0.5, 3.6, 4.2, function () { return u32('#0a0406'); });
      pb.set(e[0], e[1], u32('#ffffff')); pb.set(e[0] + 1, e[1], u32('#d0f4ff')); pb.set(e[0], e[1] + 1, u32('#a0d0ff'));
    });
    pb.rect(19, 22, 2, 5, u32('#5a4e44'));
    // boca rasgada até as orelhas
    pb.rect(10, 29, 21, 5, u32('#120404'));
    for (var x = 10; x < 31; x += 2) { pb.set(x, 29, u32('#e8e0c8')); pb.set(x + 1, 33, u32('#e8e0c8')); }
    pb.set(9, 28, u32('#120404')); pb.set(31, 28, u32('#120404'));
    for (x = 4; x < 37; x++) {
      var len = 8 + Math.round(H2(x, 3, 9) * 32);
      if (x > 11 && x < 29) len = 3 + Math.round(H2(x, 4, 9) * 3);
      for (var y = 2; y < 2 + len && y < 40; y++) pb.set(x, y, u32(H2(x, y, 6) > 0.85 ? '#2a2228' : '#080408'));
    }
    return pb.toCanvas();
  }

  /* ====================== AS MÃOS COMPRIDAS E AS ASSINATURAS ====================== */
  function handSprite(curl) {
    var W = 24, H = 30, pb = new TC.PixBuf(W, H);
    var sk = u32('#d4c8b4'), sh = u32('#a89c88'), dk = u32('#74685a'), cl = u32('#1a1012');
    ellipseFill(pb, 12, 8, 7, 6, function (x, y, dx) { return dx > 0.4 ? sh : sk; });
    for (var f = -2; f <= 2; f++) {
      var bx = 12 + f * 3, len = (f === 0 ? 16 : Math.abs(f) === 1 ? 15 : 11) - (curl ? 7 : 0);
      var lean = f * (curl ? -0.5 : 0.35);
      for (var t = 0; t < len; t++) {
        var x = Math.round(bx + lean * t * 0.3), y = 11 + t;
        pb.set(x, y, t % 6 === 5 ? dk : (f > 0 ? sh : sk)); pb.set(x + 1, y, f > 0 ? dk : sh);
      }
      var tx = Math.round(bx + lean * len * 0.3), ty = 11 + len;
      pb.set(tx, ty, cl); pb.set(tx, ty + 1, cl); pb.set(tx + 1, ty, cl);
    }
    outline(pb, u32('#120a0e'));
    var cv = pb.toCanvas();
    cv.ox = 12; cv.oy = 4;   // o "pulso" fica no alto
    return cv;
  }
  C7.sigX = function () {
    return TC.sprite([
      '.kk.......kk.',
      'kxxk.....kxxk',
      '.kxxk...kxxk.',
      '..kxxk.kxxk..',
      '...kxxkxxk...',
      '....kxxxk....',
      '....kxxxk....',
      '...kxxkxxk...',
      '..kxxk.kxxk..',
      '.kxxk...kxxk.',
      'kxxk.....kxk.',
      '.kk.......kdd',
      '...........d.'
    ], { k: '#e8dcc0', x: '#2a0c10', d: '#4a1418' });
  };

  /* ====================== TILES ====================== */
  C7.tiles = function () {
    var T = {};
    T.cryptTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#9a96a2';
        if (y < 6) {
          if ((xx % 16) === 0) return '#2a2832';
          if (v === 1 && ((x === 8 && y > 1 && y < 5) || (y === 2 && x > 6 && x < 10))) return '#4a4656';   // cruz gravada
          return H2(xx, y, 701) > 0.85 ? '#7a7684' : '#6a6676';
        }
        if (y === 6) return '#1e1c24';
        var row = Math.floor((y - 7) / 4), bx = (xx + row * 6) % 12;
        if (bx === 0 || (y - 7) % 4 === 3) return '#18161e';
        return H2(Math.floor((xx + row * 6) / 12), row, 702) > 0.5 ? '#3a3844' : '#32303a';
      });
    });
    T.crypt = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16, row = Math.floor(y / 4), bx = (xx + row * 6) % 12;
        if (bx === 0 || y % 4 === 3) return '#18161e';
        return H2(Math.floor((xx + row * 6) / 12), row, 703) > 0.5 ? '#3a3844' : '#32303a';
      });
    });
    T.towerTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#d0a878';
        if (y < 5) {
          var off = (Math.floor(y / 2) % 2) * 5;
          if ((xx + off) % 10 === 0) return '#4a3018';
          if (y === 2 && (xx + off) % 10 === 2) return '#8a8a96';   // prego
          return H2(xx >> 2, y, 704) > 0.6 ? '#a07848' : '#8a6438';
        }
        if (y === 5) return '#3a2410';
        if (y < 8) return '#5a3a20';
        if (x === 2 || x === 13) return '#4a2e18';
        return (x + y) % 9 === 0 ? '#2a1a0c' : '#1e140a';
      });
    });
    T.tower = tile(function (x, y) { if (x === 2 || x === 13) return '#4a2e18'; return (x + y) % 9 === 0 ? '#2a1a0c' : '#1e140a'; });
    T.naveTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#e8d8b8';
        if (y < 7) {
          if (xx % 4 === 0 || y === 3 || y === 6) return '#5a3a28';
          var ck = ((xx >> 2) + (y > 3 ? 1 : 0)) % 2;
          return ck ? '#a03a28' : '#d8a860';
        }
        if (y === 7) return '#3a2418';
        var row = Math.floor((y - 8) / 4), bx = (xx + row * 5) % 10;
        if (bx === 0 || (y - 8) % 4 === 3) return '#1e1814';
        return H2(Math.floor((xx + row * 5) / 10), row, 705) > 0.5 ? '#5a5048' : '#4e4640';
      });
    });
    T.nave = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16, row = Math.floor(y / 4), bx = (xx + row * 5) % 10;
        if (bx === 0 || y % 4 === 3) return '#1e1814';
        return H2(Math.floor((xx + row * 5) / 10), row, 706) > 0.5 ? '#5a5048' : '#4e4640';
      });
    });
    T.deckTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#8a6a44';
        if (y < 6) {
          if (y === 3) return '#140c06';   // calafeto
          if (xx % 12 === 0) return '#2a1a0c';
          if ((xx % 12 === 3) && (y === 1 || y === 4)) return '#5a5a66';
          return H2(xx >> 3, y > 3 ? 1 : 0, 707) > 0.5 ? '#6a4a2c' : '#5e4226';
        }
        if (y === 6) return '#1a1008';
        return (x % 8 === 3) ? '#3a2814' : ((x + y) % 7 === 0 ? '#1a1008' : '#0e0804');
      });
    });
    T.deck = tile(function (x, y) { return (x % 8 === 3) ? '#3a2814' : ((x + y) % 7 === 0 ? '#1a1008' : '#0e0804'); });
    // a passarela costurada pela Hilde: pano de linha vermelha
    T.stitch = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#ff8080';
        if (y < 6) {
          if ((xx + y) % 4 === 0 || (xx - y + 64) % 4 === 0) return '#f0e0d0';
          return y % 2 ? '#c02020' : '#a01818';
        }
        if (y === 6) return '#600c0c';
        if (y < 14 && (xx % 5 === 2)) return y % 2 ? '#c02020' : null;   // fios pendurados
        return null;
      });
    });
    return T;
  };

  /* ====================== A PRAÇA: A PAREDE LATERAL DA MATRIZ ====================== */
  C7.sideWall = function (w) {
    var H = 152, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(1855);
    cv.windows = [];
    // telhado de ardósia
    for (var x = 0; x < w; x++) {
      for (var y = 0; y < 16; y++) {
        var row = y >> 2;
        c.fillStyle = TC.col(((x + row * 3) % 7 === 0) ? '#1a1a26' : (row % 2 ? '#2e2e40' : '#36364a'));
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = TC.col('#0e0e18'); c.fillRect(0, 15, w, 2);
    // cornija
    c.fillStyle = TC.col('#d8d8e4'); c.fillRect(0, 17, w, 3);
    c.fillStyle = TC.col('#9a9aae'); c.fillRect(0, 20, w, 1);
    for (x = 0; x < w; x += 6) { c.fillStyle = TC.col('#b0b0c4'); c.fillRect(x, 21, 3, 2); }
    // reboco branco
    for (y = 23; y < 138; y++) {
      c.fillStyle = TC.mix('#d8d8e6', '#b8b8cc', (y - 23) / 115);
      c.fillRect(0, y, w, 1);
    }
    for (var k = 0; k < w * 0.6; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#c4c4d4' : '#e4e4ee'); c.fillRect(r.int(0, w), r.int(24, 136), r.int(1, 3), 1); }
    // embasamento de pedra
    for (y = 138; y < H; y++) for (x = 0; x < w; x++) {
      var rr = Math.floor((y - 138) / 7), bx = (x + rr * 9) % 18;
      c.fillStyle = TC.col(bx === 0 || (y - 138) % 7 === 6 ? '#3a3a48' : (H2(Math.floor((x + rr * 9) / 18), rr, 708) > 0.5 ? '#7a7888' : '#6a6878'));
      c.fillRect(x, y, 1, 1);
    }
    // vãos: contraforte + vitral ogival aceso por dentro
    for (var bx0 = 0; bx0 < w; bx0 += 64) {
      // contraforte
      c.fillStyle = TC.col('#a8a8bc'); c.fillRect(bx0, 18, 10, H - 18);
      c.fillStyle = TC.col('#e8e8f2'); c.fillRect(bx0, 18, 2, H - 18);
      c.fillStyle = TC.col('#7a7a90'); c.fillRect(bx0 + 9, 18, 1, H - 18);
      for (y = 40; y < H; y += 32) { c.fillStyle = TC.col('#8a8aa0'); c.fillRect(bx0, y, 10, 2); }
      TC.fillPoly(c, [[bx0 - 1, 18], [bx0 + 5, 6], [bx0 + 11, 18]]);
      // vitral
      var wx = bx0 + 30, wy = 36, ww = 16, wh = 80;
      c.fillStyle = TC.col('#3a3a50');
      TC.fillPoly(c, [[wx - 3, wy + wh + 3], [wx - 3, wy + 10], [wx + ww / 2, wy - 5], [wx + ww + 3, wy + 10], [wx + ww + 3, wy + wh + 3]]);
      var cols = ['#e8b050', '#c84838', '#5070c8', '#58a868', '#d8c870', '#a858b0'];
      for (y = wy; y < wy + wh; y++) for (x = wx; x < wx + ww; x++) {
        var top = wy + 10 - (ww / 2 - Math.abs(x - wx - ww / 2 + 0.5)) * 1.3;
        if (y < top) continue;
        var cc = cols[(Math.floor((x - wx) / 4) + Math.floor((y - wy) / 6) + bx0 / 64) % cols.length];
        if ((x - wx) % 8 === 7 || (y - wy) % 12 === 11) cc = '#2a2030';
        // uma vela desenhada em cada vitral (São Miguel com a espada, estilizado)
        if (x - wx >= 6 && x - wx <= 9 && y - wy > 28 && y - wy < 56) cc = (x - wx === 7 || x - wx === 8) ? '#fff0c0' : cc;
        c.fillStyle = TC.col(TC.mix(cc, '#fff0c8', 0.25));
        c.fillRect(x, y, 1, 1);
      }
      c.fillStyle = TC.col('#e8e8f2'); c.fillRect(wx - 4, wy + wh + 3, ww + 8, 3);
      cv.windows.push({ x: wx + ww / 2, y: wy + wh / 2, top: wy, bot: wy + wh });
    }
    return cv;
  };
  /* o portal lateral da Matriz (as portas que o Arno defende) */
  C7.portal = function () {
    var W = 96, H = 132, pb = new TC.PixBuf(W, H), cx = W / 2;
    var st = u32('#c8c8d8'), stD = u32('#8a8aa0'), stL = u32('#ececf4'), dk = u32('#2a2030');
    for (var arc = 4; arc >= 0; arc--) {
      var aw = 48 + arc * 8, ax0 = Math.round(cx - aw / 2), ay0 = 34 - arc * 6;
      for (var y = ay0; y < H - 10; y++) for (var x = ax0; x < ax0 + aw; x++) {
        var top = ay0 + aw * 0.55, dxx = Math.abs(x - cx + 0.5);
        if (y < top && dxx > (aw / 2) * Math.sqrt(Math.max(0, (y - ay0) / (aw * 0.55)))) continue;
        pb.set(x, y, arc === 0 ? u32('#4a2a18') : (arc % 2 ? stL : st));
      }
    }
    // tábuas e cravos de ferro da porta dupla
    for (y = 40; y < H - 10; y++) for (x = Math.round(cx - 24); x < cx + 24; x++) {
      var tp = 34 + 48 * 0.55, dx2 = Math.abs(x - cx + 0.5);
      if (y < tp && dx2 > 24 * Math.sqrt(Math.max(0, (y - 34) / (48 * 0.55)))) continue;
      var plank = (x - Math.round(cx - 24)) % 8;
      var col = plank === 0 ? u32('#2a160c') : (H2(x >> 3, y >> 4, 709) > 0.5 ? u32('#5a3420') : u32('#4e2c1a'));
      if ((y - 50) % 18 === 0 && plank === 4) col = u32('#8a8a96');
      pb.set(x, y, col);
    }
    for (y = 40; y < H - 10; y++) { pb.set(Math.round(cx) - 1, y, dk); pb.set(Math.round(cx), y, dk); }
    for (x = Math.round(cx - 24); x < cx + 24; x++) { pb.set(x, 70, u32('#2a2a30')); pb.set(x, 100, u32('#2a2a30')); }
    pb.rect(Math.round(cx) - 5, 82, 3, 4, u32('#c8b070')); pb.rect(Math.round(cx) + 2, 82, 3, 4, u32('#c8b070'));
    // degraus
    for (var s = 0; s < 3; s++) pb.rect(Math.round(cx - 34 - s * 5), H - 10 + s * 3, 68 + s * 10, 3, s % 2 ? stD : st);
    // lampiões nas laterais
    [8, W - 12].forEach(function (lx) { pb.rect(lx, 50, 4, 7, u32('#2a2a30')); pb.rect(lx + 1, 51, 2, 5, u32('#ffe090')); });
    outline(pb, u32('#1a1a26'));
    var cv = pb.toCanvas();
    cv.lamps = [{ x: 10, y: 54 }, { x: W - 10, y: 54 }];
    return cv;
  };

  /* ====================== O CEMITÉRIO ====================== */
  C7.gate = function () {
    var g = TC.canvas(72, 96), c = g.ctx;
    [[0, 14], [58, 14]].forEach(function (p) {
      c.fillStyle = TC.col('#6a6670'); c.fillRect(p[0], 30, p[1], 66);
      c.fillStyle = TC.col('#8e8a96'); c.fillRect(p[0], 30, p[1], 2);
      c.fillStyle = TC.col('#46424e'); c.fillRect(p[0] + p[1] - 2, 32, 2, 64);
      c.fillStyle = TC.col('#8e8a96'); c.fillRect(p[0] - 2, 26, p[1] + 4, 5);
    });
    c.fillStyle = TC.col('#1c1c24');
    for (var a = 0; a <= 20; a++) c.fillRect(Math.round(14 + a * 2.2), Math.round(24 - Math.sin(a / 20 * Math.PI) * 18), 2, 2);
    c.fillRect(35, 0, 2, 10); c.fillRect(32, 3, 8, 2);
    for (var bx = 16; bx < 58; bx += 5) c.fillRect(bx, 30, 1, 66);
    return g;
  };
  C7.beckerTomb = function () {
    var W = 52, H = 58, pb = new TC.PixBuf(W, H);
    var g = u32('#7a7686'), gd = u32('#4a4656'), gl = u32('#9e9aaa');
    // cruz de pedra
    pb.rect(23, 0, 6, 30, g); pb.rect(23, 0, 2, 30, gl); pb.rect(15, 8, 22, 6, g); pb.rect(15, 8, 22, 2, gl);
    // lápide larga com a placa
    pb.rect(3, 26, 46, 32, g); pb.rect(3, 26, 46, 2, gl); pb.rect(47, 26, 2, 32, gd);
    pb.rect(7, 32, 38, 13, u32('#3a3240'));
    pb.rect(8, 33, 36, 11, u32('#c8a858'));
    // musgo e flores frescas
    for (var x = 4; x < 48; x += 3) pb.set(x, 56 - (x % 2), u32('#3a5a3a'));
    pb.rect(34, 50, 2, 6, u32('#3a6a3a')); pb.rect(33, 48, 4, 3, u32('#f0d040')); pb.rect(39, 51, 3, 3, u32('#e86080'));
    outline(pb, u32('#16141c'));
    var cv = pb.toCanvas();
    TC.font.draw(cv.ctx, 'BECKER', 26, 35, '#3a2a10', { align: 'center' });
    return cv;
  };
  C7.sideDoor = function () {
    var W = 60, H = 92, pb = new TC.PixBuf(W, H), cx = W / 2;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var top = 6 + Math.pow(Math.abs(x - cx) / (W / 2), 2) * 20;
      if (y < top) continue;
      var inner = Math.abs(x - cx) < 18 && y > top + 6;
      if (inner) {
        // escada descendo para o escuro
        var d = (y - 30) / (H - 30);
        var stepRow = Math.floor((y - 30) / 8);
        pb.set(x, y, u32(y < 30 ? '#06040a' : (((y - 30) % 8) < 2 ? TC.mix('#5a5464', '#0a080e', d) : TC.mix('#2a2632', '#050408', d))));
        if (stepRow < 0) pb.set(x, y, u32('#06040a'));
      } else pb.set(x, y, ((x + Math.floor(y / 6) * 3) % 9 === 0 || y % 6 === 0) ? u32('#4a4656') : u32(x < cx ? '#8a8696' : '#6e6a7a'));
    }
    // grade de ferro aberta
    for (y = 30; y < H; y++) { pb.set(6, y, u32('#1a1a22')); pb.set(9, y, u32('#1a1a22')); }
    outline(pb, u32('#16141c'));
    return pb.toCanvas();
  };

  /* ====================== A CRIPTA ====================== */
  C7.cryptWall = function (w, seed) {
    var H = 176, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 77);
    cv.candles = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < w; x++) {
      var row = Math.floor(y / 8), bx = (x + (row % 2) * 10) % 20;
      var n = H2(Math.floor((x + (row % 2) * 10) / 20), row, 710);
      c.fillStyle = TC.col(bx === 0 || y % 8 === 7 ? '#14121a' : (n > 0.66 ? '#3e3a48' : n > 0.33 ? '#36323e' : '#2e2a36'));
      c.fillRect(x, y, 1, 1);
    }
    // arcos da abóbada (pilares a cada 96 px)
    for (var ax = 0; ax < w + 96; ax += 96) {
      c.fillStyle = TC.col('#4a4656');
      for (var a = 0; a <= 1; a += 0.004) {
        var px = ax + a * 96, py = 46 - Math.sin(a * Math.PI) * 40;
        c.fillRect(Math.round(px), Math.round(py), 2, 5);
      }
      c.fillStyle = TC.col('#55505e'); c.fillRect(ax - 5, 44, 10, H - 44);
      c.fillStyle = TC.col('#6a6676'); c.fillRect(ax - 5, 44, 2, H - 44);
      c.fillStyle = TC.col('#7a7686'); c.fillRect(ax - 7, 42, 14, 4);
      // nicho com placa de padre e vela
      var nx = ax + 34, ny = 92;
      if (nx + 28 < w) {
        c.fillStyle = TC.col('#0c0a10'); TC.fillPoly(c, [[nx, ny + 44], [nx, ny + 8], [nx + 14, ny - 2], [nx + 28, ny + 8], [nx + 28, ny + 44]]);
        c.fillStyle = TC.col('#a8a4b0'); c.fillRect(nx + 4, ny + 12, 20, 12);
        c.fillStyle = TC.col('#5a5664'); for (var q = 0; q < 3; q++) c.fillRect(nx + 6, ny + 14 + q * 3, 16 - (q % 2) * 4, 1);
        c.fillStyle = TC.col('#e8e0d0'); c.fillRect(nx + 13, ny + 32, 2, 8);
        c.fillStyle = TC.col('#ffe080'); c.fillRect(nx + 13, ny + 30, 2, 2);
        cv.candles.push({ x: nx + 14, y: ny + 30 });
      }
    }
    return cv;
  };
  C7.foundation = function () {
    var W = 112, H = 74, cv = TC.canvas(W, H), c = cv.ctx;
    // a pedra fundamental
    c.fillStyle = TC.col('#7a7686'); c.fillRect(2, 30, 54, 44);
    c.fillStyle = TC.col('#9e9aaa'); c.fillRect(2, 30, 54, 3);
    c.fillStyle = TC.col('#4a4656'); c.fillRect(54, 30, 2, 44);
    c.fillStyle = TC.col('#4a4656'); c.fillRect(26, 36, 6, 18); c.fillRect(21, 41, 16, 5);
    TC.font.draw(c, '1855', 29, 60, '#3a3644', { align: 'center' });
    // o cofre de ferro aberto, com a tampa para trás
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(62, 54, 46, 20);
    c.fillStyle = TC.col('#4a4a56'); c.fillRect(62, 54, 46, 2); c.fillRect(62, 64, 46, 1);
    c.fillStyle = TC.col('#1a1a20'); TC.fillPoly(c, [[64, 54], [106, 54], [100, 40], [70, 40]]);
    // o Livro de Bordo aberto, apoiado na borda do cofre
    c.fillStyle = TC.col('#3a2010'); TC.fillPoly(c, [[60, 54], [85, 47], [110, 54], [110, 56], [60, 56]]);
    c.fillStyle = TC.col('#e8dcc0'); TC.fillPoly(c, [[62, 53], [84, 34], [84, 50]]); c.fillRect(62, 50, 22, 4);
    TC.fillPoly(c, [[86, 34], [108, 53], [86, 50]]); c.fillRect(86, 50, 22, 4);
    c.fillStyle = TC.col('#e8dcc0'); TC.fillPoly(c, [[64, 52], [84, 36], [84, 52]]); TC.fillPoly(c, [[86, 36], [106, 52], [86, 52]]);
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(84, 34, 2, 20);
    // linhas de nomes, cada uma com um X
    c.fillStyle = TC.col('#4a3a2a');
    for (var k = 0; k < 6; k++) {
      var ly = 39 + k * 2.4;
      c.fillRect(Math.round(80 - k * 2.6), Math.round(ly + 2), 3, 1); c.fillRect(Math.round(78 - k * 2.6 - 3), Math.round(ly + 2), 2, 1);
      c.fillRect(Math.round(88), Math.round(ly + 2), 3 + k, 1);
      c.fillStyle = TC.col('#2a0c10'); c.fillRect(Math.round(82 - k * 2.2), Math.round(ly + 1), 1, 1); c.fillRect(Math.round(83 - k * 2.2), Math.round(ly + 2), 1, 1); c.fillRect(Math.round(82 - k * 2.2), Math.round(ly + 3), 1, 1);
      c.fillStyle = TC.col('#4a3a2a');
    }
    // "Hedwig", à parte, riscado com raiva (o papel rasgado)
    c.fillStyle = TC.col('#4a3a2a'); c.fillRect(90, 50, 12, 1);
    c.fillStyle = TC.col('#a01818'); TC.thickLine(c, 89, 49, 104, 51, 1); TC.thickLine(c, 89, 51, 104, 49, 1);
    c.fillStyle = TC.col('#1a0e08'); c.fillRect(96, 51, 4, 1);
    cv.bookX = 85; cv.bookY = 44;
    return cv;
  };

  /* ====================== A TORRE DO SINO ====================== */
  C7.towerWall = function (w, depth, seed) {
    var H = 192, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 1923);
    cv.windows = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < w; x++) {
      var row = Math.floor(y / 10), bx = (x + (row % 2) * 12) % 24;
      var n = H2(Math.floor((x + (row % 2) * 12) / 24), row, 711 + (seed || 0));
      c.fillStyle = TC.col(bx === 0 || y % 10 === 9 ? '#1a1614' : (n > 0.6 ? '#4a4038' : n > 0.3 ? '#40362e' : '#382e28'));
      c.fillRect(x, y, 1, 1);
    }
    // janelas de veneziana com a cidade lá embaixo (cada vez mais longe)
    for (var wx = 40; wx + 30 < w; wx += 128) {
      var wy = 34, ww = 28, wh = 56;
      c.fillStyle = TC.col('#14101c');
      TC.fillPoly(c, [[wx - 2, wy + wh + 2], [wx - 2, wy + 8], [wx + ww / 2, wy - 4], [wx + ww + 2, wy + 8], [wx + ww + 2, wy + wh + 2]]);
      grad(c, wx, wy + 6, ww, wh - 6, '#06081a', '#1a1e40');
      var hy = Math.round(wy + wh - 8 - depth * 4);
      c.fillStyle = TC.col('#0a0c1c'); c.fillRect(wx, hy, ww, wy + wh - hy);
      for (var k = 0; k < 10; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#ffc070' : '#ffe0a0'); c.fillRect(wx + r.int(1, ww - 2), hy + r.int(1, Math.max(2, wy + wh - hy - 2)), 1, 1); }
      for (k = 0; k < 6; k++) { c.fillStyle = TC.col('#c8d0f0'); c.fillRect(wx + r.int(0, ww - 1), wy + r.int(8, 24), 1, 1); }
      // tábuas da veneziana
      c.fillStyle = TC.col('#3a2414');
      for (y = wy + 10; y < wy + wh; y += 7) c.fillRect(wx, y, ww, 2);
      c.fillStyle = TC.col('#5a3a20'); c.fillRect(wx + ww / 2 - 1, wy + 6, 2, wh - 6);
      cv.windows.push({ x: wx + ww / 2, y: wy + wh / 2 });
    }
    // vigas e escadas de madeira
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, 22, w, 6); c.fillRect(0, 128, w, 5);
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(0, 22, w, 1); c.fillRect(0, 128, w, 1);
    for (var sx = 96; sx < w; sx += 128) {
      for (var s = 0; s < 14; s++) {
        var px = sx + s * 6, py = 126 - s * 7;
        c.fillStyle = TC.col('#4a2e18'); c.fillRect(px, py, 9, 2);
        c.fillStyle = TC.col('#6a4628'); c.fillRect(px, py, 9, 1);
      }
      c.fillStyle = TC.col('#2a1a0c'); TC.thickLine(c, sx, 130, sx + 84, 30, 2);
      c.fillStyle = TC.col('#2a1a0c'); TC.thickLine(c, sx + 8, 132, sx + 92, 32, 1);
    }
    // cordas penduradas
    for (var rx = 20; rx < w; rx += 90) {
      c.fillStyle = TC.col('#a08050');
      for (y = 28; y < 120 + (rx % 40); y++) c.fillRect(rx + Math.round(Math.sin(y * 0.05) * 1), y, 1, 1);
    }
    return cv;
  };
  C7.clockBack = function () {
    var R = 40, S = R * 2 + 8, pb = new TC.PixBuf(S, S), c = S / 2;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var d = Math.sqrt((x - c) * (x - c) + (y - c) * (y - c));
      if (d > R + 3) continue;
      if (d > R) pb.set(x, y, u32('#2a2a30'));
      else pb.set(x, y, u32(d < 3 ? '#2a2a30' : TC.mix('#e8e0c0', '#a8a088', d / R)));
    }
    // marcas das horas (vistas por trás) e os ponteiros parados em 11:47
    for (var h = 0; h < 12; h++) {
      var a = -h / 12 * TC.TAU - Math.PI / 2;   // espelhado
      for (var t = R - 6; t < R - 1; t++) pb.set(Math.round(c + Math.cos(a) * t), Math.round(c + Math.sin(a) * t), u32('#2a2a30'));
    }
    var ah = -(11 + 47 / 60) / 12 * TC.TAU - Math.PI / 2, am = -(47 / 60) * TC.TAU - Math.PI / 2;
    pb.line(c, c, c + Math.cos(ah) * R * 0.5, c + Math.sin(ah) * R * 0.5, u32('#1a1a20'), 3);
    pb.line(c, c, c + Math.cos(am) * R * 0.8, c + Math.sin(am) * R * 0.8, u32('#1a1a20'), 2);
    for (var sp = 0; sp < 4; sp++) { var ba = sp * Math.PI / 2 + 0.4; pb.line(c, c, c + Math.cos(ba) * R, c + Math.sin(ba) * R, u32('#5a5048')); }
    return pb.toCanvas();
  };
  C7.gear = function (R, teeth) {
    var S = R * 2 + 6, pb = new TC.PixBuf(S, S), c = S / 2;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var dx = x - c + 0.5, dy = y - c + 0.5, d = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx);
      var tooth = (Math.floor((a + Math.PI) / TC.TAU * teeth * 2) % 2 === 0) ? 3 : 0;
      if (d > R + tooth) continue;
      var spoke = false;
      for (var k = 0; k < 5; k++) { var sa = k / 5 * TC.TAU; if (Math.abs(Math.sin(a - sa)) * d < 2 && Math.cos(a - sa) > 0) spoke = true; }
      if (d > R - 4 || d < 5 || spoke) pb.set(x, y, u32(d < 3 ? '#3a3020' : (dx - dy > 0 ? '#c8a050' : (d > R ? '#8a6a30' : '#a88440'))));
    }
    outline(pb, u32('#1a1208'));
    return pb.toCanvas();
  };
  C7.bigBell = function () {
    var W = 112, H = 110, pb = new TC.PixBuf(W, H), cx = W / 2;
    // cavalete de madeira
    pb.rect(4, 0, 104, 8, u32('#4a2e18')); pb.rect(4, 0, 104, 2, u32('#6a4628'));
    pb.rect(cx - 6, 8, 12, 8, u32('#3a2414'));
    for (var y = 0; y < 86; y++) {
      var t = y / 86, hw = 14 + Math.pow(t, 1.6) * 34 + (t > 0.85 ? (t - 0.85) * 60 : 0);
      for (var x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        var e = (x - cx) / hw;
        var col = e < -0.55 ? '#8a6420' : e < -0.15 ? '#d8a840' : e < 0.25 ? '#f0cc68' : e < 0.6 ? '#b88a30' : '#6a4a18';
        if (y > 74 && y < 79) col = e < 0 ? '#e8c060' : '#a07828';
        pb.set(x, 16 + y, u32(col));
      }
    }
    pb.rect(cx - 4, 96, 8, 10, u32('#3a2a14'));   // badalo
    outline(pb, u32('#1a1206'));
    var cv = pb.toCanvas();
    TC.font.draw(cv.ctx, 'HOFFNUNG', cx, 54, '#5a3a10', { align: 'center' });
    TC.font.draw(cv.ctx, '1852', cx, 64, '#5a3a10', { align: 'center' });
    return cv;
  };
  C7.pigeon = function () {
    var pal = { k: '#1a1a22', g: '#7a7a88', G: '#a0a0b0', w: '#d8d8e0', e: '#ff8040', p: '#5a7a6a' };
    return {
      perch: TC.sprite(['...kk...', '..kGek..', '.kgpgk..', 'kgggggk.', 'kgGGgggk', '.kgggggk', '..kkkkk.', '...e.e..'], pal),
      fly: [TC.sprite(['k......k', 'kk....kk', '.kgkkgk.', '..kgGek.', '...kkk..'], pal), TC.sprite(['........', '..kkkk..', 'kggGgek.', '.k....k.', '........'], pal)]
    };
  };

  /* ====================== A NAVE DA MATRIZ ====================== */
  // 256x192: abóbada nervurada, coluna central (onde se amarra o pau-de-fita), vitrais altos, órgão à esquerda, altar à direita
  C7.nave = function (day) {
    var W = 256, H = 192, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(day ? 5 : 3);
    var wallT = day ? '#d8ccb8' : '#2e2c44', wallB = day ? '#b0a490' : '#1e1c30';
    grad(c, 0, 0, W, H, wallT, wallB);
    for (var k = 0; k < 500; k++) { c.fillStyle = TC.col(TC.shade(day ? '#c8bca8' : '#2a2840', r.range(0.85, 1.12))); c.fillRect(r.int(0, W), r.int(40, 150), r.int(1, 4), 1); }
    cv.windows = [];
    // vitrais altos entre as colunas
    [40, 88, 168, 216].forEach(function (wx, i) {
      var wy = 46, ww = 18, wh = 84;
      c.fillStyle = TC.col(day ? '#7a7060' : '#12101e');
      TC.fillPoly(c, [[wx - 3, wy + wh + 3], [wx - 3, wy + 10], [wx + ww / 2, wy - 6], [wx + ww + 3, wy + 10], [wx + ww + 3, wy + wh + 3]]);
      var cols = day ? ['#ffd860', '#ff6a50', '#60a0ff', '#70e090', '#fff0b0', '#d080ff'] : ['#2a3a7a', '#5a2a4a', '#2a5a6a', '#6a5a2a', '#3a2a6a', '#4a4a8a'];
      for (var y = wy; y < wy + wh; y++) for (var x = wx; x < wx + ww; x++) {
        var top = wy + 10 - (ww / 2 - Math.abs(x - wx - ww / 2 + 0.5)) * 1.4;
        if (y < top) continue;
        var cc = cols[(Math.floor((x - wx) / 4) + Math.floor((y - wy) / 5) + i * 2) % cols.length];
        if ((x - wx) % 6 === 5 || (y - wy) % 10 === 9) cc = day ? '#3a3028' : '#0a0a14';
        // figura central: São Miguel, a espada e a balança
        var lx = x - wx, ly = y - wy;
        if (lx >= 7 && lx <= 10 && ly > 22 && ly < 66) cc = day ? '#fff8e0' : '#8a9ac8';
        if (ly > 30 && ly < 33 && lx > 3 && lx < 15) cc = day ? '#ffe070' : '#6a6a90';
        c.fillStyle = TC.col(cc); c.fillRect(x, y, 1, 1);
      }
      cv.windows.push({ x: wx + ww / 2, y: wy + wh / 2, top: wy, bot: wy + wh, w: ww });
    });
    // colunas (a do meio é a grande)
    [[0, 10], [64, 10], [128, 26], [192, 10], [256, 10]].forEach(function (p) {
      var x0 = p[0] - p[1] / 2, w = p[1];
      grad(c, x0, 36, w, 156, day ? '#e8e0d0' : '#4a4864', day ? '#c0b4a0' : '#2e2c44');
      c.fillStyle = TC.col(day ? '#fff8ec' : '#62607e'); c.fillRect(x0 + 1, 36, 2, 156);
      c.fillStyle = TC.col(day ? '#9a8e7c' : '#1e1c30'); c.fillRect(x0 + w - 2, 36, 2, 156);
      c.fillStyle = TC.col(day ? '#d0c4b0' : '#56546e'); c.fillRect(x0 - 3, 34, w + 6, 6);
      c.fillStyle = TC.col(day ? '#b0a490' : '#3a3850'); c.fillRect(x0 - 3, 150, w + 6, 4);
    });
    // a coluna central: capitel trabalhado e argola de ferro (onde as fitas se prendem)
    c.fillStyle = TC.col(day ? '#c8a060' : '#6a5a3a'); c.fillRect(116, 42, 24, 3);
    c.fillStyle = TC.col(day ? '#e8c880' : '#8a7a50'); c.fillRect(118, 42, 20, 1);
    // abóbada nervurada
    c.fillStyle = TC.col(day ? '#b8ac98' : '#16142a');
    for (var bx = 0; bx < W; bx += 64) {
      for (var a = 0; a <= 1; a += 0.006) {
        var px = bx + a * 64, py = 36 - Math.sin(a * Math.PI) * 32;
        c.fillRect(Math.round(px), 0, 1, Math.round(py));
      }
    }
    c.fillStyle = TC.col(day ? '#e0d4c0' : '#3a3858');
    for (bx = 0; bx < W; bx += 64) {
      for (a = 0; a <= 1; a += 0.004) {
        c.fillRect(Math.round(bx + a * 64), Math.round(36 - Math.sin(a * Math.PI) * 32), 1, 2);
        c.fillRect(Math.round(bx + a * 64), Math.round(36 - a * 30), 1, 1);
        c.fillRect(Math.round(bx + 64 - a * 64), Math.round(36 - a * 30), 1, 1);
      }
    }
    // lambri de madeira embaixo
    for (var x = 0; x < W; x++) {
      c.fillStyle = TC.col(x % 16 === 0 ? (day ? '#5a3a20' : '#140a06') : (day ? '#8a5a34' : '#2a1a10'));
      c.fillRect(x, 156, 1, 36);
    }
    c.fillStyle = TC.col(day ? '#a87850' : '#3a2414'); c.fillRect(0, 154, W, 3);
    // o órgão no coro, à esquerda
    for (var o = 0; o < 9; o++) {
      var ph = 34 + Math.abs(4 - o) * -4 + 20;
      c.fillStyle = TC.col(day ? '#e8d090' : '#8a7a50'); c.fillRect(4 + o * 4, 92 - ph, 3, ph);
      c.fillStyle = TC.col(day ? '#fff0c0' : '#a89870'); c.fillRect(4 + o * 4, 92 - ph, 1, ph);
    }
    c.fillStyle = TC.col(day ? '#6a4428' : '#2a1a10'); c.fillRect(0, 92, 44, 8);
    c.fillStyle = TC.col(day ? '#8a5a34' : '#3a2414'); for (x = 2; x < 44; x += 4) c.fillRect(x, 100, 2, 10);
    c.fillRect(0, 108, 44, 3);
    // o altar à direita
    c.fillStyle = TC.col(day ? '#f0ece4' : '#c8c4d0'); c.fillRect(226, 138, 30, 6);
    c.fillStyle = TC.col(day ? '#c8a060' : '#7a6a40'); c.fillRect(226, 144, 30, 2);
    c.fillStyle = TC.col(day ? '#6a4428' : '#3a2414'); c.fillRect(228, 146, 26, 46);
    c.fillStyle = TC.col(day ? '#e8c060' : '#a89050'); c.fillRect(239, 104, 3, 30); c.fillRect(233, 112, 15, 3);
    c.fillStyle = TC.col(day ? '#e8c060' : '#a89050'); c.fillRect(229, 126, 2, 12); c.fillRect(250, 126, 2, 12);
    c.fillStyle = TC.col('#f0e8d8'); c.fillRect(229, 120, 2, 6); c.fillRect(250, 120, 2, 6);
    cv.candles = [{ x: 230, y: 119 }, { x: 251, y: 119 }];
    // via-sacra (quadrinhos) entre os vitrais
    [64, 192].forEach(function (qx) { c.fillStyle = TC.col(day ? '#6a4428' : '#2a1a10'); c.fillRect(qx - 6, 112, 12, 14); c.fillStyle = TC.col(day ? '#c8a878' : '#5a4a3a'); c.fillRect(qx - 4, 114, 8, 10); });
    return cv;
  };
  /* o porão do veleiro Hoffnung, em 1852, na calmaria */
  C7.hold = function () {
    var W = 256, H = 192, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(1852);
    // tábuas curvas do casco
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var bend = Math.round(Math.pow((x - 128) / 128, 2) * 10);
      var row = Math.floor((y + bend) / 9);
      var n = H2(row, Math.floor((x + row * 37) / 40), 712);
      var col = (y + bend) % 9 === 0 ? '#120a06' : (n > 0.6 ? '#4a321e' : n > 0.3 ? '#402a18' : '#382414');
      c.fillStyle = TC.col(col); c.fillRect(x, y, 1, 1);
    }
    // cavernas (costelas) do casco
    for (var rx = 16; rx < W; rx += 48) {
      c.fillStyle = TC.col('#24160c');
      for (y = 0; y < H; y++) { var cx2 = rx + Math.round(Math.sin(y / H * Math.PI) * (rx < 128 ? -6 : 6)); c.fillRect(cx2, y, 7, 1); }
      c.fillStyle = TC.col('#5a3a20');
      for (y = 0; y < H; y++) { var cx3 = rx + Math.round(Math.sin(y / H * Math.PI) * (rx < 128 ? -6 : 6)); c.fillRect(cx3, y, 1, 1); }
    }
    // vigas do convés de cima
    c.fillStyle = TC.col('#1a1008'); c.fillRect(0, 0, W, 14);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, 12, W, 6);
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(0, 12, W, 1);
    // escotilhas com o mar parado lá fora
    cv.portholes = [];
    [52, 128, 204].forEach(function (px) {
      var py = 84, R = 11;
      c.fillStyle = TC.col('#8a6a30'); TC.fillCircle(c, px, py, R + 3);
      c.fillStyle = TC.col('#c8a050'); TC.fillCircle(c, px, py, R + 2);
      for (var yy = -R; yy <= R; yy++) for (var xx = -R; xx <= R; xx++) {
        if (xx * xx + yy * yy > R * R) continue;
        var sky = yy < 2;
        c.fillStyle = TC.col(sky ? TC.mix('#0a0c24', '#1e2650', (yy + R) / (R + 2)) : (Math.abs(xx) < 2 && yy > 2 ? '#c8d0f0' : '#0e1430'));
        c.fillRect(px + xx, py + yy, 1, 1);
      }
      c.fillStyle = TC.col('#e8e8f0'); c.fillRect(px + 3, py - 6, 2, 2);
      cv.portholes.push({ x: px, y: py });
    });
    // redes com os emigrantes de 1852 (fantasmas azulados)
    [[64, 112], [172, 116]].forEach(function (h) {
      c.fillStyle = TC.col('#8a7a5a');
      for (var t = 0; t <= 1; t += 0.01) c.fillRect(Math.round(h[0] - 24 + t * 48), Math.round(h[1] + Math.sin(t * Math.PI) * 9), 1, 3);
      c.fillStyle = TC.col('#a0b0d8'); TC.fillEllipse(c, h[0], h[1] + 6, 14, 3);
      c.fillStyle = TC.col('#c8d4f0'); TC.fillCircle(c, h[0] - 12, h[1] + 3, 3);
    });
    // caixotes, barris e sacos de batata-semente
    for (var bxx = 4; bxx < W; bxx += 34 + r.int(0, 20)) {
      if (bxx > 110 && bxx < 146) continue;
      c.fillStyle = TC.col('#5a3e26'); c.fillRect(bxx, 164, 22, 28);
      c.fillStyle = TC.col('#7a5a38'); c.fillRect(bxx, 164, 22, 2);
      c.fillStyle = TC.col('#3a2414'); c.fillRect(bxx, 176, 22, 1); c.fillRect(bxx + 10, 164, 1, 28);
    }
    // escada até a escotilha do convés, com um fio de luar
    c.fillStyle = TC.col('#4a2e18'); c.fillRect(120, 18, 3, 150); c.fillRect(134, 18, 3, 150);
    for (y = 26; y < 166; y += 12) c.fillRect(120, y, 17, 2);
    c.fillStyle = TC.col('#e8e8f0'); TC.font.draw(c, '1852', 236, 24, '#c8a060', { align: 'right' });
    return cv;
  };
  C7.pewEnd = function () {
    return TC.sprite([
      '..kkkk..',
      '.kwWwwk.',
      'kwwwwwwk',
      'kwkwwkwk',
      'kwwwwwwk',
      'kwwwwwwk',
      'kwkkkkwk',
      'kwkwwkwk',
      'kwkwwkwk',
      'kwkkkkwk',
      'kwwwwwwk',
      'kwwwwwwk',
      'kwwwwwwk',
      'kkkkkkkk',
      'k.k..k.k'
    ], { k: '#1a0e08', w: '#6a4228', W: '#8a5a34' });
  };

  /* ====================== EPÍLOGOS (vinhetas 224x112) ====================== */
  function sky(c, w, h, top, bot) { grad(c, 0, 0, w, h, top, bot); }
  C7.vFactory = function () {
    var W = 224, H = 112, cv = TC.canvas(W, H), c = cv.ctx;
    sky(c, W, 70, '#7aa0d8', '#f0d8b0');
    c.fillStyle = TC.col('#6a7a5a'); TC.fillPoly(c, [[0, 72], [60, 58], [140, 66], [224, 54], [224, 90], [0, 90]]);
    // galpão de tijolo com telhado em serra e a chaminé
    for (var y = 40; y < 96; y++) for (var x = 110; x < 220; x++) { c.fillStyle = TC.col(((x + (Math.floor(y / 4) % 2) * 4) % 8 === 0 || y % 4 === 0) ? '#6a3020' : '#a04a30'); c.fillRect(x, y, 1, 1); }
    for (var s = 0; s < 5; s++) { c.fillStyle = TC.col('#3a2a2a'); TC.fillPoly(c, [[110 + s * 22, 40], [110 + s * 22, 28], [132 + s * 22, 40]]); c.fillStyle = TC.col('#a8c0e0'); c.fillRect(111 + s * 22, 31, 2, 8); }
    c.fillStyle = TC.col('#8a3a26'); c.fillRect(200, 6, 10, 34);
    c.fillStyle = TC.col('#6a2a1a'); c.fillRect(198, 4, 14, 4);
    TC.font.draw(c, 'MORGENSTERN', 165, 48, '#f0e0b0', { align: 'center' });
    for (x = 120; x < 214; x += 14) { c.fillStyle = TC.col('#2a3a4a'); c.fillRect(x, 60, 8, 12); c.fillStyle = TC.col('#e8d090'); c.fillRect(x + 1, 61, 3, 4); }
    // o portão de ferro aberto e o pilar com a placa
    c.fillStyle = TC.col('#8a8696'); c.fillRect(58, 50, 12, 46); c.fillRect(100, 50, 10, 46);
    c.fillStyle = TC.col('#2a2a30'); for (x = 72; x < 98; x += 4) c.fillRect(x, 58, 1, 38);
    c.fillRect(70, 58, 28, 2); c.fillRect(70, 78, 28, 2);
    c.fillStyle = TC.col('#c89a40'); c.fillRect(60, 64, 8, 6);
    c.fillStyle = TC.col('#7a5418'); c.fillRect(60, 64, 8, 1);
    c.fillStyle = TC.col('#5a4a3a'); c.fillRect(0, 96, W, 16);
    c.fillStyle = TC.col('#7a6a5a'); c.fillRect(0, 96, W, 2);
    cv.plaqueX = 64; cv.plaqueY = 67;
    return cv;
  };
  C7.vCave = function () {
    var W = 224, H = 112, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(55);
    sky(c, W, 80, '#e8a070', '#f8e0a8');
    c.fillStyle = TC.col('#f8f0c0'); TC.fillCircle(c, 40, 30, 10);
    // o morro de pedra com a boca da caverna
    c.fillStyle = TC.col('#5a5048'); TC.fillPoly(c, [[90, 112], [120, 30], [170, 18], [224, 26], [224, 112]]);
    c.fillStyle = TC.col('#6a6058'); TC.fillPoly(c, [[100, 112], [124, 40], [150, 36], [140, 112]]);
    c.fillStyle = TC.col('#0a0606'); TC.fillPoly(c, [[150, 100], [156, 62], [176, 54], [196, 64], [200, 100]]);
    for (var k = 0; k < 4; k++) { var a = ART.araucaria(9000 + k, r.int(50, 70), { sil: '#1a2418', rim: '#3a5a30' }); c.drawImage(a, r.int(-10, 90) - a.baseX, 100 - a.height); }
    c.fillStyle = TC.col('#4a4030'); c.fillRect(0, 100, W, 12);
    c.fillStyle = TC.col('#6a5a40'); c.fillRect(0, 100, W, 2);
    // a placa velha arrancada, jogada no chão
    var sw = TC.font.measure('CAVERNA DOS BUGRES') + 8;
    var sg = TC.canvas(sw + 2, 14), sc = sg.ctx;
    sc.fillStyle = TC.col('#3a2a1a'); sc.fillRect(0, 0, sw + 2, 14);
    sc.fillStyle = TC.col('#6a4a2a'); sc.fillRect(1, 1, sw, 12);
    TC.font.draw(sc, 'CAVERNA DOS BUGRES', sw / 2 + 1, 3, '#2a1a0a', { align: 'center' });
    sc.fillStyle = TC.col('#e8e0d0'); TC.thickLine(sc, 2, 2, sw, 12, 1); TC.thickLine(sc, 2, 12, sw, 2, 1);
    var rot = TC.rotate(sg, -0.1);
    c.drawImage(rot, 64 - rot.width / 2, 100 - rot.height / 2);
    cv.fireX = 175; cv.fireY = 100;
    return cv;
  };
  C7.vLinha = function () {
    var W = 224, H = 112, cv = TC.canvas(W, H), c = cv.ctx;
    sky(c, W, 70, '#6aa0e0', '#d8ecf8');
    for (var k = 0; k < 3; k++) { c.fillStyle = TC.col('#f8f8ff'); TC.fillEllipse(c, 40 + k * 70, 18 + (k % 2) * 8, 16, 4); }
    c.fillStyle = TC.col('#5a8a4a'); TC.fillPoly(c, [[0, 60], [80, 50], [160, 58], [224, 48], [224, 112], [0, 112]]);
    // a escola de madeira
    c.fillStyle = TC.col('#c8b088'); c.fillRect(10, 52, 66, 40);
    c.fillStyle = TC.col('#8a2a20'); TC.fillPoly(c, [[4, 54], [43, 34], [82, 54]]);
    for (var x = 10; x < 76; x += 5) { c.fillStyle = TC.col('#a89068'); c.fillRect(x, 52, 1, 40); }
    c.fillStyle = TC.col('#3a5a8a'); c.fillRect(18, 62, 10, 10); c.fillRect(56, 62, 10, 10);
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(38, 70, 10, 22);
    TC.font.draw(c, 'ESCOLA', 43, 56, '#3a2010', { align: 'center' });
    // a venda
    c.fillStyle = TC.col('#e8d8c0'); c.fillRect(84, 58, 84, 34);
    c.fillStyle = TC.col('#5a5a6a'); TC.fillPoly(c, [[80, 60], [126, 44], [172, 60]]);
    c.fillStyle = TC.col('#4a2a18'); c.fillRect(120, 74, 12, 18);
    c.fillStyle = TC.col('#3a5a8a'); c.fillRect(92, 76, 10, 9); c.fillRect(150, 76, 10, 9);
    c.fillStyle = TC.col('#2a5a3a'); c.fillRect(86, 62, 80, 9);
    TC.font.draw(c, 'SECOS E MOLHADOS', 126, 63, '#f0e8c0', { align: 'center' });
    // a cancha de bolão (galpão comprido com os pinos lá no fundo)
    c.fillStyle = TC.col('#7a5a38'); c.fillRect(174, 64, 50, 28);
    c.fillStyle = TC.col('#4a3a2a'); TC.fillPoly(c, [[170, 66], [198, 56], [224, 64], [224, 66]]);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(178, 72, 46, 16);
    c.fillStyle = TC.col('#c8a070'); c.fillRect(178, 84, 46, 4);
    for (var p = 0; p < 3; p++) { c.fillStyle = TC.col('#f0e8d8'); c.fillRect(212 + p * 3, 77, 2, 7); }
    c.fillStyle = TC.col('#8a7a5a'); c.fillRect(0, 92, W, 20);
    c.fillStyle = TC.col('#a8946a'); c.fillRect(0, 92, W, 2);
    return cv;
  };
  C7.vFesta = function () {
    var W = 224, H = 112, cv = TC.canvas(W, H), c = cv.ctx;
    sky(c, W, 70, '#88b8f0', '#f0f0e0');
    var a = ART.araucaria(1998, 50, { sil: '#2a4a2a', rim: '#4a7a3a' });
    // o toco do Pinheiro Velho com a araucária nova plantada
    c.fillStyle = TC.col('#5a8a4a'); c.fillRect(0, 70, W, 42);
    var stump = TC.scaleCanvas(ART.ch2.stump({ bare: true }), 0.42);
    c.drawImage(stump, 112 - stump.width / 2, 96 - stump.height + 4);
    c.drawImage(a, 112 - a.baseX, 84 - a.height);
    // faixa e bandeirinhas
    var bw = TC.font.measure('3ª FESTA DA BATATA — 1998') + 12;
    c.fillStyle = TC.col('#e8dcc0'); c.fillRect(112 - bw / 2, 4, bw, 12);
    c.fillStyle = TC.col('#c03028'); c.fillRect(112 - bw / 2, 4, bw, 2); c.fillRect(112 - bw / 2, 14, bw, 2);
    TC.font.draw(c, '3ª FESTA DA BATATA — 1998', 112, 6, '#5a2a18', { align: 'center' });
    var cols = ['#d83030', '#f0c030', '#30a050', '#3070d8', '#f0f0f0', '#e060a0'];
    [[0, 70], [154, 224]].forEach(function (seg) {
      for (var x = seg[0]; x < seg[1]; x += 6) { var k = (x - seg[0]) / (seg[1] - seg[0]); c.fillStyle = TC.col(cols[(x / 6 | 0) % cols.length]); TC.fillPoly(c, [[x, 24 + Math.sin(k * Math.PI) * 7], [x + 4, 24 + Math.sin(k * Math.PI) * 7], [x + 2, 30 + Math.sin(k * Math.PI) * 7]]); }
    });
    cv.poleX = 112; cv.poleY = 84 - a.height + 6;
    return cv;
  };

  /* ====================== A CABINE: O PAI NO BANCO DO CARONA ====================== */
  C7.cabEwald = function (whistle) {
    var W = 96, H = 150, pb = new TC.PixBuf(W, H);
    var jk = u32('#6a4228'), jkD = u32('#4a2c18'), jkL = u32('#8a5a38');
    var sk = '#e0a880', skS = '#b07858', skD = '#7a4a34', skL = '#f0c098';
    // ombros e tronco (jaqueta de couro)
    ellipseFill(pb, 52, 150, 46, 62, function (x, y, dx) { return dx < -0.4 ? jkL : dx > 0.5 ? jkD : jk; });
    // gola da camisa
    ellipseFill(pb, 42, 92, 10, 6, function () { return u32('#d8c8a8'); });
    // pescoço
    pb.rect(36, 74, 14, 16, u32(skS));
    // rosto (três quartos, virado para o motorista)
    ellipseFill(pb, 42, 58, 17, 21, function (x, y, dx, dy) {
      var l = -dx * 0.5 - dy * 0.3;
      return u32(l > 0.35 ? skL : l > -0.25 ? sk : l > -0.6 ? skS : skD);
    });
    // orelha e cabelo branco
    ellipseFill(pb, 58, 60, 4, 6, function () { return u32(skS); });
    for (var y = 42; y < 66; y++) for (var x = 55; x < 64; x++) if (H2(x, y, 3) > 0.35 && !(x < 60 && y > 56)) pb.set(x, y, u32(H2(x, y, 4) > 0.5 ? '#e8e8ee' : '#c8c8d2'));
    // chapéu de feltro
    ellipseFill(pb, 44, 38, 20, 12, function (x, y, dx) { return u32(dx < -0.3 ? '#7a6448' : dx > 0.4 ? '#3a2c1c' : '#5a4630'); });
    ellipseFill(pb, 44, 46, 30, 5, function (x, y, dx, dy) { return u32(dy < 0 ? '#4a3a26' : '#2a2014'); });
    pb.rect(24, 43, 40, 2, u32('#2a1a10'));
    // olho, sobrancelha branca, nariz, bigode branco
    pb.rect(30, 54, 7, 2, u32('#e8e8ee')); pb.rect(31, 57, 5, 2, u32('#f0e8d8')); pb.rect(32, 57, 2, 2, u32('#3a5a3a'));
    pb.rect(44, 54, 6, 2, u32('#e8e8ee')); pb.rect(45, 57, 4, 2, u32('#f0e8d8')); pb.rect(45, 57, 2, 2, u32('#3a5a3a'));
    pb.rect(38, 58, 2, 8, u32(skS)); pb.rect(36, 66, 4, 1, u32(skD));
    for (x = 28; x <= 52; x++) { var dr = Math.abs(x - 40) > 7 ? 2 : 0; for (y = 68; y <= 70 + dr; y++) pb.set(x, y, u32(y === 68 ? '#ffffff' : '#e0e0e8')); }
    if (whistle) { ellipseFill(pb, 40, 74, 2.5, 2.5, function () { return u32('#5a2018'); }); }
    else { pb.rect(34, 73, 12, 1, u32(skD)); pb.set(33, 72, u32(skD)); pb.set(46, 72, u32(skD)); }
    // rugas
    pb.set(27, 58, u32(skD)); pb.set(26, 59, u32(skD)); pb.rect(30, 50, 8, 1, u32(skS));
    // costura do ombro e bolso da jaqueta
    thick(pb, 64, 96, 74, 130, 1, function () { return jkD; });
    pb.rect(70, 118, 12, 2, jkD);
    outline(pb, u32('#120a0e'));
    return pb.toCanvas();
  };

  /* ====================== PREPARO ====================== */
  ART.ch7Init = function () {
    if (C7.ready) return C7;
    var C2 = ART.ch2Init(), C3 = ART.ch3Init(), CAST = ART.castInit();
    // os capítulos 4 a 6 registram retratos próprios (a Hilde, a Lena de tranças): carrega se existirem
    ['ch4Init', 'ch5Init', 'ch6Init'].forEach(function (k) { try { if (ART[k]) ART[k](); } catch (e) { /* capítulo ainda incompleto */ } });
    C7.C2 = C2; C7.C3 = C3; C7.CAST = CAST;
    C7.fitaIcon = fitaIcons(1);
    C7.fitaBig = fitaIcons(2);
    C7.lasso = C7.lassoIcon();
    C7.arnoLasso = arnoLasso();
    C7.folk = FOLK.map(buildFolk);
    C7.erwin = buildErwin();
    C7.ewaldOld = buildEwaldOld();
    C7.ewaldYoung = { idle: C3.ewald.idle, walk: C3.ewald.walk, watch: C3.ewald.watch, dance: C3.ewald.dance };
    var ex = buildEwaldYoungExtra();
    C7.ewaldYoung.laugh = ex.laugh; C7.ewaldYoung.step = ex.step;
    C7.hedwigG = buildHedwigGhost(CAST);
    C7.hilde = buildHilde(CAST);
    C7.alte = bigDemon(C2);
    C7.hand = { down: handSprite(false), grab: handSprite(true) };
    C7.hand.up = (function () { var v = TC.flipV(C7.hand.down); v.ox = 12; v.oy = v.height - 4; return v; })();
    C7.x = C7.sigX();
    C7.T = C7.tiles();
    C7.pew = C7.pewEnd();
    C7.pigeons = C7.pigeon();
    C7.gears = [C7.gear(22, 12), C7.gear(14, 8), C7.gear(30, 16)];
    // a bandinha do Erwin, agora gente de verdade
    C7.bandReal = buildBand(C7.folk);
    var MINE = { erwin: { normal: erwinPortrait() }, ewaldOld: { normal: ewaldOldPortrait() } };
    var FALL = { hilde: { normal: hildePortrait(), free: hildePortrait() }, alte: { normal: altePortrait() } };
    var orig = ART.portrait;
    if (!orig._ch7) {
      ART.portrait = function (who, f) {
        if (MINE[who]) return MINE[who][f] || MINE[who].normal;
        var r = orig(who, f);
        if (r) return r;
        if (FALL[who]) return FALL[who][f] || FALL[who].normal;
        return null;
      };
      ART.portrait._ch7 = true;
    }
    C7.ready = true;
    return C7;
  };

  /* figura de cena: conjunto de poses (x = centro, y = pés) */
  C7.drawFig = function (c, set, pose, x, y, face, t, anim, alpha, tint, scale) {
    var arr = (set && (set[pose] || set.idle)) || null;
    if (!arr) return;
    if (!arr.length) arr = [arr];
    var fr;
    if (pose === 'walk' || pose === 'run' || pose === 'dance') fr = arr[Math.floor((anim || 0) / 7) % arr.length];
    else fr = arr[Math.floor((t || 0) / 28) % arr.length];
    if (!fr) return;
    if (tint) fr = TC.tintCached(fr, tint[0], tint[1]);
    var img = face < 0 ? TC.flip(fr) : fr;
    var ox = fr.ox != null ? (face < 0 ? fr.width - fr.ox : fr.ox) : fr.width / 2;
    var oy = fr.oy != null ? fr.oy : fr.height;
    c.globalAlpha = alpha == null ? 1 : Math.max(0, Math.min(1, alpha));
    if (scale && scale !== 1) c.drawImage(img, Math.round(x - ox * scale), Math.round(y - oy * scale + 1), Math.round(img.width * scale), Math.round(img.height * scale));
    else c.drawImage(img, Math.round(x - ox), Math.round(y - oy + 1));
    c.globalAlpha = 1;
  };

  TC.ui.addVoice('erwin', 420, '#e8c070');
  TC.ui.addVoice('ewaldOld', 380, '#e8d8c8');
  TC.ui.addVoice('kessler7', 380, '#c8b898');
  TC.ui.addVoice('ingrid7', 760, '#f0d070');
})();
