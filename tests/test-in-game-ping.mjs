// Punto 11 dentro del juego real: al caminar junto a un pin o un NPC nuevo
// tiene que aparecer el aviso en pantalla y sonar la campanita.
//
// Se carga el bundle de dist-app, se coloca al jugador junto a un pin del mapa
// real y se lo hace caminar. Después se comprueba que el aviso se dibujó
// (texto en el canvas) y que no se repite al volver a pasar por el mismo sitio.
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

const SAVE = {
  plx: 60,
  ply: 285,
  curMap: 'world',
  playMs: 60_000,
  diplomas: {},
  party: [{ id: 'flameye', lv: 10, nm: 'Flameye', hp: 40, mHp: 40 }],
  gold: 100,
};
const store = { criaturasDelReino_v2: JSON.stringify(SAVE) };

const texts = [];
const sounds = [];
let _fill = '#000';
const ctx2d = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === 'fillStyle') return _fill;
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient')
        return () => ({ addColorStop: () => {} });
      if (p === 'canvas') return { width: 640, height: 480 };
      if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(640 * 480 * 4) });
      if (p === 'fillText')
        return (t) => {
          texts.push(String(t));
        };
      if (typeof p === 'string') return () => {};
      return undefined;
    },
    set(_t, p, v) {
      if (p === 'fillStyle') _fill = v;
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

// Audio falso: registra las frecuencias para detectar la campanita (784 y 1047 Hz).
const queue = [];
const errors = [];
const listeners = {};
const sandbox = {
  console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(' ')) },
  document: {
    getElementById: (id) => (id === 'c' ? canvasEl : null),
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }),
    createElementNS: () => ({ style: {} }),
    addEventListener: (ev, fn) => {
      (listeners[ev] = listeners[ev] || []).push(fn);
    },
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
  // setTimeout se ejecuta en el acto: la campanita son dos notas encadenadas.
  setTimeout: (fn) => {
    try {
      fn();
    } catch (e) {}
    return 0;
  },
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: (ev, fn) => {
    (listeners[ev] = listeners[ev] || []).push(fn);
  },
  matchMedia: () => ({ matches: false }),
  Image: class {
    set src(_v) {
      setTimeout(() => this.onerror && this.onerror(), 0);
    }
  },
  AudioContext: class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }
    createOscillator() {
      return {
        type: '',
        frequency: { setValueAtTime: (f) => sounds.push(f) },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createGain() {
      return {
        connect: () => {},
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      };
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

let _t = 0;
function frames(n) {
  for (let i = 0; i < n; i++) {
    const cbs = queue.splice(0, queue.length);
    if (!cbs.length) break;
    for (const cb of cbs) {
      _t += 16.7;
      cb(_t);
    }
  }
}
function press(key) {
  for (const fn of listeners.keydown || []) fn({ key, preventDefault() {} });
}
function release(key) {
  for (const fn of listeners.keyup || []) fn({ key });
}

frames(4);
const G = sandbox.window.__G;
ok(!!G, 'el juego arranca');
sandbox.window.__gameLoadGame();
G.scr = 'world';
G.ping = null;
G.stepsWalked = 0;
frames(2);

// El mapa real tiene pines (tile 10) repartidos al azar al generar el mundo.
// Se busca uno cualquiera y se coloca al jugador justo al lado.
const { wMap } = await import('../src/core/world-constants.js').catch(() => ({}));
// wMap no se exporta al sandbox, así que se localiza el pin a través del
// propio estado del juego: se recorre el mapa con la función del juego.
const map = G.__wMap || null;
// Alternativa sin acceso interno: se usa la lista de pines colocando uno a mano
// en una casilla conocida del mapa mediante el tile 10 del mundo.
// El mapa vive en el sandbox: se obtiene con el mismo truco que usa el juego.
const wMapRef = sandbox.window.__wc?.wMap || null;
ok(!!wMapRef, 'se puede inspeccionar el mapa generado');

// Los pines se colocan al entrar al mapa (respawnPinsForMap), así que para
// que el test sea determinista se planta uno a mano. Es el mismo tile (10)
// que usa el juego de verdad y es SÓLIDO: no se pisa, se abre con C. Por eso
// el jugador camina por la casilla de AL LADO, que es cuando suena el aviso.
const pin = { c: 62, r: 285 };
const desde = { c: 61, r: 287 };
// Suelo caminable del mundo: camino (1), pasto (0) o hierba alta (5).
const PISABLE = [0, 1, 5];
if (wMapRef) {
  for (const [nm, c, r] of [['del pin', pin.c, pin.r], ['de arranque', desde.c, desde.r], ['de paso', desde.c, desde.r - 1]]) {
    const t = wMapRef[r]?.[c];
    ok(PISABLE.includes(t), `casilla ${nm} es suelo caminable (tile ${t})`);
  }
  wMapRef[pin.r][pin.c] = 10;
} else {
  ok(false, 'no se pudo plantar el pin de prueba');
}
ok(!!pin, `pin de prueba en ${pin.c},${pin.r}`);
const START = desde;

if (pin) {
  // Colocar al jugador debajo del pin y caminar hacia arriba hasta quedar
  // al lado de él (el pin es sólido, no se pisa).
  G.pl.x = START.c;
  G.pl.y = START.r;
  G.pl.d = 3;
  G.pl.stepTarget = null;
  G.pl.moving = false;
  G.stepsWalked = 100; // pasado el anti-ráfaga
  texts.length = 0;
  sounds.length = 0;

  press('ArrowUp');
  frames(30);
  release('ArrowUp');
  frames(4);

  ok(
    texts.some((t) => /Hay algo aquí cerca/i.test(t)),
    `aparece el aviso en pantalla ("${texts.find((t) => /Hay algo aquí/i.test(t)) || 'NO ENCONTRADO'}')`
  );
  const notasPing = sounds.filter((f) => f === 784 || f === 1047);
  ok(
    notasPing.length >= 2,
    `suena la campanita de dos notas ascendentes (${notasPing.join(' → ')} Hz)`
  );
  ok(G.ping && G.ping.count >= 1, 'el estado registra el aviso (no se repite en bucle)');

  // Volver a pasar por el mismo sitio no debe volver a avisar.
  texts.length = 0;
  sounds.length = 0;
  const countBefore = G.ping.count;
  G.stepsWalked += 50;
  G.pl.x = START.c;
  G.pl.y = START.r;
  G.pl.stepTarget = null;
  press('ArrowUp');
  frames(30);
  release('ArrowUp');
  frames(4);
  ok(G.ping.count === countBefore, 'el mismo pin no vuelve a avisar al segundo paso');
  ok(!sounds.includes(784), 'y no vuelve a sonar la campanita');
}

ok(G.stepsWalked > 0, `el juego cuenta los pasos (${G.stepsWalked})`);
ok(errors.length === 0, errors.length === 0 ? 'sin errores de consola' : 'errores: ' + errors[0].slice(0, 200));

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
