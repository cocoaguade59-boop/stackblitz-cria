// Tiles del mapa del mundo exterior (Bloque 7 original).
//
// Exporta:
//   - dTileW(c, r): dibuja el tile en la columna c, fila r del mapa
//   - lerpColor(a, b, t): utilidad para interpolar dos colores hex
//   - drawWorldDecorBase(c, r, x, y): decoración base (arbustos, flores)

import { cx } from '../core/canvas.js';
import { px, pixelGlow, pixelDiamond } from './render-utils.js';
import { dShadow } from './world-decor.js';
import { fr } from '../core/frame.js';
import { T, cam, wMap } from '../core/world-constants.js';
import { towerOpen } from '../core/game-flags.js';

// Mezcla dos colores hex (#RRGGBB) en el factor t (0..1)
function lerpColor(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const R = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const G = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const B = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return 'rgb(' + R + ',' + G + ',' + B + ')';
}


function drawWorldDecorBase(c, r, x, y) {
  // Base contextual para decoración: si está en cantera, se dibuja sobre piedra;
  // si está al norte, se adapta al suelo frío/nevado; si no, césped normal.
  const inRodaje = c >= 48 && c <= 64 && r >= 75 && r <= 89;
  const inMontajeLookout = c >= 40 && c <= 52 && r >= 16 && r <= 22;
  if (inRodaje || inMontajeLookout) {
    cx.fillStyle = inRodaje ? '#8A8172' : '#AFA898';
    cx.fillRect(x, y, T, T);
    cx.fillStyle = inRodaje ? '#9A9182' : '#C2BAAA';
    if ((c + r) % 2 === 0) cx.fillRect(x + 1, y + 1, 14, 14);
    else cx.fillRect(x + 17, y + 1, 14, 14);
    cx.fillStyle = inRodaje ? '#746C60' : '#8E8678';
    cx.fillRect(x, y + 15, T, 1);
    cx.fillRect(x + 15, y, 1, T);
    return;
  }
  const snow = Math.max(0, Math.min(1, (68 - r) / 46));
  const baseA = lerpColor('#58A830', '#F2F8F4', snow);
  const baseB = lerpColor('#48982A', '#E2ECE6', snow);
  cx.fillStyle = (c + r) % 2 ? baseA : baseB;
  cx.fillRect(x, y, T, T);
  cx.fillStyle = lerpColor('#408820', '#C2D4C2', snow);
  if ((c * 7 + r * 13) % 5 === 0) cx.fillRect(x + 8, y + 14, 2, 4);
  if (snow > 0.25) {
    cx.fillStyle = 'rgba(255,255,255,' + (0.35 + snow * 0.45).toFixed(2) + ')';
    cx.fillRect(x + 5, y + 7, 3, 2);
    cx.fillRect(x + 22, y + 24, 3, 2);
  }
}

function dTileW(c, r) {
  const x = c * T - cam.x,
    y = r * T - cam.y;
  // FOV mundo 15×9 → VIEW_W/H = 480×288 (+ margen 1 tile)
  if (x < -T || x > 480 + T || y < -T || y > 288 + T) return;
  const t = wMap[r]?.[c];
  if (t === undefined) return;

  switch (t) {
    case 0: { // Hierba: blanca desde el 5o pueblo (norte), verde al sur
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const baseA = lerpColor('#58A830', '#F2F8F4', snow);
      const baseB = lerpColor('#48982A', '#E2ECE6', snow);
      cx.fillStyle = (c + r) % 2 ? baseA : baseB;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#408820', '#C2D4C2', snow);
      if ((c * 7 + r * 13) % 5 === 0) cx.fillRect(x + 8, y + 14, 2, 4);
      if ((c * 3 + r * 11) % 7 === 0) cx.fillRect(x + 20, y + 8, 3, 2);
      if ((c * 5 + r * 3) % 9 === 0) cx.fillRect(x + 24, y + 22, 2, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.5 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 5 + ((r * 7) % 22), y + 6, 2, 2);
        if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 18, y + 20, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 12, y + 26, 3, 2);
      }
      break;
    }
    case 1: // Camino de tierra con textura
      cx.fillStyle = '#C8B898';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#D8C8A8';
      if ((c + r) % 3 === 0) cx.fillRect(x + 6, y + 6, 4, 4);
      if ((c + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      cx.fillStyle = '#B8A888';
      if ((c + r) % 4 === 0) cx.fillRect(x + 14, y + 24, 3, 3);
      // Bordes sutiles
      cx.fillStyle = '#A89878';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      break;

    case 2: { // Agua: congelada en el norte, liquida al sur
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      if (snow > 0.5) {
        // Lago congelado (hielo)
        cx.fillStyle = '#CDE6F2';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#B6D6E8';
        if ((c + r) % 3 === 0) cx.fillRect(x + 4, y + 6, 10, 6);
        if ((c * 2 + r) % 4 === 0) cx.fillRect(x + 18, y + 16, 12, 8);
        cx.fillStyle = '#9CC2DA';
        cx.fillRect(x + 6, y + 4, 14, 1);
        cx.fillRect(x + 2, y + 20, 20, 1);
        cx.fillStyle = 'rgba(255,255,255,.6)';
        cx.fillRect(x + 10, y + 8, 8, 2);
        cx.fillStyle = '#8FB0C8';
        cx.fillRect(x, y, T, 1);
        cx.fillRect(x, y + T - 1, T, 1);
      } else {
        // Agua con reflejos
        const w = Math.sin(fr * 0.04 + c * 0.7 + r * 0.5);
        cx.fillStyle = w > 0 ? '#2070C0' : '#3088D0';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#48A0E8';
        cx.fillRect(x + Math.sin(fr * 0.06 + c * 2) * 5 + 10, y + 8, 12, 2);
        cx.fillRect(x + Math.sin(fr * 0.05 + c * 1.5) * 4 + 6, y + 20, 10, 2);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + Math.sin(fr * 0.08 + c) * 6 + 8, y + 14, 6, 1);
        cx.fillStyle = '#1858A0';
        cx.fillRect(x, y, T, 1);
        cx.fillRect(x, y + T - 1, T, 1);
      }
      break;
    }
    case 3: { // Árbol del mundo: patrón base del personal, adaptado al clima
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      // Suelo bajo el árbol: verde al sur, nevado/frío al norte
      const groundA = lerpColor('#58A830', '#F2F8F4', snow);
      const groundB = lerpColor('#48982A', '#DCE8E2', snow);
      cx.fillStyle = (c + r) % 2 ? groundA : groundB;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#3F8C24', '#C8D8CC', snow);
      if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 5, y + 7, 3, 2);
      if ((c * 7 + r) % 5 === 0) cx.fillRect(x + 22, y + 24, 3, 2);

      // Mismo patrón visual que los árboles del personal de ruta
      dShadow(x + 16, y + 29, 12, 4);
      const trunk = lerpColor('#6A4828', '#6B5A4E', snow);
      const trunkL = lerpColor('#7A5630', '#827064', snow);
      px(x + 13, y + 18, 7, 12, trunk);
      px(x + 11, y + 22, 11, 8, trunkL);

      const dark = lerpColor('#185C2A', '#AFC4B8', snow);
      const mid = lerpColor('#20743A', '#CBDCD2', snow);
      const light = lerpColor('#2B8A45', '#E3EEE8', snow);
      const hi = lerpColor('#45A85A', '#FFFFFF', snow);
      // copa en tres masas rectangulares, no pino triangular
      px(x + 6, y + 7, 20, 14, dark);
      px(x + 3, y + 13, 26, 12, mid);
      px(x + 8, y + 3, 16, 10, light);
      px(x + 10, y + 9, 8, 5, hi);
      px(x + 22, y + 16, 4, 4, lerpColor('#145020', '#9FB6AA', snow));

      // nieve acumulada en la parte alta si está al norte
      if (snow > 0.18) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.55 + snow * 0.4).toFixed(2) + ')';
        cx.fillRect(x + 8, y + 3, 16, 3);
        cx.fillRect(x + 6, y + 8, 20, 2);
        cx.fillRect(x + 3, y + 13, 26, 2);
        cx.fillRect(x + 10, y + 9, 8, 2);
      }
      break;
    }
    case 4: // Casa multi-tile (5×4). Auto-tile continuo — SIN franjas de césped entre tiles.
      {
        const up = wMap[r - 1]?.[c] === 4;
        const dn = wMap[r + 1]?.[c] === 4;
        const lf = wMap[r]?.[c - 1] === 4;
        const rt = wMap[r]?.[c + 1] === 4;

        // Ancla NW del bloque → color de techo estable por casa
        let ac = c;
        let ar = r;
        while (wMap[ar]?.[ac - 1] === 4) ac--;
        while (wMap[ar - 1]?.[ac] === 4) ar--;
        // Techos apagados de paja, teja y pizarra: fantasía medieval, no suburbio moderno.
        const roofPalette = [
          { d: '#6B3922', m: '#8B5130', l: '#B07442', e: '#3B2118' }, // teja de barro
          { d: '#3E4548', m: '#596064', l: '#788078', e: '#242A2B' }, // pizarra
          { d: '#8B6B31', m: '#AD8A45', l: '#C9AD68', e: '#58431F' }, // paja
          { d: '#4E5A34', m: '#697848', l: '#87965A', e: '#303A22' }, // musgo
          { d: '#6B4835', m: '#855E45', l: '#A87B5C', e: '#3E2A20' }, // madera oscura
        ];
        const rp = roofPalette[(ac * 5 + ar * 11) % roofPalette.length];

        // Filas del bloque 5×4: 0 techo alto, 1 techo bajo+alero, 2 pared, 3 base/puerta
        const isRoofTop = !up;
        const isRoofLower = up && wMap[r - 2]?.[c] !== 4;
        const isBase = up && !dn;
        const isWallMid = up && dn && !isRoofLower;

        // Fondo SIEMPRE material de casa (nunca césped) → sin franjas verdes
        const wallBase = '#D8C6A2'; // yeso envejecido
        const wallMid = '#C7B48D';
        const wallDark = '#8A7255';

        if (isRoofTop) {
          // Tile entero = techo (continúa hacia abajo con el tile isRoofLower)
          cx.fillStyle = rp.d;
          cx.fillRect(x, y, T, T);
          cx.fillStyle = rp.m;
          cx.fillRect(x, y + 2, T, T - 2);
          cx.fillStyle = rp.l;
          cx.fillRect(x + 1, y + 4, T - 2, 10);
          // cumbrera
          cx.fillStyle = rp.e;
          cx.fillRect(x, y, T, 4);
          cx.fillStyle = rp.l;
          cx.fillRect(x + 1, y + 1, T - 2, 2);
          // tejas continuas (sin gaps en bordes L/R internos)
          cx.fillStyle = rp.e;
          for (let i = 0; i < 4; i++) {
            cx.fillRect(x + i * 8, y + 14, 7, 1);
            cx.fillRect(x + 2 + i * 8, y + 20, 7, 1);
            cx.fillRect(x + i * 8, y + 26, 7, 1);
          }
          // borde exterior L/R del bloque
          if (!lf) {
            cx.fillStyle = rp.e;
            cx.fillRect(x, y, 2, T);
          }
          if (!rt) {
            cx.fillStyle = rp.e;
            cx.fillRect(x + T - 2, y, 2, T);
          }
          // chimenea una sola vez (tile NW del techo)
          if (!lf && rt) {
            cx.fillStyle = '#5A5048';
            cx.fillRect(x + 6, y - 2, 8, 12);
            cx.fillStyle = '#7A7068';
            cx.fillRect(x + 7, y - 1, 6, 10);
            cx.fillStyle = '#3A3028';
            cx.fillRect(x + 5, y - 4, 10, 3);
            if (Math.floor(fr / 20) % 2 === 0) {
              cx.fillStyle = 'rgba(200,200,210,0.45)';
              cx.fillRect(x + 8, y - 10, 3, 3);
              cx.fillRect(x + 10, y - 14, 2, 2);
            }
          }
        } else if (isRoofLower) {
          // Mitad superior techo (empalme con fila de arriba), mitad inferior pared
          // Techo: y+0..15
          cx.fillStyle = rp.d;
          cx.fillRect(x, y, T, 16);
          cx.fillStyle = rp.m;
          cx.fillRect(x, y, T, 14);
          cx.fillStyle = rp.l;
          cx.fillRect(x + 1, y + 2, T - 2, 6);
          // tejas
          cx.fillStyle = rp.e;
          for (let i = 0; i < 4; i++) {
            cx.fillRect(x + i * 8, y + 4, 7, 1);
            cx.fillRect(x + 2 + i * 8, y + 10, 7, 1);
          }
          // alero continuo a lo ancho del bloque
          cx.fillStyle = rp.e;
          cx.fillRect(x, y + 14, T, 4);
          cx.fillStyle = '#5A3A18';
          cx.fillRect(x, y + 16, T, 2);
          // Pared desde y+18 hasta fondo (empalme con fila de pared de abajo)
          cx.fillStyle = wallDark;
          cx.fillRect(x, y + 18, T, T - 18);
          cx.fillStyle = wallMid;
          cx.fillRect(x, y + 18, T, T - 18);
          cx.fillStyle = wallBase;
          cx.fillRect(x + 1, y + 19, T - 2, T - 20);
          // viga
          cx.fillStyle = '#6A4A28';
          cx.fillRect(x, y + 18, T, 2);
          if (!lf) {
            cx.fillStyle = '#B0A898';
            cx.fillRect(x, y + 18, 2, T - 18);
          }
          if (!rt) {
            cx.fillStyle = '#B0A898';
            cx.fillRect(x + T - 2, y + 18, 2, T - 18);
          }
        } else {
          // Pared / base: tile entero de muro (sin césped)
          cx.fillStyle = wallDark;
          cx.fillRect(x, y, T, T);
          cx.fillStyle = wallMid;
          cx.fillRect(x, y, T, T);
          cx.fillStyle = wallBase;
          cx.fillRect(x + 1, y, T - 2, T);

          // entramado de vigas y relleno de yeso, continuo entre tiles vecinos.
          cx.fillStyle = '#B99E76';
          const brickOff = (c - ac) * T; // continuidad horizontal
          for (let by = 2; by < T - 2; by += 8) {
            const rowOff = ((by / 8) | 0) % 2 === 0 ? 0 : 8;
            for (let bx = -brickOff + rowOff; bx < T + 16; bx += 16) {
              const drawX = bx;
              if (drawX > -12 && drawX < T) {
                const w = Math.min(12, T - Math.max(0, drawX));
                const sx0 = x + Math.max(0, drawX);
                if (w > 2) cx.fillRect(sx0, y + by, w, 4);
              }
            }
          }

          // Vigas verticales, un rasgo de casas entramadas medievales.
          cx.fillStyle = '#5A3A22';
          if (!lf) cx.fillRect(x + 2, y, 3, T);
          if (rt) cx.fillRect(x + T - 5, y, 3, T);
          cx.fillRect(x, y + 3, T, 2);

          if (!lf) {
            cx.fillStyle = '#71563D';
            cx.fillRect(x, y, 2, T);
          }
          if (!rt) {
            cx.fillStyle = '#71563D';
            cx.fillRect(x + T - 2, y, 2, T);
          }
          // línea superior suave solo si no hay casa arriba (no debería pasar en mid/base)
          if (!up) {
            cx.fillStyle = '#6A4A28';
            cx.fillRect(x, y, T, 2);
          }

          // Ventanas en pared media
          if (isWallMid) {
            const drawWin = (wx) => {
              cx.fillStyle = '#2A3038';
              cx.fillRect(x + wx, y + 8, 10, 14);
              cx.fillStyle = '#D6A44A';
              cx.fillRect(x + wx + 1, y + 9, 8, 12);
              cx.fillStyle = '#FFE29A';
              cx.fillRect(x + wx + 1, y + 9, 4, 5);
              cx.fillStyle = '#1A2028';
              cx.fillRect(x + wx + 5, y + 9, 1, 12);
              cx.fillRect(x + wx + 1, y + 15, 8, 1);
              cx.fillStyle = '#5A4030';
              cx.fillRect(x + wx, y + 8, 10, 1);
              cx.fillRect(x + wx, y + 21, 10, 1);
            };
            if (lf && rt) {
              drawWin(4);
              drawWin(18);
            } else if (!lf && rt) drawWin(18);
            else if (lf && !rt) drawWin(4);
            else drawWin(11);
          }

          if (isBase) {
            // zócalo continuo
            cx.fillStyle = '#8A8070';
            cx.fillRect(x, y + T - 6, T, 6);
            cx.fillStyle = '#706858';
            cx.fillRect(x, y + T - 3, T, 3);

            let leftExtent = 0;
            let cc = c;
            while (wMap[r]?.[cc - 1] === 4) {
              cc--;
              leftExtent++;
            }
            let width = 1;
            cc = c;
            while (wMap[r]?.[cc + 1] === 4) {
              cc++;
              width++;
            }
            width += leftExtent;
            const isDoorTile = leftExtent === Math.floor((width - 1) / 2);

            if (isDoorTile) {
              cx.fillStyle = '#5A4030';
              cx.fillRect(x + 8, y + 2, 16, 3);
              cx.fillStyle = '#3A2410';
              cx.fillRect(x + 10, y + 4, 12, T - 8);
              cx.fillStyle = '#5A3820';
              cx.fillRect(x + 11, y + 5, 10, T - 10);
              cx.fillStyle = '#6A4830';
              cx.fillRect(x + 12, y + 6, 8, 10);
              cx.fillStyle = '#4A2C18';
              cx.fillRect(x + 12, y + 16, 8, 1);
              cx.fillRect(x + 12, y + 20, 8, 1);
              cx.fillStyle = '#D8B840';
              cx.fillRect(x + 19, y + 15, 2, 2);
              // umbral (parte del tile de la casa, no del camino)
              cx.fillStyle = '#6A6050';
              cx.fillRect(x + 8, y + T - 4, 16, 4);
            } else {
              cx.fillStyle = '#2A3038';
              cx.fillRect(x + 10, y + 8, 12, 12);
              cx.fillStyle = '#D39B3E';
              cx.fillRect(x + 11, y + 9, 10, 10);
              cx.fillStyle = '#1A2028';
              cx.fillRect(x + 16, y + 9, 1, 10);
              cx.fillRect(x + 11, y + 14, 10, 1);
              cx.fillStyle = '#5A4030';
              cx.fillRect(x + 10, y + 8, 12, 1);
              cx.fillRect(x + 10, y + 19, 12, 1);
            }
          }
        }
      }
      break;

    case 5: { // Hierba alta (encuentros) - blanquea con la altura
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor((c + r) % 2 ? '#5AA836' : '#4A9A2E', '#E6F0EA', snow);
      cx.fillRect(x, y, T, T);
      const blades = [[3,3,22],[9,6,17],[14,2,24],[19,7,15],[24,4,20],[6,9,12],[21,10,11],[16,11,9]];
      cx.fillStyle = lerpColor('#3A9C28', '#DCE8DC', snow);
      blades.forEach(b => cx.fillRect(x + b[0], y + b[1], 2, b[2]));
      cx.fillStyle = lerpColor('#66C642', '#FFFFFF', snow);
      blades.forEach(b => cx.fillRect(x + b[0], y + b[1], 2, 3));
      if (snow > 0.4) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        blades.forEach(b => cx.fillRect(x + b[0] - 1, y + b[1] - 1, 4, 2));
      }
      cx.fillStyle = 'rgba(0,0,0,.06)';
      cx.fillRect(x, y + 27, T, 5);
      break;
    }
    case 6: { // Flores decorativas - misma base de hierba que la roca + nieve
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#48982A', '#E2ECE6', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 6, y + 8, 4, 4);
      if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 10, y + 6, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 22, y + 22, 3, 2);
      }
      // tallos
      cx.fillStyle = lerpColor('#38A028', '#CFE0CF', snow);
      cx.fillRect(x + 11, y + 14, 2, 12);
      cx.fillRect(x + 19, y + 16, 2, 10);
      // hojas
      cx.fillStyle = lerpColor('#48B830', '#DCEADA', snow);
      cx.fillRect(x + 9, y + 18, 3, 3);
      cx.fillRect(x + 20, y + 20, 3, 3);
      // flores
      cx.fillStyle = '#E85A82'; cx.fillRect(x + 8, y + 8, 5, 5);
      cx.fillStyle = '#F07FA0'; cx.fillRect(x + 9, y + 9, 3, 3);
      cx.fillStyle = '#E8C830'; cx.fillRect(x + 16, y + 8, 5, 5);
      cx.fillStyle = '#F4E060'; cx.fillRect(x + 17, y + 9, 3, 3);
      cx.fillStyle = '#D85078'; cx.fillRect(x + 23, y + 12, 4, 4);
      cx.fillStyle = '#F2A0B0'; cx.fillRect(x + 24, y + 13, 2, 2);
      cx.fillStyle = '#FFF0A0'; cx.fillRect(x + 10, y + 10, 1, 1); cx.fillRect(x + 18, y + 10, 1, 1);
      break;
    }

    case 7: { // Roca grande - misma base de hierba que las flores + nieve
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#48982A', '#E2ECE6', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 6, y + 8, 4, 4);
      if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 10, y + 6, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 22, y + 22, 3, 2);
      }
      // Roca
      cx.fillStyle = '#6E6E6E'; cx.fillRect(x + 5, y + 11, 22, 16);
      cx.fillStyle = '#828282'; cx.fillRect(x + 6, y + 9, 20, 13);
      cx.fillStyle = '#969696'; cx.fillRect(x + 8, y + 11, 16, 7);
      cx.fillStyle = '#A8A8A8'; cx.fillRect(x + 10, y + 11, 6, 3); // brillo
      cx.fillStyle = '#585858'; cx.fillRect(x + 14, y + 15, 1, 6); cx.fillRect(x + 19, y + 13, 1, 4); // grietas
      cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(x + 6, y + 24, 20, 4); // sombra
      // polvo de nieve sobre la roca al norte
      if (snow > 0.2) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.45 + snow * 0.5).toFixed(2) + ')';
        cx.fillRect(x + 6, y + 8, 20, 3);
        cx.fillRect(x + 10, y + 11, 8, 2);
      }
      break;
    }


    case 14: { // Arco/cartel de entrada de pueblo
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 4, y + 8, 4, 22);
      cx.fillRect(x + 24, y + 8, 4, 22);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 3, y + 6, 26, 7);
      cx.fillStyle = '#C09048';
      cx.fillRect(x + 5, y + 7, 22, 4);
      cx.fillStyle = '#E8C830';
      cx.fillRect(x + 9, y + 8, 3, 2);
      cx.fillRect(x + 15, y + 8, 3, 2);
      cx.fillRect(x + 21, y + 8, 3, 2);
      if (snow > 0.2) {
        cx.fillStyle = 'rgba(255,255,255,.65)';
        cx.fillRect(x + 3, y + 5, 26, 2);
      }
      break;
    }

    case 15: { // Farol / antorcha de pueblo
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 14, y + 9, 4, 20);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 12, y + 7, 8, 4);
      cx.fillStyle = '#F8D860';
      cx.fillRect(x + 13, y + 3, 6, 6);
      cx.fillStyle = '#F8A030';
      cx.fillRect(x + 14, y + 4, 4, 4);
      cx.globalAlpha = 0.18;
      cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, y + 7, 12, 8);
      cx.globalAlpha = 1;
      break;
    }

    case 16: { // Banco / descanso
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 5, y + 17, 22, 4);
      cx.fillRect(x + 7, y + 12, 18, 4);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 6, y + 13, 20, 2);
      cx.fillRect(x + 4, y + 21, 4, 8);
      cx.fillRect(x + 24, y + 21, 4, 8);
      break;
    }

    case 17: { // Mural / panel artístico de Storyboard
      cx.fillStyle = '#C8B898';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#D8C8A8';
      cx.fillRect(x + 2, y + 2, 28, 28);
      cx.fillStyle = '#1A1A2E';
      cx.fillRect(x + 5, y + 5, 22, 18);
      cx.fillStyle = '#F8F8E8';
      cx.fillRect(x + 7, y + 7, 18, 14);
      cx.fillStyle = '#E83030';
      cx.fillRect(x + 9, y + 10, 5, 5);
      cx.fillStyle = '#3888E0';
      cx.fillRect(x + 17, y + 9, 5, 6);
      cx.fillStyle = '#48A038';
      cx.fillRect(x + 13, y + 16, 8, 3);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 8, y + 24, 16, 3);
      break;
    }

    case 18: { // Puesto / carpa de feria o vendedor
      drawWorldDecorBase(c, r, x, y);
      // mesa
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 4, y + 20, 24, 5);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 6, y + 21, 20, 3);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 6, y + 25, 4, 7);
      cx.fillRect(x + 22, y + 25, 4, 7);
      // toldo rayado
      cx.fillStyle = '#C83030';
      cx.fillRect(x + 3, y + 8, 26, 6);
      cx.fillStyle = '#F8F0E0';
      cx.fillRect(x + 8, y + 8, 5, 6);
      cx.fillRect(x + 18, y + 8, 5, 6);
      cx.fillStyle = '#A02020';
      cx.fillRect(x + 3, y + 14, 26, 3);
      // objetos en venta
      cx.fillStyle = '#E8C830';
      cx.fillRect(x + 8, y + 17, 4, 3);
      cx.fillStyle = '#70B8F8';
      cx.fillRect(x + 15, y + 17, 4, 3);
      cx.fillStyle = '#48A038';
      cx.fillRect(x + 22, y + 17, 4, 3);
      break;
    }

    case 19: { // Estatua (Rey o criatura según zona)
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      // pedestal
      cx.fillStyle = '#686878';
      cx.fillRect(x + 6, y + 24, 20, 6);
      cx.fillStyle = '#808090';
      cx.fillRect(x + 8, y + 21, 16, 4);
      // cuerpo estatua
      cx.fillStyle = '#9090A0';
      cx.fillRect(x + 12, y + 9, 8, 12);
      cx.fillStyle = '#A8A8B8';
      cx.fillRect(x + 13, y + 6, 6, 5);
      // corona/cuernos según paridad
      cx.fillStyle = '#C8A830';
      if ((c + r) % 2 === 0) {
        cx.fillRect(x + 11, y + 3, 10, 3);
        cx.fillRect(x + 13, y + 1, 2, 3);
        cx.fillRect(x + 18, y + 1, 2, 3);
      } else {
        cx.fillRect(x + 9, y + 5, 5, 3);
        cx.fillRect(x + 19, y + 5, 5, 3);
      }
      cx.fillStyle = '#707080';
      cx.fillRect(x + 10, y + 13, 4, 8);
      cx.fillRect(x + 18, y + 13, 4, 8);
      if (snow > 0.25) {
        cx.fillStyle = 'rgba(255,255,255,.7)';
        cx.fillRect(x + 8, y + 20, 16, 2);
        cx.fillRect(x + 12, y + 5, 8, 2);
      }
      break;
    }

    case 20: { // Cerca de madera
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 2, y + 13, 28, 4);
      cx.fillRect(x + 2, y + 22, 28, 4);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 5, y + 9, 4, 21);
      cx.fillRect(x + 22, y + 9, 4, 21);
      break;
    }

    case 21: { // Cajas de madera
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 5, y + 15, 10, 10);
      cx.fillRect(x + 17, y + 11, 10, 14);
      cx.fillStyle = '#A07038';
      cx.fillRect(x + 6, y + 16, 8, 2);
      cx.fillRect(x + 18, y + 12, 8, 2);
      cx.fillStyle = '#5A3818';
      cx.fillRect(x + 9, y + 15, 2, 10);
      cx.fillRect(x + 21, y + 11, 2, 14);
      break;
    }

    case 22: { // Pozo de pueblo
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6E6E6E';
      cx.fillRect(x + 7, y + 17, 18, 10);
      cx.fillStyle = '#8A8A8A';
      cx.fillRect(x + 9, y + 15, 14, 4);
      cx.fillStyle = '#202838';
      cx.fillRect(x + 10, y + 18, 12, 5);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 8, y + 8, 3, 10);
      cx.fillRect(x + 21, y + 8, 3, 10);
      cx.fillRect(x + 8, y + 7, 16, 3);
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 15, y + 10, 2, 5);
      break;
    }

    case 23: { // Muñeco de entrenamiento
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 14, y + 8, 4, 20);
      cx.fillRect(x + 8, y + 14, 16, 4);
      cx.fillStyle = '#C8B080';
      cx.fillRect(x + 10, y + 6, 12, 8);
      cx.fillStyle = '#E83030';
      cx.fillRect(x + 12, y + 9, 3, 3);
      cx.fillRect(x + 17, y + 9, 3, 3);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 10, y + 28, 12, 3);
      break;
    }

    case 24: { // Huellas de criaturas
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const col = snow > 0.35 ? '#A8B8B0' : '#2E6A20';
      cx.fillStyle = col;
      [[7,8],[12,13],[18,18],[23,23],[10,24],[20,8]].forEach(([a,b]) => {
        cx.fillRect(x + a, y + b, 3, 2);
        cx.fillRect(x + a + 1, y + b - 2, 1, 1);
      });
      break;
    }

    case 25: { // Set de rodaje / claqueta-cámara simbólica
      cx.fillStyle = '#A89878';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#8A8070';
      cx.fillRect(x + 2, y + 2, 28, 28);
      cx.fillStyle = '#202020';
      cx.fillRect(x + 8, y + 11, 14, 8);
      cx.fillStyle = '#303030';
      cx.fillRect(x + 10, y + 13, 10, 4);
      cx.fillStyle = '#C8C8C8';
      cx.fillRect(x + 20, y + 13, 5, 4);
      cx.fillStyle = '#5A3818';
      cx.fillRect(x + 14, y + 19, 3, 9);
      cx.fillRect(x + 9, y + 26, 13, 2);
      cx.fillStyle = '#F8F8F8';
      cx.fillRect(x + 6, y + 5, 20, 5);
      cx.fillStyle = '#202020';
      cx.fillRect(x + 6, y + 5, 4, 2);
      cx.fillRect(x + 14, y + 5, 4, 2);
      cx.fillRect(x + 22, y + 5, 4, 2);
      break;
    }

    case 26: { // Suelo de cantera / piedra tallada
      cx.fillStyle = '#8A8172';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#9A9182';
      if ((c + r) % 2 === 0) cx.fillRect(x + 1, y + 1, 14, 14);
      else cx.fillRect(x + 17, y + 1, 14, 14);
      cx.fillStyle = '#746C60';
      cx.fillRect(x, y + 15, T, 1);
      cx.fillRect(x + 15, y, 1, T);
      cx.fillStyle = '#B0A898';
      if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 7, y + 7, 5, 2);
      if ((c * 2 + r) % 5 === 0) cx.fillRect(x + 19, y + 22, 6, 2);
      break;
    }

    case 27: { // Desnivel / borde elevado del terreno
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const inRodaje = c >= 48 && c <= 64 && r >= 75 && r <= 89;
      cx.fillStyle = inRodaje ? '#8A8172' : lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      // pared baja escalonada
      cx.fillStyle = inRodaje ? '#6F675C' : lerpColor('#7A5A38', '#C8D0CC', snow);
      cx.fillRect(x, y + 15, T, 13);
      cx.fillStyle = inRodaje ? '#918878' : lerpColor('#9A7040', '#E8F0EC', snow);
      cx.fillRect(x, y + 12, T, 5);
      cx.fillStyle = inRodaje ? '#B0A898' : lerpColor('#B89058', '#FFFFFF', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 3, y + 12, 10, 2);
      else cx.fillRect(x + 18, y + 12, 9, 2);
      cx.fillStyle = 'rgba(0,0,0,.18)';
      cx.fillRect(x, y + 27, T, 5);
      break;
    }

    case 9: // Entrada de cueva
      cx.fillStyle = '#48982A';
      cx.fillRect(x, y, T, T);
      // Montaña/roca alrededor
      cx.fillStyle = '#5A4A38';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#6A5A48';
      cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      // Agujero oscuro
      cx.fillStyle = '#282018';
      cx.fillRect(x + 4, y + 6, T - 8, T - 6);
      cx.fillStyle = '#181010';
      cx.fillRect(x + 6, y + 8, T - 12, T - 8);
      cx.fillStyle = '#100808';
      cx.fillRect(x + 8, y + 10, T - 16, T - 12);
      // Arco de piedra
      cx.fillStyle = '#7A6A58';
      cx.fillRect(x, y, T, 6);
      cx.fillRect(x, y, 4, T);
      cx.fillRect(x + T - 4, y, 4, T);
      cx.fillStyle = '#8A7A68';
      cx.fillRect(x + 2, y + 1, T - 4, 3);
      // Detalle de musgo adaptativo (verde al sur, blanco al norte)
      {
        const snow9 = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss9 = lerpColor('#48A030', '#EEF4EE', snow9);
        cx.fillStyle = moss9;
        cx.fillRect(x + 2, y + 6, 3, 2);
        cx.fillRect(x + T - 5, y + 8, 3, 2);
      }
      break;

    case 10: { // Pin de hallazgo — óvalo pixel-art alargado y chato (todos iguales)
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#3E8A2A', '#DCE8DC', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#347A24', '#C8D4C8', snow);
      cx.fillRect(x, y + 24, T, 8);

      // Sombra ovalada baja
      cx.fillStyle = 'rgba(0,0,0,0.28)';
      cx.fillRect(x + 8, y + 26, 16, 2);
      cx.fillRect(x + 10, y + 28, 12, 1);

      // Óvalo rojo alargado (ancho) y chato (bajo) — misma forma en todos los pines
      // Filas de 2px: ........########........
      //               ......############......
      //               ......############......
      //               ........########........
      const pulse = 0.85 + Math.sin(fr * 0.12) * 0.15;
      cx.globalAlpha = pulse;
      // contorno oscuro
      cx.fillStyle = '#100408';
      cx.fillRect(x + 10, y + 18, 12, 2); // fila superior
      cx.fillRect(x + 8, y + 20, 16, 4);  // filas medias
      cx.fillRect(x + 10, y + 24, 12, 2); // fila inferior
      // relleno rojo
      cx.fillStyle = '#8B1018';
      cx.fillRect(x + 11, y + 19, 10, 1);
      cx.fillRect(x + 9, y + 20, 14, 4);
      cx.fillRect(x + 11, y + 24, 10, 1);
      cx.fillStyle = '#C81828';
      cx.fillRect(x + 12, y + 20, 8, 1);
      cx.fillRect(x + 10, y + 21, 12, 2);
      cx.fillRect(x + 12, y + 23, 8, 1);
      cx.fillStyle = '#E83040';
      cx.fillRect(x + 12, y + 21, 8, 2);
      // brillo
      cx.fillStyle = '#FF6870';
      cx.fillRect(x + 12, y + 20, 3, 1);
      cx.globalAlpha = 1;

      // Destellos laterales
      if (Math.floor(fr / 18) % 2 === 0) {
        cx.globalAlpha = 0.7;
        cx.fillStyle = '#FF4050';
        cx.fillRect(x + 6, y + 20, 2, 2);
        cx.fillRect(x + 24, y + 22, 2, 2);
        cx.globalAlpha = 1;
      }
      break;
    }
    case 11: // Puerta del castillo
      {
        // Marco de piedra del castillo
        cx.fillStyle = '#606878';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#707888';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);

        // Arco de piedra
        cx.fillStyle = '#586070';
        cx.fillRect(x, y, T, 6);
        cx.fillStyle = '#687080';
        cx.fillRect(x + 2, y + 1, T - 4, 4);
        // Clave del arco
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 13, y, 6, 5);
        cx.fillStyle = '#D8B840';
        cx.fillRect(x + 14, y + 1, 4, 3);

        // Puerta de madera reforzada
        cx.fillStyle = '#3A2010';
        cx.fillRect(x + 4, y + 6, 24, 26);
        cx.fillStyle = '#4A3018';
        cx.fillRect(x + 6, y + 8, 20, 22);
        cx.fillStyle = '#5A4028';
        cx.fillRect(x + 8, y + 10, 16, 18);

        // Tablones verticales
        cx.fillStyle = '#4A3018';
        cx.fillRect(x + 11, y + 8, 1, 22);
        cx.fillRect(x + 16, y + 8, 1, 22);
        cx.fillRect(x + 21, y + 8, 1, 22);

        // Refuerzos de hierro horizontales
        cx.fillStyle = '#484858';
        cx.fillRect(x + 6, y + 12, 20, 2);
        cx.fillRect(x + 6, y + 22, 20, 2);

        // Clavos de hierro
        cx.fillStyle = '#585868';
        cx.fillRect(x + 8, y + 12, 2, 2);
        cx.fillRect(x + 22, y + 12, 2, 2);
        cx.fillRect(x + 8, y + 22, 2, 2);
        cx.fillRect(x + 22, y + 22, 2, 2);

        // Aldaba dorada (llamador)
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 14, y + 16, 4, 4);
        cx.fillStyle = '#E8C840';
        cx.fillRect(x + 15, y + 17, 2, 2);
        cx.fillStyle = '#A88020';
        cx.fillRect(x + 15, y + 20, 2, 2);

        // Columnas laterales
        cx.fillStyle = '#586070';
        cx.fillRect(x, y + 4, 4, T - 4);
        cx.fillRect(x + T - 4, y + 4, 4, T - 4);
        cx.fillStyle = '#687080';
        cx.fillRect(x + 1, y + 6, 2, T - 8);
        cx.fillRect(x + T - 3, y + 6, 2, T - 8);

        // Detalle dorado en columnas
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 1, y + 8, 2, 2);
        cx.fillRect(x + T - 3, y + 8, 2, 2);
        cx.fillRect(x + 1, y + 18, 2, 2);
        cx.fillRect(x + T - 3, y + 18, 2, 2);
      }
      break;

    case 12: { // Torre / castillo imponente (post-game) - musgo adaptativo
        const snow = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss = lerpColor('#4FA03A', '#EEF4EE', snow);     // verde al sur, blanco al norte
        const mossD = lerpColor('#3C7A2E', '#D8E6D8', snow);
        // Suelo (hierba del bioma)
        cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
        cx.fillRect(x, y, T, T);
        // Cuerpo de piedra de la torre
        cx.fillStyle = '#6E7686'; cx.fillRect(x + 4, y + 4, 24, 28);
        cx.fillStyle = '#7E8696'; cx.fillRect(x + 5, y + 5, 22, 26);
        // Ladrillos
        cx.fillStyle = '#666E7E';
        for (let br = 0; br < 4; br++) cx.fillRect(x + 5, y + 9 + br * 5, 22, 1);
        cx.fillStyle = '#5E6676';
        cx.fillRect(x + 15, y + 5, 1, 27);
        cx.fillRect(x + 10, y + 10, 1, 4); cx.fillRect(x + 21, y + 10, 1, 4);
        cx.fillRect(x + 10, y + 15, 1, 4); cx.fillRect(x + 21, y + 15, 1, 4);
        cx.fillRect(x + 10, y + 20, 1, 4); cx.fillRect(x + 21, y + 20, 1, 4);
        // Almenas (battlements) en lo alto
        cx.fillStyle = '#6E7686';
        cx.fillRect(x + 4, y, 4, 6); cx.fillRect(x + 11, y, 4, 6); cx.fillRect(x + 18, y, 4, 6); cx.fillRect(x + 24, y, 4, 6);
        cx.fillStyle = '#7E8696';
        cx.fillRect(x + 5, y + 1, 2, 4); cx.fillRect(x + 12, y + 1, 2, 4); cx.fillRect(x + 19, y + 1, 2, 4); cx.fillRect(x + 25, y + 1, 2, 4);
        // Musgo adaptativo en la base
        cx.fillStyle = mossD; cx.fillRect(x + 5, y + 28, 22, 4);
        cx.fillStyle = moss;
        cx.fillRect(x + 5, y + 29, 3, 2); cx.fillRect(x + 10, y + 30, 3, 2); cx.fillRect(x + 16, y + 28, 3, 2); cx.fillRect(x + 23, y + 30, 3, 2);
        // Ventana arqueada
        cx.fillStyle = '#2A1E12'; cx.fillRect(x + 14, y + 11, 4, 6);
        cx.fillStyle = '#4A3520'; cx.fillRect(x + 15, y + 12, 2, 4);
        // Puerta
        if (!towerOpen) {
          cx.fillStyle = '#3A2010'; cx.fillRect(x + 11, y + 20, 10, 12);
          cx.fillStyle = '#4A3018'; cx.fillRect(x + 12, y + 21, 8, 11);
          cx.fillStyle = '#5A4028'; cx.fillRect(x + 13, y + 22, 6, 9);
          cx.fillStyle = '#484858'; cx.fillRect(x + 11, y + 24, 10, 1); cx.fillRect(x + 11, y + 28, 10, 1);
          cx.fillStyle = '#C8A830'; cx.fillRect(x + 15, y + 25, 2, 3); // cerradura
        } else {
          const tgl = Math.sin(fr * 0.08) * 0.2 + 0.8;
          cx.globalAlpha = tgl;
          cx.fillStyle = '#F8E8A0'; cx.fillRect(x + 11, y + 20, 10, 12);
          cx.fillStyle = '#F8F0C0'; cx.fillRect(x + 13, y + 22, 6, 10);
          cx.globalAlpha = 1;
          if (fr % 20 < 10) { cx.fillStyle = '#F8E830'; cx.fillRect(x + 13 + Math.sin(fr * 0.1) * 3, y + 8, 2, 2); }
        }
        // Bandera en lo alto
        cx.fillStyle = '#8A6A30'; cx.fillRect(x + 15, y - 6, 2, 8);
        cx.fillStyle = '#C83030'; cx.fillRect(x + 17, y - 5, 8, 5);
        cx.fillStyle = '#E05050'; cx.fillRect(x + 17, y - 5, 8, 2);
        cx.fillStyle = moss; cx.fillRect(x + 4, y - 1, 3, 1);
        break;
      }

    case 13: // Muro de castillo exterior
      {
        // Musgo adaptativo al bioma (verde al sur, blanco al norte)
        const snow = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss = lerpColor('#3A6838', '#E2ECE6', snow);
        const mossD = lerpColor('#2E5236', '#D2DED2', snow);
        // Base de piedra gris
        cx.fillStyle = '#606878';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#707888';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);

        // Bloques de piedra tallada
        cx.fillStyle = '#687080';
        cx.fillRect(x + 1, y + 1, 14, 10);
        cx.fillRect(x + 17, y + 1, 14, 10);
        cx.fillRect(x + 9, y + 13, 14, 10);
        cx.fillRect(x + 1, y + 13, 7, 10);
        cx.fillRect(x + 24, y + 13, 7, 10);
        cx.fillRect(x + 1, y + 25, 14, 6);
        cx.fillRect(x + 17, y + 25, 14, 6);

        // Juntas entre piedras
        cx.fillStyle = '#505868';
        cx.fillRect(x + 15, y, 1, T);
        cx.fillRect(x, y + 12, T, 1);
        cx.fillRect(x, y + 24, T, 1);
        cx.fillRect(x + 8, y + 12, 1, 12);
        cx.fillRect(x + 23, y + 12, 1, 12);

        // Textura de piedra
        cx.fillStyle = '#788090';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 4, y + 4, 3, 2);
          cx.fillRect(x + 20, y + 16, 3, 2);
        }
        if ((c + r) % 3 === 0) {
          cx.fillRect(x + 12, y + 6, 2, 2);
          cx.fillRect(x + 6, y + 18, 2, 3);
        }

        // Musgo en juntas
        if ((c * 5 + r * 3) % 7 === 0) {
          cx.fillStyle = moss;
          cx.fillRect(x + 14, y + 12, 3, 2);
        }
        if ((c * 3 + r * 7) % 9 === 0) {
          cx.fillStyle = moss;
          cx.fillRect(x + 8, y + 23, 4, 2);
        }

        // Borde superior con almenas si no hay muro arriba
        const tUp = wMap[r - 1]?.[c];
        if (tUp !== 13 && tUp !== 11) {
          cx.fillStyle = '#586070';
          cx.fillRect(x, y, T, 3);
          cx.fillStyle = '#707888';
          cx.fillRect(x + 2, y, 4, 5);
          cx.fillRect(x + 10, y, 4, 5);
          cx.fillRect(x + 18, y, 4, 5);
          cx.fillRect(x + 26, y, 4, 5);
          // Sombra de almenas
          cx.fillStyle = 'rgba(0,0,0,.15)';
          cx.fillRect(x + 6, y + 3, 4, 2);
          cx.fillRect(x + 14, y + 3, 4, 2);
          cx.fillRect(x + 22, y + 3, 4, 2);
        }

        // Antorcha ocasional
        if ((c * 7 + r * 5) % 11 === 0) {
          cx.fillStyle = '#5A4020';
          cx.fillRect(x + 14, y + 8, 4, 8);
          cx.fillStyle = '#6A5030';
          cx.fillRect(x + 13, y + 7, 6, 3);
          const flk = Math.sin(fr * 0.15 + c) * 2;
          cx.fillStyle = '#E88030';
          cx.fillRect(x + 13, y + 4 + flk, 6, 4);
          cx.fillStyle = '#F8A050';
          cx.fillRect(x + 14, y + 3 + flk, 4, 3);
          cx.fillStyle = '#F8D080';
          cx.fillRect(x + 15, y + 2 + flk, 2, 2);
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 10, 10, 8);
          cx.globalAlpha = 1;
        }

        // Estandarte ocasional
        if ((c * 3 + r * 11) % 13 === 0) {
          cx.fillStyle = '#C8A830';
          cx.fillRect(x + 12, y + 6, 8, 2);
          cx.fillStyle = '#A02020';
          cx.fillRect(x + 13, y + 8, 6, 12);
          cx.fillStyle = '#B83030';
          cx.fillRect(x + 14, y + 10, 4, 8);
          cx.fillStyle = '#E8C830';
          cx.fillRect(x + 15, y + 12, 2, 3);
          cx.fillStyle = '#A02020';
          cx.fillRect(x + 14, y + 20, 2, 2);
          cx.fillRect(x + 16, y + 20, 2, 2);
          cx.fillRect(x + 15, y + 22, 2, 1);
        }
      }
      break;

    // ─── C2.1: NUEVOS TILES DE ALDEA ─────────────────────────
    case 28: { // Surcos de cultivo (parcelas)
      drawWorldDecorBase(c, r, x, y);
      // surcos marrones alternados
      for (let row = 0; row < 4; row++) {
        cx.fillStyle = row % 2 === 0 ? '#8B6B3A' : '#6B4E28';
        cx.fillRect(x + 2, y + 4 + row * 7, 28, 5);
      }
      // brotes verdes en cada surco
      cx.fillStyle = '#5A9A30';
      for (let row = 0; row < 4; row++) {
        for (let i = 0; i < 3; i++) {
          const bx = x + 5 + i * 9 + ((row + c) % 3) * 2;
          cx.fillRect(bx, y + 8 + row * 7, 2, 3);
          cx.fillStyle = '#7AC040';
          cx.fillRect(bx, y + 7 + row * 7, 1, 2);
          cx.fillStyle = '#5A9A30';
        }
      }
      break;
    }
    case 29: { // Muelle / tablones de madera
      cx.fillStyle = '#2080C0';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#8B6038';
      cx.fillRect(x + 2, y, 28, T);
      // tablones horizontales
      for (let row = 0; row < 4; row++) {
        cx.fillStyle = row % 2 === 0 ? '#9B7050' : '#7B5030';
        cx.fillRect(x + 2, y + 2 + row * 8, 28, 6);
      }
      // clavos
      cx.fillStyle = '#585858';
      for (let r2 = 0; r2 < 4; r2++)
        for (let c2 = 0; c2 < 3; c2++)
          cx.fillRect(x + 6 + c2 * 10, y + 4 + r2 * 8, 2, 2);
      // postes laterales
      cx.fillStyle = '#5A3820';
      cx.fillRect(x, y + 2, 3, 28);
      cx.fillRect(x + 29, y + 2, 3, 28);
      break;
    }
    case 30: { // Redes de pesca colgadas
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#5A3820';
      cx.fillRect(x + 4, y + 2, 2, 28);
      cx.fillStyle = '#D8C8A0';
      // red en rombos
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
          const nx = x + 8 + i * 8 + (j % 2) * 4;
          const ny = y + 3 + j * 6;
          cx.fillRect(nx, ny, 2, 2);
          if (j < 4) { cx.fillRect(nx + 1, ny + 1, 1, 5); }
        }
      }
      break;
    }
    case 31: { // Barca / bote
      cx.fillStyle = '#2080C0';
      cx.fillRect(x, y, T, T);
      // casco
      cx.fillStyle = '#6B3A20';
      cx.fillRect(x + 3, y + 12, 26, 14);
      cx.fillStyle = '#8B5030';
      cx.fillRect(x + 4, y + 10, 24, 10);
      cx.fillStyle = '#A06040';
      cx.fillRect(x + 6, y + 10, 20, 6);
      // borda
      cx.fillStyle = '#5A2A10';
      cx.fillRect(x + 2, y + 11, 28, 2);
      // remos
      cx.fillStyle = '#8B6030';
      cx.fillRect(x + 2, y + 6, 4, 18);
      cx.fillRect(x + 26, y + 6, 4, 18);
      // agua debajo
      cx.fillStyle = 'rgba(72,160,232,.3)';
      cx.fillRect(x + 6, y + 24, 20, 4);
      break;
    }

    // ─── 32: MOLINO EXTERIOR (5×9 junto al río) ────────────
    case 32: {
      const up = wMap[r - 1]?.[c] === 32;
      const dn = wMap[r + 1]?.[c] === 32;
      const lf = wMap[r]?.[c - 1] === 32;
      const rt = wMap[r]?.[c + 1] === 32;

      // Ancla NW del bloque
      let ac = c, ar = r;
      while (wMap[ar]?.[ac - 1] === 32) ac--;
      while (wMap[ar - 1]?.[ac] === 32) ar--;

      const isRoofTop = !up;
      const isRoofLower = up && wMap[r - 2]?.[c] !== 32;
      const isBase = up && !dn;
      const isWallMid = up && dn && !isRoofLower;

      // Paleta del molino: piedra gris + teja rojiza + rueda de agua
      const stoneDark = '#5A5448';
      const stoneMid = '#6A6458';
      const roofD = '#6B3922';
      const roofM = '#8B5130';
      const roofL = '#B07442';

      if (isRoofTop) {
        // Techo de teja
        cx.fillStyle = roofD;
        cx.fillRect(x, y, T, T);
        cx.fillStyle = roofM;
        cx.fillRect(x, y + 2, T, T - 2);
        cx.fillStyle = roofL;
        cx.fillRect(x + 1, y + 4, T - 2, 10);
        cx.fillStyle = '#3B2118';
        cx.fillRect(x, y, T, 4);
        cx.fillStyle = roofL;
        cx.fillRect(x + 1, y + 1, T - 2, 2);
        for (let i = 0; i < 4; i++) {
          cx.fillRect(x + i * 8, y + 14, 7, 1);
          cx.fillRect(x + 2 + i * 8, y + 20, 7, 1);
          cx.fillRect(x + i * 8, y + 26, 7, 1);
        }
        if (!lf) { cx.fillStyle = '#3B2118'; cx.fillRect(x, y, 2, T); }
        if (!rt) { cx.fillStyle = '#3B2118'; cx.fillRect(x + T - 2, y, 2, T); }
      } else if (isRoofLower) {
        cx.fillStyle = roofD; cx.fillRect(x, y, T, 16);
        cx.fillStyle = roofM; cx.fillRect(x, y, T, 14);
        cx.fillStyle = roofL; cx.fillRect(x + 1, y + 2, T - 2, 6);
        for (let i = 0; i < 4; i++) {
          cx.fillRect(x + i * 8, y + 4, 7, 1);
          cx.fillRect(x + 2 + i * 8, y + 10, 7, 1);
        }
        cx.fillStyle = '#3B2118'; cx.fillRect(x, y + 14, T, 4);
        cx.fillStyle = '#5A3A18'; cx.fillRect(x, y + 16, T, 2);
        // Pared
        cx.fillStyle = stoneMid; cx.fillRect(x, y + 18, T, T - 18);
        // Bloques de piedra
        for (let br = 0; br < 2; br++) {
          cx.fillStyle = stoneDark;
          cx.fillRect(x + 2, y + 20 + br * 8, T - 4, 1);
        }
      } else if (isBase) {
        // Base: pared de piedra + puerta de molino
        cx.fillStyle = stoneDark; cx.fillRect(x, y, T, T);
        cx.fillStyle = stoneMid; cx.fillRect(x + 1, y, T - 2, T);
        for (let br = 0; br < 3; br++) {
          cx.fillStyle = stoneDark;
          cx.fillRect(x + 2, y + 6 + br * 8, T - 4, 1);
        }

        // Puerta de molino (más ancha, arqueada, madera reforzada)
        let leftExtent = 0, cc = c;
        while (wMap[r]?.[cc - 1] === 32) { cc--; leftExtent++; }
        let width = 1; cc = c;
        while (wMap[r]?.[cc + 1] === 32) { cc++; width++; }
        width += leftExtent;
        const isDoorTile = leftExtent === Math.floor((width - 1) / 2);

        if (isDoorTile) {
          cx.fillStyle = '#3A2010';
          cx.fillRect(x + 5, y + 2, 22, 28);
          cx.fillStyle = '#4A3018';
          cx.fillRect(x + 7, y + 3, 18, 26);
          // Tablones verticales
          cx.fillStyle = '#5A4028';
          cx.fillRect(x + 12, y + 3, 1, 26);
          cx.fillRect(x + 18, y + 3, 1, 26);
          // Refuerzos de hierro
          cx.fillStyle = '#585868';
          cx.fillRect(x + 7, y + 10, 18, 2);
          cx.fillRect(x + 7, y + 22, 18, 2);
          // Cerradura
          cx.fillStyle = '#D8B840';
          cx.fillRect(x + 24, y + 15, 2, 3);
        } else {
          // Ventana pequeña de molino
          cx.fillStyle = '#2A2018';
          cx.fillRect(x + 10, y + 6, 12, 10);
          cx.fillStyle = '#D6A44A';
          cx.fillRect(x + 11, y + 7, 10, 8);
          cx.fillStyle = '#3A2A18';
          cx.fillRect(x + 16, y + 7, 1, 8);
        }
      } else {
        // Pared media
        cx.fillStyle = stoneDark; cx.fillRect(x, y, T, T);
        cx.fillStyle = stoneMid; cx.fillRect(x + 1, y, T - 2, T);
        for (let br = 0; br < 3; br++) {
          cx.fillStyle = stoneDark;
          cx.fillRect(x + 2, y + 6 + br * 8, T - 4, 1);
        }
        // Ventana alta
        if (isWallMid && (c + r) % 2 === 0) {
          cx.fillStyle = '#2A2018';
          cx.fillRect(x + 10, y + 8, 12, 10);
          cx.fillStyle = '#D6A44A';
          cx.fillRect(x + 11, y + 9, 10, 8);
        }
      }

      // RUEDA DE AGUA: en los tiles del lado derecho (pegados al río)
      // Solo se dibuja en los tiles de la columna más a la derecha (cerca del agua)
      if (!rt && (r - ar) >= 2 && (r - ar) <= 6) {
        // Postes de soporte de la rueda
        cx.fillStyle = '#4A3018';
        cx.fillRect(x + 26, y - 4, 4, 36);
        // Rueda parcial (se completa entre tiles)
        const rot = fr * 0.02;
        const cxW = x + 18, cyW = y + 10;
        cx.save();
        cx.translate(cxW, cyW);
        cx.rotate(rot);
        cx.fillStyle = '#6A4830';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          cx.fillRect(Math.cos(a) * 8 - 1, Math.sin(a) * 8 - 1, 3, 3);
        }
        cx.fillStyle = '#4A3018';
        cx.fillRect(-1, -10, 2, 20);
        cx.fillRect(-10, -1, 20, 2);
        cx.fillStyle = '#7A5840';
        cx.fillRect(-2, -2, 4, 4);
        cx.restore();
      }
      break;
    }
  } // fin switch
} // fin dTileW

export { dTileW, lerpColor, drawWorldDecorBase };
