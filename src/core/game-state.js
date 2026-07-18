// Estado global mutable del juego.
//
// Singleton via window.__gs para StackBlitz (mismo fix que
// world-constants.js y game-flags.js).

if (!window.__gs) {
  window.__gs = {
    scr: 'title',
    curMap: 'world',
    pl: { x: 20, y: 145, d: 0, f: 0, sprint: false, stepTarget: null, moving: false },
    party: [],
    gold: 200,
    pot: 5,
    rev: 2,
    // Cristales armados (morado / cian / naranja)
    crv: 3,
    crvC: 0,
    crvO: 0,
    // Fragmentos: 4 del mismo color = 1 cristal (Fabiana / mochila)
    frag: { p: 0, c: 0, o: 0 },
    // Pergaminos de Batalla (Hernán tutor)
    scrolls: 0,
    // Fragancias e inciensos (David-O / inventario)
    fragrances: { picante: 0, dulce: 0, salada: 0, amarga: 0, saludable: 0 },
    incense: { picante: 0, dulce: 0, salada: 0, amarga: 0, saludable: 0 },
    // Incienso activo: { type, stepsLeft } o null
    activeIncense: null,
    // Mejora de mochila (Claudia) — crafting portátil
    bagUpgrade: false,
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
    batallador: false,
    batalladorSel: null,
    sSel: 0,
    bs: null,
    ds: null,
    ms: null,
    ss: null,
    find: null, // pantalla de hallazgo de pin { loot, label, rarity }
    talkedTo: {},
    allTalked: false,
    bossTeam: null,
    bossIdx: 0,
    bossDialogs: 0,
    prevPos: null,
    showMap: false,
    proaOpen: false,
    showMissions: false,
    // Pantalla de inventario de objetos (menú → Objetos)
    showObjects: false,
    os: null, // { s: selection index, scroll }
    // Fabiana crafting (T5)
    fabSel: 0,
    craftSel: 0,
    craft: null, // { code, phase, tm, ticks, applied }
  };
}

const G = window.__gs;

export { G };
