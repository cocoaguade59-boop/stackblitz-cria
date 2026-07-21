// Fuente de verdad para regiones, rangos de nivel e identidad futura.
// Los sistemas de música y ecología ampliarán estos datos en fases posteriores.
const REGIONS = {
  pitch: { name: 'Aldea Pitch', kind: 'village', levels: { min: 2, max: 5 }, theme: 'pitch', habitats: ['water', 'plant', 'fighting'] },
  route1: { name: 'Ruta 1', kind: 'route', levels: { min: 4, max: 7 }, theme: 'route', habitats: ['plant', 'water', 'fighting'] },
  storyboard: { name: 'Villa Storyboard', kind: 'village', levels: { min: 8, max: 11 }, theme: 'storyboard', mainNpc: 'Gabriela', proa: 'tamara', mission: 'gabrielaScene', habitats: ['fairy', 'steel', 'plant', 'water'] },
  route2: { name: 'Ruta 2', kind: 'route', levels: { min: 10, max: 14 }, theme: 'route', habitats: ['plant', 'fire', 'steel'] },
  rodaje: { name: 'Cantera Rodaje', kind: 'village', levels: { min: 14, max: 18 }, theme: 'rodaje', mainNpc: 'Dante', proa: 'luchito', mission: 'danteCollapse', habitats: ['fire', 'fighting', 'steel', 'dragon'] },
  route3: { name: 'Ruta 3', kind: 'route', levels: { min: 18, max: 22 }, theme: 'route', habitats: ['fire', 'dragon', 'steel'] },
  ultimatoma: { name: 'Feria Última Toma', kind: 'village', levels: { min: 22, max: 26 }, theme: 'ultimatoma', mainNpc: 'Pachi', proa: 'andrea', mission: 'lastTake', habitats: ['fairy', 'water', 'dragon'] },
  route4: { name: 'Ruta 4', kind: 'route', levels: { min: 26, max: 31 }, theme: 'route', habitats: ['water', 'fairy', 'plant'] },
  montaje: { name: 'Prados Montaje', kind: 'village', levels: { min: 31, max: 36 }, theme: 'montaje', mainNpc: 'Chrys', proa: 'dan', mission: 'finalCut', habitats: ['plant', 'fairy', 'normal'] },
  route5: { name: 'Ruta 5', kind: 'route', levels: { min: 36, max: 40 }, theme: 'route', habitats: ['dragon', 'steel', 'normal'] },
  cave1: { name: 'Cueva Volcánica', kind: 'cave', levels: { min: 10, max: 16 }, theme: 'cave', habitats: ['fire', 'dragon', 'steel'] },
  cave2: { name: 'Cueva Cristalina', kind: 'cave', levels: { min: 26, max: 34 }, theme: 'cave', habitats: ['water', 'fairy', 'dragon'] },
  castle: { name: 'Castillo Difusión', kind: 'castle', levels: { min: 40, max: 45 }, theme: 'castle', habitats: [] },
  tower: { name: 'Torre P.A.', kind: 'tower', levels: { min: 45, max: 58 }, theme: 'tower', habitats: [] },
};

// Reservas ambientales: hacen visibles Lucha y Acero antes de incorporar especies.
// No alimentan pools de encuentros hasta que existan criaturas reales de esos tipos.
const TYPE_RESERVES = [
  { id: 'pitch-training', type: 'fighting', x: 27, y: 132, region: 'route1', label: 'Patio Comunitario de Ensayo', stage: 'early' },
  { id: 'storyboard-props', type: 'steel', x: 48, y: 111, region: 'storyboard', label: 'Taller de Utilería Proa', stage: 'early' },
  { id: 'rodaje-yard', type: 'fighting', x: 47, y: 84, region: 'rodaje', label: 'Patio de Ensayo de Cantera', stage: 'advanced' },
  { id: 'rodaje-rails', type: 'steel', x: 65, y: 84, region: 'rodaje', label: 'Taller de Rieles y Utilería', stage: 'advanced' },
];

const WORLD_LEVEL_ZONES = [
  { id: 'pitch', rMin: 270, rMax: 299 }, { id: 'route1', rMin: 230, rMax: 269 },
  { id: 'storyboard', rMin: 200, rMax: 229 }, { id: 'route2', rMin: 160, rMax: 199 },
  { id: 'rodaje', rMin: 130, rMax: 159 }, { id: 'route3', rMin: 100, rMax: 129 },
  { id: 'ultimatoma', rMin: 70, rMax: 99 }, { id: 'route4', rMin: 40, rMax: 69 },
  { id: 'montaje', rMin: 18, rMax: 39 }, { id: 'route5', rMin: 8, rMax: 17 },
].map((zone) => ({ ...zone, nm: REGIONS[zone.id].name, ...REGIONS[zone.id].levels }));

const SPECIAL_MAP_LEVELS = Object.fromEntries(
  ['cave1', 'cave2', 'castle', 'tower'].map((id) => [id, { id, nm: REGIONS[id].name, ...REGIONS[id].levels }])
);

export { REGIONS, TYPE_RESERVES, WORLD_LEVEL_ZONES, SPECIAL_MAP_LEVELS };
