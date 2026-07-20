// Pantalla de inventario de Objetos (fragmentos, fragancias, pergaminos, cristales, inciensos).
// Solo DIBUJA. La lógica de input (uObjects) vive inline en game.js
// para no pelear con el bug double-G de StackBlitz.
//
// Reglas:
// - Solo aparecen objetos con count >= 1 (nunca "×0").
// - Sprites pixel-art por tipo:
//     cristal  = gema grande facetada
//     fragmento = astilla pequeña (más chica que el cristal)
//     fragancia = tubo de ensayo
//     incienso  = urna pequeña
//     pergamino = rollo con sello

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import {
  CRYSTAL_INFO,
  FRAGRANCE_LABELS,
  FRAGRANCE_TYPES,
  FRAGMENT_LABELS,
} from '../data/pins.js';

const FRAGRANCE_COLORS = {
  picante: '#E05030',
  dulce: '#F080C0',
  salada: '#40A0E0',
  amarga: '#A060E0',
  saludable: '#40C060',
};

/** Solo objetos que el jugador POSEE (count >= 1). */
function buildObjectRows() {
  const rows = [];

  // Cristales armados (grandes)
  const crystals = [
    { code: 'p', key: 'crv' },
    { code: 'c', key: 'crvC' },
    { code: 'o', key: 'crvO' },
  ];
  for (const c of crystals) {
    const n = G[c.key] || 0;
    if (n <= 0) continue;
    const info = CRYSTAL_INFO[c.code];
    rows.push({
      kind: 'crystal',
      code: c.code,
      name: info.label,
      count: n,
      desc: `${info.desc} · captura`,
      color: info.color,
      colorDark: info.colorDark,
      colorLight: info.colorLight,
    });
  }

  // Fragmentos (más chicos que el cristal)
  const fr = G.frag || { p: 0, c: 0, o: 0 };
  for (const code of ['p', 'c', 'o']) {
    const n = fr[code] || 0;
    if (n <= 0) continue;
    const info = CRYSTAL_INFO[code];
    rows.push({
      kind: 'fragment',
      code,
      name: FRAGMENT_LABELS[code],
      count: n,
      desc: '4 = 1 cristal · Fabiana puede armarlo',
      color: info.color,
      colorDark: info.colorDark,
      colorLight: info.colorLight,
    });
  }

  // Pergaminos
  if ((G.scrolls || 0) > 0) {
    rows.push({
      kind: 'scroll',
      name: 'Pergamino de Batalla',
      count: G.scrolls,
      desc: 'Hernán acepta 2 por enseñanza',
      color: '#E8C840',
    });
  }

  // Fragancias (tubos de ensayo)
  const fg = G.fragrances || {};
  for (const type of FRAGRANCE_TYPES) {
    const n = fg[type] || 0;
    if (n <= 0) continue;
    rows.push({
      kind: 'fragrance',
      type,
      name: FRAGRANCE_LABELS[type] || type,
      count: n,
      desc: 'David-O: +10G → incienso',
      color: FRAGRANCE_COLORS[type] || '#ccc',
    });
  }

  // Inciensos (urnas)
  const inc = G.incense || {};
  for (const type of FRAGRANCE_TYPES) {
    const n = inc[type] || 0;
    if (n <= 0) continue;
    rows.push({
      kind: 'incense',
      type,
      name: `Incienso ${type}`,
      count: n,
      desc: '200 pasos · 75% del tipo · SPACE activar',
      color: FRAGRANCE_COLORS[type] || '#ccc',
    });
  }

  // Incienso activo (info, no es un stack)
  if (G.activeIncense) {
    rows.push({
      kind: 'active',
      type: G.activeIncense.type,
      name: `Incienso activo: ${G.activeIncense.type}`,
      count: G.activeIncense.stepsLeft || 0,
      desc: 'pasos restantes',
      color: '#ffd700',
      isSteps: true,
    });
  }

  return rows;
}

// ── Sprites pixel-art (16×16-ish, dibujados en el slot de la fila) ──────────

/** Cristal armado: gema grande facetada (más grande que el fragmento). */
function drawCrystalSprite(ox, oy, color, colorDark, colorLight) {
  // pedestal
  cx.fillStyle = '#404858';
  cx.fillRect(ox + 2, oy + 18, 16, 3);
  cx.fillStyle = '#505868';
  cx.fillRect(ox + 4, oy + 16, 12, 3);

  // cuerpo alto
  cx.fillStyle = colorDark || '#5E1FA8';
  cx.fillRect(ox + 5, oy + 2, 10, 15);
  cx.fillStyle = color || '#9A4FE0';
  cx.fillRect(ox + 7, oy + 4, 6, 12);
  // faceta superior
  cx.fillStyle = colorLight || '#E6B8FF';
  cx.fillRect(ox + 8, oy + 3, 4, 3);
  cx.fillRect(ox + 9, oy + 6, 2, 7);
  // brillo
  cx.fillStyle = '#fff';
  cx.fillRect(ox + 8, oy + 7, 1, 4);
  // facetas laterales
  cx.fillStyle = colorDark || '#5E1FA8';
  cx.fillRect(ox + 2, oy + 8, 3, 7);
  cx.fillRect(ox + 15, oy + 7, 3, 8);
  cx.fillStyle = color || '#9A4FE0';
  cx.fillRect(ox + 3, oy + 9, 2, 4);
  cx.fillRect(ox + 15, oy + 9, 2, 5);
}

/** Fragmento: astilla pequeña (claramente más chica que el cristal). */
function drawFragmentSprite(ox, oy, color, colorDark, colorLight) {
  // astilla inclinada / irregular, compacta
  cx.fillStyle = colorDark || '#5E1FA8';
  cx.fillRect(ox + 7, oy + 8, 6, 8);
  cx.fillRect(ox + 6, oy + 10, 3, 5);
  cx.fillRect(ox + 11, oy + 9, 3, 5);
  cx.fillStyle = color || '#9A4FE0';
  cx.fillRect(ox + 8, oy + 9, 4, 6);
  cx.fillStyle = colorLight || '#E6B8FF';
  cx.fillRect(ox + 9, oy + 10, 2, 3);
  // brillo chico
  cx.fillStyle = '#fff';
  cx.fillRect(ox + 9, oy + 11, 1, 2);
  // punta irregular
  cx.fillStyle = colorDark || '#5E1FA8';
  cx.fillRect(ox + 9, oy + 6, 3, 3);
  cx.fillStyle = color || '#9A4FE0';
  cx.fillRect(ox + 10, oy + 7, 2, 2);
}

/** Fragancia: tubo de ensayo con líquido de color. */
function drawFragranceSprite(ox, oy, tint) {
  // vidrio
  cx.fillStyle = '#C8D0D8';
  cx.fillRect(ox + 7, oy + 4, 6, 14);
  cx.fillStyle = '#A8B0B8';
  cx.fillRect(ox + 7, oy + 4, 1, 14);
  cx.fillRect(ox + 12, oy + 4, 1, 14);
  // cuello
  cx.fillStyle = '#B0B8C0';
  cx.fillRect(ox + 8, oy + 1, 4, 4);
  // tapón de corcho
  cx.fillStyle = '#C89040';
  cx.fillRect(ox + 7, oy + 0, 6, 2);
  cx.fillStyle = '#E0A850';
  cx.fillRect(ox + 8, oy + 0, 4, 1);
  // líquido
  cx.fillStyle = tint || '#E05030';
  cx.fillRect(ox + 8, oy + 10, 4, 7);
  cx.fillStyle = '#fff';
  cx.globalAlpha = 0.35;
  cx.fillRect(ox + 9, oy + 11, 1, 4);
  cx.globalAlpha = 1;
  // base redondeada del tubo
  cx.fillStyle = '#A8B0B8';
  cx.fillRect(ox + 8, oy + 17, 4, 1);
  cx.fillStyle = tint || '#E05030';
  cx.fillRect(ox + 8, oy + 16, 4, 1);
}

/** Incienso: urna pequeña con humo/aroma. */
function drawIncenseSprite(ox, oy, tint) {
  // cuerpo de urna
  cx.fillStyle = '#6A5040';
  cx.fillRect(ox + 5, oy + 10, 10, 8);
  cx.fillStyle = '#8A6850';
  cx.fillRect(ox + 6, oy + 11, 8, 6);
  // panza
  cx.fillStyle = '#5A4030';
  cx.fillRect(ox + 4, oy + 13, 12, 4);
  cx.fillStyle = '#7A5840';
  cx.fillRect(ox + 5, oy + 14, 10, 2);
  // cuello
  cx.fillStyle = '#6A5040';
  cx.fillRect(ox + 7, oy + 7, 6, 4);
  cx.fillStyle = '#9A7860';
  cx.fillRect(ox + 8, oy + 8, 4, 2);
  // tapa
  cx.fillStyle = '#4A3020';
  cx.fillRect(ox + 6, oy + 5, 8, 3);
  cx.fillStyle = '#C8A830';
  cx.fillRect(ox + 8, oy + 4, 4, 2);
  // humo del aroma (tint)
  cx.fillStyle = tint || '#E05030';
  cx.globalAlpha = 0.7;
  cx.fillRect(ox + 9, oy + 1, 2, 3);
  cx.fillRect(ox + 11, oy + 0, 2, 2);
  cx.fillRect(ox + 7, oy + 0, 1, 2);
  cx.globalAlpha = 1;
  // base
  cx.fillStyle = '#4A3020';
  cx.fillRect(ox + 5, oy + 17, 10, 2);
}

/** Pergamino con sello. */
function drawScrollSprite(ox, oy) {
  cx.fillStyle = '#D8C490';
  cx.fillRect(ox + 3, oy + 5, 14, 12);
  cx.fillStyle = '#C8B070';
  cx.fillRect(ox + 4, oy + 6, 12, 10);
  // líneas
  cx.fillStyle = '#8A7040';
  cx.fillRect(ox + 5, oy + 8, 10, 1);
  cx.fillRect(ox + 5, oy + 11, 8, 1);
  cx.fillRect(ox + 5, oy + 14, 9, 1);
  // extremos del rollo
  cx.fillStyle = '#A88840';
  cx.fillRect(ox + 2, oy + 4, 2, 14);
  cx.fillRect(ox + 16, oy + 4, 2, 14);
  // sello
  cx.fillStyle = '#C83030';
  cx.fillRect(ox + 8, oy + 10, 4, 4);
  cx.fillStyle = '#E8C840';
  cx.fillRect(ox + 9, oy + 11, 2, 2);
}

/** Estrella / activo. */
function drawActiveSprite(ox, oy, tint) {
  drawIncenseSprite(ox, oy, tint);
  // brillo extra
  cx.fillStyle = '#ffd700';
  cx.fillRect(ox + 1, oy + 2, 2, 2);
  cx.fillRect(ox + 17, oy + 4, 2, 2);
}

function drawObjectSprite(row, ox, oy) {
  switch (row.kind) {
    case 'crystal':
      drawCrystalSprite(ox, oy, row.color, row.colorDark, row.colorLight);
      break;
    case 'fragment':
      drawFragmentSprite(ox, oy, row.color, row.colorDark, row.colorLight);
      break;
    case 'fragrance':
      drawFragranceSprite(ox, oy, row.color);
      break;
    case 'incense':
      drawIncenseSprite(ox, oy, row.color);
      break;
    case 'scroll':
      drawScrollSprite(ox, oy);
      break;
    case 'active':
      drawActiveSprite(ox, oy, FRAGRANCE_COLORS[row.type] || '#ffd700');
      break;
    default:
      cx.fillStyle = row.color || '#fff';
      cx.fillRect(ox + 6, oy + 6, 8, 8);
  }
}

function dObjects() {
  const rows = buildObjectRows();
  const sel = Math.min(G.os?.s || 0, Math.max(0, rows.length - 1));
  const scroll = G.os?.scroll || 0;
  const VISIBLE = 8;
  const ROW_H = 36;

  cx.fillStyle = 'rgba(0,0,0,.72)';
  cx.fillRect(0, 0, 640, 480);

  dBoxMenu(40, 24, 560, 430, 'MOCHILA · OBJETOS');

  // Hint de Fabiana
  cx.fillStyle = '#8A7A50';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('Fabiana (Storyboard) puede armar 4 fragmentos → 1 cristal', 56, 54);

  // Separador
  cx.fillStyle = '#3A3040';
  cx.fillRect(56, 62, 528, 1);

  if (rows.length === 0) {
    cx.fillStyle = '#666';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Mochila vacía.', 56, 110);
    cx.fillStyle = '#555';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Busca pines en el mapa (SPACE).', 56, 135);
    cx.fillText('Los pines dejan fragmentos, fragancias o pergaminos.', 56, 155);
    cx.fillText('Fabiana arma cristales con 4 fragmentos del mismo color.', 56, 175);
  } else {
    const maxScroll = Math.max(0, rows.length - VISIBLE);
    const sc = Math.max(0, Math.min(scroll, maxScroll));
    const view = rows.slice(sc, sc + VISIBLE);

    view.forEach((row, i) => {
      const idx = sc + i;
      const y = 78 + i * ROW_H;
      const active = sel === idx;

      if (active) {
        cx.fillStyle = 'rgba(255,215,0,0.12)';
        cx.fillRect(50, y - 10, 540, ROW_H - 2);
        cx.fillStyle = '#ffd700';
        cx.fillRect(50, y - 10, 3, ROW_H - 2);
      } else if (i % 2 === 0) {
        cx.fillStyle = 'rgba(255,255,255,0.03)';
        cx.fillRect(50, y - 10, 540, ROW_H - 2);
      }

      // Slot del sprite
      cx.fillStyle = 'rgba(0,0,0,0.35)';
      cx.fillRect(58, y - 6, 24, 24);
      cx.fillStyle = active ? '#5A4A20' : '#2A2830';
      cx.fillRect(59, y - 5, 22, 22);

      drawObjectSprite(row, 60, y - 4);

      // Nombre
      cx.fillStyle = active ? '#ffd700' : '#fff';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(row.name, 92, y + 4);

      // Contador (solo ≥1; nunca ×0)
      cx.fillStyle = active ? '#ffd700' : '#E8E0C0';
      cx.font = '8px "Press Start 2P"';
      cx.textAlign = 'right';
      if (row.isSteps) cx.fillText(`${row.count} pasos`, 580, y + 4);
      else cx.fillText(`×${row.count}`, 580, y + 4);
      cx.textAlign = 'left';

      // Descripción
      cx.fillStyle = active ? '#aaa' : '#555';
      cx.font = '5px "Press Start 2P"';
      cx.fillText(row.desc || '', 92, y + 16);
    });

    if (sc > 0) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▲', 600, 78);
    }
    if (sc + VISIBLE < rows.length) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▼', 600, 78 + VISIBLE * ROW_H - 10);
    }
  }

  // Footer
  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  if (G.bagUpgrade) {
    cx.fillText('↑↓ navegar   SPACE: activar   X volver', 56, 440);
    cx.fillStyle = '#7AC0FF';
    cx.fillText('Crafting: Menú → LaFot (laboratorio de fotografía)', 56, 456);
  } else {
    cx.fillText('↑↓ navegar   SPACE info/activar   X/Esc volver', 56, 440);
    cx.fillStyle = '#555';
    cx.fillText('Claudia (Storyboard) desbloquea LaFot · 2000G', 56, 456);
  }
}

export { dObjects, buildObjectRows };
