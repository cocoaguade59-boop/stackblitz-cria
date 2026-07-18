// Correo del Reino — trueque de Gonchi (T10).
// Solo DIBUJA. Input en script.js (uGonchiTrade).

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import {
  CRYSTAL_INFO,
  FRAGRANCE_LABELS,
  FRAGRANCE_TYPES,
  FRAGMENT_LABELS,
} from '../data/pins.js';

/** Lista de objetos tradeables que el jugador tiene (≥1). */
function buildTradeInventory() {
  const rows = [];
  const add = (id, label, count, color) => {
    if ((count || 0) > 0) rows.push({ id, label, count, color: color || '#ccc' });
  };

  add('pot', '🧪 Poción', G.pot, '#E070A0');
  add('rev', '❤ Revivir', G.rev, '#E04040');
  add('crv', CRYSTAL_INFO.p.label, G.crv, CRYSTAL_INFO.p.color);
  add('crvC', CRYSTAL_INFO.c.label, G.crvC, CRYSTAL_INFO.c.color);
  add('crvO', CRYSTAL_INFO.o.label, G.crvO, CRYSTAL_INFO.o.color);

  const fr = G.frag || {};
  for (const code of ['p', 'c', 'o']) {
    add(`frag_${code}`, FRAGMENT_LABELS[code], fr[code], CRYSTAL_INFO[code].color);
  }

  add('scroll', 'Pergamino de Batalla', G.scrolls, '#E8C840');

  const fg = G.fragrances || {};
  for (const t of FRAGRANCE_TYPES) {
    add(`fragra_${t}`, FRAGRANCE_LABELS[t], fg[t], '#D0A070');
  }
  const inc = G.incense || {};
  for (const t of FRAGRANCE_TYPES) {
    add(`inci_${t}`, `Incienso ${t}`, inc[t], '#C07040');
  }

  return rows;
}

/** Pool de premios posibles (upgrade o downgrade). */
function tradeRewardPool() {
  return [
    { id: 'pot', label: '🧪 Poción', w: 14 },
    { id: 'rev', label: '❤ Revivir', w: 10 },
    { id: 'crv', label: CRYSTAL_INFO.p.label, w: 12 },
    { id: 'crvC', label: CRYSTAL_INFO.c.label, w: 6 },
    { id: 'crvO', label: CRYSTAL_INFO.o.label, w: 3 },
    { id: 'frag_p', label: FRAGMENT_LABELS.p, w: 14 },
    { id: 'frag_c', label: FRAGMENT_LABELS.c, w: 8 },
    { id: 'frag_o', label: FRAGMENT_LABELS.o, w: 3 },
    { id: 'scroll', label: 'Pergamino de Batalla', w: 10 },
    ...FRAGRANCE_TYPES.map((t) => ({
      id: `fragra_${t}`,
      label: FRAGRANCE_LABELS[t],
      w: 4,
    })),
    ...FRAGRANCE_TYPES.map((t) => ({
      id: `inci_${t}`,
      label: `Incienso ${t}`,
      w: 3,
    })),
    { id: 'gold_30', label: '30 monedas', w: 8 },
    { id: 'gold_80', label: '80 monedas', w: 4 },
  ];
}

function rollTradeReward() {
  const pool = tradeRewardPool();
  const total = pool.reduce((s, p) => s + p.w, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p;
  }
  return pool[0];
}

function applyTradeItem(id, delta) {
  // delta +1 o -1 (o más). Devuelve false si no se pudo gastar.
  if (id === 'pot') {
    if (delta < 0 && (G.pot || 0) < -delta) return false;
    G.pot = (G.pot || 0) + delta;
    return true;
  }
  if (id === 'rev') {
    if (delta < 0 && (G.rev || 0) < -delta) return false;
    G.rev = (G.rev || 0) + delta;
    return true;
  }
  if (id === 'crv' || id === 'crvC' || id === 'crvO') {
    if (delta < 0 && (G[id] || 0) < -delta) return false;
    G[id] = (G[id] || 0) + delta;
    return true;
  }
  if (id === 'scroll') {
    if (delta < 0 && (G.scrolls || 0) < -delta) return false;
    G.scrolls = (G.scrolls || 0) + delta;
    return true;
  }
  if (id.startsWith('frag_')) {
    const code = id.slice(5);
    if (!G.frag) G.frag = { p: 0, c: 0, o: 0 };
    if (delta < 0 && (G.frag[code] || 0) < -delta) return false;
    G.frag[code] = (G.frag[code] || 0) + delta;
    return true;
  }
  if (id.startsWith('fragra_')) {
    const t = id.slice(7);
    if (!G.fragrances) G.fragrances = {};
    if (delta < 0 && (G.fragrances[t] || 0) < -delta) return false;
    G.fragrances[t] = (G.fragrances[t] || 0) + delta;
    return true;
  }
  if (id.startsWith('inci_')) {
    const t = id.slice(5);
    if (!G.incense) G.incense = {};
    if (delta < 0 && (G.incense[t] || 0) < -delta) return false;
    G.incense[t] = (G.incense[t] || 0) + delta;
    return true;
  }
  if (id === 'gold_30') {
    G.gold = (G.gold || 0) + 30 * Math.sign(delta || 1);
    // solo como premio (+), no se ofrece como pago
    return true;
  }
  if (id === 'gold_80') {
    G.gold = (G.gold || 0) + 80 * Math.sign(delta || 1);
    return true;
  }
  return false;
}

function countOwned(id) {
  if (id === 'pot') return G.pot || 0;
  if (id === 'rev') return G.rev || 0;
  if (id === 'crv' || id === 'crvC' || id === 'crvO') return G[id] || 0;
  if (id === 'scroll') return G.scrolls || 0;
  if (id.startsWith('frag_')) return (G.frag && G.frag[id.slice(5)]) || 0;
  if (id.startsWith('fragra_')) return (G.fragrances && G.fragrances[id.slice(7)]) || 0;
  if (id.startsWith('inci_')) return (G.incense && G.incense[id.slice(5)]) || 0;
  return 0;
}

function dGonchiTrade() {
  const t = G.trade;
  if (!t) return;

  cx.fillStyle = 'rgba(8,6,20,0.82)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(36, 20, 568, 440, 'CORREO DEL REINO · GONCHI');

  if (t.phase === 'result') {
    cx.fillStyle = '#C8A830';
    cx.font = '9px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('¡Trueque hecho!', 320, 120);
    cx.fillStyle = '#fff';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Entregaste:', 320, 170);
    cx.fillStyle = '#aaa';
    cx.font = '7px "Press Start 2P"';
    (t.paidLabels || []).forEach((lb, i) => cx.fillText(`· ${lb}`, 320, 200 + i * 22));
    cx.fillStyle = '#7AC070';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Recibiste:', 320, 270);
    cx.fillStyle = '#ffd700';
    cx.font = '10px "Press Start 2P"';
    cx.fillText(t.rewardLabel || '¿?', 320, 310);
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Puede ser mejora… o no. ¡Así es el correo!', 320, 350);
    cx.fillStyle = '#C8A830';
    cx.fillText('SPACE — continuar', 320, 400);
    cx.textAlign = 'left';
    return;
  }

  // phase: pick
  cx.fillStyle = '#C8A830';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('Entregá 2 objetos → recibís 1 al azar (upgrade o downgrade).', 52, 56);
  cx.fillStyle = '#888';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('SPACE marca/desmarca  ·  ENTER confirma con 2  ·  X cancela', 52, 74);

  const rows = buildTradeInventory();
  const sel = t.sel || 0;
  const scroll = t.scroll || 0;
  const VIS = 9;
  const picked = t.picked || []; // [{id, label}]

  // picked summary
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(
    `Elegidos: ${picked.length}/2` +
      (picked.length
        ? '  →  ' + picked.map((p) => p.label).join(' + ')
        : ''),
    52,
    96
  );

  if (!rows.length) {
    cx.fillStyle = '#666';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('No tenés objetos para truequear.', 52, 140);
    cx.fillText('X para salir.', 52, 170);
    return;
  }

  const view = rows.slice(scroll, scroll + VIS);
  view.forEach((row, i) => {
    const idx = scroll + i;
    const y = 120 + i * 30;
    const active = sel === idx;
    const marked = picked.filter((p) => p.id === row.id).length;
    // cuántos de este id ya marcados
    if (active) {
      cx.fillStyle = 'rgba(255,215,0,0.12)';
      cx.fillRect(48, y - 12, 544, 28);
      cx.fillStyle = '#ffd700';
      cx.fillRect(48, y - 12, 3, 28);
    }
    cx.fillStyle = row.color;
    cx.fillRect(58, y - 6, 10, 10);
    cx.fillStyle = active ? '#ffd700' : marked ? '#7AC070' : '#fff';
    cx.font = '7px "Press Start 2P"';
    const mark = marked ? `[${marked}] ` : active ? '▶ ' : '  ';
    cx.fillText(`${mark}${row.label}`, 76, y);
    cx.fillStyle = '#aaa';
    cx.textAlign = 'right';
    cx.fillText(`×${row.count}`, 580, y);
    cx.textAlign = 'left';
  });

  if (scroll > 0) {
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('▲', 590, 115);
  }
  if (scroll + VIS < rows.length) {
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('▼', 590, 120 + VIS * 30 - 10);
  }

  cx.fillStyle = picked.length >= 2 ? '#7AC070' : '#555';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(
    picked.length >= 2 ? 'ENTER: enviar por correo' : 'Elegí 2 objetos',
    52,
    430
  );
}

export {
  dGonchiTrade,
  buildTradeInventory,
  rollTradeReward,
  applyTradeItem,
  countOwned,
  tradeRewardPool,
};
