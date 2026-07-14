// Generación procedural de mapas: mundo, cuevas y castillo.
import { G } from '../core/game-state.js';
import { towerOpen } from '../core/game-flags.js';
import { WC, WR, CC, CR, KC, KR, wMap, cave1, cave2, castMap } from '../core/world-constants.js';

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
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = t;
  };
  const fill = (x1, y1, x2, y2, t) => {
    for (let r = y1; r <= y2; r++) for (let c = x1; c <= x2; c++) set(c, r, t);
  };
  const house = (c, r) => fill(c, r, c + 1, r + 1, 4);

  // Layout base grande y ordenado: borde natural + plaza central + calles claras.
  const base = id === 'rodaje' ? 26 : 0;
  fill(sx - 4, sy - 3, sx + 12, sy + 10, base);
  fill(sx - 2, sy - 1, sx + 10, sy + 8, 1);
  fill(sx + 2, sy + 1, sx + 7, sy + 6, 1); // plaza
  // cruces principales no perfectamente rectangulares, pero ordenados
  for (let r = sy - 3; r <= sy + 10; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
  for (let c = sx - 4; c <= sx + 12; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
  // senderos escalonados/diagonales simulados
  for (let k = 0; k < 5; k++) { set(sx - 3 + k, sy + 8 - k, 1); set(sx + 11 - k, sy + 8 - k, 1); }

  // casas ordenadas fuera de la plaza
  house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);

  // entradas/salidas claras
  set(sx + 4, sy - 3, 14); set(sx + 5, sy - 3, 1);
  set(sx + 4, sy + 10, 14); set(sx + 5, sy + 10, 1);

  // bordes con desniveles/cercas, sin cerrar caminos
  for (let c = sx - 3; c <= sx + 11; c++) {
    if (c !== sx + 4 && c !== sx + 5) set(c, sy - 2, id === 'rodaje' ? 27 : 20);
    if (c !== sx + 4 && c !== sx + 5) set(c, sy + 9, id === 'rodaje' ? 27 : 20);
  }

  // Decoración por identidad de pueblo, ordenada alrededor de la plaza.
  if (id === 'pitch') {
    // Plaza inicial: pozo, entrenamiento, cajas, huellas y flores.
    set(sx + 4, sy + 3, 22);
    set(sx + 1, sy + 2, 23); set(sx + 2, sy + 2, 23);
    set(sx + 8, sy + 3, 21); set(sx + 8, sy + 4, 21);
    [[sx + 1, sy + 5], [sx + 2, sy + 6], [sx + 6, sy + 5], [sx + 7, sy + 2]].forEach(([c,r]) => set(c,r,24));
    [[sx + 1, sy + 1], [sx + 7, sy + 1], [sx + 1, sy + 7], [sx + 7, sy + 7], [sx + 3, sy + 6], [sx + 6, sy + 2]].forEach(([c,r]) => set(c,r,6));
    set(sx + 3, sy + 2, 15); set(sx + 6, sy + 2, 15);
  } else if (id === 'storyboard') {
    // Villa Storyboard/Tamara: orden en paneles alrededor de un mural central.
    fill(sx + 1, sy + 1, sx + 8, sy + 6, 1);
    set(sx + 3, sy + 2, 17); set(sx + 4, sy + 2, 17); set(sx + 5, sy + 2, 17);
    set(sx + 3, sy + 5, 17); set(sx + 4, sy + 5, 17); set(sx + 5, sy + 5, 17);
    set(sx + 6, sy + 4, 19); // estatua/figura artística
    set(sx + 2, sy + 4, 16); set(sx + 8, sy + 4, 16);
    set(sx + 1, sy + 1, 15); set(sx + 8, sy + 1, 15);
  } else if (id === 'rodaje') {
    // Cantera Rodaje: plaza de cantera ordenada con set/cámara central.
    fill(sx - 3, sy - 2, sx + 11, sy + 9, 26);
    for (let r = sy - 2; r <= sy + 9; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
    for (let c = sx - 3; c <= sx + 11; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
    house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);
    set(sx + 4, sy + 2, 25); set(sx + 6, sy + 4, 25);
    set(sx + 2, sy + 2, 15); set(sx + 8, sy + 2, 15);
    set(sx + 2, sy + 6, 16); set(sx + 7, sy + 6, 16);
    // terrazas/desniveles de cantera
    for (let c = sx - 3; c <= sx + 11; c++) { if (c < sx + 3 || c > sx + 6) set(c, sy - 2, 27); if (c < sx + 2 || c > sx + 8) set(c, sy + 9, 27); }
    for (let r = sy - 1; r <= sy + 8; r++) { if (r !== sy + 3 && r !== sy + 4) { set(sx - 3, r, 27); set(sx + 11, r, 27); } }
  } else if (id === 'ultimatoma') {
    // Feria Última Toma: puestos simétricos pero plaza irregular con flores.
    set(sx + 2, sy + 2, 18); set(sx + 7, sy + 2, 18); set(sx + 2, sy + 6, 18); set(sx + 7, sy + 6, 18);
    set(sx + 4, sy + 4, 19);
    set(sx + 2, sy + 4, 15); set(sx + 7, sy + 4, 15);
    set(sx + 3, sy + 5, 16); set(sx + 6, sy + 5, 16);
    [[sx+1,sy+1],[sx+8,sy+1],[sx+1,sy+7],[sx+8,sy+7]].forEach(([c,r])=>set(c,r,6));
  } else if (id === 'montaje') {
    // Prados Montaje: mirador ordenado, frío y ceremonial.
    fill(sx + 1, sy - 1, sx + 8, sy, 26);
    set(sx + 4, sy - 2, 14); set(sx + 5, sy - 2, 1);
    set(sx + 4, sy + 3, 19); set(sx + 8, sy + 3, 19);
    set(sx + 2, sy + 2, 15); set(sx + 7, sy + 2, 15);
    set(sx + 3, sy + 6, 16); set(sx + 6, sy + 6, 16);
    set(sx + 1, sy + 2, 20); set(sx + 9, sy + 2, 20);
  }
}

function applyVillageIrregularShape(sx, sy, id) {
  const set = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = t;
  };
  // Romper rectángulo perfecto: esquinas con césped/flores y bordes menos rígidos.
  const cornerTiles = [
    [sx - 2, sy - 2], [sx - 1, sy - 2], [sx + 8, sy - 2], [sx + 9, sy - 2],
    [sx - 2, sy + 7], [sx - 1, sy + 7], [sx + 8, sy + 7], [sx + 9, sy + 7],
    [sx - 2, sy - 1], [sx + 9, sy - 1], [sx - 2, sy + 6], [sx + 9, sy + 6],
  ];
  cornerTiles.forEach(([c, r], i) => set(c, r, i % 3 === 0 ? 6 : 0));

  // Caminos escalonados secundarios: simulan diagonales sin curvas.
  for (let k = 0; k < 5; k++) {
    set(sx - 2 + k, sy + 7 - k, 1);
    if (k < 4) set(sx - 1 + k, sy + 7 - k, 1);
    set(sx + 9 - k, sy + 7 - k, 1);
  }
  // Callejón angosto entre casas superiores e inferiores.
  for (let r = sy + 1; r <= sy + 5; r++) set(sx + 4, r, 1);
  for (let c = sx + 2; c <= sx + 7; c++) set(c, sy + 3, 1);

  // Desniveles visuales: bordes elevados que rompen la planicie.
  [
    [sx - 2, sy + 1], [sx - 1, sy + 1], [sx + 8, sy + 1], [sx + 9, sy + 1],
    [sx + 1, sy + 7], [sx + 2, sy + 7], [sx + 6, sy + 7], [sx + 7, sy + 7],
  ].forEach(([c, r]) => set(c, r, 27));

  // Toques temáticos por pueblo sobre la forma irregular.
  if (id === 'pitch') {
    // Más flores normales alrededor de la plaza inicial.
    [[sx + 1, sy + 2], [sx + 6, sy + 2], [sx + 1, sy + 5], [sx + 7, sy + 5], [sx + 5, sy + 6]].forEach(([c, r]) => set(c, r, 6));
  }
  if (id === 'storyboard') {
    // Pequeño pasaje en zigzag hacia el mural.
    for (let k = 0; k < 4; k++) set(sx + 1 + k, sy + 1 + k, 1);
  }
  if (id === 'rodaje') {
    // Cantera con terrazas/desniveles rocosos más obvios.
    for (let c = sx - 3; c <= sx + 11; c++) {
      if (c < sx + 2 || c > sx + 6) set(c, sy - 3, 27);
      if (c < sx + 1 || c > sx + 8) set(c, sy + 9, 27);
    }
    for (let r = sy - 2; r <= sy + 8; r++) {
      if (r !== sy + 3) set(sx - 3, r, 27);
      if (r !== sy + 3) set(sx + 11, r, 27);
    }
  }
  if (id === 'ultimatoma') {
    // Feria con entradas diagonales y puestos alrededor.
    set(sx + 1, sy + 1, 18); set(sx + 7, sy + 1, 18);
    set(sx + 1, sy + 6, 18); set(sx + 7, sy + 6, 18);
  }
  if (id === 'montaje') {
    // Mirador escalonado al norte.
    for (let c = sx; c <= sx + 8; c++) if (c !== sx + 4 && c !== sx + 5) set(c, sy - 1, 27);
    set(sx + 1, sy + 2, 19); set(sx + 8, sy + 2, 19);
  }
}

function genWorld() {
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
  buildVillage(18, 140, 'pitch');
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

  let cv2 = 0;
  while (cv2 < 45) {
    const c = 4 + Math.floor(Math.random() * (WC - 8));
    const r = 4 + Math.floor(Math.random() * (WR - 8));
    if (wMap[r][c] === 0) {
      wMap[r][c] = 10;
      cv2++;
    }
  }
}
function buildVillage(sx, sy, id) {
  // Área amplia de caminos
  for (let r = sy - 2; r < sy + 8; r++)
    for (let c = sx - 2; c < sx + 10; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Edificio arriba izquierda
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio arriba derecha
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo izquierda
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo derecha
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;

  // Flores decorativas
  for (let c = sx - 2; c < sx + 10; c++) {
    if (sy - 2 >= 2 && c >= 2 && c < WC - 2 && wMap[sy - 2][c] === 1)
      if (Math.random() < 0.3) wMap[sy - 2][c] = 6;
  }

  // Entradas/salidas: arco norte y salida sur clara para todos los pueblos.
  const archX = sx + 4;
  if (sy - 3 >= 2 && archX >= 2 && archX < WC - 2) wMap[sy - 3][archX] = 14;
  if (sy + 8 < WR - 2 && archX >= 2 && archX < WC - 2) wMap[sy + 8][archX] = 14;
  for (let rr = sy - 3; rr <= sy + 8; rr++) {
    if (rr >= 2 && rr < WR - 2) {
      if (wMap[rr][archX] !== 14) wMap[rr][archX] = 1;
      if (archX + 1 < WC - 2 && wMap[rr][archX + 1] !== 14) wMap[rr][archX + 1] = 1;
    }
  }

  // Forma irregular, senderos escalonados, callejones y desniveles.
  applyVillageIrregularShape(sx, sy, id);

  // Identidad visual por pueblo: forma + decoración.
  if (id === 'storyboard') {
    // Paneles de storyboard y mural abierto.
    for (let r = sy - 1; r <= sy + 7; r++)
      for (let c = sx - 1; c <= sx + 9; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 1 && (r + c) % 4 === 0) wMap[r][c] = 17;
    wMap[sy + 3][sx + 4] = 17;
    wMap[sy + 3][sx + 5] = 17;
    wMap[sy + 4][sx + 4] = 19; // estatua de criatura pintora
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 5] = 16;
    wMap[sy - 1][sx + 2] = 15;
    wMap[sy - 1][sx + 7] = 15;
  }

  if (id === 'rodaje') {
    // Cantera Rodaje: área irregular de piedra, rocas y set simbólico de rodaje.
    for (let r = sy - 4; r <= sy + 10; r++) {
      for (let c = sx - 4; c <= sx + 12; c++) {
        if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
        const edge = r === sy - 4 || r === sy + 10 || c === sx - 4 || c === sx + 12;
        const t = wMap[r][c];
        if (edge && t !== 4 && t !== 11 && t !== 12) wMap[r][c] = Math.random() < 0.65 ? 7 : 26;
        else if (t !== 4 && t !== 11 && t !== 12) wMap[r][c] = 26;
      }
    }
    // Caminos internos tallados en la cantera para no bloquear NPCs.
    for (let c = sx - 3; c <= sx + 11; c++) wMap[sy + 3][c] = 1;
    for (let r = sy - 3; r <= sy + 9; r++) wMap[r][sx + 4] = 1;
    // Set de rodaje simbólico y luces.
    wMap[sy + 2][sx + 4] = 25;
    wMap[sy + 4][sx + 6] = 25;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 8] = 15;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 7] = 16;
    // Reubicar visualmente algunos edificios como casetas de producción.
    for (const [bc, br] of [[sx, sy], [sx + 6, sy], [sx, sy + 5], [sx + 6, sy + 5]]) {
      if (wMap[br]?.[bc] !== undefined) wMap[br][bc] = 4;
      if (wMap[br]?.[bc + 1] !== undefined) wMap[br][bc + 1] = 4;
      if (wMap[br + 1]?.[bc] !== undefined) wMap[br + 1][bc] = 4;
      if (wMap[br + 1]?.[bc + 1] !== undefined) wMap[br + 1][bc + 1] = 4;
    }
  }

  if (id === 'ultimatoma') {
    // Feria: plaza más abierta, faroles y bancas.
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx; c <= sx + 7; c++)
        if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = (r === sy + 3 || c === sx + 4) ? 1 : 6;
    wMap[sy + 2][sx + 2] = 15;
    wMap[sy + 2][sx + 7] = 15;
    wMap[sy + 3][sx + 4] = 18;
    wMap[sy + 3][sx + 5] = 18;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 4][sx + 4] = 19;
  }

  if (id === 'montaje') {
    // Pueblo final: mirador frío hacia castillo, faroles y bancos.
    for (let c = sx - 1; c <= sx + 9; c++) if (wMap[sy - 1]?.[c] !== undefined) wMap[sy - 1][c] = 26;
    wMap[sy - 2][sx + 4] = 14;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 7] = 15;
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 3][sx + 8] = 19; // estatua/mirador del pueblo final
    wMap[sy + 2][sx + 1] = 20;
    wMap[sy + 2][sx + 9] = 20;
  }

  // Aldea Pitch recibe una primera zona más clara y acogedora para tutorial.
  if (id === 'pitch') {
    // plaza central y caminos limpios hacia Alexandro/Luis/Alessandro
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx - 1; c <= sx + 8; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = 1;

    // jardineras y árboles de borde sin cerrar el paso
    const flowers = [
      [sx - 1, sy], [sx + 3, sy], [sx + 8, sy],
      [sx - 1, sy + 7], [sx + 3, sy + 7], [sx + 8, sy + 7],
      [sx + 3, sy + 2], [sx + 4, sy + 2], [sx + 3, sy + 5], [sx + 4, sy + 5],
    ];
    flowers.forEach(([c, r]) => { if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = 6; });
    const trees = [[sx - 3, sy - 1], [sx + 10, sy - 1], [sx - 3, sy + 8], [sx + 10, sy + 8]];
    trees.forEach(([c, r]) => { if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 3; });

    // sendero extra hasta el cartel de salida norte
    for (let r = sy - 2; r <= sy + 7; r++)
      if (r >= 2 && r < WR - 2) {
        wMap[r][sx + 2] = 1;
        wMap[r][sx + 3] = 1;
      }
    // Plaza central, zona tutorial y elementos únicos visibles.
    wMap[sy + 3][sx + 4] = 22; // pozo de plaza
    wMap[sy + 2][sx + 1] = 21; // cajas
    wMap[sy + 6][sx + 7] = 21;
    wMap[sy + 1][sx + 3] = 23; // muñecos de entrenamiento
    wMap[sy + 1][sx + 5] = 23;
    wMap[sy + 4][sx + 2] = 24; // huellas cerca del jugador
    wMap[sy + 5][sx + 4] = 24;
    wMap[sy + 6][sx + 5] = 24;
    // cerca baja para encuadrar zona de entrenamiento sin encerrar al jugador
    wMap[sy][sx + 2] = 20;
    wMap[sy][sx + 6] = 20;
    wMap[sy + 1][sx + 7] = 20;
    wMap[sy + 2][sx + 7] = 20;
  }

  // Pasada final: ordena la aldea para que la personalidad sea clara sin verse caótica.
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

  // === CRISTALES VÍNCULO (capturables) ===
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

// === COLISIONES ===
function solidW(c, r) {
  if (c < 0 || c >= WC || r < 0 || r >= WR) return true;
  const t = wMap[r][c];
  // Agua, árboles, rocas son sólidos
  // Edificios (4) son sólidos
  // Torre cerrada es sólida
  if (t === 2 || t === 3 || t === 7) return true;
  if (t === 4) return true;
  // Decoración sólida del mundo: puestos, estatuas, cercas, cajas, pozos, muñecos y cámara/set.
  if ([18, 19, 20, 21, 22, 23, 25, 27].includes(t)) return true;
  if (t === 13) return true;
  if (t === 9) return true;
  if (t === 12 && !towerOpen) return true;
  if (routeGateBlocks(c, r)) return true;
  return false;
}

function solidC(c, r, map, cols, rows) {
  if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
  const t = map[r][c];
  // Solo paredes, agua subterránea, lava y puerta bloqueada son sólidos
  // Tiles 27,28,33 NO son sólidos (salidas y cristales)
  // Tile 34 = puerta bloqueada del rey (sólida hasta derrotar a Yam)
  return t === 21 || t === 23 || t === 24 || t === 29 || t === 31 || t === 34;
}

// === GENERACIÓN DE TORRE (mapa especial post-game) ===
let towerMap = [];
const TWC = 30,
  TWR = 25;


export { genWorld, genCave, addOloSecretChamber, genCastle };
