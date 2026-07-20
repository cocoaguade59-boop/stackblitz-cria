// Menú principal del juego (X/Escape en el mundo).
//
// Este módulo NO importa sub-pantallas (proa, dex, missions, map-screen, objects)
// para evitar fallos en cadena si alguno de esos módulos falla al cargar.
// El dispatch a sub-pantallas lo maneja game.js en el switch de update/draw.
//
// NOTA: uMenu también vive INLINE en game.js (bug double-G). Si cambiás
// opciones o índices, actualizá AMBOS.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { dHP, dEXP } from '../render/ui-bars.js';
import { tCol, tEmo, tNam } from '../data/types.js';
import { aN } from '../utils/particles.js';
import { proa } from '../core/game-flags.js';
import { openMapScreen } from './map-screen.js';

// Opciones fijas + LaFot solo si bagUpgrade (Claudia).
// Índices dinámicos: LaFot se inserta después de Objetos.
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
  // Sub-pantallas despachadas por game.js (no aquí)
  if (G.showMap || G.proaOpen || G.showMissions || G.showDex || G.showObjects) return;

  const opts = getMenuOpts();
  const n = opts.length;
  if (G.ms.s >= n) G.ms.s = 0;

  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.ms.s = (G.ms.s + n - 1) % n;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.ms.s = (G.ms.s + 1) % n;
    sfx.sel();
  }
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
        openMapScreen();
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
        // Laboratorio de fotografía (crafting portátil)
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

function dMenu() {
  // Sub-pantallas despachadas por game.js (no aquí)
  if (G.showMap || G.proaOpen || G.showMissions || G.showDex || G.showObjects) return;

  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(0, 0, 640, 480);

  const opts = getMenuOpts();
  const boxH = Math.min(400, 48 + opts.length * 26 + 70);
  dBoxMenu(16, 16, 200, boxH, G.batallador ? 'MENÚ ⚔️ BATALLADOR' : 'MENÚ');
  opts.forEach((o, i) => {
    const isReset = o.startsWith('Reiniciar');
    cx.fillStyle = G.ms.s === i ? '#ffd700' : o === 'LaFot' ? '#7AC0FF' : '#fff';
    cx.font = isReset ? '6px "Press Start 2P"' : '8px "Press Start 2P"';
    cx.fillText(`${G.ms.s === i ? '▶ ' : '  '}${o}`, 34, 46 + i * 26);
  });
  const footY = 46 + opts.length * 26 + 10;
  cx.fillStyle = '#aaa';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(`🧪${G.pot} ❤${G.rev} 💰${G.gold}`, 34, footY);
  cx.fillText(
    `💎${G.crv || 0} 💠${G.crvC || 0} 🔶${G.crvO || 0} 📜${G.scrolls || 0}`,
    34,
    footY + 14
  );
  const frg = G.frag || { p: 0, c: 0, o: 0 };
  cx.fillStyle = '#777';
  cx.fillText(`Frag ${frg.p}/${frg.c}/${frg.o}`, 34, footY + 28);

  dBoxMenu(230, 16, 400, 450, 'EQUIPO');
  if (G.party.length === 0) {
    cx.fillStyle = '#888';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Sin criaturas.', 240, 50);
  } else {
    G.party.forEach((c, i) => {
      const cy = 42 + i * 62;
      if (i % 2 === 0) {
        cx.fillStyle = 'rgba(255,255,255,.03)';
        cx.fillRect(228, cy - 8, 394, 58);
      }
      cx.fillStyle = tCol(c.tp);
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${tEmo(c.tp)} ${c.nm}`, 240, cy);
      cx.fillStyle = '#ffd700';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`Lv.${c.lv}`, 450, cy);
      cx.fillStyle = '#aaa';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(tNam(c.tp), 530, cy);
      dHP(240, cy + 8, 140, 6, c.hp, c.mHp);
      cx.fillStyle = '#fff';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`ATK:${c.ak}`, 240, cy + 26);
      cx.fillText(`DEF:${c.df}`, 320, cy + 26);
      cx.fillText(`SPD:${c.sp}`, 400, cy + 26);
      cx.fillStyle = '#aaa';
      cx.font = '5px "Press Start 2P"';
      cx.fillText('EXP:', 240, cy + 38);
      dEXP(270, cy + 33, 140, 4, c.ex, c.exTo);
      if (c.hp <= 0) {
        cx.fillStyle = 'rgba(200,0,0,.3)';
        cx.fillRect(228, cy - 8, 394, 58);
        cx.fillStyle = '#E83030';
        cx.font = '6px "Press Start 2P"';
        cx.fillText('CAÍDO', 550, cy + 26);
      }
    });
  }
  if (proa.length > 0) {
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Proa: ${proa.length} criaturas`, 240, 440);
  }
}

export { uMenu, dMenu, getMenuOpts };
