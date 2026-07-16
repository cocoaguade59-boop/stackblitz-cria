// Sistema de batalla completo: IA, captura, turnos, victoria/derrota y render.
//
// Callbacks inyectados desde script.js para funciones que cruzan fronteras:
//   _markNPCDefeated, _checkAllCaught, _resetRebattles,
//   _giveDiploma, _hasDiploma, _genTower,
//   _bossDialogues, _LEADER_MISSIONS

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { aP, aN, uP } from '../utils/particles.js';
import { tCol, tNam, tEmo, tEff } from '../data/types.js';
import { CDB } from '../data/creatures.js';
import { Cre } from '../entities/creature.js';
import { checkEvolution, evolveCre } from '../entities/evolution.js';
import { checkLearnMove } from '../entities/learn-pool.js';
import { ALL_MOVES } from '../data/moves.js';
import {
  STATUS, battleState, resetBattleState, getModdedStat, cDmg
} from '../entities/battle-state.js';
import { dCre } from '../render/creature-sprites.js';
import {
  dBattleBG, dBattleIntroBG,
} from '../render/battle-backgrounds.js';
import { dBattleHud } from '../render/battle-hud.js';
import { dTrainerBig } from '../render/trainer-big-sprites.js';
import {
  dBox, dBoxMenu, dDialogBox, wrapText
} from '../render/ui-boxes.js';
import { dMoveButton } from '../render/ui-type-icons.js';
import { dHP, dEXP } from '../render/ui-bars.js';
import { px, pixelGlow } from '../render/render-utils.js';
import { drawNotifications, drawParticles } from '../render/notifications-draw.js';
import {
  postGame, towerOpen, oloDefeated, pairBattles,
  npcDefeats, proa, captureCount, lastHealPos,
  setPostGame, setTowerOpen, setOloDefeated, setPairBattles,
} from '../core/game-flags.js';
import { castMap, CC, CR, KC, KR, WC, WR, T } from '../core/world-constants.js';
import { updateCamera } from '../core/camera.js';

// ============================================================
// CALLBACKS INYECTADOS (desde script.js en init())
// ============================================================

let _markNPCDefeated = null;
let _checkAllCaught = null;
let _resetRebattles = null;
let _giveDiploma = null;
let _hasDiploma = null;
let _genTower = null;
let _LEADER_MISSIONS = {};
let _bossDialogues = [];

export function setBattleCallbacks(cbs) {
  _markNPCDefeated = cbs.markNPCDefeated;
  _checkAllCaught = cbs.checkAllCaught;
  _resetRebattles = cbs.resetRebattles;
  _giveDiploma = cbs.giveDiploma;
  _hasDiploma = cbs.hasDiploma;
  _genTower = cbs.genTower;
  _LEADER_MISSIONS = cbs.LEADER_MISSIONS || {};
  _bossDialogues = cbs.bossDialogues || [];
}
// BLOQUE 17: SISTEMA DE BATALLA
// ============================================================

// ============================================================
// IA DE COMBATE INTELIGENTE
// ============================================================

function aiChooseMove(attacker, defender, battleInfo) {
  const available = attacker.mv.filter((m) => m.pp > 0);
  if (available.length === 0) return attacker.mv[0];
  if (available.length === 1) return available[0];
  let intelligence = 1;
  if (battleInfo.isNPC) intelligence = 2;
  if (battleInfo.isBoss || battleInfo.isPair) intelligence = 3;
  if (postGame && battleInfo.isNPC) intelligence = 3;
  if (intelligence === 1) return aiBasic(available, attacker, defender);
  if (intelligence === 2) return aiSmart(available, attacker, defender);
  return aiExpert(available, attacker, defender);
}

function aiBasic(moves, attacker, defender) {
  const scored = moves.map((m) => {
    let score = 50;
    if (m.pw > 0) score += m.pw;
    if (m.tp === attacker.tp) score += 15;
    if (m.pw > 0) {
      const eff = tEff(m.tp, defender.tp);
      if (eff > 1) score += 30;
      if (eff < 1) score -= 20;
    }
    score += Math.random() * 30;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].mv;
}

function aiSmart(moves, attacker, defender) {
  const hpR = attacker.hp / attacker.mHp;
  const dR = defender.hp / defender.mHp;
  const scored = moves.map((m) => {
    let score = 50;
    if (m.ef === 'heal' || m.ef === 'healAll') {
      if (hpR < 0.3) score += 120;
      else if (hpR < 0.5) score += 60;
      else score -= 40;
    }
    if (m.pw > 0) {
      score += m.pw * 0.8;
      if (m.tp === attacker.tp) score += 20;
      const e = tEff(m.tp, defender.tp);
      if (e > 1) score += 50;
      if (e < 1) score -= 30;
      if (dR < 0.25 && m.pw >= 30) score += 30;
      if (m.ef === 'priority' && dR < 0.3) score += 40;
    }
    if (m.ef === 'atkUp2' || m.ef === 'atkSpdUp' || m.ef === 'atkDefUp') {
      if (hpR > 0.6) score += 40;
      else score -= 20;
    }
    if (m.ef === 'sleep2' || m.ef === 'confuse20') {
      if (!battleState.playerStatus) score += 35;
      else score -= 30;
    }
    if (m.ef === 'drain50' || m.ef === 'drain25') {
      if (hpR < 0.5) score += 35;
      score += m.pw * 0.5;
    }
    if (m.ef === 'protect' || m.ef === 'shield1') {
      if (hpR < 0.4) score += 50;
      else score -= 10;
    }
    // Conservar PP: penalizar movimientos con pocos PP restantes
    if (m.pp <= 2 && m.pw > 0) score -= 15;
    if (m.pp <= 1) score -= 25;
    score += Math.random() * 20;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].mv;
}

function aiExpert(moves, attacker, defender) {
  const hpR = attacker.hp / attacker.mHp;
  const dR = defender.hp / defender.mHp;
  // Boss desesperado: más agresivo cuando tiene poca vida
  const desperate = hpR < 0.2;
  const scored = moves.map((m) => {
    let score = 50;
    if (m.ef === 'heal' || m.ef === 'healAll') {
      if (desperate) score += 200;
      else if (hpR < 0.4) score += 80;
      else if (hpR < 0.6) score += 30;
      else score -= 50;
    }
    if (m.pw > 0) {
      const e = tEff(m.tp, defender.tp);
      const s = m.tp === attacker.tp ? 1.5 : 1;
      const ed = m.pw * s * e;
      score += ed * (desperate ? 1.0 : 0.6);
      if (e > 1) score += 60;
      if (e < 1) score -= 40;
      if (ed * 1.5 > defender.hp) score += 80;
      if (m.ef === 'priority' && dR < 0.2) score += 70;
      if (m.ef === 'hitTwice') score += 20;
      if (m.ef === 'revenge' && battleState.lastDmgToEnemy > 0) score += 40;
      if (m.ef === 'reversal' && hpR < 0.3) score += 60;
    }
    if (m.ef === 'atkUp2' || m.ef === 'atkSpdUp') {
      if (hpR > 0.7 && battleState.enemyStatMods.atk < 2) score += 55;
      else if (hpR > 0.5) score += 30;
      else score -= 20;
    }
    if (m.ef === 'defUp2') {
      if (hpR > 0.5 && battleState.enemyStatMods.def < 2) score += 40;
      else score -= 15;
    }
    if (m.ef === 'sleep2') {
      if (!battleState.playerStatus && dR > 0.4) score += 50;
      else score -= 30;
    }
    if (m.ef === 'protect') {
      if (hpR < 0.3) score += 60;
      else score -= 20;
    }
    if (m.ef === 'drain50' || m.ef === 'drain25') {
      if (hpR < 0.5) score += 45;
      else score += 15;
    }
    if (m.ef === 'leech4') {
      if (!battleState.playerStatus && dR > 0.5) score += 50;
      else score -= 20;
    }
    if (m.ef === 'sunUp' && attacker.tp === 'fire' && !battleState.weather)
      score += 45;
    if (m.ef === 'rainUp' && attacker.tp === 'water' && !battleState.weather)
      score += 45;
    if (m.ef === 'fairyUp' && attacker.tp === 'fairy' && !battleState.weather)
      score += 45;
    if (m.ef === 'clearStatus' && battleState.enemyStatus) score += 60;
    const acc = m.acc || 100;
    if (acc < 100) score -= (100 - acc) * 0.3;
    // Conservar PP: penalizar movimientos con pocos PP
    if (m.pp <= 2 && m.pw > 0) score -= 10;
    if (m.pp <= 1) score -= 20;
    score += Math.random() * 10;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored.length > 1 && Math.random() < 0.1) return scored[1].mv;
  return scored[0].mv;
}

function pCre() {
  return G.party[G.bs.pi];
}

function calcCaptureChance(enemy) {
  const hpRatio = enemy.hp / enemy.mHp;
  const missingHp = 1 - hpRatio;
  let chance = 0.18 + missingHp * 0.52;

  // Estados alterados hacen que el Cristal Vínculo conecte mejor.
  const st = battleState.enemyStatus;
  if (st === 'sleep') chance += 0.18;
  else if (st === 'paralyze' || st === 'burn') chance += 0.1;
  else if (st === 'confuse') chance += 0.08;
  else if (st === 'leech' || st === 'curse') chance += 0.05;

  // Un rival muy por encima del promedio del equipo se resiste más.
  const lvDiff = enemy.lv - avgPartyLv();
  if (lvDiff > 0) chance -= Math.min(0.18, lvDiff * 0.015);
  if (G.party.some((c) => c.id === enemy.id) || proa.some((c) => c.id === enemy.id)) chance += 0.04;

  return clamp(chance, 0.08, 0.9);
}

function startCaptureAttempt() {
  const b = G.bs;
  G.crv--;
  const chance = calcCaptureChance(b.en);
  const roll = Math.random();
  const success = roll < chance;
  let shakes = 0;
  if (success) shakes = 3;
  else if (roll < chance + 0.18) shakes = 2;
  else if (roll < chance + 0.38) shakes = 1;

  b.cap = {
    tm: 0,
    chance,
    success,
    shakes,
    done: false,
    crystalY: 106,
  };
  b.msg = '¡Lanzaste un Cristal Vínculo!';
  b.ph = 'captureAnim';
  b.tm = 0;
  sfx.cap();
}

function finishCaptureAttempt() {
  const b = G.bs;
  if (!b.cap) return;
  if (b.cap.success) {
    b.msg = `¡Capturaste a ${b.en.nm}!`;
    const nc = new Cre(b.en.id, b.en.lv);
    nc.hp = b.en.hp;
    if (!captureCount[b.en.id]) captureCount[b.en.id] = 0;
    captureCount[b.en.id]++;
    if (G.party.length >= 6) {
      proa.push(nc);
      b.msg += ' ¡Enviado a Proa!';
    } else {
      G.party.push(nc);
    }
    _checkAllCaught();
    b.mq = [{ a: 'end' }];
    sfx.cap();
  } else {
    const shakeMsg = b.cap.shakes === 0 ? 'ni se movió' : b.cap.shakes === 1 ? 'tembló una vez' : 'tembló dos veces';
    b.msg = `¡${b.en.nm} escapó! El cristal ${shakeMsg}.`;
    b.mq = [{ a: 'eT' }];
    sfx.nef();
  }
  b.cap.done = true;
  b.ph = 'msg';
  b.tm = 0;
}

function uBattle() {
  const b = G.bs;
  b.af++;
  b.tm++;
  if (b.ps > 0) b.ps--;
  if (b.es > 0) b.es--;

  // === FASE INTRO NPC ===
  if (b.ph === 'npcIntro') {
    b.introTm++;
    if (!b.introFull) {
      if (b.introTm % 2 === 0) {
        b.introCi++;
        if (b.introCi >= b.npcIntro[b.introLine].length) b.introFull = true;
      }
    }
    if (kp(' ') || kp('Enter')) {
      if (!b.introFull) {
        b.introFull = true;
        b.introCi = b.npcIntro[b.introLine].length;
      } else {
        b.introLine++;
        b.introCi = 0;
        b.introFull = false;
        b.introTm = 0;
        if (b.introLine >= b.npcIntro.length) {
          b.ph = 'intro';
          b.tm = 0;
          sfx.sel();
        }
      }
    }
    return;
  }

  // === FASE INTRO NORMAL ===
  if (b.ph === 'intro') {
    if (b.tm > 50 || kp(' ') || kp('Enter')) {
      b.ph = 'act';
      b.tm = 0;
    }
    return;
  }

  // Marcar criatura como participante
  pCre().fought = true;
  if (!b.fought.includes(b.pi)) b.fought.push(b.pi);

  switch (b.ph) {
    // === ANIMACIÓN DE CAPTURA ===
    case 'captureAnim':
      {
        const total = 48 + (b.cap?.shakes || 0) * 28 + 28;
        if (kp(' ') || kp('Enter') || b.tm > total) finishCaptureAttempt();
      }
      break;

    // === SELECCIÓN DE ACCIÓN ===
    case 'act':
      if (kp('ArrowUp')) {
        b.ms = b.ms < 3 ? (b.ms + 3) % 6 : b.ms - 3;
        sfx.sel();
      }
      if (kp('ArrowDown')) {
        b.ms = b.ms < 3 ? (b.ms + 3) % 6 : b.ms - 3;
        sfx.sel();
      }
      if (kp('ArrowLeft')) {
        b.ms = (b.ms + 5) % 6;
        sfx.sel();
      }
      if (kp('ArrowRight')) {
        b.ms = (b.ms + 1) % 6;
        sfx.sel();
      }
      if (kp(' ') || kp('Enter')) {
        sfx.sel();
        switch (b.ms) {
          case 0: // Luchar
            b.ph = 'move';
            b.mvs = 0;
            break;
          case 1: // Poción
            if (G.pot > 0) {
              G.pot--;
              const heal = Math.floor(pCre().mHp * 0.2);
              pCre().heal(heal);
              sfx.heal();
              b.msg = `${pCre().nm} recuperó ${heal} HP!`;
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'eT' }];
            } else {
              b.msg = '¡Sin pociones!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 2: // Revivir
            if (G.rev > 0) {
              const fi = G.party.findIndex((c, i) => c.hp <= 0 && i !== b.pi);
              if (fi !== -1) {
                G.rev--;
                G.party[fi].hp = Math.floor(G.party[fi].mHp * 0.5);
                sfx.heal();
                b.msg = `¡${G.party[fi].nm} revivió!`;
                b.ph = 'msg';
                b.tm = 0;
                b.mq = [{ a: 'eT' }];
              } else {
                b.msg = 'Nadie caído.';
                b.ph = 'msg';
                b.tm = 0;
                b.mq = [];
              }
            } else {
              b.msg = '¡Sin revivir!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 3: // Cambiar
            if (G.party.filter((c) => c.hp > 0).length > 1) {
              b.ph = 'switch';
              b.ss = 0;
            } else {
              b.msg = '¡Solo tienes una!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 4: // Capturar
            if (b.isMerch || b.isBoss || b.npcTeam) {
              b.msg = '¡No puedes capturar aquí!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
              break;
            }
            if (G.crv > 0) {
              startCaptureAttempt();
            } else {
              b.msg = '¡Sin Cristales Vínculo!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 5: // Huir
            if (b.isBoss) {
              b.msg = '¡No puedes huir del Rey!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
              break;
            }
            if (b.isMerch) {
              G.scr = 'world';
              break;
            }
            const fleeChance = b.fleeChance ?? 0.6;
            if (Math.random() < fleeChance) {
              b.msg = '¡Huiste con éxito!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'end' }];
            } else {
              b.msg = '¡No pudiste escapar!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'eT' }];
            }
            break;
        }
      }
      break;

    // === SELECCIÓN DE MOVIMIENTO ===
    case 'move':
      {
        const c = pCre();
        if (kp('ArrowUp')) {
          b.mvs = b.mvs < 2 ? (b.mvs + 2) % 4 : b.mvs - 2;
          sfx.sel();
        }
        if (kp('ArrowDown')) {
          b.mvs = b.mvs < 2 ? (b.mvs + 2) % 4 : b.mvs - 2;
          sfx.sel();
        }
        if (kp('ArrowLeft')) {
          b.mvs = (b.mvs + 3) % 4;
          sfx.sel();
        }
        if (kp('ArrowRight')) {
          b.mvs = (b.mvs + 1) % 4;
          sfx.sel();
        }
        if (kp('x') || kp('Escape')) {
          b.ph = 'act';
        }
        if (kp(' ') || kp('Enter')) {
          const mv = c.mv[b.mvs];
          if (mv.pp > 0) execTurn(mv);
          else {
            b.msg = '¡Sin PP!';
            b.ph = 'msg';
            b.tm = 0;
            b.mq = [];
          }
        }
      }
      break;

    // === CAMBIAR CRIATURA ===
    case 'switch':
      if (kp('ArrowUp') || kp('ArrowLeft')) {
        b.ss = (b.ss + G.party.length - 1) % G.party.length;
        sfx.sel();
      }
      if (kp('ArrowDown') || kp('ArrowRight')) {
        b.ss = (b.ss + 1) % G.party.length;
        sfx.sel();
      }
      if (kp('x') || kp('Escape')) {
        b.ph = 'act';
      }
      if (kp(' ') || kp('Enter')) {
        if (b.ss !== b.pi && G.party[b.ss].hp > 0) {
          b.pi = b.ss;
          pCre().fought = true;
          if (!b.fought.includes(b.pi)) b.fought.push(b.pi);
          b.msg = `¡Adelante, ${pCre().nm}!`;
          b.ph = 'msg';
          b.tm = 0;
          b.mq = [{ a: 'eT' }];
        } else sfx.nef();
      }
      break;

    // === MENSAJE ===
    case 'msg':
      if (b.tm > 90 || kp(' ') || kp('Enter')) {
        if (b.mq.length > 0) {
          procAct(b.mq.shift());
        } else {
          // Fin del turno completo: limpiar flags de DoT para el próximo turno
          b.dotProcessed = null;
          if (b.en.hp <= 0) handleWin();
          else if (pCre().hp <= 0) handleFaint();
          else b.ph = 'act';
        }
        b.tm = 0;
      }
      break;

    // === VICTORIA ===
    case 'win':
      if (b.tm > 90 || kp(' ') || kp('Enter')) {
        if (b.mq.length > 0) {
          const n = b.mq.shift();
          if (n.a === 'lvl') {
            b.msg = n.m;
            b.tm = 0;
            sfx.lvl();
          } else if (n.a === 'evo') {
            const cre = G.party[n.creIdx];
            const oldName = cre.nm;
            b.evoData = { creIdx: n.creIdx, oldName, evoId: n.evoId };
            b.ph = 'evolve';
            b.tm = 0;
            b.evoPhase = 0;
            sfx.lvl();
          } else if (n.a === 'learn') {
            // Mostrar pantalla de aprender ataque
            b.learnData = n;
            b.ph = 'learnMove';
            b.tm = 0;
            b.learnSel = 0;
          } else if (n.a === 'bMsg') {
            b.msg = 'Navarrete: ' + n.m;
            b.tm = 0;
          } else if (n.a === 'bNext' && G.bossIdx < G.bossTeam.length) {
            b.en = G.bossTeam[G.bossIdx];
            b.msg = `¡${b.en.nm} entra en batalla!`;
            b.ph = 'msg';
            b.tm = 0;
            b.mq = [];
          } else if (n.a === 'npcNext') {
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'npcMsg') {
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'end') {
            if (b.npcData) _markNPCDefeated(b.npcData);
            if (b.npcData?.isPunk && postGame) {
              setOloDefeated(true);
              _resetRebattles();
            }
            resetBattleState();
            G.scr = 'world';
          }
        } else {
          resetBattleState();
          G.scr = 'world';
        }
      }
      break;

    // === EVOLUCIÓN ===
    case 'evolve':
      b.tm++;
      if (b.evoPhase === 0) {
        // Mostrar pregunta
        if (b.tm > 30 || kp(' ') || kp('Enter')) {
          b.evoPhase = 1;
          b.tm = 0;
          b.evoSel = 0;
        }
      } else if (b.evoPhase === 1) {
        // Selección sí/no
        if (
          kp('ArrowUp') ||
          kp('ArrowDown') ||
          kp('ArrowLeft') ||
          kp('ArrowRight')
        ) {
          b.evoSel = (b.evoSel + 1) % 2;
          sfx.sel();
        }
        if (kp(' ') || kp('Enter')) {
          sfx.sel();
          if (b.evoSel === 0) {
            // Sí evolucionar
            const cre = G.party[b.evoData.creIdx];
            const result = evolveCre(cre);
            if (result) {
              sfx.cap();
              b.msg = `¡${result.oldName} evolucionó a ${result.newName}!`;
              b.evoPhase = 2;
              b.tm = 0;
            } else {
              b.ph = 'win';
              b.tm = 0;
            }
          } else {
            // No evolucionar
            b.msg = `${b.evoData.oldName} no evolucionó.`;
            b.ph = 'win';
            b.tm = 0;
          }
        }
      } else if (b.evoPhase === 2) {
        // Mostrar resultado
        if (b.tm > 60 || kp(' ') || kp('Enter')) {
          b.ph = 'win';
          b.tm = 0;
        }
      }
      break;

    // === APRENDER ATAQUE ===
    case 'learnMove':
      {
        const ld = b.learnData;
        const cre = G.party[ld.creIdx];
        if (kp('ArrowUp')) {
          b.learnSel = (b.learnSel + 4) % 5;
          sfx.sel();
        }
        if (kp('ArrowDown')) {
          b.learnSel = (b.learnSel + 1) % 5;
          sfx.sel();
        }
        if (kp(' ') || kp('Enter')) {
          sfx.sel();
          if (b.learnSel < 4) {
            const oldName = cre.mv[b.learnSel].nm;
            cre.mv[b.learnSel] = { ...ld.move };
            b.msg = `¡${cre.nm} olvidó ${oldName} y aprendió ${ld.move.nm}!`;
            b.ph = 'win';
            b.tm = 0;
          } else {
            b.msg = `${cre.nm} no aprendió ${ld.move.nm}.`;
            b.ph = 'win';
            b.tm = 0;
          }
        }
        if (kp('x') || kp('Escape')) {
          b.msg = `${cre.nm} no aprendió ${ld.move.nm}.`;
          b.ph = 'win';
          b.tm = 0;
        }
      }
      break;

    // === DERROTA ===
    case 'defeat':
      if (b.tm > 50 || kp(' ') || kp('Enter')) {
        G.party.forEach((c) => c.full());
        resetBattleState();
        // Volver al último curandero
        G.pl.x = lastHealPos.x;
        G.pl.y = lastHealPos.y;
        G.curMap = lastHealPos.map;
        // Actualizar cámara según mapa
        if (G.curMap === 'world') updateCamera(WC, WR);
        else if (G.curMap.startsWith('cave')) updateCamera(CC, CR);
        else if (G.curMap === 'castle') updateCamera(KC, KR);
        else if (G.curMap === 'tower') updateCamera(TWC, TWR);
        G.scr = 'world';
        aN('Volviste al último curandero...');
      }
      break;
  }
}

// === EJECUCIÓN DE TURNOS ===
function execTurn(mv) {
  const b = G.bs,
    c = pCre();
  b.mq = [];
  // El más rápido va primero
  if (c.sp >= b.en.sp) {
    b.mq.push({ a: 'pA', mv }, { a: 'cE' }, { a: 'eT' });
  } else {
    b.mq.push({ a: 'eT' }, { a: 'cP' }, { a: 'pA', mv });
  }
  procAct(b.mq.shift());
}

function procAct(act) {
  const b = G.bs,
    c = pCre();

  if (act.a === 'pA') {
    const mv = act.mv;
    mv.pp--;
    const isPlayer = true;

    // Protección
    if (battleState.enemyProtect && mv.pw > 0) {
      battleState.enemyProtect = false;
      b.msg = `¡${b.en.nm} se protegió!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Parálisis check
    if (battleState.playerStatus === 'paralyze' && Math.random() < 0.25) {
      b.msg = `¡${c.nm} está paralizado y no puede moverse!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    // Sueño check
    if (battleState.playerStatus === 'sleep') {
      if (battleState.playerStatusTurns > 0) {
        battleState.playerStatusTurns--;
        b.msg = `¡${c.nm} está dormido!`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      } else {
        battleState.playerStatus = null;
        b.msg = `¡${c.nm} despertó!`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
    }
    // Confusión check
    if (battleState.playerStatus === 'confuse' && Math.random() < 0.33) {
      const selfDmg = Math.max(1, Math.floor(c.mHp * 0.1));
      c.hp = Math.max(0, c.hp - selfDmg);
      b.ps = 10;
      b.msg = `¡${c.nm} se hirió por confusión! -${selfDmg}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Efectos de soporte (sin daño)
    if (mv.ef === 'heal') {
      const h = Math.floor(c.mHp * 0.35);
      c.heal(h);
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! +${h}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    if (mv.ef === 'healAll') {
      G.party.forEach((p) => {
        if (p.hp > 0) p.heal(Math.floor(p.mHp * 0.2));
      });
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! ¡Equipo curado!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    if (mv.ef === 'spdUp') {
      battleState.playerStatMods.spd++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Velocidad subió!`;
    }
    if (mv.ef === 'atkUp2') {
      battleState.playerStatMods.atk += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Ataque subió mucho!`;
    }
    if (mv.ef === 'spdUp2') {
      battleState.playerStatMods.spd += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Velocidad subió mucho!`;
    }
    if (mv.ef === 'defUp2') {
      battleState.playerStatMods.def += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Defensa subió mucho!`;
    }
    if (mv.ef === 'atkSpdUp') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.spd++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y SPD subieron!`;
    }
    if (mv.ef === 'atkDefUp') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.def++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y DEF subieron!`;
    }
    if (mv.ef === 'atkSpdUpDefDn') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.spd++;
      battleState.playerStatMods.def--;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y SPD suben, DEF baja!`;
    }
    if (mv.ef === 'protect') {
      battleState.playerProtect = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Se protege!`;
    }
    if (mv.ef === 'shield1') {
      battleState.playerShield = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Escama protectora activa!`;
    }
    if (mv.ef === 'sunUp') {
      battleState.weather = 'sun';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡El sol brilla con fuerza!`;
    }
    if (mv.ef === 'rainUp') {
      battleState.weather = 'rain';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Empieza a llover!`;
    }
    if (mv.ef === 'fairyUp') {
      battleState.weather = 'fairy';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Campo mágico activo!`;
    }
    if (mv.ef === 'healField3') {
      battleState.weather = 'flower';
      battleState.weatherTurns = 3;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Flores curan cada turno!`;
    }
    if (mv.ef === 'leech4') {
      battleState.enemyStatus = 'leech';
      battleState.enemyStatusTurns = 5;
      sfx.sel();
      b.msg = `¡${b.en.nm} ha sido infectada con Drenadoras!`;
    }
    if (mv.ef === 'sleep2') {
      battleState.enemyStatus = 'sleep';
      battleState.enemyStatusTurns = 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡${b.en.nm} se durmió!`;
    }
    if (mv.ef === 'clearStatus') {
      battleState.playerStatus = null;
      battleState.playerStatusTurns = 0;
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! ¡Estados limpiados!`;
    }
    if (mv.ef === 'wishHeal') {
      battleState.wishHealNext = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Deseo activado para el próximo turno!`;
    }
    if (mv.ef === 'curse') {
      const cost = Math.floor(c.mHp * 0.5);
      c.hp = Math.max(1, c.hp - cost);
      battleState.enemyStatus = 'curse';
      battleState.enemyStatusTurns = 5;
      sfx.nef();
      b.msg = `${c.nm}: ${mv.nm}! ¡Sacrificó ${cost}HP para maldecir!`;
    }
    if (mv.ef === 'accDn') {
      battleState.enemyStatMods.spd--;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Precisión rival bajó!`;
    }

    // Si es efecto puro sin daño, terminar
    if (mv.pw === 0) {
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Ataques con daño
    const result = cDmg(c, b.en, mv, true);
    if (result.missed) {
      b.msg = `¡${c.nm}: ${mv.nm} falló!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    let dm = result.dmg;
    const ef = result.eff;

    // Mision de Luchito: contar golpes super efectivos
    if (ef > 1 && !result.missed) {
      _LEADER_MISSIONS.luchito.superEffectiveHits++;
      if (_LEADER_MISSIONS.luchito.superEffectiveHits === 3) {
        aN('¡Mision de Luchito completada! (3 golpes super efectivos)');
      }
    }

    // Doble golpe
    if (mv.ef === 'hitTwice') {
      dm = dm * 2;
      b.msg = `${c.nm}: ${mv.nm}! x2 ¡-${dm}HP!`;
    }
    // Venganza (doble si recibió daño)
    else if (mv.ef === 'revenge' && battleState.lastDmgToPlayer > 0) {
      dm = dm * 2;
      b.msg = `${c.nm}: ${mv.nm}! ¡VENGANZA! -${dm}HP`;
    }
    // Inversión (más daño con menos HP)
    else if (mv.ef === 'reversal') {
      const hpRatio = 1 - c.hp / c.mHp;
      dm = Math.max(1, Math.floor(dm * (1 + hpRatio * 2)));
      b.msg = `${c.nm}: ${mv.nm}! -${dm}HP`;
    } else {
      let em = '';
      if (result.crit) em += ' ¡CRÍTICO!';
      if (ef > 1) {
        em += ' ¡Súper efectivo!';
        sfx.sup();
      } else if (ef < 1) {
        em += ' Poco efectivo...';
        sfx.nef();
      } else sfx.atk();
      b.msg = `${c.nm}: ${mv.nm}! -${dm}HP${em}`;
    }

    b.en.hp = Math.max(0, b.en.hp - dm);
    b.es = 10;
    battleState.lastDmgToEnemy = dm;
    for (let i = 0; i < 5; i++)
      aP(380 + Math.random() * 40, 100 + Math.random() * 40, tCol(mv.tp));

    // Efectos secundarios post-daño
    if (mv.ef === 'burn20' && Math.random() < 0.2 && !battleState.enemyStatus) {
      battleState.enemyStatus = 'burn';
      battleState.enemyStatusTurns = 5;
      b.msg += ` ¡${b.en.nm} se quemó!`;
    }
    if (
      mv.ef === 'paralyze20' &&
      Math.random() < 0.2 &&
      !battleState.enemyStatus
    ) {
      battleState.enemyStatus = 'paralyze';
      battleState.enemyStatusTurns = 5;
      b.msg += ` ¡${b.en.nm} paralizado!`;
    }
    if (
      mv.ef === 'confuse20' &&
      Math.random() < 0.2 &&
      !battleState.enemyStatus
    ) {
      battleState.enemyStatus = 'confuse';
      battleState.enemyStatusTurns = 4;
      b.msg += ` ¡${b.en.nm} confuso!`;
    }
    if (mv.ef === 'flinch20' && Math.random() < 0.2) {
      b.msg += ` ¡${b.en.nm} retrocedió!`;
    }
    if (mv.ef === 'flinch15' && Math.random() < 0.15) {
      b.msg += ` ¡${b.en.nm} retrocedió!`;
    }
    if (mv.ef === 'spdDn30' && Math.random() < 0.3) {
      battleState.enemyStatMods.spd--;
      b.msg += ` ¡SPD rival bajó!`;
    }
    if (mv.ef === 'atkDn30' && Math.random() < 0.3) {
      battleState.enemyStatMods.atk--;
      b.msg += ` ¡ATK rival bajó!`;
    }
    if (mv.ef === 'atkDn50' && Math.random() < 0.5) {
      battleState.enemyStatMods.atk--;
      b.msg += ` ¡ATK rival bajó!`;
    }
    if (mv.ef === 'defDn') {
      battleState.enemyStatMods.def--;
      b.msg += ` ¡DEF rival bajó!`;
    }
    if (mv.ef === 'atkDn') {
      battleState.enemyStatMods.atk--;
      b.msg += ` ¡ATK rival bajó!`;
    }
    if (mv.ef === 'selfDefDn') {
      battleState.playerStatMods.def--;
      b.msg += ` ¡Tu DEF bajó!`;
    }
    if (mv.ef === 'selfSpdDn') {
      battleState.playerStatMods.spd--;
      b.msg += ` ¡Tu SPD bajó!`;
    }
    if (mv.ef === 'spdUp') {
      battleState.playerStatMods.spd++;
      b.msg += ` ¡Tu SPD subió!`;
    }
    if (mv.ef === 'drain50') {
      const heal = Math.floor(dm * 0.5);
      c.heal(heal);
      b.msg += ` +${heal}HP drenado!`;
    }
    if (mv.ef === 'drain25') {
      const heal = Math.floor(dm * 0.25);
      c.heal(heal);
      b.msg += ` +${heal}HP drenado!`;
    }

    // Contraataque (15% chance)
    if (dm > 0 && b.en.hp > 0 && Math.random() < 0.15) {
      const counterDmg = Math.max(1, Math.floor(dm * 0.5));
      c.hp = Math.max(0, c.hp - counterDmg);
      b.ps = 5;
      b.msg += ` ¡Contraataque! -${counterDmg}HP`;
    }

    b.ph = 'msg';
    b.tm = 0;
  } else if (act.a === 'eT') {
    if (b.en.hp <= 0) {
      if (b.mq.length > 0) procAct(b.mq.shift());
      return;
    }

    // ========== DoT de fin de turno ==========
    // Aplicamos como máximo UN tick de DoT del enemigo Y UN tick del jugador.
    // Cada uno usa `dotDone` para NO re-aplicarse en la misma pasada de eT.
    // Los mensajes se muestran en secuencia gracias a b.mq (cola de acciones).
    //
    // IMPORTANTE: NO encolamos más `eT`. Los DoT restantes vendrán en los
    // turnos siguientes, no en el mismo turno.

    // Init flags de "ya procesado en este turno"
    if (!b.dotProcessed) b.dotProcessed = {};

    // --- DoT del ENEMIGO ---
    if (
      !b.dotProcessed.enemy &&
      battleState.enemyStatus === 'burn' &&
      battleState.enemyStatusTurns > 0
    ) {
      const bd = Math.max(1, Math.floor(b.en.mHp * 0.07));
      b.en.hp = Math.max(0, b.en.hp - bd);
      battleState.enemyStatusTurns--;
      if (battleState.enemyStatusTurns <= 0) battleState.enemyStatus = null;
      b.dotProcessed.enemy = true;
      b.msg = `¡${b.en.nm} sufre quemadura! -${bd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      // Encolar otro eT para procesar el DoT del jugador después
      b.mq.unshift({ a: 'eT' });
      if (b.en.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.enemy &&
      battleState.enemyStatus === 'leech' &&
      battleState.enemyStatusTurns > 0
    ) {
      const ld = Math.max(1, Math.floor(b.en.mHp * 0.05));
      b.en.hp = Math.max(0, b.en.hp - ld);
      c.hp = Math.min(c.mHp, c.hp + ld);
      battleState.enemyStatusTurns--;
      if (battleState.enemyStatusTurns <= 0) battleState.enemyStatus = null;
      b.dotProcessed.enemy = true;
      b.msg = `¡El movimiento Drenadoras restó salud a tu rival y te la da a ti! -${ld} / +${ld}HP`;
      b.ph = 'msg';
      b.tm = 0;
      b.mq.unshift({ a: 'eT' });
      if (b.en.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.enemy &&
      battleState.enemyStatus === 'curse' &&
      battleState.enemyStatusTurns > 0
    ) {
      const cd = Math.max(1, Math.floor(b.en.mHp * 0.12));
      b.en.hp = Math.max(0, b.en.hp - cd);
      battleState.enemyStatusTurns--;
      if (battleState.enemyStatusTurns <= 0) battleState.enemyStatus = null;
      b.dotProcessed.enemy = true;
      b.msg = `¡Maldición! ${b.en.nm} -${cd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      b.mq.unshift({ a: 'eT' });
      if (b.en.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.enemy &&
      battleState.enemyStatus === 'poison' &&
      battleState.enemyStatusTurns > 0
    ) {
      const pd = Math.max(1, Math.floor(b.en.mHp * 0.06));
      b.en.hp = Math.max(0, b.en.hp - pd);
      battleState.enemyStatusTurns--;
      if (battleState.enemyStatusTurns <= 0) battleState.enemyStatus = null;
      b.dotProcessed.enemy = true;
      b.msg = `¡Veneno! ${b.en.nm} -${pd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      b.mq.unshift({ a: 'eT' });
      if (b.en.hp <= 0) return;
      return;
    }

    // --- DoT del JUGADOR ---
    if (
      !b.dotProcessed.player &&
      battleState.playerStatus === 'burn' &&
      battleState.playerStatusTurns > 0
    ) {
      const bd = Math.max(1, Math.floor(c.mHp * 0.07));
      c.hp = Math.max(0, c.hp - bd);
      battleState.playerStatusTurns--;
      if (battleState.playerStatusTurns <= 0) battleState.playerStatus = null;
      b.dotProcessed.player = true;
      b.msg = `¡${c.nm} sufre quemadura! -${bd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (c.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.player &&
      battleState.playerStatus === 'leech' &&
      battleState.playerStatusTurns > 0
    ) {
      const ld = Math.max(1, Math.floor(c.mHp * 0.05));
      c.hp = Math.max(0, c.hp - ld);
      b.en.hp = Math.min(b.en.mHp, b.en.hp + ld);
      battleState.playerStatusTurns--;
      if (battleState.playerStatusTurns <= 0) battleState.playerStatus = null;
      b.dotProcessed.player = true;
      b.msg = `¡Drenadoras te restó salud y se la dio a tu rival! -${ld} / +${ld}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (c.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.player &&
      battleState.playerStatus === 'curse' &&
      battleState.playerStatusTurns > 0
    ) {
      const cd = Math.max(1, Math.floor(c.mHp * 0.12));
      c.hp = Math.max(0, c.hp - cd);
      battleState.playerStatusTurns--;
      if (battleState.playerStatusTurns <= 0) battleState.playerStatus = null;
      b.dotProcessed.player = true;
      b.msg = `¡Maldición! ${c.nm} -${cd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (c.hp <= 0) return;
      return;
    }
    if (
      !b.dotProcessed.player &&
      battleState.playerStatus === 'poison' &&
      battleState.playerStatusTurns > 0
    ) {
      const pd = Math.max(1, Math.floor(c.mHp * 0.06));
      c.hp = Math.max(0, c.hp - pd);
      battleState.playerStatusTurns--;
      if (battleState.playerStatusTurns <= 0) battleState.playerStatus = null;
      b.dotProcessed.player = true;
      b.msg = `¡Veneno! ${c.nm} -${pd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (c.hp <= 0) return;
      return;
    }

    // Al terminar todos los DoT: limpiar flags para el próximo turno
    b.dotProcessed = null;

    // Deseo curación
    if (battleState.wishHealNext) {
      const wh = Math.floor(c.mHp * 0.5);
      c.heal(wh);
      battleState.wishHealNext = false;
      sfx.heal();
    }

    // Campo de flores
    if (battleState.weather === 'flower') {
      const fh = Math.floor(c.mHp * 0.1);
      c.heal(fh);
    }

    // Clima countdown
    if (battleState.weatherTurns > 0) {
      battleState.weatherTurns--;
      if (battleState.weatherTurns <= 0) battleState.weather = null;
    }

    // NPC usa poción si tiene poca vida (solo NPCs, no salvajes)
    if (
      b.isNPC &&
      b.en.hp > 0 &&
      b.en.hp / b.en.mHp < 0.25 &&
      Math.random() < 0.4
    ) {
      const maxPots = b.isBoss ? 7 : 2;
      if (!b.npcPotsUsed) b.npcPotsUsed = 0;
      if (b.npcPotsUsed < maxPots) {
        b.npcPotsUsed++;
        const healAmt = Math.floor(b.en.mHp * 0.3);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + healAmt);
        sfx.heal();
        b.msg = `¡${b.npcName || 'Rival'} usó una poción! (${
          b.npcPotsUsed
        }/${maxPots}) ${b.en.nm} +${healAmt}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }

      const healAmt = Math.floor(b.en.mHp * 0.3);
      b.en.hp = Math.min(b.en.mHp, b.en.hp + healAmt);
      sfx.heal();
      b.msg = `¡${b.npcName || 'Rival'} usó una poción! ${
        b.en.nm
      } +${healAmt}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Turno enemigo con IA inteligente
    const mv = aiChooseMove(b.en, pCre(), b);
    mv.pp--;

    if (mv.pw === 0) {
      // Aplicar efectos de estado del enemigo
      if (mv.ef === 'heal') {
        const h = Math.floor(b.en.mHp * 0.35);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + h);
        sfx.heal();
        b.msg = `${b.en.nm}: ${mv.nm}! +${h}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
      if (mv.ef === 'healAll') {
        const h = Math.floor(b.en.mHp * 0.35);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + h);
        sfx.heal();
        b.msg = `${b.en.nm}: ${mv.nm}! +${h}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
      if (mv.ef === 'atkUp2') {
        battleState.enemyStatMods.atk += 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK subió mucho!`;
      }
      if (mv.ef === 'spdUp' || mv.ef === 'spdUp2') {
        battleState.enemyStatMods.spd += mv.ef === 'spdUp2' ? 2 : 1;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡SPD subió!`;
      }
      if (mv.ef === 'defUp2') {
        battleState.enemyStatMods.def += 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡DEF subió mucho!`;
      }
      if (mv.ef === 'atkSpdUp') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.spd++;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y SPD subieron!`;
      }
      if (mv.ef === 'atkDefUp') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.def++;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y DEF subieron!`;
      }
      if (mv.ef === 'atkSpdUpDefDn') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.spd++;
        battleState.enemyStatMods.def--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y SPD suben, DEF baja!`;
      }
      if (mv.ef === 'protect') {
        battleState.enemyProtect = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Se protege!`;
      }
      if (mv.ef === 'shield1') {
        battleState.enemyShield = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Escama protectora!`;
      }
      if (mv.ef === 'sunUp') {
        battleState.weather = 'sun';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Sol intenso!`;
      }
      if (mv.ef === 'rainUp') {
        battleState.weather = 'rain';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Lluvia!`;
      }
      if (mv.ef === 'fairyUp') {
        battleState.weather = 'fairy';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Campo mágico!`;
      }
      if (mv.ef === 'healField3') {
        battleState.weather = 'flower';
        battleState.weatherTurns = 3;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Campo de flores!`;
      }
      if (mv.ef === 'leech4') {
        battleState.playerStatus = 'leech';
        battleState.playerStatusTurns = 5;
        b.msg = `¡${c.nm} ha sido infectada con Drenadoras!`;
      }
      if (mv.ef === 'burn20' && Math.random() < 0.2 && !battleState.playerStatus) {
        battleState.playerStatus = 'burn';
        battleState.playerStatusTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te quemaste!`;
      }
      if (mv.ef === 'paralyze20' && Math.random() < 0.2 && !battleState.playerStatus) {
        battleState.playerStatus = 'paralyze';
        battleState.playerStatusTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te paralizaste!`;
      }
      if (mv.ef === 'confuse20' && Math.random() < 0.2 && !battleState.playerStatus) {
        battleState.playerStatus = 'confuse';
        battleState.playerStatusTurns = 4;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te confundiste!`;
      }
      if (mv.ef === 'sleep2') {
        battleState.playerStatus = 'sleep';
        battleState.playerStatusTurns = 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te dormiste!`;
      }
      if (mv.ef === 'accDn') {
        battleState.playerStatMods.spd--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu precisión bajó!`;
      }
      if (mv.ef === 'atkDn') {
        battleState.playerStatMods.atk--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu ATK bajó!`;
      }
      if (mv.ef === 'atkDn50' && Math.random() < 0.5) {
        battleState.playerStatMods.atk--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu ATK bajó!`;
      }
      if (mv.ef === 'atkDn2') {
        battleState.playerStatMods.atk -= 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu ATK bajó mucho!`;
      }
      if (mv.ef === 'wishHeal') {
        battleState.wishHealNext = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Deseo activado!`;
      }
      if (mv.ef === 'curse') {
        const cost = Math.floor(b.en.mHp * 0.5);
        b.en.hp = Math.max(1, b.en.hp - cost);
        battleState.playerStatus = 'curse';
        battleState.playerStatusTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te maldijo!`;
      }
      if (mv.ef === 'clearStatus') {
        battleState.enemyStatus = null;
        battleState.enemyStatusTurns = 0;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Estados limpiados!`;
      }
      if (!b.msg || b.msg === `${b.en.nm}: ${mv.nm}!`)
        b.msg = `${b.en.nm}: ${mv.nm}!`;
      sfx.atk();
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    if (battleState.playerProtect) {
      battleState.playerProtect = false;
      b.msg = `¡${c.nm} se protegió del ataque!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    const result = cDmg(b.en, c, mv, false);
    if (result.missed) {
      b.msg = `¡${b.en.nm}: ${mv.nm} falló!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    let dm = result.dmg;
    c.hp = Math.max(0, c.hp - dm);
    b.ps = 10;
    battleState.lastDmgToPlayer = dm;

    let em = '';
    if (result.crit) em += ' ¡CRÍTICO!';
    if (result.eff > 1) {
      em += ' ¡Súper efectivo!';
      sfx.sup();
    } else if (result.eff < 1) {
      em += ' Poco efectivo...';
      sfx.nef();
    } else sfx.hit();
    b.msg = `${b.en.nm}: ${mv.nm}! -${dm}HP${em}`;
    for (let i = 0; i < 5; i++)
      aP(120 + Math.random() * 40, 230 + Math.random() * 40, tCol(mv.tp));
    b.ph = 'msg';
    b.tm = 0;
  } else if (act.a === 'cE') {
    if (b.en.hp <= 0) b.mq = [];
    if (b.mq.length > 0) procAct(b.mq.shift());
    else {
      if (b.en.hp <= 0) handleWin();
      else b.ph = 'act';
    }
  } else if (act.a === 'cP') {
    if (c.hp <= 0) {
      b.mq = [];
      handleFaint();
    } else if (b.mq.length > 0) procAct(b.mq.shift());
  } else if (act.a === 'end') {
    if (b.npcData) _markNPCDefeated(b.npcData);
    if (b.npcData?.isPunk && postGame) {
      setOloDefeated(true);
      _resetRebattles();
    }
    resetBattleState();
    G.scr = 'world';
  }
} // ============================================================
// BLOQUE 18: VICTORIA Y DERROTA
// ============================================================

// === VICTORIA ===
function handleWin() {
  const b = G.bs;

  // === DAR EXP INMEDIATAMENTE AL DERROTAR CRIATURA ===
  const exp = b.noExp ? 0 : Math.floor((b.en.lv * 15 + 10) * b.expMult);
  const goldGain = b.noExp ? 0 : Math.floor(10 + b.en.lv * 3);

  // Mensaje especial en modo batallador
  if (G.batallador) {
    sfx.win();
    b.msg = `¡${b.en.nm} derrotado! [Modo Batallador: sin EXP ni oro]`;
    b.mq = [];
  } else if (exp > 0 && !b.isMerch) {
    G.gold += goldGain;
    G.tExp += exp;
    sfx.win();
    b.msg = `¡${b.en.nm} derrotado! +${exp}EXP +${goldGain}G`;
    b.mq = [];

    b.fought.forEach((idx) => {
      if (idx < G.party.length && G.party[idx].hp > 0) {
        const result = G.party[idx].addEx(exp);
        if (result.leveled) {
          b.mq.push({
            a: 'lvl',
            m: `¡${G.party[idx].nm} subió a Lv.${G.party[idx].lv}!`,
          });

          // Check evolución
          const evoId = checkEvolution(G.party[idx]);
          if (evoId) {
            b.mq.push({ a: 'evo', creIdx: idx, evoId: evoId });
          }

          // Check nuevo ataque
          if (G.party[idx].lv % 3 === 0) {
            const learn = checkLearnMove(G.party[idx]);
            if (learn) {
              b.mq.push({
                a: 'learn',
                creIdx: idx,
                move: learn,
                m: `¡${G.party[idx].nm} puede aprender ${learn.nm}!`,
              });
            }
          }
        }
      }
    });
  }

  // === BOSS NAVARRETE ===
  if (b.isBoss) {
    G.bossIdx++;
    if (G.bossDialogs < 5 && G.bossDialogs < _bossDialogues.length) {
      const dlg = _bossDialogues[G.bossDialogs];
      G.bossDialogs++;
      b.mq.push({ a: 'bMsg', m: dlg[0] });
      dlg.slice(1).forEach((d) => b.mq.push({ a: 'bMsg', m: d }));

      if (G.bossIdx < G.bossTeam.length) {
        b.mq.push({ a: 'bNext' });
      } else {
        b.mq.push(
          { a: 'bMsg', m: '¡¡MAGNÍFICO!!' },
          { a: 'bMsg', m: '¡¡Me devolviste la emoción!!' },
          { a: 'bMsg', m: '¡¡GRACIAS, guerrero!!' },
          { a: 'end' }
        );
        G.bossOk = true;
        activatePostGame();
      }
      b.ph = 'win';
      b.tm = 0;
      return;
    }
    if (G.bossIdx < G.bossTeam.length) {
      b.en = G.bossTeam[G.bossIdx];
      b.mq.push({ a: 'bNext' });
      b.ph = 'win';
      b.tm = 0;
      return;
    }
    G.bossOk = true;
    activatePostGame();
    b.mq.push({ a: 'end' });
    b.ph = 'win';
    b.tm = 0;
    return;
  }

  // === EQUIPO NPC (siguiente criatura) ===
  if (b.npcTeam) {
    const ni = b.npcIdx + 1;
    if (ni < b.npcTeam.length) {
      b.npcIdx = ni;
      b.en = b.npcTeam[ni];
      b.mq.push({ a: 'npcNext', m: `¡${b.npcName} envía a ${b.en.nm}!` });
      b.ph = 'win';
      b.tm = 0;
      return;
    }
  }

  // === MERCADER ===
  if (b.isMerch) {
    G.mFriend++;
    sfx.win();
    b.msg = `¡Amistad con David-O +1! (${G.mFriend})`;
    b.mq = [{ a: 'end' }];
    b.ph = 'win';
    b.tm = 0;
    return;
  }

  // === VICTORIA FINAL ===
  G.bWon++;
  // Entregar diploma automaticamente al vencer a un lider de gimnasio
  if (b.npcData && b.npcData.isLeader && !_hasDiploma(b.npcData.leaderKey)) {
    _giveDiploma(b.npcData.leaderKey);
    const LVM = _LEADER_MISSIONS[b.npcData.leaderKey];
    (LVM.dlgVictory || []).forEach((ln) => b.mq.push({ a: 'npcMsg', m: ln }));
  }
  if (!exp) {
    b.msg = '¡Ganaste!';
  }
  b.mq.push({ a: 'end' });
  b.ph = 'win';
  b.tm = 0;
}

// === DERROTA ===
function handleFaint() {
  const b = G.bs;

  // Buscar otra criatura viva
  const ai = G.party.findIndex((c, i) => c.hp > 0 && i !== b.pi);

  if (ai !== -1) {
    // Cambio automático
    b.pi = ai;
    pCre().fought = true;
    if (!b.fought.includes(b.pi)) b.fought.push(b.pi);
    b.msg = `¡${pCre().nm} entra en batalla!`;
    b.ph = 'msg';
    b.tm = 0;
    b.mq = [];
  } else {
    // Todas las criaturas cayeron
    sfx.def();
    b.msg = '¡Todas tus criaturas cayeron!';
    b.ph = 'defeat';
    b.tm = 0;
  }
}

// === ACTIVAR POST-GAME ===
function activatePostGame() {
  if (postGame) return;
  setPostGame(true);

  // Generar torre
  _genTower();

  // Notificaciones
  aN('¡El reino ha cambiado!');
  setTimeout(() => aN('Nuevos diálogos disponibles.'), 2000);
  setTimeout(() => aN('Busca a Edison en Villa Guión.'), 4000);
}
// ============================================================
// BLOQUE 19B: DIBUJAR BATALLA
// ============================================================

function dBattle() {
  const b = G.bs,
    c = pCre(),
    f = b.af;

  // === INTRO NPC ===
  if (b.ph === 'npcIntro') {
    dBattleIntroBG();

    // Sprite grande del entrenador
    if (b.npcSprite) {
      dTrainerBig(288, 120, b.npcSprite, f);
    }

    // Nombre
    cx.fillStyle = '#ffd700';
    cx.font = '12px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(b.npcName || '???', 320, 100);
    cx.textAlign = 'left';

    // Diálogo en caja blanca
    const curText = b.npcIntro[b.introLine].substring(0, b.introCi);
    const lines = wrapText(curText, 42);
    const boxH = Math.max(44, 16 + lines.length * 15 + 12);

    dDialogBox(20, 480 - boxH - 10, 600, boxH, b.npcName);
    cx.fillStyle = '#000';
    cx.font = '9px "Press Start 2P"';
    lines.forEach((ln, i) => {
      cx.fillText(ln, 36, 480 - boxH + 10 + i * 15);
    });

    if (b.introFull) {
      cx.fillStyle = '#000';
      cx.font = '10px "Press Start 2P"';
      cx.fillText('▼', 590, 466 + Math.sin(f * 0.2) * 2);
    }
    return;
  }

  // === BATALLA NORMAL ===
  dBattleBG();

  // Shake de sprites
  const esx = b.es > 0 ? Math.sin(b.es * 2) * 4 : 0;
  const psx = b.ps > 0 ? Math.sin(b.ps * 2) * 4 : 0;

  // Criaturas
  // Durante la captura el enemigo se dibuja dentro de la animación para que
  // parezca entrar al Cristal Vínculo, no quedarse duplicado en pantalla.
  if (b.en.hp > 0 && b.ph !== 'captureAnim') dCre(385 + esx, 108, b.en.id, b.en.lv, f);
  if (c.hp > 0) dCre(105 + psx, 238, c.id, c.lv, f);

  // Panel enemigo — nuevo HUD estilo NDS pixel-art
  dBattleHud(8, 8, 260, 66, b.en, {
    isPlayer: false,
    status: battleState.enemyStatus,
  });
  // Indicador de criatura ya capturada
  if (
    G.party.some((c) => c.id === b.en.id) ||
    proa.some((c) => c.id === b.en.id)
  ) {
    cx.fillStyle = '#30D848';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('💎', 240, 54);
  }

  // Panel jugador — nuevo HUD estilo NDS pixel-art
  dBattleHud(370, 232, 260, 80, c, {
    isPlayer: true,
    status: battleState.playerStatus,
  });
  // Barra de EXP debajo del HUD
  dEXP(384, 318, 232, 4, c.ex, c.exTo);

  // === PANEL INFERIOR SEGÚN FASE ===

  if (b.ph === 'captureAnim') {
    const cap = b.cap || { tm: b.tm, shakes: 0, chance: 0, success: false };
    const t = b.tm;
    const totalCapTime = 48 + (cap.shakes || 0) * 28 + 28;
    const breaking = !cap.success && t > totalCapTime - 24;
    let cx0 = 424;
    let cy0 = 137;
    if (t < 28) {
      const k = t / 28;
      cx0 = 120 + (424 - 120) * k;
      cy0 = 250 + (137 - 250) * k - Math.sin(k * Math.PI) * 90;
    } else {
      const st = t - 28;
      const shakeIndex = Math.floor(st / 28);
      if (shakeIndex < cap.shakes) cx0 += Math.sin(st * 0.65) * 8;
    }

    // La criatura entra al cristal: se reduce y se absorbe hacia el centro.
    if (t < 28) {
      dCre(385 + esx, 108, b.en.id, b.en.lv, f);
    } else if (t < 62) {
      const k = Math.min(1, (t - 28) / 34);
      const ex = 401 + (cx0 - 401) * k;
      const ey = 132 + (cy0 - 132) * k;
      const sc = Math.max(0.08, 1 - k * 0.92);
      cx.save();
      cx.globalAlpha = 1 - k * 0.75;
      cx.translate(ex, ey);
      cx.scale(sc, sc);
      dCre(-16, -24, b.en.id, b.en.lv, f);
      cx.restore();
      // rayos cuadrados de absorción
      cx.globalAlpha = 0.35 + Math.sin(fr * 0.4) * 0.15;
      cx.fillStyle = '#D0A0F8';
      px(cx0 - 24, cy0 - 2, 18, 4, '#D0A0F8');
      px(cx0 + 8, cy0 - 2, 18, 4, '#D0A0F8');
      px(cx0 - 2, cy0 - 24, 4, 18, '#D0A0F8');
      px(cx0 - 2, cy0 + 8, 4, 18, '#D0A0F8');
      cx.globalAlpha = 1;
    } else if (!cap.success && breaking) {
      // Si falla, la criatura vuelve a aparecer cuando el cristal se rompe.
      dCre(385 + Math.sin(fr * 0.5) * 3, 108, b.en.id, b.en.lv, f);
    }

    // Cristal Vínculo animado / roto
    cx.save();
    cx.translate(cx0, cy0);
    if (breaking) {
      // Fragmentos pixelados del cristal roto
      const br = t - (totalCapTime - 24);
      const pieces = [
        [-14 - br * .5, -8 - br * .25, 6, 5], [10 + br * .45, -10 - br * .2, 5, 6],
        [-10 - br * .35, 9 + br * .25, 5, 5], [9 + br * .3, 8 + br * .3, 6, 4],
        [-2, -2 - br * .45, 4, 4], [2, 4 + br * .35, 4, 4],
      ];
      cx.globalAlpha = Math.max(0.15, 1 - br / 28);
      pieces.forEach((pc, i) => {
        px(pc[0], pc[1], pc[2], pc[3], i % 2 ? '#8838E0' : '#B868F8');
        px(pc[0] + 1, pc[1] + 1, Math.max(1, pc[2] - 2), 1, '#F8E8FF');
      });
      cx.globalAlpha = 1;
    } else {
      cx.globalAlpha = 0.25 + Math.sin(fr * 0.25) * 0.08;
      cx.fillStyle = '#B868F8';
      pixelGlow(0, 0, 22, 18);
      cx.globalAlpha = 1;
      px(-8, -13, 16, 26, '#6020B0');
      px(-6, -11, 12, 22, '#8838E0');
      px(-3, -8, 6, 16, '#B868F8');
      px(-1, -5, 2, 8, '#F8E8FF');
      px(-10, -2, 20, 4, '#D0A0F8');
    }
    cx.restore();

    dDialogBox(10, 390, 620, 78);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    const shakeTxt = breaking
      ? '¡El cristal se rompe!'
      : t < 28
      ? 'El cristal vuela...'
      : `Sacudidas: ${Math.min(cap.shakes, Math.max(0, Math.floor((t - 28) / 28)))}/3`;
    cx.fillText('¡Nuevo sistema de captura!', 28, 414);
    cx.fillText('Cristal Vínculo: ' + shakeTxt, 28, 434);
    cx.fillStyle = '#606060';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Probabilidad estimada: ${Math.round((cap.chance || 0) * 100)}%`, 28, 454);
  } else if (b.ph === 'act') {
    // Menú de acciones
    dBox(10, 370, 620, 100);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('¿Qué harás?', 24, 388);

    const acts = [
      '⚔️Luchar',
      '🧪Poción',
      '❤️Revivir',
      '🔄Cambiar',
      '💎Capturar',
      '🏃Huir',
    ];
    acts.forEach((a, i) => {
      const ax = 25 + (i % 3) * 200,
        ay = 402 + Math.floor(i / 3) * 22;
      cx.fillStyle = b.ms === i ? '#ffd700' : '#aaa';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${b.ms === i ? '▶ ' : '  '}${a}`, ax, ay);
    });

    cx.fillStyle = '#555';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(`🧪${G.pot} ❤${G.rev} 💎${G.crv}`, 25, 456);
    if (b.ms === 4 && !(b.isMerch || b.isBoss || b.npcTeam)) {
      const capChance = calcCaptureChance(b.en);
      cx.fillStyle = capChance >= 0.65 ? '#30D848' : capChance >= 0.35 ? '#C89000' : '#D02020';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`Captura mejorada: ${Math.round(capChance * 100)}%`, 300, 456);
    }
  } else if (b.ph === 'move') {
    // Selección de movimientos: botones 2x2 con borde dinámico por tipo
    dBox(10, 356, 620, 114, 'Movimientos');
    c.mv.forEach((m, i) => {
      const mx = 24 + (i % 2) * 296,
        my = 378 + Math.floor(i / 2) * 43;
      dMoveButton(mx, my, 280, 40, m, b.mvs === i);
    });
    cx.fillStyle = '#777';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('X:Volver', 28, 464);
  } else if (b.ph === 'switch') {
    // Cambiar criatura
    dBox(10, 340, 620, 130, 'Cambiar criatura');
    G.party.forEach((cr, i) => {
      const sy = 362 + i * 16;
      const sel = b.ss === i;
      const active = i === b.pi;
      const alive = cr.hp > 0;

      cx.fillStyle = sel ? '#ffd700' : alive ? '#aaa' : '#555';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(
        `${sel ? '▶ ' : '  '}${tEmo(cr.tp)} ${cr.nm} Lv.${cr.lv} HP:${cr.hp}/${
          cr.mHp
        }${active ? ' ★' : ''}${!alive ? ' ✖' : ''}`,
        30,
        sy
      );
    });
    cx.fillStyle = '#555';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('X:Cancelar', 30, 462);
  } else if (b.ph === 'learnMove') {
    // === PANTALLA APRENDER ATAQUE ===
    const ld = b.learnData;
    const cre = G.party[ld.creIdx];

    dBox(10, 300, 620, 170, 'Nuevo ataque');

    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${cre.nm} quiere aprender:`, 24, 320);

    cx.fillStyle = '#fff';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`★ ${ld.move.nm}`, 24, 338);
    cx.fillStyle = tCol(ld.move.tp);
    cx.font = '6px "Press Start 2P"';
    cx.fillText(
      `${tNam(ld.move.tp)} PW:${ld.move.pw} PP:${ld.move.mp}`,
      140,
      338
    );
    if (ld.move.ef) {
      cx.fillStyle = '#aaa';
      cx.fillText(`[${ld.move.ef}]`, 350, 338);
    }

    cx.fillStyle = '#ffd700';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('¿Cuál olvidar?', 24, 358);

    cre.mv.forEach((m, i) => {
      const my = 374 + i * 18;
      const sel = b.learnSel === i;
      cx.fillStyle = sel ? '#ffd700' : '#aaa';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`${sel ? '▶ ' : '  '}${m.nm}`, 30, my);
      cx.fillStyle = tCol(m.tp);
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`${tNam(m.tp)} PW:${m.pw} PP:${m.pp}/${m.mp}`, 200, my);
      if (m.ef) {
        cx.fillStyle = '#888';
        cx.fillText(`[${m.ef}]`, 420, my);
      }
    });

    const noSel = b.learnSel === 4;
    cx.fillStyle = noSel ? '#ffd700' : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${noSel ? '▶ ' : '  '}No aprender`, 30, 374 + 4 * 18);

    cx.fillStyle = '#555';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('SPACE:Confirmar  X:Cancelar', 30, 460);
  } else if (b.ph === 'evolve') {
    // Fondo especial de evolución
    cx.fillStyle = '#0a0a2e';
    cx.fillRect(0, 0, 640, 480);

    const cre = G.party[b.evoData.creIdx];

    if (b.evoPhase === 0) {
      // Pregunta de evolución
      const glow = Math.sin(f * 0.1) * 0.3 + 0.7;
      cx.globalAlpha = glow;
      cx.fillStyle = '#F8E8A0';
      cx.fillRect(0, 0, 640, 480);
      cx.globalAlpha = 1;

      cx.fillStyle = '#0a0a2e';
      cx.fillRect(40, 40, 560, 400);

      // Sprite actual parpadeando
      cx.save();
      cx.translate(240, 140);
      cx.scale(3, 3);
      if (Math.sin(f * 0.3) > 0) dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      dBoxMenu(80, 330, 480, 120, '¡Evolución!');
      cx.fillStyle = '#ffd700';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`¡${b.evoData.oldName} quiere evolucionar!`, 100, 368);
      cx.fillStyle = '#fff';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('SPACE para continuar...', 100, 410);
    } else if (b.evoPhase === 1) {
      // Selección sí/no
      // Brillo de fondo
      for (let i = 0; i < 20; i++) {
        cx.globalAlpha = Math.sin(f * 0.05 + i) * 0.3 + 0.3;
        cx.fillStyle = '#F8E868';
        cx.fillRect((i * 73 + f * 0.5) % 640, (i * 47 + f * 0.3) % 480, 2, 2);
      }
      cx.globalAlpha = 1;

      // Sprite
      cx.save();
      cx.translate(240, 120);
      cx.scale(3, 3);
      dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      // Nombre de la evolución
      const evoData = CDB[b.evoData.evoId];

      dBoxMenu(70, 290, 500, 168, '¿Evolucionar?');
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(
        `${b.evoData.oldName} → ${evoData ? evoData.nm : '???'}`,
        95,
        325
      );

      cx.fillStyle = b.evoSel === 0 ? '#30D848' : '#888';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`${b.evoSel === 0 ? '▶ ' : '  '}¡Sí, evolucionar!`, 115, 375);

      cx.fillStyle = b.evoSel === 1 ? '#E83030' : '#888';
      cx.fillText(`${b.evoSel === 1 ? '▶ ' : '  '}No, cancelar`, 115, 415);
    } else if (b.evoPhase === 2) {
      // Resultado - nueva criatura
      // Destellos de celebración
      for (let i = 0; i < 30; i++) {
        cx.globalAlpha = Math.sin(f * 0.08 + i) * 0.5 + 0.5;
        cx.fillStyle = ['#F8E868', '#F088A0', '#88D8F8', '#80F880'][i % 4];
        cx.fillRect((i * 53 + f * 2) % 640, (i * 37 + f * 1.5) % 480, 3, 3);
      }
      cx.globalAlpha = 1;

      // Sprite nuevo grande
      cx.save();
      cx.translate(240, 100);
      cx.scale(3, 3);
      dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      // Mensaje
      dBoxMenu(50, 330, 540, 130, '¡Evolución completa!');
      cx.fillStyle = '#ffd700';
      cx.font = '10px "Press Start 2P"';
      cx.fillText(`¡${cre.nm} ha nacido!`, 90, 378);
      cx.fillStyle = '#aaa';
      cx.font = '7px "Press Start 2P"';
      cx.fillText('SPACE para continuar...', 90, 418);
    }
  } else {
    // Mensaje de batalla (adaptativo)
    const msgLines = wrapText(b.msg, 45);
    const boxH = Math.max(44, 16 + msgLines.length * 15 + 12);
    const boxY = 480 - boxH - 10;

    dDialogBox(10, boxY, 620, boxH);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    msgLines.forEach((l, i) => {
      cx.fillText(l, 28, boxY + 18 + i * 15);
    });

    if (b.tm > 10) {
      cx.fillStyle = '#000';
      cx.font = '10px "Press Start 2P"';
      cx.fillText('▼', 592, boxY + boxH - 10 + Math.sin(f * 0.2) * 2);
    }
  }

  // Partículas
  drawParticles();
}
// ============================================================

export { uBattle, dBattle };
