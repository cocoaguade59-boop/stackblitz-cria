// Pantalla de transferencia de partida: exportar (copiar código) e importar (pegar código).
//
// Motivo: el save vive solo en localStorage de un navegador. Sin esto, cambiar
// de equipo, limpiar el navegador o pasarle la partida a un amigo es imposible.
//
// El código es texto: `CR1-<base64url>`. Se copia con Ctrl+C y se pega con Ctrl+V.
//
// Solo DIBUJA + engancha eventos de teclado los días de import. La lógica de
// estado (G.transfer) la maneja este mismo módulo para no engordar game.js.

import { G } from '../core/game-state.js';
import { cx } from '../core/canvas.js';
import { sfx } from '../core/audio.js';
import { kp, kAction } from '../core/input.js';
import { dBoxMenu } from '../render/ui-boxes.js';
import { exportSaveCode, inspectSaveCode, importSaveCode } from '../core/save-transfer.js';

const OPTIONS = ['Exportar partida', 'Importar partida', 'Volver'];

// ── estado ───────────────────────────────────────────────────
function ensureState() {
  if (!G.transfer) {
    G.transfer = {
      sel: 0,
      mode: 'menu', // menu | export | import
      code: '',
      paste: '',
      message: '',
      messageColor: '#aaa',
    };
  }
  return G.transfer;
}

function setMessage(text, color = '#aaa') {
  const st = ensureState();
  st.message = text;
  st.messageColor = color;
}

async function copyToClipboard(text) {
  // navigator.clipboard requiere contexto seguro (https/localhost).
  // Si falla, el usuario todavía puede seleccionar el texto de la pantalla.
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

function startExport() {
  const st = ensureState();
  const code = exportSaveCode();
  if (!code) {
    setMessage('No hay partida guardada todavía.', '#E83030');
    return;
  }
  st.mode = 'export';
  st.code = code;
  const len = code.length;
  setMessage(`Código listo (${len} caracteres).`, '#30D848');
  copyToClipboard(code).then((ok) => {
    if (ok) setMessage(`Copiado al portapapeles (${len} caracteres).`, '#30D848');
    else setMessage('No se pudo copiar: seleccioná el texto a mano.', '#E8C020');
  });
}

function finishImport(rawCode) {
  const st = ensureState();
  const res = importSaveCode(rawCode);
  if (!res.ok) {
    setMessage(res.error, '#E83030');
    sfx.nef();
    return;
  }
  st.mode = 'menu';
  setMessage('¡Partida importada! Reiniciá la página para jugarla.', '#30D848');
  sfx.cap();
}

// ── update ───────────────────────────────────────────────────
function uSaveTransfer() {
  const st = ensureState();

  if (st.mode === 'export') {
    if (kpEnter() || kp('x') || kp('Escape')) {
      st.mode = 'menu';
      sfx.sel();
    }
    return;
  }

  if (st.mode === 'import') {
    // El pegado real lo maneja el listener de 'paste' (abajo).
    if (kp('Escape') || kp('x')) {
      st.mode = 'menu';
      st.paste = '';
      setMessage('');
      sfx.sel();
      return;
    }
    if (kpEnter()) {
      if (!st.paste.trim()) {
        setMessage('Pegá primero un código (Ctrl+V).', '#E8C020');
        return;
      }
      finishImport(st.paste);
    }
    return;
  }

  // Menú
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    st.sel = (st.sel + OPTIONS.length - 1) % OPTIONS.length;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    st.sel = (st.sel + 1) % OPTIONS.length;
    sfx.sel();
  }
  if (kpEnter()) {
    sfx.sel();
    const opt = OPTIONS[st.sel];
    if (opt === 'Exportar partida') startExport();
    else if (opt === 'Importar partida') {
      st.mode = 'import';
      st.paste = '';
      setMessage('Pegá el código y pulsá C.', '#E8C020');
    } else {
      G.scr = 'menu';
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'menu';
}

function kpEnter() {
  // OJO: no usar `||` con dos kp(): el primero consumiría el frame y el
  // segundo devolvería false siempre. kAction() ya evalúa en secuencia.
  return kAction();
}

// ── draw ─────────────────────────────────────────────────────
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function dSaveTransfer() {
  const st = ensureState();

  cx.fillStyle = 'rgba(0,0,0,.82)';
  cx.fillRect(0, 0, 640, 480);

  if (st.mode === 'export') {
    dBoxMenu(30, 60, 580, 360, 'EXPORTAR PARTIDA');
    cx.fillStyle = '#ddd';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('Guardá este texto: es tu partida completa.', 60, 108);
    cx.fillStyle = '#8A7A50';
    cx.fillText('Pegalo en un mensaje o en la pantalla de importar.', 60, 126);

    // Caja con el código (4 líneas de 68 caracteres)
    cx.fillStyle = '#0a1a0a';
    cx.fillRect(50, 145, 540, 130);
    cx.strokeStyle = '#30D848';
    cx.lineWidth = 2;
    cx.strokeRect(50, 145, 540, 130);
    cx.fillStyle = '#7CE87C';
    cx.font = '6px "Press Start 2P"';
    const chunks = st.code.match(/.{1,64}/g) || [];
    chunks.slice(0, 14).forEach((chunk, i) => {
      cx.fillText(chunk, 58, 163 + i * 9);
    });
    if (chunks.length > 14) {
      cx.fillStyle = '#C8A830';
      cx.fillText('... (código largo, usá Ctrl+C)', 58, 285);
    }

    cx.fillStyle = '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('Ctrl+C para copiar · C / X para volver', 60, 300);

    cx.fillStyle = st.messageColor;
    cx.font = '7px "Press Start 2P"';
    wrap(st.message, 72).slice(0, 3).forEach((ln, i) => cx.fillText(ln, 60, 330 + i * 14));
    return;
  }

  if (st.mode === 'import') {
    dBoxMenu(30, 50, 580, 380, 'IMPORTAR PARTIDA');
    cx.fillStyle = '#ddd';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('Pegá un código CR1- y pulsá C.', 60, 96);
    cx.fillStyle = '#E8A020';
    cx.fillText('OJO: reemplaza la partida guardada actual.', 60, 116);

    cx.fillStyle = '#0a0a1e';
    cx.fillRect(50, 135, 540, 150);
    cx.strokeStyle = st.paste ? '#30D848' : '#5A4A30';
    cx.lineWidth = 2;
    cx.strokeRect(50, 135, 540, 150);

    cx.fillStyle = st.paste ? '#7CE87C' : '#5A5A6A';
    cx.font = '6px "Press Start 2P"';
    if (st.paste) {
      (st.paste.match(/.{1,64}/g) || []).slice(0, 16).forEach((chunk, i) => {
        cx.fillText(chunk, 58, 153 + i * 9);
      });
    } else {
      cx.fillText('(vacío · Ctrl+V para pegar)', 58, 160);
    }

    // Validación anticipada: mostramos qué partida es, sin aplicarla.
    if (st.paste.trim()) {
      const check = inspectSaveCode(st.paste);
      if (check.ok) {
        const s = check.save;
        const party = Array.isArray(s.party) ? s.party.length : 0;
        const lv = Array.isArray(s.party) && s.party[0] ? s.party[0].lv : '?';
        cx.fillStyle = '#30D848';
        cx.font = '7px "Press Start 2P"';
        cx.fillText(`Vista previa: ${party} criatura(s), 1ª a Lv${lv}, ${s.gold || 0}G`, 60, 305);
      }
    }

    cx.fillStyle = '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('C confirma · X cancela', 60, 330);

    cx.fillStyle = st.messageColor;
    cx.font = '7px "Press Start 2P"';
    wrap(st.message, 72).slice(0, 3).forEach((ln, i) => cx.fillText(ln, 60, 358 + i * 14));
    return;
  }

  // Menú principal
  dBoxMenu(150, 120, 340, 230, 'PARTIDA PORTÁTIL');
  cx.fillStyle = '#aaa';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Movete con ↑↓ y confirmá con C.', 172, 168);

  OPTIONS.forEach((opt, i) => {
    const y = 205 + i * 34;
    cx.fillStyle = st.sel === i ? '#ffd700' : '#888';
    cx.font = '9px "Press Start 2P"';
    cx.fillText(`${st.sel === i ? '▶ ' : '  '}${opt}`, 185, y);
  });

  cx.fillStyle = '#666';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Sirve para mudarte de navegador o pasar tu partida.', 160, 320);

  if (st.message) {
    cx.fillStyle = st.messageColor;
    wrap(st.message, 60).slice(0, 2).forEach((ln, i) => cx.fillText(ln, 172, 338 + i * 13));
  }
}

// ── pegado ───────────────────────────────────────────────────
// Listener global: solo actúa si estamos en la pantalla de importar y el
// juego está en modo 'saveTransfer'. Se registra una sola vez.
let pasteHooked = false;
function hookPaste() {
  if (pasteHooked) return;
  pasteHooked = true;
  document.addEventListener('paste', (e) => {
    const st = G.transfer;
    if (!st || G.scr !== 'saveTransfer' || st.mode !== 'import') return;
    const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    if (!text) return;
    e.preventDefault();
    st.paste = text.trim();
    const check = inspectSaveCode(st.paste);
    if (check.ok) {
      st.message = 'Código válido. C para importar.';
      st.messageColor = '#30D848';
    } else {
      st.message = check.error;
      st.messageColor = '#E83030';
    }
  });
}

function resetTransferState() {
  G.transfer = null;
}

export { uSaveTransfer, dSaveTransfer, hookPaste, resetTransferState, OPTIONS };
