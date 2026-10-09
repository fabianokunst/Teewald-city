'use strict';
/* Teewald City — tela inicial: escolha de idioma e "pressione start" (libera o áudio do navegador) */
(function () {
  function BootScene() {
    this.t = 0;
    this.phase = TC.opts.lang ? 'press' : 'lang';
    var self = this;
    this.menu = new TC.Menu([
      { label: 'PORTUGUÊS', act: function () { self.setLang('pt'); } },
      { label: 'ENGLISH', act: function () { self.setLang('en'); } }
    ]);
    this.moon = TC.ART.moon(9);
    this.arau = TC.ART.araucaria(11, 70, { sil: '#05060c' });
    this.arau2 = TC.ART.araucaria(23, 52, { sil: '#05060c' });
    this.sky = TC.ART.sky(TC.W, TC.H, [[0, '#000000'], [0.6, '#06071a'], [1, '#12143a']], 4, 0.003);
  }
  BootScene.prototype.enter = function () {
    TC.fx.bright = 0;
    TC.fx.fadeIn(40);
  };
  BootScene.prototype.setLang = function (l) {
    TC.opts.lang = l;
    TC.saveOpts();
    this.go();
  };
  BootScene.prototype.go = function () {
    TC.audio.init();
    TC.game.fadeTo(function () { return new TC.TitleScene(); }, 40);
  };
  BootScene.prototype.update = function () {
    this.t++;
    if (TC.game.fading()) return;
    if (this.phase === 'lang') this.menu.update();
    else if (this.t > 20 && (TC.input.any() || TC.input.pressed('confirm') || TC.input.pressed('start'))) {
      TC.audio.init();
      TC.audio.sfx('confirm');
      this.go();
    }
  };
  BootScene.prototype.draw = function (c) {
    c.drawImage(this.sky, 0, 0);
    c.drawImage(this.moon, 150 - this.moon.width / 2, 60 - this.moon.height / 2);
    c.drawImage(this.arau, 40, 224 - this.arau.height + 4);
    c.drawImage(this.arau2, 160, 224 - this.arau2.height + 4);
    c.fillStyle = '#05060c';
    c.fillRect(0, 216, TC.W, 8);
    var logo = TC.ui.bigText('TEEWALD CITY', 2, '#f4f0ff', '#5866a8', '#06050c');
    c.drawImage(logo, 128 - Math.floor(logo.width / 2), 92);
    if (this.phase === 'lang') {
      TC.ui.box(c, 64, 120, 128, 58, 'menu', 0.92);
      TC.font.draw(c, 'IDIOMA / LANGUAGE', 128, 128, '#e0d0b0', { align: 'center', shadow: '#000' });
      this.menu.draw(c, 128, 146, { align: 'center' });
    } else if ((this.t >> 5) % 2 === 0 || this.t < 20) {
      TC.font.draw(c, TC.t('boot.press'), 128, 150, '#f0e0c0', { align: 'center', shadow: '#000' });
      TC.font.draw(c, TC.t('boot.hint'), 128, 164, '#8088b0', { align: 'center', shadow: '#000' });
    }
  };
  TC.BootScene = BootScene;
})();
