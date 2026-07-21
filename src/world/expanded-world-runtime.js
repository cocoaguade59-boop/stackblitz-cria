// Borrador local — conecta los datos C1.5a-2d/2e al mundo ampliado.
// Aún no está importado ni subido.
import { EXPANDED_WORLD_POINTS } from './expanded-world-points.js';
import { EXPANDED_NPC_PLACEMENTS, EXPANDED_SPAWN } from './expanded-npc-placements.js';

function findPlacement(name) {
  for (const placements of Object.values(EXPANDED_NPC_PLACEMENTS)) {
    if (placements[name]) return placements[name];
  }
  return null;
}

function applyExpandedNpcPlacements(npcs) {
  const aliases = {
    'David-O': 'DavidO',
    'André': 'Andre',
    'Piero': 'Piero',
    'Luas': 'Luas',
    'Pachi': 'Pachi',
    'Gonchi': 'Gonchi',
    'Nahuel': 'Nahuel',
    'Luchito': 'Luchito',
    'Dante': 'Dante',
    'Brisa': 'Brisa',
    'Roberto': 'Roberto',
    'Deyna': 'Deyna',
    'Dayana': 'Dayana',
    'Andrea': 'Andrea',
    'Dan': 'Dan',
    'Chrys': 'Chrys',
    'Tamara': 'Tamara',
    'Gabriela': 'Gabriela',
    'Fabiana': 'Fabiana',
    'Paulo': 'Paulo',
    'Claudia': 'Claudia',
    'Alessandro': 'Alessandro',
    'Alexandro': 'Alexandro',
    'Luis': 'Luis',
    'Nicole': 'Nicole',
  };
  npcs.forEach((npc) => {
    const placement = findPlacement(aliases[npc.nm] || npc.nm);
    if (!placement) return;
    npc.x = placement.x;
    npc.y = placement.y;
  });
}

// Aplica tiles de acceso al terreno ya generado. Las cuevas son tile 9,
// torre tile 12 y puerta exterior del castillo tile 11.
function applyExpandedWorldPoints(wMap) {
  const put = (point, tile) => {
    if (wMap[point.y]?.[point.x] !== undefined) wMap[point.y][point.x] = tile;
  };
  put(EXPANDED_WORLD_POINTS.caves.cave1.exterior, 9);
  put(EXPANDED_WORLD_POINTS.caves.cave2.exterior, 9);
  put(EXPANDED_WORLD_POINTS.tower.exterior, 12);
  put(EXPANDED_WORLD_POINTS.castle.exterior, 11);
}

export {
  EXPANDED_SPAWN,
  applyExpandedNpcPlacements,
  applyExpandedWorldPoints,
};
