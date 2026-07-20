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

function dRouteProa(x, y, f, station = null, authorized = false) {
  // Puesto Proa compacto: permanece visible incluso después de autorizar la ruta.
  const col = authorized ? '#40D870' : '#E84838';
  dShadow(x + 16, y + 31, 14, 4);
  px(x + 3, y + 18, 26, 13, '#26313B');
  px(x + 5, y + 20, 22, 9, '#465461');
  px(x + 7, y + 22, 18, 5, '#6C7B86');
  px(x + 11, y + 6, 10, 14, '#D8D8C8');
  px(x + 13, y + 8, 6, 10, col);
  px(x + 14, y + 10, 4, 5, '#111');
  cx.fillStyle = '#FFF';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('P', x + 14, y + 15);
  if (!authorized && f % 40 < 20) {
    cx.fillStyle = '#FFD700'; cx.font = '8px "Press Start 2P"'; cx.fillText('!', x + 27, y + 5);
  }
  if (station && f % 80 < 50) {
    cx.fillStyle = authorized ? '#B8FFD0' : '#FFD0C8';
    cx.font = '4px "Press Start 2P"';
    cx.fillText(authorized ? 'AUT.' : 'DIP.', x + 1, y - 2);
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
