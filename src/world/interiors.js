// C1.5b-1 — Sistema de interiores conectado al runtime.
// Define edificios entrables con posiciones reales (coincidentes con hubs de genWorld).
// Exporta funciones para crear mapas, detectar puertas, controlar sólidos y tracking.

// ─── CONSTANTES DE TILES INTERIORES ────────────────────────────────
const IT = {
  floor: 40,
  wall: 41,
  door: 42,
  table: 43,
  bed: 44,
  hearth: 45,
  shelf: 46,
  proaDesk: 47,
  chair: 48,
  rug: 49,
  barrel: 50,
  grainSack: 51,
  millWheel: 52,
  mapTable: 53,
  diplomaShelf: 54,
  creatureStorage: 55,
};

// ─── EDIFICIOS REGISTRADOS ─────────────────────────────────────────
// Cada edificio tiene:
//  - exterior: bounding box aproximado del edificio en el mundo
//  - door: tile ABAJO del edificio donde el jugador se para para entrar
//  - exit: coordenadas de retorno al mundo tras salir
//  - size: dimensiones del mapa interior
//  - style: variante visual
// Las coordenadas coinciden con los hubs de genExpandedTerrainC15a2b:
//   Pitch en cx=60,cy=285 genera edificios en [48,278],[68,278],[48,289],[68,289]
const BUILDINGS = {
  pitch_home_1: {
    id: 'pitch_home_1',
    kind: 'home',
    region: 'pitch',
    exterior: { x: 48, y: 278, w: 4, h: 3 },
    door: { x: 50, y: 281 },          // tile de camino justo debajo del edificio
    exit: { map: 'world', x: 50, y: 282, d: 0 },
    title: 'Casa de Aldea Pitch',
    size: { cols: 12, rows: 9 },
    style: 'pitch',
  },
  pitch_home_2: {
    id: 'pitch_home_2',
    kind: 'home',
    region: 'pitch',
    exterior: { x: 68, y: 278, w: 4, h: 3 },
    door: { x: 70, y: 281 },
    exit: { map: 'world', x: 70, y: 282, d: 0 },
    title: 'Casa de Aldea Pitch',
    size: { cols: 12, rows: 9 },
    style: 'pitch',
  },
  pitch_mill: {
    id: 'pitch_mill',
    kind: 'mill',
    region: 'pitch',
    exterior: { x: 48, y: 289, w: 4, h: 3 },
    door: { x: 50, y: 292 },
    exit: { map: 'world', x: 50, y: 293, d: 0 },
    title: 'Molino de Aldea Pitch',
    size: { cols: 16, rows: 14 },
    style: 'mill',
    futureMission: 'luisBridge',
  },
  pitch_home_4: {
    id: 'pitch_home_4',
    kind: 'home',
    region: 'pitch',
    exterior: { x: 68, y: 289, w: 4, h: 3 },
    door: { x: 70, y: 292 },
    exit: { map: 'world', x: 70, y: 293, d: 0 },
    title: 'Casa de Aldea Pitch',
    size: { cols: 12, rows: 9 },
    style: 'pitch',
  },
  storyboard_proa: {
    id: 'storyboard_proa',
    kind: 'proa',
    region: 'storyboard',
    exterior: { x: 48, y: 208, w: 4, h: 3 },
    door: { x: 50, y: 211 },
    exit: { map: 'world', x: 50, y: 212, d: 0 },
    title: 'Casa Proa de Tamara',
    size: { cols: 18, rows: 12 },
    style: 'proa',
    leader: 'tamara',
  },
};

// ─── PALETAS DE ESTILO POR REGIÓN (C1.5b-3) ──────────────────────
// Cada estilo define colores de pared, piso, madera y acentos
const STYLE_PALETTE = {
  pitch: {
    wallDark: '#5A5448', wallMid: '#6A6458', wallLight: '#5E584C',
    floorA: '#C8A870', floorB: '#D4B880', woodGrain: '#B89860',
    woodDark: '#5A3820', woodMid: '#8B6040', woodLight: '#9B7050',
    accent: '#D8B840', rugBase: '#B83838', rugAccent: '#C84848',
  },
  storyboard: {
    wallDark: '#4A5460', wallMid: '#5A6470', wallLight: '#4E5864',
    floorA: '#B8B0C0', floorB: '#C8C0D0', woodGrain: '#A098B0',
    woodDark: '#4A3860', woodMid: '#6A5080', woodLight: '#8A68A0',
    accent: '#C880D0', rugBase: '#4058A0', rugAccent: '#5070B8',
  },
  rodaje: {
    wallDark: '#5A5040', wallMid: '#6A6050', wallLight: '#5E5444',
    floorA: '#A89880', floorB: '#B8A890', woodGrain: '#988870',
    woodDark: '#5A4830', woodMid: '#8A7060', woodLight: '#A08870',
    accent: '#E88030', rugBase: '#604030', rugAccent: '#805040',
  },
  feria: {
    wallDark: '#3A3050', wallMid: '#4A4060', wallLight: '#3E3454',
    floorA: '#C0A8B0', floorB: '#D0B8C0', woodGrain: '#A898A0',
    woodDark: '#4A2840', woodMid: '#7A3860', woodLight: '#A04880',
    accent: '#E8C830', rugBase: '#602050', rugAccent: '#803870',
  },
  montaje: {
    wallDark: '#5A5A62', wallMid: '#6A6A72', wallLight: '#5E5E66',
    floorA: '#C0C0C8', floorB: '#D0D0D8', woodGrain: '#B0B0B8',
    woodDark: '#5A5A60', woodMid: '#8A8A90', woodLight: '#A8A8B0',
    accent: '#88C0E8', rugBase: '#486880', rugAccent: '#6088A0',
  },
  mill: {
    wallDark: '#4A4030', wallMid: '#5A5040', wallLight: '#4E4434',
    floorA: '#B89868', floorB: '#C8A878', woodGrain: '#A88858',
    woodDark: '#4A3010', woodMid: '#7A5828', woodLight: '#A07840',
    accent: '#D8A030', rugBase: '#683818', rugAccent: '#885028',
  },
  proa: {
    wallDark: '#3A3A4A', wallMid: '#4A4A5A', wallLight: '#3E3E4E',
    floorA: '#C8C0B0', floorB: '#D8D0C0', woodGrain: '#B8B0A0',
    woodDark: '#3A2A1A', woodMid: '#6A4A3A', woodLight: '#8A6A5A',
    accent: '#C8A830', rugBase: '#303850', rugAccent: '#485068',
  },
};

function getStylePalette(building) {
  // Si el kind tiene paleta específica, úsala; sino usa la región
  const key = STYLE_PALETTE[building.kind] ? building.kind : building.style || building.region || 'pitch';
  return STYLE_PALETTE[key] || STYLE_PALETTE.pitch;
}

// ─── SÓLIDOS INTERIORES ────────────────────────────────────────────
const INTERIOR_SOLID = new Set([
  IT.wall, IT.table, IT.bed, IT.hearth, IT.shelf,
  IT.proaDesk, IT.chair, IT.barrel, IT.grainSack,
  IT.millWheel, IT.mapTable, IT.diplomaShelf, IT.creatureStorage,
]);

function isInteriorSolid(tile) {
  return INTERIOR_SOLID.has(tile);
}

// ─── CREAR MAPA INTERIOR ───────────────────────────────────────────
function createInteriorMap(building) {
  const { cols, rows } = building.size;
  const map = [];
  for (let r = 0; r < rows; r++) {
    map[r] = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        map[r][c] = IT.wall;
      } else {
        map[r][c] = IT.floor;
      }
    }
  }
  // Puerta abajo al centro
  const doorX = Math.floor(cols / 2);
  map[rows - 1][doorX] = IT.door;

  // Decoración base de vivienda medieval
  const midC = Math.floor(cols / 2);
  const midR = Math.floor(rows / 2);

  map[2][2] = IT.hearth;
  map[2][cols - 3] = IT.shelf;
  map[rows - 3][2] = IT.bed;
  map[midR][midC] = IT.table;
  map[midR][midC - 2] = IT.chair;
  map[midR][midC + 2] = IT.chair;

  // Alfombra central
  if (cols > 6 && rows > 6) {
    for (let c = midC - 2; c <= midC + 2; c++) {
      for (let r = midR - 1; r <= midR + 1; r++) {
        if (map[r][c] === IT.floor) map[r][c] = IT.rug;
      }
    }
    map[midR][midC] = IT.table; // restaurar mesa sobre alfombra
  }

  if (building.kind === 'mill') {
    // Rueda de molino en esquina superior derecha
    map[2][cols - 3] = IT.millWheel;
    map[2][cols - 4] = IT.millWheel;
    map[3][cols - 3] = IT.millWheel;
    map[3][cols - 4] = IT.millWheel;
    // Sacos de grano
    map[rows - 3][cols - 4] = IT.grainSack;
    map[rows - 3][cols - 3] = IT.grainSack;
    map[rows - 4][cols - 3] = IT.grainSack;
    // Barriles
    map[3][3] = IT.barrel;
    map[3][4] = IT.barrel;
  }

  if (building.kind === 'proa') {
    // Escritorio Proa en la pared norte
    map[2][midC - 1] = IT.proaDesk;
    map[2][midC] = IT.proaDesk;
    map[2][midC + 1] = IT.proaDesk;
    // Estanterías laterales con diplomas
    map[3][2] = IT.shelf;
    map[3][cols - 3] = IT.diplomaShelf;
    map[4][2] = IT.shelf;
    map[4][cols - 3] = IT.diplomaShelf;
    // Mesa de mapas
    map[rows - 4][midC - 2] = IT.mapTable;
    map[rows - 4][midC - 1] = IT.mapTable;
    map[rows - 4][midC] = IT.mapTable;
    // Almacenamiento de criaturas
    map[rows - 3][cols - 4] = IT.creatureStorage;
  }

  return map;
}

// ─── SPAWN Y DETECCIÓN ─────────────────────────────────────────────
function getInteriorSpawn(building) {
  return {
    x: Math.floor(building.size.cols / 2),
    y: building.size.rows - 2,
    d: 3,
  };
}

/** Busca edificio cuya puerta esté en la posición dada (tile desde donde se entra). */
function getBuildingAtDoor(x, y) {
  return Object.values(BUILDINGS).find(
    (b) => b.door.x === x && b.door.y === y
  ) || null;
}

/** Busca edificio que contenga el tile (c,r) como parte de su exterior (para saber si un tile 4 tiene edificio). */
function getBuildingAt(c, r) {
  return Object.values(BUILDINGS).find((b) => {
    const e = b.exterior;
    return c >= e.x && c < e.x + e.w && r >= e.y && r < e.y + e.h;
  }) || null;
}

// ─── TRACKING DE INTERIOR ACTIVO ───────────────────────────────────
let activeInterior = null; // { building, map, cols, rows }

function getActiveInterior() { return activeInterior; }
function setActiveInterior(v) { activeInterior = v; }

export {
  IT,
  BUILDINGS,
  STYLE_PALETTE,
  isInteriorSolid,
  createInteriorMap,
  getInteriorSpawn,
  getBuildingAtDoor,
  getBuildingAt,
  getStylePalette,
  getActiveInterior,
  setActiveInterior,
};
