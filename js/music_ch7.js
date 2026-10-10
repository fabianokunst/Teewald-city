'use strict';
/* Teewald City — trilha e efeitos do capítulo 7 ("A Última Fita"):
   a vigília na igreja, a marcha da praça (o tema do título em maior, com órgão, bateria e gaita), a cripta, a torre do relógio,
   os ecos dos chefes, o Dies Irae do Antigo, a valsa torta do porão do Hoffnung, o pau-de-fita triunfal da bandinha,
   o verso, a manhã de sinos, o assobio do pai na estrada e os créditos finais. */
(function () {
  var S = TC.SONGS;
  if (!S) return;

  function copyTracks(src, extra) {
    return src.map(function (t) { var o = {}; for (var k in t) if (k !== '_p') o[k] = t[k]; if (extra) for (var e in extra) o[e] = extra[e]; return o; });
  }

  /* Vigília: órgão, coro baixinho e o sino (ré menor) — o prólogo dentro da Matriz */
  S.vigil7 = {
    bpm: 60, spb: 4,
    tracks: [
      { i: 'organ', vel: 0.85, n: 'D3+F3+A3-16 Bb2+D3+F3-16 G2+Bb2+D3-16 A2+C#3+E3-16 D3+F3+A3-16 C3+E3+G3-16 Bb2+D3+F3-16 A2+C#3+E3-16' },
      { i: 'organ', vel: 0.7, n: 'D2-32 G1-16 A1-16 D2-16 C2-16 Bb1-16 A1-16' },
      { i: 'choir', vel: 1.1, n: 'A4-8 G4-4 F4-4 F4-8 D4-8 D4-8 E4-4 F4-4 E4-16 A4-8 Bb4-4 C5-4 C5-8 G4-8 F4-8 E4-4 D4-4 C#4-16' },
      { i: 'bell', vel: 0.45, n: 'D5-32 r-32 A4-32 r-32' }
    ]
  };

  /* Fase 7: a marcha da praça — o tema da abertura em lá maior, com órgão, bateria e a gaita dobrando a melodia */
  (function () {
    var CH = {
      A: ['A1', 'A2', 'A3+C#4+E4', ['A4', 'C#5', 'E5', 'C#5']],
      E: ['E2', 'E3', 'G#3+B3+E4', ['G#4', 'B4', 'E5', 'B4']],
      D: ['D2', 'D3', 'F#3+A3+D4', ['F#4', 'A4', 'D5', 'A4']],
      Fm: ['F#1', 'F#2', 'F#3+A3+C#4', ['F#4', 'A4', 'C#5', 'A4']]
    };
    var prog = 'A E D E A D E A A Fm E D Fm E A A'.split(' ');
    var mel = 'E5-4 A5-4 B5-4 C#6-4 C#6-4 B5-4 A5-4 G#5-4 E5-4 D5-12 r-4 E5-2 F#5-2 G#5-4 B5-4 ' +
      'E5-4 A5-4 B5-4 C#6-4 D6-4 C#6-4 B5-8 G#5-8 E5-4 G#5-4 A5-16 ' +
      'A5-4 C#6-4 E6-4 F#6-4 E6-8 D6-4 C#6-4 B5-8 G#5-4 A5-4 B5-4 C#6-4 D6-4 B5-4 ' +
      'C#6-6 B5-2 A5-4 F#5-4 E5-8 G#5-4 B5-4 A5-4 E5-4 C#6-4 E6-4 A6-12 r-4';
    S.stage7 = {
      bpm: 140, spb: 4,
      tracks: [
        { d: true, n: '((k-2 h-2 s-2 h-2 k-2 k-2 s-2 h-2)*7 k-2 s-1 s-1 s-2 s-1 s-1 S-2 S-2 T-2 c-2)*2' },
        { i: 'bass', n: prog.map(function (k) { return '(' + CH[k][0] + '-2 ' + CH[k][1] + '-2)*4'; }).join(' ') },
        { i: 'organ', vel: 0.8, n: prog.map(function (k) { return CH[k][2] + '-16'; }).join(' ') },
        { i: 'lead', n: mel },
        { i: 'accordion', vel: 0.6, tr: -12, n: mel },
        { i: 'arp', vel: 0.55, n: prog.map(function (k) { var a = CH[k][3]; return '(' + a.join('-1 ') + '-1)*4'; }).join(' ') }
      ]
    };
  })();

  /* A cripta: coro grave, sino distante e gotas */
  S.crypt7 = {
    bpm: 56, spb: 4,
    tracks: [
      { i: 'choir', vel: 0.9, n: 'D3+A3-32 Eb3+A3-32 D3+A3-32 C3+G3-32' },
      { i: 'pad', vel: 0.8, n: 'D2+A2-64 C2+G2-64' },
      { i: 'bass', vel: 0.6, n: 'D2-32 D2-32 Eb2-32 C2-32' },
      { i: 'bell', vel: 0.45, n: 'r-16 A5-8 r-40 r-16 Bb5-8 r-40' },
      { d: true, vel: 0.6, n: '(T~-4 r-28)*4' }
    ]
  };

  /* A torre do relógio: o tique-taque, cordas em ostinato e a valsa do pai quebrada na caixinha */
  S.tower7 = {
    bpm: 104, spb: 4,
    tracks: [
      { d: true, vel: 0.8, n: '(h~-4 h-4)*16' },
      { i: 'strings', vel: 0.9, n: '(D4-2 F4-2 A4-2 F4-2)*4 (C#4-2 E4-2 A4-2 E4-2)*4 (D4-2 F4-2 Bb4-2 F4-2)*4 (C#4-2 E4-2 G4-2 E4-2)*4' },
      { i: 'bass', vel: 0.8, n: 'D2-16 D2-16 A1-16 A1-16 Bb1-16 Bb1-16 A1-16 A1-16' },
      { i: 'bell', vel: 0.4, n: 'D6-32 r-32 A5-32 r-32' },
      { i: 'musicbox', vel: 0.6, n: 'r-64 A5-8 G5-4 F5-4 E5-16 D5-8 F5-8 A4-16' }
    ]
  };

  /* Os ecos: os temas do Ciclope e do Moço, desafinados e com coro por cima, como lembranças da cerração */
  if (S.boss) {
    S.c7echo1 = { bpm: 138, spb: 4, vol: 0.85, tracks: copyTracks(S.boss.tracks, { tr: -0.4 }).concat([{ i: 'choir', vel: 0.8, n: 'D4+A4-64 Bb3+F4-32 A3+E4-32' }]) };
  }
  if (S.boss3) {
    S.c7echo2 = { bpm: 136, spb: 4, vol: 0.85, tracks: copyTracks(S.boss3.tracks, { tr: -0.35 }).concat([{ i: 'bell', vel: 0.35, n: 'E6-48 r-48 B5-48 r-48' }]) };
  }

  /* O Antigo, fase 1: o Dies Irae no coro e no órgão, em dó menor, com metais e bateria pesada */
  (function () {
    var CH = {
      Cm: ['C2', 'C3', 'C3+Eb3+G3', ['C5', 'G4', 'Eb4', 'G4']], Ab: ['Ab1', 'Ab2', 'Ab2+C3+Eb3', ['C5', 'Ab4', 'Eb4', 'Ab4']],
      Bb: ['Bb1', 'Bb2', 'Bb2+D3+F3', ['D5', 'Bb4', 'F4', 'Bb4']], G: ['G1', 'G2', 'G2+B2+D3', ['D5', 'B4', 'G4', 'B4']],
      Fm: ['F1', 'F2', 'F2+Ab2+C3', ['C5', 'Ab4', 'F4', 'Ab4']]
    };
    var prog = 'Cm Cm Ab Bb Cm Bb Ab G Fm Cm Ab G Ab Bb Cm Cm'.split(' ');
    S.boss7 = {
      bpm: 150, spb: 4,
      tracks: [
        { d: true, n: '(k-2 h-2 s-2 h-2 k-2 k-2 S-2 h-2)*15 k-1 k-1 s-1 s-1 S-2 S-2 T-2 T-2 t-2 c-2' },
        { i: 'bass', n: prog.map(function (k) { return '(' + CH[k][0] + '-2 ' + CH[k][1] + '-2)*4'; }).join(' ') },
        { i: 'organ', n: prog.map(function (k) { return CH[k][2] + '-16'; }).join(' ') },
        { i: 'choir', vel: 1.3, n: 'Eb5-8 D5-8 Eb5-8 C5-8 D5-8 Bb4-8 C5-16 Eb5-8 F5-8 Eb5-8 D5-8 C5-8 D5-8 Eb5-8 D5-8 ' +
          'C5-8 Bb4-8 Ab4-8 G4-8 C5-16 Bb4-16 G4-8 Ab4-8 Bb4-8 C5-8 C5-32' },
        { i: 'brass', vel: 0.8, n: '(r-12 G4+C5-2 G4+C5-2)*16' },
        { i: 'arp', vel: 0.5, n: prog.map(function (k) { var a = CH[k][3]; return '(' + a.join('-1 ') + '-1)*4'; }).join(' ') }
      ]
    };
  })();

  /* O Antigo, fase 2: o porão do Hoffnung — valsa lenta e torta, a gaita desafinada contra o violão */
  (function () {
    var CH = { Dm: ['D2', 'D3+F3+A3'], A: ['A1', 'C#3+E3+A3'], Gm: ['G1', 'G3+Bb3+D4'], Bb: ['Bb1', 'D3+F3+Bb3'], F: ['F2', 'F3+A3+C4'] };
    var prog = 'Dm Dm A A Dm Dm Gm A Bb Bb F F Gm Dm A Dm'.split(' ');
    var mel = 'A4-4 D5-4 F5-4 E5-8 D5-4 C#5-4 E5-4 A5-4 G5-8 E5-4 F5-4 E5-4 D5-4 A5-8 F5-4 G5-4 Bb5-4 D5-4 C#5-12 ' +
      'D5-4 F5-4 Bb5-4 A5-8 G5-4 A5-4 C6-4 A5-4 F5-12 G5-4 Bb5-4 G5-4 F5-4 A5-4 F5-4 E5-4 C#5-4 E5-4 D5-12';
    S.boss7b = {
      bpm: 100, spb: 4,
      tracks: [
        { i: 'bass', vel: 0.9, n: prog.map(function (k) { return CH[k][0] + '-4 r-8'; }).join(' ') },
        { i: 'guitar', vel: 0.7, n: prog.map(function (k) { return 'r-4 ' + CH[k][1] + '-4 ' + CH[k][1] + '-4'; }).join(' ') },
        { i: 'accordion', tr: -0.35, n: mel },
        { i: 'flute', vel: 0.45, n: 'r-96 A5-24 G5-24 F5-24 E5-24' },
        { i: 'bell', vel: 0.35, n: 'r-96 A5-12 r-84' },
        { d: true, vel: 0.6, n: '(T~-4 r-8)*15 T-4 T-4 T-4' }
      ]
    };
  })();

  /* O Antigo, fase 3: o pau-de-fita — a bandinha toca a valsa do pai, triunfal */
  if (S.drive) {
    var D = S.drive.tracks;
    S.boss7c = {
      bpm: 132, spb: 4,
      tracks: [
        { i: 'bass', n: D[0].n },
        { i: 'guitar', vel: 0.75, n: D[1].n },
        { i: 'brass', n: D[2].n },
        { i: 'accordion', vel: 0.6, n: D[2].n },
        { i: 'musicbox', vel: 0.35, tr: 12, n: D[2].n },
        { i: 'choir', vel: 0.7, n: 'D4+A4-96 A3+E4-48 D4+A4-48' },
        { d: true, n: '(k-4 s-4 s-4)*15 k-2 k-2 S-4 c-4' }
      ]
    };
    /* o assobio do pai na estrada, de manhã */
    S.whistle7 = {
      bpm: 96, spb: 4,
      tracks: [
        { i: 'flute', vel: 0.9, tr: 12, n: D[2].n },
        { i: 'guitar', vel: 0.45, n: D[1].n },
        { i: 'bass', vel: 0.55, n: D[0].n },
        { i: 'pad', vel: 0.5, n: 'D3+F#3+A3-48 G3+B3+D4-48 A3+C#4+E4-48 D3+F#3+A3-48' }
      ]
    };
  }

  /* O último verso: coro e órgão em ré maior */
  S.verse7 = {
    bpm: 60, spb: 4,
    tracks: [
      { i: 'choir', vel: 1.2, n: 'D4+F#4+A4-32 G4+B4+D5-32 A4+C#5+E5-32 D4+F#4+A4-32' },
      { i: 'organ', vel: 0.8, n: 'D3+A3-32 G2+D3-32 A2+E3-32 D3+A3-32' },
      { i: 'bell', vel: 0.4, n: 'D5-32 r-96' }
    ]
  };

  /* A manhã: os sinos repicando, o órgão e uma fanfarra */
  S.morning7 = {
    bpm: 104, spb: 4,
    tracks: [
      { i: 'bell', vel: 0.55, n: '(D6-4 A5-4 F#5-4 D5-4)*8 (D6-4 B5-4 G5-4 D5-4)*4 (C#6-4 A5-4 E5-4 A4-4)*4' },
      { i: 'organ', vel: 0.8, n: 'D3+F#3+A3-64 G3+B3+D4-32 A3+C#4+E4-32 D3+F#3+A3-64 G3+B3+D4-32 A3+C#4+E4-32' },
      { i: 'bass', vel: 0.7, n: 'D2-32 D2-32 G1-32 A1-32 D2-32 D2-32 G1-32 A1-32' },
      { i: 'brass', vel: 0.8, n: 'r-64 D5-8 F#5-8 A5-16 G5-8 F#5-8 E5-16 r-64 A5-8 F#5-8 D6-16 C#6-8 B5-8 A5-16' },
      { d: true, vel: 0.6, n: '(k-8 r-8 s-8 r-8)*8' }
    ]
  };

  /* Créditos finais: o tema da abertura, agora em lá maior, numa valsa de caixinha de música e cordas */
  S.credits7 = {
    bpm: 84, spb: 4,
    tracks: [
      { i: 'pad', n: 'A3+C#4+E4-12 F#3+A3+D4-12 G#3+B3+E4-12 F#3+A3+D4-12 A3+C#4+E4-12 F#3+A3+D4-12 G#3+B3+E4-24 ' +
        'A3+C#4+E4-12 F#3+A3+D4-12 A3+C#4+E4-12 G#3+B3+E4-12 A3+C#4+E4-12 F#3+A3+D4-12 G#3+B3+E4-24' },
      { i: 'bass', vel: 0.7, n: 'A2-4 r-8 D2-4 r-8 E2-4 r-8 D2-4 r-8 A2-4 r-8 D2-4 r-8 E2-4 r-8 E2-4 r-8 ' +
        'A2-4 r-8 D2-4 r-8 A2-4 r-8 E2-4 r-8 A2-4 r-8 D2-4 r-8 E2-4 r-8 E2-4 r-8' },
      { i: 'musicbox', n: 'E5-4 A5-4 B5-4 C#6-8 B5-4 A5-4 G#5-4 E5-4 D5-12 E5-4 A5-4 B5-4 C#6-4 D6-4 C#6-4 B5-12 G#5-8 r-4 ' +
        'A5-4 C#6-4 E6-4 F#6-8 E6-4 E6-4 D6-4 C#6-4 B5-8 G#5-4 A5-4 B5-4 C#6-4 A5-6 G#5-2 F#5-4 E5-8 G#5-4 B5-12' },
      { i: 'strings', vel: 0.5, n: 'r-96 A4-24 F#4-24 A4-24 G#4-24' },
      { i: 'flute', vel: 0.5, n: 'r-96 C#6-12 B5-12 A5-12 F#5-12 E5-24 G#5-24' },
      { i: 'bell', vel: 0.3, n: 'A5-48 r-48 E5-48 r-48' }
    ]
  };

  /* ======================= EFEITOS ======================= */
  var A = TC.audio;
  if (!A || !A.addSfx) return;
  function rnd() { return Math.random(); }

  /* o sino grande do Hoffnung: grave, com parciais desafinadas e um zumbido longo */
  A.addSfx('bellToll', function (t, p, S) {
    var f = (p || 98);
    [[0.5, 0.22, 7], [1, 0.42, 6], [2, 0.3, 4.6], [2.4, 0.24, 4], [3, 0.16, 3.2], [4.2, 0.1, 2.4], [5.4, 0.07, 1.8], [6.8, 0.04, 1.2]].forEach(function (q) {
      S.osc('sine', f * q[0], f * q[0] * 0.997, t, q[2], q[1] * 0.42, null, 0.7);
    });
    S.noise(t, 0.08, 0.35, 'bandpass', 1800, 900, 1.2, 0.5);
  });
  /* madeira do navio rangendo */
  A.addSfx('creak', function (t, p, S) {
    for (var i = 0; i < 14; i++) S.noise(t + i * 0.028, 0.03, 0.08, 'bandpass', 420 + i * 18, 380 + i * 10, 10);
    S.osc('sawtooth', 150, 118, t, 0.42, 0.025);
  });
  /* marola no casco */
  A.addSfx('wave', function (t, p, S) {
    S.noise(t, 1.8, 0.12, 'lowpass', 300, 1400, 0.6, 0.3);
    S.noise(t + 1.0, 1.6, 0.08, 'lowpass', 1400, 250, 0.6, 0.3);
  });
  /* vozes do povo (murmúrio) */
  A.addSfx('crowd', function (t, p, S) {
    for (var i = 0; i < 18; i++) {
      var tt = t + rnd() * 1.3;
      S.noise(tt, 0.1 + rnd() * 0.16, 0.045, 'bandpass', 500 + rnd() * 900, 420 + rnd() * 700, 6);
    }
  });
  /* o laço bento estalando */
  A.addSfx('lassoWhip', function (t, p, S) {
    S.noise(t, 0.16, 0.18, 'bandpass', 500, 2600, 1.6);
    S.noise(t + 0.15, 0.04, 0.32, 'highpass', 3500, 6000, 0.7, 0.3);
    S.osc('square', 1900, 700, t + 0.15, 0.035, 0.08);
  });
  /* a agulha da Hilde */
  A.addSfx('c7stitch', function (t, p, S) {
    for (var i = 0; i < 5; i++) {
      S.osc('sine', 2600, 2200, t + i * 0.07, 0.03, 0.05, null, 0.4);
      S.noise(t + i * 0.07 + 0.02, 0.05, 0.05, 'highpass', 5000, 7000);
    }
  });
  /* vitral estilhaçando */
  A.addSfx('c7glass', function (t, p, S) {
    S.noise(t, 0.3, 0.28, 'highpass', 3000, 7000, 0.7, 0.4);
    for (var i = 0; i < 10; i++) { var f = 3000 + rnd() * 3000; S.osc('sine', f, f * 0.97, t + rnd() * 0.4, 0.12 + rnd() * 0.2, 0.035, null, 0.6); }
  });
  /* sopro de cerração */
  A.addSfx('c7fog', function (t, p, S) {
    S.noise(t, 1.6, 0.2, 'lowpass', 200, 900, 0.8, 0.4);
    S.noise(t + 0.3, 1.4, 0.1, 'bandpass', 800, 300, 1, 0.4);
  });
  /* assinatura voando */
  A.addSfx('c7x', function (t, p, S) {
    S.noise(t, 0.25, 0.1, 'bandpass', 1500, 400, 3);
    S.osc('sawtooth', 600, 200, t, 0.2, 0.025);
  });
  /* mão arrebentando as tábuas */
  A.addSfx('c7thud', function (t, p, S) {
    S.noise(t, 0.3, 0.4, 'lowpass', 800, 100);
    S.osc('sine', 90, 35, t, 0.35, 0.5);
    S.noise(t, 0.12, 0.2, 'bandpass', 1200, 600, 3);
  });
  /* brilho (fitas, vaga-lumes) */
  A.addSfx('c7sparkle', function (t, p, S) {
    [1568, 2093, 2637, 3136, 4186].forEach(function (f, i) { S.osc('triangle', f, f, t + i * 0.05, 0.4, 0.05, null, 0.7); });
  });
  /* os vinte anos chegando de uma vez */
  A.addSfx('c7age', function (t, p, S) {
    for (var i = 0; i < 10; i++) { var f = 4000 - i * 300; S.osc('sine', f, f * 0.8, t + i * 0.08, 0.3, 0.035, null, 0.7); }
    S.noise(t, 1.2, 0.05, 'highpass', 6000, 3000, 0.7, 0.5);
  });
  /* a cidade comemorando */
  A.addSfx('c7cheer', function (t, p, S) {
    for (var i = 0; i < 26; i++) {
      var tt = t + rnd() * 1.4;
      S.noise(tt, 0.12 + rnd() * 0.2, 0.05, 'bandpass', 600 + rnd() * 1200, 900 + rnd() * 900, 5);
      if (i % 4 === 0) S.osc('sawtooth', 280 + rnd() * 220, 420 + rnd() * 260, tt, 0.22, 0.018);
    }
  });
  /* a corda do sino */
  A.addSfx('c7pull', function (t, p, S) {
    S.noise(t, 0.25, 0.15, 'bandpass', 400, 900, 4);
    S.osc('triangle', 220, 160, t, 0.2, 0.08);
  });
  /* acorde de coro (revelações) */
  A.addSfx('c7choir', function (t, p, S) {
    [293.7, 349.2, 440, 587.3].forEach(function (f) { S.osc('triangle', f, f, t, 2.4, 0.06, null, 0.8); S.osc('triangle', f * 1.006, f * 1.006, t, 2.4, 0.04, null, 0.8); });
  });
})();
