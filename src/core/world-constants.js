// Constantes y estado de los mapas del juego.
//
// CRÍTICO StackBlitz: todos los valores mutables viven en window.__wc
// para garantizar que módulos cargados en orden impredecible compartan
// la MISMA referencia. Sin esto, tiles-world.js y script.js pueden
// terminar con copias distintas de wMap (vacías en el render).
//
// script.js inicializa los arrays en genWorld() escribiendo a las
// mismas referencias que este módulo exporta.

const T = 32;
const WC = 80;
const WR = 150;
const CC = 40;
const CR = 30;
const KC = 30;
const KR = 25;

// Singleton via window — si ya existe, reusamos; si no, creamos
if (!window.__wc) {
  window.__wc = {
    cam: { x: 0, y: 0 },
    wMap: [],
    cave1: [],
    cave2: [],
    castMap: [],
  };
}

const wc = window.__wc;

// Referencias directas al singleton (mutable por referencia)
const cam = wc.cam;
let wMap = wc.wMap;
let cave1 = wc.cave1;
let cave2 = wc.cave2;
let castMap = wc.castMap;

function setCam(v) { wc.cam.x = v.x; wc.cam.y = v.y; }
function setWMap(v) { wc.wMap = v; wMap = v; }
function setCave1(v) { wc.cave1 = v; cave1 = v; }
function setCave2(v) { wc.cave2 = v; cave2 = v; }
function setCastMap(v) { wc.castMap = v; castMap = v; }

export {
  T, WC, WR, CC, CR, KC, KR,
  cam, wMap, cave1, cave2, castMap,
  setCam, setWMap, setCave1, setCave2, setCastMap,
};
