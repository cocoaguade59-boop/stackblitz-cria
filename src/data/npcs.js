// Datos de NPCs del mundo, cuevas, castillo + Edison + parejas + diálogos de boss/torre.
// Extraído de script.js (BLOQUE 10A) para achicar el entrypoint.
// Solo datos (y equipos preconstruidos con Cre) — no toca G.scr
// (seguro frente al bug double-G de StackBlitz).

import { Cre } from '../entities/creature.js';
import { CC } from '../core/world-constants.js';

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
    tp: 'alexandro',
    nm: 'Alexandro',
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
    flag: 'metAlexandro',
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
        'Alexandro dice que corra con Z.',
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
      [
        'También puedo mejorar tu mochila.',
        'Crafting portátil de cristales...',
        '¡pero cuesta 2000G! Inversión seria.',
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
        '🐉 Dragón vence a sí mismo,',
        'pero no puede herir a 🧚 Hada.',
        '🧚 Hada vence a 🐉 Dragón.',
      ],
      [
        '🥊 Lucha vence a ⚪ Normal',
        'y a ⚙️ Acero, pero 🧚 Hada',
        'resiste los golpes de Lucha.',
      ],
      [
        '⚙️ Acero vence a 🧚 Hada.',
        'Pero 🔥 Fuego y 🥊 Lucha',
        'son muy peligrosos para Acero.',
      ],
      [
        '⚪ Normal no hiere mucho a',
        '⚙️ Acero. ¡Conocer los tipos',
        'puede decidir una batalla!',
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
        'Tenía un espectáculo preparado...',
        'pero me hace falta mi compañero.',
        'Aun así... ¿ensayamos una escena?',
      ],
      [
        'Puedo representar combates',
        'que no verás en el mapa:',
        'Alessandro, Fabiana, SaloGon...',
      ],
      [
        'André es el hombre más',
        'hermoso de su pueblo.',
        '¡Y le pusieron una máscara!',
      ],
    ],
    postDlg: [
      '¡Todo listo para ver el espectáculo!',
      'Mi hermano André es libre...',
      '¡Y la cartelera está completa!',
    ],
    flag: 'metPac',
    // Combate directo desactivado: el flujo es el Teatro (T9).
    // Sigue en batallador vía fixedTeam.
    battle: false,
    battleIntro: ['¡ACTO TERCERO!', '¡La batalla comienza!'],
    fixedTeam: [{ id: 'eastern' }, { id: 'pixie' }],
    theaterHost: 'pachi',
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
        '¡Correo del Reino!',
        'Entregá 2 objetos y te mando',
        '1 al azar... ¿suerte?',
      ],
      [
        'Puede salir mejor o peor.',
        'Así es el correo, amigo.',
        '¡Nada de reclamos!',
      ],
      [
        'Ten cuidado con la chica',
        'de harapos en Aldea Pitch.',
        'Esa mujer me da miedo.',
      ],
    ],
    postDlg: [
      '¿La chica de harapos?',
      'Ahora está... peor.',
      'El correo sigue abierto.',
    ],
    flag: 'metGon',
    // T10: trueque random (ya no givesItem gratis)
    trade: true,
    battle: true,
    exterior: true,
    battleIntro: ['¡Primero el correo!', '¡Ahora sí, luchemos!'],
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
    postOnly: true, // solo en Rodaje tras el rescate (post-game)
    dlg: [
      [
        'La máscara sigue aquí...',
        'Pero el peso se siente distinto.',
        '¿Querés ver un ensayo de jefes?',
      ],
    ],
    postDlg: [
      'Puedo simular a los Proas',
      'y al Rey... como eran antes.',
      'Aspecto pre-game. Sin diplomas.',
      '¿Subís al escenario?',
    ],
    flag: 'metAnd',
    // Teatro de jefes (T9). Pelea directa en batallador.
    battle: false,
    battleIntro: ['Esta máscara pesa...', 'Pero mis criaturas no.'],
    fixedTeam: [{ id: 'serpentdrg' }, { id: 'gorilan' }],
    theaterHost: 'andre',
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
        'Puedo enseñarle movimientos',
        'a tus criaturas. Traé',
        '2 Pergaminos de Batalla.',
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
    // Tutor T8: la pelea queda disponible en batallador; en mundo el flujo es enseñanza.
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
    // Yam guarda la puerta cerrada del trono. Está en la sala este.
    x: 22,
    y: 16,
    tp: 'yam',
    nm: 'Yam la Carcelera',
    // Diálogo cuando NO derrotaste a André/Ravell: no pelea, te manda al otro
    preReqDlg: [[
      '¡¡¡HEY!!! ¿¡¡TÚ AQUÍ!!?',
      '¡¡¡Primero derrota a mi HERMANO',
      'en el ala OESTE!!!',
      '¡¡¡Sin eso NO PIERDO MI TIEMPO!!!',
    ]],
    preReqFlags: ['metAndreCastle', 'metRavellCastle'],
    dlg: [[
      '¡¡¡ALTO AHÍ!!!',
      '¡¡¡Soy Yam, la CARCELERA!!!',
      '¡¡¡Tengo la LLAVE del Rey!!!',
      '¿¡¡Crees poder QUITÁRMELA?!!',
    ]],
    postDlg: ['¡¡¡MAGNÍFICO!!!', '¡¡¡OTRA VEZ!!!', '¡¡¡ME ENCANTA!!!'],
    battle: true,
    battleIntro: [
      '¡¡¡NADIE PASA A VER AL REY!!!',
      '¡¡¡SIN VENCERME PRIMERO!!!',
    ],
    // Guardiana del rey: criaturas evolucionadas al máximo
    team: [
      new Cre('inferpavo', 40),   // Flameye final form
      new Cre('espinardoom', 40), // Thornbuck final form
      new Cre('wyvernlord', 42),  // Wyvern final form
    ],
    flag: 'metYamCastle',
  },

  {
    // André en la sala oeste (primer combate obligatorio antes de Yam)
    x: 7,
    y: 16,
    tp: 'andre',
    nm: 'André',
    preOnly: true,
    dlg: [
      [
        '...Esta máscara pesa.',
        'Pachi está afuera...',
        'y yo sigo aquí.',
        'Vigilo la entrada al Rey.',
        'Para pasarme necesitarás fuerza.',
      ],
    ],
    battle: true,
    battleIntro: [
      'No puedo salir todavía...',
      'pero sí puedo pelear.',
      '¡Prepárate para el silencio!',
    ],
    // Primer filtro serio antes de Yam
    team: [
      new Cre('serpentboss', 35),
      new Cre('gorilegend', 35),
      new Cre('ornisagent', 38),
    ],
    flag: 'metAndreCastle',
  },

  {
    // Ravell reemplaza a André en post-game, misma posición
    x: 7,
    y: 16,
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
    // Post-game: aún más fuerte que André
    team: [
      new Cre('sidhearia', 42),
      new Cre('glaciolote', 42),
      new Cre('lucistrella', 44),
    ],
    flag: 'metRavellCastle',
  },

  {
    // Rey al fondo de la sala del trono (norte del castillo)
    x: 15,
    y: 4,
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

// [refactor-phase5c] shopLore movido a src/screens/shop.js

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


export {
  npcs,
  caveNpcs,
  castNpcs,
  edisonNPC,
  pairBattleData,
  bossDialogues,
  endDialogue,
  castleBlockedDlg,
  towerBlockedDlg,
};
