// UI del Teatro (Pachi / André). Solo dibuja.
// Lógica de input y pelea: game.js (uTheater / startTheaterBattle).

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { postGame } from '../core/game-flags.js';

function dTheater() {
  const t = G.theater;
  if (!t) return;

  cx.fillStyle = 'rgba(8,6,16,0.82)';
  cx.fillRect(0, 0, 640, 480);

  const title =
    t.host === 'andre'
      ? 'TEATRO · ANDRÉ — JEFES (PRE-GAME)'
      : postGame
      ? 'TEATRO · PACHI — REPRESENTACIONES'
      : 'TEATRO · PACHI — ENSAYO';

  dBoxMenu(40, 24, 560, 432, title);

  cx.fillStyle = '#C8A830';
  cx.font = '6px "Press Start 2P"';
  if (t.host === 'andre') {
    cx.fillText('Simula a los Proas y al Rey con su aspecto de antes.', 56, 58);
    cx.fillText('Da EXP y oro. No entrega diplomas ni abre la torre.', 56, 74);
  } else {
    cx.fillText('Peleas que no ocurren en el mapa (ensayo / batallador).', 56, 58);
    cx.fillText(
      postGame
        ? '¡Todo listo para el espectáculo! EXP y oro normales.'
        : 'Tenía un espectáculo… me falta mi compañero. Aun así ensayamos.',
      56,
      74
    );
  }

  const bill = t.bill || [];
  const sel = t.sel || 0;
  const scroll = t.scroll || 0;
  const VIS = 7;

  if (!bill.length) {
    cx.fillStyle = '#666';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Cartelera vacía.', 56, 120);
    return;
  }

  const view = bill.slice(scroll, scroll + VIS);
  view.forEach((act, i) => {
    const idx = scroll + i;
    const y = 100 + i * 42;
    const active = sel === idx;
    if (active) {
      cx.fillStyle = 'rgba(255,215,0,0.12)';
      cx.fillRect(50, y - 16, 540, 40);
      cx.fillStyle = '#ffd700';
      cx.fillRect(50, y - 16, 3, 40);
    }
    cx.fillStyle = active ? '#ffd700' : '#fff';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${active ? '▶ ' : '  '}${act.nm}`, 60, y);
    cx.fillStyle = active ? '#aaa' : '#666';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(act.blurb || '', 80, y + 16);
  });

  if (scroll > 0) {
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('▲', 580, 95);
  }
  if (scroll + VIS < bill.length) {
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('▼', 580, 100 + VIS * 42 - 12);
  }

  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('↑↓ elegir   SPACE representar   X salir', 56, 430);
}

export { dTheater };
