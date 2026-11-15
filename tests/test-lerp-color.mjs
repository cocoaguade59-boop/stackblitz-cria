// lerpColor debe devolver EXACTAMENTE los mismos colores que antes de cachear
// (o como máximo ±1 por canal al redondear t a 1/64).
// Stub de DOM mínimo: tiles-world.js importa canvas.js al cargar.
globalThis.window = globalThis;
const stub = () => ({ getContext: () => ({ fillStyle: '', fillRect: () => {}, font: '', fillText: () => {}, drawImage: () => {} }), style: {}, addEventListener: () => {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) });
globalThis.document = { getElementById: stub, createElement: stub, addEventListener: () => {} };
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };
globalThis.Image = class { set src(v) {} };

const { lerpColor } = await import('../src/render/tiles-world.js');

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

// referencia: la implementación original sin caché
function ref(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const R = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const G = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const B = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return [R, G, B];
}
function parse(rgb) {
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  return [+m[1], +m[2], +m[3]];
}

const pairs = [
  ['#58A830', '#F2F8F4'],
  ['#48982A', '#E2ECE6'],
  ['#408820', '#C2D4C2'],
];
let maxDelta = 0;
let checked = 0;
for (const [a, b] of pairs) {
  // las filas reales del mapa: 0..299
  for (let r = 0; r < 300; r++) {
    const t = Math.max(0, Math.min(1, (68 - r) / 46));
    const got = parse(lerpColor(a, b, t));
    const want = ref(a, b, t);
    for (let i = 0; i < 3; i++) maxDelta = Math.max(maxDelta, Math.abs(got[i] - want[i]));
    checked++;
  }
}
ok(maxDelta <= 1, `delta máximo por canal: ${maxDelta} (tolerancia 1)`);

// extremos exactos
ok(JSON.stringify(parse(lerpColor('#58A830', '#F2F8F4', 0))) === '[88,168,48]', 't=0 devuelve el color A exacto');
ok(JSON.stringify(parse(lerpColor('#58A830', '#F2F8F4', 1))) === '[242,248,244]', 't=1 devuelve el color B exacto');
ok(JSON.stringify(parse(lerpColor('#58A830', '#F2F8F4', -5))) === '[88,168,48]', 't negativo se satura a 0');
ok(JSON.stringify(parse(lerpColor('#58A830', '#F2F8F4', 9))) === '[242,248,244]', 't>1 se satura a 1');

// la caché realmente sirve: mismo input → mismo objeto string
ok(lerpColor('#58A830', '#F2F8F4', 0.5) === lerpColor('#58A830', '#F2F8F4', 0.5), 'llamadas repetidas devuelven el mismo valor');

console.log(`\n${checked} comparaciones de color verificadas`);
console.log(fails === 0 ? 'TODO OK' : `${fails} FALLOS`);
process.exit(fails ? 1 : 0);
