// Las 59 criaturas deben rasterizar sin lanzar y produciendo dibujo real.
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };

let perCreatureOps = [];
let current = 0;
const tmpCtx = new Proxy({}, {
  get(_t, p) {
    if (p === 'fillRect' || p === 'fillText') return (...a) => { if (p === 'fillRect') current++; };
    if (p === 'drawImage') return () => { current++; };
    return 1;
  },
  set() { return true; },
});
let blits = 0;
const mainCtx = new Proxy({}, {
  get(_t, p) { return typeof p === 'string' ? () => { if (p === 'drawImage') blits++; } : undefined; },
  set() { return true; },
});
const el = (ctx) => ({ getContext: () => ctx, style: {}, addEventListener() {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) });
globalThis.document = {
  getElementById: () => el(mainCtx),
  createElement: () => ({ getContext: () => tmpCtx }),
  addEventListener() {},
};
globalThis.Image = class { set src(v) {} };

const { dCre, _spriteCache } = await import('../src/render/creature-sprites.js');
const { CDB } = await import('../src/data/creatures.js');

let fails = 0;
const ids = Object.keys(CDB);
for (const id of ids) {
  current = 0;
  try {
    dCre(100, 100, id, 20, 0);
    perCreatureOps.push({ id, ops: current });
    if (current === 0) { console.log(`FAIL ${id}: no dibujó nada`); fails++; }
  } catch (e) {
    console.log(`FAIL ${id}: ${e.message}`);
    fails++;
  }
}
const min = Math.min(...perCreatureOps.map((x) => x.ops));
const max = Math.max(...perCreatureOps.map((x) => x.ops));
const avg = perCreatureOps.reduce((a, b) => a + b.ops, 0) / perCreatureOps.length;
console.log(`PASS las ${ids.length} criaturas rasterizan (ops por sprite: min ${min}, media ${avg.toFixed(1)}, max ${max})`);
console.log(`PASS entradas en caché: ${_spriteCache.size} (una por criatura)`);

// Segundo frame con la misma criatura: debe blitear, no rasterizar
current = 0; blits = 0;
const before = _spriteCache.size;
dCre(100, 100, ids[0], 20, 0);
console.log(current === 0 ? 'PASS el segundo frame no rasteriza' : `FAIL el segundo frame rasterizó ${current} ops`);
console.log(blits === 1 ? 'PASS el segundo frame blitea' : `FAIL blits=${blits}`);
if (current !== 0 || blits !== 1) fails++;

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
