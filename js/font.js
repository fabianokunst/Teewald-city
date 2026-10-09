'use strict';
/* Teewald City — fonte bitmap própria (com acentos do português) */
(function () {
  // Cada glifo: linhas 0..8 (0-6 = altura das maiúsculas, 7-8 = descendentes).
  var G = {
    'A': ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
    'B': ['###.', '#..#', '#..#', '###.', '#..#', '#..#', '###.'],
    'C': ['.##.', '#..#', '#...', '#...', '#...', '#..#', '.##.'],
    'D': ['###.', '#..#', '#..#', '#..#', '#..#', '#..#', '###.'],
    'E': ['####', '#...', '#...', '###.', '#...', '#...', '####'],
    'F': ['####', '#...', '#...', '###.', '#...', '#...', '#...'],
    'G': ['.##.', '#..#', '#...', '#.##', '#..#', '#..#', '.###'],
    'H': ['#..#', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
    'I': ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
    'J': ['..##', '...#', '...#', '...#', '#..#', '#..#', '.##.'],
    'K': ['#..#', '#.#.', '##..', '##..', '#.#.', '#..#', '#..#'],
    'L': ['#...', '#...', '#...', '#...', '#...', '#...', '####'],
    'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    'N': ['#..#', '##.#', '##.#', '#.##', '#.##', '#..#', '#..#'],
    'O': ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
    'P': ['###.', '#..#', '#..#', '###.', '#...', '#...', '#...'],
    'Q': ['.##.', '#..#', '#..#', '#..#', '#..#', '#.#.', '.#.#'],
    'R': ['###.', '#..#', '#..#', '###.', '#.#.', '#..#', '#..#'],
    'S': ['.###', '#...', '#...', '.##.', '...#', '...#', '###.'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    'U': ['#..#', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
    'V': ['#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..', '..#..'],
    'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    'X': ['#...#', '.#.#.', '.#.#.', '..#..', '.#.#.', '.#.#.', '#...#'],
    'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    'Z': ['####', '...#', '..#.', '.#..', '#...', '#...', '####'],

    'a': ['', '', '.##.', '...#', '.###', '#..#', '.###'],
    'b': ['#...', '#...', '###.', '#..#', '#..#', '#..#', '###.'],
    'c': ['', '', '.##', '#..', '#..', '#..', '.##'],
    'd': ['...#', '...#', '.###', '#..#', '#..#', '#..#', '.###'],
    'e': ['', '', '.##.', '#..#', '####', '#...', '.##.'],
    'f': ['..#', '.#.', '###', '.#.', '.#.', '.#.', '.#.'],
    'g': ['', '', '.###', '#..#', '#..#', '#..#', '.###', '...#', '.##.'],
    'h': ['#...', '#...', '###.', '#..#', '#..#', '#..#', '#..#'],
    'i': ['#', '', '#', '#', '#', '#', '#'],
    'j': ['.#', '', '##', '.#', '.#', '.#', '.#', '.#', '#.'],
    'k': ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'],
    'l': ['#.', '#.', '#.', '#.', '#.', '#.', '.#'],
    'm': ['', '', '####.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
    'n': ['', '', '###.', '#..#', '#..#', '#..#', '#..#'],
    'o': ['', '', '.##.', '#..#', '#..#', '#..#', '.##.'],
    'p': ['', '', '###.', '#..#', '#..#', '#..#', '###.', '#...', '#...'],
    'q': ['', '', '.###', '#..#', '#..#', '#..#', '.###', '...#', '...#'],
    'r': ['', '', '#.##', '##..', '#...', '#...', '#...'],
    's': ['', '', '.###', '#...', '.##.', '...#', '###.'],
    't': ['.#.', '.#.', '###', '.#.', '.#.', '.#.', '..#'],
    'u': ['', '', '#..#', '#..#', '#..#', '#..#', '.###'],
    'v': ['', '', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
    'w': ['', '', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
    'x': ['', '', '#..#', '#..#', '.##.', '#..#', '#..#'],
    'y': ['', '', '#..#', '#..#', '#..#', '#..#', '.###', '...#', '.##.'],
    'z': ['', '', '####', '..#.', '.#..', '#...', '####'],
    'ı': ['', '', '#', '#', '#', '#', '#'],

    '0': ['.##.', '#..#', '#.##', '##.#', '#..#', '#..#', '.##.'],
    '1': ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
    '2': ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
    '3': ['###.', '...#', '...#', '.##.', '...#', '...#', '###.'],
    '4': ['..#.', '.##.', '#.#.', '#.#.', '####', '..#.', '..#.'],
    '5': ['####', '#...', '###.', '...#', '...#', '#..#', '.##.'],
    '6': ['.##.', '#...', '#...', '###.', '#..#', '#..#', '.##.'],
    '7': ['####', '...#', '..#.', '..#.', '.#..', '.#..', '.#..'],
    '8': ['.##.', '#..#', '#..#', '.##.', '#..#', '#..#', '.##.'],
    '9': ['.##.', '#..#', '#..#', '.###', '...#', '...#', '.##.'],

    '.': ['', '', '', '', '', '', '#'],
    ',': ['', '', '', '', '', '.#', '.#', '#.'],
    '!': ['#', '#', '#', '#', '#', '', '#'],
    '¡': ['#', '', '#', '#', '#', '#', '#'],
    '?': ['.##.', '#..#', '...#', '..#.', '.#..', '', '.#..'],
    '¿': ['..#.', '', '..#.', '.#..', '#...', '#..#', '.##.'],
    ':': ['', '', '#', '', '', '', '#'],
    ';': ['', '', '.#', '', '', '.#', '.#', '#.'],
    '-': ['', '', '', '###', '', '', ''],
    '—': ['', '', '', '#####', '', '', ''],
    '_': ['', '', '', '', '', '', '', '', '####'],
    '\'': ['#', '#', '', '', '', '', ''],
    '"': ['#.#', '#.#', '', '', '', '', ''],
    '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'],
    ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
    '[': ['##', '#.', '#.', '#.', '#.', '#.', '##'],
    ']': ['##', '.#', '.#', '.#', '.#', '.#', '##'],
    '/': ['...#', '...#', '..#.', '.##.', '.#..', '#...', '#...'],
    '+': ['', '.#.', '.#.', '###', '.#.', '.#.', ''],
    '=': ['', '', '###', '', '###', '', ''],
    '*': ['', '#.#', '.#.', '#.#', '', '', ''],
    '%': ['#..#', '#..#', '..#.', '.##.', '.#..', '#..#', '#..#'],
    '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', ''],
    '&': ['.#..', '#.#.', '#.#.', '.#..', '#.##', '#..#', '.##.'],
    '…': ['', '', '', '', '', '', '#.#.#'],
    '·': ['', '', '', '#', '', '', ''],
    '<': ['', '..#', '.#.', '#..', '.#.', '..#', ''],
    '>': ['', '#..', '.#.', '..#', '.#.', '#..', ''],
    '«': ['', '..#.#', '.#.#.', '#.#..', '.#.#.', '..#.#', ''],
    '»': ['', '#.#..', '.#.#.', '..#.#', '.#.#.', '#.#..', ''],
    '▶': ['', '#..', '##.', '###', '##.', '#..', ''],
    '◀': ['', '..#', '.##', '###', '.##', '..#', ''],
    '▼': ['', '', '#####', '.###.', '..#..', '', ''],
    '▲': ['', '', '..#..', '.###.', '#####', '', ''],
    '♥': ['', '.#.#.', '#####', '#####', '.###.', '..#..', ''],
    '★': ['..#..', '..#..', '#####', '.###.', '.#.#.', '#...#', ''],
    '←': ['', '.#...', '#####', '.#...', '', '', ''],
    '→': ['', '...#.', '#####', '...#.', '', '', ''],
    '↑': ['.#.', '###', '.#.', '.#.', '.#.', '', ''],
    '↓': ['.#.', '.#.', '.#.', '###', '.#.', '', ''],
    '©': ['.###.', '#...#', '#.#.#', '#.#.#', '#.#.#', '#...#', '.###.'],
    'º': ['.#.', '#.#', '.#.', '', '###', '', ''],
    'ª': ['##.', '.##', '###', '', '###', '', '']
  };

  var ACC = {
    acute: ['.#', '#.'],
    grave: ['#.', '.#'],
    circ: ['.#.', '#.#'],
    tilde: ['.#.#', '#.#.'],
    diaer: ['#.#']
  };

  var COMPOSE = {
    'á': ['a', 'acute'], 'à': ['a', 'grave'], 'â': ['a', 'circ'], 'ã': ['a', 'tilde'], 'ä': ['a', 'diaer'],
    'é': ['e', 'acute'], 'è': ['e', 'grave'], 'ê': ['e', 'circ'], 'ë': ['e', 'diaer'],
    'í': ['ı', 'acute'], 'ì': ['ı', 'grave'], 'î': ['ı', 'circ'], 'ï': ['ı', 'diaer'],
    'ó': ['o', 'acute'], 'ò': ['o', 'grave'], 'ô': ['o', 'circ'], 'õ': ['o', 'tilde'], 'ö': ['o', 'diaer'],
    'ú': ['u', 'acute'], 'ù': ['u', 'grave'], 'û': ['u', 'circ'], 'ü': ['u', 'diaer'],
    'ñ': ['n', 'tilde'],
    'Á': ['A', 'acute'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ã': ['A', 'tilde'], 'Ä': ['A', 'diaer'],
    'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'diaer'],
    'Í': ['I', 'acute'], 'Ì': ['I', 'grave'], 'Î': ['I', 'circ'],
    'Ó': ['O', 'acute'], 'Ò': ['O', 'grave'], 'Ô': ['O', 'circ'], 'Õ': ['O', 'tilde'], 'Ö': ['O', 'diaer'],
    'Ú': ['U', 'acute'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'diaer'],
    'Ñ': ['N', 'tilde']
  };

  var TOP = 2;      // linhas extras acima (acentos de maiúsculas)
  var CELL_H = 11;  // -2..8
  var glyphs = {};  // char -> {w, px:[[x,y],...]} (y já deslocado por TOP)

  function fromRows(rows) {
    var w = 0, px = [];
    rows.forEach(function (r) { w = Math.max(w, r.length); });
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) if (r.charAt(x) === '#') px.push([x, y + TOP]);
    });
    return { w: w, px: px };
  }

  function build() {
    Object.keys(G).forEach(function (ch) { glyphs[ch] = fromRows(G[ch]); });
    glyphs[' '] = { w: 3, px: [] };
    Object.keys(COMPOSE).forEach(function (ch) {
      var base = glyphs[COMPOSE[ch][0]];
      var acc = ACC[COMPOSE[ch][1]];
      var upper = COMPOSE[ch][0] === COMPOSE[ch][0].toUpperCase() && COMPOSE[ch][0] !== 'ı';
      var aw = acc[0].length;
      var w = Math.max(base.w, aw);
      var ox = Math.floor((w - aw) / 2 + (base.w >= 4 && aw <= 2 ? 0.5 : 0));
      var bx = Math.floor((w - base.w) / 2);
      var px = base.px.map(function (p) { return [p[0] + bx, p[1]]; });
      var ay = upper ? (acc.length === 1 ? -1 : -2) : (acc.length === 1 ? 1 : 0);
      acc.forEach(function (r, y) {
        for (var x = 0; x < r.length; x++) if (r.charAt(x) === '#') px.push([x + ox, y + ay + TOP]);
      });
      glyphs[ch] = { w: w, px: px };
    });
    // cedilha
    var c = glyphs.c, C = glyphs.C;
    glyphs['ç'] = { w: c.w, px: c.px.concat([[1, 7 + TOP], [0, 8 + TOP]]) };
    glyphs['Ç'] = { w: C.w, px: C.px.concat([[2, 7 + TOP], [1, 8 + TOP]]) };
  }
  build();

  /* atlas por cor */
  var order = Object.keys(glyphs);
  var atlasPos = {};
  var atlasW = 0;
  order.forEach(function (ch) { atlasPos[ch] = atlasW; atlasW += glyphs[ch].w + 1; });
  var atlases = {};

  function atlas(color) {
    var a = atlases[color];
    if (a) return a;
    a = TC.canvas(atlasW, CELL_H);
    a.ctx.fillStyle = TC.col(color);
    order.forEach(function (ch) {
      var g = glyphs[ch], ox = atlasPos[ch];
      g.px.forEach(function (p) { a.ctx.fillRect(ox + p[0], p[1], 1, 1); });
    });
    atlases[color] = a;
    return a;
  }

  function glyph(ch) {
    var g = glyphs[ch];
    if (g) return g;
    // fallback: tenta sem acento / maiúscula
    var base = ch.normalize ? ch.normalize('NFD').replace(/[̀-ͯ]/g, '') : ch;
    return glyphs[base] || glyphs[base.toUpperCase()] || glyphs['?'];
  }

  function charKey(ch) {
    if (glyphs[ch]) return ch;
    var base = ch.normalize ? ch.normalize('NFD').replace(/[̀-ͯ]/g, '') : ch;
    if (glyphs[base]) return base;
    if (glyphs[base.toUpperCase()]) return base.toUpperCase();
    return '?';
  }

  function measure(str, spacing) {
    spacing = spacing == null ? 1 : spacing;
    var w = 0, max = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      if (ch === '\n') { max = Math.max(max, w - spacing); w = 0; continue; }
      w += glyph(ch).w + spacing;
    }
    return Math.max(max, w - spacing);
  }

  /* desenha texto. opt: {shadow, align, scale, spacing, outline, max(chars)} */
  function draw(ctx, str, x, y, color, opt) {
    opt = opt || {};
    str = String(str);
    var scale = opt.scale || 1;
    var spacing = opt.spacing == null ? 1 : opt.spacing;
    var lines = str.split('\n');
    var maxChars = opt.max == null ? Infinity : opt.max;
    var count = 0;
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var lw = measure(line, spacing) * scale;
      var lx = x;
      if (opt.align === 'center') lx = x - Math.floor(lw / 2);
      else if (opt.align === 'right') lx = x - lw;
      var ly = y + li * (opt.lineH || 12) * scale;
      if (opt.outline) {
        drawLine(ctx, line, lx - scale, ly, opt.outline, scale, spacing, maxChars - count);
        drawLine(ctx, line, lx + scale, ly, opt.outline, scale, spacing, maxChars - count);
        drawLine(ctx, line, lx, ly - scale, opt.outline, scale, spacing, maxChars - count);
        drawLine(ctx, line, lx, ly + scale, opt.outline, scale, spacing, maxChars - count);
      }
      if (opt.shadow) drawLine(ctx, line, lx + scale, ly + scale, opt.shadow, scale, spacing, maxChars - count);
      drawLine(ctx, line, lx, ly, color, scale, spacing, maxChars - count);
      count += line.length + 1;
      if (count > maxChars) break;
    }
  }

  function drawLine(ctx, line, x, y, color, scale, spacing, maxChars) {
    var a = atlas(color);
    var cx = Math.round(x);
    var oy = Math.round(y) - TOP * scale;
    var n = Math.min(line.length, maxChars);
    for (var i = 0; i < n; i++) {
      var k = charKey(line.charAt(i));
      var g = glyphs[k];
      if (g.px.length) ctx.drawImage(a, atlasPos[k], 0, g.w, CELL_H, cx, oy, g.w * scale, CELL_H * scale);
      cx += (g.w + spacing) * scale;
    }
  }

  /* quebra de linha por palavras */
  function wrap(str, maxW) {
    var out = [];
    String(str).split('\n').forEach(function (para) {
      var words = para.split(' ');
      var line = '';
      words.forEach(function (w) {
        var test = line ? line + ' ' + w : w;
        if (measure(test) > maxW && line) { out.push(line); line = w; }
        else line = test;
      });
      out.push(line);
    });
    return out;
  }

  TC.font = { draw: draw, measure: measure, wrap: wrap, LINE: 12, glyphs: glyphs };
})();
