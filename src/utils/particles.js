// Sistema de partículas y notificaciones flotantes.
// Depende del game state G para almacenar arrays activos.

import { G } from '../core/game-state.js';

// === PARTICLES & NOTIFICATIONS ===
function aP(x, y, c, l = 30) {
  G.pts.push({
    x,
    y,
    c,
    l,
    ml: l,
    vx: (Math.random() - 0.5) * 3,
    vy: -Math.random() * 3 - 1,
    s: 2 + Math.random() * 3,
  });
}
function aN(t, d = 150) {
  G.nots.push({ t, l: d, ml: d });
}
function uP() {
  G.pts = G.pts.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.l--;
    return p.l > 0;
  });
  G.nots = G.nots.filter((n) => {
    n.l--;
    return n.l > 0;
  });
}

export { aP, aN, uP };
