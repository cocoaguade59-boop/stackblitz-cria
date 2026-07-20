// Sistema de tipos: efectividad, colores, emojis, nombres.
// Datos puros, sin dependencias.
// === TIPOS ===
function tEff(a, d) {
  // Tabla cerrada de afinidades del Reino. Las combinaciones no listadas
  // hacen daño neutral (x1).
  const chart = {
    normal: { steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, plant: 2, dragon: 0.5, fairy: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, plant: 0.5, dragon: 0.5, steel: 0.5 },
    plant: { fire: 0.5, water: 2, plant: 0.5, dragon: 0.5, steel: 0.5 },
    dragon: { fire: 0.5, water: 0.5, plant: 0.5, dragon: 2, fairy: 0, steel: 0.5 },
    fairy: { fire: 0.5, dragon: 2, fighting: 2, steel: 0.5 },
    fighting: { normal: 2, fairy: 0.5, steel: 2 },
    steel: { fire: 0.5, water: 0.5, fairy: 2, steel: 0.5 },
  };
  return chart[a]?.[d] ?? 1;
}

function tCol(t) {
  return (
    {
      fire: '#E04030',
      water: '#3888E0',
      plant: '#48A038',
      dragon: '#6838A0',
      fairy: '#D860A8',
      normal: '#A8A878',
      ice: '#70C8E8',
      ground: '#C09050',
      fighting: '#C85038',
      electric: '#E8C830',
      psychic: '#E85888',
      dark: '#584838',
      steel: '#A8A8C0',
      poison: '#A040A0',
      bug: '#90A820',
      rock: '#B8A038',
      ghost: '#705898',
    }[t] || '#888'
  );
}
function tColL(t) {
  return (
    {
      fire: '#F88060',
      water: '#70B8F8',
      plant: '#80D068',
      dragon: '#A070D8',
      fairy: '#F098C8',
      normal: '#C8C8A0',
      ice: '#A8E8F8',
      ground: '#E0B878',
      fighting: '#E87058',
      electric: '#F8E070',
      psychic: '#F878A8',
      dark: '#887060',
      steel: '#D0D0E0',
      poison: '#C070C0',
      bug: '#B8C850',
      rock: '#D0B860',
      ghost: '#9078B8',
    }[t] || '#BBB'
  );
}
function tEmo(t) {
  return (
    {
      fire: '🔥',
      water: '💧',
      plant: '🌿',
      dragon: '🐉',
      fairy: '🧚',
      normal: '⚔️',
      ice: '❄️',
      ground: '⛰️',
      fighting: '🥊',
      electric: '⚡',
      psychic: '🔮',
      dark: '🌑',
      steel: '🛡️',
      poison: '☠️',
      bug: '🐞',
      rock: '🪨',
      ghost: '👻',
    }[t] || '⚔️'
  );
}
function tNam(t) {
  return (
    {
      fire: 'FUEGO',
      water: 'AGUA',
      plant: 'PLANTA',
      dragon: 'DRAGÓN',
      fairy: 'HADA',
      normal: 'NORMAL',
      ice: 'HIELO',
      ground: 'TIERRA',
      fighting: 'LUCHA',
      electric: 'ELÉCTRICO',
      psychic: 'PSÍQUICO',
      dark: 'SINIESTRO',
      steel: 'ACERO',
      poison: 'VENENO',
      bug: 'BICHO',
      rock: 'ROCA',
      ghost: 'FANTASMA',
    }[t] || 'NORMAL'
  );
}


export { tEff, tCol, tColL, tEmo, tNam };
