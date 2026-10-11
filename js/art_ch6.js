'use strict';
/* Teewald City — Capítulo 6: arte procedural ("A Noite do Pelznickel")
   O espantalho, a barba-de-velho que cai das árvores, o jogador de bolão possuído, o Pelznickel (coberto de musgo,
   corrente, vara de marmelo e saco) e o mestre-escola Johann Vogt; a porteira da Linha Esperança, as estufas de fumo,
   o milharal, a venda de secos e molhados, a cancha de bolão de nove pinos, o cemitério de família com cruzes de ferro,
   a casa de pedra da Oma Hedwig, a escola da linha (por fora e por dentro), a cabine com o Ewald no volante. */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, blit = ART._blit;
  var C6 = ART.ch6 = {};
  var H2 = TC.hash2;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: o.hurtFace || false, dy: o.dy || 0, lowest: o.lowest,
      ball: !!o.ball, stick: !!o.stick, vara: !!o.vara, sack: o.sack || null, chainHand: !!o.chainHand,
      paddle: !!o.paddle, chalk: !!o.chalk, coat: o.coat == null ? 1 : o.coat
    };
  }
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
  function walkSet(n, amp, lean, extra) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var q = i / n * TC.TAU;
      var o = {
        lean: lean,
        legF: [amp * Math.sin(q), -(0.1 + amp * 1.5 * Math.max(0, Math.cos(q)))],
        legB: [amp * Math.sin(q + Math.PI), -(0.1 + amp * 1.5 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [-0.35 * Math.sin(q) + 0.15, 0.5], armB: [0.35 * Math.sin(q) + 0.1, 0.5]
      };
      if (extra) for (var k in extra) o[k] = typeof extra[k] === 'function' ? extra[k](q) : extra[k];
      out.push(P(o));
    }
    return out;
  }
  function ghostly(cv, col, amt) {
    var t = TC.tint(cv, col, amt);
    t.ox = cv.ox; t.oy = cv.oy;
    return t;
  }

  /* ====================== ARNO ARREMESSANDO A BOLA DE BOLÃO ======================
     (mesma figura do Arno de art_chars.js, só com as poses do arremesso rasteiro) */
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
  function ballAt(pb, x, y) {
    x = Math.round(x); y = Math.round(y);
    pb.ellipse(x, y, 3, 3, u32('#1a1210'));
    pb.rect(x - 2, y - 2, 3, 2, u32('#4a3a30'));
    pb.set(x - 1, y - 2, u32('#8a7a6a'));
  }
  function buildArnoBowl() {
    var S = {
      W: 48, H: 50, ox: 22, groundY: 47,
      thigh: 6, shin: 6, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3.2, foreThin: 0.4,
      head: ARNO_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: (function () { var a = u32('#3c5490'), b = u32('#5a74b0'), c = u32('#2c3e70'); return function (x, y) { return (x & 1) && (y % 5 === 0) ? c : (((x + y) % 7 === 0) ? b : a); }; })(),
        pantsB: solid('#263660'), boot: solid('#5a3420'), bootB: solid('#3a2014'),
        shirt: plaid('#b03428', '#6a1e20', '#3a1418', '#d8624c'), sleeve: plaid('#b03428', '#6a1e20', '#3a1418', '#d8624c'),
        sleeveB: plaid('#7a2420', '#4a1418', '#2a0c10', '#9a3a30'), skin: solid('#e8aa76'), skinB: solid('#b06e4a'),
        belt: (function () { var a = u32('#2a1c14'), b = u32('#d0b050'); return function (x) { return (x % 7 === 3) ? b : a; }; })(),
        outline: '#120a0e'
      },
      after: function (pb, info, pose) { if (pose.ball && info.hand) ballAt(pb, info.hand.x, info.hand.y + 2); }
    };
    var R = ART.renderFigure;
    return {
      prep: R(P({ lean: 0.3, legF: [0.55, -0.6], legB: [-0.45, -0.05], armF: [-1.1, 0.3], armB: [0.7, 0.7], ball: true }), S),
      throw: R(P({ lean: 0.6, legF: [0.9, -1.1], legB: [-0.75, 0.0], armF: [1.25, 0.05], armB: [-0.7, 0.6] }), S),
      follow: R(P({ lean: 0.45, legF: [0.7, -0.8], legB: [-0.6, 0.0], armF: [1.9, 0.2], armB: [-0.5, 0.6] }), S)
    };
  }

  /* ====================== BOLA DE BOLÃO, PINOS ====================== */
  function buildBall() {
    var out = [];
    for (var f = 0; f < 4; f++) {
      var pb = new TC.PixBuf(12, 12), cx = 5.5, cy = 5.5;
      for (var y = 0; y < 12; y++) for (var x = 0; x < 12; x++) {
        var dx = x - cx, dy = y - cy, d = dx * dx + dy * dy;
        if (d > 30) continue;
        var l = -dx * 0.12 - dy * 0.16;
        pb.set(x, y, u32(l > 0.55 ? '#7a6a5a' : l > 0.1 ? '#3a2e26' : l > -0.4 ? '#241c18' : '#140e0c'));
      }
      // veio da madeira girando (dá a impressão de rolar)
      var a = f / 4 * TC.TAU;
      for (var k = -4; k <= 4; k++) {
        var px = Math.round(cx + Math.cos(a) * k), py = Math.round(cy + Math.sin(a) * k * 0.5 + Math.cos(a + 1) * 1.5);
        if ((px - cx) * (px - cx) + (py - cy) * (py - cy) < 22) pb.set(px, py, u32('#5a4232'));
      }
      pb.set(3, 3, u32('#c8b8a0'));
      out.push(pb.toCanvas());
    }
    return out;
  }
  C6.pin = function (fallen) {
    var cv = fallen ? TC.canvas(12, 5) : TC.canvas(5, 13), c = cv.ctx;
    var rows = [
      '.www.',
      'wwwww',
      '.www.',
      '.rrr.',
      '.www.',
      'wwwww',
      'wwwww',
      'wwwwW',
      'wwwwW',
      'wwwwW',
      '.wwW.',
      '.wwW.',
      '.kkk.'
    ];
    var s = TC.sprite(rows, { w: '#f0ece0', W: '#b8b0a0', r: '#c02828', k: '#3a3020' });
    if (!fallen) { c.drawImage(s, 0, 0); return cv; }
    var r = TC.rotate(s, Math.PI / 2);
    c.drawImage(r, Math.round(6 - r.width / 2), Math.round(2.5 - r.height / 2));
    return cv;
  };

  /* ====================== ESPANTALHO ====================== */
  var SCARE_HEAD = TC.sprite([
    '....hhhhh...',
    '...hHhhhhh..',
    'bbbbbbbbbbbb',
    '.ysssssss...',
    '.ysxsssxs...',
    '.ysssssss...',
    '.ysmmmmms...',
    '..sSmSmS....',
    '..y.y.y.....'
  ], { h: '#b89a50', H: '#d8c070', b: '#7a5a28', s: '#c8a878', S: '#9a7a50', x: '#1a0e08', m: '#3a2010', y: '#e0c060' });
  var SCARE_EYES = TC.sprite([
    '....hhhhh...',
    '...hHhhhhh..',
    'bbbbbbbbbbbb',
    '.ysssssss...',
    '.ysxsssxs...',
    '.ysssssss...',
    '.ysmmmmms...',
    '..sSmSmS....',
    '..y.y.y.....'
  ], { h: '#b89a50', H: '#d8c070', b: '#7a5a28', s: '#c8a878', S: '#9a7a50', x: '#ff7020', m: '#3a2010', y: '#e0c060' });
  function buildScarecrow() {
    var straw = solid('#d8c070'), strawD = solid('#a88a40');
    var S = {
      W: 64, H: 60, ox: 30, groundY: 57,
      thigh: 7, shin: 7, legT: 3.2, footH: 1, footL: 2, shinThin: 0.4,
      torso: 11, hipW: 7, shW: 11,
      upper: 7, fore: 7, armT: 3.2, fist: 2.6, foreThin: 0.6,
      head: function (pose) { return pose.hurtFace === 'eyes' ? SCARE_EYES : SCARE_HEAD; }, headOff: { x: -5, y: -9 },
      col: {
        pants: (function () { var a = u32('#5a4a38'), b = u32('#7a6a48'), c = u32('#3a5a7a'); return function (x, y) { return (x + y * 3) % 17 < 3 ? c : (y % 4 === 0 ? b : a); }; })(),
        pantsB: solid('#3a3024'), boot: straw, bootB: strawD,
        shirt: plaid('#4a5a8a', '#2a3460', '#1a2040', '#8a9ac0'), sleeve: plaid('#4a5a8a', '#2a3460', '#1a2040', '#8a9ac0'),
        sleeveB: plaid('#3a4670', '#22284a', '#141830', '#6a7aa0'), skin: straw, skinB: strawD,
        belt: solid('#8a7040'), outline: '#100c08'
      },
      after: function (pb, info, pose) {
        // remendo na camisa e palha saindo dos punhos e da gola
        pb.rect(Math.round(info.sx - 3), Math.round(info.sy + 4), 3, 3, u32('#a04030'));
        pb.set(Math.round(info.sx - 2), Math.round(info.sy + 5), u32('#c86050'));
        for (var k = -2; k <= 2; k++) thick(pb, info.sx + k, info.sy, info.sx + k * 1.6, info.sy - 2, 1, straw);
        if (info.hand) {
          for (var q = -1; q <= 1; q++) thick(pb, info.hand.x, info.hand.y, info.hand.x + q * 2, info.hand.y + 3, 1, q ? straw : strawD);
          if (pose.stick) {
            // o braço de pau: uma vara de taquara saindo da manga
            var a = pose.armF[0] + pose.armF[1];
            var dx = Math.sin(a), dy = Math.cos(a);
            thick(pb, info.hand.x - dx * 2, info.hand.y - dy * 2, info.hand.x + dx * 15, info.hand.y + dy * 15, 1.8, solid('#6a4a28'));
            pb.set(Math.round(info.hand.x + dx * 15), Math.round(info.hand.y + dy * 15), u32('#a07a48'));
          }
        }
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ armF: [1.5, 0.15], armB: [-1.5, -0.15], legF: [0.04, 0], legB: [-0.04, 0], stick: true }), S),
      R(P({ armF: [1.45, 0.25], armB: [-1.45, -0.25], legF: [0.04, 0], legB: [-0.04, 0], breath: 1, stick: true }), S)];
    out.hop = [R(P({ lean: 0.1, armF: [1.8, 0.2], armB: [-1.8, -0.2], legF: [0.3, -0.5], legB: [0.2, -0.5], stick: true, hurtFace: 'eyes' }), S),
      R(P({ lean: 0.05, armF: [1.2, 0.3], armB: [-1.2, -0.3], legF: [0.05, 0], legB: [-0.05, 0], stick: true, hurtFace: 'eyes' }), S)];
    out.windup = [R(P({ lean: -0.25, armF: [2.9, 0.3], armB: [-1.4, -0.2], legF: [0.35, -0.2], legB: [-0.3, -0.1], stick: true, hurtFace: 'eyes' }), S)];
    out.swing = [R(P({ lean: 0.4, armF: [1.55, -0.05], armB: [-1.0, 0.2], legF: [0.5, -0.25], legB: [-0.45, -0.05], stick: true, hurtFace: 'eyes' }), S)];
    out.hurt = [R(P({ lean: -0.5, armF: [0.9, 1.0], armB: [-0.6, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], stick: true }), S)];
    out.lie = [lying(R(P({ armF: [1.5, 0.1], armB: [-1.5, -0.1], legF: [0.05, 0], legB: [-0.05, 0] }), S), 64, 40)];
    out.pole = out.idle;
    return out;
  }

  /* ====================== BARBA-DE-VELHO ======================
     Um tufo de barba-de-pau, cinza-esverdeado, com dois olhinhos amarelos lá no meio. */
  function strands(pb, cx, top, w, h, seed, sway, cols) {
    var r = TC.RNG(seed);
    for (var i = 0; i < w * 2.2; i++) {
      var x0 = cx + r.range(-w / 2, w / 2), len = h * r.range(0.45, 1), ph = r.range(0, 6);
      var col = u32(cols[r.int(0, cols.length - 1)]);
      for (var y = 0; y < len; y++) {
        var k = y / len;
        var x = x0 + Math.sin(y * 0.35 + ph) * 1.2 * k + sway * k * k * 3;
        pb.set(Math.round(x), Math.round(top + y), col);
      }
    }
  }
  var MOSS = ['#9aaa88', '#b8c4a8', '#7a8a68', '#5a6a4a', '#d0d8c0'];
  function buildBarba() {
    function frame(kind, f) {
      var pb = new TC.PixBuf(24, 24), cx = 12;
      if (kind === 'hang') {
        strands(pb, cx, 2, 12, 20, 11 + f, f ? 0.8 : -0.8, MOSS);
        pb.ellipse(cx, 6, 5, 3, u32('#4a5a40'));
        strands(pb, cx, 3, 8, 8, 21, 0, ['#2a3424', '#3a4a32']);
        if (f !== 2) { pb.set(cx - 2, 7, u32('#e8f080')); pb.set(cx + 2, 7, u32('#e8f080')); }
      } else if (kind === 'crawl') {
        pb.ellipse(cx, 18, 9, 5, u32('#4a5a40'));
        strands(pb, cx, 12, 18, 11, 31 + f, f ? 0.6 : -0.6, MOSS);
        pb.set(cx - 3 + f, 15, u32('#f0f890')); pb.set(cx + 2 + f, 15, u32('#f0f890'));
      } else if (kind === 'leap') {
        pb.ellipse(cx, 12, 7, 7, u32('#4a5a40'));
        strands(pb, cx + 2, 5, 14, 16, 41, -1.6, MOSS);
        pb.set(cx - 2, 10, u32('#ffff90')); pb.set(cx + 2, 10, u32('#ffff90'));
      } else if (kind === 'stun') {
        pb.ellipse(cx, 20, 10, 3, u32('#4a5a40'));
        strands(pb, cx, 16, 20, 8, 51, 0, MOSS);
        pb.set(cx - 3, 18, u32('#e8f080')); pb.set(cx + 3, 18, u32('#e8f080'));
        pb.set(cx - 4, 17, u32('#e8f080')); pb.set(cx + 4, 19, u32('#e8f080'));
      } else {
        // agarrado na cabeça do Arno: um gorro de musgo caindo pelos ombros
        pb.ellipse(cx, 6, 7, 4, u32('#4a5a40'));
        strands(pb, cx, 3, 16, 19, 61 + f, f ? 0.5 : -0.5, MOSS);
        pb.set(cx - 2 + f, 6, u32('#ffff90')); pb.set(cx + 2 + f, 6, u32('#ffff90'));
      }
      var cv = TC.scaleCanvas(pb.toCanvas(), 1.5);
      cv.ox = 18; cv.oy = 35;
      return cv;
    }
    return {
      hang: [frame('hang', 0), frame('hang', 1), frame('hang', 2)],
      crawl: [frame('crawl', 0), frame('crawl', 1)],
      leap: [frame('leap', 0)],
      stun: [frame('stun', 0)],
      grab: [frame('grab', 0), frame('grab', 1)]
    };
  }

  /* ====================== JOGADOR DE BOLÃO POSSUÍDO ====================== */
  var BOWLER_HEAD = TC.sprite([
    '...kkkk...',
    '..kCCCCk..',
    '..CCcCCC..',
    '.CCCCCCvvv',
    '..gsssss..',
    '..gssEss..',
    '..ssssss..',
    '..sMMMMs..',
    '...SSSS...'
  ], { k: '#14100c', C: '#3a3a44', c: '#5a5a66', v: '#24242c', g: '#6a6458', s: '#c4baa6', S: '#948a7a', E: '#e8ff70', M: '#4a3a2a' });
  var BOWLER_FREE = TC.sprite([
    '...kkkk...',
    '..kCCCCk..',
    '..CCcCCC..',
    '.CCCCCCvvv',
    '..gsssss..',
    '..gssEss..',
    '..ssssss..',
    '..sMMMMs..',
    '...SSSS...'
  ], { k: '#14100c', C: '#3a3a44', c: '#5a5a66', v: '#24242c', g: '#6a5040', s: '#e0b890', S: '#b08a68', E: '#2a1a10', M: '#5a3a2a' });
  function buildBowler() {
    var skin = solid('#c4baa6'), skinB = solid('#8a8070');
    var S = {
      W: 60, H: 60, ox: 28, groundY: 57,
      thigh: 7, shin: 7, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 8, shW: 10,
      upper: 6, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: function (pose) { return pose.hurtFace === 'free' ? BOWLER_FREE : BOWLER_HEAD; }, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#4a4a54'), pantsB: solid('#30303a'), boot: solid('#1a1410'), bootB: solid('#100c08'),
        shirt: (function () { var a = u32('#e0dcd0'), b = u32('#1a1a20'), c = u32('#2a2a32'); return function (x, y) { return (x % 6 < 2) ? b : (y % 5 === 0 ? c : a); }; })(),
        sleeve: solid('#d8d4c8'), sleeveB: solid('#a8a498'), skin: skin, skinB: skinB, outline: '#0e0a0c'
      },
      after: function (pb, info, pose) {
        // colete preto por cima da camisa branca e a bola na mão
        poly(pb, [[info.sx - 4, info.sy + 1], [info.sx + 4, info.sy + 1], [info.hx + 4, info.hy - 1], [info.hx - 4, info.hy - 1]], function (x, y) { return u32((x + y) % 5 === 0 ? '#2a2630' : '#16141a'); });
        pb.set(Math.round(info.sx + 1), Math.round(info.sy + 4), u32('#d0b050'));
        pb.set(Math.round(info.sx + 1), Math.round(info.sy + 7), u32('#d0b050'));
        if (pose.ball && info.hand) ballAt(pb, info.hand.x, info.hand.y + 2);
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.08, armF: [0.3, 0.6], ball: true }), S), R(P({ lean: 0.1, breath: 1, armF: [0.35, 0.55], ball: true }), S)];
    out.walk = walkSet(6, 0.4, 0.14, { armF: function (q) { return [0.3 - 0.15 * Math.sin(q), 0.6]; }, ball: true }).map(function (p) { return R(p, S); });
    out.bowlPrep = [R(P({ lean: 0.35, legF: [0.6, -0.7], legB: [-0.45, -0.05], armF: [-1.2, 0.3], armB: [0.8, 0.6], ball: true }), S)];
    out.bowl = [R(P({ lean: 0.6, legF: [0.9, -1.1], legB: [-0.75, 0.0], armF: [1.3, 0.05], armB: [-0.7, 0.6] }), S)];
    out.windup = [R(P({ lean: -0.2, legF: [0.35, -0.15], legB: [-0.35, -0.1], armF: [2.4, 0.5], armB: [2.2, 0.6] }), S)];
    out.swing = [R(P({ lean: 0.42, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [1.5, 0.0], armB: [1.3, 0.1], hipX: 1 }), S)];
    out.hurt = [R(P({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2] }), S)];
    out.kneel = [R(P({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.6, 0.5], armB: [0.3, 0.6], hurtFace: 'free' }), S)];
    out.stand = [R(P({ lean: 0.06, armF: [0.2, 0.3], armB: [-0.1, 0.3], hurtFace: 'free' }), S)];
    out.lie = [lying(R(P({ legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2] }), S), 60, 56)];
    return out;
  }

  /* ====================== O PELZNICKEL ======================
     Um vulto enorme coberto de barba-de-velho da cabeça aos pés, com corrente no peito,
     a vara de marmelo na mão e o saco de estopa nas costas. Só os olhos brilham. */
  var PELZ_HEAD = TC.sprite([
    '....mmmmmm.....',
    '..mmMmmmmmmm...',
    '.mmmmmmmMmmmm..',
    'mmMmmmmmmmmmmm.',
    'mmmkkkkkkkkmmm.',
    'mmkkkkkkkkkkmm.',
    'mmkkekkkkekkmm.',
    'mmkkkkkkkkkkmm.',
    'mMmkkkkkkkkmmm.',
    'mmmmkkkkkkmmMm.',
    '.mmmmmmmmmmmm..',
    '.m.mmm.mm.mm.m.',
    '.m..m..m..m..m.'
  ], { m: '#5a6a4a', M: '#8a9a7a', k: '#0a0c08', e: '#f0f090' });
  var PELZ_HEAD_HOT = TC.sprite([
    '....mmmmmm.....',
    '..mmMmmmmmmm...',
    '.mmmmmmmMmmmm..',
    'mmMmmmmmmmmmmm.',
    'mmmkkkkkkkkmmm.',
    'mmkkkkkkkkkkmm.',
    'mmkeekkkkeekmm.',
    'mmkkkkkkkkkkmm.',
    'mMmkkkkkkkkmmm.',
    'mmmmkmmmmkmmMm.',
    '.mmmmmmmmmmmm..',
    '.m.mmm.mm.mm.m.',
    '.m..m..m..m..m.'
  ], { m: '#5a6a4a', M: '#8a9a7a', k: '#0a0c08', e: '#ffd040' });
  function sackShape(pb, x, y, w, h, open, bulge) {
    // saco de estopa (burlap) com a costura e a boca amarrada
    var sk = function (xx, yy) { return u32(((xx + yy * 2) % 5 === 0) ? '#6a5430' : ((xx * 3 + yy) % 7 === 0 ? '#a08858' : '#8a7044')); };
    for (var yy = 0; yy < h; yy++) {
      var k = yy / h;
      var hw = w / 2 * (0.55 + 0.45 * Math.sin(Math.min(1, k * 1.2) * Math.PI * 0.8)) + (bulge || 0) * Math.sin(k * Math.PI);
      for (var xx = -hw; xx <= hw; xx++) pb.set(Math.round(x + xx), Math.round(y + yy), sk(Math.round(x + xx), Math.round(y + yy)));
      pb.set(Math.round(x - hw), Math.round(y + yy), u32('#3a2c18'));
      pb.set(Math.round(x + hw), Math.round(y + yy), u32('#3a2c18'));
    }
    if (open) {
      pb.ellipse(Math.round(x), Math.round(y + 1), Math.round(w / 2 - 1), 3, u32('#120c06'));
      for (var q = -w / 2 + 1; q < w / 2; q += 2) pb.set(Math.round(x + q), Math.round(y - 2), u32('#b09868'));
    } else {
      pb.rect(Math.round(x - 2), Math.round(y - 3), 5, 4, u32('#6a5430'));
      thick(pb, x - 3, y, x + 3, y, 1.4, solid('#c8b080'));
    }
  }
  function buildPelz() {
    var moss = (function () {
      var a = u32('#4a5a40'), b = u32('#5e6e50'), c = u32('#3a4632'), d = u32('#7a8a6a');
      return function (x, y) { var n = H2(x, y >> 1, 9); return n > 0.8 ? d : n > 0.5 ? b : n > 0.2 ? a : c; };
    })();
    var mossD = (function () { var a = u32('#36422e'), b = u32('#2a3424'); return function (x, y) { return H2(x, y, 4) > 0.5 ? a : b; }; })();
    var S = {
      W: 110, H: 104, ox: 50, groundY: 101,
      thigh: 12, shin: 12, legT: 9, footH: 3, footL: 5, shinThin: 1.5,
      torso: 20, hipW: 15, shW: 20,
      upper: 12, fore: 11, armT: 7, fist: 5, foreThin: 1.5,
      head: function (pose) { return pose.hurtFace === 'hot' ? PELZ_HEAD_HOT : PELZ_HEAD; }, headOff: { x: -7, y: -12 },
      wings: function (pb, sx, sy, pose) {
        // o saco nas costas (desenhado atrás do corpo)
        if (pose.sack === 'back') sackShape(pb, sx - 14, sy - 6, 22, 34, false, 3);
      },
      col: { pants: moss, pantsB: mossD, boot: solid('#2a2018'), bootB: solid('#1a140e'), shirt: moss, sleeve: moss, sleeveB: mossD, skin: solid('#3a4632'), skinB: solid('#2a3424'), outline: '#0a0e08' },
      after: function (pb, info, pose) {
        var r = TC.RNG(77);
        // a barba-de-velho pendurada por todo o corpo
        for (var i = 0; i < 70; i++) {
          var t = r();
          var x0 = TC.lerp(info.sx, info.hx, t) + r.range(-12, 12), y0 = TC.lerp(info.sy, info.hy, t) + r.range(-6, 4);
          var len = r.range(8, 26), ph = r.range(0, 6);
          var col = u32(MOSS[r.int(0, MOSS.length - 1)]);
          for (var y = 0; y < len; y++) pb.set(Math.round(x0 + Math.sin(y * 0.3 + ph) * 1.4), Math.round(y0 + y), col);
        }
        if (info.hand) for (i = 0; i < 8; i++) {
          var hx = info.hand.x + r.range(-4, 4), hy = info.hand.y + r.range(-3, 2);
          for (y = 0; y < r.range(5, 12); y++) pb.set(Math.round(hx + Math.sin(y * 0.4 + i) * 1), Math.round(hy + y), u32(MOSS[i % 5]));
        }
        // a corrente atravessada no peito
        for (var k = 0; k <= 12; k++) {
          var cx = TC.lerp(info.sx - 9, info.hx + 8, k / 12), cy = TC.lerp(info.sy + 2, info.hy - 2, k / 12);
          pb.rect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 2, u32(k % 2 ? '#8a8a96' : '#5a5a66'));
          if (k % 2) pb.set(Math.round(cx), Math.round(cy) - 1, u32('#c8c8d0'));
        }
        if (info.hand && pose.vara) {
          // vara de marmelo
          var a = pose.armF[0] + pose.armF[1] + 0.25;
          var dx = Math.sin(a), dy = Math.cos(a), L = 30;
          for (var q = 0; q < L; q++) {
            var bend = Math.sin(q / L * Math.PI) * 2;
            pb.set(Math.round(info.hand.x + dx * q - dy * bend), Math.round(info.hand.y + dy * q + dx * bend), u32(q > L - 6 ? '#8a6a40' : '#4a2e18'));
          }
        }
        if (info.hand && pose.chainHand) {
          for (k = 0; k < 7; k++) pb.rect(Math.round(info.hand.x - 1 + Math.sin(k) * 1), Math.round(info.hand.y + 2 + k * 2), 2, 2, u32(k % 2 ? '#8a8a96' : '#5a5a66'));
        }
        if (info.hand && pose.sack === 'open') sackShape(pb, info.hand.x + 6, info.hand.y - 6, 20, 26, true, 2);
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.12, armF: [0.35, 0.5], armB: [-0.1, 0.4], vara: true, sack: 'back' }), S), R(P({ lean: 0.14, breath: 1, armF: [0.4, 0.45], armB: [-0.05, 0.4], vara: true, sack: 'back' }), S)];
    out.walk = walkSet(4, 0.35, 0.16, { vara: true, sack: 'back', armF: function (q) { return [0.35 - 0.2 * Math.sin(q), 0.5]; } }).map(function (p) { return R(p, S); });
    out.chainPrep = [R(P({ lean: -0.05, armF: [2.9, 0.25], armB: [-0.3, 0.5], sack: 'back' }), S)];
    out.chainThrow = [R(P({ lean: 0.3, legF: [0.45, -0.2], legB: [-0.4, -0.05], armF: [1.6, -0.05], armB: [-0.6, 0.5], sack: 'back' }), S)];
    out.sackPrep = [R(P({ lean: 0.1, armF: [1.2, 0.5], armB: [1.0, 0.6], sack: 'open' }), S)];
    out.sackLunge = [R(P({ lean: 0.55, legF: [0.8, -0.9], legB: [-0.7, 0.0], armF: [1.45, 0.25], armB: [1.25, 0.35], sack: 'open' }), S)];
    out.sackHold = [R(P({ lean: -0.1, armF: [2.2, 0.3], armB: [1.8, 0.4] }), S)];
    out.switchPrep = [R(P({ lean: -0.15, armF: [2.7, 0.4], armB: [-0.4, 0.4], vara: true, sack: 'back' }), S)];
    out.switch = [R(P({ lean: 0.3, armF: [1.3, 0.2], armB: [-0.5, 0.5], vara: true, sack: 'back' }), S), R(P({ lean: 0.35, armF: [0.7, -0.2], armB: [-0.5, 0.5], vara: true, sack: 'back' }), S)];
    out.point = [R(P({ lean: 0.0, armF: [1.75, 0.0], armB: [-0.2, 0.4], sack: 'back', hurtFace: 'hot' }), S)];
    out.write = [R(P({ lean: 0.05, armF: [2.4, 0.4], armB: [0.1, 0.4], sack: 'back' }), S)];
    out.curl = [R(P({ lean: 0.9, legF: [1.1, -1.6], legB: [0.6, -1.5], armF: [0.9, 1.4], armB: [0.7, 1.5], sack: 'back', hurtFace: 'hot' }), S)];
    out.hurt = [R(P({ lean: -0.45, armF: [0.9, 1.0], armB: [-0.5, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], sack: 'back' }), S)];
    out.dizzy = [R(P({ lean: -0.25, armF: [0.6, 1.3], armB: [0.3, 1.5], legF: [0.35, -0.3], legB: [-0.3, -0.25], sack: 'back' }), S)];
    out.kneel = [R(P({ lean: 0.4, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.7, 0.8], armB: [0.4, 0.9] }), S)];
    // a bola de barba-de-velho (rola pela arena; gira com drawRot)
    var pb = new TC.PixBuf(40, 40), r = TC.RNG(5);
    for (var y = 0; y < 40; y++) for (var x = 0; x < 40; x++) {
      var dx = x - 19.5, dy = y - 19.5, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 17 + H2(x, y, 3) * 2) continue;
      var a = Math.atan2(dy, dx), sw = Math.sin(a * 7 + d * 0.5);
      pb.set(x, y, u32(sw > 0.6 ? '#8a9a7a' : sw > 0 ? '#5a6a4a' : d > 14 ? '#3a4632' : '#4a5a40'));
    }
    for (var k = 0; k < 30; k++) {
      var aa = r() * TC.TAU, rr = r.range(4, 16);
      thick(pb, 20 + Math.cos(aa) * rr, 20 + Math.sin(aa) * rr, 20 + Math.cos(aa + 0.4) * (rr + 4), 20 + Math.sin(aa + 0.4) * (rr + 4), 1, solid(MOSS[k % 5]));
    }
    for (k = 0; k < 6; k++) pb.rect(Math.round(20 + Math.cos(k) * 12), Math.round(20 + Math.sin(k) * 12), 2, 2, u32(k % 2 ? '#8a8a96' : '#5a5a66'));
    pb.set(15, 18, u32('#ffd040')); pb.set(16, 18, u32('#ffd040')); pb.set(23, 18, u32('#ffd040')); pb.set(24, 18, u32('#ffd040'));
    out.ball = pb.toCanvas();
    return out;
  }

  /* ====================== O MESTRE-ESCOLA JOHANN VOGT ======================
     Magro, sobrecasaca preta, colarinho alto, óculos de aro de arame; a palmatória e o giz. */
  var VOGT_HEAD = TC.sprite([
    '..hhhhhh...',
    '.hhhhHhhh..',
    '.hhfffffh..',
    '.hfffffff..',
    '.hgGgfgGg..',
    '.hfffffff..',
    '..ffffSff..',
    '..fSmmmS...',
    '...ffff....'
  ], { h: '#14121a', H: '#3a3844', f: '#d8d0c0', S: '#a09888', g: '#9a9aa6', G: '#e8f0c0', m: '#5a3a3a' });
  var VOGT_HEAD_SAD = TC.sprite([
    '..hhhhhh...',
    '.hhhhHhhh..',
    '.hhfffffh..',
    '.hfffffff..',
    '.hgkgfgkg..',
    '.hfffffff..',
    '..ffffSff..',
    '..fSmmmS...',
    '...ffff....'
  ], { h: '#14121a', H: '#3a3844', f: '#e0d4c4', S: '#a89c8c', g: '#9a9aa6', k: '#3a3040', m: '#6a4040' });
  function buildVogt() {
    var coat = (function () { var a = u32('#1c1a22'), b = u32('#2a2832'), c = u32('#d8d8d0'); return function (x, y) { return H2(x, y, 31) > 0.97 ? c : ((x + y) % 7 === 0 ? b : a); }; })();
    var coatB = solid('#121016');
    var S = {
      W: 66, H: 84, ox: 31, groundY: 81,
      thigh: 10, shin: 10, legT: 4, footH: 2, footL: 5, shinThin: 0.6,
      torso: 16, hipW: 8, shW: 11,
      upper: 8, fore: 8, armT: 3.6, fist: 3, foreThin: 0.6,
      head: function (pose) { return pose.hurtFace === 'sad' ? VOGT_HEAD_SAD : VOGT_HEAD; }, headOff: { x: -4, y: -9 },
      col: {
        pants: (function () { var a = u32('#3a3a44'), b = u32('#2a2a32'); return function (x) { return (x % 3 === 0) ? b : a; }; })(),
        pantsB: solid('#24242c'), boot: solid('#0c0a0e'), bootB: solid('#060508'),
        shirt: coat, sleeve: coat, sleeveB: coatB, skin: solid('#d8d0c0'), skinB: solid('#a09888'), outline: '#060508'
      },
      after: function (pb, info, pose) {
        // abas da sobrecasaca até os joelhos
        if (pose.coat) poly(pb, [[info.hx - 5, info.hy - 3], [info.hx + 5, info.hy - 3], [info.hx + 7, info.hy + 11], [info.hx - 8, info.hy + 12]], function (x, y) { return u32((x + y) % 6 === 0 ? '#24222c' : '#18161e'); });
        // colarinho alto engomado e gravata preta
        thick(pb, info.sx - 3, info.sy - 1, info.sx + 3, info.sy - 1, 2.6, solid('#f0ece4'));
        pb.set(Math.round(info.sx + 3), Math.round(info.sy - 3), u32('#f0ece4'));
        pb.rect(Math.round(info.sx - 1), Math.round(info.sy + 1), 3, 2, u32('#050406'));
        if (info.hand && pose.paddle) {
          // palmatória: cabo e cabeça redonda com os furinhos
          var a = pose.armF[0] + pose.armF[1];
          var dx = Math.sin(a), dy = Math.cos(a);
          thick(pb, info.hand.x - dx * 2, info.hand.y - dy * 2, info.hand.x + dx * 7, info.hand.y + dy * 7, 2, solid('#7a5230'));
          var px = info.hand.x + dx * 11, py = info.hand.y + dy * 11;
          pb.ellipse(Math.round(px), Math.round(py), 4, 4, u32('#9a6a3e'));
          pb.set(Math.round(px - 1), Math.round(py - 1), u32('#3a2414')); pb.set(Math.round(px + 1), Math.round(py + 1), u32('#3a2414'));
          pb.set(Math.round(px + 1), Math.round(py - 1), u32('#3a2414'));
        }
        if (info.hand && pose.chalk) pb.rect(Math.round(info.hand.x), Math.round(info.hand.y - 2), 1, 3, u32('#ffffff'));
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04, armF: [0.25, 0.4], armB: [-0.1, 0.3], paddle: true }), S), R(P({ lean: 0.05, breath: 1, armF: [0.3, 0.35], armB: [-0.1, 0.3], paddle: true }), S)];
    out.walk = walkSet(4, 0.3, 0.1, { paddle: true, armF: function (q) { return [0.3 - 0.2 * Math.sin(q), 0.4]; } }).map(function (p) { return R(p, S); });
    out.paddlePrep = [R(P({ lean: -0.15, armF: [2.8, 0.3], armB: [-0.3, 0.4], paddle: true }), S)];
    out.paddle = [R(P({ lean: 0.35, legF: [0.45, -0.2], legB: [-0.4, -0.05], armF: [1.2, -0.1], armB: [-0.6, 0.4], paddle: true }), S)];
    out.throw = [R(P({ lean: 0.25, armF: [1.9, 0.0], armB: [-0.5, 0.4], chalk: true }), S)];
    out.write = [R(P({ lean: 0.0, armF: [2.6, 0.3], armB: [0.1, 0.5], chalk: true }), S)];
    out.point = [R(P({ lean: 0.0, armF: [1.7, 0.0], armB: [-0.1, 0.3] }), S)];
    out.hurt = [R(P({ lean: -0.45, armF: [0.9, 1.0], armB: [-0.5, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2] }), S)];
    out.kneel = [R(P({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.6, 0.7], armB: [0.3, 0.8], hurtFace: 'sad', coat: 0 }), S)];
    out.stand = [R(P({ lean: 0.08, armF: [0.2, 0.3], armB: [-0.1, 0.3], hurtFace: 'sad' }), S)];
    return out;
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
  function pelzPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#141a10', '#020301');
    ellipseFill(pb, 20, 46, 20, 14, function (x, y) { return u32(H2(x, y >> 1, 3) > 0.5 ? '#4a5a40' : '#3a4632'); });
    ellipseFill(pb, 20, 19, 15, 17, function (x, y) { var n = H2(x, y >> 1, 5); return u32(n > 0.75 ? '#8a9a7a' : n > 0.4 ? '#5a6a4a' : '#4a5a40'); });
    ellipseFill(pb, 20, 22, 9, 9, function () { return u32('#050604'); });
    var r = TC.RNG(9);
    for (var i = 0; i < 40; i++) {
      var x0 = r.int(4, 36), y0 = r.int(6, 30), len = r.int(4, 12), col = u32(MOSS[r.int(0, 4)]);
      for (var y = 0; y < len; y++) if (!(x0 > 13 && x0 < 27 && y0 + y > 16 && y0 + y < 30)) pb.set(x0 + Math.round(Math.sin(y * 0.5 + i)), y0 + y, col);
    }
    pb.rect(15, 21, 3, 2, u32('#f0f090')); pb.rect(23, 21, 3, 2, u32('#f0f090'));
    pb.set(16, 21, u32('#ffffff')); pb.set(24, 21, u32('#ffffff'));
    for (var k = 0; k < 9; k++) pb.rect(6 + k * 3, 33 + (k % 2), 2, 2, u32(k % 2 ? '#8a8a96' : '#5a5a66'));
    return pb.toCanvas();
  }
  function vogtPortrait(sad) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, sad ? '#1a1a22' : '#1a1414', '#030203');
    ellipseFill(pb, 20, 45, 18, 11, function (x, y) { return u32((x + y) % 7 === 0 ? '#2a2832' : '#1c1a22'); });
    // colarinho alto
    pb.rect(13, 31, 14, 4, u32('#f0ece4'));
    pb.set(13, 30, u32('#f0ece4')); pb.set(26, 30, u32('#f0ece4'));
    pb.rect(18, 33, 4, 3, u32('#050406'));
    pb.rect(17, 27, 6, 5, u32('#a09888'));
    // rosto magro, maçãs fundas
    ellipseFill(pb, 20, 19, 8, 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? '#ece4d4' : l > -0.2 ? '#d8d0c0' : l > -0.55 ? '#b0a898' : '#7a7068');
    });
    pb.rect(13, 23, 1, 4, u32('#8a8078')); pb.rect(26, 23, 1, 4, u32('#8a8078'));
    // cabelo preto repartido de lado
    ellipseFill(pb, 20, 10, 10, 5, function (x, y, dx, dy) { return dy > 0.6 && Math.abs(dx) < 0.6 ? 0 : u32(x === 16 ? '#3a3844' : '#14121a'); });
    pb.rect(11, 12, 2, 7, u32('#14121a')); pb.rect(27, 12, 2, 6, u32('#14121a'));
    // óculos de aro de arame
    [[16, 19], [24, 19]].forEach(function (e) {
      ellipseFill(pb, e[0], e[1], 3.2, 2.6, function (x, y, dx, dy) { return dx * dx + dy * dy > 0.5 ? u32('#8a8a96') : u32(sad ? '#2a2a34' : '#c8d0b0'); });
      if (!sad) pb.set(e[0], e[1], u32('#f0f8c0'));
    });
    pb.rect(19, 19, 2, 1, u32('#8a8a96'));
    pb.rect(20, 20, 1, 5, u32('#b0a898'));
    pb.rect(17, 27, 7, 1, u32(sad ? '#6a4848' : '#4a2a2a'));
    if (!sad) { pb.set(16, 28, u32('#4a2a2a')); pb.set(24, 28, u32('#4a2a2a')); }
    // pó de giz no ombro
    for (var k = 0; k < 10; k++) pb.set(4 + (k * 7) % 30, 36 + (k % 3), u32('#e8e8e0'));
    return pb.toCanvas();
  }

  /* a Lena, neta do Seu Arnoldo: tranças loiras e fita vermelha */
  function lenaPortrait(scared) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a2a1a', '#060806');
    ellipseFill(pb, 20, 45, 17, 11, function () { return u32('#4a6a3a'); });
    pb.rect(16, 30, 8, 5, u32('#c09078'));
    ellipseFill(pb, 20, 18, 12, 12, function (x, y) { return u32((x + y) % 4 === 0 ? '#c09030' : '#e8c060'); });
    pb.rect(7, 20, 4, 15, u32('#e0b850')); pb.rect(29, 20, 4, 15, u32('#e0b850'));
    for (var y = 22; y < 35; y += 3) { pb.rect(7, y, 4, 1, u32('#b08830')); pb.rect(29, y, 4, 1, u32('#b08830')); }
    pb.rect(6, 34, 6, 3, u32('#c03030')); pb.rect(28, 34, 6, 3, u32('#c03030'));
    ellipseFill(pb, 20, 23, 9, 10, function (x, y, dx, dy) { var l = -dx * 0.6 - dy * 0.3; return u32(l > 0.35 ? '#fff0d8' : l > -0.25 ? '#f0c8a0' : l > -0.6 ? '#d0a080' : '#a07060'); });
    ellipseFill(pb, 20, 14, 10, 5, function (x, y, dx, dy) { return dy > 0.3 ? 0 : u32((x + y) % 3 === 0 ? '#c09030' : '#e8c060'); });
    pb.rect(14, 22, 4, 3, u32('#f8f8f8')); pb.rect(23, 22, 4, 3, u32('#f8f8f8'));
    pb.rect(15, 23, 2, 2, u32('#2a3a5a')); pb.rect(24, 23, 2, 2, u32('#2a3a5a'));
    for (var k = 0; k < 5; k++) pb.set(14 + k * 3, 27 + (k % 2), u32('#e09080'));
    if (scared) ellipseFill(pb, 20.5, 31, 2, 1.6, function () { return u32('#6a2020'); }); else pb.rect(18, 31, 5, 1, u32('#c04050'));
    return pb.toCanvas();
  }

  /* ====================== CABINE: O EWALD NO VOLANTE, VISTO DO BANCO DO CARONA ====================== */
  C6.cabOverlay = function () {
    var W = TC.W, H = TC.H, cv = TC.canvas(W, H), c = cv.ctx;
    c.fillStyle = TC.col('#0c0a10'); c.fillRect(0, 0, W, 13);
    c.fillStyle = TC.col('#1e1a24'); c.fillRect(0, 12, W, 2);
    [[10, 84], [168, 246]].forEach(function (v) {
      c.fillStyle = TC.col('#241c20'); TC.fillPoly(c, [[v[0], 12], [v[1], 12], [v[1] - 4, 26], [v[0] + 4, 26]]);
      c.fillStyle = TC.col('#3a2e32'); c.fillRect(v[0] + 3, 13, v[1] - v[0] - 6, 1);
    });
    c.fillStyle = TC.col('#0e0c12');
    TC.fillPoly(c, [[0, 0], [16, 0], [26, 150], [0, 150]]);
    TC.fillPoly(c, [[W, 0], [W - 26, 0], [W - 40, 150], [W, 150]]);
    c.fillStyle = TC.col('#24202a');
    for (var y = 14; y < 148; y++) { c.fillRect(Math.round(16 + (y / 150) * 10), y, 1, 1); c.fillRect(Math.round(W - 27 - (y / 150) * 14), y, 1, 1); }
    // retrovisor
    c.fillStyle = TC.col('#16141a'); c.fillRect(126, 12, 4, 6);
    c.fillStyle = TC.col('#0a090e'); c.fillRect(102, 17, 52, 12);
    c.fillStyle = TC.col('#1c2038'); c.fillRect(104, 19, 48, 8);
    c.fillStyle = TC.col('#2c3256'); c.fillRect(104, 19, 48, 2);
    // painel (curva baixa à direita, o porta-luvas do carona)
    for (var x = 0; x < W; x++) {
      var t = 140 + Math.round(Math.pow((x - 80) / 176, 2) * -5) + (x > 150 ? 2 : 0);
      c.fillStyle = TC.col('#3e3438'); c.fillRect(x, t, 1, 1);
      c.fillStyle = TC.col('#2a2226'); c.fillRect(x, t + 1, 1, 3);
      c.fillStyle = TC.col('#1a1418'); c.fillRect(x, t + 4, 1, H - t - 4);
    }
    var r = TC.RNG(6);
    for (var i = 0; i < 500; i++) { c.fillStyle = TC.col(r() < 0.5 ? '#221a1e' : '#140f12'); c.fillRect(r.int(0, W - 1), r.int(148, H - 1), 1, 1); }
    // mostradores na frente do motorista (à esquerda)
    c.fillStyle = TC.col('#120e10'); TC.fillEllipse(c, 66, 160, 38, 13);
    c.fillStyle = TC.col('#0a0809'); TC.fillEllipse(c, 66, 165, 34, 10);
    [[50, 166], [82, 166]].forEach(function (g) {
      c.fillStyle = TC.col('#2a2428'); TC.fillCircle(c, g[0], g[1], 10);
      c.fillStyle = TC.col('#060506'); TC.fillCircle(c, g[0], g[1], 8);
      c.fillStyle = TC.col('#c08030');
      for (var k = 0; k <= 8; k++) { var a = Math.PI * 0.75 + k * (Math.PI * 1.5 / 8); c.fillRect(Math.round(g[0] + Math.cos(a) * 6), Math.round(g[1] + Math.sin(a) * 6), 1, 1); }
    });
    // rádio no meio
    c.fillStyle = TC.col('#0a0a0c'); c.fillRect(112, 156, 46, 16);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(112, 156, 46, 1);
    c.fillStyle = TC.col('#062010'); c.fillRect(120, 160, 24, 7);
    c.fillStyle = TC.col('#3a3a44'); TC.fillCircle(c, 116, 164, 2); TC.fillCircle(c, 152, 164, 2);
    // porta-luvas e a fitinha do retrovisor de 1977 (vermelha e branca)
    c.fillStyle = TC.col('#241c20'); c.fillRect(180, 158, 56, 22);
    c.fillStyle = TC.col('#3a2e32'); c.fillRect(180, 158, 56, 1);
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(204, 166, 8, 2);
    // a foto no painel (pai e filho com o caminhão)
    c.fillStyle = TC.col('#d8d0b8'); c.fillRect(164, 144, 14, 11);
    c.fillStyle = TC.col('#8a7458'); c.fillRect(165, 145, 12, 9);
    c.fillStyle = TC.col('#5a4a3a'); c.fillRect(167, 148, 3, 5); c.fillRect(172, 150, 2, 3);
    return cv;
  };
  /* braços de couro marrom do Ewald até as mãos no volante */
  C6.drawEwaldArms = function (ctx, wcx, wcy, ang) {
    [[-150, 4, 178], [-30, 40, 166]].forEach(function (h) {
      var a = h[0] * Math.PI / 180 + ang;
      var hx = wcx + Math.cos(a) * 66, hy = wcy + Math.sin(a) * 66;
      var sx = h[1], sy = h[2], dx = hx - sx, dy = hy - sy;
      var n = Math.ceil(Math.sqrt(dx * dx + dy * dy));
      for (var i = 0; i < n - 4; i++) {
        var t = i / n, x = sx + dx * t, y = sy + dy * t, w = 9 - t * 2.5;
        ctx.fillStyle = TC.col(i % 9 < 1 ? '#3a2214' : '#6a4228');
        TC.fillCircle(ctx, x, y, w);
        ctx.fillStyle = TC.col('#8a5a38');
        ctx.fillRect(Math.round(x - w * 0.5), Math.round(y - w * 0.7), Math.max(1, Math.round(w * 0.5)), 1);
      }
      ctx.fillStyle = TC.col('#2a1a10');
      TC.fillCircle(ctx, sx + dx * ((n - 5) / n), sy + dy * ((n - 5) / n), 6);
    });
  };
  /* perfil do Ewald na contraluz do painel (chapéu de feltro, bigode) */
  C6.ewaldProfile = function () {
    // o pai visto de lado, na contraluz do painel: chapéu de feltro, nariz, bigode, gola da jaqueta de couro
    var cv = TC.canvas(76, 120), c = cv.ctx;
    var dark = '#0c0809', rim = '#a86a3c', rimD = '#6a4024', skin = '#3a2418';
    c.fillStyle = TC.col(dark);
    // ombro e jaqueta
    TC.fillPoly(c, [[0, 120], [0, 78], [10, 70], [28, 66], [44, 70], [56, 84], [66, 120]]);
    // pescoço
    TC.fillPoly(c, [[24, 70], [40, 70], [40, 58], [26, 56]]);
    // cabeça de perfil, olhando para a direita (a estrada)
    TC.fillPoly(c, [[20, 26], [42, 24], [46, 32], [47, 38], [52, 44], [48, 46], [49, 50], [47, 52], [48, 56], [44, 60], [38, 62], [28, 60], [20, 50], [18, 38]]);
    // chapéu
    TC.fillPoly(c, [[6, 28], [60, 23], [60, 26], [48, 28], [46, 12], [38, 7], [24, 9], [20, 28]]);
    // pele do rosto pegando a luz do painel
    c.fillStyle = TC.col(skin);
    TC.fillPoly(c, [[36, 30], [42, 30], [46, 38], [50, 44], [47, 46], [47, 52], [45, 58], [38, 60], [34, 52]]);
    // contraluz
    c.fillStyle = TC.col(rim);
    [[42, 30], [43, 31], [44, 33], [45, 35], [46, 37], [47, 39], [48, 40], [49, 41], [50, 42], [51, 43], [51, 44], [48, 46], [48, 47], [49, 49], [47, 52], [47, 54], [46, 56], [45, 57], [44, 58]].forEach(function (p) { c.fillRect(p[0], p[1], 1, 1); });
    c.fillStyle = TC.col(rimD);
    for (var x = 47; x < 60; x++) c.fillRect(x, Math.round(24 - (x - 47) * 0.1), 1, 1);
    // olho e bigode
    c.fillStyle = TC.col('#e8d8c0'); c.fillRect(43, 36, 1, 1);
    c.fillStyle = TC.col('#1a0e08'); TC.fillPoly(c, [[40, 48], [49, 48], [50, 51], [44, 52], [40, 51]]);
    c.fillStyle = TC.col('#7a5032'); c.fillRect(46, 48, 4, 1);
    // gola e fita do chapéu
    c.fillStyle = TC.col('#3a2414'); c.fillRect(22, 24, 25, 2);
    c.fillStyle = TC.col(rimD); TC.thickLine(c, 40, 64, 52, 74, 1.4);
    for (var y = 74; y < 118; y += 3) c.fillRect(Math.round(52 + (y - 74) * 0.3), y, 1, 1);
    return cv;
  };
  /* o joelho do Arno no banco do carona, com a mão em cima */
  C6.arnoKnee = function () {
    var cv = TC.canvas(76, 30), c = cv.ctx;
    c.fillStyle = TC.col('#1e2c56'); TC.fillEllipse(c, 40, 22, 34, 12);
    c.fillStyle = TC.col('#2c3e70'); TC.fillEllipse(c, 40, 20, 31, 10);
    c.fillStyle = TC.col('#3c5490'); TC.fillEllipse(c, 38, 17, 24, 6);
    c.fillStyle = TC.col('#5a74b0'); TC.fillEllipse(c, 34, 14, 12, 2);
    c.fillStyle = TC.col('#1e2c56'); for (var x = 10; x < 70; x += 3) c.fillRect(x, Math.round(26 - Math.sin((x - 10) / 60 * Math.PI) * 8), 1, 1);
    // a mão e o punho da camisa xadrez
    c.fillStyle = TC.col('#7a2420'); c.fillRect(54, 6, 16, 8);
    c.fillStyle = TC.col('#b03428'); c.fillRect(54, 6, 16, 2); c.fillRect(58, 6, 2, 8); c.fillRect(64, 6, 2, 8);
    c.fillStyle = TC.col('#c88a5a'); TC.fillEllipse(c, 50, 12, 7, 4);
    c.fillStyle = TC.col('#e8aa76'); TC.fillEllipse(c, 49, 11, 5, 2);
    c.fillStyle = TC.col('#9a5e3a'); c.fillRect(44, 14, 10, 1);
    return cv;
  };

  /* ====================== AMBIENTE ====================== */
  C6.tiles = function () {
    var T = {};
    // estrada de chão batido (terra vermelha da colônia) com capim na beira
    T.roadTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y < 2) return H2(xx, y, 600) > 0.6 ? (H2(xx, y, 601) > 0.5 ? '#3a5a30' : '#5a7a40') : null;
        if (y < 3) return H2(xx, 2, 602) > 0.4 ? '#4a6a34' : '#8a5a38';
        if (y < 7) { var rut = (y === 4 || y === 5) && (xx % 16 < 12); return rut ? (H2(xx, y, 603) > 0.7 ? '#5a3424' : '#6a3e2a') : (H2(xx, y, 604) > 0.85 ? '#b08060' : '#8a5a3a'); }
        if (y === 7) return '#4a2c1c';
        var n = H2(xx, y, 605);
        return n > 0.9 ? '#8a6048' : n > 0.45 ? '#4a2a1c' : '#3a2016';
      });
    });
    T.earth = [0, 1].map(function (v) { return tile(function (x, y) { var n = H2(x + v * 16, y, 606); return n > 0.92 ? '#7a5038' : n > 0.45 ? '#4a2a1c' : '#3a2016'; }); });
    // terra lavrada do milharal, com os tocos das canas
    T.fieldTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y < 4 && (xx % 8 === 3) && y > 3 - (1 + (xx >> 3) % 3)) return '#c8b070';
        if (y < 4) return null;
        if (y === 4) return xx % 8 < 6 ? '#5a3a24' : '#3a2416';
        if (y < 8) return ((xx + y * 2) % 8 < 3) ? '#2a1a10' : (H2(xx, y, 610) > 0.8 ? '#6a4630' : '#4a2e1e');
        var n = H2(xx, y, 611);
        return n > 0.88 ? '#6a4630' : n > 0.45 ? '#3a2416' : '#2e1c12';
      });
    });
    // piso de tábuas envernizadas da cancha de bolão
    T.laneTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#e8c890';
        if (y < 6) return (y === 3) ? '#7a5030' : (xx % 16 === 15 ? '#6a4428' : (H2(xx >> 4, y, 620) > 0.5 ? '#c8a070' : '#b88e5e'));
        if (y === 6) return '#5a3820';
        if (y < 9) return '#3a2414';
        return (x === 3 || x === 12) ? '#4a3020' : (y % 6 === 0 ? '#2a1a10' : '#1e140c');
      });
    });
    // pátio da escola: chão batido com pedrisco
    T.yardTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y < 1) return H2(xx, y, 630) > 0.75 ? '#5a7a40' : null;
        if (y < 5) return H2(xx, y, 631) > 0.8 ? '#c0b0a0' : (H2(xx, y, 632) > 0.5 ? '#7a6050' : '#6a5242');
        if (y === 5) return '#3a2a20';
        var n = H2(xx, y, 633);
        return n > 0.9 ? '#6a5040' : n > 0.45 ? '#3a2a20' : '#30221a';
      });
    });
    // assoalho da sala de aula
    T.floorTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#b08860';
        if (y < 6) return (y === 3) ? '#4a3020' : (xx % 12 === 11 ? '#4a3020' : (H2(xx / 12 | 0, y >> 2, 640) > 0.5 ? '#8a6440' : '#7a5636'));
        if (y === 6) return '#3a2414';
        return (y % 5 === 0) ? '#1e140c' : '#2a1c12';
      });
    });
    return T;
  };

  /* fundo: casas da colônia ao longe, silhuetas de araucária e uma janela acesa aqui e ali */
  C6.farmRow = function (w, seed) {
    var H = 120, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 9);
    var sil = '#0c0e1e', rim = '#1e2448';
    for (var k = 0; k < w / 90; k++) {
      var x = r.int(0, w), h = r.int(50, 110);
      var tr = r() < 0.6 ? ART.araucaria(seed + k, h, { sil: sil, rim: rim }) : ART.pine(seed + k + 50, Math.round(h * 0.55), { sil: sil });
      [-w, 0, w].forEach(function (o) { c.drawImage(tr, x - tr.baseX + o, H - tr.height); });
    }
    for (k = 0; k < w / 160; k++) {
      var hx = r.int(0, w - 60), hw = r.int(34, 54), hh = r.int(18, 26), roof = Math.round(hw * 0.45);
      [-w, 0, w].forEach(function (o) {
        var bx = hx + o, by = H - hh;
        c.fillStyle = TC.col(sil); c.fillRect(bx, by, hw, hh);
        TC.fillPoly(c, [[bx - 3, by], [bx + hw / 2, by - roof], [bx + hw + 3, by]]);
        c.fillStyle = TC.col(rim); for (var q = 0; q < hw / 2 + 3; q++) c.fillRect(Math.round(bx - 3 + q), Math.round(by - q * roof / (hw / 2 + 3)), 1, 1);
        // enxaimel apagado e uma janela acesa
        c.fillStyle = TC.col('#14162a'); c.fillRect(bx + 4, by + 4, hw - 8, 1); c.fillRect(bx + Math.round(hw / 2), by + 4, 1, hh - 4);
        if (r() < 0.7) { c.fillStyle = TC.col('#e8b050'); c.fillRect(bx + 6 + r.int(0, hw - 16), by + 7, 3, 4); }
      });
      // silo / galpão
      if (r() < 0.5) { var sx = hx + hw + 10; [-w, 0, w].forEach(function (o) { c.fillStyle = TC.col(sil); c.fillRect(sx + o, H - 36, 10, 36); TC.fillEllipse(c, sx + 5 + o, H - 36, 5, 3); }); }
    }
    c.fillStyle = TC.col(sil); c.fillRect(0, H - 6, w, 6);
    return cv;
  };

  /* a porteira da Linha Esperança, com a placa de 1852 */
  C6.porteira = function () {
    var W = 150, H = 96, cv = TC.canvas(W, H), c = cv.ctx;
    function post(x) {
      c.fillStyle = TC.col('#3a2414'); c.fillRect(x, 10, 8, H - 10);
      c.fillStyle = TC.col('#5a3a22'); c.fillRect(x, 10, 2, H - 10);
      c.fillStyle = TC.col('#24160c'); c.fillRect(x + 7, 10, 1, H - 10);
      for (var y = 18; y < H; y += 9) { c.fillStyle = TC.col('#2a1a10'); c.fillRect(x + 2, y, 4, 1); }
    }
    post(6); post(W - 14);
    // travessa com a placa entalhada
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(2, 6, W - 4, 8);
    c.fillStyle = TC.col('#4a2e18'); c.fillRect(2, 6, W - 4, 2);
    c.fillStyle = TC.col('#1a1008'); c.fillRect(20, 14, W - 40, 26);
    c.fillStyle = TC.col('#6a4a2c'); c.fillRect(21, 15, W - 42, 24);
    c.fillStyle = TC.col('#8a6a44'); c.fillRect(21, 15, W - 42, 1);
    TC.font.draw(c, 'LINHA ESPERANÇA', W / 2, 18, '#f0e0b0', { align: 'center', shadow: '#2a1a10' });
    TC.font.draw(c, '1852', W / 2, 28, '#e8c070', { align: 'center', shadow: '#2a1a10' });
    c.fillStyle = TC.col('#3a2414'); c.fillRect(46, 40, 1, 6); c.fillRect(W - 47, 40, 1, 6);
    c.fillStyle = TC.col('#1a1008'); c.fillRect(38, 46, W - 76, 11);
    c.fillStyle = TC.col('#5a4028'); c.fillRect(39, 47, W - 78, 9);
    TC.font.draw(c, 'Hoffnungsschneiss', W / 2, 48, '#d8c8a0', { align: 'center' });
    // a porteira de cinco tábuas, aberta para dentro
    c.fillStyle = TC.col('#7a5a38');
    for (var b = 0; b < 5; b++) TC.fillPoly(c, [[W - 14, 58 + b * 7], [W - 60, 52 + b * 7 + 4], [W - 60, 55 + b * 7 + 4], [W - 14, 61 + b * 7]]);
    c.fillStyle = TC.col('#5a3e26'); TC.thickLine(c, W - 15, 59, W - 58, 84, 2);
    c.fillStyle = TC.col('#3a2818'); c.fillRect(W - 62, 54, 3, 40);
    return cv;
  };

  /* estufa de fumo: galpão alto de tijolo e tábua, com a fornalha acesa embaixo */
  C6.estufa = function (seed, wide) {
    var r = TC.RNG(seed || 3), W = wide ? 112 : 80, H = 132, cv = TC.canvas(W + 30, H), c = cv.ctx;
    var bx = 4, roofY = 30, wallY = 50;
    // chaminé de tijolo
    for (var y = 6; y < H; y++) for (var x = W - 6; x < W + 4; x++) {
      c.fillStyle = TC.col(((y >> 2) + ((x >> 3) & 1)) % 2 === 0 && (x % 8 === 0 || y % 4 === 0) ? '#3a1a10' : (H2(x, y >> 2, 7) > 0.5 ? '#7a3a28' : '#6a3020'));
      c.fillRect(x, y, 1, 1);
    }
    c.fillStyle = TC.col('#2a1008'); c.fillRect(W - 7, 4, 12, 3);
    // telhado de zinco de duas águas
    for (y = 0; y < wallY - roofY + 8; y++) {
      var hw = W / 2 * (y / (wallY - roofY + 8)) + 4;
      for (x = Math.round(W / 2 - hw); x <= Math.round(W / 2 + hw); x++) {
        c.fillStyle = TC.col(x % 4 === 0 ? '#3a3a44' : (H2(x >> 2, y >> 2, 5) > 0.82 ? '#7a4a30' : (x < W / 2 ? '#6a6a74' : '#4a4a54')));
        c.fillRect(bx + x - 4, roofY - 8 + y, 1, 1);
      }
    }
    // parede de tábuas (parte de cima) e tijolo (embaixo)
    for (x = bx; x < bx + W - 8; x++) {
      for (y = wallY; y < H - 40; y++) {
        c.fillStyle = TC.col(x % 6 === 0 ? '#1e140c' : (H2(x, 1, 9) > 0.8 ? '#4a3220' : '#3a2616'));
        c.fillRect(x, y, 1, 1);
      }
      for (y = H - 40; y < H; y++) {
        var row = Math.floor((y - (H - 40)) / 4), bxx = (x + (row % 2) * 4) % 8;
        c.fillStyle = TC.col(bxx === 0 || (y - (H - 40)) % 4 === 3 ? '#2a1410' : (H2(Math.floor((x + (row % 2) * 4) / 8), row, 11) > 0.5 ? '#8a4030' : '#7a3626'));
        c.fillRect(x, y, 1, 1);
      }
    }
    // janelinha de ventilação e a porta de carga
    c.fillStyle = TC.col('#0a0606'); c.fillRect(bx + 10, wallY + 8, 14, 10);
    c.fillStyle = TC.col('#2a1a10'); for (y = wallY + 9; y < wallY + 18; y += 3) c.fillRect(bx + 10, y, 14, 1);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(bx + W - 40, wallY + 6, 22, 30);
    c.fillStyle = TC.col('#4a3020'); for (x = bx + W - 39; x < bx + W - 19; x += 4) c.fillRect(x, wallY + 7, 2, 28);
    // a boca da fornalha (arco) com o fogo
    var fx = bx + Math.round(W / 2) - 4, fy = H - 2;
    c.fillStyle = TC.col('#1a0a06');
    for (y = 0; y < 18; y++) { var aw = y < 6 ? Math.round(Math.sqrt(36 - (6 - y) * (6 - y)) * 1.6) : 10; c.fillRect(fx - aw, fy - 18 + y, aw * 2, 1); }
    c.fillStyle = TC.col('#c03010'); c.fillRect(fx - 8, fy - 9, 16, 7);
    c.fillStyle = TC.col('#ff8020'); c.fillRect(fx - 7, fy - 7, 14, 5);
    c.fillStyle = TC.col('#ffe080'); c.fillRect(fx - 4, fy - 5, 8, 3);
    for (x = -8; x <= 8; x += 2) { c.fillStyle = TC.col('#2a1006'); c.fillRect(fx + x, fy - 2, 1, 2); }
    c.fillStyle = TC.col('#5a5a66'); c.fillRect(fx - 11, fy - 19, 22, 2);
    // varas com as folhas de fumo secando debaixo do beiral
    var rackY = wallY + 2;
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(bx - 4, rackY, 30, 2);
    cv.furnaceX = fx; cv.furnaceY = fy - 8;
    cv.leaves = [];
    for (x = bx - 2; x < bx + 24; x += 4) {
      var lc = r.pick(['#a07830', '#c89a40', '#8a5a20', '#6a4a20']);
      c.fillStyle = TC.col(lc);
      TC.fillPoly(c, [[x, rackY + 2], [x + 3, rackY + 2], [x + 2, rackY + 14 + r.int(0, 4)], [x + 1, rackY + 14]]);
    }
    return cv;
  };

  /* árvore grande (cinamomo) com barba-de-velho pendurada nos galhos */
  C6.bigTree = function (seed) {
    var r = TC.RNG(seed || 1), W = 150, H = 160, pb = new TC.PixBuf(W, H), cx = 75;
    var bark = u32('#1e1812'), barkL = u32('#3a2e22');
    for (var y = 60; y < H; y++) {
      var tw = 6 + Math.max(0, y - 130) * 0.4;
      for (var x = -tw; x <= tw; x++) pb.set(cx + x, y, x > tw - 2 ? barkL : bark);
    }
    var tips = [];
    for (var b = 0; b < 7; b++) {
      var a = -Math.PI / 2 + (b - 3) * 0.42 + r.range(-0.1, 0.1), len = r.range(40, 70);
      var x0 = cx, y0 = 70 + r.int(-6, 10);
      var x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len * 0.7;
      thick(pb, x0, y0, x1, y1, 3, function () { return bark; });
      tips.push([x1, y1]);
      for (var s = 0; s < 3; s++) {
        var sa = a + r.range(-0.7, 0.7), sl = r.range(14, 26), t = r.range(0.4, 0.9);
        var sx = x0 + (x1 - x0) * t, sy = y0 + (y1 - y0) * t;
        thick(pb, sx, sy, sx + Math.cos(sa) * sl, sy + Math.sin(sa) * sl * 0.7, 1.5, function () { return bark; });
        tips.push([sx + Math.cos(sa) * sl, sy + Math.sin(sa) * sl * 0.7]);
      }
    }
    // folhagem escura em tufos
    tips.forEach(function (tp, i) {
      var rr = r.range(8, 15);
      for (var yy = -rr; yy <= rr; yy++) for (var xx = -rr * 1.3; xx <= rr * 1.3; xx++) {
        if ((xx * xx) / (rr * rr * 1.7) + (yy * yy) / (rr * rr) > 1 - H2(Math.round(tp[0] + xx), Math.round(tp[1] + yy), 5) * 0.35) continue;
        var l = -yy / rr * 0.6 + H2(Math.round(xx * 2), Math.round(yy * 2), i) * 0.5;
        pb.set(tp[0] + xx, tp[1] + yy, u32(l > 0.7 ? '#2a3a30' : l > 0.25 ? '#18241e' : '#101814'));
      }
    });
    // barba-de-velho caindo em cortinas
    tips.forEach(function (tp, i) {
      if (i % 2) return;
      var n = r.int(4, 9);
      for (var k = 0; k < n; k++) {
        var x0 = tp[0] + r.range(-10, 10), y0 = tp[1] + r.range(0, 8), len = r.range(14, 40), col = u32(r.pick(['#8a9a7a', '#a8b498', '#6a7a5a', '#c0c8b0']));
        for (var q = 0; q < len; q++) pb.set(Math.round(x0 + Math.sin(q * 0.3 + k) * 1.3), Math.round(y0 + q), col);
      }
    });
    var cv = pb.toCanvas();
    cv.baseX = cx;
    return cv;
  };

  /* cerca de moirão com arame farpado */
  C6.fence = function (w) {
    var H = 30, cv = TC.canvas(w, H), c = cv.ctx;
    for (var x = 4; x < w; x += 28) {
      c.fillStyle = TC.col('#4a3420'); c.fillRect(x, 4, 4, H - 4);
      c.fillStyle = TC.col('#6a4a2e'); c.fillRect(x, 4, 1, H - 4);
      c.fillStyle = TC.col('#2a1a10'); c.fillRect(x, 3, 4, 1);
    }
    [9, 16, 23].forEach(function (y, k) {
      for (x = 0; x < w; x++) {
        var yy = y + Math.round(Math.sin((x % 28) / 28 * Math.PI) * 1.5);
        c.fillStyle = TC.col('#5a5a66'); c.fillRect(x, yy, 1, 1);
        if ((x + k * 5) % 9 === 0) { c.fillStyle = TC.col('#8a8a96'); c.fillRect(x, yy - 1, 1, 3); c.fillRect(x - 1, yy, 3, 1); }
      }
    });
    return cv;
  };

  /* pés de milho (fileira): o fundo, mais claro, e a frente, em silhueta */
  C6.cornRow = function (w, h, seed, cols) {
    var r = TC.RNG(seed || 4), cv = TC.canvas(w, h), c = cv.ctx;
    cols = cols || { stalk: '#3a4a2a', leaf: '#4a5e34', leafL: '#6a7a44', tassel: '#c8a860', ear: '#a89050' };
    for (var x = 2; x < w; x += r.int(6, 10)) {
      var sh = h - r.int(0, Math.round(h * 0.25)), top = h - sh;
      c.fillStyle = TC.col(cols.stalk); c.fillRect(x, top + 6, 2, sh - 6);
      for (var k = 0; k < 5; k++) {
        var ly = top + 10 + k * (sh / 6), side = (k % 2) ? 1 : -1, len = r.int(8, 14);
        c.fillStyle = TC.col(k % 2 ? cols.leaf : cols.leafL);
        for (var q = 0; q < len; q++) c.fillRect(Math.round(x + side * q), Math.round(ly - Math.sin(q / len * 2.4) * 5 + q * 0.25), 2, 1);
      }
      c.fillStyle = TC.col(cols.tassel);
      for (q = 0; q < 5; q++) c.fillRect(x - 2 + q, top + (q % 2) * 2, 1, 6);
      if (r() < 0.5) { c.fillStyle = TC.col(cols.ear); c.fillRect(x + 2, top + Math.round(sh * 0.45), 2, 6); }
    }
    return cv;
  };

  /* a venda do Seu Arnoldo: secos e molhados */
  C6.venda = function () {
    var W = 200, H = 130, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(21);
    var wallY = 34;
    // telhado de telha francesa
    for (var y = 0; y < wallY; y++) {
      var inset = Math.round((wallY - y) * 0.9);
      for (var x = inset; x < W - inset; x++) {
        c.fillStyle = TC.col((y % 5 === 4) ? '#4a1e14' : ((x + (y / 5 | 0) * 3) % 7 === 0 ? '#5a2418' : (H2(x >> 2, y / 5 | 0, 3) > 0.7 ? '#8a4030' : '#7a3426')));
        c.fillRect(x, y + 4, 1, 1);
      }
    }
    // paredes de tábua pintadas de verde-água desbotado
    for (x = 6; x < W - 6; x++) for (y = wallY + 4; y < H; y++) {
      c.fillStyle = TC.col(y % 7 === 0 ? '#3a5048' : (H2(x >> 3, y / 7 | 0, 23) > 0.85 ? '#5a7a6a' : '#6a8a78'));
      c.fillRect(x, y, 1, 1);
    }
    // letreiro
    c.fillStyle = TC.col('#1a1410'); c.fillRect(30, wallY + 6, 140, 18);
    c.fillStyle = TC.col('#e8dcc0'); c.fillRect(31, wallY + 7, 138, 16);
    c.fillStyle = TC.col('#a02820'); c.fillRect(31, wallY + 7, 138, 2); c.fillRect(31, wallY + 21, 138, 2);
    TC.font.draw(c, 'SECOS E MOLHADOS', 100, wallY + 11, '#2a1a10', { align: 'center' });
    // portas abertas com a luz do lampião lá dentro e as prateleiras
    var dx = 70, dy = wallY + 30, dw = 60, dh = H - dy;
    c.fillStyle = TC.col('#5a3a1e'); c.fillRect(dx, dy, dw, dh);
    for (y = dy + 6; y < H; y += 14) { c.fillStyle = TC.col('#3a2412'); c.fillRect(dx + 2, y, dw - 4, 2); }
    for (var k = 0; k < 26; k++) {
      var bx = dx + 4 + r.int(0, dw - 8), by = dy + 6 + r.int(0, 4) * 14 - 6;
      if (by + 6 > H) continue;
      c.fillStyle = TC.col(r.pick(['#3a8a4a', '#a0302a', '#d8c070', '#e8e0d0', '#6a4a8a', '#8a5a30']));
      c.fillRect(bx, by, 2, 6);
    }
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(dx - 3, dy - 2, 3, dh + 2); c.fillRect(dx + dw, dy - 2, 3, dh + 2); c.fillRect(dx - 3, dy - 3, dw + 6, 2);
    // janelas com as tramelas
    [[20, wallY + 34], [150, wallY + 34]].forEach(function (w) {
      c.fillStyle = TC.col('#e8e4dc'); c.fillRect(w[0], w[1], 30, 24);
      c.fillStyle = TC.col('#e0a050'); c.fillRect(w[0] + 2, w[1] + 2, 26, 20);
      c.fillStyle = TC.col('#e8e4dc'); c.fillRect(w[0] + 14, w[1], 2, 24); c.fillRect(w[0], w[1] + 11, 30, 2);
      c.fillStyle = TC.col('#3a5a4a'); c.fillRect(w[0] - 9, w[1] - 1, 8, 26); c.fillRect(w[0] + 31, w[1] - 1, 8, 26);
    });
    // a plaquinha do fiado
    c.fillStyle = TC.col('#1a1410'); c.fillRect(134, wallY + 62, 36, 14);
    c.fillStyle = TC.col('#c8b890'); c.fillRect(135, wallY + 63, 34, 12);
    TC.font.draw(c, 'FIADO', 152, wallY + 63, '#6a2a1a', { align: 'center' });
    cv.doorX = dx + dw / 2; cv.lampX = 54; cv.lampY = wallY + 30;
    // lampião de querosene pendurado
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(cv.lampX, wallY + 22, 1, 5);
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(cv.lampX - 2, wallY + 27, 5, 6);
    c.fillStyle = TC.col('#ffe090'); c.fillRect(cv.lampX - 1, wallY + 28, 3, 4);
    return cv;
  };
  /* varanda: sacos de feijão e arroz, uma pipa de cachaça e uma bicicleta encostada */
  C6.vendaProps = function () {
    var cv = TC.canvas(120, 34), c = cv.ctx;
    function sackAt(x, h, col, lbl) {
      c.fillStyle = TC.col('#3a2a14'); TC.fillEllipse(c, x, 34 - h / 2, 9, h / 2);
      c.fillStyle = TC.col(col); TC.fillEllipse(c, x, 34 - h / 2, 8, h / 2 - 1);
      c.fillStyle = TC.col('#e8e0c8'); TC.fillEllipse(c, x, 34 - h - 1, 5, 2);
      if (lbl) TC.font.draw(c, lbl, x, 34 - h / 2 - 3, '#5a3a1a', { align: 'center' });
    }
    sackAt(10, 22, '#b89a60', 'F'); sackAt(26, 20, '#c8ac70', 'A'); sackAt(18, 14, '#a88a50');
    var b = ART.barrel_ || ART.barrel();
    c.drawImage(b, 40, 34 - b.height);
    // bicicleta
    c.fillStyle = TC.col('#1a1a20');
    [[74, 26], [100, 26]].forEach(function (w) { for (var a = 0; a < TC.TAU; a += 0.15) c.fillRect(Math.round(w[0] + Math.cos(a) * 7), Math.round(w[1] + Math.sin(a) * 7), 1, 1); });
    c.fillStyle = TC.col('#8a2a20');
    TC.thickLine(c, 74, 26, 84, 16, 1.5); TC.thickLine(c, 84, 16, 98, 16, 1.5); TC.thickLine(c, 84, 16, 88, 26, 1.5); TC.thickLine(c, 88, 26, 100, 26, 1.5); TC.thickLine(c, 98, 16, 100, 26, 1.5);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(82, 13, 5, 2); c.fillRect(96, 12, 5, 1);
    return cv;
  };

  /* cancha de bolão: galpão comprido aberto, cancha de tábua, quadro de pontos e flâmulas */
  C6.cancha = function (w) {
    var H = 150, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(33);
    var roofY = 20, eave = 44;
    c.fillStyle = TC.col('#120c0a'); c.fillRect(0, eave, w, H - eave);
    // parede de tábuas no fundo
    for (var x = 0; x < w; x++) {
      c.fillStyle = TC.col(x % 9 === 0 ? '#1e1410' : (H2(x / 9 | 0, 2, 41) > 0.7 ? '#4a3424' : '#3e2a1c'));
      c.fillRect(x, eave + 10, 1, H - eave - 46);
    }
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(0, H - 38, w, 3);
    // a cancha (vista de lado): tábuas claras com a canaleta
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(0, H - 35, w, 35);
    for (x = 0; x < w; x++) { c.fillStyle = TC.col(x % 24 === 0 ? '#8a6a40' : '#c8a070'); c.fillRect(x, H - 33, 1, 3); }
    c.fillStyle = TC.col('#e8c890'); c.fillRect(0, H - 33, w, 1);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, H - 29, w, 2);
    // o trilho de volta das bolas
    c.fillStyle = TC.col('#6a4a2a'); c.fillRect(0, H - 52, w, 2);
    c.fillStyle = TC.col('#4a3020'); for (x = 8; x < w; x += 40) c.fillRect(x, H - 50, 2, 12);
    // telhado de telha
    for (x = 0; x < w; x++) {
      var top = roofY + Math.round(((x % 256) / 256) * 3);
      for (var y = top; y < eave; y++) {
        c.fillStyle = TC.col((y % 5 === 4) ? '#3a1a10' : ((x + (y / 5 | 0) * 3) % 7 === 0 ? '#4a2014' : '#6a2e20'));
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(0, eave, w, 4);
    // pilares
    for (x = 2; x < w; x += 64) {
      c.fillStyle = TC.col('#4a3020'); c.fillRect(x, eave + 4, 6, H - eave - 4);
      c.fillStyle = TC.col('#6a4a30'); c.fillRect(x, eave + 4, 2, H - eave - 4);
    }
    // flâmulas dos clubes e o quadro de pontos
    var cols = ['#c02828', '#e8c040', '#2a7a3a', '#2a4aa0', '#e8e8e0'];
    for (x = 20; x < w - 20; x += 38) {
      var col = cols[(x / 38 | 0) % cols.length];
      c.fillStyle = TC.col(col); TC.fillPoly(c, [[x, eave + 14], [x + 14, eave + 14], [x + 7, eave + 30]]);
      c.fillStyle = TC.col('#2a1a10'); c.fillRect(x, eave + 13, 15, 1);
    }
    var qx = Math.round(w * 0.42);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(qx - 2, eave + 34, 64, 40);
    c.fillStyle = TC.col('#1a2a20'); c.fillRect(qx, eave + 36, 60, 36);
    TC.font.draw(c, 'GUT HOLZ!', qx + 30, eave + 39, '#e8e8e0', { align: 'center' });
    c.fillStyle = TC.col('#d8d8d0');
    for (var k = 0; k < 9; k++) { c.fillRect(qx + 6 + k * 5, eave + 52, 1, 5); if (k % 5 === 4) c.fillRect(qx + 4 + (k - 4) * 5, eave + 54, 22, 1); }
    TC.font.draw(c, 'SCHMITT  WEBER', qx + 30, eave + 60, '#a8b8a8', { align: 'center' });
    // lâmpadas peladas no fio
    cv.bulbs = [];
    for (x = 30; x < w; x += 80) { c.fillStyle = TC.col('#2a2a30'); c.fillRect(x, eave + 4, 1, 8); c.fillStyle = TC.col('#e8d8a0'); c.fillRect(x - 1, eave + 12, 3, 3); cv.bulbs.push({ x: x, y: eave + 13 }); }
    // caixas de cerveja e um banco
    for (x = 60; x < w; x += 150) {
      c.fillStyle = TC.col('#8a2a20'); c.fillRect(x, H - 50, 14, 10); c.fillRect(x + 3, H - 60, 14, 10);
      c.fillStyle = TC.col('#d8b040'); c.fillRect(x + 1, H - 49, 2, 2); c.fillRect(x + 6, H - 49, 2, 2); c.fillRect(x + 11, H - 49, 2, 2);
    }
    return cv;
  };
  /* o fundo da cancha, onde ficam os nove pinos */
  C6.pinDeck = function () {
    var cv = TC.canvas(60, 70), c = cv.ctx;
    c.fillStyle = TC.col('#0a0606'); c.fillRect(0, 0, 60, 70);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(0, 0, 60, 6);
    for (var x = 2; x < 58; x += 4) { c.fillStyle = TC.col('#1a1210'); c.fillRect(x, 6, 2, 50); }
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(0, 56, 60, 14);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, 56, 60, 2);
    return cv;
  };

  /* cruz de ferro forjado (cemitério de família) */
  C6.ironCross = function (seed) {
    var r = TC.RNG(seed || 1), cv = TC.canvas(24, 44), c = cv.ctx;
    var iron = '#2a2a34', ironL = '#5a5a6a';
    c.fillStyle = TC.col('#5a5664'); c.fillRect(4, 38, 16, 6);
    c.fillStyle = TC.col('#7a7684'); c.fillRect(4, 38, 16, 1);
    c.fillStyle = TC.col(iron); c.fillRect(11, 4, 3, 35); c.fillRect(3, 12, 19, 3);
    c.fillStyle = TC.col(ironL); c.fillRect(11, 4, 1, 35); c.fillRect(3, 12, 19, 1);
    // círculo e pontas em flor-de-lis
    c.fillStyle = TC.col(iron);
    for (var a = 0; a < TC.TAU; a += 0.1) c.fillRect(Math.round(12.5 + Math.cos(a) * 6), Math.round(13.5 + Math.sin(a) * 6), 1, 1);
    [[12, 2], [1, 13], [23, 13]].forEach(function (p) { TC.fillCircle(c, p[0], p[1], 1.5); });
    c.fillStyle = TC.col('#8a7a5a'); c.fillRect(8, 20, 9, 6);
    c.fillStyle = TC.col('#3a3020'); c.fillRect(9, 22, 7, 1); c.fillRect(9, 24, 5, 1);
    if (r() < 0.5) { c.fillStyle = TC.col('#8a2a4a'); c.fillRect(6, 34, 3, 4); c.fillRect(15, 35, 3, 3); }
    return cv;
  };
  /* lápide de basalto: "Hier ruht in Gott" */
  C6.gravestone = function (seed) {
    var cv = TC.canvas(40, 36), c = cv.ctx;
    c.fillStyle = TC.col('#2a2830'); TC.fillPoly(c, [[2, 36], [2, 10], [8, 3], [32, 3], [38, 10], [38, 36]]);
    c.fillStyle = TC.col('#4a4654'); TC.fillPoly(c, [[4, 36], [4, 11], [9, 5], [31, 5], [36, 11], [36, 36]]);
    c.fillStyle = TC.col('#5a5664'); c.fillRect(9, 5, 22, 1);
    TC.font.draw(c, 'HIER RUHT', 20, 10, '#a8a4b0', { align: 'center' });
    TC.font.draw(c, 'IN GOTT', 20, 19, '#a8a4b0', { align: 'center' });
    c.fillStyle = TC.col('#3a5a3a'); c.fillRect(4, 30, 8, 6); c.fillRect(28, 32, 8, 4);
    return cv;
  };
  /* muro baixo caiado do cemitério com o portãozinho de ferro */
  C6.cemWall = function (w) {
    var H = 34, cv = TC.canvas(w, H), c = cv.ctx;
    for (var x = 0; x < w; x++) for (var y = 14; y < H; y++) {
      c.fillStyle = TC.col(y === 14 ? '#d8d4c8' : (H2(x >> 2, y >> 2, 51) > 0.86 ? '#8a8478' : '#b8b4a8'));
      c.fillRect(x, y, 1, 1);
    }
    c.fillStyle = TC.col('#e8e4dc'); c.fillRect(0, 12, w, 3);
    // portão
    var gx = 24;
    c.fillStyle = TC.col('#0a0a10'); c.fillRect(gx, 6, 26, H - 6);
    c.fillStyle = TC.col('#3a3a44');
    for (x = gx + 2; x < gx + 26; x += 4) c.fillRect(x, 6, 1, H - 6);
    for (var a = Math.PI; a < TC.TAU; a += 0.08) c.fillRect(Math.round(gx + 13 + Math.cos(a) * 13), Math.round(8 + Math.sin(a) * 6), 1, 1);
    c.fillRect(gx + 12, 0, 2, 6); c.fillRect(gx + 10, 2, 6, 1);
    return cv;
  };

  /* a casa de pedra da Oma Hedwig (basalto, venezianas fechadas, hera) */
  C6.stoneHouse = function (open) {
    var W = 170, H = 128, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(1901);
    var wallY = 46;
    // telhado de telha coberto de musgo
    for (var y = 0; y < wallY; y++) {
      var inset = Math.round((wallY - y) * 1.1);
      for (var x = inset; x < W - inset; x++) {
        var moss = H2(x >> 1, y >> 1, 61) > 0.72;
        c.fillStyle = TC.col(moss ? (H2(x, y, 62) > 0.5 ? '#3a5a34' : '#2a4428') : ((y % 5 === 4) ? '#3a1a12' : ((x + (y / 5 | 0) * 3) % 7 === 0 ? '#4a2216' : '#6a3022')));
        c.fillRect(x, y + 2, 1, 1);
      }
    }
    // chaminé
    for (y = 2; y < 30; y++) for (x = 120; x < 132; x++) { c.fillStyle = TC.col(((x - 120) % 6 === 0 || y % 5 === 0) ? '#2a2620' : '#5a544a'); c.fillRect(x, y, 1, 1); }
    // paredes de pedra irregular
    var stones = TC.canvas(W - 16, H - wallY), sc = stones.ctx;
    sc.fillStyle = TC.col('#1a1814'); sc.fillRect(0, 0, stones.width, stones.height);
    for (var k = 0; k < 160; k++) {
      var sx = r.int(-6, stones.width), sy = r.int(-4, stones.height), sw = r.int(8, 16), sh = r.int(5, 9);
      var col = r.pick(['#5a544a', '#4a463e', '#6a6458', '#3e3a34', '#5e5446']);
      sc.fillStyle = TC.col(col); TC.fillEllipse(sc, sx, sy, sw / 2, sh / 2);
      sc.fillStyle = TC.col(TC.mix(col, '#ffffff', 0.15)); sc.fillRect(sx - (sw >> 2), sy - (sh >> 1) + 1, sw >> 1, 1);
    }
    c.drawImage(stones, 8, wallY);
    // janelas com venezianas verdes fechadas
    [[26, wallY + 20], [118, wallY + 20]].forEach(function (w) {
      c.fillStyle = TC.col('#e0dccc'); c.fillRect(w[0] - 2, w[1] - 2, 28, 30);
      c.fillStyle = TC.col('#2a4a3a'); c.fillRect(w[0], w[1], 24, 26);
      c.fillStyle = TC.col('#3a6a4a'); for (var yy = w[1] + 2; yy < w[1] + 26; yy += 3) c.fillRect(w[0] + 1, yy, 22, 1);
      c.fillStyle = TC.col('#1a2a20'); c.fillRect(w[0] + 11, w[1], 2, 26);
    });
    // a porta em arco
    var dx = 74, dw = 24, dh = 40, dy = H - dh;
    c.fillStyle = TC.col('#e0dccc'); c.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
    if (open) {
      c.fillStyle = TC.col('#3a2010'); c.fillRect(dx, dy, dw, dh);
      c.fillStyle = TC.col('#ffc060'); c.fillRect(dx + 2, dy + 3, dw - 8, dh - 3);
      c.fillStyle = TC.col('#5a3a20'); c.fillRect(dx + dw - 6, dy, 6, dh);
    } else {
      c.fillStyle = TC.col('#3a2416'); c.fillRect(dx, dy, dw, dh);
      c.fillStyle = TC.col('#2a180e'); for (x = dx + 4; x < dx + dw; x += 5) c.fillRect(x, dy, 1, dh);
      c.fillStyle = TC.col('#8a7a5a'); c.fillRect(dx + dw - 6, dy + 20, 2, 2);
    }
    c.fillStyle = TC.col('#5a544a'); c.fillRect(dx - 5, H - 3, dw + 10, 3);
    // inscrição na verga
    TC.font.draw(c, '1853', dx + dw / 2, dy - 12, '#c8c0b0', { align: 'center' });
    // hera subindo pela parede
    for (k = 0; k < 7; k++) {
      var ix = 8 + r.int(0, W - 24), len = r.int(20, 60);
      for (var q = 0; q < len; q++) {
        var px = ix + Math.round(Math.sin(q * 0.2 + k) * 3), py = H - q;
        c.fillStyle = TC.col(q % 3 ? '#2a4a28' : '#3a6a34'); c.fillRect(px, py, 2, 1);
        if (q % 4 === 0) c.fillRect(px + (q % 8 ? 2 : -2), py, 2, 2);
      }
    }
    cv.doorX = dx + dw / 2;
    return cv;
  };

  /* a escola da linha: madeira caiada, frisos azuis, sineta no telhado */
  C6.school = function () {
    var W = 230, H = 150, cv = TC.canvas(W, H), c = cv.ctx;
    var wallY = 58;
    // sineta
    c.fillStyle = TC.col('#2a2028'); c.fillRect(108, 6, 2, 16); c.fillRect(120, 6, 2, 16); c.fillRect(104, 4, 22, 3);
    TC.fillPoly(c, [[102, 4], [115, -4], [128, 4]]);
    c.fillStyle = TC.col('#c8a040'); TC.fillPoly(c, [[111, 9], [119, 9], [121, 18], [109, 18]]);
    c.fillStyle = TC.col('#8a6a20'); c.fillRect(109, 17, 12, 2);
    // telhado de tabuinhas
    for (var y = 0; y < wallY - 18; y++) {
      var inset = Math.round((wallY - 18 - y) * 2.4);
      for (var x = inset; x < W - inset; x++) {
        c.fillStyle = TC.col((y % 4 === 3) ? '#1e1a20' : ((x + (y >> 2) * 3) % 6 === 0 ? '#2a2630' : (x < W / 2 ? '#4a4450' : '#3a3440')));
        c.fillRect(x, y + 18, 1, 1);
      }
    }
    c.fillStyle = TC.col('#2a3a6a'); c.fillRect(0, wallY - 2, W, 3);
    // paredes de tábua caiada (embasamento de pedra)
    for (x = 4; x < W - 4; x++) for (y = wallY + 1; y < H - 10; y++) {
      c.fillStyle = TC.col(y % 6 === 0 ? '#a8a49c' : (H2(x >> 3, y / 6 | 0, 71) > 0.9 ? '#c8c4b8' : '#dcd8cc'));
      c.fillRect(x, y, 1, 1);
    }
    for (x = 2; x < W - 2; x++) for (y = H - 10; y < H; y++) { c.fillStyle = TC.col((x + (y % 2) * 4) % 9 === 0 || y === H - 10 ? '#2a2620' : '#5a544a'); c.fillRect(x, y, 1, 1); }
    // letreiro sobre a porta (com o nome antigo apagado por baixo)
    c.fillStyle = TC.col('#1a1410'); c.fillRect(48, wallY + 4, 134, 22);
    c.fillStyle = TC.col('#e8dcc0'); c.fillRect(49, wallY + 5, 132, 20);
    TC.font.draw(c, 'ESCOLA DA LINHA', 115, wallY + 6, '#2a2a5a', { align: 'center' });
    TC.font.draw(c, 'ESPERANÇA — 1871', 115, wallY + 15, '#5a2a1a', { align: 'center' });
    TC.font.draw(c, 'DEUTSCHE SCHULE', 115, wallY + 28, '#c8c0b4', { align: 'center' });
    // janelas altas (luz fria da lua por dentro) e a porta
    [[14, wallY + 40], [52, wallY + 40], [158, wallY + 40], [196, wallY + 40]].forEach(function (w) {
      c.fillStyle = TC.col('#2a3a6a'); c.fillRect(w[0] - 2, w[1] - 2, 24, 38);
      c.fillStyle = TC.col('#1a2440'); c.fillRect(w[0], w[1], 20, 34);
      c.fillStyle = TC.col('#e8e4dc'); c.fillRect(w[0] + 9, w[1], 2, 34); c.fillRect(w[0], w[1] + 11, 20, 2); c.fillRect(w[0], w[1] + 23, 20, 2);
    });
    var dx = 100, dw = 30, dy = wallY + 38, dh = H - 10 - dy;
    c.fillStyle = TC.col('#2a3a6a'); c.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
    c.fillStyle = TC.col('#3a2a1c'); c.fillRect(dx, dy, dw, dh);
    c.fillStyle = TC.col('#2a1c12'); c.fillRect(dx + 14, dy, 2, dh);
    c.fillStyle = TC.col('#c8b070'); c.fillRect(dx + 11, dy + 22, 2, 2); c.fillRect(dx + 17, dy + 22, 2, 2);
    for (y = 0; y < 3; y++) { c.fillStyle = TC.col(y % 2 ? '#4a463e' : '#6a6458'); c.fillRect(dx - 6 - y * 3, H - 10 + y * 3, dw + 12 + y * 6, 3); }
    cv.doorX = dx + dw / 2;
    return cv;
  };
  /* sala de aula por dentro: tábuas, janelas, quadro-negro, cartaz do alfabeto, a palmatória no prego */
  C6.classroom = function (w, boardX) {
    var H = 192, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(1871);
    for (var x = 0; x < w; x++) {
      for (var y = 0; y < H; y++) {
        var plank = x % 10 === 0;
        c.fillStyle = TC.col(plank ? '#1e140e' : (y > 140 ? (y % 8 === 0 ? '#2a1c12' : '#3e2a1c') : (H2(x / 10 | 0, y >> 4, 81) > 0.85 ? '#4e3826' : '#44301f')));
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(0, 0, w, 22);
    for (x = 0; x < w; x += 48) { c.fillStyle = TC.col('#3a2416'); c.fillRect(x, 0, 10, 22); }
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(0, 138, w, 4);
    c.fillStyle = TC.col('#6a4a2e'); c.fillRect(0, 22, w, 3);
    // janelas com o luar
    cv.windows = [];
    [22, boardX - 92].forEach(function (x) {
      c.fillStyle = TC.col('#2a1a10'); c.fillRect(x - 3, 40, 34, 60);
      c.fillStyle = TC.col('#1c2a50'); c.fillRect(x, 43, 28, 54);
      for (var k = 0; k < 6; k++) { c.fillStyle = TC.col('#9aa8d0'); c.fillRect(x + 2 + r.int(0, 24), 45 + r.int(0, 20), 1, 1); }
      c.fillStyle = TC.col('#e8e4dc'); c.fillRect(x + 13, 43, 2, 54); c.fillRect(x, 60, 28, 2); c.fillRect(x, 78, 28, 2);
      cv.windows.push(x + 14);
    });
    var k;
    // cartaz do alfabeto
    var ax = 62;
    c.fillStyle = TC.col('#1a1410'); c.fillRect(ax, 30, 70, 30);
    c.fillStyle = TC.col('#e8e0c8'); c.fillRect(ax + 1, 31, 68, 28);
    TC.font.draw(c, 'A B C D E F G', ax + 35, 33, '#8a2a1a', { align: 'center' });
    TC.font.draw(c, 'a b c d e f g', ax + 35, 43, '#2a2a5a', { align: 'center' });
    // mapa do Rio Grande do Sul (contorno simplificado)
    c.fillStyle = TC.col('#1a1410'); c.fillRect(ax + 6, 68, 52, 40);
    c.fillStyle = TC.col('#c8d8c0'); c.fillRect(ax + 7, 69, 50, 38);
    c.fillStyle = TC.col('#6a9a5a'); TC.fillPoly(c, [[ax + 14, 74], [ax + 46, 72], [ax + 52, 86], [ax + 40, 102], [ax + 30, 98], [ax + 12, 88]]);
    c.fillStyle = TC.col('#c03028'); c.fillRect(ax + 38, 80, 2, 2);
    // o quadro-negro
    c.fillStyle = TC.col('#5a3a20'); c.fillRect(boardX - 4, 34, 104, 64);
    c.fillStyle = TC.col('#1e3024'); c.fillRect(boardX, 38, 96, 56);
    for (k = 0; k < 30; k++) { c.fillStyle = TC.col('#2a3e30'); c.fillRect(boardX + r.int(0, 92), 40 + r.int(0, 52), r.int(2, 6), 1); }
    c.fillStyle = TC.col('#6a4a2a'); c.fillRect(boardX - 6, 98, 108, 3);
    c.fillStyle = TC.col('#ffffff'); c.fillRect(boardX + 10, 97, 4, 1); c.fillRect(boardX + 20, 97, 2, 1);
    // crucifixo, relógio parado e a palmatória pendurada no prego
    c.fillStyle = TC.col('#3a2414'); c.fillRect(boardX + 44, 26, 2, 9); c.fillRect(boardX + 41, 28, 8, 2);
    c.fillStyle = TC.col('#d8d0c0'); c.fillRect(boardX + 44, 28, 1, 5);
    var px = boardX + 112;
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(px, 50, 1, 2);
    c.fillStyle = TC.col('#7a5230'); c.fillRect(px, 52, 2, 9);
    c.fillStyle = TC.col('#9a6a3e'); TC.fillEllipse(c, px + 1, 65, 4, 5);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(px, 64, 1, 1); c.fillRect(px + 2, 66, 1, 1);
    c.fillStyle = TC.col('#2a1a10'); TC.fillCircle(c, boardX - 16, 40, 7);
    c.fillStyle = TC.col('#e8e0c8'); TC.fillCircle(c, boardX - 16, 40, 6);
    c.fillStyle = TC.col('#1a1010'); c.fillRect(boardX - 16, 35, 1, 5); c.fillRect(boardX - 16, 40, 4, 1);
    // cabides com bonezinhos e lampião de querosene
    for (k = 0; k < 4; k++) {
      var hx = 14 + k * 12;
      c.fillStyle = TC.col('#8a8a96'); c.fillRect(hx, 110, 1, 3);
      c.fillStyle = TC.col(['#2a5a8a', '#8a2a2a', '#4a6a3a', '#5a4a3a'][k]); TC.fillEllipse(c, hx, 116, 4, 3);
    }
    cv.lampX = 118; cv.lampY = 30;
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(cv.lampX, 22, 1, 6);
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(cv.lampX - 2, 28, 5, 6);
    c.fillStyle = TC.col('#ffe090'); c.fillRect(cv.lampX - 1, 29, 3, 4);
    return cv;
  };
  /* carteira dupla de madeira, com a lousinha e o tinteiro */
  C6.desk = function () {
    var cv = TC.canvas(34, 26), c = cv.ctx;
    c.fillStyle = TC.col('#5a3a22'); c.fillRect(14, 8, 20, 3);
    c.fillStyle = TC.col('#7a5232'); c.fillRect(14, 8, 20, 1);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(15, 11, 2, 15); c.fillRect(31, 11, 2, 15); c.fillRect(15, 18, 18, 2);
    c.fillStyle = TC.col('#2a3a2e'); c.fillRect(20, 5, 9, 4);
    c.fillStyle = TC.col('#8a6a40'); c.fillRect(19, 4, 11, 1);
    c.fillStyle = TC.col('#1a1a2a'); c.fillRect(30, 6, 2, 2);
    // o banco
    c.fillStyle = TC.col('#4a3020'); c.fillRect(0, 15, 14, 2); c.fillRect(1, 17, 2, 9); c.fillRect(11, 17, 2, 9); c.fillRect(0, 6, 2, 10);
    return cv;
  };
  /* sineta da escola no poste */
  C6.bellPost = function () {
    var cv = TC.canvas(24, 70), c = cv.ctx;
    c.fillStyle = TC.col('#3a2818'); c.fillRect(10, 6, 4, 64); c.fillRect(2, 6, 20, 3);
    c.fillStyle = TC.col('#c8a040'); TC.fillPoly(c, [[8, 10], [16, 10], [18, 20], [6, 20]]);
    c.fillStyle = TC.col('#8a6a20'); c.fillRect(6, 19, 12, 2);
    c.fillStyle = TC.col('#d8c8a0'); c.fillRect(12, 21, 1, 14);
    return cv;
  };
  /* o saco de estopa com as três crianças dentro (mexendo) */
  C6.kidSack = function () {
    return [0, 1, 2].map(function (f) {
      var pb = new TC.PixBuf(40, 36);
      sackShape(pb, 20 + (f === 1 ? 1 : f === 2 ? -1 : 0), 4, 28, 31, false, 4);
      var bumps = [[12, 18], [24, 14], [18, 26]];
      bumps.forEach(function (b, i) { if ((i + f) % 3 !== 0) pb.ellipse(b[0] + (f - 1), b[1], 3, 3, u32('#a08858')); });
      var cv = pb.toCanvas(); cv.ox = 20; cv.oy = 35;
      return cv;
    });
  };
  /* o saco aberto, vazio, largado no chão (final) */
  C6.sackOpen = function () {
    var pb = new TC.PixBuf(44, 20);
    sackShape(pb, 22, 6, 38, 13, true, 0);
    var cv = pb.toCanvas(); cv.ox = 22; cv.oy = 19;
    return cv;
  };

  /* carroça de boi encostada na beira da estrada (a caçamba serve de plataforma) */
  C6.carroca = function () {
    var cv = TC.canvas(76, 44), c = cv.ctx;
    // lança apoiada no chão
    c.fillStyle = TC.col('#4a3020'); TC.thickLine(c, 2, 42, 22, 26, 2);
    // caçamba de tábuas
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(14, 12, 60, 14);
    c.fillStyle = TC.col('#7a5a38'); c.fillRect(14, 12, 60, 2);
    c.fillStyle = TC.col('#3a2414'); for (var x = 18; x < 74; x += 9) c.fillRect(x, 12, 1, 14);
    c.fillStyle = TC.col('#2a1a10'); c.fillRect(14, 25, 60, 2);
    // feno solto em cima
    for (x = 16; x < 72; x += 2) { c.fillStyle = TC.col(x % 4 ? '#c8a860' : '#a88a48'); c.fillRect(x, 9 + (x % 3), 2, 3); }
    // rodas de madeira com raios
    [[30, 32], [60, 32]].forEach(function (w) {
      c.fillStyle = TC.col('#2a1a10'); TC.fillCircle(c, w[0], w[1], 11);
      c.fillStyle = TC.col('#6a4a2a'); TC.fillCircle(c, w[0], w[1], 9);
      c.fillStyle = TC.col('#2a1a10'); TC.fillCircle(c, w[0], w[1], 7);
      c.fillStyle = TC.col('#6a4a2a');
      for (var a = 0; a < 6; a++) TC.thickLine(c, w[0], w[1], w[0] + Math.cos(a) * 8, w[1] + Math.sin(a) * 8, 1.4);
      c.fillStyle = TC.col('#8a8a96'); TC.fillCircle(c, w[0], w[1], 2);
    });
    return cv;
  };
  /* cruz de beira de estrada com flores de plástico e uma vela */
  C6.roadCross = function () {
    var cv = TC.canvas(20, 40), c = cv.ctx;
    c.fillStyle = TC.col('#e0dcd0'); c.fillRect(9, 4, 3, 36); c.fillRect(3, 11, 15, 3);
    c.fillStyle = TC.col('#a8a498'); c.fillRect(11, 4, 1, 36);
    c.fillStyle = TC.col('#5a5664'); c.fillRect(4, 36, 13, 4);
    c.fillStyle = TC.col('#c02848'); c.fillRect(5, 32, 3, 3); c.fillStyle = TC.col('#e8c040'); c.fillRect(13, 33, 3, 3);
    c.fillStyle = TC.col('#e8e0d0'); c.fillRect(9, 30, 2, 5);
    c.fillStyle = TC.col('#ffe080'); c.fillRect(9, 28, 2, 2);
    return cv;
  };
  /* varal de folhas de fumo secando ao ar */
  C6.tobaccoRack = function (w, seed) {
    var r = TC.RNG(seed || 8), cv = TC.canvas(w, 40), c = cv.ctx;
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, 4, 3, 36); c.fillRect(w - 3, 4, 3, 36); c.fillRect(0, 4, w, 2);
    for (var x = 4; x < w - 4; x += 3) {
      c.fillStyle = TC.col(r.pick(['#a07830', '#c89a40', '#8a5a20', '#6a4a20', '#b88838']));
      var len = r.int(14, 22);
      TC.fillPoly(c, [[x, 6], [x + 3, 6], [x + 2.5, 6 + len], [x + 0.5, 6 + len - 2]]);
      c.fillStyle = TC.col('#4a3418'); c.fillRect(x + 1, 6, 1, len - 4);
    }
    return cv;
  };

  /* ====================== O DIÁRIO DA OMA HEDWIG: QUADROS EM SÉPIA (gravura antiga) ====================== */
  var SEP = { paper: '#e8d4a8', light: '#c8a878', mid: '#8a6a40', dark: '#5a3a1e', ink: '#2a1a0c' };
  function sepiaBase(c, w, h, top, bot) {
    for (var y = 0; y < h; y++) { c.fillStyle = TC.mix(top || SEP.light, bot || SEP.paper, y / h); c.fillRect(0, y, w, 1); }
  }
  function hatch(c, x0, y0, w, h, step, col, dir) {
    c.fillStyle = TC.col(col || SEP.mid);
    for (var k = -h; k < w; k += step) for (var i = 0; i < h; i++) {
      var x = x0 + k + (dir < 0 ? h - i : i), y = y0 + i;
      if (x >= x0 && x < x0 + w) c.fillRect(x, y, 1, 1);
    }
  }
  function finish(cv) {
    // grão do papel e vinheta escura nas bordas
    var c = cv.ctx, w = cv.width, h = cv.height, r = TC.RNG(w * 7 + h);
    // grão do papel: só um leve claro/escuro em cima da própria cor
    var id = c.getImageData(0, 0, w, h), d = id.data;
    for (var k = 0; k < w * h / 10; k++) {
      var i = (r.int(0, w - 1) + r.int(0, h - 1) * w) * 4, f = r() < 0.5 ? 0.86 : 1.12;
      d[i] = Math.min(255, d[i] * f); d[i + 1] = Math.min(255, d[i + 1] * f); d[i + 2] = Math.min(255, d[i + 2] * f);
    }
    c.putImageData(id, 0, 0);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var dx = (x - w / 2) / (w / 2), dy = (y - h / 2) / (h / 2), d = dx * dx * 0.8 + dy * dy;
      if (d > 0.75 && TC.dither(x, y, (d - 0.75) * 1.6)) { c.fillStyle = TC.col(d > 1.1 ? SEP.ink : SEP.dark); c.fillRect(x, y, 1, 1); }
    }
    return cv;
  }
  function shipShape(c, x, y, s, sails, col) {
    c.fillStyle = TC.col(col || SEP.ink);
    TC.fillPoly(c, [[x - 46 * s, y - 8 * s], [x + 44 * s, y - 8 * s], [x + 34 * s, y + 8 * s], [x - 38 * s, y + 8 * s]]);
    c.fillRect(Math.round(x - 2 * s), Math.round(y - 66 * s), Math.max(1, Math.round(3 * s)), Math.round(60 * s));
    c.fillRect(Math.round(x - 30 * s), Math.round(y - 50 * s), Math.max(1, Math.round(2 * s)), Math.round(44 * s));
    c.fillRect(Math.round(x + 26 * s), Math.round(y - 46 * s), Math.max(1, Math.round(2 * s)), Math.round(40 * s));
    c.fillStyle = TC.col(SEP.paper);
    if (sails === 'slack') {
      // velas murchas, penduradas
      [[x + 2 * s, x + 22 * s, y - 60 * s], [x - 26 * s, x - 6 * s, y - 46 * s]].forEach(function (v) {
        TC.fillPoly(c, [[v[0], v[2]], [v[1], v[2]], [v[1] - 3 * s, v[2] + 30 * s], [(v[0] + v[1]) / 2, v[2] + 22 * s], [v[0] + 3 * s, v[2] + 30 * s]]);
      });
    } else {
      // velas cheias de vento
      TC.fillPoly(c, [[x + 2 * s, y - 62 * s], [x + 30 * s, y - 52 * s], [x + 32 * s, y - 30 * s], [x + 26 * s, y - 14 * s], [x + 2 * s, y - 14 * s]]);
      TC.fillPoly(c, [[x - 26 * s, y - 46 * s], [x - 2 * s, y - 40 * s], [x + 1 * s, y - 24 * s], [x - 4 * s, y - 14 * s], [x - 26 * s, y - 14 * s]]);
      TC.fillPoly(c, [[x + 30 * s, y - 42 * s], [x + 50 * s, y - 20 * s], [x + 30 * s, y - 16 * s]]);
    }
    c.fillStyle = TC.col(SEP.mid);
    c.fillRect(Math.round(x + 4 * s), Math.round(y - 40 * s), Math.round(18 * s), 1);
  }
  C6.diaryPanel = function (kind) {
    var w = 224, h = 108, cv = TC.canvas(w, h), c = cv.ctx, x, y, k;
    if (kind === 'book') {
      sepiaBase(c, w, h, '#3a2412', '#1a0e06');
      // mesa e o livro aberto
      c.fillStyle = TC.col('#4a2e16'); c.fillRect(0, 80, w, 28);
      c.fillStyle = TC.col(SEP.dark); TC.fillPoly(c, [[34, 92], [112, 86], [190, 92], [190, 98], [112, 94], [34, 98]]);
      c.fillStyle = TC.col(SEP.paper); TC.fillPoly(c, [[38, 24], [110, 20], [110, 88], [38, 92]]);
      c.fillStyle = TC.col('#dcc494'); TC.fillPoly(c, [[114, 20], [186, 24], [186, 92], [114, 88]]);
      c.fillStyle = TC.col(SEP.mid); c.fillRect(111, 20, 3, 68);
      TC.font.draw(c, 'Tagebuch', 74, 28, SEP.ink, { align: 'center' });
      TC.font.draw(c, 'Hedwig 1852', 74, 38, SEP.dark, { align: 'center' });
      c.fillStyle = TC.col(SEP.mid);
      for (y = 50; y < 86; y += 5) for (x = 44; x < 104; x += 1) if (H2(x >> 1, y, 7) > 0.3) c.fillRect(x, y, 1, 1);
      // esboço do navio na página da direita
      shipShape(c, 150, 70, 0.42, 'slack', SEP.dark);
      c.fillStyle = TC.col(SEP.mid); for (x = 122; x < 180; x += 3) c.fillRect(x, 74 + (x % 2), 2, 1);
      // vela acesa ao lado
      c.fillStyle = TC.col('#e8e0c8'); c.fillRect(200, 60, 5, 22);
      c.fillStyle = TC.col('#ffd060'); c.fillRect(201, 54, 3, 5);
      cv.candle = { x: 202, y: 56 };
      return finish(cv);
    }
    if (kind === 'calm') {
      sepiaBase(c, w, h, '#d8b888', SEP.paper);
      // sol queimando, céu parado
      c.fillStyle = TC.col('#f8ecc8'); TC.fillCircle(c, 176, 26, 13);
      c.fillStyle = TC.col(SEP.mid); for (k = 0; k < 16; k++) { var a = k / 16 * TC.TAU; TC.thickLine(c, 176 + Math.cos(a) * 16, 26 + Math.sin(a) * 16, 176 + Math.cos(a) * 22, 26 + Math.sin(a) * 22, 1); }
      // mar liso como vidro
      for (y = 76; y < h; y++) { c.fillStyle = TC.mix('#b89868', SEP.mid, (y - 76) / 32); c.fillRect(0, y, w, 1); }
      c.fillStyle = TC.col(SEP.light); for (y = 78; y < h; y += 4) c.fillRect(0, y, w, 1);
      shipShape(c, 96, 78, 0.9, 'slack');
      // reflexo parado
      c.globalAlpha = 0.35; c.fillStyle = TC.col(SEP.dark); TC.fillPoly(c, [[56, 86], [134, 86], [124, 98], [64, 98]]); c.globalAlpha = 1;
      hatch(c, 0, 0, w, 30, 5, '#c8a878', 1);
      TC.font.draw(c, '1852', w - 8, h - 14, SEP.ink, { align: 'right' });
      return finish(cv);
    }
    if (kind === 'hold') {
      sepiaBase(c, w, h, '#4a2e16', '#2a1a0c');
      // porão: vigas, redes, crianças com febre
      c.fillStyle = TC.col('#1a0e06'); for (x = 0; x < w; x += 40) c.fillRect(x, 0, 6, h);
      c.fillStyle = TC.col('#1a0e06'); c.fillRect(0, 0, w, 10);
      for (k = 0; k < 4; k++) {
        var hx = 22 + k * 50, hy = 34 + (k % 2) * 8;
        c.fillStyle = TC.col(SEP.mid);
        for (x = 0; x < 34; x++) c.fillRect(hx + x, Math.round(hy + Math.sin(x / 34 * Math.PI) * 9), 1, 2);
        c.fillStyle = TC.col(SEP.light); TC.fillEllipse(c, hx + 17, hy + 6, 9, 3);
        c.fillStyle = TC.col('#e8d4a8'); TC.fillCircle(c, hx + 9, hy + 4, 2);
      }
      // a mãe ajoelhada e o lampião balançando
      c.fillStyle = TC.col(SEP.ink); TC.fillPoly(c, [[150, 100], [176, 100], [172, 78], [158, 74]]); TC.fillCircle(c, 164, 70, 5);
      c.fillStyle = TC.col(SEP.light); TC.fillEllipse(c, 130, 96, 14, 4);
      c.fillStyle = TC.col('#e8d4a8'); TC.fillCircle(c, 118, 94, 3);
      hatch(c, 0, 60, w, 48, 4, '#1a0e06', -1);
      cv.lamp = { x: 100, y: 20 };
      return finish(cv);
    }
    if (kind === 'vogt') {
      sepiaBase(c, w, h, '#2a1a0c', '#140a04');
      // a escada do porão e o mestre-escola descendo com o lampião
      c.fillStyle = TC.col(SEP.dark);
      for (k = 0; k < 8; k++) c.fillRect(30 + k * 6, 14 + k * 11, 16, 2);
      TC.thickLine(c, 28, 10, 74, 104, 2); TC.thickLine(c, 44, 10, 90, 104, 2);
      c.fillStyle = TC.col(SEP.ink);
      TC.fillPoly(c, [[66, 98], [86, 98], [84, 64], [80, 52], [72, 52], [68, 64]]);
      TC.fillCircle(c, 76, 46, 5);
      c.fillStyle = TC.col('#e8d4a8'); c.fillRect(72, 52, 8, 2);
      c.fillStyle = TC.col(SEP.ink); TC.thickLine(c, 82, 60, 94, 66, 2);
      c.fillStyle = TC.col('#f8e8b0'); c.fillRect(93, 66, 4, 5);
      cv.lamp = { x: 95, y: 68 };
      // lá no fundo, dois olhos
      cv.eyes = { x: 186, y: 54 };
      hatch(c, 110, 0, 114, h, 3, '#0a0602', 1);
      return finish(cv);
    }
    if (kind === 'pen') {
      sepiaBase(c, w, h, '#2a1a0c', '#120804');
      // o livro de bordo aberto num barril
      c.fillStyle = TC.col(SEP.dark); TC.fillEllipse(c, 112, 96, 30, 8); c.fillRect(82, 74, 60, 22);
      c.fillStyle = TC.col(SEP.mid); for (x = 84; x < 140; x += 8) c.fillRect(x, 74, 1, 22);
      c.fillStyle = TC.col(SEP.paper); TC.fillPoly(c, [[86, 66], [112, 62], [138, 66], [138, 74], [112, 72], [86, 74]]);
      TC.font.draw(c, 'HOFFNUNG', 112, 64, SEP.ink, { align: 'center' });
      // a mão comprida e branca saindo do escuro com a pena
      c.fillStyle = TC.col('#e8dcc0');
      TC.thickLine(c, w + 4, 30, 170, 44, 4); TC.thickLine(c, 170, 44, 146, 50, 3);
      for (k = 0; k < 4; k++) TC.thickLine(c, 146, 50, 132 - k * 2, 46 + k * 3, 1);
      c.fillStyle = TC.col('#f8f0e0'); TC.thickLine(c, 134, 42, 120, 58, 1);
      // a mão do Vogt estendida para pegar
      c.fillStyle = TC.col(SEP.ink); TC.thickLine(c, -4, 80, 60, 64, 6);
      c.fillStyle = TC.col(SEP.light); TC.fillEllipse(c, 66, 62, 5, 3);
      hatch(c, 150, 60, 74, 48, 3, '#0a0602', 1);
      cv.eyes = { x: 200, y: 22 };
      return finish(cv);
    }
    if (kind === 'sign') {
      sepiaBase(c, w, h, '#4a2e16', '#2a1a0c');
      // a página do livro com os X das famílias
      c.fillStyle = TC.col(SEP.paper); c.fillRect(56, 8, 112, 92);
      c.fillStyle = TC.col(SEP.light); c.fillRect(56, 8, 2, 92);
      var fam = ['SCHMITT', 'WEBER', 'KESSLER', 'BECKER', 'KLEIN', 'MULLER'];
      fam.forEach(function (f, i) {
        TC.font.draw(c, f, 64, 14 + i * 13, SEP.dark);
        c.fillStyle = TC.col(SEP.ink);
        var xx = 146, yy = 17 + i * 13;
        for (var q = -3; q <= 3; q++) { c.fillRect(xx + q, yy + q, 1, 1); c.fillRect(xx + q, yy - q, 1, 1); }
      });
      // as mãos assinando
      c.fillStyle = TC.col(SEP.ink); TC.thickLine(c, 200, 108, 156, 70, 6);
      c.fillStyle = TC.col(SEP.light); TC.fillEllipse(c, 152, 66, 4, 3);
      hatch(c, 0, 0, 52, h, 3, '#1a0e06', 1); hatch(c, 172, 0, 52, h, 3, '#1a0e06', -1);
      return finish(cv);
    }
    if (kind === 'spit') {
      sepiaBase(c, w, h, '#4a2e16', '#2a1a0c');
      // a moça Hedwig de lenço, cuspindo no livro; os homens assustados
      c.fillStyle = TC.col(SEP.dark); c.fillRect(70, 80, 70, 6);
      c.fillStyle = TC.col(SEP.paper); TC.fillPoly(c, [[78, 74], [104, 70], [130, 74], [130, 80], [104, 78], [78, 80]]);
      c.fillStyle = TC.col(SEP.ink);
      TC.fillPoly(c, [[150, 104], [176, 104], [172, 62], [164, 52], [156, 54], [152, 64]]);
      c.fillStyle = TC.col('#e8e0c8'); TC.fillCircle(c, 160, 46, 7);
      c.fillStyle = TC.col(SEP.light); TC.fillCircle(c, 157, 48, 4);
      c.fillStyle = TC.col(SEP.ink); c.fillRect(154, 48, 1, 1);
      // o cuspe
      c.fillStyle = TC.col('#f8f0e0'); for (k = 0; k < 6; k++) c.fillRect(148 - k * 6, 50 + k * 4, 2, 1);
      // os homens em silhueta
      [[22, 0.9], [44, 1], [194, 0.85]].forEach(function (m) {
        c.fillStyle = TC.col('#1a0e06');
        TC.fillPoly(c, [[m[0] - 8, 104], [m[0] + 8, 104], [m[0] + 6, 60 + (1 - m[1]) * 20], [m[0] - 6, 60 + (1 - m[1]) * 20]]);
        TC.fillCircle(c, m[0], 54 + (1 - m[1]) * 20, 5);
        c.fillRect(m[0] - 7, 48 + (1 - m[1]) * 20, 14, 2);
      });
      hatch(c, 0, 0, w, 40, 4, '#2a1a0c', -1);
      return finish(cv);
    }
    // 'wind': o vento voltou
    sepiaBase(c, w, h, '#a88858', SEP.paper);
    for (y = 72; y < h; y++) for (x = 0; x < w; x++) {
      var wv = Math.sin(x * 0.18 + y * 0.9) > 0.7;
      c.fillStyle = TC.col(wv ? SEP.light : TC.mix(SEP.mid, SEP.dark, (y - 72) / 36)); c.fillRect(x, y, 1, 1);
    }
    shipShape(c, 104, 76, 0.9, 'full');
    c.fillStyle = TC.col(SEP.dark);
    for (k = 0; k < 7; k++) { y = 14 + k * 8; for (x = 0; x < 60; x++) c.fillRect(150 + x + k * 3, Math.round(y + Math.sin(x * 0.2) * 2), 1, 1); }
    // gaivotas
    [[40, 24], [56, 18], [190, 40]].forEach(function (g) { c.fillRect(g[0] - 3, g[1], 3, 1); c.fillRect(g[0] + 1, g[1], 3, 1); c.fillRect(g[0], g[1] + 1, 1, 1); });
    return finish(cv);
  };

  /* ====================== PREPARO ====================== */
  ART.ch6Init = function () {
    if (C6.ready) return C6;
    var C2 = ART.ch2Init();
    ART.castInit();
    C6.arnoBowl = buildArnoBowl();
    C6.ball = buildBall();
    C6.ballIcon = TC.sprite(['..kkk..', '.kbBbk.', 'kbBWbbk', 'kbbbbbk', 'kbbbbdk', '.kbbdk.', '..kkk..'], { k: '#d8c8a8', b: '#5a4a3e', B: '#a89480', W: '#f0e8d8', d: '#2a1e18' });
    C6.pinUp = C6.pin(false); C6.pinDown = C6.pin(true);
    C6.scare = buildScarecrow();
    C6.barba = buildBarba();
    C6.bowler = buildBowler();
    C2.c6bowler = C6.bowler;      // o possuído padrão desenha a partir de ART.ch2[kind]
    C6.pelz = buildPelz();
    C6.vogt = buildVogt();
    C6.T = C6.tiles();
    C6.kidSackImg = C6.kidSack();
    C6.sackOpenImg = C6.sackOpen();
    var EXTRA = { pelz: { normal: pelzPortrait() }, vogt: { normal: vogtPortrait(false), sad: vogtPortrait(true) }, lena: { normal: lenaPortrait(false), scared: lenaPortrait(true) } };
    var orig = ART.portrait;
    if (!orig._ch6) {
      ART.portrait = function (who, f) {
        if (EXTRA[who]) return EXTRA[who][f] || EXTRA[who].normal;
        return orig(who, f);
      };
      ART.portrait._ch6 = true;
    }
    C6.ready = true;
    return C6;
  };
})();
