// Pantalla de título del juego.
// Incluye la animación de cielo → fanfarria → carrusel de criaturas
// y el menú inferior (INICIO / NUEVA AVENTURA).


import { cx } from '../core/canvas.js';
import { G } from '../core/game-state.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { kp } from '../core/input.js';
import { hasSaveGame, clearAllGameSaves } from '../core/save.js';
import { CDB } from '../data/creatures.js';
import { dexIds } from '../data/dex-order.js';
import { dCre } from '../render/creature-sprites.js';
import { dShadow } from '../render/world-decor.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { px, pixelGlow } from '../render/render-utils.js';
import { aN } from '../utils/particles.js';

// loadGame se toma de window (script.js lo asigna en init() antes del loop)

// === PANTALLA DE TÍTULO ===
function playTitleHorn() {
  if (!sfx.on || !sfx.c) return;
  sfx.n(392, 0.22, 'square', 0.14);
  setTimeout(() => sfx.n(523, 0.26, 'square', 0.16), 120);
  setTimeout(() => sfx.n(659, 0.32, 'square', 0.18), 260);
  setTimeout(() => sfx.n(784, 0.45, 'triangle', 0.16), 420);
}

function startNewGameFlow() {
  clearAllGameSaves();
  G.hasSave = false;
  G.sSel = 0;
  // El protagonista inicia centrado en Aldea Pitch mirando a Alessandro.
  G.curMap = 'world';
  G.pl.x = 20;
  G.pl.y = 145;
  G.pl.d = 3;
  G.pl.stepTarget = null;
  G.pl.moving = false;
  G.scr = 'intro';
  G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
}

function uTitle() {
  G.tFr++;
  if (G.tFr > 182 && !G.titleHornPlayed) {
    playTitleHorn();
    G.titleHornPlayed = true;
  }
  G.hasSave = hasSaveGame();
  const optCount = G.hasSave ? 2 : 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.titleSel = (G.titleSel + optCount - 1) % optCount;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.titleSel = (G.titleSel + 1) % optCount;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    try {
      if (G.hasSave && G.titleSel === 0) {
        const fn = window.__gameLoadGame;
        console.log('[title] loadGame available:', typeof fn);
        if (fn && fn()) {
          G.scr = 'world';
          aN('¡Partida cargada!');
        } else {
          startNewGameFlow();
        }
      } else if (G.hasSave && G.titleSel === 1) {
        G.scr = 'confirmReset';
        G.resetSel = 1;
        G.resetFromTitle = true;
      } else {
        console.log('[title] calling startNewGameFlow');
        startNewGameFlow();
        console.log('[title] G.scr after:', G.scr);
      }
    } catch(e) {
      console.error('[title] ERROR en SPACE:', e.message, e.stack);
    }
  }
}

function dTitle() {
  const f = G.tFr;
  const phase = f < 180 ? 'sky' : f < 220 ? 'fanfare' : 'carousel';

  if (phase === 'sky') {
    // Animación inicial: cielo bonito, nubes suaves y profundidad pixel-art.
    const gr = cx.createLinearGradient(0, 0, 0, 480);
    gr.addColorStop(0, '#79C8FF');
    gr.addColorStop(0.55, '#BEE8FF');
    gr.addColorStop(1, '#E8F8D8');
    cx.fillStyle = gr;
    cx.fillRect(0, 0, 640, 480);

    // Sol suave
    cx.globalAlpha = 0.7;
    cx.fillStyle = '#FFF0A0';
    pixelGlow(530, 82, 42, 42);
    cx.globalAlpha = 0.16;
    pixelGlow(530, 82, 75, 75);
    cx.globalAlpha = 1;

    // Nubes pixeladas con pseudo 3D
    for (let i = 0; i < 7; i++) {
      const nx = (i * 130 - f * (0.35 + i * 0.03)) % 780 - 80;
      const ny = 45 + (i % 3) * 48;
      cx.fillStyle = 'rgba(120,160,210,.20)';
      cx.fillRect(nx + 8, ny + 14, 92, 18);
      cx.fillStyle = '#FFFFFF';
      cx.fillRect(nx, ny + 12, 96, 16);
      cx.fillRect(nx + 18, ny + 4, 28, 18);
      cx.fillRect(nx + 46, ny, 34, 22);
      cx.fillStyle = '#D8ECFF';
      cx.fillRect(nx + 4, ny + 24, 86, 4);
    }

    // Campo 3D suavizado
    cx.fillStyle = '#63B850';
    cx.fillRect(0, 292, 640, 188);
    cx.fillStyle = '#4C9C40';
    for (let y = 310; y < 480; y += 18) cx.fillRect(0, y, 640, 2);
    cx.fillStyle = '#C8B078';
    for (let yy = 292; yy < 480; yy += 8) {
      const k = (yy - 292) / 188;
      const ww = 24 + k * 80;
      cx.fillRect(320 - ww / 2, yy, ww, 8);
    }

    cx.textAlign = 'center';
    cx.fillStyle = '#1A2A4A';
    cx.font = '12px "Press Start 2P"';
    cx.fillText('Un nuevo día despierta en el Reino...', 320, 415);
    cx.textAlign = 'left';
    return;
  }

  if (phase === 'fanfare') {
    // Fanfarria sin pantalla negra: cortina nocturna pixelada sobre el cielo.
    const k = (f - 180) / 40;
    cx.fillStyle = '#0A0A24';
    cx.fillRect(0, 0, 640, 480);
    for (let yy = 0; yy < 480; yy += 16) {
      cx.fillStyle = yy % 32 === 0 ? '#101848' : '#080818';
      cx.fillRect(0, yy, 640, 8);
    }
    cx.textAlign = 'center';
    cx.fillStyle = '#FFD870';
    cx.font = '18px "Press Start 2P"';
    cx.fillText('¡TA-RA-RAAA!', 320, 225);
    cx.fillStyle = '#A0B0C0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('El desfile del reino comienza...', 320, 255);
    // Destellos cuadrados de trompeta
    cx.fillStyle = '#FFE890';
    for (let i = 0; i < 10; i++) {
      const sx = 120 + i * 44;
      const sy = 295 + ((i * 17 + f) % 28);
      cx.fillRect(sx, sy, 4, 4);
    }
    cx.textAlign = 'left';
    return;
  }

  // Carrusel principal: criaturas desfilan de derecha a izquierda y se repite.
  const cf = f - 220;
  const sky = cx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#07071C');
  sky.addColorStop(0.45, '#111A3A');
  sky.addColorStop(1, '#102B22');
  cx.fillStyle = sky;
  cx.fillRect(0, 0, 640, 480);

  for (let i = 0; i < 80; i++) {
    cx.globalAlpha = Math.sin(f * 0.035 + i * 0.7) * 0.45 + 0.55;
    cx.fillStyle = i % 9 === 0 ? '#FFE8A0' : '#F8F8FF';
    cx.fillRect((i * 137 + f * 0.18) % 640, (i * 83) % 250, i % 11 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
  }
  cx.globalAlpha = 1;

  // Luna, montañas pixeladas y castillo integrado al fondo
  cx.globalAlpha = 0.75;
  cx.fillStyle = '#F8E8A0';
  pixelGlow(500, 82, 36, 36);
  cx.globalAlpha = 1;

  // Montañas sin curvas: bloques escalonados tipo pixel-art
  const farPeaks = [
    { x: -40, y: 260, w: 150, h: 54 }, { x: 70, y: 242, w: 170, h: 72 },
    { x: 210, y: 255, w: 150, h: 58 }, { x: 330, y: 236, w: 190, h: 78 },
    { x: 500, y: 252, w: 170, h: 62 },
  ];
  farPeaks.forEach((m) => {
    cx.fillStyle = '#17213A';
    for (let yy = 0; yy < m.h; yy += 8) {
      const k = yy / m.h;
      const ww = Math.max(18, m.w * (1 - k));
      cx.fillRect(m.x + (m.w - ww) / 2, m.y + yy, ww, 8);
    }
    cx.fillStyle = 'rgba(255,255,255,.08)';
    cx.fillRect(m.x + m.w * .46, m.y + 8, Math.max(8, m.w * .12), 8);
  });
  const nearPeaks = [
    { x: -60, y: 286, w: 220, h: 46 }, { x: 118, y: 272, w: 230, h: 60 },
    { x: 314, y: 280, w: 230, h: 52 }, { x: 500, y: 270, w: 210, h: 62 },
  ];
  nearPeaks.forEach((m) => {
    cx.fillStyle = '#1D2D35';
    for (let yy = 0; yy < m.h; yy += 8) {
      const k = yy / m.h;
      const ww = Math.max(24, m.w * (1 - k * .9));
      cx.fillRect(m.x + (m.w - ww) / 2, m.y + yy, ww, 8);
    }
  });

  // Castillo más claro y menos contrastado, encajado detrás de las montañas
  cx.globalAlpha = 0.82;
  px(452, 168, 88, 86, '#17223A');
  px(434, 186, 26, 68, '#1B2940');
  px(532, 186, 26, 68, '#1B2940');
  px(462, 142, 18, 34, '#1B2940');
  px(512, 142, 18, 34, '#1B2940');
  px(488, 122, 18, 48, '#1E3048');
  px(466, 155, 10, 10, '#D8B840');
  px(516, 155, 10, 10, '#D8B840');
  px(492, 138, 10, 10, '#D8B840');
  px(488, 228, 16, 26, '#122034');
  cx.globalAlpha = 1;

  cx.fillStyle = '#204A23'; cx.fillRect(0, 310, 640, 170);
  cx.fillStyle = '#B8A070';
  for (let yy = 310; yy < 480; yy += 8) {
    const k = (yy - 310) / 170;
    const ww = 28 + k * 68;
    cx.fillRect(320 - ww / 2, yy, ww, 8);
  }

  // Logo sin recuadro negro: placa clara de pixel-art con relieve
  cx.textAlign = 'center';
  cx.fillStyle = 'rgba(255,232,160,.18)';
  cx.fillRect(88, 34, 464, 118);
  cx.fillStyle = 'rgba(255,255,255,.20)';
  cx.fillRect(96, 40, 448, 4);
  cx.fillRect(96, 44, 4, 96);
  cx.fillStyle = 'rgba(80,48,20,.28)';
  cx.fillRect(96, 140, 448, 5);
  cx.fillRect(540, 44, 5, 96);
  px(88, 34, 14, 14, '#C8A830');
  px(538, 34, 14, 14, '#C8A830');
  px(88, 138, 14, 14, '#C8A830');
  px(538, 138, 14, 14, '#C8A830');
  cx.fillStyle = '#000'; cx.font = '18px "Press Start 2P"'; cx.fillText('CRIATURAS DEL', 323, 84); cx.font = '28px "Press Start 2P"'; cx.fillText('REINO', 323, 124);
  cx.fillStyle = '#FFE070'; cx.font = '18px "Press Start 2P"'; cx.fillText('CRIATURAS DEL', 320, 81); cx.font = '28px "Press Start 2P"'; cx.fillText('REINO', 320, 121);

  // El desfile respeta el mismo orden de aparición del Criaturario.
  const ids = dexIds();
  const spacing = 92;
  const totalW = ids.length * spacing;
  const base = 690 - (cf * 0.55 % (totalW + 760));
  ids.forEach((id, i) => {
    const x = base + i * spacing;
    if (x < -80 || x > 700) return;
    const y = 258 + Math.sin((cf + i * 18) * 0.04) * 6;
    dShadow(x + 22, y + 45, 18, 5);
    cx.save();
    cx.translate(x, y);
    cx.scale(1.35, 1.35);
    dCre(0, 0, id, 5, f);
    cx.restore();
    cx.fillStyle = '#E8E8F0';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(CDB[id].nm, x + 24, y + 64);
  });

  // Menú de entrada
  dBoxMenu(96, 360, 448, G.hasSave ? 108 : 84, G.hasSave ? 'INICIO' : 'NUEVA AVENTURA');
  cx.textAlign = 'center'; // Forzamos explícitamente por si dBoxMenu lo cambió
  if (G.hasSave) {
    const opts = ['Continuar partida guardada', 'Nueva partida desde Aldea Pitch'];
    opts.forEach((o, i) => {
      cx.fillStyle = G.titleSel === i ? '#ffd700' : '#D8D8E8';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${G.titleSel === i ? '▶ ' : '  '}${o}`, 320, 396 + i * 28);
    });
  } else {
    cx.fillStyle = Math.sin(f * 0.1) > 0 ? '#fff' : '#A0B0C0';
    cx.font = '9px "Press Start 2P"';
    cx.fillText('ESPACIO para comenzar', 320, 408);
  }
  cx.fillStyle = '#606878'; cx.font = '6px "Press Start 2P"'; cx.fillText('Flechas = elegir | SPACE = confirmar', 320, 460);
  cx.textAlign = 'left';
}

export { playTitleHorn, startNewGameFlow, uTitle, dTitle };
