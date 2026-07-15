// Sistema de diálogo: typewriter + caja adaptativa.
//
// uDialog(): avance del texto carácter por carácter con typewriter effect.
// dDialog(): dibujo de la caja de diálogo con el texto parcial.
//
// Al terminar todas las líneas, invoca d.onFinish(d) si existe;
// si no, vuelve a G.scr = 'world'.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { dDialogBox, wrapText } from '../render/ui-boxes.js';
import { postGame, npcDefeats, oloDefeated } from '../core/game-flags.js';

// Helper local: ¿puede combatir este NPC?
function _canNPCBattle(npc) {
  if (!npc || !npc.battle) return false;
  if (!postGame) return true;
  // Post-game: ciclo de re-batallas (Olo-Man resetea todo)
  if (npc.flag === 'metOlo') return true;
  return !npcDefeats[npc.flag] || oloDefeated;
}

// --- LÓGICA DEL DIÁLOGO (typewriter) ---

function uDialog() {
  const d = G.ds;
  d.tm++;

  // Typewriter effect
  if (!d.full) {
    if (d.tm % 2 === 0) {
      d.ci++;
      if (d.ci >= d.dlgArr[d.li].length) d.full = true;
    }
  }

  // Avanzar con SPACE o ENTER
  if (kp(' ') || kp('Enter')) {
    if (!d.full) {
      // Mostrar texto completo inmediatamente
      d.full = true;
      d.ci = d.dlgArr[d.li].length;
    } else {
      // Siguiente línea
      d.li++;
      d.ci = 0;
      d.full = false;
      d.tm = 0;
      sfx.sel();

      if (d.li >= d.dlgArr.length) {
        // Fin del diálogo → delegar al dispatcher en script.js
        G.ds._finished = true;
        // Consumir teclas residuales para no saltar la siguiente pantalla
        G.keys[' '] = false; G.keys['Enter'] = false;
        G.held[' '] = false; G.held['Enter'] = false;
        G.kcd[' '] = false; G.kcd['Enter'] = false;
        G.scr = '_dialogDone';
      }
    }
  }
}

// --- DIBUJAR DIÁLOGO ---

function dDialog() {
  // drawMap() se llama desde script.js antes de dDialog()

  const d = G.ds;
  const curText = d.dlgArr[d.li].substring(0, d.ci);

  // Calcular líneas necesarias para el texto actual
  const lines = wrapText(curText, 42);
  const numLines = Math.max(1, lines.length);

  // Dimensiones adaptativas
  const padX = 16,
    padY = 12;
  const lineH = 15;
  const boxW = 600;
  const boxH = padY * 2 + numLines * lineH + 4;
  const boxX = 20;
  const boxY = 480 - boxH - 10;

  // Dibujar caja blanca con borde negro
  dDialogBox(boxX, boxY, boxW, boxH, d.npc.nm);

  // Dibujar texto negro
  cx.fillStyle = '#000';
  cx.font = '9px "Press Start 2P"';
  lines.forEach((ln, i) => {
    cx.fillText(ln, boxX + padX, boxY + padY + 12 + i * lineH);
  });

  // Indicador de progreso (puntos)
  const progress = `${d.li + 1}/${d.dlgArr.length}`;
  cx.fillStyle = '#A0A0A0';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(progress, boxX + boxW - 60, boxY + boxH - 8);

  // Flecha para continuar
  if (d.full) {
    const arrowX = boxX + boxW - 30;
    const arrowY = boxY + boxH - 14;
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', arrowX, arrowY + Math.sin(fr * 0.2) * 2);
  }
}

// --- HELPERS PARA CREAR DIÁLOGOS ---

function showQuickDialog(name, lines) {
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: name },
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
  };
  sfx.sel();
}

function showDialogThen(name, lines, callback) {
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: name },
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    _onDialogFinish: callback,
  };
  sfx.sel();
}

// Checklist de personas habladas (Deyna)
function showTalkedChecklist(npc) {
  const allNPCs = [
    { flag: 'metAles', nm: 'Alessandro' },
    { flag: 'metFab', nm: 'Fabiana' },
    { flag: 'metNic', nm: 'Nicole' },
    { flag: 'metCla', nm: 'Claudia' },
    { flag: 'metRob', nm: 'Roberto' },
    { flag: 'metBri', nm: 'Brisa' },
    { flag: 'metPau', nm: 'Paulo' },
    { flag: 'metTam', nm: 'Tamara' },
    { flag: 'metNah', nm: 'Nahuel' },
    { flag: 'metPac', nm: 'Pachi' },
    { flag: 'metGab', nm: 'Gabriela' },
    { flag: 'metHer', nm: 'Hernán' },
    { flag: 'metAng', nm: 'Angelly' },
    { flag: 'metDay', nm: 'Dayana' },
    { flag: 'metDey', nm: 'Deyna' },
    { flag: 'metAnd', nm: 'André' },
    { flag: 'metAlej', nm: 'Alejandro' },
    { flag: 'metLuis', nm: 'Luis' },
    { flag: 'metAlexandro', nm: 'Alexandro' },
    { flag: 'metGon', nm: 'Gonchi' },
    { flag: 'metJai', nm: 'Jairo' },
    { flag: 'metDan2', nm: 'Dante' },
    { flag: 'metDaniel', nm: 'Dan' },
    { flag: 'metLuch', nm: 'Luchito' },
    { flag: 'metXim', nm: 'Ximena' },
    { flag: 'metAnd2', nm: 'Andrea' },
    { flag: 'metOlo', nm: 'Mr. Olo-Man' },
  ];

  const talked = allNPCs.filter((n) => G.talkedTo[n.flag]);
  const notTalked = allNPCs.filter((n) => !G.talkedTo[n.flag]);
  const total = allNPCs.length;
  const count = talked.length;

  // Construir líneas de diálogo
  const lines = [];
  lines.push(`¡Veamos! Has conocido a`);
  lines.push(`${count} de ${total} personas.`);
  lines.push(``);

  if (notTalked.length === 0) {
    lines.push('¡¡Conoces a TODOS!!');
    lines.push('¡Eres increíble!');
    lines.push('El reino entero te conoce.');
  } else {
    lines.push('Ya conoces a:');
    // Agrupar de 3 en 3
    for (let i = 0; i < talked.length; i += 3) {
      const group = talked
        .slice(i, i + 3)
        .map((n) => '✓' + n.nm)
        .join(', ');
      lines.push(group);
    }
    lines.push('');
    lines.push('Te falta conocer a:');
    for (let i = 0; i < notTalked.length; i += 3) {
      const group = notTalked
        .slice(i, i + 3)
        .map((n) => '✗' + n.nm)
        .join(', ');
      lines.push(group);
    }
    lines.push('');
    lines.push('¡Sigue buscando!');
  }

  G.scr = 'dialog';
  G.ds = {
    npc: npc,
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    afterBattle:
      npc.battle &&
      _canNPCBattle(npc) &&
      !(npc.preGameOnce && !postGame && npcDefeats[npc.flag]),
  };
  sfx.sel();
}

export { uDialog, dDialog, showQuickDialog, showDialogThen, showTalkedChecklist };
