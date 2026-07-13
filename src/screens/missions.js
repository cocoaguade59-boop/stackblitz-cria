// Pantalla de misiones: progreso del reino.
// Muestra misión principal, secundarias y post-game.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { tEmo } from '../data/types.js';
import { postGame, pairBattles, towerKey, towerOpen, proa } from '../core/game-flags.js';

function uMissions() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.showMissions = false;
  }
}

function drawMission(x, y, title, completed, detail) {
  // Icono de estado
  if (completed) {
    cx.fillStyle = '#30D848';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('✓', x, y + 8);
  } else {
    cx.fillStyle = '#E8C020';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('○', x, y + 8);
  }

  // Título
  cx.fillStyle = completed ? '#30D848' : '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(title, x + 16, y + 6);

  // Detalle
  cx.fillStyle = completed ? '#60A060' : '#aaa';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(detail, x + 16, y + 18);

  // Línea separadora
  cx.fillStyle = 'rgba(255,255,255,.05)';
  cx.fillRect(x, y + 24, 480, 1);
}

function getTypeProgress() {
  const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
  const caught = types.filter(
    (t) => G.party.some((c) => c.tp === t) || proa.some((c) => c.tp === t)
  );
  const icons = types
    .map((t) => {
      const has = caught.includes(t);
      return has ? tEmo(t) : '?';
    })
    .join(' ');
  return `${caught.length}/5 tipos: ${icons}`;
}

function getStars() {
  if (G.mFriend >= 15) return '⭐⭐⭐⭐⭐';
  if (G.mFriend >= 10) return '⭐⭐⭐⭐';
  if (G.mFriend >= 6) return '⭐⭐⭐';
  if (G.mFriend >= 3) return '⭐⭐';
  return '⭐';
}

function getTowerProgress() {
  const steps = [];
  if (towerKey.gabriela) steps.push('Gabriela ✓');
  else steps.push('Gabriela ✗');
  if (towerKey.edison) steps.push('Edison ✓');
  else steps.push('Edison ✗');
  if (towerKey.roberto) steps.push('Roberto ✓');
  else steps.push('Roberto ✗');
  if (towerKey.ximena) steps.push('Ximena ✓');
  else steps.push('Ximena ✗');
  return steps.join(' → ');
}

function dMissions() {
  dBoxMenu(40, 10, 560, 460, 'MISIONES');

  let my = 40;

  // Título
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Progreso del Reino', 60, my);
  my += 20;

  // Misión principal
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('── MISIÓN PRINCIPAL ──', 60, my);
  my += 16;

  drawMission(
    60, my, 'Hablar con todos', G.allTalked,
    `${Object.keys(G.talkedTo).length}/27 habitantes`
  );
  my += 32;

  drawMission(
    60, my, 'Capturar todos los tipos', G.allCaught,
    getTypeProgress()
  );
  my += 32;

  drawMission(
    60, my, 'Derrotar al Rey ', G.bossOk,
    G.bossOk ? '¡Victoria!' : 'Entra al castillo'
  );
  my += 32;

  // Misiones secundarias
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('── SECUNDARIAS ──', 60, my);
  my += 16;

  drawMission(
    60, my, 'Amistad con David-O', G.mFriend >= 15,
    `${G.mFriend}/15 combates (${getStars()} estrellas)`
  );
  my += 32;

  drawMission(
    60, my, 'Encontrar a Mr. Olo-Man', !!G.talkedTo['metOlo'],
    G.talkedTo['metOlo'] ? '¡Encontrado!' : 'Busca en las cuevas'
  );
  my += 32;

  // Post-game
  if (postGame) {
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('── POST-GAME ──', 60, my);
    my += 16;

    drawMission(
      60, my, 'Encontrar a Edison', !!G.talkedTo['metEdison'],
      G.talkedTo['metEdison'] ? '¡En Villa Guión!' : 'Busca en Villa Guión'
    );
    my += 32;

    drawMission(
      60, my, 'Desbloquear parejas', pairBattles,
      pairBattles ? '¡Desbloqueado!' : 'Habla con Edison'
    );
    my += 32;

    drawMission(60, my, 'Abrir la Torre', towerOpen, getTowerProgress());
    my += 32;

    drawMission(
      60, my, 'Capturar a Serafox',
      G.party.some((c) => c.id === 'serafox') || proa.some((c) => c.id === 'serafox'),
      'Criatura secreta en la Torre'
    );
    my += 32;
  }

  // Stats
  my += 8;
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Batallas ganadas: ${G.bWon}`, 60, my);
  my += 14;
  cx.fillText(`EXP total: ${G.tExp}`, 60, my);
  my += 14;
  cx.fillText(`Criaturas: ${G.party.length} equipo + ${proa.length} proa`, 60, my);
  my += 14;
  cx.fillText(`Oro: ${G.gold}`, 60, my);

  // Instrucción
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE/X: Cerrar', 60, 448);
}

export { uMissions, dMissions, drawMission, getTypeProgress, getStars, getTowerProgress };
