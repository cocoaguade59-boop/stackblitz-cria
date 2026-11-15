// Punto 11: aviso de "hay algo acá".
// Prueba la lógica pura de src/world/tile-ping.js: qué se detecta, cuándo
// suena y cuándo NO suena (que es igual de importante: un aviso que salta
// todo el tiempo es peor que no tenerlo).

let fails = 0;
const ok = (cond, label) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) fails++;
};

const { findPingAt, createPingState, shouldPing, pingKey, PING_KIND } = await import(
  '../src/world/tile-ping.js'
);

// Tablero de prueba: pines en un set de "c,r", NPCs en un map.
const makeWorld = (pins = [], npcs = {}) => ({
  isPinTile: (c, r) => pins.includes(`${c},${r}`),
  npcAt: (c, r) => npcs[`${c},${r}`] || null,
});

console.log('\n=== Detección ===');

const vacio = makeWorld();
ok(findPingAt({ cx: 5, cy: 5, ...vacio }) === null, 'casilla vacía y sin vecinos → nada');

const unPin = makeWorld(['6,5']);
const pinDer = findPingAt({ cx: 5, cy: 5, ...unPin });
ok(!!pinDer && pinDer.kind === 'pin', 'pin a la derecha se detecta');
ok(pinDer.at.c === 6 && pinDer.at.r === 5, 'reporta la casilla del pin, no la del jugador');

ok(!!findPingAt({ cx: 5, cy: 5, ...makeWorld(['5,5']) }), 'pin EN la casilla del jugador también cuenta');
ok(!!findPingAt({ cx: 5, cy: 5, ...makeWorld(['5,4']) }), 'pin arriba');
ok(!!findPingAt({ cx: 5, cy: 5, ...makeWorld(['5,6']) }), 'pin abajo');
ok(!!findPingAt({ cx: 5, cy: 5, ...makeWorld(['4,5']) }), 'pin a la izquierda');
ok(findPingAt({ cx: 5, cy: 5, ...makeWorld(['7,5']) }) === null, 'pin a 2 casillas NO se detecta');
ok(findPingAt({ cx: 5, cy: 5, ...makeWorld(['4,4']) }) === null, 'diagonal NO se detecta');

// NPCs
const conNpc = makeWorld([], { '6,5': { nm: 'Nico', flag: 'metNico' } });
const npcHit = findPingAt({ cx: 5, cy: 5, ...conNpc, npcIsNew: () => true });
ok(!!npcHit && npcHit.kind === 'npc', 'NPC nuevo se detecta');
ok(npcHit.label.includes('Nico'), `el aviso nombra al NPC ("${npcHit.label}")`);
ok(
  findPingAt({ cx: 5, cy: 5, ...conNpc, npcIsNew: () => false }) === null,
  'NPC ya hablado NO genera aviso'
);

// Prioridad: si hay pin y NPC a la vez, gana el pin (es lo que se recoge con C).
const ambos = makeWorld(['4,5'], { '6,5': { nm: 'Ana' } });
const prio = findPingAt({ cx: 5, cy: 5, ...ambos, npcIsNew: () => true });
ok(prio.kind === 'pin', 'pin le gana al NPC cuando hay ambos');
ok(PING_KIND.pin.prio > PING_KIND.npc.prio, 'la tabla de prioridades coincide');

// Tolerancia a errores: un isPinTile que explota no debe romper el juego.
const roto = {
  isPinTile: () => {
    throw new Error('boom');
  },
  npcAt: () => null,
};
let crashed = false;
try {
  findPingAt({ cx: 5, cy: 5, ...roto });
} catch (e) {
  crashed = true;
}
ok(!crashed, 'un isPinTile que falla no rompe el ping (se ignora)');

console.log('\n=== Cuándo suena y cuándo no ===');

const st = createPingState();
const p = { kind: 'pin', label: 'x', at: { c: 6, r: 5 } };

ok(shouldPing(st, null, 0) === null, 'sin hallazgo → no suena');
ok(!!shouldPing(st, p, 10), 'primer hallazgo → suena');
ok(shouldPing(st, p, 40) === null, 'el MISMO hallazgo no vuelve a sonar nunca');

const st2 = createPingState();
const q = { kind: 'pin', label: 'x', at: { c: 9, r: 9 } };
ok(!!shouldPing(st2, q, 10), 'hallazgo nuevo → suena');
ok(shouldPing(st2, { kind: 'pin', at: { c: 12, r: 12 } }, 12) === null, 'no suena de nuevo 2 pasos después (anti-ráfaga)');
ok(!!shouldPing(st2, { kind: 'pin', at: { c: 12, r: 12 } }, 20), 'sí suena cuando pasaron pasos suficientes');

const st3 = createPingState();
shouldPing(st3, { kind: 'npc', at: { c: 1, r: 1 } }, 0);
ok(
  st3.count === 1 && st3.lastStep === 0,
  'el estado registra cuántos avisos hubo y cuándo fue el último'
);

ok(pingKey({ kind: 'pin', at: { c: 3, r: 4 } }) === 'pin:3,4', 'la clave del aviso es estable y legible');
ok(
  pingKey({ kind: 'npc', at: { c: 3, r: 4 } }) !== pingKey({ kind: 'pin', at: { c: 3, r: 4 } }),
  'pin y NPC en la misma casilla no se pisan'
);

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
