'use strict';
/* Teewald City — interface: janelas no estilo SNES, caixa de diálogo com retrato, menus */
(function () {
  var ui = TC.ui = {};
  var boxCache = {};

  var STYLES = {
    dialog: { top: '#1c2350', bot: '#070818', b1: '#000000', b2: '#c8cce4', b3: '#5a6296' },
    dark: { top: '#141018', bot: '#050408', b1: '#000000', b2: '#a89c8c', b3: '#4a4038' },
    radio: { top: '#0c2016', bot: '#030806', b1: '#000000', b2: '#7ce0a0', b3: '#2a6040' },
    menu: { top: '#20183a', bot: '#08060f', b1: '#000000', b2: '#e0d0b0', b3: '#6a5a48' }
  };
  ui.STYLES = STYLES;

  ui.boxCanvas = function (w, h, style) {
    style = style || 'dialog';
    var key = w + 'x' + h + style;
    if (boxCache[key]) return boxCache[key];
    var s = STYLES[style];
    var cv = TC.canvas(w, h), c = cv.ctx;
    for (var y = 0; y < h; y++) {
      c.fillStyle = TC.mix(s.top, s.bot, y / (h - 1));
      c.fillRect(0, y, w, 1);
    }
    // bordas com cantos arredondados
    c.fillStyle = TC.col(s.b1);
    c.fillRect(0, 1, 1, h - 2); c.fillRect(w - 1, 1, 1, h - 2);
    c.fillRect(1, 0, w - 2, 1); c.fillRect(1, h - 1, w - 2, 1);
    c.fillStyle = TC.col(s.b2);
    c.fillRect(1, 2, 1, h - 4); c.fillRect(w - 2, 2, 1, h - 4);
    c.fillRect(2, 1, w - 4, 1); c.fillRect(2, h - 2, w - 4, 1);
    c.fillStyle = TC.col(s.b3);
    c.fillRect(2, 3, 1, h - 6); c.fillRect(w - 3, 3, 1, h - 6);
    c.fillRect(3, 2, w - 6, 1); c.fillRect(3, h - 3, w - 6, 1);
    c.fillRect(2, 2, 1, 1); c.fillRect(w - 3, 2, 1, 1); c.fillRect(2, h - 3, 1, 1); c.fillRect(w - 3, h - 3, 1, 1);
    c.clearRect(0, 0, 1, 1); c.clearRect(w - 1, 0, 1, 1); c.clearRect(0, h - 1, 1, 1); c.clearRect(w - 1, h - 1, 1, 1);
    boxCache[key] = cv;
    return cv;
  };
  ui.box = function (ctx, x, y, w, h, style, alpha) {
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.drawImage(ui.boxCanvas(w, h, style), Math.round(x), Math.round(y));
    ctx.globalAlpha = 1;
  };

  /* ---------- caixa de diálogo ---------- */
  var VOICE = { arno: 520, radio: 900, voice: 300, frida: 420 };
  var NAMECOL = { arno: '#f0c060', radio: '#7ce0a0', voice: '#c0b0ff', frida: '#e0a0c0' };

  function Dialog() {
    this.active = false;
    this.entries = [];
    this.idx = 0;
    this.pages = [];
    this.page = 0;
    this.chars = 0;
    this.t = 0;
    this.pos = 'bottom';
    this.openAnim = 0;
  }
  Dialog.prototype.open = function (entries, opts) {
    opts = opts || {};
    this.entries = entries;
    this.idx = 0;
    this.pos = opts.pos || 'bottom';
    this.active = true;
    this.openAnim = 0;
    this.onLine = opts.onLine || null;
    this._prepare();
  };
  Dialog.prototype._prepare = function () {
    var e = this.entries[this.idx];
    var text = e.text != null ? e.text : TC.t(e.key);
    var hasPortrait = !!(e.who && TC.ART && TC.ART.portrait(e.who, e.face));
    this.textX = hasPortrait ? 56 : 12;
    var maxW = 240 - this.textX - 10;
    var lines = TC.font.wrap(text, maxW);
    this.pages = [];
    for (var i = 0; i < lines.length; i += 3) this.pages.push(lines.slice(i, i + 3).join('\n'));
    this.page = 0;
    this.chars = 0;
    this.t = 0;
    if (this.onLine) this.onLine(this.idx, e);
  };
  Dialog.prototype.current = function () { return this.entries[this.idx]; };
  Dialog.prototype.update = function () {
    if (!this.active) return;
    this.t++;
    if (this.openAnim < 1) { this.openAnim = Math.min(1, this.openAnim + 0.2); return; }
    var e = this.entries[this.idx];
    var txt = this.pages[this.page];
    var full = this.chars >= txt.length;
    var adv = TC.input.pressed('confirm') || TC.input.pressed('attack');
    if (!full) {
      var spd = e.speed || 0.7;
      var prev = Math.floor(this.chars);
      this.chars = Math.min(txt.length, this.chars + spd);
      var now = Math.floor(this.chars);
      if (now !== prev && now % 2 === 0) {
        var ch = txt.charAt(now - 1);
        if (ch && ch !== ' ' && ch !== '\n') TC.audio.sfx('blip', (VOICE[e.who] || 600) + (e.who === 'radio' ? Math.random() * 300 : 0));
      }
      if (adv && this.t > 6) this.chars = txt.length;
    } else if (adv || (e.auto && this.t > e.auto) || (TC.params.auto && this.t > 150)) {
      TC.audio.sfx('select');
      if (this.page < this.pages.length - 1) { this.page++; this.chars = 0; this.t = 0; }
      else if (this.idx < this.entries.length - 1) { this.idx++; this._prepare(); }
      else { this.active = false; }
    }
  };
  Dialog.prototype.draw = function (ctx) {
    if (!this.active) return;
    var e = this.entries[this.idx];
    var w = 240, h = 56;
    var lb = Math.round(TC.fx.letterbox || 0);
    var x = 8, y = this.pos === 'top' ? 6 + lb : TC.H - h - 6 - lb;
    var style = e.who === 'radio' ? 'radio' : 'dialog';
    if (this.openAnim < 1) {
      var hh = Math.max(4, Math.round(h * this.openAnim));
      ui.box(ctx, x, y + (h - hh) / 2, w, hh, style, 0.94);
      return;
    }
    ui.box(ctx, x, y, w, h, style, 0.94);
    var p = TC.ART && TC.ART.portrait(e.who, e.face);
    if (p) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 7, y + 7, p.width + 2, p.height + 2);
      ctx.drawImage(p, x + 8, y + 8);
      ctx.fillStyle = TC.col('#8088b0');
      ctx.fillRect(x + 7, y + 7 + p.height + 2, p.width + 2, 1);
    }
    var tx = x + this.textX;
    var name = e.who ? TC.t('name.' + e.who) : '';
    var ty = y + 7;
    if (name) {
      TC.font.draw(ctx, name, tx, ty, NAMECOL[e.who] || '#f0c060', { shadow: '#000000' });
      ty += 12;
    } else ty += 4;
    var txt = this.pages[this.page];
    var col = e.who === 'radio' ? '#a0f0c0' : '#f0f0f8';
    var jx = 0;
    if (e.who === 'radio' && Math.random() < 0.15) jx = Math.random() < 0.5 ? -1 : 1;
    TC.font.draw(ctx, txt, tx + jx, ty, col, { shadow: '#000000', max: Math.floor(this.chars) });
    if (this.chars >= txt.length && (this.t >> 4) % 2 === 0) {
      TC.font.draw(ctx, '▼', x + w - 14, y + h - 12, '#f0c060');
    }
  };
  TC.Dialog = Dialog;

  /* gerador para usar em roteiros: abre e espera fechar */
  ui.say = function* (dlg, entries, opts) {
    dlg.open(entries, opts);
    while (dlg.active) yield;
  };

  /* ---------- menu vertical ---------- */
  function Menu(items, opts) {
    this.items = items;       // [{label: fn|string, act: fn, disabled}]
    this.sel = 0;
    this.opts = opts || {};
    this.t = 0;
    while (this.items[this.sel] && this.items[this.sel].disabled) this.sel++;
  }
  Menu.prototype.update = function () {
    this.t++;
    var n = this.items.length, d = 0;
    if (TC.input.pressed('down')) d = 1;
    if (TC.input.pressed('up')) d = -1;
    if (d) {
      var s = this.sel;
      for (var i = 0; i < n; i++) {
        s = (s + d + n) % n;
        if (!this.items[s].disabled) break;
      }
      if (s !== this.sel) { this.sel = s; TC.audio.sfx('select'); }
    }
    var it = this.items[this.sel];
    if (it.left && TC.input.pressed('left')) { it.left(); TC.audio.sfx('select'); }
    if (it.right && TC.input.pressed('right')) { it.right(); TC.audio.sfx('select'); }
    if (TC.input.pressed('confirm') || (this.opts.startConfirms && TC.input.pressed('start'))) {
      if (it.act) { TC.audio.sfx('confirm'); it.act(); }
      else if (it.right) { it.right(); TC.audio.sfx('select'); }
    }
    if (TC.input.pressed('back') && this.opts.back) { TC.audio.sfx('cancel'); this.opts.back(); }
  };
  Menu.prototype.draw = function (ctx, x, y, opt) {
    opt = opt || {};
    var lh = opt.lineH || 14;
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      var label = typeof it.label === 'function' ? it.label() : it.label;
      var sel = i === this.sel;
      var col = it.disabled ? '#585870' : sel ? (opt.selCol || '#ffe090') : (opt.col || '#c8c8e0');
      var lx = x;
      if (opt.align === 'center') lx = x - Math.floor(TC.font.measure(label) / 2);
      TC.font.draw(ctx, label, lx, y + i * lh, col, { shadow: '#000000' });
      if (it.value) {
        var v = it.value();
        TC.font.draw(ctx, (sel && it.right ? '◀ ' : '') + v + (sel && it.right ? ' ▶' : ''), x + (opt.valueX || 120), y + i * lh, sel ? '#ffffff' : '#9098c0', { shadow: '#000000', align: 'right' });
      }
      if (sel) {
        var bob = (this.t >> 3) % 2;
        TC.font.draw(ctx, '▶', lx - 10 - bob, y + i * lh, '#ffb050', { shadow: '#000000' });
      }
    }
  };
  TC.Menu = Menu;

  /* texto grande com contorno e degradê vertical (títulos) */
  var bigCache = {};
  ui.bigText = function (str, scale, c1, c2, outline) {
    var key = str + scale + c1 + c2 + outline;
    if (bigCache[key]) return bigCache[key];
    var w = TC.font.measure(str) * scale + 4, h = 13 * scale + 4;
    var cv = TC.canvas(w, h);
    var mask = TC.canvas(w, h);
    TC.font.draw(mask.ctx, str, 2, 2 + 2 * scale, '#ffffff', { scale: scale });
    var pb = TC.bufFrom(mask);
    var out = new TC.PixBuf(w, h);
    var oc = TC.u32(outline || '#000000');
    var y, x;
    for (y = 0; y < h; y++) {
      var col = TC.u32(TC.mix(c1, c2, TC.clamp((y - 2 * scale) / (9 * scale), 0, 1)));
      for (x = 0; x < w; x++) {
        if ((pb.d[y * w + x] >>> 24) > 0) out.d[y * w + x] = col;
      }
    }
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        var i = y * w + x;
        if ((pb.d[i] >>> 24) > 0) continue;
        var n = false;
        for (var dy = -1; dy <= 1 && !n; dy++) for (var dx = -1; dx <= 1; dx++) {
          var xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h && (pb.d[yy * w + xx] >>> 24) > 0) { n = true; break; }
        }
        if (n) out.d[i] = oc;
      }
    }
    cv = out.toCanvas();
    bigCache[key] = cv;
    return cv;
  };
})();
