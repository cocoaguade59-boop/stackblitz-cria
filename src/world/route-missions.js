// Contratos de las misiones regionales. Las fases F–K implementarán su mecánica.
const ROUTE_MISSIONS = {
  luisBridge: { id: 'luisBridge', owner: 'Luis', region: 'pitch', title: 'El puente de los primeros pasos', mechanic: 'terrain-reading', worldChange: 'pitch-riverside-bridge' },
  gabrielaScene: { id: 'gabrielaScene', owner: 'Gabriela', region: 'storyboard', title: 'La escena perdida', mechanic: 'visual-composition', worldChange: 'storyboard-panels', proaLeader: 'tamara' },
  danteCollapse: { id: 'danteCollapse', owner: 'Dante', region: 'rodaje', title: 'El derrumbe del segundo acto', mechanic: 'route-choice', worldChange: 'cave-corridor' },
  lastTake: { id: 'lastTake', owner: 'Pachi', region: 'ultimatoma', title: 'La última toma', mechanic: 'dialogue-choice', worldChange: 'ultimatoma-stage', proaLeader: 'andrea' },
  finalCut: { id: 'finalCut', owner: 'Chrys', region: 'montaje', title: 'El corte final', mechanic: 'final-approach', worldChange: 'castle-approach', proaLeader: 'dan' },
};

// Puestos Proa: un único origen para bloqueo, señalización, mapa y diálogo.
// Pitch → Storyboard es intencionalmente libre y por ello no tiene puesto de diploma.
const ROUTE_PROA_STATIONS = [
  { from: 'storyboard', to: 'rodaje', leader: 'tamara', proaName: 'Tamara', diploma: 'Fotografía Estética', x: 40, y: 104, w: 11, place: 'Villa Storyboard' },
  { from: 'rodaje', to: 'ultimatoma', leader: 'luchito', proaName: 'Luchito', diploma: 'Documental', x: 54, y: 76, w: 11, place: 'Cantera Rodaje' },
  { from: 'ultimatoma', to: 'montaje', leader: 'andrea', proaName: 'Andrea', diploma: 'Ficción', x: 30, y: 46, w: 11, place: 'Feria Última Toma' },
  { from: 'montaje', to: 'castle', leader: 'dan', proaName: 'Dan', diploma: 'Publicidad', x: 44, y: 16, w: 11, place: 'Prados Montaje' },
];

const ROUTE_GATE_DEFINITIONS = ROUTE_PROA_STATIONS;
const getRouteStation = (from) => ROUTE_PROA_STATIONS.find((station) => station.from === from) || null;
const isRouteAuthorized = (from, diplomas) => {
  if (from === 'pitch') return true;
  const station = getRouteStation(from);
  return !station || diplomas[station.leader] === true;
};
const getRecommendedStation = (diplomas) => ROUTE_PROA_STATIONS.find((station) => !isRouteAuthorized(station.from, diplomas)) || null;

export { ROUTE_MISSIONS, ROUTE_PROA_STATIONS, ROUTE_GATE_DEFINITIONS, getRouteStation, isRouteAuthorized, getRecommendedStation };
