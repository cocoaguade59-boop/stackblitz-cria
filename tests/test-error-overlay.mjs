// Verifica la red de seguridad visible de dist-app/index.html.
//
// Motivo: cuando el juego moría al arrancar, el usuario solo veía un canvas
// negro, sin ninguna información. El overlay convierte ese silencio en un
// mensaje con el error real.
//
// Se comprueban dos cosas opuestas:
//   1. Arranque sano  → el cartel NO aparece (no molesta al que juega).
//   2. Arranque roto   → el cartel SÍ aparece y trae el mensaje de error.
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

// ---------------------------------------------------------------- estructura
const posCanvas = html.indexOf('<canvas');
const posScriptJuego = html.indexOf('<script data-juego');
ok(posScriptJuego !== -1, 'el script del juego está marcado con data-juego');
ok(html.includes('aviso-error'), 'existe el overlay de errores en el HTML');
const posOverlay = html.indexOf('aviso-error');
ok(posOverlay < posScriptJuego,
  'el overlay va ANTES del script del juego (si no, no puede capturar su excepción)');
ok(posCanvas < posScriptJuego, 'el canvas va antes del script del juego');

// ------------------------------------------------------------- arrancar
function arrancar(fuente) {
  const body = fuente.slice(fuente.indexOf('<body>'));
  const scripts = [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  const carteles = [];
  const errores = [];
  const ctx2d = new Proxy({}, {
    get: (_t, p) => (p === 'measureText' ? () => ({ width: 10 })
      : p === 'canvas' ? { width: 640, height: 480 }
      : p === 'createLinearGradient' || p === 'createRadialGradient'
        ? () => ({ addColorStop: () => {} })
        : () => {}),
    set: () => true,
  });
  const canvasEl = { width: 640, height: 480, style: {}, getAttribute: () => null, setAttribute: () => {},
    getContext: () => ctx2d, addEventListener: () => {},
    getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) };

  const erroresListeners = [];
  const sandbox = {
    console: { log() {}, warn() {}, error: (...a) => errores.push(a.join(' ')) },
    document: {
      getElementById: (id) => (id === 'c' ? canvasEl : (id === 'aviso-error' ? carteles[0] || null : null)),
      createElement: (t) => {
        const el = { tagName: t, style: {}, _html: '', id: '',
          setAttribute() {}, getAttribute: () => null,
          querySelector: () => ({ set textContent(v) { el._txt = v; }, get textContent() { return el._txt || ''; } }) };
        Object.defineProperty(el, 'innerHTML', {
          set(v) { el._html = v; }, get() { return el._html; },
        });
        return el;
      },
      body: { appendChild: (el) => { carteles.push(el); } },
      addEventListener: () => {},
    },
    navigator: { clipboard: { writeText: async () => {} } },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 },
    location: { search: '', href: 'file:///index.html', protocol: 'file:' },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 1,
    setTimeout: (f) => { try { f(); } catch (_) {} return 0; },
    clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    innerWidth: 1280, innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    Image: class { set src(_v) { setTimeout(() => this.onerror && this.onerror(), 0); } },
    AudioContext: class { constructor() { throw new Error('sin audio'); } },
    Math, Date, JSON, Object, Array, String, Number, Boolean, Error, Proxy, Map, Set, Promise,
    Uint8Array, Uint8ClampedArray, TextEncoder, TextDecoder,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  // el navegador registra los listeners acá
  sandbox.window.addEventListener = (ev, fn) => { if (ev === 'error') erroresListeners.push(fn); };
  sandbox.addEventListener = sandbox.window.addEventListener;

  const ctx = vm.createContext(sandbox);
  // scripts[0] = overlay, scripts[1] = juego
  try { vm.runInContext(scripts[0], ctx, { filename: 'overlay.js' }); } catch (_) {}
  let excepcion = null;
  try { vm.runInContext(scripts[1], ctx, { filename: 'juego.js' }); }
  catch (e) { excepcion = e; }
  if (excepcion) {
    for (const fn of erroresListeners) {
      try { fn({ message: excepcion.message, filename: 'index.html', lineno: 56 }); } catch (_) {}
    }
  }
  return { carteles, errores, excepcion };
}

// 1) arranque sano
const sano = arrancar(html);
ok(!sano.excepcion, sano.excepcion
  ? 'el juego arranca sin excepción: ' + sano.excepcion.message
  : 'el juego arranca sin excepción');
ok(sano.carteles.length === 0,
  sano.carteles.length === 0
    ? 'en un arranque sano NO aparece el cartel de error'
    : 'el cartel apareció sin motivo (' + sano.carteles.length + ')');

// 2) arranque roto a propósito
const roto = html.replace('var __INLINE_ASSETS__=',
  'throw new TypeError("Cannot read properties of null (reading \'getContext\')");var __INLINE_ASSETS__=', 1);
const conFallo = arrancar(roto);
ok(conFallo.excepcion !== null || conFallo.carteles.length > 0,
  'con un error forzado, algo se detecta');
ok(conFallo.carteles.length > 0,
  conFallo.carteles.length > 0
    ? 'el cartel de error SÍ aparece cuando el juego se rompe'
    : 'el cartel NO apareció con el juego roto (el usuario volvería a ver negro)');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
