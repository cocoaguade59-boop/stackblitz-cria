// Borrador local C1.5b-1 — sistema base de interiores medievales.
// Aún no está conectado a game.js ni subido.

const INTERIOR_TILES = {
  floor: 40,
  wall: 41,
  door: 42,
  table: 43,
  bed: 44,
  hearth: 45,
  shelf: 46,
  proaDesk: 47,
};

const BUILDINGS = {
  pitch_home_1: {
    id: 'pitch_home_1',
    kind: 'home',
    region: 'pitch',
    exterior: { x: 48, y: 278, door: { x: 50, y: 281 } },
    exit: { map: 'world', x: 50, y: 282, d: 0 },
    title: 'Casa de Aldea Pitch',
    size: { cols: 12, rows: 9 },
    style: 'pitch',
  },
  pitch_mill: {
    id: 'pitch_mill',
    kind: 'mill',
    region: 'pitch',
    exterior: { x: 61, y: 278, door: { x: 63, y: 286 } },
    exit: { map: 'world', x: 63, y: 287, d: 0 },
    title: 'Molino de Aldea Pitch',
    size: { cols: 16, rows: 14 },
    style: 'mill',
    futureMission: 'luisBridge',
  },
  storyboard_proa: {
    id: 'storyboard_proa',
    kind: 'proa',
    region: 'storyboard',
    exterior: { x: 60, y: 208, door: { x: 60, y: 211 } },
    exit: { map: 'world', x: 60, y: 212, d: 0 },
    title: 'Casa Proa de Tamara',
    size: { cols: 18, rows: 12 },
    style: 'proa',
    leader: 'tamara',
  },
};

function createInteriorMap(building) {
  const { cols, rows } = building.size;
  const map = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      r === 0 || r === rows - 1 || c === 0 || c === cols - 1
        ? INTERIOR_TILES.wall
        : INTERIOR_TILES.floor
    )
  );
  const doorX = Math.floor(cols / 2);
  map[rows - 1][doorX] = INTERIOR_TILES.door;

  // Decoración base de vivienda medieval.
  map[2][2] = INTERIOR_TILES.hearth;
  map[2][cols - 3] = INTERIOR_TILES.shelf;
  map[rows - 3][2] = INTERIOR_TILES.bed;
  map[Math.floor(rows / 2)][Math.floor(cols / 2) - 1] = INTERIOR_TILES.table;

  if (building.kind === 'proa') {
    map[2][Math.floor(cols / 2)] = INTERIOR_TILES.proaDesk;
    map[2][Math.floor(cols / 2) - 1] = INTERIOR_TILES.proaDesk;
    map[2][Math.floor(cols / 2) + 1] = INTERIOR_TILES.proaDesk;
    map[3][2] = INTERIOR_TILES.shelf;
    map[3][cols - 3] = INTERIOR_TILES.shelf;
  }
  return map;
}

function getInteriorSpawn(building) {
  return { x: Math.floor(building.size.cols / 2), y: building.size.rows - 3, d: 3 };
}

function getBuildingAtDoor(x, y) {
  return Object.values(BUILDINGS).find((building) =>
    building.exterior.door.x === x && building.exterior.door.y === y
  ) || null;
}

export { INTERIOR_TILES, BUILDINGS, createInteriorMap, getInteriorSpawn, getBuildingAtDoor };
