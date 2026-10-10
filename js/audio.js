'use strict';
/* Teewald City — áudio: síntese estilo SNES (eco do DSP, filtro suave), sequenciador e efeitos */
(function () {
  var A = TC.audio = { ctx: null, ready: false, muted: false };
  var ctx, master, musicBus, sfxBus, echoIn, noiseBuf, waves = {};
  var current = null;       // música atual
  var timer = null;

  A.init = function () {
    if (A.ctx) {
      if (A.ctx.state === 'suspended') A.ctx.resume();
      return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = A.ctx = new AC(); } catch (e) { return; }

    master = ctx.createGain();
    master.gain.value = 0.9;
    var lp = ctx.createBiquadFilter();       // o SNES tinha um som levemente abafado
    lp.type = 'lowpass';
    lp.frequency.value = 11000;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(lp);
    lp.connect(comp);
    comp.connect(ctx.destination);

    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    A.setVolumes();

    // eco/reverb característico do DSP do SNES
    echoIn = ctx.createGain();
    var delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.23;
    var fb = ctx.createGain();
    fb.gain.value = 0.42;
    var elp = ctx.createBiquadFilter();
    elp.type = 'lowpass';
    elp.frequency.value = 2400;
    var wet = ctx.createGain();
    wet.gain.value = 0.34;
    echoIn.connect(delay);
    delay.connect(elp);
    elp.connect(fb);
    fb.connect(delay);
    elp.connect(wet);
    wet.connect(master);

    // ruído branco
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // ondas de pulso
    waves.pulse25 = pulseWave(0.25);
    waves.pulse12 = pulseWave(0.125);
    waves.organ = harmonicWave([1, 0.6, 0.4, 0.25, 0.12, 0.08]);
    waves.reed = harmonicWave([1, 0.7, 0.55, 0.45, 0.3, 0.28, 0.2, 0.15, 0.1]);

    A.ready = true;
    timer = setInterval(schedule, 25);
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
    if (A._pending) { var p = A._pending; A._pending = null; A.music(p); }
  };

  A.setVolumes = function () {
    if (!ctx) return;
    var m = A.muted ? 0 : TC.opts.music / 10;
    var s = A.muted ? 0 : TC.opts.sfx / 10;
    musicBus.gain.setTargetAtTime(m * 0.85, ctx.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(s, ctx.currentTime, 0.05);
  };
  A.toggleMute = function () { A.muted = !A.muted; A.setVolumes(); };

  function pulseWave(duty) {
    var n = 64, re = new Float32Array(n), im = new Float32Array(n);
    for (var k = 1; k < n; k++) re[k] = Math.sin(k * Math.PI * duty) / k;
    return ctx.createPeriodicWave(re, im);
  }
  function harmonicWave(h) {
    var re = new Float32Array(h.length + 1), im = new Float32Array(h.length + 1);
    for (var i = 0; i < h.length; i++) im[i + 1] = h[i];
    return ctx.createPeriodicWave(re, im);
  }
  function setWave(o, w) {
    if (waves[w]) o.setPeriodicWave(waves[w]);
    else o.type = w;
  }

  /* ---------- instrumentos ---------- */
  var INST = {
    bell: { wave: 'sine', partials: [[1, 1], [2.76, 0.32], [5.4, 0.1]], a: 0.002, d: 1.4, s: 0, r: 0.5, gain: 0.2, echo: 0.6 },
    musicbox: { wave: 'triangle', partials: [[1, 1], [4, 0.12]], a: 0.001, d: 0.9, s: 0, r: 0.3, gain: 0.24, echo: 0.6 },
    pad: { wave: 'sawtooth', detune: [-8, 8], a: 0.7, d: 0.6, s: 0.75, r: 1.2, gain: 0.05, filter: { type: 'lowpass', f: 850, q: 0.6 }, echo: 0.45 },
    strings: { wave: 'sawtooth', detune: [-6, 5], a: 0.25, d: 0.3, s: 0.8, r: 0.5, gain: 0.05, filter: { type: 'lowpass', f: 1500, q: 0.8 }, echo: 0.4, vib: { rate: 5, depth: 8, delay: 0.25 } },
    choir: { wave: 'triangle', detune: [-10, 0, 10], a: 0.5, d: 0.4, s: 0.8, r: 1.0, gain: 0.07, filter: { type: 'lowpass', f: 1300, q: 3 }, echo: 0.6, vib: { rate: 4.5, depth: 10, delay: 0.3 } },
    bass: { wave: 'triangle', a: 0.004, d: 0.25, s: 0.75, r: 0.08, gain: 0.34 },
    sqbass: { wave: 'pulse25', a: 0.003, d: 0.12, s: 0.55, r: 0.05, gain: 0.11, filter: { type: 'lowpass', f: 1100, q: 1 } },
    slap: { wave: 'sawtooth', a: 0.002, d: 0.18, s: 0.3, r: 0.05, gain: 0.12, filter: { type: 'lowpass', f: 700, q: 4 } },
    lead: { wave: 'pulse25', a: 0.01, d: 0.25, s: 0.65, r: 0.15, gain: 0.075, vib: { rate: 5.5, depth: 14, delay: 0.18 }, echo: 0.5 },
    lead2: { wave: 'square', a: 0.01, d: 0.2, s: 0.5, r: 0.1, gain: 0.05, filter: { type: 'lowpass', f: 2600, q: 1 }, vib: { rate: 6, depth: 10, delay: 0.12 }, echo: 0.45 },
    flute: { wave: 'sine', partials: [[1, 1], [2, 0.12]], a: 0.04, d: 0.2, s: 0.8, r: 0.15, gain: 0.16, vib: { rate: 5, depth: 12, delay: 0.2 }, echo: 0.5 },
    accordion: { wave: 'reed', detune: [-7, 7], a: 0.03, d: 0.1, s: 0.85, r: 0.09, gain: 0.07, filter: { type: 'lowpass', f: 2800, q: 1.5 }, trem: { rate: 5.8, depth: 0.22 }, echo: 0.35 },
    pluck: { wave: 'triangle', partials: [[1, 1], [2, 0.3]], a: 0.002, d: 0.3, s: 0, r: 0.1, gain: 0.16, echo: 0.3 },
    guitar: { wave: 'sawtooth', a: 0.002, d: 0.35, s: 0.05, r: 0.1, gain: 0.07, filter: { type: 'lowpass', f: 1600, q: 2 }, echo: 0.25 },
    organ: { wave: 'organ', partials: [[1, 1], [0.5, 0.5]], a: 0.06, d: 0.2, s: 0.9, r: 0.5, gain: 0.07, echo: 0.55, vib: { rate: 6.5, depth: 4, delay: 0 } },
    brass: { wave: 'sawtooth', detune: [-4, 4], a: 0.04, d: 0.2, s: 0.7, r: 0.12, gain: 0.06, filter: { type: 'lowpass', f: 1800, q: 2 }, echo: 0.35 },
    arp: { wave: 'pulse12', a: 0.002, d: 0.1, s: 0.2, r: 0.05, gain: 0.05, echo: 0.55 }
  };
  A.INST = INST;

  function playNote(I, t, f, dur, vel, dest) {
    vel = vel == null ? 1 : vel;
    var g = ctx.createGain();
    g.gain.value = 0;
    var out = g, end;
    if (I.trem) {
      var tg = ctx.createGain();
      tg.gain.value = 1 - I.trem.depth / 2;
      var tl = ctx.createOscillator();
      tl.frequency.value = I.trem.rate;
      var tla = ctx.createGain();
      tla.gain.value = I.trem.depth / 2;
      tl.connect(tla);
      tla.connect(tg.gain);
      g.connect(tg);
      out = tg;
      tl.start(t);
      tl.stop(t + dur + I.r * 3 + 0.1);
    }
    if (I.filter) {
      var flt = ctx.createBiquadFilter();
      flt.type = I.filter.type;
      flt.frequency.value = I.filter.f;
      flt.Q.value = I.filter.q || 0.7;
      out.connect(flt);
      out = flt;
    }
    out.connect(dest);
    if (I.echo) {
      var es = ctx.createGain();
      es.gain.value = I.echo;
      out.connect(es);
      es.connect(echoIn);
    }
    var parts = I.partials || [[1, 1]];
    var det = I.detune || [0];
    var oscs = [];
    for (var p = 0; p < parts.length; p++) {
      for (var k = 0; k < det.length; k++) {
        var o = ctx.createOscillator();
        setWave(o, I.wave);
        o.frequency.value = f * parts[p][0];
        o.detune.value = det[k];
        var pg = ctx.createGain();
        pg.gain.value = parts[p][1] / det.length;
        o.connect(pg);
        pg.connect(g);
        oscs.push(o);
      }
    }
    end = t + Math.max(dur, I.a + 0.01);
    var stopAt = end + I.r * 4 + 0.05;
    if (I.vib) {
      var lfo = ctx.createOscillator();
      lfo.frequency.value = I.vib.rate;
      var lg = ctx.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(0, t + I.vib.delay);
      lg.gain.linearRampToValueAtTime(I.vib.depth, t + I.vib.delay + 0.15);
      lfo.connect(lg);
      for (var j = 0; j < oscs.length; j++) lg.connect(oscs[j].detune);
      lfo.start(t);
      lfo.stop(stopAt);
    }
    var peak = I.gain * vel;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + I.a);
    g.gain.setTargetAtTime(peak * I.s, t + I.a, Math.max(0.01, I.d / 3));
    g.gain.setTargetAtTime(0, end, Math.max(0.01, I.r / 3));
    for (j = 0; j < oscs.length; j++) { oscs[j].start(t); oscs[j].stop(stopAt); }
  }

  function noiseSrc(t, dur, loop) {
    var s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = !!loop;
    var off = Math.random() * 1.0;
    if (loop) {
      s.start(t, off);
      if (dur) s.stop(t + dur);
    } else {
      s.start(t, off, Math.min(dur, 4 - off));
    }
    return s;
  }

  function drum(type, t, vel, dest) {
    vel = vel == null ? 1 : vel;
    var g, o, f, n;
    if (type === 'k') {
      o = ctx.createOscillator();
      g = ctx.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.85 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + 0.32);
    } else if (type === 's' || type === 'S') {
      n = noiseSrc(t, 0.25);
      f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.7;
      g = ctx.createGain();
      g.gain.setValueAtTime((type === 'S' ? 0.45 : 0.32) * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      n.connect(f); f.connect(g); g.connect(dest);
      var es = ctx.createGain(); es.gain.value = 0.25; g.connect(es); es.connect(echoIn);
      o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(190, t);
      o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
      var og = ctx.createGain();
      og.gain.setValueAtTime(0.3 * vel, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(og); og.connect(dest);
      o.start(t); o.stop(t + 0.12);
    } else if (type === 'h' || type === 'o') {
      n = noiseSrc(t, 0.4);
      f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 7000;
      g = ctx.createGain();
      var len = type === 'o' ? 0.25 : 0.045;
      g.gain.setValueAtTime(0.12 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      n.connect(f); f.connect(g); g.connect(dest);
    } else if (type === 't' || type === 'T') {
      o = ctx.createOscillator();
      g = ctx.createGain();
      var base = type === 'T' ? 90 : 140;
      o.frequency.setValueAtTime(base * 1.6, t);
      o.frequency.exponentialRampToValueAtTime(base, t + 0.15);
      g.gain.setValueAtTime(0.5 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + 0.4);
    } else if (type === 'c') {
      n = noiseSrc(t, 1.6);
      f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 3500;
      g = ctx.createGain();
      g.gain.setValueAtTime(0.16 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      n.connect(f); f.connect(g); g.connect(dest);
      var ce = ctx.createGain(); ce.gain.value = 0.4; g.connect(ce); ce.connect(echoIn);
    }
  }

  /* ---------- sequenciador ---------- */
  var NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freqOf(name) {
    var m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    if (!m) return 0;
    var n = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    var midi = 12 * (parseInt(m[3], 10) + 1) + n;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  A.freqOf = freqOf;

  function parseTrack(str) {
    var re = /\(([^()]*)\)\*(\d+)/;
    while (re.test(str)) {
      str = str.replace(re, function (m, inner, n) {
        var out = [];
        for (var i = 0; i < +n; i++) out.push(inner);
        return out.join(' ');
      });
    }
    var toks = str.trim().split(/\s+/);
    var step = 0, last = 4, ev = [];
    toks.forEach(function (tok) {
      if (!tok) return;
      var parts = tok.split('-');
      var name = parts[0];
      var len = parts[1] ? parseFloat(parts[1]) : last;
      var vel = 1;
      if (name.charAt(name.length - 1) === '!') { vel = 1.35; name = name.slice(0, -1); }
      if (name.charAt(name.length - 1) === '~') { vel = 0.6; name = name.slice(0, -1); }
      last = len;
      if (name !== 'r' && name !== '') ev.push({ step: step, len: len, name: name, vel: vel });
      step += len;
    });
    return { ev: ev, total: step };
  }

  function startSong(song) {
    var spb = song.spb || 4;
    var stepDur = 60 / song.bpm / spb;
    var bus = ctx.createGain();
    bus.gain.value = song.vol == null ? 1 : song.vol;
    bus.connect(musicBus);
    var t0 = ctx.currentTime + 0.08;
    var tracks = song.tracks.map(function (tr) {
      var p = tr._p || (tr._p = parseTrack(tr.n));
      return { def: tr, ev: p.ev, total: p.total, i: 0, base: t0 + (tr.offset || 0) * stepDur, done: p.ev.length === 0 };
    });
    return { song: song, stepDur: stepDur, bus: bus, tracks: tracks, loop: song.loop !== false };
  }

  function schedule() {
    if (!ctx || !current) return;
    var now = ctx.currentTime, ahead = now + 0.16;
    var cur = current;
    cur.tracks.forEach(function (tr) {
      var guard = 0;
      while (!tr.done && guard++ < 64) {
        var e = tr.ev[tr.i];
        var t = tr.base + e.step * cur.stepDur;
        if (t > ahead) break;
        if (t >= now - 0.03) fire(tr.def, e, t, cur);
        tr.i++;
        if (tr.i >= tr.ev.length) {
          if (!cur.loop) { tr.done = true; break; }
          tr.i = 0;
          tr.base += tr.total * cur.stepDur;
        }
      }
    });
  }

  function fire(def, e, t, cur) {
    var dur = e.len * cur.stepDur * (def.legato || 0.92);
    var vel = (def.vel || 1) * e.vel;
    if (def.d) {
      var names = e.name.split('+');
      names.forEach(function (nm) { drum(nm, t, vel, cur.bus); });
      return;
    }
    var I = INST[def.i];
    var notes = e.name.split('+');
    notes.forEach(function (nm) {
      var f = freqOf(nm);
      if (f) playNote(I, t, f * (def.tr ? Math.pow(2, def.tr / 12) : 1), dur, vel, cur.bus);
    });
  }

  A.music = function (name, fade) {
    if (!ctx) { A._pending = name; return; }
    var song = TC.SONGS[name];
    if (!song) return;
    if (current && current.song === song) return;
    A.stopMusic(fade == null ? 0.4 : fade);
    current = startSong(song);
    current.name = name;
  };
  A.stopMusic = function (fade) {
    if (!ctx) { A._pending = null; return; }
    if (!current) return;
    var old = current;
    current = null;
    fade = fade == null ? 0.5 : fade;
    old.bus.gain.setTargetAtTime(0, ctx.currentTime, Math.max(0.01, fade / 3));
    setTimeout(function () { try { old.bus.disconnect(); } catch (e) { /* ok */ } }, fade * 1000 + 600);
  };
  A.musicName = function () { return current ? current.name : null; };

  /* ---------- efeitos sonoros ---------- */
  function env(g, t, peak, a, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(type, f0, f1, t, dur, peak, dest, echo) {
    var o = ctx.createOscillator();
    setWave(o, type);
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    var g = ctx.createGain();
    env(g, t, peak, 0.005, dur);
    o.connect(g);
    g.connect(dest || sfxBus);
    if (echo) { var e = ctx.createGain(); e.gain.value = echo; g.connect(e); e.connect(echoIn); }
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, ftype, f0, f1, q, echo) {
    var n = noiseSrc(t, dur + 0.1);
    var f = ctx.createBiquadFilter();
    f.type = ftype || 'lowpass';
    f.frequency.setValueAtTime(f0 || 2000, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q || 0.8;
    var g = ctx.createGain();
    env(g, t, peak, 0.005, dur);
    n.connect(f); f.connect(g); g.connect(sfxBus);
    if (echo) { var e = ctx.createGain(); e.gain.value = echo; g.connect(e); e.connect(echoIn); }
    return g;
  }

  var SFX = {
    jump: function (t) { osc('pulse25', 260, 620, t, 0.12, 0.12); },
    land: function (t) { noise(t, 0.06, 0.18, 'lowpass', 600, 200); },
    swing: function (t) { noise(t, 0.09, 0.14, 'bandpass', 900, 2600, 1.2); },
    swing2: function (t) { noise(t, 0.12, 0.18, 'bandpass', 600, 2000, 1.5); },
    hit: function (t) {
      osc('square', 220, 50, t, 0.1, 0.22);
      noise(t, 0.08, 0.35, 'lowpass', 3000, 400);
    },
    hit2: function (t) {
      osc('square', 160, 40, t, 0.16, 0.26);
      noise(t, 0.14, 0.4, 'lowpass', 2500, 200);
      osc('sine', 90, 40, t, 0.2, 0.4);
    },
    hurt: function (t) { osc('sawtooth', 520, 110, t, 0.25, 0.16); noise(t, 0.1, 0.2, 'bandpass', 1200, 400); },
    die: function (t) { osc('sawtooth', 300, 40, t, 0.9, 0.18, null, 0.4); },
    ghostDie: function (t) {
      osc('sine', 1400, 200, t, 0.6, 0.12, null, 0.7);
      osc('sine', 1430, 210, t + 0.02, 0.6, 0.08, null, 0.7);
      noise(t, 0.4, 0.12, 'highpass', 3000, 6000);
    },
    flameDie: function (t) {
      noise(t, 0.5, 0.35, 'lowpass', 2500, 150);
      osc('sawtooth', 200, 60, t, 0.4, 0.15);
    },
    flame: function (t) { noise(t, 0.35, 0.16, 'bandpass', 400, 1500, 0.7); },
    screech: function (t) {
      var o = osc('sawtooth', 900, 1500, t, 0.4, 0.07, null, 0.5);
      var l = ctx.createOscillator(); l.frequency.value = 28;
      var lg = ctx.createGain(); lg.gain.value = 300; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 0.45);
    },
    ghost: function (t) {
      var o = osc('sine', 500, 380, t, 0.8, 0.06, null, 0.8);
      var l = ctx.createOscillator(); l.frequency.value = 6;
      var lg = ctx.createGain(); lg.gain.value = 30; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 0.85);
    },
    caw: function (t) {
      [0, 0.18].forEach(function (d) {
        var o = osc('sawtooth', 820, 520, t + d, 0.14, 0.09);
        var l = ctx.createOscillator(); l.frequency.value = 40;
        var lg = ctx.createGain(); lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency);
        l.start(t + d); l.stop(t + d + 0.16);
      });
    },
    pickup: function (t) {
      osc('pulse25', 660, 660, t, 0.07, 0.1);
      osc('pulse25', 880, 880, t + 0.07, 0.07, 0.1);
      osc('pulse25', 1320, 1320, t + 0.14, 0.15, 0.1, null, 0.4);
    },
    coin: function (t) {
      osc('square', 988, 988, t, 0.06, 0.07);
      osc('square', 1319, 1319, t + 0.06, 0.25, 0.07, null, 0.4);
    },
    heal: function (t) {
      [523, 659, 784, 1047].forEach(function (f, i) { osc('triangle', f, f, t + i * 0.06, 0.2, 0.16, null, 0.4); });
    },
    oneup: function (t) {
      [784, 988, 1175, 1568, 1319, 1568].forEach(function (f, i) { osc('pulse25', f, f, t + i * 0.08, 0.12, 0.09, null, 0.4); });
    },
    break: function (t) {
      noise(t, 0.25, 0.4, 'lowpass', 1800, 300);
      osc('square', 140, 60, t, 0.12, 0.15);
      for (var i = 0; i < 4; i++) noise(t + 0.03 + i * 0.04, 0.04, 0.12, 'bandpass', 1500 + i * 400, 900, 3);
    },
    blip: function (t, p) { osc('pulse25', p || 640, p || 640, t, 0.025, 0.045); },
    select: function (t) { osc('pulse25', 880, 880, t, 0.05, 0.08); },
    confirm: function (t) { osc('pulse25', 660, 660, t, 0.06, 0.09); osc('pulse25', 990, 990, t + 0.06, 0.12, 0.09, null, 0.4); },
    cancel: function (t) { osc('pulse25', 500, 300, t, 0.1, 0.09); },
    pause: function (t) { osc('pulse25', 1046, 1046, t, 0.06, 0.08); osc('pulse25', 784, 784, t + 0.07, 0.06, 0.08); osc('pulse25', 1046, 1046, t + 0.14, 0.1, 0.08); },
    go: function (t) { osc('pulse25', 880, 880, t, 0.08, 0.1); osc('pulse25', 880, 880, t + 0.16, 0.08, 0.1); },
    checkpoint: function (t) {
      [523, 784, 1047].forEach(function (f, i) { osc('sine', f, f, t + i * 0.12, 0.9, 0.12, null, 0.6); });
    },
    crash: function (t) {
      noise(t, 1.6, 0.9, 'lowpass', 5000, 120, 0.5, 0.5);
      osc('sine', 80, 25, t, 1.2, 0.9);
      osc('square', 120, 30, t, 0.5, 0.25);
      for (var i = 0; i < 14; i++) {
        var f = 2500 + Math.random() * 4000;
        osc('sine', f, f * 0.9, t + 0.1 + Math.random() * 0.9, 0.12 + Math.random() * 0.2, 0.05, null, 0.5);
      }
      noise(t + 0.4, 1.0, 0.3, 'bandpass', 3000, 900, 2);
    },
    skid: function (t) {
      var o = osc('sawtooth', 1100, 900, t, 1.1, 0.06);
      var l = ctx.createOscillator(); l.frequency.value = 22;
      var lg = ctx.createGain(); lg.gain.value = 90; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.2);
      noise(t, 1.1, 0.14, 'bandpass', 2500, 1800, 2);
    },
    horn: function (t) {
      osc('sawtooth', 311, 311, t, 0.9, 0.08);
      osc('sawtooth', 370, 370, t, 0.9, 0.07);
    },
    heartbeat: function (t) {
      osc('sine', 70, 40, t, 0.18, 0.7);
      osc('sine', 65, 38, t + 0.24, 0.22, 0.55);
    },
    bell: function (t) {
      var base = 196;
      [[1, 0.5], [2, 0.3], [2.4, 0.22], [3, 0.16], [4.2, 0.1], [5.4, 0.06]].forEach(function (p) {
        osc('sine', base * p[0], base * p[0], t, 4.5 / p[0] + 0.6, p[1] * 0.5, null, 0.6);
      });
    },
    thunder: function (t) {
      noise(t, 2.5, 0.6, 'lowpass', 900, 60, 0.6, 0.4);
      noise(t + 0.1, 0.4, 0.3, 'lowpass', 3000, 300);
    },
    whoosh: function (t) { noise(t, 0.5, 0.18, 'bandpass', 300, 3000, 1.2, 0.4); },
    roar: function (t) {
      var o = osc('sawtooth', 110, 55, t, 1.4, 0.25, null, 0.5);
      var l = ctx.createOscillator(); l.frequency.value = 18;
      var lg = ctx.createGain(); lg.gain.value = 25; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.5);
      osc('sawtooth', 165, 70, t, 1.3, 0.12, null, 0.5);
      noise(t, 1.3, 0.25, 'bandpass', 500, 200, 1);
    },
    orb: function (t) { osc('sine', 300, 900, t, 0.25, 0.12, null, 0.5); osc('square', 150, 450, t, 0.2, 0.04); },
    laser: function (t) { osc('sawtooth', 1800, 200, t, 0.5, 0.08, null, 0.5); },
    explode: function (t) {
      noise(t, 0.8, 0.6, 'lowpass', 2400, 80, 0.6, 0.4);
      osc('sine', 120, 30, t, 0.6, 0.5);
    },
    spin: function (t) { noise(t, 0.35, 0.2, 'bandpass', 500, 3000, 2); osc('pulse25', 400, 900, t, 0.3, 0.06); },
    door: function (t) {
      var o = osc('sawtooth', 160, 110, t, 1.6, 0.06);
      var l = ctx.createOscillator(); l.frequency.value = 9;
      var lg = ctx.createGain(); lg.gain.value = 25; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.7);
    },
    step: function (t) { noise(t, 0.04, 0.06, 'lowpass', 900, 300); },
    gasp: function (t) { noise(t, 0.35, 0.12, 'bandpass', 1800, 900, 3); },
    /* ---- capítulo 2 ---- */
    shot: function (t) {
      noise(t, 0.09, 0.7, 'lowpass', 6000, 900, 0.7, 0.5);
      osc('sine', 140, 40, t, 0.22, 0.6);
      osc('square', 90, 30, t, 0.12, 0.2);
      noise(t + 0.06, 0.9, 0.12, 'lowpass', 1500, 200, 0.5, 0.6);
    },
    click: function (t) { osc('square', 1800, 1200, t, 0.02, 0.08); osc('square', 1400, 900, t + 0.06, 0.02, 0.06); },
    reload: function (t) {
      [0, 0.09, 0.18].forEach(function (d) { osc('square', 2200, 1600, t + d, 0.02, 0.07); noise(t + d, 0.03, 0.1, 'highpass', 4000, 5000); });
      osc('square', 900, 700, t + 0.3, 0.05, 0.1);
    },
    howl: function (t) {
      var o = osc('sawtooth', 330, 330, t, 1.9, 0.07, null, 0.7);
      o.frequency.setValueAtTime(300, t);
      o.frequency.linearRampToValueAtTime(620, t + 0.5);
      o.frequency.linearRampToValueAtTime(560, t + 1.3);
      o.frequency.linearRampToValueAtTime(420, t + 1.9);
      var l = ctx.createOscillator(); l.frequency.value = 6;
      var lg = ctx.createGain(); lg.gain.value = 9; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 2);
      osc('sine', 600, 1240, t, 1.6, 0.05, null, 0.7);
    },
    growl: function (t) {
      var o = osc('sawtooth', 80, 65, t, 0.7, 0.18);
      var l = ctx.createOscillator(); l.frequency.value = 23;
      var lg = ctx.createGain(); lg.gain.value = 18; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 0.75);
      noise(t, 0.6, 0.12, 'bandpass', 300, 180, 2);
    },
    saw: function (t) {
      var o = osc('sawtooth', 600, 1500, t, 1.2, 0.05, null, 0.3);
      var l = ctx.createOscillator(); l.frequency.value = 40;
      var lg = ctx.createGain(); lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.25);
      noise(t, 1.1, 0.08, 'bandpass', 3000, 5000, 3);
    },
    ribbon: function (t) {
      [1047, 1319, 1568, 2093, 2637].forEach(function (f, i) { osc('triangle', f, f, t + i * 0.07, 0.5, 0.09, null, 0.7); });
      osc('sine', 523, 523, t, 1.2, 0.08, null, 0.6);
    },
    demon: function (t) {
      var o = osc('sawtooth', 700, 160, t, 1.6, 0.18, null, 0.6);
      var l = ctx.createOscillator(); l.frequency.value = 31;
      var lg = ctx.createGain(); lg.gain.value = 140; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.65);
      osc('sawtooth', 1050, 240, t + 0.04, 1.5, 0.08, null, 0.6);
      noise(t, 1.4, 0.3, 'bandpass', 2400, 500, 1.4, 0.4);
    },
    skitter: function (t) {
      for (var i = 0; i < 6; i++) noise(t + i * 0.045 + Math.random() * 0.02, 0.025, 0.12, 'bandpass', 2600 + Math.random() * 1500, 1800, 4);
    },
    wood: function (t) {
      noise(t, 0.4, 0.4, 'lowpass', 1200, 150);
      osc('triangle', 120, 70, t, 0.3, 0.35);
      for (var i = 0; i < 3; i++) osc('triangle', 300 + i * 90, 200, t + 0.05 + i * 0.07, 0.08, 0.12);
    },
    /* ---- capítulo 3 ---- */
    bat: function (t) {
      [0, 0.07, 0.15].forEach(function (d) { osc('sine', 3200 + Math.random() * 800, 2600, t + d, 0.04, 0.05); });
      noise(t, 0.2, 0.05, 'highpass', 5000, 6000);
    },
    lift: function (t) {
      for (var i = 0; i < 4; i++) { osc('square', 90 - i * 8, 70, t + i * 0.12, 0.08, 0.12); noise(t + i * 0.12, 0.06, 0.15, 'bandpass', 900, 500, 3); }
      var o = osc('sawtooth', 70, 60, t, 1.2, 0.05);
      var l = ctx.createOscillator(); l.frequency.value = 7;
      var lg = ctx.createGain(); lg.gain.value = 8; l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + 1.25);
    },
    lasso: function (t) { noise(t, 0.18, 0.12, 'bandpass', 700, 1800, 2); noise(t + 0.2, 0.18, 0.1, 'bandpass', 700, 1800, 2); },
    bola: function (t) { for (var i = 0; i < 5; i++) noise(t + i * 0.07, 0.06, 0.12, 'bandpass', 500 + i * 120, 900, 3); },
    hoof: function (t) {
      osc('sine', 110, 40, t, 0.25, 0.6);
      noise(t, 0.08, 0.4, 'bandpass', 1800, 900, 2);
      osc('square', 240, 120, t + 0.02, 0.05, 0.12);
      noise(t + 0.05, 0.5, 0.25, 'lowpass', 800, 100, 0.6, 0.4);
    },
    sulfur: function (t) { noise(t, 0.9, 0.2, 'highpass', 2000, 5000, 0.7, 0.4); noise(t, 0.6, 0.12, 'lowpass', 600, 200); },
    drip: function (t) { osc('sine', 1400, 2200, t, 0.06, 0.06, null, 0.8); },
    tick: function (t) { osc('square', 3000, 3000, t, 0.01, 0.05); osc('square', 2400, 2400, t + 0.5, 0.01, 0.04); },
    bird: function (t) {
      // sabiá ao amanhecer
      var notes = [[1760, 0], [1980, 0.12], [1760, 0.24], [2350, 0.4], [2090, 0.55]];
      notes.forEach(function (n) { osc('sine', n[0], n[0] * 1.06, t + n[1], 0.09, 0.05, null, 0.5); });
    }
  };

  A.sfxNames = Object.keys(SFX);
  /* os capítulos novos registram os próprios efeitos (js/music_chN.js); o 3º argumento traz os sintetizadores */
  var SYN = { osc: osc, noise: noise, env: env, ctx: function () { return ctx; }, out: function () { return sfxBus; }, echo: function () { return echoIn; } };
  A.addSfx = function (name, fn) {
    SFX[name] = fn;
    if (A.sfxNames.indexOf(name) < 0) A.sfxNames.push(name);
  };
  A.sfx = function (name, p) {
    if (!ctx || !A.ready || ctx.state !== 'running') return;
    var fn = SFX[name];
    if (fn) fn(ctx.currentTime + 0.005, p, SYN);
  };

  /* estática de rádio (duração em segundos) */
  A.static = function (dur, vol) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var n = noiseSrc(t, dur, true);
    var f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.6;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    var v = vol || 0.12;
    for (var i = 0; i < dur * 12; i++) g.gain.setValueAtTime(v * (0.3 + Math.random() * 0.7), t + i / 12);
    g.gain.setValueAtTime(0, t + dur);
    n.connect(f); f.connect(g); g.connect(sfxBus);
  };

  /* ---------- motor do caminhão (contínuo) ---------- */
  var eng = null;
  A.engineStart = function () {
    if (!ctx || eng) return;
    var t = ctx.currentTime;
    var o1 = ctx.createOscillator(); o1.type = 'sawtooth';
    var o2 = ctx.createOscillator(); setWave(o2, 'pulse25');
    var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380; f.Q.value = 2;
    var g = ctx.createGain(); g.gain.value = 0;
    var n = noiseSrc(t, 0, true);
    var nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 180;
    var ng = ctx.createGain(); ng.gain.value = 0.35;
    o1.connect(f); o2.connect(f); n.connect(nf); nf.connect(ng); ng.connect(f);
    f.connect(g); g.connect(sfxBus);
    o1.start(t); o2.start(t);
    g.gain.setTargetAtTime(0.12, t, 0.5);
    eng = { o1: o1, o2: o2, f: f, g: g, n: n };
    A.engineSet(0.4);
  };
  A.engineSet = function (rpm, vol) {
    if (!eng) return;
    var t = ctx.currentTime;
    var base = 28 + rpm * 46;
    eng.o1.frequency.setTargetAtTime(base, t, 0.15);
    eng.o2.frequency.setTargetAtTime(base * 0.5, t, 0.15);
    eng.f.frequency.setTargetAtTime(240 + rpm * 900, t, 0.2);
    if (vol != null) eng.g.gain.setTargetAtTime(vol, t, 0.3);
  };
  A.engineStop = function (fade) {
    if (!eng) return;
    var e = eng; eng = null;
    var t = ctx.currentTime;
    fade = fade == null ? 0.05 : fade;
    e.g.gain.cancelScheduledValues(t);
    e.g.gain.setValueAtTime(e.g.gain.value, t);
    e.g.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(function () { try { e.o1.stop(); e.o2.stop(); e.n.stop(); } catch (x) { /* ok */ } }, fade * 1000 + 100);
  };

  /* ---------- ambiente noturno: vento + grilos ---------- */
  var amb = null;
  A.ambience = function (kind) {
    if (!ctx) return;
    A.ambienceStop();
    var t = ctx.currentTime;
    var n = noiseSrc(t, 0, true);
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    var g = ctx.createGain(); g.gain.value = 0;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    var lg = ctx.createGain(); lg.gain.value = 0.025;
    lfo.connect(lg); lg.connect(g.gain);
    var lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.07;
    var lg2 = ctx.createGain(); lg2.gain.value = 180;
    lfo2.connect(lg2); lg2.connect(f.frequency);
    n.connect(f); f.connect(g); g.connect(sfxBus);
    g.gain.setTargetAtTime(kind === 'windy' ? 0.06 : 0.035, t, 1.5);
    lfo.start(t); lfo2.start(t);
    amb = { n: n, g: g, lfo: lfo, lfo2: lfo2, crickets: kind !== 'windy' };
    amb.timer = setInterval(function () {
      if (!amb || !amb.crickets || !ctx || ctx.state !== 'running') return;
      if (Math.random() < 0.45) {
        var tt = ctx.currentTime + Math.random() * 0.3;
        var cf = 4200 + Math.random() * 600;
        for (var i = 0; i < 3; i++) {
          var o = ctx.createOscillator(); o.frequency.value = cf;
          var cg = ctx.createGain();
          env(cg, tt + i * 0.07, 0.012, 0.005, 0.04);
          o.connect(cg); cg.connect(sfxBus);
          o.start(tt + i * 0.07); o.stop(tt + i * 0.07 + 0.06);
        }
      }
    }, 700);
  };
  A.ambienceStop = function () {
    if (!amb) return;
    var a = amb; amb = null;
    clearInterval(a.timer);
    var t = ctx.currentTime;
    a.g.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(function () { try { a.n.stop(); a.lfo.stop(); a.lfo2.stop(); } catch (e) { /* ok */ } }, 2000);
  };
})();
