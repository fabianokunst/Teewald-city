'use strict';
/* Teewald City — personagens: Arno (figura por poses), inimigos, chefe, itens, retratos e efeitos */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;

  /* ---------- preenchimento de polígono num PixBuf com função de cor ---------- */
  function polyPB(pb, pts, colFn) {
    var minY = Infinity, maxY = -Infinity, i;
    for (i = 0; i < pts.length; i++) { minY = Math.min(minY, pts[i][1]); maxY = Math.max(maxY, pts[i][1]); }
    for (var y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      var yc = y + 0.5, xs = [];
      for (i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort(function (p, q) { return p - q; });
      for (i = 0; i + 1 < xs.length; i += 2) {
        for (var x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) pb.set(x, y, colFn(x, y));
      }
    }
  }
  function thickPB(pb, x0, y0, x1, y1, t, colFn) {
    var dx = x1 - x0, dy = y1 - y0;
    var n = Math.max(Math.abs(dx), Math.abs(dy), 1) * 2;
    var r = t / 2;
    for (var i = 0; i <= n; i++) {
      var cx = x0 + dx * i / n, cy = y0 + dy * i / n;
      for (var yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++) {
        for (var xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) {
          var ddx = xx + 0.5 - cx, ddy = yy + 0.5 - cy;
          if (ddx * ddx + ddy * ddy <= r * r + 0.3) pb.set(xx, yy, colFn(xx, yy));
        }
      }
    }
  }
  function outlinePB(pb, col) {
    var w = pb.w, h = pb.h, d = pb.d, copy = new Uint32Array(d);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = y * w + x;
      if (copy[i] >>> 24) continue;
      if ((x > 0 && copy[i - 1] >>> 24) || (x < w - 1 && copy[i + 1] >>> 24) ||
        (y > 0 && copy[i - w] >>> 24) || (y < h - 1 && copy[i + w] >>> 24)) d[i] = col;
    }
  }
  function blit(pb, cv, x, y) {
    var src = TC.bufFrom(cv);
    for (var j = 0; j < src.h; j++) for (var i = 0; i < src.w; i++) {
      var c = src.d[j * src.w + i];
      if (c >>> 24) pb.set(x + i, y + j, c);
    }
  }
  ART._poly = polyPB; ART._thick = thickPB; ART._outline = outlinePB; ART._blit = blit;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }

  /* ---------- renderizador de figura humanoide por poses ---------- */
  // ângulos em radianos: 0 = para baixo, positivo = para a frente (direita)
  function renderFigure(pose, S) {
    var pb = new TC.PixBuf(S.W, S.H);
    var sin = Math.sin, cos = Math.cos;
    function leg(a) {
      var k = { x: sin(a[0]) * S.thigh, y: cos(a[0]) * S.thigh };
      var sa = a[0] + a[1];
      var an = { x: k.x + sin(sa) * S.shin, y: k.y + cos(sa) * S.shin };
      return { k: k, an: an, sa: sa };
    }
    var LF = leg(pose.legF), LB = leg(pose.legB);
    var low = Math.max(LF.an.y + S.footH, LB.an.y + S.footH, LF.k.y + S.legT / 2, LB.k.y + S.legT / 2, S.legT / 2);
    if (pose.lowest != null) low = pose.lowest;
    var hx = S.ox + (pose.hipX || 0), hy = S.groundY - low + (pose.dy || 0);
    var lean = pose.lean || 0;
    var br = pose.breath || 0;
    var sx = hx + sin(lean) * S.torso, sy = hy - cos(lean) * S.torso + br;
    var C = S.col;

    function drawLeg(L, back) {
      var cp = back ? C.pantsB : C.pants, cb = back ? C.bootB : C.boot;
      thickPB(pb, hx, hy, hx + L.k.x, hy + L.k.y, S.legT, cp);
      thickPB(pb, hx + L.k.x, hy + L.k.y, hx + L.an.x, hy + L.an.y, S.legT - (S.shinThin || 0), cp);
      // bota orientada pela canela
      var fx = cos(L.sa), fy = -sin(L.sa);
      var ax = hx + L.an.x, ay = hy + L.an.y;
      if (S.footL) {
        thickPB(pb, ax - fx * 1, ay - fy * 1 + 1, ax + fx * S.footL, ay + fy * S.footL + 1, S.footH + 1, cb);
      }
    }
    function drawArm(a, back, from) {
      var cs = back ? C.sleeveB : C.sleeve, ck = back ? C.skinB : C.skin;
      var ex = from.x + sin(a[0]) * S.upper, ey = from.y + cos(a[0]) * S.upper;
      var fa = a[0] + a[1];
      var wx = ex + sin(fa) * S.fore, wy = ey + cos(fa) * S.fore;
      thickPB(pb, from.x, from.y, ex, ey, S.armT, cs);
      thickPB(pb, ex, ey, wx, wy, S.armT - (S.foreThin || 0), C.fore ? (back ? C.foreB : C.fore) : cs);
      if (S.fist) thickPB(pb, wx, wy, wx + sin(fa) * 1, wy + cos(fa) * 1, S.fist, ck);
      if (S.claw) {
        var cc = back ? C.clawB : C.claw;
        for (var q = -1; q <= 1; q++) {
          var ca = fa + q * 0.35;
          thickPB(pb, wx, wy, wx + sin(ca) * S.claw, wy + cos(ca) * S.claw, 1, cc);
        }
      }
      return { x: wx, y: wy };
    }
    var shB = { x: sx - 1 + (S.shB || 0), y: sy + 1 };
    var shF = { x: sx + 1 + (S.shF || 0), y: sy + 1 };
    if (S.wings) S.wings(pb, sx, sy, pose);
    if (!pose.noBackArm) drawArm(pose.armB, true, shB);
    drawLeg(LB, true);
    // tronco
    var px = cos(lean), py = sin(lean);
    var hw = S.hipW / 2, sw = S.shW / 2;
    polyPB(pb, [
      [hx - px * hw, hy - py * hw + 1], [hx + px * hw, hy + py * hw + 1],
      [sx + px * sw, sy + py * sw], [sx - px * sw, sy - py * sw]
    ], C.shirt);
    if (C.belt) thickPB(pb, hx - px * hw, hy - py * hw, hx + px * hw, hy + py * hw, 2, C.belt);
    drawLeg(LF, false);
    // cabeça
    if (S.head) {
      var head = typeof S.head === 'function' ? S.head(pose) : S.head;
      var hdx = Math.round(sx + sin(lean) * 2 + S.headOff.x + (pose.headX || 0));
      var hdy = Math.round(sy + S.headOff.y + (pose.headY || 0));
      blit(pb, head, hdx, hdy);
    }
    var hand = pose.noFrontArm ? null : drawArm(pose.armF, false, shF);
    if (S.after) S.after(pb, { hx: hx, hy: hy, sx: sx, sy: sy, hand: hand }, pose);
    outlinePB(pb, u32(C.outline || '#120a0e'));
    var cv = pb.toCanvas();
    cv.ox = S.ox;
    cv.oy = S.groundY + 1;
    if (hand) { cv.handX = hand.x; cv.handY = hand.y; }
    return cv;
  }
  ART.renderFigure = renderFigure;

  /* ---------- ARNO ---------- */
  function plaid(base, dark, darker, light) {
    var b = u32(base), d = u32(dark), dd = u32(darker), l = u32(light);
    return function (x, y) {
      var vx = (x & 3) === 0, hy = (y & 3) === 0;
      if (vx && hy) return dd;
      if (vx || hy) return d;
      if (((x + 2) & 3) === 0 && ((y + 2) & 3) === 0) return l;
      return b;
    };
  }
  var ARNO_HEAD = TC.sprite([
    '..cccc....',
    '.cLcccc...',
    'cLccccccc.',
    'CCCCCCCvvv',
    'hhssssss..',
    'hhSsskss..',
    'hSssssss..',
    '.Ssmmmms..',
    '.SSsssm...',
    '..SSSS....'
  ], { c: '#c03a30', L: '#e06050', C: '#7a2020', v: '#4a1414', h: '#3a2418', s: '#e8aa76', S: '#b06e4a', k: '#1a1010', m: '#4a2a18' });
  var ARNO_HEAD_HURT = TC.sprite([
    '..cccc....',
    '.cLcccc...',
    'cLccccccc.',
    'CCCCCCCvvv',
    'hhssssss..',
    'hhSskkss..',
    'hSssssss..',
    '.Ssmmmms..',
    '.SSskkm...',
    '..SSSS....'
  ], { c: '#c03a30', L: '#e06050', C: '#7a2020', v: '#4a1414', h: '#3a2418', s: '#e8aa76', S: '#b06e4a', k: '#1a1010', m: '#4a2a18' });

  var ARNO = {
    W: 48, H: 50, ox: 22, groundY: 47,
    thigh: 6, shin: 6, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
    torso: 10, hipW: 7, shW: 9,
    upper: 5, fore: 5, armT: 3.4, fist: 3.2, foreThin: 0.4,
    head: function (pose) { return pose.hurtFace ? ARNO_HEAD_HURT : ARNO_HEAD; },
    headOff: { x: -4, y: -9 },
    col: {
      pants: (function () { var a = u32('#3c5490'), b = u32('#5a74b0'), c = u32('#2c3e70'); return function (x, y) { return (x & 1) && (y % 5 === 0) ? c : (((x + y) % 7 === 0) ? b : a); }; })(),
      pantsB: solid('#263660'),
      boot: solid('#5a3420'), bootB: solid('#3a2014'),
      shirt: plaid('#b03428', '#6a1e20', '#3a1418', '#d8624c'),
      sleeve: plaid('#b03428', '#6a1e20', '#3a1418', '#d8624c'),
      sleeveB: plaid('#7a2420', '#4a1418', '#2a0c10', '#9a3a30'),
      skin: solid('#e8aa76'), skinB: solid('#b06e4a'),
      belt: (function () { var a = u32('#2a1c14'), b = u32('#d0b050'); return function (x) { return (x % 7 === 3) ? b : a; }; })(),
      outline: '#120a0e'
    }
  };

  var POSES = {};
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest
    };
  }
  POSES.idle = [P({ lean: 0.06 }), P({ lean: 0.06, breath: 1 })];
  POSES.run = [];
  for (var i = 0; i < 8; i++) {
    var p = i / 8 * TC.TAU;
    POSES.run.push(P({
      lean: 0.22,
      legF: [0.7 * Math.sin(p), -(0.15 + 1.1 * Math.max(0, Math.cos(p)))],
      legB: [0.7 * Math.sin(p + Math.PI), -(0.15 + 1.1 * Math.max(0, Math.cos(p + Math.PI)))],
      armF: [-0.7 * Math.sin(p) + 0.1, 1.3],
      armB: [0.7 * Math.sin(p) + 0.1, 1.3]
    }));
  }
  POSES.jump = [P({ lean: 0.1, legF: [1.0, -1.5], legB: [0.25, -1.0], armF: [2.5, 0.3], armB: [-0.7, 0.8] })];
  POSES.fall = [P({ lean: 0.0, legF: [0.4, -0.5], legB: [-0.25, -0.7], armF: [1.9, 0.4], armB: [-1.3, 0.4] })];
  POSES.punch1 = [
    P({ lean: 0.1, legF: [0.35, -0.1], legB: [-0.35, -0.1], armF: [0.5, 2.0], armB: [0.4, 1.9] }),
    P({ lean: 0.18, legF: [0.4, -0.1], legB: [-0.4, -0.1], armF: [1.57, 0.05], armB: [0.4, 1.9] }),
    P({ lean: 0.14, legF: [0.4, -0.1], legB: [-0.4, -0.1], armF: [1.3, 0.6], armB: [0.4, 1.9] })
  ];
  POSES.punch2 = [
    P({ lean: 0.2, legF: [0.45, -0.15], legB: [-0.4, -0.1], armF: [0.6, 1.9], armB: [0.2, 1.6] }),
    P({ lean: 0.32, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [0.6, 1.9], armB: [1.57, 0.05], hipX: 1 }),
    P({ lean: 0.25, legF: [0.45, -0.15], legB: [-0.4, -0.1], armF: [0.6, 1.9], armB: [1.2, 0.6] })
  ];
  POSES.kick = [
    P({ lean: -0.1, legF: [1.1, -1.7], legB: [-0.1, -0.05], armF: [0.9, 1.2], armB: [-0.6, 0.8] }),
    P({ lean: -0.3, legF: [1.55, 0.0], legB: [-0.15, -0.05], armF: [0.9, 0.6], armB: [-1.0, 0.4] }),
    P({ lean: -0.2, legF: [1.2, -0.9], legB: [-0.1, -0.05], armF: [0.8, 1.0], armB: [-0.8, 0.6] })
  ];
  POSES.airkick = [P({ lean: -0.15, legF: [1.2, 0.0], legB: [0.5, -1.6], armF: [-0.4, 0.6], armB: [2.1, 0.4] })];
  POSES.spin = [
    P({ lean: 0, legF: [0.3, -0.1], legB: [-0.3, -0.1], armF: [1.57, 0], armB: [-1.57, 0] }),
    P({ lean: 0, legF: [0.2, -0.1], legB: [-0.2, -0.1], armF: [1.2, 0.3], armB: [-1.2, -0.3] })
  ];
  POSES.hurt = [P({ lean: -0.45, legF: [0.35, -0.35], legB: [-0.2, -0.2], armF: [0.9, 1.0], armB: [-0.5, 1.3], hurtFace: true, headX: -1 })];
  POSES.kneel = [P({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.9, 0.5], armB: [0.4, 0.6], hurtFace: true })];
  POSES.sit = [P({ lean: -0.15, legF: [1.5, 0.05], legB: [1.45, 0.1], armF: [-0.5, -0.2], armB: [-0.7, -0.1], lowest: 2 })];
  POSES.shock = [P({ lean: -0.2, legF: [0.3, -0.15], legB: [-0.35, -0.1], armF: [0.9, 1.6], armB: [0.7, 1.7] })];
  POSES.look = [P({ lean: 0.0, armF: [0.2, 0.3], armB: [-0.1, 0.3], headX: -1 })];
  POSES.victory = [P({ lean: -0.05, armF: [2.9, 0.2], armB: [-0.2, 0.4] })];

  ART.arno = {};
  Object.keys(POSES).forEach(function (k) {
    ART.arno[k] = POSES[k].map(function (ps) { return renderFigure(ps, ARNO); });
  });
  // deitado (rotação do corpo)
  (function () {
    var straight = renderFigure(P({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], hurtFace: true }), ARNO);
    var rot = TC.rotate(straight, -Math.PI / 2);
    // recorta e alinha pela base
    var pb = TC.bufFrom(rot), minY = pb.h, maxY = 0, minX = pb.w, maxX = 0;
    for (var y = 0; y < pb.h; y++) for (var x = 0; x < pb.w; x++) if (pb.d[y * pb.w + x] >>> 24) {
      minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    }
    var w = maxX - minX + 1, h = maxY - minY + 1;
    var cv = TC.canvas(48, 50);
    cv.ctx.drawImage(rot, minX, minY, w, h, Math.round(24 - w / 2), 48 - h, w, h);
    cv.ox = 24; cv.oy = 48;
    ART.arno.lie = [cv];
  })();

  /* ---------- VULTO (sombra humanoide) ---------- */
  var VHEAD = TC.sprite([
    '..vvvv...',
    '.vvvvvv..',
    'vvvvvvvv.',
    'vvvveevv.',
    'vvvvvvvv.',
    '.vvvvvv..',
    '.vvvvv...',
    '..vvv....'
  ], { v: '#1c1428', e: '#ff4030' });
  var VHEAD2 = TC.sprite([
    '..vvvv...',
    '.vvvvvv..',
    'vvvvvvvv.',
    'vvvvEEvv.',
    'vvvvvvvv.',
    '.vvvvmm..',
    '.vvvvv...',
    '..vvv....'
  ], { v: '#1c1428', E: '#ffd040', m: '#601010' });
  var SHADE = {
    W: 52, H: 56, ox: 24, groundY: 54,
    thigh: 8, shin: 8, legT: 3.2, footH: 1, footL: 3,
    torso: 13, hipW: 6, shW: 10,
    upper: 7, fore: 7, armT: 2.6, claw: 3,
    head: function (pose) { return pose.hurtFace ? VHEAD2 : VHEAD; },
    headOff: { x: -4, y: -8 },
    col: {
      pants: solid('#1c1428'), pantsB: solid('#100a18'),
      boot: solid('#1c1428'), bootB: solid('#100a18'),
      shirt: (function () { var a = u32('#1c1428'), b = u32('#2e2244'); return function (x, y) { return ((x * 3 + y) % 9 === 0) ? b : a; }; })(),
      sleeve: solid('#1c1428'), sleeveB: solid('#100a18'),
      skin: solid('#1c1428'), skinB: solid('#100a18'),
      claw: solid('#8a7aa8'), clawB: solid('#4a3a60'),
      outline: '#06040a'
    }
  };
  var SP = {
    walk: [], windup: [P({ lean: -0.2, armF: [-0.4, 2.2], armB: [-0.8, 1.0], legF: [0.3, -0.1], legB: [-0.3, -0.1] })],
    swipe: [P({ lean: 0.35, armF: [1.9, 0.1], armB: [0.3, 0.8], legF: [0.45, -0.15], legB: [-0.4, -0.05], hurtFace: true })],
    hurt: [P({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], hurtFace: true })],
    idle: [P({ lean: 0.15, armF: [0.2, 0.3], armB: [-0.05, 0.3] }), P({ lean: 0.18, breath: 1, armF: [0.25, 0.35], armB: [0, 0.35] })]
  };
  for (i = 0; i < 6; i++) {
    var q = i / 6 * TC.TAU;
    SP.walk.push(P({
      lean: 0.18,
      legF: [0.45 * Math.sin(q), -(0.1 + 0.7 * Math.max(0, Math.cos(q)))],
      legB: [0.45 * Math.sin(q + Math.PI), -(0.1 + 0.7 * Math.max(0, Math.cos(q + Math.PI)))],
      armF: [0.3 - 0.3 * Math.sin(q), 0.5], armB: [0.3 + 0.3 * Math.sin(q), 0.5]
    }));
  }
  ART.shade = {};
  Object.keys(SP).forEach(function (k) { ART.shade[k] = SP[k].map(function (ps) { return renderFigure(ps, SHADE); }); });
  (function () {
    var s = renderFigure(P({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], hurtFace: true }), SHADE);
    var rot = TC.rotate(s, -Math.PI / 2);
    var pb = TC.bufFrom(rot), minY = pb.h, maxY = 0, minX = pb.w, maxX = 0;
    for (var y = 0; y < pb.h; y++) for (var x = 0; x < pb.w; x++) if (pb.d[y * pb.w + x] >>> 24) {
      minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    }
    var w = maxX - minX + 1, h = maxY - minY + 1;
    var cv = TC.canvas(60, 56);
    cv.ctx.drawImage(rot, minX, minY, w, h, Math.round(30 - w / 2), 55 - h, w, h);
    cv.ox = 30; cv.oy = 55;
    ART.shade.lie = [cv];
  })();

  /* ---------- ASSOMBRAÇÃO (fantasma de lençol) ---------- */
  ART.ghost = [0, 1, 2, 3].map(function (f) {
    var W = 22, H = 24;
    var pb = new TC.PixBuf(W, H);
    var cx = 11;
    var body = u32('#e4e8ff'), sh = u32('#aab2e0'), dk = u32('#6a72a8'), hole = u32('#0a0a1a'), glow = u32('#80c0ff');
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var dx = x - cx + 0.5, dy = y - 9;
        var inside;
        if (y < 9) inside = dx * dx + dy * dy <= 81;
        else {
          var hw = 9 + (y - 9) * 0.12;
          var hem = 19 + Math.round(Math.sin((x / 3.2) + f * Math.PI / 2) * 2);
          inside = Math.abs(dx) <= hw && y <= hem;
        }
        if (!inside) continue;
        var c = body;
        if (dx > 4 || y > 16) c = sh;
        if (dx > 7 || (y > 18)) c = dk;
        if (dx < -5 && y < 8 && y > 2) c = u32('#ffffff');
        pb.set(x, y, c);
      }
    }
    // olhos e boca vazados
    [[7, 8], [13, 8]].forEach(function (e) {
      pb.rect(e[0] - 1, e[1] - 1, 3, 4, hole);
      pb.set(e[0], e[1] + 1, glow);
    });
    pb.rect(9, 13, 4, 3 + (f % 2), hole);
    outlinePB(pb, u32('#2a2a5a'));
    return pb.toCanvas();
  });
  ART.ghostHurt = ART.ghost.map(function (g) { return TC.tint(g, '#ff8080', 0.5); });

  /* ---------- CABEÇA-DE-FOGO ---------- */
  ART.flameHead = (function () {
    var W = 24, H = 27;
    function face(open) {
      var pb = new TC.PixBuf(W, H);
      var hi = u32('#fff4e0'), sk = u32('#ecdcc4'), sh = u32('#c0a488'), dk = u32('#7a5c48'), dd = u32('#4a3428'), hole = u32('#0c0606'), ember = u32('#ff7020');
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var dx = (x - 11.5) / 10.5, dy = (y - 12) / 12.5;
        var e = dx * dx + dy * dy * (y > 16 ? 1.35 : 1);
        if (e > 1) continue;
        var c = sk;
        if (dx > 0.2 && dy < -0.4) c = hi;
        if (dx < -0.3) c = sh;
        if (dx < -0.65 || dy > 0.78) c = dk;
        if (dx < -0.85) c = dd;
        pb.set(x, y, c);
      }
      // órbitas fundas com brasa
      for (var q = 0; q < 2; q++) {
        var ex = q ? 18 : 12, ey = 10;
        for (var yy = -3; yy <= 3; yy++) for (var xx = -2; xx <= 2; xx++) {
          if (xx * xx * 1.5 + yy * yy * 0.9 > 7) continue;
          pb.set(ex + xx, ey + yy, yy < -2 ? dk : hole);
        }
        pb.set(ex, ey, ember); pb.set(ex, ey + 1, u32('#c03010'));
      }
      pb.rect(9, 6, 6, 1, dk); pb.rect(16, 6, 5, 1, dk);
      // maçãs do rosto e nariz
      pb.rect(19, 14, 1, 3, dk); pb.set(20, 16, dd);
      pb.rect(10, 15, 3, 1, sh);
      // boca
      if (open) {
        for (var my = 18; my <= 23; my++) for (var mx = 13; mx <= 20; mx++) {
          var mdx = (mx - 16.5) / 4, mdy = (my - 20.5) / 3;
          if (mdx * mdx + mdy * mdy <= 1) pb.set(mx, my, hole);
        }
        pb.rect(15, 21, 3, 1, u32('#ff5020'));
      } else { pb.rect(14, 20, 6, 2, hole); pb.rect(14, 22, 6, 1, dk); }
      outlinePB(pb, u32('#2a1008'));
      return pb.toCanvas();
    }
    return { closed: face(false), open: face(true) };
  })();
  // chamas (cauda) — 4 quadros
  ART.flames = [0, 1, 2, 3].map(function (f) {
    var W = 34, H = 26;
    var pb = new TC.PixBuf(W, H);
    var cols = ['#fff0a0', '#ffd040', '#ff9020', '#e04010', '#8a1a08'];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var dy = (y - H / 2) / (H / 2);
      var len = 1 - x / W;   // cauda afina para a esquerda... (x=0 ponta)
      var t = x / W;
      var width = 0.25 + 0.75 * t;
      var n = TC.fbm2(x / 5 + f * 1.7, y / 4 - f * 0.9, 77, 3);
      var v = width - Math.abs(dy) - (1 - t) * 0.25 + (n - 0.5) * 0.7;
      if (v <= 0) continue;
      var k = TC.clamp(Math.floor((1 - v * 1.8) * 4 + (1 - t) * 1.5), 0, 4);
      pb.set(x, y, u32(cols[k]));
    }
    return pb.toCanvas();
  });

  /* ---------- CORVO ---------- */
  var CROW_PAL = { k: '#0c0a10', b: '#1e1a28', l: '#3a3450', y: '#c09030', e: '#ff3020' };
  ART.crow = {
    perch: TC.sprite([
      '..........kk....',
      '.........kbbk...',
      '........kbeby...',
      '.......kbbbbkyy.',
      '....kkkbbbbbk...',
      '..kkbbbllbbbk...',
      '.kbbbbllbbbbk...',
      'kbbbbbbbbbbk....',
      '.kkkkbbbbbk.....',
      '.....kkkkk......',
      '......y.y.......'
    ], CROW_PAL),
    fly: [TC.sprite([
      '..kk............',
      '.kbbk.......kk..',
      '.kbbbk.....kbbk.',
      '..kbbbk...kbeby.',
      '...kbbbkkkbbbkyy',
      '....kbbbbbbbbk..',
      '.....kkbbbbbk...',
      '.......kkkkk....'
    ], CROW_PAL), TC.sprite([
      '............kk..',
      '...........kbbk.',
      '..kkkkkkkkkbeby.',
      '.kbbbbbbbbbbbkyy',
      '..kkbbbbbbbbk...',
      '....kbbbbkkk....',
      '...kbbbk........',
      '..kbbk..........',
      '..kk............'
    ], CROW_PAL)]
  };

  /* ---------- CHEFE: O CICLOPE GIGANTE ---------- */
  ART.boss = (function () {
    function bossHead(eyeCol, open) {
      var W = 20, H = 24;
      var pb = new TC.PixBuf(W, H);
      var sk = u32('#1a2a20'), sh = u32('#0e1812'), hl = u32('#3a5a44');
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var dx = (x - 10) / 8, dy = (y - 10) / 11;
        if (dx * dx + dy * dy > 1) continue;
        pb.set(x, y, dx > 0.5 ? sh : (dx < -0.4 && dy < 0 ? hl : sk));
      }
      // olho único
      for (y = -4; y <= 4; y++) for (x = -4; x <= 4; x++) {
        var d = x * x + y * y;
        if (d <= 16) pb.set(11 + x, 9 + y, d <= 4 ? u32('#ffffff') : u32(eyeCol));
      }
      pb.rect(10, 8, 2, 3, u32('#0a2010'));
      // boca com dentes
      if (open) {
        pb.rect(6, 17, 10, 4, u32('#060a08'));
        for (x = 6; x < 16; x += 2) { pb.set(x, 17, u32('#d8e0c8')); pb.set(x + 1, 20, u32('#d8e0c8')); }
      } else {
        pb.rect(7, 18, 8, 1, u32('#060a08'));
      }
      outlinePB(pb, u32('#030604'));
      return pb.toCanvas();
    }
    var heads = { n: bossHead('#40ff70', false), o: bossHead('#a0ffb0', true), h: bossHead('#ff6040', true) };
    function wings(pb, sx, sy, pose) {
      var f = pose.wing || 0;  // -1..1 bater de asas
      var mem = u32('#0e1a14'), memL = u32('#1e3428'), bone = u32('#2a4434');
      [-1, 1].forEach(function (side) {
        var bx = sx + side * 4, by = sy + 4;
        var tipX = bx + side * 46, tipY = by - 20 - f * 22;
        var midX = bx + side * 26, midY = by - 30 - f * 12;
        var lowX = bx + side * 40, lowY = by + 18 - f * 10;
        polyPB(pb, [[bx, by], [midX, midY], [tipX, tipY], [lowX, lowY], [bx + side * 22, by + 26 - f * 4]], function (x, y) {
          return ((x + y) % 7 === 0) ? memL : mem;
        });
        thickPB(pb, bx, by, midX, midY, 3, function () { return bone; });
        thickPB(pb, midX, midY, tipX, tipY, 2, function () { return bone; });
        thickPB(pb, midX, midY, lowX, lowY, 1.5, function () { return bone; });
        thickPB(pb, midX, midY, bx + side * 22, by + 26 - f * 4, 1.5, function () { return bone; });
      });
    }
    var BOSS = {
      W: 120, H: 112, ox: 60, groundY: 108,
      thigh: 14, shin: 15, legT: 5, footH: 2, footL: 0, shinThin: 2,
      torso: 24, hipW: 8, shW: 14,
      upper: 15, fore: 15, armT: 4.5, claw: 6, foreThin: 1.5,
      head: function (pose) { return pose.hurtFace ? heads.h : pose.mouth ? heads.o : heads.n; },
      headOff: { x: -10, y: -21 },
      wings: wings,
      col: {
        pants: solid('#14201a'), pantsB: solid('#0a120e'),
        boot: solid('#14201a'), bootB: solid('#0a120e'),
        shirt: (function () { var a = u32('#14201a'), b = u32('#2a4434'), c = u32('#0a120e'); return function (x, y) { return (y % 4 === 0 && (x & 1)) ? b : ((x + y) % 11 === 0 ? c : a); }; })(),
        sleeve: solid('#14201a'), sleeveB: solid('#0a120e'),
        skin: solid('#14201a'), skinB: solid('#0a120e'),
        claw: solid('#c0d0b0'), clawB: solid('#708068'),
        outline: '#020403'
      }
    };
    function BP(o) { var p = P(o); p.wing = o.wing || 0; p.mouth = !!o.mouth; return p; }
    var out = {};
    out.hover = [-1, -0.3, 0.6, 1, 0.6, -0.3].map(function (w, k) {
      return renderFigure(BP({ wing: w, lean: 0.1, legF: [0.35, -0.6], legB: [0.05, -0.8], armF: [0.4 + w * 0.1, 0.7], armB: [0.1, 0.8], dy: Math.round(w * -2) }), BOSS);
    });
    out.swoop = [renderFigure(BP({ wing: 1, lean: 0.9, legF: [-0.6, -0.2], legB: [-0.9, -0.1], armF: [1.6, 0.1], armB: [1.3, 0.3], mouth: true }), BOSS)];
    out.cast = [renderFigure(BP({ wing: -0.6, lean: -0.15, legF: [0.3, -0.5], legB: [0.0, -0.7], armF: [2.6, 0.2], armB: [-2.4, -0.2], mouth: true }), BOSS)];
    out.hurt = [renderFigure(BP({ wing: 0.2, lean: -0.4, legF: [0.5, -0.7], legB: [0.2, -0.9], armF: [0.9, 1.0], armB: [-0.4, 1.2], hurtFace: true }), BOSS)];
    out.dead = [renderFigure(BP({ wing: -1, lean: -0.7, legF: [0.9, -1.4], legB: [0.6, -1.5], armF: [2.0, 0.4], armB: [-1.8, 0.3], hurtFace: true }), BOSS)];
    return out;
  })();

  /* ---------- itens ---------- */
  ART.items = {
    cuca: TC.sprite([
      '...kkkkkkkk...',
      '..kyYyYyYyYk..',
      '.kYyYyyYyYyYk.',
      'kccccccccccccck',
      'kppppppppppppk',
      'kccccccccccccck',
      'kCCCCCCCCCCCCk',
      '.kkkkkkkkkkkk.'
    ], { k: '#2a1810', y: '#f0d890', Y: '#d0a860', c: '#e8c070', C: '#b88a48', p: '#6a2a5a' }),
    linguica: TC.sprite([
      '...kkkkkkkk...',
      '.kkrrrrrrrrkk.',
      'krrRRRRRRRRrrk',
      'krRkkkkkkkkRrk',
      'krRk......kRrk',
      'krrkkkkkkkkrrk',
      '.krrrrrrrrrrk.',
      '..kkkkkkkkkk..'
    ], { k: '#2a0c08', r: '#b04a30', R: '#e07a58' }),
    chimarrao: TC.sprite([
      '......mm..',
      '.....mm...',
      '....mm....',
      '..kkmmkk..',
      '.kgggmggk.',
      '.kGGGGGGk.',
      'kbbbbbbbbk',
      'kbBbbbbbbk',
      'kbBbbbbbbk',
      'kbbbbbbbdk',
      '.kbbbbbdk.',
      '.kbbbbbdk.',
      '..kkkkkk..'
    ], { k: '#1a1008', m: '#d0d0d8', g: '#4a9a40', G: '#2a6a2a', b: '#8a5a30', B: '#b08050', d: '#5a3818' }),
    chopp: TC.sprite([
      '.kkkkkkkk...',
      'kwwWwwwWwk..',
      'kwwwwwwwwk..',
      'kyywyyyyyk..',
      'kyYyyyyyykkk',
      'kyYyyyyyyk.k',
      'kyYyoyyyyk.k',
      'kyYyyyyoyk.k',
      'kyYyyyyyyk.k',
      'kyYyyoyyykkk',
      'kyyyyyyyyk..',
      'kddddddddk..',
      '.kkkkkkkk...'
    ], { k: '#1a1008', w: '#f4eedc', W: '#ffffff', y: '#e0a020', Y: '#f8d060', o: '#fff0a0', d: '#a87018' }),
    bolinho: TC.sprite([
      '......m...',
      '.....m....',
      '..kkkmkk..',
      '.kcYcYcck.',
      'kcYcccYcdk',
      'kYccYcccdk',
      'kcYccccddk',
      '.kcddcddk.',
      '..kkkkkk..'
    ], { k: '#2a1406', c: '#d08a30', Y: '#f0c060', d: '#8a4a18', m: '#e8d8a8' }),
    medalha: TC.sprite([
      '...rr...',
      '...rr...',
      '..kkkk..',
      '.kyYYyk.',
      'kyYyyYyk',
      'kYyWWyYk',
      'kYyWWyYk',
      'kyYyyYyk',
      '.kyyyyk.',
      '..kkkk..'
    ], { k: '#3a2808', r: '#a03030', y: '#f0c040', Y: '#c08820', W: '#fff0b0' })
  };

  /* ---------- efeitos ---------- */
  ART.spark = [
    TC.sprite(['...w...', '...w...', '..wyw..', 'wwyYyww', '..wyw..', '...w...', '...w...'], { w: '#ffffff', y: '#ffe080', Y: '#ffffff' }),
    TC.sprite(['w..w..w', '.w.w.w.', '..yYy..', 'wwYYYww', '..yYy..', '.w.w.w.', 'w..w..w'], { w: '#ffe0a0', y: '#ffc040', Y: '#ffffff' }),
    TC.sprite(['w.....w', '.......', '...y...', '..y.y..', '...y...', '.......', 'w.....w'], { w: '#c08040', y: '#ff9040' })
  ];
  ART.dust = [
    TC.sprite(['.dd.', 'dDDd', '.dd.'], { d: '#8a8090', D: '#b0a8b8' }),
    TC.sprite(['.d..', 'd.Dd', '..d.'], { d: '#6a6070', D: '#8a8090' })
  ];

  /* ---------- retratos (40x40, procedurais) ---------- */
  function portraitBG(pb, top, bot) {
    for (var y = 0; y < 40; y++) for (var x = 0; x < 40; x++) pb.d[y * 40 + x] = u32(TC.mix(top, bot, y / 39));
  }
  function ellipseFill(pb, cx, cy, rx, ry, fn) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) { var c = fn(x, y, dx, dy); if (c) pb.set(x, y, c); }
    }
  }

  function arnoPortrait(face) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a1e40', '#06060f');
    var skin = '#e8aa76', skinS = '#b06e4a', skinD = '#7a4430', skinL = '#f6c898', stub = '#a8704c';
    var pl = plaid('#b03428', '#6a1e20', '#3a1418', '#d8624c');
    // ombros/camisa
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return pl(x, y); });
    ellipseFill(pb, 20, 34, 5, 3, function () { return u32('#d8d0c0'); });
    // pescoço
    pb.rect(16, 28, 8, 6, u32(skinS));
    // orelhas
    ellipseFill(pb, 9.5, 21, 2, 3, function () { return u32(skinS); });
    ellipseFill(pb, 30.5, 21, 2, 3, function () { return u32(skinD); });
    // rosto
    ellipseFill(pb, 20, 20, 10, 12, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      var c = l > 0.35 ? skinL : l > -0.25 ? skin : l > -0.6 ? skinS : skinD;
      if (dy > 0.35 && TC.hash2(x, y, 4) > 0.5 && !(face === 'shock' && dy > 0.6 && Math.abs(dx) < 0.25)) c = stub;
      return u32(c);
    });
    // costeletas/cabelo
    pb.rect(10, 15, 2, 6, u32('#3a2418')); pb.rect(28, 15, 2, 6, u32('#3a2418'));
    // boné
    ellipseFill(pb, 20, 13, 11.5, 9, function (x, y, dx, dy) {
      if (y > 14) return 0;
      var c = (dx < -0.3 && dy < -0.2) ? '#e06050' : dx > 0.45 ? '#7a2020' : '#c03a30';
      if (y === 14) c = '#7a2020';
      return u32(c);
    });
    // aba
    ellipseFill(pb, 21, 15.5, 13, 2.6, function (x, y, dx, dy) { return u32(dy < 0 ? '#5a1818' : '#3a0e0e'); });
    // emblema
    pb.rect(18, 8, 4, 3, u32('#e8e0c8')); pb.rect(19, 9, 2, 1, u32('#2a4a6a'));
    // sobrancelhas
    var by = face === 'shock' ? 17 : 18;
    if (face === 'hurt') { pb.line(13, 18, 17, 19, u32('#2a180e'), 1); pb.line(23, 19, 27, 18, u32('#2a180e'), 1); pb.line(13, 19, 17, 20, u32('#2a180e'), 1); pb.line(23, 20, 27, 19, u32('#2a180e'), 1); }
    else { pb.rect(13, by, 5, 2, u32('#2a180e')); pb.rect(23, by, 5, 2, u32('#2a180e')); }
    // olhos
    if (face === 'hurt') {
      pb.rect(14, 21, 4, 1, u32('#2a1a10')); pb.rect(23, 21, 4, 1, u32('#2a1a10'));
    } else if (face === 'shock') {
      pb.rect(14, 20, 4, 3, u32('#f0e8d8')); pb.rect(23, 20, 4, 3, u32('#f0e8d8'));
      pb.set(15, 21, u32('#1a1010')); pb.set(24, 21, u32('#1a1010'));
    } else {
      pb.rect(14, 21, 4, 2, u32('#e8e0d0')); pb.rect(23, 21, 4, 2, u32('#e8e0d0'));
      pb.rect(16, 21, 2, 2, u32('#3a2a1a')); pb.rect(24, 21, 2, 2, u32('#3a2a1a'));
      pb.rect(14, 23, 4, 1, u32(skinS)); pb.rect(23, 23, 4, 1, u32(skinS));
    }
    // nariz
    pb.rect(20, 21, 1, 5, u32(skinS)); pb.rect(19, 26, 3, 1, u32(skinD)); pb.set(21, 25, u32(skinD));
    // bigode farto
    for (var x = 13; x <= 27; x++) {
      var droop = Math.abs(x - 20) > 4 ? 1 : 0;
      var top = 27, bot = 29 + droop + (Math.abs(x - 20) > 6 ? 1 : 0);
      for (var y = top; y <= bot; y++) pb.set(x, y, u32((y === top && x < 20) ? '#6a4028' : '#4a2a18'));
    }
    // boca
    if (face === 'shock') { ellipseFill(pb, 20.5, 32, 2.5, 2, function () { return u32('#2a0a0a'); }); }
    else if (face === 'hurt') pb.rect(18, 31, 5, 1, u32('#4a1a14'));
    else pb.rect(18, 31, 5, 1, u32(skinD));
    // rugas (pés de galinha)
    if (face !== 'shock') { pb.set(12, 22, u32(skinS)); pb.set(11, 23, u32(skinS)); pb.set(28, 22, u32(skinD)); pb.set(29, 23, u32(skinD)); }
    return pb.toCanvas();
  }

  function fridaPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a1408', '#060302');
    var skin = '#d8a070', skinS = '#a0683e', skinD = '#6a3a20', skinL = '#f0c890';
    // xale escuro
    ellipseFill(pb, 20, 44, 19, 12, function (x, y) { return u32(((x + y) % 5 === 0) ? '#3a2a3a' : '#2a1e2a'); });
    pb.rect(16, 28, 8, 6, u32(skinS));
    // rosto (luz de vela de baixo)
    ellipseFill(pb, 20, 21, 9, 11, function (x, y, dx, dy) {
      var l = dy * 0.7 - Math.abs(dx) * 0.4 + 0.1;
      var c = l > 0.35 ? skinL : l > -0.1 ? skin : l > -0.45 ? skinS : skinD;
      return u32(c);
    });
    // lenço (headscarf)
    ellipseFill(pb, 20, 15, 12, 10, function (x, y, dx, dy) {
      if (y > 15 && Math.abs(dx) < 0.72) return 0;
      var c = dx > 0.4 ? '#3a2448' : '#5a3a6a';
      if ((x + y) % 6 === 0) c = '#7a5a8a';
      return u32(c);
    });
    // cabelo grisalho na testa
    for (var x = 14; x < 27; x++) if (x % 2) pb.set(x, 13, u32('#b0b0b8'));
    // olhos cansados
    pb.rect(14, 20, 4, 1, u32('#4a2a18')); pb.rect(23, 20, 4, 1, u32('#4a2a18'));
    pb.rect(15, 21, 3, 1, u32('#e0d0b8')); pb.rect(23, 21, 3, 1, u32('#e0d0b8'));
    pb.set(16, 21, u32('#2a1a10')); pb.set(24, 21, u32('#2a1a10'));
    pb.rect(14, 23, 4, 1, u32(skinS)); pb.rect(23, 23, 4, 1, u32(skinS));
    // rugas
    pb.set(12, 22, u32(skinD)); pb.set(28, 22, u32(skinD)); pb.rect(15, 27, 1, 3, u32(skinS)); pb.rect(25, 27, 1, 3, u32(skinS));
    pb.rect(20, 21, 1, 5, u32(skinS)); pb.rect(19, 26, 3, 1, u32(skinD));
    pb.rect(17, 30, 7, 1, u32(skinD));
    // brinco / terço
    pb.set(11, 25, u32('#e0c060'));
    return pb.toCanvas();
  }

  function radioPortrait(f) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#08140c', '#020403');
    pb.rect(3, 10, 34, 20, u32('#1a1a1e'));
    pb.rect(4, 11, 32, 1, u32('#3a3a44'));
    pb.rect(6, 14, 20, 9, u32('#0a2a14'));
    // dígitos 104.5 (LCD)
    var digits = TC.sprite([
      '.#..###.#.#...###',
      '##..#.#.#.#...#..',
      '.#..#.#.###...###',
      '.#..#.#...#.....#',
      '###.###...#.#.###'
    ], { '#': f % 2 ? '#60f090' : '#40c070' });
    var c = pb.toCanvas();
    c.ctx.drawImage(digits, 7, 17);
    pb = TC.bufFrom(c);
    for (var i = 0; i < 2; i++) ellipseFill(pb, 30, 18 + i * 0, 4, 4, function (x, y, dx, dy) { return u32(dx * dx + dy * dy < 0.3 ? '#5a5a66' : '#2e2e36'); });
    for (var x = 6; x < 34; x += 3) pb.rect(x, 25, 2, 3, u32('#2a2a30'));
    // estática
    var r = TC.RNG(f + 3);
    for (var s = 0; s < 70; s++) pb.set(r.int(0, 39), r.int(0, 39), u32(r() < 0.5 ? '#80f0a0' : '#ffffff'));
    return pb.toCanvas();
  }

  function voicePortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#0a0814', '#000000');
    ellipseFill(pb, 20, 44, 18, 12, function () { return u32('#050408'); });
    ellipseFill(pb, 20, 20, 10, 13, function () { return u32('#050408'); });
    ellipseFill(pb, 20, 14, 12, 10, function () { return u32('#09070e'); });
    pb.rect(15, 21, 2, 1, u32('#c0b0ff')); pb.rect(24, 21, 2, 1, u32('#c0b0ff'));
    return pb.toCanvas();
  }

  var PORTRAITS = {
    arno: { normal: arnoPortrait('normal'), shock: arnoPortrait('shock'), hurt: arnoPortrait('hurt') },
    frida: { normal: fridaPortrait() },
    radio: { normal: radioPortrait(0), alt: radioPortrait(1) },
    voice: { normal: voicePortrait() }
  };
  ART.portrait = function (who, face) {
    var p = PORTRAITS[who];
    if (!p) return null;
    if (who === 'radio') return (Math.floor(Date.now() / 90) % 2) ? p.alt : p.normal;
    return p[face || 'normal'] || p.normal;
  };
})();
