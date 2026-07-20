// Contratos de las misiones regionales. Las fases F–K implementarán su mecánica.
const ROUTE_MISSIONS = {
  luisBridge: { id: 'luisBridge', owner: 'Luis', region: 'pitch', title: 'El puente de los primeros pasos', mechanic: 'terrain-reading', worldChange: 'pitch-riverside-bridge' },
  gabrielaScene: { id: 'gabrielaScene', owner: 'Gabriela', region: 'storyboard', title: 'La escena perdida', mechanic: 'visual-composition', worldChange: 'storyboard-panels', proaLeader: 'tamara' },
  danteCollapse: { id: 'danteCollapse', owner: 'Dante', region: 'rodaje', title: 'El derrumbe del segundo acto', mechanic: 'route-choice', worldChange: 'cave-corridor' },
  lastTake: { id: 'lastTake', owner: 'Pachi', region: 'ultimatoma', title: 'La última toma', mechanic: 'dialogue-choice', worldChange: 'ultimatoma-stage', proaLeader: 'andrea' },
  finalCut: { id: 'finalCut', owner: 'Chrys', region: 'montaje', title: 'El corte final', mechanic: 'final-approach', worldChange: 'castle-approach', proaLeader: 'dan' },
};

// Coordenadas y líder asociado. La Fase B añadirá estación, señalización y estado visual.
const ROUTE_GATE_DEFINITIONS = [
  { from: 'storyboard', leader: 'tamara', x: 40, y: 104, w: 11, place: 'Villa Storyboard' },
  { from: 'rodaje', leader: 'luchito', x: 54, y: 76, w: 11, place: 'Cantera Rodaje' },
  { from: 'ultimatoma', leader: 'andrea', x: 30, y: 46, w: 11, place: 'Feria Última Toma' },
  { from: 'montaje', leader: 'dan', x: 44, y: 16, w: 11, place: 'Prados Montaje' },
];

export { ROUTE_MISSIONS, ROUTE_GATE_DEFINITIONS };
