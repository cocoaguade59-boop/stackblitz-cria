// Sprites grandes de entrenadores para la intro de batalla NPC.
//
// Una sola función `dTrainerBig(x, y, id, f)` con un switch (id)
// que dibuja versiones grandes (para la escena de intro previa
// al combate) de los entrenadores importantes del juego.
//
// Solo se usa cuando aparece la banda 'Se acerca X!' antes de un combate NPC.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { SK } from './skin-colors.js';
import { SPRITE_LOADER } from '../core/sprite-loader.js';
import { dNPC } from './npc-sprites.js';
import { postGame } from '../core/game-flags.js';

function dTrainerBig(x, y, id, f) {
  const bob = Math.sin(f * 0.08) * 2,
    by = y + bob;

  // Marco decorativo común (+50% más grande)
  {
    const fw = 153, fh = 207;
    const fx = x - fw / 2, fy = by + 50 - fh;
    px(fx + 4, fy + 4, fw, fh, 'rgba(0,0,0,.35)');
    px(fx - 1, fy - 1, fw + 2, fh + 2, '#1A1A2E');
    px(fx, fy, fw, fh, '#C8A830');
    px(fx + 3, fy + 3, fw - 6, fh - 6, '#F8F8F0');
    px(fx + 3, fy + 3, 12, 12, '#E8C840');
    px(fx + fw - 15, fy + 3, 12, 12, '#E8C840');
    px(fx + 3, fy + fh - 15, 12, 12, '#A08828');
    px(fx + fw - 15, fy + fh - 15, 12, 12, '#A08828');
  }

  // Si hay sprite PNG en trainers/<id>.png, úsalo
  const trainerKey = 'trainers/' + id;
  if (SPRITE_LOADER.has(trainerKey)) {
    const img = SPRITE_LOADER.get(trainerKey);
    const prevSmoothing = cx.imageSmoothingEnabled;
    cx.imageSmoothingEnabled = false;
    const maxW = 133, maxH = 185;
    const ratio = img.naturalWidth / img.naturalHeight;
    let targetW = maxH * ratio, targetH = maxH;
    if (targetW > maxW) { targetW = maxW; targetH = maxW / ratio; }
    const frameX = x - Math.floor(153 / 2);
    const frameY = by + 50 - 207;
    cx.drawImage(img, frameX + Math.floor(153 / 2) - targetW / 2, frameY + 204 - targetH, targetW, targetH);
    cx.imageSmoothingEnabled = prevSmoothing;
    return;
  }

  switch (id) {
    case 'alessandro': // Armadura parcial, rojo/azul, pelo castaño
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 18, by + 44, 14, 18, '#2848A0');
      px(x + 32, by + 44, 14, 18, '#2848A0');
      px(x + 20, by + 46, 10, 14, '#3058B0');
      px(x + 34, by + 46, 10, 14, '#3058B0');
      px(x + 10, by + 20, 44, 24, '#B83030');
      px(x + 14, by + 22, 36, 20, '#C84040');
      px(x + 18, by + 24, 28, 16, '#D85050');
      px(x + 6, by + 18, 8, 8, '#90A0B0');
      px(x + 50, by + 18, 8, 8, '#90A0B0');
      px(x + 8, by + 20, 4, 4, '#A8B8C8');
      px(x + 52, by + 20, 4, 4, '#A8B8C8');
      px(x + 22, by + 24, 20, 8, '#90A0B0');
      px(x + 26, by + 26, 12, 4, '#A8B8C8');
      px(x + 12, by + 40, 40, 4, '#C8A830');
      px(x + 28, by + 39, 8, 5, '#E8C840');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 6, '#90A0B0');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 26, by + 16, 12, 4, SK.a);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 10, '#6A4A28');
      px(x + 14, by - 4, 6, 10, '#6A4A28');
      px(x + 44, by - 4, 6, 10, '#6A4A28');
      px(x + 18, by - 10, 28, 6, '#7A5A38');
      px(x + 18, by + 2, 8, 4, '#6A4A28');
      px(x + 24, by - 8, 6, 2, '#8A6A48');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A4818');
      px(x + 39, by + 8, 3, 3, '#2A4818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'fabiana': // Vestido negro completo, pelo negro largo
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      px(x + 10, by + 20, 44, 18, '#1A1A1A');
      px(x + 14, by + 22, 36, 14, '#282828');
      px(x + 18, by + 24, 28, 10, '#383838');
      px(x + 20, by + 20, 24, 4, '#E8E8E8'); // Cuello blanco decorativo
      px(x + 6, by + 24, 8, 14, SK.d);
      px(x + 50, by + 24, 8, 14, SK.d);
      px(x + 24, by + 14, 16, 8, SK.d);
      px(x + 18, by - 2, 28, 18, SK.d);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo largo negro
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 28, '#1A1A1A');
      px(x + 44, by - 2, 8, 28, '#1A1A1A');
      px(x + 10, by + 18, 6, 12, '#101010');
      px(x + 48, by + 18, 6, 12, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      // Ojos azules grandes
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2860A0');
      px(x + 39, by + 6, 4, 4, '#2860A0');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      // Pestañas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 4, 2, 1, '#1A1A1A');
      px(x + 36, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#E08080');
      break;

    case 'nicole': // Harapos, pelo honguito, crucificada post-game
      px(x + 20, by + 62, 10, 6, SK.e);
      px(x + 34, by + 62, 10, 6, SK.e);
      px(x + 22, by + 62, 6, 2, '#4A3A28');
      px(x + 14, by + 36, 36, 28, '#5A4A38');
      px(x + 16, by + 38, 32, 24, '#6A5A48');
      px(x + 14, by + 58, 6, 6, '#5A4A38');
      px(x + 44, by + 56, 6, 8, '#5A4A38');
      px(x + 20, by + 60, 4, 2, '#6A5A48');
      px(x + 40, by + 60, 4, 2, '#6A5A48');
      px(x + 10, by + 20, 44, 18, '#4A3A28');
      px(x + 14, by + 22, 36, 14, '#5A4A38');
      px(x + 18, by + 28, 8, 6, '#7A6A58');
      px(x + 36, by + 32, 6, 6, '#6A5A48');
      px(x + 14, by + 34, 36, 2, '#8A7A60');
      px(x + 8, by + 24, 8, 14, '#4A3A28');
      px(x + 48, by + 24, 8, 14, '#4A3A28');
      px(x + 10, by + 28, 4, 4, SK.e);
      px(x + 24, by + 14, 16, 8, SK.e);
      px(x + 18, by - 2, 28, 18, SK.e);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Honguito
      px(x + 14, by - 10, 36, 12, '#1A1A1A');
      px(x + 12, by - 4, 40, 8, '#1A1A1A');
      px(x + 14, by + 2, 8, 4, '#1A1A1A');
      px(x + 42, by + 2, 8, 4, '#1A1A1A');
      px(x + 18, by + 0, 28, 4, '#282828');
      // Ojeras
      px(x + 20, by + 12, 8, 2, '#C8A098');
      px(x + 36, by + 12, 8, 2, '#C8A098');
      px(x + 20, by + 4, 8, 2, '#1A1A1A');
      px(x + 38, by + 4, 8, 2, '#1A1A1A');
      px(x + 18, by + 10, 4, 2, '#B09878');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#381828');
      px(x + 39, by + 8, 3, 3, '#381828');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      if (postGame) {
        px(x + 28, by + 14, 8, 2, '#887068');
      } else {
        px(x + 28, by + 14, 8, 2, '#986858');
      }
      if (postGame) {
        px(x - 4, by - 16, 72, 6, '#5A3818');
        px(x + 28, by - 24, 8, 92, '#5A3818');
        px(x - 2, by - 14, 68, 2, '#6A4828');
        px(x + 30, by - 22, 4, 88, '#6A4828');
      }
      break;

    case 'claudia': // Anteojos morados, arriba blanco abajo negro, pendientes
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 36, 14, '#F0F0F0');
      px(x + 18, by + 24, 28, 10, '#F8F8F8');
      px(x + 18, by + 22, 28, 2, '#D0D0D0');
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo largo liso negro
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 32, '#1A1A1A');
      px(x + 44, by - 2, 8, 32, '#1A1A1A');
      px(x + 10, by + 22, 6, 10, '#101010');
      px(x + 48, by + 22, 6, 10, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      // Diadema dorada
      px(x + 16, by - 6, 32, 3, '#C8A830');
      px(x + 28, by - 8, 8, 4, '#E8C840');
      // Anteojos MORADOS
      px(x + 18, by + 4, 10, 8, '#6030A0');
      px(x + 20, by + 6, 6, 4, '#C8A0E8');
      px(x + 34, by + 4, 10, 8, '#6030A0');
      px(x + 36, by + 6, 6, 4, '#C8A0E8');
      px(x + 28, by + 6, 6, 2, '#6030A0');
      px(x + 22, by + 7, 3, 2, '#2A1818');
      px(x + 38, by + 7, 3, 2, '#2A1818');
      // Pendientes dorados
      px(x + 16, by + 8, 2, 4, '#C8A830');
      px(x + 46, by + 8, 2, 4, '#C8A830');
      px(x + 28, by + 14, 8, 2, '#E08888');
      break;

    case 'roberto': // Tez oscura, pelo castaño ondulado, arriba beige abajo naranja
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 18, by + 42, 14, 20, '#D07020');
      px(x + 32, by + 42, 14, 20, '#D07020');
      px(x + 20, by + 44, 10, 16, '#E08030');
      px(x + 34, by + 44, 10, 16, '#E08030');
      px(x + 10, by + 20, 44, 22, '#D8C8A0');
      px(x + 14, by + 22, 36, 18, '#E0D0B0');
      px(x + 18, by + 24, 28, 14, '#E8D8B8');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.b);
      // Pelo NEGRO ondulado
      px(x + 16, by - 8, 32, 10, '#141210');
      px(x + 14, by - 4, 6, 10, '#141210');
      px(x + 44, by - 4, 6, 10, '#141210');
      px(x + 18, by - 10, 8, 4, '#2C2620');
      px(x + 32, by - 10, 8, 4, '#2C2620');
      px(x + 14, by + 0, 4, 4, '#2C2620');
      px(x + 46, by + 0, 4, 4, '#2C2620');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#241208');
      px(x + 39, by + 8, 3, 3, '#241208');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#B08060');
      px(x + 28, by + 16, 8, 2, '#B08060');
      break;

    case 'brisa': // Pelo castaño suelto ondulado, blanco/negro arriba, azul gris abajo
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 16, by + 38, 32, 24, '#708898');
      px(x + 18, by + 40, 28, 20, '#8098A8');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 20, 8, '#1A1A1A');
      px(x + 34, by + 22, 16, 8, '#1A1A1A');
      px(x + 18, by + 24, 28, 4, '#282828');
      // Delantal con corazón
      px(x + 18, by + 28, 28, 18, '#F0F0F0');
      px(x + 20, by + 30, 24, 14, '#F8F8F8');
      px(x + 28, by + 34, 8, 6, '#D06070');
      px(x + 30, by + 32, 4, 2, '#D06070');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo castaño suelto (largo, enmarca el rostro)
      px(x + 14, by - 8, 36, 10, '#6A4A28');
      px(x + 12, by - 4, 6, 14, '#6A4A28');
      px(x + 46, by - 4, 6, 14, '#6A4A28');
      px(x + 16, by - 10, 32, 4, '#7A5A38');
      px(x + 14, by + 8, 4, 6, '#5A3A20');
      px(x + 46, by + 8, 4, 6, '#5A3A20');
      px(x + 24, by - 12, 6, 4, '#7A5A38');
      px(x + 32, by - 12, 6, 4, '#7A5A38');
      // Mejillas rosadas
      px(x + 20, by + 10, 4, 4, '#F0A0A0');
      px(x + 40, by + 10, 4, 4, '#F0A0A0');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#4A3018');
      px(x + 39, by + 6, 4, 4, '#4A3018');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D09080');
      break;

    case 'paulo': // Sin anteojos, arriba marrón abajo verde, libro en mano
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#388038');
      px(x + 32, by + 44, 14, 18, '#388038');
      px(x + 20, by + 46, 10, 14, '#409040');
      px(x + 34, by + 46, 10, 14, '#409040');
      px(x + 10, by + 20, 44, 24, '#785838');
      px(x + 14, by + 22, 36, 20, '#886848');
      px(x + 18, by + 24, 28, 16, '#987858');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      // Libro en mano
      px(x + 50, by + 30, 10, 12, '#8A2020');
      px(x + 52, by + 32, 6, 8, '#F0F0F0');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro corto
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 24, by - 8, 6, 2, '#383838');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#283848');
      px(x + 39, by + 8, 3, 3, '#283848');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'tamara': // Pelo negro rizado largo, traje artista morado, boina, pincel
      px(x + 20, by + 60, 10, 8, '#7A5A38');
      px(x + 34, by + 60, 10, 8, '#7A5A38');
      px(x + 16, by + 36, 32, 26, '#604878');
      px(x + 18, by + 38, 28, 22, '#685080');
      px(x + 10, by + 20, 44, 18, '#705888');
      px(x + 14, by + 22, 36, 14, '#806898');
      px(x + 18, by + 24, 28, 10, '#9078A8');
      // Manchas de pintura
      px(x + 18, by + 28, 6, 4, '#D03030');
      px(x + 40, by + 32, 4, 4, '#3090D0');
      px(x + 24, by + 44, 4, 4, '#E8C020');
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      // Pincel grande en mano
      px(x + 52, by + 22, 4, 18, '#B89060');
      px(x + 52, by + 18, 4, 6, '#D03030');
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo NEGRO RIZADO largo
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 30, '#1A1A1A');
      px(x + 44, by - 2, 8, 30, '#1A1A1A');
      // Rizos zigzag
      px(x + 10, by + 6, 4, 4, '#282828');
      px(x + 12, by + 14, 4, 4, '#282828');
      px(x + 10, by + 22, 4, 4, '#282828');
      px(x + 48, by + 6, 4, 4, '#282828');
      px(x + 46, by + 14, 4, 4, '#282828');
      px(x + 48, by + 22, 4, 4, '#282828');
      // Boina
      px(x + 16, by - 14, 32, 8, '#483060');
      px(x + 20, by - 16, 24, 6, '#584070');
      px(x + 28, by - 18, 8, 4, '#584070');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#4A2838');
      px(x + 39, by + 6, 4, 4, '#4A2838');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#E08888');
      break;

    case 'nahuel': // Arriba negro, shorts, pelo negro corto
      px(x + 20, by + 60, 10, 8, '#8A6840');
      px(x + 34, by + 60, 10, 8, '#8A6840');
      px(x + 20, by + 52, 10, 8, SK.b);
      px(x + 34, by + 52, 10, 8, SK.b); // Piernas
      px(x + 18, by + 42, 14, 12, '#1A1A1A');
      px(x + 32, by + 42, 14, 12, '#1A1A1A'); // Shorts
      px(x + 10, by + 20, 44, 22, '#1A1A1A');
      px(x + 14, by + 22, 36, 18, '#282828');
      px(x + 18, by + 24, 28, 14, '#383838');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A1818');
      px(x + 39, by + 8, 3, 3, '#2A1818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 24, by + 14, 16, 2, '#C08868');
      px(x + 26, by + 16, 12, 2, '#C08868');
      break;

    case 'pachi': // Traje teatral, capa morada
      px(x + 20, by + 60, 10, 8, '#4A2A10');
      px(x + 34, by + 60, 10, 8, '#4A2A10');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#3A2848');
      px(x + 14, by + 22, 36, 20, '#4A3858');
      px(x + 18, by + 24, 28, 16, '#5A4868');
      px(x + 18, by + 22, 28, 2, '#C8A830');
      px(x + 18, by + 36, 28, 2, '#C8A830');
      px(x + 4, by + 16, 8, 36, '#6830A0');
      px(x + 52, by + 16, 8, 36, '#6830A0');
      px(x + 6, by + 18, 4, 32, '#7840B0');
      px(x + 54, by + 18, 4, 32, '#7840B0');
      px(x + 22, by + 22, 20, 6, '#C83030');
      px(x + 24, by + 26, 16, 4, '#D84040');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo ondulado negro
      px(x + 14, by - 10, 36, 10, '#1A1A1A');
      px(x + 12, by - 4, 8, 14, '#1A1A1A');
      px(x + 44, by - 4, 8, 14, '#1A1A1A');
      px(x + 16, by - 12, 10, 6, '#282828');
      px(x + 36, by - 12, 10, 6, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#382818');
      px(x + 39, by + 8, 3, 3, '#382818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'gabriela': // Arriba magenta/armadura post, abajo negro, pelo ondulado con flores
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      if (postGame) {
        px(x + 10, by + 20, 44, 18, '#90A0B0');
        px(x + 14, by + 22, 36, 14, '#A0B0C0');
        px(x + 18, by + 24, 28, 10, '#B0C0D0');
        px(x + 24, by + 26, 16, 8, '#C8A830');
        px(x + 28, by + 28, 8, 4, '#E8C840');
      } else {
        px(x + 10, by + 20, 44, 18, '#C83888');
        px(x + 14, by + 22, 36, 14, '#D84898');
        px(x + 18, by + 24, 28, 10, '#E858A8');
      }
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.c);
      // Pelo negro ondulado largo con flores
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 32, '#1A1A1A');
      px(x + 44, by - 2, 8, 32, '#1A1A1A');
      px(x + 10, by + 14, 6, 16, '#101010');
      px(x + 48, by + 14, 6, 16, '#101010');
      // Ondulaciones
      px(x + 10, by + 18, 4, 4, '#282828');
      px(x + 50, by + 18, 4, 4, '#282828');
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 50, by + 26, 4, 4, '#282828');
      // Flores en pelo
      px(x + 16, by - 4, 4, 4, '#F088A0');
      px(x + 44, by - 4, 4, 4, '#88B8F0');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#6A4028');
      px(x + 39, by + 6, 4, 4, '#6A4028');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      // Pestañas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#B08060');
      break;

    case 'hernan': // Todo negro, barba corta (sin barba post-game), ojos melancólicos
      px(x + 20, by + 60, 10, 8, '#1A1A1A');
      px(x + 34, by + 60, 10, 8, '#1A1A1A');
      px(x + 18, by + 42, 14, 20, '#1A1A1A');
      px(x + 32, by + 42, 14, 20, '#1A1A1A');
      px(x + 10, by + 20, 44, 22, '#1A1A1A');
      px(x + 14, by + 22, 36, 18, '#282828');
      px(x + 18, by + 24, 28, 14, '#383838');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 28, by + 37, 8, 5, '#C8A830');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      // Barba solo pre-game
      if (!postGame) {
        px(x + 22, by + 14, 20, 4, '#282828');
        px(x + 24, by + 17, 16, 3, '#383838');
      }
      // Ojos melancólicos
      px(x + 22, by + 4, 6, 6, '#fff');
      px(x + 36, by + 4, 6, 6, '#fff');
      px(x + 25, by + 6, 3, 4, '#282020');
      px(x + 39, by + 6, 3, 4, '#282020');
      px(x + 25, by + 7, 2, 1, '#fff');
      px(x + 39, by + 7, 2, 1, '#fff');
      if (!postGame) {
        px(x + 22, by + 2, 6, 2, '#1A1A1A');
        px(x + 36, by + 2, 6, 2, '#1A1A1A');
      } // Cejas tristes
      px(x + 28, by + 18, 8, 2, '#C08868');
      break;

    case 'angelly': // Pelo suelto negro, tez clara, amarillo/verde
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 16, by + 36, 32, 12, '#38A048');
      px(x + 14, by + 40, 36, 14, '#48B058');
      px(x + 10, by + 20, 44, 18, '#E8C830');
      px(x + 14, by + 22, 36, 14, '#F0D840');
      px(x + 18, by + 24, 28, 10, '#F8E050');
      px(x + 12, by + 34, 40, 4, '#8A7850');
      px(x + 6, by + 24, 8, 12, SK.d);
      px(x + 50, by + 24, 8, 12, SK.d);
      px(x + 24, by + 14, 16, 8, SK.d);
      px(x + 18, by - 2, 28, 18, SK.d);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro suelto largo
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 28, '#1A1A1A');
      px(x + 44, by - 2, 8, 28, '#1A1A1A');
      px(x + 10, by + 14, 6, 16, '#101010');
      px(x + 48, by + 14, 6, 16, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2A1818');
      px(x + 39, by + 6, 4, 4, '#2A1818');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 24, by + 14, 16, 4, '#C08868');
      px(x + 28, by + 14, 8, 2, '#F8F8F8');
      break;

    case 'dayana': // Suéter lavanda oversize, pelo negro largo mechón azul
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 16, by + 38, 32, 24, '#9880B0');
      px(x + 18, by + 40, 28, 20, '#A890C0');
      px(x + 8, by + 20, 48, 20, '#A890C0');
      px(x + 12, by + 22, 40, 16, '#B8A0D0');
      px(x + 16, by + 24, 32, 12, '#C8B0E0');
      // Cuello alto
      px(x + 20, by + 16, 24, 6, '#A890C0');
      // Mangas largas cubriendo manos
      px(x + 4, by + 24, 10, 16, '#A890C0');
      px(x + 50, by + 24, 10, 16, '#A890C0');
      px(x + 2, by + 36, 10, 6, '#B8A0D0');
      px(x + 52, by + 36, 10, 6, '#B8A0D0');
      px(x + 24, by + 14, 16, 4, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro largo con mechón azul
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 30, '#1A1A1A');
      px(x + 44, by - 2, 8, 30, '#1A1A1A');
      px(x + 12, by + 2, 6, 10, '#3070C0'); // Mechón azul
      px(x + 16, by - 10, 28, 4, '#282828');
      // Ojos
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#201010');
      px(x + 39, by + 6, 4, 4, '#201010');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'deyna': // Chaqueta cuero azul, pelo corto mechón rosa, pulsera arcoíris
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#4870A0');
      px(x + 14, by + 22, 36, 20, '#5880B0');
      px(x + 18, by + 24, 28, 16, '#6890C0');
      // Botones
      px(x + 30, by + 28, 3, 3, '#C8C8C8');
      px(x + 30, by + 36, 3, 3, '#C8C8C8');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      // Pulsera arcoíris
      px(x + 6, by + 36, 8, 2, '#D02020');
      px(x + 6, by + 38, 8, 2, '#E8C020');
      px(x + 6, by + 40, 8, 2, '#20A020');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro corto con mechón rosa
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      px(x + 16, by - 10, 12, 6, '#D060A0'); // Mechón rosa grande
      px(x + 40, by - 8, 8, 4, '#D060A0');
      // Piercings oreja
      px(x + 14, by + 6, 2, 2, '#C8C8C8');
      px(x + 14, by + 10, 2, 2, '#E8C020');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2A2020');
      px(x + 39, by + 6, 4, 4, '#2A2020');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'andre': // Máscara hierro, SIN CAMISA, torso descubierto, músculos
      px(x + 20, by + 60, 10, 8, '#484848');
      px(x + 34, by + 60, 10, 8, '#484848');
      px(x + 18, by + 44, 14, 18, '#404040');
      px(x + 32, by + 44, 14, 18, '#404040');
      px(x + 12, by + 22, 40, 22, SK.a);
      px(x + 16, by + 24, 32, 18, SK.b);
      px(x + 20, by + 26, 8, 8, '#D8B898');
      px(x + 36, by + 26, 8, 8, '#D8B898');
      px(x + 26, by + 30, 4, 4, '#D0A880');
      px(x + 34, by + 30, 4, 4, '#D0A880');
      px(x + 28, by + 36, 8, 4, '#C8A070');
      px(x + 6, by + 20, 8, 20, '#404048');
      px(x + 50, by + 20, 8, 20, '#404048');
      px(x + 8, by + 22, 4, 16, '#505058');
      px(x + 52, by + 22, 4, 16, '#505058');
      px(x + 6, by + 24, 8, 16, SK.a);
      px(x + 50, by + 24, 8, 16, SK.a);
      px(x + 16, by - 4, 32, 24, '#788090');
      px(x + 18, by - 2, 28, 20, '#8890A0');
      px(x + 20, by + 0, 24, 16, '#90A0B0');
      px(x + 22, by + 6, 6, 4, '#282828');
      px(x + 36, by + 6, 6, 4, '#282828');
      px(x + 26, by + 14, 12, 3, '#484848');
      px(x + 18, by + 0, 3, 3, '#E8C830');
      px(x + 43, by + 0, 3, 3, '#E8C830');
      px(x + 18, by + 14, 3, 3, '#E8C830');
      px(x + 43, by + 14, 3, 3, '#E8C830');
      px(x + 30, by - 2, 4, 3, '#E8C830');
      px(x + 20, by + 2, 24, 1, '#687080');
      px(x + 20, by + 12, 24, 1, '#687080');
      px(x + 16, by - 6, 32, 4, '#1A1A1A');
      break;

    case 'alejandro': // Si hay sprite PNG lo usa, si no dibuja pixel-art viejo
      if (SPRITE_LOADER.has('npcs/alejandro')) {
        const prevSmoothing = cx.imageSmoothingEnabled;
        cx.imageSmoothingEnabled = false;
        const img = SPRITE_LOADER.get('npcs/alejandro');
        // Sprite grande para intro de batalla: ~200 px de alto
        const targetH = 220;
        const ratio = img.naturalWidth / img.naturalHeight;
        const targetW = targetH * ratio; // ~112 con ratio 0.51
        // Centrar horizontalmente sobre (x + 32) que es el centro típico del entrenador
        const drawX = x + 32 - targetW / 2;
        const drawY = by - 80;
        cx.drawImage(img, drawX, drawY, targetW, targetH);
        cx.imageSmoothingEnabled = prevSmoothing;
      } else {
        // Fallback pixel-art (mientras el PNG no está o carga)
        px(x + 20, by + 60, 10, 8, '#5A3A18');
        px(x + 34, by + 60, 10, 8, '#5A3A18');
        px(x + 18, by + 44, 14, 18, '#708898');
        px(x + 32, by + 44, 14, 18, '#708898');
        px(x + 10, by + 20, 44, 24, '#1A1A1A');
        px(x + 14, by + 22, 36, 20, '#282828');
        px(x + 20, by + 24, 24, 16, '#383838'); // Interior chaleco
        px(x + 12, by + 40, 40, 4, '#4A2A10');
        px(x + 6, by + 24, 8, 16, SK.b);
        px(x + 50, by + 24, 8, 16, SK.b);
        px(x + 24, by + 14, 16, 8, SK.b);
        px(x + 18, by - 2, 28, 18, SK.b);
        px(x + 20, by + 0, 24, 14, SK.a);
        // Pelo LARGO negro (único hombre)
        px(x + 14, by - 8, 36, 10, '#1A1A1A');
        px(x + 12, by - 2, 8, 32, '#1A1A1A');
        px(x + 44, by - 2, 8, 32, '#1A1A1A');
        px(x + 10, by + 18, 6, 16, '#101010');
        px(x + 48, by + 18, 6, 16, '#101010');
        // Bandana roja
        px(x + 14, by - 4, 36, 6, '#C83030');
        px(x + 10, by - 2, 6, 4, '#C83030');
        px(x + 48, by - 2, 6, 4, '#C83030');
        px(x + 8, by + 0, 6, 10, '#C83030'); // Cola bandana
        px(x + 22, by + 6, 6, 5, '#fff');
        px(x + 36, by + 6, 6, 5, '#fff');
        px(x + 25, by + 8, 3, 3, '#181818');
        px(x + 39, by + 8, 3, 3, '#181818');
        px(x + 25, by + 8, 2, 1, '#fff');
        px(x + 39, by + 8, 2, 1, '#fff');
        px(x + 28, by + 14, 8, 2, '#C08868');
      }
      break;

    case 'ximena': // Sombrero catrina con flores, escote, color vino y negro, pelo ondulado
      px(x + 20, by + 60, 10, 8, '#4A1828');
      px(x + 34, by + 60, 10, 8, '#4A1828');
      px(x + 14, by + 34, 36, 28, '#1A1A1A');
      px(x + 16, by + 36, 32, 24, '#282828');
      // Parte superior vino con ESCOTE
      px(x + 10, by + 20, 44, 16, '#882838');
      px(x + 14, by + 22, 36, 12, '#983848');
      px(x + 18, by + 24, 28, 8, '#A84858');
      // Escote V
      px(x + 24, by + 20, 16, 6, SK.a);
      px(x + 28, by + 22, 8, 4, SK.b);
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro ondulado
      px(x + 14, by - 6, 36, 8, '#1A1A1A');
      px(x + 12, by - 2, 8, 24, '#1A1A1A');
      px(x + 44, by - 2, 8, 24, '#1A1A1A');
      px(x + 12, by + 6, 4, 4, '#282828');
      px(x + 48, by + 6, 4, 4, '#282828');
      px(x + 12, by + 14, 4, 4, '#282828');
      px(x + 48, by + 14, 4, 4, '#282828');
      // SOMBRERO GRANDE estilo catrina
      px(x + 4, by - 12, 56, 8, '#882838');
      px(x + 8, by - 16, 48, 8, '#983848');
      px(x + 16, by - 18, 32, 6, '#A84858');
      // Flores en sombrero
      px(x + 12, by - 16, 6, 6, '#F088A0');
      px(x + 28, by - 18, 6, 6, '#E8C830');
      px(x + 44, by - 16, 6, 6, '#F088A0');
      px(x + 20, by - 14, 4, 4, '#F8F8F8');
      px(x + 36, by - 14, 4, 4, '#88B8F0');
      // Ojos nostálgicos
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 24, by + 6, 4, 4, '#2A2020');
      px(x + 38, by + 6, 4, 4, '#2A2020');
      px(x + 24, by + 6, 2, 2, '#fff');
      px(x + 38, by + 6, 2, 2, '#fff');
      // Pestañas largas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 4, 2, 1, '#1A1A1A');
      px(x + 36, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'andrea': // Profesora medieval, lentes, pelo recogido con lápiz
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 14, by + 36, 36, 26, '#2858A0');
      px(x + 16, by + 38, 32, 22, '#3868B0');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 36, 14, '#F0F0F0');
      // Chaleco azul con abertura
      px(x + 14, by + 22, 14, 12, '#2858A0');
      px(x + 36, by + 22, 14, 12, '#2858A0');
      px(x + 28, by + 22, 8, 12, '#F0F0F0'); // Abertura frontal
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      // Libro en mano
      px(x + 52, by + 28, 8, 10, '#3868A8');
      px(x + 54, by + 30, 4, 6, '#F0F0F0');
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro recogido con moño
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      px(x + 28, by - 12, 8, 6, '#1A1A1A');
      px(x + 30, by - 14, 4, 4, '#282828');
      // Lápiz en moño
      px(x + 38, by - 10, 4, 10, '#E8C830');
      px(x + 38, by - 12, 4, 4, '#D03030');
      // Lentes rectangulares
      px(x + 18, by + 4, 10, 6, '#404040');
      px(x + 20, by + 6, 6, 2, '#B8D0F0');
      px(x + 34, by + 4, 10, 6, '#404040');
      px(x + 36, by + 6, 6, 2, '#B8D0F0');
      px(x + 28, by + 6, 6, 2, '#404040');
      px(x + 22, by + 6, 3, 2, '#2A1818');
      px(x + 38, by + 6, 3, 2, '#2A1818');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'yam': // Pre-game con casco; post-game sin casco
      if (!postGame) {
        // Armadura tosca con cuernos y hacha, versión grande
        px(x + 18, by + 58, 14, 10, '#565A60');
        px(x + 34, by + 58, 14, 10, '#565A60');
        px(x + 18, by + 42, 14, 18, '#6A6E76');
        px(x + 32, by + 42, 14, 18, '#6A6E76');
        px(x + 8, by + 18, 48, 26, '#707782');
        px(x + 12, by + 20, 40, 22, '#858C98');
        px(x + 16, by + 24, 32, 14, '#59606A');
        px(x + 4, by + 16, 12, 10, '#7C838E');
        px(x + 48, by + 16, 12, 10, '#7C838E');
        // Hacha
        px(x + 56, by + 8, 4, 58, '#6A4828');
        px(x + 48, by + 8, 16, 12, '#A8B0B8');
        px(x + 52, by + 4, 12, 18, '#C0C8D0');
        // Casco
        px(x + 16, by - 6, 32, 28, '#68707C');
        px(x + 20, by - 2, 24, 22, '#808894');
        px(x + 22, by + 8, 8, 4, '#151515');
        px(x + 36, by + 8, 8, 4, '#151515');
        px(x + 8, by - 12, 12, 7, '#D8D0B0');
        px(x + 44, by - 12, 12, 7, '#D8D0B0');
        px(x + 2, by - 18, 10, 5, '#F0E8C8');
        px(x + 54, by - 18, 10, 5, '#F0E8C8');
        px(x + 28, by + 16, 8, 2, '#303030');
      } else {
        // Yam post-game: amable, cabello negro largo, ojos negros sin escleróticas
        px(x + 18, by + 58, 14, 10, '#8090A0');
        px(x + 34, by + 58, 14, 10, '#8090A0');
        px(x + 18, by + 42, 14, 18, '#8898A8');
        px(x + 32, by + 42, 14, 18, '#8898A8');
        px(x + 8, by + 18, 48, 26, '#A0B0C0');
        px(x + 12, by + 20, 40, 22, '#B0C0D0');
        px(x + 16, by + 22, 32, 18, '#C0D0E0');
        px(x + 24, by + 24, 16, 12, '#E8C830');
        px(x + 28, by + 28, 8, 4, '#D8B820');
        px(x + 4, by + 18, 8, 8, '#A0B0C0');
        px(x + 52, by + 18, 8, 8, '#A0B0C0');
        px(x + 6, by + 24, 8, 14, SK.a);
        px(x + 50, by + 24, 8, 14, SK.a);
        px(x + 24, by + 12, 16, 8, SK.a);
        px(x + 18, by - 4, 28, 18, SK.a);
        px(x + 20, by - 2, 24, 14, SK.d);
        px(x + 14, by - 10, 36, 10, '#111');
        px(x + 12, by - 4, 8, 36, '#111');
        px(x + 44, by - 4, 8, 36, '#111');
        px(x + 10, by + 24, 6, 20, '#080808');
        px(x + 48, by + 24, 6, 20, '#080808');
        px(x + 18, by - 12, 28, 5, '#282828');
        px(x + 24, by + 4, 6, 6, '#050505');
        px(x + 36, by + 4, 6, 6, '#050505');
        px(x + 26, by + 4, 2, 2, '#303030');
        px(x + 38, by + 4, 2, 2, '#303030');
        px(x + 28, by + 14, 10, 3, '#E08888');
        px(x + 31, by + 14, 4, 1, '#F8F8F8');
      }
      break;

    case 'ravell': // Bufón amarillo y verde rayas, cascabeles
      px(x + 14, by + 58, 10, 10, '#E8C830');
      px(x + 40, by + 58, 10, 10, '#38A038');
      px(x + 18, by + 44, 12, 16, '#D8B820');
      px(x + 34, by + 44, 12, 16, '#28A028');
      // Cuerpo rayas
      px(x + 6, by + 18, 26, 26, '#E8C830');
      px(x + 32, by + 18, 26, 26, '#38A038');
      // Rayas cruzadas
      px(x + 10, by + 22, 4, 18, '#38A038');
      px(x + 18, by + 22, 4, 18, '#38A038');
      px(x + 34, by + 22, 4, 18, '#E8C830');
      px(x + 42, by + 22, 4, 18, '#E8C830');
      // Collar
      px(x + 10, by + 16, 44, 4, '#F0F0F0');
      px(x + 24, by + 12, 16, 6, SK.a);
      px(x + 18, by - 4, 28, 18, SK.a);
      px(x + 20, by - 2, 24, 14, SK.d);
      // Gorro bufón bicolor
      px(x + 12, by - 18, 20, 20, '#E8C830');
      px(x + 32, by - 18, 20, 20, '#38A038');
      px(x + 10, by - 20, 6, 6, '#F8D030');
      px(x + 48, by - 20, 6, 6, '#48B048');
      px(x + 28, by - 24, 8, 6, '#F8D030');
      // Cascabeles
      px(x + 10, by - 20, 4, 4, '#C8C8C8');
      px(x + 50, by - 20, 4, 4, '#C8C8C8');
      px(x + 30, by - 24, 4, 4, '#C8C8C8');
      px(x + 12, by - 19, 2, 2, '#F8F8F8');
      px(x + 52, by - 19, 2, 2, '#F8F8F8');
      px(x + 24, by + 4, 6, 6, '#283848');
      px(x + 36, by + 4, 6, 6, '#283848');
      // Lágrima
      px(x + 42, by + 8, 2, 6, '#50A8F0');
      px(x + 28, by + 14, 8, 2, '#C09888');
      break;

    case 'oscar':
    case 'piero':
    case 'chrys':
      // Versiones grandes reutilizando el sprite de mapa a escala limpia.
      cx.save();
      cx.translate(x, y + 6);
      cx.scale(2, 2);
      dNPC(0, 0, id, f);
      cx.restore();
      break;

    case 'oloman': // Mohawk rojo, chaqueta cuero, estoperoles, piercings
      px(x + 18, by + 58, 12, 10, '#181818');
      px(x + 34, by + 58, 12, 10, '#181818');
      px(x + 20, by + 60, 2, 2, '#C8C8C8');
      px(x + 36, by + 60, 2, 2, '#C8C8C8');
      px(x + 20, by + 44, 10, 16, '#101010');
      px(x + 34, by + 44, 10, 16, '#101010');
      px(x + 10, by + 20, 44, 26, '#282828');
      px(x + 14, by + 22, 36, 22, '#383838');
      px(x + 10, by + 22, 4, 4, '#C8C8C8');
      px(x + 50, by + 22, 4, 4, '#C8C8C8');
      px(x + 14, by + 20, 4, 4, '#C8C8C8');
      px(x + 46, by + 20, 4, 4, '#C8C8C8');
      px(x + 20, by + 28, 24, 10, '#F0F0F0');
      px(x + 22, by + 30, 20, 6, '#D03030');
      px(x + 10, by + 42, 8, 4, '#A8A8A8');
      px(x + 14, by + 44, 8, 2, '#A8A8A8');
      px(x + 6, by + 24, 8, 14, SK.d);
      px(x + 50, by + 24, 8, 14, SK.d);
      px(x + 24, by + 6, 16, 16, SK.d);
      px(x + 26, by + 8, 12, 12, SK.d);
      px(x + 26, by - 20, 12, 26, '#D02020');
      px(x + 28, by - 24, 8, 22, '#E03030');
      px(x + 30, by - 28, 4, 18, '#F04040');
      px(x + 18, by + 4, 8, 10, SK.e);
      px(x + 38, by + 4, 8, 10, SK.e);
      px(x + 22, by + 8, 6, 5, '#fff');
      px(x + 36, by + 8, 6, 5, '#fff');
      px(x + 25, by + 10, 3, 3, '#181818');
      px(x + 39, by + 10, 3, 3, '#181818');
      px(x + 22, by + 8, 6, 2, '#282828');
      px(x + 36, by + 8, 6, 2, '#282828');
      px(x + 25, by + 10, 2, 1, '#fff');
      px(x + 39, by + 10, 2, 1, '#fff');
      px(x + 32, by + 14, 2, 4, '#C8C8C8');
      px(x + 20, by + 12, 2, 2, '#C8C8C8');
      px(x + 28, by + 18, 8, 2, '#A88070');
      break;

    case 'boss': // Rey, barba blanca, corona, capa roja, armadura
      px(x + 14, by + 58, 12, 10, '#586878');
      px(x + 38, by + 58, 12, 10, '#586878');
      px(x + 16, by + 40, 12, 20, '#687888');
      px(x + 36, by + 40, 12, 20, '#687888');
      px(x + 4, by + 16, 56, 28, '#687888');
      px(x + 8, by + 18, 48, 24, '#789098');
      px(x + 12, by + 20, 40, 20, '#88A0A8');
      px(x + 24, by + 22, 16, 14, '#E8C830');
      px(x + 28, by + 26, 8, 6, '#D8B820');
      px(x + 0, by + 16, 8, 40, '#A82020');
      px(x + 56, by + 16, 8, 40, '#A82020');
      px(x + 2, by + 20, 4, 32, '#C83030');
      px(x + 58, by + 20, 4, 32, '#C83030');
      px(x + 0, by + 52, 8, 6, '#E8E8E8');
      px(x + 56, by + 52, 8, 6, '#E8E8E8');
      px(x + 2, by + 53, 2, 2, '#282828');
      px(x + 58, by + 53, 2, 2, '#282828');
      px(x + 20, by - 6, 24, 22, SK.a);
      px(x + 22, by - 4, 20, 18, SK.d);
      px(x + 20, by + 12, 24, 10, '#E8E8E8');
      px(x + 22, by + 18, 20, 8, '#E0E0E0');
      px(x + 24, by + 24, 16, 6, '#D8D8D8');
      px(x + 26, by + 28, 12, 4, '#D0D0D0');
      px(x + 24, by + 0, 6, 6, '#fff');
      px(x + 36, by + 0, 6, 6, '#fff');
      px(x + 26, by + 2, 4, 4, '#384858');
      px(x + 38, by + 2, 4, 4, '#384858');
      px(x + 24, by - 2, 6, 2, '#C0C0C0');
      px(x + 36, by - 2, 6, 2, '#C0C0C0');
      px(x + 14, by - 14, 36, 10, '#E8C830');
      px(x + 18, by - 20, 6, 10, '#E8C830');
      px(x + 30, by - 22, 6, 12, '#E8C830');
      px(x + 42, by - 20, 6, 10, '#E8C830');
      px(x + 20, by - 18, 4, 4, '#D03030');
      px(x + 30, by - 20, 6, 4, '#3060D0');
      px(x + 42, by - 18, 4, 4, '#30C030');
      px(x + 14, by - 6, 6, 14, '#C0C0C0');
      px(x + 44, by - 6, 6, 14, '#C0C0C0');
      break;

    case 'edison': // Pelo negro, anteojos negros, medieval genial
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#3A5068');
      px(x + 14, by + 22, 36, 20, '#4A6078');
      px(x + 18, by + 24, 28, 16, '#5A7088');
      px(x + 18, by + 22, 28, 2, '#C8A830');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      px(x + 28, by + 39, 8, 5, '#C8A830');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      // Anteojos negros
      px(x + 18, by + 4, 10, 6, '#1A1A1A');
      px(x + 20, by + 6, 6, 2, '#303848');
      px(x + 34, by + 4, 10, 6, '#1A1A1A');
      px(x + 36, by + 6, 6, 2, '#303848');
      px(x + 28, by + 6, 6, 2, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'luis': // Arriba gris/azul, abajo negro, bastón
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 8, by + 20, 48, 36, '#607088');
      px(x + 12, by + 22, 40, 32, '#708098');
      px(x + 16, by + 24, 32, 28, '#8090A8');
      px(x + 14, by + 38, 36, 4, '#4A2A10');
      px(x + 28, by + 37, 8, 5, '#C8A830');
      px(x + 6, by + 24, 6, 14, SK.b);
      px(x + 52, by + 24, 6, 14, SK.b);
      // Bastón
      px(x + 56, by + 14, 3, 40, '#6A4828');
      px(x + 55, by + 10, 5, 5, '#A88848');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 12, '#1A1A1A');
      px(x + 44, by - 4, 6, 12, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#384858');
      px(x + 39, by + 8, 3, 3, '#384858');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'dante': // Pelo negro rizado, gabardina verde/negro
      px(x + 20, by + 60, 10, 8, '#1A1A1A');
      px(x + 34, by + 60, 10, 8, '#1A1A1A');
      px(x + 8, by + 20, 48, 40, '#1A1A1A');
      px(x + 12, by + 22, 40, 36, '#2A3A28');
      px(x + 16, by + 24, 32, 32, '#3A4A38');
      px(x + 20, by + 18, 24, 6, '#1A1A1A'); // Cuello alto
      px(x + 6, by + 24, 6, 16, SK.b);
      px(x + 52, by + 24, 6, 16, SK.b);
      px(x + 24, by + 14, 16, 6, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo rizado
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      px(x + 16, by - 10, 6, 4, '#282828');
      px(x + 26, by - 12, 6, 4, '#282828');
      px(x + 38, by - 10, 6, 4, '#282828');
      px(x + 14, by + 0, 4, 4, '#282828');
      px(x + 46, by + 0, 4, 4, '#282828');
      // Ojos rojizos
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#681818');
      px(x + 39, by + 8, 3, 3, '#681818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#A88070');
      break;

    case 'dan': // Arriba verde, abajo escarlata
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#C83838');
      px(x + 32, by + 44, 14, 18, '#C83838');
      px(x + 20, by + 46, 10, 14, '#D84848');
      px(x + 34, by + 46, 10, 14, '#D84848');
      px(x + 10, by + 20, 44, 24, '#2A6830');
      px(x + 14, by + 22, 36, 20, '#307038');
      px(x + 18, by + 24, 28, 16, '#387840');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      // Ojos pensativos
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 6, 3, 3, '#3A2828');
      px(x + 39, by + 6, 3, 3, '#3A2828');
      px(x + 25, by + 6, 2, 1, '#fff');
      px(x + 39, by + 6, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'luchito': // Chaleco rojo, camisa blanca, corbatín, rosa, más delgado
      px(x + 22, by + 60, 8, 8, '#1A1A1A');
      px(x + 34, by + 60, 8, 8, '#1A1A1A');
      px(x + 22, by + 44, 8, 18, '#1A1A1A');
      px(x + 34, by + 44, 8, 18, '#1A1A1A');
      px(x + 14, by + 20, 36, 24, '#B83030');
      px(x + 18, by + 22, 28, 20, '#C84040');
      // Camisa blanca interior
      px(x + 22, by + 22, 20, 16, '#F0F0F0');
      // Corbatín
      px(x + 28, by + 20, 8, 4, '#181818');
      px(x + 30, by + 18, 4, 2, '#181818');
      px(x + 8, by + 24, 8, 16, SK.b);
      px(x + 48, by + 24, 8, 16, SK.b);
      // Rosa en mano
      px(x + 50, by + 28, 6, 6, '#D83838');
      px(x + 52, by + 33, 2, 10, '#308028');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo peinado elegante
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 6, '#1A1A1A');
      px(x + 16, by - 8, 10, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#3A2020');
      px(x + 39, by + 8, 3, 3, '#3A2020');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#C08868');
      px(x + 28, by + 16, 8, 2, '#C08868');
      break;

    case 'alexandro': // Sombrero paja, arriba crema abajo verde, pecas
      px(x + 20, by + 60, 10, 8, '#6A4828');
      px(x + 34, by + 60, 10, 8, '#6A4828');
      px(x + 16, by + 34, 32, 28, '#388038');
      px(x + 18, by + 36, 28, 24, '#409040');
      // Tirantes overol
      px(x + 20, by + 22, 6, 14, '#388038');
      px(x + 38, by + 22, 6, 14, '#388038');
      px(x + 10, by + 20, 44, 8, '#D8C8A0');
      px(x + 14, by + 22, 36, 4, '#E0D0B0');
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      // Pecas
      px(x + 22, by + 10, 2, 2, '#A06A45');
      px(x + 28, by + 12, 2, 2, '#A06A45');
      px(x + 40, by + 10, 2, 2, '#A06A45');
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.c);
      // Sombrero de paja
      px(x + 8, by - 8, 48, 8, '#E0C060');
      px(x + 14, by - 12, 36, 8, '#E8C870');
      px(x + 18, by - 14, 28, 4, '#F0D080');
      px(x + 24, by - 10, 16, 4, '#C83030'); // Cinta
      px(x + 16, by - 2, 32, 4, '#1A1A1A');
      px(x + 14, by + 0, 6, 6, '#1A1A1A');
      px(x + 44, by + 0, 6, 6, '#1A1A1A');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A6020');
      px(x + 39, by + 8, 3, 3, '#2A6020');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#B08060');
      break;

    case 'gonchi': // Anteojos, gorro, arriba gris abajo azul gris, mochila
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 44, 14, 18, '#708898');
      px(x + 32, by + 44, 14, 18, '#708898');
      px(x + 10, by + 20, 44, 24, '#787888');
      px(x + 14, by + 22, 36, 20, '#8888A0');
      px(x + 18, by + 24, 28, 16, '#9898B0');
      // Capucha caída
      px(x + 16, by + 16, 32, 6, '#787888');
      px(x + 14, by + 18, 8, 4, '#787888');
      px(x + 42, by + 18, 8, 4, '#787888');
      // Mochila
      px(x + 4, by + 24, 8, 18, '#6A4A28');
      px(x + 6, by + 26, 4, 14, '#7A5A38');
      px(x + 6, by + 24, 4, 2, '#C8A830');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Gorro
      px(x + 16, by - 10, 32, 10, '#484858');
      px(x + 18, by - 12, 28, 6, '#585868');
      px(x + 16, by - 2, 32, 4, '#1A1A1A');
      // ANTEOJOS
      px(x + 18, by + 4, 10, 6, '#1A1A1A');
      px(x + 20, by + 6, 6, 2, '#B8D0F0');
      px(x + 34, by + 4, 10, 6, '#1A1A1A');
      px(x + 36, by + 6, 6, 2, '#B8D0F0');
      px(x + 28, by + 6, 6, 2, '#1A1A1A');
      px(x + 22, by + 7, 3, 2, '#181818');
      px(x + 38, by + 7, 3, 2, '#181818');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'jairo': // Arriba beige/escarlata, abajo blanco, BALÓN
      px(x + 20, by + 60, 10, 8, '#2A2A2A');
      px(x + 34, by + 60, 10, 8, '#2A2A2A');
      px(x + 20, by + 50, 10, 6, SK.b);
      px(x + 34, by + 50, 10, 6, SK.b);
      px(x + 18, by + 42, 14, 10, '#E8E8E8');
      px(x + 32, by + 42, 14, 10, '#E8E8E8');
      px(x + 10, by + 20, 22, 22, '#D8C8A0');
      px(x + 32, by + 20, 22, 22, '#C83838');
      px(x + 14, by + 22, 16, 18, '#E0D0B0');
      px(x + 34, by + 22, 16, 18, '#D84848');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      // BALÓN grande
      px(x + 52, by + 28, 10, 10, '#E8E0D0');
      px(x + 54, by + 30, 6, 6, '#F0F0F0');
      px(x + 56, by + 32, 3, 3, '#282828');
      px(x + 54, by + 30, 2, 2, '#282828');
      px(x + 58, by + 36, 2, 2, '#282828');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A1818');
      px(x + 39, by + 8, 3, 3, '#2A1818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#C08868');
      break;

    default: // Entrenador genérico
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 42, 14, 20, '#3A3028');
      px(x + 32, by + 42, 14, 20, '#3A3028');
      px(x + 10, by + 20, 44, 24, '#4A6888');
      px(x + 14, by + 22, 36, 20, '#5A78A0');
      px(x + 18, by + 24, 28, 16, '#6A88B0');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 6, 16, 16, SK.b);
      px(x + 26, by + 8, 12, 12, SK.a);
      px(x + 16, by - 8, 32, 10, '#1A1A1A');
      px(x + 18, by - 10, 28, 6, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#283848');
      px(x + 39, by + 8, 3, 3, '#283848');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;
  } // fin switch
} // fin dTrainerBig

export { dTrainerBig };
