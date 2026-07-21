// C1.5a-1: contrato espacial del próximo mundo ampliado.
// Aún no sustituye el mapa activo: C1.5a-2 aplicará estas coordenadas junto
// con el generador para evitar dejar una versión jugable a medio migrar.
const EXPANDED_WORLD = { cols: 120, rows: 300, tileSize: 32 };

// Sur → norte. Los límites son fijos; solo la decoración secundaria variará.
const EXPANDED_REGION_BANDS = [
  { id: 'pitch', rMin: 270, rMax: 299, xMin: 8, xMax: 111 },
  { id: 'route1', rMin: 230, rMax: 269, xMin: 5, xMax: 114 },
  { id: 'storyboard', rMin: 200, rMax: 229, xMin: 10, xMax: 109 },
  { id: 'route2', rMin: 160, rMax: 199, xMin: 5, xMax: 114 },
  { id: 'rodaje', rMin: 130, rMax: 159, xMin: 12, xMax: 107 },
  { id: 'route3', rMin: 100, rMax: 129, xMin: 5, xMax: 114 },
  { id: 'ultimatoma', rMin: 70, rMax: 99, xMin: 10, xMax: 109 },
  { id: 'route4', rMin: 40, rMax: 69, xMin: 5, xMax: 114 },
  { id: 'montaje', rMin: 18, rMax: 39, xMin: 12, xMax: 107 },
  { id: 'route5', rMin: 8, rMax: 17, xMin: 20, xMax: 99 },
  { id: 'castle', rMin: 2, rMax: 7, xMin: 40, xMax: 79 },
];

// Anclas para C1.5a-2. No son posiciones activas todavía.
const EXPANDED_ANCHORS = {
  pitch: { x: 44, y: 282, riverX: 82, mill: { x: 61, y: 278, w: 5, h: 9 } },
  storyboard: { x: 44, y: 212 },
  rodaje: { x: 49, y: 142 },
  ultimatoma: { x: 42, y: 82 },
  montaje: { x: 47, y: 25 },
  castle: { x: 55, y: 4 },
};

function getExpandedBandAt(row) {
  return EXPANDED_REGION_BANDS.find((band) => row >= band.rMin && row <= band.rMax) || null;
}
function validateExpandedLayout() {
  const ids = new Set();
  for (const band of EXPANDED_REGION_BANDS) {
    if (ids.has(band.id)) return false;
    ids.add(band.id);
    if (band.rMin < 0 || band.rMax >= EXPANDED_WORLD.rows || band.rMin > band.rMax) return false;
  }
  return true;
}
export { EXPANDED_WORLD, EXPANDED_REGION_BANDS, EXPANDED_ANCHORS, getExpandedBandAt, validateExpandedLayout };
