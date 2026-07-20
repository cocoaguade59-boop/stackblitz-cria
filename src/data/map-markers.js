// Marcadores visibles y carteles del mundo. La Fase B añadirá estado de permisos Proa.
const MAP_LOCATIONS = [
  { x: 20, y: 143, nm: 'Aldea Pitch', col: '#E84040' }, { x: 40, y: 110, nm: 'V.Storyboard', col: '#40A0E0' },
  { x: 54, y: 82, nm: 'Cantera Rodaje', col: '#E8A030' }, { x: 30, y: 52, nm: 'Ult.Toma', col: '#40C040' },
  { x: 44, y: 22, nm: 'P.Montaje', col: '#D860A8' }, { x: 38, y: 8, nm: 'Cast.Difusión', col: '#C8A830' },
  { x: 15, y: 105, nm: 'C.Volcánica', col: '#E06030' }, { x: 65, y: 38, nm: 'C.Cristalina', col: '#80A0E0' },
  { x: 55, y: 6, nm: 'Torre P.A.', col: '#F060F0' },
];
const ROUTE_SIGNS = [
  { x: 20, y: 138, name: 'Cartel Aldea Pitch', lines: ['↑ Ruta 1 / Villa Storyboard', '↓ Aldea Pitch', 'Habla con Alexandro para más info.'] },
  { x: 36, y: 115, name: 'Cartel Ruta 1', lines: ['↑ Villa Storyboard', '↓ Aldea Pitch', 'Los Proa bloquean rutas sin diploma.'] },
  { x: 50, y: 104, name: 'Cartel Ruta 2', lines: ['↑ Cantera Rodaje', '↓ Villa Storyboard', '← Cueva Volcánica'] },
  { x: 64, y: 76, name: 'Cartel Ruta 3', lines: ['↑ Feria Última Toma', '↓ Cantera Rodaje', 'Piero suele explorar por aquí.'] },
  { x: 31, y: 47, name: 'Cartel Ruta 4', lines: ['↑ Prados Montaje', '↓ Feria Última Toma', '→ Cueva Cristalina'] },
  { x: 43, y: 16, name: 'Cartel Ruta 5', lines: ['↑ Castillo Difusión', '↓ Prados Montaje', 'La torre abre en post-game.'] },
  { x: 14, y: 107, name: 'Cartel Cueva', lines: ['Cueva Volcánica', 'Se oyen ecos de punk antiguo.', 'Dicen que una pared busca dragones.'] },
  { x: 71, y: 40, name: 'Cartel Cueva', lines: ['Cueva Cristalina', 'Al fondo vive SaloGon.', 'No todos los recuerdos son monstruos.'] },
];
export { MAP_LOCATIONS, ROUTE_SIGNS };
