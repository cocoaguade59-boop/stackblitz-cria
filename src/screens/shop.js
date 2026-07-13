// Pantalla de tienda (David-O).
// Compra de pociones, revivir y cristales con descuento por amistad.
// También permite combatir contra David-O para subir amistad.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { kp } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { fr } from '../core/frame.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { aN } from '../utils/particles.js';

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

// Callback para iniciar batalla contra David-O (inyectado desde script.js)
let _startBattle = null;
function setShopBattleStarter(fn) { _startBattle = fn; }

function uShop() {
  const s = G.ss;
  if (s.page === 'main') {
    if (kp('ArrowUp')) {
      s.s = (s.s + 2) % 3;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      s.s = (s.s + 1) % 3;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      if (s.s === 0) s.page = 'buy';
      else if (s.s === 1) {
        if (_startBattle) _startBattle({
          nm: 'David-O',
          tp: 'davido',
          shop: true,
          isMerch: true,
          battleIntro: ['¡Combatamos, amigo!'],
          fixedTeam: [{ id: 'pinzardo' }, { id: 'thornbuck' }],
        });
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
  } else {
    const disc =
      G.mFriend < 3
        ? 0
        : G.mFriend < 6
        ? 10
        : G.mFriend < 10
        ? 20
        : G.mFriend < 15
        ? 30
        : 40;
    const items = [
      { nm: 'Poción', base: 30, key: 'pot', icon: '🧪' },
      { nm: 'Revivir', base: 80, key: 'rev', icon: '❤️' },
      { nm: 'Cristal V.', base: 50, key: 'crv', icon: '💎' },
    ];
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
        G[it.key]++;
        sfx.sel();
        aN(`Compraste ${it.nm}!`);
      } else aN('¡Sin oro!');
    }
    if (kp('x') || kp('Escape')) {
      s.page = 'main';
      s.s = 0;
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
  dBoxMenu(120, 15, 400, 450, 'Tienda David-O');
  const s = G.ss;
  const stars =
    G.mFriend < 3
      ? 1
      : G.mFriend < 6
      ? 2
      : G.mFriend < 10
      ? 3
      : G.mFriend < 15
      ? 4
      : 5;
  const disc =
    stars === 1
      ? 0
      : stars === 2
      ? 10
      : stars === 3
      ? 20
      : stars === 4
      ? 30
      : 40;

  // Amistad
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Amistad: ' + '⭐'.repeat(stars), 140, 50);
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Descuento: ${disc}%`, 140, 66);
  cx.fillStyle = '#aaa';
  cx.fillText(`💰 ${G.gold} oro`, 320, 66);

  // Lore aleatorio
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(shopLore[fr % shopLore.length], 140, 82);

  if (s.page === 'main') {
    ['🛒 Comprar', '⚔️ Combatir', '🚪 Salir'].forEach((o, i) => {
      cx.fillStyle = s.s === i ? '#ffd700' : '#fff';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`${s.s === i ? '▶ ' : '  '}${o}`, 150, 120 + i * 40);
    });
    // Descripción de opción seleccionada
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    const descs = [
      'Compra pociones, revivir y cristales',
      'Combate para subir amistad',
      'Volver al mundo',
    ];
    cx.fillText(descs[s.s], 150, 250);
  } else {
    const disc2 =
      G.mFriend < 3
        ? 0
        : G.mFriend < 6
        ? 10
        : G.mFriend < 10
        ? 20
        : G.mFriend < 15
        ? 30
        : 40;
    const items = [
      { nm: '🧪 Poción', base: 30, desc: 'Cura 20% HP' },
      { nm: '❤️ Revivir', base: 80, desc: 'Revive con 50% HP' },
      { nm: '💎 Cristal V.', base: 50, desc: 'Para capturar criaturas' },
    ];
    items.forEach((it, i) => {
      const price = Math.floor(it.base * (1 - disc2 / 100));
      cx.fillStyle = s.s === i ? '#ffd700' : '#fff';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${s.s === i ? '▶ ' : '  '}${it.nm}`, 150, 110 + i * 40);
      cx.fillStyle = '#aaa';
      cx.fillText(`${price}G`, 400, 110 + i * 40);
      // Descripción
      if (s.s === i) {
        cx.fillStyle = '#888';
        cx.font = '6px "Press Start 2P"';
        cx.fillText(it.desc, 170, 110 + i * 40 + 14);
      }
    });
    // Inventario actual
    cx.fillStyle = '#fff';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`Inventario:`, 150, 260);
    cx.fillStyle = '#aaa';
    cx.fillText(`🧪${G.pot}  ❤${G.rev}  💎${G.crv}  💰${G.gold}`, 150, 278);
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('X: Volver', 150, 300);
  }
}

export { uShop, dShop, shopExitDialog, shopLore, setShopBattleStarter };
