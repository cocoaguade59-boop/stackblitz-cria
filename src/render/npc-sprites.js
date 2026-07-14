// Sprites de NPCs del mapa (aldeas, castillo, torre, cueva).
//
// Una sola función `dNPC(x, y, id, f)` con un switch (id) que dibuja
// cada NPC pixel a pixel. Actualmente hay ~37 NPCs implementados.
//
// Para agregar un NPC nuevo: añadir un nuevo case al switch.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { SK } from './skin-colors.js';
import { dShadow } from './world-decor.js';
import { SPRITE_LOADER } from '../core/sprite-loader.js';
import { fr } from '../core/frame.js';
import { postGame } from '../core/game-flags.js';

function dNPC(x, y, id, f) {
  const bob = Math.sin(f * 0.1) * 1,
    by = y + bob;
  dShadow(x + 16, y + 31, 9, 3);

  switch (id) {
    // ==========================================
    // VILLA GUIÓN
    // ==========================================

    case 'alessandro': // PNG sprite de mapa si existe, si no pixel-art
      if (SPRITE_LOADER.has('npcs/alessandro')) {
        const prevSmoothing = cx.imageSmoothingEnabled;
        cx.imageSmoothingEnabled = false;
        const img = SPRITE_LOADER.get('npcs/alessandro');
        const targetH = 44;
        const ratio = img.naturalWidth / img.naturalHeight;
        const targetW = targetH * ratio;
        // Centrar horizontalmente en la casilla de 32px + leve ajuste a la derecha
        const ox = x + 16 - targetW / 2 + 2;
        cx.drawImage(img, ox, by + 30 - targetH, targetW, targetH);
        cx.imageSmoothingEnabled = prevSmoothing;
        break;
      }
      // Pixel-art fallback: Armadura parcial, arriba rojo abajo azul, pelo castaño
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      // Piernas azules
      px(x + 9, by + 22, 5, 5, '#2848A0');
      px(x + 18, by + 22, 5, 5, '#2848A0');
      px(x + 10, by + 23, 3, 3, '#3058B0');
      px(x + 19, by + 23, 3, 3, '#3058B0');
      // Torso rojo con armadura parcial
      px(x + 6, by + 11, 20, 10, '#B83030');
      px(x + 8, by + 12, 16, 8, '#C84040');
      px(x + 10, by + 13, 12, 6, '#D85050');
      // Piezas de armadura en hombros
      px(x + 4, by + 10, 4, 4, '#90A0B0');
      px(x + 24, by + 10, 4, 4, '#90A0B0');
      px(x + 5, by + 11, 2, 2, '#A8B8C8');
      px(x + 25, by + 11, 2, 2, '#A8B8C8');
      // Pechera parcial
      px(x + 12, by + 12, 8, 4, '#90A0B0');
      px(x + 14, by + 13, 4, 2, '#A8B8C8');
      // Cinturón
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 20, 4, 2, '#C8A830');
      // Brazos
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      // Guantelete derecho
      px(x + 25, by + 12, 4, 3, '#90A0B0');
      // Cuello
      px(x + 13, by + 9, 6, 3, SK.b);
      // Cabeza
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo CASTAÑO desordenado
      px(x + 8, by - 3, 16, 5, '#6A4A28');
      px(x + 7, by - 1, 3, 5, '#6A4A28');
      px(x + 22, by - 1, 3, 5, '#6A4A28');
      px(x + 9, by - 4, 14, 3, '#7A5A38');
      px(x + 9, by + 0, 5, 2, '#6A4A28'); // Mechón
      px(x + 12, by - 3, 3, 1, '#8A6A48'); // Brillo
      // Ojos
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A4818');
      px(x + 19, by + 5, 2, 2, '#2A4818');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'fabiana': // Vestido negro, pelo negro largo
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#1A1A1A');
      px(x + 8, by + 12, 16, 6, '#282828');
      px(x + 10, by + 13, 12, 4, '#383838');
      // Cuello blanco decorativo
      px(x + 11, by + 11, 10, 2, '#E8E8E8');
      px(x + 3, by + 12, 4, 7, SK.d);
      px(x + 25, by + 12, 4, 7, SK.d);
      px(x + 13, by + 9, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 10, 3, 6, '#101010');
      px(x + 24, by + 10, 3, 6, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828'); // Brillo
      // Ojos grandes
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#2860A0');
      px(x + 20, by + 4, 2, 3, '#2860A0');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#E08080');
      break;

    case 'nicole': // Harapos, pelo honguito, ojeras
      px(x + 9, by + 27, 5, 3, SK.e);
      px(x + 18, by + 27, 5, 3, SK.e);
      px(x + 10, by + 27, 3, 1, '#4A3A28');
      // Post-game: crucificada (DETRÁS del cuerpo)
      if (postGame) {
        px(x + 0, by - 8, 32, 3, '#5A3818'); // Horizontal
        px(x + 14, by - 12, 4, 44, '#5A3818'); // Vertical
        px(x + 1, by - 7, 30, 1, '#6A4828'); // Brillo madera
      }
      // Harapos
      px(x + 7, by + 18, 18, 10, '#5A4A38');
      px(x + 8, by + 19, 16, 8, '#6A5A48');
      // Bordes irregulares
      px(x + 7, by + 26, 3, 2, '#5A4A38');
      px(x + 22, by + 25, 3, 3, '#5A4A38');
      px(x + 9, by + 27, 2, 1, '#6A5A48');
      px(x + 20, by + 27, 2, 1, '#6A5A48');
      // Parte superior raída
      px(x + 6, by + 11, 20, 8, '#4A3A28');
      px(x + 8, by + 12, 16, 6, '#5A4A38');
      // Parches
      px(x + 10, by + 14, 4, 3, '#7A6A58');
      px(x + 18, by + 16, 3, 3, '#6A5A48');
      px(x + 4, by + 12, 4, 6, '#4A3A28');
      px(x + 24, by + 12, 4, 6, '#4A3A28');
      px(x + 5, by + 14, 2, 2, SK.e); // Piel por agujero
      // Cuerda cinturón
      px(x + 7, by + 17, 18, 1, '#8A7A60');
      // Cuello cabeza
      px(x + 13, by + 9, 6, 3, SK.e);
      px(x + 9, by + 0, 14, 10, SK.e);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO honguito
      px(x + 7, by - 3, 18, 6, '#1A1A1A');
      px(x + 6, by - 1, 20, 4, '#1A1A1A');
      px(x + 7, by + 2, 4, 2, '#1A1A1A');
      px(x + 21, by + 2, 4, 2, '#1A1A1A');
      px(x + 9, by + 1, 14, 2, '#282828'); // Flequillo recto
      // Ojos con ojeras
      px(x + 11, by + 4, 4, 3, '#fff');
      px(x + 18, by + 4, 4, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#381828');
      px(x + 20, by + 5, 2, 2, '#381828');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 20, by + 5, 1, 1, '#fff');
      px(x + 11, by + 7, 4, 1, '#C8A098');
      px(x + 18, by + 7, 4, 1, '#C8A098'); // Ojeras
      px(x + 11, by + 3, 3, 1, '#1A1A1A');
      px(x + 19, by + 3, 3, 1, '#1A1A1A'); // Cejas fruncidas
      px(x + 14, by + 8, 4, 1, '#986858');
      px(x + 10, by + 6, 2, 1, '#B09878'); // Suciedad
      break;

    case 'claudia': // Anteojos morados, arriba blanco abajo negro
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#E8E8E8');
      px(x + 8, by + 12, 16, 6, '#F0F0F0');
      px(x + 10, by + 13, 12, 4, '#F8F8F8');
      // Bordado
      px(x + 10, by + 12, 12, 1, '#D0D0D0');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo liso
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 16, '#1A1A1A');
      px(x + 22, by + 0, 4, 16, '#1A1A1A');
      px(x + 5, by + 12, 3, 6, '#101010');
      px(x + 24, by + 12, 3, 6, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828');
      // Anteojos MORADOS
      px(x + 10, by + 3, 5, 4, '#6030A0');
      px(x + 11, by + 4, 3, 2, '#C8A0E8');
      px(x + 17, by + 3, 5, 4, '#6030A0');
      px(x + 18, by + 4, 3, 2, '#C8A0E8');
      px(x + 15, by + 4, 2, 1, '#6030A0');
      px(x + 12, by + 5, 1, 1, '#2A1818');
      px(x + 19, by + 5, 1, 1, '#2A1818');
      // Pendientes
      px(x + 8, by + 5, 1, 2, '#C8A830');
      px(x + 23, by + 5, 1, 2, '#C8A830');
      px(x + 14, by + 8, 4, 1, '#E08888');
      break;

    case 'luas': // Curandero blanco, cruz roja, aureola
      px(x + 10, by + 27, 5, 3, '#A88050');
      px(x + 17, by + 27, 5, 3, '#A88050');
      px(x + 4, by + 10, 24, 18, '#E8E8E8');
      px(x + 6, by + 11, 20, 16, '#F0F0F0');
      // Cruz roja
      px(x + 14, by + 13, 4, 10, '#D02020');
      px(x + 11, by + 16, 10, 4, '#D02020');
      px(x + 3, by + 18, 3, 3, SK.a);
      px(x + 26, by + 18, 3, 3, SK.a);
      px(x + 13, by + 8, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Capucha
      px(x + 7, by - 2, 18, 5, '#E0E0E0');
      px(x + 6, by + 0, 3, 8, '#D8D8D8');
      px(x + 23, by + 0, 3, 8, '#D8D8D8');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#3868A8');
      px(x + 19, by + 4, 2, 2, '#3868A8');
      px(x + 14, by + 7, 4, 1, '#D0A088');
      // Aureola
      const ha = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = ha;
      px(x + 10, by - 5, 12, 2, '#F8E068');
      px(x + 9, by - 4, 14, 1, '#F8D030');
      cx.globalAlpha = 1;
      break;

    case 'davido': // Mercader delgado, anteojos, pelo negro corto, sonrisa
      px(x + 10, by + 26, 4, 4, '#4A2A10');
      px(x + 18, by + 26, 4, 4, '#4A2A10');
      // Piernas largas (más alto)
      px(x + 10, by + 18, 4, 9, '#2A2838');
      px(x + 18, by + 18, 4, 9, '#2A2838');
      px(x + 11, by + 19, 2, 7, '#3A3848');
      px(x + 19, by + 19, 2, 7, '#3A3848');
      // Torso delgado con túnica púrpura
      px(x + 7, by + 8, 18, 11, '#582890');
      px(x + 9, by + 9, 14, 9, '#6838A0');
      px(x + 11, by + 10, 10, 7, '#7848B0');
      // Bordes dorados
      px(x + 7, by + 8, 18, 1, '#C8A830');
      px(x + 7, by + 17, 18, 1, '#C8A830');
      // Bolsa de mercader
      px(x + 22, by + 12, 5, 5, '#8A6820');
      px(x + 23, by + 13, 3, 3, '#A88030');
      px(x + 24, by + 14, 1, 1, '#F8D030');
      // Brazos delgados
      px(x + 4, by + 10, 4, 7, SK.b);
      px(x + 24, by + 10, 4, 7, SK.b);
      px(x + 5, by + 11, 2, 5, SK.a);
      px(x + 25, by + 11, 2, 5, SK.a);
      // Cuello
      px(x + 13, by + 6, 6, 3, SK.b);
      // Cabeza
      px(x + 9, by - 4, 14, 11, SK.b);
      px(x + 10, by - 3, 12, 9, SK.a);
      // Pelo NEGRO corto bien peinado
      px(x + 8, by - 7, 16, 5, '#1A1A1A');
      px(x + 9, by - 8, 14, 3, '#282828');
      px(x + 7, by - 5, 3, 4, '#1A1A1A');
      px(x + 22, by - 5, 3, 4, '#1A1A1A');
      px(x + 12, by - 7, 3, 1, '#383838'); // Brillo
      // ANTEOJOS redondos
      px(x + 10, by - 1, 5, 4, '#1A1A1A');
      px(x + 11, by + 0, 3, 2, '#B8D0F0');
      px(x + 17, by - 1, 5, 4, '#1A1A1A');
      px(x + 18, by + 0, 3, 2, '#B8D0F0');
      px(x + 15, by + 0, 2, 1, '#1A1A1A');
      // Ojos detrás de anteojos
      px(x + 12, by + 1, 1, 1, '#181818');
      px(x + 19, by + 1, 1, 1, '#181818');
      // Sonrisa ligera
      px(x + 13, by + 4, 6, 1, '#C08868');
      px(x + 14, by + 5, 4, 1, '#D09878');
      // Mejillas
      px(x + 10, by + 2, 2, 2, '#E8B898');
      px(x + 21, by + 2, 2, 2, '#E8B898');
      break;

    // ==========================================
    // ALDEA ESCENA
    // ==========================================

    case 'roberto': // Pelo castaño ondulado, tez oscura, arriba beige abajo naranja
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 20, 5, 7, '#D07020');
      px(x + 18, by + 20, 5, 7, '#D07020');
      px(x + 10, by + 21, 3, 5, '#E08030');
      px(x + 19, by + 21, 3, 5, '#E08030');
      px(x + 6, by + 10, 20, 11, '#D8C8A0');
      px(x + 8, by + 11, 16, 9, '#E0D0B0');
      px(x + 10, by + 12, 12, 7, '#E8D8B8');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 7, SK.c);
      px(x + 24, by + 12, 4, 7, SK.c);
      px(x + 13, by + 8, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.b);
      // Pelo NEGRO ondulado
      px(x + 8, by - 3, 16, 5, '#141210');
      px(x + 7, by - 1, 3, 5, '#141210');
      px(x + 22, by - 1, 3, 5, '#141210');
      px(x + 9, by - 4, 4, 2, '#2C2620');
      px(x + 16, by - 4, 4, 2, '#2C2620'); // Ondas
      px(x + 7, by + 2, 2, 2, '#2C2620');
      px(x + 23, by + 2, 2, 2, '#2C2620');
      px(x + 12, by - 3, 3, 1, '#3A322C');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#241208');
      px(x + 19, by + 5, 2, 2, '#241208');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#B08060');
      px(x + 14, by + 9, 4, 1, '#B08060');
      break;

    case 'brisa': // Pelo castaño suelto, arriba blanco/negro abajo azul grisáceo
      px(x + 10, by + 26, 4, 4, '#5A3818');
      px(x + 18, by + 26, 4, 4, '#5A3818');
      px(x + 8, by + 18, 16, 9, '#708898');
      px(x + 7, by + 20, 18, 7, '#8098A8');
      px(x + 6, by + 11, 20, 8, '#E8E8E8');
      px(x + 8, by + 12, 16, 6, '#1A1A1A');
      px(x + 10, by + 13, 12, 4, '#282828');
      // Delantal
      px(x + 9, by + 13, 14, 10, '#F0F0F0');
      px(x + 10, by + 14, 12, 8, '#F8F8F8');
      px(x + 14, by + 16, 4, 3, '#D06070');
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo CASTAÑO suelto (largo, enmarca el rostro)
      px(x + 6, by - 2, 20, 7, '#6A4A28');
      px(x + 5, by + 1, 4, 12, '#6A4A28');
      px(x + 23, by + 1, 4, 12, '#6A4A28');
      px(x + 7, by - 3, 18, 3, '#7A5A38');
      px(x + 6, by + 11, 3, 3, '#5A3A20');
      px(x + 23, by + 11, 3, 3, '#5A3A20');
      px(x + 12, by - 4, 4, 3, '#7A5A38');
      px(x + 17, by - 4, 4, 3, '#7A5A38');
      // Mejillas rosadas
      px(x + 10, by + 6, 2, 2, '#F0A0A0');
      px(x + 21, by + 6, 2, 2, '#F0A0A0');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#4A3018');
      px(x + 19, by + 4, 2, 2, '#4A3018');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D09080');
      break;

    case 'paulo': // Sin anteojos, arriba marrón abajo verde, libro
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#388038');
      px(x + 18, by + 22, 5, 5, '#388038');
      px(x + 10, by + 23, 3, 3, '#409040');
      px(x + 19, by + 23, 3, 3, '#409040');
      px(x + 6, by + 11, 20, 10, '#785838');
      px(x + 8, by + 12, 16, 8, '#886848');
      px(x + 10, by + 13, 12, 6, '#987858');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      // Libro
      px(x + 25, by + 16, 5, 6, '#8A2020');
      px(x + 26, by + 17, 3, 4, '#F0F0F0');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO corto peinado
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by - 2, 3, 1, '#383838');
      // Ojos SIN anteojos
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#283848');
      px(x + 19, by + 5, 2, 2, '#283848');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'tamara': // Pelo negro largo rizado, traje artista medieval
      px(x + 10, by + 26, 4, 4, '#7A5A38');
      px(x + 18, by + 26, 4, 4, '#7A5A38');
      px(x + 8, by + 18, 16, 9, '#604878');
      px(x + 7, by + 20, 18, 7, '#685080');
      px(x + 6, by + 11, 20, 8, '#705888');
      px(x + 8, by + 12, 16, 6, '#806898');
      px(x + 10, by + 13, 12, 4, '#9078A8');
      // Manchas de pintura
      px(x + 9, by + 14, 3, 2, '#D03030');
      px(x + 20, by + 16, 2, 2, '#3090D0');
      px(x + 12, by + 22, 2, 2, '#E8C020');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      // Pincel
      px(x + 26, by + 14, 2, 10, '#B89060');
      px(x + 26, by + 12, 2, 3, '#D03030');
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo RIZADO
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 10, 3, 6, '#101010');
      px(x + 24, by + 10, 3, 6, '#101010');
      // Rizos (zigzag en los costados)
      px(x + 5, by + 4, 2, 2, '#282828');
      px(x + 6, by + 7, 2, 2, '#282828');
      px(x + 5, by + 10, 2, 2, '#282828');
      px(x + 25, by + 4, 2, 2, '#282828');
      px(x + 24, by + 7, 2, 2, '#282828');
      px(x + 25, by + 10, 2, 2, '#282828');
      // Boina
      px(x + 8, by - 5, 16, 5, '#483060');
      px(x + 10, by - 6, 12, 3, '#584070');
      px(x + 14, by - 7, 4, 2, '#584070');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#4A2838');
      px(x + 19, by + 4, 2, 2, '#4A2838');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#E08888');
      break;
    // ==========================================
    // PUERTO LENTE
    // ==========================================

    case 'nahuel': // Arriba negro, abajo shorts, pelo negro corto
      px(x + 9, by + 26, 5, 4, '#8A6840');
      px(x + 18, by + 26, 5, 4, '#8A6840');
      px(x + 9, by + 22, 5, 3, SK.b);
      px(x + 18, by + 22, 5, 3, SK.b); // Piernas
      px(x + 9, by + 20, 5, 3, '#1A1A1A');
      px(x + 18, by + 20, 5, 3, '#1A1A1A'); // Shorts
      px(x + 6, by + 11, 20, 10, '#1A1A1A');
      px(x + 8, by + 12, 16, 8, '#282828');
      px(x + 10, by + 13, 12, 6, '#383838');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A1818');
      px(x + 19, by + 5, 2, 2, '#2A1818');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 12, by + 8, 8, 1, '#C08868');
      px(x + 13, by + 9, 6, 1, '#C08868'); // Gran sonrisa
      break;

    case 'pachi': // Traje teatral medieval, capa morada
      px(x + 9, by + 26, 5, 4, '#4A2A10');
      px(x + 18, by + 26, 5, 4, '#4A2A10');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 6, by + 11, 20, 10, '#3A2848');
      px(x + 8, by + 12, 16, 8, '#4A3858');
      px(x + 10, by + 13, 12, 6, '#5A4868');
      // Detalles teatrales dorados
      px(x + 10, by + 12, 12, 1, '#C8A830');
      px(x + 10, by + 18, 12, 1, '#C8A830');
      // Capa dramática
      px(x + 2, by + 8, 4, 18, '#6830A0');
      px(x + 26, by + 8, 4, 18, '#6830A0');
      px(x + 3, by + 9, 2, 16, '#7840B0');
      px(x + 27, by + 9, 2, 16, '#7840B0');
      // Pañuelo rojo
      px(x + 12, by + 10, 8, 3, '#C83030');
      px(x + 13, by + 12, 6, 2, '#D84040');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO ondulado
      px(x + 7, by - 3, 18, 5, '#1A1A1A');
      px(x + 6, by - 1, 4, 7, '#1A1A1A');
      px(x + 22, by - 1, 4, 7, '#1A1A1A');
      px(x + 8, by - 4, 5, 3, '#282828');
      px(x + 18, by - 4, 5, 3, '#282828'); // Ondas
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#382818');
      px(x + 19, by + 4, 2, 2, '#382818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'gabriela': // Arriba magenta, abajo negro, pelo negro ondulado con flores
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#C83888');
      px(x + 8, by + 12, 16, 6, '#D84898');
      px(x + 10, by + 13, 12, 4, '#E858A8');
      px(x + 3, by + 12, 4, 7, SK.c);
      px(x + 25, by + 12, 4, 7, SK.c);
      px(x + 13, by + 9, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.c);
      // Pelo NEGRO ONDULADO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 16, '#1A1A1A');
      px(x + 22, by + 0, 4, 16, '#1A1A1A');
      px(x + 5, by + 8, 3, 8, '#101010');
      px(x + 24, by + 8, 3, 8, '#101010');
      // Ondulaciones
      px(x + 5, by + 10, 2, 2, '#282828');
      px(x + 25, by + 10, 2, 2, '#282828');
      px(x + 5, by + 14, 2, 2, '#282828');
      px(x + 25, by + 14, 2, 2, '#282828');
      // Flores en pelo
      px(x + 8, by - 1, 2, 2, '#F088A0');
      px(x + 22, by - 1, 2, 2, '#88B8F0');
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#6A4028');
      px(x + 20, by + 4, 2, 3, '#6A4028');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#B08060');
      // Post-game: armadura dorada
      if (postGame) {
        px(x + 6, by + 11, 20, 8, '#90A0B0');
        px(x + 8, by + 12, 16, 6, '#A0B0C0');
        px(x + 12, by + 13, 8, 4, '#C8A830');
      }
      break;

    case 'hernan': // Todo negro, barba corta (sin barba post-game)
      px(x + 9, by + 24, 5, 6, '#1A1A1A');
      px(x + 18, by + 24, 5, 6, '#1A1A1A');
      px(x + 9, by + 20, 5, 5, '#1A1A1A');
      px(x + 18, by + 20, 5, 5, '#1A1A1A');
      px(x + 6, by + 10, 20, 11, '#1A1A1A');
      px(x + 8, by + 11, 16, 9, '#282828');
      px(x + 10, by + 12, 12, 7, '#383838');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 14, by + 19, 4, 2, '#C8A830');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // Barba corta (solo pre-game)
      if (!postGame) {
        px(x + 11, by + 8, 10, 2, '#282828');
        px(x + 12, by + 9, 8, 1, '#383838');
      }
      // Ojos melancólicos (pre) o alegres (post)
      px(x + 12, by + 3, 3, 4, '#fff');
      px(x + 18, by + 3, 3, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#282020');
      px(x + 19, by + 4, 2, 3, '#282020');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      if (!postGame) {
        px(x + 12, by + 2, 3, 1, '#1A1A1A');
        px(x + 18, by + 2, 3, 1, '#1A1A1A'); // Cejas bajas
      }
      px(x + 14, by + 10, 4, 1, '#C08868');
      break;

    // ==========================================
    // FUERTE TELÓN (72,4)
    // ==========================================

    case 'angelly': // Pelo negro suelto, tez clara, amarillo y verde
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 8, by + 18, 16, 9, '#38A048');
      px(x + 7, by + 20, 18, 7, '#48B058');
      px(x + 6, by + 11, 20, 8, '#E8C830');
      px(x + 8, by + 12, 16, 6, '#F0D840');
      px(x + 10, by + 13, 12, 4, '#F8E050');
      px(x + 7, by + 17, 18, 2, '#8A7850');
      px(x + 3, by + 12, 4, 6, SK.d);
      px(x + 25, by + 12, 4, 6, SK.d);
      px(x + 13, by + 9, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO SUELTO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 8, 3, 8, '#101010');
      px(x + 24, by + 8, 3, 8, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828');
      // Ojos alegres
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A1818');
      px(x + 20, by + 4, 2, 2, '#2A1818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 12, by + 8, 8, 2, '#C08868');
      px(x + 14, by + 8, 4, 1, '#F8F8F8'); // Sonrisa con diente
      break;

    case 'dayana': // Suéter lavanda, pelo negro con mechón azul
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 8, by + 18, 16, 9, '#9880B0');
      px(x + 7, by + 20, 18, 7, '#A890C0');
      px(x + 4, by + 11, 24, 8, '#A890C0');
      px(x + 6, by + 12, 20, 6, '#B8A0D0');
      px(x + 8, by + 13, 16, 4, '#C8B0E0');
      px(x + 10, by + 9, 12, 3, '#A890C0'); // Cuello alto
      px(x + 2, by + 12, 5, 8, '#A890C0');
      px(x + 25, by + 12, 5, 8, '#A890C0');
      px(x + 1, by + 18, 5, 3, '#B8A0D0');
      px(x + 26, by + 18, 5, 3, '#B8A0D0'); // Mangas largas
      px(x + 13, by + 8, 6, 2, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO largo con mechón azul
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 6, by + 2, 3, 6, '#3070C0'); // Mechón azul
      px(x + 8, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#201010');
      px(x + 19, by + 4, 2, 2, '#201010');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'deyna': // Chaqueta cuero azul, pelo negro corto mechón rosa, pulsera arcoíris
      px(x + 10, by + 26, 4, 4, '#5A3A1A');
      px(x + 18, by + 26, 4, 4, '#5A3A1A');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 5, by + 11, 22, 10, '#4870A0');
      px(x + 7, by + 12, 18, 8, '#5880B0');
      px(x + 9, by + 13, 14, 6, '#6890C0');
      px(x + 15, by + 14, 2, 2, '#C8C8C8');
      px(x + 15, by + 18, 2, 2, '#C8C8C8'); // Botones
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      // Pulsera arcoíris
      px(x + 3, by + 18, 4, 1, '#D02020');
      px(x + 3, by + 19, 4, 1, '#E8C020');
      px(x + 3, by + 20, 4, 1, '#20A020');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO corto mechón rosa
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      px(x + 8, by - 3, 6, 3, '#D060A0'); // Mechón rosa
      // Piercings oreja
      px(x + 7, by + 4, 1, 1, '#C8C8C8');
      px(x + 7, by + 6, 1, 1, '#E8C020');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A2020');
      px(x + 19, by + 4, 2, 2, '#2A2020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'andre': // Máscara hierro, SIN CAMISA, torso descubierto
      px(x + 9, by + 26, 5, 4, '#484848');
      px(x + 18, by + 26, 5, 4, '#484848');
      px(x + 9, by + 22, 5, 5, '#404040');
      px(x + 18, by + 22, 5, 5, '#404040');
      // Torso descubierto
      px(x + 6, by + 11, 20, 10, SK.a);
      px(x + 8, by + 12, 16, 8, SK.b);
      // Músculos sugeridos
      px(x + 10, by + 13, 4, 4, '#D8B090');
      px(x + 18, by + 13, 4, 4, '#D8B090');
      px(x + 13, by + 17, 6, 2, '#D0A880');
      // Capa corta
      px(x + 3, by + 11, 4, 10, '#404048');
      px(x + 25, by + 11, 4, 10, '#404048');
      px(x + 4, by + 12, 4, 8, SK.a);
      px(x + 24, by + 12, 4, 8, SK.a);
      px(x + 13, by + 9, 6, 3, '#808898');
      // MÁSCARA DE HIERRO
      px(x + 9, by + 0, 14, 11, '#788090');
      px(x + 10, by + 1, 12, 9, '#8890A0');
      px(x + 11, by + 2, 10, 7, '#90A0B0');
      px(x + 12, by + 4, 3, 2, '#282828');
      px(x + 18, by + 4, 3, 2, '#282828'); // Rendijas ojos
      px(x + 14, by + 7, 4, 1, '#484848'); // Rendija boca
      // Remaches dorados
      px(x + 10, by + 2, 1, 1, '#E8C830');
      px(x + 21, by + 2, 1, 1, '#E8C830');
      px(x + 10, by + 8, 1, 1, '#E8C830');
      px(x + 21, by + 8, 1, 1, '#E8C830');
      // Pelo NEGRO asomando
      px(x + 8, by - 1, 16, 2, '#1A1A1A');
      break;

    // ==========================================
    // NPCs EXTERIORES
    // ==========================================

    case 'alejandro': // Si hay sprite PNG lo usa, si no dibuja pixel-art viejo
      if (SPRITE_LOADER.has('npcs/alejandro')) {
        // Escalado nítido pixel-art
        const prevSmoothing = cx.imageSmoothingEnabled;
        cx.imageSmoothingEnabled = false;
        const img = SPRITE_LOADER.get('npcs/alejandro');
        // El sprite mide ~104x205. Lo dibujamos a ~32x40 (tamaño NPC del mapa)
        // manteniendo aspect ratio (más alto que ancho).
        const targetH = 40;
        const ratio = img.naturalWidth / img.naturalHeight; // ~0.51
        const targetW = targetH * ratio;                     // ~20
        // Centrar horizontalmente sobre la casilla estándar (32 px de ancho)
        // y anclar los pies al piso del tile (y+30 aprox)
        const drawX = x + 16 - targetW / 2;
        const drawY = by - 6;
        cx.drawImage(img, drawX, drawY, targetW, targetH);
        cx.imageSmoothingEnabled = prevSmoothing;
      } else {
        // Fallback pixel-art (mientras el PNG no está o carga)
        px(x + 8, by + 24, 6, 6, '#5A3A18');
        px(x + 18, by + 24, 6, 6, '#5A3A18');
        px(x + 9, by + 20, 5, 5, '#708898');
        px(x + 18, by + 20, 5, 5, '#708898');
        px(x + 6, by + 11, 20, 10, '#1A1A1A');
        px(x + 8, by + 12, 16, 8, '#282828');
        px(x + 10, by + 12, 12, 8, '#383838'); // Interior chaleco
        px(x + 4, by + 12, 4, 8, SK.b);
        px(x + 24, by + 12, 4, 8, SK.b);
        px(x + 13, by + 9, 6, 3, SK.b);
        px(x + 9, by + 0, 14, 10, SK.b);
        px(x + 10, by + 1, 12, 8, SK.a);
        // Pelo NEGRO LARGO (único hombre)
        px(x + 7, by - 2, 18, 4, '#1A1A1A');
        px(x + 6, by + 0, 4, 16, '#1A1A1A');
        px(x + 22, by + 0, 4, 16, '#1A1A1A');
        px(x + 5, by + 10, 3, 8, '#101010');
        px(x + 24, by + 10, 3, 8, '#101010');
        // Bandana roja
        px(x + 7, by - 1, 18, 3, '#C83030');
        px(x + 5, by + 0, 3, 2, '#C83030');
        px(x + 24, by + 0, 3, 2, '#C83030');
        px(x + 4, by + 1, 3, 5, '#C83030'); // Cola bandana
        px(x + 12, by + 3, 3, 3, '#fff');
        px(x + 18, by + 3, 3, 3, '#fff');
        px(x + 13, by + 4, 2, 2, '#181818');
        px(x + 19, by + 4, 2, 2, '#181818');
        px(x + 13, by + 4, 1, 1, '#fff');
        px(x + 19, by + 4, 1, 1, '#fff');
        px(x + 14, by + 8, 4, 1, '#C08868');
      }
      break;

    case 'luis': // Arriba gris/azul, abajo negro, bastón
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 4, by + 10, 24, 18, '#607088');
      px(x + 6, by + 11, 20, 16, '#708098');
      px(x + 8, by + 12, 16, 14, '#8090A8');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 19, 4, 3, '#C8A830');
      px(x + 3, by + 12, 3, 7, SK.b);
      px(x + 26, by + 12, 3, 7, SK.b);
      px(x + 28, by + 8, 2, 22, '#6A4828');
      px(x + 27, by + 6, 4, 3, '#A88848'); // Bastón
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 6, '#1A1A1A');
      px(x + 22, by + 0, 3, 6, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#384858');
      px(x + 19, by + 4, 2, 2, '#384858');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'alexandro': // Arriba crema, abajo verde, sombrero de paja, pecas
      px(x + 9, by + 26, 5, 4, '#6A4828');
      px(x + 18, by + 26, 5, 4, '#6A4828');
      px(x + 8, by + 14, 16, 14, '#388038');
      px(x + 9, by + 15, 14, 12, '#409040');
      px(x + 10, by + 11, 3, 4, '#388038');
      px(x + 19, by + 11, 3, 4, '#388038'); // Tirantes
      px(x + 6, by + 11, 20, 4, '#D8C8A0');
      px(x + 8, by + 12, 16, 2, '#E0D0B0');
      px(x + 4, by + 12, 4, 7, SK.c);
      px(x + 24, by + 12, 4, 7, SK.c);
      px(x + 11, by + 6, 1, 1, '#A06A45');
      px(x + 14, by + 7, 1, 1, '#A06A45');
      px(x + 21, by + 6, 1, 1, '#A06A45'); // Pecas
      px(x + 13, by + 9, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.c);
      // Sombrero de paja
      px(x + 5, by - 3, 22, 4, '#E0C060');
      px(x + 7, by - 5, 18, 4, '#E8C870');
      px(x + 9, by - 6, 14, 2, '#F0D080');
      px(x + 12, by - 4, 8, 2, '#C83030'); // Cinta roja
      px(x + 8, by + 0, 16, 2, '#1A1A1A');
      px(x + 7, by + 1, 3, 3, '#1A1A1A');
      px(x + 22, by + 1, 3, 3, '#1A1A1A');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A6020');
      px(x + 19, by + 4, 2, 2, '#2A6020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#B08060');
      break;

    case 'gonchi': // Anteojos, arriba gris abajo azul grisáceo, mochila, capucha
      px(x + 9, by + 26, 5, 4, '#5A3A1A');
      px(x + 18, by + 26, 5, 4, '#5A3A1A');
      px(x + 9, by + 22, 5, 5, '#708898');
      px(x + 18, by + 22, 5, 5, '#708898');
      px(x + 6, by + 11, 20, 10, '#787888');
      px(x + 8, by + 12, 16, 8, '#8888A0');
      px(x + 10, by + 13, 12, 6, '#9898B0');
      px(x + 8, by + 9, 16, 3, '#787888');
      px(x + 7, by + 10, 4, 2, '#787888');
      px(x + 21, by + 10, 4, 2, '#787888'); // Capucha
      px(x + 2, by + 12, 4, 10, '#6A4A28');
      px(x + 3, by + 13, 2, 8, '#7A5A38'); // Mochila
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 3, 16, 5, '#484858');
      px(x + 9, by - 4, 14, 3, '#585868'); // Gorro
      px(x + 8, by + 0, 16, 2, '#1A1A1A');
      // ANTEOJOS
      px(x + 10, by + 3, 5, 4, '#1A1A1A');
      px(x + 11, by + 4, 3, 2, '#B8D0F0');
      px(x + 17, by + 3, 5, 4, '#1A1A1A');
      px(x + 18, by + 4, 3, 2, '#B8D0F0');
      px(x + 15, by + 4, 2, 1, '#1A1A1A');
      px(x + 12, by + 5, 1, 1, '#181818');
      px(x + 19, by + 5, 1, 1, '#181818');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'jairo': // Arriba beige/escarlata, abajo blanco, BALÓN DE SOCCER
      px(x + 9, by + 26, 5, 4, '#2A2A2A');
      px(x + 18, by + 26, 5, 4, '#2A2A2A');
      px(x + 9, by + 20, 5, 7, '#E8E8E8');
      px(x + 18, by + 20, 5, 7, '#E8E8E8');
      px(x + 9, by + 24, 5, 3, SK.b);
      px(x + 18, by + 24, 5, 3, SK.b); // Piernas
      px(x + 6, by + 11, 10, 10, '#D8C8A0');
      px(x + 16, by + 11, 10, 10, '#C83838');
      px(x + 8, by + 12, 8, 8, '#E0D0B0');
      px(x + 18, by + 12, 8, 8, '#D84848');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      // BALÓN (único)
      px(x + 26, by + 15, 6, 6, '#E8E0D0');
      px(x + 27, by + 16, 4, 4, '#F0F0F0');
      px(x + 28, by + 17, 2, 2, '#282828');
      px(x + 27, by + 16, 1, 1, '#282828');
      px(x + 30, by + 19, 1, 1, '#282828');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A1818');
      px(x + 19, by + 4, 2, 2, '#2A1818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'dante': // Pelo negro rizado, arriba verde abajo negro, gabardina
      px(x + 9, by + 26, 5, 4, '#1A1A1A');
      px(x + 18, by + 26, 5, 4, '#1A1A1A');
      px(x + 4, by + 10, 24, 18, '#1A1A1A');
      px(x + 6, by + 11, 20, 16, '#2A3A28');
      px(x + 8, by + 12, 16, 14, '#3A4A38');
      px(x + 10, by + 9, 12, 3, '#1A1A1A'); // Cuello alto
      px(x + 3, by + 12, 3, 8, SK.b);
      px(x + 26, by + 12, 3, 8, SK.b);
      px(x + 13, by + 8, 6, 2, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO RIZADO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // Rizos (pequeños bucles)
      px(x + 8, by - 3, 2, 2, '#282828');
      px(x + 13, by - 4, 2, 2, '#282828');
      px(x + 19, by - 3, 2, 2, '#282828');
      px(x + 7, by + 1, 2, 2, '#282828');
      px(x + 23, by + 1, 2, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#681818');
      px(x + 19, by + 4, 2, 2, '#681818'); // Ojos rojizos
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#A88070');
      break;

    case 'dan': // Arriba verde, abajo escarlata
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#C83838');
      px(x + 18, by + 22, 5, 5, '#C83838');
      px(x + 10, by + 23, 3, 3, '#D84848');
      px(x + 19, by + 23, 3, 3, '#D84848');
      px(x + 6, by + 11, 20, 10, '#2A6830');
      px(x + 8, by + 12, 16, 8, '#307038');
      px(x + 10, by + 13, 12, 6, '#387840');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      // Ojos pensativos
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 3, 2, 2, '#3A2828');
      px(x + 19, by + 3, 2, 2, '#3A2828'); // Mirando arriba
      px(x + 13, by + 3, 1, 1, '#fff');
      px(x + 19, by + 3, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'luchito': // Camisa gris oscuro, abajo negro, rosa, MÁS DELGADO
      px(x + 10, by + 26, 4, 4, '#1A1A1A');
      px(x + 19, by + 26, 4, 4, '#1A1A1A');
      px(x + 10, by + 22, 4, 5, '#1A1A1A');
      px(x + 19, by + 22, 4, 5, '#1A1A1A'); // Más delgado
      px(x + 7, by + 11, 18, 10, '#484858');
      px(x + 9, by + 12, 14, 8, '#585868');
      px(x + 11, by + 13, 10, 6, '#686878');
      // Camisa interior
      px(x + 11, by + 12, 10, 6, '#F0F0F0');
      // Corbatín
      px(x + 14, by + 11, 4, 2, '#181818');
      px(x + 15, by + 10, 2, 1, '#181818');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      // Rosa
      px(x + 26, by + 14, 3, 3, '#D83838');
      px(x + 27, by + 16, 1, 6, '#308028');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo elegante
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by - 1, 3, 3, '#1A1A1A');
      px(x + 8, by - 3, 5, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#3A2020');
      px(x + 19, by + 4, 2, 2, '#3A2020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#C08868');
      px(x + 14, by + 9, 4, 1, '#C08868');
      break;

    case 'ximena': // Sombrero catrina, escote, color vino y negro, pelo ondulado
      px(x + 10, by + 26, 4, 4, '#4A1828');
      px(x + 18, by + 26, 4, 4, '#4A1828');
      px(x + 7, by + 16, 18, 11, '#1A1A1A');
      px(x + 6, by + 18, 20, 9, '#282828');
      // Parte superior vino con ESCOTE
      px(x + 6, by + 11, 20, 6, '#882838');
      px(x + 8, by + 12, 16, 4, '#983848');
      px(x + 12, by + 11, 8, 3, SK.a); // Escote V
      px(x + 14, by + 12, 4, 2, SK.b);
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO ONDULADO
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 12, '#1A1A1A');
      px(x + 22, by + 0, 4, 12, '#1A1A1A');
      px(x + 6, by + 4, 2, 2, '#282828');
      px(x + 24, by + 4, 2, 2, '#282828'); // Ondas
      px(x + 6, by + 8, 2, 2, '#282828');
      px(x + 24, by + 8, 2, 2, '#282828');
      // SOMBRERO GRANDE estilo catrina con flores
      px(x + 2, by - 6, 28, 4, '#882838');
      px(x + 4, by - 8, 24, 4, '#983848');
      px(x + 8, by - 9, 16, 3, '#A84858');
      // Flores en sombrero
      px(x + 6, by - 8, 3, 3, '#F088A0');
      px(x + 14, by - 9, 3, 3, '#E8C830');
      px(x + 22, by - 8, 3, 3, '#F088A0');
      px(x + 10, by - 7, 2, 2, '#F8F8F8');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 3, '#2A2020');
      px(x + 19, by + 4, 2, 3, '#2A2020'); // Mirando a un lado
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'andrea': // Profesora medieval, lentes, pelo recogido con lápiz
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 7, by + 18, 18, 9, '#2858A0');
      px(x + 6, by + 20, 20, 7, '#3868B0');
      px(x + 5, by + 11, 22, 8, '#E8E8E8');
      px(x + 7, by + 12, 18, 6, '#F0F0F0');
      px(x + 8, by + 11, 16, 6, '#2858A0');
      px(x + 12, by + 11, 8, 6, '#F0F0F0');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 26, by + 14, 4, 6, '#3868A8');
      px(x + 27, by + 15, 2, 4, '#F0F0F0'); // Libro
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO recogido
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      px(x + 14, by - 4, 6, 4, '#1A1A1A'); // Moño
      px(x + 20, by - 4, 2, 6, '#E8C830');
      px(x + 20, by - 5, 2, 2, '#D03030'); // Lápiz
      // Lentes rectangulares
      px(x + 10, by + 3, 5, 3, '#404040');
      px(x + 11, by + 4, 3, 1, '#B8D0F0');
      px(x + 17, by + 3, 5, 3, '#404040');
      px(x + 18, by + 4, 3, 1, '#B8D0F0');
      px(x + 15, by + 4, 2, 1, '#404040');
      px(x + 12, by + 4, 1, 1, '#2A1818');
      px(x + 19, by + 4, 1, 1, '#2A1818');
      px(x + 14, by + 7, 4, 1, '#D0A088');
      break;

    case 'oscar': // Explorador maduro, delgado, estatura promedio
      px(x + 10, by + 26, 4, 4, '#5A3A1A');
      px(x + 18, by + 26, 4, 4, '#5A3A1A');
      px(x + 10, by + 21, 4, 6, '#6A7880');
      px(x + 18, by + 21, 4, 6, '#6A7880');
      px(x + 7, by + 10, 18, 12, '#8A6A40');
      px(x + 9, by + 11, 14, 10, '#A08050');
      px(x + 11, by + 12, 10, 8, '#B89060');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 26, by + 8, 2, 22, '#6A4828'); // bastón de explorador
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 4, 16, 5, '#7A5A30');
      px(x + 6, by - 2, 20, 3, '#A08040'); // sombrero ala
      px(x + 10, by - 5, 12, 3, '#907038');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#302010');
      px(x + 19, by + 5, 2, 2, '#302010');
      px(x + 14, by + 8, 4, 1, '#B08060');
      break;

    case 'piero': // Explorador con cabello rubio teñido por apuesta
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 21, 5, 6, '#4A5F70');
      px(x + 18, by + 21, 5, 6, '#4A5F70');
      px(x + 5, by + 10, 22, 12, '#406850');
      px(x + 7, by + 11, 18, 10, '#508060');
      px(x + 9, by + 12, 14, 8, '#68A070');
      px(x + 3, by + 12, 4, 8, SK.b);
      px(x + 25, by + 12, 4, 8, SK.b);
      px(x + 22, by + 13, 5, 8, '#7A5A38'); // morral
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 7, by - 3, 18, 6, '#E8D050');
      px(x + 8, by - 4, 16, 3, '#F8E870');
      px(x + 7, by + 1, 4, 4, '#D8B840');
      px(x + 21, by + 1, 4, 4, '#D8B840');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A1810');
      px(x + 19, by + 5, 2, 2, '#2A1810');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'chrys': // Productora, cabello negro largo, blanco arriba azul abajo
      px(x + 10, by + 26, 4, 4, '#3A2A18');
      px(x + 18, by + 26, 4, 4, '#3A2A18');
      px(x + 8, by + 18, 16, 9, '#2858A0');
      px(x + 7, by + 20, 18, 7, '#3868B0');
      px(x + 5, by + 10, 22, 9, '#E8E8E8');
      px(x + 7, by + 11, 18, 7, '#FFFFFF');
      px(x + 10, by + 12, 12, 5, '#F8F8F8');
      px(x + 3, by + 12, 4, 8, SK.a);
      px(x + 25, by + 12, 4, 8, SK.a);
      px(x + 24, by + 10, 5, 7, '#6A4A28'); // libreta de producción
      px(x + 25, by + 11, 3, 5, '#F0E0A0');
      px(x + 13, by + 8, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      px(x + 7, by - 2, 18, 5, '#111');
      px(x + 6, by + 1, 4, 15, '#111');
      px(x + 22, by + 1, 4, 15, '#111');
      px(x + 5, by + 12, 3, 8, '#080808');
      px(x + 24, by + 12, 3, 8, '#080808');
      px(x + 8, by - 3, 16, 2, '#282828');
      px(x + 11, by + 4, 4, 4, '#fff');
      px(x + 18, by + 4, 4, 4, '#fff');
      px(x + 13, by + 5, 2, 2, '#201010');
      px(x + 20, by + 5, 2, 2, '#201010');
      px(x + 13, by + 8, 6, 2, '#E08888');
      break;

    // ==========================================
    // CUEVA
    // ==========================================

    case 'salogon': // Vidente gris con capucha
      px(x + 10, by + 27, 5, 3, '#3A3A42');
      px(x + 18, by + 27, 5, 3, '#3A3A42');
      px(x + 5, by + 11, 22, 17, '#555965');
      px(x + 7, by + 12, 18, 15, '#666A76');
      px(x + 9, by + 14, 14, 12, '#4A4D58');
      px(x + 4, by + 13, 4, 10, '#4D515C');
      px(x + 24, by + 13, 4, 10, '#4D515C');
      px(x + 13, by + 8, 6, 4, '#B8A090');
      px(x + 8, by - 2, 16, 13, '#3F424C');
      px(x + 6, by + 0, 20, 7, '#565A66');
      px(x + 9, by + 3, 14, 8, '#2A2C34');
      px(x + 12, by + 5, 2, 2, '#C8D8F8');
      px(x + 19, by + 5, 2, 2, '#C8D8F8');
      px(x + 15, by + 8, 3, 1, '#8A7070');
      // Orbe del vidente
      px(x + 25, by + 18, 5, 5, '#90A0D8');
      px(x + 26, by + 19, 3, 3, '#C8D8FF');
      break;

    case 'oloman': // Mohawk rojo, chaqueta cuero, estoperoles, piercings
      px(x + 8, by + 24, 6, 6, '#181818');
      px(x + 18, by + 24, 6, 6, '#181818');
      px(x + 9, by + 25, 1, 1, '#C8C8C8');
      px(x + 19, by + 25, 1, 1, '#C8C8C8'); // Hebillas
      px(x + 9, by + 22, 5, 3, '#101010');
      px(x + 18, by + 22, 5, 3, '#101010');
      px(x + 5, by + 10, 22, 12, '#282828');
      px(x + 7, by + 11, 18, 10, '#383838');
      px(x + 5, by + 11, 2, 2, '#C8C8C8');
      px(x + 25, by + 11, 2, 2, '#C8C8C8'); // Estoperoles
      px(x + 7, by + 10, 2, 2, '#C8C8C8');
      px(x + 23, by + 10, 2, 2, '#C8C8C8');
      px(x + 10, by + 14, 12, 5, '#F0F0F0');
      px(x + 11, by + 15, 10, 3, '#D03030'); // Parche
      px(x + 5, by + 20, 3, 2, '#A8A8A8');
      px(x + 7, by + 21, 4, 1, '#A8A8A8'); // Cadenas
      px(x + 4, by + 12, 4, 7, SK.d);
      px(x + 24, by + 12, 4, 7, SK.d);
      px(x + 13, by + 8, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // MOHAWK ROJO
      px(x + 13, by - 10, 6, 12, '#D02020');
      px(x + 14, by - 12, 4, 10, '#E03030');
      px(x + 15, by - 14, 2, 8, '#F04040');
      px(x + 9, by + 1, 4, 5, '#C8A080');
      px(x + 19, by + 1, 4, 5, '#C8A080'); // Lados rapados
      // Ojos con delineador
      px(x + 11, by + 3, 4, 3, '#fff');
      px(x + 18, by + 3, 4, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#181818');
      px(x + 20, by + 4, 2, 2, '#181818');
      px(x + 11, by + 3, 4, 1, '#282828');
      px(x + 18, by + 3, 4, 1, '#282828');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 16, by + 6, 1, 2, '#C8C8C8');
      px(x + 10, by + 5, 1, 1, '#C8C8C8'); // Piercings
      px(x + 14, by + 8, 4, 1, '#A88070');
      break;

    // ==========================================
    // CASTILLO
    // ==========================================

    case 'yam': // Pre-game con casco; post-game sin casco
      if (!postGame) {
        // Armadura tosca con cuernos y hacha
        px(x + 8, by + 26, 6, 4, '#565A60');
        px(x + 18, by + 26, 6, 4, '#565A60');
        px(x + 9, by + 22, 5, 5, '#6A6E76');
        px(x + 18, by + 22, 5, 5, '#6A6E76');
        px(x + 4, by + 10, 24, 12, '#707782');
        px(x + 6, by + 11, 20, 10, '#858C98');
        px(x + 8, by + 13, 16, 7, '#59606A');
        px(x + 1, by + 9, 6, 5, '#7C838E');
        px(x + 25, by + 9, 6, 5, '#7C838E');
        // Hacha
        px(x + 28, by + 8, 2, 22, '#6A4828');
        px(x + 25, by + 7, 7, 5, '#A8B0B8');
        px(x + 27, by + 6, 5, 7, '#C0C8D0');
        // Casco con cuernos
        px(x + 8, by - 1, 16, 12, '#68707C');
        px(x + 10, by + 1, 12, 9, '#808894');
        px(x + 11, by + 4, 4, 2, '#151515');
        px(x + 18, by + 4, 4, 2, '#151515');
        px(x + 5, by - 3, 5, 3, '#D8D0B0');
        px(x + 22, by - 3, 5, 3, '#D8D0B0');
        px(x + 3, by - 5, 4, 2, '#F0E8C8');
        px(x + 25, by - 5, 4, 2, '#F0E8C8');
        px(x + 14, by + 8, 4, 1, '#303030');
      } else {
        // Sin casco: chica sociable de cabello negro largo, iris negros sin escleróticas
        px(x + 8, by + 26, 6, 4, '#8090A0');
        px(x + 18, by + 26, 6, 4, '#8090A0');
        px(x + 9, by + 22, 5, 5, '#8898A8');
        px(x + 18, by + 22, 5, 5, '#8898A8');
        px(x + 4, by + 10, 24, 12, '#A0B0C0');
        px(x + 6, by + 11, 20, 10, '#B0C0D0');
        px(x + 8, by + 12, 16, 8, '#C0D0E0');
        px(x + 12, by + 13, 8, 6, '#E8C830');
        px(x + 14, by + 14, 4, 4, '#D8B820');
        px(x + 1, by + 10, 5, 4, '#A0B0C0');
        px(x + 26, by + 10, 5, 4, '#A0B0C0');
        px(x + 13, by + 8, 6, 3, SK.a);
        px(x + 9, by + 0, 14, 10, SK.a);
        px(x + 10, by + 1, 12, 8, SK.d);
        px(x + 7, by - 2, 18, 5, '#111');
        px(x + 6, by + 1, 4, 17, '#111');
        px(x + 22, by + 1, 4, 17, '#111');
        px(x + 5, by + 14, 3, 8, '#080808');
        px(x + 24, by + 14, 3, 8, '#080808');
        px(x + 8, by - 3, 16, 2, '#282828');
        px(x + 12, by + 4, 3, 3, '#050505');
        px(x + 18, by + 4, 3, 3, '#050505');
        px(x + 13, by + 4, 1, 1, '#303030');
        px(x + 19, by + 4, 1, 1, '#303030');
        px(x + 13, by + 8, 6, 2, '#E08888');
        px(x + 15, by + 8, 2, 1, '#F8F8F8');
        if (fr % 40 < 20) {
          cx.fillStyle = '#E8C830';
          cx.font = '10px "Press Start 2P"';
          cx.fillText('!', x + 28, by - 4);
        }
      }
      break;

    case 'ravell': // Bufón amarillo y verde rayas
      px(x + 6, by + 27, 7, 3, '#E8C830');
      px(x + 19, by + 27, 7, 3, '#38A038');
      px(x + 9, by + 22, 5, 6, '#D8B820');
      px(x + 18, by + 22, 5, 6, '#28A028');
      // Cuerpo rayas amarillo/verde
      px(x + 4, by + 10, 12, 12, '#E8C830');
      px(x + 16, by + 10, 12, 12, '#38A038');
      // Rayas
      px(x + 6, by + 12, 2, 8, '#38A038');
      px(x + 10, by + 12, 2, 8, '#38A038');
      px(x + 18, by + 12, 2, 8, '#E8C830');
      px(x + 22, by + 12, 2, 8, '#E8C830');
      px(x + 6, by + 9, 20, 2, '#F0F0F0'); // Collar
      px(x + 13, by + 7, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 9, SK.a);
      px(x + 10, by + 1, 12, 7, SK.d);
      // Gorro bufón
      px(x + 6, by - 7, 10, 9, '#E8C830');
      px(x + 16, by - 7, 10, 9, '#38A038');
      px(x + 5, by - 8, 3, 3, '#F8D030');
      px(x + 24, by - 8, 3, 3, '#48B048');
      px(x + 14, by - 10, 4, 3, '#F8D030');
      // Cascabeles
      px(x + 5, by - 8, 2, 2, '#C8C8C8');
      px(x + 25, by - 8, 2, 2, '#C8C8C8');
      px(x + 15, by - 10, 2, 2, '#C8C8C8');
      px(x + 13, by + 3, 2, 3, '#283848');
      px(x + 19, by + 3, 2, 3, '#283848');
      px(x + 14, by + 7, 4, 1, '#C09888');
      break;

    case 'boss': // Rey con barba larga blanca, corona, capa roja, armadura
      px(x + 6, by + 26, 7, 4, '#586878');
      px(x + 19, by + 26, 7, 4, '#586878');
      px(x + 7, by + 20, 6, 7, '#687888');
      px(x + 19, by + 20, 6, 7, '#687888');
      px(x + 2, by + 8, 28, 13, '#687888');
      px(x + 4, by + 9, 24, 11, '#789098');
      px(x + 6, by + 10, 20, 9, '#88A0A8');
      px(x + 12, by + 11, 8, 7, '#E8C830');
      px(x + 14, by + 13, 4, 3, '#D8B820');
      // Capa roja
      px(x + 0, by + 8, 4, 20, '#A82020');
      px(x + 28, by + 8, 4, 20, '#A82020');
      px(x + 1, by + 10, 2, 16, '#C83030');
      px(x + 29, by + 10, 2, 16, '#C83030');
      px(x + 0, by + 26, 4, 3, '#E8E8E8');
      px(x + 28, by + 26, 4, 3, '#E8E8E8'); // Armiño
      px(x + 12, by + 5, 8, 4, SK.a);
      px(x + 8, by - 4, 16, 11, SK.a);
      px(x + 9, by - 3, 14, 9, SK.d);
      // BARBA LARGA BLANCA
      px(x + 10, by + 5, 12, 5, '#E8E8E8');
      px(x + 11, by + 9, 10, 4, '#E0E0E0');
      px(x + 12, by + 12, 8, 3, '#D8D8D8');
      px(x + 13, by + 14, 6, 2, '#D0D0D0');
      // Ojos
      px(x + 12, by + 0, 3, 3, '#fff');
      px(x + 18, by + 0, 3, 3, '#fff');
      px(x + 13, by + 1, 2, 2, '#384858');
      px(x + 19, by + 1, 2, 2, '#384858');
      px(x + 12, by - 1, 3, 1, '#C0C0C0');
      px(x + 18, by - 1, 3, 1, '#C0C0C0'); // Cejas canosas
      // CORONA con gemas
      px(x + 7, by - 9, 18, 5, '#E8C830');
      px(x + 9, by - 12, 3, 5, '#E8C830');
      px(x + 15, by - 13, 3, 6, '#E8C830');
      px(x + 21, by - 12, 3, 5, '#E8C830');
      px(x + 10, by - 11, 2, 2, '#D03030');
      px(x + 15, by - 12, 3, 2, '#3060D0');
      px(x + 21, by - 11, 2, 2, '#30C030');
      // Pelo canoso
      px(x + 7, by - 5, 3, 7, '#C0C0C0');
      px(x + 22, by - 5, 3, 7, '#C0C0C0');
      break;

    // ==========================================
    // POST-GAME: EDISON
    // ==========================================

    case 'edison': // Pelo negro, anteojos negros, ropa medieval genial
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 6, by + 11, 20, 10, '#3A5068');
      px(x + 8, by + 12, 16, 8, '#4A6078');
      px(x + 10, by + 13, 12, 6, '#5A7088');
      // Detalles elegantes
      px(x + 10, by + 12, 12, 1, '#C8A830');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 20, 4, 2, '#C8A830');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // ANTEOJOS NEGROS
      px(x + 10, by + 3, 5, 4, '#1A1A1A');
      px(x + 11, by + 4, 3, 2, '#303848');
      px(x + 17, by + 3, 5, 4, '#1A1A1A');
      px(x + 18, by + 4, 3, 2, '#303848');
      px(x + 15, by + 4, 2, 1, '#1A1A1A');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    default: // NPC genérico
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 22, 5, 5, '#3A3028');
      px(x + 18, by + 22, 5, 5, '#3A3028');
      px(x + 6, by + 11, 20, 10, '#4A6888');
      px(x + 8, by + 12, 16, 8, '#5A78A0');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#283848');
      px(x + 19, by + 4, 2, 2, '#283848');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;
  } // fin switch
} // fin dNPC

export { dNPC };
