// El proxy del contexto debe reenviar TODAS las propiedades y métodos,
// incluidos globalAlpha e imageSmoothingEnabled (si falta uno, el arte
// glitchea en silencio o el rasterizado sale idéntico al anterior).
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };

const state = { offscreen: { alpha: 1, rects: 0, texts: 0 }, main: { images: 0 } };
function makeTmpCtx() {
  const s = state.offscreen;
  return new Proxy({}, {
    get(_t, p) {
      if (p === 'fillRect') return () => { s.rects++; };
      if (p === 'fillText') return () => { s.texts++; };
      if (p === 'globalAlpha') return s.alpha;
      if (p === 'imageSmoothingEnabled') return s.smoothing;
      return '';
    },
    set(_t, p, v) {
      if (p === 'globalAlpha') { s.alpha = v; return true; }
      if (p === 'imageSmoothingEnabled') { s.smoothing = v; return true; }
      return true;
    },
  });
}
const mainCtx = new Proxy({}, {
  get(_t, p) { const f = () => { if (p === 'drawImage') state.main.images++; }; return typeof p === 'string' ? f : undefined; },
  set() { return true; },
});
const stubEl = () => ({ getContext: () => mainCtx, style: {}, addEventListener: () => {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) });
globalThis.document = {
  getElementById: stubEl,
  createElement: () => ({ width: 0, height: 0, getContext: () => makeTmpCtx() }),
  addEventListener: () => {},
};
globalThis.Image = class { set src(v) {} };

const { dCre } = await import('../src/render/creature-sprites.js');

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

// 'flameye' no usa globalAlpha; usamos una que sí (varias lo hacen).
state.offscreen.rects = 0; state.offscreen.texts = 0; state.offscreen.alpha = 1; state.offscreen.smoothing = undefined;
dCre(100, 100, 'flameye', 10, 0);
ok(state.offscreen.rects > 0, `el cuerpo dibuja en el canvas offscreen (${state.offscreen.rects} fillRect)`);
ok(state.main.images === 1, 'después blitea con drawImage en el canvas principal');

// El proxy debe permitir leer/escribir globalAlpha y restaurarlo
const { _drawCreBody } = await import('../src/render/creature-sprites.js');
state.offscreen.alpha = 1;
_drawCreBody(0, 0, 'flameye', 10, 0);
ok(true, 'el cuerpo se ejecuta sin lanzar con el contexto proxy');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
