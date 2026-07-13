// Sprites de las 59 criaturas del juego (Bloque 6A original).
//
// Una sola función `dCre(x, y, id, lv, f)` con un switch (id) que
// dibuja cada criatura pixel a pixel. Cada caso puede usar SPRITE_LOADER
// para cargar un PNG si está disponible (ver Knightapple/hydrapom).
//
// Para agregar una criatura nueva: añadir un case al switch.
// Para reemplazar el sprite pixel-art por PNG: agregar el patrón
// if (SPRITE_LOADER.has('<id>')) { drawImage } else { pixel-art }

import { cx } from '../core/canvas.js';
import { px, pixelGlow } from './render-utils.js';
import { dShadow } from './world-decor.js';
import { SPRITE_LOADER } from '../core/sprite-loader.js';
import { fr } from '../core/frame.js';
import { tCol, tColL, tEmo } from '../data/types.js';
import { CDB } from '../data/creatures.js';

function dCre(x, y, id, lv, f) {
  const sz = Math.min(lv, 5),
    b = Math.sin(f * 0.15) * 2;
  dShadow(x + 16, y + 50, 12 + sz, 3);
  const by = y + b;

  switch (id) {
    // ==========================================
    // FUEGO 🔥
    // ==========================================

    case 'flamingo': // Flamígaro: flamingo flamenco novato, una pata y castañuelas
      {
        const tap = Math.sin(f * 0.25) * 2;
        // cuerpo vertical, baila en una sola pata
        px(x + 12, by + 18, 10 + sz, 17 + sz, '#D83848');
        px(x + 14, by + 20, 6 + sz, 13 + sz, '#F06070');
        px(x + 10, by + 32 + sz, 14, 3, '#B82838'); // faldita simple de plumas
        // cuello largo en S pixelada
        px(x + 15, by + 6, 4, 14, '#D83848');
        px(x + 17, by + 4, 5, 4, '#E84858');
        px(x + 19, by + 2, 7, 5, '#D83848');
        // cabeza y pico
        px(x + 20, by + 1, 10, 8, '#E84858');
        px(x + 22, by + 3, 6, 4, '#F08090');
        px(x + 28, by + 4, 5, 2, '#F0A030');
        px(x + 31, by + 5, 3, 1, '#D88020');
        px(x + 24, by + 3, 3, 3, '#fff');
        px(x + 25, by + 4, 2, 2, '#181818');
        // flor/chispa en la cabeza
        px(x + 20, by - 2, 3, 3, '#E82020');
        px(x + 23, by - 1, 2, 2, '#F84040');
        // alas-castañuelas
        px(x + 5, by + 22 + tap, 7, 5, '#B82838');
        px(x + 3, by + 21 + tap, 4, 4, '#F8A030');
        px(x + sz + 21, by + 20 - tap, 9, 6, '#B82838');
        px(x + sz + 28, by + 19 - tap, 4, 4, '#F8A030');
        // pata única, larga
        px(x + 16, by + 34 + sz, 2, 12, '#C89020');
        px(x + 14, by + 45 + sz, 6, 2, '#A87018');
        // segunda pata recogida
        px(x + 20, by + 34 + sz, 6, 2, '#C89020');
        px(x + 25, by + 32 + sz, 2, 4, '#C89020');
      }
      break;

    case 'emberwing': // Cóndor abuelita tejiendo
      px(x + 4, by + 18, 24 + sz, 16 + sz, '#483838');
      px(x + 6, by + 20, 20 + sz, 12 + sz, '#585048');
      px(x + 8, by + 22, 16 + sz, 8, '#686058');
      px(x, by + 14, 8, 14, '#383028');
      px(x + sz + 24, by + 14, 8, 14, '#383028');
      px(x + 2, by + 16, 4, 10, '#484038');
      px(x + sz + 26, by + 16, 4, 10, '#484038');
      px(x + 8, by + 4, 16 + sz, 14, '#483838');
      px(x + 10, by + 6, 12 + sz, 10, '#585048');
      px(x + 8, by + 2, 16 + sz, 5, '#C83030');
      px(x + 10, by + 0, 12 + sz, 4, '#D84040');
      px(x + 14, by - 1, 4, 2, '#F8F8F8');
      px(x + 10, by + 8, 5, 4, '#C8A830');
      px(x + 11, by + 9, 3, 2, '#E8E0D0');
      px(x + 18, by + 8, 5, 4, '#C8A830');
      px(x + 19, by + 9, 3, 2, '#E8E0D0');
      px(x + 15, by + 9, 3, 1, '#C8A830');
      px(x + 14, by + 14, 5, 3, '#585048');
      px(x + 15, by + 16, 3, 1, '#484038');
      px(x + 2, by + 28, 2, 10, '#C8C8C8');
      px(x + sz + 28, by + 28, 2, 10, '#C8C8C8');
      px(x + 4, by + 30, sz + 22, 2, '#D83030');
      px(x + 10, by + 32 + sz, 5, 5, '#484038');
      px(x + 19, by + 32 + sz, 5, 5, '#484038');
      break;

    // ==========================================
    // PLANTA 🌿
    // ==========================================

    case 'ivygoat': // Hedroca: cabrito mayordomo pequeño con bandeja
      {
        const ear = Math.sin(f * 0.12) * 1;
        // cuerpo pequeño de cabrito, más bajo que su evolución
        px(x + 7, by + 23, 20 + sz, 11 + sz, '#C8D8B0');
        px(x + 9, by + 25, 16 + sz, 7 + sz, '#E0E8C8');
        px(x + 6, by + 21, 22 + sz, 5, '#3A6A30'); // chaleco verde
        px(x + 10, by + 22, 14 + sz, 3, '#508838');
        // patitas finas
        px(x + 9, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + 15, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + sz + 21, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + 8, by + 38 + sz, 5, 2, '#2A2418');
        px(x + 20 + sz, by + 38 + sz, 5, 2, '#2A2418');
        // cabeza tierna, separada visualmente del torso
        px(x + 8, by + 6, 18 + sz, 14, '#C8D8B0');
        px(x + 10, by + 8, 14 + sz, 10, '#E0E8C8');
        px(x + 5, by + 7 + ear, 5, 6, '#A0B078');
        px(x + sz + 24, by + 7 - ear, 5, 6, '#A0B078');
        px(x + 6, by + 8 + ear, 3, 3, '#E0E8C8');
        px(x + sz + 25, by + 8 - ear, 3, 3, '#E0E8C8');
        // cuernitos-hojas pequeños
        px(x + 10, by + 2, 4, 5, '#4FA840');
        px(x + sz + 20, by + 2, 4, 5, '#4FA840');
        px(x + 11, by + 0, 2, 3, '#72C860');
        px(x + sz + 21, by + 0, 2, 3, '#72C860');
        // cara
        px(x + 12, by + 11, 4, 4, '#fff');
        px(x + sz + 19, by + 11, 4, 4, '#fff');
        px(x + 14, by + 13, 2, 2, '#203010');
        px(x + sz + 21, by + 13, 2, 2, '#203010');
        px(x + 15, by + 17, 5, 2, '#8A6040');
        // moñito y bandeja de mayordomo
        px(x + 14, by + 20, 6, 3, '#202030');
        px(x + 15, by + 19, 4, 1, '#E8E8E8');
        px(x + sz + 27, by + 21, 8, 2, '#C8C8C8');
        px(x + sz + 28, by + 18, 5, 3, '#F0F0F0');
      }
      break;

    case 'thornbuck': // Espinardo: carnerito punk pequeño, bajo y con pocas espinas
      {
        const hop = Math.sin(f * 0.16) * 1;
        px(x + 9, by + 25 + hop, 18 + sz, 10 + sz, '#406028');
        px(x + 11, by + 27 + hop, 14 + sz, 6 + sz, '#5A7838');
        px(x + 13, by + 28 + hop, 10 + sz, 3, '#6C9040');
        px(x + 10, by + 22 + hop, 16 + sz, 5, '#1A2818');
        px(x + 12, by + 23 + hop, 12 + sz, 3, '#2A3828');
        px(x + 12, by + 22 + hop, 2, 2, '#C8A830');
        px(x + sz + 22, by + 22 + hop, 2, 2, '#C8A830');
        px(x + 8, by + 8 + hop, 20 + sz, 15, '#406028');
        px(x + 10, by + 10 + hop, 16 + sz, 11, '#5A7838');
        px(x + 12, by + 12 + hop, 12 + sz, 7, '#6C9040');
        px(x + 4, by + 6 + hop, 6, 5, '#304818');
        px(x + sz + 27, by + 6 + hop, 6, 5, '#304818');
        px(x + 3, by + 5 + hop, 3, 3, '#D8B840');
        px(x + sz + 31, by + 5 + hop, 3, 3, '#D8B840');
        px(x + 13, by + 4 + hop, 9 + sz, 3, '#38A020');
        px(x + 15, by + 2 + hop, 5 + sz, 3, '#48C030');
        px(x + 11, by + 13 + hop, 5, 4, '#fff');
        px(x + sz + 20, by + 13 + hop, 5, 4, '#fff');
        px(x + 13, by + 14 + hop, 3, 2, '#203010');
        px(x + sz + 22, by + 14 + hop, 3, 2, '#203010');
        px(x + 13, by + 19 + hop, 7, 1, '#263818');
        px(x + 10, by + 34 + sz + hop, 5, 5, '#406028');
        px(x + sz + 21, by + 34 + sz + hop, 5, 5, '#406028');
        px(x + 9, by + 38 + sz + hop, 6, 2, '#3A2A1A');
        px(x + sz + 21, by + 38 + sz + hop, 6, 2, '#3A2A1A');
        px(x + 7, by + 24 + hop, 3, 4, '#A8D860');
        px(x + sz + 27, by + 24 + hop, 3, 4, '#A8D860');
      }
      break;

    case 'wyvern': // Wyvernito: cachorro agresivo, agazapado con alas puntiagudas
      {
        const snarl = Math.sin(f * 0.18) * 1;
        // postura baja de depredador, listo para saltar
        px(x + 6, by + 26 + snarl, 24 + sz, 10 + sz, '#3A1690');
        px(x + 9, by + 28 + snarl, 18 + sz, 6 + sz, '#5830B0');
        px(x - 1, by + 30 + snarl, 10, 4, '#241060'); // cola
        px(x - 5, by + 28 + snarl, 5, 4, '#151018');
        px(x - 7, by + 27 + snarl, 3, 3, '#1ED060');
        // alas pequeñas pero afiladas
        px(x + 0, by + 18 + snarl, 12, 5, '#1C1028');
        px(x - 4, by + 22 + snarl, 12, 4, '#2A1668');
        px(x + sz + 25, by + 18 + snarl, 12, 5, '#1C1028');
        px(x + sz + 29, by + 22 + snarl, 12, 4, '#2A1668');
        px(x + 4, by + 20 + snarl, 5, 2, '#1ED060');
        px(x + sz + 29, by + 20 + snarl, 5, 2, '#1ED060');
        // cabeza grande con mandíbula agresiva
        px(x + 8, by + 8 + snarl, 21 + sz, 15, '#3A1690');
        px(x + 10, by + 10 + snarl, 17 + sz, 11, '#5830B0');
        px(x + 13, by + 12 + snarl, 12 + sz, 7, '#7040C8');
        // cuernos negros con punta verde
        px(x + 6, by + 3 + snarl, 4, 7, '#101010');
        px(x + sz + 26, by + 3 + snarl, 4, 7, '#101010');
        px(x + 5, by + 1 + snarl, 3, 3, '#1ED060');
        px(x + sz + 29, by + 1 + snarl, 3, 3, '#1ED060');
        // ojos verdes de cachorro feroz
        px(x + 11, by + 13 + snarl, 6, 5, '#74FF80');
        px(x + sz + 21, by + 13 + snarl, 6, 5, '#74FF80');
        px(x + 13, by + 15 + snarl, 3, 2, '#001008');
        px(x + sz + 23, by + 15 + snarl, 3, 2, '#001008');
        px(x + 14, by + 21 + snarl, 8, 2, '#101010');
        px(x + 15, by + 22 + snarl, 2, 2, '#F8F8F8');
        px(x + 21, by + 22 + snarl, 2, 2, '#F8F8F8');
        // garras delanteras
        px(x + 9, by + 35 + sz + snarl, 6, 4, '#3A1690');
        px(x + sz + 24, by + 35 + sz + snarl, 6, 4, '#3A1690');
        px(x + 8, by + 38 + sz + snarl, 3, 2, '#1ED060');
        px(x + sz + 28, by + 38 + sz + snarl, 3, 2, '#1ED060');
      }
      break;

    case 'eastern': // Lóngbao: dragón oriental bebé dentro de un bao al vapor
      {
        const steam = Math.sin(f * 0.1) * 2;
        // vapor cuadrado alrededor
        cx.globalAlpha = 0.35;
        px(x + 6, by + 2 + steam, 3, 3, '#F8F8F8');
        px(x + 24, by + 4 - steam, 3, 3, '#F8F8F8');
        px(x + 15, by - 1 + steam, 2, 2, '#F0F0F0');
        cx.globalAlpha = 1;
        // cuerpo bao: blanco/crema, redondito por bloques
        px(x + 6, by + 19, 24 + sz, 17 + sz, '#E8D8C0');
        px(x + 8, by + 17, 20 + sz, 18 + sz, '#F8E8D0');
        px(x + 11, by + 15, 14 + sz, 6, '#FFF0D8');
        // pliegues del bao
        px(x + 12, by + 17, 2, 14, '#D8C0A0');
        px(x + 18, by + 16, 2, 13, '#D8C0A0');
        px(x + 24, by + 18, 2, 10, '#D8C0A0');
        px(x + 14, by + 14, 8, 3, '#E8D8C0');
        // cabeza de dragón asomando
        px(x + 8, by + 4, 20 + sz, 14, '#C83030');
        px(x + 10, by + 6, 16 + sz, 10, '#D84040');
        px(x + 12, by + 8, 12 + sz, 6, '#E85050');
        // bigotes/fideos chinos
        px(x + 3, by + 13, 8, 2, '#F8F8F8');
        px(x + sz + 25, by + 13, 8, 2, '#F8F8F8');
        px(x + 1, by + 15, 5, 1, '#E8E8E8');
        px(x + sz + 31, by + 15, 5, 1, '#E8E8E8');
        // cuernos y gorrito de vapor
        px(x + 6, by - 1, 4, 5, '#E8C830');
        px(x + sz + 25, by - 1, 4, 5, '#E8C830');
        px(x + 5, by - 3, 3, 3, '#F0D040');
        px(x + sz + 27, by - 3, 3, 3, '#F0D040');
        px(x + 14, by - 3, 8 + sz, 3, '#F8F8F8');
        // ojos
        px(x + 10, by + 9, 5, 5, '#fff');
        px(x + sz + 19, by + 9, 5, 5, '#fff');
        px(x + 12, by + 11, 3, 3, '#881818');
        px(x + sz + 21, by + 11, 3, 3, '#881818');
        px(x + 15, by + 15, 5, 2, '#A82820');
        // colita de dragón saliendo del bao
        px(x + sz + 28, by + 26, 6, 5, '#C83030');
        px(x + sz + 32, by + 24, 4, 4, '#E85050');
      }
      break;

    case 'serpentdrg': // Serpentón: serpiente dragón mafioso joven, más pequeño
      {
        const sway = Math.sin(f * 0.12) * 1;
        px(x + 9, by + 22 + sway, 18 + sz, 10 + sz, '#282858');
        px(x + 11, by + 24 + sway, 14 + sz, 6 + sz, '#383868');
        px(x + 6, by + 29 + sway, 16, 4, '#282858');
        px(x + 2, by + 32 + sway, 9, 4, '#383868');
        px(x + sz + 24, by + 30 + sway, 9, 4, '#282858');
        px(x + 15, by + 18 + sway, 4, 9, '#C83030');
        px(x + 16, by + 18 + sway, 2, 1, '#D84040');
        px(x + 8, by + 6 + sway, 18 + sz, 12, '#282858');
        px(x + 10, by + 8 + sway, 14 + sz, 8, '#383868');
        px(x + 12, by + 10 + sway, 10 + sz, 5, '#484878');
        px(x + 5, by + 1 + sway, 24 + sz, 4, '#1A1A1A');
        px(x + 9, by - 2 + sway, 16 + sz, 4, '#282828');
        px(x + 11, by - 3 + sway, 12 + sz, 2, '#383838');
        px(x + 13, by - 1 + sway, 8 + sz, 1, '#C83030');
        px(x + 11, by + 9 + sway, 5, 3, '#F0C020');
        px(x + sz + 19, by + 9 + sway, 5, 3, '#F0C020');
        px(x + 13, by + 10 + sway, 2, 2, '#100838');
        px(x + sz + 21, by + 10 + sway, 2, 2, '#100838');
        px(x + 11, by + 7 + sway, 1, 4, '#C07060');
        px(x + sz + 22, by + 15 + sway, 6, 2, '#8A6020');
        px(x + sz + 27, by + 14 + sway, 2, 2, '#E8A030');
        if (f % 20 < 10) px(x + sz + 28, by + 12 + sway, 2, 2, '#C8C8C8');
        px(x - 4, by + 34 + sway, 6, 3, '#282858');
        px(x - 7, by + 32 + sway, 4, 4, '#C8A030');
      }
      break;

    case 'pixie': // Duendecillo: ladrón pequeño, encorvado y con saco diminuto
      {
        const sneak = Math.sin(fr * 0.14) * 1;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F080F0';
        pixelGlow(x + 16, by + sneak + 25, 12 + sz, 10);
        cx.globalAlpha = 1;
        // postura baja y furtiva, no hada genérica con alas grandes
        px(x + 10, by + sneak + 24, 12 + sz, 9 + sz, '#38A048');
        px(x + 12, by + sneak + 26, 8 + sz, 5 + sz, '#48B058');
        px(x + 6, by + sneak + 27, 8, 4, '#2F8038');
        px(x + sz + 20, by + sneak + 27, 8, 4, '#2F8038');
        // saco de calcetines más importante que el cuerpo
        px(x + sz + 22, by + sneak + 18, 10, 12, '#8A6820');
        px(x + sz + 23, by + sneak + 20, 8, 8, '#A88030');
        px(x + sz + 24, by + sneak + 16, 4, 4, '#E8E8E8');
        px(x + sz + 25, by + sneak + 16, 1, 2, '#D83030');
        // cabeza con capucha negra de ladrón
        px(x + 7, by + sneak + 8, 17 + sz, 13, '#F8D0C0');
        px(x + 9, by + sneak + 10, 13 + sz, 9, '#F8E0D0');
        px(x + 6, by + sneak + 4, 20 + sz, 7, '#202020');
        px(x + 9, by + sneak + 1, 13 + sz, 6, '#101010');
        px(x + 6, by + sneak + 10, 20 + sz, 3, '#101010');
        // ojos brillantes de pillo
        px(x + 10, by + sneak + 12, 4, 3, '#F8E830');
        px(x + sz + 19, by + sneak + 12, 4, 3, '#F8E830');
        px(x + 11, by + sneak + 13, 2, 1, '#202020');
        px(x + sz + 20, by + sneak + 13, 2, 1, '#202020');
        px(x + 14, by + sneak + 18, 5, 1, '#C08868');
        // alitas pequeñísimas, casi ocultas
        cx.globalAlpha = 0.35;
        px(x + 4, by + sneak + 15, 5, 6, '#F8C0F8');
        cx.globalAlpha = 1;
        px(x + 10, by + sneak + 31 + sz, 4, 3, '#F8D0C0');
        px(x + sz + 18, by + sneak + 31 + sz, 4, 3, '#F8D0C0');
      }
      break;

    case 'sidhe': // Hada celta cantante de ópera
      const shv = Math.sin(fr * 0.12) * 3;
      cx.globalAlpha = 0.06;
      cx.fillStyle = '#A0E0A0';
      pixelGlow(x + 16, by + shv + 25, 18 + sz, 16);
      cx.globalAlpha = 1;
      px(x + 4, by + shv + 18, 24 + sz, 16 + sz, '#D838A0');
      px(x + 6, by + shv + 20, 20 + sz, 12 + sz, '#E848B0');
      px(x + 8, by + shv + 22, 16 + sz, 8, '#F060C0');
      cx.globalAlpha = 0.5;
      px(x - 6, by + shv + 8, 12, 16, '#C8F8C8');
      px(x + sz + 26, by + shv + 8, 12, 16, '#C8F8C8');
      cx.globalAlpha = 0.6;
      px(x - 4, by + shv + 10, 8, 12, '#D8F8D8');
      px(x + sz + 28, by + shv + 10, 8, 12, '#D8F8D8');
      cx.globalAlpha = 1;
      px(x + 8, by + shv + 4, 16 + sz, 14, '#F8D8E8');
      px(x + 10, by + shv + 6, 12 + sz, 10, '#F8E8F0');
      px(x + 10, by + shv + 2, 12 + sz, 3, '#E8C830');
      px(x + 14, by + shv + 0, 4 + sz, 3, '#E8C830');
      px(x + 15, by + shv - 1, 2, 2, '#D03030');
      px(x + 10, by + shv + 8, 5, 5, '#fff');
      px(x + sz + 18, by + shv + 8, 5, 5, '#fff');
      px(x + 12, by + shv + 10, 3, 3, '#300860');
      px(x + sz + 20, by + shv + 10, 3, 3, '#300860');
      px(x + 12, by + shv + 10, 1, 1, '#fff');
      px(x + sz + 20, by + shv + 10, 1, 1, '#fff');
      px(x + 14, by + shv + 16, 4, 3, '#C05890');
      px(x + 15, by + shv + 17, 2, 1, '#F8D0E0');
      if (f % 40 < 20) {
        cx.fillStyle = '#E8C830';
        cx.font = '8px "Press Start 2P"';
        cx.fillText('♪', x + sz + 24, by + shv + 4 + Math.sin(f * 0.1) * 3);
      }
      px(x + 10, by + shv + 32 + sz, 5, 3, '#D838A0');
      px(x + sz + 18, by + shv + 32 + sz, 5, 3, '#D838A0');
      break;

    case 'spritefly': // Luciérnaga fotógrafa con flash
      const sfhv = Math.sin(fr * 0.15) * 4;
      const flash = Math.sin(fr * 0.2) > 0.7;
      if (flash) {
        cx.globalAlpha = 0.2;
        cx.fillStyle = '#F8F8C0';
      pixelGlow(x + 16, by + sfhv + 20, 22 + sz, 20);
        cx.globalAlpha = 1;
      }
      cx.globalAlpha = 0.5;
      px(x - 4, by + sfhv + 8, 10, 10, '#C8F0F8');
      px(x + sz + 26, by + sfhv + 8, 10, 10, '#C8F0F8');
      px(x - 2, by + sfhv + 14, 8, 8, '#C8F0F8');
      px(x + sz + 24, by + sfhv + 14, 8, 8, '#C8F0F8');
      cx.globalAlpha = 1;
      px(x + 8, by + sfhv + 18, 16 + sz, 12 + sz, '#E8C020');
      px(x + 10, by + sfhv + 20, 12 + sz, 8 + sz, '#F0D030');
      px(x + 10, by + sfhv + 26 + sz, 12 + sz, 4, '#F8F080');
      if (f % 8 < 4) {
        px(x + 12, by + sfhv + 28 + sz, 8 + sz, 3, '#F8F8C0');
      }
      px(x + 8, by + sfhv + 6, 16 + sz, 14, '#E8C020');
      px(x + 10, by + sfhv + 8, 12 + sz, 10, '#F0D030');
      px(x + 8, by + sfhv + 8, 6, 6, '#fff');
      px(x + sz + 18, by + sfhv + 8, 6, 6, '#fff');
      px(x + 10, by + sfhv + 10, 4, 4, '#382858');
      px(x + sz + 20, by + sfhv + 10, 4, 4, '#382858');
      px(x + 10, by + sfhv + 10, 2, 2, '#fff');
      px(x + sz + 20, by + sfhv + 10, 2, 2, '#fff');
      px(x + sz + 22, by + sfhv + 14, 6, 5, '#383838');
      px(x + sz + 23, by + sfhv + 15, 4, 3, '#484848');
      px(x + sz + 27, by + sfhv + 14, 2, 3, '#E8E8E8');
      px(x + 12, by + sfhv + 4, 2, 4, '#C8A020');
      px(x + sz + 18, by + sfhv + 4, 2, 4, '#C8A020');
      px(x + 11, by + sfhv + 2, 2, 2, '#F8E830');
      px(x + sz + 19, by + sfhv + 2, 2, 2, '#F8E830');
      px(x + 10, by + sfhv + 28 + sz, 4, 3, '#C8A020');
      px(x + sz + 18, by + sfhv + 28 + sz, 4, 3, '#C8A020');
      break;

    // ==========================================
    // NORMAL ⚔️ (SECRETO)
    // ==========================================

    case 'serafox': // Zorro ángel - guardián celestial travieso
      const sxhv = Math.sin(fr * 0.1) * 2;
      cx.globalAlpha = 0.1 + Math.sin(fr * 0.06) * 0.05;
      cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, by + sxhv + 22, 22 + sz, 20);
      cx.globalAlpha = 1;
      cx.globalAlpha = 0.7;
      const awf = Math.sin(f * 0.15) * 3;
      px(x - 8, by + sxhv + 6 + awf, 14, 16, '#F8F0E0');
      px(x + sz + 26, by + sxhv + 6 - awf, 14, 16, '#F8F0E0');
      px(x - 6, by + sxhv + 8 + awf, 10, 12, '#F8F8F0');
      px(x + sz + 28, by + sxhv + 8 - awf, 10, 12, '#F8F8F0');
      px(x - 4, by + sxhv + 10 + awf, 6, 8, '#F8F8F8');
      px(x + sz + 30, by + sxhv + 10 - awf, 6, 8, '#F8F8F8');
      cx.globalAlpha = 1;
      px(x - 8, by + sxhv + 6 + awf, 3, 3, '#E8C830');
      px(x + sz + 37, by + sxhv + 6 - awf, 3, 3, '#E8C830');
      px(x + 6, by + sxhv + 18, 20 + sz, 14 + sz, '#E8A030');
      px(x + 8, by + sxhv + 20, 16 + sz, 10 + sz, '#F0B040');
      px(x + 10, by + sxhv + 22, 12 + sz, 6, '#F8C050');
      px(x + 10, by + sxhv + 22, 8 + sz, 6, '#F8F0E0');
      px(x + 6, by + sxhv + 4, 20 + sz, 14, '#E8A030');
      px(x + 8, by + sxhv + 6, 16 + sz, 10, '#F0B040');
      px(x + 10, by + sxhv + 8, 12 + sz, 6, '#F8C050');
      px(x + 12, by + sxhv + 12, 8 + sz, 4, '#F8F0E0');
      px(x + 6, by + sxhv - 2, 5, 8, '#E8A030');
      px(x + sz + 21, by + sxhv - 2, 5, 8, '#E8A030');
      px(x + 7, by + sxhv - 1, 3, 5, '#F0B040');
      px(x + sz + 22, by + sxhv - 1, 3, 5, '#F0B040');
      px(x + 8, by + sxhv + 1, 2, 3, '#F0A0A0');
      px(x + sz + 22, by + sxhv + 1, 2, 3, '#F0A0A0');
      const sxha = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = sxha;
      px(x + 8, by + sxhv - 6, 16 + sz, 2, '#F8E868');
      px(x + 7, by + sxhv - 5, 18 + sz, 1, '#F8D830');
      cx.globalAlpha = 1;
      px(x + 10, by + sxhv + 8, 5, 4, '#fff');
      px(x + sz + 18, by + sxhv + 8, 5, 4, '#fff');
      px(x + 12, by + sxhv + 9, 3, 3, '#C88020');
      px(x + sz + 20, by + sxhv + 9, 3, 3, '#C88020');
      px(x + 12, by + sxhv + 9, 1, 1, '#F8E830');
      px(x + sz + 20, by + sxhv + 9, 1, 1, '#F8E830');
      px(x + 15, by + sxhv + 12, 2, 2, '#282828');
      px(x + 13, by + sxhv + 15, 6, 1, '#C08868');
      px(x + 18, by + sxhv + 14, 2, 1, '#C08868');
      px(x - 6, by + sxhv + 26, 10, 6, '#E8A030');
      px(x - 8, by + sxhv + 24, 8, 5, '#F0B040');
      px(x - 10, by + sxhv + 22, 6, 4, '#F8F0E0');
      px(x + 8, by + sxhv + 30 + sz, 5, 6, '#E8A030');
      px(x + sz + 18, by + sxhv + 30 + sz, 5, 6, '#E8A030');
      px(x + 8, by + sxhv + 34 + sz, 5, 2, '#282828');
      px(x + sz + 18, by + sxhv + 34 + sz, 5, 2, '#282828');
      if (f % 24 < 12) {
        px(x + sz + 28, by + sxhv + 4, 2, 2, '#F8F8C0');
        px(x - 4, by + sxhv + 16, 2, 2, '#F8F8C0');
        px(x + 20, by + sxhv - 4, 2, 2, '#F8E868');
      }
      break;

    // ==========================================
    // EVOLUCIONES FUEGO 🔥
    // ==========================================

    case 'flamcrest': // Flamcrest: adolescente de cuello corto con abanico controlado
      {
        const sway = Math.sin(f * 0.12) * 2;
        // cola/abanico intermedio: menos plumas, no tan final como Inferpavo
        const tail = [
          [-4, 10 + sway, '#8A1810'],
          [3, 6 + sway, '#B82818'],
          [10, 4 + sway, '#D83828'],
          [17, 4 - sway, '#D83828'],
          [24, 6 - sway, '#B82818'],
          [31, 10 - sway, '#8A1810'],
        ];
        tail.forEach((t, i) => {
          const h = i === 2 || i === 3 ? 27 : i === 1 || i === 4 ? 24 : 19;
          px(x + t[0], by + t[1], 6, h, t[2]);
          px(x + t[0] + 1, by + t[1] + 2, 4, Math.max(8, h - 8), i === 2 || i === 3 ? '#E84838' : '#E83828');
        });
        // ojos de pluma reducidos
        for (let i = 0; i < 3; i++) {
          const fx = x + 7 + i * 9;
          const fy = by + 10 + Math.abs(i - 1) * 2;
          px(fx, fy, 4, 4, '#F8A030');
          px(fx + 1, fy + 1, 2, 2, '#2040A0');
        }
        // cuerpo erguido pero juvenil
        px(x + 10, by + 23, 14 + sz, 13 + sz, '#B82818');
        px(x + 12, by + 25, 10 + sz, 9 + sz, '#D83828');
        px(x + 14, by + 27, 6 + sz, 5, '#F06838');
        // cuello más corto
        px(x + 15, by + 14, 5 + sz, 10, '#B82818');
        px(x + 17, by + 13, 2 + sz, 10, '#E84838');
        // cabeza altiva, más cerca del cuerpo
        px(x + 10, by + 7, 15 + sz, 10, '#B82818');
        px(x + 12, by + 9, 11 + sz, 6, '#D83828');
        // cresta mediana
        px(x + 10, by - 1, 3, 8, '#E82020');
        px(x + 15, by - 4, 4, 11, '#F83828');
        px(x + 21, by - 1, 3, 8, '#E82020');
        px(x + 16, by - 2, 2, 6, '#F8C040');
        // ojos serios
        px(x + 12, by + 10, 4, 4, '#fff');
        px(x + sz + 20, by + 10, 4, 4, '#fff');
        px(x + 14, by + 12, 2, 2, '#801010');
        px(x + sz + 21, by + 12, 2, 2, '#801010');
        px(x + 15, by + 17, 5, 2, '#F0C030');
        // patas largas
        px(x + 12, by + 35 + sz, 4, 8, '#C89020');
        px(x + sz + 21, by + 35 + sz, 4, 8, '#C89020');
        px(x + 10, by + 42 + sz, 7, 2, '#A87018');
        px(x + sz + 20, by + 42 + sz, 7, 2, '#A87018');
      }
      break;

    case 'inferpavo': // Inferpavo: rey-fénix con abanico enorme de fuego
      {
        const wave = Math.sin(f * 0.1) * 2;
        // abanico gigantesco, ocupa casi todo el sprite y cambia la silueta final
        const tailCols = ['#6A1008','#8A1810','#B82018','#D83828','#F04830','#D83828','#B82018','#8A1810','#6A1008'];
        for (let i = 0; i < 9; i++) {
          const fx = x - 18 + i * 7;
          const h = 24 + (4 - Math.abs(i - 4)) * 5;
          const fy = by + 8 - (4 - Math.abs(i - 4)) * 2 + Math.sin(f * 0.08 + i) * 2;
          px(fx, fy, 6, h, tailCols[i]);
          px(fx + 1, fy + 2, 4, Math.max(8, h - 8), i === 4 ? '#F86040' : '#E84030');
          px(fx + 1, fy + 5, 4, 4, '#F8C040');
          px(fx + 2, fy + 6, 2, 2, '#2040A0');
        }
        // corona/base dorada del abanico
        px(x + 2, by + 32, 30 + sz, 5, '#C8A830');
        px(x + 6, by + 33, 22 + sz, 2, '#F8E060');
        // cuerpo regio más compacto delante del abanico
        px(x + 7, by + 22, 20 + sz, 17 + sz, '#A02010');
        px(x + 9, by + 24, 16 + sz, 13 + sz, '#C02818');
        px(x + 12, by + 26, 10 + sz, 8, '#F04830');
        // alas laterales de fuego
        px(x - 8, by + 20 + wave, 14, 12, '#A02010');
        px(x - 12, by + 24 + wave, 10, 8, '#E84020');
        px(x + sz + 27, by + 20 - wave, 14, 12, '#A02010');
        px(x + sz + 35, by + 24 - wave, 10, 8, '#E84020');
        // cuello y cabeza coronada
        px(x + 14, by + 10, 6 + sz, 14, '#A02010');
        px(x + 16, by + 9, 3 + sz, 14, '#E84020');
        px(x + 8, by + 0, 20 + sz, 13, '#A02010');
        px(x + 10, by + 2, 16 + sz, 9, '#C02818');
        px(x + 13, by + 4, 10 + sz, 5, '#F04830');
        // corona/cresta real
        px(x + 8, by - 8, 4, 9, '#E82020');
        px(x + 14, by - 12, 5, 13, '#F83020');
        px(x + 22, by - 8, 4, 9, '#E82020');
        px(x + 15, by - 10, 3, 8, '#F8E060');
        px(x + 10, by - 6, 2, 4, '#F8C040');
        px(x + 23, by - 6, 2, 4, '#F8C040');
        // mirada real
        px(x + 11, by + 4, 6, 5, '#F8C030');
        px(x + sz + 20, by + 4, 6, 5, '#F8C030');
        px(x + 13, by + 6, 3, 3, '#801010');
        px(x + sz + 22, by + 6, 3, 3, '#801010');
        px(x + 14, by + 12, 7, 2, '#E8A020');
        // patas fuertes
        px(x + 10, by + 38 + sz, 5, 7, '#C89020');
        px(x + sz + 21, by + 38 + sz, 5, 7, '#C89020');
        px(x + 8, by + 44 + sz, 8, 2, '#A87018');
        px(x + sz + 20, by + 44 + sz, 8, 2, '#A87018');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 16, by + 22, 34 + sz, 22);
        cx.globalAlpha = 1;
      }
      break;

    case 'flamencero': // Flamencero: diva del flamenco con vestido de fuego y abanico
      {
        const sw = Math.sin(f * 0.18) * 3;
        // giro gracioso: ya no es solo flamingo, ahora es bailaora exagerada con vestido gigante
        // vestido/cuerpo de volantes en forma de campana
        px(x + 6, by + 18, 24 + sz, 10, '#A82020');
        px(x + 4, by + 26, 28 + sz, 9, '#C82838');
        px(x + 2, by + 34, 32 + sz, 8, '#E83020');
        px(x + 5, by + 38, 26 + sz, 5, '#F8A030');
        px(x + 8, by + 20, 18 + sz, 7, '#D83848');
        px(x + 10, by + 28, 14 + sz, 5, '#F06070');
        // lunares cuadrados del vestido
        px(x + 8, by + 29, 3, 3, '#F8E8D0');
        px(x + 20, by + 34, 3, 3, '#F8E8D0');
        px(x + sz + 26, by + 31, 3, 3, '#F8E8D0');
        // cuello y cabeza altiva
        px(x + 15, by + 5, 4, 15, '#C82838');
        px(x + 17, by + 3, 5, 4, '#D83848');
        px(x + 20, by + 1, 10, 8, '#D83848');
        px(x + 22, by + 3, 6, 4, '#F08090');
        px(x + 29, by + 4, 5, 2, '#F0A030');
        px(x + 32, by + 5, 3, 1, '#D88020');
        px(x + 24, by + 3, 3, 3, '#fff');
        px(x + 25, by + 4, 2, 2, '#181818');
        // peineta/flor flamenca gigante
        px(x + 18, by - 5, 5, 5, '#E82020');
        px(x + 23, by - 6, 4, 4, '#F84040');
        px(x + 20, by - 9, 4, 4, '#F8A030');
        // abanico de fuego en un ala y brazo dramático
        px(x - 8, by + 14 + sw, 14, 5, '#E83020');
        px(x - 12, by + 18 + sw, 18, 5, '#F84830');
        px(x - 14, by + 22 + sw, 16, 4, '#F8A030');
        px(x - 10, by + 16 + sw, 2, 10, '#F8E060');
        px(x + sz + 27, by + 15 - sw, 8, 14, '#A82020');
        px(x + sz + 29, by + 17 - sw, 4, 10, '#F84830');
        // tacón visible bajo el vestido
        px(x + 13, by + 41 + sz, 3, 7, '#C89020');
        px(x + 11, by + 47 + sz, 7, 2, '#A87018');
      }
      break;

    case 'alquimero': // Alquímero: salamandra dentro de un caldero andante
      {
        const steam = Math.sin(f * 0.1) * 2;
        // silueta dominada por caldero, no por cuerpo de salamandra
        px(x + 2, by + 21, 30 + sz, 16 + sz, '#2A2A30');
        px(x + 4, by + 23, 26 + sz, 12 + sz, '#3A3A40');
        px(x + 7, by + 20, 20 + sz, 4, '#5A5A60');
        px(x + 8, by + 24, 18 + sz, 3, '#40C040');
        px(x + 10, by + 25, 14 + sz, 2, '#80F080');
        // patas del caldero
        px(x + 5, by + 36 + sz, 5, 5, '#202024');
        px(x + sz + 24, by + 36 + sz, 5, 5, '#202024');
        // salamandra asomándose
        px(x + 8, by + 6, 20 + sz, 14, '#D85018');
        px(x + 10, by + 8, 16 + sz, 10, '#E86828');
        px(x + 12, by + 10, 12 + sz, 6, '#F89040');
        // sombrero alto de alquimista
        px(x + 8, by - 2, 20 + sz, 8, '#4030A0');
        px(x + 10, by - 6, 16 + sz, 5, '#5040B0');
        px(x + 14, by - 9, 8 + sz, 4, '#382080');
        px(x + 16, by - 7, 4, 2, '#F8E830');
        // lentes de laboratorio
        px(x + 9, by + 8, 6, 5, '#C8A830');
        px(x + 10, by + 9, 4, 3, '#D8E8F0');
        px(x + sz + 19, by + 8, 6, 5, '#C8A830');
        px(x + sz + 20, by + 9, 4, 3, '#D8E8F0');
        px(x + 15, by + 10, 4, 1, '#C8A830');
        px(x + 14, by + 17, 5, 2, '#C04818');
        // brazo con cucharón y libro pequeño
        px(x - 5, by + 18, 9, 4, '#D85018');
        px(x - 9, by + 17, 5, 6, '#8A5020');
        px(x + sz + 29, by + 15, 2, 18, '#6A4828');
        px(x + sz + 27, by + 14, 6, 4, '#C8C8C8');
        // vapor pixelado
        cx.globalAlpha = 0.35;
        px(x + 9, by + 14 + steam, 3, 3, '#A0A0A0');
        px(x + 17, by + 10 - steam, 4, 4, '#C0C0C0');
        px(x + 24, by + 13 + steam, 3, 3, '#A0A0A0');
        cx.globalAlpha = 1;
      }
      break;

    case 'piromante': // Piromante: maestro alto con túnica, bastón y salamandra ígnea
      {
        const flame = Math.sin(f * 0.16) * 2;
        // silueta vertical de mago, no salamandra común
        px(x + 8, by + 14, 20 + sz, 27 + sz, '#3828A0');
        px(x + 10, by + 16, 16 + sz, 23 + sz, '#4838B0');
        px(x + 12, by + 18, 12 + sz, 18, '#C04010');
        px(x + 14, by + 20, 8 + sz, 12, '#D85018');
        // mangas largas
        px(x + 2, by + 16, 8, 20, '#2818A0');
        px(x + sz + 27, by + 16, 8, 20, '#2818A0');
        px(x + 4, by + 30, 5, 5, '#C04010');
        // cola de salamandra saliendo de la túnica
        px(x + 5, by + 36 + sz, 12, 4, '#C04010');
        px(x + 2, by + 38 + sz, 5, 3, '#F08030');
        // cabeza/cara de maestro
        px(x + 6, by + 2, 24 + sz, 15, '#C04010');
        px(x + 8, by + 4, 20 + sz, 11, '#D85018');
        px(x + 10, by + 6, 16 + sz, 7, '#F08030');
        // gran sombrero/corona de fuego
        px(x + 4, by - 4, 28 + sz, 6, '#3828A0');
        px(x + 8, by - 10, 20 + sz, 7, '#4838B0');
        px(x + 13, by - 16, 10 + sz, 7, '#2818A0');
        px(x + 5, by - 8, 4, 6, '#E82020');
        px(x + sz + 27, by - 8, 4, 6, '#E82020');
        px(x + 12, by - 18 + flame, 4, 7, '#F8A030');
        px(x + 18, by - 20 + flame, 5, 9, '#F86040');
        // ojos dorados y barba de fuego
        px(x + 9, by + 7, 6, 5, '#F8C030');
        px(x + sz + 21, by + 7, 6, 5, '#F8C030');
        px(x + 11, by + 9, 3, 3, '#801010');
        px(x + sz + 23, by + 9, 3, 3, '#801010');
        px(x + 12, by + 14, 10, 4, '#E86020');
        px(x + 14, by + 18, 6, 4, '#F08030');
        // bastón con llama enorme
        px(x + sz + 35, by + 7, 2, 32, '#5A4020');
        px(x + sz + 32, by + 2 + flame, 8, 6, '#F8A030');
        px(x + sz + 34, by - 2 + flame, 4, 6, '#E82020');
        px(x + sz + 35, by - 4 + flame, 2, 3, '#F8E060');
        // aura pixelada
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 16, by + 20, 20 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'infernotoro': // Infernotoro: toro cuadrúpedo negro con cuernos y cola de fuego
      {
        const flame = Math.sin(f * 0.18) * 2;
        // cuerpo cuadrúpedo negro, ancho y bajo
        px(x - 2, by + 18, 36 + sz, 19 + sz, '#101010');
        px(x + 1, by + 20, 32 + sz, 15 + sz, '#181818');
        px(x + 5, by + 23, 24 + sz, 8, '#242020');
        // lomo ardiente tenue
        px(x + 6, by + 16, 22 + sz, 5, '#501010');
        px(x + 10, by + 15, 14 + sz, 3, '#A82010');
        // cuatro patas fuertes
        px(x + 2, by + 34 + sz, 6, 10, '#101010');
        px(x + 12, by + 35 + sz, 6, 9, '#101010');
        px(x + sz + 23, by + 35 + sz, 6, 9, '#101010');
        px(x + sz + 33, by + 34 + sz, 6, 10, '#101010');
        px(x + 0, by + 43 + sz, 10, 3, '#050505');
        px(x + sz + 32, by + 43 + sz, 10, 3, '#050505');
        // cabeza poderosa al frente
        px(x + 22, by + 7, 17 + sz, 16, '#101010');
        px(x + 24, by + 9, 13 + sz, 12, '#201818');
        px(x + 30, by + 16, 9, 6, '#0A0A0A'); // hocico oscuro
        px(x + 30, by + 18, 2, 2, '#C8A080');
        px(x + 34, by + 18, 2, 2, '#C8A080');
        // cuernos grandes de fuego
        px(x + 15, by + 1, 10, 6, '#E84020');
        px(x + 11, by - 3, 8, 5, '#F8A030');
        px(x + 8, by - 5, 5, 4, '#F8E060');
        px(x + sz + 37, by + 1, 10, 6, '#E84020');
        px(x + sz + 45, by - 3, 8, 5, '#F8A030');
        px(x + sz + 52, by - 5, 5, 4, '#F8E060');
        // ojos encendidos
        px(x + 25, by + 11, 4, 4, '#F8C030');
        px(x + sz + 33, by + 11, 4, 4, '#F8C030');
        px(x + 27, by + 13, 2, 2, '#601010');
        px(x + sz + 35, by + 13, 2, 2, '#601010');
        // cola con punta de llama
        px(x - 10, by + 22, 12, 4, '#101010');
        px(x - 17, by + 17 + flame, 8, 8, '#E84020');
        px(x - 20, by + 13 + flame, 6, 6, '#F8A030');
        px(x - 22, by + 10 + flame, 3, 5, '#F8E060');
        // delantal quemado mínimo para mantener idea chef
        px(x + 12, by + 25, 13, 7, '#D8C8A0');
        px(x + 14, by + 26, 9, 4, '#E0D0B0');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 18, by + 24, 34 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'ajolord': // Ajolord: piel morada, brazos gruesos caídos y picos de hielo
      {
        const droop = Math.sin(f * 0.1) * 1;
        const P1 = '#5A4AA0', P2 = '#6A58B8', P3 = '#8070D0';
        const ICE1 = '#B8E8F8', ICE2 = '#E8F8FF';
        // cuerpo intermedio más morado, preparando la armadura de hielo final
        px(x + 4, by + 18, 24 + sz, 14 + sz, P1);
        px(x + 6, by + 20, 20 + sz, 10 + sz, P2);
        px(x + 8, by + 22, 16 + sz, 6, P3);
        // placas/picos de hielo en hombros y lomo
        px(x + 5, by + 15, 5, 5, ICE1);
        px(x + 13, by + 13, 5, 7, ICE2);
        px(x + sz + 25, by + 15, 5, 5, ICE1);
        px(x + 17, by + 17, 4, 3, '#C8F0F8');
        // brazos gruesos, largos y caídos como adolescente pesado
        px(x - 2, by + 20 + droop, 9, 14, '#4A3C90');
        px(x - 5, by + 29 + droop, 8, 6, '#5A4AA0');
        px(x - 8, by + 33 + droop, 7, 4, '#8070D0');
        px(x + sz + 26, by + 20 - droop, 9, 14, '#4A3C90');
        px(x + sz + 32, by + 29 - droop, 8, 6, '#5A4AA0');
        px(x + sz + 38, by + 33 - droop, 7, 4, '#8070D0');
        // cabeza morada con placas de hielo
        px(x + 4, by + 4, 24 + sz, 16, P1);
        px(x + 6, by + 6, 20 + sz, 12, P2);
        px(x + 8, by + 8, 16 + sz, 8, P3);
        px(x + 10, by + 1, 5, 6, ICE2);
        px(x + 18, by - 2, 5, 9, ICE1);
        px(x + sz + 25, by + 1, 5, 6, ICE2);
        // branquias intermedias congelándose
        px(x - 2, by + 2, 6, 4, '#C8F0F8');
        px(x - 4, by + 6, 6, 4, '#90D0F0');
        px(x - 3, by + 10, 6, 4, '#C8F0F8');
        px(x + sz + 28, by + 2, 6, 4, '#C8F0F8');
        px(x + sz + 30, by + 6, 6, 4, '#90D0F0');
        px(x + sz + 29, by + 10, 6, 4, '#C8F0F8');
        // ojos y cejas frías
        px(x + 8, by + 8, 5, 5, '#E8F8FF');
        px(x + sz + 18, by + 8, 5, 5, '#E8F8FF');
        px(x + 10, by + 10, 3, 3, '#103C88');
        px(x + sz + 20, by + 10, 3, 3, '#103C88');
        px(x + 8, by + 7, 5, 1, '#382878');
        px(x + sz + 18, by + 7, 5, 1, '#382878');
        px(x + 14, by + 16, 5, 1, '#403080');
        // cola lateral y pies
        px(x - 2, by + 30, 10, 4, P1);
        px(x - 7, by + 28, 6, 4, P2);
        px(x - 11, by + 26, 5, 4, ICE1);
        px(x + 6, by + 30 + sz, 5, 4, P1);
        px(x + sz + 20, by + 30 + sz, 5, 4, P1);
      }
      break;

    case 'glaciolote': // Glaciolote: armadura de hielo imponente con piel morada apenas visible
      {
        const frost = Math.sin(f * 0.08) * 1;
        const SKP = '#4A3478';
        // aura fría pixelada detrás para presencia
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#88D0F8';
        pixelGlow(x + 16, by + 20 + frost, 44 + sz, 30);
        cx.globalAlpha = 1;

        // piel morada visible en sombras debajo de la armadura
        px(x - 6, by + 18, 46 + sz, 18 + sz, SKP);
        px(x + 0, by + 25, 36 + sz, 8, '#5A4090');
        // armadura de hielo: placas dominantes
        px(x - 7, by + 16, 47 + sz, 9, '#4F86B0');
        px(x - 3, by + 20, 41 + sz, 12 + sz, '#6FA8D0');
        px(x + 2, by + 22, 34 + sz, 8, '#A8E0F8');
        px(x + 7, by + 24, 24 + sz, 3, '#E8F8F8');
        // placas grandes del lomo
        px(x - 1, by + 11, 7, 9, '#C8F0F8');
        px(x + 8, by + 7, 7, 13, '#E8F8F8');
        px(x + 18, by + 8, 7, 12, '#C8F0F8');
        px(x + sz + 29, by + 12, 7, 8, '#B8E8F8');
        px(x - 14, by + 16, 10, 10, '#E8F8F8');
        px(x + sz + 40, by + 16, 10, 10, '#E8F8F8');

        // cuatro patas con armadura; piel morada apenas en articulaciones
        px(x + 0, by + 31 + sz, 7, 10, '#4F86B0');
        px(x + 10, by + 32 + sz, 7, 10, '#4F86B0');
        px(x + sz + 22, by + 32 + sz, 7, 10, '#4F86B0');
        px(x + sz + 32, by + 31 + sz, 7, 10, '#4F86B0');
        px(x + 2, by + 35 + sz, 3, 3, SKP);
        px(x + sz + 34, by + 35 + sz, 3, 3, SKP);
        px(x - 1, by + 39 + sz, 10, 3, '#E8F8F8');
        px(x + 9, by + 40 + sz, 10, 3, '#E8F8F8');
        px(x + sz + 21, by + 40 + sz, 10, 3, '#E8F8F8');
        px(x + sz + 31, by + 39 + sz, 10, 3, '#E8F8F8');

        // cola pesada de hielo
        px(x - 13, by + 25, 12, 6, '#6FA8D0');
        px(x - 20, by + 22, 8, 6, '#A8E0F8');
        px(x - 24, by + 20, 5, 4, '#E8F8F8');

        // cabeza blindada: morado visible solo en ranuras
        px(x + 2, by + 1, 31 + sz, 18, SKP);
        px(x + 3, by + 0, 31 + sz, 8, '#4F86B0');
        px(x + 4, by + 3, 27 + sz, 14, '#6FA8D0');
        px(x + 7, by + 5, 21 + sz, 9, '#A8E0F8');
        // branquias/cristales laterales grandes
        px(x - 7, by + 3, 8, 5, '#C8F0F8');
        px(x - 10, by + 8, 8, 5, '#90D0F0');
        px(x - 8, by + 13, 8, 5, '#C8F0F8');
        px(x + sz + 34, by + 3, 8, 5, '#C8F0F8');
        px(x + sz + 36, by + 8, 8, 5, '#90D0F0');
        px(x + sz + 35, by + 13, 8, 5, '#C8F0F8');
        // corona de hielo superior
        px(x + 5, by - 5, 5, 7, '#D8F8FF');
        px(x + 13, by - 10, 6, 12, '#E8F8F8');
        px(x + 23, by - 6, 5, 8, '#C8F0F8');
        px(x + 16, by - 13, 3, 5, '#FFFFFF');
        // ojos intensos desde ranuras moradas
        px(x + 7, by + 7, 7, 6, '#D8F0F8');
        px(x + sz + 22, by + 7, 7, 6, '#D8F0F8');
        px(x + 9, by + 9, 4, 4, '#103C88');
        px(x + sz + 24, by + 9, 4, 4, '#103C88');
        px(x + 7, by + 6, 7, 1, '#2F2458');
        px(x + sz + 22, by + 6, 7, 1, '#2F2458');
        // colmillos/placas frontales de hielo
        px(x + 5, by + 15, 6, 10, '#E8F8F8');
        px(x + sz + 27, by + 15, 6, 10, '#E8F8F8');
        px(x + 6, by + 23, 3, 5, '#B8E8F8');
        px(x + sz + 30, by + 23, 3, 5, '#B8E8F8');

        // barba helada más grande e imponente
        px(x + 6, by + 17, 24 + sz, 6, '#E8F8F8');
        px(x + 8, by + 22, 20 + sz, 5, '#C8F0F8');
        px(x + 10, by + 26, 16 + sz, 4, '#A8E0F8');
        px(x + 15, by + 29, 6 + sz, 4, '#E8F8F8');
        px(x + 17, by + 33, 2 + sz, 3, '#FFFFFF');
        if (f % 20 < 10) {
          cx.globalAlpha = 0.55;
          px(x + sz + 33, by + 2 + Math.sin(f * 0.06) * 3, 2, 2, '#E8F8F8');
          px(x - 4, by + 15 + Math.sin(f * 0.08) * 2, 2, 2, '#E8F8F8');
          cx.globalAlpha = 1;
        }
      }
      break;

    case 'medubass': // Medusa con speakers
      {
        const mbhv2 = Math.sin(fr * 0.1) * 3;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#3060E0';
      pixelGlow(x + 16, by + mbhv2 + 20, 20 + sz, 16);
        cx.globalAlpha = 1;
        px(x + 2, by + mbhv2 + 4, 28 + sz, 16, '#2058B0');
        px(x + 4, by + mbhv2 + 6, 24 + sz, 12, '#3078C8');
        px(x + 6, by + mbhv2 + 8, 20 + sz, 8, '#4098E0');
        px(x - 2, by + mbhv2 + 10, 6, 6, '#282828');
        px(x - 1, by + mbhv2 + 11, 4, 4, '#404040');
        px(x + sz + 28, by + mbhv2 + 10, 6, 6, '#282828');
        px(x + sz + 29, by + mbhv2 + 11, 4, 4, '#404040');
        if (f % 12 < 6) {
          cx.globalAlpha = 0.3;
          px(x - 6, by + mbhv2 + 12, 3, 2, '#80C0F0');
          px(x + sz + 34, by + mbhv2 + 12, 3, 2, '#80C0F0');
          cx.globalAlpha = 1;
        }
        px(x + 6, by + mbhv2 + 10, 20 + sz, 4, '#181818');
        px(x + 8, by + mbhv2 + 11, 6, 2, '#30E0E0');
        px(x + sz + 18, by + mbhv2 + 11, 6, 2, '#30E0E0');
        for (let i = 0; i < 6; i++) {
          const ttw2 = Math.sin(f * 0.12 + i) * 3;
          px(
            x + 4 + i * 4,
            by + mbhv2 + 20 + ttw2,
            2,
            12 + (i % 3) * 2,
            '#2050A0'
          );
          if (f % 10 < 5)
            px(
              x + 4 + i * 4,
              by + mbhv2 + 30 + ttw2 + (i % 3) * 2,
              2,
              2,
              '#F8E830'
            );
        }
      }
      break;

    case 'pinzamestre': // Pinzamestre: cangrejo estilista con pinzas gigantes
      {
        const snap = Math.sin(f * 0.16) * 2;
        // cuerpo más pequeño para que las pinzas dominen la silueta
        px(x + 6, by + 22, 24 + sz, 12 + sz, '#B83818');
        px(x + 8, by + 24, 20 + sz, 8 + sz, '#D04828');
        px(x + 12, by + 25, 12 + sz, 4, '#F07040');
        // banda/sombrero de estilista
        px(x + 5, by + 18, 26 + sz, 4, '#4030A0');
        px(x + 7, by + 16, 22 + sz, 4, '#5040B0');
        px(x + 14, by + 17, 8, 2, '#E8C840');
        // ojos
        px(x + 7, by + 10, 6, 5, '#fff');
        px(x + sz + 23, by + 10, 6, 5, '#fff');
        px(x + 9, by + 12, 3, 2, '#181818');
        px(x + sz + 25, by + 12, 3, 2, '#181818');
        // mostacho blanco de maestro estilista
        px(x + 10, by + 15, 6, 2, '#F8F8F8');
        px(x + sz + 20, by + 15, 6, 2, '#F8F8F8');
        px(x + 8, by + 16, 5, 1, '#E8E8E8');
        px(x + sz + 24, by + 16, 5, 1, '#E8E8E8');
        // monóculo/lente estilista
        px(x + sz + 24, by + 9, 7, 6, '#C8A830');
        px(x + sz + 25, by + 10, 5, 4, '#D8E8F0');
        // brazos largos hacia pinzas enormes
        px(x - 5, by + 21 + snap, 10, 5, '#A03018');
        px(x + sz + 31, by + 21 - snap, 10, 5, '#A03018');
        // pinza izquierda enorme tipo tijera
        px(x - 20, by + 12 + snap, 18, 12, '#C8A830');
        px(x - 22, by + 9 + snap, 10, 8, '#D8B840');
        px(x - 22, by + 22 + snap, 10, 8, '#D8B840');
        px(x - 19, by + 11 + snap, 5, 4, '#F0D860');
        px(x - 19, by + 24 + snap, 5, 4, '#F0D860');
        px(x - 10, by + 17 + snap, 8, 3, '#8A6018');
        // pinza derecha enorme tipo tijera
        px(x + sz + 38, by + 12 - snap, 18, 12, '#C8A830');
        px(x + sz + 50, by + 9 - snap, 10, 8, '#D8B840');
        px(x + sz + 50, by + 22 - snap, 10, 8, '#D8B840');
        px(x + sz + 53, by + 11 - snap, 5, 4, '#F0D860');
        px(x + sz + 53, by + 24 - snap, 5, 4, '#F0D860');
        px(x + sz + 38, by + 17 - snap, 8, 3, '#8A6018');
        // peine y tijeras como accesorios
        px(x - 18, by + 5 + snap, 10, 2, '#F0F0F0');
        px(x - 24, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x - 20, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x - 16, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x + sz + 48, by + 5 - snap, 9, 2, '#E8E8E8');
        px(x + sz + 58, by + 3 - snap, 2, 6, '#E8E8E8');
        // patas múltiples
        px(x + 6, by + 31 + sz, 4, 4, '#B83818');
        px(x + 12, by + 32 + sz, 4, 4, '#B83818');
        px(x + 20, by + 32 + sz, 4, 4, '#B83818');
        px(x + sz + 27, by + 31 + sz, 4, 4, '#B83818');
        px(x + 14, by + 29, 6, 2, '#A03818');
      }
      break;

    case 'pinguchef': // Pingüino chef
      px(x + 4, by + 16, 24 + sz, 16 + sz, '#1A1A2A');
      px(x + 6, by + 18, 20 + sz, 12 + sz, '#282838');
      px(x + 10, by + 20, 12 + sz, 10, '#F0F0F0');
      px(x + 8, by + 20, 16 + sz, 10, '#F8F8F8');
      px(x + 10, by + 22, 12 + sz, 6, '#F0F0F0');
      px(x + 6, by + 4, 20 + sz, 14, '#1A1A2A');
      px(x + 10, by + 8, 12 + sz, 6, '#F0F0F0');
      px(x + 8, by + 0, 16 + sz, 6, '#F8F8F8');
      px(x + 10, by - 3, 12 + sz, 5, '#F8F8F8');
      px(x + 12, by - 4, 8 + sz, 3, '#F0F0F0');
      px(x + 10, by + 8, 4, 4, '#fff');
      px(x + sz + 18, by + 8, 4, 4, '#fff');
      px(x + 12, by + 10, 2, 2, '#181818');
      px(x + sz + 20, by + 10, 2, 2, '#181818');
      px(x + 14, by + 12, 4, 3, '#F0A030');
      px(x + sz + 26, by + 18, 2, 12, '#C8C8C8');
      px(x + sz + 25, by + 16, 4, 3, '#5A4020');
      px(x + 10, by + 30 + sz, 4, 4, '#F0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#F0A030');
      break;

    case 'pingumitre': // Pingüino dueño del restaurante
      px(x + 2, by + 14, 28 + sz, 18 + sz, '#0A0A1A');
      px(x + 4, by + 16, 24 + sz, 14 + sz, '#1A1A2A');
      px(x + 10, by + 18, 12 + sz, 12, '#F0F0F0');
      px(x + 6, by + 16, 8, 14, '#0A0A1A');
      px(x + sz + 18, by + 16, 8, 14, '#0A0A1A');
      px(x + 14, by + 18, 4, 2, '#C8A830');
      px(x + 4, by + 2, 24 + sz, 14, '#0A0A1A');
      px(x + 8, by + 6, 16 + sz, 8, '#F0F0F0');
      px(x + 6, by - 4, 20 + sz, 6, '#0A0A1A');
      px(x + 8, by - 8, 16 + sz, 6, '#1A1A2A');
      px(x + 8, by - 3, 16 + sz, 1, '#C8A830');
      px(x + 10, by + 6, 4, 4, '#fff');
      px(x + sz + 18, by + 6, 4, 4, '#fff');
      px(x + 12, by + 8, 2, 2, '#181818');
      px(x + sz + 20, by + 8, 2, 2, '#181818');
      px(x + sz + 17, by + 6, 5, 5, '#C8A830');
      px(x + sz + 18, by + 7, 3, 3, '#D8E8F0');
      px(x + 12, by + 12, 8, 2, '#0A0A1A');
      px(x + 14, by + 14, 4, 2, '#E0A030');
      px(x + sz + 28, by + 10, 2, 20, '#5A4020');
      px(x + sz + 27, by + 8, 4, 3, '#C8A830');
      px(x + 10, by + 30 + sz, 4, 4, '#E0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#E0A030');
      break;

    case 'cosmocardumen': // Tiburón cósmico formado por muchos peces pequeños
      {
        const swim = Math.sin(f * 0.08) * 2;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#3060E0';
        pixelGlow(x + 17, by + swim + 20, 30 + sz, 16);
        cx.globalAlpha = 1;

        // Silueta general de tiburón: cabeza a la derecha, cola a la izquierda,
        // formada por peces rectangulares pequeños.
        const fish = [
          // fila superior/lomo
          [6, 17, 5, 3, 0], [12, 14, 5, 3, 1], [18, 12, 5, 3, 2], [24, 12, 5, 3, 0], [30, 14, 5, 3, 1],
          // cuerpo central ancho
          [3, 22, 5, 3, 1], [9, 20, 5, 3, 2], [15, 18, 5, 3, 0], [21, 18, 5, 3, 1], [27, 19, 5, 3, 2], [33, 21, 5, 3, 0],
          [8, 25, 5, 3, 0], [14, 25, 5, 3, 1], [20, 25, 5, 3, 2], [26, 25, 5, 3, 0], [32, 25, 5, 3, 1],
          // vientre
          [13, 29, 5, 3, 2], [19, 30, 5, 3, 0], [25, 29, 5, 3, 1],
          // cola bífida a la izquierda
          [-4, 16, 5, 3, 2], [0, 19, 5, 3, 0], [-5, 27, 5, 3, 1], [0, 25, 5, 3, 2],
          // aleta dorsal y aletas inferiores
          [21, 7, 5, 3, 2], [23, 5, 4, 3, 1], [18, 34, 5, 3, 0], [28, 33, 5, 3, 2],
        ];
        const cols = ['#2070C0', '#3090E0', '#50B0F0'];
        fish.forEach((a, i) => {
          const fx = x + a[0] + Math.sin(f * 0.035 + i) * 1.5;
          const fy = by + swim + a[1] + Math.cos(f * 0.04 + i) * 1;
          cx.fillStyle = cols[a[4]];
          cx.fillRect(fx, fy, a[2], a[3]);
          // puntito-ojo/escama clara de cada pez
          cx.fillStyle = '#E8F8FF';
          cx.fillRect(fx + a[2] - 1, fy + 1, 1, 1);
          // colita pixelada
          cx.fillStyle = a[4] === 2 ? '#2070C0' : '#1858A0';
          cx.fillRect(fx - 2, fy + 1, 2, 1);
        });

        // Cabeza del tiburón/cardumen: más compacta a la derecha
        px(x + 36, by + swim + 18, 8, 10, '#2070C0');
        px(x + 39, by + swim + 20, 7, 6, '#3090E0');
        px(x + 44, by + swim + 22, 4, 3, '#50B0F0'); // hocico
        px(x + 40, by + swim + 20, 3, 3, '#fff');
        px(x + 42, by + swim + 21, 1, 1, '#101848');
        // boca de tiburón en zigzag pixelado
        px(x + 41, by + swim + 27, 8, 1, '#101848');
        px(x + 43, by + swim + 28, 2, 1, '#F8F8F8');
        px(x + 47, by + swim + 28, 2, 1, '#F8F8F8');

        // Estrellas orbitales cuadradas para mantener la idea cósmica
        cx.globalAlpha = 0.65;
        const sa = f * 0.02;
        px(x + 16 + Math.cos(sa) * 20, by + swim + 17 + Math.sin(sa) * 10, 2, 2, '#F8E830');
        px(x + 22 + Math.cos(sa + 3.14) * 18, by + swim + 23 + Math.sin(sa + 3.14) * 9, 2, 2, '#F8F8C0');
        cx.globalAlpha = 1;
      }
      break;

    // ==========================================
    // EVOLUCIONES PLANTA 🌿
    // ==========================================

    case 'hedroble': // Hedroble: cabra butler alta con monóculo, bastón y cola de frac
      {
        const cane = Math.sin(f * 0.1) * 1;
        // cuerpo más alto y bípedo para diferenciarlo del cabrito
        px(x + 10, by + 19, 16 + sz, 20 + sz, '#253020'); // frac oscuro
        px(x + 12, by + 20, 12 + sz, 17 + sz, '#304028');
        px(x + 14, by + 21, 8 + sz, 12, '#F0F0E8'); // pechera blanca
        px(x + 15, by + 24, 2, 2, '#202020');
        px(x + 19, by + 27, 2, 2, '#202020');
        px(x + 10, by + 34 + sz, 5, 8, '#253020');
        px(x + sz + 21, by + 34 + sz, 5, 8, '#253020');
        px(x + 8, by + 40 + sz, 7, 2, '#101018');
        px(x + sz + 21, by + 40 + sz, 7, 2, '#101018');
        // cola de frac
        px(x + 8, by + 30, 5, 10, '#182018');
        px(x + sz + 24, by + 30, 5, 10, '#182018');
        // cabeza más seria
        px(x + 7, by + 4, 22 + sz, 16, '#8FB070');
        px(x + 9, by + 6, 18 + sz, 12, '#B8D098');
        px(x + 5, by + 6, 5, 8, '#608048');
        px(x + sz + 27, by + 6, 5, 8, '#608048');
        // grandes cuernos curvos tipo butler elegante
        px(x + 4, by - 1, 7, 4, '#D8D0B0');
        px(x + 2, by - 3, 5, 3, '#F0E8C8');
        px(x + sz + 26, by - 1, 7, 4, '#D8D0B0');
        px(x + sz + 31, by - 3, 5, 3, '#F0E8C8');
        px(x + 12, by + 9, 4, 4, '#fff');
        px(x + 14, by + 11, 2, 2, '#203010');
        // monóculo enorme y cadena
        px(x + sz + 19, by + 9, 6, 6, '#C8A830');
        px(x + sz + 20, by + 10, 4, 4, '#D8E8F0');
        px(x + sz + 24, by + 15, 1, 9, '#C8A830');
        px(x + sz + 23, by + 22, 2, 2, '#C8A830');
        px(x + 14, by + 17, 7, 2, '#506838');
        // bigotito vegetal
        px(x + 11, by + 16, 4, 2, '#2F7A30');
        px(x + 20, by + 16, 4, 2, '#2F7A30');
        // bastón
        px(x + sz + 31, by + 18 + cane, 2, 24, '#6A4828');
        px(x + sz + 29, by + 16 + cane, 6, 4, '#C8A830');
      }
      break;

    case 'gorilirico': // Gorilírico: bardo erguido con laúd y capa
      {
        const strum = Math.sin(f * 0.15) * 2;
        // postura erguida, más alta y delgada que Gorilán
        px(x + 9, by + 19, 18 + sz, 20 + sz, '#305820');
        px(x + 11, by + 21, 14 + sz, 16 + sz, '#407028');
        px(x + 13, by + 23, 10 + sz, 10, '#508038');
        // capa morada de bardo
        px(x + 6, by + 20, 5, 18, '#4A2870');
        px(x + sz + 26, by + 20, 5, 18, '#4A2870');
        px(x + 7, by + 22, 3, 14, '#6830A0');
        px(x + sz + 27, by + 22, 3, 14, '#6830A0');
        // piernas firmes
        px(x + 9, by + 36 + sz, 6, 8, '#305820');
        px(x + sz + 21, by + 36 + sz, 6, 8, '#305820');
        px(x + 7, by + 43 + sz, 8, 2, '#203818');
        px(x + sz + 21, by + 43 + sz, 8, 2, '#203818');
        // laúd/libro musical al frente: silueta nueva
        px(x - 7, by + 24 + strum, 10, 10, '#8A5020');
        px(x - 5, by + 26 + strum, 6, 6, '#C08038');
        px(x + 1, by + 22 + strum, 10, 2, '#E8D8C0');
        px(x + 5, by + 20 + strum, 2, 8, '#E8D8C0');
        px(x - 2, by + 26 + strum, 2, 2, '#4A2810');
        // brazo tocando
        px(x + 1, by + 20 + strum, 8, 4, '#305820');
        px(x + sz + 25, by + 20 - strum, 8, 5, '#305820');
        px(x + sz + 31, by + 18 - strum, 3, 10, '#407028');
        // cabeza con boina, más adulta
        px(x + 5, by + 2, 26 + sz, 17, '#305820');
        px(x + 7, by + 4, 22 + sz, 13, '#407028');
        px(x + 11, by + 7, 14 + sz, 8, '#5C9440');
        px(x + 4, by - 2, 28 + sz, 5, '#C8A830');
        px(x + 7, by - 4, 22 + sz, 3, '#D8B840');
        px(x + sz + 25, by - 8, 2, 8, '#E8D8C0');
        px(x + sz + 26, by - 10, 5, 4, '#F0E8D0');
        // ojos confiados
        px(x + 9, by + 8, 5, 5, '#fff');
        px(x + sz + 21, by + 8, 5, 5, '#fff');
        px(x + 11, by + 10, 3, 3, '#2A3818');
        px(x + sz + 23, by + 10, 3, 3, '#2A3818');
        px(x + 13, by + 16, 8, 3, '#2A4018');
      }
      break;

    case 'gorilegend': // Gorilegend: gigante legendario con pergaminos flotantes
      {
        const aura = Math.sin(f * 0.08) * 2;
        // cuerpo enorme tipo estatua: mucho más grande/ancho que etapas previas
        px(x - 2, by + 15, 36 + sz, 24 + sz, '#284818');
        px(x + 0, by + 17, 32 + sz, 20 + sz, '#386028');
        px(x + 7, by + 20, 18 + sz, 14, '#4A8030');
        px(x + 10, by + 22, 12 + sz, 8, '#609840');
        // hombreras/masa superior enorme
        px(x - 6, by + 13, 12, 20, '#284818');
        px(x + sz + 29, by + 13, 12, 20, '#284818');
        px(x - 4, by + 15, 8, 16, '#386028');
        px(x + sz + 31, by + 15, 8, 16, '#386028');
        // brazos largos de gorila apoyados al piso
        px(x - 10, by + 22, 10, 21, '#284818');
        px(x + sz + 37, by + 22, 10, 21, '#284818');
        px(x - 12, by + 40, 12, 5, '#203818');
        px(x + sz + 37, by + 40, 12, 5, '#203818');
        // piernas pesadas
        px(x + 4, by + 36 + sz, 8, 9, '#284818');
        px(x + sz + 23, by + 36 + sz, 8, 9, '#284818');
        px(x + 2, by + 44 + sz, 12, 3, '#203818');
        px(x + sz + 22, by + 44 + sz, 12, 3, '#203818');
        // pecho como libro dorado/legendario
        px(x + 6, by + 18, 22 + sz, 10, '#5A3818');
        px(x + 8, by + 20, 18 + sz, 6, '#6A4828');
        px(x + 13, by + 20, 2, 6, '#F8E830');
        px(x + 20, by + 21, 2, 5, '#F8E830');
        px(x + 25, by + 20, 2, 6, '#F8E830');
        // cabeza grande con corona de laureles
        px(x + 2, by - 1, 30 + sz, 18, '#284818');
        px(x + 4, by + 1, 26 + sz, 14, '#386028');
        px(x + 8, by + 4, 18 + sz, 9, '#5C9440');
        px(x + 3, by - 7, 28 + sz, 5, '#C8A830');
        px(x + 6, by - 9, 22 + sz, 3, '#D8B840');
        px(x + 11, by - 11, 12 + sz, 3, '#E8C840');
        px(x + 4, by - 5, 3, 3, '#48A030');
        px(x + sz + 29, by - 5, 3, 3, '#48A030');
        // ojos dorados sabios
        px(x + 6, by + 5, 7, 6, '#fff');
        px(x + sz + 23, by + 5, 7, 6, '#fff');
        px(x + 8, by + 7, 4, 4, '#1A3010');
        px(x + sz + 25, by + 7, 4, 4, '#1A3010');
        px(x + 8, by + 7, 2, 2, '#C8A830');
        px(x + sz + 25, by + 7, 2, 2, '#C8A830');
        px(x + 12, by + 13, 10, 4, '#1A3010');
        px(x + 14, by + 15, 6, 2, '#284818');
        // pergaminos flotantes a los lados
        cx.globalAlpha = 0.85;
        px(x - 18, by + 17 + aura, 10, 13, '#F0E0C0');
        px(x - 17, by + 18 + aura, 8, 2, '#B09070');
        px(x - 17, by + 23 + aura, 8, 2, '#B09070');
        px(x + sz + 46, by + 13 - aura, 10, 15, '#F0E0C0');
        px(x + sz + 47, by + 15 - aura, 8, 2, '#B09070');
        px(x + sz + 47, by + 21 - aura, 8, 2, '#B09070');
        cx.globalAlpha = 1;
        // aura pixelada sutil
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#80F080';
        pixelGlow(x + 16, by + 20, 28 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'mantisdanza': // Mantis con tutú elaborado
      {
        const mdhv2 = Math.sin(fr * 0.1) * 2;
        px(x + 10, by + mdhv2 + 14, 12 + sz, 18 + sz, '#389030');
        px(x + 12, by + mdhv2 + 16, 8 + sz, 14 + sz, '#48A040');
        px(x + 2, by + mdhv2 + 20, 28 + sz, 6, '#F078A0');
        px(x + 4, by + mdhv2 + 22, 24 + sz, 4, '#F898C0');
        px(x + 6, by + mdhv2 + 18, 6, 4, '#E868A0');
        px(x + sz + 20, by + mdhv2 + 18, 6, 4, '#E868A0');
        px(x + 8, by + mdhv2 + 24, 16 + sz, 2, '#F8B8D0');
        px(x + 2, by + mdhv2 + 20, 3, 3, '#F8E830');
        px(x + sz + 27, by + mdhv2 + 20, 3, 3, '#88B8F0');
        const oaf2 = Math.sin(f * 0.1) * 3;
        px(x, by + mdhv2 + 10 + oaf2, 10, 2, '#389030');
        px(x - 2, by + mdhv2 + 8 + oaf2, 4, 3, '#48A040');
        px(x + sz + 22, by + mdhv2 + 8 - oaf2, 10, 2, '#389030');
        px(x + sz + 30, by + mdhv2 + 6 - oaf2, 4, 3, '#48A040');
        px(x + 6, by + mdhv2 + 2, 20 + sz, 12, '#389030');
        px(x + 8, by + mdhv2 + 4, 16 + sz, 8, '#48A040');
        px(x + 8, by + mdhv2, 16 + sz, 3, '#F088A8');
        px(x + 12, by + mdhv2 - 1, 2, 2, '#F8E830');
        px(x + sz + 18, by + mdhv2 - 1, 2, 2, '#88B8F0');
        px(x + 8, by + mdhv2 + 4, 5, 5, '#D8F098');
        px(x + sz + 18, by + mdhv2 + 4, 5, 5, '#D8F098');
        px(x + 10, by + mdhv2 + 6, 3, 3, '#1A3010');
        px(x + sz + 20, by + mdhv2 + 6, 3, 3, '#1A3010');
        px(x + 12, by + mdhv2 + 30 + sz, 2, 8, '#389030');
        px(x + 18, by + mdhv2 + 30 + sz, 2, 8, '#389030');
        px(x + 10, by + mdhv2 + 36 + sz, 6, 2, '#F078A0');
        px(x + 16, by + mdhv2 + 36 + sz, 6, 2, '#F078A0');
      }
      break;

    case 'espinarcor': // Espinarcor: etapa intermedia, carnero punk juvenil con chaqueta
      {
        const step = Math.sin(f * 0.14) * 1;
        px(x + 5, by + 21 + step, 24 + sz, 14 + sz, '#305820');
        px(x + 7, by + 23 + step, 20 + sz, 10 + sz, '#406028');
        px(x + 10, by + 25 + step, 14 + sz, 6, '#508038');
        px(x + 5, by + 19 + step, 24 + sz, 7, '#111820');
        px(x + 8, by + 20 + step, 18 + sz, 4, '#253030');
        px(x + 8, by + 20 + step, 2, 2, '#C8A830');
        px(x + 15, by + 20 + step, 2, 2, '#C8A830');
        px(x + sz + 23, by + 20 + step, 2, 2, '#C8A830');
        px(x + 8, by + 7 + step, 22 + sz, 15, '#305820');
        px(x + 10, by + 9 + step, 18 + sz, 11, '#406028');
        px(x + 13, by + 12 + step, 12 + sz, 6, '#5C8840');
        px(x + 3, by + 4 + step, 8, 6, '#2A4818');
        px(x, by + 3 + step, 5, 3, '#D8B840');
        px(x + sz + 28, by + 4 + step, 8, 6, '#2A4818');
        px(x + sz + 34, by + 3 + step, 5, 3, '#D8B840');
        px(x + 11, by + 4 + step, 16 + sz, 4, '#38A020');
        px(x + 14, by + 1 + step, 10 + sz, 4, '#48C030');
        px(x + 18, by - 2 + step, 4 + sz, 3, '#A8D860');
        px(x + 7, by + 33 + sz + step, 6, 7, '#305820');
        px(x + 18, by + 34 + sz - step, 6, 6, '#305820');
        px(x + sz + 25, by + 33 + sz + step, 6, 7, '#305820');
        px(x + 5, by + 39 + sz + step, 8, 2, '#2A2018');
        px(x + sz + 25, by + 39 + sz + step, 8, 2, '#2A2018');
        px(x + 12, by + 13 + step, 5, 4, '#fff');
        px(x + sz + 22, by + 13 + step, 5, 4, '#fff');
        px(x + 14, by + 14 + step, 3, 2, '#203010');
        px(x + sz + 24, by + 14 + step, 3, 2, '#203010');
        px(x + 15, by + 19 + step, 7, 1, '#203010');
        px(x + 3, by + 24 + step, 3, 4, '#A8D860');
        px(x + sz + 31, by + 24 + step, 3, 4, '#A8D860');
      }
      break;

    case 'espinardoom': // Espinardoom: bestia heavy metal, enorme y frontal
      {
        const pulse = Math.sin(f * 0.12) * 2;
        px(x - 3, by + 18, 38 + sz, 22 + sz, '#223018');
        px(x + 0, by + 20, 32 + sz, 18 + sz, '#385028');
        px(x + 4, by + 22, 24 + sz, 12, '#486838');
        px(x + 3, by + 17, 28 + sz, 12, '#050510');
        px(x + 6, by + 19, 22 + sz, 8, '#151520');
        px(x + 11, by + 20, 10 + sz, 5, '#E8E8E8');
        px(x + 13, by + 21, 2, 2, '#181818');
        px(x + 18, by + 21, 2, 2, '#181818');
        px(x - 10, by + 17, 10, 16, '#1A2818');
        px(x + sz + 35, by + 17, 10, 16, '#1A2818');
        px(x - 12, by + 14, 6, 6, '#A8A8A8');
        px(x + sz + 43, by + 14, 6, 6, '#A8A8A8');
        px(x - 13, by + 14, 3, 3, '#E8E8E8');
        px(x + sz + 47, by + 14, 3, 3, '#E8E8E8');
        px(x + 0, by + 0, 32 + sz, 18, '#223018');
        px(x + 2, by + 2, 28 + sz, 14, '#385028');
        px(x + 6, by + 5, 20 + sz, 9, '#486838');
        px(x - 8, by - 6, 12, 11, '#223018');
        px(x - 12, by - 9, 8, 7, '#486828');
        px(x - 14, by - 10, 4, 4, '#A8A8A8');
        px(x + sz + 31, by - 6, 12, 11, '#223018');
        px(x + sz + 39, by - 9, 8, 7, '#486828');
        px(x + sz + 45, by - 10, 4, 4, '#A8A8A8');
        px(x + 8, by - 8 + pulse, 18 + sz, 8, '#38A020');
        px(x + 11, by - 11 + pulse, 12 + sz, 6, '#48C030');
        px(x + 14, by - 14 + pulse, 6 + sz, 5, '#A8D860');
        px(x + 6, by + 6, 7, 6, '#fff');
        px(x + sz + 22, by + 6, 7, 6, '#fff');
        px(x + 8, by + 8, 4, 3, '#111810');
        px(x + sz + 24, by + 8, 4, 3, '#111810');
        px(x + 7, by + 5, 7, 1, '#050510');
        px(x + sz + 22, by + 5, 7, 1, '#050510');
        px(x + 11, by + 14, 11, 3, '#111810');
        px(x + 14, by + 15, 2, 1, '#E8E8E8');
        px(x + 19, by + 15, 2, 1, '#E8E8E8');
        // ramas en las manos como baquetas de batería
        px(x - 16, by + 20 + pulse, 16, 2, '#6A4828');
        px(x - 18, by + 18 + pulse, 4, 3, '#8A5A28');
        px(x + sz + 35, by + 20 - pulse, 16, 2, '#6A4828');
        px(x + sz + 49, by + 18 - pulse, 4, 3, '#8A5A28');
        px(x - 3, by + 18, 5, 5, '#223018');
        px(x + sz + 33, by + 18, 5, 5, '#223018');
        px(x + 4, by + 38 + sz, 8, 8, '#223018');
        px(x + sz + 24, by + 38 + sz, 8, 8, '#223018');
        px(x + 2, by + 45 + sz, 11, 3, '#151510');
        px(x + sz + 23, by + 45 + sz, 11, 3, '#151510');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + 20, 26 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'wyvernax': // Wyvernax: adolescente imponente, morado con armadura negra y venas verdes
      {
        const flap = Math.sin(f * 0.16) * 4;
        // cuerpo robusto en pose de ataque, morado aún presente
        px(x + 0, by + 20, 34 + sz, 15 + sz, '#2C126E');
        px(x + 3, by + 22, 28 + sz, 11 + sz, '#4828B0');
        px(x + 8, by + 24, 18 + sz, 6, '#6840C0');
        // placas negras parciales
        px(x + 4, by + 19, 10, 5, '#08080C');
        px(x + 20, by + 28, 10, 5, '#08080C');
        px(x + 13, by + 22, 8, 3, '#141018');
        // cola látigo con espina verde
        px(x - 12, by + 25, 16, 5, '#1C1028');
        px(x - 18, by + 22, 8, 4, '#08080C');
        px(x - 21, by + 20, 4, 4, '#1ED060');
        // alas más grandes, negras en bordes y moradas en interior
        px(x - 18, by + 5 + flap, 24, 10, '#08080C');
        px(x - 24, by + 15 + flap, 30, 9, '#141018');
        px(x - 18, by + 22 + flap, 22, 7, '#2A1668');
        px(x + 2, by + 10 + flap, 7, 17, '#4828B0');
        px(x + sz + 30, by + 5 - flap, 24, 10, '#08080C');
        px(x + sz + 30, by + 15 - flap, 30, 9, '#141018');
        px(x + sz + 32, by + 22 - flap, 22, 7, '#2A1668');
        px(x + sz + 29, by + 10 - flap, 7, 17, '#4828B0');
        // venas verdes de poder
        px(x - 12, by + 16 + flap, 16, 2, '#1ED060');
        px(x + sz + 36, by + 16 - flap, 16, 2, '#1ED060');
        px(x - 8, by + 24 + flap, 10, 2, '#2AF078');
        px(x + sz + 38, by + 24 - flap, 10, 2, '#2AF078');
        // cuello y cabeza agresiva
        px(x + 22, by + 9, 8 + sz, 15, '#2C126E');
        px(x + 25, by + 6, 16 + sz, 13, '#4828B0');
        px(x + 28, by + 8, 12 + sz, 9, '#6840C0');
        px(x + 31, by + 11, 8, 4, '#141018');
        // cuernos afilados negros con verde
        px(x + 24, by - 1, 5, 8, '#08080C');
        px(x + sz + 39, by - 1, 5, 8, '#08080C');
        px(x + 23, by - 4, 3, 4, '#1ED060');
        px(x + sz + 43, by - 4, 3, 4, '#1ED060');
        // ojos amenazantes
        px(x + 30, by + 10, 6, 5, '#74FF80');
        px(x + sz + 39, by + 10, 6, 5, '#74FF80');
        px(x + 32, by + 12, 4, 2, '#001008');
        px(x + sz + 41, by + 12, 4, 2, '#001008');
        px(x + 31, by + 18, 9, 2, '#2AF078');
        // patas y garras
        px(x + 6, by + 32 + sz, 8, 8, '#2C126E');
        px(x + sz + 25, by + 32 + sz, 8, 8, '#2C126E');
        px(x + 3, by + 39 + sz, 6, 3, '#1ED060');
        px(x + sz + 31, by + 39 + sz, 6, 3, '#1ED060');
      }
      break;

    case 'wyvernlord': // Wyvernlord: dragón negro imponente, pecho morado y energía verde
      {
        const flap = Math.sin(f * 0.12) * 4;
        // alas colosales negras, silueta de jefe
        px(x - 34, by + 0 + flap, 42, 12, '#050508');
        px(x - 42, by + 12 + flap, 50, 12, '#0A0810');
        px(x - 38, by + 24 + flap, 42, 10, '#141018');
        px(x - 28, by + 33 + flap, 28, 7, '#201828');
        px(x + sz + 30, by + 0 - flap, 42, 12, '#050508');
        px(x + sz + 30, by + 12 - flap, 50, 12, '#0A0810');
        px(x + sz + 36, by + 24 - flap, 42, 10, '#141018');
        px(x + sz + 42, by + 33 - flap, 28, 7, '#201828');
        // venas verdes como grietas de energía
        px(x - 26, by + 12 + flap, 24, 2, '#1ED060');
        px(x - 21, by + 26 + flap, 18, 2, '#2AF078');
        px(x + sz + 45, by + 12 - flap, 24, 2, '#1ED060');
        px(x + sz + 45, by + 26 - flap, 18, 2, '#2AF078');
        px(x - 6, by + 6 + flap, 4, 23, '#1ED060');
        px(x + sz + 40, by + 6 - flap, 4, 23, '#1ED060');
        // cuerpo negro pesado
        px(x + 2, by + 18, 32 + sz, 21 + sz, '#050508');
        px(x + 5, by + 21, 26 + sz, 16 + sz, '#0A0810');
        // pecho morado conservado y visible
        px(x + 10, by + 23, 16 + sz, 11, '#4828B0');
        px(x + 13, by + 25, 10 + sz, 7, '#6840C0');
        px(x + 16, by + 27, 5, 3, '#1ED060');
        // cuello y cabeza de dragón imponente
        px(x + 13, by + 6, 9 + sz, 16, '#050508');
        px(x + 16, by + 4, 4 + sz, 17, '#201828');
        px(x + 4, by - 4, 28 + sz, 16, '#050508');
        px(x + 7, by - 1, 22 + sz, 11, '#141018');
        px(x + 10, by + 2, 16 + sz, 7, '#302040');
        // cuernos/corona enormes
        px(x + 0, by - 12, 8, 11, '#050508');
        px(x + sz + 30, by - 12, 8, 11, '#050508');
        px(x + 6, by - 17, 22 + sz, 5, '#101010');
        px(x + 12, by - 21, 10 + sz, 4, '#1ED060');
        px(x + 2, by - 15, 4, 4, '#2AF078');
        px(x + sz + 32, by - 15, 4, 4, '#2AF078');
        // ojos verdes, mandíbula y colmillos
        px(x + 8, by + 3, 7, 6, '#74FF80');
        px(x + sz + 24, by + 3, 7, 6, '#74FF80');
        px(x + 10, by + 5, 5, 3, '#001008');
        px(x + sz + 26, by + 5, 5, 3, '#001008');
        px(x + 12, by + 11, 11, 3, '#050508');
        px(x + 14, by + 14, 2, 3, '#F8F8F8');
        px(x + 21, by + 14, 2, 3, '#F8F8F8');
        px(x + 16, by + 13, 5, 2, '#2AF078');
        // garras negras con uñas verdes
        px(x + 4, by + 37 + sz, 9, 9, '#0A0810');
        px(x + sz + 26, by + 37 + sz, 9, 9, '#0A0810');
        px(x + 0, by + 44 + sz, 8, 3, '#1ED060');
        px(x + sz + 33, by + 44 + sz, 8, 3, '#1ED060');
        // aura verde ominosa
        cx.globalAlpha = 0.1;
        cx.fillStyle = '#1ED060';
        pixelGlow(x + 16, by + 18, 48 + sz, 28);
        cx.globalAlpha = 1;
      }
      break;

    case 'longwok': // Lóngwok: dragón chef serpentino enrollado en un wok gigante
      {
        const steam = Math.sin(f * 0.12) * 2;
        // Wok gigante como base/silueta principal
        px(x - 2, by + 24, 38 + sz, 12 + sz, '#303038');
        px(x + 0, by + 26, 34 + sz, 8 + sz, '#484850');
        px(x + 4, by + 24, 26 + sz, 4, '#707078');
        px(x - 8, by + 27, 8, 3, '#202028');
        px(x + sz + 34, by + 27, 8, 3, '#202028');
        // fuego bajo el wok
        if (f % 16 < 8) {
          px(x + 8, by + 36 + sz, 5, 5, '#E84020');
          px(x + 15, by + 38 + sz, 6, 5, '#F8A030');
          px(x + 24, by + 36 + sz, 5, 5, '#E84020');
        }
        // cuerpo serpentino saliendo/enrollado alrededor del wok
        px(x + 5, by + 20, 25 + sz, 5, '#B02828');
        px(x + 1, by + 17, 22 + sz, 5, '#C83838');
        px(x + 10, by + 14, 23 + sz, 5, '#B02828');
        px(x + 18, by + 11, 15 + sz, 5, '#D84848');
        // panza blanca de dragón oriental
        px(x + 9, by + 21, 16 + sz, 2, '#F8F8F8');
        px(x + 7, by + 18, 13 + sz, 2, '#F0F0F0');
        px(x + 15, by + 15, 12 + sz, 2, '#F8F8F8');
        // cabeza chef sobre el wok
        px(x + 6, by + 2, 22 + sz, 14, '#B02828');
        px(x + 8, by + 4, 18 + sz, 10, '#C83838');
        px(x + 10, by + 6, 14 + sz, 6, '#D84848');
        // gorro chef más grande
        px(x + 6, by - 6, 22 + sz, 7, '#F8F8F8');
        px(x + 9, by - 10, 16 + sz, 6, '#FFFFFF');
        px(x + 12, by - 13, 10 + sz, 4, '#F0F0F0');
        // bigotes/fideos largos
        px(x - 4, by + 11, 12, 2, '#F8F8F8');
        px(x + sz + 25, by + 11, 12, 2, '#F8F8F8');
        px(x - 8, by + 14, 10, 1, '#E8E8E8');
        px(x + sz + 33, by + 14, 10, 1, '#E8E8E8');
        // ojos y cejas de maestro cocinero
        px(x + 10, by + 7, 5, 5, '#fff');
        px(x + sz + 20, by + 7, 5, 5, '#fff');
        px(x + 12, by + 9, 3, 3, '#881818');
        px(x + sz + 22, by + 9, 3, 3, '#881818');
        px(x + 10, by + 6, 5, 1, '#881818');
        px(x + sz + 20, by + 6, 5, 1, '#881818');
        // cucharón y verduras al vuelo
        px(x + sz + 31, by + 10, 2, 18, '#5A4020');
        px(x + sz + 29, by + 8, 6, 4, '#C8C8C8');
        px(x + 16, by + 20 + steam, 3, 3, '#48A030');
        px(x + 23, by + 18 - steam, 3, 3, '#E8C830');
        px(x + 12, by + 17 + steam, 3, 3, '#F0E0C0');
        // vapor cuadrado
        cx.globalAlpha = 0.35;
        px(x + 8, by - 1 + steam, 3, 3, '#E8E8E8');
        px(x + 28, by + 1 - steam, 3, 3, '#F8F8F8');
        px(x + 20, by - 4 + steam, 2, 2, '#F0F0F0');
        cx.globalAlpha = 1;
      }
      break;

    case 'ornishadow': // Ornitorrinco con gadgets
      px(x + 4, by + 18, 24 + sz, 14 + sz, '#308088');
      px(x + 6, by + 20, 20 + sz, 10 + sz, '#409098');
      px(x + 4, by + 16, 24 + sz, 16, '#2A2A3A');
      px(x + 6, by + 18, 20 + sz, 12, '#3A3A4A');
      px(x + 6, by + 28, 20 + sz, 2, '#383838');
      px(x + 8, by + 27, 3, 3, '#C8A830');
      px(x + 14, by + 27, 3, 3, '#C8A830');
      px(x + 20, by + 27, 3, 3, '#C8A830');
      px(x + 4, by + 4, 24 + sz, 14, '#308088');
      px(x + 6, by + 6, 20 + sz, 10, '#409098');
      px(x + 8, by + 8, 16 + sz, 4, '#C03030');
      px(x + 10, by + 9, 12 + sz, 2, '#E05050');
      px(x + 4, by + 0, 24 + sz, 6, '#2A2A3A');
      px(x + 8, by - 2, 16 + sz, 4, '#3A3A4A');
      px(x + 16, by - 3, 4, 2, '#30E030');
      px(x + 10, by + 14, 12 + sz, 4, '#D89020');
      px(x, by + 18, 4, 8, '#2A2A3A');
      px(x + sz + 28, by + 18, 4, 8, '#2A2A3A');
      px(x + 1, by + 20, 2, 2, '#30E030');
      px(x + sz + 29, by + 20, 2, 2, '#E03030');
      px(x + 8, by + 30 + sz, 5, 4, '#D89020');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#D89020');
      break;

    case 'ornisagent': // Ornitorrinco agente elite
      px(x + 2, by + 16, 28 + sz, 16 + sz, '#205868');
      px(x + 4, by + 18, 24 + sz, 12 + sz, '#306878');
      px(x + 4, by + 14, 24 + sz, 18, '#1A1A2A');
      px(x + 6, by + 16, 20 + sz, 14, '#2A2A3A');
      px(x + 12, by + 18, 8 + sz, 8, '#F0F0F0');
      px(x + 15, by + 18, 2, 8, '#C03030');
      px(x + 4, by + 2, 24 + sz, 14, '#205868');
      px(x + 6, by + 4, 20 + sz, 10, '#306878');
      px(x + 8, by + 6, 6, 5, '#0A0A1A');
      px(x + sz + 18, by + 6, 6, 5, '#0A0A1A');
      px(x + 9, by + 7, 4, 3, '#303040');
      px(x + sz + 19, by + 7, 4, 3, '#303040');
      px(x + 14, by + 8, sz + 4, 1, '#0A0A1A');
      px(x + 2, by + 0, 28 + sz, 4, '#0A0A1A');
      px(x + 6, by - 3, 20 + sz, 5, '#1A1A2A');
      px(x + 8, by - 1, 16 + sz, 1, '#C8A830');
      px(x + 10, by + 12, 12 + sz, 4, '#D89020');
      px(x + sz + 28, by + 20, 6, 3, '#484858');
      px(x + sz + 32, by + 18, 2, 6, '#585868');
      px(x + 8, by + 30 + sz, 5, 4, '#D89020');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#D89020');
      cx.globalAlpha = 0.04;
      cx.fillStyle = '#3060A0';
      pixelGlow(x + 16, by + 20, 18 + sz, 14);
      cx.globalAlpha = 1;
      break;

    case 'serpentboss': // Serpentboss: cobra mafiosa con capucha y puro
      {
        const sway = Math.sin(f * 0.1) * 2;
        // cuerpo serpentino enrollado como base
        px(x + 6, by + 31, 24 + sz, 5, '#1A1A48');
        px(x + 2, by + 35, 24 + sz, 5, '#282858');
        px(x + 10, by + 39, 20 + sz, 4, '#1A1A48');
        px(x + 22, by + 42, 12 + sz, 3, '#101030');
        // torso erguido de cobra
        px(x + 14, by + 14 + sway, 7 + sz, 20, '#1A1A48');
        px(x + 16, by + 14 + sway, 3 + sz, 20, '#383878');
        px(x + 17, by + 18 + sway, 2 + sz, 14, '#C83030'); // panza/corbata roja
        // capucha de cobra amplia
        px(x + 4, by + 4 + sway, 30 + sz, 18, '#101030');
        px(x + 6, by + 6 + sway, 26 + sz, 14, '#1A1A48');
        px(x + 9, by + 8 + sway, 20 + sz, 10, '#282858');
        px(x + 6, by + 12 + sway, 6, 10, '#383878');
        px(x + sz + 27, by + 12 + sway, 6, 10, '#383878');
        // marcas de cobra
        px(x + 7, by + 10 + sway, 4, 4, '#C8A830');
        px(x + sz + 29, by + 10 + sway, 4, 4, '#C8A830');
        px(x + 8, by + 11 + sway, 2, 2, '#100838');
        px(x + sz + 30, by + 11 + sway, 2, 2, '#100838');
        // cabeza con sombrero de mafioso
        px(x + 9, by - 2 + sway, 20 + sz, 12, '#1A1A48');
        px(x + 11, by + 0 + sway, 16 + sz, 8, '#282858');
        px(x + 3, by - 7 + sway, 32 + sz, 6, '#0A0A1A');
        px(x + 7, by - 10 + sway, 24 + sz, 5, '#1A1A2A');
        px(x + 10, by - 11 + sway, 18 + sz, 3, '#282828');
        px(x + 11, by - 8 + sway, 14 + sz, 1, '#C83030');
        // ojos de cobra
        px(x + 11, by + 2 + sway, 5, 4, '#F0C020');
        px(x + sz + 22, by + 2 + sway, 5, 4, '#F0C020');
        px(x + 13, by + 3 + sway, 3, 2, '#100838');
        px(x + sz + 24, by + 3 + sway, 3, 2, '#100838');
        px(x + 12, by + 1 + sway, 5, 1, '#C07060');
        px(x + sz + 22, by + 1 + sway, 5, 1, '#C07060');
        // boca y colmillos/puro
        px(x + 14, by + 9 + sway, 9, 2, '#6A4020');
        px(x + 13, by + 10 + sway, 2, 3, '#F8F8F8');
        px(x + sz + 23, by + 10 + sway, 2, 3, '#F8F8F8');
        px(x + sz + 28, by + 8 + sway, 8, 2, '#6A4020');
        px(x + sz + 35, by + 7 + sway, 2, 2, '#E8A030');
        if (f % 16 < 8) {
          px(x + sz + 36, by + 5 + sway, 2, 3, '#C8C8C8');
          px(x + sz + 38, by + 3 + sway, 2, 2, '#E0E0E0');
        }
        // anillo dorado en la cola
        px(x - 2, by + 35, 6, 3, '#C8A030');
        px(x - 4, by + 33, 4, 4, '#D8B040');
      }
      break;

    case 'crisalmanza': // Crisálmanza: dragón manzana intermedio dentro de cáscara espiral
      {
        const pulse = Math.sin(fr * 0.1) * 0.3 + 0.7;
        // silueta: capullo vertical de cáscara, con serpiente verde asomándose
        px(x + 8, by + 9, 18 + sz, 25 + sz, '#8A2018');
        px(x + 10, by + 11, 14 + sz, 21 + sz, '#A02818');
        px(x + 12, by + 13, 10 + sz, 17, '#B83020');
        // bandas de cáscara en espiral
        px(x + 7, by + 12, 18 + sz, 4, '#C83828');
        px(x + 11, by + 18, 17 + sz, 4, '#D04838');
        px(x + 6, by + 24, 20 + sz, 4, '#C83828');
        px(x + 10, by + 30, 16 + sz, 4, '#A02818');
        // grietas luminosas internas
        cx.globalAlpha = pulse;
        px(x + 14, by + 15, 2, 13, '#F8E830');
        px(x + 19, by + 12, 2, 9, '#F0D020');
        px(x + 11, by + 27, 2, 6, '#F8E830');
        cx.globalAlpha = 1;
        // serpiente verde/cabeza de dragón asomando arriba
        px(x + 12, by + 2, 12 + sz, 9, '#48A030');
        px(x + 14, by + 4, 8 + sz, 5, '#68C050');
        px(x + 10, by + 6, 5, 3, '#2F7A30');
        px(x + sz + 22, by + 6, 5, 3, '#2F7A30');
        px(x + 14, by + 5, 3, 3, '#F8C030');
        px(x + sz + 19, by + 5, 3, 3, '#F8C030');
        px(x + 15, by + 6, 1, 1, '#801010');
        px(x + sz + 20, by + 6, 1, 1, '#801010');
        // hojitas/cuernos
        px(x + 11, by - 1, 5, 4, '#58B838');
        px(x + sz + 20, by - 1, 5, 4, '#58B838');
        // base raicillas / patitas incompletas
        px(x + 8, by + 33 + sz, 4, 6, '#5A3818');
        px(x + sz + 21, by + 33 + sz, 4, 6, '#5A3818');
        px(x + 13, by + 35 + sz, 8, 4, '#5A3818');
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + 21, 18 + sz, 18);
        cx.globalAlpha = 1;
      }
      break;

    case 'hydrapom': // Knightapple: sprite PNG cargado desde assets/sprites/hydrapom.png
      {
        const sway = Math.sin(f * 0.1) * 2;
        if (SPRITE_LOADER.has('hydrapom')) {
          // Sprite cargado: usar imagen manteniendo aspect ratio original.
          const img = SPRITE_LOADER.get('hydrapom');
          const targetH = 72 + sz * 2;                       // alto objetivo
          const ratio = img.naturalWidth / img.naturalHeight; // preservar ratio real
          const targetW = targetH * ratio;
          // Centrar horizontalmente sobre el punto (x + 16) que es el centro
          // de la casilla de criatura; anclar los pies a by + 48 aprox.
          const drawX = x + 16 - targetW / 2 + sway;
          const drawY = by + 48 - targetH;
          // Escalado nítido (pixel-art friendly)
          const prevSmoothing = cx.imageSmoothingEnabled;
          cx.imageSmoothingEnabled = false;
          cx.drawImage(img, drawX, drawY, targetW, targetH);
          cx.imageSmoothingEnabled = prevSmoothing;
          break;
        }
        // Fallback mientras el sprite no está disponible (imagen no subida aún
        // o todavía cargando): silueta simple con el nombre de la criatura.
        px(x + 6, by + 8, 22, 40, '#4E9A1E');
        px(x + 8, by + 10, 18, 36, '#78C840');
        px(x + 10, by + 4, 14, 8, '#B82020');
        cx.fillStyle = '#fff';
        cx.font = '8px "Press Start 2P"';
        cx.fillText('?', x + 14, by + 34);
      }
      break;

    case '_hydrapom_legacy_unused': // (Sprite pixel-art antiguo, conservado por referencia — no se usa)
      {
        const sway = Math.sin(f * 0.1) * 2;
        const leaf = Math.sin(f * 0.12) * 2;
        const G1 = '#4E9A1E', G2 = '#78C840', G3 = '#B8E880';
        const RED1 = '#B82020', RED2 = '#D83030', RED3 = '#F05040';
        const CREAM = '#F0E6C8';

        // Cuerpo serpentino más alto y visible, con base enrollada.
        px(x + 13, by + 32, 24 + sz, 6, G1);
        px(x + 8, by + 36, 23 + sz, 6, G2);
        px(x + 2, by + 39, 22 + sz, 6, '#6FC838');
        px(x + sz + 29, by + 36, 13, 7, '#E8E8D8');
        px(x + sz + 35, by + 32, 9, 7, G2);
        // Tramo vertical del cuerpo: más largo, delgado y protagonista.
        px(x + 16, by + 9, 7, 29, G1);
        px(x + 18, by + 8, 3, 30, G3);
        px(x + 13, by + 20, 4, 18, CREAM); // panza clara lateral
        px(x + 15, by + 13, 2, 7, '#6FC838');

        // Pechera de manzana más pequeña para dejar ver el cuerpo delgado.
        px(x + 12, by + 20, 17 + sz, 12 + sz, RED1);
        px(x + 14, by + 19, 13 + sz, 12 + sz, RED2);
        px(x + 16, by + 21, 9 + sz, 8 + sz, RED3);
        px(x + 17, by + 20, 3, 2, '#FF8A78');
        px(x + 24, by + 23, 2, 2, '#FFB0A0');
        // semillas/ranuras más pequeñas.
        px(x + 17, by + 24, 2, 3, '#A85A38');
        px(x + 23, by + 24, 2, 3, '#A85A38');
        px(x + 16, by + 29, 2, 2, '#A85A38');
        px(x + 22, by + 29, 2, 2, '#A85A38');

        // Brazos-hoja delgados, ya no escudo ni espada.
        cx.globalAlpha = 0.98;
        // brazo-hoja izquierdo fino
        px(x + 3, by + 22 + leaf, 11, 3, G3);
        px(x - 2, by + 25 + leaf, 15, 3, G2);
        px(x - 5, by + 28 + leaf, 11, 3, '#94D860');
        px(x + 9, by + 23 + leaf, 3, 8, '#6FA840');
        // brazo-hoja derecho fino
        px(x + sz + 27, by + 21 - leaf, 14, 3, G3);
        px(x + sz + 28, by + 24 - leaf, 18, 3, G2);
        px(x + sz + 36, by + 27 - leaf, 10, 3, '#94D860');
        px(x + sz + 29, by + 23 - leaf, 3, 8, '#6FA840');
        cx.globalAlpha = 1;

        // Cabeza verde más pequeña arriba, con ojos saltones amarillos.
        px(x + 13, by + 0 + sway, 16 + sz, 10, G1);
        px(x + 15, by + 2 + sway, 12 + sz, 7, G2);
        px(x + 17, by + 4 + sway, 8 + sz, 4, G3);
        // Hocico/boca proyectada en forma de pico (sin ser pico).
        px(x + 10, by + 8 + sway, 10, 6, '#3F8418');
        px(x + 8, by + 10 + sway, 7, 4, '#5CA828');
        px(x + 6, by + 11 + sway, 4, 2, '#4E9A1E');
        px(x + 9, by + 14 + sway, 8, 2, '#1F5018');
        px(x + 10, by + 15 + sway, 4, 1, '#D8F0A0');
        // Ojos saltones amarillos con pupila negra.
        px(x + 13, by - 4 + sway, 6, 6, '#E8D840');
        px(x + sz + 22, by - 4 + sway, 6, 6, '#E8D840');
        px(x + 15, by - 2 + sway, 3, 3, '#1A2010');
        px(x + sz + 24, by - 2 + sway, 3, 3, '#1A2010');
        px(x + 16, by - 2 + sway, 1, 1, '#F8F8C0');
        px(x + sz + 25, by - 2 + sway, 1, 1, '#F8F8C0');
        // Cresta/hojas de la cabeza, compacta.
        px(x + 18, by - 8 + sway, 5, 5, G2);
        px(x + 24, by - 10 + sway, 8, 4, G3);
        px(x + 30, by - 11 + sway, 5, 3, G3);

        // Unión bajo la pechera.
        px(x + 16, by + 31 + sz, 8, 3, '#5A3818');
        px(x + 18, by + 31 + sz, 3, 3, '#C8A830');
        // Aura vegetal mínima.
        cx.globalAlpha = 0.05;
        cx.fillStyle = '#B8E880';
        pixelGlow(x + 20, by + 22, 24 + sz, 18);
        cx.globalAlpha = 1;
      }
      break;

    case 'duendetron': // Duendetrón: saco gigante con duende casi aplastado
      {
        const dthv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F080F0';
        pixelGlow(x + 16, by + dthv2 + 25, 18 + sz, 16);
        cx.globalAlpha = 1;
        // saco enorme domina la silueta
        px(x - 8, by + dthv2 + 10, 24, 28, '#8A6820');
        px(x - 6, by + dthv2 + 12, 20, 24, '#A88030');
        px(x - 2, by + dthv2 + 9, 10, 5, '#E8E8E8');
        px(x + 2, by + dthv2 + 8, 3, 4, '#D83030');
        px(x + 6, by + dthv2 + 10, 2, 3, '#3030D8');
        px(x - 1, by + dthv2 + 14, 2, 3, '#30D830');
        // duende pequeño cargando al lado
        px(x + 16, by + dthv2 + 22, 14 + sz, 10 + sz, '#38A048');
        px(x + 18, by + dthv2 + 24, 10 + sz, 6 + sz, '#48B058');
        px(x + 15, by + dthv2 + 9, 16 + sz, 13, '#F8D0C0');
        px(x + 17, by + dthv2 + 11, 12 + sz, 9, '#F8E0D0');
        px(x + 14, by + dthv2 + 4, 18 + sz, 7, '#1A1A1A');
        px(x + 20, by + dthv2 - 2, 10, 6, '#101010');
        // cara cansada
        px(x + 17, by + dthv2 + 12, 3, 2, '#F8E830');
        px(x + sz + 25, by + dthv2 + 12, 3, 2, '#F8E830');
        px(x + 20, by + dthv2 + 18, 8, 2, '#C08868');
        px(x + 19, by + dthv2 + 30 + sz, 4, 3, '#F8D0C0');
        px(x + sz + 27, by + dthv2 + 30 + sz, 4, 3, '#F8D0C0');
      }
      break;

    case 'sidhearia': // Hada diva prima donna
      {
        const sahv2 = Math.sin(fr * 0.1) * 3;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#A0E0A0';
      pixelGlow(x + 16, by + sahv2 + 22, 20 + sz, 16);
        cx.globalAlpha = 1;
        px(x + 2, by + sahv2 + 16, 28 + sz, 18 + sz, '#C02888');
        px(x + 4, by + sahv2 + 18, 24 + sz, 14 + sz, '#D03898');
        px(x + 6, by + sahv2 + 20, 20 + sz, 10, '#E050A8');
        px(x, by + sahv2 + 28, 32 + sz, 6, '#C02888');
        px(x + 2, by + sahv2 + 30, 28 + sz, 4, '#D03898');
        px(x + 10, by + sahv2 + 22, 2, 2, '#F8E830');
        px(x + 20, by + sahv2 + 24, 2, 2, '#F8E830');
        cx.globalAlpha = 0.5;
        px(x - 8, by + sahv2 + 6, 14, 18, '#C8F8C8');
        px(x + sz + 26, by + sahv2 + 6, 14, 18, '#C8F8C8');
        px(x - 6, by + sahv2 + 8, 10, 14, '#D8F8D8');
        px(x + sz + 28, by + sahv2 + 8, 10, 14, '#D8F8D8');
        cx.globalAlpha = 1;
        px(x + 6, by + sahv2 + 2, 20 + sz, 14, '#F8D8E8');
        px(x + 8, by + sahv2 + 4, 16 + sz, 10, '#F8E8F0');
        px(x + 8, by + sahv2 - 2, 16 + sz, 4, '#E8C830');
        px(x + 12, by + sahv2 - 4, 8 + sz, 4, '#E8C830');
        px(x + 10, by + sahv2 - 5, 3, 3, '#D03030');
        px(x + sz + 19, by + sahv2 - 5, 3, 3, '#3060D0');
        px(x + 15, by + sahv2 - 6, 2, 3, '#F8E830');
        px(x + 8, by + sahv2 + 6, 6, 5, '#fff');
        px(x + sz + 18, by + sahv2 + 6, 6, 5, '#fff');
        px(x + 10, by + sahv2 + 8, 4, 3, '#300860');
        px(x + sz + 20, by + sahv2 + 8, 4, 3, '#300860');
        px(x + 10, by + sahv2 + 8, 2, 1, '#fff');
        px(x + sz + 20, by + sahv2 + 8, 2, 1, '#fff');
        px(x + 14, by + sahv2 + 14, 4, 4, '#C05890');
        px(x + 15, by + sahv2 + 15, 2, 2, '#F8D0E0');
        if (f % 30 < 15) {
          cx.fillStyle = '#E8C830';
          cx.font = '10px "Press Start 2P"';
          cx.fillText('♪', x + sz + 26, by + sahv2 + 2 + Math.sin(f * 0.1) * 4);
          cx.fillText('♫', x - 4, by + sahv2 + 6 + Math.sin(f * 0.12) * 3);
        }
      }
      break;

    case 'lucilente': // Luciérnaga con cámara pro
      {
        const llhv2 = Math.sin(fr * 0.12) * 3;
        cx.globalAlpha = 0.4;
        px(x - 4, by + llhv2 + 8, 10, 10, '#C8F0F8');
        px(x + sz + 26, by + llhv2 + 8, 10, 10, '#C8F0F8');
        px(x - 2, by + llhv2 + 14, 8, 8, '#C8F0F8');
        px(x + sz + 24, by + llhv2 + 14, 8, 8, '#C8F0F8');
        cx.globalAlpha = 1;
        px(x + 8, by + llhv2 + 18, 16 + sz, 12 + sz, '#D8B020');
        px(x + 10, by + llhv2 + 20, 12 + sz, 8 + sz, '#E8C030');
        px(x + 10, by + llhv2 + 26 + sz, 12 + sz, 4, '#F8E870');
        if (f % 6 < 3) {
          px(x + 12, by + llhv2 + 28 + sz, 8 + sz, 3, '#F8F8C0');
        }
        px(x + 8, by + llhv2 + 6, 16 + sz, 14, '#D8B020');
        px(x + 10, by + llhv2 + 8, 12 + sz, 10, '#E8C030');
        px(x + 8, by + llhv2 + 8, 6, 6, '#fff');
        px(x + sz + 18, by + llhv2 + 8, 6, 6, '#fff');
        px(x + 10, by + llhv2 + 10, 4, 4, '#382858');
        px(x + sz + 20, by + llhv2 + 10, 4, 4, '#382858');
        px(x + 10, by + llhv2 + 10, 2, 2, '#fff');
        px(x + sz + 20, by + llhv2 + 10, 2, 2, '#fff');
        px(x + sz + 22, by + llhv2 + 12, 8, 7, '#282828');
        px(x + sz + 24, by + llhv2 + 14, 4, 3, '#383838');
        px(x + sz + 29, by + llhv2 + 12, 3, 4, '#484848');
        px(x + sz + 30, by + llhv2 + 13, 2, 2, '#6888A8');
        px(x + sz + 23, by + llhv2 + 11, 2, 2, '#E83030');
        px(x + 12, by + llhv2 + 4, 2, 4, '#C8A020');
        px(x + sz + 18, by + llhv2 + 4, 2, 4, '#C8A020');
        px(x + 11, by + llhv2 + 2, 2, 2, '#F8E830');
        px(x + sz + 19, by + llhv2 + 2, 2, 2, '#F8E830');
        px(x + 10, by + llhv2 + 28 + sz, 4, 3, '#C8A020');
        px(x + sz + 18, by + llhv2 + 28 + sz, 4, 3, '#C8A020');
      }
      break;

    case 'lucistrella': // Luciérnaga estrella de cine
      {
        const lshv2 = Math.sin(fr * 0.1) * 2;
        cx.globalAlpha = 0.1 + Math.sin(fr * 0.06) * 0.05;
        cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, by + lshv2 + 20, 20 + sz, 16);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.5;
        px(x - 6, by + lshv2 + 6, 14, 14, '#D0F0F8');
        px(x + sz + 24, by + lshv2 + 6, 14, 14, '#D0F0F8');
        px(x - 4, by + lshv2 + 8, 10, 10, '#E0F8F8');
        px(x + sz + 26, by + lshv2 + 8, 10, 10, '#E0F8F8');
        cx.globalAlpha = 1;
        px(x + 6, by + lshv2 + 16, 20 + sz, 14 + sz, '#C8A018');
        px(x + 8, by + lshv2 + 18, 16 + sz, 10 + sz, '#D8B028');
        px(x + 8, by + lshv2 + 28 + sz, 16 + sz, 4, '#F8E860');
        px(x + 10, by + lshv2 + 30 + sz, 12 + sz, 3, '#F8F8A0');
        px(x + 6, by + lshv2 + 4, 20 + sz, 14, '#C8A018');
        px(x + 8, by + lshv2 + 6, 16 + sz, 10, '#D8B028');
        px(x + 6, by + lshv2 + 0, 20 + sz, 6, '#282828');
        px(x + 8, by + lshv2 - 1, 16 + sz, 4, '#383838');
        px(x + 6, by + lshv2 + 8, 8, 4, '#C8A830');
        px(x + sz + 18, by + lshv2 + 8, 8, 4, '#C8A830');
        px(x + 8, by + lshv2 + 9, 4, 2, '#282828');
        px(x + sz + 20, by + lshv2 + 9, 4, 2, '#282828');
        px(x + sz + 24, by + lshv2 + 14, 8, 4, '#D8D8D8');
        px(x + sz + 30, by + lshv2 + 12, 4, 8, '#E8E8E8');
        cx.fillStyle = '#F8E830';
        cx.font = '8px "Press Start 2P"';
        cx.fillText('★', x - 4, by + lshv2 + 6);
        px(x + 10, by + lshv2 + 30 + sz, 4, 3, '#C8A018');
        px(x + sz + 18, by + lshv2 + 30 + sz, 4, 3, '#C8A018');
      }
      break;

    case 'elefantastico': // Elefante hechicero con mandala
      {
        const ethv2 = Math.sin(fr * 0.08) * 2;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#C880F0';
      pixelGlow(x + 16, by + ethv2 + 20, 22 + sz, 18);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.15;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + ethv2 + 16, 18 + sz, 16);
        pixelGlow(x + 16, by + ethv2 + 16, 14 + sz, 12);
        cx.globalAlpha = 1;
        px(x + 2, by + ethv2 + 16, 28 + sz, 16 + sz, '#6850A0');
        px(x + 4, by + ethv2 + 18, 24 + sz, 12 + sz, '#7860B0');
        px(x + 6, by + ethv2 + 16, 20 + sz, 10, '#C8A830');
        px(x + 8, by + ethv2 + 18, 16 + sz, 6, '#D8B840');
        for (let i = 0; i < 3; i++) {
          const bangle2 = Math.sin(f * 0.1 + i * 2) * 2;
          px(x - 2 + i * 2, by + ethv2 + 12 + i * 4 + bangle2, 5, 3, '#6850A0');
          px(
            x + sz + 26 - i * 2,
            by + ethv2 + 12 + i * 4 - bangle2,
            5,
            3,
            '#6850A0'
          );
        }
        px(x - 4, by + ethv2 + 10, 3, 3, '#F8E830');
        px(x + sz + 32, by + ethv2 + 10, 3, 3, '#A050F0');
        px(x - 2, by + ethv2 + 18, 3, 3, '#30E030');
        px(x + sz + 30, by + ethv2 + 18, 3, 3, '#E05050');
        px(x + 2, by + ethv2, 28 + sz, 16, '#6850A0');
        px(x + 4, by + ethv2 + 2, 24 + sz, 12, '#7860B0');
        px(x - 4, by + ethv2 + 2, 8, 12, '#8878C0');
        px(x + sz + 28, by + ethv2 + 2, 8, 12, '#8878C0');
        px(x - 2, by + ethv2 + 4, 4, 8, '#9888D0');
        px(x + sz + 30, by + ethv2 + 4, 4, 8, '#9888D0');
        px(x + 14, by + ethv2 + 12, 4, 14, '#7860B0');
        px(x + 12, by + ethv2 + 24, 4, 3, '#8878C0');
        px(x + 10, by + ethv2 + 26, 4, 2, '#8878C0');
        if (f % 16 < 8) {
          px(x + 8, by + ethv2 + 26, 3, 3, '#F8E830');
          px(x + 6, by + ethv2 + 24, 2, 2, '#A050F0');
        }
        px(x + 6, by + ethv2 + 6, 6, 5, '#fff');
        px(x + sz + 20, by + ethv2 + 6, 6, 5, '#fff');
        px(x + 8, by + ethv2 + 8, 4, 3, '#301848');
        px(x + sz + 22, by + ethv2 + 8, 4, 3, '#301848');
        px(x + 12, by + ethv2 + 4, 8, 4, '#D03030');
        px(x + 14, by + ethv2 + 5, 4, 2, '#F8E830');
        px(x + 6, by + ethv2 - 4, 20 + sz, 5, '#C8A830');
        px(x + 10, by + ethv2 - 6, 12 + sz, 4, '#D8B840');
        px(x + 8, by + ethv2 - 7, 3, 4, '#C8A830');
        px(x + sz + 21, by + ethv2 - 7, 3, 4, '#C8A830');
        px(x + 14, by + ethv2 - 8, 4, 4, '#E8C840');
        px(x + 15, by + ethv2 - 7, 2, 2, '#D03030');
        px(x + 6, by + ethv2 + 30 + sz, 6, 6, '#6850A0');
        px(x + sz + 20, by + ethv2 + 30 + sz, 6, 6, '#6850A0');
      }
      break;

    case 'zumbaccino': // Colibrí con cafetería móvil
      {
        const zchv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.3;
        px(x - 6, by + zchv2 + 8, 12, 10, '#80C860');
        px(x + sz + 26, by + zchv2 + 8, 12, 10, '#80C860');
        cx.globalAlpha = 1;
        px(x + 8, by + zchv2 + 16, 16 + sz, 12 + sz, '#289040');
        px(x + 10, by + zchv2 + 18, 12 + sz, 8 + sz, '#38A050');
        px(x + 10, by + zchv2 + 18, 12 + sz, 4, '#D04078');
        px(x + 10, by + zchv2 + 22, 12 + sz, 6, '#E8D8C0');
        px(x + 14, by + zchv2 + 24, 4 + sz, 2, '#8A5020');
        px(x + 6, by + zchv2 + 6, 20 + sz, 12, '#289040');
        px(x + 8, by + zchv2 + 8, 16 + sz, 8, '#38A050');
        px(x + 6, by + zchv2 + 4, 20 + sz, 4, '#3A2818');
        px(x + 4, by + zchv2 + 6, 8, 3, '#3A2818');
        px(x + 14, by + zchv2 + 4, 4, 2, '#F0F0F0');
        px(x + 8, by + zchv2 + 8, 5, 5, '#fff');
        px(x + sz + 18, by + zchv2 + 8, 5, 5, '#fff');
        px(x + 10, by + zchv2 + 9, 3, 4, '#181818');
        px(x + sz + 20, by + zchv2 + 9, 3, 4, '#181818');
        px(x + sz + 22, by + zchv2 + 12, 10, 2, '#D89020');
        px(x + sz + 24, by + zchv2 + 16, 10, 10, '#6A4020');
        px(x + sz + 26, by + zchv2 + 18, 6, 6, '#7A5030');
        px(x + sz + 26, by + zchv2 + 16, 6, 2, '#F0F0F0');
        px(x + sz + 28, by + zchv2 + 14, 3, 3, '#8A5020');
        if (f % 12 < 6) {
          px(x + sz + 29, by + zchv2 + 12, 2, 2, '#E8E0D0');
        }
        px(x + sz + 24, by + zchv2 + 26, 3, 3, '#383838');
        px(x + sz + 31, by + zchv2 + 26, 3, 3, '#383838');
        px(x + 12, by + zchv2 + 26 + sz, 3, 3, '#D89020');
        px(x + 18, by + zchv2 + 26 + sz, 3, 3, '#D89020');
      }
      break;

    // ==========================================
    // FUEGO 🔥 - NUEVOS (únicos)
    // ==========================================

    case 'flameye': // Flameye: polluelo de pavo real de fuego, compacto y cabezón
      {
        const hop = Math.sin(f * 0.2) * 1;
        // cuerpo de polluelo: bolita pixelada baja
        px(x + 10, by + hop + 24, 14 + sz, 10 + sz, '#C83020');
        px(x + 12, by + hop + 26, 10 + sz, 6 + sz, '#E04830');
        px(x + 14, by + hop + 28, 6 + sz, 3, '#F07838');
        // alitas mini
        px(x + 6, by + hop + 25, 6, 4, '#A82018');
        px(x + sz + 23, by + hop + 25, 6, 4, '#A82018');
        px(x + 4, by + hop + 27, 4, 2, '#F8A030');
        px(x + sz + 27, by + hop + 27, 4, 2, '#F8A030');
        // cabeza grande, distinta del cuerpo
        px(x + 6, by + hop + 8, 22 + sz, 16, '#C83020');
        px(x + 8, by + hop + 10, 18 + sz, 12, '#E04830');
        px(x + 11, by + hop + 12, 12 + sz, 8, '#F06838');
        // cresta de fueguito, pequeña
        px(x + 13, by + hop + 3, 3, 6, '#E82020');
        px(x + 17, by + hop + 1, 3, 8, '#F83828');
        px(x + 21, by + hop + 4, 3, 5, '#E82020');
        px(x + 14, by + hop + 4, 2, 3, '#F8A030');
        px(x + 18, by + hop + 2, 2, 5, '#F8C040');
        // ojos vanidosos
        px(x + 10, by + hop + 13, 5, 5, '#fff');
        px(x + sz + 20, by + hop + 13, 5, 5, '#fff');
        px(x + 12, by + hop + 15, 3, 3, '#801010');
        px(x + sz + 22, by + hop + 15, 3, 3, '#801010');
        px(x + 11, by + hop + 13, 1, 1, '#1A1A1A');
        px(x + sz + 24, by + hop + 13, 1, 1, '#1A1A1A');
        px(x + 15, by + hop + 20, 5, 2, '#F0C030');
        // patitas cortas
        px(x + 12, by + hop + 33 + sz, 4, 4, '#C89020');
        px(x + 20, by + hop + 33 + sz, 4, 4, '#C89020');
      }
      break;

    case 'salamandro': // Salamandro: larvita alquimista torpe, cara más tierna
      {
        const wob = Math.sin(f * 0.18) * 1;
        // cuerpo bajo, casi reptando: aprendiz torpe
        px(x + 5, by + 27 + wob, 24 + sz, 8 + sz, '#E86020');
        px(x + 7, by + 29 + wob, 20 + sz, 5 + sz, '#F07830');
        px(x + 2, by + 30 + wob, 8, 4, '#D85018');
        px(x - 1, by + 31 + wob, 4, 3, '#F89040');
        // patitas cortas
        px(x + 8, by + 34 + sz + wob, 5, 3, '#C04818');
        px(x + 22, by + 34 + sz + wob, 5, 3, '#C04818');

        // cabeza grande y amable al frente
        px(x + 17, by + 15 + wob, 17 + sz, 13, '#E86020');
        px(x + 19, by + 17 + wob, 13 + sz, 9, '#F89040');
        px(x + 21, by + 19 + wob, 9 + sz, 5, '#FFA050');
        // gorrito/pañuelo morado torpe
        px(x + 17, by + 11 + wob, 15 + sz, 5, '#4030A0');
        px(x + 19, by + 9 + wob, 11 + sz, 4, '#5040B0');
        px(x + 27, by + 8 + wob, 4, 3, '#F8E830');
        // cara nueva: ojos curiosos, no cejas feas
        px(x + 20, by + 19 + wob, 5, 5, '#fff');
        px(x + sz + 28, by + 19 + wob, 5, 5, '#fff');
        px(x + 22, by + 21 + wob, 3, 3, '#181818');
        px(x + sz + 30, by + 21 + wob, 3, 3, '#181818');
        px(x + 23, by + 21 + wob, 1, 1, '#fff');
        px(x + sz + 31, by + 21 + wob, 1, 1, '#fff');
        // sonrisa pequeña y mejilla de torpeza
        px(x + 25, by + 26 + wob, 5, 1, '#A83818');
        px(x + 18, by + 24 + wob, 2, 2, '#F8B070');
        // poción caída
        px(x + 2, by + 21 + wob, 6, 7, '#484848');
        px(x + 3, by + 20 + wob, 4, 2, '#606060');
        px(x + 3, by + 24 + wob, 4, 3, '#40E040');
        if (f % 12 < 6) px(x + 4, by + 22 + wob, 2, 2, '#80F080');
      }
      break;

    case 'blaztoro': // Blaztoro: torito pastelero pequeño y delicado
      {
        const bob = Math.sin(f * 0.14) * 1;
        px(x + 8, by + 22 + bob, 20 + sz, 12 + sz, '#A03020');
        px(x + 10, by + 24 + bob, 16 + sz, 8 + sz, '#C04030');
        px(x + 11, by + 23 + bob, 14 + sz, 9, '#F0E8E0');
        px(x + 13, by + 25 + bob, 10 + sz, 5, '#F8F0E8');
        px(x + 16, by + 27 + bob, 4, 3, '#E05060');
        px(x + 8, by + 8 + bob, 18 + sz, 13, '#A03020');
        px(x + 10, by + 10 + bob, 14 + sz, 9, '#C04030');
        px(x + 12, by + 12 + bob, 10 + sz, 5, '#D05040');
        px(x + 6, by + 5 + bob, 4, 5, '#E8D8C0');
        px(x + sz + 25, by + 5 + bob, 4, 5, '#E8D8C0');
        px(x + 5, by + 3 + bob, 3, 3, '#F0E0D0');
        px(x + sz + 27, by + 3 + bob, 3, 3, '#F0E0D0');
        px(x + 9, by + 2 + bob, 16 + sz, 4, '#F8F8F8');
        px(x + 11, by - 1 + bob, 12 + sz, 5, '#F8F8F8');
        px(x + 13, by - 2 + bob, 8 + sz, 3, '#F0F0F0');
        px(x + 11, by + 12 + bob, 5, 5, '#fff');
        px(x + sz + 19, by + 12 + bob, 5, 5, '#fff');
        px(x + 13, by + 14 + bob, 3, 3, '#401818');
        px(x + sz + 21, by + 14 + bob, 3, 3, '#401818');
        px(x + 14, by + 19 + bob, 7, 2, '#C04030');
        px(x + sz + 25, by + 25 + bob, 6, 5, '#F0D8C0');
        px(x + sz + 26, by + 23 + bob, 4, 3, '#F088A0');
        px(x + sz + 27, by + 22 + bob, 2, 2, '#F8E830');
        px(x + 9, by + 32 + sz + bob, 5, 5, '#A03020');
        px(x + sz + 21, by + 32 + sz + bob, 5, 5, '#A03020');
        px(x + 8, by + 36 + sz + bob, 6, 2, '#802818');
        px(x + sz + 20, by + 36 + sz + bob, 6, 2, '#802818');
      }
      break;

    case 'axolotl': // Ajolotín: cabeza grande, cuerpito bebé muy pequeño
      {
        const wig = Math.sin(f * 0.14) * 1;
        // cuerpo chiquitito debajo de una cabeza grande
        px(x + 12, by + 24, 10 + sz, 9 + sz, '#2870C0');
        px(x + 14, by + 26, 6 + sz, 5 + sz, '#48A0E8');
        px(x + 10, by + 31 + sz, 5, 3, '#2870C0');
        px(x + sz + 19, by + 31 + sz, 5, 3, '#2870C0');
        // colita bebé
        px(x + 7, by + 27, 6, 3, '#3890D8');
        px(x + 5, by + 26, 4, 2, '#48A0E8');

        // cabeza mantiene tamaño grande y redondita en pixel-art
        px(x + 4, by + 6, 24 + sz, 17, '#2870C0');
        px(x + 6, by + 8, 20 + sz, 13, '#3890D8');
        px(x + 8, by + 10, 16 + sz, 9, '#48A0E8');
        // branquias rosadas grandes
        px(x, by + 4 + wig, 6, 3, '#F070A0');
        px(x - 2, by + 8 + wig, 6, 3, '#F070A0');
        px(x, by + 12 + wig, 6, 3, '#F070A0');
        px(x + sz + 27, by + 4 - wig, 6, 3, '#F070A0');
        px(x + sz + 29, by + 8 - wig, 6, 3, '#F070A0');
        px(x + sz + 27, by + 12 - wig, 6, 3, '#F070A0');
        // ojos enormes y sonrisa bebé
        px(x + 8, by + 10, 6, 6, '#fff');
        px(x + sz + 18, by + 10, 6, 6, '#fff');
        px(x + 10, by + 12, 4, 4, '#0840A0');
        px(x + sz + 20, by + 12, 4, 4, '#0840A0');
        px(x + 11, by + 12, 2, 2, '#fff');
        px(x + sz + 21, by + 12, 2, 2, '#fff');
        px(x + 12, by + 18, 3, 1, '#1858A0');
        px(x + sz + 17, by + 18, 3, 1, '#1858A0');
        px(x + 14, by + 19, 4 + sz, 1, '#2070B0');
        // burbujas cuadradas
        const bub = Math.sin(f * 0.08) * 4;
        cx.globalAlpha = 0.5;
        px(x + sz + 27, by + 6 + bub, 3, 3, '#88D8F8');
        px(x + sz + 31, by + 2 + bub, 2, 2, '#A8E8F8');
        cx.globalAlpha = 1;
      }
      break;

    case 'medusync': // Medusa DJ con tentáculos-cables
      {
        const mhv = Math.sin(fr * 0.12) * 3;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#4080F0';
      pixelGlow(x + 16, by + mhv + 22, 16 + sz, 14);
        cx.globalAlpha = 1;
        px(x + 4, by + mhv + 6, 24 + sz, 14, '#3070C0');
        px(x + 6, by + mhv + 8, 20 + sz, 10, '#4090D8');
        px(x + 8, by + mhv + 10, 16 + sz, 6, '#50A8E8');
        px(x + 8, by + mhv + 8, 4, 4, '#60B0F0');
        px(x + 16, by + mhv + 10, 4, 3, '#60B0F0');
        px(x + 8, by + mhv + 12, 6, 4, '#181818');
        px(x + sz + 18, by + mhv + 12, 6, 4, '#181818');
        px(x + 9, by + mhv + 13, 4, 2, '#4060C0');
        px(x + sz + 19, by + mhv + 13, 4, 2, '#4060C0');
        px(x + 14, by + mhv + 18, 4, 1, '#2060A0');
        const tw = Math.sin(f * 0.15) * 2;
        px(x + 6, by + mhv + 20 + tw, 2, 10, '#2858A0');
        px(x + 12, by + mhv + 20 - tw, 2, 12, '#3070C0');
        px(x + 20, by + mhv + 20 + tw, 2, 10, '#2858A0');
        px(x + sz + 24, by + mhv + 20 - tw, 2, 8, '#3070C0');
        if (f % 8 < 4) {
          px(x + 6, by + mhv + 30 + tw, 2, 2, '#F8E830');
          px(x + 12, by + mhv + 32 - tw, 2, 2, '#E83030');
          px(x + 20, by + mhv + 30 + tw, 2, 2, '#30E830');
        }
        px(x + 3, by + mhv + 8, 3, 6, '#282828');
        px(x + sz + 26, by + mhv + 8, 3, 6, '#282828');
        px(x + 4, by + mhv + 10, 2, 3, '#E83030');
        px(x + sz + 27, by + mhv + 10, 2, 3, '#E83030');
        px(x + 5, by + mhv + 6, 22 + sz, 2, '#383838');
      }
      break;

    case 'pinzardo': // Cangrejo peluquero con tijeras
      px(x + 4, by + 22, 24 + sz, 10 + sz, '#D85020');
      px(x + 6, by + 24, 20 + sz, 6 + sz, '#E86830');
      px(x + 8, by + 26, 16 + sz, 2, '#F08040');
      px(x + 10, by + 22, 12 + sz, 6, '#C04018');
      px(x + 8, by + 14, 3, 8, '#D85020');
      px(x + sz + 20, by + 14, 3, 8, '#D85020');
      px(x + 7, by + 12, 5, 4, '#fff');
      px(x + sz + 19, by + 12, 5, 4, '#fff');
      px(x + 9, by + 14, 2, 2, '#181818');
      px(x + sz + 21, by + 14, 2, 2, '#181818');
      px(x - 2, by + 18, 8, 4, '#C04018');
      px(x - 4, by + 16, 4, 3, '#D85020');
      px(x - 4, by + 21, 4, 3, '#D85020');
      px(x - 3, by + 17, 2, 1, '#F0F0F0');
      px(x + sz + 26, by + 18, 8, 4, '#C04018');
      px(x + sz + 30, by + 16, 4, 3, '#D85020');
      px(x + sz + 30, by + 21, 4, 3, '#D85020');
      px(x + sz + 31, by + 17, 2, 1, '#F0F0F0');
      px(x + sz + 28, by + 24, 2, 6, '#282828');
      px(x + sz + 27, by + 24, 1, 1, '#282828');
      px(x + sz + 27, by + 26, 1, 1, '#282828');
      px(x + sz + 27, by + 28, 1, 1, '#282828');
      px(x + 14, by + 28, 4, 2, '#B04018');
      px(x + 6, by + 30 + sz, 4, 4, '#D85020');
      px(x + 12, by + 30 + sz, 4, 4, '#D85020');
      px(x + 18, by + 30 + sz, 4, 4, '#D85020');
      px(x + sz + 22, by + 30 + sz, 4, 4, '#D85020');
      cx.globalAlpha = 0.4;
      px(x + sz + 26, by + 12 + Math.sin(f * 0.08) * 3, 3, 3, '#88D8F8');
      cx.globalAlpha = 1;
      break;

    case 'pingueson': // Pingüino mesero con bandeja
      px(x + 6, by + 18, 20 + sz, 14 + sz, '#1A1A2A');
      px(x + 8, by + 20, 16 + sz, 10 + sz, '#282838');
      px(x + 10, by + 22, 12 + sz, 8, '#F0F0F0');
      px(x + 12, by + 24, 8 + sz, 4, '#F8F8F8');
      px(x + 6, by + 6, 20 + sz, 14, '#1A1A2A');
      px(x + 8, by + 8, 16 + sz, 10, '#282838');
      px(x + 10, by + 10, 12 + sz, 6, '#F0F0F0');
      px(x + 10, by + 10, 4, 4, '#fff');
      px(x + sz + 18, by + 10, 4, 4, '#fff');
      px(x + 12, by + 12, 2, 2, '#181818');
      px(x + sz + 20, by + 12, 2, 2, '#181818');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + sz + 20, by + 12, 1, 1, '#fff');
      px(x + 14, by + 18, 4, 2, '#E83030');
      px(x + 15, by + 17, 2, 1, '#E83030');
      px(x + 14, by + 14, 4, 3, '#F0A030');
      px(x + 15, by + 16, 2, 1, '#D88020');
      px(x + sz + 24, by + 16, 6, 8, '#1A1A2A');
      px(x + sz + 24, by + 14, 8, 2, '#C8C8C8');
      px(x + sz + 26, by + 12, 4, 2, '#F8F0E0');
      px(x + 10, by + 30 + sz, 4, 4, '#F0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#F0A030');
      break;

    case 'peztronauta': // Pez pequeño en burbuja espacial
      {
        const phv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.2;
        cx.fillStyle = '#88D8F8';
      pixelGlow(x + 16, by + phv2 + 18, 14 + sz, 12);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.4;
        cx.fillStyle = '#50A8E0';
        pixelGlow(x + 16, by + phv2 + 18, 14 + sz, 12);
        cx.globalAlpha = 1;
        px(x + 8, by + phv2 + 10, 4, 3, 'rgba(255,255,255,.3)');
        px(x + 8, by + phv2 + 14, 16 + sz, 10, '#3088E0');
        px(x + 10, by + phv2 + 16, 12 + sz, 6, '#48A0F0');
        px(x + 14, by + phv2 + 12, 4, 3, '#2070C0');
        px(x + 6, by + phv2 + 16, 4, 4, '#2070C0');
        px(x + 4, by + phv2 + 18, 3, 2, '#3088E0');
        px(x + 18, by + phv2 + 16, 4, 4, '#fff');
        px(x + 20, by + phv2 + 18, 2, 2, '#181848');
        px(x + 20, by + phv2 + 18, 1, 1, '#fff');
        px(x + sz + 20, by + phv2 + 14, 6, 6, '#C8C8D0');
        px(x + sz + 22, by + phv2 + 16, 2, 2, '#88B8F0');
        px(x + 16, by + phv2 + 8, 2, 4, '#C8C8D0');
        px(x + 15, by + phv2 + 6, 4, 3, '#E83030');
        if (f % 16 < 8) px(x + 16, by + phv2 + 5, 2, 2, '#F8E830');
        cx.globalAlpha = 0.4;
        px(x + 4 + Math.sin(f * 0.05) * 2, by + phv2 + 8, 1, 1, '#F8F8C0');
        px(
          x + sz + 26 + Math.sin(f * 0.07) * 2,
          by + phv2 + 22,
          1,
          1,
          '#F8F8C0'
        );
        cx.globalAlpha = 1;
      }
      break;

    // ==========================================
    // PLANTA 🌿 - NUEVOS (únicos)
    // ==========================================

    case 'gorilan': // Gorilán: poeta joven sentado, pequeño y tímido
      {
        const sway = Math.sin(f * 0.12) * 1;
        // Postura sentada, baja y ancha: etapa bebé/joven
        px(x + 7, by + 24, 22 + sz, 12 + sz, '#386028');
        px(x + 9, by + 26, 18 + sz, 8 + sz, '#487830');
        px(x + 12, by + 28, 12 + sz, 4, '#609840');
        // piernas dobladas
        px(x + 2, by + 32 + sz, 10, 6, '#2A5020');
        px(x + sz + 24, by + 32 + sz, 10, 6, '#2A5020');
        px(x + 1, by + 36 + sz, 8, 3, '#203818');
        px(x + sz + 27, by + 36 + sz, 8, 3, '#203818');
        // brazos cortos abrazando librito
        px(x + 3, by + 22, 8, 6, '#386028');
        px(x + sz + 25, by + 22, 8, 6, '#386028');
        px(x + 10, by + 25, 14, 8, '#8A2020');
        px(x + 11, by + 26, 12, 6, '#F0E0C0');
        px(x + 16, by + 26, 1, 6, '#B09070');
        // cabeza grande y tímida
        px(x + 6, by + 5 + sway, 24 + sz, 17, '#386028');
        px(x + 8, by + 7 + sway, 20 + sz, 13, '#487830');
        px(x + 11, by + 10 + sway, 14 + sz, 8, '#5C9440');
        px(x + 9, by + 2 + sway, 18 + sz, 5, '#2A5020');
        px(x + 11, by + 0 + sway, 12 + sz, 4, '#389028');
        // pluma pequeña detrás de la cabeza
        px(x + sz + 27, by + 4 + sway, 2, 10, '#E8D8C0');
        px(x + sz + 28, by + 2 + sway, 4, 4, '#F0E8D0');
        px(x + sz + 29, by + 1 + sway, 2, 2, '#48A030');
        // ojos inocentes
        px(x + 10, by + 11 + sway, 5, 5, '#fff');
        px(x + sz + 20, by + 11 + sway, 5, 5, '#fff');
        px(x + 12, by + 13 + sway, 3, 3, '#2A3818');
        px(x + sz + 22, by + 13 + sway, 3, 3, '#2A3818');
        px(x + 14, by + 18 + sway, 6, 2, '#2A4018');
      }
      break;

    case 'orquidea': // Mantis religiosa bailarina de ballet
      {
        const ohv = Math.sin(fr * 0.12) * 2;
        px(x + 12, by + ohv + 16, 8 + sz, 16 + sz, '#48A038');
        px(x + 14, by + ohv + 18, 4 + sz, 12 + sz, '#58B048');
        px(x + 6, by + ohv + 22, 20 + sz, 4, '#F088A8');
        px(x + 8, by + ohv + 24, 16 + sz, 2, '#F098B8');
        px(x + 4, by + ohv + 22, 4, 3, '#E878A0');
        px(x + sz + 24, by + ohv + 22, 4, 3, '#E878A0');
        const oaf = Math.sin(f * 0.1) * 3;
        px(x + 4, by + ohv + 14 + oaf, 8, 2, '#48A038');
        px(x + 2, by + ohv + 12 + oaf, 4, 3, '#58B048');
        px(x + sz + 20, by + ohv + 14 - oaf, 8, 2, '#48A038');
        px(x + sz + 24, by + ohv + 12 - oaf, 4, 3, '#58B048');
        px(x + 8, by + ohv + 4, 16 + sz, 12, '#48A038');
        px(x + 10, by + ohv + 6, 12 + sz, 8, '#58B048');
        px(x + 8, by + ohv + 6, 5, 5, '#E0F0A0');
        px(x + sz + 18, by + ohv + 6, 5, 5, '#E0F0A0');
        px(x + 10, by + ohv + 8, 3, 3, '#1A3010');
        px(x + sz + 20, by + ohv + 8, 3, 3, '#1A3010');
        px(x + 10, by + ohv + 8, 1, 1, '#fff');
        px(x + sz + 20, by + ohv + 8, 1, 1, '#fff');
        px(x + 10, by + ohv + 2, 2, 4, '#48A038');
        px(x + sz + 20, by + ohv + 2, 2, 4, '#48A038');
        px(x + 9, by + ohv, 3, 3, '#F088A8');
        px(x + sz + 19, by + ohv, 3, 3, '#F8E830');
        px(x + 12, by + ohv + 30 + sz, 2, 8, '#48A038');
        px(x + 18, by + ohv + 30 + sz, 2, 8, '#48A038');
        px(x + 11, by + ohv + 36 + sz, 4, 2, '#F088A8');
        px(x + 17, by + ohv + 36 + sz, 4, 2, '#F088A8');
      }
      break;

    case 'raizan': // Tortuga anciana sabia con musgo y cristales
      px(x + 2, by + 18, 28 + sz, 14 + sz, '#406828');
      px(x + 4, by + 20, 24 + sz, 10 + sz, '#508030');
      px(x + 4, by + 16, 24 + sz, 8, '#3A5820');
      px(x + 6, by + 14, 20 + sz, 6, '#486828');
      px(x + 8, by + 16, 6, 4, '#305018');
      px(x + 16, by + 16, 6, 4, '#305018');
      px(x + 12, by + 14, 6, 4, '#305018');
      px(x + 6, by + 12, 4, 3, '#48A030');
      px(x + 18, by + 12, 3, 3, '#48A030');
      px(x + 8, by + 11, 2, 2, '#F088A0');
      px(x + sz + 22, by + 22, 8, 8, '#508030');
      px(x + sz + 24, by + 24, 4, 4, '#609838');
      px(x + sz + 24, by + 24, 3, 2, '#fff');
      px(x + sz + 25, by + 25, 2, 1, '#2A3818');
      px(x + sz + 26, by + 27, 3, 1, '#406828');
      px(x + sz + 26, by + 28, 2, 3, '#48A030');
      px(x + sz + 28, by + 29, 1, 2, '#58B038');
      px(x + sz + 30, by + 20, 2, 12, '#5A3818');
      px(x + sz + 29, by + 18, 4, 3, '#48A030');
      px(x + 4, by + 30 + sz, 5, 4, '#508030');
      px(x + sz + 20, by + 30 + sz, 5, 4, '#508030');
      px(x, by + 28, 4, 3, '#406828');
      const rgl = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = rgl;
      px(x + 12, by + 12, 3, 3, '#A050F0');
      px(x + 13, by + 13, 1, 1, '#fff');
      cx.globalAlpha = 1;
      break;

    // ==========================================
    // DRAGÓN 🐉 - NUEVOS (únicos)
    // ==========================================

    case 'ornispia': // Ornitorrinco agente secreto con sombrero
      px(x + 6, by + 20, 20 + sz, 12 + sz, '#40A0A8');
      px(x + 8, by + 22, 16 + sz, 8 + sz, '#50B0B8');
      px(x + 4, by + 18, 24 + sz, 14, '#484858');
      px(x + 6, by + 20, 20 + sz, 10, '#585868');
      px(x + 6, by + 28, 20 + sz, 2, '#383838');
      px(x + 14, by + 27, 4, 3, '#C8A830');
      px(x + 6, by + 6, 20 + sz, 14, '#40A0A8');
      px(x + 8, by + 8, 16 + sz, 10, '#50B0B8');
      px(x + 10, by + 16, 12 + sz, 4, '#E8A030');
      px(x + 12, by + 18, 8 + sz, 2, '#D89020');
      px(x + 4, by + 2, 24 + sz, 4, '#383838');
      px(x + 8, by - 1, 16 + sz, 5, '#484848');
      px(x + 10, by + 0, 12 + sz, 3, '#585858');
      px(x + 10, by + 1, 12 + sz, 1, '#282828');
      px(x + 10, by + 10, 4, 4, '#fff');
      px(x + sz + 18, by + 10, 4, 4, '#fff');
      px(x + 12, by + 12, 2, 2, '#181848');
      px(x + sz + 20, by + 12, 2, 2, '#181848');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + sz + 20, by + 12, 1, 1, '#fff');
      px(x - 4, by + 28, 8, 3, '#40A0A8');
      px(x - 6, by + 26, 4, 3, '#50B0B8');
      // Patas palmeadas
      px(x + 8, by + 30 + sz, 5, 4, '#E8A030');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#E8A030');
      // Maletín
      px(x + sz + 24, by + 24, 6, 6, '#383838');
      px(x + sz + 25, by + 25, 4, 4, '#484848');
      px(x + sz + 26, by + 24, 2, 1, '#C8A830');
      break;

    case 'gusarix': // Gusano dentro de manzana
      px(x + 4, by + 10, 24 + sz, 20 + sz, '#D03020');
      px(x + 6, by + 12, 20 + sz, 16 + sz, '#E04030');
      px(x + 8, by + 14, 16 + sz, 12, '#E85040');
      // Mordida en la manzana
      px(x + sz + 20, by + 12, 8, 8, '#F8F0D0');
      px(x + sz + 22, by + 14, 4, 4, '#F8E8C0');
      // Hoja
      px(x + 12, by + 6, 4, 6, '#48A030');
      px(x + 14, by + 4, 3, 4, '#58B838');
      // Tallo
      px(x + 14, by + 6, 3, 4, '#5A3818');
      // Brillo de manzana
      px(x + 8, by + 14, 3, 4, '#F06858');
      px(x + 10, by + 16, 2, 2, '#F8A090');
      // Gusanito asomando
      px(x + sz + 20, by + 14, 6, 4, '#80C040');
      px(x + sz + 22, by + 12, 4, 4, '#90D050');
      // Ojos del gusano (enormes y tiernos)
      px(x + sz + 22, by + 12, 3, 3, '#fff');
      px(x + sz + 24, by + 13, 2, 2, '#181818');
      px(x + sz + 24, by + 13, 1, 1, '#fff');
      // Sonrisa del gusano
      px(x + sz + 24, by + 16, 2, 1, '#609030');
      // Sombra
      px(x + 6, by + 28 + sz, 20 + sz, 2, 'rgba(0,0,0,.15)');
      break;

    // ==========================================
    // HADA 🧚 - NUEVOS (únicos)
    // ==========================================

    case 'elefantasy': // Elefante místico tipo Ganesha
      {
        const ehv = Math.sin(fr * 0.1) * 2;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#D8A0F0';
      pixelGlow(x + 16, by + ehv + 22, 18 + sz, 16);
        cx.globalAlpha = 1;
        // Cuerpo robusto
        px(x + 4, by + ehv + 18, 24 + sz, 14 + sz, '#8870A0');
        px(x + 6, by + ehv + 20, 20 + sz, 10 + sz, '#9880B0');
        // Chaleco dorado
        px(x + 8, by + ehv + 18, 16 + sz, 8, '#C8A830');
        px(x + 10, by + ehv + 20, 12 + sz, 4, '#D8B840');
        // Gemas en chaleco
        px(x + 14, by + ehv + 20, 4, 3, '#D03030');
        px(x + 12, by + ehv + 22, 2, 2, '#3060D0');
        // Brazos superiores (estilo Ganesha)
        px(x, by + ehv + 14, 6, 4, '#8870A0');
        px(x + sz + 26, by + ehv + 14, 6, 4, '#8870A0');
        px(x - 2, by + ehv + 12, 4, 3, '#9880B0');
        px(x + sz + 30, by + ehv + 12, 4, 3, '#9880B0');
        // Objetos en manos superiores
        px(x - 3, by + ehv + 10, 3, 3, '#F8E830'); // Loto
        px(x + sz + 32, by + ehv + 10, 3, 3, '#A050F0'); // Cristal
        // Brazos inferiores
        px(x + 2, by + ehv + 20, 4, 6, '#8870A0');
        px(x + sz + 26, by + ehv + 20, 4, 6, '#8870A0');
        // Cabeza de elefante
        px(x + 4, by + ehv + 2, 24 + sz, 16, '#8870A0');
        px(x + 6, by + ehv + 4, 20 + sz, 12, '#9880B0');
        // Orejas grandes
        px(x, by + ehv + 4, 6, 10, '#A890C0');
        px(x + sz + 26, by + ehv + 4, 6, 10, '#A890C0');
        px(x + 1, by + ehv + 6, 4, 6, '#B8A0D0');
        px(x + sz + 27, by + ehv + 6, 4, 6, '#B8A0D0');
        // Trompa
        px(x + 14, by + ehv + 14, 4, 10, '#9880B0');
        px(x + 12, by + ehv + 22, 4, 3, '#A890C0');
        px(x + 10, by + ehv + 24, 4, 2, '#A890C0');
        // Ojos sabios
        px(x + 8, by + ehv + 8, 5, 4, '#fff');
        px(x + sz + 18, by + ehv + 8, 5, 4, '#fff');
        px(x + 10, by + ehv + 9, 3, 3, '#301848');
        px(x + sz + 20, by + ehv + 9, 3, 3, '#301848');
        px(x + 10, by + ehv + 9, 1, 1, '#fff');
        px(x + sz + 20, by + ehv + 9, 1, 1, '#fff');
        // Tercer ojo en frente
        px(x + 14, by + ehv + 6, 4, 3, '#D03030');
        px(x + 15, by + ehv + 7, 2, 1, '#F8E830');
        // Corona/tiara
        px(x + 8, by + ehv, 16 + sz, 3, '#C8A830');
        px(x + 12, by + ehv - 2, 8 + sz, 3, '#D8B840');
        px(x + 15, by + ehv - 3, 2, 2, '#D03030');
        // Aureola mística
        const eha = Math.sin(fr * 0.08) * 0.3 + 0.7;
        cx.globalAlpha = eha * 0.3;
        cx.fillStyle = '#F8E868';
      pixelGlow(x + 16, by + ehv - 2, 12 + sz, 4);
        cx.globalAlpha = 1;
        // Patas
        px(x + 6, by + ehv + 30 + sz, 5, 5, '#8870A0');
        px(x + sz + 20, by + ehv + 30 + sz, 5, 5, '#8870A0');
      }
      break;

    case 'zumbaflor': // Colibrí barista hiperactivo
      {
        const zhv = Math.sin(fr * 0.15) * 3;
        // Alas rapidísimas (blur)
        cx.globalAlpha = 0.3;
        px(x - 4, by + zhv + 10, 10, 8, '#90D870');
        px(x + sz + 26, by + zhv + 10, 10, 8, '#90D870');
        px(x - 2, by + zhv + 8, 6, 6, '#A0E880');
        px(x + sz + 28, by + zhv + 8, 6, 6, '#A0E880');
        cx.globalAlpha = 1;
        // Cuerpo pequeño
        px(x + 10, by + zhv + 18, 12 + sz, 10 + sz, '#30A048');
        px(x + 12, by + zhv + 20, 8 + sz, 6 + sz, '#40B058');
        // Pecho iridiscente
        px(x + 12, by + zhv + 20, 8 + sz, 4, '#E84880');
        px(x + 14, by + zhv + 22, 4 + sz, 2, '#F060A0');
        // Cabeza
        px(x + 8, by + zhv + 8, 16 + sz, 12, '#30A048');
        px(x + 10, by + zhv + 10, 12 + sz, 8, '#40B058');
        // Ojos enormes (hiperactivo, pupilas dilatadas)
        px(x + 8, by + zhv + 10, 5, 5, '#fff');
        px(x + sz + 18, by + zhv + 10, 5, 5, '#fff');
        px(x + 10, by + zhv + 11, 3, 4, '#181818');
        px(x + sz + 20, by + zhv + 11, 3, 4, '#181818');
        px(x + 10, by + zhv + 11, 1, 1, '#fff');
        px(x + sz + 20, by + zhv + 11, 1, 1, '#fff');
        // Pico largo con taza de café
        px(x + sz + 22, by + zhv + 14, 8, 2, '#E8A030');
        px(x + sz + 24, by + zhv + 13, 2, 3, '#D89020');
        // Taza de café en pico
        px(x + sz + 28, by + zhv + 12, 5, 4, '#F0F0F0');
        px(x + sz + 29, by + zhv + 10, 3, 3, '#8A5020');
        if (f % 8 < 4) {
          px(x + sz + 30, by + zhv + 8, 2, 2, '#E8E0D0');
        } // Vapor
        // Cola con plumas
        px(x + 4, by + zhv + 26, 6, 4, '#30A048');
        px(x + 2, by + zhv + 28, 4, 3, '#40B058');
        px(x, by + zhv + 30, 3, 2, '#50C068');
        // Patas diminutas
        px(x + 12, by + zhv + 26 + sz, 3, 3, '#D89020');
        px(x + 18, by + zhv + 26 + sz, 3, 3, '#D89020');
      }
      break;

    // ==========================================
    // DEFAULT - Criatura genérica por tipo
    // ==========================================
    default: {
      const tp2 = CDB[id]?.tp || 'normal';
      const tc2 = tCol(tp2);
      const tcl2 = tColL(tp2);
      px(x + 6, by + 20, 20 + sz, 14 + sz, tc2);
      px(x + 8, by + 22, 16 + sz, 10 + sz, tcl2);
      px(x + 6, by + 6, 20 + sz, 16, tc2);
      px(x + 8, by + 8, 16 + sz, 12, tcl2);
      px(x + 10, by + 10, 12 + sz, 8, tc2);
      px(x + 6, by + 2, 4, 6, tc2);
      px(x + sz + 22, by + 2, 4, 6, tc2);
      px(x + 10, by + 10, 5, 5, '#fff');
      px(x + 19, by + 10, 5, 5, '#fff');
      px(x + 12, by + 12, 3, 3, '#181818');
      px(x + 21, by + 12, 3, 3, '#181818');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + 21, by + 12, 1, 1, '#fff');
      px(x + 14, by + 17, 4, 2, tc2);
      px(x + 8, by + 32 + sz, 5, 5, tc2);
      px(x + 19, by + 32 + sz, 5, 5, tc2);
      cx.fillStyle = tc2;
      cx.font = '6px "Press Start 2P"';
      cx.fillText(tEmo(tp2), x + 12, by + 42 + sz);
      break;
    }
  } // fin switch
} // fin dCre

export { dCre };
