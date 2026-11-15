// Bosque guiado: los árboles acompañan al camino en vez de estar tirados
// al azar. El jugador ve hacia dónde ir, pero puede salirse de la ruta
// (hay claros y senderos laterales que terminan en nada).
//
// Principios:
//   1. Nunca tapar el camino (tile 1) ni estructuras (pueblos, casas, cuevas).
//   2. Ninguna línea recta larga de árboles: se leen como paredes.
//   3. Sendero central transitable de 2-3 tiles, con curva suave.
//   4. A los costados, árboles con huecos: dan marco sin encerrar.
//   5. Claros cada tanto, para explorar y perderse un poco.
//
// Todo es determinista (hash por coordenada, sin Math.random) así el mapa es
// el mismo en cada partida y se puede testear.

import { WC, WR, wMap } from '../core/world-constants.js';

// Tiles que el bosque puede usar como "piso" libre.
const PISO_LIBRE = new Set([0, 3, 5, 6]);
// Tiles que NUNCA se tocan.
const INTOCABLES = new Set([1, 2, 4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33]);

/** Hash determinista → [0,1). Mismo (c,r) → mismo valor siempre. */
function h2(c, r) {
  let h = (c * 374761393 + r * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function dentro(c, r) {
  return c >= 2 && c < WC - 2 && r >= 2 && r < WR - 2;
}

function libre(c, r) {
  return dentro(c, r) && PISO_LIBRE.has(wMap[r][c]);
}

function poner(c, r, tile) {
  if (!dentro(c, r)) return;
  if (INTOCABLES.has(wMap[r][c])) return;
  wMap[r][c] = tile;
}

/**
 * Recorre una ruta en vertical (de y0 a y1) y devuelve el centro de cada fila.
 * El centro ondula (seno) más un jitter del hash: curva suave, nunca recta.
 */
function centrosOndulados(y0, y1, x0, x1, amplitud = 4, semillaCol = 0) {
  const desde = Math.min(y0, y1);
  const hasta = Math.max(y0, y1);
  const n = Math.max(1, hasta - desde);
  const centros = [];
  for (let r = desde; r <= hasta; r++) {
    const t = (r - desde) / n;
    // dos frecuencias: una lenta que da la curva, una rápida que la hace viva
    // La onda se atenúa en los extremos (ventana seno) para que la ruta
    // arranque y termine exactamente en la boca del pueblo. Sin esto quedan
    // dos caminos paralelos: el recto del pueblo y el ondulado nuevo.
    const ventana = Math.sin(t * Math.PI);
    const onda = (Math.sin(t * Math.PI * 1.6 + semillaCol) * amplitud
      + Math.sin(t * Math.PI * 4.3 + semillaCol * 2) * (amplitud * 0.35)) * ventana;
    const jitter = (h2(semillaCol + 7, r) - 0.5) * 2 * ventana;
    let c = Math.round(x0 + (x1 - x0) * t + onda + jitter);
    centros.push(Math.max(3, Math.min(WC - 4, c)));
  }
  return { centros, desde, hasta };
}

/**
 * Traza un camino semi-guiado de un pueblo al siguiente.
 * - Piso de tierra (tile 1) de 2-3 de ancho, con curva.
 * - A los costados: árboles con huecos (no pared).
 * - Cada ~14 filas deja un claro y un sendero lateral corto (exploración).
 */
function trazarRutaGuiada(y0, y1, x0, x1, opts = {}) {
  const amplitud = opts.amplitud ?? 4;
  const ancho = opts.ancho ?? 3;
  const densidadArbol = opts.densidad ?? 0.55;
  const semilla = opts.semilla ?? 1;
  const { centros, desde, hasta } = centrosOndulados(y0, y1, x0, x1, amplitud, semilla);

  centros.forEach((centro, i) => {
    const r = desde + i;
    // 0. limpiar el camino recto anterior de esta fila, salvo en los extremos
    //    (donde tiene que seguir conectando con la plaza del pueblo).
    const t = i / Math.max(1, centros.length - 1);
    if (t > 0.06 && t < 0.94) {
      for (let c = 55; c <= 65; c++) {
        if (wMap[r][c] === 1 && Math.abs(c - centro) > ancho) {
          wMap[r][c] = h2(c, r) < 0.3 ? 5 : 0;
        }
      }
    }
    // 1. camino
    for (let d = 0; d < ancho; d++) poner(centro + d - 1, r, 1);

    // 2. árboles a los costados, con huecos
    for (const lado of [-1, 1]) {
      for (let k = 2; k <= 6; k++) {
        const c = centro + lado * k;
        if (!dentro(c, r)) continue;
        if (wMap[r][c] === 1) continue;           // jamás sobre el camino
        // cuánto se cierra el bosque según la distancia al camino
        const cerca = 1 - (k - 2) / 5;
        const p = densidadArbol * (0.45 + cerca * 0.75);
        if (h2(c * 3 + semilla, r * 5) < p) poner(c, r, 3);
        else if (h2(c * 7 + semilla, r * 11) < 0.35) poner(c, r, 5); // hierba alta
      }
    }
  });

  // 3. claros y senderos laterales: la opción de perderse
  for (let r = desde + 8; r <= hasta - 8; r += 14) {
    const i = r - desde;
    const centro = centros[Math.min(i, centros.length - 1)];
    // claro a un lado
    const lado = h2(semilla, r) < 0.5 ? -1 : 1;
    const cx = centro + lado * 9;
    despejar(cx, r, 3);
    // sendero corto que sale del camino y muere en el claro
    for (let k = 2; k <= 9; k++) poner(centro + lado * k, r, 1);
    // al final del sendero, un árbol suelto: premio visual, no bloquea
    if (h2(cx, r + 1) < 0.5) poner(cx + lado, r, 6);
  }
}

/** Despeja un círculo de árboles/hierba. */
function despejar(cx, cy, rad) {
  for (let r = cy - rad; r <= cy + rad; r++) {
    for (let c = cx - rad; c <= cx + rad; c++) {
      if (!dentro(c, r)) continue;
      const dx = c - cx, dy = r - cy;
      if (dx * dx + dy * dy > rad * rad) continue;
      const t = wMap[r][c];
      if (t === 3 || t === 5) wMap[r][c] = h2(c, r) < 0.22 ? 6 : 0;
    }
  }
}

/**
 * Rompe las "paredes" de árboles: donde haya una línea recta de 12 o más
 * árboles seguidos, abre huecos irregulares. Una pared recta se lee como
 * error de generación; un borde con huecos se lee como bosque.
 */
function romperParedes(minLargo = 12, tasaHueco = 0.45) {
  // horizontales
  for (let r = 2; r < WR - 2; r++) {
    let inicio = -1;
    for (let c = 2; c <= WC - 2; c++) {
      const esArbol = c < WC - 2 && wMap[r][c] === 3;
      if (esArbol && inicio === -1) inicio = c;
      if (!esArbol && inicio !== -1) {
        const largo = c - inicio;
        if (largo >= minLargo) abrirHuecos(inicio, c - 1, (cc) => wMap[r][cc], (cc, v) => { wMap[r][cc] = v; }, tasaHueco);
        inicio = -1;
      }
    }
  }
  // verticales
  for (let c = 2; c < WC - 2; c++) {
    let inicio = -1;
    for (let r = 2; r <= WR - 2; r++) {
      const esArbol = r < WR - 2 && wMap[r][c] === 3;
      if (esArbol && inicio === -1) inicio = r;
      if (!esArbol && inicio !== -1) {
        const largo = r - inicio;
        if (largo >= minLargo) {
          for (let i = inicio; i <= r - 1; i++) {
            if (h2(c * 13 + 1, i * 17) < tasaHueco) wMap[i][c] = h2(i, c) < 0.4 ? 5 : 0;
          }
        }
        inicio = -1;
      }
    }
  }
}

function abrirHuecos(desde, hasta, _get, set, tasa) {
  for (let i = desde; i <= hasta; i++) {
    if (h2(i * 29 + 3, desde * 7) < tasa) set(i, h2(i, desde) < 0.4 ? 5 : 0);
  }
}

/**
 * Aplica todo el tratamiento de bosque al mundo expandido.
 * Se llama al final de genExpandedTerrainC15a2b, cuando pueblos y rutas
 * ya están construidos.
 */
function embellecerBosque() {
  // Rutas guiadas entre los centros de cada tramo. Los pueblos están todos
  // sobre el Camino Real (col 60), así que las rutas ondulan alrededor de él.
  // (y0, y1, x0, x1) con y0 > y1: se recorre de sur a norte.
  trazarRutaGuiada(262, 232, 60, 62, { amplitud: 3.5, semilla: 11 }); // Ruta 1
  trazarRutaGuiada(198, 186, 60, 58, { amplitud: 2.2, semilla: 23 }); // Ruta 2
  trazarRutaGuiada(127, 117, 60, 62, { amplitud: 2.0, semilla: 37 }); // Ruta 3
  trazarRutaGuiada(63, 47, 59, 60, { amplitud: 3.0, semilla: 41 });   // Ruta 4

  // Bosques de los costados del Camino Real: acompañan, no encierran.
  for (let r = 20; r < 275; r++) {
    for (const lado of [-1, 1]) {
      for (let k = 4; k <= 26; k++) {
        const c = 60 + lado * k;
        if (!libre(c, r)) continue;
        const cerca = 1 - (k - 4) / 22;
        const p = 0.16 + cerca * 0.24;
        if (h2(c * 11 + 5, r * 3) < p) wMap[r][c] = 3;
        else if (h2(c * 5 + 9, r * 13) < 0.12) wMap[r][c] = 5;
      }
    }
  }

  romperParedes(12, 0.5);

  // Cerrar huecos de 1 tile dentro del camino: un pixel de pasto en medio de
  // la tierra se ve como un error. Si hay camino a ambos lados, es camino.
  cerrarHuecosDeCamino();

  // Un tile de camino apretado entre dos árboles parece un error de pintura.
  // Se abre el árbol de un lado para que el paso se lea como paso.
  liberarCaminoApretado();
}

/** Abre un árbol de un lado cuando el camino queda estrangulado. */
function liberarCaminoApretado() {
  for (let r = 3; r < WR - 3; r++) {
    for (let c = 3; c < WC - 3; c++) {
      if (wMap[r][c] !== 1) continue;
      const izq = wMap[r][c - 1] === 3, der = wMap[r][c + 1] === 3;
      if (izq && der) {
        // abrir el de la izquierda (deja el camino respirando a la derecha)
        wMap[r][c - 1] = h2(c, r) < 0.4 ? 5 : 0;
      }
      const arr = wMap[r - 1][c] === 3, aba = wMap[r + 1][c] === 3;
      if (arr && aba) wMap[r - 1][c] = h2(c, r + 3) < 0.4 ? 5 : 0;
    }
  }
}

/**
 * Rellena los huecos de un solo tile entre dos tramos de camino.
 * Se hace dos pasadas (horizontal y vertical) porque la curva escalonada
 * deja dientes de sierra al cambiar de columna.
 */
function cerrarHuecosDeCamino() {
  for (let pasada = 0; pasada < 2; pasada++) {
    for (let r = 3; r < WR - 3; r++) {
      for (let c = 3; c < WC - 3; c++) {
        if (wMap[r][c] === 1) continue;
        if (!PISO_LIBRE.has(wMap[r][c])) continue;
        const horiz = wMap[r][c - 1] === 1 && wMap[r][c + 1] === 1;
        const vert = wMap[r - 1][c] === 1 && wMap[r + 1][c] === 1;
        if (horiz || vert) wMap[r][c] = 1;
      }
    }
  }
}

export { embellecerBosque, trazarRutaGuiada, romperParedes, despejar, h2 };
