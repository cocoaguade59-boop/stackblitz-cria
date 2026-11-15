// Íconos y botones relacionados con tipos de criatura y movimientos.
// Depende de tCol/tNam para los colores de tipo.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { tCol, tNam, tEff } from '../data/types.js';

// === EFECTIVIDAD VISIBLE EN LA CASILLA ===
// En vez de mostrar "×2" (números en un juego de pixel art de 6px se leen
// mal), se enmarca la casilla: naranja = pega fuerte, azul = pega poco.
// El jugador aprende la tabla mirando, sin leer nada.
// Sólo dos colores, como se pidió: naranja = pega fuerte, azul = pega poco.
// La inmunidad (x0) es el caso extremo de "pega poco", así que también va azul;
// agregar un tercer color rompería el minimalismo y no aporta información.
const EFF_SUPER = '#F08A20';   // naranja: súper eficaz
const EFF_WEAK = '#3C7AE0';    // azul: poco eficaz (incluye inmune)

/**
 * Color del marco según el tipo del movimiento contra el tipo del enemigo.
 * Devuelve null si es neutral (no se dibuja marco, para no ensuciar la UI).
 */
function moveEffFrame(tp, enemyType) {
  if (!tp || !enemyType) return null;
  const eff = tEff(tp, enemyType);
  if (eff > 1) return EFF_SUPER;
  if (eff < 1) return EFF_WEAK; // incluye 0.5 y la inmunidad (0)
  return null;
}

// === ICONO DE TIPO DE CRIATURA ===
function dTypeIcon(x, y, tp) {
  const c = tCol(tp);
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, 38, 12);
  cx.fillStyle = c;
  cx.fillRect(x, y, 36, 10);
  cx.fillStyle = '#fff';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(tNam(tp), x + 2, y + 8);
}


// === BOTÓN DE ATAQUE ESTILO RPG CLÁSICO ===
const MOVE_UI_COLORS = {
  fire: ['#E04030', '#8C1F18'],
  water: ['#3888E0', '#1B4F93'],
  plant: ['#48A038', '#246A22'],
  dragon: ['#6838A0', '#3E206E'],
  fairy: ['#D860A8', '#8E336C'],
  normal: ['#A8A878', '#6E704A'],
  ice: ['#70C8E8', '#3B86A0'],
  ground: ['#C09050', '#79572D'],
  fighting: ['#C85038', '#7D2D22'],
  electric: ['#E8C830', '#9A7B15'],
  psychic: ['#E85888', '#943354'],
  dark: ['#584838', '#30261E'],
  steel: ['#A8A8C0', '#686878'],
  poison: ['#A040A0', '#642064'],
  bug: ['#90A820', '#566812'],
  rock: ['#B8A038', '#75651F'],
  ghost: ['#705898', '#42315D'],
};

function moveUiCol(tp, dark = false) {
  const pair = MOVE_UI_COLORS[tp] || [tCol(tp), '#555'];
  return pair[dark ? 1 : 0];
}

function movePpColor(pp, max) {
  const r = max > 0 ? pp / max : 0;
  if (pp <= 0 || r <= 0.2) return '#D02020';
  if (r <= 0.5) return '#C89000';
  return '#1A1A1A';
}

function dMoveButton(x, y, w, h, mv, selected, enemyType) {
  const disabled = mv.pp <= 0;
  const effFrame = disabled ? null : moveEffFrame(mv.tp, enemyType);
  const main = disabled ? '#777' : moveUiCol(mv.tp);
  const dark = disabled ? '#444' : moveUiCol(mv.tp, true);
  const inner = disabled ? '#C8C8C0' : '#E6EAD8';
  const inner2 = disabled ? '#A8A8A0' : '#D2D9C4';

  // sombra externa + relieve por capas, con esquinas pixeladas
  px(x + 3, y + 4, w - 3, h - 2, 'rgba(0,0,0,.45)');
  px(x + 3, y, w - 6, h, dark);
  px(x, y + 3, w, h - 6, dark);
  px(x + 4, y + 1, w - 8, h - 2, main);
  px(x + 1, y + 4, w - 2, h - 8, main);
  // brillo superior/izquierdo
  px(x + 5, y + 3, w - 10, 2, selected ? '#FFF2A0' : 'rgba(255,255,255,.35)');
  px(x + 3, y + 5, 2, h - 10, 'rgba(255,255,255,.25)');
  // sombra inferior/derecha
  px(x + 5, y + h - 5, w - 10, 3, dark);
  px(x + w - 5, y + 5, 3, h - 10, dark);

  // interior común
  px(x + 8, y + 8, w - 16, h - 16, inner);
  px(x + 10, y + 10, w - 20, h - 20, inner2);
  px(x + 10, y + 10, w - 20, 2, 'rgba(255,255,255,.45)');

  // Marco de efectividad: cuadrado de 2px por fuera de la casilla.
  // Va antes que el brillo de seleccionado para que no lo tape.
  if (effFrame) {
    px(x - 2, y - 2, w + 4, 2, effFrame);          // arriba
    px(x - 2, y + h, w + 4, 2, effFrame);          // abajo
    px(x - 2, y - 2, 2, h + 4, effFrame);          // izquierda
    px(x + w, y - 2, 2, h + 4, effFrame);          // derecha
  }

  if (selected) {
    px(x + 8, y + 6, 8, 3, '#FFE870');
    px(x + w - 16, y + 6, 8, 3, '#FFE870');
    px(x + 8, y + h - 9, 8, 3, '#FFE870');
    px(x + w - 16, y + h - 9, 8, 3, '#FFE870');
  }

  // Nombre centrado arriba
  cx.textAlign = 'center';
  cx.fillStyle = disabled ? '#666' : '#1A1A1A';
  cx.font = mv.nm.length > 15 ? '6px "Press Start 2P"' : '7px "Press Start 2P"';
  cx.fillText(mv.nm, x + w / 2, y + 19);
  cx.textAlign = 'left';

  // Cápsula de tipo abajo izquierda
  const pillX = x + 13,
    pillY = y + h - 18,
    pillW = 62,
    pillH = 12;
  px(pillX + 3, pillY, pillW - 6, pillH, dark);
  px(pillX, pillY + 3, pillW, pillH - 6, dark);
  px(pillX + 4, pillY + 2, pillW - 8, pillH - 4, main);
  cx.fillStyle = '#fff';
  cx.font = '5px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(tNam(mv.tp), pillX + pillW / 2, pillY + 8);
  cx.textAlign = 'left';

  // PP abajo derecha
  cx.fillStyle = movePpColor(mv.pp, mv.mp);
  cx.font = '6px "Press Start 2P"';
  cx.textAlign = 'right';
  cx.fillText(`PP ${mv.pp}/${mv.mp}`, x + w - 13, y + h - 9);
  cx.textAlign = 'left';
}


export {
  dTypeIcon, moveUiCol, movePpColor, dMoveButton,
  moveEffFrame, EFF_SUPER, EFF_WEAK,
};
