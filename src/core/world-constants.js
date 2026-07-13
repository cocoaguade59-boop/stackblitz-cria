// Constantes y estado de los mapas del juego.
//
// - T: tamaño de tile en píxeles (32)
// - WC, WR: columnas/filas del mundo (80x150)
// - CC, CR: columnas/filas de cuevas (40x30)
// - KC, KR: columnas/filas del castillo (30x25)
// - cam: posición de la cámara (para scroll del mundo)
// - wMap, cave1, cave2, castMap: matrices de tiles de cada mapa
//
// Los arrays son mutables por referencia — se llenan al generar el mapa
// desde funciones de src/... y se leen desde funciones de render.
// La cámara `cam` también es mutable por referencia.

const T = 32;
const WC = 80;
const WR = 150;
const CC = 40;
const CR = 30;
const KC = 30;
const KR = 25;

let cam = { x: 0, y: 0 };
let wMap = [];
let cave1 = [];
let cave2 = [];
let castMap = [];

// Setters para las arrays y cámara (por si se reasigna el binding entero)
function setCam(v) { cam = v; }
function setWMap(v) { wMap = v; }
function setCave1(v) { cave1 = v; }
function setCave2(v) { cave2 = v; }
function setCastMap(v) { castMap = v; }

export {
  T, WC, WR, CC, CR, KC, KR,
  cam, wMap, cave1, cave2, castMap,
  setCam, setWMap, setCave1, setCave2, setCastMap,
};
