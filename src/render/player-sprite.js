// Sprite del jugador (protagonista del juego).
//
// El PNG del prota está embebido como base64 (HERO_B64), un spritesheet
// medieval de OpenGameArt ("2D RPG character walk" por arikel,
// licencia CC-BY 4.0 / CC0). 8 columnas x 4 filas, cada frame 24x32.
//
// Export único: dPlayerGBA (dibuja el prota en (x, y) mirando en dir).
// Todo lo demás es interno al módulo.

import { cx } from '../core/canvas.js';
import { px } from './render-utils.js';
import { G } from '../core/game-state.js';
import { SK } from './skin-colors.js';

// === NUEVO SPRITE DEL JUGADOR - ESTILO PIXEL MEDIEVAL ===
// === SPRITE DEL JUGADOR - ESTILO PIXEL ART MEDIEVAL ===
// === PROTA: sprite medieval de uso libre (OpenGameArt: "2D RPG character walk
// spritesheet" por arikel, CC-BY 4.0 / CC0). Hoja 192x128 = 8 columnas x 4 filas,
// cada marco 24x32. Filas: 0=frente(abajo), 1=espalda(arriba), 2=perfil izquierda,
// 3=perfil derecha. Ciclo de caminado: columna 0 en reposo, 1/2 en movimiento.
const HERO_FW = 24, HERO_FH = 32;
const HERO_DIR_ROW = { 0: 0, 1: 3, 2: 2, 3: 1 }; // p.d (0=abajo,1=der,2=izq,3=arr) -> fila
const HERO_B64 = "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";
let heroImg = null, heroReady = false;
if (typeof Image !== 'undefined') {
  try {
    heroImg = new Image();
    heroImg.onload = function () { heroReady = true; };
    heroImg.onerror = function () { heroImg = null; };
    heroImg.src = 'data:image/png;base64,' + HERO_B64;
  } catch (e) { heroImg = null; }
}

// Variante actual del protagonista.
// 'chibi00s' = proporciones cabezonas tipo RPG portátil de los 00s,
// con paleta verde/beige (sin copiar assets comerciales).
// Cambia a 'spritesheet' si quieres volver al sprite medieval importado.
const HERO_STYLE = 'chibi00s';

function dPlayerChibi00s(x, y, dir, f) {
  // Protagonista original inspirado en entrenadores RPG portátiles de los 00s:
  // gorra roja con frente claro, chaqueta roja, mochila y proporción chibi.
  // No es un calco de ningún personaje comercial.
  const moving = !!G.pl.moving;
  const step = moving ? (Math.floor(G.pl.f / 6) % 2 === 0 ? 1 : -1) : 0;
  const bob = moving ? Math.sin(f * 0.32) * 1 : 0;
  const by = Math.round(y + bob);
  const OX = x + 8;
  const OY = by + 6;

  const OUT = '#151515';
  const SKIN = '#F0C49A';
  const SKIN2 = '#D99B70';
  const HAIR = '#24160F';
  const HAIR2 = '#4A2A1A';
  const RED = '#D92F2F';
  const RED2 = '#A81F27';
  const RED3 = '#F06050';
  const WHITE = '#F4F0E8';
  const SHADE = '#CFC7B8';
  const SHIRT = '#202838';
  const JEAN = '#315D9A';
  const JEAN2 = '#203F70';
  const BAG = '#C2A06A';
  const BAG2 = '#8A6A3A';
  const BOOT = '#3A2418';
  const EYE = '#101010';
  const MOUTH = '#8A463A';

  cx.fillStyle = 'rgba(0,0,0,.25)';
  pixelGlow(x + 16, by + 35, 9, 2.8);

  const R = (c, r, w, h, col) => px(OX + c, OY + r, w, h, col);
  const RO = (c, r, w, h, col) => { px(OX + c - 1, OY + r - 1, w + 2, h + 2, OUT); R(c, r, w, h, col); };
  const Rf = (flip, c, r, w, h, col) => R(flip ? 16 - c - w : c, r, w, h, col);
  const ROf = (flip, c, r, w, h, col) => {
    px(OX + (flip ? 16 - c - w : c) - 1, OY + r - 1, w + 2, h + 2, OUT);
    Rf(flip, c, r, w, h, col);
  };

  if (dir === 0) {
    // FRENTE
    RO(3, 21, 4, 3, BOOT);
    RO(9, 21, 4, 3, BOOT);
    R(5, 17, 3, 5, JEAN);
    R(9, 17, 3, 5, JEAN);
    R(5, 20, 3, 2, step > 0 ? JEAN2 : JEAN);
    R(9, 20, 3, 2, step < 0 ? JEAN2 : JEAN);

    // mochila asomando por los costados
    R(1, 12, 3, 8, BAG2);
    R(12, 12, 3, 8, BAG2);
    R(2, 13, 1, 5, BAG);
    R(13, 13, 1, 5, BAG);

    RO(3, 12, 10, 7, RED);
    R(4, 13, 8, 2, RED3);
    R(4, 17, 8, 2, RED2);
    R(6, 12, 4, 7, SHIRT);
    R(7, 13, 2, 2, WHITE); // cuello claro
    R(1, 14 + (step < 0 ? 1 : 0), 3, 5, RED2);
    R(12, 14 + (step > 0 ? 1 : 0), 3, 5, RED2);
    R(1, 18 + (step < 0 ? 1 : 0), 3, 2, SKIN);
    R(12, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);

    // cabeza
    R(1, 2, 14, 10, OUT);
    R(2, 3, 12, 9, SKIN);
    R(2, 4, 3, 7, HAIR);
    R(11, 4, 3, 7, HAIR);
    R(4, 4, 8, 2, HAIR);
    R(5, 5, 6, 1, HAIR2);

    // gorra roja tipo entrenador, con frente blanco y visera
    R(0, 0, 16, 4, OUT);
    R(1, 0, 14, 3, RED);
    R(5, 0, 6, 3, WHITE);
    R(4, 2, 8, 2, SHADE);
    R(3, 3, 10, 2, RED2); // visera
    R(6, 1, 4, 1, '#FFFFFF');

    // ojos/cara
    R(5, 7, 2, 3, EYE);
    R(10, 7, 2, 3, EYE);
    R(5, 7, 1, 1, '#FFFFFF');
    R(10, 7, 1, 1, '#FFFFFF');
    R(7, 10, 3, 1, MOUTH);
  } else if (dir === 3) {
    // ESPALDA
    RO(3, 21, 4, 3, BOOT);
    RO(9, 21, 4, 3, BOOT);
    R(5, 17, 3, 5, JEAN);
    R(9, 17, 3, 5, JEAN);

    // mochila más visible de espalda
    RO(3, 11, 10, 10, BAG);
    R(4, 12, 8, 8, BAG2);
    R(5, 13, 6, 5, BAG);
    R(7, 14, 2, 2, '#E0C080');
    R(2, 13 + (step > 0 ? 1 : 0), 3, 6, RED2);
    R(12, 13 + (step < 0 ? 1 : 0), 3, 6, RED2);
    R(2, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);
    R(12, 18 + (step < 0 ? 1 : 0), 3, 2, SKIN);

    R(1, 2, 14, 10, OUT);
    R(2, 3, 12, 9, HAIR);
    R(4, 4, 8, 2, HAIR2);

    // gorra desde atrás
    R(0, 0, 16, 4, OUT);
    R(1, 0, 14, 3, RED);
    R(3, 2, 10, 2, RED2);
    R(5, 0, 6, 2, WHITE);
  } else {
    // PERFIL
    const flip = dir === 2;
    ROf(flip, 4, 21, 4, 3, BOOT);
    ROf(flip, 9, 21, 3, 3, BOOT);
    Rf(flip, 5, 17, 3, 5, JEAN);
    Rf(flip, 9, 17, 3, 5, JEAN2);

    // mochila lateral
    ROf(flip, 2, 12, 4, 8, BAG);
    Rf(flip, 3, 13, 2, 6, BAG2);

    ROf(flip, 5, 12, 8, 7, RED);
    Rf(flip, 6, 13, 6, 2, RED3);
    Rf(flip, 6, 17, 6, 2, RED2);
    Rf(flip, 8, 13, 3, 6, SHIRT);
    Rf(flip, 12, 14 + (step > 0 ? 1 : 0), 3, 5, RED2);
    Rf(flip, 12, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);

    // cabeza perfil
    Rf(flip, 4, 2, 10, 10, OUT);
    Rf(flip, 5, 3, 8, 9, SKIN);
    Rf(flip, 4, 4, 3, 7, HAIR);
    Rf(flip, 5, 4, 7, 2, HAIR);
    Rf(flip, 12, 8, 1, 2, SKIN2); // nariz
    Rf(flip, 10, 7, 2, 3, EYE);
    Rf(flip, 10, 10, 3, 1, MOUTH);

    // gorra de perfil con visera hacia donde mira
    Rf(flip, 3, 0, 11, 4, OUT);
    Rf(flip, 4, 0, 9, 3, RED);
    Rf(flip, 7, 0, 5, 2, WHITE);
    Rf(flip, 11, 2, 5, 2, RED2); // visera
    Rf(flip, 9, 1, 2, 1, '#FFFFFF');
  }
}

const HERO_MAP_SCALE = 1.22; // tamaño del prota en mapa: a la altura de los NPCs normales

function dPlayerGBA(x, y, dir, f) {
  if (HERO_STYLE === 'chibi00s') {
    // Escalar solo al protagonista para que no se vea más pequeño que el resto
    // de personajes. David-O mantiene su proporción especial de NPC alto/delgado.
    cx.save();
    cx.translate(Math.round(x - 4), Math.round(y - 8));
    cx.scale(HERO_MAP_SCALE, HERO_MAP_SCALE);
    dPlayerChibi00s(0, 0, dir, f);
    cx.restore();
    return;
  }
  if (heroReady && heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
    const row = (HERO_DIR_ROW[dir] !== undefined) ? HERO_DIR_ROW[dir] : 0;
    const moving = G.pl.moving;
    const col = moving ? ((Math.floor(G.pl.f / 5) % 2 === 0) ? 2 : 1) : 0;
    const bob = moving ? Math.sin(f * 0.3) * 1.0 : 0;
    // sombra en el suelo
    cx.fillStyle = 'rgba(0,0,0,.22)';
    pixelGlow(x + 16, y + 38, 8, 2.5);
    try {
      cx.drawImage(heroImg, col * HERO_FW, row * HERO_FH, HERO_FW, HERO_FH,
                   x + 4, Math.round(y + 7 + bob), HERO_FW, HERO_FH);
    } catch (e) {}
    return;
  }
  // Respaldo por rectangulos (por si la imagen no llega a cargar en algun entorno)
  dPlayerGBAFallback(x, y, dir, f);
}

function dPlayerGBAFallback(x, y, dir, f) {
  // Prota estilo GBA/RPG Maker: solo rectangulos, 16x24, contorno negro 1px
  const bob = G.pl.moving ? Math.sin(f * 0.3) * 1.2 : 0;
  const by = y + bob;
  const OX = x + 8;        // cuerpo de 16px centrado en el tile de 32px
  const OY = by + 14;      // los pies quedan ~ a ppy+30 (suelo del tile)

  const OUT = '#0E0E10';     // contorno negro
  const HAIR = '#16110D';    // pelo negro
  const SKIN = '#F2CBA0', SKINS = '#D6A878';
  const SHIRT = '#3FA34D', SHIRTS = '#2E7D38';
  const PANTS = '#3A2414';   // pantalon marron oscuro
  const BOOT = '#5A3818';    // botas marrones
  const BELT = '#5A3A1E';    // cinturon marron
  const BUCKLE = '#E8C24A';  // hebilla dorada
  const EYE = '#0E0E10';     // ojos negros (sin pupila)
  const MOUTH = '#7A2A18';   // boca

  // sombra en el suelo
  cx.fillStyle = 'rgba(0,0,0,.22)';
  pixelGlow(x + 16, by + 39, 8, 2.5);

  // helpers (rectangulos alineados; sin curvas ni poligonos)
  const R = (c, r, w, h, col) => px(OX + c, OY + r, w, h, col);
  const RO = (c, r, w, h, col) => { px(OX + c - 1, OY + r - 1, w + 2, h + 2, OUT); R(c, r, w, h, col); };

  switch (dir) {
    case 0: { // ===== FRENTE =====
      RO(4, 21, 3, 3, BOOT); RO(9, 21, 3, 3, BOOT);   // botas
      RO(5, 18, 6, 4, PANTS);                         // piernas / pantalon
      RO(2, 12, 2, 5, SHIRT); RO(12, 12, 2, 5, SHIRT);// brazos (mangas)
      R(2, 16, 2, 2, SKIN); R(12, 16, 2, 2, SKIN);    // manos
      RO(3, 12, 10, 6, SHIRT); R(3, 13, 10, 1, SHIRTS);// camisa hombros rectos
      R(4, 16, 8, 2, BELT); R(7, 16, 2, 2, BUCKLE);   // cinturon + hebilla centrada
      R(6, 11, 4, 1, SKIN);                           // cuello
      // cabeza
      R(1, 0, 14, 11, OUT);     // base / contorno
      R(2, 0, 12, 3, HAIR);     // copete
      R(2, 0, 2, 9, HAIR);      // mecha izquierda (hasta mandibula)
      R(12, 0, 2, 9, HAIR);     // mecha derecha
      R(4, 4, 8, 7, SKIN);      // cara
      R(4, 3, 8, 1, HAIR);      // flequillo corto
      R(5, 4, 2, 4, EYE);       // ojo izquierdo 2x4 sin pupila
      R(9, 4, 2, 4, EYE);       // ojo derecho 2x4 sin pupila
      R(6, 8, 4, 2, MOUTH);     // boca 4x2
      break;
    }
    case 3: { // ===== ESPALDA =====
      RO(4, 21, 3, 3, BOOT); RO(9, 21, 3, 3, BOOT);
      RO(5, 18, 6, 4, PANTS);
      RO(2, 12, 2, 5, SHIRT); RO(12, 12, 2, 5, SHIRT);
      R(2, 16, 2, 2, SKIN); R(12, 16, 2, 2, SKIN);
      RO(3, 12, 10, 6, SHIRT); R(3, 13, 10, 1, SHIRTS);
      R(4, 16, 8, 2, BELT); R(7, 16, 2, 2, BUCKLE);
      R(6, 11, 4, 1, SKIN);     // nuca
      R(1, 0, 14, 11, OUT);     // cabeza toda de pelo
      R(2, 0, 12, 11, HAIR);
      R(4, 1, 2, 3, '#2A221A'); // sombra de volumen en el pelo
      break;
    }
    case 1:
    case 2: { // ===== PERFIL (derecha / izquierda) =====
      const flip = dir === 2;
      const Rf = (c, r, w, h, col) => px(OX + (flip ? 16 - c - w : c), OY + r, w, h, col);
      const ROf = (c, r, w, h, col) => { px(OX + (flip ? 16 - c - w : c) - 1, OY + r - 1, w + 2, h + 2, OUT); Rf(c, r, w, h, col); };
      ROf(4, 21, 3, 3, BOOT); ROf(8, 21, 3, 3, BOOT);  // botas
      ROf(5, 18, 5, 4, PANTS);                         // pierna / pantalon
      Rf(11, 13, 2, 4, SHIRT); Rf(11, 16, 2, 2, SKIN); // brazo delantero + mano
      ROf(3, 12, 10, 6, SHIRT); Rf(3, 13, 10, 1, SHIRTS);// camisa
      Rf(4, 16, 8, 2, BELT); Rf(9, 16, 2, 2, BUCKLE);  // cinturon + hebilla al frente
      Rf(5, 11, 4, 1, SKIN);                           // cuello
      // cabeza de perfil (el frente mira a la derecha en dir=1)
      Rf(4, 0, 9, 11, OUT);     // base
      Rf(4, 0, 9, 3, HAIR);     // copete
      Rf(4, 0, 2, 9, HAIR);     // pelo en la nuca (atras)
      Rf(5, 4, 7, 7, SKIN);     // cara
      Rf(5, 3, 7, 1, HAIR);     // frente
      Rf(11, 6, 1, 2, SKINS);   // nariz (rectangulo)
      Rf(8, 4, 2, 4, EYE);      // ojo 2x4
      Rf(9, 8, 3, 2, MOUTH);    // boca
      break;
    }
  }
}

function dPlayerBig(x, y) {
  const by = y;

  // Botas
  px(x + 16, by + 62, 14, 8, '#5A3818');
  px(x + 34, by + 62, 14, 8, '#5A3818');
  px(x + 18, by + 64, 10, 6, '#6A4828');
  px(x + 36, by + 64, 10, 6, '#6A4828');

  // Piernas
  px(x + 18, by + 46, 12, 18, '#584030');
  px(x + 34, by + 46, 12, 18, '#584030');
  px(x + 20, by + 48, 8, 14, '#685040');
  px(x + 36, by + 48, 8, 14, '#685040');

  // Cinturón
  px(x + 12, by + 42, 40, 4, '#4A2A10');
  px(x + 28, by + 41, 8, 5, '#C8A830');
  px(x + 30, by + 42, 4, 3, '#E8C840');

  // Túnica verde
  px(x + 10, by + 20, 44, 24, '#2A6830');
  px(x + 14, by + 22, 36, 20, '#307038');
  px(x + 18, by + 24, 28, 16, '#387840');
  // Borde decorativo
  px(x + 10, by + 40, 44, 3, '#1A5020');
  px(x + 14, by + 41, 36, 1, '#408848');
  // Cordones
  px(x + 30, by + 24, 3, 14, '#4A2A10');
  px(x + 28, by + 26, 2, 2, '#C8A830');
  px(x + 28, by + 32, 2, 2, '#C8A830');

  // Mangas
  px(x + 6, by + 22, 8, 14, '#2A6830');
  px(x + 50, by + 22, 8, 14, '#2A6830');
  px(x + 8, by + 24, 4, 10, '#307038');
  px(x + 52, by + 24, 4, 10, '#307038');

  // Manos
  px(x + 4, by + 34, 6, 6, SK.b);
  px(x + 54, by + 34, 6, 6, SK.b);
  px(x + 5, by + 35, 4, 4, SK.a);
  px(x + 55, by + 35, 4, 4, SK.a);

  // Capa
  px(x + 4, by + 20, 8, 28, '#6A4A28');
  px(x + 6, by + 22, 4, 24, '#7A5A38');
  px(x + 4, by + 46, 6, 4, '#5A3A18');

  // Cuello
  px(x + 24, by + 14, 16, 8, SK.b);
  px(x + 26, by + 16, 12, 4, SK.a);

  // Cabeza
  px(x + 18, by + 0, 28, 18, SK.b);
  px(x + 20, by + 2, 24, 14, SK.a);
  // Mejillas
  px(x + 20, by + 12, 4, 3, '#E8B898');
  px(x + 40, by + 12, 4, 3, '#E8B898');

  // Pelo
  px(x + 16, by - 4, 32, 8, '#1A1A1A');
  px(x + 14, by + 0, 6, 10, '#1A1A1A');
  px(x + 44, by + 0, 6, 10, '#1A1A1A');
  px(x + 18, by - 6, 28, 4, '#1A1A1A');
  px(x + 20, by - 8, 24, 4, '#282828');
  // Mechón
  px(x + 18, by + 0, 6, 4, '#1A1A1A');
  // Brillo
  px(x + 24, by - 4, 6, 2, '#383838');

  // Ojos
  px(x + 22, by + 6, 6, 5, '#fff');
  px(x + 36, by + 6, 6, 5, '#fff');
  px(x + 25, by + 8, 3, 3, '#283848');
  px(x + 39, by + 8, 3, 3, '#283848');
  px(x + 25, by + 8, 2, 1, '#fff');
  px(x + 39, by + 8, 2, 1, '#fff');

  // Nariz y boca
  px(x + 30, by + 11, 4, 2, '#D8A878');
  px(x + 28, by + 14, 8, 2, '#C08868');

  // Bolso
  px(x + 48, by + 28, 8, 12, '#6A4A28');
  px(x + 50, by + 30, 4, 8, '#7A5A38');
  px(x + 50, by + 28, 4, 2, '#C8A830');
  px(x + 46, by + 20, 2, 10, '#5A3A18');
}

export { dPlayerGBA };
