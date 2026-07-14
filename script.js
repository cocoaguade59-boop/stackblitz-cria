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

import { genWorld, genCave, addOloSecretChamber, genCastle } from './src/world/map-generator.js';


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
          G.pl.x = 72;
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

// Inicia batalla contra oponente del modo batallador (equipo real, nivel forzado a 20)
function startBatalladorNPCBattle(opponent) {
  G.party.forEach((c) => (c.fought = false));
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
            if (b.npcData) markNPCDefeated(b.npcData);
            if (b.npcData?.isPunk && postGame) {
              setOloDefeated(true);
              resetRebattles();
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
    if (b.npcData) markNPCDefeated(b.npcData);
    if (b.npcData?.isPunk && postGame) {
      setOloDefeated(true);
      resetRebattles();
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
  if (b.npcData && b.npcData.isLeader && !hasDiploma(b.npcData.leaderKey)) {
    giveDiploma(b.npcData.leaderKey);
    const LVM = LEADER_MISSIONS[b.npcData.leaderKey];
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

function enterBatalladorMode(selectedIds, opponent) {
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
  // Agregar combates en pareja
  pairBattleData.forEach((pair) => {
    list.push({ nm: pair.nm, isPair: true, team: [...pair.t1.map((c) => ({ id: c.id, lv: 20 })), ...pair.t2.map((c) => ({ id: c.id, lv: 20 }))] });
  });
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

    if (kp('ArrowRight')) { s.cursor = (s.cursor + 1) % total; sfx.walk(); }
    if (kp('ArrowLeft'))  { s.cursor = (s.cursor - 1 + total) % total; sfx.walk(); }
    if (kp('ArrowDown'))  { s.cursor = Math.min(total - 1, s.cursor + cols); sfx.walk(); }
    if (kp('ArrowUp'))    { s.cursor = Math.max(0, s.cursor - cols); sfx.walk(); }

    if (kp(' ') || kp('Enter')) {
      const id = s.candidates[s.cursor];
      const idx = s.selected.indexOf(id);
      if (idx >= 0) {
        s.selected.splice(idx, 1);
        sfx.walk();
      } else if (s.selected.length < 6) {
        s.selected.push(id);
        sfx.sel();
        if (s.selected.length === 6) {
          // Pasar a fase 2: elegir oponente
          s.phase = 'opponent';
          s.opponents = buildBatalladorOpponentList();
          s.opponentCursor = 0;
          sfx.sel();
          return;
        }
      }
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
    cx.fillText(`Elige 6 criaturas nivel 20 (${s.selected.length}/6)`, 320, 46);
    cx.textAlign = 'left';

    const cols = s.columns;
    const cellW = 96, cellH = 44;
    const startX = 32, startY = 62;
    s.candidates.forEach((id, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      if (y > 420) return;

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
    });

    cx.fillStyle = '#0a0a2e';
    cx.fillRect(0, 440, 640, 40);
    cx.strokeStyle = '#ffd700';
    cx.strokeRect(0.5, 440.5, 639, 39);
    cx.fillStyle = '#D8D8E8';
    cx.font = '6px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Flechas: mover  |  SPACE: agregar/quitar  |  X: cancelar', 320, 456);
    cx.fillText('Al llegar a 6 pasas a elegir oponente', 320, 470);
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
// LOCAL TITLE FUNCTIONS (usan la misma G de script.js)
// ============================================================
function startNewGameFlow() {
  clearAllGameSaves();
  G.hasSave = false;
  G.sSel = 0;
  G.curMap = 'world';
  G.pl.x = 20;
  G.pl.y = 145;
  G.pl.d = 3;
  G.pl.stepTarget = null;
  G.pl.moving = false;
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
    G.pl.x = 20;
    G.pl.y = 145;
    G.pl.d = 3;
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

function uMenu() {
  if (G.showMap || G.proaOpen || G.showMissions || G.showDex) return;
  if (kp('ArrowUp') || kp('ArrowLeft')) { G.ms.s = (G.ms.s + 8) % 9; sfx.sel(); }
  if (kp('ArrowDown') || kp('ArrowRight')) { G.ms.s = (G.ms.s + 1) % 9; sfx.sel(); }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    switch (G.ms.s) {
      case 0: if (G.pot > 0 && G.party.length > 0) { G.pot--; G.party[0].heal(Math.floor(G.party[0].mHp * 0.2)); sfx.heal(); aN('+HP!'); } else aN('¡Sin pociones!'); break;
      case 1: { const f = G.party.find((c) => c.hp <= 0); if (f && G.rev > 0) { G.rev--; f.hp = Math.floor(f.mHp * 0.5); sfx.heal(); aN(`${f.nm} revivió!`); } else aN('Nadie caído o sin revivir.'); } break;
      case 2: G.proaOpen = true; G.proaSel = 0; G.proaMode = 'view'; break;
      case 3: G.showMap = true; break;
      case 4: G.showMissions = true; break;
      case 5: G.showDex = true; G.dexSel = 0; break;
      case 6: if (G.batallador) { aN('Batallador: no se puede guardar en modo test.'); sfx.nef(); } else { if (window.__gameSaveGame) window.__gameSaveGame(); } break;
      case 7: G.scr = 'world'; break;
      case 8: if (G.batallador) { aN('Batallador: sal del modo test antes de reiniciar.'); sfx.nef(); } else { G.scr = 'confirmReset'; G.resetSel = 0; } break;
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
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
      if (G.showMap) { uMapScreen(); break; }
      if (G.proaOpen) { uProa(); break; }
      if (G.showMissions) { uMissions(); break; }
      if (G.showDex) { uDex(); break; }
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
      if (G.showMap) { drawMap(); dMapScreen(); break; }
      if (G.proaOpen) { drawMap(); dProa(); break; }
      if (G.showMissions) { drawMap(); dMissions(); break; }
      if (G.showDex) { drawMap(); dDex(); break; }
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

  // [refactor-phase5c] conectar callback de batalla de la tienda
  // Exponer funciones que modulos necesitan via window (sin orden de carga)
  window.__gameLoadGame = loadGame;
  window.__gameSaveGame = saveGame;
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
console.log('[script.js] calling init()');
init();
