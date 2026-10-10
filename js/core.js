'use strict';
/* Teewald City — núcleo: namespace, matemática, cores SNES (15-bit), RNG, armazenamento */
var TC = window.TC = window.TC || {};

(function () {
  TC.W = 256;
  TC.H = 224;
  TC.FPS = 60;
  TC.TAU = Math.PI * 2;

  TC.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  TC.lerp = function (a, b, t) { return a + (b - a) * t; };
  TC.approach = function (v, target, step) {
    if (v < target) return Math.min(v + step, target);
    if (v > target) return Math.max(v - step, target);
    return v;
  };
  TC.sec = function (s) { return Math.round(s * 60); };
  TC.dist = function (ax, ay, bx, by) { var dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); };
  TC.overlap = function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  };

  /* ---------- RNG determinístico (mulberry32) ---------- */
  TC.RNG = function (seed) {
    var s = (seed >>> 0) || 1;
    var f = function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = function (a, b) { return a + (b - a) * f(); };
    f.int = function (a, b) { return Math.floor(a + (b - a + 1) * f()); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.chance = function (p) { return f() < p; };
    f.sign = function () { return f() < 0.5 ? -1 : 1; };
    return f;
  };
  TC.rnd = TC.RNG((Date.now() ^ 0x5eed) >>> 0);

  /* ---------- easing ---------- */
  TC.ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    inCubic: function (t) { return t * t * t; },
    outCubic: function (t) { var u = t - 1; return u * u * u + 1; },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    },
    outBounce: function (t) {
      var n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };

  /* ---------- cores: quantização para 15-bit (5 bits por canal), como o SNES ---------- */
  function q5(v) {
    v = Math.round(v < 0 ? 0 : v > 255 ? 255 : v);
    var c = v >> 3;
    return (c << 3) | (c >> 2);
  }
  TC.q5 = q5;

  var hexCache = {};
  TC.parse = function (hex) {
    if (Array.isArray(hex)) return hex;
    var c = hexCache[hex];
    if (c) return c;
    var h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    hexCache[hex] = c;
    return c;
  };

  function toHex(r, g, b) {
    return '#' + ((1 << 24) | (q5(r) << 16) | (q5(g) << 8) | q5(b)).toString(16).slice(1);
  }
  TC.toHex = toHex;

  var colCache = {};
  /* cor CSS quantizada */
  TC.col = function (hex) {
    var c = colCache[hex];
    if (c) return c;
    var p = TC.parse(hex);
    c = toHex(p[0], p[1], p[2]);
    colCache[hex] = c;
    return c;
  };
  TC.rgb = function (r, g, b) { return toHex(r, g, b); };
  TC.rgba = function (hex, a) {
    var p = TC.parse(hex);
    return 'rgba(' + q5(p[0]) + ',' + q5(p[1]) + ',' + q5(p[2]) + ',' + a + ')';
  };
  TC.mix = function (a, b, t) {
    var pa = TC.parse(a), pb = TC.parse(b);
    return toHex(pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t);
  };
  TC.shade = function (hex, f) {
    var p = TC.parse(hex);
    return toHex(p[0] * f, p[1] * f, p[2] * f);
  };
  /* Uint32 (ABGR little-endian) para ImageData */
  TC.u32 = function (hex, a) {
    var p = TC.parse(hex);
    if (a == null) a = 255;
    return ((a & 255) << 24 | q5(p[2]) << 16 | q5(p[1]) << 8 | q5(p[0])) >>> 0;
  };
  TC.u32rgb = function (r, g, b, a) {
    if (a == null) a = 255;
    return ((a & 255) << 24 | q5(b) << 16 | q5(g) << 8 | q5(r)) >>> 0;
  };

  /* ---------- armazenamento local (tolerante a falhas) ---------- */
  TC.store = {
    get: function (k, def) {
      try {
        var v = window.localStorage.getItem('teewald.' + k);
        return v == null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem('teewald.' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ }
    }
  };

  /* ---------- parâmetros de URL (debug) ---------- */
  TC.params = {};
  try {
    var sp = new URLSearchParams(window.location.search);
    sp.forEach(function (v, k) { TC.params[k] = v; });
  } catch (e) { /* ignore */ }

  /* ---------- opções globais ---------- */
  TC.opts = {
    lang: TC.store.get('lang', null),
    crt: TC.store.get('crt', true),
    chroma: TC.store.get('chroma', false),
    aspect: TC.store.get('aspect', 'square'),
    music: TC.store.get('music', 8),
    sfx: TC.store.get('sfx', 9),
    diff: TC.store.get('diff', 'normal')
  };
  TC.saveOpts = function () {
    TC.store.set('lang', TC.opts.lang);
    TC.store.set('crt', TC.opts.crt);
    TC.store.set('chroma', TC.opts.chroma);
    TC.store.set('aspect', TC.opts.aspect);
    TC.store.set('music', TC.opts.music);
    TC.store.set('sfx', TC.opts.sfx);
    TC.store.set('diff', TC.opts.diff);
  };

  /* ---------- dificuldade ----------
     dmg: multiplicador do dano recebido      touch: encostar no inimigo machuca
     attackers: quantos inimigos atacam ao mesmo tempo
     cool / windup: multiplicadores do intervalo entre ataques e do aviso antes do golpe
     speed: velocidade dos ataques    enemyHp / bossHp: resistência    inv: tempo piscando após apanhar
     drop: chance de um inimigo derrotado soltar comida    orbs: orbes por rajada do chefe na 2ª metade
     keepBoss: se o Arno cair, o chefe volta com a energia que tinha (em vez de cheia) */
  TC.DIFFS = ['easy', 'normal', 'hard'];
  TC.DIFF = {
    easy: { dmg: 0.5, touch: false, attackers: 1, cool: 1.8, windup: 1.4, speed: 0.8, enemyHp: 0.7, bossHp: 32, lives: 5, inv: 1.5, drop: 0.25, orbs: 3, keepBoss: true },
    normal: { dmg: 0.75, touch: false, attackers: 2, cool: 1.3, windup: 1.15, speed: 0.9, enemyHp: 0.85, bossHp: 45, lives: 3, inv: 1.2, drop: 0.1, orbs: 5, keepBoss: true },
    hard: { dmg: 1, touch: true, attackers: 99, cool: 1, windup: 1, speed: 1, enemyHp: 1, bossHp: 60, lives: 3, inv: 1, drop: 0, orbs: 5, keepBoss: false }
  };
  if (!TC.DIFF[TC.opts.diff]) TC.opts.diff = 'normal';
  if (TC.params.diff && TC.DIFF[TC.params.diff]) TC.opts.diff = TC.params.diff;
  TC.diff = function () { return TC.DIFF[TC.opts.diff] || TC.DIFF.normal; };

  /* ---------- capítulos ----------
     Os capítulos 1 a 3 sempre existem; do 4 em diante cada capítulo se registra em TC.READY[n]
     (js/scenes/chapterN.js) quando a fase, a arte e as cenas dele estão carregadas. */
  TC.LAST_CHAPTER = 7;
  TC.READY = TC.READY || {};
  TC.chapterReady = function (n) {
    if (n >= 1 && n <= 3) return true;
    return !!(TC.READY[n] && TC['buildLevel' + n] && TC['Ch' + n + 'IntroScene']);
  };
  TC.chapterList = function () {
    var out = [];
    for (var n = 1; n <= TC.LAST_CHAPTER; n++) if (TC.chapterReady(n)) out.push(n);
    return out;
  };
  TC.cycleDiff = function (d) {
    var i = TC.DIFFS.indexOf(TC.opts.diff);
    TC.opts.diff = TC.DIFFS[(i + d + TC.DIFFS.length) % TC.DIFFS.length];
    TC.saveOpts();
  };
})();
