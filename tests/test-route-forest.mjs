// El bosque tiene que GUIAR, no encerrar.
//
// Antes: los árboles se sorteaban con Math.random sobre una caja rectangular,
// así que aparecían paredes rectas de árboles cruzando el mapa y el camino se
// perdía entre ellos. Ahora se generan en función del camino.
//
// Este test mira el mapa ya generado y exige:
//   1. Se puede caminar de punta a punta (Pitch → Montaje → Castillo).
//   2. El camino no se tapa con árboles.
//   3. No hay paredes rectas largas de árboles.
//   4. El camino curva (no es una línea recta de 200 filas).
//   5. Se puede salir del camino y volver (la opción de explorar).
import vm from 'vm';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

globalThis.window = globalThis;
const { WC, WR, wMap } = await import('../src/core/world-constants.js');
const { genWorld } = await import('../src/world/map-generator.js');

// el mapa tiene que ser determinista: mismo resultado en dos generaciones
genWorld();
const firma1 = wMap.map((fila) => fila.join(',')).join('|').length;
const copia = wMap.map((f) => f.slice());
genWorld();
let iguales = true;
for (let r = 0; r < WR && iguales; r++)
  for (let c = 0; c < WC; c++) if (wMap[r][c] !== copia[r][c]) { iguales = false; break; }
ok(iguales, 'el mapa sale igual en cada partida (generación determinista)');

const SOLIDOS = new Set([2, 3, 7, 4, 32, 33, 10, 18, 19, 20, 21, 22, 23, 25, 27, 30, 31, 13, 9]);

// ------------------------------------------------------------------ 1. conectividad
function alcanzables(c0, r0) {
  const visto = new Set();
  const cola = [[c0, r0]];
  visto.add(c0 + ',' + r0);
  while (cola.length) {
    const [c, r] = cola.pop();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 2 || nc >= WC - 2 || nr < 2 || nr >= WR - 2) continue;
      const k = nc + ',' + nr;
      if (visto.has(k) || SOLIDOS.has(wMap[nr][nc])) continue;
      visto.add(k); cola.push([nc, nr]);
    }
  }
  return visto;
}

// arranca en la plaza de Pitch (pueblo inicial)
const alcanzado = alcanzables(59, 288);
ok(alcanzado.has('59,215') || alcanzado.has('60,215'), 'se llega caminando a Storyboard (r215)');
ok(alcanzado.has('59,145') || alcanzado.has('60,145'), 'se llega caminando a Rodaje (r145)');
ok(alcanzado.has('59,85') || alcanzado.has('60,85'), 'se llega caminando a Última Toma (r85)');
ok(alcanzado.has('59,28') || alcanzado.has('60,28') || alcanzado.has('58,28'),
  'se llega caminando a Montaje (r28)');
ok(alcanzado.has('59,12') || alcanzado.has('60,12') || alcanzado.has('58,10'),
  'se llega caminando al Castillo (r10)');

// ------------------------------------------------------------------ 2. camino sin tapar
let caminoTapia = 0;
for (let r = 2; r < WR - 2; r++)
  for (let c = 2; c < WC - 2; c++)
    if (wMap[r][c] === 1 && wMap[r][c + 1] === 3 && wMap[r][c - 1] === 3) caminoTapia++;
ok(caminoTapia === 0, `ningún tile de camino está ahogado entre árboles (${caminoTapia})`);

// ------------------------------------------------------------------ 3. paredes
let paredes = 0;
for (let r = 2; r < WR - 2; r++) {
  let run = 0;
  for (let c = 2; c <= WC - 2; c++) {
    if (wMap[r][c] === 3) run++;
    else { if (run >= 12) paredes++; run = 0; }
  }
}
for (let c = 2; c < WC - 2; c++) {
  let run = 0;
  for (let r = 2; r <= WR - 2; r++) {
    if (wMap[r][c] === 3) run++;
    else { if (run >= 14) paredes++; run = 0; }
  }
}
ok(paredes === 0, `no hay paredes rectas de árboles (12+ seguidas): ${paredes}`);

// ------------------------------------------------------------------ 4. el camino curva
function centoDeFila(r) {
  const cols = [];
  for (let c = 2; c < WC - 2; c++) if (wMap[r][c] === 1) cols.push(c);
  if (!cols.length) return null;
  // el tramo más cercano a la columna 60
  let mejor = null, mejorD = 999;
  let ini = 0;
  for (let i = 0; i <= cols.length; i++) {
    if (i === cols.length || cols[i] !== cols[i - 1] + 1) {
      const tramo = cols.slice(ini, i);
      const centro = tramo.reduce((a, b) => a + b, 0) / tramo.length;
      const d = Math.abs(centro - 60);
      if (d < mejorD && tramo.length >= 2) { mejorD = d; mejor = centro; }
      ini = i;
    }
  }
  return mejor;
}
const centros = [];
for (let r = 55; r <= 255; r += 10) {
  const c = centoDeFila(r);
  if (c !== null) centros.push(c);
}
const variacion = Math.max(...centros) - Math.min(...centros);
ok(variacion >= 3, `el camino ondula en vez de ser una línea recta (varía ${variacion.toFixed(1)} tiles)`);

// ------------------------------------------------------------------ 5. explorar
// tiene que haber zonas caminables lejos del camino principal
let lejos = 0;
for (const k of alcanzado) {
  const [c, r] = k.split(',').map(Number);
  if (Math.abs(c - 60) > 14) lejos++;
}
ok(lejos > 2000, `se puede salir del camino y explorar a los costados (${lejos} tiles fuera de la ruta)`);

// ------------------------------------------------------------------ 6. no romper el pueblo
ok(wMap[288][59] !== 3 && wMap[288][59] !== 2, 'la plaza de Pitch sigue libre de árboles');
ok(wMap[215][59] !== 3, 'la plaza de Storyboard sigue libre de árboles');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
