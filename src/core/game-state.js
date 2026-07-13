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
    batallador: false,
    batalladorSel: null,
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
    showMap: false,
    proaOpen: false,
    showMissions: false,
  };
}

const G = window.__gs;

export { G };
