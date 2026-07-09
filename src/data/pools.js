// Pools de criaturas por tipo (para captura aleatoria).
// Datos puros, sin dependencias.
let captureCount = {};

const POOLS = {
  fire: ['flameye', 'flamingo', 'emberwing', 'salamandro', 'blaztoro'],
  water: ['axolotl', 'medusync', 'pinzardo', 'pingueson', 'peztronauta'],
  plant: ['ivygoat', 'gorilan', 'orquidea', 'thornbuck', 'raizan'],
  dragon: ['wyvern', 'eastern', 'ornispia', 'serpentdrg', 'gusarix'],
  fairy: ['pixie', 'sidhe', 'spritefly', 'elefantasy', 'zumbaflor'],
};

export { POOLS };
