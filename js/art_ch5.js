'use strict';
/* Teewald City — Capítulo 5 ("A Noite Grande"): arte procedural.
   O boi sem olho, os cães do bugreiro, os ervateiros possuídos, o olho voador, o fantasma do bugreiro Jacob Becker,
   a Boiguaçu (a cobra grande e cega) e a Boitatá (a cobra de fogo feita de mil olhos); o potreiro da Linha Becker,
   as ruínas da ervateira, a mata de araucária, as casas subterrâneas kaingang, a boca da caverna, o tesouro de luz,
   o caminhão do Arno e a estrada da serra. Montado uma vez, quando o capítulo pede (TC.ART.ch5Init). */
(function () {
  var ART = TC.ART;
  var u32 = TC.u32;
  var poly = ART._poly, thick = ART._thick, outline = ART._outline, blit = ART._blit;
  var C5 = ART.ch5 = {};
  var H2 = TC.hash2;

  function solid(hex) { var c = u32(hex); return function () { return c; }; }
  function P(o) {
    return {
      legF: o.legF || [0.1, -0.05], legB: o.legB || [-0.1, -0.05],
      armF: o.armF || [0.15, 0.45], armB: o.armB || [-0.1, 0.35],
      lean: o.lean || 0, breath: o.breath || 0, hipX: o.hipX || 0, headY: o.headY || 0, headX: o.headX || 0,
      hurtFace: !!o.hurtFace, dy: o.dy || 0, lowest: o.lowest,
      toolA: o.toolA || 0, noTool: !!o.noTool, gun: o.gun || null, torch: !!o.torch
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
  function ghostly(cv, col, amt) {
    var t = TC.tint(cv, col || '#9ab0e0', amt == null ? 0.45 : amt);
    t.ox = cv.ox; t.oy = cv.oy;
    return t;
  }
  function ell(pb, cx, cy, rx, ry, fn) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) { var c = fn(x, y, dx, dy); if (c) pb.set(x, y, c); }
    }
  }
  function tile(fn) {
    var pb = new TC.PixBuf(16, 16);
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var c = fn(x, y);
      if (c) pb.d[y * 16 + x] = u32(c);
    }
    return pb.toCanvas();
  }
  function shadeFn(light, base, dark, darker) {
    var L = u32(light), B = u32(base), D = u32(dark), K = u32(darker || dark);
    return function (x, y, dx, dy) {
      var l = -dy * 0.75 + dx * 0.25;
      return l > 0.45 ? L : l > -0.35 ? B : l > -0.75 ? D : K;
    };
  }

  /* ====================== O BOI SEM OLHO ======================
     Boi colonial (hereford: couro vermelho, cara branca), chifres compridos e duas órbitas vazias. */
  function oxFrame(o, pal) {
    o = o || {};
    pal = pal || {};
    var W = 62, H = 40, G = 37;
    var pb = new TC.PixBuf(W, H);
    var dy = o.dy || 0;
    var hide = shadeFn(pal.hideL || '#8a4228', pal.hide || '#6a2e1c', pal.hideD || '#4a1e12', pal.hideK || '#30120a');
    var face = shadeFn('#f0e8d8', pal.face || '#d8ceb8', '#a89c88', '#7a705e');
    var legC = u32(pal.leg || '#4a1e12'), legF = u32(pal.legFar || '#30120a'), hoof = u32('#141010');
    var legs = o.legs || [0, 0, 0, 0];
    // pernas de trás (longe) primeiro
    function leg(x, a, far, bend) {
      var hy = 25 + dy, len1 = 7, len2 = 6;
      var kx = x + Math.sin(a) * len1, ky = hy + Math.cos(a) * len1;
      var fx = kx + Math.sin(a + (bend || 0)) * len2, fy = Math.min(G, ky + Math.cos(a + (bend || 0)) * len2);
      if (o.lie) { fy = G; ky = G - 2; kx = x + (far ? -5 : 5); fx = kx + (far ? -4 : 4); }
      thick(pb, x, hy - 2, kx, ky, far ? 3.4 : 4, function () { return far ? legF : legC; });
      thick(pb, kx, ky, fx, fy, far ? 2.4 : 2.8, function () { return far ? legF : legC; });
      pb.rect(Math.round(fx - 1), Math.round(fy) - 1, 3, 2, hoof);
    }
    if (!o.lie) { leg(17, legs[1], true, -0.2); leg(37, legs[3], true, 0.25); }
    // rabo
    var tailSw = o.tail || 0;
    thick(pb, 11, 13 + dy, 9 + tailSw, 27 + dy, 1.4, solid(pal.hideD || '#4a1e12'));
    ell(pb, 9 + tailSw, 29 + dy, 1.6, 2.4, function () { return u32('#1a0c08'); });
    // corpo
    ell(pb, 26, 20 + dy, 16, 9, hide);
    ell(pb, 15, 17 + dy, 7, 8, hide);
    ell(pb, 37, 16 + dy, 8, 9, hide);
    // barbela branca no peito e na barriga
    ell(pb, 41, 22 + dy, 4, 5, face);
    for (var x = 18; x < 36; x++) if (H2(x, 3, 9) > 0.55) pb.set(x, 28 + dy, u32('#c8bca8'));
    if (!o.lie) { leg(20, legs[0], false, -0.2); leg(39, legs[2], false, 0.25); }
    else { leg(18, 0, true); leg(38, 0, false); }
    // pescoço e cabeça
    var hp = o.head || 'up';
    var hx = hp === 'low' ? 50 : hp === 'graze' ? 48 : hp === 'shake' ? 47 : 47;
    var hy = hp === 'low' ? 25 : hp === 'graze' ? 29 : hp === 'shake' ? 14 : 15;
    if (o.lie) { hx = 48; hy = 27; }
    thick(pb, 39, 15 + dy, hx - 2, hy + dy + 1, 8, hide);
    var hd = hy + dy;
    // focinho mais para baixo e para a frente
    var mx = hx + (hp === 'low' ? 7 : 5), my = hd + (hp === 'low' ? 5 : 7);
    poly(pb, [[hx - 5, hd - 5], [hx + 3, hd - 6], [mx + 2, my - 1], [mx + 1, my + 3], [hx - 2, hd + 4]], function (xx, yy) {
      var k = (xx - hx) / 8 - (yy - hd) / 10;
      return u32(k > 0.3 ? '#f0e8d8' : k > -0.4 ? '#d8ceb8' : '#a89c88');
    });
    ell(pb, mx, my + 1, 3, 2.4, function () { return u32('#b8887a'); });
    pb.set(Math.round(mx + 1), Math.round(my), u32('#3a1a14'));
    // órbita vazia (sem olho) — escura, com um brilho úmido
    var ex = hx - 1, ey = hd - 2;
    pb.rect(ex - 1, ey - 1, 3, 3, u32('#0a0606'));
    pb.set(ex + 1, ey - 1, u32('#4a4a58'));
    pb.set(ex, ey + 2, u32('#3a1414'));
    // orelha
    pb.rect(hx - 7, hd - 5, 3, 2, u32(pal.hideD || '#4a1e12'));
    // chifres compridos e curvos
    var hornC = u32('#e0d0a8'), hornT = u32('#3a3020');
    var fwd = hp === 'low' ? 1 : 0;
    for (var s = 0; s <= 10; s++) {
      var t = s / 10;
      var px = hx - 2 + t * (fwd ? 10 : 6) + Math.sin(t * 2.6) * 2;
      var py = hd - 6 - t * (fwd ? 2 : 6) + t * t * (fwd ? -1 : 3);
      pb.set(Math.round(px), Math.round(py), s > 7 ? hornT : hornC);
      pb.set(Math.round(px), Math.round(py) + 1, s > 7 ? hornT : u32('#b8a880'));
    }
    for (s = 0; s <= 7; s++) {
      var t2 = s / 7;
      pb.set(Math.round(hx - 3 - t2 * 4), Math.round(hd - 6 - t2 * 4 + t2 * t2 * 2), s > 5 ? hornT : u32('#a89870'));
    }
    outline(pb, u32('#0c0606'));
    var cv = pb.toCanvas();
    cv.ox = 28; cv.oy = G + 1;
    return cv;
  }
  function buildOx(pal) {
    var out = {};
    out.walk = [0, 1, 2, 3].map(function (f) {
      var q = f / 4 * TC.TAU, a = 0.35;
      return oxFrame({ legs: [a * Math.sin(q), -a * Math.sin(q), -a * Math.sin(q), a * Math.sin(q)], dy: f % 2 ? 1 : 0, tail: f % 2 ? 1 : -1 }, pal);
    });
    out.idle = [oxFrame({ head: 'graze', tail: -1 }, pal), oxFrame({ head: 'graze', tail: 1, dy: 1 }, pal)];
    out.stand = [oxFrame({ head: 'up' }, pal)];
    out.lower = [oxFrame({ head: 'low', legs: [-0.35, 0.2, 0.45, -0.1], dy: 1 }, pal), oxFrame({ head: 'low', legs: [-0.35, 0.2, -0.1, 0.5], dy: 1 }, pal)];
    out.charge = [oxFrame({ head: 'low', legs: [0.7, -0.6, 0.6, -0.7], dy: -1, tail: 3 }, pal), oxFrame({ head: 'low', legs: [-0.4, 0.4, -0.5, 0.4], dy: 1, tail: 3 }, pal)];
    out.dizzy = [oxFrame({ head: 'shake', legs: [0.15, -0.1, 0.2, -0.15] }, pal), oxFrame({ head: 'graze', legs: [-0.1, 0.15, -0.15, 0.2], dy: 1 }, pal)];
    out.hurt = [oxFrame({ head: 'shake', legs: [-0.3, 0.3, 0.4, -0.2], dy: -1 }, pal)];
    out.lie = [oxFrame({ lie: true, dy: 8 }, pal)];
    return out;
  }

  /* ====================== CÃO DO BUGREIRO (fantasma) ====================== */
  function dogFrame(o) {
    o = o || {};
    var W = 36, H = 26, G = 23;
    var pb = new TC.PixBuf(W, H);
    var dy = o.dy || 0;
    var body = shadeFn('#f0f6ff', '#c8d6ec', '#8a9cc0', '#5a6a90');
    var legC = u32('#9aaac8'), legFar = u32('#6a7aa0');
    var legs = o.legs || [0, 0, 0, 0];
    function leg(x, a, far) {
      var hy = 14 + dy;
      var fx = x + Math.sin(a) * 8, fy = Math.min(G, hy + Math.cos(a) * 9);
      thick(pb, x, hy, fx, fy, far ? 1.8 : 2.2, function () { return far ? legFar : legC; });
    }
    if (o.crouch) dy += 3;
    leg(10, legs[1], true); leg(22, legs[3], true);
    // rabo
    thick(pb, 6, 11 + dy, 2, (o.tailUp ? 4 : 9) + dy, 1.6, solid('#8a9cc0'));
    ell(pb, 14, 12 + dy, 9, 4.5, body);
    ell(pb, 21, 11 + dy, 5, 5, body);
    leg(12, legs[0], false); leg(23, legs[2], false);
    // cabeça
    var hx = o.crouch ? 27 : 26, hy = (o.crouch ? 11 : 7) + dy + (o.headDown || 0);
    ell(pb, hx, hy, 4.5, 3.6, body);
    var open = o.bite ? 3 : 0;
    poly(pb, [[hx + 2, hy - 1], [hx + 8, hy], [hx + 8, hy + 2], [hx + 2, hy + 3]], solid('#b8c8e0'));
    if (open) {
      poly(pb, [[hx + 2, hy + 3], [hx + 7, hy + 3 + open], [hx + 2, hy + 4 + open]], solid('#8a9cc0'));
      pb.rect(hx + 3, hy + 2, 4, open, u32('#1a2030'));
      pb.set(hx + 4, hy + 2, u32('#ffffff')); pb.set(hx + 6, hy + 2, u32('#ffffff'));
    }
    pb.set(hx + 8, hy, u32('#202838'));
    // orelhas em pé
    poly(pb, [[hx - 3, hy - 2], [hx - 1, hy - 8], [hx + 1, hy - 3]], solid('#a8b8d8'));
    // olho vazio com brilho frio
    pb.rect(hx + 1, hy - 1, 2, 2, u32('#101828'));
    pb.set(hx + 2, hy - 1, u32('#a0f0ff'));
    // coleira de corda
    thick(pb, hx - 4, hy + 1, hx - 2, hy + 4, 1.4, solid('#8a7050'));
    outline(pb, u32('#2a3450'));
    var cv = pb.toCanvas();
    cv.ox = 15; cv.oy = G + 1;
    return cv;
  }
  function buildDog() {
    var out = {};
    out.idle = [dogFrame({ legs: [0.05, -0.05, 0.05, -0.05], tailUp: true }), dogFrame({ legs: [0.05, -0.05, 0.05, -0.05], tailUp: true, dy: 1 })];
    out.run = [0, 1, 2, 3].map(function (f) {
      var q = f / 4 * TC.TAU;
      return dogFrame({ legs: [0.8 * Math.sin(q), 0.8 * Math.sin(q + 0.6), -0.8 * Math.sin(q), -0.8 * Math.sin(q + 0.6)], dy: f % 2 ? -1 : 0, tailUp: true });
    });
    out.crouch = [dogFrame({ crouch: true, legs: [0.6, 0.5, -0.5, -0.6], headDown: 1 })];
    out.leap = [dogFrame({ legs: [1.1, 1.0, -1.1, -1.0], dy: -2, bite: true, tailUp: true })];
    out.bite = [dogFrame({ legs: [0.4, 0.3, -0.3, -0.4], bite: true })];
    out.hurt = [dogFrame({ legs: [-0.4, -0.5, 0.4, 0.3], dy: -1, headDown: -2 })];
    out.lie = [dogFrame({ crouch: true, legs: [1.4, 1.3, -1.4, -1.3], headDown: 3 })];
    return out;
  }

  /* ====================== ERVATEIRO POSSUÍDO ======================
     Chapéu de palha, camisa encardida, calça arregaçada, alpargata e o facão de podar erva. */
  var ERV_HEAD = TC.sprite([
    '...yyyyy...',
    '..yYyyyyy..',
    '..yyyyyyy..',
    'ybbbbbbbbby',
    '..fffffff..',
    '..ffffeff..',
    '.hfffffff..',
    '..fMMMMf...',
    '...FFFF....'
  ], { y: '#c8a860', Y: '#e8d090', b: '#8a6a30', f: '#b88a62', F: '#8a5e40', e: '#d0ff60', M: '#3a2418', h: '#3a2418' });
  function buildErvateiro() {
    var facao = function (pb, info, pose) {
      if (pose.noTool || !info.hand) return;
      var a = pose.armF[0] + pose.armF[1] + pose.toolA;
      var dx = Math.sin(a), dy = Math.cos(a);
      var hx = info.hand.x, hy = info.hand.y;
      thick(pb, hx - dx * 2, hy - dy * 2, hx + dx * 2, hy + dy * 2, 2, solid('#3a2410'));
      // lâmina larga, curvada na ponta
      var px = -dy, py = dx;
      poly(pb, [[hx + dx * 2, hy + dy * 2], [hx + dx * 13 + px * 1, hy + dy * 13 + py * 1], [hx + dx * 14 + px * 3, hy + dy * 14 + py * 3], [hx + dx * 2 + px * 2.5, hy + dy * 2 + py * 2.5]], function () { return u32('#c8c8d4'); });
      thick(pb, hx + dx * 2, hy + dy * 2, hx + dx * 13, hy + dy * 13, 1, solid('#7a7a88'));
    };
    var S = {
      W: 60, H: 60, ox: 28, groundY: 57,
      thigh: 7, shin: 7, legT: 4.2, footH: 2, footL: 4, shinThin: 1,
      torso: 11, hipW: 7, shW: 10,
      upper: 6, fore: 5, armT: 3.4, fist: 3, foreThin: 0.6,
      head: ERV_HEAD, headOff: { x: -4, y: -9 },
      col: {
        pants: (function () { var a = u32('#5a5040'), b = u32('#4a4234'); return function (x, y) { return y > 50 ? u32('#b88a62') : ((x + y) % 6 === 0 ? b : a); }; })(),
        pantsB: solid('#3a3428'), boot: solid('#8a7050'), bootB: solid('#5a4a34'),
        shirt: (function () { var a = u32('#d0c8b0'), b = u32('#a8a088'), c = u32('#8a8270'); return function (x, y) { return (x * 3 + y * 2) % 11 === 0 ? c : (y % 4 === 0 ? b : a); }; })(),
        sleeve: solid('#d0c8b0'), sleeveB: solid('#a8a088'), fore: solid('#b88a62'), foreB: solid('#8a5e40'),
        skin: solid('#b88a62'), skinB: solid('#8a5e40'),
        belt: solid('#7a6040'), outline: '#100c08'
      },
      after: facao
    };
    var R = ART.renderFigure, out = {};
    function F(o) { return R(P(o), S); }
    out.idle = [F({ lean: 0.16, armF: [0.4, 0.5], armB: [0.1, 0.4], toolA: 0.2 }), F({ lean: 0.18, breath: 1, armF: [0.45, 0.5], armB: [0.15, 0.4], toolA: 0.2 })];
    out.walk = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.walk.push(F({
        lean: 0.2,
        legF: [0.42 * Math.sin(q), -(0.1 + 0.6 * Math.max(0, Math.cos(q)))],
        legB: [0.42 * Math.sin(q + Math.PI), -(0.1 + 0.6 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [0.45 - 0.15 * Math.sin(q), 0.5], armB: [0.2 + 0.3 * Math.sin(q), 0.5], toolA: 0.2
      }));
    }
    out.windup = [F({ lean: -0.25, legF: [0.35, -0.15], legB: [-0.35, -0.1], armF: [2.9, 0.1], armB: [2.4, 0.3], toolA: 0.3 })];
    out.swing = [F({ lean: 0.45, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [1.3, 0.1], armB: [0.9, 0.3], toolA: 0.2, hipX: 1 })];
    out.hurt = [F({ lean: -0.5, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], toolA: 0.4 })];
    out.kneel = [F({ lean: 0.35, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.6, 0.5], armB: [0.3, 0.6], noTool: true })];
    out.stand = out.idle;
    out.lie = [lying(F({ lean: 0, legF: [0.05, 0], legB: [-0.05, 0], armF: [0.4, 0.2], armB: [-0.3, 0.2], noTool: true }), 60, 56)];
    return out;
  }

  /* ====================== O OLHO VOADOR ======================
     Uma bola de carne do tamanho de uma cabeça, um olho só, de pupila em fenda. A íris é desenhada por cima. */
  function eyeBall(r, lid) {
    var S = r * 2 + 4, pb = new TC.PixBuf(S, S), c = S / 2;
    var scl = shadeFn('#fff8f0', '#e8dcd0', '#b8a898', '#7a6a60');
    ell(pb, c, c, r, r, function (x, y, dx, dy) {
      var col = scl(x, y, dx, dy);
      // veias vermelhas
      if (H2(x, y, 51) > 0.86 && dx * dx + dy * dy > 0.35) col = u32('#b04040');
      return col;
    });
    if (lid > 0) {
      // pálpebras de carne escura
      ell(pb, c, c, r + 0.5, r + 0.5, function (x, y, dx, dy) {
        var edge = 1 - lid;
        if (Math.abs(dy) >= edge) return u32(dy < 0 ? (dy < -edge - 0.15 ? '#5a2a2a' : '#7a3a34') : '#3a1a1a');
        return 0;
      });
      if (lid >= 1) for (var x = c - r + 1; x < c + r; x++) pb.set(x, c, u32('#1a0808'));
    }
    outline(pb, u32('#1a0a0a'));
    return pb.toCanvas();
  }
  function iris(r, col, glow) {
    var S = r * 2 + 2, pb = new TC.PixBuf(S, S), c = S / 2;
    ell(pb, c, c, r, r, function (x, y, dx, dy) {
      var d = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dx) < 0.22 && d < 0.9) return u32(glow ? '#ffffff' : '#0a0604');
      return u32(d > 0.8 ? TC.shade(col, 0.6) : (glow ? TC.mix(col, '#ffffff', 0.5) : col));
    });
    return pb.toCanvas();
  }

  /* ====================== JACOB BECKER, O BUGREIRO (1888) ======================
     Fantasma: chapéu de aba larga, barba comprida, casaco comprido, cartucheira, espingarda e a tocha. */
  var JACOB_HEAD = TC.sprite([
    '.....hhhh....',
    '....hHhhhh...',
    '....hhhhhh...',
    'bbbbbbbbbbbbb',
    '....ffffff...',
    '....ffffEf...',
    '...gfffffff..',
    '...gggMMgg...',
    '...ggggggg...',
    '....gggggg...',
    '.....gggg....',
    '......gg.....'
  ], { h: '#2a2620', H: '#4a4438', b: '#1a1814', f: '#d8d8c8', E: '#202830', g: '#7a6a58', M: '#3a3028' });
  function armEnd(info, S, a, back) {
    var sx = info.sx + (back ? -1 : 1), sy = info.sy + 1;
    var ex = sx + Math.sin(a[0]) * S.upper, ey = sy + Math.cos(a[0]) * S.upper;
    var fa = a[0] + a[1];
    return { x: ex + Math.sin(fa) * S.fore, y: ey + Math.cos(fa) * S.fore, a: fa };
  }
  function buildJacob() {
    var S = {
      W: 72, H: 66, ox: 32, groundY: 63,
      thigh: 8, shin: 8, legT: 4.4, footH: 2, footL: 5, shinThin: 0.8,
      torso: 13, hipW: 8, shW: 11,
      upper: 7, fore: 6, armT: 3.6, fist: 3, foreThin: 0.5,
      head: JACOB_HEAD, headOff: { x: -5, y: -10 },
      col: {
        pants: solid('#3a3630'), pantsB: solid('#2a2622'), boot: solid('#1a1410'), bootB: solid('#100c0a'),
        shirt: (function () { var a = u32('#4a4234'), b = u32('#5a5240'), c = u32('#2a261e'); return function (x, y) { return (x + y) % 9 === 0 ? c : (x % 5 === 0 ? b : a); }; })(),
        sleeve: solid('#4a4234'), sleeveB: solid('#2e2a22'), skin: solid('#d8d8c8'), skinB: solid('#a8a898'),
        belt: (function () { var a = u32('#4a3a24'), b = u32('#d8b860'); return function (x) { return x % 3 === 0 ? b : a; }; })(),
        outline: '#0a0a0c'
      },
      after: function (pb, info, pose) {
        var hx = info.hx, hy = info.hy;
        // abas do casaco comprido (até o joelho)
        var sw = pose.legF[0] - pose.legB[0];
        poly(pb, [[hx - 5, hy - 2], [hx + 5, hy - 2], [hx + 6 + Math.max(0, sw) * 6, hy + 11], [hx - 8 - Math.max(0, -sw) * 6 - (pose.flap || 0), hy + 12]], function (x, y) { return u32((x + y) % 7 === 0 ? '#2a261e' : '#40382c'); });
        // cartucheira atravessada no peito
        thick(pb, info.sx - 4, info.sy + 1, hx + 4, hy - 1, 2, solid('#5a4428'));
        for (var k = 0; k < 5; k++) {
          var t = (k + 0.5) / 5;
          pb.set(Math.round(info.sx - 4 + (hx + 4 - info.sx + 4) * t), Math.round(info.sy + 1 + (hy - 1 - info.sy - 1) * t), u32('#e8c870'));
        }
        // a tocha na mão de trás
        if (pose.torch) {
          var b = armEnd(info, S, pose.armB, true);
          thick(pb, b.x, b.y + 2, b.x + Math.sin(b.a + 2.6) * 7, b.y - 5, 2, solid('#5a3a20'));
          pb.rect(Math.round(b.x + Math.sin(b.a + 2.6) * 7) - 1, Math.round(b.y - 8), 3, 3, u32('#ffd060'));
        }
        // a espingarda
        if (pose.gun && info.hand) {
          var hxx = info.hand.x, hyy = info.hand.y, a, len = 22;
          if (pose.gun === 'aim') a = Math.PI / 2;            // horizontal, apontada
          else if (pose.gun === 'low') a = Math.PI / 2 + 0.35; // baionetada, para baixo
          else if (pose.gun === 'up') a = Math.PI - 0.45;      // de cano para cima, no ombro
          else a = pose.armF[0] + pose.armF[1];
          var dx = Math.sin(a), dy = Math.cos(a);
          thick(pb, hxx - dx * 7, hyy - dy * 7, hxx + dx * len, hyy + dy * len, 1.6, solid('#2a2a30'));
          thick(pb, hxx - dx * 11, hyy - dy * 11 + 1, hxx - dx * 2, hyy - dy * 2 + 1, 3, solid('#6a4a2a'));
          pb.set(Math.round(hxx + dx * len), Math.round(hyy + dy * len), u32('#8a8a96'));
        }
      }
    };
    var R = ART.renderFigure, out = {};
    function F(o) { return R(P(o), S); }
    out.idle = [F({ lean: 0.04, armF: [0.6, 1.2], armB: [-0.2, 0.4], gun: 'up', torch: true }), F({ lean: 0.05, breath: 1, armF: [0.62, 1.2], armB: [-0.15, 0.4], gun: 'up', torch: true })];
    out.walk = [];
    for (var i = 0; i < 6; i++) {
      var q = i / 6 * TC.TAU;
      out.walk.push(F({
        lean: 0.1,
        legF: [0.4 * Math.sin(q), -(0.1 + 0.6 * Math.max(0, Math.cos(q)))],
        legB: [0.4 * Math.sin(q + Math.PI), -(0.1 + 0.6 * Math.max(0, Math.cos(q + Math.PI)))],
        armF: [0.6, 1.2], armB: [0.3 * Math.sin(q) - 0.1, 0.4], gun: 'up', torch: true
      }));
    }
    out.aim = [F({ lean: 0.02, legF: [0.35, -0.1], legB: [-0.35, -0.1], armF: [1.45, 0.12], armB: [1.2, 0.5], gun: 'aim' })];
    out.shoot = [F({ lean: -0.18, legF: [0.35, -0.1], legB: [-0.35, -0.1], armF: [1.7, 0.1], armB: [1.4, 0.5], gun: 'aim', headX: -1 })];
    out.throw = [F({ lean: -0.2, legF: [0.4, -0.15], legB: [-0.35, -0.1], armF: [0.5, 1.0], armB: [2.9, 0.2], gun: 'up', torch: true, flap: 2 }),
      F({ lean: 0.3, legF: [0.5, -0.2], legB: [-0.45, -0.05], armF: [0.6, 1.0], armB: [1.6, 0.1], gun: 'up', flap: 3 })];
    out.rush = [0, 1].map(function (f) {
      var q = f * Math.PI;
      return F({ lean: 0.45, legF: [0.8 * Math.sin(q + 0.8), -(0.2 + 0.9 * Math.max(0, Math.cos(q + 0.8)))], legB: [0.8 * Math.sin(q + 0.8 + Math.PI), -0.4], armF: [1.4, 0.3], armB: [1.0, 0.6], gun: 'low', flap: 5 });
    });
    out.hurt = [F({ lean: -0.45, armF: [0.9, 0.9], armB: [-0.4, 1.2], legF: [0.3, -0.3], legB: [-0.2, -0.2], gun: 'free' })];
    out.kneel = [F({ lean: 0.4, legF: [1.35, -1.45], legB: [-0.05, -1.6], armF: [0.7, 0.4], armB: [0.3, 0.6], headY: 1 })];
    Object.keys(out).forEach(function (k) { out[k] = out[k].map(function (cv) { return ghostly(cv, '#b8d0d8', 0.35); }); });
    return out;
  }

  /* ====================== A COBRA GRANDE ======================
     Cabeça (virada para a direita; gira em tempo real) e gomos do corpo com olhinhos.
     dark = Boiguaçu (escura e cega); fire = Boitatá (toda acesa, mil olhos). */
  function snakeHead(kind, open) {
    var W = 50, H = 34, pb = new TC.PixBuf(W, H);
    var fire = kind === 'fire';
    var top = fire ? shadeFn('#ffd860', '#f07818', '#b83808', '#701804') : shadeFn('#3a4a32', '#22301e', '#141c10', '#0a0e08');
    var jawC = fire ? shadeFn('#ffc850', '#e06010', '#a02c08', '#601404') : shadeFn('#6a7a52', '#4a5a3a', '#34402a', '#202818');
    var jawDrop = open ? 9 : 0;
    // mandíbula de baixo
    poly(pb, [[4, 18], [36, 18 + jawDrop * 0.4], [46, 21 + jawDrop], [40, 24 + jawDrop], [8, 26]], function (x, y) { return jawC(x, y, (x - 25) / 25, (y - 22) / 6); });
    if (open) {
      poly(pb, [[12, 18], [44, 19], [42, 21 + jawDrop], [14, 23]], solid(fire ? '#a02010' : '#5a1418'));
      // presas
      [[38, 18], [32, 18]].forEach(function (f) { thick(pb, f[0], f[1], f[0] + 1, f[1] + 5, 1.4, solid('#f0ece0')); });
      thick(pb, 30, 19, 34, 20 + jawDrop - 2, 1, solid(fire ? '#ffe080' : '#c86070'));   // língua
    }
    // crânio: largo atrás, afinando para o focinho
    poly(pb, [[2, 8], [14, 3], [30, 4], [44, 10], [48, 15], [44, 19], [26, 20], [4, 22]], function (x, y) {
      var dx = (x - 24) / 24, dy = (y - 12) / 9;
      var col = top(x, y, dx, dy);
      if (!fire && ((x * 3 + y * 5) % 9 === 0 || H2(x >> 1, y >> 1, 77) > 0.85)) col = u32('#0e140a');
      if (fire && ((x * 3 + y * 5) % 9 === 0 || H2(x >> 1, y >> 1, 77) > 0.85)) col = u32('#ffe890');
      return col;
    });
    // escamas grandes do alto da cabeça
    for (var k = 0; k < 4; k++) ell(pb, 14 + k * 7, 7 + (k % 2), 3, 2, function () { return u32(fire ? '#ffb030' : '#3e5036'); });
    // olho: cego (leitoso) na Boiguaçu; aceso na Boitatá
    var ex = 33, ey = 10;
    ell(pb, ex, ey, 3.2, 2.6, function (x, y, dx, dy) { return u32(fire ? (Math.abs(dx) < 0.3 ? '#3a0a00' : '#fffbe0') : (dx < -0.2 && dy < 0 ? '#e8ece0' : '#a8b0a0')); });
    pb.rect(ex - 4, ey - 3, 8, 1, u32(fire ? '#c05010' : '#0a0e08'));
    if (fire) {
      // a Boitatá tem olhos por todo lado
      [[20, 9], [25, 14], [12, 13], [40, 13], [17, 17]].forEach(function (e) { ell(pb, e[0], e[1], 1.6, 1.4, function (x, y, dx) { return u32(Math.abs(dx) < 0.4 ? '#4a1000' : '#ffffff'); }); });
    }
    pb.set(46, 13, u32(fire ? '#a03008' : '#000000'));   // narina
    outline(pb, u32(fire ? '#7a1800' : '#040604'));
    var cv = pb.toCanvas();
    cv.cx = 18; cv.cy = 14;   // ponto de rotação (onde o pescoço encaixa)
    return cv;
  }
  function snakeSeg(kind, r, eyes) {
    var S = r * 2 + 4, pb = new TC.PixBuf(S, S), c = S / 2;
    var fire = kind === 'fire';
    var sh = fire ? shadeFn('#ffe070', '#f88a20', '#c84a0c', '#80200a') : shadeFn('#34442e', '#1e2a1a', '#121a0e', '#080c06');
    ell(pb, c, c, r, r, function (x, y, dx, dy) {
      var col = sh(x, y, dx, dy);
      var sc = ((x + (y >> 1) * 3) % 4 === 0) && ((y % 3) === 0);
      if (sc) col = u32(fire ? '#ffd050' : '#3a4c32');
      if (!fire && dy > 0.55) col = u32('#3a4428');   // barriga clara
      return col;
    });
    if (eyes) {
      var n = fire ? 5 : 2, rr = TC.RNG(r * 7 + (fire ? 3 : 1));
      for (var k = 0; k < n; k++) {
        var a = rr.range(-2.6, -0.4), d = rr.range(0.25, 0.6) * r;
        var ex = Math.round(c + Math.cos(a) * d), ey = Math.round(c + Math.sin(a) * d);
        if (eyes === 'open') {
          pb.rect(ex - 1, ey, 3, 2, u32(fire ? '#ffffff' : '#e8f0b0'));
          pb.set(ex, ey, u32(fire ? '#5a1000' : '#2a3010'));
        } else pb.rect(ex - 1, ey + 1, 3, 1, u32(fire ? '#a03008' : '#3a4a2a'));
      }
    }
    outline(pb, u32(fire ? '#8a2000' : '#040604'));
    return pb.toCanvas();
  }
  function buildSnake() {
    var out = { dark: {}, fire: {} };
    ['dark', 'fire'].forEach(function (k) {
      out[k].head = snakeHead(k, false);
      out[k].headOpen = snakeHead(k, true);
      out[k].seg = [];
      out[k].segOpen = [];
      for (var i = 0; i < 16; i++) {
        var r = Math.round(12 - i * 0.55);
        out[k].seg.push(snakeSeg(k, Math.max(4, r), 'closed'));
        out[k].segOpen.push(snakeSeg(k, Math.max(4, r), 'open'));
      }
    });
    return out;
  }

  /* ====================== PEQUENOS ====================== */
  var GRALHA_PAL = { k: '#06060c', b: '#2a5ab0', B: '#4a82d8', d: '#183a78', w: '#e8e0c8', y: '#ffd040', h: '#101018' };
  function buildGralha() {
    return {
      perch: TC.sprite([
        '.......hh...',
        '......hhhh..',
        '......hhyhk.',
        '.....bbhhhkk',
        '..dbbBBbww..',
        '.dbbBBbbww..',
        'ddbbbbbbw...',
        'd..bbbbb....',
        '.....k.k....'
      ], GRALHA_PAL),
      hop: TC.sprite([
        '.......hh...',
        '......hhhh..',
        '......hhyhk.',
        '....bbbhhhkk',
        '.dbbBBbbww..',
        'ddbbbbbbww..',
        'd..bbbbbw...',
        '....k...k...',
        '............'
      ], GRALHA_PAL),
      fly: [TC.sprite([
        '..bb........',
        '..bBb...hh..',
        '...bBb.hhyh.',
        '....bbbhhhkk',
        'ddbbbbbbww..',
        '...bbbbbw...',
        '............'
      ], GRALHA_PAL), TC.sprite([
        '............',
        '........hh..',
        '.......hhyh.',
        'ddbbbbbhhhkk',
        '...bbBBbww..',
        '...bBBb.....',
        '..bBb.......'
      ], GRALHA_PAL)]
    };
  }
  C5.pinha = TC.sprite([
    '....k..k....',
    '...kgkkgk...',
    '..kgGgGggk..',
    '.kgGbGbGbgk.',
    '.kGbgbgbgGk.',
    'kgbGbGbGbgk.',
    'kGbgbgbgbGk.',
    'kgbGbGbGbgk.',
    '.kGbgbgbgk..',
    '.kgGbGbGgk..',
    '..kgGgGgk...',
    '...kkgkk....',
    '.....k......'
  ], { k: '#14100a', g: '#3a4a1c', G: '#5a6a2a', b: '#6a4a24' });
  C5.pinhaShadow = (function () { var cv = TC.canvas(16, 5), c = cv.ctx; c.fillStyle = 'rgba(0,0,0,0.5)'; TC.fillEllipse(c, 8, 2, 7, 2); return cv; })();
  C5.bale = TC.sprite([
    '..kkkkkkkkkkkk..',
    '.kyYyyYyyYyyYyk.',
    'kyyYyyyYyyyYyyyk',
    'kYyyyYyyyYyyyYyk',
    'krrrrrrrrrrrrrrk',
    'kyyYyyyYyyyYyyyk',
    'kYyyYyyyyYyyYyyk',
    'kyyyyYyyYyyyyYyk',
    'krrrrrrrrrrrrrrk',
    'kYyyyyYyyyyYyyyk',
    'kyyYyyyyYyyyyYyk',
    'kdddddddddddddk.',
    '.kkkkkkkkkkkkk..'
  ], { k: '#2a1c08', y: '#c8a048', Y: '#e8c870', r: '#6a4a20', d: '#8a6a28' });
  C5.raidoImg = TC.sprite([
    '....gGgGg.....',
    '...gGgGgGg....',
    '..kkkkkkkkk...',
    '.kSsssssssSk..',
    'kSssssssssssk.',
    'kSsBsssBsssSk.',
    'kSssssssssSSk.',
    'kSsssBsssBssk.',
    'kSssssssssssk.',
    'kSsBsssBssssk.',
    'kSssssssssBsk.',
    'kSssssssssssk.',
    '.kSSssssssSSk.',
    '..kkSSSSSSkk..',
    '....kkkkkk....'
  ], { k: '#2a1a0c', S: '#7a6440', s: '#a08a5a', B: '#5a4a2a', g: '#3a5a2a', G: '#5a7a3a' });
  C5.pinhaoBits = TC.sprite(['.kk.', 'kbBk', 'kbbk', '.kk.'], { k: '#2a1408', b: '#8a4a20', B: '#c08050' });

  /* ====================== AMBIENTE ====================== */
  C5.tiles = function () {
    var T = {};
    // potreiro: grama com sereno (geada fina)
    T.pastTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        var gh = 3 + Math.round(H2(xx, 1, 300) * 2);
        if (y < gh - 2) return H2(xx, y, 301) > 0.5 ? (H2(xx, y, 305) > 0.8 ? '#c8d8d0' : '#4a6a3a') : null;
        if (y < gh) return H2(xx, y, 302) > 0.85 ? '#b8c8c0' : '#3a5a2e';
        if (y === gh) return '#24361e';
        var n = H2(xx, y, 303);
        return n > 0.88 ? '#5a4632' : n > 0.4 ? '#3a2c20' : '#30241a';
      });
    });
    // terra roxa da ervateira
    T.redTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        var gh = 2 + Math.round(H2(xx, 2, 310) * 2);
        if (y < gh - 1) return H2(xx, y, 311) > 0.6 ? (H2(xx, y, 315) > 0.6 ? '#3a5a2a' : '#5a6a30') : null;
        if (y < gh + 1) return H2(xx, y, 312) > 0.5 ? '#8a3a24' : '#7a3020';
        var n = H2(xx, y, 313);
        return n > 0.9 ? '#9a4a30' : n > 0.45 ? '#5a2216' : '#4a1c12';
      });
    });
    T.red = [0, 1].map(function (v) { return tile(function (x, y) { var n = H2(x + v * 16, y, 314); return n > 0.9 ? '#7a3424' : n > 0.45 ? '#5a2216' : '#4a1c12'; }); });
    // pedra de basalto com musgo (ressaltos do morro)
    T.rockTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y < 2) return H2(xx, y, 320) > 0.45 ? (y === 0 ? '#5a7a44' : '#3a5a32') : (y === 0 ? null : '#7a7a84');
        var row = Math.floor((y - 2) / 6), bx = (xx + row * 6) % 13;
        if (bx === 0 || (y - 2) % 6 === 5) return '#1a1a20';
        return H2(Math.floor((xx + row * 6) / 13), row, 321) > 0.5 ? '#5a5a64' : '#4a4a54';
      });
    });
    T.rock = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16, row = Math.floor(y / 6), bx = (xx + row * 6) % 13;
        if (bx === 0 || y % 6 === 5) return '#16161c';
        return H2(Math.floor((xx + row * 6) / 13), row, 322) > 0.5 ? '#4a4a54' : '#3e3e48';
      });
    });
    // aldeia: capim curto; as casas subterrâneas são buracos redondos cobertos de capim
    T.villTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        var gh = 3 + Math.round(H2(xx, 3, 330) * 3);
        if (y < gh - 2) return H2(xx, y, 331) > 0.4 ? (H2(xx, y, 335) > 0.7 ? '#6a8a44' : '#4a6a34') : null;
        if (y < gh) return '#34502a';
        if (y === gh) return '#22341c';
        var n = H2(xx, y, 333);
        return n > 0.9 ? '#5a4632' : n > 0.4 ? '#3a2c20' : '#30241a';
      });
    });
    function pit(side) {
      return tile(function (x, y) {
        // metade de uma depressão redonda: a borda desce e o fundo é escuro, com capim por cima
        var px = side ? x : x - 16, d = (px + 0.5) / 16;    // -1..1 ao longo dos dois tiles
        var depth = Math.round(Math.sqrt(Math.max(0, 1 - d * d)) * 7);
        if (y < 2) return H2(x + side * 16, y, 336) > 0.5 && depth < 3 ? '#5a7a3a' : null;
        if (y < 2 + depth) return null;
        if (y === 2 + depth) return H2(x, side, 337) > 0.4 ? '#4a6a34' : '#2a3e22';
        if (y < 4 + depth) return '#1e2a18';
        var n = H2(x + side * 16, y, 338);
        return n > 0.85 ? '#4a3a2a' : '#2a2018';
      });
    }
    T.pitL = pit(0); T.pitR = pit(1);
    // chão da caverna: arenito cor de ferrugem
    T.sandTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return H2(xx, 0, 340) > 0.3 ? '#b88a5a' : '#9a6a40';
        if (y < 3) return H2(xx, y, 341) > 0.5 ? '#8a5a38' : '#7a4c30';
        var row = Math.floor((y - 3) / 4);
        var n = H2(Math.floor((xx + row * 5) / 9), row, 342);
        if ((xx + row * 5) % 9 === 0 || (y - 3) % 4 === 3) return '#3a2214';
        return n > 0.5 ? '#6a3e26' : '#5a3420';
      });
    });
    T.sand = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16, row = Math.floor(y / 4);
        if ((xx + row * 5) % 9 === 0 || y % 4 === 3) return '#301c10';
        return H2(Math.floor((xx + row * 5) / 9), row, 343) > 0.5 ? '#5a3420' : '#4a2a1a';
      });
    });
    // carroceria do caminhão: tábuas
    T.bedTop = [0, 1].map(function (v) {
      return tile(function (x, y) {
        var xx = x + v * 16;
        if (y === 0) return '#d8b080';
        if (y < 4) return (xx % 16 === 15) ? '#4a3018' : (y === 1 ? '#b88a5a' : '#9a7048');
        if (y === 4) return '#3a2410';
        if (y < 7) return '#5a5a64';    // longarina de ferro
        if (y === 7) return '#2a2a30';
        return (x === 4 || x === 11) && y < 14 ? '#1a1a20' : null;
      });
    });
    T.bedFill = tile(function (x, y) { return (x === 4 || x === 11) && y < 10 ? '#1a1a20' : null; });
    return T;
  };

  /* cerca de arame farpado do potreiro */
  C5.fence = function (w, broken) {
    var h = 30, cv = TC.canvas(w, h), c = cv.ctx, r = TC.RNG(w + (broken ? 7 : 3));
    for (var x = 4; x < w; x += 26) {
      var lean = broken && r() < 0.4 ? r.range(-3, 3) : 0;
      c.fillStyle = TC.col('#4a3424'); TC.fillPoly(c, [[x, h], [x + 3, h], [x + 3 + lean, 4], [x + lean, 4]]);
      c.fillStyle = TC.col('#6a4c34'); c.fillRect(Math.round(x + lean), 4, 1, h - 6);
    }
    [9, 16, 23].forEach(function (wy, k) {
      if (broken && k === 1) return;
      ART.drawWire(c, 0, wy, w, wy, 2 + k, '#6a6a74');
      for (var bx = 6; bx < w; bx += 7) { c.fillStyle = TC.col('#9a9aa6'); c.fillRect(bx, Math.round(wy + Math.sin(bx / w * Math.PI) * (2 + k)) - 1, 1, 3); }
    });
    return cv;
  };
  /* porteira de madeira aberta */
  C5.gate = function () {
    var cv = TC.canvas(64, 40), c = cv.ctx;
    c.fillStyle = TC.col('#3a2818'); c.fillRect(2, 2, 6, 38); c.fillRect(56, 2, 6, 38);
    c.fillStyle = TC.col('#5a4028'); c.fillRect(2, 2, 2, 38); c.fillRect(56, 2, 2, 38);
    // folha da porteira entreaberta (em perspectiva)
    c.fillStyle = TC.col('#7a5a3a');
    for (var k = 0; k < 4; k++) TC.fillPoly(c, [[8, 8 + k * 7], [30, 12 + k * 6], [30, 14 + k * 6], [8, 11 + k * 7]]);
    TC.fillPoly(c, [[8, 8], [10, 8], [30, 32], [28, 32]]);
    c.fillStyle = TC.col('#4a3420'); c.fillRect(28, 11, 3, 25);
    return cv;
  };
  /* cocho de madeira */
  C5.trough = function () {
    var cv = TC.canvas(40, 14), c = cv.ctx;
    c.fillStyle = TC.col('#4a3420'); TC.fillPoly(c, [[0, 2], [40, 2], [36, 10], [4, 10]]);
    c.fillStyle = TC.col('#6a4c30'); c.fillRect(0, 2, 40, 2);
    c.fillStyle = TC.col('#2a3a4a'); c.fillRect(3, 4, 34, 2);
    c.fillStyle = TC.col('#3a2818'); c.fillRect(6, 10, 3, 4); c.fillRect(31, 10, 3, 4);
    return cv;
  };
  /* carijó caído: esteios quebrados e o telhado de capim desabado */
  C5.carijoRuin = function () {
    var W = 120, H = 70, cv = TC.canvas(W, H), c = cv.ctx;
    c.fillStyle = TC.col('#3a2818'); c.fillRect(10, 30, 4, 40); c.fillRect(104, 40, 4, 30);
    c.fillStyle = TC.col('#3a2818'); TC.fillPoly(c, [[56, 70], [60, 70], [70, 38], [66, 36]]);
    for (var y = 0; y < 24; y++) {
      for (var x = 4; x < 112; x++) {
        var top = 22 + (x - 4) * 0.3 + Math.sin(x * 0.2) * 2;
        if (y + top < 26 + x * 0.32 || H2(x, y, 401) > 0.93) continue;
        c.fillStyle = TC.col(H2(x, y, 402) > 0.7 ? '#7a6a38' : (x + y) % 3 === 0 ? '#4a3e20' : '#5e5028');
        c.fillRect(x, Math.round(y + top - 6), 1, 1);
      }
    }
    // girau quebrado com ramos secos
    c.fillStyle = TC.col('#2a1c10'); TC.fillPoly(c, [[14, 52], [70, 60], [70, 62], [14, 54]]);
    for (x = 16; x < 68; x += 3) { c.fillStyle = TC.col(H2(x, 3, 403) > 0.5 ? '#4a4a24' : '#5a5a2c'); c.fillRect(x, 48 + Math.round((x - 14) * 0.15), 2, 5); }
    // cinza do fogo de chão, apagado há muito tempo
    c.fillStyle = TC.col('#2a2624'); c.fillRect(30, 66, 44, 4);
    c.fillStyle = TC.col('#4a4644'); for (x = 32; x < 72; x += 4) c.fillRect(x, 65, 2, 1);
    return cv;
  };
  /* barbaquá em ruína: túnel de tijolo e a chaminé */
  C5.barbaqua = function () {
    var W = 140, H = 90, cv = TC.canvas(W, H), c = cv.ctx;
    function bricks(x0, y0, w, h, seed) {
      for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) {
        var row = Math.floor((y - y0) / 4), bx = (x - x0 + (row % 2) * 4) % 8;
        if (H2(x >> 2, y >> 2, seed) > 0.9) continue;
        c.fillStyle = TC.col(bx === 0 || (y - y0) % 4 === 3 ? '#3a1e14' : (H2(Math.floor((x - x0 + (row % 2) * 4) / 8), row, seed + 1) > 0.5 ? '#8a4a30' : '#7a3e28'));
        c.fillRect(x, y, 1, 1);
      }
    }
    bricks(100, 4, 18, 86, 410);
    c.fillStyle = TC.col('#2a1810'); c.fillRect(100, 0, 18, 5);
    bricks(0, 50, 104, 40, 420);
    // boca do túnel (escura) e a parte desabada
    c.fillStyle = TC.col('#0a0606'); TC.fillPoly(c, [[8, 90], [8, 66], [20, 58], [32, 66], [32, 90]]);
    c.clearRect(44, 50, 30, 14); c.clearRect(52, 64, 14, 6);
    c.fillStyle = TC.col('#3a1e14'); for (var k = 0; k < 12; k++) c.fillRect(46 + (k * 7) % 26, 86 + (k % 3), 4, 3);
    // mato crescendo por cima
    for (var x = 0; x < 120; x++) if (H2(x, 9, 430) > 0.5) { c.fillStyle = TC.col(H2(x, 1, 431) > 0.5 ? '#2a4a2a' : '#3a5a30'); c.fillRect(x, 46 + (x % 3), 1, 4 - (x % 3)); }
    return cv;
  };
  /* sacos de erva (raídos) empilhados */
  C5.raidos = function (n) {
    var cv = TC.canvas(16 * n + 8, 30), c = cv.ctx;
    for (var k = 0; k < n; k++) {
      var x = k * 16 + 2, y = 14;
      c.fillStyle = TC.col('#5a4a30'); TC.fillEllipse(c, x + 8, y + 8, 8, 7);
      c.fillStyle = TC.col('#7a6a44'); TC.fillEllipse(c, x + 7, y + 6, 6, 5);
      c.fillStyle = TC.col('#3a5a2a'); c.fillRect(x + 5, y, 6, 2);
      c.fillStyle = TC.col('#3a2e1c'); c.fillRect(x + 4, y + 2, 8, 1);
    }
    for (k = 0; k < n - 1; k++) {
      var x2 = k * 16 + 10;
      c.fillStyle = TC.col('#5a4a30'); TC.fillEllipse(c, x2 + 8, 10, 8, 7);
      c.fillStyle = TC.col('#7a6a44'); TC.fillEllipse(c, x2 + 7, 8, 6, 5);
    }
    return cv;
  };
  /* pedregulho de basalto com musgo */
  C5.rock = function (seed, w, h) {
    var pb = new TC.PixBuf(w, h), r = TC.RNG(seed);
    ell(pb, w / 2, h, w / 2 - 1, h - 1, function (x, y, dx, dy) {
      var l = -dy * 0.6 - dx * 0.4 + (H2(x, y, seed) - 0.5) * 0.4;
      if (dy < -0.55 && H2(x >> 1, y, seed + 2) > 0.4) return u32(l > 0.2 ? '#5a7a44' : '#3a5a32');
      return u32(l > 0.4 ? '#7a7a84' : l > -0.2 ? '#5a5a64' : '#3a3a44');
    });
    outline(pb, u32('#101016'));
    return pb.toCanvas();
  };
  /* a pedra com gravuras (mais velha que qualquer cruz) */
  C5.petroglyph = function () {
    var W = 70, H = 44, pb = new TC.PixBuf(W, H);
    ell(pb, W / 2, H, W / 2 - 1, H - 2, function (x, y, dx, dy) {
      var l = -dy * 0.6 - dx * 0.3 + (H2(x, y, 450) - 0.5) * 0.3;
      return u32(l > 0.35 ? '#8a8478' : l > -0.2 ? '#6e6a60' : '#4a463e');
    });
    var cut = u32('#2e2a24'), lit = u32('#a8a294');
    // círculos concêntricos, pegadas de ave e pontos (sem inventar significado)
    function ring(cx, cy, r) { for (var a = 0; a < TC.TAU; a += 0.12) { pb.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, cut); pb.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8 + 1, lit); } }
    ring(22, 26, 7); ring(22, 26, 4); pb.set(22, 26, cut);
    function track(x, y) { pb.line(x, y, x, y - 5, cut); pb.line(x, y - 5, x - 3, y - 8, cut); pb.line(x, y - 5, x + 3, y - 8, cut); pb.line(x, y - 5, x, y - 9, cut); }
    track(42, 30); track(50, 24); track(46, 37);
    for (var k = 0; k < 7; k++) pb.set(30 + k * 4, 14 + (k % 2) * 2, cut);
    pb.line(10, 36, 16, 32, cut); pb.line(16, 32, 12, 30, cut);
    outline(pb, u32('#14120e'));
    return pb.toCanvas();
  };
  /* a boca da caverna, na parede de arenito do morro */
  C5.caveMouth = function () {
    var W = 260, H = 200, pb = new TC.PixBuf(W, H);
    var cx = 130;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      // contorno do paredão (alto no meio, caindo nas pontas)
      var edge = 30 + Math.pow(Math.abs(x - cx) / cx, 2.2) * 150 + (H2(x >> 2, 1, 460) - 0.5) * 10;
      if (y < edge) continue;
      var col;
      var row = Math.floor(y / 7), n = TC.fbm2(x / 30, y / 12, 461, 3);
      col = n > 0.62 ? '#8a5a3a' : n > 0.45 ? '#6e442a' : n > 0.32 ? '#5a3622' : '#4a2c1a';
      if ((y % 7 === 0 && H2(x >> 3, row, 462) > 0.4) || H2(x, y, 463) > 0.97) col = '#3a2214';
      if (y < edge + 3) col = H2(x, y, 464) > 0.4 ? '#4a6a34' : '#3a5a2a';   // capim na beirada
      pb.d[y * W + x] = u32(col);
    }
    // a boca: um arco escuro
    for (y = 70; y < H; y++) for (x = 0; x < W; x++) {
      var dx = (x - cx) / 62, dy = (y - 200) / 128;
      var d = dx * dx + dy * dy;
      if (d < 1) pb.d[y * W + x] = u32(d > 0.86 ? '#2a1810' : d > 0.7 ? '#140a06' : '#050302');
    }
    // samambaias e raízes penduradas na boca
    for (var k = 0; k < 14; k++) {
      var rx = cx - 56 + k * 8 + (H2(k, 2, 465) * 4 | 0), len = 8 + (H2(k, 3, 466) * 22 | 0);
      for (var t = 0; t < len; t++) pb.set(rx + Math.round(Math.sin(t * 0.3 + k) * 1.5), 74 + t + Math.round(Math.abs(rx - cx) * 0.1), u32(t % 4 === 0 ? '#4a6a34' : '#2a3a1e'));
    }
    var cv = pb.toCanvas();
    cv.mouthX = cx; cv.mouthY = 150;
    return cv;
  };
  /* fogueira de nó-de-pinho (pedras em roda) */
  C5.firePit = function () {
    var cv = TC.canvas(40, 14), c = cv.ctx;
    for (var k = 0; k < 7; k++) { c.fillStyle = TC.col(k % 2 ? '#5a5a64' : '#6e6a74'); TC.fillEllipse(c, 4 + k * 5.3, 10, 3, 3); }
    // nós de pinho: resina escura, avermelhada
    c.fillStyle = TC.col('#5a2a14'); TC.fillPoly(c, [[10, 8], [30, 4], [31, 6], [11, 10]]); TC.fillPoly(c, [[12, 4], [29, 9], [28, 11], [11, 6]]);
    c.fillStyle = TC.col('#8a4a24'); c.fillRect(14, 6, 3, 1); c.fillRect(24, 6, 3, 1);
    return cv;
  };
  /* tesouro de luz: o que a cobra juntou em cinco meses de noite */
  C5.treasure = function (seed) {
    var W = 200, H = 90, cv = TC.canvas(W, H), c = cv.ctx, r = TC.RNG(seed || 5), lights = [];
    // monte de terra e pedra por baixo
    c.fillStyle = TC.col('#2a1810'); TC.fillPoly(c, [[0, H], [30, H - 30], [90, H - 46], [150, H - 40], [W, H - 18], [W, H]]);
    // postes de Teewald deitados
    var post = ART.lampPostOff(110);
    var rot = TC.rotate(post, 1.3);
    c.drawImage(rot, -10, H - 70);
    lights.push({ x: 42, y: H - 40, col: '#ffb050' });
    var post2 = TC.rotate(ART.lampPost(96), -1.1);
    c.drawImage(post2, 110, H - 76);
    lights.push({ x: 150, y: H - 44, col: '#ffb050' });
    // lampiões e velas da igreja
    for (var k = 0; k < 6; k++) {
      var lx = 20 + k * 30 + r.int(-4, 4), ly = H - 26 - r.int(0, 14);
      if (k % 2) {
        c.fillStyle = TC.col('#2a2a30'); c.fillRect(lx - 3, ly - 8, 7, 9);
        c.fillStyle = TC.col('#ffd070'); c.fillRect(lx - 2, ly - 7, 5, 6);
        c.fillStyle = TC.col('#1a1a20'); c.fillRect(lx - 1, ly - 11, 3, 3);
        lights.push({ x: lx, y: ly - 4, col: '#ffc060' });
      } else {
        c.fillStyle = TC.col('#e8e0d0'); c.fillRect(lx, ly - 10, 3, 10);
        c.fillStyle = TC.col('#ffe080'); c.fillRect(lx + 1, ly - 13, 1, 3);
        lights.push({ x: lx + 1, y: ly - 12, col: '#ffd080' });
      }
    }
    // faróis de carro (redondos, cromados)
    [[70, H - 34], [128, H - 30], [176, H - 24]].forEach(function (f) {
      c.fillStyle = TC.col('#8a8a96'); TC.fillCircle(c, f[0], f[1], 5);
      c.fillStyle = TC.col('#fff4c0'); TC.fillCircle(c, f[0], f[1], 3);
      lights.push({ x: f[0], y: f[1], col: '#fff0c0' });
    });
    // a estrela de néon da fábrica Morgenstern
    var sx = 96, sy = 22;
    c.fillStyle = TC.col('#ff4070');
    for (var p = 0; p < 10; p++) {
      var a1 = -Math.PI / 2 + p * Math.PI / 5, a2 = -Math.PI / 2 + (p + 1) * Math.PI / 5;
      var r1 = p % 2 ? 7 : 16, r2 = p % 2 ? 16 : 7;
      TC.thickLine(c, sx + Math.cos(a1) * r1, sy + Math.sin(a1) * r1, sx + Math.cos(a2) * r2, sy + Math.sin(a2) * r2, 2);
    }
    TC.font.draw(c, 'MORGENSTERN', sx, sy + 20, '#ff80a0', { align: 'center' });
    lights.push({ x: sx, y: sy, col: '#ff4070', big: true });
    cv.lights = lights;
    return cv;
  };
  /* o caminhão do Arno (vermelho, carroceria de madeira) visto de lado — grande */
  C5.truck = function () {
    var W = 300, H = 92, cv = TC.canvas(W, H), c = cv.ctx;
    var bedTop = 46;
    // carroceria: grade de madeira lateral (atrás), assoalho e longarina
    for (var x = 4; x < 214; x += 22) { c.fillStyle = TC.col('#5a4028'); c.fillRect(x, bedTop - 34, 4, 34); c.fillStyle = TC.col('#7a5a38'); c.fillRect(x, bedTop - 34, 1, 34); }
    for (var k = 0; k < 3; k++) { c.fillStyle = TC.col(k === 0 ? '#9a7450' : '#7a5a38'); c.fillRect(2, bedTop - 34 + k * 11, 214, 5); c.fillStyle = TC.col('#4a3018'); c.fillRect(2, bedTop - 30 + k * 11, 214, 1); }
    // assoalho de tábuas e a guarda traseira
    for (x = 2; x < 216; x++) { c.fillStyle = TC.col(x % 16 === 15 ? '#4a3018' : (x % 32 < 16 ? '#b88a5a' : '#a87a4c')); c.fillRect(x, bedTop, 1, 4); }
    c.fillStyle = TC.col('#d8b080'); c.fillRect(2, bedTop, 214, 1);
    c.fillStyle = TC.col('#3a2410'); c.fillRect(2, bedTop + 4, 214, 1);
    c.fillStyle = TC.col('#5a5a64'); c.fillRect(2, bedTop + 5, 214, 3);
    c.fillStyle = TC.col('#5a4028'); c.fillRect(0, bedTop - 18, 5, 26); c.fillStyle = TC.col('#7a5a38'); c.fillRect(0, bedTop - 18, 2, 26);
    c.fillStyle = TC.col('#3a2614'); c.fillRect(0, bedTop + 8, 222, 4);
    c.fillStyle = TC.col('#2a2a30'); c.fillRect(0, bedTop + 12, 300, 8);
    c.fillStyle = TC.col('#4a4a54'); c.fillRect(0, bedTop + 12, 300, 1);
    // cabine bicuda vermelha
    var cab = [[214, bedTop + 14], [214, 4], [258, 4], [266, 28], [298, 34], [298, bedTop + 14]];
    c.fillStyle = TC.col('#7a1e18'); TC.fillPoly(c, cab);
    c.fillStyle = TC.col('#a03028'); TC.fillPoly(c, [[217, 7], [256, 7], [263, 28], [217, 28]]);
    c.fillStyle = TC.col('#c84030'); c.fillRect(266, 30, 30, 2); c.fillRect(217, 7, 38, 1);
    // janela lateral (o Ewald aparece aqui, desenhado à parte)
    c.fillStyle = TC.col('#14182a'); TC.fillPoly(c, [[226, 10], [252, 10], [258, 26], [226, 26]]);
    c.fillStyle = TC.col('#4a5a8a'); c.fillRect(228, 11, 4, 2);
    // porta e maçaneta
    c.fillStyle = TC.col('#5a1410'); c.fillRect(222, 8, 1, bedTop - 2); c.fillRect(260, 30, 1, bedTop - 22);
    c.fillStyle = TC.col('#d8d8e0'); c.fillRect(250, 32, 4, 1);
    // capô e grade
    c.fillStyle = TC.col('#c8c8d0'); c.fillRect(294, 34, 4, 22);
    for (var y = 36; y < 56; y += 2) { c.fillStyle = TC.col('#3a3a44'); c.fillRect(295, y, 3, 1); }
    c.fillStyle = TC.col('#fff0b0'); c.fillRect(292, 37, 4, 4);
    c.fillStyle = TC.col('#e8a030'); c.fillRect(292, 44, 3, 2);
    // para-lamas
    c.fillStyle = TC.col('#5a1410'); TC.fillEllipse(c, 272, bedTop + 14, 17, 9);
    c.fillStyle = TC.col('#1a1a20'); c.fillRect(0, bedTop + 20, 300, 2);
    cv.bedTop = bedTop; cv.lampX = 294; cv.lampY = 39; cv.winX = 226; cv.winY = 10;
    cv.wheels = [[40, bedTop + 28], [66, bedTop + 28], [272, bedTop + 28]];
    return cv;
  };
  C5.wheel = function () {
    var R = 13, S = R * 2 + 2, pb = new TC.PixBuf(S, S), c = S / 2;
    ell(pb, c, c, R, R, function (x, y, dx, dy) {
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0.72) return u32((Math.floor(Math.atan2(dy, dx) * 8 / Math.PI) % 2) ? '#141418' : '#22222a');
      if (d > 0.62) return u32('#3a3a44');
      if (d < 0.18) return u32('#8a8a96');
      return u32(Math.abs(dx) < 0.12 || Math.abs(dy) < 0.12 ? '#9a9aa6' : '#5a5a66');
    });
    return pb.toCanvas();
  };
  /* o Arno no volante? Não: o Ewald, de chapéu, pela janela da cabine */
  C5.ewaldDriving = function (f) {
    var cv = TC.canvas(28, 18), c = cv.ctx;
    c.fillStyle = TC.col('#5a4630'); TC.fillEllipse(c, 13, 4, 6, 3); c.fillRect(5, 6, 16, 1);
    c.fillStyle = TC.col('#e8aa76'); c.fillRect(10, 7, 8, 7);
    c.fillStyle = TC.col('#4a2a18'); c.fillRect(15, 11, 4, 1);
    c.fillStyle = TC.col('#1a1010'); c.fillRect(16, 9, 1, 1);
    c.fillStyle = TC.col('#6a4228'); c.fillRect(7, 14, 14, 4);
    // volante
    c.fillStyle = TC.col('#1a1a20'); c.fillRect(19 + f, 11, 2, 7);
    return cv;
  };
  /* gado sem olho parado no escuro (cenário) */
  C5.cowStatic = function (kind) {
    var pal = kind === 1 ? { hide: '#e8e4dc', hideL: '#ffffff', hideD: '#b8b4ac', hideK: '#8a8680', face: '#e8e4dc', leg: '#c8c4bc', legFar: '#8a8680' } :
      kind === 2 ? { hide: '#2a2420', hideL: '#3a3430', hideD: '#1a1614', hideK: '#0e0c0a', face: '#d8ceb8', leg: '#1a1614', legFar: '#0e0c0a' } : null;
    return oxFrame({ head: 'up' }, pal);
  };
  C5.cowLying = function () { return oxFrame({ lie: true, dy: 8 }, { hide: '#e8e4dc', hideL: '#ffffff', hideD: '#b8b4ac', hideK: '#8a8680', face: '#e8e4dc', leg: '#c8c4bc', legFar: '#8a8680' }); };

  /* ====================== RETRATO DO JACOB ====================== */
  function jacobPortrait() {
    var pb = new TC.PixBuf(40, 40);
    for (var y = 0; y < 40; y++) for (var x = 0; x < 40; x++) pb.d[y * 40 + x] = u32(TC.mix('#14201c', '#020404', y / 39));
    ell(pb, 20, 44, 19, 11, function (x, yy) { return u32((x + yy) % 9 === 0 ? '#2a261e' : '#40382c'); });
    thick(pb, 6, 34, 30, 40, 3, solid('#5a4428'));
    ell(pb, 20, 22, 10, 11, function (x, yy, dx, dy) { var l = -dx * 0.6 - dy * 0.3; return u32(l > 0.35 ? '#e8e8d8' : l > -0.25 ? '#c8c8b8' : '#8a8a7c'); });
    // barba comprida
    ell(pb, 20, 30, 10, 9, function (x, yy, dx, dy) { return dy < -0.3 && Math.abs(dx) < 0.5 ? 0 : u32((x * 3 + yy) % 5 === 0 ? '#9a8a74' : '#7a6a58'); });
    pb.rect(15, 26, 11, 2, u32('#5a4a3a'));
    // olhos fundos, sem nada dentro, com um brilho frio
    pb.rect(13, 19, 5, 3, u32('#141c1c')); pb.rect(23, 19, 5, 3, u32('#141c1c'));
    pb.set(15, 20, u32('#b8f0e8')); pb.set(25, 20, u32('#b8f0e8'));
    pb.rect(13, 17, 5, 1, u32('#4a4438')); pb.rect(23, 17, 5, 1, u32('#4a4438'));
    pb.rect(20, 21, 1, 4, u32('#9a9a8a'));
    // chapéu de aba larga
    ell(pb, 20, 10, 10, 6, function (x, yy, dx) { return u32(dx < -0.3 ? '#4a4438' : '#2a2620'); });
    ell(pb, 20, 14, 18, 2.6, function (x, yy, dx, dy) { return u32(dy < 0 ? '#2a2620' : '#141210'); });
    var cv = pb.toCanvas();
    return ghostly(cv, '#9ab8c0', 0.2);
  }

  /* ====================== ITENS ====================== */
  ART.items.pinhao = TC.sprite([
    '...kk..kk...',
    '..kbBk.kBk..',
    '..kbBkkbBk..',
    '.kkbbkkbbkk.',
    'kbBkbbkbkBk.',
    'kbbBkkkkbbk.',
    '.kbbbkkbbk..',
    '..kkkkkkk...'
  ], { k: '#2a1408', b: '#8a4a20', B: '#c88a50' });

  /* ====================== PREPARO ====================== */
  ART.ch5Init = function () {
    if (C5.ready) return C5;
    ART.ch2Init(); ART.ch3Init(); ART.castInit();
    C5.ox = buildOx();
    C5.dog = buildDog();
    C5.erv = buildErvateiro();
    ART.ch2.c5erv = C5.erv;   // o colono possuído desenha a partir de ART.ch2[kind]
    C5.eyeBall = { open: eyeBall(9, 0), half: eyeBall(9, 0.5), shut: eyeBall(9, 1) };
    C5.eyeSmall = { open: eyeBall(5, 0), shut: eyeBall(5, 1) };
    C5.iris = { big: iris(4, '#e8a020'), bigGlow: iris(4, '#ffe060', true), small: iris(2, '#e8a020'), wall: iris(2, '#d0e060') };
    C5.jacob = buildJacob();
    C5.snake = buildSnake();
    C5.gralha = buildGralha();
    C5.T = C5.tiles();
    C5.wheelImg = C5.wheel();
    C5.truckImg = C5.truck();
    var EXTRA = { jacob: { normal: jacobPortrait() } };
    var orig = ART.portrait;
    if (!orig._ch5) {
      ART.portrait = function (who, f) {
        if (EXTRA[who]) return EXTRA[who][f] || EXTRA[who].normal;
        return orig(who, f);
      };
      ART.portrait._ch5 = true;
    }
    C5.ready = true;
    return C5;
  };
})();
