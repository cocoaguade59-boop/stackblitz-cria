// ============================================================
// CRIATURAS DEL REINO V2 - BLOQUE 1: BASE
// ============================================================

// [refactor-phase1] datos importados desde src/data/
import { tEff, tCol, tColL, tEmo, tNam } from './src/data/types.js';
import { CDB } from './src/data/creatures.js';
import { CRE_DESC } from './src/data/creature-descriptions.js';
import { POOLS } from './src/data/pools.js';
import { ALL_MOVES } from './src/data/moves.js';

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
import { STATUS, battleState, resetBattleState, getModdedStat, cDmg } from './src/entities/battle-state.js';

// [refactor-phase4a] fundaciones render importadas
import { cv, cx } from './src/core/canvas.js';
import { G } from './src/core/game-state.js';
import { px, pixelGlow, pixelDiamond } from './src/render/render-utils.js';

// [refactor-phase4b] UI y utilidades importadas
import { fr, tickFrame } from './src/core/frame.js';
import { aP, aN, uP } from './src/utils/particles.js';
import { dBox, dBoxMenu, dDialogBox, dDialogAdaptive, wrapText, dMenuOption, dArrow } from './src/render/ui-boxes.js';
import { dHP, dEXP, dBattlePanel } from './src/render/ui-bars.js';
import { dTypeIcon, moveUiCol, movePpColor, dMoveButton } from './src/render/ui-type-icons.js';
import { dShadow, dRouteTree, dRouteProa, dRouteSign, dFallenPortrait } from './src/render/world-decor.js';
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
import { updateCamera } from './src/core/camera.js';
import { DEX_ORDER, dexIds } from './src/data/dex-order.js';
import { playTitleHorn, startNewGameFlow, uTitle, dTitle, setTitleCallbacks } from './src/screens/title.js';
import { INTRO_LINES, uIntro, dIntro } from './src/screens/intro.js';
import { uStarter, dStarter } from './src/screens/starter.js';

// [refactor-phase5b] sistema de dialogo importado
import { uDialog, dDialog, showQuickDialog, showDialogThen, showTalkedChecklist } from './src/screens/dialog.js';

// [refactor-phase5c] screens del menu importadas
import { uDex, dDex, hasCapturedSpecies } from './src/screens/dex.js';
import { uMissions, dMissions } from './src/screens/missions.js';
import { uMapScreen, dMapScreen } from './src/screens/map-screen.js';
import { uShop, dShop, shopExitDialog, setShopBattleStarter, shopLore } from './src/screens/shop.js';

// [refactor-phase5d] sistema de batalla importado
import { uBattle, dBattle, setBattleCallbacks } from './src/screens/battle.js';


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
function addPineForest(x0, y0, w, h, density = 0.72) {
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;

      // No tapar caminos, agua, cuevas, castillo, torre, casas, cristales
      const t = wMap[r]?.[c];
      if (t !== 0 && t !== 5) continue;

      // Borde más denso, interior con claros
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;

      const localDensity = edge ? Math.min(0.9, density + 0.15) : density;

      if (Math.random() < localDensity) {
        wMap[r][c] = 3;
      } else if (Math.random() < 0.5) {
        wMap[r][c] = 5; // hierba alta entre pinos
      } else {
        wMap[r][c] = 0; // claro
      }
    }
  }
}

function addClearing(cx0, cy0, rad = 3) {
  for (let r = cy0 - rad; r <= cy0 + rad; r++) {
    for (let c = cx0 - rad; c <= cx0 + rad; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
      const dx = c - cx0;
      const dy = r - cy0;
      if (dx * dx + dy * dy <= rad * rad) {
        if (wMap[r][c] === 3 || wMap[r][c] === 5) {
          wMap[r][c] = Math.random() < 0.25 ? 6 : 0;
        }
      }
    }
  }
}


function addTallGrassPatch(x0, y0, w, h, density = 0.75) {
  // Parche rectangular irregular de hierba alta, sin tocar caminos ni edificios.
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;
      if (wMap[r][c] !== 0) continue;
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;
      const localDensity = edge ? density * 0.45 : density;
      if (Math.random() < localDensity) wMap[r][c] = 5;
    }
  }
}

function addWorldTallGrassPatches() {
  // Más hierba alta cerca de rutas y zonas de exploración para que los encuentros
  // no dependan solo de puntitos dispersos del generador inicial.
  [
    { x: 23, y: 124, w: 10, h: 8, d: 0.72 }, // Ruta 1
    { x: 38, y: 118, w: 10, h: 8, d: 0.72 },
    { x: 18, y: 93, w: 12, h: 8, d: 0.76 },  // Ruta 2 / Cueva Volcánica
    { x: 52, y: 91, w: 10, h: 8, d: 0.76 },
    { x: 57, y: 68, w: 12, h: 9, d: 0.78 },  // Ruta 3
    { x: 31, y: 58, w: 11, h: 8, d: 0.78 },
    { x: 34, y: 36, w: 12, h: 8, d: 0.8 },   // Ruta 4
    { x: 58, y: 34, w: 11, h: 8, d: 0.8 },
    { x: 35, y: 12, w: 10, h: 8, d: 0.82 },  // Ruta 5 norte
    { x: 47, y: 8, w: 10, h: 7, d: 0.82 },
  ].forEach((p) => addTallGrassPatch(p.x, p.y, p.w, p.h, p.d));
}


function addRouteDecorations() {
  // Bancos, faroles, estatuas y cercas en rutas principales para que el mapa no se sienta vacío.
  const decos = [
    [18, 132, 15], [30, 130, 16], [22, 124, 20], [28, 124, 20],
    [38, 116, 15], [48, 115, 16], [14, 101, 19], [17, 98, 15],
    [61, 88, 15], [63, 82, 16], [55, 78, 20], [58, 78, 20],
    [31, 65, 15], [34, 65, 16], [65, 42, 19], [68, 42, 15],
    [43, 28, 15], [46, 28, 16], [39, 12, 19], [50, 8, 15],
  ];
  decos.forEach(([c, r, t]) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && (wMap[r][c] === 0 || wMap[r][c] === 1 || wMap[r][c] === 5)) wMap[r][c] = t;
  });
}
function polishVillageLayout(sx, sy, id) {
  const set = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = t;
  };
  const fill = (x1, y1, x2, y2, t) => {
    for (let r = y1; r <= y2; r++) for (let c = x1; c <= x2; c++) set(c, r, t);
  };
  const house = (c, r) => fill(c, r, c + 1, r + 1, 4);

  // Layout base grande y ordenado: borde natural + plaza central + calles claras.
  const base = id === 'rodaje' ? 26 : 0;
  fill(sx - 4, sy - 3, sx + 12, sy + 10, base);
  fill(sx - 2, sy - 1, sx + 10, sy + 8, 1);
  fill(sx + 2, sy + 1, sx + 7, sy + 6, 1); // plaza
  // cruces principales no perfectamente rectangulares, pero ordenados
  for (let r = sy - 3; r <= sy + 10; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
  for (let c = sx - 4; c <= sx + 12; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
  // senderos escalonados/diagonales simulados
  for (let k = 0; k < 5; k++) { set(sx - 3 + k, sy + 8 - k, 1); set(sx + 11 - k, sy + 8 - k, 1); }

  // casas ordenadas fuera de la plaza
  house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);

  // entradas/salidas claras
  set(sx + 4, sy - 3, 14); set(sx + 5, sy - 3, 1);
  set(sx + 4, sy + 10, 14); set(sx + 5, sy + 10, 1);

  // bordes con desniveles/cercas, sin cerrar caminos
  for (let c = sx - 3; c <= sx + 11; c++) {
    if (c !== sx + 4 && c !== sx + 5) set(c, sy - 2, id === 'rodaje' ? 27 : 20);
    if (c !== sx + 4 && c !== sx + 5) set(c, sy + 9, id === 'rodaje' ? 27 : 20);
  }

  // Decoración por identidad de pueblo, ordenada alrededor de la plaza.
  if (id === 'pitch') {
    // Plaza inicial: pozo, entrenamiento, cajas, huellas y flores.
    set(sx + 4, sy + 3, 22);
    set(sx + 1, sy + 2, 23); set(sx + 2, sy + 2, 23);
    set(sx + 8, sy + 3, 21); set(sx + 8, sy + 4, 21);
    [[sx + 1, sy + 5], [sx + 2, sy + 6], [sx + 6, sy + 5], [sx + 7, sy + 2]].forEach(([c,r]) => set(c,r,24));
    [[sx + 1, sy + 1], [sx + 7, sy + 1], [sx + 1, sy + 7], [sx + 7, sy + 7], [sx + 3, sy + 6], [sx + 6, sy + 2]].forEach(([c,r]) => set(c,r,6));
    set(sx + 3, sy + 2, 15); set(sx + 6, sy + 2, 15);
  } else if (id === 'storyboard') {
    // Villa Storyboard/Tamara: orden en paneles alrededor de un mural central.
    fill(sx + 1, sy + 1, sx + 8, sy + 6, 1);
    set(sx + 3, sy + 2, 17); set(sx + 4, sy + 2, 17); set(sx + 5, sy + 2, 17);
    set(sx + 3, sy + 5, 17); set(sx + 4, sy + 5, 17); set(sx + 5, sy + 5, 17);
    set(sx + 6, sy + 4, 19); // estatua/figura artística
    set(sx + 2, sy + 4, 16); set(sx + 8, sy + 4, 16);
    set(sx + 1, sy + 1, 15); set(sx + 8, sy + 1, 15);
  } else if (id === 'rodaje') {
    // Cantera Rodaje: plaza de cantera ordenada con set/cámara central.
    fill(sx - 3, sy - 2, sx + 11, sy + 9, 26);
    for (let r = sy - 2; r <= sy + 9; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
    for (let c = sx - 3; c <= sx + 11; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
    house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);
    set(sx + 4, sy + 2, 25); set(sx + 6, sy + 4, 25);
    set(sx + 2, sy + 2, 15); set(sx + 8, sy + 2, 15);
    set(sx + 2, sy + 6, 16); set(sx + 7, sy + 6, 16);
    // terrazas/desniveles de cantera
    for (let c = sx - 3; c <= sx + 11; c++) { if (c < sx + 3 || c > sx + 6) set(c, sy - 2, 27); if (c < sx + 2 || c > sx + 8) set(c, sy + 9, 27); }
    for (let r = sy - 1; r <= sy + 8; r++) { if (r !== sy + 3 && r !== sy + 4) { set(sx - 3, r, 27); set(sx + 11, r, 27); } }
  } else if (id === 'ultimatoma') {
    // Feria Última Toma: puestos simétricos pero plaza irregular con flores.
    set(sx + 2, sy + 2, 18); set(sx + 7, sy + 2, 18); set(sx + 2, sy + 6, 18); set(sx + 7, sy + 6, 18);
    set(sx + 4, sy + 4, 19);
    set(sx + 2, sy + 4, 15); set(sx + 7, sy + 4, 15);
    set(sx + 3, sy + 5, 16); set(sx + 6, sy + 5, 16);
    [[sx+1,sy+1],[sx+8,sy+1],[sx+1,sy+7],[sx+8,sy+7]].forEach(([c,r])=>set(c,r,6));
  } else if (id === 'montaje') {
    // Prados Montaje: mirador ordenado, frío y ceremonial.
    fill(sx + 1, sy - 1, sx + 8, sy, 26);
    set(sx + 4, sy - 2, 14); set(sx + 5, sy - 2, 1);
    set(sx + 4, sy + 3, 19); set(sx + 8, sy + 3, 19);
    set(sx + 2, sy + 2, 15); set(sx + 7, sy + 2, 15);
    set(sx + 3, sy + 6, 16); set(sx + 6, sy + 6, 16);
    set(sx + 1, sy + 2, 20); set(sx + 9, sy + 2, 20);
  }
}

function applyVillageIrregularShape(sx, sy, id) {
  const set = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = t;
  };
  // Romper rectángulo perfecto: esquinas con césped/flores y bordes menos rígidos.
  const cornerTiles = [
    [sx - 2, sy - 2], [sx - 1, sy - 2], [sx + 8, sy - 2], [sx + 9, sy - 2],
    [sx - 2, sy + 7], [sx - 1, sy + 7], [sx + 8, sy + 7], [sx + 9, sy + 7],
    [sx - 2, sy - 1], [sx + 9, sy - 1], [sx - 2, sy + 6], [sx + 9, sy + 6],
  ];
  cornerTiles.forEach(([c, r], i) => set(c, r, i % 3 === 0 ? 6 : 0));

  // Caminos escalonados secundarios: simulan diagonales sin curvas.
  for (let k = 0; k < 5; k++) {
    set(sx - 2 + k, sy + 7 - k, 1);
    if (k < 4) set(sx - 1 + k, sy + 7 - k, 1);
    set(sx + 9 - k, sy + 7 - k, 1);
  }
  // Callejón angosto entre casas superiores e inferiores.
  for (let r = sy + 1; r <= sy + 5; r++) set(sx + 4, r, 1);
  for (let c = sx + 2; c <= sx + 7; c++) set(c, sy + 3, 1);

  // Desniveles visuales: bordes elevados que rompen la planicie.
  [
    [sx - 2, sy + 1], [sx - 1, sy + 1], [sx + 8, sy + 1], [sx + 9, sy + 1],
    [sx + 1, sy + 7], [sx + 2, sy + 7], [sx + 6, sy + 7], [sx + 7, sy + 7],
  ].forEach(([c, r]) => set(c, r, 27));

  // Toques temáticos por pueblo sobre la forma irregular.
  if (id === 'pitch') {
    // Más flores normales alrededor de la plaza inicial.
    [[sx + 1, sy + 2], [sx + 6, sy + 2], [sx + 1, sy + 5], [sx + 7, sy + 5], [sx + 5, sy + 6]].forEach(([c, r]) => set(c, r, 6));
  }
  if (id === 'storyboard') {
    // Pequeño pasaje en zigzag hacia el mural.
    for (let k = 0; k < 4; k++) set(sx + 1 + k, sy + 1 + k, 1);
  }
  if (id === 'rodaje') {
    // Cantera con terrazas/desniveles rocosos más obvios.
    for (let c = sx - 3; c <= sx + 11; c++) {
      if (c < sx + 2 || c > sx + 6) set(c, sy - 3, 27);
      if (c < sx + 1 || c > sx + 8) set(c, sy + 9, 27);
    }
    for (let r = sy - 2; r <= sy + 8; r++) {
      if (r !== sy + 3) set(sx - 3, r, 27);
      if (r !== sy + 3) set(sx + 11, r, 27);
    }
  }
  if (id === 'ultimatoma') {
    // Feria con entradas diagonales y puestos alrededor.
    set(sx + 1, sy + 1, 18); set(sx + 7, sy + 1, 18);
    set(sx + 1, sy + 6, 18); set(sx + 7, sy + 6, 18);
  }
  if (id === 'montaje') {
    // Mirador escalonado al norte.
    for (let c = sx; c <= sx + 8; c++) if (c !== sx + 4 && c !== sx + 5) set(c, sy - 1, 27);
    set(sx + 1, sy + 2, 19); set(sx + 8, sy + 2, 19);
  }
}

function genWorld() {
  // Inicializar mapa con hierba y hierba alta aleatoria
  for (let r = 0; r < WR; r++) {
    wMap[r] = [];
    for (let c = 0; c < WC; c++) wMap[r][c] = Math.random() < 0.14 ? 5 : 0;
  }

  // Bordes de árboles
  for (let r = 0; r < WR; r++)
    for (let c = 0; c < WC; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) wMap[r][c] = 3;
    }

  // ============================================================
  // CAMINO PRINCIPAL (Sur → Norte) - Asegurando flujo libre
  // ============================================================
  vPath(20, 130, 148);
  hPath(130, 15, 35);
  vPath(35, 115, 130);
  hPath(115, 35, 50);
  vPath(50, 98, 115);
  hPath(98, 15, 50);
  vPath(15, 100, 110);
  hPath(90, 50, 65);
  vPath(65, 77, 98);
  vPath(65, 65, 90);
  hPath(65, 30, 65);
  vPath(30, 47, 77);
  vPath(30, 35, 65);
  hPath(42, 30, 72);   // llega al corredor central (conecta la entrada de la Cueva Cristalina)
  vPath(72, 30, 50);
  hPath(35, 44, 72);
  vPath(44, 17, 47);
  vPath(44, 5, 27);
  hPath(10, 37, 44);
  vPath(37, 4, 14);
  hPath(5, 50, 60);
  // Rutas de garantia (conectividad total del mapa)
  hPath(35, 30, 44);   // une el corredor del noreste con la red principal
  hPath(82, 50, 65);   // conecta la aldea Rodaje al corredor central

  // ============================================================
  // LAGOS - Reposicionados para NO bloquear caminos
  // ============================================================
  [
    { x: 55, y: 135, w: 8, h: 6 }, // Lejos de R1
    { x: 5, y: 110, w: 7, h: 5 }, // Lejos de Cueva Volcánica
    { x: 72, y: 85, w: 6, h: 5 }, // Lejos de R3
    { x: 10, y: 55, w: 8, h: 6 }, // Lejos de R4
    { x: 60, y: 45, w: 6, h: 5 }, // Lejos de Cueva Cristalina
    { x: 10, y: 10, w: 10, h: 6 }, // Ruta 5 lateral
  ].forEach((l) => {
    for (let r = l.y; r < l.y + l.h && r < WR - 2; r++)
      for (let c = l.x; c < l.x + l.w && c < WC - 2; c++) {
        const dx = c - (l.x + l.w / 2),
          dy = r - (l.y + l.h / 2);
        if ((dx * dx) / ((l.w * l.w) / 4) + (dy * dy) / ((l.h * l.h) / 4) < 1)
          wMap[r][c] = 2;
      }
  });

  // ============================================================
  // BOSQUES FRONDOSOS (Aumentado tamaño y cantidad)
  // ============================================================
  [
    { x: 2, y: 120, w: 20, h: 25 },
    { x: 45, y: 115, w: 30, h: 30 },
    { x: 5, y: 80, w: 25, h: 30 },
    { x: 45, y: 65, w: 30, h: 40 },
    { x: 2, y: 30, w: 25, h: 40 },
    { x: 55, y: 10, w: 22, h: 50 },
  ].forEach((f) => {
    for (let r = f.y; r < f.y + f.h && r < WR - 2; r++)
      for (let c = f.x; c < f.x + f.w && c < WC - 2; c++) {
        if (wMap[r][c] === 0 || wMap[r][c] === 5)
          wMap[r][c] = Math.random() < 0.7 ? 3 : 5; // 70% bosque = muy frondoso
      }
  });

  // Aldeas, Cuevas y Castillo
  buildVillage(18, 140, 'pitch');
  buildVillage(38, 107, 'storyboard');
  buildVillage(52, 79, 'rodaje');
  buildVillage(28, 49, 'ultimatoma');
  buildVillage(42, 19, 'montaje');
  placeCave(15, 105);
  placeCave(72, 38);
  buildCastleExt(37, 7);
  buildTower(33, 8);

  // Parches adicionales: más zonas reales de hierba alta en el mapa exterior.
  addWorldTallGrassPatches();
  // Bancos, faroles, estatuas y cercas en rutas.
  addRouteDecorations();

  let cv2 = 0;
  while (cv2 < 45) {
    const c = 4 + Math.floor(Math.random() * (WC - 8));
    const r = 4 + Math.floor(Math.random() * (WR - 8));
    if (wMap[r][c] === 0) {
      wMap[r][c] = 10;
      cv2++;
    }
  }
}
function buildVillage(sx, sy, id) {
  // Área amplia de caminos
  for (let r = sy - 2; r < sy + 8; r++)
    for (let c = sx - 2; c < sx + 10; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Edificio arriba izquierda
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio arriba derecha
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo izquierda
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo derecha
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;

  // Flores decorativas
  for (let c = sx - 2; c < sx + 10; c++) {
    if (sy - 2 >= 2 && c >= 2 && c < WC - 2 && wMap[sy - 2][c] === 1)
      if (Math.random() < 0.3) wMap[sy - 2][c] = 6;
  }

  // Entradas/salidas: arco norte y salida sur clara para todos los pueblos.
  const archX = sx + 4;
  if (sy - 3 >= 2 && archX >= 2 && archX < WC - 2) wMap[sy - 3][archX] = 14;
  if (sy + 8 < WR - 2 && archX >= 2 && archX < WC - 2) wMap[sy + 8][archX] = 14;
  for (let rr = sy - 3; rr <= sy + 8; rr++) {
    if (rr >= 2 && rr < WR - 2) {
      if (wMap[rr][archX] !== 14) wMap[rr][archX] = 1;
      if (archX + 1 < WC - 2 && wMap[rr][archX + 1] !== 14) wMap[rr][archX + 1] = 1;
    }
  }

  // Forma irregular, senderos escalonados, callejones y desniveles.
  applyVillageIrregularShape(sx, sy, id);

  // Identidad visual por pueblo: forma + decoración.
  if (id === 'storyboard') {
    // Paneles de storyboard y mural abierto.
    for (let r = sy - 1; r <= sy + 7; r++)
      for (let c = sx - 1; c <= sx + 9; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 1 && (r + c) % 4 === 0) wMap[r][c] = 17;
    wMap[sy + 3][sx + 4] = 17;
    wMap[sy + 3][sx + 5] = 17;
    wMap[sy + 4][sx + 4] = 19; // estatua de criatura pintora
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 5] = 16;
    wMap[sy - 1][sx + 2] = 15;
    wMap[sy - 1][sx + 7] = 15;
  }

  if (id === 'rodaje') {
    // Cantera Rodaje: área irregular de piedra, rocas y set simbólico de rodaje.
    for (let r = sy - 4; r <= sy + 10; r++) {
      for (let c = sx - 4; c <= sx + 12; c++) {
        if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
        const edge = r === sy - 4 || r === sy + 10 || c === sx - 4 || c === sx + 12;
        const t = wMap[r][c];
        if (edge && t !== 4 && t !== 11 && t !== 12) wMap[r][c] = Math.random() < 0.65 ? 7 : 26;
        else if (t !== 4 && t !== 11 && t !== 12) wMap[r][c] = 26;
      }
    }
    // Caminos internos tallados en la cantera para no bloquear NPCs.
    for (let c = sx - 3; c <= sx + 11; c++) wMap[sy + 3][c] = 1;
    for (let r = sy - 3; r <= sy + 9; r++) wMap[r][sx + 4] = 1;
    // Set de rodaje simbólico y luces.
    wMap[sy + 2][sx + 4] = 25;
    wMap[sy + 4][sx + 6] = 25;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 8] = 15;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 7] = 16;
    // Reubicar visualmente algunos edificios como casetas de producción.
    for (const [bc, br] of [[sx, sy], [sx + 6, sy], [sx, sy + 5], [sx + 6, sy + 5]]) {
      if (wMap[br]?.[bc] !== undefined) wMap[br][bc] = 4;
      if (wMap[br]?.[bc + 1] !== undefined) wMap[br][bc + 1] = 4;
      if (wMap[br + 1]?.[bc] !== undefined) wMap[br + 1][bc] = 4;
      if (wMap[br + 1]?.[bc + 1] !== undefined) wMap[br + 1][bc + 1] = 4;
    }
  }

  if (id === 'ultimatoma') {
    // Feria: plaza más abierta, faroles y bancas.
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx; c <= sx + 7; c++)
        if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = (r === sy + 3 || c === sx + 4) ? 1 : 6;
    wMap[sy + 2][sx + 2] = 15;
    wMap[sy + 2][sx + 7] = 15;
    wMap[sy + 3][sx + 4] = 18;
    wMap[sy + 3][sx + 5] = 18;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 4][sx + 4] = 19;
  }

  if (id === 'montaje') {
    // Pueblo final: mirador frío hacia castillo, faroles y bancos.
    for (let c = sx - 1; c <= sx + 9; c++) if (wMap[sy - 1]?.[c] !== undefined) wMap[sy - 1][c] = 26;
    wMap[sy - 2][sx + 4] = 14;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 7] = 15;
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 3][sx + 8] = 19; // estatua/mirador del pueblo final
    wMap[sy + 2][sx + 1] = 20;
    wMap[sy + 2][sx + 9] = 20;
  }

  // Aldea Pitch recibe una primera zona más clara y acogedora para tutorial.
  if (id === 'pitch') {
    // plaza central y caminos limpios hacia Alexandro/Luis/Alessandro
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx - 1; c <= sx + 8; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = 1;

    // jardineras y árboles de borde sin cerrar el paso
    const flowers = [
      [sx - 1, sy], [sx + 3, sy], [sx + 8, sy],
      [sx - 1, sy + 7], [sx + 3, sy + 7], [sx + 8, sy + 7],
      [sx + 3, sy + 2], [sx + 4, sy + 2], [sx + 3, sy + 5], [sx + 4, sy + 5],
    ];
    flowers.forEach(([c, r]) => { if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = 6; });
    const trees = [[sx - 3, sy - 1], [sx + 10, sy - 1], [sx - 3, sy + 8], [sx + 10, sy + 8]];
    trees.forEach(([c, r]) => { if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 3; });

    // sendero extra hasta el cartel de salida norte
    for (let r = sy - 2; r <= sy + 7; r++)
      if (r >= 2 && r < WR - 2) {
        wMap[r][sx + 2] = 1;
        wMap[r][sx + 3] = 1;
      }
    // Plaza central, zona tutorial y elementos únicos visibles.
    wMap[sy + 3][sx + 4] = 22; // pozo de plaza
    wMap[sy + 2][sx + 1] = 21; // cajas
    wMap[sy + 6][sx + 7] = 21;
    wMap[sy + 1][sx + 3] = 23; // muñecos de entrenamiento
    wMap[sy + 1][sx + 5] = 23;
    wMap[sy + 4][sx + 2] = 24; // huellas cerca del jugador
    wMap[sy + 5][sx + 4] = 24;
    wMap[sy + 6][sx + 5] = 24;
    // cerca baja para encuadrar zona de entrenamiento sin encerrar al jugador
    wMap[sy][sx + 2] = 20;
    wMap[sy][sx + 6] = 20;
    wMap[sy + 1][sx + 7] = 20;
    wMap[sy + 2][sx + 7] = 20;
  }

  // Pasada final: ordena la aldea para que la personalidad sea clara sin verse caótica.
  polishVillageLayout(sx, sy, id);
}

function placeCave(cx2, cy) {
  // Limpiar área alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2)
        wMap[r][c] = 0;
    }
  // Entrada grande (2x2)
  wMap[cy][cx2] = 9;
  wMap[cy][cx2 + 1] = 9;
  wMap[cy - 1][cx2] = 9;
  wMap[cy - 1][cx2 + 1] = 9;
  // Rocas decorativas alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (
        r >= 2 &&
        r < WR - 2 &&
        c >= 2 &&
        c < WC - 2 &&
        wMap[r][c] === 0 &&
        Math.random() < 0.3
      )
        wMap[r][c] = 7;
    
  // Bolsillo de acceso: camino limpio en todo el entorno para poder rodear la
  // entrada sin que rocas/arboles aleatorios bloqueen el paso nunca.
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2 && wMap[r][c] !== 9)
        wMap[r][c] = 1;
    }
}
}

function buildCastleExt(sx, sy) {
  // Camino de acceso
  for (let r = sy - 1; r < sy + 8; r++)
    for (let c = sx - 1; c < sx + 12; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Muros del castillo (tile 13 en vez de 4)
  for (let r = sy; r < sy + 5; r++)
    for (let c = sx; c < sx + 10; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 13;
    }

  // Puerta de entrada
  wMap[sy + 4][sx + 4] = 11;
  wMap[sy + 4][sx + 5] = 11;

  // Torres esquineras (más altas)
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx] = 13;
      wMap[r][sx + 1] = 13;
      wMap[r][sx + 8] = 13;
      wMap[r][sx + 9] = 13;
    }
  }

  // Torres traseras
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx + 3] = 13;
      wMap[r][sx + 6] = 13;
    }
  }

  // Patio interior (camino)
  for (let r = sy + 1; r < sy + 4; r++)
    for (let c = sx + 2; c < sx + 8; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Decoración: flores junto a la puerta
  if (sy + 5 < WR - 2) {
    wMap[sy + 5][sx + 3] = 6;
    wMap[sy + 5][sx + 6] = 6;
  }

  // Decoración: antorchas (flores en el camino de acceso)
  if (sy + 6 < WR - 2) {
    wMap[sy + 6][sx + 4] = 6;
    wMap[sy + 6][sx + 5] = 6;
  }
}

function buildTower(sx, sy) {
  // Solo colocar si está dentro del mapa
  if (sy < 2 || sy >= WR - 4 || sx < 2 || sx >= WC - 4) return;
  // Limpiar área
  for (let r = sy - 1; r <= sy + 2; r++)
    for (let c = sx - 1; c <= sx + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }
  // Montañas alrededor
  for (let r = sy - 2; r <= sy + 3; r++)
    for (let c = sx - 2; c <= sx + 3; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 0)
        wMap[r][c] = 7;
    }
  // Puerta de la torre
  wMap[sy + 1][sx] = 12;
  wMap[sy + 1][sx + 1] = 12;
}

// === GENERACIÓN DE CUEVAS ===
function genCave(map, cols, rows) {
  // Todo paredes inicialmente
  for (let r = 0; r < rows; r++) {
    map[r] = [];
    for (let c = 0; c < cols; c++) map[r][c] = 21;
  }

  // === TÚNEL PRINCIPAL VERTICAL (3 tiles de ancho) ===
  const midC = Math.floor(cols / 2);
  for (let r = 1; r < rows - 1; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALAS LATERALES (3 a la izquierda, 3 a la derecha) ===
  const salas = [
    { x: 3, y: 4, w: 6, h: 4 },
    { x: 3, y: 11, w: 6, h: 4 },
    { x: 3, y: 18, w: 6, h: 4 },
    { x: cols - 9, y: 4, w: 6, h: 4 },
    { x: cols - 9, y: 11, w: 6, h: 4 },
    { x: cols - 9, y: 18, w: 6, h: 4 },
  ];

  salas.forEach((s) => {
    // Tallar sala
    for (let r = s.y; r < s.y + s.h && r < rows - 1; r++) {
      for (let c = s.x; c < s.x + s.w && c < cols - 1; c++) {
        if (r > 0 && c > 0) map[r][c] = 20;
      }
    }
    // Conectar sala con túnel central
    const conY = s.y + Math.floor(s.h / 2);
    const start = Math.min(s.x + s.w, midC);
    const end = Math.max(s.x, midC);
    for (let c = start; c <= end; c++) {
      if (c > 0 && c < cols - 1) map[conY][c] = 20;
    }
  });

  // === ENTRADA (arriba) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = 1; r <= 3; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALIDA (abajo) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = rows - 4; r <= rows - 2; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }
  // Marcar tiles de salida
  map[rows - 2][midC - 1] = 27;
  map[rows - 2][midC] = 27;
  map[rows - 2][midC + 1] = 27;

  // === DECORACIÓN: Vegetación en bordes ===
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (map[r][c] !== 20) continue;
      let nearWall = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (map[r + dr]?.[c + dc] === 21) nearWall = true;
        }
      if (nearWall && Math.random() < 0.08) map[r][c] = 26;
    }
  }

  // === DESNIVELES DE CUEVA: plataformas rocosas en bordes de salas ===
  salas.forEach((s) => {
    for (let c = s.x + 1; c < s.x + s.w - 1; c++) {
      if (map[s.y]?.[c] === 20 && (c + s.y) % 2 === 0) map[s.y][c] = 29;
      const rr = s.y + s.h - 1;
      if (map[rr]?.[c] === 20 && (c + rr) % 3 === 0) map[rr][c] = 29;
    }
  });

  // === DECORACIÓN: Cristales decorativos en salas ===
  salas.forEach((s) => {
    if (Math.random() < 0.6) {
      const cc = s.x + 1 + Math.floor(Math.random() * (s.w - 2));
      const cr = s.y + 1 + Math.floor(Math.random() * (s.h - 2));
      if (map[cr][cc] === 20) map[cr][cc] = 22;
    }
  });

  // === LAVA (solo en cuevas con índice impar - Cueva Volcánica) ===
  // Pequeño charco en una sala
  if (Math.random() < 0.7) {
    const lavaSala = salas[Math.floor(Math.random() * salas.length)];
    const lx = lavaSala.x + 1;
    const ly = lavaSala.y + 1;
    map[ly][lx] = 24;
    map[ly][lx + 1] = 24;
  }

  // === AGUA SUBTERRÁNEA ===
  if (Math.random() < 0.5) {
    const aguaSala = salas[Math.floor(Math.random() * salas.length)];
    const ax = aguaSala.x + 1;
    const ay = aguaSala.y + 1;
    map[ay][ax] = 23;
    map[ay][ax + 1] = 23;
  }

  // === CRISTALES VÍNCULO (capturables) ===
  let cp = 0;
  let attempts = 0;
  while (cp < 5 && attempts < 100) {
    const c = 2 + Math.floor(Math.random() * (cols - 4));
    const r = 2 + Math.floor(Math.random() * (rows - 4));
    if (map[r][c] === 20) {
      map[r][c] = 28;
      cp++;
    }
    attempts++;
  }
}


function addOloSecretChamber(map) {
  // Cámara oculta de Mr. Olo-Man en Cueva Volcánica.
  // La sala ya existe tras la pared; la entrada secreta se abre desde (19,24) hacia la izquierda.
  for (let r = 22; r <= 27; r++) {
    for (let c = 4; c <= 10; c++) map[r][c] = 20;
  }
  for (let c = 11; c <= 17; c++) map[24][c] = 20;
  map[24][18] = 21; // pared secreta cerrada
  map[23][18] = 21;
  map[25][18] = 21;
}

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
function genCastle() {
  // ==========================================================
  // CASTILLO REAL — 30x25 tiles
  //
  // Layout de NORTE (fila 0) a SUR (fila 24):
  //
  //  Fila 1       ═══ pared norte del castillo ═══
  //  Fila 2-3     Estandartes decorativos y respaldo del trono
  //  Fila 4       [REY NAVARRETE al fondo, mirando al sur]
  //  Fila 5-11    ┃ Sala del trono LARGA (alfombra roja + antorchas) ┃
  //  Fila 12      ═══ pared + PUERTA CON CANDADO en col 15 ═══
  //  Fila 13-19   Pasillo central + salas laterales:
  //                  Sala oeste (Andre/Ravell)  |  Sala este (Yam Carcelera)
  //  Fila 20-22   Vestíbulo con alfombra hacia la salida
  //  Fila 23      [ENTRADA/SALIDA sur al mundo]
  //
  // Al entrar por el sur, el jugador NO ve al Rey (ha muchas filas de
  // distancia + pared con puerta). Al cruzar la puerta y avanzar por la
  // sala del trono, cada paso se siente ceremonial. El Rey queda LEJOS
  // al fondo — es literalmente la prueba final.
  // ==========================================================

  // Piso inicial + murallas exteriores
  for (let r = 0; r < KR; r++) {
    castMap[r] = [];
    for (let c = 0; c < KC; c++) {
      if (r < 1 || r >= KR - 1 || c < 1 || c >= KC - 1) castMap[r][c] = 31;
      else castMap[r][c] = 30;
    }
  }

  // ------- SALA DEL TRONO (al norte, filas 1-11, LARGA y ancha) -------
  // Paredes laterales que delimitan la sala completa
  for (let r = 1; r <= 11; r++) {
    castMap[r][3] = 31;
    castMap[r][26] = 31;
  }
  // Suelo interno de la sala (piedra tile 32 = piso de sala del trono)
  for (let r = 2; r <= 11; r++)
    for (let c = 4; c <= 25; c++) castMap[r][c] = 32;

  // Respaldo del trono al fondo (fila 2, columnas centrales)
  castMap[2][14] = 31;
  castMap[2][15] = 31;
  castMap[2][16] = 31;
  // Detalles del trono flanqueando al rey
  castMap[3][14] = 31;
  castMap[3][16] = 31;
  // El REY va colocado en (15, 4) — mirando hacia el sur

  // Alfombra roja central desde el trono hasta la puerta cerrada
  // (el tile 30 dibuja alfombra en col 14-16, así que ya está por encima
  // del piso de sala; sobrescribimos para asegurar el efecto visual)
  for (let r = 4; r <= 11; r++) {
    castMap[r][14] = 30;
    castMap[r][15] = 30;
    castMap[r][16] = 30;
  }

  // ------- PARED DE SEPARACION con puerta bloqueada -------
  // Muro completo en fila 12, atraviesa todo el castillo
  for (let c = 2; c <= 27; c++) castMap[12][c] = 31;
  // Puerta cerrada en (15, 12) - tile 34 = puerta con candado dorado
  castMap[12][15] = 34;

  // ------- SALAS LATERALES (filas 14-19) -------

  // Sala oeste (André / Ravell) - cols 2-11
  for (let r = 14; r <= 19; r++) {
    castMap[r][2] = 31;
    castMap[r][11] = 31;
  }
  for (let c = 2; c <= 11; c++) {
    castMap[14][c] = 31;
    castMap[19][c] = 31;
  }
  castMap[19][7] = 30; // Puerta abierta al pasillo
  for (let r = 15; r < 19; r++) for (let c = 3; c < 11; c++) castMap[r][c] = 30;

  // Sala este (Yam la Carcelera) - cols 18-27
  for (let r = 14; r <= 19; r++) {
    castMap[r][18] = 31;
    castMap[r][27] = 31;
  }
  for (let c = 18; c <= 27; c++) {
    castMap[14][c] = 31;
    castMap[19][c] = 31;
  }
  castMap[19][22] = 30; // Puerta abierta al pasillo
  for (let r = 15; r < 19; r++) for (let c = 19; c < 27; c++) castMap[r][c] = 30;

  // ------- Pasillos principales -------
  // Vertical central desde el sur (entrada) hasta la puerta bloqueada
  for (let r = 13; r <= 22; r++)
    for (let c = 14; c <= 16; c++) castMap[r][c] = 30;
  // Horizontal a la altura de las puertas de las salas laterales (fila 20)
  for (let c = 7; c <= 22; c++) castMap[20][c] = 30;

  // ------- Salida al mundo (sur) -------
  castMap[KR - 2][15] = 33;
}

// === COLISIONES ===
function solidW(c, r) {
  if (c < 0 || c >= WC || r < 0 || r >= WR) return true;
  const t = wMap[r][c];
  // Agua, árboles, rocas son sólidos
  // Edificios (4) son sólidos
  // Torre cerrada es sólida
  if (t === 2 || t === 3 || t === 7) return true;
  if (t === 4) return true;
  // Decoración sólida del mundo: puestos, estatuas, cercas, cajas, pozos, muñecos y cámara/set.
  if ([18, 19, 20, 21, 22, 23, 25, 27].includes(t)) return true;
  if (t === 13) return true;
  if (t === 9) return true;
  if (t === 12 && !towerOpen) return true;
  if (routeGateBlocks(c, r)) return true;
  return false;
}

function solidC(c, r, map, cols, rows) {
  if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
  const t = map[r][c];
  // Solo paredes, agua subterránea, lava y puerta bloqueada son sólidos
  // Tiles 27,28,33 NO son sólidos (salidas y cristales)
  // Tile 34 = puerta bloqueada del rey (sólida hasta derrotar a Yam)
  return t === 21 || t === 23 || t === 24 || t === 29 || t === 31 || t === 34;
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

// === UBICACIONES PARA MAPA GRANDE ===
const MAP_LOCATIONS = [
  { x: 20, y: 143, nm: 'Aldea Pitch', col: '#E84040' },
  { x: 40, y: 110, nm: 'V.Storyboard', col: '#40A0E0' },
  { x: 54, y: 82, nm: 'Cantera Rodaje', col: '#E8A030' },
  { x: 30, y: 52, nm: 'Ult.Toma', col: '#40C040' },
  { x: 44, y: 22, nm: 'P.Montaje', col: '#D860A8' },
  { x: 38, y: 8, nm: 'Cast.Difusión', col: '#C8A830' },
  { x: 15, y: 105, nm: 'C.Volcánica', col: '#E06030' },
  { x: 65, y: 38, nm: 'C.Cristalina', col: '#80A0E0' },
  { x: 55, y: 6, nm: 'Torre P.A.', col: '#F060F0' },
];


const ROUTE_SIGNS = [
  { x: 20, y: 138, name: 'Cartel Aldea Pitch', lines: ['↑ Ruta 1 / Villa Storyboard', '↓ Aldea Pitch', 'Habla con Alexandro para más info.'] },
  { x: 36, y: 115, name: 'Cartel Ruta 1', lines: ['↑ Villa Storyboard', '↓ Aldea Pitch', 'Los Proa bloquean rutas sin diploma.'] },
  { x: 50, y: 104, name: 'Cartel Ruta 2', lines: ['↑ Cantera Rodaje', '↓ Villa Storyboard', '← Cueva Volcánica'] },
  { x: 64, y: 76, name: 'Cartel Ruta 3', lines: ['↑ Feria Última Toma', '↓ Cantera Rodaje', 'Piero suele explorar por aquí.'] },
  { x: 31, y: 47, name: 'Cartel Ruta 4', lines: ['↑ Prados Montaje', '↓ Feria Última Toma', '→ Cueva Cristalina'] },
  { x: 43, y: 16, name: 'Cartel Ruta 5', lines: ['↑ Castillo Difusión', '↓ Prados Montaje', 'La torre abre en post-game.'] },
  { x: 14, y: 107, name: 'Cartel Cueva', lines: ['Cueva Volcánica', 'Se oyen ecos de punk antiguo.', 'Dicen que una pared busca dragones.'] },
  { x: 71, y: 40, name: 'Cartel Cueva', lines: ['Cueva Cristalina', 'Al fondo vive SaloGon.', 'No todos los recuerdos son monstruos.'] },
];
// ============================================================
// BLOQUE 10A: DATOS DE NPCs - ALDEAS
// ============================================================

const npcs = [
  // ==========================================
  // PUEBLO 1: ALDEA PITCH (Inicio)
  // ==========================================
  {
    x: 20,
    y: 142,
    tp: 'alessandro',
    nm: 'Alessandro',
    dlg: [
      [
        '¡Bienvenido a Aldea Pitch!',
        'Aquí comienza tu aventura.',
        '¡El reino te espera!',
      ],
      [
        'Cada pueblo tiene su esencia.',
        'Cada criatura su historia.',
        '¡Tú escribes la tuya!',
      ],
      ['Runa creativa.', 'Entretres...', '¡Brandcut!', 'Brandcut es la clave'],
      [
        'Los Proa cuidan de las criaturas.',
        'Cuando no están en tu equipo,',
        'descansan en la Proa.',
      ],
      ['¡Increíble!'],
      [
        'PRIMERA REGLA DE BRANDCUT:',
        '...',
        'Ok, mal ejemplo.',
        'Solo pelea.',
      ],
      [
        'Eres el mejor, jugador.',
        '¡Eres el mejor!',
        'Y no se lo digo a cualquiera.',
      ],
      [
        'Y recuerden, niños:',
        'no olviden comer sus vegetales.',
      ],
    ],
    postDlg: [
      '¡Has llegado lejos!',
      'El castillo te espera.',
      '¡Demuestra tu valor!',
    ],
    flag: 'metAles',
  },
  {
    x: 19,
    y: 142,
    tp: 'gabriela',
    nm: 'Gabriela',
    postOnly: true,
    dlg: [
      ['¡El Rey me aceptó!', '¡Soy su discípula!', '¡Mira mi nueva armadura!'],
      [
        'Me mudé junto a Alessandro.',
        'Entreno con Navarrete de día...',
        'y sueño en casa de noche.',
        '¡La vida perfecta!',
      ],
      [
        'Alessandro dice que ahora',
        'YO soy la heroína de la casa.',
        'Él sigue siendo mi héroe.',
        '...No le digas que dije eso.',
      ],
    ],
    foreignDlg: [
      'Vengo de tierras cálidas...',
      'Allá el sol brilla distinto.',
      'Pero aquí encontré mi',
      'verdadero hogar.',
      'Y ahora, también mi futuro.',
    ],
    flag: 'metGab',
    battle: true,
    battleIntro: ['¡Entrené con el Rey!', '¡Siente el poder de su discípula!'],
    fixedTeam: [{ id: 'zumbaccino' }, { id: 'inferpavo' }],
  },
  {
    x: 22,
    y: 142,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    altDlg: [
      ['¡Nos volvemos a ver!', 'El ángulo cambió pero el encuadre sigue.'],
    ],
    heal: true,
  },
  {
    x: 18,
    y: 144,
    tp: 'alexandro',
    nm: 'Alexandro',
    dlg: [
      [
        '¡Hey! Controles rápidos:',
        'Flechas para moverte',
        'de casilla en casilla.',
        'Z sirve para correr.',
      ],
      [
        'SPACE es acción:',
        'hablar, leer carteles,',
        'abrir cosas importantes.',
        'Si dudas, presiona SPACE.',
      ],
      [
        'X abre el menú.',
        'Ahí ves equipo, mapa,',
        'misiones, objetos y Proa.',
        '¡No te pierdas, crack!',
      ],
    ],
    postDlg: ['¡Tu ritmo es imparable!', 'Sigue corriendo hacia el éxito!'],
    flag: 'metAlexandro',
    tutorial: true,
    battle: false,
    exterior: true,
    battleIntro: ['¡Velocidad es poder!', '¡A pelear!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'pinzardo' }],
  },
  {
    x: 24,
    y: 144,
    tp: 'luis',
    nm: 'Luis',
    dlg: [
      [
        'Combate con calma, mi pana,',
        'elige ataque y gana la gana.',
        'Si el tipo es correcto,',
        '¡el golpe sale perfecto!',
      ],
      [
        'Fuego seca planta con pasión,',
        'planta bebe agua con razón,',
        'agua apaga fuego sin drama:',
        '¡así se enciende la trama!',
      ],
      [
        'Para capturar sin apuro,',
        'baja su vida, te lo aseguro.',
        'Lanza Cristal Vínculo al final,',
        '¡y quizá se una a tu coral!',
      ],
    ],
    postDlg: [
      'El río llegó al mar.',
      'Y el mar es tranquilo.',
      'Buen viaje, héroe.',
    ],
    flag: 'metLuis',
    tutorial: true,
    battle: false,
    exterior: true,
    battleIntro: ['El río de la vida...', 'también tiene batallas.'],
    fixedTeam: [{ id: 'raizan' }, { id: 'pixie' }],
  },
  {
    x: 21,
    y: 146,
    tp: 'nicole',
    nm: 'Nicole',
    // ==========================================
    // DIÁLOGOS NORMALES (Game)
    // Ella está libre, pero amargada por el techo y extrañando amigas
    // ==========================================
    dlg: [
      [
        '¡Maldita sea! ¡Otro aventurero!',
        '¿Nadie arregla mi techo?',
        '¡Diablos con este reino y sus constructores!',
        'Gotea más que un grifo roto.',
      ],

      [
        'A veces pienso en los pueblos del norte...',
        'Hace mucho que no veo',
        'ciertas caras familiares.',
        'a veces me pregunto... ¿estarán bien?',
      ],

      [
        '¿Sabes qué es lo peor?',
        'Que hay dos personas allá',
        'en esos pueblos... que solían',
        'hacerme reír tanto.',
        'Ahora solo me queda el techo.',
      ],

      [
        'Los Proa dicen que cuidan criaturas.',
        'Qué bonito.',
        'Ojalá alguien cuidara mi techo.',
        'O al menos me trajera un paraguas.',
      ],

      [
        'Alexandro dice que corra con Z.',
        'Sí, claro.',
        'Correría si no tuviera miedo',
        'de que el techo se me caiga encima.',
        'La velocidad no salva de la humedad.',
      ],

      [
        'Luas habla de "cortes" y "tomas".',
        'No puede ser más webon.',
        'Debí hacer equipo con mis monas.',
        '*suspiro*',
      ],

      [
        'Si subes hacia el norte...',
        'Diles que sigo aquí.',
        'Viva, amargada, pero viva.',
        'Y con el techo goteando.',
      ],
    ],

    // ==========================================
    // DIÁLOGOS POST-GAME (Crucificada)
    // Aquí es donde aparece clavada en la cruz
    // ==========================================
    postDlg: [
      [
        'La vida puede ser hermosa...',
        'Para otras personas.',
        'No para mí. Pero está bien.',
        'Al menos el techo ya no gotea... porque estoy afuera.',
        'Ironías del destino.',
      ],

      [
        '¿Sabes qué es gracioso?',
        'Estoy literalmente crucificada',
        'y TODAVÍA me gotea algo.',
        'Quizás son lágrimas.',
        'O quizás sigue lloviendo.',
        'Quién sabe.',
      ],

      [
        'Mis amigas...',
        'No las veo pasar.',
        'Me gustaría pensar que me saludan desde lejos.',
        'No pueden bajarme.',
        'Reglas del guion, supongo.',
        'Un guionista muy cruel.',
      ],

      [
        '¿Otra vez tú?',
        '¿No tienes nada mejor que hacer?',
        'Yo sí... pero estoy clavada aquí.',
        'Literal y figurativamente.',
        'El universo tiene un sentido del humor retorcido.',
      ],

      [
        'Anoche soñé que estaba libre.',
        'Corría por un prado lleno de flores.',
        'Luego me despertó... bueno, no me desperté.',
        'Seguí aquí. Clavada.',
        'Los sueños son mentirosos.',
      ],

      [
        'Los Proa cuidan criaturas.',
        'Qué ironía.',
        'A mí nadie me cuida.',
        'Ni siquiera yo misma puedo bajarme.',
        'Necesito un "Proa" personal.',
      ],

      ['Merma Merma Merma.', 'si lo piensas bien todo puede ser merma'],

      [
        'A veces pienso...',
        'Si me muero aquí clavada,',
        '¿al menos alguien me bajaría?',
        '¿O me dejarían aquí como advertencia?',
        '"Miren, así termina quien confía en techos medievales".',
        'Qué epitafio tan poético.',
      ],

      [
        '¿Quieres un consejo?',
        'Nunca confíes en un techo.',
        'Ni en la gente que promete arreglarlo.',
        'Y definitivamente no confíes',
        'en el post-game de tu vida.',
        'Te deja clavada.',
      ],
    ],

    postBattleIntro: [
      'Ja... ¿quieres pelear?',
      'Estoy algo... clavada.',
      'Literalmente.',
      'Pero mis criaturas tienen',
      'más libertad emocional',
      'que todo este pueblo.',
    ],

    flag: 'metNic',
    battle: true,
    postOnlyBattle: true, // Solo pelea en post-game
    fixedTeam: [{ id: 'gusarix' }, { id: 'gorilirico' }, { id: 'emberwing' }],
  },

  // ==========================================
  // PUEBLO 2: VILLA STORYBOARD
  // ==========================================
  {
    x: 40,
    y: 109,
    tp: 'gabriela',
    nm: 'Gabriela',
    preOnly: true,
    dlg: [
      [
        '¿Conoces al Rey del castillo?',
        'Quiero ser su aprendiz.',
        '¡Pero no sé su nombre!',
      ],
      [
        'Mi... Ale, Alessandro dice',
        'que soy muy soñadora.',
        '¡Pero soñar es GRATIS!',
      ],
      [
        'Dicen que el Rey tiene',
        'una criatura de cada tipo.',
        '¡CINCO! ¡Imagínate!',
      ],
    ],
    postDlg: ['¡Me mudé con Alessandro!', '¡El amor es el mejor guión!'],
    foreignDlg: [
      'Vengo de tierras cálidas...',
      'Allá el sol brilla distinto.',
      'Pero aquí encontré mi hogar.',
    ],
    flag: 'metGab',
    battle: true,
    battleIntro: [
      '¡Mi n... Miguel dice que tengo grandes sueños!',
      '¡Pues soñaré tu derrota!',
    ],
    fixedTeam: [{ id: 'zumbaflor' }, { id: 'emberwing' }],
  },
  {
    x: 42,
    y: 109,
    tp: 'claudia',
    nm: 'Claudia',
    dlg: [
      [
        'Cada combate que ganes',
        'te dará oro. ¡Ahorra!',
        'Tienes que AHORRAR, es MUY',
        'importante... Edison también dice eso.',
      ],
      [
        'Los enemigos más fuertes',
        'dan más oro al derrotarlos.',
        '¡Combate mucho!',
      ],
      [
        'El oro sirve para comprar',
        'pociones y cristales.',
        '¡En la tienda de David-O!',
      ],
    ],
    postDlg: [
      'N-no es que me alegre',
      'que Edison esté aquí...',
      'Solo es... conveniente.',
      '...Ay chamare contigo.',
    ],
    flag: 'metCla',
  },
  {
    x: 38,
    y: 111,
    tp: 'fabiana',
    nm: 'Fabiana',
    dlg: [
      [
        '¡Hola! Mi casa es el punto',
        'de reunión de mis amigos.',
        '¡Somos... un buen elenco!',
        'creo',
      ],
      ['A Gabriela y a mi nos gusta el arte', '¿te nos unes?'],
      [
        '¿De verdad es necesario que',
        'todos duerman en mi casa',
        'cada trabajo que hacemos?',
        'si, creo que les voy a cobrar',
      ],
    ],
    postDlg: [
      '¡El reino está en paz!',
      'Todo gracias a ti.',
      '¡Sigue explorando!',
    ],
    flag: 'metFab',
  },
  {
    x: 44,
    y: 111,
    tp: 'paulo',
    nm: 'Paulo',
    dlg: [
      [
        '🌿 Planta vence a 💧 Agua',
        '💧 Agua vence a 🔥 Fuego',
        '🔥 Fuego vence a 🌿 Planta',
      ],
      [
        '🐉 Dragón es fuerte contra',
        '🔥 Fuego y 🌿 Planta, pero',
        '🧚 Hada lo destruye.',
      ],
      [
        '🧚 Hada vence a 🐉 Dragón',
        'y 💧 Agua, pero es débil',
        'contra 🔥 Fuego y 🌿 Planta.',
      ],
    ],
    postDlg: [
      'La teoría se confirmó.',
      '¡Tu victoria lo demuestra!',
      'Los tipos importan.',
    ],
    flag: 'metPau',
    battle: true,
    battleIntro: ['La teoría es buena...', '¡Pero la práctica es mejor!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'flameye' }],
  },
  {
    x: 41,
    y: 113,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Bienvenido a mi tienda!', '¿Qué necesitas hoy?']],
    altDlg: [['¡Otra visita, otra venta!', '¡El comercio nunca descansa!']],
    shop: true,
  },

  // ==========================================
  // PUEBLO 3: CANTERA RODAJE
  // ==========================================
  {
    x: 54,
    y: 81,
    tp: 'pachi',
    nm: 'Pachi',
    dlg: [
      [
        'Soy actor de profesión.',
        'Mi hermano André está',
        'afuera esperando...',
      ],
      [
        'André es el hombre más',
        'hermoso de su pueblo.',
        '¡Y le pusieron una máscara!',
      ],
      ['Algún día actuaré con él.', 'Pero primero... ¡ESCENA 3!'],
    ],
    postDlg: [
      '¡Mi hermano André es libre!',
      '¡Ahora actuamos juntos!',
      '¡ESCENA FINAL!',
    ],
    flag: 'metPac',
    battle: true,
    battleIntro: ['¡ACTO TERCERO!', '¡La batalla comienza!'],
    fixedTeam: [{ id: 'eastern' }, { id: 'pixie' }],
  },
  {
    x: 56,
    y: 81,
    tp: 'dante',
    nm: 'Dante',
    dlg: [
      ['Vivo un infierno...', 'pero sigo adelante.', 'Eso es lo que importa.'],
      [
        'André es el hombre más',
        'guapo que he conocido.',
        'Le respeto muchísimo.',
      ],
      [
        'La vida trae dolor',
        'pero también sabiduría.',
        'Hay que seguir caminando.',
      ],
    ],
    postDlg: [
      'El infierno se apagó.',
      'No del todo...',
      'pero las llamas son',
      'más pequeñas ahora.',
    ],
    flag: 'metDan2',
    battle: true,
    exterior: true,
    battleIntro: ['El infierno me enseñó', 'a pelear. ¿Estás listo?'],
    fixedTeam: [{ id: 'serpentdrg' }, { id: 'glaciolote' }],
  },
  {
    x: 52,
    y: 83,
    tp: 'gonchi',
    nm: 'Gonchi',
    dlg: [
      [
        '¡Hola! Toma esto.',
        'Ten cuidado con la chica',
        'de harapos en Aldea Pitch.',
        'Esa mujer me da miedo.',
      ],
    ],
    postDlg: [
      '¿La chica de harapos?',
      'Ahora está... peor.',
      'No quiero saber más.',
    ],
    flag: 'metGon',
    givesItem: true,
    battle: true,
    exterior: true,
    battleIntro: ['Toma esto primero...', '¡Ahora sí, luchemos!'],
    fixedTeam: [{ id: 'peztronauta' }, { id: 'gorilan' }],
  },
  {
    x: 58,
    y: 83,
    tp: 'nahuel',
    nm: 'Nahuel',
    dlg: [
      [
        '¡Oye! ¿Quieres trabajo?',
        '...Es broma, no tengo.',
        '¿O sí? No, no tengo.',
      ],
      [
        'Mi hermano Alejandro está',
        'mucho más al norte esperando.',
        'Tiene el pelo largo, no falla.',
      ],
      [
        '¿Por qué uso shorts?',
        'Porque las piernas también',
        'merecen ver el sol.',
      ],
      [
        'Mano, te puesto unas monedas.',
        'a que nunca me has visto con',
        'pantalones',
      ],
    ],
    postDlg: [
      '¡Mi hermano y yo podemos',
      'pelear juntos ahora!',
      '¡Sangre de mi sangre!',
    ],
    flag: 'metNah',
    battle: true,
    battleIntro: ['¡Las piernas libres', 'pelean mejor! ¡Vamos!'],
    fixedTeam: [{ id: 'salamandro' }, { id: 'flamingo' }],
  },
  {
    x: 60,
    y: 80,
    tp: 'andre',
    nm: 'André',
    postOnly: true,
    dlg: [
      [
        '...Esta máscara pesa.',
        'Quiero ser actor, como Pachi.',
        'Pero esta máscara...',
      ],
      [
        'Dicen que soy hermoso.',
        'Yo no lo sé. No me veo.',
        'Solo siento el hierro frío.',
      ],
      [
        'Las chicas aquí son amables.',
        'Pero extraño mi libertad.',
        'Algún día...',
      ],
    ],
    postDlg: [
      'La máscara sigue aquí...',
      'Pero el peso se siente',
      'diferente ahora.',
      'Como si importara menos.',
    ],
    flag: 'metAnd',
    battle: true,
    battleIntro: ['Esta máscara pesa...', 'Pero mis criaturas no.'],
    fixedTeam: [{ id: 'serpentdrg' }, { id: 'gorilan' }],
  },

  // ==========================================
  // PUEBLO 4: FERIA ÚLTIMA TOMA
  // ==========================================
  {
    x: 30,
    y: 51,
    tp: 'brisa',
    nm: 'Brisa',
    dlg: [
      [
        'Perdona, estoy ocupada.',
        'El trabajo no se hace solo.',
        '¡Roberto! ¡Trae la cena!',
      ],
      [
        'Mi novio Roberto es dulce',
        'pero no sabe cocinar.',
        'Menos mal que sé yo.',
      ],
      [
        'Algún día tendré vacaciones.',
        'Algún día... *suspiro*',
        '¡Roberto! ¡Las cortinas!',
      ],
    ],
    postDlg: [
      'Roberto me preparó la cena',
      'hoy... ¡Y no quemó nada!',
      'Estoy... feliz. *sonríe*',
    ],
    flag: 'metBri',
    battle: true,
    battleIntro: ['¡No tengo tiempo para esto!', '...Bueno, tal vez un poco.'],
    fixedTeam: [{ id: 'axolotl' }, { id: 'orquidea' }],
  },
  {
    x: 32,
    y: 51,
    tp: 'roberto',
    nm: 'Roberto',
    dlg: [
      [
        'No soy de esta tierra,',
        'pero...',
        'las brisas de aqui son hermosas',
        'MI Brisa es hermosa',
      ],
      [
        'Mi tierra natal era... más avanzada.',
        'Aquí hace calor, pero hay amor.',
        '¿Qué más puedo pedir?',
      ],
      [
        'Brisa trabaja mucho...',
        'pero siempre sonríe al verme.',
        'Eso vale más que oro.',
      ],
    ],
    postDlg: [
      'Brisa me preparó sopa hoy.',
      '¡Sin quemar nada!',
      'Estamos progresando.',
    ],
    foreignDlg: [
      'De donde yo vengo...',
      'la tecnología es increíble.',
      'Pero no reemplaza el calor',
      'de una persona que te ama.',
    ],
    flag: 'metRob',
    battle: true,
    battleIntro: ['¡En mi tierra se pelea', 'con el corazón! ¡Vamos!'],
    fixedTeam: [{ id: 'peztronauta' }, { id: 'wyvern' }],
  },
  {
    x: 28,
    y: 53,
    tp: 'deyna',
    nm: 'Deyna',
    dlg: [
      [
        'Extraño a dos personas...',
        'A mi novia, que está lejos.',
        'Y a alguien del sur, en Aldea Pitch.',
      ],
      [
        '¡Explora el mapa entero!',
        'Hay criaturas increíbles',
        'en cada rincón. ¡VE!',
      ],
      [
        'Dayana es mi mejor amiga.',
        'Siempre juntas, siempre.',
        'Pero hay días que pienso',
        'en el otro lado del mapa...',
        'y me pregunto si allá',
        'alguien también piensa en mí.',
      ],
    ],
    postDlg: [
      'Dicen que alguien al sur, en Aldea Pitch,',
      'está atada a algo pesado...',
      'No sé por qué, pero',
      'siento que debería ir.',
      'Aunque no puedo.',
    ],
    flag: 'metDey',
    battle: true,
    preGameOnce: true,
    hasChecklist: true,
    battleIntro: ['¡Mi pulsera me da fuerza!', '¡Vamos a pelear!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'thornbuck' }],
  },
  {
    x: 34,
    y: 53,
    tp: 'dayana',
    nm: 'Dayana',
    dlg: [
      [
        '¿Sabías que Luchito',
        'quiere casarse? ¡Aww!',
        'Hernán ama a una tal Tishe.',
      ],
      [
        'A Dan le gusta alguien',
        'llamado Taylor West...',
        'Dante vive un infierno.',
      ],
      [
        'Tamara adora dibujar',
        'y Andrea quiere ser profe.',
        'Echo de menos el sur del reino...',
        'Allá dejé algo importante.',
      ],
    ],
    postDlg: [
      'El sur del reino sigue lejos...',
      'Pero las estrellas son',
      'las mismas en todas partes.',
      'Eso me consuela un poco.',
    ],
    flag: 'metDay',
    battle: true,
    battleIntro: ['¡Las amigas pelean', 'con el corazón! ¡Vamos!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'raizan' }],
  },

  // ==========================================
  // PUEBLO 5: PRADOS MONTAJE
  // ==========================================
  {
    x: 44,
    y: 21,
    tp: 'angelly',
    nm: 'Angelly',
    dlg: [
      [
        '¡¡JAJAJA!! ¡Te conozco!',
        '¡Somos amigos de infancia!',
        'Dame 1 de oro... *ríe*',
        '¡Ahora COMBATAMOS!',
      ],
    ],
    postDlg: [
      '¡¡JAJAJA!! ¡Otra vez!',
      '¡Dame otro oro!',
      '¡Nunca me canso de esto!',
    ],
    flag: 'metAng',
    battle: true,
    isAngelly: true,
    battleIntro: ['¡JAJAJA! ¡Dame tu oro!', '¡Y tus criaturas también!'],
  },
  {
    x: 46,
    y: 21,
    tp: 'ximena',
    nm: 'Ximena',
    dlg: [['Extraño a mi ex...', 'Pero bueno. ¿Tienes', 'criaturas bonitas?']],
    postDlg: [
      '¿Sabes? He viajado mucho.',
      'Y este lugar... es especial.',
      'Toma, te doy algo.',
    ],
    foreignDlg: [
      'Vengo de muy muy lejos...',
      'De tierras con buena música.',
      'Donde los ritmos cuentan',
      'historias que el alma entiende.',
      'Pero aquí encontré mi',
      'propio ritmo.',
    ],
    flag: 'metXim',
    givesItem: true,
    battle: true,
    exterior: true,
    battleIntro: ['Extraño a alguien...', '¡Pero puedo pelear!'],
    fixedTeam: [{ id: 'sidhe' }, { id: 'salamandro' }],
  },
  {
    x: 42,
    y: 23,
    tp: 'hernan',
    nm: 'Hernán',
    dlg: [
      [
        'Tishe... está tan lejos.',
        'Pero mi amor por ella',
        'cruza cualquier distancia.',
      ],
      [
        'La edad te enseña',
        'a amar mejor. Con paciencia.',
        'Con el corazón abierto.',
      ],
      ['Si la ves... dile que', 'la pienso cada día.', '...Tishe, te extraño.'],
    ],
    postDlg: [
      'Hablé con Tishe...',
      'Ya no necesito esta barba.',
      'Tengo nuevas ganas de vivir.',
      'El mundo es hermoso.',
    ],
    flag: 'metHer',
    battle: true,
    battleIntro: ['Pelear me recuerda', 'que sigo aquí...'],
    fixedTeam: [{ id: 'wyvern' }, { id: 'glaciolote' }],
  },
  {
    x: 48,
    y: 23,
    tp: 'alejandro',
    nm: 'Alejandro',
    dlg: [
      [
        '¡Hermanito! ¡Un abrazo!',
        '¿Quieres pelear? ¡Vamos!',
        '¡No te rindas NUNCA!',
      ],
    ],
    postDlg: [
      '¡Mi hermano y yo juntos!',
      '¡Somos imparables!',
      '¡Ven cuando quieras!',
    ],
    flag: 'metAlej',
    battle: true,
    exterior: true,
    battleIntro: ['¡Hermanito! ¡A pelear!'],
    fixedTeam: [{ id: 'sidhe' }, { id: 'gusarix' }],
  },

  // ==========================================
  // RUTAS - EXPLORADORES (Protoperiodistas)
  // ==========================================
  {
    x: 35,
    y: 125,
    tp: 'jairo',
    nm: 'Jairo',
    dlg: [
      [
        '¡Fútbol medieval! ¡GOOOL!',
        '¿Has visto a mi amigo Piero?',
        'Está más al norte, por la Ruta 3.',
      ],
      [
        'Patear pelotas de cuero',
        'es el mejor deporte.',
        '¡Deberías probarlo!',
      ],
      [
        'Conocíamos a Manuel...',
        'Se fue hace tiempo.',
        'Era renegón pero buen tipo.',
        'Le hubieras caído bien.',
      ],
    ],
    postDlg: [
      '¡Encontré a Mr. Olo-Man!',
      '¡Está en la Cueva Volcánica!',
      '¡Sigue siendo raro!',
      '¡Pero es buen tipo!',
    ],
    flag: 'metJai',
    battle: true,
    exterior: true,
    battleIntro: ['¡GOOOL! Digo...', '¡LUCHA! ¡Vamos!'],
    fixedTeam: [{ id: 'flameye' }, { id: 'flamingo' }],
  },
  {
    x: 15,
    y: 102,
    tp: 'oscar',
    nm: 'Oscar',
    dlg: [
      [
        'Registro todo lo que veo.',
        'Como... un cronista.',
        'Pero sin pluma ni tinta.',
      ],
      [
        'Conocíamos a Manuel...',
        'Tenía voz rasposa.',
        'Quería ser comentarista.',
        'Se fue... pero lo recordamos.',
      ],
      [
        'Este camino es peligroso.',
        'Pero las historias que cuenta...',
        'valen la pena.',
      ],
    ],
    postDlg: [
      'El registro está completo.',
      'Pero la historia sigue.',
      'Siempre sigue.',
    ],
    flag: 'metOscar',
    battle: true,
    exterior: true,
    battleIntro: ['¡Los hechos hablan!', '¡Mis criaturas también!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'axolotl' }, { id: 'wyvern' }],
  },
  {
    x: 65,
    y: 72,
    tp: 'piero',
    nm: 'Piero',
    dlg: [
      [
        '¿Mi cabello rubio? Una apuesta.',
        'Perdí... pero quedó bien.',
        '¿O no?',
      ],
      [
        'Manuel era... especial.',
        'Renegón, voz rasposa.',
        'Decía que el mundo necesita',
        'quienes cuenten la verdad.',
      ],
      [
        'He visto cosas en este viaje.',
        'Criaturas, personas, historias.',
        'Todo merece ser contado.',
      ],
    ],
    postDlg: ['La apuesta terminó.', 'Pero el viaje no.', 'Nunca termina.'],
    flag: 'metPiero',
    battle: true,
    exterior: true,
    battleIntro: ['¡La verdad duele!', '¡Pero las batallas también!'],
    fixedTeam: [{ id: 'flamingo' }, { id: 'pixie' }, { id: 'serpentdrg' }],
  },
  {
    x: 30,
    y: 40,
    tp: 'chrys',
    nm: 'Chrys',
    dlg: [
      ['Soy productora.', 'Coordino, organizo,', 'hago que todo funcione.'],
      [
        'Conozco a Yam, Ravell,',
        'Hernán, Nahuel, Alejandro...',
        'Son mi "elenco" especial.',
      ],
      [
        'Este camino es el final.',
        'Pero los finales son solo',
        'comienzos disfrazados.',
      ],
    ],
    postDlg: [
      'La producción está completa.',
      'Pero siempre hay',
      'una segunda temporada.',
    ],
    flag: 'metChrys',
    battle: true,
    exterior: true,
    battleIntro: ['¡Produzco victorias!', '¡Y derrotas también!'],
    fixedTeam: [
      { id: 'inferpavo' },
      { id: 'glaciolote' },
      { id: 'elefantasy' },
    ],
  },

  // ==========================================
  // LUAS EN TODOS LOS PUEBLOS (curandero)
  // ==========================================
  {
    x: 40,
    y: 107,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 54,
    y: 79,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 30,
    y: 49,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 44,
    y: 19,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },

  // ==========================================
  // LIDERES DE GIMNASIO (Fases B-E): Tamara, Luchito, Andrea, Dan
  // ==========================================
  {
    x: 41, y: 110,
    tp: 'tamara',
    nm: 'Tamara',
    flag: 'metTamara',
    isLeader: true,
    leaderKey: 'tamara',
    dlg: [['Soy Tamara, lider de Villa Storyboard.']],
    postDlg: ['El reino fluye en perfecta armonia.'],
    battle: true,
    battleIntro: ['La armonia del set... jademos!'],
    fixedTeam: [{ id: 'flamcrest' }, { id: 'axolotl' }, { id: 'ivygoat' }],
  },
  {
    x: 55, y: 82,
    tp: 'luchito',
    nm: 'Luchito',
    flag: 'metLuchito',
    isLeader: true,
    leaderKey: 'luchito',
    dlg: [['Soy Luchito. Aqui el amor lo es todo.']],
    postDlg: ['El amor vencio, como siempre.'],
    battle: true,
    battleIntro: ['Porque te amo, pelea conmigo!'],
    fixedTeam: [{ id: 'flamingo' }, { id: 'glaciolote' }, { id: 'gorilan' }],
  },
  {
    x: 31, y: 52,
    tp: 'andrea',
    nm: 'Andrea',
    flag: 'metAndrea',
    isLeader: true,
    leaderKey: 'andrea',
    dlg: [['Soy Andrea, tu profesora de Feria Ultima Toma.']],
    postDlg: ['Aprobada. La ficcion es realidad.'],
    battle: true,
    battleIntro: ['Leccion final: nunca subestimes a tu profesora!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'spritefly' }, { id: 'thornbuck' }],
  },
  {
    x: 45, y: 22,
    tp: 'dan',
    nm: 'Dan',
    flag: 'metDan',
    isLeader: true,
    leaderKey: 'dan',
    dlg: [['Soy Dan. Los chismes mueven el reino.']],
    postDlg: ['La mejor publicidad es la verdad... y los chismes.'],
    battle: true,
    battleIntro: ['Camara, accion, combate!'],
    fixedTeam: [{ id: 'ajolord' }, { id: 'pixie' }, { id: 'hedroble' }],
  },

  // ==========================================
  // DAVID-O EN PUEBLOS 2-5 (tienda)
  // ==========================================
  {
    x: 56,
    y: 79,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Hey! ¡Otra vez tú!', '¿Compras o combatimos?']],
    shop: true,
  },
  {
    x: 32,
    y: 49,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Mi tienda favorita!', '...Es la única. ¡Compra!']],
    shop: true,
  },
  {
    x: 46,
    y: 19,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Última parada!', '¡Aprovecha antes de subir al castillo!']],
    shop: true,
  },
]; // Fin array npcs

// ==========================================
// NPC DE CUEVA
// ==========================================

const caveNpcs = [
  {
    x: 6,
    y: 24,
    map: 'cave1',
    tp: 'oloman',
    nm: 'Mr. Olo-Man',
    dlg: [
      [
        '¿Eh? ¡Hola! Soy del futuro.',
        'Me gusta estar aquí.',
        'Extraño a The Strokes...',
        '¡Pero COMBATAMOS!',
      ],
    ],
    sadDlg: [
      'Perdón, pero estoy muy',
      'triste ahora, faltan 600',
      'años para que vuelva a',
      'escuchar a Julian...',
    ],
    postDlg: [
      '¡600 años sin Strokes!',
      'Pero al menos puedo',
      'pelear contigo.',
      '¡Es casi tan bueno!',
      '¡OTRA VEZ!',
    ],
    flag: 'metOlo',
    battle: true,
    isPunk: true,
    battleIntro: [
      '¿¡600 años sin Strokes?!',
      '¡Necesito descargar esta',
      'energía! ¡COMBATAMOS!',
    ],
    fixedTeam: [{ id: 'pixie' }, { id: 'elefantasy' }, { id: 'sidhe' }],
  },
  {
    x: Math.floor(CC / 2),
    y: 5,
    map: 'cave2',
    tp: 'salogon',
    nm: 'SaloGon',
    flag: 'metSaloGon',
    vision: true,
    dlg: [['Soy SaloGon, vidente de la cueva.']],
  },
];

// ==========================================
// NPCs DEL CASTILLO
// ==========================================

const castNpcs = [
  {
    // Yam guarda la puerta cerrada del trono. Está en la sala este.
    x: 22,
    y: 16,
    tp: 'yam',
    nm: 'Yam la Carcelera',
    // Diálogo cuando NO derrotaste a André/Ravell: no pelea, te manda al otro
    preReqDlg: [[
      '¡¡¡HEY!!! ¿¡¡TÚ AQUÍ!!?',
      '¡¡¡Primero derrota a mi HERMANO',
      'en el ala OESTE!!!',
      '¡¡¡Sin eso NO PIERDO MI TIEMPO!!!',
    ]],
    preReqFlags: ['metAndreCastle', 'metRavellCastle'],
    dlg: [[
      '¡¡¡ALTO AHÍ!!!',
      '¡¡¡Soy Yam, la CARCELERA!!!',
      '¡¡¡Tengo la LLAVE del Rey!!!',
      '¿¡¡Crees poder QUITÁRMELA?!!',
    ]],
    postDlg: ['¡¡¡MAGNÍFICO!!!', '¡¡¡OTRA VEZ!!!', '¡¡¡ME ENCANTA!!!'],
    battle: true,
    battleIntro: [
      '¡¡¡NADIE PASA A VER AL REY!!!',
      '¡¡¡SIN VENCERME PRIMERO!!!',
    ],
    // Guardiana del rey: criaturas evolucionadas al máximo
    team: [
      new Cre('inferpavo', 40),   // Flameye final form
      new Cre('espinardoom', 40), // Thornbuck final form
      new Cre('wyvernlord', 42),  // Wyvern final form
    ],
    flag: 'metYamCastle',
  },

  {
    // André en la sala oeste (primer combate obligatorio antes de Yam)
    x: 7,
    y: 16,
    tp: 'andre',
    nm: 'André',
    preOnly: true,
    dlg: [
      [
        '...Esta máscara pesa.',
        'Pachi está afuera...',
        'y yo sigo aquí.',
        'Vigilo la entrada al Rey.',
        'Para pasarme necesitarás fuerza.',
      ],
    ],
    battle: true,
    battleIntro: [
      'No puedo salir todavía...',
      'pero sí puedo pelear.',
      '¡Prepárate para el silencio!',
    ],
    // Primer filtro serio antes de Yam
    team: [
      new Cre('serpentboss', 35),
      new Cre('gorilegend', 35),
      new Cre('ornisagent', 38),
    ],
    flag: 'metAndreCastle',
  },

  {
    // Ravell reemplaza a André en post-game, misma posición
    x: 7,
    y: 16,
    tp: 'ravell',
    nm: 'Ravell',
    postOnly: true,
    dlg: [
      [
        'Perdí una apuesta.',
        'Ahora soy bufón.',
        'Pero aceptar un trabajo',
        'también es demostrar valor.',
      ],
      [
        'Jaja, rianse hermanos CTM...',
        'búrlense todo lo que quieran',
        'pero un trabajo es un trabajo',
        'si puedo con esto',
        '*asiente con la cabeza con una sonrisa*',
      ],
    ],
    battle: true,
    battleIntro: ['Un bufón también puede', 'dar un buen espectáculo.'],
    // Post-game: aún más fuerte que André
    team: [
      new Cre('sidhearia', 42),
      new Cre('glaciolote', 42),
      new Cre('lucistrella', 44),
    ],
    flag: 'metRavellCastle',
  },

  {
    // Rey al fondo de la sala del trono (norte del castillo)
    x: 15,
    y: 4,
    tp: 'boss',
    nm: 'Rey Navarrete',
    dlg: [['...Ah. Otro retador.', '*bostezo*', 'Supongo que sí.']],
    boss: true,
  },
];

// ==========================================
// NPC POST-GAME: EDISON
// ==========================================

const edisonNPC = {
  x: 43,
  y: 109,
  tp: 'edison',
  nm: 'Edison',
  dlg: [
    [
      '¡Hola! Soy Edison.',
      'Claudia es... increíble.',
      'La admiro muchísimo.',
      '¿Has escuchado un violonchelo?',
      'Es el sonido más hermoso.',
    ],
  ],
  foreignDlg: [
    'Vengo de tierras frías...',
    'Donde el invierno dura',
    'más que cualquier canción.',
    'Pero aquí el calor de',
    'Claudia derrite todo.',
    '...No le digas que dije eso.',
  ],
  challengeDlg: [
    '¿Quieres ir contra mí?',
    '¿O prefieres un nuevo reto?',
    'Las parejas del reino',
    'pueden combatir juntas...',
  ],
  battle: true,
  battleIntro: ['La música grave me enseñó', 'el ritmo de la batalla.'],
  fixedTeam: [{ id: 'glaciolote' }, { id: 'wyvern' }],
};

// ==========================================
// PAREJAS DE COMBATE (post-game)
// ==========================================

const pairBattleData = [
  {
    nm: 'Alessandro y Gabriela',
    p1: 'Alessandro',
    p2: 'Gabriela',
    intro: ['¡Juntos somos invencibles!', '¡El amor nos da poder!'],
    t1: [{ id: 'emberwing' }, { id: 'serpentdrg' }],
    t2: [{ id: 'sidhe' }, { id: 'axolotl' }],
  },
  {
    nm: 'Roberto y Brisa',
    p1: 'Roberto',
    p2: 'Brisa',
    intro: [
      '¡Cocinamos tu derrota!',
      '...Eso no tiene sentido.',
      '¡Pero suena bien!',
    ],
    t1: [{ id: 'ornishadow' }, { id: 'ivygoat' }],
    t2: [{ id: 'longwok' }, { id: 'thornbuck' }],
  },
  {
    nm: 'Claudia y Edison',
    p1: 'Claudia',
    p2: 'Edison',
    intro: [
      'N-no es que quiera pelear',
      'junto a él...',
      '¡Solo es estratégico!',
    ],
    t1: [{ id: 'zumbaflor' }, { id: 'flameye' }],
    t2: [{ id: 'glaciolote' }, { id: 'wyvern' }],
  },
  {
    nm: 'Pachi y Ravell',
    p1: 'Pachi',
    p2: 'Ravell',
    intro: ['¡ACTO FINAL!', '¡Los hermanos del teatro!', '...ja.'],
    t1: [{ id: 'eastern' }, { id: 'pixie' }],
    t2: [{ id: 'sidhe' }, { id: 'axolotl' }],
  },
  {
    nm: 'Alejandro y Nahuel',
    p1: 'Alejandro',
    p2: 'Nahuel',
    intro: ['¡Sangre de guerreros!', '¡Los hermanos atacan!'],
    t1: [{ id: 'sidhe' }, { id: 'serpentdrg' }],
    t2: [{ id: 'emberwing' }, { id: 'flamingo' }],
  },
  {
    nm: 'Dayana y Deyna',
    p1: 'Dayana',
    p2: 'Deyna',
    intro: [
      'La amistad es tan fuerte',
      'como cualquier vínculo.',
      '¡Siempre juntas!',
    ],
    t1: [{ id: 'medusync' }, { id: 'ivygoat' }],
    t2: [{ id: 'spritefly' }, { id: 'thornbuck' }],
  },
];

// ==========================================
// CONSTANTES DE DIÁLOGO
// ==========================================

// [refactor-phase5c] shopLore movido a src/screens/shop.js

const bossDialogues = [
  ['Hacía años... ¿emoción?', 'No. Debe ser indigestión.'],
  ['Espera. ¿Fue divertido?', 'No recuerdo eso...'],
  ['¡JA! ¡Tu criatura tiene agallas!', '¡Igual que tú!'],
  ['¡¡INCREÍBLE!! ¡¡ESTOY VIVO!!', '¡¡DAME TODO!!'],
  [
    '¡¡¡NO TE RINDAS!!!',
    '¡¡¡SOMOS GUERREROS!!!',
    '¡¡¡ESTE MOMENTO ES ETERNO!!!',
  ],
];

const endDialogue = [
  'Joven guerrero...',
  'Me devolviste la esperanza.',
  'Si puedo soñar,',
  'puedo hacer realidad ese sueño.',
  '¡VE! ¡Sé la luz del reino!',
  '¡GRACIAS, amigo mío!',
];

const castleBlockedDlg = [
  'Aún no puedes entrar.',
  'Habla con todos en el reino',
  'y captura todos los tipos.',
];

const towerBlockedDlg = [
  'La puerta está cerrada.',
  'Necesitas una llave especial.',
  'Habla con los extranjeros...',
];

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
  return Math.abs(G.pl.x - n.x) + Math.abs(G.pl.y - n.y) < 2;
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

// === NIVELES POR ZONA ===
// Mapa vertical 80x150.
// r = fila del mapa. Mientras más bajo el número, más al norte.

const WORLD_LEVEL_ZONES = [
  // Pueblos
  { id: 'pitch', nm: 'Aldea Pitch', rMin: 138, rMax: 149, min: 2, max: 5 },
  {
    id: 'storyboard',
    nm: 'Villa Storyboard',
    rMin: 105,
    rMax: 114,
    min: 8,
    max: 11,
  },
  { id: 'rodaje', nm: 'Cantera Rodaje', rMin: 77, rMax: 86, min: 14, max: 18 },
  {
    id: 'ultimatoma',
    nm: 'Feria Última Toma',
    rMin: 47,
    rMax: 56,
    min: 22,
    max: 26,
  },
  { id: 'montaje', nm: 'Prados Montaje', rMin: 17, rMax: 26, min: 31, max: 36 },

  // Rutas
  { id: 'route1', nm: 'Ruta 1', rMin: 115, rMax: 137, min: 4, max: 7 },
  { id: 'route2', nm: 'Ruta 2', rMin: 87, rMax: 104, min: 10, max: 14 },
  { id: 'route3', nm: 'Ruta 3', rMin: 57, rMax: 76, min: 18, max: 22 },
  { id: 'route4', nm: 'Ruta 4', rMin: 27, rMax: 46, min: 26, max: 31 },
  { id: 'route5', nm: 'Ruta 5', rMin: 2, rMax: 16, min: 36, max: 40 },
];

// Rangos especiales para mapas interiores
const SPECIAL_MAP_LEVELS = {
  cave1: { id: 'cave1', nm: 'Cueva Volcánica', min: 10, max: 16 },
  cave2: { id: 'cave2', nm: 'Cueva Cristalina', min: 26, max: 34 },
  castle: { id: 'castle', nm: 'Castillo Difusión', min: 40, max: 45 },
  tower: { id: 'tower', nm: 'Torre P.A.', min: 45, max: 58 },
};

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

// Data de las misiones de cada líder
const LEADER_MISSIONS = {
  tamara: {
    leaderNm: 'Tamara',
    diploma: 'Fotografía Estética',
    dlgStart: [
      '¡Hola! Soy la líder de este pueblo.',
      'Pero primero demuestra que mereces',
      'el diploma. Tengo un reto para ti.',
      'Muéstrame que entiendes la armonía',
      'de los elementos. Tráeme una criatura',
      'de Fuego, una de Agua y una de Planta.',
      '¡Las necesito en tu equipo!',
    ],
    dlgAccept: ['¡Perfecto! Ve y completa el reto.'],
    dlgFail: [
      'Aún te falta una criatura.',
      'Necesito una de cada tipo:',
      '🔥 Fuego, 💧 Agua y 🌿 Planta.',
    ],
    dlgWin: ['¡Eso es armonía pura!', '¡Ahora sí, peleemos!'],
    dlgVictory: [
      '¡Increíble! Aquí tienes tu diploma.',
      '"Fotografía Estética"...',
      'No tiene mucho que ver conmigo,',
      'pero es el que me tocó. ¡Felicidades!',
    ],
    check: function () {
      const types = new Set(G.party.map((c) => c.tp));
      return types.has('fire') && types.has('water') && types.has('plant');
    },
  },
  luchito: {
    leaderNm: 'Luchito',
    diploma: 'Documental',
    dlgStart: [
      '¡El amor me da fuerzas!',
      'Pero primero necesito ver',
      'que sabes lo que haces.',
      'Demuéstrame dominio del combate.',
      '¡Hazme 3 golpes súper efectivos!',
      'Puedes hacerlo contra cualquiera.',
    ],
    dlgAccept: ['¡Ve y demuestra tu poder!'],
    dlgFail: [
      'Aún necesitas más golpes súper efectivos.',
      '¡Usa el tipo correcto contra el tipo correcto!',
    ],
    dlgWin: ['¡Esos golpes fueron hermosos!', '¡Ahora sí, el amor nos guía!'],
    dlgVictory: [
      '¡Toma tu diploma! "Documental"...',
      'Suena como algo que un periodista',
      'como Piero querría. ¡Enhorabuena!',
    ],
    superEffectiveHits: 0,
    check: function () {
      return LEADER_MISSIONS.luchito.superEffectiveHits >= 3;
    },
  },
  andrea: {
    leaderNm: 'Andrea',
    diploma: 'Ficción',
    dlgStart: [
      '¡Lección especial antes de la batalla!',
      'Te haré 3 preguntas.',
      'Responde correctamente 2 de 3',
      'y te dejo combatir.',
    ],
    dlgAccept: ['¡Enfoque! Las preguntas vienen...'],
    dlgFail: [
      'Necesitas al menos 2 respuestas correctas.',
      '¡Vuelve cuando estés preparada/o!',
    ],
    dlgWin: ['¡Aprobado! Lección final:', '¡nunca subestimes a tu profesora!'],
    dlgVictory: [
      '¡Aquí está tu diploma! "Ficción"...',
      'Porque a veces la realidad',
      'necesita un poco de imaginación.',
      '¡Felicidades, alumno/a!',
    ],
    questions: [
      {
        q: '¿Qué tipo es fuerte contra Dragón?',
        opts: ['Fuego', 'Hada', 'Planta'],
        correct: 1,
      },
      {
        q: '¿Cuántos tipos de criaturas existen?',
        opts: ['3', '5', '7'],
        correct: 1,
      },
      {
        q: '¿Cómo se llaman los encargados?',
        opts: ['Proas', 'Líderes', 'Maestros'],
        correct: 0,
      },
    ],
    quizScore: 0,
    quizIdx: 0,
    quizActive: false,
    check: function () {
      return false;
    },
  },
  dan: {
    leaderNm: 'Dan',
    diploma: 'Publicidad',
    dlgStart: [
      'Tengo curiosidad por las personas.',
      'Habla con los varones del pueblo',
      'y cuéntame algo sobre ellos.',
      '¡Chismes aceptados!',
    ],
    dlgAccept: ['¡Ve, habla y regresa con datos!'],
    dlgFail: ['Aún no me has contado nada.', 'Habla con los varones y vuelve.'],
    dlgWin: [
      '¡Interesante! Ahora peleemos.',
      'El chisme más fuerte',
      'es el que se gana en combate.',
    ],
    dlgVictory: [
      '¡Tu diploma! "Publicidad"...',
      'Porque los chismes son la mejor',
      'publicidad que existe.',
      '¡Felicidades!',
    ],
    gossip: 0,
    gossipNeeded: 3,
    check: function () {
      return LEADER_MISSIONS.dan.gossip >= LEADER_MISSIONS.dan.gossipNeeded;
    },
  },
};

function resetLeaderMissions() {
  LEADER_MISSIONS.luchito.superEffectiveHits = 0;
  LEADER_MISSIONS.andrea.quizScore = 0;
  LEADER_MISSIONS.andrea.quizIdx = 0;
  LEADER_MISSIONS.andrea.quizActive = false;
  LEADER_MISSIONS.dan.gossip = 0;
  LEADER_MISSIONS.dan.reported = [];
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
  if (G.supervisor) return true;
  switch (fromPueblo) {
    case 'pitch':
      return true; // P1 -> P2 sin diploma
    case 'storyboard':
      return hasDiploma('tamara');
    case 'rodaje':
      return hasDiploma('luchito');
    case 'ultimatoma':
      return hasDiploma('andrea');
    case 'montaje':
      return hasDiploma('dan');
    default:
      return true;
  }
}


const ROUTE_GATES = [
  { from: 'storyboard', leader: 'tamara', x: 40, y: 104, w: 11, place: 'Villa Storyboard' },
  { from: 'rodaje', leader: 'luchito', x: 54, y: 76, w: 11, place: 'Cantera Rodaje' },
  { from: 'ultimatoma', leader: 'andrea', x: 30, y: 46, w: 11, place: 'Feria Última Toma' },
  { from: 'montaje', leader: 'dan', x: 44, y: 16, w: 11, place: 'Prados Montaje' },
];

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
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: 'Personal' },
    dlgArr: [
      'Soy parte del personal de',
      'la comunidad univ...ficada',
      `asignado a ${gate.place}.`,
      'Los árboles cierran los bordes:',
      'solo este camino queda abierto.',
      `Para pasar, vence a ${mission.leaderNm}`,
      `y trae el diploma "${mission.diploma}".`,
    ],
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
  };
  sfx.nef();
}


function nearRouteSign(sign) {
  return G.curMap === 'world' && Math.abs(G.pl.x - sign.x) <= 1 && Math.abs(G.pl.y - sign.y) <= 1;
}

function checkRouteSign() {
  const sign = ROUTE_SIGNS.find((sg) => nearRouteSign(sg));
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
      G.curMap = etc <= 40 ? 'cave1' : 'cave2';
      G.pl.x = Math.floor(CC / 2);
      G.pl.y = CR - 3;
      G.pl.d = 3;
      G.pl.stepTarget = null;
      G.pl.moving = false;
      updateCamera(CC, CR);
      aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
      return;
    }
  }

  const mv = moveEntity((c, r) => solidW(c, r), WC, WR);

  if (mv) {
    const tc = Math.floor(G.pl.x),
      tr = Math.floor(G.pl.y);
    const tile = wMap[tr]?.[tc];

    // Encuentros en hierba alta
    if (!G.supervisor && tile === 5 && Math.random() < 0.018975) {
      startWild();
    }

    // Encuentros cerca de agua (más agua)
    if (tile === 0) {
      let nearWater = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (wMap[tr + dr]?.[tc + dc] === 2) nearWater = true;
        }
      if (!G.supervisor && nearWater && Math.random() < 0.0088) startWild('water');
    }

    // Cristal Vínculo
    if (tile === 10) {
      wMap[tr][tc] = 0;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales Vínculo!');
    }

    // Entrada cueva
    // === ENTRADA A CUEVA (empujar ↑ contra la puerta) ===
    if (kh('ArrowUp')) {
      const etc = Math.floor(G.pl.x),
        etr = Math.floor(G.pl.y);
      if (wMap[etr - 1]?.[etc] === 9 && G.pl.y - etr < 0.4) {
        G.prevPos = { x: G.pl.x, y: G.pl.y }; // Guarda: un bloque abajo de la entrada
        G.curMap = etc <= 40 ? 'cave1' : 'cave2';
        G.pl.x = Math.floor(CC / 2);
        G.pl.y = CR - 3; // Un bloque adelante de la salida interna
        G.pl.d = 3; // Mirando hacia el interior
        updateCamera(CC, CR);
        aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
        return;
      }
    }

    // Puerta del castillo
    if (tile === 11) {
      // Modo supervisor/batallador: acceso libre para testing
      if (G.supervisor || G.batallador || (G.allTalked && G.allCaught)) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        G.curMap = 'castle';
        G.pl.x = 15;
        G.pl.y = KR - 3;
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
      // Modo supervisor/batallador: acceso libre para testing
      if (G.supervisor || G.batallador || towerOpen) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        G.curMap = 'tower';
        G.pl.x = Math.floor(TWC / 2);
        G.pl.y = TWR - 3;
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

  // Acción
  if (kp(' ')) {
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
      const fromMap = G.curMap; // Guardamos el nombre antes de cambiarlo
      G.curMap = 'world';

      if (G.caveReturnPos) {
        G.pl.x = G.caveReturnPos.x;
        G.pl.y = G.caveReturnPos.y;
        G.pl.d = 0; // mirando abajo
      } else {
        // fallback por si no existe retorno guardado
        if (fromMap === 'cave1') {
          G.pl.x = 15;
          G.pl.y = 106;
        } else {
          G.pl.x = 65;
          G.pl.y = 39;
        }
        G.pl.d = 0;
      }

      updateCamera(WC, WR);
      aN('Saliste de la cueva.');
      return;
    }

    // Cristal
    if (tile === 28) {
      map[tr][tc] = 20;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales!');
      tile = 20; // ahora cuenta como suelo normal para lógica posterior
    }

    // Encuentros en cualquier tile caminable
    const walkableCaveTile =
      tile === 20 || tile === 26 || tile === 27 || tile === 28;

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

        if (nearLava && Math.random() < 0.5) {
          startWild('fire');
        } else {
          startWild(types[Math.floor(Math.random() * types.length)]);
        }
        updateCamera(CC, CR);
        return;
      }
    }
  }

  if (kp(' ')) {
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.'); else if (G.batallador) aN('Batallador: interacción con NPCs desactivada.');
    else checkNPC(caveNpcs);
  }
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(CC, CR);
}

if (kp(' ')) {
  if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.'); else if (G.batallador) aN('Batallador: interacción con NPCs desactivada.');
  else checkNPC(caveNpcs);
}
if (kp('x') || kp('Escape')) {
  sfx.sel();
  G.scr = 'menu';
  G.ms = { s: 0 };
}

updateCamera(CC, CR);

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
    const tile = castMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)];
    if (tile === 33) {
      G.curMap = 'world';
      if (G.prevPos) {
        G.pl.x = G.prevPos.x;
        G.pl.y = G.prevPos.y;
      } else {
        G.pl.x = 20;
        G.pl.y = 32;
      }
      updateCamera(WC, WR);
      aN('Saliste del castillo.');
    }
  }

  if (kp(' ')) {
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.'); else if (G.batallador) aN('Batallador: interacción con NPCs desactivada.');
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
        startWild(types[Math.floor(Math.random() * types.length)]);
      }
    }

    // Cristales
    if (tile === 28) {
      towerMap[tr][tc] = 20;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales!');
    }

    // Salida
    if (tile === 27 && tr > Math.floor(CR / 2)) {
      G.curMap = 'world';
      if (G.prevPos) {
        G.pl.x = G.prevPos.x;
        G.pl.y = G.prevPos.y;
      }
      aN('Saliste de la torre.');
    }
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

    // Dar item
    if (n.givesItem) {
      const items = ['pot', 'crv'];
      const it = items[Math.floor(Math.random() * 2)];
      G[it]++;
      aN(`¡Recibiste ${it === 'pot' ? 'poción' : 'cristal'}!`);
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

// === INICIO BATALLA SALVAJE ===
function startWild(forceType) {
  const types = forceType ? [forceType] : ['fire', 'water', 'plant'];
  const tp = types[Math.floor(Math.random() * types.length)];
  const pool = POOLS[tp];
  const id = pool[Math.floor(Math.random() * pool.length)];
  // En modo batallador el enemigo tambien es nivel 20 para pelea equilibrada
  const lv = G.batallador ? 20 : wildLv();
  const en = new Cre(id, lv);

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

// === INICIO BATALLA BOSS ===
function startBoss() {
  const bossLv = Math.max(40, secondStrongestLv());

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

// === MENÚ PRINCIPAL ===
function uMenu() {
  if (G.showMap) {
    uMapScreen();
    return;
  }
  if (G.proaOpen) {
    uProa();
    return;
  }
  if (G.showMissions) {
    uMissions();
    return;
  }
  if (G.showDex) {
    uDex();
    return;
  }

  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.ms.s = (G.ms.s + 8) % 9;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.ms.s = (G.ms.s + 1) % 9;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    switch (G.ms.s) {
      case 0:
        if (G.pot > 0 && G.party.length > 0) {
          G.pot--;
          G.party[0].heal(Math.floor(G.party[0].mHp * 0.2));
          sfx.heal();
          aN('+HP!');
        } else aN('¡Sin pociones!');
        break;
      case 1:
        {
          const f = G.party.find((c) => c.hp <= 0);
          if (f && G.rev > 0) {
            G.rev--;
            f.hp = Math.floor(f.mHp * 0.5);
            sfx.heal();
            aN(`${f.nm} revivió!`);
          } else aN('Nadie caído o sin revivir.');
        }
        break;
      case 2:
        G.proaOpen = true;
        G.proaSel = 0;
        G.proaMode = 'view';
        break;
      case 3:
        G.showMap = true;
        break;
      case 4:
        G.showMissions = true;
        break;
      case 5:
        G.showDex = true;
        G.dexSel = 0;
        break;
      case 6:
        if (G.batallador) {
          aN('Batallador: no se puede guardar en modo test.');
          sfx.nef();
        } else {
          saveGame();
        }
        break;
      case 7:
        G.scr = 'world';
        break;
      case 8:
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

function dMenu() {
  drawMap();
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(0, 0, 640, 480);

  if (G.showMap) {
    dMapScreen();
    return;
  }
  if (G.proaOpen) {
    dProa();
    return;
  }
  if (G.showMissions) {
    dMissions();
    return;
  }
  if (G.showDex) {
    dDex();
    return;
  }

  dBoxMenu(16, 16, 190, 320, G.batallador ? 'MENÚ ⚔️ BATALLADOR' : 'MENÚ');
  const opts = [
    'Poción',
    'Revivir',
    'Equipo',
    'Mapa',
    'Misiones',
    'Criaturario',
    'Guardar',
    'Volver',
    'Reiniciar toda la partida',
  ];
  opts.forEach((o, i) => {
    cx.fillStyle = G.ms.s === i ? '#ffd700' : '#fff';
    cx.font = i === 8 ? '6px "Press Start 2P"' : '8px "Press Start 2P"';
    cx.fillText(`${G.ms.s === i ? '▶ ' : '  '}${o}`, 34, 48 + i * 28);
  });
  cx.fillStyle = '#aaa';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`🧪${G.pot} 💎${G.crv} ❤${G.rev} 💰${G.gold}`, 34, 314);

  dBoxMenu(220, 16, 410, 450, 'EQUIPO');
  if (G.party.length === 0) {
    cx.fillStyle = '#888';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Sin criaturas.', 230, 50);
  } else {
    G.party.forEach((c, i) => {
      const cy = 42 + i * 62;
      if (i % 2 === 0) {
        cx.fillStyle = 'rgba(255,255,255,.03)';
        cx.fillRect(218, cy - 8, 404, 58);
      }
      cx.fillStyle = tCol(c.tp);
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${tEmo(c.tp)} ${c.nm}`, 230, cy);
      cx.fillStyle = '#ffd700';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`Lv.${c.lv}`, 450, cy);
      cx.fillStyle = '#aaa';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(tNam(c.tp), 530, cy);
      dHP(230, cy + 8, 140, 6, c.hp, c.mHp);
      cx.fillStyle = '#fff';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`ATK:${c.ak}`, 230, cy + 26);
      cx.fillText(`DEF:${c.df}`, 310, cy + 26);
      cx.fillText(`SPD:${c.sp}`, 390, cy + 26);
      cx.fillStyle = '#aaa';
      cx.font = '5px "Press Start 2P"';
      cx.fillText('EXP:', 230, cy + 38);
      dEXP(260, cy + 33, 140, 4, c.ex, c.exTo);
      if (c.hp <= 0) {
        cx.fillStyle = 'rgba(200,0,0,.3)';
        cx.fillRect(218, cy - 8, 404, 58);
        cx.fillStyle = '#E83030';
        cx.font = '6px "Press Start 2P"';
        cx.fillText('CAÍDO', 550, cy + 26);
      }
    });
  }
  if (proa.length > 0) {
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Proa: ${proa.length} criaturas`, 230, 440);
  }
}

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
  G.pl = { x: 20, y: 145, d: 0, f: 0, sprint: false };
  G.party = [];
  G.gold = 200;
  G.pot = 5;
  G.rev = 2;
  G.crv = 3;
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
  G.talkedTo = {};
  G.allTalked = false;
  G.bossTeam = null;
  G.bossIdx = 0;
  G.bossDialogs = 0;
  G.prevPos = null;
  G.showMap = false;
  G.proaOpen = false;
  G.showDex = false;
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
  setLastHealPos({ x: 20, y: 145, map: 'world' });

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
  setTimeout(() => aN('Busca a Edison en Villa Guión.'), 4000);
}
// ============================================================
// BLOQUE 19A: DIBUJAR MAPA DEL MUNDO
// ============================================================

function drawMap() {
  if (G.curMap === 'world') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(WC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(WR, sr + 17);
    for (let r = sr; r < er; r++) for (let c = sc; c < ec; c++) dTileW(c, r);

    // Carteles de ruta
    ROUTE_SIGNS.forEach((sg) => {
      const sx = sg.x * T - cam.x,
        sy = sg.y * T - cam.y;
      if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
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

    // Bloqueo de rutas: árboles cierran los bordes y un Proa bloquea el camino.
    ROUTE_GATES.forEach((g) => {
      if (canPassRoute(g.from)) return;
      for (let dc = -Math.floor(g.w / 2); dc <= Math.floor(g.w / 2); dc++) {
        const sx = (g.x + dc) * T - cam.x;
        const sy = g.y * T - cam.y;
        if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
          if (dc === 0) dRouteProa(sx, sy - 8, fr);
          else dRouteTree(sx, sy, fr);
        }
      }
    });

    // NPCs del mundo
    npcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.fillText('⬇', sx + 16, sy - 10 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    });

    // Edison post-game
    if (postGame) {
      const ed = edisonNPC;
      const esx = ed.x * T - cam.x,
        esy = ed.y * T - cam.y;
      if (esx > -40 && esx < 680 && esy > -40 && esy < 520) {
        dNPC(esx, esy - 8, ed.tp, fr);
        if (nearNPC(ed)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(ed.nm, esx + 16, esy - 18);
          cx.fillText('⬇', esx + 16, esy - 10 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    }
  } else if (G.curMap.startsWith('cave')) {
    const map = G.curMap === 'cave1' ? cave1 : cave2;
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(CC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(CR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, map);

    // NPCs cueva
    caveNpcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.textAlign = 'left';
        }
      }
    });

    // Nombre de cueva
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
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(KC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(KR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, castMap);

    // NPCs castillo
    castNpcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.textAlign = 'left';
        }
      }
    });

    dBox(250, 4, 140, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Castillo Real', 320, 16);
    cx.textAlign = 'left';
  } else if (G.curMap === 'tower') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(TWC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(TWR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, towerMap);

    // Efecto mágico de la torre
    cx.globalAlpha = 0.03;
    cx.fillStyle = '#F8E8A0';
    cx.fillRect(0, 0, 640, 480);
    cx.globalAlpha = 1;

    // Estrellas flotantes
    for (let i = 0; i < 8; i++) {
      cx.globalAlpha = Math.sin(fr * 0.03 + i) * 0.3 + 0.4;
      cx.fillStyle = '#F8E868';
      cx.fillRect(
        (i * 97 + fr * 0.5) % 640,
        (i * 63 + Math.sin(fr * 0.02 + i) * 20) % 480,
        2,
        2
      );
    }
    cx.globalAlpha = 1;

    // Primera criatura del equipo siguiendo al jugador
    if (G.party.length > 0) {
      const fpos = getFollowerPos();
      if (fpos) {
        const fx = fpos.x * T - cam.x,
          fy = fpos.y * T - cam.y;
        dCre(fx, fy - 8, G.party[0].id, G.party[0].lv, fr);
      }
    }

    dBox(220, 4, 200, 18);
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Torre Presupuesto Aprobado', 320, 16);
    cx.textAlign = 'left';
  }

  // === JUGADOR ===
  const ppx = G.pl.x * T - cam.x,
    ppy = G.pl.y * T - cam.y;
  dPlayerGBA(ppx, ppy - 8, G.pl.d, G.pl.f);

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
  cx.fillText('Flechas:Mover Z:Sprint SPACE:Acción X:Menú Y:Supervisor P:Batallador', 8, 473);

  // === PARTÍCULAS Y NOTIFICACIONES ===
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
    G.curMap = save.curMap ?? 'world';

    // Equipo
    G.party = (save.party || []).map((j) => Cre.fromJSON(j));
    setProa((save.proa || []).map((j) => Cre.fromJSON(j)));

    // Inventario
    G.gold = save.gold ?? 200;
    G.pot = save.pot ?? 5;
    G.rev = save.rev ?? 2;
    G.crv = save.crv ?? 3;

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
    setLastHealPos(save.lastHealPos || { x: 20, y: 145, map: 'world' });

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

function enterBatalladorMode(selectedIds) {
  // Guardar snapshot del estado original
  batalladorSnapshot = {
    party: G.party.map((c) => c.toJSON()),
    proa: proa.map((c) => c.toJSON()),
    gold: G.gold,
    pot: G.pot,
    rev: G.rev,
    crv: G.crv,
    plX: G.pl.x,
    plY: G.pl.y,
    curMap: G.curMap,
  };
  // Reemplazar equipo con las 6 criaturas seleccionadas
  G.party = selectedIds.map((id) => createBatalladorCre(id));
  // Dar objetos de prueba
  G.gold = 9999;
  G.pot = 20;
  G.rev = 10;
  G.crv = 10;
  G.batallador = true;
  G.scr = 'world';
  aN('MODO BATALLADOR: equipo test cargado');
  aN('No ganarás EXP. Sin efectos sobre misiones.');
  sfx.win();
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
  // Abrir pantalla de selección de 6 criaturas
  const candidates = getBatalladorCandidates();
  G.batalladorSel = {
    candidates,        // IDs disponibles
    selected: [],      // IDs elegidos (hasta 6)
    cursor: 0,         // posición en la grilla
    columns: 6,        // grid 6 columnas
  };
  G.scr = 'batalladorSelect';
  sfx.sel();
}

// -------- Pantalla de selección de criaturas del modo batallador --------
function uBatalladorSelect() {
  const s = G.batalladorSel;
  if (!s) { G.scr = 'world'; return; }

  const cols = s.columns;
  const total = s.candidates.length;

  if (kp('ArrowRight')) { s.cursor = (s.cursor + 1) % total; sfx.walk(); }
  if (kp('ArrowLeft'))  { s.cursor = (s.cursor - 1 + total) % total; sfx.walk(); }
  if (kp('ArrowDown'))  { s.cursor = Math.min(total - 1, s.cursor + cols); sfx.walk(); }
  if (kp('ArrowUp'))    { s.cursor = Math.max(0, s.cursor - cols); sfx.walk(); }

  if (kp(' ') || kp('Enter')) {
    const id = s.candidates[s.cursor];
    const idx = s.selected.indexOf(id);
    if (idx >= 0) {
      s.selected.splice(idx, 1);   // deseleccionar
      sfx.walk();
    } else if (s.selected.length < 6) {
      s.selected.push(id);         // seleccionar
      sfx.sel();
      if (s.selected.length === 6) {
        // Auto-confirmar cuando se llegan a 6
        const ids = s.selected.slice();
        G.batalladorSel = null;
        enterBatalladorMode(ids);
        return;
      }
    }
  }

  if (kp('x') || kp('Escape')) {
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

  // Título
  cx.fillStyle = '#ffd700';
  cx.font = '14px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('MODO BATALLADOR', 320, 26);
  cx.font = '9px "Press Start 2P"';
  cx.fillStyle = '#D8D8E8';
  cx.fillText(`Elige 6 criaturas nivel 20 (${s.selected.length}/6)`, 320, 46);
  cx.textAlign = 'left';

  // Grid de candidatos
  const cols = s.columns;
  const cellW = 96, cellH = 44;
  const startX = 32, startY = 62;
  s.candidates.forEach((id, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = startX + c * cellW;
    const y = startY + r * cellH;
    if (y > 420) return; // fuera del canvas visible

    const isCursor = i === s.cursor;
    const isSelected = s.selected.includes(id);

    // Fondo celda
    cx.fillStyle = isSelected ? '#2a5a2a' : (isCursor ? '#3a3a5e' : '#1a1a2e');
    cx.fillRect(x, y, cellW - 4, cellH - 4);
    // Borde
    cx.strokeStyle = isCursor ? '#ffd700' : (isSelected ? '#68d858' : '#484858');
    cx.lineWidth = isCursor ? 2 : 1;
    cx.strokeRect(x + 0.5, y + 0.5, cellW - 5, cellH - 5);

    const data = CDB[id];
    if (data) {
      // Emoji tipo + nombre
      cx.fillStyle = tCol(data.tp);
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`${tEmo(data.tp)}${data.nm.slice(0, 10)}`, x + 4, y + 12);
      // Stats mini
      cx.fillStyle = '#B8B8C8';
      cx.font = '5px "Press Start 2P"';
      cx.fillText(`HP${data.hp} AK${data.ak} DF${data.df} SP${data.sp}`, x + 4, y + 26);
      // Marcado si ya está seleccionado (numerito)
      if (isSelected) {
        cx.fillStyle = '#ffd700';
        cx.font = '8px "Press Start 2P"';
        cx.fillText(`#${s.selected.indexOf(id) + 1}`, x + cellW - 22, y + 12);
      }
    }
  });

  // Footer con controles
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 440, 640, 40);
  cx.strokeStyle = '#ffd700';
  cx.strokeRect(0.5, 440.5, 639, 39);
  cx.fillStyle = '#D8D8E8';
  cx.font = '6px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('Flechas: mover  |  SPACE: agregar/quitar  |  X: cancelar', 320, 456);
  cx.fillText('Al llegar a 6 se activa automáticamente', 320, 470);
  cx.textAlign = 'left';
}

function update() {
  tickFrame();
  if (kp('y') && !['battle', 'dialog', '_dialogDone', 'starter', 'intro', 'confirmReset', 'vision', 'batalladorSelect'].includes(G.scr)) {
    toggleSupervisorMode();
  }
  if (kp('p') && !['battle', 'dialog', '_dialogDone', 'starter', 'intro', 'confirmReset', 'vision', 'batalladorSelect'].includes(G.scr)) {
    toggleBatalladorMode();
  }
  // EMERGENCIA: si el jugador queda atascado en un lugar imposible
  // (save corrupto, spawn fuera de mapa, etc.), la tecla R lo teleport
  // de vuelta a Aldea Pitch y limpia el estado de movimiento.
  if (kp('r') && G.scr === 'world') {
    G.curMap = 'world';
    G.pl.x = 20;
    G.pl.y = 145;
    G.pl.d = 0;
    G.pl.f = 0;
    G.pl.sprint = false;
    G.pl.moving = false;
    G.pl.stepTarget = null;
    aN('Respawn de emergencia: Aldea Pitch');
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
        if (d._onDialogFinish) { d._onDialogFinish(d); break; }
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
    case 'batalladorSelect':
      uBatalladorSelect();
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
      drawMap();
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
    case 'batalladorSelect':
      dBatalladorSelect();
      break;
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// === INICIALIZACIÓN ===
function init() {
  initBattleBackgroundAssets();

  // Generar mapas
  genWorld();
  genCave(cave1, CC, CR);
  addOloSecretChamber(cave1);
  genCave(cave2, CC, CR);
  genCastle();
  // Torre: generada siempre (aunque solo esté "abierta" en post-game).
  // Modos supervisor/batallador permiten entrar aunque no esté abierta.
  genTower();

  // No autocargar: el título ahora permite Continuar o Nueva partida.
  G.hasSave = hasSaveGame();
  G.titleSel = 0;

  // [refactor-phase5a] conectar loadGame en el título
  setTitleCallbacks({ loadGame });

  // [refactor-phase5c] conectar callback de batalla de la tienda
  setShopBattleStarter(startNPCBattle);

  // [refactor-phase5d] conectar callbacks del sistema de batalla
  setBattleCallbacks({
    markNPCDefeated,
    checkAllCaught,
    resetRebattles,
    giveDiploma,
    hasDiploma,
    genTower,
    LEADER_MISSIONS,
    bossDialogues,
  });

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
init();
