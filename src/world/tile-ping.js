// Punto 11: aviso de "hay algo acá".
//
// El problema que resuelve: el mapa tiene pines de hallazgo y NPCs con
// diálogo nuevo, pero nada en la pantalla te dice que están ahí. El jugador
// camina de largo y se pierde contenido sin saberlo.
//
// Solución: cada vez que el jugador pisa una casilla, se miran las 4 de al
// lado (y la propia). Si hay un pin sin abrir o un NPC con el que todavía no
// hablaste, se lanza un pitido suave + un aviso corto.
//
// Reglas para no ser molesto:
//  - Una sola vez por casilla y por tipo de hallazgo (no repite al caminar
//    de un lado a otro sobre el mismo lugar).
//  - Como mucho un aviso cada N pasos (evita ráfagas al atravesar una zona).
//  - Los NPCs ya hablados (G.talkedTo) no vuelven a sonar.
//
// Este archivo no dibuja ni suena: es lógica pura y por eso se puede testear.

// Tipos de aviso, con su prioridad (más alto gana si hay dos a la vez).
const PING_KIND = {
  pin: { id: 'pin', prio: 2, label: 'Hay algo aquí cerca (C para abrir)' },
  npc: { id: 'npc', prio: 1, label: 'Alguien nuevo por acá' },
};

/**
 * Mira una casilla y sus 4 vecinas. Devuelve el mejor hallazgo o null.
 *
 * @param {object} ctx
 * @param {number} ctx.cx            columna del jugador
 * @param {number} ctx.cy            fila del jugador
 * @param {(c:number,r:number)=>boolean} ctx.isPinTile
 *        true si esa casilla es un pin sin abrir.
 * @param {(c:number,r:number)=>object|null} ctx.npcAt
 *        NPC en esa casilla (con `flag` y/o `nm`), o null.
 * @param {(npc:object)=>boolean} ctx.npcIsNew
 *        true si ese NPC tiene diálogo que el jugador no vio.
 * @returns {{kind:string, label:string, at:{c:number,r:number}, npc?:object}|null}
 */
function findPingAt(ctx) {
  const { cx, cy } = ctx;
  const cells = [
    [cx, cy],
    [cx, cy - 1],
    [cx, cy + 1],
    [cx - 1, cy],
    [cx + 1, cy],
  ];

  let best = null;
  for (const [c, r] of cells) {
    let found = null;

    let isPin = false;
    try {
      isPin = !!ctx.isPinTile(c, r);
    } catch (e) {
      isPin = false;
    }
    if (isPin) {
      found = { kind: PING_KIND.pin.id, label: PING_KIND.pin.label, at: { c, r } };
    } else {
      let npc = null;
      try {
        npc = ctx.npcAt(c, r);
      } catch (e) {
        npc = null;
      }
      if (npc && (!ctx.npcIsNew || ctx.npcIsNew(npc))) {
        found = {
          kind: PING_KIND.npc.id,
          label: `${npc.nm || 'Alguien'} tiene algo que contarte`,
          at: { c, r },
          npc,
        };
      }
    }

    if (found) {
      const prio = PING_KIND[found.kind].prio;
      if (!best || prio > PING_KIND[best.kind].prio) best = found;
    }
  }
  return best;
}

// Clave estable para "ya avisé acá": tipo + coordenadas. No usa el nombre del
// NPC porque dos NPCs pueden turnarse en la misma casilla (David-O / Luas).
function pingKey(found) {
  return `${found.kind}:${found.at.c},${found.at.r}`;
}

/**
 * Estado del aviso. Se guarda en un objeto plano para poder testearlo sin G.
 * @param {object} state { seen: Set-like de claves, lastStep: number }
 */
function createPingState() {
  return { seen: Object.create(null), lastStep: -999, count: 0 };
}

/**
 * Decide si corresponde avisar ahora. Devuelve el hallazgo si sí, o null.
 *
 * @param {object} state     createPingState()
 * @param {object|null} found resultado de findPingAt
 * @param {number} stepCount pasos acumulados del jugador
 * @param {number} minSteps  separación mínima entre avisos (por defecto 6)
 */
function shouldPing(state, found, stepCount, minSteps = 6) {
  if (!found) return null;
  const key = pingKey(found);
  if (state.seen[key]) return null;
  if (stepCount - state.lastStep < minSteps) return null;
  state.seen[key] = true;
  state.lastStep = stepCount;
  state.count++;
  return found;
}

export { PING_KIND, findPingAt, pingKey, createPingState, shouldPing };
