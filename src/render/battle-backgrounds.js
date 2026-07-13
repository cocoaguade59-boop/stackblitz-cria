// Assets y funciones para fondos de batalla (salvaje, NPC, intro).
// Depende de cx, del game state G, y del contador de frames fr.

import { cx } from '../core/canvas.js';
import { G } from '../core/game-state.js';
import { fr } from '../core/frame.js';

// === ASSETS DE FONDOS DE BATALLA ===
const BATTLE_BG_ASSETS = {
  forest: {
    src: 'assets/battle/forest-encounter.png',
    img: null,
    ready: false,
    failed: false,
  },
};

function initBattleBackgroundAssets() {
  if (typeof Image === 'undefined') return;
  Object.values(BATTLE_BG_ASSETS).forEach((bg) => {
    if (bg.img) return;
    const img = new Image();
    bg.img = img;
    img.onload = () => {
      bg.ready = true;
      bg.failed = false;
    };
    img.onerror = () => {
      bg.ready = false;
      bg.failed = true;
    };
    img.src = bg.src;
  });
}

function drawBattleBackgroundAsset(key) {
  const bg = BATTLE_BG_ASSETS[key];
  if (!bg || !bg.img || !bg.ready || bg.img.naturalWidth <= 0) return false;
  try {
    cx.imageSmoothingEnabled = false;
    // Efecto cover: cubre todo el canvas manteniendo proporción.
    const iw = bg.img.naturalWidth;
    const ih = bg.img.naturalHeight;
    const scale = Math.max(640 / iw, 480 / ih);
    const dw = Math.ceil(iw * scale);
    const dh = Math.ceil(ih * scale);
    const dx = Math.floor((640 - dw) / 2);
    const dy = Math.floor((480 - dh) / 2);
    cx.drawImage(bg.img, dx, dy, dw, dh);
    return true;
  } catch (e) {
    return false;
  }
}

// === FONDO ESPECIAL PARA ENCUENTRO SALVAJE EN MAPA NORMAL ===
function dWorldEncounterBG() {
  // Si existe assets/battle/forest-encounter.png, usarlo. Si no, usar fallback por código.
  if (drawBattleBackgroundAsset('forest')) return;

  // Cielo pixel-art del bosque exterior
  const gr = cx.createLinearGradient(0, 0, 0, 250);
  gr.addColorStop(0, '#6FB8E8');
  gr.addColorStop(0.55, '#B8E0F0');
  gr.addColorStop(1, '#D8F0D0');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 245);

  // Nubes cuadradas suaves, sin curvas
  for (let i = 0; i < 4; i++) {
    const nx = (i * 190 - fr * 0.18) % 780 - 80;
    const ny = 28 + (i % 2) * 34;
    cx.fillStyle = 'rgba(120,160,190,.18)';
    cx.fillRect(nx + 8, ny + 12, 92, 16);
    cx.fillStyle = '#F8F8F0';
    cx.fillRect(nx, ny + 10, 96, 14);
    cx.fillRect(nx + 18, ny + 4, 28, 15);
    cx.fillRect(nx + 48, ny, 34, 19);
    cx.fillStyle = '#DCECF0';
    cx.fillRect(nx + 4, ny + 22, 86, 3);
  }

  // Bosque profundo por capas
  cx.fillStyle = '#184A2A';
  cx.fillRect(0, 150, 640, 115);
  for (let i = 0; i < 18; i++) {
    const tx = i * 42 - ((fr * 0.05) % 42);
    const h = 44 + (i % 4) * 10;
    cx.fillStyle = i % 2 ? '#143A24' : '#1F5A32';
    cx.fillRect(tx + 10, 150 - h, 18, h + 95);
    cx.fillStyle = i % 2 ? '#20683A' : '#2A7A42';
    cx.fillRect(tx, 122 - h * 0.25, 38, 16);
    cx.fillRect(tx - 8, 135 - h * 0.25, 54, 18);
    cx.fillRect(tx + 7, 108 - h * 0.25, 26, 18);
  }
  // Árboles frontales más definidos
  for (let i = 0; i < 9; i++) {
    const tx = i * 82 - 34;
    cx.fillStyle = '#5A3818';
    cx.fillRect(tx + 36, 142, 10, 105);
    cx.fillStyle = '#6A4828';
    cx.fillRect(tx + 37, 142, 3, 105);
    cx.fillStyle = '#185C2A';
    cx.fillRect(tx + 18, 104, 48, 26);
    cx.fillStyle = '#20743A';
    cx.fillRect(tx + 10, 124, 64, 28);
    cx.fillStyle = '#2B8A45';
    cx.fillRect(tx + 25, 86, 34, 25);
    cx.fillStyle = '#45A85A';
    cx.fillRect(tx + 31, 102, 16, 8);
  }

  // Suelo exterior con hierba alta de batalla
  cx.fillStyle = '#2F7A30';
  cx.fillRect(0, 245, 640, 235);
  cx.fillStyle = '#3F8E3A';
  cx.fillRect(0, 245, 640, 8);
  for (let y = 260; y < 480; y += 18) {
    cx.fillStyle = y % 36 === 0 ? '#2A6E2A' : '#347E34';
    cx.fillRect(0, y, 640, 2);
  }
  // Parches de hierba alta frontales
  const grassCols = ['#3A9C28', '#46B030', '#60C840'];
  for (let i = 0; i < 90; i++) {
    const gx = (i * 37 + (i % 5) * 9) % 640;
    const gy = 255 + ((i * 23) % 190);
    cx.fillStyle = grassCols[i % grassCols.length];
    cx.fillRect(gx, gy, 3, 14 + (i % 4) * 4);
    cx.fillStyle = '#8FE060';
    if (i % 3 === 0) cx.fillRect(gx, gy, 3, 3);
  }

  // Plataformas estilo encuentro exterior: tierra y césped, no genéricas
  cx.fillStyle = '#8A6A3A';
  cx.fillRect(338, 177, 190, 16);
  cx.fillStyle = '#A0804A';
  cx.fillRect(346, 172, 174, 8);
  cx.fillStyle = '#3A9C28';
  cx.fillRect(342, 168, 182, 6);
  cx.fillStyle = '#5FC848';
  for (let i = 0; i < 18; i++) cx.fillRect(348 + i * 9, 164 + (i % 2) * 2, 4, 6);

  cx.fillStyle = '#8A6A3A';
  cx.fillRect(55, 307, 196, 16);
  cx.fillStyle = '#A0804A';
  cx.fillRect(64, 302, 178, 8);
  cx.fillStyle = '#3A9C28';
  cx.fillRect(60, 298, 186, 6);
  cx.fillStyle = '#5FC848';
  for (let i = 0; i < 19; i++) cx.fillRect(66 + i * 9, 294 + (i % 2) * 2, 4, 6);

  // Brillos ambientales cuadrados tipo luciérnagas
  for (let i = 0; i < 8; i++) {
    const alpha = Math.sin(fr * 0.05 + i) * 0.25 + 0.35;
    cx.globalAlpha = alpha;
    cx.fillStyle = '#F8F8C0';
    cx.fillRect((i * 79 + fr * 0.2) % 640, 180 + (i * 31) % 90, 2, 2);
  }
  cx.globalAlpha = 1;
}

// === GRADIENTE DE FONDO (para batalla) ===
function dBattleBG() {
  if (G.bs && !G.bs.isNPC && G.bs.bgMap === 'world' && !G.bs.isBoss) {
    dWorldEncounterBG();
    return;
  }
  const gr = cx.createLinearGradient(0, 0, 0, 240);
  gr.addColorStop(0, '#1a0a3a');
  gr.addColorStop(0.5, '#2a1a4a');
  gr.addColorStop(1, '#3a2a5a');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 240);

  // Nubes lejanas
  cx.fillStyle = 'rgba(255,255,255,.05)';
  cx.fillRect(50 + Math.sin(fr * 0.01) * 20, 30, 80, 20);
  cx.fillRect(350 + Math.sin(fr * 0.015) * 15, 50, 100, 25);
  cx.fillRect(200 + Math.sin(fr * 0.008) * 25, 15, 70, 15);

  // Suelo verde oscuro
  cx.fillStyle = '#2a4a1a';
  cx.fillRect(0, 240, 640, 240);
  cx.fillStyle = '#3a5a2a';
  for (let i = 0; i < 640; i += 10) cx.fillRect(i, 238, 5, 5);

  // Plataformas para criaturas
  cx.fillStyle = '#4a6a3a';
  cx.fillRect(340, 178, 180, 14); // Enemigo
  cx.fillRect(60, 308, 180, 14); // Jugador
  cx.fillStyle = '#3a5a2a';
  cx.fillRect(345, 192, 170, 4);
  cx.fillRect(65, 322, 170, 4);
}

// === FONDO PARA INTRO DE BATALLA NPC ===
function dBattleIntroBG() {
  const gr = cx.createLinearGradient(0, 0, 0, 480);
  gr.addColorStop(0, '#0a0a2e');
  gr.addColorStop(0.5, '#1a1a4e');
  gr.addColorStop(1, '#0a0a2e');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 480);

  // Líneas de velocidad doradas horizontales
  for (let i = 0; i < 20; i++) {
    cx.globalAlpha = Math.sin(fr * 0.1 + i) * 0.3 + 0.3;
    cx.fillStyle = '#ffd700';
    cx.fillRect(0, i * 24 + Math.sin(fr * 0.05) * 4, 640, 1);
  }
  cx.globalAlpha = 1;

  // Estrellas centelleantes
  for (let i = 0; i < 15; i++) {
    cx.globalAlpha = Math.sin(fr * 0.08 + i * 0.5) * 0.5 + 0.5;
    cx.fillStyle = '#fff';
    cx.fillRect((i * 73 + fr * 0.5) % 640, (i * 97) % 480, 2, 2);
  }
  cx.globalAlpha = 1;
}

export { initBattleBackgroundAssets, drawBattleBackgroundAsset, dWorldEncounterBG, dBattleBG, dBattleIntroBG };
