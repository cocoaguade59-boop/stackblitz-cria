// Borrador local C1.5a-2d — puntos especiales del mundo 120×300.
// Aún no está conectado al generador ni subido a GitHub.

const EXPANDED_WORLD_POINTS = {
  caves: {
    cave1: {
      name: 'Cueva Volcánica',
      exterior: { x: 34, y: 174 },
      return: { x: 34, y: 175 },
      region: 'route2',
    },
    cave2: {
      name: 'Cueva Cristalina',
      exterior: { x: 89, y: 54 },
      return: { x: 89, y: 55 },
      region: 'route4',
    },
  },
  tower: {
    name: 'Torre P.A.',
    exterior: { x: 94, y: 13 },
    return: { x: 94, y: 14 },
    region: 'route5',
  },
  castle: {
    name: 'Castillo Difusión',
    exterior: { x: 60, y: 8 },
    return: { x: 60, y: 9 },
    region: 'castle',
  },
  proaStations: [
    { leader: 'tamara', from: 'storyboard', to: 'rodaje', x: 60, y: 199 },
    { leader: 'luchito', from: 'rodaje', to: 'ultimatoma', x: 60, y: 129 },
    { leader: 'andrea', from: 'ultimatoma', to: 'montaje', x: 60, y: 69 },
    { leader: 'dan', from: 'montaje', to: 'castle', x: 60, y: 17 },
  ],
};

export { EXPANDED_WORLD_POINTS };
