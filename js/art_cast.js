'use strict';
/* Teewald City — elenco dos capítulos 4 a 7 (arte procedural compartilhada):
   a Dona Frida de corpo inteiro, a Dona Rosa (kujà kaingang), o velho Gerhard Morgenstern na cadeira de rodas,
   as crianças da Linha Esperança e as mulheres sonâmbulas de camisola. Montado uma vez, quando alguém pede. */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline;
  var CAST = ART.cast = {};

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      cuia: !!o.cuia, balaio: !!o.balaio, skirt: o.skirt == null ? 0 : o.skirt, eyes: o.eyes
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
  /* saia comprida até o chão (esconde as pernas) */
  function skirt(info, pb, col, colD, flare, ground) {
    var hx = info.hx, hy = info.hy;
    var c = solid(col), d = solid(colD);
    poly(pb, [[hx - 5, hy - 3], [hx + 5, hy - 3], [hx + 7 + flare, ground], [hx - 7 - flare, ground]], function (x, y) { return (x + (y >> 2)) % 5 === 0 ? d(x, y) : c(x, y); });
  }

  /* ====================== DONA FRIDA ======================
     A benzedeira: lenço roxo na cabeça, xale escuro, saia comprida e a cuia de chimarrão na mão. */
  var FRIDA_HEAD = TC.sprite([
    '...LLLL....',
    '..LlLLLLL..',
    '.LLLLLLLLL.',
    '.LgggggggL.',
    'LLgfffEffL.',
    'LLffffffff.',
    'L.fFfmmff..',
    'L..FFFF....',
    '...........'
  ], { L: '#5a3a6a', l: '#7a5a8a', g: '#b8b8c0', f: '#d8a070', F: '#a0683e', E: '#2a1a10', m: '#6a3a20' });
  function cuiaDraw(pb, info) {
    if (!info.hand) return;
    var hx = Math.round(info.hand.x), hy = Math.round(info.hand.y);
    // cuia de porongo com a erva verde e a bomba de prata
    pb.ellipse(hx + 1, hy - 2, 3, 3, u32('#8a5a30'));
    pb.rect(hx - 1, hy - 5, 5, 1, u32('#4a9a40'));
    pb.set(hx, hy - 2, u32('#b08050'));
    thick(pb, hx + 2, hy - 5, hx + 4, hy - 10, 1, solid('#d0d0d8'));
  }
  function buildFrida() {
    var S = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4, footH: 2, footL: 3, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: FRIDA_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#1e1a24'), pantsB: solid('#141018'), boot: solid('#1a1210'), bootB: solid('#100a08'),
        shirt: (function () { var a = u32('#2e2232'), b = u32('#4a3a50'); return function (x, y) { return (x + y) % 6 === 0 ? b : a; }; })(),
        sleeve: solid('#2e2232'), sleeveB: solid('#1e1622'), skin: solid('#d8a070'), skinB: solid('#a0683e'), outline: '#0c080c'
      },
      after: function (pb, info, pose) {
        skirt(info, pb, '#241c2a', '#16101a', pose.skirt, S.groundY - 1);
        // xale sobre os ombros
        thick(pb, info.sx - 5, info.sy + 2, info.sx + 5, info.sy + 3, 3, solid('#3a2a40'));
        if (pose.cuia) cuiaDraw(pb, info);
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.1 }), S), R(P({ lean: 0.1, breath: 1 }), S)];
    out.cuia = [R(P({ lean: 0.1, armF: [0.9, 1.1], cuia: true }), S), R(P({ lean: 0.1, breath: 1, armF: [0.95, 1.05], cuia: true }), S)];
    out.walk = walkPoses(8, 0.32, 0.14).map(function (p) { p.skirt = 1; return R(p, S); });
    out.pray = [R(P({ lean: 0.08, armF: [0.9, 1.6], armB: [0.7, 1.7], headY: 1 }), S)];
    out.point = [R(P({ lean: 0.04, armF: [1.7, 0.05] }), S)];
    out.bless = [R(P({ lean: 0.02, armF: [2.5, 0.3], armB: [0.2, 0.4] }), S)];
    return out;
  }

  /* ====================== DONA ROSA ======================
     Kujà kaingang (rezadora e curandeira), vende balaio na praça há sessenta anos.
     Cabelo comprido grisalho numa trança, vestido de chita, xale, e o balaio trançado de taquara. */
  var ROSA_HEAD = TC.sprite([
    '...hhhh....',
    '..hHhhhhh..',
    '.hhhhhhhhh.',
    '.hhfffffhh.',
    'hhfffEffh..',
    'hhfffffff..',
    'h.fFfmff...',
    'h..FFFF....',
    'h..........',
    'H..........'
  ], { h: '#2a2420', H: '#8a8480', f: '#b07850', F: '#7a4e34', E: '#1a1008', m: '#5a2a1a' });
  function balaioDraw(pb, info) {
    if (!info.hand) return;
    var hx = Math.round(info.hand.x), hy = Math.round(info.hand.y);
    // balaio de taquara com desenho geométrico trançado
    for (var y = 0; y < 8; y++) {
      var hw = 5 - (y > 5 ? y - 5 : 0);
      for (var x = -hw; x <= hw; x++) {
        var k = ((x + 8) + (y >> 1) * 2) % 4;
        pb.set(hx + 2 + x, hy + 1 + y, u32(y === 0 ? '#e0c890' : k < 2 ? '#c8a060' : '#7a5a30'));
      }
    }
    thick(pb, hx - 2, hy + 1, hx + 2, hy - 4, 1, solid('#a08050'));
    thick(pb, hx + 2, hy - 4, hx + 6, hy + 1, 1, solid('#a08050'));
  }
  function buildRosa() {
    var S = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4, footH: 2, footL: 3, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: ROSA_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#5a2420'), pantsB: solid('#3a1614'), boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: (function () { var a = u32('#7a2e26'), b = u32('#e0c060'), c = u32('#5a2420'); return function (x, y) { return (x * 3 + y * 5) % 11 === 0 ? b : (x + y) % 7 === 0 ? c : a; }; })(),
        sleeve: solid('#7a2e26'), sleeveB: solid('#5a2420'), skin: solid('#b07850'), skinB: solid('#7a4e34'), outline: '#0e0806'
      },
      after: function (pb, info, pose) {
        var dress = (function () { var a = u32('#7a2e26'), b = u32('#e0c060'), c = u32('#5a2420'); return function (x, y) { return (x * 3 + y * 5) % 11 === 0 ? b : (x + y) % 7 === 0 ? c : a; }; })();
        poly(pb, [[info.hx - 5, info.hy - 3], [info.hx + 5, info.hy - 3], [info.hx + 7 + pose.skirt, S.groundY - 2], [info.hx - 7 - pose.skirt, S.groundY - 2]], dress);
        // a trança grisalha caindo pelas costas
        thick(pb, info.sx - 4, info.sy - 4, info.sx - 6, info.sy + 9, 2, function (x, y) { return u32(y % 3 === 0 ? '#8a8480' : '#3a3430'); });
        thick(pb, info.sx - 5, info.sy + 3, info.sx + 5, info.sy + 3, 3, solid('#3a3a4a'));
        if (pose.balaio) balaioDraw(pb, info);
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.06, armF: [0.35, 0.9], balaio: true }), S), R(P({ lean: 0.06, breath: 1, armF: [0.4, 0.85], balaio: true }), S)];
    out.walk = walkPoses(8, 0.3, 0.12, { armF: function (q) { return [0.35 - 0.1 * Math.sin(q), 0.9]; }, balaio: true }).map(function (p) { p.skirt = 1; return R(p, S); });
    out.talk = [R(P({ lean: 0.02, armF: [1.3, 0.2] }), S)];
    out.pray = [R(P({ lean: 0.1, armF: [0.9, 1.6], armB: [0.7, 1.7], headY: 1 }), S)];
    out.free = [R(P({ lean: 0.05 }), S)];
    return out;
  }

  /* ====================== AS CRIANÇAS DA LINHA ====================== */
  var KID_HEADS = {
    boy: TC.sprite([
      '..ccccc..',
      '.cCcccccv',
      '..hffff..',
      '.hffEff..',
      '..fffff..',
      '..fFmf...',
      '...FF....'
    ], { c: '#2a5a8a', C: '#4a7aaa', v: '#1a3a5a', h: '#8a5a2a', f: '#f0c090', F: '#c09070', E: '#2a1a10', m: '#a04a3a' }),
    girl: TC.sprite([
      '..yyyy...',
      '.yYyyyy..',
      'yyffffy..',
      'y.ffEf...',
      'y.ffff...',
      'R.fFmf...',
      'y..FF....'
    ], { y: '#e8c060', Y: '#c09030', R: '#c03030', f: '#f0c8a0', F: '#c09078', E: '#2a3a5a', m: '#c04050' }),
    small: TC.sprite([
      '..hhhh...',
      '.hhhhhh..',
      '.hffffh..',
      '..ffEf...',
      '..ffff...',
      '..fFmf...',
      '...FF....'
    ], { h: '#3a2414', f: '#e8b080', F: '#b08060', E: '#1a1008', m: '#a04a3a' })
  };
  function kidSpec(kind) {
    var cols = {
      boy: { pants: '#4a3a2a', shirt: '#c8c0a0', sleeve: '#c8c0a0' },
      girl: { pants: '#d8c8b8', shirt: '#4a6a3a', sleeve: '#4a6a3a' },
      small: { pants: '#3a4a6a', shirt: '#a04a3a', sleeve: '#a04a3a' }
    }[kind];
    return {
      W: 36, H: 40, ox: 17, groundY: 37,
      thigh: 4, shin: 4, legT: 3.4, footH: 1, footL: 3, shinThin: 0.4,
      torso: 7, hipW: 5, shW: 7,
      upper: 4, fore: 3, armT: 2.6, fist: 2.4, foreThin: 0.3,
      head: KID_HEADS[kind], headOff: { x: -3, y: -7 },
      col: {
        pants: solid(cols.pants), pantsB: solid(TC.shade(cols.pants, 0.7)), boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: solid(cols.shirt), sleeve: solid(cols.sleeve), sleeveB: solid(TC.shade(cols.sleeve, 0.7)),
        skin: solid('#f0c090'), skinB: solid('#c09070'), outline: '#100a0a'
      },
      after: kind === 'girl' ? function (pb, info) {
        poly(pb, [[info.hx - 4, info.hy - 2], [info.hx + 4, info.hy - 2], [info.hx + 6, info.hy + 5], [info.hx - 6, info.hy + 5]], solid('#4a6a3a'));
      } : kind === 'boy' ? function (pb, info) {
        thick(pb, info.sx - 2, info.sy + 1, info.hx - 2, info.hy - 1, 1, solid('#3a2418'));
        thick(pb, info.sx + 2, info.sy + 1, info.hx + 2, info.hy - 1, 1, solid('#3a2418'));
      } : null
    };
  }
  function buildKid(kind) {
    var S = kidSpec(kind), R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04 }), S), R(P({ lean: 0.04, breath: 1 }), S)];
    out.walk = walkPoses(6, 0.45, 0.12).map(function (p) { return R(p, S); });
    out.scared = [R(P({ lean: -0.2, armF: [0.9, 1.6], armB: [0.7, 1.7] }), S)];
    out.sit = [R(P({ lean: 0.1, legF: [1.5, -1.4], legB: [1.4, -1.5], armF: [0.8, 1.0], armB: [0.6, 1.0], lowest: 2 }), S)];
    out.wave = [R(P({ lean: 0, armF: [2.8, 0.3] }), S), R(P({ lean: 0, armF: [2.6, -0.3] }), S)];
    return out;
  }

  /* ====================== MULHER SONÂMBULA ======================
     As mulheres de Teewald, de camisola e olhos fechados, andando atrás do apito da fábrica. */
  function sleeperHead(hair, hairD) {
    return TC.sprite([
      '...hhhh....',
      '..hhHhhh...',
      '.hhffffh...',
      '.hffffffh..',
      'hhfffkkf...',
      'h.ffffff...',
      'h.fFfmff...',
      'h..FFFF....',
      'h..........'
    ], { h: hair, H: hairD, f: '#e0c0a8', F: '#b09080', k: '#7a5a50', m: '#a06060' });
  }
  function buildSleeper(gown, gownD, hair, hairD) {
    var S = {
      W: 48, H: 56, ox: 22, groundY: 53,
      thigh: 7, shin: 7, legT: 3.4, footH: 1, footL: 3, shinThin: 0.6,
      torso: 10, hipW: 6, shW: 8,
      upper: 5, fore: 5, armT: 2.8, fist: 2.6, foreThin: 0.3,
      head: sleeperHead(hair, hairD), headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#e0c0a8'), pantsB: solid('#b09080'), boot: solid('#e0c0a8'), bootB: solid('#b09080'),
        shirt: solid(gown), sleeve: solid(gown), sleeveB: solid(gownD), skin: solid('#e0c0a8'), skinB: solid('#b09080'), outline: '#14100e'
      },
      after: function (pb, info, pose) {
        var g = solid(gown), gd = solid(gownD);
        poly(pb, [[info.hx - 5, info.hy - 3], [info.hx + 5, info.hy - 3], [info.hx + 7 + pose.skirt, S.groundY - 6], [info.hx - 7 - pose.skirt, S.groundY - 6]], function (x, y) { return (x & 3) === 0 ? gd(x, y) : g(x, y); });
      }
    };
    var R = ART.renderFigure, out = {};
    // braços meio estendidos para a frente, passos curtos
    out.walk = walkPoses(8, 0.22, 0.04, { armF: [1.0, 0.25], armB: [0.85, 0.3] }).map(function (p) { p.skirt = 1; return R(p, S); });
    out.idle = [R(P({ lean: 0.02, armF: [1.0, 0.25], armB: [0.85, 0.3] }), S)];
    out.sew = [R(P({ lean: 0.25, armF: [1.2, 0.9], armB: [1.0, 1.0], headY: 1 }), S), R(P({ lean: 0.27, armF: [1.25, 0.8], armB: [1.05, 0.95], headY: 1 }), S)];
    out.awake = [R(P({ lean: -0.1, armF: [0.6, 1.4], armB: [0.4, 1.5] }), S)];
    out.run = walkPoses(8, 0.5, 0.2).map(function (p) { p.skirt = 2; return R(p, S); });
    return out;
  }

  /* ====================== O VELHO GERHARD MORGENSTERN ======================
     O dono da fábrica, oitenta e tantos anos, na cadeira de rodas, com a chave pendurada no pescoço. */
  var GERHARD_HEAD = TC.sprite([
    '...wwww....',
    '..wWwwww...',
    '.wwffffw...',
    '.wffffff...',
    '.wggfggf...',
    '..ffffff...',
    '..fFmmf....',
    '...FFFF....'
  ], { w: '#e8e8ec', W: '#ffffff', f: '#d8b098', F: '#a07a68', g: '#8a8a96', m: '#6a3a2a' });
  function buildGerhard() {
    var S = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.2, fist: 3, foreThin: 0.4,
      head: GERHARD_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#4a4a54'), pantsB: solid('#34343c'), boot: solid('#1a1410'), bootB: solid('#100c08'),
        shirt: (function () { var a = u32('#6a5a48'), b = u32('#4a3e30'); return function (x, y) { return (y % 3 === 0) ? b : a; }; })(),
        sleeve: solid('#6a5a48'), sleeveB: solid('#4a3e30'), skin: solid('#d8b098'), skinB: solid('#a07a68'), outline: '#0c0a0a'
      },
      after: function (pb, info) {
        // manta xadrez sobre as pernas
        poly(pb, [[info.hx - 3, info.hy - 2], [info.hx + 12, info.hy - 1], [info.hx + 12, info.hy + 9], [info.hx - 3, info.hy + 6]], function (x, y) { return u32(((x >> 1) + (y >> 1)) % 2 ? '#6a2a2a' : '#3a4a2a'); });
        // a chave pendurada no barbante
        thick(pb, info.sx - 2, info.sy + 1, info.sx + 1, info.sy + 7, 1, solid('#c8b8a0'));
        pb.rect(Math.round(info.sx), Math.round(info.sy + 7), 2, 3, u32('#d8b040'));
      }
    };
    var R = ART.renderFigure;
    function chair(fig) {
      var cv = TC.canvas(56, 52), c = cv.ctx;
      // encosto e rodas da cadeira de rodas
      c.fillStyle = TC.col('#3a3a44'); c.fillRect(10, 18, 3, 26); c.fillRect(10, 34, 26, 3);
      c.drawImage(fig, 2, 0);
      c.fillStyle = TC.col('#1a1a20'); TC.fillCircle(c, 16, 42, 9);
      c.fillStyle = TC.col('#5a5a66'); TC.fillCircle(c, 16, 42, 7);
      c.fillStyle = TC.col('#1a1a20'); TC.fillCircle(c, 16, 42, 5);
      c.fillStyle = TC.col('#8a8a96'); for (var a = 0; a < 6; a++) c.fillRect(Math.round(16 + Math.cos(a) * 4), Math.round(42 + Math.sin(a) * 4), 1, 1);
      c.fillStyle = TC.col('#2a2a30'); TC.fillCircle(c, 38, 48, 3); c.fillRect(34, 36, 2, 10);
      cv.ox = 22; cv.oy = 51;
      return cv;
    }
    var sit = P({ lean: -0.12, legF: [1.55, -1.45], legB: [1.5, -1.5], armF: [0.9, 0.9], armB: [0.7, 1.0], lowest: 10 });
    var reach = P({ lean: -0.05, legF: [1.55, -1.45], legB: [1.5, -1.5], armF: [1.5, 0.3], armB: [0.7, 1.0], lowest: 10 });
    var bow = P({ lean: 0.35, legF: [1.55, -1.45], legB: [1.5, -1.5], armF: [0.6, 1.4], armB: [0.5, 1.5], lowest: 10, headY: 1 });
    return { idle: [chair(R(sit, S))], reach: [chair(R(reach, S))], bow: [chair(R(bow, S))] };
  }

  /* ====================== OMA HEDWIG (1852) ======================
     A primeira benzedeira de Teewald, moça ainda, no navio e no diário: lenço branco, vestido escuro, lampião. */
  var HEDWIG_HEAD = TC.sprite([
    '...wwww....',
    '..wWwwwww..',
    '.wwwwwwwww.',
    '.whhfffhw..',
    'wwhffEffw..',
    'w.fffffff..',
    '..fFfmff...',
    '...FFFF....'
  ], { w: '#e8e4dc', W: '#ffffff', h: '#8a5a30', f: '#e8c0a0', F: '#b88a70', E: '#2a3a5a', m: '#a05050' });
  function lampDraw(pb, info) {
    if (!info.hand) return;
    var hx = Math.round(info.hand.x), hy = Math.round(info.hand.y);
    thick(pb, hx, hy, hx, hy + 3, 1, solid('#2a2a30'));
    pb.rect(hx - 2, hy + 3, 5, 6, u32('#3a3a44'));
    pb.rect(hx - 1, hy + 4, 3, 4, u32('#ffd070'));
    pb.set(hx, hy + 5, u32('#ffffff'));
  }
  function buildHedwig() {
    var S = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4, footH: 2, footL: 3, shinThin: 0.6,
      torso: 10, hipW: 6, shW: 8,
      upper: 5, fore: 5, armT: 3, fist: 2.8, foreThin: 0.3,
      head: HEDWIG_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#2a2a3a'), pantsB: solid('#1a1a26'), boot: solid('#1a1210'), bootB: solid('#100a08'),
        shirt: solid('#2e2e44'), sleeve: solid('#2e2e44'), sleeveB: solid('#1e1e30'), skin: solid('#e8c0a0'), skinB: solid('#b88a70'), outline: '#0a0a12'
      },
      after: function (pb, info, pose) {
        skirt(info, pb, '#2a2a40', '#1a1a2c', pose.skirt, S.groundY - 1);
        // avental branco de colona
        poly(pb, [[info.hx - 1, info.hy - 2], [info.hx + 5, info.hy - 2], [info.hx + 6, info.hy + 12], [info.hx - 1, info.hy + 12]], solid('#d8d0bc'));
        if (pose.cuia) lampDraw(pb, info);   // aqui 'cuia' = lampião na mão
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.04, armF: [0.9, 0.6], cuia: true }), S), R(P({ lean: 0.04, breath: 1, armF: [0.95, 0.55], cuia: true }), S)];
    out.walk = walkPoses(8, 0.3, 0.1, { armF: [0.9, 0.6], cuia: true }).map(function (p) { p.skirt = 1; return R(p, S); });
    out.pray = [R(P({ lean: 0.1, armF: [0.9, 1.6], armB: [0.7, 1.7], headY: 1 }), S)];
    out.point = [R(P({ lean: 0.02, armF: [1.7, 0.05], armB: [0.9, 0.6], cuia: false }), S)];
    return out;
  }

  /* ====================== SEU ARNOLDO (o vendeiro da Linha Esperança) ====================== */
  var ARNOLDO_HEAD = TC.sprite([
    '...cccc....',
    '..cCcccc...',
    'bbbbbbbbb..',
    '..fffffff..',
    '..ffffEff..',
    '.hfffffff..',
    '..fMMMMMf..',
    '...FFFF....'
  ], { c: '#3a3a44', C: '#5a5a66', b: '#2a2a30', f: '#e0a878', F: '#a87050', E: '#1a1010', M: '#5a3a2a', h: '#5a3a2a' });
  function buildArnoldo() {
    var S = {
      W: 48, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4.6, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 8, shW: 10,
      upper: 5, fore: 5, armT: 3.6, fist: 3.2, foreThin: 0.4,
      head: ARNOLDO_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#3a3a30'), pantsB: solid('#2a2a22'), boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: solid('#a8b0c0'), sleeve: solid('#a8b0c0'), sleeveB: solid('#7880a0'), skin: solid('#e0a878'), skinB: solid('#a87050'), outline: '#0e0a0a'
      },
      after: function (pb, info) {
        // avental de vendeiro
        poly(pb, [[info.sx - 3, info.sy + 3], [info.sx + 4, info.sy + 3], [info.hx + 6, info.hy + 8], [info.hx - 4, info.hy + 8]], solid('#e8e0c8'));
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.08 }), S), R(P({ lean: 0.08, breath: 1 }), S)];
    out.walk = walkPoses(8, 0.4, 0.14).map(function (p) { return R(p, S); });
    out.run = walkPoses(8, 0.7, 0.3).map(function (p) { return R(p, S); });
    out.scared = [R(P({ lean: -0.2, armF: [0.9, 1.6], armB: [0.7, 1.7] }), S)];
    out.point = [R(P({ lean: 0.04, armF: [1.7, 0.05] }), S)];
    return out;
  }

  /* ====================== SEU HELMUT WEBER (Rei do Tiro de 1997) ======================
     Chapéu verde da Sociedade de Tiro com pena, colete com medalhas e a espingarda. */
  var HELMUT_HEAD = TC.sprite([
    '....p......',
    '...gpgg....',
    '..gGgggg...',
    'GGGGGGGGG..',
    '..fffffff..',
    '..ffffEff..',
    '.wfffffff..',
    '..fwwwwwf..',
    '...wwww....'
  ], { p: '#e8e0c8', g: '#2a5a3a', G: '#1a3a2a', f: '#e0b090', E: '#1a1010', w: '#e8e8ec' });
  function buildHelmut() {
    var S = {
      W: 56, H: 52, ox: 22, groundY: 49,
      thigh: 6, shin: 6, legT: 4.2, footH: 2, footL: 4, shinThin: 0.6,
      torso: 10, hipW: 7, shW: 9,
      upper: 5, fore: 5, armT: 3.4, fist: 3, foreThin: 0.4,
      head: HELMUT_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: solid('#3a3024'), pantsB: solid('#2a2218'), boot: solid('#2a1a10'), bootB: solid('#1a100a'),
        shirt: (function () { var a = u32('#2a4a32'), b = u32('#d8b040'); return function (x, y) { return (x * 5 + y * 3) % 23 === 0 ? b : a; }; })(),
        sleeve: solid('#e0dcd0'), sleeveB: solid('#b0aca0'), skin: solid('#e0b090'), skinB: solid('#a87a60'), outline: '#0c0a08'
      },
      after: function (pb, info, pose) {
        if (!info.hand || !pose.cuia) return;
        // espingarda apontada para a frente ('cuia' = com a arma em punho)
        var hx = info.hand.x, hy = info.hand.y;
        thick(pb, hx - 6, hy + 2, hx + 14, hy - 1, 1.6, solid('#2a2a30'));
        thick(pb, hx - 8, hy + 3, hx - 2, hy + 2, 2.4, solid('#6a3a20'));
      }
    };
    var R = ART.renderFigure, out = {};
    out.idle = [R(P({ lean: 0.06 }), S), R(P({ lean: 0.06, breath: 1 }), S)];
    out.aim = [R(P({ lean: 0.1, armF: [1.5, 0.1], armB: [1.3, 0.5], cuia: true }), S)];
    out.walk = walkPoses(8, 0.4, 0.14).map(function (p) { return R(p, S); });
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
  function face(pb, skin, skinS, skinD, skinL, cx, cy, rx, ry) {
    ellipseFill(pb, cx || 20, cy || 21, rx || 10, ry || 11, function (x, y, dx, dy) {
      var l = -dx * 0.6 - dy * 0.3;
      return u32(l > 0.35 ? skinL : l > -0.25 ? skin : l > -0.6 ? skinS : skinD);
    });
  }
  function rosaPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a1a10', '#080402');
    // cabelo comprido grisalho atrás
    ellipseFill(pb, 20, 22, 14, 17, function (x, y) { return u32((x * 7 + (y >> 2)) % 9 === 0 ? '#8a8480' : '#2a2420'); });
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32((x * 3 + y * 5) % 11 === 0 ? '#e0c060' : '#7a2e26'); });
    pb.rect(4, 34, 32, 3, u32('#3a3a4a'));
    pb.rect(16, 28, 8, 6, u32('#7a4e34'));
    face(pb, '#b07850', '#8a5a3c', '#5a3a24', '#d09a70');
    // risca no meio do cabelo
    ellipseFill(pb, 20, 12, 11, 6, function (x, y, dx, dy) { return dy > 0.5 ? 0 : u32(Math.abs(x - 20) < 1 ? '#5a3a24' : (x * 7 + (y >> 1)) % 9 === 0 ? '#8a8480' : '#3a3430'); });
    // olhos serenos e rugas
    pb.rect(14, 20, 4, 1, u32('#3a2014')); pb.rect(23, 20, 4, 1, u32('#3a2014'));
    pb.rect(15, 21, 3, 1, u32('#1a1008')); pb.rect(23, 21, 3, 1, u32('#1a1008'));
    pb.set(12, 22, u32('#5a3a24')); pb.set(28, 22, u32('#5a3a24'));
    pb.rect(15, 27, 1, 3, u32('#8a5a3c')); pb.rect(25, 27, 1, 3, u32('#8a5a3c'));
    pb.rect(20, 21, 1, 5, u32('#8a5a3c')); pb.rect(19, 26, 3, 1, u32('#5a3a24'));
    pb.rect(17, 30, 7, 1, u32('#5a2a1a'));
    // colar de sementes
    for (var x = 13; x < 28; x += 2) pb.set(x, 35 + (x === 19 || x === 21 ? 1 : 0), u32(x % 4 === 1 ? '#e8e0c8' : '#6a2a1a'));
    return pb.toCanvas();
  }
  function gerhardPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a1a20', '#050506');
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32(y % 3 === 0 ? '#4a3e30' : '#6a5a48'); });
    pb.rect(16, 28, 8, 6, u32('#a07a68'));
    face(pb, '#d8b098', '#b08a78', '#7a5a4a', '#f0d0b8');
    // cabelo branco ralo
    ellipseFill(pb, 20, 11, 11, 5, function (x, y, dx, dy) { return dy < -0.5 && (x % 3 === 0) ? 0 : u32(dx < -0.3 ? '#ffffff' : '#d8d8e0'); });
    pb.rect(9, 14, 3, 8, u32('#e8e8ec')); pb.rect(28, 14, 3, 8, u32('#e8e8ec'));
    // óculos redondos
    [[16, 21], [24, 21]].forEach(function (e) {
      ellipseFill(pb, e[0], e[1], 3.5, 3, function (x, y, dx, dy) { return dx * dx + dy * dy > 0.55 ? u32('#8a8a96') : u32('#c8d0d8'); });
      pb.set(e[0], e[1], u32('#2a2a30'));
    });
    pb.rect(19, 21, 2, 1, u32('#8a8a96'));
    // rugas fundas e boca caída
    pb.rect(13, 25, 1, 4, u32('#7a5a4a')); pb.rect(27, 25, 1, 4, u32('#7a5a4a'));
    pb.rect(17, 30, 7, 1, u32('#6a3a2a')); pb.set(16, 31, u32('#6a3a2a')); pb.set(24, 31, u32('#6a3a2a'));
    // barbante da chave
    pb.line(14, 33, 20, 39, u32('#c8b8a0')); pb.line(26, 33, 20, 39, u32('#c8b8a0'));
    return pb.toCanvas();
  }
  function kidPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a2a3a', '#06080c');
    ellipseFill(pb, 20, 44, 17, 11, function () { return u32('#c8c0a0'); });
    pb.rect(16, 29, 8, 5, u32('#c09070'));
    face(pb, '#f0c090', '#d0a070', '#a07050', '#fff0d0', 20, 22, 10, 10);
    ellipseFill(pb, 20, 13, 11, 6, function (x, y, dx, dy) { return dy > 0.4 ? 0 : u32(dx < -0.3 ? '#4a7aaa' : '#2a5a8a'); });
    ellipseFill(pb, 22, 16, 13, 2, function (x, y, dx, dy) { return u32(dy < 0 ? '#1a3a5a' : '#10243a'); });
    pb.rect(14, 21, 4, 3, u32('#f8f8f8')); pb.rect(23, 21, 4, 3, u32('#f8f8f8'));
    pb.rect(15, 22, 2, 2, u32('#2a1a10')); pb.rect(24, 22, 2, 2, u32('#2a1a10'));
    for (var k = 0; k < 6; k++) pb.set(13 + k * 3, 26 + (k % 2), u32('#c08060'));
    pb.rect(18, 30, 5, 1, u32('#a04a3a'));
    return pb.toCanvas();
  }

  function hedwigPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#2a2414', '#080604');
    ellipseFill(pb, 20, 44, 18, 11, function (x, y) { return u32((x + y) % 6 === 0 ? '#3a3a54' : '#2e2e44'); });
    pb.rect(16, 28, 8, 6, u32('#b88a70'));
    face(pb, '#e8c0a0', '#c89a80', '#986a58', '#fff0e0');
    // lenço branco amarrado, cabelo castanho na testa
    ellipseFill(pb, 20, 13, 13, 9, function (x, y, dx, dy) { return dy > 0.45 && Math.abs(dx) < 0.75 ? 0 : u32((x + y) % 7 === 0 ? '#c8c4bc' : '#e8e4dc'); });
    for (var x = 13; x < 28; x++) if (x % 3) pb.set(x, 15, u32('#8a5a30'));
    pb.rect(14, 20, 4, 1, u32('#5a3a20')); pb.rect(23, 20, 4, 1, u32('#5a3a20'));
    pb.rect(14, 21, 4, 2, u32('#f8f8f8')); pb.rect(23, 21, 4, 2, u32('#f8f8f8'));
    pb.rect(15, 21, 2, 2, u32('#2a3a5a')); pb.rect(24, 21, 2, 2, u32('#2a3a5a'));
    pb.rect(20, 21, 1, 5, u32('#c89a80')); pb.rect(18, 30, 5, 1, u32('#a05050'));
    // luz do lampião de baixo
    for (var k = 0; k < 40; k++) pb.blend(k, 39, '#ffc060', 0.3);
    return pb.toCanvas();
  }
  function arnoldoPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1e2418', '#060804');
    ellipseFill(pb, 20, 44, 19, 11, function () { return u32('#a8b0c0'); });
    pb.rect(13, 33, 14, 7, u32('#e8e0c8'));
    pb.rect(16, 28, 8, 6, u32('#a87050'));
    face(pb, '#e0a878', '#c08a60', '#8a5a40', '#f8c898');
    ellipseFill(pb, 20, 11, 11, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#5a5a66' : '#3a3a44'); });
    ellipseFill(pb, 22, 15, 15, 2.4, function (x, y, dx, dy) { return u32(dy < 0 ? '#2a2a30' : '#1a1a20'); });
    pb.rect(14, 20, 4, 2, u32('#e8e0d0')); pb.rect(23, 20, 4, 2, u32('#e8e0d0'));
    pb.rect(16, 20, 2, 2, u32('#3a2a1a')); pb.rect(24, 20, 2, 2, u32('#3a2a1a'));
    pb.rect(20, 21, 1, 5, u32('#c08a60'));
    for (var x = 13; x <= 27; x++) for (var y = 27; y <= 29; y++) pb.set(x, y, u32(y === 27 ? '#6a4a3a' : '#5a3a2a'));
    pb.rect(18, 31, 5, 1, u32('#8a5a40'));
    return pb.toCanvas();
  }
  function helmutPortrait() {
    var pb = new TC.PixBuf(40, 40);
    portraitBG(pb, '#1a2a1a', '#050805');
    ellipseFill(pb, 20, 44, 19, 11, function (x, y) { return u32((x * 5 + y * 3) % 23 === 0 ? '#d8b040' : '#2a4a32'); });
    pb.rect(17, 34, 6, 6, u32('#e0dcd0'));
    pb.circle(13, 36, 2, u32('#e8c040')); pb.circle(27, 36, 2, u32('#c0c0c8'));
    pb.rect(16, 28, 8, 6, u32('#a87a60'));
    face(pb, '#e0b090', '#c09070', '#8a6050', '#f8d0b0');
    // bigode e costeletas brancas
    for (var x = 12; x <= 28; x++) for (var y = 27; y <= 29 + (Math.abs(x - 20) > 5 ? 1 : 0); y++) pb.set(x, y, u32('#e8e8ec'));
    pb.rect(9, 16, 3, 9, u32('#e8e8ec')); pb.rect(28, 16, 3, 9, u32('#e8e8ec'));
    // chapéu verde da Sociedade de Tiro com pena
    ellipseFill(pb, 20, 10, 10, 6, function (x, y, dx) { return u32(dx < -0.3 ? '#3a6a4a' : '#2a5a3a'); });
    ellipseFill(pb, 20, 14, 15, 2.4, function (x, y, dx, dy) { return u32(dy < 0 ? '#1a3a2a' : '#10261a'); });
    pb.line(27, 9, 33, 1, u32('#e8e0c8'), 2);
    pb.rect(14, 20, 4, 2, u32('#e8e0d0')); pb.rect(23, 20, 4, 2, u32('#e8e0d0'));
    pb.rect(15, 20, 2, 2, u32('#2a3a2a')); pb.rect(24, 20, 2, 2, u32('#2a3a2a'));
    pb.rect(13, 18, 5, 1, u32('#e8e8ec')); pb.rect(23, 18, 5, 1, u32('#e8e8ec'));
    pb.rect(20, 21, 1, 5, u32('#c09070'));
    return pb.toCanvas();
  }

  /* ====================== PREPARO ====================== */
  ART.castInit = function () {
    if (CAST.ready) return CAST;
    CAST.frida = buildFrida();
    CAST.rosa = buildRosa();
    CAST.hedwig = buildHedwig();
    CAST.arnoldo = buildArnoldo();
    CAST.helmut = buildHelmut();
    CAST.kids = { boy: buildKid('boy'), girl: buildKid('girl'), small: buildKid('small') };
    CAST.sleepers = [
      buildSleeper('#e8e4dc', '#b8b4ac', '#5a3a2a', '#7a5a40'),
      buildSleeper('#e8c8d0', '#b898a0', '#e8c060', '#c09030'),
      buildSleeper('#c8d8e8', '#98a8b8', '#2a1a14', '#4a3020'),
      buildSleeper('#e8e0c0', '#b8b090', '#8a8480', '#b0aaa6')
    ];
    CAST.gerhard = buildGerhard();
    var EXTRA = {
      rosa: { normal: rosaPortrait() }, gerhard: { normal: gerhardPortrait() }, kid: { normal: kidPortrait() }, lena: { normal: kidPortrait() },
      hedwig: { normal: hedwigPortrait() }, arnoldo: { normal: arnoldoPortrait() }, helmut: { normal: helmutPortrait() }
    };
    var orig = ART.portrait;
    if (!orig._cast) {
      ART.portrait = function (who, f) {
        if (EXTRA[who]) return EXTRA[who][f] || EXTRA[who].normal;
        return orig(who, f);
      };
      ART.portrait._cast = true;
    }
    CAST.ready = true;
    return CAST;
  };

  /* figura de cena genérica para qualquer conjunto de poses deste elenco (x = centro, y = pés) */
  ART.drawCast = function (c, set, pose, x, y, face, t, anim, alpha, tint) {
    var arr = set[pose] || set.idle;
    var fr = (pose === 'walk' || pose === 'run') ? arr[Math.floor((anim || 0) / 6) % arr.length] : arr[Math.floor((t || 0) / 30) % arr.length];
    if (tint) fr = TC.tintCached(fr, tint[0], tint[1]);
    var img = face < 0 ? TC.flip(fr) : fr;
    var ox = fr.ox != null ? (face < 0 ? fr.width - fr.ox : fr.ox) : fr.width / 2;
    var oy = fr.oy != null ? fr.oy : fr.height;
    c.globalAlpha = alpha == null ? 1 : alpha;
    c.drawImage(img, Math.round(x - ox), Math.round(y - oy + 1));
    c.globalAlpha = 1;
  };

  TC.ui.addVoice('rosa', 360, '#e0b080');
  TC.ui.addVoice('gerhard', 300, '#b8c0d0');
  TC.ui.addVoice('kid', 900, '#a0d0ff');
  TC.ui.addVoice('ewald', 400, '#d8a878');
  TC.ui.addVoice('ingrid', 760, '#f0d070');
  TC.ui.addVoice('lena', 980, '#a0d0ff');
  TC.ui.addVoice('hedwig', 640, '#f0e0c0');
  TC.ui.addVoice('arnoldo', 440, '#c0c8d8');
  TC.ui.addVoice('helmut', 340, '#a0d0a0');
  TC.ui.addVoice('hilde', 700, '#ffb0b0');
  TC.ui.addVoice('jacob', 260, '#d0b090');
  TC.ui.addVoice('vogt', 330, '#d8d8c0');
  TC.ui.addVoice('pelz', 180, '#a8c890');
  TC.ui.addVoice('alte', 120, '#ff8070');
  TC.ui.addVoice('boitata', 200, '#ffc060');
})();
