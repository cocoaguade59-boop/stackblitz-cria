#!/usr/bin/env node
// Imprime el mundo en ASCII para inspeccionar la distribución de árboles.
// Uso: node tools/ver-mapa.mjs [x1 y1 x2 y2]
// world-constants.js usa window como singleton: hay que crearlo antes.
globalThis.window = globalThis;
const { WC, WR, wMap } = await import('../src/core/world-constants.js');
const { genWorld } = await import('../src/world/map-generator.js');

genWorld();

const CH = { 0: '.', 1: '=', 2: '~', 3: 'T', 4: '#', 5: ',', 6: '*', 7: 'o', 9: 'H', 10: 'P', 13: 'C', 15: 'i', 19: 'S', 20: 'L', 26: ':', 28: 'p' };

const [x1, y1, x2, y2] = process.argv.length > 5
  ? process.argv.slice(2, 6).map(Number)
  : [2, 2, WC - 3, WR - 3];

for (let r = y1; r <= y2; r++) {
  let line = '';
  for (let c = x1; c <= x2; c++) line += CH[wMap[r][c]] ?? '?';
  console.log(String(r).padStart(3) + ' ' + line);
}
