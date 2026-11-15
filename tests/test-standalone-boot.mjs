// Ejecuta el bundle standalone con un DOM de mentira para comprobar que
// arranca sin lanzar (equivale a abrirlo con doble clic).
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
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const errors = [];
const ctx2d = new Proxy({}, {
  get(_t, p) {
    if (p === 'measureText') return () => ({ width: 10 });
    if (p === 'createLinearGradient') return () => ({ addColorStop: () => {} });
    if (p === 'canvas') return { width: 640, height: 480 };
    return typeof p === 'string' ? () => {} : undefined;
  },
  set() { return true; },
});
const canvasEl = {
  width: 640, height: 480, style: {},
  getContext: () => ctx2d,
  addEventListener: () => {},
  getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }),
};
let rafCalls = 0;
const sandbox = {
  console: { log() {}, error(...a) { errors.push(a.join(' ')); }, warn() {} },
  document: {
    getElementById: () => canvasEl,
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }),
    addEventListener: () => {},
    querySelectorAll: () => [],
    createElementNS: () => ({ style: {} }),
  },
  window: null,
  navigator: { clipboard: { writeText: async () => {} } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 },
  location: { search: '', href: 'file:///index.html', protocol: 'file:' },
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => { rafCalls++; return rafCalls; },
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  innerWidth: 1280, innerHeight: 800,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  Image: class { set src(v) {} },
  AudioContext: class { constructor() { throw new Error('sin audio en test'); } },
  Math, Date, JSON, Object, Array, String, Number, Boolean, Error, Proxy, Map, Set, Promise,
  Uint8Array, TextEncoder, TextDecoder, atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

const context = vm.createContext(sandbox);
try {
  vm.runInContext(code, context, { filename: 'bundle.js' });
} catch (e) {
  console.log('FAIL el bundle lanzó al ejecutarse: ' + e.message);
  process.exit(1);
}

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };
ok(errors.length === 0, errors.length === 0 ? 'sin errores de consola al arrancar' : 'errores: ' + errors[0].slice(0, 200));
ok(rafCalls >= 1, `el bucle de juego arrancó (requestAnimationFrame llamado ${rafCalls} veces)`);

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
