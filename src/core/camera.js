// Cámara del juego: sigue al jugador y clampea a los bordes del mapa activo.
//
// updateCamera(cols, rows) recibe las dimensiones del mapa actual
// (en tiles) y actualiza cam.x/cam.y para centrar la vista en el jugador
// sin salirse de los bordes.

import { cam, T } from './world-constants.js';
import { G } from './game-state.js';

function updateCamera(cols, rows) {
  cam.x = Math.max(0, Math.min(G.pl.x * T - 304, cols * T - 640));
  cam.y = Math.max(0, Math.min(G.pl.y * T - 224, rows * T - 480));
}

export { updateCamera };
