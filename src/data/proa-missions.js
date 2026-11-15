// Misiones de Proa: datos, textos y progreso de evaluación local.
// El juego inyecta el equipo actual para que estos datos no dependan de estado global.
function createProaMissions(getParty) {
  const missions = {
  tamara: {
    leaderNm: 'Tamara',
    diploma: 'Fotografía Estética',
    dlgStart: [
      '¡Hola! Soy Tamara, líder de',
      'Villa Storyboard y MATERIALIZADORA.',
      'Mi orden crea con las manos.',
      'Demuéstrame que entiendes la',
      'armonía de los elementos.',
      'Tráeme Fuego, Agua y Planta',
      'en tu equipo. ¡Crea equilibrio!',
    ],
    dlgAccept: ['¡Perfecto! Ve y completa el reto.'],
    dlgFail: [
      'Aún te falta una criatura.',
      'Necesito una de cada tipo:',
      '🔥 Fuego, 💧 Agua y 🌿 Planta.',
    ],
    dlgWin: ['¡Eso es armonía pura!', '¡Ahora sí, peleemos!'],
    dlgVictory: [
      '¡Increíble! Aquí tienes tu diploma.',
      '"Fotografía Estética"...',
      'No tiene mucho que ver conmigo,',
      'pero es el que me tocó. ¡Felicidades!',
    ],
    check: function () {
      const types = new Set(getParty().map((c) => c.tp));
      return types.has('fire') && types.has('water') && types.has('plant');
    },
  },
  luchito: {
    leaderNm: 'Luchito',
    diploma: 'Documental',
    dlgStart: [
      '¡El amor me da fuerzas! Soy',
      'Luchito, líder de Cantera Rodaje',
      'y CRONISTA. Mi orden registra',
      'cada hazaña para la historia.',
      'Estoy escribiendo el Manual de',
      'Batalla del Reino. Dame 3 golpes',
      'súper efectivos para completarlo.',
    ],
    dlgAccept: ['¡Ve y demuestra tu poder!'],
    dlgFail: [
      'Aún necesitas más golpes súper efectivos.',
      '¡Usa el tipo correcto contra el tipo correcto!',
    ],
    dlgWin: ['¡Esos golpes fueron hermosos!', 'El Manual está casi completo...'],
    dlgVictory: [
      'Quedará registrado para siempre.',
      'Cada golpe que diste está en',
      'estas páginas. Las canteras',
      'guardan fósiles; los Cronistas',
      'guardamos historia. ¡Enhorabuena!',
      'Toma tu diploma "Documental".',
    ],
    superEffectiveHits: 0,
    check: function () {
      return missions.luchito.superEffectiveHits >= 3;
    },
  },
  andrea: {
    leaderNm: 'Andrea',
    diploma: 'Ficción',
    dlgStart: [
      'Soy Andrea, líder de Feria',
      'Última Toma y PREGONERA.',
      'Mi orden transmite la verdad.',
      'Antes de darte información,',
      'debo evaluar si eres digno.',
      'Te haré 3 preguntas del reino.',
      'Acierta 2 de 3 y te dejo combatir.',
    ],
    dlgAccept: ['¡Enfoque! Las preguntas vienen...'],
    dlgFail: [
      'Necesitas al menos 2 respuestas correctas.',
      '¡Vuelve cuando estés preparada/o!',
    ],
    dlgWin: ['¡Aprobado! Lección final:', '¡nunca subestimes a tu profesora!'],
    dlgVictory: [
      '¡Aquí está tu diploma! "Ficción"...',
      'Porque a veces la realidad',
      'necesita un poco de imaginación.',
      '¡Felicidades, alumno/a!',
    ],
    questions: [
      {
        q: '¿Qué tipo es fuerte contra Dragón?',
        opts: ['Fuego', 'Hada', 'Planta'],
        correct: 1,
      },
      {
        q: '¿Cuántos tipos de criaturas existen?',
        opts: ['3', '5', '7'],
        correct: 1,
      },
      {
        q: '¿Cómo se llaman los encargados?',
        opts: ['Proas', 'Líderes', 'Maestros'],
        correct: 0,
      },
    ],
    quizScore: 0,
    quizIdx: 0,
    quizActive: false,
    check: function () {
      return false;
    },
  },
  dan: {
    leaderNm: 'Dan',
    diploma: 'Publicidad',
    dlgStart: [
      '¡Hola! Soy Dan, líder de Prados',
      'Montaje. No pertenezco a ninguna',
      'orden fija... la información libre',
      'es más divertida, ¿no crees?',
      'Habla con los varones del pueblo',
      'y cuéntame algo sobre ellos.',
      '¡Chismes aceptados sin filtro!',
    ],
    dlgAccept: ['¡Ve, habla y regresa con datos!'],
    dlgFail: ['Aún no me has contado nada.', 'Habla con los varones y vuelve.'],
    dlgWin: [
      '¡Interesante! Ahora peleemos.',
      'El chisme más fuerte',
      'es el que se gana en combate.',
    ],
    dlgVictory: [
      '¡Tu diploma! "Publicidad"...',
      'Porque los chismes son la mejor',
      'publicidad que existe.',
      '¡Felicidades!',
    ],
    gossip: 0,
    // Lista de índices de DAN_GOSSIP_LIST ya reportados. Sin este array,
    // `LEADER_MISSIONS.dan.reported.push(...)` lanzaba TypeError al
    // reportar el primer chisme (undefined.push).
    reported: [],
    gossipNeeded: 3,
    check: function () {
      return missions.dan.gossip >= missions.dan.gossipNeeded;
    },
  },
};
  return missions;
}

function resetProaMissionProgress(missions) {
  missions.luchito.superEffectiveHits = 0;
  missions.andrea.quizScore = 0;
  missions.andrea.quizIdx = 0;
  missions.andrea.quizActive = false;
  missions.dan.gossip = 0;
  missions.dan.reported = [];
}

// ── PERSISTENCIA ────────────────────────────────────────────
// El avance de estas misiones vivía sólo en memoria: guardar partida no lo
// incluía y resetGame() tampoco lo limpiaba. Consecuencias reales:
//   1. Acumulabas 2 golpes para Luchito, guardabas y cerrabas → volvía a 0,
//      así que el diploma "Documental" era imposible en varias sesiones.
//   2. Reiniciar toda la partida conservaba el contador viejo → un amigo
//      podía empezar de cero y sacar el diploma sin pelear.
// Sólo se serializan los campos de progreso; textos, preguntas y check()
// siguen viviendo en este módulo.

const MISSION_PROGRESS_FIELDS = {
  luchito: ['superEffectiveHits'],
  andrea: ['quizScore', 'quizIdx', 'quizActive'],
  dan: ['gossip', 'reported'],
};

/** Progreso serializable (para el save). */
function getProaMissionProgress(missions) {
  const out = {};
  for (const [id, fields] of Object.entries(MISSION_PROGRESS_FIELDS)) {
    out[id] = {};
    for (const f of fields) out[id][f] = missions[id]?.[f];
  }
  return out;
}

/**
 * Restaura el progreso guardado. Tolerante a saves viejos o corruptos:
 * cualquier campo faltante o de tipo incorrecto conserva su valor por defecto.
 */
function applyProaMissionProgress(missions, progress) {
  if (!progress || typeof progress !== 'object') return false;
  let restored = false;
  for (const [id, fields] of Object.entries(MISSION_PROGRESS_FIELDS)) {
    const src = progress[id];
    if (!src || typeof src !== 'object' || !missions[id]) continue;
    for (const f of fields) {
      if (!(f in src)) continue;
      const def = missions[id][f];
      const val = src[f];
      if (Array.isArray(def) ? Array.isArray(val) : typeof val === typeof def) {
        missions[id][f] = val;
        restored = true;
      }
    }
  }
  return restored;
}

export {
  createProaMissions,
  resetProaMissionProgress,
  getProaMissionProgress,
  applyProaMissionProgress,
  MISSION_PROGRESS_FIELDS,
};
