// C1.5b-2/3 — Renderizador de tiles interiores con paletas de estilo.
// Cada tile interior se dibuja con colores según el estilo del edificio.
// Exporta dTileI(tile, x, y, palette).

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { fr } from '../core/frame.js';

const T = 32;

// Paleta default (pitch) por si no se pasa
const DEF = {
  wallDark: '#5A5448', wallMid: '#6A6458', wallLight: '#5E584C',
  floorA: '#C8A870', floorB: '#D4B880', woodGrain: '#B89860',
  woodDark: '#5A3820', woodMid: '#8B6040', woodLight: '#9B7050',
  accent: '#D8B840', rugBase: '#B83838', rugAccent: '#C84848',
};

function dTileI(tile, x, y, palette = DEF) {
  const p = palette;

  switch (tile) {
    // ─── 40: PISO ──────────────────────────────────────────────
    case 40: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = p.floorB;
      cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      cx.fillStyle = p.woodGrain;
      cx.fillRect(x + 4, y + 8, T - 8, 1);
      cx.fillRect(x + 2, y + 18, T - 4, 1);
      cx.fillRect(x + 6, y + 26, T - 12, 1);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 8, y + 6, 3, 3);
      cx.fillRect(x + 22, y + 20, 2, 2);
      break;
    }

    // ─── 41: PARED ─────────────────────────────────────────────
    case 41: {
      cx.fillStyle = p.wallDark;
      cx.fillRect(x, y, T, T);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const off = r % 2 === 0 ? 0 : 4;
          cx.fillStyle = ((r + c) % 2 === 0) ? p.wallMid : p.wallLight;
          cx.fillRect(x + c * 8 + off, y + r * 8, 8, 8);
        }
      }
      cx.fillStyle = '#3A3428';
      for (let r = 1; r < 4; r++) cx.fillRect(x, y + r * 8 - 1, T, 1);
      // antorcha ocasional
      if ((x / T + y / T) % 5 === 2) {
        cx.fillStyle = '#3A2810';
        cx.fillRect(x + 14, y + 4, 4, 10);
        cx.fillStyle = '#5A4020';
        cx.fillRect(x + 13, y + 3, 6, 3);
        const flk = Math.sin(fr * 0.12 + x) * 2;
        cx.fillStyle = '#E88030';
        cx.fillRect(x + 13, y - 2 + flk, 6, 5);
        cx.fillStyle = '#F8A050';
        cx.fillRect(x + 14, y - 3 + flk, 4, 3);
      }
      break;
    }

    // ─── 42: PUERTA ────────────────────────────────────────────
    case 42: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 6, y, 20, T);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 8, y + 2, 16, 28);
      cx.fillStyle = p.woodLight;
      cx.fillRect(x + 10, y + 3, 12, 26);
      cx.fillStyle = '#7B5830';
      cx.fillRect(x + 13, y + 3, 1, 26);
      cx.fillRect(x + 18, y + 3, 1, 26);
      cx.fillStyle = '#585868';
      cx.fillRect(x + 9, y + 8, 2, 3);
      cx.fillRect(x + 9, y + 22, 2, 3);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 20, y + 14, 2, 4);
      break;
    }

    // ─── 43: MESA ──────────────────────────────────────────────
    case 43: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 4, y + 16, 4, 14);
      cx.fillRect(x + 24, y + 16, 4, 14);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 1, y + 8, 30, 10);
      cx.fillStyle = p.woodLight;
      cx.fillRect(x + 2, y + 9, 28, 8);
      cx.fillStyle = '#7B5030';
      cx.fillRect(x + 8, y + 12, 16, 1);
      cx.fillStyle = '#D8C8A0';
      cx.fillRect(x + 6, y + 5, 3, 4);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 22, y + 6, 4, 3);
      break;
    }

    // ─── 44: CAMA ──────────────────────────────────────────────
    case 44: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 22, y + 2, 8, 28);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 24, y + 3, 5, 26);
      cx.fillStyle = '#D8D0C0';
      cx.fillRect(x + 4, y + 6, 20, 22);
      cx.fillStyle = '#E8E0D0';
      cx.fillRect(x + 5, y + 7, 18, 20);
      cx.fillStyle = '#F0E8D8';
      cx.fillRect(x + 5, y + 7, 7, 8);
      cx.fillStyle = p.rugBase;
      cx.fillRect(x + 5, y + 18, 12, 10);
      cx.fillStyle = p.rugAccent;
      cx.fillRect(x + 6, y + 20, 10, 6);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 2, y + 24, 4, 6);
      break;
    }

    // ─── 45: CHIMENEA ──────────────────────────────────────────
    case 45: {
      cx.fillStyle = '#3A3028';
      cx.fillRect(x + 4, y + 2, 24, 28);
      cx.fillStyle = '#1A1008';
      cx.fillRect(x + 7, y + 10, 18, 18);
      const fAnim = Math.sin(fr * 0.15) * 0.3 + 0.7;
      cx.globalAlpha = fAnim;
      cx.fillStyle = '#E86020';
      cx.fillRect(x + 10, y + 16, 12, 10);
      cx.fillStyle = '#F09030';
      cx.fillRect(x + 11, y + 18, 10, 6);
      cx.fillStyle = '#F8D860';
      cx.fillRect(x + 14, y + 20, 4, 4);
      cx.globalAlpha = 1;
      cx.fillStyle = '#6A5040';
      cx.fillRect(x + 2, y, 28, 4);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 3, y + 1, 26, 2);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 20, y - 3, 6, 5);
      break;
    }

    // ─── 46: ESTANTERÍA ────────────────────────────────────────
    case 46: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 2, y, 28, T);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 3, y + 1, 26, T - 2);
      cx.fillStyle = '#4A2810';
      cx.fillRect(x + 2, y + 10, 28, 2);
      cx.fillRect(x + 2, y + 20, 28, 2);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 6, y + 4, 4, 6);
      cx.fillStyle = '#80B8F8';
      cx.fillRect(x + 14, y + 5, 5, 5);
      cx.fillStyle = '#48A830';
      cx.fillRect(x + 8, y + 14, 6, 4);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 18, y + 14, 4, 5);
      cx.fillStyle = '#A060C0';
      cx.fillRect(x + 10, y + 24, 4, 4);
      break;
    }

    // ─── 47: ESCRITORIO PROA ───────────────────────────────────
    case 47: {
      cx.fillStyle = '#3A2A1A';
      cx.fillRect(x + 2, y + 8, 28, 22);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 3, y + 9, 26, 20);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 1, y + 6, 30, 5);
      cx.fillStyle = '#F8F0E0';
      cx.fillRect(x + 6, y + 2, 8, 6);
      cx.fillStyle = '#E8E0D0';
      cx.fillRect(x + 22, y + 3, 6, 5);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 4, y + 4, 3, 3);
      cx.fillStyle = '#202020';
      cx.fillRect(x + 18, y + 2, 1, 6);
      cx.fillRect(x + 17, y + 1, 3, 2);
      break;
    }

    // ─── 48: SILLA ─────────────────────────────────────────────
    case 48: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 6, y + 16, 3, 14);
      cx.fillRect(x + 23, y + 16, 3, 14);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 3, y + 10, 26, 8);
      cx.fillStyle = p.woodLight;
      cx.fillRect(x + 4, y + 11, 24, 6);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 5, y + 2, 4, 10);
      cx.fillRect(x + 23, y + 2, 4, 10);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 5, y, 22, 4);
      break;
    }

    // ─── 49: ALFOMBRA ──────────────────────────────────────────
    case 49: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = p.rugBase;
      cx.fillRect(x + 3, y + 3, T - 6, T - 6);
      cx.fillStyle = p.rugAccent;
      cx.fillRect(x + 5, y + 5, T - 10, T - 10);
      cx.fillStyle = p.accent;
      for (let i = 4; i < T - 4; i += 6) {
        cx.fillRect(x + i, y + 4, 2, 2);
        cx.fillRect(x + i, y + T - 6, 2, 2);
      }
      break;
    }

    // ─── 50: BARRIL ────────────────────────────────────────────
    case 50: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 6, y + 4, 20, 24);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 7, y + 3, 18, 26);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 14, y + 3, 1, 26);
      cx.fillRect(x + 20, y + 3, 1, 26);
      cx.fillStyle = '#787880';
      cx.fillRect(x + 6, y + 8, 20, 2);
      cx.fillRect(x + 6, y + 16, 20, 2);
      cx.fillRect(x + 6, y + 24, 20, 2);
      break;
    }

    // ─── 51: SACO DE GRANO ─────────────────────────────────────
    case 51: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#B89868';
      cx.fillRect(x + 3, y + 6, 26, 20);
      cx.fillStyle = '#C8A878';
      cx.fillRect(x + 4, y + 8, 24, 14);
      cx.fillStyle = '#A88858';
      cx.fillRect(x + 8, y + 10, 1, 12);
      cx.fillRect(x + 16, y + 10, 1, 12);
      cx.fillRect(x + 24, y + 12, 1, 8);
      cx.fillStyle = '#785830';
      cx.fillRect(x + 6, y + 3, 20, 4);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 14, y + 1, 4, 4);
      break;
    }

    // ─── 52: RUEDA DE MOLINO ───────────────────────────────────
    case 52: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 4, y + 4, 24, 24);
      cx.fillStyle = '#4A2C18';
      const rot = fr * 0.03;
      const cxW = x + 16, cyW = y + 16;
      cx.save();
      cx.translate(cxW, cyW);
      cx.rotate(rot);
      cx.fillStyle = '#7A5850';
      cx.fillRect(-10, -10, 20, 20);
      cx.fillStyle = '#8A6860';
      cx.fillRect(-8, -8, 16, 16);
      cx.fillStyle = '#5A3830';
      cx.fillRect(-1, -12, 2, 24);
      cx.fillRect(-12, -1, 24, 2);
      cx.fillStyle = '#9A7870';
      cx.fillRect(-2, -2, 4, 4);
      cx.restore();
      break;
    }

    // ─── 53: MESA DE MAPAS ─────────────────────────────────────
    case 53: {
      cx.fillStyle = '#3A2818';
      cx.fillRect(x + 2, y + 10, 28, 20);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 3, y + 11, 26, 18);
      cx.fillStyle = '#F8F0D8';
      cx.fillRect(x + 6, y + 6, 20, 6);
      cx.fillStyle = '#E8E0C0';
      cx.fillRect(x + 7, y + 7, 18, 4);
      cx.fillStyle = p.accent;
      cx.fillRect(x + 8, y + 7, 2, 4);
      cx.fillRect(x + 16, y + 7, 2, 4);
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 11, y + 9, 10, 1);
      cx.fillStyle = '#C84040';
      cx.fillRect(x + 22, y + 3, 5, 5);
      cx.fillStyle = '#F8F8F8';
      cx.fillRect(x + 23, y + 2, 3, 2);
      break;
    }

    // ─── 54: ESTANTERÍA DE DIPLOMAS ────────────────────────────
    case 54: {
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 2, y, 28, T);
      cx.fillStyle = p.woodMid;
      cx.fillRect(x + 3, y + 1, 26, T - 2);
      cx.fillStyle = '#4A2810';
      cx.fillRect(x + 2, y + 10, 28, 2);
      cx.fillRect(x + 2, y + 20, 28, 2);
      for (let i = 0; i < 3; i++) {
        const dy = 3 + i * 11;
        cx.fillStyle = '#F0E8D0';
        cx.fillRect(x + 7, y + dy, 6, 6);
        cx.fillStyle = p.accent;
        cx.fillRect(x + 9, y + dy + 2, 2, 2);
        cx.fillStyle = '#D8C898';
        cx.fillRect(x + 18, y + dy + 1, 5, 5);
        cx.fillStyle = p.accent;
        cx.fillRect(x + 19, y + dy + 3, 2, 2);
      }
      break;
    }

    // ─── 55: ALMACÉN DE CRIATURAS ──────────────────────────────
    case 55: {
      cx.fillStyle = '#3A2A1A';
      cx.fillRect(x + 3, y + 4, 26, 24);
      cx.fillStyle = p.woodDark;
      cx.fillRect(x + 4, y + 5, 24, 22);
      cx.fillStyle = '#2A1A0A';
      cx.fillRect(x + 8, y + 8, 8, 8);
      cx.fillRect(x + 18, y + 8, 8, 8);
      cx.fillRect(x + 8, y + 18, 8, 8);
      cx.fillRect(x + 18, y + 18, 8, 8);
      const colors = ['#E84040', '#4080E8', '#40B840', '#E8C840', '#D060E0'];
      [[10, 9], [20, 9], [10, 19], [20, 19]].forEach(([cx2, cy2], i) => {
        cx.fillStyle = colors[i % colors.length];
        cx.fillRect(x + cx2, y + cy2, 4, 5);
        cx.fillStyle = '#F8F8F8';
        cx.fillRect(x + cx2 + 1, y + cy2 + 1, 1, 1);
      });
      cx.fillStyle = '#685040';
      cx.fillRect(x + 5, y + 6, 22, 1);
      cx.fillRect(x + 5, y + 16, 22, 1);
      cx.fillRect(x + 5, y + 26, 22, 1);
      break;
    }

    default: {
      cx.fillStyle = p.floorA;
      cx.fillRect(x, y, T, T);
      break;
    }
  }
}

export { dTileI };
