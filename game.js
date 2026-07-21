// ============================================================
// CRIATURAS DEL REINO V2 - BLOQUE 1: BASE
// ============================================================

// [refactor-phase1] datos importados desde src/data/
import { tEff, tCol, tColL, tEmo, tNam } from './src/data/types.js';
import { CDB } from './src/data/creatures.js';
import { CRE_DESC } from './src/data/creature-descriptions.js';
import { POOLS } from './src/data/pools.js';
import { ALL_MOVES } from './src/data/moves.js';
import { WORLD_LEVEL_ZONES, SPECIAL_MAP_LEVELS, TYPE_RESERVES } from './src/data/regions.js';
import { MAP_LOCATIONS } from './src/data/map-markers.js';
import { createProaMissions, resetProaMissionProgress } from './src/data/proa-missions.js';
import { ROUTE_GATE_DEFINITIONS, isRouteAuthorized } from './src/world/route-missions.js';
import { getValidRouteSigns, isGateTreeEligible } from './src/world/world-layout.js';
import { EXPANDED_SPAWN, applyExpandedNpcPlacements } from './src/world/expanded-world-runtime.js';

// [refactor-phase2] utilidades importadas
import { SPRITE_LOADER } from './src/core/sprite-loader.js';
import { SFX, sfx } from './src/core/audio.js';
import { SAVE_KEY, hasSaveGame, clearAllGameSaves } from './src/core/save.js';
import { SK } from './src/render/skin-colors.js';
import { SONGS, playMusic, stopMusic } from './src/core/music.js';

// [refactor-phase3] entidades importadas
import { Cre } from './src/entities/creature.js';
import { LEARN_POOL, checkLearnMove } from './src/entities/learn-pool.js';
import { checkEvolution, evolveCre } from './src/entities/evolution.js';
import {
  STATUS,
  battleState,
  resetBattleState,
  resetPlayerStatMods,
  resetEnemyStatMods,
  getModdedStat,
  applyStatMod,
  applyStatMods,
  cDmg,
} from './src/entities/battle-state.js';

// [refactor-phase4a] fundaciones render importadas
import { cv, cx } from './src/core/canvas.js';
import { G } from './src/core/game-state.js';
import { px, pixelGlow, pixelDiamond } from './src/render/render-utils.js';

// [refactor-phase4b] UI y utilidades importadas
import { fr, tickFrame } from './src/core/frame.js';
import {
  aP,
  aN,
  uP,
  vfxFromStatResults,
  vfxBurn,
  vfxSleep,
  vfxParalyze,
  vfxLeech,
  vfxTypeHit,
  vfxHeal,
} from './src/utils/particles.js';
import { dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow } from './src/render/ui-boxes.js';
import { dHP, dEXP, dBattlePanel } from './src/render/ui-bars.js';
import { dTypeIcon, moveUiCol, movePpColor, dMoveButton } from './src/render/ui-type-icons.js';
import { dShadow, dRouteTree, dRouteProa, dRouteSign, dTypeReserve, dFallenPortrait } from './src/render/world-decor.js';
import { initBattleBackgroundAssets, drawBattleBackgroundAsset, dWorldEncounterBG, dBattleBG, dBattleIntroBG } from './src/render/battle-backgrounds.js';
import { drawNotifications, drawParticles } from './src/render/notifications-draw.js';

// [refactor-phase4c] sprite del jugador importado
import { dPlayerGBA } from './src/render/player-sprite.js';

// [refactor-phase4d] sprites de NPCs importados
import { dNPC } from './src/render/npc-sprites.js';

// [refactor-phase4e] sprites de entrenadores importados
import { dTrainerBig } from './src/render/trainer-big-sprites.js';

// [refactor-phase4f] sprites de criaturas importados
import { dCre } from './src/render/creature-sprites.js';

// [refactor-phase4g] tiles del mundo importados
import { dTileW, lerpColor, drawWorldDecorBase } from './src/render/tiles-world.js';

// [refactor-phase4h] tiles de cuevas/castillo importados
import { dTileC } from './src/render/tiles-cave-castle.js';

import {
  T, WC, WR, CC, CR, KC, KR,
  cam, wMap, cave1, cave2, castMap,
  setCam, setWMap, setCave1, setCave2, setCastMap,
} from './src/core/world-constants.js';

import { genWorld, genCave, addOloSecretChamber, genCastle } from './src/world/map-generator.js';
import {
  setTowerMapGetter,
  respawnPinsForMap,
  removePinAt,
  isPinTile,
  isCaveLikeMap,
} from './src/world/pin-system.js';
import {
  CRYSTAL_INFO,
  rollPinLoot,
  emptyFragrances,
  emptyFragments,
  totalCrystals,
  hasAnyCrystal,
  crystalCount,
  spendCrystal,
  applyLootToInventory,
  lootRarity,
  FRAGRANCE_ENCOUNTER,
  FRAGRANCE_TYPES,
} from './src/data/pins.js';

import {
  npcs,
  caveNpcs,
  castNpcs,
  edisonNPC,
  pairBattleData,
  bossDialogues,
  endDialogue,
  castleBlockedDlg,
  towerBlockedDlg,
} from './src/data/npcs.js';

import { dFind } from './src/screens/find.js';
import { dObjects, buildObjectRows } from './src/screens/objects.js';
import {
  dFabianaChoice,
  dFabianaCraft,
  dFabianaAnim,
  dClaudiaChoice,
  craftOptions,
} from './src/screens/craft.js';
import {
  dHernanChoice,
  dHernanPickCre,
  dHernanPickMove,
  dHernanPickSlot,
  getTutorMoves,
  TUTOR_COST,
} from './src/screens/tutor.js';
import { dTheater } from './src/screens/theater.js';
import { PACHI_BILL, ANDRE_BILL } from './src/data/theater.js';
import {
  dGonchiTrade,
  buildTradeInventory,
  rollTradeReward,
  applyTradeItem,
  countOwned,
} from './src/screens/trade.js';

const BAG_UPGRADE_PRICE = 2000;


// [refactor-game-flags] flags mutables globales importadas
import {
  postGame, towerOpen, oloDefeated, pairBattles,
  npcDefeats, proa, captureCount, lastHealPos, towerKey, diplomas,
  setPostGame, setTowerOpen, setOloDefeated, setPairBattles,
  setNpcDefeats, setProa, setCaptureCount, setLastHealPos,
  setTowerKey, setDiplomas,
} from './src/core/game-flags.js';





import { dBattleHud } from './src/render/battle-hud.js';

// [refactor-phase5a] input + camara + dex-order + screens importados
import { kp, kh, normKey } from './src/core/input.js';
import {
  updateCamera,
  beginWorldCamera,
  endWorldCamera,
  worldCull,
  VIEW_COLS,
  VIEW_ROWS,
  VIEW_W,
  VIEW_H,
} from './src/core/camera.js';
import { DEX_ORDER, dexIds } from './src/data/dex-order.js';

// [refactor-phase5b] sistema de dialogo importado
import { uDialog, dDialog, showQuickDialog, showDialogThen, showTalkedChecklist } from './src/screens/dialog.js';

// [refactor-phase5c] screens del menu importadas
import { uDex, dDex, hasCapturedSpecies } from './src/screens/dex.js';
import { uMissions, dMissions } from './src/screens/missions.js';
import { uMapScreen, dMapScreen } from './src/screens/map-screen.js';
import { uProa, dProa } from './src/screens/proa.js';
import { uShop, dShop, shopExitDialog, setShopBattleStarter, shopLore } from './src/screens/shop.js';
import { playTitleHorn, dTitle } from './src/screens/title.js';
import { INTRO_LINES, dIntro } from './src/screens/intro.js';
import { dStarter } from './src/screens/starter.js';
import { dMenu } from './src/screens/menu.js';

// [refactor-phase5b-C1.5b] sistema de interiores importado
import { IT, BUILDINGS, isInteriorSolid, createInteriorMap, getInteriorSpawn, getBuildingAtDoor, getBuildingAt, getStylePalette, getActiveInterior, setActiveInterior } from './src/world/interiors.js';
import { dTileI } from './src/render/tiles-interior.js';


// [refactor-phase4a] bloque 'canvas' movido a src/

// ============================================================
// SPRITE LOADER: carga PNGs de assets/sprites/<id>.png
// Si el sprite existe y está cargado, dCre() usará drawImage()
// en vez del dibujo pixel-art para esa criatura.
// ============================================================
// [refactor-phase2] bloque 'sprite-loader' movido a src/

// [refactor-phase4g] T/WC/WR/CC/CR/KC/KR movidos a src/core/world-constants.js
// [refactor-phase4g] cam/wMap/cave1/cave2/castMap movidos a src/core/world-constants.js
// [refactor-game-flags] 'lastHealPos' movido a src/core/game-flags.js
// [refactor-game-flags] postGame/towerOpen/oloDefeated movidos a src/core/game-flags.js
// [refactor-game-flags] npcDefeats/pairBattles movidos a src/core/game-flags.js
// [refactor-game-flags] 'proa' movido a src/core/game-flags.js
// [refactor-game-flags] 'towerKey' movido a src/core/game-flags.js

// [refactor-phase2] bloque 'audio' movido a src/
// [refactor-phase1] bloque 'types' movido a src/data/types.js
// [refactor-phase1] bloque 'creatures' movido a src/data/creatures.js
// [refactor-phase1] bloque 'descriptions' movido a src/data/descriptions.js

// [refactor-phase2] bloque 'save' movido a src/

// === CONTADOR DE CAPTURAS POR ESPECIE ===
// [refactor-game-flags] 'captureCount' movido a src/core/game-flags.js

// [refactor-phase1] bloque 'pools' movido a src/data/pools.js

// [refactor-phase1] bloque 'moves' movido a src/data/moves.js

// [refactor-phase3] bloque 'creature' movido a src/entities/creature.js

// [refactor-phase3] bloque 'learn-pool' movido a src/entities/learn-pool.js
// [refactor-phase3] bloque 'evolution' movido a src/entities/evolution.js

// [refactor-phase3] bloque 'battle-state' movido a src/entities/battle-state.js
// [refactor-phase4a] bloque 'game-state' movido a src/

// [refactor-phase5a] input (kp/kh/normKey + listeners) movido a src/core/input.js

// [refactor-phase4b] bloque 'particles' movido a src/

// [refactor-phase2] bloque 'skin-colors' movido a src/
// ============================================================
// BLOQUE 2: UI COMPLETA
// ============================================================

// [refactor-phase4a] bloque 'render-utils' movido a src/

// [refactor-phase4b] bloque 'ui-boxes-dBox' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-dBoxMenu' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-dDialogBox' movido a src/
// [refactor-phase4b] bloque 'ui-bars-dHP' movido a src/
// [refactor-phase4b] bloque 'ui-bars-dEXP' movido a src/
// [refactor-phase4b] bloque 'ui-bars-dBattlePanel' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-dDialogAdaptive' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-wrapText' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-dMenuOption' movido a src/
// [refactor-phase4b] bloque 'ui-type-icons-dTypeIcon' movido a src/
// [refactor-phase4b] bloque 'ui-type-icons-moveUiCol' movido a src/
// [refactor-phase4b] bloque 'ui-type-icons-movePpColor' movido a src/
// [refactor-phase4b] bloque 'ui-type-icons-dMoveButton' movido a src/
// [refactor-phase4b] bloque 'ui-boxes-dArrow' movido a src/

// [refactor-phase4b] bloque 'world-decor-dShadow' movido a src/


// [refactor-phase4b] bloque 'world-decor-dRouteTree' movido a src/

// [refactor-phase4b] bloque 'world-decor-dRouteProa' movido a src/

// [refactor-phase4b] bloque 'world-decor-dRouteSign' movido a src/

// [refactor-phase4b] bloque 'world-decor-dFallenPortrait' movido a src/

// [refactor-phase4b] bloque 'battle-backgrounds' movido a src/

// [refactor-phase4b] bloque 'notifications-draw' movido a src/
// ============================================================
// BLOQUE 3: SPRITE DEL JUGADOR
// ============================================================

// [refactor-phase4c] bloque 3 (sprite del jugador) movido a src/render/player-sprite.js
// ============================================================
// BLOQUE 4A: SPRITES NPCs MAPA - ALDEAS
// ============================================================

// [refactor-phase4d] bloque 4A (dNPC: sprites de NPCs) movido a src/render/npc-sprites.js
// ============================================================
// BLOQUE 5: SPRITES GRANDES DE ENTRENADORES (INTRO BATALLA)
// ====================================================

// [refactor-phase4e] bloque 5 (dTrainerBig) movido a src/render/trainer-big-sprites.js
// ============================================================
// BLOQUE 6A: SPRITES ÚNICOS DE CRIATURAS (FUEGO, AGUA, PLANTA)
// ============================================================

// [refactor-phase4f] bloque 6A (dCre - sprites de criaturas) movido a src/render/creature-sprites.js

// ============================================================
// BLOQUE 7: TILES DEL MUNDO (dTileW)
// ============================================================

// [refactor-phase4g] bloque 7 (dTileW - tiles del mundo) movido a src/render/tiles-world.js
// ============================================================
// BLOQUE 8: TILES DE CUEVA Y CASTILLO (dTileC)
// ============================================================

// [refactor-phase4h] bloque 8 (dTileC - tiles cueva/castillo) movido a src/render/tiles-cave-castle.js
// ============================================================
// BLOQUE 9: GENERACIÓN DE MAPAS
// ============================================================
// === HELPERS DE CAMINOS (para el mapa grande) ===
function hasTwoActiveDragons() {
  return G.party.filter((c) => c && c.tp === 'dragon' && c.hp > 0).length >= 2;
}

function tryOloSecretEntrance() {
  if (G.curMap !== 'cave1' || G.pl.stepTarget) return false;
  const c = Math.round(G.pl.x),
    r = Math.round(G.pl.y);
  if (c === 19 && r === 24 && kh('ArrowLeft') && cave1[24]?.[18] === 21) {
    if (hasTwoActiveDragons()) {
      cave1[24][18] = 20;
      sfx.cap();
      aN('¡La pared responde a tus dragones!');
    } else {
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Pared antigua' },
        dlgArr: [
          'Una marca de dos dragones',
          'brilla en la piedra.',
          'Necesitas 2 criaturas Dragón',
          'vivas en tu equipo activo.',
        ],
        li: 0, ci: 0, tm: 0, full: false,
      };
      sfx.nef();
    }
    return true;
  }
  return false;
}
// === GENERACIÓN DEL CASTILLO ===
function npcAtWorld(c, r) {
  const cx = Math.round(c), cy2 = Math.round(r);
  if (G.curMap === 'world') {
    if (npcs.some((n) => npcVisible(n) && Math.round(n.x) === cx && Math.round(n.y) === cy2)) return true;
    if (postGame && Math.round(edisonNPC.x) === cx && Math.round(edisonNPC.y) === cy2) return true;
  }
  if (G.curMap.startsWith('cave')) {
    return caveNpcs.some((n) => npcVisible(n) && Math.round(n.x) === cx && Math.round(n.y) === cy2);
  }
  if (G.curMap === 'castle') {
    return castNpcs.some((n) => npcVisible(n) && Math.round(n.x) === cx && Math.round(n.y) === cy2);
  }
  return false;
}

function solidW(c, r) {
  if (c < 0 || c >= WC || r < 0 || r >= WR) return true;
  const t = wMap[r][c];
  // Agua, árboles, rocas son sólidos
  // Edificios (4) son sólidos
  // Torre cerrada es sólida
  if (t === 2 || t === 3 || t === 7) return true;
  if (t === 4 || t === 32) return true; // casas y molino
  // Pin de hallazgo (antes cristal): sólido, se recoge con SPACE
  if (t === 10) return true;
  // Decoración sólida del mundo: puestos, estatuas, cercas, cajas, pozos, muñecos y cámara/set.
  if ([18, 19, 20, 21, 22, 23, 25, 27, 30, 31].includes(t)) return true;
  if (t === 13) return true;
  if (t === 9) return true;
  if (t === 12 && !towerOpen) return true;
  if (routeGateBlocks(c, r)) return true;
  if (npcAtWorld(c, r)) return true;
  return false;
}

function solidC(c, r, map, cols, rows) {
  if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
  const t = map[r][c];
  // Paredes, agua subterránea, lava, puerta bloqueada y PINES (28) son sólidos.
  // Tile 27/33 NO son sólidos (salidas). Tile 34 = puerta del rey.
  // Los pines (28) se recogen con SPACE, no al pisar.
  return t === 21 || t === 23 || t === 24 || t === 28 || t === 29 || t === 31 || t === 34;
}

// === PINES / HALLAZGOS (T3+T4) ===
function facingTile() {
  const c = Math.round(G.pl.x);
  const r = Math.round(G.pl.y);
  let dc = 0,
    dr = 0;
  // d: 0=abajo, 1=derecha, 2=izquierda, 3=arriba
  if (G.pl.d === 0) dr = 1;
  else if (G.pl.d === 1) dc = 1;
  else if (G.pl.d === 2) dc = -1;
  else if (G.pl.d === 3) dr = -1;
  return { c: c + dc, r: r + dr };
}

function tileAt(mapName, c, r) {
  if (mapName === 'world') return wMap[r]?.[c];
  if (mapName === 'cave1') return cave1[r]?.[c];
  if (mapName === 'cave2') return cave2[r]?.[c];
  if (mapName === 'castle') return castMap[r]?.[c];
  if (mapName === 'tower') return towerMap[r]?.[c];
  return null;
}

function enterMap(mapName, opts = {}) {
  const prev = G.curMap;
  G.curMap = mapName;
  if (opts.x != null) G.pl.x = opts.x;
  if (opts.y != null) G.pl.y = opts.y;
  if (opts.d != null) G.pl.d = opts.d;
  G.pl.stepTarget = null;
  G.pl.moving = false;
  // Al entrar a un mapa (desde otro), reaparecen los pines en posiciones nuevas.
  if (prev !== mapName) {
    respawnPinsForMap(mapName);
  }
  if (opts.camCols != null && opts.camRows != null) {
    updateCamera(opts.camCols, opts.camRows);
  }
}

function showPinFind(loot) {
  const label = applyLootToInventory(G, loot);
  const rarity = lootRarity(loot);
  G.find = { loot, label, rarity };
  G.scr = 'find';
  sfx.find(rarity);
  aN(`+${label}`);
}

/** Intenta recoger un pin en la casilla mirando. true si se recogió. */
function tryCollectPin() {
  const { c, r } = facingTile();
  const mapName = G.curMap;
  const tile = tileAt(mapName, c, r);
  if (!isPinTile(mapName, tile)) return false;
  if (!removePinAt(mapName, c, r)) return false;
  const loot = rollPinLoot(isCaveLikeMap(mapName));
  showPinFind(loot);
  return true;
}

function uFind() {
  const v = G.find;
  if (!v) {
    G.scr = 'world';
    return;
  }
  if (kp(' ') || kp('Enter') || kp('x') || kp('Escape')) {
    G.find = null;
    G.scr = 'world';
    sfx.sel();
  }
}

// === GENERACIÓN DE TORRE (mapa especial post-game) ===
let towerMap = [];
const TWC = 30,
  TWR = 25;

function genTower() {
  for (let r = 0; r < TWR; r++) {
    towerMap[r] = [];
    for (let c = 0; c < TWC; c++) {
      if (r < 1 || r >= TWR - 1 || c < 1 || c >= TWC - 1) towerMap[r][c] = 21;
      else towerMap[r][c] = 20;
    }
  }

  // Decoración especial - jardín celestial
  for (let r = 2; r < TWR - 2; r++)
    for (let c = 2; c < TWC - 2; c++) {
      if (Math.random() < 0.05) towerMap[r][c] = 22; // Cristales decorativos
      else if (Math.random() < 0.08) towerMap[r][c] = 26; // Vegetación
      else if (Math.random() < 0.03) towerMap[r][c] = 23; // Estanques
    }

  // Caminos claros
  for (let r = 1; r < TWR - 1; r++) towerMap[r][Math.floor(TWC / 2)] = 20;
  for (let c = 1; c < TWC - 1; c++) towerMap[Math.floor(TWR / 2)][c] = 20;

  // Claro central para Serafox
  for (let r = 10; r < 15; r++)
    for (let c = 12; c < 18; c++) towerMap[r][c] = 20;

  // Flores luminosas
  for (let r = 2; r < TWR - 2; r++)
    for (let c = 2; c < TWC - 2; c++) {
      if (towerMap[r][c] === 20 && Math.random() < 0.04) towerMap[r][c] = 22;
    }

  // Salida abajo
  towerMap[TWR - 2][Math.floor(TWC / 2)] = 27;

  // Cristales capturables
  let tc = 0;
  while (tc < 3) {
    const c = 3 + Math.floor(Math.random() * (TWC - 6));
    const r = 3 + Math.floor(Math.random() * (TWR - 6));
    if (towerMap[r][c] === 20) {
      towerMap[r][c] = 28;
      tc++;
    }
  }
}

// [fase-a] Marcadores y carteles de ruta: src/data/map-markers.js

// ============================================================

// [refactor] BLOQUE 10A NPCs/diálogos movidos a src/data/npcs.js

// ============================================================
// BLOQUE 11: SISTEMA DE MOVIMIENTO
// ============================================================

function moveEntity(checkSolid, cols, rows, map) {
  const p = G.pl;
  p.sprint = !!G.keys['z'];
  const spd = p.sprint ? 0.22 : 0.12;

  // Si está en medio de un paso, termina ese desplazamiento antes de aceptar otro.
  // Esto hace que el jugador avance de casilla en casilla, no flotando libremente.
  if (p.stepTarget) {
    const dx = p.stepTarget.x - p.x;
    const dy = p.stepTarget.y - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= spd) {
      p.lastStepFrom = p.stepFrom || { x: p.x, y: p.y };
      p.x = p.stepTarget.x;
      p.y = p.stepTarget.y;
      p.stepTarget = null;
      p.stepFrom = null;
      p.moving = false;
      p.f++;
      sfx.walk();
      return true; // acaba de entrar a una nueva casilla
    }

    p.x += (dx / dist) * spd;
    p.y += (dy / dist) * spd;
    p.moving = true;
    p.f++;
    if (p.f % (p.sprint ? 4 : 8) === 0) sfx.walk();
    return false;
  }

  // Mantener al jugador alineado a la cuadrícula cuando no está caminando.
  p.x = Math.round(p.x);
  p.y = Math.round(p.y);

  let dx = 0,
    dy = 0,
    dir = p.d;

  // Una sola dirección por paso: sin diagonales ni micro-deslizamientos.
  if (kh('ArrowUp')) {
    dy = -1;
    dir = 3;
  } else if (kh('ArrowDown')) {
    dy = 1;
    dir = 0;
  } else if (kh('ArrowLeft')) {
    dx = -1;
    dir = 2;
  } else if (kh('ArrowRight')) {
    dx = 1;
    dir = 1;
  }

  if (dx === 0 && dy === 0) {
    p.moving = false;
    return false;
  }

  p.d = dir;
  const nx = p.x + dx;
  const ny = p.y + dy;

  if (checkSolid(nx, ny, map, cols, rows)) {
    p.moving = false;
    return false;
  }

  p.stepFrom = { x: p.x, y: p.y };
  p.stepTarget = { x: nx, y: ny };
  p.moving = true;
  p.f++;
  return false;
}

// === SEGUIDOR EN TORRE (primera criatura del equipo) ===
function getFollowerPos() {
  if (!G.party.length) return null;
  // Posición simplificada detrás del jugador según dirección
  const px = G.pl.x,
    py = G.pl.y;
  switch (G.pl.d) {
    case 0:
      return { x: px, y: py - 0.6 }; // mirando abajo, seguidor arriba
    case 1:
      return { x: px - 0.6, y: py }; // mirando derecha, seguidor izquierda
    case 2:
      return { x: px + 0.6, y: py }; // mirando izquierda, seguidor derecha
    case 3:
      return { x: px, y: py + 0.6 }; // mirando arriba, seguidor abajo
    default:
      return { x: px - 0.5, y: py };
  }
}

// === UTILIDAD: ACERCAMIENTO A NPC ===
function nearNPC(n) {
  const px = Math.round(G.pl.x);
  const py = Math.round(G.pl.y);
  return Math.abs(px - n.x) + Math.abs(py - n.y) <= 1;
}

// === UTILIDAD: TILE ACTUAL DEL JUGADOR ===
function playerTile() {
  return {
    c: Math.floor(G.pl.x),
    r: Math.floor(G.pl.y),
    tile:
      G.curMap === 'world'
        ? wMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'cave1'
        ? cave1[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'cave2'
        ? cave2[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'castle'
        ? castMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'tower'
        ? towerMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : null,
  };
}

// [refactor-phase5a] updateCamera movido a src/core/camera.js

// === TELETRANSPORTE SIMPLE ===
function tpPlayer(x, y, mapName = null) {
  G.pl.x = x;
  G.pl.y = y;
  if (mapName) G.curMap = mapName;
}

// === CONTROL DE CICLO POST-GAME DE OLO-MAN ===
function canRebattle(npc) {
  if (!postGame) return !npcDefeats[npc.flag];
  if (npc.flag === 'metOlo') return true; // Olo-Man siempre disponible post-game
  return !npcDefeats[npc.flag] || oloDefeated;
}

function markNPCDefeated(npc) {
  // Teatro / ensayos: no marcan historia ni abren puertas
  if (npc?.isTheater) return;
  if (npc?.flag) {
    npcDefeats[npc.flag] = true;
    // Si derrotaste a Yam, se abre la puerta del trono (34 → 30)
    if (npc.flag === 'metYamCastle') {
      if (castMap[12] && castMap[12][15] === 34) {
        castMap[12][15] = 30;
        aN('¡Obtuviste la llave! La puerta del Rey se ha abierto.');
      }
    }
  }
}

// ¿Se puede entrar a la sala del trono del Rey Navarrete?
// Requisito: derrotar a Yam (que a su vez requiere haber derrotado a André/Ravell).
function canEnterThroneRoom() {
  return !!npcDefeats.metYamCastle;
}

// Reinicia re-batallas tras vencer a Olo-Man
function resetRebattles() {
  Object.keys(npcDefeats).forEach((k) => {
    if (k !== 'metOlo') npcDefeats[k] = false;
  });
  setOloDefeated(false);
  aN('¡Todos quieren combatir otra vez!');
}

// [fase-a] Configuración de regiones: src/data/regions.js

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function avgPartyLv() {
  if (!G.party.length) return 1;
  return Math.floor(G.party.reduce((s, c) => s + c.lv, 0) / G.party.length);
}

function secondStrongestLv() {
  if (!G.party.length) return 1;
  const levels = G.party.map((c) => c.lv).sort((a, b) => b - a);
  return levels[1] || levels[0] || 1;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Devuelve la zona del mundo según fila/columna.
// Por ahora usa rangos verticales; cuando el mapa sea más detallado,
// podemos hacerlo por rectángulos o tiles especiales.
function getWorldZoneAt(c, r) {
  for (const z of WORLD_LEVEL_ZONES) {
    if (r >= z.rMin && r <= z.rMax) return z;
  }

  // Fallback por si queda fuera de rango
  if (r > 137) return WORLD_LEVEL_ZONES.find((z) => z.id === 'pitch');
  if (r > 114) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route1');
  if (r > 104) return WORLD_LEVEL_ZONES.find((z) => z.id === 'storyboard');
  if (r > 86) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route2');
  if (r > 76) return WORLD_LEVEL_ZONES.find((z) => z.id === 'rodaje');
  if (r > 56) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route3');
  if (r > 46) return WORLD_LEVEL_ZONES.find((z) => z.id === 'ultimatoma');
  if (r > 26) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route4');
  if (r > 16) return WORLD_LEVEL_ZONES.find((z) => z.id === 'montaje');
  return WORLD_LEVEL_ZONES.find((z) => z.id === 'route5');
}

function getCurrentLevelZone() {
  if (G.curMap === 'world') {
    return getWorldZoneAt(Math.floor(G.pl.x), Math.floor(G.pl.y));
  }

  if (SPECIAL_MAP_LEVELS[G.curMap]) {
    return SPECIAL_MAP_LEVELS[G.curMap];
  }

  return { id: 'unknown', nm: 'Zona desconocida', min: 5, max: 5 };
}


function getCurrentLocationHUD() {
  if (G.curMap === 'cave1') return { kind: 'CUEVA', name: 'Volcánica' };
  if (G.curMap === 'cave2') return { kind: 'CUEVA', name: 'Cristalina' };
  if (G.curMap === 'castle') return { kind: 'CASTILLO', name: 'Difusión' };
  if (G.curMap === 'tower') return { kind: 'TORRE', name: 'P.A.' };

  const c = Math.floor(G.pl.x),
    r = Math.floor(G.pl.y);
  const tile = wMap[r]?.[c];
  if (tile === 11 || tile === 13) return { kind: 'CASTILLO', name: 'Difusión' };
  if (tile === 12) return { kind: 'TORRE', name: 'P.A.' };

  const z = getWorldZoneAt(c, r);
  if (!z) return { kind: 'ZONA', name: 'Desconocida' };
  if (z.id && z.id.startsWith('route')) return { kind: 'RUTA', name: z.nm.replace('Ruta ', '') };
  return { kind: 'PUEBLO', name: z.nm };
}

function getNPCLevelZone(npc) {
  if (G.curMap === 'world') {
    return getWorldZoneAt(Math.floor(npc.x), Math.floor(npc.y));
  }

  if (SPECIAL_MAP_LEVELS[G.curMap]) {
    return SPECIAL_MAP_LEVELS[G.curMap];
  }

  return getCurrentLevelZone();
}

// Nivel para criaturas salvajes
function wildLv() {
  const z = getCurrentLevelZone();
  return randInt(z.min, z.max);
}
function getWildFleeChance() {
  if (G.curMap === 'world') {
    const z = getWorldZoneAt(Math.floor(G.pl.x), Math.floor(G.pl.y));
    if (z.id === 'route1') return 0.8;
  }

  return 0.6;
}

// Nivel para entrenadores
function scaledLv(base = 5, npc = null) {
  const z = npc ? getNPCLevelZone(npc) : getCurrentLevelZone();
  const avg = avgPartyLv();

  // Antes del post-game: el nivel queda dentro del rango de la zona.
  // Así una criatura muy leveleada no arrastra a todos los rivales.
  // Los líderes quedan cerca del techo de su zona para sentirse como prueba final.
  if (!postGame) {
    if (npc?.isLeader) return clamp(Math.max(base, avg + 1, z.max - 1), z.min, z.max);
    return clamp(Math.max(base, avg), z.min, z.max);
  }

  // Post-game: se desbloquean rebattles y los entrenadores vuelven a escalar.
  // Como mínimo usan el máximo de su zona.
  return Math.min(100, Math.max(z.max, avg));
}

// ============================================================
// BLOQUE 12: PANTALLAS Y VERIFICACIONES
// ============================================================

// [refactor-phase5a] screens title/intro/starter movidos a src/screens/

// ============================================================
// SISTEMA DE MISIONES DE LÍDERES (PROA) Y DIPLOMAS
// ============================================================

const LEADER_MISSIONS = createProaMissions(() => G.party);

function resetLeaderMissions() {
  resetProaMissionProgress(LEADER_MISSIONS);
}

// Estado de diplomas del jugador
// [refactor-game-flags] 'diplomas' movido a src/core/game-flags.js

function hasAllDiplomas() {
  return diplomas.tamara && diplomas.luchito && diplomas.andrea && diplomas.dan;
}

function hasDiploma(leader) {
  return diplomas[leader] === true;
}

function giveDiploma(leader) {
  diplomas[leader] = true;
  sfx.cap();
  const d = LEADER_MISSIONS[leader];
  aN(`¡Diploma "${d.diploma}" obtenido!`);
}

// Función que verifica si el jugador puede pasar de un pueblo al siguiente
function canPassRoute(fromPueblo) {
  return G.supervisor || isRouteAuthorized(fromPueblo, diplomas);
}

const ROUTE_GATES = ROUTE_GATE_DEFINITIONS;

function routeGateAt(c, r) {
  return ROUTE_GATES.find((g) => r === g.y && Math.abs(c - g.x) <= Math.floor(g.w / 2));
}


function routeProgressGate(fromX, fromY, toX, toY) {
  // Bloqueo real de progreso: no importa si el jugador intenta rodear al Proa,
  // cruzar el límite norte del tramo requiere el diploma correspondiente.
  if (toY >= fromY) return null;
  return ROUTE_GATES.find((g) => fromY > g.y && toY <= g.y && !canPassRoute(g.from)) || null;
}

function routeGateBlocks(c, r) {
  const g = routeGateAt(c, r);
  return !!(g && !canPassRoute(g.from));
}

function showRouteBlockedDialog(gate) {
  const mission = LEADER_MISSIONS[gate.leader];
  const destination = { rodaje: 'Cantera Rodaje', ultimatoma: 'Feria Última Toma', montaje: 'Prados Montaje', castle: 'Castillo Difusión' }[gate.to];
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: 'Puesto Proa' },
    dlgArr: [
      'Puesto Proa de enlace regional.',
      `${gate.place} → ${destination}.`,
      'El tránsito de personas,',
      'criaturas y equipo requiere',
      'autorización Proa.',
      `Presenta el Diploma "${mission.diploma}"`,
      `validado por ${gate.proaName}.`,
    ], li: 0, ci: 0, tm: 0, full: false,
  };
  sfx.nef();
}

function nearRouteSign(sign) {
  return G.curMap === 'world' && Math.abs(G.pl.x - sign.x) <= 1 && Math.abs(G.pl.y - sign.y) <= 1;
}

function checkRouteSign() {
  const sign = getValidRouteSigns(wMap, WC, WR).find((sg) => nearRouteSign(sg));
  if (!sign) return false;
  G.scr = 'dialog';
  G.ds = { npc: { nm: sign.name }, dlgArr: sign.lines, li: 0, ci: 0, tm: 0, full: false };
  sfx.sel();
  return true;
}

// === VERIFICACIONES ===

function checkAllTalked() {
  const req = [
    'metAles',
    'metFab',
    'metNic',
    'metCla',
    'metRob',
    'metBri',
    'metPau',
    'metTam',
    'metNah',
    'metPac',
    'metGab',
    'metHer',
    'metAng',
    'metDay',
    'metDey',
    'metAnd',
    'metAlej',
    'metLuis',
    'metAlexandro',
    'metGon',
    'metJai',
    'metDan2',
    'metDaniel',
    'metLuch',
    'metXim',
    'metAnd2',
    'metOlo',
  ];
  G.allTalked = req.every((f) => G.talkedTo[f]);
}

function checkAllCaught() {
  const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
  G.allCaught = types.every(
    (t) => G.party.some((c) => c.tp === t) || proa.some((c) => c.tp === t)
  );
  if (G.allCaught) aN('¡Todos los tipos capturados!');
}

// === VERIFICAR LLAVE DE LA TORRE ===
function checkTowerKey() {
  if (
    towerKey.edison &&
    towerKey.roberto &&
    towerKey.gabriela &&
    towerKey.ximena
  ) {
    setTowerOpen(true);
    aN('¡La llave de la torre brilla!');
    sfx.cap();
  }
}

// === VERIFICAR POST-GAME ===

// === VERIFICAR SI NPC PUEDE COMBATIR ===
function canNPCBattle(npc) {
  if (!npc.battle) return false;

  // Pre-game: siempre puede (primera vez)
  if (!postGame) return true;

  // Post-game: verificar ciclo de Olo-Man
  return canRebattle(npc);
}

// === OBTENER DIÁLOGO CORRECTO SEGÚN ESTADO ===
function getNPCDialog(npc) {
  // Post-game: usar diálogo post si existe
  if (postGame && npc.postDlg) {
    return Array.isArray(npc.postDlg[0])
      ? npc.postDlg[Math.floor(Math.random() * npc.postDlg.length)]
      : npc.postDlg;
  }
  // Normal: diálogo aleatorio
  if (npc.dlg) {
    return npc.dlg[Math.floor(Math.random() * npc.dlg.length)];
  }
  return ['...'];
}

// === OBTENER EQUIPO DE NPC SEGÚN NIVEL ===
function getNPCTeam(npc) {
  const lv = scaledLv(5, npc);

  // Nicole post-game: equipo difícil dragón/hada/fuego
  if (npc.flag === 'metNic' && postGame) {
    const hardLv = Math.min(100, lv + 3);
    return [
      new Cre('serpentdrg', hardLv),
      new Cre('sidhe', hardLv),
      new Cre('salamandro', hardLv),
    ];
  }

  if (npc.isAngelly) {
    const minLv = Math.min(...G.party.map((c) => c.lv));
    const alv = Math.max(1, minLv - 2);
    return [
      new Cre('flameye', alv, true),
      new Cre('sidhe', alv, true),
      new Cre('zumbaflor', alv, true),
    ];
  }

  if (npc.isPunk) {
    return [
      new Cre('pixie', lv),
      new Cre('zumbaflor', lv),
      new Cre('sidhe', lv),
    ];
  }

  if (npc.team) {
    return npc.team.map((c) => {
      const originalLv = c.lv || lv;
      return new Cre(
        c.id,
        postGame ? Math.max(originalLv, lv) : Math.max(originalLv, lv)
      );
    });
  }

  if (npc.fixedTeam) {
    return npc.fixedTeam.map((c) => new Cre(c.id, lv));
  }

  // Aleatorio
  const pool = Object.keys(CDB).filter((k) => k !== 'serafox');
  return [
    new Cre(pool[Math.floor(Math.random() * pool.length)], lv),
    new Cre(pool[Math.floor(Math.random() * pool.length)], lv),
  ];
}

// === OBTENER BATTLE INTRO SEGÚN ESTADO ===
function getNPCBattleIntro(npc) {
  // Nicole crucificada post-game
  if (postGame && npc.flag === 'metNic' && npc.postBattleIntro) {
    return npc.postBattleIntro;
  }
  // Intro normal
  if (npc.battleIntro) return npc.battleIntro;
  return [`¡${npc.nm} te desafía!`];
}

// ============================================================
// BLOQUE 13: LÓGICA MUNDO/CUEVA/CASTILLO/TORRE + CHECKNPC
// ============================================================

// === INTERIORES (C1.5b) ===
function uInterior() {
  const ai = getActiveInterior();
  if (!ai) { G.curMap = 'world'; return; }

  // Salida: si pisa tile puerta (42), sale al mundo
  const tc = Math.round(G.pl.x), tr = Math.round(G.pl.y);
  if (ai.map[tr]?.[tc] === IT.door && kh('ArrowDown')) {
    setActiveInterior(null);
    G.curMap = 'world';
    const ret = G._returnFromInterior || { x: 60, y: 285, d: 0 };
    G.pl.x = ret.x;
    G.pl.y = ret.y;
    G.pl.d = ret.d;
    G.pl.stepTarget = null;
    G.pl.moving = false;
    updateCamera(WC, WR);
    aN('Saliste.');
    sfx.sel();
    return;
  }

  // Movimiento dentro del interior
  const interiorSolid = (c, r) => {
    if (c < 0 || c >= ai.cols || r < 0 || r >= ai.rows) return true;
    return isInteriorSolid(ai.map[r]?.[c]);
  };
  moveEntity(interiorSolid, ai.cols, ai.rows, ai.map);

  // Menú
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }
}

// === MUNDO PRINCIPAL ===
function uWorld() {
  // Proas de ruta: bloquean la salida norte si falta el diploma del líder.
  if (!G.pl.stepTarget) {
    let dx = 0, dy = 0;
    if (kh('ArrowUp')) dy = -1;
    else if (kh('ArrowDown')) dy = 1;
    else if (kh('ArrowLeft')) dx = -1;
    else if (kh('ArrowRight')) dx = 1;
    if (dx || dy) {
      const fromX = Math.round(G.pl.x),
        fromY = Math.round(G.pl.y),
        toX = fromX + dx,
        toY = fromY + dy;
      const progressGate = routeProgressGate(fromX, fromY, toX, toY);
      if (progressGate) {
        showRouteBlockedDialog(progressGate);
        return;
      }
      const gate = routeGateAt(toX, toY);
      if (gate && !canPassRoute(gate.from)) {
        showRouteBlockedDialog(gate);
        return;
      }
    }
  }

  // Entrada a cuevas en modo cuadrícula: si estás justo debajo de una puerta
  // de cueva y empujas hacia arriba, entras sin intentar caminar sobre el muro.
  if (!G.pl.stepTarget && kh('ArrowUp')) {
    const etc = Math.round(G.pl.x),
      etr = Math.round(G.pl.y);
    if (wMap[etr - 1]?.[etc] === 9) {
      G.prevPos = { x: G.pl.x, y: G.pl.y };
      G.caveReturnPos = { x: G.pl.x, y: G.pl.y };
      const caveName = etc <= 40 ? 'cave1' : 'cave2';
      enterMap(caveName, {
        x: Math.floor(CC / 2),
        y: CR - 3,
        d: 3,
        camCols: CC,
        camRows: CR,
      });
      aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
      return;
    }
  }

  // Entrada a interiores: SOLO por la puerta registrada.
  // El jugador debe estar parado en building.door y presionar ↑.
  if (!G.pl.stepTarget && kh('ArrowUp')) {
    const pc = Math.round(G.pl.x), pr = Math.round(G.pl.y);
    const above = wMap[pr - 1]?.[pc];
    if (above === 4 || above === 32) {
      const building = getBuildingAtDoor(pc, pr); // solo puerta exacta
      if (building) {
        const map = createInteriorMap(building);
        const palette = getStylePalette(building);
        G._returnFromInterior = { ...building.exit };
        setActiveInterior({ building, map, cols: building.size.cols, rows: building.size.rows, palette });
        G.prevCurMap = G.curMap;
        G.curMap = 'interior';
        const sp = getInteriorSpawn(building);
        G.pl.x = sp.x;
        G.pl.y = sp.y;
        G.pl.d = sp.d;
        G.pl.stepTarget = null;
        G.pl.moving = false;
        aN(building.title);
        sfx.sel();
        return;
      }
    }
  }

  const mv = moveEntity((c, r) => solidW(c, r), WC, WR);

  if (mv) {
    tickIncenseOnStep();
    const tc = Math.floor(G.pl.x),
      tr = Math.floor(G.pl.y);
    const tile = wMap[tr]?.[tc];

    // Encuentros en hierba alta
    if (!G.supervisor && tile === 5 && Math.random() < 0.018975) {
      startWild(null, ['fire', 'water', 'plant']);
    }

    // Encuentros cerca de agua (más agua)
    if (tile === 0) {
      let nearWater = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (wMap[tr + dr]?.[tc + dc] === 2) nearWater = true;
        }
      // Con incienso activo, el sesgo manda; sin incienso, fuerza agua.
      if (!G.supervisor && nearWater && Math.random() < 0.0088) {
        startWild(G.activeIncense ? null : 'water', ['fire', 'water', 'plant']);
      }
    }

    // (T3) Los pines ya NO se recogen al pisar: son sólidos y se abren con SPACE.

    // Entrada cueva (fallback legacy por si el paso aterriza raro)
    if (kh('ArrowUp')) {
      const etc = Math.floor(G.pl.x),
        etr = Math.floor(G.pl.y);
      if (wMap[etr - 1]?.[etc] === 9 && G.pl.y - etr < 0.4) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        G.caveReturnPos = { x: G.pl.x, y: G.pl.y };
        const caveName = etc <= 40 ? 'cave1' : 'cave2';
        enterMap(caveName, {
          x: Math.floor(CC / 2),
          y: CR - 3,
          d: 3,
          camCols: CC,
          camRows: CR,
        });
        aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
        return;
      }
    }

    // Puerta del castillo
    if (tile === 11) {
      if (G.supervisor || G.batallador || (G.allTalked && G.allCaught)) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        enterMap('castle', {
          x: 15,
          y: KR - 3,
          camCols: KC,
          camRows: KR,
        });
        aN(G.supervisor ? 'Castillo (Supervisor)' : G.batallador ? 'Castillo (Batallador)' : '¡Castillo Real!');
      } else {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: 'Guardia' },
          dlgArr: castleBlockedDlg,
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      }
    }

    // Torre Presupuesto Aprobado
    if (tile === 12) {
      if (G.supervisor || G.batallador || towerOpen) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        enterMap('tower', {
          x: Math.floor(TWC / 2),
          y: TWR - 3,
          camCols: TWC,
          camRows: TWR,
        });
        aN(G.supervisor ? 'Torre (Supervisor)' : G.batallador ? 'Torre (Batallador)' : 'Torre Presupuesto Aprobado');
      } else {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: '???' },
          dlgArr: towerBlockedDlg,
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      }
    }
  }

  // Acción (SPACE o ENTER para hablar / recoger pin)
  if (kp(' ') || kp('Enter')) {
    if (tryCollectPin()) return;
    if (checkRouteSign()) return;
    if (G.supervisor) {
      aN('Supervisor: interacción con NPCs desactivada.');
      return;
    }
    if (G.batallador) {
      aN('Batallador: interacción con NPCs desactivada.');
      return;
    }
    checkNPC(npcs);
    // Edison post-game
    if (postGame) checkEdison();
  }

  // Menú
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(WC, WR);
}

// === CUEVA ===
function uCave() {
  const map = G.curMap === 'cave1' ? cave1 : cave2;

  if (tryOloSecretEntrance()) return;

  const oldX = G.pl.x;
  const oldY = G.pl.y;

  const mv = moveEntity(solidC, CC, CR, map);

  if (mv) {
    tickIncenseOnStep();
    const from = G.pl.lastStepFrom || { x: oldX, y: oldY };
    const oldC = Math.floor(from.x);
    const oldR = Math.floor(from.y);
    const oldTile = map[oldR]?.[oldC];
    const tc = Math.floor(G.pl.x);
    const tr = Math.floor(G.pl.y);
    let tile = map[tr]?.[tc];

    // Salida:
    // SOLO si vienes desde arriba y caminaste hacia abajo
    if (tile === 27 && oldTile !== 27 && tr > oldR) {
      const fromMap = G.curMap;
      let rx = 15,
        ry = 106;
      if (G.caveReturnPos) {
        rx = G.caveReturnPos.x;
        ry = G.caveReturnPos.y;
      } else if (fromMap === 'cave2') {
        rx = 72;
        ry = 39;
      }
      enterMap('world', { x: rx, y: ry, d: 0, camCols: WC, camRows: WR });
      aN('Saliste de la cueva.');
      return;
    }

    // (T3) Pines (tile 28) son sólidos: no se pisan ni se recogen aquí.

    // Encuentros en cualquier tile caminable
    const walkableCaveTile =
      tile === 20 || tile === 26 || tile === 27;

    if (walkableCaveTile && !G.supervisor) {
      const encounterChance = tile === 26 ? 0.018 : 0.007;

      if (Math.random() < encounterChance) {
        const types = ['dragon', 'fairy', 'fire', 'water', 'plant'];

        let nearLava = false;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (map[tr + dr]?.[tc + dc] === 24) nearLava = true;
          }
        }

        // Sin incienso: lava puede forzar fuego. Con incienso: sesgo 75%.
        if (!G.activeIncense && nearLava && Math.random() < 0.5) {
          startWild('fire', types);
        } else {
          startWild(null, types);
        }
        updateCamera(CC, CR);
        return;
      }
    }
  }

  if (kp(' ') || kp('Enter')) {
    if (tryCollectPin()) return;
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.');
    else if (G.batallador) aN('Batallador: interacción con NPCs desactivada.');
    else checkNPC(caveNpcs);
  }
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(CC, CR);
}

// === CASTILLO ===
function uCastle() {
  // La puerta del rey es un tile sólido (34). Si el jugador choca contra ella,
  // le mostramos una pista de cómo abrirla. En supervisor/batallador se ignora
  // y el tile 34 pasa a comportarse como pared normal sin mensaje extra.
  const px = Math.round(G.pl.x);
  const py = Math.round(G.pl.y);
  if (
    !G.supervisor && !G.batallador &&
    !canEnterThroneRoom() &&
    px === 15 && py === 13 && kh('ArrowUp') && !G.pl.stepTarget
  ) {
    if (!G._throneBlockedShown || fr - G._throneBlockedShown > 120) {
      let hint;
      if (!npcDefeats.metAndreCastle && !npcDefeats.metRavellCastle) {
        hint = 'Puerta cerrada. Derrota al centinela del ala oeste.';
      } else if (!npcDefeats.metYamCastle) {
        hint = 'Puerta cerrada. Yam la Carcelera tiene la llave (ala este).';
      } else {
        hint = 'Puerta cerrada... algo no funcionó al abrirla.';
      }
      aN(hint);
      sfx.nef();
      G._throneBlockedShown = fr;
    }
  }

  const mv = moveEntity(solidC, KC, KR, castMap);

  if (mv) {
    tickIncenseOnStep();
    const tile = castMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)];
    if (tile === 33) {
      const rx = G.prevPos ? G.prevPos.x : 20;
      const ry = G.prevPos ? G.prevPos.y : 32;
      enterMap('world', { x: rx, y: ry, camCols: WC, camRows: WR });
      aN('Saliste del castillo.');
    }
  }

  if (kp(' ') || kp('Enter')) {
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.');
    else if (G.batallador) aN('Batallador: interacción con NPCs desactivada.');
    else checkNPC(castNpcs);
  }
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(KC, KR);
}

// === TORRE PRESUPUESTO APROBADO ===
function uTower() {
  const mv = moveEntity(solidC, TWC, TWR, towerMap);

  if (mv) {
    tickIncenseOnStep();
    const tc = Math.floor(G.pl.x),
      tr = Math.floor(G.pl.y);
    const tile = towerMap[tr]?.[tc];

    // Encuentros (todos los tipos + Serafox raro)
    if (!G.supervisor && tile === 26 && Math.random() < 0.03) {
      if (Math.random() < 0.05) {
        // ¡Serafox!
        startSerafoxBattle();
      } else {
        const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
        startWild(null, types);
      }
    }

    // (T3) Pines (28) son sólidos: se recogen con SPACE, no al pisar.

    // Salida
    if (tile === 27 && tr > Math.floor(CR / 2)) {
      const rx = G.prevPos ? G.prevPos.x : G.pl.x;
      const ry = G.prevPos ? G.prevPos.y : G.pl.y;
      enterMap('world', { x: rx, y: ry, camCols: WC, camRows: WR });
      aN('Saliste de la torre.');
    }
  }

  if (kp(' ') || kp('Enter')) {
    if (tryCollectPin()) return;
  }

  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(TWC, TWR);
}

// ============================================================
// BLOQUE: MISIONES DE LIDERES (Fases B-E)
// Pantallas especiales: Quiz (Andrea) y Chismes (Dan)
// ============================================================

// Lista de chismes para Dan. valid=true son los que cuentan.
const DAN_GOSSIP_LIST = [
  { text: 'Alessandro quiere pedirle a Gabriela vivir juntos', valid: true },
  { text: 'Roberto ama a Brisa mas de lo que muestra', valid: true },
  { text: 'Alexandro quiere una criatura grande para movilizarse', valid: true },
  { text: 'Hernan extraña a Tishe', valid: true },
  { text: 'Luchito quiere casarse', valid: true },
  { text: 'Pachi y Andre son hermanos y se cuidan', valid: true },
  // Distractores (falsos): suenan plausibles pero no cuentan
  { text: 'Alejandro (no Alessandro) le pedira a Gabriela vivir juntos', valid: false },
  { text: 'Piero esconde un tesoro de oro en la montana', valid: false },
  { text: 'Nicole abandonara el reino para siempre', valid: false },
  { text: 'El Rey Navarrete es en realidad una criatura disfrazada', valid: false },
  { text: 'Deyna se mudo al otro lado del mar hace anos', valid: false },
];

function handleLeaderNPC(n) {
  const M = LEADER_MISSIONS[n.leaderKey];
  // Ya tiene diploma: diálogo breve. En post-game el ciclo de Olo-Man
  // permite re-batallas contra líderes sin repetir la misión/diploma.
  if (hasDiploma(n.leaderKey)) {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: n.postDlg || M.dlgVictory,
      li: 0, ci: 0, tm: 0, full: false,
      afterBattle: postGame && canNPCBattle(n),
    };
    sfx.sel();
    return;
  }
  // Andrea: leccion de preguntas (quiz)
  if (n.leaderKey === 'andrea') {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: G.talkedTo[n.flag] ? M.dlgAccept : M.dlgStart,
      li: 0, ci: 0, tm: 0, full: false, afterBattle: false, goto: 'andreaQuiz',
    };
    sfx.sel();
    return;
  }
  // Dan: reportar chismes
  if (n.leaderKey === 'dan') {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: G.talkedTo[n.flag] ? M.dlgAccept : M.dlgStart,
      li: 0, ci: 0, tm: 0, full: false, afterBattle: false, goto: 'danGossip',
    };
    sfx.sel();
    return;
  }
  // Tamara / Luchito: mision por condicion
  if (M.check()) {
    G.scr = 'dialog';
    G.ds = { npc: n, dlgArr: M.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
    sfx.sel();
    return;
  }
  // Mision no cumplida: primera vez dlgStart, luego dlgFail
  G.scr = 'dialog';
  G.ds = {
    npc: n,
    dlgArr: G.talkedTo[n.flag] ? M.dlgFail : M.dlgStart,
    li: 0, ci: 0, tm: 0, full: false, afterBattle: false,
  };
  sfx.sel();
}

// === ANDREA: QUIZ ===
function showAndreaQuiz(npc) {
  G.scr = 'andreaQuiz';
  G.quizNPC = npc;
  G.qState = { idx: 0, score: 0, sel: 0, phase: 'select', fb: null };
}

function uAndreaQuiz() {
  const s = G.qState;
  const M = LEADER_MISSIONS.andrea;
  const q = M.questions[s.idx];
  if (s.phase === 'select') {
    if (kp('ArrowUp')) { s.sel = (s.sel + q.opts.length - 1) % q.opts.length; sfx.sel(); }
    if (kp('ArrowDown')) { s.sel = (s.sel + 1) % q.opts.length; sfx.sel(); }
    if (kp(' ') || kp('Enter')) {
      if (s.sel === q.correct) { s.score++; s.fb = 'ok'; sfx.cap(); }
      else { s.fb = 'bad'; sfx.nef(); }
      s.phase = 'feedback';
    }
    if (kp('x') || kp('Escape')) { G.scr = 'world'; }
  } else if (s.phase === 'feedback') {
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      s.idx++;
      if (s.idx >= M.questions.length) {
        s.phase = 'done';
      } else {
        s.sel = 0;
        s.phase = 'select';
      }
    }
  } else if (s.phase === 'done') {
    const npc = G.quizNPC;
    if (s.score >= 2) {
      G.ds = { npc: npc, dlgArr: M.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
    } else {
      G.ds = { npc: npc, dlgArr: M.dlgFail, li: 0, ci: 0, tm: 0, full: false, afterBattle: false };
    }
    G.scr = 'dialog';
  }
}

function dAndreaQuiz() {
  const s = G.qState;
  const M = LEADER_MISSIONS.andrea;
  const q = M.questions[s.idx];
  // Fondo
  cx.fillStyle = '#202830';
  cx.fillRect(0, 0, 640, 480);
  const boxX = 20, boxY = 20, boxW = 600, boxH = 110;
  dDialogBox(boxX, boxY, boxW, boxH, 'Andrea - Leccion especial');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  const qlines = wrapText(q.q, 60);
  qlines.forEach((ln, i) => cx.fillText(ln, boxX + 16, boxY + 28 + i * 16));
  // Progreso
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Pregunta ' + (s.idx + 1) + '/' + M.questions.length + '  Aciertos: ' + s.score, boxX + 16, boxY + boxH - 8);
  // Opciones
  const oy = 150;
  q.opts.forEach((opt, i) => {
    const selected = s.sel === i && s.phase === 'select';
    cx.fillStyle = selected ? '#C83030' : '#202830';
    cx.font = '8px "Press Start 2P"';
    cx.fillText((selected ? '▶ ' : '  ') + (String.fromCharCode(65 + i)) + ') ' + opt, 40, oy + i * 32);
  });
  // Feedback
  if (s.phase === 'feedback') {
    cx.fillStyle = s.fb === 'ok' ? '#30D848' : '#E03020';
    cx.font = '9px "Press Start 2P"';
    const mm = s.fb === 'ok' ? '¡Correcto!' : 'Incorrecto. Era: ' + q.opts[q.correct];
    cx.fillText(mm, 40, 300);
    cx.fillStyle = '#A0A0A0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('ENTER: continuar', 40, 320);
  } else if (s.phase === 'select') {
    cx.fillStyle = '#A0A0A0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('ARRIBA/ABAJO: elegir  ENTER: confirmar  X: salir', 40, 300);
  }
}

// === DAN: CHISMES ===
function showDanGossip(npc) {
  G.scr = 'danGossip';
  G.gossipNPC = npc;
  if (!G.gossipState) G.gossipState = { sel: 0, fb: null, fbTm: 0 };
  G.gossipState.fb = null;
}

function uDanGossip() {
  const s = G.gossipState;
  const D = DAN_GOSSIP_LIST;
  if (s.fb) {
    s.fbTm++;
    if (s.fbTm > 70) s.fb = null;
  }
  if (kp('ArrowUp')) { s.sel = (s.sel + D.length - 1) % D.length; sfx.sel(); }
  if (kp('ArrowDown')) { s.sel = (s.sel + 1) % D.length; sfx.sel(); }
  if (kp(' ') || kp('Enter')) {
    const it = D[s.sel];
    const already = (LEADER_MISSIONS.dan.reported || []).indexOf(s.sel) !== -1;
    if (it.valid && !already) {
      LEADER_MISSIONS.dan.reported.push(s.sel);
      LEADER_MISSIONS.dan.gossip++;
      s.fb = 'ok';
      sfx.cap();
      if (LEADER_MISSIONS.dan.gossip >= LEADER_MISSIONS.dan.gossipNeeded) {
        const npc = G.gossipNPC;
        G.ds = { npc: npc, dlgArr: LEADER_MISSIONS.dan.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
        G.scr = 'dialog';
        return;
      }
    } else if (it.valid && already) {
      s.fb = 'ya';
      sfx.nef();
    } else {
      s.fb = 'bad';
      sfx.nef();
    }
    s.fbTm = 0;
  }
  if (kp('x') || kp('Escape')) { G.scr = 'world'; }
}

function dDanGossip() {
  const s = G.gossipState;
  const D = DAN_GOSSIP_LIST;
  const M = LEADER_MISSIONS.dan;
  cx.fillStyle = '#202830';
  cx.fillRect(0, 0, 640, 480);
  const boxX = 20, boxY = 20, boxW = 600, boxH = 70;
  dDialogBox(boxX, boxY, boxW, boxH, 'Dan - Reporte de chismes');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Habla de los varones del reino y reporta 3 chismes verdaderos.', boxX + 16, boxY + 26);
  cx.fillStyle = '#C83030';
  cx.font = '9px "Press Start 2P"';
  cx.fillText('Reportados: ' + M.gossip + '/' + M.gossipNeeded, boxX + 16, boxY + 52);
  // Lista
  const oy = 110;
  D.forEach((it, i) => {
    const reported = (M.reported || []).indexOf(i) !== -1;
    const selected = s.sel === i;
    cx.fillStyle = selected ? '#C83030' : '#202830';
    cx.font = '8px "Press Start 2P"';
    let mark = '[ ]';
    if (reported) mark = '[X]';
    else if (selected) mark = '[ ]';
    cx.fillText((selected ? '▶ ' : '  ') + mark + ' ' + it.text, 30, oy + i * 30);
  });
  // Feedback
  cx.fillStyle = '#A0A0A0';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('ARRIBA/ABAJO: navegar  ENTER: reportar  X: salir', 30, 460);
  if (s.fb) {
    let msg = '';
    let col = '#30D848';
    if (s.fb === 'ok') { msg = '¡Chisme aceptado!'; col = '#30D848'; }
    else if (s.fb === 'ya') { msg = 'Ese chisme ya lo reportaste.'; col = '#E8C020'; }
    else { msg = 'Eso no parece cierto... no cuenta.'; col = '#E03020'; }
    cx.fillStyle = col;
    cx.font = '9px "Press Start 2P"';
    cx.fillText(msg, 30, 440);
  }
}

// === CHECK NPC ===
// === VERIFICAR SI UN NPC ES VISIBLE SEGÚN EL ESTADO DEL JUEGO ===
function npcVisible(n) {
  if (G.scr === 'intro' && n.flag === 'metAles') return false;
  if (n.preOnly && postGame) return false;
  if (n.postOnly && !postGame) return false;
  if (n.map && n.map !== G.curMap) return false;
  return true;
}
function checkNPC(list) {
  for (const n of list) {
    if (!npcVisible(n)) continue;
    if (!nearNPC(n)) continue;

    // preReqDlg: si el NPC requiere haber derrotado a OTRO NPC primero
    // y no cumples, se muestra un diálogo alternativo (sin pelea, sin flag).
    // preReqFlags puede ser un string o un array (con OR: cualquiera basta).
    if (n.preReqDlg && n.preReqFlags && n.battle) {
      const flags = Array.isArray(n.preReqFlags) ? n.preReqFlags : [n.preReqFlags];
      const meetsPreReq = flags.some((f) => !!npcDefeats[f]);
      if (!meetsPreReq) {
        G.scr = 'dialog';
        G.ds = { npc: n, dlgArr: n.preReqDlg[0], li: 0, ci: 0, tm: 0, full: false };
        sfx.sel();
        return;
      }
    }

    // Marcar como hablado
    if (n.flag) G.talkedTo[n.flag] = true;
    checkAllTalked();

    // SaloGon: pantalla especial de relatos con retratos
    if (n.vision) {
      showSaloGonVision(n);
      return;
    }

    // LIDERES DE GIMNASIO (Fases B-E)
    if (n.isLeader) {
      handleLeaderNPC(n);
      return;
    }

    // Curandero
    if (n.heal) {
      G.party.forEach((c) => c.full());
      setLastHealPos({ x: G.pl.x, y: G.pl.y, map: G.curMap });
      sfx.heal();
      aN('¡Curados!');
      return;
    }

    // Dar item (NPCs genéricos; Gonchi usa trade)
    if (n.givesItem && !n.trade) {
      const items = ['pot', 'crv'];
      const it = items[Math.floor(Math.random() * 2)];
      G[it]++;
      aN(`¡Recibiste ${it === 'pot' ? 'poción' : 'cristal'}!`);
    }

    // Gonchi (T10): Correo del Reino — trueque 2→1 random
    if (n.trade || n.flag === 'metGon') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        // Pelea opcional: si el jugador cancela el trueque puede pelear
        // en otra charla; aquí el flujo principal es el correo.
        afterBattle: false,
        goto: 'gonchiTrade',
        _onDialogFinish: () => openGonchiTrade(),
      };
      sfx.sel();
      return;
    }

    // Tienda
    if (n.shop) {
      G.scr = 'shop';
      G.ss = { s: 0, page: 'main' };
      sfx.sel();
      return;
    }

    // Boss
    if (n.boss) {
      if (!G.bossOk) {
        startBoss();
        return;
      } else {
        const dlg = G.allCaught ? endDialogue : ['Captura todos los tipos.'];
        G.scr = 'dialog';
        G.ds = { npc: n, dlgArr: dlg, li: 0, ci: 0, tm: 0, full: false };
        sfx.sel();
        return;
      }
    }

    // Verificar llaves de torre (post-game extranjeros)
    if (postGame && n.foreignDlg && !towerOpen) {
      if (checkForeignKey(n)) return;
    }

    // Oscar: Órdenes del Reino
    if (n.flag === 'metOscar') { showOscarChronicle(n); return; }
    // Piero: Subgrupos
    if (n.flag === 'metPiero') { showPieroChronicle(n); return; }

    // Fabiana (T5): diálogo normal → oferta de crafting
    if (n.flag === 'metFab') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        goto: 'fabianaChoice', // backup sin función (serialización / double-G)
        _onDialogFinish: () => {
          const frags = G.frag || { p: 0, c: 0, o: 0 };
          const total = (frags.p || 0) + (frags.c || 0) + (frags.o || 0);
          if (total > 0) {
            G.scr = 'fabianaChoice';
            G.fabSel = 0;
          } else {
            // Sin fragmentos: cierra con un tip
            G.scr = 'dialog';
            G.ds = {
              npc: n,
              dlgArr: [
                'Cuando tengas fragmentos,',
                'traéme 4 del mismo color',
                'y hacemos arte juntos.',
              ],
              li: 0,
              ci: 0,
              tm: 0,
              full: false,
            };
          }
        },
      };
      sfx.sel();
      return;
    }

    // Claudia (T7): diálogo → oferta de mochila mejorada (única)
    if (n.flag === 'metCla') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        goto: 'claudiaChoice',
        _onDialogFinish: () => {
          if (G.bagUpgrade) {
            G.scr = 'dialog';
            G.ds = {
              npc: n,
              dlgArr: [
                'Tu mochila ya está mejorada.',
                'Usá Menú → LaFot para armar cristales.',
                'Fabiana sigue ayudando si querés.',
              ],
              li: 0,
              ci: 0,
              tm: 0,
              full: false,
            };
          } else {
            G.scr = 'claudiaChoice';
            G.claSel = 0;
          }
        },
      };
      sfx.sel();
      return;
    }

    // Hernán (T8): tutor de movimientos (2 pergaminos).
    if (n.flag === 'metHer') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        afterBattle: false,
        goto: 'hernanChoice',
        _onDialogFinish: () => {
          G.scr = 'hernanChoice';
          G.herSel = 0;
        },
      };
      sfx.sel();
      return;
    }

    // Pachi / André (T9): Teatro del Reino
    if (n.theaterHost === 'pachi' || n.flag === 'metPac') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        goto: 'theaterPachi',
        _onDialogFinish: () => openTheater('pachi'),
      };
      sfx.sel();
      return;
    }
    if (n.theaterHost === 'andre' || n.flag === 'metAnd') {
      const dlgArr = getNPCDialog(n);
      G.scr = 'dialog';
      G.ds = {
        npc: n,
        dlgArr,
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
        goto: 'theaterAndre',
        _onDialogFinish: () => openTheater('andre'),
      };
      sfx.sel();
      return;
    }
    // Obtener diálogo correcto
    // Deyna: mostrar checklist de personas habladas
    if (n.hasChecklist) {
      showTalkedChecklist(n);
      return;
    }
    const dlgArr = getNPCDialog(n);

    // Angelly roba oro
    if (n.isAngelly) {
      G.gold = Math.max(0, G.gold - 1);
      aN('-1 oro (Angelly ríe)');
    }

    // Determinar si habrá batalla después
    // Determinar si habrá batalla después
    let afterBattle = false;
    if (n.battle && canNPCBattle(n)) {
      if (n.postOnlyBattle && !postGame) {
        afterBattle = false;
      } else if (n.preGameOnce && !postGame && npcDefeats[n.flag]) {
        afterBattle = false;
      } else {
        afterBattle = true;
      }
    }

    G.scr = 'dialog';
    G.ds = { npc: n, dlgArr, li: 0, ci: 0, tm: 0, full: false, afterBattle };
    sfx.sel();
    return;
  }
}

// === CHECK EDISON (post-game) ===
function checkEdison() {
  // Edison aparece al lado de Claudia en Villa Guión
  if (!postGame) return;
  const ed = edisonNPC;
  if (!nearNPC(ed)) return;

  // Marcar como hablado
  if (!G.talkedTo['metEdison']) {
    G.talkedTo['metEdison'] = true;
  }

  // Edison es el segundo paso geográfico (P2):
  // requiere que Gabriela (P1 post-game) ya haya recordado su tierra.
  if (towerKey.gabriela && !towerKey.edison && !towerOpen) {
    towerKey.edison = true;
    aN('Edison afina la llave con música...');
    checkTowerKey();
    sfx.cap();
  }

  // Primer diálogo o challenge
  let dlg;
  if (!pairBattles) {
    dlg = ed.challengeDlg || ed.dlg[0];
  } else {
    dlg = ed.dlg[0];
  }

  G.scr = 'dialog';
  G.ds = {
    npc: ed,
    dlgArr: dlg,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    afterBattle: canNPCBattle(ed),
    isEdison: true,
  };
  sfx.sel();
}

// === CHECK FOREIGN KEY (puzzle de la torre) ===
function checkForeignKey(npc) {
  if (towerOpen) return false;

  const flag = npc.flag;

  // 1) Gabriela inicia la cadena desde el sur (P1 post-game)
  if (flag === 'metGab' && !towerKey.gabriela) {
    towerKey.gabriela = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('Gabriela recuerda su tierra...');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  // 3) Roberto va después de Edison (P4)
  if (flag === 'metRob' && towerKey.edison && !towerKey.roberto) {
    towerKey.roberto = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('Roberto recuerda su tierra...');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  // 4) Ximena cierra la cadena al norte (P5)
  if (flag === 'metXim' && towerKey.roberto && !towerKey.ximena) {
    towerKey.ximena = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('¡Ximena completa la llave!');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  return false;
}

// Limpia movimiento residual del jugador (evita caminar solo tras warp/batalla).
function clearPlayerMotion() {
  G.pl.x = Math.round(G.pl.x);
  G.pl.y = Math.round(G.pl.y);
  G.pl.stepTarget = null;
  G.pl.stepFrom = null;
  G.pl.lastStepFrom = null;
  G.pl.moving = false;
  G.pl.sprint = false;
}

// === INCIENSO ACTIVO (T6) ===
// Cada casilla nueva consumida baja stepsLeft. Sin contador en HUD.
// Al llegar a 0 se apaga solo.
function tickIncenseOnStep() {
  if (!G.activeIncense) return;
  G.activeIncense.stepsLeft = (G.activeIncense.stepsLeft || 0) - 1;
  if (G.activeIncense.stepsLeft <= 0) {
    const t = G.activeIncense.type;
    G.activeIncense = null;
    aN(`El incienso ${t} se apagó.`);
  }
}

/**
 * Elige tipo de encuentro salvaje respetando incienso activo.
 * 75% del tipo del incienso, 25% otro (del pool de fallback).
 * forceType gana si no hay incienso (p.ej. agua cerca del lago).
 */
function pickWildType(forceType, fallbackTypes) {
  const pool = fallbackTypes && fallbackTypes.length
    ? fallbackTypes
    : ['fire', 'water', 'plant'];
  if (G.activeIncense?.type) {
    const preferred = FRAGRANCE_ENCOUNTER[G.activeIncense.type];
    if (preferred) {
      if (Math.random() < 0.75) return preferred;
      // 25%: otro tipo (no el preferido si se puede)
      const others = pool.filter((t) => t !== preferred);
      const alt = others.length ? others : pool;
      return alt[Math.floor(Math.random() * alt.length)];
    }
  }
  if (forceType) return forceType;
  return pool[Math.floor(Math.random() * pool.length)];
}

// === INICIO BATALLA SALVAJE ===
function startWild(forceType, fallbackTypes) {
  const tp = pickWildType(forceType, fallbackTypes);
  const pool = POOLS[tp] || POOLS.fire || Object.values(POOLS)[0];
  const id = pool[Math.floor(Math.random() * pool.length)];
  // En modo batallador el enemigo tambien es nivel 20 para pelea equilibrada
  const lv = G.batallador ? 20 : wildLv();
  const en = new Cre(id, lv);

  // Congelar movimiento al entrar en batalla (evita stepTarget residual post-lucha)
  clearPlayerMotion();

  G.bs = {
    pi: 0,
    en,
    ph: 'intro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${en.nm} salvaje apareció!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: G.batallador,  // No dar EXP en modo batallador
    isMerch: false,
    isBoss: false,
    expMult: 1,
    fought: [0],
    isNPC: false,
    npcSprite: null,
    bgMap: G.curMap,
    fleeChance: getWildFleeChance(),
    npcIntro: null,
    introPhase: 0,
  };
  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA SERAFOX ===
function startSerafoxBattle() {
  const lv = scaledLv();
  const en = new Cre('serafox', lv);
  G.party.forEach((c) => (c.fought = false));
  clearPlayerMotion();

  G.bs = {
    pi: 0,
    en,
    ph: 'intro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡¡¡Serafox celestial!!!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: false,
    expMult: 2,
    fought: [0],
    isNPC: false,
    npcSprite: null,
    npcIntro: null,
    introPhase: 0,
  };
  G.scr = 'battle';
  sfx.bat();
  aN('¡Un ser celestial aparece!');
}

// === INICIO BATALLA NPC ===
function startNPCBattle(npc) {
  // Mr. Olo-Man sin dragón
  if (npc.isPunk && !G.party.some((c) => c.tp === 'dragon')) {
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.sadDlg || ['...'],
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    sfx.nef();
    return;
  }

  const team = getNPCTeam(npc);
  const introLines = getNPCBattleIntro(npc);
  G.party.forEach((c) => (c.fought = false));

  // Congelar movimiento al entrar en batalla (evita stepTarget residual post-lucha)
  clearPlayerMotion();

  G.bs = {
    pi: 0,
    en: team[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${npc.nm} te desafía!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: npc.isMerch || false,
    isMerch: !!npc.shop,
    isBoss: false,
    npcTeam: team,
    npcIdx: 0,
    npcName: npc.nm,
    npcData: npc,
    isAngelly: npc.isAngelly,
    isPunk: npc.isPunk,
    expMult: npc.isAngelly ? 1.05 : 1,
    fought: [0],
    isNPC: true,
    npcSprite: npc.tp,
    npcIntro: introLines,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
  };
  G.scr = 'battle';
  sfx.bat();
}

// Inicia batalla contra oponente del modo batallador (equipo real, nivel forzado a 20)
function startBatalladorNPCBattle(opponent) {
  G.party.forEach((c) => (c.fought = false));
  clearPlayerMotion();
  let team;
  if (opponent.fixedTeam) {
    team = opponent.fixedTeam.map((c) => new Cre(c.id, 20));
  } else if (opponent.team) {
    team = opponent.team.map((c) => new Cre(c.id || c, 20));
  } else if (opponent.isPair) {
    team = opponent.team.map((c) => new Cre(c.id, 20));
  } else {
    const pool = ['flameye', 'axolotl', 'gorilan', 'wyvern', 'pixie', 'eastern'];
    team = [new Cre(pool[0], 20), new Cre(pool[1], 20)];
  }
  const introLines = [`¡${opponent.nm} te desafía en modo batallador!`];
  G.bs = {
    pi: 0, en: team[0], ph: 'npcIntro', ms: 0, mvs: 0, ss: 0,
    msg: `¡${opponent.nm} te desafía!`, mq: [], tm: 0, af: 0, ps: 0, es: 0,
    noExp: true, isMerch: false, isBoss: false,
    npcTeam: team, npcIdx: 0, npcName: opponent.nm,
    isNPC: true, npcSprite: opponent.tp || null,
    npcIntro: introLines, introPhase: 0, introLine: 0, introCi: 0, introFull: false, introTm: 0,
    fought: [0], expMult: 0, isAngelly: false, isPunk: false, isPair: !!opponent.isPair,
  };
  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA BOSS ===
function startBoss() {
  const bossLv = Math.max(40, secondStrongestLv());
  clearPlayerMotion();

  G.bossTeam = [
    new Cre('emberwing', bossLv),
    new Cre('glaciolote', bossLv),
    new Cre('thornbuck', bossLv),
    new Cre('gusarix', bossLv),
    new Cre('zumbaflor', bossLv),
  ];

  G.bossIdx = 0;
  G.bossDialogs = 0;
  G.party.forEach((c) => (c.fought = false));

  const introLines = [
    '...Ah. Otro retador.',
    '*bostezo*',
    'Veamos si vales la pena.',
  ];

  G.bs = {
    pi: 0,
    en: G.bossTeam[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: 'Rey Navarrete te observa...',
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: true,
    expMult: 1,
    fought: [0],
    isNPC: true,
    npcSprite: 'boss',
    npcIntro: introLines,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
  };

  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA EN PAREJA (post-game) ===
function startPairBattle(pairIdx) {
  if (pairIdx < 0 || pairIdx >= pairBattleData.length) return;
  const pair = pairBattleData[pairIdx];
  const lv = scaledLv();

  const team = [
    ...pair.t1.map((c) => new Cre(c.id, lv)),
    ...pair.t2.map((c) => new Cre(c.id, lv)),
  ];

  G.party.forEach((c) => (c.fought = false));

  G.bs = {
    pi: 0,
    en: team[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${pair.nm} te desafían!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: false,
    expMult: 1.2,
    fought: [0],
    npcTeam: team,
    npcIdx: 0,
    npcName: pair.nm,
    isNPC: true,
    npcSprite: null,
    npcIntro: pair.intro,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
    isPair: true,
  };
  G.scr = 'battle';
  sfx.bat();
}
// ============================================================
// BLOQUE 14: SISTEMA DE DIÁLOGO ADAPTATIVO
// ============================================================

// [refactor-phase5b] uDialog + dDialog movidos a src/screens/dialog.js

function showSaloGonVision(npc) {
  G.scr = 'vision';
  G.vision = {
    npc,
    idx: 0,
    ci: 0,
    tm: 0,
    full: false,
    pages: [
      { id: 'salogon', name: 'SaloGon', lines: ['Soy SaloGon, vidente de la Cueva Cristalina.', 'Me quedo al fondo porque aquí la piedra habla más claro.', 'Si escuchas con calma, cada cristal recuerda un nombre.'] },
      { id: 'salogon', name: 'SaloGon', lines: ['Antes vestía de muchos colores, pero por un error', 'algunos lo ven como un monstruo.', 'Yo no muerdo; solo cuento memorias que nadie más quiere cargar.'] },
      { id: 'rafa', name: 'Rafa', lines: ['Rafa caminaba con anteojos empañados y camisa beige.', 'Tenía el cabello corto y siempre parecía estar pensando.', 'Observaba detalles que otros pisaban sin mirar.'] },
      { id: 'rafa', name: 'Rafa', lines: ['Decía que cada historia necesita a alguien que observe.', 'Cuando el ruido crecía, Rafa bajaba la voz.', 'Por eso aún puedo oírlo entre las gotas de esta cueva.'] },
      { id: 'maria', name: 'María', lines: ['María llevaba el cabello negro como noche sin luna.', 'Miraba seria, con ceño firme, porque protegía a todos.', 'No era fría: era valiente incluso cuando tenía miedo.'] },
      { id: 'maria', name: 'María', lines: ['Su camisa blanca aún brilla en mis visiones.', 'Su falda negra cruza el recuerdo como una sombra elegante.', 'Si la ves fruncir el ceño, es porque todavía está cuidando el camino.'] },
      { id: 'mancilla', name: 'Mancilla', lines: ['Mancilla fue un príncipe de armadura brillante.', 'Cabello castaño, chivito en el mentón, sin bigote.', 'Entraba a la batalla como quien entra a un escenario.'] },
      { id: 'mancilla', name: 'Mancilla', lines: ['Cayó sonriendo, como si ya conociera el final.', 'No todos los príncipes llevan corona.', 'Algunos solo dejan una promesa oxidada en la armadura.'] },
      { id: 'salogon', name: 'SaloGon', lines: ['Esas son tres luces apagadas, pero no perdidas.', 'Si vuelves, puedo repetir sus nombres.', 'Un nombre recordado es una puerta que nunca termina de cerrarse.'] },
    ],
  };
  sfx.sel();
}

function uVision() {
  const v = G.vision;
  if (!v) { G.scr = 'world'; return; }
  v.tm++;
  const text = v.pages[v.idx].lines.join(' ');
  if (!v.full && v.tm % 2 === 0) {
    v.ci++;
    if (v.ci >= text.length) v.full = true;
  }
  if (kp(' ') || kp('Enter')) {
    if (!v.full) {
      v.ci = text.length;
      v.full = true;
    } else {
      v.idx++;
      if (v.idx >= v.pages.length) {
        G.scr = 'world';
        G.vision = null;
      } else {
        v.ci = 0; v.tm = 0; v.full = false;
        sfx.sel();
      }
    }
  }
  if (kp('x') || kp('Escape')) { G.scr = 'world'; G.vision = null; }
}

function dVision() {
  drawMap();
  const v = G.vision;
  const page = v.pages[v.idx];
  cx.fillStyle = 'rgba(0,0,0,.72)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(170, 35, 300, 235, page.name);
  // Recuadro pixel-art central
  px(220, 68, 200, 160, '#08080E');
  px(226, 74, 188, 148, '#E8D8A8');
  px(232, 80, 176, 136, '#1A1A2E');
  px(238, 86, 164, 124, '#2A2A42');
  if (page.id === 'salogon') {
    cx.save(); cx.translate(288, 120); cx.scale(2.2, 2.2); dNPC(0, 0, 'salogon', fr); cx.restore();
  } else {
    dFallenPortrait(page.id, 272, 86, 4);
  }
  const allText = page.lines.join(' ');
  const shown = allText.substring(0, v.ci);
  const lines = wrapText(shown, 52);
  const boxH = 78;
  dDialogBox(20, 390, 600, boxH, page.name);
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  lines.slice(0, 4).forEach((ln, i) => cx.fillText(ln, 36, 414 + i * 14));
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`${v.idx + 1}/${v.pages.length}`, 560, 456);
  if (v.full) {
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', 590, 456 + Math.sin(fr * 0.2) * 2);
  }
}


// === REGISTRO DEL CRONISTA (Oscar y Piero) ===
function showChronicle(npc, pages) { G.scr = 'chronicle'; G.chronicle = { npc, idx: 0, ci: 0, tm: 0, full: false, pages }; sfx.sel(); }
function showOscarChronicle(npc) { showChronicle(npc, [{ title: 'LAS TRES ÓRDENES', lines: ['En este reino, las personas','se agrupan en tres órdenes','principales. No son reglas','rígidas... pero ayudan a','entender quién es quién.'] }, { title: 'LOS MATERIALIZADORES', lines: ['Crean con sus manos e ideas.','Alessandro, Luis, Fabiana,','Nicole, Deyna, Dayana, Dante,','Alexandro, Hernán, Chrys,','Claudia, Gabriela, David,','Alejandro, Nahuel, André,','Ravell, Yam, Pachi, Paulo,','Edison, SaloGon, los Juglares.'] }, { title: 'LOS CRONISTAS', lines: ['Somos los que registramos','todos los acontecimientos.','Yo (Oscar), Mr. Olo-Man,','Piero, Manuel (caído) y','Jairo. Buenos amigos de','las Monas también.'] }, { title: 'LOS PREGONEROS', lines: ['Transmiten la información','del Rey a los pobladores.','Brisa, Roberto y Gonchi.','Sin ellos, las noticias','no llegarían a nadie.'] } ]); }
function showPieroChronicle(npc) { showChronicle(npc, [{ title: 'LOS SUBGRUPOS', lines: ['El mundo no se divide solo','en 3 órdenes. Las personas','son más complejas que eso.','También existen subgrupos.'] }, { title: 'LOS CTM', lines: ['Más experiencia que el','promedio. Hernán, Pachi,','Alejandro, Ravell, Chrys,','Nahuel, André, Yam, y su','miembro más joven: Dante.'] }, { title: 'LAS MONAS', lines: ['Amigas inseparables de','alta fidelidad entre ellas.','Dayana, Deyna y Nicole.','Un grupo muy misterioso,','de alto enigma y peligro.'] }, { title: 'BRANDCUT', lines: ['Algo inexpertos, pero son','la siguiente generación.','Alessandro, Luis, Alexandro,','Gabriela, Claudia, Edison,','David y Fabiana.'] }, { title: 'LOS REBATA', lines: ['Extremadamente ruidosos...','definitivamente la pasan','bien juntos. Dayana, Deyna,','Oscar, Piero, Jairo,','Manuel y Nicole.'] }, { title: 'LOS PROAS', lines: ['Los jefes de cada pueblo.','Parecen malhumorados, pero','son muy sabios. Controlan','el orden y enseñan. Tamara,','Luchito, Andrea y Dan.'] }, { title: 'LOS OUTSAIDERS', lines: ['Muy misteriosos. Sin','conexión con alguien más','que no sean entre ellos.','Luas, Angelly y Ximena.','Nadie sabe de dónde vienen.'] }, { title: 'NOTA FINAL', lines: ['Cada grupo tiene su propia','historia. Algunos pertenecen','a varios a la vez. Dayana y','Deyna son Monas y Rebata.','Nicole es Monas, Rebata y','Materializadora. Así es el','Reino. — Piero, Cronista.'] } ]); }
function uChronicle() { const v = G.chronicle; if (!v) { G.scr = 'world'; return; } v.tm++; const text = v.pages[v.idx].lines.join(' '); if (!v.full && v.tm % 2 === 0) { v.ci++; if (v.ci >= text.length) v.full = true; } if (kp(' ') || kp('Enter')) { if (!v.full) { v.ci = text.length; v.full = true; } else { v.idx++; if (v.idx >= v.pages.length) { G.scr = 'world'; G.chronicle = null; } else { v.ci = 0; v.tm = 0; v.full = false; sfx.sel(); } } } if (kp('x') || kp('Escape')) { G.scr = 'world'; G.chronicle = null; } }
function dChronicle() { drawMap(); const v = G.chronicle; if (!v) return; const page = v.pages[v.idx]; cx.fillStyle = '#2A2218'; cx.fillRect(40, 20, 560, 390); px(36, 16, 568, 398, '#5A4A30'); px(38, 18, 564, 394, '#3A2A18'); px(40, 20, 560, 390, '#2A2218'); px(36, 16, 12, 12, '#C8A830'); px(588, 16, 12, 12, '#C8A830'); px(36, 406, 12, 12, '#C8A830'); px(588, 406, 12, 12, '#C8A830'); cx.fillStyle = '#C8A830'; cx.font = '10px "Press Start 2P"'; cx.textAlign = 'center'; cx.fillText(page.title, 320, 48); cx.textAlign = 'left'; cx.fillStyle = '#5A4A30'; cx.fillRect(60, 56, 520, 1); cx.fillStyle = '#D8C8A0'; cx.font = '7px "Press Start 2P"'; const allText = page.lines.join(' '); const shown = allText.substring(0, v.ci); const lines = wrapText(shown, 52); lines.slice(0, 9).forEach((ln, i) => cx.fillText(ln, 60, 80 + i * 16)); cx.fillStyle = '#8A7A50'; cx.font = '6px "Press Start 2P"'; cx.fillText(v.idx + 1 + '/' + v.pages.length, 560, 426); if (v.full) { cx.fillStyle = '#C8A830'; cx.font = '10px "Press Start 2P"'; cx.textAlign = 'center'; cx.fillText('▼', 600, 430 + Math.sin(fr * 0.2) * 2); cx.textAlign = 'left'; } }

// === MOSTRAR OPCIONES DE EDISON ===
function showEdisonChoice() {
  G.scr = 'edisonChoice';
  G.edisonSel = 0;
}

function uEdisonChoice() {
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.edisonSel = (G.edisonSel + 1) % 2;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.edisonSel = (G.edisonSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.edisonSel === 0) {
      // Combatir contra Edison
      startNPCBattle(edisonNPC);
    } else {
      // Desbloquear combates en pareja
      setPairBattles(true);
      aN('¡Combates en pareja desbloqueados!');
      G.scr = 'pairSelect';
      G.pairSel = 0;
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

function dEdisonChoice() {
  drawMap();
  cx.fillStyle = 'rgba(0,0,0,.5)';
  cx.fillRect(0, 0, 640, 480);

  // Caja de pregunta
  const boxW = 400,
    boxH = 120;
  const boxX = 120,
    boxY = 180;
  dDialogBox(boxX, boxY, boxW, boxH, 'Edison');

  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('¿Qué prefieres?', boxX + 20, boxY + 30);

  // Opciones
  cx.fillStyle = G.edisonSel === 0 ? '#C83030' : '#505060';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(
    `${G.edisonSel === 0 ? '▶ ' : '  '}Pelear contra mí`,
    boxX + 20,
    boxY + 60
  );

  cx.fillStyle = G.edisonSel === 1 ? '#C83030' : '#505060';
  cx.fillText(
    `${G.edisonSel === 1 ? '▶ ' : '  '}Nuevo reto (Parejas)`,
    boxX + 20,
    boxY + 82
  );

  cx.fillStyle = '#A0A0A0';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('X: Cancelar', boxX + 20, boxY + 104);
}

// === SELECCIÓN DE PAREJA PARA COMBATIR ===
function uPairSelect() {
  if (kp('ArrowUp')) {
    G.pairSel = (G.pairSel + pairBattleData.length - 1) % pairBattleData.length;
    sfx.sel();
  }
  if (kp('ArrowDown')) {
    G.pairSel = (G.pairSel + 1) % pairBattleData.length;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    startPairBattle(G.pairSel);
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

function dPairSelect() {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(80, 20, 480, 440, 'Combates en Pareja');

  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Elige una pareja para combatir:', 100, 55);

  pairBattleData.forEach((pair, i) => {
    const py = 80 + i * 50;
    const sel = G.pairSel === i;

    // Fondo seleccionado
    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.1)';
      cx.fillRect(95, py - 5, 430, 42);
    }

    // Nombre de pareja
    cx.fillStyle = sel ? '#ffd700' : '#fff';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${pair.nm}`, 100, py + 10);

    // Detalle
    cx.fillStyle = sel ? '#E8C830' : '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`${pair.p1} + ${pair.p2}`, 120, py + 26);

    // Criaturas
    const allT = [...pair.t1, ...pair.t2];
    allT.forEach((c, j) => {
      const ci = CDB[c.id];
      if (ci) {
        cx.fillStyle = tCol(ci.tp);
        cx.fillText(`${tEmo(ci.tp)}${ci.nm}`, 300 + j * 80, py + 26);
      }
    });
  });

  // Luchadores solitarios post-game
  cx.fillStyle = '#A0B0C0';
  cx.font = '7px "Press Start 2P"';
  const soloY = 80 + pairBattleData.length * 50 + 20;
  cx.fillText('También puedes pelear contra:', 100, soloY);
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(
    'Hernán (solo) | Dan (solo) | Nicole (crucificada)',
    100,
    soloY + 18
  );

  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('X: Volver', 100, 440);
}

// [refactor-phase5b] showQuickDialog/showDialogThen/showTalkedChecklist -> src/screens/dialog.js

// ============================================================
// BLOQUE 15-16: TIENDA, MENÚ, PROA Y MAPA GRANDE
// ============================================================

// [refactor-phase5c] tienda (uShop/dShop/shopExitDialog) movida a src/screens/shop.js

// [refactor-phase5c] uMenu/dMenu movidos a src/screens/menu.js

// === CONFIRMAR REINICIO ===
function uConfirmReset() {
  if (kp('ArrowUp') || kp('ArrowDown') || kp('ArrowLeft') || kp('ArrowRight')) {
    G.resetSel = (G.resetSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.resetSel === 0) {
      // No reiniciar
      G.scr = G.resetFromTitle ? 'title' : 'menu';
      G.resetFromTitle = false;
    } else {
      // Sí reiniciar
      resetGame(!!G.resetFromTitle);
      G.resetFromTitle = false;
    }
  }
  if (kp('x') || kp('Escape')) { G.scr = G.resetFromTitle ? 'title' : 'menu'; G.resetFromTitle = false; }
}

function dConfirmReset() {
  if (G.resetFromTitle) {
    // Fondo propio para evitar la sensación de pantalla negra al crear nueva partida.
    cx.fillStyle = '#09091E';
    cx.fillRect(0, 0, 640, 480);
    for (let i = 0; i < 45; i++) {
      cx.globalAlpha = Math.sin(fr * 0.04 + i) * 0.4 + 0.6;
      cx.fillStyle = '#fff';
      cx.fillRect((i * 97) % 640, (i * 71) % 260, 1, 1);
    }
    cx.globalAlpha = 1;
    cx.textAlign = 'center';
    cx.fillStyle = '#ffd700';
    cx.font = '16px "Press Start 2P"';
    cx.fillText('NUEVA PARTIDA', 320, 92);
    cx.textAlign = 'left';
  } else {
    drawMap();
    cx.fillStyle = 'rgba(0,0,0,.7)';
    cx.fillRect(0, 0, 640, 480);
  }

  dBoxMenu(125, 150, 390, 180, G.resetFromTitle ? 'CONFIRMAR NUEVA PARTIDA' : '⚠️ REINICIO TOTAL');

  cx.fillStyle = '#E83030';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(G.resetFromTitle ? '¿Empezar desde Aldea Pitch?' : '¿Reiniciar TODA la partida?', 145, 190);
  cx.fillStyle = '#aaa';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Borra save, equipo, diplomas y progreso.', 145, 212);
  cx.fillText('Esto no se puede deshacer.', 145, 230);

  cx.fillStyle = G.resetSel === 0 ? '#ffd700' : '#888';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`${G.resetSel === 0 ? '▶ ' : '  '}${G.resetFromTitle ? 'No, volver al inicio' : 'No, volver al menú'}`, 155, 270);

  cx.fillStyle = G.resetSel === 1 ? '#E83030' : '#888';
  cx.fillText(`${G.resetSel === 1 ? '▶ ' : '  '}${G.resetFromTitle ? 'Sí, empezar nueva partida' : 'Sí, reiniciar toda la partida'}`, 155, 296);
}

function resetGame(startIntro = false) {
  // Borrar save de forma robusta
  clearAllGameSaves();

  // Reiniciar variables globales
  G.scr = 'title';
  G.curMap = 'world';
  G.pl = { x: 60, y: 285, d: 0, f: 0, sprint: false, stepTarget: null, moving: false };
  G.party = [];
  G.gold = 200;
  G.pot = 5;
  G.rev = 2;
  G.crv = 3;
  G.crvC = 0;
  G.crvO = 0;
  G.frag = emptyFragments();
  G.scrolls = 0;
  G.fragrances = emptyFragrances();
  G.incense = emptyFragrances();
  G.activeIncense = null;
  G.bagUpgrade = false;
  G.find = null;
  G.fabSel = 0;
  G.craftSel = 0;
  G.craft = null;
  G.bWon = 0;
  G.tExp = 0;
  G.mFriend = 0;
  G.bossOk = false;
  G.allCaught = false;
  G.keys = {};
  G.kcd = {};
  G.held = {};
  G.pts = [];
  G.nots = [];
  G.tFr = 0;
  G.titleSel = 0;
  G.hasSave = false;
  G.sSel = 0;
  G.bs = null;
  G.ds = null;
  G.ms = null;
  G.ss = null;
  G.os = null;
  G.talkedTo = {};
  G.allTalked = false;
  G.bossTeam = null;
  G.bossIdx = 0;
  G.bossDialogs = 0;
  G.prevPos = null;
  G.showMap = false;
  G.proaOpen = false;
  G.showMissions = false;
  G.showDex = false;
  G.showObjects = false;
  G.dexSel = 0;
  G.supervisor = false;

  setPostGame(false);
  setTowerOpen(false);
  setOloDefeated(false);
  setNpcDefeats({});
  setPairBattles(false);
  setProa([]);
  setTowerKey({ edison: false, roberto: false, gabriela: false, ximena: false });
  setDiplomas({ tamara: false, luchito: false, andrea: false, dan: false });
  setCaptureCount({});
  setLastHealPos({ ...EXPANDED_SPAWN.lastHeal });

  // Regenerar mapas
  // === HELPERS DE CAMINOS PARA EL MAPA GRANDE ===
  function hPath(r, c1, c2, w = 2) {
    const start = Math.min(c1, c2),
      end = Math.max(c1, c2);
    for (let c = start; c <= end; c++)
      for (let dr = 0; dr < w; dr++) {
        const rr = r + dr;
        if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
      }
  }

  function vPath(c, r1, r2, w = 2) {
    const start = Math.min(r1, r2),
      end = Math.max(r1, r2);
    for (let r = start; r <= end; r++)
      for (let dc = 0; dc < w; dc++) {
        const cc = c + dc;
        if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
      }
  }
  // === HELPERS DE CAMINOS (para el mapa grande) ===
  function hPath(r, c1, c2, w = 2) {
    const start = Math.min(c1, c2),
      end = Math.max(c1, c2);
    for (let c = start; c <= end; c++)
      for (let dr = 0; dr < w; dr++) {
        const rr = r + dr;
        if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
      }
  }

  function vPath(c, r1, r2, w = 2) {
    const start = Math.min(r1, r2),
      end = Math.max(r1, r2);
    for (let r = start; r <= end; r++)
      for (let dc = 0; dc < w; dc++) {
        const cc = c + dc;
        if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
      }
  }
  genWorld();
  applyExpandedNpcPlacements(npcs);
  genCave(cave1, CC, CR);
  addOloSecretChamber(cave1);
  genCave(cave2, CC, CR);
  genCastle();

  resetBattleState();
  stopMusic();

  aN('¡Partida reiniciada!');
  sfx.sel();
  if (startIntro) {
    G.pl.d = 3;
    G.scr = 'intro';
    G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
  }
}

// [refactor-phase5a] DEX_ORDER + dexIds movidos a src/data/dex-order.js

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

function calcCaptureChance(enemy, crystalCode = 'p') {
  const info = CRYSTAL_INFO[crystalCode] || CRYSTAL_INFO.p;
  // Base por rareza del cristal + bonus por vida faltante y estados.
  const hpRatio = enemy.hp / enemy.mHp;
  const missingHp = 1 - hpRatio;
  let chance = info.baseChance + missingHp * 0.35;

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

  return clamp(chance, 0.05, 0.92);
}

function availableCaptureCrystals() {
  const list = [];
  if ((G.crv || 0) > 0) list.push('p');
  if ((G.crvC || 0) > 0) list.push('c');
  if ((G.crvO || 0) > 0) list.push('o');
  return list;
}

function openCaptureSelect() {
  const b = G.bs;
  const opts = availableCaptureCrystals();
  if (!opts.length) {
    b.msg = '¡Sin Cristales Vínculo!';
    b.ph = 'msg';
    b.tm = 0;
    b.mq = [];
    return;
  }
  // Si solo hay un tipo, lanzar directo (UX más rápida).
  if (opts.length === 1) {
    startCaptureAttempt(opts[0]);
    return;
  }
  b.ph = 'captureSelect';
  b.capSel = 0;
  b.capOpts = opts;
}

function startCaptureAttempt(crystalCode = 'p') {
  const b = G.bs;
  if (!spendCrystal(G, crystalCode)) {
    b.msg = '¡Sin ese cristal!';
    b.ph = 'msg';
    b.tm = 0;
    b.mq = [];
    return;
  }
  const info = CRYSTAL_INFO[crystalCode] || CRYSTAL_INFO.p;
  const chance = calcCaptureChance(b.en, crystalCode);
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
    crystalCode,
  };
  b.msg = `¡Lanzaste un ${info.label}!`;
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
    checkAllCaught();
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
          case 4: // Capturar — elegir rareza de cristal
            if (b.isMerch || b.isBoss || b.npcTeam) {
              b.msg = '¡No puedes capturar aquí!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
              break;
            }
            openCaptureSelect();
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
              clearPlayerMotion();
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

    // === SELECCIÓN DE CRISTAL PARA CAPTURA ===
    case 'captureSelect':
      {
        const opts = b.capOpts || availableCaptureCrystals();
        b.capOpts = opts;
        if (!opts.length) {
          b.ph = 'act';
          break;
        }
        if (kp('ArrowUp') || kp('ArrowLeft')) {
          b.capSel = (b.capSel + opts.length - 1) % opts.length;
          sfx.sel();
        }
        if (kp('ArrowDown') || kp('ArrowRight')) {
          b.capSel = (b.capSel + 1) % opts.length;
          sfx.sel();
        }
        if (kp('x') || kp('Escape')) {
          b.ph = 'act';
          sfx.sel();
        }
        if (kp(' ') || kp('Enter')) {
          const code = opts[b.capSel] || opts[0];
          startCaptureAttempt(code);
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
          // T11b: la criatura nueva entra con mods en 0
          resetPlayerStatMods();
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
            // T11b: mon enemigo nuevo entra en 0/0/0
            resetEnemyStatMods();
            b.msg = `¡${b.en.nm} entra en batalla!`;
            b.ph = 'msg';
            b.tm = 0;
            b.mq = [];
          } else if (n.a === 'npcNext') {
            // El mon ya se setea en handleWin; reset de mods al cambiar
            resetEnemyStatMods();
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'npcMsg') {
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'end') {
            if (b.npcData) markNPCDefeated(b.npcData);
            if (b.npcData?.isPunk && postGame) {
              setOloDefeated(true);
              resetRebattles();
            }
            resetBattleState();
            clearPlayerMotion();
            G.scr = 'world';
          }
        } else {
          resetBattleState();
          clearPlayerMotion();
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
        // Warp al último curandero + RESET TOTAL de movimiento.
        // Sin esto, un stepTarget residual (p.ej. pelear con Gabriela
        // en medio de un paso) hace que el personaje camine solo en
        // diagonal desde Pitch hasta el viejo destino (bug reportado).
        G.pl.x = Math.round(lastHealPos.x);
        G.pl.y = Math.round(lastHealPos.y);
        G.curMap = lastHealPos.map;
        G.pl.stepTarget = null;
        G.pl.stepFrom = null;
        G.pl.lastStepFrom = null;
        G.pl.moving = false;
        G.pl.sprint = false;
        G.pl.f = 0;
        G.pl.d = 0;
        // Limpiar teclas residuales (flechas/SPACE que quedaron held
        // del combate o del mensaje de derrota).
        G.keys = {};
        G.held = {};
        G.kcd = {};
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
  // T11c: SPD modificada decide el orden de turno
  const pSpd = getModdedStat(c.sp, battleState.playerStatMods.spd);
  const eSpd = getModdedStat(b.en.sp, battleState.enemyStatMods.spd);
  // Empate: el jugador va primero (como antes con >=)
  if (pSpd >= eSpd) {
    b.mq.push({ a: 'pA', mv }, { a: 'cE' }, { a: 'eT' });
  } else {
    b.mq.push({ a: 'eT' }, { a: 'cP' }, { a: 'pA', mv });
  }
  procAct(b.mq.shift());
}

/** Une mensaje base de movimiento con textos de stats + VFX (T11). */
function withStatMsgs(base, side, changes) {
  const { text, results } = applyStatMods(side, changes);
  // VFX de subida/bajada (solo si algo se aplicó)
  vfxFromStatResults(side, results);
  if (!text) return base;
  return base ? `${base} ${text}` : text;
}

/** Mini indicadores de stages ATK/DEF/SPD (solo si ≠ 0). */
function dStatStages(x, y, mods, isPlayer) {
  if (!mods) return;
  const parts = [];
  const push = (k, label, colUp, colDn) => {
    const v = mods[k] || 0;
    if (!v) return;
    parts.push({
      t: `${label}${v > 0 ? '+' : ''}${v}`,
      c: v > 0 ? colUp : colDn,
    });
  };
  push('atk', 'A', '#E85050', '#A060E0');
  push('def', 'D', '#5090E8', '#A060E0');
  push('spd', 'S', '#E8C840', '#A060E0');
  if (!parts.length) return;
  cx.font = '6px "Press Start 2P"';
  let ox = x;
  parts.forEach((p, i) => {
    cx.fillStyle = p.c;
    cx.fillText(p.t, ox, y);
    ox += cx.measureText(p.t).width + 8;
  });
}

/**
 * Overlay continuo de estado sobre el sprite (T11d–f).
 * cx0,cy0 = centro aprox. del mon.
 */
function dStatusOverlay(cx0, cy0, status, f) {
  if (!status) return;
  if (status === 'burn') {
    // llamitas bajo los pies
    for (let i = 0; i < 3; i++) {
      const ox = cx0 - 10 + i * 10 + Math.sin(f * 0.25 + i) * 2;
      const oy = cy0 + 18 + Math.sin(f * 0.3 + i * 1.3) * 2;
      cx.globalAlpha = 0.55 + Math.sin(f * 0.2 + i) * 0.25;
      cx.fillStyle = i % 2 ? '#F0A030' : '#E05020';
      cx.fillRect(ox, oy, 3, 5);
      cx.fillStyle = '#F8E060';
      cx.fillRect(ox + 1, oy + 1, 1, 2);
    }
    cx.globalAlpha = 1;
  } else if (status === 'sleep') {
    const bob = Math.sin(f * 0.12) * 2;
    cx.globalAlpha = 0.85;
    cx.fillStyle = '#D0D8F0';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Z', cx0 + 14, cy0 - 18 + bob);
    cx.font = '10px "Press Start 2P"';
    cx.fillText('z', cx0 + 24, cy0 - 28 + bob);
    cx.globalAlpha = 1;
  } else if (status === 'paralyze') {
    // chispas en el borde
    cx.globalAlpha = 0.5 + Math.sin(f * 0.4) * 0.3;
    cx.fillStyle = '#F0E040';
    for (let i = 0; i < 4; i++) {
      const a = f * 0.15 + i * 1.6;
      cx.fillRect(cx0 + Math.cos(a) * 22 - 1, cy0 + Math.sin(a) * 14 - 1, 2, 2);
    }
    cx.globalAlpha = 1;
  } else if (status === 'leech') {
    cx.globalAlpha = 0.45 + Math.sin(f * 0.15) * 0.2;
    cx.fillStyle = '#40C060';
    for (let i = 0; i < 3; i++) {
      cx.fillRect(cx0 - 12 + i * 10, cy0 + 16 + Math.sin(f * 0.2 + i) * 2, 2, 6);
    }
    cx.globalAlpha = 1;
  } else if (status === 'poison' || status === 'curse') {
    cx.globalAlpha = 0.4 + Math.sin(f * 0.18) * 0.2;
    cx.fillStyle = status === 'poison' ? '#A060E0' : '#603080';
    for (let i = 0; i < 4; i++) {
      cx.fillRect(
        cx0 - 14 + (i % 2) * 20 + Math.sin(f * 0.1 + i) * 3,
        cy0 - 8 + Math.floor(i / 2) * 16,
        3,
        3
      );
    }
    cx.globalAlpha = 1;
  }
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
      vfxParalyze('player');
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    // Sueño check
    if (battleState.playerStatus === 'sleep') {
      if (battleState.playerStatusTurns > 0) {
        battleState.playerStatusTurns--;
        b.msg = `¡${c.nm} está dormido!`;
        vfxSleep('player');
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
      vfxHeal('player');
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
      vfxHeal('player');
      b.msg = `${c.nm}: ${mv.nm}! ¡Equipo curado!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    // T11a: mods con clamp ±6 + mensajes claros
    if (mv.ef === 'spdUp') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['spd', 1]]);
    }
    if (mv.ef === 'atkUp2') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['atk', 2]]);
    }
    if (mv.ef === 'spdUp2') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['spd', 2]]);
    }
    if (mv.ef === 'defUp2') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['def', 2]]);
    }
    if (mv.ef === 'atkSpdUp') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['atk', 1], ['spd', 1]]);
    }
    if (mv.ef === 'atkDefUp') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['atk', 1], ['def', 1]]);
    }
    if (mv.ef === 'atkSpdUpDefDn') {
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'player', [['atk', 1], ['spd', 1], ['def', -1]]);
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
      vfxLeech('enemy', 'player');
    }
    if (mv.ef === 'sleep2') {
      battleState.enemyStatus = 'sleep';
      battleState.enemyStatusTurns = 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡${b.en.nm} se durmió!`;
      vfxSleep('enemy');
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
      // Usamos SPD como proxy de precisión (como el código original)
      sfx.sel();
      b.msg = withStatMsgs(`${c.nm}: ${mv.nm}!`, 'enemy', [['spd', -1]]);
      // Preferir wording de precisión si no chocó el tope
      if (!b.msg.includes('no puede')) {
        b.msg = `${c.nm}: ${mv.nm}! ¡Precisión rival bajó!`;
      }
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
      LEADER_MISSIONS.luchito.superEffectiveHits++;
      if (LEADER_MISSIONS.luchito.superEffectiveHits === 3) {
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
    // T11d–f: VFX de golpe por tipo sobre el rival
    vfxTypeHit('enemy', mv.tp, !!result.crit);

    // Efectos secundarios post-daño
    if (mv.ef === 'burn20' && Math.random() < 0.2 && !battleState.enemyStatus) {
      battleState.enemyStatus = 'burn';
      battleState.enemyStatusTurns = 5;
      b.msg += ` ¡${b.en.nm} se quemó!`;
      vfxBurn('enemy');
    }
    if (
      mv.ef === 'paralyze20' &&
      Math.random() < 0.2 &&
      !battleState.enemyStatus
    ) {
      battleState.enemyStatus = 'paralyze';
      battleState.enemyStatusTurns = 5;
      b.msg += ` ¡${b.en.nm} paralizado!`;
      vfxParalyze('enemy');
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
      b.msg = withStatMsgs(b.msg, 'enemy', [['spd', -1]]);
    }
    if (mv.ef === 'atkDn30' && Math.random() < 0.3) {
      b.msg = withStatMsgs(b.msg, 'enemy', [['atk', -1]]);
    }
    if (mv.ef === 'atkDn50' && Math.random() < 0.5) {
      b.msg = withStatMsgs(b.msg, 'enemy', [['atk', -1]]);
    }
    if (mv.ef === 'defDn') {
      b.msg = withStatMsgs(b.msg, 'enemy', [['def', -1]]);
    }
    if (mv.ef === 'atkDn') {
      b.msg = withStatMsgs(b.msg, 'enemy', [['atk', -1]]);
    }
    if (mv.ef === 'selfDefDn') {
      b.msg = withStatMsgs(b.msg, 'player', [['def', -1]]);
    }
    if (mv.ef === 'selfSpdDn') {
      b.msg = withStatMsgs(b.msg, 'player', [['spd', -1]]);
    }
    // Nota: spdUp como soporte puro ya se maneja arriba; aquí solo si vino con daño
    if (mv.ef === 'spdUp' && mv.pw > 0) {
      b.msg = withStatMsgs(b.msg, 'player', [['spd', 1]]);
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
      vfxBurn('enemy');
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
      vfxLeech('enemy', 'player');
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
      vfxBurn('player');
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
      vfxLeech('player', 'enemy');
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
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'enemy', [['atk', 2]]);
      }
      if (mv.ef === 'spdUp' || mv.ef === 'spdUp2') {
        b.msg = withStatMsgs(
          `${b.en.nm}: ${mv.nm}!`,
          'enemy',
          [['spd', mv.ef === 'spdUp2' ? 2 : 1]]
        );
      }
      if (mv.ef === 'defUp2') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'enemy', [['def', 2]]);
      }
      if (mv.ef === 'atkSpdUp') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'enemy', [['atk', 1], ['spd', 1]]);
      }
      if (mv.ef === 'atkDefUp') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'enemy', [['atk', 1], ['def', 1]]);
      }
      if (mv.ef === 'atkSpdUpDefDn') {
        b.msg = withStatMsgs(
          `${b.en.nm}: ${mv.nm}!`,
          'enemy',
          [['atk', 1], ['spd', 1], ['def', -1]]
        );
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
        vfxLeech('player', 'enemy');
      }
      if (mv.ef === 'burn20' && Math.random() < 0.2 && !battleState.playerStatus) {
        battleState.playerStatus = 'burn';
        battleState.playerStatusTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te quemaste!`;
        vfxBurn('player');
      }
      if (mv.ef === 'paralyze20' && Math.random() < 0.2 && !battleState.playerStatus) {
        battleState.playerStatus = 'paralyze';
        battleState.playerStatusTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te paralizaste!`;
        vfxParalyze('player');
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
        vfxSleep('player');
      }
      if (mv.ef === 'accDn') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'player', [['spd', -1]]);
        if (!b.msg.includes('no puede')) {
          b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu precisión bajó!`;
        }
      }
      if (mv.ef === 'atkDn') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'player', [['atk', -1]]);
      }
      if (mv.ef === 'atkDn50' && Math.random() < 0.5) {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'player', [['atk', -1]]);
      }
      if (mv.ef === 'atkDn2') {
        b.msg = withStatMsgs(`${b.en.nm}: ${mv.nm}!`, 'player', [['atk', -2]]);
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
    // T11d–f: VFX de golpe por tipo sobre el jugador
    vfxTypeHit('player', mv.tp, !!result.crit);
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
    if (b.npcData) markNPCDefeated(b.npcData);
    if (b.npcData?.isPunk && postGame) {
      setOloDefeated(true);
      resetRebattles();
    }
    resetBattleState();
    clearPlayerMotion();
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
    if (G.bossDialogs < 5 && G.bossDialogs < bossDialogues.length) {
      const dlg = bossDialogues[G.bossDialogs];
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
      // T11b: mon enemigo nuevo (mods se resetean al mostrar npcNext)
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
  // (nunca en batallas de teatro / ensayo)
  if (
    b.npcData &&
    b.npcData.isLeader &&
    !b.npcData.isTheater &&
    !b.isTheater &&
    !hasDiploma(b.npcData.leaderKey)
  ) {
    giveDiploma(b.npcData.leaderKey);
    const LVM = LEADER_MISSIONS[b.npcData.leaderKey];
    (LVM.dlgVictory || []).forEach((ln) => b.mq.push({ a: 'npcMsg', m: ln }));
  }
  if (!exp) {
    b.msg = b.isTheater ? '¡Fin de la escena!' : '¡Ganaste!';
  } else if (b.isTheater) {
    // Añadir sabor de teatro al mensaje de victoria con EXP
    // (el mensaje base de EXP/oro ya se setea arriba)
    if (b.msg && !b.msg.includes('escena')) {
      b.msg = b.msg.replace('derrotado!', 'derrotado en escena!');
    }
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
    // T11b: la criatura nueva entra con mods en 0
    resetPlayerStatMods();
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
  genTower();

  // Notificaciones
  aN('¡El reino ha cambiado!');
  setTimeout(() => aN('Nuevos diálogos disponibles.'), 2000);
  setTimeout(() => aN('Busca a Edison en Villa Guión.'), 4000);
}
// ============================================================
// BLOQUE 19A: DIBUJAR MAPA DEL MUNDO
// ============================================================

function drawMap() {
  // ─── INTERIOR (C1.5b) ───────────────────────────────────────
  if (G.curMap === 'interior') {
    const ai = getActiveInterior();
    if (!ai) { G.curMap = 'world'; return; }
    const { map, cols, rows, palette } = ai;
    // Fondo oscuro para bordes
    cx.fillStyle = '#1A1815';
    cx.fillRect(0, 0, 640, 480);
    // Centrar el interior en pantalla
    const offX = Math.floor((640 - cols * T) / 2);
    const offY = Math.floor((480 - rows * T) / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dTileI(map[r][c], offX + c * T, offY + r * T, palette);
      }
    }
    // Jugador
    dPlayerGBA(offX + G.pl.x * T, offY + G.pl.y * T - 8, G.pl.d, G.pl.f);
    // Label de interior
    dBox(220, 2, 200, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(ai.building.title, 320, 14);
    cx.textAlign = 'left';
    // Controles
    cx.fillStyle = 'rgba(0,0,0,.4)';
    cx.fillRect(4, 462, 400, 16);
    cx.fillStyle = '#666';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('Flechas:Mover  FlechaAbajo:Salir  X:Menú', 8, 473);
    drawParticles();
    drawNotifications();
    return;
  }

  // Mundo con FOV 15×9 + zoom uniforme (solo capa de exploración).
  // HUD / labels de zona se dibujan DESPUÉS a escala 1:1.
  beginWorldCamera(cx);

  if (G.curMap === 'world') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(WC, sc + VIEW_COLS + 2);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(WR, sr + VIEW_ROWS + 2);
    for (let r = sr; r < er; r++) for (let c = sc; c < ec; c++) dTileW(c, r);

    // Carteles de ruta
    getValidRouteSigns(wMap, WC, WR).forEach((sg) => {
      const sx = sg.x * T - cam.x,
        sy = sg.y * T - cam.y;
      if (worldCull(sx, sy)) {
        dRouteSign(sx, sy, fr);
        if (nearRouteSign(sg)) {
          cx.fillStyle = '#ffd700';
          cx.font = '6px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText('LEER', sx + 16, sy - 8 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    });

    // Reservas de Lucha y Acero: ambiente visible, sin encuentros hasta tener especies.
    TYPE_RESERVES.forEach((reserve) => {
      const sx = reserve.x * T - cam.x, sy = reserve.y * T - cam.y;
      if (worldCull(sx, sy)) dTypeReserve(sx, sy - 8, reserve, fr);
    });

    // Puestos Proa: la estación siempre existe; los árboles solo cierran rutas sin diploma.
    ROUTE_GATES.forEach((g) => {
      const authorized = canPassRoute(g.from);
      for (let dc = -Math.floor(g.w / 2); dc <= Math.floor(g.w / 2); dc++) {
        const sx = (g.x + dc) * T - cam.x;
        const sy = g.y * T - cam.y;
        if (!worldCull(sx, sy)) continue;
        if (dc === 0) dRouteProa(sx, sy - 8, fr, g, authorized);
        else if (!authorized && isGateTreeEligible(wMap, g.x + dc, g.y)) dRouteTree(sx, sy, fr);
      }
    });

    // Depth-sorted NPCs + player (mundo)
    const renderList = [];
    npcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x, sy = n.y * T - cam.y;
      if (worldCull(sx, sy)) {
        renderList.push({ type: 'npc', y: n.y, sx, sy, n });
      }
    });
    if (postGame) {
      const ed = edisonNPC;
      const esx = ed.x * T - cam.x, esy = ed.y * T - cam.y;
      if (worldCull(esx, esy)) {
        renderList.push({ type: 'npc', y: ed.y, sx: esx, sy: esy, n: ed });
      }
    }
    const ppx = G.pl.x * T - cam.x, ppy = G.pl.y * T - cam.y;
    renderList.push({ type: 'player', y: G.pl.y, ppx, ppy });
    renderList.sort((a, b) => a.y - b.y);

    renderList.forEach((it) => {
      if (it.type === 'npc') {
        dNPC(it.sx, it.sy - 8, it.n.tp, fr);
        if (nearNPC(it.n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(it.n.nm, it.sx + 16, it.sy - 18);
          cx.fillText('⬇', it.sx + 16, it.sy - 10 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      } else {
        dPlayerGBA(it.ppx, it.ppy - 8, G.pl.d, G.pl.f);
      }
    });
  } else if (G.curMap.startsWith('cave')) {
    const map = G.curMap === 'cave1' ? cave1 : cave2;
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(CC, sc + VIEW_COLS + 2);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(CR, sr + VIEW_ROWS + 2);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, map);

    {
      const rlist = [];
      caveNpcs.forEach((n) => {
        if (!npcVisible(n)) return;
        const sx = n.x * T - cam.x, sy = n.y * T - cam.y;
        if (worldCull(sx, sy)) rlist.push({ y: n.y, sx, sy, n });
      });
      const ppx = G.pl.x * T - cam.x, ppy = G.pl.y * T - cam.y;
      rlist.push({ y: G.pl.y, ppx, ppy, isPlayer: true });
      rlist.sort((a, b) => a.y - b.y);
      rlist.forEach((it) => {
        if (it.isPlayer) { dPlayerGBA(it.ppx, it.ppy - 8, G.pl.d, G.pl.f); return; }
        dNPC(it.sx, it.sy - 8, it.n.tp, fr);
        if (nearNPC(it.n)) {
          cx.fillStyle = '#ffd700'; cx.font = '7px "Press Start 2P"'; cx.textAlign = 'center';
          cx.fillText(it.n.nm, it.sx + 16, it.sy - 18); cx.textAlign = 'left';
        }
      });
    }
  } else if (G.curMap === 'castle') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(KC, sc + VIEW_COLS + 2);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(KR, sr + VIEW_ROWS + 2);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, castMap);

    {
      const rlist = [];
      castNpcs.forEach((n) => {
        if (!npcVisible(n)) return;
        const sx = n.x * T - cam.x, sy = n.y * T - cam.y;
        if (worldCull(sx, sy)) rlist.push({ y: n.y, sx, sy, n });
      });
      const ppx = G.pl.x * T - cam.x, ppy = G.pl.y * T - cam.y;
      rlist.push({ y: G.pl.y, ppx, ppy, isPlayer: true });
      rlist.sort((a, b) => a.y - b.y);
      rlist.forEach((it) => {
        if (it.isPlayer) { dPlayerGBA(it.ppx, it.ppy - 8, G.pl.d, G.pl.f); return; }
        dNPC(it.sx, it.sy - 8, it.n.tp, fr);
        if (nearNPC(it.n)) {
          cx.fillStyle = '#ffd700'; cx.font = '7px "Press Start 2P"'; cx.textAlign = 'center';
          cx.fillText(it.n.nm, it.sx + 16, it.sy - 18); cx.textAlign = 'left';
        }
      });
    }
  } else if (G.curMap === 'tower') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(TWC, sc + VIEW_COLS + 2);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(TWR, sr + VIEW_ROWS + 2);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, towerMap);

    // Efecto mágico de la torre (en coords de mundo)
    cx.globalAlpha = 0.03;
    cx.fillStyle = '#F8E8A0';
    cx.fillRect(0, 0, VIEW_W, VIEW_H);
    cx.globalAlpha = 1;

    for (let i = 0; i < 8; i++) {
      cx.globalAlpha = Math.sin(fr * 0.03 + i) * 0.3 + 0.4;
      cx.fillStyle = '#F8E868';
      cx.fillRect(
        (i * 97 + fr * 0.5) % VIEW_W,
        (i * 63 + Math.sin(fr * 0.02 + i) * 20) % VIEW_H,
        2,
        2
      );
    }
    cx.globalAlpha = 1;

    if (G.party.length > 0) {
      const fpos = getFollowerPos();
      if (fpos) {
        const fx = fpos.x * T - cam.x,
          fy = fpos.y * T - cam.y;
        dCre(fx, fy - 8, G.party[0].id, G.party[0].lv, fr);
      }
    }

    const ppx = G.pl.x * T - cam.x,
      ppy = G.pl.y * T - cam.y;
    dPlayerGBA(ppx, ppy - 8, G.pl.d, G.pl.f);
  }

  endWorldCamera(cx);

  // Labels de zona (HUD 1:1, no zoom)
  if (G.curMap.startsWith('cave')) {
    dBox(230, 4, 180, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(
      G.curMap === 'cave1' ? 'Cueva Volcánica' : 'Cueva Cristalina',
      320,
      16
    );
    cx.textAlign = 'left';
  } else if (G.curMap === 'castle') {
    dBox(250, 4, 140, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Castillo Real', 320, 16);
    cx.textAlign = 'left';
  } else if (G.curMap === 'tower') {
    dBox(220, 4, 200, 18);
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Torre Presupuesto Aprobado', 320, 16);
    cx.textAlign = 'left';
  }

  // === HUD SUPERIOR ===
  // Info de criatura líder
  dBox(4, 4, 185, 46);
  if (G.party.length > 0) {
    const c = G.party[0];
    cx.fillStyle = tCol(c.tp);
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${tEmo(c.tp)} ${c.nm} Lv.${c.lv}`, 14, 20);
    dHP(14, 25, 100, 6, c.hp, c.mHp);
    dEXP(14, 35, 100, 4, c.ex, c.exTo);
  }

  // Ubicación actual (reemplaza el letrero grande de objetos)
  const locHUD = getCurrentLocationHUD();
  dBox(490, 4, 146, 26);
  cx.fillStyle = '#ffd700';
  cx.font = '5px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(locHUD.kind, 563, 15);
  cx.fillStyle = '#fff';
  cx.font = locHUD.name.length > 15 ? '4px "Press Start 2P"' : '5px "Press Start 2P"';
  cx.fillText(locHUD.name, 563, 25);
  cx.textAlign = 'left';

  // Sprint
  if (G.pl.sprint) {
    cx.fillStyle = '#ffd700';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('🏃SPRINT', 556, 42);
  }

  // Post-game indicador
  if (postGame) {
    cx.fillStyle = '#D860A8';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('★POST-GAME★', 540, 55);
  }
  if (G.supervisor) {
    cx.fillStyle = '#ffd700';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('SUPERVISOR: Y salir', 500, postGame ? 67 : 55);
  }
  if (G.batallador) {
    cx.fillStyle = '#68d858';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('BATALLADOR: P salir', 500, postGame ? 79 : 67);
  }

  // Controles
  cx.fillStyle = 'rgba(0,0,0,.4)';
  cx.fillRect(4, 462, 400, 16);
  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  // No publicitar Y/P (modos de prueba) en el HUD: se descubren por error y se abusan.
  cx.fillText('Flechas:Mover  Z:Sprint  SPACE:Acción  X:Menú', 8, 473);

  // === PARTÍCULAS Y NOTIFICACIONES ===
  drawParticles();
  drawNotifications();
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
      dTrainerBig(320, 285, b.npcSprite, f);
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
  if (b.en.hp > 0 && b.ph !== 'captureAnim') {
    dCre(385 + esx, 108, b.en.id, b.en.lv, f);
    dStatusOverlay(400 + esx, 130, battleState.enemyStatus, f);
  }
  if (c.hp > 0) {
    dCre(105 + psx, 238, c.id, c.lv, f);
    dStatusOverlay(130 + psx, 260, battleState.playerStatus, f);
  }

  // Panel enemigo — nuevo HUD estilo NDS pixel-art
  dBattleHud(8, 8, 260, 66, b.en, {
    isPlayer: false,
    status: battleState.enemyStatus,
  });
  // Stages del rival (T11)
  dStatStages(12, 78, battleState.enemyStatMods, false);
  // Cristal púrpura de captura junto al nombre del enemigo
  if (
    G.party.some((c) => c.id === b.en.id) ||
    proa.some((c) => c.id === b.en.id)
  ) {
    const cx2 = 200, cy2 = 18;
    // Cristal púrpura pixel-art (como los del mapa, tile 28)
    px(cx2 - 3, cy2 - 6, 6, 12, '#6020B0');
    px(cx2 - 2, cy2 - 5, 4, 10, '#8838E0');
    px(cx2 - 1, cy2 - 3, 2, 6, '#B868F8');
    px(cx2, cy2 - 1, 1, 2, '#F8E8FF');
  }

  // Panel jugador — nuevo HUD estilo NDS pixel-art
  dBattleHud(370, 232, 260, 80, c, {
    isPlayer: true,
    status: battleState.playerStatus,
  });
  // Barra de EXP debajo del HUD
  dEXP(384, 318, 232, 4, c.ex, c.exTo);
  // Stages del jugador (T11)
  dStatStages(384, 328, battleState.playerStatMods, true);

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
    cx.fillText(
      `🧪${G.pot} ❤${G.rev} 💎${G.crv || 0} 💠${G.crvC || 0} 🔶${G.crvO || 0}`,
      25,
      456
    );
    if (b.ms === 4 && !(b.isMerch || b.isBoss || b.npcTeam)) {
      // Preview con el mejor cristal disponible
      const opts = availableCaptureCrystals();
      const best = opts.includes('o') ? 'o' : opts.includes('c') ? 'c' : opts[0] || 'p';
      const capChance = calcCaptureChance(b.en, best);
      cx.fillStyle = capChance >= 0.65 ? '#30D848' : capChance >= 0.35 ? '#C89000' : '#D02020';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`Mejor captura: ${Math.round(capChance * 100)}%`, 340, 456);
    }
  } else if (b.ph === 'captureSelect') {
    dBox(10, 360, 620, 110, 'Elegir Cristal');
    const opts = b.capOpts || availableCaptureCrystals();
    opts.forEach((code, i) => {
      const info = CRYSTAL_INFO[code];
      const y = 388 + i * 22;
      const selected = (b.capSel || 0) === i;
      cx.fillStyle = selected ? '#ffd700' : '#ccc';
      cx.font = '8px "Press Start 2P"';
      const n = crystalCount(G, code);
      const chance = calcCaptureChance(b.en, code);
      cx.fillText(
        `${selected ? '▶ ' : '  '}${info.label} x${n}  (~${Math.round(chance * 100)}%)`,
        30,
        y
      );
      // mini swatch
      cx.fillStyle = info.color;
      cx.fillRect(520, y - 10, 14, 12);
      cx.fillStyle = info.colorLight;
      cx.fillRect(523, y - 7, 4, 6);
    });
    cx.fillStyle = '#777';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('X: cancelar', 30, 456);
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
// BLOQUE 20: LÓGICA POST-GAME
// ============================================================

// Nicole crucificada - modificar sprite según estado
function isNicoleCrucified() {
  return postGame;
}

// Hernán sin barba post-game
function isHernanShaved() {
  return postGame;
}

// Gabriela con armadura post-game
function isGabrielaArmored() {
  return postGame;
}

// Obtener NPCs que pueden combatir solitarios post-game
function getSoloFighters() {
  return [
    npcs.find((n) => n.flag === 'metHer'),
    npcs.find((n) => n.flag === 'metDaniel'),
    npcs.find((n) => n.flag === 'metNic'),
  ].filter((n) => n);
}

// ============================================================
// BLOQUE 23: GUARDADO/CARGA localStorage
// ============================================================

function saveGame() {
  try {
    const save = {
      // Posición
      plx: G.pl.x,
      ply: G.pl.y,
      curMap: G.curMap,
      plD: G.pl.d,

      // Equipo
      party: G.party.map((c) => c.toJSON()),
      proa: proa.map((c) => c.toJSON()),

      // Inventario
      gold: G.gold,
      pot: G.pot,
      rev: G.rev,
      crv: G.crv,
      crvC: G.crvC || 0,
      crvO: G.crvO || 0,
      frag: G.frag || emptyFragments(),
      scrolls: G.scrolls || 0,
      fragrances: G.fragrances || emptyFragrances(),
      incense: G.incense || emptyFragrances(),
      activeIncense: G.activeIncense || null,
      bagUpgrade: !!G.bagUpgrade,

      // Progreso
      talkedTo: G.talkedTo,
      bossOk: G.bossOk,
      allTalked: G.allTalked,
      allCaught: G.allCaught,
      bWon: G.bWon,
      tExp: G.tExp,
      mFriend: G.mFriend,
      bossDialogs: G.bossDialogs,
      diplomas,

      // Post-game
      postGame,
      towerOpen,
      oloDefeated,
      pairBattles,
      npcDefeats,
      towerKey,
      captureCount,
      lastHealPos,

      // Mapas (semilla no, se regeneran pero guardamos posición)
      prevPos: G.prevPos,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    aN('¡Partida guardada!');
    sfx.sel();
  } catch (e) {
    aN('Error al guardar...');
    console.error('Save error:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const save = JSON.parse(raw);

    // Posición
    // Uso ?? (nullish coalescing) en vez de || para que valores como 0
    // NO sean sobrescritos por el fallback (bug clásico: y=0 caía al default).
    G.pl.x = save.plx ?? 20;
    G.pl.y = save.ply ?? 145;
    G.pl.d = save.plD ?? 0;
    // Reset de estado de movimiento: si venimos de una sesión donde el
    // jugador estaba a medio moverse, sin esto quedaba congelado.
    G.pl.f = 0;
    G.pl.sprint = false;
    G.pl.moving = false;
    G.pl.stepTarget = null;
    G.pl.stepFrom = null;
    G.pl.lastStepFrom = null;
    G.showObjects = false;
    G.os = null;
    G.curMap = save.curMap ?? 'world';

    // Equipo
    G.party = (save.party || []).map((j) => Cre.fromJSON(j));
    setProa((save.proa || []).map((j) => Cre.fromJSON(j)));

    // Inventario
    G.gold = save.gold ?? 200;
    G.pot = save.pot ?? 5;
    G.rev = save.rev ?? 2;
    G.crv = save.crv ?? 3;
    G.crvC = save.crvC ?? 0;
    G.crvO = save.crvO ?? 0;
    G.frag = { ...emptyFragments(), ...(save.frag || {}) };
    G.scrolls = save.scrolls ?? 0;
    G.fragrances = { ...emptyFragrances(), ...(save.fragrances || {}) };
    G.incense = { ...emptyFragrances(), ...(save.incense || {}) };
    G.activeIncense = save.activeIncense || null;
    G.bagUpgrade = !!save.bagUpgrade;
    G.find = null;
    G.craft = null;
    G.fabSel = 0;
    G.craftSel = 0;

    // Progreso
    G.talkedTo = save.talkedTo || {};
    G.bossOk = save.bossOk || false;
    G.allTalked = save.allTalked || false;
    G.allCaught = save.allCaught || false;
    G.bWon = save.bWon ?? 0;
    G.tExp = save.tExp ?? 0;
    G.mFriend = save.mFriend ?? 0;
    G.bossDialogs = save.bossDialogs ?? 0;
    setDiplomas(save.diplomas || {
      tamara: !!save.npcDefeats?.metTamara,
      luchito: !!save.npcDefeats?.metLuchito,
      andrea: !!save.npcDefeats?.metAndrea,
      dan: !!save.npcDefeats?.metDan,
    });

    // Post-game
    setPostGame(save.postGame || false);
    setTowerOpen(save.towerOpen || false);
    setOloDefeated(save.oloDefeated || false);
    setPairBattles(save.pairBattles || false);
    setNpcDefeats(save.npcDefeats || {});
    setTowerKey(save.towerKey || {
      edison: false,
      roberto: false,
      gabriela: false,
      ximena: false,
    });
    setCaptureCount(save.captureCount || {});
    // Default de lastHealPos: y=145 (Aldea Pitch), no 32 que caía al norte
    setLastHealPos(save.lastHealPos || { x: 60, y: 285, map: 'world' });

    G.prevPos = save.prevPos || null;

    // Regenerar torre si post-game
    if (postGame) genTower();

    // Verificaciones
    checkAllTalked();
    checkAllCaught();

    return true;
  } catch (e) {
    console.error('Load error:', e);
    return false;
  }
}

// ============================================================
// [refactor-phase2] bloque 'music' movido a src/

function updateMusic() {
  if (!sfx.on) return;
  if (G.scr === 'title') playMusic('title');
  else if (G.scr === 'battle') playMusic('battle');
  else if (G.scr === 'world') {
    if (G.curMap === 'world') playMusic('world');
    else if (G.curMap.startsWith('cave')) playMusic('cave');
    else if (G.curMap === 'castle') playMusic('castle');
    else if (G.curMap === 'tower') playMusic('tower');
  }
}

// ============================================================
// BLOQUE 25: LOOP PRINCIPAL + INICIALIZACIÓN
// ============================================================

function toggleSupervisorMode() {
  G.supervisor = !G.supervisor;
  if (G.supervisor) {
    G.scr = 'world';
    G.ms = null;
    G.showMap = false;
    G.proaOpen = false;
    G.showMissions = false;
    G.showDex = false;
    G.showObjects = false;
    G.os = null;
    aN('MODO SUPERVISOR: rutas libres, sin NPCs ni encuentros');
    aN('Puedes entrar al Castillo y a la Torre libremente');
  } else {
    aN('Modo supervisor desactivado');
  }
  sfx.sel();
}

// ============================================================
// MODO BATALLADOR (testing de combate)
// ============================================================
// Activado con la tecla 'P' desde el mundo. Reemplaza temporalmente el
// equipo del jugador con 6 criaturas nivel 20 elegidas por el jugador,
// cada una con 4 ataques temáticos según su tipo (1 daño + 1 estado +
// 1 baja stat rival + 1 sube stat propia).
//
// - No gana experiencia
// - No modifica misiones ni flags
// - Se guarda el equipo original y se restaura al salir del modo
// - Sirve para probar mecánicas de estados, drenaje, buffs, etc.
// ============================================================

// Movesets temáticos por tipo (4 ataques: daño, estado, baja stat, sube stat)
const BATALLADOR_MOVESETS = {
  fire: ['Bola Ígnea', 'Lluvia Ígnea', 'Pantalla Humo', 'Nitrocarga'],
  water: ['Hidrobomba', 'Torbellino', 'Rayo Burbuja', 'Refugio'],
  plant: ['Bomba Semilla', 'Drenadoras', 'Látigo Cepa', 'Crecimiento'],
  dragon: ['Aliento Dragón', 'Garra Umbría', 'Mirada Dragón', 'Danza Dragón'],
  fairy: ['Rayo Feérico', 'Voz Cautivadora', 'Encanto Total', 'Deseo'],
  normal: ['Golpe Divino', 'Golpe Cuerpo', 'Picotazo', 'Danza Espada'],
};

// Snapshot del estado del jugador antes de entrar al modo batallador
let batalladorSnapshot = null;

// Lista de IDs seleccionables (todas las especies base, sin evoluciones repetidas)
function getBatalladorCandidates() {
  return Object.keys(CDB); // todos los IDs del CDB
}

function createBatalladorCre(id) {
  const cre = new Cre(id, 20);
  // Reemplazar movimientos por el moveset temático de su tipo
  const tp = cre.tp;
  const movesetNames = BATALLADOR_MOVESETS[tp] || BATALLADOR_MOVESETS.normal;
  const newMoves = movesetNames
    .map((nm) => ALL_MOVES.find((m) => m.nm === nm))
    .filter(Boolean)
    .map((m) => ({ ...m, pp: m.mp }));
  if (newMoves.length > 0) cre.mv = newMoves;
  return cre;
}

function enterBatalladorMode(selectedIds, opponent) {
  // Guardar snapshot del estado original
  batalladorSnapshot = {
    party: G.party.map((c) => c.toJSON()),
    proa: proa.map((c) => c.toJSON()),
    gold: G.gold,
    pot: G.pot,
    rev: G.rev,
    crv: G.crv,
    crvC: G.crvC || 0,
    crvO: G.crvO || 0,
    frag: { ...(G.frag || emptyFragments()) },
    scrolls: G.scrolls || 0,
    plX: G.pl.x,
    plY: G.pl.y,
    curMap: G.curMap,
  };
  // Reemplazar equipo con las 6 criaturas seleccionadas
  G.party = selectedIds.map((id) => createBatalladorCre(id));
  // Dar objetos de prueba (incluye las 3 rarezas de cristal)
  G.gold = 9999;
  G.pot = 20;
  G.rev = 10;
  G.crv = 10;
  G.crvC = 5;
  G.crvO = 3;
  G.scrolls = Math.max(G.scrolls || 0, 4);
  G.batallador = true;
  G.scr = 'world';
  aN('MODO BATALLADOR: equipo test cargado');
  aN('No ganarás EXP. Sin efectos sobre misiones.');

  // Si hay oponente definido, iniciar batalla inmediatamente
  if (opponent) {
    startBatalladorNPCBattle(opponent);
  } else {
    sfx.win();
  }
}

function exitBatalladorMode() {
  if (!batalladorSnapshot) {
    G.batallador = false;
    return;
  }
  // Restaurar estado original
  G.party = batalladorSnapshot.party.map((j) => Cre.fromJSON(j));
  setProa(batalladorSnapshot.proa.map((j) => Cre.fromJSON(j)));
  G.gold = batalladorSnapshot.gold;
  G.pot = batalladorSnapshot.pot;
  G.rev = batalladorSnapshot.rev;
  G.crv = batalladorSnapshot.crv;
  G.crvC = batalladorSnapshot.crvC ?? 0;
  G.crvO = batalladorSnapshot.crvO ?? 0;
  G.frag = { ...emptyFragments(), ...(batalladorSnapshot.frag || {}) };
  G.scrolls = batalladorSnapshot.scrolls ?? 0;
  G.pl.x = batalladorSnapshot.plX;
  G.pl.y = batalladorSnapshot.plY;
  G.curMap = batalladorSnapshot.curMap;
  batalladorSnapshot = null;
  G.batallador = false;
  aN('Modo batallador desactivado. Estado original restaurado.');
  sfx.sel();
}

function toggleBatalladorMode() {
  if (G.batallador) {
    exitBatalladorMode();
    return;
  }
  // Abrir pantalla de selección de 6 criaturas (fase 1)
  const candidates = getBatalladorCandidates();
  G.batalladorSel = {
    phase: 'creatures',  // 'creatures' o 'opponent'
    candidates,           // IDs disponibles
    selected: [],         // IDs elegidos (hasta 6)
    cursor: 0,            // posición en la grilla
    columns: 6,           // grid 6 columnas
    opponentCursor: 0,    // cursor de selección de oponente
  };
  G.scr = 'batalladorSelect';
  sfx.sel();
}

// -------- Pantalla de selección del modo batallador (2 fases) --------
// Lista de oponentes del modo batallador (NPCs con batalla en el juego)
function buildBatalladorOpponentList() {
  const list = [];
  // Recorrer npcs, castNpcs, caveNpcs buscando los que tienen battle
  const all = [...npcs, ...castNpcs, ...caveNpcs];
  all.forEach((n) => {
    if (n.battle && n.nm && !n.boss && !list.some((o) => o.nm === n.nm)) {
      list.push({ nm: n.nm, tp: n.tp, team: n.team, fixedTeam: n.fixedTeam, isAngelly: n.isAngelly, isPunk: n.isPunk });
    }
  });
  // Agregar Edison y jefes especiales
  if (edisonNPC && edisonNPC.battle) {
    list.push({ nm: edisonNPC.nm, tp: edisonNPC.tp, fixedTeam: edisonNPC.fixedTeam, isMerch: false });
  }
  // Pachi / André aunque battle:false en mundo (teatro); en batallador pelean directo
  const pachi = npcs.find((n) => n.flag === 'metPac');
  if (pachi && !list.some((o) => o.nm === pachi.nm)) {
    list.push({
      nm: pachi.nm,
      tp: pachi.tp,
      fixedTeam: pachi.fixedTeam,
      battleIntro: pachi.battleIntro,
    });
  }
  const andreTown = npcs.find((n) => n.flag === 'metAnd');
  if (andreTown && !list.some((o) => o.nm === andreTown.nm)) {
    list.push({
      nm: andreTown.nm,
      tp: andreTown.tp,
      fixedTeam: andreTown.fixedTeam,
      battleIntro: andreTown.battleIntro,
    });
  }
  // Agregar combates en pareja
  pairBattleData.forEach((pair) => {
    list.push({ nm: pair.nm, isPair: true, team: [...pair.t1.map((c) => ({ id: c.id, lv: 20 })), ...pair.t2.map((c) => ({ id: c.id, lv: 20 }))] });
  });
  // NPCs sin battle flag pero con fixedTeam (tutoriales)
  list.push({ nm: 'Alessandro', tp: 'alessandro', fixedTeam: [{ id: 'ivygoat' }, { id: 'pinzardo' }], battleIntro: ['¡Velocidad es poder!', '¡A pelear!'] });
  // Opción sin oponente: explorar el mundo
  list.push({ nm: 'Sin oponente (explorar el mundo)', _skip: true });
  return list;
}

function uBatalladorSelect() {
  const s = G.batalladorSel;
  if (!s) { G.scr = 'world'; return; }

  // Fase 1: elegir criaturas
  if (s.phase === 'creatures') {
    const cols = s.columns;
    const total = s.candidates.length;
    const rows = Math.ceil(total / cols);
    const visRows = 8; // filas visibles en pantalla
    if (s.scrollRow === undefined) s.scrollRow = 0;
    const maxScroll = Math.max(0, rows - visRows);

    if (kp('ArrowRight')) { s.cursor = (s.cursor + 1) % total; sfx.walk(); }
    if (kp('ArrowLeft'))  { s.cursor = (s.cursor - 1 + total) % total; sfx.walk(); }
    if (kp('ArrowDown'))  { s.cursor = Math.min(total - 1, s.cursor + cols); sfx.walk(); }
    if (kp('ArrowUp'))    { s.cursor = Math.max(0, s.cursor - cols); sfx.walk(); }

    // Auto-scroll para mantener cursor en pantalla
    const cursorRow = Math.floor(s.cursor / cols);
    if (cursorRow < s.scrollRow) s.scrollRow = cursorRow;
    if (cursorRow >= s.scrollRow + visRows) s.scrollRow = cursorRow - visRows + 1;

    if (kp(' ')) {
      const id = s.candidates[s.cursor];
      const idx = s.selected.indexOf(id);
      if (idx >= 0) {
        s.selected.splice(idx, 1);
        sfx.walk();
      } else if (s.selected.length < 6) {
        s.selected.push(id);
        sfx.sel();
      }
    }
    // 'O' = elegir oponente (solo si hay al menos 1 criatura seleccionada)
    if (kp('o') && s.selected.length > 0) {
      s.phase = 'opponent';
      s.opponents = buildBatalladorOpponentList();
      s.opponentCursor = 0;
      s.opponentScroll = 0;
      sfx.sel();
      return;
    }
    // Enter sin 'o': entrar al mundo sin pelear
    if (kp('Enter') && s.selected.length >= 6) {
      const ids = s.selected.slice();
      G.batalladorSel = null;
      enterBatalladorMode(ids, null);
      return;
    }
  }
  // Fase 2: elegir oponente
  else if (s.phase === 'opponent') {
    const opps = s.opponents || [];
    const maxV = 16; // máximo visible en pantalla
    if (!s.opponentScroll) s.opponentScroll = 0;

    if (kp('ArrowUp')) {
      s.opponentCursor = (s.opponentCursor + opps.length - 1) % opps.length;
      // Auto-scroll: mantener cursor visible
      if (s.opponentCursor < s.opponentScroll) s.opponentScroll = s.opponentCursor;
      if (s.opponentCursor >= s.opponentScroll + maxV) s.opponentScroll = s.opponentCursor - maxV + 1;
      sfx.walk();
    }
    if (kp('ArrowDown')) {
      s.opponentCursor = (s.opponentCursor + 1) % opps.length;
      if (s.opponentCursor < s.opponentScroll) s.opponentScroll = s.opponentCursor;
      if (s.opponentCursor >= s.opponentScroll + maxV) s.opponentScroll = s.opponentCursor - maxV + 1;
      sfx.walk();
    }
    if (kp('x') || kp('Escape')) {
      s.phase = 'creatures';
      s.opponents = null;
      s.opponentCursor = 0;
      s.opponentScroll = 0;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      const opp = opps[s.opponentCursor];
      const ids = s.selected.slice();
      G.batalladorSel = null;
      // Si eligió "sin oponente", entrar sin pelear
      enterBatalladorMode(ids, opp._skip ? null : opp);
      return;
    }
  }

  if (s.phase === 'creatures' && (kp('x') || kp('Escape'))) {
    G.batalladorSel = null;
    G.scr = 'world';
    sfx.sel();
  }
}

function dBatalladorSelect() {
  const s = G.batalladorSel;
  if (!s) return;

  // Fondo oscuro
  cx.fillStyle = '#0a0a1e';
  cx.fillRect(0, 0, 640, 480);

  // Título común
  cx.fillStyle = '#ffd700';
  cx.font = '14px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('MODO BATALLADOR', 320, 26);
  cx.textAlign = 'left';

  // === FASE 1: SELECCIÓN DE CRIATURAS ===
  if (s.phase === 'creatures') {
    cx.fillStyle = '#D8D8E8';
    cx.font = '9px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(`Elige criaturas nivel 20 (${s.selected.length}/6)`, 320, 46);
    cx.textAlign = 'left';

    const cols = s.columns;
    const total = s.candidates.length;
    const rows = Math.ceil(total / cols);
    const visRows = 8;
    if (s.scrollRow === undefined) s.scrollRow = 0;
    const cellW = 96, cellH = 44;
    const startX = 32, startY = 62;
    const startIdx = s.scrollRow * cols;
    const endIdx = Math.min(total, startIdx + visRows * cols);

    for (let i = startIdx; i < endIdx; i++) {
      const id = s.candidates[i];
      const relIdx = i - startIdx;
      const r = Math.floor(relIdx / cols);
      const c = relIdx % cols;
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      if (y > 410) continue;

      const isCursor = i === s.cursor;
      const isSelected = s.selected.includes(id);
      cx.fillStyle = isSelected ? '#2a5a2a' : (isCursor ? '#3a3a5e' : '#1a1a2e');
      cx.fillRect(x, y, cellW - 4, cellH - 4);
      cx.strokeStyle = isCursor ? '#ffd700' : (isSelected ? '#68d858' : '#484858');
      cx.lineWidth = isCursor ? 2 : 1;
      cx.strokeRect(x + 0.5, y + 0.5, cellW - 5, cellH - 5);
      const data = CDB[id];
      if (data) {
        cx.fillStyle = tCol(data.tp);
        cx.font = '7px "Press Start 2P"';
        cx.fillText(`${tEmo(data.tp)}${data.nm.slice(0, 10)}`, x + 4, y + 12);
        cx.fillStyle = '#B8B8C8';
        cx.font = '5px "Press Start 2P"';
        cx.fillText(`HP${data.hp} AK${data.ak} DF${data.df} SP${data.sp}`, x + 4, y + 26);
        if (isSelected) {
          cx.fillStyle = '#ffd700';
          cx.font = '8px "Press Start 2P"';
          cx.fillText(`#${s.selected.indexOf(id) + 1}`, x + cellW - 22, y + 12);
        }
      }
    }
    if (rows > visRows) {
      cx.fillStyle = '#606878';
      cx.font = '5px "Press Start 2P"';
      cx.textAlign = 'center';
      cx.fillText(`↑ ${s.scrollRow + 1}-${Math.min(s.scrollRow + visRows, rows)} de ${rows} filas ↓`, 320, startY + visRows * cellH + 8);
      cx.textAlign = 'left';
    }

    cx.fillStyle = '#0a0a2e';
    cx.fillRect(0, 440, 640, 40);
    cx.strokeStyle = '#ffd700';
    cx.strokeRect(0.5, 440.5, 639, 39);
    cx.fillStyle = '#D8D8E8';
    cx.font = '6px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Flechas: mover  |  SPACE: agregar/quitar  |  O: elegir oponente', 320, 456);
    cx.fillText('X: cancelar  |  ENTER (6 criaturas): ir al mundo sin pelear', 320, 470);
    cx.textAlign = 'left';
  }
  // === FASE 2: SELECCIÓN DE OPONENTE ===
  else if (s.phase === 'opponent') {
    const opps = s.opponents || [];
    const maxV = 16;
    if (s.opponentScroll === undefined) s.opponentScroll = 0;

    cx.fillStyle = '#D8D8E8';
    cx.font = '9px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(`Elige tu oponente (nivel 20) — ${opps.length} disponibles`, 320, 46);
    cx.textAlign = 'left';

    // Mostrar equipo seleccionado en mini
    cx.fillStyle = '#68d858';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Tu equipo: ' + s.selected.map((id) => CDB[id]?.nm || id).slice(0, 6).join(', '), 20, 60);

    const startY = 78;
    const endIdx = Math.min(opps.length, s.opponentScroll + maxV);
    for (let i = s.opponentScroll; i < endIdx; i++) {
      const opp = opps[i];
      const py = startY + (i - s.opponentScroll) * 24;
      const sel = s.opponentCursor === i;
      if (sel) {
        cx.fillStyle = 'rgba(255,215,0,.12)';
        cx.fillRect(18, py - 4, 604, 20);
      }
      cx.fillStyle = sel ? '#ffd700' : (opp._skip ? '#A0B0C0' : '#fff');
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`${sel ? '▶ ' : '  '}${opp.nm}`, 30, py + 10);
      // Mostrar criaturas del oponente
      let teamPreview = '';
      if (opp._skip) {
        teamPreview = '(entrar al mapa sin combatir)';
      } else if (opp.fixedTeam) {
        teamPreview = opp.fixedTeam.map((c) => CDB[c.id]?.nm || c.id).join(', ');
      } else if (opp.team) {
        teamPreview = opp.team.map((c) => CDB[c.id]?.nm || c.id).join(', ');
      } else if (opp.isPair) {
        teamPreview = '(combate en pareja)';
      } else {
        teamPreview = '(equipo aleatorio)';
      }
      cx.fillStyle = '#888';
      cx.font = '5px "Press Start 2P"';
      cx.fillText(teamPreview, 36, py + 18);
    }

    // Indicador de scroll
    if (opps.length > maxV) {
      cx.fillStyle = '#606878';
      cx.font = '5px "Press Start 2P"';
      cx.textAlign = 'center';
      cx.fillText(`↑ ${s.opponentScroll + 1}-${endIdx} de ${opps.length} ↓`, 320, startY + maxV * 24 + 10);
      cx.textAlign = 'left';
    }

    cx.fillStyle = '#0a0a2e';
    cx.fillRect(0, 440, 640, 40);
    cx.strokeStyle = '#ffd700';
    cx.strokeRect(0.5, 440.5, 639, 39);
    cx.fillStyle = '#D8D8E8';
    cx.font = '6px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Flechas: elegir  |  SPACE: confirmar  |  X: volver', 320, 456);
    cx.fillText('El oponente usará su equipo real a nivel 20', 320, 470);
    cx.textAlign = 'left';
  }
}

// ============================================================
// LOCAL TITLE FUNCTIONS (usan la misma G de game.js)
// ============================================================
function startNewGameFlow() {
  clearAllGameSaves();
  G.hasSave = false;
  G.sSel = 0;
  G.curMap = 'world';
  G.pl.x = EXPANDED_SPAWN.player.x;
  G.pl.y = EXPANDED_SPAWN.player.y;
  G.pl.d = 3;
  G.pl.stepTarget = null;
  G.pl.moving = false;
  // Inventario base de partida NORMAL (interactúa con ciudadanos)
  G.party = [];
  G.gold = 200;
  G.pot = 5;
  G.rev = 2;
  G.crv = 3;
  G.crvC = 0;
  G.crvO = 0;
  G.frag = emptyFragments();
  G.scrolls = 0;
  G.fragrances = emptyFragrances();
  G.incense = emptyFragrances();
  G.activeIncense = null;
  G.bagUpgrade = false;
  G.supervisor = false;
  G.batallador = false;
  G.scr = 'intro';
  G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
}

function uTitle() {
  G.tFr++;
  if (G.tFr > 182 && !G.titleHornPlayed) {
    playTitleHorn();
    G.titleHornPlayed = true;
  }
  const optCount = 2; // Siempre 2 opciones: Continuar y Nueva partida
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.titleSel = (G.titleSel + optCount - 1) % optCount;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.titleSel = (G.titleSel + 1) % optCount;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    G.hasSave = hasSaveGame(); // refrescar cada vez
    if (G.hasSave && G.titleSel === 0) {
      const fn = window.__gameLoadGame;
      if (fn && fn()) {
        G.scr = 'world';
        aN('¡Partida cargada!');
      } else {
        startNewGameFlow();
      }
    } else if (G.hasSave && G.titleSel === 1) {
      G.scr = 'confirmReset';
      G.resetSel = 1;
      G.resetFromTitle = true;
    } else {
      startNewGameFlow();
    }
  }
}

// ============================================================
function uIntro() {
  if (!G.intro) G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
  const it = G.intro;
  if (G.tFr % 60 === 0) console.log('[uIntro] phase:', it.phase, 'y:', it.y, 'scr:', G.scr);
  if (it.phase === 0) {
    it.y += 2.4;
    if (it.y >= 198 || kp(' ') || kp('Enter')) {
      it.y = 198;
      it.phase = 1;
      it.tm = 0;
    }
    return;
  }
  it.tm++;
  const line = INTRO_LINES[it.li];
  if (!it.full && it.tm % 2 === 0) {
    it.ci++;
    if (it.ci >= line.length) it.full = true;
  }
  if (kp(' ') || kp('Enter')) {
    if (!it.full) {
      it.ci = line.length;
      it.full = true;
    } else {
      it.li++;
      if (it.li >= INTRO_LINES.length) {
        G.sSel = 0;
        G.scr = 'starter';
        G.intro = null;
        return;
      }
      it.ci = 0;
      it.tm = 0;
      it.full = false;
      sfx.sel();
    }
  }
}

function uStarter() {
  if (kp('ArrowLeft')) {
    G.sSel = (G.sSel + 2) % 3;
    sfx.sel();
  }
  if (kp('ArrowRight')) {
    G.sSel = (G.sSel + 1) % 3;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    const ids = ['flameye', 'axolotl', 'gorilan'];
    const c = new Cre(ids[G.sSel], 5);
    G.party = [c];
    setProa([]);
    sfx.cap();
    G.curMap = 'world';
    G.pl.x = EXPANDED_SPAWN.player.x;
    G.pl.y = EXPANDED_SPAWN.player.y;
    G.pl.d = EXPANDED_SPAWN.player.d;
    G.pl.stepTarget = null;
    G.pl.moving = false;
    updateCamera(WC, WR);
    // Evita que el SPACE usado para confirmar dispare otra acción en el primer frame del mundo.
    G.keys[' '] = false;
    G.keys['Enter'] = false;
    G.held[' '] = false;
    G.held['Enter'] = false;
    G.kcd[' '] = false;
    G.kcd['Enter'] = false;
    G.scr = 'world';
    aN(`¡${c.nm} se unió a tu equipo!`);
  }
}

// ============================================================
// T5: FABIANA CRAFTING (lógica INLINE por bug double-G)
// ============================================================

function uFabianaChoice() {
  if (kp('ArrowUp') || kp('ArrowDown') || kp('ArrowLeft') || kp('ArrowRight')) {
    G.fabSel = (G.fabSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.fabSel === 0) {
      // Sí → mini pantalla de crafting
      G.craftFromBag = false;
      G.scr = 'fabianaCraft';
      G.craftSel = 0;
    } else {
      // No
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Fabiana' },
        dlgArr: ['Está bien, cuando quieras', 'hacer arte, acá estoy.'],
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
      };
    }
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'world';
    sfx.sel();
  }
}

// ============================================================
// T7: CLAUDIA — mochila mejorada (crafting portátil)
// ============================================================

// ============================================================
// T10: GONCHI — Correo del Reino (trueque 2 objetos → 1 random)
// ============================================================

function openGonchiTrade() {
  G.trade = {
    phase: 'pick', // pick | result
    sel: 0,
    scroll: 0,
    picked: [], // [{id, label}]
    paidLabels: null,
    rewardLabel: null,
  };
  G.scr = 'gonchiTrade';
  sfx.sel();
}

function uGonchiTrade() {
  const t = G.trade;
  if (!t) {
    G.scr = 'world';
    return;
  }

  if (t.phase === 'result') {
    if (kp(' ') || kp('Enter') || kp('x') || kp('Escape')) {
      G.trade = null;
      G.scr = 'world';
      sfx.sel();
    }
    return;
  }

  const rows = buildTradeInventory();
  const n = rows.length;
  const VIS = 9;

  if (!n) {
    if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
      G.trade = null;
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Gonchi' },
        dlgArr: [
          'No traés nada para el correo.',
          'Volvé cuando tengas objetos.',
        ],
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
      };
      sfx.nef();
    }
    return;
  }

  if (t.sel >= n) t.sel = n - 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    t.sel = (t.sel + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    t.sel = (t.sel + 1) % n;
    sfx.sel();
  }
  if (t.sel < (t.scroll || 0)) t.scroll = t.sel;
  if (t.sel >= (t.scroll || 0) + VIS) t.scroll = t.sel - VIS + 1;

  // SPACE: agregar 1 unidad del objeto (máx 2 total; mismo id 2× si hay stock).
  // Si no se puede agregar y este id ya está marcado → quitar 1.
  if (kp(' ')) {
    const row = rows[t.sel];
    if (!row) return;
    if (!t.picked) t.picked = [];
    const markedOf = t.picked.filter((p) => p.id === row.id).length;
    const canAdd = t.picked.length < 2 && markedOf < row.count;
    if (canAdd) {
      t.picked.push({ id: row.id, label: row.label });
      sfx.sel();
      return;
    }
    // Quitar una marca de este id si existe
    for (let i = t.picked.length - 1; i >= 0; i--) {
      if (t.picked[i].id === row.id) {
        t.picked.splice(i, 1);
        sfx.sel();
        return;
      }
    }
    aN(t.picked.length >= 2 ? 'Ya hay 2. ENTER envía o quitá uno.' : 'Sin stock.');
    sfx.nef();
  }

  // ENTER: confirmar trueque
  if (kp('Enter')) {
    if ((t.picked || []).length < 2) {
      aN('Elegí 2 objetos (SPACE).');
      sfx.nef();
      return;
    }
    // Validar stock real (por si hay 2 del mismo)
    const need = {};
    t.picked.forEach((p) => {
      need[p.id] = (need[p.id] || 0) + 1;
    });
    for (const id of Object.keys(need)) {
      if (countOwned(id) < need[id]) {
        aN('Stock insuficiente.');
        sfx.nef();
        t.picked = [];
        return;
      }
    }
    // Cobrar
    for (const id of Object.keys(need)) {
      if (!applyTradeItem(id, -need[id])) {
        aN('Error al entregar.');
        sfx.nef();
        return;
      }
    }
    // Premio random (puede ser upgrade o downgrade)
    let reward = rollTradeReward();
    // Evitar devolver exactamente lo mismo que pagaste si hay alternativas
    // (suave: solo re-roll 1 vez)
    const paidSet = new Set(t.picked.map((p) => p.id));
    if (paidSet.has(reward.id) && paidSet.size === 1) {
      reward = rollTradeReward();
    }
    applyTradeItem(reward.id, 1);
    t.paidLabels = t.picked.map((p) => p.label);
    t.rewardLabel = reward.label;
    t.phase = 'result';
    sfx.cap();
    aN(`Correo: +${reward.label}`);
  }

  if (kp('x') || kp('Escape')) {
    G.trade = null;
    G.scr = 'world';
    sfx.sel();
  }
}

// ============================================================
// T9: TEATRO — Pachi (representaciones) / André (jefes pre-game)
// ============================================================

function openTheater(host) {
  const bill = host === 'andre' ? ANDRE_BILL.slice() : PACHI_BILL.slice();
  // André solo post-game (ya está postOnly en el NPC)
  if (host === 'andre' && !postGame) {
    aN('André aún no está en el pueblo.');
    G.scr = 'world';
    return;
  }
  G.theater = { host, bill, sel: 0, scroll: 0 };
  G.scr = 'theater';
  sfx.sel();
}

function uTheater() {
  const t = G.theater;
  if (!t) {
    G.scr = 'world';
    return;
  }
  const bill = t.bill || [];
  const n = bill.length;
  const VIS = 7;
  if (!n) {
    if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
      G.theater = null;
      G.scr = 'world';
    }
    return;
  }
  if (t.sel >= n) t.sel = n - 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    t.sel = (t.sel + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    t.sel = (t.sel + 1) % n;
    sfx.sel();
  }
  if (t.sel < (t.scroll || 0)) t.scroll = t.sel;
  if (t.sel >= (t.scroll || 0) + VIS) t.scroll = t.sel - VIS + 1;

  if (kp(' ') || kp('Enter')) {
    const act = bill[t.sel];
    if (act) startTheaterBattle(act, t.host);
  }
  if (kp('x') || kp('Escape')) {
    G.theater = null;
    G.scr = 'world';
    sfx.sel();
  }
}

/**
 * Batalla de teatro / ensayo.
 * - Da EXP y oro como pelea normal (diseño cerrado T9).
 * - NO marca npcDefeats, NO da diplomas, NO abre torre/post-game.
 * - Sprites: usa tp del acto (pre-game look cuando haya PNG).
 */
function startTheaterBattle(act, host) {
  if (!act || !G.party.length) {
    aN('Sin equipo para el escenario.');
    sfx.nef();
    return;
  }
  clearPlayerMotion();
  G.party.forEach((c) => (c.fought = false));

  let team;
  if (act.bossLv) {
    const bossLv = Math.max(40, secondStrongestLv());
    team = (act.team || []).map((c) => new Cre(c.id, bossLv));
  } else {
    const lv = Math.max(5, scaledLv());
    team = (act.team || []).map((c) => new Cre(c.id, lv));
  }
  if (!team.length) {
    aN('Escena incompleta.');
    sfx.nef();
    return;
  }

  const hostNm = host === 'andre' ? 'André' : 'Pachi';
  const intro = act.intro || [`¡${act.nm} entra en escena!`];

  G.bs = {
    pi: 0,
    en: team[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `${hostNm} presenta: ¡${act.nm}!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false, // SÍ dan EXP y oro
    isMerch: false,
    isBoss: false, // no es el boss real (no diálogos de Navarrete / post-game)
    expMult: host === 'andre' ? 1.15 : 1.05,
    fought: [0],
    npcTeam: team,
    npcIdx: 0,
    npcName: act.nm,
    // npcData sin flag/isLeader → no diplomas ni markNPCDefeated útil
    npcData: {
      nm: act.nm,
      tp: act.tp,
      isTheater: true,
      theaterHost: host,
      // sin flag / sin isLeader
    },
    isAngelly: false,
    isPunk: false,
    isNPC: true,
    npcSprite: act.tp || null, // aspecto del personaje representado
    npcIntro: intro,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
    isTheater: true,
  };
  G.theater = null;
  G.scr = 'battle';
  sfx.bat();
  aN(host === 'andre' ? 'Ensayo de jefes…' : '¡Se alza el telón!');
}

// ============================================================
// T8: HERNÁN — tutor (2 Pergaminos de Batalla)
// ============================================================

const HERNAN_TISHE_LINES = [
  'Tishe estaría orgullosa.',
  'Hey a Tishe también le gusta ese movimiento.',
];

function hernanFlavorForMove(mv) {
  if (mv && mv.tp === 'water') {
    return 'A Tishe no le gusta que comparta mis bebidas... solo no le digas jeje';
  }
  return HERNAN_TISHE_LINES[Math.floor(Math.random() * HERNAN_TISHE_LINES.length)];
}

function uHernanChoice() {
  if (kp('ArrowUp') || kp('ArrowDown') || kp('ArrowLeft') || kp('ArrowRight')) {
    G.herSel = (G.herSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.herSel === 0) {
      if ((G.scrolls || 0) < TUTOR_COST) {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: 'Hernán' },
          dlgArr: [
            `Necesito ${TUTOR_COST} Pergaminos de Batalla.`,
            `Solo tenés ${G.scrolls || 0}.`,
            'Buscá pines en el mapa: a veces sueltan uno.',
          ],
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      } else if (!G.party.length) {
        aN('No tenés criaturas.');
        sfx.nef();
        G.scr = 'world';
      } else {
        G.herCreSel = 0;
        G.scr = 'hernanPickCre';
      }
    } else {
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Hernán' },
        dlgArr: ['Cuando quieras aprender algo,', 'traé pergaminos. Tishe... estaría contenta.'],
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
      };
    }
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'world';
    sfx.sel();
  }
}

function uHernanPickCre() {
  const n = G.party.length;
  if (!n) {
    G.scr = 'world';
    return;
  }
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.herCreSel = (G.herCreSel + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.herCreSel = (G.herCreSel + 1) % n;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    const cre = G.party[G.herCreSel];
    const moves = getTutorMoves(cre);
    if (!moves.length) {
      aN('Esa criatura no tiene pool de tutor.');
      sfx.nef();
    } else {
      G.herMoveSel = 0;
      G.herMoveScroll = 0;
      G.scr = 'hernanPickMove';
      sfx.sel();
    }
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'hernanChoice';
    sfx.sel();
  }
}

function uHernanPickMove() {
  const cre = G.party[G.herCreSel || 0];
  const moves = getTutorMoves(cre);
  const n = moves.length;
  const VIS = 8;
  if (!n) {
    G.scr = 'hernanPickCre';
    return;
  }
  if (G.herMoveSel >= n) G.herMoveSel = n - 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.herMoveSel = (G.herMoveSel + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.herMoveSel = (G.herMoveSel + 1) % n;
    sfx.sel();
  }
  if (G.herMoveSel < (G.herMoveScroll || 0)) G.herMoveScroll = G.herMoveSel;
  if (G.herMoveSel >= (G.herMoveScroll || 0) + VIS) {
    G.herMoveScroll = G.herMoveSel - VIS + 1;
  }
  if (kp(' ') || kp('Enter')) {
    const row = moves[G.herMoveSel];
    if (!row) return;
    if (row.known) {
      aN(`${cre.nm} ya sabe ${row.mv.nm}.`);
      sfx.nef();
    } else {
      G.herSlotSel = 0;
      G.scr = 'hernanPickSlot';
      sfx.sel();
    }
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'hernanPickCre';
    sfx.sel();
  }
}

function uHernanPickSlot() {
  const cre = G.party[G.herCreSel || 0];
  const moves = getTutorMoves(cre);
  const moveRow = moves[G.herMoveSel || 0];
  if (!cre || !moveRow) {
    G.scr = 'hernanPickMove';
    return;
  }
  const slots = cre.mv.length; // 0..slots-1 replace, slots = cancel
  const total = slots + 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.herSlotSel = (G.herSlotSel + total - 1) % total;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.herSlotSel = (G.herSlotSel + 1) % total;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    if (G.herSlotSel >= slots) {
      // cancelar
      G.scr = 'hernanPickMove';
      sfx.sel();
      return;
    }
    if ((G.scrolls || 0) < TUTOR_COST) {
      aN('Sin pergaminos suficientes.');
      sfx.nef();
      G.scr = 'world';
      return;
    }
    // Cobrar y enseñar
    G.scrolls -= TUTOR_COST;
    const oldName = cre.mv[G.herSlotSel].nm;
    const newMove = { ...moveRow.mv, pp: moveRow.mv.mp };
    cre.mv[G.herSlotSel] = newMove;
    const flavor = hernanFlavorForMove(newMove);
    sfx.lvl();
    aN(`¡${cre.nm} aprendió ${newMove.nm}!`);
    G.scr = 'dialog';
    G.ds = {
      npc: { nm: 'Hernán' },
      dlgArr: [
        `¡${cre.nm} olvidó ${oldName}!`,
        `Ahora sabe ${newMove.nm}.`,
        flavor,
        `(-${TUTOR_COST} pergaminos)`,
      ],
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'hernanPickMove';
    sfx.sel();
  }
}

function uClaudiaChoice() {
  if (kp('ArrowUp') || kp('ArrowDown') || kp('ArrowLeft') || kp('ArrowRight')) {
    G.claSel = (G.claSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.claSel === 0) {
      if (G.bagUpgrade) {
        aN('Ya tenés la mochila mejorada.');
        G.scr = 'world';
      } else if ((G.gold || 0) < BAG_UPGRADE_PRICE) {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: 'Claudia' },
          dlgArr: [
            `Te faltan ${BAG_UPGRADE_PRICE - (G.gold || 0)}G.`,
            'Ahorrá un poco más y volvé.',
            '¡Es una inversión permanente!',
          ],
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      } else {
        G.gold -= BAG_UPGRADE_PRICE;
        G.bagUpgrade = true;
        sfx.cap();
        aN('¡Mochila mejorada! Slot LaFot desbloqueado.');
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: 'Claudia' },
          dlgArr: [
            '¡Listo! Mochila reforzada.',
            'En el menú aparece LaFot:',
            'Laboratorio de fotografía.',
            'Ahí armás cristales con fragmentos.',
          ],
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
      }
    } else {
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Claudia' },
        dlgArr: ['Está bien. Cuando juntes oro,', 'acá estoy. ¡Ahorrá!'],
        li: 0,
        ci: 0,
        tm: 0,
        full: false,
      };
    }
  }
  if (kp('x') || kp('Escape')) {
    G.scr = 'world';
    sfx.sel();
  }
}

function uFabianaCraft() {
  const opts = craftOptions();
  const n = opts.length;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.craftSel = (G.craftSel + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.craftSel = (G.craftSel + 1) % n;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    const opt = opts[G.craftSel];
    if (!opt || !opt.can) {
      aN(`Necesitas 4 ${opt ? opt.fragLabel : 'fragmentos'}.`);
      sfx.nef();
    } else {
      // Consumir 4 fragmentos y empezar animación
      if (!G.frag) G.frag = emptyFragments();
      G.frag[opt.code] = Math.max(0, (G.frag[opt.code] || 0) - 4);
      // Sumar cristal al inventario al REVEAL (no antes) para que el
      // "obtuviste" se sienta al final. Guardamos pending en G.craft.
      G.craft = {
        code: opt.code,
        phase: 'gather', // gather → flash → reveal
        tm: 0,
        ticks: 0, // cuántos fragmentos ya "sonaron"
        applied: false,
      };
      G.scr = 'fabianaAnim';
      sfx.sel();
    }
  }
  if (kp('x') || kp('Escape')) {
    // Si venía de la mochila, volver a Objetos
    if (G.craftFromBag) {
      G.scr = 'menu';
      G.showObjects = true;
      if (!G.os) G.os = { s: 0, scroll: 0 };
    } else {
      G.scr = 'world';
    }
    sfx.sel();
  }
}

function finishCraftToCaller() {
  G.craft = null;
  if (G.craftFromBag) {
    G.scr = 'menu';
    G.showObjects = true;
    if (!G.os) G.os = { s: 0, scroll: 0 };
  } else {
    G.scr = 'world';
  }
}

function uFabianaAnim() {
  const c = G.craft;
  if (!c) {
    finishCraftToCaller();
    return;
  }
  c.tm++;

  // gather: ~ 4*28 + 50 ≈ 162 frames (~2.7s a 60fps) — acortamos un poco
  if (c.phase === 'gather') {
    // sfx tick al "aparecer" cada fragmento
    const nextTickAt = c.ticks * 28;
    if (c.ticks < 4 && c.tm >= nextTickAt) {
      sfx.craftTick();
      c.ticks++;
    }
    // cuando los 4 llegaron al centro (último start 84 + 50)
    if (c.tm > 140) {
      c.phase = 'flash';
      c.tm = 0;
      sfx.craft();
    }
  } else if (c.phase === 'flash') {
    if (c.tm > 28) {
      c.phase = 'reveal';
      c.tm = 0;
      // Aplicar cristal al inventario
      if (!c.applied) {
        const info = CRYSTAL_INFO[c.code];
        if (info) {
          G[info.key] = (G[info.key] || 0) + 1;
        }
        c.applied = true;
        const colorName =
          c.code === 'p' ? 'Morado' : c.code === 'c' ? 'Cian' : 'Naranja';
        aN(`¡Cristal ${colorName} creado!`);
      }
    }
  } else if (c.phase === 'reveal') {
    // SPACE para salir (o auto a ~4s total)
    if (c.tm > 40 && (kp(' ') || kp('Enter') || kp('x') || kp('Escape'))) {
      finishCraftToCaller();
      sfx.sel();
    }
    // auto-close suave tras ~3s de reveal
    if (c.tm > 200) {
      finishCraftToCaller();
    }
  }
}

// Menú inline (bug double-G). LaFot aparece solo con bagUpgrade.
function getMenuOpts() {
  const opts = [
    'Poción',
    'Revivir',
    'Equipo',
    'Mapa',
    'Misiones',
    'Criaturario',
    'Objetos',
  ];
  if (G.bagUpgrade) opts.push('LaFot');
  opts.push('Guardar', 'Volver', 'Reiniciar toda la partida');
  return opts;
}

function uMenu() {
  if (G.showMap || G.proaOpen || G.showMissions || G.showDex || G.showObjects) return;
  const opts = getMenuOpts();
  const n = opts.length;
  if (G.ms.s >= n) G.ms.s = 0;
  if (kp('ArrowUp') || kp('ArrowLeft')) { G.ms.s = (G.ms.s + n - 1) % n; sfx.sel(); }
  if (kp('ArrowDown') || kp('ArrowRight')) { G.ms.s = (G.ms.s + 1) % n; sfx.sel(); }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    const label = opts[G.ms.s];
    switch (label) {
      case 'Poción':
        if (G.pot > 0 && G.party.length > 0) {
          G.pot--;
          G.party[0].heal(Math.floor(G.party[0].mHp * 0.2));
          sfx.heal();
          aN('+HP!');
        } else aN('¡Sin pociones!');
        break;
      case 'Revivir': {
        const f = G.party.find((c) => c.hp <= 0);
        if (f && G.rev > 0) {
          G.rev--;
          f.hp = Math.floor(f.mHp * 0.5);
          sfx.heal();
          aN(`${f.nm} revivió!`);
        } else aN('Nadie caído o sin revivir.');
        break;
      }
      case 'Equipo':
        G.proaOpen = true;
        G.proaSel = 0;
        G.proaMode = 'view';
        break;
      case 'Mapa':
        G.showMap = true;
        break;
      case 'Misiones':
        G.showMissions = true;
        break;
      case 'Criaturario':
        G.showDex = true;
        G.dexSel = 0;
        break;
      case 'Objetos':
        G.showObjects = true;
        G.os = { s: 0, scroll: 0 };
        break;
      case 'LaFot':
        // Laboratorio de fotografía (crafting portátil, mochila reforzada)
        G.craftFromBag = true;
        G.craftSel = 0;
        G.scr = 'fabianaCraft';
        break;
      case 'Guardar':
        if (G.batallador) {
          aN('Batallador: no se puede guardar en modo test.');
          sfx.nef();
        } else if (window.__gameSaveGame) {
          window.__gameSaveGame();
        }
        break;
      case 'Volver':
        G.scr = 'world';
        break;
      case 'Reiniciar toda la partida':
        if (G.batallador) {
          aN('Batallador: sal del modo test antes de reiniciar.');
          sfx.nef();
        } else {
          G.scr = 'confirmReset';
          G.resetSel = 0;
        }
        break;
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

/** Input de la pantalla Objetos (inline: toca G.scr / flags). */
function uObjects() {
  if (!G.os) G.os = { s: 0, scroll: 0 };
  const rows = buildObjectRows(); // solo count >= 1
  const n = rows.length;
  const VISIBLE = 8;

  if (n === 0) {
    if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
      G.showObjects = false;
      G.os = null;
      sfx.sel();
    }
    return;
  }

  // Clamp selección si el inventario se achicó
  if (G.os.s >= n) G.os.s = n - 1;
  if (G.os.s < 0) G.os.s = 0;

  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.os.s = (G.os.s + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.os.s = (G.os.s + 1) % n;
    sfx.sel();
  }
  // Mantener selección visible
  if (G.os.s < G.os.scroll) G.os.scroll = G.os.s;
  if (G.os.s >= G.os.scroll + VISIBLE) G.os.scroll = G.os.s - VISIBLE + 1;

  // SPACE: info / activar incienso
  if (kp(' ') || kp('Enter')) {
    const row = rows[G.os.s];
    if (!row) {
      aN('Mochila vacía.');
      sfx.nef();
    } else if (row.kind === 'incense') {
      if (G.activeIncense) {
        aN('Tranquilo, no queremos causar un delirio mortal.');
        sfx.nef();
      } else {
        if (!G.incense) G.incense = emptyFragrances();
        if ((G.incense[row.type] || 0) > 0) {
          G.incense[row.type]--;
          G.activeIncense = { type: row.type, stepsLeft: 200 };
          aN(`Incienso ${row.type} activado (200 pasos).`);
          sfx.sel();
        }
      }
    } else if (row.kind === 'fragment') {
      if (G.bagUpgrade) {
        aN('Armá cristales en Menú → LaFot.');
        sfx.sel();
      } else {
        aN('Fabiana o LaFot (Claudia, 2000G) arman cristales.');
        sfx.sel();
      }
    } else {
      aN(row.desc || row.name);
      sfx.sel();
    }
  }

  if (kp('x') || kp('Escape')) {
    G.showObjects = false;
    G.os = null;
    sfx.sel();
  }
}

function update() {
  tickFrame();
  if (kp('y') && !['battle', 'dialog', '_dialogDone', 'starter', 'intro', 'confirmReset', 'vision', 'find', 'batalladorSelect'].includes(G.scr)) {
    toggleSupervisorMode();
  }
  if (kp('p') && !['battle', 'dialog', '_dialogDone', 'starter', 'intro', 'confirmReset', 'vision', 'find', 'batalladorSelect'].includes(G.scr)) {
    toggleBatalladorMode();
  }
  // EMERGENCIA: si el jugador queda atascado en un lugar imposible
  // (save corrupto, spawn fuera de mapa, etc.), la tecla R lo teleport
  // de vuelta a Aldea Pitch y limpia el estado de movimiento.
  if (kp('r') && G.scr === 'world') {
    G.curMap = 'world';
    G.pl.x = EXPANDED_SPAWN.emergency.x;
    G.pl.y = EXPANDED_SPAWN.emergency.y;
    G.pl.d = EXPANDED_SPAWN.player.d;
    G.pl.f = 0;
    G.pl.sprint = false;
    G.pl.moving = false;
    G.pl.stepTarget = null;
    aN('Respawn de emergencia: Aldea Pitch');
    sfx.sel();
  }
  // Dev cheat: I = +2000G (partida normal; no se publicita en HUD)
  if (kp('i') && !['title', 'intro', 'starter', 'battle'].includes(G.scr)) {
    G.gold = (G.gold || 0) + 2000;
    aN('+2000G');
    sfx.sel();
  }
  uP();
  updateMusic();

  switch (G.scr) {
    case 'title':
      uTitle();
      break;
    case 'intro':
      uIntro();
      break;
    case 'starter':
      uStarter();
      break;
    case 'world':
      if (G.curMap === 'world') uWorld();
      else if (G.curMap === 'interior') uInterior();
      else if (G.curMap.startsWith('cave')) uCave();
      else if (G.curMap === 'castle') uCastle();
      else if (G.curMap === 'tower') uTower();
      break;
    case 'battle':
      uBattle();
      break;
    case 'dialog':
      uDialog();
      break;
    case '_dialogDone':
      {
        const d = G.ds || {};
        // ¿callback personalizado?
        if (typeof d._onDialogFinish === 'function') { d._onDialogFinish(d); break; }
        // Claudia mochila (backup)
        if (d.goto === 'claudiaChoice') {
          if (G.bagUpgrade) {
            G.scr = 'world';
          } else {
            G.scr = 'claudiaChoice';
            G.claSel = 0;
          }
          break;
        }
        // Hernán tutor (backup)
        if (d.goto === 'hernanChoice') {
          G.scr = 'hernanChoice';
          G.herSel = 0;
          break;
        }
        // Teatro Pachi / André
        if (d.goto === 'theaterPachi') {
          openTheater('pachi');
          break;
        }
        if (d.goto === 'theaterAndre') {
          openTheater('andre');
          break;
        }
        // Gonchi trueque
        if (d.goto === 'gonchiTrade') {
          openGonchiTrade();
          break;
        }
        // Fabiana crafting (backup si el callback no viajó)
        if (d.goto === 'fabianaChoice') {
          const frags = G.frag || { p: 0, c: 0, o: 0 };
          const total = (frags.p || 0) + (frags.c || 0) + (frags.o || 0);
          if (total > 0) {
            G.scr = 'fabianaChoice';
            G.fabSel = 0;
          } else {
            G.scr = 'dialog';
            G.ds = {
              npc: d.npc || { nm: 'Fabiana' },
              dlgArr: [
                'Cuando tengas fragmentos,',
                'traéme 4 del mismo color',
                'y hacemos arte juntos.',
              ],
              li: 0,
              ci: 0,
              tm: 0,
              full: false,
            };
          }
          break;
        }
        // ¿Edison con opciones?
        if (d.isEdison && postGame && !pairBattles) { showEdisonChoice(); break; }
        // Pantallas especiales de líderes (quiz / chismes)
        if (d.goto === 'andreaQuiz') { showAndreaQuiz(d.npc); break; }
        if (d.goto === 'danGossip') { showDanGossip(d.npc); break; }
        // ¿Batalla después?
        if (d.afterBattle) { startNPCBattle(d.npc); break; }
        // Default: volver al mundo
        G.scr = 'world';
      }
      break;
    case 'menu':
      if (G.showMap) { uMapScreen(); break; }
      if (G.proaOpen) { uProa(); break; }
      if (G.showMissions) { uMissions(); break; }
      if (G.showDex) { uDex(); break; }
      if (G.showObjects) { uObjects(); break; }
      uMenu();
      break;
    case 'shop':
      uShop();
      break;
    case 'edisonChoice':
      uEdisonChoice();
      break;
    case 'pairSelect':
      uPairSelect();
      break;
    case 'andreaQuiz':
      uAndreaQuiz();
      break;
    case 'danGossip':
      uDanGossip();
      break;
    case 'confirmReset':
      uConfirmReset();
      break;
    case 'vision':
      uVision();
      break;
    case 'find':
      uFind();
      break;
    case 'chronicle':
      uChronicle();
      break;
    case 'batalladorSelect':
      uBatalladorSelect();
      break;
    case 'fabianaChoice':
      uFabianaChoice();
      break;
    case 'fabianaCraft':
      uFabianaCraft();
      break;
    case 'fabianaAnim':
      uFabianaAnim();
      break;
    case 'claudiaChoice':
      uClaudiaChoice();
      break;
    case 'hernanChoice':
      uHernanChoice();
      break;
    case 'hernanPickCre':
      uHernanPickCre();
      break;
    case 'hernanPickMove':
      uHernanPickMove();
      break;
    case 'hernanPickSlot':
      uHernanPickSlot();
      break;
    case 'theater':
      uTheater();
      break;
    case 'gonchiTrade':
      uGonchiTrade();
      break;
  }
}

function draw() {
  cx.clearRect(0, 0, 640, 480);

  switch (G.scr) {
        case 'title':
      dTitle();
      break;
    case 'intro':
      dIntro();
      break;
    case 'starter':
      dStarter();
      break;
    case 'world':
      drawMap(); // drawMap ya maneja G.curMap === 'interior' internamente
      break;
    case 'battle':
      dBattle();
      break;
    case 'dialog':
      drawMap();
      dDialog();
      break;
    case '_dialogDone':
      drawMap();
      break;
    case 'menu':
      if (G.showMap) { drawMap(); dMapScreen(); break; }
      if (G.proaOpen) { drawMap(); dProa(); break; }
      if (G.showMissions) { drawMap(); dMissions(); break; }
      if (G.showDex) { drawMap(); dDex(); break; }
      if (G.showObjects) { drawMap(); dObjects(); break; }
      drawMap();
      dMenu();
      break;
    case 'shop':
      drawMap();
      dShop();
      break;
    case 'confirmReset':
      drawMap();
      dConfirmReset();
      break;
    case 'edisonChoice':
      dEdisonChoice();
      break;
    case 'pairSelect':
      dPairSelect();
      break;
    case 'andreaQuiz':
      dAndreaQuiz();
      break;
    case 'danGossip':
      dDanGossip();
      break;
    case 'vision':
      dVision();
      break;
    case 'find':
      drawMap();
      dFind();
      break;
    case 'chronicle':
      dChronicle();
      break;
    case 'batalladorSelect':
      dBatalladorSelect();
      break;
    case 'fabianaChoice':
      drawMap();
      dFabianaChoice();
      break;
    case 'fabianaCraft':
      drawMap();
      dFabianaCraft();
      break;
    case 'fabianaAnim':
      dFabianaAnim();
      break;
    case 'claudiaChoice':
      drawMap();
      dClaudiaChoice();
      break;
    case 'hernanChoice':
      drawMap();
      dHernanChoice();
      break;
    case 'hernanPickCre':
      drawMap();
      dHernanPickCre();
      break;
    case 'hernanPickMove':
      drawMap();
      dHernanPickMove();
      break;
    case 'hernanPickSlot':
      drawMap();
      dHernanPickSlot();
      break;
    case 'theater':
      drawMap();
      dTheater();
      break;
    case 'gonchiTrade':
      drawMap();
      dGonchiTrade();
      break;
  }
}

function loop() {
  try {
    update();
    draw();
  } catch(e) {
    console.error('[loop] ERROR:', e.message, e.stack);
  }
  requestAnimationFrame(loop);
}

// === INICIALIZACIÓN ===
function init() {
  initBattleBackgroundAssets();

  // Generar mapas
  genWorld();
  applyExpandedNpcPlacements(npcs);
  genCave(cave1, CC, CR);
  addOloSecretChamber(cave1);
  genCave(cave2, CC, CR);
  genCastle();
  // Torre: generada siempre (aunque solo esté "abierta" en post-game).
  // Modos supervisor/batallador permiten entrar aunque no esté abierta.
  genTower();
  // pin-system necesita acceso al towerMap (vive en este archivo)
  setTowerMapGetter(() => towerMap);

  // No autocargar: el título ahora permite Continuar o Nueva partida.
  G.hasSave = hasSaveGame();
  G.titleSel = 0;

  // [refactor-phase5c] conectar callback de batalla de la tienda
  // Exponer funciones que modulos necesitan via window (sin orden de carga)
  window.__gameLoadGame = loadGame;
  window.__gameSaveGame = saveGame;
  window.__G = G; // debugging / tests
  setShopBattleStarter(startNPCBattle);

  // Iniciar loop
  loop();
}

// === RESPONSIVE ===
function resize() {
  const s = Math.min((innerWidth - 20) / 640, (innerHeight - 20) / 480, 2);
  cv.style.width = 640 * s + 'px';
  cv.style.height = 480 * s + 'px';
}
resize();
addEventListener('resize', resize);

// === ARRANCAR ===
window.addEventListener('error', e => console.error('[GLOBAL ERROR]', e.message, e.filename, e.lineno));
console.log('[game.js] calling init()');
init();
