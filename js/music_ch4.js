'use strict';
/* Teewald City — capítulo 4: trilha e efeitos sonoros (a fábrica de calçados, o curtume e a Moça do Serão) */
(function () {
  var S = TC.SONGS;

  /* Fase 4: "Xote da Fábrica" — um xote sombrio em ré menor, com a gaita na frente e o chimbal das máquinas sem parar */
  (function () {
    var CH = {
      Dm: ['D2', 'A1', 'D3+F3+A3'], Gm: ['G1', 'D2', 'G3+Bb3+D4'], A: ['A1', 'E2', 'C#3+E3+A3'],
      Bb: ['Bb1', 'F2', 'D3+F3+Bb3'], C: ['C2', 'G1', 'E3+G3+C4'], F: ['F2', 'C2', 'F3+A3+C4']
    };
    var prog = 'Dm Dm Gm Gm A A Dm Dm Bb Bb C C F F A A Dm Dm Gm Gm Bb A Dm Dm'.split(' ');
    S.stage4 = {
      bpm: 118, spb: 4,
      tracks: [
        { d: true, n: '(k-2 h-1 h-1 s-2 k-1 h-1)*24' },
        { d: true, vel: 0.55, n: '(h~-1 h~-1 h~-1 h~-1 h~-1 h~-1 T~-1 h~-1)*24' },
        { i: 'bass', n: prog.map(function (k) { return CH[k][0] + '-4 ' + CH[k][1] + '-4'; }).join(' ') },
        { i: 'guitar', vel: 0.7, n: prog.map(function (k) { return 'r-2 ' + CH[k][2] + '-2 r-2 ' + CH[k][2] + '-2'; }).join(' ') },
        { i: 'accordion', n:
          'A4-2 D5-2 F5-3 E5-1 D5-2 A4-2 F4-4 G4-2 Bb4-2 D5-3 C5-1 Bb4-2 G4-2 D4-4 ' +
          'E4-2 A4-2 C#5-3 D5-1 E5-2 C#5-2 A4-4 F5-2 E5-1 D5-1 A4-2 F4-2 D5-6 r-2 ' +
          'F5-2 D5-2 Bb4-3 C5-1 D5-2 F5-2 Bb5-4 G5-2 E5-2 C5-3 D5-1 E5-2 G5-2 C6-4 ' +
          'A5-2 G5-1 F5-1 C5-2 A4-2 F5-4 E5-2 F5-2 E5-2 C#5-2 E5-2 A5-2 G5-2 F5-2 E5-2 C#5-2 ' +
          'D5-2 F5-2 A5-3 G5-1 F5-2 D5-2 A4-4 Bb4-2 D5-2 G5-3 F5-1 D5-2 Bb4-2 G4-4 ' +
          'F4-2 Bb4-2 D5-2 F5-2 E5-2 C#5-2 A4-2 E5-2 D5-2 A4-1 F4-1 D4-2 F4-2 D4-6 r-2' },
        { i: 'musicbox', vel: 0.35, n: 'r-64 (D6-8 r-8 A5-8 r-8)*2 r-64' }
      ]
    };
  })();

  /* Chefe: "Valsa do Serão" — caixinha de música e cordas em lá menor, com a máquina de costura marcando o compasso */
  (function () {
    var C = { Am: ['A2', 'A3+C4+E4'], E: ['E2', 'G#3+B3+E4'], Dm: ['D2', 'D3+F3+A3'], F: ['F2', 'F3+A3+C4'], Cc: ['C2', 'E3+G3+C4'] };
    var prog = 'Am Am E E Am Am Dm E F F Cc Cc Dm Dm E E'.split(' ');
    var melody = 'E5-4 A5-4 C6-4 B5-4 A5-4 E5-4 G#5-4 B5-4 E6-4 D6-4 B5-4 G#5-4 A5-6 C6-2 B5-2 A5-2 E5-12 ' +
      'F5-4 A5-4 D6-4 B5-6 G#5-2 E5-4 A5-4 C6-4 F6-4 E6-4 C6-4 A5-4 G5-4 C6-4 E6-4 D6-4 C6-4 G5-4 ' +
      'F5-4 A5-2 D6-2 C6-2 A5-2 F5-12 E5-4 G#5-4 B5-4 E6-8 r-4';
    var tracks = [
      { d: true, n: '(k-4 s~-4 s~-4)*16' },
      { d: true, vel: 0.5, n: '(h~-1)*192' },
      { i: 'bass', n: prog.map(function (k) { return C[k][0] + '-4 r-8'; }).join(' ') },
      { i: 'guitar', vel: 0.6, n: prog.map(function (k) { return 'r-4 ' + C[k][1] + '-4 ' + C[k][1] + '-4'; }).join(' ') },
      { i: 'strings', vel: 0.7, n: prog.map(function (k) { return C[k][1] + '-12'; }).join(' ') },
      { i: 'musicbox', vel: 1.1, n: melody },
      { i: 'choir', vel: 0.7, n: 'A4+E5-24 G#4+B4-24 A4+C5-24 F4+A4-12 G#4+B4-12 F4+C5-24 E4+G4-24 F4+A4-24 G#4+B4-24' }
    ];
    S.boss4 = { bpm: 150, spb: 4, tracks: tracks };
    // segunda metade: o incêndio de 1967 (mais rápido, com metais)
    var t2 = tracks.map(function (t) { var o = {}; for (var k in t) if (k !== '_p') o[k] = t[k]; return o; });
    t2.push({ i: 'brass', vel: 0.55, tr: -12, n: melody });
    t2.push({ d: true, vel: 0.8, n: '(r-8 T-2 t-2)*16' });
    S.boss4b = { bpm: 178, spb: 4, tracks: t2 };
  })();

  /* ---------------- efeitos sonoros ---------------- */
  var A = TC.audio;
  // o apito da fábrica: sobe, segura e cai (vapor)
  A.addSfx('siren', function (t, p, X) {
    var ctx = X.ctx();
    [1, 1.26].forEach(function (k, i) {
      var o = ctx.createOscillator(); o.type = i ? 'square' : 'sawtooth';
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.2;
      var g = ctx.createGain();
      o.frequency.setValueAtTime(220 * k, t);
      o.frequency.linearRampToValueAtTime(560 * k, t + 0.7);
      o.frequency.setValueAtTime(560 * k, t + 2.4);
      o.frequency.linearRampToValueAtTime(300 * k, t + 3.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(i ? 0.03 : 0.07, t + 0.5);
      g.gain.setValueAtTime(i ? 0.03 : 0.07, t + 2.4);
      g.gain.linearRampToValueAtTime(0.0001, t + 3.5);
      o.connect(f); f.connect(g); g.connect(X.out());
      var e = ctx.createGain(); e.gain.value = 0.5; g.connect(e); e.connect(X.echo());
      o.start(t); o.stop(t + 3.6);
    });
    X.noise(t, 3.4, 0.05, 'highpass', 3000, 5000, 0.7, 0.3);
  });
  A.addSfx('clack', function (t, p, X) {
    [0, 0.09].forEach(function (d, i) { X.noise(t + d, 0.04, 0.22, 'bandpass', 2200 - i * 400, 1800, 4); X.osc('square', 900 - i * 120, 600, t + d, 0.03, 0.06); });
  });
  A.addSfx('stitch', function (t, p, X) {
    for (var i = 0; i < 9; i++) { X.osc('square', 1900, 1700, t + i * 0.034, 0.014, 0.035); X.noise(t + i * 0.034, 0.012, 0.05, 'highpass', 4000, 6000); }
  });
  A.addSfx('press', function (t, p, X) {
    X.noise(t, 0.35, 0.55, 'lowpass', 2200, 90, 0.7, 0.3);
    X.osc('square', 180, 45, t, 0.22, 0.3);
    X.osc('sine', 1180, 1120, t + 0.01, 0.7, 0.07, null, 0.6);
    X.osc('sine', 1770, 1700, t + 0.01, 0.5, 0.04, null, 0.6);
  });
  A.addSfx('whistle', function (t, p, X) {
    for (var i = 0; i < 6; i++) X.osc('sine', i % 2 ? 2300 : 2600, i % 2 ? 2300 : 2600, t + i * 0.06, 0.06, 0.08, null, 0.3);
  });
  A.addSfx('unlock', function (t, p, X) {
    X.osc('square', 2600, 1800, t, 0.03, 0.08); X.osc('square', 2200, 1500, t + 0.12, 0.03, 0.08);
    X.noise(t + 0.25, 0.12, 0.2, 'bandpass', 1500, 700, 3); X.osc('square', 500, 300, t + 0.3, 0.08, 0.12);
  });
  A.addSfx('doorslam', function (t, p, X) {
    X.noise(t, 0.5, 0.5, 'lowpass', 900, 80, 0.7, 0.4); X.osc('sine', 110, 40, t, 0.4, 0.5);
    for (var i = 0; i < 3; i++) X.noise(t + 0.1 + i * 0.08, 0.05, 0.12, 'bandpass', 2400, 1600, 5);
  });
  A.addSfx('needle', function (t, p, X) { X.noise(t, 0.12, 0.12, 'highpass', 5000, 8000, 1); X.osc('sine', 3200, 1400, t, 0.12, 0.05); });
  A.addSfx('thread', function (t, p, X) { X.noise(t, 0.25, 0.14, 'bandpass', 1200, 4200, 3, 0.3); });
  A.addSfx('fireburst', function (t, p, X) { X.noise(t, 0.7, 0.4, 'lowpass', 3200, 260, 0.7, 0.35); X.osc('sawtooth', 160, 60, t, 0.5, 0.1); });
  A.addSfx('squish', function (t, p, X) { X.osc('sine', 320, 80, t, 0.18, 0.2); X.noise(t, 0.12, 0.12, 'lowpass', 800, 200); });
  A.addSfx('hideflap', function (t, p, X) { X.noise(t, 0.3, 0.22, 'bandpass', 260, 700, 1.4, 0.2); X.noise(t + 0.15, 0.2, 0.15, 'bandpass', 300, 500, 1.4); });
  A.addSfx('neon', function (t, p, X) { X.osc('square', 120, 120, t, 0.25, 0.03); X.osc('square', 240, 240, t, 0.2, 0.015); });
  A.addSfx('stomp', function (t, p, X) { X.osc('sine', 100, 38, t, 0.3, 0.6); X.noise(t, 0.2, 0.35, 'lowpass', 1200, 120); X.osc('square', 220, 90, t, 0.06, 0.12); });
})();
