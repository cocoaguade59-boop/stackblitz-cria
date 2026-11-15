// Exportar / importar partida como texto.
//
// El save vive en localStorage (SAVE_KEY). Para poder moverlo entre
// navegadores, mandarlo por chat o hacer copia de seguridad antes de un
// cambio de formato, exponemos el JSON como código portátil:
//   CR1-<base64url del JSON>
// El prefijo permite validar antes de pisar una partida existente.

import { SAVE_KEY } from './save.js';

const EXPORT_PREFIX = 'CR1-';

// JSON → base64url (sin +, / ni = para que se pueda copiar/pegar sin escapes)
function encodeRaw(json) {
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeRaw(code) {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getSavedRaw() {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch (e) {
    return null;
  }
}

/** Devuelve el código portátil de la partida guardada, o null si no hay. */
function exportSaveCode() {
  const raw = getSavedRaw();
  if (!raw) return null;
  try {
    return EXPORT_PREFIX + encodeRaw(raw);
  } catch (e) {
    console.error('No se pudo exportar la partida:', e);
    return null;
  }
}

/**
 * Valida un código sin aplicarlo.
 * @returns {{ ok: true, save: object } | { ok: false, error: string }}
 */
function inspectSaveCode(code) {
  const clean = String(code || '').trim();
  if (!clean) return { ok: false, error: 'El código está vacío.' };
  if (!clean.startsWith(EXPORT_PREFIX)) {
    return { ok: false, error: 'El código no empieza con CR1-.' };
  }
  let json;
  try {
    json = decodeRaw(clean.slice(EXPORT_PREFIX.length));
  } catch (e) {
    return { ok: false, error: 'El código está dañado o incompleto.' };
  }
  let save;
  try {
    save = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: 'El contenido no es una partida válida.' };
  }
  if (!save || typeof save !== 'object' || !Array.isArray(save.party)) {
    return { ok: false, error: 'La partida no tiene equipo: parece de otra versión.' };
  }
  return { ok: true, save };
}

/**
 * Escribe el código importado en localStorage.
 * No toca el estado en memoria: hace falta recargar para verlo.
 * @returns {{ ok: true, save: object } | { ok: false, error: string }}
 */
function importSaveCode(code) {
  const res = inspectSaveCode(code);
  if (!res.ok) return res;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(res.save));
  } catch (e) {
    return { ok: false, error: 'No se pudo escribir en localStorage.' };
  }
  return res;
}

export { EXPORT_PREFIX, exportSaveCode, inspectSaveCode, importSaveCode };
