'use strict';
// =====================================================================
//  DATOS: tipos, movimientos, especies, objetos y la clase Criatura
// =====================================================================

// ---------- TIPOS (tabla clásica, reducida a los 8 tipos del Reino) ----------
const TYPES = {
  normal: { n: 'Normal', c: '#a8a070' }, fire: { n: 'Fuego', c: '#e8603c' }, water: { n: 'Agua', c: '#4890e8' },
  plant: { n: 'Planta', c: '#58b040' }, fairy: { n: 'Hada', c: '#e070b0' }, steel: { n: 'Acero', c: '#8898b0' },
  fighting: { n: 'Lucha', c: '#c04830' }, dragon: { n: 'Dragón', c: '#7050d0' },
};
const CHART = {
  normal: { steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, plant: 2, steel: 2, dragon: 0.5 },
  water: { fire: 2, water: 0.5, plant: 0.5, dragon: 0.5 },
  plant: { fire: 0.5, water: 2, plant: 0.5, dragon: 0.5, steel: 0.5 },
  fighting: { normal: 2, steel: 2, fairy: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  fairy: { fire: 0.5, fighting: 2, dragon: 2, steel: 0.5 },
  steel: { fire: 0.5, water: 0.5, steel: 0.5, fairy: 2 },
};
const eff = (atk, def) => (CHART[atk] && CHART[atk][def] != null ? CHART[atk][def] : 1);

// ---------- MOVIMIENTOS ----------
// p: potencia, a: precisión (0 = nunca falla), pp, e: efecto
//   e.st: [estado, %]   e.me: [[stat, etapas]] (propio)   e.foe: [[stat, etapas], %]
//   e.drain: %   e.recoil: %   e.prio   e.crit (crítico alto)   e.heal: % (curación propia)
const MOVES = {
  // NORMAL
  placaje: { n: 'Placaje', t: 'normal', p: 40, a: 100, pp: 35, d: 'Un empujón con todo el cuerpo.' },
  aranazo: { n: 'Arañazo', t: 'normal', p: 40, a: 100, pp: 35, d: 'Araña con uñas afiladas.' },
  grunido: { n: 'Gruñido', t: 'normal', p: 0, a: 100, pp: 40, e: { foe: [['atk', -1], 100] }, d: 'Baja el ataque del rival.' },
  malicioso: { n: 'Malicioso', t: 'normal', p: 0, a: 100, pp: 30, e: { foe: [['def', -1], 100] }, d: 'Mirada que baja la defensa.' },
  flash: { n: 'Flash de Cámara', t: 'normal', p: 0, a: 100, pp: 20, e: { foe: [['acc', -1], 100] }, d: 'Un fogonazo: baja la precisión.' },
  rapido: { n: 'Ataque Rápido', t: 'normal', p: 40, a: 100, pp: 30, e: { prio: 1 }, d: 'Golpea siempre primero.' },
  plano: { n: 'Plano Secuencia', t: 'normal', p: 70, a: 0, pp: 20, d: 'Una toma sin cortes. Nunca falla.' },
  golpecuerpo: { n: 'Golpe Cuerpo', t: 'normal', p: 85, a: 100, pp: 15, e: { st: ['par', 30] }, d: 'Puede paralizar.' },
  derribo: { n: 'Derribo', t: 'normal', p: 90, a: 85, pp: 20, e: { recoil: 25 }, d: 'Fuerte, pero duele al usarlo.' },
  ensayo: { n: 'Ensayo General', t: 'normal', p: 0, a: 0, pp: 20, e: { me: [['atk', 2]] }, d: 'Sube mucho el ataque.' },
  siesta: { n: 'Siesta de Set', t: 'normal', p: 0, a: 0, pp: 10, e: { heal: 50 }, d: 'Recupera la mitad de los PS.' },
  cortefinal: { n: 'Corte Final', t: 'normal', p: 105, a: 90, pp: 10, d: 'El último golpe de la edición.' },
  // FUEGO
  ascuas: { n: 'Ascuas', t: 'fire', p: 40, a: 100, pp: 25, e: { st: ['brn', 10] }, d: 'Puede quemar.' },
  ruedafuego: { n: 'Rueda Fuego', t: 'fire', p: 60, a: 100, pp: 25, e: { st: ['brn', 10] }, d: 'Rueda envuelto en llamas.' },
  colmilloig: { n: 'Colmillo Ígneo', t: 'fire', p: 65, a: 95, pp: 15, e: { st: ['brn', 15] }, d: 'Mordisco ardiente.' },
  lanzallamas: { n: 'Lanzallamas', t: 'fire', p: 90, a: 100, pp: 15, e: { st: ['brn', 10] }, d: 'Un chorro de fuego intenso.' },
  llamarada: { n: 'Llamarada', t: 'fire', p: 110, a: 85, pp: 5, e: { st: ['brn', 30] }, d: 'Fuego total. Poco preciso.' },
  fuegofatuo: { n: 'Fuego Fatuo', t: 'fire', p: 0, a: 85, pp: 15, e: { st: ['brn', 100] }, d: 'Quema al rival.' },
  // AGUA
  burbuja: { n: 'Burbuja', t: 'water', p: 40, a: 100, pp: 30, e: { foe: [['spe', -1], 15] }, d: 'Puede bajar la velocidad.' },
  pistolagua: { n: 'Pistola Agua', t: 'water', p: 40, a: 100, pp: 25, d: 'Chorro de agua a presión.' },
  hidropulso: { n: 'Hidropulso', t: 'water', p: 60, a: 100, pp: 20, d: 'Una onda de agua.' },
  acuacola: { n: 'Acua Cola', t: 'water', p: 75, a: 95, pp: 10, d: 'Coletazo empapado.' },
  surf: { n: 'Surf', t: 'water', p: 90, a: 100, pp: 15, d: 'Una ola gigante.' },
  hidrobomba: { n: 'Hidrobomba', t: 'water', p: 110, a: 80, pp: 5, d: 'Potentísimo. Poco preciso.' },
  refugio: { n: 'Refugio', t: 'water', p: 0, a: 0, pp: 25, e: { me: [['def', 1]] }, d: 'Sube la defensa.' },
  // PLANTA
  latigo: { n: 'Látigo Cepa', t: 'plant', p: 45, a: 100, pp: 25, d: 'Azota con lianas.' },
  absorber: { n: 'Megaagotar', t: 'plant', p: 40, a: 100, pp: 15, e: { drain: 50 }, d: 'Roba energía y cura.' },
  hojaafilada: { n: 'Hoja Afilada', t: 'plant', p: 55, a: 95, pp: 25, e: { crit: true }, d: 'Crítico frecuente.' },
  gigadrenado: { n: 'Gigadrenado', t: 'plant', p: 75, a: 100, pp: 10, e: { drain: 50 }, d: 'Drena mucha energía.' },
  energibola: { n: 'Energibola', t: 'plant', p: 90, a: 100, pp: 10, d: 'Una esfera de energía vegetal.' },
  somnifero: { n: 'Somnífero', t: 'plant', p: 0, a: 75, pp: 15, e: { st: ['slp', 100] }, d: 'Duerme al rival.' },
  paralizador: { n: 'Paralizador', t: 'plant', p: 0, a: 75, pp: 30, e: { st: ['par', 100] }, d: 'Esporas que paralizan.' },
  // HADA
  vientofeerico: { n: 'Viento Feérico', t: 'fairy', p: 40, a: 100, pp: 30, d: 'Brisa mágica.' },
  vozcautiva: { n: 'Voz Cautivadora', t: 'fairy', p: 40, a: 0, pp: 15, d: 'Canto que nunca falla.' },
  besodrenaje: { n: 'Beso Drenaje', t: 'fairy', p: 50, a: 100, pp: 10, e: { drain: 75 }, d: 'Un beso que roba energía.' },
  brillomagico: { n: 'Brillo Mágico', t: 'fairy', p: 80, a: 100, pp: 10, d: 'Luz deslumbrante.' },
  fuerzalunar: { n: 'Fuerza Lunar', t: 'fairy', p: 95, a: 100, pp: 15, e: { foe: [['atk', -1], 30] }, d: 'El poder de la luna.' },
  encanto: { n: 'Encanto', t: 'fairy', p: 0, a: 100, pp: 20, e: { foe: [['atk', -2], 100] }, d: 'Lo enamora: baja mucho su ataque.' },
  besoamoroso: { n: 'Beso Amoroso', t: 'fairy', p: 0, a: 75, pp: 10, e: { st: ['slp', 100] }, d: 'Un beso que duerme. Qué atrevido.' },
  // ACERO
  garrametal: { n: 'Garra Metal', t: 'steel', p: 50, a: 95, pp: 35, e: { me: [['atk', 1]], meChance: 10 }, d: 'Puede subir el ataque.' },
  punobala: { n: 'Puño Bala', t: 'steel', p: 40, a: 100, pp: 30, e: { prio: 1 }, d: 'Golpe metálico veloz.' },
  claquetazo: { n: 'Claquetazo', t: 'steel', p: 75, a: 100, pp: 15, d: '¡Acción! Cierra la claqueta encima.' },
  cabezahierro: { n: 'Cabeza de Hierro', t: 'steel', p: 80, a: 100, pp: 15, d: 'Cabezazo de acero.' },
  fococenital: { n: 'Foco Cenital', t: 'steel', p: 80, a: 100, pp: 10, e: { foe: [['acc', -1], 30] }, d: 'Luz de estudio enceguecedora.' },
  defensaferrea: { n: 'Defensa Férrea', t: 'steel', p: 0, a: 0, pp: 15, e: { me: [['def', 2]] }, d: 'Sube mucho la defensa.' },
  // LUCHA
  golpekarate: { n: 'Golpe Kárate', t: 'fighting', p: 50, a: 100, pp: 25, e: { crit: true }, d: 'Crítico frecuente.' },
  patadabaja: { n: 'Patada Baja', t: 'fighting', p: 60, a: 100, pp: 20, d: 'Barrida a los tobillos.' },
  punodrenaje: { n: 'Puño Drenaje', t: 'fighting', p: 75, a: 100, pp: 10, e: { drain: 50 }, d: 'Golpe que cura.' },
  corpulencia: { n: 'Corpulencia', t: 'fighting', p: 0, a: 0, pp: 20, e: { me: [['atk', 1], ['def', 1]] }, d: 'Sube ataque y defensa.' },
  escenariesgo: { n: 'Escena de Riesgo', t: 'fighting', p: 120, a: 100, pp: 5, e: { recoil: 33 }, d: 'Sin doble de riesgo. Duele.' },
  bocajarro: { n: 'A Bocajarro', t: 'fighting', p: 120, a: 100, pp: 5, e: { me: [['def', -1]] }, d: 'Brutal; baja su defensa.' },
  // DRAGÓN
  dragoaliento: { n: 'Dragoaliento', t: 'dragon', p: 60, a: 100, pp: 20, e: { st: ['par', 30] }, d: 'Aliento que paraliza.' },
  garradragon: { n: 'Garra Dragón', t: 'dragon', p: 80, a: 100, pp: 15, d: 'Zarpazo dracónico.' },
  pulsodragon: { n: 'Pulso Dragón', t: 'dragon', p: 85, a: 100, pp: 10, d: 'Onda de energía dragón.' },
  danzadragon: { n: 'Danza Dragón', t: 'dragon', p: 0, a: 0, pp: 20, e: { me: [['atk', 1], ['spe', 1]] }, d: 'Sube ataque y velocidad.' },
  cometadraco: { n: 'Cometa Draco', t: 'dragon', p: 130, a: 90, pp: 5, e: { me: [['atk', -2]] }, d: 'Devastador, pero agota.' },
};

// ---------- ESPECIES ----------
// b: [PS, Ataque, Defensa, Velocidad]   xp: experiencia base   cr: ratio de captura
// art: parámetros del dibujo procedural (ver gfx.js)
const SPECIES = {
  // ---- FUEGO ----
  flameye: { n: 'Flameye', t: 'fire', b: [44, 52, 40, 56], xp: 62, cr: 45, evo: ['flamcrest', 16], ls: [[1, 'placaje'], [1, 'grunido'], [5, 'ascuas'], [9, 'rapido'], [13, 'ruedafuego']],
    d: 'Pavo real de fuego. Se mira en cada charco. Dice que no es vanidad, que es "control de calidad".',
    art: { a: 'bird', c: ['#e85838', '#f8b040', '#40a0e0'], f: ['crest', 'fan'], s: 0.62 } },
  flamcrest: { n: 'Flamcrest', t: 'fire', b: [60, 68, 54, 70], xp: 142, cr: 45, evo: ['inferpavo', 32], ls: [[16, 'colmilloig'], [20, 'flash'], [25, 'ensayo'], [29, 'lanzallamas']],
    d: 'Adolescente orgulloso. Abre la cola cuando alguien lo filma, aunque nadie lo esté filmando.',
    art: { a: 'bird', c: ['#e04830', '#f8a830', '#3890d8'], f: ['crest', 'fan'], s: 0.74 } },
  inferpavo: { n: 'Inferpavo', t: 'fire', b: [80, 90, 72, 86], xp: 236, cr: 45, ls: [[32, 'llamarada'], [38, 'fuegofatuo'], [44, 'cortefinal']],
    d: 'Rey del fuego majestuoso. Su cola tiene cien ojos y todos te juzgan con cariño.',
    art: { a: 'bird', c: ['#d03828', '#f8c040', '#2878c8'], f: ['crest', 'fan', 'crown'], s: 0.84 } },
  salamandro: { n: 'Salamandro', t: 'fire', b: [48, 50, 46, 50], xp: 66, cr: 160, evo: ['alquimero', 22], ls: [[1, 'aranazo'], [3, 'ascuas'], [8, 'malicioso'], [14, 'ruedafuego'], [19, 'colmilloig']],
    d: 'Salamandra alquimista y torpe. Quiso convertir plomo en oro y convirtió su casa en ceniza.',
    art: { a: 'lizard', c: ['#f07838', '#f8d060', '#603020'], f: ['goggles', 'flametail'], s: 0.6 } },
  alquimero: { n: 'Alquímero', t: 'fire', b: [68, 74, 64, 70], xp: 158, cr: 70, ls: [[22, 'fuegofatuo'], [27, 'lanzallamas'], [33, 'siesta'], [40, 'llamarada']],
    d: 'Ya domina sus fórmulas. Su mayor logro: el café que nunca se enfría.',
    art: { a: 'lizard', c: ['#e05028', '#f8c048', '#502818'], f: ['goggles', 'flametail', 'cape'], s: 0.9 } },
  flamigaro: { n: 'Flamígaro', t: 'fire', b: [62, 70, 56, 82], xp: 150, cr: 75, ls: [[1, 'ascuas'], [1, 'rapido'], [12, 'ruedafuego'], [20, 'ensayo'], [28, 'lanzallamas'], [36, 'llamarada']],
    d: 'Flamenco bailarín de flamenco. Zapatea tan fuerte que enciende el piso. Literal.',
    art: { a: 'tallbird', c: ['#f87898', '#f8c8d0', '#e83838'], f: ['flower'], s: 0.92 } },
  // ---- AGUA ----
  ajolotin: { n: 'Ajolotín', t: 'water', b: [50, 48, 50, 48], xp: 62, cr: 45, evo: ['ajolord', 16], ls: [[1, 'placaje'], [1, 'grunido'], [5, 'burbuja'], [9, 'refugio'], [13, 'pistolagua']],
    d: 'Siempre sonríe. Nadie sabe si es feliz o si su cara es así. Él tampoco lo sabe.',
    art: { a: 'axolotl', c: ['#70b8f8', '#e4f6ff', '#f070b0'], f: ['gills'], s: 0.6 } },
  ajolord: { n: 'Ajolord', t: 'water', b: [68, 64, 68, 62], xp: 142, cr: 45, evo: ['glaciolote', 32], ls: [[16, 'hidropulso'], [20, 'flash'], [25, 'acuacola'], [29, 'surf']],
    d: 'Se cree noble porque le salió un bigote de branquias. Exige que lo llamen "milord".',
    art: { a: 'axolotl', c: ['#4c8ef0', '#d8ecff', '#f058a0'], f: ['gills', 'mustache'], s: 0.82 } },
  glaciolote: { n: 'Glaciolote', t: 'water', b: [88, 82, 88, 76], xp: 236, cr: 45, ls: [[32, 'hidrobomba'], [38, 'defensaferrea'], [44, 'cortefinal']],
    d: 'Enorme y sereno. Abraza fuerte. Demasiado fuerte. Con mucho amor, eso sí.',
    art: { a: 'axolotl', c: ['#58a0e0', '#e0f8ff', '#2050a8'], f: ['gills', 'crystals', 'crown'], s: 0.88 } },
  pinguieson: { n: 'Pingüesón', t: 'water', b: [52, 50, 52, 46], xp: 64, cr: 170, evo: ['pinguichef', 24], ls: [[1, 'placaje'], [4, 'burbuja'], [9, 'malicioso'], [15, 'pistolagua'], [20, 'hidropulso']],
    d: 'Pingüino que sueña con abrir un restaurante. Por ahora solo sirve hielo. Con mucha actitud.',
    art: { a: 'penguin', c: ['#2c78b8', '#f0fcff', '#f8a830'], f: ['scarf'], s: 0.6 } },
  pinguichef: { n: 'Pingüchef', t: 'water', b: [74, 80, 70, 60], xp: 160, cr: 80, ls: [[24, 'acuacola'], [28, 'corpulencia'], [34, 'surf'], [42, 'hidrobomba']],
    d: 'Chef estrella. Si le decís que la comida está rica, te sirve el doble. Si no, también.',
    art: { a: 'penguin', c: ['#303c58', '#f8f8f8', '#f8a830'], f: ['chefhat', 'scarf'], s: 0.92 } },
  medusync: { n: 'Medusync', t: 'water', b: [50, 40, 46, 60], xp: 64, cr: 160, evo: ['medubass', 26], ls: [[1, 'burbuja'], [6, 'vientofeerico'], [11, 'paralizador'], [17, 'hidropulso']],
    d: 'Medusa que late al ritmo de la música. En silencio se pone nerviosa.',
    art: { a: 'jelly', c: ['#a8d8f8', '#f8f8ff', '#e070c0'], f: [], s: 0.62 } },
  medubass: { n: 'Medubass', t: 'water', b: [76, 60, 70, 84], xp: 168, cr: 75, ls: [[26, 'surf'], [31, 'vozcautiva'], [38, 'hidrobomba']],
    d: 'DJ de las profundidades. Sus tentáculos son cables. Sus fiestas duran tres mareas.',
    art: { a: 'jelly', c: ['#8070e0', '#e8e0ff', '#f8e040'], f: ['headphones'], s: 0.95 } },
  // ---- PLANTA ----
  gorilan: { n: 'Gorilán', t: 'plant', b: [54, 54, 46, 44], xp: 62, cr: 45, evo: ['gorilirico', 16], ls: [[1, 'placaje'], [1, 'malicioso'], [5, 'latigo'], [9, 'absorber'], [13, 'hojaafilada']],
    d: 'Gorila poeta. Escribe sonetos en hojas de banano y después se las come. Arte efímero.',
    art: { a: 'ape', c: ['#58a048', '#c8e080', '#386028'], f: ['leaf'], s: 0.62 } },
  gorilirico: { n: 'Gorilírico', t: 'plant', b: [72, 72, 60, 58], xp: 142, cr: 45, evo: ['gorilegend', 32], ls: [[16, 'patadabaja'], [20, 'corpulencia'], [25, 'gigadrenado'], [29, 'energibola']],
    d: 'Recita en las plazas. Cobra en bananas. Acepta aplausos, pero prefiere bananas.',
    art: { a: 'ape', c: ['#489038', '#c0d870', '#305020'], f: ['leaf', 'scarf'], s: 0.84 } },
  gorilegend: { n: 'Gorilegend', t: 'plant', b: [94, 92, 78, 66], xp: 236, cr: 45, ls: [[32, 'paralizador'], [38, 'bocajarro'], [44, 'cortefinal']],
    d: 'Leyenda de la selva. Cuando golpea el pecho, los árboles le piden un autógrafo.',
    art: { a: 'ape', c: ['#3c8030', '#b8d068', '#284818'], f: ['leaf', 'crown', 'beard'], s: 1 } },
  hedroca: { n: 'Hedroca', t: 'plant', b: [52, 48, 52, 50], xp: 64, cr: 180, evo: ['hedroble', 22], ls: [[1, 'placaje'], [3, 'latigo'], [8, 'grunido'], [13, 'absorber'], [18, 'hojaafilada']],
    d: 'Cabrita cubierta de hiedra. Mastica todo lo que encuentra, incluidos los guiones.',
    art: { a: 'goat', c: ['#d8f0c0', '#58b848', '#806040'], f: ['ivy'], s: 0.6 } },
  hedroble: { n: 'Hedroble', t: 'plant', b: [76, 74, 72, 64], xp: 162, cr: 70, ls: [[22, 'gigadrenado'], [27, 'corpulencia'], [32, 'energibola'], [40, 'somnifero']],
    d: 'Le crecieron cuernos de roble. Ahora usa su cabeza para todo. Para pensar, no tanto.',
    art: { a: 'goat', c: ['#d8d0b0', '#509838', '#704828'], f: ['ivy', 'antlers'], s: 0.9 } },
  espinardo: { n: 'Espinardo', t: 'plant', b: [66, 80, 66, 62], xp: 150, cr: 90, ls: [[1, 'latigo'], [1, 'malicioso'], [14, 'hojaafilada'], [20, 'corpulencia'], [28, 'energibola'], [35, 'escenariesgo']],
    d: 'Carnero punk rebelde. Sus espinas son un peinado. No lo toques. En serio.',
    art: { a: 'goat', c: ['#585868', '#48a848', '#e8e070'], f: ['mohawk', 'horns'], s: 0.88 } },
  // ---- HADA ----
  lucierlaga: { n: 'Luciérlaga', t: 'fairy', b: [46, 42, 44, 62], xp: 60, cr: 170, evo: ['lucilente', 20], ls: [[1, 'placaje'], [1, 'flash'], [6, 'vientofeerico'], [12, 'paralizador'], [16, 'vozcautiva']],
    d: 'Luciérnaga fotógrafa. Su luz es perfecta para la "hora dorada". Siempre es hora dorada.',
    art: { a: 'bug', c: ['#f8d848', '#506080', '#f8f8a0'], f: ['glow'], s: 0.58 } },
  lucilente: { n: 'Lucilente', t: 'fairy', b: [66, 64, 60, 90], xp: 158, cr: 80, ls: [[20, 'besodrenaje'], [25, 'fococenital'], [31, 'brillomagico'], [38, 'fuerzalunar']],
    d: 'Ahora tiene cámara profesional. Te pide que poses "natural". Nunca nadie posa natural.',
    art: { a: 'bug', c: ['#f8c838', '#404868', '#f8f8a0'], f: ['glow', 'camera'], s: 0.86 } },
  zumbaflor: { n: 'Zumbaflor', t: 'fairy', b: [44, 44, 40, 72], xp: 62, cr: 160, evo: ['zumbaccino', 24], ls: [[1, 'rapido'], [4, 'vientofeerico'], [9, 'encanto'], [15, 'besodrenaje'], [21, 'vozcautiva']],
    d: 'Colibrí barista hiperactivo. Toma seis cafés antes del desayuno. El desayuno es otro café.',
    art: { a: 'hummer', c: ['#40c8a0', '#f070a0', '#f8f0d0'], f: [], s: 0.55 } },
  zumbaccino: { n: 'Zumbaccino', t: 'fairy', b: [62, 66, 58, 104], xp: 160, cr: 75, ls: [[24, 'brillomagico'], [29, 'besoamoroso'], [35, 'fuerzalunar']],
    d: 'Tiene una cafetería móvil en la espalda. Te cobra en sonrisas. Y en monedas, también.',
    art: { a: 'hummer', c: ['#30b090', '#e85890', '#a07050'], f: ['cup'], s: 0.84 } },
  duendecillo: { n: 'Duendecillo', t: 'fairy', b: [58, 66, 58, 80], xp: 140, cr: 90, ls: [[1, 'vientofeerico'], [1, 'malicioso'], [10, 'encanto'], [18, 'besodrenaje'], [26, 'brillomagico'], [34, 'besoamoroso']],
    d: 'Duende ladrón de calcetines. Solo se lleva uno de cada par. Por puro caos.',
    art: { a: 'imp', c: ['#68c868', '#f8d0a8', '#d04848'], f: ['hat', 'sock'], s: 0.7 } },
  // ---- DRAGÓN ----
  wyvernito: { n: 'Wyvernito', t: 'dragon', b: [52, 60, 50, 54], xp: 70, cr: 45, evo: ['wyvernax', 30], ls: [[1, 'aranazo'], [1, 'grunido'], [7, 'dragoaliento'], [14, 'rapido'], [21, 'garradragon'], [26, 'danzadragon']],
    d: 'Cachorro de wyvern juguetón. Muerde cosas para "probar si son comida". Todo es comida.',
    art: { a: 'dragon', c: ['#7860d8', '#e8d8a0', '#f8c040'], f: ['wings'], s: 0.62 } },
  wyvernax: { n: 'Wyvernax', t: 'dragon', b: [86, 100, 80, 88], xp: 250, cr: 45, ls: [[30, 'pulsodragon'], [36, 'colmilloig'], [42, 'cometadraco'], [48, 'escenariesgo']],
    d: 'Señor de los cielos. Aterriza siempre con pose. Si nadie mira, vuelve a despegar.',
    art: { a: 'dragon', c: ['#6048c0', '#e0d090', '#f8b030'], f: ['wings', 'horns', 'spikes'], s: 0.92 } },
  longbao: { n: 'Lóngbao', t: 'dragon', b: [70, 76, 66, 70], xp: 165, cr: 60, ls: [[1, 'dragoaliento'], [1, 'ascuas'], [18, 'garradragon'], [25, 'corpulencia'], [32, 'pulsodragon'], [40, 'cometadraco']],
    d: 'Dragón oriental cocinero. Su especialidad es el bao al vapor. El vapor lo hace él.',
    art: { a: 'serpent', c: ['#e84848', '#f8d860', '#f8f8f8'], f: ['whiskers', 'chefhat'], s: 0.9 } },
  gusarix: { n: 'Gusarix', t: 'dragon', b: [48, 50, 58, 40], xp: 64, cr: 150, evo: ['crisalmanza', 28], ls: [[1, 'placaje'], [5, 'refugio'], [11, 'dragoaliento'], [18, 'absorber'], [24, 'garradragon']],
    d: 'Gusanito que vive en una manzana. Se come su casa poquito a poco. Y se muda.',
    art: { a: 'apple', c: ['#e03838', '#78c048', '#f8e0a0'], f: ['worm'], s: 0.55 } },
  crisalmanza: { n: 'Crisálmanza', t: 'dragon', b: [78, 84, 96, 52], xp: 170, cr: 60, ls: [[28, 'defensaferrea'], [33, 'pulsodragon'], [40, 'cometadraco']],
    d: 'Caballero de cáscara de manzana. Dice que es una armadura. Huele a tarta.',
    art: { a: 'apple', c: ['#c82830', '#68b040', '#f8e0a0'], f: ['knight'], s: 0.88 } },
  // ---- ACERO ----
  claquetin: { n: 'Claquetín', t: 'steel', b: [50, 56, 64, 40], xp: 66, cr: 150, evo: ['claqueton', 24], ls: [[1, 'placaje'], [1, 'malicioso'], [6, 'garrametal'], [12, 'refugio'], [18, 'claquetazo']],
    d: 'Cangrejo claqueta. Cada vez que cierra las pinzas grita "¡acción!". Duerme poco.',
    art: { a: 'crab', c: ['#383840', '#f8f8f8', '#e8c040'], f: [], s: 0.6 } },
  claqueton: { n: 'Claquetón', t: 'steel', b: [74, 86, 94, 52], xp: 165, cr: 70, ls: [[24, 'cabezahierro'], [29, 'defensaferrea'], [35, 'golpecuerpo'], [42, 'cortefinal']],
    d: 'Si dice "¡corte!", todo el mundo se queda quieto. Incluso el viento.',
    art: { a: 'crab', c: ['#303038', '#f8f8f8', '#e83838'], f: ['big'], s: 0.95 } },
  tripodin: { n: 'Tripodín', t: 'steel', b: [62, 66, 78, 70], xp: 155, cr: 80, ls: [[1, 'garrametal'], [1, 'flash'], [15, 'punobala'], [22, 'fococenital'], [30, 'cabezahierro'], [38, 'defensaferrea']],
    d: 'Araña-trípode con un ojo de lente. Siempre encuentra el mejor ángulo para mirarte.',
    art: { a: 'tripod', c: ['#7888a0', '#303040', '#58c8f8'], f: [], s: 0.85 } },
  // ---- LUCHA ----
  doblecan: { n: 'Doblecan', t: 'fighting', b: [54, 62, 48, 58], xp: 66, cr: 150, evo: ['dobleriesgo', 24], ls: [[1, 'placaje'], [1, 'grunido'], [6, 'golpekarate'], [12, 'rapido'], [18, 'patadabaja']],
    d: 'Perrito doble de riesgo. Se tira por las escaleras para que vos no tengas que hacerlo.',
    art: { a: 'dog', c: ['#f0a038', '#fff0d8', '#3858c8'], f: ['band'], s: 0.6 } },
  dobleriesgo: { n: 'Dobleriesgo', t: 'fighting', b: [76, 96, 64, 80], xp: 168, cr: 70, ls: [[24, 'punodrenaje'], [29, 'corpulencia'], [35, 'escenariesgo'], [42, 'bocajarro']],
    d: 'Hace todas sus escenas. Y las tuyas, si lo dejás. Tiene más yesos que fans.',
    art: { a: 'dog', c: ['#c07838', '#f8e8d0', '#c83838'], f: ['band', 'jacket'], s: 0.92 } },
  boomguru: { n: 'Boomgurú', t: 'fighting', b: [80, 88, 70, 72], xp: 170, cr: 70, ls: [[1, 'golpekarate'], [1, 'grunido'], [20, 'patadabaja'], [26, 'corpulencia'], [32, 'punodrenaje'], [40, 'bocajarro']],
    d: 'Canguro sonidista. Sostiene el micrófono boom con la cola. Escucha hasta tus pensamientos.',
    art: { a: 'roo', c: ['#c89060', '#f0d8b0', '#404048'], f: ['boom'], s: 0.84 } },
  // ---- NORMAL ----
  palomiton: { n: 'Palomitón', t: 'normal', b: [42, 46, 40, 56], xp: 50, cr: 255, evo: ['palomaiz', 14], ls: [[1, 'placaje'], [3, 'grunido'], [7, 'rapido'], [11, 'flash']],
    d: 'Paloma que vive en los cines. Come pochoclo del piso. Juzga las películas en silencio.',
    art: { a: 'bird', c: ['#b4a0e8', '#fff4d0', '#f0b840'], f: ['popcorn'], s: 0.52 } },
  palomaiz: { n: 'Palomaíz', t: 'normal', b: [64, 66, 58, 78], xp: 135, cr: 120, ls: [[14, 'plano'], [20, 'ensayo'], [27, 'golpecuerpo'], [34, 'derribo']],
    d: 'Ahora tiene un balde de pochoclo como nido. Comparte, pero solo con quien llora en las películas.',
    art: { a: 'bird', c: ['#9c84e0', '#fff4d0', '#e83838'], f: ['popcorn', 'bucket'], s: 0.78 } },
  rollin: { n: 'Rollín', t: 'normal', b: [46, 44, 46, 50], xp: 52, cr: 255, evo: ['rollazo', 18], ls: [[1, 'placaje'], [1, 'malicioso'], [6, 'rapido'], [12, 'siesta'], [15, 'golpecuerpo']],
    d: 'Hámster que corre dentro de un rollo de película. Si se detiene, se termina la escena.',
    art: { a: 'hamster', c: ['#f8c060', '#fff8e8', '#383848'], f: ['reel'], s: 0.55 } },
  rollazo: { n: 'Rollazo', t: 'normal', b: [78, 70, 72, 58], xp: 150, cr: 110, ls: [[18, 'plano'], [24, 'derribo'], [30, 'ensayo'], [38, 'cortefinal']],
    d: 'Rueda tan rápido que proyecta películas en las paredes. Casi siempre comedias románticas.',
    art: { a: 'hamster', c: ['#d8a060', '#f8f0e0', '#383838'], f: ['reel', 'big'], s: 0.78 } },
  serafox: { n: 'Serafox', t: 'normal', b: [72, 80, 70, 96], xp: 180, cr: 30, ls: [[1, 'rapido'], [1, 'encanto'], [20, 'plano'], [28, 'brillomagico'], [36, 'cortefinal'], [44, 'fuerzalunar']],
    d: 'Zorro ángel celestial y travieso. Hace milagros pequeños: encontrar tus llaves, por ejemplo.',
    art: { a: 'fox', c: ['#f8f0e8', '#f8c860', '#80c8f8'], f: ['halo', 'wings'], s: 0.85 } },
  taquillon: { n: 'Taquillón', t: 'normal', b: [110, 110, 100, 100], xp: 280, cr: 5, ls: [[1, 'plano'], [1, 'ensayo'], [50, 'cortefinal'], [50, 'fuerzalunar'], [50, 'lanzallamas'], [50, 'surf']],
    d: 'Bestia legendaria del éxito de taquilla. Se dice que aparece cuando una sala entera aplaude de pie.',
    art: { a: 'fox', c: ['#f8d040', '#f8f8f8', '#e83838'], f: ['ticket', 'crown'], s: 1 } },
};
const DEX_ORDER = ['flameye', 'flamcrest', 'inferpavo', 'ajolotin', 'ajolord', 'glaciolote', 'gorilan', 'gorilirico', 'gorilegend',
  'palomiton', 'palomaiz', 'rollin', 'rollazo', 'hedroca', 'hedroble', 'salamandro', 'alquimero', 'pinguieson', 'pinguichef',
  'lucierlaga', 'lucilente', 'doblecan', 'dobleriesgo', 'claquetin', 'claqueton', 'medusync', 'medubass', 'zumbaflor', 'zumbaccino',
  'gusarix', 'crisalmanza', 'wyvernito', 'wyvernax', 'tripodin', 'duendecillo', 'flamigaro', 'espinardo', 'longbao', 'boomguru',
  'serafox', 'taquillon'];

// ---------- OBJETOS ----------
// k: 'heal' | 'status' | 'revive' | 'pp' | 'ball' | 'incense' | 'lvl' | 'mat' | 'key'
const ITEMS = {
  cafe: { n: 'Café de Rodaje', k: 'heal', v: 25, price: 200, d: 'Recupera 25 PS. Amargo, como la vida del set.' },
  cafedoble: { n: 'Café Doble', k: 'heal', v: 70, price: 600, d: 'Recupera 70 PS. Te deja hablando rápido.' },
  cafetera: { n: 'Cafetera Entera', k: 'heal', v: 999, price: 1500, d: 'Recupera todos los PS. Nadie duerme esta noche.' },
  tecito: { n: 'Tecito', k: 'status', price: 250, d: 'Té de manzanilla. Cura quemaduras, parálisis y sueño.' },
  tomados: { n: 'Toma Dos', k: 'revive', price: 1200, d: 'Reanima a una criatura debilitada con la mitad de PS.' },
  agua: { n: 'Botella de Agua', k: 'pp', v: 10, price: 700, d: 'Recupera 10 PP de cada movimiento.' },
  cristal: { n: 'Cristal Vínculo', k: 'ball', v: 1, price: 200, d: 'Crea un vínculo con una criatura salvaje.' },
  cristalest: { n: 'Cristal Estelar', k: 'ball', v: 1.8, price: 800, d: 'Vínculo más fuerte. Brilla como el ego de un director.' },
  guion: { n: 'Guion Inédito', k: 'lvl', price: 0, d: 'Lo lee una criatura y sube un nivel. Spoilers incluidos.' },
  fragmento: { n: 'Fragmento', k: 'mat', price: 0, d: 'Trozo de cristal. Con 3 se fabrica un Cristal Vínculo.' },
  fragoro: { n: 'Fragmento Dorado', k: 'mat', price: 0, d: 'Brilla mucho. Sirve para fabricar Cristales Estelares.' },
  inc_fire: { n: 'Incienso Ígneo', k: 'incense', t: 'fire', price: 500, d: 'Atrae criaturas de Fuego por 120 pasos.' },
  inc_water: { n: 'Incienso Marino', k: 'incense', t: 'water', price: 500, d: 'Atrae criaturas de Agua por 120 pasos.' },
  inc_plant: { n: 'Incienso Verde', k: 'incense', t: 'plant', price: 500, d: 'Atrae criaturas de Planta por 120 pasos.' },
  inc_fairy: { n: 'Incienso Rosa', k: 'incense', t: 'fairy', price: 500, d: 'Atrae criaturas de Hada por 120 pasos.' },
  inc_steel: { n: 'Incienso Metal', k: 'incense', t: 'steel', price: 500, d: 'Atrae criaturas de Acero por 120 pasos.' },
  inc_fighting: { n: 'Incienso Sudado', k: 'incense', t: 'fighting', price: 500, d: 'Atrae criaturas de Lucha por 120 pasos. Huele a gimnasio.' },
  inc_dragon: { n: 'Incienso Dracónico', k: 'incense', t: 'dragon', price: 500, d: 'Atrae criaturas de Dragón por 120 pasos.' },
  inc_normal: { n: 'Incienso Neutro', k: 'incense', t: 'normal', price: 500, d: 'Atrae criaturas Normales por 120 pasos.' },
  teja: { n: 'Teja Reforzada', k: 'key', d: 'Una teja de cantera. Alguien en Aldea Pitch la necesita desesperadamente.' },
  llave: { n: 'Llave del Rey', k: 'key', d: 'Abre la puerta del salón del trono. Pesa más de lo que parece.' },
  libreta: { n: 'Libreta de Chismes', k: 'key', d: 'Dan te la prestó. Anotá acá todo lo que escuches. Todo.' },
};

const DIPLOMAS = [
  { id: 'foto', n: 'Fotografía Estética', who: 'Tamara', c: '#f0a040' },
  { id: 'docu', n: 'Documental', who: 'Luchito', c: '#60a8e8' },
  { id: 'ficcion', n: 'Ficción', who: 'Andrea', c: '#d870c0' },
  { id: 'publi', n: 'Publicidad', who: 'Dan', c: '#60c070' },
];

// ---------- CRIATURA (instancia) ----------
const xpFor = (lv) => Math.floor(0.8 * lv * lv * lv);
const STAGE_MUL = (s) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
class Mon {
  constructor(id, lv, o = {}) {
    if (id == null) return; // deserialización
    this.id = id; this.lv = lv; this.xp = xpFor(lv);
    this.iv = o.iv || [rnd(8), rnd(8), rnd(8), rnd(8)];
    this.nick = o.nick || null;
    this.status = null; this.slp = 0;
    this.moves = [];
    for (const [l, m] of this.sp.ls) if (l <= lv && !this.moves.some((x) => x.id === m)) {
      this.moves.push({ id: m, pp: MOVES[m].pp });
      if (this.moves.length > 4) this.moves.shift();
    }
    if (o.moves) this.moves = o.moves.map((m) => ({ id: m, pp: MOVES[m].pp }));
    this.calc(); this.hp = this.maxhp;
  }
  get sp() { return SPECIES[this.id]; }
  get name() { return this.nick || this.sp.n; }
  get type() { return this.sp.t; }
  calc() {
    const b = this.sp.b, L = this.lv, iv = this.iv;
    const old = this.maxhp;
    this.maxhp = Math.floor(((b[0] * 2 + iv[0]) * L) / 100) + L + 10;
    this.atk = Math.floor(((b[1] * 2 + iv[1]) * L) / 100) + 5;
    this.def = Math.floor(((b[2] * 2 + iv[2]) * L) / 100) + 5;
    this.spe = Math.floor(((b[3] * 2 + iv[3]) * L) / 100) + 5;
    if (old != null && this.hp != null) this.hp = clamp(this.hp + (this.maxhp - old), 0, this.maxhp);
  }
  heal() { this.hp = this.maxhp; this.status = null; this.slp = 0; for (const m of this.moves) m.pp = MOVES[m.id].pp; }
  get fainted() { return this.hp <= 0; }
  movesAt(lv) { return this.sp.ls.filter(([l]) => l === lv).map(([, m]) => m); }
  toJSON() { return { id: this.id, lv: this.lv, xp: this.xp, iv: this.iv, nick: this.nick, hp: this.hp, status: this.status, slp: this.slp, moves: this.moves }; }
  static from(o) { const m = new Mon(); Object.assign(m, o); m.moves = o.moves.map((x) => ({ ...x })); m.calc(); m.hp = clamp(o.hp, 0, m.maxhp); return m; }
}
