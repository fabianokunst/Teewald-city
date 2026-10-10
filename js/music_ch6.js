'use strict';
/* Teewald City — trilha e efeitos do capítulo 6 ("A Noite do Pelznickel"):
   "Xote da Cerração" (fase), a marcha do Pelznickel com sinos de trenó e correntes (chefe), a mesma marcha
   acelerada com o "Hänschen klein" torto na flauta (o mestre-escola), a reza da escola, o Erlkönig na cabine
   e o xote em maior para as crianças salvas. */
(function () {
  var S = TC.SONGS;

  /* ---------- Fase 6: "Xote da Cerração" (ré menor, gaita na frente, caixinha no contratempo) ---------- */
  (function () {
    var CH = {
      Dm: ['D2', 'A1', 'D3+F3+A3'], Gm: ['G1', 'D2', 'G3+Bb3+D4'], A: ['A1', 'E2', 'C#3+E3+A3'],
      F: ['F2', 'C2', 'F3+A3+C4'], C: ['C2', 'G1', 'E3+G3+C4'], Bb: ['Bb1', 'F2', 'D3+F3+Bb3']
    };
    var prog = ('Dm Dm Gm Gm A A Dm Dm Dm Dm Gm Gm A A Dm Dm ' +
      'F F C C Gm Gm Dm Dm Bb Bb F F Gm A Dm Dm').split(' ');
    var bass = prog.map(function (k) { var c = CH[k]; return c[0] + '-3 ' + c[0] + '-1 ' + c[1] + '-2 ' + c[0] + '-2'; }).join(' ');
    var gtr = prog.map(function (k) { var c = CH[k][2]; return 'r-2 ' + c + '-1 ' + c + '-1 r-2 ' + c + '-2'; }).join(' ');
    var mel =
      'A4-3 A4-1 D5-2 E5-2 F5-3 E5-1 D5-2 A4-2 Bb4-3 A4-1 G4-2 Bb4-2 D5-6 r-2 ' +
      'C#5-3 D5-1 E5-2 G5-2 F5-3 E5-1 C#5-2 A4-2 D5-3 E5-1 F5-2 E5-2 D5-6 r-2 ' +
      'A5-3 G5-1 F5-2 E5-2 F5-3 G5-1 A5-2 F5-2 G5-3 F5-1 E5-2 D5-2 Bb4-6 r-2 ' +
      'A4-3 C#5-1 E5-2 A5-2 G5-3 F5-1 E5-2 C#5-2 D5-3 F5-1 E5-2 C#5-2 D5-6 r-2 ' +
      'C5-3 F5-1 A5-2 C6-2 A5-3 G5-1 F5-2 C5-2 E5-3 G5-1 C6-2 Bb5-2 G5-6 r-2 ' +
      'Bb5-3 A5-1 G5-2 D5-2 G5-3 A5-1 Bb5-2 G5-2 A5-3 G5-1 F5-2 D5-2 F5-6 r-2 ' +
      'F5-3 D5-1 Bb4-2 D5-2 F5-3 G5-1 F5-2 D5-2 C5-3 F5-1 A5-2 F5-2 C6-6 r-2 ' +
      'Bb5-3 A5-1 G5-2 Bb5-2 A5-3 G5-1 E5-2 C#5-2 D5-3 E5-1 F5-2 A4-2 D5-6 r-2';
    S.stage6 = {
      bpm: 112, spb: 4,
      tracks: [
        { d: true, n: '((k-2 h~-1 s~-1 k-1 k~-1 s-2)*3 k-2 s~-1 s~-1 s-1 s-1 S-2)*8' },
        { i: 'bass', n: bass },
        { i: 'guitar', vel: 0.7, n: gtr },
        { i: 'accordion', n: mel },
        { i: 'pad', vel: 0.55, n: '(D2+A2-64)*4' },
        { i: 'bell', vel: 0.25, n: '(r-56 A5-8 r-56 F5-8)*4' }
      ]
    };
    /* o mesmo xote em ré maior, devagarinho, para as crianças salvas */
    var CH2 = { D: ['D2', 'A1'], G: ['G1', 'D2'], A: ['A1', 'E2'], Bm: ['B1', 'F#2'] };
    var prog2 = 'D D G G A A D D Bm Bm G G A A D D'.split(' ');
    var mel2 = 'F#4-3 A4-1 D5-2 E5-2 F#5-3 E5-1 D5-2 A4-2 B4-3 A4-1 G4-2 B4-2 D5-6 r-2 ' +
      'C#5-3 D5-1 E5-2 G5-2 F#5-3 E5-1 C#5-2 A4-2 D5-3 E5-1 F#5-2 E5-2 D5-6 r-2 ' +
      'B4-3 C#5-1 D5-2 F#5-2 E5-3 D5-1 B4-2 F#4-2 G4-3 A4-1 B4-2 D5-2 B4-6 r-2 ' +
      'A4-3 C#5-1 E5-2 A5-2 G5-3 F#5-1 E5-2 C#5-2 D5-3 F#5-1 E5-2 C#5-2 D5-8';
    S.c6home = {
      bpm: 84, spb: 4,
      tracks: [
        { i: 'bass', vel: 0.7, n: prog2.map(function (k) { var c = CH2[k]; return c[0] + '-3 ' + c[0] + '-1 ' + c[1] + '-2 ' + c[0] + '-2'; }).join(' ') },
        { i: 'accordion', vel: 0.7, n: mel2 },
        { i: 'musicbox', vel: 0.45, tr: 12, n: mel2 },
        { i: 'strings', vel: 0.5, n: 'D3+F#3+A3-32 G3+B3+D4-16 A3+C#4+E4-16 B2+D3+F#3-16 G3+B3+D4-16 A3+C#4+E4-16 D3+F#3+A3-16' }
      ]
    };
  })();

  /* ---------- Chefe: a marcha do Pelznickel (mi frígio, sinos de trenó e correntes) ---------- */
  (function () {
    var drums = '((k!-2 h-1 h~-1 S-2 h-1 h~-1 k-2 k-1 h~-1 S-2 h-1 h~-1)*3 k!-2 h-1 h~-1 S-2 h-1 h~-1 T-2 T-2 t-2 c-2)*4';
    var bass = '(E2-2 E2-2 B1-2 E2-2 F2-2 F2-2 C2-2 F2-2 E2-2 E2-2 B1-2 E2-2 D2-2 D2-2 A1-2 D2-2)*2 ' +
      '(C2-2 C2-2 G1-2 C2-2 F2-2 F2-2 C2-2 F2-2 B1-2 B1-2 F#2-2 B1-2 E2-2 E2-2 B1-2 E2-2)*2';
    var brass = 'E4-4 E4-2 F4-2 G4-4 E4-4 F4-4 A4-2 G4-2 F4-8 E4-4 G4-2 B4-2 C5-4 B4-4 A4-4 G4-2 F4-2 E4-8 ' +
      'E4-4 E4-2 F4-2 G4-4 B4-4 C5-4 B4-2 A4-2 G4-8 F4-4 E4-2 F4-2 G4-4 F4-4 E4-12 r-4 ' +
      'C5-4 C5-2 B4-2 A4-4 G4-4 A4-4 C5-2 B4-2 A4-8 B4-4 A4-2 G4-2 F#4-4 G4-4 E4-12 r-4 ' +
      'G4-4 G4-2 A4-2 B4-4 C5-4 C5-4 B4-2 A4-2 F4-8 D#4-4 E4-2 F#4-2 G4-4 F#4-4 E4-16';
    var tracks = [
      { d: true, n: drums },
      { i: 'bass', n: bass },
      { i: 'brass', n: brass },
      { i: 'choir', vel: 0.8, n: 'E3+B3-32 F3+C4-32 E3+B3-32 D3+A3-32 C3+G3-32 F3+C4-32 B2+F#3-32 E3+B3-32' },
      { i: 'bell', vel: 0.35, n: '(B5-2 r-6 B5-2 r-6 C6-2 r-6 B5-2 r-6)*8' }
    ];
    S.boss6 = { bpm: 118, spb: 4, tracks: tracks };
    /* o mestre-escola: a marcha acelerada e uma cantiga de criança desafinada na flauta ("Hänschen klein") */
    var t2 = tracks.map(function (t) { var o = {}; for (var k in t) if (k !== '_p') o[k] = t[k]; return o; });
    t2.push({ i: 'flute', vel: 0.7, tr: -0.3, n: 'B4-4 G4-4 G4-8 A4-4 F4-4 F4-8 E4-4 F4-4 G4-4 A4-4 B4-4 B4-4 B4-8 ' +
      'B4-4 G4-4 G4-8 A4-4 F4-4 F4-8 E4-4 G4-4 B4-4 B4-4 E4-16 ' +
      'F4-4 F4-4 F4-4 F4-4 F4-4 G4-4 A4-8 G4-4 G4-4 G4-4 G4-4 G4-4 A4-4 B4-8 ' +
      'B4-4 G4-4 G4-8 A4-4 F4-4 F4-8 E4-4 G4-4 B4-4 B4-4 E4-16' });
    t2.push({ i: 'organ', vel: 0.6, n: 'E3+G3+B3-64 F3+A3+C4-64 C3+E3+G3-32 B2+D#3+F#3-32 E3+G3+B3-64' });
    S.boss6b = { bpm: 146, spb: 4, tracks: t2 };
  })();

  /* ---------- Dentro da escola: o "Vater unser" baixinho, coro e caixinha de música ---------- */
  S.c6school = {
    bpm: 58, spb: 4,
    tracks: [
      { i: 'choir', vel: 0.9, n: 'D3+A3-32 C3+G3-32 Bb2+F3-32 A2+E3-32' },
      { i: 'musicbox', vel: 0.6, n: 'D5-8 D5-4 E5-4 F5-8 E5-4 D5-4 C5-8 D5-8 r-16 A4-8 C5-4 D5-4 E5-8 D5-4 C5-4 A4-16 r-16' },
      { i: 'bass', vel: 0.4, n: 'D2-32 C2-32 Bb1-32 A1-32' }
    ]
  };

  /* ---------- A cabine: o Erlkönig (sol menor, o galope em tercinas) ---------- */
  S.c6erl = {
    bpm: 132, spb: 3, vol: 0.7,
    tracks: [
      { i: 'pluck', vel: 0.45, n: '(G4+Bb4-1)*24 (G4+Bb4-1)*24 (G4+C5-1)*12 (F#4+A4-1)*12 (G4+Bb4-1)*24' },
      { i: 'bass', vel: 0.8, n: 'G2-1 A2-1 Bb2-1 C3-1 D3-1 Eb3-1 D3-6 r-12 G2-1 A2-1 Bb2-1 C3-1 D3-1 Eb3-1 D3-6 r-12 C3-12 D3-12 G2-24' },
      { i: 'pad', vel: 0.7, n: 'G2+D3-48 C3+Eb3-24 D3+F#3-24' },
      { i: 'flute', vel: 0.35, n: 'r-48 D5-6 Bb4-6 G4-12 r-24' }
    ]
  };

  /* ======================= EFEITOS ======================= */
  var add = TC.audio.addSfx;
  // corrente chacoalhando
  add('c6chain', function (t, p, S) {
    for (var i = 0; i < 6; i++) {
      var d = i * 0.05 + Math.random() * 0.02;
      S.noise(t + d, 0.04, 0.12, 'bandpass', 3500 + Math.random() * 2000, 2500, 5);
      S.osc('square', 1800 + Math.random() * 900, 1500, t + d, 0.03, 0.03);
    }
  });
  // alguém (ou algo) para dentro do saco de estopa
  add('c6sack', function (t, p, S) {
    S.noise(t, 0.3, 0.22, 'lowpass', 1400, 300, 0.8);
    S.osc('sine', 110, 40, t + 0.08, 0.25, 0.5);
    S.noise(t + 0.1, 0.2, 0.12, 'bandpass', 600, 400, 2);
  });
  // vara de marmelo cortando o ar
  add('c6switch', function (t, p, S) {
    S.noise(t, 0.07, 0.25, 'bandpass', 900, 5000, 3);
    S.osc('square', 2400, 900, t + 0.06, 0.03, 0.06);
  });
  // bola de bolão rolando nas tábuas
  add('c6bowl', function (t, p, S) {
    S.noise(t, 0.45, 0.16, 'lowpass', 380, 200, 1.5);
    S.osc('sine', 62, 58, t, 0.4, 0.22);
  });
  // os pinos de madeira caindo
  add('c6pins', function (t, p, S) {
    S.osc('triangle', 220, 110, t, 0.12, 0.35);
    for (var i = 0; i < 9; i++) {
      var d = 0.02 + i * 0.045 + Math.random() * 0.03;
      S.osc('triangle', 700 + Math.random() * 800, 500, t + d, 0.05, 0.12);
      S.noise(t + d, 0.03, 0.08, 'bandpass', 2200, 1600, 4);
    }
  });
  // giz arranhando o quadro
  add('c6chalk', function (t, p, S) {
    for (var i = 0; i < 4; i++) S.noise(t + i * 0.035, 0.025, 0.07, 'bandpass', 5200 + Math.random() * 1500, 4800, 8);
    S.osc('sine', 3400, 3900, t, 0.12, 0.012);
  });
  // palha farfalhando (espantalho)
  add('c6straw', function (t, p, S) {
    S.noise(t, 0.28, 0.12, 'bandpass', 2200, 1400, 1.2);
    S.noise(t + 0.08, 0.18, 0.08, 'highpass', 4000, 5000);
  });
  // tufo de barba-de-velho
  add('c6tuft', function (t, p, S) { S.noise(t, 0.16, 0.12, 'lowpass', 1800, 500, 1); });
  // musgo seco pegando fogo
  add('c6fire', function (t, p, S) {
    S.noise(t, 0.9, 0.35, 'bandpass', 300, 1800, 0.8, 0.4);
    S.osc('sawtooth', 90, 50, t, 0.6, 0.12);
    for (var i = 0; i < 10; i++) S.noise(t + 0.1 + Math.random() * 0.8, 0.02, 0.1, 'highpass', 3000, 5000);
  });
  // o golpe que cai no X de giz
  add('c6strike', function (t, p, S) {
    S.noise(t, 0.12, 0.3, 'bandpass', 1200, 300, 1.5);
    S.osc('sine', 150, 45, t, 0.22, 0.45);
  });
  // o sino da Matriz, grave e longe (as sete badaladas)
  add('c6toll', function (t, p, S) {
    var base = 98;
    [[1, 0.5], [2.02, 0.28], [2.4, 0.2], [3.01, 0.14], [4.17, 0.09], [5.43, 0.06], [0.5, 0.25]].forEach(function (q) {
      S.osc('sine', base * q[0], base * q[0] * 0.998, t, 6 / Math.max(1, q[0]) + 1.2, q[1] * 0.45, null, 0.7);
    });
    S.noise(t, 0.08, 0.1, 'bandpass', 900, 600, 2, 0.5);
  });
  // o molho de chaves do caminhão
  add('c6keys', function (t, p, S) {
    for (var i = 0; i < 5; i++) S.osc('square', 2600 + Math.random() * 1400, 2000, t + i * 0.06 + Math.random() * 0.02, 0.03, 0.04);
  });
  // vidro da janela estourando
  add('c6glass', function (t, p, S) {
    S.noise(t, 0.4, 0.3, 'highpass', 3000, 6000, 0.7, 0.4);
    for (var i = 0; i < 8; i++) { var f = 3000 + Math.random() * 3000; S.osc('sine', f, f * 0.9, t + 0.05 + Math.random() * 0.4, 0.08, 0.04, null, 0.4); }
  });
})();
