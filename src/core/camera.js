// Cámara del juego: sigue al jugador y clampea a los bordes del mapa activo.
//
// FOV del mundo (exploración): VIEW_COLS × VIEW_ROWS tiles.
// El canvas sigue siendo 640×480; el mundo se dibuja con zoom uniforme
// y letterbox si hace falta. Menú / tienda / batalla / diálogos NO usan
// este zoom (se dibujan a 1:1 después).

import { cam, T } from './world-constants.js';
import { G } from './game-state.js';

/** Tamaño lógico del canvas (px). */
const SCREEN_W = 640;
const SCREEN_H = 480;

/**
 * Campo de visión del mundo en tiles.
 * Antes: 20×15 (1 tile = 32px a escala 1:1).
 * Ahora: 15×9 → sprites ~1.33× más grandes (zoom uniforme).
 *
 * Nota: 15×9 no llena el 4:3 del canvas con escala uniforme, así que
 * hay letterbox horizontal/vertical según el ratio. Sin stretch.
 */
const VIEW_COLS = 15;
const VIEW_ROWS = 9;

/** Ancho/alto del “frame” de cámara en px de mundo (antes de zoom). */
const VIEW_W = VIEW_COLS * T; // 480
const VIEW_H = VIEW_ROWS * T; // 288

/**
 * Zoom uniforme para meter VIEW_COLS×VIEW_ROWS en el canvas sin deformar.
 * min(640/480, 480/288) = min(1.333…, 1.666…) = 4/3.
 */
const WORLD_ZOOM = Math.min(SCREEN_W / VIEW_W, SCREEN_H / VIEW_H);

/** Tamaño en pantalla del área de mundo (px). */
const WORLD_DRAW_W = VIEW_W * WORLD_ZOOM; // 640
const WORLD_DRAW_H = VIEW_H * WORLD_ZOOM; // 384

/** Letterbox: centrar el frame de mundo en el canvas. */
const WORLD_OX = Math.floor((SCREEN_W - WORLD_DRAW_W) / 2); // 0
const WORLD_OY = Math.floor((SCREEN_H - WORLD_DRAW_H) / 2); // 48

function updateCamera(cols, rows) {
  // Centrar en el tile del jugador (centro del sprite ~ +T/2).
  const mapW = cols * T;
  const mapH = rows * T;
  const targetX = G.pl.x * T + T / 2 - VIEW_W / 2;
  const targetY = G.pl.y * T + T / 2 - VIEW_H / 2;

  const maxX = Math.max(0, mapW - VIEW_W);
  const maxY = Math.max(0, mapH - VIEW_H);

  cam.x = Math.max(0, Math.min(targetX, maxX));
  cam.y = Math.max(0, Math.min(targetY, maxY));
}

/**
 * Prepara el contexto para dibujar el mundo con zoom + letterbox.
 * Llamar al inicio de drawMap (capa mundo). Luego endWorldCamera().
 */
function beginWorldCamera(ctx) {
  // Barras negras del letterbox (por si el clear no las deja)
  if (WORLD_OY > 0 || WORLD_OX > 0) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
  ctx.save();
  // Clip al área de mundo
  ctx.beginPath();
  ctx.rect(WORLD_OX, WORLD_OY, WORLD_DRAW_W, WORLD_DRAW_H);
  ctx.clip();
  ctx.translate(WORLD_OX, WORLD_OY);
  ctx.scale(WORLD_ZOOM, WORLD_ZOOM);
  // Pixel-perfect al escalar
  ctx.imageSmoothingEnabled = false;
}

function endWorldCamera(ctx) {
  ctx.restore();
  ctx.imageSmoothingEnabled = false;
}

/**
 * ¿Está un punto de pantalla-mundo (ya en coords post-cam, pre-zoom)
 * aproximadamente visible? Usa margen en px de mundo.
 */
function worldCull(sx, sy, margin = 40) {
  return (
    sx > -margin &&
    sx < VIEW_W + margin &&
    sy > -margin &&
    sy < VIEW_H + margin
  );
}

export {
  updateCamera,
  beginWorldCamera,
  endWorldCamera,
  worldCull,
  VIEW_COLS,
  VIEW_ROWS,
  VIEW_W,
  VIEW_H,
  WORLD_ZOOM,
  WORLD_DRAW_W,
  WORLD_DRAW_H,
  WORLD_OX,
  WORLD_OY,
  SCREEN_W,
  SCREEN_H,
};
