'use strict';
/* Teewald City — Capítulo 3: arte procedural (mineiros soterrados, morcegos, pares de dançarinos fantasmas,
   o Moço do Baile, o Ewald Becker, a Rainha da Batata, a bandinha do Erwin; raízes, a Mina Santa Bárbara,
   o elevador de carga, a gruta do Rio Escuro e o salão do baile debaixo da terra) */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline, blit = ART._blit;
  var C3 = ART.ch3 = {};
  var H2 = TC.hash2;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      toolA: o.toolA || 0, noTool: !!o.noTool, hooves: !!o.hooves, hatOff: !!o.hatOff, gaita: !!o.gaita, coil: !!o.coil
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
  /* versão fantasma: azulada e com contorno claro */
  function ghostly(cv, col, amt) {
    var t = TC.tint(cv, col || '#9ab0e0', amt == null ? 0.45 : amt);
    t.ox = cv.ox; t.oy = cv.oy;
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

  /* ====================== MINEIRO SOTERRADO (1931) ====================== */
  var MINER_HEAD = TC.sprite([
    '..kkkkkk..',
    '.kHHHHHHk.',
    'kHHHHHLLyk',
    'BBBBBBBBBB',
    '.gsssss...',
    '.gsscEs...',
    '.sssssss..',
    '.sSmmmss..',
    '..SSSS....'
  ], { k: '#14120e', H: '#6a5a30', L: '#8a8a90', y: '#ffe890', B: '#3a3020', g: '#3a3a3a', s: '#9aa0a8', S: '#6a7078', c: '#202020', E: '#c8f0ff', m: '#1a1a1a' });
  function buildMiner() {
    var pick = (function () {
      var wood = solid('#6a4a2c'), iron = solid('#8a8a96'), ironD = solid('#4a4a56');
      return function (pb, info, pose) {
        if (pose.noTool || !info.hand) return;
        var a = pose.armF[0] + pose.armF[1] + pose.toolA;
        var dx = Math.sin(a), dy = Math.cos(a);
        var hx = info.hand.x, hy = info.hand.y;
        var x1 = hx + dx * 15, y1 = hy + dy * 15;
        thick(pb, hx - dx * 5, hy - dy * 5, x1, y1, 1.6, wood);
        var px = -Math.cos(a), py = Math.sin(a);
        // picareta: cabeça curva para os dois lados
        thick(pb, x1 - px * 7 - dx * 2, y1 - py * 7 - dy * 2, x1, y1, 1.4, ironD);
        thick(pb, x1, y1, x1 + px * 8 - dx * 2, y1 + py * 8 - dy * 2, 1.4, iron);
      };
    })();
    var S = {
      W: 60, H: 60, ox: 28, groundY: 57,
      thigh: 7, shin: 7, legT: 4.4, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 7, shW: 10,
      upper: 6, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: MINER_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#4a4e58'), pantsB: solid('#30343c'), boot: solid('#1e1a16'), bootB: solid('#14100c'),
        shirt: (function () { var a = u32('#4a4e58'), b = u32('#3a3e48'), c = u32('#1a1a1e'); return function (x, y) { return (x * 3 + y) % 13 === 0 ? c : (x & 3) === 0 ? b : a; }; })(),
        sleeve: solid('#5a5e68'), sleeveB: solid('#3a3e48'), skin: solid('#9aa0a8'), skinB: solid('#6a7078'), outline: '#0a0c10'
      },
      after: pick
    };
    var R = ART.renderFigure, out = {};
    function F(o) { return ghostly(R(P(o), S), '#a8c0f0', 0.3); }
    out.idle = [F({ lean: 0.2, armF: [0.5, 0.6], armB: [0.2, 0.5], toolA: 1.4 }), F({ lean: 0.22, breath: 1, armF: [0.55, 0.6], armB: [0.25, 0.5], toolA: 1.35 })];
    out.walk = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.walk.push(F({
        lean: 0.24,
        legF: [0.4 * Math.sin(q), -(0.1 + 0.6 * Math.max(0, Math.cos(q)))],
        legB: [0.4 * Math.sin(q + Math.PI), -(0.1 + 0.6 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [0.5 - 0.15 * Math.sin(q), 0.6], armB: [0.2 + 0.3 * Math.sin(q), 0.5], toolA: 1.4
      }));
    }
    out.windup = [F({ lean: -0.25, legF: [0.35, -0.15], legB: [-0.35, -0.1], armF: [2.8, 0.2], armB: [2.5, 0.35], toolA: 0.1 })];
    out.swing = [F({ lean: 0.45, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [1.2, 0.0], armB: [1.05, 0.1], toolA: -0.2, hipX: 1 })];
    out.hurt = [F({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], toolA: 1.2 })];
    out.kneel = [F({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.6, 0.5], armB: [0.3, 0.6], noTool: true })];
    out.stand = out.idle;
    out.lie = [lying(F({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], noTool: true }), 60, 56)];
    return out;
  }

  /* ====================== MORCEGO ====================== */
  var BAT_PAL = { k: '#08060a', b: '#2a2030', l: '#4a3a50', e: '#ff4030', w: '#d8d0c0' };
  function buildBat() {
    return {
      fly: [TC.sprite([
        'k..............k',
        'kk............kk',
        'kbk...kkk....kbk',
        '.kbk.kbebk..kbk.',
        '.kblkbbbbbklbk..',
        '..kbbbbbbbbbbk..',
        '...kkbbwbwbkk...',
        '.....kkkkkk.....'
      ], BAT_PAL), TC.sprite([
        '................',
        '......kkk.......',
        '.....kbebk......',
        'kkkkkbbbbbkkkkk.',
        'kbbbbbbwbwbbbbbk',
        '.kblbbkkkkbblbk.',
        '..kk.k....k.kk..',
        '................'
      ], BAT_PAL)],
      perch: TC.sprite([
        '....k..k....',
        '....kkkk....',
        '...kbbbbk...',
        '..kbbbbbbk..',
        '.kbblbblbbk.',
        '.kbbbbbbbbk.',
        '..kbbbbbbk..',
        '...kbwbwk...',
        '....kbek....',
        '.....kk.....'
      ], BAT_PAL)
    };
  }

  /* ====================== FIGURAS DO BAILE (renderFigure) ====================== */
  function hatHead(brim, crown, face, faceS, extra) {
    var rows = [
      '...cccc....',
      '..cCcccc...',
      '..ccccccc..',
      'bbbbbbbbbbb',
      '..fffffff..',
      '..ffffeff..',
      '..ffffffff.',
      '..FfmmmfF..',
      '...FFFF....'
    ];
    var pal = { c: crown, C: TC.mix(crown, '#ffffff', 0.2), b: brim, f: face, F: faceS, e: '#1a1010', m: '#3a2018' };
    if (extra) for (var k in extra) pal[k] = extra[k];
    return TC.sprite(rows, pal);
  }
  /* o Moço do Baile: chapéu preto de aba larga, lenço vermelho, paletó preto, bombacha e bota (ou pé de bode) */
  var MOCO_HEAD = TC.sprite([
    '....kkkkk.....',
    '...kcCcccck...',
    '...kccccccck..',
    'bbbbbbbbbbbbbb',
    '...ffffffff...',
    '...ffffffeff..',
    '...fffffffff..',
    '...Ffwwwwwf...',
    '....FFFFFF....'
  ], { k: '#050306', c: '#14101a', C: '#2a2234', b: '#0a080e', f: '#e8dcd0', F: '#a89c94', e: '#ff3010', w: '#f8f0e8' });
  var MOCO_HEAD_OFF = TC.sprite([
    '....kkk.......',
    '...kHHHk......',
    '..hkHHHHk.h...',
    '..hHHHHHHHh...',
    '...ffffffff...',
    '...ffffffeff..',
    '...fffffffff..',
    '...Ffwwwwwf...',
    '....FFFFFF....'
  ], { k: '#050306', H: '#1a1018', h: '#c8b070', f: '#e0d0c4', F: '#a08c80', e: '#ff3010', w: '#f8f0e8' });
  function buildMoco() {
    var black = solid('#16121c'), blackB = solid('#0c0a10');
    var bomb = (function () { var a = u32('#2a2630'), b = u32('#3a3440'); return function (x, y) { return (y % 5 === 0) ? b : a; }; })();
    var S = {
      W: 80, H: 88, ox: 38, groundY: 85,
      thigh: 11, shin: 11, legT: 7, footH: 2, footL: 5, shinThin: 2.4,
      torso: 16, hipW: 9, shW: 13,
      upper: 9, fore: 8, armT: 3.6, fist: 3, foreThin: 0.6,
      head: function (pose) { return pose.hatOff ? MOCO_HEAD_OFF : MOCO_HEAD; },
      headOff: { x: -6, y: -9 },
      col: {
        pants: bomb, pantsB: solid('#1a1620'), boot: solid('#0a080c'), bootB: solid('#060408'),
        shirt: (function () { var a = u32('#16121c'), b = u32('#262030'); return function (x, y) { return (x + y) % 9 === 0 ? b : a; }; })(),
        sleeve: black, sleeveB: blackB, skin: solid('#e8dcd0'), skinB: solid('#a89c94'),
        belt: (function () { var a = u32('#6a4a2a'), b = u32('#d0b060'); return function (x) { return (x % 4 === 1) ? b : a; }; })(),
        outline: '#030204'
      },
      after: function (pb, info, pose) {
        // lenço vermelho no pescoço
        thick(pb, info.sx - 3, info.sy + 1, info.sx + 3, info.sy + 1, 2.6, solid('#c01818'));
        thick(pb, info.sx + 2, info.sy + 2, info.sx + 5, info.sy + 7, 1.6, solid('#e02828'));
        // camisa branca no peito
        thick(pb, info.sx, info.sy + 3, info.sx + 1, info.sy + 7, 1.2, solid('#d8d0c8'));
        if (pose.hooves) {
          // pé de bode: canela peluda e casco fendido no lugar da bota
          var fur = solid('#2a1e14');
          [[-2, 0], [3, 0]].forEach(function (o, k) {
            var fx = info.hx + o[0] + (k ? 4 : -4), fy = S.groundY - 1;
            thick(pb, fx, fy - 9, fx + (k ? 2 : -2), fy - 2, 3.2, fur);
            pb.rect(Math.round(fx - 2 + (k ? 2 : -2)), fy - 1, 2, 2, u32('#0a0606'));
            pb.rect(Math.round(fx + 1 + (k ? 2 : -2)), fy - 1, 2, 2, u32('#0a0606'));
          });
        }
        if (pose.gaita && info.hand) {
          // a gaita (acordeão) aberta entre as mãos
          var hx = info.hand.x, hy = info.hand.y;
          pb.rect(Math.round(hx - 12), Math.round(hy - 6), 6, 11, u32('#a01818'));
          for (var b = 0; b < 5; b++) pb.rect(Math.round(hx - 6 + b * 2), Math.round(hy - 5 + (b % 2)), 1, 9, u32(b % 2 ? '#e8e0d0' : '#2a1414'));
          pb.rect(Math.round(hx + 4), Math.round(hy - 6), 5, 11, u32('#a01818'));
          pb.rect(Math.round(hx + 5), Math.round(hy - 5), 3, 8, u32('#f0e8d8'));
        }
        if (pose.coil && info.hand) {
          // rodilha do laço na mão
          for (var r = 0; r < 3; r++) thick(pb, info.hand.x - 3 + r, info.hand.y + 2, info.hand.x + 1 + r, info.hand.y + 7, 1, solid('#c8a870'));
        }
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04, armF: [0.3, 0.3], armB: [-0.15, 0.3] }), S), R(P({ lean: 0.06, breath: 1, armF: [0.35, 0.3], armB: [-0.1, 0.3] }), S)];
    out.glide = [];
    for (var i = 0; i < 4; i++) {
      var q = i / 4 * TC.TAU;
      out.glide.push(R(P({ lean: 0.08, legF: [0.35 * Math.sin(q), -(0.05 + 0.4 * Math.max(0, Math.cos(q)))], legB: [0.35 * Math.sin(q + Math.PI), -(0.05 + 0.4 * Math.max(0, Math.cos(q + Math.PI)))], armF: [1.4, 0.4], armB: [0.3, 0.4] }), S));
    }
    out.bow = [R(P({ lean: 0.75, legF: [0.4, -0.3], legB: [-0.3, -0.1], armF: [1.2, 1.2], armB: [-0.7, 0.4] }), S)];
    out.twirl = [R(P({ lean: -0.1, armF: [2.9, 0.1], armB: [0.4, 0.5], coil: false }), S)];
    out.throw = [R(P({ lean: 0.35, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [1.6, 0.0], armB: [-0.6, 0.4] }), S)];
    out.bola = [R(P({ lean: 0.3, legF: [0.45, -0.15], legB: [-0.4, -0.05], armF: [0.9, -0.5], armB: [-0.5, 0.5] }), S)];
    out.stomp = [R(P({ lean: -0.05, legF: [1.4, -1.8], legB: [0, -0.05], armF: [2.2, 0.3], armB: [-2.0, 0.2], hooves: false }), S)];
    out.spin = [
      R(P({ lean: 0.05, legF: [1.4, 0.0], legB: [-0.1, -0.6], armF: [1.6, 0], armB: [-1.6, 0], dy: 10 }), S),
      R(P({ lean: 0.05, legF: [-1.4, 0.0], legB: [0.1, -0.6], armF: [-1.6, 0], armB: [1.6, 0], dy: 10 }), S)
    ];
    out.dizzy = [R(P({ lean: -0.3, legF: [0.4, -0.4], legB: [-0.3, -0.3], armF: [0.6, 1.4], armB: [0.2, 1.6], hatOff: true }), S)];
    out.hurt = [R(P({ lean: -0.45, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2] }), S)];
    out.reveal = [R(P({ lean: -0.2, armF: [0.8, 1.5], armB: [0.6, 1.6], hatOff: true, hooves: true, legF: [0.25, -0.05], legB: [-0.25, -0.05] }), S)];
    out.dance = [R(P({ lean: 0.05, armF: [1.5, -0.4], armB: [0.9, 0.9] }), S), R(P({ lean: 0.1, armF: [1.4, -0.3], armB: [1.0, 0.8], legF: [0.3, -0.2] }), S)];
    out.gaita = [R(P({ lean: 0.0, armF: [1.0, 0.9], armB: [0.7, 1.1], gaita: true }), S), R(P({ lean: 0.04, armF: [1.2, 0.7], armB: [0.6, 1.2], gaita: true, breath: 1 }), S)];
    return out;
  }

  /* moça de vestido (dançarina, a Rainha da Batata) */
  function dressAfter(dress, dressD, sash) {
    var d = solid(dress), dd = solid(dressD);
    return function (pb, info, pose) {
      var hx = info.hx, hy = info.hy;
      poly(pb, [[hx - 5, hy - 4], [hx + 5, hy - 4], [hx + 10 + (pose.twirl || 0), hy + 12], [hx - 10 - (pose.twirl || 0), hy + 12]], function (x) { return (x & 3) === 0 ? dd : d; });
      if (sash) thick(pb, info.sx - 3, info.sy + 1, hx + 4, hy - 3, 2, solid(sash));
    };
  }
  function girlSpec(head, dress, dressD, sash) {
    return {
      W: 56, H: 60, ox: 26, groundY: 57,
      thigh: 7, shin: 7, legT: 3.4, footH: 1, footL: 3, shinThin: 0.6,
      torso: 10, hipW: 6, shW: 8,
      upper: 5, fore: 5, armT: 2.8, fist: 2.6, foreThin: 0.3,
      head: head, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#d8c8b8'), pantsB: solid('#a89888'), boot: solid('#2a1a14'), bootB: solid('#1a100c'),
        shirt: solid(dress), sleeve: solid(dress), sleeveB: solid(dressD), skin: solid('#e8c0a0'), skinB: solid('#b08870'), outline: '#100a0c'
      },
      after: dressAfter(dress, dressD, sash)
    };
  }
  var INGRID_HEAD = TC.sprite([
    '...yyyyY...',
    '..yYyyyyyy.',
    '.yyfffffyy.',
    '.yffffeffy.',
    'yYfffffff..',
    'y.fFfmff...',
    'y..FFFF....',
    'Y..........',
    'y..........'
  ], { y: '#f0d070', Y: '#c8a040', f: '#f0c8a8', F: '#c09078', e: '#3a5a8a', m: '#c04050' });
  var GIRL_HEAD = TC.sprite([
    '...hhhh....',
    '..hhhhhhh..',
    '.hhfffffh..',
    '.hffffefh..',
    '.hfffffff..',
    '..fFfmff...',
    '...FFFF....'
  ], { h: '#5a3a2a', f: '#f0c8a8', F: '#c09078', e: '#2a2020', m: '#a04040' });
  var MAN_HEAD = hatHead('#2a2a30', '#3a3a40', '#e8c0a0', '#b08870');
  var EWALD_HEAD = TC.sprite([
    '...cccc....',
    '..cCcccc...',
    '..ccccccc..',
    'bbbbbbbbbbb',
    'hhfffffff..',
    'hhffffeff..',
    'h.fffffff..',
    '..FMMMMMf..',
    '...FFFF....'
  ], { c: '#5a4630', C: '#7a6448', b: '#3a2c1c', h: '#4a3020', f: '#e8aa76', F: '#b06e4a', e: '#1a1010', M: '#4a2a18' });
  function buildPeople() {
    var R = ART.renderFigure, out = {};
    // a Rainha da Batata: vestido branco, faixa vermelha, tranças loiras
    var IS = girlSpec(INGRID_HEAD, '#e8e4dc', '#b8b4ac', '#c02828');
    out.ingrid = {
      idle: [R(P({ lean: 0.02, armF: [0.2, 0.3], armB: [-0.1, 0.3] }), IS)],
      dance: [R(P({ lean: -0.05, armF: [1.5, -0.4], armB: [0.9, 0.9] }), IS), R(P({ lean: -0.1, armF: [1.4, -0.3], armB: [1.0, 0.8], legF: [0.3, -0.2] }), IS)],
      scared: [R(P({ lean: -0.2, armF: [0.9, 1.6], armB: [0.7, 1.7] }), IS)]
    };
    // o Ewald Becker, pai do Arno: jaqueta de couro marrom, chapéu de feltro, bigode
    var ES = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3.2, foreThin: 0.4,
      head: EWALD_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#6a5a44'), pantsB: solid('#4a3e30'), boot: solid('#3a2414'), bootB: solid('#24160c'),
        shirt: (function () { var a = u32('#6a4228'), b = u32('#8a5a38'); return function (x, y) { return (x + y * 2) % 7 === 0 ? b : a; }; })(),
        sleeve: solid('#6a4228'), sleeveB: solid('#4a2c18'), skin: solid('#e8aa76'), skinB: solid('#b06e4a'), outline: '#120a0e'
      }
    };
    out.ewald = { idle: [R(P({ lean: 0.06 }), ES), R(P({ lean: 0.06, breath: 1 }), ES)], walk: [] };
    for (var i = 0; i < 8; i++) {
      var p = i / 8 * TC.TAU;
      out.ewald.walk.push(R(P({ lean: 0.12, legF: [0.45 * Math.sin(p), -(0.1 + 0.6 * Math.max(0, Math.cos(p)))], legB: [0.45 * Math.sin(p + Math.PI), -(0.1 + 0.6 * Math.max(0, Math.cos(p + Math.PI)))], armF: [-0.4 * Math.sin(p) + 0.1, 0.5], armB: [0.4 * Math.sin(p) + 0.1, 0.5] }), ES));
    }
    out.ewald.dance = [R(P({ lean: 0.05, armF: [1.5, -0.4], armB: [0.9, 0.9] }), ES), R(P({ lean: 0.1, armF: [1.4, -0.3], armB: [1.0, 0.8], legF: [0.3, -0.2] }), ES)];
    out.ewald.watch = [R(P({ lean: 0.1, armF: [1.0, 1.6], armB: [0.8, 1.6], headY: 1 }), ES)];
    // par de dançarinos fantasmas (homem de terno e moça de vestido), num só quadro
    var MS = {
      W: 48, H: 60, ox: 22, groundY: 57,
      thigh: 7, shin: 7, legT: 3.8, footH: 2, footL: 4, shinThin: 0.6,
      torso: 11, hipW: 7, shW: 9,
      upper: 6, fore: 5, armT: 3.2, fist: 3, foreThin: 0.4,
      head: MAN_HEAD, headOff: { x: -4, y: -9 },
      col: { pants: solid('#2a2a34'), pantsB: solid('#1a1a22'), boot: solid('#0a0a0e'), bootB: solid('#06060a'), shirt: solid('#2a2a34'), sleeve: solid('#2a2a34'), sleeveB: solid('#1a1a22'), skin: solid('#e8c0a0'), skinB: solid('#b08870'), outline: '#0a0a10' }
    };
    var GS = girlSpec(GIRL_HEAD, '#6a3a6a', '#4a2a4a');
    function couple(man, girl, twirl) {
      var cv = TC.canvas(72, 62);
      cv.ctx.drawImage(TC.flip(girl), 26, 2);
      cv.ctx.drawImage(man, 6, 2);
      cv.ox = 36; cv.oy = 2 + 57 + 1;
      return ghostly(cv, '#b8c8ff', 0.5);
    }
    out.couple = { waltz: [], bow: null, spin: [], hurt: null };
    for (i = 0; i < 4; i++) {
      var w = i / 4 * TC.TAU;
      var m = R(P({ lean: 0.05 + Math.sin(w) * 0.05, legF: [0.3 * Math.sin(w), -(0.05 + 0.3 * Math.max(0, Math.cos(w)))], legB: [0.3 * Math.sin(w + Math.PI), -0.1], armF: [1.6, -0.3], armB: [1.0, 0.8] }), MS);
      var g = R(P({ lean: -0.05 - Math.sin(w) * 0.05, legF: [0.3 * Math.sin(w + Math.PI), -0.1], legB: [0.3 * Math.sin(w), -0.1], armF: [1.6, -0.3], armB: [1.0, 0.8] }), GS);
      out.couple.waltz.push(couple(m, g));
    }
    out.couple.bow = couple(R(P({ lean: 0.6, armF: [1.0, 1.0], armB: [-0.5, 0.4], legF: [0.4, -0.3] }), MS), R(P({ lean: 0.3, armF: [0.6, 0.9], armB: [0.4, 0.9], legF: [0.4, -0.9], legB: [-0.1, -0.6] }), GS));
    out.couple.spin = [
      couple(R(P({ lean: 0, armF: [1.57, 0], armB: [-1.57, 0] }), MS), R(P({ lean: 0, armF: [1.57, 0], armB: [-1.57, 0] }), GS)),
      couple(TC.flip(R(P({ lean: 0, armF: [1.57, 0], armB: [-1.57, 0] }), MS)), TC.flip(R(P({ lean: 0, armF: [1.57, 0], armB: [-1.57, 0] }), GS)))
    ];
    out.couple.hurt = couple(R(P({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], hurtFace: true }), MS), R(P({ lean: -0.4, armF: [0.9, 1.4], armB: [0.7, 1.5] }), GS));
    // a bandinha do Erwin (fantasma): tuba, gaita, clarinete e bumbo, em 2 quadros
    out.band = [0, 1].map(function (f) {
      var cv = TC.canvas(128, 60), c = cv.ctx;
      var players = [
        { x: 8, inst: 'tuba' }, { x: 38, inst: 'gaita' }, { x: 68, inst: 'clar' }, { x: 98, inst: 'bumbo' }
      ];
      players.forEach(function (pl, k) {
        var pose = P({ lean: 0.05 + (f + k) % 2 * 0.04, armF: [1.0 + ((f + k) % 2) * 0.2, 0.9], armB: [0.7, 1.0], breath: (f + k) % 2 });
        var fig = R(pose, MS);
        c.drawImage(fig, pl.x - 14, 2);
        var hx = pl.x + 8, hy = 30;
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
      return ghostly(cv, '#b8c8ff', 0.45);
    });
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
  function face(pb, skin, skinS, skinD, skinL) {
    ellipseFill(pb, 20, 21, 10, 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? skinL : l > -0.25 ? skin : l > -0.6 ? skinS : skinD);
    });
  }
  function ewaldPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a1a10', '#080404');
    var skin = '#e8aa76', skinS = '#b06e4a', skinD = '#7a4430', skinL = '#f6c898';
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32((x * 3 + y) % 11 === 0 ? '#8a5a38' : '#6a4228'); });
    ellipseFill(pb, 20, 34, 4, 3, function () { return u32('#d8c8a8'); });
    pb.rect(16, 28, 8, 6, u32(skinS));
    face(pb, skin, skinS, skinD, skinL);
    pb.rect(10, 16, 2, 7, u32('#4a3020')); pb.rect(28, 16, 2, 7, u32('#4a3020'));
    // chapéu de feltro
    ellipseFill(pb, 20, 11, 10, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#7a6448' : dx > 0.4 ? '#3a2c1c' : '#5a4630'); });
    ellipseFill(pb, 20, 15, 15, 2.6, function (x, y, dx, dy) { return u32(dy < 0 ? '#4a3a26' : '#2a2014'); });
    pb.rect(11, 13, 18, 1, u32('#2a1a10'));
    pb.rect(13, 18, 5, 2, u32('#3a2414')); pb.rect(23, 18, 5, 2, u32('#3a2414'));
    pb.rect(14, 21, 4, 2, u32('#e8e0d0')); pb.rect(23, 21, 4, 2, u32('#e8e0d0'));
    pb.rect(16, 21, 2, 2, u32('#3a5a3a')); pb.rect(24, 21, 2, 2, u32('#3a5a3a'));
    pb.rect(20, 21, 1, 5, u32(skinS)); pb.rect(19, 26, 3, 1, u32(skinD));
    for (var x = 12; x <= 28; x++) { var droop = Math.abs(x - 20) > 5 ? 2 : 0; for (var y = 27; y <= 28 + droop; y++) pb.set(x, y, u32(y === 27 && x < 20 ? '#6a4028' : '#4a2a18')); }
    pb.rect(18, 31, 5, 1, u32(skinD));
    return pb.toCanvas();
  }
  function mocoPortrait(revealed) {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, revealed ? '#3a1408' : '#1a0a14', '#000000');
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32((x + y) % 9 === 0 ? '#262030' : '#16121c'); });
    // lenço vermelho
    ellipseFill(pb, 20, 33, 7, 3, function () { return u32('#c01818'); });
    pb.rect(17, 34, 6, 5, u32('#e02828'));
    pb.rect(16, 27, 8, 5, u32('#a89c94'));
    face(pb, '#e8dcd0', '#c0b0a4', '#8a7c74', '#fff4ec');
    // olhos de brasa e bigode fino
    pb.rect(13, 19, 5, 1, u32('#1a1010')); pb.rect(23, 19, 5, 1, u32('#1a1010'));
    pb.rect(14, 21, 4, 2, u32('#200808')); pb.rect(23, 21, 4, 2, u32('#200808'));
    pb.set(16, 21, u32('#ff4010')); pb.set(24, 21, u32('#ff4010'));
    pb.rect(20, 21, 1, 5, u32('#c0b0a4'));
    pb.rect(15, 27, 4, 1, u32('#1a1010')); pb.rect(22, 27, 4, 1, u32('#1a1010'));
    // sorriso largo demais
    pb.rect(14, 29, 13, 1, u32('#3a0808'));
    for (var x = 15; x < 26; x += 2) pb.set(x, 30, u32('#f8f0e8'));
    pb.set(13, 28, u32('#3a0808')); pb.set(27, 28, u32('#3a0808'));
    if (revealed) {
      // sem chapéu: chifres curtos no cabelo
      ellipseFill(pb, 20, 12, 11, 6, function () { return u32('#1a1018'); });
      pb.rect(10, 6, 2, 5, u32('#c8b070')); pb.rect(28, 6, 2, 5, u32('#c8b070'));
      pb.set(9, 5, u32('#c8b070')); pb.set(30, 5, u32('#c8b070'));
    } else {
      ellipseFill(pb, 20, 10, 10, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#2a2234' : '#14101a'); });
      ellipseFill(pb, 20, 14, 17, 2.8, function (x, y, dx, dy) { return u32(dy < 0 ? '#14101a' : '#050306'); });
    }
    return pb.toCanvas();
  }
  function ingridPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a2030', '#080608');
    ellipseFill(pb, 20, 44, 18, 11, function () { return u32('#e8e4dc'); });
    pb.rect(4, 36, 32, 3, u32('#c02828'));
    pb.rect(16, 28, 8, 6, u32('#c09078'));
    // tranças loiras
    ellipseFill(pb, 20, 16, 12, 11, function (x, y) { return u32((x + y) % 4 === 0 ? '#c8a040' : '#f0d070'); });
    pb.rect(7, 20, 4, 16, u32('#e0c060')); pb.rect(29, 20, 4, 16, u32('#e0c060'));
    for (var y = 21; y < 36; y += 3) { pb.rect(7, y, 4, 1, u32('#b08830')); pb.rect(29, y, 4, 1, u32('#b08830')); }
    face(pb, '#f0c8a8', '#d0a088', '#a07060', '#fff0e0');
    // coroa de rainha
    pb.rect(13, 6, 14, 3, u32('#f0c040'));
    [13, 17, 20, 23, 26].forEach(function (x) { pb.rect(x, 3, 1, 3, u32('#f0c040')); });
    pb.set(20, 7, u32('#c02828'));
    pb.rect(14, 21, 4, 2, u32('#f0f0f8')); pb.rect(23, 21, 4, 2, u32('#f0f0f8'));
    pb.rect(15, 21, 2, 2, u32('#3a5a8a')); pb.rect(24, 21, 2, 2, u32('#3a5a8a'));
    pb.rect(13, 19, 5, 1, u32('#a07a40')); pb.rect(23, 19, 5, 1, u32('#a07a40'));
    pb.rect(18, 29, 5, 1, u32('#c04050'));
    return pb.toCanvas();
  }

  /* ====================== AMBIENTE ====================== */
  C3.tiles = function () {
    var T = {};
    T.rootTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y < 2) return H2(xx, y, 100) > 0.5 ? '#4a3424' : null;
        if (y < 4) return (H2(xx >> 2, 1, 101) > 0.6) ? '#6a4a30' : '#3a2a1e';
        var n = H2(xx, y, 102);
        if ((xx * 3 + y * 5) % 23 === 0) return '#7a5a3a';   // raizinhas
        return n > 0.85 ? '#4a3626' : n > 0.4 ? '#2a1e16' : '#22180f';
      });
    });
    T.earth = [0, 1].map(function (v) { return tile(function (x, y) { var n = H2(x + v * 16, y, 103); return n > 0.88 ? '#3a2a1e' : n > 0.45 ? '#22180f' : '#1c140c'; }); });
    T.railTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0 || y === 1) return y === 0 ? '#a8a8b4' : '#5a5a66';   // trilho
        if (y < 5) return (xx % 8 < 5) ? (y === 2 ? '#7a5a38' : '#5a3e26') : (H2(xx, y, 104) > 0.5 ? '#2a2420' : '#1e1a16');   // dormentes
        if (y === 5) return '#141010';
        var n = H2(xx, y, 105);
        return n > 0.8 ? '#3a3230' : n > 0.4 ? '#221c1a' : '#1a1614';   // carvão e brita
      });
    });
    T.coal = [0, 1].map(function (v) { return tile(function (x, y) { var n = H2(x + v * 16, y, 106); return n > 0.93 ? '#5a5a66' : n > 0.5 ? '#1a1818' : '#121012'; }); });
    T.grate = [0, 1].map(function (v) {
      return tile(function (x, y) {
        if (y === 0) return '#8a8a96';
        if (y < 4) return (x + v) % 4 === 0 ? '#6a6a76' : (y === 3 ? '#2a2a30' : null);
        if (y === 4) return '#4a4a56';
        return (x % 8 === 0 || (y - 4) % 6 === 0) ? '#3a3a44' : null;
      });
    });
    T.caveTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        var gh = 2 + Math.round(H2(xx, 3, 107) * 1.5);
        if (y < gh - 1) return H2(xx, y, 108) > 0.65 ? '#3a6a5a' : null;   // musgo
        if (y < gh + 1) return H2(xx, y, 109) > 0.4 ? '#b8ac94' : '#9a8e78';
        var row = Math.floor((y - gh) / 5), bx = (xx + row * 5) % 11;
        if (bx === 0 || (y - gh) % 5 === 4) return '#3a342c';
        return H2(Math.floor((xx + row * 5) / 11), row, 110) > 0.5 ? '#6e6454' : '#5e5646';
      });
    });
    T.cave = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16, row = Math.floor(y / 5), bx = (xx + row * 5) % 11;
        if (bx === 0 || y % 5 === 4) return '#2a2620';
        return H2(Math.floor((xx + row * 5) / 11), row, 111) > 0.5 ? '#5a5244' : '#4a4436';
      });
    });
    T.parquetTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#e8c890';
        if (y < 6) {
          var herring = ((xx >> 2) + (y >> 1)) % 2;
          return (xx % 4 === 0) ? '#5a3418' : herring ? '#b07a44' : '#946234';
        }
        if (y === 6) return '#3a2010';
        if (y < 9) return '#6a3a1a';
        return (x === 3 || x === 12) ? '#3a2010' : (y % 6 === 0 ? '#2a1810' : '#1a100a');
      });
    });
    T.parquet = tile(function (x, y) { return (x === 3 || x === 12) ? '#3a2010' : (y % 6 === 0 ? '#2a1810' : '#1a100a'); });
    return T;
  };

  /* escada de pedra que desce do toco (no começo da fase) */
  C3.stairs = function () {
    var W = 120, H = 192, cv = TC.canvas(W, H), c = cv.ctx;
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#1a120c', '#0a0806', y / H); c.fillRect(0, y, W, 1); }
    for (var s = 0; s < 11; s++) {
      var sx = 4 + s * 10, sy = 8 + s * 16;
      c.fillStyle = TC.col('#6e6454'); c.fillRect(sx, sy, 40, 6);
      c.fillStyle = TC.col('#8e8472'); c.fillRect(sx, sy, 40, 1);
      c.fillStyle = TC.col('#3a342c'); c.fillRect(sx, sy + 6, 40, 10);
      // nomes riscados nos degraus
      if (s % 3 === 1) { c.fillStyle = TC.col('#a89a80'); for (var k = 0; k < 6; k++) c.fillRect(sx + 6 + k * 4, sy + 3, 2, 1); }
    }
    // raízes atravessando a parede
    c.fillStyle = TC.col('#3a2414');
    for (var r = 0; r < 6; r++) TC.thickLine(c, W - 6 - r * 18, 0, W - r * 12 - 30, H * (0.4 + r * 0.1), 3);
    return cv;
  };
  /* parede de terra do túnel das raízes (faixa repetível) */
  C3.rootWall = function (w, seed) {
    var H = 150, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 7);
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#1e1610', '#120c08', y / H); c.fillRect(0, y, w, 1); }
    for (var k = 0; k < w / 3; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#2a1e16' : '#16100a'); c.fillRect(r.int(0, w), r.int(0, H), r.int(1, 3), 1); }
    // raízes grossas descendo do teto
    for (k = 0; k < w / 40; k++) {
      var x0 = r.int(0, w), len = r.int(40, 140), wob = r.range(-0.4, 0.4);
      for (var t = 0; t < len; t++) {
        var x = x0 + Math.sin(t * 0.07 + k) * 6 + t * wob, th = Math.max(1, 5 - t / 30);
        c.fillStyle = TC.col(t % 9 === 0 ? '#5a3e26' : '#3e2a1a');
        c.fillRect(Math.round(x - th / 2), t, Math.ceil(th), 1);
      }
    }
    return cv;
  };
  /* raiz-ponte (plataforma) */
  C3.rootBridge = function (w) {
    var cv = TC.canvas(w + 20, 34), c = cv.ctx;
    for (var x = 0; x < w + 20; x++) {
      var top = 8 + Math.round(Math.sin(x / (w + 20) * Math.PI) * -4 + 4), th = 8 + Math.round(Math.sin(x * 0.3) * 1);
      c.fillStyle = TC.col('#3a2414'); c.fillRect(x, top, 1, th);
      c.fillStyle = TC.col('#6a4a2c'); c.fillRect(x, top, 1, 2);
      if (x % 7 === 0) { c.fillStyle = TC.col('#2a180c'); c.fillRect(x, top + 2, 1, th - 2); }
    }
    for (var k = 0; k < 6; k++) { c.fillStyle = TC.col('#3a2414'); TC.thickLine(c, 10 + k * (w / 6), 16, 6 + k * (w / 6), 34, 1.5); }
    return cv;
  };
  /* cogumelo que brilha no escuro */
  C3.mushroom = function (seed) {
    var r = TC.RNG(seed);
    var cv = TC.canvas(14, 12), c = cv.ctx;
    for (var k = 0; k < 3; k++) {
      var x = 2 + k * 4 + r.int(-1, 1), h = r.int(4, 9);
      c.fillStyle = TC.col('#c8d8c0'); c.fillRect(x + 1, 12 - h, 1, h);
      c.fillStyle = TC.col(r() < 0.5 ? '#60e0c0' : '#80c0ff'); TC.fillEllipse(c, x + 1, 12 - h, 2 + (k % 2), 1);
    }
    return cv;
  };
  /* escora de madeira da mina */
  C3.prop = function (h) {
    h = h || 128;
    var cv = TC.canvas(64, h), c = cv.ctx;
    c.fillStyle = TC.col('#4a3420'); c.fillRect(4, 8, 6, h - 8); c.fillRect(54, 8, 6, h - 8);
    c.fillStyle = TC.col('#6a4a2e'); c.fillRect(4, 8, 2, h - 8); c.fillRect(54, 8, 2, h - 8);
    c.fillStyle = TC.col('#3a2414'); c.fillRect(0, 0, 64, 9);
    c.fillStyle = TC.col('#5a3e26'); c.fillRect(0, 0, 64, 2);
    for (var y = 20; y < h; y += 26) { c.fillStyle = TC.col('#2a1a10'); c.fillRect(5, y, 4, 1); c.fillRect(55, y + 9, 4, 1); }
    // lamparina de carbureto pendurada
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(30, 9, 1, 8);
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(28, 17, 5, 6);
    c.fillStyle = TC.col('#ffe090'); c.fillRect(29, 23, 3, 2);
    cv.lampX = 30.5; cv.lampY = 24;
    return cv;
  };
  /* parede de fundo da mina, com veios de carvão */
  C3.mineWall = function (w, seed) {
    var H = 160, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 9);
    for (var y = 0; y < H; y++) { c.fillStyle = TC.mix('#221e1c', '#141210', y / H); c.fillRect(0, y, w, 1); }
    for (var k = 0; k < 5; k++) {
      var by = r.int(20, 140), bh = r.int(4, 10);
      for (var x = 0; x < w; x++) {
        var yy = by + Math.round(Math.sin(x / 40 + k) * 4);
        c.fillStyle = TC.col(H2(x, k, 3) > 0.92 ? '#4a4a56' : '#0c0a0c'); c.fillRect(x, yy, 1, bh);
      }
    }
    for (k = 0; k < w / 2; k++) { c.fillStyle = TC.col(r() < 0.5 ? '#2a2624' : '#0e0c0c'); c.fillRect(r.int(0, w), r.int(0, H), 2, 1); }
    return cv;
  };
  /* vagonete de carvão */
  C3.cart = function () {
    return TC.sprite([
      '..ccCcccCcccCcc...',
      '.kcccccccccccccck..',
      'kmmmmmmmmmmmmmmmmk',
      'kmMmmmmmmmmmmmmMmk',
      'kmmmrrrmmmmmrrrmmk',
      'kmmmrrrmmmmmrrrmmk',
      '.kmmmmmmmmmmmmmmk.',
      '..kmmmmmmmmmmmmk..',
      '..kkkkkkkkkkkkkk..',
      '...kwwk....kwwk...',
      '...kwgk....kwgk...',
      '....kk......kk....'
    ], { k: '#0e0c0e', c: '#1a1818', C: '#4a4a56', m: '#5a3a24', M: '#7a5a3a', r: '#8a5a30', w: '#3a3a44', g: '#8a8a96' });
  };
  /* elevador de carga: torres laterais, polia e cabos (fica parado na tela; o poço é que passa) */
  C3.liftFrame = function () {
    var W = 256, H = 192, cv = TC.canvas(W, H), c = cv.ctx;
    [[6, 14], [W - 20, 14]].forEach(function (p) {
      c.fillStyle = TC.col('#3a3a44'); c.fillRect(p[0], 10, p[1], H - 10);
      c.fillStyle = TC.col('#5a5a66'); c.fillRect(p[0], 10, 2, H - 10);
      for (var y = 20; y < H; y += 22) { c.fillStyle = TC.col('#2a2a30'); TC.thickLine(c, p[0], y, p[0] + p[1], y + 18, 1.5); TC.thickLine(c, p[0] + p[1], y, p[0], y + 18, 1.5); }
    });
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(0, 4, W, 8);
    c.fillStyle = TC.col('#5a5a66'); c.fillRect(0, 4, W, 2);
    // cabos
    c.fillStyle = TC.col('#8a8a96'); c.fillRect(60, 0, 1, H); c.fillRect(196, 0, 1, H);
    // guarda-corpo do elevador
    c.fillStyle = TC.col('#4a4a56'); c.fillRect(20, H - 26, W - 40, 2);
    for (var x = 24; x < W - 20; x += 12) c.fillRect(x, H - 26, 1, 26);
    // placa
    var s = ART.ch2.sign(96, 22, [['ELEVADOR DE CARGA', '#f0e0b0'], ['MÁX. 8 HOMENS', '#e8c070']], { bg: '#3a3a44', trim: '#8a8a96' });
    c.drawImage(s, W / 2 - 48, 30);
    return cv;
  };
  /* estalactites (teto) e estalagmites (chão) de calcário */
  C3.stalactites = function (w, seed) {
    var H = 70, cv = TC.canvas(w, H), c = cv.ctx, r = TC.RNG(seed || 3);
    c.fillStyle = TC.col('#2e2a24'); c.fillRect(0, 0, w, 10);
    for (var k = 0; k < w / 9; k++) {
      var x = r.int(0, w), len = r.int(10, H - 4), half = r.int(2, 6);
      for (var y = 0; y < len; y++) {
        var hw = Math.max(0, Math.round(half * (1 - y / len)));
        c.fillStyle = TC.col(y > len - 4 ? '#c8bca4' : (y % 5 === 0 ? '#6a6050' : '#5a5244'));
        c.fillRect(x - hw, 8 + y, hw * 2 + 1, 1);
      }
      if (r() < 0.3) { c.fillStyle = TC.col('#a0e8ff'); c.fillRect(x, 8 + len, 1, 1); }
    }
    return cv;
  };
  C3.stalagmite = function (h, seed) {
    var r = TC.RNG(seed || 1), half = Math.round(h * 0.28), cv = TC.canvas(half * 2 + 3, h), c = cv.ctx;
    for (var y = 0; y < h; y++) {
      var hw = Math.round(half * Math.pow(y / h, 0.8)) + 1;
      c.fillStyle = TC.col(y < 3 ? '#d8ccb4' : (y % 6 === 0 ? '#5e5646' : (r() < 0.1 ? '#8a8070' : '#6e6454')));
      c.fillRect(half + 1 - hw, y, hw * 2, 1);
      c.fillStyle = TC.col('#3a342c'); c.fillRect(half + hw, y, 1, 1);
    }
    cv.baseX = half + 1;
    return cv;
  };
  C3.crystal = function (seed) {
    var r = TC.RNG(seed), cv = TC.canvas(20, 22), c = cv.ctx;
    for (var k = 0; k < 4; k++) {
      var x = 3 + k * 4 + r.int(-1, 1), h = r.int(8, 20), lean = r.range(-0.3, 0.3);
      for (var y = 0; y < h; y++) {
        var hw = y < 3 ? y * 0.6 : 1.5;
        c.fillStyle = TC.col(y < 2 ? '#f0d8ff' : (y % 4 === 0 ? '#9a60d0' : '#7a40b0'));
        c.fillRect(Math.round(x + lean * y - hw), 22 - h + y, Math.round(hw * 2) + 1, 1);
      }
    }
    return cv;
  };
  /* salão do baile: faixas dos anos em que alguém sumiu, mesas, barris */
  C3.banner = function (txt, col) {
    var w = TC.font.measure(txt) + 14, cv = TC.canvas(w, 24), c = cv.ctx;
    c.fillStyle = TC.col('#1a1010'); c.fillRect(0, 0, w, 16);
    c.fillStyle = TC.col(col || '#e8dcc0'); c.fillRect(1, 1, w - 2, 14);
    c.fillStyle = TC.col('#a02828'); c.fillRect(1, 1, w - 2, 2); c.fillRect(1, 13, w - 2, 2);
    TC.font.draw(c, txt, w / 2, 4, '#3a1a10', { align: 'center' });
    // pontas rasgadas
    c.fillStyle = TC.col(col || '#e8dcc0');
    TC.fillPoly(c, [[2, 16], [8, 16], [5, 22]]); TC.fillPoly(c, [[w - 8, 16], [w - 2, 16], [w - 5, 22]]);
    return cv;
  };
  C3.feastTable = function (seed) {
    var r = TC.RNG(seed || 5), cv = TC.canvas(88, 30), c = cv.ctx;
    c.fillStyle = TC.col('#e8e0d0'); c.fillRect(0, 10, 88, 4);
    c.fillStyle = TC.col('#c8bca8'); c.fillRect(0, 14, 88, 6);
    for (var x = 2; x < 88; x += 6) { c.fillStyle = TC.col('#a89c88'); c.fillRect(x, 14, 1, 6); }
    c.fillStyle = TC.col('#3a2414'); c.fillRect(6, 20, 3, 10); c.fillRect(79, 20, 3, 10);
    for (var k = 0; k < 6; k++) {
      var fx = 4 + k * 14 + r.int(0, 4);
      var kind = r.int(0, 3);
      if (kind === 0) { c.fillStyle = TC.col('#d8d8e0'); c.fillRect(fx, 3, 5, 7); c.fillStyle = TC.col('#e8b030'); c.fillRect(fx + 1, 5, 3, 5); c.fillStyle = TC.col('#ffffff'); c.fillRect(fx + 1, 3, 3, 2); }
      else if (kind === 1) { c.fillStyle = TC.col('#d0a060'); c.fillRect(fx - 2, 6, 10, 4); c.fillStyle = TC.col('#f0d890'); c.fillRect(fx - 2, 5, 10, 2); }
      else if (kind === 2) { c.fillStyle = TC.col('#b04a30'); TC.fillEllipse(c, fx + 3, 8, 5, 2); }
      else { c.fillStyle = TC.col('#e8e0d0'); TC.fillEllipse(c, fx + 3, 9, 5, 1); c.fillStyle = TC.col('#c09050'); c.fillRect(fx + 1, 6, 4, 3); }
    }
    return cv;
  };
  /* lustre de raízes com velas (sobre a pista) */
  C3.chandelier = function () {
    var cv = TC.canvas(120, 60), c = cv.ctx;
    c.fillStyle = TC.col('#3a2414');
    TC.thickLine(c, 60, 0, 60, 26, 3);
    for (var k = -3; k <= 3; k++) {
      var tx = 60 + k * 16, ty = 34 + Math.abs(k) * -2;
      TC.thickLine(c, 60, 24, tx, ty, 2);
      c.fillStyle = TC.col('#e8e0d0'); c.fillRect(tx - 1, ty - 6, 3, 6);
      c.fillStyle = TC.col('#ffe080'); c.fillRect(tx, ty - 9, 1, 3);
      c.fillStyle = TC.col('#3a2414');
    }
    for (k = 0; k < 18; k++) { c.fillStyle = TC.col('#2a180c'); c.fillRect(30 + k * 3.4, 38 + (k % 4) * 3, 1, 8 + (k % 3) * 4); }
    cv.candles = [-3, -2, -1, 0, 1, 2, 3].map(function (k) { return { x: 60 + k * 16, y: 34 + Math.abs(k) * -2 - 9 }; });
    return cv;
  };
  C3.lanternColors = ['#ff6040', '#ffd040', '#60e080', '#60a0ff', '#ff80c0', '#ffffff'];

  /* ====================== PREPARO ====================== */
  ART.ch3Init = function () {
    if (C3.ready) return C3;
    var C2 = ART.ch2Init();
    C3.miner = buildMiner();
    C2.miner = C3.miner;           // o colono possuído desenha a partir de ART.ch2[kind]
    C3.bat = buildBat();
    C3.moco = buildMoco();
    var people = buildPeople();
    C3.ingrid = people.ingrid; C3.ewald = people.ewald; C3.couple = people.couple; C3.band = people.band;
    C3.T = C3.tiles();
    C3.cartImg = C3.cart();
    var EXTRA = { ewald: { normal: ewaldPortrait() }, moco: { normal: mocoPortrait(false), reveal: mocoPortrait(true) }, ingrid: { normal: ingridPortrait() } };
    var orig = ART.portrait;
    if (!orig._ch3) {
      ART.portrait = function (who, f) {
        if (EXTRA[who]) return EXTRA[who][f] || EXTRA[who].normal;
        return orig(who, f);
      };
      ART.portrait._ch3 = true;
    }
    C3.ready = true;
    return C3;
  };
})();
