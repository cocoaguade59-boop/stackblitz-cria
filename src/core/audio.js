// Motor de audio: sintetizador de efectos de sonido con Web Audio API.
// Sin dependencias externas.

// === AUDIO ===
class SFX {
  constructor() {
    this.c = null;
    this.on = false;
  }
  init() {
    if (this.on) return;
    try {
      this.c = new (window.AudioContext || window.webkitAudioContext)();
      this.on = true;
    } catch (e) {}
  }
  n(f, d, t = 'square', v = 0.08) {
    if (!this.c) return;
    let o = this.c.createOscillator(),
      g = this.c.createGain();
    o.connect(g);
    g.connect(this.c.destination);
    o.type = t;
    o.frequency.setValueAtTime(f, this.c.currentTime);
    g.gain.setValueAtTime(v, this.c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.c.currentTime + d);
    o.start();
    o.stop(this.c.currentTime + d);
  }
  walk() {
    this.n(200, 0.05, 'square', 0.03);
  }
  sel() {
    this.n(440, 0.1);
    setTimeout(() => this.n(660, 0.1), 50);
  }
  atk() {
    this.n(150, 0.15, 'sawtooth', 0.1);
  }
  hit() {
    this.n(100, 0.2, 'sawtooth', 0.12);
  }
  heal() {
    this.n(523, 0.15, 'sine', 0.08);
    setTimeout(() => this.n(659, 0.15, 'sine', 0.08), 100);
  }
  lvl() {
    [523, 659, 784, 1047].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.2, 'square', 0.1), i * 120)
    );
  }
  win() {
    [523, 587, 659, 784, 880, 1047].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.25, 'square', 0.08), i * 150)
    );
  }
  bat() {
    this.n(220, 0.15);
    setTimeout(() => this.n(330, 0.15), 100);
    setTimeout(() => this.n(440, 0.3), 200);
  }
  sup() {
    this.n(880, 0.1, 'square', 0.12);
    setTimeout(() => this.n(1100, 0.1), 80);
  }
  nef() {
    this.n(300, 0.2, 'triangle', 0.06);
    setTimeout(() => this.n(200, 0.3, 'triangle', 0.06), 150);
  }
  cap() {
    [440, 554, 659, 880].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.3, 'square', 0.1), i * 200)
    );
  }
  def() {
    [440, 370, 311, 220].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.4, 'sawtooth', 0.08), i * 250)
    );
  }
}
const sfx = new SFX();


export { SFX, sfx };
