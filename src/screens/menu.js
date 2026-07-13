// Menú principal del juego (X/Escape en el mundo).
//
// drawMap() se llama desde script.js ANTES de despachar a este módulo,
// por lo que solo dibujamos el overlay oscuro y los paneles.
//
// Sub-pantallas importadas para que dMenu() pueda delegar el dibujo
// cuando G.showMap/G.proaOpen/G.showMissions/G.showDex están activos.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { dHP, dEXP } from '../render/ui-bars.js';
import { tCol, tEmo, tNam } from '../data/types.js';
import { aN } from '../utils/particles.js';
import { proa } from '../core/game-flags.js';

// saveGame se toma de window.__gameSaveGame (script.js lo expone en init())

// Sub-pantallas del menú (sin dependencia circular: ninguna importa menu.js)
import { uMapScreen, dMapScreen } from './map-screen.js';
import { uMissions, dMissions } from './missions.js';
import { uDex, dDex } from './dex.js';
import { uProa, dProa, uCreData, dCreData, uMoveDetail, dMoveDetail } from './proa.js';

function uMenu() {
  if (G.showMap) { uMapScreen(); return; }
  if (G.proaOpen) { uProa(); return; }
  if (G.showMissions) { uMissions(); return; }
  if (G.showDex) { uDex(); return; }

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
          if (window.__gameSaveGame) window.__gameSaveGame();
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
  // drawMap() ya fue llamado por script.js. Solo dibujamos overlay + paneles.
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(0, 0, 640, 480);

  if (G.showMap) { dMapScreen(); return; }
  if (G.proaOpen) { dProa(); return; }
  if (G.showMissions) { dMissions(); return; }
  if (G.showDex) { dDex(); return; }

  dBoxMenu(16, 16, 190, 320, G.batallador ? 'MENÚ ⚔️ BATALLADOR' : 'MENÚ');
  const opts = [
    'Poción', 'Revivir', 'Equipo', 'Mapa', 'Misiones',
    'Criaturario', 'Guardar', 'Volver', 'Reiniciar toda la partida',
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

export { uMenu, dMenu };
