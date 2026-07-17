// Pantalla de tienda (David-O).
// Compra de pociones, revivir, cristales e inciensos (T6).
// También permite combatir contra David-O para subir amistad.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { aN } from '../utils/particles.js';
import {
  SHOP_CRYSTALS,
  FRAGRANCE_TYPES,
  FRAGRANCE_LABELS,
  emptyFragrances,
} from '../data/pins.js';

const shopLore = [
  'Flameye nació de una hoguera olvidada.',
  'Ajolotín sonríe incluso bajo el agua.',
  'Hedroca se comió un mapa y encontró tesoro.',
  'Wyvernitos ronronean como gatos.',
  'Duendecillo roba calcetines.',
  'Brillina brilla tanto que necesitas gafas.',
  'Serpentón tiene mal genio por su cola.',
  'Serafox solo aparece ante los dignos.',
  'Ascuala teje bufandas para el invierno.',
  'Burbujolote hace reír hasta a las piedras.',
];

const INCENSE_COST = 10; // fragancia + 10G → 1 incienso

// Callback para iniciar batalla contra David-O (inyectado desde script.js)
let _startBattle = null;
function setShopBattleStarter(fn) {
  _startBattle = fn;
}

function shopDisc() {
  if (G.mFriend < 3) return 0;
  if (G.mFriend < 6) return 10;
  if (G.mFriend < 10) return 20;
  if (G.mFriend < 15) return 30;
  return 40;
}

function shopStars() {
  if (G.mFriend < 3) return 1;
  if (G.mFriend < 6) return 2;
  if (G.mFriend < 10) return 3;
  if (G.mFriend < 15) return 4;
  return 5;
}

function buyItems() {
  return [
    { nm: '🧪 Poción', base: 30, key: 'pot', desc: 'Cura 20% HP' },
    { nm: '❤️ Revivir', base: 80, key: 'rev', desc: 'Revive con 50% HP' },
    ...SHOP_CRYSTALS.map((c) => ({
      nm: c.nm,
      base: c.base,
      key: c.key,
      desc: c.desc,
    })),
  ];
}

function incenseRows() {
  if (!G.fragrances) G.fragrances = emptyFragrances();
  if (!G.incense) G.incense = emptyFragrances();
  return FRAGRANCE_TYPES.map((type) => ({
    type,
    nm: FRAGRANCE_LABELS[type] || type,
    frag: G.fragrances[type] || 0,
    inc: G.incense[type] || 0,
    cost: INCENSE_COST,
    desc: 'Fragancia + 10G → incienso (200 pasos · 75% tipo)',
  }));
}

function uShop() {
  const s = G.ss;
  if (!s) return;

  if (s.page === 'main') {
    const n = 4; // Comprar, Inciensos, Combatir, Salir
    if (kp('ArrowUp')) {
      s.s = (s.s + n - 1) % n;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      s.s = (s.s + 1) % n;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      if (s.s === 0) {
        s.page = 'buy';
        s.s = 0;
      } else if (s.s === 1) {
        s.page = 'incense';
        s.s = 0;
      } else if (s.s === 2) {
        if (_startBattle) {
          _startBattle({
            nm: 'David-O',
            tp: 'davido',
            shop: true,
            isMerch: true,
            battleIntro: ['¡Combatamos, amigo!'],
            fixedTeam: [{ id: 'pinzardo' }, { id: 'thornbuck' }],
          });
        }
        return;
      } else {
        shopExitDialog();
        return;
      }
    }
    if (kp('x') || kp('Escape')) {
      shopExitDialog();
      return;
    }
  } else if (s.page === 'buy') {
    const disc = shopDisc();
    const items = buyItems();
    if (kp('ArrowUp')) {
      s.s = (s.s + items.length - 1) % items.length;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      s.s = (s.s + 1) % items.length;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      const it = items[s.s];
      const price = Math.floor(it.base * (1 - disc / 100));
      if (G.gold >= price) {
        G.gold -= price;
        G[it.key] = (G[it.key] || 0) + 1;
        sfx.sel();
        aN(`Compraste ${it.nm}!`);
      } else {
        aN('¡Sin oro!');
        sfx.nef();
      }
    }
    if (kp('x') || kp('Escape')) {
      s.page = 'main';
      s.s = 0;
    }
  } else if (s.page === 'incense') {
    // Convertir fragancia + 10G → incienso (sin descuento de amistad)
    const rows = incenseRows();
    if (kp('ArrowUp')) {
      s.s = (s.s + rows.length - 1) % rows.length;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      s.s = (s.s + 1) % rows.length;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      const row = rows[s.s];
      if (!row) return;
      if (row.frag <= 0) {
        aN('No tenés esa fragancia.');
        sfx.nef();
      } else if (G.gold < row.cost) {
        aN('¡Sin oro! (hace falta 10G)');
        sfx.nef();
      } else {
        G.gold -= row.cost;
        G.fragrances[row.type] = (G.fragrances[row.type] || 0) - 1;
        if (!G.incense) G.incense = emptyFragrances();
        G.incense[row.type] = (G.incense[row.type] || 0) + 1;
        sfx.sel();
        aN(`¡Incienso ${row.type} listo!`);
      }
    }
    if (kp('x') || kp('Escape')) {
      s.page = 'main';
      s.s = 1; // volver con Inciensos seleccionado
    }
  }
}

function shopExitDialog() {
  const line = shopLore[Math.floor(Math.random() * shopLore.length)];
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: 'David-O' },
    dlgArr: ['¡Vuelve pronto!', line],
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
  };
  sfx.sel();
}

function dShop() {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(100, 15, 440, 450, 'Tienda David-O');
  const s = G.ss || { s: 0, page: 'main' };
  const stars = shopStars();
  const disc = shopDisc();

  // Amistad
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Amistad: ' + '⭐'.repeat(stars), 120, 50);
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Descuento: ${disc}%`, 120, 66);
  cx.fillStyle = '#aaa';
  cx.fillText(`💰 ${G.gold} oro`, 300, 66);

  // Lore
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(shopLore[fr % shopLore.length], 120, 82);

  if (s.page === 'main') {
    const opts = ['🛒 Comprar', '🔥 Inciensos', '⚔️ Combatir', '🚪 Salir'];
    opts.forEach((o, i) => {
      cx.fillStyle = s.s === i ? '#ffd700' : '#fff';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`${s.s === i ? '▶ ' : '  '}${o}`, 130, 120 + i * 36);
    });
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    const descs = [
      'Pociones, revivir y cristales (3 rarezas)',
      'Fragancia + 10G → incienso (200 pasos · 75%)',
      'Combate para subir amistad',
      'Volver al mundo',
    ];
    cx.fillText(descs[s.s] || '', 130, 290);

    // stock de fragancias / inciensos
    const fg = G.fragrances || {};
    const inc = G.incense || {};
    cx.fillStyle = '#666';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(
      `Frag: ${FRAGRANCE_TYPES.map((t) => `${t[0].toUpperCase()}${fg[t] || 0}`).join(' ')}`,
      130,
      330
    );
    cx.fillText(
      `Inci: ${FRAGRANCE_TYPES.map((t) => `${t[0].toUpperCase()}${inc[t] || 0}`).join(' ')}`,
      130,
      348
    );
    if (G.activeIncense) {
      cx.fillStyle = '#C8A830';
      cx.fillText(
        `Activo: ${G.activeIncense.type} (${G.activeIncense.stepsLeft || 0} pasos)`,
        130,
        370
      );
    }
  } else if (s.page === 'buy') {
    const disc2 = shopDisc();
    const items = buyItems();
    items.forEach((it, i) => {
      const price = Math.floor(it.base * (1 - disc2 / 100));
      const y = 105 + i * 36;
      cx.fillStyle = s.s === i ? '#ffd700' : '#fff';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`${s.s === i ? '▶ ' : '  '}${it.nm}`, 120, y);
      cx.fillStyle = '#aaa';
      cx.fillText(`${price}G`, 430, y);
      if (s.s === i) {
        cx.fillStyle = '#888';
        cx.font = '5px "Press Start 2P"';
        cx.fillText(it.desc, 140, y + 12);
      }
    });
    cx.fillStyle = '#fff';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Inventario:', 120, 320);
    cx.fillStyle = '#aaa';
    cx.fillText(
      `🧪${G.pot} ❤${G.rev} 💎${G.crv || 0} 💠${G.crvC || 0} 🔶${G.crvO || 0}`,
      120,
      338
    );
    cx.fillText(`💰${G.gold}  📜${G.scrolls || 0}`, 120, 354);
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('X: Volver', 120, 380);
  } else if (s.page === 'incense') {
    cx.fillStyle = '#C8A830';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('Convertir fragancia en incienso', 120, 105);
    cx.fillStyle = '#888';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('Costo fijo: 1 fragancia + 10G  ·  200 pasos · 75% del tipo', 120, 122);

    const rows = incenseRows();
    rows.forEach((row, i) => {
      const y = 145 + i * 42;
      const can = row.frag > 0 && G.gold >= row.cost;
      const active = s.s === i;

      if (active) {
        cx.fillStyle = 'rgba(255,215,0,0.10)';
        cx.fillRect(115, y - 14, 410, 36);
      }

      cx.fillStyle = active ? '#ffd700' : can ? '#fff' : '#555';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${active ? '▶ ' : '  '}${row.nm}`, 120, y);

      cx.fillStyle = active ? '#E8E0C0' : '#888';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`Frag ×${row.frag}  →  Inci ×${row.inc}`, 140, y + 14);

      cx.fillStyle = can ? '#30D848' : '#666';
      cx.font = '7px "Press Start 2P"';
      cx.textAlign = 'right';
      cx.fillText(`${row.cost}G`, 510, y);
      cx.textAlign = 'left';
    });

    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('SPACE: fabricar   X: volver', 120, 380);
    cx.fillStyle = '#666';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('Activá el incienso desde Menú → Objetos.', 120, 400);
    if (G.activeIncense) {
      cx.fillStyle = '#C8A830';
      cx.fillText(
        `Ya hay uno activo (${G.activeIncense.type}). Solo 1 a la vez.`,
        120,
        420
      );
    }
  }
}

export { uShop, dShop, shopExitDialog, shopLore, setShopBattleStarter, INCENSE_COST };
