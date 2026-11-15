// Comprueba que el marco de efectividad (punto 6) SE PINTA de verdad en el
// botón de movimiento, no sólo que la función devuelve el color correcto.
//
// Se llama a dMoveButton() con un canvas falso que anota cada fillRect y cada
// fillText, y se verifica:
//   - que aparecen rectángulos exactamente del color esperado,
//   - que forman un marco alrededor de la casilla (4 lados, 2 px, por fuera),
//   - que las marcas amarillas de "seleccionado" siguen intactas,
//   - que en un ataque neutral NO se pinta ningún marco,
//   - que un movimiento sin PP no lleva marco (está deshabilitado).

let fails = 0;
const ok = (cond, label) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + label);
  if (!cond) fails++;
};

const rects = [];
const texts = [];
let _fill = '#000';
const ctxStub = new Proxy(
  {},
  {
    get(_t, p) {
      if (p === 'fillStyle') return _fill;
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'canvas') return { width: 640, height: 480 };
      if (p === 'fillRect')
        return (x, y, w, h) => {
          rects.push({ x, y, w, h, c: _fill });
        };
      if (p === 'fillText')
        return (t) => {
          texts.push(String(t));
        };
      if (p === 'save' || p === 'restore' || p === 'translate' || p === 'scale') return () => {};
      if (typeof p === 'string') return () => {};
      return undefined;
    },
    set(_t, p, v) {
      if (p === 'fillStyle') _fill = v;
      return true;
    },
  }
);

globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => ({ getContext: () => ctxStub, width: 640, height: 480 }),
  addEventListener: () => {},
};

const { dMoveButton, EFF_SUPER, EFF_WEAK } = await import('../src/render/ui-type-icons.js');

function draw(mv, selected, enemyType) {
  rects.length = 0;
  texts.length = 0;
  dMoveButton(24, 378, 280, 40, mv, selected, enemyType);
  return { rects: rects.slice(), texts: texts.slice() };
}

const mvAgua = { nm: 'Pistola Agua', tp: 'water', pp: 10, mp: 10, pw: 40 };
const mvNormal = { nm: 'Placaje', tp: 'normal', pp: 10, mp: 10, pw: 40 };

console.log('\n=== El marco se dibuja alrededor de la casilla ===');

// Casilla: x=24, y=378, w=280, h=40 → marco esperado por fuera, 2 px.
const vsFuego = draw(mvAgua, false, 'fire'); // agua vs fuego = x2 → naranja
const marco = vsFuego.rects.filter((r) => r.c === EFF_SUPER);
ok(marco.length === 4, `se pintan 4 lados de marco naranja (${marco.length})`);
ok(
  marco.some((r) => r.y === 376 && r.x === 22 && r.w === 284 && r.h === 2),
  'lado superior: 2 px por encima, del ancho de la casilla + 4'
);
ok(
  marco.some((r) => r.y === 418 && r.x === 22 && r.w === 284 && r.h === 2),
  'lado inferior: justo debajo de la casilla'
);
ok(
  marco.some((r) => r.x === 22 && r.y === 376 && r.w === 2 && r.h === 44),
  'lado izquierdo: 2 px de ancho'
);
ok(
  marco.some((r) => r.x === 304 && r.y === 376 && r.w === 2 && r.h === 44),
  'lado derecho: pegado al borde derecho'
);
ok(
  !vsFuego.rects.some((r) => r.c === EFF_WEAK),
  'agua vs fuego NO lleva nada azul'
);

const vsAgua = draw(mvAgua, false, 'plant'); // agua vs planta = x0.5 → azul
const marcoAzul = vsAgua.rects.filter((r) => r.c === EFF_WEAK);
ok(marcoAzul.length === 4, `agua vs planta pinta 4 lados azules (${marcoAzul.length})`);
ok(!vsAgua.rects.some((r) => r.c === EFF_SUPER), 'y ningún lado naranja');

const neutral = draw(mvNormal, false, 'fire'); // normal vs fuego = x1
ok(!neutral.rects.some((r) => r.c === EFF_SUPER || r.c === EFF_WEAK), 'ataque neutral: ni un solo rectángulo de marco');
ok(neutral.rects.length > 5, 'pero el botón se sigue dibujando normal (relieve, interior, cápsula)');

console.log('\n=== Lo que ya existía no se rompe ===');

const sel = draw(mvAgua, true, 'fire');
const amarillo = sel.rects.filter((r) => r.c === '#FFE870');
ok(amarillo.length === 4, `las 4 esquinas de "seleccionado" siguen ahí (${amarillo.length})`);
ok(
  sel.rects.some((r) => r.c === EFF_SUPER),
  'el marco de efectividad convive con la selección (no se pisa)'
);
ok(sel.texts.some((t) => t.includes('Pistola Agua')), 'el nombre del movimiento se sigue viendo');
ok(sel.texts.some((t) => /PP 10\/10/.test(t)), 'los PP se siguen viendo');
ok(sel.texts.some((t) => t === 'Agua' || t === 'AGUA' || /agua/i.test(t)), 'la cápsula de tipo se sigue viendo');

const sinPp = draw({ ...mvAgua, pp: 0 }, true, 'fire');
ok(
  !sinPp.rects.some((r) => r.c === EFF_SUPER || r.c === EFF_WEAK),
  'movimiento sin PP: sin marco (ya está gris y deshabilitado)'
);
ok(sinPp.texts.some((t) => /PP 0\/10/.test(t)), 'sin PP se sigue mostrando PP 0/10');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
