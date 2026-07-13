// Sistema de input del juego (teclado).
//
// Los listeners de keydown/keyup pueblan G.keys, G.held y G.kcd
// (declarados en game-state.js).
//
// Se exponen dos helpers:
//   kp(k): tecla apenas presionada (1 sola vez) - se resetea al soltarla
//   kh(k): tecla mantenida (repite mientras esté pulsada)

import { G } from './game-state.js';
import { sfx } from './audio.js';

function normKey(k) {
  return typeof k === 'string' && k.length === 1 ? k.toLowerCase() : k;
}

document.addEventListener('keydown', (e) => {
  sfx.init();

  const key = normKey(e.key);

  G.keys[key] = true;

  if (!G.held[key]) {
    G.held[key] = true;
    G.kcd[key] = false;
  }

  if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      ' ',
      'Enter',
      'Escape',
      'z',
      'x',
      'y',
      'p',
    ].includes(key)
  ) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const key = normKey(e.key);

  G.keys[key] = false;
  G.held[key] = false;
  G.kcd[key] = false;
});

function kp(k) {
  k = normKey(k);
  if (G.keys[k] && !G.kcd[k]) {
    G.kcd[k] = true;
    return true;
  }
  return false;
}

function kh(k) {
  k = normKey(k);
  return !!G.keys[k];
}

export { kp, kh, normKey };
