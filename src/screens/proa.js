// Sistema Proa: almacén de criaturas.
// Permite ver, mover, inspeccionar datos y liberar criaturas.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { dBoxMenu, dBox, wrapText } from '../render/ui-boxes.js';
import { px } from '../render/render-utils.js';
import { dHP, dEXP } from '../render/ui-bars.js';
import { tCol, tEmo, tNam } from '../data/types.js';
import { CDB } from '../data/creatures.js';
import { Cre } from '../entities/creature.js';
import { ALL_MOVES } from '../data/moves.js';
import { CRE_DESC } from '../data/creature-descriptions.js';
import { dCre } from '../render/creature-sprites.js';
import { aN } from '../utils/particles.js';
import { proa, setProa, captureCount } from '../core/game-flags.js';

function uProa() {
  if (G.proaMode === 'data') {
    uCreData();
    return;
  }
  if (G.proaMode === 'moveDetail') {
    uMoveDetail();
    return;
  }

  if (kp('x') || kp('Escape')) {
    if (G.proaMode === 'swap') {
      G.proaMode = 'view';
      return;
    }
    if (G.proaMode === 'options') {
      G.proaMode = 'view';
      return;
    }
    G.proaOpen = false;
    return;
  }

  const total = G.party.length + proa.length;
  if (total === 0) {
    G.proaOpen = false;
    return;
  }

  if (G.proaMode === 'view') {
    if (kp('ArrowUp')) {
      G.proaSel = (G.proaSel + total - 1) % total;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      G.proaSel = (G.proaSel + 1) % total;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      G.proaMode = 'options';
      G.proaOptSel = 0;
    }
  } else if (G.proaMode === 'options') {
    if (kp('ArrowUp') || kp('ArrowDown')) {
      G.proaOptSel = (G.proaOptSel + 2) % 3;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      if (G.proaOptSel === 0) {
        // Mover
        G.proaMode = 'swap';
        G.proaSwap = G.proaSel;
      } else if (G.proaOptSel === 1) {
        // Datos
        G.proaMode = 'data';
        G.dataMvSel = 0;
        G.dataMvDetail = false;
      } else {
        // Liberar
        const allCre = [...G.party, ...proa];
        const cre = allCre[G.proaSel];
        if (G.party.length <= 1 && G.proaSel < G.party.length) {
          aN('¡No puedes liberar tu última criatura!');
        } else {
          const wasInParty = G.proaSel < G.party.length;
          if (wasInParty) {
            G.party.splice(G.proaSel, 1);
          } else {
            proa.splice(G.proaSel - G.party.length, 1);
          }
          aN(`¡${cre.nm} fue liberado!`);
          sfx.nef();
          G.proaSel = Math.max(
            0,
            Math.min(G.proaSel, G.party.length + proa.length - 1)
          );
          G.proaMode = 'view';
        }
      }
    }
    if (kp('x') || kp('Escape')) {
      G.proaMode = 'view';
    }
  } else if (G.proaMode === 'swap') {
    if (kp('ArrowUp')) {
      G.proaSel = (G.proaSel + total - 1) % total;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      G.proaSel = (G.proaSel + 1) % total;
      sfx.sel();
    }
    if (kp('x') || kp('Escape')) {
      G.proaMode = 'view';
      return;
    }
    if (kp(' ') || kp('Enter')) {
      const allCre = [...G.party, ...proa];
      const temp = allCre[G.proaSwap];
      allCre[G.proaSwap] = allCre[G.proaSel];
      allCre[G.proaSel] = temp;
      G.party = allCre.slice(0, Math.min(6, allCre.length));
      setProa(allCre.slice(Math.min(6, allCre.length)));
      if (G.party.length === 0 && proa.length > 0) G.party.push(proa.shift());
      sfx.sel();
      aN('¡Intercambiado!');
      G.proaMode = 'view';
    }
  }
}

function dProa() {
  if (G.proaMode === 'data') {
    dCreData();
    return;
  }
  if (G.proaMode === 'moveDetail') {
    dMoveDetail();
    return;
  }

  dBoxMenu(40, 20, 560, 440, 'PROA - Almacén');

  const allCre = [...G.party, ...proa];

  cx.fillStyle = '#ffd700';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Equipo: ${G.party.length}/6`, 60, 50);
  cx.fillText(`Proa: ${proa.length}`, 300, 50);

  if (G.proaMode === 'swap') {
    cx.fillStyle = '#E8C830';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Selecciona destino del intercambio', 60, 64);
  } else if (G.proaMode === 'options') {
    cx.fillStyle = '#ffd700';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Elige acción:', 60, 64);
  } else {
    cx.fillStyle = '#aaa';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('SPACE: Opciones | X: Cerrar', 60, 64);
  }

  const startY = 78;
  const visibleMax = 12;
  const scrollStart = Math.max(0, G.proaSel - visibleMax + 1);

  allCre.forEach((c, i) => {
    if (i < scrollStart || i >= scrollStart + visibleMax) return;
    const cy = startY + (i - scrollStart) * 28;
    const sel = G.proaSel === i;
    const isSwap = G.proaMode === 'swap' && G.proaSwap === i;
    const inParty = i < G.party.length;

    if (isSwap) {
      cx.fillStyle = 'rgba(232,200,48,.15)';
      cx.fillRect(55, cy - 5, 500, 24);
    } else if (sel) {
      cx.fillStyle = 'rgba(255,255,255,.05)';
      cx.fillRect(55, cy - 5, 500, 24);
    }

    if (i === G.party.length) {
      cx.fillStyle = '#ffd700';
      cx.fillRect(55, cy - 8, 500, 1);
      cx.fillStyle = '#888';
      cx.font = '5px "Press Start 2P"';
      cx.fillText('── PROA ──', 270, cy - 3);
    }

    cx.fillStyle = sel ? '#ffd700' : inParty ? '#fff' : '#aaa';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${tEmo(c.tp)} ${c.nm}`, 60, cy + 8);
    cx.fillStyle = inParty ? '#fff' : '#888';
    cx.fillText(`Lv.${c.lv}`, 340, cy + 8);
    cx.fillStyle = c.hp > 0 ? '#30D848' : '#E83030';
    cx.fillText(`${c.hp}/${c.mHp}`, 420, cy + 8);
    cx.fillStyle = inParty ? '#ffd700' : '#606878';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(inParty ? 'EQUIPO' : 'PROA', 520, cy + 8);
  });

  // Menú de opciones flotante
  if (G.proaMode === 'options') {
    const optX = 380,
      optY = startY + (G.proaSel - scrollStart) * 28 - 5;
    cx.fillStyle = '#000';
    cx.fillRect(optX - 2, optY - 2, 124, 56);
    cx.fillStyle = '#1a1a3e';
    cx.fillRect(optX, optY, 120, 52);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.strokeRect(optX, optY, 120, 52);

    const opts = ['Mover', 'Datos', 'Liberar'];
    opts.forEach((o, i) => {
      cx.fillStyle =
        G.proaOptSel === i ? '#ffd700' : i === 2 ? '#E83030' : '#fff';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(
        `${G.proaOptSel === i ? '▶ ' : '  '}${o}`,
        optX + 8,
        optY + 14 + i * 16
      );
    });
  }
}

// === PANTALLA DE DATOS DE CRIATURA ===
function uCreData() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) {
    G.proaMode = 'view';
    return;
  }

  if (G.dataMvDetail) {
    uMoveDetail();
    return;
  }

  if (kp('x') || kp('Escape')) {
    G.proaMode = 'view';
    return;
  }
  if (kp('ArrowUp')) {
    G.dataMvSel = (G.dataMvSel + cre.mv.length - 1) % cre.mv.length;
    sfx.sel();
  }
  if (kp('ArrowDown')) {
    G.dataMvSel = (G.dataMvSel + 1) % cre.mv.length;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    G.dataMvDetail = true;
  }
}

function dCreData() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) return;

  if (G.dataMvDetail) {
    dMoveDetail();
    return;
  }

  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(20, 10, 600, 460, 'Datos de Criatura');

  // === SPRITE ESCALADO ===
  cx.save();
  cx.translate(130, 120);
  cx.scale(3, 3);
  dCre(0, 0, cre.id, cre.lv, fr);
  cx.restore();

  // === INFO DERECHA ===
  const ix = 320;

  // Nombre
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(cre.nm, ix, 50);

  // Tipo
  cx.fillStyle = tCol(cre.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(cre.tp)} ${tNam(cre.tp)}`, ix, 70);

  // Nivel
  cx.fillStyle = '#fff';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`Nivel: ${cre.lv}`, ix, 90);

  // HP
  dHP(ix, 98, 140, 7, cre.hp, cre.mHp);

  // Stats
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`ATK: ${cre.ak}`, ix, 126);
  cx.fillText(`DEF: ${cre.df}`, ix + 120, 126);
  cx.fillText(`SPD: ${cre.sp}`, ix, 144);
  cx.fillText(`HP Max: ${cre.mHp}`, ix + 120, 144);

  // EXP
  cx.fillStyle = '#aaa';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`EXP: ${cre.ex}/${cre.exTo}`, ix, 162);
  dEXP(ix + 80, 157, 120, 4, cre.ex, cre.exTo);

  // Capturas de esta especie
  const count = captureCount[cre.id] || 0;
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Capturados: ${count} vez${count !== 1 ? 'es' : ''}`, ix, 180);

  // === DESCRIPCIÓN LARGA ===
  const descLines = CRE_DESC[cre.id] || [
    CDB[cre.id]?.desc || 'Criatura misteriosa.',
  ];
  cx.fillStyle = '#C8C0A8';
  cx.font = '6px "Press Start 2P"';
  descLines.forEach((l, i) => {
    cx.fillText(l, 50, 280 + i * 14);
  });

  // === MOVIMIENTOS ===
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Movimientos:', 50, 330);

  cre.mv.forEach((m, i) => {
    const my = 350 + i * 28;
    const sel = G.dataMvSel === i;

    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.08)';
      cx.fillRect(45, my - 8, 550, 24);
    }

    cx.fillStyle = sel ? '#ffd700' : '#fff';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${m.nm}`, 50, my);

    cx.fillStyle = tCol(m.tp);
    cx.font = '6px "Press Start 2P"';
    cx.fillText(tNam(m.tp), 230, my);

    cx.fillStyle = '#aaa';
    cx.fillText(`PW:${m.pw || '-'}`, 310, my);
    cx.fillText(`PP:${m.pp}/${m.mp}`, 390, my);
    cx.fillText(`ACC:${m.acc || 100}%`, 480, my);
  });

  // Instrucciones
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE: Ver detalle de movimiento | X: Volver', 50, 455);
}

// === DETALLE DE MOVIMIENTO ===
function uMoveDetail() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.dataMvDetail = false;
  }
}

function dMoveDetail() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) {
    G.dataMvDetail = false;
    return;
  }

  // Fondo: pantalla de datos detrás
  dCreData_bg(cre);

  // Recuadro de detalle del movimiento
  const mv = cre.mv[G.dataMvSel];
  if (!mv) {
    G.dataMvDetail = false;
    return;
  }

  // Buscar desc completa en ALL_MOVES
  const fullMove = ALL_MOVES.find((m) => m.nm === mv.nm);
  const desc = fullMove?.desc || mv.desc || 'Sin descripción.';
  const acc = mv.acc || fullMove?.acc || 100;

  // Caja oscura que tapa el sprite
  cx.fillStyle = 'rgba(0,0,0,.85)';
  cx.fillRect(30, 60, 580, 300);
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 3;
  cx.strokeRect(30, 60, 580, 300);
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 1;
  cx.strokeRect(36, 66, 568, 288);

  // Esquinas doradas
  px(30, 60, 8, 8, '#ffd700');
  px(602, 60, 8, 8, '#ffd700');
  px(30, 352, 8, 8, '#ffd700');
  px(602, 352, 8, 8, '#ffd700');

  // Nombre del movimiento
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(mv.nm, 60, 95);

  // Tipo
  cx.fillStyle = tCol(mv.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(mv.tp)} ${tNam(mv.tp)}`, 60, 120);

  // Línea separadora
  cx.fillStyle = '#8b6914';
  cx.fillRect(60, 130, 500, 2);

  // Descripción (multilinea)
  const descWrap = wrapText(desc, 50);
  cx.fillStyle = '#E8E0D0';
  cx.font = '7px "Press Start 2P"';
  descWrap.forEach((l, i) => {
    cx.fillText(l, 60, 155 + i * 16);
  });

  // Stats del movimiento
  const statsY = 155 + descWrap.length * 16 + 20;

  cx.fillStyle = '#fff';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`Poder:`, 60, statsY);
  cx.fillStyle = mv.pw > 0 ? '#E8C830' : '#888';
  cx.fillText(`${mv.pw > 0 ? mv.pw : '-'}`, 160, statsY);

  cx.fillStyle = '#fff';
  cx.fillText(`PP:`, 250, statsY);
  cx.fillStyle = '#aaa';
  cx.fillText(`${mv.pp}/${mv.mp}`, 290, statsY);

  cx.fillStyle = '#fff';
  cx.fillText(`Precisión:`, 380, statsY);
  cx.fillStyle = acc >= 100 ? '#30D848' : acc >= 90 ? '#E8C020' : '#E83030';
  cx.fillText(`${acc}%`, 510, statsY);

  // Efecto
  if (mv.ef) {
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`Efecto: ${getEffectDesc(mv.ef)}`, 60, statsY + 24);
  }

  // STAB info
  if (mv.tp === cre.tp) {
    cx.fillStyle = '#30D848';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(
      '★ STAB: Mismo tipo que la criatura (+50% daño)',
      60,
      statsY + 48
    );
  }

  // Instrucción
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE/X: Cerrar', 60, 340);
}

// Función auxiliar para dibujar fondo de datos sin el overlay
function dCreData_bg(cre) {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(20, 10, 600, 460, 'Datos de Criatura');

  const ix = 320;
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(cre.nm, ix, 50);
  cx.fillStyle = tCol(cre.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(cre.tp)} ${tNam(cre.tp)}`, ix, 70);

  // Movimientos (tenues detrás)
  cx.globalAlpha = 0.2;
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Movimientos:', 50, 330);
  cre.mv.forEach((m, i) => {
    cx.fillStyle = '#aaa';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(m.nm, 70, 350 + i * 28);
  });
  cx.globalAlpha = 1;
}

// === DESCRIPCIONES DE EFECTOS ===
function getEffectDesc(ef) {
  const descs = {
    heal: 'Recupera 35% HP máximo',
    healAll: 'Cura 20% HP a todo el equipo',
    spdUp: 'Sube SPD +1',
    spdUp2: 'Sube SPD +2',
    atkUp2: 'Sube ATK +2',
    defUp2: 'Sube DEF +2',
    atkSpdUp: 'Sube ATK y SPD +1',
    atkDefUp: 'Sube ATK y DEF +1',
    atkSpdUpDefDn: 'ATK y SPD +1, DEF -1',
    protect: 'Bloquea el próximo ataque',
    shield1: 'Próximo ataque recibido -50% daño',
    sunUp: 'Sol 5 turnos: Fuego +50%, Agua -50%',
    rainUp: 'Lluvia 5 turnos: Agua +50%, Fuego -50%',
    fairyUp: 'Campo mágico 5 turnos: Hada +50%',
    healField3: 'Flores 3 turnos: cura HP cada turno',
    leech4: 'Drena 5% HP rival y te cura por 5 turnos',
    sleep2: 'Duerme al rival 2 turnos',
    clearStatus: 'Elimina estados alterados propios',
    wishHeal: 'Turno siguiente: +50% HP',
    curse: 'Sacrifica 50% HP, rival pierde 12% HP/turno',
    accDn: 'Baja precisión del rival',
    accDnBoth: 'Baja precisión de ambos',
    burn20: '20% de quemar al rival',
    paralyze20: '20% de paralizar al rival',
    confuse20: '20% de confundir al rival',
    flinch20: '20% de hacer retroceder',
    flinch15: '15% de hacer retroceder',
    spdDn30: '30% de bajar SPD rival',
    atkDn30: '30% de bajar ATK rival',
    atkDn50: '50% de bajar ATK rival',
    defDn: 'Baja DEF rival -1',
    atkDn: 'Baja ATK rival -1',
    atkDn2: 'Baja ATK rival -2',
    selfDefDn: 'Baja tu DEF -1',
    selfSpdDn: 'Baja tu SPD -1',
    drain50: 'Recupera 50% del daño como HP',
    drain25: 'Recupera 25% del daño como HP',
    highCrit: 'Alta probabilidad de golpe crítico',
    priority: 'Siempre ataca primero',
    hitTwice: 'Golpea 2 veces',
    revenge: 'Doble daño si recibiste daño este turno',
    reversal: 'Más daño cuanto menos HP tengas',
    fixedDmg: 'Siempre hace daño fijo',
    neverMiss: 'Nunca falla',
    trap2: 'Atrapa al rival 2 turnos',
    charge: 'Necesita cargar un turno',
    mirror: 'Refleja último ataque',
    copyLast: 'Copia último movimiento rival',
    batonPass: 'Pasa stats al compañero',
  };
  return descs[ef] || ef;
}


export { uProa, dProa, uCreData, dCreData, uMoveDetail, dMoveDetail, dCreData_bg, getEffectDesc };
