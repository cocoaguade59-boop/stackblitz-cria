module.exports = async (p, key, shot) => {
  const ev = (f) => p.evaluate(f);
  const out = process.argv[2];
  const top = async (n) => p.locator('#top').screenshot({ path: out + '/' + n + '.png' });
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); G.party = [new Mon('flameye', 8)]; WORLD = new World(); Scenes.push(WORLD); WORLD.load('pitch', 11, 9, 'down'); Fade.a = 0; Banner.t = 0; });
  await p.waitForTimeout(400); await top('look-pitch');
  await ev(() => { WORLD.load('ruta1', 8, 12, 'up'); Banner.t = 0; }); await p.waitForTimeout(300); await top('look-ruta1');
  await ev(() => { WORLD.load('ruta2', 12, 10, 'up'); Banner.t = 0; }); await p.waitForTimeout(300); await top('look-ruta2');
  await ev(() => { WORLD.load('feria', 12, 10, 'up'); Banner.t = 0; }); await p.waitForTimeout(300); await top('look-feria');
  await ev(() => { WORLD.load('ruta5', 7, 9, 'up'); Banner.t = 0; }); await p.waitForTimeout(300); await top('look-ruta5');
  await ev(() => { WORLD.lock++; startBattle({ wild: new Mon('salamandro', 5), bg: 'grass' }); });
  await p.waitForTimeout(4500); await top('look-battle');
  for (let i = 0; i < 6; i++) { if (await ev(() => Scenes.top() instanceof DialogScene)) await key('KeyZ', 1, 300); else break; }
  await p.waitForTimeout(1500); await top('look-battle2');
  await ev(() => { const b = Scenes.stack.find((s) => s instanceof Battle); b.bg = 'cave'; }); await top('look-cave');
  await ev(() => { const b = Scenes.stack.find((s) => s instanceof Battle); b.bg = 'castle'; b.me.status = 'brn'; }); await top('look-castle');
  await ev(() => { const b = Scenes.stack.find((s) => s instanceof Battle); b.bg = 'stage'; }); await top('look-stage');
};
