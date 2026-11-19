'use strict';
// =====================================================================
//  GRÁFICOS PROCEDURALES: criaturas, personajes, tiles, edificios, fondos
// =====================================================================

// ---------- Pintor de píxeles con contorno y sombreado automáticos ----------
class Painter {
  constructor(w, h) { this.w = w; this.h = h; this.px = new Array(w * h).fill(null); }
  set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y * this.w + x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : null; }
  // forma genérica: inside(x,y) + caja; contorno de 1px + sombreado esférico
  shape(inside, x0, y0, x1, y1, col, o = {}) {
    x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1;
    const cx = o.cx ?? (x0 + x1) / 2, cy = o.cy ?? (y0 + y1) / 2;
    const rx = Math.max(1, (x1 - x0) / 2), ry = Math.max(1, (y1 - y0) / 2);
    const ol = o.ol ?? shade(col, -0.62);
    const hi = shade(col, 0.32), lo = shade(col, -0.22), lo2 = shade(col, -0.38);
    const inS = (x, y) => inside(x + 0.5, y + 0.5);
    if (!o.noOutline) {
      for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) {
        if (inS(x, y)) continue;
        if (inS(x + 1, y) || inS(x - 1, y) || inS(x, y + 1) || inS(x, y - 1)) this.set(x, y, ol);
      }
    }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!inS(x, y)) continue;
      let c = col;
      if (!o.flat) {
        const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
        const l = -(u * 0.55 + v * 0.85);
        if (l > 0.5) c = hi; else if (l < -0.75) c = lo2; else if (l < -0.3) c = lo;
      }
      this.set(x, y, c);
    }
  }
  ell(cx, cy, rx, ry, col, o = {}) {
    rx = Math.max(0.8, rx); ry = Math.max(0.8, ry);
    this.shape((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, cx - rx, cy - ry, cx + rx, cy + ry, col, { cx, cy, ...o });
  }
  rect(x, y, w, h, col, o = {}) { this.shape((px, py) => px >= x && py >= y && px <= x + w && py <= y + h, x, y, x + w, y + h, col, o); }
  poly(pts, col, o = {}) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    this.shape(inside, x0, y0, x1, y1, col, o);
  }
  // trazo grueso (cápsula)
  line(xa, ya, xb, yb, r, col, o = {}) {
    const dx = xb - xa, dy = yb - ya, L2 = dx * dx + dy * dy || 1;
    const inside = (x, y) => { const t = clamp(((x - xa) * dx + (y - ya) * dy) / L2, 0, 1); const qx = xa + dx * t - x, qy = ya + dy * t - y; return qx * qx + qy * qy <= r * r; };
    this.shape(inside, Math.min(xa, xb) - r, Math.min(ya, yb) - r, Math.max(xa, xb) + r, Math.max(ya, yb) + r, col, o);
  }
  dot(x, y, c) { this.set(x, y, c); }
  toCanvas(flip = false) {
    const cv = mkCanvas(this.w, this.h), cx = cv.getContext('2d');
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = this.px[y * this.w + x]; if (!c) continue;
      cx.fillStyle = c; cx.fillRect(flip ? this.w - 1 - x : x, y, 1, 1);
    }
    return cv;
  }
}

// ---------- CRIATURAS ----------
// Todas miran a la izquierda (hacia el jugador). La espalda = espejo sin cara.
function drawCreature(id, back = false) {
  const sp = SPECIES[id], A = sp.art, [c0, c1, c2] = A.c, f = new Set(A.f);
  // frente en 80px (más detalle, estilo DS); espalda en 64px que se dibuja al doble
  const SZ = back ? 64 : 80, K = back ? 0.95 : 1.22;
  const s = A.s * K;
  const P = new Painter(SZ, SZ);
  const ox = SZ / 2, oy = SZ - 2;
  const X = (v) => ox + v * s, Y = (v) => oy + v * s, R = (v) => Math.max(1, v * s);
  const E = (x, y, rx, ry, c, o) => P.ell(X(x), Y(y), R(rx), R(ry), c, o);
  const L = (x1, y1, x2, y2, r, c, o) => P.line(X(x1), Y(y1), X(x2), Y(y2), R(r), c, o);
  const PG = (pts, c, o) => P.poly(pts.map(([x, y]) => [X(x), Y(y)]), c, o);
  const RC = (x, y, w, h, c, o) => P.rect(X(x), Y(y), w * s, h * s, c, o);
  const eye = (x, y, r = 3, col = '#202028') => {
    if (back) return;
    const ex = X(x), ey = Y(y), rr = Math.max(1.6, r * s);
    P.ell(ex, ey, rr, rr * 1.15, '#ffffff', { flat: true, ol: '#202028' });
    P.ell(ex - rr * 0.3, ey + rr * 0.15, Math.max(0.9, rr * 0.6), Math.max(1.1, rr * 0.75), col, { flat: true, noOutline: true });
    P.dot(Math.round(ex - rr * 0.45), Math.round(ey - rr * 0.35), '#ffffff');
  };
  const blush = (x, y) => { if (!back) { P.dot(X(x), Y(y), '#f88898'); P.dot(X(x) + 1, Y(y), '#f88898'); } };
  const crown = (x, y) => { PG([[x - 7, y], [x - 7, y - 7], [x - 3.5, y - 3], [x, y - 9], [x + 3.5, y - 3], [x + 7, y - 7], [x + 7, y]], '#f8d040'); P.dot(X(x), Y(y - 3), '#e83838'); };
  const shadowEllipse = () => { /* la sombra la dibuja la plataforma */ };
  shadowEllipse();

  switch (A.a) {
    case 'bird': {
      if (f.has('fan')) {
        E(12, -34, 22, 22, shade(c2, -0.1));
        for (let i = 0; i < 7; i++) { const a = Math.PI * (0.95 + i * 0.18); E(12 + Math.cos(a) * -16, -34 + Math.sin(a) * 16, 3.5, 3.5, c1, { flat: true }); P.dot(X(12 + Math.cos(a) * -16), Y(-34 + Math.sin(a) * 16), c0); }
      } else PG([[10, -22], [24, -30], [22, -14]], shade(c0, -0.1));
      if (f.has('bucket')) { PG([[-14, -14], [14, -14], [10, 0], [-10, 0]], '#e83838'); for (let i = -10; i <= 10; i += 7) RC(i, -14, 3, 13, '#f8f8f8', { flat: true, noOutline: true }); }
      L(-4, -8, -6, 0, 1.5, '#e8a030'); L(4, -8, 6, 0, 1.5, '#e8a030');
      E(0, -18, 14, 12, c0);
      E(-3, -15, 8, 7, c1, { noOutline: true });
      E(4, -20, 9, 6, shade(c0, -0.15));
      E(-8, -34, 9, 9, c0);
      PG([[-15, -36], [-23, -33], [-15, -30]], '#f8c030');
      eye(-10, -36, 3);
      if (f.has('crest')) for (let i = -1; i <= 1; i++) { L(-7 + i * 3, -42, -8 + i * 5, -52, 1.2, c1); E(-8 + i * 5, -53, 2, 2, c2); }
      if (f.has('popcorn')) { E(-6, -45, 3.5, 3, '#f8f0c0'); E(-10, -44, 3, 2.5, '#f8f0c0'); if (f.has('bucket')) { E(-8, -15, 4, 3, '#f8f0c0'); E(2, -14, 4, 3, '#f8f0c0'); } }
      if (f.has('crown')) crown(-8, -44);
      blush(-12, -31);
      break;
    }
    case 'tallbird': {
      L(2, -24, -2, 0, 1.4, '#e05050'); L(8, -24, 10, -12, 1.4, '#e05050'); L(10, -12, 6, -12, 1.2, '#e05050');
      E(6, -30, 13, 9, c0);
      PG([[14, -32], [26, -38], [22, -26]], c2);
      E(4, -28, 8, 5, c1, { noOutline: true });
      L(-4, -34, -8, -50, 2.6, c0);
      E(-8, -54, 6, 5, c0);
      PG([[-14, -55], [-22, -52], [-20, -46], [-14, -51]], '#202028', { flat: true });
      eye(-9, -55, 2.4);
      if (f.has('flower')) { for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; E(-4 + Math.cos(a) * 3, -60 + Math.sin(a) * 3, 2.2, 2.2, '#f84848', { flat: true }); } E(-4, -60, 1.5, 1.5, '#f8e040', { flat: true }); }
      PG([[0, -22], [16, -24], [12, -18]], c2, { flat: true });
      break;
    }
    case 'lizard': {
      if (f.has('cape')) PG([[-6, -34], [12, -34], [18, -4], [-10, -4]], '#6040a0');
      L(10, -10, 22, -14, 3.5, c0); L(22, -14, 26, -24, 3, c0);
      if (f.has('flametail')) { E(26, -30, 5, 7, '#f8a020'); E(26, -31, 3, 4, '#f8e060', { noOutline: true }); }
      E(-4, -4, 5, 3, c0); E(8, -4, 5, 3, c0);
      E(2, -18, 11, 14, c0);
      E(0, -16, 7, 10, c1, { noOutline: true });
      L(-6, -24, -14, -18, 2.5, c0);
      E(-4, -36, 11, 8, c0);
      eye(-9, -38, 3.2);
      if (!back) { L(-14, -32, -6, -31, 0.6, shade(c0, -0.5), { noOutline: true, flat: true }); }
      if (f.has('goggles')) { E(-2, -43, 3.5, 3, '#a8d8f8'); E(5, -43, 3.5, 3, '#a8d8f8'); L(-6, -43, 9, -43, 0.8, c2, { flat: true }); }
      blush(-12, -34);
      break;
    }
    case 'axolotl': {
      PG([[14, -16], [32, -26], [30, -6]], shade(c0, 0.2));
      E(-6, -2, 4, 3, c0); E(12, -2, 4, 3, c0);
      E(4, -14, 18, 10, c0);
      E(2, -10, 13, 5, c1, { noOutline: true });
      if (f.has('crystals')) for (let i = 0; i < 3; i++) PG([[0 + i * 8, -22], [4 + i * 8, -32], [8 + i * 8, -22]], '#c8f0ff');
      for (let i = 0; i < 3; i++) { const yy = -30 + i * 5; L(-2, yy - 2, 6, yy - 6, 1.6, c2); L(-26, yy - 2, -32, yy - 6, 1.6, c2); }
      E(-14, -26, 13, 10, c0);
      eye(-20, -28, 3.2); eye(-10, -28, 3.2);
      if (!back) { L(-19, -21, -13, -21, 0.6, shade(c0, -0.55), { noOutline: true, flat: true }); P.dot(X(-20), Y(-22), shade(c0, -0.55)); P.dot(X(-12), Y(-22), shade(c0, -0.55)); }
      if (f.has('mustache') && !back) { L(-20, -19, -26, -17, 1.2, c2); L(-12, -19, -6, -17, 1.2, c2); }
      if (f.has('crown')) crown(-14, -36);
      blush(-24, -23); blush(-7, -23);
      break;
    }
    case 'penguin': {
      E(-6, -2, 5, 2.5, c2); E(6, -2, 5, 2.5, c2);
      E(0, -22, 13, 20, c0);
      E(-2, -18, 9, 15, c1, { noOutline: true });
      E(-12, -20, 3, 9, c0); E(12, -20, 3, 9, c0);
      eye(-6, -34, 2.8); eye(2, -34, 2.8);
      PG([[-4, -30], [-10, -28], [-4, -26]], c2);
      if (f.has('scarf')) { RC(-11, -27, 22, 3, '#e04040'); RC(4, -26, 4, 9, '#e04040'); }
      if (f.has('chefhat')) { RC(-7, -48, 14, 6, '#ffffff'); E(-5, -50, 5, 4, '#ffffff'); E(3, -51, 5, 4, '#ffffff'); }
      blush(-9, -30); blush(4, -30);
      break;
    }
    case 'jelly': {
      for (let i = -2; i <= 2; i++) { const x = i * 6; L(x, -26, x + (i % 2 ? 3 : -3), -14, 1.3, c2, { flat: true }); L(x + (i % 2 ? 3 : -3), -14, x, -4, 1.3, c2, { flat: true }); }
      P.shape((x, y) => (((x - X(0)) / R(17)) ** 2 + ((y - Y(-32)) / R(14)) ** 2 <= 1) && y <= Y(-24), X(-17), Y(-46), X(17), Y(-24), c0, { cx: X(0), cy: Y(-34) });
      E(-4, -38, 6, 4, c1, { noOutline: true, flat: true });
      eye(-6, -30, 2.6); eye(4, -30, 2.6);
      if (!back) { P.dot(X(-1), Y(-26), '#a04070'); P.dot(X(0), Y(-26), '#a04070'); }
      if (f.has('headphones')) { L(-16, -36, 0, -48, 1.3, '#303040'); L(0, -48, 16, -36, 1.3, '#303040'); E(-17, -34, 3.5, 5, c2); E(17, -34, 3.5, 5, c2); }
      break;
    }
    case 'ape': {
      E(-8, -2, 6, 3, shade(c0, -0.2)); E(8, -2, 6, 3, shade(c0, -0.2));
      E(0, -22, 16, 16, c0);
      E(-2, -20, 9, 10, c1, { noOutline: true });
      L(-14, -30, -20, -6, 4, c0); L(14, -30, 18, -6, 4, c0);
      E(-20, -4, 4.5, 3.5, shade(c0, -0.25)); E(18, -4, 4.5, 3.5, shade(c0, -0.25));
      if (f.has('scarf')) { RC(-10, -34, 20, 3, '#e8c040'); }
      E(-2, -42, 10, 9, c0);
      E(-4, -39, 6.5, 5.5, c1, { noOutline: true });
      eye(-7, -43, 2.6); eye(0, -43, 2.6);
      if (!back) { P.dot(X(-5), Y(-37), '#202020'); P.dot(X(-2), Y(-37), '#202020'); }
      if (f.has('beard')) PG([[-9, -36], [1, -36], [-4, -28]], '#e8e0c0');
      if (f.has('leaf')) { PG([[2, -50], [12, -58], [10, -48]], c2); L(2, -50, 8, -54, 0.5, shade(c2, -0.4), { noOutline: true, flat: true }); }
      if (f.has('crown')) crown(-2, -50);
      break;
    }
    case 'goat': {
      L(-6, -12, -7, 0, 2, c0); L(-1, -12, 0, 0, 2, shade(c0, -0.2)); L(10, -12, 9, 0, 2, c0); L(15, -12, 16, 0, 2, shade(c0, -0.2));
      L(18, -20, 24, -26, 2, c0);
      E(4, -18, 16, 9, c0);
      if (f.has('ivy')) { E(0, -24, 5, 3, c1); E(10, -22, 4, 3, c1); E(6, -15, 3, 2, c1); }
      if (f.has('mohawk')) for (let i = 0; i < 5; i++) PG([[-2 + i * 5, -25], [1 + i * 5, -34 - (i % 2) * 3], [4 + i * 5, -25]], c1);
      E(-14, -28, 8, 7, c0);
      E(-18, -24, 4, 3, shade(c0, 0.15), { noOutline: true });
      PG([[-8, -32], [-2, -34], [-6, -28]], c0);
      eye(-15, -30, 2.4);
      if (f.has('horns')) { L(-12, -34, -6, -42, 1.8, c2); L(-6, -42, -2, -38, 1.6, c2); }
      if (f.has('antlers')) { L(-12, -34, -10, -48, 1.4, c2); L(-11, -42, -18, -48, 1.2, c2); L(-10, -46, -4, -52, 1.2, c2); }
      if (!f.has('horns') && !f.has('antlers')) { L(-13, -34, -10, -39, 1.3, c2); }
      if (f.has('ivy')) E(-12, -36, 3, 2, c1);
      PG([[-17, -22], [-15, -16], [-13, -22]], '#f8f8f0', { flat: true });
      break;
    }
    case 'bug': {
      E(6, -46, 10, 6, '#e8f8ff', { flat: true, ol: '#7898b8' }); E(-4, -46, 9, 5, '#e8f8ff', { flat: true, ol: '#7898b8' });
      for (let i = 0; i < 3; i++) L(-4 + i * 5, -26, -7 + i * 6, -16, 0.7, c1, { flat: true });
      E(12, -30, 10, 8, c0);
      if (f.has('glow')) { E(14, -29, 6, 5, c2, { noOutline: true, flat: true }); E(16, -30, 3, 2, '#ffffff', { noOutline: true, flat: true }); }
      E(0, -32, 7, 6, c1);
      E(-10, -32, 7, 7, c1);
      eye(-12, -33, 2.6);
      L(-10, -38, -16, -48, 0.6, c1, { flat: true }); E(-16, -49, 1.6, 1.6, c0, { flat: true });
      L(-8, -38, -6, -49, 0.6, c1, { flat: true }); E(-6, -50, 1.6, 1.6, c0, { flat: true });
      if (f.has('camera')) { L(-8, -26, 0, -24, 0.5, '#202020', { noOutline: true, flat: true }); RC(-8, -24, 10, 7, '#303038'); E(-5, -20, 2.5, 2.5, '#58b8f8'); }
      break;
    }
    case 'hummer': {
      E(6, -48, 12, 5, '#e0fff8', { flat: true, ol: '#80b8b0' }); E(14, -44, 8, 4, '#e0fff8', { flat: true, ol: '#80b8b0' });
      PG([[10, -26], [22, -22], [16, -18]], shade(c0, -0.2));
      E(4, -30, 10, 7, c0);
      E(0, -28, 6, 5, c1, { noOutline: true });
      E(-6, -36, 7, 6, c0);
      L(-12, -36, -26, -34, 0.7, '#303030', { flat: true });
      eye(-8, -37, 2.4);
      if (f.has('cup')) { RC(6, -42, 9, 8, '#f8f8f8'); RC(6, -43, 9, 2, c2); L(15, -40, 17, -37, 0.8, '#f8f8f8'); }
      L(2, -24, 0, -18, 0.6, '#303030', { flat: true }); L(6, -24, 6, -18, 0.6, '#303030', { flat: true });
      break;
    }
    case 'imp': {
      E(-4, -2, 4, 2.5, '#604030'); E(5, -2, 4, 2.5, '#604030');
      L(-3, -10, -4, -2, 2, '#486848'); L(4, -10, 5, -2, 2, '#486848');
      E(0, -16, 9, 9, c0);
      L(-8, -20, -14, -14, 2, c0); L(8, -20, 13, -12, 2, c0);
      if (f.has('sock')) { PG([[11, -14], [17, -14], [17, -4], [22, -2], [22, 2], [12, 2]], '#f8f8f8'); RC(11, -12, 6, 2, c2, { flat: true }); RC(11, -6, 6, 2, c2, { flat: true }); }
      PG([[-10, -34], [-20, -40], [-9, -30]], c1); PG([[10, -34], [20, -40], [9, -30]], c1);
      E(0, -32, 11, 10, c1);
      eye(-5, -33, 3); eye(4, -33, 3);
      if (!back) { L(-3, -27, 2, -27, 0.5, '#a05040', { noOutline: true, flat: true }); }
      blush(-8, -28); blush(6, -28);
      if (f.has('hat')) { PG([[-12, -38], [12, -38], [4, -56], [14, -58]], c0); E(14, -58, 2.5, 2.5, c2); }
      break;
    }
    case 'dragon': {
      L(14, -14, 26, -10, 3.5, c0); PG([[24, -10], [32, -16], [32, -4]], c2);
      if (f.has('wings')) { PG([[2, -26], [20, -50], [26, -34], [14, -24]], shade(c0, -0.15)); L(2, -26, 20, -50, 0.8, shade(c0, -0.5), { noOutline: true, flat: true }); }
      E(-4, -3, 5, 3, c0); E(10, -3, 5, 3, c0);
      E(4, -18, 14, 12, c0);
      E(0, -14, 8, 8, c1, { noOutline: true });
      if (f.has('spikes')) for (let i = 0; i < 4; i++) PG([[4 + i * 5, -29 + i * 2], [7 + i * 5, -36 + i * 2], [9 + i * 5, -28 + i * 2]], c2);
      L(-6, -24, -12, -30, 4, c0);
      E(-14, -34, 10, 8, c0);
      E(-21, -31, 4.5, 3.5, shade(c0, 0.15), { noOutline: true });
      eye(-15, -36, 3);
      if (!back) { P.dot(X(-23), Y(-32), '#202020'); }
      L(-10, -40, -6, -46, 1.4, c2); if (f.has('horns')) L(-14, -41, -14, -50, 1.4, c2);
      blush(-19, -32);
      break;
    }
    case 'serpent': {
      const seg = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; seg.push([26 - t * 36, -6 - t * 34 + Math.sin(t * Math.PI * 2) * 7]); }
      for (let i = 0; i < seg.length - 1; i++) { const [x, y] = seg[i]; E(x, y, 6 - i * 0.1, 6 - i * 0.1, i % 2 ? c0 : shade(c0, -0.08)); E(x - 1, y + 2, 3, 2, c1, { noOutline: true, flat: true }); }
      PG([[28, -4], [36, -12], [34, 0]], c1);
      const [hx, hy] = seg[seg.length - 1];
      E(hx, hy, 9, 7, c0);
      E(hx - 7, hy + 2, 4, 3, shade(c0, 0.15), { noOutline: true });
      eye(hx - 2, hy - 2, 2.8);
      if (f.has('whiskers')) { L(hx - 9, hy + 1, hx - 18, hy - 4, 0.6, c1, { flat: true }); L(hx - 9, hy + 3, hx - 18, hy + 8, 0.6, c1, { flat: true }); }
      L(hx + 4, hy - 6, hx + 10, hy - 12, 1.2, c1);
      if (f.has('chefhat')) { RC(hx - 5, hy - 13, 10, 4, '#ffffff'); E(hx - 3, hy - 15, 4, 3, '#ffffff'); E(hx + 3, hy - 16, 4, 3, '#ffffff'); }
      break;
    }
    case 'apple': {
      if (f.has('knight')) { E(-8, -3, 4, 2.5, '#808890'); E(8, -3, 4, 2.5, '#808890'); L(-6, -8, -7, -3, 2, '#606870'); L(6, -8, 7, -3, 2, '#606870'); }
      E(0, -22, 18, 17, c0);
      L(0, -38, 2, -46, 1.2, '#704020');
      PG([[2, -44], [14, -50], [10, -40]], c1);
      if (f.has('knight')) {
        RC(-12, -30, 18, 6, '#c0c8d0'); RC(-11, -28, 16, 2, '#202028', { noOutline: true, flat: true });
        if (!back) { P.dot(X(-8), Y(-27), '#f8f8f8'); P.dot(X(-2), Y(-27), '#f8f8f8'); }
        L(-20, -10, -26, -40, 1.6, c1); L(20, -10, 26, -40, 1.6, c1);
        E(-4, -16, 6, 5, c2, { noOutline: true, flat: true });
      } else {
        E(-10, -18, 6, 6, '#602020', { noOutline: true, flat: true });
        E(-14, -20, 6, 5, c2);
        eye(-16, -22, 2); eye(-11, -22, 2);
        blush(-17, -17);
      }
      break;
    }
    case 'crab': {
      const big = f.has('big') ? 1.25 : 1;
      for (let i = 0; i < 3; i++) { L(-10 + i * 4, -10, -14 + i * 3, 0, 0.9, c0); L(10 - i * 4, -10, 14 - i * 3, 0, 0.9, c0); }
      E(-20, -22, 7 * big, 6 * big, c2); E(20, -22, 7 * big, 6 * big, c2);
      PG([[-26, -26], [-22, -32], [-18, -26]], c2); PG([[26, -26], [22, -32], [18, -26]], c2);
      RC(-14, -26, 28, 18, c0);
      for (let i = 0; i < 4; i++) RC(-12 + i * 7, -22, 3, 10, '#585860', { noOutline: true, flat: true });
      PG([[-15, -28], [15, -34], [16, -29], [-14, -24]], c1);
      for (let i = 0; i < 4; i++) PG([[-11 + i * 7, -28 - i * 1.3], [-7 + i * 7, -29.5 - i * 1.3], [-9 + i * 7, -25.8 - i * 1.3], [-13 + i * 7, -24.6 - i * 1.3]], '#303030', { noOutline: true, flat: true });
      L(-6, -32, -8, -42, 0.8, c0); L(4, -34, 4, -44, 0.8, c0);
      eye(-8, -44, 2.8); eye(4, -46, 2.8);
      break;
    }
    case 'tripod': {
      L(0, -34, -16, 0, 1.4, c1); L(0, -34, 16, 0, 1.4, c1); L(0, -34, 4, -2, 1.4, shade(c1, -0.2));
      RC(-12, -48, 24, 16, c0);
      RC(-4, -54, 10, 6, shade(c0, -0.2));
      E(-14, -40, 7, 7, '#303038');
      E(-14, -40, 5, 5, c2, { noOutline: true });
      if (!back) { E(-15, -40, 2.2, 2.6, '#101018', { noOutline: true, flat: true }); P.dot(X(-16), Y(-42), '#ffffff'); }
      P.dot(X(8), Y(-44), '#e83838');
      break;
    }
    case 'dog': {
      L(16, -20, 24, -28, 2, c0);
      L(-6, -10, -7, 0, 2.2, c0); L(0, -10, 0, 0, 2.2, shade(c0, -0.2)); L(10, -10, 10, 0, 2.2, c0); L(15, -10, 16, 0, 2.2, shade(c0, -0.2));
      E(4, -16, 14, 9, c0);
      E(0, -13, 8, 5, c1, { noOutline: true });
      if (f.has('jacket')) { RC(-4, -24, 16, 10, c2); RC(-4, -21, 16, 2, '#f8f8f8', { flat: true, noOutline: true }); }
      E(-12, -28, 9, 8, c0);
      E(-18, -24, 4.5, 3.5, c1, { noOutline: true });
      P.dot(X(-22), Y(-26), '#202020'); P.dot(X(-21), Y(-26), '#202020');
      E(-6, -30, 3.5, 7, shade(c0, -0.25));
      eye(-14, -30, 2.6);
      if (f.has('band')) RC(-20, -35, 16, 3, c2);
      if (!back) { L(-18, -21, -14, -21, 0.5, '#803030', { noOutline: true, flat: true }); }
      break;
    }
    case 'roo': {
      L(10, -12, 26, -2, 4, c0);
      if (f.has('boom')) { L(26, -4, 22, -60, 0.9, '#808088'); L(22, -60, -6, -64, 0.9, '#808088'); E(-10, -62, 6, 3.5, '#404048'); for (let i = 0; i < 5; i++) P.dot(X(-14 + i * 2), Y(-62), '#686870'); }
      E(-8, -3, 8, 3, shade(c0, -0.2)); E(6, -3, 7, 3, shade(c0, -0.2));
      E(2, -22, 11, 16, c0);
      E(0, -20, 7, 11, c1, { noOutline: true });
      L(-6, -30, -12, -24, 1.8, c0); L(4, -30, -6, -26, 1.8, c0);
      E(-4, -44, 7, 6, c0);
      E(-10, -42, 3.5, 2.5, c1, { noOutline: true });
      L(-2, -48, 0, -58, 2, c0); L(-6, -48, -8, -58, 2, c0);
      eye(-6, -45, 2.4);
      break;
    }
    case 'hamster': {
      if (f.has('big')) { E(6, -28, 24, 24, '#404048'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; E(6 + Math.cos(a) * 14, -28 + Math.sin(a) * 14, 4, 4, '#202028', { flat: true }); } E(6, -28, 5, 5, '#808088'); }
      E(-6, -2, 4, 2.5, shade(c0, -0.2)); E(6, -2, 4, 2.5, shade(c0, -0.2));
      E(0, -16, 14, 12, c0);
      E(-2, -13, 9, 8, c1, { noOutline: true });
      E(-8, -28, 4, 4, c0); E(6, -28, 4, 4, c0);
      E(-8, -28, 2, 2, '#f8a0a0', { noOutline: true, flat: true });
      eye(-6, -20, 2.6); eye(2, -20, 2.6);
      if (!back) { P.dot(X(-2), Y(-16), '#e86868'); }
      blush(-10, -16); blush(4, -16);
      if (f.has('reel')) { PG([[-15, -12], [15, -8], [15, -4], [-15, -8]], c2); for (let i = 0; i < 5; i++) P.dot(X(-11 + i * 6), Y(-9 + i * 0.8), '#f8f8f8'); }
      break;
    }
    case 'fox': {
      E(20, -28, 8, 14, c0); E(22, -38, 5, 5, c1, { noOutline: true });
      if (f.has('wings')) { PG([[6, -24], [16, -44], [22, -30]], '#ffffff'); PG([[2, -24], [8, -40], [14, -26]], '#f0f0ff'); }
      L(-6, -10, -7, 0, 2, c0); L(0, -10, 0, 0, 2, shade(c0, -0.15)); L(10, -10, 10, 0, 2, c0); L(15, -10, 16, 0, 2, shade(c0, -0.15));
      E(4, -16, 14, 8, c0);
      if (f.has('ticket')) { RC(-2, -22, 14, 8, '#f8f0c0'); RC(0, -20, 10, 4, '#e83838', { flat: true, noOutline: true }); }
      E(-12, -27, 9, 8, c0);
      PG([[-19, -24], [-26, -22], [-19, -20]], c0);
      P.dot(X(-26), Y(-22), '#202020');
      PG([[-18, -32], [-16, -42], [-12, -33]], c0); PG([[-10, -33], [-6, -42], [-5, -31]], c0);
      eye(-13, -29, 2.6);
      if (f.has('halo')) { E(-10, -48, 7, 2.2, c1, { flat: true }); const hx = X(-10), hy = Y(-48), hr = R(4.2); for (let yy = -2; yy <= 2; yy++) for (let xx = -hr; xx <= hr; xx++) if ((xx / hr) ** 2 + (yy / 1.2) ** 2 <= 1) P.set(hx + xx, hy + yy, null); }
      if (f.has('crown')) crown(-11, -36);
      break;
    }
  }
  // espalda: espejado y sin cara
  return P.toCanvas(back);
}
const SPR_CACHE = {};
function creatureSprite(id, back = false) {
  const k = id + (back ? ':b' : ':f');
  if (!SPR_CACHE[k]) SPR_CACHE[k] = drawCreature(id, back);
  return SPR_CACHE[k];
}

// ---------- PERSONAJES (16x22) ----------
const LOOKS = {
  // jugadores
  p_cap: { skin: '#f8c8a0', hair: '#583828', style: 'cap', hat: '#e03838', top: '#3870d0', bottom: '#303848', shoe: '#e03838' },
  p_pony: { skin: '#f8d0b0', hair: '#784020', style: 'pony', top: '#e85898', bottom: '#f8f8f8', shoe: '#3858c0' },
  p_bun: { skin: '#c88858', hair: '#202028', style: 'bun', top: '#38a878', bottom: '#384050', shoe: '#f8b030' },
  // reparto
  alessandro: { skin: '#f0c098', hair: '#3a2818', style: 'curly', top: '#f8a030', bottom: '#384868', shoe: '#603020', extra: 'glasses' },
  gabriela: { skin: '#d8a070', hair: '#281818', style: 'long', top: '#f0e050', bottom: '#5050a8', shoe: '#a03050' },
  gabriela2: { skin: '#d8a070', hair: '#281818', style: 'long', top: '#b8c0d0', bottom: '#5050a8', shoe: '#404050', extra: 'armor' },
  luas: { skin: '#f8d0b0', hair: '#e8e8f0', style: 'short', top: '#f8f8f8', bottom: '#58a8a0', shoe: '#58a8a0', extra: 'cross' },
  nicole: { skin: '#f8d8c0', hair: '#c04828', style: 'bun', top: '#906888', bottom: '#404058', shoe: '#302830' },
  tamara: { skin: '#f0c8a8', hair: '#f8d050', style: 'pony', top: '#e87838', bottom: '#384058', shoe: '#e87838', extra: 'apron' },
  luchito: { skin: '#d8a070', hair: '#202020', style: 'spiky', top: '#3878c8', bottom: '#f8f8f8', shoe: '#202020', extra: 'band' },
  andrea: { skin: '#f0c8a8', hair: '#603018', style: 'long', top: '#c058a8', bottom: '#303040', shoe: '#c058a8', extra: 'glasses' },
  dan: { skin: '#c88858', hair: '#202020', style: 'short', top: '#48a858', bottom: '#584838', shoe: '#302018', extra: 'beard' },
  pachi: { skin: '#f8d0b0', hair: '#d03868', style: 'curly', top: '#f8d838', bottom: '#d03838', shoe: '#303030' },
  andre: { skin: '#f8d0b0', hair: '#d03868', style: 'short', top: '#303038', bottom: '#202028', shoe: '#101010', extra: 'mask' },
  dante: { skin: '#e0a880', hair: '#802018', style: 'spiky', top: '#802828', bottom: '#202020', shoe: '#f06020' },
  chrys: { skin: '#f8d8c0', hair: '#f8e8a0', style: 'long', top: '#303848', bottom: '#303848', shoe: '#e8c040', extra: 'headset' },
  oscar: { skin: '#e0b088', hair: '#403020', style: 'short', top: '#a07848', bottom: '#384050', shoe: '#302010', extra: 'glasses' },
  piero: { skin: '#f0c8a0', hair: '#f8e060', style: 'spiky', top: '#5888c8', bottom: '#384050', shoe: '#f8f8f8' },
  yam: { skin: '#f0c8a8', hair: '#202028', style: 'bun', top: '#585868', bottom: '#383840', shoe: '#202020', extra: 'helmet' },
  rey: { skin: '#f0c8a0', hair: '#c8c8d0', style: 'short', top: '#7030a0', bottom: '#f8d040', shoe: '#7030a0', extra: 'crown' },
  edison: { skin: '#c88858', hair: '#202020', style: 'cap', hat: '#202020', top: '#f8f8f8', bottom: '#303848', shoe: '#e83838', extra: 'headset' },
  guardia: { skin: '#f0c8a0', hair: '#403020', style: 'short', top: '#4858a8', bottom: '#303848', shoe: '#202020', extra: 'helmet' },
  asistente: { skin: '#e8b890', hair: '#603820', style: 'cap', hat: '#303030', top: '#202020', bottom: '#384050', shoe: '#202020', extra: 'headset' },
  kid: { skin: '#f8d0b0', hair: '#c08040', style: 'short', top: '#e86040', bottom: '#3858a0', shoe: '#f8f8f8', small: true },
  kid2: { skin: '#c89060', hair: '#202020', style: 'pony', top: '#60c0e0', bottom: '#e870a0', shoe: '#f8f8f8', small: true },
  viejo: { skin: '#f0c8a0', hair: '#e8e8e8', style: 'bald', top: '#887050', bottom: '#585048', shoe: '#302018', extra: 'beard' },
  vieja: { skin: '#f0c8a8', hair: '#d8d8e0', style: 'bun', top: '#a85870', bottom: '#584060', shoe: '#302030' },
  chico: { skin: '#e0b088', hair: '#383028', style: 'spiky', top: '#58a850', bottom: '#404858', shoe: '#e8e8e8' },
  chica: { skin: '#f8d0b8', hair: '#a85030', style: 'pony', top: '#f0a040', bottom: '#4060a0', shoe: '#e8e8e8' },
  punk: { skin: '#f0c8a0', hair: '#58d058', style: 'spiky', top: '#202028', bottom: '#383040', shoe: '#a02020' },
  obrero: { skin: '#d8a070', hair: '#403020', style: 'cap', hat: '#f8c020', top: '#e87830', bottom: '#405070', shoe: '#503020' },
  dama: { skin: '#f8d8c0', hair: '#e8c060', style: 'long', top: '#f888a8', bottom: '#f888a8', shoe: '#f8f8f8' },
  cocinero: { skin: '#f0c098', hair: '#402818', style: 'short', top: '#f8f8f8', bottom: '#404040', shoe: '#202020', extra: 'chef' },
  cientifica: { skin: '#e0b088', hair: '#202028', style: 'long', top: '#f8f8f8', bottom: '#5868a0', shoe: '#303030', extra: 'glasses' },
  marinero: { skin: '#e0a878', hair: '#303030', style: 'cap', hat: '#f8f8f8', top: '#3858a8', bottom: '#f8f8f8', shoe: '#202020' },
  actor: { skin: '#f0c8a0', hair: '#202020', style: 'short', top: '#a02838', bottom: '#202028', shoe: '#202020', extra: 'cape' },
};
function drawPerson(look, dir, step) {
  const L = LOOKS[look] || LOOKS.chico;
  const P = new Painter(16, 22);
  const g = []; // capas: [x,y,w,h,c]
  const R = (x, y, w, h, c) => g.push([x, y, w, h, c]);
  const bob = step ? 1 : 0;
  const sm = L.small ? 2 : 0;
  const top = 1 + sm + bob;
  // piernas
  const legY = 16 + bob, legH = 4 - bob;
  if (dir === 0 || dir === 1) {
    const l1 = step === 1 ? 1 : 0, l2 = step === 2 ? 1 : 0;
    R(5, legY, 2, legH + 1 - l1, L.bottom); R(9, legY, 2, legH + 1 - l2, L.bottom);
    R(5, 20 - l1, 2, 2, L.shoe); R(9, 20 - l2, 2, 2, L.shoe);
  } else {
    if (step) { R(5, legY, 2, legH + 1, L.bottom); R(9, legY, 2, legH, L.bottom); R(4, 20, 3, 2, L.shoe); R(9, 19, 3, 2, L.shoe); }
    else { R(6, legY, 4, legH + 1, L.bottom); R(6, 20, 4, 2, L.shoe); }
  }
  // capa trasera
  if (L.extra === 'cape' && dir !== 0) R(4, 10 + top - 1, 8, 8, '#e8c040');
  // torso
  const ty = 9 + top;
  R(4, ty, 8, 7 - sm + (bob ? -1 : 0) + 1, L.top);
  if (L.extra === 'apron' && dir === 0) R(5, ty + 2, 6, 6 - sm, '#f8f8f8');
  if (L.extra === 'armor') { R(4, ty, 8, 3, '#e8e8f8'); }
  if (L.extra === 'cross' && dir === 0) { R(7, ty + 1, 2, 4, '#e83838'); R(6, ty + 2, 4, 2, '#e83838'); }
  // brazos
  const sw = step === 1 ? 1 : step === 2 ? -1 : 0;
  if (dir === 0 || dir === 1) { R(3, ty + 1 + sw, 1, 5, L.top); R(12, ty + 1 - sw, 1, 5, L.top); R(3, ty + 5 + sw, 1, 1, L.skin); R(12, ty + 5 - sw, 1, 1, L.skin); }
  else { R(7 + sw, ty + 1, 2, 5, shade(L.top, -0.15)); R(7 + sw, ty + 5, 2, 1, L.skin); }
  // cabeza
  const hy = top;
  R(4, hy + 1, 8, 8, L.skin);
  // pelo
  const H = L.hair;
  const st = L.style;
  if (dir === 1) { // de espaldas: pelo cubre la cabeza
    if (st !== 'bald') R(4, hy, 8, st === 'short' || st === 'spiky' || st === 'cap' ? 7 : 9, H);
    if (st === 'long') R(3, hy + 2, 10, 9, H);
    if (st === 'pony') R(7, hy + 8, 2, 4, H);
  } else {
    if (st !== 'bald' && st !== 'cap') R(4, hy, 8, 3, H);
    if (st === 'short' || st === 'pony' || st === 'bun') { if (dir === 0) { R(4, hy + 3, 1, 2, H); R(11, hy + 3, 1, 2, H); } }
    if (st === 'spiky') { R(4, hy - 1, 2, 2, H); R(7, hy - 2, 2, 2, H); R(10, hy - 1, 2, 2, H); if (dir === 0) { R(4, hy + 3, 1, 2, H); R(11, hy + 3, 1, 2, H); } }
    if (st === 'curly') { R(3, hy - 1, 10, 5, H); if (dir === 0) { R(3, hy + 4, 2, 3, H); R(11, hy + 4, 2, 3, H); } }
    if (st === 'long') { if (dir === 0) { R(3, hy + 2, 2, 9, H); R(11, hy + 2, 2, 9, H); } else R(dir === 2 ? 9 : 4, hy + 2, 3, 9, H); }
    if (st === 'bun') R(6, hy - 2, 4, 3, H);
    if (st === 'pony' && dir !== 0) R(dir === 2 ? 11 : 2, hy + 3, 3, 5, H);
    if (st === 'pony' && dir === 0) R(11, hy + 4, 2, 4, H);
    if (st === 'cap') { R(4, hy, 8, 3, L.hat || '#e03838'); if (dir === 0) R(3, hy + 3, 10, 1, shade(L.hat || '#e03838', -0.3)); else R(dir === 2 ? 1 : 11, hy + 3, 4, 1, shade(L.hat || '#e03838', -0.3)); R(4, hy + 3, 1, 2, H); R(11, hy + 3, 1, 2, H); }
    if (dir !== 0 && st !== 'long' && st !== 'bald') R(dir === 2 ? 10 : 4, hy + 2, 2, 4, H); // nuca
  }
  if (st === 'cap' && dir === 1) R(4, hy, 8, 3, L.hat || '#e03838');
  if (L.extra === 'helmet') { R(3, hy - 1, 10, 4, '#a8b0c0'); R(7, hy - 3, 2, 2, '#e83838'); }
  if (L.extra === 'crown') { R(4, hy - 3, 8, 3, '#f8d040'); R(4, hy - 4, 1, 1, '#f8d040'); R(7, hy - 4, 2, 1, '#f8d040'); R(11, hy - 4, 1, 1, '#f8d040'); R(7, hy - 2, 2, 1, '#e83838'); }
  if (L.extra === 'chef') { R(4, hy - 4, 8, 5, '#ffffff'); }
  if (L.extra === 'band') { R(4, hy + 2, 8, 1, '#e83838'); }
  if (L.extra === 'headset' && dir !== 1) { R(dir === 3 ? 6 : dir === 2 ? 9 : 3, hy + 4, 1, 3, '#202020'); }
  // cara
  if (dir === 0) {
    R(6, hy + 5, 1, 2, '#202028'); R(9, hy + 5, 1, 2, '#202028');
    if (L.extra === 'glasses') { R(5, hy + 5, 3, 1, '#383848'); R(8, hy + 5, 3, 1, '#383848'); }
    if (L.extra === 'beard') R(5, hy + 7, 6, 2, L.hair === '#e8e8e8' ? '#e8e8e8' : shade(L.hair, 0.1));
    if (L.extra === 'mask') { R(4, hy + 3, 8, 5, '#f0f0f8'); R(6, hy + 5, 1, 1, '#202028'); R(9, hy + 5, 1, 1, '#202028'); }
  } else if (dir === 2 || dir === 3) {
    const ex = dir === 2 ? 5 : 10;
    R(ex, hy + 5, 1, 2, '#202028');
    if (L.extra === 'glasses') R(dir === 2 ? 4 : 9, hy + 5, 3, 1, '#383848');
    if (L.extra === 'beard') R(dir === 2 ? 4 : 8, hy + 7, 4, 2, L.hair === '#e8e8e8' ? '#e8e8e8' : shade(L.hair, 0.1));
    if (L.extra === 'mask') { R(dir === 2 ? 4 : 7, hy + 3, 5, 5, '#f0f0f8'); R(ex, hy + 5, 1, 1, '#202028'); }
  }
  // componer (las capas se pintan en orden, luego contorno global)
  for (const [x, y, w, h, c] of g) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) P.set(xx, yy, c);
  // contorno exterior
  const out = new Painter(16, 22); out.px = P.px.slice();
  for (let y = 0; y < 22; y++) for (let x = 0; x < 16; x++) {
    if (P.get(x, y)) continue;
    if (P.get(x + 1, y) || P.get(x - 1, y) || P.get(x, y + 1) || P.get(x, y - 1)) out.set(x, y, '#202030');
  }
  // sombreado de volumen: borde derecho/inferior más oscuro, borde superior con brillo
  for (let y = 0; y < 22; y++) for (let x = 0; x < 16; x++) {
    const c = P.get(x, y); if (!c) continue;
    if (!P.get(x + 1, y) || !P.get(x, y + 1)) out.set(x, y, shade(c, -0.22));
    else if (!P.get(x, y - 1) || P.get(x, y - 1) !== c && c === L.hair) out.set(x, y, shade(c, 0.25));
  }
  // espejo para la derecha (dir 3 se dibuja como 2 espejado)
  return out.toCanvas(false);
}
const PERSON_CACHE = {};
function personSprite(look, dir, step) {
  const k = look + dir + step;
  if (!PERSON_CACHE[k]) {
    if (dir === 3) { // derecha = izquierda espejada
      const src = drawPerson(look, 2, step); const c = mkCanvas(16, 22); const x = c.getContext('2d');
      x.translate(16, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); PERSON_CACHE[k] = c;
    } else PERSON_CACHE[k] = drawPerson(look, dir, step);
  }
  return PERSON_CACHE[k];
}

// ---------- TILES (16x16) ----------
const TILE_CACHE = {};
// Paleta de exteriores inspirada en BW2: verdes luminosos, caminos cálidos, agua saturada.
const PAL = {
  g0: '#86d46a', g1: '#6cbf54', g2: '#a6e486', g3: '#58a845', gd: '#3f8c3a',
  p0: '#ecd8a4', p1: '#d9bf84', p2: '#f6e8c0', pe: '#c4a46a',
  w0: '#3a88e8', w1: '#5aa4f4', w2: '#a8dcff', wd: '#2a6cc8',
};
function tileCanvas(key, variant = 0, frame = 0) {
  const k = key + ':' + variant + ':' + frame;
  if (TILE_CACHE[k]) return TILE_CACHE[k];
  const c = mkCanvas(16, 16), x = c.getContext('2d');
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const rnd2 = (i) => hash2(variant * 31 + i, i * 7 + variant);
  // pasto corto: base clara con matas en "v" (patrón regular, como en DS)
  const grass = () => {
    R(0, 0, 16, 16, PAL.g0);
    const spots = [[2, 3], [10, 2], [6, 9], [13, 11], [1, 13]];
    spots.forEach(([a, b], i) => {
      if (rnd2(i) < 0.35) return;
      R(a, b + 1, 1, 1, PAL.g1); R(a + 1, b, 1, 1, PAL.g1); R(a + 2, b + 1, 1, 1, PAL.g1); R(a + 1, b + 1, 1, 1, PAL.g3);
      R(a + 1, b - 1, 1, 1, PAL.g2);
    });
    if (variant % 4 === 0) { R(8, 6, 1, 1, '#ffffff'); R(7, 7, 3, 1, '#f8f0a0'); } // florcita mínima
  };
  switch (key) {
    case 'grass': grass(); break;
    case 'tall': {
      // matas de hojas en dos filas desfasadas (como el pasto alto de DS), con contorno nítido
      R(0, 0, 16, 16, '#3e9238');
      const px = (X, Y, col) => { X = ((X % 16) + 16) % 16; if (Y >= 0 && Y < 16) R(X, Y, 1, 1, col); };
      const tri = (ax, ay, bx, by, cx2, cy2, col) => {
        for (let Y = Math.min(ay, by, cy2); Y <= Math.max(ay, by, cy2); Y++) for (let X = Math.min(ax, bx, cx2); X <= Math.max(ax, bx, cx2); X++) {
          const d1 = (X - bx) * (ay - by) - (ax - bx) * (Y - by), d2 = (X - cx2) * (by - cy2) - (bx - cx2) * (Y - cy2), d3 = (X - ax) * (cy2 - ay) - (cx2 - ax) * (Y - ay);
          if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) px(X, Y, col);
        }
      };
      const clump = (ox, oy, sw) => {
        const bl = [[ox, oy + 8, ox + 2 + sw, oy + 2, ox + 4, oy + 8], [ox + 2, oy + 8, ox + 4 + sw, oy - 1, ox + 7, oy + 8], [ox + 5, oy + 8, ox + 8 + sw, oy + 3, ox + 9, oy + 8]];
        for (const t of bl) tri(t[0] - 1, t[1], t[2], t[3] - 1, t[4] + 1, t[5], '#1d5222');
        for (const t of bl) tri(...t, '#4cae42');
        for (const t of bl) px(t[2], t[3], '#a6ec7a');
        px(ox + 3 + sw, oy + 2, '#7cd25c'); px(ox + 4, oy + 6, '#2f7a2c'); px(ox + 6, oy + 7, '#2f7a2c');
      };
      const sw = frame ? 1 : 0;
      clump(-1, 0, sw); clump(7, 0, 0); clump(3, 8, 0); clump(11, 8, sw);
      break;
    }
    case 'flower': {
      grass();
      const cols = [['#ff5a7a', '#fff070'], ['#ffffff', '#f8c040'], ['#6ab0ff', '#ffffff'], ['#ffa040', '#fff4c0']][variant % 4];
      for (const [a, b] of [[3, 4], [10, 9], [11, 2]]) {
        const o = frame ? 1 : 0;
        R(a + 1, b + 2, 1, 3, PAL.gd);
        R(a, b + o, 3, 1, cols[0]); R(a + 1, b - 1 + o, 1, 3, cols[0]); R(a + 1, b + o, 1, 1, cols[1]);
        R(a - 1, b + 4, 1, 1, PAL.g3); R(a + 2, b + 3, 2, 1, PAL.g3);
      }
      break;
    }
    case 'path': R(0, 0, 16, 16, PAL.p0); for (let i = 0; i < 6; i++) { const a = (rnd2(i) * 14) | 0, b = (rnd2(i + 4) * 14) | 0; R(a, b, 2, 1, PAL.p1); R(a, b - 1, 1, 1, PAL.p2); } break;
    case 'sand': R(0, 0, 16, 16, '#f4e2b0'); for (let i = 0; i < 7; i++) { const a = (rnd2(i) * 15) | 0, b = (rnd2(i + 4) * 15) | 0; R(a, b, 1, 1, '#dcc48c'); R(a + 1, b, 1, 1, '#fff6d8'); } break;
    case 'quarry': R(0, 0, 16, 16, '#dcb486'); R(0, 0, 16, 1, '#e8c8a0'); for (let i = 0; i < 4; i++) { const a = (rnd2(i) * 12) | 0, b = (rnd2(i + 4) * 12) | 0; R(a, b, 3, 2, '#c09468'); R(a, b, 3, 1, '#ecd0a8'); } break;
    case 'plaza': {
      R(0, 0, 16, 16, '#e4dccc'); R(0, 0, 8, 8, '#d8cfbd'); R(8, 8, 8, 8, '#d8cfbd');
      R(0, 0, 16, 1, '#f4eee2'); R(0, 0, 1, 16, '#f4eee2'); R(0, 15, 16, 1, '#bdb29c'); R(15, 0, 1, 16, '#bdb29c');
      R(7, 0, 1, 16, '#c6bca8'); R(0, 7, 16, 1, '#c6bca8');
      break;
    }
    case 'water': {
      R(0, 0, 16, 16, PAL.w0);
      const o = frame * 4;
      for (let i = 0; i < 3; i++) {
        const yy = (i * 6 + (variant % 2) * 3) % 16, xx = (o + i * 5 + variant * 3) % 16;
        R(xx, yy, 4, 1, PAL.w1); R((xx + 1) % 16, yy - 1 < 0 ? 15 : yy - 1, 2, 1, PAL.w2);
      }
      if ((variant + frame) % 5 === 0) R(4, 11, 1, 1, '#ffffff');
      break;
    }
    case 'tree': case 'pine': grass(); break; // el árbol se dibuja como objeto alto (treeSprite)
    case 'fence': {
      grass();
      R(0, 5, 16, 2, '#b07840'); R(0, 10, 16, 2, '#b07840'); R(0, 5, 16, 1, '#d8a060'); R(0, 10, 16, 1, '#d8a060');
      for (const fx of [2, 11]) { R(fx - 1, 2, 5, 13, '#5a3818'); R(fx, 3, 3, 11, '#e0b070'); R(fx, 3, 3, 1, '#fcd898'); R(fx + 2, 4, 1, 10, '#b88850'); }
      R(1, 14, 14, 2, '#00000022');
      break;
    }
    case 'rock': {
      grass(); R(2, 13, 13, 2, '#00000030');
      R(2, 5, 12, 9, '#3c3c48'); R(3, 4, 10, 10, '#3c3c48'); R(3, 5, 10, 8, '#8c8ca0'); R(4, 4, 8, 1, '#8c8ca0');
      R(4, 5, 5, 3, '#c0c0d0'); R(5, 5, 2, 1, '#e8e8f0'); R(9, 10, 4, 3, '#6c6c80'); R(3, 11, 10, 2, '#70708a');
      break;
    }
    case 'ledge': grass(); R(0, 8, 16, 3, '#5aa846'); R(0, 10, 16, 1, '#2f6e2c'); R(0, 11, 16, 3, '#3c8a38'); R(0, 13, 16, 1, '#2a5c26'); for (let i = 1; i < 16; i += 4) R(i, 11, 1, 2, '#58a846'); R(0, 14, 16, 2, PAL.g1); break;
    case 'sign': {
      grass(); R(4, 14, 9, 2, '#00000028');
      R(7, 9, 2, 7, '#6a4420'); R(1, 2, 14, 9, '#4a2c10'); R(2, 3, 12, 7, '#d8a868'); R(2, 3, 12, 1, '#f0c888'); R(2, 9, 12, 1, '#b08040');
      R(4, 5, 8, 1, '#8a6038'); R(4, 7, 6, 1, '#8a6038');
      break;
    }
    case 'bridge': { R(0, 0, 16, 16, PAL.w0); R(0, 1, 16, 14, '#b47c48'); for (let i = 0; i < 16; i += 4) { R(i, 1, 1, 14, '#7c4c24'); R(i + 1, 1, 1, 14, '#cc9660'); } R(0, 1, 16, 1, '#f0c890'); R(0, 14, 16, 1, '#5a3418'); R(0, 15, 16, 1, '#1c4c98'); break; }
    case 'cave': R(0, 0, 16, 16, '#8a7058'); for (let i = 0; i < 6; i++) { const a = (rnd2(i) * 14) | 0, b = (rnd2(i + 3) * 14) | 0; R(a, b, 2, 1, '#6c5440'); R(a, b - 1, 2, 1, '#a08870'); } break;
    case 'cwall': { R(0, 0, 16, 16, '#4a3626'); R(0, 0, 16, 11, '#6a5038'); R(1, 1, 6, 5, '#82664a'); R(9, 4, 6, 4, '#82664a'); R(1, 1, 6, 1, '#9c8060'); R(9, 4, 6, 1, '#9c8060'); R(0, 11, 16, 1, '#2c2016'); R(0, 12, 16, 4, '#3a2a1c'); break; }
    case 'lava': { R(0, 0, 16, 16, '#e04010'); const o = frame * 3; R((2 + o) % 14, 3, 5, 2, '#f8a028'); R((9 + o) % 14, 10, 4, 2, '#f8c040'); R((5 + o) % 14, 7, 2, 1, '#fff0a0'); R((12 + o) % 16, 13, 2, 1, '#f8a028'); break; }
    case 'boulder': R(0, 0, 16, 16, '#8a7058'); R(1, 13, 14, 2, '#00000040'); R(1, 3, 14, 11, '#3a2a1c'); R(2, 2, 12, 11, '#a08868'); R(3, 3, 6, 4, '#c8b090'); R(4, 3, 2, 1, '#e8d8c0'); R(9, 9, 4, 3, '#806848'); break;
    case 'crystal': R(0, 0, 16, 16, '#8a7058'); R(4, 13, 9, 2, '#00000040'); R(5, 3, 6, 11, '#1c6898'); R(6, 2, 4, 12, '#58c8f8'); R(7, 3, 1, 8, '#d8f8ff'); R(2, 9, 3, 5, '#3aa8e0'); R(11, 8, 3, 6, '#3aa8e0'); R(12, 8, 1, 3, '#c8f0ff'); break;
    case 'kfloor': R(0, 0, 16, 16, '#aca4be'); R(0, 0, 16, 1, '#8c84a0'); R(0, 0, 1, 16, '#8c84a0'); R(1, 1, 7, 7, '#bcb4ce'); R(9, 9, 6, 6, '#bcb4ce'); R(1, 1, 7, 1, '#d0c8e0'); break;
    case 'kwall': R(0, 0, 16, 16, '#5a5270'); R(0, 0, 16, 2, '#7c7496'); for (let yy = 3; yy < 16; yy += 5) { R(0, yy, 16, 1, '#3e3852'); R(((yy / 5) | 0) % 2 ? 4 : 10, yy, 1, 5, '#3e3852'); R(0, yy + 1, 16, 1, '#686084'); } break;
    case 'carpet': R(0, 0, 16, 16, '#b02838'); R(0, 0, 2, 16, '#f0c040'); R(14, 0, 2, 16, '#f0c040'); R(2, 0, 1, 16, '#801828'); R(13, 0, 1, 16, '#801828'); R(5, 6, 6, 4, '#c83848'); R(7, 5, 2, 6, '#c83848'); break;
    case 'pillar': R(0, 0, 16, 16, '#aca4be'); R(3, 0, 10, 16, '#e0d8ea'); R(3, 0, 2, 16, '#fbf8ff'); R(11, 0, 2, 16, '#b0a8c4'); R(2, 13, 12, 3, '#8c84a0'); R(2, 0, 12, 2, '#c8c0d8'); break;
    case 'ldoor': R(0, 0, 16, 16, '#5a5270'); R(2, 1, 12, 15, '#5c3818'); R(3, 2, 10, 13, '#905830'); R(3, 2, 10, 1, '#b07848'); R(7, 2, 2, 13, '#5c3818'); R(10, 8, 2, 2, '#f8d040'); R(4, 5, 2, 6, '#7c4824'); break;
    case 'floor': R(0, 0, 16, 16, '#dcac6c'); for (let yy = 0; yy < 16; yy += 4) { R(0, yy, 16, 1, '#b88848'); R(0, yy + 1, 16, 1, '#e8c088'); } R(variant % 2 ? 5 : 11, 0, 1, 16, '#c09050'); break;
    case 'tilefloor': R(0, 0, 16, 16, '#f4ece4'); R(0, 0, 8, 8, '#e4dcd4'); R(8, 8, 8, 8, '#e4dcd4'); R(0, 0, 16, 1, '#fffaf4'); break;
    case 'iwall': R(0, 0, 16, 16, '#f0e0c8'); R(0, 0, 16, 3, '#c8b090'); R(0, 13, 16, 3, '#a88860'); R(3, 4, 10, 8, '#ffffff'); R(4, 5, 8, 6, '#a8d0f0'); R(4, 5, 3, 2, '#e0f4ff'); R(7, 5, 1, 6, '#ffffff'); R(3, 12, 10, 1, '#c8b090'); break;
    case 'iwall2': R(0, 0, 16, 16, '#f0e0c8'); R(0, 0, 16, 3, '#c8b090'); R(0, 13, 16, 3, '#a88860'); R(0, 6, 16, 1, '#e4d2b6'); break;
    case 'mat': R(0, 0, 16, 16, '#dcac6c'); R(1, 4, 14, 10, '#a02828'); R(2, 5, 12, 8, '#e05050'); R(3, 8, 10, 1, '#f8d040'); R(2, 5, 12, 1, '#f07070'); break;
    case 'bed': R(0, 0, 16, 16, '#dcac6c'); R(1, 0, 14, 16, '#704020'); R(2, 1, 12, 5, '#f8f8f8'); R(2, 4, 12, 2, '#d8d8e8'); R(2, 6, 12, 9, '#5878d8'); R(2, 6, 12, 1, '#88a8f8'); R(2, 14, 12, 1, '#3858b0'); break;
    case 'table': R(0, 0, 16, 16, '#dcac6c'); R(1, 13, 14, 2, '#00000030'); R(1, 3, 14, 9, '#8a5020'); R(1, 3, 14, 2, '#b87840'); R(2, 12, 2, 4, '#5c3010'); R(12, 12, 2, 4, '#5c3010'); R(6, 4, 4, 2, '#f8f8f8'); break;
    case 'pot': R(0, 0, 16, 16, '#dcac6c'); R(3, 14, 10, 2, '#00000030'); R(4, 10, 8, 6, '#c86838'); R(4, 10, 8, 1, '#f09060'); R(4, 13, 8, 1, '#a04c20'); x.fillStyle = '#2c7a34'; x.beginPath(); x.arc(8, 6, 5.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#48a850'; x.beginPath(); x.arc(7, 5, 4, 0, Math.PI * 2); x.fill(); R(5, 3, 2, 2, '#80d070'); break;
    case 'shelf': R(0, 0, 16, 16, '#5c3010'); R(1, 1, 14, 14, '#905830'); for (let yy = 2; yy < 15; yy += 5) { R(1, yy + 3, 14, 1, '#4a2808'); R(2, yy, 3, 3, '#e05050'); R(5, yy, 2, 3, '#5080e0'); R(8, yy, 3, 3, '#50b060'); R(12, yy, 2, 3, '#e0c040'); R(2, yy, 12, 1, '#ffffff30'); } break;
    case 'counter': R(0, 0, 16, 16, '#f4ece4'); R(0, 2, 16, 14, '#c84848'); R(0, 2, 16, 3, '#ffffff'); R(0, 5, 16, 1, '#e8d8d8'); R(0, 14, 16, 2, '#902828'); R(0, 9, 16, 1, '#e06060'); break;
    case 'pc': R(0, 0, 16, 16, '#f4ece4'); R(2, 1, 12, 14, '#4c5c98'); R(2, 1, 12, 1, '#7888c8'); R(3, 2, 10, 7, '#1c2434'); R(4, 3, 8, 5, frame ? '#68d8ff' : '#48b0e0'); R(4, 3, 3, 1, '#c8f4ff'); R(4, 11, 8, 2, '#a8b8e0'); break;
    case 'heal': R(0, 0, 16, 16, '#f4ece4'); R(1, 4, 14, 11, '#d8d8e8'); R(1, 4, 14, 1, '#ffffff'); R(2, 5, 12, 4, '#a8b0c8'); for (let i = 0; i < 3; i++) { R(3 + i * 4, 5, 2, 3, '#e85050'); R(3 + i * 4, 5, 1, 1, '#ffa0a0'); } R(6, 11, 4, 2, frame ? '#58e858' : '#38a838'); break;
    case 'stage': R(0, 0, 16, 16, '#a86c3a'); for (let yy = 0; yy < 16; yy += 4) { R(0, yy, 16, 1, '#7c4820'); R(0, yy + 1, 16, 1, '#c08850'); } break;
    case 'curtain': R(0, 0, 16, 16, '#a01828'); for (let i = 0; i < 16; i += 4) { R(i, 0, 2, 16, '#c42c3c'); R(i, 0, 1, 16, '#e05060'); R(i + 2, 0, 1, 16, '#801020'); } R(0, 14, 16, 2, '#f0c040'); break;
    case 'seat': R(0, 0, 16, 16, '#302830'); R(2, 3, 12, 10, '#a02838'); R(2, 3, 12, 3, '#d04050'); R(2, 11, 12, 2, '#701420'); break;
    case 'stairs': R(0, 0, 16, 16, '#aca4be'); for (let i = 0; i < 4; i++) { R(1, 1 + i * 4, 14, 3, shade('#d8d0e8', -i * 0.1)); R(1, 3 + i * 4, 14, 1, '#787088'); } break;
    case 'void': R(0, 0, 16, 16, '#101018'); break;
  }
  TILE_CACHE[k] = c;
  return c;
}
// Árboles altos (20x30): la copa sobresale hacia arriba y tapa lo que queda detrás.
const TREE_CACHE = {};
function treeSprite(kind, v = 0) {
  const k = kind + v; if (TREE_CACHE[k]) return TREE_CACHE[k];
  const c = mkCanvas(20, 30), x = c.getContext('2d');
  const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const circ = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
  // sombra en el suelo
  x.fillStyle = '#00000030'; x.beginPath(); x.ellipse(10, 27, 8, 2.5, 0, 0, Math.PI * 2); x.fill();
  if (kind === 'pine') {
    R(8, 21, 4, 7, '#4a2c12'); R(9, 21, 1, 7, '#7a4c24');
    const tiers = [[10, 1, 4, 9], [10, 6, 7, 15], [10, 12, 9, 22]];
    for (const [cx, top, hw, bot] of tiers) { x.fillStyle = '#0e3a1c'; x.beginPath(); x.moveTo(cx, top - 1); x.lineTo(cx + hw + 1, bot + 1); x.lineTo(cx - hw - 1, bot + 1); x.fill(); }
    for (const [cx, top, hw, bot] of tiers) { x.fillStyle = '#21733a'; x.beginPath(); x.moveTo(cx, top); x.lineTo(cx + hw, bot); x.lineTo(cx - hw, bot); x.fill(); x.fillStyle = '#3c9a4c'; x.beginPath(); x.moveTo(cx, top + 1); x.lineTo(cx - hw + 2, bot - 1); x.lineTo(cx - 1, bot - 1); x.fill(); }
    R(8, 4, 1, 2, '#78c870'); R(6, 11, 2, 1, '#78c870'); R(5, 17, 2, 1, '#78c870');
  } else {
    R(8, 19, 4, 9, '#3c2410'); R(8, 19, 1, 9, '#6a4220'); R(7, 26, 6, 2, '#3c2410');
    const lobes = [[10, 9, 9], [5, 13, 6], [15, 13, 6], [10, 15, 7]];
    for (const [cx, cy, r] of lobes) circ(cx, cy, r + 1, '#14421e');
    for (const [cx, cy, r] of lobes) circ(cx, cy, r, '#2a7c38');
    circ(8, 8, 6, '#3c9848'); circ(4, 12, 3.5, '#3c9848'); circ(13, 11, 3.5, '#3c9848');
    circ(7, 6, 3, '#62bc5c'); circ(3, 11, 1.5, '#62bc5c'); circ(12, 9, 1.5, '#62bc5c');
    R(6, 4, 2, 1, '#a0e088'); R(5, 5, 1, 1, '#a0e088');
    R(12, 18, 5, 1, '#1c5a26'); R(4, 18, 4, 1, '#1c5a26');
    if (v % 3 === 1) { circ(14, 15, 1.2, '#e84848'); circ(6, 16, 1.2, '#e84848'); }
  }
  TREE_CACHE[k] = c; return c;
}
// Grupos para bordes suaves (autotile): caminos y agua
const EDGE_GROUP = { ':': 'p', ';': 'p', '+': 'p', 'q': 'p', '=': 'w', '~': 'w' };
function drawEdges(ctx, ch, nb, sx, sy, frame) {
  const g = EDGE_GROUP[ch]; if (!g) return;
  const same = (c) => c == null || EDGE_GROUP[c] === g || (g === 'p' && (c === 'S' || c === 'v'));
  const [n, s, w, e] = nb.map(same);
  const R = (a, b, ww, hh, col) => { ctx.fillStyle = col; ctx.fillRect(sx + a, sy + b, ww, hh); };
  if (g === 'p') {
    if (ch === '+') { if (!n) R(0, 0, 16, 1, '#bdb29c'); if (!s) R(0, 15, 16, 1, '#a89c84'); if (!w) R(0, 0, 1, 16, '#bdb29c'); if (!e) R(15, 0, 1, 16, '#a89c84'); return; }
    const gr = PAL.g0, ed = ch === 'q' ? '#b08858' : PAL.pe;
    if (!n) { R(0, 0, 16, 1, gr); R(0, 1, 16, 1, ed); for (let i = 1; i < 16; i += 5) R(i, 1, 2, 1, gr); }
    if (!s) { R(0, 15, 16, 1, gr); R(0, 14, 16, 1, ed); for (let i = 3; i < 16; i += 5) R(i, 14, 2, 1, gr); }
    if (!w) { R(0, 0, 1, 16, gr); R(1, 0, 1, 16, ed); for (let i = 2; i < 16; i += 5) R(1, i, 1, 2, gr); }
    if (!e) { R(15, 0, 1, 16, gr); R(14, 0, 1, 16, ed); for (let i = 4; i < 16; i += 5) R(14, i, 1, 2, gr); }
    // esquinas redondeadas
    if (!n && !w) { R(0, 0, 3, 2, gr); R(0, 0, 2, 3, gr); R(2, 2, 1, 1, ed); }
    if (!n && !e) { R(13, 0, 3, 2, gr); R(14, 0, 2, 3, gr); R(13, 2, 1, 1, ed); }
    if (!s && !w) { R(0, 14, 3, 2, gr); R(0, 13, 2, 3, gr); R(2, 13, 1, 1, ed); }
    if (!s && !e) { R(13, 14, 3, 2, gr); R(14, 13, 2, 3, gr); R(13, 13, 1, 1, ed); }
  } else if (ch === '~') {
    const foam = (frame & 1) ? PAL.w2 : '#ffffff';
    if (!n) { R(0, 0, 16, 2, '#e8d8a0'); R(0, 2, 16, 1, foam); R(0, 3, 16, 1, PAL.w1); }
    if (!s) { R(0, 14, 16, 2, PAL.wd); R(0, 13, 16, 1, foam); }
    if (!w) { R(0, 0, 2, 16, '#e8d8a0'); R(2, 0, 1, 16, foam); }
    if (!e) { R(14, 0, 2, 16, '#e8d8a0'); R(13, 0, 1, 16, foam); }
  }
}

// ---------- EDIFICIOS ----------
const BLD_CACHE = {};
function buildingCanvas(b) {
  const key = b.kind + b.w + b.h + (b.roof || '') + (b.broken ? 'x' : '');
  if (BLD_CACHE[key]) return BLD_CACHE[key];
  const w = b.w * 16, h = b.h * 16;
  const extra = b.kind === 'castle' || b.kind === 'tower' ? 26 : 10;
  const c = mkCanvas(w, h + extra), x = c.getContext('2d');
  x.translate(0, extra);
  const R = (a, bb, ww, hh, col) => { x.fillStyle = col; x.fillRect(a, bb, ww, hh); };
  const dxDoor = Math.floor(b.w / 2) * 16;
  const door = (dx, col = '#7a4a28') => {
    R(dx, h - 17, 16, 17, '#3a2416');
    R(dx + 2, h - 15, 12, 15, col); R(dx + 2, h - 15, 12, 1, shade(col, 0.3));
    R(dx + 4, h - 13, 3, 5, shade(col, -0.2)); R(dx + 9, h - 13, 3, 5, shade(col, -0.2)); R(dx + 4, h - 7, 3, 5, shade(col, -0.2)); R(dx + 9, h - 7, 3, 5, shade(col, -0.2));
    R(dx + 11, h - 8, 2, 2, '#f8d040'); R(dx + 1, h - 1, 14, 1, '#a09888');
  };
  const win = (wx, wy, ww = 12, hh = 10) => {
    R(wx - 1, wy - 1, ww + 2, hh + 2, '#4a3a2c'); R(wx, wy, ww, hh, '#ffffff');
    const g = x.createLinearGradient(0, wy + 1, 0, wy + hh - 1); g.addColorStop(0, '#d0f0ff'); g.addColorStop(1, '#5aa0e0'); x.fillStyle = g; x.fillRect(wx + 1, wy + 1, ww - 2, hh - 2);
    R(wx + (ww >> 1), wy + 1, 1, hh - 2, '#ffffff'); R(wx + 1, wy + (hh >> 1), ww - 2, 1, '#ffffff');
    R(wx + 2, wy + 2, 2, 1, '#ffffff'); R(wx + 2, wy + 3, 1, 1, '#ffffff');
    R(wx - 1, wy + hh + 1, ww + 2, 2, '#d8c8a8'); R(wx - 1, wy + hh + 2, ww + 2, 1, '#9c8c70');
  };
  if (b.kind === 'castle') {
    const stone = (sx, sy, sw, shh, base) => { R(sx, sy, sw, shh, base); for (let yy = sy + 2; yy < sy + shh; yy += 7) { R(sx, yy, sw, 1, shade(base, -0.2)); for (let xx = sx + ((yy / 7) & 1 ? 0 : 6); xx < sx + sw; xx += 12) R(xx, yy, 1, 7, shade(base, -0.2)); R(sx, yy + 1, sw, 1, shade(base, 0.12)); } };
    stone(0, 6, w, h - 6, '#a098b4');
    for (let xx = 0; xx < w; xx += 12) { R(xx, -2, 8, 9, '#b0a8c4'); R(xx, -2, 8, 1, '#d0c8e0'); R(xx + 7, -2, 1, 9, '#787090'); }
    for (const tx of [0, w - 34]) {
      stone(tx, -22, 34, h + 22, '#b4acc8'); R(tx, -22, 2, h + 22, '#d4cce4'); R(tx + 32, -22, 2, h + 22, '#7c7494');
      for (let i = 0; i < 4; i++) { R(tx + 1 + i * 9, -26, 6, 6, '#b4acc8'); R(tx + 1 + i * 9, -26, 6, 1, '#e0d8f0'); }
      win(tx + 11, 8, 12, 14); R(tx + 15, -14, 4, 8, '#302838');
    }
    R(dxDoor - 10, h - 44, 36, 44, '#4a4258');
    x.fillStyle = '#4a4258'; x.beginPath(); x.arc(dxDoor + 8, h - 44, 18, Math.PI, 0); x.fill();
    R(dxDoor - 7, h - 42, 30, 42, '#6a4024'); x.fillStyle = '#6a4024'; x.beginPath(); x.arc(dxDoor + 8, h - 42, 15, Math.PI, 0); x.fill();
    for (let i = 0; i < 5; i++) R(dxDoor - 5 + i * 6, h - 52, 2, 52, '#4c2c14');
    R(dxDoor - 7, h - 24, 30, 2, '#4c2c14'); R(dxDoor + 4, h - 20, 2, 3, '#f8d040'); R(dxDoor + 10, h - 20, 2, 3, '#f8d040');
    R(w / 2 - 12, 12, 24, 18, '#6a2890'); R(w / 2 - 12, 12, 24, 2, '#9a50c0'); R(w / 2 - 4, 16, 8, 8, '#f8d040'); R(w / 2 - 1, 14, 2, 2, '#f8d040');
    BLD_CACHE[key] = c; return c;
  }
  const roofH = b.kind === 'tower' ? 18 : Math.floor(h * 0.5);
  const wallCol = { proa: '#fbf4ec', studio: '#ece4f6', tower: '#cfd2e2', theater: '#f4dcb4' }[b.kind] || '#f8ecd4';
  // muros con revestimiento
  R(0, roofH, w, h - roofH, wallCol);
  for (let yy = roofH + 3; yy < h - 5; yy += 3) R(0, yy, w, 1, shade(wallCol, -0.05));
  R(0, roofH, 2, h - roofH, shade(wallCol, -0.12)); R(w - 2, roofH, 2, h - roofH, shade(wallCol, -0.22));
  R(0, roofH, w, 2, shade(wallCol, -0.3));
  // zócalo de piedra
  R(0, h - 5, w, 5, '#a8a098'); for (let xx = 0; xx < w; xx += 8) R(xx + ((xx >> 3) & 1 ? 4 : 0), h - 5, 1, 5, '#888078'); R(0, h - 5, w, 1, '#c8c0b8');
  if (b.kind === 'tower') {
    const g = x.createLinearGradient(0, -extra, 0, roofH); g.addColorStop(0, '#7888c8'); g.addColorStop(1, '#3c4a88'); x.fillStyle = g; x.fillRect(-1, -extra + 6, w + 2, roofH + extra - 6);
    R(w / 2 - 1, -extra, 2, 8, '#303040'); R(w / 2 - 5, -extra + 2, 10, 4, '#e83838'); R(w / 2 - 5, -extra + 2, 10, 1, '#ff8080');
    for (let yy = roofH + 6; yy < h - 22; yy += 18) { win(6, yy, 10, 10); win(w - 16, yy, 10, 10); }
    R(w / 2 - 14, -extra + 10, 28, 10, '#202838'); txtTiny(x, 'P.A.', w / 2, -extra + 11, '#f8e070');
  } else {
    const rc = b.roof || { proa: '#e04848', studio: '#7050c0', theater: '#a02838' }[b.kind] || '#4878c8';
    // tejado: alero oscuro, filas de tejas escalonadas y luz desde arriba
    R(-2, -extra + 4, w + 4, roofH + extra - 4, shade(rc, -0.55));
    const top = -extra + 5, bot = roofH - 3;
    for (let yy = top; yy < bot; yy++) { const t = (yy - top) / (bot - top); R(-1, yy, w + 2, 1, shade(rc, 0.28 - t * 0.45)); }
    for (let yy = top + 3, row = 0; yy < bot; yy += 4, row++) { R(-1, yy, w + 2, 1, shade(rc, -0.35)); for (let xx = row & 1 ? 3 : -1; xx < w; xx += 6) R(xx, yy - 3, 1, 3, shade(rc, -0.25)); }
    R(-1, top, w + 2, 2, shade(rc, 0.45));
    R(-2, bot, w + 4, 3, shade(rc, -0.6)); R(-2, bot, w + 4, 1, shade(rc, -0.3));
    if (b.kind === 'house') { R(w - 18, top - 6, 7, 10, '#8a5040'); R(w - 19, top - 7, 9, 2, '#5a3020'); R(w - 17, top - 4, 2, 6, '#a86858'); }
    if (b.broken) { R(w - 30, top + 6, 11, 7, '#2a1a14'); R(w - 29, top + 7, 9, 5, '#0c0808'); R(w - 33, top + 12, 5, 2, shade(rc, -0.3)); R(w - 26, top + 13, 3, 2, shade(rc, 0.2)); }
  }
  const wy = roofH + 6;
  if (b.kind !== 'tower' && b.kind !== 'theater') for (let i = 0; i < b.w; i++) { if (i * 16 === dxDoor) continue; if (i % 2 === 0 || b.w <= 5) win(i * 16 + 2, wy); }
  if (b.kind === 'proa') {
    // toldo a rayas y cartel con proa de barco
    for (let i = 0; i < 28; i += 4) { R(dxDoor - 6 + i, roofH + 1, 4, 5, i % 8 ? '#ffffff' : '#e04848'); }
    R(dxDoor - 6, roofH + 6, 28, 1, '#a02828');
    R(dxDoor - 14, roofH - 12, 44, 11, '#ffffff'); R(dxDoor - 14, roofH - 12, 44, 1, '#e04848'); R(dxDoor - 14, roofH - 2, 44, 1, '#c0b0b0');
    txtTiny(x, 'PROA', dxDoor + 8, roofH - 10, '#d03838');
  }
  if (b.kind === 'studio') {
    R(dxDoor - 4, roofH - 10, 24, 14, '#1c1c24'); for (let i = 0; i < 5; i++) { x.fillStyle = '#f8f8f8'; x.beginPath(); x.moveTo(dxDoor - 3 + i * 5, roofH - 10); x.lineTo(dxDoor + i * 5, roofH - 10); x.lineTo(dxDoor - 1 + i * 5, roofH - 5); x.lineTo(dxDoor - 4 + i * 5, roofH - 5); x.fill(); }
    R(dxDoor - 2, roofH - 3, 20, 5, '#383848'); R(dxDoor - 2, roofH - 3, 20, 1, '#5a5a6c');
    for (const lx of [6, w - 14]) { R(lx, roofH + 3, 8, 6, '#303040'); R(lx + 1, roofH + 4, 6, 4, '#f8f0a0'); }
  }
  if (b.kind === 'theater') {
    R(4, roofH + 2, w - 8, 12, '#1c1418'); txtTiny(x, 'TEATRO', w / 2, roofH + 4, '#f8d040');
    for (let i = 6; i < w - 6; i += 6) R(i, roofH + 15, 2, 2, (i / 6) % 2 ? '#f8e070' : '#f8a040');
    R(8, roofH + 20, 12, 12, '#ffffff'); R(w - 20, roofH + 20, 12, 12, '#f8d040');
    R(10, roofH + 24, 2, 2, '#202020'); R(15, roofH + 24, 2, 2, '#202020'); R(11, roofH + 28, 5, 1, '#202020');
    R(w - 18, roofH + 24, 2, 2, '#202020'); R(w - 13, roofH + 24, 2, 2, '#202020'); R(w - 17, roofH + 29, 5, 1, '#202020');
    R(dxDoor - 10, roofH + 18, 6, h - roofH - 23, '#b02030'); R(dxDoor + 20, roofH + 18, 6, h - roofH - 23, '#b02030');
  }
  door(dxDoor, b.kind === 'proa' ? '#c84848' : b.kind === 'studio' ? '#5a4890' : '#7a4a28');
  if (b.kind === 'house' || b.kind === 'proa') { R(2, h - 8, 10, 3, '#5a9a40'); R(3, h - 9, 2, 1, '#f86080'); R(7, h - 9, 2, 1, '#f8e060'); }
  BLD_CACHE[key] = c;
  return c;
}
function txtTiny(x, s, cx, y, col) { x.font = FONT; x.textBaseline = 'top'; x.textAlign = 'center'; x.fillStyle = col; x.fillText(s, cx, y); x.textAlign = 'left'; }

// ---------- FONDOS DE COMBATE ----------
// Cielo con luz, capas de horizonte y un campo en perspectiva (bandas que se ensanchan hacia abajo).
const BG_CACHE = {};
const BGPAL = {
  grass: { sky: ['#5aa8f0', '#bfe6ff'], far: '#7cb8d8', mid: '#5ca868', near: '#4c9a50', g: ['#a6dc78', '#7cc45a', '#5aa846'], plat: ['#b8e888', '#78bc58', '#3c7c34'] },
  town: { sky: ['#78b0f0', '#e8f4ff'], far: '#a8bcd8', mid: '#c0a8b8', near: '#90a8a0', g: ['#e6e6c4', '#ccd2a8', '#a8b488'], plat: ['#f0f0d4', '#c4cca0', '#7c8860'] },
  cave: { sky: ['#24180f', '#4a3624'], far: '#3a2a1e', mid: '#4c3828', near: '#5c4430', g: ['#a88866', '#8a6c50', '#6a5038'], plat: ['#c4a480', '#8a6c50', '#4a3424'] },
  castle: { sky: ['#2a1c40', '#6c5094'], far: '#4c3c68', mid: '#5c4c7c', near: '#6c5c8c', g: ['#c8bcdc', '#a898c0', '#8070a0'], plat: ['#dcd0ec', '#a898c0', '#5c4c78'] },
  stage: { sky: ['#1c0810', '#5c1424'], far: '#801c2c', mid: '#a02838', near: '#c03040', g: ['#d09a5a', '#b07a40', '#8a5a28'], plat: ['#e8b070', '#b07a40', '#6a4018'] },
  tower: { sky: ['#0c1430', '#34487c'], far: '#283864', mid: '#34467a', near: '#405490', g: ['#b8c8e8', '#92a4cc', '#6c80b0'], plat: ['#d4e0f4', '#92a4cc', '#485c90'] },
};
function battleBg(kind) {
  if (BG_CACHE[kind]) return BG_CACHE[kind];
  const P = BGPAL[kind] || BGPAL.grass;
  const c = mkCanvas(W, H), x = c.getContext('2d');
  const HZ = 92;
  let g = x.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, P.sky[0]); g.addColorStop(1, P.sky[1]); x.fillStyle = g; x.fillRect(0, 0, W, HZ);
  const glow = x.createRadialGradient(196, 30, 4, 196, 30, 90); glow.addColorStop(0, '#ffffff70'); glow.addColorStop(1, '#ffffff00'); x.fillStyle = glow; x.fillRect(0, 0, W, HZ);
  const ridge = (base, amp, f1, f2, col, hi) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, HZ + 2);
    for (let i = 0; i <= W; i += 4) x.lineTo(i, base - Math.abs(Math.sin(i * f1)) * amp - Math.sin(i * f2) * amp * 0.4);
    x.lineTo(W, HZ + 2); x.fill();
    if (hi) { x.fillStyle = hi; for (let i = 0; i <= W; i += 4) { const y = base - Math.abs(Math.sin(i * f1)) * amp - Math.sin(i * f2) * amp * 0.4; x.fillRect(i, Math.round(y), 4, 1); } }
  };
  if (kind === 'grass' || kind === 'town') {
    x.fillStyle = '#ffffff';
    for (const [cx, cy, r] of [[34, 22, 8], [46, 18, 11], [60, 23, 8], [150, 12, 7], [162, 10, 10], [174, 14, 7]]) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = '#d8ecff'; x.fillRect(26, 26, 42, 4); x.fillRect(143, 18, 38, 4);
    ridge(74, 16, 0.025, 0.07, P.far, shade(P.far, 0.25));
    if (kind === 'grass') {
      ridge(84, 8, 0.05, 0.11, P.mid, shade(P.mid, 0.2));
      for (let i = -4; i < W; i += 9) { const h = 8 + ((i * 13) & 7); x.fillStyle = shade(P.near, -0.15); x.beginPath(); x.arc(i + 4, HZ - h + 4, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = P.near; x.beginPath(); x.arc(i + 3, HZ - h + 3, 5, 0, Math.PI * 2); x.fill(); }
    } else {
      for (let i = 0; i < 7; i++) { const bx = 4 + i * 38, bh = 18 + ((i * 7) % 3) * 7; x.fillStyle = shade(P.mid, -0.1 * (i % 2)); x.fillRect(bx, HZ - bh, 28, bh); x.fillStyle = '#e07070'; x.fillRect(bx - 2, HZ - bh - 4, 32, 5); x.fillStyle = '#f8f0c0'; for (let k = 0; k < 3; k++) x.fillRect(bx + 4 + k * 8, HZ - bh + 6, 4, 4); }
    }
  } else if (kind === 'cave') {
    for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#3a2a1e' : '#463424'; x.beginPath(); x.moveTo(i * 24 - 4, 0); x.lineTo(i * 24 + 10, 26 + (i % 3) * 12); x.lineTo(i * 24 + 26, 0); x.fill(); }
    ridge(88, 18, 0.04, 0.09, P.mid, shade(P.mid, 0.2));
    for (let i = 0; i < 6; i++) { const cx = 18 + i * 44, cy = 62 + (i % 2) * 10; x.fillStyle = '#2a8ac8'; x.fillRect(cx, cy, 4, 12); x.fillStyle = '#7ad8ff'; x.fillRect(cx + 1, cy, 2, 10); x.fillStyle = '#58c8f830'; x.beginPath(); x.arc(cx + 2, cy + 6, 10, 0, Math.PI * 2); x.fill(); }
  } else if (kind === 'castle') {
    for (let i = 0; i < 5; i++) { const px = 12 + i * 56; x.fillStyle = '#9888b8'; x.fillRect(px, 6, 14, HZ - 6); x.fillStyle = '#d8ccf0'; x.fillRect(px, 6, 4, HZ - 6); x.fillStyle = '#6c5c90'; x.fillRect(px + 12, 6, 2, HZ - 6); x.fillStyle = '#b0a0d0'; x.fillRect(px - 2, 4, 18, 4); }
    x.fillStyle = '#a02838'; x.fillRect(100, 0, 56, 64); x.fillStyle = '#c84050'; x.fillRect(100, 0, 6, 64); x.fillStyle = '#f8d040'; x.fillRect(122, 22, 12, 12); x.fillRect(126, 18, 4, 4);
  } else if (kind === 'stage') {
    for (let i = 0; i < W; i += 8) { x.fillStyle = i % 16 ? '#8c1424' : '#b02838'; x.fillRect(i, 0, 8, HZ); x.fillStyle = '#ffffff18'; x.fillRect(i + 1, 0, 1, HZ); }
    x.fillStyle = '#f8d040'; x.fillRect(0, 0, W, 6); x.fillStyle = '#c09020'; x.fillRect(0, 6, W, 2);
    for (const lx of [60, 196]) { const gl = x.createLinearGradient(lx, 0, lx, H); gl.addColorStop(0, '#fff8d060'); gl.addColorStop(1, '#fff8d000'); x.fillStyle = gl; x.beginPath(); x.moveTo(lx - 6, 0); x.lineTo(lx - 46, H); x.lineTo(lx + 46, H); x.lineTo(lx + 6, 0); x.fill(); }
  } else if (kind === 'tower') {
    for (let i = 0; i < 60; i++) { x.fillStyle = i % 5 ? '#ffffff90' : '#ffffff'; x.fillRect((hash2(i, 1) * W) | 0, (hash2(i, 2) * 80) | 0, 1, 1); }
    ridge(86, 10, 0.03, 0.08, P.far, shade(P.far, 0.3));
    for (let i = 0; i < 9; i++) { const bx = i * 30, bh = 10 + ((i * 5) % 4) * 6; x.fillStyle = '#1c2848'; x.fillRect(bx, HZ - bh, 22, bh); x.fillStyle = '#f8e07090'; x.fillRect(bx + 4, HZ - bh + 4, 2, 2); x.fillRect(bx + 12, HZ - bh + 8, 2, 2); }
  }
  // campo en perspectiva
  g = x.createLinearGradient(0, HZ, 0, H); g.addColorStop(0, P.g[0]); g.addColorStop(0.5, P.g[1]); g.addColorStop(1, P.g[2]); x.fillStyle = g; x.fillRect(0, HZ, W, H - HZ);
  let y = HZ + 3, step = 3;
  while (y < H) { x.fillStyle = shade(P.g[1], 0.12); x.fillRect(0, Math.round(y), W, 1); y += step; step *= 1.32; }
  x.fillStyle = shade(P.g[0], 0.3); x.fillRect(0, HZ, W, 1);
  for (let i = 0; i < 46; i++) { const yy = HZ + 4 + ((hash2(i, 6) * (H - HZ - 6)) | 0), ww = 2 + ((yy - HZ) / 20) | 0; x.fillStyle = shade(P.g[1], -0.12); x.fillRect((hash2(i, 5) * W) | 0, yy, ww, 1); }
  BG_CACHE[kind] = c;
  return c;
}
// Plataforma con espesor: borde oscuro, cara superior con degradé, anillo de textura y brillo.
function platform(ctx, cx, cy, rx, ry, kind) {
  const P = (BGPAL[kind] || BGPAL.grass).plat;
  const el = (y, a, b, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(cx, y, a, b, 0, 0, Math.PI * 2); ctx.fill(); };
  el(cy + 5, rx + 2, ry + 2, '#00000030');
  el(cy + 3, rx, ry, P[2]);
  const g = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.5, 2, cx, cy, rx); g.addColorStop(0, P[0]); g.addColorStop(1, P[1]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = shade(P[1], -0.15); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.72, ry * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = shade(P[0], 0.35); ctx.beginPath(); ctx.ellipse(cx, cy, rx - 1.5, ry - 1.5, 0, Math.PI * 1.05, Math.PI * 1.7); ctx.stroke();
  if (kind === 'grass' || !kind) for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const px = cx + Math.cos(a) * rx * 0.86, py = cy + Math.sin(a) * ry * 0.8; ctx.fillStyle = P[2]; ctx.fillRect(Math.round(px), Math.round(py) - 1, 1, 2); ctx.fillStyle = P[0]; ctx.fillRect(Math.round(px) + 1, Math.round(py) - 2, 1, 2); }
}

// ---------- ICONOS / INSIGNIAS ----------
function typeBadge(ctx, t, x, y, w = 40) {
  const T = TYPES[t];
  pill(ctx, x, y, w, 11, T.c, null);
  ctx.font = FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
  ctx.fillStyle = shade(T.c, -0.5); ctx.fillText(T.n.slice(0, 4).toUpperCase(), x + w / 2 + 1, y + 2);
  ctx.fillStyle = '#fff'; ctx.fillText(T.n.slice(0, 4).toUpperCase(), x + w / 2, y + 2);
  ctx.textAlign = 'left';
}
const STATUS = { brn: ['QUE', '#e86838'], par: ['PAR', '#d8b828'], slp: ['DOR', '#8888a8'] };
function statusBadge(ctx, st, x, y) {
  if (!st) return;
  const [n, c] = STATUS[st];
  pill(ctx, x, y, 28, 10, c, null);
  ctx.font = FONT; ctx.textBaseline = 'top'; ctx.fillStyle = '#fff'; ctx.fillText(n, x + 2, y + 1);
}
function hpBar(ctx, x, y, w, frac) {
  ctx.fillStyle = '#303040'; ctx.fillRect(x, y, w + 2, 5);
  ctx.fillStyle = '#505868'; ctx.fillRect(x + 1, y + 1, w, 3);
  const col = frac > 0.5 ? '#48d048' : frac > 0.2 ? '#f0c030' : '#f04838';
  const fw = Math.max(0, Math.round(w * frac));
  ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, fw, 3);
  ctx.fillStyle = shade(col, 0.4); ctx.fillRect(x + 1, y + 1, fw, 1);
}
function drawSpriteScaled(ctx, cv, x, y, sc, flip = false) {
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (flip) { ctx.translate(x + cv.width * sc, y); ctx.scale(-sc, sc); ctx.drawImage(cv, 0, 0); }
  else ctx.drawImage(cv, x, y, cv.width * sc, cv.height * sc);
  ctx.restore();
}
// mini-ícono 32x32 (para menús): sprite reducido a la mitad
const ICON_CACHE = {};
function creatureIcon(id) {
  if (ICON_CACHE[id]) return ICON_CACHE[id];
  const src = creatureSprite(id, true), c = mkCanvas(32, 32), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.translate(32, 0); x.scale(-1, 1); x.drawImage(src, 0, 0, 32, 32);
  ICON_CACHE[id] = c; return c;
}
// silueta (criaturario: visto pero no capturado)
const SIL_CACHE = {};
function silhouette(id) {
  if (SIL_CACHE[id]) return SIL_CACHE[id];
  const src = creatureSprite(id), c = mkCanvas(80, 80), x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#404860'; x.fillRect(0, 0, 80, 80);
  SIL_CACHE[id] = c; return c;
}
