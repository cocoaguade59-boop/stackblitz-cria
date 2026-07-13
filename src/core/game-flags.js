// Flags globales mutables del juego (post-game, torre abierta, etc.)
//
// Estas variables cambian de valor durante el juego pero necesitan ser
// visibles desde múltiples módulos. Usamos ES live bindings: cualquier
// módulo que haga `import { postGame }` verá SIEMPRE el valor actualizado.
//
// IMPORTANTE: para modificar el valor de un primitivo (bool), el reasign
// debe hacerse DENTRO de este módulo. Por eso proveemos setters.
//
// Los objetos y arrays (npcDefeats, towerKey, captureCount, proa,
// lastHealPos, diplomas) son mutables por referencia — se pueden
// modificar sus propiedades desde cualquier módulo, pero para
// REASIGNAR el binding completo hay que usar los setters.

// --- Flags booleanas ---
let postGame = false;
let towerOpen = false;
let oloDefeated = false;
let pairBattles = false;

// --- Objetos mutables (por referencia) ---
let npcDefeats = {};
let proa = [];  // Almacén de criaturas extra del jugador
let captureCount = {};
let lastHealPos = { x: 20, y: 145, map: 'world' };
let towerKey = {
  edison: false,
  roberto: false,
  gabriela: false,
  ximena: false,
};
let diplomas = {
  tamara: false,
  luchito: false,
  andrea: false,
  dan: false,
};

// --- Setters (para modificar bindings primitivos desde fuera) ---
function setPostGame(v) { postGame = v; }
function setTowerOpen(v) { towerOpen = v; }
function setOloDefeated(v) { oloDefeated = v; }
function setPairBattles(v) { pairBattles = v; }
function setNpcDefeats(v) { npcDefeats = v; }
function setProa(v) { proa = v; }
function setCaptureCount(v) { captureCount = v; }
function setLastHealPos(v) { lastHealPos = v; }
function setTowerKey(v) { towerKey = v; }
function setDiplomas(v) { diplomas = v; }

export {
  // Valores (live bindings)
  postGame, towerOpen, oloDefeated, pairBattles,
  npcDefeats, proa, captureCount, lastHealPos, towerKey, diplomas,
  // Setters
  setPostGame, setTowerOpen, setOloDefeated, setPairBattles,
  setNpcDefeats, setProa, setCaptureCount, setLastHealPos,
  setTowerKey, setDiplomas,
};
