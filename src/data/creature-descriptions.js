// Descripciones largas (flavor text) de cada criatura.
// Datos puros, sin dependencias.
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

export { CRE_DESC };
