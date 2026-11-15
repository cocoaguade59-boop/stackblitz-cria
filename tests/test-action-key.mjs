// La tecla de acción es C (antes ESPACIO/ENTER).
//
// Verifica:
//   1. kAction() responde a 'c'.
//   2. Sigue respondiendo a ESPACIO y ENTER (alias: nadie queda trabado).
//   3. No dispara dos veces por una sola pulsación.
//   4. La UI ya no anuncia ESPACIO/ENTER.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const here = dirname(fileURLToPath(import.meta.url));
let fails = 0;
const ok = (c, l) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fails++; };

// ---- ejecutar input.js con un DOM falso para capturar los listeners ----
const src = readFileSync(join(here, '..', 'src', 'core', 'input.js'), 'utf8')
  .replace(/import [^;]+;/g, '')
  .replace(/export \{[^}]+\};?/, '');

const listeners = {};
const sandbox = {
  console, document: { addEventListener: (ev, fn) => { (listeners[ev] ||= []).push(fn); } },
  sfx: { init() {} },
  G: { keys: {}, held: {}, kcd: {} },
};
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);
vm.runInContext(src + '\nthis.__out = { kp, kAction, ACTION_KEYS, ACTION_ALIASES };', ctx);
const { kAction, kp } = sandbox.__out;

const down = (key) => listeners.keydown.forEach((f) => f({ key, preventDefault() {} }));
const up = (key) => listeners.keyup.forEach((f) => f({ key }));

// 1) C es la tecla de acción
down('c');
ok(kAction() === true, "C dispara la acción");
ok(kAction() === false, "C no se dispara dos veces en el mismo pulsado");
up('c');
ok(kAction() === false, "al soltar C deja de disparar");

// 2) alias: ESPACIO y ENTER siguen funcionando
down(' ');
ok(kAction() === true, "ESPACIO sigue funcionando (alias)");
up(' ');
down('Enter');
ok(kAction() === true, "ENTER sigue funcionando (alias)");
up('Enter');

// 3) mayúscula (con Shift o Bloq Mayús) también vale
down('C');
ok(kAction() === true, "C mayúscula también vale");
up('C');

// 4) otras teclas no disparan la acción
down('x');
ok(kAction() === false, "X no dispara la acción");
up('x');

// 5) la UI no anuncia ESPACIO/ENTER
const uiFiles = ['src/screens/title.js', 'src/screens/dialog.js', 'src/screens/trade.js',
  'src/screens/objects.js', 'src/screens/craft.js', 'src/screens/shop.js'];
let anuncios = [];
for (const f of uiFiles) {
  const txt = readFileSync(join(here, '..', f), 'utf8');
  for (const m of txt.matchAll(/(?:fillText|aN)\((['"`])([^'"`]*(?:SPACE|ESPACIO|ENTER)[^'"`]*)\1/g)) {
    anuncios.push(`${f}: "${m[2].slice(0, 50)}"`);
  }
}
ok(anuncios.length === 0, anuncios.length === 0
  ? 'la UI ya no anuncia SPACE/ENTER'
  : 'todavía anuncian ESPACIO: ' + anuncios.slice(0, 3).join(' | '));

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
