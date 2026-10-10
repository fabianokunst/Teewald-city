'use strict';
/* Teewald City — trilha sonora (notação: NOTA-duração em semicolcheias; r = pausa; + = acorde; (..)*n = repetição) */
(function () {
  var S = TC.SONGS = {};

  /* Tema de abertura: valsa melancólica em lá menor (caixinha de música) */
  S.title = {
    bpm: 76, spb: 4,
    tracks: [
      { i: 'pad', n: '(A3+C4+E4-12 F3+A3+C4-12 C3+E3+G3-12 G3+B3+D4-12 A3+C4+E4-12 F3+A3+C4-12 E3+G#3+B3-24)*2' },
      { i: 'bass', vel: 0.7, n: '(A2-4 r-8 F2-4 r-8 C2-4 r-8 G2-4 r-8 A2-4 r-8 F2-4 r-8 E2-4 r-8 E2-4 r-8)*2' },
      { i: 'pluck', vel: 0.45, n: '(r-4 A3+E4-4 A3+E4-4 r-4 A3+C4-4 A3+C4-4 r-4 G3+C4-4 G3+C4-4 r-4 G3+B3-4 G3+B3-4 r-4 A3+E4-4 A3+E4-4 r-4 A3+C4-4 A3+C4-4 r-4 G#3+B3-4 G#3+B3-4 r-4 G#3+D4-4 G#3+D4-4)*2' },
      { i: 'musicbox', n: 'E5-4 A5-4 B5-4 C6-8 B5-4 A5-4 G5-4 E5-4 D5-12 E5-4 A5-4 B5-4 C6-4 D6-4 C6-4 B5-12 G#5-8 r-4 ' +
        'A5-4 C6-4 E6-4 F6-8 E6-4 E6-4 D6-4 C6-4 B5-8 G5-4 A5-4 B5-4 C6-4 A5-6 G5-2 F5-4 E5-8 G#5-4 B5-12' }
    ]
  };

  /* A estrada: valsa nostálgica de gaita (acordeão) — a cidade como era */
  S.drive = {
    bpm: 104, spb: 4,
    tracks: [
      { i: 'bass', n: 'D2-4 r-8 A1-4 r-8 G1-4 r-8 A1-4 r-8 D2-4 r-8 B1-4 r-8 G1-4 r-4 A1-4 D2-4 r-8 ' +
        'G1-4 r-8 D2-4 r-8 A1-4 r-8 D2-4 r-8 G1-4 r-8 F#1-4 r-8 E1-4 r-4 A1-4 D2-4 r-8' },
      { i: 'guitar', vel: 0.8, n: 'r-4 F#3+A3+D4-4 F#3+A3+D4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4 r-4 G3+B3+D4-4 G3+B3+D4-4 r-4 E3+A3+C#4-4 E3+A3+C#4-4 ' +
        'r-4 F#3+A3+D4-4 F#3+A3+D4-4 r-4 F#3+B3+D4-4 F#3+B3+D4-4 r-4 G3+B3+D4-4 E3+A3+C#4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4 ' +
        'r-4 G3+B3+D4-4 G3+B3+D4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4 r-4 E3+A3+C#4-4 E3+A3+C#4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4 ' +
        'r-4 G3+B3+D4-4 G3+B3+D4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4 r-4 E3+G3+B3-4 E3+A3+C#4-4 r-4 F#3+A3+D4-4 F#3+A3+D4-4' },
      { i: 'accordion', n: 'F#4-4 A4-4 D5-4 C#5-4 D5-4 E5-4 D5-8 B4-4 A4-12 F#4-4 A4-4 D5-4 F#5-6 E5-2 D5-4 E5-4 D5-4 C#5-4 D5-12 ' +
        'B4-4 D5-4 G5-4 F#5-4 E5-4 D5-4 E5-4 C#5-4 A4-4 D5-8 A4-4 B4-4 D5-4 G5-4 A5-6 G5-2 F#5-4 G5-4 E5-4 C#5-4 D5-12' },
      { i: 'flute', vel: 0.5, n: 'r-96 D5-12 A4-12 B4-12 A4-12 D5-12 D5-12 E5-12 F#5-12' }
    ]
  };

  /* Tensão: trítonos e batidas surdas */
  S.dread = {
    bpm: 60, spb: 4,
    tracks: [
      { i: 'choir', n: 'D3+G#3-32 C#3+G3-32' },
      { i: 'bass', vel: 0.8, n: 'D2-16 D2-16 C#2-16 C#2-16' },
      { i: 'bell', vel: 0.6, n: 'r-12 G#5-4 r-16 r-8 A5-4 r-4 r-16' },
      { d: true, vel: 0.7, n: '(T~-3 T~-5 r-8)*4' }
    ]
  };

  /* Fase 1: ação noturna em mi menor */
  S.stage1 = {
    bpm: 132, spb: 4,
    tracks: [
      { d: true, n: '((k-2 h-2 s-2 h-2 k-2 k-2 s-2 h-2)*3 k-2 h-2 s-2 h-2 k-2 s-1 s-1 s-2 S-2)*4' },
      { i: 'bass', n: '(E2-2 E3-2)*8 (C2-2 C3-2)*4 (D2-2 D3-2)*4 (E2-2 E3-2)*8 (C2-2 C3-2)*4 (B1-2 B2-2)*4 ' +
        '(A1-2 A2-2)*8 (E2-2 E3-2)*8 (C2-2 C3-2)*4 (D2-2 D3-2)*4 (B1-2 B2-2)*8' },
      { i: 'strings', n: 'E3+G3+B3-32 C3+E3+G3-16 D3+F#3+A3-16 E3+G3+B3-32 C3+E3+G3-16 B2+D#3+F#3-16 ' +
        'A2+C3+E3-32 E3+G3+B3-32 C3+E3+G3-16 D3+F#3+A3-16 B2+D#3+F#3-32' },
      { i: 'lead', n: 'E5-4 r-2 B4-2 E5-2 F#5-2 G5-4 F#5-2 E5-2 D5-2 E5-2 B4-8 C5-4 r-2 G4-2 C5-2 D5-2 E5-4 D5-2 C5-2 B4-2 A4-2 D5-8 ' +
        'E5-4 r-2 B4-2 E5-2 F#5-2 G5-4 A5-2 G5-2 F#5-2 G5-2 B5-8 C6-4 B5-2 A5-2 G5-4 E5-4 D#5-4 F#5-4 B5-8 ' +
        'A4-6 C5-2 E5-8 D5-2 C5-2 B4-2 C5-2 A4-8 B4-6 E5-2 G5-8 F#5-2 G5-2 F#5-2 E5-2 B4-8 ' +
        'C5-4 E5-4 G5-4 C6-4 B5-4 A5-4 F#5-4 D5-4 D#5-4 F#5-4 A5-4 B5-4 B5-12 r-4' },
      { i: 'arp', n: '(E4-1 G4-1 B4-1 G4-1)*8 (C4-1 E4-1 G4-1 E4-1)*4 (D4-1 F#4-1 A4-1 F#4-1)*4 (E4-1 G4-1 B4-1 G4-1)*8 (C4-1 E4-1 G4-1 E4-1)*4 (B3-1 D#4-1 F#4-1 D#4-1)*4 ' +
        '(A3-1 C4-1 E4-1 C4-1)*8 (E4-1 G4-1 B4-1 G4-1)*8 (C4-1 E4-1 G4-1 E4-1)*4 (D4-1 F#4-1 A4-1 F#4-1)*4 (B3-1 D#4-1 F#4-1 D#4-1)*8' }
    ]
  };

  /* Chefe: rápido, ré menor */
  S.boss = {
    bpm: 152, spb: 4,
    tracks: [
      { d: true, n: '(k-2 h-1 h-1 s-2 h-2 k-1 k-1 h-2 s-2 h-2)*7 k-1 k-1 s-1 s-1 S-2 s-1 s-1 T-2 T-2 t-2 c-2' },
      { i: 'bass', n: '(D2-2 D2-2 D3-2 D2-2 D2-2 C3-2 D2-2 F2-2 Bb1-2 Bb1-2 Bb2-2 Bb1-2 C2-2 C2-2 C3-2 C2-2 D2-2 D2-2 D3-2 D2-2 D2-2 C3-2 D2-2 F2-2 A1-2 A1-2 A2-2 A1-2 C#2-2 C#2-2 E2-2 A2-2)*2' },
      { i: 'brass', n: '(D3+F3+A3-16 Bb2+D3+F3-8 C3+E3+G3-8 D3+F3+A3-16 A2+C#3+E3-16)*2' },
      { i: 'lead', n: 'D5-4 F5-4 A5-6 G5-2 F5-4 E5-4 D5-4 C5-4 D5-4 F5-4 A5-4 D6-4 C#6-8 A5-8 ' +
        'F5-2 G5-2 A5-4 Bb5-4 A5-4 G5-4 F5-4 E5-4 G5-4 F5-2 E5-2 D5-4 A5-4 F5-4 E5-4 C#5-4 E5-4 A5-4' },
      { i: 'arp', n: '(D4-1 F4-1 A4-1 D5-1)*4 (Bb3-1 D4-1 F4-1 Bb4-1)*2 (C4-1 E4-1 G4-1 C5-1)*2 (D4-1 F4-1 A4-1 D5-1)*4 (A3-1 C#4-1 E4-1 A4-1)*4 ' +
        '(D4-1 F4-1 A4-1 D5-1)*4 (Bb3-1 D4-1 F4-1 Bb4-1)*2 (C4-1 E4-1 G4-1 C5-1)*2 (D4-1 F4-1 A4-1 D5-1)*4 (A3-1 C#4-1 E4-1 A4-1)*4' }
    ]
  };

  /* Igreja / final: órgão e coro */
  S.church = {
    bpm: 66, spb: 4,
    tracks: [
      { i: 'organ', n: 'A3+C4+E4-16 F3+A3+C4-16 E3+G3+C4-16 D3+G3+B3-16 C3+E3+A3-16 D3+F3+A3-16 E3+G#3+B3-32' },
      { i: 'organ', vel: 0.8, n: 'A2-16 F2-16 C2-16 G2-16 A2-16 D2-16 E2-32' },
      { i: 'choir', vel: 1.2, n: 'E5-8 D5-4 C5-4 C5-8 A4-8 G4-8 E5-8 D5-16 C5-8 B4-4 A4-4 A4-8 F5-8 E5-16 r-16' },
      { i: 'bell', vel: 0.5, n: 'A5-16 r-48 E5-16 r-48' }
    ]
  };

  /* Despertar: quase silêncio */
  S.wake = {
    bpm: 60, spb: 4,
    tracks: [
      { i: 'pad', vel: 0.8, n: 'A2+E3-64 F2+C3-64' },
      { i: 'musicbox', vel: 0.7, n: 'r-16 E5-8 r-8 B4-8 r-24 C5-8 r-8 A4-24 r-24' }
    ]
  };

  /* Vinhetas */
  S.clear = {
    bpm: 140, spb: 4, loop: false,
    tracks: [
      { i: 'lead', n: 'E5-2 G#5-2 B5-2 E6-6 D#6-2 B5-2 E6-12' },
      { i: 'brass', n: 'E4+G#4+B4-12 D#4+F#4+B4-4 E4+G#4+B4-12' },
      { i: 'bass', n: 'E2-12 B1-4 E2-12' },
      { d: true, n: 'k-2 r-2 k-2 c-6 s-2 s-2 c-12' }
    ]
  };
  S.gameover = {
    bpm: 70, spb: 4, loop: false,
    tracks: [
      { i: 'lead2', n: 'A4-4 G#4-4 G4-4 F#4-8 F4-12' },
      { i: 'pad', n: 'A3+C4+E4-12 D3+F3+A3-8 E3+G#3+B3-12' },
      { i: 'bass', n: 'A2-12 D2-8 E2-12' }
    ]
  };
  S.fanfare = {
    bpm: 120, spb: 4, loop: false,
    tracks: [
      { i: 'brass', n: 'B4+E5-3 B4+E5-1 B4+E5-4 E5+G#5-8' },
      { d: true, n: 'k-3 k-1 S-4 c-8' }
    ]
  };

  /* ======================= CAPÍTULO 2 ======================= */

  /* Fase 2: "Vanerão de Teewald" — ação em lá menor no ritmo da vaneira gaúcha, com a gaita na frente */
  (function () {
    var CH = {
      Am: ['A2', 'E2', 'A3+C4+E4', ['A4', 'C5', 'E5', 'C5']], Dm: ['D2', 'A1', 'D3+F3+A3', ['D4', 'F4', 'A4', 'F4']],
      G: ['G2', 'D2', 'G3+B3+D4', ['G4', 'B4', 'D5', 'B4']], C: ['C2', 'G1', 'E3+G3+C4', ['C4', 'E4', 'G4', 'E4']],
      E: ['E2', 'B1', 'E3+G#3+B3', ['E4', 'G#4', 'B4', 'G#4']], F: ['F2', 'C2', 'F3+A3+C4', ['F4', 'A4', 'C5', 'A4']]
    };
    var prog = 'Am Am Dm Dm G G C E Am Am Dm Dm F E Am E F G C Am Dm E Am Am F G C Am Dm E Am E'.split(' ');
    var bass = prog.map(function (k) { return CH[k][0] + '-4 ' + CH[k][1] + '-4'; }).join(' ');
    var gtr = prog.map(function (k) { return 'r-2 ' + CH[k][2] + '-2 r-2 ' + CH[k][2] + '-2'; }).join(' ');
    var arp = prog.map(function (k) { var a = CH[k][3]; return (a.join('-1 ') + '-1 ') + (a.join('-1 ') + '-1'); }).join(' ');
    S.stage2 = {
      bpm: 140, spb: 4,
      tracks: [
        { d: true, n: '((k-2 h-2 s-1 h-1 k-2)*3 k-2 h-2 s-2 s-1 s-1)*8' },
        { i: 'bass', n: bass },
        { i: 'guitar', vel: 0.75, n: gtr },
        { i: 'arp', vel: 0.7, n: arp },
        { i: 'accordion', n:
          'E5-2 A5-2 G#5-1 A5-1 B5-2 C6-3 B5-1 A5-2 E5-2 F5-2 A5-2 D6-2 C6-1 A5-1 B5-4 A5-2 F5-2 ' +
          'G5-2 B5-2 D6-2 B5-2 C6-2 B5-2 A5-2 G5-2 E5-2 G5-2 C6-3 B5-1 G#5-4 E5-4 ' +
          'E5-2 A5-2 G#5-1 A5-1 B5-2 C6-3 D6-1 E6-2 C6-2 D6-2 F6-2 E6-1 D6-1 C6-2 A5-4 F5-2 A5-2 ' +
          'C6-2 A5-2 F5-2 A5-2 B5-2 G#5-2 E5-2 D5-2 C5-2 E5-2 A5-4 B4-2 E5-2 G#5-4 ' +
          'A5-2 C6-2 F6-3 E6-1 D6-2 B5-2 G5-2 D6-2 E6-2 D6-1 C6-1 G5-2 E5-2 A5-6 E5-2 ' +
          'F5-1 E5-1 F5-1 A5-1 D6-2 A5-2 B5-1 A5-1 G#5-1 B5-1 E6-4 C6-2 B5-1 A5-1 E5-2 A5-2 A5-6 r-2 ' +
          'A5-2 C6-2 F6-3 E6-1 D6-2 B5-2 G5-2 D6-2 G6-2 E6-1 D6-1 C6-2 G5-2 A5-2 C6-2 E6-4 ' +
          'F6-2 E6-1 D6-1 C6-2 A5-2 G#5-2 B5-2 E6-4 A5-2 E5-2 C5-2 E5-2 G#5-2 B5-2 E6-2 r-2' }
      ]
    };
  })();

  /* Chefe do capítulo 2: o "Dies Irae" no órgão e nos metais, sobre bateria acelerada (ré menor) */
  S.boss2 = {
    bpm: 160, spb: 4,
    tracks: [
      { d: true, n: '((k-2 h-1 h-1 s-2 h-2 k-1 k-1 h-2 s-2 h-2)*3 k-1 k-1 s-1 s-1 S-2 s-1 s-1 T-2 T-2 t-2 c-2)*3' },
      { i: 'bass', n: '(D2-2 D2-2 D3-2 D2-2 F2-2 D2-2 E2-2 C2-2)*6 (Bb1-2 Bb1-2 Bb2-2 Bb1-2 C2-2 C2-2 C3-2 C2-2)*2 (A1-2 A1-2 A2-2 A1-2 C#2-2 E2-2 A2-2 C#3-2)*2 (D2-2 D2-2 D3-2 D2-2 F2-2 D2-2 E2-2 C2-2)*2' },
      { i: 'organ', n: 'D3+F3+A3-32 D3+F3+A3-32 Bb2+D3+F3-16 C3+E3+G3-16 Bb2+D3+F3-32 A2+C#3+E3-32 D3+F3+A3-32' },
      { i: 'brass', n: 'F4+F5-4 E4+E5-4 F4+F5-4 D4+D5-4 E4+E5-4 C4+C5-4 D4+D5-8 F5-4 F5-4 G5-4 F5-4 E5-4 D5-4 C5-4 E5-4 F5-4 E5-4 D5-8 r-16 ' +
        'A5-4 G5-4 A5-4 F5-4 G5-4 E5-4 F5-8 D6-4 C6-4 Bb5-4 A5-4 G5-4 F5-4 E5-4 C#5-4 D5-16 r-16' },
      { i: 'choir', vel: 0.9, n: 'D4+A4-48 C4+G4-16 D4+A4-32 r-32 Bb3+F4-32 A3+E4-32' },
      { i: 'arp', vel: 0.6, n: '(D5-1 A4-1 F4-1 A4-1)*24 (Bb4-1 F4-1 D4-1 F4-1)*8 (A4-1 E4-1 C#4-1 E4-1)*8 (D5-1 A4-1 F4-1 A4-1)*8' }
    ]
  };

  /* A lenda contada pela Dona Frida: caixinha de música e flauta (mi menor) */
  S.lore = {
    bpm: 72, spb: 4,
    tracks: [
      { i: 'pad', vel: 0.9, n: '(E3+G3+B3-32 C3+E3+G3-32 A2+C3+E3-32 B2+D#3+F#3-32)*2' },
      { i: 'bass', vel: 0.55, n: '(E2-32 C2-32 A1-32 B1-32)*2' },
      { i: 'musicbox', n: 'B4-4 E5-4 G5-4 F#5-4 E5-8 B4-8 C5-4 E5-4 G5-4 A5-4 G5-8 E5-8 A4-4 C5-4 E5-4 D5-4 C5-8 A4-8 B4-4 D#5-4 F#5-4 A5-4 G5-8 F#5-8 ' +
        'E5-4 G5-4 B5-4 A5-4 G5-8 E5-8 E5-4 G5-4 C6-4 B5-4 G5-8 E5-8 C5-4 E5-4 A5-4 G5-4 E5-8 C5-8 B4-4 F#5-4 D#5-4 F#5-4 E5-16' },
      { i: 'flute', vel: 0.55, n: 'r-128 B5-16 A5-16 G5-16 F#5-16 E5-32 D#5-16 F#5-16' }
    ]
  };

  /* A bandinha debaixo da terra: a valsa da estrada (a valsa do pai) tocada por metais e uma gaita desafinada */
  S.bandinha = {
    bpm: 84, spb: 4, vol: 0.85,
    tracks: [
      { i: 'bass', vel: 0.9, n: S.drive.tracks[0].n },
      { i: 'guitar', vel: 0.55, n: S.drive.tracks[1].n },
      { i: 'brass', vel: 0.9, n: S.drive.tracks[2].n },
      { i: 'accordion', vel: 0.55, tr: -0.35, n: S.drive.tracks[2].n },
      { i: 'bell', vel: 0.35, n: 'r-48 D6-48 r-48 A5-48' }
    ]
  };

  /* Caçada: tensão enquanto o Arno segue o rastro (pulsação grave e sinos distantes) */
  S.hunt = {
    bpm: 66, spb: 4,
    tracks: [
      { i: 'pad', vel: 0.8, n: 'A2+E3+C4-32 A2+D#3+C4-32 A2+E3+C4-32 G#2+D3+B3-32' },
      { i: 'bass', vel: 0.8, n: '(A1-4 r-12 A1-4 r-12)*2 (A1-4 r-12 G#1-4 r-12)*2' },
      { i: 'bell', vel: 0.45, n: 'r-24 E6-8 r-32 r-16 D#6-8 r-40' },
      { d: true, vel: 0.6, n: '(T~-4 r-12 T~-4 r-4 T~-4 r-4)*4' }
    ]
  };
})();
