module.exports = async (p, key, shot) => {
  const { ev, drive } = require(require('path').resolve('tools/lib.cjs'))(p, key, shot);
  const policy = async (s) => { if (s.t === 'World' && s.lock === 0) return null; if (s.t === 'DialogScene' && s.choices && /mote|apodo|Cambias/.test(s.text)) return 'KeyX'; if (['DialogScene', 'ListScene', 'PartyScene', 'CreditsScene'].includes(s.t) || (s.inBattle && s.mode)) return 'KeyZ'; return 'wait'; };
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_bun'); Object.assign(G.flags, { intro: 1, starter: 1, gabLeft: 1, gabStarter: 'gorilan', tr_andre: 1 }); G.bag.llave = 1; G.party = [new Mon('inferpavo', 70), new Mon('glaciolote', 70)]; WORLD = new World(); Scenes.push(WORLD); linkInteriors(); Fade.a = 0; });
  const run = async (label, map, x, y, fn) => { await ev(`WORLD.load('${map}', ${x}, ${y}, 'up'); Fade.a = 0; WORLD.lock++; ${fn}.then(() => WORLD.lock--);`); const s = await drive(policy, 500); console.log(label, '→', s.t, await ev(() => Object.keys(G.flags).filter((k) => /tr_|metAlej|campeon/.test(k)).join(','))); };
  await run('alejandro', 'montaje', 16, 8, 'S.alejandro()');
  await run('alejandro2', 'montaje', 16, 8, 'S.alejandro()');
  await run('nahuel', 'feria', 22, 10, 'S.nahuel()');
  await run('tomas', 'montaje', 9, 16, 'S.tomas()');
  await run('nina', 'montaje', 10, 16, 'S.nina()');
  await ev(() => { WORLD.load('castillo', 10, 2, 'up'); Fade.a = 0; WORLD.lock++; S.rey().then(() => WORLD.lock--); });
  await drive(async (s) => { if (s.inBattle && s.mode === 'cmd') { await shot('rey-battle'); return null; } return policy(s); }, 300);
  console.log('música del castillo:', await ev(() => Sound.curName), 'fondo:', await ev(() => Scenes.stack.find((s) => s instanceof Battle).bg));
};
