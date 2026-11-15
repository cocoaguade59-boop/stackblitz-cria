// Verifica DENTRO del juego real (bundle de dist-app) las mejoras de batalla:
//   - punto 6: el marco naranja/azul aparece en la pantalla de movimientos,
//   - punto 8: el cursor nace en un movimiento con PP y saltea los agotados,
//   - punto 5: la tecla V cambia a x2 y la insignia "x2" se dibuja.
//
// Se carga la partida guardada simulada, se entra a una batalla artificial
// usando el equipo real del save y se corren frames anotando todo lo que se
// pinta. Si algo de esto falla, el usuario lo vería roto en su PC.
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
  playMs: 3600_000,
  diplomas: {},
  party: [
    { id: 'flameye', lv: 20, nm: 'Flameye', hp: 60, mHp: 60, mv: [{ nm: 'Ascuas', tp: 'fire', pp: 0, mp: 10, pw: 35 }] },
  ],
  gold: 500,
};
const store = { criaturasDelReino_v2: JSON.stringify(SAVE) };

const rects = [];
const texts = [];
let _fill = '#000';
const records = [];
const ctx2d = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === 'fillStyle') return _fill;
      if (p === 'font') return records._font;
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient')
        return () => ({ addColorStop: () => {} });
      if (p === 'canvas') return { width: 640, height: 480 };
      if (p === 'getImageData') return () => ({ data: new Uint8ClampedArray(640 * 480 * 4) });
      if (p === 'fillRect')
        return (x, y, w, h) => {
          rects.push({ x, y, w, h, c: _fill });
        };
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
  setTimeout: () => 0,
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

function frames(n) {
  let t = performance_now();
  for (let i = 0; i < n; i++) {
    const cbs = queue.splice(0, queue.length);
    if (!cbs.length) break;
    for (const cb of cbs) {
      t += 16.7;
      cb(t);
    }
  }
  return t;
}
let _t = 0;
function performance_now() {
  return _t;
}

function press(key) {
  for (const fn of listeners.keydown || []) fn({ key, preventDefault() {} });
}
function release(key) {
  for (const fn of listeners.keyup || []) fn({ key });
}
function tap(key) {
  press(key);
  return () => release(key);
}

// --- Arrancar: título ---
frames(5);
const G = sandbox.window.__G;
ok(!!G, 'el juego expone su estado (window.__G) tras arrancar');

// Cargar la partida guardada.
const loaded = sandbox.window.__gameLoadGame();
ok(loaded === true, 'la partida guardada carga');
G.scr = 'world';

console.log('\n=== Punto 5: velocidad de batalla ===');
ok(G.battleSpd === 1 || G.battleSpd === undefined || G.battleSpd === 1, `arranca en x1 (${G.battleSpd})`);

// Entrar a una batalla artificial con el equipo real del save.
G.party[0].full && G.party[0].full();
const player = G.party[0];
// Enemigo: reutilizamos la misma criatura del jugador como rival.
const enemy = JSON.parse(JSON.stringify(player.toJSON ? player.toJSON() : player));
G.bs = {
  pi: 0,
  en: player.toJSON ? player.constructor.fromJSON(enemy) : enemy,
  ph: 'move',
  ms: 0,
  mvs: 0,
  ss: 0,
  ai: 0,
  tm: 0,
  af: 0,
  mq: [],
  msg: '',
  ps: 0,
  es: 0,
  fought: [0],
};
G.scr = 'battle';

// El jugador tiene sólo un movimiento (Ascuas, fuego) y sin PP → estado gris.
const mv = G.party[0].mv;
ok(Array.isArray(mv) && mv.length >= 1, `el jugador tiene movimientos (${mv && mv.length})`);

_t = frames(3);

// Con un movimiento de fuego contra un enemigo de fuego (x0.5) el marco va azul;
// contra planta iría naranja. Probamos las dos cosas cambiando el tipo del rival.
texts.length = 0;
rects.length = 0;
G.bs.en.tp = 'plant'; // fuego vs planta = x2 → naranja
G.bs.mvs = 0;
G.party[0].mv[0].pp = 5; // con PP: el marco sí se dibuja
_t = frames(2);
const naranja = rects.filter((r) => r.c === '#F08A20');
ok(naranja.length >= 4, `fuego vs planta: marco naranja en la casilla de ataque (${naranja.length} lados)`);
ok(
  naranja.some((r) => r.w === 284 && r.h === 2),
  'el marco es un borde fino de 2 px (minimalista, no un recuadro doble)'
);

rects.length = 0;
G.bs.en.tp = 'water'; // fuego vs agua = x0.5 → azul
_t = frames(2);
const azul = rects.filter((r) => r.c === '#3C7AE0');
ok(azul.length >= 4, `fuego vs agua: marco azul en la casilla de ataque (${azul.length} lados)`);

rects.length = 0;
G.bs.en.tp = 'normal'; // fuego vs normal = x1 → sin marco
_t = frames(2);
ok(
  !rects.some((r) => r.c === '#F08A20' || r.c === '#3C7AE0'),
  'contra un tipo neutral no aparece ningún marco (pantalla limpia)'
);

// Ningún número ni texto de daño agregado (eso era el punto 6 viejo, rechazado).
texts.length = 0;
G.bs.en.tp = 'plant';
_t = frames(2);
ok(
  !texts.some((t) => /^x2$|^×2$|daño|DMG/i.test(t)),
  'no se agregó ningún texto de daño ni multiplicador en la casilla'
);

console.log('\n=== Punto 5: tecla V ===');
texts.length = 0;
rects.length = 0;
G.bs.ph = 'act'; // el atajo de V funciona en cualquier fase de batalla
_t = frames(2);
ok(texts.some((t) => /V: velocidad x1/.test(t)), 'el menú de acciones anuncia "V: velocidad x1"');
ok(!rects.some((r) => r.c === '#F0A020' && r.y < 20), 'sin insignia x2 cuando vas a x1');

const up = tap('v');
_t = frames(2);
up('v');
ok(G.battleSpd === 2, `al tocar V pasa a x2 (${G.battleSpd})`);

texts.length = 0;
rects.length = 0;
_t = frames(2);
ok(texts.some((t) => /V: velocidad x2/.test(t)), 'el menú ahora dice "V: velocidad x2"');
const badge = rects.filter((r) => r.c === '#F0A020');
ok(badge.length >= 1, 'se dibuja la insignia naranja x2 arriba a la derecha');
ok(
  badge.length === 0 || badge.every((r) => r.x > 500 && r.y < 40),
  'la insignia está en la esquina superior derecha, no encima de los HUD'
);

const up2 = tap('v');
_t = frames(2);
up2('v');
ok(G.battleSpd === 1, 'V de nuevo vuelve a x1 (es un interruptor, no acumula)');

// El reloj de batalla debe avanzar exactamente al doble con x2, sin que se
// pierdan frames: se mide con el mismo número de frames reales.
console.log('\n=== Punto 5: el reloj va al doble y no se pierden frames ===');
G.bs.ph = 'msg';
G.bs.msg = 'prueba';
G.bs.mq = [];
G.bs.tm = 0;
G.battleSpd = 1;
_t = frames(10);
const tmX1 = G.bs.tm;
G.bs.tm = 0;
G.battleSpd = 2;
_t = frames(10);
const tmX2 = G.bs.tm;
ok(tmX1 > 0, `x1 avanza ${tmX1} ticks en 10 frames`);
ok(tmX2 === tmX1 * 2, `x2 avanza el doble (${tmX1} → ${tmX2})`);
G.battleSpd = 1;

console.log('\n=== Punto 8: PP agotados ===');
G.bs.ph = 'move';
G.party[0].mv.forEach((m) => {
  m.pp = 0;
});
texts.length = 0;
_t = frames(2);
ok(
  texts.some((t) => /Sin PP/.test(t)),
  'con todos los movimientos agotados avisa ANTES de elegir ("¡Sin PP!…")'
);

// Con el primero agotado y el segundo disponible, el cursor debe arrancar en el 2º.
// Se le dan 4 movimientos al sprite de prueba para reproducir el caso real
// (una criatura con la primera técnica agotada).
while (G.party[0].mv.length < 4) {
  const n = G.party[0].mv.length;
  G.party[0].mv.push({ nm: `Técnica ${n + 1}`, tp: 'normal', pp: 10, mp: 10, pw: 30 });
}
ok(G.party[0].mv.length === 4, 'el sprite de prueba tiene los 4 movimientos de una criatura real');
if (G.party[0].mv.length > 1) {
  G.party[0].mv[0].pp = 0;
  G.party[0].mv[1].pp = 5;
  G.bs.mvs = 0;
  G.bs.ph = 'act';
  G.bs.ms = 0; // "Luchar"
  const up3 = tap('c');
  _t = frames(2);
  up3('c');
  ok(G.bs.ph === 'move', 'C en "Luchar" abre la lista de movimientos');
  ok(G.bs.mvs === 1, `el cursor nace en el movimiento con PP, no en el agotado (mvs=${G.bs.mvs})`);
} else {
  console.log('SKIP el sprite de prueba sólo tiene un movimiento');
}

ok(errors.length === 0, errors.length === 0 ? 'ningún error de consola en toda la batalla' : 'errores: ' + errors[0].slice(0, 200));

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
