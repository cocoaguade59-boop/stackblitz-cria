// Barras (HP, EXP) y panel legacy dBattlePanel.
// dBattlePanel ya casi no se usa (reemplazado por battle-hud.js) pero se
// mantiene por compatibilidad con partes viejas del código.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';

// === BARRA DE HP estilo GBA ===
function dHP(x, y, w, h, c, m) {
  const r = c / m;
  const co = r > 0.5 ? '#30D848' : r > 0.25 ? '#E8C020' : '#E03020';
  // Borde negro
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, w + 2, h + 2);
  // Fondo
  cx.fillStyle = '#383838';
  cx.fillRect(x, y, w, h);
  // Barra de vida
  cx.fillStyle = co;
  cx.fillRect(x, y, Math.max(0, w * r), h);
  // Brillo superior
  cx.fillStyle = 'rgba(255,255,255,.3)';
  cx.fillRect(x, y, Math.max(0, w * r), Math.floor(h / 2));
  // Label HP
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('HP', x - 18, y + h);
  // Texto numérico
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${c}/${m}`, x + w + 4, y + h);
}


// === BARRA DE EXP ===
function dEXP(x, y, w, h, c, m) {
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, w + 2, h + 2);
  cx.fillStyle = '#383838';
  cx.fillRect(x, y, w, h);
  cx.fillStyle = '#3888E0';
  cx.fillRect(x, y, w * (c / m), h);
  cx.fillStyle = 'rgba(255,255,255,.3)';
  cx.fillRect(x, y, w * (c / m), 1);
}


// === PANEL DE BATALLA (enemigo arriba / jugador abajo) ===
function dBattlePanel(x, y, w, h, isEnemy) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.5)';
  cx.fillRect(x + 3, y + 3, w, h);
  // Fondo según lado
  cx.fillStyle = isEnemy ? '#2a1a3e' : '#1a2a4e';
  cx.fillRect(x, y, w, h);
  // Borde dorado
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 2;
  cx.strokeRect(x, y, w, h);
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 1;
  cx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  // Esquinas
  px(x, y, 4, 4, '#ffd700');
  px(x + w - 4, y, 4, 4, '#ffd700');
  px(x, y + h - 4, 4, 4, '#ffd700');
  px(x + w - 4, y + h - 4, 4, 4, '#ffd700');
}


export { dHP, dEXP, dBattlePanel };
