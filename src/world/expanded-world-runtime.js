// Conecta los datos C1.5a-2d/2e al mundo ampliado.
import { EXPANDED_WORLD_POINTS } from './expanded-world-points.js';
import { EXPANDED_NPC_PLACEMENTS, EXPANDED_SPAWN } from './expanded-npc-placements.js';

/** Consume una colocación por nombre. La primera llamada devuelve la de la
 *  primera región, la segunda la de la segunda, etc. Así NPCs repetidos
 *  (Luas en 5 pueblos, David-O en 3) reciben cada uno la posición correcta. */
function consumePlacement(name) {
  const regions = Object.keys(EXPANDED_NPC_PLACEMENTS);
  for (const region of regions) {
    const placements = EXPANDED_NPC_PLACEMENTS[region];
    if (placements[name]) {
      const p = placements[name];
      delete placements[name]; // consumir — no reusar
      return p;
    }
  }
  return null;
}

function applyExpandedNpcPlacements(npcs) {
  // Clonar placements para no mutar el original permanentemente
  const saved = {};
  for (const region of Object.keys(EXPANDED_NPC_PLACEMENTS)) {
    saved[region] = { ...EXPANDED_NPC_PLACEMENTS[region] };
  }

  const aliases = {
    'David-O': 'DavidO', 'André': 'Andre', 'Piero': 'Piero',
    'Luas': 'Luas', 'Pachi': 'Pachi', 'Gonchi': 'Gonchi',
    'Nahuel': 'Nahuel', 'Luchito': 'Luchito', 'Dante': 'Dante',
    'Brisa': 'Brisa', 'Roberto': 'Roberto', 'Deyna': 'Deyna',
    'Dayana': 'Dayana', 'Andrea': 'Andrea', 'Dan': 'Dan',
    'Chrys': 'Chrys', 'Tamara': 'Tamara', 'Gabriela': 'Gabriela',
    'Fabiana': 'Fabiana', 'Paulo': 'Paulo', 'Claudia': 'Claudia',
    'Alessandro': 'Alessandro', 'Alexandro': 'Alexandro',
    'Luis': 'Luis', 'Nicole': 'Nicole',
  };

  npcs.forEach((npc) => {
    const key = aliases[npc.nm] || npc.nm;
    const placement = consumePlacement(key);
    if (!placement) return;
    npc.x = placement.x;
    npc.y = placement.y;
  });

  // Restaurar placements para la próxima gen
  for (const region of Object.keys(saved)) {
    EXPANDED_NPC_PLACEMENTS[region] = saved[region];
  }
}

// Aplica tiles de acceso al terreno ya generado.
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
