// Arranca dist-app/index.html como lo haría un navegador con doble clic.
//
// Lo que este test tiene que atrapar (bug real, 2026-11):
//   Un <script> clásico NO es diferido: se ejecuta apenas el navegador lo lee.
//   Si quedó en el <head>, el <canvas id="c"> todavía no existe y el juego
//   muere con "Cannot read properties of null (reading 'getContext')" dejando
//   un recuadro negro para siempre. El test anterior no lo detectaba porque
//   entregaba un canvas siempre disponible y solo miraba que rAF se llamara.
//
// Ahora se simula el parseo progresivo: getElementById('c') devuelve null
// mientras el "cursor" del navegador no haya pasado por el <canvas>.
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const here = dirname(fileURLToPath(import.meta.url));
const FILE = join(here, '..', 'dist-app', 'index.html');
if (!existsSync(FILE)) {
  console.log('SKIP no existe dist-app/index.html (corré npm run build:app)');
  process.exit(0);
}

const html = readFileSync(FILE, 'utf8');
let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

// ---------------------------------------------------------------- orden DOM
const posCanvas = html.indexOf('<canvas');
// el script del juego está marcado con data-juego; el overlay va aparte
const posScript = html.indexOf('<script data-juego');
ok(posCanvas !== -1, 'el HTML tiene un <canvas>');
ok(
  posCanvas !== -1 && posScript !== -1 && posCanvas < posScript,
  'el <canvas> aparece antes del <script> (un script clásico no es diferido)'
);

// ------------------------------------------------------- ejecutar el bundle
const match = html.match(/<script data-juego>([\s\S]*?)<\/script>/);
if (!match) {
  console.log('FAIL no se encontró el <script> inline');
  process.exit(1);
}
const code = match[1];
// ¿el canvas ya existe en el momento en que corre el script?
const canvasYaExiste = posCanvas < posScript;

const drawOps = [];
const errors = [];
const ctx2d = new Proxy({}, {
  get(_t, p) {
    if (p === 'measureText') return () => ({ width: 10 });
    if (p === 'createLinearGradient' || p === 'createRadialGradient')
      return () => ({ addColorStop: () => {} });
    if (p === 'canvas') return { width: 640, height: 480 };
    if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(640 * 480 * 4) });
    if (typeof p === 'string') return (...a) => { drawOps.push(p); };
    return undefined;
  },
  set() { return true; },
});
const canvasEl = {
  width: 640, height: 480, style: {},
  getContext: () => ctx2d,
  addEventListener: () => {},
  getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }),
};

const queue = [];
const sandbox = {
  console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(' ')) },
  document: {
    // clave del test: null si el canvas todavía no fue parseado
    getElementById: (id) => (id === 'c' && !canvasYaExiste ? null : canvasEl),
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }),
    createElementNS: () => ({ style: {} }),
    addEventListener: () => {},
    querySelectorAll: () => [],
    fonts: { load: () => Promise.resolve() },
  },
  navigator: { clipboard: { writeText: async () => {} } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 },
  location: { search: '', href: 'file:///index.html', protocol: 'file:' },
  performance: { now: () => 0 },
  requestAnimationFrame: (cb) => { queue.push(cb); return queue.length; },
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  innerWidth: 1280, innerHeight: 800,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  // las imágenes no cargan desde file:// si el sprite no está embebido:
  // el juego tiene que seguir andando igual (dibuja las criaturas por código)
  Image: class { set src(_v) { setTimeout(() => this.onerror && this.onerror(), 0); } },
  AudioContext: class { constructor() { throw new Error('sin audio en test'); } },
  Math, Date, JSON, Object, Array, String, Number, Boolean, Error, Proxy, Map, Set, Promise,
  Uint8Array, Uint8ClampedArray, TextEncoder, TextDecoder,
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

try {
  vm.runInContext(code, vm.createContext(sandbox), { filename: 'bundle.js' });
} catch (e) {
  console.log('FAIL el bundle lanzó al ejecutarse: ' + e.message);
  console.log('     (esto es lo que ve el usuario como "recuadro negro")');
  process.exit(1);
}
ok(errors.length === 0, errors.length === 0
  ? 'sin errores de consola al arrancar'
  : 'errores al arrancar: ' + errors[0].slice(0, 160));
ok(queue.length >= 1, 'el bucle de juego se registró (requestAnimationFrame)');

// --------------------------------------------------- ¿dibuja de verdad?
let t = 0;
let frameErr = null;
for (let i = 0; i < 5; i++) {
  const cbs = queue.splice(0, queue.length);
  if (!cbs.length) break;
  for (const cb of cbs) {
    t += 16.7;
    try { cb(t); } catch (e) { frameErr = frameErr || e; }
  }
}
ok(!frameErr, frameErr ? 'excepción dentro de un frame: ' + frameErr.message : 'ningún frame lanzó excepción');
ok(drawOps.length > 50, `dibuja de verdad (${drawOps.length} operaciones de canvas en 5 frames)`);
ok(drawOps.includes('fillRect') || drawOps.includes('drawImage'),
  'usa fillRect/drawImage (algo se pinta en pantalla)');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
