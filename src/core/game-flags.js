// Flags globales mutables del juego.
//
// CRÍTICO StackBlitz: todos los valores mutables viven en window.__gf
// para garantizar que módulos cargados en orden impredecible compartan
// la MISMA referencia (mismo fix que world-constants.js).

if (!window.__gf) {
  window.__gf = {
    postGame: false,
    towerOpen: false,
    oloDefeated: false,
    pairBattles: false,
    npcDefeats: {},
    proa: [],
    captureCount: {},
    lastHealPos: { x: 20, y: 145, map: 'world' },
    towerKey: { edison: false, roberto: false, gabriela: false, ximena: false },
    diplomas: { tamara: false, luchito: false, andrea: false, dan: false },
  };
}

const gf = window.__gf;

let postGame = gf.postGame;
let towerOpen = gf.towerOpen;
let oloDefeated = gf.oloDefeated;
let pairBattles = gf.pairBattles;
let npcDefeats = gf.npcDefeats;
let proa = gf.proa;
let captureCount = gf.captureCount;
let lastHealPos = gf.lastHealPos;
let towerKey = gf.towerKey;
let diplomas = gf.diplomas;

function setPostGame(v) { gf.postGame = v; postGame = v; }
function setTowerOpen(v) { gf.towerOpen = v; towerOpen = v; }
function setOloDefeated(v) { gf.oloDefeated = v; oloDefeated = v; }
function setPairBattles(v) { gf.pairBattles = v; pairBattles = v; }
function setNpcDefeats(v) { gf.npcDefeats = v; npcDefeats = v; }
function setProa(v) { gf.proa = v; proa = v; }
function setCaptureCount(v) { gf.captureCount = v; captureCount = v; }
function setLastHealPos(v) { gf.lastHealPos = v; lastHealPos = v; }
function setTowerKey(v) { gf.towerKey = v; towerKey = v; }
function setDiplomas(v) { gf.diplomas = v; diplomas = v; }

export {
  postGame, towerOpen, oloDefeated, pairBattles,
  npcDefeats, proa, captureCount, lastHealPos, towerKey, diplomas,
  setPostGame, setTowerOpen, setOloDefeated, setPairBattles,
  setNpcDefeats, setProa, setCaptureCount, setLastHealPos,
  setTowerKey, setDiplomas,
};
