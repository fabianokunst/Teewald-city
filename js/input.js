'use strict';
/* Teewald City — entrada: teclado, controle (Gamepad API) e toque */
(function () {
  var ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'attack', 'special', 'start', 'confirm', 'back'];

  var KEYMAP = {
    ArrowLeft: ['left'], KeyA: ['left'],
    ArrowRight: ['right'], KeyD: ['right'],
    ArrowUp: ['up'], KeyW: ['up'],
    ArrowDown: ['down'], KeyS: ['down'],
    KeyZ: ['jump', 'confirm'], Space: ['jump', 'confirm'], KeyK: ['jump', 'confirm'],
    KeyX: ['attack', 'back'], KeyJ: ['attack'],
    KeyC: ['special'], KeyL: ['special'],
    Enter: ['start', 'confirm'], NumpadEnter: ['start', 'confirm'],
    Escape: ['start', 'back'], Backspace: ['back'], KeyP: ['start']
  };

  var keys = {};       // estado bruto das teclas
  var hits = {};       // ações acionadas desde o último update (para toques rápidos)
  var touch = {};      // ações ativas via toque
  var cur = {}, prev = {};
  var anyHit = false;
  var listeners = [];

  ACTIONS.forEach(function (a) { cur[a] = prev[a] = false; touch[a] = false; });

  function onKey(e, down) {
    var acts = KEYMAP[e.code];
    if (down) {
      anyHit = true;
      listeners.forEach(function (fn) { fn(e); });
    }
    if (!acts) return;
    e.preventDefault();
    if (down && !e.repeat) acts.forEach(function (a) { hits[a] = true; });
    keys[e.code] = down;
  }
  window.addEventListener('keydown', function (e) { onKey(e, true); });
  window.addEventListener('keyup', function (e) { onKey(e, false); });
  window.addEventListener('blur', function () { keys = {}; });

  function keyDown(action) {
    for (var code in KEYMAP) {
      if (keys[code] && KEYMAP[code].indexOf(action) >= 0) return true;
    }
    return false;
  }

  /* ---------- gamepad ---------- */
  var padState = {};
  function pollPad() {
    ACTIONS.forEach(function (a) { padState[a] = false; });
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i];
      if (!p || !p.connected) continue;
      var b = function (n) { return p.buttons[n] && p.buttons[n].pressed; };
      var ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      if (b(14) || ax < -0.45) padState.left = true;
      if (b(15) || ax > 0.45) padState.right = true;
      if (b(12) || ay < -0.5) padState.up = true;
      if (b(13) || ay > 0.5) padState.down = true;
      if (b(0)) { padState.jump = true; padState.confirm = true; }
      if (b(1)) { padState.attack = true; padState.back = true; }
      if (b(2)) padState.attack = true;
      if (b(3) || b(5) || b(7)) padState.special = true;
      if (b(9)) { padState.start = true; padState.confirm = true; }
      if (b(8)) padState.back = true;
      for (var k = 0; k < p.buttons.length; k++) if (b(k)) anyPadDown = true;
    }
  }
  var anyPadDown = false, anyPadPrev = false;

  /* ---------- toque ---------- */
  var touchEl = null;
  var pointers = {}; // pointerId -> elemento
  function setupTouch() {
    touchEl = document.getElementById('touch');
    if (!touchEl) return;
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) touchEl.classList.add('on');
    window.addEventListener('touchstart', function () { touchEl.classList.add('on'); }, { passive: true, once: true });

    var btns = touchEl.querySelectorAll('.tb');
    function refresh() {
      ACTIONS.forEach(function (a) { touch[a] = false; });
      for (var i = 0; i < btns.length; i++) btns[i].classList.remove('down');
      Object.keys(pointers).forEach(function (id) {
        var el = pointers[id];
        if (!el) return;
        var a = el.getAttribute('data-act');
        touch[a] = true;
        if (a === 'jump') touch.confirm = true;
        if (a === 'start') touch.confirm = true;
        if (a === 'attack') touch.back = false;
        el.classList.add('down');
      });
    }
    function hitEl(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el && el !== document.body) {
        if (el.classList && el.classList.contains('tb')) return el;
        el = el.parentNode;
      }
      return null;
    }
    function down(e) {
      var el = hitEl(e.clientX, e.clientY);
      if (!el) return;
      e.preventDefault();
      anyHit = true;
      pointers[e.pointerId] = el;
      var a = el.getAttribute('data-act');
      hits[a] = true;
      if (a === 'jump' || a === 'start') hits.confirm = true;
      refresh();
    }
    function move(e) {
      if (!(e.pointerId in pointers)) return;
      var el = hitEl(e.clientX, e.clientY);
      if (el !== pointers[e.pointerId]) {
        pointers[e.pointerId] = el;
        if (el) hits[el.getAttribute('data-act')] = true;
        refresh();
      }
    }
    function up(e) {
      if (!(e.pointerId in pointers)) return;
      delete pointers[e.pointerId];
      refresh();
    }
    touchEl.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /* clique/toque na tela do jogo também conta como "start" (útil para iniciar áudio) */
  function setupScreenTap() {
    var sc = document.getElementById('screen');
    if (!sc) return;
    sc.addEventListener('pointerdown', function () {
      anyHit = true;
      hits.confirm = true;
      listeners.forEach(function (fn) { fn({ code: 'Pointer' }); });
    });
  }

  TC.input = {
    init: function () { setupTouch(); setupScreenTap(); },
    update: function () {
      pollPad();
      if (this._sim) this._sim.forEach(function (a) { hits[a] = true; });
      if (this._hold) this._hold.forEach(function (a) { hits[a] = true; });
      ACTIONS.forEach(function (a) {
        prev[a] = cur[a];
        var d = keyDown(a) || padState[a] || touch[a];
        cur[a] = d || !!hits[a];
        // um toque muito rápido ainda gera um "pressed"
        if (hits[a] && prev[a] && !d) prev[a] = false;
      });
      this._any = anyHit || (anyPadDown && !anyPadPrev);
      anyPadPrev = anyPadDown;
      anyPadDown = false;
      anyHit = false;
      this._hits = hits;
      hits = {};
    },
    down: function (a) { return cur[a]; },
    pressed: function (a) { return cur[a] && !prev[a]; },
    released: function (a) { return !cur[a] && prev[a]; },
    any: function () { return !!this._any; },
    onKey: function (fn) { listeners.push(fn); },
    clear: function () { ACTIONS.forEach(function (a) { prev[a] = cur[a] = true; }); }
  };
})();
