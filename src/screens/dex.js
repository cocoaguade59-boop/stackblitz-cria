// Pantalla del Criaturario (Dex).
// Muestra una grilla de criaturas con las descubiertas a color
// y las no descubiertas como siluetas.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { CDB } from '../data/creatures.js';
import { dexIds } from '../data/dex-order.js';
import { tCol, tEmo, tNam } from '../data/types.js';
import { dCre } from '../render/creature-sprites.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { captureCount, proa } from '../core/game-flags.js';

function hasCapturedSpecies(id) {
  if (G.supervisor) return true;
  return (captureCount[id] || 0) > 0 || G.party.some((c) => c.id === id) || proa.some((c) => c.id === id);
}

function uDex() {
  const ids = dexIds();
  const cols = 5;
  if (kp('ArrowLeft')) { G.dexSel = (G.dexSel + ids.length - 1) % ids.length; sfx.sel(); }
  if (kp('ArrowRight')) { G.dexSel = (G.dexSel + 1) % ids.length; sfx.sel(); }
  if (kp('ArrowUp')) { G.dexSel = (G.dexSel + ids.length - cols) % ids.length; sfx.sel(); }
  if (kp('ArrowDown')) { G.dexSel = (G.dexSel + cols) % ids.length; sfx.sel(); }
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) G.showDex = false;
}

function dDex() {
  dBoxMenu(28, 12, 584, 456, 'CRIATURARIO');
  const ids = dexIds();
  const cols = 5, cellW = 108, cellH = 58;
  const startX = 48, startY = 50;
  const pageSize = 30;
  const page = Math.floor(G.dexSel / pageSize);
  const start = page * pageSize;
  const shown = ids.slice(start, start + pageSize);
  const captured = ids.filter((id) => hasCapturedSpecies(id)).length;
  cx.fillStyle = '#ffd700';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Capturadas: ${captured}/${ids.length}`, 48, 36);
  shown.forEach((id, idx) => {
    const realIdx = start + idx;
    const col = idx % cols, row = Math.floor(idx / cols);
    const x = startX + col * cellW, y = startY + row * cellH;
    const sel = G.dexSel === realIdx;
    const caught = hasCapturedSpecies(id);
    cx.fillStyle = sel ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.03)';
    cx.fillRect(x - 4, y - 4, cellW - 8, cellH - 6);
    cx.strokeStyle = sel ? '#ffd700' : caught ? tCol(CDB[id].tp) : '#303040';
    cx.lineWidth = sel ? 2 : 1;
    cx.strokeRect(x - 4, y - 4, cellW - 8, cellH - 6);
    cx.save();
    if (!caught) cx.filter = 'brightness(0)';
    dCre(x + 20, y + 2, id, 5, fr);
    cx.restore();
    cx.fillStyle = caught ? '#fff' : '#606070';
    cx.font = caught ? '5px "Press Start 2P"' : '4px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(caught ? CDB[id].nm : '?????', x + 48, y + 45);
    cx.textAlign = 'left';
  });
  const cur = ids[G.dexSel];
  if (cur) {
    const caught = hasCapturedSpecies(cur);
    cx.fillStyle = '#0a0a2e';
    cx.fillRect(36, 410, 568, 42);
    cx.strokeStyle = caught ? tCol(CDB[cur].tp) : '#555';
    cx.strokeRect(36, 410, 568, 42);
    cx.fillStyle = caught ? tCol(CDB[cur].tp) : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(caught ? `${tEmo(CDB[cur].tp)} ${CDB[cur].nm} - ${tNam(CDB[cur].tp)}` : 'Silueta desconocida', 50, 428);
    cx.fillStyle = '#aaa';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(caught ? (CDB[cur].desc || 'Sin datos.') : 'Captura esta criatura para revelar sus datos.', 50, 444);
  }
  cx.fillStyle = '#606878';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('Flechas: navegar | SPACE/X: volver', 360, 36);
}

export { uDex, dDex, hasCapturedSpecies };
