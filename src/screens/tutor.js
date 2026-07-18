// Pantallas del tutor Hernán (T8).
// Solo DIBUJA. La lógica (uHernan*) vive inline en script.js.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { dBoxMenu, dDialogBox } from '../render/ui-boxes.js';
import { tCol, tNam, tEmo } from '../data/types.js';
import { LEARN_POOL } from '../entities/learn-pool.js';

const TUTOR_COST = 2;

function getTutorMoves(cre) {
  if (!cre) return [];
  const pool = LEARN_POOL[cre.tp] || [];
  return pool.map((entry, i) => {
    const mv = entry.mv;
    const known = cre.mv.some((m) => m.nm === mv.nm);
    return {
      idx: i,
      lv: entry.lv,
      mv,
      known,
    };
  });
}

function dHernanChoice() {
  cx.fillStyle = 'rgba(0,0,0,.55)';
  cx.fillRect(0, 0, 640, 480);

  const boxW = 500,
    boxH = 180;
  const boxX = (640 - boxW) / 2,
    boxY = 140;
  dDialogBox(boxX, boxY, boxW, boxH, 'Hernán');

  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Puedo enseñarle un movimiento', boxX + 18, boxY + 32);
  cx.fillText('a una de tus criaturas.', boxX + 18, boxY + 50);
  cx.fillStyle = '#6A4010';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Costo: ${TUTOR_COST} Pergaminos de Batalla`, boxX + 18, boxY + 74);
  cx.fillStyle = '#444';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Tus pergaminos: ${G.scrolls || 0}`, boxX + 18, boxY + 94);

  const sel = G.herSel || 0;
  cx.fillStyle = sel === 0 ? '#C83030' : '#505060';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`${sel === 0 ? '▶ ' : '  '}Sí, enseñame algo`, boxX + 30, boxY + 122);

  cx.fillStyle = sel === 1 ? '#C83030' : '#505060';
  cx.fillText(`${sel === 1 ? '▶ ' : '  '}Ahora no`, boxX + 30, boxY + 148);

  cx.fillStyle = '#808090';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('↑↓ elegir   SPACE confirmar   X salir', boxX + 18, boxY + 170);
}

function dHernanPickCre() {
  cx.fillStyle = 'rgba(0,0,0,.72)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(60, 30, 520, 420, 'HERNÁN · ELEGIR CRIATURA');

  cx.fillStyle = '#C8A830';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('¿A quién le enseño?  (pool del tipo de la criatura)', 80, 70);

  const sel = G.herCreSel || 0;
  G.party.forEach((c, i) => {
    const y = 100 + i * 48;
    const active = sel === i;
    if (active) {
      cx.fillStyle = 'rgba(255,215,0,0.12)';
      cx.fillRect(80, y - 16, 480, 42);
      cx.fillStyle = '#ffd700';
      cx.fillRect(80, y - 16, 3, 42);
    }
    cx.fillStyle = active ? '#ffd700' : tCol(c.tp);
    cx.font = '9px "Press Start 2P"';
    cx.fillText(`${active ? '▶ ' : '  '}${tEmo(c.tp)} ${c.nm}`, 90, y);
    cx.fillStyle = '#aaa';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Lv.${c.lv}  ${tNam(c.tp)}  ·  ${(LEARN_POOL[c.tp] || []).length} movs tutor`, 110, y + 16);
  });

  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(`Pergaminos: ${G.scrolls || 0}/${TUTOR_COST}   SPACE elegir   X cancelar`, 80, 420);
}

function dHernanPickMove() {
  const cre = G.party[G.herCreSel || 0];
  const moves = getTutorMoves(cre);
  const sel = G.herMoveSel || 0;
  const scroll = G.herMoveScroll || 0;
  const VIS = 8;

  cx.fillStyle = 'rgba(0,0,0,.78)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(40, 20, 560, 440, 'HERNÁN · ELEGIR MOVIMIENTO');

  if (!cre) {
    cx.fillStyle = '#888';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Sin criatura.', 60, 80);
    return;
  }

  cx.fillStyle = '#C8A830';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${tEmo(cre.tp)} ${cre.nm} · pool ${tNam(cre.tp)}`, 60, 60);
  cx.fillStyle = '#888';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('Todos los movimientos del tipo (LEARN_POOL). Ya conocidos en gris.', 60, 78);

  if (moves.length === 0) {
    cx.fillStyle = '#888';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('No hay movimientos para este tipo.', 60, 120);
  } else {
    const view = moves.slice(scroll, scroll + VIS);
    view.forEach((row, i) => {
      const idx = scroll + i;
      const y = 100 + i * 36;
      const active = sel === idx;
      if (active) {
        cx.fillStyle = 'rgba(255,215,0,0.12)';
        cx.fillRect(50, y - 14, 540, 34);
        cx.fillStyle = '#ffd700';
        cx.fillRect(50, y - 14, 3, 34);
      }
      const col = row.known ? '#555' : active ? '#ffd700' : '#fff';
      cx.fillStyle = col;
      cx.font = '8px "Press Start 2P"';
      cx.fillText(
        `${active ? '▶ ' : '  '}${row.mv.nm}${row.known ? '  (ya lo sabe)' : ''}`,
        60,
        y
      );
      cx.fillStyle = row.known ? '#444' : tCol(row.mv.tp);
      cx.font = '5px "Press Start 2P"';
      cx.fillText(
        `Lv.${row.lv}  ${tNam(row.mv.tp)}  PW:${row.mv.pw}  PP:${row.mv.mp}${row.mv.ef ? '  [' + row.mv.ef + ']' : ''}`,
        80,
        y + 14
      );
    });
    if (scroll > 0) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▲', 580, 95);
    }
    if (scroll + VIS < moves.length) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▼', 580, 100 + VIS * 36 - 10);
    }
  }

  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('↑↓ mover   SPACE elegir   X volver', 60, 430);
}

function dHernanPickSlot() {
  const cre = G.party[G.herCreSel || 0];
  const moves = getTutorMoves(cre);
  const moveRow = moves[G.herMoveSel || 0];
  const sel = G.herSlotSel || 0;

  cx.fillStyle = 'rgba(0,0,0,.78)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(50, 40, 540, 400, 'HERNÁN · REEMPLAZAR SLOT');

  if (!cre || !moveRow) {
    cx.fillStyle = '#888';
    cx.fillText('Error de selección.', 70, 100);
    return;
  }

  cx.fillStyle = '#C8A830';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${cre.nm} aprenderá:`, 70, 80);
  cx.fillStyle = '#fff';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`★ ${moveRow.mv.nm}`, 70, 104);
  cx.fillStyle = tCol(moveRow.mv.tp);
  cx.font = '6px "Press Start 2P"';
  cx.fillText(
    `${tNam(moveRow.mv.tp)} PW:${moveRow.mv.pw} PP:${moveRow.mv.mp}`,
    70,
    124
  );

  cx.fillStyle = '#ffd700';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('¿Cuál olvidar?', 70, 160);

  cre.mv.forEach((m, i) => {
    const y = 185 + i * 32;
    const active = sel === i;
    cx.fillStyle = active ? '#ffd700' : '#aaa';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${active ? '▶ ' : '  '}${m.nm}`, 80, y);
    cx.fillStyle = tCol(m.tp);
    cx.font = '5px "Press Start 2P"';
    cx.fillText(`${tNam(m.tp)} PW:${m.pw} PP:${m.pp}/${m.mp}`, 280, y);
  });

  const cancel = sel === cre.mv.length;
  cx.fillStyle = cancel ? '#ffd700' : '#666';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${cancel ? '▶ ' : '  '}Cancelar`, 80, 185 + cre.mv.length * 32);

  cx.fillStyle = '#888';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(`Costo: ${TUTOR_COST} pergaminos (tenés ${G.scrolls || 0})`, 70, 400);
  cx.fillText('SPACE confirmar   X volver', 70, 420);
}

export {
  dHernanChoice,
  dHernanPickCre,
  dHernanPickMove,
  dHernanPickSlot,
  getTutorMoves,
  TUTOR_COST,
};
