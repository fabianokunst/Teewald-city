'use strict';
/* Teewald City — capítulo 5 ("A Noite Grande"): trilha e efeitos sonoros.
   stage5  "Milonga da Serra"  — a serra à noite: flauta, gaita e tambor grave no compasso da milonga (3+3+2)
   cave5   "Os Olhos"          — a caverna: coro, sinos e um tambor que é quase um coração
   bug5    "A Batida"          — o bugreiro: marcha de caixa e metais em ré menor
   boss5a  "Boiguaçu"          — a cobra grande: tambores pesados e um ostinato grave em mi frígio
   boss5b  "Morro Abaixo"      — a estrada: rápida e heroica; no fim entra a valsa do pai
   praca5  "Fim de Tarde"      — o prólogo na praça: violão e flauta (rancheira lenta) */
(function () {
  var S = TC.SONGS;

  /* ---------- stage5: milonga em lá menor ---------- */
  (function () {
    var CH = {
      Am: ['A2', 'E2', 'A3+C4+E4'], Dm: ['D2', 'A1', 'D3+F3+A3'], E: ['E2', 'B1', 'E3+G#3+B3'],
      F: ['F2', 'C2', 'F3+A3+C4'], G: ['G2', 'D2', 'G3+B3+D4'], C: ['C2', 'G1', 'E3+G3+C4']
    };
    var prog = 'Am Am Dm Dm E E Am Am F F G G Am Dm E E'.split(' ');
    var bass = prog.map(function (k) { var c = CH[k]; return '(' + c[0] + '-3 ' + c[0] + '-3 ' + c[1] + '-2)*2'; }).join(' ');
    var gtr = prog.map(function (k) { var c = CH[k][2]; return 'r-3 ' + c + '-3 ' + c + '-2 r-3 ' + c + '-3 ' + c + '-2'; }).join(' ');
    var flute =
      'E5-6 D5-2 C5-4 B4-4 A4-6 B4-2 C5-4 E5-4 F5-6 E5-2 D5-4 A4-4 D5-8 F5-4 A5-4 ' +
      'G#5-6 F5-2 E5-4 D5-4 B4-8 r-4 E5-4 C5-4 B4-4 A4-4 E5-4 A4-12 r-4 ' +
      'A4-4 C5-4 F5-6 E5-2 D5-4 C5-4 A4-8 B4-4 D5-4 G5-6 F5-2 E5-4 D5-4 B4-8 ' +
      'C5-4 E5-4 A5-6 G5-2 F5-4 E5-4 D5-8 E5-4 G#5-4 B5-4 D6-4 C6-4 B5-4 G#5-8';
    var gaita =
      'C5-16 E5-16 A4-16 D5-16 B4-16 E5-16 E5-16 C5-16 ' +
      'C5-16 A4-16 B4-16 D5-16 E5-16 A4-16 B4-16 G#4-16';
    S.stage5 = {
      bpm: 104, spb: 4,
      tracks: [
        { d: true, vel: 0.8, n: '((T~-3 h~-3 t~-2 k-3 h~-3 s~-2)*3 T-3 t-3 t-2 T-3 t-3 S~-2)*4' },
        { i: 'bass', n: bass },
        { i: 'guitar', vel: 0.6, n: gtr },
        { i: 'flute', vel: 0.95, n: flute },
        { i: 'accordion', vel: 0.55, n: gaita },
        { i: 'pad', vel: 0.6, n: prog.map(function (k) { return CH[k][2] + '-16'; }).join(' ') }
      ]
    };
  })();

  /* ---------- cave5: a caverna dos olhos ---------- */
  S.cave5 = {
    bpm: 66, spb: 4,
    tracks: [
      { i: 'choir', vel: 0.9, n: 'E3+B3-32 F3+C4-32 E3+B3-32 D3+A3-16 F3+B3-16' },
      { i: 'bass', vel: 0.7, n: '(E1-4 r-12 E1-4 r-12)*2 (E1-4 r-12 D1-4 r-4 F1-4 r-4)*2' },
      { i: 'bell', vel: 0.4, n: 'r-16 B5-8 r-24 C6-4 r-12 r-16 B5-8 r-8 F5-8 r-24' },
      { i: 'musicbox', vel: 0.35, n: 'r-8 E6-2 r-22 r-12 F6-2 r-18 r-6 E6-2 r-24 B5-2 r-30' },
      { d: true, vel: 0.65, n: '(T~-3 T~-5 r-24)*4' }
    ]
  };

  /* ---------- bug5: a batida do bugreiro (marcha) ---------- */
  (function () {
    var bass = '(D2-2 r-2 A1-2 r-2 D2-2 r-2 A1-2 D2-2)*2 (Bb1-2 r-2 F2-2 r-2 Bb1-2 r-2 F2-2 Bb1-2)*2 ' +
      '(G1-2 r-2 D2-2 r-2 G1-2 r-2 D2-2 G1-2)*2 (A1-2 r-2 E2-2 r-2 A1-2 r-2 C#2-2 E2-2)*2';
    S.bug5 = {
      bpm: 136, spb: 4,
      tracks: [
        { d: true, n: '((k-2 s-1 s-1 s-2 s-2 k-2 s-1 s-1 S-2 s-2)*3 k-1 s-1 s-1 s-1 S-2 s-1 s-1 T-2 T-2 t-2 c-2)*2' },
        { i: 'bass', n: bass },
        { i: 'brass', vel: 0.9, n: 'D4+F4+A4-6 D4+F4+A4-2 D4+F4+A4-8 r-16 Bb3+D4+F4-6 Bb3+D4+F4-2 Bb3+D4+F4-8 r-16 ' +
          'G3+Bb3+D4-6 G3+Bb3+D4-2 G3+Bb3+D4-8 r-16 A3+C#4+E4-6 A3+C#4+E4-2 A3+C#4+E4-16 r-8' },
        { i: 'lead', vel: 0.85, n: 'A4-4 D5-4 F5-6 E5-2 D5-4 A4-4 D5-8 F5-4 E5-2 D5-2 C5-4 Bb4-4 A4-16 ' +
          'Bb4-4 D5-4 G5-6 F5-2 E5-4 D5-4 C#5-4 E5-4 A5-8 G5-2 F5-2 E5-4 C#5-4 A4-12' },
        { i: 'accordion', vel: 0.45, n: '(D5-2 F5-2 A5-2 F5-2)*4 (D5-2 F5-2 Bb5-2 F5-2)*4 (D5-2 G5-2 Bb5-2 G5-2)*4 (C#5-2 E5-2 A5-2 E5-2)*4' }
      ]
    };
  })();

  /* ---------- boss5a: a Boiguaçu ---------- */
  S.boss5a = {
    bpm: 100, spb: 4,
    tracks: [
      { d: true, n: '((T!-2 r-1 T-1 k-2 T-2 r-2 T-1 T-1 S-2 t-2)*3 T!-1 T-1 T!-1 T-1 S-2 T-2 t-2 t-2 c-4)*2' },
      { i: 'bass', n: '(E1-2 E2-2 E1-2 F2-2 E1-2 E2-2 E1-2 D2-2)*4 (C2-2 C3-2 C2-2 D3-2 C2-2 C3-2 B1-2 B2-2)*2 (E1-2 E2-2 F1-2 F2-2 E1-2 E2-2 G1-2 F1-2)*2' },
      { i: 'choir', vel: 1.1, n: 'E3+B3-32 F3+C4-32 C3+G3-16 B2+F#3-16 E3+B3-16 F3+B3-16' },
      { i: 'brass', vel: 0.8, n: 'r-14 E3+F3-2 r-14 E3+F3-2 r-12 F3+B3-4 r-14 G3+F3-2 ' +
        'r-12 C4+E4-4 r-12 B3+D#4-4 r-8 E4+G4-4 F4+A4-4 E4+G#4-8 r-8' },
      { i: 'lead2', vel: 0.6, n: 'r-64 E5-8 F5-8 G5-8 F5-4 E5-4 D5-8 E5-8 F5-16' },
      { i: 'arp', vel: 0.5, n: '(E4-1 B4-1 F4-1 B4-1)*16 (C4-1 G4-1 E4-1 G4-1)*4 (B3-1 F#4-1 D#4-1 F#4-1)*4 (E4-1 B4-1 F4-1 B4-1)*8' }
    ]
  };

  /* ---------- boss5b: morro abaixo, a Boitatá ao lado do caminhão ---------- */
  (function () {
    var waltz = S.drive.tracks[2].n.split(' ').slice(0, 19).join(' ');   // o começo da valsa do pai (gaita)
    var A = 'D5-4 F#5-4 A5-6 G5-2 F#5-4 E5-4 D5-4 E5-4 F#5-4 A5-4 D6-4 C#6-8 A5-12 ' +
      'B5-4 A5-4 G5-4 F#5-4 E5-4 F#5-4 G5-4 A5-4 B5-6 A5-2 G5-4 E5-4 F#5-16';
    var B = 'B4-4 D5-4 F#5-6 E5-2 D5-4 C#5-4 B4-8 G5-4 F#5-4 E5-4 D5-4 C#5-4 E5-4 A5-8 ' +
      'B5-4 A5-4 F#5-4 D5-4 G5-4 F#5-4 E5-4 C#5-4 D5-8 E5-8 F#5-8 A5-8';
    S.boss5b = {
      bpm: 158, spb: 4,
      tracks: [
        { d: true, n: '((k-2 h-1 h-1 s-2 h-1 k-1 k-2 h-2 s-2 h-2)*7 k-1 k-1 s-1 s-1 S-2 s-1 s-1 T-2 t-2 t-2 c-2)*3' },
        { i: 'bass', n: '(D2-2 D3-2 D2-2 A2-2 D2-2 D3-2 D2-2 A2-2 G1-2 G2-2 G1-2 D2-2 A1-2 A2-2 A1-2 E2-2)*4 ' +
          '(B1-2 B2-2 B1-2 F#2-2 G1-2 G2-2 G1-2 D2-2 E2-2 E3-2 E2-2 B1-2 A1-2 A2-2 A1-2 C#2-2)*4 ' +
          '(D2-2 D3-2 A1-2 A2-2 G1-2 G2-2 A1-2 A2-2)*8' },
        { i: 'brass', vel: 0.85, n: '(D4+F#4+A4-16 G3+B3+D4-8 A3+C#4+E4-8)*4 (B3+D4+F#4-8 G3+B3+D4-8 E3+G3+B3-8 A3+C#4+E4-8)*4 ' +
          '(D4+F#4+A4-8 A3+C#4+E4-8 G3+B3+D4-8 A3+C#4+E4-8)*4' },
        { i: 'lead', n: A + ' ' + B + ' r-128' },
        { i: 'accordion', vel: 0.9, n: 'r-256 ' + waltz + ' r-32' },
        { i: 'flute', vel: 0.6, n: 'r-256 ' + waltz + ' r-32' },
        { i: 'arp', vel: 0.55, n: '(D5-1 A4-1 F#4-1 A4-1)*32 (B4-1 F#4-1 D4-1 F#4-1)*32 (D5-1 A4-1 F#4-1 A4-1)*32' }
      ]
    };
  })();

  /* ---------- praca5: o fim de tarde na praça (rancheira lenta em mi menor/sol) ---------- */
  S.praca5 = {
    bpm: 84, spb: 4,
    tracks: [
      { i: 'bass', vel: 0.7, n: '(E2-4 r-8 B1-4 r-8 C2-4 r-8 G1-4 r-8 A1-4 r-8 E2-4 r-8 B1-4 r-8 B1-4 r-8)*2' },
      { i: 'guitar', vel: 0.6, n: '(r-4 E3+G3+B3-4 E3+G3+B3-4 r-4 D#3+F#3+B3-4 D#3+F#3+B3-4 r-4 E3+G3+C4-4 E3+G3+C4-4 r-4 D3+G3+B3-4 D3+G3+B3-4 ' +
        'r-4 C3+E3+A3-4 C3+E3+A3-4 r-4 E3+G3+B3-4 E3+G3+B3-4 r-4 D#3+F#3+A3-4 D#3+F#3+A3-4 r-4 D#3+F#3+B3-4 D#3+F#3+B3-4)*2' },
      { i: 'flute', vel: 0.8, n: 'B4-4 E5-4 G5-4 F#5-8 E5-4 E5-4 G5-4 B5-4 A5-8 G5-4 C5-4 E5-4 A5-4 G5-4 F#5-4 E5-4 D#5-12 r-12 ' +
        'B4-4 E5-4 G5-4 B5-8 A5-4 G5-4 F#5-4 E5-4 C5-8 E5-4 A4-4 C5-4 E5-4 G5-4 F#5-4 D#5-4 E5-12 r-12' },
      { i: 'pad', vel: 0.5, n: 'E3+G3+B3-24 C3+E3+G3-24 A2+C3+E3-24 B2+D#3+F#3-24 E3+G3+B3-24 C3+E3+G3-24 A2+C3+E3-24 B2+D#3+F#3-24' }
    ]
  };

  /* ======================= EFEITOS ======================= */
  var A = TC.audio;
  // chiado da cobra
  A.addSfx('c5hiss', function (t, p, S) {
    S.noise(t, 0.9, 0.22, 'highpass', 3500, 6500, 0.8, 0.3);
    S.noise(t + 0.05, 0.7, 0.1, 'bandpass', 5000, 3000, 3);
  });
  // os mil olhos abrindo: um brilho que sobe
  A.addSfx('c5glare', function (t, p, S) {
    S.osc('sine', 300, 2400, t, 1.1, 0.12, null, 0.7);
    S.osc('triangle', 450, 3600, t + 0.05, 1.0, 0.06, null, 0.7);
    S.noise(t, 1.2, 0.16, 'highpass', 2000, 9000, 0.7, 0.5);
    for (var i = 0; i < 8; i++) S.osc('sine', 1800 + i * 330, 1800 + i * 330, t + 0.1 + i * 0.08, 0.3, 0.04, null, 0.8);
  });
  // aviso: os olhos tremem antes de abrir
  A.addSfx('c5eyes', function (t, p, S) {
    for (var i = 0; i < 6; i++) S.osc('sine', 900 + i * 140, 700 + i * 120, t + i * 0.06, 0.12, 0.05, null, 0.6);
    S.noise(t, 0.4, 0.08, 'bandpass', 1200, 600, 4);
  });
  // ofuscado: zumbido no ouvido
  A.addSfx('c5daze', function (t, p, S) {
    S.osc('sine', 3200, 2900, t, 1.6, 0.06, null, 0.4);
    S.osc('sine', 3250, 2950, t + 0.02, 1.6, 0.04);
  });
  // mordida / bote
  A.addSfx('c5bite', function (t, p, S) {
    S.noise(t, 0.08, 0.5, 'bandpass', 2500, 900, 2);
    S.osc('square', 180, 50, t, 0.12, 0.25);
    S.osc('sine', 90, 35, t + 0.02, 0.3, 0.5);
  });
  // mugido torto do boi sem olho
  A.addSfx('c5moo', function (t, p, S) {
    var o = S.osc('sawtooth', 130, 82, t, 1.3, 0.12, null, 0.5);
    var c = S.ctx();
    var l = c.createOscillator(); l.frequency.value = 5.5;
    var lg = c.createGain(); lg.gain.value = 9; l.connect(lg); lg.connect(o.frequency);
    l.start(t); l.stop(t + 1.35);
    S.osc('sawtooth', 196, 120, t + 0.03, 1.2, 0.05, null, 0.5);
    S.noise(t, 1.0, 0.06, 'bandpass', 500, 300, 3);
  });
  // latido do cão fantasma
  A.addSfx('c5bark', function (t, p, S) {
    [0, 0.2].forEach(function (d) {
      S.noise(t + d, 0.09, 0.3, 'bandpass', 900, 500, 2.5, 0.6);
      S.osc('sawtooth', 420, 180, t + d, 0.1, 0.12, null, 0.6);
    });
  });
  // espingarda
  A.addSfx('c5rifle', function (t, p, S) {
    S.noise(t, 0.14, 0.8, 'lowpass', 5000, 600, 0.6, 0.6);
    S.osc('sine', 110, 30, t, 0.35, 0.7);
    S.noise(t + 0.1, 1.3, 0.14, 'lowpass', 1200, 150, 0.5, 0.7);
  });
  // clique de engatilhar
  A.addSfx('c5cock', function (t, p, S) {
    S.osc('square', 1500, 900, t, 0.03, 0.08); S.osc('square', 900, 600, t + 0.12, 0.04, 0.09);
  });
  // fogo crepitando
  A.addSfx('c5fire', function (t, p, S) {
    S.noise(t, 0.5, 0.12, 'lowpass', 1400, 300);
    for (var i = 0; i < 7; i++) S.noise(t + Math.random() * 0.5, 0.02, 0.18, 'highpass', 3000, 5000, 1);
  });
  // tocha arremessada
  A.addSfx('c5torch', function (t, p, S) {
    S.noise(t, 0.5, 0.2, 'bandpass', 400, 1600, 0.8, 0.3);
    S.noise(t + 0.1, 0.3, 0.1, 'lowpass', 900, 200);
  });
  // a Boitatá engolindo a luz e inchando
  A.addSfx('c5swell', function (t, p, S) {
    S.osc('sine', 220, 70, t, 0.35, 0.4);
    S.osc('sawtooth', 120, 400, t + 0.25, 1.0, 0.08, null, 0.6);
    S.osc('sine', 600, 1800, t + 0.3, 0.9, 0.06, null, 0.7);
  });
  // pinha caindo no chão
  A.addSfx('c5cone', function (t, p, S) {
    S.osc('triangle', 160, 60, t, 0.18, 0.4);
    S.noise(t, 0.12, 0.3, 'lowpass', 1400, 200);
  });
  // feixe do olho voador
  A.addSfx('c5beam', function (t, p, S) {
    S.osc('sawtooth', 2000, 300, t, 0.6, 0.07, null, 0.6);
    S.osc('sine', 1200, 600, t, 0.5, 0.1, null, 0.6);
    S.noise(t, 0.4, 0.12, 'highpass', 4000, 2000);
  });
  // carga do feixe
  A.addSfx('c5charge', function (t, p, S) { S.osc('sine', 300, 1400, t, 0.7, 0.06, null, 0.5); S.osc('triangle', 310, 1420, t, 0.7, 0.03); });
  // gralha-azul
  A.addSfx('c5gralha', function (t, p, S) {
    [0, 0.16, 0.32].forEach(function (d) {
      var o = S.osc('sawtooth', 1300, 900, t + d, 0.11, 0.06);
      var c = S.ctx(), l = c.createOscillator(); l.frequency.value = 55;
      var lg = c.createGain(); lg.gain.value = 160; l.connect(lg); lg.connect(o.frequency);
      l.start(t + d); l.stop(t + d + 0.13);
    });
  });
  // a pedra do teto rachando
  A.addSfx('c5crack', function (t, p, S) {
    S.noise(t, 1.2, 0.6, 'lowpass', 3000, 100, 0.6, 0.5);
    S.osc('sine', 70, 28, t, 1.4, 0.7);
    for (var i = 0; i < 10; i++) S.noise(t + Math.random() * 1.0, 0.05, 0.2, 'bandpass', 800 + Math.random() * 1600, 400, 2);
  });
  // farol alto: estalo e zumbido
  A.addSfx('c5beams', function (t, p, S) {
    S.osc('square', 2400, 2400, t, 0.02, 0.07); S.osc('square', 1800, 1800, t + 0.05, 0.02, 0.06);
    S.osc('sine', 120, 120, t + 0.06, 0.6, 0.05);
  });
  // vaga-lumes (o final)
  A.addSfx('c5fly', function (t, p, S) {
    for (var i = 0; i < 6; i++) S.osc('sine', 2093 + i * 220, 2093 + i * 220, t + i * 0.11, 0.5, 0.04, null, 0.8);
  });
})();
