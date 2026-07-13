// Pantalla de selección del compañero inicial (Fuego/Agua/Planta).
// Tras confirmar, el prota queda listo en Aldea Pitch.


import { cx } from '../core/canvas.js';
import { G } from '../core/game-state.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { kp } from '../core/input.js';
import { Cre } from '../entities/creature.js';
import { CDB } from '../data/creatures.js';
import { tCol, tEmo, tNam } from '../data/types.js';
import { dCre } from '../render/creature-sprites.js';
import { dBox } from '../render/ui-boxes.js';
import { aN } from '../utils/particles.js';
import { setProa } from '../core/game-flags.js';
import { WC, WR } from '../core/world-constants.js';
import { updateCamera } from '../core/camera.js';

// === PANTALLA DE SELECCIÓN DE INICIAL ===
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

function dStarter() {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);

  // Título
  dBox(60, 8, 520, 46);
  cx.fillStyle = '#ffd700';
  cx.font = '11px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('Alessandro te entrega un compañero', 320, 34);
  cx.fillStyle = '#aaa';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Solo Fuego, Agua o Planta | SPACE confirmar', 320, 48);

  const starters = [
    {
      id: 'flameye',
      nm: 'Flameye',
      tp: 'fire',
      desc: 'Vanidoso pero valiente',
    },
    { id: 'axolotl', nm: 'Ajolotín', tp: 'water', desc: 'Siempre sonriente' },
    { id: 'gorilan', nm: 'Gorilán', tp: 'plant', desc: 'Poeta fuerte de 3 etapas' },
  ];

  starters.forEach((s, i) => {
    const bx = 100 + i * 150,
      by = 68,
      sel = G.sSel === i;

    // Fondo seleccionado
    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.08)';
      cx.fillRect(bx, by - 2, 139, 400);
    }

    // Caja
    dBox(bx + 2, by, 135, 395);

    // Borde dorado si seleccionado
    if (sel) {
      cx.strokeStyle = '#ffd700';
      cx.lineWidth = 2;
      cx.strokeRect(bx + 1, by - 1, 137, 397);
      cx.lineWidth = 1;
    }

    // Nombre
    cx.fillStyle = sel ? '#ffd700' : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(s.nm, bx + 68, by + 18);

    // Tipo
    cx.fillStyle = tCol(s.tp);
    cx.font = '7px "Press Start 2P"';
    cx.fillText(tEmo(s.tp) + ' ' + tNam(s.tp), bx + 68, by + 32);

    // Sprite de criatura
    dCre(bx + 36, by + 42, s.id, 3, fr);

    if (sel) {
      // Stats
      const pc = new Cre(s.id, 5);
      cx.fillStyle = '#fff';
      cx.font = '7px "Press Start 2P"';
      cx.textAlign = 'left';
      cx.fillText(`HP: ${pc.mHp}`, bx + 15, by + 280);
      cx.fillText(`ATK:${pc.ak}`, bx + 15, by + 296);
      cx.fillText(`DEF:${pc.df}`, bx + 15, by + 312);
      cx.fillText(`SPD:${pc.sp}`, bx + 15, by + 328);

      // Descripción
      cx.fillStyle = '#A0B0C0';
      cx.font = '6px "Press Start 2P"';
      cx.textAlign = 'center';
      cx.fillText(s.desc, bx + 68, by + 350);

      // Flecha indicadora
      cx.fillStyle = '#ffd700';
      cx.font = '14px "Press Start 2P"';
      cx.fillText('▼', bx + 68, by - 8 + Math.sin(fr * 0.15) * 3);
    }
  });
  cx.textAlign = 'left';
}

export { uStarter, dStarter };
