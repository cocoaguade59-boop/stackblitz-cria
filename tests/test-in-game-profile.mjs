// Prueba de "esto se ve en la pantalla", no sólo que el código compile.
//
// Ejecuta el bundle real de dist-app/index.html en un contexto simulado, con
// un guardado ya existente en localStorage, y comprueba que la pantalla de
// título pinta el perfil del punto 15 ("Guardado 1 · … · 2h 14m · …").
//
// Si este test pasa, el texto está literalmente en el canvas que ve el
// usuario al abrir el juego en Windows.
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
const ok = (c, l) => {
  console.log((c ? 'PASS ' : 'FAIL ') + l);
  if (!c) fails++;
};

const code = html.match(/<script data-juego>([\s\S]*?)<\/script>/)[1];

// Guardado simulado: cantera (fila 145), 2h 14m jugadas, 3 insignias, Lv.18.
const SAVE = {
  plx: 60,
  ply: 145,
  curMap: 'world',
  playMs: 134 * 60 * 1000,
  diplomas: { tamara: true, luchito: true, andrea: true, dan: false },
  party: [{ id: 'flameye', lv: 18, nm: 'Flameye', hp: 40, mHp: 40, mv: [] }],
  gold: 500,
};
const store = { criaturasDelReino_v2: JSON.stringify(SAVE) };

const texts = [];
const ctx2d = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient')
        return () => ({ addColorStop: () => {} });
      if (p === 'canvas') return { width: 640, height: 480 };
      if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(640 * 480 * 4) });
      if (p === 'fillText') return (t) => texts.push(String(t));
      if (typeof p === 'string') return () => {};
      return undefined;
    },
    set() {
      return true;
    },
  }
);
const canvasEl = {
  width: 640,
  height: 480,
  style: {},
  getContext: () => ctx2d,
  addEventListener: () => {},
  getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }),
};

const queue = [];
const errors = [];
const sandbox = {
  console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(' ')) },
  document: {
    getElementById: (id) => (id === 'c' ? canvasEl : null),
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }),
    createElementNS: () => ({ style: {} }),
    addEventListener: () => {},
    querySelectorAll: () => [],
    fonts: { load: () => Promise.resolve() },
  },
  navigator: { clipboard: { writeText: async () => {} } },
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  },
  location: { search: '', href: 'file:///index.html', protocol: 'file:' },
  performance: { now: () => 0 },
  requestAnimationFrame: (cb) => {
    queue.push(cb);
    return queue.length;
  },
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  Image: class {
    set src(_v) {
      setTimeout(() => this.onerror && this.onerror(), 0);
    }
  },
  AudioContext: class {
    constructor() {
      throw new Error('sin audio en test');
    }
  },
  Math,
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Error,
  Proxy,
  Map,
  Set,
  Promise,
  Uint8Array,
  Uint8ClampedArray,
  TextEncoder,
  TextDecoder,
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
  process.exit(1);
}
ok(errors.length === 0, errors.length === 0 ? 'arranca sin errores de consola' : 'errores: ' + errors[0].slice(0, 160));

// Correr frames hasta que la pantalla de título termine su animación de
// entrada (>220 frames) sin que explote nada.
let t = 0;
let frameErr = null;
for (let i = 0; i < 260; i++) {
  const cbs = queue.splice(0, queue.length);
  if (!cbs.length) break;
  for (const cb of cbs) {
    t += 16.7;
    try {
      cb(t);
    } catch (e) {
      frameErr = frameErr || e;
    }
  }
}
ok(!frameErr, frameErr ? 'excepción en un frame: ' + frameErr.message : '260 frames sin excepciones');

const todas = texts.join(' | ');
ok(todas.length > 0, `el título dibujó texto (${texts.length} llamadas a fillText)`);

// ---- Punto 15: el perfil del guardado ----
const perfil = texts.find((s) => s.startsWith('Guardado 1'));
ok(!!perfil, `la pantalla de título muestra el perfil ("${perfil || 'NO ENCONTRADO'}")`);
ok(!!perfil && perfil.includes('2h 14m'), 'el perfil incluye el tiempo jugado (2h 14m)');
ok(!!perfil && perfil.includes('3 insignias'), 'el perfil cuenta las 3 insignias del save');
ok(!!perfil && /Rodaje/.test(perfil), 'el perfil dice el pueblo donde estás (Rodaje)');
ok(!!perfil && perfil.includes('Lv.18'), 'el perfil muestra el nivel del equipo');
ok(!perfil || perfil.length <= 60, `la línea entra en pantalla (${perfil ? perfil.length : 0} caracteres)`);

ok(texts.some((s) => /Continuar partida/.test(s)), 'sigue existiendo la opción Continuar');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
