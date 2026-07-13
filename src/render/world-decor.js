// Decoración del mundo (sombras, árboles de ruta, Proa, carteles, retratos).

import { cx } from '../core/canvas.js';
import { px, pixelGlow } from './render-utils.js';
import { SK } from './skin-colors.js';

// === SOMBRA PIXELADA (para sprites) ===
function dShadow(x, y, w = 10, h = 3) {
  cx.fillStyle = 'rgba(0,0,0,.25)';
  pixelGlow(x, y, w, h);
}

function dRouteTree(x, y, f) {
  // Árbol de bloqueo: hace que solo exista el camino central.
  dShadow(x + 16, y + 29, 12, 4);
  px(x + 13, y + 18, 7, 12, '#6A4828');
  px(x + 11, y + 22, 11, 8, '#7A5630');
  px(x + 6, y + 7, 20, 14, '#185C2A');
  px(x + 3, y + 13, 26, 12, '#20743A');
  px(x + 8, y + 3, 16, 10, '#2B8A45');
  px(x + 10, y + 9, 8, 5, '#45A85A');
  px(x + 22, y + 16, 4, 4, '#145020');
}

function dRouteProa(x, y, f) {
  // Proa guardián en el único hueco del camino.
  dShadow(x + 16, y + 31, 9, 3);
  const by = y + Math.sin(f * 0.08) * 0.8;
  px(x + 10, by + 26, 4, 4, '#4A3018');
  px(x + 18, by + 26, 4, 4, '#4A3018');
  px(x + 8, by + 18, 16, 9, '#2858A0');
  // Uniforme del personal: polo negro con flecha amarilla pequeña
  px(x + 6, by + 10, 20, 10, '#101010');
  px(x + 8, by + 12, 16, 7, '#1A1A1A');
  px(x + 13, by + 13, 6, 2, '#FFD830');
  px(x + 17, by + 11, 3, 6, '#FFD830');
  px(x + 4, by + 12, 4, 8, SK.a);
  px(x + 24, by + 12, 4, 8, SK.a);
  px(x + 13, by + 8, 6, 3, SK.a);
  px(x + 9, by + 0, 14, 10, SK.a);
  px(x + 10, by + 1, 12, 8, SK.d);
  px(x + 7, by - 3, 18, 5, '#2A5830');
  px(x + 5, by - 1, 22, 3, '#3A7A40');
  px(x + 12, by + 4, 3, 3, '#111');
  px(x + 18, by + 4, 3, 3, '#111');
  px(x + 14, by + 8, 4, 1, '#C08868');
  if (f % 40 < 20) {
    cx.fillStyle = '#ffd700';
    cx.font = '9px "Press Start 2P"';
    cx.fillText('!', x + 26, by - 5);
  }
}


function dRouteSign(x, y, f) {
  dShadow(x + 16, y + 29, 8, 3);
  px(x + 14, y + 15, 4, 16, '#6A4828');
  px(x + 7, y + 6, 22, 12, '#8A5A28');
  px(x + 9, y + 8, 18, 8, '#C09048');
  px(x + 10, y + 9, 16, 1, '#E0B060');
  px(x + 11, y + 12, 10, 2, '#5A3818');
  px(x + 23, y + 11, 2, 3, '#5A3818');
  if (f % 60 < 30) px(x + 24, y + 5, 2, 2, '#ffd700');
}

function dFallenPortrait(id, x, y, sc = 4) {
  cx.save();
  cx.translate(x, y);
  cx.scale(sc, sc);
  const R = (a, b, w, h, c) => px(a, b, w, h, c);
  const SK1 = '#F0C8A0', SK2 = '#D9A77E', OUT = '#171717';
  // marco interno de personaje 24x32
  if (id === 'rafa') {
    R(7, 27, 4, 4, '#506858'); R(14, 27, 4, 4, '#506858');
    R(7, 20, 4, 8, '#607868'); R(14, 20, 4, 8, '#607868');
    R(5, 12, 16, 9, '#D8C8A0'); R(7, 13, 12, 7, '#E8D8B8');
    R(4, 13, 4, 8, SK1); R(18, 13, 4, 8, SK1);
    R(9, 9, 6, 4, SK2); R(6, 2, 14, 9, SK1); R(7, 3, 12, 7, '#F5D2AA');
    R(5, 0, 16, 5, '#2B2018'); R(6, -1, 14, 2, '#3A2A20');
    R(6, 5, 5, 4, OUT); R(13, 5, 5, 4, OUT); R(7, 6, 3, 2, '#C8D8E8'); R(14, 6, 3, 2, '#C8D8E8'); R(11, 6, 2, 1, OUT);
    R(10, 10, 5, 1, '#8A5040');
  } else if (id === 'maria') {
    R(8, 27, 4, 4, '#1A1A1A'); R(14, 27, 4, 4, '#1A1A1A');
    R(6, 19, 16, 9, '#171717'); R(5, 12, 18, 8, '#F0F0F0'); R(7, 13, 14, 6, '#FFFFFF');
    R(4, 13, 4, 8, SK1); R(20, 13, 4, 8, SK1);
    R(9, 9, 6, 4, SK2); R(6, 2, 14, 9, SK1); R(7, 3, 12, 7, '#F5D2AA');
    R(4, 0, 18, 6, '#111'); R(3, 3, 4, 18, '#111'); R(19, 3, 4, 18, '#111'); R(5, 16, 3, 8, '#080808'); R(20, 16, 3, 8, '#080808');
    R(7, 5, 4, 3, '#fff'); R(15, 5, 4, 3, '#fff'); R(8, 6, 2, 2, OUT); R(16, 6, 2, 2, OUT);
    R(7, 4, 5, 1, OUT); R(15, 4, 5, 1, OUT); R(11, 10, 5, 1, '#7A3030');
  } else { // mancilla
    R(7, 27, 4, 4, '#6E7788'); R(14, 27, 4, 4, '#6E7788');
    R(7, 20, 4, 8, '#8790A0'); R(14, 20, 4, 8, '#8790A0');
    R(4, 11, 18, 11, '#98A4B8'); R(6, 12, 14, 9, '#B8C4D8'); R(10, 14, 6, 5, '#E8C830');
    R(3, 11, 4, 5, '#C8A830'); R(21, 11, 4, 5, '#C8A830');
    R(9, 8, 6, 5, SK2); R(6, 1, 14, 10, SK1); R(7, 2, 12, 8, '#F5D2AA');
    R(5, -1, 16, 5, '#7A5128'); R(4, 1, 4, 6, '#6A4120'); R(18, 1, 4, 6, '#6A4120');
    R(8, 5, 3, 3, '#fff'); R(15, 5, 3, 3, '#fff'); R(9, 6, 2, 2, OUT); R(16, 6, 2, 2, OUT);
    R(11, 9, 5, 4, '#5A321C'); // chivito, sin bigote
    R(11, 9, 5, 1, '#8A5040');
  }
  cx.restore();
}

export { dShadow, dRouteTree, dRouteProa, dRouteSign, dFallenPortrait };
