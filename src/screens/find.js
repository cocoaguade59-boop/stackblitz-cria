// Pantalla de hallazgo de pin (T3+T4).
// Estilo SaloGon / vision: icono grande + texto del loot.
// Lógica de input (uFind) se invoca desde game.js para no pelear con el bug double-G;
// este módulo solo dibuja y expone helpers de presentación.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { fr } from '../core/frame.js';
import { px } from '../render/render-utils.js';
import {
  CRYSTAL_INFO,
  FRAGRANCE_LABELS,
  FRAGMENT_LABELS,
} from '../data/pins.js';

function lootTitle(loot) {
  if (!loot) return 'Hallazgo';
  if (loot.kind === 'fragment') return FRAGMENT_LABELS[loot.color] || 'Fragmento';
  if (loot.kind === 'fragrance') return FRAGRANCE_LABELS[loot.type] || 'Fragancia';
  if (loot.kind === 'scroll') return 'Pergamino de Batalla';
  return 'Hallazgo';
}

function lootSubtitle(loot) {
  if (!loot) return '';
  if (loot.kind === 'fragment') {
    const info = CRYSTAL_INFO[loot.color];
    return info
      ? `Pieza de ${info.label}. Fabiana puede armarlo.`
      : 'Un fragmento brillante.';
  }
  if (loot.kind === 'fragrance') {
    return 'David-O puede convertirla en incienso.';
  }
  if (loot.kind === 'scroll') {
    return 'Hernán acepta 2 por una enseñanza.';
  }
  return '';
}

/** Fragmento: astilla irregular (NO el cristal completo). */
function drawFragmentIcon(cx0, cy0, colorCode, scale = 1) {
  const info = CRYSTAL_INFO[colorCode] || CRYSTAL_INFO.p;
  const s = scale;

  // pedestal bajo
  cx.fillStyle = '#404858';
  cx.fillRect(cx0 - 22 * s, cy0 + 28 * s, 44 * s, 8 * s);
  cx.fillStyle = '#505868';
  cx.fillRect(cx0 - 16 * s, cy0 + 24 * s, 32 * s, 6 * s);

  const gl = 0.78 + Math.sin(fr * 0.14) * 0.22;
  cx.globalAlpha = gl;

  // astilla principal (romboide chico, irregular)
  cx.fillStyle = info.colorDark;
  cx.fillRect(cx0 - 10 * s, cy0 - 8 * s, 18 * s, 28 * s);
  cx.fillRect(cx0 - 14 * s, cy0 + 0 * s, 10 * s, 16 * s);
  cx.fillRect(cx0 + 6 * s, cy0 - 4 * s, 10 * s, 18 * s);
  // punta superior irregular
  cx.fillRect(cx0 - 4 * s, cy0 - 18 * s, 10 * s, 12 * s);
  cx.fillRect(cx0 + 2 * s, cy0 - 22 * s, 6 * s, 8 * s);

  cx.fillStyle = info.color;
  cx.fillRect(cx0 - 6 * s, cy0 - 4 * s, 12 * s, 20 * s);
  cx.fillRect(cx0 - 10 * s, cy0 + 4 * s, 6 * s, 10 * s);
  cx.fillRect(cx0 + 4 * s, cy0 + 0 * s, 6 * s, 12 * s);
  cx.fillRect(cx0 - 2 * s, cy0 - 14 * s, 6 * s, 10 * s);

  cx.fillStyle = info.colorLight;
  cx.fillRect(cx0 - 2 * s, cy0 - 2 * s, 5 * s, 12 * s);
  cx.fillRect(cx0 + 0 * s, cy0 - 12 * s, 3 * s, 6 * s);

  // brillo
  cx.fillStyle = '#fff';
  cx.fillRect(cx0 - 1 * s, cy0 + 2 * s, 2 * s, 6 * s);
  cx.globalAlpha = 1;

  // astillas sueltas alrededor (refuerza que es un pedazo)
  cx.fillStyle = info.colorDark;
  cx.fillRect(cx0 - 26 * s, cy0 + 10 * s, 8 * s, 6 * s);
  cx.fillRect(cx0 + 18 * s, cy0 + 6 * s, 7 * s, 8 * s);
  cx.fillStyle = info.color;
  cx.fillRect(cx0 - 24 * s, cy0 + 12 * s, 4 * s, 3 * s);
  cx.fillRect(cx0 + 20 * s, cy0 + 8 * s, 4 * s, 4 * s);
}

function drawFragranceIcon(cx0, cy0, type) {
  // frasco
  cx.fillStyle = '#D8D0C0';
  cx.fillRect(cx0 - 16, cy0 - 8, 32, 48);
  cx.fillStyle = '#B8B0A0';
  cx.fillRect(cx0 - 14, cy0 - 6, 28, 44);
  // cuello
  cx.fillStyle = '#A09070';
  cx.fillRect(cx0 - 8, cy0 - 20, 16, 14);
  cx.fillStyle = '#C8A830';
  cx.fillRect(cx0 - 10, cy0 - 24, 20, 6);

  const tint = {
    picante: '#E05030',
    dulce: '#F080C0',
    salada: '#40A0E0',
    amarga: '#7040B0',
    saludable: '#40C060',
  }[type] || '#E05030';

  cx.fillStyle = tint;
  cx.globalAlpha = 0.85;
  cx.fillRect(cx0 - 10, cy0 + 4, 20, 28);
  cx.globalAlpha = 1;
  // brillo líquido
  cx.fillStyle = '#fff';
  cx.globalAlpha = 0.35;
  cx.fillRect(cx0 - 6, cy0 + 8, 4, 16);
  cx.globalAlpha = 1;

  // vapores
  const bob = Math.sin(fr * 0.15) * 3;
  cx.globalAlpha = 0.45 + Math.sin(fr * 0.2) * 0.2;
  cx.fillStyle = tint;
  cx.fillRect(cx0 - 4, cy0 - 36 + bob, 4, 4);
  cx.fillRect(cx0 + 4, cy0 - 42 - bob, 3, 3);
  cx.fillRect(cx0 - 10, cy0 - 30 - bob * 0.5, 3, 3);
  cx.globalAlpha = 1;
}

function drawScrollIcon(cx0, cy0) {
  // rollo
  cx.fillStyle = '#D8C490';
  cx.fillRect(cx0 - 28, cy0 - 20, 56, 44);
  cx.fillStyle = '#C8B070';
  cx.fillRect(cx0 - 26, cy0 - 16, 52, 36);
  // líneas de texto
  cx.fillStyle = '#8A7040';
  cx.fillRect(cx0 - 18, cy0 - 6, 36, 2);
  cx.fillRect(cx0 - 18, cy0 + 2, 28, 2);
  cx.fillRect(cx0 - 18, cy0 + 10, 32, 2);
  // extremos del rollo
  cx.fillStyle = '#A88840';
  cx.fillRect(cx0 - 32, cy0 - 24, 8, 52);
  cx.fillRect(cx0 + 24, cy0 - 24, 8, 52);
  cx.fillStyle = '#C8A830';
  cx.fillRect(cx0 - 30, cy0 - 20, 4, 44);
  cx.fillRect(cx0 + 26, cy0 - 20, 4, 44);
  // sello dorado
  cx.fillStyle = '#C83030';
  cx.fillRect(cx0 - 8, cy0 + 0, 16, 16);
  cx.fillStyle = '#E8C840';
  cx.fillRect(cx0 - 4, cy0 + 4, 8, 8);
  // brillo
  if (Math.floor(fr / 16) % 2 === 0) {
    cx.fillStyle = '#fff';
    cx.fillRect(cx0 + 10, cy0 - 12, 3, 3);
  }
}

function dFind() {
  const v = G.find;
  if (!v) return;

  // fondo oscuro semi
  cx.fillStyle = 'rgba(8, 6, 16, 0.72)';
  cx.fillRect(0, 0, 640, 480);

  // marco estilo pergamino / hallazgo
  px(70, 40, 500, 360, '#5A4A30');
  px(74, 44, 492, 352, '#2A2218');
  px(78, 48, 484, 344, '#1A1420');

  // esquinas doradas
  px(70, 40, 14, 14, '#C8A830');
  px(556, 40, 14, 14, '#C8A830');
  px(70, 386, 14, 14, '#C8A830');
  px(556, 386, 14, 14, '#C8A830');

  cx.fillStyle = '#C8A830';
  cx.font = '10px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('¡HALLAZGO!', 320, 78);

  cx.fillStyle = '#5A4A30';
  cx.fillRect(110, 90, 420, 1);

  // icono grande
  const iconX = 320;
  const iconY = 200;
  const loot = v.loot;
  if (loot?.kind === 'fragment') drawFragmentIcon(iconX, iconY, loot.color, 1.4);
  else if (loot?.kind === 'fragrance') drawFragranceIcon(iconX, iconY, loot.type);
  else if (loot?.kind === 'scroll') drawScrollIcon(iconX, iconY);
  else drawFragmentIcon(iconX, iconY, 'p', 1.2);

  // partículas suaves alrededor
  cx.globalAlpha = 0.35 + Math.sin(fr * 0.12) * 0.15;
  const sparkCol =
    loot?.kind === 'fragment'
      ? (CRYSTAL_INFO[loot.color] || CRYSTAL_INFO.p).colorLight
      : loot?.kind === 'fragrance'
      ? '#F0D0A0'
      : '#E8C840';
  cx.fillStyle = sparkCol;
  for (let i = 0; i < 6; i++) {
    const a = fr * 0.05 + i * 1.1;
    const rr = 70 + (i % 3) * 12;
    cx.fillRect(
      iconX + Math.cos(a) * rr - 1,
      iconY + Math.sin(a * 1.3) * (rr * 0.55) - 1,
      3,
      3
    );
  }
  cx.globalAlpha = 1;

  // nombre del loot
  cx.fillStyle = '#F0E0B0';
  cx.font = '9px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(v.label || lootTitle(loot), 320, 300);

  // subtítulo
  cx.fillStyle = '#A09070';
  cx.font = '6px "Press Start 2P"';
  const sub = lootSubtitle(loot);
  if (sub) cx.fillText(sub, 320, 322);

  // rareza
  const rarityLabel =
    v.rarity === 'rare' ? 'RARO' : v.rarity === 'uncommon' ? 'POCO COMÚN' : 'COMÚN';
  const rarityCol =
    v.rarity === 'rare' ? '#F09030' : v.rarity === 'uncommon' ? '#30D0E0' : '#A0A0B0';
  cx.fillStyle = rarityCol;
  cx.font = '7px "Press Start 2P"';
  cx.fillText(rarityLabel, 320, 348);

  // hint
  cx.fillStyle = '#C8A830';
  cx.font = '7px "Press Start 2P"';
  const bob = Math.sin(fr * 0.2) * 2;
  cx.fillText('SPACE / ENTER — continuar', 320, 380 + bob);
  cx.textAlign = 'left';
}

export { dFind, lootTitle, lootSubtitle };
