// Cartelera del Teatro del Reino (T9).
// Pachi: representaciones de combates que NO ocurren en el mapa
//        (NPCs sin batalla de mundo, exclusivos de batallador, etc.).
// André (post-rescate / post-game en Rodaje): jefes con aspecto PRE-GAME
//        (Proas + Rey Navarrete).
//
// Solo datos. La lógica de pelea vive en game.js (startTheaterBattle).

/** Peleas que Pachi puede representar (pre y post). */
const PACHI_BILL = [
  {
    id: 'ales',
    nm: 'Alessandro',
    tp: 'alessandro',
    blurb: 'El guerrero de Pitch… ¡aunque no pelea en el mapa!',
    intro: ['¡Velocidad es poder!', '¡A pelear!'],
    team: [{ id: 'ivygoat' }, { id: 'pinzardo' }],
  },
  {
    id: 'fab',
    nm: 'Fabiana',
    tp: 'fabiana',
    blurb: 'Arte y fragmentos… y un combate de ensayo.',
    intro: ['¡Hagamos algo de arte!', '¡Con criaturas!'],
    team: [{ id: 'pixie' }, { id: 'zumbaflor' }],
  },
  {
    id: 'cla',
    nm: 'Claudia',
    tp: 'claudia',
    blurb: '¡Ahorrá… en PP! Combate de ensayo.',
    intro: ['Cada combate da oro.', '¡Y este también!'],
    team: [{ id: 'axolotl' }, { id: 'hedroca' }],
  },
  {
    id: 'salo',
    nm: 'SaloGon',
    tp: 'salogon',
    blurb: 'El vidente no pelea en la cueva… aquí sí, en escena.',
    intro: ['Los cristales recuerdan combates.', '¡Representemos uno!'],
    team: [{ id: 'sidhe' }, { id: 'glaciolote' }, { id: 'pixie' }],
  },
  {
    id: 'luis',
    nm: 'Luis',
    tp: 'luis',
    blurb: 'Tutorial con filo de ensayo.',
    intro: ['¡Como en el entrenamiento!', '¡Pero de verdad!'],
    team: [{ id: 'flameye' }, { id: 'gorilan' }],
  },
  {
    id: 'paulo',
    nm: 'Paulo',
    tp: 'paulo',
    blurb: 'Teoría de tipos… puesta en escena.',
    intro: ['La práctica supera a la teoría.', '¡Demostración!'],
    team: [{ id: 'ivygoat' }, { id: 'flameye' }],
  },
];

/** Jefes que André simula con aspecto PRE-GAME (post-rescate). */
const ANDRE_BILL = [
  {
    id: 'tamara',
    nm: 'Tamara (Proa)',
    tp: 'tamara',
    blurb: 'Líder de Storyboard · aspecto pre-game',
    intro: ['La armonía del set…', '¡Ensayemos!'],
    team: [{ id: 'flamcrest' }, { id: 'axolotl' }, { id: 'ivygoat' }],
    bossLv: false,
  },
  {
    id: 'luchito',
    nm: 'Luchito (Proa)',
    tp: 'luchito',
    blurb: 'Líder de Rodaje · aspecto pre-game',
    intro: ['Porque te amo…', '¡Pelea de ensayo!'],
    team: [{ id: 'flamingo' }, { id: 'glaciolote' }, { id: 'gorilan' }],
    bossLv: false,
  },
  {
    id: 'andrea',
    nm: 'Andrea (Proa)',
    tp: 'andrea',
    blurb: 'Líder de Última Toma · aspecto pre-game',
    intro: ['Lección especial:', '¡nunca subestimes el teatro!'],
    team: [{ id: 'medusync' }, { id: 'spritefly' }, { id: 'thornbuck' }],
    bossLv: false,
  },
  {
    id: 'dan',
    nm: 'Dan (Proa)',
    tp: 'dan',
    blurb: 'Líder de Montaje · aspecto pre-game',
    intro: ['Cámara, acción…', '¡combate de ensayo!'],
    team: [{ id: 'ajolord' }, { id: 'pixie' }, { id: 'hedroble' }],
    bossLv: false,
  },
  {
    id: 'navarrete',
    nm: 'Rey Navarrete',
    tp: 'boss',
    blurb: 'El Rey · simulación pre-game (sin abrir torre)',
    intro: ['...Ah. Otro retador.', '*bostezo*', 'Veamos si vales la pena.'],
    // Equipo del boss real; niveles se escalan en startTheaterBattle
    team: [
      { id: 'emberwing' },
      { id: 'glaciolote' },
      { id: 'thornbuck' },
      { id: 'gusarix' },
      { id: 'zumbaflor' },
    ],
    bossLv: true,
  },
];

export { PACHI_BILL, ANDRE_BILL };
