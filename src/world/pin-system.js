// Sistema de pines del mapa (T3+T4).
// - Coloca pines (tile 10 mundo / tile 28 cueva-torre)
// - Los quita al recoger
// - Los reaparece al reentrar un mapa (posiciones nuevas)

import { WC, WR, CC, CR, wMap, cave1, cave2 } from '../core/world-constants.js';

const WORLD_PIN_COUNT = 35;
const CAVE_PIN_COUNT = 5;
const TOWER_PIN_COUNT = 5;

// Torre vive en script.js (no en world-constants). Se inyecta.
let _getTowerMap = null;
function setTowerMapGetter(fn) {
  _getTowerMap = fn;
}

function clearPinsOnMap(map, pinTile, floorTile) {
  if (!map || !map.length) return;
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      if (row[c] === pinTile) row[c] = floorTile;
    }
  }
}

function placeRandomPins(map, cols, rows, pinTile, floorTile, count) {
  if (!map || !map.length) return 0;
  clearPinsOnMap(map, pinTile, floorTile);
  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 40;
  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const c = 2 + Math.floor(Math.random() * Math.max(1, cols - 4));
    const r = 2 + Math.floor(Math.random() * Math.max(1, rows - 4));
    if (map[r]?.[c] === floorTile) {
      map[r][c] = pinTile;
      placed++;
    }
  }
  return placed;
}

/** Respawn de pines del mundo exterior (tile 10 sobre suelo 0). */
function respawnWorldPins() {
  return placeRandomPins(wMap, WC, WR, 10, 0, WORLD_PIN_COUNT);
}

/** Respawn de pines de una cueva (tile 28 sobre suelo 20). */
function respawnCavePins(mapName) {
  const map = mapName === 'cave1' ? cave1 : cave2;
  return placeRandomPins(map, CC, CR, 28, 20, CAVE_PIN_COUNT);
}

/** Respawn de pines de la torre (tile 28 sobre suelo 20). */
function respawnTowerPins() {
  const towerMap = _getTowerMap ? _getTowerMap() : null;
  if (!towerMap) return 0;
  // Dimensiones de torre usadas en script.js
  const TWC = 30;
  const TWR = 25;
  return placeRandomPins(towerMap, TWC, TWR, 28, 20, TOWER_PIN_COUNT);
}

/**
 * Llamar JUSTO AL ENTRAR a un mapa (después de setear G.curMap).
 * Reaparece todos los pines de ese mapa en posiciones nuevas.
 */
function respawnPinsForMap(mapName) {
  if (mapName === 'world') return respawnWorldPins();
  if (mapName === 'cave1' || mapName === 'cave2') return respawnCavePins(mapName);
  if (mapName === 'tower') return respawnTowerPins();
  return 0;
}

/**
 * Quita un pin del mapa actual.
 * @returns {boolean} true si había un pin y se removió
 */
function removePinAt(mapName, c, r) {
  if (mapName === 'world') {
    if (wMap[r]?.[c] === 10) {
      wMap[r][c] = 0;
      return true;
    }
    return false;
  }
  if (mapName === 'cave1' || mapName === 'cave2') {
    const map = mapName === 'cave1' ? cave1 : cave2;
    if (map[r]?.[c] === 28) {
      map[r][c] = 20;
      return true;
    }
    return false;
  }
  if (mapName === 'tower') {
    const towerMap = _getTowerMap ? _getTowerMap() : null;
    if (towerMap?.[r]?.[c] === 28) {
      towerMap[r][c] = 20;
      return true;
    }
    return false;
  }
  return false;
}

function isPinTile(mapName, tile) {
  if (mapName === 'world') return tile === 10;
  if (mapName === 'cave1' || mapName === 'cave2' || mapName === 'tower') return tile === 28;
  return false;
}

function isCaveLikeMap(mapName) {
  return mapName === 'cave1' || mapName === 'cave2' || mapName === 'tower';
}

export {
  WORLD_PIN_COUNT,
  CAVE_PIN_COUNT,
  TOWER_PIN_COUNT,
  setTowerMapGetter,
  respawnWorldPins,
  respawnCavePins,
  respawnTowerPins,
  respawnPinsForMap,
  removePinAt,
  isPinTile,
  isCaveLikeMap,
  placeRandomPins,
  clearPinsOnMap,
};
