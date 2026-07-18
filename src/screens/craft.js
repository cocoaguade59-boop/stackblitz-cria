// Pantallas de crafting de Fabiana (T5).
// Solo DIBUJA. La lógica (uFabiana*) vive inline en script.js
// por el bug double-G de StackBlitz.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { fr } from '../core/frame.js';
import { dBoxMenu, dDialogBox } from '../render/ui-boxes.js';
import { CRYSTAL_INFO, FRAGMENT_LABELS } from '../data/pins.js';

const COLOR_ORDER = ['p', 'c', 'o'];

function fragCount(code) {
  return (G.frag && G.frag[code]) || 0;
}

function craftOptions() {
  return COLOR_ORDER.map((code) => {
    const info = CRYSTAL_INFO[code];
    const count = fragCount(code);
    return {
      code,
      count,
      can: count >= 4,
      info,
      label: info.label,
      fragLabel: FRAGMENT_LABELS[code],
    };
  });
}

// ── sprites chicos ──────────────────────────────────────────

function drawMiniFragment(cx0, cy0, code, scale = 1) {
  const info = CRYSTAL_INFO[code] || CRYSTAL_INFO.p;
  const s = scale;
  cx.fillStyle = info.colorDark;
  cx.fillRect(cx0 - 4 * s, cy0 - 3 * s, 8 * s, 8 * s);
  cx.fillStyle = info.color;
  cx.fillRect(cx0 - 2 * s, cy0 - 1 * s, 5 * s, 5 * s);
  cx.fillStyle = info.colorLight;
  cx.fillRect(cx0 - 1 * s, cy0, 2 * s, 3 * s);
  cx.fillStyle = '#fff';
  cx.fillRect(cx0, cy0 + 1 * s, 1 * s, 1 * s);
}

function drawBigCrystal(cx0, cy0, code, scale = 1) {
  const info = CRYSTAL_INFO[code] || CRYSTAL_INFO.p;
  const s = scale;
  // pedestal
  cx.fillStyle = '#404858';
  cx.fillRect(cx0 - 28 * s, cy0 + 40 * s, 56 * s, 10 * s);
  cx.fillStyle = '#505868';
  cx.fillRect(cx0 - 22 * s, cy0 + 34 * s, 44 * s, 8 * s);
  // cuerpo
  cx.fillStyle = info.colorDark;
  cx.fillRect(cx0 - 16 * s, cy0 - 36 * s, 32 * s, 72 * s);
  cx.fillStyle = info.color;
  cx.fillRect(cx0 - 12 * s, cy0 - 28 * s, 24 * s, 60 * s);
  cx.fillStyle = info.colorLight;
  cx.fillRect(cx0 - 5 * s, cy0 - 18 * s, 10 * s, 36 * s);
  cx.fillStyle = '#fff';
  cx.fillRect(cx0 - 2 * s, cy0 - 10 * s, 4 * s, 16 * s);
  // facetas
  cx.fillStyle = info.colorDark;
  cx.fillRect(cx0 - 28 * s, cy0 - 8 * s, 12 * s, 28 * s);
  cx.fillRect(cx0 + 16 * s, cy0 - 12 * s, 12 * s, 32 * s);
  cx.fillStyle = info.color;
  cx.fillRect(cx0 - 25 * s, cy0 - 2 * s, 7 * s, 18 * s);
  cx.fillRect(cx0 + 18 * s, cy0 - 6 * s, 7 * s, 20 * s);
}

// ── choice Sí/No ────────────────────────────────────────────

function dFabianaChoice() {
  // script.js ya dibujó el mapa debajo
  cx.fillStyle = 'rgba(0,0,0,.55)';
  cx.fillRect(0, 0, 640, 480);

  const boxW = 460,
    boxH = 160;
  const boxX = (640 - boxW) / 2,
    boxY = 150;
  dDialogBox(boxX, boxY, boxW, boxH, 'Fabiana');

  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Mmm... veo que tienes fragmentos...', boxX + 18, boxY + 32);
  cx.fillText('¿Quieres hacer algo de arte?', boxX + 18, boxY + 52);

  const sel = G.fabSel || 0;
  cx.fillStyle = sel === 0 ? '#C83030' : '#505060';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`${sel === 0 ? '▶ ' : '  '}Sí`, boxX + 30, boxY + 90);

  cx.fillStyle = sel === 1 ? '#C83030' : '#505060';
  cx.fillText(`${sel === 1 ? '▶ ' : '  '}No`, boxX + 30, boxY + 114);

  cx.fillStyle = '#808090';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('↑↓ elegir   SPACE confirmar', boxX + 18, boxY + 144);
}

// ── mini pantalla de selección de color ─────────────────────

function dFabianaCraft() {
  // script.js ya dibujó el mapa debajo
  cx.fillStyle = 'rgba(8,6,16,0.78)';
  cx.fillRect(0, 0, 640, 480);

  const craftTitle = G.craftFromBag ? 'LABORATORIO DE FOTOGRAFÍA' : 'FABIANA · ARTE';
  dBoxMenu(70, 40, 500, 400, craftTitle);

  cx.fillStyle = '#C8A830';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Elige 4 fragmentos del mismo color', 90, 78);
  cx.fillStyle = '#888';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(
    G.craftFromBag
      ? 'LaFot · 4 fragmentos → 1 cristal armado'
      : '4 fragmentos → 1 cristal armado',
    90,
    96
  );

  const opts = craftOptions();
  const sel = G.craftSel || 0;

  opts.forEach((opt, i) => {
    const y = 120 + i * 70;
    const active = sel === i;

    // fila
    if (active) {
      cx.fillStyle = 'rgba(255,215,0,0.12)';
      cx.fillRect(90, y - 18, 460, 60);
      cx.fillStyle = '#ffd700';
      cx.fillRect(90, y - 18, 3, 60);
    } else {
      cx.fillStyle = 'rgba(255,255,255,0.03)';
      cx.fillRect(90, y - 18, 460, 60);
    }

    // slot sprite fragmento
    cx.fillStyle = 'rgba(0,0,0,0.4)';
    cx.fillRect(100, y - 10, 36, 36);
    drawMiniFragment(118, y + 8, opt.code, 2.2);

    // flecha a cristal
    cx.fillStyle = active ? '#ffd700' : '#555';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('→', 150, y + 10);

    // slot cristal
    cx.fillStyle = 'rgba(0,0,0,0.4)';
    cx.fillRect(180, y - 10, 36, 36);
    // cristal chico
    const info = opt.info;
    cx.fillStyle = info.colorDark;
    cx.fillRect(190, y - 6, 16, 28);
    cx.fillStyle = info.color;
    cx.fillRect(193, y - 2, 10, 22);
    cx.fillStyle = info.colorLight;
    cx.fillRect(196, y + 2, 4, 12);

    cx.fillStyle = active ? '#ffd700' : opt.can ? '#fff' : '#666';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(opt.fragLabel, 230, y);
    cx.fillStyle = active ? '#ffd700' : opt.can ? '#E8E0C0' : '#555';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`×${opt.count}`, 230, y + 16);

    if (opt.can) {
      cx.fillStyle = '#30D848';
      cx.font = '6px "Press Start 2P"';
      cx.fillText('LISTO · SPACE armar', 360, y + 8);
    } else {
      cx.fillStyle = '#888';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`Faltan ${Math.max(0, 4 - opt.count)}`, 360, y + 8);
    }
  });

  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('↑↓ color   SPACE armar (si ×4+)   X cancelar', 90, 420);
}

// ── animación de fabricación ────────────────────────────────

function dFabianaAnim() {
  const c = G.craft;
  if (!c) return;
  const info = CRYSTAL_INFO[c.code] || CRYSTAL_INFO.p;

  // Fondo oscuro estilo evolución
  cx.fillStyle = '#080610';
  cx.fillRect(0, 0, 640, 480);

  // viñeta suave
  cx.fillStyle = 'rgba(20,10,40,0.5)';
  cx.fillRect(0, 0, 640, 80);
  cx.fillRect(0, 400, 640, 80);

  // Recuadro blanco central
  const bx = 120,
    by = 70,
    bw = 400,
    bh = 300;
  cx.fillStyle = '#E8E4D8';
  cx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
  cx.fillStyle = '#FFFFFF';
  cx.fillRect(bx, by, bw, bh);
  // borde interior
  cx.fillStyle = '#C8C0B0';
  cx.fillRect(bx, by, bw, 3);
  cx.fillRect(bx, by + bh - 3, bw, 3);
  cx.fillRect(bx, by, 3, bh);
  cx.fillRect(bx + bw - 3, by, 3, bh);

  const cx0 = 320;
  const cy0 = 210;

  // ── fase gather: 4 fragmentos vuelan al centro ──
  if (c.phase === 'gather' || c.phase === 'flash') {
    // puntos de origen (4 esquinas del recuadro)
    const origins = [
      { x: bx + 40, y: by + 40 },
      { x: bx + bw - 40, y: by + 40 },
      { x: bx + 40, y: by + bh - 50 },
      { x: bx + bw - 40, y: by + bh - 50 },
    ];
    const gatherDur = 50; // frames por fragmento
    for (let i = 0; i < 4; i++) {
      const start = i * 28;
      const local = c.tm - start;
      if (local < 0) continue;
      const t = Math.min(1, local / gatherDur);
      // ease-out
      const e = 1 - Math.pow(1 - t, 2);
      const o = origins[i];
      const x = o.x + (cx0 - o.x) * e;
      const y = o.y + (cy0 - o.y) * e;
      const sc = 1.6 + (1 - e) * 0.8;
      if (t < 1 || c.phase === 'gather') {
        drawMiniFragment(x, y, c.code, sc);
      }
    }

    // partículas residuales
    if (c.phase === 'gather') {
      for (let i = 0; i < 6; i++) {
        const a = fr * 0.08 + i;
        cx.globalAlpha = 0.35;
        cx.fillStyle = info.colorLight;
        cx.fillRect(
          cx0 + Math.cos(a) * (30 + (i % 3) * 8) - 1,
          cy0 + Math.sin(a * 1.3) * (18 + (i % 2) * 6) - 1,
          2,
          2
        );
      }
      cx.globalAlpha = 1;
    }
  }

  // ── fase flash: destello del color ──
  if (c.phase === 'flash') {
    const flashT = Math.min(1, c.tm / 30);
    const rad = 20 + flashT * 90;
    cx.globalAlpha = 0.55 * (1 - flashT);
    cx.fillStyle = info.colorLight;
    // destello en cruces pixel
    cx.fillRect(cx0 - rad, cy0 - 4, rad * 2, 8);
    cx.fillRect(cx0 - 4, cy0 - rad, 8, rad * 2);
    cx.fillStyle = info.color;
    cx.fillRect(cx0 - rad * 0.6, cy0 - 2, rad * 1.2, 4);
    cx.fillRect(cx0 - 2, cy0 - rad * 0.6, 4, rad * 1.2);
    cx.globalAlpha = 0.35 * (1 - flashT);
    cx.fillStyle = '#fff';
    cx.fillRect(cx0 - 16, cy0 - 16, 32, 32);
    cx.globalAlpha = 1;
  }

  // ── fase reveal: cristal grande con "giro" (escala 0.5↔1.2) ──
  if (c.phase === 'reveal') {
    // pulse scale: 0.5 → 1.2 → 0.9 → 1.1 ...
    const pulse = 0.85 + Math.sin(c.tm * 0.08) * 0.2 + Math.sin(c.tm * 0.03) * 0.1;
    const sc = Math.min(1.25, 0.5 + Math.min(1, c.tm / 25) * 0.7) * pulse;
    drawBigCrystal(cx0, cy0 - 10, c.code, sc);

    // destellos orbitando
    cx.globalAlpha = 0.5 + Math.sin(fr * 0.15) * 0.25;
    cx.fillStyle = info.colorLight;
    for (let i = 0; i < 8; i++) {
      const a = fr * 0.06 + i * 0.8;
      const rr = 70 + (i % 3) * 10;
      cx.fillRect(
        cx0 + Math.cos(a) * rr - 1,
        cy0 + Math.sin(a * 1.2) * (rr * 0.55) - 1,
        3,
        3
      );
    }
    cx.globalAlpha = 1;

    // mensaje
    const colorName =
      c.code === 'p' ? 'Morado' : c.code === 'c' ? 'Cian' : 'Naranja';
    cx.fillStyle = '#2A2218';
    cx.font = '9px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(`¡Cristal Vínculo ${colorName} creado!`, 320, by + bh - 48);
    cx.fillStyle = info.color;
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`Obtuviste un ${info.label}`, 320, by + bh - 28);
    cx.fillStyle = '#666';
    cx.font = '6px "Press Start 2P"';
    if (c.tm > 40) {
      cx.fillText('SPACE para continuar', 320, by + bh - 10);
    }
    cx.textAlign = 'left';
  }

  // título superior
  cx.fillStyle = '#C8A830';
  cx.font = '8px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(
    G.craftFromBag ? 'LAFOT · FABRICACIÓN' : 'FABIANA · FABRICACIÓN',
    320,
    36
  );
  cx.textAlign = 'left';
}

/** Oferta de Claudia: mochila mejorada (T7). */
function dClaudiaChoice() {
  cx.fillStyle = 'rgba(0,0,0,.55)';
  cx.fillRect(0, 0, 640, 480);

  const boxW = 480,
    boxH = 170;
  const boxX = (640 - boxW) / 2,
    boxY = 145;
  dDialogBox(boxX, boxY, boxW, boxH, 'Claudia');

  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Puedo mejorar tu mochila.', boxX + 18, boxY + 30);
  cx.fillText('Crafting de cristales desde el menú.', boxX + 18, boxY + 48);
  cx.fillStyle = '#6A4010';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Costo: 2000G  ·  compra única permanente', boxX + 18, boxY + 70);

  const sel = G.claSel || 0;
  cx.fillStyle = sel === 0 ? '#C83030' : '#505060';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`${sel === 0 ? '▶ ' : '  '}Sí, mejorar mochila`, boxX + 30, boxY + 105);

  cx.fillStyle = sel === 1 ? '#C83030' : '#505060';
  cx.fillText(`${sel === 1 ? '▶ ' : '  '}No, gracias`, boxX + 30, boxY + 130);

  cx.fillStyle = '#808090';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Tu oro: ${G.gold || 0}G   ↑↓ elegir   SPACE confirmar`, boxX + 18, boxY + 156);
}

export {
  dFabianaChoice,
  dFabianaCraft,
  dFabianaAnim,
  dClaudiaChoice,
  craftOptions,
  drawMiniFragment,
  drawBigCrystal,
};
