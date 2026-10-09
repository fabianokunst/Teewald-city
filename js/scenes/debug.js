'use strict';
/* Teewald City — cena de depuração: visualizador de arte (?scene=debug&page=N) */
(function () {
  function DebugScene() {
    this.page = parseInt(TC.params.page || '0', 10);
    this.t = 0;
  }
  DebugScene.prototype.enter = function () {
    var A = TC.ART;
    this.cache = {};
    if (this.page === 1) {
      this.cache.houses = [1, 2, 3, 4].map(function (s, i) { return A.house({ seed: s * 31, floors: i % 2 ? 2 : 3, lit: 0.3 }); });
      this.cache.church = A.church();
      this.cache.lamp = A.lampPost();
      this.cache.arau = A.araucaria(5, 120);
      this.cache.pine = A.pine(3, 60);
      this.cache.aut = A.autumnTree(4, 70);
      this.cache.sky = A.sky(256, 224, [[0, A.PAL.sky0], [0.55, A.PAL.sky2], [1, A.PAL.skyH]], 3, 0.004);
      this.cache.moon = A.moon(12);
      this.cache.hills = A.hills(256, 60, { seed: 4, color: A.PAL.hillMid, rim: A.PAL.rimMid, trees: 30 });
    }
    if (this.page === 3) {
      this.cache.tiles = A.tiles();
      this.cache.props = [A.bench(), A.fence(64), A.tomb(0), A.tomb(1), A.tomb(2), A.crate(), A.barrel(), A.signPost(), A.poster(), A.coreto()];
      this.cache.fog = A.fog(256, 40, 3);
    }
  };
  DebugScene.prototype.update = function () {
    this.t++;
    if (TC.input.pressed('right')) { this.page = (this.page + 1) % 6; this.enter(); }
    if (TC.input.pressed('left')) { this.page = (this.page + 5) % 6; this.enter(); }
  };
  DebugScene.prototype.draw = function (c) {
    var A = TC.ART, x, y, k;
    c.fillStyle = '#2a2a3a';
    c.fillRect(0, 0, TC.W, TC.H);
    if (this.page === 0) {
      x = 2; y = 2;
      var names = ['idle', 'run', 'jump', 'fall', 'punch1', 'punch2', 'kick', 'airkick', 'spin', 'hurt', 'kneel', 'sit', 'shock', 'lie'];
      names.forEach(function (n) {
        A.arno[n].forEach(function (f) {
          c.drawImage(f, x, y);
          x += 30;
          if (x > 230) { x = 2; y += 46; }
        });
      });
      x = 2; y = 140;
      ['walk', 'windup', 'swipe', 'hurt', 'lie'].forEach(function (n) {
        A.shade[n].forEach(function (f) { c.drawImage(f, x, y); x += 26; });
      });
      A.ghost.forEach(function (g, i) { c.drawImage(g, 2 + i * 24, 196); });
      c.drawImage(A.flames[(this.t >> 3) % 4], 100, 198);
      c.drawImage(A.flameHead.open, 120, 198);
      c.drawImage(A.crow.perch, 142, 200);
      c.drawImage(A.crow.fly[0], 160, 200);
      c.drawImage(A.crow.fly[1], 178, 200);
    } else if (this.page === 1) {
      c.drawImage(this.cache.sky, 0, 0);
      c.drawImage(this.cache.moon, 180, 0);
      c.drawImage(this.cache.hills, 0, 100);
      c.drawImage(this.cache.houses[0], 0, 224 - this.cache.houses[0].height);
      c.drawImage(this.cache.houses[1], 96, 224 - this.cache.houses[1].height);
      c.drawImage(this.cache.church, 150, 224 - this.cache.church.height);
      c.drawImage(this.cache.lamp, 120, 224 - this.cache.lamp.height);
      c.drawImage(this.cache.arau, -20, 40);
    } else if (this.page === 2) {
      TC.font.draw(c, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789', 4, 4, '#ffffff');
      TC.font.draw(c, 'abcdefghijklmnopqrstuvwxyz .,!?:;-()', 4, 18, '#ffffff');
      TC.font.draw(c, 'áàâãéêíóôõúüç ÁÀÂÃÉÊÍÓÔÕÚÇ ▶▼♥★«»', 4, 34, '#ffe090');
      TC.font.draw(c, 'Não enxergo um palmo na frente. Ação!', 4, 50, '#c0c8ff', { shadow: '#000' });
      c.drawImage(TC.ui.bigText('TEEWALD', 3, '#f0f0ff', '#5060a0', '#000000'), 10, 70);
      var d = new TC.Dialog();
      d.open([{ who: 'arno', key: 'intro.d4' }]);
      d.openAnim = 1; d.chars = 999;
      d.draw(c);
      c.drawImage(A.portrait('arno', 'shock'), 120, 100);
      c.drawImage(A.portrait('frida'), 162, 100);
      c.drawImage(A.portrait('voice'), 204, 100);
    } else if (this.page === 3) {
      var T = this.cache.tiles;
      x = 2;
      [T.walkTop[0], T.walkTop[1], T.cobble[0], T.cobble[1], T.hexTop[0], T.hexTop[1], T.grassTop[0], T.dirt[0], T.plank, T.stone, T.stoneTop, T.water[0]].forEach(function (t) { c.drawImage(t, x, 2); x += 18; });
      x = 2; y = 24;
      this.cache.props.forEach(function (p) {
        if (x + p.width > 256) { x = 2; y += 40; }
        c.drawImage(p, x, y); x += p.width + 4;
      });
      c.drawImage(this.cache.fog, 0, 180);
      k = 0;
      Object.keys(A.items).forEach(function (n) { c.drawImage(A.items[n], 120 + k * 20, 200); k++; });
      A.spark.forEach(function (s, i) { c.drawImage(s, 2 + i * 10, 210); });
    } else if (this.page === 4) {
      x = 0; y = 0;
      ['hover', 'swoop', 'cast', 'hurt', 'dead'].forEach(function (n) {
        A.boss[n].forEach(function (f) {
          c.drawImage(f, x, y);
          x += 60;
          if (x > 200) { x = 0; y += 110; }
        });
      });
    }
    TC.font.draw(c, 'PAGE ' + this.page, 220, 214, '#ffffff', { shadow: '#000' });
  };
  TC.DebugScene = DebugScene;
})();
