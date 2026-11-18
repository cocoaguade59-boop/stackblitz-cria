'use strict';
// =====================================================================
//  AUDIO: chiptune sintetizado con WebAudio (sin archivos de sonido)
// =====================================================================
const NOTE = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 };
const mfreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
function parseNote(n) { // "c#5" -> midi
  const m = /^([a-g](?:#|b)?)(-?\d)$/.exec(n);
  return m ? NOTE[m[1]] + (parseInt(m[2], 10) + 1) * 12 : null;
}
// "e5.2 g5.2 r.4" (duración en semicorcheas)
function parseSeq(s) {
  return s.trim().split(/\s+/).map((tok) => {
    const [n, d] = tok.split('.');
    if (n === 'k' || n === 's' || n === 'h') return { m: null, k: n, d: parseInt(d || '2', 10) };
    return { m: n === 'r' ? null : parseNote(n), d: parseInt(d || '2', 10) };
  });
}
function chordNotes(name, oct = 3) {
  const m = /^([A-G](?:#|b)?)(m?)(7?)$/.exec(name);
  const root = NOTE[m[1].toLowerCase()] + (oct + 1) * 12;
  const third = m[2] ? 3 : 4;
  const n = [root, root + third, root + 7];
  if (m[3]) n.push(root + 10);
  return n;
}
// Canción a partir de progresión de acordes + melodía escrita a mano
function song(bpm, prog, melody, o = {}) {
  const bars = prog.length;
  const bass = [], arp = [];
  for (const ch of prog) {
    const n = chordNotes(ch, o.bassOct ?? 2);
    const pat = o.bassPat || [0, 2, 0, 2]; // índice del acorde por corchea x2
    for (let i = 0; i < 4; i++) { bass.push({ m: n[pat[i] % n.length], d: 3 }); bass.push({ m: null, d: 1 }); }
    const a = chordNotes(ch, o.arpOct ?? 4);
    for (let i = 0; i < 16; i++) arp.push({ m: a[(o.arpPat || [0, 1, 2, 1])[i % 4] % a.length], d: 1 });
  }
  // la melodía se ajusta al largo exacto de la progresión (relleno con silencio o recorte)
  const mel = parseSeq(melody); const want = bars * 16; let tot = 0; const fit = [];
  for (const n of mel) { if (tot >= want) break; const d = Math.min(n.d, want - tot); fit.push({ ...n, d }); tot += d; }
  if (tot < want) fit.push({ m: null, d: want - tot });
  const tracks = [
    { wave: o.lead || 'square', vol: o.leadVol ?? 0.11, seq: fit },
    { wave: 'triangle', vol: o.bassVol ?? 0.22, seq: bass },
  ];
  if (!o.noArp) tracks.push({ wave: o.arpWave || 'square', vol: o.arpVol ?? 0.035, seq: arp });
  if (o.drums) tracks.push({ drums: true, vol: 0.12, seq: parseSeq(o.drums.repeat(bars)) });
  return { bpm, tracks, loop: o.loop !== false };
}

const SONGS = {
  title: song(100, ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    'e5.4 g5.2 c6.4 b5.2 a5.2 g5.2 a5.4 e5.4 c5.4 r.4 f5.4 a5.2 c6.4 a5.2 g5.4 d5.4 g5.4 r.4 ' +
    'e5.4 g5.2 c6.4 d6.2 e6.4 d6.2 c6.2 a5.4 c6.4 r.4 f5.2 g5.2 a5.4 b5.4 c6.8 r.8', { drums: 'k.4 h.4 s.4 h.4 ' }),
  town: song(112, ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C'],
    'a4.2 c5.2 f5.4 e5.2 d5.2 c5.4 e5.2 g5.2 c6.4 r.4 d5.2 f5.2 a5.4 g5.2 f5.2 d5.4 bb4.4 d5.4 r.4 ' +
    'a4.2 c5.2 f5.4 g5.2 a5.2 g5.4 e5.4 c5.4 r.4 bb4.2 d5.2 f5.4 d5.4 c5.4 e5.4 g5.4 r.4', { arpPat: [0, 2, 1, 2], drums: 'k.4 h.4 s.4 h.4 ' }),
  route: song(132, ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D'],
    'g4.2 b4.2 d5.2 g5.2 f#5.4 e5.2 d5.2 e5.4 b4.4 g4.4 r.4 c5.2 e5.2 g5.2 c6.2 b5.4 a5.4 a5.2 f#5.2 d5.4 r.4 ' +
    'g5.2 f#5.2 e5.2 d5.2 b4.4 d5.4 e5.4 g5.4 b5.4 r.4 c6.4 b5.2 a5.2 g5.4 e5.4 f#5.4 a5.4 d6.4 r.4', { drums: 'k.2 h.2 s.2 h.2 k.2 k.2 s.2 h.2 ' }),
  cave: song(90, ['Am', 'Am', 'F', 'E', 'Dm', 'Am', 'E', 'E'],
    'a4.6 c5.2 e5.4 d5.4 c5.6 b4.2 a4.8 f4.4 a4.4 c5.4 a4.4 g#4.8 e4.8 d5.6 f5.2 a5.4 f5.4 e5.8 c5.8 b4.4 g#4.4 e4.4 b4.4 g#4.16',
    { lead: 'triangle', leadVol: 0.2, arpVol: 0.03, arpPat: [0, 2, 1, 2] }),
  battle: song(168, ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E'],
    'a5.2 a5.2 e5.2 a5.2 c6.2 b5.2 a5.2 g5.2 f5.2 a5.2 c6.4 a5.4 r.4 g5.2 b5.2 d6.4 b5.2 g5.2 e5.4 g#5.4 b5.4 e6.4 r.4 ' +
    'a5.2 c6.2 e6.4 d6.2 c6.2 b5.4 a5.4 f5.4 c6.4 r.4 d5.2 f5.2 a5.2 d6.2 c6.4 a5.4 b5.4 g#5.4 e5.4 r.4',
    { bassPat: [0, 0, 2, 0], drums: 'k.2 h.2 s.2 h.2 k.2 h.2 s.2 s.2 ' }),
  leader: song(176, ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A7'],
    'd5.2 f5.2 a5.2 d6.2 c6.4 a5.4 bb5.2 a5.2 g5.2 f5.2 d5.4 r.4 e5.2 g5.2 c6.4 e6.4 c6.4 c#6.4 a5.4 e5.4 r.4 ' +
    'f5.2 a5.2 d6.4 f6.4 e6.2 d6.2 bb5.4 d6.4 f6.4 r.4 g5.2 bb5.2 d6.4 c6.2 bb5.2 a5.4 c#6.4 e6.4 a6.4 r.4',
    { bassPat: [0, 0, 1, 2], drums: 'k.2 k.2 s.2 h.2 k.2 h.2 s.2 s.2 ' }),
  castle: song(96, ['Cm', 'Ab', 'Eb', 'G', 'Cm', 'Ab', 'Fm', 'G'],
    'c5.4 eb5.4 g5.6 f5.2 eb5.4 d5.4 c5.8 eb5.4 g5.4 bb5.6 ab5.2 g5.8 d5.4 f5.4 g5.8 ' +
    'c6.4 bb5.4 ab5.6 g5.2 f5.4 eb5.4 ab5.8 c5.4 f5.4 ab5.4 g5.4 f5.4 d5.4 b4.8',
    { lead: 'triangle', leadVol: 0.2, arpPat: [0, 1, 2, 1], drums: 'k.8 s.8 ' }),
  king: song(184, ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Fm', 'Ab', 'G7'],
    'c6.2 g5.2 eb5.2 g5.2 c6.2 d6.2 eb6.4 ab5.2 c6.2 eb6.4 d6.2 c6.2 bb5.2 d6.2 f6.4 d6.4 bb5.4 b5.2 d6.2 g6.4 f6.2 d6.2 b5.4 ' +
    'c6.2 eb6.2 g6.4 f6.2 eb6.2 d6.4 f5.2 ab5.2 c6.4 f6.4 eb6.4 c6.2 ab5.2 eb6.4 c6.4 ab5.4 g5.2 b5.2 d6.2 f6.2 g6.8',
    { bassPat: [0, 0, 2, 0], drums: 'k.2 k.2 s.2 k.2 k.2 h.2 s.2 s.2 ' }),
  victory: song(150, ['C', 'F', 'G', 'C'],
    'c5.2 e5.2 g5.2 c6.6 b5.2 a5.2 g5.4 f5.2 a5.2 c6.4 r.4 d6.2 c6.2 b5.2 a5.2 g5.4 b5.4 c6.8 r.8', { drums: 'k.4 h.4 s.4 h.4 ' }),
  credits: song(104, ['F', 'Am', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C', 'Bb', 'C', 'Am', 'Dm', 'Gm', 'C', 'F', 'F'],
    'c5.4 f5.4 a5.6 g5.2 f5.4 e5.4 c5.8 d5.4 f5.4 bb5.6 a5.2 g5.8 r.8 c5.4 f5.4 a5.6 c6.2 d6.4 c6.4 a5.8 ' +
    'bb5.4 a5.4 g5.4 f5.4 g5.8 c5.8 d5.4 f5.4 bb5.8 c6.4 bb5.4 a5.8 c6.4 a5.4 f5.8 d5.4 f5.4 a5.8 ' +
    'g5.4 bb5.4 d6.8 c6.4 bb5.4 g5.8 f5.16 r.16', { arpPat: [0, 1, 2, 1], drums: 'k.4 h.4 s.4 h.4 ' }),
};

const Sound = {
  ctx: null, master: null, music: null, sfx: null, muted: false, cur: null, curName: null, noise: null,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.8; this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain(); this.music.gain.value = 0.7; this.music.connect(this.master);
    this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
    const len = this.ctx.sampleRate * 0.5; const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    setInterval(() => this.schedule(), 40);
    if (this.pending) { const p = this.pending; this.pending = null; this.play(p); }
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.8;
    try { localStorage.setItem('st_mute', this.muted ? '1' : '0'); } catch (e) { /* sin storage */ }
  },
  play(name) {
    if (this.curName === name) return;
    this.curName = name;
    if (!this.ctx) { this.pending = name; return; }
    const s = SONGS[name];
    if (this.cur) this.cur.stopAt = this.ctx.currentTime;
    if (!s) { this.cur = null; return; }
    const t0 = this.ctx.currentTime + 0.08;
    this.cur = { s, tracks: s.tracks.map((tr) => ({ tr, i: 0, t: t0 })), stopAt: Infinity };
  },
  stop() { this.play(null); },
  schedule() {
    const c = this.cur; if (!c || !this.ctx) return;
    const ahead = this.ctx.currentTime + 0.25, sx = 60 / c.s.bpm / 4;
    for (const st of c.tracks) {
      let guard = 0;
      while (st.t < ahead && guard++ < 64) {
        if (st.i >= st.tr.seq.length) { if (!c.s.loop) { st.done = true; break; } st.i = 0; }
        const n = st.tr.seq[st.i++]; const dur = n.d * sx;
        if (n.m != null || st.tr.drums) this.note(st.tr, n, st.t, dur);
        st.t += dur;
      }
    }
    if (!c.s.loop && c.tracks.every((t) => t.done)) { this.cur = null; }
  },
  note(tr, n, t, dur) {
    const ctx = this.ctx;
    if (tr.drums) {
      return this.drum(n, t, tr.vol);
    }
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = tr.wave; o.frequency.value = mfreq(n.m);
    const v = tr.vol;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01);
    g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur * 0.95);
    o.connect(g); g.connect(this.music); o.start(t); o.stop(t + dur);
  },
  drum(n, t, vol) {
    const kind = n.k;
    const ctx = this.ctx;
    if (kind === 'k') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(vol * 2.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g); g.connect(this.music); o.start(t); o.stop(t + 0.15);
    } else if (kind === 's' || kind === 'h') {
      const src = ctx.createBufferSource(); src.buffer = this.noise;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kind === 'h' ? 7000 : 1800;
      const g = ctx.createGain(); const len = kind === 'h' ? 0.03 : 0.09;
      g.gain.setValueAtTime(vol * (kind === 'h' ? 0.5 : 1.2), t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      src.connect(f); f.connect(g); g.connect(this.music); src.start(t); src.stop(t + len + 0.01);
    }
  },
  // ---- efectos ----
  tone(freqs, step = 0.06, wave = 'square', vol = 0.12, len) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      if (!f) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = wave; o.frequency.value = f;
      const t = t0 + i * step, d = len || step * 0.95;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + d + 0.02);
    });
  },
  noiseHit(len = 0.15, vol = 0.3, freq = 1200) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 3, t); f.frequency.exponentialRampToValueAtTime(freq / 4, t + len);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(f); f.connect(g); g.connect(this.sfx); src.start(t); src.stop(t + len + 0.02);
  },
  sfxPlay(name) {
    switch (name) {
      case 'blip': return this.tone([1320], 0.03, 'square', 0.06);
      case 'select': return this.tone([880, 1320], 0.04, 'square', 0.08);
      case 'back': return this.tone([660, 440], 0.04, 'square', 0.07);
      case 'bump': return this.tone([90, 70], 0.05, 'triangle', 0.25);
      case 'door': this.noiseHit(0.12, 0.15, 500); return this.tone([220, 330], 0.06, 'triangle', 0.2);
      case 'hit': return this.noiseHit(0.16, 0.35, 1400);
      case 'super': this.noiseHit(0.25, 0.45, 2400); return this.tone([880, 1175, 1568], 0.04, 'square', 0.08);
      case 'weak': return this.noiseHit(0.1, 0.2, 600);
      case 'faint': return this.tone([660, 554, 440, 330, 220, 110], 0.08, 'square', 0.1);
      case 'levelup': return this.tone([523, 659, 784, 1047, 784, 1047], 0.07, 'square', 0.1);
      case 'heal': return this.tone([523, 659, 784, 659, 784, 1047, 0, 1047], 0.11, 'triangle', 0.25);
      case 'throw': return this.tone([400, 600, 800, 1000], 0.03, 'triangle', 0.2);
      case 'shake': return this.tone([180, 140], 0.04, 'triangle', 0.3);
      case 'caught': return this.tone([784, 0, 784, 988, 1175, 1568], 0.09, 'square', 0.1);
      case 'run': return this.tone([400, 300, 200], 0.05, 'triangle', 0.2);
      case 'exclaim': return this.tone([1568, 2093], 0.05, 'square', 0.08);
      case 'item': return this.tone([1047, 1319, 1568, 2093], 0.07, 'square', 0.09);
      case 'stat_up': return this.tone([440, 554, 659, 880], 0.04, 'triangle', 0.25);
      case 'stat_down': return this.tone([880, 659, 554, 440], 0.04, 'triangle', 0.25);
      case 'status': return this.tone([300, 600, 300, 600], 0.04, 'square', 0.07);
      case 'evolve': return this.tone([523, 587, 659, 698, 784, 880, 988, 1047], 0.12, 'triangle', 0.25);
      case 'wrong': return this.tone([220, 180], 0.12, 'square', 0.1);
      case 'right': return this.tone([988, 1319], 0.08, 'square', 0.1);
    }
  },
};
try { Sound.muted = localStorage.getItem('st_mute') === '1'; } catch (e) { /* sin storage */ }
const sfx = (n) => Sound.sfxPlay(n);
