// Battle HUD estilo NDS / pixel-art 32-bit.
// Reemplaza las funciones antiguas dBattlePanel + dHP para el combate.
// Provee un único punto de entrada: dBattleHud(x, y, w, h, cre, opts).
//
// Depende de: cx (canvas.js), px (render-utils.js)

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';

// -------------------------------------------------------------
// PATRÓN DE ESQUINA CONVEXA (pillow)
// Para cada fila cercana a la esquina (0..5) decimos cuántos
// píxeles hay que "recortar" hacia dentro desde el borde.
// [3,2,1,1,0,0] → curva suave hacia afuera.
// -------------------------------------------------------------
const CORNER_EXT = [3, 2, 1, 1, 0, 0];

// Decide si un píxel (px, py) DENTRO de un rect [rx, ry, rw, rh]
// debe dibujarse según qué esquinas están marcadas como convexas.
function _shouldDraw(pxX, pxY, rx, ry, rw, rh, corners) {
  if (pxX < rx || pxX >= rx + rw || pxY < ry || pxY >= ry + rh) return false;
  const dxL = pxX - rx;
  const dxR = (rx + rw - 1) - pxX;
  const dyT = pxY - ry;
  const dyB = (ry + rh - 1) - pxY;
  const N = CORNER_EXT.length;
  if (corners.tl && dxL < N && dyT < N && dxL < CORNER_EXT[dyT]) return false;
  if (corners.tr && dxR < N && dyT < N && dxR < CORNER_EXT[dyT]) return false;
  if (corners.bl && dxL < N && dyB < N && dxL < CORNER_EXT[dyB]) return false;
  if (corners.br && dxR < N && dyB < N && dxR < CORNER_EXT[dyB]) return false;
  return true;
}

// Dibuja una "capa" del recuadro respetando las esquinas convexas.
// Usa fillRect por fila (más rápido que píxel a píxel en canvas).
function _drawLayer(x, y, w, h, color, corners) {
  cx.fillStyle = color;
  const N = CORNER_EXT.length;
  // Cuerpo central (filas donde ninguna esquina afecta): dibujar de una
  const centerStart = y + N;
  const centerEnd = y + h - N;
  if (centerEnd > centerStart) {
    cx.fillRect(x, centerStart, w, centerEnd - centerStart);
  }
  // Filas superiores e inferiores: dibujar por segmentos según esquinas
  for (let dy = 0; dy < N; dy++) {
    // Fila superior (y + dy)
    let leftCut = 0, rightCut = 0;
    if (corners.tl) leftCut = CORNER_EXT[dy];
    if (corners.tr) rightCut = CORNER_EXT[dy];
    if (leftCut + rightCut < w) {
      cx.fillRect(x + leftCut, y + dy, w - leftCut - rightCut, 1);
    }
    // Fila inferior (y + h - 1 - dy)
    leftCut = 0; rightCut = 0;
    if (corners.bl) leftCut = CORNER_EXT[dy];
    if (corners.br) rightCut = CORNER_EXT[dy];
    if (leftCut + rightCut < w) {
      cx.fillRect(x + leftCut, y + h - 1 - dy, w - leftCut - rightCut, 1);
    }
  }
}

// -------------------------------------------------------------
// RECUADRO principal (con capas y sombra)
// -------------------------------------------------------------
export function dPillowFrame(x, y, w, h, corners) {
  // Sombra (+3, +3)
  _drawLayer(x + 3, y + 3, w, h, '#000000', corners);
  // Borde exterior oscuro
  _drawLayer(x, y, w, h, '#202028', corners);
  // Borde metálico claro
  _drawLayer(x + 2, y + 2, w - 4, h - 4, '#A0A8B8',
    _shrinkCorners(corners));
  // Borde interior oscuro
  _drawLayer(x + 4, y + 4, w - 8, h - 8, '#484C58',
    _shrinkCorners(corners));
  // Fondo interior plateado
  _drawLayer(x + 6, y + 6, w - 12, h - 12, '#C8D0D8',
    _shrinkCorners(corners));
  // Highlight superior (2px)
  _drawLayer(x + 6, y + 6, w - 12, 2, '#E8ECF4',
    _shrinkCorners(corners));
}

// Las capas interiores tienen esquinas más suaves — reducimos la extensión
// del patrón para las capas que están 2+ píxeles hacia dentro.
function _shrinkCorners(corners) {
  // Devolvemos las mismas esquinas activas — el patrón es el mismo.
  // (Alternativamente podríamos suavizar más, pero visualmente queda bien así.)
  return corners;
}

// -------------------------------------------------------------
// Texto con outline (para contraste)
// -------------------------------------------------------------
function _textOutlined(text, x, y, fill, outline, size = 1) {
  cx.fillStyle = outline;
  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      if (dx === 0 && dy === 0) continue;
      cx.fillText(text, x + dx, y + dy);
    }
  }
  cx.fillStyle = fill;
  cx.fillText(text, x, y);
}

// -------------------------------------------------------------
// Etiqueta PS (amarillo sobre gris oscuro, pegada a la barra)
// -------------------------------------------------------------
function dPsLabel(x, y, h) {
  const w = 26;
  cx.fillStyle = '#282830';
  cx.fillRect(x, y, w, h);
  cx.strokeStyle = '#101014';
  cx.lineWidth = 1;
  cx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  cx.font = '10px "Press Start 2P"';
  cx.textBaseline = 'top';
  cx.textAlign = 'left';
  _textOutlined('PS', x + 4, y + 4, '#F8D838', '#402808', 1);
  cx.textBaseline = 'alphabetic';
  return w;
}

// -------------------------------------------------------------
// Barra HP con marco negro y colores según ratio
// -------------------------------------------------------------
function dHpBarNew(x, y, w, h, hp, hpMax) {
  const ratio = Math.max(0, Math.min(1, hp / hpMax));
  // Marco negro
  cx.fillStyle = '#181820';
  cx.fillRect(x - 1, y - 1, w + 2, h + 2);
  // Fondo vacío
  cx.fillStyle = '#383840';
  cx.fillRect(x, y, w, h);
  // Colores
  let light, dark;
  if (ratio > 0.5)       { light = '#70E860'; dark = '#309028'; }
  else if (ratio > 0.2)  { light = '#F8D028'; dark = '#B07808'; }
  else                   { light = '#F04838'; dark = '#902018'; }
  const fw = Math.round(w * ratio);
  if (fw > 0) {
    cx.fillStyle = dark;
    cx.fillRect(x, y, fw, h);
    cx.fillStyle = light;
    cx.fillRect(x, y, fw, h - 2);
    // Brillo superior
    cx.fillStyle = '#FFFFFF';
    cx.fillRect(x, y, fw, 1);
  }
}

// -------------------------------------------------------------
// Símbolos de género pixel-art (dibujados con rectángulos)
// -------------------------------------------------------------
function dGenderIcon(x, y, gender) {
  if (gender === 'M') {
    const col = '#3878E8';
    // círculo
    px(x + 1, y + 4, 7, 7, col);
    px(x, y + 5, 9, 5, col);
    px(x + 3, y + 6, 3, 3, '#E8E8F0');
    // flecha
    px(x + 6, y + 1, 6, 4, col);
    px(x + 9, y, 3, 4, col);
    px(x + 10, y, 2, 2, col);
  } else {
    const col = '#E86098';
    // círculo
    px(x + 1, y + 1, 7, 8, col);
    px(x, y + 2, 9, 6, col);
    px(x + 3, y + 3, 3, 4, '#F0DCE6');
    // cruz
    px(x + 3, y + 9, 3, 5, col);
    px(x + 1, y + 11, 7, 2, col);
  }
}

// -------------------------------------------------------------
// Insignia de estado (PAR / QUE / DOR / ENV / CON / DRE / MAL)
// -------------------------------------------------------------
// Mapeo desde estados internos del juego al label de 3 letras
const STATUS_LABEL = {
  burn:     'QUE', // Quemadura
  paralyze: 'PAR', // Parálisis
  sleep:    'DOR', // Dormido
  confuse:  'CON', // Confuso
  leech:    'DRE', // Drenadoras
  curse:    'MAL', // Maldito
  poison:   'ENV', // Envenenado
};

const STATUS_STYLE = {
  QUE: { top: '#E84838', bottom: '#801818', outline: '#480808' }, // Quemadura
  PAR: { top: '#F8D030', bottom: '#C07020', outline: '#804808' }, // Parálisis
  DOR: { top: '#C8C8D0', bottom: '#606068', outline: '#303038' }, // Dormido
  CON: { top: '#E080E8', bottom: '#803088', outline: '#401848' }, // Confuso
  DRE: { top: '#88D848', bottom: '#387008', outline: '#183808' }, // Drenadoras
  MAL: { top: '#605060', bottom: '#302030', outline: '#100810' }, // Maldito
  ENV: { top: '#B060D0', bottom: '#502870', outline: '#281038' }, // Envenenado
};

function _statusToLabel(status) {
  return STATUS_LABEL[status] || null;
}

function dStatusBadge(x, y, w, h, label) {
  const st = STATUS_STYLE[label];
  if (!st) return;
  // Sombra
  cx.fillStyle = '#000000';
  cx.fillRect(x + 2, y + 2, w, h);
  // Cuerpo superior
  cx.fillStyle = st.top;
  cx.fillRect(x, y, w, h - 4);
  // Cuerpo inferior (más oscuro)
  cx.fillStyle = st.bottom;
  cx.fillRect(x, y + h - 4, w, 4);
  // Marco negro
  cx.strokeStyle = '#181820';
  cx.lineWidth = 1;
  cx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // Highlight superior 1px (color top clareado)
  const highlight = _lighten(st.top, 40);
  cx.fillStyle = highlight;
  cx.fillRect(x + 1, y + 1, w - 2, 1);
  // Texto blanco con outline oscuro
  cx.font = '10px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.textBaseline = 'top';
  _textOutlined(label, x + w / 2, y + 4, '#FFFFFF', st.outline, 1);
  cx.textAlign = 'left';
  cx.textBaseline = 'alphabetic';
}

// Utilidad simple para clarear un color hex
function _lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// -------------------------------------------------------------
// HUD COMPLETO — punto de entrada único
// -------------------------------------------------------------
// x, y, w, h: rectángulo donde va el HUD
// cre: la criatura (con .nm, .lv, .hp, .mHp, .gender)
// opts: { isPlayer: bool, status: string|null }
// -------------------------------------------------------------
export function dBattleHud(x, y, w, h, cre, opts) {
  const isPlayer = !!opts.isPlayer;
  const status = opts.status || null;

  // Esquinas convexas: 3 redondeadas + 1 en punta apuntando al dueño
  const corners = isPlayer
    ? { tl: true, tr: true, bl: false, br: true }   // punta abajo-izquierda
    : { tl: true, tr: true, bl: true,  br: false }; // punta abajo-derecha

  dPillowFrame(x, y, w, h, corners);

  const innerLeft  = x + 14;
  const innerRight = x + w - 14;

  // Nombre grande arriba
  cx.font = '14px "Press Start 2P"';
  cx.fillStyle = '#181828';
  cx.textBaseline = 'top';
  cx.textAlign = 'left';
  cx.fillText(cre.nm, innerLeft, y + 12);

  // Nivel a la derecha
  cx.font = '12px "Press Start 2P"';
  const lvText = `Lv${cre.lv}`;
  const lvWidth = cx.measureText(lvText).width;
  const lvX = innerRight - lvWidth;
  cx.fillText(lvText, lvX, y + 14);

  // Género a la izquierda del Lv
  if (cre.gender) {
    dGenderIcon(lvX - 18, y + 14, cre.gender);
  }

  // FILA DE ESTADO + PS + BARRA (misma altura)
  const rowY = y + 40;
  const rowH = 18;
  let xCursor = innerLeft;

  const statusLabel = _statusToLabel(status);
  if (statusLabel) {
    const badgeW = 48;
    dStatusBadge(xCursor, rowY, badgeW, rowH, statusLabel);
    xCursor += badgeW + 6;
  }

  // PS label pegado a la barra
  const psW = dPsLabel(xCursor, rowY, rowH);
  const barX = xCursor + psW + 1;
  const barEnd = innerRight;
  const barW = barEnd - barX;
  const barH = 12;
  const barY = rowY + Math.floor((rowH - barH) / 2);
  dHpBarNew(barX, barY, barW, barH, cre.hp, cre.mHp);

  // Números HP debajo (solo jugador)
  if (isPlayer) {
    cx.font = '11px "Press Start 2P"';
    cx.fillStyle = '#181828';
    const hpText = `${cre.hp}/${cre.mHp}`;
    const tw = cx.measureText(hpText).width;
    cx.fillText(hpText, innerRight - tw, rowY + rowH + 8);
  }

  cx.textBaseline = 'alphabetic';
}
