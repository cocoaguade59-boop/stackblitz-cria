// Utilidades básicas de dibujo pixel-art: px, pixelGlow, pixelDiamond.
// Depende del contexto 2D (cx) de canvas.js.

import { cx } from '../core/canvas.js';

function px(x, y, w, h, c) {
  cx.fillStyle = c;
  cx.fillRect(x, y, w, h);
}

function pixelGlow(cx0, cy0, w, h) {
  // Brillo/sombra 100% pixel-art: sin círculos ni elipses suaves.
  const x = Math.round(cx0), y = Math.round(cy0);
  const ww = Math.max(2, Math.round(w)), hh = Math.max(2, Math.round(h));
  cx.fillRect(x - ww, y - Math.floor(hh * 0.35), ww * 2, Math.max(1, Math.floor(hh * 0.7)));
  cx.fillRect(x - Math.floor(ww * 0.7), y - Math.floor(hh * 0.65), Math.floor(ww * 1.4), Math.max(1, Math.floor(hh * 1.3)));
  cx.fillRect(x - Math.floor(ww * 0.35), y - hh, Math.floor(ww * 0.7), hh * 2);
}

function pixelDiamond(x, y, w, h, c) {
  // Diamante/trapecio por franjas rectangulares, estilo pixel-art.
  const rows = 6;
  for (let i = 0; i < rows; i++) {
    const t = i < rows / 2 ? i / (rows / 2) : (rows - 1 - i) / (rows / 2);
    const rw = Math.max(2, Math.round(w * (0.25 + t * 0.75)));
    const ry = y + Math.round((h / rows) * i);
    px(x + Math.round((w - rw) / 2), ry, rw, Math.ceil(h / rows), c);
  }
}

export { px, pixelGlow, pixelDiamond };
