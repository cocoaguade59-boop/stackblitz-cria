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

export { createProaMissions, resetProaMissionProgress };
