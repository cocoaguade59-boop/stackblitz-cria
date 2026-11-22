'use strict';
// =====================================================================
//  HISTORIA: diálogos, desafíos de los líderes, castillo y post-juego
// =====================================================================
const STARTERS = ['flameye', 'ajolotin', 'gorilan'];
const GAB_PICK = { flameye: 'gorilan', ajolotin: 'flameye', gorilan: 'ajolotin' };
const FINAL = { flameye: ['flamcrest', 'inferpavo'], ajolotin: ['ajolord', 'glaciolote'], gorilan: ['gorilirico', 'gorilegend'] };
const maxLv = () => Math.max(...G.party.map((m) => m.lv));
const leader = (o) => ({ leader: true, ...o });

// ---------- objetivo actual (se ve en la Claqueta) ----------
function currentObjective() {
  if (!G) return '';
  if (!flag('starter')) return 'Entra a la casa de Alessandro (arriba a la izquierda).';
  if (!flag('dip_foto')) {
    const has = (t) => G.party.some((m) => m.type === t);
    if (!flag('tamaraMet')) return 'Viaja al norte por la Ruta 1 hasta Villa Storyboard.';
    return 'Tamara pide Fuego, Agua y Planta en tu equipo. Tienes: ' + ['fire', 'water', 'plant'].map((t) => (has(t) ? '✓' : '✗') + TYPES[t].n).join(' ');
  }
  if (!flag('tr_gab2')) return 'Gabriela te espera en la Ruta 2, al norte de Storyboard.';
  if (!flag('dip_docu')) {
    if (!flag('luchitoActive')) return 'Llega a Cantera Rodaje y habla con Luchito, el cronista.';
    const h = Math.min(3, G.flags.luchitoHits || 0);
    return h >= 3 ? '¡Ya tienes 3 golpes superefectivos! Vuelve con Luchito.' : 'Conecta golpes superefectivos para Luchito: ' + h + '/3.';
  }
  if (!flag('dip_ficcion')) return flag('andreaMet') ? 'Prepárate para el examen de Andrea. Habla con la gente del reino.' : 'Cruza la Cueva Volcánica hasta Feria Última Toma.';
  if (!flag('dip_publi')) {
    if (!flag('libreta')) return 'Sigue por la Ruta 4 hasta Prados Montaje y visita a Dan.';
    const n = [1, 2, 3].filter((i) => flag('chisme' + i)).length;
    return n >= 3 ? '¡Tienes los 3 chismes! Llévaselos a Dan.' : 'Junta chismes para Dan: ' + n + '/3. Busca a los que tienen "!" encima.';
  }
  if (!flag('campeon')) {
    if (!flag('tr_andre')) return 'Sube por la Ruta 5 al Castillo Difusión. André te espera en el ala oeste.';
    if (!hasItem('llave')) return 'Yam guarda la Llave del Rey en el ala este del castillo.';
    return 'Abre la puerta del trono. El Rey Navarrete te espera.';
  }
  if (flag('teja_pend')) return 'Llévale la Teja Reforzada a Nicole en Aldea Pitch.';
  const n = [1, 2, 3, 4, 5].filter((i) => flag('tr_tw' + i)).length;
  if (n < 5) return 'Post-juego: Torre P.A. (' + n + '/5), parejas de Edison y Criaturario.';
  return 'Completa el Criaturario: ' + Object.keys(G.dex.caught).length + '/' + DEX_ORDER.length + '. ¡Eres leyenda!';
}

// ---------- escena de elección inicial ----------
class StarterScene {
  constructor() { this.sel = 0; this.opaque = true; this.t = 0; }
  update() {
    this.t++;
    if (Input.rep.left) { this.sel = (this.sel + 2) % 3; sfx('blip'); }
    if (Input.rep.right) { this.sel = (this.sel + 1) % 3; sfx('blip'); }
    if (Input.A) { sfx('select'); this.done(this.sel); }
    for (let i = 0; i < 3; i++) if (hit({ x: 6 + i * 84, y: 40, w: 78, h: 110 })) { if (this.sel === i) { sfx('select'); this.done(i); } else { this.sel = i; sfx('blip'); } }
  }
  drawTop(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f8e8c8'); g.addColorStop(1, '#d8a868'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#905828'; ctx.fillRect(0, 120, W, 72); ctx.fillStyle = '#b07038'; ctx.fillRect(0, 120, W, 6);
    STARTERS.forEach((id, i) => {
      const x = 4 + i * 84, sel = i === this.sel;
      ctx.fillStyle = sel ? '#ffffff60' : '#00000020'; ctx.beginPath(); ctx.ellipse(x + 40, 124, 36, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(creatureSprite(id), x, 46 + (sel ? -((this.t >> 3) & 1) * 2 : 0));
    });
    const id = STARTERS[this.sel];
    box(ctx, 4, 140, 248, 50);
    txt(ctx, SPECIES[id].n, 12, 148, TYPES[SPECIES[id].t].c); typeBadge(ctx, SPECIES[id].t, 200, 146);
    wrapText(SPECIES[id].d, 29).slice(0, 2).forEach((l, i) => txt(ctx, l, 12, 162 + i * 12));
    txt(ctx, '¿Quién te acompaña?', 128, 12, '#603010', '#f8e0b0', 'center');
  }
  drawBot(ctx) {
    botBackdrop(ctx);
    STARTERS.forEach((id, i) => {
      const x = 6 + i * 84, sel = i === this.sel;
      pill(ctx, x, 40, 78, 110, sel ? TYPES[SPECIES[id].t].c : '#46507a', null, { sel });
      ctx.drawImage(creatureIcon(id), x + 7, 54, 64, 64);
      txt(ctx, TYPES[SPECIES[id].t].n.toUpperCase(), x + 39, 128, '#fff', '#00000080', 'center');
    });
    txt(ctx, 'Toca dos veces o pulsa A', 128, 168, '#c8d0e8', '#000', 'center');
  }
}

// ---------- créditos ----------
class CreditsScene {
  constructor() { this.y = H; this.opaque = true; this.lines = [
    'CRIATURAS DEL REINO', 'SEGUNDA TEMPORADA', '', '', 'Protagonista', '{P}', '', 'Guía del reino', 'Alessandro', '', 'Futura aprendiz del Rey', 'Gabriela', '',
    'Diploma Fotografía Estética', 'Tamara', '', 'Diploma Documental', 'Luchito', '', 'Diploma Ficción', 'Andrea', '', 'Diploma Publicidad', 'Dan', '',
    'Recuperación de equipo', 'Luas', '', 'Quejas sobre el techo', 'Nicole', '', 'Teatro de ensayo', 'Pachi', '', 'Sin máscara (por fin)', 'André', '',
    'Seguir adelante', 'Dante', '', 'Producción', 'Chrys', '', 'Crónicas', 'Oscar y Piero', '', 'En memoria de', 'Manuel, la voz rasposa', '',
    'Guardiana de la llave', 'Yam', '', 'El Rey', 'Navarrete', '', '', 'Y tú, que llegaste hasta acá.', '', '', 'Los finales son solo', 'comienzos disfrazados.', '', '', '', 'FIN... ¿o segunda temporada?'];
  }
  update() { this.y -= Input.held.a ? 1.6 : 0.4; if (this.y < -this.lines.length * 14 - 40) this.done(); }
  drawTop(ctx) {
    ctx.fillStyle = '#0c0e1c'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = '#ffffff' + ((i * 7) % 9 + 3).toString(16) + '0'; ctx.fillRect((hash2(i, 3) * W) | 0, ((hash2(i, 4) * H + FRAME * 0.1 * (i % 3 + 1)) % H) | 0, 1, 1); }
    this.lines.forEach((l, i) => { const y = this.y + i * 14; if (y > -10 && y < H) txt(ctx, fill(l), 128, y, i < 2 ? COL.gold : i % 3 === 1 ? '#a8b8e8' : '#fff', '#000', 'center'); });
  }
  drawBot(ctx) {
    ctx.fillStyle = '#0c0e1c'; ctx.fillRect(0, 0, W, H);
    const ids = G.party.map((m) => m.id);
    ids.forEach((id, i) => { const x = 16 + (i % 3) * 80, y = 24 + Math.floor(i / 3) * 80; ctx.drawImage(creatureSprite(id), x - 8, y + ((FRAME >> 4) + i) % 2); });
  }
}

// =====================================================================
//  GUION
// =====================================================================
const S = {
  // ---------- ALDEA PITCH ----------
  async intro() {
    const ale = npc('ale_out');
    if (ale) { await exclaim(ale); await walk(ale, 'd'); }
    await say(['¡Llegaste, causa! ¡Llegaste de verdad! Pensé que el bote se hundía. Siempre pienso eso, soy bien pesimista con los botes.',
      '¡Bienvenido a Aldea Pitch, {P}! Aquí empieza todo, pe: cada idea, cada historia, cada criatura.',
      'En este reino la gente vive junto a las criaturas. Las cuidan, las entrenan, hacen vínculos... y a veces las mandan a comprar el pan.',
      'Ven a mi casa-estudio, la de arriba a la izquierda, la del letrero de Alessandro. Bueno, no tiene letrero. Pero es esa. Te tengo una sorpresa, ¡bravazo va a estar!'], 'Alessandro');
    setFlag('intro');
    if (ale) { await walk(ale, 'uuuuuuu', 2.4); await walk(ale, 'llllll', 2.4); await walk(ale, 'uu', 2.4); }
    WORLD.refreshNpcs();
  },
  async blockNorth() {
    await say('¡Oe, {P}! ¿A dónde vas sin criatura? El pasto alto es peligroso, causa. Pasa primero por mi casa, la de arriba a la izquierda.', 'Alessandro');
    await walk(P(), 'd');
  },
  async alexandro() {
    const tips = [
      'Habla, causa. Te paso el dato: flechas para moverte, Z para hablar, X para correr y ENTER para el menú. De nada.',
      'Abajo tienes la Claqueta: ahí ves tu objetivo, tus diplomas y tu mancha de criaturas. Es como el celular, pero no te deja en visto.',
      'Si tocas la pantalla de abajo, puedes elegir los botones con el dedo. Así juego yo cuando estoy echado en la cama a las tres de la mañana.',
      'Los "!" amarillos sobre la gente es que tienen algo para ti. Yo no tengo nada, solo floro. Pero floro de calidad, ah.',
      'Oe, ¿ya fuiste a la pensión de Nicole? Si te grita, tranquilo, así saluda. Si no te grita, ahí sí preocúpate.',
    ];
    G.flags.tipN = ((G.flags.tipN || 0) + 1) % tips.length;
    await say(tips[G.flags.tipN], 'Alexandro');
  },
  async alessandroHouse() {
    if (!flag('starter')) {
      await say(['¡Aquí estás! Te presento a Gabriela. Es mi... amiga. Bien amiga. La mejor amiga. Ya, ya, no digo más.',
        'En la mesa hay tres criaturas esperando compañero: una de Fuego, una de Agua y una de Planta. Fuego le gana a Planta, Planta a Agua y Agua a Fuego. Como el yan-ken-po, pero mojado.',
        'Elige la que más te guste. No hay respuesta incorrecta. Bueno, sí hay una, pero no te la voy a decir, ja.'], 'Alessandro');
      for (;;) {
        const i = await open(new StarterScene());
        const id = STARTERS[i];
        if ((await ask('¿Eliges a ' + SPECIES[id].n + ', de tipo ' + TYPES[SPECIES[id].t].n + '?', ['¡Sí!', 'Mmm, no'])) === 0) {
          const m = new Mon(id, 5); G.party.push(m); markCaught(id); setFlag('starter'); setFlag('myStarter', id);
          sfx('caught'); await say('¡' + SPECIES[id].n + ' se unió a tu equipo! Se le ve feliz. O con hambre. Con las criaturas nunca se sabe.');
          if ((await ask('¿Le pones un apodo a ' + SPECIES[id].n + '?', ['Sí', 'No'], null, 1)) === 0) { const nm = await nameEntry('Apodo', SPECIES[id].n, 10); if (nm !== SPECIES[id].n) m.nick = nm; }
          break;
        }
      }
      const gid = GAB_PICK[G.flags.myStarter]; setFlag('gabStarter', gid); markSeen(gid);
      const gab = npc('gab');
      await say(['¡Entonces yo me quedo con ' + SPECIES[gid].n + '! ¿Viste qué lindo? Me mira como si yo fuera importante.',
        'Te cuento un secreto: voy a ser aprendiz del Rey Navarrete. Todavía no le he preguntado. Pero en mi cabeza ya me dijo que sí.',
        '¡Así que necesito práctica! ¿Peleamos? Prometo no llorar si pierdo. Bueno, llorar poquito nomás.'], 'Gabriela');
      if (gab) face(gab, P());
      await trainerBattle({ def: { trainer: { id: 'gab1', name: 'Gabriela', team: [[gid, 5]], money: 100, intro: '¡Vamos, ' + SPECIES[gid].n + '! ¡El primer combate de nuestra vida!', lose: '¡Perdí! Pero fue precioso. ¿Viste cómo me miró cuando le dije "bien hecho"?' } }, look: 'gabriela' }, { friendly: true });
      for (const m of G.party) m.heal();
      await say(['Ahora sí, {P}: estás en un reino de criaturas, pero también de gente. Cada pueblo tiene su líder, y cada líder su prueba.',
        'Si las superas, te dan un diploma: Fotografía Estética, Documental, Ficción y Publicidad. Con los cuatro, el Castillo Difusión te abre la puerta.',
        'Toma: Cristales Vínculo para hacer lazos con criaturas salvajes. Bájales la vida antes de tirarlos. Con cariño, ¿ya? Pero bájales la vida.'], 'Alessandro');
      await giveItem('cristal', 5); await giveItem('cafe', 3);
      await say('Y te dejo el Criaturario en la Claqueta, la pantalla de abajo. Registra cada criatura que ves. Llénalo y vas a ser famoso. Bueno, famoso en el barrio.', 'Alessandro');
      await say(['¡Yo me adelanto! Voy a entrenar full para impresionar al Rey. ¡Nos vemos en el camino, {P}!', 'Ale, no me esperes para cenar. ...O sí. Espérame un ratito nomás.'], 'Gabriela');
      if (gab) { await walk(gab, 'ddd', 2.4); await walk(gab, 'l', 2.4); await walk(gab, 'dd', 2.4); }
      setFlag('gabLeft'); WORLD.refreshNpcs();
      await say('Ah, otra cosa: te alquilé un cuarto en la pensión de Nicole, la casa de arriba a la derecha, la del techo con hueco. Tiene cama. Y gotera. La gotera es gratis. Y Nicole... bueno, ya vas a ver.', 'Alessandro');
      G.lastHeal = { map: 'pitch_nicole', x: 6, y: 1 };
      return;
    }
    const hints = [
      'La Proa es la terminal de los Centros: ahí dejas criaturas descansando y fabricas cristales. Luas te cura al equipo gratis. Bueno, a cambio de buena onda.',
      'Si una criatura te gana siempre, cambia de tipo, pe. No es ser cobarde, es estrategia. Ser cobarde es otra cosa. La conozco bien, ja.',
      'Gabriela salió corriendo. Cuando se le mete algo en la cabeza, no hay quién la pare. Es lo que más me gusta de ella. No le digas, ¿ya?',
      'Eres el mejor, {P}. ¡El mejor, causa! Y no se lo digo a cualquiera. Bueno, a Gabriela también. Pero a ella es diferente.',
      'Oe, si Nicole te insulta, no te lo tomes personal. A mí me dice huevón desde que nos conocimos. Ya es como un apodo cariñoso.',
    ];
    await say(pick(hints), 'Alessandro');
  },
  async gabrielaHouse() { await say('¡Hola! Ale habla un montón, ¿no? A mí me encanta. No le digas, ¿ya?', 'Gabriela'); },
  async alessandroPost() {
    await say(pick(['¡Leyenda! ¡LEYENDA, causa! Sabía que lo ibas a lograr. Bueno, tenía un 60% de fe. Ahora 100%.', 'Gabriela entrena con el Rey de día y regresa en la noche. Yo le cocino. Ella dice que soy su héroe. Yo digo que ella es la heroína. Nos peleamos por eso. Es la mejor pelea del mundo.', 'Oe, ¿celebramos con unas chelas? Bueno, tú pagas, que yo gasté todo en el regalo de Gabriela.']), 'Alessandro');
  },
  async gabrielaPost() {
    if (!flag('tr_gabpost')) {
      await say(['¡{P}! ¡Mira mi armadura! El Rey me aceptó como aprendiz. ¡Gracias a ti, en parte! En una parte chiquita. Bueno, grande.', 'Entreno con Navarrete de día... y sueño en casa de noche. ¿Quieres ver lo que aprendí?'], 'Gabriela');
      const fin = FINAL[G.flags.gabStarter][1];
      const won = await trainerBattle({ def: { trainer: { id: 'gabpost', name: 'Gabriela', team: [['zumbaccino', 48], ['palomaiz', 47], ['lucilente', 48], ['crisalmanza', 48], [fin, 50]], money: 5000, intro: '¡Entrené con el Rey! ¡Siente el poder de su discípula!', lose: 'Todavía me falta... ¡pero ya no me da miedo que me falte!' } }, look: 'gabriela2' });
      if (won) await giveItem('cafetera', 2);
      return;
    }
    await say(pick(['Alessandro dice que ahora YO soy la heroína de la casa. Él sigue siendo mi héroe. ...No le digas que dije eso, ¿ya?', 'Vengo de tierras cálidas. Allá el sol brilla distinto. Pero aquí encontré mi hogar. Y mi futuro.']), 'Gabriela');
  },
  async nicole() {
    if (!flag('metNicole')) {
      setFlag('metNicole');
      return say(['¡Asu mare, otro aventurero! ¡Chucha, qué tal raza! ...Ah, ya, tú eres el inquilino. Perdón, o sea, me sale solo, tipo, es mi cara, ¿manyas?',
        'Ya, mira: tu cama es la del fondo, ¿ya? Si llueve, pones el balde. Si llueve fuerte, pones dos baldes y rezas, pe. O sea, así es la vida acá.',
        '¿Nadie arregla mi techo en este reino de mierda? ¡Los maestros de obra son unos conchasumadres! Te cobran por adelantado y desaparecen, tipo fantasmas, huevón.',
        'Gotea más que caño malogrado. O sea, ¿sabes lo que es dormir con una gota en la frente? Tipo tortura china, pero peruana, carajo.',
        'Ah, y nada de traer gente a la jato después de las diez, ¿ya? Bueno... depende de quién, ¿no? Ya, no, en serio, no. ...Bueno, ya, depende.'], 'Nicole');
    }
    if (hasItem('teja') && !flag('techo')) {
      takeItem('teja'); setFlag('techo'); setFlag('teja_pend', false);
      await say(['¿Eso es... una Teja Reforzada de la Cantera? ¿Para mí? O sea... ¿en serio, huevón?', '...',
        'No estoy llorando, ¿ya? Es la gotera. ...Ah, no, ya no hay gotera. O sea, sí estoy llorando. ¡Qué roche, carajo! ¡No me mires!',
        'Te daría un abrazo, pero no soy de abrazos, ¿manyas? Toma esto. Es lo más parecido a un abrazo que tengo. Y no se lo cuentes a nadie, porque te mato, ah.'], 'Nicole');
      await giveItem('cafetera'); await giveItem('inc_dragon', 2);
      return say('Ahora el techo está perfecto y ya no tengo de qué quejarme. ...Qué horror, huevón. O sea, ¿ahora de qué hablo? Ya fue, me voy a quejar de ti.', 'Nicole');
    }
    if (flag('techo')) return say(pick([
      'El techo ya no gotea. Ahora me quejo del silencio, o sea, tipo, la gotera era como mi pata, ¿manyas? Me hacía compañía la desgraciada.',
      'Oe, si ves a la gente del norte, diles que Nicole pregunta por ellos. Pero no así, ¿ya? Diles "Nicole preguntó de casualidad, nada que ver, o sea, ni le importa". Así.',
      '¿Ya viste? Ni una gota. Dormí ocho horas, huevón. Ocho. Me desperté y no sabía quién era. Tipo, ¿así vive la gente normal? Qué asco, qué rico.',
      'Oe, gracias de nuevo, ah. Ya, ya, ya, no te acostumbres. Lárgate, que me haces poner sentimental y eso no va conmigo, carajo.']), 'Nicole');
    if (POST()) return say('¿Le ganaste al Rey y todavía no me arreglas el techo? O sea, ¡¿en serio?! Las prioridades de la juventud, carajo. En la Cantera Rodaje hacen tejas, te lo digo por décima vez, huevón.', 'Nicole');
    return say(pick([
      'Gotea. Gotea. Gotea. O sea, es como un reloj, tipo, pero más deprimente. ¡Ay, ya, carajo!',
      'Oe, en la Cantera Rodaje hacen unas tejas bravazas. Si pasas por ahí... no te estoy pidiendo nada, ¿ya? ...Pero te estoy pidiendo, huevón. Obvio.',
      'A veces pienso en la gente del norte, tipo... hace full que no veo ciertas caras. ¿Estarán bien? ...Nada, nada. Me entró basura al ojo. Es la gotera, pe.',
      'Alessandro y Gabriela se miran como si nadie más existiera. O sea, qué asco. O sea, qué lindo. Qué asquerosamente lindo, carajo. Me dan diabetes.',
      '¿Qué me miras? ¿Tengo algo en la cara? ...Ah, ya, es una gota del techo. ¡Chucha! ¡Este techo de mierda!',
      'Oe, ¿tienes cinco lucas? Es para el techo. ...Ya, mentira, es para unas chelas. Pero las chelas también son una inversión emocional, huevón.',
      'O sea, tipo, ¿quién se cree el maestro de obra? Me dijo "mañana vengo, señito". ¿SEÑITO? Tengo veinticuatro años, conchasumadre.']), 'Nicole');
  },
  async cama() {
    if ((await ask('Tu cama en la pensión de Nicole. ¿Jateas un rato?', ['Sí', 'No'])) !== 0) return;
    await fadeTo(1, 20);
    for (const m of G.party) m.heal();
    G.lastHeal = { map: 'pitch_nicole', x: 6, y: 1 };
    sfx('heal'); await wait(50);
    await fadeTo(0, 20);
    await say(flag('techo') ? 'Dormiste como bebé. Sin goteras. Tu equipo está como nuevo.' : 'Gota... gota... gota. Igual jateaste abrazado a un balde. Tu equipo está como nuevo. Desde el otro cuarto se escucha a Nicole: "¿Quién ronca así? ¡Huevón!".');
  },
  async luas() {
    const r = await ask(POST() ? '¡Nos volvemos a ver, causa! El ángulo cambió pero el encuadre sigue. ¿Te recupero a la mancha?' : 'Hola, soy Luas. Ayudo a recuperar a los equipos que andan de viaje. ¿Te curo a tus criaturas?', ['Sí, porfa', 'No, gracias'], 'Luas');
    if (r !== 0) return say('¡Cuídate! Y toma agua. Siempre digo eso. Porque es verdad, pe.', 'Luas');
    await say('Dame un toque...', 'Luas');
    await healParty();
    await say(pick(['¡Corte! Tu equipo está como nuevo. ¡Listos para la siguiente toma!', '¡Listo! Como nuevos. Mejor que nuevos: nuevos y descansados.', '¡Al toque! Si los ves sonreír, es por mí. Si los ves serios, también.']), 'Luas');
  },
  // ---------- STORYBOARD ----------
  async tablaTipos() {
    await say(['Soy profe de tipos. Te hago un resumen, que la vida es corta:', 'Agua > Fuego > Planta > Agua. Fuego y Hada sufren contra el Acero... no, al revés: el Fuego derrite el Acero, y el Acero le gana al Hada.',
      'Lucha le pega fuerte a Normal y a Acero, pero el Hada la frena. El Dragón le gana al Dragón, y al Hada... no le hace nada. Nada. Cero. El Hada se ríe.',
      'Y el Hada le gana al Dragón y a la Lucha. En resumen: el Hada es la más peligrosa. Siempre lo supe.'], 'Profe Inés');
  },
  async tamara() {
    if (flag('dip_foto')) return say(pick(['Tu equipo tiene buena composición, pe. Cada criatura en su lugar, con su luz. Así se ve una buena foto.', 'Los materializadores creamos con las manos. Tú creas con vínculos. Es parecido. Menos astillas.']), 'Tamara');
    const has = (t) => G.party.some((m) => m.type === t);
    if (!flag('tamaraMet')) {
      setFlag('tamaraMet');
      await say(['Hola. Soy Tamara, la Proa de Villa Storyboard. Materializadora: hago cosas con las manos. Sillas, sets, decorados. Una vez armé un castillo de cartón y viví ahí dos semanas. No me arrepiento de nada.',
        'Mi diploma es Fotografía Estética. Y la estética, para mí, es equilibrio.',
        'Mi prueba: trae a tu equipo una criatura de Fuego, una de Agua y una de Planta. Las tres juntas. Si no hay equilibrio, no hay foto.'], 'Tamara');
    }
    if (!(has('fire') && has('water') && has('plant'))) {
      const miss = ['fire', 'water', 'plant'].filter((t) => !has(t)).map((t) => TYPES[t].n);
      return say('Todavía te falta: ' + miss.join(', ') + '. En la Ruta 1 hay Salamandros de Fuego, Pingüesones de Agua y Hedrocas de Planta. Busca en el pasto alto.', 'Tamara');
    }
    await say(['Fuego, Agua y Planta. Juntos. ¡Esto es equilibrio, causa! Qué bonito. Casi me dan ganas de tomarte una foto.', 'Ahora veamos si también hay fuerza en esa armonía.'], 'Tamara');
    const won = await trainerBattle({ def: { trainer: leader({ id: 'tamara', name: 'Tamara', team: [['hedroca', 11], ['salamandro', 11], ['pinguieson', 12], ['claquetin', 13]], money: 1300, bg: 'stage', intro: '¡Luz, cámara... composición!', lose: 'Perdí, pero qué buena toma fue. Te la ganaste.' }) }, look: 'tamara' });
    if (!won) return;
    setFlag('dip_foto'); sfx('caught');
    await say(['Esto es tuyo: el diploma de Fotografía Estética.', 'Con él, el asistente del norte te deja pasar a la Ruta 2. Ah, y toma estos inciensos: atraen criaturas de un tipo. Para que sigas buscando equilibrio.'], 'Tamara');
    await giveItem('inc_fire'); await giveItem('inc_water'); await giveItem('inc_plant');
    WORLD.refreshNpcs();
  },
  async gabriela2() {
    const g = npc('gab2');
    if (g) { await exclaim(g); face(g, P()); }
    await say(['¡{P}! ¡Te estaba esperando! Bueno, estaba practicando poses para el Rey. Pero también te esperaba.', 'Le escribí una carta a Navarrete. Me contestó "Ok". Solo "Ok". ¿Es bueno? ¿Me dejó en visto con educación? Creo que es buenísimo.', '¡Peleemos! Quiero ver cuánto creciste. ¡Y que tú veas cuánto crecí yo!'], 'Gabriela');
    const gid = G.flags.gabStarter;
    const won = await trainerBattle({ def: { trainer: { id: 'gab2', name: 'Gabriela', team: [['palomiton', 13], ['zumbaflor', 13], [FINAL[gid][0], 15]], money: 800, intro: '¡Por el Rey! ¡Por Alessandro! ¡Por mí!', lose: 'Uf. Eres muy bueno. Igual te sigo. Digo, te sigo ganando. Algún día.' } }, look: 'gabriela' });
    if (won) {
      await say('¡Me voy a Feria Última Toma! Dicen que hay un teatro. Voy a ensayar mi discurso para el Rey. ¡Chau, chau!', 'Gabriela');
      await giveItem('cafedoble', 2);
      WORLD.refreshNpcs();
    }
  },
  // ---------- RODAJE ----------
  async dante() {
    if (flag('tr_dante')) return say(POST() ? 'El infierno se apagó. No del todo... pero las llamas son más pequeñas ahora.' : pick(['La vida trae dolor, pero también sabiduría. Hay que seguir caminando.', 'André es el hombre más guapo que he conocido. Lo respeto muchísimo. Y lo extraño.']), 'Dante');
    await say(['Vivo un infierno, causa... pero sigo adelante. Eso es lo que importa.', 'El infierno me enseñó a pelear. ¿Quieres aprender lo mismo?'], 'Dante');
    if ((await ask('¿Combates con Dante?', ['Sí', 'Ahora no'])) !== 0) return say('Ya, cuando estés listo. El fuego espera.', 'Dante');
    const won = await trainerBattle({ def: { trainer: { id: 'dante', name: 'Dante', team: [['salamandro', 17], ['wyvernito', 17], ['espinardo', 18]], money: 900, intro: 'Que arda.', lose: 'Ardió. Bien. Duele, pero bien.' } }, look: 'dante' });
    if (won) { await say('Toma. Para cuando todo queme demasiado.', 'Dante'); await giveItem('tecito', 3); }
  },
  async gonchi() {
    if (flag('gotTeja')) return say(flag('techo') ? '¡Nicole me mandó una carta de agradecimiento! Bueno, decía "gracias, igual tarde". Viniendo de ella, es una declaración de amor.' : '¿Ya le llevaste la teja a Nicole? Pobre, debe estar durmiendo con paraguas.', 'Gonchi');
    if (!flag('dip_docu')) return say('Fabrico tejas, las mejores del reino. Nicole de Aldea Pitch me pidió una hace meses... y me mentó la madre tres veces porque no llegaba, ja. Si le ganas a Luchito, te doy una para ella. Luchito me debe plata y quiero que alguien lo humille un poquito.', 'Gonchi');
    await say('¡Le ganaste a Luchito! Me alegré tanto que le perdoné la deuda. Ya, no, mentira. Pero me alegré. Toma, llévale esto a Nicole, y dile que ya no me insulte, porfa.', 'Gonchi');
    setFlag('gotTeja'); setFlag('teja_pend'); await giveItem('teja');
  },
  async luchito() {
    if (flag('dip_docu')) return say(pick(['Ya escribí tu combate en mi cuaderno. Título: "El día que me superaron con amor y con tipos bien elegidos".', 'Aquí el amor lo es todo. Y la tabla de tipos. Amor y tabla de tipos.']), 'Luchito');
    if (!flag('luchitoActive')) {
      setFlag('luchitoActive'); G.flags.luchitoHits = 0;
      return say(['¡Habla! Soy Luchito, el Proa de Cantera Rodaje y cronista oficial. Registro hazañas. Aquí el amor lo es todo, causa. Y las hazañas, también.',
        'Mi diploma es Documental. Y un documental necesita hechos. Así que: quiero que conectes TRES golpes superefectivos. Yo los voy a anotar.',
        'Pueden ser contra criaturas salvajes o contra entrenadores. Cuando lleves tres, vuelve y peleamos. ¡Usa bien los tipos!'], 'Luchito');
    }
    const h = G.flags.luchitoHits || 0;
    if (h < 3) return say('Llevas ' + h + ' de 3 golpes superefectivos en mi cuaderno. ¡Sigue! Agua contra Fuego, Fuego contra Planta, Planta contra Agua... ¡Hada contra Dragón!', 'Luchito');
    await say(['¡Tres golpes superefectivos! ¡Está todo documentado! Qué crónica más bacán, carajo.', 'Ahora la escena final: tú contra mí.'], 'Luchito');
    const won = await trainerBattle({ def: { trainer: leader({ id: 'luchito', name: 'Luchito', team: [['doblecan', 16], ['claquetin', 16], ['wyvernito', 17], ['lucierlaga', 18]], money: 1800, bg: 'stage', intro: '¡Que la cámara no se detenga!', lose: '¡Y... corte! Me ganaste. Esto va en la portada.' }) }, look: 'luchito' });
    if (!won) return;
    setFlag('dip_docu'); sfx('caught');
    await say('El diploma Documental es tuyo. El capataz ya no te va a cerrar el paso a la Cueva Volcánica. Y toma esto: un Guion Inédito. Sube un nivel. Contiene spoilers.', 'Luchito');
    await giveItem('guion');
    WORLD.refreshNpcs();
  },
  // ---------- FERIA ----------
  async pachiOut() {
    setFlag('metPachi');
    if (POST()) return say(['¡Todo listo para el espectáculo! ¡Mi hermano André es libre!', '...Y ahora se pelea conmigo por el último pan con chicharrón de la casa. Lo extrañaba. Lo del pan con chicharrón, no tanto.'], 'Pachi');
    await say(pick([['Tenía un espectáculo preparado... pero me falta mi compañero. Mi hermano, André.', 'Está en el Castillo Difusión. Lo pusieron a vigilar la entrada y le dieron una máscara. ¡A él! ¡Al hombre más hermoso de su pueblo!', 'Si lo ves... dile que su hermana lo espera. Y que le guardé su lugar en el escenario.'],
      ['En el teatro hago combates de ensayo: peleas contra versiones de actuación de gente del reino. Si pierdes, no pasa nada. ¡Es teatro!', 'Entra cuando quieras. La función es continua.']]), 'Pachi');
  },
  async andrePost() { await say(['La máscara ya no está. Pesaba más de lo que parecía.', 'Gracias por pasarme a buscar... Bueno, por ganarme. Es casi lo mismo.'], 'André'); },
  async teatro() {
    setFlag('metPachi');
    const L = clamp(maxLv(), 8, 60);
    const shows = [
      { n: 'El Guía Entusiasta', who: 'Alessandro', look: 'alessandro', team: [['palomaiz', L - 1], ['zumbaflor', L - 1], ['rollazo', L]] },
      { n: 'Equilibrio', who: 'Tamara', look: 'tamara', team: [['hedroble', L - 1], ['alquimero', L - 1], ['pinguichef', L]] },
      { n: 'El Infierno', who: 'Dante', look: 'dante', team: [['alquimero', L], ['wyvernito', L], ['espinardo', L]] },
      { n: 'Hermanos de Escena', who: 'Pachi', look: 'pachi', team: [['longbao', L], ['duendecillo', L], ['flamigaro', L + 1]] },
    ];
    if (POST()) shows.push({ n: 'El Rey sin Corona', who: 'André', look: 'andre', team: [['wyvernax', L + 1], ['claqueton', L + 1], ['serafox', L + 2]] });
    await say('¡Bienvenido al Teatro de la Feria! Elige una función. Al terminar, tu equipo queda como nuevo.', 'Pachi');
    const i = await listMenu({ title: 'CARTELERA', items: shows.map((s) => ({ label: s.n, sub: s.who.slice(0, 9) })) });
    if (i < 0) return say('¡La función sigue cuando quieras, pe!', 'Pachi');
    const s = shows[i];
    await say('¡Arriba el telón! Hoy, en el papel de ' + s.who + '... ¡yo! Bueno, mi elenco.', 'Pachi');
    await trainerBattle({ def: { trainer: { id: 'show' + FRAME, name: s.who + ' (ensayo)', team: s.team, money: 0, bg: 'stage', intro: '¡ACTO TERCERO! ¡La batalla comienza!', lose: '¡Bravo! ¡Bravo! ¡Ovación de pie!' } }, look: s.look }, { rehearsal: true });
    for (const m of G.party) m.heal();
  },
  async tutor() {
    const list = [['plano', 1500], ['lanzallamas', 3000], ['surf', 3000], ['energibola', 3000], ['brillomagico', 3000], ['cabezahierro', 3000], ['punodrenaje', 3000], ['pulsodragon', 3500]];
    await say('Soy el Profe de Doblaje. Le enseño a tus criaturas a "decir" ataques nuevos. Cobro por clase. El arte no es gratis, mi rey.', 'Profe de Doblaje');
    for (;;) {
      const i = await listMenu({ title: 'CLASES', headerRight: () => '$' + G.money, items: list.map(([id, p]) => ({ label: MOVES[id].n, sub: '$' + p, col: shade(TYPES[MOVES[id].t].c, -0.25) })),
        top: (ctx, it, k) => { const M = MOVES[list[k][0]]; ctx.fillStyle = '#f0e8d8'; ctx.fillRect(0, 0, W, H); txt(ctx, M.n, 12, 20); typeBadge(ctx, M.t, 190, 18); txt(ctx, 'Potencia ' + (M.p || '--') + '  PP ' + M.pp, 12, 40, COL.dim, null); wrapText(M.d, 29).forEach((l, j) => txt(ctx, l, 12, 60 + j * 12)); txt(ctx, M.t === 'normal' ? 'Lo aprende cualquiera.' : 'Solo criaturas de tipo ' + TYPES[M.t].n + '.', 12, 110, '#4870c8', null); } });
      if (i < 0) return say('Vuelva cuando quiera. Y practique la dicción.', 'Profe de Doblaje');
      const [mid, price] = list[i];
      if (G.money < price) { await say('No te alcanza. El arte es caro. La ignorancia es gratis, pero sale cara después.', 'Profe de Doblaje'); continue; }
      const k = await partyMenu('select', { title: 'ALUMNO', filter: (m) => (MOVES[mid].t !== 'normal' && m.type !== MOVES[mid].t ? 'No es de tipo ' + TYPES[MOVES[mid].t].n + '.' : m.moves.some((x) => x.id === mid) ? 'Ya lo sabe.' : null) });
      if (k < 0) continue;
      if (await learnMove(G.party[k], mid)) { G.money -= price; await say('¡Excelente dicción! Gracias por su pago.', 'Profe de Doblaje'); }
    }
  },
  async andrea() {
    if (flag('dip_ficcion')) return say(pick(['Aprobado con honores. Igual, si alguna vez quieres dar clases, avísame. Necesito ayudantes que no se duerman.', '¿Me dijiste "profe" por la calle? Me alegraste el día.']), 'Andrea');
    if (!flag('andreaMet')) {
      setFlag('andreaMet');
      await say(['Buenas. Soy Andrea, la Proa de Feria Última Toma. Pregonera de oficio y profesora de vocación. O al revés. Las dos cosas, ya fue.',
        'Mi diploma es Ficción. Y para crear ficción, hay que conocer la realidad. Así que: examen. Cinco preguntas sobre el reino.',
        'Si respondes todas bien, peleamos. Si no, a estudiar. Habla con la gente, lee carteles, presta atención. Como en la vida.'], 'Andrea');
    }
    if ((await ask('¿Rindes el examen ahora?', ['Sí, profe', 'Todavía no'])) !== 0) return say('Bien hecho: estudiar antes es de gente sabia.', 'Andrea');
    const Q = [
      ['¿Quién te dio la bienvenida en Aldea Pitch?', 'Alessandro', ['Luas', 'Dan']],
      ['¿Qué tipo es superefectivo contra Fuego?', 'Agua', ['Planta', 'Hada']],
      ['¿Qué diploma entrega Tamara?', 'Fotografía Estética', ['Documental', 'Publicidad']],
      ['¿Cómo se llama el hermano de Pachi?', 'André', ['Dante', 'Piero']],
      ['¿De qué se queja siempre Nicole?', 'De su techo', ['Del ruido', 'De Alessandro']],
      ['¿Qué tipo no recibe daño de los ataques Dragón?', 'Hada', ['Acero', 'Agua']],
      ['¿Dónde descansan las criaturas que no llevas?', 'En la Proa', ['En el teatro', 'En el castillo']],
      ['¿Qué pidió Luchito para su prueba?', 'Golpes superefectivos', ['Chismes', 'Equilibrio']],
    ];
    const qs = shuffle(Q).slice(0, 5);
    for (let n = 0; n < qs.length; n++) {
      const [q, ok, bad] = qs[n];
      const opts = shuffle([ok, ...bad]);
      const r = await ask('Pregunta ' + (n + 1) + ': ' + q, opts, 'Andrea', -1);
      if (opts[r] !== ok) { sfx('wrong'); return say(['Incorrecto. La respuesta era: ' + ok + '.', 'No pasa nada: equivocarse es parte de aprender. Repasa y vuelve. Te espero con más preguntas. Las mismas no, que no soy tonta.'], 'Andrea'); }
      sfx('right');
    }
    await say(['¡Cinco de cinco! Me emocioné. Hacía tiempo que nadie aprobaba sin plagiarse.', 'Ahora, la parte práctica. ¡Clase de combate!'], 'Andrea');
    const won = await trainerBattle({ def: { trainer: leader({ id: 'andrea', name: 'Andrea', team: [['zumbaflor', 23], ['medusync', 23], ['lucilente', 24], ['duendecillo', 25]], money: 2600, bg: 'stage', intro: '¡Abran sus cuadernos! Tema de hoy: tu derrota.', lose: 'Diez. Te pongo un diez. Y una estrellita.' }) }, look: 'andrea' });
    if (!won) return;
    setFlag('dip_ficcion'); sfx('caught');
    await say('Diploma de Ficción. Te lo ganaste, pe. La salida al norte está libre. Y esto es para tu cartuchera: un Cristal Estelar. Funciona mejor que los comunes.', 'Andrea');
    await giveItem('cristalest', 2);
    WORLD.refreshNpcs();
  },
  // ---------- MONTAJE ----------
  async chisme(n) {
    if (!flag('libreta')) {
      const pre = ['¿Qué miras? No tengo nada que contar. A desconocidos, no. ¿Conoces a Dan? Ah, entonces tampoco.', 'Hola. Tengo algo jugoso para contar... pero solo a quien tenga la libreta de Dan.', '¡Sé un secreto! ¡Pero no te lo digo! ¡Bueno, quizás si vienes de parte de Dan!'][n - 1];
      return say(pre);
    }
    if (flag('chisme' + n)) return say(['Ya te lo conté todo. Ahora anda, que me ven hablando contigo y van a rajar.', '¿Ya se lo contaste a Dan? ¿Qué cara puso? ¿Cara de "ajá"? Siempre pone cara de "ajá".', '¡No le digas al Rey que te dije!'][n - 1]);
    const txts = [
      ['Psst, oe... ¿Sabes que Alessandro y Gabriela comparten cepillo de dientes?', 'No, mentira. Comparten taza. Es casi lo mismo. Bueno, no. Pero es tierno.'],
      ['¿Sabías que Luchito le escribe poemas a alguien de la Feria?', 'Los firma "Admirador Superefectivo". Rima "amor" con "cronista". No rima. Pero él insiste.'],
      ['¡Asu! ¡Vi al Rey Navarrete por la ventana del castillo!', '¡Duerme con un peluche de Wyvernito! ¡Se llama "Señor Mordiscos"! ¡No le digas que te dije!'],
    ];
    await say(txts[n - 1]);
    setFlag('chisme' + n); sfx('item');
    await say('(Anotaste el chisme en la Libreta de Chismes.)');
  },
  async dan() {
    if (flag('dip_publi')) return say(pick(['Montar es elegir qué contar. Y yo elijo contar que me ganaste. Con buena música de fondo.', '¿Escuchaste algo nuevo? No, no me digas. Bueno, sí, dime.']), 'Dan');
    if (!flag('libreta')) {
      setFlag('libreta');
      await say(['Ajá. Llegaste. Soy Dan, el Proa de Prados Montaje. Me gusta saber qué pasa. Qué se dice. Quién mira a quién. Quién le escribe a quién a las dos de la mañana.',
        'Mi diploma es Publicidad. Y la publicidad empieza con información. Por eso mi prueba es simple: tráeme tres chismes.',
        'Toma esta libreta. Hay gente en los Prados y en la Ruta 4 que sabe cosas. Los vas a reconocer: les brilla el "!" sobre la cabeza.'], 'Dan');
      await giveItem('libreta');
      WORLD.refreshNpcs();
      return;
    }
    const n = [1, 2, 3].filter((i) => flag('chisme' + i)).length;
    if (n < 3) return say('Ajá. Llevas ' + n + ' de 3 chismes. Chisme a medias es peor que nada, causa. Bueno, no. Pero casi.', 'Dan');
    await say(['A ver la libreta... "Alessandro y Gabriela comparten taza." Ajá. Lo sabía. Lo intuía. Lo deseaba.', '"Luchito escribe poemas firmados Admirador Superefectivo." ¡Ja! Eso es oro. Oro puro.', '"El Rey duerme con un peluche llamado Señor Mordiscos." ...', '...Yo le regalé ese peluche. Esto no salió de esta habitación. ¡Combate! ¡Rápido! ¡Antes de que pienses!'], 'Dan');
    const won = await trainerBattle({ def: { trainer: leader({ id: 'dan', name: 'Dan', team: [['espinardo', 30], ['boomguru', 30], ['hedroble', 31], ['dobleriesgo', 32]], money: 3400, bg: 'stage', intro: 'Ajá. Ajá. ¡Ajá!', lose: 'Ajá... Bien editado. Muy bien editado.' }) }, look: 'dan' });
    if (!won) return;
    setFlag('dip_publi'); sfx('caught');
    await say(['El diploma de Publicidad. Con los cuatro, el Castillo Difusión te va a recibir.', 'Y por guardar el secreto del peluche... esto. No es soborno. Es publicidad.'], 'Dan');
    await giveItem('cafetera'); await giveItem('tomados', 2);
    takeItem('libreta');
    WORLD.refreshNpcs();
  },
  async chrys() {
    if (flag('tr_chrys')) return say(POST() ? 'La producción está completa. Pero siempre hay una segunda temporada. ¿Tú eres la segunda temporada? Me gusta el casting.' : pick(['Este camino es el final. Pero los finales son solo comienzos disfrazados.', 'Conozco a Yam, a Hernán, a Nahuel, a Alejandro... son mi "elenco" especial. Si llegas al castillo, saluda a Yam de mi parte. Gritando. Ella entiende mejor así.']), 'Chrys');
    await say(['Soy Chrys, productora. Coordino, organizo, hago que todo funcione. Si algo sale bien en este reino, probablemente lo organicé yo. Si sale mal, fue Dan. Siempre es Dan.', '¿Un combate? Produzco victorias. Y derrotas también.'], 'Chrys');
    if ((await ask('¿Combates con Chrys?', ['Sí', 'No'])) !== 0) return say('Te dejo en agenda.', 'Chrys');
    await trainerBattle({ def: { trainer: { id: 'chrys', name: 'Chrys', team: [['flamcrest', 30], ['ajolord', 30], ['lucilente', 31]], money: 1600, intro: '¡Produzco victorias!', lose: 'Bueno. Hay que replanificar.' } }, look: 'chrys' });
  },
  async oscar() {
    if (!flag('cronica1')) {
      setFlag('cronica1');
      return say(['Registro todo lo que veo. Como un cronista, pero sin pluma ni tinta. Te cuento cómo es la gente de este reino:',
        'Hay órdenes: los Materializadores crean con las manos, los Cronistas registran, los Pregoneros transmiten.',
        'Y hay grupos: los CTM, veteranos. Las Monas, inseparables y de alta fidelidad. Brandcut, la siguiente generación, inexpertos con ganas.',
        'Los Rebata, ruidosos y divertidos. Los Proas, jefes malhumorados pero sabios. Y los Outsiders... misteriosos, sin conexión con nadie.',
        'Y una persona puede ser de varios grupos a la vez. Como la vida misma.'], 'Oscar');
    }
    if (!flag('tr_oscar')) {
      if ((await ask('Los hechos hablan. Mis criaturas también. ¿Combatimos?', ['Sí', 'No'], 'Oscar')) === 0) return trainerBattle({ def: { trainer: { id: 'oscar', name: 'Oscar', team: [['hedroble', 29], ['ajolord', 29], ['wyvernito', 30]], money: 1500, intro: '¡Los hechos hablan!', lose: 'Queda registrado.' } }, look: 'oscar' });
    }
    return say(['Conocíamos a Manuel... Tenía la voz rasposa. Quería ser comentarista.', 'Se fue. Pero lo recordamos. Contar sus historias es una forma de que siga acá.'], 'Oscar');
  },
  async piero() {
    if (!flag('tr_piero')) {
      await say('¿Mi pelo rubio? Una apuesta, causa. Perdí... pero quedó bien. ¿O no? No me contestes.', 'Piero');
      if ((await ask('¿Combates con Piero?', ['Sí', 'No'])) === 0) return trainerBattle({ def: { trainer: { id: 'piero', name: 'Piero', team: [['medubass', 29], ['dobleriesgo', 30]], money: 1500, intro: '¡Esta no la pierdo!', lose: 'Otra apuesta perdida. Por suerte no aposté el pelo.' } }, look: 'piero' });
      return;
    }
    await say(pick([['Manuel era... especial. Renegón, voz rasposa.', 'Decía que el mundo necesita gente que cuente la verdad. Por eso viajo. Para contarla.'], ['He visto cosas en este viaje. Criaturas, personas, historias. Todo merece ser contado.']]), 'Piero');
  },
  async abuelaNene() {
    if (!flag('chibolo')) { setFlag('chibolo'); await say('Ay, qué cara de cansado. Toma, m\'hijo. Lo encontré en el jardín. Brilla mucho, debe servir para algo.', 'Abuela Nené'); return giveItem('fragoro'); }
    await say('La Torre P.A. transmite a todo el reino. Dicen que en la azotea, cuando alguien aplaude de pie, aparece una criatura dorada. Yo nunca aplaudo de pie. Las rodillas.', 'Abuela Nené');
  },
  async gabriela3() {
    const g = npc('gab3');
    if (g) { await exclaim(g); face(g, P()); }
    await say(['{P}... Llegaste. Yo también. El castillo está ahí nomás.', 'Tengo miedo. ¿Y si el Rey me dice que no? ¿Y si me dice "Ok" otra vez y no sé qué significa?',
      'Alessandro me dijo: "Si no te animas, pelea con {P}. Siempre te deja más valiente". Así que... ¡en guardia!'], 'Gabriela');
    const gid = G.flags.gabStarter;
    const won = await trainerBattle({ def: { trainer: { id: 'gab3', name: 'Gabriela', team: [['palomaiz', 35], ['lucilente', 36], ['zumbaccino', 36], [FINAL[gid][1], 38]], money: 2400, intro: '¡Esta vez, con todo lo que tengo!', lose: 'Perdí... y no tengo miedo. Qué raro. Tenía razón Ale.' } }, look: 'gabriela' });
    if (won) {
      await say('Anda tú primero. Yo voy después, cuando junte valor. O cuando termine de practicar la reverencia. Lo que pase primero.', 'Gabriela');
      await giveItem('cafetera');
      WORLD.refreshNpcs();
    }
  },
  // ---------- PRADOS MONTAJE: la gente de los prados y los colonos ----------
  async alejandro() {
    if (POST() && flag('tr_alejandro')) return say(['¡Mi hermano y yo juntos! ¡Somos imparables!', '¡Ven cuando quieras! La olla siempre tiene lugar para uno más.'], 'Alejandro');
    if (!flag('metAlej')) {
      setFlag('metAlej');
      await say(['¡Hermanito! ¡Un abrazo! Sí, a ti. Acá abrazamos primero y preguntamos el nombre después.',
        'Soy Alejandro. Mi gente vive en estos prados desde mucho antes de que alguien dibujara un mapa. Sembramos maíz, frejol y zapallo juntos, porque se cuidan entre sí.',
        'Cuando llegaron los colonos de casaca roja, no sabían ni dónde quedaba el norte. Les enseñamos a sembrar. Ellos nos enseñaron a tocar el tambor. Bueno... lo intentan.',
        'No fue fácil al principio. Pero acá elegimos escucharnos. Y ahora compartimos el fuego, la cosecha y los chismes de Dan.'], 'Alejandro');
    }
    if (!flag('tr_alejandro')) {
      await say('¿Quieres pelear? ¡Vamos! Y escucha bien: ¡no te rindas NUNCA!', 'Alejandro');
      if ((await ask('¿Combates con Alejandro?', ['¡Vamos!', 'Ahora no'])) !== 0) return say('Cuando quieras. Acá voy a estar, con los brazos abiertos.', 'Alejandro');
      const won = await trainerBattle({ def: { trainer: { id: 'alejandro', name: 'Alejandro', team: [['zumbaccino', 31], ['crisalmanza', 31], ['hedroble', 32]], money: 1600, intro: '¡Hermanito! ¡A pelear!', lose: '¡Qué buen combate! Perder así también es ganar algo.' } }, look: 'alejandro' });
      if (won) await giveItem('cafedoble', 2);
      return;
    }
    await say(pick([['Mi hermano Nahuel anda por el sur, en la Feria. Si lo ves, dile que lo espero con un abrazo de esos que crujen.'], ['El fuego del medio del pueblo es de todos. Ahí se cuentan las historias. Las de mi abuela, las de los colonos y las de Dan, que siempre exagera.'], ['¿Ves el maizal? Lo sembramos juntos el año pasado. Los colonos querían plantarlo en filas rectas. El maíz no sabe de filas. El maíz sabe de compañía.']]), 'Alejandro');
  },
  async nahuel() {
    if (!flag('tr_nahuel')) {
      await say(['¡Oe! ¿Quieres chamba? ...Es broma, no tengo.', '¿O sí? No, no tengo. ¿Peleamos, mejor?'], 'Nahuel');
      if ((await ask('¿Combates con Nahuel?', ['Sí', 'No'])) === 0) return trainerBattle({ def: { trainer: { id: 'nahuel', name: 'Nahuel', team: [['alquimero', 24], ['flamigaro', 24]], money: 900, intro: '¡Las piernas libres pelean mejor! ¡Vamos!', lose: 'Perdí, pero con estilo. Y con las piernas al sol.' } }, look: 'nahuel' });
      return;
    }
    await say(pick([['Mi hermano Alejandro está mucho más al norte, en los Prados Montaje.', 'Tiene el pelo largo. No falla.'], ['¿Por qué uso shorts?', 'Porque las piernas también merecen ver el sol.'], ['Voy a ir a ver a mi hermano cuando termine de recorrer la Feria. O sea, nunca. Hay demasiada jama, causa.']]), 'Nahuel');
  },
  async nahuelPost() { await say(['¡Al final vine! Mi hermano me abrazó tan fuerte que me sonaron tres vértebras.', 'Valió cada una.'], 'Nahuel'); },
  async tomas() {
    await say(pick([['Cuando llegamos no sabíamos ni sembrar maíz. La gente de los prados nos enseñó, con paciencia.', 'Ahora yo les enseño a tocar el tambor. Mal, pero con ganas.'], ['La casaca roja da calor en verano. Nina me hizo un sombrero de fibras. No es reglamentario. Es mucho mejor.'], ['Mi capitán es Dan. Bueno, capitán... Dirige el pueblo, la banda y los chismes. Más que nada los chismes.']]), 'Cabo Tomás');
  },
  async nina() {
    await say(pick([['Los de casaca roja hablan raro y comen raro.', 'Pero el invierno de la gran helada compartieron su pan con nosotros. Y nosotros nuestra leña. Así se arman las familias.'], ['Acá nadie es de afuera: o siembras, o cocinas, o cuentas historias junto al fuego. Yo hago las tres.'], ['Tomás toca el tambor todas las mañanas. Le dije que suena como un Rollín cayéndose por la escalera. Se puso contento. No entendió.']]), 'Nina');
  },
  // ---------- CASTILLO ----------
  async andreCastle() {
    if (flag('tr_andre')) return say(['Dile a Pachi... que ya casi. Que guarde mi lugar.', 'Y que no se coma mi pan con chicharrón.'], 'André');
    await say(['...Esta máscara pesa. Pachi está afuera... y yo sigo acá.', 'Vigilo la entrada del Rey. Para pasar, vas a necesitar fuerza. No puedo salir todavía... pero sí puedo pelear.'], 'André');
    const won = await trainerBattle({ def: { trainer: { id: 'andre', name: 'André', team: [['longbao', 37], ['dobleriesgo', 37], ['crisalmanza', 38]], money: 3000, bg: 'castle', intro: 'Prepárate para el silencio.', lose: '...Me ganaste. La máscara pesa un poco menos.' } }, look: 'andre' });
    if (won) await say('Yam está en el ala este. Tiene la llave. Grita mucho. Es buena persona. Pero grita mucho.', 'André');
  },
  async yam() {
    if (POST()) return say('¡¡¡MAGNÍFICO!!! ¡¡¡OTRA VEZ!!! ¡¡¡ME ENCANTA!!! ...Perdón. Ya no tengo nada que custodiar. Me aburro A LOS GRITOS.', 'Yam');
    if (!flag('tr_andre')) return say(['¡¡¡OE!!! ¿¡¡TÚ ACÁ!!?', '¡¡¡Primero derrota a André en el ala OESTE!!! ¡¡¡Sin eso NO PIERDO MI TIEMPO!!!'], 'Yam');
    if (flag('tr_yam')) return say('¡¡¡YA TIENES LA LLAVE, CAUSA!!! ¡¡¡LA PUERTA ESTÁ AL NORTE!!! ¡¡¡SALUDOS AL REY!!!', 'Yam');
    await say(['¡¡¡ALTO AHÍ!!! ¡¡¡Soy Yam, la guardiana!!! ¡¡¡Tengo la LLAVE del Rey!!!', '¿¡¡Crees poder QUITÁRMELA?!! ¡¡¡NADIE PASA A VER AL REY SIN VENCERME PRIMERO!!!'], 'Yam');
    if (flag('tr_chrys')) await say('¿¡Chrys te mandó saludos!? ¡¡¡QUÉ TIERNA!!! ¡¡¡IGUAL TE VOY A DESTRUIR!!!', 'Yam');
    const won = await trainerBattle({ def: { trainer: { id: 'yam', name: 'Yam', team: [['inferpavo', 39], ['espinardo', 39], ['wyvernax', 40]], money: 3500, bg: 'castle', intro: '¡¡¡EN GUARDIA!!!', lose: '¡¡¡MAGNÍFICO!!! ¡¡¡PERDÍ Y ME ENCANTA!!!' } }, look: 'yam' });
    if (won) { await say('¡¡¡Toma LA LLAVE!!! ¡¡¡LA PUERTA DEL TRONO ESTÁ AL NORTE!!! ¡¡¡NO LA PIERDAS!!!', 'Yam'); await giveItem('llave'); }
  },
  async rey() {
    if (POST()) {
      if (!flag('reyRematch')) {
        if ((await ask('Ah. Tú de nuevo. Ya no bostezo cuando te veo. ¿Revancha? Esta vez sin contenerme.', ['Revancha', 'Otro día'], 'Rey Navarrete')) !== 0) return;
        const won = await trainerBattle({ def: { trainer: { id: 'reyre', name: 'Rey Navarrete', boss: true, team: [['claqueton', 55], ['lucilente', 55], ['dobleriesgo', 55], ['glaciolote', 56], ['inferpavo', 56], ['wyvernax', 58]], money: 9000, bg: 'castle', intro: 'Esta vez, sin bostezos.', lose: 'Bien. Muy bien. El reino está en buenas manos. Las tuyas, y las de mi aprendiz.' } }, look: 'rey' });
        if (won) setFlag('reyRematch');
        return;
      }
      return say('Gabriela entrena duro. Dice que algún día te gana. Yo le digo que primero me gane a mí. Todavía no me gana. Pero falta poco.', 'Rey Navarrete');
    }
    await say(['...Ah. Otro retador.', '*bostezo* ...Ya, ya. Pasa, pues.', 'Cuatro diplomas, la llave de Yam, André vencido... Supongo que sí. Que empiece.'], 'Rey Navarrete');
    const won = await trainerBattle({ def: { trainer: { id: 'rey', name: 'Rey Navarrete', boss: true, team: [['claqueton', 40], ['lucilente', 40], ['dobleriesgo', 41], ['glaciolote', 41], ['wyvernax', 43]], money: 10000, bg: 'castle', intro: 'Mostrame algo que no haya visto.', lose: '...' } }, look: 'rey' });
    if (!won) return;
    await say(['...', 'Hacía años que no perdía. Me había olvidado de cómo se siente.', 'Se siente... bien. Raro, pero bien. Como despertarse de una siesta larguísima.'], 'Rey Navarrete');
    // Gabriela entra
    await fadeTo(1, 16);
    const gdef = { id: 'gabend', look: 'gabriela', name: 'Gabriela', x: 10, y: 5, dir: 'up' };
    WORLD.ents.push(new Ent(gdef));
    await fadeTo(0, 16);
    const g = npc('gabend');
    await walk(g, 'uu');
    await say(['¡Su Majestad! Perdón. Hola. Soy Gabriela. La de la carta. La del "Ok".', 'Quiero ser su aprendiz. Ya sé que no soy la más fuerte. {P} me ganó tres veces. Pero me levanté las tres. Y acá estoy.'], 'Gabriela');
    await say(['...Te ganaron tres veces y sigues de pie, pidiendo más.', 'Eso es exactamente lo que busco. Mañana a las seis. No llegues tarde. Y trae... eso que traes siempre. Ganas.'], 'Rey Navarrete');
    await say(['¡¿SÍ?! ¡¡¿SÍ?!! ¡Tengo que contarle a Ale! ¡Gracias, {P}! ¡Gracias, Rey! ¡Gracias, castillo!'], 'Gabriela');
    await say('Y tú, viajero... el reino es tuyo para recorrerlo. Las puertas que estaban cerradas ahora están abiertas. Anda a ver qué hay del otro lado.', 'Rey Navarrete');
    setFlag('campeon');
    if (!hasItem('teja') && !flag('techo')) setFlag('teja_pend', false);
    await fadeTo(1, 30);
    Sound.play('credits');
    const cr = open(new CreditsScene());
    await fadeTo(0, 20);
    await cr;
    await fadeTo(1, 10);
    for (const m of G.party) m.heal();
    takeItem('llave');
    WORLD.load('pitch_nicole', 6, 2, 'down');
    G.lastHeal = { map: 'pitch_nicole', x: 6, y: 1 };
    saveGame();
    await fadeTo(0, 30);
    await say(['Despertaste en tu cama de la pensión. Todo parece igual... pero el reino se siente distinto.', '(La partida se guardó. ¡Se abrió el post-juego: Torre P.A. en Prados Montaje, Edison en Villa Storyboard, revanchas y más!)']);
  },
  // ---------- POST-JUEGO ----------
  async edison() {
    const pairs = [
      { id: 'p1', n: 'Alessandro y Gabriela', looks: ['alessandro', 'gabriela2'], team: [['zumbaccino', 48], ['rollazo', 47], ['palomaiz', 47], ['inferpavo', 50]] },
      { id: 'p2', n: 'Pachi y André', looks: ['pachi', 'andre'], team: [['longbao', 49], ['duendecillo', 48], ['dobleriesgo', 49], ['crisalmanza', 50]] },
      { id: 'p3', n: 'Oscar y Piero', looks: ['oscar', 'piero'], team: [['hedroble', 49], ['glaciolote', 50], ['medubass', 49], ['wyvernax', 50]] },
      { id: 'p4', n: 'Tamara y Luchito', looks: ['tamara', 'luchito'], team: [['alquimero', 50], ['claqueton', 50], ['lucilente', 50], ['dobleriesgo', 51]] },
      { id: 'p5', n: 'Andrea y Dan', looks: ['andrea', 'dan'], team: [['zumbaccino', 51], ['boomguru', 51], ['medubass', 51], ['espinardo', 52]] },
    ];
    await say(['¡Ey! Soy Edison. Organizo combates de parejas: gente del reino que pelea junta.', 'Algunas parejas son de amigos, otras de hermanos, otras de... bueno, de esos que comparten taza.'], 'Edison');
    const i = await listMenu({ title: 'PAREJAS', items: pairs.map((p) => ({ label: p.n, sub: flag('tr_' + p.id) ? '✓' : '' })) });
    if (i < 0) return say('Cuando quieras. Las parejas no se van a ningún lado. Bueno, a veces sí.', 'Edison');
    const p = pairs[i];
    const won = await trainerBattle({ def: { trainer: { id: p.id + (flag('tr_' + p.id) ? 'r' + FRAME : ''), name: p.n, looks: p.looks, team: p.team, money: 4000, intro: '¡Juntos somos invencibles! ...Casi.', lose: 'Bueno... al menos perdimos juntos.' } }, look: p.looks[0] });
    if (won && !flag('tr_' + p.id)) setFlag('tr_' + p.id);
    if (won) await say('¡Qué combate! Cuando ganes a todas las parejas, sube a la Torre P.A. Arriba de todo te espero yo. Bueno, mi versión de la torre.', 'Edison');
  },
  async taquillon() {
    await say('La azotea estalla en aplausos que nadie está dando. Una criatura dorada te mira, como si esperara una ovación.');
    if (!flag('tr_tw5')) return say('...Se desvanece. Quizás quiera ver primero quién domina la Torre.');
    sfx('exclaim');
    const m = new Mon('taquillon', 55);
    const r = await doBattle({ wild: m, bg: 'tower', music: 'king' });
    if (r === 'caught') { setFlag('taquillon'); WORLD.refreshNpcs(); return say('¡La sala entera aplaude de pie! (O eso se siente.)'); }
    if (r === 'win') await say('Taquillón se desvaneció entre luces... Volverá a aparecer cuando estés listo para el estreno.');
  },
};
