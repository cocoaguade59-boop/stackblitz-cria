globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };
let created = 0, fillRects = 0, drawImages = 0;
function makeCtx(label) {
  return new Proxy({}, {
    get(t, prop) {
      if (prop === 'fillRect') return () => { fillRects++; };
      if (prop === 'fillText') return () => {};
      if (prop === 'drawImage') return () => { drawImages++; };
      return typeof prop === 'string' ? '' : undefined;
    },
    set() { return true; },
  });
}
const mainCtx = makeCtx('main');
const canvasStub = () => ({ getContext: () => makeCtx('offscreen'), style: {}, addEventListener: () => {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) });
globalThis.document = {
  getElementById: () => ({ getContext: () => mainCtx, style: {}, addEventListener: () => {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) }),
  createElement: () => { created++; return canvasStub(); },
  addEventListener: () => {},
};
globalThis.Image = class { set src(v) {} };
const { dCre, _spriteCache } = await import('../src/render/creature-sprites.js');

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

// 1) dibujar el mismo sprite 60 veces (un segundo a 60fps)
fillRects = 0; created = 0; drawImages = 0;
for (let f = 0; f < 60; f++) dCre(100, 100, 'flameye', 10, f);
const sinCache = fillRects;
// El bob vertical sin(f*0.15)*2 redondeado sólo toma 5 valores distintos
// (-2..2), así que 60 frames requieren como mucho 5 rasterizaciones.
ok(created <= 5, `60 frames → ${created} rasterizaciones (antes: 60)`);
ok(created >= 1, 'al menos rasterizó una vez');
ok(drawImages === 60, `60 blits de drawImage (${drawImages})`);
ok(sinCache < 3000, `fillRect total acotado: ${sinCache} (antes serían ~${sinCache - 200 >= 0 ? sinCache : 'miles'})`);

// 2) nivel distinto → nuevo tamaño → nueva entrada
created = 0;
dCre(100, 100, 'flameye', 5, 0);
ok(created <= 5, `reusa con el mismo tamaño (creados: ${created})`);
created = 0;
dCre(100, 100, 'gorilan', 10, 0);
ok(created === 1, 'otra criatura → rasteriza aparte');

// 3) la caché no crece sin límite
ok(_spriteCache.size < 100, `entradas en caché tras pocas llamadas: ${_spriteCache.size}`);

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
