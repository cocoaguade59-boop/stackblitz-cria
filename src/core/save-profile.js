// Punto 15: perfil de guardado.
//
// Antes la pantalla de título decía "Continuar partida guardada" y nada más.
// Con dos o tres partidas (o al volver semanas después) no hay forma de saber
// qué hay adentro. Acá se arma una línea corta y legible:
//
//   "Guardado 1 · Aldea Pitch · 2h 14m · 4 insignias"
//
// Todo es lógica pura: no toca localStorage ni el canvas, así que se puede
// probar sin navegador.

import { REGIONS, WORLD_LEVEL_ZONES } from '../data/regions.js';

// Zonas del mundo por fila (el mapa es vertical: r=0 es el norte).
// Se ordenan de más específica a más general; la primera que contiene la fila
// gana. Si no cae en ninguna, se usa la zona más cercana.
function zoneForRow(r) {
  for (const z of WORLD_LEVEL_ZONES) {
    if (r >= z.rMin && r <= z.rMax) return z;
  }
  let best = WORLD_LEVEL_ZONES[0];
  let bestDist = Infinity;
  for (const z of WORLD_LEVEL_ZONES) {
    const d = r < z.rMin ? z.rMin - r : r - z.rMax;
    if (d < bestDist) {
      bestDist = d;
      best = z;
    }
  }
  return best;
}

/**
 * Nombre del lugar donde está el jugador, para mostrar en el perfil.
 * Los mapas que no son el mundo abierto (cuevas, castillo, torre, interiores)
 * tienen nombre propio en REGIONS o uno genérico decente.
 */
function placeName(curMap, x, y) {
  if (!curMap || curMap === 'world') {
    const z = zoneForRow(Math.round(y ?? 0));
    return z ? z.nm : 'Reino';
  }
  if (curMap === 'interior') return 'Interior';
  if (REGIONS[curMap]) return REGIONS[curMap].name;
  return 'Reino';
}

/** Nombre corto del lugar, para que la línea no se corte en pantalla. */
function shortPlace(name) {
  const MAP = {
    'Aldea Pitch': 'Aldea Pitch',
    'Villa Storyboard': 'Storyboard',
    'Cantera Rodaje': 'Rodaje',
    'Feria Última Toma': 'Última Toma',
    'Prados Montaje': 'Montaje',
    'Castillo Difusión': 'Castillo',
    'Cueva Volcánica': 'C. Volcánica',
    'Cueva Cristalina': 'C. Cristalina',
    'Torre P.A.': 'Torre P.A.',
  };
  return MAP[name] || name;
}

/**
 * Tiempo jugado en formato compacto: "0m", "47m", "2h 14m", "12h 03m".
 * Se redondea hacia abajo el minuto: nunca promete más tiempo del real.
 */
function formatPlayTime(ms) {
  const total = Math.max(0, Math.floor((ms || 0) / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/**
 * Línea completa del perfil. Los campos que falten se omiten en vez de
 * mostrarse vacíos ("· ·").
 *
 * @param {{slot?:number, place?:string, ms?:number, medals?:number}} p
 * @returns {string}
 */
function profileLine(p = {}) {
  const parts = [];
  parts.push(`Guardado ${p.slot || 1}`);
  const place = shortPlace(p.place || 'Reino');
  if (place) parts.push(place);
  if (p.ms != null) parts.push(formatPlayTime(p.ms));
  const medals = Math.max(0, Math.floor(p.medals || 0));
  parts.push(medals === 1 ? '1 insignia' : `${medals} insignias`);
  return parts.join(' · ');
}

/**
 * Arma el perfil a partir del objeto de guardado crudo (el JSON que ya
 * existe en localStorage). Tolera guardados viejos sin los campos nuevos:
 * cada uno tiene un valor por defecto sensato.
 */
function profileFromSave(save, opts = {}) {
  const s = save || {};
  const place = placeName(s.curMap ?? 'world', s.plx ?? 0, s.ply ?? 0);
  const diplomas = s.diplomas || {};
  const medals = Object.values(diplomas).filter(Boolean).length;
  const ms = s.playMs ?? s.playedMs ?? 0;
  return {
    slot: opts.slot || 1,
    place,
    shortPlace: shortPlace(place),
    ms,
    medals,
    line: profileLine({ slot: opts.slot || 1, place, ms, medals }),
    // Extra útil para la UI: nivel del líder del equipo.
    topLevel: (s.party || []).reduce((m, c) => Math.max(m, c?.lv || 0), 0),
  };
}

export { placeName, shortPlace, formatPlayTime, profileLine, profileFromSave, zoneForRow };
