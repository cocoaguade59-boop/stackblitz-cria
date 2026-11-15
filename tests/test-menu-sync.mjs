// Verifica que el menú y las pantallas unificadas tengan UNA sola fuente
// de verdad. El bug histórico: dMenu dibujaba "Reiniciar" en un índice
// donde uMenu ejecutaba otra cosa.
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };
const canvasStub = () => ({ getContext: () => null, style: {}, addEventListener: () => {}, getBoundingClientRect: () => ({ width: 640, height: 480, left: 0, top: 0 }) });
globalThis.document = { getElementById: canvasStub, createElement: canvasStub, addEventListener: () => {} };
Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async () => {} } }, configurable: true });
globalThis.location = { search: '' };
globalThis.matchMedia = () => ({ matches: false });
globalThis.innerWidth = 1280;
globalThis.innerHeight = 800;
globalThis.addEventListener = () => {};
globalThis.Image = class { set src(v) { setTimeout(() => this.onerror && this.onerror(), 0); } };

const { G } = await import('../src/core/game-state.js');
const menu = await import('../src/screens/menu.js');

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

G.bagUpgrade = false;
const noBag = menu.getMenuOpts();
G.bagUpgrade = true;
const bag = menu.getMenuOpts();

ok(noBag.length === 11, `sin mochila: 11 opciones (hay ${noBag.length})`);
ok(bag.length === 12, `con mochila: 12 opciones (hay ${bag.length})`);
ok(bag.includes('Partida portátil'), 'incluye "Partida portátil"');
ok(bag.indexOf('Partida portátil') === bag.indexOf('Guardar') + 1, 'Partida portátil va justo tras Guardar');
ok(bag[bag.length - 1] === 'Reiniciar toda la partida', 'Reiniciar es la última opción');

// Simulación: recorrer TODAS las opciones y verificar que cada índice hace
// lo que su etiqueta promete (el corazón del bug).
function press() {
  G.keys = { ' ': true };
  G.kcd = {};
  G.scr = 'menu';
  G.showMap = G.proaOpen = G.showMissions = G.showDex = G.showObjects = false;
  G.batallador = false;
}
const expectations = {
  Poción: (s) => s === 'menu',
  Revivir: (s) => s === 'menu',
  Equipo: (s) => s === 'menu' && G.proaOpen === true,
  Mapa: (s) => s === 'menu' && G.showMap === true,
  Misiones: (s) => s === 'menu' && G.showMissions === true,
  Criaturario: (s) => s === 'menu' && G.showDex === true,
  Objetos: (s) => s === 'menu' && G.showObjects === true,
  LaFot: (s) => s === 'fabianaCraft',
  Guardar: (s) => s === 'menu',
  'Partida portátil': (s) => s === 'saveTransfer',
  Volver: (s) => s === 'world',
  'Reiniciar toda la partida': (s) => s === 'confirmReset',
};

for (const [label, check] of Object.entries(expectations)) {
  const idx = bag.indexOf(label);
  if (idx === -1) { ok(false, `opción "${label}" no existe`); continue; }
  G.ms = { s: idx };
  G.pot = 5; G.rev = 2; G.party = []; G.resetSel = 1;
  press();
  menu.uMenu();
  ok(check(G.scr), `índice ${idx} "${label}" → scr=${G.scr}`);
}

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
