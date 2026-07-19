// Renderizado de notificaciones flotantes y partículas.
// Los arrays viven en G.nots y G.pts (poblados por particles.js).
// T11d–f: soporta kind pixel | ring | text.

import { cx } from '../core/canvas.js';
import { G } from '../core/game-state.js';

// === DIBUJAR NOTIFICACIONES ===
function drawNotifications() {
  G.nots.forEach((n, i) => {
    const a = Math.min(1, n.l / 30);
    const ny = 80 + i * 22;
    cx.globalAlpha = a;
    cx.fillStyle = 'rgba(0,0,0,.85)';
    cx.fillRect(160, ny, 320, 18);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 1;
    cx.strokeRect(160, ny, 320, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(n.t, 320, ny + 13);
  });
  cx.globalAlpha = 1;
  cx.textAlign = 'left';
}

// === DIBUJAR PARTÍCULAS ===
function drawParticles() {
  G.pts.forEach((p) => {
    const a = Math.max(0, p.l / p.ml);
    cx.globalAlpha = a;
    if (p.kind === 'text' && p.text) {
      cx.fillStyle = p.c;
      cx.font = '8px "Press Start 2P"';
      cx.textAlign = 'center';
      cx.fillText(p.text, p.x, p.y);
      cx.textAlign = 'left';
    } else if (p.kind === 'ring') {
      cx.strokeStyle = p.c;
      cx.lineWidth = 2;
      cx.strokeRect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
    } else {
      cx.fillStyle = p.c;
      cx.fillRect(p.x, p.y, p.s || 3, p.s || 3);
    }
  });
  cx.globalAlpha = 1;
}

export { drawNotifications, drawParticles };
