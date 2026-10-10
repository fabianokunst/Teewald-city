'use strict';
/* Teewald City — Capítulo 4: arte procedural (a Moça do Serão, os sapatos Modelo Hilde, os tamancos, a botina,
   o contramestre fantasma, O Couro; a vila operária, o portão com a estrela de neon, o curtume, o fulão, o caminhão
   na doca, o corte e a montagem, o balancim, as esteiras, o escritório do Gerhard, o pesponto e a sala de cola) */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline;
  var C4 = ART.ch4 = {};
  var H2 = TC.hash2;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      free: !!o.free, flare: o.flare || 0, needles: o.needles !== false, kneel: !!o.kneel, coat: o.coat, whistle: !!o.whistle, clip: o.clip !== false
    };
  }
  function ghostly(cv, col, amt) {
    var t = TC.tint(cv, col || '#c8d4ff', amt == null ? 0.38 : amt);
    t.ox = cv.ox; t.oy = cv.oy;
    if (cv.handX != null) { t.handX = cv.handX; t.handY = cv.handY; }
    return t;
  }
  function tile(fn) {
    var pb = new TC.PixBuf(16, 16);
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var c = fn(x, y);
      if (c) pb.d[y * 16 + x] = u32(c);
    }
    return pb.toCanvas();
  }

  /* ====================== A MOÇA DO SERÃO (Hilde Weber, 1948–1967) ======================
     Fantasma de guarda-pó de pespontadeira e avental queimado, lenço na cabeça, os olhos costurados com
     linha vermelha, a saia se desfazendo em fios e sem pés. Depois de livre, gente de novo, com o sapato vermelho. */
  var HP_GHOST = { w: '#d8d4e0', W: '#f4f0ff', h: '#2a2028', f: '#e8e4f0', F: '#b0aac0', x: '#d81818', k: '#2a1a2a', m: '#6a5a70', E: '#c8f0ff' };
  var HILDE_HEAD = TC.sprite([
    '...wwwwww....',
    '..wWwwwwwww..',
    '.wwwwwwwwwww.',
    '.whhhhfffhhw.',
    'whhffffffffw.',
    'whfxkxffxkxf.',
    '.hffxfffffxf.',
    '.hffffmfff...',
    '..hFFmFFF....',
    '..h.FFFF.....'
  ], HP_GHOST);
  var HILDE_HEAD_FREE = TC.sprite([
    '...wwwwww....',
    '..wWwwwwwww..',
    '.wwwwwwwwwww.',
    '.whhhhfffhhw.',
    'whhffffffffw.',
    'whfkEkffkEkf.',
    '.hffffffffff.',
    '.hffffmmff...',
    '..hFFFFFF....',
    '..h.FFFF.....'
  ], HP_GHOST);
  var HILDE_HEAD_HUMAN = TC.sprite([
    '....hhhhh....',
    '..hhhHhhhh...',
    '.hhhhhhhhhh..',
    '.hhhhfffhhh..',
    'hhhffffffffh.',
    'hhfkEkffkEkf.',
    '.hffffffffff.',
    '.rffffmmff...',
    '..rFFFFFF....',
    '...rFFFF.....'
  ], { h: '#6a3a1e', H: '#8a5a30', f: '#f0c8a8', F: '#c09078', k: '#3a2014', E: '#4a3020', m: '#c04050', r: '#c02020' });

  function hildeSpec(human) {
    var dress = human ? '#6a8ab0' : '#a8b4cc', dressD = human ? '#4a6a90' : '#7a86a0';
    var S = {
      W: 72, H: 92, ox: 34, groundY: 88,
      thigh: 12, shin: 12, legT: 5, footH: 2, footL: 4, shinThin: 1,
      torso: 15, hipW: 8, shW: 11,
      upper: 9, fore: 8, armT: 3.2, fist: 2.6, foreThin: 0.4,
      head: function (pose) { return human ? HILDE_HEAD_HUMAN : pose.free ? HILDE_HEAD_FREE : HILDE_HEAD; },
      headOff: { x: -6, y: -10 },
      col: {
        pants: solid(human ? '#f0c8a8' : dress), pantsB: solid(human ? '#c09078' : dressD),
        boot: solid(human ? '#c81818' : dress), bootB: solid(human ? '#901010' : dressD),
        shirt: solid(dress), sleeve: solid(dress), sleeveB: solid(dressD),
        skin: solid(human ? '#f0c8a8' : '#e8e4f0'), skinB: solid(human ? '#c09078' : '#b0aac0'), outline: '#100c18'
      },
      after: function (pb, info, pose) {
        var hx = info.hx, hy = info.hy;
        var bottom = human ? hy + 14 : S.groundY - 9;
        var flare = pose.flare || 0;
        if (pose.kneel) bottom = S.groundY - 1;
        // saia do guarda-pó
        poly(pb, [[hx - 6, hy - 3], [hx + 6, hy - 3], [hx + 10 + flare, bottom], [hx - 10 - flare, bottom]], function (x, y) { return (x + (y >> 2)) % 6 === 0 ? u32(dressD) : u32(dress); });
        // avental (queimado no fantasma)
        poly(pb, [[hx - 1, hy - 2], [hx + 6, hy - 2], [hx + 8 + flare, bottom - 2], [hx - 1, bottom - 2]], function (x, y) {
          if (!human && H2(x, y, 67) > 0.82) return u32('#3a2e34');
          if (!human && y > bottom - 9 && H2(x >> 1, y >> 1, 68) > 0.6) return u32('#6a5a60');
          return u32(human ? '#f0ece4' : '#e0dce8');
        });
        thick(pb, info.sx - 2, info.sy + 1, info.sx + 5, hy - 3, 1, solid(human ? '#f0ece4' : '#e0dce8'));
        if (!human && !pose.kneel) {
          // sem pés: o que passa da barra vira fios soltos
          for (var y = bottom + 1; y < S.H; y++) for (var x = 0; x < S.W; x++) pb.d[y * S.W + x] = 0;
          for (var k = 0; k < 9; k++) {
            var fx = hx - 9 - flare + k * (18 + flare * 2) / 8, len = 3 + Math.round(H2(k, 3, 69) * 9);
            for (var j = 0; j < len; j++) pb.set(Math.round(fx + Math.sin(j * 0.7 + k) * 1), bottom + 1 + j, u32(j > len - 3 ? '#8a90b0' : dress));
          }
          // a linha vermelha solta de um dos fios
          for (j = 0; j < 7; j++) pb.set(hx + 3 + Math.round(Math.sin(j) * 1), bottom + 1 + j, u32('#d81818'));
        }
        // dedos de agulha
        if (!human && pose.needles && info.hand) {
          var a = pose.armF[0] + pose.armF[1];
          for (var q = -1; q <= 1; q++) {
            var ca = a + q * 0.3;
            thick(pb, info.hand.x, info.hand.y, info.hand.x + Math.sin(ca) * 6, info.hand.y + Math.cos(ca) * 6, 1, solid('#e8ecf8'));
          }
        }
      }
    };
    return S;
  }
  function buildHilde() {
    var R = ART.renderFigure, G = hildeSpec(false), Hm = hildeSpec(true), out = {};
    function g(o) { return ghostly(R(P(o), G), '#c8d4ff', 0.3); }
    function h(o) { return R(P(o), Hm); }
    out.float = [g({ lean: 0.02, armF: [0.3, 0.4], armB: [-0.1, 0.3] }), g({ lean: 0.04, breath: 1, armF: [0.35, 0.35], armB: [-0.05, 0.3], flare: 1 })];
    out.sew = [g({ lean: 0.22, armF: [1.1, 0.9], armB: [0.9, 1.0], needles: false }), g({ lean: 0.24, armF: [1.2, 0.8], armB: [0.95, 0.95], needles: false })];
    out.point = [g({ lean: 0.4, armF: [0.5, 0.25], armB: [0.1, 0.4] })];
    out.throw = [g({ lean: 0.3, armF: [1.75, 0.0], armB: [-0.5, 0.4] })];
    out.raise = [g({ lean: -0.05, armF: [2.9, 0.1], armB: [2.7, -0.1], flare: 2 })];
    out.burn = [g({ lean: -0.15, armF: [2.4, 0.7], armB: [2.2, 0.8], flare: 3 }), g({ lean: -0.18, armF: [2.6, 0.5], armB: [2.0, 0.9], flare: 2 })];
    out.spit = [g({ lean: 0.15, armF: [0.9, 1.4], armB: [0.7, 1.5] })];
    out.hurt = [g({ lean: -0.4, armF: [0.9, 1.0], armB: [-0.4, 1.2], flare: 2 })];
    out.kneel = [g({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.9, 1.5], armB: [0.7, 1.6], kneel: true, needles: false })];
    out.free = [g({ lean: 0.02, armF: [0.3, 0.4], armB: [-0.1, 0.3], free: true, needles: false }), g({ lean: 0.04, breath: 1, armF: [0.35, 0.35], armB: [-0.05, 0.3], free: true, needles: false, flare: 1 })];
    out.freeKneel = [g({ lean: 0.3, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [1.2, 0.6], armB: [1.0, 0.7], kneel: true, free: true, needles: false })];
    out.human = [h({ lean: 0.03 }), h({ lean: 0.03, breath: 1 })];
    out.walk = [];
    for (var i = 0; i < 8; i++) {
      var q = i / 8 * TC.TAU;
      out.walk.push(h({ lean: 0.1, legF: [0.4 * Math.sin(q), -(0.08 + 0.5 * Math.max(0, Math.cos(q)))], legB: [0.4 * Math.sin(q + Math.PI), -(0.08 + 0.5 * Math.max(0, Math.cos(q + Math.PI)))], armF: [-0.3 * Math.sin(q) + 0.1, 0.5], armB: [0.3 * Math.sin(q) + 0.1, 0.5] }));
    }
    out.dance = [h({ lean: -0.05, armF: [2.6, 0.4], armB: [0.9, 0.9], legF: [0.35, -0.3], flare: 2 }), h({ lean: 0.08, armF: [2.4, -0.3], armB: [1.1, 0.7], legB: [-0.3, -0.4], flare: 3 })];
    out.human.ox = out.human[0].ox;
    return out;
  }

  /* ====================== SAPATOS SEM DONO ======================
     O Modelo Hilde (escarpim vermelho com tirinha), os tamancos de colono e a botina de bico de aço. Olham para a direita. */
  function drawPump(c, x, y, col, colD, lift, tilt) {
    c.save();
    c.translate(Math.round(x), Math.round(y - lift));
    if (tilt) c.rotate(tilt);
    c.fillStyle = TC.col('#140808');
    TC.fillPoly(c, [[-1, 1], [13, 1], [14, -1], [11, -3], [6, -3], [3, -7], [0, -7], [-1, -6]]);
    c.fillStyle = TC.col(col);
    TC.fillPoly(c, [[0, 0], [12, 0], [13, -1], [10, -2], [6, -2], [3, -6], [0, -6]]);
    c.fillStyle = TC.col(colD); c.fillRect(1, -5, 2, 4);
    c.fillStyle = TC.col('#f0a0a0'); c.fillRect(8, -2, 3, 1);
    c.fillStyle = TC.col('#2a0c0c'); c.fillRect(4, -5, 4, 1);   // a boca do sapato (o vazio onde ia o pé)
    c.fillStyle = TC.col(col); c.fillRect(3, -8, 4, 1);           // a tirinha
    c.fillStyle = TC.col('#140808'); c.fillRect(0, 1, 2, 4); c.fillStyle = TC.col(colD); c.fillRect(0, 1, 1, 4);   // salto
    c.restore();
  }
  function drawClog(c, x, y, lift, tilt) {
    c.save();
    c.translate(Math.round(x), Math.round(y - lift));
    if (tilt) c.rotate(tilt);
    c.fillStyle = TC.col('#1a100a'); c.fillRect(-1, -4, 16, 6);
    c.fillStyle = TC.col('#a07040'); c.fillRect(0, -3, 14, 4);
    c.fillStyle = TC.col('#c89058'); c.fillRect(0, -3, 14, 1);
    c.fillStyle = TC.col('#6a4424'); c.fillRect(0, 0, 14, 1);
    c.fillStyle = TC.col('#3a2010'); TC.fillPoly(c, [[6, -3], [13, -3], [12, -8], [7, -8]]);
    c.fillStyle = TC.col('#5a3418'); c.fillRect(8, -7, 3, 3);
    c.restore();
  }
  function buildShoes() {
    var out = { walk: [], kick: null, hurt: null, clog: [], clogHop: null, clogHurt: null };
    for (var f = 0; f < 4; f++) {
      var cv = TC.canvas(28, 18), c = cv.ctx;
      var a = f % 2 ? 3 : 0, b = f % 2 ? 0 : 3;
      drawPump(c, 4 + (f % 2 ? 0 : 2), 15, '#8a1414', '#5a0c0c', b, 0);
      drawPump(c, 9 + (f % 2 ? 2 : 0), 16, '#c82020', '#8a1414', a, 0);
      cv.ox = 14; cv.oy = 17; out.walk.push(cv);
    }
    var k = TC.canvas(28, 18);
    drawPump(k.ctx, 4, 16, '#8a1414', '#5a0c0c', 0, 0);
    drawPump(k.ctx, 12, 14, '#c82020', '#8a1414', 3, -0.5);
    k.ox = 14; k.oy = 17; out.kick = k;
    var hu = TC.canvas(28, 18);
    drawPump(hu.ctx, 6, 16, '#8a1414', '#5a0c0c', 0, 0.3);
    drawPump(hu.ctx, 11, 16, '#c82020', '#8a1414', 2, 0.4);
    hu.ox = 14; hu.oy = 17; out.hurt = hu;
    for (f = 0; f < 4; f++) {
      var cc = TC.canvas(30, 16);
      drawClog(cc.ctx, 3 + (f % 2 ? 0 : 1), 14, f === 1 ? 4 : 0, 0);
      drawClog(cc.ctx, 11 + (f % 2 ? 1 : 0), 15, f === 3 ? 4 : 0, 0);
      cc.ox = 15; cc.oy = 15; out.clog.push(cc);
    }
    var ch = TC.canvas(30, 16);
    drawClog(ch.ctx, 4, 12, 0, -0.3); drawClog(ch.ctx, 12, 12, 0, -0.3);
    ch.ox = 15; ch.oy = 15; out.clogHop = ch;
    out.clogHurt = TC.tint(ch, '#ffffff', 0.4); out.clogHurt.ox = 15; out.clogHurt.oy = 15;
    return out;
  }
  // a botina possuída: cano com cadarço, bico de aço, dois ilhoses acesos como olhos e a lingueta feito língua
  function buildBoot() {
    function frame(sq, eye, open, tilt) {
      var W = 30, Hh = 30, cv = TC.canvas(W, Hh), c = cv.ctx;
      c.save();
      c.translate(15, 29);
      c.scale(1 + sq * 0.12, 1 - sq * 0.12);
      if (tilt) c.rotate(tilt);
      c.fillStyle = TC.col('#08080a');
      TC.fillPoly(c, [[-9, 0], [12, 0], [13, -3], [11, -7], [3, -9], [2, -24], [-8, -24], [-9, -8]]);
      c.fillStyle = TC.col('#2a2420');
      TC.fillPoly(c, [[-8, -1], [11, -1], [12, -3], [10, -6], [2, -8], [1, -23], [-7, -23], [-8, -8]]);
      c.fillStyle = TC.col('#3e3630'); c.fillRect(-6, -22, 2, 14);
      c.fillStyle = TC.col('#8a8a96'); TC.fillPoly(c, [[6, -7], [11, -6], [12, -3], [8, -2]]);   // bico de aço
      c.fillStyle = TC.col('#c8c8d0'); c.fillRect(9, -6, 1, 1);
      c.fillStyle = TC.col('#5a3a20'); c.fillRect(-9, -2, 22, 2);                                  // sola
      c.fillStyle = TC.col('#d8c8a0');
      for (var i = 0; i < 4; i++) c.fillRect(-2, -21 + i * 4, 4, 1);                                // cadarço
      // olhos (ilhoses)
      c.fillStyle = TC.col(eye); c.fillRect(-3, -14, 2, 2); c.fillRect(1, -14, 2, 2);
      // a lingueta
      c.fillStyle = TC.col('#6a2020');
      if (open) TC.fillPoly(c, [[-4, -24], [3, -24], [5, -29], [-1, -27]]);
      else c.fillRect(-4, -25, 7, 2);
      c.restore();
      cv.ox = 15; cv.oy = 29;
      return cv;
    }
    return {
      idle: [frame(0, '#ffb030', false), frame(0.15, '#ffb030', false)],
      hop: [frame(-0.25, '#ffb030', true, -0.1)],
      squat: [frame(0.4, '#ff5020', true)],
      stomp: [frame(0.5, '#ff3010', true)],
      hurt: [frame(0, '#ffffff', true, 0.25)]
    };
  }

  /* ====================== O CONTRAMESTRE (fantasma) ======================
     Guarda-pó cinza, boné, bigode, prancheta e cronômetro pendurado no pescoço. */
  var FOREMAN_HEAD = TC.sprite([
    '...cccc....',
    '..cCccccc..',
    'bbbbbbbb...',
    '..fffffff..',
    '..ffffEff..',
    '.hfffffff..',
    '..fMMMMMf..',
    '...FFFF....'
  ], { c: '#3a3a44', C: '#5a5a66', b: '#24242a', f: '#c8c0b8', F: '#948c84', E: '#ffe060', M: '#2a2a30', h: '#3a3a40' });
  function buildForeman() {
    var S = {
      W: 60, H: 60, ox: 28, groundY: 57,
      thigh: 7, shin: 7, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 7, shW: 9,
      upper: 6, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: FOREMAN_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#3a3a44'), pantsB: solid('#26262e'), boot: solid('#1a1410'), bootB: solid('#100c08'),
        shirt: solid('#8a8a92'), sleeve: solid('#8a8a92'), sleeveB: solid('#5a5a62'), skin: solid('#c8c0b8'), skinB: solid('#948c84'), outline: '#0a0a0e'
      },
      after: function (pb, info, pose) {
        // o guarda-pó até os joelhos
        poly(pb, [[info.hx - 5, info.hy - 4], [info.hx + 5, info.hy - 4], [info.hx + 7, info.hy + 8], [info.hx - 7, info.hy + 8]], function (x) { return x % 5 === 0 ? u32('#6a6a72') : u32('#8a8a92'); });
        // o cronômetro pendurado no peito
        pb.rect(Math.round(info.sx), Math.round(info.sy + 4), 3, 3, u32('#d8d8e0'));
        pb.set(Math.round(info.sx + 1), Math.round(info.sy + 5), u32('#2a2a30'));
        // a prancheta na mão
        if (pose.clip && info.hand) pb.rect(Math.round(info.hand.x - 2), Math.round(info.hand.y - 3), 5, 7, u32('#b89060'));
        if (pose.clip && info.hand) pb.rect(Math.round(info.hand.x - 1), Math.round(info.hand.y - 2), 3, 5, u32('#f0ece0'));
        if (pose.whistle) pb.rect(Math.round(info.sx + 4), Math.round(info.sy - 4), 3, 2, u32('#d8d8e0'));
      }
    };
    var R = ART.renderFigure, out = {};
    function F(o) { return ghostly(R(P(o), S), '#b8c4e0', 0.32); }
    out.idle = [F({ lean: 0.04, armF: [0.6, 1.0] }), F({ lean: 0.05, breath: 1, armF: [0.65, 0.95] })];
    out.walk = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.walk.push(F({ lean: 0.12, legF: [0.4 * Math.sin(q), -(0.1 + 0.6 * Math.max(0, Math.cos(q)))], legB: [0.4 * Math.sin(q + Math.PI), -(0.1 + 0.6 * Math.max(0, Math.cos(q + Math.PI)))], armF: [0.6, 1.0], armB: [0.3 * Math.sin(q), 0.5] }));
    }
    out.whistle = [F({ lean: -0.1, armF: [1.6, 1.4], armB: [-0.2, 0.4], whistle: true, clip: false })];
    out.windup = [F({ lean: -0.25, armF: [2.8, 0.3], armB: [0.2, 0.5], clip: false, legF: [0.3, -0.1], legB: [-0.3, -0.1] })];
    out.throw = [F({ lean: 0.4, armF: [1.5, 0.0], armB: [-0.4, 0.4], clip: false, legF: [0.45, -0.15], legB: [-0.4, -0.05] })];
    out.hurt = [F({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], clip: false })];
    out.lie = (function () {
      var s = R(P({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], clip: false }), S);
      var rot = TC.rotate(s, -Math.PI / 2);
      var cv = TC.canvas(60, 56);
      cv.ctx.drawImage(rot, Math.round(30 - rot.width / 2), 56 - Math.round(rot.height / 2) - 10);
      cv.ox = 30; cv.oy = 55;
      return [ghostly(cv, '#b8c4e0', 0.32)];
    })();
    return out;
  }

  /* ====================== O COURO ======================
     Um couro de boi inteiro, curtido no tanino, com a marca da estância a fogo, que se solta do tanque e voa feito
     arraia (a lenda do Cuero, o couro vivo dos lagos do sul). Quadros gerados ondulando a borda. */
  function buildCouro() {
    var W = 92, Hh = 46;
    // contorno do couro estendido, visto meio de cima: pescoço na frente (direita), duas abas de pata de cada lado, rabo atrás
    var OUT = [[0.98, 0], [0.86, -0.22], [0.7, -0.3], [0.62, -0.62], [0.5, -0.66], [0.46, -0.38], [0.1, -0.42], [-0.3, -0.4], [-0.5, -0.46], [-0.58, -0.86], [-0.72, -0.8], [-0.74, -0.36], [-0.98, -0.06],
      [-0.98, 0.06], [-0.74, 0.36], [-0.72, 0.8], [-0.58, 0.86], [-0.5, 0.46], [-0.3, 0.4], [0.1, 0.42], [0.46, 0.38], [0.5, 0.66], [0.62, 0.62], [0.7, 0.3], [0.86, 0.22]];
    function frame(ph, curl, eyeCol) {
      var cv = TC.canvas(W, Hh), c = cv.ctx;
      var cx = W / 2, cy = Hh / 2, sx = W / 2 - 4, sy = 14 * (1 - curl * 0.7);
      function pt(p) { var x = cx + p[0] * sx * (1 - curl * 0.35); return [x, cy + p[1] * sy + Math.sin(p[0] * 3.2 + ph) * 5 * (1 - curl) + p[1] * Math.cos(ph) * 2]; }
      var pts = OUT.map(pt);
      c.fillStyle = TC.col('#140804'); TC.fillPoly(c, pts.map(function (q) { return [q[0] + (q[0] > cx ? 1 : -1), q[1] + (q[1] > cy ? 1 : -1)]; }));
      c.fillStyle = TC.col('#6a3a22'); TC.fillPoly(c, pts);
      // pelagem: manchas mais escuras e o lombo claro no meio
      for (var k = 0; k < 60; k++) {
        var px = 6 + H2(k, 1, 77) * (W - 12), py = cy + (H2(k, 2, 77) - 0.5) * sy * 1.3 + Math.sin(((px - cx) / sx) * 3.2 + ph) * 5 * (1 - curl);
        c.fillStyle = TC.col(H2(k, 3, 77) > 0.6 ? '#4a2414' : '#8a5232');
        c.fillRect(Math.round(px), Math.round(py), 2 + (k % 3), 1);
      }
      for (var x = 8; x < W - 14; x++) { var yy = cy + Math.sin(((x - cx) / sx) * 3.2 + ph) * 5 * (1 - curl); c.fillStyle = TC.col('#7e4a2c'); c.fillRect(x, Math.round(yy), 1, 1); }
      // a marca da estância a fogo: um M com estrela
      var mx = Math.round(cx - 4), my = Math.round(cy - 2 + Math.sin(-0.4 + ph) * 5 * (1 - curl));
      c.fillStyle = TC.col('#1a0a04');
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1], [2, 2], [3, 1], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]].forEach(function (q) { c.fillRect(mx - 3 + q[0], my + q[1], 1, 1); });
      [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [4, 2], [1, 3], [3, 3]].forEach(function (q) { c.fillRect(mx + 4 + q[0], my + q[1], 1, 1); });
      // furos de prego na borda e os olhos no pescoço
      c.fillStyle = TC.col('#0a0402');
      [3, 6, 9, 15, 18, 21].forEach(function (i) { var q = pts[i]; c.fillRect(Math.round(q[0] + (cx - q[0]) * 0.08), Math.round(q[1] + (cy - q[1]) * 0.18), 1, 1); });
      var e = pt([0.84, -0.06]);
      c.fillStyle = TC.col(eyeCol); c.fillRect(Math.round(e[0]) - 2, Math.round(e[1]) - 1, 2, 2); c.fillRect(Math.round(e[0]) + 2, Math.round(e[1]), 2, 2);
      cv.ox = W / 2; cv.oy = Hh / 2 + 6;
      return cv;
    }
    var out = { fly: [], wrap: [], hurt: [] };
    for (var i = 0; i < 6; i++) out.fly.push(frame(i / 6 * TC.TAU, 0, '#ffd030'));
    out.wrap = [frame(0, 0.75, '#ff6020'), frame(1, 0.8, '#ff6020')];
    out.hurt = [TC.tint(frame(0.5, 0.2, '#ffffff'), '#ffffff', 0.4)];
    out.hurt[0].ox = W / 2; out.hurt[0].oy = Hh / 2 + 6;
    out.dive = [frame(0, 0.35, '#ff3010')];
    return out;
  }

  /* ====================== PROJÉTEIS E ITENS ====================== */
  C4.last = TC.sprite([
    '....kkkkkk..',
    '..kkwWwwwwk.',
    '.kwwwwwwwwwk',
    'kwwwwwwwwwk.',
    'kwwdwwwwkk..',
    '.kkkkkkk....'
  ], { k: '#2a1408', w: '#b07a44', W: '#d8a060', d: '#6a4020' });
  function buildItems() {
    ART.items.chave = TC.sprite([
      '..kkk.......',
      '.kyYyk......',
      'kyk.kykkkkkk',
      'kyk.kyyyyyyk',
      '.kyyk.kk.kyk',
      '..kk.....kk.'
    ], { k: '#2a1a08', y: '#d8b040', Y: '#fff0a0' });
    ART.items.sapatos = (function () {
      var cv = TC.canvas(18, 11);
      drawPump(cv.ctx, 1, 9, '#8a1414', '#5a0c0c', 0, 0);
      drawPump(cv.ctx, 4, 10, '#d82020', '#8a1414', 0, 0);
      return cv;
    })();
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
  function hildePortrait(mode) {
    var pb = new TC.PixBuf(40, 40);
    var human = mode === 'human';
    portraitBG(pb, human ? '#3a2418' : mode === 'free' ? '#1a2440' : '#200c18', '#000000');
    var skin = human ? ['#f0c8a8', '#d0a088', '#a07060', '#fff0e0'] : ['#e8e4f0', '#c0bad0', '#8a84a0', '#ffffff'];
    ellipseFill(pb, 20, 44, 18, 11, function (x, y) { return u32(human ? '#6a8ab0' : '#a8b4cc'); });
    pb.rect(13, 33, 14, 7, u32(human ? '#f0ece4' : '#e0dce8'));
    pb.rect(16, 28, 8, 6, u32(skin[1]));
    ellipseFill(pb, 20, 21, 9, 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? skin[3] : l > -0.25 ? skin[0] : l > -0.6 ? skin[1] : skin[2]);
    });
    if (human) {
      ellipseFill(pb, 20, 13, 12, 8, function (x, y, dx, dy) { return dy > 0.5 && Math.abs(dx) < 0.7 ? 0 : u32((x + y) % 5 === 0 ? '#8a5a30' : '#6a3a1e'); });
      pb.rect(28, 10, 3, 3, u32('#c02020'));
    } else {
      // lenço branco e cabelo escuro escapando
      ellipseFill(pb, 20, 12, 11, 6, function (x, y, dx, dy) { return dy > 0.3 ? 0 : u32(dx > 0.4 ? '#a8a4b4' : (x * 2 + y) % 7 === 0 ? '#c0bcc8' : '#d8d4e2'); }); pb.rect(29, 12, 4, 3, u32('#c0bcc8')); pb.rect(31, 15, 2, 4, u32('#a8a4b4')); pb.rect(12, 14, 16, 2, u32('#2a2028'));
      pb.rect(11, 15, 3, 9, u32('#2a2028')); pb.rect(26, 15, 3, 9, u32('#2a2028'));
      // fuligem no rosto
      for (var k = 0; k < 18; k++) pb.set(12 + Math.floor(H2(k, 1, 5) * 16), 22 + Math.floor(H2(k, 2, 5) * 9), u32('#6a6070'));
    }
    if (mode === 'normal') {
      // olhos costurados com linha vermelha
      [[13, 20], [22, 20]].forEach(function (e) {
        pb.rect(e[0], e[1] + 1, 6, 1, u32('#3a2a3a'));
        for (var s = 0; s < 3; s++) { pb.set(e[0] + 1 + s * 2, e[1], u32('#e01818')); pb.set(e[0] + 1 + s * 2, e[1] + 2, u32('#e01818')); pb.set(e[0] + 1 + s * 2, e[1] + 1, u32('#ff6060')); }
      });
      pb.rect(17, 29, 7, 1, u32('#5a4a60'));
    } else {
      [[14, 20], [23, 20]].forEach(function (e) {
        pb.rect(e[0], e[1], 4, 2, u32(human ? '#f8f8f8' : '#d8e8ff'));
        pb.rect(e[0] + 1, e[1], 2, 2, u32(human ? '#4a3020' : '#4a6aa0'));
      });
      pb.rect(17, 29, 7, 1, u32(human ? '#c04050' : '#7a6a80'));
      pb.set(16, 28, u32(human ? '#c04050' : '#7a6a80')); pb.set(24, 28, u32(human ? '#c04050' : '#7a6a80'));
    }
    pb.rect(20, 21, 1, 5, u32(skin[1]));
    return pb.toCanvas();
  }

  /* ====================== AMBIENTE ====================== */
  C4.tiles = function () {
    var T = {};
    // concreto do pátio do curtume, manchado de tanino
    T.yardTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#9a948c';
        if (y === 1) return '#6a645c';
        if (y < 7) { var n = H2(xx, y, 140); return H2(xx >> 2, y >> 1, 141) > 0.82 ? '#5a2e1c' : n > 0.8 ? '#58524c' : '#4a4640'; }
        if (y === 7) return '#2a2622';
        var n2 = H2(xx, y, 142);
        return (xx % 16 === 0) ? '#1e1a18' : n2 > 0.85 ? '#3a3632' : '#2e2a26';
      });
    });
    T.yard = [0, 1].map(function (v) { return tile(function (x, y) { var n = H2(x + v * 16, y, 143); return (x === 0 && v === 0) ? '#1e1a18' : n > 0.85 ? '#3a3632' : '#2e2a26'; }); });
    // piso da fábrica: cimento queimado com a faixa amarela de segurança
    T.floorTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#a8a8b0';
        if (y === 1) return '#7a7a84';
        if (y === 2 || y === 3) return ((xx >> 2) % 2) ? '#d8b030' : '#1a1a1e';
        if (y < 8) return H2(xx, y, 150) > 0.85 ? '#5a5a62' : '#4a4a52';
        if (y === 8) return '#2a2a30';
        return H2(xx, y, 151) > 0.88 ? '#38383e' : '#2e2e34';
      });
    });
    T.floor = [0, 1].map(function (v) { return tile(function (x, y) { return H2(x + v * 16, y, 152) > 0.88 ? '#38383e' : '#2e2e34'; }); });
    // assoalho de pinho do pesponto, com mancha de óleo de máquina
    T.woodTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#d8b080';
        if (y < 6) {
          if (xx % 8 === 7) return '#4a2c18';
          if (H2(xx >> 3, 1, 160) > 0.7 && y > 2) return '#5a3820';
          return (H2(xx >> 3, y, 161) > 0.5) ? '#a87a4a' : '#986a3c';
        }
        if (y === 6) return '#3a2214';
        return y % 5 === 0 ? '#20140c' : '#2a1a10';
      });
    });
    T.wood = tile(function (x, y) { return y % 5 === 0 ? '#20140c' : '#2a1a10'; });
    // o tanque de tanino (substitui a água animada)
    T.tannin = [0, 1, 2, 3].map(function (f) {
      return tile(function (x, y) {
        if (y < 3) return null;
        if (y === 3) return ((x + f * 2) % 8 < 3) ? '#c87a4a' : '#7a3a1c';
        var n = Math.sin((x + f * 4) * 0.8 + y * 1.3);
        return n > 0.85 ? '#8a4422' : y > 10 ? '#2a0e06' : '#4a1c0c';
      });
    });
    // grade de passarela de ferro (plataformas)
    T.grate = [0, 1].map(function (v) {
      return tile(function (x, y) {
        if (y === 0) return '#9a9aa6';
        if (y === 1) return '#5a5a66';
        if (y < 5) return (x + v) % 4 === 0 ? '#4a4a56' : null;
        if (y === 5) return '#3a3a44';
        return null;
      });
    });
    return T;
  };

  /* casa geminada da vila operária: reboco claro, telhado de barro, porta aberta, janela apagada */
  C4.rowHouse = function (seed, w) {
    var r = TC.RNG(seed), W = w || 80, Hh = 84;
    var cv = TC.canvas(W, Hh), c = cv.ctx;
    var walls = [['#c8c0a8', '#a8a088'], ['#b8c8b0', '#98a890'], ['#d8b8b0', '#b89890'], ['#c8c8d0', '#a8a8b0']];
    var wc = walls[r.int(0, walls.length - 1)];
    var roofY = 30;
    // telhado de barro (meia-água para a rua)
    for (var y = 6; y < roofY; y++) {
      var inset = Math.round((roofY - y) * 0.25);
      for (var x = inset; x < W - inset; x++) {
        c.fillStyle = TC.col(((x + (y >> 2) * 3) % 6 === 0 || y % 4 === 3) ? '#4a2418' : (y < 10 ? '#7a3a28' : '#8a4630'));
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = TC.col('#2a1410'); c.fillRect(0, roofY, W, 2);
    // chaminé de tijolo
    var chx = r.int(10, W - 20);
    c.fillStyle = TC.col('#6a3424'); c.fillRect(chx, 0, 7, 12);
    c.fillStyle = TC.col('#4a2418'); c.fillRect(chx, 0, 7, 2);
    // parede
    for (y = roofY + 2; y < Hh; y++) for (x = 0; x < W; x++) {
      var n = H2(x, y, seed);
      c.fillStyle = TC.col(n > 0.94 ? wc[1] : (y > Hh - 8 ? '#6a6458' : wc[0]));
      c.fillRect(x, y, 1, 1);
    }
    // marca de umidade embaixo
    for (x = 0; x < W; x++) { var dh = 2 + Math.round(H2(x >> 2, 9, seed) * 6); c.fillStyle = TC.col('#7a7262'); c.fillRect(x, Hh - 8 - dh, 1, dh); }
    // porta aberta (escuro lá dentro)
    var dx = r.int(8, W - 30);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(dx - 1, Hh - 36, 16, 36);
    c.fillStyle = TC.col('#050404'); c.fillRect(dx, Hh - 35, 14, 35);
    c.fillStyle = TC.col('#5a3a24'); c.fillRect(dx + 14, Hh - 35, 4, 35);   // a folha aberta
    c.fillStyle = TC.col('#3a2414'); c.fillRect(dx + 14, Hh - 35, 1, 35);
    // janela com cortina (apagada)
    var wx = dx < W / 2 ? W - 26 : 8;
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(wx - 1, Hh - 50, 18, 20);
    c.fillStyle = TC.col('#141a2a'); c.fillRect(wx, Hh - 49, 16, 18);
    c.fillStyle = TC.col('#8a6a7a'); c.fillRect(wx, Hh - 49, 5, 18); c.fillRect(wx + 11, Hh - 49, 5, 18);
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(wx + 7, Hh - 49, 1, 18); c.fillRect(wx, Hh - 41, 16, 1);
    // número da casa
    c.fillStyle = TC.col('#2a4a7a'); c.fillRect(dx + 2, Hh - 44, 9, 6);
    TC.font.draw(c, String(10 + (seed % 89)), dx + 6, Hh - 44, '#e8e8f0', { align: 'center' });
    cv.doorX = dx + 7;
    return cv;
  };
  /* o boteco da vila: porta de ferro meio aberta, balcão, a TV esquecida ligada e mesinhas na calçada */
  C4.boteco = function () {
    var W = 104, Hh = 92, cv = TC.canvas(W, Hh), c = cv.ctx;
    for (var y = 20; y < Hh; y++) for (var x = 0; x < W; x++) { c.fillStyle = TC.col(y > Hh - 10 ? '#5a5448' : (H2(x, y, 31) > 0.95 ? '#8aa0a0' : '#a8c0b8')); c.fillRect(x, y, 1, 1); }
    c.fillStyle = TC.col('#3a2a20'); c.fillRect(0, 14, W, 7);
    c.fillStyle = TC.col('#5a3a28'); c.fillRect(0, 14, W, 2);
    // letreiro
    c.fillStyle = TC.col('#1a1a1e'); c.fillRect(14, 24, 76, 14);
    c.fillStyle = TC.col('#c02020'); c.fillRect(15, 25, 74, 12);
    TC.font.draw(c, 'BAR DO ZÉ', 52, 27, '#f8f0d0', { align: 'center' });
    // porta de ferro meio aberta e o balcão lá dentro
    c.fillStyle = TC.col('#0a0a0c'); c.fillRect(10, 44, 54, 48);
    c.fillStyle = TC.col('#5a5a66'); for (var k = 0; k < 9; k++) c.fillRect(10, 44 + k * 2, 54, 1);
    c.fillStyle = TC.col('#4a2c18'); c.fillRect(14, 74, 46, 4);
    c.fillStyle = TC.col('#d8c8a0'); c.fillRect(20, 70, 3, 4); c.fillRect(30, 70, 3, 4); c.fillRect(44, 69, 4, 5);
    // a TV em cima da geladeira
    c.fillStyle = TC.col('#d8d8d8'); c.fillRect(48, 58, 12, 16);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(46, 50, 16, 9);
    c.fillStyle = TC.col('#8ab0d0'); c.fillRect(48, 52, 12, 5);
    // mesinha e cadeiras de bar na calçada
    c.fillStyle = TC.col('#d8c040'); c.fillRect(72, 74, 20, 2); c.fillRect(81, 76, 2, 14);
    c.fillStyle = TC.col('#c8b030'); c.fillRect(68, 80, 2, 10); c.fillRect(66, 80, 6, 2); c.fillRect(94, 80, 2, 10); c.fillRect(92, 80, 6, 2);
    c.fillStyle = TC.col('#7a5a2a'); c.fillRect(76, 70, 3, 4); c.fillStyle = TC.col('#e8b030'); c.fillRect(85, 70, 3, 4);
    cv.tvX = 54; cv.tvY = 54;
    return cv;
  };
  /* bicicletário com as Caloi Barra Forte dos operários */
  C4.bikes = function () {
    var cv = TC.canvas(90, 30), c = cv.ctx;
    c.fillStyle = TC.col('#5a5a66'); c.fillRect(0, 20, 90, 2);
    for (var i = 0; i < 3; i++) {
      var bx = 6 + i * 28;
      c.fillStyle = TC.col('#0c0c10');
      [[bx + 4, 22], [bx + 20, 22]].forEach(function (w) {
        c.fillStyle = TC.col('#0c0c10'); TC.fillCircle(c, w[0], w[1], 6);
        c.fillStyle = TC.col('#3a3a44'); TC.fillCircle(c, w[0], w[1], 5);
        c.fillStyle = TC.col('#0c0c10'); TC.fillCircle(c, w[0], w[1], 4);
        c.fillStyle = TC.col('#8a8a96'); c.fillRect(w[0], w[1], 1, 1);
      });
      c.fillStyle = TC.col(i === 1 ? '#7a1a1a' : '#14141a');
      TC.thickLine(c, bx + 4, 22, bx + 10, 12, 2); TC.thickLine(c, bx + 10, 12, bx + 20, 13, 2); TC.thickLine(c, bx + 20, 22, bx + 18, 10, 2);
      TC.thickLine(c, bx + 10, 12, bx + 12, 22, 2); TC.thickLine(c, bx + 12, 22, bx + 4, 22, 1);
      c.fillStyle = TC.col('#2a2a30'); c.fillRect(bx + 7, 9, 6, 2);   // selim
      c.fillStyle = TC.col('#8a8a96'); c.fillRect(bx + 17, 8, 6, 1);  // guidão
      c.fillStyle = TC.col('#5a5a66'); c.fillRect(bx + 1, 13, 8, 1);  // bagageiro
    }
    return cv;
  };
  /* varal com roupa esquecida */
  C4.clothesline = function (w, seed) {
    var r = TC.RNG(seed), cv = TC.canvas(w, 34), c = cv.ctx;
    c.fillStyle = TC.col('#3a2a20'); c.fillRect(1, 0, 2, 34); c.fillRect(w - 3, 0, 2, 34);
    ART.drawWire(c, 2, 4, w - 2, 4, 6, '#c8c8d0');
    for (var x = 10; x < w - 12; x += r.int(12, 18)) {
      var y = 4 + Math.round(Math.sin(x / w * Math.PI) * 6);
      var col = r.pick(['#e8e4dc', '#c8d8e8', '#e8c8d0', '#d8d0a0']);
      c.fillStyle = TC.col(col); c.fillRect(x, y, 8, 10 + r.int(0, 6));
      c.fillStyle = TC.col(TC.shade(col, 0.8)); c.fillRect(x + 6, y, 2, 10);
      c.fillStyle = TC.col('#6a4a2a'); c.fillRect(x + 1, y - 1, 1, 2); c.fillRect(x + 6, y - 1, 1, 2);
    }
    return cv;
  };
  /* a fábrica ao longe (silhueta para o fundo): telhado dente-de-serra, chaminé e caixa-d'água */
  C4.factoryFar = function (w, col, rim) {
    var Hh = 90, cv = TC.canvas(w, Hh), c = cv.ctx;
    c.fillStyle = TC.col(col);
    var x0 = Math.round(w * 0.2), x1 = Math.round(w * 0.85);
    c.fillRect(x0, 50, x1 - x0, Hh - 50);
    for (var x = x0; x < x1; x += 18) TC.fillPoly(c, [[x, 50], [x + 18, 50], [x + 18, 38]]);
    c.fillStyle = TC.col(rim);
    for (x = x0; x < x1; x += 18) c.fillRect(x + 14, 39, 4, 11);   // os vidros do dente-de-serra pegando luar
    c.fillStyle = TC.col(col);
    c.fillRect(x1 - 30, 4, 8, 50);                                   // chaminé
    c.fillRect(x0 - 26, 28, 3, 40); c.fillRect(x0 - 12, 28, 3, 40);  // caixa-d'água
    c.fillRect(x0 - 30, 16, 22, 14);
    TC.fillPoly(c, [[x0 - 32, 16], [x0 - 6, 16], [x0 - 19, 8]]);
    return cv;
  };
  /* o portão da fábrica: pilares de tijolo, grade aberta e o letreiro com a estrela de neon */
  C4.gate = function () {
    var W = 176, Hh = 150, cv = TC.canvas(W, Hh), c = cv.ctx;
    function pillar(x) {
      for (var y = 30; y < Hh; y++) for (var xx = x; xx < x + 18; xx++) {
        var row = y >> 2, bx = (xx + (row % 2) * 4) % 8;
        c.fillStyle = TC.col(bx === 0 || y % 4 === 3 ? '#3a1a14' : (H2(xx >> 3, row, 9) > 0.5 ? '#8a3a28' : '#7a3222'));
        c.fillRect(xx, y, 1, 1);
      }
      c.fillStyle = TC.col('#c8c0b0'); c.fillRect(x - 2, 26, 22, 5);
      c.fillStyle = TC.col('#e8e0d0'); TC.fillCircle(c, x + 9, 21, 5);
    }
    pillar(4); pillar(W - 22);
    // o arco de ferro com o letreiro
    c.fillStyle = TC.col('#1a1a20');
    for (var x = 20; x < W - 20; x++) { var ay = 18 - Math.round(Math.sin((x - 20) / (W - 40) * Math.PI) * 10); c.fillRect(x, ay, 1, 3); c.fillRect(x, 36, 1, 2); }
    for (x = 26; x < W - 26; x += 8) c.fillRect(x, 20 - Math.round(Math.sin((x - 20) / (W - 40) * Math.PI) * 10), 1, 17);
    var bw = 118, bx0 = Math.round(W / 2 - bw / 2);
    c.fillStyle = TC.col('#14141a'); c.fillRect(bx0, 14, bw, 20);
    c.fillStyle = TC.col('#2a2a34'); c.fillRect(bx0 + 1, 15, bw - 2, 18);
    TC.font.draw(c, 'CALÇADOS', W / 2 + 6, 16, '#e8d8b0', { align: 'center' });
    TC.font.draw(c, 'MORGENSTERN', W / 2 + 6, 24, '#f0c860', { align: 'center' });
    // a grade aberta, encostada nos pilares
    c.fillStyle = TC.col('#24242c');
    for (var gx = 24; gx < 46; gx += 4) { c.fillRect(gx, 50, 1, Hh - 54); c.fillRect(gx - 1, 48, 3, 2); }
    for (gx = W - 46; gx < W - 24; gx += 4) { c.fillRect(gx, 50, 1, Hh - 54); c.fillRect(gx - 1, 48, 3, 2); }
    c.fillRect(24, 60, 22, 1); c.fillRect(24, Hh - 20, 22, 1); c.fillRect(W - 46, 60, 22, 1); c.fillRect(W - 46, Hh - 20, 22, 1);
    cv.starX = bx0 + 9; cv.starY = 24;
    return cv;
  };
  /* estrela de neon (desenhada à parte para piscar) */
  C4.neonStar = function (r, col) {
    var S = r * 2 + 3, cv = TC.canvas(S, S), c = cv.ctx;
    var pts = [];
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr]); }
    c.fillStyle = TC.col(col);
    for (i = 0; i < 10; i++) TC.thickLine(c, pts[i][0], pts[i][1], pts[(i + 1) % 10][0], pts[(i + 1) % 10][1], 1.6);
    c.fillStyle = TC.col('#ffffff');
    for (i = 0; i < 10; i += 2) c.fillRect(Math.round(pts[i][0]), Math.round(pts[i][1]), 1, 1);
    return cv;
  };
  /* guarita do porteiro */
  C4.guardhouse = function () {
    var cv = TC.canvas(44, 64), c = cv.ctx;
    c.fillStyle = TC.col('#3a2a20'); c.fillRect(0, 8, 44, 4);
    c.fillStyle = TC.col('#c8c0a8'); c.fillRect(2, 12, 40, 52);
    c.fillStyle = TC.col('#a8a088'); for (var y = 14; y < 64; y += 6) c.fillRect(2, y, 40, 1);
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(8, 20, 28, 16);
    c.fillStyle = TC.col('#101828'); c.fillRect(9, 21, 26, 14);
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(21, 21, 1, 14);
    c.fillStyle = TC.col('#4a2a1a'); c.fillRect(0, 4, 44, 5);
    TC.font.draw(c, 'PORTARIA', 22, 40, '#3a2a20', { align: 'center' });
    return cv;
  };
  /* relógio de ponto (o ponto de retorno deste capítulo) */
  C4.timeClock = function (on) {
    var cv = TC.canvas(26, 44), c = cv.ctx;
    c.fillStyle = TC.col('#4a4a52'); c.fillRect(11, 20, 3, 24); c.fillRect(8, 42, 9, 2);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(2, 2, 16, 20);
    c.fillStyle = TC.col('#6a4428'); c.fillRect(3, 3, 14, 18);
    c.fillStyle = TC.col('#e8e4d8'); TC.fillCircle(c, 10, 9, 5);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(10, 5, 1, 4); c.fillRect(10, 9, 3, 1);
    c.fillStyle = TC.col('#1a1a1e'); c.fillRect(5, 16, 10, 3);
    c.fillStyle = TC.col(on ? '#80ff80' : '#3a5a3a'); c.fillRect(13, 16, 2, 2);
    // porta-cartões com os cartões de ponto
    c.fillStyle = TC.col('#3a2a1a'); c.fillRect(18, 4, 7, 17);
    for (var k = 0; k < 4; k++) { c.fillStyle = TC.col(k === 1 && on ? '#ffe090' : '#d8c8a0'); c.fillRect(19, 3 + k * 4, 5, 3); }
    return cv;
  };
  /* fachada de tijolo da fábrica (pátio do curtume), com janelões e a doca de carga */
  C4.facade = function (w, seed) {
    var Hh = 160, cv = TC.canvas(w, Hh), c = cv.ctx, r = TC.RNG(seed || 3);
    for (var y = 0; y < Hh; y++) for (var x = 0; x < w; x++) {
      var row = y >> 2, bx = (x + (row % 2) * 4) % 8;
      var n = H2(x >> 3, row, 30 + seed);
      c.fillStyle = TC.col(bx === 0 || y % 4 === 3 ? '#2a1410' : (n > 0.7 ? '#6a2e20' : n > 0.3 ? '#5a281c' : '#4e2218'));
      c.fillRect(x, y, 1, 1);
    }
    // cornija e janelões em arco
    c.fillStyle = TC.col('#8a8070'); c.fillRect(0, 10, w, 4);
    for (x = 20; x < w - 40; x += 70) {
      c.fillStyle = TC.col('#1a1414'); c.fillRect(x - 2, 30, 40, 56);
      for (var yy = 32; yy < 84; yy++) for (var xx = x; xx < x + 36; xx++) {
        var lit = H2(xx >> 2, yy >> 2, seed) > 0.86;
        c.fillStyle = TC.col((xx - x) % 9 === 0 || (yy - 32) % 10 === 0 ? '#1a1414' : lit ? '#3a4a6a' : '#141c2e');
        c.fillRect(xx, yy, 1, 1);
      }
      c.fillStyle = TC.col('#8a8070'); c.fillRect(x - 3, 86, 42, 3);
    }
    return cv;
  };
  C4.wallLamp = function () {
    var cv = TC.canvas(26, 22), c = cv.ctx;
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(0, 2, 4, 8);
    c.fillStyle = TC.col('#3a3a44'); TC.thickLine(c, 3, 5, 14, 2, 2); TC.thickLine(c, 14, 2, 19, 7, 2);
    c.fillStyle = TC.col('#2a4a3a'); TC.fillPoly(c, [[13, 7], [25, 7], [22, 12], [16, 12]]);
    c.fillStyle = TC.col('#ffe0a0'); c.fillRect(17, 12, 4, 1);
    cv.lightX = 19; cv.lightY = 13;
    return cv;
  };
  C4.paintedSign = function (txt) {
    var w = TC.font.measure(txt) * 2 + 16, cv = TC.canvas(w, 26), c = cv.ctx;
    c.globalAlpha = 0.55;
    c.fillStyle = TC.col('#c8b890'); c.fillRect(0, 0, w, 26);
    c.globalAlpha = 1;
    TC.font.draw(c, txt, w / 2, 6, '#3a1a10', { align: 'center', scale: 2 });
    // tinta descascada
    for (var k = 0; k < w; k += 3) for (var y = 0; y < 26; y++) if (H2(k, y, 99) > 0.8) c.clearRect(k, y, 2, 1);
    return cv;
  };
  /* rebordo de concreto do tanque de tanino */
  C4.tankRim = function (w) {
    var cv = TC.canvas(w + 8, 22), c = cv.ctx;
    c.fillStyle = TC.col('#6a645c'); c.fillRect(0, 0, 4, 22); c.fillRect(w + 4, 0, 4, 22);
    c.fillStyle = TC.col('#9a948c'); c.fillRect(0, 0, 4, 1); c.fillRect(w + 4, 0, 4, 1);
    c.fillStyle = TC.col('#3a1a0e'); for (var x = 4; x < w + 4; x += 3) c.fillRect(x, 6 + (x % 2), 2, 1);   // espuma de tanino
    return cv;
  };
  /* varal de couros: armação de madeira com couros pendurados (a viga de cima é plataforma) */
  C4.hideRack = function (w, seed) {
    var r = TC.RNG(seed), cv = TC.canvas(w, 76), c = cv.ctx;
    c.fillStyle = TC.col('#4a3020'); c.fillRect(0, 2, 4, 74); c.fillRect(w - 4, 2, 4, 74);
    c.fillStyle = TC.col('#6a4a2e'); c.fillRect(0, 0, w, 5);
    c.fillStyle = TC.col('#8a6a44'); c.fillRect(0, 0, w, 1);
    for (var x = 6; x < w - 16; x += r.int(14, 20)) {
      var hw = r.int(10, 14), hh = r.int(30, 46);
      var col = r.pick(['#6a3a22', '#7a4428', '#5a3020', '#8a5a3a']);
      c.fillStyle = TC.col(TC.shade(col, 0.6));
      TC.fillPoly(c, [[x, 5], [x + hw, 5], [x + hw + 2, 5 + hh * 0.6], [x + hw - 1, 5 + hh], [x + 2, 5 + hh - 3], [x - 2, 5 + hh * 0.5]]);
      c.fillStyle = TC.col(col);
      TC.fillPoly(c, [[x + 1, 6], [x + hw - 1, 6], [x + hw, 5 + hh * 0.6], [x + hw - 2, 4 + hh], [x + 3, 3 + hh - 3], [x, 5 + hh * 0.5]]);
      c.fillStyle = TC.col('#c8c8d0'); c.fillRect(x + 2, 4, 1, 3); c.fillRect(x + hw - 3, 4, 1, 3);
    }
    return cv;
  };
  /* pilha de casca de acácia-negra */
  C4.barkPile = function (seed) {
    var r = TC.RNG(seed), cv = TC.canvas(56, 26), c = cv.ctx;
    for (var k = 0; k < 40; k++) {
      var x = r.int(2, 50), y = 26 - r.int(0, Math.round(22 - Math.abs(x - 26) * 0.8));
      c.fillStyle = TC.col(r.pick(['#3a2414', '#4a3020', '#2a1a10', '#5a3a24']));
      c.fillRect(x, y, r.int(4, 9), 2);
    }
    return cv;
  };
  /* o fulão: tambor de madeira de curtir couro, com cintas de ferro e portinhola (girado em tempo real) */
  C4.drum = function () {
    var R = 30, S = R * 2 + 4, pb = new TC.PixBuf(S, S), c = S / 2;
    for (var y = -R; y <= R; y++) for (var x = -R; x <= R; x++) {
      var d = Math.sqrt(x * x + y * y);
      if (d > R) continue;
      var ang = Math.atan2(y, x);
      var plank = Math.floor((ang + Math.PI) / TC.TAU * 24);
      var col = d > R - 2 ? '#2a1a10' : (plank % 2 ? '#7a5030' : '#6a4428');
      if (Math.abs(d - R * 0.62) < 1.5 || Math.abs(d - R * 0.3) < 1) col = '#3a3a44';
      if (d < 4) col = '#1a1a20';
      pb.set(c + x, c + y, u32(col));
    }
    // portinhola
    for (y = -6; y <= 6; y++) for (x = 10; x <= 22; x++) pb.set(c + x, c + y, u32(Math.abs(y) === 6 || x === 10 || x === 22 ? '#2a2a30' : '#5a3a20'));
    return pb.toCanvas();
  };
  C4.drumFrame = function () {
    var cv = TC.canvas(84, 80), c = cv.ctx;
    c.fillStyle = TC.col('#2a2a30'); TC.fillPoly(c, [[6, 80], [14, 80], [42, 34], [38, 32]]); TC.fillPoly(c, [[78, 80], [70, 80], [42, 34], [46, 32]]);
    c.fillStyle = TC.col('#4a4a56'); c.fillRect(38, 30, 8, 8);
    return cv;
  };
  /* o caminhão do Arno: cabine "bicuda" vermelha e carroceria de madeira (com os faróis marcados) */
  C4.truck = function () {
    var W = 132, Hh = 56, cv = TC.canvas(W, Hh), c = cv.ctx;
    // carroceria de madeira
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(2, 14, 82, 28);
    for (var y = 16; y < 40; y += 6) { c.fillStyle = TC.col('#8a6a44'); c.fillRect(3, y, 80, 5); c.fillStyle = TC.col('#a8845a'); c.fillRect(3, y, 80, 1); }
    for (var x = 4; x < 84; x += 20) { c.fillStyle = TC.col('#5a3e26'); c.fillRect(x, 14, 3, 28); }
    c.fillStyle = TC.col('#3a2a1a'); c.fillRect(2, 40, 84, 4);
    // cabine bicuda vermelha
    c.fillStyle = TC.col('#5a1410'); TC.fillPoly(c, [[86, 8], [108, 8], [112, 22], [130, 26], [130, 44], [86, 44]]);
    c.fillStyle = TC.col('#a02a20'); TC.fillPoly(c, [[88, 10], [106, 10], [110, 22], [128, 27], [128, 42], [88, 42]]);
    c.fillStyle = TC.col('#c84030'); c.fillRect(110, 24, 18, 2);
    c.fillStyle = TC.col('#14182a'); TC.fillPoly(c, [[93, 12], [105, 12], [108, 22], [93, 22]]);
    c.fillStyle = TC.col('#4a5a8a'); c.fillRect(94, 13, 3, 3);
    c.fillStyle = TC.col('#7a1e18'); c.fillRect(98, 26, 1, 12); c.fillRect(92, 27, 5, 1);   // maçaneta e porta
    // grade e para-choque
    c.fillStyle = TC.col('#c8c8d0'); c.fillRect(127, 28, 3, 13);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(0, 42, 132, 4);
    c.fillStyle = TC.col('#e0e0e8'); c.fillRect(118, 42, 14, 2);
    // farol e lanterna
    c.fillStyle = TC.col('#fff0b0'); c.fillRect(127, 30, 3, 4);
    c.fillStyle = TC.col('#c02020'); c.fillRect(1, 36, 2, 3);
    // rodas
    [[18, 47], [36, 47], [112, 47]].forEach(function (w) {
      c.fillStyle = TC.col('#0c0c10'); TC.fillCircle(c, w[0], w[1], 9);
      c.fillStyle = TC.col('#3a3a44'); TC.fillCircle(c, w[0], w[1], 5);
      c.fillStyle = TC.col('#8a8a96'); TC.fillCircle(c, w[0], w[1], 2);
    });
    cv.lampX = 129; cv.lampY = 32; cv.tailX = 2; cv.tailY = 37;
    return cv;
  };
  /* a doca de carga */
  C4.dock = function () {
    var cv = TC.canvas(150, 60), c = cv.ctx;
    c.fillStyle = TC.col('#4a4640'); c.fillRect(0, 30, 150, 30);
    c.fillStyle = TC.col('#6a645c'); c.fillRect(0, 30, 150, 2);
    c.fillStyle = TC.col('#d8b030'); for (var x = 0; x < 150; x += 12) c.fillRect(x, 32, 6, 2);
    c.fillStyle = TC.col('#1a1a1e'); c.fillRect(10, 0, 60, 30);     // portão da expedição, aberto e escuro
    c.fillStyle = TC.col('#3a3a44'); for (var y = 0; y < 8; y++) c.fillRect(10, y * 2, 60, 1);   // porta de enrolar suspensa
    TC.font.draw(c, 'EXPEDIÇÃO', 40, 18, '#c8b070', { align: 'center' });
    return cv;
  };

  /* --------- interior: corte e montagem --------- */
  C4.wallIndustrial = function (w, seed) {
    var Hh = 194, cv = TC.canvas(w, Hh), c = cv.ctx, r = TC.RNG(seed || 5);
    for (var y = 0; y < Hh; y++) for (var x = 0; x < w; x++) {
      var row = y >> 2, bx = (x + (row % 2) * 4) % 8;
      var n = H2((x + seed) >> 3, row, 40);
      c.fillStyle = TC.col(y < 20 ? '#14121a' : (bx === 0 || y % 4 === 3 ? '#1e1418' : (n > 0.6 ? '#3e2a26' : '#36241e')));
      c.fillRect(x, y, 1, 1);
    }
    // treliças do telhado
    c.fillStyle = TC.col('#2a2a32');
    for (x = 0; x < w; x += 64) { TC.thickLine(c, x, 20, x + 32, 4, 2); TC.thickLine(c, x + 32, 4, x + 64, 20, 2); c.fillRect(x, 18, 64, 3); }
    // janelões altos com luar
    for (x = 24; x < w - 40; x += 96) {
      c.fillStyle = TC.col('#0c0c12'); c.fillRect(x - 2, 30, 40, 44);
      for (var yy = 32; yy < 72; yy++) for (var xx = x; xx < x + 36; xx++) {
        c.fillStyle = TC.col((xx - x) % 9 === 0 || (yy - 32) % 8 === 0 ? '#0c0c12' : (H2(xx, yy, 41) > 0.93 ? '#1a1a24' : '#2a3a5c'));
        c.fillRect(xx, yy, 1, 1);
      }
    }
    // rodapé pintado de verde de fábrica
    c.fillStyle = TC.col('#2a3a30'); c.fillRect(0, Hh - 40, w, 40);
    c.fillStyle = TC.col('#3a4a40'); c.fillRect(0, Hh - 40, w, 2);
    return cv;
  };
  C4.shelf = function (seed) {
    var r = TC.RNG(seed), cv = TC.canvas(70, 90), c = cv.ctx;
    c.fillStyle = TC.col('#3a3a44'); c.fillRect(0, 0, 3, 90); c.fillRect(67, 0, 3, 90);
    for (var s = 0; s < 4; s++) {
      var y = 4 + s * 22;
      c.fillStyle = TC.col('#5a5a66'); c.fillRect(0, y + 18, 70, 3);
      for (var b = 0; b < 4; b++) {
        if (r() < 0.2) continue;
        var bx = 4 + b * 16;
        c.fillStyle = TC.col(r() < 0.5 ? '#b89a6a' : '#a88a5a'); c.fillRect(bx, y + 6, 14, 12);
        c.fillStyle = TC.col('#7a5a3a'); c.fillRect(bx, y + 6, 14, 1);
        c.fillStyle = TC.col('#3a2a20'); c.fillRect(bx + 3, y + 10, 8, 1); c.fillRect(bx + 3, y + 13, 6, 1);
      }
    }
    TC.font.draw(c, 'EXPORT', 35, 0, '#c8b070', { align: 'center' });
    return cv;
  };
  C4.lastRack = function () {
    var cv = TC.canvas(48, 40), c = cv.ctx;
    c.fillStyle = TC.col('#4a3020'); c.fillRect(0, 0, 48, 3); c.fillRect(0, 18, 48, 3); c.fillRect(0, 36, 48, 3);
    for (var row = 0; row < 2; row++) for (var k = 0; k < 5; k++) c.drawImage(C4.last, 1 + k * 9, 12 + row * 18 - 6);
    return cv;
  };
  C4.tubeLamp = function () {
    var cv = TC.canvas(40, 30), c = cv.ctx;
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(8, 0, 1, 24); c.fillRect(31, 0, 1, 24);
    c.fillStyle = TC.col('#4a4a56'); c.fillRect(4, 24, 32, 3);
    c.fillStyle = TC.col('#e8f0f0'); c.fillRect(5, 27, 30, 2);
    cv.lightX = 20; cv.lightY = 28;
    return cv;
  };
  C4.conveyorBase = function (w) {
    var cv = TC.canvas(w, 30), c = cv.ctx;
    c.fillStyle = TC.col('#3a3a44'); c.fillRect(0, 0, w, 6);
    c.fillStyle = TC.col('#5a5a66'); c.fillRect(0, 0, w, 1);
    for (var x = 6; x < w; x += 24) { c.fillStyle = TC.col('#2a2a30'); c.fillRect(x, 6, 3, 24); }
    c.fillStyle = TC.col('#d8b030'); for (x = 0; x < w; x += 10) c.fillRect(x, 4, 5, 2);
    return cv;
  };
  // balancim: coluna, cabeçote (desenhado à parte, desce e sobe) e a mesa de corte
  C4.pressFrame = function () {
    var cv = TC.canvas(48, 120), c = cv.ctx;
    c.fillStyle = TC.col('#2a3a4a'); c.fillRect(2, 0, 8, 120); c.fillRect(38, 0, 8, 120);
    c.fillStyle = TC.col('#3a5a6a'); c.fillRect(2, 0, 2, 120); c.fillRect(38, 0, 2, 120);
    c.fillStyle = TC.col('#1a2a3a'); c.fillRect(0, 0, 48, 12);
    c.fillStyle = TC.col('#d8b030'); for (var x = 0; x < 48; x += 8) c.fillRect(x, 4, 4, 4);
    return cv;
  };
  C4.pressHead = function () {
    var cv = TC.canvas(36, 22), c = cv.ctx;
    c.fillStyle = TC.col('#3a4a5a'); c.fillRect(0, 0, 36, 16);
    c.fillStyle = TC.col('#5a6a7a'); c.fillRect(0, 0, 36, 2);
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(2, 16, 32, 4);
    c.fillStyle = TC.col('#d8d8e0'); for (var x = 3; x < 34; x += 3) c.fillRect(x, 20, 2, 2);   // a navalha
    c.fillStyle = TC.col('#d8b030'); c.fillRect(12, 6, 12, 4);
    return cv;
  };
  C4.officeGlass = function () {
    var W = 176, Hh = 110, cv = TC.canvas(W, Hh), c = cv.ctx;
    c.fillStyle = TC.col('#2a2018'); c.fillRect(0, 0, W, Hh);
    c.fillStyle = TC.col('#3a2c22'); for (var x = 0; x < W; x += 12) c.fillRect(x, 0, 1, Hh);   // lambri
    // retrato do velho Otto Morgenstern
    c.fillStyle = TC.col('#c8a050'); c.fillRect(20, 14, 30, 36);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(22, 16, 26, 32);
    c.fillStyle = TC.col('#c8b8a0'); TC.fillCircle(c, 35, 28, 7);
    c.fillStyle = TC.col('#e8e8ec'); c.fillRect(29, 34, 12, 6);
    c.fillStyle = TC.col('#14141a'); c.fillRect(26, 38, 18, 10);
    TC.font.draw(c, 'OTTO', 35, 50, '#c8a050', { align: 'center' });
    // a vitrine (os sapatos são desenhados por cima enquanto estiverem lá)
    c.fillStyle = TC.col('#c8a050'); c.fillRect(122, 34, 40, 4); c.fillRect(122, 70, 40, 6);
    c.fillStyle = TC.col('#1a2028'); c.fillRect(124, 38, 36, 32);
    c.fillStyle = TC.col('#3a4a5a'); c.fillRect(124, 38, 2, 32);
    c.fillStyle = TC.col('#e8e0c8'); c.fillRect(128, 60, 28, 2);
    TC.font.draw(c, 'MODELO', 142, 78, '#c8a050', { align: 'center' });
    TC.font.draw(c, 'HILDE', 142, 86, '#e0c060', { align: 'center' });
    // escrivaninha com o telefone e o livro-caixa
    c.fillStyle = TC.col('#4a2c18'); c.fillRect(56, 76, 56, 6); c.fillRect(58, 82, 4, 28); c.fillRect(106, 82, 4, 28);
    c.fillStyle = TC.col('#1a1a1e'); c.fillRect(62, 70, 10, 6);
    c.fillStyle = TC.col('#7a2020'); c.fillRect(84, 72, 18, 4);
    // divisória de vidro (moldura)
    c.fillStyle = TC.col('#4a4a52'); c.fillRect(0, 0, W, 4); c.fillRect(0, 0, 3, Hh); c.fillRect(W - 3, 0, 3, Hh);
    c.fillStyle = 'rgba(160,190,220,0.08)'; c.fillRect(3, 4, W - 6, Hh - 4);
    TC.font.draw(c, 'DIRETORIA', W / 2, 6, '#c8c0b0', { align: 'center' });
    cv.shoesX = 142; cv.shoesY = 60;
    return cv;
  };

  /* --------- interior: o pesponto e a sala de cola --------- */
  C4.wallStitch = function (w, seed) {
    var Hh = 194, cv = TC.canvas(w, Hh), c = cv.ctx;
    for (var y = 0; y < Hh; y++) for (var x = 0; x < w; x++) {
      var n = H2(x, y, 50 + seed);
      c.fillStyle = TC.col(y < 16 ? '#14121a' : (y > Hh - 46 ? (n > 0.9 ? '#3a4440' : '#2e3834') : (n > 0.95 ? '#5a5650' : '#4a4640')));
      c.fillRect(x, y, 1, 1);
    }
    c.fillStyle = TC.col('#1e1c22'); for (x = 0; x < w; x += 48) c.fillRect(x, 0, 6, 18);
    // janelas basculantes
    for (x = 30; x < w - 40; x += 112) {
      c.fillStyle = TC.col('#1a1a20'); c.fillRect(x - 2, 28, 52, 40);
      for (var yy = 30; yy < 66; yy++) for (var xx = x; xx < x + 48; xx++) {
        c.fillStyle = TC.col((xx - x) % 12 === 0 || (yy - 30) % 9 === 0 ? '#1a1a20' : '#26344e');
        c.fillRect(xx, yy, 1, 1);
      }
    }
    // marcas de fuligem do incêndio
    for (var k = 0; k < w / 20; k++) {
      var sx = Math.floor(H2(k, 1, seed) * w), sh = 20 + Math.floor(H2(k, 2, seed) * 60);
      for (y = 0; y < sh; y++) { c.fillStyle = 'rgba(10,8,10,0.25)'; c.fillRect(sx - Math.round((sh - y) * 0.15), 20 + y, Math.round((sh - y) * 0.3) + 2, 1); }
    }
    // prateleira de carretéis de linha
    c.fillStyle = TC.col('#4a2c18'); c.fillRect(0, 96, w, 3);
    var cols = ['#c02020', '#2050a0', '#e0c040', '#20804a', '#e8e4dc', '#1a1a1a', '#a040a0'];
    for (x = 4; x < w; x += 7) {
      var col = cols[Math.floor(H2(x, 3, seed) * cols.length)];
      c.fillStyle = TC.col('#8a6a44'); c.fillRect(x, 88, 5, 1); c.fillRect(x, 95, 5, 1);
      c.fillStyle = TC.col(col); c.fillRect(x, 89, 5, 6);
    }
    return cv;
  };
  // fileira de máquinas de pesponto (mesas de ferro fundido com a máquina preta e dourada)
  C4.machine = function () {
    var cv = TC.canvas(40, 40), c = cv.ctx;
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(0, 18, 40, 4);
    c.fillStyle = TC.col('#7a5a38'); c.fillRect(0, 18, 40, 1);
    c.fillStyle = TC.col('#1a1a20'); c.fillRect(3, 22, 3, 18); c.fillRect(34, 22, 3, 18);
    c.fillStyle = TC.col('#2a2a30'); for (var k = 0; k < 4; k++) c.fillRect(8 + k * 6, 30 + (k % 2) * 4, 2, 2);   // pedal de ferro
    c.fillStyle = TC.col('#14141a'); c.fillRect(8, 8, 22, 4); c.fillRect(26, 8, 4, 10); c.fillRect(8, 12, 4, 6);
    c.fillStyle = TC.col('#c8a040'); c.fillRect(13, 9, 8, 1);
    c.fillStyle = TC.col('#d8d8e0'); c.fillRect(9, 16, 1, 2);
    c.fillStyle = TC.col('#c02020'); c.fillRect(24, 5, 3, 3);   // carretel em cima
    return cv;
  };
  C4.wallClock = function () {
    var cv = TC.canvas(22, 22), c = cv.ctx;
    c.fillStyle = TC.col('#2a2a30'); TC.fillCircle(c, 11, 11, 10);
    c.fillStyle = TC.col('#e8e4d8'); TC.fillCircle(c, 11, 11, 8);
    c.fillStyle = TC.col('#2a2a30');
    for (var h = 0; h < 12; h++) { var a = h / 12 * TC.TAU; c.fillRect(Math.round(11 + Math.cos(a) * 7), Math.round(11 + Math.sin(a) * 7), 1, 1); }
    c.fillRect(11, 11, 6, 1);                  // ponteiro dos minutos no 3 (15 min)
    c.fillRect(11, 11, 4, 1); c.fillRect(14, 12, 1, 1);   // ponteiro das horas logo depois das 3
    c.fillStyle = TC.col('#c02020'); c.fillRect(11, 6, 1, 5);   // ponteiro dos segundos parado
    return cv;
  };
  C4.glueBarrels = function () {
    var cv = TC.canvas(46, 30), c = cv.ctx;
    for (var k = 0; k < 3; k++) {
      var x = k * 15, y = k === 1 ? 0 : 6;
      c.fillStyle = TC.col('#2a4a2a'); c.fillRect(x, y, 13, 24 - y + 6);
      c.fillStyle = TC.col('#3a6a3a'); c.fillRect(x, y, 3, 30 - y);
      c.fillStyle = TC.col('#1a2a1a'); c.fillRect(x, y + 4, 13, 1); c.fillRect(x, 24, 13, 1);
      c.fillStyle = TC.col('#e8d040'); c.fillRect(x + 3, y + 9, 7, 6);
      c.fillStyle = TC.col('#c02020'); c.fillRect(x + 5, y + 10, 3, 4);
    }
    return cv;
  };
  // fundo da sala do chefe: a parede do fundo do pesponto, com a porta dupla do centro (as portas são desenhadas por cima)
  C4.bossWall = function () {
    var cv = C4.wallStitch(256, 9), c = cv.ctx;
    // queimado do incêndio de 67
    for (var y = 100; y < 194; y++) for (var x = 0; x < 256; x++) if (H2(x >> 1, y >> 1, 90) > 0.86) { c.fillStyle = 'rgba(8,6,8,0.5)'; c.fillRect(x, y, 1, 1); }
    return cv;
  };
  /* uma porta (fechada com corrente / aberta com o luar) */
  C4.door = function (open, wide) {
    var W = wide ? 44 : 26, Hh = 58, cv = TC.canvas(W + 6, Hh + 4), c = cv.ctx;
    c.fillStyle = TC.col('#1a1012'); c.fillRect(0, 0, W + 6, Hh + 4);
    if (open) {
      for (var y = 3; y < Hh + 3; y++) { c.fillStyle = TC.mix('#3a4a7a', '#1a2440', y / Hh); c.fillRect(3, y, W, 1); }
      c.fillStyle = TC.col('#c8d0e8'); TC.fillCircle(c, 3 + W * 0.7, 14, 3);   // a lua lá fora
      c.fillStyle = TC.col('#4a2c18'); c.fillRect(1, 3, 3, Hh); c.fillRect(W + 2, 3, 3, Hh);
    } else {
      for (var x = 3; x < W + 3; x++) { c.fillStyle = TC.col((x - 3) % 7 === 0 ? '#2a1a10' : '#5a3a22'); c.fillRect(x, 3, 1, Hh); }
      if (wide) { c.fillStyle = TC.col('#1a1010'); c.fillRect(3 + W / 2, 3, 1, Hh); }
      // corrente e cadeado
      c.fillStyle = TC.col('#8a8a96');
      for (var k = 0; k < W; k += 3) c.fillRect(3 + k, Hh / 2 + Math.round(Math.sin(k / W * Math.PI) * 4), 2, 1);
      c.fillStyle = TC.col('#c8a040'); c.fillRect(W / 2, Hh / 2 + 3, 6, 5);
      c.fillStyle = TC.col('#2a2010'); c.fillRect(W / 2 + 2, Hh / 2 + 5, 2, 2);
    }
    return cv;
  };

  /* ====================== PREPARO ====================== */
  ART.ch4Init = function () {
    if (C4.ready) return C4;
    ART.castInit();
    C4.hilde = buildHilde();
    var sh = buildShoes();
    C4.shoes = { walk: sh.walk, kick: sh.kick, hurt: sh.hurt };
    C4.clog = { walk: sh.clog, hop: sh.clogHop, hurt: sh.clogHurt };
    C4.boot = buildBoot();
    C4.foreman = buildForeman();
    C4.couro = buildCouro();
    C4.T = C4.tiles();
    C4.drumImg = C4.drum();
    C4.truckImg = C4.truck();
    C4.pressHeadImg = C4.pressHead();
    C4.star = C4.neonStar(6, '#ff60c0');
    C4.starBig = C4.neonStar(11, '#ff60c0');
    C4.clockOn = C4.timeClock(true);
    C4.clockOff = C4.timeClock(false);
    C4.doors = { closed: C4.door(false, false), open: C4.door(true, false), closedWide: C4.door(false, true), openWide: C4.door(true, true) };
    buildItems();
    var EXTRA = { hilde: { normal: hildePortrait('normal'), free: hildePortrait('free'), human: hildePortrait('human') } };
    var orig = ART.portrait;
    if (!orig._ch4) {
      ART.portrait = function (who, f) {
        if (EXTRA[who]) return EXTRA[who][f] || EXTRA[who].normal;
        return orig(who, f);
      };
      ART.portrait._ch4 = true;
    }
    C4.ready = true;
    return C4;
  };
})();
