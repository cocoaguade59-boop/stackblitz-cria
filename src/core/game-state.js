// Estado global mutable del juego. Se exporta como instancia única
// (todos los módulos que la importen mutan la misma referencia).
// Sin dependencias externas.

// === GAME STATE ===
const G = {
  scr: 'title',
  curMap: 'world',
  pl: { x: 20, y: 145, d: 0, f: 0, sprint: false },
  party: [],
  gold: 200,
  pot: 5,
  rev: 2,
  crv: 3,
  bWon: 0,
  tExp: 0,
  mFriend: 0,
  bossOk: false,
  allCaught: false,
  keys: {},
  kcd: {},
  held: {},
  pts: [],
  nots: [],
  tFr: 0,
  titleSel: 0,
  titleHornPlayed: false,
  hasSave: false,
  showDex: false,
  dexSel: 0,
  supervisor: false,
  batallador: false,       // Modo testing de combate (tecla P)
  batalladorSel: null,     // Estado de la pantalla de selección
  sSel: 0,
  bs: null,
  ds: null,
  ms: null,
  ss: null,
  talkedTo: {},
  allTalked: false,
  bossTeam: null,
  bossIdx: 0,
  bossDialogs: 0,
  prevPos: null,
  showMap: false, // Para mapa grande
  proaOpen: false, // Para menú de Proa
};

export { G };
