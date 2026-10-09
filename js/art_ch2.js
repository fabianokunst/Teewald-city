'use strict';
/* Teewald City — Capítulo 2: arte procedural (colonos possuídos, lobisomem, o Demônio Antigo, o revólver,
   fitas bentas, pavilhão da Festa da Batata, atafona, serraria, Fenemê, erval, carijó, toco do Pinheiro Velho) */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline, blit = ART._blit;
  var C2 = ART.ch2 = {};

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      toolA: o.toolA || 0, noTool: !!o.noTool, howl: !!o.howl
    };
  }
  /* deita a figura (rotação) e alinha pela base, como o Arno e o vulto */
  function lying(cv, w, h) {
    var rot = TC.rotate(cv, -Math.PI / 2);
    var pb = TC.bufFrom(rot), minY = pb.h, maxY = 0, minX = pb.w, maxX = 0;
    for (var y = 0; y < pb.h; y++) for (var x = 0; x < pb.w; x++) if (pb.d[y * pb.w + x] >>> 24) {
      minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    }
    var ww = maxX - minX + 1, hh = maxY - minY + 1;
    var out = TC.canvas(w, h);
    out.ctx.drawImage(rot, minX, minY, ww, hh, Math.round(w / 2 - ww / 2), h - 1 - hh, ww, hh);
    out.ox = Math.round(w / 2); out.oy = h - 1;
    return out;
  }
  function tile(fn) {
    var pb = new TC.PixBuf(16, 16);
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var c = fn(x, y);
      if (c) pb.d[y * 16 + x] = u32(c);
    }
    return pb.toCanvas();
  }
  var H2 = TC.hash2;

  /* ====================== COLONOS POSSUÍDOS ====================== */
  function toolDrawer(kind) {
    var wood = solid('#7a5a38'), woodD = solid('#5a3e26'), iron = solid('#9a9aa6'), ironD = solid('#5a5a66');
    return function (pb, info, pose) {
      if (pose.noTool || !info.hand) return;
      var a = pose.armF[0] + pose.armF[1] + pose.toolA;
      var dx = Math.sin(a), dy = Math.cos(a);
      var hx = info.hand.x, hy = info.hand.y;
      var x0 = hx - dx * 6, y0 = hy - dy * 6, x1 = hx + dx * 17, y1 = hy + dy * 17;
      thick(pb, x0, y0, x1, y1, 1.6, kind === 'axe' ? woodD : wood);
      var px = -Math.cos(a), py = Math.sin(a);   // perpendicular: o lado "de baixo" do golpe
      if (kind === 'hoe') {
        poly(pb, [[x1 - dx, y1 - dy], [x1 + dx * 1.5, y1 + dy * 1.5], [x1 + dx * 2.5 + px * 6, y1 + dy * 2.5 + py * 6], [x1 - dx * 2.5 + px * 6, y1 - dy * 2.5 + py * 6]], iron);
        thick(pb, x1 - dx * 2 + px * 6, y1 - dy * 2 + py * 6, x1 + dx * 2 + px * 6, y1 + dy * 2 + py * 6, 1, ironD);
      } else if (kind === 'fork') {
        thick(pb, x1 - px * 3, y1 - py * 3, x1 + px * 3, y1 + py * 3, 1.4, iron);
        for (var k = -1; k <= 1; k++) thick(pb, x1 + px * 3 * k, y1 + py * 3 * k, x1 + px * 3 * k + dx * 7, y1 + py * 3 * k + dy * 7, 1, iron);
      } else if (kind === 'axe') {
        poly(pb, [[x1 - dx * 4, y1 - dy * 4], [x1, y1], [x1 + dx * 2 + px * 7, y1 + dy * 2 + py * 7], [x1 - dx * 6 + px * 7, y1 - dy * 6 + py * 7]], iron);
        thick(pb, x1 + dx * 2 + px * 7, y1 + dy * 2 + py * 7, x1 - dx * 6 + px * 7, y1 - dy * 6 + py * 7, 1, solid('#d8d8e0'));
      }
    };
  }
  function suspenders(col) {
    var c = solid(col);
    return function (pb, info) {
      thick(pb, info.sx - 2, info.sy + 1, info.hx - 2, info.hy - 1, 1, c);
      thick(pb, info.sx + 2, info.sy + 1, info.hx + 2, info.hy - 1, 1, c);
    };
  }
  var HEADS = {
    colono: TC.sprite([
      '...kkkk...',
      '..kHHHHk..',
      '..kHhHHk..',
      '.BBBBBBBB.',
      '..gsssss..',
      '..gssEss..',
      '..ssssss..',
      '..sSmmms..',
      '...SSSS...'
    ], { k: '#1a1410', H: '#4a3a28', h: '#6a5440', B: '#2a2018', g: '#6a6458', s: '#c4baa6', S: '#948a7a', E: '#e8ff70', m: '#2a1a14' }),
    colona: TC.sprite([
      '...kkkk...',
      '..kLLLLk..',
      '.kLLlLLLk.',
      '.LLLLLLLL.',
      'LLLsssss..',
      'L.LssEss..',
      '..ssssss..',
      '..sSmmss..',
      '...SSSS...'
    ], { k: '#2a1010', L: '#8a3434', l: '#c06050', s: '#c8bca8', S: '#988c7c', E: '#e8ff70', m: '#3a1a18' }),
    kessler: TC.sprite([
      '...kkkk...',
      '..kHHHHk..',
      '..kHhHHk..',
      '.BBBBBBBB.',
      '..wsssss..',
      '..wssEss..',
      '..wwssss..',
      '..wwwwww..',
      '...wwww...'
    ], { k: '#1a1410', H: '#5a4a38', h: '#7a6450', B: '#3a2a1c', w: '#d8d6cc', s: '#c8b8a0', E: '#e8ff70' }),
    kesslerFree: TC.sprite([
      '...kkkk...',
      '..kHHHHk..',
      '..kHhHHk..',
      '.BBBBBBBB.',
      '..wsssss..',
      '..wssKss..',
      '..wwssss..',
      '..wwwwww..',
      '...wwww...'
    ], { k: '#1a1410', H: '#5a4a38', h: '#7a6450', B: '#3a2a1c', w: '#d8d6cc', s: '#e0b890', K: '#2a1a10' })
  };
  function figSpec(kind) {
    var base = {
      W: 60, H: 60, ox: 28, groundY: 57,
      thigh: 7, shin: 7, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 7, shW: 9,
      upper: 6, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      headOff: { x: -4, y: -9 }
    };
    var skin = solid('#c4baa6'), skinB = solid('#8a8070');
    if (kind === 'colono') {
      base.head = HEADS.colono;
      base.col = {
        pants: solid('#5a4a38'), pantsB: solid('#3a3024'), boot: solid('#2a1e16'), bootB: solid('#1a120c'),
        shirt: (function () { var a = u32('#c8c0a8'), b = u32('#a8a088'); return function (x, y) { return (x + y * 2) % 9 === 0 ? b : a; }; })(),
        sleeve: solid('#c0b8a0'), sleeveB: solid('#8a8270'), skin: skin, skinB: skinB, outline: '#0e0a0c'
      };
      var sus = suspenders('#3a2418'), hoe = toolDrawer('hoe');
      base.after = function (pb, info, pose) { sus(pb, info); hoe(pb, info, pose); };
    } else if (kind === 'colona') {
      base.head = HEADS.colona;
      base.col = {
        pants: solid('#1e1e2a'), pantsB: solid('#14141c'), boot: solid('#2a1e16'), bootB: solid('#1a120c'),
        shirt: solid('#2e3e6a'), sleeve: solid('#2e3e6a'), sleeveB: solid('#1e2a4a'), skin: skin, skinB: skinB, outline: '#0e0a0c'
      };
      var fork = toolDrawer('fork');
      var dress = solid('#2e3e6a'), dressD = solid('#1e2a4a'), apron = solid('#d8d0bc');
      base.after = function (pb, info, pose) {
        var hx = info.hx, hy = info.hy;
        poly(pb, [[hx - 5, hy - 3], [hx + 5, hy - 3], [hx + 9, hy + 11], [hx - 9, hy + 11]], function (x) { return (x & 3) === 0 ? dressD : dress; });
        poly(pb, [[hx, hy - 2], [hx + 5, hy - 2], [hx + 5, hy + 6], [hx, hy + 6]], apron);
        fork(pb, info, pose);
      };
    } else {
      base.head = function (pose) { return pose.hurtFace === 'free' ? HEADS.kesslerFree : HEADS.kessler; };
      base.col = {
        pants: solid('#3a3a44'), pantsB: solid('#26262e'), boot: solid('#2a1e16'), bootB: solid('#1a120c'),
        shirt: (function () { var a = u32('#7a7a70'), b = u32('#5a5a52'); return function (x, y) { return (x & 3) === 0 || (y & 3) === 0 ? b : a; }; })(),
        sleeve: solid('#7a7a70'), sleeveB: solid('#4a4a44'), skin: skin, skinB: skinB, outline: '#0e0a0c'
      };
      var sus2 = suspenders('#2a1a10'), axe = toolDrawer('axe'), leather = solid('#6a4428');
      base.after = function (pb, info, pose) {
        sus2(pb, info);
        poly(pb, [[info.hx - 4, info.hy - 6], [info.hx + 4, info.hy - 6], [info.hx + 5, info.hy + 6], [info.hx - 5, info.hy + 6]], leather);
        axe(pb, info, pose);
      };
    }
    return base;
  }
  function buildColono(kind) {
    var S = figSpec(kind);
    var R = ART.renderFigure;
    var out = {};
    out.idle = [P({ lean: 0.12, armF: [0.45, 0.6], armB: [0.15, 0.5], toolA: 1.5 }), P({ lean: 0.14, breath: 1, armF: [0.5, 0.6], armB: [0.2, 0.5], toolA: 1.45 })].map(function (p) { return R(p, S); });
    out.walk = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.walk.push(R(P({
        lean: 0.16 + Math.sin(q * 2) * 0.03,
        legF: [0.42 * Math.sin(q), -(0.1 + 0.7 * Math.max(0, Math.cos(q)))],
        legB: [0.42 * Math.sin(q + Math.PI), -(0.1 + 0.7 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [0.45 - 0.15 * Math.sin(q), 0.6], armB: [0.2 + 0.3 * Math.sin(q), 0.5], toolA: 1.5
      }), S));
    }
    out.windup = [R(P({ lean: -0.22, legF: [0.35, -0.15], legB: [-0.35, -0.1], armF: [2.75, 0.25], armB: [2.5, 0.35], toolA: 0.15 }), S)];
    out.swing = [R(P({ lean: 0.42, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [1.35, 0.0], armB: [1.15, 0.1], toolA: -0.15, hipX: 1 }), S)];
    out.hurt = [R(P({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], hurtFace: true, toolA: 1.2 }), S)];
    out.kneel = [R(P({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.6, 0.5], armB: [0.3, 0.6], noTool: true, hurtFace: 'free' }), S)];
    out.stand = [R(P({ lean: 0.08, armF: [0.2, 0.3], armB: [-0.1, 0.3], noTool: true, hurtFace: 'free' }), S)];
    out.lie = [lying(R(P({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], noTool: true, hurtFace: true }), S), 60, 56)];
    return out;
  }

  /* ====================== LOBISOMEM ====================== */
  var WOLF_HEAD = TC.sprite([
    '.kk...........',
    'kEek..........',
    'kEEkkkk.......',
    '.kfFFFFk......',
    'kfFFFrFFkk....',
    'kfffffFFFFFkk.',
    'kffffffffffNk.',
    '.kfffmmmmmmk..',
    '..kffwkwkwk...',
    '...kfffffk....',
    '....kkkkk.....'
  ], { k: '#120c0a', E: '#5a4a3a', e: '#8a5a4a', f: '#3e342c', F: '#5e5044', r: '#ff3020', N: '#0a0606', m: '#1a0808', w: '#e8e0c8' });
  var WOLF_HOWL = TC.sprite([
    '..........kk..',
    '.........kNk..',
    '........kffk..',
    '.kk....kfffmk.',
    'kEek..kfFfmwk.',
    'kEEkkkfFFfmk..',
    '.kfFFFFrFFk...',
    'kfFFFFFFFk....',
    'kffffffffk....',
    '.kfffffk......',
    '..kkkkk.......'
  ], { k: '#120c0a', E: '#5a4a3a', e: '#8a5a4a', f: '#3e342c', F: '#5e5044', r: '#ff3020', N: '#0a0606', m: '#1a0808', w: '#e8e0c8' });
  function buildWolf() {
    var fur = (function () {
      var a = u32('#3e342c'), d = u32('#2a221c'), l = u32('#5e5044');
      return function (x, y) { return (x * 2 + y) % 7 === 0 ? l : (x + y * 3) % 11 === 0 ? d : a; };
    })();
    var furB = solid('#261e18');
    var S = {
      W: 72, H: 56, ox: 32, groundY: 53,
      thigh: 8, shin: 8, legT: 4.8, footH: 2, footL: 4, shinThin: 1.4,
      torso: 14, hipW: 9, shW: 12,
      upper: 7, fore: 8, armT: 3.8, foreThin: 0.8, claw: 4,
      head: function (pose) { return pose.howl ? WOLF_HOWL : WOLF_HEAD; }, headOff: { x: -3, y: -8 },
      col: { pants: fur, pantsB: furB, boot: fur, bootB: furB, shirt: fur, sleeve: fur, sleeveB: furB, skin: fur, skinB: furB, claw: solid('#d8d0b8'), clawB: solid('#8a8070'), outline: '#08060a' },
      after: function (pb, info, pose) {
        var wag = pose.tail || 0;
        thick(pb, info.hx - 2, info.hy - 1, info.hx - 9, info.hy - 4 + wag, 4, fur);
        thick(pb, info.hx - 9, info.hy - 4 + wag, info.hx - 15, info.hy - 3 + wag * 1.5, 2.6, fur);
      }
    };
    var R = ART.renderFigure;
    function W(o) { var p = P(o); p.tail = o.tail || 0; return R(p, S); }
    var out = {};
    out.idle = [W({ lean: 0.6, legF: [0.7, -1.5], legB: [0.1, -1.2], armF: [0.55, 0.35], armB: [0.3, 0.4] }), W({ lean: 0.62, breath: 1, legF: [0.7, -1.5], legB: [0.1, -1.2], armF: [0.6, 0.35], armB: [0.35, 0.4], tail: 1 })];
    out.run = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.run.push(W({
        lean: 1.0,
        legF: [0.6 + 0.6 * Math.sin(q), -(0.9 + 0.8 * Math.max(0, Math.cos(q)))],
        legB: [0.6 + 0.6 * Math.sin(q + Math.PI), -(0.9 + 0.8 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [0.9 - 0.7 * Math.sin(q), 0.3], armB: [0.9 + 0.7 * Math.sin(q), 0.3], tail: Math.round(Math.sin(q) * 2)
      }));
    }
    out.crouch = [W({ lean: 1.15, legF: [1.25, -2.1], legB: [0.7, -2.1], armF: [0.9, 0.4], armB: [0.6, 0.5], dy: 2, tail: -1 })];
    out.leap = [W({ lean: 1.35, legF: [-0.5, -0.4], legB: [-0.8, -0.3], armF: [2.1, -0.4], armB: [1.9, -0.3], tail: 3 })];
    out.slash = [W({ lean: 0.8, legF: [0.6, -0.6], legB: [-0.4, -0.3], armF: [1.75, -0.5], armB: [0.4, 0.6], tail: 2 })];
    out.hurt = [W({ lean: 0.1, legF: [0.4, -0.6], legB: [-0.2, -0.5], armF: [0.9, 0.9], armB: [-0.3, 1.0], tail: -2 })];
    out.howl = [W({ lean: -0.05, legF: [0.4, -0.5], legB: [-0.2, -0.4], armF: [0.6, 0.6], armB: [0.2, 0.6], howl: true, tail: 1 })];
    out.lie = [lying(W({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2] }), 64, 56)];
    return out;
  }

  /* ====================== O DEMÔNIO ANTIGO (der Alte, o Mão-Comprida) ======================
     Corpo pálido e magro que anda de quatro, com braços e pernas compridos demais (cotovelos acima do corpo,
     como uma aranha), cabeça pendurada entre os braços e cabelo preto escorrido. */
  var DEMON_HEAD = TC.sprite([
    '....hhhhhh......',
    '..hhHHHHHHhh....',
    '.hHHssssssHHh...',
    'hHHssssssssLsk..',
    'hHsssssssssLssk.',
    'hHssskkkssssssk.',
    'hHsskEEksssssk..',
    '.HssskkksssssSk.',
    '.Hsssssssssk.Sk.',
    '.HSsssssssssssk.',
    '.HHSSsssmmmmmmk.',
    '..HHkSStwtwtwtk.',
    '..H.kSSmmmmmmk..',
    '..H..kSSSSSSk...',
    '..H...kkkkkk....',
    '.H..............',
    '.H..............',
    'H...............'
  ], { h: '#0c080c', H: '#1a1418', s: '#d8ccb8', L: '#f0e8d8', S: '#9a8e7e', k: '#1a1214', E: '#d0f4ff', m: '#160606', t: '#e8e0c8', w: '#1a0a0a' });
  var DEMON_SCREAM = TC.sprite([
    '....hhhhhh......',
    '..hhHHHHHHhh....',
    '.hHHssssssHHh...',
    'hHHssssssssLsk..',
    'hHsskkksssssLsk.',
    'hHskEEEksssssssk',
    'hHsskkksssssssk.',
    '.Hsssssssssk.Sk.',
    '.HSsssssmmmmmmk.',
    '.HHSssmmtwtwtwk.',
    '..HHSmmmmmmmmmk.',
    '..H.Smmmmmmmmmk.',
    '..H.kSmtwtwtwmk.',
    '..H..kSSSSSSSk..',
    '..H...kkkkkkk...',
    '.H..............',
    'H...............',
    'H...............'
  ], { h: '#0c080c', H: '#1a1418', s: '#d8ccb8', L: '#f0e8d8', S: '#9a8e7e', k: '#1a1214', E: '#ffffff', m: '#2a0606', t: '#e8e0c8', w: '#1a0a0a' });

  // dois segmentos com o "cotovelo" para cima (sinal de bend escolhe o lado)
  function ik(ax, ay, tx, ty, l1, l2, bend) {
    var dx = tx - ax, dy = ty - ay;
    var d = Math.sqrt(dx * dx + dy * dy);
    var dmax = l1 + l2 - 0.5;
    if (d > dmax) { tx = ax + dx / d * dmax; ty = ay + dy / d * dmax; dx = tx - ax; dy = ty - ay; d = dmax; }
    d = Math.max(d, Math.abs(l1 - l2) + 0.5);
    var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    var mx = ax + dx * a / d, my = ay + dy * a / d;
    var jx = mx + bend * (-dy) * h / d, jy = my + bend * dx * h / d;
    return { jx: jx, jy: jy, tx: tx, ty: ty };
  }
  var DCOL = {
    skin: u32('#d4c8b4'), shade: u32('#a89c88'), dark: u32('#74685a'), hi: u32('#ece4d4'),
    rib: u32('#8a7e6e'), back: u32('#8a7e70'), backD: u32('#5e5448'), claw: u32('#2a2024'), out: u32('#120a0e')
  };
  function demonFrame(p) {
    var W = 140, H = 104;
    var pb = new TC.PixBuf(W, H);
    function limb(ax, ay, tx, ty, l1, l2, t1, t2, back, bend, toes) {
      var k = ik(ax, ay, tx, ty, l1, l2, bend);
      var col = back ? function () { return DCOL.back; } : function (x, y) { return ((x + y) % 9 === 0) ? DCOL.shade : DCOL.skin; };
      thick(pb, ax, ay, k.jx, k.jy, t1, col);
      thick(pb, k.jx, k.jy, k.tx, k.ty, t2, col);
      // junta ossuda
      thick(pb, k.jx, k.jy, k.jx, k.jy - 0.5, t1 + 1.2, back ? function () { return DCOL.backD; } : function () { return DCOL.hi; });
      // dedos compridos
      var fa = Math.atan2(k.tx - k.jx, k.ty - k.jy);
      for (var q = -1; q <= 1; q++) {
        var ca = fa + q * 0.45 + (toes || 0);
        thick(pb, k.tx, k.ty, k.tx + Math.sin(ca) * 6, k.ty + Math.cos(ca) * 5, 1, back ? function () { return DCOL.backD; } : function () { return DCOL.dark; });
      }
      return k;
    }
    var hx = p.hip[0], hy = p.hip[1], sx = p.sh[0], sy = p.sh[1];
    // membros de trás (mais escuros)
    limb(sx - 3, sy + 1, p.handB[0], p.handB[1], p.upper || 24, p.fore || 50, 3.2, 2.6, true, p.bendA || -1);
    limb(hx - 2, hy + 1, p.footB[0], p.footB[1], p.thigh || 26, p.shin || 40, 3.6, 2.8, true, p.bendL || -1);
    // tronco: curva com corcunda, costelas e vértebras
    var n = 24, arch = p.arch || 0;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var x = hx + (sx - hx) * t, y = hy + (sy - hy) * t - Math.sin(t * Math.PI) * arch;
      var th = 7 + Math.sin(t * Math.PI * 0.9) * 4 + t * 2;
      pts.push([x, y, th]);
      thick(pb, x, y, x, y, th, function (xx, yy) { return yy > y + th * 0.18 ? DCOL.shade : DCOL.skin; });
    }
    var dirx = sx - hx, diry = sy - hy, L = Math.sqrt(dirx * dirx + diry * diry) || 1;
    var nx = -diry / L, ny = dirx / L;   // normal (para "cima" quando o corpo olha para a direita)
    if (ny > 0) { nx = -nx; ny = -ny; }
    for (i = 10; i <= 21; i += 2) {
      var pp = pts[i];
      var r = pp[2] * 0.42;
      thick(pb, pp[0] - nx * r * 0.2, pp[1] - ny * r * 0.2, pp[0] - nx * r + dirx / L * 1.5, pp[1] - ny * r + diry / L * 1.5, 1, function () { return DCOL.rib; });
    }
    for (i = 2; i <= 22; i += 3) {
      var sp = pts[i];
      pb.set(Math.round(sp[0] + nx * sp[2] * 0.42), Math.round(sp[1] + ny * sp[2] * 0.42), DCOL.hi);
    }
    // perna e braço da frente
    limb(hx + 1, hy, p.footF[0], p.footF[1], p.thigh || 26, p.shin || 40, 4, 3, false, p.bendL || -1);
    var head = p.scream ? DEMON_SCREAM : DEMON_HEAD;
    var hdx = Math.round(sx + (p.head ? p.head[0] : 4)), hdy = Math.round(sy + (p.head ? p.head[1] : 4));
    blit(pb, head, hdx - 4, hdy - 2);
    limb(sx + 2, sy + 1, p.handF[0], p.handF[1], p.upper || 24, p.fore || 50, 3.8, 3, false, p.bendA || -1);
    outline(pb, DCOL.out);
    var cv = pb.toCanvas();
    cv.ox = 70; cv.oy = 100;
    return cv;
  }
  function buildDemon() {
    var G = 100, out = {};
    // de quatro, andando (pares diagonais alternados)
    out.crawl = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      var s1 = Math.sin(q), s2 = Math.sin(q + Math.PI);
      var l1 = Math.max(0, Math.cos(q)) * 7, l2 = Math.max(0, Math.cos(q + Math.PI)) * 7;
      out.crawl.push(demonFrame({
        hip: [48, 56 + Math.round(Math.sin(q * 2) * 1.5)], sh: [90, 54 + Math.round(Math.sin(q * 2 + 1) * 1.5)], arch: 9,
        handF: [118 + s1 * 10, G - l1], handB: [104 + s2 * 10, G - l2],
        footF: [36 + s2 * 9, G - l2], footB: [22 + s1 * 9, G - l1],
        head: [6, 6 + Math.round(Math.sin(q) * 1)]
      }));
    }
    out.idle = [0, 1].map(function (k) {
      return demonFrame({ hip: [48, 57 + k], sh: [90, 55 + k], arch: 10, handF: [118, G], handB: [104, G], footF: [36, G], footB: [22, G], head: [6, 7 + k] });
    });
    out.charge = [];
    for (i = 0; i < 4; i++) {
      var c = i / 4 * TC.TAU;
      out.charge.push(demonFrame({
        hip: [40, 62 + Math.round(Math.sin(c) * 2)], sh: [88, 64 + Math.round(Math.cos(c) * 2)], arch: 6,
        handF: [124 + Math.sin(c) * 12, G - Math.max(0, Math.cos(c)) * 9], handB: [110 + Math.sin(c + 2) * 12, G - Math.max(0, Math.cos(c + 2)) * 9],
        footF: [30 + Math.sin(c + Math.PI) * 12, G - Math.max(0, Math.cos(c + Math.PI)) * 9], footB: [16 + Math.sin(c + 1) * 12, G - Math.max(0, Math.cos(c + 1)) * 9],
        head: [12, 4], scream: true
      }));
    }
    out.crouch = [demonFrame({ hip: [46, 74], sh: [88, 70], arch: 12, handF: [112, G], handB: [100, G], footF: [44, G], footB: [32, G], head: [6, 6], upper: 22 })];
    out.leap = [demonFrame({ hip: [40, 44], sh: [88, 38], arch: 4, handF: [132, 40], handB: [124, 50], footF: [6, 70], footB: [14, 78], head: [10, 0], scream: true, bendL: 1 })];
    out.land = [demonFrame({ hip: [44, 78], sh: [90, 76], arch: 8, handF: [134, G], handB: [120, G], footF: [10, G], footB: [22, G], head: [6, 6] })];
    out.rear = [demonFrame({ hip: [62, 66], sh: [70, 28], arch: -2, handF: [104, 4], handB: [86, 2], footF: [78, G], footB: [52, G], head: [6, -2], bendA: 1, upper: 24, fore: 46 })];
    out.swipe = [
      demonFrame({ hip: [60, 64], sh: [74, 30], arch: -2, handF: [128, 34], handB: [90, 6], footF: [80, G], footB: [52, G], head: [8, 0], bendA: 1, scream: true }),
      demonFrame({ hip: [58, 66], sh: [78, 36], arch: 0, handF: [134, 92], handB: [104, 60], footF: [80, G], footB: [50, G], head: [10, 4], bendA: -1, scream: true })
    ];
    out.scream = [demonFrame({ hip: [56, 62], sh: [80, 36], arch: 2, handF: [128, 28], handB: [30, 26], footF: [74, G], footB: [44, G], head: [6, -6], scream: true, bendA: 1 })];
    out.dizzy = [0, 1].map(function (k) {
      return demonFrame({ hip: [54, 86], sh: [78, 62 + k], arch: 2, handF: [100, G], handB: [92, G], footF: [84, G], footB: [36, G], head: [8 + k, 12], bendL: 1 });
    });
    out.hurt = [demonFrame({ hip: [44, 60], sh: [84, 50], arch: 14, handF: [108, G], handB: [96, G], footF: [34, G], footB: [20, G], head: [2, 10], scream: true })];
    out.dead = [demonFrame({ hip: [40, 90], sh: [92, 90], arch: 2, handF: [134, G], handB: [118, G], footF: [8, G], footB: [20, G], head: [6, 6] })];
    return out;
  }

  /* ====================== O REVÓLVER, AS BALAS E AS FITAS BENTAS ====================== */
  var GUN = TC.sprite([
    'kkkkkkkkk.',
    'kGgggggggk',
    'kgCCgkkkk.',
    'kgCCk.....',
    '.kbbk.....',
    '.kbk......',
    '.kkk......'
  ], { k: '#0c0c10', G: '#9a9aa8', g: '#5a5a66', C: '#3a3a44', b: '#6a3a20' });
  var GUN_UP = TC.sprite([
    '.......kk.',
    '.....kkgk.',
    '...kkggk..',
    '.kkgggk...',
    'kgCCgk....',
    'kgCCk.....',
    '.kbbk.....',
    '.kbk......',
    '.kkk......'
  ], { k: '#0c0c10', g: '#6a6a76', C: '#3a3a44', b: '#6a3a20' });
  function buildArnoGun() {
    var A = ART.arno;
    function withGun(src, gun, dx, dy) {
      var cv = TC.canvas(src.width, src.height);
      cv.ctx.drawImage(src, 0, 0);
      cv.ctx.drawImage(gun, Math.round(src.handX + dx), Math.round(src.handY + dy));
      cv.ox = src.ox; cv.oy = src.oy;
      cv.muzzleX = Math.round(src.handX + dx + gun.width); cv.muzzleY = Math.round(src.handY + dy + 1);
      return cv;
    }
    var aim = withGun(A.punch1[1], GUN, -2, -3);
    var kick = withGun(A.punch1[2], GUN_UP, -2, -6);
    var air = withGun(A.punch1[1], GUN, -2, -3);
    return { aim: aim, kick: kick, air: air };
  }

  var RIBBON_COLS = ['#d83030', '#f0c030', '#30a050', '#3070d8', '#f0f0f0', '#9040c0', '#f07820'];
  C2.RIBBON_COLS = RIBBON_COLS;
  function ribbonSprite(col, f) {
    var d = TC.shade(col, 0.65), l = TC.mix(col, '#ffffff', 0.45);
    var rows = f === 0 ? [
      '..kk.kk...',
      '.kcLkcLk..',
      '.kcckcck..',
      '..kkkkk...',
      '...kck....',
      '...kcdk...',
      '....kcdk..',
      '....kcdk..',
      '...kcdk...',
      '..kcdk....',
      '..kcdk....',
      '...kcdk...',
      '....kk....'
    ] : [
      '..kk.kk...',
      '.kcLkcLk..',
      '.kcckcck..',
      '..kkkkk...',
      '...kck....',
      '..kcdk....',
      '..kcdk....',
      '...kcdk...',
      '....kcdk..',
      '....kcdk..',
      '...kcdk...',
      '..kcdk....',
      '...kk.....'
    ];
    return TC.sprite(rows, { k: '#1a1010', c: col, d: d, L: l });
  }

  /* ====================== RETRATOS ====================== */
  function portraitBG(pb, top, bot) {
    for (var y = 0; y < 40; y++) for (var x = 0; x < 40; x++) pb.d[y * 40 + x] = u32(TC.mix(top, bot, y / 39));
  }
  function ellipseFill(pb, cx, cy, rx, ry, fn) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) { var c = fn(x, y, dx, dy); if (c) pb.set(x, y, c); }
    }
  }
  function kesslerPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a2014', '#060403');
    var skin = '#d8a880', skinS = '#a87050', skinD = '#704028', skinL = '#f0c8a0';
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32(((x & 3) === 0 || (y & 3) === 0) ? '#5a5a52' : '#7a7a70'); });
    pb.rect(12, 33, 2, 7, u32('#2a1a10')); pb.rect(26, 33, 2, 7, u32('#2a1a10'));
    pb.rect(16, 27, 8, 6, u32(skinS));
    ellipseFill(pb, 20, 21, 10, 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? skinL : l > -0.25 ? skin : l > -0.6 ? skinS : skinD);
    });
    // barba branca
    ellipseFill(pb, 20, 28, 9, 7, function (x, y, dx, dy) { return dy < -0.45 && Math.abs(dx) < 0.45 ? 0 : u32(H2(x, y, 7) > 0.7 ? '#b8b8b0' : '#e0e0d8'); });
    pb.rect(17, 27, 7, 1, u32('#5a3a2a'));
    // chapéu de feltro
    ellipseFill(pb, 20, 11, 10, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#7a6450' : dx > 0.4 ? '#3a2e22' : '#5a4a38'); });
    ellipseFill(pb, 20, 15, 15, 2.6, function (x, y, dx, dy) { return u32(dy < 0 ? '#4a3a2a' : '#2a2018'); });
    pb.rect(11, 13, 18, 1, u32('#2a1a10'));
    // sobrancelhas grossas e olhos cansados
    pb.rect(13, 18, 5, 2, u32('#d0d0c8')); pb.rect(23, 18, 5, 2, u32('#d0d0c8'));
    pb.rect(14, 21, 4, 1, u32('#4a2a18')); pb.rect(23, 21, 4, 1, u32('#4a2a18'));
    pb.set(16, 22, u32('#2a1a10')); pb.set(24, 22, u32('#2a1a10'));
    pb.rect(14, 23, 4, 1, u32(skinS)); pb.rect(23, 23, 4, 1, u32(skinS));
    pb.rect(20, 21, 1, 4, u32(skinS)); pb.rect(19, 25, 3, 1, u32(skinD));
    // serragem no ombro
    for (var i = 0; i < 9; i++) pb.set(6 + i * 3, 36 + (i % 2), u32('#e8d098'));
    return pb.toCanvas();
  }
  function demonPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a0608', '#000000');
    ellipseFill(pb, 20, 21, 11, 15, function (x, y, dx, dy) {
      var l = -dx * 0.5 - dy * 0.3;
      return u32(l > 0.3 ? '#ece4d4' : l > -0.3 ? '#d4c8b4' : '#9a8e7e');
    });
    // órbitas fundas com brilho branco
    [[14, 17], [25, 17]].forEach(function (e) {
      ellipseFill(pb, e[0] + 0.5, e[1] + 0.5, 3.2, 3.6, function () { return u32('#140c0e'); });
      pb.set(e[0], e[1], u32('#d0f4ff')); pb.set(e[0] + 1, e[1], u32('#ffffff'));
    });
    pb.rect(19, 22, 2, 4, u32('#5a4e44'));
    // boca rasgada
    pb.rect(13, 29, 15, 4, u32('#160606'));
    for (var x = 13; x < 28; x += 2) { pb.set(x, 29, u32('#e8e0c8')); pb.set(x + 1, 32, u32('#e8e0c8')); }
    // cabelo preto escorrido
    for (x = 6; x < 35; x++) {
      var len = 6 + Math.round(H2(x, 1, 5) * 30);
      if (x > 12 && x < 28) len = 3 + Math.round(H2(x, 2, 5) * 4);
      for (var y = 4; y < 4 + len && y < 40; y++) pb.set(x, y, u32(H2(x, y, 6) > 0.8 ? '#2a2228' : '#0c080c'));
    }
    return pb.toCanvas();
  }
  function ribbonPortrait(i) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a1e28', '#0a060a');
    var col = RIBBON_COLS[i % 7], d = TC.shade(col, 0.6), l = TC.mix(col, '#ffffff', 0.4);
    // fita ondulando na diagonal, com bordado em ponto de cruz
    for (var t = 0; t < 1; t += 0.01) {
      var x = 4 + t * 32, y = 32 - t * 24 + Math.sin(t * 9) * 3;
      for (var w = -3; w <= 3; w++) pb.set(Math.round(x), Math.round(y + w), u32(w === -3 ? l : w === 3 ? d : col));
    }
    for (var k = 0; k < 7; k++) {
      var cx = Math.round(7 + k * 4.4), cy = Math.round(32 - (k * 4.4 + 3) * 0.75 + Math.sin((k * 4.4 + 3) / 32 * 9) * 3);
      pb.set(cx, cy, u32('#ffffff')); pb.set(cx - 1, cy - 1, u32('#ffffff')); pb.set(cx + 1, cy + 1, u32('#ffffff'));
      pb.set(cx + 1, cy - 1, u32('#ffffff')); pb.set(cx - 1, cy + 1, u32('#ffffff'));
    }
    return pb.toCanvas();
  }

  /* ====================== AMBIENTE ====================== */
  function sign(w, h, lines, opt) {
    opt = opt || {};
    var cv = TC.canvas(w, h + (opt.legs || 0)), c = cv.ctx;
    if (opt.legs) {
      c.fillStyle = TC.col('#3a2a20');
      c.fillRect(6, h - 2, 3, opt.legs + 2); c.fillRect(w - 9, h - 2, 3, opt.legs + 2);
    }
    c.fillStyle = TC.col(opt.border || '#1a1410'); c.fillRect(0, 0, w, h);
    c.fillStyle = TC.col(opt.bg || '#5a3a20'); c.fillRect(1, 1, w - 2, h - 2);
    c.fillStyle = TC.col(opt.trim || '#8a6040'); c.fillRect(2, 2, w - 4, 1); c.fillRect(2, h - 3, w - 4, 1);
    var y = Math.round((h - lines.length * 9) / 2) + 1;
    lines.forEach(function (ln, i) { TC.font.draw(c, ln[0], w / 2, y + i * 9, ln[1] || '#f0e0b0', { align: 'center' }); });
    return cv;
  }
  C2.sign = sign;

  /* bandeirinhas de festa junina/kerb entre dois pontos */
  function flags(c, x0, y0, x1, y1, sag, seed) {
    var r = TC.RNG(seed || 3);
    var cols = ['#d83030', '#f0c030', '#30a050', '#3070d8', '#f0f0f0', '#e060a0'];
    var n = Math.max(2, Math.floor(Math.abs(x1 - x0) / 7));
    c.fillStyle = TC.col('#2a2020');
    ART.drawWire(c, x0, y0, x1, y1, sag, '#3a3030');
    for (var i = 1; i < n; i++) {
      var t = i / n;
      var x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag);
      c.fillStyle = TC.col(r.pick(cols));
      TC.fillPoly(c, [[x - 2, y], [x + 3, y], [x + 0.5, y + 6]]);
    }
  }

  /* pavilhão novo da Festa da Batata, feito com as tábuas do Pinheiro Velho (sem terminar) */
  C2.pavilion = function (w) {
    var H = 150, cv = TC.canvas(w, H), c = cv.ctx;
    var r = TC.RNG(97);
    var roofY = 34, eave = 52;
    // fundo interno escuro
    c.fillStyle = TC.col('#14101a'); c.fillRect(6, eave, w - 12, H - eave);
    // parede de tábuas do fundo (meia altura)
    for (var x = 8; x < w - 8; x += 5) {
      c.fillStyle = TC.col(r() < 0.15 ? '#8a6a44' : '#a8845a');
      c.fillRect(x, H - 44, 4, 44);
      c.fillStyle = TC.col('#5a4028'); c.fillRect(x + 4, H - 44, 1, 44);
    }
    c.fillStyle = TC.col('#6a4c30'); c.fillRect(6, H - 46, w - 12, 3);
    // telhado de tábuas novas (faltando algumas)
    for (x = 0; x < w; x++) {
      var top = roofY + Math.round(Math.pow(Math.abs((x - w / 2) / (w / 2)), 1) * (eave - roofY) * 0.6);
      if ((Math.floor(x / 6) * 7) % 11 === 3) continue;   // tábuas faltando: céu aparecendo
      c.fillStyle = TC.col((Math.floor(x / 6) % 2) ? '#c8a070' : '#b89062');
      c.fillRect(x, top, 1, eave - top);
      c.fillStyle = TC.col('#7a5a38'); c.fillRect(x, eave - 2, 1, 2);
    }
    // caibros e pilares
    for (x = 4; x < w; x += 48) {
      c.fillStyle = TC.col('#b08a5a'); c.fillRect(x, eave, 5, H - eave);
      c.fillStyle = TC.col('#7a5a38'); c.fillRect(x + 4, eave, 1, H - eave);
      c.fillStyle = TC.col('#d0b080'); c.fillRect(x, eave, 1, H - eave);
    }
    c.fillStyle = TC.col('#8a6a44'); c.fillRect(0, eave, w, 4);
    // bandeirinhas
    for (x = 4; x + 48 < w; x += 48) {
      flags(c, x + 3, eave + 4, x + 51, eave + 4, 9, x);
      flags(c, x + 3, eave + 4, x + 51, eave + 4, 16, x + 7);
    }
    // faixa
    var bw = 128, bx = Math.round(w * 0.32);
    c.fillStyle = TC.col('#1a1010'); c.fillRect(bx - 1, eave + 12, bw + 2, 22);
    c.fillStyle = TC.col('#e8dcc0'); c.fillRect(bx, eave + 13, bw, 20);
    c.fillStyle = TC.col('#c03028'); c.fillRect(bx, eave + 13, bw, 2); c.fillRect(bx, eave + 31, bw, 2);
    TC.font.draw(c, '2ª FESTA DA BATATA', bx + bw / 2, eave + 16, '#5a2a18', { align: 'center' });
    TC.font.draw(c, 'TEEWALD 1997', bx + bw / 2, eave + 24, '#8a3a20', { align: 'center' });
    // mesas compridas com canecas (de festa)
    for (x = 30; x < w - 140; x += 90) {
      c.fillStyle = TC.col('#5a3e26'); c.fillRect(x, H - 18, 56, 3);
      c.fillStyle = TC.col('#3a2818'); c.fillRect(x + 4, H - 15, 2, 15); c.fillRect(x + 50, H - 15, 2, 15);
      c.fillStyle = TC.col('#4a3220'); c.fillRect(x - 4, H - 9, 64, 2);
      for (var m = 0; m < 4; m++) {
        if (r() < 0.3) continue;
        var mx = x + 6 + m * 13;
        c.fillStyle = TC.col('#d8d8e0'); c.fillRect(mx, H - 24, 5, 6);
        c.fillStyle = TC.col('#e8b030'); c.fillRect(mx + 1, H - 22, 3, 4);
        c.fillStyle = TC.col('#d8d8e0'); c.fillRect(mx + 5, H - 23, 1, 3);
      }
    }
    return cv;
  };
  /* palco da bandinha: tuba e gaita largadas nas cadeiras */
  C2.stage = function () {
    var cv = TC.canvas(96, 70), c = cv.ctx;
    c.fillStyle = TC.col('#6a4c30'); c.fillRect(0, 38, 96, 32);
    for (var x = 0; x < 96; x += 6) { c.fillStyle = TC.col('#7a5a38'); c.fillRect(x, 38, 5, 32); }
    c.fillStyle = TC.col('#a07850'); c.fillRect(0, 36, 96, 3);
    // cortina vermelha
    c.fillStyle = TC.col('#6a1818'); c.fillRect(2, 0, 10, 36); c.fillRect(84, 0, 10, 36);
    c.fillStyle = TC.col('#8a2828'); for (x = 3; x < 12; x += 3) c.fillRect(x, 0, 1, 36);
    for (x = 85; x < 94; x += 3) c.fillRect(x, 0, 1, 36);
    // cadeiras
    [[24, 'tuba'], [48, 'gaita'], [68, '']].forEach(function (s) {
      c.fillStyle = TC.col('#3a2818'); c.fillRect(s[0], 22, 2, 14); c.fillRect(s[0] + 9, 28, 2, 8); c.fillRect(s[0], 27, 11, 2);
      if (s[1] === 'tuba') {
        c.fillStyle = TC.col('#c8a030'); TC.fillCircle(c, s[0] + 8, 18, 7);
        c.fillStyle = TC.col('#8a6a18'); TC.fillCircle(c, s[0] + 8, 18, 4);
        c.fillStyle = TC.col('#e8d070'); c.fillRect(s[0] + 3, 24, 4, 3); c.fillRect(s[0] + 4, 13, 1, 1);
      } else if (s[1] === 'gaita') {
        c.fillStyle = TC.col('#a02828'); c.fillRect(s[0] - 1, 17, 6, 10);
        c.fillStyle = TC.col('#f0e8e0'); c.fillRect(s[0] + 5, 17, 3, 10);
        c.fillStyle = TC.col('#2a1414'); for (var k = 0; k < 5; k++) c.fillRect(s[0] + 9 + k, 17 + (k % 2), 1, 9);
        c.fillStyle = TC.col('#a02828'); c.fillRect(s[0] + 14, 17, 5, 10);
      }
    });
    return cv;
  };
  /* saco de batata (quebrável) */
  C2.sack = function () {
    return TC.sprite([
      '.....kkk........',
      '....kTTTk.......',
      '...kkkkkkk......',
      '..kSssssSSk.....',
      '.kSsssssssSk....',
      'kSsBsssBsssSk...',
      'kSssssssssSSk...',
      'kSsssBsssBsssk..',
      'kSssssssssssSk..',
      'kSsBsssBssssSk..',
      'kSssssssssBsSk..',
      'kSsssBssssssSk..',
      'kSssssssssssSk..',
      '.kSSsssssssSSk..',
      '..kkSSSSSSSkk...',
      '....kkkkkkk.....'
    ], { k: '#2a1a0c', S: '#8a6a40', s: '#b8945c', B: '#5a3a1a', T: '#c8b070' });
  };
  C2.potato = TC.sprite(['.kk.', 'kbBk', 'kbbk', '.kk.'], { k: '#3a2410', b: '#a07040', B: '#c89a60' });

  /* atafona (moinho colonial) com bica d'água */
  C2.mill = function () {
    var W = 120, H = 128, cv = TC.canvas(W, H), c = cv.ctx;
    var P = ART.PAL;
    // base de pedra
    for (var y = 70; y < H; y++) for (var x = 6; x < 96; x++) {
      var row = Math.floor((y - 70) / 6), bx = (x + (row % 2) * 7) % 14;
      c.fillStyle = TC.col(bx === 0 || (y - 70) % 6 === 0 ? P.stoneD : (H2(Math.floor((x + (row % 2) * 7) / 14), row, 5) > 0.5 ? P.stone : P.stoneL));
      c.fillRect(x, y, 1, 1);
    }
    // parte de madeira
    for (x = 10; x < 92; x++) {
      c.fillStyle = TC.col(x % 7 === 0 ? '#3a2818' : (H2(x, 3, 4) > 0.8 ? '#5a3e26' : '#6a4a2e'));
      c.fillRect(x, 26, 1, 44);
    }
    // telhado de tabuinhas
    for (y = 0; y < 30; y++) {
      var hw = 6 + y * 2.0;
      for (x = Math.round(51 - hw); x <= Math.round(51 + hw); x++) {
        c.fillStyle = TC.col(((x + Math.floor(y / 3) * 2) % 5 === 0 || y % 3 === 2) ? '#2a2028' : (x < 51 ? '#4a3a40' : '#3a3036'));
        c.fillRect(x, y, 1, 1);
      }
    }
    // porta e janela acesa fraca
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(30, 44, 16, 26);
    c.fillStyle = TC.col('#4a3020'); for (x = 31; x < 46; x += 4) c.fillRect(x, 45, 2, 24);
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(60, 38, 14, 14);
    c.fillStyle = TC.col('#1a2240'); c.fillRect(61, 39, 12, 12);
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(67, 39, 1, 12); c.fillRect(61, 45, 12, 1);
    // eixo da roda
    c.fillStyle = TC.col('#2a2028'); c.fillRect(92, 76, 12, 4);
    // bica (calha de madeira) por cima
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(70, 22, 50, 4);
    c.fillStyle = TC.col('#3a2818'); c.fillRect(70, 26, 50, 1);
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(116, 26, 3, 70);
    cv.wheelX = 104; cv.wheelY = 78; cv.flumeX = 108; cv.flumeY = 26;
    return cv;
  };
  /* roda d'água (quadro único, girado em tempo real) */
  C2.wheel = function () {
    var R = 30, S = R * 2 + 4, pb = new TC.PixBuf(S, S), c = S / 2;
    var wood = u32('#5a3e26'), woodD = u32('#3a2818'), woodL = u32('#7a5a38');
    for (var a = 0; a < TC.TAU; a += 0.01) {
      for (var rr = R - 4; rr <= R; rr++) pb.set(c + Math.cos(a) * rr, c + Math.sin(a) * rr, rr === R ? woodD : wood);
      for (rr = 6; rr <= 8; rr++) pb.set(c + Math.cos(a) * rr, c + Math.sin(a) * rr, woodD);
    }
    for (var k = 0; k < 8; k++) {
      var an = k / 8 * TC.TAU;
      pb.line(c + Math.cos(an) * 7, c + Math.sin(an) * 7, c + Math.cos(an) * (R - 3), c + Math.sin(an) * (R - 3), woodL, 2);
    }
    for (k = 0; k < 16; k++) {
      var b = k / 16 * TC.TAU;
      var px = c + Math.cos(b) * (R + 1), py = c + Math.sin(b) * (R + 1);
      pb.line(px, py, c + Math.cos(b) * (R - 5), c + Math.sin(b) * (R - 5), woodD, 2);
      pb.line(px - Math.sin(b) * 2, py + Math.cos(b) * 2, px + Math.sin(b) * 2, py - Math.cos(b) * 2, wood, 1);
    }
    pb.circle(c, c, 3, u32('#2a2028'));
    return pb.toCanvas();
  };

  /* serraria: galpão aberto com telhado de zinco */
  C2.shed = function (w) {
    var H = 140, cv = TC.canvas(w, H), c = cv.ctx;
    var top = 20, eave = 40;
    for (var x = 0; x < w; x++) {
      var y0 = top + Math.round((x / w) * (eave - top));
      for (var y = y0; y < y0 + 10; y++) {
        var rust = H2(x >> 2, y >> 2, 31) > 0.78;
        c.fillStyle = TC.col(rust ? '#8a5a3a' : (x % 4 === 0 ? '#4a4a54' : x % 4 === 1 ? '#8a8a96' : '#6a6a74'));
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = TC.col('#12101a');
    for (x = 0; x < w; x++) { var yb = top + 10 + Math.round((x / w) * (eave - top)); c.fillRect(x, yb, 1, 3); }
    for (x = 6; x < w; x += 64) {
      var yt = top + 10 + Math.round((x / w) * (eave - top));
      c.fillStyle = TC.col('#4a3420'); c.fillRect(x, yt, 6, H - yt);
      c.fillStyle = TC.col('#6a4a2e'); c.fillRect(x, yt, 2, H - yt);
      c.fillStyle = TC.col('#2a1c10'); c.fillRect(x + 5, yt, 1, H - yt);
    }
    // placa
    var s = sign(110, 22, [['SERRARIA KESSLER', '#f0e0b0'], ['COMPRA-SE PINHEIRO EM PÉ', '#d8b880']]);
    c.drawImage(s, Math.round(w * 0.12), top + 16);
    // pilhas de serragem no fundo
    for (var k = 0; k < 5; k++) {
      var px = 30 + k * Math.round(w / 5), ph = 8 + (k % 3) * 5;
      c.fillStyle = TC.col('#b89a60');
      TC.fillPoly(c, [[px - 18, H], [px, H - ph], [px + 18, H]]);
      c.fillStyle = TC.col('#d8bc80');
      TC.fillPoly(c, [[px - 6, H - ph * 0.6], [px, H - ph], [px + 4, H - ph * 0.7]]);
    }
    return cv;
  };
  /* bancada da serra circular */
  C2.sawBench = function () {
    var cv = TC.canvas(72, 30), c = cv.ctx;
    c.fillStyle = TC.col('#4a3420'); c.fillRect(0, 10, 72, 6);
    c.fillStyle = TC.col('#7a5a38'); c.fillRect(0, 10, 72, 2);
    c.fillStyle = TC.col('#2a1c10'); c.fillRect(4, 16, 4, 14); c.fillRect(64, 16, 4, 14); c.fillRect(34, 16, 4, 14);
    // tábua pela metade
    c.fillStyle = TC.col('#c8a070'); c.fillRect(2, 6, 26, 4);
    c.fillStyle = TC.col('#e0bc88'); c.fillRect(2, 6, 26, 1);
    return cv;
  };
  C2.sawBlade = function () {
    var R = 14, S = R * 2 + 4, pb = new TC.PixBuf(S, S), c = S / 2;
    for (var y = -R; y <= R; y++) for (var x = -R; x <= R; x++) {
      var d = Math.sqrt(x * x + y * y);
      var ang = Math.atan2(y, x);
      var tooth = (Math.floor((ang + Math.PI) / TC.TAU * 24) % 2 === 0) ? 1.6 : 0;
      if (d > R - 2 + tooth) continue;
      var col = d < 3 ? '#3a3a44' : d < 4 ? '#c8c8d0' : (d > R - 2 ? '#e8e8f0' : ((Math.floor(ang * 3 + 9) % 2) ? '#9a9aa6' : '#8a8a96'));
      pb.set(c + x, c + y, u32(col));
    }
    return pb.toCanvas();
  };
  /* pilha de toras de araucária (vista de lado: pontas com anéis) */
  C2.logPile = function (cols, rows, seed) {
    var r = TC.RNG(seed || 5), d = 16;
    var W = cols * d + 4, H = rows * 14 + 6;
    var cv = TC.canvas(W, H), c = cv.ctx;
    for (var row = 0; row < rows; row++) {
      var n = cols - (row % 2 ? 1 : 0);
      for (var i = 0; i < n; i++) {
        var cx = 10 + i * d + (row % 2 ? d / 2 : 0), cy = H - 8 - row * 14;
        var rr = 7 + r.int(0, 1);
        c.fillStyle = TC.col('#3a2414'); TC.fillCircle(c, cx, cy, rr + 1);
        c.fillStyle = TC.col('#6a4024'); TC.fillCircle(c, cx, cy, rr);
        c.fillStyle = TC.col('#c89a64'); TC.fillCircle(c, cx, cy, rr - 2);
        c.fillStyle = TC.col('#a87a48'); TC.fillCircle(c, cx, cy, rr - 4);
        c.fillStyle = TC.col('#c89a64'); TC.fillCircle(c, cx, cy, rr - 5);
        c.fillStyle = TC.col('#8a5a30'); c.fillRect(cx, cy, 1, 1);
      }
    }
    return cv;
  };
  /* caminhão Fenemê carregado de toras (igual ao do pai do Arno) */
  C2.fnm = function () {
    var W = 150, H = 64, cv = TC.canvas(W, H), c = cv.ctx;
    // carroceria com toras
    c.fillStyle = TC.col('#3a2414'); c.fillRect(4, 30, 86, 6);
    var logs = C2.logPile(5, 2, 9);
    c.drawImage(logs, 4, 30 - logs.height + 6);
    c.fillStyle = TC.col('#1a1a20'); c.fillRect(6, 8, 2, 28); c.fillRect(84, 8, 2, 28);
    c.fillStyle = TC.col('#5a5a66'); c.fillRect(6, 12, 80, 1);
    // cabine bicuda vermelha
    c.fillStyle = TC.col('#7a1e18'); TC.fillPoly(c, [[90, 12], [114, 12], [118, 26], [148, 30], [148, 48], [90, 48]]);
    c.fillStyle = TC.col('#a02a20'); TC.fillPoly(c, [[92, 14], [112, 14], [115, 26], [92, 26]]);
    c.fillStyle = TC.col('#c84030'); c.fillRect(118, 28, 28, 2);
    c.fillStyle = TC.col('#1a2240'); TC.fillPoly(c, [[100, 16], [111, 16], [114, 26], [100, 26]]);
    c.fillStyle = TC.col('#4a5a8a'); c.fillRect(101, 17, 3, 3);
    // grade do motor
    c.fillStyle = TC.col('#c8c8d0'); c.fillRect(144, 30, 3, 14);
    for (var y = 31; y < 44; y += 2) { c.fillStyle = TC.col('#3a3a44'); c.fillRect(145, y, 2, 1); }
    c.fillStyle = TC.col('#e0d8a0'); c.fillRect(141, 32, 3, 3);
    c.fillStyle = TC.col('#e8e8f0'); TC.font.draw(c, 'FNM', 130, 37, '#e8d0a0');
    // para-choque e chassi
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(2, 46, 148, 4);
    // rodas
    [[20, 52], [40, 52], [128, 52]].forEach(function (w) {
      c.fillStyle = TC.col('#0c0c10'); TC.fillCircle(c, w[0], w[1], 10);
      c.fillStyle = TC.col('#3a3a44'); TC.fillCircle(c, w[0], w[1], 5);
      c.fillStyle = TC.col('#8a8a96'); TC.fillCircle(c, w[0], w[1], 2);
    });
    return cv;
  };

  /* erva-mate (arbusto de folha escura e lustrosa) */
  C2.erva = function (seed, h) {
    var r = TC.RNG(seed), W = Math.round(h * 0.9), pb = new TC.PixBuf(W, h + 2), cx = W / 2;
    var tr = u32('#4a3a2c'), cols = ['#0e2418', '#1a3a26', '#2a5034', '#4a7a4a'].map(function (q) { return u32(q); });
    for (var y = Math.round(h * 0.55); y < h + 2; y++) { pb.set(cx, y, tr); pb.set(cx + 1, y, tr); }
    for (var b = 0; b < 9; b++) {
      var bx = cx + r.range(-W * 0.3, W * 0.3), by = r.range(h * 0.12, h * 0.6), br = r.range(h * 0.14, h * 0.22);
      for (var yy = -br; yy <= br; yy++) for (var xx = -br; xx <= br; xx++) {
        if ((xx * xx + yy * yy) / (br * br) > 1 - H2(Math.round(bx + xx), Math.round(by + yy), seed) * 0.4) continue;
        var l = (-yy / br) * 0.5 + (xx / br) * 0.3 + H2(Math.round(xx * 3), Math.round(yy * 3), seed + 1) * 0.6;
        pb.set(bx + xx, by + yy, cols[TC.clamp(Math.floor(l * 2 + 1), 0, 3)]);
      }
    }
    var cv = pb.toCanvas();
    cv.baseX = Math.round(cx);
    return cv;
  };
  /* carijó: girau de varas sob telhado de capim, onde a erva é sapecada no fogo de chão */
  C2.carijo = function () {
    var W = 110, H = 80, cv = TC.canvas(W, H), c = cv.ctx;
    // telhado de capim santa-fé
    for (var y = 0; y < 26; y++) {
      var hw = 10 + y * 2.0;
      for (var x = Math.round(55 - hw); x <= Math.round(55 + hw); x++) {
        c.fillStyle = TC.col(H2(x, y, 41) > 0.7 ? '#8a7a40' : (x + y) % 3 === 0 ? '#5a4a24' : '#6e5e30');
        c.fillRect(x, y + 4, 1, 1);
      }
    }
    for (x = 3; x < 107; x += 2) { c.fillStyle = TC.col('#4a3c1c'); c.fillRect(x, 30, 1, 2 + (x % 3)); }
    // esteios
    [[8, '#4a3420'], [52, '#4a3420'], [98, '#4a3420']].forEach(function (p) { c.fillStyle = TC.col(p[1]); c.fillRect(p[0], 30, 4, 50); });
    // girau com ramos de erva secando
    c.fillStyle = TC.col('#3a2818'); c.fillRect(6, 46, 98, 3);
    for (x = 8; x < 102; x += 3) {
      c.fillStyle = TC.col(H2(x, 1, 3) > 0.5 ? '#3a5a2a' : '#4a6a30');
      c.fillRect(x, 40 + (x % 4), 2, 6);
    }
    // fogo de chão: lenha e brasa
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(30, 74, 50, 3);
    c.fillStyle = TC.col('#5a2a10'); c.fillRect(34, 72, 42, 2);
    for (x = 36; x < 74; x += 3) { c.fillStyle = TC.col(x % 2 ? '#ff7020' : '#c03010'); c.fillRect(x, 71 + (x % 2), 2, 1); }
    cv.fireX = 55; cv.fireY = 70;
    return cv;
  };
  /* toco gigante do Pinheiro Velho, com fitas rasgadas */
  C2.stump = function (opt) {
    opt = opt || {};
    var W = 180, H = 84, pb = new TC.PixBuf(W, H), cx = W / 2;
    var bark = u32('#4a3428'), barkD = u32('#2c1e18'), barkL = u32('#6a5040');
    var wood = u32('#c89a64'), woodD = u32('#a07a48'), ring = u32('#8a6038');
    var topY = 26;
    // raízes
    for (var s = -1; s <= 1; s += 2) {
      for (var k = 0; k < 3; k++) {
        var rx0 = cx + s * (34 + k * 6), rx1 = cx + s * (60 + k * 14);
        for (var t = 0; t <= 1; t += 0.02) {
          var x = rx0 + (rx1 - rx0) * t, y = 56 + k * 4 + t * t * (H - 60 - k * 4);
          var th = Math.round(8 * (1 - t) + 2);
          for (var q = -th; q <= 0; q++) pb.set(x, y + q, q === -th ? barkL : (q > -2 ? barkD : bark));
        }
      }
    }
    // tronco (cilindro com casca grossa de placas)
    for (var yy = topY; yy < H; yy++) {
      var hw = 44 + Math.max(0, yy - 50) * 0.45;
      for (var xx = -hw; xx <= hw; xx++) {
        var e = xx / hw;
        var n = TC.fbm2((xx + 60) / 5, yy / 9, 23, 3);
        var furrow = Math.abs(((xx + 60) % 7) - 3) < 1 && n > 0.45;
        var col = e < -0.72 ? barkD : e > 0.6 ? barkL : (furrow || n < 0.36 ? barkD : n > 0.62 ? barkL : bark);
        pb.set(cx + xx, yy, col);
      }
    }
    // topo cortado (elipse com anéis)
    for (yy = -10; yy <= 10; yy++) for (xx = -44; xx <= 44; xx++) {
      var d = (xx * xx) / (44 * 44) + (yy * yy) / (10 * 10);
      if (d > 1) continue;
      var rr = Math.sqrt(d);
      var c = (Math.floor(rr * 18 + H2(xx, yy, 3) * 0.6) % 3 === 0) ? ring : (rr > 0.92 ? woodD : wood);
      if (yy > 6 && rr > 0.85) c = barkL;
      pb.set(cx + xx, topY + yy, c);
    }
    // marca da serra
    for (xx = -40; xx < 30; xx += 2) pb.set(cx + xx, topY + 3 + Math.round(xx * 0.05), u32('#6a4a28'));
    // fenda escura (onde ele dormia)
    for (yy = 34; yy < H - 4; yy++) {
      var fw = Math.max(1, Math.round(1 + (yy - 34) * 0.12 + Math.sin(yy * 0.7) * 1.2));
      for (xx = -fw; xx <= fw; xx++) pb.set(cx + 6 + xx, yy, u32(Math.abs(xx) === fw ? '#140c0a' : '#050304'));
    }
    var cv = pb.toCanvas();
    var cc = cv.ctx;
    // fitas rasgadas presas na casca
    if (!opt.bare) {
      RIBBON_COLS.forEach(function (col, i) {
        var bx = cx - 38 + i * 12, by = 40 + (i % 3) * 7;
        cc.fillStyle = TC.col(col);
        for (var j = 0; j < 10; j++) cc.fillRect(Math.round(bx + Math.sin(j * 0.7 + i) * 2), by + j, 2, 1);
        cc.fillStyle = TC.col(TC.shade(col, 0.6));
        cc.fillRect(bx - 2, by, 6, 1);
      });
    }
    cv.crackX = cx + 6; cv.crackY = 60;
    return cv;
  };
  /* taipa (muro de pedra seca) — tiles */
  C2.tiles = function () {
    var T = {};
    T.grimpaTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        var gh = 3 + Math.round(H2(xx, 2, 60) * 2);
        if (y < gh - 2) return H2(xx, y, 61) > 0.62 ? (H2(xx, y, 64) > 0.5 ? '#7a4a24' : '#3a5a30') : null;
        if (y < gh) return H2(xx, y, 62) > 0.45 ? '#8a5a2c' : '#5a3a20';
        if (y === gh) return '#2a1c14';
        var n = H2(xx, y, 63);
        return n > 0.9 ? '#5a4234' : n > 0.45 ? '#30241c' : '#281e18';
      });
    });
    T.sawdustTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return H2(xx, 0, 70) > 0.5 ? '#e8d098' : null;
        if (y < 4) return H2(xx, y, 71) > 0.7 ? '#a88850' : '#d4b878';
        if (y === 4) return '#8a6a40';
        var n = H2(xx, y, 72);
        return n > 0.85 ? '#b89a60' : n > 0.4 ? '#3a2a1e' : '#30221a';
      });
    });
    T.deckTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#e0c090';
        if (y < 5) return (xx % 8 === 7) ? '#6a4a2a' : (H2(xx >> 3, y, 80) > 0.5 ? '#c8a070' : '#b89062');
        if (y === 5) return '#5a3e24';
        if (y < 8) return '#3a2818';
        if ((x === 3 || x === 12)) return '#4a3420';
        return y % 5 === 0 ? '#2a1c10' : null;
      });
    });
    T.deckFill = tile(function (x, y) { return (x === 3 || x === 12) ? '#4a3420' : (y % 8 === 0 ? '#2a1c10' : null); });
    T.taipa = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var row = Math.floor(y / 5), off = (row * 5 + v * 3) % 8;
        var bx = (x + off) % 8;
        if (bx === 0 || y % 5 === 4) return '#1a1820';
        var n = H2(Math.floor((x + off) / 8) + v, row, 90);
        return n > 0.66 ? '#7a7684' : n > 0.33 ? '#646070' : '#56525e';
      });
    });
    T.taipaTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        if (y < 2) return H2(x + v * 16, y, 91) > 0.4 ? (y === 0 ? '#4a7a40' : '#2e5a2e') : (y === 0 ? null : '#8a8694');
        var row = Math.floor((y - 2) / 5), off = (row * 5 + v * 3) % 8;
        var bx = (x + off) % 8;
        if (bx === 0 || (y - 2) % 5 === 4) return '#1a1820';
        var n = H2(Math.floor((x + off) / 8) + v, row, 92);
        return n > 0.6 ? '#8a8694' : '#6a6676';
      });
    });
    return T;
  };

  /* ====================== PREPARO (feito uma vez, quando o capítulo 2 é aberto) ====================== */
  ART.ch2Init = function () {
    if (C2.ready) return C2;
    C2.colono = buildColono('colono');
    C2.colona = buildColono('colona');
    C2.kessler = buildColono('kessler');
    C2.wolf = buildWolf();
    C2.demon = buildDemon();
    C2.gun = buildArnoGun();
    C2.gunIcon = GUN;
    C2.ribbons = RIBBON_COLS.map(function (col) { return [ribbonSprite(col, 0), ribbonSprite(col, 1)]; });
    C2.ribbonIcon = RIBBON_COLS.map(function (col) { return TC.sprite(['kk.kk', 'kckck', '.kck.', '.kcdk', '.kcdk', 'kcdk.'], { k: '#000000', c: col, d: TC.shade(col, 0.6) }); });
    C2.ribbonIconOff = TC.sprite(['kk.kk', 'kckck', '.kck.', '.kcdk', '.kcdk', 'kcdk.'], { k: '#000000', c: '#3a3a4a', d: '#2a2a36' });
    C2.sackImg = C2.sack();
    C2.wheelImg = C2.wheel();
    C2.sawImg = C2.sawBlade();
    C2.T = C2.tiles();
    // itens do revólver
    ART.items.revolver = TC.sprite([
      '..............',
      '.kkkkkkkkkkk..',
      'kGGggggggggGk.',
      'kgggCCCgkkkk..',
      'kgggCCCk......',
      '.kkbbbk.......',
      '..kbbk........',
      '..kbbk........',
      '..kkk.........'
    ], { k: '#0c0c10', G: '#b0b0c0', g: '#6a6a78', C: '#3a3a44', b: '#7a4a28' });
    ART.items.balas = TC.sprite([
      '..y.y.y.y..',
      '..Y.Y.Y.Y..',
      'kkkkkkkkkkk',
      'krrrrrrrrrk',
      'krwwwwwwwrk',
      'krw.38..wrk',
      'krwwwwwwwrk',
      'krrrrrrrrrk',
      'kkkkkkkkkkk'
    ], { k: '#1a0c08', r: '#a03020', w: '#e8dcc0', y: '#f0d060', Y: '#b08a30', '3': '#3a2a20', '8': '#3a2a20' });
    // retratos novos
    var EXTRA = { kessler: { normal: kesslerPortrait() }, demon: { normal: demonPortrait() } };
    var fitas = RIBBON_COLS.map(function (col, i) { return ribbonPortrait(i); });
    var orig = ART.portrait;
    if (!orig._ch2) {
      ART.portrait = function (who, face) {
        if (who === 'fita') return fitas[(face | 0) % 7];
        if (EXTRA[who]) return EXTRA[who][face] || EXTRA[who].normal;
        return orig(who, face);
      };
      ART.portrait._ch2 = true;
    }
    C2.ready = true;
    return C2;
  };
})();
