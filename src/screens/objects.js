// Pantalla de inventario de Objetos (fragmentos, fragancias, pergaminos, cristales, inciensos).
// Solo DIBUJA. La lógica de input (uObjects) vive inline en script.js
// para no pelear con el bug double-G de StackBlitz.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import {
  CRYSTAL_INFO,
  FRAGRANCE_LABELS,
  FRAGRANCE_TYPES,
  FRAGMENT_LABELS,
} from '../data/pins.js';

/** Construye la lista de filas del inventario de objetos (solo conteo > 0 + vacíos informativos). */
function buildObjectRows() {
  const rows = [];

  // Cristales armados
  const crystals = [
    { code: 'p', key: 'crv', icon: '💎' },
    { code: 'c', key: 'crvC', icon: '💠' },
    { code: 'o', key: 'crvO', icon: '🔶' },
  ];
  for (const c of crystals) {
    const n = G[c.key] || 0;
    const info = CRYSTAL_INFO[c.code];
    rows.push({
      kind: 'crystal',
      code: c.code,
      icon: c.icon,
      name: info.label,
      count: n,
      desc: info.desc,
      color: info.color,
    });
  }

  // Fragmentos
  const fr = G.frag || { p: 0, c: 0, o: 0 };
  for (const code of ['p', 'c', 'o']) {
    const info = CRYSTAL_INFO[code];
    rows.push({
      kind: 'fragment',
      code,
      icon: '◆',
      name: FRAGMENT_LABELS[code],
      count: fr[code] || 0,
      desc: '4 = 1 cristal (Fabiana)',
      color: info.color,
    });
  }

  // Pergaminos
  rows.push({
    kind: 'scroll',
    icon: '📜',
    name: 'Pergamino de Batalla',
    count: G.scrolls || 0,
    desc: 'Hernán acepta 2 por enseñanza',
    color: '#E8C840',
  });

  // Fragancias
  const fg = G.fragrances || {};
  for (const type of FRAGRANCE_TYPES) {
    rows.push({
      kind: 'fragrance',
      type,
      icon: '🧴',
      name: FRAGRANCE_LABELS[type] || type,
      count: fg[type] || 0,
      desc: 'David-O: +10G → incienso',
      color: {
        picante: '#E05030',
        dulce: '#F080C0',
        salada: '#40A0E0',
        amarga: '#A060E0',
        saludable: '#40C060',
      }[type] || '#ccc',
    });
  }

  // Inciensos (prep T6)
  const inc = G.incense || {};
  for (const type of FRAGRANCE_TYPES) {
    const n = inc[type] || 0;
    if (n > 0) {
      rows.push({
        kind: 'incense',
        type,
        icon: '🔥',
        name: `Incienso ${type}`,
        count: n,
        desc: '200 pasos · 75% del tipo',
        color: {
          picante: '#E05030',
          dulce: '#F080C0',
          salada: '#40A0E0',
          amarga: '#A060E0',
          saludable: '#40C060',
        }[type] || '#ccc',
      });
    }
  }

  // Incienso activo
  if (G.activeIncense) {
    rows.push({
      kind: 'active',
      icon: '✨',
      name: `Activo: ${G.activeIncense.type}`,
      count: G.activeIncense.stepsLeft || 0,
      desc: 'pasos restantes',
      color: '#ffd700',
    });
  }

  return rows;
}

function dObjects() {
  const rows = buildObjectRows();
  const sel = G.os?.s || 0;
  const scroll = G.os?.scroll || 0;
  const VISIBLE = 10;

  cx.fillStyle = 'rgba(0,0,0,.72)';
  cx.fillRect(0, 0, 640, 480);

  dBoxMenu(40, 24, 560, 430, 'OBJETOS');

  // Resumen compacto arriba
  const fr = G.frag || { p: 0, c: 0, o: 0 };
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(
    `💎${G.crv || 0} 💠${G.crvC || 0} 🔶${G.crvO || 0}  ·  Frag ${fr.p}/${fr.c}/${fr.o}  ·  📜${G.scrolls || 0}  ·  💰${G.gold || 0}`,
    56,
    56
  );

  // Separador
  cx.fillStyle = '#3A3040';
  cx.fillRect(56, 66, 528, 1);

  if (rows.length === 0) {
    cx.fillStyle = '#666';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Sin objetos todavía.', 56, 100);
    cx.fillText('Busca pines en el mapa (SPACE).', 56, 120);
  } else {
    const maxScroll = Math.max(0, rows.length - VISIBLE);
    const sc = Math.max(0, Math.min(scroll, maxScroll));
    const view = rows.slice(sc, sc + VISIBLE);

    view.forEach((row, i) => {
      const idx = sc + i;
      const y = 84 + i * 32;
      const active = sel === idx;

      if (active) {
        cx.fillStyle = 'rgba(255,215,0,0.12)';
        cx.fillRect(50, y - 14, 540, 30);
        cx.fillStyle = '#ffd700';
        cx.fillRect(50, y - 14, 3, 30);
      } else if (i % 2 === 0) {
        cx.fillStyle = 'rgba(255,255,255,0.03)';
        cx.fillRect(50, y - 14, 540, 30);
      }

      // Icono / color swatch
      cx.fillStyle = row.color || '#fff';
      cx.fillRect(60, y - 8, 10, 10);
      cx.fillStyle = '#0A0A0C';
      cx.fillRect(61, y - 7, 8, 8);
      cx.fillStyle = row.color || '#fff';
      cx.fillRect(62, y - 6, 6, 6);

      cx.fillStyle = active ? '#ffd700' : row.count > 0 ? '#fff' : '#555';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${row.icon || '·'} ${row.name}`, 78, y);

      cx.fillStyle = active ? '#ffd700' : row.count > 0 ? '#E8E0C0' : '#444';
      cx.font = '8px "Press Start 2P"';
      cx.textAlign = 'right';
      cx.fillText(`×${row.count}`, 580, y);
      cx.textAlign = 'left';

      cx.fillStyle = active ? '#aaa' : '#555';
      cx.font = '5px "Press Start 2P"';
      cx.fillText(row.desc || '', 78, y + 12);
    });

    // Scroll indicators
    if (sc > 0) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▲', 600, 80);
    }
    if (sc + VISIBLE < rows.length) {
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('▼', 600, 400);
    }
  }

  // Footer
  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('↑↓ navegar   X/Esc volver', 56, 440);

  if (G.bagUpgrade) {
    cx.fillStyle = '#7AC070';
    cx.fillText('Mochila mejorada: crafting portátil ON', 280, 440);
  }
}

export { dObjects, buildObjectRows };
