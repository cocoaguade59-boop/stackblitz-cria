// Pantalla de mapa grande del reino.
// Muestra un minimapa con ubicaciones y la posición del jugador.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { fr } from '../core/frame.js';
import { wMap, WC, WR } from '../core/world-constants.js';
import { dBoxMenu } from '../render/ui-boxes.js';

const MAP_LOCATIONS = [
  { x: 20, y: 143, nm: 'Aldea Pitch', col: '#E84040' },
  { x: 40, y: 110, nm: 'V.Storyboard', col: '#40A0E0' },
  { x: 54, y: 82, nm: 'Cantera Rodaje', col: '#E8A030' },
  { x: 30, y: 52, nm: 'Ult.Toma', col: '#40C040' },
  { x: 44, y: 22, nm: 'P.Montaje', col: '#D860A8' },
  { x: 38, y: 8, nm: 'Cast.Difusión', col: '#C8A830' },
  { x: 15, y: 105, nm: 'C.Volcánica', col: '#E06030' },
  { x: 65, y: 38, nm: 'C.Cristalina', col: '#80A0E0' },
  { x: 55, y: 6, nm: 'Torre P.A.', col: '#F060F0' },
];

function uMapScreen() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.showMap = false;
  }
}

function dMapScreen() {
  dBoxMenu(30, 10, 580, 460, 'MAPA DEL REINO');

  // Fondo del mapa
  cx.fillStyle = '#2d5a1e';
  cx.fillRect(45, 30, 550, 420);
  cx.fillStyle = '#3a6a28';
  cx.fillRect(47, 32, 546, 416);

  // Escala del minimapa
  const scX = 546 / WC,
    scY = 416 / WR;
  const offX = 47,
    offY = 32;

  // Dibujar tiles simplificados
  for (let r = 0; r < WR; r += 2)
    for (let c = 0; c < WC; c += 2) {
      const t = wMap[r]?.[c];
      let col = null;
      if (t === 2) col = '#2070C0'; // Agua
      else if (t === 3) col = '#1A5818'; // Árboles
      else if (t === 4) col = '#A09080'; // Edificios
      else if (t === 13) col = '#687080'; // Castillo
      else if (t === 1) col = '#C8B898'; // Caminos
      else if (t === 7) col = '#707070'; // Rocas
      else if (t === 9) col = '#484038'; // Cuevas
      else if (t === 11) col = '#C8A830'; // Castillo puerta
      else if (t === 12) col = '#D860A8'; // Torre
      if (col) {
        cx.fillStyle = col;
        cx.fillRect(offX + c * scX, offY + r * scY, scX * 2 + 1, scY * 2 + 1);
      }
    }

  // Ubicaciones importantes
  MAP_LOCATIONS.forEach((loc) => {
    const lx = offX + loc.x * scX;
    const ly = offY + loc.y * scY;

    // Punto brillante
    cx.fillStyle = loc.col;
    cx.fillRect(lx - 3, ly - 3, 6, 6);
    cx.fillStyle = '#fff';
    cx.fillRect(lx - 1, ly - 1, 2, 2);

    // Nombre
    cx.fillStyle = '#000';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(loc.nm, lx + 6, ly + 2);
    cx.fillStyle = loc.col;
    cx.fillText(loc.nm, lx + 5, ly + 1);
  });

  // Jugador (punto parpadeante)
  const plx = offX + G.pl.x * scX;
  const ply = offY + G.pl.y * scY;
  if (fr % 20 < 14) {
    cx.fillStyle = '#F8F8F8';
    cx.fillRect(plx - 4, ply - 4, 8, 8);
    cx.fillStyle = '#E83030';
    cx.fillRect(plx - 2, ply - 2, 4, 4);
  }

  // Leyenda
  cx.fillStyle = '#fff';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('■ = Tú', 460, 440);
  cx.fillStyle = '#aaa';
  cx.fillText('SPACE/X: Cerrar', 50, 450);

  // Info de ubicación actual
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  const curLoc = MAP_LOCATIONS.find(
    (l) => Math.abs(l.x - G.pl.x) < 6 && Math.abs(l.y - G.pl.y) < 6
  );
  if (curLoc) cx.fillText(`Ubicación: ${curLoc.nm}`, 200, 450);
}

export { uMapScreen, dMapScreen };
