// Cajas de UI (dBox, dBoxMenu, dDialogBox, etc.) y utilidades de texto.
// Depende del contexto de canvas cx, primitivas px, y el contador fr para animar dArrow.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { fr } from '../core/frame.js';

// === CAJA DORADA MEDIEVAL (HUD del mundo) ===
function dBox(x, y, w, h, t) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(x + 3, y + 3, w, h);
  // Fondo azul oscuro
  cx.fillStyle = '#1a1a3e';
  cx.fillRect(x, y, w, h);
  // Borde dorado
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 3;
  cx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  cx.strokeStyle = '#6a4a0a';
  cx.lineWidth = 1;
  cx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  // Esquinas decorativas
  px(x, y, 6, 6, '#ffd700');
  px(x + w - 6, y, 6, 6, '#ffd700');
  px(x, y + h - 6, 6, 6, '#ffd700');
  px(x + w - 6, y + h - 6, 6, 6, '#ffd700');
  // Título si existe
  if (t) {
    cx.fillStyle = '#1a1a3e';
    cx.fillRect(x + 14, y - 8, t.length * 8 + 10, 16);
    cx.strokeStyle = '#8b6914';
    cx.lineWidth = 2;
    cx.strokeRect(x + 14, y - 8, t.length * 8 + 10, 16);
    cx.fillStyle = '#ffd700';
    cx.font = '9px "Press Start 2P"';
    cx.fillText(t, x + 20, y + 4);
  }
}


// === CAJA MENÚ/TIENDA (azul noche con dorado) ===
function dBoxMenu(x, y, w, h, t) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(x + 4, y + 4, w, h);
  // Fondo azul noche
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(x, y, w, h);
  // Borde dorado exterior grueso
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 4;
  cx.strokeRect(x, y, w, h);
  // Borde dorado interior
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 2;
  cx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  // Esquinas decorativas doradas
  px(x, y, 8, 8, '#ffd700');
  px(x + w - 8, y, 8, 8, '#ffd700');
  px(x, y + h - 8, 8, 8, '#ffd700');
  px(x + w - 8, y + h - 8, 8, 8, '#ffd700');
  // Detalle interno en esquinas
  px(x + 2, y + 2, 4, 4, '#1a1a3e');
  px(x + w - 6, y + 2, 4, 4, '#1a1a3e');
  px(x + 2, y + h - 6, 4, 4, '#1a1a3e');
  px(x + w - 6, y + h - 6, 4, 4, '#1a1a3e');
  // Título
  if (t) {
    cx.fillStyle = '#0a0a2e';
    const titleW = t.length * 11 + 22;
    cx.fillRect(x + 20, y - 10, titleW, 20);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.strokeRect(x + 20, y - 10, titleW, 20);
    cx.fillStyle = '#fff';
    cx.font = '10px "Press Start 2P"';
    cx.fillText(t, x + 28, y + 4);
  }
}


// === CAJA DE DIÁLOGO (blanca con borde negro) ===
function dDialogBox(x, y, w, h, name) {
  // Borde negro exterior
  cx.fillStyle = '#000';
  cx.fillRect(x, y, w, h);
  // Fondo blanco
  cx.fillStyle = '#F8F8F8';
  cx.fillRect(x + 3, y + 3, w - 6, h - 6);
  // Bordes interiores sutiles
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + 2, w - 4, 1);
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + h - 3, w - 4, 1);
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + 2, 1, h - 4);
  cx.fillStyle = '#000';
  cx.fillRect(x + w - 3, y + 2, 1, h - 4);
  // Nombre del NPC arriba si existe
  if (name) {
    const nameW = name.length * 9 + 14;
    cx.fillStyle = '#000';
    cx.fillRect(x + 10, y - 18, nameW, 20);
    cx.fillStyle = '#F8F8F8';
    cx.fillRect(x + 12, y - 16, nameW - 4, 16);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(name, x + 18, y - 4);
  }
}


// === CAJA DE DIÁLOGO ADAPTATIVA ===
// Calcula altura según líneas y centra texto verticalmente
function dDialogAdaptive(x, y, w, lines, name) {
  const padY = 14,
    lineH = 15;
  const h = padY * 2 + Math.max(1, lines.length) * lineH + 4;
  dDialogBox(x, y, w, h, name);
  return { x, y, w, h };
}


// === SEPARAR TEXTO EN LÍNEAS según ancho ===
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + word).length > maxChars) {
      if (current) lines.push(current.trim());
      current = word + ' ';
    } else {
      current += word + ' ';
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}


// === BOTÓN/OPCIÓN DE MENÚ ===
function dMenuOption(x, y, text, selected, color = '#fff') {
  cx.fillStyle = selected ? '#ffd700' : color;
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${selected ? '▶ ' : '  '}${text}`, x, y);
}


// === FLECHA INDICADORA ANIMADA ===
function dArrow(x, y, color = '#ffd700') {
  cx.fillStyle = color;
  cx.font = '10px "Press Start 2P"';
  cx.fillText('▼', x, y + Math.sin(fr * 0.2) * 2);
}

export { dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow };
