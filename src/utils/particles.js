// Sistema de partículas y notificaciones flotantes.
// Depende del game state G para almacenar arrays activos.
//
// T11d–f: aP genérico + helpers de VFX de batalla (stats, estados, tipos).

import { G } from '../core/game-state.js';

// === PARTICLES & NOTIFICATIONS ===
function aP(x, y, c, l = 30, extra = {}) {
  G.pts.push({
    x,
    y,
    c,
    l,
    ml: l,
    vx: extra.vx != null ? extra.vx : (Math.random() - 0.5) * 3,
    vy: extra.vy != null ? extra.vy : -Math.random() * 3 - 1,
    s: extra.s != null ? extra.s : 2 + Math.random() * 3,
    kind: extra.kind || 'pixel', // pixel | ring | text
    text: extra.text || '',
    g: extra.g != null ? extra.g : 0.1, // gravedad
  });
}

function aN(t, d = 150) {
  G.nots.push({ t, l: d, ml: d });
}

function uP() {
  G.pts = G.pts.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g != null ? p.g : 0.1;
    p.l--;
    return p.l > 0;
  });
  G.nots = G.nots.filter((n) => {
    n.l--;
    return n.l > 0;
  });
}

// ── Colores de stats / tipos ─────────────────────────────────
const STAT_COL = {
  atk: '#E85050',
  def: '#5090E8',
  spd: '#E8C840',
};
const TYPE_COL = {
  fire: '#E86030',
  water: '#4090E0',
  plant: '#40C060',
  dragon: '#8040C0',
  fairy: '#F080C0',
  normal: '#C0C0C0',
};

// Posiciones base de sprites en batalla (centro aprox.)
const ENEMY_POS = { x: 400, y: 130 };
const PLAYER_POS = { x: 130, y: 260 };

function burst(x, y, color, n = 8, opts = {}) {
  const up = opts.up;
  for (let i = 0; i < n; i++) {
    const ang = opts.radial
      ? (Math.PI * 2 * i) / n + Math.random() * 0.4
      : null;
    aP(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 12, color, opts.life || 28, {
      vx: ang != null ? Math.cos(ang) * (1.5 + Math.random() * 2) : (Math.random() - 0.5) * 3,
      vy:
        ang != null
          ? Math.sin(ang) * (1.5 + Math.random() * 2)
          : up
          ? -(1.5 + Math.random() * 2.5)
          : up === false
          ? 1.2 + Math.random() * 2
          : -Math.random() * 3 - 1,
      s: opts.s || 2 + Math.random() * 3,
      g: opts.g != null ? opts.g : up === false ? 0.05 : 0.08,
      kind: opts.kind || 'pixel',
      text: opts.text || '',
    });
  }
}

/** Stats suben (partículas hacia ARRIBA) / bajan (hacia ABAJO). */
function vfxStatChange(side, changes) {
  // changes: [['atk',1], ...]  — solo los applied !== 0
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  for (const [stat, delta] of changes) {
    if (!delta) continue;
    const col = STAT_COL[stat] || '#fff';
    const up = delta > 0;
    const n = Math.min(12, 4 + Math.abs(delta) * 3);
    burst(base.x, base.y - 10, col, n, { up, life: 34, s: 3 });
    // texto flotante +1 / -1
    aP(base.x - 6, base.y - 30, col, 40, {
      vx: (Math.random() - 0.5) * 0.4,
      vy: up ? -1.2 : 1.0,
      g: 0,
      s: 0,
      kind: 'text',
      text: `${stat.toUpperCase()}${delta > 0 ? '+' : ''}${delta}`,
    });
  }
}

function vfxBurn(side) {
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  for (let i = 0; i < 7; i++) {
    aP(base.x + (Math.random() - 0.5) * 28, base.y + 10, '#E86020', 26, {
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.5 + Math.random() * 2),
      g: -0.02,
      s: 2 + Math.random() * 3,
    });
    aP(base.x + (Math.random() - 0.5) * 20, base.y + 6, '#F0C040', 18, {
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(2 + Math.random() * 1.5),
      g: -0.03,
      s: 2,
    });
  }
}

function vfxSleep(side) {
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  for (let i = 0; i < 4; i++) {
    aP(base.x + 10 + i * 8, base.y - 20 - i * 6, '#D0D8F0', 45, {
      vx: 0.4 + Math.random() * 0.3,
      vy: -0.6 - Math.random() * 0.4,
      g: 0,
      s: 0,
      kind: 'text',
      text: 'Z',
    });
  }
}

function vfxParalyze(side) {
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  for (let i = 0; i < 10; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 16;
    aP(base.x + Math.cos(ang) * r, base.y + Math.sin(ang) * r * 0.6, '#F0E040', 20, {
      vx: Math.cos(ang) * 0.5,
      vy: Math.sin(ang) * 0.5,
      g: 0,
      s: 2 + Math.random() * 2,
    });
  }
  // chispas en cruz
  burst(base.x, base.y, '#FFF8A0', 6, { radial: true, life: 16, g: 0, s: 2 });
}

function vfxLeech(fromSide, toSide) {
  const from = fromSide === 'player' ? PLAYER_POS : ENEMY_POS;
  const to = toSide === 'player' ? PLAYER_POS : ENEMY_POS;
  // lianas / bolas verdes del afectado al beneficiado
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 10;
    const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 10;
    aP(x, y, i % 2 ? '#40C060' : '#80E090', 30 + i * 2, {
      vx: (to.x - from.x) * 0.02,
      vy: (to.y - from.y) * 0.02,
      g: 0,
      s: 3,
    });
  }
}

function vfxTypeHit(side, type, crit = false) {
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  const col = TYPE_COL[type] || TYPE_COL.normal;
  const n = crit ? 14 : 8;
  burst(base.x, base.y, col, n, { radial: true, life: crit ? 32 : 22, g: 0.05 });
  if (type === 'fire') vfxBurn(side);
  if (type === 'water') {
    for (let i = 0; i < 6; i++) {
      aP(base.x + (Math.random() - 0.5) * 30, base.y - 5, '#80C0F0', 24, {
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 2,
        g: 0.12,
        s: 3,
      });
    }
  }
  if (type === 'plant') {
    for (let i = 0; i < 5; i++) {
      aP(base.x + (Math.random() - 0.5) * 24, base.y + 8, '#40A050', 28, {
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random(),
        g: 0.06,
        s: 3,
      });
    }
  }
  if (type === 'dragon') {
    burst(base.x, base.y, '#A060E0', 10, { radial: true, life: 26, g: 0 });
  }
  if (type === 'fairy') {
    for (let i = 0; i < 8; i++) {
      aP(base.x + (Math.random() - 0.5) * 36, base.y + (Math.random() - 0.5) * 24, '#F0A0D0', 30, {
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random(),
        g: -0.02,
        s: 2,
      });
    }
  }
}

function vfxHeal(side) {
  const base = side === 'player' ? PLAYER_POS : ENEMY_POS;
  for (let i = 0; i < 10; i++) {
    aP(base.x + (Math.random() - 0.5) * 30, base.y + 15, '#60E090', 32, {
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(1.5 + Math.random() * 2),
      g: -0.02,
      s: 2 + Math.random() * 2,
    });
  }
  aP(base.x - 4, base.y - 20, '#80F0A0', 36, {
    vx: 0,
    vy: -0.8,
    g: 0,
    s: 0,
    kind: 'text',
    text: '+HP',
  });
}

/**
 * Dispara VFX a partir de los results de applyStatMods.
 * results: [{stat, applied}, ...]
 */
function vfxFromStatResults(side, results) {
  const changes = [];
  for (const r of results || []) {
    if (r && r.applied) changes.push([r.stat, r.applied]);
  }
  if (changes.length) vfxStatChange(side, changes);
}

export {
  aP,
  aN,
  uP,
  burst,
  vfxStatChange,
  vfxFromStatResults,
  vfxBurn,
  vfxSleep,
  vfxParalyze,
  vfxLeech,
  vfxTypeHit,
  vfxHeal,
  STAT_COL,
  TYPE_COL,
  ENEMY_POS,
  PLAYER_POS,
};
