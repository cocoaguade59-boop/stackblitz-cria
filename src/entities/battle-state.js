// Estados de batalla globales (STATUS, battleState) y helpers de daño/stats.
// `battleState` se exporta como instancia mutable compartida.
// Depende de tEff.
//
// T11a–c: clamp ±6, reset al switch, SPD en turn order (vía getModdedStat).

import { tEff } from '../data/types.js';

// === ESTADOS DE BATALLA ===
const STATUS = {
  burn: { nm: 'Quemado', icon: '🔥', dmg: 0.07, turns: 5 },
  paralyze: { nm: 'Paralizado', icon: '⚡', skipChance: 0.25 },
  sleep: { nm: 'Dormido', icon: '💤', turns: 2 },
  confuse: { nm: 'Confuso', icon: '💫', selfHitChance: 0.33, turns: 4 },
  leech: { nm: 'Drenadoras', icon: '🌱', dmg: 0.05, turns: 5 },
  curse: { nm: 'Maldito', icon: '💀', dmg: 0.12, turns: 5 },
  poison: { nm: 'Envenenado', icon: '☠️', dmg: 0.06, turns: 5 },
};

const STAT_LABEL = { atk: 'Ataque', def: 'Defensa', spd: 'Velocidad' };
const STAT_KEYS = ['atk', 'def', 'spd'];
const STAGE_MIN = -6;
const STAGE_MAX = 6;

// Multiplicadores por stage -6..+6 (índice = mod + 6)
const STAGE_MULTS = [0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4];

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

function freshMods() {
  return { atk: 0, def: 0, spd: 0 };
}

function resetBattleState() {
  battleState = {
    weather: null,
    weatherTurns: 0,
    playerStatus: null,
    playerStatusTurns: 0,
    enemyStatus: null,
    enemyStatusTurns: 0,
    playerStatMods: freshMods(),
    enemyStatMods: freshMods(),
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

/** Reset mods del jugador al cambiar de criatura (entra en 0/0/0). */
function resetPlayerStatMods() {
  battleState.playerStatMods = freshMods();
  // Escudos/protect son del mon activo
  battleState.playerProtect = false;
  battleState.playerShield = false;
}

/** Reset mods del enemigo al cambiar de mon del rival. */
function resetEnemyStatMods() {
  battleState.enemyStatMods = freshMods();
  battleState.enemyProtect = false;
  battleState.enemyShield = false;
}

function getModdedStat(base, mod) {
  const idx = Math.max(0, Math.min(12, (mod || 0) + 6));
  return Math.floor(base * STAGE_MULTS[idx]);
}

/**
 * Aplica delta a un stat (atk|def|spd) de un lado.
 * Clamp estricto a ±6.
 *
 * @param {'player'|'enemy'} side
 * @param {'atk'|'def'|'spd'} stat
 * @param {number} delta  +1, +2, -1, -2...
 * @returns {{
 *   applied: number,   // cuánto se aplicó de verdad
 *   before: number,
 *   after: number,
 *   blocked: boolean,  // no se movió nada (ya en tope)
 *   capped: boolean,   // se aplicó menos de lo pedido por el tope
 *   msg: string,       // mensaje listo para UI
 * }}
 */
function applyStatMod(side, stat, delta) {
  const mods =
    side === 'player' ? battleState.playerStatMods : battleState.enemyStatMods;
  if (!mods || !STAT_KEYS.includes(stat) || !delta) {
    return {
      applied: 0,
      before: 0,
      after: 0,
      blocked: true,
      capped: false,
      msg: '',
    };
  }

  const before = mods[stat] || 0;
  const raw = before + delta;
  const after = Math.max(STAGE_MIN, Math.min(STAGE_MAX, raw));
  const applied = after - before;
  mods[stat] = after;

  const label = STAT_LABEL[stat] || stat.toUpperCase();
  const blocked = applied === 0;
  const capped = !blocked && applied !== delta;

  let msg = '';
  if (blocked) {
    msg =
      delta > 0
        ? `¡${label} no puede subir más!`
        : `¡${label} no puede bajar más!`;
  } else if (applied >= 2) {
    msg = `¡${label} subió mucho!`;
  } else if (applied === 1) {
    msg = `¡${label} subió!`;
  } else if (applied <= -2) {
    msg = `¡${label} bajó mucho!`;
  } else if (applied === -1) {
    msg = `¡${label} bajó!`;
  }
  // Si se capó, añadir nota corta
  if (capped && delta > 0) msg += ' (al máximo)';
  if (capped && delta < 0) msg += ' (al mínimo)';

  return { applied, before, after, blocked, capped, msg, stat, label };
}

/**
 * Aplica varios cambios y devuelve los mensajes no vacíos.
 * changes: Array<[stat, delta]>  ej. [['atk',1],['spd',1],['def',-1]]
 */
function applyStatMods(side, changes) {
  const msgs = [];
  const results = [];
  for (const [stat, delta] of changes) {
    const r = applyStatMod(side, stat, delta);
    results.push(r);
    if (r.msg) msgs.push(r.msg);
  }
  return { results, msgs, text: msgs.join(' ') };
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

export {
  STATUS,
  battleState,
  resetBattleState,
  resetPlayerStatMods,
  resetEnemyStatMods,
  getModdedStat,
  applyStatMod,
  applyStatMods,
  cDmg,
  STAT_LABEL,
  STAGE_MIN,
  STAGE_MAX,
};
