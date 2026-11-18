module.exports = async (p, key, shot) => {
  const L = require(require('path').resolve('tools/lib.cjs'))(p, key, shot);
  const { ev, untilFree, drive } = L;
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); WORLD = new World(); Scenes.push(WORLD); WORLD.load('pitch_ale', 3, 2, 'up'); Fade.a = 0; setFlag('intro'); WORLD.refreshNpcs(); });
  await key('KeyZ');
  let shotN = 0;
  await drive(async (s) => { if (s.t === 'StarterScene') { await shot('11-starter'); return 'KeyZ'; } if (s.inBattle && shotN < 2 && s.mode === 'cmd') { shotN++; await shot('13-cmd'); return 'KeyZ'; } if (s.inBattle && s.mode === 'moves' && shotN < 3) { shotN++; await shot('14-moves'); return 'KeyZ'; } const d = { t: s.t }; void d; return (s.t === 'World' && s.lock === 0) ? null : (s.t === 'DialogScene' && s.choices && /mote/.test(s.text)) ? 'KeyX' : (s.inBattle && (s.mode === 'cmd' || s.mode === 'moves')) ? 'KeyZ' : s.t === 'DialogScene' ? 'KeyZ' : 'wait'; }, 600);
  await shot('16-after');
  console.log(await ev(() => JSON.stringify({ flags: G.flags, party: G.party.map((m) => [m.id, m.lv, m.hp, m.xp]), bag: G.bag, top: Scenes.top().constructor.name, map: WORLD.map.id, ents: WORLD.ents.map((e) => e.def.id) })));
  // salir de la casa y caminar a la ruta 1 con pelea salvaje forzada
  await ev(() => { WORLD.load('ruta1', 2, 3, 'down'); });
  await p.waitForTimeout(500); await shot('17-ruta1');
  await ev(() => { WORLD.lock++; WORLD.encounter([['salamandro', 3, 3, 1]]).then(() => WORLD.lock--); });
  let n = 0;
  await drive(async (s) => {
    if (s.inBattle && s.mode === 'cmd') { n++; if (n === 1) { await shot('18-wild'); } if (n === 2) { await key('ArrowLeft'); await key('ArrowDown'); await key('ArrowRight'); await key('ArrowLeft'); await key('ArrowDown'); return 'ArrowLeft'; } return 'KeyZ'; }
    return (s.t === 'World' && s.lock === 0) ? null : s.t === 'DialogScene' && s.choices && /mote/.test(s.text) ? 'KeyX' : s.t === 'DialogScene' || (s.inBattle && s.mode) ? 'KeyZ' : s.t === 'ListScene' || s.t === 'PartyScene' ? 'KeyZ' : 'wait';
  }, 600);
  await shot('19-after-wild');
  console.log(await ev(() => JSON.stringify({ party: G.party.map((m) => [m.id, m.lv, m.hp, m.xp]), dex: G.dex, bag: G.bag })));
};
