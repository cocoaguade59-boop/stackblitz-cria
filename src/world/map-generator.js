// Generación procedural de mapas: mundo, cuevas y castillo.
// Solo escribe a arrays de tiles (window.__wc). No toca G.scr.
import { WC, WR, CC, CR, KC, KR, wMap, cave1, cave2, castMap } from '../core/world-constants.js';
import { isWorldPinAllowed } from './world-layout.js';
import { applyExpandedWorldPoints } from './expanded-world-runtime.js';

function hPath(r, c1, c2, w = 2) {
  const start = Math.min(c1, c2),
    end = Math.max(c1, c2);
  for (let c = start; c <= end; c++)
    for (let dr = 0; dr < w; dr++) {
      const rr = r + dr;
      if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
    }
}

function vPath(c, r1, r2, w = 2) {
  const start = Math.min(r1, r2),
    end = Math.max(r1, r2);
  for (let r = start; r <= end; r++)
    for (let dc = 0; dc < w; dc++) {
      const cc = c + dc;
      if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
    }
}
function addPineForest(x0, y0, w, h, density = 0.72) {
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;

      // No tapar caminos, agua, cuevas, castillo, torre, casas, cristales
      const t = wMap[r]?.[c];
      if (t !== 0 && t !== 5) continue;

      // Borde más denso, interior con claros
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;

      const localDensity = edge ? Math.min(0.9, density + 0.15) : density;

      if (Math.random() < localDensity) {
        wMap[r][c] = 3;
      } else if (Math.random() < 0.5) {
        wMap[r][c] = 5; // hierba alta entre pinos
      } else {
        wMap[r][c] = 0; // claro
      }
    }
  }
}

function addClearing(cx0, cy0, rad = 3) {
  for (let r = cy0 - rad; r <= cy0 + rad; r++) {
    for (let c = cx0 - rad; c <= cx0 + rad; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
      const dx = c - cx0;
      const dy = r - cy0;
      if (dx * dx + dy * dy <= rad * rad) {
        if (wMap[r][c] === 3 || wMap[r][c] === 5) {
          wMap[r][c] = Math.random() < 0.25 ? 6 : 0;
        }
      }
    }
  }
}


function addTallGrassPatch(x0, y0, w, h, density = 0.75) {
  // Parche rectangular irregular de hierba alta, sin tocar caminos ni edificios.
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;
      if (wMap[r][c] !== 0) continue;
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;
      const localDensity = edge ? density * 0.45 : density;
      if (Math.random() < localDensity) wMap[r][c] = 5;
    }
  }
}

function addWorldTallGrassPatches() {
  // Más hierba alta cerca de rutas y zonas de exploración para que los encuentros
  // no dependan solo de puntitos dispersos del generador inicial.
  [
    { x: 23, y: 124, w: 10, h: 8, d: 0.72 }, // Ruta 1
    { x: 38, y: 118, w: 10, h: 8, d: 0.72 },
    { x: 18, y: 93, w: 12, h: 8, d: 0.76 },  // Ruta 2 / Cueva Volcánica
    { x: 52, y: 91, w: 10, h: 8, d: 0.76 },
    { x: 57, y: 68, w: 12, h: 9, d: 0.78 },  // Ruta 3
    { x: 31, y: 58, w: 11, h: 8, d: 0.78 },
    { x: 34, y: 36, w: 12, h: 8, d: 0.8 },   // Ruta 4
    { x: 58, y: 34, w: 11, h: 8, d: 0.8 },
    { x: 35, y: 12, w: 10, h: 8, d: 0.82 },  // Ruta 5 norte
    { x: 47, y: 8, w: 10, h: 7, d: 0.82 },
  ].forEach((p) => addTallGrassPatch(p.x, p.y, p.w, p.h, p.d));
}


function addRouteDecorations() {
  // Bancos, faroles, estatuas y cercas en rutas principales para que el mapa no se sienta vacío.
  const decos = [
    [18, 132, 15], [30, 130, 16], [22, 124, 20], [28, 124, 20],
    [38, 116, 15], [48, 115, 16], [14, 101, 19], [17, 98, 15],
    [61, 88, 15], [63, 82, 16], [55, 78, 20], [58, 78, 20],
    [31, 65, 15], [34, 65, 16], [65, 42, 19], [68, 42, 15],
    [43, 28, 15], [46, 28, 16], [39, 12, 19], [50, 8, 15],
  ];
  decos.forEach(([c, r, t]) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && (wMap[r][c] === 0 || wMap[r][c] === 1 || wMap[r][c] === 5)) wMap[r][c] = t;
  });
}
function polishVillageLayout(sx, sy, id) {
  const set = (c, r, t) => {
    if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) return;
    if (wMap[r][c] === 4 && t !== 4) return;
    wMap[r][c] = t;
  };
  const fill = (x1, y1, x2, y2, t) => {
    for (let r = y1; r <= y2; r++) for (let c = x1; c <= x2; c++) set(c, r, t);
  };
  const house = (c, r) => {
    if (c < 2 || r < 2 || c + 4 >= WC - 2 || r + 3 >= WR - 2) return false;
    for (let rr = r; rr <= r + 3; rr++)
      for (let cc = c; cc <= c + 4; cc++) wMap[rr][cc] = 4;
    return true;
  };

  // Suelo del pueblo (camino) — amplio
  const ground = id === 'rodaje' ? 26 : 1;
  fill(sx - 6, sy - 5, sx + 16, sy + 14, ground === 26 ? 26 : 0);
  fill(sx - 4, sy - 3, sx + 14, sy + 12, 1);
  fill(sx + 1, sy + 1, sx + 10, sy + 8, 1);

  // Calles en cruz
  for (let r = sy - 5; r <= sy + 14; r++) {
    set(sx + 5, r, 1);
    set(sx + 6, r, 1);
  }
  for (let c = sx - 6; c <= sx + 16; c++) {
    set(c, sy + 4, 1);
    set(c, sy + 5, 1);
  }

  // Casas 5×4. Abajo: dejar SIEMPRE ≥2 filas de camino delante de la puerta
  // (puerta en botR+3; camino en botR+4 y botR+5).
  const topR = Math.max(2, sy - 4);
  // Prefer botR = sy+8 → base sy+11, patio sy+12..sy+13
  let botR = sy + 8;
  if (botR + 3 >= WR - 3) botR = WR - 7; // base ≤ WR-4, patio WR-3
  // No solapar con casas de arriba (topR+3)
  if (botR <= topR + 3) botR = topR + 5;

  const leftC = Math.max(2, sx - 5);
  const rightC = Math.min(WC - 7, sx + 10);

  house(leftC, topR);
  house(rightC, topR);
  house(leftC, botR);
  house(rightC, botR);

  // Patio / acceso delante de CADA casa (3 tiles de profundidad × ancho de casa)
  const clearFront = (hc, hr) => {
    const doorRow = hr + 4; // primera fila bajo la base
    for (let r = doorRow; r <= doorRow + 2; r++) {
      for (let c = hc - 1; c <= hc + 5; c++) {
        if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
        if (wMap[r][c] === 4) continue;
        wMap[r][c] = 1;
      }
    }
  };
  clearFront(leftC, topR);
  clearFront(rightC, topR);
  clearFront(leftC, botR);
  clearFront(rightC, botR);

  // Reabrir calles centrales
  for (let r = sy - 5; r <= sy + 14; r++) {
    if (wMap[r]?.[sx + 5] !== 4) set(sx + 5, r, 1);
    if (wMap[r]?.[sx + 6] !== 4) set(sx + 6, r, 1);
  }
  for (let c = sx - 6; c <= sx + 16; c++) {
    if (wMap[sy + 4]?.[c] !== 4) set(c, sy + 4, 1);
    if (wMap[sy + 5]?.[c] !== 4) set(c, sy + 5, 1);
  }

  // Entradas N/S del pueblo
  if (wMap[sy - 5]?.[sx + 5] !== 4) set(sx + 5, sy - 5, 14);
  if (wMap[sy - 5]?.[sx + 6] !== 4) set(sx + 6, sy - 5, 1);
  if (wMap[sy + 14]?.[sx + 5] !== 4) set(sx + 5, sy + 14, 14);
  if (wMap[sy + 14]?.[sx + 6] !== 4) set(sx + 6, sy + 14, 1);

  // Bordillos SOLO en el perímetro exterior, NUNCA delante de puertas
  for (let c = sx - 5; c <= sx + 15; c++) {
    if (c === sx + 5 || c === sx + 6) continue;
    // norte: solo si no es patio de casa superior
    const northR = sy - 5;
    if (wMap[northR]?.[c] !== 4 && wMap[northR + 1]?.[c] !== 4) {
      // no poner bordillo si está justo bajo una puerta (base de casa arriba)
      if (wMap[northR - 1]?.[c] !== 4) set(c, northR, id === 'rodaje' ? 27 : 20);
    }
  }
  // Sur: bordillo más abajo que el patio de las casas inferiores
  const southFence = Math.min(WR - 3, botR + 7);
  for (let c = sx - 5; c <= sx + 15; c++) {
    if (c === sx + 5 || c === sx + 6) continue;
    if (wMap[southFence]?.[c] !== 4) set(c, southFence, id === 'rodaje' ? 27 : 20);
  }

  const deco = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 1) wMap[r][c] = t;
  };

  if (id === 'pitch') {
    deco(sx + 5, sy + 4, 22);
    deco(sx + 3, sy + 2, 23);
    deco(sx + 8, sy + 2, 23);
    deco(sx + 3, sy + 7, 21);
    deco(sx + 8, sy + 7, 21);
    [[sx + 2, sy + 2], [sx + 9, sy + 2], [sx + 2, sy + 8], [sx + 9, sy + 8], [sx + 4, sy + 3], [sx + 7, sy + 3]].forEach(([c, r]) => deco(c, r, 6));
    deco(sx + 4, sy + 2, 15);
    deco(sx + 7, sy + 2, 15);
  } else if (id === 'storyboard') {
    for (let c = sx + 3; c <= sx + 8; c++) {
      deco(c, sy + 2, 17);
      deco(c, sy + 7, 17);
    }
    deco(sx + 7, sy + 5, 19);
    deco(sx + 3, sy + 5, 16);
    deco(sx + 8, sy + 5, 16);
    deco(sx + 2, sy + 2, 15);
    deco(sx + 9, sy + 2, 15);
  } else if (id === 'rodaje') {
    for (let r = sy - 4; r <= sy + 13; r++) {
      for (let c = sx - 5; c <= sx + 15; c++) {
        if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
        if (wMap[r][c] === 4 || wMap[r][c] === 14) continue;
        if (c === sx + 5 || c === sx + 6 || r === sy + 4 || r === sy + 5) wMap[r][c] = 1;
        else if (wMap[r][c] !== 1) wMap[r][c] = 26;
      }
    }
    house(leftC, topR);
    house(rightC, topR);
    house(leftC, botR);
    house(rightC, botR);
    clearFront(leftC, topR);
    clearFront(rightC, topR);
    clearFront(leftC, botR);
    clearFront(rightC, botR);
    deco(sx + 5, sy + 3, 25);
    deco(sx + 7, sy + 5, 25);
    deco(sx + 3, sy + 3, 15);
    deco(sx + 8, sy + 3, 15);
    deco(sx + 3, sy + 8, 16);
    deco(sx + 8, sy + 8, 16);
  } else if (id === 'ultimatoma') {
    deco(sx + 3, sy + 3, 18);
    deco(sx + 8, sy + 3, 18);
    deco(sx + 3, sy + 7, 18);
    deco(sx + 8, sy + 7, 18);
    deco(sx + 5, sy + 5, 19);
    deco(sx + 3, sy + 5, 15);
    deco(sx + 8, sy + 5, 15);
    deco(sx + 4, sy + 6, 16);
    deco(sx + 7, sy + 6, 16);
    [[sx + 2, sy + 2], [sx + 9, sy + 2], [sx + 2, sy + 8], [sx + 9, sy + 8]].forEach(([c, r]) => deco(c, r, 6));
  } else if (id === 'montaje') {
    fill(sx + 2, sy - 3, sx + 9, sy - 1, 26);
    set(sx + 5, sy - 4, 14);
    house(leftC, topR);
    house(rightC, topR);
    house(leftC, botR);
    house(rightC, botR);
    clearFront(leftC, topR);
    clearFront(rightC, topR);
    clearFront(leftC, botR);
    clearFront(rightC, botR);
    deco(sx + 5, sy + 4, 19);
    deco(sx + 8, sy + 4, 19);
    deco(sx + 3, sy + 3, 15);
    deco(sx + 8, sy + 3, 15);
    deco(sx + 4, sy + 7, 16);
    deco(sx + 7, sy + 7, 16);
    deco(sx + 2, sy + 3, 20);
    deco(sx + 9, sy + 3, 20);
  }
}

// === LAYOUTS FIJOS C2/C3 ==================================================
// Estos layouts sustituyen la apariencia genérica de los dos primeros pueblos.
// Solo flores/hierba menor pueden variar; caminos, agua, casas y plazas son fijos.
function setWorld(c, r, tile) {
  if (c >= 2 && c < WC - 2 && r >= 2 && r < WR - 2) wMap[r][c] = tile;
}
function fillWorld(x1, y1, x2, y2, tile) {
  for (let r = y1; r <= y2; r++) for (let c = x1; c <= x2; c++) setWorld(c, r, tile);
}
function worldHouse(x, y) { fillWorld(x, y, x + 4, y + 3, 4); }
function keepPath(c, r) { setWorld(c, r, 1); }

function buildPitchC2() {
  // Aldea Pitch: aldea fluvial. El río y puente son geometría real, no decorado.
  fillWorld(9, 128, 35, 148, 0);
  // Río del este, con ribera de piedra y puente central.
  fillWorld(29, 128, 35, 148, 2);
  for (let r = 128; r <= 148; r++) setWorld(28, r, r % 3 === 0 ? 6 : 0);
  fillWorld(25, 139, 35, 140, 1); // puente de madera/camino
  // Camino desde la salida sur y hacia Ruta 1.
  fillWorld(19, 128, 20, 148, 1);
  fillWorld(14, 139, 28, 140, 1);
  fillWorld(19, 128, 21, 132, 1);
  // Casas de piedra/madera, deliberadamente separadas de caminos y NPCs.
  worldHouse(11, 130); worldHouse(22, 130); worldHouse(11, 143); worldHouse(22, 143);
  // Patios y accesos a puertas.
  fillWorld(11, 134, 16, 136, 1); fillWorld(22, 134, 27, 136, 1);
  fillWorld(11, 147, 16, 148, 1); fillWorld(22, 147, 27, 148, 1);
  // Plaza del pozo y ribera; el pozo es sólido, el resto transitable.
  fillWorld(17, 136, 23, 138, 1); setWorld(18, 137, 22);
  // Patio Comunitario de Ensayo: suelo delimitado y objetos sólidos reales.
  fillWorld(11, 137, 16, 141, 1);
  setWorld(12, 137, 20); setWorld(15, 137, 20); setWorld(12, 141, 20); setWorld(15, 141, 20);
  setWorld(13, 139, 23); setWorld(14, 139, 23);
  // Bosque y flores en bordes, manteniendo entradas limpias.
  for (let r = 128; r <= 148; r++) for (let c = 9; c <= 35; c++) {
    if (wMap[r][c] !== 0) continue;
    if ((c === 9 || c === 35 || r === 128) && (c + r) % 3 !== 0) setWorld(c, r, 3);
    else if ((c * 5 + r * 3) % 11 === 0) setWorld(c, r, 6);
  }
  // Reafirmar el eje hacia Ruta 1 después de bordes.
  fillWorld(19, 128, 20, 148, 1);
}

function buildRoute1C2() {
  // Ruta 1: ribera/bosque joven; el camino está siempre despejado y el río acompaña al este.
  for (let r = 115; r <= 127; r++) {
    for (let c = 11; c <= 32; c++) {
      if (wMap[r][c] === 1 || wMap[r][c] === 4) continue;
      if (c >= 27 && c <= 31 && r >= 119) setWorld(c, r, 2);
      else if ((c + r) % 5 === 0) setWorld(c, r, 5);
      else if (c === 11 || c === 32) setWorld(c, r, 3);
    }
  }
  // Camino serpenteante de aventura desde Pitch a Storyboard.
  for (let r = 115; r <= 127; r++) {
    const center = r < 121 ? 25 : 20;
    keepPath(center, r); keepPath(center + 1, r);
  }
  fillWorld(20, 126, 26, 127, 1);
  // Claro lateral para exploración/pines y piedras de ribera.
  fillWorld(14, 120, 18, 124, 0);
  setWorld(14, 120, 6); setWorld(18, 124, 6); setWorld(16, 121, 24);
}

function buildStoryboardC3() {
  // Villa Storyboard: plaza de iluminadores, tapices y artefactos escénicos medievales.
  fillWorld(28, 99, 56, 118, 0);
  // Calles y plaza de pergaminos.
  fillWorld(39, 99, 41, 118, 1);
  fillWorld(31, 108, 53, 110, 1);
  fillWorld(36, 104, 46, 114, 1);
  // Casas/gremios alrededor de la plaza.
  worldHouse(30, 100); worldHouse(48, 100); worldHouse(30, 114); worldHouse(48, 114);
  fillWorld(29, 104, 35, 106, 1); fillWorld(47, 104, 53, 106, 1);
  // Paneles, vitrales y tapices: arte visual medieval, no estudio moderno.
  setWorld(37, 106, 17); setWorld(38, 106, 17); setWorld(43, 106, 17); setWorld(44, 106, 17);
  setWorld(37, 112, 17); setWorld(44, 112, 17); setWorld(40, 109, 19);
  // Taller de Utilería Proa: herrería ligera, farol alquímico, cajas y placas.
  fillWorld(48, 108, 53, 112, 26);
  setWorld(49, 108, 20); setWorld(52, 108, 20); setWorld(49, 112, 20); setWorld(52, 112, 20);
  setWorld(50, 110, 21); setWorld(51, 110, 21); setWorld(52, 110, 15);
  // Jardines feéricos y arbolado protector en bordes.
  for (let r = 99; r <= 118; r++) for (let c = 28; c <= 56; c++) {
    if (wMap[r][c] !== 0) continue;
    if ((c === 28 || c === 56 || r === 99 || r === 118) && (c + r) % 3 !== 0) setWorld(c, r, 3);
    else if ((c * 3 + r * 7) % 6 === 0) setWorld(c, r, 6);
  }
  // Salidas sur/norte y zona de Tamara sin obstáculos.
  fillWorld(39, 99, 41, 118, 1);
  fillWorld(36, 108, 46, 110, 1);
}

function buildRoute2C3() {
  // Ruta 2: bosque que se transforma gradualmente en piedra de cantera.
  for (let r = 87; r <= 98; r++) for (let c = 31; c <= 57; c++) {
    if (wMap[r][c] === 1 || wMap[r][c] === 4 || wMap[r][c] === 9) continue;
    if (r < 93 && (c + r) % 4 === 0) setWorld(c, r, 3);
    else if (r >= 93 && (c * 3 + r) % 5 === 0) setWorld(c, r, 7);
    else if (r >= 92 && (c + r) % 3 === 0) setWorld(c, r, 26);
    else setWorld(c, r, (c + r) % 4 === 0 ? 5 : 0);
  }
  // Camino ascendente intacto y sus ensanchamientos de descanso.
  for (let r = 87; r <= 98; r++) {
    const center = Math.round(54 - (r - 87) * 0.8);
    keepPath(center, r); keepPath(center + 1, r);
  }
  fillWorld(39, 97, 45, 98, 1);
  // Hitos de piedra y faroles de camino, medievales.
  setWorld(35, 95, 19); setWorld(48, 92, 15); setWorld(52, 89, 20);
}

function buildRodajeC4() {
  // Cantera Rodaje: piedra, madera y metal de gremio; sin fábrica contemporánea.
  fillWorld(43, 70, 72, 90, 26);
  // Camino de las vagonetas: conecta Ruta 2, plaza Proa y salida a Ruta 3.
  fillWorld(53, 70, 55, 90, 1);
  fillWorld(53, 80, 64, 82, 1);
  fillWorld(54, 87, 66, 89, 1);
  // Casas/almacenes de cantera fuera de la plaza de NPCs.
  worldHouse(44, 72); worldHouse(65, 72); worldHouse(44, 86); worldHouse(65, 86);
  fillWorld(44, 76, 50, 78, 1); fillWorld(64, 76, 70, 78, 1);
  // Plaza de Luchito: piedra abierta, deliberadamente sin objetos sólidos donde están los NPCs.
  fillWorld(50, 79, 60, 85, 1);
  // Patio de Ensayo de Cantera (Lucha): anillo de piedra, sacos y columnas.
  fillWorld(45, 81, 50, 85, 26);
  setWorld(45, 81, 20); setWorld(50, 81, 20); setWorld(45, 85, 20); setWorld(50, 85, 20);
  setWorld(47, 82, 23); setWorld(48, 82, 23); setWorld(46, 84, 7);
  // Taller de Rieles y Utilería (Acero): riel de vagoneta, cajas, farol y herrería.
  fillWorld(61, 82, 68, 85, 26);
  setWorld(61, 82, 20); setWorld(68, 82, 20); setWorld(61, 85, 20); setWorld(68, 85, 20);
  setWorld(63, 83, 21); setWorld(64, 83, 21); setWorld(66, 83, 15); setWorld(67, 84, 7);
  // Bordes de cantera: roca y muros de contención, nunca sobre caminos/NPCs.
  for (let r = 70; r <= 90; r++) for (let c = 43; c <= 72; c++) {
    if (wMap[r][c] !== 26) continue;
    if ((c === 43 || c === 72 || r === 70 || r === 90) && (c + r) % 3 !== 0) setWorld(c, r, 7);
    else if ((c * 7 + r) % 17 === 0) setWorld(c, r, 15);
  }
  // Restaurar salidas limpias después de los bordes.
  fillWorld(53, 70, 55, 90, 1);
  fillWorld(53, 80, 64, 82, 1);
  // Acceso lateral que anuncia la futura Cueva Volcánica.
  fillWorld(49, 87, 53, 89, 1); setWorld(50, 88, 19); setWorld(51, 88, 15);
}

function buildRoute3C4() {
  // Ruta 3: garganta de cantera con piedra, faroles y un camino de peregrinos.
  for (let r = 57; r <= 69; r++) for (let c = 51; c <= 71; c++) {
    if (wMap[r][c] === 1 || wMap[r][c] === 4 || wMap[r][c] === 9) continue;
    if (c === 51 || c === 71 || ((c * 3 + r) % 7 === 0)) setWorld(c, r, 7);
    else if ((c + r) % 5 === 0) setWorld(c, r, 26);
    else setWorld(c, r, (c + r) % 4 === 0 ? 5 : 0);
  }
  // La ruta gira gradualmente desde el puesto de Luchito hacia el norte/este.
  for (let r = 57; r <= 76; r++) {
    const center = r > 69 ? 54 : Math.round(54 + (69 - r) * 0.8);
    keepPath(center, r); keepPath(center + 1, r);
  }
  fillWorld(54, 74, 57, 76, 1); // paso Proa de Luchito
  // Hitos medievales: altar de cantera y faroles de garganta.
  setWorld(62, 67, 19); setWorld(59, 63, 15); setWorld(68, 60, 20);
}

function buildUltimaTomaC5() {
  // Feria Última Toma: plaza nocturna de juglares, tapices, faroles y escenario medieval.
  fillWorld(18, 40, 43, 61, 0);
  // Eje de feria y camino de Andrea, siempre transitable.
  fillWorld(29, 40, 32, 61, 1);
  fillWorld(22, 50, 39, 53, 1);
  // Casas y posadas en los extremos, sin invadir la plaza social.
  worldHouse(19, 42); worldHouse(37, 42); worldHouse(19, 56); worldHouse(37, 56);
  fillWorld(19, 46, 25, 48, 1); fillWorld(36, 46, 42, 48, 1);
  fillWorld(19, 60, 25, 61, 1); fillWorld(36, 60, 42, 61, 1);
  // Escenario de madera al este: tarima, carpas y faroles; la plaza queda libre para Pachi/Brisa/Roberto.
  fillWorld(35, 49, 40, 54, 26);
  setWorld(35, 49, 20); setWorld(40, 49, 20); setWorld(35, 54, 20); setWorld(40, 54, 20);
  setWorld(37, 50, 18); setWorld(38, 50, 18); setWorld(39, 50, 18);
  setWorld(36, 52, 15); setWorld(39, 52, 15);
  // Carpas y puestos de feria en el oeste, con paso alrededor.
  setWorld(23, 50, 18); setWorld(24, 50, 18); setWorld(22, 52, 18); setWorld(24, 54, 15);
  // Jardines nocturnos, faroles y flores: bordes seguros, no caminos.
  for (let r = 40; r <= 61; r++) for (let c = 18; c <= 43; c++) {
    if (wMap[r][c] !== 0) continue;
    if ((c === 18 || c === 43 || r === 40 || r === 61) && (c + r) % 3 !== 0) setWorld(c, r, 3);
    else if ((c * 5 + r * 3) % 5 === 0) setWorld(c, r, 6);
  }
  // Restituir el eje de llegada/salida y la plaza central.
  fillWorld(29, 40, 32, 61, 1);
  fillWorld(27, 50, 34, 53, 1);
}

function buildRoute4C5() {
  // Ruta 4: camino de faroles y ruinas, desde la feria hacia los prados de Montaje.
  for (let r = 27; r <= 46; r++) for (let c = 27; c <= 52; c++) {
    if (wMap[r][c] === 1 || wMap[r][c] === 4 || wMap[r][c] === 9) continue;
    if (c === 27 || c === 52 || ((c + r) % 11 === 0)) setWorld(c, r, 3);
    else if ((c * 5 + r) % 8 === 0) setWorld(c, r, 7);
    else if ((c + r) % 4 === 0) setWorld(c, r, 6);
    else setWorld(c, r, (c + r) % 5 === 0 ? 5 : 0);
  }
  // Sendero que sale del puesto de Andrea y se inclina hacia Montaje.
  for (let r = 27; r <= 46; r++) {
    const center = Math.round(30 + (46 - r) * 0.7);
    keepPath(center, r); keepPath(center + 1, r);
  }
  fillWorld(29, 44, 33, 46, 1);
  // Ruinas y faroles antiguos: piezas medievales, no infraestructura moderna.
  setWorld(38, 39, 19); setWorld(39, 39, 20); setWorld(45, 33, 15); setWorld(34, 30, 19);
}

function genExpandedTerrainC15a2b() {
  // C1.5a-2b: terreno base del Reino ampliado. Pueblos/NPCs llegan en commits posteriores.
  for (let r = 0; r < WR; r++) {
    wMap[r] = [];
    for (let c = 0; c < WC; c++) {
      const edge = r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2;
      wMap[r][c] = edge ? 3 : ((c * 17 + r * 11) % 19 === 0 ? 5 : 0);
    }
  }
  // Camino Real continuo: el esqueleto navegable del sur al norte.
  for (let r = 2; r < WR - 2; r++) for (let dc = -1; dc <= 1; dc++) wMap[r][60 + dc] = 1;
  // Plazas/descansos en los centros de las futuras regiones.
  [285,250,215,180,145,115,85,55,28,12,5].forEach((r) => {
    for (let y=r-2;y<=r+2;y++) for(let x=50;x<=70;x++) if(y>=2&&y<WR-2) wMap[y][x]=1;
  });
  // C1.5a-2c: plazas regionales provisionales, ya reubicadas en el mapa ampliado.
  const hubs = [
    [60,285,'pitch'], [60,215,'storyboard'], [60,145,'rodaje'],
    [60,85,'ultimatoma'], [60,28,'montaje'], [60,5,'castle'],
  ];
  hubs.forEach(([cx, cy, id]) => {
    const floor = id === 'rodaje' ? 26 : 1;
    for (let y=cy-8;y<=cy+8;y++) for(let x=cx-14;x<=cx+14;x++) {
      if (x<2||x>=WC-2||y<2||y>=WR-2) continue;
      wMap[y][x] = floor;
    }
    // Cuatro edificios provisionales; C2.5–C6 los convertirán en estructuras únicas/entrables.
    if (id !== 'castle') {
      [[cx-12,cy-7],[cx+8,cy-7],[cx-12,cy+4],[cx+8,cy+4]].forEach(([x,y]) => {
        for(let yy=y;yy<y+3;yy++) for(let xx=x;xx<x+4;xx++) if (wMap[yy]) wMap[yy][xx]=4;
      });
    } else {
      for(let y=Math.max(2, cy-3);y<=Math.min(WR-3, cy+3);y++) for(let x=Math.max(2, cx-18);x<=Math.min(WC-3, cx+18);x++) if (x<cx-3||x>cx+3||y<cy) wMap[y][x]=13;
      if (cy + 3 < WR - 2) wMap[cy+3][cx]=11;
    }
    for(let y=Math.max(2, cy-8);y<=Math.min(WR-3, cy+8);y++) for(let x=Math.max(2, cx-1);x<=Math.min(WC-3, cx+1);x++) if(wMap[y] && wMap[y][x]!==4&&wMap[y][x]!==13)wMap[y][x]=1;
  });

  // Río del sur y puentes provisionales transitables.
  for(let r=255;r<WR-2;r++) for(let c=88;c<=96;c++) wMap[r][c]=2;
  for (const r of [276,288]) for(let c=86;c<=98;c++) wMap[r][c]=1;
  // Bosques laterales, sin tocar el camino principal.
  for(let r=20;r<275;r++) for(let c=3;c<117;c++) {
    if (Math.abs(c-60)<10 || wMap[r][c]!==0) continue;
    if ((c*5+r*3)%13===0) wMap[r][c]=3;
  }
}

function genWorld() {
  if (WC === 120 && WR === 300) { genExpandedTerrainC15a2b(); applyExpandedWorldPoints(wMap); return; }
  // Inicializar mapa con hierba y hierba alta aleatoria
  for (let r = 0; r < WR; r++) {
    wMap[r] = [];
    for (let c = 0; c < WC; c++) wMap[r][c] = Math.random() < 0.14 ? 5 : 0;
  }

  // Bordes de árboles
  for (let r = 0; r < WR; r++)
    for (let c = 0; c < WC; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) wMap[r][c] = 3;
    }

  // ============================================================
  // CAMINO PRINCIPAL (Sur → Norte) - Asegurando flujo libre
  // ============================================================
  vPath(20, 130, 148);
  hPath(130, 15, 35);
  vPath(35, 115, 130);
  hPath(115, 35, 50);
  vPath(50, 98, 115);
  hPath(98, 15, 50);
  vPath(15, 100, 110);
  hPath(90, 50, 65);
  vPath(65, 77, 98);
  vPath(65, 65, 90);
  hPath(65, 30, 65);
  vPath(30, 47, 77);
  vPath(30, 35, 65);
  hPath(42, 30, 72);   // llega al corredor central (conecta la entrada de la Cueva Cristalina)
  vPath(72, 30, 50);
  hPath(35, 44, 72);
  vPath(44, 17, 47);
  vPath(44, 5, 27);
  hPath(10, 37, 44);
  vPath(37, 4, 14);
  hPath(5, 50, 60);
  // Rutas de garantia (conectividad total del mapa)
  hPath(35, 30, 44);   // une el corredor del noreste con la red principal
  hPath(82, 50, 65);   // conecta la aldea Rodaje al corredor central

  // ============================================================
  // CAMINO DIRECTO STORYBOARD → RODAJE (sin árboles ni agua)
  // Diagonal escalonada de 3 tiles de ancho desde la salida norte
  // de Storyboard (col ~42, row ~100) hasta la entrada sur de
  // Rodaje (col ~54, row ~78).
  // ============================================================
  for (let r = 98; r >= 82; r--) {
    const prog = (98 - r) / 16;
    const centerC = Math.round(42 + prog * 12);
    for (let dc = -1; dc <= 1; dc++) {
      const cc = centerC + dc;
      if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
    }
    if ((98 - r) % 6 === 0 && r < 97) {
      for (let side = -1; side <= 1; side += 2) {
        const tc = centerC + side * 3;
        if (tc >= 2 && tc < WC - 2 && wMap[r][tc] === 0) wMap[r][tc] = 15;
      }
    }
  }
  for (let r = 80; r <= 100; r++) {
    for (let c = 39; c <= 57; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) {
        const t = wMap[r][c];
        if (t === 2 || t === 3 || t === 7) wMap[r][c] = 0;
      }
    }
  }

  // ============================================================
  // LAGOS - Reposicionados para NO bloquear caminos
  // ============================================================
  [
    { x: 55, y: 135, w: 8, h: 6 }, // Lejos de R1
    { x: 5, y: 110, w: 7, h: 5 }, // Lejos de Cueva Volcánica
    { x: 72, y: 85, w: 6, h: 5 }, // Lejos de R3
    { x: 10, y: 55, w: 8, h: 6 }, // Lejos de R4
    { x: 60, y: 45, w: 6, h: 5 }, // Lejos de Cueva Cristalina
    { x: 10, y: 10, w: 10, h: 6 }, // Ruta 5 lateral
  ].forEach((l) => {
    for (let r = l.y; r < l.y + l.h && r < WR - 2; r++)
      for (let c = l.x; c < l.x + l.w && c < WC - 2; c++) {
        const dx = c - (l.x + l.w / 2),
          dy = r - (l.y + l.h / 2);
        if ((dx * dx) / ((l.w * l.w) / 4) + (dy * dy) / ((l.h * l.h) / 4) < 1)
          wMap[r][c] = 2;
      }
  });

  // ============================================================
  // BOSQUES FRONDOSOS (Aumentado tamaño y cantidad)
  // ============================================================
  [
    { x: 2, y: 120, w: 20, h: 25 },
    { x: 45, y: 115, w: 30, h: 30 },
    { x: 5, y: 80, w: 25, h: 30 },
    { x: 45, y: 65, w: 30, h: 40 },
    { x: 2, y: 30, w: 25, h: 40 },
    { x: 55, y: 10, w: 22, h: 50 },
  ].forEach((f) => {
    for (let r = f.y; r < f.y + f.h && r < WR - 2; r++)
      for (let c = f.x; c < f.x + f.w && c < WC - 2; c++) {
        if (wMap[r][c] === 0 || wMap[r][c] === 5)
          wMap[r][c] = Math.random() < 0.7 ? 3 : 5; // 70% bosque = muy frondoso
      }
  });

  // Aldeas, Cuevas y Castillo
  buildVillage(18, 134, 'pitch');
  buildVillage(38, 107, 'storyboard');
  buildVillage(52, 79, 'rodaje');
  buildVillage(28, 49, 'ultimatoma');
  buildVillage(42, 19, 'montaje');
  placeCave(15, 105);
  placeCave(72, 38);
  buildCastleExt(37, 7);
  buildTower(33, 8);

  // Parches adicionales: más zonas reales de hierba alta en el mapa exterior.
  addWorldTallGrassPatches();
  // Bancos, faroles, estatuas y cercas en rutas.
  addRouteDecorations();

  // Fases C2/C3: primeros pueblos y rutas con geometría regional fija.
  buildPitchC2();
  buildRoute1C2();
  buildStoryboardC3();
  buildRoute2C3();
  buildRodajeC4();
  buildRoute3C4();
  buildUltimaTomaC5();
  buildRoute4C5();

  // Pines del mundo (antes cristales tile 10).
  // Se colocan aquí en la gen inicial; al reentrar el mapa se re-sortean
  // desde pin-system.respawnWorldPins().
  // Cantidad: 35 (usuario bajó de 45 → 35).
  let cv2 = 0;
  let pinAttempts = 0;
  while (cv2 < 35 && pinAttempts < 2000) {
    pinAttempts++;
    const c = 4 + Math.floor(Math.random() * (WC - 8));
    const r = 4 + Math.floor(Math.random() * (WR - 8));
    if (isWorldPinAllowed(wMap, c, r)) {
      wMap[r][c] = 10;
      cv2++;
    }
  }
}
function buildVillage(sx, sy, id) {
  // Suelo base del pueblo (amplio). Las casas grandes y la identidad
  // las pone polishVillageLayout (5×4 tiles por casa).
  for (let r = sy - 4; r <= sy + 13; r++) {
    for (let c = sx - 5; c <= sx + 15; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) {
        if (wMap[r][c] !== 2 && wMap[r][c] !== 9 && wMap[r][c] !== 11 && wMap[r][c] !== 12) {
          wMap[r][c] = 1;
        }
      }
    }
  }

  // Flores de borde suaves
  for (let c = sx - 4; c <= sx + 14; c++) {
    if (sy - 4 >= 2 && c >= 2 && c < WC - 2 && wMap[sy - 4][c] === 1 && Math.random() < 0.25) {
      wMap[sy - 4][c] = 6;
    }
  }

  // Layout final: casas 5×4 + plaza + identidad
  polishVillageLayout(sx, sy, id);
}

function placeCave(cx2, cy) {
  // Limpiar área alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2)
        wMap[r][c] = 0;
    }
  // Entrada grande (2x2)
  wMap[cy][cx2] = 9;
  wMap[cy][cx2 + 1] = 9;
  wMap[cy - 1][cx2] = 9;
  wMap[cy - 1][cx2 + 1] = 9;
  // Rocas decorativas alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (
        r >= 2 &&
        r < WR - 2 &&
        c >= 2 &&
        c < WC - 2 &&
        wMap[r][c] === 0 &&
        Math.random() < 0.3
      )
        wMap[r][c] = 7;
    
  // Bolsillo de acceso: camino limpio en todo el entorno para poder rodear la
  // entrada sin que rocas/arboles aleatorios bloqueen el paso nunca.
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2 && wMap[r][c] !== 9)
        wMap[r][c] = 1;
    }
}
}

function buildCastleExt(sx, sy) {
  // Camino de acceso
  for (let r = sy - 1; r < sy + 8; r++)
    for (let c = sx - 1; c < sx + 12; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Muros del castillo (tile 13 en vez de 4)
  for (let r = sy; r < sy + 5; r++)
    for (let c = sx; c < sx + 10; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 13;
    }

  // Puerta de entrada
  wMap[sy + 4][sx + 4] = 11;
  wMap[sy + 4][sx + 5] = 11;

  // Torres esquineras (más altas)
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx] = 13;
      wMap[r][sx + 1] = 13;
      wMap[r][sx + 8] = 13;
      wMap[r][sx + 9] = 13;
    }
  }

  // Torres traseras
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx + 3] = 13;
      wMap[r][sx + 6] = 13;
    }
  }

  // Patio interior (camino)
  for (let r = sy + 1; r < sy + 4; r++)
    for (let c = sx + 2; c < sx + 8; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Decoración: flores junto a la puerta
  if (sy + 5 < WR - 2) {
    wMap[sy + 5][sx + 3] = 6;
    wMap[sy + 5][sx + 6] = 6;
  }

  // Decoración: antorchas (flores en el camino de acceso)
  if (sy + 6 < WR - 2) {
    wMap[sy + 6][sx + 4] = 6;
    wMap[sy + 6][sx + 5] = 6;
  }
}

function buildTower(sx, sy) {
  // Solo colocar si está dentro del mapa
  if (sy < 2 || sy >= WR - 4 || sx < 2 || sx >= WC - 4) return;
  // Limpiar área
  for (let r = sy - 1; r <= sy + 2; r++)
    for (let c = sx - 1; c <= sx + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }
  // Montañas alrededor
  for (let r = sy - 2; r <= sy + 3; r++)
    for (let c = sx - 2; c <= sx + 3; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 0)
        wMap[r][c] = 7;
    }
  // Puerta de la torre
  wMap[sy + 1][sx] = 12;
  wMap[sy + 1][sx + 1] = 12;
}

// === GENERACIÓN DE CUEVAS ===
function genCave(map, cols, rows) {
  // Todo paredes inicialmente
  for (let r = 0; r < rows; r++) {
    map[r] = [];
    for (let c = 0; c < cols; c++) map[r][c] = 21;
  }

  // === TÚNEL PRINCIPAL VERTICAL (3 tiles de ancho) ===
  const midC = Math.floor(cols / 2);
  for (let r = 1; r < rows - 1; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALAS LATERALES (3 a la izquierda, 3 a la derecha) ===
  const salas = [
    { x: 3, y: 4, w: 6, h: 4 },
    { x: 3, y: 11, w: 6, h: 4 },
    { x: 3, y: 18, w: 6, h: 4 },
    { x: cols - 9, y: 4, w: 6, h: 4 },
    { x: cols - 9, y: 11, w: 6, h: 4 },
    { x: cols - 9, y: 18, w: 6, h: 4 },
  ];

  salas.forEach((s) => {
    // Tallar sala
    for (let r = s.y; r < s.y + s.h && r < rows - 1; r++) {
      for (let c = s.x; c < s.x + s.w && c < cols - 1; c++) {
        if (r > 0 && c > 0) map[r][c] = 20;
      }
    }
    // Conectar sala con túnel central
    const conY = s.y + Math.floor(s.h / 2);
    const start = Math.min(s.x + s.w, midC);
    const end = Math.max(s.x, midC);
    for (let c = start; c <= end; c++) {
      if (c > 0 && c < cols - 1) map[conY][c] = 20;
    }
  });

  // === ENTRADA (arriba) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = 1; r <= 3; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALIDA (abajo) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = rows - 4; r <= rows - 2; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }
  // Marcar tiles de salida
  map[rows - 2][midC - 1] = 27;
  map[rows - 2][midC] = 27;
  map[rows - 2][midC + 1] = 27;

  // === DECORACIÓN: Vegetación en bordes ===
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (map[r][c] !== 20) continue;
      let nearWall = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (map[r + dr]?.[c + dc] === 21) nearWall = true;
        }
      if (nearWall && Math.random() < 0.08) map[r][c] = 26;
    }
  }

  // === DESNIVELES DE CUEVA: plataformas rocosas en bordes de salas ===
  salas.forEach((s) => {
    for (let c = s.x + 1; c < s.x + s.w - 1; c++) {
      if (map[s.y]?.[c] === 20 && (c + s.y) % 2 === 0) map[s.y][c] = 29;
      const rr = s.y + s.h - 1;
      if (map[rr]?.[c] === 20 && (c + rr) % 3 === 0) map[rr][c] = 29;
    }
  });

  // === DECORACIÓN: Cristales decorativos en salas ===
  salas.forEach((s) => {
    if (Math.random() < 0.6) {
      const cc = s.x + 1 + Math.floor(Math.random() * (s.w - 2));
      const cr = s.y + 1 + Math.floor(Math.random() * (s.h - 2));
      if (map[cr][cc] === 20) map[cr][cc] = 22;
    }
  });

  // === LAVA (solo en cuevas con índice impar - Cueva Volcánica) ===
  // Pequeño charco en una sala
  if (Math.random() < 0.7) {
    const lavaSala = salas[Math.floor(Math.random() * salas.length)];
    const lx = lavaSala.x + 1;
    const ly = lavaSala.y + 1;
    map[ly][lx] = 24;
    map[ly][lx + 1] = 24;
  }

  // === AGUA SUBTERRÁNEA ===
  if (Math.random() < 0.5) {
    const aguaSala = salas[Math.floor(Math.random() * salas.length)];
    const ax = aguaSala.x + 1;
    const ay = aguaSala.y + 1;
    map[ay][ax] = 23;
    map[ay][ax + 1] = 23;
  }

  // === PINES (antes cristales vínculo capturables) ===
  // Tile 28: pin sólido, se recoge con SPACE. Reaparecen al reentrar.
  let cp = 0;
  let attempts = 0;
  while (cp < 5 && attempts < 100) {
    const c = 2 + Math.floor(Math.random() * (cols - 4));
    const r = 2 + Math.floor(Math.random() * (rows - 4));
    if (map[r][c] === 20) {
      map[r][c] = 28;
      cp++;
    }
    attempts++;
  }
}


function addOloSecretChamber(map) {
  // Cámara oculta de Mr. Olo-Man en Cueva Volcánica.
  // La sala ya existe tras la pared; la entrada secreta se abre desde (19,24) hacia la izquierda.
  for (let r = 22; r <= 27; r++) {
    for (let c = 4; c <= 10; c++) map[r][c] = 20;
  }
  for (let c = 11; c <= 17; c++) map[24][c] = 20;
  map[24][18] = 21; // pared secreta cerrada
  map[23][18] = 21;
  map[25][18] = 21;
}

function genCastle() {
  // ==========================================================
  // CASTILLO REAL — 30x25 tiles
  //
  // Layout de NORTE (fila 0) a SUR (fila 24):
  //
  //  Fila 1       ═══ pared norte del castillo ═══
  //  Fila 2-3     Estandartes decorativos y respaldo del trono
  //  Fila 4       [REY NAVARRETE al fondo, mirando al sur]
  //  Fila 5-11    ┃ Sala del trono LARGA (alfombra roja + antorchas) ┃
  //  Fila 12      ═══ pared + PUERTA CON CANDADO en col 15 ═══
  //  Fila 13-19   Pasillo central + salas laterales:
  //                  Sala oeste (Andre/Ravell)  |  Sala este (Yam Carcelera)
  //  Fila 20-22   Vestíbulo con alfombra hacia la salida
  //  Fila 23      [ENTRADA/SALIDA sur al mundo]
  //
  // Al entrar por el sur, el jugador NO ve al Rey (ha muchas filas de
  // distancia + pared con puerta). Al cruzar la puerta y avanzar por la
  // sala del trono, cada paso se siente ceremonial. El Rey queda LEJOS
  // al fondo — es literalmente la prueba final.
  // ==========================================================

  // Piso inicial + murallas exteriores
  for (let r = 0; r < KR; r++) {
    castMap[r] = [];
    for (let c = 0; c < KC; c++) {
      if (r < 1 || r >= KR - 1 || c < 1 || c >= KC - 1) castMap[r][c] = 31;
      else castMap[r][c] = 30;
    }
  }

  // ------- SALA DEL TRONO (al norte, filas 1-11, LARGA y ancha) -------
  // Paredes laterales que delimitan la sala completa
  for (let r = 1; r <= 11; r++) {
    castMap[r][3] = 31;
    castMap[r][26] = 31;
  }
  // Suelo interno de la sala (piedra tile 32 = piso de sala del trono)
  for (let r = 2; r <= 11; r++)
    for (let c = 4; c <= 25; c++) castMap[r][c] = 32;

  // Respaldo del trono al fondo (fila 2, columnas centrales)
  castMap[2][14] = 31;
  castMap[2][15] = 31;
  castMap[2][16] = 31;
  // Detalles del trono flanqueando al rey
  castMap[3][14] = 31;
  castMap[3][16] = 31;
  // El REY va colocado en (15, 4) — mirando hacia el sur

  // Alfombra roja central desde el trono hasta la puerta cerrada
  // (el tile 30 dibuja alfombra en col 14-16, así que ya está por encima
  // del piso de sala; sobrescribimos para asegurar el efecto visual)
  for (let r = 4; r <= 11; r++) {
    castMap[r][14] = 30;
    castMap[r][15] = 30;
    castMap[r][16] = 30;
  }

  // ------- PARED DE SEPARACION con puerta bloqueada -------
  // Muro completo en fila 12, atraviesa todo el castillo
  for (let c = 2; c <= 27; c++) castMap[12][c] = 31;
  // Puerta cerrada en (15, 12) - tile 34 = puerta con candado dorado
  castMap[12][15] = 34;

  // ------- SALAS LATERALES (filas 14-19) -------

  // Sala oeste (André / Ravell) - cols 2-11
  for (let r = 14; r <= 19; r++) {
    castMap[r][2] = 31;
    castMap[r][11] = 31;
  }
  for (let c = 2; c <= 11; c++) {
    castMap[14][c] = 31;
    castMap[19][c] = 31;
  }
  castMap[19][7] = 30; // Puerta abierta al pasillo
  for (let r = 15; r < 19; r++) for (let c = 3; c < 11; c++) castMap[r][c] = 30;

  // Sala este (Yam la Carcelera) - cols 18-27
  for (let r = 14; r <= 19; r++) {
    castMap[r][18] = 31;
    castMap[r][27] = 31;
  }
  for (let c = 18; c <= 27; c++) {
    castMap[14][c] = 31;
    castMap[19][c] = 31;
  }
  castMap[19][22] = 30; // Puerta abierta al pasillo
  for (let r = 15; r < 19; r++) for (let c = 19; c < 27; c++) castMap[r][c] = 30;

  // ------- Pasillos principales -------
  // Vertical central desde el sur (entrada) hasta la puerta bloqueada
  for (let r = 13; r <= 22; r++)
    for (let c = 14; c <= 16; c++) castMap[r][c] = 30;
  // Horizontal a la altura de las puertas de las salas laterales (fila 20)
  for (let c = 7; c <= 22; c++) castMap[20][c] = 30;

  // ------- Salida al mundo (sur) -------
  castMap[KR - 2][15] = 33;
}

export { genWorld, genCave, addOloSecretChamber, genCastle };
