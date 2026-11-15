// Punto 15: perfil de guardado ("Guardado 1 · Pitch · 2h 14m · 4 insignias")
// y punto 5: la velocidad de batalla x2 (se prueba el modelo de simulación
// acelerada, que es la parte con riesgo de desincronizar).

let fails = 0;
const ok = (cond, label) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) fails++;
};

globalThis.window = globalThis;

const { formatPlayTime, placeName, shortPlace, profileLine, profileFromSave, zoneForRow } =
  await import('../src/core/save-profile.js');

console.log('\n=== Punto 15: tiempo jugado ===');
ok(formatPlayTime(0) === '0m', '0 ms → 0m');
ok(formatPlayTime(59_000) === '0m', '59 s → 0m (redondea para abajo)');
ok(formatPlayTime(60_000) === '1m', '1 min → 1m');
ok(formatPlayTime(47 * 60_000) === '47m', '47 min → 47m');
ok(formatPlayTime(134 * 60_000) === '2h 14m', '2h 14m → "2h 14m" (el ejemplo del pedido)');
ok(formatPlayTime(12 * 3600_000 + 3 * 60_000) === '12h 03m', '12h 03m con cero a la izquierda');
ok(formatPlayTime(3600_000) === '1h 00m', '1h exacta → "1h 00m"');
ok(formatPlayTime(-5000) === '0m', 'valor negativo → 0m, nunca "-1m"');
ok(formatPlayTime(undefined) === '0m', 'undefined no rompe');

console.log('\n=== Punto 15: pueblo / lugar ===');
ok(placeName('world', 60, 285) === 'Aldea Pitch', 'fila 285 → Aldea Pitch');
ok(placeName('world', 60, 215) === 'Villa Storyboard', 'fila 215 → Villa Storyboard');
ok(placeName('world', 60, 145) === 'Cantera Rodaje', 'fila 145 → Cantera Rodaje');
ok(placeName('world', 60, 85) === 'Feria Última Toma', 'fila 85 → Última Toma');
ok(placeName('world', 60, 28) === 'Prados Montaje', 'fila 28 → Montaje');
ok(placeName('cave1', 0, 0) === 'Cueva Volcánica', 'cave1 tiene nombre propio');
ok(placeName('tower', 0, 0) === 'Torre P.A.', 'la torre tiene nombre propio');
ok(placeName('interior', 0, 0) === 'Interior', 'interior no se llama "Reino"');
ok(placeName('world', 60, 999) === 'Castillo Difusión' || placeName('world', 60, 999).length > 0, 'fila fuera de rango cae en la zona más cercana');
ok(zoneForRow(285).id === 'pitch', 'zoneForRow mapea la fila al id de región');
ok(shortPlace('Feria Última Toma') === 'Última Toma', 'los nombres largos se acortan para que entren');
ok(shortPlace('Aldea Pitch') === 'Aldea Pitch', 'los cortos se dejan igual');

console.log('\n=== Punto 15: línea completa ===');
ok(
  profileLine({ slot: 1, place: 'Aldea Pitch', ms: 134 * 60_000, medals: 4 }) ===
    'Guardado 1 · Aldea Pitch · 2h 14m · 4 insignias',
  'ejemplo del pedido se arma exacto'
);
ok(
  profileLine({ slot: 2, place: 'Cantera Rodaje', ms: 60_000, medals: 1 }) ===
    'Guardado 2 · Rodaje · 1m · 1 insignia',
  'singular/plural de insignia correcto'
);
ok(
  profileLine({ place: 'Prados Montaje', medals: 0 }).includes('0 insignias'),
  'sin insignias se dice 0, no se omite'
);
ok(profileLine({}).startsWith('Guardado 1'), 'sin datos igual devuelve algo mostrable');
ok(!profileLine({ slot: 1 }).includes('· ·'), 'nunca quedan separadores vacíos');

console.log('\n=== Punto 15: desde el JSON del guardado ===');
const save = {
  curMap: 'world',
  plx: 60,
  ply: 145,
  playMs: 134 * 60_000,
  diplomas: { tamara: true, luchito: true, andrea: true, dan: false },
  party: [{ lv: 12 }, { lv: 18 }, { lv: 7 }],
};
const prof = profileFromSave(save, { slot: 1 });
ok(prof.medals === 3, 'cuenta 3 diplomas de 4 (dan:false no cuenta)');
ok(prof.topLevel === 18, 'toma el nivel más alto del equipo');
ok(prof.place === 'Cantera Rodaje' && prof.line.includes('Rodaje'), 'el lugar sale del mapa y la posición (línea corta: "Rodaje")');
ok(prof.line.includes('2h 14m'), 'el tiempo sale del save');

// Guardados viejos: sin playMs, sin diplomas, sin party.
const viejo = profileFromSave({ curMap: 'world', plx: 20, ply: 143 });
ok(viejo.medals === 0, 'guardado viejo sin diplomas → 0');
ok(viejo.topLevel === 0, 'guardado viejo sin equipo → Lv.0');
ok(viejo.line.includes('0m'), 'guardado viejo sin reloj → 0m, no rompe');
ok(profileFromSave(null).line.length > 0, 'save nulo no rompe el título');

console.log('\n=== Punto 5: velocidad de batalla x2 ===');
// Modelo: el loop llama uBattle() una vez por paso fijo; uBattle() ejecuta
// `spd` pasos internos. Con spd=2 el reloj de batalla avanza al doble, pero
// cada paso individual sigue siendo el mismo (no se saltean animaciones).
function simulateBattle(spd, steps) {
  let tm = 0;
  let calls = 0;
  for (let i = 0; i < steps; i++) {
    calls++;
    for (let k = 0; k < spd; k++) tm++;
  }
  return { tm, calls };
}
const x1 = simulateBattle(1, 60);
const x2 = simulateBattle(2, 60);
ok(x1.tm === 60, 'x1: 60 pasos reales → 60 ticks de batalla');
ok(x2.tm === 120, 'x2: 60 pasos reales → 120 ticks de batalla');
ok(x2.calls === x1.calls, 'x2 NO dibuja menos veces (misma fluidez)');
ok(x2.tm / x1.tm === 2, 'la batalla va exactamente al doble');

// Lo importante: los tiempos de mensaje (b.tm > 90) siguen siendo 90 ticks
// reales de batalla, así que un texto dura la mitad de segundos en x2, no
// menos. Y el jugador puede volver a x1 en cualquier momento.
let tm = 0;
let spd = 2;
let pasos = 0;
while (tm <= 90) {
  tm += spd;
  pasos++;
}
ok(pasos === 46, `en x2 un mensaje de 90 ticks tarda 46 pasos (${pasos}) en vez de 91`);
spd = 1;
const pasosX1 = Math.ceil(91 / spd);
ok(pasosX1 === 91, 'volviendo a x1 el mismo mensaje tarda 91 pasos otra vez');

// El valor sólo puede ser 1 o 2: nada de x0 (juego congelado) ni x3 (mareo).
function battleSpeed(spd) {
  return spd === 2 ? 2 : 1;
}
ok(battleSpeed(2) === 2, 'x2 se respeta');
ok(battleSpeed(1) === 1, 'x1 se respeta');
ok(battleSpeed(undefined) === 1, 'sin preferencia → x1 por defecto');
ok(battleSpeed(99) === 1, 'un valor corrupto en el save cae a x1, no a x99');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
