globalThis.window = globalThis;
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  key: (i) => Object.keys(store)[i] ?? null,
  get length() { return Object.keys(store).length; },
};
const m = await import('../src/core/save-transfer.js');
const { SAVE_KEY } = await import('../src/core/save.js');

let fails = 0;
const ok = (cond, label) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++; };

// 1) sin save
ok(m.exportSaveCode() === null, 'sin partida → null');

// 2) roundtrip con acentos y emojis
const original = { plx: 20, ply: 145, party: [{ id: 'flameye', lv: 12, nm: 'Flameye' }], gold: 200, note: 'ñandú 🔥 Español' };
localStorage.setItem(SAVE_KEY, JSON.stringify(original));
const code = m.exportSaveCode();
ok(typeof code === 'string' && code.startsWith('CR1-'), 'export produce prefijo CR1-');
ok(!/[+/=]/.test(code.slice(4)), 'base64url sin + / =');
const back = m.inspectSaveCode(code);
ok(back.ok, 'inspect acepta el código propio');
ok(back.ok && back.save.note === 'ñandú 🔥 Español', 'acentos y emoji sobreviven el roundtrip');
ok(back.ok && back.save.party.length === 1, 'equipo intacto');

// 3) errores
ok(!m.inspectSaveCode('').ok, 'vacío rechazado');
ok(!m.inspectSaveCode('XXXX').ok, 'prefijo inválido rechazado');
ok(!m.inspectSaveCode('CR1-@@@no-base64@@@').ok, 'base64 corrupto rechazado');
ok(!m.inspectSaveCode('CR1-' + Buffer.from('{"hola":1}').toString('base64url')).ok, 'JSON sin party rechazado');

// 4) import pisa el save
store[SAVE_KEY] = JSON.stringify({ party: [] });
const res = m.importSaveCode(code);
ok(res.ok, 'import acepta código válido');
ok(JSON.parse(store[SAVE_KEY]).gold === 200, 'import escribió la partida');
const before = store[SAVE_KEY];
ok(!m.importSaveCode('basura').ok && store[SAVE_KEY] === before, 'import inválido NO toca el save');

// 5) código grande (partida realista: 6 criaturas + PC llena)
const big = { party: Array.from({length:6},(_,i)=>({id:'c'+i,lv:40,hp:100,mHp:120,mv:[{nm:'Ataque Ñ',pw:50}]})), proa: Array.from({length:80},(_,i)=>({id:'p'+i,lv:30})), gold: 99999 };
store[SAVE_KEY] = JSON.stringify(big);
const c2 = m.exportSaveCode();
ok(c2.length > 2000 && c2.length < 12000, `código realista mide ${c2.length} chars`);
ok(m.inspectSaveCode(c2).ok, 'partida grande se reimporta OK');

console.log(fails === 0 ? '\nTODO OK' : `\n${fails} FALLOS`);
process.exit(fails ? 1 : 0);
