// Datos del sistema de pines / fragmentos / cristales / fragancias / pergaminos.
// T3+T4: un pin da exactamente UN loot (roll único).

const FRAGRANCE_TYPES = ['picante', 'dulce', 'salada', 'amarga', 'saludable'];

const FRAGRANCE_LABELS = {
  picante: 'Fragancia picante',
  dulce: 'Fragancia dulce',
  salada: 'Fragancia salada',
  amarga: 'Fragancia amarga',
  saludable: 'Fragancia saludable',
};

// Mapeo lore → tipo de encuentro (para inciensos T6)
const FRAGRANCE_ENCOUNTER = {
  picante: 'fire',
  dulce: 'fairy',
  salada: 'water',
  amarga: 'dragon',
  saludable: 'plant',
};

const CRYSTAL_INFO = {
  p: {
    key: 'crv',
    label: 'Cristal Morado',
    short: 'Morado',
    color: '#9A4FE0',
    colorDark: '#5E1FA8',
    colorLight: '#E6B8FF',
    baseChance: 0.2,
    shopBase: 50,
    desc: 'Captura base 20%',
  },
  c: {
    key: 'crvC',
    label: 'Cristal Cian',
    short: 'Cian',
    color: '#30D0E0',
    colorDark: '#1088A0',
    colorLight: '#B8F8FF',
    baseChance: 0.35,
    shopBase: 150,
    desc: 'Captura base 35%',
  },
  o: {
    key: 'crvO',
    label: 'Cristal Naranja',
    short: 'Naranja',
    color: '#F09030',
    colorDark: '#A85810',
    colorLight: '#FFE0A8',
    baseChance: 0.45,
    shopBase: 250,
    desc: 'Captura base 45%',
  },
};

const FRAGMENT_LABELS = {
  p: 'Fragmento Morado',
  c: 'Fragmento Cian',
  o: 'Fragmento Naranja',
};

const SHOP_CRYSTALS = [
  { key: 'crv', code: 'p', nm: '💎 Cristal Morado', base: 50, desc: 'Captura base 20%' },
  { key: 'crvC', code: 'c', nm: '💠 Cristal Cian', base: 150, desc: 'Captura base 35%' },
  { key: 'crvO', code: 'o', nm: '🔶 Cristal Naranja', base: 250, desc: 'Captura base 45%' },
];

/**
 * Roll único de loot de un pin.
 * 50% fragmento · 30% fragancia · 20% pergamino.
 * Nunca devuelve dos cosas a la vez.
 * @param {boolean} inCave - usa tablas de cueva (y torre) vs mundo
 */
function rollPinLoot(inCave = false) {
  const r = Math.random();
  if (r < 0.5) {
    const r2 = Math.random();
    let color;
    if (inCave) {
      // cueva: morado 60%, cian 30%, naranja 10%
      color = r2 < 0.6 ? 'p' : r2 < 0.9 ? 'c' : 'o';
    } else {
      // mundo: morado 70%, cian 25%, naranja 5%
      color = r2 < 0.7 ? 'p' : r2 < 0.95 ? 'c' : 'o';
    }
    return { kind: 'fragment', color };
  }
  if (r < 0.8) {
    // 30% fragancia — tipo equiprobable
    const type = FRAGRANCE_TYPES[Math.floor(Math.random() * FRAGRANCE_TYPES.length)];
    return { kind: 'fragrance', type };
  }
  return { kind: 'scroll' };
}

function emptyFragrances() {
  return { picante: 0, dulce: 0, salada: 0, amarga: 0, saludable: 0 };
}

function emptyFragments() {
  return { p: 0, c: 0, o: 0 };
}

function totalCrystals(state) {
  return (state.crv || 0) + (state.crvC || 0) + (state.crvO || 0);
}

function hasAnyCrystal(state) {
  return totalCrystals(state) > 0;
}

function crystalCount(state, code) {
  const info = CRYSTAL_INFO[code];
  if (!info) return 0;
  return state[info.key] || 0;
}

function spendCrystal(state, code) {
  const info = CRYSTAL_INFO[code];
  if (!info || (state[info.key] || 0) <= 0) return false;
  state[info.key]--;
  return true;
}

function applyLootToInventory(state, loot) {
  if (!loot) return '';
  if (loot.kind === 'fragment') {
    if (!state.frag) state.frag = emptyFragments();
    state.frag[loot.color] = (state.frag[loot.color] || 0) + 1;
    return FRAGMENT_LABELS[loot.color] || 'Fragmento';
  }
  if (loot.kind === 'fragrance') {
    if (!state.fragrances) state.fragrances = emptyFragrances();
    state.fragrances[loot.type] = (state.fragrances[loot.type] || 0) + 1;
    return FRAGRANCE_LABELS[loot.type] || 'Fragancia';
  }
  if (loot.kind === 'scroll') {
    state.scrolls = (state.scrolls || 0) + 1;
    return 'Pergamino de Batalla';
  }
  return 'Objeto desconocido';
}

function lootRarity(loot) {
  if (!loot) return 'common';
  if (loot.kind === 'scroll') return 'rare';
  if (loot.kind === 'fragrance') return 'uncommon';
  if (loot.kind === 'fragment') {
    if (loot.color === 'o') return 'rare';
    if (loot.color === 'c') return 'uncommon';
    return 'common';
  }
  return 'common';
}

export {
  FRAGRANCE_TYPES,
  FRAGRANCE_LABELS,
  FRAGRANCE_ENCOUNTER,
  CRYSTAL_INFO,
  FRAGMENT_LABELS,
  SHOP_CRYSTALS,
  rollPinLoot,
  emptyFragrances,
  emptyFragments,
  totalCrystals,
  hasAnyCrystal,
  crystalCount,
  spendCrystal,
  applyLootToInventory,
  lootRarity,
};
