// Renderizado de notificaciones flotantes y partículas.
// Los arrays viven en G.nots y G.pts (poblados por particles.js).

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
    cx.globalAlpha = p.l / p.ml;
    cx.fillStyle = p.c;
    cx.fillRect(p.x, p.y, p.s, p.s);
  });
  cx.globalAlpha = 1;
}

export { drawNotifications, drawParticles };
