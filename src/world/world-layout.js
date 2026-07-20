// Reglas espaciales compartidas del mundo exterior.
// C1: estas restricciones evitan decoraciones/pines imposibles antes del rediseño regional C2–C6.
import { ROUTE_PROA_STATIONS } from './route-missions.js';
import { ROUTE_SIGNS } from '../data/map-markers.js';
import { TYPE_RESERVES } from '../data/regions.js';

const PASSABLE_GROUND_TILES = new Set([0, 1, 5, 26]);
const SIGN_GROUND_TILES = new Set([0, 1, 26]);
const PIN_GROUND_TILES = new Set([0]);

// Pueblos actuales: los pines pertenecen a rutas y claros, nunca a plazas residenciales.
const VILLAGE_PIN_EXCLUSIONS = [
  { x1: 10, y1: 128, x2: 35, y2: 149 }, // Pitch
  { x1: 28, y1: 99, x2: 55, y2: 118 }, // Storyboard
  { x1: 43, y1: 71, x2: 70, y2: 90 }, // Rodaje
  { x1: 19, y1: 41, x2: 43, y2: 61 }, // Última Toma
  { x1: 32, y1: 11, x2: 57, y2: 31 }, // Montaje
];

const WORLD_ENTRANCES = [
  { x: 15, y: 108 }, { x: 71, y: 41 }, // cuevas
  { x: 38, y: 8 }, { x: 55, y: 6 }, // castillo y torre
];

function inRect(c, r, rect) { return c >= rect.x1 && c <= rect.x2 && r >= rect.y1 && r <= rect.y2; }
function near(c, r, point, radius = 1) { return Math.abs(c - point.x) <= radius && Math.abs(r - point.y) <= radius; }
function isWalkableGroundTile(tile) { return PASSABLE_GROUND_TILES.has(tile); }
function isSignGroundTile(tile) { return SIGN_GROUND_TILES.has(tile); }

function isGateTreeEligible(map, c, r) {
  return isWalkableGroundTile(map[r]?.[c]);
}

function isProtectedWorldCell(c, r) {
  if (VILLAGE_PIN_EXCLUSIONS.some((rect) => inRect(c, r, rect))) return true;
  if (WORLD_ENTRANCES.some((entry) => near(c, r, entry, 2))) return true;
  if (ROUTE_PROA_STATIONS.some((station) => Math.abs(c - station.x) <= Math.ceil(station.w / 2) + 1 && Math.abs(r - station.y) <= 2)) return true;
  if (ROUTE_SIGNS.some((sign) => near(c, r, sign, 2))) return true;
  if (TYPE_RESERVES.some((reserve) => near(c, r, reserve, 2))) return true;
  return false;
}

function isWorldPinAllowed(map, c, r) {
  return PIN_GROUND_TILES.has(map[r]?.[c]) && !isProtectedWorldCell(c, r);
}

function findValidSignPosition(map, sign, cols, rows) {
  if (isSignGroundTile(map[sign.y]?.[sign.x]) && !isProtectedWorldCellForSign(sign.x, sign.y, sign)) return sign;
  for (let radius = 1; radius <= 8; radius++) {
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
      const x = sign.x + dx, y = sign.y + dy;
      if (x < 2 || x >= cols - 2 || y < 2 || y >= rows - 2) continue;
      if (isSignGroundTile(map[y]?.[x]) && !isProtectedWorldCellForSign(x, y, sign)) return { ...sign, x, y };
    }
  }
  return null;
}

// Para su propio cartel no se aplica la exclusión de carteles; sí el resto de estructuras.
function isProtectedWorldCellForSign(c, r, currentSign) {
  if (VILLAGE_PIN_EXCLUSIONS.some((rect) => inRect(c, r, rect)) && currentSign.name.includes('Ruta')) return false;
  if (WORLD_ENTRANCES.some((entry) => near(c, r, entry, 1))) return true;
  if (ROUTE_PROA_STATIONS.some((station) => near(c, r, station, 1))) return true;
  if (TYPE_RESERVES.some((reserve) => near(c, r, reserve, 1))) return true;
  return false;
}

function getValidRouteSigns(map, cols, rows) {
  return ROUTE_SIGNS.map((sign) => findValidSignPosition(map, sign, cols, rows)).filter(Boolean);
}

export { isGateTreeEligible, isWorldPinAllowed, isWalkableGroundTile, getValidRouteSigns, VILLAGE_PIN_EXCLUSIONS };
