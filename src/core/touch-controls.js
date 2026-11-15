// Controles táctiles para móvil.
//
// El juego se maneja con teclado (flechas, C, X). En un teléfono no hay
// teclado, así que este módulo dibuja un D-pad y dos botones (A = C,
// B = X) sobre el canvas y los traduce a los mismos eventos que dispara el
// teclado, escribiendo directo en G.keys / G.held / G.kcd.
//
// Diseño:
// - Se activa solo si el dispositivo es táctil (`pointer: coarse`) o si la
//   ventana es angosta. Se puede forzar con `?touch=1`.
// - Los botones son zonas del canvas: no se añade DOM, así el escalado
//   responsivo sigue funcionando igual.
// - La escritura en G.keys es idéntica a la del listener de keydown, así que
//   kp()/kh() funcionan sin cambios en el resto del juego.

import { G } from './game-state.js';
import { cv } from './canvas.js';

const DPAD_KEYS = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

// Geometría en coordenadas del canvas (640×480), no de pantalla.
const DPAD = { x: 18, y: 352, size: 116, btn: 38, gap: 1 };
const BTN_A = { x: 560, y: 400, r: 34, key: 'c' }; // acción = C
const BTN_B = { x: 486, y: 434, r: 28, key: 'x' };

let active = false;
let pressed = new Set();

function shouldEnable() {
  try {
    const qs = new URLSearchParams(location.search);
    if (qs.get('touch') === '1') return true;
    if (qs.get('touch') === '0') return false;
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 720;
  } catch (e) {
    return false;
  }
}

/** Canvas (640×480) ← evento de puntero. Devuelve {x,y} o null. */
function toCanvasCoords(ev) {
  const rect = cv.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = ((ev.clientX - rect.left) / rect.width) * 640;
  const y = ((ev.clientY - rect.top) / rect.height) * 480;
  return { x, y };
}

/** Devuelve la tecla que corresponde a un punto del canvas, o null. */
function keyAt(x, y) {
  // A
  if (Math.hypot(x - BTN_A.x, y - BTN_A.y) <= BTN_A.r + 10) return BTN_A.key;
  // B
  if (Math.hypot(x - BTN_B.x, y - BTN_B.y) <= BTN_B.r + 10) return BTN_B.key;
  // D-pad: 3×3 de celdas, sólo las 4 cardinales
  const s = DPAD.size / 3;
  const cxIdx = Math.floor((x - DPAD.x) / s);
  const cyIdx = Math.floor((y - DPAD.y) / s);
  if (cxIdx < 0 || cxIdx > 2 || cyIdx < 0 || cyIdx > 2) return null;
  if (cxIdx === 1 && cyIdx === 0) return DPAD_KEYS.up;
  if (cxIdx === 1 && cyIdx === 2) return DPAD_KEYS.down;
  if (cxIdx === 0 && cyIdx === 1) return DPAD_KEYS.left;
  if (cxIdx === 2 && cyIdx === 1) return DPAD_KEYS.right;
  return null;
}

function pressKey(key) {
  if (!key) return;
  if (!G.held[key]) {
    G.keys[key] = true;
    G.held[key] = true;
    G.kcd[key] = false;
  }
}

function releaseKey(key) {
  if (!key) return;
  G.keys[key] = false;
  G.held[key] = false;
  G.kcd[key] = false;
}

function handleStart(ev) {
  if (!active) return;
  const p = toCanvasCoords(ev);
  if (!p) return;
  const key = keyAt(p.x, p.y);
  if (!key) return;
  ev.preventDefault();
  pressed.add(key);
  pressKey(key);
}

function handleMove(ev) {
  if (!active || pressed.size === 0) return;
  const p = toCanvasCoords(ev);
  if (!p) return;
  const key = keyAt(p.x, p.y);
  // Deslizar el dedo entre flechas: soltar la anterior y pulsar la nueva.
  for (const k of [...pressed]) {
    if (k !== key) {
      releaseKey(k);
      pressed.delete(k);
    }
  }
  if (key && !pressed.has(key)) {
    pressed.add(key);
    pressKey(key);
  }
  if (pressed.size > 0) ev.preventDefault();
}

function handleEnd(ev) {
  if (!active || pressed.size === 0) return;
  for (const k of pressed) releaseKey(k);
  pressed.clear();
  ev.preventDefault();
}

function initTouchControls() {
  active = shouldEnable();
  if (!active) return false;
  cv.addEventListener('pointerdown', handleStart, { passive: false });
  cv.addEventListener('pointermove', handleMove, { passive: false });
  cv.addEventListener('pointerup', handleEnd, { passive: false });
  cv.addEventListener('pointercancel', handleEnd, { passive: false });
  cv.addEventListener('pointerleave', handleEnd, { passive: false });
  // Evita el zoom por doble toque y el menú contextual de mantener pulsado.
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.style.touchAction = 'none';
  return true;
}

function isTouchActive() {
  return active;
}

/** Se llama al final de draw(): dibuja los controles si están activos. */
function drawTouchControls(cx) {
  if (!active) return;
  cx.save();
  cx.globalAlpha = 0.32;

  // D-pad
  const s = DPAD.size / 3;
  const cells = [
    [DPAD.x + s, DPAD.y, 'up'],
    [DPAD.x, DPAD.y + s, 'left'],
    [DPAD.x + 2 * s, DPAD.y + s, 'right'],
    [DPAD.x + s, DPAD.y + 2 * s, 'down'],
  ];
  for (const [bx, by, dir] of cells) {
    const isDown = pressed.has(DPAD_KEYS[dir]);
    cx.fillStyle = isDown ? 'rgba(255,215,0,0.55)' : 'rgba(255,255,255,0.30)';
    cx.strokeStyle = 'rgba(255,255,255,0.55)';
    cx.lineWidth = 2;
    const pad = 2;
    cx.beginPath();
    cx.roundRect
      ? cx.roundRect(bx + pad, by + pad, s - pad * 2, s - pad * 2, 6)
      : cx.rect(bx + pad, by + pad, s - pad * 2, s - pad * 2);
    cx.fill();
    cx.stroke();
    // Flecha
    cx.fillStyle = 'rgba(0,0,0,0.55)';
    const m = 10;
    const cx0 = bx + s / 2;
    const cy0 = by + s / 2;
    cx.beginPath();
    if (dir === 'up') {
      cx.moveTo(cx0, cy0 - m);
      cx.lineTo(cx0 + m, cy0 + m / 2);
      cx.lineTo(cx0 - m, cy0 + m / 2);
    } else if (dir === 'down') {
      cx.moveTo(cx0, cy0 + m);
      cx.lineTo(cx0 + m, cy0 - m / 2);
      cx.lineTo(cx0 - m, cy0 - m / 2);
    } else if (dir === 'left') {
      cx.moveTo(cx0 - m, cy0);
      cx.lineTo(cx0 + m / 2, cy0 - m);
      cx.lineTo(cx0 + m / 2, cy0 + m);
    } else {
      cx.moveTo(cx0 + m, cy0);
      cx.lineTo(cx0 - m / 2, cy0 - m);
      cx.lineTo(cx0 - m / 2, cy0 + m);
    }
    cx.closePath();
    cx.fill();
  }

  // Botón A
  cx.globalAlpha = pressed.has(BTN_A.key) ? 0.6 : 0.32;
  cx.fillStyle = 'rgba(48,216,72,0.85)';
  cx.beginPath();
  cx.arc(BTN_A.x, BTN_A.y, BTN_A.r, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,0.6)';
  cx.lineWidth = 2;
  cx.stroke();
  cx.fillStyle = 'rgba(0,0,0,0.7)';
  cx.font = '16px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText('A', BTN_A.x, BTN_A.y + 1);

  // Botón B
  cx.globalAlpha = pressed.has(BTN_B.key) ? 0.6 : 0.32;
  cx.fillStyle = 'rgba(232,56,56,0.85)';
  cx.beginPath();
  cx.arc(BTN_B.x, BTN_B.y, BTN_B.r, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,0.6)';
  cx.stroke();
  cx.fillStyle = 'rgba(0,0,0,0.7)';
  cx.font = '14px "Press Start 2P"';
  cx.fillText('B', BTN_B.x, BTN_B.y + 1);

  cx.textAlign = 'left';
  cx.textBaseline = 'alphabetic';
  cx.restore();
}

export { initTouchControls, drawTouchControls, isTouchActive };
