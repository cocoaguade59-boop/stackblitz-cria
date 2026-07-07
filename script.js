// ============================================================
// CRIATURAS DEL REINO V2 - BLOQUE 1: BASE
// ============================================================
const cv = document.getElementById('c'),
  cx = cv.getContext('2d');
const T = 32,
  WC = 80,
  WR = 150,
  CC = 40,
  CR = 30,
  KC = 30,
  KR = 25;
let cam = { x: 0, y: 0 },
  fr = 0,
  wMap = [],
  cave1 = [],
  cave2 = [],
  castMap = [];
let lastHealPos = { x: 20, y: 145, map: 'world' };
let postGame = false,
  towerOpen = false,
  oloDefeated = false;
let npcDefeats = {},
  pairBattles = false;
let proa = []; // Almacén de criaturas extra
let towerKey = {
  edison: false,
  roberto: false,
  gabriela: false,
  ximena: false,
};

// === AUDIO ===
class SFX {
  constructor() {
    this.c = null;
    this.on = false;
  }
  init() {
    if (this.on) return;
    try {
      this.c = new (window.AudioContext || window.webkitAudioContext)();
      this.on = true;
    } catch (e) {}
  }
  n(f, d, t = 'square', v = 0.08) {
    if (!this.c) return;
    let o = this.c.createOscillator(),
      g = this.c.createGain();
    o.connect(g);
    g.connect(this.c.destination);
    o.type = t;
    o.frequency.setValueAtTime(f, this.c.currentTime);
    g.gain.setValueAtTime(v, this.c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.c.currentTime + d);
    o.start();
    o.stop(this.c.currentTime + d);
  }
  walk() {
    this.n(200, 0.05, 'square', 0.03);
  }
  sel() {
    this.n(440, 0.1);
    setTimeout(() => this.n(660, 0.1), 50);
  }
  atk() {
    this.n(150, 0.15, 'sawtooth', 0.1);
  }
  hit() {
    this.n(100, 0.2, 'sawtooth', 0.12);
  }
  heal() {
    this.n(523, 0.15, 'sine', 0.08);
    setTimeout(() => this.n(659, 0.15, 'sine', 0.08), 100);
  }
  lvl() {
    [523, 659, 784, 1047].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.2, 'square', 0.1), i * 120)
    );
  }
  win() {
    [523, 587, 659, 784, 880, 1047].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.25, 'square', 0.08), i * 150)
    );
  }
  bat() {
    this.n(220, 0.15);
    setTimeout(() => this.n(330, 0.15), 100);
    setTimeout(() => this.n(440, 0.3), 200);
  }
  sup() {
    this.n(880, 0.1, 'square', 0.12);
    setTimeout(() => this.n(1100, 0.1), 80);
  }
  nef() {
    this.n(300, 0.2, 'triangle', 0.06);
    setTimeout(() => this.n(200, 0.3, 'triangle', 0.06), 150);
  }
  cap() {
    [440, 554, 659, 880].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.3, 'square', 0.1), i * 200)
    );
  }
  def() {
    [440, 370, 311, 220].forEach((n, i) =>
      setTimeout(() => this.n(n, 0.4, 'sawtooth', 0.08), i * 250)
    );
  }
}
const sfx = new SFX();

// === TIPOS ===
function tEff(a, d) {
  if (a === 'normal') return 1;
  const c = {
    fire: { fire: 0.5, water: 0.5, plant: 2, dragon: 0.5, fairy: 2 },
    water: { fire: 2, water: 0.5, plant: 0.5, dragon: 1, fairy: 0.5 },
    plant: { fire: 0.5, water: 2, plant: 0.5, dragon: 0.5, fairy: 2 },
    dragon: { fire: 2, water: 1, plant: 2, dragon: 1, fairy: 0.5 },
    fairy: { fire: 0.5, water: 2, plant: 0.5, dragon: 2, fairy: 1 },
  };
  return c[a]?.[d] || 1;
}
function tCol(t) {
  return (
    {
      fire: '#E04030',
      water: '#3888E0',
      plant: '#48A038',
      dragon: '#6838A0',
      fairy: '#D860A8',
      normal: '#A8A878',
      ice: '#70C8E8',
      ground: '#C09050',
      fighting: '#C85038',
      electric: '#E8C830',
      psychic: '#E85888',
      dark: '#584838',
      steel: '#A8A8C0',
      poison: '#A040A0',
      bug: '#90A820',
      rock: '#B8A038',
      ghost: '#705898',
    }[t] || '#888'
  );
}
function tColL(t) {
  return (
    {
      fire: '#F88060',
      water: '#70B8F8',
      plant: '#80D068',
      dragon: '#A070D8',
      fairy: '#F098C8',
      normal: '#C8C8A0',
      ice: '#A8E8F8',
      ground: '#E0B878',
      fighting: '#E87058',
      electric: '#F8E070',
      psychic: '#F878A8',
      dark: '#887060',
      steel: '#D0D0E0',
      poison: '#C070C0',
      bug: '#B8C850',
      rock: '#D0B860',
      ghost: '#9078B8',
    }[t] || '#BBB'
  );
}
function tEmo(t) {
  return (
    {
      fire: '🔥',
      water: '💧',
      plant: '🌿',
      dragon: '🐉',
      fairy: '🧚',
      normal: '⚔️',
      ice: '❄️',
      ground: '⛰️',
      fighting: '🥊',
      electric: '⚡',
      psychic: '🔮',
      dark: '🌑',
      steel: '🛡️',
      poison: '☠️',
      bug: '🐞',
      rock: '🪨',
      ghost: '👻',
    }[t] || '⚔️'
  );
}
function tNam(t) {
  return (
    {
      fire: 'FUEGO',
      water: 'AGUA',
      plant: 'PLANTA',
      dragon: 'DRAGÓN',
      fairy: 'HADA',
      normal: 'NORMAL',
      ice: 'HIELO',
      ground: 'TIERRA',
      fighting: 'LUCHA',
      electric: 'ELÉCTRICO',
      psychic: 'PSÍQUICO',
      dark: 'SINIESTRO',
      steel: 'ACERO',
      poison: 'VENENO',
      bug: 'BICHO',
      rock: 'ROCA',
      ghost: 'FANTASMA',
    }[t] || 'NORMAL'
  );
}

// === CREATURE DATABASE ===
const CDB = {
  // FUEGO
  flameye: {
    nm: 'Flameye',
    tp: 'fire',
    hp: 42,
    ak: 15,
    df: 8,
    sp: 14,
    desc: 'Pavo real de fuego vanidoso',
    evo: 'flamcrest',
    evoLv: 18,
  },
  flamcrest: {
    nm: 'Flamcrest',
    tp: 'fire',
    hp: 56,
    ak: 22,
    df: 12,
    sp: 18,
    desc: 'Pavo real joven orgulloso',
    evo: 'inferpavo',
    evoLv: 36,
  },
  inferpavo: {
    nm: 'Inferpavo',
    tp: 'fire',
    hp: 72,
    ak: 30,
    df: 16,
    sp: 24,
    desc: 'Rey del fuego majestuoso',
  },
  flamingo: {
    nm: 'Flamígaro',
    tp: 'fire',
    hp: 38,
    ak: 17,
    df: 7,
    sp: 13,
    desc: 'Flamingo bailarín de flamenco',
    evo: 'flamencero',
    evoLv: 20,
  },
  flamencero: {
    nm: 'Flamencero',
    tp: 'fire',
    hp: 54,
    ak: 24,
    df: 11,
    sp: 17,
    desc: 'Flamingo con capa de fuego',
  },
  emberwing: {
    nm: 'Ascuala',
    tp: 'fire',
    hp: 45,
    ak: 14,
    df: 10,
    sp: 11,
    desc: 'Cóndor abuelita tejedora',
  },
  salamandro: {
    nm: 'Salamandro',
    tp: 'fire',
    hp: 40,
    ak: 13,
    df: 9,
    sp: 12,
    desc: 'Salamandra alquimista torpe',
    evo: 'alquimero',
    evoLv: 18,
  },
  alquimero: {
    nm: 'Alquímero',
    tp: 'fire',
    hp: 55,
    ak: 20,
    df: 13,
    sp: 16,
    desc: 'Salamandra con caldero mágico',
    evo: 'piromante',
    evoLv: 36,
  },
  piromante: {
    nm: 'Piromante',
    tp: 'fire',
    hp: 70,
    ak: 28,
    df: 17,
    sp: 21,
    desc: 'Maestro alquimista de fuego',
  },
  blaztoro: {
    nm: 'Blaztoro',
    tp: 'fire',
    hp: 48,
    ak: 16,
    df: 11,
    sp: 9,
    desc: 'Toro pastelero delicado',
    evo: 'infernotoro',
    evoLv: 22,
  },
  infernotoro: {
    nm: 'Infernotoro',
    tp: 'fire',
    hp: 64,
    ak: 25,
    df: 15,
    sp: 12,
    desc: 'Toro chef en llamas',
  },
  // AGUA
  axolotl: {
    nm: 'Ajolotín',
    tp: 'water',
    hp: 46,
    ak: 11,
    df: 13,
    sp: 10,
    desc: 'Ajolote bebé sonriente',
    evo: 'ajolord',
    evoLv: 18,
  },
  ajolord: {
    nm: 'Ajolord',
    tp: 'water',
    hp: 58,
    ak: 17,
    df: 18,
    sp: 13,
    desc: 'Ajolote adolescente serio',
    evo: 'glaciolote',
    evoLv: 36,
  },
  glaciolote: {
    nm: 'Glaciolote',
    tp: 'water',
    hp: 72,
    ak: 22,
    df: 24,
    sp: 16,
    desc: 'Ajolote de hielo ancestral',
  },
  medusync: {
    nm: 'Medusync',
    tp: 'water',
    hp: 40,
    ak: 14,
    df: 10,
    sp: 14,
    desc: 'Medusa DJ de electrónica',
    evo: 'medubass',
    evoLv: 20,
  },
  medubass: {
    nm: 'Medubass',
    tp: 'water',
    hp: 56,
    ak: 21,
    df: 14,
    sp: 18,
    desc: 'Medusa con graves potentes',
  },
  pinzardo: {
    nm: 'Pinzardo',
    tp: 'water',
    hp: 44,
    ak: 12,
    df: 14,
    sp: 8,
    desc: 'Cangrejo peluquero',
    evo: 'pinzamestre',
    evoLv: 20,
  },
  pinzamestre: {
    nm: 'Pinzamestre',
    tp: 'water',
    hp: 60,
    ak: 18,
    df: 20,
    sp: 10,
    desc: 'Cangrejo estilista de lujo',
  },
  pingueson: {
    nm: 'Pingüesón',
    tp: 'water',
    hp: 42,
    ak: 12,
    df: 11,
    sp: 12,
    desc: 'Pingüino mesero elegante',
    evo: 'pinguchef',
    evoLv: 18,
  },
  pinguchef: {
    nm: 'Pingüchef',
    tp: 'water',
    hp: 56,
    ak: 18,
    df: 15,
    sp: 15,
    desc: 'Pingüino chef con cuchillo',
    evo: 'pingumitre',
    evoLv: 36,
  },
  pingumitre: {
    nm: 'Pingümaître',
    tp: 'water',
    hp: 70,
    ak: 24,
    df: 20,
    sp: 18,
    desc: 'Pingüino dueño del restaurante',
  },
  peztronauta: {
    nm: 'Peztronauta',
    tp: 'water',
    hp: 38,
    ak: 13,
    df: 9,
    sp: 15,
    desc: 'Pez astronauta en burbuja',
    evo: 'cosmocardumen',
    evoLv: 22,
  },
  cosmocardumen: {
    nm: 'Cosmocardumen',
    tp: 'water',
    hp: 58,
    ak: 22,
    df: 13,
    sp: 20,
    desc: 'Cardumen cósmico gigante',
  },
  // PLANTA
  ivygoat: {
    nm: 'Hedroca',
    tp: 'plant',
    hp: 44,
    ak: 12,
    df: 11,
    sp: 11,
    desc: 'Cabra mayordomo elegante',
    evo: 'hedroble',
    evoLv: 20,
  },
  hedroble: {
    nm: 'Hedroble',
    tp: 'plant',
    hp: 60,
    ak: 17,
    df: 16,
    sp: 14,
    desc: 'Cabra butler con monóculo',
  },
  gorilan: {
    nm: 'Gorilán',
    tp: 'plant',
    hp: 50,
    ak: 14,
    df: 12,
    sp: 8,
    desc: 'Gorila poeta romántico',
    evo: 'gorilirico',
    evoLv: 18,
  },
  gorilirico: {
    nm: 'Gorilírico',
    tp: 'plant',
    hp: 64,
    ak: 21,
    df: 17,
    sp: 10,
    desc: 'Gorila bardo con pluma',
    evo: 'gorilegend',
    evoLv: 36,
  },
  gorilegend: {
    nm: 'Gorilegend',
    tp: 'plant',
    hp: 80,
    ak: 28,
    df: 22,
    sp: 12,
    desc: 'Gorila leyenda literaria',
  },
  orquidea: {
    nm: 'Orquídea',
    tp: 'plant',
    hp: 36,
    ak: 11,
    df: 8,
    sp: 16,
    desc: 'Mantis bailarina de ballet',
    evo: 'mantisdanza',
    evoLv: 20,
  },
  mantisdanza: {
    nm: 'Mantisdanza',
    tp: 'plant',
    hp: 52,
    ak: 18,
    df: 12,
    sp: 22,
    desc: 'Mantis con tutú de pétalos',
  },
  thornbuck: {
    nm: 'Espinardo',
    tp: 'plant',
    hp: 46,
    ak: 14,
    df: 12,
    sp: 10,
    desc: 'Carnero punk rebelde',
    evo: 'espinarcor',
    evoLv: 18,
  },
  espinarcor: {
    nm: 'Espinarcor',
    tp: 'plant',
    hp: 62,
    ak: 21,
    df: 17,
    sp: 13,
    desc: 'Carnero con chaqueta de espinas',
    evo: 'espinardoom',
    evoLv: 36,
  },
  espinardoom: {
    nm: 'Espinardoom',
    tp: 'plant',
    hp: 78,
    ak: 30,
    df: 22,
    sp: 16,
    desc: 'Carnero heavy metal gigante',
  },
  raizan: {
    nm: 'Raizán',
    tp: 'plant',
    hp: 52,
    ak: 10,
    df: 18,
    sp: 4,
    desc: 'Tortuga anciano sabio',
  },
  // DRAGÓN
  wyvern: {
    nm: 'Wyvernito',
    tp: 'dragon',
    hp: 50,
    ak: 16,
    df: 10,
    sp: 12,
    desc: 'Wyvern cachorro juguetón',
    evo: 'wyvernax',
    evoLv: 18,
  },
  wyvernax: {
    nm: 'Wyvernax',
    tp: 'dragon',
    hp: 66,
    ak: 24,
    df: 15,
    sp: 16,
    desc: 'Wyvern adolescente feroz',
    evo: 'wyvernlord',
    evoLv: 36,
  },
  wyvernlord: {
    nm: 'Wyvernlord',
    tp: 'dragon',
    hp: 82,
    ak: 32,
    df: 20,
    sp: 20,
    desc: 'Wyvern señor de los cielos',
  },
  eastern: {
    nm: 'Lóngbao',
    tp: 'dragon',
    hp: 48,
    ak: 14,
    df: 12,
    sp: 13,
    desc: 'Dragón oriental chef',
    evo: 'longwok',
    evoLv: 22,
  },
  longwok: {
    nm: 'Lóngwok',
    tp: 'dragon',
    hp: 66,
    ak: 22,
    df: 17,
    sp: 17,
    desc: 'Dragón chef con wok gigante',
  },
  ornispia: {
    nm: 'Ornispía',
    tp: 'dragon',
    hp: 44,
    ak: 15,
    df: 11,
    sp: 14,
    desc: 'Ornitorrinco agente secreto',
    evo: 'ornishadow',
    evoLv: 18,
  },
  ornishadow: {
    nm: 'Ornishadow',
    tp: 'dragon',
    hp: 58,
    ak: 22,
    df: 15,
    sp: 18,
    desc: 'Ornitorrinco con gadgets',
    evo: 'ornisagent',
    evoLv: 36,
  },
  ornisagent: {
    nm: 'Orniságent',
    tp: 'dragon',
    hp: 74,
    ak: 28,
    df: 20,
    sp: 24,
    desc: 'Ornitorrinco agente elite',
  },
  serpentdrg: {
    nm: 'Serpentón',
    tp: 'dragon',
    hp: 52,
    ak: 17,
    df: 9,
    sp: 11,
    desc: 'Serpiente dragón mafioso',
    evo: 'serpentboss',
    evoLv: 22,
  },
  serpentboss: {
    nm: 'Serpentboss',
    tp: 'dragon',
    hp: 70,
    ak: 26,
    df: 14,
    sp: 14,
    desc: 'Serpiente don de la mafia',
  },
  gusarix: {
    nm: 'Gusarix',
    tp: 'dragon',
    hp: 35,
    ak: 8,
    df: 14,
    sp: 6,
    desc: 'Gusano dentro de manzana',
    evo: 'crisalmanza',
    evoLv: 18,
  },
  crisalmanza: {
    nm: 'Crisálmanza',
    tp: 'dragon',
    hp: 50,
    ak: 14,
    df: 22,
    sp: 8,
    desc: 'Capullo de cáscara de manzana',
    evo: 'hydrapom',
    evoLv: 36,
  },
  hydrapom: {
    nm: 'Knightapple',
    tp: 'dragon',
    hp: 85,
    ak: 32,
    df: 18,
    sp: 14,
    desc: 'Caballero manzana con hojas-espada',
  },
  // HADA
  pixie: {
    nm: 'Duendecillo',
    tp: 'fairy',
    hp: 38,
    ak: 10,
    df: 10,
    sp: 16,
    desc: 'Duende ladrón de calcetines',
    evo: 'duendetron',
    evoLv: 20,
  },
  duendetron: {
    nm: 'Duendetrón',
    tp: 'fairy',
    hp: 54,
    ak: 16,
    df: 14,
    sp: 20,
    desc: 'Duende con saco gigante',
  },
  sidhe: {
    nm: 'Sídhea',
    tp: 'fairy',
    hp: 42,
    ak: 13,
    df: 11,
    sp: 14,
    desc: 'Hada celta cantante de ópera',
    evo: 'sidhearia',
    evoLv: 22,
  },
  sidhearia: {
    nm: 'Sídhearia',
    tp: 'fairy',
    hp: 60,
    ak: 20,
    df: 16,
    sp: 18,
    desc: 'Hada diva prima donna',
  },
  spritefly: {
    nm: 'Luciérlaga',
    tp: 'fairy',
    hp: 36,
    ak: 11,
    df: 9,
    sp: 17,
    desc: 'Luciérnaga fotógrafa',
    evo: 'lucilente',
    evoLv: 18,
  },
  lucilente: {
    nm: 'Lucilente',
    tp: 'fairy',
    hp: 50,
    ak: 17,
    df: 13,
    sp: 21,
    desc: 'Luciérnaga con cámara pro',
    evo: 'lucistrella',
    evoLv: 36,
  },
  lucistrella: {
    nm: 'Lucistrella',
    tp: 'fairy',
    hp: 66,
    ak: 24,
    df: 17,
    sp: 26,
    desc: 'Luciérnaga estrella de cine',
  },
  elefantasy: {
    nm: 'Elefántasy',
    tp: 'fairy',
    hp: 48,
    ak: 14,
    df: 14,
    sp: 8,
    desc: 'Elefante místico tipo Ganesha',
    evo: 'elefantastico',
    evoLv: 22,
  },
  elefantastico: {
    nm: 'Elefantástico',
    tp: 'fairy',
    hp: 68,
    ak: 22,
    df: 20,
    sp: 10,
    desc: 'Elefante hechicero con mandala',
  },
  zumbaflor: {
    nm: 'Zumbaflor',
    tp: 'fairy',
    hp: 34,
    ak: 12,
    df: 8,
    sp: 18,
    desc: 'Colibrí barista hiperactivo',
    evo: 'zumbaccino',
    evoLv: 20,
  },
  zumbaccino: {
    nm: 'Zumbaccino',
    tp: 'fairy',
    hp: 50,
    ak: 19,
    df: 12,
    sp: 24,
    desc: 'Colibrí con cafetería móvil',
  },
  // NORMAL (secreto)
  serafox: {
    nm: 'Serafox',
    tp: 'normal',
    hp: 55,
    ak: 16,
    df: 14,
    sp: 15,
    desc: 'Zorro ángel celestial travieso',
  },
};
// === DESCRIPCIONES LARGAS DE CRIATURAS ===
const CRE_DESC = {
  flameye: [
    'Un polluelo de pavo real que presume',
    'de plumas que aún no tiene. Tropieza',
    'con su propia cola todo el tiempo.',
  ],
  flamcrest: [
    'Un pavo real joven cuyas plumas',
    'empiezan a brillar con fuego real.',
    'Ahora presume con razón.',
  ],
  inferpavo: [
    'El rey del fuego. Sus plumas son',
    'llamas vivas que iluminan la noche.',
    'Majestuoso y orgulloso hasta el final.',
  ],
  flamingo: [
    'Este flamingo no baila por elegancia,',
    'sino porque no puede quedarse quieto.',
    'Su fuego interior lo mantiene en ritmo.',
  ],
  flamencero: [
    'Un flamingo con capa de fuego que',
    'ejecuta pasos imposibles. Los jueces',
    'le dan siempre un 10 perfecto.',
  ],
  emberwing: [
    'Una cóndor abuela que teje bufandas',
    'de ceniza para el invierno. Nadie',
    'se atreve a rechazar sus regalos.',
  ],
  salamandro: [
    'Una salamandra que mezcla pociones',
    'y siempre le explotan en la cara.',
    'Algún día acertará la receta.',
  ],
  alquimero: [
    'Una salamandra con caldero propio.',
    'Sus pociones ya solo explotan',
    'la mitad de las veces. Progreso.',
  ],
  piromante: [
    'Maestro alquimista de fuego. Sus',
    'pociones son legendarias. Ya no',
    'le explotan. Casi nunca.',
  ],
  blaztoro: [
    'Un toro que decora pasteles con',
    'una delicadeza imposible para',
    'alguien con pezuñas. Arte puro.',
  ],
  infernotoro: [
    'Un toro cuya pasión por cocinar',
    'es tan intensa que literalmente',
    'se prende fuego. Todo queda flambé.',
  ],
  axolotl: [
    'Este ajolote bebé nunca deja de sonreír.',
    'Dicen que su sonrisa puede curar la',
    'tristeza de cualquier corazón roto.',
  ],
  ajolord: [
    'Un ajolote adolescente que intenta',
    'verse serio pero no puede dejar',
    'de sonreír. Es más fuerte de lo que parece.',
  ],
  glaciolote: [
    'Un ajolote ancestral de hielo. Su',
    'sonrisa congeló un lago entero una vez.',
    'Nadie sabe si fue a propósito.',
  ],
  medusync: [
    'Una medusa que mezcla beats con sus',
    'tentáculos. Su música literal-',
    'mente electrifica la pista de baile.',
  ],
  medubass: [
    'Una medusa cuyos graves son tan',
    'potentes que causan maremotos.',
    'Los peces la aman. Y la temen.',
  ],
  pinzardo: [
    'Un cangrejo que corta el pelo mejor',
    'que cualquier barbero humano. Sus',
    'pinzas son tijeras de precisión.',
  ],
  pinzamestre: [
    'El estilista más caro del océano.',
    'Sus cortes cuestan una fortuna',
    'pero valen cada moneda.',
  ],
  pingueson: [
    'Un pingüino mesero que nunca derrama',
    'una gota. Su bandeja está siempre',
    'perfectamente equilibrada.',
  ],
  pinguchef: [
    'Un pingüino que ascendió a chef.',
    'Sus platos son fríos pero deliciosos.',
    'Especialidad: sushi helado.',
  ],
  pingumitre: [
    'Dueño del restaurante más exclusivo',
    'del reino. La lista de espera',
    'es de tres meses mínimo.',
  ],
  peztronauta: [
    'Un pez pequeño en una burbuja-casco',
    'espacial. Explora el mundo como si',
    'fuera el espacio exterior. Valiente.',
  ],
  cosmocardumen: [
    'Miles de peces pequeños que forman',
    'un pez gigante con casco espacial.',
    'Juntos son imparables. Solos, no tanto.',
  ],
  ivygoat: [
    'Una cabra mayordomo que sirve té de',
    'hierbas con elegancia impecable. Su',
    'bandeja nunca se tambalea.',
  ],
  hedroble: [
    'Una cabra butler con monóculo que',
    'supervisa todo el servicio. Nadie',
    'se atreve a desordenar su cocina.',
  ],
  gorilan: [
    'Un gorila que escribe sonetos de amor',
    'bajo la luna. Sus poemas hacen',
    'llorar hasta a las piedras.',
  ],
  gorilirico: [
    'Un gorila bardo que recita épicas',
    'con voz atronadora. Los árboles',
    'tiemblan cuando declama.',
  ],
  gorilegend: [
    'La leyenda literaria del bosque.',
    'Sus obras se estudian en todas',
    'las escuelas del reino.',
  ],
  orquidea: [
    'Una mantis religiosa que baila ballet',
    'entre las flores. Sus movimientos',
    'son letales y elegantes a la vez.',
  ],
  mantisdanza: [
    'Una mantis con tutú de pétalos que',
    'ejecuta piruetas perfectas. Cada',
    'danza es una obra de arte mortal.',
  ],
  thornbuck: [
    'Un carnero punk que no sigue reglas.',
    'Sus espinas son de verdad y su actitud',
    'también. No le pises las flores.',
  ],
  espinarcor: [
    'Un carnero con chaqueta de espinas',
    'que lidera su propia banda. Sus',
    'conciertos destruyen escenarios.',
  ],
  espinardoom: [
    'El carnero heavy metal definitivo.',
    'Sus cuernos vibran con cada acorde.',
    'Las paredes tiemblan cuando toca.',
  ],
  raizan: [
    'Una tortuga anciana que ha visto',
    'todo y no tiene prisa por nada.',
    'Su sabiduría es tan profunda como lenta.',
  ],
  wyvern: [
    'Un cachorro de wyvern que persigue su',
    'propia cola y mordisquea todo. Sus',
    'cuernitos dorados aún son de leche.',
  ],
  wyvernax: [
    'Un wyvern adolescente que ya puede',
    'volar pero aterriza fatal. Sus',
    'cuernos empiezan a ser de verdad.',
  ],
  wyvernlord: [
    'Señor de los cielos. Sus alas cubren',
    'el sol cuando vuela. Majestuoso',
    'y temible. Ya aterriza bien.',
  ],
  eastern: [
    'Un dragón oriental que cocina los',
    'mejores dumplings del reino. Su fuego',
    'tiene sabor a jengibre.',
  ],
  longwok: [
    'Un dragón chef con un wok gigante.',
    'Sus platos son legendarios. Nadie',
    'rechaza una invitación a cenar.',
  ],
  ornispia: [
    'Un ornitorrinco con sombrero y',
    'maletín sospechoso. Nadie sabe para',
    'quién trabaja. Ni él mismo.',
  ],
  ornishadow: [
    'Un ornitorrinco con gadgets ocultos.',
    'Su sombrero tiene 14 funciones.',
    '7 de ellas son secretas.',
  ],
  ornisagent: [
    'Agente elite. Su expediente está',
    'clasificado. Su sombrero también.',
    'Todo en él es clasificado.',
  ],
  serpentdrg: [
    'Una serpiente dragón con traje y puro.',
    'Nadie sabe de dónde sacó el sombrero',
    'pero nadie se atreve a preguntar.',
  ],
  serpentboss: [
    'El don de la mafia dragón. Su mirada',
    'congela y su puro nunca se apaga.',
    'Nadie le dice que no.',
  ],
  gusarix: [
    'Un gusanito verde que vive dentro',
    'de una manzana roja mordida. La',
    'manzana es su casa y su armadura.',
  ],
  crisalmanza: [
    'Un capullo hecho de cáscara de manzana.',
    'Se ven grietas brillantes por donde',
    'asoma algo grande. Algo con cabezas.',
  ],
  hydrapom: [
    'Knightapple parece una manzana caballero:',
    'cuerpo rojo brillante, cuello serpentino',
    'y hojas verdes como espada y escudo.',
  ],
  pixie: [
    'Un duende ladrón de calcetines. Nadie',
    'sabe por qué los roba. Él tampoco.',
    'Pero su saco está siempre lleno.',
  ],
  duendetron: [
    'Un duende con un saco tan grande que',
    'apenas puede caminar. Tiene más',
    'calcetines que toda una lavandería.',
  ],
  sidhe: [
    'Un hada celta que canta ópera en los',
    'bosques. Los árboles lloran cuando',
    'ella canta. Literalmente.',
  ],
  sidhearia: [
    'La prima donna del bosque. Su voz',
    'puede romper cristales y corazones',
    'al mismo tiempo. Diva total.',
  ],
  spritefly: [
    'Una luciérnaga fotógrafa que usa su',
    'propio trasero como flash. Sus fotos',
    'salen brillantes, literalmente.',
  ],
  lucilente: [
    'Una luciérnaga con cámara profesional.',
    'Sus fotos ganan premios. Su trasero',
    'sigue siendo el mejor flash.',
  ],
  lucistrella: [
    'Directora de cine y estrella a la vez.',
    'Sus películas iluminan la pantalla.',
    'Literalmente. Con su trasero.',
  ],
  elefantasy: [
    'Un elefante místico con cuatro brazos',
    'mágicos y joyas ancestrales. Medita',
    'flotando sobre un loto de luz.',
  ],
  elefantastico: [
    'Un elefante hechicero supremo con',
    'mandala brillante y seis brazos.',
    'Su trompa canaliza magia pura.',
  ],
  zumbaflor: [
    'Un colibrí barista que prepara café',
    'a velocidad supersónica. Sus clientes',
    'nunca esperan más de 0.3 segundos.',
  ],
  zumbaccino: [
    'Un colibrí con cafetería móvil propia.',
    'Sirve 400 cafés por minuto. Nadie',
    'sabe cuándo duerme. Nunca.',
  ],
  serafox: [
    'Un zorro ángel celestial de leyenda.',
    'Solo aparece ante los de corazón puro.',
    'Sus alas doradas iluminan la noche.',
  ],
};

// === GUARDADO ===
const SAVE_KEY = 'criaturasDelReino_v2';
function hasSaveGame() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
function clearAllGameSaves() {
  try {
    localStorage.removeItem(SAVE_KEY);
    // Limpieza de compatibilidad por si StackBlitz conservó claves antiguas.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && /criaturas|reino/i.test(k)) localStorage.removeItem(k);
    }
  } catch (e) {
    console.error('Error limpiando guardado:', e);
  }
}

// === CONTADOR DE CAPTURAS POR ESPECIE ===
let captureCount = {};

const POOLS = {
  fire: ['flameye', 'flamingo', 'emberwing', 'salamandro', 'blaztoro'],
  water: ['axolotl', 'medusync', 'pinzardo', 'pingueson', 'peztronauta'],
  plant: ['ivygoat', 'gorilan', 'orquidea', 'thornbuck', 'raizan'],
  dragon: ['wyvern', 'eastern', 'ornispia', 'serpentdrg', 'gusarix'],
  fairy: ['pixie', 'sidhe', 'spritefly', 'elefantasy', 'zumbaflor'],
};

const ALL_MOVES = [
  // === FUEGO ===
  {
    nm: 'Escupitajo Ardiente',
    tp: 'fire',
    pw: 40,
    pp: 25,
    mp: 25,
    acc: 100,
    desc: 'Escupe una chispa ardiente básica al enemigo.',
  },
  {
    nm: 'Bola Ígnea',
    tp: 'fire',
    pw: 70,
    pp: 12,
    mp: 12,
    acc: 90,
    desc: 'Una esfera de fuego concentrado. Potente pero algo imprecisa.',
  },
  {
    nm: 'Nitrocarga',
    tp: 'fire',
    pw: 50,
    pp: 20,
    mp: 20,
    acc: 100,
    ef: 'spdUp',
    desc: 'Embiste envuelto en llamas. Sube tu velocidad +1.',
  },
  {
    nm: 'Lluvia Ígnea',
    tp: 'fire',
    pw: 50,
    pp: 15,
    mp: 15,
    acc: 95,
    ef: 'burn20',
    desc: 'Lluvia de brasas ardientes. 20% de quemar al rival.',
  },
  {
    nm: 'Explosión Solar',
    tp: 'fire',
    pw: 90,
    pp: 5,
    mp: 5,
    acc: 85,
    ef: 'charge',
    desc: 'Concentra energía solar y explota. Muy potente pero imprecisa.',
  },
  {
    nm: 'Golpe Volcán',
    tp: 'fire',
    pw: 75,
    pp: 10,
    mp: 10,
    acc: 90,
    ef: 'selfDefDn',
    desc: 'Golpe con furia volcánica. Baja tu propia defensa -1.',
  },
  {
    nm: 'Día Soleado',
    tp: 'fire',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'sunUp',
    desc: 'Intensifica el sol por 5 turnos. Fuego +50%, Agua -50%.',
  },
  {
    nm: 'Voluntad Ardiente',
    tp: 'fire',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'atkSpdUpDefDn',
    desc: 'Enciende tu espíritu. ATK y SPD +1, pero DEF -1.',
  },
  {
    nm: 'Pantalla Humo',
    tp: 'fire',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'accDn',
    desc: 'Crea una cortina de humo. Baja precisión del rival.',
  },
  // === AGUA ===
  {
    nm: 'Chorro',
    tp: 'water',
    pw: 40,
    pp: 25,
    mp: 25,
    acc: 100,
    desc: 'Dispara un chorro de agua básico al enemigo.',
  },
  {
    nm: 'Hidrobomba',
    tp: 'water',
    pw: 70,
    pp: 12,
    mp: 12,
    acc: 85,
    desc: 'Torrente de agua a presión. Potente pero imprecisa.',
  },
  {
    nm: 'Aqua Jet',
    tp: 'water',
    pw: 40,
    pp: 20,
    mp: 20,
    acc: 100,
    ef: 'priority',
    desc: 'Ataque rápido de agua. Siempre golpea primero.',
  },
  {
    nm: 'Cascada',
    tp: 'water',
    pw: 65,
    pp: 15,
    mp: 15,
    acc: 95,
    ef: 'flinch20',
    desc: 'Cae agua como cascada. 20% de hacer retroceder.',
  },
  {
    nm: 'Rayo Burbuja',
    tp: 'water',
    pw: 45,
    pp: 20,
    mp: 20,
    acc: 100,
    ef: 'spdDn30',
    desc: 'Burbujas que explotan. 30% de bajar SPD rival.',
  },
  {
    nm: 'Torbellino',
    tp: 'water',
    pw: 55,
    pp: 10,
    mp: 10,
    acc: 90,
    ef: 'trap2',
    desc: 'Atrapa al rival en un remolino por 2 turnos.',
  },
  {
    nm: 'Danza Lluvia',
    tp: 'water',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'rainUp',
    desc: 'Invoca lluvia por 5 turnos. Agua +50%, Fuego -50%.',
  },
  {
    nm: 'Refugio',
    tp: 'water',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'defUp2',
    desc: 'Se refugia en su caparazón. DEF sube +2.',
  },
  {
    nm: 'Niebla',
    tp: 'water',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'accDnBoth',
    desc: 'Cubre el campo de niebla. Baja precisión de ambos.',
  },
  // === PLANTA ===
  {
    nm: 'Hoja Afilada',
    tp: 'plant',
    pw: 40,
    pp: 25,
    mp: 25,
    acc: 100,
    desc: 'Lanza hojas cortantes al enemigo.',
  },
  {
    nm: 'Tormenta Floral',
    tp: 'plant',
    pw: 70,
    pp: 12,
    mp: 12,
    acc: 90,
    desc: 'Tormenta de pétalos afilados. Potente pero algo imprecisa.',
  },
  {
    nm: 'Látigo Cepa',
    tp: 'plant',
    pw: 55,
    pp: 15,
    mp: 15,
    acc: 100,
    ef: 'defDn',
    desc: 'Azota con lianas. Baja DEF del rival -1.',
  },
  {
    nm: 'Bomba Semilla',
    tp: 'plant',
    pw: 60,
    pp: 20,
    mp: 20,
    acc: 100,
    desc: 'Lanza semillas explosivas. Daño sólido y preciso.',
  },
  {
    nm: 'Gigadrenado',
    tp: 'plant',
    pw: 55,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'drain50',
    desc: 'Drena energía vital. Recupera 50% del daño causado.',
  },
  {
    nm: 'Hoja Navaja',
    tp: 'plant',
    pw: 50,
    pp: 15,
    mp: 15,
    acc: 100,
    ef: 'highCrit',
    desc: 'Corte preciso con hoja. Alta probabilidad de crítico.',
  },
  {
    nm: 'Drenadoras',
    tp: 'plant',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'leech4',
    desc: 'Planta semillas drenadoras por 4 turnos. Roba HP cada turno.',
  },
  {
    nm: 'Espora Sueño',
    tp: 'plant',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 75,
    ef: 'sleep2',
    desc: 'Lanza esporas somníferas. Duerme al rival 2 turnos. Imprecisa.',
  },
  {
    nm: 'Crecimiento',
    tp: 'plant',
    pw: 0,
    pp: 20,
    mp: 20,
    acc: 100,
    ef: 'atkDefUp',
    desc: 'Absorbe nutrientes. ATK y DEF suben +1.',
  },
  {
    nm: 'Campo de Flores',
    tp: 'plant',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'healField3',
    desc: 'Crea un campo floral por 3 turnos. Cura HP cada turno.',
  },
  // === DRAGÓN ===
  {
    nm: 'Garra Dragón',
    tp: 'dragon',
    pw: 45,
    pp: 20,
    mp: 20,
    acc: 100,
    desc: 'Zarpazo con garras de dragón. Ataque básico.',
  },
  {
    nm: 'Aliento Dragón',
    tp: 'dragon',
    pw: 75,
    pp: 10,
    mp: 10,
    acc: 90,
    desc: 'Exhala fuego ancestral. Potente pero algo impreciso.',
  },
  {
    nm: 'Garra Umbría',
    tp: 'dragon',
    pw: 60,
    pp: 15,
    mp: 15,
    acc: 95,
    ef: 'flinch15',
    desc: 'Zarpazo oscuro. 15% de hacer retroceder al rival.',
  },
  {
    nm: 'Pulso Dragón',
    tp: 'dragon',
    pw: 65,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'neverMiss',
    desc: 'Pulso de energía dracónica. Nunca falla.',
  },
  {
    nm: 'Furia Dragón',
    tp: 'dragon',
    pw: 40,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'fixedDmg',
    desc: 'Rabia pura. Siempre hace exactamente 40 de daño fijo.',
  },
  {
    nm: 'Cola Férrea',
    tp: 'dragon',
    pw: 70,
    pp: 10,
    mp: 10,
    acc: 90,
    ef: 'selfSpdDn',
    desc: 'Coletazo de hierro. Potente pero baja tu SPD -1.',
  },
  {
    nm: 'Danza Dragón',
    tp: 'dragon',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'atkSpdUp',
    desc: 'Danza ancestral. ATK y SPD suben +1.',
  },
  {
    nm: 'Mirada Dragón',
    tp: 'dragon',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'atkDn2',
    desc: 'Mirada intimidante. Baja ATK del rival -2.',
  },
  {
    nm: 'Escama Protectora',
    tp: 'dragon',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'shield1',
    desc: 'Se cubre con escamas. El próximo ataque recibido hace -50% daño.',
  },
  // === HADA ===
  {
    nm: 'Brillo Lunar',
    tp: 'fairy',
    pw: 40,
    pp: 25,
    mp: 25,
    acc: 100,
    desc: 'Rayo de luz de luna. Ataque básico de hada.',
  },
  {
    nm: 'Rayo Feérico',
    tp: 'fairy',
    pw: 70,
    pp: 12,
    mp: 12,
    acc: 90,
    desc: 'Rayo de energía feérica concentrada. Potente.',
  },
  {
    nm: 'Beso Drenaje',
    tp: 'fairy',
    pw: 50,
    pp: 15,
    mp: 15,
    acc: 100,
    ef: 'drain25',
    desc: 'Beso que roba energía. Recupera 25% del daño causado.',
  },
  {
    nm: 'Voz Cautivadora',
    tp: 'fairy',
    pw: 55,
    pp: 15,
    mp: 15,
    acc: 95,
    ef: 'confuse20',
    desc: 'Canto hipnótico. 20% de confundir al rival.',
  },
  {
    nm: 'Fuerza Lunar',
    tp: 'fairy',
    pw: 70,
    pp: 10,
    mp: 10,
    acc: 90,
    ef: 'atkDn',
    desc: 'Poder de la luna llena. Baja ATK del rival -1.',
  },
  {
    nm: 'Dulce Aroma',
    tp: 'fairy',
    pw: 45,
    pp: 20,
    mp: 20,
    acc: 100,
    ef: 'atkDn30',
    desc: 'Aroma dulce que relaja. 30% de bajar ATK rival.',
  },
  {
    nm: 'Deseo',
    tp: 'fairy',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'wishHeal',
    desc: 'Pide un deseo. Al turno siguiente recupera 50% de HP máximo.',
  },
  {
    nm: 'Encanto Total',
    tp: 'fairy',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'atkDn2',
    desc: 'Encanto irresistible. Baja ATK del rival -2.',
  },
  {
    nm: 'Campo Mágico',
    tp: 'fairy',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'fairyUp',
    desc: 'Crea campo mágico por 5 turnos. Hada +50%.',
  },
  {
    nm: 'Neblina Feérica',
    tp: 'fairy',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'clearStatus',
    desc: 'Neblina curativa. Elimina todos los estados alterados propios.',
  },
  // === NORMAL ===
  {
    nm: 'Embestida',
    tp: 'normal',
    pw: 35,
    pp: 30,
    mp: 30,
    acc: 100,
    desc: 'Embestida física básica.',
  },
  {
    nm: 'Picotazo',
    tp: 'normal',
    pw: 35,
    pp: 30,
    mp: 30,
    acc: 100,
    desc: 'Picotazo rápido y preciso.',
  },
  {
    nm: 'Placaje',
    tp: 'normal',
    pw: 35,
    pp: 30,
    mp: 30,
    acc: 100,
    desc: 'Placaje con todo el cuerpo.',
  },
  {
    nm: 'Aleteo',
    tp: 'normal',
    pw: 45,
    pp: 20,
    mp: 20,
    acc: 95,
    desc: 'Golpe con alas extendidas.',
  },
  {
    nm: 'Cola Látigo',
    tp: 'normal',
    pw: 35,
    pp: 30,
    mp: 30,
    acc: 100,
    desc: 'Latigazo con la cola.',
  },
  {
    nm: 'Toque Mágico',
    tp: 'normal',
    pw: 35,
    pp: 30,
    mp: 30,
    acc: 100,
    desc: 'Toque con energía mágica sutil.',
  },
  {
    nm: 'Regenerar',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'heal',
    desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
  },
  {
    nm: 'Síntesis',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'heal',
    desc: 'Absorbe luz solar. Recupera 35% de HP máximo.',
  },
  {
    nm: 'Velocidad Extrema',
    tp: 'normal',
    pw: 60,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'priority',
    desc: 'Ataque a velocidad extrema. Siempre golpea primero.',
  },
  {
    nm: 'Golpe Cuerpo',
    tp: 'normal',
    pw: 70,
    pp: 15,
    mp: 15,
    acc: 95,
    ef: 'paralyze20',
    desc: 'Golpe con todo el cuerpo. 20% de paralizar.',
  },
  {
    nm: 'Doble Golpe',
    tp: 'normal',
    pw: 30,
    pp: 15,
    mp: 15,
    acc: 90,
    ef: 'hitTwice',
    desc: 'Golpea dos veces seguidas. Daño x2.',
  },
  {
    nm: 'Danza Espada',
    tp: 'normal',
    pw: 0,
    pp: 15,
    mp: 15,
    acc: 100,
    ef: 'atkUp2',
    desc: 'Danza guerrera. Sube ATK +2.',
  },
  {
    nm: 'Agilidad',
    tp: 'normal',
    pw: 0,
    pp: 15,
    mp: 15,
    acc: 100,
    ef: 'spdUp2',
    desc: 'Relaja los músculos. Sube SPD +2.',
  },
  {
    nm: 'Protección',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'protect',
    desc: 'Se protege completamente. Bloquea el próximo ataque.',
  },
  {
    nm: 'Inversión',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'reversal',
    desc: 'Contraataque desesperado. Más daño cuanto menos HP tengas.',
  },
  {
    nm: 'Espejo',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'mirror',
    desc: 'Refleja el último ataque recibido.',
  },
  {
    nm: 'Mimético',
    tp: 'normal',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'copyLast',
    desc: 'Copia el último movimiento usado por el rival.',
  },
  {
    nm: 'Venganza',
    tp: 'normal',
    pw: 60,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'revenge',
    desc: 'Si recibiste daño este turno, el poder se duplica.',
  },
  {
    nm: 'Maldición',
    tp: 'normal',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'curse',
    desc: 'Sacrifica 50% de tu HP para maldecir al rival. Pierde 12% HP/turno.',
  },
  {
    nm: 'Golpe Divino',
    tp: 'normal',
    pw: 80,
    pp: 8,
    mp: 8,
    acc: 90,
    desc: 'Golpe imbuido con energía celestial. Muy potente.',
  },
  {
    nm: 'Aura Celestial',
    tp: 'normal',
    pw: 0,
    pp: 5,
    mp: 5,
    acc: 100,
    ef: 'healAll',
    desc: 'Aura sagrada. Cura 20% HP a todo el equipo.',
  },
  {
    nm: 'Relevo',
    tp: 'normal',
    pw: 0,
    pp: 10,
    mp: 10,
    acc: 100,
    ef: 'batonPass',
    desc: 'Pasa los cambios de stats al compañero que entre.',
  },
];

// === CREATURE CLASS ===
class Cre {
  constructor(id, lv = 1, mix = false) {
    const d = CDB[id];
    if (!CDB[id]) {
      console.error('ID NO ENCONTRADO:', id);
      return;
    }

    this.id = id;
    this.nm = d.nm;
    this.tp = d.tp;
    this.lv = lv;
    this.ex = 0;
    this.exTo = lv * 30 + 20;
    this.bHp = d.hp;
    this.bAk = d.ak;
    this.bDf = d.df;
    this.bSp = d.sp;
    this.calc();
    this.hp = this.mHp;
    this.mv = mix ? this.mixMv() : this.gMv();
    this.fought = false;
  }

  calc() {
    this.mHp = Math.floor(this.bHp + this.lv * 6 + this.lv * this.lv * 0.3);
    this.ak = Math.floor(this.bAk + this.lv * 2.5);
    this.df = Math.floor(this.bDf + this.lv * 2);
    this.sp = Math.floor(this.bSp + this.lv * 1.5);
  }

  gMv() {
    const m = {
      fire: [
        {
          nm: 'Escupitajo Ardiente',
          tp: 'fire',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Escupe una chispa ardiente básica al enemigo.',
        },
        {
          nm: 'Picotazo',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Picotazo rápido y preciso.',
        },
        {
          nm: 'Bola Ígnea',
          tp: 'fire',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Una esfera de fuego concentrado. Potente pero algo imprecisa.',
        },
        {
          nm: 'Aleteo',
          tp: 'normal',
          pw: 45,
          pp: 20,
          mp: 20,
          acc: 95,
          desc: 'Golpe con alas extendidas.',
        },
      ],
      water: [
        {
          nm: 'Chorro',
          tp: 'water',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Dispara un chorro de agua básico al enemigo.',
        },
        {
          nm: 'Placaje',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Placaje con todo el cuerpo.',
        },
        {
          nm: 'Hidrobomba',
          tp: 'water',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 85,
          desc: 'Torrente de agua a presión. Potente pero imprecisa.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
      ],
      plant: [
        {
          nm: 'Hoja Afilada',
          tp: 'plant',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Lanza hojas cortantes al enemigo.',
        },
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
        {
          nm: 'Tormenta Floral',
          tp: 'plant',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Tormenta de pétalos afilados. Potente pero algo imprecisa.',
        },
        {
          nm: 'Síntesis',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Absorbe luz solar. Recupera 35% de HP máximo.',
        },
      ],
      dragon: [
        {
          nm: 'Garra Dragón',
          tp: 'dragon',
          pw: 45,
          pp: 20,
          mp: 20,
          acc: 100,
          desc: 'Zarpazo con garras de dragón. Ataque básico.',
        },
        {
          nm: 'Cola Látigo',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Latigazo con la cola.',
        },
        {
          nm: 'Aliento Dragón',
          tp: 'dragon',
          pw: 75,
          pp: 10,
          mp: 10,
          acc: 90,
          desc: 'Exhala fuego ancestral. Potente pero algo impreciso.',
        },
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
      ],
      fairy: [
        {
          nm: 'Brillo Lunar',
          tp: 'fairy',
          pw: 40,
          pp: 25,
          mp: 25,
          acc: 100,
          desc: 'Rayo de luz de luna. Ataque básico de hada.',
        },
        {
          nm: 'Toque Mágico',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Toque con energía mágica sutil.',
        },
        {
          nm: 'Rayo Feérico',
          tp: 'fairy',
          pw: 70,
          pp: 12,
          mp: 12,
          acc: 90,
          desc: 'Rayo de energía feérica concentrada. Potente.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
      ],
      normal: [
        {
          nm: 'Embestida',
          tp: 'normal',
          pw: 35,
          pp: 30,
          mp: 30,
          acc: 100,
          desc: 'Embestida física básica.',
        },
        {
          nm: 'Regenerar',
          tp: 'normal',
          pw: 0,
          pp: 10,
          mp: 10,
          acc: 100,
          ef: 'heal',
          desc: 'Concentra energía vital. Recupera 35% de HP máximo.',
        },
        {
          nm: 'Golpe Divino',
          tp: 'normal',
          pw: 80,
          pp: 8,
          mp: 8,
          acc: 90,
          desc: 'Golpe imbuido con energía celestial. Muy potente.',
        },
        {
          nm: 'Aura Celestial',
          tp: 'normal',
          pw: 0,
          pp: 5,
          mp: 5,
          acc: 100,
          ef: 'healAll',
          desc: 'Aura sagrada. Cura 20% HP a todo el equipo.',
        },
      ],
    };
    return m[this.tp] || m.fire;
  }

  mixMv() {
    return [...ALL_MOVES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((m) => ({ ...m, pp: m.mp }));
  }

  addEx(a) {
    this.ex += a;
    let l = false;
    while (this.ex >= this.exTo) {
      this.ex -= this.exTo;
      this.lv++;
      this.exTo = this.lv * 30 + 20;
      this.calc();
      this.hp = this.mHp;
      l = true;
    }
    return { leveled: l };
  }

  heal(a) {
    this.hp = Math.min(this.mHp, this.hp + a);
  }

  full() {
    this.hp = this.mHp;
    this.mv.forEach((m) => (m.pp = m.mp));
    this.fought = false;
  }

  toJSON() {
    return {
      id: this.id,
      lv: this.lv,
      hp: this.hp,
      ex: this.ex,
      mv: this.mv.map((m) => ({
        nm: m.nm,
        tp: m.tp,
        pw: m.pw,
        pp: m.pp,
        mp: m.mp,
        acc: m.acc || 100,
        ef: m.ef || null,
        desc: m.desc || '',
      })),
    };
  }

  static fromJSON(j) {
    const c = new Cre(j.id, j.lv);
    c.hp = j.hp;
    c.ex = j.ex;
    if (j.mv) {
      // Restaurar movimientos completos guardados
      c.mv = j.mv.map((savedMv) => {
        // Migrar nombres antiguos de partidas guardadas
        const savedName = savedMv.nm === 'Llamarada' ? 'Escupitajo Ardiente' : savedMv.nm;
        // Buscar el movimiento completo en ALL_MOVES o en los defaults
        const fullMove = ALL_MOVES.find((m) => m.nm === savedName);
        if (fullMove) {
          return { ...fullMove, pp: savedMv.pp };
        }
        // Si no se encuentra en ALL_MOVES, buscar en los movimientos por defecto
        const defaultMv = c.mv.find((m) => m.nm === savedName);
        if (defaultMv) {
          return { ...defaultMv, pp: savedMv.pp };
        }
        // Fallback: devolver lo que se guardó
        return savedMv;
      });
    }
    return c;
  }
}

// === POOL DE ATAQUES POR NIVEL Y TIPO ===

const LEARN_POOL = {
  fire: [
    {
      lv: 3,
      mv: {
        nm: 'Nitrocarga',
        tp: 'fire',
        pw: 50,
        pp: 20,
        mp: 20,
        acc: 100,
        ef: 'spdUp',
        desc: 'Embiste envuelto en llamas. Sube tu velocidad +1.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Lluvia Ígnea',
        tp: 'fire',
        pw: 50,
        pp: 15,
        mp: 15,
        acc: 95,
        ef: 'burn20',
        desc: 'Lluvia de brasas ardientes. 20% de quemar al rival.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Pantalla Humo',
        tp: 'fire',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'accDn',
        desc: 'Crea una cortina de humo. Baja precisión del rival.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Voluntad Ardiente',
        tp: 'fire',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'atkSpdUpDefDn',
        desc: 'Enciende tu espíritu. ATK y SPD +1, pero DEF -1.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Golpe Volcán',
        tp: 'fire',
        pw: 75,
        pp: 10,
        mp: 10,
        acc: 90,
        ef: 'selfDefDn',
        desc: 'Golpe con furia volcánica. Baja tu propia defensa -1.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Día Soleado',
        tp: 'fire',
        pw: 0,
        pp: 5,
        mp: 5,
        acc: 100,
        ef: 'sunUp',
        desc: 'Intensifica el sol por 5 turnos. Fuego +50%, Agua -50%.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Explosión Solar',
        tp: 'fire',
        pw: 90,
        pp: 5,
        mp: 5,
        acc: 85,
        ef: 'charge',
        desc: 'Concentra energía solar y explota. Muy potente pero imprecisa.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Danza Espada',
        tp: 'normal',
        pw: 0,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'atkUp2',
        desc: 'Danza guerrera. Sube ATK +2.',
      },
    },
  ],
  water: [
    {
      lv: 3,
      mv: {
        nm: 'Rayo Burbuja',
        tp: 'water',
        pw: 45,
        pp: 20,
        mp: 20,
        acc: 100,
        ef: 'spdDn30',
        desc: 'Burbujas que explotan. 30% de bajar SPD rival.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Aqua Jet',
        tp: 'water',
        pw: 40,
        pp: 20,
        mp: 20,
        acc: 100,
        ef: 'priority',
        desc: 'Ataque rápido de agua. Siempre golpea primero.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Refugio',
        tp: 'water',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'defUp2',
        desc: 'Se refugia en su caparazón. DEF sube +2.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Cascada',
        tp: 'water',
        pw: 65,
        pp: 15,
        mp: 15,
        acc: 95,
        ef: 'flinch20',
        desc: 'Cae agua como cascada. 20% de hacer retroceder.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Danza Lluvia',
        tp: 'water',
        pw: 0,
        pp: 5,
        mp: 5,
        acc: 100,
        ef: 'rainUp',
        desc: 'Invoca lluvia por 5 turnos. Agua +50%, Fuego -50%.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Torbellino',
        tp: 'water',
        pw: 55,
        pp: 10,
        mp: 10,
        acc: 90,
        ef: 'trap2',
        desc: 'Atrapa al rival en un remolino por 2 turnos.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Niebla',
        tp: 'water',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'accDnBoth',
        desc: 'Cubre el campo de niebla. Baja precisión de ambos.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Agilidad',
        tp: 'normal',
        pw: 0,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'spdUp2',
        desc: 'Relaja los músculos. Sube SPD +2.',
      },
    },
  ],
  plant: [
    {
      lv: 3,
      mv: {
        nm: 'Látigo Cepa',
        tp: 'plant',
        pw: 55,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'defDn',
        desc: 'Azota con lianas. Baja DEF del rival -1.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Bomba Semilla',
        tp: 'plant',
        pw: 60,
        pp: 20,
        mp: 20,
        acc: 100,
        desc: 'Lanza semillas explosivas. Daño sólido y preciso.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Drenadoras',
        tp: 'plant',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'leech4',
        desc: 'Planta semillas drenadoras por 4 turnos. Roba HP cada turno.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Hoja Navaja',
        tp: 'plant',
        pw: 50,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'highCrit',
        desc: 'Corte preciso con hoja. Alta probabilidad de crítico.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Crecimiento',
        tp: 'plant',
        pw: 0,
        pp: 20,
        mp: 20,
        acc: 100,
        ef: 'atkDefUp',
        desc: 'Absorbe nutrientes. ATK y DEF suben +1.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Gigadrenado',
        tp: 'plant',
        pw: 55,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'drain50',
        desc: 'Drena energía vital. Recupera 50% del daño causado.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Espora Sueño',
        tp: 'plant',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 75,
        ef: 'sleep2',
        desc: 'Lanza esporas somníferas. Duerme al rival 2 turnos. Imprecisa.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Campo de Flores',
        tp: 'plant',
        pw: 0,
        pp: 5,
        mp: 5,
        acc: 100,
        ef: 'healField3',
        desc: 'Crea un campo floral por 3 turnos. Cura HP cada turno.',
      },
    },
  ],
  dragon: [
    {
      lv: 3,
      mv: {
        nm: 'Garra Umbría',
        tp: 'dragon',
        pw: 60,
        pp: 15,
        mp: 15,
        acc: 95,
        ef: 'flinch15',
        desc: 'Zarpazo oscuro. 15% de hacer retroceder al rival.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Furia Dragón',
        tp: 'dragon',
        pw: 40,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'fixedDmg',
        desc: 'Rabia pura. Siempre hace exactamente 40 de daño fijo.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Escama Protectora',
        tp: 'dragon',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'shield1',
        desc: 'Se cubre con escamas. El próximo ataque recibido hace -50% daño.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Pulso Dragón',
        tp: 'dragon',
        pw: 65,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'neverMiss',
        desc: 'Pulso de energía dracónica. Nunca falla.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Danza Dragón',
        tp: 'dragon',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'atkSpdUp',
        desc: 'Danza ancestral. ATK y SPD suben +1.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Cola Férrea',
        tp: 'dragon',
        pw: 70,
        pp: 10,
        mp: 10,
        acc: 90,
        ef: 'selfSpdDn',
        desc: 'Coletazo de hierro. Potente pero baja tu SPD -1.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Mirada Dragón',
        tp: 'dragon',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'atkDn2',
        desc: 'Mirada intimidante. Baja ATK del rival -2.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Danza Espada',
        tp: 'normal',
        pw: 0,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'atkUp2',
        desc: 'Danza guerrera. Sube ATK +2.',
      },
    },
  ],
  fairy: [
    {
      lv: 3,
      mv: {
        nm: 'Dulce Aroma',
        tp: 'fairy',
        pw: 45,
        pp: 20,
        mp: 20,
        acc: 100,
        ef: 'atkDn30',
        desc: 'Aroma dulce que relaja. 30% de bajar ATK rival.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Beso Drenaje',
        tp: 'fairy',
        pw: 50,
        pp: 15,
        mp: 15,
        acc: 100,
        ef: 'drain25',
        desc: 'Beso que roba energía. Recupera 25% del daño causado.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Deseo',
        tp: 'fairy',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'wishHeal',
        desc: 'Pide un deseo. Al turno siguiente recupera 50% de HP máximo.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Voz Cautivadora',
        tp: 'fairy',
        pw: 55,
        pp: 15,
        mp: 15,
        acc: 95,
        ef: 'confuse20',
        desc: 'Canto hipnótico. 20% de confundir al rival.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Encanto Total',
        tp: 'fairy',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'atkDn2',
        desc: 'Encanto irresistible. Baja ATK del rival -2.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Fuerza Lunar',
        tp: 'fairy',
        pw: 70,
        pp: 10,
        mp: 10,
        acc: 90,
        ef: 'atkDn',
        desc: 'Poder de la luna llena. Baja ATK del rival -1.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Campo Mágico',
        tp: 'fairy',
        pw: 0,
        pp: 5,
        mp: 5,
        acc: 100,
        ef: 'fairyUp',
        desc: 'Crea campo mágico por 5 turnos. Hada +50%.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Neblina Feérica',
        tp: 'fairy',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'clearStatus',
        desc: 'Neblina curativa. Elimina todos los estados alterados propios.',
      },
    },
  ],
  normal: [
    {
      lv: 3,
      mv: {
        nm: 'Velocidad Extrema',
        tp: 'normal',
        pw: 60,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'priority',
        desc: 'Ataque a velocidad extrema. Siempre golpea primero.',
      },
    },
    {
      lv: 6,
      mv: {
        nm: 'Golpe Cuerpo',
        tp: 'normal',
        pw: 70,
        pp: 15,
        mp: 15,
        acc: 95,
        ef: 'paralyze20',
        desc: 'Golpe con todo el cuerpo. 20% de paralizar.',
      },
    },
    {
      lv: 9,
      mv: {
        nm: 'Protección',
        tp: 'normal',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'protect',
        desc: 'Se protege completamente. Bloquea el próximo ataque.',
      },
    },
    {
      lv: 12,
      mv: {
        nm: 'Doble Golpe',
        tp: 'normal',
        pw: 30,
        pp: 15,
        mp: 15,
        acc: 90,
        ef: 'hitTwice',
        desc: 'Golpea dos veces seguidas. Daño x2.',
      },
    },
    {
      lv: 15,
      mv: {
        nm: 'Venganza',
        tp: 'normal',
        pw: 60,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'revenge',
        desc: 'Si recibiste daño este turno, el poder se duplica.',
      },
    },
    {
      lv: 18,
      mv: {
        nm: 'Inversión',
        tp: 'normal',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'reversal',
        desc: 'Contraataque desesperado. Más daño cuanto menos HP tengas.',
      },
    },
    {
      lv: 21,
      mv: {
        nm: 'Espejo',
        tp: 'normal',
        pw: 0,
        pp: 10,
        mp: 10,
        acc: 100,
        ef: 'mirror',
        desc: 'Refleja el último ataque recibido.',
      },
    },
    {
      lv: 24,
      mv: {
        nm: 'Maldición',
        tp: 'normal',
        pw: 0,
        pp: 5,
        mp: 5,
        acc: 100,
        ef: 'curse',
        desc: 'Sacrifica 50% de tu HP para maldecir al rival. Pierde 12% HP/turno.',
      },
    },
  ],
};

// === VERIFICAR SI APRENDE ATAQUE AL SUBIR DE NIVEL ===
function checkLearnMove(cre) {
  const pool = LEARN_POOL[cre.tp];
  if (!pool) return null;
  const learn = pool.find((l) => l.lv === cre.lv);
  if (!learn) return null;
  if (cre.mv.some((m) => m.nm === learn.mv.nm)) return null;
  return { ...learn.mv, pp: learn.mv.mp };
}
// === SISTEMA DE EVOLUCIÓN ===
function checkEvolution(cre) {
  const data = CDB[cre.id];
  if (!data || !data.evo || !data.evoLv) return null;
  if (cre.lv >= data.evoLv) return data.evo;
  return null;
}

function evolveCre(cre) {
  const newId = checkEvolution(cre);
  if (!newId) return false;
  const newData = CDB[newId];
  if (!newData) return false;

  const oldName = cre.nm;
  cre.id = newId;
  cre.nm = newData.nm;
  cre.tp = newData.tp;
  cre.bHp = newData.hp;
  cre.bAk = newData.ak;
  cre.bDf = newData.df;
  cre.bSp = newData.sp;
  cre.calc();
  cre.hp = cre.mHp; // Curar al evolucionar

  return { oldName, newName: cre.nm };
}

// === ESTADOS DE BATALLA ===
const STATUS = {
  burn: { nm: 'Quemado', icon: '🔥', dmg: 0.06 },
  paralyze: { nm: 'Paralizado', icon: '⚡', skipChance: 0.25 },
  sleep: { nm: 'Dormido', icon: '💤', turns: 2 },
  confuse: { nm: 'Confuso', icon: '💫', selfHitChance: 0.33 },
  leech: { nm: 'Drenadoras', icon: '🌱', dmg: 0.05, turns: 4 },
  curse: { nm: 'Maldito', icon: '💀', dmg: 0.12 },
};

let battleState = {
  weather: null,
  weatherTurns: 0,
  playerStatus: null,
  playerStatusTurns: 0,
  enemyStatus: null,
  enemyStatusTurns: 0,
  playerStatMods: { atk: 0, def: 0, spd: 0 },
  enemyStatMods: { atk: 0, def: 0, spd: 0 },
  lastDmgToPlayer: 0,
  lastDmgToEnemy: 0,
  playerProtect: false,
  enemyProtect: false,
  playerShield: false,
  enemyShield: false,
  wishHealNext: false,
  learnMoveQueue: null,
};

function resetBattleState() {
  battleState = {
    weather: null,
    weatherTurns: 0,
    playerStatus: null,
    playerStatusTurns: 0,
    enemyStatus: null,
    enemyStatusTurns: 0,
    playerStatMods: { atk: 0, def: 0, spd: 0 },
    enemyStatMods: { atk: 0, def: 0, spd: 0 },
    lastDmgToPlayer: 0,
    lastDmgToEnemy: 0,
    playerProtect: false,
    enemyProtect: false,
    playerShield: false,
    enemyShield: false,
    wishHealNext: false,
    learnMoveQueue: null,
  };
}

function getModdedStat(base, mod) {
  const mults = [0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const idx = Math.max(0, Math.min(12, mod + 6));
  return Math.floor(base * mults[idx]);
}

function cDmg(a, d, m, isPlayer = true) {
  if (m.pw === 0) return { dmg: 0, crit: false, eff: 1 };
  // Check de precisión
  const acc = m.acc || 100;
  if (acc < 100 && Math.random() * 100 > acc) {
    return { dmg: 0, crit: false, eff: 1, missed: true };
  }
  if (m.ef === 'fixedDmg') return { dmg: m.pw, crit: false, eff: 1 };

  const e = tEff(m.tp, d.tp);
  const s = m.tp === a.tp ? 1.5 : 1;
  const r = 0.85 + Math.random() * 0.15;

  const critChance = m.ef === 'highCrit' ? 0.25 : 0.1;
  const crit = Math.random() < critChance;
  const critMult = crit ? 1.5 : 1;

  const atkMods = isPlayer
    ? battleState.playerStatMods
    : battleState.enemyStatMods;
  const defMods = isPlayer
    ? battleState.enemyStatMods
    : battleState.playerStatMods;
  const atkStat = getModdedStat(a.ak, atkMods.atk);
  const defStat = getModdedStat(d.df, defMods.def);

  let weatherMult = 1;
  if (battleState.weather === 'sun' && m.tp === 'fire') weatherMult = 1.5;
  if (battleState.weather === 'rain' && m.tp === 'water') weatherMult = 1.5;
  if (battleState.weather === 'fairy' && m.tp === 'fairy') weatherMult = 1.5;
  if (battleState.weather === 'sun' && m.tp === 'water') weatherMult = 0.5;
  if (battleState.weather === 'rain' && m.tp === 'fire') weatherMult = 0.5;

  const desperateMult = a.hp / a.mHp < 0.2 ? 1.3 : 1;

  let shieldMult = 1;
  if (isPlayer && battleState.enemyShield) {
    shieldMult = 0.5;
    battleState.enemyShield = false;
  }
  if (!isPlayer && battleState.playerShield) {
    shieldMult = 0.5;
    battleState.playerShield = false;
  }

  const lvFactor = (2 * a.lv) / 5 + 2;
  const raw = (lvFactor * m.pw * (atkStat / Math.max(1, defStat))) / 50 + 2;
  const dmg = Math.max(
    1,
    Math.floor(
      raw * s * e * r * critMult * weatherMult * desperateMult * shieldMult
    )
  );

  return { dmg, crit, eff: e };
}

// === GAME STATE ===
const G = {
  scr: 'title',
  curMap: 'world',
  pl: { x: 20, y: 145, d: 0, f: 0, sprint: false },
  party: [],
  gold: 200,
  pot: 5,
  rev: 2,
  crv: 3,
  bWon: 0,
  tExp: 0,
  mFriend: 0,
  bossOk: false,
  allCaught: false,
  keys: {},
  kcd: {},
  held: {},
  pts: [],
  nots: [],
  tFr: 0,
  titleSel: 0,
  titleHornPlayed: false,
  hasSave: false,
  showDex: false,
  dexSel: 0,
  supervisor: false,
  sSel: 0,
  bs: null,
  ds: null,
  ms: null,
  ss: null,
  talkedTo: {},
  allTalked: false,
  bossTeam: null,
  bossIdx: 0,
  bossDialogs: 0,
  prevPos: null,
  showMap: false, // Para mapa grande
  proaOpen: false, // Para menú de Proa
};

// === INPUT ===
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

// === PARTICLES & NOTIFICATIONS ===
function aP(x, y, c, l = 30) {
  G.pts.push({
    x,
    y,
    c,
    l,
    ml: l,
    vx: (Math.random() - 0.5) * 3,
    vy: -Math.random() * 3 - 1,
    s: 2 + Math.random() * 3,
  });
}
function aN(t, d = 150) {
  G.nots.push({ t, l: d, ml: d });
}
function uP() {
  G.pts = G.pts.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.l--;
    return p.l > 0;
  });
  G.nots = G.nots.filter((n) => {
    n.l--;
    return n.l > 0;
  });
}

// === SKIN COLORS ===
const SK = {
  a: '#F0C8A0', // Piel clara estándar
  b: '#E0B888', // Piel media
  c: '#C89868', // Piel oscura (Roberto)
  d: '#F8DCC8', // Piel muy clara (Angelly)
  e: '#D0A070', // Piel morena
};
// ============================================================
// BLOQUE 2: UI COMPLETA
// ============================================================

function px(x, y, w, h, c) {
  cx.fillStyle = c;
  cx.fillRect(x, y, w, h);
}

function pixelGlow(cx0, cy0, w, h) {
  // Brillo/sombra 100% pixel-art: sin círculos ni elipses suaves.
  const x = Math.round(cx0), y = Math.round(cy0);
  const ww = Math.max(2, Math.round(w)), hh = Math.max(2, Math.round(h));
  cx.fillRect(x - ww, y - Math.floor(hh * 0.35), ww * 2, Math.max(1, Math.floor(hh * 0.7)));
  cx.fillRect(x - Math.floor(ww * 0.7), y - Math.floor(hh * 0.65), Math.floor(ww * 1.4), Math.max(1, Math.floor(hh * 1.3)));
  cx.fillRect(x - Math.floor(ww * 0.35), y - hh, Math.floor(ww * 0.7), hh * 2);
}

function pixelDiamond(x, y, w, h, c) {
  // Diamante/trapecio por franjas rectangulares, estilo pixel-art.
  const rows = 6;
  for (let i = 0; i < rows; i++) {
    const t = i < rows / 2 ? i / (rows / 2) : (rows - 1 - i) / (rows / 2);
    const rw = Math.max(2, Math.round(w * (0.25 + t * 0.75)));
    const ry = y + Math.round((h / rows) * i);
    px(x + Math.round((w - rw) / 2), ry, rw, Math.ceil(h / rows), c);
  }
}

// === CAJA DORADA MEDIEVAL (HUD del mundo) ===
function dBox(x, y, w, h, t) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(x + 3, y + 3, w, h);
  // Fondo azul oscuro
  cx.fillStyle = '#1a1a3e';
  cx.fillRect(x, y, w, h);
  // Borde dorado
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 3;
  cx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  cx.strokeStyle = '#6a4a0a';
  cx.lineWidth = 1;
  cx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  // Esquinas decorativas
  px(x, y, 6, 6, '#ffd700');
  px(x + w - 6, y, 6, 6, '#ffd700');
  px(x, y + h - 6, 6, 6, '#ffd700');
  px(x + w - 6, y + h - 6, 6, 6, '#ffd700');
  // Título si existe
  if (t) {
    cx.fillStyle = '#1a1a3e';
    cx.fillRect(x + 14, y - 8, t.length * 8 + 10, 16);
    cx.strokeStyle = '#8b6914';
    cx.lineWidth = 2;
    cx.strokeRect(x + 14, y - 8, t.length * 8 + 10, 16);
    cx.fillStyle = '#ffd700';
    cx.font = '9px "Press Start 2P"';
    cx.fillText(t, x + 20, y + 4);
  }
}

// === CAJA MENÚ/TIENDA (azul noche con dorado) ===
function dBoxMenu(x, y, w, h, t) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(x + 4, y + 4, w, h);
  // Fondo azul noche
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(x, y, w, h);
  // Borde dorado exterior grueso
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 4;
  cx.strokeRect(x, y, w, h);
  // Borde dorado interior
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 2;
  cx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  // Esquinas decorativas doradas
  px(x, y, 8, 8, '#ffd700');
  px(x + w - 8, y, 8, 8, '#ffd700');
  px(x, y + h - 8, 8, 8, '#ffd700');
  px(x + w - 8, y + h - 8, 8, 8, '#ffd700');
  // Detalle interno en esquinas
  px(x + 2, y + 2, 4, 4, '#1a1a3e');
  px(x + w - 6, y + 2, 4, 4, '#1a1a3e');
  px(x + 2, y + h - 6, 4, 4, '#1a1a3e');
  px(x + w - 6, y + h - 6, 4, 4, '#1a1a3e');
  // Título
  if (t) {
    cx.fillStyle = '#0a0a2e';
    const titleW = t.length * 11 + 22;
    cx.fillRect(x + 20, y - 10, titleW, 20);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.strokeRect(x + 20, y - 10, titleW, 20);
    cx.fillStyle = '#fff';
    cx.font = '10px "Press Start 2P"';
    cx.fillText(t, x + 28, y + 4);
  }
}

// === CAJA DE DIÁLOGO (blanca con borde negro) ===
function dDialogBox(x, y, w, h, name) {
  // Borde negro exterior
  cx.fillStyle = '#000';
  cx.fillRect(x, y, w, h);
  // Fondo blanco
  cx.fillStyle = '#F8F8F8';
  cx.fillRect(x + 3, y + 3, w - 6, h - 6);
  // Bordes interiores sutiles
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + 2, w - 4, 1);
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + h - 3, w - 4, 1);
  cx.fillStyle = '#000';
  cx.fillRect(x + 2, y + 2, 1, h - 4);
  cx.fillStyle = '#000';
  cx.fillRect(x + w - 3, y + 2, 1, h - 4);
  // Nombre del NPC arriba si existe
  if (name) {
    const nameW = name.length * 9 + 14;
    cx.fillStyle = '#000';
    cx.fillRect(x + 10, y - 18, nameW, 20);
    cx.fillStyle = '#F8F8F8';
    cx.fillRect(x + 12, y - 16, nameW - 4, 16);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(name, x + 18, y - 4);
  }
}

// === BARRA DE HP estilo GBA ===
function dHP(x, y, w, h, c, m) {
  const r = c / m;
  const co = r > 0.5 ? '#30D848' : r > 0.25 ? '#E8C020' : '#E03020';
  // Borde negro
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, w + 2, h + 2);
  // Fondo
  cx.fillStyle = '#383838';
  cx.fillRect(x, y, w, h);
  // Barra de vida
  cx.fillStyle = co;
  cx.fillRect(x, y, Math.max(0, w * r), h);
  // Brillo superior
  cx.fillStyle = 'rgba(255,255,255,.3)';
  cx.fillRect(x, y, Math.max(0, w * r), Math.floor(h / 2));
  // Label HP
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('HP', x - 18, y + h);
  // Texto numérico
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${c}/${m}`, x + w + 4, y + h);
}

// === BARRA DE EXP ===
function dEXP(x, y, w, h, c, m) {
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, w + 2, h + 2);
  cx.fillStyle = '#383838';
  cx.fillRect(x, y, w, h);
  cx.fillStyle = '#3888E0';
  cx.fillRect(x, y, w * (c / m), h);
  cx.fillStyle = 'rgba(255,255,255,.3)';
  cx.fillRect(x, y, w * (c / m), 1);
}

// === PANEL DE BATALLA (enemigo arriba / jugador abajo) ===
function dBattlePanel(x, y, w, h, isEnemy) {
  // Sombra
  cx.fillStyle = 'rgba(0,0,0,.5)';
  cx.fillRect(x + 3, y + 3, w, h);
  // Fondo según lado
  cx.fillStyle = isEnemy ? '#2a1a3e' : '#1a2a4e';
  cx.fillRect(x, y, w, h);
  // Borde dorado
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 2;
  cx.strokeRect(x, y, w, h);
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 1;
  cx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  // Esquinas
  px(x, y, 4, 4, '#ffd700');
  px(x + w - 4, y, 4, 4, '#ffd700');
  px(x, y + h - 4, 4, 4, '#ffd700');
  px(x + w - 4, y + h - 4, 4, 4, '#ffd700');
}

// === CAJA DE DIÁLOGO ADAPTATIVA ===
// Calcula altura según líneas y centra texto verticalmente
function dDialogAdaptive(x, y, w, lines, name) {
  const padY = 14,
    lineH = 15;
  const h = padY * 2 + Math.max(1, lines.length) * lineH + 4;
  dDialogBox(x, y, w, h, name);
  return { x, y, w, h };
}

// === SEPARAR TEXTO EN LÍNEAS según ancho ===
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + word).length > maxChars) {
      if (current) lines.push(current.trim());
      current = word + ' ';
    } else {
      current += word + ' ';
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

// === BOTÓN/OPCIÓN DE MENÚ ===
function dMenuOption(x, y, text, selected, color = '#fff') {
  cx.fillStyle = selected ? '#ffd700' : color;
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${selected ? '▶ ' : '  '}${text}`, x, y);
}

// === ICONO DE TIPO DE CRIATURA ===
function dTypeIcon(x, y, tp) {
  const c = tCol(tp);
  cx.fillStyle = '#000';
  cx.fillRect(x - 1, y - 1, 38, 12);
  cx.fillStyle = c;
  cx.fillRect(x, y, 36, 10);
  cx.fillStyle = '#fff';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(tNam(tp), x + 2, y + 8);
}


// === BOTÓN DE ATAQUE ESTILO RPG CLÁSICO ===
const MOVE_UI_COLORS = {
  fire: ['#E04030', '#8C1F18'],
  water: ['#3888E0', '#1B4F93'],
  plant: ['#48A038', '#246A22'],
  dragon: ['#6838A0', '#3E206E'],
  fairy: ['#D860A8', '#8E336C'],
  normal: ['#A8A878', '#6E704A'],
  ice: ['#70C8E8', '#3B86A0'],
  ground: ['#C09050', '#79572D'],
  fighting: ['#C85038', '#7D2D22'],
  electric: ['#E8C830', '#9A7B15'],
  psychic: ['#E85888', '#943354'],
  dark: ['#584838', '#30261E'],
  steel: ['#A8A8C0', '#686878'],
  poison: ['#A040A0', '#642064'],
  bug: ['#90A820', '#566812'],
  rock: ['#B8A038', '#75651F'],
  ghost: ['#705898', '#42315D'],
};
function moveUiCol(tp, dark = false) {
  const pair = MOVE_UI_COLORS[tp] || [tCol(tp), '#555'];
  return pair[dark ? 1 : 0];
}
function movePpColor(pp, max) {
  const r = max > 0 ? pp / max : 0;
  if (pp <= 0 || r <= 0.2) return '#D02020';
  if (r <= 0.5) return '#C89000';
  return '#1A1A1A';
}
function dMoveButton(x, y, w, h, mv, selected) {
  const disabled = mv.pp <= 0;
  const main = disabled ? '#777' : moveUiCol(mv.tp);
  const dark = disabled ? '#444' : moveUiCol(mv.tp, true);
  const inner = disabled ? '#C8C8C0' : '#E6EAD8';
  const inner2 = disabled ? '#A8A8A0' : '#D2D9C4';

  // sombra externa + relieve por capas, con esquinas pixeladas
  px(x + 3, y + 4, w - 3, h - 2, 'rgba(0,0,0,.45)');
  px(x + 3, y, w - 6, h, dark);
  px(x, y + 3, w, h - 6, dark);
  px(x + 4, y + 1, w - 8, h - 2, main);
  px(x + 1, y + 4, w - 2, h - 8, main);
  // brillo superior/izquierdo
  px(x + 5, y + 3, w - 10, 2, selected ? '#FFF2A0' : 'rgba(255,255,255,.35)');
  px(x + 3, y + 5, 2, h - 10, 'rgba(255,255,255,.25)');
  // sombra inferior/derecha
  px(x + 5, y + h - 5, w - 10, 3, dark);
  px(x + w - 5, y + 5, 3, h - 10, dark);

  // interior común
  px(x + 8, y + 8, w - 16, h - 16, inner);
  px(x + 10, y + 10, w - 20, h - 20, inner2);
  px(x + 10, y + 10, w - 20, 2, 'rgba(255,255,255,.45)');

  if (selected) {
    px(x + 8, y + 6, 8, 3, '#FFE870');
    px(x + w - 16, y + 6, 8, 3, '#FFE870');
    px(x + 8, y + h - 9, 8, 3, '#FFE870');
    px(x + w - 16, y + h - 9, 8, 3, '#FFE870');
  }

  // Nombre centrado arriba
  cx.textAlign = 'center';
  cx.fillStyle = disabled ? '#666' : '#1A1A1A';
  cx.font = mv.nm.length > 15 ? '6px "Press Start 2P"' : '7px "Press Start 2P"';
  cx.fillText(mv.nm, x + w / 2, y + 19);
  cx.textAlign = 'left';

  // Cápsula de tipo abajo izquierda
  const pillX = x + 13,
    pillY = y + h - 18,
    pillW = 62,
    pillH = 12;
  px(pillX + 3, pillY, pillW - 6, pillH, dark);
  px(pillX, pillY + 3, pillW, pillH - 6, dark);
  px(pillX + 4, pillY + 2, pillW - 8, pillH - 4, main);
  cx.fillStyle = '#fff';
  cx.font = '5px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(tNam(mv.tp), pillX + pillW / 2, pillY + 8);
  cx.textAlign = 'left';

  // PP abajo derecha
  cx.fillStyle = movePpColor(mv.pp, mv.mp);
  cx.font = '6px "Press Start 2P"';
  cx.textAlign = 'right';
  cx.fillText(`PP ${mv.pp}/${mv.mp}`, x + w - 13, y + h - 9);
  cx.textAlign = 'left';
}

// === FLECHA INDICADORA ANIMADA ===
function dArrow(x, y, color = '#ffd700') {
  cx.fillStyle = color;
  cx.font = '10px "Press Start 2P"';
  cx.fillText('▼', x, y + Math.sin(fr * 0.2) * 2);
}

// === SOMBRA PIXELADA (para sprites) ===
function dShadow(x, y, w = 10, h = 3) {
  cx.fillStyle = 'rgba(0,0,0,.25)';
  pixelGlow(x, y, w, h);
}


function dRouteTree(x, y, f) {
  // Árbol de bloqueo: hace que solo exista el camino central.
  dShadow(x + 16, y + 29, 12, 4);
  px(x + 13, y + 18, 7, 12, '#6A4828');
  px(x + 11, y + 22, 11, 8, '#7A5630');
  px(x + 6, y + 7, 20, 14, '#185C2A');
  px(x + 3, y + 13, 26, 12, '#20743A');
  px(x + 8, y + 3, 16, 10, '#2B8A45');
  px(x + 10, y + 9, 8, 5, '#45A85A');
  px(x + 22, y + 16, 4, 4, '#145020');
}

function dRouteProa(x, y, f) {
  // Proa guardián en el único hueco del camino.
  dShadow(x + 16, y + 31, 9, 3);
  const by = y + Math.sin(f * 0.08) * 0.8;
  px(x + 10, by + 26, 4, 4, '#4A3018');
  px(x + 18, by + 26, 4, 4, '#4A3018');
  px(x + 8, by + 18, 16, 9, '#2858A0');
  // Uniforme del personal: polo negro con flecha amarilla pequeña
  px(x + 6, by + 10, 20, 10, '#101010');
  px(x + 8, by + 12, 16, 7, '#1A1A1A');
  px(x + 13, by + 13, 6, 2, '#FFD830');
  px(x + 17, by + 11, 3, 6, '#FFD830');
  px(x + 4, by + 12, 4, 8, SK.a);
  px(x + 24, by + 12, 4, 8, SK.a);
  px(x + 13, by + 8, 6, 3, SK.a);
  px(x + 9, by + 0, 14, 10, SK.a);
  px(x + 10, by + 1, 12, 8, SK.d);
  px(x + 7, by - 3, 18, 5, '#2A5830');
  px(x + 5, by - 1, 22, 3, '#3A7A40');
  px(x + 12, by + 4, 3, 3, '#111');
  px(x + 18, by + 4, 3, 3, '#111');
  px(x + 14, by + 8, 4, 1, '#C08868');
  if (f % 40 < 20) {
    cx.fillStyle = '#ffd700';
    cx.font = '9px "Press Start 2P"';
    cx.fillText('!', x + 26, by - 5);
  }
}


function dRouteSign(x, y, f) {
  dShadow(x + 16, y + 29, 8, 3);
  px(x + 14, y + 15, 4, 16, '#6A4828');
  px(x + 7, y + 6, 22, 12, '#8A5A28');
  px(x + 9, y + 8, 18, 8, '#C09048');
  px(x + 10, y + 9, 16, 1, '#E0B060');
  px(x + 11, y + 12, 10, 2, '#5A3818');
  px(x + 23, y + 11, 2, 3, '#5A3818');
  if (f % 60 < 30) px(x + 24, y + 5, 2, 2, '#ffd700');
}

function dFallenPortrait(id, x, y, sc = 4) {
  cx.save();
  cx.translate(x, y);
  cx.scale(sc, sc);
  const R = (a, b, w, h, c) => px(a, b, w, h, c);
  const SK1 = '#F0C8A0', SK2 = '#D9A77E', OUT = '#171717';
  // marco interno de personaje 24x32
  if (id === 'rafa') {
    R(7, 27, 4, 4, '#506858'); R(14, 27, 4, 4, '#506858');
    R(7, 20, 4, 8, '#607868'); R(14, 20, 4, 8, '#607868');
    R(5, 12, 16, 9, '#D8C8A0'); R(7, 13, 12, 7, '#E8D8B8');
    R(4, 13, 4, 8, SK1); R(18, 13, 4, 8, SK1);
    R(9, 9, 6, 4, SK2); R(6, 2, 14, 9, SK1); R(7, 3, 12, 7, '#F5D2AA');
    R(5, 0, 16, 5, '#2B2018'); R(6, -1, 14, 2, '#3A2A20');
    R(6, 5, 5, 4, OUT); R(13, 5, 5, 4, OUT); R(7, 6, 3, 2, '#C8D8E8'); R(14, 6, 3, 2, '#C8D8E8'); R(11, 6, 2, 1, OUT);
    R(10, 10, 5, 1, '#8A5040');
  } else if (id === 'maria') {
    R(8, 27, 4, 4, '#1A1A1A'); R(14, 27, 4, 4, '#1A1A1A');
    R(6, 19, 16, 9, '#171717'); R(5, 12, 18, 8, '#F0F0F0'); R(7, 13, 14, 6, '#FFFFFF');
    R(4, 13, 4, 8, SK1); R(20, 13, 4, 8, SK1);
    R(9, 9, 6, 4, SK2); R(6, 2, 14, 9, SK1); R(7, 3, 12, 7, '#F5D2AA');
    R(4, 0, 18, 6, '#111'); R(3, 3, 4, 18, '#111'); R(19, 3, 4, 18, '#111'); R(5, 16, 3, 8, '#080808'); R(20, 16, 3, 8, '#080808');
    R(7, 5, 4, 3, '#fff'); R(15, 5, 4, 3, '#fff'); R(8, 6, 2, 2, OUT); R(16, 6, 2, 2, OUT);
    R(7, 4, 5, 1, OUT); R(15, 4, 5, 1, OUT); R(11, 10, 5, 1, '#7A3030');
  } else { // mancilla
    R(7, 27, 4, 4, '#6E7788'); R(14, 27, 4, 4, '#6E7788');
    R(7, 20, 4, 8, '#8790A0'); R(14, 20, 4, 8, '#8790A0');
    R(4, 11, 18, 11, '#98A4B8'); R(6, 12, 14, 9, '#B8C4D8'); R(10, 14, 6, 5, '#E8C830');
    R(3, 11, 4, 5, '#C8A830'); R(21, 11, 4, 5, '#C8A830');
    R(9, 8, 6, 5, SK2); R(6, 1, 14, 10, SK1); R(7, 2, 12, 8, '#F5D2AA');
    R(5, -1, 16, 5, '#7A5128'); R(4, 1, 4, 6, '#6A4120'); R(18, 1, 4, 6, '#6A4120');
    R(8, 5, 3, 3, '#fff'); R(15, 5, 3, 3, '#fff'); R(9, 6, 2, 2, OUT); R(16, 6, 2, 2, OUT);
    R(11, 9, 5, 4, '#5A321C'); // chivito, sin bigote
    R(11, 9, 5, 1, '#8A5040');
  }
  cx.restore();
}

// === ASSETS DE FONDOS DE BATALLA ===
const BATTLE_BG_ASSETS = {
  forest: {
    src: 'assets/battle/forest-encounter.png',
    img: null,
    ready: false,
    failed: false,
  },
};

function initBattleBackgroundAssets() {
  if (typeof Image === 'undefined') return;
  Object.values(BATTLE_BG_ASSETS).forEach((bg) => {
    if (bg.img) return;
    const img = new Image();
    bg.img = img;
    img.onload = () => {
      bg.ready = true;
      bg.failed = false;
    };
    img.onerror = () => {
      bg.ready = false;
      bg.failed = true;
    };
    img.src = bg.src;
  });
}

function drawBattleBackgroundAsset(key) {
  const bg = BATTLE_BG_ASSETS[key];
  if (!bg || !bg.img || !bg.ready || bg.img.naturalWidth <= 0) return false;
  try {
    cx.imageSmoothingEnabled = false;
    // Efecto cover: cubre todo el canvas manteniendo proporción.
    const iw = bg.img.naturalWidth;
    const ih = bg.img.naturalHeight;
    const scale = Math.max(640 / iw, 480 / ih);
    const dw = Math.ceil(iw * scale);
    const dh = Math.ceil(ih * scale);
    const dx = Math.floor((640 - dw) / 2);
    const dy = Math.floor((480 - dh) / 2);
    cx.drawImage(bg.img, dx, dy, dw, dh);
    return true;
  } catch (e) {
    return false;
  }
}

// === FONDO ESPECIAL PARA ENCUENTRO SALVAJE EN MAPA NORMAL ===
function dWorldEncounterBG() {
  // Si existe assets/battle/forest-encounter.png, usarlo. Si no, usar fallback por código.
  if (drawBattleBackgroundAsset('forest')) return;

  // Cielo pixel-art del bosque exterior
  const gr = cx.createLinearGradient(0, 0, 0, 250);
  gr.addColorStop(0, '#6FB8E8');
  gr.addColorStop(0.55, '#B8E0F0');
  gr.addColorStop(1, '#D8F0D0');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 245);

  // Nubes cuadradas suaves, sin curvas
  for (let i = 0; i < 4; i++) {
    const nx = (i * 190 - fr * 0.18) % 780 - 80;
    const ny = 28 + (i % 2) * 34;
    cx.fillStyle = 'rgba(120,160,190,.18)';
    cx.fillRect(nx + 8, ny + 12, 92, 16);
    cx.fillStyle = '#F8F8F0';
    cx.fillRect(nx, ny + 10, 96, 14);
    cx.fillRect(nx + 18, ny + 4, 28, 15);
    cx.fillRect(nx + 48, ny, 34, 19);
    cx.fillStyle = '#DCECF0';
    cx.fillRect(nx + 4, ny + 22, 86, 3);
  }

  // Bosque profundo por capas
  cx.fillStyle = '#184A2A';
  cx.fillRect(0, 150, 640, 115);
  for (let i = 0; i < 18; i++) {
    const tx = i * 42 - ((fr * 0.05) % 42);
    const h = 44 + (i % 4) * 10;
    cx.fillStyle = i % 2 ? '#143A24' : '#1F5A32';
    cx.fillRect(tx + 10, 150 - h, 18, h + 95);
    cx.fillStyle = i % 2 ? '#20683A' : '#2A7A42';
    cx.fillRect(tx, 122 - h * 0.25, 38, 16);
    cx.fillRect(tx - 8, 135 - h * 0.25, 54, 18);
    cx.fillRect(tx + 7, 108 - h * 0.25, 26, 18);
  }
  // Árboles frontales más definidos
  for (let i = 0; i < 9; i++) {
    const tx = i * 82 - 34;
    cx.fillStyle = '#5A3818';
    cx.fillRect(tx + 36, 142, 10, 105);
    cx.fillStyle = '#6A4828';
    cx.fillRect(tx + 37, 142, 3, 105);
    cx.fillStyle = '#185C2A';
    cx.fillRect(tx + 18, 104, 48, 26);
    cx.fillStyle = '#20743A';
    cx.fillRect(tx + 10, 124, 64, 28);
    cx.fillStyle = '#2B8A45';
    cx.fillRect(tx + 25, 86, 34, 25);
    cx.fillStyle = '#45A85A';
    cx.fillRect(tx + 31, 102, 16, 8);
  }

  // Suelo exterior con hierba alta de batalla
  cx.fillStyle = '#2F7A30';
  cx.fillRect(0, 245, 640, 235);
  cx.fillStyle = '#3F8E3A';
  cx.fillRect(0, 245, 640, 8);
  for (let y = 260; y < 480; y += 18) {
    cx.fillStyle = y % 36 === 0 ? '#2A6E2A' : '#347E34';
    cx.fillRect(0, y, 640, 2);
  }
  // Parches de hierba alta frontales
  const grassCols = ['#3A9C28', '#46B030', '#60C840'];
  for (let i = 0; i < 90; i++) {
    const gx = (i * 37 + (i % 5) * 9) % 640;
    const gy = 255 + ((i * 23) % 190);
    cx.fillStyle = grassCols[i % grassCols.length];
    cx.fillRect(gx, gy, 3, 14 + (i % 4) * 4);
    cx.fillStyle = '#8FE060';
    if (i % 3 === 0) cx.fillRect(gx, gy, 3, 3);
  }

  // Plataformas estilo encuentro exterior: tierra y césped, no genéricas
  cx.fillStyle = '#8A6A3A';
  cx.fillRect(338, 177, 190, 16);
  cx.fillStyle = '#A0804A';
  cx.fillRect(346, 172, 174, 8);
  cx.fillStyle = '#3A9C28';
  cx.fillRect(342, 168, 182, 6);
  cx.fillStyle = '#5FC848';
  for (let i = 0; i < 18; i++) cx.fillRect(348 + i * 9, 164 + (i % 2) * 2, 4, 6);

  cx.fillStyle = '#8A6A3A';
  cx.fillRect(55, 307, 196, 16);
  cx.fillStyle = '#A0804A';
  cx.fillRect(64, 302, 178, 8);
  cx.fillStyle = '#3A9C28';
  cx.fillRect(60, 298, 186, 6);
  cx.fillStyle = '#5FC848';
  for (let i = 0; i < 19; i++) cx.fillRect(66 + i * 9, 294 + (i % 2) * 2, 4, 6);

  // Brillos ambientales cuadrados tipo luciérnagas
  for (let i = 0; i < 8; i++) {
    const alpha = Math.sin(fr * 0.05 + i) * 0.25 + 0.35;
    cx.globalAlpha = alpha;
    cx.fillStyle = '#F8F8C0';
    cx.fillRect((i * 79 + fr * 0.2) % 640, 180 + (i * 31) % 90, 2, 2);
  }
  cx.globalAlpha = 1;
}

// === GRADIENTE DE FONDO (para batalla) ===
function dBattleBG() {
  if (G.bs && !G.bs.isNPC && G.bs.bgMap === 'world' && !G.bs.isBoss) {
    dWorldEncounterBG();
    return;
  }
  const gr = cx.createLinearGradient(0, 0, 0, 240);
  gr.addColorStop(0, '#1a0a3a');
  gr.addColorStop(0.5, '#2a1a4a');
  gr.addColorStop(1, '#3a2a5a');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 240);

  // Nubes lejanas
  cx.fillStyle = 'rgba(255,255,255,.05)';
  cx.fillRect(50 + Math.sin(fr * 0.01) * 20, 30, 80, 20);
  cx.fillRect(350 + Math.sin(fr * 0.015) * 15, 50, 100, 25);
  cx.fillRect(200 + Math.sin(fr * 0.008) * 25, 15, 70, 15);

  // Suelo verde oscuro
  cx.fillStyle = '#2a4a1a';
  cx.fillRect(0, 240, 640, 240);
  cx.fillStyle = '#3a5a2a';
  for (let i = 0; i < 640; i += 10) cx.fillRect(i, 238, 5, 5);

  // Plataformas para criaturas
  cx.fillStyle = '#4a6a3a';
  cx.fillRect(340, 178, 180, 14); // Enemigo
  cx.fillRect(60, 308, 180, 14); // Jugador
  cx.fillStyle = '#3a5a2a';
  cx.fillRect(345, 192, 170, 4);
  cx.fillRect(65, 322, 170, 4);
}

// === FONDO PARA INTRO DE BATALLA NPC ===
function dBattleIntroBG() {
  const gr = cx.createLinearGradient(0, 0, 0, 480);
  gr.addColorStop(0, '#0a0a2e');
  gr.addColorStop(0.5, '#1a1a4e');
  gr.addColorStop(1, '#0a0a2e');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 640, 480);

  // Líneas de velocidad doradas horizontales
  for (let i = 0; i < 20; i++) {
    cx.globalAlpha = Math.sin(fr * 0.1 + i) * 0.3 + 0.3;
    cx.fillStyle = '#ffd700';
    cx.fillRect(0, i * 24 + Math.sin(fr * 0.05) * 4, 640, 1);
  }
  cx.globalAlpha = 1;

  // Estrellas centelleantes
  for (let i = 0; i < 15; i++) {
    cx.globalAlpha = Math.sin(fr * 0.08 + i * 0.5) * 0.5 + 0.5;
    cx.fillStyle = '#fff';
    cx.fillRect((i * 73 + fr * 0.5) % 640, (i * 97) % 480, 2, 2);
  }
  cx.globalAlpha = 1;
}

// === DIBUJAR NOTIFICACIONES ===
function drawNotifications() {
  G.nots.forEach((n, i) => {
    const a = Math.min(1, n.l / 30);
    const ny = 80 + i * 22;
    cx.globalAlpha = a;
    cx.fillStyle = 'rgba(0,0,0,.85)';
    cx.fillRect(160, ny, 320, 18);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 1;
    cx.strokeRect(160, ny, 320, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(n.t, 320, ny + 13);
  });
  cx.globalAlpha = 1;
  cx.textAlign = 'left';
}

// === DIBUJAR PARTÍCULAS ===
function drawParticles() {
  G.pts.forEach((p) => {
    cx.globalAlpha = p.l / p.ml;
    cx.fillStyle = p.c;
    cx.fillRect(p.x, p.y, p.s, p.s);
  });
  cx.globalAlpha = 1;
}
// ============================================================
// BLOQUE 3: SPRITE DEL JUGADOR
// ============================================================

// === NUEVO SPRITE DEL JUGADOR - ESTILO PIXEL MEDIEVAL ===
// === SPRITE DEL JUGADOR - ESTILO PIXEL ART MEDIEVAL ===
// === PROTA: sprite medieval de uso libre (OpenGameArt: "2D RPG character walk
// spritesheet" por arikel, CC-BY 4.0 / CC0). Hoja 192x128 = 8 columnas x 4 filas,
// cada marco 24x32. Filas: 0=frente(abajo), 1=espalda(arriba), 2=perfil izquierda,
// 3=perfil derecha. Ciclo de caminado: columna 0 en reposo, 1/2 en movimiento.
const HERO_FW = 24, HERO_FH = 32;
const HERO_DIR_ROW = { 0: 0, 1: 3, 2: 2, 3: 1 }; // p.d (0=abajo,1=der,2=izq,3=arr) -> fila
const HERO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAACACAYAAABdhGZrAAAZMklEQVR4nO1dQWgcx5r+xuiwLIGdQ2TBwiKPrAmBDWiiQDZmLjGLE836YJlokR68vCyERWC9hFwMEgSyDwIW+LIkUUCHB/E6EIn1EuUgj2QfnIuw1mC9EZgQLFljXR4ryRDlsuzBuPfQ8/f8XV09U1Vd1VLr9Q9Gck/P9//1/VXVVd3q7y9A0WrlXo//v751UFD9bm7JLeffjfXEfSAS/vn7BxieWAYAbCxcBG72ejaT4DrBWcPP+U8HP3YA1LcOCrVyr/f5+wd49GwEj54BWLgIAHj0bAQTNQB46Ok46xSw7QRnHT/nPx382BOIfLJHz0ZCn7/28kpwbKH+0DgJlGDC5L4W6g8BmM8WWcbP+U8HX/pBrdzr3V7+xh9JkJMPAMMTy/iPr74MnOk0xHWCs4yf858e/ikZ8ETtDQA+wY+ejeB3v/8Ir728EvykzwDgd7//SCfuwMft5W86Bs+xJ2pvRC55JxU/5z9d/MgAIICNhYvYWLgYgBDhwxPLobUWzVIm5irBWcfP+U8PP3YJNFF7IwAj+/RmLz5//wCf3uwFzVK6lzLx0kWByowvAVQvk1nHJx85/+ngRw7c+HjEW6g/BE/Apzd7AQDfffkhfvPRH4OfAILzdBvhKsFZx8/5Txc/chu0fdJDr74F1Mq9uPZeFQDw9Mefg590rDK7hBsfj4gwWtY5wSOhRpx0/Jz/dPE7PgcA4F17r4qha9+jUCjgcGUa1+CT7nkeNmcuB+frjF6XCc46PlnOfzr4kQHQjcQzb78KzCrHG2uuEpx1/Jz/dPGld4FE+3V1Bocr08H/D1em8evqjFHwSglOYFnHl1nOvzv8WLD+uZIHALtTTTSmRyPAT3/8GZXZJfTPldA6z+RpnifDlvlwiV8r95o+jXQWv2v+++dKXhy26MM1Pyb4tuKXXgH650pe88oOFgfvAvAvKbS+4sAAQOdRwjStIGKLPtZXt1Gs9jjDH2qU8dMnLxlAq+GbxO+a//65kles9mB9dTuCLfFRMOn8/XMlb6hRdoJvM/7YTfCDO08AAEONMgCgUlkKrT2HGmUcrj0PztM1PsNVZpfQQHsk8wQDwPxeHeO4YOQHQEf8+b06Jqs1wJ9RlBPhOn7X/M/v1YPfO8XP2qnFTbHag/m9Ot7CYFd+jjL+yEHZTEIzkWiTfTUcrj0PHVMhima4B3eeYLKvBgDYrGyFzqEE62KLfgCgWO2xiu8y/rT45/+P4wfwO9qb75xF6esBLX5U8Cl207zaiF96BXi6799COnN6DcVqDyZRC4DI+Mxz79x1lH5YwpnTa8qNoO8frj1H88oO4IUxsQd/Zgbw/YtrOH//qjI24JNEHWd87QJeeF447oT4LuNPg/97567j8il/Iz2/VwdW25+Rn9LXA8AgjK4ycfgcO8jP3AWtq6/N+KUD4MzpNdw7dx27w98CcyU/CX01zN9pX3Zo9tmdagIb0CIfAMa3/SVBsdqD1zdfwZ+GHksTfLj2HDinBR3xAfhkNK/s4M13zoYIOVx7jvPQ6/yu40+Df4qtWPW7AI8dAF7ffAXFag/G18yWnjTgCZ/7KH09ACCcHxOzEb90ABSrPTi/dhUACrtTTY8ngTvfnWoCQOH8/atesdoTuRx3sqf7VTQvjWKgMoahRhmvb74SWtdxX7qzM/cBAJXL/43DteehWYfj68buOv40+OcxyQYX4C/rdjZuaV9dqA0Uz2SffwV7cOdJaOJofP8PAMwGr634pQOAERmsoUVyi9Ue7LJzdDvQmdNrWDz4Nww1ytisbGGoUY4kmPvSxQeA5qVRXD41E1ofjs9diODdWPh77U2Zy/jT4J8wg05arYU+pzbt71Vw/rTeAN6dauKH6VFc+rvNED4btNgFUGn4y0Pc1x8AtuKXrbs8euhSHJkN7jMXqz3409DjYOPHNjDg58dgRnxQxyEjP7yB9HljejS4paWATXjevXPXMTA8FnqIRG2SbJx01qAu40+FfxZT3IY9+J21VYsj/n3q/GIudjZu4fz9q7obYWvxSwdAY3oUgH97aWfjFoDoZfzeuesAgIHhMfDzYzAjPgBEyHjhedIEd4i1o/GHJWR071/A18V2GX8a/Adt4AOMNtqnWn9WwNum2YbAB8ffrGxFcpHkIaeN+OMcB6OXEkA2MDwWOjYwPKaCJ/UhI4OMJ1gTN+KH/4dmHAv4LuNPg38A8GQDTDZpGGBH8OmKLFii3CaNP+5BGJ3sAUDphyU0L43GnBo6X8v4untn41YkubaMMIl8um3YpU1dzWH8qfDPjQ9YaostK/2whHuXrgf/F/Nhw0zjV/pjuKQdJcYKgE+G2GlKPyy58BfB/+WXX5LApBa/I/5DJsYstCvxAEsrp2Sq8XcbAIVOI8nC8kSKTwm3gA8AuHxqJnhown288Y//mhTfdfyp8S8bZLbwRWxZPpLgA+bxK10BXJslMuKsID4mtz2jOo7/SMx2m0TODe4qaZlq/EoDwHWC5/fq2D+ouHQRGQQ2zXX8aQ+w/YNK6KGebXPd+XXiV7plub66DcB/wkYPGACrDfGA9h8wAX6neuvdQVv4QOvePRFDbbGE7zJ+1/x766vboYd4bLKwwo1D3oGE8WvdM06I0dUH70CA9Zkiy/gu+c8yL4nxnV2GDE1MtO34so7vyrLOizG+8onHVd76uFjW+flL5T/2jTARXCY/beLwKPDJh008ETvL/Pwl898xCAqaq2wBYTFSU2nuNPC5H5EgElMiS6Kxn1V+cv671Afg8nMyZS0u3Wcib+0Sn3wAbhKcdX5y/n2THuTgwxPLXRWIhyeW8U8X/8VI/NUFvugDsJvgrPOT89+22AdhBE4AHEz8ubFwUVvj3SW+SBD5E/+R3V7+Rit21/FnHT9L/Mdugh89GwlqUnFNehm4ibnGFwnaYL42Fi5Gfk7URuDrTarNRFnnJ+fft4gzXqGEGqISjK60tSt87kMsliAzXY36rPOT8x+2rrdB+dqNO5Ot6W58POJ98MWK1obGNj4n6NGzkaDaSrcYTDdjWePHNX7W+Fd6DtAJFAhr2uvgpYHvugPF+eJ2nPlxjX/c+Y+RR38YuszYtKPEt5Hgk8yPa/zjyH/i9wH4pcvF43PX+K4t6/ycdP6lA6C+dVCgIsMu7DjhmyT4OMWfdfyj5j/2CvDTJy9hof4QnRwt1B/ip09eMpIuV8U/rrOO6/hd80+dyBW+a7MVvzQ5JCz75jtn8frmK/jbfz6UfvnP/1k0Vg9eHLyL8W1fpa0TvqmCMBC9ZSaaaQd1Hb9r/skHAKX4SYVNNwfin0KIlmSCsBV/x7tApKX55uOzEYVdEpkd376ARcjlu+MCJ8VjbLcDlb7Ctgdg0PdVwoC2fv9PABb+3Z8heBJo1jDt/GnED7jhn9pA8u7YA/BV9Bz+hhXQErnVrKFQ3zoo9M+VPDEHxP9Pn7yEfrxkVH/AVvwRpzLtdVGaG0BEAY2sW0Pi8MnID8en2db0CgMgNEssP94H0FYpNpk5XcXvmn/ywfnh+HygmeKLbWle2QEAXHzlNAB/wiCzkd8k8Uv3AE/3q4HQEAE9uPMk9I+PsKf71UCJWcVk+GQyfBMZbfE7n311H599dT/o/A/uPMHi4F00r+xor3Fdx++afzEmji9r071z17XxeZknwl1+vI/PvrofuVomzW+S+KUDgEtJc4lrEZw+a14a1ZK41sXnnUHVxAYTJidqfPuCUfEH1/G75p/HpIIvxqRqXA6d8y4uT3QHF2AvfukSiG8a+GaDG9/cid/pFDg/l1scPpcxVFURli0jyOb36lKCdC6/LuNPg38xpk74vH06G2GeA8Lm3Mt8qObWZvxd6wPsTjWl8tNM/ltLn353qonNlWngbFu1tyP+RlvnX8d4J+WVRMTOH5QjmoPSBi+N+F3yD/g6Q99fuha0pwu+r7T8P0BxajaCJbP+uZLHyzwR/7bqJ9iMP7IE2p1qYvPsODbPjlNjggbQmpkCJjVkOp9rsnewQnFkNiht2Qkf8FV/L5+a0S4AQecXqz2hYgr0jwaEwfLBafwp8I/Dtee4fGommD0Jn9bsIv7TH3/WqT0AwO/4pAYXxz/lwCS3tuKPa1BQgEBVn95AQtsD0BGfdB/750rYPDuOoSeLOnchAm16wK+0SLcOxbsDhve5XcbvjP/+uZLHYgG1oRN+y7Tu/oizOr9bw/cGgF6NBtvxd3IaSjCByfTqFbBifXTSvydswwIQIfy4DmpQXUWKT2Yxflf8e0I8oXhj8LV54bwqdFCtnNqMv9ODsAJi9OlJipodS/TnCl307wuV2SXaUGn7oVhJn14kSVZl3MSHg/hd8S/GI70FnLR+gsgrTTjEfQK5dKvxa70PwM2lZr0keOMBRjhxhLAiF9b+5shm/HGWkP9IPJb1+3knjViInz98a4QvwzQxowIZFju/VD8+jYIQPAaYd9BU4k+DH5mPhPUBkvCqbabxH4v6ALnldlTWbQlUGBgei2z0yGxVcBHNoh5+ED+fIVjtYCczlIv4ZWazgo5DKwwMj4UUnF1UADI1pT0Ad5BGsQbL+vRx+M4uz7bjd8x/YbOy5frv/V36SIStdE864fe74vPZwUHnzDx+h89sD+LMc6WLfxzetkpbO962j6zWBIgzl+1xnQuZD3sDgEvLHddXFU+y5fzbt8ge4MbHI17ce5bhV9t8CQvbOu/0u4sEZwE/5z9d/NAAqJV7PXpPs9v7nO3j6nqOgPsEZxk/5z99fOmHVNAgTsiI22svryjLW1NSVRJMpqtJmWV87ifnPx38yAdEvmhxEndkOhrvrhJ8EvBz/tPFDx2UlbKJk5jm8tYAlAsouE5wlvFz/tPHDw7wSwrXdlcxqvl01AnOMn7O/9HgFwh4ovYGPvhipSBqu3NA7pR+B9TkrV0nOMv4Of9Hh98D+JuK+laYcLqk0I77c7RHGR9xKuswnmBf2bdd3YOsW4KBeAm8rOPn/B8dfuQ2KJef/uCLleBtppmb/nuzJrLUrhOcdXyynP/08YMB0CY/bGfefhXFkVl4nodfV2fwm4/+aJSEsA+7CT4J+Dn/R4MfvA/Aye8kP/3dlx9GFHlVazvFJbgyu4Tbj/el2KqWdfyc/6PBj30hhjs7XJnGr6vyP8NVfZDhOsFZx+/kL+ffHX7XN8LEl5uf/vgzrr1XVQ48zmwn+KThk+X8u8VXcRzIUJDN/NdaJAhD8xrTozjz9qvBAUr45v/+n40CGVnHD3xwy/m3h6/q3AMALjRlUrAiDtthgk8CPpDz7wy/6wlc5Ytr4evouav4oN93p5ronytpqYWpYJOKmNCJrPogTNvxu+Yf7CUSm4NM5N6Fj5Y5iR/9cyVvfXXb658reUONsre+uu298DzvhecFxxM5aPkgbO5rqFH20Pl1QC1s+l0SvzUfLuJPg//11W1vqFH2ZG1JgivGLbbFRhuSxt91EyzqrssKNJgazW6kGfnmO2exOHhXWyxVBZtweT0AUVI7qQ+b8ZO55n9x0C+vxK8wvC1JOqhMD9SmDxvxK/UALnQ6jpao6bZJyHKb7Kth/k49+J2wW0sJDwmWEoRNuJN9NWATQJ99Hy7iB9Lhn/Di2qJhXTsz+SCBXFVV6054pvEr7QEWB+/irXcHsbNxK6RLmVTXJW50ctlsg7V0ZMPIcWkNTQrRjHztdjiKP+LDEf9e/1wpdBWUXbl0FbO5qvX5+1cDzmVFSXjlHBORXBvxK10B+OXWpixfKziPJ7bwh29RlBQ8UDTvcGUaxZHZoDILYXK5DN756TZacWRWe6Z2EL/UHPDvd9SpJWCuhMXBu5jsqwVFJUKK1BhLfAWb7KsFg4A67GZlCwMY6/JN9/ErDQBKJpPiJrN1F0IqlmpyaXz6489oTI8GSsQDw2NB56fZf36v3l5KwI5CtK34ZZYG/9wkfoww6CrMeafJh+6UkYw6AKNJKM63qik9CKOOJASr+v2O2Ky4A4D20oVmZ11NfVE7XlwKsWIYhGssve4gfqkPR/zH3TpM6ifEZ9wykSYHfg/fpH5Cy0cIVyd+rdsgNmZKmfFiCkHhBIyZdJ6IFv/uVDOsrfkCwDnwy2/iGcdi/B3NMv/B8o3bAMaS+uHt9WQVMvkMzScPaOYaFuJXHgA0C1m2QmV2yWtgNHSQab2bdJ5QAihusTBD63jiS25ldgmW4+cWJNgB/55sUy3xk3gASwp6cD9W8Dm2zqDSkkf3PvttpASNDavMLoXqYVkyaefhBTNanyd5EFMA5PHvbNzCzsYtehiW6GEPH7T8Z1KjjsM7v4CfeOkmdn6Jn8TciDcGdPqpygAoOJj5Q7azcQtDjXKokyYgx4Pk0gig2yAwToQsfgDYP6iE7j4dMysU2Iadxw/Y6Zxkghx6yFr8GPvhnZ8GFx1j2LH4WnsAB5VJvPXVbVw+FX2qaSgD7g01ypjfq2P/oH37kKsEt5Y9wQyxf1DB+uo2JvtqaMlsa234xPh5ki10/kh9AItLIW99dTvEE9DuRAlk2EP8ymoBUL2A+b060OfzZMK9ykkt7NjPVQaAlChbxjsp+QGQhJhucQZJWF/dVjlfyZdEituaHv7A8FgwSC2ZN9QoYxJtPOokQ40yLmMm+F2T/4DTuAkIbJJK0J7AD00+5EOc4LqZ0m1QcSazrOsedBTZjGngS0WC22abuL+In5jjWvgxsSbBjeMobtAqDwCFHCb1IfXTZQJK9EKMCKb7XR07aX5sWZbizVQOlb+Qa9MfreX8u7GuewC5Cu9D6WWsLV6kb8dRO/444Of8u8XvOABIkUs0fozewCe9ljj5ik4+REybCc4yfs6/e/xYZ64lrsmHir47ENaE15EBzyp+zn86+FJHuUb90eLn/KeHHzsAbi9/A0BPglpXplu046ohfxT4Of/p4MfuAYhYIjdOjpqTTyq8KutQmca7TBKcJ/hzXARuqq1xs46f858OfuwVgGvUd5KeJuMa9VTILK4hYqEDFaMEhzd9cjsJ+Dn/6eB3vAv06NkIXnt5JUQ2/f7pzV4AcjVelZ38o2dtjXeTBHerjph1fPpOzr9b/I5XAJnRCCJ9ysrsEm583AZXufxyfNlaDZAnWFVK7yThi5bzbxdf669BF+oP8d2XH+Jv3r2GQqHgvwk1Gz5HNQlk4i7eRoJPEr6InfNvF1/6PoBMfprIl5k4spIm+PbjfVRml0KipxybP/U7ifg5/+nhd6wPEKfB/uvqTOjFY13CXSc46/hxPshy/u3hd3wjjDu69l5VqlVvai4TfBLwRR85/27wlZ8aAu11FZkN1QPa0Az99V8BQETrPamPrOOTDyDn3wW+smNRAlz3+53MZYJPAj6Q8+8KX8k5V+ElZS8mMGUjCR4phbnQjpfUBOACVsc9fuf8xwwuwEHtBOEzOp7Ij8v4A/11rktPWuyWNOoDPX3C5D6SYovxcz+2fDiM3zn/sph5TQXb2LxWAB1LWocgSfxKukBxuvQ2X5I/XHuOxcG7gbb7/F4dxWpPIn16IFwD4MGdJyE/tny4jB9wxz9dWcSYSYvUhna/iD2+fQEP7jwJHTvK+JXFcUVd+qTFJVoWWp5EtN0tYYdqAmwLNQMs+SA/FuMPzCH/sTGTorOp7U41MT53AdhGoN7cxYwEBJLGr+JMKqG3vrpto05VSOM9TlLc0IcH+OtMWV0AiQ/6VceXy/gDHw75l86Qoua+SY0GLkty/v7VCDZXir537joGhseMxISTxq88jYiiWIbVQ6RGm7rdqSa8z34b+EugHekdrkz7t8FaGvKT1faMQDryIV/w1ZdNJLodxB8xR/x7YpEKLiXfGmDUMbV4EcW7uIxJQk0gbonjVxkAgdgQN1sFIMQ7J7bU58SHRKJG/VCjjELl20BprTE9avRgyVX8zJzy70D20hPlyfvnSpEql3wQJIkhafyqIzrSKEvqvoG+PtfVJ0uor8/XlMFSRew4ok69ST0CR/GH/LjiX9ZZyQxvKXoSzX9pyaqWD8I12QMkjl95CeSoNkCg58919alRFnXqffxWbQAy3oHEugKqPhzGHzJXtRlE3JCe/4ZR7S5eoyGw3ammVK6QlTAyGshJ41ceAFxz3bKMeQGAx2WuqVG2Zs9OMt2sRoCpn27xWzEZ/xZqHIQ6K6+lkLCOAj/XEwV9ZfUCDE062MiHCr5WfYCdjVvBJs+V7WzcCvT2LZhLjXqvhR9Rbxbit7IJFrX7WRGOpFYQ8QeGx4K6AQn9pFGjQdovVWPXGgDcLN7h8LimO+3kE15lqHNKO79opjUChhpl7B9UIvgW4k/TQgOY30kBgFYNAaM9mEwoVxwECczjPqimBM+vig/ljQ0QXvrYHABDjTK+f3EtwOW3st56d1DXT1t7HsDp3gaPl2N53A8AqhGg6i/4vqg/nzB+qS8guvS0lIOAf+JI5MU0B4Qh4TVa2yuaH2Uf1HcIR9JPY3G1BoAFYiK4IibhCp3LmPwOcapIeSv5kUlzJ4hf6guQDqyk2LHS6wnl4z3ZfX9ZnQD6nEyjT4UGgNDRVfuAdU12XevUCcmsXH5jYk0qsR1350hJm17Xjwv+Y44XYj4z4SYOI+kEJPqQTkDdcJM2yFpyM4R7VHbS2gMcg9z/P5ivjyUCy3mBAAAAAElFTkSuQmCC";
let heroImg = null, heroReady = false;
if (typeof Image !== 'undefined') {
  try {
    heroImg = new Image();
    heroImg.onload = function () { heroReady = true; };
    heroImg.onerror = function () { heroImg = null; };
    heroImg.src = 'data:image/png;base64,' + HERO_B64;
  } catch (e) { heroImg = null; }
}

// Variante actual del protagonista.
// 'chibi00s' = proporciones cabezonas tipo RPG portátil de los 00s,
// con paleta verde/beige (sin copiar assets comerciales).
// Cambia a 'spritesheet' si quieres volver al sprite medieval importado.
const HERO_STYLE = 'chibi00s';

function dPlayerChibi00s(x, y, dir, f) {
  // Protagonista original inspirado en entrenadores RPG portátiles de los 00s:
  // gorra roja con frente claro, chaqueta roja, mochila y proporción chibi.
  // No es un calco de ningún personaje comercial.
  const moving = !!G.pl.moving;
  const step = moving ? (Math.floor(G.pl.f / 6) % 2 === 0 ? 1 : -1) : 0;
  const bob = moving ? Math.sin(f * 0.32) * 1 : 0;
  const by = Math.round(y + bob);
  const OX = x + 8;
  const OY = by + 6;

  const OUT = '#151515';
  const SKIN = '#F0C49A';
  const SKIN2 = '#D99B70';
  const HAIR = '#24160F';
  const HAIR2 = '#4A2A1A';
  const RED = '#D92F2F';
  const RED2 = '#A81F27';
  const RED3 = '#F06050';
  const WHITE = '#F4F0E8';
  const SHADE = '#CFC7B8';
  const SHIRT = '#202838';
  const JEAN = '#315D9A';
  const JEAN2 = '#203F70';
  const BAG = '#C2A06A';
  const BAG2 = '#8A6A3A';
  const BOOT = '#3A2418';
  const EYE = '#101010';
  const MOUTH = '#8A463A';

  cx.fillStyle = 'rgba(0,0,0,.25)';
  pixelGlow(x + 16, by + 35, 9, 2.8);

  const R = (c, r, w, h, col) => px(OX + c, OY + r, w, h, col);
  const RO = (c, r, w, h, col) => { px(OX + c - 1, OY + r - 1, w + 2, h + 2, OUT); R(c, r, w, h, col); };
  const Rf = (flip, c, r, w, h, col) => R(flip ? 16 - c - w : c, r, w, h, col);
  const ROf = (flip, c, r, w, h, col) => {
    px(OX + (flip ? 16 - c - w : c) - 1, OY + r - 1, w + 2, h + 2, OUT);
    Rf(flip, c, r, w, h, col);
  };

  if (dir === 0) {
    // FRENTE
    RO(3, 21, 4, 3, BOOT);
    RO(9, 21, 4, 3, BOOT);
    R(5, 17, 3, 5, JEAN);
    R(9, 17, 3, 5, JEAN);
    R(5, 20, 3, 2, step > 0 ? JEAN2 : JEAN);
    R(9, 20, 3, 2, step < 0 ? JEAN2 : JEAN);

    // mochila asomando por los costados
    R(1, 12, 3, 8, BAG2);
    R(12, 12, 3, 8, BAG2);
    R(2, 13, 1, 5, BAG);
    R(13, 13, 1, 5, BAG);

    RO(3, 12, 10, 7, RED);
    R(4, 13, 8, 2, RED3);
    R(4, 17, 8, 2, RED2);
    R(6, 12, 4, 7, SHIRT);
    R(7, 13, 2, 2, WHITE); // cuello claro
    R(1, 14 + (step < 0 ? 1 : 0), 3, 5, RED2);
    R(12, 14 + (step > 0 ? 1 : 0), 3, 5, RED2);
    R(1, 18 + (step < 0 ? 1 : 0), 3, 2, SKIN);
    R(12, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);

    // cabeza
    R(1, 2, 14, 10, OUT);
    R(2, 3, 12, 9, SKIN);
    R(2, 4, 3, 7, HAIR);
    R(11, 4, 3, 7, HAIR);
    R(4, 4, 8, 2, HAIR);
    R(5, 5, 6, 1, HAIR2);

    // gorra roja tipo entrenador, con frente blanco y visera
    R(0, 0, 16, 4, OUT);
    R(1, 0, 14, 3, RED);
    R(5, 0, 6, 3, WHITE);
    R(4, 2, 8, 2, SHADE);
    R(3, 3, 10, 2, RED2); // visera
    R(6, 1, 4, 1, '#FFFFFF');

    // ojos/cara
    R(5, 7, 2, 3, EYE);
    R(10, 7, 2, 3, EYE);
    R(5, 7, 1, 1, '#FFFFFF');
    R(10, 7, 1, 1, '#FFFFFF');
    R(7, 10, 3, 1, MOUTH);
  } else if (dir === 3) {
    // ESPALDA
    RO(3, 21, 4, 3, BOOT);
    RO(9, 21, 4, 3, BOOT);
    R(5, 17, 3, 5, JEAN);
    R(9, 17, 3, 5, JEAN);

    // mochila más visible de espalda
    RO(3, 11, 10, 10, BAG);
    R(4, 12, 8, 8, BAG2);
    R(5, 13, 6, 5, BAG);
    R(7, 14, 2, 2, '#E0C080');
    R(2, 13 + (step > 0 ? 1 : 0), 3, 6, RED2);
    R(12, 13 + (step < 0 ? 1 : 0), 3, 6, RED2);
    R(2, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);
    R(12, 18 + (step < 0 ? 1 : 0), 3, 2, SKIN);

    R(1, 2, 14, 10, OUT);
    R(2, 3, 12, 9, HAIR);
    R(4, 4, 8, 2, HAIR2);

    // gorra desde atrás
    R(0, 0, 16, 4, OUT);
    R(1, 0, 14, 3, RED);
    R(3, 2, 10, 2, RED2);
    R(5, 0, 6, 2, WHITE);
  } else {
    // PERFIL
    const flip = dir === 2;
    ROf(flip, 4, 21, 4, 3, BOOT);
    ROf(flip, 9, 21, 3, 3, BOOT);
    Rf(flip, 5, 17, 3, 5, JEAN);
    Rf(flip, 9, 17, 3, 5, JEAN2);

    // mochila lateral
    ROf(flip, 2, 12, 4, 8, BAG);
    Rf(flip, 3, 13, 2, 6, BAG2);

    ROf(flip, 5, 12, 8, 7, RED);
    Rf(flip, 6, 13, 6, 2, RED3);
    Rf(flip, 6, 17, 6, 2, RED2);
    Rf(flip, 8, 13, 3, 6, SHIRT);
    Rf(flip, 12, 14 + (step > 0 ? 1 : 0), 3, 5, RED2);
    Rf(flip, 12, 18 + (step > 0 ? 1 : 0), 3, 2, SKIN);

    // cabeza perfil
    Rf(flip, 4, 2, 10, 10, OUT);
    Rf(flip, 5, 3, 8, 9, SKIN);
    Rf(flip, 4, 4, 3, 7, HAIR);
    Rf(flip, 5, 4, 7, 2, HAIR);
    Rf(flip, 12, 8, 1, 2, SKIN2); // nariz
    Rf(flip, 10, 7, 2, 3, EYE);
    Rf(flip, 10, 10, 3, 1, MOUTH);

    // gorra de perfil con visera hacia donde mira
    Rf(flip, 3, 0, 11, 4, OUT);
    Rf(flip, 4, 0, 9, 3, RED);
    Rf(flip, 7, 0, 5, 2, WHITE);
    Rf(flip, 11, 2, 5, 2, RED2); // visera
    Rf(flip, 9, 1, 2, 1, '#FFFFFF');
  }
}

const HERO_MAP_SCALE = 1.22; // tamaño del prota en mapa: a la altura de los NPCs normales

function dPlayerGBA(x, y, dir, f) {
  if (HERO_STYLE === 'chibi00s') {
    // Escalar solo al protagonista para que no se vea más pequeño que el resto
    // de personajes. David-O mantiene su proporción especial de NPC alto/delgado.
    cx.save();
    cx.translate(Math.round(x - 4), Math.round(y - 8));
    cx.scale(HERO_MAP_SCALE, HERO_MAP_SCALE);
    dPlayerChibi00s(0, 0, dir, f);
    cx.restore();
    return;
  }
  if (heroReady && heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
    const row = (HERO_DIR_ROW[dir] !== undefined) ? HERO_DIR_ROW[dir] : 0;
    const moving = G.pl.moving;
    const col = moving ? ((Math.floor(G.pl.f / 5) % 2 === 0) ? 2 : 1) : 0;
    const bob = moving ? Math.sin(f * 0.3) * 1.0 : 0;
    // sombra en el suelo
    cx.fillStyle = 'rgba(0,0,0,.22)';
    pixelGlow(x + 16, y + 38, 8, 2.5);
    try {
      cx.drawImage(heroImg, col * HERO_FW, row * HERO_FH, HERO_FW, HERO_FH,
                   x + 4, Math.round(y + 7 + bob), HERO_FW, HERO_FH);
    } catch (e) {}
    return;
  }
  // Respaldo por rectangulos (por si la imagen no llega a cargar en algun entorno)
  dPlayerGBAFallback(x, y, dir, f);
}

function dPlayerGBAFallback(x, y, dir, f) {
  // Prota estilo GBA/RPG Maker: solo rectangulos, 16x24, contorno negro 1px
  const bob = G.pl.moving ? Math.sin(f * 0.3) * 1.2 : 0;
  const by = y + bob;
  const OX = x + 8;        // cuerpo de 16px centrado en el tile de 32px
  const OY = by + 14;      // los pies quedan ~ a ppy+30 (suelo del tile)

  const OUT = '#0E0E10';     // contorno negro
  const HAIR = '#16110D';    // pelo negro
  const SKIN = '#F2CBA0', SKINS = '#D6A878';
  const SHIRT = '#3FA34D', SHIRTS = '#2E7D38';
  const PANTS = '#3A2414';   // pantalon marron oscuro
  const BOOT = '#5A3818';    // botas marrones
  const BELT = '#5A3A1E';    // cinturon marron
  const BUCKLE = '#E8C24A';  // hebilla dorada
  const EYE = '#0E0E10';     // ojos negros (sin pupila)
  const MOUTH = '#7A2A18';   // boca

  // sombra en el suelo
  cx.fillStyle = 'rgba(0,0,0,.22)';
  pixelGlow(x + 16, by + 39, 8, 2.5);

  // helpers (rectangulos alineados; sin curvas ni poligonos)
  const R = (c, r, w, h, col) => px(OX + c, OY + r, w, h, col);
  const RO = (c, r, w, h, col) => { px(OX + c - 1, OY + r - 1, w + 2, h + 2, OUT); R(c, r, w, h, col); };

  switch (dir) {
    case 0: { // ===== FRENTE =====
      RO(4, 21, 3, 3, BOOT); RO(9, 21, 3, 3, BOOT);   // botas
      RO(5, 18, 6, 4, PANTS);                         // piernas / pantalon
      RO(2, 12, 2, 5, SHIRT); RO(12, 12, 2, 5, SHIRT);// brazos (mangas)
      R(2, 16, 2, 2, SKIN); R(12, 16, 2, 2, SKIN);    // manos
      RO(3, 12, 10, 6, SHIRT); R(3, 13, 10, 1, SHIRTS);// camisa hombros rectos
      R(4, 16, 8, 2, BELT); R(7, 16, 2, 2, BUCKLE);   // cinturon + hebilla centrada
      R(6, 11, 4, 1, SKIN);                           // cuello
      // cabeza
      R(1, 0, 14, 11, OUT);     // base / contorno
      R(2, 0, 12, 3, HAIR);     // copete
      R(2, 0, 2, 9, HAIR);      // mecha izquierda (hasta mandibula)
      R(12, 0, 2, 9, HAIR);     // mecha derecha
      R(4, 4, 8, 7, SKIN);      // cara
      R(4, 3, 8, 1, HAIR);      // flequillo corto
      R(5, 4, 2, 4, EYE);       // ojo izquierdo 2x4 sin pupila
      R(9, 4, 2, 4, EYE);       // ojo derecho 2x4 sin pupila
      R(6, 8, 4, 2, MOUTH);     // boca 4x2
      break;
    }
    case 3: { // ===== ESPALDA =====
      RO(4, 21, 3, 3, BOOT); RO(9, 21, 3, 3, BOOT);
      RO(5, 18, 6, 4, PANTS);
      RO(2, 12, 2, 5, SHIRT); RO(12, 12, 2, 5, SHIRT);
      R(2, 16, 2, 2, SKIN); R(12, 16, 2, 2, SKIN);
      RO(3, 12, 10, 6, SHIRT); R(3, 13, 10, 1, SHIRTS);
      R(4, 16, 8, 2, BELT); R(7, 16, 2, 2, BUCKLE);
      R(6, 11, 4, 1, SKIN);     // nuca
      R(1, 0, 14, 11, OUT);     // cabeza toda de pelo
      R(2, 0, 12, 11, HAIR);
      R(4, 1, 2, 3, '#2A221A'); // sombra de volumen en el pelo
      break;
    }
    case 1:
    case 2: { // ===== PERFIL (derecha / izquierda) =====
      const flip = dir === 2;
      const Rf = (c, r, w, h, col) => px(OX + (flip ? 16 - c - w : c), OY + r, w, h, col);
      const ROf = (c, r, w, h, col) => { px(OX + (flip ? 16 - c - w : c) - 1, OY + r - 1, w + 2, h + 2, OUT); Rf(c, r, w, h, col); };
      ROf(4, 21, 3, 3, BOOT); ROf(8, 21, 3, 3, BOOT);  // botas
      ROf(5, 18, 5, 4, PANTS);                         // pierna / pantalon
      Rf(11, 13, 2, 4, SHIRT); Rf(11, 16, 2, 2, SKIN); // brazo delantero + mano
      ROf(3, 12, 10, 6, SHIRT); Rf(3, 13, 10, 1, SHIRTS);// camisa
      Rf(4, 16, 8, 2, BELT); Rf(9, 16, 2, 2, BUCKLE);  // cinturon + hebilla al frente
      Rf(5, 11, 4, 1, SKIN);                           // cuello
      // cabeza de perfil (el frente mira a la derecha en dir=1)
      Rf(4, 0, 9, 11, OUT);     // base
      Rf(4, 0, 9, 3, HAIR);     // copete
      Rf(4, 0, 2, 9, HAIR);     // pelo en la nuca (atras)
      Rf(5, 4, 7, 7, SKIN);     // cara
      Rf(5, 3, 7, 1, HAIR);     // frente
      Rf(11, 6, 1, 2, SKINS);   // nariz (rectangulo)
      Rf(8, 4, 2, 4, EYE);      // ojo 2x4
      Rf(9, 8, 3, 2, MOUTH);    // boca
      break;
    }
  }
}

function dPlayerBig(x, y) {
  const by = y;

  // Botas
  px(x + 16, by + 62, 14, 8, '#5A3818');
  px(x + 34, by + 62, 14, 8, '#5A3818');
  px(x + 18, by + 64, 10, 6, '#6A4828');
  px(x + 36, by + 64, 10, 6, '#6A4828');

  // Piernas
  px(x + 18, by + 46, 12, 18, '#584030');
  px(x + 34, by + 46, 12, 18, '#584030');
  px(x + 20, by + 48, 8, 14, '#685040');
  px(x + 36, by + 48, 8, 14, '#685040');

  // Cinturón
  px(x + 12, by + 42, 40, 4, '#4A2A10');
  px(x + 28, by + 41, 8, 5, '#C8A830');
  px(x + 30, by + 42, 4, 3, '#E8C840');

  // Túnica verde
  px(x + 10, by + 20, 44, 24, '#2A6830');
  px(x + 14, by + 22, 36, 20, '#307038');
  px(x + 18, by + 24, 28, 16, '#387840');
  // Borde decorativo
  px(x + 10, by + 40, 44, 3, '#1A5020');
  px(x + 14, by + 41, 36, 1, '#408848');
  // Cordones
  px(x + 30, by + 24, 3, 14, '#4A2A10');
  px(x + 28, by + 26, 2, 2, '#C8A830');
  px(x + 28, by + 32, 2, 2, '#C8A830');

  // Mangas
  px(x + 6, by + 22, 8, 14, '#2A6830');
  px(x + 50, by + 22, 8, 14, '#2A6830');
  px(x + 8, by + 24, 4, 10, '#307038');
  px(x + 52, by + 24, 4, 10, '#307038');

  // Manos
  px(x + 4, by + 34, 6, 6, SK.b);
  px(x + 54, by + 34, 6, 6, SK.b);
  px(x + 5, by + 35, 4, 4, SK.a);
  px(x + 55, by + 35, 4, 4, SK.a);

  // Capa
  px(x + 4, by + 20, 8, 28, '#6A4A28');
  px(x + 6, by + 22, 4, 24, '#7A5A38');
  px(x + 4, by + 46, 6, 4, '#5A3A18');

  // Cuello
  px(x + 24, by + 14, 16, 8, SK.b);
  px(x + 26, by + 16, 12, 4, SK.a);

  // Cabeza
  px(x + 18, by + 0, 28, 18, SK.b);
  px(x + 20, by + 2, 24, 14, SK.a);
  // Mejillas
  px(x + 20, by + 12, 4, 3, '#E8B898');
  px(x + 40, by + 12, 4, 3, '#E8B898');

  // Pelo
  px(x + 16, by - 4, 32, 8, '#1A1A1A');
  px(x + 14, by + 0, 6, 10, '#1A1A1A');
  px(x + 44, by + 0, 6, 10, '#1A1A1A');
  px(x + 18, by - 6, 28, 4, '#1A1A1A');
  px(x + 20, by - 8, 24, 4, '#282828');
  // Mechón
  px(x + 18, by + 0, 6, 4, '#1A1A1A');
  // Brillo
  px(x + 24, by - 4, 6, 2, '#383838');

  // Ojos
  px(x + 22, by + 6, 6, 5, '#fff');
  px(x + 36, by + 6, 6, 5, '#fff');
  px(x + 25, by + 8, 3, 3, '#283848');
  px(x + 39, by + 8, 3, 3, '#283848');
  px(x + 25, by + 8, 2, 1, '#fff');
  px(x + 39, by + 8, 2, 1, '#fff');

  // Nariz y boca
  px(x + 30, by + 11, 4, 2, '#D8A878');
  px(x + 28, by + 14, 8, 2, '#C08868');

  // Bolso
  px(x + 48, by + 28, 8, 12, '#6A4A28');
  px(x + 50, by + 30, 4, 8, '#7A5A38');
  px(x + 50, by + 28, 4, 2, '#C8A830');
  px(x + 46, by + 20, 2, 10, '#5A3A18');
}
// ============================================================
// BLOQUE 4A: SPRITES NPCs MAPA - ALDEAS
// ============================================================

function dNPC(x, y, id, f) {
  const bob = Math.sin(f * 0.1) * 1,
    by = y + bob;
  dShadow(x + 16, y + 31, 9, 3);

  switch (id) {
    // ==========================================
    // VILLA GUIÓN
    // ==========================================

    case 'alessandro': // Armadura parcial, arriba rojo abajo azul, pelo castaño
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      // Piernas azules
      px(x + 9, by + 22, 5, 5, '#2848A0');
      px(x + 18, by + 22, 5, 5, '#2848A0');
      px(x + 10, by + 23, 3, 3, '#3058B0');
      px(x + 19, by + 23, 3, 3, '#3058B0');
      // Torso rojo con armadura parcial
      px(x + 6, by + 11, 20, 10, '#B83030');
      px(x + 8, by + 12, 16, 8, '#C84040');
      px(x + 10, by + 13, 12, 6, '#D85050');
      // Piezas de armadura en hombros
      px(x + 4, by + 10, 4, 4, '#90A0B0');
      px(x + 24, by + 10, 4, 4, '#90A0B0');
      px(x + 5, by + 11, 2, 2, '#A8B8C8');
      px(x + 25, by + 11, 2, 2, '#A8B8C8');
      // Pechera parcial
      px(x + 12, by + 12, 8, 4, '#90A0B0');
      px(x + 14, by + 13, 4, 2, '#A8B8C8');
      // Cinturón
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 20, 4, 2, '#C8A830');
      // Brazos
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      // Guantelete derecho
      px(x + 25, by + 12, 4, 3, '#90A0B0');
      // Cuello
      px(x + 13, by + 9, 6, 3, SK.b);
      // Cabeza
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo CASTAÑO desordenado
      px(x + 8, by - 3, 16, 5, '#6A4A28');
      px(x + 7, by - 1, 3, 5, '#6A4A28');
      px(x + 22, by - 1, 3, 5, '#6A4A28');
      px(x + 9, by - 4, 14, 3, '#7A5A38');
      px(x + 9, by + 0, 5, 2, '#6A4A28'); // Mechón
      px(x + 12, by - 3, 3, 1, '#8A6A48'); // Brillo
      // Ojos
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A4818');
      px(x + 19, by + 5, 2, 2, '#2A4818');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'fabiana': // Vestido negro, pelo negro largo
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#1A1A1A');
      px(x + 8, by + 12, 16, 6, '#282828');
      px(x + 10, by + 13, 12, 4, '#383838');
      // Cuello blanco decorativo
      px(x + 11, by + 11, 10, 2, '#E8E8E8');
      px(x + 3, by + 12, 4, 7, SK.d);
      px(x + 25, by + 12, 4, 7, SK.d);
      px(x + 13, by + 9, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 10, 3, 6, '#101010');
      px(x + 24, by + 10, 3, 6, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828'); // Brillo
      // Ojos grandes
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#2860A0');
      px(x + 20, by + 4, 2, 3, '#2860A0');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#E08080');
      break;

    case 'nicole': // Harapos, pelo honguito, ojeras
      px(x + 9, by + 27, 5, 3, SK.e);
      px(x + 18, by + 27, 5, 3, SK.e);
      px(x + 10, by + 27, 3, 1, '#4A3A28');
      // Post-game: crucificada (DETRÁS del cuerpo)
      if (postGame) {
        px(x + 0, by - 8, 32, 3, '#5A3818'); // Horizontal
        px(x + 14, by - 12, 4, 44, '#5A3818'); // Vertical
        px(x + 1, by - 7, 30, 1, '#6A4828'); // Brillo madera
      }
      // Harapos
      px(x + 7, by + 18, 18, 10, '#5A4A38');
      px(x + 8, by + 19, 16, 8, '#6A5A48');
      // Bordes irregulares
      px(x + 7, by + 26, 3, 2, '#5A4A38');
      px(x + 22, by + 25, 3, 3, '#5A4A38');
      px(x + 9, by + 27, 2, 1, '#6A5A48');
      px(x + 20, by + 27, 2, 1, '#6A5A48');
      // Parte superior raída
      px(x + 6, by + 11, 20, 8, '#4A3A28');
      px(x + 8, by + 12, 16, 6, '#5A4A38');
      // Parches
      px(x + 10, by + 14, 4, 3, '#7A6A58');
      px(x + 18, by + 16, 3, 3, '#6A5A48');
      px(x + 4, by + 12, 4, 6, '#4A3A28');
      px(x + 24, by + 12, 4, 6, '#4A3A28');
      px(x + 5, by + 14, 2, 2, SK.e); // Piel por agujero
      // Cuerda cinturón
      px(x + 7, by + 17, 18, 1, '#8A7A60');
      // Cuello cabeza
      px(x + 13, by + 9, 6, 3, SK.e);
      px(x + 9, by + 0, 14, 10, SK.e);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO honguito
      px(x + 7, by - 3, 18, 6, '#1A1A1A');
      px(x + 6, by - 1, 20, 4, '#1A1A1A');
      px(x + 7, by + 2, 4, 2, '#1A1A1A');
      px(x + 21, by + 2, 4, 2, '#1A1A1A');
      px(x + 9, by + 1, 14, 2, '#282828'); // Flequillo recto
      // Ojos con ojeras
      px(x + 11, by + 4, 4, 3, '#fff');
      px(x + 18, by + 4, 4, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#381828');
      px(x + 20, by + 5, 2, 2, '#381828');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 20, by + 5, 1, 1, '#fff');
      px(x + 11, by + 7, 4, 1, '#C8A098');
      px(x + 18, by + 7, 4, 1, '#C8A098'); // Ojeras
      px(x + 11, by + 3, 3, 1, '#1A1A1A');
      px(x + 19, by + 3, 3, 1, '#1A1A1A'); // Cejas fruncidas
      px(x + 14, by + 8, 4, 1, '#986858');
      px(x + 10, by + 6, 2, 1, '#B09878'); // Suciedad
      break;

    case 'claudia': // Anteojos morados, arriba blanco abajo negro
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#E8E8E8');
      px(x + 8, by + 12, 16, 6, '#F0F0F0');
      px(x + 10, by + 13, 12, 4, '#F8F8F8');
      // Bordado
      px(x + 10, by + 12, 12, 1, '#D0D0D0');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo liso
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 16, '#1A1A1A');
      px(x + 22, by + 0, 4, 16, '#1A1A1A');
      px(x + 5, by + 12, 3, 6, '#101010');
      px(x + 24, by + 12, 3, 6, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828');
      // Anteojos MORADOS
      px(x + 10, by + 3, 5, 4, '#6030A0');
      px(x + 11, by + 4, 3, 2, '#C8A0E8');
      px(x + 17, by + 3, 5, 4, '#6030A0');
      px(x + 18, by + 4, 3, 2, '#C8A0E8');
      px(x + 15, by + 4, 2, 1, '#6030A0');
      px(x + 12, by + 5, 1, 1, '#2A1818');
      px(x + 19, by + 5, 1, 1, '#2A1818');
      // Pendientes
      px(x + 8, by + 5, 1, 2, '#C8A830');
      px(x + 23, by + 5, 1, 2, '#C8A830');
      px(x + 14, by + 8, 4, 1, '#E08888');
      break;

    case 'luas': // Curandero blanco, cruz roja, aureola
      px(x + 10, by + 27, 5, 3, '#A88050');
      px(x + 17, by + 27, 5, 3, '#A88050');
      px(x + 4, by + 10, 24, 18, '#E8E8E8');
      px(x + 6, by + 11, 20, 16, '#F0F0F0');
      // Cruz roja
      px(x + 14, by + 13, 4, 10, '#D02020');
      px(x + 11, by + 16, 10, 4, '#D02020');
      px(x + 3, by + 18, 3, 3, SK.a);
      px(x + 26, by + 18, 3, 3, SK.a);
      px(x + 13, by + 8, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Capucha
      px(x + 7, by - 2, 18, 5, '#E0E0E0');
      px(x + 6, by + 0, 3, 8, '#D8D8D8');
      px(x + 23, by + 0, 3, 8, '#D8D8D8');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#3868A8');
      px(x + 19, by + 4, 2, 2, '#3868A8');
      px(x + 14, by + 7, 4, 1, '#D0A088');
      // Aureola
      const ha = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = ha;
      px(x + 10, by - 5, 12, 2, '#F8E068');
      px(x + 9, by - 4, 14, 1, '#F8D030');
      cx.globalAlpha = 1;
      break;

    case 'davido': // Mercader delgado, anteojos, pelo negro corto, sonrisa
      px(x + 10, by + 26, 4, 4, '#4A2A10');
      px(x + 18, by + 26, 4, 4, '#4A2A10');
      // Piernas largas (más alto)
      px(x + 10, by + 18, 4, 9, '#2A2838');
      px(x + 18, by + 18, 4, 9, '#2A2838');
      px(x + 11, by + 19, 2, 7, '#3A3848');
      px(x + 19, by + 19, 2, 7, '#3A3848');
      // Torso delgado con túnica púrpura
      px(x + 7, by + 8, 18, 11, '#582890');
      px(x + 9, by + 9, 14, 9, '#6838A0');
      px(x + 11, by + 10, 10, 7, '#7848B0');
      // Bordes dorados
      px(x + 7, by + 8, 18, 1, '#C8A830');
      px(x + 7, by + 17, 18, 1, '#C8A830');
      // Bolsa de mercader
      px(x + 22, by + 12, 5, 5, '#8A6820');
      px(x + 23, by + 13, 3, 3, '#A88030');
      px(x + 24, by + 14, 1, 1, '#F8D030');
      // Brazos delgados
      px(x + 4, by + 10, 4, 7, SK.b);
      px(x + 24, by + 10, 4, 7, SK.b);
      px(x + 5, by + 11, 2, 5, SK.a);
      px(x + 25, by + 11, 2, 5, SK.a);
      // Cuello
      px(x + 13, by + 6, 6, 3, SK.b);
      // Cabeza
      px(x + 9, by - 4, 14, 11, SK.b);
      px(x + 10, by - 3, 12, 9, SK.a);
      // Pelo NEGRO corto bien peinado
      px(x + 8, by - 7, 16, 5, '#1A1A1A');
      px(x + 9, by - 8, 14, 3, '#282828');
      px(x + 7, by - 5, 3, 4, '#1A1A1A');
      px(x + 22, by - 5, 3, 4, '#1A1A1A');
      px(x + 12, by - 7, 3, 1, '#383838'); // Brillo
      // ANTEOJOS redondos
      px(x + 10, by - 1, 5, 4, '#1A1A1A');
      px(x + 11, by + 0, 3, 2, '#B8D0F0');
      px(x + 17, by - 1, 5, 4, '#1A1A1A');
      px(x + 18, by + 0, 3, 2, '#B8D0F0');
      px(x + 15, by + 0, 2, 1, '#1A1A1A');
      // Ojos detrás de anteojos
      px(x + 12, by + 1, 1, 1, '#181818');
      px(x + 19, by + 1, 1, 1, '#181818');
      // Sonrisa ligera
      px(x + 13, by + 4, 6, 1, '#C08868');
      px(x + 14, by + 5, 4, 1, '#D09878');
      // Mejillas
      px(x + 10, by + 2, 2, 2, '#E8B898');
      px(x + 21, by + 2, 2, 2, '#E8B898');
      break;

    // ==========================================
    // ALDEA ESCENA
    // ==========================================

    case 'roberto': // Pelo castaño ondulado, tez oscura, arriba beige abajo naranja
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 20, 5, 7, '#D07020');
      px(x + 18, by + 20, 5, 7, '#D07020');
      px(x + 10, by + 21, 3, 5, '#E08030');
      px(x + 19, by + 21, 3, 5, '#E08030');
      px(x + 6, by + 10, 20, 11, '#D8C8A0');
      px(x + 8, by + 11, 16, 9, '#E0D0B0');
      px(x + 10, by + 12, 12, 7, '#E8D8B8');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 7, SK.c);
      px(x + 24, by + 12, 4, 7, SK.c);
      px(x + 13, by + 8, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.b);
      // Pelo NEGRO ondulado
      px(x + 8, by - 3, 16, 5, '#141210');
      px(x + 7, by - 1, 3, 5, '#141210');
      px(x + 22, by - 1, 3, 5, '#141210');
      px(x + 9, by - 4, 4, 2, '#2C2620');
      px(x + 16, by - 4, 4, 2, '#2C2620'); // Ondas
      px(x + 7, by + 2, 2, 2, '#2C2620');
      px(x + 23, by + 2, 2, 2, '#2C2620');
      px(x + 12, by - 3, 3, 1, '#3A322C');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#241208');
      px(x + 19, by + 5, 2, 2, '#241208');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#B08060');
      px(x + 14, by + 9, 4, 1, '#B08060');
      break;

    case 'brisa': // Pelo castaño suelto, arriba blanco/negro abajo azul grisáceo
      px(x + 10, by + 26, 4, 4, '#5A3818');
      px(x + 18, by + 26, 4, 4, '#5A3818');
      px(x + 8, by + 18, 16, 9, '#708898');
      px(x + 7, by + 20, 18, 7, '#8098A8');
      px(x + 6, by + 11, 20, 8, '#E8E8E8');
      px(x + 8, by + 12, 16, 6, '#1A1A1A');
      px(x + 10, by + 13, 12, 4, '#282828');
      // Delantal
      px(x + 9, by + 13, 14, 10, '#F0F0F0');
      px(x + 10, by + 14, 12, 8, '#F8F8F8');
      px(x + 14, by + 16, 4, 3, '#D06070');
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo CASTAÑO suelto (largo, enmarca el rostro)
      px(x + 6, by - 2, 20, 7, '#6A4A28');
      px(x + 5, by + 1, 4, 12, '#6A4A28');
      px(x + 23, by + 1, 4, 12, '#6A4A28');
      px(x + 7, by - 3, 18, 3, '#7A5A38');
      px(x + 6, by + 11, 3, 3, '#5A3A20');
      px(x + 23, by + 11, 3, 3, '#5A3A20');
      px(x + 12, by - 4, 4, 3, '#7A5A38');
      px(x + 17, by - 4, 4, 3, '#7A5A38');
      // Mejillas rosadas
      px(x + 10, by + 6, 2, 2, '#F0A0A0');
      px(x + 21, by + 6, 2, 2, '#F0A0A0');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#4A3018');
      px(x + 19, by + 4, 2, 2, '#4A3018');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D09080');
      break;

    case 'paulo': // Sin anteojos, arriba marrón abajo verde, libro
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#388038');
      px(x + 18, by + 22, 5, 5, '#388038');
      px(x + 10, by + 23, 3, 3, '#409040');
      px(x + 19, by + 23, 3, 3, '#409040');
      px(x + 6, by + 11, 20, 10, '#785838');
      px(x + 8, by + 12, 16, 8, '#886848');
      px(x + 10, by + 13, 12, 6, '#987858');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      // Libro
      px(x + 25, by + 16, 5, 6, '#8A2020');
      px(x + 26, by + 17, 3, 4, '#F0F0F0');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO corto peinado
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by - 2, 3, 1, '#383838');
      // Ojos SIN anteojos
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#283848');
      px(x + 19, by + 5, 2, 2, '#283848');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'tamara': // Pelo negro largo rizado, traje artista medieval
      px(x + 10, by + 26, 4, 4, '#7A5A38');
      px(x + 18, by + 26, 4, 4, '#7A5A38');
      px(x + 8, by + 18, 16, 9, '#604878');
      px(x + 7, by + 20, 18, 7, '#685080');
      px(x + 6, by + 11, 20, 8, '#705888');
      px(x + 8, by + 12, 16, 6, '#806898');
      px(x + 10, by + 13, 12, 4, '#9078A8');
      // Manchas de pintura
      px(x + 9, by + 14, 3, 2, '#D03030');
      px(x + 20, by + 16, 2, 2, '#3090D0');
      px(x + 12, by + 22, 2, 2, '#E8C020');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      // Pincel
      px(x + 26, by + 14, 2, 10, '#B89060');
      px(x + 26, by + 12, 2, 3, '#D03030');
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO largo RIZADO
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 10, 3, 6, '#101010');
      px(x + 24, by + 10, 3, 6, '#101010');
      // Rizos (zigzag en los costados)
      px(x + 5, by + 4, 2, 2, '#282828');
      px(x + 6, by + 7, 2, 2, '#282828');
      px(x + 5, by + 10, 2, 2, '#282828');
      px(x + 25, by + 4, 2, 2, '#282828');
      px(x + 24, by + 7, 2, 2, '#282828');
      px(x + 25, by + 10, 2, 2, '#282828');
      // Boina
      px(x + 8, by - 5, 16, 5, '#483060');
      px(x + 10, by - 6, 12, 3, '#584070');
      px(x + 14, by - 7, 4, 2, '#584070');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#4A2838');
      px(x + 19, by + 4, 2, 2, '#4A2838');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#E08888');
      break;
    // ==========================================
    // PUERTO LENTE
    // ==========================================

    case 'nahuel': // Arriba negro, abajo shorts, pelo negro corto
      px(x + 9, by + 26, 5, 4, '#8A6840');
      px(x + 18, by + 26, 5, 4, '#8A6840');
      px(x + 9, by + 22, 5, 3, SK.b);
      px(x + 18, by + 22, 5, 3, SK.b); // Piernas
      px(x + 9, by + 20, 5, 3, '#1A1A1A');
      px(x + 18, by + 20, 5, 3, '#1A1A1A'); // Shorts
      px(x + 6, by + 11, 20, 10, '#1A1A1A');
      px(x + 8, by + 12, 16, 8, '#282828');
      px(x + 10, by + 13, 12, 6, '#383838');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A1818');
      px(x + 19, by + 5, 2, 2, '#2A1818');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 12, by + 8, 8, 1, '#C08868');
      px(x + 13, by + 9, 6, 1, '#C08868'); // Gran sonrisa
      break;

    case 'pachi': // Traje teatral medieval, capa morada
      px(x + 9, by + 26, 5, 4, '#4A2A10');
      px(x + 18, by + 26, 5, 4, '#4A2A10');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 6, by + 11, 20, 10, '#3A2848');
      px(x + 8, by + 12, 16, 8, '#4A3858');
      px(x + 10, by + 13, 12, 6, '#5A4868');
      // Detalles teatrales dorados
      px(x + 10, by + 12, 12, 1, '#C8A830');
      px(x + 10, by + 18, 12, 1, '#C8A830');
      // Capa dramática
      px(x + 2, by + 8, 4, 18, '#6830A0');
      px(x + 26, by + 8, 4, 18, '#6830A0');
      px(x + 3, by + 9, 2, 16, '#7840B0');
      px(x + 27, by + 9, 2, 16, '#7840B0');
      // Pañuelo rojo
      px(x + 12, by + 10, 8, 3, '#C83030');
      px(x + 13, by + 12, 6, 2, '#D84040');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO ondulado
      px(x + 7, by - 3, 18, 5, '#1A1A1A');
      px(x + 6, by - 1, 4, 7, '#1A1A1A');
      px(x + 22, by - 1, 4, 7, '#1A1A1A');
      px(x + 8, by - 4, 5, 3, '#282828');
      px(x + 18, by - 4, 5, 3, '#282828'); // Ondas
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#382818');
      px(x + 19, by + 4, 2, 2, '#382818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'gabriela': // Arriba magenta, abajo negro, pelo negro ondulado con flores
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 18, by + 26, 4, 4, '#282828');
      px(x + 8, by + 18, 16, 9, '#1A1A1A');
      px(x + 7, by + 20, 18, 7, '#282828');
      px(x + 6, by + 11, 20, 8, '#C83888');
      px(x + 8, by + 12, 16, 6, '#D84898');
      px(x + 10, by + 13, 12, 4, '#E858A8');
      px(x + 3, by + 12, 4, 7, SK.c);
      px(x + 25, by + 12, 4, 7, SK.c);
      px(x + 13, by + 9, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.c);
      // Pelo NEGRO ONDULADO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 16, '#1A1A1A');
      px(x + 22, by + 0, 4, 16, '#1A1A1A');
      px(x + 5, by + 8, 3, 8, '#101010');
      px(x + 24, by + 8, 3, 8, '#101010');
      // Ondulaciones
      px(x + 5, by + 10, 2, 2, '#282828');
      px(x + 25, by + 10, 2, 2, '#282828');
      px(x + 5, by + 14, 2, 2, '#282828');
      px(x + 25, by + 14, 2, 2, '#282828');
      // Flores en pelo
      px(x + 8, by - 1, 2, 2, '#F088A0');
      px(x + 22, by - 1, 2, 2, '#88B8F0');
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#6A4028');
      px(x + 20, by + 4, 2, 3, '#6A4028');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#B08060');
      // Post-game: armadura dorada
      if (postGame) {
        px(x + 6, by + 11, 20, 8, '#90A0B0');
        px(x + 8, by + 12, 16, 6, '#A0B0C0');
        px(x + 12, by + 13, 8, 4, '#C8A830');
      }
      break;

    case 'hernan': // Todo negro, barba corta (sin barba post-game)
      px(x + 9, by + 24, 5, 6, '#1A1A1A');
      px(x + 18, by + 24, 5, 6, '#1A1A1A');
      px(x + 9, by + 20, 5, 5, '#1A1A1A');
      px(x + 18, by + 20, 5, 5, '#1A1A1A');
      px(x + 6, by + 10, 20, 11, '#1A1A1A');
      px(x + 8, by + 11, 16, 9, '#282828');
      px(x + 10, by + 12, 12, 7, '#383838');
      px(x + 7, by + 19, 18, 2, '#4A2A10');
      px(x + 14, by + 19, 4, 2, '#C8A830');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // Barba corta (solo pre-game)
      if (!postGame) {
        px(x + 11, by + 8, 10, 2, '#282828');
        px(x + 12, by + 9, 8, 1, '#383838');
      }
      // Ojos melancólicos (pre) o alegres (post)
      px(x + 12, by + 3, 3, 4, '#fff');
      px(x + 18, by + 3, 3, 4, '#fff');
      px(x + 13, by + 4, 2, 3, '#282020');
      px(x + 19, by + 4, 2, 3, '#282020');
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      if (!postGame) {
        px(x + 12, by + 2, 3, 1, '#1A1A1A');
        px(x + 18, by + 2, 3, 1, '#1A1A1A'); // Cejas bajas
      }
      px(x + 14, by + 10, 4, 1, '#C08868');
      break;

    // ==========================================
    // FUERTE TELÓN (72,4)
    // ==========================================

    case 'angelly': // Pelo negro suelto, tez clara, amarillo y verde
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 8, by + 18, 16, 9, '#38A048');
      px(x + 7, by + 20, 18, 7, '#48B058');
      px(x + 6, by + 11, 20, 8, '#E8C830');
      px(x + 8, by + 12, 16, 6, '#F0D840');
      px(x + 10, by + 13, 12, 4, '#F8E050');
      px(x + 7, by + 17, 18, 2, '#8A7850');
      px(x + 3, by + 12, 4, 6, SK.d);
      px(x + 25, by + 12, 4, 6, SK.d);
      px(x + 13, by + 9, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO SUELTO largo
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 5, by + 8, 3, 8, '#101010');
      px(x + 24, by + 8, 3, 8, '#101010');
      px(x + 8, by - 3, 14, 2, '#282828');
      // Ojos alegres
      px(x + 11, by + 3, 4, 4, '#fff');
      px(x + 18, by + 3, 4, 4, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A1818');
      px(x + 20, by + 4, 2, 2, '#2A1818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 12, by + 8, 8, 2, '#C08868');
      px(x + 14, by + 8, 4, 1, '#F8F8F8'); // Sonrisa con diente
      break;

    case 'dayana': // Suéter lavanda, pelo negro con mechón azul
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 8, by + 18, 16, 9, '#9880B0');
      px(x + 7, by + 20, 18, 7, '#A890C0');
      px(x + 4, by + 11, 24, 8, '#A890C0');
      px(x + 6, by + 12, 20, 6, '#B8A0D0');
      px(x + 8, by + 13, 16, 4, '#C8B0E0');
      px(x + 10, by + 9, 12, 3, '#A890C0'); // Cuello alto
      px(x + 2, by + 12, 5, 8, '#A890C0');
      px(x + 25, by + 12, 5, 8, '#A890C0');
      px(x + 1, by + 18, 5, 3, '#B8A0D0');
      px(x + 26, by + 18, 5, 3, '#B8A0D0'); // Mangas largas
      px(x + 13, by + 8, 6, 2, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO largo con mechón azul
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 14, '#1A1A1A');
      px(x + 22, by + 0, 4, 14, '#1A1A1A');
      px(x + 6, by + 2, 3, 6, '#3070C0'); // Mechón azul
      px(x + 8, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#201010');
      px(x + 19, by + 4, 2, 2, '#201010');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'deyna': // Chaqueta cuero azul, pelo negro corto mechón rosa, pulsera arcoíris
      px(x + 10, by + 26, 4, 4, '#5A3A1A');
      px(x + 18, by + 26, 4, 4, '#5A3A1A');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 5, by + 11, 22, 10, '#4870A0');
      px(x + 7, by + 12, 18, 8, '#5880B0');
      px(x + 9, by + 13, 14, 6, '#6890C0');
      px(x + 15, by + 14, 2, 2, '#C8C8C8');
      px(x + 15, by + 18, 2, 2, '#C8C8C8'); // Botones
      px(x + 3, by + 12, 4, 7, SK.b);
      px(x + 25, by + 12, 4, 7, SK.b);
      // Pulsera arcoíris
      px(x + 3, by + 18, 4, 1, '#D02020');
      px(x + 3, by + 19, 4, 1, '#E8C020');
      px(x + 3, by + 20, 4, 1, '#20A020');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO corto mechón rosa
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      px(x + 8, by - 3, 6, 3, '#D060A0'); // Mechón rosa
      // Piercings oreja
      px(x + 7, by + 4, 1, 1, '#C8C8C8');
      px(x + 7, by + 6, 1, 1, '#E8C020');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A2020');
      px(x + 19, by + 4, 2, 2, '#2A2020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'andre': // Máscara hierro, SIN CAMISA, torso descubierto
      px(x + 9, by + 26, 5, 4, '#484848');
      px(x + 18, by + 26, 5, 4, '#484848');
      px(x + 9, by + 22, 5, 5, '#404040');
      px(x + 18, by + 22, 5, 5, '#404040');
      // Torso descubierto
      px(x + 6, by + 11, 20, 10, SK.a);
      px(x + 8, by + 12, 16, 8, SK.b);
      // Músculos sugeridos
      px(x + 10, by + 13, 4, 4, '#D8B090');
      px(x + 18, by + 13, 4, 4, '#D8B090');
      px(x + 13, by + 17, 6, 2, '#D0A880');
      // Capa corta
      px(x + 3, by + 11, 4, 10, '#404048');
      px(x + 25, by + 11, 4, 10, '#404048');
      px(x + 4, by + 12, 4, 8, SK.a);
      px(x + 24, by + 12, 4, 8, SK.a);
      px(x + 13, by + 9, 6, 3, '#808898');
      // MÁSCARA DE HIERRO
      px(x + 9, by + 0, 14, 11, '#788090');
      px(x + 10, by + 1, 12, 9, '#8890A0');
      px(x + 11, by + 2, 10, 7, '#90A0B0');
      px(x + 12, by + 4, 3, 2, '#282828');
      px(x + 18, by + 4, 3, 2, '#282828'); // Rendijas ojos
      px(x + 14, by + 7, 4, 1, '#484848'); // Rendija boca
      // Remaches dorados
      px(x + 10, by + 2, 1, 1, '#E8C830');
      px(x + 21, by + 2, 1, 1, '#E8C830');
      px(x + 10, by + 8, 1, 1, '#E8C830');
      px(x + 21, by + 8, 1, 1, '#E8C830');
      // Pelo NEGRO asomando
      px(x + 8, by - 1, 16, 2, '#1A1A1A');
      break;

    // ==========================================
    // NPCs EXTERIORES
    // ==========================================

    case 'alejandro': // ÚNICO pelo largo negro, arriba negro abajo azul grisáceo, bandana roja
      px(x + 8, by + 24, 6, 6, '#5A3A18');
      px(x + 18, by + 24, 6, 6, '#5A3A18');
      px(x + 9, by + 20, 5, 5, '#708898');
      px(x + 18, by + 20, 5, 5, '#708898');
      px(x + 6, by + 11, 20, 10, '#1A1A1A');
      px(x + 8, by + 12, 16, 8, '#282828');
      px(x + 10, by + 12, 12, 8, '#383838'); // Interior chaleco
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO LARGO (único hombre)
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 16, '#1A1A1A');
      px(x + 22, by + 0, 4, 16, '#1A1A1A');
      px(x + 5, by + 10, 3, 8, '#101010');
      px(x + 24, by + 10, 3, 8, '#101010');
      // Bandana roja
      px(x + 7, by - 1, 18, 3, '#C83030');
      px(x + 5, by + 0, 3, 2, '#C83030');
      px(x + 24, by + 0, 3, 2, '#C83030');
      px(x + 4, by + 1, 3, 5, '#C83030'); // Cola bandana
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#181818');
      px(x + 19, by + 4, 2, 2, '#181818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'luis': // Arriba gris/azul, abajo negro, bastón
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 4, by + 10, 24, 18, '#607088');
      px(x + 6, by + 11, 20, 16, '#708098');
      px(x + 8, by + 12, 16, 14, '#8090A8');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 19, 4, 3, '#C8A830');
      px(x + 3, by + 12, 3, 7, SK.b);
      px(x + 26, by + 12, 3, 7, SK.b);
      px(x + 28, by + 8, 2, 22, '#6A4828');
      px(x + 27, by + 6, 4, 3, '#A88848'); // Bastón
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 6, '#1A1A1A');
      px(x + 22, by + 0, 3, 6, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#384858');
      px(x + 19, by + 4, 2, 2, '#384858');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'alex': // Arriba crema, abajo verde, sombrero de paja, pecas
      px(x + 9, by + 26, 5, 4, '#6A4828');
      px(x + 18, by + 26, 5, 4, '#6A4828');
      px(x + 8, by + 14, 16, 14, '#388038');
      px(x + 9, by + 15, 14, 12, '#409040');
      px(x + 10, by + 11, 3, 4, '#388038');
      px(x + 19, by + 11, 3, 4, '#388038'); // Tirantes
      px(x + 6, by + 11, 20, 4, '#D8C8A0');
      px(x + 8, by + 12, 16, 2, '#E0D0B0');
      px(x + 4, by + 12, 4, 7, SK.c);
      px(x + 24, by + 12, 4, 7, SK.c);
      px(x + 11, by + 6, 1, 1, '#A06A45');
      px(x + 14, by + 7, 1, 1, '#A06A45');
      px(x + 21, by + 6, 1, 1, '#A06A45'); // Pecas
      px(x + 13, by + 9, 6, 3, SK.c);
      px(x + 9, by + 0, 14, 10, SK.c);
      px(x + 10, by + 1, 12, 8, SK.c);
      // Sombrero de paja
      px(x + 5, by - 3, 22, 4, '#E0C060');
      px(x + 7, by - 5, 18, 4, '#E8C870');
      px(x + 9, by - 6, 14, 2, '#F0D080');
      px(x + 12, by - 4, 8, 2, '#C83030'); // Cinta roja
      px(x + 8, by + 0, 16, 2, '#1A1A1A');
      px(x + 7, by + 1, 3, 3, '#1A1A1A');
      px(x + 22, by + 1, 3, 3, '#1A1A1A');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A6020');
      px(x + 19, by + 4, 2, 2, '#2A6020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#B08060');
      break;

    case 'gonchi': // Anteojos, arriba gris abajo azul grisáceo, mochila, capucha
      px(x + 9, by + 26, 5, 4, '#5A3A1A');
      px(x + 18, by + 26, 5, 4, '#5A3A1A');
      px(x + 9, by + 22, 5, 5, '#708898');
      px(x + 18, by + 22, 5, 5, '#708898');
      px(x + 6, by + 11, 20, 10, '#787888');
      px(x + 8, by + 12, 16, 8, '#8888A0');
      px(x + 10, by + 13, 12, 6, '#9898B0');
      px(x + 8, by + 9, 16, 3, '#787888');
      px(x + 7, by + 10, 4, 2, '#787888');
      px(x + 21, by + 10, 4, 2, '#787888'); // Capucha
      px(x + 2, by + 12, 4, 10, '#6A4A28');
      px(x + 3, by + 13, 2, 8, '#7A5A38'); // Mochila
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 3, 16, 5, '#484858');
      px(x + 9, by - 4, 14, 3, '#585868'); // Gorro
      px(x + 8, by + 0, 16, 2, '#1A1A1A');
      // ANTEOJOS
      px(x + 10, by + 3, 5, 4, '#1A1A1A');
      px(x + 11, by + 4, 3, 2, '#B8D0F0');
      px(x + 17, by + 3, 5, 4, '#1A1A1A');
      px(x + 18, by + 4, 3, 2, '#B8D0F0');
      px(x + 15, by + 4, 2, 1, '#1A1A1A');
      px(x + 12, by + 5, 1, 1, '#181818');
      px(x + 19, by + 5, 1, 1, '#181818');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'jairo': // Arriba beige/escarlata, abajo blanco, BALÓN DE SOCCER
      px(x + 9, by + 26, 5, 4, '#2A2A2A');
      px(x + 18, by + 26, 5, 4, '#2A2A2A');
      px(x + 9, by + 20, 5, 7, '#E8E8E8');
      px(x + 18, by + 20, 5, 7, '#E8E8E8');
      px(x + 9, by + 24, 5, 3, SK.b);
      px(x + 18, by + 24, 5, 3, SK.b); // Piernas
      px(x + 6, by + 11, 10, 10, '#D8C8A0');
      px(x + 16, by + 11, 10, 10, '#C83838');
      px(x + 8, by + 12, 8, 8, '#E0D0B0');
      px(x + 18, by + 12, 8, 8, '#D84848');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      // BALÓN (único)
      px(x + 26, by + 15, 6, 6, '#E8E0D0');
      px(x + 27, by + 16, 4, 4, '#F0F0F0');
      px(x + 28, by + 17, 2, 2, '#282828');
      px(x + 27, by + 16, 1, 1, '#282828');
      px(x + 30, by + 19, 1, 1, '#282828');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#2A1818');
      px(x + 19, by + 4, 2, 2, '#2A1818');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'dante': // Pelo negro rizado, arriba verde abajo negro, gabardina
      px(x + 9, by + 26, 5, 4, '#1A1A1A');
      px(x + 18, by + 26, 5, 4, '#1A1A1A');
      px(x + 4, by + 10, 24, 18, '#1A1A1A');
      px(x + 6, by + 11, 20, 16, '#2A3A28');
      px(x + 8, by + 12, 16, 14, '#3A4A38');
      px(x + 10, by + 9, 12, 3, '#1A1A1A'); // Cuello alto
      px(x + 3, by + 12, 3, 8, SK.b);
      px(x + 26, by + 12, 3, 8, SK.b);
      px(x + 13, by + 8, 6, 2, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO RIZADO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // Rizos (pequeños bucles)
      px(x + 8, by - 3, 2, 2, '#282828');
      px(x + 13, by - 4, 2, 2, '#282828');
      px(x + 19, by - 3, 2, 2, '#282828');
      px(x + 7, by + 1, 2, 2, '#282828');
      px(x + 23, by + 1, 2, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#681818');
      px(x + 19, by + 4, 2, 2, '#681818'); // Ojos rojizos
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#A88070');
      break;

    case 'dan': // Arriba verde, abajo escarlata
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#C83838');
      px(x + 18, by + 22, 5, 5, '#C83838');
      px(x + 10, by + 23, 3, 3, '#D84848');
      px(x + 19, by + 23, 3, 3, '#D84848');
      px(x + 6, by + 11, 20, 10, '#2A6830');
      px(x + 8, by + 12, 16, 8, '#307038');
      px(x + 10, by + 13, 12, 6, '#387840');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      // Ojos pensativos
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 3, 2, 2, '#3A2828');
      px(x + 19, by + 3, 2, 2, '#3A2828'); // Mirando arriba
      px(x + 13, by + 3, 1, 1, '#fff');
      px(x + 19, by + 3, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    case 'luchito': // Camisa gris oscuro, abajo negro, rosa, MÁS DELGADO
      px(x + 10, by + 26, 4, 4, '#1A1A1A');
      px(x + 19, by + 26, 4, 4, '#1A1A1A');
      px(x + 10, by + 22, 4, 5, '#1A1A1A');
      px(x + 19, by + 22, 4, 5, '#1A1A1A'); // Más delgado
      px(x + 7, by + 11, 18, 10, '#484858');
      px(x + 9, by + 12, 14, 8, '#585868');
      px(x + 11, by + 13, 10, 6, '#686878');
      // Camisa interior
      px(x + 11, by + 12, 10, 6, '#F0F0F0');
      // Corbatín
      px(x + 14, by + 11, 4, 2, '#181818');
      px(x + 15, by + 10, 2, 1, '#181818');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      // Rosa
      px(x + 26, by + 14, 3, 3, '#D83838');
      px(x + 27, by + 16, 1, 6, '#308028');
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo elegante
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by - 1, 3, 3, '#1A1A1A');
      px(x + 8, by - 3, 5, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#3A2020');
      px(x + 19, by + 4, 2, 2, '#3A2020');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 13, by + 8, 6, 1, '#C08868');
      px(x + 14, by + 9, 4, 1, '#C08868');
      break;

    case 'ximena': // Sombrero catrina, escote, color vino y negro, pelo ondulado
      px(x + 10, by + 26, 4, 4, '#4A1828');
      px(x + 18, by + 26, 4, 4, '#4A1828');
      px(x + 7, by + 16, 18, 11, '#1A1A1A');
      px(x + 6, by + 18, 20, 9, '#282828');
      // Parte superior vino con ESCOTE
      px(x + 6, by + 11, 20, 6, '#882838');
      px(x + 8, by + 12, 16, 4, '#983848');
      px(x + 12, by + 11, 8, 3, SK.a); // Escote V
      px(x + 14, by + 12, 4, 2, SK.b);
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO ONDULADO
      px(x + 7, by - 2, 18, 4, '#1A1A1A');
      px(x + 6, by + 0, 4, 12, '#1A1A1A');
      px(x + 22, by + 0, 4, 12, '#1A1A1A');
      px(x + 6, by + 4, 2, 2, '#282828');
      px(x + 24, by + 4, 2, 2, '#282828'); // Ondas
      px(x + 6, by + 8, 2, 2, '#282828');
      px(x + 24, by + 8, 2, 2, '#282828');
      // SOMBRERO GRANDE estilo catrina con flores
      px(x + 2, by - 6, 28, 4, '#882838');
      px(x + 4, by - 8, 24, 4, '#983848');
      px(x + 8, by - 9, 16, 3, '#A84858');
      // Flores en sombrero
      px(x + 6, by - 8, 3, 3, '#F088A0');
      px(x + 14, by - 9, 3, 3, '#E8C830');
      px(x + 22, by - 8, 3, 3, '#F088A0');
      px(x + 10, by - 7, 2, 2, '#F8F8F8');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 3, '#2A2020');
      px(x + 19, by + 4, 2, 3, '#2A2020'); // Mirando a un lado
      px(x + 13, by + 5, 1, 1, '#fff');
      px(x + 19, by + 5, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#D0A088');
      break;

    case 'andrea': // Profesora medieval, lentes, pelo recogido con lápiz
      px(x + 10, by + 26, 4, 4, '#6A4A28');
      px(x + 18, by + 26, 4, 4, '#6A4A28');
      px(x + 7, by + 18, 18, 9, '#2858A0');
      px(x + 6, by + 20, 20, 7, '#3868B0');
      px(x + 5, by + 11, 22, 8, '#E8E8E8');
      px(x + 7, by + 12, 18, 6, '#F0F0F0');
      px(x + 8, by + 11, 16, 6, '#2858A0');
      px(x + 12, by + 11, 8, 6, '#F0F0F0');
      px(x + 3, by + 12, 4, 7, SK.a);
      px(x + 25, by + 12, 4, 7, SK.a);
      px(x + 26, by + 14, 4, 6, '#3868A8');
      px(x + 27, by + 15, 2, 4, '#F0F0F0'); // Libro
      px(x + 13, by + 9, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      // Pelo NEGRO recogido
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 7, by + 0, 3, 5, '#1A1A1A');
      px(x + 22, by + 0, 3, 5, '#1A1A1A');
      px(x + 14, by - 4, 6, 4, '#1A1A1A'); // Moño
      px(x + 20, by - 4, 2, 6, '#E8C830');
      px(x + 20, by - 5, 2, 2, '#D03030'); // Lápiz
      // Lentes rectangulares
      px(x + 10, by + 3, 5, 3, '#404040');
      px(x + 11, by + 4, 3, 1, '#B8D0F0');
      px(x + 17, by + 3, 5, 3, '#404040');
      px(x + 18, by + 4, 3, 1, '#B8D0F0');
      px(x + 15, by + 4, 2, 1, '#404040');
      px(x + 12, by + 4, 1, 1, '#2A1818');
      px(x + 19, by + 4, 1, 1, '#2A1818');
      px(x + 14, by + 7, 4, 1, '#D0A088');
      break;

    case 'oscar': // Explorador maduro, delgado, estatura promedio
      px(x + 10, by + 26, 4, 4, '#5A3A1A');
      px(x + 18, by + 26, 4, 4, '#5A3A1A');
      px(x + 10, by + 21, 4, 6, '#6A7880');
      px(x + 18, by + 21, 4, 6, '#6A7880');
      px(x + 7, by + 10, 18, 12, '#8A6A40');
      px(x + 9, by + 11, 14, 10, '#A08050');
      px(x + 11, by + 12, 10, 8, '#B89060');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 26, by + 8, 2, 22, '#6A4828'); // bastón de explorador
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 4, 16, 5, '#7A5A30');
      px(x + 6, by - 2, 20, 3, '#A08040'); // sombrero ala
      px(x + 10, by - 5, 12, 3, '#907038');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#302010');
      px(x + 19, by + 5, 2, 2, '#302010');
      px(x + 14, by + 8, 4, 1, '#B08060');
      break;

    case 'piero': // Explorador con cabello rubio teñido por apuesta
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 21, 5, 6, '#4A5F70');
      px(x + 18, by + 21, 5, 6, '#4A5F70');
      px(x + 5, by + 10, 22, 12, '#406850');
      px(x + 7, by + 11, 18, 10, '#508060');
      px(x + 9, by + 12, 14, 8, '#68A070');
      px(x + 3, by + 12, 4, 8, SK.b);
      px(x + 25, by + 12, 4, 8, SK.b);
      px(x + 22, by + 13, 5, 8, '#7A5A38'); // morral
      px(x + 13, by + 8, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 7, by - 3, 18, 6, '#E8D050');
      px(x + 8, by - 4, 16, 3, '#F8E870');
      px(x + 7, by + 1, 4, 4, '#D8B840');
      px(x + 21, by + 1, 4, 4, '#D8B840');
      px(x + 12, by + 4, 3, 3, '#fff');
      px(x + 18, by + 4, 3, 3, '#fff');
      px(x + 13, by + 5, 2, 2, '#2A1810');
      px(x + 19, by + 5, 2, 2, '#2A1810');
      px(x + 13, by + 8, 6, 1, '#C08868');
      break;

    case 'chrys': // Productora, cabello negro largo, blanco arriba azul abajo
      px(x + 10, by + 26, 4, 4, '#3A2A18');
      px(x + 18, by + 26, 4, 4, '#3A2A18');
      px(x + 8, by + 18, 16, 9, '#2858A0');
      px(x + 7, by + 20, 18, 7, '#3868B0');
      px(x + 5, by + 10, 22, 9, '#E8E8E8');
      px(x + 7, by + 11, 18, 7, '#FFFFFF');
      px(x + 10, by + 12, 12, 5, '#F8F8F8');
      px(x + 3, by + 12, 4, 8, SK.a);
      px(x + 25, by + 12, 4, 8, SK.a);
      px(x + 24, by + 10, 5, 7, '#6A4A28'); // libreta de producción
      px(x + 25, by + 11, 3, 5, '#F0E0A0');
      px(x + 13, by + 8, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 10, SK.a);
      px(x + 10, by + 1, 12, 8, SK.d);
      px(x + 7, by - 2, 18, 5, '#111');
      px(x + 6, by + 1, 4, 15, '#111');
      px(x + 22, by + 1, 4, 15, '#111');
      px(x + 5, by + 12, 3, 8, '#080808');
      px(x + 24, by + 12, 3, 8, '#080808');
      px(x + 8, by - 3, 16, 2, '#282828');
      px(x + 11, by + 4, 4, 4, '#fff');
      px(x + 18, by + 4, 4, 4, '#fff');
      px(x + 13, by + 5, 2, 2, '#201010');
      px(x + 20, by + 5, 2, 2, '#201010');
      px(x + 13, by + 8, 6, 2, '#E08888');
      break;

    // ==========================================
    // CUEVA
    // ==========================================

    case 'salogon': // Vidente gris con capucha
      px(x + 10, by + 27, 5, 3, '#3A3A42');
      px(x + 18, by + 27, 5, 3, '#3A3A42');
      px(x + 5, by + 11, 22, 17, '#555965');
      px(x + 7, by + 12, 18, 15, '#666A76');
      px(x + 9, by + 14, 14, 12, '#4A4D58');
      px(x + 4, by + 13, 4, 10, '#4D515C');
      px(x + 24, by + 13, 4, 10, '#4D515C');
      px(x + 13, by + 8, 6, 4, '#B8A090');
      px(x + 8, by - 2, 16, 13, '#3F424C');
      px(x + 6, by + 0, 20, 7, '#565A66');
      px(x + 9, by + 3, 14, 8, '#2A2C34');
      px(x + 12, by + 5, 2, 2, '#C8D8F8');
      px(x + 19, by + 5, 2, 2, '#C8D8F8');
      px(x + 15, by + 8, 3, 1, '#8A7070');
      // Orbe del vidente
      px(x + 25, by + 18, 5, 5, '#90A0D8');
      px(x + 26, by + 19, 3, 3, '#C8D8FF');
      break;

    case 'oloman': // Mohawk rojo, chaqueta cuero, estoperoles, piercings
      px(x + 8, by + 24, 6, 6, '#181818');
      px(x + 18, by + 24, 6, 6, '#181818');
      px(x + 9, by + 25, 1, 1, '#C8C8C8');
      px(x + 19, by + 25, 1, 1, '#C8C8C8'); // Hebillas
      px(x + 9, by + 22, 5, 3, '#101010');
      px(x + 18, by + 22, 5, 3, '#101010');
      px(x + 5, by + 10, 22, 12, '#282828');
      px(x + 7, by + 11, 18, 10, '#383838');
      px(x + 5, by + 11, 2, 2, '#C8C8C8');
      px(x + 25, by + 11, 2, 2, '#C8C8C8'); // Estoperoles
      px(x + 7, by + 10, 2, 2, '#C8C8C8');
      px(x + 23, by + 10, 2, 2, '#C8C8C8');
      px(x + 10, by + 14, 12, 5, '#F0F0F0');
      px(x + 11, by + 15, 10, 3, '#D03030'); // Parche
      px(x + 5, by + 20, 3, 2, '#A8A8A8');
      px(x + 7, by + 21, 4, 1, '#A8A8A8'); // Cadenas
      px(x + 4, by + 12, 4, 7, SK.d);
      px(x + 24, by + 12, 4, 7, SK.d);
      px(x + 13, by + 8, 6, 3, SK.d);
      px(x + 9, by + 0, 14, 10, SK.d);
      px(x + 10, by + 1, 12, 8, SK.d);
      // MOHAWK ROJO
      px(x + 13, by - 10, 6, 12, '#D02020');
      px(x + 14, by - 12, 4, 10, '#E03030');
      px(x + 15, by - 14, 2, 8, '#F04040');
      px(x + 9, by + 1, 4, 5, '#C8A080');
      px(x + 19, by + 1, 4, 5, '#C8A080'); // Lados rapados
      // Ojos con delineador
      px(x + 11, by + 3, 4, 3, '#fff');
      px(x + 18, by + 3, 4, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#181818');
      px(x + 20, by + 4, 2, 2, '#181818');
      px(x + 11, by + 3, 4, 1, '#282828');
      px(x + 18, by + 3, 4, 1, '#282828');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 20, by + 4, 1, 1, '#fff');
      px(x + 16, by + 6, 1, 2, '#C8C8C8');
      px(x + 10, by + 5, 1, 1, '#C8C8C8'); // Piercings
      px(x + 14, by + 8, 4, 1, '#A88070');
      break;

    // ==========================================
    // CASTILLO
    // ==========================================

    case 'yam': // Pre-game con casco; post-game sin casco
      if (!postGame) {
        // Armadura tosca con cuernos y hacha
        px(x + 8, by + 26, 6, 4, '#565A60');
        px(x + 18, by + 26, 6, 4, '#565A60');
        px(x + 9, by + 22, 5, 5, '#6A6E76');
        px(x + 18, by + 22, 5, 5, '#6A6E76');
        px(x + 4, by + 10, 24, 12, '#707782');
        px(x + 6, by + 11, 20, 10, '#858C98');
        px(x + 8, by + 13, 16, 7, '#59606A');
        px(x + 1, by + 9, 6, 5, '#7C838E');
        px(x + 25, by + 9, 6, 5, '#7C838E');
        // Hacha
        px(x + 28, by + 8, 2, 22, '#6A4828');
        px(x + 25, by + 7, 7, 5, '#A8B0B8');
        px(x + 27, by + 6, 5, 7, '#C0C8D0');
        // Casco con cuernos
        px(x + 8, by - 1, 16, 12, '#68707C');
        px(x + 10, by + 1, 12, 9, '#808894');
        px(x + 11, by + 4, 4, 2, '#151515');
        px(x + 18, by + 4, 4, 2, '#151515');
        px(x + 5, by - 3, 5, 3, '#D8D0B0');
        px(x + 22, by - 3, 5, 3, '#D8D0B0');
        px(x + 3, by - 5, 4, 2, '#F0E8C8');
        px(x + 25, by - 5, 4, 2, '#F0E8C8');
        px(x + 14, by + 8, 4, 1, '#303030');
      } else {
        // Sin casco: chica sociable de cabello negro largo, iris negros sin escleróticas
        px(x + 8, by + 26, 6, 4, '#8090A0');
        px(x + 18, by + 26, 6, 4, '#8090A0');
        px(x + 9, by + 22, 5, 5, '#8898A8');
        px(x + 18, by + 22, 5, 5, '#8898A8');
        px(x + 4, by + 10, 24, 12, '#A0B0C0');
        px(x + 6, by + 11, 20, 10, '#B0C0D0');
        px(x + 8, by + 12, 16, 8, '#C0D0E0');
        px(x + 12, by + 13, 8, 6, '#E8C830');
        px(x + 14, by + 14, 4, 4, '#D8B820');
        px(x + 1, by + 10, 5, 4, '#A0B0C0');
        px(x + 26, by + 10, 5, 4, '#A0B0C0');
        px(x + 13, by + 8, 6, 3, SK.a);
        px(x + 9, by + 0, 14, 10, SK.a);
        px(x + 10, by + 1, 12, 8, SK.d);
        px(x + 7, by - 2, 18, 5, '#111');
        px(x + 6, by + 1, 4, 17, '#111');
        px(x + 22, by + 1, 4, 17, '#111');
        px(x + 5, by + 14, 3, 8, '#080808');
        px(x + 24, by + 14, 3, 8, '#080808');
        px(x + 8, by - 3, 16, 2, '#282828');
        px(x + 12, by + 4, 3, 3, '#050505');
        px(x + 18, by + 4, 3, 3, '#050505');
        px(x + 13, by + 4, 1, 1, '#303030');
        px(x + 19, by + 4, 1, 1, '#303030');
        px(x + 13, by + 8, 6, 2, '#E08888');
        px(x + 15, by + 8, 2, 1, '#F8F8F8');
        if (fr % 40 < 20) {
          cx.fillStyle = '#E8C830';
          cx.font = '10px "Press Start 2P"';
          cx.fillText('!', x + 28, by - 4);
        }
      }
      break;

    case 'ravell': // Bufón amarillo y verde rayas
      px(x + 6, by + 27, 7, 3, '#E8C830');
      px(x + 19, by + 27, 7, 3, '#38A038');
      px(x + 9, by + 22, 5, 6, '#D8B820');
      px(x + 18, by + 22, 5, 6, '#28A028');
      // Cuerpo rayas amarillo/verde
      px(x + 4, by + 10, 12, 12, '#E8C830');
      px(x + 16, by + 10, 12, 12, '#38A038');
      // Rayas
      px(x + 6, by + 12, 2, 8, '#38A038');
      px(x + 10, by + 12, 2, 8, '#38A038');
      px(x + 18, by + 12, 2, 8, '#E8C830');
      px(x + 22, by + 12, 2, 8, '#E8C830');
      px(x + 6, by + 9, 20, 2, '#F0F0F0'); // Collar
      px(x + 13, by + 7, 6, 3, SK.a);
      px(x + 9, by + 0, 14, 9, SK.a);
      px(x + 10, by + 1, 12, 7, SK.d);
      // Gorro bufón
      px(x + 6, by - 7, 10, 9, '#E8C830');
      px(x + 16, by - 7, 10, 9, '#38A038');
      px(x + 5, by - 8, 3, 3, '#F8D030');
      px(x + 24, by - 8, 3, 3, '#48B048');
      px(x + 14, by - 10, 4, 3, '#F8D030');
      // Cascabeles
      px(x + 5, by - 8, 2, 2, '#C8C8C8');
      px(x + 25, by - 8, 2, 2, '#C8C8C8');
      px(x + 15, by - 10, 2, 2, '#C8C8C8');
      px(x + 13, by + 3, 2, 3, '#283848');
      px(x + 19, by + 3, 2, 3, '#283848');
      px(x + 14, by + 7, 4, 1, '#C09888');
      break;

    case 'boss': // Rey con barba larga blanca, corona, capa roja, armadura
      px(x + 6, by + 26, 7, 4, '#586878');
      px(x + 19, by + 26, 7, 4, '#586878');
      px(x + 7, by + 20, 6, 7, '#687888');
      px(x + 19, by + 20, 6, 7, '#687888');
      px(x + 2, by + 8, 28, 13, '#687888');
      px(x + 4, by + 9, 24, 11, '#789098');
      px(x + 6, by + 10, 20, 9, '#88A0A8');
      px(x + 12, by + 11, 8, 7, '#E8C830');
      px(x + 14, by + 13, 4, 3, '#D8B820');
      // Capa roja
      px(x + 0, by + 8, 4, 20, '#A82020');
      px(x + 28, by + 8, 4, 20, '#A82020');
      px(x + 1, by + 10, 2, 16, '#C83030');
      px(x + 29, by + 10, 2, 16, '#C83030');
      px(x + 0, by + 26, 4, 3, '#E8E8E8');
      px(x + 28, by + 26, 4, 3, '#E8E8E8'); // Armiño
      px(x + 12, by + 5, 8, 4, SK.a);
      px(x + 8, by - 4, 16, 11, SK.a);
      px(x + 9, by - 3, 14, 9, SK.d);
      // BARBA LARGA BLANCA
      px(x + 10, by + 5, 12, 5, '#E8E8E8');
      px(x + 11, by + 9, 10, 4, '#E0E0E0');
      px(x + 12, by + 12, 8, 3, '#D8D8D8');
      px(x + 13, by + 14, 6, 2, '#D0D0D0');
      // Ojos
      px(x + 12, by + 0, 3, 3, '#fff');
      px(x + 18, by + 0, 3, 3, '#fff');
      px(x + 13, by + 1, 2, 2, '#384858');
      px(x + 19, by + 1, 2, 2, '#384858');
      px(x + 12, by - 1, 3, 1, '#C0C0C0');
      px(x + 18, by - 1, 3, 1, '#C0C0C0'); // Cejas canosas
      // CORONA con gemas
      px(x + 7, by - 9, 18, 5, '#E8C830');
      px(x + 9, by - 12, 3, 5, '#E8C830');
      px(x + 15, by - 13, 3, 6, '#E8C830');
      px(x + 21, by - 12, 3, 5, '#E8C830');
      px(x + 10, by - 11, 2, 2, '#D03030');
      px(x + 15, by - 12, 3, 2, '#3060D0');
      px(x + 21, by - 11, 2, 2, '#30C030');
      // Pelo canoso
      px(x + 7, by - 5, 3, 7, '#C0C0C0');
      px(x + 22, by - 5, 3, 7, '#C0C0C0');
      break;

    // ==========================================
    // POST-GAME: EDISON
    // ==========================================

    case 'edison': // Pelo negro, anteojos negros, ropa medieval genial
      px(x + 9, by + 26, 5, 4, '#4A3018');
      px(x + 18, by + 26, 5, 4, '#4A3018');
      px(x + 9, by + 22, 5, 5, '#2A2838');
      px(x + 18, by + 22, 5, 5, '#2A2838');
      px(x + 6, by + 11, 20, 10, '#3A5068');
      px(x + 8, by + 12, 16, 8, '#4A6078');
      px(x + 10, by + 13, 12, 6, '#5A7088');
      // Detalles elegantes
      px(x + 10, by + 12, 12, 1, '#C8A830');
      px(x + 7, by + 20, 18, 2, '#4A2A10');
      px(x + 14, by + 20, 4, 2, '#C8A830');
      px(x + 4, by + 12, 4, 8, SK.b);
      px(x + 24, by + 12, 4, 8, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      // Pelo NEGRO
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 7, by + 0, 3, 4, '#1A1A1A');
      px(x + 22, by + 0, 3, 4, '#1A1A1A');
      // ANTEOJOS NEGROS
      px(x + 10, by + 3, 5, 4, '#1A1A1A');
      px(x + 11, by + 4, 3, 2, '#303848');
      px(x + 17, by + 3, 5, 4, '#1A1A1A');
      px(x + 18, by + 4, 3, 2, '#303848');
      px(x + 15, by + 4, 2, 1, '#1A1A1A');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;

    default: // NPC genérico
      px(x + 9, by + 26, 5, 4, '#5A3818');
      px(x + 18, by + 26, 5, 4, '#5A3818');
      px(x + 9, by + 22, 5, 5, '#3A3028');
      px(x + 18, by + 22, 5, 5, '#3A3028');
      px(x + 6, by + 11, 20, 10, '#4A6888');
      px(x + 8, by + 12, 16, 8, '#5A78A0');
      px(x + 4, by + 12, 4, 7, SK.b);
      px(x + 24, by + 12, 4, 7, SK.b);
      px(x + 13, by + 9, 6, 3, SK.b);
      px(x + 9, by + 0, 14, 10, SK.b);
      px(x + 10, by + 1, 12, 8, SK.a);
      px(x + 8, by - 2, 16, 4, '#1A1A1A');
      px(x + 9, by - 3, 14, 2, '#282828');
      px(x + 12, by + 3, 3, 3, '#fff');
      px(x + 18, by + 3, 3, 3, '#fff');
      px(x + 13, by + 4, 2, 2, '#283848');
      px(x + 19, by + 4, 2, 2, '#283848');
      px(x + 13, by + 4, 1, 1, '#fff');
      px(x + 19, by + 4, 1, 1, '#fff');
      px(x + 14, by + 8, 4, 1, '#C08868');
      break;
  } // fin switch
} // fin dNPC
// ============================================================
// BLOQUE 5: SPRITES GRANDES DE ENTRENADORES (INTRO BATALLA)
// ====================================================

function dTrainerBig(x, y, id, f) {
  const bob = Math.sin(f * 0.08) * 2,
    by = y + bob;

  switch (id) {
    case 'alessandro': // Armadura parcial, rojo/azul, pelo castaño
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 18, by + 44, 14, 18, '#2848A0');
      px(x + 32, by + 44, 14, 18, '#2848A0');
      px(x + 20, by + 46, 10, 14, '#3058B0');
      px(x + 34, by + 46, 10, 14, '#3058B0');
      px(x + 10, by + 20, 44, 24, '#B83030');
      px(x + 14, by + 22, 36, 20, '#C84040');
      px(x + 18, by + 24, 28, 16, '#D85050');
      px(x + 6, by + 18, 8, 8, '#90A0B0');
      px(x + 50, by + 18, 8, 8, '#90A0B0');
      px(x + 8, by + 20, 4, 4, '#A8B8C8');
      px(x + 52, by + 20, 4, 4, '#A8B8C8');
      px(x + 22, by + 24, 20, 8, '#90A0B0');
      px(x + 26, by + 26, 12, 4, '#A8B8C8');
      px(x + 12, by + 40, 40, 4, '#C8A830');
      px(x + 28, by + 39, 8, 5, '#E8C840');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 6, '#90A0B0');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 26, by + 16, 12, 4, SK.a);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 10, '#6A4A28');
      px(x + 14, by - 4, 6, 10, '#6A4A28');
      px(x + 44, by - 4, 6, 10, '#6A4A28');
      px(x + 18, by - 10, 28, 6, '#7A5A38');
      px(x + 18, by + 2, 8, 4, '#6A4A28');
      px(x + 24, by - 8, 6, 2, '#8A6A48');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A4818');
      px(x + 39, by + 8, 3, 3, '#2A4818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'fabiana': // Vestido negro completo, pelo negro largo
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      px(x + 10, by + 20, 44, 18, '#1A1A1A');
      px(x + 14, by + 22, 36, 14, '#282828');
      px(x + 18, by + 24, 28, 10, '#383838');
      px(x + 20, by + 20, 24, 4, '#E8E8E8'); // Cuello blanco decorativo
      px(x + 6, by + 24, 8, 14, SK.d);
      px(x + 50, by + 24, 8, 14, SK.d);
      px(x + 24, by + 14, 16, 8, SK.d);
      px(x + 18, by - 2, 28, 18, SK.d);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo largo negro
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 28, '#1A1A1A');
      px(x + 44, by - 2, 8, 28, '#1A1A1A');
      px(x + 10, by + 18, 6, 12, '#101010');
      px(x + 48, by + 18, 6, 12, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      // Ojos azules grandes
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2860A0');
      px(x + 39, by + 6, 4, 4, '#2860A0');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      // Pestañas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 4, 2, 1, '#1A1A1A');
      px(x + 36, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#E08080');
      break;

    case 'nicole': // Harapos, pelo honguito, crucificada post-game
      px(x + 20, by + 62, 10, 6, SK.e);
      px(x + 34, by + 62, 10, 6, SK.e);
      px(x + 22, by + 62, 6, 2, '#4A3A28');
      px(x + 14, by + 36, 36, 28, '#5A4A38');
      px(x + 16, by + 38, 32, 24, '#6A5A48');
      px(x + 14, by + 58, 6, 6, '#5A4A38');
      px(x + 44, by + 56, 6, 8, '#5A4A38');
      px(x + 20, by + 60, 4, 2, '#6A5A48');
      px(x + 40, by + 60, 4, 2, '#6A5A48');
      px(x + 10, by + 20, 44, 18, '#4A3A28');
      px(x + 14, by + 22, 36, 14, '#5A4A38');
      px(x + 18, by + 28, 8, 6, '#7A6A58');
      px(x + 36, by + 32, 6, 6, '#6A5A48');
      px(x + 14, by + 34, 36, 2, '#8A7A60');
      px(x + 8, by + 24, 8, 14, '#4A3A28');
      px(x + 48, by + 24, 8, 14, '#4A3A28');
      px(x + 10, by + 28, 4, 4, SK.e);
      px(x + 24, by + 14, 16, 8, SK.e);
      px(x + 18, by - 2, 28, 18, SK.e);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Honguito
      px(x + 14, by - 10, 36, 12, '#1A1A1A');
      px(x + 12, by - 4, 40, 8, '#1A1A1A');
      px(x + 14, by + 2, 8, 4, '#1A1A1A');
      px(x + 42, by + 2, 8, 4, '#1A1A1A');
      px(x + 18, by + 0, 28, 4, '#282828');
      // Ojeras
      px(x + 20, by + 12, 8, 2, '#C8A098');
      px(x + 36, by + 12, 8, 2, '#C8A098');
      px(x + 20, by + 4, 8, 2, '#1A1A1A');
      px(x + 38, by + 4, 8, 2, '#1A1A1A');
      px(x + 18, by + 10, 4, 2, '#B09878');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#381828');
      px(x + 39, by + 8, 3, 3, '#381828');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      if (postGame) {
        px(x + 28, by + 14, 8, 2, '#887068');
      } else {
        px(x + 28, by + 14, 8, 2, '#986858');
      }
      if (postGame) {
        px(x - 4, by - 16, 72, 6, '#5A3818');
        px(x + 28, by - 24, 8, 92, '#5A3818');
        px(x - 2, by - 14, 68, 2, '#6A4828');
        px(x + 30, by - 22, 4, 88, '#6A4828');
      }
      break;

    case 'claudia': // Anteojos morados, arriba blanco abajo negro, pendientes
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 36, 14, '#F0F0F0');
      px(x + 18, by + 24, 28, 10, '#F8F8F8');
      px(x + 18, by + 22, 28, 2, '#D0D0D0');
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo largo liso negro
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 32, '#1A1A1A');
      px(x + 44, by - 2, 8, 32, '#1A1A1A');
      px(x + 10, by + 22, 6, 10, '#101010');
      px(x + 48, by + 22, 6, 10, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      // Diadema dorada
      px(x + 16, by - 6, 32, 3, '#C8A830');
      px(x + 28, by - 8, 8, 4, '#E8C840');
      // Anteojos MORADOS
      px(x + 18, by + 4, 10, 8, '#6030A0');
      px(x + 20, by + 6, 6, 4, '#C8A0E8');
      px(x + 34, by + 4, 10, 8, '#6030A0');
      px(x + 36, by + 6, 6, 4, '#C8A0E8');
      px(x + 28, by + 6, 6, 2, '#6030A0');
      px(x + 22, by + 7, 3, 2, '#2A1818');
      px(x + 38, by + 7, 3, 2, '#2A1818');
      // Pendientes dorados
      px(x + 16, by + 8, 2, 4, '#C8A830');
      px(x + 46, by + 8, 2, 4, '#C8A830');
      px(x + 28, by + 14, 8, 2, '#E08888');
      break;

    case 'roberto': // Tez oscura, pelo castaño ondulado, arriba beige abajo naranja
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 18, by + 42, 14, 20, '#D07020');
      px(x + 32, by + 42, 14, 20, '#D07020');
      px(x + 20, by + 44, 10, 16, '#E08030');
      px(x + 34, by + 44, 10, 16, '#E08030');
      px(x + 10, by + 20, 44, 22, '#D8C8A0');
      px(x + 14, by + 22, 36, 18, '#E0D0B0');
      px(x + 18, by + 24, 28, 14, '#E8D8B8');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.b);
      // Pelo NEGRO ondulado
      px(x + 16, by - 8, 32, 10, '#141210');
      px(x + 14, by - 4, 6, 10, '#141210');
      px(x + 44, by - 4, 6, 10, '#141210');
      px(x + 18, by - 10, 8, 4, '#2C2620');
      px(x + 32, by - 10, 8, 4, '#2C2620');
      px(x + 14, by + 0, 4, 4, '#2C2620');
      px(x + 46, by + 0, 4, 4, '#2C2620');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#241208');
      px(x + 39, by + 8, 3, 3, '#241208');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#B08060');
      px(x + 28, by + 16, 8, 2, '#B08060');
      break;

    case 'brisa': // Pelo castaño suelto ondulado, blanco/negro arriba, azul gris abajo
      px(x + 20, by + 60, 10, 8, '#5A3818');
      px(x + 34, by + 60, 10, 8, '#5A3818');
      px(x + 16, by + 38, 32, 24, '#708898');
      px(x + 18, by + 40, 28, 20, '#8098A8');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 20, 8, '#1A1A1A');
      px(x + 34, by + 22, 16, 8, '#1A1A1A');
      px(x + 18, by + 24, 28, 4, '#282828');
      // Delantal con corazón
      px(x + 18, by + 28, 28, 18, '#F0F0F0');
      px(x + 20, by + 30, 24, 14, '#F8F8F8');
      px(x + 28, by + 34, 8, 6, '#D06070');
      px(x + 30, by + 32, 4, 2, '#D06070');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo castaño suelto (largo, enmarca el rostro)
      px(x + 14, by - 8, 36, 10, '#6A4A28');
      px(x + 12, by - 4, 6, 14, '#6A4A28');
      px(x + 46, by - 4, 6, 14, '#6A4A28');
      px(x + 16, by - 10, 32, 4, '#7A5A38');
      px(x + 14, by + 8, 4, 6, '#5A3A20');
      px(x + 46, by + 8, 4, 6, '#5A3A20');
      px(x + 24, by - 12, 6, 4, '#7A5A38');
      px(x + 32, by - 12, 6, 4, '#7A5A38');
      // Mejillas rosadas
      px(x + 20, by + 10, 4, 4, '#F0A0A0');
      px(x + 40, by + 10, 4, 4, '#F0A0A0');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#4A3018');
      px(x + 39, by + 6, 4, 4, '#4A3018');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D09080');
      break;

    case 'paulo': // Sin anteojos, arriba marrón abajo verde, libro en mano
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#388038');
      px(x + 32, by + 44, 14, 18, '#388038');
      px(x + 20, by + 46, 10, 14, '#409040');
      px(x + 34, by + 46, 10, 14, '#409040');
      px(x + 10, by + 20, 44, 24, '#785838');
      px(x + 14, by + 22, 36, 20, '#886848');
      px(x + 18, by + 24, 28, 16, '#987858');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      // Libro en mano
      px(x + 50, by + 30, 10, 12, '#8A2020');
      px(x + 52, by + 32, 6, 8, '#F0F0F0');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro corto
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 24, by - 8, 6, 2, '#383838');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#283848');
      px(x + 39, by + 8, 3, 3, '#283848');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'tamara': // Pelo negro rizado largo, traje artista morado, boina, pincel
      px(x + 20, by + 60, 10, 8, '#7A5A38');
      px(x + 34, by + 60, 10, 8, '#7A5A38');
      px(x + 16, by + 36, 32, 26, '#604878');
      px(x + 18, by + 38, 28, 22, '#685080');
      px(x + 10, by + 20, 44, 18, '#705888');
      px(x + 14, by + 22, 36, 14, '#806898');
      px(x + 18, by + 24, 28, 10, '#9078A8');
      // Manchas de pintura
      px(x + 18, by + 28, 6, 4, '#D03030');
      px(x + 40, by + 32, 4, 4, '#3090D0');
      px(x + 24, by + 44, 4, 4, '#E8C020');
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      // Pincel grande en mano
      px(x + 52, by + 22, 4, 18, '#B89060');
      px(x + 52, by + 18, 4, 6, '#D03030');
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo NEGRO RIZADO largo
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 30, '#1A1A1A');
      px(x + 44, by - 2, 8, 30, '#1A1A1A');
      // Rizos zigzag
      px(x + 10, by + 6, 4, 4, '#282828');
      px(x + 12, by + 14, 4, 4, '#282828');
      px(x + 10, by + 22, 4, 4, '#282828');
      px(x + 48, by + 6, 4, 4, '#282828');
      px(x + 46, by + 14, 4, 4, '#282828');
      px(x + 48, by + 22, 4, 4, '#282828');
      // Boina
      px(x + 16, by - 14, 32, 8, '#483060');
      px(x + 20, by - 16, 24, 6, '#584070');
      px(x + 28, by - 18, 8, 4, '#584070');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#4A2838');
      px(x + 39, by + 6, 4, 4, '#4A2838');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#E08888');
      break;

    case 'nahuel': // Arriba negro, shorts, pelo negro corto
      px(x + 20, by + 60, 10, 8, '#8A6840');
      px(x + 34, by + 60, 10, 8, '#8A6840');
      px(x + 20, by + 52, 10, 8, SK.b);
      px(x + 34, by + 52, 10, 8, SK.b); // Piernas
      px(x + 18, by + 42, 14, 12, '#1A1A1A');
      px(x + 32, by + 42, 14, 12, '#1A1A1A'); // Shorts
      px(x + 10, by + 20, 44, 22, '#1A1A1A');
      px(x + 14, by + 22, 36, 18, '#282828');
      px(x + 18, by + 24, 28, 14, '#383838');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A1818');
      px(x + 39, by + 8, 3, 3, '#2A1818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 24, by + 14, 16, 2, '#C08868');
      px(x + 26, by + 16, 12, 2, '#C08868');
      break;

    case 'pachi': // Traje teatral, capa morada
      px(x + 20, by + 60, 10, 8, '#4A2A10');
      px(x + 34, by + 60, 10, 8, '#4A2A10');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#3A2848');
      px(x + 14, by + 22, 36, 20, '#4A3858');
      px(x + 18, by + 24, 28, 16, '#5A4868');
      px(x + 18, by + 22, 28, 2, '#C8A830');
      px(x + 18, by + 36, 28, 2, '#C8A830');
      px(x + 4, by + 16, 8, 36, '#6830A0');
      px(x + 52, by + 16, 8, 36, '#6830A0');
      px(x + 6, by + 18, 4, 32, '#7840B0');
      px(x + 54, by + 18, 4, 32, '#7840B0');
      px(x + 22, by + 22, 20, 6, '#C83030');
      px(x + 24, by + 26, 16, 4, '#D84040');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo ondulado negro
      px(x + 14, by - 10, 36, 10, '#1A1A1A');
      px(x + 12, by - 4, 8, 14, '#1A1A1A');
      px(x + 44, by - 4, 8, 14, '#1A1A1A');
      px(x + 16, by - 12, 10, 6, '#282828');
      px(x + 36, by - 12, 10, 6, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#382818');
      px(x + 39, by + 8, 3, 3, '#382818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'gabriela': // Arriba magenta/armadura post, abajo negro, pelo ondulado con flores
      px(x + 20, by + 60, 10, 8, '#282828');
      px(x + 34, by + 60, 10, 8, '#282828');
      px(x + 16, by + 36, 32, 26, '#1A1A1A');
      px(x + 18, by + 38, 28, 22, '#282828');
      if (postGame) {
        px(x + 10, by + 20, 44, 18, '#90A0B0');
        px(x + 14, by + 22, 36, 14, '#A0B0C0');
        px(x + 18, by + 24, 28, 10, '#B0C0D0');
        px(x + 24, by + 26, 16, 8, '#C8A830');
        px(x + 28, by + 28, 8, 4, '#E8C840');
      } else {
        px(x + 10, by + 20, 44, 18, '#C83888');
        px(x + 14, by + 22, 36, 14, '#D84898');
        px(x + 18, by + 24, 28, 10, '#E858A8');
      }
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.c);
      // Pelo negro ondulado largo con flores
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 32, '#1A1A1A');
      px(x + 44, by - 2, 8, 32, '#1A1A1A');
      px(x + 10, by + 14, 6, 16, '#101010');
      px(x + 48, by + 14, 6, 16, '#101010');
      // Ondulaciones
      px(x + 10, by + 18, 4, 4, '#282828');
      px(x + 50, by + 18, 4, 4, '#282828');
      px(x + 10, by + 26, 4, 4, '#282828');
      px(x + 50, by + 26, 4, 4, '#282828');
      // Flores en pelo
      px(x + 16, by - 4, 4, 4, '#F088A0');
      px(x + 44, by - 4, 4, 4, '#88B8F0');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#6A4028');
      px(x + 39, by + 6, 4, 4, '#6A4028');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      // Pestañas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#B08060');
      break;

    case 'hernan': // Todo negro, barba corta (sin barba post-game), ojos melancólicos
      px(x + 20, by + 60, 10, 8, '#1A1A1A');
      px(x + 34, by + 60, 10, 8, '#1A1A1A');
      px(x + 18, by + 42, 14, 20, '#1A1A1A');
      px(x + 32, by + 42, 14, 20, '#1A1A1A');
      px(x + 10, by + 20, 44, 22, '#1A1A1A');
      px(x + 14, by + 22, 36, 18, '#282828');
      px(x + 18, by + 24, 28, 14, '#383838');
      px(x + 12, by + 38, 40, 4, '#4A2A10');
      px(x + 28, by + 37, 8, 5, '#C8A830');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      // Barba solo pre-game
      if (!postGame) {
        px(x + 22, by + 14, 20, 4, '#282828');
        px(x + 24, by + 17, 16, 3, '#383838');
      }
      // Ojos melancólicos
      px(x + 22, by + 4, 6, 6, '#fff');
      px(x + 36, by + 4, 6, 6, '#fff');
      px(x + 25, by + 6, 3, 4, '#282020');
      px(x + 39, by + 6, 3, 4, '#282020');
      px(x + 25, by + 7, 2, 1, '#fff');
      px(x + 39, by + 7, 2, 1, '#fff');
      if (!postGame) {
        px(x + 22, by + 2, 6, 2, '#1A1A1A');
        px(x + 36, by + 2, 6, 2, '#1A1A1A');
      } // Cejas tristes
      px(x + 28, by + 18, 8, 2, '#C08868');
      break;

    case 'angelly': // Pelo suelto negro, tez clara, amarillo/verde
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 16, by + 36, 32, 12, '#38A048');
      px(x + 14, by + 40, 36, 14, '#48B058');
      px(x + 10, by + 20, 44, 18, '#E8C830');
      px(x + 14, by + 22, 36, 14, '#F0D840');
      px(x + 18, by + 24, 28, 10, '#F8E050');
      px(x + 12, by + 34, 40, 4, '#8A7850');
      px(x + 6, by + 24, 8, 12, SK.d);
      px(x + 50, by + 24, 8, 12, SK.d);
      px(x + 24, by + 14, 16, 8, SK.d);
      px(x + 18, by - 2, 28, 18, SK.d);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro suelto largo
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 28, '#1A1A1A');
      px(x + 44, by - 2, 8, 28, '#1A1A1A');
      px(x + 10, by + 14, 6, 16, '#101010');
      px(x + 48, by + 14, 6, 16, '#101010');
      px(x + 16, by - 10, 28, 4, '#282828');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2A1818');
      px(x + 39, by + 6, 4, 4, '#2A1818');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 24, by + 14, 16, 4, '#C08868');
      px(x + 28, by + 14, 8, 2, '#F8F8F8');
      break;

    case 'dayana': // Suéter lavanda oversize, pelo negro largo mechón azul
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 16, by + 38, 32, 24, '#9880B0');
      px(x + 18, by + 40, 28, 20, '#A890C0');
      px(x + 8, by + 20, 48, 20, '#A890C0');
      px(x + 12, by + 22, 40, 16, '#B8A0D0');
      px(x + 16, by + 24, 32, 12, '#C8B0E0');
      // Cuello alto
      px(x + 20, by + 16, 24, 6, '#A890C0');
      // Mangas largas cubriendo manos
      px(x + 4, by + 24, 10, 16, '#A890C0');
      px(x + 50, by + 24, 10, 16, '#A890C0');
      px(x + 2, by + 36, 10, 6, '#B8A0D0');
      px(x + 52, by + 36, 10, 6, '#B8A0D0');
      px(x + 24, by + 14, 16, 4, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro largo con mechón azul
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 30, '#1A1A1A');
      px(x + 44, by - 2, 8, 30, '#1A1A1A');
      px(x + 12, by + 2, 6, 10, '#3070C0'); // Mechón azul
      px(x + 16, by - 10, 28, 4, '#282828');
      // Ojos
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#201010');
      px(x + 39, by + 6, 4, 4, '#201010');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'deyna': // Chaqueta cuero azul, pelo corto mechón rosa, pulsera arcoíris
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#4870A0');
      px(x + 14, by + 22, 36, 20, '#5880B0');
      px(x + 18, by + 24, 28, 16, '#6890C0');
      // Botones
      px(x + 30, by + 28, 3, 3, '#C8C8C8');
      px(x + 30, by + 36, 3, 3, '#C8C8C8');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      // Pulsera arcoíris
      px(x + 6, by + 36, 8, 2, '#D02020');
      px(x + 6, by + 38, 8, 2, '#E8C020');
      px(x + 6, by + 40, 8, 2, '#20A020');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo negro corto con mechón rosa
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      px(x + 16, by - 10, 12, 6, '#D060A0'); // Mechón rosa grande
      px(x + 40, by - 8, 8, 4, '#D060A0');
      // Piercings oreja
      px(x + 14, by + 6, 2, 2, '#C8C8C8');
      px(x + 14, by + 10, 2, 2, '#E8C020');
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 25, by + 6, 4, 4, '#2A2020');
      px(x + 39, by + 6, 4, 4, '#2A2020');
      px(x + 25, by + 6, 2, 2, '#fff');
      px(x + 39, by + 6, 2, 2, '#fff');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'andre': // Máscara hierro, SIN CAMISA, torso descubierto, músculos
      px(x + 20, by + 60, 10, 8, '#484848');
      px(x + 34, by + 60, 10, 8, '#484848');
      px(x + 18, by + 44, 14, 18, '#404040');
      px(x + 32, by + 44, 14, 18, '#404040');
      px(x + 12, by + 22, 40, 22, SK.a);
      px(x + 16, by + 24, 32, 18, SK.b);
      px(x + 20, by + 26, 8, 8, '#D8B898');
      px(x + 36, by + 26, 8, 8, '#D8B898');
      px(x + 26, by + 30, 4, 4, '#D0A880');
      px(x + 34, by + 30, 4, 4, '#D0A880');
      px(x + 28, by + 36, 8, 4, '#C8A070');
      px(x + 6, by + 20, 8, 20, '#404048');
      px(x + 50, by + 20, 8, 20, '#404048');
      px(x + 8, by + 22, 4, 16, '#505058');
      px(x + 52, by + 22, 4, 16, '#505058');
      px(x + 6, by + 24, 8, 16, SK.a);
      px(x + 50, by + 24, 8, 16, SK.a);
      px(x + 16, by - 4, 32, 24, '#788090');
      px(x + 18, by - 2, 28, 20, '#8890A0');
      px(x + 20, by + 0, 24, 16, '#90A0B0');
      px(x + 22, by + 6, 6, 4, '#282828');
      px(x + 36, by + 6, 6, 4, '#282828');
      px(x + 26, by + 14, 12, 3, '#484848');
      px(x + 18, by + 0, 3, 3, '#E8C830');
      px(x + 43, by + 0, 3, 3, '#E8C830');
      px(x + 18, by + 14, 3, 3, '#E8C830');
      px(x + 43, by + 14, 3, 3, '#E8C830');
      px(x + 30, by - 2, 4, 3, '#E8C830');
      px(x + 20, by + 2, 24, 1, '#687080');
      px(x + 20, by + 12, 24, 1, '#687080');
      px(x + 16, by - 6, 32, 4, '#1A1A1A');
      break;

    case 'alejandro': // Pelo largo negro único, bandana roja, arriba negro abajo azul gris
      px(x + 20, by + 60, 10, 8, '#5A3A18');
      px(x + 34, by + 60, 10, 8, '#5A3A18');
      px(x + 18, by + 44, 14, 18, '#708898');
      px(x + 32, by + 44, 14, 18, '#708898');
      px(x + 10, by + 20, 44, 24, '#1A1A1A');
      px(x + 14, by + 22, 36, 20, '#282828');
      px(x + 20, by + 24, 24, 16, '#383838'); // Interior chaleco
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo LARGO negro (único hombre)
      px(x + 14, by - 8, 36, 10, '#1A1A1A');
      px(x + 12, by - 2, 8, 32, '#1A1A1A');
      px(x + 44, by - 2, 8, 32, '#1A1A1A');
      px(x + 10, by + 18, 6, 16, '#101010');
      px(x + 48, by + 18, 6, 16, '#101010');
      // Bandana roja
      px(x + 14, by - 4, 36, 6, '#C83030');
      px(x + 10, by - 2, 6, 4, '#C83030');
      px(x + 48, by - 2, 6, 4, '#C83030');
      px(x + 8, by + 0, 6, 10, '#C83030'); // Cola bandana
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#181818');
      px(x + 39, by + 8, 3, 3, '#181818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'ximena': // Sombrero catrina con flores, escote, color vino y negro, pelo ondulado
      px(x + 20, by + 60, 10, 8, '#4A1828');
      px(x + 34, by + 60, 10, 8, '#4A1828');
      px(x + 14, by + 34, 36, 28, '#1A1A1A');
      px(x + 16, by + 36, 32, 24, '#282828');
      // Parte superior vino con ESCOTE
      px(x + 10, by + 20, 44, 16, '#882838');
      px(x + 14, by + 22, 36, 12, '#983848');
      px(x + 18, by + 24, 28, 8, '#A84858');
      // Escote V
      px(x + 24, by + 20, 16, 6, SK.a);
      px(x + 28, by + 22, 8, 4, SK.b);
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro ondulado
      px(x + 14, by - 6, 36, 8, '#1A1A1A');
      px(x + 12, by - 2, 8, 24, '#1A1A1A');
      px(x + 44, by - 2, 8, 24, '#1A1A1A');
      px(x + 12, by + 6, 4, 4, '#282828');
      px(x + 48, by + 6, 4, 4, '#282828');
      px(x + 12, by + 14, 4, 4, '#282828');
      px(x + 48, by + 14, 4, 4, '#282828');
      // SOMBRERO GRANDE estilo catrina
      px(x + 4, by - 12, 56, 8, '#882838');
      px(x + 8, by - 16, 48, 8, '#983848');
      px(x + 16, by - 18, 32, 6, '#A84858');
      // Flores en sombrero
      px(x + 12, by - 16, 6, 6, '#F088A0');
      px(x + 28, by - 18, 6, 6, '#E8C830');
      px(x + 44, by - 16, 6, 6, '#F088A0');
      px(x + 20, by - 14, 4, 4, '#F8F8F8');
      px(x + 36, by - 14, 4, 4, '#88B8F0');
      // Ojos nostálgicos
      px(x + 22, by + 4, 8, 6, '#fff');
      px(x + 36, by + 4, 8, 6, '#fff');
      px(x + 24, by + 6, 4, 4, '#2A2020');
      px(x + 38, by + 6, 4, 4, '#2A2020');
      px(x + 24, by + 6, 2, 2, '#fff');
      px(x + 38, by + 6, 2, 2, '#fff');
      // Pestañas largas
      px(x + 22, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 4, 2, 1, '#1A1A1A');
      px(x + 36, by + 4, 2, 1, '#1A1A1A');
      px(x + 42, by + 4, 2, 1, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'andrea': // Profesora medieval, lentes, pelo recogido con lápiz
      px(x + 20, by + 60, 10, 8, '#6A4A28');
      px(x + 34, by + 60, 10, 8, '#6A4A28');
      px(x + 14, by + 36, 36, 26, '#2858A0');
      px(x + 16, by + 38, 32, 22, '#3868B0');
      px(x + 10, by + 20, 44, 18, '#E8E8E8');
      px(x + 14, by + 22, 36, 14, '#F0F0F0');
      // Chaleco azul con abertura
      px(x + 14, by + 22, 14, 12, '#2858A0');
      px(x + 36, by + 22, 14, 12, '#2858A0');
      px(x + 28, by + 22, 8, 12, '#F0F0F0'); // Abertura frontal
      px(x + 6, by + 24, 8, 14, SK.a);
      px(x + 50, by + 24, 8, 14, SK.a);
      // Libro en mano
      px(x + 52, by + 28, 8, 10, '#3868A8');
      px(x + 54, by + 30, 4, 6, '#F0F0F0');
      px(x + 24, by + 14, 16, 8, SK.a);
      px(x + 18, by - 2, 28, 18, SK.a);
      px(x + 20, by + 0, 24, 14, SK.d);
      // Pelo negro recogido con moño
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      px(x + 28, by - 12, 8, 6, '#1A1A1A');
      px(x + 30, by - 14, 4, 4, '#282828');
      // Lápiz en moño
      px(x + 38, by - 10, 4, 10, '#E8C830');
      px(x + 38, by - 12, 4, 4, '#D03030');
      // Lentes rectangulares
      px(x + 18, by + 4, 10, 6, '#404040');
      px(x + 20, by + 6, 6, 2, '#B8D0F0');
      px(x + 34, by + 4, 10, 6, '#404040');
      px(x + 36, by + 6, 6, 2, '#B8D0F0');
      px(x + 28, by + 6, 6, 2, '#404040');
      px(x + 22, by + 6, 3, 2, '#2A1818');
      px(x + 38, by + 6, 3, 2, '#2A1818');
      px(x + 28, by + 14, 8, 2, '#D0A088');
      break;

    case 'yam': // Pre-game con casco; post-game sin casco
      if (!postGame) {
        // Armadura tosca con cuernos y hacha, versión grande
        px(x + 18, by + 58, 14, 10, '#565A60');
        px(x + 34, by + 58, 14, 10, '#565A60');
        px(x + 18, by + 42, 14, 18, '#6A6E76');
        px(x + 32, by + 42, 14, 18, '#6A6E76');
        px(x + 8, by + 18, 48, 26, '#707782');
        px(x + 12, by + 20, 40, 22, '#858C98');
        px(x + 16, by + 24, 32, 14, '#59606A');
        px(x + 4, by + 16, 12, 10, '#7C838E');
        px(x + 48, by + 16, 12, 10, '#7C838E');
        // Hacha
        px(x + 56, by + 8, 4, 58, '#6A4828');
        px(x + 48, by + 8, 16, 12, '#A8B0B8');
        px(x + 52, by + 4, 12, 18, '#C0C8D0');
        // Casco
        px(x + 16, by - 6, 32, 28, '#68707C');
        px(x + 20, by - 2, 24, 22, '#808894');
        px(x + 22, by + 8, 8, 4, '#151515');
        px(x + 36, by + 8, 8, 4, '#151515');
        px(x + 8, by - 12, 12, 7, '#D8D0B0');
        px(x + 44, by - 12, 12, 7, '#D8D0B0');
        px(x + 2, by - 18, 10, 5, '#F0E8C8');
        px(x + 54, by - 18, 10, 5, '#F0E8C8');
        px(x + 28, by + 16, 8, 2, '#303030');
      } else {
        // Yam post-game: amable, cabello negro largo, ojos negros sin escleróticas
        px(x + 18, by + 58, 14, 10, '#8090A0');
        px(x + 34, by + 58, 14, 10, '#8090A0');
        px(x + 18, by + 42, 14, 18, '#8898A8');
        px(x + 32, by + 42, 14, 18, '#8898A8');
        px(x + 8, by + 18, 48, 26, '#A0B0C0');
        px(x + 12, by + 20, 40, 22, '#B0C0D0');
        px(x + 16, by + 22, 32, 18, '#C0D0E0');
        px(x + 24, by + 24, 16, 12, '#E8C830');
        px(x + 28, by + 28, 8, 4, '#D8B820');
        px(x + 4, by + 18, 8, 8, '#A0B0C0');
        px(x + 52, by + 18, 8, 8, '#A0B0C0');
        px(x + 6, by + 24, 8, 14, SK.a);
        px(x + 50, by + 24, 8, 14, SK.a);
        px(x + 24, by + 12, 16, 8, SK.a);
        px(x + 18, by - 4, 28, 18, SK.a);
        px(x + 20, by - 2, 24, 14, SK.d);
        px(x + 14, by - 10, 36, 10, '#111');
        px(x + 12, by - 4, 8, 36, '#111');
        px(x + 44, by - 4, 8, 36, '#111');
        px(x + 10, by + 24, 6, 20, '#080808');
        px(x + 48, by + 24, 6, 20, '#080808');
        px(x + 18, by - 12, 28, 5, '#282828');
        px(x + 24, by + 4, 6, 6, '#050505');
        px(x + 36, by + 4, 6, 6, '#050505');
        px(x + 26, by + 4, 2, 2, '#303030');
        px(x + 38, by + 4, 2, 2, '#303030');
        px(x + 28, by + 14, 10, 3, '#E08888');
        px(x + 31, by + 14, 4, 1, '#F8F8F8');
      }
      break;

    case 'ravell': // Bufón amarillo y verde rayas, cascabeles
      px(x + 14, by + 58, 10, 10, '#E8C830');
      px(x + 40, by + 58, 10, 10, '#38A038');
      px(x + 18, by + 44, 12, 16, '#D8B820');
      px(x + 34, by + 44, 12, 16, '#28A028');
      // Cuerpo rayas
      px(x + 6, by + 18, 26, 26, '#E8C830');
      px(x + 32, by + 18, 26, 26, '#38A038');
      // Rayas cruzadas
      px(x + 10, by + 22, 4, 18, '#38A038');
      px(x + 18, by + 22, 4, 18, '#38A038');
      px(x + 34, by + 22, 4, 18, '#E8C830');
      px(x + 42, by + 22, 4, 18, '#E8C830');
      // Collar
      px(x + 10, by + 16, 44, 4, '#F0F0F0');
      px(x + 24, by + 12, 16, 6, SK.a);
      px(x + 18, by - 4, 28, 18, SK.a);
      px(x + 20, by - 2, 24, 14, SK.d);
      // Gorro bufón bicolor
      px(x + 12, by - 18, 20, 20, '#E8C830');
      px(x + 32, by - 18, 20, 20, '#38A038');
      px(x + 10, by - 20, 6, 6, '#F8D030');
      px(x + 48, by - 20, 6, 6, '#48B048');
      px(x + 28, by - 24, 8, 6, '#F8D030');
      // Cascabeles
      px(x + 10, by - 20, 4, 4, '#C8C8C8');
      px(x + 50, by - 20, 4, 4, '#C8C8C8');
      px(x + 30, by - 24, 4, 4, '#C8C8C8');
      px(x + 12, by - 19, 2, 2, '#F8F8F8');
      px(x + 52, by - 19, 2, 2, '#F8F8F8');
      px(x + 24, by + 4, 6, 6, '#283848');
      px(x + 36, by + 4, 6, 6, '#283848');
      // Lágrima
      px(x + 42, by + 8, 2, 6, '#50A8F0');
      px(x + 28, by + 14, 8, 2, '#C09888');
      break;

    case 'oscar':
    case 'piero':
    case 'chrys':
      // Versiones grandes reutilizando el sprite de mapa a escala limpia.
      cx.save();
      cx.translate(x, y + 6);
      cx.scale(2, 2);
      dNPC(0, 0, id, f);
      cx.restore();
      break;

    case 'oloman': // Mohawk rojo, chaqueta cuero, estoperoles, piercings
      px(x + 18, by + 58, 12, 10, '#181818');
      px(x + 34, by + 58, 12, 10, '#181818');
      px(x + 20, by + 60, 2, 2, '#C8C8C8');
      px(x + 36, by + 60, 2, 2, '#C8C8C8');
      px(x + 20, by + 44, 10, 16, '#101010');
      px(x + 34, by + 44, 10, 16, '#101010');
      px(x + 10, by + 20, 44, 26, '#282828');
      px(x + 14, by + 22, 36, 22, '#383838');
      px(x + 10, by + 22, 4, 4, '#C8C8C8');
      px(x + 50, by + 22, 4, 4, '#C8C8C8');
      px(x + 14, by + 20, 4, 4, '#C8C8C8');
      px(x + 46, by + 20, 4, 4, '#C8C8C8');
      px(x + 20, by + 28, 24, 10, '#F0F0F0');
      px(x + 22, by + 30, 20, 6, '#D03030');
      px(x + 10, by + 42, 8, 4, '#A8A8A8');
      px(x + 14, by + 44, 8, 2, '#A8A8A8');
      px(x + 6, by + 24, 8, 14, SK.d);
      px(x + 50, by + 24, 8, 14, SK.d);
      px(x + 24, by + 6, 16, 16, SK.d);
      px(x + 26, by + 8, 12, 12, SK.d);
      px(x + 26, by - 20, 12, 26, '#D02020');
      px(x + 28, by - 24, 8, 22, '#E03030');
      px(x + 30, by - 28, 4, 18, '#F04040');
      px(x + 18, by + 4, 8, 10, SK.e);
      px(x + 38, by + 4, 8, 10, SK.e);
      px(x + 22, by + 8, 6, 5, '#fff');
      px(x + 36, by + 8, 6, 5, '#fff');
      px(x + 25, by + 10, 3, 3, '#181818');
      px(x + 39, by + 10, 3, 3, '#181818');
      px(x + 22, by + 8, 6, 2, '#282828');
      px(x + 36, by + 8, 6, 2, '#282828');
      px(x + 25, by + 10, 2, 1, '#fff');
      px(x + 39, by + 10, 2, 1, '#fff');
      px(x + 32, by + 14, 2, 4, '#C8C8C8');
      px(x + 20, by + 12, 2, 2, '#C8C8C8');
      px(x + 28, by + 18, 8, 2, '#A88070');
      break;

    case 'boss': // Rey, barba blanca, corona, capa roja, armadura
      px(x + 14, by + 58, 12, 10, '#586878');
      px(x + 38, by + 58, 12, 10, '#586878');
      px(x + 16, by + 40, 12, 20, '#687888');
      px(x + 36, by + 40, 12, 20, '#687888');
      px(x + 4, by + 16, 56, 28, '#687888');
      px(x + 8, by + 18, 48, 24, '#789098');
      px(x + 12, by + 20, 40, 20, '#88A0A8');
      px(x + 24, by + 22, 16, 14, '#E8C830');
      px(x + 28, by + 26, 8, 6, '#D8B820');
      px(x + 0, by + 16, 8, 40, '#A82020');
      px(x + 56, by + 16, 8, 40, '#A82020');
      px(x + 2, by + 20, 4, 32, '#C83030');
      px(x + 58, by + 20, 4, 32, '#C83030');
      px(x + 0, by + 52, 8, 6, '#E8E8E8');
      px(x + 56, by + 52, 8, 6, '#E8E8E8');
      px(x + 2, by + 53, 2, 2, '#282828');
      px(x + 58, by + 53, 2, 2, '#282828');
      px(x + 20, by - 6, 24, 22, SK.a);
      px(x + 22, by - 4, 20, 18, SK.d);
      px(x + 20, by + 12, 24, 10, '#E8E8E8');
      px(x + 22, by + 18, 20, 8, '#E0E0E0');
      px(x + 24, by + 24, 16, 6, '#D8D8D8');
      px(x + 26, by + 28, 12, 4, '#D0D0D0');
      px(x + 24, by + 0, 6, 6, '#fff');
      px(x + 36, by + 0, 6, 6, '#fff');
      px(x + 26, by + 2, 4, 4, '#384858');
      px(x + 38, by + 2, 4, 4, '#384858');
      px(x + 24, by - 2, 6, 2, '#C0C0C0');
      px(x + 36, by - 2, 6, 2, '#C0C0C0');
      px(x + 14, by - 14, 36, 10, '#E8C830');
      px(x + 18, by - 20, 6, 10, '#E8C830');
      px(x + 30, by - 22, 6, 12, '#E8C830');
      px(x + 42, by - 20, 6, 10, '#E8C830');
      px(x + 20, by - 18, 4, 4, '#D03030');
      px(x + 30, by - 20, 6, 4, '#3060D0');
      px(x + 42, by - 18, 4, 4, '#30C030');
      px(x + 14, by - 6, 6, 14, '#C0C0C0');
      px(x + 44, by - 6, 6, 14, '#C0C0C0');
      break;

    case 'edison': // Pelo negro, anteojos negros, medieval genial
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#2A2838');
      px(x + 32, by + 44, 14, 18, '#2A2838');
      px(x + 10, by + 20, 44, 24, '#3A5068');
      px(x + 14, by + 22, 36, 20, '#4A6078');
      px(x + 18, by + 24, 28, 16, '#5A7088');
      px(x + 18, by + 22, 28, 2, '#C8A830');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      px(x + 28, by + 39, 8, 5, '#C8A830');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      // Anteojos negros
      px(x + 18, by + 4, 10, 6, '#1A1A1A');
      px(x + 20, by + 6, 6, 2, '#303848');
      px(x + 34, by + 4, 10, 6, '#1A1A1A');
      px(x + 36, by + 6, 6, 2, '#303848');
      px(x + 28, by + 6, 6, 2, '#1A1A1A');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'luis': // Arriba gris/azul, abajo negro, bastón
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 8, by + 20, 48, 36, '#607088');
      px(x + 12, by + 22, 40, 32, '#708098');
      px(x + 16, by + 24, 32, 28, '#8090A8');
      px(x + 14, by + 38, 36, 4, '#4A2A10');
      px(x + 28, by + 37, 8, 5, '#C8A830');
      px(x + 6, by + 24, 6, 14, SK.b);
      px(x + 52, by + 24, 6, 14, SK.b);
      // Bastón
      px(x + 56, by + 14, 3, 40, '#6A4828');
      px(x + 55, by + 10, 5, 5, '#A88848');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 12, '#1A1A1A');
      px(x + 44, by - 4, 6, 12, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#384858');
      px(x + 39, by + 8, 3, 3, '#384858');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'dante': // Pelo negro rizado, gabardina verde/negro
      px(x + 20, by + 60, 10, 8, '#1A1A1A');
      px(x + 34, by + 60, 10, 8, '#1A1A1A');
      px(x + 8, by + 20, 48, 40, '#1A1A1A');
      px(x + 12, by + 22, 40, 36, '#2A3A28');
      px(x + 16, by + 24, 32, 32, '#3A4A38');
      px(x + 20, by + 18, 24, 6, '#1A1A1A'); // Cuello alto
      px(x + 6, by + 24, 6, 16, SK.b);
      px(x + 52, by + 24, 6, 16, SK.b);
      px(x + 24, by + 14, 16, 6, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo rizado
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 14, by - 4, 6, 8, '#1A1A1A');
      px(x + 44, by - 4, 6, 8, '#1A1A1A');
      px(x + 16, by - 10, 6, 4, '#282828');
      px(x + 26, by - 12, 6, 4, '#282828');
      px(x + 38, by - 10, 6, 4, '#282828');
      px(x + 14, by + 0, 4, 4, '#282828');
      px(x + 46, by + 0, 4, 4, '#282828');
      // Ojos rojizos
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#681818');
      px(x + 39, by + 8, 3, 3, '#681818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#A88070');
      break;

    case 'dan': // Arriba verde, abajo escarlata
      px(x + 20, by + 60, 10, 8, '#4A3018');
      px(x + 34, by + 60, 10, 8, '#4A3018');
      px(x + 18, by + 44, 14, 18, '#C83838');
      px(x + 32, by + 44, 14, 18, '#C83838');
      px(x + 20, by + 46, 10, 14, '#D84848');
      px(x + 34, by + 46, 10, 14, '#D84848');
      px(x + 10, by + 20, 44, 24, '#2A6830');
      px(x + 14, by + 22, 36, 20, '#307038');
      px(x + 18, by + 24, 28, 16, '#387840');
      px(x + 12, by + 40, 40, 4, '#4A2A10');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 10, '#1A1A1A');
      px(x + 44, by - 4, 6, 10, '#1A1A1A');
      // Ojos pensativos
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 6, 3, 3, '#3A2828');
      px(x + 39, by + 6, 3, 3, '#3A2828');
      px(x + 25, by + 6, 2, 1, '#fff');
      px(x + 39, by + 6, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'luchito': // Chaleco rojo, camisa blanca, corbatín, rosa, más delgado
      px(x + 22, by + 60, 8, 8, '#1A1A1A');
      px(x + 34, by + 60, 8, 8, '#1A1A1A');
      px(x + 22, by + 44, 8, 18, '#1A1A1A');
      px(x + 34, by + 44, 8, 18, '#1A1A1A');
      px(x + 14, by + 20, 36, 24, '#B83030');
      px(x + 18, by + 22, 28, 20, '#C84040');
      // Camisa blanca interior
      px(x + 22, by + 22, 20, 16, '#F0F0F0');
      // Corbatín
      px(x + 28, by + 20, 8, 4, '#181818');
      px(x + 30, by + 18, 4, 2, '#181818');
      px(x + 8, by + 24, 8, 16, SK.b);
      px(x + 48, by + 24, 8, 16, SK.b);
      // Rosa en mano
      px(x + 50, by + 28, 6, 6, '#D83838');
      px(x + 52, by + 33, 2, 10, '#308028');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Pelo peinado elegante
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 14, by - 4, 6, 6, '#1A1A1A');
      px(x + 16, by - 8, 10, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#3A2020');
      px(x + 39, by + 8, 3, 3, '#3A2020');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#C08868');
      px(x + 28, by + 16, 8, 2, '#C08868');
      break;

    case 'alex': // Sombrero paja, arriba crema abajo verde, pecas
      px(x + 20, by + 60, 10, 8, '#6A4828');
      px(x + 34, by + 60, 10, 8, '#6A4828');
      px(x + 16, by + 34, 32, 28, '#388038');
      px(x + 18, by + 36, 28, 24, '#409040');
      // Tirantes overol
      px(x + 20, by + 22, 6, 14, '#388038');
      px(x + 38, by + 22, 6, 14, '#388038');
      px(x + 10, by + 20, 44, 8, '#D8C8A0');
      px(x + 14, by + 22, 36, 4, '#E0D0B0');
      px(x + 6, by + 24, 8, 14, SK.c);
      px(x + 50, by + 24, 8, 14, SK.c);
      // Pecas
      px(x + 22, by + 10, 2, 2, '#A06A45');
      px(x + 28, by + 12, 2, 2, '#A06A45');
      px(x + 40, by + 10, 2, 2, '#A06A45');
      px(x + 24, by + 14, 16, 8, SK.c);
      px(x + 18, by - 2, 28, 18, SK.c);
      px(x + 20, by + 0, 24, 14, SK.c);
      // Sombrero de paja
      px(x + 8, by - 8, 48, 8, '#E0C060');
      px(x + 14, by - 12, 36, 8, '#E8C870');
      px(x + 18, by - 14, 28, 4, '#F0D080');
      px(x + 24, by - 10, 16, 4, '#C83030'); // Cinta
      px(x + 16, by - 2, 32, 4, '#1A1A1A');
      px(x + 14, by + 0, 6, 6, '#1A1A1A');
      px(x + 44, by + 0, 6, 6, '#1A1A1A');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A6020');
      px(x + 39, by + 8, 3, 3, '#2A6020');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#B08060');
      break;

    case 'gonchi': // Anteojos, gorro, arriba gris abajo azul gris, mochila
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 44, 14, 18, '#708898');
      px(x + 32, by + 44, 14, 18, '#708898');
      px(x + 10, by + 20, 44, 24, '#787888');
      px(x + 14, by + 22, 36, 20, '#8888A0');
      px(x + 18, by + 24, 28, 16, '#9898B0');
      // Capucha caída
      px(x + 16, by + 16, 32, 6, '#787888');
      px(x + 14, by + 18, 8, 4, '#787888');
      px(x + 42, by + 18, 8, 4, '#787888');
      // Mochila
      px(x + 4, by + 24, 8, 18, '#6A4A28');
      px(x + 6, by + 26, 4, 14, '#7A5A38');
      px(x + 6, by + 24, 4, 2, '#C8A830');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      // Gorro
      px(x + 16, by - 10, 32, 10, '#484858');
      px(x + 18, by - 12, 28, 6, '#585868');
      px(x + 16, by - 2, 32, 4, '#1A1A1A');
      // ANTEOJOS
      px(x + 18, by + 4, 10, 6, '#1A1A1A');
      px(x + 20, by + 6, 6, 2, '#B8D0F0');
      px(x + 34, by + 4, 10, 6, '#1A1A1A');
      px(x + 36, by + 6, 6, 2, '#B8D0F0');
      px(x + 28, by + 6, 6, 2, '#1A1A1A');
      px(x + 22, by + 7, 3, 2, '#181818');
      px(x + 38, by + 7, 3, 2, '#181818');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;

    case 'jairo': // Arriba beige/escarlata, abajo blanco, BALÓN
      px(x + 20, by + 60, 10, 8, '#2A2A2A');
      px(x + 34, by + 60, 10, 8, '#2A2A2A');
      px(x + 20, by + 50, 10, 6, SK.b);
      px(x + 34, by + 50, 10, 6, SK.b);
      px(x + 18, by + 42, 14, 10, '#E8E8E8');
      px(x + 32, by + 42, 14, 10, '#E8E8E8');
      px(x + 10, by + 20, 22, 22, '#D8C8A0');
      px(x + 32, by + 20, 22, 22, '#C83838');
      px(x + 14, by + 22, 16, 18, '#E0D0B0');
      px(x + 34, by + 22, 16, 18, '#D84848');
      px(x + 6, by + 24, 8, 14, SK.b);
      px(x + 50, by + 24, 8, 14, SK.b);
      // BALÓN grande
      px(x + 52, by + 28, 10, 10, '#E8E0D0');
      px(x + 54, by + 30, 6, 6, '#F0F0F0');
      px(x + 56, by + 32, 3, 3, '#282828');
      px(x + 54, by + 30, 2, 2, '#282828');
      px(x + 58, by + 36, 2, 2, '#282828');
      px(x + 24, by + 14, 16, 8, SK.b);
      px(x + 18, by - 2, 28, 18, SK.b);
      px(x + 20, by + 0, 24, 14, SK.a);
      px(x + 16, by - 8, 32, 8, '#1A1A1A');
      px(x + 18, by - 10, 28, 4, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#2A1818');
      px(x + 39, by + 8, 3, 3, '#2A1818');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 26, by + 14, 12, 2, '#C08868');
      break;

    default: // Entrenador genérico
      px(x + 20, by + 60, 10, 8, '#5A3A1A');
      px(x + 34, by + 60, 10, 8, '#5A3A1A');
      px(x + 18, by + 42, 14, 20, '#3A3028');
      px(x + 32, by + 42, 14, 20, '#3A3028');
      px(x + 10, by + 20, 44, 24, '#4A6888');
      px(x + 14, by + 22, 36, 20, '#5A78A0');
      px(x + 18, by + 24, 28, 16, '#6A88B0');
      px(x + 6, by + 24, 8, 16, SK.b);
      px(x + 50, by + 24, 8, 16, SK.b);
      px(x + 24, by + 6, 16, 16, SK.b);
      px(x + 26, by + 8, 12, 12, SK.a);
      px(x + 16, by - 8, 32, 10, '#1A1A1A');
      px(x + 18, by - 10, 28, 6, '#282828');
      px(x + 22, by + 6, 6, 5, '#fff');
      px(x + 36, by + 6, 6, 5, '#fff');
      px(x + 25, by + 8, 3, 3, '#283848');
      px(x + 39, by + 8, 3, 3, '#283848');
      px(x + 25, by + 8, 2, 1, '#fff');
      px(x + 39, by + 8, 2, 1, '#fff');
      px(x + 28, by + 14, 8, 2, '#C08868');
      break;
  } // fin switch
} // fin dTrainerBig
// ============================================================
// BLOQUE 6A: SPRITES ÚNICOS DE CRIATURAS (FUEGO, AGUA, PLANTA)
// ============================================================

function dCre(x, y, id, lv, f) {
  const sz = Math.min(lv, 5),
    b = Math.sin(f * 0.15) * 2;
  dShadow(x + 16, y + 50, 12 + sz, 3);
  const by = y + b;

  switch (id) {
    // ==========================================
    // FUEGO 🔥
    // ==========================================

    case 'flamingo': // Flamígaro: flamingo flamenco novato, una pata y castañuelas
      {
        const tap = Math.sin(f * 0.25) * 2;
        // cuerpo vertical, baila en una sola pata
        px(x + 12, by + 18, 10 + sz, 17 + sz, '#D83848');
        px(x + 14, by + 20, 6 + sz, 13 + sz, '#F06070');
        px(x + 10, by + 32 + sz, 14, 3, '#B82838'); // faldita simple de plumas
        // cuello largo en S pixelada
        px(x + 15, by + 6, 4, 14, '#D83848');
        px(x + 17, by + 4, 5, 4, '#E84858');
        px(x + 19, by + 2, 7, 5, '#D83848');
        // cabeza y pico
        px(x + 20, by + 1, 10, 8, '#E84858');
        px(x + 22, by + 3, 6, 4, '#F08090');
        px(x + 28, by + 4, 5, 2, '#F0A030');
        px(x + 31, by + 5, 3, 1, '#D88020');
        px(x + 24, by + 3, 3, 3, '#fff');
        px(x + 25, by + 4, 2, 2, '#181818');
        // flor/chispa en la cabeza
        px(x + 20, by - 2, 3, 3, '#E82020');
        px(x + 23, by - 1, 2, 2, '#F84040');
        // alas-castañuelas
        px(x + 5, by + 22 + tap, 7, 5, '#B82838');
        px(x + 3, by + 21 + tap, 4, 4, '#F8A030');
        px(x + sz + 21, by + 20 - tap, 9, 6, '#B82838');
        px(x + sz + 28, by + 19 - tap, 4, 4, '#F8A030');
        // pata única, larga
        px(x + 16, by + 34 + sz, 2, 12, '#C89020');
        px(x + 14, by + 45 + sz, 6, 2, '#A87018');
        // segunda pata recogida
        px(x + 20, by + 34 + sz, 6, 2, '#C89020');
        px(x + 25, by + 32 + sz, 2, 4, '#C89020');
      }
      break;

    case 'emberwing': // Cóndor abuelita tejiendo
      px(x + 4, by + 18, 24 + sz, 16 + sz, '#483838');
      px(x + 6, by + 20, 20 + sz, 12 + sz, '#585048');
      px(x + 8, by + 22, 16 + sz, 8, '#686058');
      px(x, by + 14, 8, 14, '#383028');
      px(x + sz + 24, by + 14, 8, 14, '#383028');
      px(x + 2, by + 16, 4, 10, '#484038');
      px(x + sz + 26, by + 16, 4, 10, '#484038');
      px(x + 8, by + 4, 16 + sz, 14, '#483838');
      px(x + 10, by + 6, 12 + sz, 10, '#585048');
      px(x + 8, by + 2, 16 + sz, 5, '#C83030');
      px(x + 10, by + 0, 12 + sz, 4, '#D84040');
      px(x + 14, by - 1, 4, 2, '#F8F8F8');
      px(x + 10, by + 8, 5, 4, '#C8A830');
      px(x + 11, by + 9, 3, 2, '#E8E0D0');
      px(x + 18, by + 8, 5, 4, '#C8A830');
      px(x + 19, by + 9, 3, 2, '#E8E0D0');
      px(x + 15, by + 9, 3, 1, '#C8A830');
      px(x + 14, by + 14, 5, 3, '#585048');
      px(x + 15, by + 16, 3, 1, '#484038');
      px(x + 2, by + 28, 2, 10, '#C8C8C8');
      px(x + sz + 28, by + 28, 2, 10, '#C8C8C8');
      px(x + 4, by + 30, sz + 22, 2, '#D83030');
      px(x + 10, by + 32 + sz, 5, 5, '#484038');
      px(x + 19, by + 32 + sz, 5, 5, '#484038');
      break;

    // ==========================================
    // PLANTA 🌿
    // ==========================================

    case 'ivygoat': // Hedroca: cabrito mayordomo pequeño con bandeja
      {
        const ear = Math.sin(f * 0.12) * 1;
        // cuerpo pequeño de cabrito, más bajo que su evolución
        px(x + 7, by + 23, 20 + sz, 11 + sz, '#C8D8B0');
        px(x + 9, by + 25, 16 + sz, 7 + sz, '#E0E8C8');
        px(x + 6, by + 21, 22 + sz, 5, '#3A6A30'); // chaleco verde
        px(x + 10, by + 22, 14 + sz, 3, '#508838');
        // patitas finas
        px(x + 9, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + 15, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + sz + 21, by + 32 + sz, 3, 7, '#6A5A38');
        px(x + 8, by + 38 + sz, 5, 2, '#2A2418');
        px(x + 20 + sz, by + 38 + sz, 5, 2, '#2A2418');
        // cabeza tierna, separada visualmente del torso
        px(x + 8, by + 6, 18 + sz, 14, '#C8D8B0');
        px(x + 10, by + 8, 14 + sz, 10, '#E0E8C8');
        px(x + 5, by + 7 + ear, 5, 6, '#A0B078');
        px(x + sz + 24, by + 7 - ear, 5, 6, '#A0B078');
        px(x + 6, by + 8 + ear, 3, 3, '#E0E8C8');
        px(x + sz + 25, by + 8 - ear, 3, 3, '#E0E8C8');
        // cuernitos-hojas pequeños
        px(x + 10, by + 2, 4, 5, '#4FA840');
        px(x + sz + 20, by + 2, 4, 5, '#4FA840');
        px(x + 11, by + 0, 2, 3, '#72C860');
        px(x + sz + 21, by + 0, 2, 3, '#72C860');
        // cara
        px(x + 12, by + 11, 4, 4, '#fff');
        px(x + sz + 19, by + 11, 4, 4, '#fff');
        px(x + 14, by + 13, 2, 2, '#203010');
        px(x + sz + 21, by + 13, 2, 2, '#203010');
        px(x + 15, by + 17, 5, 2, '#8A6040');
        // moñito y bandeja de mayordomo
        px(x + 14, by + 20, 6, 3, '#202030');
        px(x + 15, by + 19, 4, 1, '#E8E8E8');
        px(x + sz + 27, by + 21, 8, 2, '#C8C8C8');
        px(x + sz + 28, by + 18, 5, 3, '#F0F0F0');
      }
      break;

    case 'thornbuck': // Espinardo: carnerito punk pequeño, bajo y con pocas espinas
      {
        const hop = Math.sin(f * 0.16) * 1;
        px(x + 9, by + 25 + hop, 18 + sz, 10 + sz, '#406028');
        px(x + 11, by + 27 + hop, 14 + sz, 6 + sz, '#5A7838');
        px(x + 13, by + 28 + hop, 10 + sz, 3, '#6C9040');
        px(x + 10, by + 22 + hop, 16 + sz, 5, '#1A2818');
        px(x + 12, by + 23 + hop, 12 + sz, 3, '#2A3828');
        px(x + 12, by + 22 + hop, 2, 2, '#C8A830');
        px(x + sz + 22, by + 22 + hop, 2, 2, '#C8A830');
        px(x + 8, by + 8 + hop, 20 + sz, 15, '#406028');
        px(x + 10, by + 10 + hop, 16 + sz, 11, '#5A7838');
        px(x + 12, by + 12 + hop, 12 + sz, 7, '#6C9040');
        px(x + 4, by + 6 + hop, 6, 5, '#304818');
        px(x + sz + 27, by + 6 + hop, 6, 5, '#304818');
        px(x + 3, by + 5 + hop, 3, 3, '#D8B840');
        px(x + sz + 31, by + 5 + hop, 3, 3, '#D8B840');
        px(x + 13, by + 4 + hop, 9 + sz, 3, '#38A020');
        px(x + 15, by + 2 + hop, 5 + sz, 3, '#48C030');
        px(x + 11, by + 13 + hop, 5, 4, '#fff');
        px(x + sz + 20, by + 13 + hop, 5, 4, '#fff');
        px(x + 13, by + 14 + hop, 3, 2, '#203010');
        px(x + sz + 22, by + 14 + hop, 3, 2, '#203010');
        px(x + 13, by + 19 + hop, 7, 1, '#263818');
        px(x + 10, by + 34 + sz + hop, 5, 5, '#406028');
        px(x + sz + 21, by + 34 + sz + hop, 5, 5, '#406028');
        px(x + 9, by + 38 + sz + hop, 6, 2, '#3A2A1A');
        px(x + sz + 21, by + 38 + sz + hop, 6, 2, '#3A2A1A');
        px(x + 7, by + 24 + hop, 3, 4, '#A8D860');
        px(x + sz + 27, by + 24 + hop, 3, 4, '#A8D860');
      }
      break;

    case 'wyvern': // Wyvernito: cachorro agresivo, agazapado con alas puntiagudas
      {
        const snarl = Math.sin(f * 0.18) * 1;
        // postura baja de depredador, listo para saltar
        px(x + 6, by + 26 + snarl, 24 + sz, 10 + sz, '#3A1690');
        px(x + 9, by + 28 + snarl, 18 + sz, 6 + sz, '#5830B0');
        px(x - 1, by + 30 + snarl, 10, 4, '#241060'); // cola
        px(x - 5, by + 28 + snarl, 5, 4, '#151018');
        px(x - 7, by + 27 + snarl, 3, 3, '#1ED060');
        // alas pequeñas pero afiladas
        px(x + 0, by + 18 + snarl, 12, 5, '#1C1028');
        px(x - 4, by + 22 + snarl, 12, 4, '#2A1668');
        px(x + sz + 25, by + 18 + snarl, 12, 5, '#1C1028');
        px(x + sz + 29, by + 22 + snarl, 12, 4, '#2A1668');
        px(x + 4, by + 20 + snarl, 5, 2, '#1ED060');
        px(x + sz + 29, by + 20 + snarl, 5, 2, '#1ED060');
        // cabeza grande con mandíbula agresiva
        px(x + 8, by + 8 + snarl, 21 + sz, 15, '#3A1690');
        px(x + 10, by + 10 + snarl, 17 + sz, 11, '#5830B0');
        px(x + 13, by + 12 + snarl, 12 + sz, 7, '#7040C8');
        // cuernos negros con punta verde
        px(x + 6, by + 3 + snarl, 4, 7, '#101010');
        px(x + sz + 26, by + 3 + snarl, 4, 7, '#101010');
        px(x + 5, by + 1 + snarl, 3, 3, '#1ED060');
        px(x + sz + 29, by + 1 + snarl, 3, 3, '#1ED060');
        // ojos verdes de cachorro feroz
        px(x + 11, by + 13 + snarl, 6, 5, '#74FF80');
        px(x + sz + 21, by + 13 + snarl, 6, 5, '#74FF80');
        px(x + 13, by + 15 + snarl, 3, 2, '#001008');
        px(x + sz + 23, by + 15 + snarl, 3, 2, '#001008');
        px(x + 14, by + 21 + snarl, 8, 2, '#101010');
        px(x + 15, by + 22 + snarl, 2, 2, '#F8F8F8');
        px(x + 21, by + 22 + snarl, 2, 2, '#F8F8F8');
        // garras delanteras
        px(x + 9, by + 35 + sz + snarl, 6, 4, '#3A1690');
        px(x + sz + 24, by + 35 + sz + snarl, 6, 4, '#3A1690');
        px(x + 8, by + 38 + sz + snarl, 3, 2, '#1ED060');
        px(x + sz + 28, by + 38 + sz + snarl, 3, 2, '#1ED060');
      }
      break;

    case 'eastern': // Lóngbao: dragón oriental bebé dentro de un bao al vapor
      {
        const steam = Math.sin(f * 0.1) * 2;
        // vapor cuadrado alrededor
        cx.globalAlpha = 0.35;
        px(x + 6, by + 2 + steam, 3, 3, '#F8F8F8');
        px(x + 24, by + 4 - steam, 3, 3, '#F8F8F8');
        px(x + 15, by - 1 + steam, 2, 2, '#F0F0F0');
        cx.globalAlpha = 1;
        // cuerpo bao: blanco/crema, redondito por bloques
        px(x + 6, by + 19, 24 + sz, 17 + sz, '#E8D8C0');
        px(x + 8, by + 17, 20 + sz, 18 + sz, '#F8E8D0');
        px(x + 11, by + 15, 14 + sz, 6, '#FFF0D8');
        // pliegues del bao
        px(x + 12, by + 17, 2, 14, '#D8C0A0');
        px(x + 18, by + 16, 2, 13, '#D8C0A0');
        px(x + 24, by + 18, 2, 10, '#D8C0A0');
        px(x + 14, by + 14, 8, 3, '#E8D8C0');
        // cabeza de dragón asomando
        px(x + 8, by + 4, 20 + sz, 14, '#C83030');
        px(x + 10, by + 6, 16 + sz, 10, '#D84040');
        px(x + 12, by + 8, 12 + sz, 6, '#E85050');
        // bigotes/fideos chinos
        px(x + 3, by + 13, 8, 2, '#F8F8F8');
        px(x + sz + 25, by + 13, 8, 2, '#F8F8F8');
        px(x + 1, by + 15, 5, 1, '#E8E8E8');
        px(x + sz + 31, by + 15, 5, 1, '#E8E8E8');
        // cuernos y gorrito de vapor
        px(x + 6, by - 1, 4, 5, '#E8C830');
        px(x + sz + 25, by - 1, 4, 5, '#E8C830');
        px(x + 5, by - 3, 3, 3, '#F0D040');
        px(x + sz + 27, by - 3, 3, 3, '#F0D040');
        px(x + 14, by - 3, 8 + sz, 3, '#F8F8F8');
        // ojos
        px(x + 10, by + 9, 5, 5, '#fff');
        px(x + sz + 19, by + 9, 5, 5, '#fff');
        px(x + 12, by + 11, 3, 3, '#881818');
        px(x + sz + 21, by + 11, 3, 3, '#881818');
        px(x + 15, by + 15, 5, 2, '#A82820');
        // colita de dragón saliendo del bao
        px(x + sz + 28, by + 26, 6, 5, '#C83030');
        px(x + sz + 32, by + 24, 4, 4, '#E85050');
      }
      break;

    case 'serpentdrg': // Serpentón: serpiente dragón mafioso joven, más pequeño
      {
        const sway = Math.sin(f * 0.12) * 1;
        px(x + 9, by + 22 + sway, 18 + sz, 10 + sz, '#282858');
        px(x + 11, by + 24 + sway, 14 + sz, 6 + sz, '#383868');
        px(x + 6, by + 29 + sway, 16, 4, '#282858');
        px(x + 2, by + 32 + sway, 9, 4, '#383868');
        px(x + sz + 24, by + 30 + sway, 9, 4, '#282858');
        px(x + 15, by + 18 + sway, 4, 9, '#C83030');
        px(x + 16, by + 18 + sway, 2, 1, '#D84040');
        px(x + 8, by + 6 + sway, 18 + sz, 12, '#282858');
        px(x + 10, by + 8 + sway, 14 + sz, 8, '#383868');
        px(x + 12, by + 10 + sway, 10 + sz, 5, '#484878');
        px(x + 5, by + 1 + sway, 24 + sz, 4, '#1A1A1A');
        px(x + 9, by - 2 + sway, 16 + sz, 4, '#282828');
        px(x + 11, by - 3 + sway, 12 + sz, 2, '#383838');
        px(x + 13, by - 1 + sway, 8 + sz, 1, '#C83030');
        px(x + 11, by + 9 + sway, 5, 3, '#F0C020');
        px(x + sz + 19, by + 9 + sway, 5, 3, '#F0C020');
        px(x + 13, by + 10 + sway, 2, 2, '#100838');
        px(x + sz + 21, by + 10 + sway, 2, 2, '#100838');
        px(x + 11, by + 7 + sway, 1, 4, '#C07060');
        px(x + sz + 22, by + 15 + sway, 6, 2, '#8A6020');
        px(x + sz + 27, by + 14 + sway, 2, 2, '#E8A030');
        if (f % 20 < 10) px(x + sz + 28, by + 12 + sway, 2, 2, '#C8C8C8');
        px(x - 4, by + 34 + sway, 6, 3, '#282858');
        px(x - 7, by + 32 + sway, 4, 4, '#C8A030');
      }
      break;

    case 'pixie': // Duendecillo: ladrón pequeño, encorvado y con saco diminuto
      {
        const sneak = Math.sin(fr * 0.14) * 1;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F080F0';
        pixelGlow(x + 16, by + sneak + 25, 12 + sz, 10);
        cx.globalAlpha = 1;
        // postura baja y furtiva, no hada genérica con alas grandes
        px(x + 10, by + sneak + 24, 12 + sz, 9 + sz, '#38A048');
        px(x + 12, by + sneak + 26, 8 + sz, 5 + sz, '#48B058');
        px(x + 6, by + sneak + 27, 8, 4, '#2F8038');
        px(x + sz + 20, by + sneak + 27, 8, 4, '#2F8038');
        // saco de calcetines más importante que el cuerpo
        px(x + sz + 22, by + sneak + 18, 10, 12, '#8A6820');
        px(x + sz + 23, by + sneak + 20, 8, 8, '#A88030');
        px(x + sz + 24, by + sneak + 16, 4, 4, '#E8E8E8');
        px(x + sz + 25, by + sneak + 16, 1, 2, '#D83030');
        // cabeza con capucha negra de ladrón
        px(x + 7, by + sneak + 8, 17 + sz, 13, '#F8D0C0');
        px(x + 9, by + sneak + 10, 13 + sz, 9, '#F8E0D0');
        px(x + 6, by + sneak + 4, 20 + sz, 7, '#202020');
        px(x + 9, by + sneak + 1, 13 + sz, 6, '#101010');
        px(x + 6, by + sneak + 10, 20 + sz, 3, '#101010');
        // ojos brillantes de pillo
        px(x + 10, by + sneak + 12, 4, 3, '#F8E830');
        px(x + sz + 19, by + sneak + 12, 4, 3, '#F8E830');
        px(x + 11, by + sneak + 13, 2, 1, '#202020');
        px(x + sz + 20, by + sneak + 13, 2, 1, '#202020');
        px(x + 14, by + sneak + 18, 5, 1, '#C08868');
        // alitas pequeñísimas, casi ocultas
        cx.globalAlpha = 0.35;
        px(x + 4, by + sneak + 15, 5, 6, '#F8C0F8');
        cx.globalAlpha = 1;
        px(x + 10, by + sneak + 31 + sz, 4, 3, '#F8D0C0');
        px(x + sz + 18, by + sneak + 31 + sz, 4, 3, '#F8D0C0');
      }
      break;

    case 'sidhe': // Hada celta cantante de ópera
      const shv = Math.sin(fr * 0.12) * 3;
      cx.globalAlpha = 0.06;
      cx.fillStyle = '#A0E0A0';
      pixelGlow(x + 16, by + shv + 25, 18 + sz, 16);
      cx.globalAlpha = 1;
      px(x + 4, by + shv + 18, 24 + sz, 16 + sz, '#D838A0');
      px(x + 6, by + shv + 20, 20 + sz, 12 + sz, '#E848B0');
      px(x + 8, by + shv + 22, 16 + sz, 8, '#F060C0');
      cx.globalAlpha = 0.5;
      px(x - 6, by + shv + 8, 12, 16, '#C8F8C8');
      px(x + sz + 26, by + shv + 8, 12, 16, '#C8F8C8');
      cx.globalAlpha = 0.6;
      px(x - 4, by + shv + 10, 8, 12, '#D8F8D8');
      px(x + sz + 28, by + shv + 10, 8, 12, '#D8F8D8');
      cx.globalAlpha = 1;
      px(x + 8, by + shv + 4, 16 + sz, 14, '#F8D8E8');
      px(x + 10, by + shv + 6, 12 + sz, 10, '#F8E8F0');
      px(x + 10, by + shv + 2, 12 + sz, 3, '#E8C830');
      px(x + 14, by + shv + 0, 4 + sz, 3, '#E8C830');
      px(x + 15, by + shv - 1, 2, 2, '#D03030');
      px(x + 10, by + shv + 8, 5, 5, '#fff');
      px(x + sz + 18, by + shv + 8, 5, 5, '#fff');
      px(x + 12, by + shv + 10, 3, 3, '#300860');
      px(x + sz + 20, by + shv + 10, 3, 3, '#300860');
      px(x + 12, by + shv + 10, 1, 1, '#fff');
      px(x + sz + 20, by + shv + 10, 1, 1, '#fff');
      px(x + 14, by + shv + 16, 4, 3, '#C05890');
      px(x + 15, by + shv + 17, 2, 1, '#F8D0E0');
      if (f % 40 < 20) {
        cx.fillStyle = '#E8C830';
        cx.font = '8px "Press Start 2P"';
        cx.fillText('♪', x + sz + 24, by + shv + 4 + Math.sin(f * 0.1) * 3);
      }
      px(x + 10, by + shv + 32 + sz, 5, 3, '#D838A0');
      px(x + sz + 18, by + shv + 32 + sz, 5, 3, '#D838A0');
      break;

    case 'spritefly': // Luciérnaga fotógrafa con flash
      const sfhv = Math.sin(fr * 0.15) * 4;
      const flash = Math.sin(fr * 0.2) > 0.7;
      if (flash) {
        cx.globalAlpha = 0.2;
        cx.fillStyle = '#F8F8C0';
      pixelGlow(x + 16, by + sfhv + 20, 22 + sz, 20);
        cx.globalAlpha = 1;
      }
      cx.globalAlpha = 0.5;
      px(x - 4, by + sfhv + 8, 10, 10, '#C8F0F8');
      px(x + sz + 26, by + sfhv + 8, 10, 10, '#C8F0F8');
      px(x - 2, by + sfhv + 14, 8, 8, '#C8F0F8');
      px(x + sz + 24, by + sfhv + 14, 8, 8, '#C8F0F8');
      cx.globalAlpha = 1;
      px(x + 8, by + sfhv + 18, 16 + sz, 12 + sz, '#E8C020');
      px(x + 10, by + sfhv + 20, 12 + sz, 8 + sz, '#F0D030');
      px(x + 10, by + sfhv + 26 + sz, 12 + sz, 4, '#F8F080');
      if (f % 8 < 4) {
        px(x + 12, by + sfhv + 28 + sz, 8 + sz, 3, '#F8F8C0');
      }
      px(x + 8, by + sfhv + 6, 16 + sz, 14, '#E8C020');
      px(x + 10, by + sfhv + 8, 12 + sz, 10, '#F0D030');
      px(x + 8, by + sfhv + 8, 6, 6, '#fff');
      px(x + sz + 18, by + sfhv + 8, 6, 6, '#fff');
      px(x + 10, by + sfhv + 10, 4, 4, '#382858');
      px(x + sz + 20, by + sfhv + 10, 4, 4, '#382858');
      px(x + 10, by + sfhv + 10, 2, 2, '#fff');
      px(x + sz + 20, by + sfhv + 10, 2, 2, '#fff');
      px(x + sz + 22, by + sfhv + 14, 6, 5, '#383838');
      px(x + sz + 23, by + sfhv + 15, 4, 3, '#484848');
      px(x + sz + 27, by + sfhv + 14, 2, 3, '#E8E8E8');
      px(x + 12, by + sfhv + 4, 2, 4, '#C8A020');
      px(x + sz + 18, by + sfhv + 4, 2, 4, '#C8A020');
      px(x + 11, by + sfhv + 2, 2, 2, '#F8E830');
      px(x + sz + 19, by + sfhv + 2, 2, 2, '#F8E830');
      px(x + 10, by + sfhv + 28 + sz, 4, 3, '#C8A020');
      px(x + sz + 18, by + sfhv + 28 + sz, 4, 3, '#C8A020');
      break;

    // ==========================================
    // NORMAL ⚔️ (SECRETO)
    // ==========================================

    case 'serafox': // Zorro ángel - guardián celestial travieso
      const sxhv = Math.sin(fr * 0.1) * 2;
      cx.globalAlpha = 0.1 + Math.sin(fr * 0.06) * 0.05;
      cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, by + sxhv + 22, 22 + sz, 20);
      cx.globalAlpha = 1;
      cx.globalAlpha = 0.7;
      const awf = Math.sin(f * 0.15) * 3;
      px(x - 8, by + sxhv + 6 + awf, 14, 16, '#F8F0E0');
      px(x + sz + 26, by + sxhv + 6 - awf, 14, 16, '#F8F0E0');
      px(x - 6, by + sxhv + 8 + awf, 10, 12, '#F8F8F0');
      px(x + sz + 28, by + sxhv + 8 - awf, 10, 12, '#F8F8F0');
      px(x - 4, by + sxhv + 10 + awf, 6, 8, '#F8F8F8');
      px(x + sz + 30, by + sxhv + 10 - awf, 6, 8, '#F8F8F8');
      cx.globalAlpha = 1;
      px(x - 8, by + sxhv + 6 + awf, 3, 3, '#E8C830');
      px(x + sz + 37, by + sxhv + 6 - awf, 3, 3, '#E8C830');
      px(x + 6, by + sxhv + 18, 20 + sz, 14 + sz, '#E8A030');
      px(x + 8, by + sxhv + 20, 16 + sz, 10 + sz, '#F0B040');
      px(x + 10, by + sxhv + 22, 12 + sz, 6, '#F8C050');
      px(x + 10, by + sxhv + 22, 8 + sz, 6, '#F8F0E0');
      px(x + 6, by + sxhv + 4, 20 + sz, 14, '#E8A030');
      px(x + 8, by + sxhv + 6, 16 + sz, 10, '#F0B040');
      px(x + 10, by + sxhv + 8, 12 + sz, 6, '#F8C050');
      px(x + 12, by + sxhv + 12, 8 + sz, 4, '#F8F0E0');
      px(x + 6, by + sxhv - 2, 5, 8, '#E8A030');
      px(x + sz + 21, by + sxhv - 2, 5, 8, '#E8A030');
      px(x + 7, by + sxhv - 1, 3, 5, '#F0B040');
      px(x + sz + 22, by + sxhv - 1, 3, 5, '#F0B040');
      px(x + 8, by + sxhv + 1, 2, 3, '#F0A0A0');
      px(x + sz + 22, by + sxhv + 1, 2, 3, '#F0A0A0');
      const sxha = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = sxha;
      px(x + 8, by + sxhv - 6, 16 + sz, 2, '#F8E868');
      px(x + 7, by + sxhv - 5, 18 + sz, 1, '#F8D830');
      cx.globalAlpha = 1;
      px(x + 10, by + sxhv + 8, 5, 4, '#fff');
      px(x + sz + 18, by + sxhv + 8, 5, 4, '#fff');
      px(x + 12, by + sxhv + 9, 3, 3, '#C88020');
      px(x + sz + 20, by + sxhv + 9, 3, 3, '#C88020');
      px(x + 12, by + sxhv + 9, 1, 1, '#F8E830');
      px(x + sz + 20, by + sxhv + 9, 1, 1, '#F8E830');
      px(x + 15, by + sxhv + 12, 2, 2, '#282828');
      px(x + 13, by + sxhv + 15, 6, 1, '#C08868');
      px(x + 18, by + sxhv + 14, 2, 1, '#C08868');
      px(x - 6, by + sxhv + 26, 10, 6, '#E8A030');
      px(x - 8, by + sxhv + 24, 8, 5, '#F0B040');
      px(x - 10, by + sxhv + 22, 6, 4, '#F8F0E0');
      px(x + 8, by + sxhv + 30 + sz, 5, 6, '#E8A030');
      px(x + sz + 18, by + sxhv + 30 + sz, 5, 6, '#E8A030');
      px(x + 8, by + sxhv + 34 + sz, 5, 2, '#282828');
      px(x + sz + 18, by + sxhv + 34 + sz, 5, 2, '#282828');
      if (f % 24 < 12) {
        px(x + sz + 28, by + sxhv + 4, 2, 2, '#F8F8C0');
        px(x - 4, by + sxhv + 16, 2, 2, '#F8F8C0');
        px(x + 20, by + sxhv - 4, 2, 2, '#F8E868');
      }
      break;

    // ==========================================
    // EVOLUCIONES FUEGO 🔥
    // ==========================================

    case 'flamcrest': // Flamcrest: adolescente de cuello corto con abanico controlado
      {
        const sway = Math.sin(f * 0.12) * 2;
        // cola/abanico intermedio: menos plumas, no tan final como Inferpavo
        const tail = [
          [-4, 10 + sway, '#8A1810'],
          [3, 6 + sway, '#B82818'],
          [10, 4 + sway, '#D83828'],
          [17, 4 - sway, '#D83828'],
          [24, 6 - sway, '#B82818'],
          [31, 10 - sway, '#8A1810'],
        ];
        tail.forEach((t, i) => {
          const h = i === 2 || i === 3 ? 27 : i === 1 || i === 4 ? 24 : 19;
          px(x + t[0], by + t[1], 6, h, t[2]);
          px(x + t[0] + 1, by + t[1] + 2, 4, Math.max(8, h - 8), i === 2 || i === 3 ? '#E84838' : '#E83828');
        });
        // ojos de pluma reducidos
        for (let i = 0; i < 3; i++) {
          const fx = x + 7 + i * 9;
          const fy = by + 10 + Math.abs(i - 1) * 2;
          px(fx, fy, 4, 4, '#F8A030');
          px(fx + 1, fy + 1, 2, 2, '#2040A0');
        }
        // cuerpo erguido pero juvenil
        px(x + 10, by + 23, 14 + sz, 13 + sz, '#B82818');
        px(x + 12, by + 25, 10 + sz, 9 + sz, '#D83828');
        px(x + 14, by + 27, 6 + sz, 5, '#F06838');
        // cuello más corto
        px(x + 15, by + 14, 5 + sz, 10, '#B82818');
        px(x + 17, by + 13, 2 + sz, 10, '#E84838');
        // cabeza altiva, más cerca del cuerpo
        px(x + 10, by + 7, 15 + sz, 10, '#B82818');
        px(x + 12, by + 9, 11 + sz, 6, '#D83828');
        // cresta mediana
        px(x + 10, by - 1, 3, 8, '#E82020');
        px(x + 15, by - 4, 4, 11, '#F83828');
        px(x + 21, by - 1, 3, 8, '#E82020');
        px(x + 16, by - 2, 2, 6, '#F8C040');
        // ojos serios
        px(x + 12, by + 10, 4, 4, '#fff');
        px(x + sz + 20, by + 10, 4, 4, '#fff');
        px(x + 14, by + 12, 2, 2, '#801010');
        px(x + sz + 21, by + 12, 2, 2, '#801010');
        px(x + 15, by + 17, 5, 2, '#F0C030');
        // patas largas
        px(x + 12, by + 35 + sz, 4, 8, '#C89020');
        px(x + sz + 21, by + 35 + sz, 4, 8, '#C89020');
        px(x + 10, by + 42 + sz, 7, 2, '#A87018');
        px(x + sz + 20, by + 42 + sz, 7, 2, '#A87018');
      }
      break;

    case 'inferpavo': // Inferpavo: rey-fénix con abanico enorme de fuego
      {
        const wave = Math.sin(f * 0.1) * 2;
        // abanico gigantesco, ocupa casi todo el sprite y cambia la silueta final
        const tailCols = ['#6A1008','#8A1810','#B82018','#D83828','#F04830','#D83828','#B82018','#8A1810','#6A1008'];
        for (let i = 0; i < 9; i++) {
          const fx = x - 18 + i * 7;
          const h = 24 + (4 - Math.abs(i - 4)) * 5;
          const fy = by + 8 - (4 - Math.abs(i - 4)) * 2 + Math.sin(f * 0.08 + i) * 2;
          px(fx, fy, 6, h, tailCols[i]);
          px(fx + 1, fy + 2, 4, Math.max(8, h - 8), i === 4 ? '#F86040' : '#E84030');
          px(fx + 1, fy + 5, 4, 4, '#F8C040');
          px(fx + 2, fy + 6, 2, 2, '#2040A0');
        }
        // corona/base dorada del abanico
        px(x + 2, by + 32, 30 + sz, 5, '#C8A830');
        px(x + 6, by + 33, 22 + sz, 2, '#F8E060');
        // cuerpo regio más compacto delante del abanico
        px(x + 7, by + 22, 20 + sz, 17 + sz, '#A02010');
        px(x + 9, by + 24, 16 + sz, 13 + sz, '#C02818');
        px(x + 12, by + 26, 10 + sz, 8, '#F04830');
        // alas laterales de fuego
        px(x - 8, by + 20 + wave, 14, 12, '#A02010');
        px(x - 12, by + 24 + wave, 10, 8, '#E84020');
        px(x + sz + 27, by + 20 - wave, 14, 12, '#A02010');
        px(x + sz + 35, by + 24 - wave, 10, 8, '#E84020');
        // cuello y cabeza coronada
        px(x + 14, by + 10, 6 + sz, 14, '#A02010');
        px(x + 16, by + 9, 3 + sz, 14, '#E84020');
        px(x + 8, by + 0, 20 + sz, 13, '#A02010');
        px(x + 10, by + 2, 16 + sz, 9, '#C02818');
        px(x + 13, by + 4, 10 + sz, 5, '#F04830');
        // corona/cresta real
        px(x + 8, by - 8, 4, 9, '#E82020');
        px(x + 14, by - 12, 5, 13, '#F83020');
        px(x + 22, by - 8, 4, 9, '#E82020');
        px(x + 15, by - 10, 3, 8, '#F8E060');
        px(x + 10, by - 6, 2, 4, '#F8C040');
        px(x + 23, by - 6, 2, 4, '#F8C040');
        // mirada real
        px(x + 11, by + 4, 6, 5, '#F8C030');
        px(x + sz + 20, by + 4, 6, 5, '#F8C030');
        px(x + 13, by + 6, 3, 3, '#801010');
        px(x + sz + 22, by + 6, 3, 3, '#801010');
        px(x + 14, by + 12, 7, 2, '#E8A020');
        // patas fuertes
        px(x + 10, by + 38 + sz, 5, 7, '#C89020');
        px(x + sz + 21, by + 38 + sz, 5, 7, '#C89020');
        px(x + 8, by + 44 + sz, 8, 2, '#A87018');
        px(x + sz + 20, by + 44 + sz, 8, 2, '#A87018');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 16, by + 22, 34 + sz, 22);
        cx.globalAlpha = 1;
      }
      break;

    case 'flamencero': // Flamencero: diva del flamenco con vestido de fuego y abanico
      {
        const sw = Math.sin(f * 0.18) * 3;
        // giro gracioso: ya no es solo flamingo, ahora es bailaora exagerada con vestido gigante
        // vestido/cuerpo de volantes en forma de campana
        px(x + 6, by + 18, 24 + sz, 10, '#A82020');
        px(x + 4, by + 26, 28 + sz, 9, '#C82838');
        px(x + 2, by + 34, 32 + sz, 8, '#E83020');
        px(x + 5, by + 38, 26 + sz, 5, '#F8A030');
        px(x + 8, by + 20, 18 + sz, 7, '#D83848');
        px(x + 10, by + 28, 14 + sz, 5, '#F06070');
        // lunares cuadrados del vestido
        px(x + 8, by + 29, 3, 3, '#F8E8D0');
        px(x + 20, by + 34, 3, 3, '#F8E8D0');
        px(x + sz + 26, by + 31, 3, 3, '#F8E8D0');
        // cuello y cabeza altiva
        px(x + 15, by + 5, 4, 15, '#C82838');
        px(x + 17, by + 3, 5, 4, '#D83848');
        px(x + 20, by + 1, 10, 8, '#D83848');
        px(x + 22, by + 3, 6, 4, '#F08090');
        px(x + 29, by + 4, 5, 2, '#F0A030');
        px(x + 32, by + 5, 3, 1, '#D88020');
        px(x + 24, by + 3, 3, 3, '#fff');
        px(x + 25, by + 4, 2, 2, '#181818');
        // peineta/flor flamenca gigante
        px(x + 18, by - 5, 5, 5, '#E82020');
        px(x + 23, by - 6, 4, 4, '#F84040');
        px(x + 20, by - 9, 4, 4, '#F8A030');
        // abanico de fuego en un ala y brazo dramático
        px(x - 8, by + 14 + sw, 14, 5, '#E83020');
        px(x - 12, by + 18 + sw, 18, 5, '#F84830');
        px(x - 14, by + 22 + sw, 16, 4, '#F8A030');
        px(x - 10, by + 16 + sw, 2, 10, '#F8E060');
        px(x + sz + 27, by + 15 - sw, 8, 14, '#A82020');
        px(x + sz + 29, by + 17 - sw, 4, 10, '#F84830');
        // tacón visible bajo el vestido
        px(x + 13, by + 41 + sz, 3, 7, '#C89020');
        px(x + 11, by + 47 + sz, 7, 2, '#A87018');
      }
      break;

    case 'alquimero': // Alquímero: salamandra dentro de un caldero andante
      {
        const steam = Math.sin(f * 0.1) * 2;
        // silueta dominada por caldero, no por cuerpo de salamandra
        px(x + 2, by + 21, 30 + sz, 16 + sz, '#2A2A30');
        px(x + 4, by + 23, 26 + sz, 12 + sz, '#3A3A40');
        px(x + 7, by + 20, 20 + sz, 4, '#5A5A60');
        px(x + 8, by + 24, 18 + sz, 3, '#40C040');
        px(x + 10, by + 25, 14 + sz, 2, '#80F080');
        // patas del caldero
        px(x + 5, by + 36 + sz, 5, 5, '#202024');
        px(x + sz + 24, by + 36 + sz, 5, 5, '#202024');
        // salamandra asomándose
        px(x + 8, by + 6, 20 + sz, 14, '#D85018');
        px(x + 10, by + 8, 16 + sz, 10, '#E86828');
        px(x + 12, by + 10, 12 + sz, 6, '#F89040');
        // sombrero alto de alquimista
        px(x + 8, by - 2, 20 + sz, 8, '#4030A0');
        px(x + 10, by - 6, 16 + sz, 5, '#5040B0');
        px(x + 14, by - 9, 8 + sz, 4, '#382080');
        px(x + 16, by - 7, 4, 2, '#F8E830');
        // lentes de laboratorio
        px(x + 9, by + 8, 6, 5, '#C8A830');
        px(x + 10, by + 9, 4, 3, '#D8E8F0');
        px(x + sz + 19, by + 8, 6, 5, '#C8A830');
        px(x + sz + 20, by + 9, 4, 3, '#D8E8F0');
        px(x + 15, by + 10, 4, 1, '#C8A830');
        px(x + 14, by + 17, 5, 2, '#C04818');
        // brazo con cucharón y libro pequeño
        px(x - 5, by + 18, 9, 4, '#D85018');
        px(x - 9, by + 17, 5, 6, '#8A5020');
        px(x + sz + 29, by + 15, 2, 18, '#6A4828');
        px(x + sz + 27, by + 14, 6, 4, '#C8C8C8');
        // vapor pixelado
        cx.globalAlpha = 0.35;
        px(x + 9, by + 14 + steam, 3, 3, '#A0A0A0');
        px(x + 17, by + 10 - steam, 4, 4, '#C0C0C0');
        px(x + 24, by + 13 + steam, 3, 3, '#A0A0A0');
        cx.globalAlpha = 1;
      }
      break;

    case 'piromante': // Piromante: maestro alto con túnica, bastón y salamandra ígnea
      {
        const flame = Math.sin(f * 0.16) * 2;
        // silueta vertical de mago, no salamandra común
        px(x + 8, by + 14, 20 + sz, 27 + sz, '#3828A0');
        px(x + 10, by + 16, 16 + sz, 23 + sz, '#4838B0');
        px(x + 12, by + 18, 12 + sz, 18, '#C04010');
        px(x + 14, by + 20, 8 + sz, 12, '#D85018');
        // mangas largas
        px(x + 2, by + 16, 8, 20, '#2818A0');
        px(x + sz + 27, by + 16, 8, 20, '#2818A0');
        px(x + 4, by + 30, 5, 5, '#C04010');
        // cola de salamandra saliendo de la túnica
        px(x + 5, by + 36 + sz, 12, 4, '#C04010');
        px(x + 2, by + 38 + sz, 5, 3, '#F08030');
        // cabeza/cara de maestro
        px(x + 6, by + 2, 24 + sz, 15, '#C04010');
        px(x + 8, by + 4, 20 + sz, 11, '#D85018');
        px(x + 10, by + 6, 16 + sz, 7, '#F08030');
        // gran sombrero/corona de fuego
        px(x + 4, by - 4, 28 + sz, 6, '#3828A0');
        px(x + 8, by - 10, 20 + sz, 7, '#4838B0');
        px(x + 13, by - 16, 10 + sz, 7, '#2818A0');
        px(x + 5, by - 8, 4, 6, '#E82020');
        px(x + sz + 27, by - 8, 4, 6, '#E82020');
        px(x + 12, by - 18 + flame, 4, 7, '#F8A030');
        px(x + 18, by - 20 + flame, 5, 9, '#F86040');
        // ojos dorados y barba de fuego
        px(x + 9, by + 7, 6, 5, '#F8C030');
        px(x + sz + 21, by + 7, 6, 5, '#F8C030');
        px(x + 11, by + 9, 3, 3, '#801010');
        px(x + sz + 23, by + 9, 3, 3, '#801010');
        px(x + 12, by + 14, 10, 4, '#E86020');
        px(x + 14, by + 18, 6, 4, '#F08030');
        // bastón con llama enorme
        px(x + sz + 35, by + 7, 2, 32, '#5A4020');
        px(x + sz + 32, by + 2 + flame, 8, 6, '#F8A030');
        px(x + sz + 34, by - 2 + flame, 4, 6, '#E82020');
        px(x + sz + 35, by - 4 + flame, 2, 3, '#F8E060');
        // aura pixelada
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 16, by + 20, 20 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'infernotoro': // Infernotoro: toro cuadrúpedo negro con cuernos y cola de fuego
      {
        const flame = Math.sin(f * 0.18) * 2;
        // cuerpo cuadrúpedo negro, ancho y bajo
        px(x - 2, by + 18, 36 + sz, 19 + sz, '#101010');
        px(x + 1, by + 20, 32 + sz, 15 + sz, '#181818');
        px(x + 5, by + 23, 24 + sz, 8, '#242020');
        // lomo ardiente tenue
        px(x + 6, by + 16, 22 + sz, 5, '#501010');
        px(x + 10, by + 15, 14 + sz, 3, '#A82010');
        // cuatro patas fuertes
        px(x + 2, by + 34 + sz, 6, 10, '#101010');
        px(x + 12, by + 35 + sz, 6, 9, '#101010');
        px(x + sz + 23, by + 35 + sz, 6, 9, '#101010');
        px(x + sz + 33, by + 34 + sz, 6, 10, '#101010');
        px(x + 0, by + 43 + sz, 10, 3, '#050505');
        px(x + sz + 32, by + 43 + sz, 10, 3, '#050505');
        // cabeza poderosa al frente
        px(x + 22, by + 7, 17 + sz, 16, '#101010');
        px(x + 24, by + 9, 13 + sz, 12, '#201818');
        px(x + 30, by + 16, 9, 6, '#0A0A0A'); // hocico oscuro
        px(x + 30, by + 18, 2, 2, '#C8A080');
        px(x + 34, by + 18, 2, 2, '#C8A080');
        // cuernos grandes de fuego
        px(x + 15, by + 1, 10, 6, '#E84020');
        px(x + 11, by - 3, 8, 5, '#F8A030');
        px(x + 8, by - 5, 5, 4, '#F8E060');
        px(x + sz + 37, by + 1, 10, 6, '#E84020');
        px(x + sz + 45, by - 3, 8, 5, '#F8A030');
        px(x + sz + 52, by - 5, 5, 4, '#F8E060');
        // ojos encendidos
        px(x + 25, by + 11, 4, 4, '#F8C030');
        px(x + sz + 33, by + 11, 4, 4, '#F8C030');
        px(x + 27, by + 13, 2, 2, '#601010');
        px(x + sz + 35, by + 13, 2, 2, '#601010');
        // cola con punta de llama
        px(x - 10, by + 22, 12, 4, '#101010');
        px(x - 17, by + 17 + flame, 8, 8, '#E84020');
        px(x - 20, by + 13 + flame, 6, 6, '#F8A030');
        px(x - 22, by + 10 + flame, 3, 5, '#F8E060');
        // delantal quemado mínimo para mantener idea chef
        px(x + 12, by + 25, 13, 7, '#D8C8A0');
        px(x + 14, by + 26, 9, 4, '#E0D0B0');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F84020';
        pixelGlow(x + 18, by + 24, 34 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'ajolord': // Ajolord: piel morada, brazos gruesos caídos y picos de hielo
      {
        const droop = Math.sin(f * 0.1) * 1;
        const P1 = '#5A4AA0', P2 = '#6A58B8', P3 = '#8070D0';
        const ICE1 = '#B8E8F8', ICE2 = '#E8F8FF';
        // cuerpo intermedio más morado, preparando la armadura de hielo final
        px(x + 4, by + 18, 24 + sz, 14 + sz, P1);
        px(x + 6, by + 20, 20 + sz, 10 + sz, P2);
        px(x + 8, by + 22, 16 + sz, 6, P3);
        // placas/picos de hielo en hombros y lomo
        px(x + 5, by + 15, 5, 5, ICE1);
        px(x + 13, by + 13, 5, 7, ICE2);
        px(x + sz + 25, by + 15, 5, 5, ICE1);
        px(x + 17, by + 17, 4, 3, '#C8F0F8');
        // brazos gruesos, largos y caídos como adolescente pesado
        px(x - 2, by + 20 + droop, 9, 14, '#4A3C90');
        px(x - 5, by + 29 + droop, 8, 6, '#5A4AA0');
        px(x - 8, by + 33 + droop, 7, 4, '#8070D0');
        px(x + sz + 26, by + 20 - droop, 9, 14, '#4A3C90');
        px(x + sz + 32, by + 29 - droop, 8, 6, '#5A4AA0');
        px(x + sz + 38, by + 33 - droop, 7, 4, '#8070D0');
        // cabeza morada con placas de hielo
        px(x + 4, by + 4, 24 + sz, 16, P1);
        px(x + 6, by + 6, 20 + sz, 12, P2);
        px(x + 8, by + 8, 16 + sz, 8, P3);
        px(x + 10, by + 1, 5, 6, ICE2);
        px(x + 18, by - 2, 5, 9, ICE1);
        px(x + sz + 25, by + 1, 5, 6, ICE2);
        // branquias intermedias congelándose
        px(x - 2, by + 2, 6, 4, '#C8F0F8');
        px(x - 4, by + 6, 6, 4, '#90D0F0');
        px(x - 3, by + 10, 6, 4, '#C8F0F8');
        px(x + sz + 28, by + 2, 6, 4, '#C8F0F8');
        px(x + sz + 30, by + 6, 6, 4, '#90D0F0');
        px(x + sz + 29, by + 10, 6, 4, '#C8F0F8');
        // ojos y cejas frías
        px(x + 8, by + 8, 5, 5, '#E8F8FF');
        px(x + sz + 18, by + 8, 5, 5, '#E8F8FF');
        px(x + 10, by + 10, 3, 3, '#103C88');
        px(x + sz + 20, by + 10, 3, 3, '#103C88');
        px(x + 8, by + 7, 5, 1, '#382878');
        px(x + sz + 18, by + 7, 5, 1, '#382878');
        px(x + 14, by + 16, 5, 1, '#403080');
        // cola lateral y pies
        px(x - 2, by + 30, 10, 4, P1);
        px(x - 7, by + 28, 6, 4, P2);
        px(x - 11, by + 26, 5, 4, ICE1);
        px(x + 6, by + 30 + sz, 5, 4, P1);
        px(x + sz + 20, by + 30 + sz, 5, 4, P1);
      }
      break;

    case 'glaciolote': // Glaciolote: armadura de hielo imponente con piel morada apenas visible
      {
        const frost = Math.sin(f * 0.08) * 1;
        const SKP = '#4A3478';
        // aura fría pixelada detrás para presencia
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#88D0F8';
        pixelGlow(x + 16, by + 20 + frost, 44 + sz, 30);
        cx.globalAlpha = 1;

        // piel morada visible en sombras debajo de la armadura
        px(x - 6, by + 18, 46 + sz, 18 + sz, SKP);
        px(x + 0, by + 25, 36 + sz, 8, '#5A4090');
        // armadura de hielo: placas dominantes
        px(x - 7, by + 16, 47 + sz, 9, '#4F86B0');
        px(x - 3, by + 20, 41 + sz, 12 + sz, '#6FA8D0');
        px(x + 2, by + 22, 34 + sz, 8, '#A8E0F8');
        px(x + 7, by + 24, 24 + sz, 3, '#E8F8F8');
        // placas grandes del lomo
        px(x - 1, by + 11, 7, 9, '#C8F0F8');
        px(x + 8, by + 7, 7, 13, '#E8F8F8');
        px(x + 18, by + 8, 7, 12, '#C8F0F8');
        px(x + sz + 29, by + 12, 7, 8, '#B8E8F8');
        px(x - 14, by + 16, 10, 10, '#E8F8F8');
        px(x + sz + 40, by + 16, 10, 10, '#E8F8F8');

        // cuatro patas con armadura; piel morada apenas en articulaciones
        px(x + 0, by + 31 + sz, 7, 10, '#4F86B0');
        px(x + 10, by + 32 + sz, 7, 10, '#4F86B0');
        px(x + sz + 22, by + 32 + sz, 7, 10, '#4F86B0');
        px(x + sz + 32, by + 31 + sz, 7, 10, '#4F86B0');
        px(x + 2, by + 35 + sz, 3, 3, SKP);
        px(x + sz + 34, by + 35 + sz, 3, 3, SKP);
        px(x - 1, by + 39 + sz, 10, 3, '#E8F8F8');
        px(x + 9, by + 40 + sz, 10, 3, '#E8F8F8');
        px(x + sz + 21, by + 40 + sz, 10, 3, '#E8F8F8');
        px(x + sz + 31, by + 39 + sz, 10, 3, '#E8F8F8');

        // cola pesada de hielo
        px(x - 13, by + 25, 12, 6, '#6FA8D0');
        px(x - 20, by + 22, 8, 6, '#A8E0F8');
        px(x - 24, by + 20, 5, 4, '#E8F8F8');

        // cabeza blindada: morado visible solo en ranuras
        px(x + 2, by + 1, 31 + sz, 18, SKP);
        px(x + 3, by + 0, 31 + sz, 8, '#4F86B0');
        px(x + 4, by + 3, 27 + sz, 14, '#6FA8D0');
        px(x + 7, by + 5, 21 + sz, 9, '#A8E0F8');
        // branquias/cristales laterales grandes
        px(x - 7, by + 3, 8, 5, '#C8F0F8');
        px(x - 10, by + 8, 8, 5, '#90D0F0');
        px(x - 8, by + 13, 8, 5, '#C8F0F8');
        px(x + sz + 34, by + 3, 8, 5, '#C8F0F8');
        px(x + sz + 36, by + 8, 8, 5, '#90D0F0');
        px(x + sz + 35, by + 13, 8, 5, '#C8F0F8');
        // corona de hielo superior
        px(x + 5, by - 5, 5, 7, '#D8F8FF');
        px(x + 13, by - 10, 6, 12, '#E8F8F8');
        px(x + 23, by - 6, 5, 8, '#C8F0F8');
        px(x + 16, by - 13, 3, 5, '#FFFFFF');
        // ojos intensos desde ranuras moradas
        px(x + 7, by + 7, 7, 6, '#D8F0F8');
        px(x + sz + 22, by + 7, 7, 6, '#D8F0F8');
        px(x + 9, by + 9, 4, 4, '#103C88');
        px(x + sz + 24, by + 9, 4, 4, '#103C88');
        px(x + 7, by + 6, 7, 1, '#2F2458');
        px(x + sz + 22, by + 6, 7, 1, '#2F2458');
        // colmillos/placas frontales de hielo
        px(x + 5, by + 15, 6, 10, '#E8F8F8');
        px(x + sz + 27, by + 15, 6, 10, '#E8F8F8');
        px(x + 6, by + 23, 3, 5, '#B8E8F8');
        px(x + sz + 30, by + 23, 3, 5, '#B8E8F8');

        // barba helada más grande e imponente
        px(x + 6, by + 17, 24 + sz, 6, '#E8F8F8');
        px(x + 8, by + 22, 20 + sz, 5, '#C8F0F8');
        px(x + 10, by + 26, 16 + sz, 4, '#A8E0F8');
        px(x + 15, by + 29, 6 + sz, 4, '#E8F8F8');
        px(x + 17, by + 33, 2 + sz, 3, '#FFFFFF');
        if (f % 20 < 10) {
          cx.globalAlpha = 0.55;
          px(x + sz + 33, by + 2 + Math.sin(f * 0.06) * 3, 2, 2, '#E8F8F8');
          px(x - 4, by + 15 + Math.sin(f * 0.08) * 2, 2, 2, '#E8F8F8');
          cx.globalAlpha = 1;
        }
      }
      break;

    case 'medubass': // Medusa con speakers
      {
        const mbhv2 = Math.sin(fr * 0.1) * 3;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#3060E0';
      pixelGlow(x + 16, by + mbhv2 + 20, 20 + sz, 16);
        cx.globalAlpha = 1;
        px(x + 2, by + mbhv2 + 4, 28 + sz, 16, '#2058B0');
        px(x + 4, by + mbhv2 + 6, 24 + sz, 12, '#3078C8');
        px(x + 6, by + mbhv2 + 8, 20 + sz, 8, '#4098E0');
        px(x - 2, by + mbhv2 + 10, 6, 6, '#282828');
        px(x - 1, by + mbhv2 + 11, 4, 4, '#404040');
        px(x + sz + 28, by + mbhv2 + 10, 6, 6, '#282828');
        px(x + sz + 29, by + mbhv2 + 11, 4, 4, '#404040');
        if (f % 12 < 6) {
          cx.globalAlpha = 0.3;
          px(x - 6, by + mbhv2 + 12, 3, 2, '#80C0F0');
          px(x + sz + 34, by + mbhv2 + 12, 3, 2, '#80C0F0');
          cx.globalAlpha = 1;
        }
        px(x + 6, by + mbhv2 + 10, 20 + sz, 4, '#181818');
        px(x + 8, by + mbhv2 + 11, 6, 2, '#30E0E0');
        px(x + sz + 18, by + mbhv2 + 11, 6, 2, '#30E0E0');
        for (let i = 0; i < 6; i++) {
          const ttw2 = Math.sin(f * 0.12 + i) * 3;
          px(
            x + 4 + i * 4,
            by + mbhv2 + 20 + ttw2,
            2,
            12 + (i % 3) * 2,
            '#2050A0'
          );
          if (f % 10 < 5)
            px(
              x + 4 + i * 4,
              by + mbhv2 + 30 + ttw2 + (i % 3) * 2,
              2,
              2,
              '#F8E830'
            );
        }
      }
      break;

    case 'pinzamestre': // Pinzamestre: cangrejo estilista con pinzas gigantes
      {
        const snap = Math.sin(f * 0.16) * 2;
        // cuerpo más pequeño para que las pinzas dominen la silueta
        px(x + 6, by + 22, 24 + sz, 12 + sz, '#B83818');
        px(x + 8, by + 24, 20 + sz, 8 + sz, '#D04828');
        px(x + 12, by + 25, 12 + sz, 4, '#F07040');
        // banda/sombrero de estilista
        px(x + 5, by + 18, 26 + sz, 4, '#4030A0');
        px(x + 7, by + 16, 22 + sz, 4, '#5040B0');
        px(x + 14, by + 17, 8, 2, '#E8C840');
        // ojos
        px(x + 7, by + 10, 6, 5, '#fff');
        px(x + sz + 23, by + 10, 6, 5, '#fff');
        px(x + 9, by + 12, 3, 2, '#181818');
        px(x + sz + 25, by + 12, 3, 2, '#181818');
        // mostacho blanco de maestro estilista
        px(x + 10, by + 15, 6, 2, '#F8F8F8');
        px(x + sz + 20, by + 15, 6, 2, '#F8F8F8');
        px(x + 8, by + 16, 5, 1, '#E8E8E8');
        px(x + sz + 24, by + 16, 5, 1, '#E8E8E8');
        // monóculo/lente estilista
        px(x + sz + 24, by + 9, 7, 6, '#C8A830');
        px(x + sz + 25, by + 10, 5, 4, '#D8E8F0');
        // brazos largos hacia pinzas enormes
        px(x - 5, by + 21 + snap, 10, 5, '#A03018');
        px(x + sz + 31, by + 21 - snap, 10, 5, '#A03018');
        // pinza izquierda enorme tipo tijera
        px(x - 20, by + 12 + snap, 18, 12, '#C8A830');
        px(x - 22, by + 9 + snap, 10, 8, '#D8B840');
        px(x - 22, by + 22 + snap, 10, 8, '#D8B840');
        px(x - 19, by + 11 + snap, 5, 4, '#F0D860');
        px(x - 19, by + 24 + snap, 5, 4, '#F0D860');
        px(x - 10, by + 17 + snap, 8, 3, '#8A6018');
        // pinza derecha enorme tipo tijera
        px(x + sz + 38, by + 12 - snap, 18, 12, '#C8A830');
        px(x + sz + 50, by + 9 - snap, 10, 8, '#D8B840');
        px(x + sz + 50, by + 22 - snap, 10, 8, '#D8B840');
        px(x + sz + 53, by + 11 - snap, 5, 4, '#F0D860');
        px(x + sz + 53, by + 24 - snap, 5, 4, '#F0D860');
        px(x + sz + 38, by + 17 - snap, 8, 3, '#8A6018');
        // peine y tijeras como accesorios
        px(x - 18, by + 5 + snap, 10, 2, '#F0F0F0');
        px(x - 24, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x - 20, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x - 16, by + 7 + snap, 2, 3, '#F0F0F0');
        px(x + sz + 48, by + 5 - snap, 9, 2, '#E8E8E8');
        px(x + sz + 58, by + 3 - snap, 2, 6, '#E8E8E8');
        // patas múltiples
        px(x + 6, by + 31 + sz, 4, 4, '#B83818');
        px(x + 12, by + 32 + sz, 4, 4, '#B83818');
        px(x + 20, by + 32 + sz, 4, 4, '#B83818');
        px(x + sz + 27, by + 31 + sz, 4, 4, '#B83818');
        px(x + 14, by + 29, 6, 2, '#A03818');
      }
      break;

    case 'pinguchef': // Pingüino chef
      px(x + 4, by + 16, 24 + sz, 16 + sz, '#1A1A2A');
      px(x + 6, by + 18, 20 + sz, 12 + sz, '#282838');
      px(x + 10, by + 20, 12 + sz, 10, '#F0F0F0');
      px(x + 8, by + 20, 16 + sz, 10, '#F8F8F8');
      px(x + 10, by + 22, 12 + sz, 6, '#F0F0F0');
      px(x + 6, by + 4, 20 + sz, 14, '#1A1A2A');
      px(x + 10, by + 8, 12 + sz, 6, '#F0F0F0');
      px(x + 8, by + 0, 16 + sz, 6, '#F8F8F8');
      px(x + 10, by - 3, 12 + sz, 5, '#F8F8F8');
      px(x + 12, by - 4, 8 + sz, 3, '#F0F0F0');
      px(x + 10, by + 8, 4, 4, '#fff');
      px(x + sz + 18, by + 8, 4, 4, '#fff');
      px(x + 12, by + 10, 2, 2, '#181818');
      px(x + sz + 20, by + 10, 2, 2, '#181818');
      px(x + 14, by + 12, 4, 3, '#F0A030');
      px(x + sz + 26, by + 18, 2, 12, '#C8C8C8');
      px(x + sz + 25, by + 16, 4, 3, '#5A4020');
      px(x + 10, by + 30 + sz, 4, 4, '#F0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#F0A030');
      break;

    case 'pingumitre': // Pingüino dueño del restaurante
      px(x + 2, by + 14, 28 + sz, 18 + sz, '#0A0A1A');
      px(x + 4, by + 16, 24 + sz, 14 + sz, '#1A1A2A');
      px(x + 10, by + 18, 12 + sz, 12, '#F0F0F0');
      px(x + 6, by + 16, 8, 14, '#0A0A1A');
      px(x + sz + 18, by + 16, 8, 14, '#0A0A1A');
      px(x + 14, by + 18, 4, 2, '#C8A830');
      px(x + 4, by + 2, 24 + sz, 14, '#0A0A1A');
      px(x + 8, by + 6, 16 + sz, 8, '#F0F0F0');
      px(x + 6, by - 4, 20 + sz, 6, '#0A0A1A');
      px(x + 8, by - 8, 16 + sz, 6, '#1A1A2A');
      px(x + 8, by - 3, 16 + sz, 1, '#C8A830');
      px(x + 10, by + 6, 4, 4, '#fff');
      px(x + sz + 18, by + 6, 4, 4, '#fff');
      px(x + 12, by + 8, 2, 2, '#181818');
      px(x + sz + 20, by + 8, 2, 2, '#181818');
      px(x + sz + 17, by + 6, 5, 5, '#C8A830');
      px(x + sz + 18, by + 7, 3, 3, '#D8E8F0');
      px(x + 12, by + 12, 8, 2, '#0A0A1A');
      px(x + 14, by + 14, 4, 2, '#E0A030');
      px(x + sz + 28, by + 10, 2, 20, '#5A4020');
      px(x + sz + 27, by + 8, 4, 3, '#C8A830');
      px(x + 10, by + 30 + sz, 4, 4, '#E0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#E0A030');
      break;

    case 'cosmocardumen': // Tiburón cósmico formado por muchos peces pequeños
      {
        const swim = Math.sin(f * 0.08) * 2;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#3060E0';
        pixelGlow(x + 17, by + swim + 20, 30 + sz, 16);
        cx.globalAlpha = 1;

        // Silueta general de tiburón: cabeza a la derecha, cola a la izquierda,
        // formada por peces rectangulares pequeños.
        const fish = [
          // fila superior/lomo
          [6, 17, 5, 3, 0], [12, 14, 5, 3, 1], [18, 12, 5, 3, 2], [24, 12, 5, 3, 0], [30, 14, 5, 3, 1],
          // cuerpo central ancho
          [3, 22, 5, 3, 1], [9, 20, 5, 3, 2], [15, 18, 5, 3, 0], [21, 18, 5, 3, 1], [27, 19, 5, 3, 2], [33, 21, 5, 3, 0],
          [8, 25, 5, 3, 0], [14, 25, 5, 3, 1], [20, 25, 5, 3, 2], [26, 25, 5, 3, 0], [32, 25, 5, 3, 1],
          // vientre
          [13, 29, 5, 3, 2], [19, 30, 5, 3, 0], [25, 29, 5, 3, 1],
          // cola bífida a la izquierda
          [-4, 16, 5, 3, 2], [0, 19, 5, 3, 0], [-5, 27, 5, 3, 1], [0, 25, 5, 3, 2],
          // aleta dorsal y aletas inferiores
          [21, 7, 5, 3, 2], [23, 5, 4, 3, 1], [18, 34, 5, 3, 0], [28, 33, 5, 3, 2],
        ];
        const cols = ['#2070C0', '#3090E0', '#50B0F0'];
        fish.forEach((a, i) => {
          const fx = x + a[0] + Math.sin(f * 0.035 + i) * 1.5;
          const fy = by + swim + a[1] + Math.cos(f * 0.04 + i) * 1;
          cx.fillStyle = cols[a[4]];
          cx.fillRect(fx, fy, a[2], a[3]);
          // puntito-ojo/escama clara de cada pez
          cx.fillStyle = '#E8F8FF';
          cx.fillRect(fx + a[2] - 1, fy + 1, 1, 1);
          // colita pixelada
          cx.fillStyle = a[4] === 2 ? '#2070C0' : '#1858A0';
          cx.fillRect(fx - 2, fy + 1, 2, 1);
        });

        // Cabeza del tiburón/cardumen: más compacta a la derecha
        px(x + 36, by + swim + 18, 8, 10, '#2070C0');
        px(x + 39, by + swim + 20, 7, 6, '#3090E0');
        px(x + 44, by + swim + 22, 4, 3, '#50B0F0'); // hocico
        px(x + 40, by + swim + 20, 3, 3, '#fff');
        px(x + 42, by + swim + 21, 1, 1, '#101848');
        // boca de tiburón en zigzag pixelado
        px(x + 41, by + swim + 27, 8, 1, '#101848');
        px(x + 43, by + swim + 28, 2, 1, '#F8F8F8');
        px(x + 47, by + swim + 28, 2, 1, '#F8F8F8');

        // Estrellas orbitales cuadradas para mantener la idea cósmica
        cx.globalAlpha = 0.65;
        const sa = f * 0.02;
        px(x + 16 + Math.cos(sa) * 20, by + swim + 17 + Math.sin(sa) * 10, 2, 2, '#F8E830');
        px(x + 22 + Math.cos(sa + 3.14) * 18, by + swim + 23 + Math.sin(sa + 3.14) * 9, 2, 2, '#F8F8C0');
        cx.globalAlpha = 1;
      }
      break;

    // ==========================================
    // EVOLUCIONES PLANTA 🌿
    // ==========================================

    case 'hedroble': // Hedroble: cabra butler alta con monóculo, bastón y cola de frac
      {
        const cane = Math.sin(f * 0.1) * 1;
        // cuerpo más alto y bípedo para diferenciarlo del cabrito
        px(x + 10, by + 19, 16 + sz, 20 + sz, '#253020'); // frac oscuro
        px(x + 12, by + 20, 12 + sz, 17 + sz, '#304028');
        px(x + 14, by + 21, 8 + sz, 12, '#F0F0E8'); // pechera blanca
        px(x + 15, by + 24, 2, 2, '#202020');
        px(x + 19, by + 27, 2, 2, '#202020');
        px(x + 10, by + 34 + sz, 5, 8, '#253020');
        px(x + sz + 21, by + 34 + sz, 5, 8, '#253020');
        px(x + 8, by + 40 + sz, 7, 2, '#101018');
        px(x + sz + 21, by + 40 + sz, 7, 2, '#101018');
        // cola de frac
        px(x + 8, by + 30, 5, 10, '#182018');
        px(x + sz + 24, by + 30, 5, 10, '#182018');
        // cabeza más seria
        px(x + 7, by + 4, 22 + sz, 16, '#8FB070');
        px(x + 9, by + 6, 18 + sz, 12, '#B8D098');
        px(x + 5, by + 6, 5, 8, '#608048');
        px(x + sz + 27, by + 6, 5, 8, '#608048');
        // grandes cuernos curvos tipo butler elegante
        px(x + 4, by - 1, 7, 4, '#D8D0B0');
        px(x + 2, by - 3, 5, 3, '#F0E8C8');
        px(x + sz + 26, by - 1, 7, 4, '#D8D0B0');
        px(x + sz + 31, by - 3, 5, 3, '#F0E8C8');
        px(x + 12, by + 9, 4, 4, '#fff');
        px(x + 14, by + 11, 2, 2, '#203010');
        // monóculo enorme y cadena
        px(x + sz + 19, by + 9, 6, 6, '#C8A830');
        px(x + sz + 20, by + 10, 4, 4, '#D8E8F0');
        px(x + sz + 24, by + 15, 1, 9, '#C8A830');
        px(x + sz + 23, by + 22, 2, 2, '#C8A830');
        px(x + 14, by + 17, 7, 2, '#506838');
        // bigotito vegetal
        px(x + 11, by + 16, 4, 2, '#2F7A30');
        px(x + 20, by + 16, 4, 2, '#2F7A30');
        // bastón
        px(x + sz + 31, by + 18 + cane, 2, 24, '#6A4828');
        px(x + sz + 29, by + 16 + cane, 6, 4, '#C8A830');
      }
      break;

    case 'gorilirico': // Gorilírico: bardo erguido con laúd y capa
      {
        const strum = Math.sin(f * 0.15) * 2;
        // postura erguida, más alta y delgada que Gorilán
        px(x + 9, by + 19, 18 + sz, 20 + sz, '#305820');
        px(x + 11, by + 21, 14 + sz, 16 + sz, '#407028');
        px(x + 13, by + 23, 10 + sz, 10, '#508038');
        // capa morada de bardo
        px(x + 6, by + 20, 5, 18, '#4A2870');
        px(x + sz + 26, by + 20, 5, 18, '#4A2870');
        px(x + 7, by + 22, 3, 14, '#6830A0');
        px(x + sz + 27, by + 22, 3, 14, '#6830A0');
        // piernas firmes
        px(x + 9, by + 36 + sz, 6, 8, '#305820');
        px(x + sz + 21, by + 36 + sz, 6, 8, '#305820');
        px(x + 7, by + 43 + sz, 8, 2, '#203818');
        px(x + sz + 21, by + 43 + sz, 8, 2, '#203818');
        // laúd/libro musical al frente: silueta nueva
        px(x - 7, by + 24 + strum, 10, 10, '#8A5020');
        px(x - 5, by + 26 + strum, 6, 6, '#C08038');
        px(x + 1, by + 22 + strum, 10, 2, '#E8D8C0');
        px(x + 5, by + 20 + strum, 2, 8, '#E8D8C0');
        px(x - 2, by + 26 + strum, 2, 2, '#4A2810');
        // brazo tocando
        px(x + 1, by + 20 + strum, 8, 4, '#305820');
        px(x + sz + 25, by + 20 - strum, 8, 5, '#305820');
        px(x + sz + 31, by + 18 - strum, 3, 10, '#407028');
        // cabeza con boina, más adulta
        px(x + 5, by + 2, 26 + sz, 17, '#305820');
        px(x + 7, by + 4, 22 + sz, 13, '#407028');
        px(x + 11, by + 7, 14 + sz, 8, '#5C9440');
        px(x + 4, by - 2, 28 + sz, 5, '#C8A830');
        px(x + 7, by - 4, 22 + sz, 3, '#D8B840');
        px(x + sz + 25, by - 8, 2, 8, '#E8D8C0');
        px(x + sz + 26, by - 10, 5, 4, '#F0E8D0');
        // ojos confiados
        px(x + 9, by + 8, 5, 5, '#fff');
        px(x + sz + 21, by + 8, 5, 5, '#fff');
        px(x + 11, by + 10, 3, 3, '#2A3818');
        px(x + sz + 23, by + 10, 3, 3, '#2A3818');
        px(x + 13, by + 16, 8, 3, '#2A4018');
      }
      break;

    case 'gorilegend': // Gorilegend: gigante legendario con pergaminos flotantes
      {
        const aura = Math.sin(f * 0.08) * 2;
        // cuerpo enorme tipo estatua: mucho más grande/ancho que etapas previas
        px(x - 2, by + 15, 36 + sz, 24 + sz, '#284818');
        px(x + 0, by + 17, 32 + sz, 20 + sz, '#386028');
        px(x + 7, by + 20, 18 + sz, 14, '#4A8030');
        px(x + 10, by + 22, 12 + sz, 8, '#609840');
        // hombreras/masa superior enorme
        px(x - 6, by + 13, 12, 20, '#284818');
        px(x + sz + 29, by + 13, 12, 20, '#284818');
        px(x - 4, by + 15, 8, 16, '#386028');
        px(x + sz + 31, by + 15, 8, 16, '#386028');
        // brazos largos de gorila apoyados al piso
        px(x - 10, by + 22, 10, 21, '#284818');
        px(x + sz + 37, by + 22, 10, 21, '#284818');
        px(x - 12, by + 40, 12, 5, '#203818');
        px(x + sz + 37, by + 40, 12, 5, '#203818');
        // piernas pesadas
        px(x + 4, by + 36 + sz, 8, 9, '#284818');
        px(x + sz + 23, by + 36 + sz, 8, 9, '#284818');
        px(x + 2, by + 44 + sz, 12, 3, '#203818');
        px(x + sz + 22, by + 44 + sz, 12, 3, '#203818');
        // pecho como libro dorado/legendario
        px(x + 6, by + 18, 22 + sz, 10, '#5A3818');
        px(x + 8, by + 20, 18 + sz, 6, '#6A4828');
        px(x + 13, by + 20, 2, 6, '#F8E830');
        px(x + 20, by + 21, 2, 5, '#F8E830');
        px(x + 25, by + 20, 2, 6, '#F8E830');
        // cabeza grande con corona de laureles
        px(x + 2, by - 1, 30 + sz, 18, '#284818');
        px(x + 4, by + 1, 26 + sz, 14, '#386028');
        px(x + 8, by + 4, 18 + sz, 9, '#5C9440');
        px(x + 3, by - 7, 28 + sz, 5, '#C8A830');
        px(x + 6, by - 9, 22 + sz, 3, '#D8B840');
        px(x + 11, by - 11, 12 + sz, 3, '#E8C840');
        px(x + 4, by - 5, 3, 3, '#48A030');
        px(x + sz + 29, by - 5, 3, 3, '#48A030');
        // ojos dorados sabios
        px(x + 6, by + 5, 7, 6, '#fff');
        px(x + sz + 23, by + 5, 7, 6, '#fff');
        px(x + 8, by + 7, 4, 4, '#1A3010');
        px(x + sz + 25, by + 7, 4, 4, '#1A3010');
        px(x + 8, by + 7, 2, 2, '#C8A830');
        px(x + sz + 25, by + 7, 2, 2, '#C8A830');
        px(x + 12, by + 13, 10, 4, '#1A3010');
        px(x + 14, by + 15, 6, 2, '#284818');
        // pergaminos flotantes a los lados
        cx.globalAlpha = 0.85;
        px(x - 18, by + 17 + aura, 10, 13, '#F0E0C0');
        px(x - 17, by + 18 + aura, 8, 2, '#B09070');
        px(x - 17, by + 23 + aura, 8, 2, '#B09070');
        px(x + sz + 46, by + 13 - aura, 10, 15, '#F0E0C0');
        px(x + sz + 47, by + 15 - aura, 8, 2, '#B09070');
        px(x + sz + 47, by + 21 - aura, 8, 2, '#B09070');
        cx.globalAlpha = 1;
        // aura pixelada sutil
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#80F080';
        pixelGlow(x + 16, by + 20, 28 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'mantisdanza': // Mantis con tutú elaborado
      {
        const mdhv2 = Math.sin(fr * 0.1) * 2;
        px(x + 10, by + mdhv2 + 14, 12 + sz, 18 + sz, '#389030');
        px(x + 12, by + mdhv2 + 16, 8 + sz, 14 + sz, '#48A040');
        px(x + 2, by + mdhv2 + 20, 28 + sz, 6, '#F078A0');
        px(x + 4, by + mdhv2 + 22, 24 + sz, 4, '#F898C0');
        px(x + 6, by + mdhv2 + 18, 6, 4, '#E868A0');
        px(x + sz + 20, by + mdhv2 + 18, 6, 4, '#E868A0');
        px(x + 8, by + mdhv2 + 24, 16 + sz, 2, '#F8B8D0');
        px(x + 2, by + mdhv2 + 20, 3, 3, '#F8E830');
        px(x + sz + 27, by + mdhv2 + 20, 3, 3, '#88B8F0');
        const oaf2 = Math.sin(f * 0.1) * 3;
        px(x, by + mdhv2 + 10 + oaf2, 10, 2, '#389030');
        px(x - 2, by + mdhv2 + 8 + oaf2, 4, 3, '#48A040');
        px(x + sz + 22, by + mdhv2 + 8 - oaf2, 10, 2, '#389030');
        px(x + sz + 30, by + mdhv2 + 6 - oaf2, 4, 3, '#48A040');
        px(x + 6, by + mdhv2 + 2, 20 + sz, 12, '#389030');
        px(x + 8, by + mdhv2 + 4, 16 + sz, 8, '#48A040');
        px(x + 8, by + mdhv2, 16 + sz, 3, '#F088A8');
        px(x + 12, by + mdhv2 - 1, 2, 2, '#F8E830');
        px(x + sz + 18, by + mdhv2 - 1, 2, 2, '#88B8F0');
        px(x + 8, by + mdhv2 + 4, 5, 5, '#D8F098');
        px(x + sz + 18, by + mdhv2 + 4, 5, 5, '#D8F098');
        px(x + 10, by + mdhv2 + 6, 3, 3, '#1A3010');
        px(x + sz + 20, by + mdhv2 + 6, 3, 3, '#1A3010');
        px(x + 12, by + mdhv2 + 30 + sz, 2, 8, '#389030');
        px(x + 18, by + mdhv2 + 30 + sz, 2, 8, '#389030');
        px(x + 10, by + mdhv2 + 36 + sz, 6, 2, '#F078A0');
        px(x + 16, by + mdhv2 + 36 + sz, 6, 2, '#F078A0');
      }
      break;

    case 'espinarcor': // Espinarcor: etapa intermedia, carnero punk juvenil con chaqueta
      {
        const step = Math.sin(f * 0.14) * 1;
        px(x + 5, by + 21 + step, 24 + sz, 14 + sz, '#305820');
        px(x + 7, by + 23 + step, 20 + sz, 10 + sz, '#406028');
        px(x + 10, by + 25 + step, 14 + sz, 6, '#508038');
        px(x + 5, by + 19 + step, 24 + sz, 7, '#111820');
        px(x + 8, by + 20 + step, 18 + sz, 4, '#253030');
        px(x + 8, by + 20 + step, 2, 2, '#C8A830');
        px(x + 15, by + 20 + step, 2, 2, '#C8A830');
        px(x + sz + 23, by + 20 + step, 2, 2, '#C8A830');
        px(x + 8, by + 7 + step, 22 + sz, 15, '#305820');
        px(x + 10, by + 9 + step, 18 + sz, 11, '#406028');
        px(x + 13, by + 12 + step, 12 + sz, 6, '#5C8840');
        px(x + 3, by + 4 + step, 8, 6, '#2A4818');
        px(x, by + 3 + step, 5, 3, '#D8B840');
        px(x + sz + 28, by + 4 + step, 8, 6, '#2A4818');
        px(x + sz + 34, by + 3 + step, 5, 3, '#D8B840');
        px(x + 11, by + 4 + step, 16 + sz, 4, '#38A020');
        px(x + 14, by + 1 + step, 10 + sz, 4, '#48C030');
        px(x + 18, by - 2 + step, 4 + sz, 3, '#A8D860');
        px(x + 7, by + 33 + sz + step, 6, 7, '#305820');
        px(x + 18, by + 34 + sz - step, 6, 6, '#305820');
        px(x + sz + 25, by + 33 + sz + step, 6, 7, '#305820');
        px(x + 5, by + 39 + sz + step, 8, 2, '#2A2018');
        px(x + sz + 25, by + 39 + sz + step, 8, 2, '#2A2018');
        px(x + 12, by + 13 + step, 5, 4, '#fff');
        px(x + sz + 22, by + 13 + step, 5, 4, '#fff');
        px(x + 14, by + 14 + step, 3, 2, '#203010');
        px(x + sz + 24, by + 14 + step, 3, 2, '#203010');
        px(x + 15, by + 19 + step, 7, 1, '#203010');
        px(x + 3, by + 24 + step, 3, 4, '#A8D860');
        px(x + sz + 31, by + 24 + step, 3, 4, '#A8D860');
      }
      break;

    case 'espinardoom': // Espinardoom: bestia heavy metal, enorme y frontal
      {
        const pulse = Math.sin(f * 0.12) * 2;
        px(x - 3, by + 18, 38 + sz, 22 + sz, '#223018');
        px(x + 0, by + 20, 32 + sz, 18 + sz, '#385028');
        px(x + 4, by + 22, 24 + sz, 12, '#486838');
        px(x + 3, by + 17, 28 + sz, 12, '#050510');
        px(x + 6, by + 19, 22 + sz, 8, '#151520');
        px(x + 11, by + 20, 10 + sz, 5, '#E8E8E8');
        px(x + 13, by + 21, 2, 2, '#181818');
        px(x + 18, by + 21, 2, 2, '#181818');
        px(x - 10, by + 17, 10, 16, '#1A2818');
        px(x + sz + 35, by + 17, 10, 16, '#1A2818');
        px(x - 12, by + 14, 6, 6, '#A8A8A8');
        px(x + sz + 43, by + 14, 6, 6, '#A8A8A8');
        px(x - 13, by + 14, 3, 3, '#E8E8E8');
        px(x + sz + 47, by + 14, 3, 3, '#E8E8E8');
        px(x + 0, by + 0, 32 + sz, 18, '#223018');
        px(x + 2, by + 2, 28 + sz, 14, '#385028');
        px(x + 6, by + 5, 20 + sz, 9, '#486838');
        px(x - 8, by - 6, 12, 11, '#223018');
        px(x - 12, by - 9, 8, 7, '#486828');
        px(x - 14, by - 10, 4, 4, '#A8A8A8');
        px(x + sz + 31, by - 6, 12, 11, '#223018');
        px(x + sz + 39, by - 9, 8, 7, '#486828');
        px(x + sz + 45, by - 10, 4, 4, '#A8A8A8');
        px(x + 8, by - 8 + pulse, 18 + sz, 8, '#38A020');
        px(x + 11, by - 11 + pulse, 12 + sz, 6, '#48C030');
        px(x + 14, by - 14 + pulse, 6 + sz, 5, '#A8D860');
        px(x + 6, by + 6, 7, 6, '#fff');
        px(x + sz + 22, by + 6, 7, 6, '#fff');
        px(x + 8, by + 8, 4, 3, '#111810');
        px(x + sz + 24, by + 8, 4, 3, '#111810');
        px(x + 7, by + 5, 7, 1, '#050510');
        px(x + sz + 22, by + 5, 7, 1, '#050510');
        px(x + 11, by + 14, 11, 3, '#111810');
        px(x + 14, by + 15, 2, 1, '#E8E8E8');
        px(x + 19, by + 15, 2, 1, '#E8E8E8');
        // ramas en las manos como baquetas de batería
        px(x - 16, by + 20 + pulse, 16, 2, '#6A4828');
        px(x - 18, by + 18 + pulse, 4, 3, '#8A5A28');
        px(x + sz + 35, by + 20 - pulse, 16, 2, '#6A4828');
        px(x + sz + 49, by + 18 - pulse, 4, 3, '#8A5A28');
        px(x - 3, by + 18, 5, 5, '#223018');
        px(x + sz + 33, by + 18, 5, 5, '#223018');
        px(x + 4, by + 38 + sz, 8, 8, '#223018');
        px(x + sz + 24, by + 38 + sz, 8, 8, '#223018');
        px(x + 2, by + 45 + sz, 11, 3, '#151510');
        px(x + sz + 23, by + 45 + sz, 11, 3, '#151510');
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + 20, 26 + sz, 20);
        cx.globalAlpha = 1;
      }
      break;

    case 'wyvernax': // Wyvernax: adolescente imponente, morado con armadura negra y venas verdes
      {
        const flap = Math.sin(f * 0.16) * 4;
        // cuerpo robusto en pose de ataque, morado aún presente
        px(x + 0, by + 20, 34 + sz, 15 + sz, '#2C126E');
        px(x + 3, by + 22, 28 + sz, 11 + sz, '#4828B0');
        px(x + 8, by + 24, 18 + sz, 6, '#6840C0');
        // placas negras parciales
        px(x + 4, by + 19, 10, 5, '#08080C');
        px(x + 20, by + 28, 10, 5, '#08080C');
        px(x + 13, by + 22, 8, 3, '#141018');
        // cola látigo con espina verde
        px(x - 12, by + 25, 16, 5, '#1C1028');
        px(x - 18, by + 22, 8, 4, '#08080C');
        px(x - 21, by + 20, 4, 4, '#1ED060');
        // alas más grandes, negras en bordes y moradas en interior
        px(x - 18, by + 5 + flap, 24, 10, '#08080C');
        px(x - 24, by + 15 + flap, 30, 9, '#141018');
        px(x - 18, by + 22 + flap, 22, 7, '#2A1668');
        px(x + 2, by + 10 + flap, 7, 17, '#4828B0');
        px(x + sz + 30, by + 5 - flap, 24, 10, '#08080C');
        px(x + sz + 30, by + 15 - flap, 30, 9, '#141018');
        px(x + sz + 32, by + 22 - flap, 22, 7, '#2A1668');
        px(x + sz + 29, by + 10 - flap, 7, 17, '#4828B0');
        // venas verdes de poder
        px(x - 12, by + 16 + flap, 16, 2, '#1ED060');
        px(x + sz + 36, by + 16 - flap, 16, 2, '#1ED060');
        px(x - 8, by + 24 + flap, 10, 2, '#2AF078');
        px(x + sz + 38, by + 24 - flap, 10, 2, '#2AF078');
        // cuello y cabeza agresiva
        px(x + 22, by + 9, 8 + sz, 15, '#2C126E');
        px(x + 25, by + 6, 16 + sz, 13, '#4828B0');
        px(x + 28, by + 8, 12 + sz, 9, '#6840C0');
        px(x + 31, by + 11, 8, 4, '#141018');
        // cuernos afilados negros con verde
        px(x + 24, by - 1, 5, 8, '#08080C');
        px(x + sz + 39, by - 1, 5, 8, '#08080C');
        px(x + 23, by - 4, 3, 4, '#1ED060');
        px(x + sz + 43, by - 4, 3, 4, '#1ED060');
        // ojos amenazantes
        px(x + 30, by + 10, 6, 5, '#74FF80');
        px(x + sz + 39, by + 10, 6, 5, '#74FF80');
        px(x + 32, by + 12, 4, 2, '#001008');
        px(x + sz + 41, by + 12, 4, 2, '#001008');
        px(x + 31, by + 18, 9, 2, '#2AF078');
        // patas y garras
        px(x + 6, by + 32 + sz, 8, 8, '#2C126E');
        px(x + sz + 25, by + 32 + sz, 8, 8, '#2C126E');
        px(x + 3, by + 39 + sz, 6, 3, '#1ED060');
        px(x + sz + 31, by + 39 + sz, 6, 3, '#1ED060');
      }
      break;

    case 'wyvernlord': // Wyvernlord: dragón negro imponente, pecho morado y energía verde
      {
        const flap = Math.sin(f * 0.12) * 4;
        // alas colosales negras, silueta de jefe
        px(x - 34, by + 0 + flap, 42, 12, '#050508');
        px(x - 42, by + 12 + flap, 50, 12, '#0A0810');
        px(x - 38, by + 24 + flap, 42, 10, '#141018');
        px(x - 28, by + 33 + flap, 28, 7, '#201828');
        px(x + sz + 30, by + 0 - flap, 42, 12, '#050508');
        px(x + sz + 30, by + 12 - flap, 50, 12, '#0A0810');
        px(x + sz + 36, by + 24 - flap, 42, 10, '#141018');
        px(x + sz + 42, by + 33 - flap, 28, 7, '#201828');
        // venas verdes como grietas de energía
        px(x - 26, by + 12 + flap, 24, 2, '#1ED060');
        px(x - 21, by + 26 + flap, 18, 2, '#2AF078');
        px(x + sz + 45, by + 12 - flap, 24, 2, '#1ED060');
        px(x + sz + 45, by + 26 - flap, 18, 2, '#2AF078');
        px(x - 6, by + 6 + flap, 4, 23, '#1ED060');
        px(x + sz + 40, by + 6 - flap, 4, 23, '#1ED060');
        // cuerpo negro pesado
        px(x + 2, by + 18, 32 + sz, 21 + sz, '#050508');
        px(x + 5, by + 21, 26 + sz, 16 + sz, '#0A0810');
        // pecho morado conservado y visible
        px(x + 10, by + 23, 16 + sz, 11, '#4828B0');
        px(x + 13, by + 25, 10 + sz, 7, '#6840C0');
        px(x + 16, by + 27, 5, 3, '#1ED060');
        // cuello y cabeza de dragón imponente
        px(x + 13, by + 6, 9 + sz, 16, '#050508');
        px(x + 16, by + 4, 4 + sz, 17, '#201828');
        px(x + 4, by - 4, 28 + sz, 16, '#050508');
        px(x + 7, by - 1, 22 + sz, 11, '#141018');
        px(x + 10, by + 2, 16 + sz, 7, '#302040');
        // cuernos/corona enormes
        px(x + 0, by - 12, 8, 11, '#050508');
        px(x + sz + 30, by - 12, 8, 11, '#050508');
        px(x + 6, by - 17, 22 + sz, 5, '#101010');
        px(x + 12, by - 21, 10 + sz, 4, '#1ED060');
        px(x + 2, by - 15, 4, 4, '#2AF078');
        px(x + sz + 32, by - 15, 4, 4, '#2AF078');
        // ojos verdes, mandíbula y colmillos
        px(x + 8, by + 3, 7, 6, '#74FF80');
        px(x + sz + 24, by + 3, 7, 6, '#74FF80');
        px(x + 10, by + 5, 5, 3, '#001008');
        px(x + sz + 26, by + 5, 5, 3, '#001008');
        px(x + 12, by + 11, 11, 3, '#050508');
        px(x + 14, by + 14, 2, 3, '#F8F8F8');
        px(x + 21, by + 14, 2, 3, '#F8F8F8');
        px(x + 16, by + 13, 5, 2, '#2AF078');
        // garras negras con uñas verdes
        px(x + 4, by + 37 + sz, 9, 9, '#0A0810');
        px(x + sz + 26, by + 37 + sz, 9, 9, '#0A0810');
        px(x + 0, by + 44 + sz, 8, 3, '#1ED060');
        px(x + sz + 33, by + 44 + sz, 8, 3, '#1ED060');
        // aura verde ominosa
        cx.globalAlpha = 0.1;
        cx.fillStyle = '#1ED060';
        pixelGlow(x + 16, by + 18, 48 + sz, 28);
        cx.globalAlpha = 1;
      }
      break;

    case 'longwok': // Lóngwok: dragón chef serpentino enrollado en un wok gigante
      {
        const steam = Math.sin(f * 0.12) * 2;
        // Wok gigante como base/silueta principal
        px(x - 2, by + 24, 38 + sz, 12 + sz, '#303038');
        px(x + 0, by + 26, 34 + sz, 8 + sz, '#484850');
        px(x + 4, by + 24, 26 + sz, 4, '#707078');
        px(x - 8, by + 27, 8, 3, '#202028');
        px(x + sz + 34, by + 27, 8, 3, '#202028');
        // fuego bajo el wok
        if (f % 16 < 8) {
          px(x + 8, by + 36 + sz, 5, 5, '#E84020');
          px(x + 15, by + 38 + sz, 6, 5, '#F8A030');
          px(x + 24, by + 36 + sz, 5, 5, '#E84020');
        }
        // cuerpo serpentino saliendo/enrollado alrededor del wok
        px(x + 5, by + 20, 25 + sz, 5, '#B02828');
        px(x + 1, by + 17, 22 + sz, 5, '#C83838');
        px(x + 10, by + 14, 23 + sz, 5, '#B02828');
        px(x + 18, by + 11, 15 + sz, 5, '#D84848');
        // panza blanca de dragón oriental
        px(x + 9, by + 21, 16 + sz, 2, '#F8F8F8');
        px(x + 7, by + 18, 13 + sz, 2, '#F0F0F0');
        px(x + 15, by + 15, 12 + sz, 2, '#F8F8F8');
        // cabeza chef sobre el wok
        px(x + 6, by + 2, 22 + sz, 14, '#B02828');
        px(x + 8, by + 4, 18 + sz, 10, '#C83838');
        px(x + 10, by + 6, 14 + sz, 6, '#D84848');
        // gorro chef más grande
        px(x + 6, by - 6, 22 + sz, 7, '#F8F8F8');
        px(x + 9, by - 10, 16 + sz, 6, '#FFFFFF');
        px(x + 12, by - 13, 10 + sz, 4, '#F0F0F0');
        // bigotes/fideos largos
        px(x - 4, by + 11, 12, 2, '#F8F8F8');
        px(x + sz + 25, by + 11, 12, 2, '#F8F8F8');
        px(x - 8, by + 14, 10, 1, '#E8E8E8');
        px(x + sz + 33, by + 14, 10, 1, '#E8E8E8');
        // ojos y cejas de maestro cocinero
        px(x + 10, by + 7, 5, 5, '#fff');
        px(x + sz + 20, by + 7, 5, 5, '#fff');
        px(x + 12, by + 9, 3, 3, '#881818');
        px(x + sz + 22, by + 9, 3, 3, '#881818');
        px(x + 10, by + 6, 5, 1, '#881818');
        px(x + sz + 20, by + 6, 5, 1, '#881818');
        // cucharón y verduras al vuelo
        px(x + sz + 31, by + 10, 2, 18, '#5A4020');
        px(x + sz + 29, by + 8, 6, 4, '#C8C8C8');
        px(x + 16, by + 20 + steam, 3, 3, '#48A030');
        px(x + 23, by + 18 - steam, 3, 3, '#E8C830');
        px(x + 12, by + 17 + steam, 3, 3, '#F0E0C0');
        // vapor cuadrado
        cx.globalAlpha = 0.35;
        px(x + 8, by - 1 + steam, 3, 3, '#E8E8E8');
        px(x + 28, by + 1 - steam, 3, 3, '#F8F8F8');
        px(x + 20, by - 4 + steam, 2, 2, '#F0F0F0');
        cx.globalAlpha = 1;
      }
      break;

    case 'ornishadow': // Ornitorrinco con gadgets
      px(x + 4, by + 18, 24 + sz, 14 + sz, '#308088');
      px(x + 6, by + 20, 20 + sz, 10 + sz, '#409098');
      px(x + 4, by + 16, 24 + sz, 16, '#2A2A3A');
      px(x + 6, by + 18, 20 + sz, 12, '#3A3A4A');
      px(x + 6, by + 28, 20 + sz, 2, '#383838');
      px(x + 8, by + 27, 3, 3, '#C8A830');
      px(x + 14, by + 27, 3, 3, '#C8A830');
      px(x + 20, by + 27, 3, 3, '#C8A830');
      px(x + 4, by + 4, 24 + sz, 14, '#308088');
      px(x + 6, by + 6, 20 + sz, 10, '#409098');
      px(x + 8, by + 8, 16 + sz, 4, '#C03030');
      px(x + 10, by + 9, 12 + sz, 2, '#E05050');
      px(x + 4, by + 0, 24 + sz, 6, '#2A2A3A');
      px(x + 8, by - 2, 16 + sz, 4, '#3A3A4A');
      px(x + 16, by - 3, 4, 2, '#30E030');
      px(x + 10, by + 14, 12 + sz, 4, '#D89020');
      px(x, by + 18, 4, 8, '#2A2A3A');
      px(x + sz + 28, by + 18, 4, 8, '#2A2A3A');
      px(x + 1, by + 20, 2, 2, '#30E030');
      px(x + sz + 29, by + 20, 2, 2, '#E03030');
      px(x + 8, by + 30 + sz, 5, 4, '#D89020');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#D89020');
      break;

    case 'ornisagent': // Ornitorrinco agente elite
      px(x + 2, by + 16, 28 + sz, 16 + sz, '#205868');
      px(x + 4, by + 18, 24 + sz, 12 + sz, '#306878');
      px(x + 4, by + 14, 24 + sz, 18, '#1A1A2A');
      px(x + 6, by + 16, 20 + sz, 14, '#2A2A3A');
      px(x + 12, by + 18, 8 + sz, 8, '#F0F0F0');
      px(x + 15, by + 18, 2, 8, '#C03030');
      px(x + 4, by + 2, 24 + sz, 14, '#205868');
      px(x + 6, by + 4, 20 + sz, 10, '#306878');
      px(x + 8, by + 6, 6, 5, '#0A0A1A');
      px(x + sz + 18, by + 6, 6, 5, '#0A0A1A');
      px(x + 9, by + 7, 4, 3, '#303040');
      px(x + sz + 19, by + 7, 4, 3, '#303040');
      px(x + 14, by + 8, sz + 4, 1, '#0A0A1A');
      px(x + 2, by + 0, 28 + sz, 4, '#0A0A1A');
      px(x + 6, by - 3, 20 + sz, 5, '#1A1A2A');
      px(x + 8, by - 1, 16 + sz, 1, '#C8A830');
      px(x + 10, by + 12, 12 + sz, 4, '#D89020');
      px(x + sz + 28, by + 20, 6, 3, '#484858');
      px(x + sz + 32, by + 18, 2, 6, '#585868');
      px(x + 8, by + 30 + sz, 5, 4, '#D89020');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#D89020');
      cx.globalAlpha = 0.04;
      cx.fillStyle = '#3060A0';
      pixelGlow(x + 16, by + 20, 18 + sz, 14);
      cx.globalAlpha = 1;
      break;

    case 'serpentboss': // Serpentboss: cobra mafiosa con capucha y puro
      {
        const sway = Math.sin(f * 0.1) * 2;
        // cuerpo serpentino enrollado como base
        px(x + 6, by + 31, 24 + sz, 5, '#1A1A48');
        px(x + 2, by + 35, 24 + sz, 5, '#282858');
        px(x + 10, by + 39, 20 + sz, 4, '#1A1A48');
        px(x + 22, by + 42, 12 + sz, 3, '#101030');
        // torso erguido de cobra
        px(x + 14, by + 14 + sway, 7 + sz, 20, '#1A1A48');
        px(x + 16, by + 14 + sway, 3 + sz, 20, '#383878');
        px(x + 17, by + 18 + sway, 2 + sz, 14, '#C83030'); // panza/corbata roja
        // capucha de cobra amplia
        px(x + 4, by + 4 + sway, 30 + sz, 18, '#101030');
        px(x + 6, by + 6 + sway, 26 + sz, 14, '#1A1A48');
        px(x + 9, by + 8 + sway, 20 + sz, 10, '#282858');
        px(x + 6, by + 12 + sway, 6, 10, '#383878');
        px(x + sz + 27, by + 12 + sway, 6, 10, '#383878');
        // marcas de cobra
        px(x + 7, by + 10 + sway, 4, 4, '#C8A830');
        px(x + sz + 29, by + 10 + sway, 4, 4, '#C8A830');
        px(x + 8, by + 11 + sway, 2, 2, '#100838');
        px(x + sz + 30, by + 11 + sway, 2, 2, '#100838');
        // cabeza con sombrero de mafioso
        px(x + 9, by - 2 + sway, 20 + sz, 12, '#1A1A48');
        px(x + 11, by + 0 + sway, 16 + sz, 8, '#282858');
        px(x + 3, by - 7 + sway, 32 + sz, 6, '#0A0A1A');
        px(x + 7, by - 10 + sway, 24 + sz, 5, '#1A1A2A');
        px(x + 10, by - 11 + sway, 18 + sz, 3, '#282828');
        px(x + 11, by - 8 + sway, 14 + sz, 1, '#C83030');
        // ojos de cobra
        px(x + 11, by + 2 + sway, 5, 4, '#F0C020');
        px(x + sz + 22, by + 2 + sway, 5, 4, '#F0C020');
        px(x + 13, by + 3 + sway, 3, 2, '#100838');
        px(x + sz + 24, by + 3 + sway, 3, 2, '#100838');
        px(x + 12, by + 1 + sway, 5, 1, '#C07060');
        px(x + sz + 22, by + 1 + sway, 5, 1, '#C07060');
        // boca y colmillos/puro
        px(x + 14, by + 9 + sway, 9, 2, '#6A4020');
        px(x + 13, by + 10 + sway, 2, 3, '#F8F8F8');
        px(x + sz + 23, by + 10 + sway, 2, 3, '#F8F8F8');
        px(x + sz + 28, by + 8 + sway, 8, 2, '#6A4020');
        px(x + sz + 35, by + 7 + sway, 2, 2, '#E8A030');
        if (f % 16 < 8) {
          px(x + sz + 36, by + 5 + sway, 2, 3, '#C8C8C8');
          px(x + sz + 38, by + 3 + sway, 2, 2, '#E0E0E0');
        }
        // anillo dorado en la cola
        px(x - 2, by + 35, 6, 3, '#C8A030');
        px(x - 4, by + 33, 4, 4, '#D8B040');
      }
      break;

    case 'crisalmanza': // Crisálmanza: dragón manzana intermedio dentro de cáscara espiral
      {
        const pulse = Math.sin(fr * 0.1) * 0.3 + 0.7;
        // silueta: capullo vertical de cáscara, con serpiente verde asomándose
        px(x + 8, by + 9, 18 + sz, 25 + sz, '#8A2018');
        px(x + 10, by + 11, 14 + sz, 21 + sz, '#A02818');
        px(x + 12, by + 13, 10 + sz, 17, '#B83020');
        // bandas de cáscara en espiral
        px(x + 7, by + 12, 18 + sz, 4, '#C83828');
        px(x + 11, by + 18, 17 + sz, 4, '#D04838');
        px(x + 6, by + 24, 20 + sz, 4, '#C83828');
        px(x + 10, by + 30, 16 + sz, 4, '#A02818');
        // grietas luminosas internas
        cx.globalAlpha = pulse;
        px(x + 14, by + 15, 2, 13, '#F8E830');
        px(x + 19, by + 12, 2, 9, '#F0D020');
        px(x + 11, by + 27, 2, 6, '#F8E830');
        cx.globalAlpha = 1;
        // serpiente verde/cabeza de dragón asomando arriba
        px(x + 12, by + 2, 12 + sz, 9, '#48A030');
        px(x + 14, by + 4, 8 + sz, 5, '#68C050');
        px(x + 10, by + 6, 5, 3, '#2F7A30');
        px(x + sz + 22, by + 6, 5, 3, '#2F7A30');
        px(x + 14, by + 5, 3, 3, '#F8C030');
        px(x + sz + 19, by + 5, 3, 3, '#F8C030');
        px(x + 15, by + 6, 1, 1, '#801010');
        px(x + sz + 20, by + 6, 1, 1, '#801010');
        // hojitas/cuernos
        px(x + 11, by - 1, 5, 4, '#58B838');
        px(x + sz + 20, by - 1, 5, 4, '#58B838');
        // base raicillas / patitas incompletas
        px(x + 8, by + 33 + sz, 4, 6, '#5A3818');
        px(x + sz + 21, by + 33 + sz, 4, 6, '#5A3818');
        px(x + 13, by + 35 + sz, 8, 4, '#5A3818');
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + 21, 18 + sz, 18);
        cx.globalAlpha = 1;
      }
      break;

    case 'hydrapom': // Knightapple: serpiente verde alta con pechera de manzana y brazos-hoja delgados
      {
        const sway = Math.sin(f * 0.1) * 2;
        const leaf = Math.sin(f * 0.12) * 2;
        const G1 = '#4E9A1E', G2 = '#78C840', G3 = '#B8E880';
        const RED1 = '#B82020', RED2 = '#D83030', RED3 = '#F05040';
        const CREAM = '#F0E6C8';

        // Cuerpo serpentino más alto y visible, con base enrollada.
        px(x + 13, by + 32, 24 + sz, 6, G1);
        px(x + 8, by + 36, 23 + sz, 6, G2);
        px(x + 2, by + 39, 22 + sz, 6, '#6FC838');
        px(x + sz + 29, by + 36, 13, 7, '#E8E8D8');
        px(x + sz + 35, by + 32, 9, 7, G2);
        // Tramo vertical del cuerpo: más largo, delgado y protagonista.
        px(x + 16, by + 9, 7, 29, G1);
        px(x + 18, by + 8, 3, 30, G3);
        px(x + 13, by + 20, 4, 18, CREAM); // panza clara lateral
        px(x + 15, by + 13, 2, 7, '#6FC838');

        // Pechera de manzana más pequeña para dejar ver el cuerpo delgado.
        px(x + 12, by + 20, 17 + sz, 12 + sz, RED1);
        px(x + 14, by + 19, 13 + sz, 12 + sz, RED2);
        px(x + 16, by + 21, 9 + sz, 8 + sz, RED3);
        px(x + 17, by + 20, 3, 2, '#FF8A78');
        px(x + 24, by + 23, 2, 2, '#FFB0A0');
        // semillas/ranuras más pequeñas.
        px(x + 17, by + 24, 2, 3, '#A85A38');
        px(x + 23, by + 24, 2, 3, '#A85A38');
        px(x + 16, by + 29, 2, 2, '#A85A38');
        px(x + 22, by + 29, 2, 2, '#A85A38');

        // Brazos-hoja delgados, ya no escudo ni espada.
        cx.globalAlpha = 0.98;
        // brazo-hoja izquierdo fino
        px(x + 3, by + 22 + leaf, 11, 3, G3);
        px(x - 2, by + 25 + leaf, 15, 3, G2);
        px(x - 5, by + 28 + leaf, 11, 3, '#94D860');
        px(x + 9, by + 23 + leaf, 3, 8, '#6FA840');
        // brazo-hoja derecho fino
        px(x + sz + 27, by + 21 - leaf, 14, 3, G3);
        px(x + sz + 28, by + 24 - leaf, 18, 3, G2);
        px(x + sz + 36, by + 27 - leaf, 10, 3, '#94D860');
        px(x + sz + 29, by + 23 - leaf, 3, 8, '#6FA840');
        cx.globalAlpha = 1;

        // Cabeza verde más pequeña arriba, con ojos saltones amarillos.
        px(x + 13, by + 0 + sway, 16 + sz, 10, G1);
        px(x + 15, by + 2 + sway, 12 + sz, 7, G2);
        px(x + 17, by + 4 + sway, 8 + sz, 4, G3);
        // Hocico/boca proyectada en forma de pico (sin ser pico).
        px(x + 10, by + 8 + sway, 10, 6, '#3F8418');
        px(x + 8, by + 10 + sway, 7, 4, '#5CA828');
        px(x + 6, by + 11 + sway, 4, 2, '#4E9A1E');
        px(x + 9, by + 14 + sway, 8, 2, '#1F5018');
        px(x + 10, by + 15 + sway, 4, 1, '#D8F0A0');
        // Ojos saltones amarillos con pupila negra.
        px(x + 13, by - 4 + sway, 6, 6, '#E8D840');
        px(x + sz + 22, by - 4 + sway, 6, 6, '#E8D840');
        px(x + 15, by - 2 + sway, 3, 3, '#1A2010');
        px(x + sz + 24, by - 2 + sway, 3, 3, '#1A2010');
        px(x + 16, by - 2 + sway, 1, 1, '#F8F8C0');
        px(x + sz + 25, by - 2 + sway, 1, 1, '#F8F8C0');
        // Cresta/hojas de la cabeza, compacta.
        px(x + 18, by - 8 + sway, 5, 5, G2);
        px(x + 24, by - 10 + sway, 8, 4, G3);
        px(x + 30, by - 11 + sway, 5, 3, G3);

        // Unión bajo la pechera.
        px(x + 16, by + 31 + sz, 8, 3, '#5A3818');
        px(x + 18, by + 31 + sz, 3, 3, '#C8A830');
        // Aura vegetal mínima.
        cx.globalAlpha = 0.05;
        cx.fillStyle = '#B8E880';
        pixelGlow(x + 20, by + 22, 24 + sz, 18);
        cx.globalAlpha = 1;
      }
      break;

    case 'duendetron': // Duendetrón: saco gigante con duende casi aplastado
      {
        const dthv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F080F0';
        pixelGlow(x + 16, by + dthv2 + 25, 18 + sz, 16);
        cx.globalAlpha = 1;
        // saco enorme domina la silueta
        px(x - 8, by + dthv2 + 10, 24, 28, '#8A6820');
        px(x - 6, by + dthv2 + 12, 20, 24, '#A88030');
        px(x - 2, by + dthv2 + 9, 10, 5, '#E8E8E8');
        px(x + 2, by + dthv2 + 8, 3, 4, '#D83030');
        px(x + 6, by + dthv2 + 10, 2, 3, '#3030D8');
        px(x - 1, by + dthv2 + 14, 2, 3, '#30D830');
        // duende pequeño cargando al lado
        px(x + 16, by + dthv2 + 22, 14 + sz, 10 + sz, '#38A048');
        px(x + 18, by + dthv2 + 24, 10 + sz, 6 + sz, '#48B058');
        px(x + 15, by + dthv2 + 9, 16 + sz, 13, '#F8D0C0');
        px(x + 17, by + dthv2 + 11, 12 + sz, 9, '#F8E0D0');
        px(x + 14, by + dthv2 + 4, 18 + sz, 7, '#1A1A1A');
        px(x + 20, by + dthv2 - 2, 10, 6, '#101010');
        // cara cansada
        px(x + 17, by + dthv2 + 12, 3, 2, '#F8E830');
        px(x + sz + 25, by + dthv2 + 12, 3, 2, '#F8E830');
        px(x + 20, by + dthv2 + 18, 8, 2, '#C08868');
        px(x + 19, by + dthv2 + 30 + sz, 4, 3, '#F8D0C0');
        px(x + sz + 27, by + dthv2 + 30 + sz, 4, 3, '#F8D0C0');
      }
      break;

    case 'sidhearia': // Hada diva prima donna
      {
        const sahv2 = Math.sin(fr * 0.1) * 3;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#A0E0A0';
      pixelGlow(x + 16, by + sahv2 + 22, 20 + sz, 16);
        cx.globalAlpha = 1;
        px(x + 2, by + sahv2 + 16, 28 + sz, 18 + sz, '#C02888');
        px(x + 4, by + sahv2 + 18, 24 + sz, 14 + sz, '#D03898');
        px(x + 6, by + sahv2 + 20, 20 + sz, 10, '#E050A8');
        px(x, by + sahv2 + 28, 32 + sz, 6, '#C02888');
        px(x + 2, by + sahv2 + 30, 28 + sz, 4, '#D03898');
        px(x + 10, by + sahv2 + 22, 2, 2, '#F8E830');
        px(x + 20, by + sahv2 + 24, 2, 2, '#F8E830');
        cx.globalAlpha = 0.5;
        px(x - 8, by + sahv2 + 6, 14, 18, '#C8F8C8');
        px(x + sz + 26, by + sahv2 + 6, 14, 18, '#C8F8C8');
        px(x - 6, by + sahv2 + 8, 10, 14, '#D8F8D8');
        px(x + sz + 28, by + sahv2 + 8, 10, 14, '#D8F8D8');
        cx.globalAlpha = 1;
        px(x + 6, by + sahv2 + 2, 20 + sz, 14, '#F8D8E8');
        px(x + 8, by + sahv2 + 4, 16 + sz, 10, '#F8E8F0');
        px(x + 8, by + sahv2 - 2, 16 + sz, 4, '#E8C830');
        px(x + 12, by + sahv2 - 4, 8 + sz, 4, '#E8C830');
        px(x + 10, by + sahv2 - 5, 3, 3, '#D03030');
        px(x + sz + 19, by + sahv2 - 5, 3, 3, '#3060D0');
        px(x + 15, by + sahv2 - 6, 2, 3, '#F8E830');
        px(x + 8, by + sahv2 + 6, 6, 5, '#fff');
        px(x + sz + 18, by + sahv2 + 6, 6, 5, '#fff');
        px(x + 10, by + sahv2 + 8, 4, 3, '#300860');
        px(x + sz + 20, by + sahv2 + 8, 4, 3, '#300860');
        px(x + 10, by + sahv2 + 8, 2, 1, '#fff');
        px(x + sz + 20, by + sahv2 + 8, 2, 1, '#fff');
        px(x + 14, by + sahv2 + 14, 4, 4, '#C05890');
        px(x + 15, by + sahv2 + 15, 2, 2, '#F8D0E0');
        if (f % 30 < 15) {
          cx.fillStyle = '#E8C830';
          cx.font = '10px "Press Start 2P"';
          cx.fillText('♪', x + sz + 26, by + sahv2 + 2 + Math.sin(f * 0.1) * 4);
          cx.fillText('♫', x - 4, by + sahv2 + 6 + Math.sin(f * 0.12) * 3);
        }
      }
      break;

    case 'lucilente': // Luciérnaga con cámara pro
      {
        const llhv2 = Math.sin(fr * 0.12) * 3;
        cx.globalAlpha = 0.4;
        px(x - 4, by + llhv2 + 8, 10, 10, '#C8F0F8');
        px(x + sz + 26, by + llhv2 + 8, 10, 10, '#C8F0F8');
        px(x - 2, by + llhv2 + 14, 8, 8, '#C8F0F8');
        px(x + sz + 24, by + llhv2 + 14, 8, 8, '#C8F0F8');
        cx.globalAlpha = 1;
        px(x + 8, by + llhv2 + 18, 16 + sz, 12 + sz, '#D8B020');
        px(x + 10, by + llhv2 + 20, 12 + sz, 8 + sz, '#E8C030');
        px(x + 10, by + llhv2 + 26 + sz, 12 + sz, 4, '#F8E870');
        if (f % 6 < 3) {
          px(x + 12, by + llhv2 + 28 + sz, 8 + sz, 3, '#F8F8C0');
        }
        px(x + 8, by + llhv2 + 6, 16 + sz, 14, '#D8B020');
        px(x + 10, by + llhv2 + 8, 12 + sz, 10, '#E8C030');
        px(x + 8, by + llhv2 + 8, 6, 6, '#fff');
        px(x + sz + 18, by + llhv2 + 8, 6, 6, '#fff');
        px(x + 10, by + llhv2 + 10, 4, 4, '#382858');
        px(x + sz + 20, by + llhv2 + 10, 4, 4, '#382858');
        px(x + 10, by + llhv2 + 10, 2, 2, '#fff');
        px(x + sz + 20, by + llhv2 + 10, 2, 2, '#fff');
        px(x + sz + 22, by + llhv2 + 12, 8, 7, '#282828');
        px(x + sz + 24, by + llhv2 + 14, 4, 3, '#383838');
        px(x + sz + 29, by + llhv2 + 12, 3, 4, '#484848');
        px(x + sz + 30, by + llhv2 + 13, 2, 2, '#6888A8');
        px(x + sz + 23, by + llhv2 + 11, 2, 2, '#E83030');
        px(x + 12, by + llhv2 + 4, 2, 4, '#C8A020');
        px(x + sz + 18, by + llhv2 + 4, 2, 4, '#C8A020');
        px(x + 11, by + llhv2 + 2, 2, 2, '#F8E830');
        px(x + sz + 19, by + llhv2 + 2, 2, 2, '#F8E830');
        px(x + 10, by + llhv2 + 28 + sz, 4, 3, '#C8A020');
        px(x + sz + 18, by + llhv2 + 28 + sz, 4, 3, '#C8A020');
      }
      break;

    case 'lucistrella': // Luciérnaga estrella de cine
      {
        const lshv2 = Math.sin(fr * 0.1) * 2;
        cx.globalAlpha = 0.1 + Math.sin(fr * 0.06) * 0.05;
        cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, by + lshv2 + 20, 20 + sz, 16);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.5;
        px(x - 6, by + lshv2 + 6, 14, 14, '#D0F0F8');
        px(x + sz + 24, by + lshv2 + 6, 14, 14, '#D0F0F8');
        px(x - 4, by + lshv2 + 8, 10, 10, '#E0F8F8');
        px(x + sz + 26, by + lshv2 + 8, 10, 10, '#E0F8F8');
        cx.globalAlpha = 1;
        px(x + 6, by + lshv2 + 16, 20 + sz, 14 + sz, '#C8A018');
        px(x + 8, by + lshv2 + 18, 16 + sz, 10 + sz, '#D8B028');
        px(x + 8, by + lshv2 + 28 + sz, 16 + sz, 4, '#F8E860');
        px(x + 10, by + lshv2 + 30 + sz, 12 + sz, 3, '#F8F8A0');
        px(x + 6, by + lshv2 + 4, 20 + sz, 14, '#C8A018');
        px(x + 8, by + lshv2 + 6, 16 + sz, 10, '#D8B028');
        px(x + 6, by + lshv2 + 0, 20 + sz, 6, '#282828');
        px(x + 8, by + lshv2 - 1, 16 + sz, 4, '#383838');
        px(x + 6, by + lshv2 + 8, 8, 4, '#C8A830');
        px(x + sz + 18, by + lshv2 + 8, 8, 4, '#C8A830');
        px(x + 8, by + lshv2 + 9, 4, 2, '#282828');
        px(x + sz + 20, by + lshv2 + 9, 4, 2, '#282828');
        px(x + sz + 24, by + lshv2 + 14, 8, 4, '#D8D8D8');
        px(x + sz + 30, by + lshv2 + 12, 4, 8, '#E8E8E8');
        cx.fillStyle = '#F8E830';
        cx.font = '8px "Press Start 2P"';
        cx.fillText('★', x - 4, by + lshv2 + 6);
        px(x + 10, by + lshv2 + 30 + sz, 4, 3, '#C8A018');
        px(x + sz + 18, by + lshv2 + 30 + sz, 4, 3, '#C8A018');
      }
      break;

    case 'elefantastico': // Elefante hechicero con mandala
      {
        const ethv2 = Math.sin(fr * 0.08) * 2;
        cx.globalAlpha = 0.08;
        cx.fillStyle = '#C880F0';
      pixelGlow(x + 16, by + ethv2 + 20, 22 + sz, 18);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.15;
        cx.fillStyle = '#F8E830';
        pixelGlow(x + 16, by + ethv2 + 16, 18 + sz, 16);
        pixelGlow(x + 16, by + ethv2 + 16, 14 + sz, 12);
        cx.globalAlpha = 1;
        px(x + 2, by + ethv2 + 16, 28 + sz, 16 + sz, '#6850A0');
        px(x + 4, by + ethv2 + 18, 24 + sz, 12 + sz, '#7860B0');
        px(x + 6, by + ethv2 + 16, 20 + sz, 10, '#C8A830');
        px(x + 8, by + ethv2 + 18, 16 + sz, 6, '#D8B840');
        for (let i = 0; i < 3; i++) {
          const bangle2 = Math.sin(f * 0.1 + i * 2) * 2;
          px(x - 2 + i * 2, by + ethv2 + 12 + i * 4 + bangle2, 5, 3, '#6850A0');
          px(
            x + sz + 26 - i * 2,
            by + ethv2 + 12 + i * 4 - bangle2,
            5,
            3,
            '#6850A0'
          );
        }
        px(x - 4, by + ethv2 + 10, 3, 3, '#F8E830');
        px(x + sz + 32, by + ethv2 + 10, 3, 3, '#A050F0');
        px(x - 2, by + ethv2 + 18, 3, 3, '#30E030');
        px(x + sz + 30, by + ethv2 + 18, 3, 3, '#E05050');
        px(x + 2, by + ethv2, 28 + sz, 16, '#6850A0');
        px(x + 4, by + ethv2 + 2, 24 + sz, 12, '#7860B0');
        px(x - 4, by + ethv2 + 2, 8, 12, '#8878C0');
        px(x + sz + 28, by + ethv2 + 2, 8, 12, '#8878C0');
        px(x - 2, by + ethv2 + 4, 4, 8, '#9888D0');
        px(x + sz + 30, by + ethv2 + 4, 4, 8, '#9888D0');
        px(x + 14, by + ethv2 + 12, 4, 14, '#7860B0');
        px(x + 12, by + ethv2 + 24, 4, 3, '#8878C0');
        px(x + 10, by + ethv2 + 26, 4, 2, '#8878C0');
        if (f % 16 < 8) {
          px(x + 8, by + ethv2 + 26, 3, 3, '#F8E830');
          px(x + 6, by + ethv2 + 24, 2, 2, '#A050F0');
        }
        px(x + 6, by + ethv2 + 6, 6, 5, '#fff');
        px(x + sz + 20, by + ethv2 + 6, 6, 5, '#fff');
        px(x + 8, by + ethv2 + 8, 4, 3, '#301848');
        px(x + sz + 22, by + ethv2 + 8, 4, 3, '#301848');
        px(x + 12, by + ethv2 + 4, 8, 4, '#D03030');
        px(x + 14, by + ethv2 + 5, 4, 2, '#F8E830');
        px(x + 6, by + ethv2 - 4, 20 + sz, 5, '#C8A830');
        px(x + 10, by + ethv2 - 6, 12 + sz, 4, '#D8B840');
        px(x + 8, by + ethv2 - 7, 3, 4, '#C8A830');
        px(x + sz + 21, by + ethv2 - 7, 3, 4, '#C8A830');
        px(x + 14, by + ethv2 - 8, 4, 4, '#E8C840');
        px(x + 15, by + ethv2 - 7, 2, 2, '#D03030');
        px(x + 6, by + ethv2 + 30 + sz, 6, 6, '#6850A0');
        px(x + sz + 20, by + ethv2 + 30 + sz, 6, 6, '#6850A0');
      }
      break;

    case 'zumbaccino': // Colibrí con cafetería móvil
      {
        const zchv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.3;
        px(x - 6, by + zchv2 + 8, 12, 10, '#80C860');
        px(x + sz + 26, by + zchv2 + 8, 12, 10, '#80C860');
        cx.globalAlpha = 1;
        px(x + 8, by + zchv2 + 16, 16 + sz, 12 + sz, '#289040');
        px(x + 10, by + zchv2 + 18, 12 + sz, 8 + sz, '#38A050');
        px(x + 10, by + zchv2 + 18, 12 + sz, 4, '#D04078');
        px(x + 10, by + zchv2 + 22, 12 + sz, 6, '#E8D8C0');
        px(x + 14, by + zchv2 + 24, 4 + sz, 2, '#8A5020');
        px(x + 6, by + zchv2 + 6, 20 + sz, 12, '#289040');
        px(x + 8, by + zchv2 + 8, 16 + sz, 8, '#38A050');
        px(x + 6, by + zchv2 + 4, 20 + sz, 4, '#3A2818');
        px(x + 4, by + zchv2 + 6, 8, 3, '#3A2818');
        px(x + 14, by + zchv2 + 4, 4, 2, '#F0F0F0');
        px(x + 8, by + zchv2 + 8, 5, 5, '#fff');
        px(x + sz + 18, by + zchv2 + 8, 5, 5, '#fff');
        px(x + 10, by + zchv2 + 9, 3, 4, '#181818');
        px(x + sz + 20, by + zchv2 + 9, 3, 4, '#181818');
        px(x + sz + 22, by + zchv2 + 12, 10, 2, '#D89020');
        px(x + sz + 24, by + zchv2 + 16, 10, 10, '#6A4020');
        px(x + sz + 26, by + zchv2 + 18, 6, 6, '#7A5030');
        px(x + sz + 26, by + zchv2 + 16, 6, 2, '#F0F0F0');
        px(x + sz + 28, by + zchv2 + 14, 3, 3, '#8A5020');
        if (f % 12 < 6) {
          px(x + sz + 29, by + zchv2 + 12, 2, 2, '#E8E0D0');
        }
        px(x + sz + 24, by + zchv2 + 26, 3, 3, '#383838');
        px(x + sz + 31, by + zchv2 + 26, 3, 3, '#383838');
        px(x + 12, by + zchv2 + 26 + sz, 3, 3, '#D89020');
        px(x + 18, by + zchv2 + 26 + sz, 3, 3, '#D89020');
      }
      break;

    // ==========================================
    // FUEGO 🔥 - NUEVOS (únicos)
    // ==========================================

    case 'flameye': // Flameye: polluelo de pavo real de fuego, compacto y cabezón
      {
        const hop = Math.sin(f * 0.2) * 1;
        // cuerpo de polluelo: bolita pixelada baja
        px(x + 10, by + hop + 24, 14 + sz, 10 + sz, '#C83020');
        px(x + 12, by + hop + 26, 10 + sz, 6 + sz, '#E04830');
        px(x + 14, by + hop + 28, 6 + sz, 3, '#F07838');
        // alitas mini
        px(x + 6, by + hop + 25, 6, 4, '#A82018');
        px(x + sz + 23, by + hop + 25, 6, 4, '#A82018');
        px(x + 4, by + hop + 27, 4, 2, '#F8A030');
        px(x + sz + 27, by + hop + 27, 4, 2, '#F8A030');
        // cabeza grande, distinta del cuerpo
        px(x + 6, by + hop + 8, 22 + sz, 16, '#C83020');
        px(x + 8, by + hop + 10, 18 + sz, 12, '#E04830');
        px(x + 11, by + hop + 12, 12 + sz, 8, '#F06838');
        // cresta de fueguito, pequeña
        px(x + 13, by + hop + 3, 3, 6, '#E82020');
        px(x + 17, by + hop + 1, 3, 8, '#F83828');
        px(x + 21, by + hop + 4, 3, 5, '#E82020');
        px(x + 14, by + hop + 4, 2, 3, '#F8A030');
        px(x + 18, by + hop + 2, 2, 5, '#F8C040');
        // ojos vanidosos
        px(x + 10, by + hop + 13, 5, 5, '#fff');
        px(x + sz + 20, by + hop + 13, 5, 5, '#fff');
        px(x + 12, by + hop + 15, 3, 3, '#801010');
        px(x + sz + 22, by + hop + 15, 3, 3, '#801010');
        px(x + 11, by + hop + 13, 1, 1, '#1A1A1A');
        px(x + sz + 24, by + hop + 13, 1, 1, '#1A1A1A');
        px(x + 15, by + hop + 20, 5, 2, '#F0C030');
        // patitas cortas
        px(x + 12, by + hop + 33 + sz, 4, 4, '#C89020');
        px(x + 20, by + hop + 33 + sz, 4, 4, '#C89020');
      }
      break;

    case 'salamandro': // Salamandro: larvita alquimista torpe, cara más tierna
      {
        const wob = Math.sin(f * 0.18) * 1;
        // cuerpo bajo, casi reptando: aprendiz torpe
        px(x + 5, by + 27 + wob, 24 + sz, 8 + sz, '#E86020');
        px(x + 7, by + 29 + wob, 20 + sz, 5 + sz, '#F07830');
        px(x + 2, by + 30 + wob, 8, 4, '#D85018');
        px(x - 1, by + 31 + wob, 4, 3, '#F89040');
        // patitas cortas
        px(x + 8, by + 34 + sz + wob, 5, 3, '#C04818');
        px(x + 22, by + 34 + sz + wob, 5, 3, '#C04818');

        // cabeza grande y amable al frente
        px(x + 17, by + 15 + wob, 17 + sz, 13, '#E86020');
        px(x + 19, by + 17 + wob, 13 + sz, 9, '#F89040');
        px(x + 21, by + 19 + wob, 9 + sz, 5, '#FFA050');
        // gorrito/pañuelo morado torpe
        px(x + 17, by + 11 + wob, 15 + sz, 5, '#4030A0');
        px(x + 19, by + 9 + wob, 11 + sz, 4, '#5040B0');
        px(x + 27, by + 8 + wob, 4, 3, '#F8E830');
        // cara nueva: ojos curiosos, no cejas feas
        px(x + 20, by + 19 + wob, 5, 5, '#fff');
        px(x + sz + 28, by + 19 + wob, 5, 5, '#fff');
        px(x + 22, by + 21 + wob, 3, 3, '#181818');
        px(x + sz + 30, by + 21 + wob, 3, 3, '#181818');
        px(x + 23, by + 21 + wob, 1, 1, '#fff');
        px(x + sz + 31, by + 21 + wob, 1, 1, '#fff');
        // sonrisa pequeña y mejilla de torpeza
        px(x + 25, by + 26 + wob, 5, 1, '#A83818');
        px(x + 18, by + 24 + wob, 2, 2, '#F8B070');
        // poción caída
        px(x + 2, by + 21 + wob, 6, 7, '#484848');
        px(x + 3, by + 20 + wob, 4, 2, '#606060');
        px(x + 3, by + 24 + wob, 4, 3, '#40E040');
        if (f % 12 < 6) px(x + 4, by + 22 + wob, 2, 2, '#80F080');
      }
      break;

    case 'blaztoro': // Blaztoro: torito pastelero pequeño y delicado
      {
        const bob = Math.sin(f * 0.14) * 1;
        px(x + 8, by + 22 + bob, 20 + sz, 12 + sz, '#A03020');
        px(x + 10, by + 24 + bob, 16 + sz, 8 + sz, '#C04030');
        px(x + 11, by + 23 + bob, 14 + sz, 9, '#F0E8E0');
        px(x + 13, by + 25 + bob, 10 + sz, 5, '#F8F0E8');
        px(x + 16, by + 27 + bob, 4, 3, '#E05060');
        px(x + 8, by + 8 + bob, 18 + sz, 13, '#A03020');
        px(x + 10, by + 10 + bob, 14 + sz, 9, '#C04030');
        px(x + 12, by + 12 + bob, 10 + sz, 5, '#D05040');
        px(x + 6, by + 5 + bob, 4, 5, '#E8D8C0');
        px(x + sz + 25, by + 5 + bob, 4, 5, '#E8D8C0');
        px(x + 5, by + 3 + bob, 3, 3, '#F0E0D0');
        px(x + sz + 27, by + 3 + bob, 3, 3, '#F0E0D0');
        px(x + 9, by + 2 + bob, 16 + sz, 4, '#F8F8F8');
        px(x + 11, by - 1 + bob, 12 + sz, 5, '#F8F8F8');
        px(x + 13, by - 2 + bob, 8 + sz, 3, '#F0F0F0');
        px(x + 11, by + 12 + bob, 5, 5, '#fff');
        px(x + sz + 19, by + 12 + bob, 5, 5, '#fff');
        px(x + 13, by + 14 + bob, 3, 3, '#401818');
        px(x + sz + 21, by + 14 + bob, 3, 3, '#401818');
        px(x + 14, by + 19 + bob, 7, 2, '#C04030');
        px(x + sz + 25, by + 25 + bob, 6, 5, '#F0D8C0');
        px(x + sz + 26, by + 23 + bob, 4, 3, '#F088A0');
        px(x + sz + 27, by + 22 + bob, 2, 2, '#F8E830');
        px(x + 9, by + 32 + sz + bob, 5, 5, '#A03020');
        px(x + sz + 21, by + 32 + sz + bob, 5, 5, '#A03020');
        px(x + 8, by + 36 + sz + bob, 6, 2, '#802818');
        px(x + sz + 20, by + 36 + sz + bob, 6, 2, '#802818');
      }
      break;

    case 'axolotl': // Ajolotín: cabeza grande, cuerpito bebé muy pequeño
      {
        const wig = Math.sin(f * 0.14) * 1;
        // cuerpo chiquitito debajo de una cabeza grande
        px(x + 12, by + 24, 10 + sz, 9 + sz, '#2870C0');
        px(x + 14, by + 26, 6 + sz, 5 + sz, '#48A0E8');
        px(x + 10, by + 31 + sz, 5, 3, '#2870C0');
        px(x + sz + 19, by + 31 + sz, 5, 3, '#2870C0');
        // colita bebé
        px(x + 7, by + 27, 6, 3, '#3890D8');
        px(x + 5, by + 26, 4, 2, '#48A0E8');

        // cabeza mantiene tamaño grande y redondita en pixel-art
        px(x + 4, by + 6, 24 + sz, 17, '#2870C0');
        px(x + 6, by + 8, 20 + sz, 13, '#3890D8');
        px(x + 8, by + 10, 16 + sz, 9, '#48A0E8');
        // branquias rosadas grandes
        px(x, by + 4 + wig, 6, 3, '#F070A0');
        px(x - 2, by + 8 + wig, 6, 3, '#F070A0');
        px(x, by + 12 + wig, 6, 3, '#F070A0');
        px(x + sz + 27, by + 4 - wig, 6, 3, '#F070A0');
        px(x + sz + 29, by + 8 - wig, 6, 3, '#F070A0');
        px(x + sz + 27, by + 12 - wig, 6, 3, '#F070A0');
        // ojos enormes y sonrisa bebé
        px(x + 8, by + 10, 6, 6, '#fff');
        px(x + sz + 18, by + 10, 6, 6, '#fff');
        px(x + 10, by + 12, 4, 4, '#0840A0');
        px(x + sz + 20, by + 12, 4, 4, '#0840A0');
        px(x + 11, by + 12, 2, 2, '#fff');
        px(x + sz + 21, by + 12, 2, 2, '#fff');
        px(x + 12, by + 18, 3, 1, '#1858A0');
        px(x + sz + 17, by + 18, 3, 1, '#1858A0');
        px(x + 14, by + 19, 4 + sz, 1, '#2070B0');
        // burbujas cuadradas
        const bub = Math.sin(f * 0.08) * 4;
        cx.globalAlpha = 0.5;
        px(x + sz + 27, by + 6 + bub, 3, 3, '#88D8F8');
        px(x + sz + 31, by + 2 + bub, 2, 2, '#A8E8F8');
        cx.globalAlpha = 1;
      }
      break;

    case 'medusync': // Medusa DJ con tentáculos-cables
      {
        const mhv = Math.sin(fr * 0.12) * 3;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#4080F0';
      pixelGlow(x + 16, by + mhv + 22, 16 + sz, 14);
        cx.globalAlpha = 1;
        px(x + 4, by + mhv + 6, 24 + sz, 14, '#3070C0');
        px(x + 6, by + mhv + 8, 20 + sz, 10, '#4090D8');
        px(x + 8, by + mhv + 10, 16 + sz, 6, '#50A8E8');
        px(x + 8, by + mhv + 8, 4, 4, '#60B0F0');
        px(x + 16, by + mhv + 10, 4, 3, '#60B0F0');
        px(x + 8, by + mhv + 12, 6, 4, '#181818');
        px(x + sz + 18, by + mhv + 12, 6, 4, '#181818');
        px(x + 9, by + mhv + 13, 4, 2, '#4060C0');
        px(x + sz + 19, by + mhv + 13, 4, 2, '#4060C0');
        px(x + 14, by + mhv + 18, 4, 1, '#2060A0');
        const tw = Math.sin(f * 0.15) * 2;
        px(x + 6, by + mhv + 20 + tw, 2, 10, '#2858A0');
        px(x + 12, by + mhv + 20 - tw, 2, 12, '#3070C0');
        px(x + 20, by + mhv + 20 + tw, 2, 10, '#2858A0');
        px(x + sz + 24, by + mhv + 20 - tw, 2, 8, '#3070C0');
        if (f % 8 < 4) {
          px(x + 6, by + mhv + 30 + tw, 2, 2, '#F8E830');
          px(x + 12, by + mhv + 32 - tw, 2, 2, '#E83030');
          px(x + 20, by + mhv + 30 + tw, 2, 2, '#30E830');
        }
        px(x + 3, by + mhv + 8, 3, 6, '#282828');
        px(x + sz + 26, by + mhv + 8, 3, 6, '#282828');
        px(x + 4, by + mhv + 10, 2, 3, '#E83030');
        px(x + sz + 27, by + mhv + 10, 2, 3, '#E83030');
        px(x + 5, by + mhv + 6, 22 + sz, 2, '#383838');
      }
      break;

    case 'pinzardo': // Cangrejo peluquero con tijeras
      px(x + 4, by + 22, 24 + sz, 10 + sz, '#D85020');
      px(x + 6, by + 24, 20 + sz, 6 + sz, '#E86830');
      px(x + 8, by + 26, 16 + sz, 2, '#F08040');
      px(x + 10, by + 22, 12 + sz, 6, '#C04018');
      px(x + 8, by + 14, 3, 8, '#D85020');
      px(x + sz + 20, by + 14, 3, 8, '#D85020');
      px(x + 7, by + 12, 5, 4, '#fff');
      px(x + sz + 19, by + 12, 5, 4, '#fff');
      px(x + 9, by + 14, 2, 2, '#181818');
      px(x + sz + 21, by + 14, 2, 2, '#181818');
      px(x - 2, by + 18, 8, 4, '#C04018');
      px(x - 4, by + 16, 4, 3, '#D85020');
      px(x - 4, by + 21, 4, 3, '#D85020');
      px(x - 3, by + 17, 2, 1, '#F0F0F0');
      px(x + sz + 26, by + 18, 8, 4, '#C04018');
      px(x + sz + 30, by + 16, 4, 3, '#D85020');
      px(x + sz + 30, by + 21, 4, 3, '#D85020');
      px(x + sz + 31, by + 17, 2, 1, '#F0F0F0');
      px(x + sz + 28, by + 24, 2, 6, '#282828');
      px(x + sz + 27, by + 24, 1, 1, '#282828');
      px(x + sz + 27, by + 26, 1, 1, '#282828');
      px(x + sz + 27, by + 28, 1, 1, '#282828');
      px(x + 14, by + 28, 4, 2, '#B04018');
      px(x + 6, by + 30 + sz, 4, 4, '#D85020');
      px(x + 12, by + 30 + sz, 4, 4, '#D85020');
      px(x + 18, by + 30 + sz, 4, 4, '#D85020');
      px(x + sz + 22, by + 30 + sz, 4, 4, '#D85020');
      cx.globalAlpha = 0.4;
      px(x + sz + 26, by + 12 + Math.sin(f * 0.08) * 3, 3, 3, '#88D8F8');
      cx.globalAlpha = 1;
      break;

    case 'pingueson': // Pingüino mesero con bandeja
      px(x + 6, by + 18, 20 + sz, 14 + sz, '#1A1A2A');
      px(x + 8, by + 20, 16 + sz, 10 + sz, '#282838');
      px(x + 10, by + 22, 12 + sz, 8, '#F0F0F0');
      px(x + 12, by + 24, 8 + sz, 4, '#F8F8F8');
      px(x + 6, by + 6, 20 + sz, 14, '#1A1A2A');
      px(x + 8, by + 8, 16 + sz, 10, '#282838');
      px(x + 10, by + 10, 12 + sz, 6, '#F0F0F0');
      px(x + 10, by + 10, 4, 4, '#fff');
      px(x + sz + 18, by + 10, 4, 4, '#fff');
      px(x + 12, by + 12, 2, 2, '#181818');
      px(x + sz + 20, by + 12, 2, 2, '#181818');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + sz + 20, by + 12, 1, 1, '#fff');
      px(x + 14, by + 18, 4, 2, '#E83030');
      px(x + 15, by + 17, 2, 1, '#E83030');
      px(x + 14, by + 14, 4, 3, '#F0A030');
      px(x + 15, by + 16, 2, 1, '#D88020');
      px(x + sz + 24, by + 16, 6, 8, '#1A1A2A');
      px(x + sz + 24, by + 14, 8, 2, '#C8C8C8');
      px(x + sz + 26, by + 12, 4, 2, '#F8F0E0');
      px(x + 10, by + 30 + sz, 4, 4, '#F0A030');
      px(x + 18, by + 30 + sz, 4, 4, '#F0A030');
      break;

    case 'peztronauta': // Pez pequeño en burbuja espacial
      {
        const phv2 = Math.sin(fr * 0.12) * 2;
        cx.globalAlpha = 0.2;
        cx.fillStyle = '#88D8F8';
      pixelGlow(x + 16, by + phv2 + 18, 14 + sz, 12);
        cx.globalAlpha = 1;
        cx.globalAlpha = 0.4;
        cx.fillStyle = '#50A8E0';
        pixelGlow(x + 16, by + phv2 + 18, 14 + sz, 12);
        cx.globalAlpha = 1;
        px(x + 8, by + phv2 + 10, 4, 3, 'rgba(255,255,255,.3)');
        px(x + 8, by + phv2 + 14, 16 + sz, 10, '#3088E0');
        px(x + 10, by + phv2 + 16, 12 + sz, 6, '#48A0F0');
        px(x + 14, by + phv2 + 12, 4, 3, '#2070C0');
        px(x + 6, by + phv2 + 16, 4, 4, '#2070C0');
        px(x + 4, by + phv2 + 18, 3, 2, '#3088E0');
        px(x + 18, by + phv2 + 16, 4, 4, '#fff');
        px(x + 20, by + phv2 + 18, 2, 2, '#181848');
        px(x + 20, by + phv2 + 18, 1, 1, '#fff');
        px(x + sz + 20, by + phv2 + 14, 6, 6, '#C8C8D0');
        px(x + sz + 22, by + phv2 + 16, 2, 2, '#88B8F0');
        px(x + 16, by + phv2 + 8, 2, 4, '#C8C8D0');
        px(x + 15, by + phv2 + 6, 4, 3, '#E83030');
        if (f % 16 < 8) px(x + 16, by + phv2 + 5, 2, 2, '#F8E830');
        cx.globalAlpha = 0.4;
        px(x + 4 + Math.sin(f * 0.05) * 2, by + phv2 + 8, 1, 1, '#F8F8C0');
        px(
          x + sz + 26 + Math.sin(f * 0.07) * 2,
          by + phv2 + 22,
          1,
          1,
          '#F8F8C0'
        );
        cx.globalAlpha = 1;
      }
      break;

    // ==========================================
    // PLANTA 🌿 - NUEVOS (únicos)
    // ==========================================

    case 'gorilan': // Gorilán: poeta joven sentado, pequeño y tímido
      {
        const sway = Math.sin(f * 0.12) * 1;
        // Postura sentada, baja y ancha: etapa bebé/joven
        px(x + 7, by + 24, 22 + sz, 12 + sz, '#386028');
        px(x + 9, by + 26, 18 + sz, 8 + sz, '#487830');
        px(x + 12, by + 28, 12 + sz, 4, '#609840');
        // piernas dobladas
        px(x + 2, by + 32 + sz, 10, 6, '#2A5020');
        px(x + sz + 24, by + 32 + sz, 10, 6, '#2A5020');
        px(x + 1, by + 36 + sz, 8, 3, '#203818');
        px(x + sz + 27, by + 36 + sz, 8, 3, '#203818');
        // brazos cortos abrazando librito
        px(x + 3, by + 22, 8, 6, '#386028');
        px(x + sz + 25, by + 22, 8, 6, '#386028');
        px(x + 10, by + 25, 14, 8, '#8A2020');
        px(x + 11, by + 26, 12, 6, '#F0E0C0');
        px(x + 16, by + 26, 1, 6, '#B09070');
        // cabeza grande y tímida
        px(x + 6, by + 5 + sway, 24 + sz, 17, '#386028');
        px(x + 8, by + 7 + sway, 20 + sz, 13, '#487830');
        px(x + 11, by + 10 + sway, 14 + sz, 8, '#5C9440');
        px(x + 9, by + 2 + sway, 18 + sz, 5, '#2A5020');
        px(x + 11, by + 0 + sway, 12 + sz, 4, '#389028');
        // pluma pequeña detrás de la cabeza
        px(x + sz + 27, by + 4 + sway, 2, 10, '#E8D8C0');
        px(x + sz + 28, by + 2 + sway, 4, 4, '#F0E8D0');
        px(x + sz + 29, by + 1 + sway, 2, 2, '#48A030');
        // ojos inocentes
        px(x + 10, by + 11 + sway, 5, 5, '#fff');
        px(x + sz + 20, by + 11 + sway, 5, 5, '#fff');
        px(x + 12, by + 13 + sway, 3, 3, '#2A3818');
        px(x + sz + 22, by + 13 + sway, 3, 3, '#2A3818');
        px(x + 14, by + 18 + sway, 6, 2, '#2A4018');
      }
      break;

    case 'orquidea': // Mantis religiosa bailarina de ballet
      {
        const ohv = Math.sin(fr * 0.12) * 2;
        px(x + 12, by + ohv + 16, 8 + sz, 16 + sz, '#48A038');
        px(x + 14, by + ohv + 18, 4 + sz, 12 + sz, '#58B048');
        px(x + 6, by + ohv + 22, 20 + sz, 4, '#F088A8');
        px(x + 8, by + ohv + 24, 16 + sz, 2, '#F098B8');
        px(x + 4, by + ohv + 22, 4, 3, '#E878A0');
        px(x + sz + 24, by + ohv + 22, 4, 3, '#E878A0');
        const oaf = Math.sin(f * 0.1) * 3;
        px(x + 4, by + ohv + 14 + oaf, 8, 2, '#48A038');
        px(x + 2, by + ohv + 12 + oaf, 4, 3, '#58B048');
        px(x + sz + 20, by + ohv + 14 - oaf, 8, 2, '#48A038');
        px(x + sz + 24, by + ohv + 12 - oaf, 4, 3, '#58B048');
        px(x + 8, by + ohv + 4, 16 + sz, 12, '#48A038');
        px(x + 10, by + ohv + 6, 12 + sz, 8, '#58B048');
        px(x + 8, by + ohv + 6, 5, 5, '#E0F0A0');
        px(x + sz + 18, by + ohv + 6, 5, 5, '#E0F0A0');
        px(x + 10, by + ohv + 8, 3, 3, '#1A3010');
        px(x + sz + 20, by + ohv + 8, 3, 3, '#1A3010');
        px(x + 10, by + ohv + 8, 1, 1, '#fff');
        px(x + sz + 20, by + ohv + 8, 1, 1, '#fff');
        px(x + 10, by + ohv + 2, 2, 4, '#48A038');
        px(x + sz + 20, by + ohv + 2, 2, 4, '#48A038');
        px(x + 9, by + ohv, 3, 3, '#F088A8');
        px(x + sz + 19, by + ohv, 3, 3, '#F8E830');
        px(x + 12, by + ohv + 30 + sz, 2, 8, '#48A038');
        px(x + 18, by + ohv + 30 + sz, 2, 8, '#48A038');
        px(x + 11, by + ohv + 36 + sz, 4, 2, '#F088A8');
        px(x + 17, by + ohv + 36 + sz, 4, 2, '#F088A8');
      }
      break;

    case 'raizan': // Tortuga anciana sabia con musgo y cristales
      px(x + 2, by + 18, 28 + sz, 14 + sz, '#406828');
      px(x + 4, by + 20, 24 + sz, 10 + sz, '#508030');
      px(x + 4, by + 16, 24 + sz, 8, '#3A5820');
      px(x + 6, by + 14, 20 + sz, 6, '#486828');
      px(x + 8, by + 16, 6, 4, '#305018');
      px(x + 16, by + 16, 6, 4, '#305018');
      px(x + 12, by + 14, 6, 4, '#305018');
      px(x + 6, by + 12, 4, 3, '#48A030');
      px(x + 18, by + 12, 3, 3, '#48A030');
      px(x + 8, by + 11, 2, 2, '#F088A0');
      px(x + sz + 22, by + 22, 8, 8, '#508030');
      px(x + sz + 24, by + 24, 4, 4, '#609838');
      px(x + sz + 24, by + 24, 3, 2, '#fff');
      px(x + sz + 25, by + 25, 2, 1, '#2A3818');
      px(x + sz + 26, by + 27, 3, 1, '#406828');
      px(x + sz + 26, by + 28, 2, 3, '#48A030');
      px(x + sz + 28, by + 29, 1, 2, '#58B038');
      px(x + sz + 30, by + 20, 2, 12, '#5A3818');
      px(x + sz + 29, by + 18, 4, 3, '#48A030');
      px(x + 4, by + 30 + sz, 5, 4, '#508030');
      px(x + sz + 20, by + 30 + sz, 5, 4, '#508030');
      px(x, by + 28, 4, 3, '#406828');
      const rgl = Math.sin(fr * 0.08) * 0.3 + 0.7;
      cx.globalAlpha = rgl;
      px(x + 12, by + 12, 3, 3, '#A050F0');
      px(x + 13, by + 13, 1, 1, '#fff');
      cx.globalAlpha = 1;
      break;

    // ==========================================
    // DRAGÓN 🐉 - NUEVOS (únicos)
    // ==========================================

    case 'ornispia': // Ornitorrinco agente secreto con sombrero
      px(x + 6, by + 20, 20 + sz, 12 + sz, '#40A0A8');
      px(x + 8, by + 22, 16 + sz, 8 + sz, '#50B0B8');
      px(x + 4, by + 18, 24 + sz, 14, '#484858');
      px(x + 6, by + 20, 20 + sz, 10, '#585868');
      px(x + 6, by + 28, 20 + sz, 2, '#383838');
      px(x + 14, by + 27, 4, 3, '#C8A830');
      px(x + 6, by + 6, 20 + sz, 14, '#40A0A8');
      px(x + 8, by + 8, 16 + sz, 10, '#50B0B8');
      px(x + 10, by + 16, 12 + sz, 4, '#E8A030');
      px(x + 12, by + 18, 8 + sz, 2, '#D89020');
      px(x + 4, by + 2, 24 + sz, 4, '#383838');
      px(x + 8, by - 1, 16 + sz, 5, '#484848');
      px(x + 10, by + 0, 12 + sz, 3, '#585858');
      px(x + 10, by + 1, 12 + sz, 1, '#282828');
      px(x + 10, by + 10, 4, 4, '#fff');
      px(x + sz + 18, by + 10, 4, 4, '#fff');
      px(x + 12, by + 12, 2, 2, '#181848');
      px(x + sz + 20, by + 12, 2, 2, '#181848');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + sz + 20, by + 12, 1, 1, '#fff');
      px(x - 4, by + 28, 8, 3, '#40A0A8');
      px(x - 6, by + 26, 4, 3, '#50B0B8');
      // Patas palmeadas
      px(x + 8, by + 30 + sz, 5, 4, '#E8A030');
      px(x + sz + 18, by + 30 + sz, 5, 4, '#E8A030');
      // Maletín
      px(x + sz + 24, by + 24, 6, 6, '#383838');
      px(x + sz + 25, by + 25, 4, 4, '#484848');
      px(x + sz + 26, by + 24, 2, 1, '#C8A830');
      break;

    case 'gusarix': // Gusano dentro de manzana
      px(x + 4, by + 10, 24 + sz, 20 + sz, '#D03020');
      px(x + 6, by + 12, 20 + sz, 16 + sz, '#E04030');
      px(x + 8, by + 14, 16 + sz, 12, '#E85040');
      // Mordida en la manzana
      px(x + sz + 20, by + 12, 8, 8, '#F8F0D0');
      px(x + sz + 22, by + 14, 4, 4, '#F8E8C0');
      // Hoja
      px(x + 12, by + 6, 4, 6, '#48A030');
      px(x + 14, by + 4, 3, 4, '#58B838');
      // Tallo
      px(x + 14, by + 6, 3, 4, '#5A3818');
      // Brillo de manzana
      px(x + 8, by + 14, 3, 4, '#F06858');
      px(x + 10, by + 16, 2, 2, '#F8A090');
      // Gusanito asomando
      px(x + sz + 20, by + 14, 6, 4, '#80C040');
      px(x + sz + 22, by + 12, 4, 4, '#90D050');
      // Ojos del gusano (enormes y tiernos)
      px(x + sz + 22, by + 12, 3, 3, '#fff');
      px(x + sz + 24, by + 13, 2, 2, '#181818');
      px(x + sz + 24, by + 13, 1, 1, '#fff');
      // Sonrisa del gusano
      px(x + sz + 24, by + 16, 2, 1, '#609030');
      // Sombra
      px(x + 6, by + 28 + sz, 20 + sz, 2, 'rgba(0,0,0,.15)');
      break;

    // ==========================================
    // HADA 🧚 - NUEVOS (únicos)
    // ==========================================

    case 'elefantasy': // Elefante místico tipo Ganesha
      {
        const ehv = Math.sin(fr * 0.1) * 2;
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#D8A0F0';
      pixelGlow(x + 16, by + ehv + 22, 18 + sz, 16);
        cx.globalAlpha = 1;
        // Cuerpo robusto
        px(x + 4, by + ehv + 18, 24 + sz, 14 + sz, '#8870A0');
        px(x + 6, by + ehv + 20, 20 + sz, 10 + sz, '#9880B0');
        // Chaleco dorado
        px(x + 8, by + ehv + 18, 16 + sz, 8, '#C8A830');
        px(x + 10, by + ehv + 20, 12 + sz, 4, '#D8B840');
        // Gemas en chaleco
        px(x + 14, by + ehv + 20, 4, 3, '#D03030');
        px(x + 12, by + ehv + 22, 2, 2, '#3060D0');
        // Brazos superiores (estilo Ganesha)
        px(x, by + ehv + 14, 6, 4, '#8870A0');
        px(x + sz + 26, by + ehv + 14, 6, 4, '#8870A0');
        px(x - 2, by + ehv + 12, 4, 3, '#9880B0');
        px(x + sz + 30, by + ehv + 12, 4, 3, '#9880B0');
        // Objetos en manos superiores
        px(x - 3, by + ehv + 10, 3, 3, '#F8E830'); // Loto
        px(x + sz + 32, by + ehv + 10, 3, 3, '#A050F0'); // Cristal
        // Brazos inferiores
        px(x + 2, by + ehv + 20, 4, 6, '#8870A0');
        px(x + sz + 26, by + ehv + 20, 4, 6, '#8870A0');
        // Cabeza de elefante
        px(x + 4, by + ehv + 2, 24 + sz, 16, '#8870A0');
        px(x + 6, by + ehv + 4, 20 + sz, 12, '#9880B0');
        // Orejas grandes
        px(x, by + ehv + 4, 6, 10, '#A890C0');
        px(x + sz + 26, by + ehv + 4, 6, 10, '#A890C0');
        px(x + 1, by + ehv + 6, 4, 6, '#B8A0D0');
        px(x + sz + 27, by + ehv + 6, 4, 6, '#B8A0D0');
        // Trompa
        px(x + 14, by + ehv + 14, 4, 10, '#9880B0');
        px(x + 12, by + ehv + 22, 4, 3, '#A890C0');
        px(x + 10, by + ehv + 24, 4, 2, '#A890C0');
        // Ojos sabios
        px(x + 8, by + ehv + 8, 5, 4, '#fff');
        px(x + sz + 18, by + ehv + 8, 5, 4, '#fff');
        px(x + 10, by + ehv + 9, 3, 3, '#301848');
        px(x + sz + 20, by + ehv + 9, 3, 3, '#301848');
        px(x + 10, by + ehv + 9, 1, 1, '#fff');
        px(x + sz + 20, by + ehv + 9, 1, 1, '#fff');
        // Tercer ojo en frente
        px(x + 14, by + ehv + 6, 4, 3, '#D03030');
        px(x + 15, by + ehv + 7, 2, 1, '#F8E830');
        // Corona/tiara
        px(x + 8, by + ehv, 16 + sz, 3, '#C8A830');
        px(x + 12, by + ehv - 2, 8 + sz, 3, '#D8B840');
        px(x + 15, by + ehv - 3, 2, 2, '#D03030');
        // Aureola mística
        const eha = Math.sin(fr * 0.08) * 0.3 + 0.7;
        cx.globalAlpha = eha * 0.3;
        cx.fillStyle = '#F8E868';
      pixelGlow(x + 16, by + ehv - 2, 12 + sz, 4);
        cx.globalAlpha = 1;
        // Patas
        px(x + 6, by + ehv + 30 + sz, 5, 5, '#8870A0');
        px(x + sz + 20, by + ehv + 30 + sz, 5, 5, '#8870A0');
      }
      break;

    case 'zumbaflor': // Colibrí barista hiperactivo
      {
        const zhv = Math.sin(fr * 0.15) * 3;
        // Alas rapidísimas (blur)
        cx.globalAlpha = 0.3;
        px(x - 4, by + zhv + 10, 10, 8, '#90D870');
        px(x + sz + 26, by + zhv + 10, 10, 8, '#90D870');
        px(x - 2, by + zhv + 8, 6, 6, '#A0E880');
        px(x + sz + 28, by + zhv + 8, 6, 6, '#A0E880');
        cx.globalAlpha = 1;
        // Cuerpo pequeño
        px(x + 10, by + zhv + 18, 12 + sz, 10 + sz, '#30A048');
        px(x + 12, by + zhv + 20, 8 + sz, 6 + sz, '#40B058');
        // Pecho iridiscente
        px(x + 12, by + zhv + 20, 8 + sz, 4, '#E84880');
        px(x + 14, by + zhv + 22, 4 + sz, 2, '#F060A0');
        // Cabeza
        px(x + 8, by + zhv + 8, 16 + sz, 12, '#30A048');
        px(x + 10, by + zhv + 10, 12 + sz, 8, '#40B058');
        // Ojos enormes (hiperactivo, pupilas dilatadas)
        px(x + 8, by + zhv + 10, 5, 5, '#fff');
        px(x + sz + 18, by + zhv + 10, 5, 5, '#fff');
        px(x + 10, by + zhv + 11, 3, 4, '#181818');
        px(x + sz + 20, by + zhv + 11, 3, 4, '#181818');
        px(x + 10, by + zhv + 11, 1, 1, '#fff');
        px(x + sz + 20, by + zhv + 11, 1, 1, '#fff');
        // Pico largo con taza de café
        px(x + sz + 22, by + zhv + 14, 8, 2, '#E8A030');
        px(x + sz + 24, by + zhv + 13, 2, 3, '#D89020');
        // Taza de café en pico
        px(x + sz + 28, by + zhv + 12, 5, 4, '#F0F0F0');
        px(x + sz + 29, by + zhv + 10, 3, 3, '#8A5020');
        if (f % 8 < 4) {
          px(x + sz + 30, by + zhv + 8, 2, 2, '#E8E0D0');
        } // Vapor
        // Cola con plumas
        px(x + 4, by + zhv + 26, 6, 4, '#30A048');
        px(x + 2, by + zhv + 28, 4, 3, '#40B058');
        px(x, by + zhv + 30, 3, 2, '#50C068');
        // Patas diminutas
        px(x + 12, by + zhv + 26 + sz, 3, 3, '#D89020');
        px(x + 18, by + zhv + 26 + sz, 3, 3, '#D89020');
      }
      break;

    // ==========================================
    // DEFAULT - Criatura genérica por tipo
    // ==========================================
    default: {
      const tp2 = CDB[id]?.tp || 'normal';
      const tc2 = tCol(tp2);
      const tcl2 = tColL(tp2);
      px(x + 6, by + 20, 20 + sz, 14 + sz, tc2);
      px(x + 8, by + 22, 16 + sz, 10 + sz, tcl2);
      px(x + 6, by + 6, 20 + sz, 16, tc2);
      px(x + 8, by + 8, 16 + sz, 12, tcl2);
      px(x + 10, by + 10, 12 + sz, 8, tc2);
      px(x + 6, by + 2, 4, 6, tc2);
      px(x + sz + 22, by + 2, 4, 6, tc2);
      px(x + 10, by + 10, 5, 5, '#fff');
      px(x + 19, by + 10, 5, 5, '#fff');
      px(x + 12, by + 12, 3, 3, '#181818');
      px(x + 21, by + 12, 3, 3, '#181818');
      px(x + 12, by + 12, 1, 1, '#fff');
      px(x + 21, by + 12, 1, 1, '#fff');
      px(x + 14, by + 17, 4, 2, tc2);
      px(x + 8, by + 32 + sz, 5, 5, tc2);
      px(x + 19, by + 32 + sz, 5, 5, tc2);
      cx.fillStyle = tc2;
      cx.font = '6px "Press Start 2P"';
      cx.fillText(tEmo(tp2), x + 12, by + 42 + sz);
      break;
    }
  } // fin switch
} // fin dCre

// ============================================================
// BLOQUE 7: TILES DEL MUNDO (dTileW)
// ============================================================

// Mezcla dos colores hex (#RRGGBB) en el factor t (0..1)
function lerpColor(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const R = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const G = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const B = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return 'rgb(' + R + ',' + G + ',' + B + ')';
}


function drawWorldDecorBase(c, r, x, y) {
  // Base contextual para decoración: si está en cantera, se dibuja sobre piedra;
  // si está al norte, se adapta al suelo frío/nevado; si no, césped normal.
  const inRodaje = c >= 48 && c <= 64 && r >= 75 && r <= 89;
  const inMontajeLookout = c >= 40 && c <= 52 && r >= 16 && r <= 22;
  if (inRodaje || inMontajeLookout) {
    cx.fillStyle = inRodaje ? '#8A8172' : '#AFA898';
    cx.fillRect(x, y, T, T);
    cx.fillStyle = inRodaje ? '#9A9182' : '#C2BAAA';
    if ((c + r) % 2 === 0) cx.fillRect(x + 1, y + 1, 14, 14);
    else cx.fillRect(x + 17, y + 1, 14, 14);
    cx.fillStyle = inRodaje ? '#746C60' : '#8E8678';
    cx.fillRect(x, y + 15, T, 1);
    cx.fillRect(x + 15, y, 1, T);
    return;
  }
  const snow = Math.max(0, Math.min(1, (68 - r) / 46));
  const baseA = lerpColor('#58A830', '#F2F8F4', snow);
  const baseB = lerpColor('#48982A', '#E2ECE6', snow);
  cx.fillStyle = (c + r) % 2 ? baseA : baseB;
  cx.fillRect(x, y, T, T);
  cx.fillStyle = lerpColor('#408820', '#C2D4C2', snow);
  if ((c * 7 + r * 13) % 5 === 0) cx.fillRect(x + 8, y + 14, 2, 4);
  if (snow > 0.25) {
    cx.fillStyle = 'rgba(255,255,255,' + (0.35 + snow * 0.45).toFixed(2) + ')';
    cx.fillRect(x + 5, y + 7, 3, 2);
    cx.fillRect(x + 22, y + 24, 3, 2);
  }
}

function dTileW(c, r) {
  const x = c * T - cam.x,
    y = r * T - cam.y;
  if (x < -T || x > 640 || y < -T || y > 480) return;
  const t = wMap[r]?.[c];
  if (t === undefined) return;

  switch (t) {
    case 0: { // Hierba: blanca desde el 5o pueblo (norte), verde al sur
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const baseA = lerpColor('#58A830', '#F2F8F4', snow);
      const baseB = lerpColor('#48982A', '#E2ECE6', snow);
      cx.fillStyle = (c + r) % 2 ? baseA : baseB;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#408820', '#C2D4C2', snow);
      if ((c * 7 + r * 13) % 5 === 0) cx.fillRect(x + 8, y + 14, 2, 4);
      if ((c * 3 + r * 11) % 7 === 0) cx.fillRect(x + 20, y + 8, 3, 2);
      if ((c * 5 + r * 3) % 9 === 0) cx.fillRect(x + 24, y + 22, 2, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.5 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 5 + ((r * 7) % 22), y + 6, 2, 2);
        if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 18, y + 20, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 12, y + 26, 3, 2);
      }
      break;
    }
    case 1: // Camino de tierra con textura
      cx.fillStyle = '#C8B898';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#D8C8A8';
      if ((c + r) % 3 === 0) cx.fillRect(x + 6, y + 6, 4, 4);
      if ((c + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      cx.fillStyle = '#B8A888';
      if ((c + r) % 4 === 0) cx.fillRect(x + 14, y + 24, 3, 3);
      // Bordes sutiles
      cx.fillStyle = '#A89878';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      break;

    case 2: { // Agua: congelada en el norte, liquida al sur
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      if (snow > 0.5) {
        // Lago congelado (hielo)
        cx.fillStyle = '#CDE6F2';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#B6D6E8';
        if ((c + r) % 3 === 0) cx.fillRect(x + 4, y + 6, 10, 6);
        if ((c * 2 + r) % 4 === 0) cx.fillRect(x + 18, y + 16, 12, 8);
        cx.fillStyle = '#9CC2DA';
        cx.fillRect(x + 6, y + 4, 14, 1);
        cx.fillRect(x + 2, y + 20, 20, 1);
        cx.fillStyle = 'rgba(255,255,255,.6)';
        cx.fillRect(x + 10, y + 8, 8, 2);
        cx.fillStyle = '#8FB0C8';
        cx.fillRect(x, y, T, 1);
        cx.fillRect(x, y + T - 1, T, 1);
      } else {
        // Agua con reflejos
        const w = Math.sin(fr * 0.04 + c * 0.7 + r * 0.5);
        cx.fillStyle = w > 0 ? '#2070C0' : '#3088D0';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#48A0E8';
        cx.fillRect(x + Math.sin(fr * 0.06 + c * 2) * 5 + 10, y + 8, 12, 2);
        cx.fillRect(x + Math.sin(fr * 0.05 + c * 1.5) * 4 + 6, y + 20, 10, 2);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + Math.sin(fr * 0.08 + c) * 6 + 8, y + 14, 6, 1);
        cx.fillStyle = '#1858A0';
        cx.fillRect(x, y, T, 1);
        cx.fillRect(x, y + T - 1, T, 1);
      }
      break;
    }
    case 3: { // Árbol del mundo: patrón base del personal, adaptado al clima
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      // Suelo bajo el árbol: verde al sur, nevado/frío al norte
      const groundA = lerpColor('#58A830', '#F2F8F4', snow);
      const groundB = lerpColor('#48982A', '#DCE8E2', snow);
      cx.fillStyle = (c + r) % 2 ? groundA : groundB;
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#3F8C24', '#C8D8CC', snow);
      if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 5, y + 7, 3, 2);
      if ((c * 7 + r) % 5 === 0) cx.fillRect(x + 22, y + 24, 3, 2);

      // Mismo patrón visual que los árboles del personal de ruta
      dShadow(x + 16, y + 29, 12, 4);
      const trunk = lerpColor('#6A4828', '#6B5A4E', snow);
      const trunkL = lerpColor('#7A5630', '#827064', snow);
      px(x + 13, y + 18, 7, 12, trunk);
      px(x + 11, y + 22, 11, 8, trunkL);

      const dark = lerpColor('#185C2A', '#AFC4B8', snow);
      const mid = lerpColor('#20743A', '#CBDCD2', snow);
      const light = lerpColor('#2B8A45', '#E3EEE8', snow);
      const hi = lerpColor('#45A85A', '#FFFFFF', snow);
      // copa en tres masas rectangulares, no pino triangular
      px(x + 6, y + 7, 20, 14, dark);
      px(x + 3, y + 13, 26, 12, mid);
      px(x + 8, y + 3, 16, 10, light);
      px(x + 10, y + 9, 8, 5, hi);
      px(x + 22, y + 16, 4, 4, lerpColor('#145020', '#9FB6AA', snow));

      // nieve acumulada en la parte alta si está al norte
      if (snow > 0.18) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.55 + snow * 0.4).toFixed(2) + ')';
        cx.fillRect(x + 8, y + 3, 16, 3);
        cx.fillRect(x + 6, y + 8, 20, 2);
        cx.fillRect(x + 3, y + 13, 26, 2);
        cx.fillRect(x + 10, y + 9, 8, 2);
      }
      break;
    }
    case 4: // Casa/edificio estilo Pokémon (no se entra)
      {
        // Determinar color de techo por posición
        const roofColors = ['#C83030', '#3060C0', '#C88030', '#30A060'];
        const roofCol = roofColors[(c * 3 + r * 7) % roofColors.length];
        const roofColL = roofCol.replace(/30/g, '50').replace(/60/g, '80');
        // Paredes
        cx.fillStyle = '#E8E0D0';
        cx.fillRect(x, y + 6, T, T - 6);
        cx.fillStyle = '#F0E8D8';
        cx.fillRect(x + 2, y + 8, T - 4, T - 10);
        // Piedras/ladrillos
        cx.fillStyle = '#D8D0C0';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 1, y + 8, 15, 7);
          cx.fillRect(x + 17, y + 16, 14, 7);
          cx.fillRect(x + 1, y + 24, 15, 7);
        }
        // Techo
        cx.fillStyle = roofCol;
        cx.fillRect(x - 2, y - 2, T + 4, 10);
        cx.fillStyle = roofColL;
        cx.fillRect(x, y, T, 6);
        cx.fillStyle = 'rgba(0,0,0,.15)';
        cx.fillRect(x - 2, y + 6, T + 4, 2);
        // Ventana
        cx.fillStyle = '#383838';
        cx.fillRect(x + 4, y + 12, 8, 8);
        cx.fillStyle = '#88C8F8';
        cx.fillRect(x + 5, y + 13, 6, 6);
        cx.fillStyle = '#A8D8F8';
        cx.fillRect(x + 5, y + 13, 3, 3);
        cx.fillStyle = '#484848';
        cx.fillRect(x + 8, y + 13, 1, 6);
        cx.fillRect(x + 5, y + 16, 6, 1);
        // Ventana 2
        cx.fillStyle = '#383838';
        cx.fillRect(x + 20, y + 12, 8, 8);
        cx.fillStyle = '#88C8F8';
        cx.fillRect(x + 21, y + 13, 6, 6);
        cx.fillStyle = '#A8D8F8';
        cx.fillRect(x + 21, y + 13, 3, 3);
        cx.fillStyle = '#484848';
        cx.fillRect(x + 24, y + 13, 1, 6);
        cx.fillRect(x + 21, y + 16, 6, 1);
        // Puerta
        cx.fillStyle = '#6A4020';
        cx.fillRect(x + 12, y + 18, 8, 14);
        cx.fillStyle = '#7A5030';
        cx.fillRect(x + 13, y + 19, 6, 13);
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 18, y + 24, 2, 2); // Pomo
      }
      break;

    case 5: { // Hierba alta (encuentros) - blanquea con la altura
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor((c + r) % 2 ? '#5AA836' : '#4A9A2E', '#E6F0EA', snow);
      cx.fillRect(x, y, T, T);
      const blades = [[3,3,22],[9,6,17],[14,2,24],[19,7,15],[24,4,20],[6,9,12],[21,10,11],[16,11,9]];
      cx.fillStyle = lerpColor('#3A9C28', '#DCE8DC', snow);
      blades.forEach(b => cx.fillRect(x + b[0], y + b[1], 2, b[2]));
      cx.fillStyle = lerpColor('#66C642', '#FFFFFF', snow);
      blades.forEach(b => cx.fillRect(x + b[0], y + b[1], 2, 3));
      if (snow > 0.4) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        blades.forEach(b => cx.fillRect(x + b[0] - 1, y + b[1] - 1, 4, 2));
      }
      cx.fillStyle = 'rgba(0,0,0,.06)';
      cx.fillRect(x, y + 27, T, 5);
      break;
    }
    case 6: { // Flores decorativas - misma base de hierba que la roca + nieve
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#48982A', '#E2ECE6', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 6, y + 8, 4, 4);
      if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 10, y + 6, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 22, y + 22, 3, 2);
      }
      // tallos
      cx.fillStyle = lerpColor('#38A028', '#CFE0CF', snow);
      cx.fillRect(x + 11, y + 14, 2, 12);
      cx.fillRect(x + 19, y + 16, 2, 10);
      // hojas
      cx.fillStyle = lerpColor('#48B830', '#DCEADA', snow);
      cx.fillRect(x + 9, y + 18, 3, 3);
      cx.fillRect(x + 20, y + 20, 3, 3);
      // flores
      cx.fillStyle = '#E85A82'; cx.fillRect(x + 8, y + 8, 5, 5);
      cx.fillStyle = '#F07FA0'; cx.fillRect(x + 9, y + 9, 3, 3);
      cx.fillStyle = '#E8C830'; cx.fillRect(x + 16, y + 8, 5, 5);
      cx.fillStyle = '#F4E060'; cx.fillRect(x + 17, y + 9, 3, 3);
      cx.fillStyle = '#D85078'; cx.fillRect(x + 23, y + 12, 4, 4);
      cx.fillStyle = '#F2A0B0'; cx.fillRect(x + 24, y + 13, 2, 2);
      cx.fillStyle = '#FFF0A0'; cx.fillRect(x + 10, y + 10, 1, 1); cx.fillRect(x + 18, y + 10, 1, 1);
      break;
    }

    case 7: { // Roca grande - misma base de hierba que las flores + nieve
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#48982A', '#E2ECE6', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 6, y + 8, 4, 4);
      if ((c * 3 + r) % 5 === 0) cx.fillRect(x + 20, y + 18, 5, 3);
      if (snow > 0.15) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.4 + snow * 0.5).toFixed(2) + ')';
        if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 10, y + 6, 2, 2);
        if ((c + r) % 6 === 0) cx.fillRect(x + 22, y + 22, 3, 2);
      }
      // Roca
      cx.fillStyle = '#6E6E6E'; cx.fillRect(x + 5, y + 11, 22, 16);
      cx.fillStyle = '#828282'; cx.fillRect(x + 6, y + 9, 20, 13);
      cx.fillStyle = '#969696'; cx.fillRect(x + 8, y + 11, 16, 7);
      cx.fillStyle = '#A8A8A8'; cx.fillRect(x + 10, y + 11, 6, 3); // brillo
      cx.fillStyle = '#585858'; cx.fillRect(x + 14, y + 15, 1, 6); cx.fillRect(x + 19, y + 13, 1, 4); // grietas
      cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(x + 6, y + 24, 20, 4); // sombra
      // polvo de nieve sobre la roca al norte
      if (snow > 0.2) {
        cx.fillStyle = 'rgba(255,255,255,' + (0.45 + snow * 0.5).toFixed(2) + ')';
        cx.fillRect(x + 6, y + 8, 20, 3);
        cx.fillRect(x + 10, y + 11, 8, 2);
      }
      break;
    }


    case 14: { // Arco/cartel de entrada de pueblo
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 4, y + 8, 4, 22);
      cx.fillRect(x + 24, y + 8, 4, 22);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 3, y + 6, 26, 7);
      cx.fillStyle = '#C09048';
      cx.fillRect(x + 5, y + 7, 22, 4);
      cx.fillStyle = '#E8C830';
      cx.fillRect(x + 9, y + 8, 3, 2);
      cx.fillRect(x + 15, y + 8, 3, 2);
      cx.fillRect(x + 21, y + 8, 3, 2);
      if (snow > 0.2) {
        cx.fillStyle = 'rgba(255,255,255,.65)';
        cx.fillRect(x + 3, y + 5, 26, 2);
      }
      break;
    }

    case 15: { // Farol / antorcha de pueblo
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 14, y + 9, 4, 20);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 12, y + 7, 8, 4);
      cx.fillStyle = '#F8D860';
      cx.fillRect(x + 13, y + 3, 6, 6);
      cx.fillStyle = '#F8A030';
      cx.fillRect(x + 14, y + 4, 4, 4);
      cx.globalAlpha = 0.18;
      cx.fillStyle = '#F8E8A0';
      pixelGlow(x + 16, y + 7, 12, 8);
      cx.globalAlpha = 1;
      break;
    }

    case 16: { // Banco / descanso
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 5, y + 17, 22, 4);
      cx.fillRect(x + 7, y + 12, 18, 4);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 6, y + 13, 20, 2);
      cx.fillRect(x + 4, y + 21, 4, 8);
      cx.fillRect(x + 24, y + 21, 4, 8);
      break;
    }

    case 17: { // Mural / panel artístico de Storyboard
      cx.fillStyle = '#C8B898';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#D8C8A8';
      cx.fillRect(x + 2, y + 2, 28, 28);
      cx.fillStyle = '#1A1A2E';
      cx.fillRect(x + 5, y + 5, 22, 18);
      cx.fillStyle = '#F8F8E8';
      cx.fillRect(x + 7, y + 7, 18, 14);
      cx.fillStyle = '#E83030';
      cx.fillRect(x + 9, y + 10, 5, 5);
      cx.fillStyle = '#3888E0';
      cx.fillRect(x + 17, y + 9, 5, 6);
      cx.fillStyle = '#48A038';
      cx.fillRect(x + 13, y + 16, 8, 3);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 8, y + 24, 16, 3);
      break;
    }

    case 18: { // Puesto / carpa de feria o vendedor
      drawWorldDecorBase(c, r, x, y);
      // mesa
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 4, y + 20, 24, 5);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 6, y + 21, 20, 3);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 6, y + 25, 4, 7);
      cx.fillRect(x + 22, y + 25, 4, 7);
      // toldo rayado
      cx.fillStyle = '#C83030';
      cx.fillRect(x + 3, y + 8, 26, 6);
      cx.fillStyle = '#F8F0E0';
      cx.fillRect(x + 8, y + 8, 5, 6);
      cx.fillRect(x + 18, y + 8, 5, 6);
      cx.fillStyle = '#A02020';
      cx.fillRect(x + 3, y + 14, 26, 3);
      // objetos en venta
      cx.fillStyle = '#E8C830';
      cx.fillRect(x + 8, y + 17, 4, 3);
      cx.fillStyle = '#70B8F8';
      cx.fillRect(x + 15, y + 17, 4, 3);
      cx.fillStyle = '#48A038';
      cx.fillRect(x + 22, y + 17, 4, 3);
      break;
    }

    case 19: { // Estatua (Rey o criatura según zona)
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      // pedestal
      cx.fillStyle = '#686878';
      cx.fillRect(x + 6, y + 24, 20, 6);
      cx.fillStyle = '#808090';
      cx.fillRect(x + 8, y + 21, 16, 4);
      // cuerpo estatua
      cx.fillStyle = '#9090A0';
      cx.fillRect(x + 12, y + 9, 8, 12);
      cx.fillStyle = '#A8A8B8';
      cx.fillRect(x + 13, y + 6, 6, 5);
      // corona/cuernos según paridad
      cx.fillStyle = '#C8A830';
      if ((c + r) % 2 === 0) {
        cx.fillRect(x + 11, y + 3, 10, 3);
        cx.fillRect(x + 13, y + 1, 2, 3);
        cx.fillRect(x + 18, y + 1, 2, 3);
      } else {
        cx.fillRect(x + 9, y + 5, 5, 3);
        cx.fillRect(x + 19, y + 5, 5, 3);
      }
      cx.fillStyle = '#707080';
      cx.fillRect(x + 10, y + 13, 4, 8);
      cx.fillRect(x + 18, y + 13, 4, 8);
      if (snow > 0.25) {
        cx.fillStyle = 'rgba(255,255,255,.7)';
        cx.fillRect(x + 8, y + 20, 16, 2);
        cx.fillRect(x + 12, y + 5, 8, 2);
      }
      break;
    }

    case 20: { // Cerca de madera
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 2, y + 13, 28, 4);
      cx.fillRect(x + 2, y + 22, 28, 4);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 5, y + 9, 4, 21);
      cx.fillRect(x + 22, y + 9, 4, 21);
      break;
    }

    case 21: { // Cajas de madera
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#8A5A28';
      cx.fillRect(x + 5, y + 15, 10, 10);
      cx.fillRect(x + 17, y + 11, 10, 14);
      cx.fillStyle = '#A07038';
      cx.fillRect(x + 6, y + 16, 8, 2);
      cx.fillRect(x + 18, y + 12, 8, 2);
      cx.fillStyle = '#5A3818';
      cx.fillRect(x + 9, y + 15, 2, 10);
      cx.fillRect(x + 21, y + 11, 2, 14);
      break;
    }

    case 22: { // Pozo de pueblo
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6E6E6E';
      cx.fillRect(x + 7, y + 17, 18, 10);
      cx.fillStyle = '#8A8A8A';
      cx.fillRect(x + 9, y + 15, 14, 4);
      cx.fillStyle = '#202838';
      cx.fillRect(x + 10, y + 18, 12, 5);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 8, y + 8, 3, 10);
      cx.fillRect(x + 21, y + 8, 3, 10);
      cx.fillRect(x + 8, y + 7, 16, 3);
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 15, y + 10, 2, 5);
      break;
    }

    case 23: { // Muñeco de entrenamiento
      drawWorldDecorBase(c, r, x, y);
      cx.fillStyle = '#6A4828';
      cx.fillRect(x + 14, y + 8, 4, 20);
      cx.fillRect(x + 8, y + 14, 16, 4);
      cx.fillStyle = '#C8B080';
      cx.fillRect(x + 10, y + 6, 12, 8);
      cx.fillStyle = '#E83030';
      cx.fillRect(x + 12, y + 9, 3, 3);
      cx.fillRect(x + 17, y + 9, 3, 3);
      cx.fillStyle = '#4A3018';
      cx.fillRect(x + 10, y + 28, 12, 3);
      break;
    }

    case 24: { // Huellas de criaturas
      drawWorldDecorBase(c, r, x, y);
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const col = snow > 0.35 ? '#A8B8B0' : '#2E6A20';
      cx.fillStyle = col;
      [[7,8],[12,13],[18,18],[23,23],[10,24],[20,8]].forEach(([a,b]) => {
        cx.fillRect(x + a, y + b, 3, 2);
        cx.fillRect(x + a + 1, y + b - 2, 1, 1);
      });
      break;
    }

    case 25: { // Set de rodaje / claqueta-cámara simbólica
      cx.fillStyle = '#A89878';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#8A8070';
      cx.fillRect(x + 2, y + 2, 28, 28);
      cx.fillStyle = '#202020';
      cx.fillRect(x + 8, y + 11, 14, 8);
      cx.fillStyle = '#303030';
      cx.fillRect(x + 10, y + 13, 10, 4);
      cx.fillStyle = '#C8C8C8';
      cx.fillRect(x + 20, y + 13, 5, 4);
      cx.fillStyle = '#5A3818';
      cx.fillRect(x + 14, y + 19, 3, 9);
      cx.fillRect(x + 9, y + 26, 13, 2);
      cx.fillStyle = '#F8F8F8';
      cx.fillRect(x + 6, y + 5, 20, 5);
      cx.fillStyle = '#202020';
      cx.fillRect(x + 6, y + 5, 4, 2);
      cx.fillRect(x + 14, y + 5, 4, 2);
      cx.fillRect(x + 22, y + 5, 4, 2);
      break;
    }

    case 26: { // Suelo de cantera / piedra tallada
      cx.fillStyle = '#8A8172';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#9A9182';
      if ((c + r) % 2 === 0) cx.fillRect(x + 1, y + 1, 14, 14);
      else cx.fillRect(x + 17, y + 1, 14, 14);
      cx.fillStyle = '#746C60';
      cx.fillRect(x, y + 15, T, 1);
      cx.fillRect(x + 15, y, 1, T);
      cx.fillStyle = '#B0A898';
      if ((c * 5 + r * 3) % 4 === 0) cx.fillRect(x + 7, y + 7, 5, 2);
      if ((c * 2 + r) % 5 === 0) cx.fillRect(x + 19, y + 22, 6, 2);
      break;
    }

    case 27: { // Desnivel / borde elevado del terreno
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      const inRodaje = c >= 48 && c <= 64 && r >= 75 && r <= 89;
      cx.fillStyle = inRodaje ? '#8A8172' : lerpColor('#58A830', '#F2F8F4', snow);
      cx.fillRect(x, y, T, T);
      // pared baja escalonada
      cx.fillStyle = inRodaje ? '#6F675C' : lerpColor('#7A5A38', '#C8D0CC', snow);
      cx.fillRect(x, y + 15, T, 13);
      cx.fillStyle = inRodaje ? '#918878' : lerpColor('#9A7040', '#E8F0EC', snow);
      cx.fillRect(x, y + 12, T, 5);
      cx.fillStyle = inRodaje ? '#B0A898' : lerpColor('#B89058', '#FFFFFF', snow);
      if ((c + r) % 2 === 0) cx.fillRect(x + 3, y + 12, 10, 2);
      else cx.fillRect(x + 18, y + 12, 9, 2);
      cx.fillStyle = 'rgba(0,0,0,.18)';
      cx.fillRect(x, y + 27, T, 5);
      break;
    }

    case 9: // Entrada de cueva
      cx.fillStyle = '#48982A';
      cx.fillRect(x, y, T, T);
      // Montaña/roca alrededor
      cx.fillStyle = '#5A4A38';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#6A5A48';
      cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      // Agujero oscuro
      cx.fillStyle = '#282018';
      cx.fillRect(x + 4, y + 6, T - 8, T - 6);
      cx.fillStyle = '#181010';
      cx.fillRect(x + 6, y + 8, T - 12, T - 8);
      cx.fillStyle = '#100808';
      cx.fillRect(x + 8, y + 10, T - 16, T - 12);
      // Arco de piedra
      cx.fillStyle = '#7A6A58';
      cx.fillRect(x, y, T, 6);
      cx.fillRect(x, y, 4, T);
      cx.fillRect(x + T - 4, y, 4, T);
      cx.fillStyle = '#8A7A68';
      cx.fillRect(x + 2, y + 1, T - 4, 3);
      // Detalle de musgo adaptativo (verde al sur, blanco al norte)
      {
        const snow9 = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss9 = lerpColor('#48A030', '#EEF4EE', snow9);
        cx.fillStyle = moss9;
        cx.fillRect(x + 2, y + 6, 3, 2);
        cx.fillRect(x + T - 5, y + 8, 3, 2);
      }
      break;

    case 10: { // Cristal Vinculo - la base cambia con la altura (nieve)
      const snow = Math.max(0, Math.min(1, (68 - r) / 46));
      cx.fillStyle = lerpColor('#3E8A2A', '#DCE8DC', snow);
      cx.fillRect(x, y, T, T);
      cx.fillStyle = lerpColor('#347A24', '#C8D4C8', snow);
      cx.fillRect(x, y + 24, T, 8);
      cx.globalAlpha = 0.78 + Math.sin(fr * 0.1) * 0.22;
      cx.fillStyle = '#7A2FD0'; cx.fillRect(x + 11, y + 6, 10, 18);
      cx.fillStyle = '#5E1FA8';
      pixelDiamond(x + 7, y + 6, 8, 18, cx.fillStyle);
      cx.fillStyle = '#9A4FE0';
      pixelDiamond(x + 17, y + 6, 8, 18, cx.fillStyle);
      cx.fillStyle = '#B56CF0';
      pixelDiamond(x + 11, y - 2, 10, 10, cx.fillStyle);
      cx.fillStyle = '#E6B8FF'; cx.fillRect(x + 14, y + 9, 3, 12);
      cx.globalAlpha = 1;
      if (Math.floor(fr / 22) % 2 === 0) {
        cx.fillStyle = '#FFFFFF';
        cx.fillRect(x + 7, y + 3, 2, 2);
        cx.fillRect(x + 23, y + 13, 2, 2);
      }
      break;
    }
    case 11: // Puerta del castillo
      {
        // Marco de piedra del castillo
        cx.fillStyle = '#606878';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#707888';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);

        // Arco de piedra
        cx.fillStyle = '#586070';
        cx.fillRect(x, y, T, 6);
        cx.fillStyle = '#687080';
        cx.fillRect(x + 2, y + 1, T - 4, 4);
        // Clave del arco
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 13, y, 6, 5);
        cx.fillStyle = '#D8B840';
        cx.fillRect(x + 14, y + 1, 4, 3);

        // Puerta de madera reforzada
        cx.fillStyle = '#3A2010';
        cx.fillRect(x + 4, y + 6, 24, 26);
        cx.fillStyle = '#4A3018';
        cx.fillRect(x + 6, y + 8, 20, 22);
        cx.fillStyle = '#5A4028';
        cx.fillRect(x + 8, y + 10, 16, 18);

        // Tablones verticales
        cx.fillStyle = '#4A3018';
        cx.fillRect(x + 11, y + 8, 1, 22);
        cx.fillRect(x + 16, y + 8, 1, 22);
        cx.fillRect(x + 21, y + 8, 1, 22);

        // Refuerzos de hierro horizontales
        cx.fillStyle = '#484858';
        cx.fillRect(x + 6, y + 12, 20, 2);
        cx.fillRect(x + 6, y + 22, 20, 2);

        // Clavos de hierro
        cx.fillStyle = '#585868';
        cx.fillRect(x + 8, y + 12, 2, 2);
        cx.fillRect(x + 22, y + 12, 2, 2);
        cx.fillRect(x + 8, y + 22, 2, 2);
        cx.fillRect(x + 22, y + 22, 2, 2);

        // Aldaba dorada (llamador)
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 14, y + 16, 4, 4);
        cx.fillStyle = '#E8C840';
        cx.fillRect(x + 15, y + 17, 2, 2);
        cx.fillStyle = '#A88020';
        cx.fillRect(x + 15, y + 20, 2, 2);

        // Columnas laterales
        cx.fillStyle = '#586070';
        cx.fillRect(x, y + 4, 4, T - 4);
        cx.fillRect(x + T - 4, y + 4, 4, T - 4);
        cx.fillStyle = '#687080';
        cx.fillRect(x + 1, y + 6, 2, T - 8);
        cx.fillRect(x + T - 3, y + 6, 2, T - 8);

        // Detalle dorado en columnas
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 1, y + 8, 2, 2);
        cx.fillRect(x + T - 3, y + 8, 2, 2);
        cx.fillRect(x + 1, y + 18, 2, 2);
        cx.fillRect(x + T - 3, y + 18, 2, 2);
      }
      break;

    case 12: { // Torre / castillo imponente (post-game) - musgo adaptativo
        const snow = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss = lerpColor('#4FA03A', '#EEF4EE', snow);     // verde al sur, blanco al norte
        const mossD = lerpColor('#3C7A2E', '#D8E6D8', snow);
        // Suelo (hierba del bioma)
        cx.fillStyle = lerpColor('#58A830', '#F2F8F4', snow);
        cx.fillRect(x, y, T, T);
        // Cuerpo de piedra de la torre
        cx.fillStyle = '#6E7686'; cx.fillRect(x + 4, y + 4, 24, 28);
        cx.fillStyle = '#7E8696'; cx.fillRect(x + 5, y + 5, 22, 26);
        // Ladrillos
        cx.fillStyle = '#666E7E';
        for (let br = 0; br < 4; br++) cx.fillRect(x + 5, y + 9 + br * 5, 22, 1);
        cx.fillStyle = '#5E6676';
        cx.fillRect(x + 15, y + 5, 1, 27);
        cx.fillRect(x + 10, y + 10, 1, 4); cx.fillRect(x + 21, y + 10, 1, 4);
        cx.fillRect(x + 10, y + 15, 1, 4); cx.fillRect(x + 21, y + 15, 1, 4);
        cx.fillRect(x + 10, y + 20, 1, 4); cx.fillRect(x + 21, y + 20, 1, 4);
        // Almenas (battlements) en lo alto
        cx.fillStyle = '#6E7686';
        cx.fillRect(x + 4, y, 4, 6); cx.fillRect(x + 11, y, 4, 6); cx.fillRect(x + 18, y, 4, 6); cx.fillRect(x + 24, y, 4, 6);
        cx.fillStyle = '#7E8696';
        cx.fillRect(x + 5, y + 1, 2, 4); cx.fillRect(x + 12, y + 1, 2, 4); cx.fillRect(x + 19, y + 1, 2, 4); cx.fillRect(x + 25, y + 1, 2, 4);
        // Musgo adaptativo en la base
        cx.fillStyle = mossD; cx.fillRect(x + 5, y + 28, 22, 4);
        cx.fillStyle = moss;
        cx.fillRect(x + 5, y + 29, 3, 2); cx.fillRect(x + 10, y + 30, 3, 2); cx.fillRect(x + 16, y + 28, 3, 2); cx.fillRect(x + 23, y + 30, 3, 2);
        // Ventana arqueada
        cx.fillStyle = '#2A1E12'; cx.fillRect(x + 14, y + 11, 4, 6);
        cx.fillStyle = '#4A3520'; cx.fillRect(x + 15, y + 12, 2, 4);
        // Puerta
        if (!towerOpen) {
          cx.fillStyle = '#3A2010'; cx.fillRect(x + 11, y + 20, 10, 12);
          cx.fillStyle = '#4A3018'; cx.fillRect(x + 12, y + 21, 8, 11);
          cx.fillStyle = '#5A4028'; cx.fillRect(x + 13, y + 22, 6, 9);
          cx.fillStyle = '#484858'; cx.fillRect(x + 11, y + 24, 10, 1); cx.fillRect(x + 11, y + 28, 10, 1);
          cx.fillStyle = '#C8A830'; cx.fillRect(x + 15, y + 25, 2, 3); // cerradura
        } else {
          const tgl = Math.sin(fr * 0.08) * 0.2 + 0.8;
          cx.globalAlpha = tgl;
          cx.fillStyle = '#F8E8A0'; cx.fillRect(x + 11, y + 20, 10, 12);
          cx.fillStyle = '#F8F0C0'; cx.fillRect(x + 13, y + 22, 6, 10);
          cx.globalAlpha = 1;
          if (fr % 20 < 10) { cx.fillStyle = '#F8E830'; cx.fillRect(x + 13 + Math.sin(fr * 0.1) * 3, y + 8, 2, 2); }
        }
        // Bandera en lo alto
        cx.fillStyle = '#8A6A30'; cx.fillRect(x + 15, y - 6, 2, 8);
        cx.fillStyle = '#C83030'; cx.fillRect(x + 17, y - 5, 8, 5);
        cx.fillStyle = '#E05050'; cx.fillRect(x + 17, y - 5, 8, 2);
        cx.fillStyle = moss; cx.fillRect(x + 4, y - 1, 3, 1);
        break;
      }

    case 13: // Muro de castillo exterior
      {
        // Musgo adaptativo al bioma (verde al sur, blanco al norte)
        const snow = Math.max(0, Math.min(1, (68 - r) / 46));
        const moss = lerpColor('#3A6838', '#E2ECE6', snow);
        const mossD = lerpColor('#2E5236', '#D2DED2', snow);
        // Base de piedra gris
        cx.fillStyle = '#606878';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#707888';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);

        // Bloques de piedra tallada
        cx.fillStyle = '#687080';
        cx.fillRect(x + 1, y + 1, 14, 10);
        cx.fillRect(x + 17, y + 1, 14, 10);
        cx.fillRect(x + 9, y + 13, 14, 10);
        cx.fillRect(x + 1, y + 13, 7, 10);
        cx.fillRect(x + 24, y + 13, 7, 10);
        cx.fillRect(x + 1, y + 25, 14, 6);
        cx.fillRect(x + 17, y + 25, 14, 6);

        // Juntas entre piedras
        cx.fillStyle = '#505868';
        cx.fillRect(x + 15, y, 1, T);
        cx.fillRect(x, y + 12, T, 1);
        cx.fillRect(x, y + 24, T, 1);
        cx.fillRect(x + 8, y + 12, 1, 12);
        cx.fillRect(x + 23, y + 12, 1, 12);

        // Textura de piedra
        cx.fillStyle = '#788090';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 4, y + 4, 3, 2);
          cx.fillRect(x + 20, y + 16, 3, 2);
        }
        if ((c + r) % 3 === 0) {
          cx.fillRect(x + 12, y + 6, 2, 2);
          cx.fillRect(x + 6, y + 18, 2, 3);
        }

        // Musgo en juntas
        if ((c * 5 + r * 3) % 7 === 0) {
          cx.fillStyle = moss;
          cx.fillRect(x + 14, y + 12, 3, 2);
        }
        if ((c * 3 + r * 7) % 9 === 0) {
          cx.fillStyle = moss;
          cx.fillRect(x + 8, y + 23, 4, 2);
        }

        // Borde superior con almenas si no hay muro arriba
        const tUp = wMap[r - 1]?.[c];
        if (tUp !== 13 && tUp !== 11) {
          cx.fillStyle = '#586070';
          cx.fillRect(x, y, T, 3);
          cx.fillStyle = '#707888';
          cx.fillRect(x + 2, y, 4, 5);
          cx.fillRect(x + 10, y, 4, 5);
          cx.fillRect(x + 18, y, 4, 5);
          cx.fillRect(x + 26, y, 4, 5);
          // Sombra de almenas
          cx.fillStyle = 'rgba(0,0,0,.15)';
          cx.fillRect(x + 6, y + 3, 4, 2);
          cx.fillRect(x + 14, y + 3, 4, 2);
          cx.fillRect(x + 22, y + 3, 4, 2);
        }

        // Antorcha ocasional
        if ((c * 7 + r * 5) % 11 === 0) {
          cx.fillStyle = '#5A4020';
          cx.fillRect(x + 14, y + 8, 4, 8);
          cx.fillStyle = '#6A5030';
          cx.fillRect(x + 13, y + 7, 6, 3);
          const flk = Math.sin(fr * 0.15 + c) * 2;
          cx.fillStyle = '#E88030';
          cx.fillRect(x + 13, y + 4 + flk, 6, 4);
          cx.fillStyle = '#F8A050';
          cx.fillRect(x + 14, y + 3 + flk, 4, 3);
          cx.fillStyle = '#F8D080';
          cx.fillRect(x + 15, y + 2 + flk, 2, 2);
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 10, 10, 8);
          cx.globalAlpha = 1;
        }

        // Estandarte ocasional
        if ((c * 3 + r * 11) % 13 === 0) {
          cx.fillStyle = '#C8A830';
          cx.fillRect(x + 12, y + 6, 8, 2);
          cx.fillStyle = '#A02020';
          cx.fillRect(x + 13, y + 8, 6, 12);
          cx.fillStyle = '#B83030';
          cx.fillRect(x + 14, y + 10, 4, 8);
          cx.fillStyle = '#E8C830';
          cx.fillRect(x + 15, y + 12, 2, 3);
          cx.fillStyle = '#A02020';
          cx.fillRect(x + 14, y + 20, 2, 2);
          cx.fillRect(x + 16, y + 20, 2, 2);
          cx.fillRect(x + 15, y + 22, 2, 1);
        }
      }
      break;
  } // fin switch
} // fin dTileW
// ============================================================
// BLOQUE 8: TILES DE CUEVA Y CASTILLO (dTileC)
// ============================================================

function dTileC(c, r, map) {
  const x = c * T - cam.x,
    y = r * T - cam.y;
  if (x < -T || x > 640 || y < -T || y > 480) return;
  const t = map[r]?.[c];
  if (t === undefined) return;

  // Detectar vecinos para bordes naturales
  const tUp = map[r - 1]?.[c];
  const tDn = map[r + 1]?.[c];
  const tLf = map[r]?.[c - 1];
  const tRt = map[r]?.[c + 1];
  const isFloor = t === 20 || t === 26 || t === 27 || t === 28;

  switch (t) {
    case 20: // Suelo de cueva - piedra natural con variación
      {
        // Color base con variación por posición
        const v = (c * 7 + r * 13) % 3;
        const bases = ['#3D4455', '#3A4050', '#383E4C'];
        cx.fillStyle = bases[v];
        cx.fillRect(x, y, T, T);

        // Textura de piedra irregular
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 2, y + 2, 14, 14);
          cx.fillRect(x + 18, y + 18, 12, 12);
        } else {
          cx.fillRect(x + 4, y + 16, 12, 14);
          cx.fillRect(x + 20, y + 2, 10, 12);
        }

        // Grietas finas
        cx.fillStyle = '#2E3440';
        if ((c * 3 + r * 5) % 7 === 0) {
          cx.fillRect(x + 8, y + 4, 1, 10);
          cx.fillRect(x + 8, y + 4, 6, 1);
        }
        if ((c * 5 + r * 3) % 11 === 0) {
          cx.fillRect(x + 20, y + 18, 1, 8);
          cx.fillRect(x + 16, y + 18, 5, 1);
        }

        // Piedras pequeñas sueltas
        cx.fillStyle = '#4A5268';
        if ((c * 11 + r * 7) % 9 === 0) {
          cx.fillRect(x + 6, y + 24, 3, 2);
          cx.fillRect(x + 22, y + 8, 2, 2);
        }
        if ((c * 7 + r * 11) % 13 === 0) {
          cx.fillRect(x + 14, y + 26, 4, 2);
        }

        // Charcos de agua ocasionales
        if ((c * 13 + r * 17) % 23 === 0) {
          cx.fillStyle = '#2A3A5A';
          cx.fillRect(x + 8, y + 12, 10, 6);
          cx.fillStyle = '#3A4A6A';
          cx.fillRect(x + 10, y + 14, 6, 2);
          cx.fillStyle = 'rgba(100,160,220,.15)';
          cx.fillRect(x + 10, y + 13, 4, 1);
        }

        // Bordes suaves hacia paredes
        if (tUp === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y, T, 4);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 2, y + 2, T - 4, 3);
        }
        if (tDn === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y + 28, T, 4);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 2, y + 27, T - 4, 3);
        }
        if (tLf === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x, y, 4, T);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 1, y + 2, 4, T - 4);
        }
        if (tRt === 21) {
          cx.fillStyle = '#2A3040';
          cx.fillRect(x + 28, y, 4, T);
          cx.fillStyle = '#323844';
          cx.fillRect(x + 27, y + 2, 4, T - 4);
        }

        // Musgo en esquinas contra paredes
        if (tUp === 21 && tLf === 21) {
          cx.fillStyle = '#2A5038';
          cx.fillRect(x + 1, y + 1, 5, 3);
          cx.fillRect(x + 1, y + 1, 3, 5);
        }
        if (tUp === 21 && tRt === 21) {
          cx.fillStyle = '#2A5038';
          cx.fillRect(x + 26, y + 1, 5, 3);
          cx.fillRect(x + 28, y + 1, 3, 5);
        }
      }
      break;

    case 21: // Pared de cueva - roca sólida con profundidad
      {
        // Base oscura
        cx.fillStyle = '#1A2030';
        cx.fillRect(x, y, T, T);

        // Capas de roca con variación
        const rv = (c * 11 + r * 7) % 4;
        if (rv === 0) {
          cx.fillStyle = '#222838';
          cx.fillRect(x + 1, y + 1, 15, 15);
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 17, y + 17, 14, 14);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 2, y + 18, 12, 13);
          cx.fillStyle = '#212838';
          cx.fillRect(x + 18, y + 1, 13, 14);
        } else if (rv === 1) {
          cx.fillStyle = '#232A3A';
          cx.fillRect(x + 2, y + 2, 20, 12);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 1, y + 16, 18, 15);
          cx.fillStyle = '#212838';
          cx.fillRect(x + 20, y + 14, 11, 17);
        } else if (rv === 2) {
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 1, y + 1, 12, 20);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 14, y + 2, 17, 13);
          cx.fillStyle = '#222838';
          cx.fillRect(x + 3, y + 22, 26, 9);
        } else {
          cx.fillStyle = '#212838';
          cx.fillRect(x + 2, y + 1, 28, 14);
          cx.fillStyle = '#1E2535';
          cx.fillRect(x + 1, y + 16, 14, 15);
          cx.fillStyle = '#252C3C';
          cx.fillRect(x + 16, y + 18, 15, 13);
        }

        // Juntas entre piedras
        cx.fillStyle = '#151C28';
        cx.fillRect(x + 15, y, 1, T);
        cx.fillRect(x, y + 15, T, 1);
        if (rv % 2 === 0) {
          cx.fillRect(x + 8, y + 8, 1, 8);
          cx.fillRect(x + 22, y + 20, 1, 6);
        }

        // Textura de roca (puntos)
        cx.fillStyle = '#2A3248';
        if ((c + r) % 3 === 0) {
          cx.fillRect(x + 6, y + 6, 2, 2);
          cx.fillRect(x + 22, y + 22, 2, 2);
        }
        if ((c + r) % 5 === 0) {
          cx.fillRect(x + 18, y + 8, 2, 2);
          cx.fillRect(x + 8, y + 24, 2, 2);
        }

        // Brillo sutil en bordes superiores
        if (tUp !== 21) {
          cx.fillStyle = '#303848';
          cx.fillRect(x + 2, y, T - 4, 2);
          cx.fillStyle = '#384058';
          cx.fillRect(x + 4, y, T - 8, 1);
        }

        // Musgo/humedad en paredes que tocan suelo
        const touchesFloor =
          (tUp !== 21 && tUp !== undefined) ||
          (tDn !== 21 && tDn !== undefined) ||
          (tLf !== 21 && tLf !== undefined) ||
          (tRt !== 21 && tRt !== undefined);
        if (touchesFloor && (c * 3 + r * 7) % 5 === 0) {
          cx.fillStyle = '#2A5040';
          if (tDn !== 21 && tDn !== undefined)
            cx.fillRect(x + 4 + ((c * 7) % 10), y + 28, 6, 3);
          if (tRt !== 21 && tRt !== undefined)
            cx.fillRect(x + 28, y + 6 + ((r * 5) % 8), 3, 5);
        }

        // Antorcha decorativa
        if ((c * 5 + r * 3) % 13 === 0 && touchesFloor) {
          // Soporte de hierro
          cx.fillStyle = '#484848';
          cx.fillRect(x + 14, y + 8, 4, 2);
          cx.fillStyle = '#585858';
          cx.fillRect(x + 13, y + 6, 6, 3);
          // Antorcha de madera
          cx.fillStyle = '#5A4020';
          cx.fillRect(x + 15, y + 10, 2, 8);
          cx.fillStyle = '#6A5030';
          cx.fillRect(x + 14, y + 9, 4, 2);
          // Llama animada
          const flk = Math.sin(fr * 0.15 + c + r) * 2;
          cx.fillStyle = '#E07020';
          cx.fillRect(x + 13, y + 4 + flk, 6, 5);
          cx.fillStyle = '#F09030';
          cx.fillRect(x + 14, y + 3 + flk, 4, 4);
          cx.fillStyle = '#F8B850';
          cx.fillRect(x + 15, y + 2 + flk, 2, 3);
          cx.fillStyle = '#F8D880';
          cx.fillRect(x + 15, y + 1 + flk, 2, 2);
          // Halo de luz
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 10, 14, 12);
          cx.globalAlpha = 1;
          // Chispas
          if (fr % 30 < 15) {
            cx.fillStyle = '#F8C060';
            cx.fillRect(x + 12 + Math.sin(fr * 0.2) * 3, y + flk, 1, 1);
            cx.fillRect(x + 18 + Math.sin(fr * 0.3) * 2, y + 2 + flk, 1, 1);
          }
        }

        // Estandarte ocasional
        if ((c * 7 + r * 2) % 17 === 0 && touchesFloor) {
          cx.fillStyle = '#484848';
          cx.fillRect(x + 12, y + 6, 8, 2);
          cx.fillStyle = '#6A2020';
          cx.fillRect(x + 13, y + 8, 6, 12);
          cx.fillStyle = '#7A3030';
          cx.fillRect(x + 14, y + 10, 4, 8);
          // Emblema
          cx.fillStyle = '#C8A830';
          cx.fillRect(x + 15, y + 12, 2, 3);
          // Punta
          cx.fillStyle = '#6A2020';
          cx.fillRect(x + 14, y + 20, 2, 2);
          cx.fillRect(x + 16, y + 20, 2, 2);
          cx.fillRect(x + 15, y + 22, 2, 1);
        }
      }
      break;

    case 22: // Cristal decorativo cueva - gemas brillantes
      {
        cx.fillStyle = '#3D4455';
        cx.fillRect(x, y, T, T);
        // Textura suelo
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, 14, 14);

        const gc = ['#40E8A8', '#E040A8', '#40A8F8', '#E8A840', '#A060F0'][
          (c + r) % 5
        ];
        const gcl = ['#80F8D0', '#F880C8', '#80D0F8', '#F8C878', '#C090F8'][
          (c + r) % 5
        ];
        const gl = Math.sin(fr * 0.08 + c + r) * 0.3 + 0.7;
        cx.globalAlpha = gl;

        // Base de cristal (roca)
        cx.fillStyle = '#404858';
        cx.fillRect(x + 8, y + 22, 16, 6);
        cx.fillStyle = '#485060';
        cx.fillRect(x + 10, y + 20, 12, 4);

        // Cristal principal
        cx.fillStyle = gc;
        cx.fillRect(x + 12, y + 6, 8, 16);
        cx.fillRect(x + 10, y + 10, 12, 8);
        // Interior brillante
        cx.fillStyle = gcl;
        cx.fillRect(x + 14, y + 8, 4, 12);
        cx.fillRect(x + 12, y + 12, 8, 4);

        // Cristales pequeños al lado
        cx.fillStyle = gc;
        cx.fillRect(x + 6, y + 14, 4, 8);
        cx.fillRect(x + 22, y + 12, 4, 10);
        cx.fillStyle = gcl;
        cx.fillRect(x + 7, y + 16, 2, 4);
        cx.fillRect(x + 23, y + 14, 2, 6);

        // Brillo estrella
        cx.fillStyle = '#fff';
        cx.fillRect(x + 14, y + 10, 1, 3);
        cx.fillRect(x + 13, y + 11, 3, 1);

        // Reflejo
        cx.fillStyle = 'rgba(255,255,255,.25)';
        cx.fillRect(x + 12, y + 8, 3, 8);
        cx.globalAlpha = 1;

        // Destellos animados
        if (fr % 20 < 10) {
          cx.globalAlpha = 0.7;
          cx.fillStyle = '#F8F8F8';
          cx.fillRect(x + 6 + Math.sin(fr * 0.1) * 2, y + 4, 2, 2);
          cx.fillRect(x + 24 + Math.sin(fr * 0.12) * 2, y + 18, 2, 2);
          cx.globalAlpha = 1;
        }

        // Halo de color
        cx.globalAlpha = 0.04;
        cx.fillStyle = gc;
      pixelGlow(x + 16, y + 16, 14, 12);
        cx.globalAlpha = 1;
      }
      break;

    case 23: // Agua subterránea - lago oscuro profundo
      {
        const w = Math.sin(fr * 0.04 + c * 0.7 + r * 0.5);
        cx.fillStyle = w > 0 ? '#162848' : '#1E3458';
        cx.fillRect(x, y, T, T);

        // Profundidad
        cx.fillStyle = '#0E1830';
        cx.fillRect(x + 4, y + 4, T - 8, T - 8);
        cx.fillStyle = '#122040';
        cx.fillRect(x + 8, y + 8, T - 16, T - 16);

        // Ondas suaves
        cx.fillStyle = '#2A4870';
        const w1 = Math.sin(fr * 0.05 + c * 1.5) * 4;
        const w2 = Math.sin(fr * 0.04 + c * 2) * 3;
        cx.fillRect(x + w1 + 8, y + 8, 14, 1);
        cx.fillRect(x + w2 + 6, y + 16, 12, 1);
        cx.fillRect(x + w1 + 10, y + 24, 10, 1);

        // Reflejos brillantes
        cx.fillStyle = 'rgba(80,160,255,.15)';
        cx.fillRect(x + Math.sin(fr * 0.07 + c) * 5 + 10, y + 12, 6, 1);
        cx.fillRect(x + Math.sin(fr * 0.06 + r) * 4 + 8, y + 20, 8, 1);

        // Espuma en bordes
        if (tUp !== 23 && tUp !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y, T, 3);
          cx.fillStyle = '#4A6888';
          cx.fillRect(x + 4, y, T - 8, 2);
          cx.fillStyle = 'rgba(100,180,230,.2)';
          cx.fillRect(x + 6 + Math.sin(fr * 0.08 + c) * 3, y + 1, 8, 1);
        }
        if (tDn !== 23 && tDn !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y + 29, T, 3);
          cx.fillStyle = '#4A6888';
          cx.fillRect(x + 4, y + 30, T - 8, 2);
        }
        if (tLf !== 23 && tLf !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x, y, 3, T);
        }
        if (tRt !== 23 && tRt !== undefined) {
          cx.fillStyle = '#3A5878';
          cx.fillRect(x + 29, y, 3, T);
        }

        // Burbujas ocasionales
        if ((c * 7 + r * 11) % 13 === 0) {
          const by2 = Math.sin(fr * 0.06 + c) * 3;
          cx.globalAlpha = 0.4;
          cx.fillStyle = '#5888B8';
          cx.fillRect(x + 14 + by2, y + 10, 3, 3);
          cx.fillRect(x + 20 + by2, y + 18, 2, 2);
          cx.globalAlpha = 1;
        }
      }
      break;

    case 24: // Lava - magma ardiente pulsante
      {
        // Roca oscura alrededor
        cx.fillStyle = '#2A1810';
        cx.fillRect(x, y, T, T);

        // Lava interior
        const lp = Math.sin(fr * 0.08 + c * 0.5 + r * 0.3);
        cx.fillStyle = lp > 0 ? '#C02818' : '#D83820';
        cx.fillRect(x + 2, y + 2, T - 4, T - 4);
        cx.fillStyle = '#E04830';
        cx.fillRect(x + 4, y + 4, T - 8, T - 8);
        cx.fillStyle = '#E86040';
        cx.fillRect(x + 6, y + 6, T - 12, T - 12);

        // Venas de magma brillante
        cx.fillStyle = '#F08050';
        const vx = Math.sin(fr * 0.1 + c) * 3;
        cx.fillRect(x + 10 + vx, y + 8, 4, 4);
        cx.fillRect(x + 16 + vx, y + 18, 5, 3);
        cx.fillRect(x + 8, y + 14 + vx, 3, 4);

        // Centro incandescente
        cx.fillStyle = '#F8A070';
        cx.fillRect(x + 12, y + 12, 8, 8);
        cx.fillStyle = '#F8C098';
        cx.fillRect(x + 14, y + 14, 4, 4);

        // Burbujas de lava
        if (fr % 16 < 8) {
          const bx = Math.sin(fr * 0.12 + c) * 4;
          cx.fillStyle = '#F8B060';
          cx.fillRect(x + 10 + bx, y + 8, 4, 3);
          cx.fillStyle = '#F8D088';
          cx.fillRect(x + 11 + bx, y + 7, 2, 2);
        }
        if (fr % 24 < 12) {
          cx.fillStyle = '#F8A050';
          cx.fillRect(x + 20, y + 20 + Math.sin(fr * 0.1) * 2, 3, 3);
        }

        // Corteza oscura en bordes
        cx.fillStyle = '#801808';
        cx.fillRect(x + 2, y + 2, T - 4, 2);
        cx.fillRect(x + 2, y + T - 4, T - 4, 2);
        cx.fillRect(x + 2, y + 2, 2, T - 4);
        cx.fillRect(x + T - 4, y + 2, 2, T - 4);

        // Grietas de calor en corteza
        cx.fillStyle = '#D04020';
        if ((c + r) % 2 === 0) {
          cx.fillRect(x + 3, y + 8, 1, 6);
          cx.fillRect(x + T - 4, y + 12, 1, 8);
        }

        // Calor emanando hacia arriba
        if (tUp !== 24) {
          cx.globalAlpha = 0.06;
          cx.fillStyle = '#F88040';
          cx.fillRect(x + 6, y - 4 + Math.sin(fr * 0.06 + c) * 2, 6, 8);
          cx.fillRect(x + 18, y - 2 + Math.sin(fr * 0.08 + c) * 3, 4, 6);
          cx.globalAlpha = 1;
        }

        // Brillo pulsante
        cx.globalAlpha = 0.04 + Math.sin(fr * 0.1 + c + r) * 0.02;
        cx.fillStyle = '#F8A060';
        cx.fillRect(x, y, T, T);
        cx.globalAlpha = 1;
      }
      break;

    case 26: // Vegetación de cueva - ecosistema subterráneo
      {
        // Suelo base
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#434B5C';
        if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, 14, 14);

        // Musgo en suelo
        cx.fillStyle = '#1A4030';
        cx.fillRect(x, y + 24, T, 8);
        cx.fillStyle = '#204838';
        cx.fillRect(x + 2, y + 26, T - 4, 4);

        // Tallos de plantas bioluminiscentes
        cx.fillStyle = '#1A5840';
        cx.fillRect(x + 4, y + 6, 2, 20);
        cx.fillRect(x + 14, y + 4, 2, 22);
        cx.fillRect(x + 24, y + 8, 2, 18);
        // Hojas
        cx.fillStyle = '#28704A';
        cx.fillRect(x + 2, y + 10, 4, 2);
        cx.fillRect(x + 5, y + 14, 4, 2);
        cx.fillRect(x + 12, y + 8, 4, 2);
        cx.fillRect(x + 15, y + 12, 4, 2);
        cx.fillRect(x + 22, y + 12, 4, 2);
        cx.fillRect(x + 25, y + 16, 4, 2);

        // Puntas brillantes bioluminiscentes
        const glow = Math.sin(fr * 0.06 + c + r) * 0.3 + 0.7;
        cx.globalAlpha = glow;
        cx.fillStyle = '#50F8A0';
        cx.fillRect(x + 4, y + 4, 2, 3);
        cx.fillRect(x + 14, y + 2, 2, 3);
        cx.fillRect(x + 24, y + 6, 2, 3);
        cx.globalAlpha = 1;

        // Hongos grandes
        const hc = ['#8860B0', '#6898C0', '#C07850'][(c * 3 + r) % 3];
        const hcl = ['#A880D0', '#88B8E0', '#D89870'][(c * 3 + r) % 3];
        // Hongo 1
        cx.fillStyle = '#C8B898';
        cx.fillRect(x + 8, y + 20, 2, 6); // Tallo
        cx.fillStyle = hc;
        cx.fillRect(x + 5, y + 16, 8, 5); // Sombrero
        cx.fillStyle = hcl;
        cx.fillRect(x + 6, y + 17, 6, 3);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + 6, y + 17, 3, 1);
        // Hongo 2
        cx.fillStyle = '#C8B898';
        cx.fillRect(x + 21, y + 18, 2, 8);
        cx.fillStyle = hc;
        cx.fillRect(x + 18, y + 14, 8, 5);
        cx.fillStyle = hcl;
        cx.fillRect(x + 19, y + 15, 6, 3);
        cx.fillStyle = 'rgba(255,255,255,.2)';
        cx.fillRect(x + 19, y + 15, 3, 1);

        // Esporas flotantes
        if ((c + r) % 3 === 0) {
          cx.globalAlpha = 0.3 + Math.sin(fr * 0.04 + c) * 0.15;
          cx.fillStyle = '#80F8C0';
          cx.fillRect(
            x + 10 + Math.sin(fr * 0.05 + c) * 3,
            y + 6 + Math.sin(fr * 0.04 + r) * 2,
            2,
            2
          );
          cx.fillRect(
            x + 20 + Math.sin(fr * 0.07 + r) * 2,
            y + 4 + Math.sin(fr * 0.06 + c) * 3,
            1,
            1
          );
          cx.globalAlpha = 1;
        }

        // Halo bioluminiscente sutil
        cx.globalAlpha = 0.03;
        cx.fillStyle = '#50F8A0';
      pixelGlow(x + 16, y + 12, 12, 10);
        cx.globalAlpha = 1;
      }
      break;

    case 27: // Salida de cueva - luz del exterior
      {
        // Marco de roca
        cx.fillStyle = '#1A2030';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#252C3C';
        cx.fillRect(x + 2, y + 1, T - 4, 3);
        cx.fillRect(x + 2, y + T - 3, T - 4, 2);
        cx.fillRect(x, y + 2, 3, T - 4);
        cx.fillRect(x + T - 3, y + 2, 3, T - 4);

        // Arco de piedra superior
        cx.fillStyle = '#303848';
        cx.fillRect(x + 2, y, T - 4, 4);
        cx.fillStyle = '#384058';
        cx.fillRect(x + 4, y + 1, T - 8, 2);

        // Interior luminoso (gradiente simulado)
        cx.fillStyle = '#708090';
        cx.fillRect(x + 4, y + 5, T - 8, T - 6);
        cx.fillStyle = '#90A0B0';
        cx.fillRect(x + 6, y + 7, T - 12, T - 8);
        cx.fillStyle = '#B0C0D0';
        cx.fillRect(x + 8, y + 9, T - 16, T - 10);
        cx.fillStyle = '#D0D8E0';
        cx.fillRect(x + 10, y + 11, T - 20, T - 14);

        // Rayos de luz
        cx.globalAlpha = 0.15;
        cx.fillStyle = '#F8F8E0';
        cx.fillRect(x + 10, y + 4, 4, T - 6);
        cx.fillRect(x + 18, y + 6, 3, T - 8);
        cx.globalAlpha = 1;

        // Flecha animada
        const ab = Math.sin(fr * 0.15) * 2;
        cx.fillStyle = '#F8F8F8';
        cx.fillRect(x + 13, y + 14 + ab, 6, 3);
        cx.fillRect(x + 15, y + 12 + ab, 2, 2);

        // Musgo en los bordes del arco
        cx.fillStyle = '#2A5038';
        cx.fillRect(x + 2, y + 4, 4, 3);
        cx.fillRect(x + T - 6, y + 5, 4, 3);

        // Partículas de polvo en la luz
        if (fr % 20 < 10) {
          cx.globalAlpha = 0.3;
          cx.fillStyle = '#F8F0D0';
          cx.fillRect(x + 12 + Math.sin(fr * 0.08) * 3, y + 10, 1, 1);
          cx.fillRect(x + 18 + Math.sin(fr * 0.1) * 2, y + 16, 1, 1);
          cx.globalAlpha = 1;
        }
      }
      break;

    case 29: // Desnivel de cueva / plataforma rocosa
      {
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#2E3440';
        cx.fillRect(x, y + 14, T, 16);
        cx.fillStyle = '#525C70';
        cx.fillRect(x, y + 10, T, 6);
        cx.fillStyle = '#677288';
        if ((c + r) % 2 === 0) cx.fillRect(x + 4, y + 10, 12, 2);
        else cx.fillRect(x + 18, y + 10, 10, 2);
        cx.fillStyle = '#252B36';
        cx.fillRect(x + 7, y + 20, 2, 8);
        cx.fillRect(x + 22, y + 18, 2, 6);
      }
      break;

    case 28: // Cristal Vínculo en cueva
      {
        // Suelo base
        const v = (c * 7 + r * 13) % 3;
        cx.fillStyle = ['#3D4455', '#3A4050', '#383E4C'][v];
        cx.fillRect(x, y, T, T);

        // Base rocosa elevada
        cx.fillStyle = '#404858';
        cx.fillRect(x + 6, y + 22, 20, 6);
        cx.fillStyle = '#485060';
        cx.fillRect(x + 8, y + 20, 16, 4);
        cx.fillStyle = '#505868';
        cx.fillRect(x + 10, y + 18, 12, 4);

        // Cristal púrpura principal
        const gl = Math.sin(fr * 0.12) * 0.3 + 0.7;
        cx.globalAlpha = gl;
        cx.fillStyle = '#7028D0';
        cx.fillRect(x + 10, y + 4, 12, 16);
        cx.fillStyle = '#8838E0';
        cx.fillRect(x + 12, y + 6, 8, 12);
        cx.fillStyle = '#A050F0';
        cx.fillRect(x + 14, y + 8, 4, 8);

        // Facetas del cristal
        cx.fillStyle = '#B868F8';
        cx.fillRect(x + 14, y + 8, 2, 4);
        cx.fillStyle = '#C880F8';
        cx.fillRect(x + 15, y + 9, 1, 2);

        // Brillo estrella
        cx.fillStyle = '#E0A8F8';
        cx.fillRect(x + 14, y + 9, 1, 3);
        cx.fillRect(x + 13, y + 10, 3, 1);
        cx.fillStyle = '#fff';
        cx.fillRect(x + 14, y + 10, 1, 1);

        // Cristales menores
        cx.fillStyle = '#6020B0';
        cx.fillRect(x + 6, y + 12, 4, 8);
        cx.fillRect(x + 22, y + 10, 4, 10);
        cx.fillStyle = '#7830C0';
        cx.fillRect(x + 7, y + 14, 2, 4);
        cx.fillRect(x + 23, y + 12, 2, 6);

        cx.globalAlpha = 1;

        // Aura mágica
        cx.globalAlpha = 0.06 + Math.sin(fr * 0.08) * 0.03;
        cx.fillStyle = '#A050F0';
      pixelGlow(x + 16, y + 14, 16, 14);
        cx.globalAlpha = 1;

        // Destellos
        if (fr % 24 < 12) {
          cx.globalAlpha = 0.6;
          cx.fillStyle = '#E8D0F8';
          cx.fillRect(x + 6 + Math.sin(fr * 0.1) * 2, y + 4, 2, 2);
          cx.fillRect(x + 24 + Math.sin(fr * 0.12) * 2, y + 16, 2, 2);
          cx.globalAlpha = 1;
        }

        // Partículas flotantes ascendentes
        if (fr % 16 < 8) {
          cx.globalAlpha = 0.4;
          cx.fillStyle = '#C088F0';
          cx.fillRect(x + 10, y + 2 + Math.sin(fr * 0.05) * 2, 1, 1);
          cx.fillRect(x + 20, y + 4 + Math.sin(fr * 0.07) * 2, 1, 1);
          cx.globalAlpha = 1;
        }
      }
      break;

    // ==========================================
    // CASTILLO (sin cambios en estructura)
    // ==========================================

    case 30: // Suelo de castillo
      cx.fillStyle = '#585068';
      cx.fillRect(x, y, T, T);
      if ((c + r) % 2 === 0) {
        cx.fillStyle = '#686078';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);
        cx.fillStyle = '#706880';
        cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      } else {
        cx.fillStyle = '#504868';
        cx.fillRect(x + 1, y + 1, T - 2, T - 2);
      }
      cx.fillStyle = '#484058';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      if (c >= 14 && c <= 16) {
        cx.fillStyle = '#A02020';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#B83030';
        cx.fillRect(x + 2, y, T - 4, T);
        cx.fillStyle = '#C84040';
        cx.fillRect(x + 4, y, T - 8, T);
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 1, y, 2, T);
        cx.fillRect(x + T - 3, y, 2, T);
      }
      break;

    case 31: // Pared de castillo
      cx.fillStyle = '#383048';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#484058';
      cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      cx.fillStyle = '#504860';
      if ((c + r) % 2 === 0) {
        cx.fillRect(x + 1, y + 1, 15, 15);
        cx.fillRect(x + 17, y + 17, 14, 14);
      } else {
        cx.fillRect(x + 17, y + 1, 14, 15);
        cx.fillRect(x + 1, y + 17, 15, 14);
      }
      cx.fillStyle = '#302840';
      cx.fillRect(x + 16, y, 1, T);
      cx.fillRect(x, y + 16, T, 1);
      if ((c * 5 + r * 3) % 11 === 0) {
        cx.fillStyle = '#5A4020';
        cx.fillRect(x + 14, y + 6, 4, 10);
        cx.fillStyle = '#6A5030';
        cx.fillRect(x + 13, y + 5, 6, 3);
        const flk = Math.sin(fr * 0.15 + c) * 2;
        cx.fillStyle = '#E88030';
        cx.fillRect(x + 13, y + 2 + flk, 6, 4);
        cx.fillStyle = '#F8A050';
        cx.fillRect(x + 14, y + 1 + flk, 4, 3);
        cx.fillStyle = '#F8D080';
        cx.fillRect(x + 15, y + flk, 2, 2);
        cx.globalAlpha = 0.06;
        cx.fillStyle = '#F8A050';
      pixelGlow(x + 16, y + 8, 12, 10);
        cx.globalAlpha = 1;
      }
      if ((c * 7 + r * 2) % 13 === 0) {
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 12, y + 4, 8, 2);
        cx.fillStyle = '#A02020';
        cx.fillRect(x + 13, y + 6, 6, 14);
        cx.fillStyle = '#B03030';
        cx.fillRect(x + 14, y + 8, 4, 10);
        cx.fillStyle = '#C8A830';
        cx.fillRect(x + 15, y + 10, 2, 4);
        cx.fillStyle = '#A02020';
        cx.fillRect(x + 14, y + 20, 2, 2);
        cx.fillRect(x + 16, y + 20, 2, 2);
        cx.fillRect(x + 15, y + 22, 2, 2);
      }
      break;

    case 32: // Suelo sala del trono
      cx.fillStyle = '#685078';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#786088';
      if ((c + r) % 2 === 0) cx.fillRect(x + 2, y + 2, T - 4, T - 4);
      cx.fillStyle = '#C8A830';
      if ((c + r) % 4 === 0) {
        cx.fillRect(x + 12, y + 12, 8, 8);
        cx.fillStyle = '#D8B840';
        cx.fillRect(x + 14, y + 14, 4, 4);
      }
      cx.fillStyle = '#584868';
      cx.fillRect(x, y, T, 1);
      cx.fillRect(x, y, 1, T);
      if (c >= 14 && c <= 16) {
        cx.fillStyle = '#C82020';
        cx.fillRect(x, y, T, T);
        cx.fillStyle = '#D83030';
        cx.fillRect(x + 2, y, T - 4, T);
        cx.fillStyle = '#E84040';
        cx.fillRect(x + 4, y, T - 8, T);
        cx.fillStyle = '#E8C830';
        cx.fillRect(x + 1, y, 2, T);
        cx.fillRect(x + T - 3, y, 2, T);
        if ((c + r) % 3 === 0) {
          cx.fillStyle = '#F8D830';
          cx.fillRect(x + 12, y + 12, 8, 8);
          cx.fillStyle = '#F8E848';
          cx.fillRect(x + 14, y + 14, 4, 4);
        }
      }
      break;

    case 33: // Salida del castillo
      cx.fillStyle = '#585068';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#5A4A38';
      cx.fillRect(x, y, T, T);
      cx.fillStyle = '#6A5A48';
      cx.fillRect(x + 2, y + 1, T - 4, 3);
      cx.fillStyle = '#A0A0A0';
      cx.fillRect(x + 4, y + 6, T - 8, T - 6);
      cx.fillStyle = '#C0C0C0';
      cx.fillRect(x + 6, y + 8, T - 12, T - 8);
      cx.fillStyle = '#E0E0E0';
      cx.fillRect(x + 8, y + 10, T - 16, T - 12);
      const ab2 = Math.sin(fr * 0.15) * 2;
      cx.fillStyle = '#F8F8F8';
      cx.fillRect(x + 13, y + 14 + ab2, 6, 4);
      px(x + 15, y + 12 + ab2, 2, 2, '#F8F8F8');
      cx.fillStyle = '#C8A830';
      cx.fillRect(x + 2, y + 8, 3, 3);
      cx.fillRect(x + T - 5, y + 8, 3, 3);
      cx.globalAlpha = 0.08;
      cx.fillStyle = '#F8F8E0';
      cx.fillRect(x + 2, y + 4, T - 4, T - 4);
      cx.globalAlpha = 1;
      break;
  } // fin switch
} // fin dTileC
// ============================================================
// BLOQUE 9: GENERACIÓN DE MAPAS
// ============================================================
// === HELPERS DE CAMINOS (para el mapa grande) ===
function hPath(r, c1, c2, w = 2) {
  const start = Math.min(c1, c2),
    end = Math.max(c1, c2);
  for (let c = start; c <= end; c++)
    for (let dr = 0; dr < w; dr++) {
      const rr = r + dr;
      if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
    }
}

function vPath(c, r1, r2, w = 2) {
  const start = Math.min(r1, r2),
    end = Math.max(r1, r2);
  for (let r = start; r <= end; r++)
    for (let dc = 0; dc < w; dc++) {
      const cc = c + dc;
      if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
    }
}
function addPineForest(x0, y0, w, h, density = 0.72) {
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;

      // No tapar caminos, agua, cuevas, castillo, torre, casas, cristales
      const t = wMap[r]?.[c];
      if (t !== 0 && t !== 5) continue;

      // Borde más denso, interior con claros
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;

      const localDensity = edge ? Math.min(0.9, density + 0.15) : density;

      if (Math.random() < localDensity) {
        wMap[r][c] = 3;
      } else if (Math.random() < 0.5) {
        wMap[r][c] = 5; // hierba alta entre pinos
      } else {
        wMap[r][c] = 0; // claro
      }
    }
  }
}

function addClearing(cx0, cy0, rad = 3) {
  for (let r = cy0 - rad; r <= cy0 + rad; r++) {
    for (let c = cx0 - rad; c <= cx0 + rad; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
      const dx = c - cx0;
      const dy = r - cy0;
      if (dx * dx + dy * dy <= rad * rad) {
        if (wMap[r][c] === 3 || wMap[r][c] === 5) {
          wMap[r][c] = Math.random() < 0.25 ? 6 : 0;
        }
      }
    }
  }
}


function addTallGrassPatch(x0, y0, w, h, density = 0.75) {
  // Parche rectangular irregular de hierba alta, sin tocar caminos ni edificios.
  for (let r = y0; r < y0 + h && r < WR - 2; r++) {
    for (let c = x0; c < x0 + w && c < WC - 2; c++) {
      if (r < 2 || c < 2) continue;
      if (wMap[r][c] !== 0) continue;
      const edge = r === y0 || r === y0 + h - 1 || c === x0 || c === x0 + w - 1;
      const localDensity = edge ? density * 0.45 : density;
      if (Math.random() < localDensity) wMap[r][c] = 5;
    }
  }
}

function addWorldTallGrassPatches() {
  // Más hierba alta cerca de rutas y zonas de exploración para que los encuentros
  // no dependan solo de puntitos dispersos del generador inicial.
  [
    { x: 23, y: 124, w: 10, h: 8, d: 0.72 }, // Ruta 1
    { x: 38, y: 118, w: 10, h: 8, d: 0.72 },
    { x: 18, y: 93, w: 12, h: 8, d: 0.76 },  // Ruta 2 / Cueva Volcánica
    { x: 52, y: 91, w: 10, h: 8, d: 0.76 },
    { x: 57, y: 68, w: 12, h: 9, d: 0.78 },  // Ruta 3
    { x: 31, y: 58, w: 11, h: 8, d: 0.78 },
    { x: 34, y: 36, w: 12, h: 8, d: 0.8 },   // Ruta 4
    { x: 58, y: 34, w: 11, h: 8, d: 0.8 },
    { x: 35, y: 12, w: 10, h: 8, d: 0.82 },  // Ruta 5 norte
    { x: 47, y: 8, w: 10, h: 7, d: 0.82 },
  ].forEach((p) => addTallGrassPatch(p.x, p.y, p.w, p.h, p.d));
}


function addRouteDecorations() {
  // Bancos, faroles, estatuas y cercas en rutas principales para que el mapa no se sienta vacío.
  const decos = [
    [18, 132, 15], [30, 130, 16], [22, 124, 20], [28, 124, 20],
    [38, 116, 15], [48, 115, 16], [14, 101, 19], [17, 98, 15],
    [61, 88, 15], [63, 82, 16], [55, 78, 20], [58, 78, 20],
    [31, 65, 15], [34, 65, 16], [65, 42, 19], [68, 42, 15],
    [43, 28, 15], [46, 28, 16], [39, 12, 19], [50, 8, 15],
  ];
  decos.forEach(([c, r, t]) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && (wMap[r][c] === 0 || wMap[r][c] === 1 || wMap[r][c] === 5)) wMap[r][c] = t;
  });
}
function polishVillageLayout(sx, sy, id) {
  const set = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = t;
  };
  const fill = (x1, y1, x2, y2, t) => {
    for (let r = y1; r <= y2; r++) for (let c = x1; c <= x2; c++) set(c, r, t);
  };
  const house = (c, r) => fill(c, r, c + 1, r + 1, 4);

  // Layout base grande y ordenado: borde natural + plaza central + calles claras.
  const base = id === 'rodaje' ? 26 : 0;
  fill(sx - 4, sy - 3, sx + 12, sy + 10, base);
  fill(sx - 2, sy - 1, sx + 10, sy + 8, 1);
  fill(sx + 2, sy + 1, sx + 7, sy + 6, 1); // plaza
  // cruces principales no perfectamente rectangulares, pero ordenados
  for (let r = sy - 3; r <= sy + 10; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
  for (let c = sx - 4; c <= sx + 12; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
  // senderos escalonados/diagonales simulados
  for (let k = 0; k < 5; k++) { set(sx - 3 + k, sy + 8 - k, 1); set(sx + 11 - k, sy + 8 - k, 1); }

  // casas ordenadas fuera de la plaza
  house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);

  // entradas/salidas claras
  set(sx + 4, sy - 3, 14); set(sx + 5, sy - 3, 1);
  set(sx + 4, sy + 10, 14); set(sx + 5, sy + 10, 1);

  // bordes con desniveles/cercas, sin cerrar caminos
  for (let c = sx - 3; c <= sx + 11; c++) {
    if (c !== sx + 4 && c !== sx + 5) set(c, sy - 2, id === 'rodaje' ? 27 : 20);
    if (c !== sx + 4 && c !== sx + 5) set(c, sy + 9, id === 'rodaje' ? 27 : 20);
  }

  // Decoración por identidad de pueblo, ordenada alrededor de la plaza.
  if (id === 'pitch') {
    // Plaza inicial: pozo, entrenamiento, cajas, huellas y flores.
    set(sx + 4, sy + 3, 22);
    set(sx + 1, sy + 2, 23); set(sx + 2, sy + 2, 23);
    set(sx + 8, sy + 3, 21); set(sx + 8, sy + 4, 21);
    [[sx + 1, sy + 5], [sx + 2, sy + 6], [sx + 6, sy + 5], [sx + 7, sy + 2]].forEach(([c,r]) => set(c,r,24));
    [[sx + 1, sy + 1], [sx + 7, sy + 1], [sx + 1, sy + 7], [sx + 7, sy + 7], [sx + 3, sy + 6], [sx + 6, sy + 2]].forEach(([c,r]) => set(c,r,6));
    set(sx + 3, sy + 2, 15); set(sx + 6, sy + 2, 15);
  } else if (id === 'storyboard') {
    // Villa Storyboard/Tamara: orden en paneles alrededor de un mural central.
    fill(sx + 1, sy + 1, sx + 8, sy + 6, 1);
    set(sx + 3, sy + 2, 17); set(sx + 4, sy + 2, 17); set(sx + 5, sy + 2, 17);
    set(sx + 3, sy + 5, 17); set(sx + 4, sy + 5, 17); set(sx + 5, sy + 5, 17);
    set(sx + 6, sy + 4, 19); // estatua/figura artística
    set(sx + 2, sy + 4, 16); set(sx + 8, sy + 4, 16);
    set(sx + 1, sy + 1, 15); set(sx + 8, sy + 1, 15);
  } else if (id === 'rodaje') {
    // Cantera Rodaje: plaza de cantera ordenada con set/cámara central.
    fill(sx - 3, sy - 2, sx + 11, sy + 9, 26);
    for (let r = sy - 2; r <= sy + 9; r++) { set(sx + 4, r, 1); set(sx + 5, r, 1); }
    for (let c = sx - 3; c <= sx + 11; c++) { set(c, sy + 3, 1); set(c, sy + 4, 1); }
    house(sx - 1, sy); house(sx + 8, sy); house(sx - 1, sy + 6); house(sx + 8, sy + 6);
    set(sx + 4, sy + 2, 25); set(sx + 6, sy + 4, 25);
    set(sx + 2, sy + 2, 15); set(sx + 8, sy + 2, 15);
    set(sx + 2, sy + 6, 16); set(sx + 7, sy + 6, 16);
    // terrazas/desniveles de cantera
    for (let c = sx - 3; c <= sx + 11; c++) { if (c < sx + 3 || c > sx + 6) set(c, sy - 2, 27); if (c < sx + 2 || c > sx + 8) set(c, sy + 9, 27); }
    for (let r = sy - 1; r <= sy + 8; r++) { if (r !== sy + 3 && r !== sy + 4) { set(sx - 3, r, 27); set(sx + 11, r, 27); } }
  } else if (id === 'ultimatoma') {
    // Feria Última Toma: puestos simétricos pero plaza irregular con flores.
    set(sx + 2, sy + 2, 18); set(sx + 7, sy + 2, 18); set(sx + 2, sy + 6, 18); set(sx + 7, sy + 6, 18);
    set(sx + 4, sy + 4, 19);
    set(sx + 2, sy + 4, 15); set(sx + 7, sy + 4, 15);
    set(sx + 3, sy + 5, 16); set(sx + 6, sy + 5, 16);
    [[sx+1,sy+1],[sx+8,sy+1],[sx+1,sy+7],[sx+8,sy+7]].forEach(([c,r])=>set(c,r,6));
  } else if (id === 'montaje') {
    // Prados Montaje: mirador ordenado, frío y ceremonial.
    fill(sx + 1, sy - 1, sx + 8, sy, 26);
    set(sx + 4, sy - 2, 14); set(sx + 5, sy - 2, 1);
    set(sx + 4, sy + 3, 19); set(sx + 8, sy + 3, 19);
    set(sx + 2, sy + 2, 15); set(sx + 7, sy + 2, 15);
    set(sx + 3, sy + 6, 16); set(sx + 6, sy + 6, 16);
    set(sx + 1, sy + 2, 20); set(sx + 9, sy + 2, 20);
  }
}

function applyVillageIrregularShape(sx, sy, id) {
  const set = (c, r, t) => {
    if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = t;
  };
  // Romper rectángulo perfecto: esquinas con césped/flores y bordes menos rígidos.
  const cornerTiles = [
    [sx - 2, sy - 2], [sx - 1, sy - 2], [sx + 8, sy - 2], [sx + 9, sy - 2],
    [sx - 2, sy + 7], [sx - 1, sy + 7], [sx + 8, sy + 7], [sx + 9, sy + 7],
    [sx - 2, sy - 1], [sx + 9, sy - 1], [sx - 2, sy + 6], [sx + 9, sy + 6],
  ];
  cornerTiles.forEach(([c, r], i) => set(c, r, i % 3 === 0 ? 6 : 0));

  // Caminos escalonados secundarios: simulan diagonales sin curvas.
  for (let k = 0; k < 5; k++) {
    set(sx - 2 + k, sy + 7 - k, 1);
    if (k < 4) set(sx - 1 + k, sy + 7 - k, 1);
    set(sx + 9 - k, sy + 7 - k, 1);
  }
  // Callejón angosto entre casas superiores e inferiores.
  for (let r = sy + 1; r <= sy + 5; r++) set(sx + 4, r, 1);
  for (let c = sx + 2; c <= sx + 7; c++) set(c, sy + 3, 1);

  // Desniveles visuales: bordes elevados que rompen la planicie.
  [
    [sx - 2, sy + 1], [sx - 1, sy + 1], [sx + 8, sy + 1], [sx + 9, sy + 1],
    [sx + 1, sy + 7], [sx + 2, sy + 7], [sx + 6, sy + 7], [sx + 7, sy + 7],
  ].forEach(([c, r]) => set(c, r, 27));

  // Toques temáticos por pueblo sobre la forma irregular.
  if (id === 'pitch') {
    // Más flores normales alrededor de la plaza inicial.
    [[sx + 1, sy + 2], [sx + 6, sy + 2], [sx + 1, sy + 5], [sx + 7, sy + 5], [sx + 5, sy + 6]].forEach(([c, r]) => set(c, r, 6));
  }
  if (id === 'storyboard') {
    // Pequeño pasaje en zigzag hacia el mural.
    for (let k = 0; k < 4; k++) set(sx + 1 + k, sy + 1 + k, 1);
  }
  if (id === 'rodaje') {
    // Cantera con terrazas/desniveles rocosos más obvios.
    for (let c = sx - 3; c <= sx + 11; c++) {
      if (c < sx + 2 || c > sx + 6) set(c, sy - 3, 27);
      if (c < sx + 1 || c > sx + 8) set(c, sy + 9, 27);
    }
    for (let r = sy - 2; r <= sy + 8; r++) {
      if (r !== sy + 3) set(sx - 3, r, 27);
      if (r !== sy + 3) set(sx + 11, r, 27);
    }
  }
  if (id === 'ultimatoma') {
    // Feria con entradas diagonales y puestos alrededor.
    set(sx + 1, sy + 1, 18); set(sx + 7, sy + 1, 18);
    set(sx + 1, sy + 6, 18); set(sx + 7, sy + 6, 18);
  }
  if (id === 'montaje') {
    // Mirador escalonado al norte.
    for (let c = sx; c <= sx + 8; c++) if (c !== sx + 4 && c !== sx + 5) set(c, sy - 1, 27);
    set(sx + 1, sy + 2, 19); set(sx + 8, sy + 2, 19);
  }
}

function genWorld() {
  // Inicializar mapa con hierba y hierba alta aleatoria
  for (let r = 0; r < WR; r++) {
    wMap[r] = [];
    for (let c = 0; c < WC; c++) wMap[r][c] = Math.random() < 0.14 ? 5 : 0;
  }

  // Bordes de árboles
  for (let r = 0; r < WR; r++)
    for (let c = 0; c < WC; c++) {
      if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) wMap[r][c] = 3;
    }

  // ============================================================
  // CAMINO PRINCIPAL (Sur → Norte) - Asegurando flujo libre
  // ============================================================
  vPath(20, 130, 148);
  hPath(130, 15, 35);
  vPath(35, 115, 130);
  hPath(115, 35, 50);
  vPath(50, 98, 115);
  hPath(98, 15, 50);
  vPath(15, 100, 110);
  hPath(90, 50, 65);
  vPath(65, 77, 98);
  vPath(65, 65, 90);
  hPath(65, 30, 65);
  vPath(30, 47, 77);
  vPath(30, 35, 65);
  hPath(42, 30, 72);   // llega al corredor central (conecta la entrada de la Cueva Cristalina)
  vPath(72, 30, 50);
  hPath(35, 44, 72);
  vPath(44, 17, 47);
  vPath(44, 5, 27);
  hPath(10, 37, 44);
  vPath(37, 4, 14);
  hPath(5, 50, 60);
  // Rutas de garantia (conectividad total del mapa)
  hPath(35, 30, 44);   // une el corredor del noreste con la red principal
  hPath(82, 50, 65);   // conecta la aldea Rodaje al corredor central

  // ============================================================
  // LAGOS - Reposicionados para NO bloquear caminos
  // ============================================================
  [
    { x: 55, y: 135, w: 8, h: 6 }, // Lejos de R1
    { x: 5, y: 110, w: 7, h: 5 }, // Lejos de Cueva Volcánica
    { x: 72, y: 85, w: 6, h: 5 }, // Lejos de R3
    { x: 10, y: 55, w: 8, h: 6 }, // Lejos de R4
    { x: 60, y: 45, w: 6, h: 5 }, // Lejos de Cueva Cristalina
    { x: 10, y: 10, w: 10, h: 6 }, // Ruta 5 lateral
  ].forEach((l) => {
    for (let r = l.y; r < l.y + l.h && r < WR - 2; r++)
      for (let c = l.x; c < l.x + l.w && c < WC - 2; c++) {
        const dx = c - (l.x + l.w / 2),
          dy = r - (l.y + l.h / 2);
        if ((dx * dx) / ((l.w * l.w) / 4) + (dy * dy) / ((l.h * l.h) / 4) < 1)
          wMap[r][c] = 2;
      }
  });

  // ============================================================
  // BOSQUES FRONDOSOS (Aumentado tamaño y cantidad)
  // ============================================================
  [
    { x: 2, y: 120, w: 20, h: 25 },
    { x: 45, y: 115, w: 30, h: 30 },
    { x: 5, y: 80, w: 25, h: 30 },
    { x: 45, y: 65, w: 30, h: 40 },
    { x: 2, y: 30, w: 25, h: 40 },
    { x: 55, y: 10, w: 22, h: 50 },
  ].forEach((f) => {
    for (let r = f.y; r < f.y + f.h && r < WR - 2; r++)
      for (let c = f.x; c < f.x + f.w && c < WC - 2; c++) {
        if (wMap[r][c] === 0 || wMap[r][c] === 5)
          wMap[r][c] = Math.random() < 0.7 ? 3 : 5; // 70% bosque = muy frondoso
      }
  });

  // Aldeas, Cuevas y Castillo
  buildVillage(18, 140, 'pitch');
  buildVillage(38, 107, 'storyboard');
  buildVillage(52, 79, 'rodaje');
  buildVillage(28, 49, 'ultimatoma');
  buildVillage(42, 19, 'montaje');
  placeCave(15, 105);
  placeCave(72, 38);
  buildCastleExt(37, 7);
  buildTower(33, 8);

  // Parches adicionales: más zonas reales de hierba alta en el mapa exterior.
  addWorldTallGrassPatches();
  // Bancos, faroles, estatuas y cercas en rutas.
  addRouteDecorations();

  let cv2 = 0;
  while (cv2 < 45) {
    const c = 4 + Math.floor(Math.random() * (WC - 8));
    const r = 4 + Math.floor(Math.random() * (WR - 8));
    if (wMap[r][c] === 0) {
      wMap[r][c] = 10;
      cv2++;
    }
  }
}
function buildVillage(sx, sy, id) {
  // Área amplia de caminos
  for (let r = sy - 2; r < sy + 8; r++)
    for (let c = sx - 2; c < sx + 10; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Edificio arriba izquierda
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio arriba derecha
  for (let r = sy; r < sy + 2; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo izquierda
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx; c < sx + 2; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;
  // Edificio abajo derecha
  for (let r = sy + 5; r < sy + 7; r++)
    for (let c = sx + 6; c < sx + 8; c++)
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 4;

  // Flores decorativas
  for (let c = sx - 2; c < sx + 10; c++) {
    if (sy - 2 >= 2 && c >= 2 && c < WC - 2 && wMap[sy - 2][c] === 1)
      if (Math.random() < 0.3) wMap[sy - 2][c] = 6;
  }

  // Entradas/salidas: arco norte y salida sur clara para todos los pueblos.
  const archX = sx + 4;
  if (sy - 3 >= 2 && archX >= 2 && archX < WC - 2) wMap[sy - 3][archX] = 14;
  if (sy + 8 < WR - 2 && archX >= 2 && archX < WC - 2) wMap[sy + 8][archX] = 14;
  for (let rr = sy - 3; rr <= sy + 8; rr++) {
    if (rr >= 2 && rr < WR - 2) {
      if (wMap[rr][archX] !== 14) wMap[rr][archX] = 1;
      if (archX + 1 < WC - 2 && wMap[rr][archX + 1] !== 14) wMap[rr][archX + 1] = 1;
    }
  }

  // Forma irregular, senderos escalonados, callejones y desniveles.
  applyVillageIrregularShape(sx, sy, id);

  // Identidad visual por pueblo: forma + decoración.
  if (id === 'storyboard') {
    // Paneles de storyboard y mural abierto.
    for (let r = sy - 1; r <= sy + 7; r++)
      for (let c = sx - 1; c <= sx + 9; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 1 && (r + c) % 4 === 0) wMap[r][c] = 17;
    wMap[sy + 3][sx + 4] = 17;
    wMap[sy + 3][sx + 5] = 17;
    wMap[sy + 4][sx + 4] = 19; // estatua de criatura pintora
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 5] = 16;
    wMap[sy - 1][sx + 2] = 15;
    wMap[sy - 1][sx + 7] = 15;
  }

  if (id === 'rodaje') {
    // Cantera Rodaje: área irregular de piedra, rocas y set simbólico de rodaje.
    for (let r = sy - 4; r <= sy + 10; r++) {
      for (let c = sx - 4; c <= sx + 12; c++) {
        if (r < 2 || r >= WR - 2 || c < 2 || c >= WC - 2) continue;
        const edge = r === sy - 4 || r === sy + 10 || c === sx - 4 || c === sx + 12;
        const t = wMap[r][c];
        if (edge && t !== 4 && t !== 11 && t !== 12) wMap[r][c] = Math.random() < 0.65 ? 7 : 26;
        else if (t !== 4 && t !== 11 && t !== 12) wMap[r][c] = 26;
      }
    }
    // Caminos internos tallados en la cantera para no bloquear NPCs.
    for (let c = sx - 3; c <= sx + 11; c++) wMap[sy + 3][c] = 1;
    for (let r = sy - 3; r <= sy + 9; r++) wMap[r][sx + 4] = 1;
    // Set de rodaje simbólico y luces.
    wMap[sy + 2][sx + 4] = 25;
    wMap[sy + 4][sx + 6] = 25;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 8] = 15;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 7] = 16;
    // Reubicar visualmente algunos edificios como casetas de producción.
    for (const [bc, br] of [[sx, sy], [sx + 6, sy], [sx, sy + 5], [sx + 6, sy + 5]]) {
      if (wMap[br]?.[bc] !== undefined) wMap[br][bc] = 4;
      if (wMap[br]?.[bc + 1] !== undefined) wMap[br][bc + 1] = 4;
      if (wMap[br + 1]?.[bc] !== undefined) wMap[br + 1][bc] = 4;
      if (wMap[br + 1]?.[bc + 1] !== undefined) wMap[br + 1][bc + 1] = 4;
    }
  }

  if (id === 'ultimatoma') {
    // Feria: plaza más abierta, faroles y bancas.
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx; c <= sx + 7; c++)
        if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = (r === sy + 3 || c === sx + 4) ? 1 : 6;
    wMap[sy + 2][sx + 2] = 15;
    wMap[sy + 2][sx + 7] = 15;
    wMap[sy + 3][sx + 4] = 18;
    wMap[sy + 3][sx + 5] = 18;
    wMap[sy + 6][sx + 2] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 4][sx + 4] = 19;
  }

  if (id === 'montaje') {
    // Pueblo final: mirador frío hacia castillo, faroles y bancos.
    for (let c = sx - 1; c <= sx + 9; c++) if (wMap[sy - 1]?.[c] !== undefined) wMap[sy - 1][c] = 26;
    wMap[sy - 2][sx + 4] = 14;
    wMap[sy + 1][sx + 2] = 15;
    wMap[sy + 1][sx + 7] = 15;
    wMap[sy + 6][sx + 3] = 16;
    wMap[sy + 6][sx + 6] = 16;
    wMap[sy + 3][sx + 8] = 19; // estatua/mirador del pueblo final
    wMap[sy + 2][sx + 1] = 20;
    wMap[sy + 2][sx + 9] = 20;
  }

  // Aldea Pitch recibe una primera zona más clara y acogedora para tutorial.
  if (id === 'pitch') {
    // plaza central y caminos limpios hacia Alex/Luis/Alessandro
    for (let r = sy + 1; r <= sy + 6; r++)
      for (let c = sx - 1; c <= sx + 8; c++)
        if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 4) wMap[r][c] = 1;

    // jardineras y árboles de borde sin cerrar el paso
    const flowers = [
      [sx - 1, sy], [sx + 3, sy], [sx + 8, sy],
      [sx - 1, sy + 7], [sx + 3, sy + 7], [sx + 8, sy + 7],
      [sx + 3, sy + 2], [sx + 4, sy + 2], [sx + 3, sy + 5], [sx + 4, sy + 5],
    ];
    flowers.forEach(([c, r]) => { if (wMap[r]?.[c] === 1 || wMap[r]?.[c] === 0) wMap[r][c] = 6; });
    const trees = [[sx - 3, sy - 1], [sx + 10, sy - 1], [sx - 3, sy + 8], [sx + 10, sy + 8]];
    trees.forEach(([c, r]) => { if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 3; });

    // sendero extra hasta el cartel de salida norte
    for (let r = sy - 2; r <= sy + 7; r++)
      if (r >= 2 && r < WR - 2) {
        wMap[r][sx + 2] = 1;
        wMap[r][sx + 3] = 1;
      }
    // Plaza central, zona tutorial y elementos únicos visibles.
    wMap[sy + 3][sx + 4] = 22; // pozo de plaza
    wMap[sy + 2][sx + 1] = 21; // cajas
    wMap[sy + 6][sx + 7] = 21;
    wMap[sy + 1][sx + 3] = 23; // muñecos de entrenamiento
    wMap[sy + 1][sx + 5] = 23;
    wMap[sy + 4][sx + 2] = 24; // huellas cerca del jugador
    wMap[sy + 5][sx + 4] = 24;
    wMap[sy + 6][sx + 5] = 24;
    // cerca baja para encuadrar zona de entrenamiento sin encerrar al jugador
    wMap[sy][sx + 2] = 20;
    wMap[sy][sx + 6] = 20;
    wMap[sy + 1][sx + 7] = 20;
    wMap[sy + 2][sx + 7] = 20;
  }

  // Pasada final: ordena la aldea para que la personalidad sea clara sin verse caótica.
  polishVillageLayout(sx, sy, id);
}

function placeCave(cx2, cy) {
  // Limpiar área alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2)
        wMap[r][c] = 0;
    }
  // Entrada grande (2x2)
  wMap[cy][cx2] = 9;
  wMap[cy][cx2 + 1] = 9;
  wMap[cy - 1][cx2] = 9;
  wMap[cy - 1][cx2 + 1] = 9;
  // Rocas decorativas alrededor
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (
        r >= 2 &&
        r < WR - 2 &&
        c >= 2 &&
        c < WC - 2 &&
        wMap[r][c] === 0 &&
        Math.random() < 0.3
      )
        wMap[r][c] = 7;
    
  // Bolsillo de acceso: camino limpio en todo el entorno para poder rodear la
  // entrada sin que rocas/arboles aleatorios bloqueen el paso nunca.
  for (let r = cy - 2; r <= cy + 2; r++)
    for (let c = cx2 - 2; c <= cx2 + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] !== 2 && wMap[r][c] !== 9)
        wMap[r][c] = 1;
    }
}
}

function buildCastleExt(sx, sy) {
  // Camino de acceso
  for (let r = sy - 1; r < sy + 8; r++)
    for (let c = sx - 1; c < sx + 12; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Muros del castillo (tile 13 en vez de 4)
  for (let r = sy; r < sy + 5; r++)
    for (let c = sx; c < sx + 10; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 13;
    }

  // Puerta de entrada
  wMap[sy + 4][sx + 4] = 11;
  wMap[sy + 4][sx + 5] = 11;

  // Torres esquineras (más altas)
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx] = 13;
      wMap[r][sx + 1] = 13;
      wMap[r][sx + 8] = 13;
      wMap[r][sx + 9] = 13;
    }
  }

  // Torres traseras
  for (let r = sy - 2; r < sy; r++) {
    if (r >= 2) {
      wMap[r][sx + 3] = 13;
      wMap[r][sx + 6] = 13;
    }
  }

  // Patio interior (camino)
  for (let r = sy + 1; r < sy + 4; r++)
    for (let c = sx + 2; c < sx + 8; c++) {
      if (r < WR - 2 && c < WC - 2) wMap[r][c] = 1;
    }

  // Decoración: flores junto a la puerta
  if (sy + 5 < WR - 2) {
    wMap[sy + 5][sx + 3] = 6;
    wMap[sy + 5][sx + 6] = 6;
  }

  // Decoración: antorchas (flores en el camino de acceso)
  if (sy + 6 < WR - 2) {
    wMap[sy + 6][sx + 4] = 6;
    wMap[sy + 6][sx + 5] = 6;
  }
}

function buildTower(sx, sy) {
  // Solo colocar si está dentro del mapa
  if (sy < 2 || sy >= WR - 4 || sx < 2 || sx >= WC - 4) return;
  // Limpiar área
  for (let r = sy - 1; r <= sy + 2; r++)
    for (let c = sx - 1; c <= sx + 2; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2) wMap[r][c] = 1;
    }
  // Montañas alrededor
  for (let r = sy - 2; r <= sy + 3; r++)
    for (let c = sx - 2; c <= sx + 3; c++) {
      if (r >= 2 && r < WR - 2 && c >= 2 && c < WC - 2 && wMap[r][c] === 0)
        wMap[r][c] = 7;
    }
  // Puerta de la torre
  wMap[sy + 1][sx] = 12;
  wMap[sy + 1][sx + 1] = 12;
}

// === GENERACIÓN DE CUEVAS ===
function genCave(map, cols, rows) {
  // Todo paredes inicialmente
  for (let r = 0; r < rows; r++) {
    map[r] = [];
    for (let c = 0; c < cols; c++) map[r][c] = 21;
  }

  // === TÚNEL PRINCIPAL VERTICAL (3 tiles de ancho) ===
  const midC = Math.floor(cols / 2);
  for (let r = 1; r < rows - 1; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALAS LATERALES (3 a la izquierda, 3 a la derecha) ===
  const salas = [
    { x: 3, y: 4, w: 6, h: 4 },
    { x: 3, y: 11, w: 6, h: 4 },
    { x: 3, y: 18, w: 6, h: 4 },
    { x: cols - 9, y: 4, w: 6, h: 4 },
    { x: cols - 9, y: 11, w: 6, h: 4 },
    { x: cols - 9, y: 18, w: 6, h: 4 },
  ];

  salas.forEach((s) => {
    // Tallar sala
    for (let r = s.y; r < s.y + s.h && r < rows - 1; r++) {
      for (let c = s.x; c < s.x + s.w && c < cols - 1; c++) {
        if (r > 0 && c > 0) map[r][c] = 20;
      }
    }
    // Conectar sala con túnel central
    const conY = s.y + Math.floor(s.h / 2);
    const start = Math.min(s.x + s.w, midC);
    const end = Math.max(s.x, midC);
    for (let c = start; c <= end; c++) {
      if (c > 0 && c < cols - 1) map[conY][c] = 20;
    }
  });

  // === ENTRADA (arriba) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = 1; r <= 3; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }

  // === SALIDA (abajo) ===
  // 3 tiles de ancho, 3 tiles de alto
  for (let r = rows - 4; r <= rows - 2; r++) {
    map[r][midC - 1] = 20;
    map[r][midC] = 20;
    map[r][midC + 1] = 20;
  }
  // Marcar tiles de salida
  map[rows - 2][midC - 1] = 27;
  map[rows - 2][midC] = 27;
  map[rows - 2][midC + 1] = 27;

  // === DECORACIÓN: Vegetación en bordes ===
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (map[r][c] !== 20) continue;
      let nearWall = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (map[r + dr]?.[c + dc] === 21) nearWall = true;
        }
      if (nearWall && Math.random() < 0.08) map[r][c] = 26;
    }
  }

  // === DESNIVELES DE CUEVA: plataformas rocosas en bordes de salas ===
  salas.forEach((s) => {
    for (let c = s.x + 1; c < s.x + s.w - 1; c++) {
      if (map[s.y]?.[c] === 20 && (c + s.y) % 2 === 0) map[s.y][c] = 29;
      const rr = s.y + s.h - 1;
      if (map[rr]?.[c] === 20 && (c + rr) % 3 === 0) map[rr][c] = 29;
    }
  });

  // === DECORACIÓN: Cristales decorativos en salas ===
  salas.forEach((s) => {
    if (Math.random() < 0.6) {
      const cc = s.x + 1 + Math.floor(Math.random() * (s.w - 2));
      const cr = s.y + 1 + Math.floor(Math.random() * (s.h - 2));
      if (map[cr][cc] === 20) map[cr][cc] = 22;
    }
  });

  // === LAVA (solo en cuevas con índice impar - Cueva Volcánica) ===
  // Pequeño charco en una sala
  if (Math.random() < 0.7) {
    const lavaSala = salas[Math.floor(Math.random() * salas.length)];
    const lx = lavaSala.x + 1;
    const ly = lavaSala.y + 1;
    map[ly][lx] = 24;
    map[ly][lx + 1] = 24;
  }

  // === AGUA SUBTERRÁNEA ===
  if (Math.random() < 0.5) {
    const aguaSala = salas[Math.floor(Math.random() * salas.length)];
    const ax = aguaSala.x + 1;
    const ay = aguaSala.y + 1;
    map[ay][ax] = 23;
    map[ay][ax + 1] = 23;
  }

  // === CRISTALES VÍNCULO (capturables) ===
  let cp = 0;
  let attempts = 0;
  while (cp < 5 && attempts < 100) {
    const c = 2 + Math.floor(Math.random() * (cols - 4));
    const r = 2 + Math.floor(Math.random() * (rows - 4));
    if (map[r][c] === 20) {
      map[r][c] = 28;
      cp++;
    }
    attempts++;
  }
}


function addOloSecretChamber(map) {
  // Cámara oculta de Mr. Olo-Man en Cueva Volcánica.
  // La sala ya existe tras la pared; la entrada secreta se abre desde (19,24) hacia la izquierda.
  for (let r = 22; r <= 27; r++) {
    for (let c = 4; c <= 10; c++) map[r][c] = 20;
  }
  for (let c = 11; c <= 17; c++) map[24][c] = 20;
  map[24][18] = 21; // pared secreta cerrada
  map[23][18] = 21;
  map[25][18] = 21;
}

function hasTwoActiveDragons() {
  return G.party.filter((c) => c && c.tp === 'dragon' && c.hp > 0).length >= 2;
}

function tryOloSecretEntrance() {
  if (G.curMap !== 'cave1' || G.pl.stepTarget) return false;
  const c = Math.round(G.pl.x),
    r = Math.round(G.pl.y);
  if (c === 19 && r === 24 && kh('ArrowLeft') && cave1[24]?.[18] === 21) {
    if (hasTwoActiveDragons()) {
      cave1[24][18] = 20;
      sfx.cap();
      aN('¡La pared responde a tus dragones!');
    } else {
      G.scr = 'dialog';
      G.ds = {
        npc: { nm: 'Pared antigua' },
        dlgArr: [
          'Una marca de dos dragones',
          'brilla en la piedra.',
          'Necesitas 2 criaturas Dragón',
          'vivas en tu equipo activo.',
        ],
        li: 0, ci: 0, tm: 0, full: false,
      };
      sfx.nef();
    }
    return true;
  }
  return false;
}
// === GENERACIÓN DEL CASTILLO ===
function genCastle() {
  for (let r = 0; r < KR; r++) {
    castMap[r] = [];
    for (let c = 0; c < KC; c++) {
      if (r < 1 || r >= KR - 1 || c < 1 || c >= KC - 1) castMap[r][c] = 31;
      else castMap[r][c] = 30;
    }
  }

  // Sala izquierda (Yam)
  for (let r = 3; r <= 10; r++) {
    castMap[r][2] = 31;
    castMap[r][12] = 31;
  }
  for (let c = 2; c <= 12; c++) {
    castMap[3][c] = 31;
    castMap[10][c] = 31;
  }
  castMap[10][7] = 30; // Puerta
  for (let r = 4; r < 10; r++) for (let c = 3; c < 12; c++) castMap[r][c] = 30;

  // Sala derecha (Ravell)
  for (let r = 3; r <= 10; r++) {
    castMap[r][17] = 31;
    castMap[r][27] = 31;
  }
  for (let c = 17; c <= 27; c++) {
    castMap[3][c] = 31;
    castMap[10][c] = 31;
  }
  castMap[10][22] = 30; // Puerta
  for (let r = 4; r < 10; r++) for (let c = 18; c < 27; c++) castMap[r][c] = 30;

  // Sala del trono (Rey Navarrete)
  for (let r = 14; r <= 21; r++) {
    castMap[r][5] = 31;
    castMap[r][24] = 31;
  }
  for (let c = 5; c <= 24; c++) {
    castMap[14][c] = 31;
    castMap[21][c] = 31;
  }
  castMap[21][15] = 30; // Puerta
  for (let r = 15; r < 21; r++) for (let c = 6; c < 24; c++) castMap[r][c] = 32;

  // Trono
  castMap[15][14] = 31;
  castMap[15][15] = 31;
  castMap[15][16] = 31;
  castMap[16][14] = 31;
  castMap[16][16] = 31;

  // Pasillos
  for (let r = 10; r <= 22; r++)
    for (let c = 14; c <= 16; c++) castMap[r][c] = 30;
  for (let c = 7; c <= 22; c++) castMap[12][c] = 30;

  // Alfombra roja (ya manejada en el tile 30)

  // Salida
  castMap[KR - 2][15] = 33;

  // Estandartes en paredes
  // (manejados decorativamente en el tile 31)
}

// === COLISIONES ===
function solidW(c, r) {
  if (c < 0 || c >= WC || r < 0 || r >= WR) return true;
  const t = wMap[r][c];
  // Agua, árboles, rocas son sólidos
  // Edificios (4) son sólidos
  // Torre cerrada es sólida
  if (t === 2 || t === 3 || t === 7) return true;
  if (t === 4) return true;
  // Decoración sólida del mundo: puestos, estatuas, cercas, cajas, pozos, muñecos y cámara/set.
  if ([18, 19, 20, 21, 22, 23, 25, 27].includes(t)) return true;
  if (t === 13) return true;
  if (t === 9) return true;
  if (t === 12 && !towerOpen) return true;
  if (routeGateBlocks(c, r)) return true;
  return false;
}

function solidC(c, r, map, cols, rows) {
  if (c < 0 || c >= cols || r < 0 || r >= rows) return true;
  const t = map[r][c];
  // Solo paredes, agua subterránea y lava son sólidos
  // Tiles 27,28,33 NO son sólidos (salidas y cristales)
  return t === 21 || t === 23 || t === 24 || t === 29 || t === 31;
}

// === GENERACIÓN DE TORRE (mapa especial post-game) ===
let towerMap = [];
const TWC = 30,
  TWR = 25;

function genTower() {
  for (let r = 0; r < TWR; r++) {
    towerMap[r] = [];
    for (let c = 0; c < TWC; c++) {
      if (r < 1 || r >= TWR - 1 || c < 1 || c >= TWC - 1) towerMap[r][c] = 21;
      else towerMap[r][c] = 20;
    }
  }

  // Decoración especial - jardín celestial
  for (let r = 2; r < TWR - 2; r++)
    for (let c = 2; c < TWC - 2; c++) {
      if (Math.random() < 0.05) towerMap[r][c] = 22; // Cristales decorativos
      else if (Math.random() < 0.08) towerMap[r][c] = 26; // Vegetación
      else if (Math.random() < 0.03) towerMap[r][c] = 23; // Estanques
    }

  // Caminos claros
  for (let r = 1; r < TWR - 1; r++) towerMap[r][Math.floor(TWC / 2)] = 20;
  for (let c = 1; c < TWC - 1; c++) towerMap[Math.floor(TWR / 2)][c] = 20;

  // Claro central para Serafox
  for (let r = 10; r < 15; r++)
    for (let c = 12; c < 18; c++) towerMap[r][c] = 20;

  // Flores luminosas
  for (let r = 2; r < TWR - 2; r++)
    for (let c = 2; c < TWC - 2; c++) {
      if (towerMap[r][c] === 20 && Math.random() < 0.04) towerMap[r][c] = 22;
    }

  // Salida abajo
  towerMap[TWR - 2][Math.floor(TWC / 2)] = 27;

  // Cristales capturables
  let tc = 0;
  while (tc < 3) {
    const c = 3 + Math.floor(Math.random() * (TWC - 6));
    const r = 3 + Math.floor(Math.random() * (TWR - 6));
    if (towerMap[r][c] === 20) {
      towerMap[r][c] = 28;
      tc++;
    }
  }
}

// === UBICACIONES PARA MAPA GRANDE ===
const MAP_LOCATIONS = [
  { x: 20, y: 143, nm: 'Aldea Pitch', col: '#E84040' },
  { x: 40, y: 110, nm: 'V.Storyboard', col: '#40A0E0' },
  { x: 54, y: 82, nm: 'Cantera Rodaje', col: '#E8A030' },
  { x: 30, y: 52, nm: 'Ult.Toma', col: '#40C040' },
  { x: 44, y: 22, nm: 'P.Montaje', col: '#D860A8' },
  { x: 38, y: 8, nm: 'Cast.Difusión', col: '#C8A830' },
  { x: 15, y: 105, nm: 'C.Volcánica', col: '#E06030' },
  { x: 65, y: 38, nm: 'C.Cristalina', col: '#80A0E0' },
  { x: 55, y: 6, nm: 'Torre P.A.', col: '#F060F0' },
];


const ROUTE_SIGNS = [
  { x: 20, y: 138, name: 'Cartel Aldea Pitch', lines: ['↑ Ruta 1 / Villa Storyboard', '↓ Aldea Pitch', 'Z: correr | X: menú'] },
  { x: 36, y: 115, name: 'Cartel Ruta 1', lines: ['↑ Villa Storyboard', '↓ Aldea Pitch', 'Los Proa bloquean rutas sin diploma.'] },
  { x: 50, y: 104, name: 'Cartel Ruta 2', lines: ['↑ Cantera Rodaje', '↓ Villa Storyboard', '← Cueva Volcánica'] },
  { x: 64, y: 76, name: 'Cartel Ruta 3', lines: ['↑ Feria Última Toma', '↓ Cantera Rodaje', 'Piero suele explorar por aquí.'] },
  { x: 31, y: 47, name: 'Cartel Ruta 4', lines: ['↑ Prados Montaje', '↓ Feria Última Toma', '→ Cueva Cristalina'] },
  { x: 43, y: 16, name: 'Cartel Ruta 5', lines: ['↑ Castillo Difusión', '↓ Prados Montaje', 'La torre abre en post-game.'] },
  { x: 14, y: 107, name: 'Cartel Cueva', lines: ['Cueva Volcánica', 'Se oyen ecos de punk antiguo.', 'Dicen que una pared busca dragones.'] },
  { x: 71, y: 40, name: 'Cartel Cueva', lines: ['Cueva Cristalina', 'Al fondo vive SaloGon.', 'No todos los recuerdos son monstruos.'] },
];
// ============================================================
// BLOQUE 10A: DATOS DE NPCs - ALDEAS
// ============================================================

const npcs = [
  // ==========================================
  // PUEBLO 1: ALDEA PITCH (Inicio)
  // ==========================================
  {
    x: 20,
    y: 142,
    tp: 'alessandro',
    nm: 'Alessandro',
    dlg: [
      [
        '¡Bienvenido a Aldea Pitch!',
        'Aquí comienza tu aventura.',
        '¡El reino te espera!',
      ],
      [
        'Cada pueblo tiene su esencia.',
        'Cada criatura su historia.',
        '¡Tú escribes la tuya!',
      ],
      ['Runa creativa.', 'Entretres...', '¡Brandcut!', 'Brandcut es la clave'],
      [
        'Los Proa cuidan de las criaturas.',
        'Cuando no están en tu equipo,',
        'descansan en la Proa.',
      ],
      ['¡Increíble!'],
      [
        'PRIMERA REGLA DE BRANDCUT:',
        '...',
        'Ok, mal ejemplo.',
        'Solo pelea.',
      ],
      [
        'Eres el mejor, jugador.',
        '¡Eres el mejor!',
        'Y no se lo digo a cualquiera.',
      ],
      [
        'Y recuerden, niños:',
        'no olviden comer sus vegetales.',
      ],
    ],
    postDlg: [
      '¡Has llegado lejos!',
      'El castillo te espera.',
      '¡Demuestra tu valor!',
    ],
    flag: 'metAles',
  },
  {
    x: 19,
    y: 142,
    tp: 'gabriela',
    nm: 'Gabriela',
    postOnly: true,
    dlg: [
      ['¡El Rey me aceptó!', '¡Soy su discípula!', '¡Mira mi nueva armadura!'],
      [
        'Me mudé junto a Alessandro.',
        'Entreno con Navarrete de día...',
        'y sueño en casa de noche.',
        '¡La vida perfecta!',
      ],
      [
        'Alessandro dice que ahora',
        'YO soy la heroína de la casa.',
        'Él sigue siendo mi héroe.',
        '...No le digas que dije eso.',
      ],
    ],
    foreignDlg: [
      'Vengo de tierras cálidas...',
      'Allá el sol brilla distinto.',
      'Pero aquí encontré mi',
      'verdadero hogar.',
      'Y ahora, también mi futuro.',
    ],
    flag: 'metGab',
    battle: true,
    battleIntro: ['¡Entrené con el Rey!', '¡Siente el poder de su discípula!'],
    fixedTeam: [{ id: 'zumbaccino' }, { id: 'inferpavo' }],
  },
  {
    x: 22,
    y: 142,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    altDlg: [
      ['¡Nos volvemos a ver!', 'El ángulo cambió pero el encuadre sigue.'],
    ],
    heal: true,
  },
  {
    x: 18,
    y: 144,
    tp: 'alex',
    nm: 'Alex',
    dlg: [
      [
        '¡Hey! Controles rápidos:',
        'Flechas para moverte',
        'de casilla en casilla.',
        'Z sirve para correr.',
      ],
      [
        'SPACE es acción:',
        'hablar, leer carteles,',
        'abrir cosas importantes.',
        'Si dudas, presiona SPACE.',
      ],
      [
        'X abre el menú.',
        'Ahí ves equipo, mapa,',
        'misiones, objetos y Proa.',
        '¡No te pierdas, crack!',
      ],
    ],
    postDlg: ['¡Tu ritmo es imparable!', 'Sigue corriendo hacia el éxito!'],
    flag: 'metAlex',
    tutorial: true,
    battle: false,
    exterior: true,
    battleIntro: ['¡Velocidad es poder!', '¡A pelear!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'pinzardo' }],
  },
  {
    x: 24,
    y: 144,
    tp: 'luis',
    nm: 'Luis',
    dlg: [
      [
        'Combate con calma, mi pana,',
        'elige ataque y gana la gana.',
        'Si el tipo es correcto,',
        '¡el golpe sale perfecto!',
      ],
      [
        'Fuego seca planta con pasión,',
        'planta bebe agua con razón,',
        'agua apaga fuego sin drama:',
        '¡así se enciende la trama!',
      ],
      [
        'Para capturar sin apuro,',
        'baja su vida, te lo aseguro.',
        'Lanza Cristal Vínculo al final,',
        '¡y quizá se una a tu coral!',
      ],
    ],
    postDlg: [
      'El río llegó al mar.',
      'Y el mar es tranquilo.',
      'Buen viaje, héroe.',
    ],
    flag: 'metLuis',
    tutorial: true,
    battle: false,
    exterior: true,
    battleIntro: ['El río de la vida...', 'también tiene batallas.'],
    fixedTeam: [{ id: 'raizan' }, { id: 'pixie' }],
  },
  {
    x: 21,
    y: 146,
    tp: 'nicole',
    nm: 'Nicole',
    // ==========================================
    // DIÁLOGOS NORMALES (Game)
    // Ella está libre, pero amargada por el techo y extrañando amigas
    // ==========================================
    dlg: [
      [
        '¡Maldita sea! ¡Otro aventurero!',
        '¿Nadie arregla mi techo?',
        '¡Diablos con este reino y sus constructores!',
        'Gotea más que un grifo roto.',
      ],

      [
        'A veces pienso en los pueblos del norte...',
        'Hace mucho que no veo',
        'ciertas caras familiares.',
        'a veces me pregunto... ¿estarán bien?',
      ],

      [
        '¿Sabes qué es lo peor?',
        'Que hay dos personas allá',
        'en esos pueblos... que solían',
        'hacerme reír tanto.',
        'Ahora solo me queda el techo.',
      ],

      [
        'Los Proa dicen que cuidan criaturas.',
        'Qué bonito.',
        'Ojalá alguien cuidara mi techo.',
        'O al menos me trajera un paraguas.',
      ],

      [
        'Alex dice que corra con Z.',
        'Sí, claro.',
        'Correría si no tuviera miedo',
        'de que el techo se me caiga encima.',
        'La velocidad no salva de la humedad.',
      ],

      [
        'Luas habla de "cortes" y "tomas".',
        'No puede ser más webon.',
        'Debí hacer equipo con mis monas.',
        '*suspiro*',
      ],

      [
        'Si subes hacia el norte...',
        'Diles que sigo aquí.',
        'Viva, amargada, pero viva.',
        'Y con el techo goteando.',
      ],
    ],

    // ==========================================
    // DIÁLOGOS POST-GAME (Crucificada)
    // Aquí es donde aparece clavada en la cruz
    // ==========================================
    postDlg: [
      [
        'La vida puede ser hermosa...',
        'Para otras personas.',
        'No para mí. Pero está bien.',
        'Al menos el techo ya no gotea... porque estoy afuera.',
        'Ironías del destino.',
      ],

      [
        '¿Sabes qué es gracioso?',
        'Estoy literalmente crucificada',
        'y TODAVÍA me gotea algo.',
        'Quizás son lágrimas.',
        'O quizás sigue lloviendo.',
        'Quién sabe.',
      ],

      [
        'Mis amigas...',
        'No las veo pasar.',
        'Me gustaría pensar que me saludan desde lejos.',
        'No pueden bajarme.',
        'Reglas del guion, supongo.',
        'Un guionista muy cruel.',
      ],

      [
        '¿Otra vez tú?',
        '¿No tienes nada mejor que hacer?',
        'Yo sí... pero estoy clavada aquí.',
        'Literal y figurativamente.',
        'El universo tiene un sentido del humor retorcido.',
      ],

      [
        'Anoche soñé que estaba libre.',
        'Corría por un prado lleno de flores.',
        'Luego me despertó... bueno, no me desperté.',
        'Seguí aquí. Clavada.',
        'Los sueños son mentirosos.',
      ],

      [
        'Los Proa cuidan criaturas.',
        'Qué ironía.',
        'A mí nadie me cuida.',
        'Ni siquiera yo misma puedo bajarme.',
        'Necesito un "Proa" personal.',
      ],

      ['Merma Merma Merma.', 'si lo piensas bien todo puede ser merma'],

      [
        'A veces pienso...',
        'Si me muero aquí clavada,',
        '¿al menos alguien me bajaría?',
        '¿O me dejarían aquí como advertencia?',
        '"Miren, así termina quien confía en techos medievales".',
        'Qué epitafio tan poético.',
      ],

      [
        '¿Quieres un consejo?',
        'Nunca confíes en un techo.',
        'Ni en la gente que promete arreglarlo.',
        'Y definitivamente no confíes',
        'en el post-game de tu vida.',
        'Te deja clavada.',
      ],
    ],

    postBattleIntro: [
      'Ja... ¿quieres pelear?',
      'Estoy algo... clavada.',
      'Literalmente.',
      'Pero mis criaturas tienen',
      'más libertad emocional',
      'que todo este pueblo.',
    ],

    flag: 'metNic',
    battle: true,
    postOnlyBattle: true, // Solo pelea en post-game
    fixedTeam: [{ id: 'gusarix' }, { id: 'gorilirico' }, { id: 'emberwing' }],
  },

  // ==========================================
  // PUEBLO 2: VILLA STORYBOARD
  // ==========================================
  {
    x: 40,
    y: 109,
    tp: 'gabriela',
    nm: 'Gabriela',
    preOnly: true,
    dlg: [
      [
        '¿Conoces al Rey del castillo?',
        'Quiero ser su aprendiz.',
        '¡Pero no sé su nombre!',
      ],
      [
        'Mi... Ale, Alessandro dice',
        'que soy muy soñadora.',
        '¡Pero soñar es GRATIS!',
      ],
      [
        'Dicen que el Rey tiene',
        'una criatura de cada tipo.',
        '¡CINCO! ¡Imagínate!',
      ],
    ],
    postDlg: ['¡Me mudé con Alessandro!', '¡El amor es el mejor guión!'],
    foreignDlg: [
      'Vengo de tierras cálidas...',
      'Allá el sol brilla distinto.',
      'Pero aquí encontré mi hogar.',
    ],
    flag: 'metGab',
    battle: true,
    battleIntro: [
      '¡Mi n... Miguel dice que tengo grandes sueños!',
      '¡Pues soñaré tu derrota!',
    ],
    fixedTeam: [{ id: 'zumbaflor' }, { id: 'emberwing' }],
  },
  {
    x: 42,
    y: 109,
    tp: 'claudia',
    nm: 'Claudia',
    dlg: [
      [
        'Cada combate que ganes',
        'te dará oro. ¡Ahorra!',
        'Tienes que AHORRAR, es MUY',
        'importante... Edison también dice eso.',
      ],
      [
        'Los enemigos más fuertes',
        'dan más oro al derrotarlos.',
        '¡Combate mucho!',
      ],
      [
        'El oro sirve para comprar',
        'pociones y cristales.',
        '¡En la tienda de David-O!',
      ],
    ],
    postDlg: [
      'N-no es que me alegre',
      'que Edison esté aquí...',
      'Solo es... conveniente.',
      '...Ay chamare contigo.',
    ],
    flag: 'metCla',
  },
  {
    x: 38,
    y: 111,
    tp: 'fabiana',
    nm: 'Fabiana',
    dlg: [
      [
        '¡Hola! Mi casa es el punto',
        'de reunión de mis amigos.',
        '¡Somos... un buen elenco!',
        'creo',
      ],
      ['A Gabriela y a mi nos gusta el arte', '¿te nos unes?'],
      [
        '¿De verdad es necesario que',
        'todos duerman en mi casa',
        'cada trabajo que hacemos?',
        'si, creo que les voy a cobrar',
      ],
    ],
    postDlg: [
      '¡El reino está en paz!',
      'Todo gracias a ti.',
      '¡Sigue explorando!',
    ],
    flag: 'metFab',
  },
  {
    x: 44,
    y: 111,
    tp: 'paulo',
    nm: 'Paulo',
    dlg: [
      [
        '🌿 Planta vence a 💧 Agua',
        '💧 Agua vence a 🔥 Fuego',
        '🔥 Fuego vence a 🌿 Planta',
      ],
      [
        '🐉 Dragón es fuerte contra',
        '🔥 Fuego y 🌿 Planta, pero',
        '🧚 Hada lo destruye.',
      ],
      [
        '🧚 Hada vence a 🐉 Dragón',
        'y 💧 Agua, pero es débil',
        'contra 🔥 Fuego y 🌿 Planta.',
      ],
    ],
    postDlg: [
      'La teoría se confirmó.',
      '¡Tu victoria lo demuestra!',
      'Los tipos importan.',
    ],
    flag: 'metPau',
    battle: true,
    battleIntro: ['La teoría es buena...', '¡Pero la práctica es mejor!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'flameye' }],
  },
  {
    x: 41,
    y: 113,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Bienvenido a mi tienda!', '¿Qué necesitas hoy?']],
    altDlg: [['¡Otra visita, otra venta!', '¡El comercio nunca descansa!']],
    shop: true,
  },

  // ==========================================
  // PUEBLO 3: CANTERA RODAJE
  // ==========================================
  {
    x: 54,
    y: 81,
    tp: 'pachi',
    nm: 'Pachi',
    dlg: [
      [
        'Soy actor de profesión.',
        'Mi hermano André está',
        'afuera esperando...',
      ],
      [
        'André es el hombre más',
        'hermoso de su pueblo.',
        '¡Y le pusieron una máscara!',
      ],
      ['Algún día actuaré con él.', 'Pero primero... ¡ESCENA 3!'],
    ],
    postDlg: [
      '¡Mi hermano André es libre!',
      '¡Ahora actuamos juntos!',
      '¡ESCENA FINAL!',
    ],
    flag: 'metPac',
    battle: true,
    battleIntro: ['¡ACTO TERCERO!', '¡La batalla comienza!'],
    fixedTeam: [{ id: 'eastern' }, { id: 'pixie' }],
  },
  {
    x: 56,
    y: 81,
    tp: 'dante',
    nm: 'Dante',
    dlg: [
      ['Vivo un infierno...', 'pero sigo adelante.', 'Eso es lo que importa.'],
      [
        'André es el hombre más',
        'guapo que he conocido.',
        'Le respeto muchísimo.',
      ],
      [
        'La vida trae dolor',
        'pero también sabiduría.',
        'Hay que seguir caminando.',
      ],
    ],
    postDlg: [
      'El infierno se apagó.',
      'No del todo...',
      'pero las llamas son',
      'más pequeñas ahora.',
    ],
    flag: 'metDan2',
    battle: true,
    exterior: true,
    battleIntro: ['El infierno me enseñó', 'a pelear. ¿Estás listo?'],
    fixedTeam: [{ id: 'serpentdrg' }, { id: 'glaciolote' }],
  },
  {
    x: 52,
    y: 83,
    tp: 'gonchi',
    nm: 'Gonchi',
    dlg: [
      [
        '¡Hola! Toma esto.',
        'Ten cuidado con la chica',
        'de harapos en Aldea Pitch.',
        'Esa mujer me da miedo.',
      ],
    ],
    postDlg: [
      '¿La chica de harapos?',
      'Ahora está... peor.',
      'No quiero saber más.',
    ],
    flag: 'metGon',
    givesItem: true,
    battle: true,
    exterior: true,
    battleIntro: ['Toma esto primero...', '¡Ahora sí, luchemos!'],
    fixedTeam: [{ id: 'peztronauta' }, { id: 'gorilan' }],
  },
  {
    x: 58,
    y: 83,
    tp: 'nahuel',
    nm: 'Nahuel',
    dlg: [
      [
        '¡Oye! ¿Quieres trabajo?',
        '...Es broma, no tengo.',
        '¿O sí? No, no tengo.',
      ],
      [
        'Mi hermano Alejandro está',
        'mucho más al norte esperando.',
        'Tiene el pelo largo, no falla.',
      ],
      [
        '¿Por qué uso shorts?',
        'Porque las piernas también',
        'merecen ver el sol.',
      ],
      [
        'Mano, te puesto unas monedas.',
        'a que nunca me has visto con',
        'pantalones',
      ],
    ],
    postDlg: [
      '¡Mi hermano y yo podemos',
      'pelear juntos ahora!',
      '¡Sangre de mi sangre!',
    ],
    flag: 'metNah',
    battle: true,
    battleIntro: ['¡Las piernas libres', 'pelean mejor! ¡Vamos!'],
    fixedTeam: [{ id: 'salamandro' }, { id: 'flamingo' }],
  },
  {
    x: 60,
    y: 80,
    tp: 'andre',
    nm: 'André',
    postOnly: true,
    dlg: [
      [
        '...Esta máscara pesa.',
        'Quiero ser actor, como Pachi.',
        'Pero esta máscara...',
      ],
      [
        'Dicen que soy hermoso.',
        'Yo no lo sé. No me veo.',
        'Solo siento el hierro frío.',
      ],
      [
        'Las chicas aquí son amables.',
        'Pero extraño mi libertad.',
        'Algún día...',
      ],
    ],
    postDlg: [
      'La máscara sigue aquí...',
      'Pero el peso se siente',
      'diferente ahora.',
      'Como si importara menos.',
    ],
    flag: 'metAnd',
    battle: true,
    battleIntro: ['Esta máscara pesa...', 'Pero mis criaturas no.'],
    fixedTeam: [{ id: 'serpentdrg' }, { id: 'gorilan' }],
  },

  // ==========================================
  // PUEBLO 4: FERIA ÚLTIMA TOMA
  // ==========================================
  {
    x: 30,
    y: 51,
    tp: 'brisa',
    nm: 'Brisa',
    dlg: [
      [
        'Perdona, estoy ocupada.',
        'El trabajo no se hace solo.',
        '¡Roberto! ¡Trae la cena!',
      ],
      [
        'Mi novio Roberto es dulce',
        'pero no sabe cocinar.',
        'Menos mal que sé yo.',
      ],
      [
        'Algún día tendré vacaciones.',
        'Algún día... *suspiro*',
        '¡Roberto! ¡Las cortinas!',
      ],
    ],
    postDlg: [
      'Roberto me preparó la cena',
      'hoy... ¡Y no quemó nada!',
      'Estoy... feliz. *sonríe*',
    ],
    flag: 'metBri',
    battle: true,
    battleIntro: ['¡No tengo tiempo para esto!', '...Bueno, tal vez un poco.'],
    fixedTeam: [{ id: 'axolotl' }, { id: 'orquidea' }],
  },
  {
    x: 32,
    y: 51,
    tp: 'roberto',
    nm: 'Roberto',
    dlg: [
      [
        'No soy de esta tierra,',
        'pero...',
        'las brisas de aqui son hermosas',
        'MI Brisa es hermosa',
      ],
      [
        'Mi tierra natal era... más avanzada.',
        'Aquí hace calor, pero hay amor.',
        '¿Qué más puedo pedir?',
      ],
      [
        'Brisa trabaja mucho...',
        'pero siempre sonríe al verme.',
        'Eso vale más que oro.',
      ],
    ],
    postDlg: [
      'Brisa me preparó sopa hoy.',
      '¡Sin quemar nada!',
      'Estamos progresando.',
    ],
    foreignDlg: [
      'De donde yo vengo...',
      'la tecnología es increíble.',
      'Pero no reemplaza el calor',
      'de una persona que te ama.',
    ],
    flag: 'metRob',
    battle: true,
    battleIntro: ['¡En mi tierra se pelea', 'con el corazón! ¡Vamos!'],
    fixedTeam: [{ id: 'peztronauta' }, { id: 'wyvern' }],
  },
  {
    x: 28,
    y: 53,
    tp: 'deyna',
    nm: 'Deyna',
    dlg: [
      [
        'Extraño a dos personas...',
        'A mi novia, que está lejos.',
        'Y a alguien del sur, en Aldea Pitch.',
      ],
      [
        '¡Explora el mapa entero!',
        'Hay criaturas increíbles',
        'en cada rincón. ¡VE!',
      ],
      [
        'Dayana es mi mejor amiga.',
        'Siempre juntas, siempre.',
        'Pero hay días que pienso',
        'en el otro lado del mapa...',
        'y me pregunto si allá',
        'alguien también piensa en mí.',
      ],
    ],
    postDlg: [
      'Dicen que alguien al sur, en Aldea Pitch,',
      'está atada a algo pesado...',
      'No sé por qué, pero',
      'siento que debería ir.',
      'Aunque no puedo.',
    ],
    flag: 'metDey',
    battle: true,
    preGameOnce: true,
    hasChecklist: true,
    battleIntro: ['¡Mi pulsera me da fuerza!', '¡Vamos a pelear!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'thornbuck' }],
  },
  {
    x: 34,
    y: 53,
    tp: 'dayana',
    nm: 'Dayana',
    dlg: [
      [
        '¿Sabías que Luchito',
        'quiere casarse? ¡Aww!',
        'Hernán ama a una tal Tishe.',
      ],
      [
        'A Dan le gusta alguien',
        'llamado Taylor West...',
        'Dante vive un infierno.',
      ],
      [
        'Tamara adora dibujar',
        'y Andrea quiere ser profe.',
        'Echo de menos el sur del reino...',
        'Allá dejé algo importante.',
      ],
    ],
    postDlg: [
      'El sur del reino sigue lejos...',
      'Pero las estrellas son',
      'las mismas en todas partes.',
      'Eso me consuela un poco.',
    ],
    flag: 'metDay',
    battle: true,
    battleIntro: ['¡Las amigas pelean', 'con el corazón! ¡Vamos!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'raizan' }],
  },

  // ==========================================
  // PUEBLO 5: PRADOS MONTAJE
  // ==========================================
  {
    x: 44,
    y: 21,
    tp: 'angelly',
    nm: 'Angelly',
    dlg: [
      [
        '¡¡JAJAJA!! ¡Te conozco!',
        '¡Somos amigos de infancia!',
        'Dame 1 de oro... *ríe*',
        '¡Ahora COMBATAMOS!',
      ],
    ],
    postDlg: [
      '¡¡JAJAJA!! ¡Otra vez!',
      '¡Dame otro oro!',
      '¡Nunca me canso de esto!',
    ],
    flag: 'metAng',
    battle: true,
    isAngelly: true,
    battleIntro: ['¡JAJAJA! ¡Dame tu oro!', '¡Y tus criaturas también!'],
  },
  {
    x: 46,
    y: 21,
    tp: 'ximena',
    nm: 'Ximena',
    dlg: [['Extraño a mi ex...', 'Pero bueno. ¿Tienes', 'criaturas bonitas?']],
    postDlg: [
      '¿Sabes? He viajado mucho.',
      'Y este lugar... es especial.',
      'Toma, te doy algo.',
    ],
    foreignDlg: [
      'Vengo de muy muy lejos...',
      'De tierras con buena música.',
      'Donde los ritmos cuentan',
      'historias que el alma entiende.',
      'Pero aquí encontré mi',
      'propio ritmo.',
    ],
    flag: 'metXim',
    givesItem: true,
    battle: true,
    exterior: true,
    battleIntro: ['Extraño a alguien...', '¡Pero puedo pelear!'],
    fixedTeam: [{ id: 'sidhe' }, { id: 'salamandro' }],
  },
  {
    x: 42,
    y: 23,
    tp: 'hernan',
    nm: 'Hernán',
    dlg: [
      [
        'Tishe... está tan lejos.',
        'Pero mi amor por ella',
        'cruza cualquier distancia.',
      ],
      [
        'La edad te enseña',
        'a amar mejor. Con paciencia.',
        'Con el corazón abierto.',
      ],
      ['Si la ves... dile que', 'la pienso cada día.', '...Tishe, te extraño.'],
    ],
    postDlg: [
      'Hablé con Tishe...',
      'Ya no necesito esta barba.',
      'Tengo nuevas ganas de vivir.',
      'El mundo es hermoso.',
    ],
    flag: 'metHer',
    battle: true,
    battleIntro: ['Pelear me recuerda', 'que sigo aquí...'],
    fixedTeam: [{ id: 'wyvern' }, { id: 'glaciolote' }],
  },
  {
    x: 48,
    y: 23,
    tp: 'alejandro',
    nm: 'Alejandro',
    dlg: [
      [
        '¡Hermanito! ¡Un abrazo!',
        '¿Quieres pelear? ¡Vamos!',
        '¡No te rindas NUNCA!',
      ],
    ],
    postDlg: [
      '¡Mi hermano y yo juntos!',
      '¡Somos imparables!',
      '¡Ven cuando quieras!',
    ],
    flag: 'metAlej',
    battle: true,
    exterior: true,
    battleIntro: ['¡Hermanito! ¡A pelear!'],
    fixedTeam: [{ id: 'sidhe' }, { id: 'gusarix' }],
  },

  // ==========================================
  // RUTAS - EXPLORADORES (Protoperiodistas)
  // ==========================================
  {
    x: 35,
    y: 125,
    tp: 'jairo',
    nm: 'Jairo',
    dlg: [
      [
        '¡Fútbol medieval! ¡GOOOL!',
        '¿Has visto a mi amigo Piero?',
        'Está más al norte, por la Ruta 3.',
      ],
      [
        'Patear pelotas de cuero',
        'es el mejor deporte.',
        '¡Deberías probarlo!',
      ],
      [
        'Conocíamos a Manuel...',
        'Se fue hace tiempo.',
        'Era renegón pero buen tipo.',
        'Le hubieras caído bien.',
      ],
    ],
    postDlg: [
      '¡Encontré a Mr. Olo-Man!',
      '¡Está en la Cueva Volcánica!',
      '¡Sigue siendo raro!',
      '¡Pero es buen tipo!',
    ],
    flag: 'metJai',
    battle: true,
    exterior: true,
    battleIntro: ['¡GOOOL! Digo...', '¡LUCHA! ¡Vamos!'],
    fixedTeam: [{ id: 'flameye' }, { id: 'flamingo' }],
  },
  {
    x: 15,
    y: 102,
    tp: 'oscar',
    nm: 'Oscar',
    dlg: [
      [
        'Registro todo lo que veo.',
        'Como... un cronista.',
        'Pero sin pluma ni tinta.',
      ],
      [
        'Conocíamos a Manuel...',
        'Tenía voz rasposa.',
        'Quería ser comentarista.',
        'Se fue... pero lo recordamos.',
      ],
      [
        'Este camino es peligroso.',
        'Pero las historias que cuenta...',
        'valen la pena.',
      ],
    ],
    postDlg: [
      'El registro está completo.',
      'Pero la historia sigue.',
      'Siempre sigue.',
    ],
    flag: 'metOscar',
    battle: true,
    exterior: true,
    battleIntro: ['¡Los hechos hablan!', '¡Mis criaturas también!'],
    fixedTeam: [{ id: 'ivygoat' }, { id: 'axolotl' }, { id: 'wyvern' }],
  },
  {
    x: 65,
    y: 72,
    tp: 'piero',
    nm: 'Piero',
    dlg: [
      [
        '¿Mi cabello rubio? Una apuesta.',
        'Perdí... pero quedó bien.',
        '¿O no?',
      ],
      [
        'Manuel era... especial.',
        'Renegón, voz rasposa.',
        'Decía que el mundo necesita',
        'quienes cuenten la verdad.',
      ],
      [
        'He visto cosas en este viaje.',
        'Criaturas, personas, historias.',
        'Todo merece ser contado.',
      ],
    ],
    postDlg: ['La apuesta terminó.', 'Pero el viaje no.', 'Nunca termina.'],
    flag: 'metPiero',
    battle: true,
    exterior: true,
    battleIntro: ['¡La verdad duele!', '¡Pero las batallas también!'],
    fixedTeam: [{ id: 'flamingo' }, { id: 'pixie' }, { id: 'serpentdrg' }],
  },
  {
    x: 30,
    y: 40,
    tp: 'chrys',
    nm: 'Chrys',
    dlg: [
      ['Soy productora.', 'Coordino, organizo,', 'hago que todo funcione.'],
      [
        'Conozco a Yam, Ravell,',
        'Hernán, Nahuel, Alejandro...',
        'Son mi "elenco" especial.',
      ],
      [
        'Este camino es el final.',
        'Pero los finales son solo',
        'comienzos disfrazados.',
      ],
    ],
    postDlg: [
      'La producción está completa.',
      'Pero siempre hay',
      'una segunda temporada.',
    ],
    flag: 'metChrys',
    battle: true,
    exterior: true,
    battleIntro: ['¡Produzco victorias!', '¡Y derrotas también!'],
    fixedTeam: [
      { id: 'inferpavo' },
      { id: 'glaciolote' },
      { id: 'elefantasy' },
    ],
  },

  // ==========================================
  // LUAS EN TODOS LOS PUEBLOS (curandero)
  // ==========================================
  {
    x: 40,
    y: 107,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 54,
    y: 79,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 30,
    y: 49,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },
  {
    x: 44,
    y: 19,
    tp: 'luas',
    nm: 'Luas',
    dlg: [
      ['¡Corte! Tu equipo está renovado.', '¡Listo para la siguiente toma!'],
    ],
    heal: true,
  },

  // ==========================================
  // LIDERES DE GIMNASIO (Fases B-E): Tamara, Luchito, Andrea, Dan
  // ==========================================
  {
    x: 41, y: 110,
    tp: 'tamara',
    nm: 'Tamara',
    flag: 'metTamara',
    isLeader: true,
    leaderKey: 'tamara',
    dlg: [['Soy Tamara, lider de Villa Storyboard.']],
    postDlg: ['El reino fluye en perfecta armonia.'],
    battle: true,
    battleIntro: ['La armonia del set... jademos!'],
    fixedTeam: [{ id: 'flamcrest' }, { id: 'axolotl' }, { id: 'ivygoat' }],
  },
  {
    x: 55, y: 82,
    tp: 'luchito',
    nm: 'Luchito',
    flag: 'metLuchito',
    isLeader: true,
    leaderKey: 'luchito',
    dlg: [['Soy Luchito. Aqui el amor lo es todo.']],
    postDlg: ['El amor vencio, como siempre.'],
    battle: true,
    battleIntro: ['Porque te amo, pelea conmigo!'],
    fixedTeam: [{ id: 'flamingo' }, { id: 'glaciolote' }, { id: 'gorilan' }],
  },
  {
    x: 31, y: 52,
    tp: 'andrea',
    nm: 'Andrea',
    flag: 'metAndrea',
    isLeader: true,
    leaderKey: 'andrea',
    dlg: [['Soy Andrea, tu profesora de Feria Ultima Toma.']],
    postDlg: ['Aprobada. La ficcion es realidad.'],
    battle: true,
    battleIntro: ['Leccion final: nunca subestimes a tu profesora!'],
    fixedTeam: [{ id: 'medusync' }, { id: 'spritefly' }, { id: 'thornbuck' }],
  },
  {
    x: 45, y: 22,
    tp: 'dan',
    nm: 'Dan',
    flag: 'metDan',
    isLeader: true,
    leaderKey: 'dan',
    dlg: [['Soy Dan. Los chismes mueven el reino.']],
    postDlg: ['La mejor publicidad es la verdad... y los chismes.'],
    battle: true,
    battleIntro: ['Camara, accion, combate!'],
    fixedTeam: [{ id: 'ajolord' }, { id: 'pixie' }, { id: 'hedroble' }],
  },

  // ==========================================
  // DAVID-O EN PUEBLOS 2-5 (tienda)
  // ==========================================
  {
    x: 56,
    y: 79,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Hey! ¡Otra vez tú!', '¿Compras o combatimos?']],
    shop: true,
  },
  {
    x: 32,
    y: 49,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Mi tienda favorita!', '...Es la única. ¡Compra!']],
    shop: true,
  },
  {
    x: 46,
    y: 19,
    tp: 'davido',
    nm: 'David-O',
    dlg: [['¡Última parada!', '¡Aprovecha antes de subir al castillo!']],
    shop: true,
  },
]; // Fin array npcs

// ==========================================
// NPC DE CUEVA
// ==========================================

const caveNpcs = [
  {
    x: 6,
    y: 24,
    map: 'cave1',
    tp: 'oloman',
    nm: 'Mr. Olo-Man',
    dlg: [
      [
        '¿Eh? ¡Hola! Soy del futuro.',
        'Me gusta estar aquí.',
        'Extraño a The Strokes...',
        '¡Pero COMBATAMOS!',
      ],
    ],
    sadDlg: [
      'Perdón, pero estoy muy',
      'triste ahora, faltan 600',
      'años para que vuelva a',
      'escuchar a Julian...',
    ],
    postDlg: [
      '¡600 años sin Strokes!',
      'Pero al menos puedo',
      'pelear contigo.',
      '¡Es casi tan bueno!',
      '¡OTRA VEZ!',
    ],
    flag: 'metOlo',
    battle: true,
    isPunk: true,
    battleIntro: [
      '¿¡600 años sin Strokes?!',
      '¡Necesito descargar esta',
      'energía! ¡COMBATAMOS!',
    ],
    fixedTeam: [{ id: 'pixie' }, { id: 'elefantasy' }, { id: 'sidhe' }],
  },
  {
    x: Math.floor(CC / 2),
    y: 5,
    map: 'cave2',
    tp: 'salogon',
    nm: 'SaloGon',
    flag: 'metSaloGon',
    vision: true,
    dlg: [['Soy SaloGon, vidente de la cueva.']],
  },
];

// ==========================================
// NPCs DEL CASTILLO
// ==========================================

const castNpcs = [
  {
    x: 7,
    y: 6,
    tp: 'yam',
    nm: 'Yam',
    dlg: [['¡¡¡BIENVENIDO!!!', '¡¡¡Soy Yam!!!', '¿¡¡COMBATIMOS!!?']],
    postDlg: ['¡¡¡MAGNÍFICO!!!', '¡¡¡OTRA VEZ!!!', '¡¡¡ME ENCANTA!!!'],
    battle: true,
    battleIntro: ['¡¡¡BIENVENIDO!!!', '¡¡¡Soy Yam!!!', '¡¡¡PREPARATE!!!'],
    team: [new Cre('flameye', 8), new Cre('pixie', 9)],
  },

  {
    x: 22,
    y: 6,
    tp: 'andre',
    nm: 'André',
    preOnly: true,
    dlg: [
      [
        '...Esta máscara pesa.',
        'Pachi está afuera...',
        'y yo sigo aquí.',
        'Algún día actuaré con él.',
      ],
    ],
    battle: true,
    battleIntro: ['No puedo salir todavía...', 'pero sí puedo pelear.'],
    team: [new Cre('serpentdrg', 8), new Cre('gorilan', 9)],
  },

  {
    x: 22,
    y: 6,
    tp: 'ravell',
    nm: 'Ravell',
    postOnly: true,
    dlg: [
      [
        'Perdí una apuesta.',
        'Ahora soy bufón.',
        'Pero aceptar un trabajo',
        'también es demostrar valor.',
      ],
      [
        'Jaja, rianse hermanos CTM...',
        'búrlense todo lo que quieran',
        'pero un trabajo es un trabajo',
        'si puedo con esto',
        '*asiente con la cabeza con una sonrisa*',
      ],
    ],
    battle: true,
    battleIntro: ['Un bufón también puede', 'dar un buen espectáculo.'],
    team: [new Cre('sidhe', 18), new Cre('axolotl', 18)],
  },

  {
    x: 15,
    y: 17,
    tp: 'boss',
    nm: 'Rey Navarrete',
    dlg: [['...Ah. Otro retador.', '*bostezo*', 'Supongo que sí.']],
    boss: true,
  },
];

// ==========================================
// NPC POST-GAME: EDISON
// ==========================================

const edisonNPC = {
  x: 43,
  y: 109,
  tp: 'edison',
  nm: 'Edison',
  dlg: [
    [
      '¡Hola! Soy Edison.',
      'Claudia es... increíble.',
      'La admiro muchísimo.',
      '¿Has escuchado un violonchelo?',
      'Es el sonido más hermoso.',
    ],
  ],
  foreignDlg: [
    'Vengo de tierras frías...',
    'Donde el invierno dura',
    'más que cualquier canción.',
    'Pero aquí el calor de',
    'Claudia derrite todo.',
    '...No le digas que dije eso.',
  ],
  challengeDlg: [
    '¿Quieres ir contra mí?',
    '¿O prefieres un nuevo reto?',
    'Las parejas del reino',
    'pueden combatir juntas...',
  ],
  battle: true,
  battleIntro: ['La música grave me enseñó', 'el ritmo de la batalla.'],
  fixedTeam: [{ id: 'glaciolote' }, { id: 'wyvern' }],
};

// ==========================================
// PAREJAS DE COMBATE (post-game)
// ==========================================

const pairBattleData = [
  {
    nm: 'Alessandro y Gabriela',
    p1: 'Alessandro',
    p2: 'Gabriela',
    intro: ['¡Juntos somos invencibles!', '¡El amor nos da poder!'],
    t1: [{ id: 'emberwing' }, { id: 'serpentdrg' }],
    t2: [{ id: 'sidhe' }, { id: 'axolotl' }],
  },
  {
    nm: 'Roberto y Brisa',
    p1: 'Roberto',
    p2: 'Brisa',
    intro: [
      '¡Cocinamos tu derrota!',
      '...Eso no tiene sentido.',
      '¡Pero suena bien!',
    ],
    t1: [{ id: 'ornishadow' }, { id: 'ivygoat' }],
    t2: [{ id: 'longwok' }, { id: 'thornbuck' }],
  },
  {
    nm: 'Claudia y Edison',
    p1: 'Claudia',
    p2: 'Edison',
    intro: [
      'N-no es que quiera pelear',
      'junto a él...',
      '¡Solo es estratégico!',
    ],
    t1: [{ id: 'zumbaflor' }, { id: 'flameye' }],
    t2: [{ id: 'glaciolote' }, { id: 'wyvern' }],
  },
  {
    nm: 'Pachi y Ravell',
    p1: 'Pachi',
    p2: 'Ravell',
    intro: ['¡ACTO FINAL!', '¡Los hermanos del teatro!', '...ja.'],
    t1: [{ id: 'eastern' }, { id: 'pixie' }],
    t2: [{ id: 'sidhe' }, { id: 'axolotl' }],
  },
  {
    nm: 'Alejandro y Nahuel',
    p1: 'Alejandro',
    p2: 'Nahuel',
    intro: ['¡Sangre de guerreros!', '¡Los hermanos atacan!'],
    t1: [{ id: 'sidhe' }, { id: 'serpentdrg' }],
    t2: [{ id: 'emberwing' }, { id: 'flamingo' }],
  },
  {
    nm: 'Dayana y Deyna',
    p1: 'Dayana',
    p2: 'Deyna',
    intro: [
      'La amistad es tan fuerte',
      'como cualquier vínculo.',
      '¡Siempre juntas!',
    ],
    t1: [{ id: 'medusync' }, { id: 'ivygoat' }],
    t2: [{ id: 'spritefly' }, { id: 'thornbuck' }],
  },
];

// ==========================================
// CONSTANTES DE DIÁLOGO
// ==========================================

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

const bossDialogues = [
  ['Hacía años... ¿emoción?', 'No. Debe ser indigestión.'],
  ['Espera. ¿Fue divertido?', 'No recuerdo eso...'],
  ['¡JA! ¡Tu criatura tiene agallas!', '¡Igual que tú!'],
  ['¡¡INCREÍBLE!! ¡¡ESTOY VIVO!!', '¡¡DAME TODO!!'],
  [
    '¡¡¡NO TE RINDAS!!!',
    '¡¡¡SOMOS GUERREROS!!!',
    '¡¡¡ESTE MOMENTO ES ETERNO!!!',
  ],
];

const endDialogue = [
  'Joven guerrero...',
  'Me devolviste la esperanza.',
  'Si puedo soñar,',
  'puedo hacer realidad ese sueño.',
  '¡VE! ¡Sé la luz del reino!',
  '¡GRACIAS, amigo mío!',
];

const castleBlockedDlg = [
  'Aún no puedes entrar.',
  'Habla con todos en el reino',
  'y captura todos los tipos.',
];

const towerBlockedDlg = [
  'La puerta está cerrada.',
  'Necesitas una llave especial.',
  'Habla con los extranjeros...',
];

// ============================================================
// BLOQUE 11: SISTEMA DE MOVIMIENTO
// ============================================================

function moveEntity(checkSolid, cols, rows, map) {
  const p = G.pl;
  p.sprint = !!G.keys['z'];
  const spd = p.sprint ? 0.22 : 0.12;

  // Si está en medio de un paso, termina ese desplazamiento antes de aceptar otro.
  // Esto hace que el jugador avance de casilla en casilla, no flotando libremente.
  if (p.stepTarget) {
    const dx = p.stepTarget.x - p.x;
    const dy = p.stepTarget.y - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= spd) {
      p.lastStepFrom = p.stepFrom || { x: p.x, y: p.y };
      p.x = p.stepTarget.x;
      p.y = p.stepTarget.y;
      p.stepTarget = null;
      p.stepFrom = null;
      p.moving = false;
      p.f++;
      sfx.walk();
      return true; // acaba de entrar a una nueva casilla
    }

    p.x += (dx / dist) * spd;
    p.y += (dy / dist) * spd;
    p.moving = true;
    p.f++;
    if (p.f % (p.sprint ? 4 : 8) === 0) sfx.walk();
    return false;
  }

  // Mantener al jugador alineado a la cuadrícula cuando no está caminando.
  p.x = Math.round(p.x);
  p.y = Math.round(p.y);

  let dx = 0,
    dy = 0,
    dir = p.d;

  // Una sola dirección por paso: sin diagonales ni micro-deslizamientos.
  if (kh('ArrowUp')) {
    dy = -1;
    dir = 3;
  } else if (kh('ArrowDown')) {
    dy = 1;
    dir = 0;
  } else if (kh('ArrowLeft')) {
    dx = -1;
    dir = 2;
  } else if (kh('ArrowRight')) {
    dx = 1;
    dir = 1;
  }

  if (dx === 0 && dy === 0) {
    p.moving = false;
    return false;
  }

  p.d = dir;
  const nx = p.x + dx;
  const ny = p.y + dy;

  if (checkSolid(nx, ny, map, cols, rows)) {
    p.moving = false;
    return false;
  }

  p.stepFrom = { x: p.x, y: p.y };
  p.stepTarget = { x: nx, y: ny };
  p.moving = true;
  p.f++;
  return false;
}

// === SEGUIDOR EN TORRE (primera criatura del equipo) ===
function getFollowerPos() {
  if (!G.party.length) return null;
  // Posición simplificada detrás del jugador según dirección
  const px = G.pl.x,
    py = G.pl.y;
  switch (G.pl.d) {
    case 0:
      return { x: px, y: py - 0.6 }; // mirando abajo, seguidor arriba
    case 1:
      return { x: px - 0.6, y: py }; // mirando derecha, seguidor izquierda
    case 2:
      return { x: px + 0.6, y: py }; // mirando izquierda, seguidor derecha
    case 3:
      return { x: px, y: py + 0.6 }; // mirando arriba, seguidor abajo
    default:
      return { x: px - 0.5, y: py };
  }
}

// === UTILIDAD: ACERCAMIENTO A NPC ===
function nearNPC(n) {
  return Math.abs(G.pl.x - n.x) + Math.abs(G.pl.y - n.y) < 2;
}

// === UTILIDAD: TILE ACTUAL DEL JUGADOR ===
function playerTile() {
  return {
    c: Math.floor(G.pl.x),
    r: Math.floor(G.pl.y),
    tile:
      G.curMap === 'world'
        ? wMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'cave1'
        ? cave1[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'cave2'
        ? cave2[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'castle'
        ? castMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : G.curMap === 'tower'
        ? towerMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)]
        : null,
  };
}

// === CÁMARA ===
function updateCamera(cols, rows) {
  cam.x = Math.max(0, Math.min(G.pl.x * T - 304, cols * T - 640));
  cam.y = Math.max(0, Math.min(G.pl.y * T - 224, rows * T - 480));
}

// === TELETRANSPORTE SIMPLE ===
function tpPlayer(x, y, mapName = null) {
  G.pl.x = x;
  G.pl.y = y;
  if (mapName) G.curMap = mapName;
}

// === CONTROL DE CICLO POST-GAME DE OLO-MAN ===
function canRebattle(npc) {
  if (!postGame) return !npcDefeats[npc.flag];
  if (npc.flag === 'metOlo') return true; // Olo-Man siempre disponible post-game
  return !npcDefeats[npc.flag] || oloDefeated;
}

function markNPCDefeated(npc) {
  if (npc?.flag) npcDefeats[npc.flag] = true;
}

// Reinicia re-batallas tras vencer a Olo-Man
function resetRebattles() {
  Object.keys(npcDefeats).forEach((k) => {
    if (k !== 'metOlo') npcDefeats[k] = false;
  });
  oloDefeated = false;
  aN('¡Todos quieren combatir otra vez!');
}

// === NIVELES POR ZONA ===
// Mapa vertical 80x150.
// r = fila del mapa. Mientras más bajo el número, más al norte.

const WORLD_LEVEL_ZONES = [
  // Pueblos
  { id: 'pitch', nm: 'Aldea Pitch', rMin: 138, rMax: 149, min: 2, max: 5 },
  {
    id: 'storyboard',
    nm: 'Villa Storyboard',
    rMin: 105,
    rMax: 114,
    min: 8,
    max: 11,
  },
  { id: 'rodaje', nm: 'Cantera Rodaje', rMin: 77, rMax: 86, min: 14, max: 18 },
  {
    id: 'ultimatoma',
    nm: 'Feria Última Toma',
    rMin: 47,
    rMax: 56,
    min: 22,
    max: 26,
  },
  { id: 'montaje', nm: 'Prados Montaje', rMin: 17, rMax: 26, min: 31, max: 36 },

  // Rutas
  { id: 'route1', nm: 'Ruta 1', rMin: 115, rMax: 137, min: 4, max: 7 },
  { id: 'route2', nm: 'Ruta 2', rMin: 87, rMax: 104, min: 10, max: 14 },
  { id: 'route3', nm: 'Ruta 3', rMin: 57, rMax: 76, min: 18, max: 22 },
  { id: 'route4', nm: 'Ruta 4', rMin: 27, rMax: 46, min: 26, max: 31 },
  { id: 'route5', nm: 'Ruta 5', rMin: 2, rMax: 16, min: 36, max: 40 },
];

// Rangos especiales para mapas interiores
const SPECIAL_MAP_LEVELS = {
  cave1: { id: 'cave1', nm: 'Cueva Volcánica', min: 10, max: 16 },
  cave2: { id: 'cave2', nm: 'Cueva Cristalina', min: 26, max: 34 },
  castle: { id: 'castle', nm: 'Castillo Difusión', min: 40, max: 45 },
  tower: { id: 'tower', nm: 'Torre P.A.', min: 45, max: 58 },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function avgPartyLv() {
  if (!G.party.length) return 1;
  return Math.floor(G.party.reduce((s, c) => s + c.lv, 0) / G.party.length);
}

function secondStrongestLv() {
  if (!G.party.length) return 1;
  const levels = G.party.map((c) => c.lv).sort((a, b) => b - a);
  return levels[1] || levels[0] || 1;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Devuelve la zona del mundo según fila/columna.
// Por ahora usa rangos verticales; cuando el mapa sea más detallado,
// podemos hacerlo por rectángulos o tiles especiales.
function getWorldZoneAt(c, r) {
  for (const z of WORLD_LEVEL_ZONES) {
    if (r >= z.rMin && r <= z.rMax) return z;
  }

  // Fallback por si queda fuera de rango
  if (r > 137) return WORLD_LEVEL_ZONES.find((z) => z.id === 'pitch');
  if (r > 114) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route1');
  if (r > 104) return WORLD_LEVEL_ZONES.find((z) => z.id === 'storyboard');
  if (r > 86) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route2');
  if (r > 76) return WORLD_LEVEL_ZONES.find((z) => z.id === 'rodaje');
  if (r > 56) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route3');
  if (r > 46) return WORLD_LEVEL_ZONES.find((z) => z.id === 'ultimatoma');
  if (r > 26) return WORLD_LEVEL_ZONES.find((z) => z.id === 'route4');
  if (r > 16) return WORLD_LEVEL_ZONES.find((z) => z.id === 'montaje');
  return WORLD_LEVEL_ZONES.find((z) => z.id === 'route5');
}

function getCurrentLevelZone() {
  if (G.curMap === 'world') {
    return getWorldZoneAt(Math.floor(G.pl.x), Math.floor(G.pl.y));
  }

  if (SPECIAL_MAP_LEVELS[G.curMap]) {
    return SPECIAL_MAP_LEVELS[G.curMap];
  }

  return { id: 'unknown', nm: 'Zona desconocida', min: 5, max: 5 };
}


function getCurrentLocationHUD() {
  if (G.curMap === 'cave1') return { kind: 'CUEVA', name: 'Volcánica' };
  if (G.curMap === 'cave2') return { kind: 'CUEVA', name: 'Cristalina' };
  if (G.curMap === 'castle') return { kind: 'CASTILLO', name: 'Difusión' };
  if (G.curMap === 'tower') return { kind: 'TORRE', name: 'P.A.' };

  const c = Math.floor(G.pl.x),
    r = Math.floor(G.pl.y);
  const tile = wMap[r]?.[c];
  if (tile === 11 || tile === 13) return { kind: 'CASTILLO', name: 'Difusión' };
  if (tile === 12) return { kind: 'TORRE', name: 'P.A.' };

  const z = getWorldZoneAt(c, r);
  if (!z) return { kind: 'ZONA', name: 'Desconocida' };
  if (z.id && z.id.startsWith('route')) return { kind: 'RUTA', name: z.nm.replace('Ruta ', '') };
  return { kind: 'PUEBLO', name: z.nm };
}

function getNPCLevelZone(npc) {
  if (G.curMap === 'world') {
    return getWorldZoneAt(Math.floor(npc.x), Math.floor(npc.y));
  }

  if (SPECIAL_MAP_LEVELS[G.curMap]) {
    return SPECIAL_MAP_LEVELS[G.curMap];
  }

  return getCurrentLevelZone();
}

// Nivel para criaturas salvajes
function wildLv() {
  const z = getCurrentLevelZone();
  return randInt(z.min, z.max);
}
function getWildFleeChance() {
  if (G.curMap === 'world') {
    const z = getWorldZoneAt(Math.floor(G.pl.x), Math.floor(G.pl.y));
    if (z.id === 'route1') return 0.8;
  }

  return 0.6;
}

// Nivel para entrenadores
function scaledLv(base = 5, npc = null) {
  const z = npc ? getNPCLevelZone(npc) : getCurrentLevelZone();
  const avg = avgPartyLv();

  // Antes del post-game: el nivel queda dentro del rango de la zona.
  // Así una criatura muy leveleada no arrastra a todos los rivales.
  // Los líderes quedan cerca del techo de su zona para sentirse como prueba final.
  if (!postGame) {
    if (npc?.isLeader) return clamp(Math.max(base, avg + 1, z.max - 1), z.min, z.max);
    return clamp(Math.max(base, avg), z.min, z.max);
  }

  // Post-game: se desbloquean rebattles y los entrenadores vuelven a escalar.
  // Como mínimo usan el máximo de su zona.
  return Math.min(100, Math.max(z.max, avg));
}

// ============================================================
// BLOQUE 12: PANTALLAS Y VERIFICACIONES
// ============================================================

// === PANTALLA DE TÍTULO ===
function playTitleHorn() {
  if (!sfx.on || !sfx.c) return;
  sfx.n(392, 0.22, 'square', 0.14);
  setTimeout(() => sfx.n(523, 0.26, 'square', 0.16), 120);
  setTimeout(() => sfx.n(659, 0.32, 'square', 0.18), 260);
  setTimeout(() => sfx.n(784, 0.45, 'triangle', 0.16), 420);
}

function startNewGameFlow() {
  clearAllGameSaves();
  G.hasSave = false;
  G.sSel = 0;
  // El protagonista inicia centrado en Aldea Pitch mirando a Alessandro.
  G.curMap = 'world';
  G.pl.x = 20;
  G.pl.y = 145;
  G.pl.d = 3;
  G.pl.stepTarget = null;
  G.pl.moving = false;
  G.scr = 'intro';
  G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
}

function uTitle() {
  G.tFr++;
  if (G.tFr > 182 && !G.titleHornPlayed) {
    playTitleHorn();
    G.titleHornPlayed = true;
  }
  G.hasSave = hasSaveGame();
  const optCount = G.hasSave ? 2 : 1;
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.titleSel = (G.titleSel + optCount - 1) % optCount;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.titleSel = (G.titleSel + 1) % optCount;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.hasSave && G.titleSel === 0) {
      if (loadGame()) {
        G.scr = 'world';
        aN('¡Partida cargada!');
      } else {
        startNewGameFlow();
      }
    } else if (G.hasSave && G.titleSel === 1) {
      G.scr = 'confirmReset';
      G.resetSel = 1; // en Nueva partida, la opción principal es confirmar
      G.resetFromTitle = true;
    } else {
      startNewGameFlow();
    }
  }
}

function dTitle() {
  const f = G.tFr;
  const phase = f < 180 ? 'sky' : f < 220 ? 'fanfare' : 'carousel';

  if (phase === 'sky') {
    // Animación inicial: cielo bonito, nubes suaves y profundidad pixel-art.
    const gr = cx.createLinearGradient(0, 0, 0, 480);
    gr.addColorStop(0, '#79C8FF');
    gr.addColorStop(0.55, '#BEE8FF');
    gr.addColorStop(1, '#E8F8D8');
    cx.fillStyle = gr;
    cx.fillRect(0, 0, 640, 480);

    // Sol suave
    cx.globalAlpha = 0.7;
    cx.fillStyle = '#FFF0A0';
    pixelGlow(530, 82, 42, 42);
    cx.globalAlpha = 0.16;
    pixelGlow(530, 82, 75, 75);
    cx.globalAlpha = 1;

    // Nubes pixeladas con pseudo 3D
    for (let i = 0; i < 7; i++) {
      const nx = (i * 130 - f * (0.35 + i * 0.03)) % 780 - 80;
      const ny = 45 + (i % 3) * 48;
      cx.fillStyle = 'rgba(120,160,210,.20)';
      cx.fillRect(nx + 8, ny + 14, 92, 18);
      cx.fillStyle = '#FFFFFF';
      cx.fillRect(nx, ny + 12, 96, 16);
      cx.fillRect(nx + 18, ny + 4, 28, 18);
      cx.fillRect(nx + 46, ny, 34, 22);
      cx.fillStyle = '#D8ECFF';
      cx.fillRect(nx + 4, ny + 24, 86, 4);
    }

    // Campo 3D suavizado
    cx.fillStyle = '#63B850';
    cx.fillRect(0, 292, 640, 188);
    cx.fillStyle = '#4C9C40';
    for (let y = 310; y < 480; y += 18) cx.fillRect(0, y, 640, 2);
    cx.fillStyle = '#C8B078';
    for (let yy = 292; yy < 480; yy += 8) {
      const k = (yy - 292) / 188;
      const ww = 24 + k * 80;
      cx.fillRect(320 - ww / 2, yy, ww, 8);
    }

    cx.textAlign = 'center';
    cx.fillStyle = '#1A2A4A';
    cx.font = '12px "Press Start 2P"';
    cx.fillText('Un nuevo día despierta en el Reino...', 320, 415);
    cx.textAlign = 'left';
    return;
  }

  if (phase === 'fanfare') {
    // Fanfarria sin pantalla negra: cortina nocturna pixelada sobre el cielo.
    const k = (f - 180) / 40;
    cx.fillStyle = '#0A0A24';
    cx.fillRect(0, 0, 640, 480);
    for (let yy = 0; yy < 480; yy += 16) {
      cx.fillStyle = yy % 32 === 0 ? '#101848' : '#080818';
      cx.fillRect(0, yy, 640, 8);
    }
    cx.textAlign = 'center';
    cx.fillStyle = '#FFD870';
    cx.font = '18px "Press Start 2P"';
    cx.fillText('¡TA-RA-RAAA!', 320, 225);
    cx.fillStyle = '#A0B0C0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('El desfile del reino comienza...', 320, 255);
    // Destellos cuadrados de trompeta
    cx.fillStyle = '#FFE890';
    for (let i = 0; i < 10; i++) {
      const sx = 120 + i * 44;
      const sy = 295 + ((i * 17 + f) % 28);
      cx.fillRect(sx, sy, 4, 4);
    }
    cx.textAlign = 'left';
    return;
  }

  // Carrusel principal: criaturas desfilan de derecha a izquierda y se repite.
  const cf = f - 220;
  const sky = cx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#07071C');
  sky.addColorStop(0.45, '#111A3A');
  sky.addColorStop(1, '#102B22');
  cx.fillStyle = sky;
  cx.fillRect(0, 0, 640, 480);

  for (let i = 0; i < 80; i++) {
    cx.globalAlpha = Math.sin(f * 0.035 + i * 0.7) * 0.45 + 0.55;
    cx.fillStyle = i % 9 === 0 ? '#FFE8A0' : '#F8F8FF';
    cx.fillRect((i * 137 + f * 0.18) % 640, (i * 83) % 250, i % 11 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
  }
  cx.globalAlpha = 1;

  // Luna, montañas pixeladas y castillo integrado al fondo
  cx.globalAlpha = 0.75;
  cx.fillStyle = '#F8E8A0';
  pixelGlow(500, 82, 36, 36);
  cx.globalAlpha = 1;

  // Montañas sin curvas: bloques escalonados tipo pixel-art
  const farPeaks = [
    { x: -40, y: 260, w: 150, h: 54 }, { x: 70, y: 242, w: 170, h: 72 },
    { x: 210, y: 255, w: 150, h: 58 }, { x: 330, y: 236, w: 190, h: 78 },
    { x: 500, y: 252, w: 170, h: 62 },
  ];
  farPeaks.forEach((m) => {
    cx.fillStyle = '#17213A';
    for (let yy = 0; yy < m.h; yy += 8) {
      const k = yy / m.h;
      const ww = Math.max(18, m.w * (1 - k));
      cx.fillRect(m.x + (m.w - ww) / 2, m.y + yy, ww, 8);
    }
    cx.fillStyle = 'rgba(255,255,255,.08)';
    cx.fillRect(m.x + m.w * .46, m.y + 8, Math.max(8, m.w * .12), 8);
  });
  const nearPeaks = [
    { x: -60, y: 286, w: 220, h: 46 }, { x: 118, y: 272, w: 230, h: 60 },
    { x: 314, y: 280, w: 230, h: 52 }, { x: 500, y: 270, w: 210, h: 62 },
  ];
  nearPeaks.forEach((m) => {
    cx.fillStyle = '#1D2D35';
    for (let yy = 0; yy < m.h; yy += 8) {
      const k = yy / m.h;
      const ww = Math.max(24, m.w * (1 - k * .9));
      cx.fillRect(m.x + (m.w - ww) / 2, m.y + yy, ww, 8);
    }
  });

  // Castillo más claro y menos contrastado, encajado detrás de las montañas
  cx.globalAlpha = 0.82;
  px(452, 168, 88, 86, '#17223A');
  px(434, 186, 26, 68, '#1B2940');
  px(532, 186, 26, 68, '#1B2940');
  px(462, 142, 18, 34, '#1B2940');
  px(512, 142, 18, 34, '#1B2940');
  px(488, 122, 18, 48, '#1E3048');
  px(466, 155, 10, 10, '#D8B840');
  px(516, 155, 10, 10, '#D8B840');
  px(492, 138, 10, 10, '#D8B840');
  px(488, 228, 16, 26, '#122034');
  cx.globalAlpha = 1;

  cx.fillStyle = '#204A23'; cx.fillRect(0, 310, 640, 170);
  cx.fillStyle = '#B8A070';
  for (let yy = 310; yy < 480; yy += 8) {
    const k = (yy - 310) / 170;
    const ww = 28 + k * 68;
    cx.fillRect(320 - ww / 2, yy, ww, 8);
  }

  // Logo sin recuadro negro: placa clara de pixel-art con relieve
  cx.textAlign = 'center';
  cx.fillStyle = 'rgba(255,232,160,.18)';
  cx.fillRect(88, 34, 464, 118);
  cx.fillStyle = 'rgba(255,255,255,.20)';
  cx.fillRect(96, 40, 448, 4);
  cx.fillRect(96, 44, 4, 96);
  cx.fillStyle = 'rgba(80,48,20,.28)';
  cx.fillRect(96, 140, 448, 5);
  cx.fillRect(540, 44, 5, 96);
  px(88, 34, 14, 14, '#C8A830');
  px(538, 34, 14, 14, '#C8A830');
  px(88, 138, 14, 14, '#C8A830');
  px(538, 138, 14, 14, '#C8A830');
  cx.fillStyle = '#000'; cx.font = '18px "Press Start 2P"'; cx.fillText('CRIATURAS DEL', 323, 84); cx.font = '28px "Press Start 2P"'; cx.fillText('REINO', 323, 124);
  cx.fillStyle = '#FFE070'; cx.font = '18px "Press Start 2P"'; cx.fillText('CRIATURAS DEL', 320, 81); cx.font = '28px "Press Start 2P"'; cx.fillText('REINO', 320, 121);

  // El desfile respeta el mismo orden de aparición del Criaturario.
  const ids = dexIds();
  const spacing = 92;
  const totalW = ids.length * spacing;
  const base = 690 - (cf * 0.55 % (totalW + 760));
  ids.forEach((id, i) => {
    const x = base + i * spacing;
    if (x < -80 || x > 700) return;
    const y = 258 + Math.sin((cf + i * 18) * 0.04) * 6;
    dShadow(x + 22, y + 45, 18, 5);
    cx.save();
    cx.translate(x, y);
    cx.scale(1.35, 1.35);
    dCre(0, 0, id, 5, f);
    cx.restore();
    cx.fillStyle = '#E8E8F0';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(CDB[id].nm, x + 24, y + 64);
  });

  // Menú de entrada
  dBoxMenu(122, 368, 396, G.hasSave ? 86 : 62, G.hasSave ? 'INICIO' : 'NUEVA AVENTURA');
  if (G.hasSave) {
    const opts = ['Continuar partida guardada', 'Nueva partida desde Aldea Pitch'];
    opts.forEach((o, i) => {
      cx.fillStyle = G.titleSel === i ? '#ffd700' : '#D8D8E8';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${G.titleSel === i ? '▶ ' : '  '}${o}`, 320, 396 + i * 24);
    });
  } else {
    cx.fillStyle = Math.sin(f * 0.1) > 0 ? '#fff' : '#A0B0C0';
    cx.font = '9px "Press Start 2P"';
    cx.fillText('ESPACIO para comenzar', 320, 405);
  }
  cx.fillStyle = '#606878'; cx.font = '6px "Press Start 2P"'; cx.fillText('Flechas = elegir | SPACE = confirmar', 320, 460);
  cx.textAlign = 'left';
}

// === INTRO TUTORIAL: ALESSANDRO ENTREGA EL INICIAL ===
const INTRO_LINES = [
  '¡Hey! ¡Bienvenido a Aldea Pitch!',
  'Soy Alessandro. Este reino vive junto a criaturas mágicas.',
  'Los Proa las cuidan cuando descansan, y los viajeros forman vínculos con ellas.',
  'Para avanzar entre pueblos necesitarás diplomas de líderes, como medallas.',
  'No te contaré todo: el camino, las cuevas y el castillo deben sorprenderte.',
  'Pero no irás solo. Elige un compañero inicial de Fuego, Agua o Planta.'
];

function uIntro() {
  if (!G.intro) G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
  const it = G.intro;
  if (it.phase === 0) {
    it.y += 2.4;
    if (it.y >= 198 || kp(' ') || kp('Enter')) {
      it.y = 198;
      it.phase = 1;
      it.tm = 0;
    }
    return;
  }
  it.tm++;
  const line = INTRO_LINES[it.li];
  if (!it.full && it.tm % 2 === 0) {
    it.ci++;
    if (it.ci >= line.length) it.full = true;
  }
  if (kp(' ') || kp('Enter')) {
    if (!it.full) {
      it.ci = line.length;
      it.full = true;
    } else {
      it.li++;
      if (it.li >= INTRO_LINES.length) {
        G.sSel = 0;
        G.scr = 'starter';
        G.intro = null;
        return;
      }
      it.ci = 0;
      it.tm = 0;
      it.full = false;
      sfx.sel();
    }
  }
}

function dIntro() {
  // Escena propia de introducción para evitar zonas negras por límites del mapa.
  const it = G.intro || { y: 198, phase: 1, li: 0, ci: 0, full: false };

  // Fondo completo de Aldea Pitch, dibujado a pantalla completa.
  cx.fillStyle = '#58A830';
  cx.fillRect(0, 0, 640, 480);
  cx.fillStyle = '#48982A';
  for (let yy = 0; yy < 480; yy += 32) {
    for (let xx = 0; xx < 640; xx += 32) {
      if (((xx + yy) / 32) % 2 === 0) cx.fillRect(xx, yy, 32, 32);
    }
  }
  // Plaza y caminos pixelados
  cx.fillStyle = '#C8B898';
  cx.fillRect(192, 132, 256, 210);
  cx.fillStyle = '#D8C8A8';
  for (let yy = 142; yy < 332; yy += 32) cx.fillRect(206, yy, 228, 4);
  for (let xx = 206; xx < 434; xx += 32) cx.fillRect(xx, 148, 4, 184);
  cx.fillStyle = '#B8A888';
  cx.fillRect(306, 0, 28, 480);
  cx.fillRect(0, 250, 640, 28);

  // Flores, cajas, pozo y muñecos de entrenamiento como contexto visual.
  for (let i = 0; i < 12; i++) {
    const fx = 70 + (i * 47) % 500;
    const fy = 80 + (i * 71) % 300;
    cx.fillStyle = i % 2 ? '#E85A82' : '#E8C830';
    cx.fillRect(fx, fy, 5, 5);
    cx.fillStyle = '#38A028';
    cx.fillRect(fx + 2, fy + 5, 1, 6);
  }
  // Pozo
  cx.fillStyle = '#6E6E6E'; cx.fillRect(286, 170, 42, 18);
  cx.fillStyle = '#8A8A8A'; cx.fillRect(292, 164, 30, 8);
  cx.fillStyle = '#202838'; cx.fillRect(296, 174, 22, 8);
  cx.fillStyle = '#6A4828'; cx.fillRect(290, 144, 5, 24); cx.fillRect(319, 144, 5, 24); cx.fillRect(290, 140, 34, 5);
  // Cajas
  cx.fillStyle = '#8A5A28'; cx.fillRect(452, 226, 22, 22); cx.fillRect(478, 214, 24, 34);
  cx.fillStyle = '#A07038'; cx.fillRect(456, 230, 14, 4); cx.fillRect(482, 218, 16, 4);
  // Muñecos
  cx.fillStyle = '#6A4828'; cx.fillRect(150, 210, 6, 42); cx.fillRect(132, 224, 42, 6);
  cx.fillStyle = '#C8B080'; cx.fillRect(140, 202, 26, 16);
  cx.fillStyle = '#E83030'; cx.fillRect(146, 208, 5, 5); cx.fillRect(156, 208, 5, 5);

  // Protagonista al centro de la imagen, mirando hacia Alessandro.
  dPlayerGBA(304, 252, 3, fr);

  // Alessandro se mueve hasta quedar al frente del jugador.
  dNPC(304, it.y, 'alessandro', fr);

  if (it.phase === 0) {
    dDialogBox(20, 390, 600, 70, 'Alessandro');
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Alessandro se acerca para darte la bienvenida...', 36, 420);
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('SPACE: acelerar', 36, 448);
    return;
  }

  const shown = INTRO_LINES[it.li].substring(0, it.ci);
  const lines = wrapText(shown, 48);
  dDialogBox(20, 372, 600, 96, 'Alessandro');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  lines.forEach((ln, i) => cx.fillText(ln, 36, 400 + i * 15));
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`${it.li + 1}/${INTRO_LINES.length}`, 560, 456);
  if (it.full) {
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', 590, 456 + Math.sin(fr * 0.2) * 2);
  }
}

// === PANTALLA DE SELECCIÓN DE INICIAL ===
function uStarter() {
  if (kp('ArrowLeft')) {
    G.sSel = (G.sSel + 2) % 3;
    sfx.sel();
  }
  if (kp('ArrowRight')) {
    G.sSel = (G.sSel + 1) % 3;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    const ids = ['flameye', 'axolotl', 'gorilan'];
    const c = new Cre(ids[G.sSel], 5);
    G.party = [c];
    proa = [];
    sfx.cap();
    G.curMap = 'world';
    G.pl.x = 20;
    G.pl.y = 145;
    G.pl.d = 3;
    G.pl.stepTarget = null;
    G.pl.moving = false;
    updateCamera(WC, WR);
    // Evita que el SPACE usado para confirmar dispare otra acción en el primer frame del mundo.
    G.keys[' '] = false;
    G.keys['Enter'] = false;
    G.held[' '] = false;
    G.held['Enter'] = false;
    G.kcd[' '] = false;
    G.kcd['Enter'] = false;
    G.scr = 'world';
    aN(`¡${c.nm} se unió a tu equipo!`);
  }
}

function dStarter() {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);

  // Título
  dBox(60, 8, 520, 46);
  cx.fillStyle = '#ffd700';
  cx.font = '11px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText('Alessandro te entrega un compañero', 320, 34);
  cx.fillStyle = '#aaa';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Solo Fuego, Agua o Planta | SPACE confirmar', 320, 48);

  const starters = [
    {
      id: 'flameye',
      nm: 'Flameye',
      tp: 'fire',
      desc: 'Vanidoso pero valiente',
    },
    { id: 'axolotl', nm: 'Ajolotín', tp: 'water', desc: 'Siempre sonriente' },
    { id: 'gorilan', nm: 'Gorilán', tp: 'plant', desc: 'Poeta fuerte de 3 etapas' },
  ];

  starters.forEach((s, i) => {
    const bx = 100 + i * 150,
      by = 68,
      sel = G.sSel === i;

    // Fondo seleccionado
    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.08)';
      cx.fillRect(bx, by - 2, 139, 400);
    }

    // Caja
    dBox(bx + 2, by, 135, 395);

    // Borde dorado si seleccionado
    if (sel) {
      cx.strokeStyle = '#ffd700';
      cx.lineWidth = 2;
      cx.strokeRect(bx + 1, by - 1, 137, 397);
      cx.lineWidth = 1;
    }

    // Nombre
    cx.fillStyle = sel ? '#ffd700' : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(s.nm, bx + 68, by + 18);

    // Tipo
    cx.fillStyle = tCol(s.tp);
    cx.font = '7px "Press Start 2P"';
    cx.fillText(tEmo(s.tp) + ' ' + tNam(s.tp), bx + 68, by + 32);

    // Sprite de criatura
    dCre(bx + 36, by + 42, s.id, 3, fr);

    if (sel) {
      // Stats
      const pc = new Cre(s.id, 5);
      cx.fillStyle = '#fff';
      cx.font = '7px "Press Start 2P"';
      cx.textAlign = 'left';
      cx.fillText(`HP: ${pc.mHp}`, bx + 15, by + 280);
      cx.fillText(`ATK:${pc.ak}`, bx + 15, by + 296);
      cx.fillText(`DEF:${pc.df}`, bx + 15, by + 312);
      cx.fillText(`SPD:${pc.sp}`, bx + 15, by + 328);

      // Descripción
      cx.fillStyle = '#A0B0C0';
      cx.font = '6px "Press Start 2P"';
      cx.textAlign = 'center';
      cx.fillText(s.desc, bx + 68, by + 350);

      // Flecha indicadora
      cx.fillStyle = '#ffd700';
      cx.font = '14px "Press Start 2P"';
      cx.fillText('▼', bx + 68, by - 8 + Math.sin(fr * 0.15) * 3);
    }
  });
  cx.textAlign = 'left';
}

// ============================================================
// SISTEMA DE MISIONES DE LÍDERES (PROA) Y DIPLOMAS
// ============================================================

// Data de las misiones de cada líder
const LEADER_MISSIONS = {
  tamara: {
    leaderNm: 'Tamara',
    diploma: 'Fotografía Estética',
    dlgStart: [
      '¡Hola! Soy la líder de este pueblo.',
      'Pero primero demuestra que mereces',
      'el diploma. Tengo un reto para ti.',
      'Muéstrame que entiendes la armonía',
      'de los elementos. Tráeme una criatura',
      'de Fuego, una de Agua y una de Planta.',
      '¡Las necesito en tu equipo!',
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
      const types = new Set(G.party.map((c) => c.tp));
      return types.has('fire') && types.has('water') && types.has('plant');
    },
  },
  luchito: {
    leaderNm: 'Luchito',
    diploma: 'Documental',
    dlgStart: [
      '¡El amor me da fuerzas!',
      'Pero primero necesito ver',
      'que sabes lo que haces.',
      'Demuéstrame dominio del combate.',
      '¡Hazme 3 golpes súper efectivos!',
      'Puedes hacerlo contra cualquiera.',
    ],
    dlgAccept: ['¡Ve y demuestra tu poder!'],
    dlgFail: [
      'Aún necesitas más golpes súper efectivos.',
      '¡Usa el tipo correcto contra el tipo correcto!',
    ],
    dlgWin: ['¡Esos golpes fueron hermosos!', '¡Ahora sí, el amor nos guía!'],
    dlgVictory: [
      '¡Toma tu diploma! "Documental"...',
      'Suena como algo que un periodista',
      'como Piero querría. ¡Enhorabuena!',
    ],
    superEffectiveHits: 0,
    check: function () {
      return LEADER_MISSIONS.luchito.superEffectiveHits >= 3;
    },
  },
  andrea: {
    leaderNm: 'Andrea',
    diploma: 'Ficción',
    dlgStart: [
      '¡Lección especial antes de la batalla!',
      'Te haré 3 preguntas.',
      'Responde correctamente 2 de 3',
      'y te dejo combatir.',
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
      'Tengo curiosidad por las personas.',
      'Habla con los varones del pueblo',
      'y cuéntame algo sobre ellos.',
      '¡Chismes aceptados!',
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
      return LEADER_MISSIONS.dan.gossip >= LEADER_MISSIONS.dan.gossipNeeded;
    },
  },
};

function resetLeaderMissions() {
  LEADER_MISSIONS.luchito.superEffectiveHits = 0;
  LEADER_MISSIONS.andrea.quizScore = 0;
  LEADER_MISSIONS.andrea.quizIdx = 0;
  LEADER_MISSIONS.andrea.quizActive = false;
  LEADER_MISSIONS.dan.gossip = 0;
  LEADER_MISSIONS.dan.reported = [];
}

// Estado de diplomas del jugador
let diplomas = {
  tamara: false,
  luchito: false,
  andrea: false,
  dan: false,
};

function hasAllDiplomas() {
  return diplomas.tamara && diplomas.luchito && diplomas.andrea && diplomas.dan;
}

function hasDiploma(leader) {
  return diplomas[leader] === true;
}

function giveDiploma(leader) {
  diplomas[leader] = true;
  sfx.cap();
  const d = LEADER_MISSIONS[leader];
  aN(`¡Diploma "${d.diploma}" obtenido!`);
}

// Función que verifica si el jugador puede pasar de un pueblo al siguiente
function canPassRoute(fromPueblo) {
  if (G.supervisor) return true;
  switch (fromPueblo) {
    case 'pitch':
      return true; // P1 -> P2 sin diploma
    case 'storyboard':
      return hasDiploma('tamara');
    case 'rodaje':
      return hasDiploma('luchito');
    case 'ultimatoma':
      return hasDiploma('andrea');
    case 'montaje':
      return hasDiploma('dan');
    default:
      return true;
  }
}


const ROUTE_GATES = [
  { from: 'storyboard', leader: 'tamara', x: 40, y: 104, w: 11, place: 'Villa Storyboard' },
  { from: 'rodaje', leader: 'luchito', x: 54, y: 76, w: 11, place: 'Cantera Rodaje' },
  { from: 'ultimatoma', leader: 'andrea', x: 30, y: 46, w: 11, place: 'Feria Última Toma' },
  { from: 'montaje', leader: 'dan', x: 44, y: 16, w: 11, place: 'Prados Montaje' },
];

function routeGateAt(c, r) {
  return ROUTE_GATES.find((g) => r === g.y && Math.abs(c - g.x) <= Math.floor(g.w / 2));
}


function routeProgressGate(fromX, fromY, toX, toY) {
  // Bloqueo real de progreso: no importa si el jugador intenta rodear al Proa,
  // cruzar el límite norte del tramo requiere el diploma correspondiente.
  if (toY >= fromY) return null;
  return ROUTE_GATES.find((g) => fromY > g.y && toY <= g.y && !canPassRoute(g.from)) || null;
}

function routeGateBlocks(c, r) {
  const g = routeGateAt(c, r);
  return !!(g && !canPassRoute(g.from));
}

function showRouteBlockedDialog(gate) {
  const mission = LEADER_MISSIONS[gate.leader];
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: 'Personal' },
    dlgArr: [
      'Soy parte del personal de',
      'la comunidad univ...ficada',
      `asignado a ${gate.place}.`,
      'Los árboles cierran los bordes:',
      'solo este camino queda abierto.',
      `Para pasar, vence a ${mission.leaderNm}`,
      `y trae el diploma "${mission.diploma}".`,
    ],
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
  };
  sfx.nef();
}


function nearRouteSign(sign) {
  return G.curMap === 'world' && Math.abs(G.pl.x - sign.x) <= 1 && Math.abs(G.pl.y - sign.y) <= 1;
}

function checkRouteSign() {
  const sign = ROUTE_SIGNS.find((sg) => nearRouteSign(sg));
  if (!sign) return false;
  G.scr = 'dialog';
  G.ds = { npc: { nm: sign.name }, dlgArr: sign.lines, li: 0, ci: 0, tm: 0, full: false };
  sfx.sel();
  return true;
}

// === VERIFICACIONES ===

function checkAllTalked() {
  const req = [
    'metAles',
    'metFab',
    'metNic',
    'metCla',
    'metRob',
    'metBri',
    'metPau',
    'metTam',
    'metNah',
    'metPac',
    'metGab',
    'metHer',
    'metAng',
    'metDay',
    'metDey',
    'metAnd',
    'metAlej',
    'metLuis',
    'metAlex',
    'metGon',
    'metJai',
    'metDan2',
    'metDaniel',
    'metLuch',
    'metXim',
    'metAnd2',
    'metOlo',
  ];
  G.allTalked = req.every((f) => G.talkedTo[f]);
}

function checkAllCaught() {
  const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
  G.allCaught = types.every(
    (t) => G.party.some((c) => c.tp === t) || proa.some((c) => c.tp === t)
  );
  if (G.allCaught) aN('¡Todos los tipos capturados!');
}

// === VERIFICAR LLAVE DE LA TORRE ===
function checkTowerKey() {
  if (
    towerKey.edison &&
    towerKey.roberto &&
    towerKey.gabriela &&
    towerKey.ximena
  ) {
    towerOpen = true;
    aN('¡La llave de la torre brilla!');
    sfx.cap();
  }
}

// === VERIFICAR POST-GAME ===

// === VERIFICAR SI NPC PUEDE COMBATIR ===
function canNPCBattle(npc) {
  if (!npc.battle) return false;

  // Pre-game: siempre puede (primera vez)
  if (!postGame) return true;

  // Post-game: verificar ciclo de Olo-Man
  return canRebattle(npc);
}

// === OBTENER DIÁLOGO CORRECTO SEGÚN ESTADO ===
function getNPCDialog(npc) {
  // Post-game: usar diálogo post si existe
  if (postGame && npc.postDlg) {
    return Array.isArray(npc.postDlg[0])
      ? npc.postDlg[Math.floor(Math.random() * npc.postDlg.length)]
      : npc.postDlg;
  }
  // Normal: diálogo aleatorio
  if (npc.dlg) {
    return npc.dlg[Math.floor(Math.random() * npc.dlg.length)];
  }
  return ['...'];
}

// === OBTENER EQUIPO DE NPC SEGÚN NIVEL ===
function getNPCTeam(npc) {
  const lv = scaledLv(5, npc);

  // Nicole post-game: equipo difícil dragón/hada/fuego
  if (npc.flag === 'metNic' && postGame) {
    const hardLv = Math.min(100, lv + 3);
    return [
      new Cre('serpentdrg', hardLv),
      new Cre('sidhe', hardLv),
      new Cre('salamandro', hardLv),
    ];
  }

  if (npc.isAngelly) {
    const minLv = Math.min(...G.party.map((c) => c.lv));
    const alv = Math.max(1, minLv - 2);
    return [
      new Cre('flameye', alv, true),
      new Cre('sidhe', alv, true),
      new Cre('zumbaflor', alv, true),
    ];
  }

  if (npc.isPunk) {
    return [
      new Cre('pixie', lv),
      new Cre('zumbaflor', lv),
      new Cre('sidhe', lv),
    ];
  }

  if (npc.team) {
    return npc.team.map((c) => {
      const originalLv = c.lv || lv;
      return new Cre(
        c.id,
        postGame ? Math.max(originalLv, lv) : Math.max(originalLv, lv)
      );
    });
  }

  if (npc.fixedTeam) {
    return npc.fixedTeam.map((c) => new Cre(c.id, lv));
  }

  // Aleatorio
  const pool = Object.keys(CDB).filter((k) => k !== 'serafox');
  return [
    new Cre(pool[Math.floor(Math.random() * pool.length)], lv),
    new Cre(pool[Math.floor(Math.random() * pool.length)], lv),
  ];
}

// === OBTENER BATTLE INTRO SEGÚN ESTADO ===
function getNPCBattleIntro(npc) {
  // Nicole crucificada post-game
  if (postGame && npc.flag === 'metNic' && npc.postBattleIntro) {
    return npc.postBattleIntro;
  }
  // Intro normal
  if (npc.battleIntro) return npc.battleIntro;
  return [`¡${npc.nm} te desafía!`];
}

// ============================================================
// BLOQUE 13: LÓGICA MUNDO/CUEVA/CASTILLO/TORRE + CHECKNPC
// ============================================================

// === MUNDO PRINCIPAL ===
function uWorld() {
  // Proas de ruta: bloquean la salida norte si falta el diploma del líder.
  if (!G.pl.stepTarget) {
    let dx = 0, dy = 0;
    if (kh('ArrowUp')) dy = -1;
    else if (kh('ArrowDown')) dy = 1;
    else if (kh('ArrowLeft')) dx = -1;
    else if (kh('ArrowRight')) dx = 1;
    if (dx || dy) {
      const fromX = Math.round(G.pl.x),
        fromY = Math.round(G.pl.y),
        toX = fromX + dx,
        toY = fromY + dy;
      const progressGate = routeProgressGate(fromX, fromY, toX, toY);
      if (progressGate) {
        showRouteBlockedDialog(progressGate);
        return;
      }
      const gate = routeGateAt(toX, toY);
      if (gate && !canPassRoute(gate.from)) {
        showRouteBlockedDialog(gate);
        return;
      }
    }
  }

  // Entrada a cuevas en modo cuadrícula: si estás justo debajo de una puerta
  // de cueva y empujas hacia arriba, entras sin intentar caminar sobre el muro.
  if (!G.pl.stepTarget && kh('ArrowUp')) {
    const etc = Math.round(G.pl.x),
      etr = Math.round(G.pl.y);
    if (wMap[etr - 1]?.[etc] === 9) {
      G.prevPos = { x: G.pl.x, y: G.pl.y };
      G.caveReturnPos = { x: G.pl.x, y: G.pl.y };
      G.curMap = etc <= 40 ? 'cave1' : 'cave2';
      G.pl.x = Math.floor(CC / 2);
      G.pl.y = CR - 3;
      G.pl.d = 3;
      G.pl.stepTarget = null;
      G.pl.moving = false;
      updateCamera(CC, CR);
      aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
      return;
    }
  }

  const mv = moveEntity((c, r) => solidW(c, r), WC, WR);

  if (mv) {
    const tc = Math.floor(G.pl.x),
      tr = Math.floor(G.pl.y);
    const tile = wMap[tr]?.[tc];

    // Encuentros en hierba alta
    if (!G.supervisor && tile === 5 && Math.random() < 0.018975) {
      startWild();
    }

    // Encuentros cerca de agua (más agua)
    if (tile === 0) {
      let nearWater = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (wMap[tr + dr]?.[tc + dc] === 2) nearWater = true;
        }
      if (!G.supervisor && nearWater && Math.random() < 0.0088) startWild('water');
    }

    // Cristal Vínculo
    if (tile === 10) {
      wMap[tr][tc] = 0;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales Vínculo!');
    }

    // Entrada cueva
    // === ENTRADA A CUEVA (empujar ↑ contra la puerta) ===
    if (kh('ArrowUp')) {
      const etc = Math.floor(G.pl.x),
        etr = Math.floor(G.pl.y);
      if (wMap[etr - 1]?.[etc] === 9 && G.pl.y - etr < 0.4) {
        G.prevPos = { x: G.pl.x, y: G.pl.y }; // Guarda: un bloque abajo de la entrada
        G.curMap = etc <= 40 ? 'cave1' : 'cave2';
        G.pl.x = Math.floor(CC / 2);
        G.pl.y = CR - 3; // Un bloque adelante de la salida interna
        G.pl.d = 3; // Mirando hacia el interior
        updateCamera(CC, CR);
        aN(etc <= 40 ? 'Cueva Volcánica...' : 'Cueva Cristalina...');
        return;
      }
    }

    // Puerta del castillo
    if (tile === 11) {
      if (G.allTalked && G.allCaught) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        G.curMap = 'castle';
        G.pl.x = 15;
        G.pl.y = KR - 3;
        aN('¡Castillo Real!');
      } else {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: 'Guardia' },
          dlgArr: castleBlockedDlg,
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      }
    }

    // Torre Presupuesto Aprobado
    if (tile === 12) {
      if (towerOpen) {
        G.prevPos = { x: G.pl.x, y: G.pl.y };
        G.curMap = 'tower';
        G.pl.x = Math.floor(TWC / 2);
        G.pl.y = TWR - 3;
        aN('Torre Presupuesto Aprobado');
      } else {
        G.scr = 'dialog';
        G.ds = {
          npc: { nm: '???' },
          dlgArr: towerBlockedDlg,
          li: 0,
          ci: 0,
          tm: 0,
          full: false,
        };
        sfx.nef();
      }
    }
  }

  // Acción
  if (kp(' ')) {
    if (checkRouteSign()) return;
    if (G.supervisor) {
      aN('Supervisor: interacción con NPCs desactivada.');
      return;
    }
    checkNPC(npcs);
    // Edison post-game
    if (postGame) checkEdison();
  }

  // Menú
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(WC, WR);
}

// === CUEVA ===
function uCave() {
  const map = G.curMap === 'cave1' ? cave1 : cave2;

  if (tryOloSecretEntrance()) return;

  const oldX = G.pl.x;
  const oldY = G.pl.y;

  const mv = moveEntity(solidC, CC, CR, map);

  if (mv) {
    const from = G.pl.lastStepFrom || { x: oldX, y: oldY };
    const oldC = Math.floor(from.x);
    const oldR = Math.floor(from.y);
    const oldTile = map[oldR]?.[oldC];
    const tc = Math.floor(G.pl.x);
    const tr = Math.floor(G.pl.y);
    let tile = map[tr]?.[tc];

    // Salida:
    // SOLO si vienes desde arriba y caminaste hacia abajo
    if (tile === 27 && oldTile !== 27 && tr > oldR) {
      const fromMap = G.curMap; // Guardamos el nombre antes de cambiarlo
      G.curMap = 'world';

      if (G.caveReturnPos) {
        G.pl.x = G.caveReturnPos.x;
        G.pl.y = G.caveReturnPos.y;
        G.pl.d = 0; // mirando abajo
      } else {
        // fallback por si no existe retorno guardado
        if (fromMap === 'cave1') {
          G.pl.x = 15;
          G.pl.y = 106;
        } else {
          G.pl.x = 65;
          G.pl.y = 39;
        }
        G.pl.d = 0;
      }

      updateCamera(WC, WR);
      aN('Saliste de la cueva.');
      return;
    }

    // Cristal
    if (tile === 28) {
      map[tr][tc] = 20;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales!');
      tile = 20; // ahora cuenta como suelo normal para lógica posterior
    }

    // Encuentros en cualquier tile caminable
    const walkableCaveTile =
      tile === 20 || tile === 26 || tile === 27 || tile === 28;

    if (walkableCaveTile && !G.supervisor) {
      const encounterChance = tile === 26 ? 0.018 : 0.007;

      if (Math.random() < encounterChance) {
        const types = ['dragon', 'fairy', 'fire', 'water', 'plant'];

        let nearLava = false;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (map[tr + dr]?.[tc + dc] === 24) nearLava = true;
          }
        }

        if (nearLava && Math.random() < 0.5) {
          startWild('fire');
        } else {
          startWild(types[Math.floor(Math.random() * types.length)]);
        }
        updateCamera(CC, CR);
        return;
      }
    }
  }

  if (kp(' ')) {
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.');
    else checkNPC(caveNpcs);
  }
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(CC, CR);
}

if (kp(' ')) {
  if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.');
  else checkNPC(caveNpcs);
}
if (kp('x') || kp('Escape')) {
  sfx.sel();
  G.scr = 'menu';
  G.ms = { s: 0 };
}

updateCamera(CC, CR);

// === CASTILLO ===
function uCastle() {
  const mv = moveEntity(solidC, KC, KR, castMap);

  if (mv) {
    const tile = castMap[Math.floor(G.pl.y)]?.[Math.floor(G.pl.x)];
    if (tile === 33) {
      G.curMap = 'world';
      if (G.prevPos) {
        G.pl.x = G.prevPos.x;
        G.pl.y = G.prevPos.y;
      } else {
        G.pl.x = 20;
        G.pl.y = 32;
      }
      updateCamera(WC, WR);
      aN('Saliste del castillo.');
    }
  }

  if (kp(' ')) {
    if (G.supervisor) aN('Supervisor: interacción con NPCs desactivada.');
    else checkNPC(castNpcs);
  }
  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(KC, KR);
}

// === TORRE PRESUPUESTO APROBADO ===
function uTower() {
  const mv = moveEntity(solidC, TWC, TWR, towerMap);

  if (mv) {
    const tc = Math.floor(G.pl.x),
      tr = Math.floor(G.pl.y);
    const tile = towerMap[tr]?.[tc];

    // Encuentros (todos los tipos + Serafox raro)
    if (!G.supervisor && tile === 26 && Math.random() < 0.03) {
      if (Math.random() < 0.05) {
        // ¡Serafox!
        startSerafoxBattle();
      } else {
        const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
        startWild(types[Math.floor(Math.random() * types.length)]);
      }
    }

    // Cristales
    if (tile === 28) {
      towerMap[tr][tc] = 20;
      G.crv += 2;
      sfx.cap();
      aN('+2 Cristales!');
    }

    // Salida
    if (tile === 27 && tr > Math.floor(CR / 2)) {
      G.curMap = 'world';
      if (G.prevPos) {
        G.pl.x = G.prevPos.x;
        G.pl.y = G.prevPos.y;
      }
      aN('Saliste de la torre.');
    }
  }

  if (kp('x') || kp('Escape')) {
    sfx.sel();
    G.scr = 'menu';
    G.ms = { s: 0 };
  }

  updateCamera(TWC, TWR);
}

// ============================================================
// BLOQUE: MISIONES DE LIDERES (Fases B-E)
// Pantallas especiales: Quiz (Andrea) y Chismes (Dan)
// ============================================================

// Lista de chismes para Dan. valid=true son los que cuentan.
const DAN_GOSSIP_LIST = [
  { text: 'Alessandro quiere pedirle a Gabriela vivir juntos', valid: true },
  { text: 'Roberto ama a Brisa mas de lo que muestra', valid: true },
  { text: 'Alex quiere una criatura grande para movilizarse', valid: true },
  { text: 'Hernan extraña a Tishe', valid: true },
  { text: 'Luchito quiere casarse', valid: true },
  { text: 'Pachi y Andre son hermanos y se cuidan', valid: true },
  // Distractores (falsos): suenan plausibles pero no cuentan
  { text: 'Alejandro (no Alessandro) le pedira a Gabriela vivir juntos', valid: false },
  { text: 'Piero esconde un tesoro de oro en la montana', valid: false },
  { text: 'Nicole abandonara el reino para siempre', valid: false },
  { text: 'El Rey Navarrete es en realidad una criatura disfrazada', valid: false },
  { text: 'Deyna se mudo al otro lado del mar hace anos', valid: false },
];

function handleLeaderNPC(n) {
  const M = LEADER_MISSIONS[n.leaderKey];
  // Ya tiene diploma: diálogo breve. En post-game el ciclo de Olo-Man
  // permite re-batallas contra líderes sin repetir la misión/diploma.
  if (hasDiploma(n.leaderKey)) {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: n.postDlg || M.dlgVictory,
      li: 0, ci: 0, tm: 0, full: false,
      afterBattle: postGame && canNPCBattle(n),
    };
    sfx.sel();
    return;
  }
  // Andrea: leccion de preguntas (quiz)
  if (n.leaderKey === 'andrea') {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: G.talkedTo[n.flag] ? M.dlgAccept : M.dlgStart,
      li: 0, ci: 0, tm: 0, full: false, afterBattle: false, goto: 'andreaQuiz',
    };
    sfx.sel();
    return;
  }
  // Dan: reportar chismes
  if (n.leaderKey === 'dan') {
    G.scr = 'dialog';
    G.ds = {
      npc: n,
      dlgArr: G.talkedTo[n.flag] ? M.dlgAccept : M.dlgStart,
      li: 0, ci: 0, tm: 0, full: false, afterBattle: false, goto: 'danGossip',
    };
    sfx.sel();
    return;
  }
  // Tamara / Luchito: mision por condicion
  if (M.check()) {
    G.scr = 'dialog';
    G.ds = { npc: n, dlgArr: M.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
    sfx.sel();
    return;
  }
  // Mision no cumplida: primera vez dlgStart, luego dlgFail
  G.scr = 'dialog';
  G.ds = {
    npc: n,
    dlgArr: G.talkedTo[n.flag] ? M.dlgFail : M.dlgStart,
    li: 0, ci: 0, tm: 0, full: false, afterBattle: false,
  };
  sfx.sel();
}

// === ANDREA: QUIZ ===
function showAndreaQuiz(npc) {
  G.scr = 'andreaQuiz';
  G.quizNPC = npc;
  G.qState = { idx: 0, score: 0, sel: 0, phase: 'select', fb: null };
}

function uAndreaQuiz() {
  const s = G.qState;
  const M = LEADER_MISSIONS.andrea;
  const q = M.questions[s.idx];
  if (s.phase === 'select') {
    if (kp('ArrowUp')) { s.sel = (s.sel + q.opts.length - 1) % q.opts.length; sfx.sel(); }
    if (kp('ArrowDown')) { s.sel = (s.sel + 1) % q.opts.length; sfx.sel(); }
    if (kp(' ') || kp('Enter')) {
      if (s.sel === q.correct) { s.score++; s.fb = 'ok'; sfx.cap(); }
      else { s.fb = 'bad'; sfx.nef(); }
      s.phase = 'feedback';
    }
    if (kp('x') || kp('Escape')) { G.scr = 'world'; }
  } else if (s.phase === 'feedback') {
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      s.idx++;
      if (s.idx >= M.questions.length) {
        s.phase = 'done';
      } else {
        s.sel = 0;
        s.phase = 'select';
      }
    }
  } else if (s.phase === 'done') {
    const npc = G.quizNPC;
    if (s.score >= 2) {
      G.ds = { npc: npc, dlgArr: M.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
    } else {
      G.ds = { npc: npc, dlgArr: M.dlgFail, li: 0, ci: 0, tm: 0, full: false, afterBattle: false };
    }
    G.scr = 'dialog';
  }
}

function dAndreaQuiz() {
  const s = G.qState;
  const M = LEADER_MISSIONS.andrea;
  const q = M.questions[s.idx];
  // Fondo
  cx.fillStyle = '#202830';
  cx.fillRect(0, 0, 640, 480);
  const boxX = 20, boxY = 20, boxW = 600, boxH = 110;
  dDialogBox(boxX, boxY, boxW, boxH, 'Andrea - Leccion especial');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  const qlines = wrapText(q.q, 60);
  qlines.forEach((ln, i) => cx.fillText(ln, boxX + 16, boxY + 28 + i * 16));
  // Progreso
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Pregunta ' + (s.idx + 1) + '/' + M.questions.length + '  Aciertos: ' + s.score, boxX + 16, boxY + boxH - 8);
  // Opciones
  const oy = 150;
  q.opts.forEach((opt, i) => {
    const selected = s.sel === i && s.phase === 'select';
    cx.fillStyle = selected ? '#C83030' : '#202830';
    cx.font = '8px "Press Start 2P"';
    cx.fillText((selected ? '▶ ' : '  ') + (String.fromCharCode(65 + i)) + ') ' + opt, 40, oy + i * 32);
  });
  // Feedback
  if (s.phase === 'feedback') {
    cx.fillStyle = s.fb === 'ok' ? '#30D848' : '#E03020';
    cx.font = '9px "Press Start 2P"';
    const mm = s.fb === 'ok' ? '¡Correcto!' : 'Incorrecto. Era: ' + q.opts[q.correct];
    cx.fillText(mm, 40, 300);
    cx.fillStyle = '#A0A0A0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('ENTER: continuar', 40, 320);
  } else if (s.phase === 'select') {
    cx.fillStyle = '#A0A0A0';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('ARRIBA/ABAJO: elegir  ENTER: confirmar  X: salir', 40, 300);
  }
}

// === DAN: CHISMES ===
function showDanGossip(npc) {
  G.scr = 'danGossip';
  G.gossipNPC = npc;
  if (!G.gossipState) G.gossipState = { sel: 0, fb: null, fbTm: 0 };
  G.gossipState.fb = null;
}

function uDanGossip() {
  const s = G.gossipState;
  const D = DAN_GOSSIP_LIST;
  if (s.fb) {
    s.fbTm++;
    if (s.fbTm > 70) s.fb = null;
  }
  if (kp('ArrowUp')) { s.sel = (s.sel + D.length - 1) % D.length; sfx.sel(); }
  if (kp('ArrowDown')) { s.sel = (s.sel + 1) % D.length; sfx.sel(); }
  if (kp(' ') || kp('Enter')) {
    const it = D[s.sel];
    const already = (LEADER_MISSIONS.dan.reported || []).indexOf(s.sel) !== -1;
    if (it.valid && !already) {
      LEADER_MISSIONS.dan.reported.push(s.sel);
      LEADER_MISSIONS.dan.gossip++;
      s.fb = 'ok';
      sfx.cap();
      if (LEADER_MISSIONS.dan.gossip >= LEADER_MISSIONS.dan.gossipNeeded) {
        const npc = G.gossipNPC;
        G.ds = { npc: npc, dlgArr: LEADER_MISSIONS.dan.dlgWin, li: 0, ci: 0, tm: 0, full: false, afterBattle: true };
        G.scr = 'dialog';
        return;
      }
    } else if (it.valid && already) {
      s.fb = 'ya';
      sfx.nef();
    } else {
      s.fb = 'bad';
      sfx.nef();
    }
    s.fbTm = 0;
  }
  if (kp('x') || kp('Escape')) { G.scr = 'world'; }
}

function dDanGossip() {
  const s = G.gossipState;
  const D = DAN_GOSSIP_LIST;
  const M = LEADER_MISSIONS.dan;
  cx.fillStyle = '#202830';
  cx.fillRect(0, 0, 640, 480);
  const boxX = 20, boxY = 20, boxW = 600, boxH = 70;
  dDialogBox(boxX, boxY, boxW, boxH, 'Dan - Reporte de chismes');
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Habla de los varones del reino y reporta 3 chismes verdaderos.', boxX + 16, boxY + 26);
  cx.fillStyle = '#C83030';
  cx.font = '9px "Press Start 2P"';
  cx.fillText('Reportados: ' + M.gossip + '/' + M.gossipNeeded, boxX + 16, boxY + 52);
  // Lista
  const oy = 110;
  D.forEach((it, i) => {
    const reported = (M.reported || []).indexOf(i) !== -1;
    const selected = s.sel === i;
    cx.fillStyle = selected ? '#C83030' : '#202830';
    cx.font = '8px "Press Start 2P"';
    let mark = '[ ]';
    if (reported) mark = '[X]';
    else if (selected) mark = '[ ]';
    cx.fillText((selected ? '▶ ' : '  ') + mark + ' ' + it.text, 30, oy + i * 30);
  });
  // Feedback
  cx.fillStyle = '#A0A0A0';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('ARRIBA/ABAJO: navegar  ENTER: reportar  X: salir', 30, 460);
  if (s.fb) {
    let msg = '';
    let col = '#30D848';
    if (s.fb === 'ok') { msg = '¡Chisme aceptado!'; col = '#30D848'; }
    else if (s.fb === 'ya') { msg = 'Ese chisme ya lo reportaste.'; col = '#E8C020'; }
    else { msg = 'Eso no parece cierto... no cuenta.'; col = '#E03020'; }
    cx.fillStyle = col;
    cx.font = '9px "Press Start 2P"';
    cx.fillText(msg, 30, 440);
  }
}

// === CHECK NPC ===
// === VERIFICAR SI UN NPC ES VISIBLE SEGÚN EL ESTADO DEL JUEGO ===
function npcVisible(n) {
  if (G.scr === 'intro' && n.flag === 'metAles') return false;
  if (n.preOnly && postGame) return false;
  if (n.postOnly && !postGame) return false;
  if (n.map && n.map !== G.curMap) return false;
  return true;
}
function checkNPC(list) {
  for (const n of list) {
    if (!npcVisible(n)) continue;
    if (!nearNPC(n)) continue;

    // Marcar como hablado
    if (n.flag) G.talkedTo[n.flag] = true;
    checkAllTalked();

    // SaloGon: pantalla especial de relatos con retratos
    if (n.vision) {
      showSaloGonVision(n);
      return;
    }

    // LIDERES DE GIMNASIO (Fases B-E)
    if (n.isLeader) {
      handleLeaderNPC(n);
      return;
    }

    // Curandero
    if (n.heal) {
      G.party.forEach((c) => c.full());
      lastHealPos = { x: G.pl.x, y: G.pl.y, map: G.curMap };
      sfx.heal();
      aN('¡Curados!');
      return;
    }

    // Dar item
    if (n.givesItem) {
      const items = ['pot', 'crv'];
      const it = items[Math.floor(Math.random() * 2)];
      G[it]++;
      aN(`¡Recibiste ${it === 'pot' ? 'poción' : 'cristal'}!`);
    }

    // Tienda
    if (n.shop) {
      G.scr = 'shop';
      G.ss = { s: 0, page: 'main' };
      sfx.sel();
      return;
    }

    // Boss
    if (n.boss) {
      if (!G.bossOk) {
        startBoss();
        return;
      } else {
        const dlg = G.allCaught ? endDialogue : ['Captura todos los tipos.'];
        G.scr = 'dialog';
        G.ds = { npc: n, dlgArr: dlg, li: 0, ci: 0, tm: 0, full: false };
        sfx.sel();
        return;
      }
    }

    // Verificar llaves de torre (post-game extranjeros)
    if (postGame && n.foreignDlg && !towerOpen) {
      if (checkForeignKey(n)) return;
    }

    // Obtener diálogo correcto
    // Deyna: mostrar checklist de personas habladas
    if (n.hasChecklist) {
      showTalkedChecklist(n);
      return;
    }
    const dlgArr = getNPCDialog(n);

    // Angelly roba oro
    if (n.isAngelly) {
      G.gold = Math.max(0, G.gold - 1);
      aN('-1 oro (Angelly ríe)');
    }

    // Determinar si habrá batalla después
    // Determinar si habrá batalla después
    let afterBattle = false;
    if (n.battle && canNPCBattle(n)) {
      if (n.postOnlyBattle && !postGame) {
        afterBattle = false;
      } else if (n.preGameOnce && !postGame && npcDefeats[n.flag]) {
        afterBattle = false;
      } else {
        afterBattle = true;
      }
    }

    G.scr = 'dialog';
    G.ds = { npc: n, dlgArr, li: 0, ci: 0, tm: 0, full: false, afterBattle };
    sfx.sel();
    return;
  }
}

// === CHECK EDISON (post-game) ===
function checkEdison() {
  // Edison aparece al lado de Claudia en Villa Guión
  if (!postGame) return;
  const ed = edisonNPC;
  if (!nearNPC(ed)) return;

  // Marcar como hablado
  if (!G.talkedTo['metEdison']) {
    G.talkedTo['metEdison'] = true;
  }

  // Edison es el segundo paso geográfico (P2):
  // requiere que Gabriela (P1 post-game) ya haya recordado su tierra.
  if (towerKey.gabriela && !towerKey.edison && !towerOpen) {
    towerKey.edison = true;
    aN('Edison afina la llave con música...');
    checkTowerKey();
    sfx.cap();
  }

  // Primer diálogo o challenge
  let dlg;
  if (!pairBattles) {
    dlg = ed.challengeDlg || ed.dlg[0];
  } else {
    dlg = ed.dlg[0];
  }

  G.scr = 'dialog';
  G.ds = {
    npc: ed,
    dlgArr: dlg,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    afterBattle: canNPCBattle(ed),
    isEdison: true,
  };
  sfx.sel();
}

// === CHECK FOREIGN KEY (puzzle de la torre) ===
function checkForeignKey(npc) {
  if (towerOpen) return false;

  const flag = npc.flag;

  // 1) Gabriela inicia la cadena desde el sur (P1 post-game)
  if (flag === 'metGab' && !towerKey.gabriela) {
    towerKey.gabriela = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('Gabriela recuerda su tierra...');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  // 3) Roberto va después de Edison (P4)
  if (flag === 'metRob' && towerKey.edison && !towerKey.roberto) {
    towerKey.roberto = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('Roberto recuerda su tierra...');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  // 4) Ximena cierra la cadena al norte (P5)
  if (flag === 'metXim' && towerKey.roberto && !towerKey.ximena) {
    towerKey.ximena = true;
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.foreignDlg,
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    aN('¡Ximena completa la llave!');
    checkTowerKey();
    sfx.sel();
    return true;
  }

  return false;
}

// === INICIO BATALLA SALVAJE ===
function startWild(forceType) {
  const types = forceType ? [forceType] : ['fire', 'water', 'plant'];
  const tp = types[Math.floor(Math.random() * types.length)];
  const pool = POOLS[tp];
  const id = pool[Math.floor(Math.random() * pool.length)];
  const lv = wildLv();
  const en = new Cre(id, lv);

  G.bs = {
    pi: 0,
    en,
    ph: 'intro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${en.nm} salvaje apareció!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: false,
    expMult: 1,
    fought: [0],
    isNPC: false,
    npcSprite: null,
    bgMap: G.curMap,
    fleeChance: getWildFleeChance(),
    npcIntro: null,
    introPhase: 0,
  };
  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA SERAFOX ===
function startSerafoxBattle() {
  const lv = scaledLv();
  const en = new Cre('serafox', lv);
  G.party.forEach((c) => (c.fought = false));

  G.bs = {
    pi: 0,
    en,
    ph: 'intro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡¡¡Serafox celestial!!!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: false,
    expMult: 2,
    fought: [0],
    isNPC: false,
    npcSprite: null,
    npcIntro: null,
    introPhase: 0,
  };
  G.scr = 'battle';
  sfx.bat();
  aN('¡Un ser celestial aparece!');
}

// === INICIO BATALLA NPC ===
function startNPCBattle(npc) {
  // Mr. Olo-Man sin dragón
  if (npc.isPunk && !G.party.some((c) => c.tp === 'dragon')) {
    G.scr = 'dialog';
    G.ds = {
      npc: npc,
      dlgArr: npc.sadDlg || ['...'],
      li: 0,
      ci: 0,
      tm: 0,
      full: false,
    };
    sfx.nef();
    return;
  }

  const team = getNPCTeam(npc);
  const introLines = getNPCBattleIntro(npc);
  G.party.forEach((c) => (c.fought = false));

  G.bs = {
    pi: 0,
    en: team[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${npc.nm} te desafía!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: npc.isMerch || false,
    isMerch: !!npc.shop,
    isBoss: false,
    npcTeam: team,
    npcIdx: 0,
    npcName: npc.nm,
    npcData: npc,
    isAngelly: npc.isAngelly,
    isPunk: npc.isPunk,
    expMult: npc.isAngelly ? 1.05 : 1,
    fought: [0],
    isNPC: true,
    npcSprite: npc.tp,
    npcIntro: introLines,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
  };
  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA BOSS ===
function startBoss() {
  const bossLv = Math.max(40, secondStrongestLv());

  G.bossTeam = [
    new Cre('emberwing', bossLv),
    new Cre('glaciolote', bossLv),
    new Cre('thornbuck', bossLv),
    new Cre('gusarix', bossLv),
    new Cre('zumbaflor', bossLv),
  ];

  G.bossIdx = 0;
  G.bossDialogs = 0;
  G.party.forEach((c) => (c.fought = false));

  const introLines = [
    '...Ah. Otro retador.',
    '*bostezo*',
    'Veamos si vales la pena.',
  ];

  G.bs = {
    pi: 0,
    en: G.bossTeam[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: 'Rey Navarrete te observa...',
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: true,
    expMult: 1,
    fought: [0],
    isNPC: true,
    npcSprite: 'boss',
    npcIntro: introLines,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
  };

  G.scr = 'battle';
  sfx.bat();
}

// === INICIO BATALLA EN PAREJA (post-game) ===
function startPairBattle(pairIdx) {
  if (pairIdx < 0 || pairIdx >= pairBattleData.length) return;
  const pair = pairBattleData[pairIdx];
  const lv = scaledLv();

  const team = [
    ...pair.t1.map((c) => new Cre(c.id, lv)),
    ...pair.t2.map((c) => new Cre(c.id, lv)),
  ];

  G.party.forEach((c) => (c.fought = false));

  G.bs = {
    pi: 0,
    en: team[0],
    ph: 'npcIntro',
    ms: 0,
    mvs: 0,
    ss: 0,
    msg: `¡${pair.nm} te desafían!`,
    mq: [],
    tm: 0,
    af: 0,
    ps: 0,
    es: 0,
    noExp: false,
    isMerch: false,
    isBoss: false,
    expMult: 1.2,
    fought: [0],
    npcTeam: team,
    npcIdx: 0,
    npcName: pair.nm,
    isNPC: true,
    npcSprite: null,
    npcIntro: pair.intro,
    introPhase: 0,
    introLine: 0,
    introCi: 0,
    introFull: false,
    introTm: 0,
    isPair: true,
  };
  G.scr = 'battle';
  sfx.bat();
}
// ============================================================
// BLOQUE 14: SISTEMA DE DIÁLOGO ADAPTATIVO
// ============================================================

// === UPDATE DIÁLOGO ===
function uDialog() {
  const d = G.ds;
  d.tm++;

  // Typewriter effect
  if (!d.full) {
    if (d.tm % 2 === 0) {
      d.ci++;
      if (d.ci >= d.dlgArr[d.li].length) d.full = true;
    }
  }

  // Avanzar con SPACE o ENTER
  if (kp(' ') || kp('Enter')) {
    if (!d.full) {
      // Mostrar texto completo inmediatamente
      d.full = true;
      d.ci = d.dlgArr[d.li].length;
    } else {
      // Siguiente línea
      d.li++;
      d.ci = 0;
      d.full = false;
      d.tm = 0;
      sfx.sel();

      if (d.li >= d.dlgArr.length) {
        // Fin del diálogo

        // ¿Edison con opciones?
        if (d.isEdison && postGame && !pairBattles) {
          showEdisonChoice();
          return;
        }

        // Pantallas especiales de lideres (quiz / chismes)
        if (d.goto === 'andreaQuiz') {
          showAndreaQuiz(d.npc);
          return;
        }
        if (d.goto === 'danGossip') {
          showDanGossip(d.npc);
          return;
        }

        // ¿Batalla después?
        if (d.afterBattle) {
          startNPCBattle(d.npc);
          return;
        }

        // Volver al mundo
        G.scr = 'world';
      }
    }
  }
}

// === DIBUJAR DIÁLOGO ===
function dDialog() {
  // Dibujar mapa detrás
  drawMap();

  const d = G.ds;
  const curText = d.dlgArr[d.li].substring(0, d.ci);

  // Calcular líneas necesarias para el texto actual
  const lines = wrapText(curText, 42);
  const numLines = Math.max(1, lines.length);

  // Dimensiones adaptativas
  const padX = 16,
    padY = 12;
  const lineH = 15;
  const boxW = 600;
  const boxH = padY * 2 + numLines * lineH + 4;
  const boxX = 20;
  const boxY = 480 - boxH - 10;

  // Dibujar caja blanca con borde negro
  dDialogBox(boxX, boxY, boxW, boxH, d.npc.nm);

  // Dibujar texto negro
  cx.fillStyle = '#000';
  cx.font = '9px "Press Start 2P"';
  lines.forEach((ln, i) => {
    cx.fillText(ln, boxX + padX, boxY + padY + 12 + i * lineH);
  });

  // Indicador de progreso (puntos)
  const progress = `${d.li + 1}/${d.dlgArr.length}`;
  cx.fillStyle = '#A0A0A0';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(progress, boxX + boxW - 60, boxY + boxH - 8);

  // Flecha para continuar
  if (d.full) {
    const arrowX = boxX + boxW - 30;
    const arrowY = boxY + boxH - 14;
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', arrowX, arrowY + Math.sin(fr * 0.2) * 2);
  }
}


function showSaloGonVision(npc) {
  G.scr = 'vision';
  G.vision = {
    npc,
    idx: 0,
    ci: 0,
    tm: 0,
    full: false,
    pages: [
      { id: 'salogon', name: 'SaloGon', lines: ['Soy SaloGon, vidente de la Cueva Cristalina.', 'Me quedo al fondo porque aquí la piedra habla más claro.', 'Si escuchas con calma, cada cristal recuerda un nombre.'] },
      { id: 'salogon', name: 'SaloGon', lines: ['Antes vestía de muchos colores, pero por un error', 'algunos lo ven como un monstruo.', 'Yo no muerdo; solo cuento memorias que nadie más quiere cargar.'] },
      { id: 'rafa', name: 'Rafa', lines: ['Rafa caminaba con anteojos empañados y camisa beige.', 'Tenía el cabello corto y siempre parecía estar pensando.', 'Observaba detalles que otros pisaban sin mirar.'] },
      { id: 'rafa', name: 'Rafa', lines: ['Decía que cada historia necesita a alguien que observe.', 'Cuando el ruido crecía, Rafa bajaba la voz.', 'Por eso aún puedo oírlo entre las gotas de esta cueva.'] },
      { id: 'maria', name: 'María', lines: ['María llevaba el cabello negro como noche sin luna.', 'Miraba seria, con ceño firme, porque protegía a todos.', 'No era fría: era valiente incluso cuando tenía miedo.'] },
      { id: 'maria', name: 'María', lines: ['Su camisa blanca aún brilla en mis visiones.', 'Su falda negra cruza el recuerdo como una sombra elegante.', 'Si la ves fruncir el ceño, es porque todavía está cuidando el camino.'] },
      { id: 'mancilla', name: 'Mancilla', lines: ['Mancilla fue un príncipe de armadura brillante.', 'Cabello castaño, chivito en el mentón, sin bigote.', 'Entraba a la batalla como quien entra a un escenario.'] },
      { id: 'mancilla', name: 'Mancilla', lines: ['Cayó sonriendo, como si ya conociera el final.', 'No todos los príncipes llevan corona.', 'Algunos solo dejan una promesa oxidada en la armadura.'] },
      { id: 'salogon', name: 'SaloGon', lines: ['Esas son tres luces apagadas, pero no perdidas.', 'Si vuelves, puedo repetir sus nombres.', 'Un nombre recordado es una puerta que nunca termina de cerrarse.'] },
    ],
  };
  sfx.sel();
}

function uVision() {
  const v = G.vision;
  if (!v) { G.scr = 'world'; return; }
  v.tm++;
  const text = v.pages[v.idx].lines.join(' ');
  if (!v.full && v.tm % 2 === 0) {
    v.ci++;
    if (v.ci >= text.length) v.full = true;
  }
  if (kp(' ') || kp('Enter')) {
    if (!v.full) {
      v.ci = text.length;
      v.full = true;
    } else {
      v.idx++;
      if (v.idx >= v.pages.length) {
        G.scr = 'world';
        G.vision = null;
      } else {
        v.ci = 0; v.tm = 0; v.full = false;
        sfx.sel();
      }
    }
  }
  if (kp('x') || kp('Escape')) { G.scr = 'world'; G.vision = null; }
}

function dVision() {
  drawMap();
  const v = G.vision;
  const page = v.pages[v.idx];
  cx.fillStyle = 'rgba(0,0,0,.72)';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(170, 35, 300, 235, page.name);
  // Recuadro pixel-art central
  px(220, 68, 200, 160, '#08080E');
  px(226, 74, 188, 148, '#E8D8A8');
  px(232, 80, 176, 136, '#1A1A2E');
  px(238, 86, 164, 124, '#2A2A42');
  if (page.id === 'salogon') {
    cx.save(); cx.translate(288, 120); cx.scale(2.2, 2.2); dNPC(0, 0, 'salogon', fr); cx.restore();
  } else {
    dFallenPortrait(page.id, 272, 86, 4);
  }
  const allText = page.lines.join(' ');
  const shown = allText.substring(0, v.ci);
  const lines = wrapText(shown, 52);
  const boxH = 78;
  dDialogBox(20, 390, 600, boxH, page.name);
  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  lines.slice(0, 4).forEach((ln, i) => cx.fillText(ln, 36, 414 + i * 14));
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`${v.idx + 1}/${v.pages.length}`, 560, 456);
  if (v.full) {
    cx.fillStyle = '#000';
    cx.font = '10px "Press Start 2P"';
    cx.fillText('▼', 590, 456 + Math.sin(fr * 0.2) * 2);
  }
}

// === MOSTRAR OPCIONES DE EDISON ===
function showEdisonChoice() {
  G.scr = 'edisonChoice';
  G.edisonSel = 0;
}

function uEdisonChoice() {
  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.edisonSel = (G.edisonSel + 1) % 2;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.edisonSel = (G.edisonSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.edisonSel === 0) {
      // Combatir contra Edison
      startNPCBattle(edisonNPC);
    } else {
      // Desbloquear combates en pareja
      pairBattles = true;
      aN('¡Combates en pareja desbloqueados!');
      G.scr = 'pairSelect';
      G.pairSel = 0;
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

function dEdisonChoice() {
  drawMap();
  cx.fillStyle = 'rgba(0,0,0,.5)';
  cx.fillRect(0, 0, 640, 480);

  // Caja de pregunta
  const boxW = 400,
    boxH = 120;
  const boxX = 120,
    boxY = 180;
  dDialogBox(boxX, boxY, boxW, boxH, 'Edison');

  cx.fillStyle = '#000';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('¿Qué prefieres?', boxX + 20, boxY + 30);

  // Opciones
  cx.fillStyle = G.edisonSel === 0 ? '#C83030' : '#505060';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(
    `${G.edisonSel === 0 ? '▶ ' : '  '}Pelear contra mí`,
    boxX + 20,
    boxY + 60
  );

  cx.fillStyle = G.edisonSel === 1 ? '#C83030' : '#505060';
  cx.fillText(
    `${G.edisonSel === 1 ? '▶ ' : '  '}Nuevo reto (Parejas)`,
    boxX + 20,
    boxY + 82
  );

  cx.fillStyle = '#A0A0A0';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('X: Cancelar', boxX + 20, boxY + 104);
}

// === SELECCIÓN DE PAREJA PARA COMBATIR ===
function uPairSelect() {
  if (kp('ArrowUp')) {
    G.pairSel = (G.pairSel + pairBattleData.length - 1) % pairBattleData.length;
    sfx.sel();
  }
  if (kp('ArrowDown')) {
    G.pairSel = (G.pairSel + 1) % pairBattleData.length;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    startPairBattle(G.pairSel);
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

function dPairSelect() {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(80, 20, 480, 440, 'Combates en Pareja');

  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Elige una pareja para combatir:', 100, 55);

  pairBattleData.forEach((pair, i) => {
    const py = 80 + i * 50;
    const sel = G.pairSel === i;

    // Fondo seleccionado
    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.1)';
      cx.fillRect(95, py - 5, 430, 42);
    }

    // Nombre de pareja
    cx.fillStyle = sel ? '#ffd700' : '#fff';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${pair.nm}`, 100, py + 10);

    // Detalle
    cx.fillStyle = sel ? '#E8C830' : '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`${pair.p1} + ${pair.p2}`, 120, py + 26);

    // Criaturas
    const allT = [...pair.t1, ...pair.t2];
    allT.forEach((c, j) => {
      const ci = CDB[c.id];
      if (ci) {
        cx.fillStyle = tCol(ci.tp);
        cx.fillText(`${tEmo(ci.tp)}${ci.nm}`, 300 + j * 80, py + 26);
      }
    });
  });

  // Luchadores solitarios post-game
  cx.fillStyle = '#A0B0C0';
  cx.font = '7px "Press Start 2P"';
  const soloY = 80 + pairBattleData.length * 50 + 20;
  cx.fillText('También puedes pelear contra:', 100, soloY);
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(
    'Hernán (solo) | Dan (solo) | Nicole (crucificada)',
    100,
    soloY + 18
  );

  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('X: Volver', 100, 440);
}

// === DIÁLOGO RÁPIDO (para mensajes cortos) ===
function showQuickDialog(name, lines) {
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: name },
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
  };
  sfx.sel();
}

// === DIÁLOGO CON CALLBACK ===
function showDialogThen(name, lines, callback) {
  G.scr = 'dialog';
  G.ds = {
    npc: { nm: name },
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    afterCallback: callback,
  };
  sfx.sel();
}

// === CHECKLIST DE PERSONAS HABLADAS (Deyna) ===
function showTalkedChecklist(npc) {
  const allNPCs = [
    { flag: 'metAles', nm: 'Alessandro' },
    { flag: 'metFab', nm: 'Fabiana' },
    { flag: 'metNic', nm: 'Nicole' },
    { flag: 'metCla', nm: 'Claudia' },
    { flag: 'metRob', nm: 'Roberto' },
    { flag: 'metBri', nm: 'Brisa' },
    { flag: 'metPau', nm: 'Paulo' },
    { flag: 'metTam', nm: 'Tamara' },
    { flag: 'metNah', nm: 'Nahuel' },
    { flag: 'metPac', nm: 'Pachi' },
    { flag: 'metGab', nm: 'Gabriela' },
    { flag: 'metHer', nm: 'Hernán' },
    { flag: 'metAng', nm: 'Angelly' },
    { flag: 'metDay', nm: 'Dayana' },
    { flag: 'metDey', nm: 'Deyna' },
    { flag: 'metAnd', nm: 'André' },
    { flag: 'metAlej', nm: 'Alejandro' },
    { flag: 'metLuis', nm: 'Luis' },
    { flag: 'metAlex', nm: 'Alex' },
    { flag: 'metGon', nm: 'Gonchi' },
    { flag: 'metJai', nm: 'Jairo' },
    { flag: 'metDan2', nm: 'Dante' },
    { flag: 'metDaniel', nm: 'Dan' },
    { flag: 'metLuch', nm: 'Luchito' },
    { flag: 'metXim', nm: 'Ximena' },
    { flag: 'metAnd2', nm: 'Andrea' },
    { flag: 'metOlo', nm: 'Mr. Olo-Man' },
  ];

  const talked = allNPCs.filter((n) => G.talkedTo[n.flag]);
  const notTalked = allNPCs.filter((n) => !G.talkedTo[n.flag]);
  const total = allNPCs.length;
  const count = talked.length;

  // Construir líneas de diálogo
  const lines = [];
  lines.push(`¡Veamos! Has conocido a`);
  lines.push(`${count} de ${total} personas.`);
  lines.push(``);

  if (notTalked.length === 0) {
    lines.push('¡¡Conoces a TODOS!!');
    lines.push('¡Eres increíble!');
    lines.push('El reino entero te conoce.');
  } else {
    lines.push('Ya conoces a:');
    // Agrupar de 3 en 3
    for (let i = 0; i < talked.length; i += 3) {
      const group = talked
        .slice(i, i + 3)
        .map((n) => '✓' + n.nm)
        .join(', ');
      lines.push(group);
    }
    lines.push('');
    lines.push('Te falta conocer a:');
    for (let i = 0; i < notTalked.length; i += 3) {
      const group = notTalked
        .slice(i, i + 3)
        .map((n) => '✗' + n.nm)
        .join(', ');
      lines.push(group);
    }
    lines.push('');
    lines.push('¡Sigue buscando!');
  }

  G.scr = 'dialog';
  G.ds = {
    npc: npc,
    dlgArr: lines,
    li: 0,
    ci: 0,
    tm: 0,
    full: false,
    afterBattle:
      npc.battle &&
      canNPCBattle(npc) &&
      !(npc.preGameOnce && !postGame && npcDefeats[npc.flag]),
  };
  sfx.sel();
}

// ============================================================
// BLOQUE 15-16: TIENDA, MENÚ, PROA Y MAPA GRANDE
// ============================================================

// === TIENDA ===
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
        startNPCBattle({
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

// === MENÚ PRINCIPAL ===
function uMenu() {
  if (G.showMap) {
    uMapScreen();
    return;
  }
  if (G.proaOpen) {
    uProa();
    return;
  }
  if (G.showMissions) {
    uMissions();
    return;
  }
  if (G.showDex) {
    uDex();
    return;
  }

  if (kp('ArrowUp') || kp('ArrowLeft')) {
    G.ms.s = (G.ms.s + 8) % 9;
    sfx.sel();
  }
  if (kp('ArrowDown') || kp('ArrowRight')) {
    G.ms.s = (G.ms.s + 1) % 9;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    switch (G.ms.s) {
      case 0:
        if (G.pot > 0 && G.party.length > 0) {
          G.pot--;
          G.party[0].heal(Math.floor(G.party[0].mHp * 0.2));
          sfx.heal();
          aN('+HP!');
        } else aN('¡Sin pociones!');
        break;
      case 1:
        {
          const f = G.party.find((c) => c.hp <= 0);
          if (f && G.rev > 0) {
            G.rev--;
            f.hp = Math.floor(f.mHp * 0.5);
            sfx.heal();
            aN(`${f.nm} revivió!`);
          } else aN('Nadie caído o sin revivir.');
        }
        break;
      case 2:
        G.proaOpen = true;
        G.proaSel = 0;
        G.proaMode = 'view';
        break;
      case 3:
        G.showMap = true;
        break;
      case 4:
        G.showMissions = true;
        break;
      case 5:
        G.showDex = true;
        G.dexSel = 0;
        break;
      case 6:
        saveGame();
        break;
      case 7:
        G.scr = 'world';
        break;
      case 8:
        G.scr = 'confirmReset';
        G.resetSel = 0;
        break;
    }
  }
  if (kp('x') || kp('Escape')) G.scr = 'world';
}

function dMenu() {
  drawMap();
  cx.fillStyle = 'rgba(0,0,0,.6)';
  cx.fillRect(0, 0, 640, 480);

  if (G.showMap) {
    dMapScreen();
    return;
  }
  if (G.proaOpen) {
    dProa();
    return;
  }
  if (G.showMissions) {
    dMissions();
    return;
  }
  if (G.showDex) {
    dDex();
    return;
  }

  dBoxMenu(16, 16, 190, 320, 'MENÚ');
  const opts = [
    'Poción',
    'Revivir',
    'Equipo',
    'Mapa',
    'Misiones',
    'Criaturario',
    'Guardar',
    'Volver',
    'Reiniciar toda la partida',
  ];
  opts.forEach((o, i) => {
    cx.fillStyle = G.ms.s === i ? '#ffd700' : '#fff';
    cx.font = i === 8 ? '6px "Press Start 2P"' : '8px "Press Start 2P"';
    cx.fillText(`${G.ms.s === i ? '▶ ' : '  '}${o}`, 34, 48 + i * 28);
  });
  cx.fillStyle = '#aaa';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`🧪${G.pot} 💎${G.crv} ❤${G.rev} 💰${G.gold}`, 34, 314);

  dBoxMenu(220, 16, 410, 450, 'EQUIPO');
  if (G.party.length === 0) {
    cx.fillStyle = '#888';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('Sin criaturas.', 230, 50);
  } else {
    G.party.forEach((c, i) => {
      const cy = 42 + i * 62;
      if (i % 2 === 0) {
        cx.fillStyle = 'rgba(255,255,255,.03)';
        cx.fillRect(218, cy - 8, 404, 58);
      }
      cx.fillStyle = tCol(c.tp);
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${tEmo(c.tp)} ${c.nm}`, 230, cy);
      cx.fillStyle = '#ffd700';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`Lv.${c.lv}`, 450, cy);
      cx.fillStyle = '#aaa';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(tNam(c.tp), 530, cy);
      dHP(230, cy + 8, 140, 6, c.hp, c.mHp);
      cx.fillStyle = '#fff';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`ATK:${c.ak}`, 230, cy + 26);
      cx.fillText(`DEF:${c.df}`, 310, cy + 26);
      cx.fillText(`SPD:${c.sp}`, 390, cy + 26);
      cx.fillStyle = '#aaa';
      cx.font = '5px "Press Start 2P"';
      cx.fillText('EXP:', 230, cy + 38);
      dEXP(260, cy + 33, 140, 4, c.ex, c.exTo);
      if (c.hp <= 0) {
        cx.fillStyle = 'rgba(200,0,0,.3)';
        cx.fillRect(218, cy - 8, 404, 58);
        cx.fillStyle = '#E83030';
        cx.font = '6px "Press Start 2P"';
        cx.fillText('CAÍDO', 550, cy + 26);
      }
    });
  }
  if (proa.length > 0) {
    cx.fillStyle = '#888';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Proa: ${proa.length} criaturas`, 230, 440);
  }
}

// === CONFIRMAR REINICIO ===
function uConfirmReset() {
  if (kp('ArrowUp') || kp('ArrowDown') || kp('ArrowLeft') || kp('ArrowRight')) {
    G.resetSel = (G.resetSel + 1) % 2;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    if (G.resetSel === 0) {
      // No reiniciar
      G.scr = G.resetFromTitle ? 'title' : 'menu';
      G.resetFromTitle = false;
    } else {
      // Sí reiniciar
      resetGame(!!G.resetFromTitle);
      G.resetFromTitle = false;
    }
  }
  if (kp('x') || kp('Escape')) { G.scr = G.resetFromTitle ? 'title' : 'menu'; G.resetFromTitle = false; }
}

function dConfirmReset() {
  if (G.resetFromTitle) {
    // Fondo propio para evitar la sensación de pantalla negra al crear nueva partida.
    cx.fillStyle = '#09091E';
    cx.fillRect(0, 0, 640, 480);
    for (let i = 0; i < 45; i++) {
      cx.globalAlpha = Math.sin(fr * 0.04 + i) * 0.4 + 0.6;
      cx.fillStyle = '#fff';
      cx.fillRect((i * 97) % 640, (i * 71) % 260, 1, 1);
    }
    cx.globalAlpha = 1;
    cx.textAlign = 'center';
    cx.fillStyle = '#ffd700';
    cx.font = '16px "Press Start 2P"';
    cx.fillText('NUEVA PARTIDA', 320, 92);
    cx.textAlign = 'left';
  } else {
    drawMap();
    cx.fillStyle = 'rgba(0,0,0,.7)';
    cx.fillRect(0, 0, 640, 480);
  }

  dBoxMenu(125, 150, 390, 180, G.resetFromTitle ? 'CONFIRMAR NUEVA PARTIDA' : '⚠️ REINICIO TOTAL');

  cx.fillStyle = '#E83030';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(G.resetFromTitle ? '¿Empezar desde Aldea Pitch?' : '¿Reiniciar TODA la partida?', 145, 190);
  cx.fillStyle = '#aaa';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('Borra save, equipo, diplomas y progreso.', 145, 212);
  cx.fillText('Esto no se puede deshacer.', 145, 230);

  cx.fillStyle = G.resetSel === 0 ? '#ffd700' : '#888';
  cx.font = '9px "Press Start 2P"';
  cx.fillText(`${G.resetSel === 0 ? '▶ ' : '  '}${G.resetFromTitle ? 'No, volver al inicio' : 'No, volver al menú'}`, 155, 270);

  cx.fillStyle = G.resetSel === 1 ? '#E83030' : '#888';
  cx.fillText(`${G.resetSel === 1 ? '▶ ' : '  '}${G.resetFromTitle ? 'Sí, empezar nueva partida' : 'Sí, reiniciar toda la partida'}`, 155, 296);
}

function resetGame(startIntro = false) {
  // Borrar save de forma robusta
  clearAllGameSaves();

  // Reiniciar variables globales
  G.scr = 'title';
  G.curMap = 'world';
  G.pl = { x: 20, y: 145, d: 0, f: 0, sprint: false };
  G.party = [];
  G.gold = 200;
  G.pot = 5;
  G.rev = 2;
  G.crv = 3;
  G.bWon = 0;
  G.tExp = 0;
  G.mFriend = 0;
  G.bossOk = false;
  G.allCaught = false;
  G.keys = {};
  G.kcd = {};
  G.held = {};
  G.pts = [];
  G.nots = [];
  G.tFr = 0;
  G.titleSel = 0;
  G.hasSave = false;
  G.sSel = 0;
  G.bs = null;
  G.ds = null;
  G.ms = null;
  G.ss = null;
  G.talkedTo = {};
  G.allTalked = false;
  G.bossTeam = null;
  G.bossIdx = 0;
  G.bossDialogs = 0;
  G.prevPos = null;
  G.showMap = false;
  G.proaOpen = false;
  G.showDex = false;
  G.dexSel = 0;
  G.supervisor = false;

  postGame = false;
  towerOpen = false;
  oloDefeated = false;
  npcDefeats = {};
  pairBattles = false;
  proa = [];
  towerKey = { edison: false, roberto: false, gabriela: false, ximena: false };
  diplomas = { tamara: false, luchito: false, andrea: false, dan: false };
  captureCount = {};
  lastHealPos = { x: 20, y: 145, map: 'world' };

  // Regenerar mapas
  // === HELPERS DE CAMINOS PARA EL MAPA GRANDE ===
  function hPath(r, c1, c2, w = 2) {
    const start = Math.min(c1, c2),
      end = Math.max(c1, c2);
    for (let c = start; c <= end; c++)
      for (let dr = 0; dr < w; dr++) {
        const rr = r + dr;
        if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
      }
  }

  function vPath(c, r1, r2, w = 2) {
    const start = Math.min(r1, r2),
      end = Math.max(r1, r2);
    for (let r = start; r <= end; r++)
      for (let dc = 0; dc < w; dc++) {
        const cc = c + dc;
        if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
      }
  }
  // === HELPERS DE CAMINOS (para el mapa grande) ===
  function hPath(r, c1, c2, w = 2) {
    const start = Math.min(c1, c2),
      end = Math.max(c1, c2);
    for (let c = start; c <= end; c++)
      for (let dr = 0; dr < w; dr++) {
        const rr = r + dr;
        if (rr >= 2 && rr < WR - 2 && c >= 2 && c < WC - 2) wMap[rr][c] = 1;
      }
  }

  function vPath(c, r1, r2, w = 2) {
    const start = Math.min(r1, r2),
      end = Math.max(r1, r2);
    for (let r = start; r <= end; r++)
      for (let dc = 0; dc < w; dc++) {
        const cc = c + dc;
        if (r >= 2 && r < WR - 2 && cc >= 2 && cc < WC - 2) wMap[r][cc] = 1;
      }
  }
  genWorld();
  genCave(cave1, CC, CR);
  addOloSecretChamber(cave1);
  genCave(cave2, CC, CR);
  genCastle();

  resetBattleState();
  stopMusic();

  aN('¡Partida reiniciada!');
  sfx.sel();
  if (startIntro) {
    G.pl.d = 3;
    G.scr = 'intro';
    G.intro = { phase: 0, y: 82, li: 0, ci: 0, tm: 0, full: false };
  }
}

// === CRIATURARIO / CRIATURA-DEX ===
const DEX_ORDER = [
  // Iniciales: Planta -> Fuego -> Agua
  'gorilan', 'gorilirico', 'gorilegend',
  'flameye', 'flamcrest', 'inferpavo',
  'axolotl', 'ajolord', 'glaciolote',

  // Resto por ciclos: Planta -> Fuego -> Agua -> Dragón -> Hada
  'ivygoat', 'hedroble',
  'flamingo', 'flamencero',
  'medusync', 'medubass',
  'wyvern', 'wyvernax', 'wyvernlord',
  'pixie', 'duendetron',

  'orquidea', 'mantisdanza',
  'emberwing',
  'pinzardo', 'pinzamestre',
  'eastern', 'longwok',
  'sidhe', 'sidhearia',

  'thornbuck', 'espinarcor', 'espinardoom',
  'salamandro', 'alquimero', 'piromante',
  'pingueson', 'pinguchef', 'pingumitre',
  'ornispia', 'ornishadow', 'ornisagent',
  'spritefly', 'lucilente', 'lucistrella',

  'raizan',
  'blaztoro', 'infernotoro',
  'peztronauta', 'cosmocardumen',
  'serpentdrg', 'serpentboss',
  'elefantasy', 'elefantastico',

  'gusarix', 'crisalmanza', 'hydrapom',
  'zumbaflor', 'zumbaccino',

  // Legendario al final
  'serafox',
];

function dexIds() {
  const seen = new Set();
  const ordered = [];
  DEX_ORDER.forEach((id) => {
    if (CDB[id] && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  });
  // Seguridad: si agregamos criaturas nuevas y olvidamos meterlas al orden,
  // aparecen antes del legendario final sin romper el Criaturario.
  Object.keys(CDB).forEach((id) => {
    if (id !== 'serafox' && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  });
  if (CDB.serafox && !ordered.includes('serafox')) ordered.push('serafox');
  return ordered;
}
function hasCapturedSpecies(id) {
  if (G.supervisor) return true;
  return (captureCount[id] || 0) > 0 || G.party.some((c) => c.id === id) || proa.some((c) => c.id === id);
}
function uDex() {
  const ids = dexIds();
  const cols = 5;
  if (kp('ArrowLeft')) { G.dexSel = (G.dexSel + ids.length - 1) % ids.length; sfx.sel(); }
  if (kp('ArrowRight')) { G.dexSel = (G.dexSel + 1) % ids.length; sfx.sel(); }
  if (kp('ArrowUp')) { G.dexSel = (G.dexSel + ids.length - cols) % ids.length; sfx.sel(); }
  if (kp('ArrowDown')) { G.dexSel = (G.dexSel + cols) % ids.length; sfx.sel(); }
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) G.showDex = false;
}
function dDex() {
  dBoxMenu(28, 12, 584, 456, 'CRIATURARIO');
  const ids = dexIds();
  const cols = 5, cellW = 108, cellH = 58;
  const startX = 48, startY = 50;
  const pageSize = 30;
  const page = Math.floor(G.dexSel / pageSize);
  const start = page * pageSize;
  const shown = ids.slice(start, start + pageSize);
  const captured = ids.filter((id) => hasCapturedSpecies(id)).length;
  cx.fillStyle = '#ffd700';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Capturadas: ${captured}/${ids.length}`, 48, 36);
  shown.forEach((id, idx) => {
    const realIdx = start + idx;
    const col = idx % cols, row = Math.floor(idx / cols);
    const x = startX + col * cellW, y = startY + row * cellH;
    const sel = G.dexSel === realIdx;
    const caught = hasCapturedSpecies(id);
    cx.fillStyle = sel ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.03)';
    cx.fillRect(x - 4, y - 4, cellW - 8, cellH - 6);
    cx.strokeStyle = sel ? '#ffd700' : caught ? tCol(CDB[id].tp) : '#303040';
    cx.lineWidth = sel ? 2 : 1;
    cx.strokeRect(x - 4, y - 4, cellW - 8, cellH - 6);
    cx.save();
    if (!caught) cx.filter = 'brightness(0)';
    dCre(x + 20, y + 2, id, 5, fr);
    cx.restore();
    cx.fillStyle = caught ? '#fff' : '#606070';
    cx.font = caught ? '5px "Press Start 2P"' : '4px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(caught ? CDB[id].nm : '?????', x + 48, y + 45);
    cx.textAlign = 'left';
  });
  const cur = ids[G.dexSel];
  if (cur) {
    const caught = hasCapturedSpecies(cur);
    cx.fillStyle = '#0a0a2e';
    cx.fillRect(36, 410, 568, 42);
    cx.strokeStyle = caught ? tCol(CDB[cur].tp) : '#555';
    cx.strokeRect(36, 410, 568, 42);
    cx.fillStyle = caught ? tCol(CDB[cur].tp) : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(caught ? `${tEmo(CDB[cur].tp)} ${CDB[cur].nm} - ${tNam(CDB[cur].tp)}` : 'Silueta desconocida', 50, 428);
    cx.fillStyle = '#aaa';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(caught ? (CDB[cur].desc || 'Sin datos.') : 'Captura esta criatura para revelar sus datos.', 50, 444);
  }
  cx.fillStyle = '#606878';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('Flechas: navegar | SPACE/X: volver', 360, 36);
}

// === PANTALLA DE MISIONES ===
function uMissions() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.showMissions = false;
  }
}

function dMissions() {
  dBoxMenu(40, 10, 560, 460, 'MISIONES');

  let my = 40;

  // Título
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Progreso del Reino', 60, my);
  my += 20;

  // Misión principal
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('── MISIÓN PRINCIPAL ──', 60, my);
  my += 16;

  drawMission(
    60,
    my,
    'Hablar con todos',
    G.allTalked,
    `${Object.keys(G.talkedTo).length}/27 habitantes`
  );
  my += 32;

  drawMission(
    60,
    my,
    'Capturar todos los tipos',
    G.allCaught,
    getTypeProgress()
  );
  my += 32;

  drawMission(
    60,
    my,
    'Derrotar al Rey ',
    G.bossOk,
    G.bossOk ? '¡Victoria!' : 'Entra al castillo'
  );
  my += 32;

  // Misiones secundarias
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText('── SECUNDARIAS ──', 60, my);
  my += 16;

  drawMission(
    60,
    my,
    'Amistad con David-O',
    G.mFriend >= 15,
    `${G.mFriend}/15 combates (${getStars()} estrellas)`
  );
  my += 32;

  drawMission(
    60,
    my,
    'Encontrar a Mr. Olo-Man',
    !!G.talkedTo['metOlo'],
    G.talkedTo['metOlo'] ? '¡Encontrado!' : 'Busca en las cuevas'
  );
  my += 32;

  // Post-game
  if (postGame) {
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('── POST-GAME ──', 60, my);
    my += 16;

    drawMission(
      60,
      my,
      'Encontrar a Edison',
      !!G.talkedTo['metEdison'],
      G.talkedTo['metEdison'] ? '¡En Villa Guión!' : 'Busca en Villa Guión'
    );
    my += 32;

    drawMission(
      60,
      my,
      'Desbloquear parejas',
      pairBattles,
      pairBattles ? '¡Desbloqueado!' : 'Habla con Edison'
    );
    my += 32;

    drawMission(60, my, 'Abrir la Torre', towerOpen, getTowerProgress());
    my += 32;

    drawMission(
      60,
      my,
      'Capturar a Serafox',
      G.party.some((c) => c.id === 'serafox') ||
        proa.some((c) => c.id === 'serafox'),
      'Criatura secreta en la Torre'
    );
    my += 32;
  }

  // Stats
  my += 8;
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Batallas ganadas: ${G.bWon}`, 60, my);
  my += 14;
  cx.fillText(`EXP total: ${G.tExp}`, 60, my);
  my += 14;
  cx.fillText(
    `Criaturas: ${G.party.length} equipo + ${proa.length} proa`,
    60,
    my
  );
  my += 14;
  cx.fillText(`Oro: ${G.gold}`, 60, my);

  // Instrucción
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE/X: Cerrar', 60, 448);
}

function drawMission(x, y, title, completed, detail) {
  // Icono de estado
  if (completed) {
    cx.fillStyle = '#30D848';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('✓', x, y + 8);
  } else {
    cx.fillStyle = '#E8C020';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('○', x, y + 8);
  }

  // Título
  cx.fillStyle = completed ? '#30D848' : '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(title, x + 16, y + 6);

  // Detalle
  cx.fillStyle = completed ? '#60A060' : '#aaa';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(detail, x + 16, y + 18);

  // Línea separadora
  cx.fillStyle = 'rgba(255,255,255,.05)';
  cx.fillRect(x, y + 24, 480, 1);
}

function getTypeProgress() {
  const types = ['fire', 'water', 'plant', 'dragon', 'fairy'];
  const caught = types.filter(
    (t) => G.party.some((c) => c.tp === t) || proa.some((c) => c.tp === t)
  );
  const icons = types
    .map((t) => {
      const has = caught.includes(t);
      return has ? tEmo(t) : '?';
    })
    .join(' ');
  return `${caught.length}/5 tipos: ${icons}`;
}

function getStars() {
  if (G.mFriend >= 15) return '⭐⭐⭐⭐⭐';
  if (G.mFriend >= 10) return '⭐⭐⭐⭐';
  if (G.mFriend >= 6) return '⭐⭐⭐';
  if (G.mFriend >= 3) return '⭐⭐';
  return '⭐';
}

function getTowerProgress() {
  // Orden geográfico Sur→Norte: Gabriela (P1) → Edison (P2) → Roberto (P4) → Ximena (P5)
  const steps = [];
  if (towerKey.gabriela) steps.push('Gabriela ✓');
  else steps.push('Gabriela ✗');
  if (towerKey.edison) steps.push('Edison ✓');
  else steps.push('Edison ✗');
  if (towerKey.roberto) steps.push('Roberto ✓');
  else steps.push('Roberto ✗');
  if (towerKey.ximena) steps.push('Ximena ✓');
  else steps.push('Ximena ✗');
  return steps.join(' → ');
}

// === PROA (almacén de criaturas) ===
function uProa() {
  if (G.proaMode === 'data') {
    uCreData();
    return;
  }
  if (G.proaMode === 'moveDetail') {
    uMoveDetail();
    return;
  }

  if (kp('x') || kp('Escape')) {
    if (G.proaMode === 'swap') {
      G.proaMode = 'view';
      return;
    }
    if (G.proaMode === 'options') {
      G.proaMode = 'view';
      return;
    }
    G.proaOpen = false;
    return;
  }

  const total = G.party.length + proa.length;
  if (total === 0) {
    G.proaOpen = false;
    return;
  }

  if (G.proaMode === 'view') {
    if (kp('ArrowUp')) {
      G.proaSel = (G.proaSel + total - 1) % total;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      G.proaSel = (G.proaSel + 1) % total;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      G.proaMode = 'options';
      G.proaOptSel = 0;
    }
  } else if (G.proaMode === 'options') {
    if (kp('ArrowUp') || kp('ArrowDown')) {
      G.proaOptSel = (G.proaOptSel + 2) % 3;
      sfx.sel();
    }
    if (kp(' ') || kp('Enter')) {
      sfx.sel();
      if (G.proaOptSel === 0) {
        // Mover
        G.proaMode = 'swap';
        G.proaSwap = G.proaSel;
      } else if (G.proaOptSel === 1) {
        // Datos
        G.proaMode = 'data';
        G.dataMvSel = 0;
        G.dataMvDetail = false;
      } else {
        // Liberar
        const allCre = [...G.party, ...proa];
        const cre = allCre[G.proaSel];
        if (G.party.length <= 1 && G.proaSel < G.party.length) {
          aN('¡No puedes liberar tu última criatura!');
        } else {
          const wasInParty = G.proaSel < G.party.length;
          if (wasInParty) {
            G.party.splice(G.proaSel, 1);
          } else {
            proa.splice(G.proaSel - G.party.length, 1);
          }
          aN(`¡${cre.nm} fue liberado!`);
          sfx.nef();
          G.proaSel = Math.max(
            0,
            Math.min(G.proaSel, G.party.length + proa.length - 1)
          );
          G.proaMode = 'view';
        }
      }
    }
    if (kp('x') || kp('Escape')) {
      G.proaMode = 'view';
    }
  } else if (G.proaMode === 'swap') {
    if (kp('ArrowUp')) {
      G.proaSel = (G.proaSel + total - 1) % total;
      sfx.sel();
    }
    if (kp('ArrowDown')) {
      G.proaSel = (G.proaSel + 1) % total;
      sfx.sel();
    }
    if (kp('x') || kp('Escape')) {
      G.proaMode = 'view';
      return;
    }
    if (kp(' ') || kp('Enter')) {
      const allCre = [...G.party, ...proa];
      const temp = allCre[G.proaSwap];
      allCre[G.proaSwap] = allCre[G.proaSel];
      allCre[G.proaSel] = temp;
      G.party = allCre.slice(0, Math.min(6, allCre.length));
      proa = allCre.slice(Math.min(6, allCre.length));
      if (G.party.length === 0 && proa.length > 0) G.party.push(proa.shift());
      sfx.sel();
      aN('¡Intercambiado!');
      G.proaMode = 'view';
    }
  }
}

function dProa() {
  if (G.proaMode === 'data') {
    dCreData();
    return;
  }
  if (G.proaMode === 'moveDetail') {
    dMoveDetail();
    return;
  }

  dBoxMenu(40, 20, 560, 440, 'PROA - Almacén');

  const allCre = [...G.party, ...proa];

  cx.fillStyle = '#ffd700';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`Equipo: ${G.party.length}/6`, 60, 50);
  cx.fillText(`Proa: ${proa.length}`, 300, 50);

  if (G.proaMode === 'swap') {
    cx.fillStyle = '#E8C830';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Selecciona destino del intercambio', 60, 64);
  } else if (G.proaMode === 'options') {
    cx.fillStyle = '#ffd700';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('Elige acción:', 60, 64);
  } else {
    cx.fillStyle = '#aaa';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('SPACE: Opciones | X: Cerrar', 60, 64);
  }

  const startY = 78;
  const visibleMax = 12;
  const scrollStart = Math.max(0, G.proaSel - visibleMax + 1);

  allCre.forEach((c, i) => {
    if (i < scrollStart || i >= scrollStart + visibleMax) return;
    const cy = startY + (i - scrollStart) * 28;
    const sel = G.proaSel === i;
    const isSwap = G.proaMode === 'swap' && G.proaSwap === i;
    const inParty = i < G.party.length;

    if (isSwap) {
      cx.fillStyle = 'rgba(232,200,48,.15)';
      cx.fillRect(55, cy - 5, 500, 24);
    } else if (sel) {
      cx.fillStyle = 'rgba(255,255,255,.05)';
      cx.fillRect(55, cy - 5, 500, 24);
    }

    if (i === G.party.length) {
      cx.fillStyle = '#ffd700';
      cx.fillRect(55, cy - 8, 500, 1);
      cx.fillStyle = '#888';
      cx.font = '5px "Press Start 2P"';
      cx.fillText('── PROA ──', 270, cy - 3);
    }

    cx.fillStyle = sel ? '#ffd700' : inParty ? '#fff' : '#aaa';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${tEmo(c.tp)} ${c.nm}`, 60, cy + 8);
    cx.fillStyle = inParty ? '#fff' : '#888';
    cx.fillText(`Lv.${c.lv}`, 340, cy + 8);
    cx.fillStyle = c.hp > 0 ? '#30D848' : '#E83030';
    cx.fillText(`${c.hp}/${c.mHp}`, 420, cy + 8);
    cx.fillStyle = inParty ? '#ffd700' : '#606878';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(inParty ? 'EQUIPO' : 'PROA', 520, cy + 8);
  });

  // Menú de opciones flotante
  if (G.proaMode === 'options') {
    const optX = 380,
      optY = startY + (G.proaSel - scrollStart) * 28 - 5;
    cx.fillStyle = '#000';
    cx.fillRect(optX - 2, optY - 2, 124, 56);
    cx.fillStyle = '#1a1a3e';
    cx.fillRect(optX, optY, 120, 52);
    cx.strokeStyle = '#ffd700';
    cx.lineWidth = 2;
    cx.strokeRect(optX, optY, 120, 52);

    const opts = ['Mover', 'Datos', 'Liberar'];
    opts.forEach((o, i) => {
      cx.fillStyle =
        G.proaOptSel === i ? '#ffd700' : i === 2 ? '#E83030' : '#fff';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(
        `${G.proaOptSel === i ? '▶ ' : '  '}${o}`,
        optX + 8,
        optY + 14 + i * 16
      );
    });
  }
}

// === PANTALLA DE DATOS DE CRIATURA ===
function uCreData() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) {
    G.proaMode = 'view';
    return;
  }

  if (G.dataMvDetail) {
    uMoveDetail();
    return;
  }

  if (kp('x') || kp('Escape')) {
    G.proaMode = 'view';
    return;
  }
  if (kp('ArrowUp')) {
    G.dataMvSel = (G.dataMvSel + cre.mv.length - 1) % cre.mv.length;
    sfx.sel();
  }
  if (kp('ArrowDown')) {
    G.dataMvSel = (G.dataMvSel + 1) % cre.mv.length;
    sfx.sel();
  }
  if (kp(' ') || kp('Enter')) {
    sfx.sel();
    G.dataMvDetail = true;
  }
}

function dCreData() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) return;

  if (G.dataMvDetail) {
    dMoveDetail();
    return;
  }

  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(20, 10, 600, 460, 'Datos de Criatura');

  // === SPRITE ESCALADO ===
  cx.save();
  cx.translate(130, 120);
  cx.scale(3, 3);
  dCre(0, 0, cre.id, cre.lv, fr);
  cx.restore();

  // === INFO DERECHA ===
  const ix = 320;

  // Nombre
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(cre.nm, ix, 50);

  // Tipo
  cx.fillStyle = tCol(cre.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(cre.tp)} ${tNam(cre.tp)}`, ix, 70);

  // Nivel
  cx.fillStyle = '#fff';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`Nivel: ${cre.lv}`, ix, 90);

  // HP
  dHP(ix, 98, 140, 7, cre.hp, cre.mHp);

  // Stats
  cx.fillStyle = '#fff';
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`ATK: ${cre.ak}`, ix, 126);
  cx.fillText(`DEF: ${cre.df}`, ix + 120, 126);
  cx.fillText(`SPD: ${cre.sp}`, ix, 144);
  cx.fillText(`HP Max: ${cre.mHp}`, ix + 120, 144);

  // EXP
  cx.fillStyle = '#aaa';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`EXP: ${cre.ex}/${cre.exTo}`, ix, 162);
  dEXP(ix + 80, 157, 120, 4, cre.ex, cre.exTo);

  // Capturas de esta especie
  const count = captureCount[cre.id] || 0;
  cx.fillStyle = '#888';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Capturados: ${count} vez${count !== 1 ? 'es' : ''}`, ix, 180);

  // === DESCRIPCIÓN LARGA ===
  const descLines = CRE_DESC[cre.id] || [
    CDB[cre.id]?.desc || 'Criatura misteriosa.',
  ];
  cx.fillStyle = '#C8C0A8';
  cx.font = '6px "Press Start 2P"';
  descLines.forEach((l, i) => {
    cx.fillText(l, 50, 280 + i * 14);
  });

  // === MOVIMIENTOS ===
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Movimientos:', 50, 330);

  cre.mv.forEach((m, i) => {
    const my = 350 + i * 28;
    const sel = G.dataMvSel === i;

    if (sel) {
      cx.fillStyle = 'rgba(255,215,0,.08)';
      cx.fillRect(45, my - 8, 550, 24);
    }

    cx.fillStyle = sel ? '#ffd700' : '#fff';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${sel ? '▶ ' : '  '}${m.nm}`, 50, my);

    cx.fillStyle = tCol(m.tp);
    cx.font = '6px "Press Start 2P"';
    cx.fillText(tNam(m.tp), 230, my);

    cx.fillStyle = '#aaa';
    cx.fillText(`PW:${m.pw || '-'}`, 310, my);
    cx.fillText(`PP:${m.pp}/${m.mp}`, 390, my);
    cx.fillText(`ACC:${m.acc || 100}%`, 480, my);
  });

  // Instrucciones
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE: Ver detalle de movimiento | X: Volver', 50, 455);
}

// === DETALLE DE MOVIMIENTO ===
function uMoveDetail() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.dataMvDetail = false;
  }
}

function dMoveDetail() {
  const allCre = [...G.party, ...proa];
  const cre = allCre[G.proaSel];
  if (!cre) {
    G.dataMvDetail = false;
    return;
  }

  // Fondo: pantalla de datos detrás
  dCreData_bg(cre);

  // Recuadro de detalle del movimiento
  const mv = cre.mv[G.dataMvSel];
  if (!mv) {
    G.dataMvDetail = false;
    return;
  }

  // Buscar desc completa en ALL_MOVES
  const fullMove = ALL_MOVES.find((m) => m.nm === mv.nm);
  const desc = fullMove?.desc || mv.desc || 'Sin descripción.';
  const acc = mv.acc || fullMove?.acc || 100;

  // Caja oscura que tapa el sprite
  cx.fillStyle = 'rgba(0,0,0,.85)';
  cx.fillRect(30, 60, 580, 300);
  cx.strokeStyle = '#ffd700';
  cx.lineWidth = 3;
  cx.strokeRect(30, 60, 580, 300);
  cx.strokeStyle = '#8b6914';
  cx.lineWidth = 1;
  cx.strokeRect(36, 66, 568, 288);

  // Esquinas doradas
  px(30, 60, 8, 8, '#ffd700');
  px(602, 60, 8, 8, '#ffd700');
  px(30, 352, 8, 8, '#ffd700');
  px(602, 352, 8, 8, '#ffd700');

  // Nombre del movimiento
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(mv.nm, 60, 95);

  // Tipo
  cx.fillStyle = tCol(mv.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(mv.tp)} ${tNam(mv.tp)}`, 60, 120);

  // Línea separadora
  cx.fillStyle = '#8b6914';
  cx.fillRect(60, 130, 500, 2);

  // Descripción (multilinea)
  const descWrap = wrapText(desc, 50);
  cx.fillStyle = '#E8E0D0';
  cx.font = '7px "Press Start 2P"';
  descWrap.forEach((l, i) => {
    cx.fillText(l, 60, 155 + i * 16);
  });

  // Stats del movimiento
  const statsY = 155 + descWrap.length * 16 + 20;

  cx.fillStyle = '#fff';
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`Poder:`, 60, statsY);
  cx.fillStyle = mv.pw > 0 ? '#E8C830' : '#888';
  cx.fillText(`${mv.pw > 0 ? mv.pw : '-'}`, 160, statsY);

  cx.fillStyle = '#fff';
  cx.fillText(`PP:`, 250, statsY);
  cx.fillStyle = '#aaa';
  cx.fillText(`${mv.pp}/${mv.mp}`, 290, statsY);

  cx.fillStyle = '#fff';
  cx.fillText(`Precisión:`, 380, statsY);
  cx.fillStyle = acc >= 100 ? '#30D848' : acc >= 90 ? '#E8C020' : '#E83030';
  cx.fillText(`${acc}%`, 510, statsY);

  // Efecto
  if (mv.ef) {
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`Efecto: ${getEffectDesc(mv.ef)}`, 60, statsY + 24);
  }

  // STAB info
  if (mv.tp === cre.tp) {
    cx.fillStyle = '#30D848';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(
      '★ STAB: Mismo tipo que la criatura (+50% daño)',
      60,
      statsY + 48
    );
  }

  // Instrucción
  cx.fillStyle = '#606878';
  cx.font = '6px "Press Start 2P"';
  cx.fillText('SPACE/X: Cerrar', 60, 340);
}

// Función auxiliar para dibujar fondo de datos sin el overlay
function dCreData_bg(cre) {
  cx.fillStyle = '#0a0a2e';
  cx.fillRect(0, 0, 640, 480);
  dBoxMenu(20, 10, 600, 460, 'Datos de Criatura');

  const ix = 320;
  cx.fillStyle = '#ffd700';
  cx.font = '12px "Press Start 2P"';
  cx.fillText(cre.nm, ix, 50);
  cx.fillStyle = tCol(cre.tp);
  cx.font = '8px "Press Start 2P"';
  cx.fillText(`${tEmo(cre.tp)} ${tNam(cre.tp)}`, ix, 70);

  // Movimientos (tenues detrás)
  cx.globalAlpha = 0.2;
  cx.fillStyle = '#ffd700';
  cx.font = '8px "Press Start 2P"';
  cx.fillText('Movimientos:', 50, 330);
  cre.mv.forEach((m, i) => {
    cx.fillStyle = '#aaa';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(m.nm, 70, 350 + i * 28);
  });
  cx.globalAlpha = 1;
}

// === DESCRIPCIONES DE EFECTOS ===
function getEffectDesc(ef) {
  const descs = {
    heal: 'Recupera 35% HP máximo',
    healAll: 'Cura 20% HP a todo el equipo',
    spdUp: 'Sube SPD +1',
    spdUp2: 'Sube SPD +2',
    atkUp2: 'Sube ATK +2',
    defUp2: 'Sube DEF +2',
    atkSpdUp: 'Sube ATK y SPD +1',
    atkDefUp: 'Sube ATK y DEF +1',
    atkSpdUpDefDn: 'ATK y SPD +1, DEF -1',
    protect: 'Bloquea el próximo ataque',
    shield1: 'Próximo ataque recibido -50% daño',
    sunUp: 'Sol 5 turnos: Fuego +50%, Agua -50%',
    rainUp: 'Lluvia 5 turnos: Agua +50%, Fuego -50%',
    fairyUp: 'Campo mágico 5 turnos: Hada +50%',
    healField3: 'Flores 3 turnos: cura HP cada turno',
    leech4: 'Drena HP por 4 turnos',
    sleep2: 'Duerme al rival 2 turnos',
    clearStatus: 'Elimina estados alterados propios',
    wishHeal: 'Turno siguiente: +50% HP',
    curse: 'Sacrifica 50% HP, rival pierde 12% HP/turno',
    accDn: 'Baja precisión del rival',
    accDnBoth: 'Baja precisión de ambos',
    burn20: '20% de quemar al rival',
    paralyze20: '20% de paralizar al rival',
    confuse20: '20% de confundir al rival',
    flinch20: '20% de hacer retroceder',
    flinch15: '15% de hacer retroceder',
    spdDn30: '30% de bajar SPD rival',
    atkDn30: '30% de bajar ATK rival',
    defDn: 'Baja DEF rival -1',
    atkDn: 'Baja ATK rival -1',
    atkDn2: 'Baja ATK rival -2',
    selfDefDn: 'Baja tu DEF -1',
    selfSpdDn: 'Baja tu SPD -1',
    drain50: 'Recupera 50% del daño como HP',
    drain25: 'Recupera 25% del daño como HP',
    highCrit: 'Alta probabilidad de golpe crítico',
    priority: 'Siempre ataca primero',
    hitTwice: 'Golpea 2 veces',
    revenge: 'Doble daño si recibiste daño este turno',
    reversal: 'Más daño cuanto menos HP tengas',
    fixedDmg: 'Siempre hace daño fijo',
    neverMiss: 'Nunca falla',
    trap2: 'Atrapa al rival 2 turnos',
    charge: 'Necesita cargar un turno',
    mirror: 'Refleja último ataque',
    copyLast: 'Copia último movimiento rival',
    batonPass: 'Pasa stats al compañero',
  };
  return descs[ef] || ef;
}

// === MAPA GRANDE ===
function uMapScreen() {
  if (kp('x') || kp('Escape') || kp(' ') || kp('Enter')) {
    G.showMap = false;
  }
}

function dMapScreen() {
  dBoxMenu(30, 10, 580, 460, 'MAPA DEL REINO');

  // Fondo del mapa
  cx.fillStyle = '#2d5a1e';
  cx.fillRect(45, 30, 550, 420);
  cx.fillStyle = '#3a6a28';
  cx.fillRect(47, 32, 546, 416);

  // Escala del minimapa
  const scX = 546 / WC,
    scY = 416 / WR;
  const offX = 47,
    offY = 32;

  // Dibujar tiles simplificados
  for (let r = 0; r < WR; r += 2)
    for (let c = 0; c < WC; c += 2) {
      const t = wMap[r]?.[c];
      let col = null;
      if (t === 2) col = '#2070C0'; // Agua
      else if (t === 3) col = '#1A5818'; // Árboles
      else if (t === 4) col = '#A09080'; // Edificios
      else if (t === 13) col = '#687080'; // Castillo
      else if (t === 1) col = '#C8B898'; // Caminos
      else if (t === 7) col = '#707070'; // Rocas
      else if (t === 9) col = '#484038'; // Cuevas
      else if (t === 11) col = '#C8A830'; // Castillo puerta
      else if (t === 12) col = '#D860A8'; // Torre
      if (col) {
        cx.fillStyle = col;
        cx.fillRect(offX + c * scX, offY + r * scY, scX * 2 + 1, scY * 2 + 1);
      }
    }

  // Ubicaciones importantes
  MAP_LOCATIONS.forEach((loc) => {
    const lx = offX + loc.x * scX;
    const ly = offY + loc.y * scY;

    // Punto brillante
    cx.fillStyle = loc.col;
    cx.fillRect(lx - 3, ly - 3, 6, 6);
    cx.fillStyle = '#fff';
    cx.fillRect(lx - 1, ly - 1, 2, 2);

    // Nombre
    cx.fillStyle = '#000';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(loc.nm, lx + 6, ly + 2);
    cx.fillStyle = loc.col;
    cx.fillText(loc.nm, lx + 5, ly + 1);
  });

  // Jugador (punto parpadeante)
  const plx = offX + G.pl.x * scX;
  const ply = offY + G.pl.y * scY;
  if (fr % 20 < 14) {
    cx.fillStyle = '#F8F8F8';
    cx.fillRect(plx - 4, ply - 4, 8, 8);
    cx.fillStyle = '#E83030';
    cx.fillRect(plx - 2, ply - 2, 4, 4);
  }

  // Leyenda
  cx.fillStyle = '#fff';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('■ = Tú', 460, 440);
  cx.fillStyle = '#aaa';
  cx.fillText('SPACE/X: Cerrar', 50, 450);

  // Info de ubicación actual
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  const curLoc = MAP_LOCATIONS.find(
    (l) => Math.abs(l.x - G.pl.x) < 6 && Math.abs(l.y - G.pl.y) < 6
  );
  if (curLoc) cx.fillText(`Ubicación: ${curLoc.nm}`, 200, 450);
}
// ============================================================
// BLOQUE 17: SISTEMA DE BATALLA
// ============================================================

// ============================================================
// IA DE COMBATE INTELIGENTE
// ============================================================

function aiChooseMove(attacker, defender, battleInfo) {
  const available = attacker.mv.filter((m) => m.pp > 0);
  if (available.length === 0) return attacker.mv[0];
  if (available.length === 1) return available[0];
  let intelligence = 1;
  if (battleInfo.isNPC) intelligence = 2;
  if (battleInfo.isBoss || battleInfo.isPair) intelligence = 3;
  if (postGame && battleInfo.isNPC) intelligence = 3;
  if (intelligence === 1) return aiBasic(available, attacker, defender);
  if (intelligence === 2) return aiSmart(available, attacker, defender);
  return aiExpert(available, attacker, defender);
}

function aiBasic(moves, attacker, defender) {
  const scored = moves.map((m) => {
    let score = 50;
    if (m.pw > 0) score += m.pw;
    if (m.tp === attacker.tp) score += 15;
    if (m.pw > 0) {
      const eff = tEff(m.tp, defender.tp);
      if (eff > 1) score += 30;
      if (eff < 1) score -= 20;
    }
    score += Math.random() * 30;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].mv;
}

function aiSmart(moves, attacker, defender) {
  const hpR = attacker.hp / attacker.mHp;
  const dR = defender.hp / defender.mHp;
  const scored = moves.map((m) => {
    let score = 50;
    if (m.ef === 'heal' || m.ef === 'healAll') {
      if (hpR < 0.3) score += 120;
      else if (hpR < 0.5) score += 60;
      else score -= 40;
    }
    if (m.pw > 0) {
      score += m.pw * 0.8;
      if (m.tp === attacker.tp) score += 20;
      const e = tEff(m.tp, defender.tp);
      if (e > 1) score += 50;
      if (e < 1) score -= 30;
      if (dR < 0.25 && m.pw >= 30) score += 30;
      if (m.ef === 'priority' && dR < 0.3) score += 40;
    }
    if (m.ef === 'atkUp2' || m.ef === 'atkSpdUp' || m.ef === 'atkDefUp') {
      if (hpR > 0.6) score += 40;
      else score -= 20;
    }
    if (m.ef === 'sleep2' || m.ef === 'confuse20') {
      if (!battleState.playerStatus) score += 35;
      else score -= 30;
    }
    if (m.ef === 'drain50' || m.ef === 'drain25') {
      if (hpR < 0.5) score += 35;
      score += m.pw * 0.5;
    }
    if (m.ef === 'protect' || m.ef === 'shield1') {
      if (hpR < 0.4) score += 50;
      else score -= 10;
    }
    // Conservar PP: penalizar movimientos con pocos PP restantes
    if (m.pp <= 2 && m.pw > 0) score -= 15;
    if (m.pp <= 1) score -= 25;
    score += Math.random() * 20;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].mv;
}

function aiExpert(moves, attacker, defender) {
  const hpR = attacker.hp / attacker.mHp;
  const dR = defender.hp / defender.mHp;
  // Boss desesperado: más agresivo cuando tiene poca vida
  const desperate = hpR < 0.2;
  const scored = moves.map((m) => {
    let score = 50;
    if (m.ef === 'heal' || m.ef === 'healAll') {
      if (desperate) score += 200;
      else if (hpR < 0.4) score += 80;
      else if (hpR < 0.6) score += 30;
      else score -= 50;
    }
    if (m.pw > 0) {
      const e = tEff(m.tp, defender.tp);
      const s = m.tp === attacker.tp ? 1.5 : 1;
      const ed = m.pw * s * e;
      score += ed * (desperate ? 1.0 : 0.6);
      if (e > 1) score += 60;
      if (e < 1) score -= 40;
      if (ed * 1.5 > defender.hp) score += 80;
      if (m.ef === 'priority' && dR < 0.2) score += 70;
      if (m.ef === 'hitTwice') score += 20;
      if (m.ef === 'revenge' && battleState.lastDmgToEnemy > 0) score += 40;
      if (m.ef === 'reversal' && hpR < 0.3) score += 60;
    }
    if (m.ef === 'atkUp2' || m.ef === 'atkSpdUp') {
      if (hpR > 0.7 && battleState.enemyStatMods.atk < 2) score += 55;
      else if (hpR > 0.5) score += 30;
      else score -= 20;
    }
    if (m.ef === 'defUp2') {
      if (hpR > 0.5 && battleState.enemyStatMods.def < 2) score += 40;
      else score -= 15;
    }
    if (m.ef === 'sleep2') {
      if (!battleState.playerStatus && dR > 0.4) score += 50;
      else score -= 30;
    }
    if (m.ef === 'protect') {
      if (hpR < 0.3) score += 60;
      else score -= 20;
    }
    if (m.ef === 'drain50' || m.ef === 'drain25') {
      if (hpR < 0.5) score += 45;
      else score += 15;
    }
    if (m.ef === 'leech4') {
      if (!battleState.playerStatus && dR > 0.5) score += 50;
      else score -= 20;
    }
    if (m.ef === 'sunUp' && attacker.tp === 'fire' && !battleState.weather)
      score += 45;
    if (m.ef === 'rainUp' && attacker.tp === 'water' && !battleState.weather)
      score += 45;
    if (m.ef === 'fairyUp' && attacker.tp === 'fairy' && !battleState.weather)
      score += 45;
    if (m.ef === 'clearStatus' && battleState.enemyStatus) score += 60;
    const acc = m.acc || 100;
    if (acc < 100) score -= (100 - acc) * 0.3;
    // Conservar PP: penalizar movimientos con pocos PP
    if (m.pp <= 2 && m.pw > 0) score -= 10;
    if (m.pp <= 1) score -= 20;
    score += Math.random() * 10;
    return { mv: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored.length > 1 && Math.random() < 0.1) return scored[1].mv;
  return scored[0].mv;
}

function pCre() {
  return G.party[G.bs.pi];
}

function calcCaptureChance(enemy) {
  const hpRatio = enemy.hp / enemy.mHp;
  const missingHp = 1 - hpRatio;
  let chance = 0.18 + missingHp * 0.52;

  // Estados alterados hacen que el Cristal Vínculo conecte mejor.
  const st = battleState.enemyStatus;
  if (st === 'sleep') chance += 0.18;
  else if (st === 'paralyze' || st === 'burn') chance += 0.1;
  else if (st === 'confuse') chance += 0.08;
  else if (st === 'leech' || st === 'curse') chance += 0.05;

  // Un rival muy por encima del promedio del equipo se resiste más.
  const lvDiff = enemy.lv - avgPartyLv();
  if (lvDiff > 0) chance -= Math.min(0.18, lvDiff * 0.015);
  if (G.party.some((c) => c.id === enemy.id) || proa.some((c) => c.id === enemy.id)) chance += 0.04;

  return clamp(chance, 0.08, 0.9);
}

function startCaptureAttempt() {
  const b = G.bs;
  G.crv--;
  const chance = calcCaptureChance(b.en);
  const roll = Math.random();
  const success = roll < chance;
  let shakes = 0;
  if (success) shakes = 3;
  else if (roll < chance + 0.18) shakes = 2;
  else if (roll < chance + 0.38) shakes = 1;

  b.cap = {
    tm: 0,
    chance,
    success,
    shakes,
    done: false,
    crystalY: 106,
  };
  b.msg = '¡Lanzaste un Cristal Vínculo!';
  b.ph = 'captureAnim';
  b.tm = 0;
  sfx.cap();
}

function finishCaptureAttempt() {
  const b = G.bs;
  if (!b.cap) return;
  if (b.cap.success) {
    b.msg = `¡Capturaste a ${b.en.nm}!`;
    const nc = new Cre(b.en.id, b.en.lv);
    nc.hp = b.en.hp;
    if (!captureCount[b.en.id]) captureCount[b.en.id] = 0;
    captureCount[b.en.id]++;
    if (G.party.length >= 6) {
      proa.push(nc);
      b.msg += ' ¡Enviado a Proa!';
    } else {
      G.party.push(nc);
    }
    checkAllCaught();
    b.mq = [{ a: 'end' }];
    sfx.cap();
  } else {
    const shakeMsg = b.cap.shakes === 0 ? 'ni se movió' : b.cap.shakes === 1 ? 'tembló una vez' : 'tembló dos veces';
    b.msg = `¡${b.en.nm} escapó! El cristal ${shakeMsg}.`;
    b.mq = [{ a: 'eT' }];
    sfx.nef();
  }
  b.cap.done = true;
  b.ph = 'msg';
  b.tm = 0;
}

function uBattle() {
  const b = G.bs;
  b.af++;
  b.tm++;
  if (b.ps > 0) b.ps--;
  if (b.es > 0) b.es--;

  // === FASE INTRO NPC ===
  if (b.ph === 'npcIntro') {
    b.introTm++;
    if (!b.introFull) {
      if (b.introTm % 2 === 0) {
        b.introCi++;
        if (b.introCi >= b.npcIntro[b.introLine].length) b.introFull = true;
      }
    }
    if (kp(' ') || kp('Enter')) {
      if (!b.introFull) {
        b.introFull = true;
        b.introCi = b.npcIntro[b.introLine].length;
      } else {
        b.introLine++;
        b.introCi = 0;
        b.introFull = false;
        b.introTm = 0;
        if (b.introLine >= b.npcIntro.length) {
          b.ph = 'intro';
          b.tm = 0;
          sfx.sel();
        }
      }
    }
    return;
  }

  // === FASE INTRO NORMAL ===
  if (b.ph === 'intro') {
    if (b.tm > 50 || kp(' ') || kp('Enter')) {
      b.ph = 'act';
      b.tm = 0;
    }
    return;
  }

  // Marcar criatura como participante
  pCre().fought = true;
  if (!b.fought.includes(b.pi)) b.fought.push(b.pi);

  switch (b.ph) {
    // === ANIMACIÓN DE CAPTURA ===
    case 'captureAnim':
      {
        const total = 48 + (b.cap?.shakes || 0) * 28 + 28;
        if (kp(' ') || kp('Enter') || b.tm > total) finishCaptureAttempt();
      }
      break;

    // === SELECCIÓN DE ACCIÓN ===
    case 'act':
      if (kp('ArrowUp')) {
        b.ms = b.ms < 3 ? (b.ms + 3) % 6 : b.ms - 3;
        sfx.sel();
      }
      if (kp('ArrowDown')) {
        b.ms = b.ms < 3 ? (b.ms + 3) % 6 : b.ms - 3;
        sfx.sel();
      }
      if (kp('ArrowLeft')) {
        b.ms = (b.ms + 5) % 6;
        sfx.sel();
      }
      if (kp('ArrowRight')) {
        b.ms = (b.ms + 1) % 6;
        sfx.sel();
      }
      if (kp(' ') || kp('Enter')) {
        sfx.sel();
        switch (b.ms) {
          case 0: // Luchar
            b.ph = 'move';
            b.mvs = 0;
            break;
          case 1: // Poción
            if (G.pot > 0) {
              G.pot--;
              const heal = Math.floor(pCre().mHp * 0.2);
              pCre().heal(heal);
              sfx.heal();
              b.msg = `${pCre().nm} recuperó ${heal} HP!`;
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'eT' }];
            } else {
              b.msg = '¡Sin pociones!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 2: // Revivir
            if (G.rev > 0) {
              const fi = G.party.findIndex((c, i) => c.hp <= 0 && i !== b.pi);
              if (fi !== -1) {
                G.rev--;
                G.party[fi].hp = Math.floor(G.party[fi].mHp * 0.5);
                sfx.heal();
                b.msg = `¡${G.party[fi].nm} revivió!`;
                b.ph = 'msg';
                b.tm = 0;
                b.mq = [{ a: 'eT' }];
              } else {
                b.msg = 'Nadie caído.';
                b.ph = 'msg';
                b.tm = 0;
                b.mq = [];
              }
            } else {
              b.msg = '¡Sin revivir!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 3: // Cambiar
            if (G.party.filter((c) => c.hp > 0).length > 1) {
              b.ph = 'switch';
              b.ss = 0;
            } else {
              b.msg = '¡Solo tienes una!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 4: // Capturar
            if (b.isMerch || b.isBoss || b.npcTeam) {
              b.msg = '¡No puedes capturar aquí!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
              break;
            }
            if (G.crv > 0) {
              startCaptureAttempt();
            } else {
              b.msg = '¡Sin Cristales Vínculo!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
            }
            break;
          case 5: // Huir
            if (b.isBoss) {
              b.msg = '¡No puedes huir del Rey!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [];
              break;
            }
            if (b.isMerch) {
              G.scr = 'world';
              break;
            }
            const fleeChance = b.fleeChance ?? 0.6;
            if (Math.random() < fleeChance) {
              b.msg = '¡Huiste con éxito!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'end' }];
            } else {
              b.msg = '¡No pudiste escapar!';
              b.ph = 'msg';
              b.tm = 0;
              b.mq = [{ a: 'eT' }];
            }
            break;
        }
      }
      break;

    // === SELECCIÓN DE MOVIMIENTO ===
    case 'move':
      {
        const c = pCre();
        if (kp('ArrowUp')) {
          b.mvs = b.mvs < 2 ? (b.mvs + 2) % 4 : b.mvs - 2;
          sfx.sel();
        }
        if (kp('ArrowDown')) {
          b.mvs = b.mvs < 2 ? (b.mvs + 2) % 4 : b.mvs - 2;
          sfx.sel();
        }
        if (kp('ArrowLeft')) {
          b.mvs = (b.mvs + 3) % 4;
          sfx.sel();
        }
        if (kp('ArrowRight')) {
          b.mvs = (b.mvs + 1) % 4;
          sfx.sel();
        }
        if (kp('x') || kp('Escape')) {
          b.ph = 'act';
        }
        if (kp(' ') || kp('Enter')) {
          const mv = c.mv[b.mvs];
          if (mv.pp > 0) execTurn(mv);
          else {
            b.msg = '¡Sin PP!';
            b.ph = 'msg';
            b.tm = 0;
            b.mq = [];
          }
        }
      }
      break;

    // === CAMBIAR CRIATURA ===
    case 'switch':
      if (kp('ArrowUp') || kp('ArrowLeft')) {
        b.ss = (b.ss + G.party.length - 1) % G.party.length;
        sfx.sel();
      }
      if (kp('ArrowDown') || kp('ArrowRight')) {
        b.ss = (b.ss + 1) % G.party.length;
        sfx.sel();
      }
      if (kp('x') || kp('Escape')) {
        b.ph = 'act';
      }
      if (kp(' ') || kp('Enter')) {
        if (b.ss !== b.pi && G.party[b.ss].hp > 0) {
          b.pi = b.ss;
          pCre().fought = true;
          if (!b.fought.includes(b.pi)) b.fought.push(b.pi);
          b.msg = `¡Adelante, ${pCre().nm}!`;
          b.ph = 'msg';
          b.tm = 0;
          b.mq = [{ a: 'eT' }];
        } else sfx.nef();
      }
      break;

    // === MENSAJE ===
    case 'msg':
      if (b.tm > 40 || kp(' ') || kp('Enter')) {
        if (b.mq.length > 0) {
          procAct(b.mq.shift());
        } else {
          if (b.en.hp <= 0) handleWin();
          else if (pCre().hp <= 0) handleFaint();
          else b.ph = 'act';
        }
        b.tm = 0;
      }
      break;

    // === VICTORIA ===
    case 'win':
      if (b.tm > 40 || kp(' ') || kp('Enter')) {
        if (b.mq.length > 0) {
          const n = b.mq.shift();
          if (n.a === 'lvl') {
            b.msg = n.m;
            b.tm = 0;
            sfx.lvl();
          } else if (n.a === 'evo') {
            const cre = G.party[n.creIdx];
            const oldName = cre.nm;
            b.evoData = { creIdx: n.creIdx, oldName, evoId: n.evoId };
            b.ph = 'evolve';
            b.tm = 0;
            b.evoPhase = 0;
            sfx.lvl();
          } else if (n.a === 'learn') {
            // Mostrar pantalla de aprender ataque
            b.learnData = n;
            b.ph = 'learnMove';
            b.tm = 0;
            b.learnSel = 0;
          } else if (n.a === 'bMsg') {
            b.msg = 'Navarrete: ' + n.m;
            b.tm = 0;
          } else if (n.a === 'bNext' && G.bossIdx < G.bossTeam.length) {
            b.en = G.bossTeam[G.bossIdx];
            b.msg = `¡${b.en.nm} entra en batalla!`;
            b.ph = 'msg';
            b.tm = 0;
            b.mq = [];
          } else if (n.a === 'npcNext') {
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'npcMsg') {
            b.msg = n.m;
            b.ph = 'msg';
            b.tm = 0;
          } else if (n.a === 'end') {
            if (b.npcData) markNPCDefeated(b.npcData);
            if (b.npcData?.isPunk && postGame) {
              oloDefeated = true;
              resetRebattles();
            }
            resetBattleState();
            G.scr = 'world';
          }
        } else {
          resetBattleState();
          G.scr = 'world';
        }
      }
      break;

    // === EVOLUCIÓN ===
    case 'evolve':
      b.tm++;
      if (b.evoPhase === 0) {
        // Mostrar pregunta
        if (b.tm > 30 || kp(' ') || kp('Enter')) {
          b.evoPhase = 1;
          b.tm = 0;
          b.evoSel = 0;
        }
      } else if (b.evoPhase === 1) {
        // Selección sí/no
        if (
          kp('ArrowUp') ||
          kp('ArrowDown') ||
          kp('ArrowLeft') ||
          kp('ArrowRight')
        ) {
          b.evoSel = (b.evoSel + 1) % 2;
          sfx.sel();
        }
        if (kp(' ') || kp('Enter')) {
          sfx.sel();
          if (b.evoSel === 0) {
            // Sí evolucionar
            const cre = G.party[b.evoData.creIdx];
            const result = evolveCre(cre);
            if (result) {
              sfx.cap();
              b.msg = `¡${result.oldName} evolucionó a ${result.newName}!`;
              b.evoPhase = 2;
              b.tm = 0;
            } else {
              b.ph = 'win';
              b.tm = 0;
            }
          } else {
            // No evolucionar
            b.msg = `${b.evoData.oldName} no evolucionó.`;
            b.ph = 'win';
            b.tm = 0;
          }
        }
      } else if (b.evoPhase === 2) {
        // Mostrar resultado
        if (b.tm > 60 || kp(' ') || kp('Enter')) {
          b.ph = 'win';
          b.tm = 0;
        }
      }
      break;

    // === APRENDER ATAQUE ===
    case 'learnMove':
      {
        const ld = b.learnData;
        const cre = G.party[ld.creIdx];
        if (kp('ArrowUp')) {
          b.learnSel = (b.learnSel + 4) % 5;
          sfx.sel();
        }
        if (kp('ArrowDown')) {
          b.learnSel = (b.learnSel + 1) % 5;
          sfx.sel();
        }
        if (kp(' ') || kp('Enter')) {
          sfx.sel();
          if (b.learnSel < 4) {
            const oldName = cre.mv[b.learnSel].nm;
            cre.mv[b.learnSel] = { ...ld.move };
            b.msg = `¡${cre.nm} olvidó ${oldName} y aprendió ${ld.move.nm}!`;
            b.ph = 'win';
            b.tm = 0;
          } else {
            b.msg = `${cre.nm} no aprendió ${ld.move.nm}.`;
            b.ph = 'win';
            b.tm = 0;
          }
        }
        if (kp('x') || kp('Escape')) {
          b.msg = `${cre.nm} no aprendió ${ld.move.nm}.`;
          b.ph = 'win';
          b.tm = 0;
        }
      }
      break;

    // === DERROTA ===
    case 'defeat':
      if (b.tm > 50 || kp(' ') || kp('Enter')) {
        G.party.forEach((c) => c.full());
        resetBattleState();
        // Volver al último curandero
        G.pl.x = lastHealPos.x;
        G.pl.y = lastHealPos.y;
        G.curMap = lastHealPos.map;
        // Actualizar cámara según mapa
        if (G.curMap === 'world') updateCamera(WC, WR);
        else if (G.curMap.startsWith('cave')) updateCamera(CC, CR);
        else if (G.curMap === 'castle') updateCamera(KC, KR);
        else if (G.curMap === 'tower') updateCamera(TWC, TWR);
        G.scr = 'world';
        aN('Volviste al último curandero...');
      }
      break;
  }
}

// === EJECUCIÓN DE TURNOS ===
function execTurn(mv) {
  const b = G.bs,
    c = pCre();
  b.mq = [];
  // El más rápido va primero
  if (c.sp >= b.en.sp) {
    b.mq.push({ a: 'pA', mv }, { a: 'cE' }, { a: 'eT' });
  } else {
    b.mq.push({ a: 'eT' }, { a: 'cP' }, { a: 'pA', mv });
  }
  procAct(b.mq.shift());
}

function procAct(act) {
  const b = G.bs,
    c = pCre();

  if (act.a === 'pA') {
    const mv = act.mv;
    mv.pp--;
    const isPlayer = true;

    // Protección
    if (battleState.enemyProtect && mv.pw > 0) {
      battleState.enemyProtect = false;
      b.msg = `¡${b.en.nm} se protegió!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Parálisis check
    if (battleState.playerStatus === 'paralyze' && Math.random() < 0.25) {
      b.msg = `¡${c.nm} está paralizado y no puede moverse!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    // Sueño check
    if (battleState.playerStatus === 'sleep') {
      if (battleState.playerStatusTurns > 0) {
        battleState.playerStatusTurns--;
        b.msg = `¡${c.nm} está dormido!`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      } else {
        battleState.playerStatus = null;
        b.msg = `¡${c.nm} despertó!`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
    }
    // Confusión check
    if (battleState.playerStatus === 'confuse' && Math.random() < 0.33) {
      const selfDmg = Math.max(1, Math.floor(c.mHp * 0.1));
      c.hp = Math.max(0, c.hp - selfDmg);
      b.ps = 10;
      b.msg = `¡${c.nm} se hirió por confusión! -${selfDmg}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Efectos de soporte (sin daño)
    if (mv.ef === 'heal') {
      const h = Math.floor(c.mHp * 0.35);
      c.heal(h);
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! +${h}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    if (mv.ef === 'healAll') {
      G.party.forEach((p) => {
        if (p.hp > 0) p.heal(Math.floor(p.mHp * 0.2));
      });
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! ¡Equipo curado!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    if (mv.ef === 'spdUp') {
      battleState.playerStatMods.spd++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Velocidad subió!`;
    }
    if (mv.ef === 'atkUp2') {
      battleState.playerStatMods.atk += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Ataque subió mucho!`;
    }
    if (mv.ef === 'spdUp2') {
      battleState.playerStatMods.spd += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Velocidad subió mucho!`;
    }
    if (mv.ef === 'defUp2') {
      battleState.playerStatMods.def += 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Defensa subió mucho!`;
    }
    if (mv.ef === 'atkSpdUp') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.spd++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y SPD subieron!`;
    }
    if (mv.ef === 'atkDefUp') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.def++;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y DEF subieron!`;
    }
    if (mv.ef === 'atkSpdUpDefDn') {
      battleState.playerStatMods.atk++;
      battleState.playerStatMods.spd++;
      battleState.playerStatMods.def--;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡ATK y SPD suben, DEF baja!`;
    }
    if (mv.ef === 'protect') {
      battleState.playerProtect = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Se protege!`;
    }
    if (mv.ef === 'shield1') {
      battleState.playerShield = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Escama protectora activa!`;
    }
    if (mv.ef === 'sunUp') {
      battleState.weather = 'sun';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡El sol brilla con fuerza!`;
    }
    if (mv.ef === 'rainUp') {
      battleState.weather = 'rain';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Empieza a llover!`;
    }
    if (mv.ef === 'fairyUp') {
      battleState.weather = 'fairy';
      battleState.weatherTurns = 5;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Campo mágico activo!`;
    }
    if (mv.ef === 'healField3') {
      battleState.weather = 'flower';
      battleState.weatherTurns = 3;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Flores curan cada turno!`;
    }
    if (mv.ef === 'leech4') {
      battleState.enemyStatus = 'leech';
      battleState.enemyStatusTurns = 4;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Drenadoras plantadas!`;
    }
    if (mv.ef === 'sleep2') {
      battleState.enemyStatus = 'sleep';
      battleState.enemyStatusTurns = 2;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡${b.en.nm} se durmió!`;
    }
    if (mv.ef === 'clearStatus') {
      battleState.playerStatus = null;
      battleState.playerStatusTurns = 0;
      sfx.heal();
      b.msg = `${c.nm}: ${mv.nm}! ¡Estados limpiados!`;
    }
    if (mv.ef === 'wishHeal') {
      battleState.wishHealNext = true;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Deseo activado para el próximo turno!`;
    }
    if (mv.ef === 'curse') {
      const cost = Math.floor(c.mHp * 0.5);
      c.hp = Math.max(1, c.hp - cost);
      battleState.enemyStatus = 'curse';
      battleState.enemyStatusTurns = 99;
      sfx.nef();
      b.msg = `${c.nm}: ${mv.nm}! ¡Sacrificó ${cost}HP para maldecir!`;
    }
    if (mv.ef === 'accDn') {
      battleState.enemyStatMods.spd--;
      sfx.sel();
      b.msg = `${c.nm}: ${mv.nm}! ¡Precisión rival bajó!`;
    }

    // Si es efecto puro sin daño, terminar
    if (mv.pw === 0) {
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Ataques con daño
    const result = cDmg(c, b.en, mv, true);
    if (result.missed) {
      b.msg = `¡${c.nm}: ${mv.nm} falló!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    let dm = result.dmg;
    const ef = result.eff;

    // Mision de Luchito: contar golpes super efectivos
    if (ef > 1 && !result.missed) {
      LEADER_MISSIONS.luchito.superEffectiveHits++;
      if (LEADER_MISSIONS.luchito.superEffectiveHits === 3) {
        aN('¡Mision de Luchito completada! (3 golpes super efectivos)');
      }
    }

    // Doble golpe
    if (mv.ef === 'hitTwice') {
      dm = dm * 2;
      b.msg = `${c.nm}: ${mv.nm}! x2 ¡-${dm}HP!`;
    }
    // Venganza (doble si recibió daño)
    else if (mv.ef === 'revenge' && battleState.lastDmgToPlayer > 0) {
      dm = dm * 2;
      b.msg = `${c.nm}: ${mv.nm}! ¡VENGANZA! -${dm}HP`;
    }
    // Inversión (más daño con menos HP)
    else if (mv.ef === 'reversal') {
      const hpRatio = 1 - c.hp / c.mHp;
      dm = Math.max(1, Math.floor(dm * (1 + hpRatio * 2)));
      b.msg = `${c.nm}: ${mv.nm}! -${dm}HP`;
    } else {
      let em = '';
      if (result.crit) em += ' ¡CRÍTICO!';
      if (ef > 1) {
        em += ' ¡Súper efectivo!';
        sfx.sup();
      } else if (ef < 1) {
        em += ' Poco efectivo...';
        sfx.nef();
      } else sfx.atk();
      b.msg = `${c.nm}: ${mv.nm}! -${dm}HP${em}`;
    }

    b.en.hp = Math.max(0, b.en.hp - dm);
    b.es = 10;
    battleState.lastDmgToEnemy = dm;
    for (let i = 0; i < 5; i++)
      aP(380 + Math.random() * 40, 100 + Math.random() * 40, tCol(mv.tp));

    // Efectos secundarios post-daño
    if (mv.ef === 'burn20' && Math.random() < 0.2 && !battleState.enemyStatus) {
      battleState.enemyStatus = 'burn';
      b.msg += ` ¡${b.en.nm} se quemó!`;
    }
    if (
      mv.ef === 'paralyze20' &&
      Math.random() < 0.2 &&
      !battleState.enemyStatus
    ) {
      battleState.enemyStatus = 'paralyze';
      b.msg += ` ¡${b.en.nm} paralizado!`;
    }
    if (
      mv.ef === 'confuse20' &&
      Math.random() < 0.2 &&
      !battleState.enemyStatus
    ) {
      battleState.enemyStatus = 'confuse';
      battleState.enemyStatusTurns = 3;
      b.msg += ` ¡${b.en.nm} confuso!`;
    }
    if (mv.ef === 'flinch20' && Math.random() < 0.2) {
      b.msg += ` ¡${b.en.nm} retrocedió!`;
    }
    if (mv.ef === 'flinch15' && Math.random() < 0.15) {
      b.msg += ` ¡${b.en.nm} retrocedió!`;
    }
    if (mv.ef === 'spdDn30' && Math.random() < 0.3) {
      battleState.enemyStatMods.spd--;
      b.msg += ` ¡SPD rival bajó!`;
    }
    if (mv.ef === 'atkDn30' && Math.random() < 0.3) {
      battleState.enemyStatMods.atk--;
      b.msg += ` ¡ATK rival bajó!`;
    }
    if (mv.ef === 'defDn') {
      battleState.enemyStatMods.def--;
      b.msg += ` ¡DEF rival bajó!`;
    }
    if (mv.ef === 'atkDn') {
      battleState.enemyStatMods.atk--;
      b.msg += ` ¡ATK rival bajó!`;
    }
    if (mv.ef === 'selfDefDn') {
      battleState.playerStatMods.def--;
      b.msg += ` ¡Tu DEF bajó!`;
    }
    if (mv.ef === 'selfSpdDn') {
      battleState.playerStatMods.spd--;
      b.msg += ` ¡Tu SPD bajó!`;
    }
    if (mv.ef === 'spdUp') {
      battleState.playerStatMods.spd++;
      b.msg += ` ¡Tu SPD subió!`;
    }
    if (mv.ef === 'drain50') {
      const heal = Math.floor(dm * 0.5);
      c.heal(heal);
      b.msg += ` +${heal}HP drenado!`;
    }
    if (mv.ef === 'drain25') {
      const heal = Math.floor(dm * 0.25);
      c.heal(heal);
      b.msg += ` +${heal}HP drenado!`;
    }

    // Contraataque (15% chance)
    if (dm > 0 && b.en.hp > 0 && Math.random() < 0.15) {
      const counterDmg = Math.max(1, Math.floor(dm * 0.5));
      c.hp = Math.max(0, c.hp - counterDmg);
      b.ps = 5;
      b.msg += ` ¡Contraataque! -${counterDmg}HP`;
    }

    b.ph = 'msg';
    b.tm = 0;
  } else if (act.a === 'eT') {
    if (b.en.hp <= 0) {
      if (b.mq.length > 0) procAct(b.mq.shift());
      return;
    }

    // Status del enemigo
    if (battleState.enemyStatus === 'burn') {
      const bd = Math.max(1, Math.floor(b.en.mHp * 0.06));
      b.en.hp = Math.max(0, b.en.hp - bd);
      b.msg = `¡${b.en.nm} sufre quemadura! -${bd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (b.en.hp <= 0) return;
    }
    if (
      battleState.enemyStatus === 'leech' &&
      battleState.enemyStatusTurns > 0
    ) {
      const ld = Math.max(1, Math.floor(b.en.mHp * 0.05));
      b.en.hp = Math.max(0, b.en.hp - ld);
      c.heal(ld);
      battleState.enemyStatusTurns--;
      if (battleState.enemyStatusTurns <= 0) battleState.enemyStatus = null;
      b.msg = `¡Drenadoras! ${b.en.nm} -${ld}HP, ${c.nm} +${ld}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (b.en.hp <= 0) return;
    }
    if (battleState.enemyStatus === 'curse') {
      const cd = Math.max(1, Math.floor(b.en.mHp * 0.12));
      b.en.hp = Math.max(0, b.en.hp - cd);
      b.msg = `¡Maldición! ${b.en.nm} -${cd}HP`;
      b.ph = 'msg';
      b.tm = 0;
      if (b.en.hp <= 0) return;
    }

    // Deseo curación
    if (battleState.wishHealNext) {
      const wh = Math.floor(c.mHp * 0.5);
      c.heal(wh);
      battleState.wishHealNext = false;
      sfx.heal();
    }

    // Campo de flores
    if (battleState.weather === 'flower') {
      const fh = Math.floor(c.mHp * 0.1);
      c.heal(fh);
    }

    // Clima countdown
    if (battleState.weatherTurns > 0) {
      battleState.weatherTurns--;
      if (battleState.weatherTurns <= 0) battleState.weather = null;
    }

    // NPC usa poción si tiene poca vida (solo NPCs, no salvajes)
    if (
      b.isNPC &&
      b.en.hp > 0 &&
      b.en.hp / b.en.mHp < 0.25 &&
      Math.random() < 0.4
    ) {
      const maxPots = b.isBoss ? 7 : 2;
      if (!b.npcPotsUsed) b.npcPotsUsed = 0;
      if (b.npcPotsUsed < maxPots) {
        b.npcPotsUsed++;
        const healAmt = Math.floor(b.en.mHp * 0.3);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + healAmt);
        sfx.heal();
        b.msg = `¡${b.npcName || 'Rival'} usó una poción! (${
          b.npcPotsUsed
        }/${maxPots}) ${b.en.nm} +${healAmt}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }

      const healAmt = Math.floor(b.en.mHp * 0.3);
      b.en.hp = Math.min(b.en.mHp, b.en.hp + healAmt);
      sfx.heal();
      b.msg = `¡${b.npcName || 'Rival'} usó una poción! ${
        b.en.nm
      } +${healAmt}HP`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    // Turno enemigo con IA inteligente
    const mv = aiChooseMove(b.en, pCre(), b);
    mv.pp--;

    if (mv.pw === 0) {
      // Aplicar efectos de estado del enemigo
      if (mv.ef === 'heal') {
        const h = Math.floor(b.en.mHp * 0.35);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + h);
        sfx.heal();
        b.msg = `${b.en.nm}: ${mv.nm}! +${h}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
      if (mv.ef === 'healAll') {
        const h = Math.floor(b.en.mHp * 0.35);
        b.en.hp = Math.min(b.en.mHp, b.en.hp + h);
        sfx.heal();
        b.msg = `${b.en.nm}: ${mv.nm}! +${h}HP`;
        b.ph = 'msg';
        b.tm = 0;
        return;
      }
      if (mv.ef === 'atkUp2') {
        battleState.enemyStatMods.atk += 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK subió mucho!`;
      }
      if (mv.ef === 'spdUp' || mv.ef === 'spdUp2') {
        battleState.enemyStatMods.spd += mv.ef === 'spdUp2' ? 2 : 1;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡SPD subió!`;
      }
      if (mv.ef === 'defUp2') {
        battleState.enemyStatMods.def += 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡DEF subió mucho!`;
      }
      if (mv.ef === 'atkSpdUp') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.spd++;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y SPD subieron!`;
      }
      if (mv.ef === 'atkDefUp') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.def++;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y DEF subieron!`;
      }
      if (mv.ef === 'atkSpdUpDefDn') {
        battleState.enemyStatMods.atk++;
        battleState.enemyStatMods.spd++;
        battleState.enemyStatMods.def--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡ATK y SPD suben, DEF baja!`;
      }
      if (mv.ef === 'protect') {
        battleState.enemyProtect = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Se protege!`;
      }
      if (mv.ef === 'shield1') {
        battleState.enemyShield = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Escama protectora!`;
      }
      if (mv.ef === 'sunUp') {
        battleState.weather = 'sun';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Sol intenso!`;
      }
      if (mv.ef === 'rainUp') {
        battleState.weather = 'rain';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Lluvia!`;
      }
      if (mv.ef === 'fairyUp') {
        battleState.weather = 'fairy';
        battleState.weatherTurns = 5;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Campo mágico!`;
      }
      if (mv.ef === 'healField3') {
        battleState.weather = 'flower';
        battleState.weatherTurns = 3;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Campo de flores!`;
      }
      if (mv.ef === 'leech4') {
        battleState.playerStatus = 'leech';
        battleState.playerStatusTurns = 4;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Drenadoras en ti!`;
      }
      if (mv.ef === 'sleep2') {
        battleState.playerStatus = 'sleep';
        battleState.playerStatusTurns = 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te dormiste!`;
      }
      if (mv.ef === 'accDn') {
        battleState.playerStatMods.spd--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu precisión bajó!`;
      }
      if (mv.ef === 'atkDn') {
        battleState.playerStatMods.atk--;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu ATK bajó!`;
      }
      if (mv.ef === 'atkDn2') {
        battleState.playerStatMods.atk -= 2;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Tu ATK bajó mucho!`;
      }
      if (mv.ef === 'wishHeal') {
        battleState.wishHealNext = true;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Deseo activado!`;
      }
      if (mv.ef === 'curse') {
        const cost = Math.floor(b.en.mHp * 0.5);
        b.en.hp = Math.max(1, b.en.hp - cost);
        battleState.playerStatus = 'curse';
        battleState.playerStatusTurns = 99;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Te maldijo!`;
      }
      if (mv.ef === 'clearStatus') {
        battleState.enemyStatus = null;
        battleState.enemyStatusTurns = 0;
        b.msg = `${b.en.nm}: ${mv.nm}! ¡Estados limpiados!`;
      }
      if (!b.msg || b.msg === `${b.en.nm}: ${mv.nm}!`)
        b.msg = `${b.en.nm}: ${mv.nm}!`;
      sfx.atk();
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    if (battleState.playerProtect) {
      battleState.playerProtect = false;
      b.msg = `¡${c.nm} se protegió del ataque!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }

    const result = cDmg(b.en, c, mv, false);
    if (result.missed) {
      b.msg = `¡${b.en.nm}: ${mv.nm} falló!`;
      b.ph = 'msg';
      b.tm = 0;
      return;
    }
    let dm = result.dmg;
    c.hp = Math.max(0, c.hp - dm);
    b.ps = 10;
    battleState.lastDmgToPlayer = dm;

    let em = '';
    if (result.crit) em += ' ¡CRÍTICO!';
    if (result.eff > 1) {
      em += ' ¡Súper efectivo!';
      sfx.sup();
    } else if (result.eff < 1) {
      em += ' Poco efectivo...';
      sfx.nef();
    } else sfx.hit();
    b.msg = `${b.en.nm}: ${mv.nm}! -${dm}HP${em}`;
    for (let i = 0; i < 5; i++)
      aP(120 + Math.random() * 40, 230 + Math.random() * 40, tCol(mv.tp));
    b.ph = 'msg';
    b.tm = 0;
  } else if (act.a === 'cE') {
    if (b.en.hp <= 0) b.mq = [];
    if (b.mq.length > 0) procAct(b.mq.shift());
    else {
      if (b.en.hp <= 0) handleWin();
      else b.ph = 'act';
    }
  } else if (act.a === 'cP') {
    if (c.hp <= 0) {
      b.mq = [];
      handleFaint();
    } else if (b.mq.length > 0) procAct(b.mq.shift());
  } else if (act.a === 'end') {
    if (b.npcData) markNPCDefeated(b.npcData);
    if (b.npcData?.isPunk && postGame) {
      oloDefeated = true;
      resetRebattles();
    }
    resetBattleState();
    G.scr = 'world';
  }
} // ============================================================
// BLOQUE 18: VICTORIA Y DERROTA
// ============================================================

// === VICTORIA ===
function handleWin() {
  const b = G.bs;

  // === DAR EXP INMEDIATAMENTE AL DERROTAR CRIATURA ===
  const exp = b.noExp ? 0 : Math.floor((b.en.lv * 15 + 10) * b.expMult);
  const goldGain = Math.floor(10 + b.en.lv * 3);

  if (exp > 0 && !b.isMerch) {
    G.gold += goldGain;
    G.tExp += exp;
    sfx.win();
    b.msg = `¡${b.en.nm} derrotado! +${exp}EXP +${goldGain}G`;
    b.mq = [];

    b.fought.forEach((idx) => {
      if (idx < G.party.length && G.party[idx].hp > 0) {
        const result = G.party[idx].addEx(exp);
        if (result.leveled) {
          b.mq.push({
            a: 'lvl',
            m: `¡${G.party[idx].nm} subió a Lv.${G.party[idx].lv}!`,
          });

          // Check evolución
          const evoId = checkEvolution(G.party[idx]);
          if (evoId) {
            b.mq.push({ a: 'evo', creIdx: idx, evoId: evoId });
          }

          // Check nuevo ataque
          if (G.party[idx].lv % 3 === 0) {
            const learn = checkLearnMove(G.party[idx]);
            if (learn) {
              b.mq.push({
                a: 'learn',
                creIdx: idx,
                move: learn,
                m: `¡${G.party[idx].nm} puede aprender ${learn.nm}!`,
              });
            }
          }
        }
      }
    });
  }

  // === BOSS NAVARRETE ===
  if (b.isBoss) {
    G.bossIdx++;
    if (G.bossDialogs < 5 && G.bossDialogs < bossDialogues.length) {
      const dlg = bossDialogues[G.bossDialogs];
      G.bossDialogs++;
      b.mq.push({ a: 'bMsg', m: dlg[0] });
      dlg.slice(1).forEach((d) => b.mq.push({ a: 'bMsg', m: d }));

      if (G.bossIdx < G.bossTeam.length) {
        b.mq.push({ a: 'bNext' });
      } else {
        b.mq.push(
          { a: 'bMsg', m: '¡¡MAGNÍFICO!!' },
          { a: 'bMsg', m: '¡¡Me devolviste la emoción!!' },
          { a: 'bMsg', m: '¡¡GRACIAS, guerrero!!' },
          { a: 'end' }
        );
        G.bossOk = true;
        activatePostGame();
      }
      b.ph = 'win';
      b.tm = 0;
      return;
    }
    if (G.bossIdx < G.bossTeam.length) {
      b.en = G.bossTeam[G.bossIdx];
      b.mq.push({ a: 'bNext' });
      b.ph = 'win';
      b.tm = 0;
      return;
    }
    G.bossOk = true;
    activatePostGame();
    b.mq.push({ a: 'end' });
    b.ph = 'win';
    b.tm = 0;
    return;
  }

  // === EQUIPO NPC (siguiente criatura) ===
  if (b.npcTeam) {
    const ni = b.npcIdx + 1;
    if (ni < b.npcTeam.length) {
      b.npcIdx = ni;
      b.en = b.npcTeam[ni];
      b.mq.push({ a: 'npcNext', m: `¡${b.npcName} envía a ${b.en.nm}!` });
      b.ph = 'win';
      b.tm = 0;
      return;
    }
  }

  // === MERCADER ===
  if (b.isMerch) {
    G.mFriend++;
    sfx.win();
    b.msg = `¡Amistad con David-O +1! (${G.mFriend})`;
    b.mq = [{ a: 'end' }];
    b.ph = 'win';
    b.tm = 0;
    return;
  }

  // === VICTORIA FINAL ===
  G.bWon++;
  // Entregar diploma automaticamente al vencer a un lider de gimnasio
  if (b.npcData && b.npcData.isLeader && !hasDiploma(b.npcData.leaderKey)) {
    giveDiploma(b.npcData.leaderKey);
    const LVM = LEADER_MISSIONS[b.npcData.leaderKey];
    (LVM.dlgVictory || []).forEach((ln) => b.mq.push({ a: 'npcMsg', m: ln }));
  }
  if (!exp) {
    b.msg = '¡Ganaste!';
  }
  b.mq.push({ a: 'end' });
  b.ph = 'win';
  b.tm = 0;
}

// === DERROTA ===
function handleFaint() {
  const b = G.bs;

  // Buscar otra criatura viva
  const ai = G.party.findIndex((c, i) => c.hp > 0 && i !== b.pi);

  if (ai !== -1) {
    // Cambio automático
    b.pi = ai;
    pCre().fought = true;
    if (!b.fought.includes(b.pi)) b.fought.push(b.pi);
    b.msg = `¡${pCre().nm} entra en batalla!`;
    b.ph = 'msg';
    b.tm = 0;
    b.mq = [];
  } else {
    // Todas las criaturas cayeron
    sfx.def();
    b.msg = '¡Todas tus criaturas cayeron!';
    b.ph = 'defeat';
    b.tm = 0;
  }
}

// === ACTIVAR POST-GAME ===
function activatePostGame() {
  if (postGame) return;
  postGame = true;

  // Generar torre
  genTower();

  // Notificaciones
  aN('¡El reino ha cambiado!');
  setTimeout(() => aN('Nuevos diálogos disponibles.'), 2000);
  setTimeout(() => aN('Busca a Edison en Villa Guión.'), 4000);
}
// ============================================================
// BLOQUE 19A: DIBUJAR MAPA DEL MUNDO
// ============================================================

function drawMap() {
  if (G.curMap === 'world') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(WC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(WR, sr + 17);
    for (let r = sr; r < er; r++) for (let c = sc; c < ec; c++) dTileW(c, r);

    // Carteles de ruta
    ROUTE_SIGNS.forEach((sg) => {
      const sx = sg.x * T - cam.x,
        sy = sg.y * T - cam.y;
      if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
        dRouteSign(sx, sy, fr);
        if (nearRouteSign(sg)) {
          cx.fillStyle = '#ffd700';
          cx.font = '6px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText('LEER', sx + 16, sy - 8 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    });

    // Bloqueo de rutas: árboles cierran los bordes y un Proa bloquea el camino.
    ROUTE_GATES.forEach((g) => {
      if (canPassRoute(g.from)) return;
      for (let dc = -Math.floor(g.w / 2); dc <= Math.floor(g.w / 2); dc++) {
        const sx = (g.x + dc) * T - cam.x;
        const sy = g.y * T - cam.y;
        if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
          if (dc === 0) dRouteProa(sx, sy - 8, fr);
          else dRouteTree(sx, sy, fr);
        }
      }
    });

    // NPCs del mundo
    npcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680 && sy > -40 && sy < 520) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.fillText('⬇', sx + 16, sy - 10 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    });

    // Edison post-game
    if (postGame) {
      const ed = edisonNPC;
      const esx = ed.x * T - cam.x,
        esy = ed.y * T - cam.y;
      if (esx > -40 && esx < 680 && esy > -40 && esy < 520) {
        dNPC(esx, esy - 8, ed.tp, fr);
        if (nearNPC(ed)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(ed.nm, esx + 16, esy - 18);
          cx.fillText('⬇', esx + 16, esy - 10 + Math.sin(fr * 0.15) * 2);
          cx.textAlign = 'left';
        }
      }
    }
  } else if (G.curMap.startsWith('cave')) {
    const map = G.curMap === 'cave1' ? cave1 : cave2;
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(CC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(CR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, map);

    // NPCs cueva
    caveNpcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.textAlign = 'left';
        }
      }
    });

    // Nombre de cueva
    dBox(230, 4, 180, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(
      G.curMap === 'cave1' ? 'Cueva Volcánica' : 'Cueva Cristalina',
      320,
      16
    );
    cx.textAlign = 'left';
  } else if (G.curMap === 'castle') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(KC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(KR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, castMap);

    // NPCs castillo
    castNpcs.forEach((n) => {
      if (!npcVisible(n)) return;
      const sx = n.x * T - cam.x,
        sy = n.y * T - cam.y;
      if (sx > -40 && sx < 680) {
        dNPC(sx, sy - 8, n.tp, fr);
        if (nearNPC(n)) {
          cx.fillStyle = '#ffd700';
          cx.font = '7px "Press Start 2P"';
          cx.textAlign = 'center';
          cx.fillText(n.nm, sx + 16, sy - 18);
          cx.textAlign = 'left';
        }
      }
    });

    dBox(250, 4, 140, 18);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Castillo Real', 320, 16);
    cx.textAlign = 'left';
  } else if (G.curMap === 'tower') {
    const sc = Math.max(0, Math.floor(cam.x / T) - 1),
      ec = Math.min(TWC, sc + 22);
    const sr = Math.max(0, Math.floor(cam.y / T) - 1),
      er = Math.min(TWR, sr + 17);
    for (let r = sr; r < er; r++)
      for (let c = sc; c < ec; c++) dTileC(c, r, towerMap);

    // Efecto mágico de la torre
    cx.globalAlpha = 0.03;
    cx.fillStyle = '#F8E8A0';
    cx.fillRect(0, 0, 640, 480);
    cx.globalAlpha = 1;

    // Estrellas flotantes
    for (let i = 0; i < 8; i++) {
      cx.globalAlpha = Math.sin(fr * 0.03 + i) * 0.3 + 0.4;
      cx.fillStyle = '#F8E868';
      cx.fillRect(
        (i * 97 + fr * 0.5) % 640,
        (i * 63 + Math.sin(fr * 0.02 + i) * 20) % 480,
        2,
        2
      );
    }
    cx.globalAlpha = 1;

    // Primera criatura del equipo siguiendo al jugador
    if (G.party.length > 0) {
      const fpos = getFollowerPos();
      if (fpos) {
        const fx = fpos.x * T - cam.x,
          fy = fpos.y * T - cam.y;
        dCre(fx, fy - 8, G.party[0].id, G.party[0].lv, fr);
      }
    }

    dBox(220, 4, 200, 18);
    cx.fillStyle = '#D860A8';
    cx.font = '7px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText('Torre Presupuesto Aprobado', 320, 16);
    cx.textAlign = 'left';
  }

  // === JUGADOR ===
  const ppx = G.pl.x * T - cam.x,
    ppy = G.pl.y * T - cam.y;
  dPlayerGBA(ppx, ppy - 8, G.pl.d, G.pl.f);

  // === HUD SUPERIOR ===
  // Info de criatura líder
  dBox(4, 4, 185, 46);
  if (G.party.length > 0) {
    const c = G.party[0];
    cx.fillStyle = tCol(c.tp);
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${tEmo(c.tp)} ${c.nm} Lv.${c.lv}`, 14, 20);
    dHP(14, 25, 100, 6, c.hp, c.mHp);
    dEXP(14, 35, 100, 4, c.ex, c.exTo);
  }

  // Ubicación actual (reemplaza el letrero grande de objetos)
  const locHUD = getCurrentLocationHUD();
  dBox(490, 4, 146, 26);
  cx.fillStyle = '#ffd700';
  cx.font = '5px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.fillText(locHUD.kind, 563, 15);
  cx.fillStyle = '#fff';
  cx.font = locHUD.name.length > 15 ? '4px "Press Start 2P"' : '5px "Press Start 2P"';
  cx.fillText(locHUD.name, 563, 25);
  cx.textAlign = 'left';

  // Sprint
  if (G.pl.sprint) {
    cx.fillStyle = '#ffd700';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('🏃SPRINT', 556, 42);
  }

  // Post-game indicador
  if (postGame) {
    cx.fillStyle = '#D860A8';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('★POST-GAME★', 540, 55);
  }
  if (G.supervisor) {
    cx.fillStyle = '#ffd700';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('SUPERVISOR: Y salir', 500, postGame ? 67 : 55);
  }

  // Controles
  cx.fillStyle = 'rgba(0,0,0,.4)';
  cx.fillRect(4, 462, 320, 16);
  cx.fillStyle = '#666';
  cx.font = '5px "Press Start 2P"';
  cx.fillText('Flechas:Mover Z:Sprint SPACE:Acción X:Menú Y:Supervisor', 8, 473);

  // === PARTÍCULAS Y NOTIFICACIONES ===
  drawParticles();
  drawNotifications();
}
// ============================================================
// BLOQUE 19B: DIBUJAR BATALLA
// ============================================================

function dBattle() {
  const b = G.bs,
    c = pCre(),
    f = b.af;

  // === INTRO NPC ===
  if (b.ph === 'npcIntro') {
    dBattleIntroBG();

    // Sprite grande del entrenador
    if (b.npcSprite) {
      dTrainerBig(288, 120, b.npcSprite, f);
    }

    // Nombre
    cx.fillStyle = '#ffd700';
    cx.font = '12px "Press Start 2P"';
    cx.textAlign = 'center';
    cx.fillText(b.npcName || '???', 320, 100);
    cx.textAlign = 'left';

    // Diálogo en caja blanca
    const curText = b.npcIntro[b.introLine].substring(0, b.introCi);
    const lines = wrapText(curText, 42);
    const boxH = Math.max(44, 16 + lines.length * 15 + 12);

    dDialogBox(20, 480 - boxH - 10, 600, boxH, b.npcName);
    cx.fillStyle = '#000';
    cx.font = '9px "Press Start 2P"';
    lines.forEach((ln, i) => {
      cx.fillText(ln, 36, 480 - boxH + 10 + i * 15);
    });

    if (b.introFull) {
      cx.fillStyle = '#000';
      cx.font = '10px "Press Start 2P"';
      cx.fillText('▼', 590, 466 + Math.sin(f * 0.2) * 2);
    }
    return;
  }

  // === BATALLA NORMAL ===
  dBattleBG();

  // Shake de sprites
  const esx = b.es > 0 ? Math.sin(b.es * 2) * 4 : 0;
  const psx = b.ps > 0 ? Math.sin(b.ps * 2) * 4 : 0;

  // Criaturas
  // Durante la captura el enemigo se dibuja dentro de la animación para que
  // parezca entrar al Cristal Vínculo, no quedarse duplicado en pantalla.
  if (b.en.hp > 0 && b.ph !== 'captureAnim') dCre(385 + esx, 108, b.en.id, b.en.lv, f);
  if (c.hp > 0) dCre(105 + psx, 238, c.id, c.lv, f);

  // Panel enemigo
  dBattlePanel(8, 8, 250, 58, true);
  cx.fillStyle = tCol(b.en.tp);
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${tEmo(b.en.tp)} ${b.en.nm}`, 20, 26);
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Lv.${b.en.lv}`, 200, 26);
  cx.fillStyle = '#aaa';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(tNam(b.en.tp), 20, 38);
  dHP(20, 42, 168, 7, b.en.hp, b.en.mHp);
  // Indicador de criatura ya capturada
  if (
    G.party.some((c) => c.id === b.en.id) ||
    proa.some((c) => c.id === b.en.id)
  ) {
    cx.fillStyle = '#30D848';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('💎', 240, 54);
  }

  // Panel jugador
  dBattlePanel(375, 235, 256, 68, false);
  cx.fillStyle = tCol(c.tp);
  cx.font = '7px "Press Start 2P"';
  cx.fillText(`${tEmo(c.tp)} ${c.nm}`, 390, 253);
  cx.fillStyle = '#ffd700';
  cx.font = '6px "Press Start 2P"';
  cx.fillText(`Lv.${c.lv}`, 580, 253);
  cx.fillStyle = '#aaa';
  cx.font = '5px "Press Start 2P"';
  cx.fillText(tNam(c.tp), 390, 265);
  dHP(390, 270, 140, 7, c.hp, c.mHp);
  dEXP(390, 283, 140, 4, c.ex, c.exTo);

  // === PANEL INFERIOR SEGÚN FASE ===

  if (b.ph === 'captureAnim') {
    const cap = b.cap || { tm: b.tm, shakes: 0, chance: 0, success: false };
    const t = b.tm;
    const totalCapTime = 48 + (cap.shakes || 0) * 28 + 28;
    const breaking = !cap.success && t > totalCapTime - 24;
    let cx0 = 424;
    let cy0 = 137;
    if (t < 28) {
      const k = t / 28;
      cx0 = 120 + (424 - 120) * k;
      cy0 = 250 + (137 - 250) * k - Math.sin(k * Math.PI) * 90;
    } else {
      const st = t - 28;
      const shakeIndex = Math.floor(st / 28);
      if (shakeIndex < cap.shakes) cx0 += Math.sin(st * 0.65) * 8;
    }

    // La criatura entra al cristal: se reduce y se absorbe hacia el centro.
    if (t < 28) {
      dCre(385 + esx, 108, b.en.id, b.en.lv, f);
    } else if (t < 62) {
      const k = Math.min(1, (t - 28) / 34);
      const ex = 401 + (cx0 - 401) * k;
      const ey = 132 + (cy0 - 132) * k;
      const sc = Math.max(0.08, 1 - k * 0.92);
      cx.save();
      cx.globalAlpha = 1 - k * 0.75;
      cx.translate(ex, ey);
      cx.scale(sc, sc);
      dCre(-16, -24, b.en.id, b.en.lv, f);
      cx.restore();
      // rayos cuadrados de absorción
      cx.globalAlpha = 0.35 + Math.sin(fr * 0.4) * 0.15;
      cx.fillStyle = '#D0A0F8';
      px(cx0 - 24, cy0 - 2, 18, 4, '#D0A0F8');
      px(cx0 + 8, cy0 - 2, 18, 4, '#D0A0F8');
      px(cx0 - 2, cy0 - 24, 4, 18, '#D0A0F8');
      px(cx0 - 2, cy0 + 8, 4, 18, '#D0A0F8');
      cx.globalAlpha = 1;
    } else if (!cap.success && breaking) {
      // Si falla, la criatura vuelve a aparecer cuando el cristal se rompe.
      dCre(385 + Math.sin(fr * 0.5) * 3, 108, b.en.id, b.en.lv, f);
    }

    // Cristal Vínculo animado / roto
    cx.save();
    cx.translate(cx0, cy0);
    if (breaking) {
      // Fragmentos pixelados del cristal roto
      const br = t - (totalCapTime - 24);
      const pieces = [
        [-14 - br * .5, -8 - br * .25, 6, 5], [10 + br * .45, -10 - br * .2, 5, 6],
        [-10 - br * .35, 9 + br * .25, 5, 5], [9 + br * .3, 8 + br * .3, 6, 4],
        [-2, -2 - br * .45, 4, 4], [2, 4 + br * .35, 4, 4],
      ];
      cx.globalAlpha = Math.max(0.15, 1 - br / 28);
      pieces.forEach((pc, i) => {
        px(pc[0], pc[1], pc[2], pc[3], i % 2 ? '#8838E0' : '#B868F8');
        px(pc[0] + 1, pc[1] + 1, Math.max(1, pc[2] - 2), 1, '#F8E8FF');
      });
      cx.globalAlpha = 1;
    } else {
      cx.globalAlpha = 0.25 + Math.sin(fr * 0.25) * 0.08;
      cx.fillStyle = '#B868F8';
      pixelGlow(0, 0, 22, 18);
      cx.globalAlpha = 1;
      px(-8, -13, 16, 26, '#6020B0');
      px(-6, -11, 12, 22, '#8838E0');
      px(-3, -8, 6, 16, '#B868F8');
      px(-1, -5, 2, 8, '#F8E8FF');
      px(-10, -2, 20, 4, '#D0A0F8');
    }
    cx.restore();

    dDialogBox(10, 390, 620, 78);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    const shakeTxt = breaking
      ? '¡El cristal se rompe!'
      : t < 28
      ? 'El cristal vuela...'
      : `Sacudidas: ${Math.min(cap.shakes, Math.max(0, Math.floor((t - 28) / 28)))}/3`;
    cx.fillText('¡Nuevo sistema de captura!', 28, 414);
    cx.fillText('Cristal Vínculo: ' + shakeTxt, 28, 434);
    cx.fillStyle = '#606060';
    cx.font = '6px "Press Start 2P"';
    cx.fillText(`Probabilidad estimada: ${Math.round((cap.chance || 0) * 100)}%`, 28, 454);
  } else if (b.ph === 'act') {
    // Menú de acciones
    dBox(10, 370, 620, 100);
    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText('¿Qué harás?', 24, 388);

    const acts = [
      '⚔️Luchar',
      '🧪Poción',
      '❤️Revivir',
      '🔄Cambiar',
      '💎Capturar',
      '🏃Huir',
    ];
    acts.forEach((a, i) => {
      const ax = 25 + (i % 3) * 200,
        ay = 402 + Math.floor(i / 3) * 22;
      cx.fillStyle = b.ms === i ? '#ffd700' : '#aaa';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(`${b.ms === i ? '▶ ' : '  '}${a}`, ax, ay);
    });

    cx.fillStyle = '#555';
    cx.font = '5px "Press Start 2P"';
    cx.fillText(`🧪${G.pot} ❤${G.rev} 💎${G.crv}`, 25, 456);
    if (b.ms === 4 && !(b.isMerch || b.isBoss || b.npcTeam)) {
      const capChance = calcCaptureChance(b.en);
      cx.fillStyle = capChance >= 0.65 ? '#30D848' : capChance >= 0.35 ? '#C89000' : '#D02020';
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`Captura mejorada: ${Math.round(capChance * 100)}%`, 300, 456);
    }
  } else if (b.ph === 'move') {
    // Selección de movimientos: botones 2x2 con borde dinámico por tipo
    dBox(10, 356, 620, 114, 'Movimientos');
    c.mv.forEach((m, i) => {
      const mx = 24 + (i % 2) * 296,
        my = 378 + Math.floor(i / 2) * 43;
      dMoveButton(mx, my, 280, 40, m, b.mvs === i);
    });
    cx.fillStyle = '#777';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('X:Volver', 28, 464);
  } else if (b.ph === 'switch') {
    // Cambiar criatura
    dBox(10, 340, 620, 130, 'Cambiar criatura');
    G.party.forEach((cr, i) => {
      const sy = 362 + i * 16;
      const sel = b.ss === i;
      const active = i === b.pi;
      const alive = cr.hp > 0;

      cx.fillStyle = sel ? '#ffd700' : alive ? '#aaa' : '#555';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(
        `${sel ? '▶ ' : '  '}${tEmo(cr.tp)} ${cr.nm} Lv.${cr.lv} HP:${cr.hp}/${
          cr.mHp
        }${active ? ' ★' : ''}${!alive ? ' ✖' : ''}`,
        30,
        sy
      );
    });
    cx.fillStyle = '#555';
    cx.font = '6px "Press Start 2P"';
    cx.fillText('X:Cancelar', 30, 462);
  } else if (b.ph === 'learnMove') {
    // === PANTALLA APRENDER ATAQUE ===
    const ld = b.learnData;
    const cre = G.party[ld.creIdx];

    dBox(10, 300, 620, 170, 'Nuevo ataque');

    cx.fillStyle = '#ffd700';
    cx.font = '8px "Press Start 2P"';
    cx.fillText(`${cre.nm} quiere aprender:`, 24, 320);

    cx.fillStyle = '#fff';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`★ ${ld.move.nm}`, 24, 338);
    cx.fillStyle = tCol(ld.move.tp);
    cx.font = '6px "Press Start 2P"';
    cx.fillText(
      `${tNam(ld.move.tp)} PW:${ld.move.pw} PP:${ld.move.mp}`,
      140,
      338
    );
    if (ld.move.ef) {
      cx.fillStyle = '#aaa';
      cx.fillText(`[${ld.move.ef}]`, 350, 338);
    }

    cx.fillStyle = '#ffd700';
    cx.font = '7px "Press Start 2P"';
    cx.fillText('¿Cuál olvidar?', 24, 358);

    cre.mv.forEach((m, i) => {
      const my = 374 + i * 18;
      const sel = b.learnSel === i;
      cx.fillStyle = sel ? '#ffd700' : '#aaa';
      cx.font = '7px "Press Start 2P"';
      cx.fillText(`${sel ? '▶ ' : '  '}${m.nm}`, 30, my);
      cx.fillStyle = tCol(m.tp);
      cx.font = '6px "Press Start 2P"';
      cx.fillText(`${tNam(m.tp)} PW:${m.pw} PP:${m.pp}/${m.mp}`, 200, my);
      if (m.ef) {
        cx.fillStyle = '#888';
        cx.fillText(`[${m.ef}]`, 420, my);
      }
    });

    const noSel = b.learnSel === 4;
    cx.fillStyle = noSel ? '#ffd700' : '#888';
    cx.font = '7px "Press Start 2P"';
    cx.fillText(`${noSel ? '▶ ' : '  '}No aprender`, 30, 374 + 4 * 18);

    cx.fillStyle = '#555';
    cx.font = '5px "Press Start 2P"';
    cx.fillText('SPACE:Confirmar  X:Cancelar', 30, 460);
  } else if (b.ph === 'evolve') {
    // Fondo especial de evolución
    cx.fillStyle = '#0a0a2e';
    cx.fillRect(0, 0, 640, 480);

    const cre = G.party[b.evoData.creIdx];

    if (b.evoPhase === 0) {
      // Pregunta de evolución
      const glow = Math.sin(f * 0.1) * 0.3 + 0.7;
      cx.globalAlpha = glow;
      cx.fillStyle = '#F8E8A0';
      cx.fillRect(0, 0, 640, 480);
      cx.globalAlpha = 1;

      cx.fillStyle = '#0a0a2e';
      cx.fillRect(40, 40, 560, 400);

      // Sprite actual parpadeando
      cx.save();
      cx.translate(240, 140);
      cx.scale(3, 3);
      if (Math.sin(f * 0.3) > 0) dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      dBoxMenu(120, 340, 400, 100, '¡Evolución!');
      cx.fillStyle = '#ffd700';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`¡${b.evoData.oldName} quiere evolucionar!`, 140, 370);
      cx.fillStyle = '#fff';
      cx.font = '8px "Press Start 2P"';
      cx.fillText('SPACE para continuar...', 140, 400);
    } else if (b.evoPhase === 1) {
      // Selección sí/no
      // Brillo de fondo
      for (let i = 0; i < 20; i++) {
        cx.globalAlpha = Math.sin(f * 0.05 + i) * 0.3 + 0.3;
        cx.fillStyle = '#F8E868';
        cx.fillRect((i * 73 + f * 0.5) % 640, (i * 47 + f * 0.3) % 480, 2, 2);
      }
      cx.globalAlpha = 1;

      // Sprite
      cx.save();
      cx.translate(240, 120);
      cx.scale(3, 3);
      dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      // Nombre de la evolución
      const evoData = CDB[b.evoData.evoId];

      dBoxMenu(100, 300, 440, 140, '¿Evolucionar?');
      cx.fillStyle = '#ffd700';
      cx.font = '8px "Press Start 2P"';
      cx.fillText(
        `${b.evoData.oldName} → ${evoData ? evoData.nm : '???'}`,
        120,
        330
      );

      cx.fillStyle = b.evoSel === 0 ? '#30D848' : '#888';
      cx.font = '9px "Press Start 2P"';
      cx.fillText(`${b.evoSel === 0 ? '▶ ' : '  '}¡Sí, evolucionar!`, 140, 370);

      cx.fillStyle = b.evoSel === 1 ? '#E83030' : '#888';
      cx.fillText(`${b.evoSel === 1 ? '▶ ' : '  '}No, cancelar`, 140, 395);
    } else if (b.evoPhase === 2) {
      // Resultado - nueva criatura
      // Destellos de celebración
      for (let i = 0; i < 30; i++) {
        cx.globalAlpha = Math.sin(f * 0.08 + i) * 0.5 + 0.5;
        cx.fillStyle = ['#F8E868', '#F088A0', '#88D8F8', '#80F880'][i % 4];
        cx.fillRect((i * 53 + f * 2) % 640, (i * 37 + f * 1.5) % 480, 3, 3);
      }
      cx.globalAlpha = 1;

      // Sprite nuevo grande
      cx.save();
      cx.translate(240, 100);
      cx.scale(3, 3);
      dCre(0, 0, cre.id, cre.lv, f);
      cx.restore();

      // Mensaje
      dBoxMenu(80, 340, 480, 100, '¡Evolución completa!');
      cx.fillStyle = '#ffd700';
      cx.font = '10px "Press Start 2P"';
      cx.fillText(`¡${cre.nm} ha nacido!`, 120, 375);
      cx.fillStyle = '#aaa';
      cx.font = '7px "Press Start 2P"';
      cx.fillText('SPACE para continuar...', 120, 405);
    }
  } else {
    // Mensaje de batalla (adaptativo)
    const msgLines = wrapText(b.msg, 45);
    const boxH = Math.max(44, 16 + msgLines.length * 15 + 12);
    const boxY = 480 - boxH - 10;

    dDialogBox(10, boxY, 620, boxH);
    cx.fillStyle = '#000';
    cx.font = '8px "Press Start 2P"';
    msgLines.forEach((l, i) => {
      cx.fillText(l, 28, boxY + 18 + i * 15);
    });

    if (b.tm > 10) {
      cx.fillStyle = '#000';
      cx.font = '10px "Press Start 2P"';
      cx.fillText('▼', 592, boxY + boxH - 10 + Math.sin(f * 0.2) * 2);
    }
  }

  // Partículas
  drawParticles();
}
// ============================================================
// BLOQUE 20: LÓGICA POST-GAME
// ============================================================

// Nicole crucificada - modificar sprite según estado
function isNicoleCrucified() {
  return postGame;
}

// Hernán sin barba post-game
function isHernanShaved() {
  return postGame;
}

// Gabriela con armadura post-game
function isGabrielaArmored() {
  return postGame;
}

// Obtener NPCs que pueden combatir solitarios post-game
function getSoloFighters() {
  return [
    npcs.find((n) => n.flag === 'metHer'),
    npcs.find((n) => n.flag === 'metDaniel'),
    npcs.find((n) => n.flag === 'metNic'),
  ].filter((n) => n);
}

// ============================================================
// BLOQUE 23: GUARDADO/CARGA localStorage
// ============================================================

function saveGame() {
  try {
    const save = {
      // Posición
      plx: G.pl.x,
      ply: G.pl.y,
      curMap: G.curMap,
      plD: G.pl.d,

      // Equipo
      party: G.party.map((c) => c.toJSON()),
      proa: proa.map((c) => c.toJSON()),

      // Inventario
      gold: G.gold,
      pot: G.pot,
      rev: G.rev,
      crv: G.crv,

      // Progreso
      talkedTo: G.talkedTo,
      bossOk: G.bossOk,
      allTalked: G.allTalked,
      allCaught: G.allCaught,
      bWon: G.bWon,
      tExp: G.tExp,
      mFriend: G.mFriend,
      bossDialogs: G.bossDialogs,
      diplomas,

      // Post-game
      postGame,
      towerOpen,
      oloDefeated,
      pairBattles,
      npcDefeats,
      towerKey,
      captureCount,
      lastHealPos,

      // Mapas (semilla no, se regeneran pero guardamos posición)
      prevPos: G.prevPos,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    aN('¡Partida guardada!');
    sfx.sel();
  } catch (e) {
    aN('Error al guardar...');
    console.error('Save error:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const save = JSON.parse(raw);

    // Posición
    G.pl.x = save.plx || 20;
    G.pl.y = save.ply || 32;
    G.pl.d = save.plD || 0;
    G.curMap = save.curMap || 'world';

    // Equipo
    G.party = (save.party || []).map((j) => Cre.fromJSON(j));
    proa = (save.proa || []).map((j) => Cre.fromJSON(j));

    // Inventario
    G.gold = save.gold || 200;
    G.pot = save.pot || 5;
    G.rev = save.rev || 2;
    G.crv = save.crv || 3;

    // Progreso
    G.talkedTo = save.talkedTo || {};
    G.bossOk = save.bossOk || false;
    G.allTalked = save.allTalked || false;
    G.allCaught = save.allCaught || false;
    G.bWon = save.bWon || 0;
    G.tExp = save.tExp || 0;
    G.mFriend = save.mFriend || 0;
    G.bossDialogs = save.bossDialogs || 0;
    diplomas = save.diplomas || {
      tamara: !!save.npcDefeats?.metTamara,
      luchito: !!save.npcDefeats?.metLuchito,
      andrea: !!save.npcDefeats?.metAndrea,
      dan: !!save.npcDefeats?.metDan,
    };

    // Post-game
    postGame = save.postGame || false;
    towerOpen = save.towerOpen || false;
    oloDefeated = save.oloDefeated || false;
    pairBattles = save.pairBattles || false;
    npcDefeats = save.npcDefeats || {};
    towerKey = save.towerKey || {
      edison: false,
      roberto: false,
      gabriela: false,
      ximena: false,
    };
    captureCount = save.captureCount || {};
    lastHealPos = save.lastHealPos || { x: 20, y: 32, map: 'world' };

    G.prevPos = save.prevPos || null;

    // Regenerar torre si post-game
    if (postGame) genTower();

    // Verificaciones
    checkAllTalked();
    checkAllCaught();

    return true;
  } catch (e) {
    console.error('Load error:', e);
    return false;
  }
}

// ============================================================
// BLOQUE 24: MÚSICA SIMPLE CON OSCILADORES
// ============================================================

let musicInterval = null;
let currentSong = null;

const SONGS = {
  world: [
    { f: 262, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 392, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 294, d: 0.2 },
    { f: 349, d: 0.2 },
    { f: 262, d: 0.4 },
    { f: 262, d: 0.2 },
    { f: 392, d: 0.2 },
    { f: 349, d: 0.2 },
    { f: 330, d: 0.2 },
    { f: 294, d: 0.2 },
    { f: 262, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  battle: [
    { f: 330, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 440, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 330, d: 0.15 },
    { f: 294, d: 0.15 },
    { f: 330, d: 0.3 },
    { f: 440, d: 0.15 },
    { f: 523, d: 0.15 },
    { f: 440, d: 0.15 },
    { f: 392, d: 0.15 },
    { f: 330, d: 0.15 },
    { f: 294, d: 0.3 },
    { f: 0, d: 0.3 },
  ],
  cave: [
    { f: 196, d: 0.3 },
    { f: 220, d: 0.3 },
    { f: 196, d: 0.3 },
    { f: 165, d: 0.3 },
    { f: 196, d: 0.3 },
    { f: 220, d: 0.2 },
    { f: 262, d: 0.2 },
    { f: 220, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  castle: [
    { f: 262, d: 0.3 },
    { f: 294, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 392, d: 0.3 },
    { f: 349, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 294, d: 0.6 },
    { f: 0, d: 0.3 },
  ],
  tower: [
    { f: 523, d: 0.3 },
    { f: 659, d: 0.3 },
    { f: 784, d: 0.3 },
    { f: 659, d: 0.3 },
    { f: 523, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 523, d: 0.6 },
    { f: 659, d: 0.2 },
    { f: 784, d: 0.2 },
    { f: 880, d: 0.4 },
    { f: 0, d: 0.4 },
  ],
  title: [
    { f: 392, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 523, d: 0.3 },
    { f: 440, d: 0.3 },
    { f: 392, d: 0.3 },
    { f: 330, d: 0.3 },
    { f: 392, d: 0.6 },
    { f: 0, d: 0.6 },
  ],
};

function playMusic(songName) {
  if (currentSong === songName) return;
  stopMusic();
  currentSong = songName;
  const song = SONGS[songName];
  if (!song || !sfx.c) return;

  let noteIdx = 0;
  let noteTime = 0;

  musicInterval = setInterval(() => {
    if (!sfx.c || !sfx.on) return;
    noteTime -= 50;
    if (noteTime <= 0) {
      const note = song[noteIdx % song.length];
      if (note.f > 0) {
        sfx.n(note.f, note.d, 'triangle', 0.03);
      }
      noteTime = note.d * 1000;
      noteIdx++;
    }
  }, 50);
}

function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  currentSong = null;
}

function updateMusic() {
  if (!sfx.on) return;
  if (G.scr === 'title') playMusic('title');
  else if (G.scr === 'battle') playMusic('battle');
  else if (G.scr === 'world') {
    if (G.curMap === 'world') playMusic('world');
    else if (G.curMap.startsWith('cave')) playMusic('cave');
    else if (G.curMap === 'castle') playMusic('castle');
    else if (G.curMap === 'tower') playMusic('tower');
  }
}

// ============================================================
// BLOQUE 25: LOOP PRINCIPAL + INICIALIZACIÓN
// ============================================================

function toggleSupervisorMode() {
  G.supervisor = !G.supervisor;
  if (G.supervisor) {
    G.scr = 'world';
    G.ms = null;
    G.showMap = false;
    G.proaOpen = false;
    G.showMissions = false;
    G.showDex = false;
    aN('MODO SUPERVISOR: rutas libres, sin NPCs ni encuentros');
  } else {
    aN('Modo supervisor desactivado');
  }
  sfx.sel();
}

function update() {
  fr++;
  if (kp('y') && !['battle', 'dialog', 'starter', 'intro', 'confirmReset', 'vision'].includes(G.scr)) {
    toggleSupervisorMode();
  }
  uP();
  updateMusic();

  switch (G.scr) {
    case 'title':
      uTitle();
      break;
    case 'intro':
      uIntro();
      break;
    case 'starter':
      uStarter();
      break;
    case 'world':
      if (G.curMap === 'world') uWorld();
      else if (G.curMap.startsWith('cave')) uCave();
      else if (G.curMap === 'castle') uCastle();
      else if (G.curMap === 'tower') uTower();
      break;
    case 'battle':
      uBattle();
      break;
    case 'dialog':
      uDialog();
      break;
    case 'menu':
      uMenu();
      break;
    case 'shop':
      uShop();
      break;
    case 'edisonChoice':
      uEdisonChoice();
      break;
    case 'pairSelect':
      uPairSelect();
      break;
    case 'andreaQuiz':
      uAndreaQuiz();
      break;
    case 'danGossip':
      uDanGossip();
      break;
    case 'confirmReset':
      uConfirmReset();
      break;
    case 'vision':
      uVision();
      break;
  }
}

function draw() {
  cx.clearRect(0, 0, 640, 480);

  switch (G.scr) {
    case 'title':
      dTitle();
      break;
    case 'intro':
      dIntro();
      break;
    case 'starter':
      dStarter();
      break;
    case 'world':
      drawMap();
      break;
    case 'battle':
      dBattle();
      break;
    case 'dialog':
      dDialog();
      break;
    case 'menu':
      dMenu();
      break;
    case 'shop':
      dShop();
      break;
    case 'edisonChoice':
      dEdisonChoice();
      break;
    case 'pairSelect':
      dPairSelect();
      break;
    case 'andreaQuiz':
      dAndreaQuiz();
      break;
    case 'danGossip':
      dDanGossip();
      break;
    case 'vision':
      dVision();
      break;
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// === INICIALIZACIÓN ===
function init() {
  initBattleBackgroundAssets();

  // Generar mapas
  genWorld();
  genCave(cave1, CC, CR);
  addOloSecretChamber(cave1);
  genCave(cave2, CC, CR);
  genCastle();

  // No autocargar: el título ahora permite Continuar o Nueva partida.
  G.hasSave = hasSaveGame();
  G.titleSel = 0;

  // Iniciar loop
  loop();
}

// === RESPONSIVE ===
function resize() {
  const s = Math.min((innerWidth - 20) / 640, (innerHeight - 20) / 480, 2);
  cv.style.width = 640 * s + 'px';
  cv.style.height = 480 * s + 'px';
}
resize();
addEventListener('resize', resize);

// === ARRANCAR ===
init();
