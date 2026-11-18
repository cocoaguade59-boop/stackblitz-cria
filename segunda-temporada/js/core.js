'use strict';
// =====================================================================
//  NÚCLEO: dos pantallas estilo DS, input, escenas, texto, temporizadores
// =====================================================================
const W = 256, H = 192, TS = 16;
const $top = document.getElementById('top');
const $bot = document.getElementById('bot');
const CT = $top.getContext('2d');
const CB = $bot.getContext('2d');
CT.imageSmoothingEnabled = false; CB.imageSmoothingEnabled = false;
let FRAME = 0;
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
if (IS_TOUCH) document.body.classList.add('touch');

// ---------- utilidades ----------
const rnd = (n) => Math.floor(Math.random() * n);
const rint = (a, b) => a + rnd(b - a + 1);
const chance = (p) => Math.random() < p;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const pick = (arr) => arr[rnd(arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return c; }

// colores: aclarar / oscurecer hex
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(hex, amt) { // amt -1..1
  const [r, g, b] = hexToRgb(hex);
  if (amt >= 0) return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  return rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt) * 0.95 + 8 * -amt);
}
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }

// ---------- disposición de pantallas ----------
function fitScreens() {
  const pad = IS_TOUCH ? 150 : 0;
  const vw = window.innerWidth - 12, vh = window.innerHeight - pad - 12;
  const sStack = Math.min(vw / W, vh / (H * 2 + 6));
  const sSide = Math.min(vw / (W * 2 + 6), vh / H);
  const side = sSide > sStack * 1.15;
  let s = side ? sSide : sStack;
  s = s >= 2 ? Math.floor(s) : Math.max(1, Math.floor(s * 4) / 4);
  const wrap = document.getElementById('wrap');
  wrap.className = side ? 'side' : 'stack';
  for (const c of [$top, $bot]) { c.style.width = W * s + 'px'; c.style.height = H * s + 'px'; }
  const total = side ? H * s : H * 2 * s + 6;
  wrap.style.top = Math.max(6, (window.innerHeight - pad - total) / 2) + 'px';
}
window.addEventListener('resize', fitScreens);

// ---------- input ----------
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Space: 'a', KeyJ: 'a', KeyX: 'b', Escape: 'b', KeyK: 'b', Backspace: 'b',
  Enter: 'start', KeyC: 'start', ShiftLeft: 'run', ShiftRight: 'run', KeyM: 'mute',
};
const Input = {
  held: {}, pressed: {}, rep: {}, repT: {}, tap: null, tapTop: false, textHandler: null,
  down(b) {
    if (!this.held[b]) { this.pressed[b] = true; this.rep[b] = true; this.repT[b] = performance.now() + 280; }
    this.held[b] = true;
    Sound.unlock();
  },
  up(b) { this.held[b] = false; },
  update() {
    const now = performance.now();
    for (const b of ['up', 'down', 'left', 'right']) {
      if (this.held[b] && now > this.repT[b]) { this.rep[b] = true; this.repT[b] = now + 85; }
    }
    if (this.pressed.mute) Sound.toggleMute();
  },
  end() { this.pressed = {}; this.rep = {}; this.tap = null; this.tapTop = false; },
  // atajos
  get A() { return this.pressed.a; }, get B() { return this.pressed.b; }, get START() { return this.pressed.start; },
  dir() { for (const d of ['up', 'down', 'left', 'right']) if (this.held[d]) return d; return null; },
  ok() { return this.pressed.a || this.tapTop; },
};
window.addEventListener('keydown', (e) => {
  if (Input.textHandler) { Input.textHandler(e); e.preventDefault(); return; }
  const b = KEYMAP[e.code];
  if (b) { e.preventDefault(); if (!e.repeat) Input.down(b); }
});
window.addEventListener('keyup', (e) => { const b = KEYMAP[e.code]; if (b) Input.up(b); });
window.addEventListener('blur', () => { Input.held = {}; });
function canvasPoint(cv, e) {
  const r = cv.getBoundingClientRect();
  return { x: Math.floor(((e.clientX - r.left) / r.width) * W), y: Math.floor(((e.clientY - r.top) / r.height) * H) };
}
$bot.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.unlock(); Input.tap = canvasPoint($bot, e); });
$top.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.unlock(); Input.tapTop = true; });
document.querySelectorAll('#pad button').forEach((el) => {
  const b = el.dataset.b;
  const on = (e) => { e.preventDefault(); el.classList.add('on'); Input.down(b); };
  const off = (e) => { e.preventDefault(); el.classList.remove('on'); Input.up(b); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
  el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off);
});
function hit(r, p = Input.tap) { return p && p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h; }

// ---------- temporizadores y tweens (corren dentro del bucle, frame a frame) ----------
const Timers = [];
function wait(frames) { return new Promise((res) => Timers.push({ t: Math.max(1, frames | 0), res })); }
function tween(frames, fn) { // fn(t 0..1) cada frame
  return new Promise((res) => Timers.push({ t: frames, n: frames, fn, res }));
}
function runTimers() {
  for (let i = Timers.length - 1; i >= 0; i--) {
    const tm = Timers[i];
    tm.t--;
    if (tm.fn) tm.fn(1 - tm.t / tm.n);
    if (tm.t <= 0) { Timers.splice(i, 1); tm.res(); }
  }
}

// ---------- escenas ----------
const Scenes = {
  stack: [],
  push(s) { this.stack.push(s); if (s.enter) s.enter(); return s; },
  remove(s) { const i = this.stack.indexOf(s); if (i >= 0) this.stack.splice(i, 1); },
  top() { return this.stack[this.stack.length - 1]; },
  has(cls) { return this.stack.some((s) => s instanceof cls); },
};
function open(scene) {
  return new Promise((res) => {
    scene.done = (v) => { Scenes.remove(scene); res(v); };
    Scenes.push(scene);
  });
}

// ---------- fundidos ----------
const Fade = { a: 0, col: '#000' };
function fadeTo(a, frames = 16, col = '#000') {
  Fade.col = col; const from = Fade.a;
  return tween(frames, (t) => { Fade.a = from + (a - from) * t; });
}

// ---------- texto ----------
const FONT = '8px PS2P';
const COL = {
  ink: '#303840', inkSh: '#c8d0d8', white: '#f8f8f8', dim: '#8890a0',
  red: '#e05048', blue: '#4878d8', green: '#48a858', yellow: '#e8b830',
  panel: '#283048', panel2: '#38405c', line: '#5868a0', gold: '#f0c040',
};
function txt(ctx, s, x, y, col = COL.ink, sh = COL.inkSh, align = 'left') {
  ctx.font = FONT; ctx.textBaseline = 'top'; ctx.textAlign = align;
  s = String(s);
  if (sh) { ctx.fillStyle = sh; ctx.fillText(s, x + 1, y + 1); }
  ctx.fillStyle = col; ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
}
const txtW = (s) => String(s).length * 8;
function wrapText(s, maxChars) {
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      if (!line.length) line = w;
      else if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
      else { out.push(line); line = w; }
      while (line.length > maxChars) { out.push(line.slice(0, maxChars)); line = line.slice(maxChars); }
    }
    out.push(line);
  }
  return out;
}

// ---------- cajas estilo BW ----------
function box(ctx, x, y, w, h, fill = '#f8f8f8', border = '#48506a', inner = '#b8c0d0') {
  ctx.fillStyle = border;
  ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4); ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = inner; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = fill; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
}
function pill(ctx, x, y, w, h, col, label, opts = {}) {
  const dark = shade(col, -0.45), light = shade(col, 0.35);
  ctx.fillStyle = dark; ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4); ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = opts.sel ? light : col; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = shade(opts.sel ? light : col, 0.25); ctx.fillRect(x + 3, y + 3, w - 6, Math.max(2, (h >> 1) - 3));
  if (opts.sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  if (label != null) {
    const ly = opts.ly != null ? y + opts.ly : y + ((h - 8) >> 1);
    txt(ctx, label, opts.left ? x + 8 : x + (w >> 1), ly, '#fff', dark, opts.left ? 'left' : 'center');
  }
}
function cursorArrow(ctx, x, y, col = COL.ink) {
  const o = (FRAME >> 4) & 1;
  ctx.fillStyle = col;
  for (let i = 0; i < 4; i++) ctx.fillRect(x + o + i, y + i, 1, 7 - i * 2);
}
// fondo de pantalla inferior: patrón de rombos azul (C-Gear vibes)
function botBackdrop(ctx, a = '#2a3352', b = '#313b5e') {
  ctx.fillStyle = a; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = b;
  const off = (FRAME >> 2) % 16;
  for (let y = -16; y < H + 16; y += 16) for (let x = -16; x < W + 16; x += 16) {
    const cx = x + off, cy = y + ((x / 16) & 1 ? 8 : 0);
    ctx.fillRect(cx + 6, cy + 2, 4, 1); ctx.fillRect(cx + 5, cy + 3, 6, 1); ctx.fillRect(cx + 6, cy + 4, 4, 1);
  }
}

// ---------- bucle principal ----------
function update() {
  Input.update();
  runTimers();
  const s = Scenes.top();
  if (s && s.update) s.update();
  Input.end();
  FRAME++;
}
function draw() {
  const st = Scenes.stack;
  let i = st.length - 1;
  while (i > 0 && !st[i].opaque) i--;
  CT.fillStyle = '#000'; CT.fillRect(0, 0, W, H);
  for (let k = Math.max(0, i); k < st.length; k++) if (st[k].drawTop) st[k].drawTop(CT);
  let j = st.length - 1;
  while (j >= 0 && !st[j].drawBot) j--;
  if (j >= 0) st[j].drawBot(CB); else { CB.fillStyle = '#000'; CB.fillRect(0, 0, W, H); }
  if (Fade.a > 0.001) {
    for (const c of [CT, CB]) { c.globalAlpha = clamp(Fade.a, 0, 1); c.fillStyle = Fade.col; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  }
}
let _last = 0, _acc = 0;
function loop(t) {
  if (!_last) _last = t;
  _acc += Math.min(200, t - _last); _last = t;
  const step = 1000 / 60;
  let n = 0;
  while (_acc >= step && n < 6) { update(); _acc -= step; n++; }
  if (n === 6) _acc = 0;
  draw();
  requestAnimationFrame(loop);
}

async function loadFont() {
  const bin = atob(FONT_B64); const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const ff = new FontFace('PS2P', buf.buffer);
  await ff.load(); document.fonts.add(ff);
}
