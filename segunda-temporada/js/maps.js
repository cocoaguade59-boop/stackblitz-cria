'use strict';
// =====================================================================
//  MAPAS DEL REINO (sur → norte). Los diálogos largos viven en story.js
// =====================================================================
const POST = () => flag('campeon');
const T = (team) => team; // azúcar visual

// ---------- interiores reutilizables ----------
function houseRows() { return ['wwhwwwwww', 'nnnnnnnnn', 'nntnnnnbn', 'nnnnnnnnn', 'pnnnnnnnp', 'nnnnnnnnn', 'nnnnmnnnn']; }
function proaRows() { return ['wwwwHwwwwww', 'eeeeeeeeeee', 'CCCCCCCCCQh', 'eeeeeeeeeee', 'peeeeeeeeep', 'eeeeeeeeeee', 'eeeeeeeeeee', 'eeeeemeeeee']; }
function studioRows() { return ['wwwwwwwwwww', 'zzzzzzzzzzz', 'pzzzzRzzzzp', 'zzzzzRzzzzz', 'zzzzzRzzzzz', 'zzzzzRzzzzz', 'pzzzzRzzzzp', 'zzzzzRzzzzz', 'zzzzzmzzzzz']; }
const HOUSE_ENTRY = { x: 4, y: 5 }, PROA_ENTRY = { x: 5, y: 6 }, STUDIO_ENTRY = { x: 5, y: 7 };
function proaCenter(id, town, stock, extra = []) {
  registerMap(id, {
    name: 'Centro Proa', inside: true, music: 'town', rows: proaRows(), entry: PROA_ENTRY, bg: 'town',
    npcs: [
      { id: 'luas', look: 'luas', name: 'Luas', x: 3, y: 1, still: true, talk: () => S.luas() },
      { id: 'clerk', look: 'asistente', name: 'Vendedor', x: 7, y: 1, still: true, talk: () => shopMenu(typeof stock === 'function' ? stock() : stock, 'Vendedor') },
      ...extra,
    ],
  });
  void town;
}
const STOCK1 = ['cafe', 'tecito', 'cristal'];
const STOCK2 = ['cafe', 'tecito', 'cristal', 'inc_fire', 'inc_water', 'inc_plant'];
const STOCK3 = ['cafe', 'cafedoble', 'tecito', 'agua', 'cristal', 'inc_steel', 'inc_fighting', 'inc_normal'];
const STOCK4 = ['cafe', 'cafedoble', 'tecito', 'tomados', 'agua', 'cristal', 'cristalest', 'inc_fairy', 'inc_dragon', 'inc_normal'];
const STOCK5 = ['cafedoble', 'cafetera', 'tecito', 'tomados', 'agua', 'cristal', 'cristalest', 'inc_fire', 'inc_water', 'inc_plant', 'inc_fairy', 'inc_steel', 'inc_fighting', 'inc_dragon', 'inc_normal'];

// =====================================================================
//  ALDEA PITCH
// =====================================================================
registerMap('pitch', {
  name: 'Aldea Pitch', music: 'town', bg: 'feudal', theme: 'feudal',
  rows: [
    'TTTTTTTTTT::TTTTTTTTTT',
    'TTTTTTTTTT::TTTTTTTTTT',
    'TT.......f::f.O.....TT',
    'T.........::.........T',
    'T.........::.........T',
    'T.........::.........T',
    'T.........::.........T',
    'T.........::.........T',
    'T...:.....::......:..T',
    'T...:::::::::::::::..T',
    'T..........:........AT',
    'T..........:.........T',
    'T........S.:........AT',
    'T..........:.........T',
    'T..........:.........T',
    'T...:......:....:....T',
    'T...:::::::::::::....T',
    'T.ff.....;;;;;BB..ff.T',
    '~~~~~~~~~;==;~~~~~~~~~',
    '~~~~~~~~~~==~~~~~~~~~~',
  ],
  links: { n: { to: 'ruta1', d: -3 } },
  buildings: [
    { x: 2, y: 4, w: 5, h: 4, kind: 'house', roof: '#e88830', to: 'pitch_ale' },
    { x: 16, y: 4, w: 5, h: 4, kind: 'house', roof: '#48a058', to: 'pitch_nicole', broken: () => !flag('techo') },
    { x: 13, y: 11, w: 7, h: 4, kind: 'proa', to: 'pitch_proa' },
    { x: 2, y: 11, w: 5, h: 4, kind: 'house', roof: '#5878d0', to: 'pitch_casa' },
  ],
  signs: [{ x: 9, y: 12, text: 'ALDEA PITCH. Aldea de campesinos, artesanos y soñadores. "Toda historia empieza con una idea... y con alguien que se anima a contarla."' }],
  npcs: [
    { id: 'ale_out', look: 'alessandro', name: 'Alessandro', x: 10, y: 16, dir: 'down', cond: () => !flag('intro'), talk: () => S.intro() },
    { id: 'kid', look: 'peque_f', name: 'Alexandro', x: 7, y: 10, move: 'wander', talk: () => S.alexandro() },
    { id: 'marinero', look: 'pescador', name: 'Marinero', x: 6, y: 17, dir: 'down', text: () => (POST() ? 'Mi barco te trajo cuando eras un novato. Mirate ahora. Me emociono y no lloro: es el viento.' : 'Te traje en mi barco, ¿te acordás? Mareado y todo, bajaste con cara de protagonista.') },
    { id: 'vieja', look: 'campesina', name: 'Doña Rosa', x: 19, y: 10, move: 'turn', text: 'En mis tiempos las criaturas se capturaban con amor y paciencia. Ahora también, pero con cristales. Igual el amor ayuda.' },
    { id: 'gab_post', look: 'gabriela2', name: 'Gabriela', x: 12, y: 10, dir: 'down', cond: POST, talk: () => S.gabrielaPost() },
    { id: 'ale_post', look: 'alessandro', name: 'Alessandro', x: 13, y: 10, dir: 'down', cond: POST, talk: () => S.alessandroPost() },
  ],
  events: [
    { x: 10, y: 3, cond: () => !flag('starter'), run: () => S.blockNorth() },
    { x: 11, y: 3, cond: () => !flag('starter'), run: () => S.blockNorth() },
  ],
  finds: [{ x: 1, y: 3, item: 'cafe', hidden: true }],
});
registerMap('pitch_ale', {
  name: 'Casa-estudio de Alessandro', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [
    { id: 'ale', look: 'alessandro', name: 'Alessandro', x: 3, y: 1, dir: 'down', cond: () => flag('intro') && !POST(), talk: () => S.alessandroHouse() },
    { id: 'gab', look: 'gabriela', name: 'Gabriela', x: 6, y: 1, dir: 'down', cond: () => !flag('gabLeft'), talk: () => S.gabrielaHouse() },
  ],
});
registerMap('pitch_nicole', {
  name: 'Pensión de Nicole', inside: true, music: 'town', rows: ['wwhwwwwww', 'nnnnnnnbn', 'nntnnnnnn', 'nnnnnnnnn', 'pnnnnnnnp', 'nnnnnnnnn', 'nnnnmnnnn'], entry: HOUSE_ENTRY,
  npcs: [{ id: 'nicole', look: 'nicole', name: 'Nicole', x: 2, y: 3, dir: 'right', talk: () => S.nicole() }],
  events: [],
});
proaCenter('pitch_proa', 'pitch', STOCK1);
registerMap('pitch_casa', {
  name: 'Casa del pueblo', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [
    { id: 'cocinero', look: 'campesino', name: 'Tito', x: 6, y: 3, move: 'wander', text: 'Cocino para todo el pueblo. Alessandro siempre pide doble porción y dice que es "para Gabriela". Gabriela también pide doble. Nadie come tanto. Sospecho.' },
  ],
  finds: [{ x: 1, y: 1, item: 'cristal', n: 2 }],
});

// =====================================================================
//  RUTA 1
// =====================================================================
registerMap('ruta1', {
  name: 'Ruta 1', music: 'route', bg: 'grass',
  rows: [
    'TTTTTTT::TTTTTTTTT',
    'TTTTTTT::TTTTTTTTT',
    'T,,,...::.....,,,T',
    'T,,,...::.....,,,T',
    'T,,,...::..r..,,,T',
    'T......::........T',
    'T..ff..::...TTT..T',
    'TTTT...::...TTT..T',
    'T......:::::::...T',
    'T.,,,,.......:...T',
    'T.,,,,.......:..fT',
    'T.,,,,..S....:...T',
    'T............:...T',
    'Tvvvvvvvvvvvv:vvvT',
    'T............:...T',
    'T...,,,,,,...:...T',
    'T...,,,,,,...:...T',
    'T...,,,,,,...:,,,T',
    'T............:,,,T',
    'TTT..TTTT....:,,,T',
    'T~~~~~~~T....:...T',
    'T~~~~~~~T....:...T',
    'T.......T.:::::..T',
    'T,,,.....:.......T',
    'T,,,,....:..ff...T',
    'T,,,,....:.......T',
    'T........:...,,,.T',
    'T..r.....:...,,,.T',
    'T........:...,,,.T',
    'TTTT.....:......TT',
    'T.......::.......T',
    'T......::........T',
    'TTTTTTT::TTTTTTTTT',
    'TTTTTTT::TTTTTTTTT',
  ],
  links: { s: { to: 'pitch', d: 3 }, n: { to: 'storyboard', d: 4 } },
  signs: [{ x: 8, y: 11, text: 'RUTA 1. Al norte: Villa Storyboard. Aviso: el pasto alto tiene criaturas. Y garrapatas emocionales.' }],
  enc: { grass: [['palomiton', 2, 5, 30], ['rollin', 2, 5, 28], ['hedroca', 3, 5, 18], ['pinguieson', 3, 5, 12], ['salamandro', 3, 5, 12]] },
  npcs: [
    { id: 'r1a', look: 'chico', name: 'Novato Tomi', x: 12, y: 24, dir: 'left', trainer: { id: 'r1a', sight: 3, team: [['palomiton', 4], ['rollin', 4]], money: 160, intro: '¡Soy de Brandcut! Bueno, aspirante. Me dejan cargar los cables.', lose: 'Perdí... pero aprendí que los cables pesan menos que la derrota.', after: 'Algún día voy a ser de Brandcut de verdad. Primero aprendo a ganar.' } },
    { id: 'r1b', look: 'chica', name: 'Rebata Lula', x: 4, y: 12, dir: 'right', trainer: { id: 'r1b', sight: 4, team: [['hedroca', 5], ['pinguieson', 5]], money: 200, intro: '¡Los Rebata venimos a hacer ruido! ¡Y a pelear! ¡Y a hacer ruido peleando!', lose: '¡Bueno! ¡Igual hicimos ruido!', after: 'Shhh. Bueno, no: ¡HOLA!' } },
    { id: 'r1c', look: 'kid2', name: 'Peque Mora', x: 15, y: 5, dir: 'down', text: 'Para atrapar una criatura, primero bajale la vida. Si la dormís o paralizás, ¡mejor todavía! Me lo dijo mi mamá. Ella atrapó a mi papá así. Creo que era una metáfora.' },
  ],
  finds: [{ x: 1, y: 22, item: 'cristal', n: 2 }, { x: 16, y: 2, item: 'cafe' }, { x: 4, y: 27, item: 'fragmento', hidden: true }, { x: 15, y: 21, item: 'fragmento', hidden: true }],
});

// =====================================================================
//  VILLA STORYBOARD
// =====================================================================
registerMap('storyboard', {
  name: 'Villa Storyboard', music: 'town', bg: 'viking', theme: 'viking',
  rows: [
    'TTTTTTTTTTT::TTTTTTTTTTT',
    'TTTTTTTTTTT:FTTTTTTTTTTT',
    'T.........f::f.........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::.....:....T',
    'T....:.....::.....:....T',
    'T....::::::::::::::....T',
    'TE.........++........J.T',
    'T.f.....S..++......f...T',
    'T..........++..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T....:.....::.....:....T',
    'T....:::::::::::::::...T',
    'T.ff.......::.......ff.T',
    'TTTTTTTTTTT::TTTTTTTTTTT',
  ],
  links: { s: { to: 'ruta1', d: -4 }, n: { to: 'ruta2', d: -3 } },
  buildings: [
    { x: 2, y: 3, w: 7, h: 5, kind: 'studio', to: 'sb_studio' },
    { x: 16, y: 3, w: 5, h: 4, kind: 'house', roof: '#d05858', to: 'sb_casa' },
    { x: 15, y: 12, w: 7, h: 4, kind: 'proa', to: 'sb_proa' },
    { x: 3, y: 12, w: 5, h: 4, kind: 'house', roof: '#8868c8', to: 'sb_casa2' },
  ],
  signs: [{ x: 8, y: 11, text: 'VILLA STORYBOARD. Aldea del clan Storyboard. "Antes de zarpar, se dibuja el mapa." Gran salón de Tamara, materializadora.' }],
  npcs: [
    { id: 'gate1', look: 'vikingo', name: 'Asistente', x: 11, y: 1, dir: 'down', cond: () => !flag('dip_foto'), text: 'Perdón, el paso al norte está cerrado hasta que tengas el diploma de Fotografía Estética. Lo dice el reglamento. Yo no hice el reglamento. Yo solo lo sostengo... con mi cuerpo.' },
    { id: 'sb1', look: 'vikinga', name: 'Lucía', x: 14, y: 10, move: 'wander', text: 'Tamara es materializadora: crea cosas con las manos. Dicen que hizo una silla tan linda que nadie se anima a sentarse. Ni ella.' },
    { id: 'sb2', look: 'vikingo2', name: 'Don Ernesto', x: 6, y: 18, dir: 'up', text: 'Las criaturas de Fuego, Agua y Planta se cuidan entre ellas como una familia rara. Se pelean, pero se quieren. Como cualquier familia.' },
    { id: 'edison', look: 'edison', name: 'Edison', x: 13, y: 11, dir: 'down', cond: POST, talk: () => S.edison() },
  ],
  finds: [{ x: 22, y: 2, item: 'inc_plant' }, { x: 1, y: 13, item: 'fragmento', hidden: true }],
});
registerMap('sb_studio', {
  name: 'Estudio de Tamara', inside: true, music: 'town', rows: studioRows(), entry: STUDIO_ENTRY, bg: 'stage',
  npcs: [
    { id: 'tamara', look: 'tamara', name: 'Tamara', x: 5, y: 2, dir: 'down', talk: () => S.tamara() },
    { id: 'sbaide', look: 'vikingo', name: 'Ayudante', x: 3, y: 6, dir: 'right', text: () => (flag('dip_foto') ? 'Tamara dijo que tu equipo tenía "buena composición". Es lo más lindo que le escuché decir. Y le escuché decir "qué lindo" a una piedra.' : 'Tamara te va a pedir equilibrio: una criatura de Fuego, una de Agua y una de Planta en tu equipo. En la Ruta 1 hay de todo si buscás en el pasto.') },
  ],
});
registerMap('sb_casa', {
  name: 'Casa de Storyboard', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'sbc', look: 'vikinga', name: 'Martina', x: 5, y: 2, move: 'wander', text: 'Gabriela pasó por acá corriendo. Dijo "¡voy a ser aprendiz del Rey!" y se llevó mi sándwich. Creo que fue sin querer. Creo.' }],
  finds: [{ x: 7, y: 1, item: 'tecito' }],
});
registerMap('sb_casa2', {
  name: 'Casa de Storyboard', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'sbc2', look: 'vikinga', name: 'Profe Inés', x: 3, y: 3, dir: 'down', talk: () => S.tablaTipos() }],
});
proaCenter('sb_proa', 'storyboard', STOCK2);

// =====================================================================
//  RUTA 2
// =====================================================================
registerMap('ruta2', {
  name: 'Ruta 2', music: 'route', bg: 'grass',
  rows: [
    'TTTTTTTT::TTTTTTTT',
    'TTTTTTTT::TTTTTTTT',
    'T.......::.....,,T',
    'T.,,,,..::.....,,T',
    'T.,,,,..::..r..,,T',
    'T.,,,,..::.......T',
    'T.......:::::....T',
    'TTTTT.......:..TTT',
    'T~~~T.......:....T',
    'T~~~~~~~~~~~=~~~~T',
    'T~~~~~~~~~~~=~~~~T',
    'T...,,,.....:....T',
    'T...,,,.....:.,,,T',
    'T...,,,.....:.,,,T',
    'T...........:.,,,T',
    'TTTT..TTTT..:....T',
    'T,,,........:....T',
    'T,,,...S....:..r.T',
    'T,,,........:....T',
    'T.....:::::::....T',
    'T.....:..........T',
    'Tvvvvv:vvvvvvvvvvT',
    'T.....:....,,,,..T',
    'T.ff..:....,,,,..T',
    'T.....:....,,,,..T',
    'T.....::::.......T',
    'T,,,,....:.......T',
    'T,,,,....:...TTTTT',
    'T,,,,....:.......T',
    'T........:...ff..T',
    'T.......::.......T',
    'T.......::.......T',
    'TTTTTTTT::TTTTTTTT',
    'TTTTTTTT::TTTTTTTT',
  ],
  links: { s: { to: 'storyboard', d: 3 }, n: { to: 'rodaje', d: 3 } },
  signs: [{ x: 7, y: 17, text: 'RUTA 2. Al norte: Cantera Rodaje. "Si no se ensucia, no es rodaje."' }],
  enc: { grass: [['lucierlaga', 8, 12, 22], ['doblecan', 8, 12, 20], ['claquetin', 9, 12, 18], ['palomiton', 8, 11, 15], ['rollin', 8, 11, 10], ['medusync', 9, 12, 10], ['salamandro', 9, 12, 5]] },
  npcs: [
    { id: 'r2a', look: 'chico', name: 'Cronista Juli', x: 10, y: 26, dir: 'left', trainer: { id: 'r2a', sight: 4, team: [['doblecan', 10], ['lucierlaga', 11]], money: 330, intro: '¡Voy a escribir sobre este combate! Título provisorio: "Juli gana".', lose: 'Cambio el título: "Juli aprende".', after: 'Ser cronista es contar lo que pasó, no lo que quería que pasara. Duele.' } },
    { id: 'r2b', look: 'marinero', name: 'Pescador Beto', x: 6, y: 8, dir: 'down', trainer: { id: 'r2b', sight: 2, team: [['pinguieson', 11], ['medusync', 11], ['ajolotin', 10]], money: 360, intro: '¡Picó algo! Ah, no, sos vos. Igual peleamos.', lose: 'Se me escapó el pez más grande: la victoria.', after: 'La paciencia es la mejor carnada.' } },
    { id: 'r2c', look: 'chica', name: 'Materializadora Sofi', x: 14, y: 14, dir: 'left', trainer: { id: 'r2c', sight: 3, team: [['claquetin', 11], ['hedroca', 12]], money: 380, intro: 'Hago utilería. Mis criaturas también: utilería de derrotas ajenas.', lose: 'Bueno, se me rompió la utilería.', after: 'Tamara me enseñó todo. Bueno, casi todo. Lo de perder lo aprendí sola.' } },
    { id: 'gab2', look: 'gabriela', name: 'Gabriela', x: 9, y: 3, dir: 'down', cond: () => flag('dip_foto') && !flag('tr_gab2'), talk: () => S.gabriela2() },
  ],
  events: [{ y: 5, cond: () => flag('dip_foto') && !flag('tr_gab2'), run: () => S.gabriela2() }],
  finds: [{ x: 1, y: 26, item: 'cristal', n: 3 }, { x: 16, y: 2, item: 'tecito' }, { x: 16, y: 28, item: 'cafe', n: 2 }, { x: 2, y: 3, item: 'fragmento', hidden: true }, { x: 15, y: 18, item: 'fragmento', hidden: true }],
});

// =====================================================================
//  CANTERA RODAJE
// =====================================================================
registerMap('rodaje', {
  name: 'Cantera Rodaje', music: 'town', bg: 'viking', theme: 'viking', ground: 'quarry',
  rows: [
    'rrrrrrrrrrr::rrrrrrrrrrr',
    'rrrrrrrrrrr:Frrrrrrrrrrr',
    'rEqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqq:qqqqr',
    'rqqqq:qqqqq::qqqqq:qqqqr',
    'rqqqq::::::::::::::qqqqr',
    'rqqrqqJqqqq::qqqqqqqrqqr',
    'rqqqqqqqSqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqqqqqqqq::qqqqqqqqqqr',
    'rqqqq:qqqqq::qqqqq:qqqqr',
    'rqqqq::::::::::::::qqqqr',
    'rqqrqqqqqqq::qqqqqqqqrqr',
    'rrrrrrrrrrr::rrrrrrrrrrr',
  ],
  border: 'r',
  links: { s: { to: 'ruta2', d: -3 }, n: { to: 'cueva', d: 0 } },
  buildings: [
    { x: 2, y: 3, w: 7, h: 5, kind: 'studio', to: 'rd_studio' },
    { x: 16, y: 3, w: 5, h: 4, kind: 'house', roof: '#a87040', to: 'rd_casa' },
    { x: 15, y: 12, w: 7, h: 4, kind: 'proa', to: 'rd_proa' },
    { x: 3, y: 12, w: 5, h: 4, kind: 'house', roof: '#707888', to: 'rd_casa2' },
  ],
  signs: [{ x: 8, y: 11, text: 'CANTERA RODAJE. Cantera del clan Rodaje: acá se pican las piedras de las runas. Gran salón de Luchito, cronista.' }],
  npcs: [
    { id: 'gate2', look: 'obrero', name: 'Capataz', x: 11, y: 1, dir: 'down', cond: () => !flag('dip_docu'), text: 'La Cueva Volcánica está al norte, pero sin el diploma Documental no pasa nadie. Ahí adentro hace un calor que te derrite las convicciones.' },
    { id: 'dante', look: 'dante', name: 'Dante', x: 14, y: 6, dir: 'down', talk: () => S.dante(), trainer: null },
    { id: 'gonchi', look: 'obrero', name: 'Gonchi', x: 9, y: 15, dir: 'right', talk: () => S.gonchi() },
    { id: 'rd1', look: 'vikingo2', name: 'Rocco', x: 19, y: 11, move: 'turn', text: 'Luchito anota todos los combates en un cuaderno. Dice que el amor lo es todo. Yo le pregunté "¿y la defensa?". Me miró feo.' },
  ],
  finds: [{ x: 22, y: 2, item: 'cristal', n: 2 }, { x: 1, y: 17, item: 'fragmento', hidden: true }, { x: 22, y: 17, item: 'fragoro', hidden: true }],
});
registerMap('rd_studio', {
  name: 'Estudio de Luchito', inside: true, music: 'town', rows: studioRows(), entry: STUDIO_ENTRY, bg: 'stage',
  npcs: [
    { id: 'luchito', look: 'luchito', name: 'Luchito', x: 5, y: 2, dir: 'down', talk: () => S.luchito() },
    { id: 'rdaide', look: 'peque_v', name: 'Aprendiz', x: 7, y: 5, dir: 'left', text: 'Un golpe superefectivo es cuando usás el tipo justo. Agua contra Fuego, Fuego contra Planta, Planta contra Agua... ¡y Hada contra Dragón! Luchito ama ese.' },
  ],
});
registerMap('rd_casa', {
  name: 'Casa de la cantera', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'rdc', look: 'viejo', name: 'Abuelo Ciro', x: 6, y: 3, dir: 'left', text: 'Dante viene a veces a tomar mate. No habla mucho. Pero cuando habla, te deja pensando una semana.' }],
  finds: [{ x: 1, y: 1, item: 'agua' }],
});
registerMap('rd_casa2', {
  name: 'Casa de la cantera', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'rdc2', look: 'vikinga', name: 'Vicky', x: 4, y: 2, move: 'wander', text: 'Encontré un Fragmento brillando en el suelo. Con tres te fabricás un Cristal en la terminal de la Proa. ¡Reciclaje mágico!' }],
});
proaCenter('rd_proa', 'rodaje', STOCK3);

// =====================================================================
//  CUEVA VOLCÁNICA
// =====================================================================
registerMap('cueva', {
  name: 'Cueva Volcánica', music: 'cave', bg: 'cave', kind: 'cave',
  rows: [
    'WWWWWWWWWWWccWWWWWWWWWWW',
    'WWWWWWWWWWWccWWWWWWWWWWW',
    'WccccWWWWWWccWWWWWccccxW',
    'WcccccccccccccccccccccxW',
    'WcxccWWWWWWWWWWWWWccccWW',
    'WcccWWWcccccccccWWWcccWW',
    'WcccWccccclllcccccWcccWW',
    'WcccWcccclllllccccWcccWW',
    'WcccWccccclllcccccWcccWW',
    'WcccWcccccccccccccWcccWW',
    'WcccWWWWWWWccWWWWWWcccWW',
    'WcccccccccccccccccccccxW',
    'WWWWWWWWccWWWWWWWWccccWW',
    'WxccccccccWWWoccccccccWW',
    'WcccccccccWWWcccWWWWWWWW',
    'WcccccWWWWWWWcccccccccxW',
    'WcccccWccccccccccccccccW',
    'WlllccWcccWWWWWWWWccWWWW',
    'WlllccccccWcccccccccccWW',
    'WWWWWWWWWWWccWWWWWWWWWWW',
    'WWWWWWWWWWWccWWWWWWWWWWW',
  ],
  border: 'W',
  links: { s: { to: 'rodaje', d: 0 }, n: { to: 'feria', d: 0 } },
  enc: { cave: [['salamandro', 15, 18, 22], ['gusarix', 15, 18, 22], ['tripodin', 16, 19, 15], ['claquetin', 15, 18, 18], ['wyvernito', 16, 18, 8], ['doblecan', 15, 18, 15]] },
  npcs: [
    { id: 'cv1', look: 'cientifica', name: 'Espeleóloga Mica', x: 8, y: 11, dir: 'right', trainer: { id: 'cv1', sight: 4, team: [['tripodin', 17], ['gusarix', 17]], money: 520, intro: '¡Estoy documentando la cueva! Vos sos parte del documental ahora.', lose: 'Bueno, el documental tiene un giro inesperado.', after: 'Hay cristales que crecen con el calor. Como las amistades. O los hongos.' } },
    { id: 'cv2', look: 'punk', name: 'Rebata Toto', x: 16, y: 16, dir: 'left', trainer: { id: 'cv2', sight: 4, team: [['salamandro', 17], ['doblecan', 18], ['claquetin', 17]], money: 540, intro: '¡¿QUÉ HACÉS EN MI CUEVA?! Bueno, no es mía. ¡¿QUÉ HACÉS EN LA CUEVA?!', lose: '¡PERDÍ! (se escucha el eco: perdí, perdí, perdí...)', after: 'El eco me hace sentir acompañado.' } },
    { id: 'cv3', look: 'obrero', name: 'Minero Paco', x: 3, y: 14, dir: 'right', text: 'Dicen que en esta cueva vive un dragoncito que muerde todo. Si lo encontrás, cuidá tus calcetines. Los Duendecillos ya se llevaron uno de cada par.' },
  ],
  finds: [{ x: 21, y: 2, item: 'guion' }, { x: 2, y: 13, item: 'cafedoble' }, { x: 4, y: 18, item: 'fragoro', hidden: true }, { x: 21, y: 15, item: 'cristal', n: 3 }, { x: 14, y: 18, item: 'fragmento', hidden: true }],
});

// =====================================================================
//  FERIA ÚLTIMA TOMA
// =====================================================================
registerMap('feria', {
  name: 'Feria Última Toma', music: 'town', bg: 'viking', theme: 'viking',
  rows: [
    'TTTTTTTTTTT::TTTTTTTTTTT',
    'TTTTTTTTTTT:FTTTTTTTTTTT',
    'T.f.......f++f.......f.T',
    'T..........++..........T',
    'T..........++..........T',
    'T..........++..........T',
    'T..........++..........T',
    'T..........++..........T',
    'T....+.....++.....+....T',
    'T....++++++++++++++....T',
    'T..J.+++++++++++++.....T',
    'T.f.....S++++++.......ET',
    'T....+++++++++++++.....T',
    'T..........++..........T',
    'T..........++..........T',
    'T..........++..........T',
    'T....+.....++.....+....T',
    'T....+++++++++++++++...T',
    'T.ff.......++.......ff.T',
    'TTTTTTTTTTT::TTTTTTTTTTT',
  ],
  links: { s: { to: 'cueva', d: 0 }, n: { to: 'ruta4', d: -3 } },
  buildings: [
    { x: 2, y: 3, w: 7, h: 5, kind: 'studio', to: 'ft_studio' },
    { x: 14, y: 3, w: 9, h: 5, kind: 'theater', to: 'ft_teatro' },
    { x: 15, y: 12, w: 7, h: 4, kind: 'proa', to: 'ft_proa' },
    { x: 3, y: 12, w: 5, h: 4, kind: 'house', roof: '#e870a0', to: 'ft_tutor' },
  ],
  signs: [{ x: 8, y: 11, text: 'FERIA ÚLTIMA TOMA. Feria de los clanes del norte: teatro, comida y la última toma de cada día. Gran salón de Andrea, pregonera.' }],
  npcs: [
    { id: 'gate3', look: 'vikingo', name: 'Asistente', x: 11, y: 1, dir: 'down', cond: () => !flag('dip_ficcion'), text: 'La salida al norte es solo para quienes tienen el diploma de Ficción. Andrea es muy estricta. Una vez me tomó examen por saludarla.' },
    { id: 'pachi', look: 'pachi', name: 'Pachi', x: 20, y: 9, dir: 'down', talk: () => S.pachiOut() },
    { id: 'andre_f', look: 'andre', name: 'André', x: 21, y: 9, dir: 'down', cond: POST, talk: () => S.andrePost() },
    { id: 'nahuel', look: 'nahuel', name: 'Nahuel', x: 22, y: 9, dir: 'left', cond: () => !POST(), talk: () => S.nahuel() },
    { id: 'ft1', look: 'cocinero', name: 'Puestero', x: 13, y: 11, dir: 'left', text: '¡Choripán de utilería! No, mentira, es de verdad. ¿Querés? No te puedo vender, no tengo licencia. Pero olelo.' },
    { id: 'ft2', look: 'vikinga', name: 'Romina', x: 9, y: 15, move: 'wander', text: 'Andrea quiere ser profe. Ya lo es, pero quiere que le digan "profe" en la calle. Decíselo y te sonríe.' },
    { id: 'ft3', look: 'peque_v', name: 'Benja', x: 20, y: 17, move: 'wander', text: '¡Pachi hace funciones de combate en el teatro! Peleás contra versiones de actuación de gente famosa. ¡Y no perdés nada si perdés!' },
  ],
  finds: [{ x: 22, y: 2, item: 'cristalest' }, { x: 1, y: 13, item: 'fragmento', hidden: true }],
});
registerMap('ft_studio', {
  name: 'Estudio de Andrea', inside: true, music: 'town', rows: studioRows(), entry: STUDIO_ENTRY, bg: 'stage',
  npcs: [
    { id: 'andrea', look: 'andrea', name: 'Andrea', x: 5, y: 2, dir: 'down', talk: () => S.andrea() },
    { id: 'ftaide', look: 'peque_v', name: 'Alumna', x: 8, y: 5, dir: 'left', text: 'La profe Andrea pregunta cosas del reino. Si hablaste con la gente en el viaje, vas a estar bien. Si no... suerte.' },
  ],
});
registerMap('ft_teatro', {
  name: 'Teatro de la Feria', inside: true, music: 'town', bg: 'stage',
  rows: ['ZZZZZZZZZZZZZ', 'zzzzzzzzzzzzz', 'zzzzzzzzzzzzz', 'nnnnnnnnnnnnn', 'nsssssnsssssn', 'nnnnnnnnnnnnn', 'nsssssnsssssn', 'nnnnnnnnnnnnn', 'nnnnnnmnnnnnn'],
  entry: { x: 6, y: 7 },
  npcs: [
    { id: 'pachi_t', look: 'pachi', name: 'Pachi', x: 6, y: 2, dir: 'down', talk: () => S.teatro() },
    { id: 'ftv', look: 'actor', name: 'Actor', x: 2, y: 1, dir: 'right', text: 'Ser o no ser... un buen rival. Esa es la cuestión.' },
  ],
});
registerMap('ft_tutor', {
  name: 'Casa del Profe de Doblaje', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'tutor', look: 'actor', name: 'Profe de Doblaje', x: 4, y: 2, dir: 'down', talk: () => S.tutor() }],
});
proaCenter('ft_proa', 'feria', STOCK4);

// =====================================================================
//  RUTA 4
// =====================================================================
registerMap('ruta4', {
  name: 'Ruta 4', music: 'route', bg: 'grass',
  rows: [
    'TTTTTTTT::TTTTTTTT',
    'TTTTTTTT::TTTTTTTT',
    'Tff,,,..::..,,,ffT',
    'Tf,,,,..::..,,,,fT',
    'T..,,,..::..,,,..T',
    'T.......::.......T',
    'T~~~~...::...~~~~T',
    'T~~~~...::...~~~~T',
    'T~~~~~~~==~~~~~~~T',
    'T~~~~~~~==~~~~~~~T',
    'T.......::.......T',
    'Tf,,,,..::..S....T',
    'Tf,,,,..::...,,,,T',
    'T..,,,..:::::,,,,T',
    'T.......f..:.,,,,T',
    'TTTTT...f..:.....T',
    'T,,,,,.....:.ff..T',
    'T,,,,,.....:.....T',
    'T......::::::....T',
    'Tvvvvvv:vvvvvvvvvT',
    'T......:.,,,,,,..T',
    'Tff....:.,,,,,,..T',
    'T......:.,,,,,,..T',
    'T..TT..::::......T',
    'T..TT.....:...fffT',
    'T,,,,,....:...,,,T',
    'T,,,,,....:...,,,T',
    'T.......:::......T',
    'T.......::.......T',
    'TTTTTTTT::TTTTTTTT',
  ],
  links: { s: { to: 'feria', d: 3 }, n: { to: 'montaje', d: 3 } },
  signs: [{ x: 12, y: 11, text: 'RUTA 4. Al norte: Prados Montaje. "Lo que no se ve, también cuenta."' }],
  enc: { grass: [['zumbaflor', 22, 26, 20], ['medusync', 22, 25, 14], ['pinguieson', 22, 25, 12], ['hedroca', 22, 25, 12], ['duendecillo', 23, 26, 14], ['lucierlaga', 22, 25, 14], ['longbao', 24, 27, 6], ['flamigaro', 24, 27, 8]] },
  npcs: [
    { id: 'r4a', look: 'dama', name: 'Pregonera Vale', x: 5, y: 22, dir: 'right', trainer: { id: 'r4a', sight: 4, team: [['zumbaflor', 23], ['medusync', 24]], money: 720, intro: '¡Escuchen, escuchen! ¡Un combate está por empezar! ...Ah, soy yo. ¡Escuchen!', lose: '¡Escuchen! ¡Perdí! Bueno, no escuchen.', after: 'Ser pregonera es decir las noticias. Hoy la noticia sos vos.' } },
    { id: 'r4b', look: 'chico', name: 'Brandcut Nico', x: 13, y: 16, dir: 'left', trainer: { id: 'r4b', sight: 3, team: [['doblecan', 23], ['palomaiz', 24], ['claquetin', 24]], money: 740, intro: '¡Ya soy de Brandcut! Me dieron el gafete. Es de cartón, pero es mío.', lose: 'Primera regla de Brandcut: no hablar de la derrota. Ok, ya hablé.', after: 'Brandcut es la siguiente generación. Inexpertos pero con ganas. Como vos, pero con gafete.' } },
    { id: 'r4c', look: 'cocinero', name: 'Cocinero Lalo', x: 3, y: 3, dir: 'down', trainer: { id: 'r4c', sight: 3, team: [['pinguichef', 25], ['longbao', 25]], money: 780, intro: '¡Te voy a cocinar! Metafóricamente. Soy vegetariano.', lose: 'Se me quemó el combate.', after: 'El secreto de la cocina es el amor. Y la sal. Mucho amor y un poco de sal.' } },
    { id: 'chisme1', look: 'vieja', name: 'Vecina Chela', x: 15, y: 5, dir: 'down', talk: () => S.chisme(1), mark: () => flag('libreta') && !flag('chisme1') },
  ],
  finds: [{ x: 16, y: 21, item: 'cafedoble' }, { x: 1, y: 16, item: 'cristal', n: 3 }, { x: 15, y: 24, item: 'fragoro', hidden: true }, { x: 1, y: 2, item: 'guion', hidden: true }],
});

// =====================================================================
//  PRADOS MONTAJE
// =====================================================================
registerMap('montaje', {
  name: 'Prados Montaje', music: 'town', bg: 'native', theme: 'native',
  rows: [
    'TTTTTTTTTTT::TTTTTTTTTTT',
    'TTTTTTTTTTT:FTTTTTTTTTTT',
    'T.f.......f::f.........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T....:.....::.......:..T',
    'T....::::::::::::::::..T',
    'T.f........::...J..f...T',
    'T.......S..::..........T',
    'T....f.....::.....f....T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T..........::..........T',
    'T....:.....::.....:....T',
    'T....:::::::::::::::...T',
    'T.ff..fNNN.::.......ff.T',
    'Tfff...NNN.::.....f.fffT',
    'TTTTTTTTTTT::TTTTTTTTTTT',
  ],
  links: { s: { to: 'ruta4', d: -3 }, n: { to: 'ruta5', d: -4 } },
  buildings: [
    { x: 2, y: 3, w: 7, h: 5, kind: 'studio', to: 'pm_studio' },
    { x: 18, y: 2, w: 5, h: 7, kind: 'tower', to: 'torre1' },
    { x: 15, y: 13, w: 7, h: 4, kind: 'proa', to: 'pm_proa' },
    { x: 3, y: 13, w: 5, h: 4, kind: 'house', roof: '#58a0a0', to: 'pm_casa' },
    { x: 14, y: 4, w: 3, h: 3, kind: 'wigwam' },
  ],
  signs: [{ x: 8, y: 11, text: 'PRADOS MONTAJE. Aquí la gente de los prados y los colonos de casaca roja comparten la cosecha desde hace generaciones. "Todo cobra sentido en la edición." Al noreste: Torre P.A.' }],
  npcs: [
    { id: 'gate4', look: 'soldado', name: 'Asistente', x: 11, y: 1, dir: 'down', cond: () => !flag('dip_publi'), text: 'Al norte está la Ruta 5 y después el Castillo Difusión. Sin el diploma de Publicidad no te dejo. Nadie entra al castillo sin una buena campaña.' },
    { id: 'towerguard', look: 'soldado', name: 'Guardia', x: 20, y: 9, dir: 'down', cond: () => !POST(), text: 'La Torre P.A. está cerrada. Solo entran quienes vencieron al Rey. O los técnicos de sonido. ¿Sos técnico de sonido? No, se nota.' },
    { id: 'chrys', look: 'chrys', name: 'Chrys', x: 14, y: 11, dir: 'down', talk: () => S.chrys() },
    { id: 'oscar', look: 'oscar', name: 'Oscar', x: 3, y: 10, dir: 'right', talk: () => S.oscar() },
    { id: 'piero', look: 'piero', name: 'Piero', x: 4, y: 10, dir: 'left', talk: () => S.piero() },
    { id: 'chisme2', look: 'nativa', name: 'Fiorella', x: 18, y: 18, dir: 'left', talk: () => S.chisme(2), mark: () => flag('libreta') && !flag('chisme2') },
    { id: 'alejandro', look: 'alejandro', name: 'Alejandro', x: 16, y: 7, dir: 'down', talk: () => S.alejandro() },
    { id: 'nahuel_m', look: 'nahuel', name: 'Nahuel', x: 17, y: 7, dir: 'left', cond: POST, talk: () => S.nahuelPost() },
    { id: 'tomas', look: 'soldado', name: 'Cabo Tomás', x: 9, y: 15, dir: 'right', talk: () => S.tomas() },
    { id: 'nina', look: 'nativa', name: 'Nina', x: 10, y: 15, dir: 'left', talk: () => S.nina() },
    { id: 'chisme3', look: 'kid', name: 'Teo', x: 21, y: 11, move: 'wander', talk: () => S.chisme(3), mark: () => flag('libreta') && !flag('chisme3') },
  ],
  finds: [{ x: 22, y: 19, item: 'tomados' }, { x: 1, y: 2, item: 'fragmento', hidden: true }],
});
registerMap('pm_studio', {
  name: 'Estudio de Dan', inside: true, music: 'town', rows: studioRows(), entry: STUDIO_ENTRY, bg: 'stage',
  npcs: [
    { id: 'dan', look: 'dan', name: 'Dan', x: 5, y: 2, dir: 'down', talk: () => S.dan() },
    { id: 'pmaide', look: 'nativo', name: 'Editor', x: 2, y: 5, dir: 'right', text: 'Dan dice que montar es elegir qué contar. Por eso le encantan los chismes: son historias sin editar.' },
  ],
});
registerMap('pm_casa', {
  name: 'Casa de los prados', inside: true, music: 'town', rows: houseRows(), entry: HOUSE_ENTRY,
  npcs: [{ id: 'pmc', look: 'anciana_n', name: 'Abuela Nené', x: 6, y: 3, dir: 'left', talk: () => S.abuelaNene() }],
});
proaCenter('pm_proa', 'montaje', STOCK5);

// =====================================================================
//  RUTA 5 + CASTILLO DIFUSIÓN
// =====================================================================
registerMap('ruta5', {
  name: 'Ruta 5', music: 'route', bg: 'andes', theme: 'inca',
  rows: [
    'YYYYYYYYYYYYYYYY',
    'YY...........YYY',
    'Y.............YY',
    'Y..............Y',
    'Y..............Y',
    'Y..............Y',
    'Y..............Y',
    'Y....g.:.g.....Y',
    'Y,,,...:...,,,,Y',
    'Y,,,,..:...,,,,Y',
    'Y,,,,..:::.,,,,Y',
    'Y.........:....Y',
    'YYYY......:..YYY',
    'Y,,,,,....:....Y',
    'Y,,,,,..S.:....Y',
    'Y,,,,,....:.,,,Y',
    'Y.....::::::,,,Y',
    'Y.....:.....,,,Y',
    'Yvvvvv:vvvvvvvvY',
    'Y.....:........Y',
    'Y.,,,,:,,,,....Y',
    'Y.,,,,:,,,,.YY.Y',
    'Y.,,,,:,,,,.YY.Y',
    'Y.....:........Y',
    'Y.....::::.....Y',
    'Y,,,.....:..,,,Y',
    'Y,,,.....:..,,,Y',
    'Y......:::.....Y',
    'Y......::......Y',
    'YYYYYYY::YYYYYYY',
  ],
  border: 'Y',
  links: { s: { to: 'montaje', d: 4 } },
  buildings: [{ x: 2, y: 0, w: 11, h: 7, kind: 'castle', to: 'castillo' }],
  signs: [{ x: 8, y: 14, text: 'RUTA 5. Tramo del Qhapaq Ñan, el gran camino del Inca. Al final: el Castillo Difusión del Rey Navarrete.' }],
  enc: { grass: [['wyvernito', 30, 34, 14], ['boomguru', 31, 35, 16], ['espinardo', 31, 35, 16], ['tripodin', 31, 34, 14], ['dobleriesgo', 32, 35, 12], ['hedroble', 31, 34, 12], ['serafox', 33, 36, 4], ['flamigaro', 31, 34, 12]] },
  npcs: [
    { id: 'r5a', look: 'vieja', name: 'Veterana CTM Rosa', x: 12, y: 20, dir: 'left', trainer: { id: 'r5a', sight: 4, team: [['glaciolote', 33], ['alquimero', 33]], money: 1100, intro: 'Los CTM somos veteranos. Hicimos esto antes de que vos nacieras. Bueno, no tanto. Pero casi.', lose: 'Bien, bien. Tenés oficio.', after: 'La experiencia no se compra. Se pierde peleando, como ahora.' } },
    { id: 'r5b', look: 'actor', name: 'Outsider ???', x: 4, y: 12, dir: 'right', trainer: { id: 'r5b', sight: 4, team: [['duendecillo', 33], ['tripodin', 34], ['serafox', 33]], money: 1200, intro: '...No conozco a nadie. Nadie me conoce. Peleemos sin presentarnos.', lose: '...Igual no me presento.', after: 'Los Outsiders no tenemos conexión con nadie. Es tranquilo. A veces, demasiado.' } },
    { id: 'r5c', look: 'punk', name: 'Monas Fan Club', x: 13, y: 4, dir: 'left', trainer: { id: 'r5c', sight: 3, team: [['zumbaccino', 34], ['medubass', 34], ['lucilente', 35]], money: 1250, intro: '¡Las Monas son inseparables y de alta fidelidad! Yo soy su fan número uno. Y dos. Y tres.', lose: 'Las Monas me van a consolar. En mi imaginación.', after: 'Algún día voy a formar mi propio grupo inseparable. Ya tengo el nombre. Me falta la gente.' } },
    { id: 'gab3', look: 'gabriela', name: 'Gabriela', x: 7, y: 8, dir: 'down', cond: () => !flag('tr_gab3'), talk: () => S.gabriela3() },
  ],
  events: [{ y: 11, cond: () => !flag('tr_gab3'), run: () => S.gabriela3() }],
  finds: [{ x: 14, y: 3, item: 'cafetera' }, { x: 1, y: 25, item: 'cristalest', n: 2 }, { x: 14, y: 22, item: 'guion', hidden: true }],
});
registerMap('castillo', {
  name: 'Castillo Difusión', inside: true, music: 'andes', bg: 'inca', theme: 'inca',
  rows: [
    'KKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKPkkRkkPKKKKKKK',
    'KKKKKKKkkkRkkkKKKKKKK',
    'KKKKKKKPkkRkkPKKKKKKK',
    'KKKKKKKKKKDKKKKKKKKKK',
    'KkkkkkKkkkRkkkKkkkkkK',
    'KkkkkkKPkkRkkPKkkkkkK',
    'KkkkkkkkkkRkkkkkkkkkK',
    'KkkkkkKPkkRkkPKkkkkkK',
    'KkkkkkKkkkRkkkKkkkkkK',
    'KKKKKKKkkkRkkkKKKKKKK',
    'KKKKKKKPkkRkkPKKKKKKK',
    'KKKKKKKkkkRkkkKKKKKKK',
    'KKKKKKKkkkRkkkKKKKKKK',
    'KKKKKKKkkkmkkkKKKKKKK',
  ],
  entry: { x: 10, y: 13 },
  npcs: [
    { id: 'andre', look: 'andre', name: 'André', x: 3, y: 7, dir: 'right', cond: () => !POST(), talk: () => S.andreCastle() },
    { id: 'yam', look: 'yam', name: 'Yam', x: 17, y: 7, dir: 'left', cond: () => !POST() || true, talk: () => S.yam() },
    { id: 'rey', look: 'rey', name: 'Rey Navarrete', x: 10, y: 1, dir: 'down', talk: () => S.rey() },
    { id: 'guardia_c', look: 'incaguard', name: 'Guardia', x: 8, y: 12, dir: 'right', text: () => (POST() ? 'El Rey está de buen humor desde que perdió. Dice que se aburría de ganar. Mentira, lloró dos días.' : 'Bienvenido al Castillo Difusión. A la izquierda, André. A la derecha, Yam. Arriba, el Rey. Y en el medio, tus nervios.') },
  ],
});

// =====================================================================
//  TORRE P.A. (post-juego): 5 pisos generados
// =====================================================================
const TOWER = [
  { name: 'Técnico Fede', look: 'asistente', team: [['tripodin', 45], ['claqueton', 46], ['boomguru', 46]], intro: '¡Probando, probando! Uno, dos... ¡combate!' },
  { name: 'Las Monas', look: 'dama', team: [['zumbaccino', 47], ['medubass', 47], ['lucilente', 48], ['duendecillo', 47]], intro: 'Somos inseparables y de alta fidelidad. Hoy, de alta fidelidad a la victoria.' },
  { name: 'Los Rebata', look: 'punk', team: [['espinardo', 48], ['dobleriesgo', 49], ['alquimero', 48], ['wyvernax', 49]], intro: '¡¡¡LOS REBATA EN LA TORRE!!! ¡¡¡QUÉ RUIDO!!!' },
  { name: 'Los Proas', look: 'viejo', team: [['inferpavo', 50], ['glaciolote', 50], ['gorilegend', 50], ['crisalmanza', 51]], intro: 'Somos los Proas. Malhumorados pero sabios. Hoy, solo malhumorados.' },
  { name: 'Edison', look: 'edison', team: [['wyvernax', 53], ['serafox', 53], ['claqueton', 53], ['inferpavo', 54], ['glaciolote', 54], ['gorilegend', 55]], intro: 'La Torre P.A. transmite a todo el reino. Lo que pase acá, lo escucha todo el mundo. Así que... ¡que suene bien!' },
];
for (let i = 1; i <= 5; i++) {
  const t = TOWER[i - 1];
  const rows = ['KKKKK^KKKKK', 'KkkkkkkkkkK', 'KkPkkRkkPkK', 'KkkkkRkkkkK', 'KkkkkRkkkkK', 'KkPkkRkkPkK', 'KkkkkRkkkkK', 'KkkkkRkkkkK', 'KkkkkRkkkkK', i === 1 ? 'KKKKKmKKKKK' : 'KKKKKkKKKKK'];
  registerMap('torre' + i, {
    name: 'Torre P.A. — Piso ' + i, inside: true, music: i === 5 ? 'king' : 'castle', bg: 'tower', rows, entry: { x: 5, y: 8 },
    warps: i < 5 ? [{ x: 5, y: 0, to: 'torre' + (i + 1), tx: 5, ty: 8, dir: 'up' }] : [{ x: 5, y: 0, to: 'torre_top', tx: 5, ty: 6, dir: 'up' }],
    events: [],
    npcs: [{ id: 'tw' + i, look: t.look, name: t.name, x: 5, y: 3, dir: 'down', trainer: { id: 'tw' + i, sight: 4, team: t.team, money: 2000 + i * 400, intro: t.intro, lose: 'La torre suena distinto con vos arriba.', after: 'Seguí subiendo. Arriba se escucha mejor.', bg: 'tower' } }],
  });
  if (i > 1) { MAPS['torre' + i].rows[9] = 'KKKKK^KKKKK'; MAPS['torre' + i].warps.push({ x: 5, y: 9, to: 'torre' + (i - 1), tx: 5, ty: 1, dir: 'down' }); }
}
registerMap('torre_top', {
  name: 'Azotea de la Torre P.A.', inside: true, music: 'castle', bg: 'tower',
  rows: ['KKKKKKKKKKK', 'KkkkkkkkkkK', 'KkkkkkkkkkK', 'KkkkkkkkkkK', 'KkkkkkkkkkK', 'KkkkkkkkkkK', 'KkkkkkkkkkK', 'KKKKKmKKKKK'],
  entry: { x: 5, y: 6 },
  npcs: [{ id: 'taquillon', mon: 'taquillon', name: 'Taquillón', x: 5, y: 2, dir: 'down', cond: () => !flag('taquillon'), talk: () => S.taquillon() }],
});
MAPS.torre_top.out = { map: 'montaje', x: 20, y: 9 };
