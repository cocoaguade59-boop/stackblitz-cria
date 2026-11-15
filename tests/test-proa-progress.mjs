// El avance de las misiones Proa debe sobrevivir guardar/cargar y debe
// borrarse al reiniciar la partida.
const { createProaMissions, resetProaMissionProgress, getProaMissionProgress, applyProaMissionProgress } =
  await import('../src/data/proa-missions.js');

let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

const party = [];
const m = createProaMissions(() => party);

// 1) progreso inicial en cero
ok(m.luchito.superEffectiveHits === 0, 'Luchito arranca en 0');
ok(m.dan.gossip === 0 && m.dan.reported.length === 0, 'Dan arranca en 0');

// 2) simular juego y serializar
m.luchito.superEffectiveHits = 2;
m.dan.gossip = 2;
m.dan.reported = [0, 3];
m.andrea.quizScore = 1;
const saved = JSON.parse(JSON.stringify(getProaMissionProgress(m)));
ok(saved.luchito.superEffectiveHits === 2, 'serializa golpes de Luchito');
ok(saved.dan.reported.length === 2, 'serializa chismes reportados de Dan');
ok(!('dlgStart' in saved.luchito), 'NO serializa diálogos (sólo progreso)');
ok(!('questions' in saved.andrea), 'NO serializa preguntas del quiz');

// 3) cargar en una instancia nueva
const m2 = createProaMissions(() => party);
ok(m2.luchito.superEffectiveHits === 0, 'instancia nueva arranca en 0');
ok(applyProaMissionProgress(m2, saved) === true, 'aplica el progreso guardado');
ok(m2.luchito.superEffectiveHits === 2, 'golpes restaurados');
ok(m2.dan.gossip === 2 && m2.dan.reported.length === 2, 'chismes restaurados');
ok(m2.andrea.quizScore === 1, 'quiz restaurado');
ok(typeof m2.andrea.check === 'function', 'los métodos siguen vivos tras cargar');

// 4) reset limpia todo
resetProaMissionProgress(m2);
ok(m2.luchito.superEffectiveHits === 0, 'reset limpia golpes');
ok(m2.dan.gossip === 0 && m2.dan.reported.length === 0, 'reset limpia chismes');
ok(m2.andrea.quizScore === 0 && m2.andrea.quizIdx === 0, 'reset limpia quiz');

// 5) tolerancia a basura (saves viejos, campos corruptos)
const m3 = createProaMissions(() => party);
ok(applyProaMissionProgress(m3, undefined) === false, 'undefined no rompe');
ok(applyProaMissionProgress(m3, null) === false, 'null no rompe');
ok(applyProaMissionProgress(m3, {}) === false, 'objeto vacío no rompe');
applyProaMissionProgress(m3, { luchito: { superEffectiveHits: 'cinco' }, dan: { reported: 'no-es-array' } });
ok(m3.luchito.superEffectiveHits === 0, 'tipo inválido (string) se ignora');
ok(Array.isArray(m3.dan.reported), 'array inválido se ignora');
ok(m3.dan.reported.length === 0, 'dan.reported sigue siendo array vacío');

// 6) un save viejo SIN proaProgress no altera nada
const m4 = createProaMissions(() => party);
ok(applyProaMissionProgress(m4, undefined) === false, 'save anterior al fix: sin cambios');
ok(m4.luchito.superEffectiveHits === 0, 'save anterior sigue jugable');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
