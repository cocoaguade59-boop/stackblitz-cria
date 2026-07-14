// Escena de introducción tutorial: Alessandro se acerca al prota
// y le explica el reino antes de la elección del inicial.


import { cx } from '../core/canvas.js';
import { G } from '../core/game-state.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { kp } from '../core/input.js';
import { dNPC } from '../render/npc-sprites.js';
import { dPlayerGBA } from '../render/player-sprite.js';
import { dDialogBox, wrapText } from '../render/ui-boxes.js';
import { px } from '../render/render-utils.js';

// === INTRO TUTORIAL: ALESSANDRO ENTREGA EL INICIAL ===
const INTRO_LINES = [
  '¡Hey! ¡Bienvenido a Aldea Pitch!',
  'Soy Alessandro. Este reino vive junto a criaturas mágicas.',
  'Los Proa las cuidan cuando descansan, y los viajeros forman vínculos con ellas.',
  'Para avanzar entre pueblos necesitarás diplomas de líderes, como medallas.',
  'No te contaré todo: el camino, las cuevas y el castillo deben sorprenderte.',
  'Pero no irás solo. Elige un compañero inicial de Fuego, Agua o Planta.'
];

function uIntro() {
  if (!G.intro) G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
  const it = G.intro;
  if (G.tFr % 60 === 0) console.log('[uIntro] phase:', it.phase, 'y:', it.y, 'scr:', G.scr);
  if (it.phase === 0) {
    it.y += 2.4;
    if (it.y >= 198 || kp(' ') || kp('Enter')) {
      it.y = 198;
      it.phase = 1;
      it.tm = 0;
    }
    return;
  }
  it.tm++;
  const line = INTRO_LINES[it.li];
  if (!it.full && it.tm % 2 === 0) {
    it.ci++;
    if (it.ci >= line.length) it.full = true;
  }
  if (kp(' ') || kp('Enter')) {
    if (!it.full) {
      it.ci = line.length;
      it.full = true;
    } else {
      it.li++;
      if (it.li >= INTRO_LINES.length) {
        G.sSel = 0;
        G.scr = 'starter';
        G.intro = null;
        return;
      }
      it.ci = 0;
      it.tm = 0;
      it.full = false;
      sfx.sel();
    }
  }
}

function dIntro() {
  // Escena propia de introducción para evitar zonas negras por límites del mapa.
  const it = G.intro || { y: 198, phase: 1, li: 0, ci: 0, full: false };

  // Fondo completo de Aldea Pitch, dibujado a pantalla completa.
  cx.fillStyle = '#58A830';
  cx.fillRect(0, 0, 640, 480);
  cx.fillStyle = '#48982A';
  for (let yy = 0; yy < 480; yy += 32) {
    for (let xx = 0; xx < 640; xx += 32) {
      if (((xx + yy) / 32) % 2 === 0) cx.fillRect(xx, yy, 32, 32);
    }
  }
  // Plaza y caminos pixelados
  cx.fillStyle = '#C8B898';
  cx.fillRect(192, 132, 256, 210);
  cx.fillStyle = '#D8C8A8';
  for (let yy = 142; yy < 332; yy += 32) cx.fillRect(206, yy, 228, 4);
  for (let xx = 206; xx < 434; xx += 32) cx.fillRect(xx, 148, 4, 184);
  cx.fillStyle = '#B8A888';
  cx.fillRect(306, 0, 28, 480);
  cx.fillRect(0, 250, 640, 28);

  // Flores, cajas, pozo y muñecos de entrenamiento como contexto visual.
  for (let i = 0; i < 12; i++) {
    const fx = 70 + (i * 47) % 500;
    const fy = 80 + (i * 71) % 300;
    cx.fillStyle = i % 2 ? '#E85A82' : '#E8C830';
    cx.fillRect(fx, fy, 5, 5);
    cx.fillStyle = '#38A028';
    cx.fillRect(fx + 2, fy + 5, 1, 6);
  }
  // Pozo
  cx.fillStyle = '#6E6E6E'; cx.fillRect(286, 170, 42, 18);
  cx.fillStyle = '#8A8A8A'; cx.fillRect(292, 164, 30, 8);
  cx.fillStyle = '#202838'; cx.fillRect(296, 174, 22, 8);
  cx.fillStyle = '#6A4828'; cx.fillRect(290, 144, 5, 24); cx.fillRect(319, 144, 5, 24); cx.fillRect(290, 140, 34, 5);
  // Cajas
  cx.fillStyle = '#8A5A28'; cx.fillRect(452, 226, 22, 22); cx.fillRect(478, 214, 24, 34);
  cx.fillStyle = '#A07038'; cx.fillRect(456, 230, 14, 4); cx.fillRect(482, 218, 16, 4);
  // Muñecos
  cx.fillStyle = '#6A4828'; cx.fillRect(150, 210, 6, 42); cx.fillRect(132, 224, 42, 6);
  cx.fillStyle = '#C8B080'; cx.fillRect(140, 202, 26, 16);
  cx.fillStyle = '#E83030'; cx.fillRect(146, 208, 5, 5); cx.fillRect(156, 208, 5, 5);

  // Protagonista al centro de la imagen, mirando hacia Alessandro.
  dPlayerGBA(304, 252, 3, fr);

  // Recuadro blanco con borde pixel-art alrededor del sprite de Alessandro
  {
    const fw = 64, fh = 50;
    const frameX = 288, frameY = it.y - 10;
    // Sombra exterior
    px(frameX + 2, frameY + 2, fw, fh, 'rgba(0,0,0,.3)');
    // Borde oscuro
    px(frameX - 1, frameY - 1, fw + 2, fh + 2, '#1A1A2E');
    // Borde dorado
    px(frameX, frameY, fw, fh, '#C8A830');
    // Interior blanco
    px(frameX + 2, frameY + 2, fw - 4, fh - 4, '#F8F8F0');
  }

  // Alessandro se mueve hasta quedar al frente del jugador.
  dNPC(304, it.y, 'alessandro', fr);

  if (it.phase === 0) {
    dDialogBox(20, 390, 600, 70, 'Alessandro');
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Alessandro se acerca para darte la bienvenida...', 36, 420);
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('SPACE: acelerar', 36, 448);
    return;
  }

  const shown = INTRO_LINES[it.li].substring(0, it.ci);
  const lines = wrapText(shown, 48);
  dDialogBox(20, 372, 600, 96, 'Alessandro');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  lines.forEach((ln, i) => cx.fillText(ln, 36, 400 + i * 15));
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`${it.li + 1}/${INTRO_LINES.length}`, 560, 456);
  if (it.full) {
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', 590, 456 + Math.sin(fr * 0.2) * 2);
  }
}

export { INTRO_LINES, uIntro, dIntro };
