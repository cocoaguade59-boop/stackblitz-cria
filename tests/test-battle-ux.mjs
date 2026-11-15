// Punto 6 (contorno de efectividad) y punto 8 (PP 0).
// Se prueban las funciones puras: moveEffFrame() decide el color del marco y
// la navegación de la rejilla de movimientos saltea los que no tienen PP.

let fails = 0;
const ok = (cond, label) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) fails++;
};

// ui-type-icons.js usa document/canvas para dibujar, pero moveEffFrame() es
// lógica pura. Se importa el módulo real con un canvas falso mínimo.
globalThis.window = globalThis;
const ctxStub = new Proxy(
  {},
  {
    get: (t, k) => {
      if (k === 'canvas') return { width: 640, height: 480 };
      return () => {};
    },
    set: () => true,
  }
);
globalThis.document = {
  getElementById: () => ({ getContext: () => ctxStub, width: 640, height: 480 }),
  addEventListener: () => {},
};

const { moveEffFrame, EFF_SUPER, EFF_WEAK } = await import(
  '../src/render/ui-type-icons.js'
);
const { tEff } = await import('../src/data/types.js');

console.log('\n=== Punto 6: contorno de efectividad ===');

ok(moveEffFrame('water', 'fire') === EFF_SUPER, 'agua vs fuego → naranja (súper eficaz)');
ok(EFF_SUPER === '#F08A20', 'naranja = #F08A20');
ok(moveEffFrame('fire', 'water') === EFF_WEAK, 'fuego vs agua → azul (poco eficaz)');
ok(EFF_WEAK === '#3C7AE0', 'azul = #3C7AE0');
ok(moveEffFrame('plant', 'water') === EFF_SUPER, 'planta vs agua → naranja');
ok(moveEffFrame('water', 'plant') === EFF_WEAK, 'agua vs planta → azul');
ok(moveEffFrame('normal', 'normal') === null, 'neutral → sin contorno');
ok(moveEffFrame('normal', 'fire') === null, 'normal vs fuego (×1) → sin contorno');
ok(tEff('dragon', 'fairy') === 0, 'la tabla tiene al menos un ×0 (dragón vs hada)');
ok(moveEffFrame('dragon', 'fairy') === EFF_WEAK, 'inmune (×0) → azul, el extremo de "pega poco"');
ok(moveEffFrame('fire', 'water') !== EFF_SUPER, 'fuego vs agua nunca sale naranja');
// Sólo dos colores posibles: si apareciera un tercero se rompería el pedido
// de minimalismo (naranja / azul / nada).
const coloresVistos = new Set();
for (const a of ['fire', 'water', 'plant', 'dragon', 'fairy', 'fighting', 'steel', 'normal']) {
  for (const d of ['fire', 'water', 'plant', 'dragon', 'fairy', 'fighting', 'steel', 'normal']) {
    const f = moveEffFrame(a, d);
    if (f) coloresVistos.add(f);
  }
}
ok(coloresVistos.size === 2, `sólo 2 colores de marco en toda la tabla (vistos: ${[...coloresVistos].join(', ')})`);

// Nunca debe devolver un color para efectividad 1: eso llenaría la pantalla
// de marcos y arruinaría el minimalismo que pidió el usuario.
let neutrales = 0;
for (const a of ['fire', 'water', 'plant', 'electric', 'ice', 'normal', 'fighting']) {
  for (const d of ['fire', 'water', 'plant', 'electric', 'ice', 'normal', 'fighting']) {
    const f = moveEffFrame(a, d);
    const eff = tEff(a, d);
    if (eff === 1) {
      neutrales++;
      if (f !== null) {
        ok(false, `${a} vs ${d} es ×1 pero devolvió ${f}`);
      }
    }
  }
}
ok(neutrales > 0, `revisados ${neutrales} pares neutros, todos sin contorno`);
ok(moveEffFrame(undefined, 'fire') === null, 'sin tipo de ataque → sin contorno');
ok(moveEffFrame('water', undefined) === null, 'sin tipo de enemigo → sin contorno');

console.log('\n=== Punto 8: saltear movimientos sin PP ===');

// Réplica exacta de stepGrid() de game.js (la del input real). Se copia acá
// para poder probarla sin levantar el juego entero.
function stepGrid(mvs, dir, mv) {
  let idx = mvs;
  for (let tries = 0; tries < 4; tries++) {
    if (dir === 'up' || dir === 'down') idx = idx < 2 ? (idx + 2) % 4 : idx - 2;
    else if (dir === 'left') idx = (idx + 3) % 4;
    else idx = (idx + 1) % 4;
    if (mv[idx] && mv[idx].pp > 0) break;
  }
  return idx;
}

const all = [{ pp: 5 }, { pp: 5 }, { pp: 5 }, { pp: 5 }];
ok(stepGrid(0, 'right', all) === 1, 'todos con PP: derecha avanza 1');
ok(stepGrid(0, 'left', all) === 3, 'todos con PP: izquierda da la vuelta');
ok(stepGrid(0, 'down', all) === 2, 'todos con PP: abajo baja a la fila 2');
ok(stepGrid(2, 'up', all) === 0, 'todos con PP: arriba vuelve a la fila 1');

const oneDry = [{ pp: 0 }, { pp: 5 }, { pp: 5 }, { pp: 5 }];
ok(stepGrid(0, 'right', oneDry) === 1, 'siguiente sin PP → salta al de al lado');
ok(stepGrid(3, 'right', oneDry) === 1, 'da la vuelta salteando el 0');

const twoDry = [{ pp: 5 }, { pp: 0 }, { pp: 0 }, { pp: 5 }];
ok(stepGrid(0, 'right', twoDry) === 3, 'dos seguidos sin PP → salta los dos');
ok(stepGrid(3, 'right', twoDry) === 0, 'vuelta completa salteando dos');

const allDry = [{ pp: 0 }, { pp: 0 }, { pp: 0 }, { pp: 0 }];
ok(stepGrid(0, 'right', allDry) === 0, 'todos sin PP → no se mueve (no cuelga)');
ok(stepGrid(1, 'down', allDry) === 1 || stepGrid(1, 'down', allDry) === 3, 'todos sin PP: vuelve tras 4 intentos sin bucle infinito');

// El cursor inicial debe nacer en un movimiento usable.
const partyMoves = [{ pp: 0 }, { pp: 0 }, { pp: 3 }, { pp: 1 }];
const start = Math.max(0, partyMoves.findIndex((m) => m.pp > 0));
ok(start === 2, 'al entrar a Luchar arranca en el primer movimiento con PP');
ok(Math.max(0, [{ pp: 0 }, { pp: 0 }].findIndex((m) => m.pp > 0)) === 0, 'todos agotados → índice 0, sin -1');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
