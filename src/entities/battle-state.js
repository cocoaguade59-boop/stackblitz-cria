// Estados de batalla globales (STATUS, battleState) y helpers de daño.
// `battleState` se exporta como instancia mutable compartida.
// Depende de tEff.

import { tEff } from '../data/types.js';

// === ESTADOS DE BATALLA ===
const STATUS = {
  burn:     { nm: 'Quemado',     icon: '🔥', dmg: 0.07, turns: 5 },
  paralyze: { nm: 'Paralizado',  icon: '⚡', skipChance: 0.25 },
  sleep:    { nm: 'Dormido',     icon: '💤', turns: 2 },
  confuse:  { nm: 'Confuso',     icon: '💫', selfHitChance: 0.33, turns: 4 },
  leech:    { nm: 'Drenadoras',  icon: '🌱', dmg: 0.05, turns: 5 },
  curse:    { nm: 'Maldito',     icon: '💀', dmg: 0.12, turns: 5 },
  poison:   { nm: 'Envenenado',  icon: '☠️', dmg: 0.06, turns: 5 },
};

let battleState = {
  weather: null,
  weatherTurns: 0,
  playerStatus: null,
  playerStatusTurns: 0,
  enemyStatus: null,
  enemyStatusTurns: 0,
  playerStatMods: { atk: 0, def: 0, spd: 0 },
  enemyStatMods: { atk: 0, def: 0, spd: 0 },
  lastDmgToPlayer: 0,
  lastDmgToEnemy: 0,
  playerProtect: false,
  enemyProtect: false,
  playerShield: false,
  enemyShield: false,
  wishHealNext: false,
  learnMoveQueue: null,
};

function resetBattleState() {
  battleState = {
    weather: null,
    weatherTurns: 0,
    playerStatus: null,
    playerStatusTurns: 0,
    enemyStatus: null,
    enemyStatusTurns: 0,
    playerStatMods: { atk: 0, def: 0, spd: 0 },
    enemyStatMods: { atk: 0, def: 0, spd: 0 },
    lastDmgToPlayer: 0,
    lastDmgToEnemy: 0,
    playerProtect: false,
    enemyProtect: false,
    playerShield: false,
    enemyShield: false,
    wishHealNext: false,
    learnMoveQueue: null,
  };
}

function getModdedStat(base, mod) {
  const mults = [0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const idx = Math.max(0, Math.min(12, mod + 6));
  return Math.floor(base * mults[idx]);
}

function cDmg(a, d, m, isPlayer = true) {
  if (m.pw === 0) return { dmg: 0, crit: false, eff: 1 };
  // Check de precisión
  const acc = m.acc || 100;
  if (acc < 100 && Math.random() * 100 > acc) {
    return { dmg: 0, crit: false, eff: 1, missed: true };
  }
  if (m.ef === 'fixedDmg') return { dmg: m.pw, crit: false, eff: 1 };

  const e = tEff(m.tp, d.tp);
  const s = m.tp === a.tp ? 1.5 : 1;
  const r = 0.85 + Math.random() * 0.15;

  const critChance = m.ef === 'highCrit' ? 0.25 : 0.1;
  const crit = Math.random() < critChance;
  const critMult = crit ? 1.5 : 1;

  const atkMods = isPlayer
    ? battleState.playerStatMods
    : battleState.enemyStatMods;
  const defMods = isPlayer
    ? battleState.enemyStatMods
    : battleState.playerStatMods;
  const atkStat = getModdedStat(a.ak, atkMods.atk);
  const defStat = getModdedStat(d.df, defMods.def);

  let weatherMult = 1;
  if (battleState.weather === 'sun' && m.tp === 'fire') weatherMult = 1.5;
  if (battleState.weather === 'rain' && m.tp === 'water') weatherMult = 1.5;
  if (battleState.weather === 'fairy' && m.tp === 'fairy') weatherMult = 1.5;
  if (battleState.weather === 'sun' && m.tp === 'water') weatherMult = 0.5;
  if (battleState.weather === 'rain' && m.tp === 'fire') weatherMult = 0.5;

  const desperateMult = a.hp / a.mHp < 0.2 ? 1.3 : 1;

  let shieldMult = 1;
  if (isPlayer && battleState.enemyShield) {
    shieldMult = 0.5;
    battleState.enemyShield = false;
  }
  if (!isPlayer && battleState.playerShield) {
    shieldMult = 0.5;
    battleState.playerShield = false;
  }

  const lvFactor = (2 * a.lv) / 5 + 2;
  const raw = (lvFactor * m.pw * (atkStat / Math.max(1, defStat))) / 50 + 2;
  const dmg = Math.max(
    1,
    Math.floor(
      raw * s * e * r * critMult * weatherMult * desperateMult * shieldMult
    )
  );

  return { dmg, crit, eff: e };
}


export { STATUS, battleState, resetBattleState, getModdedStat, cDmg };
