module.exports = async (p, key, shot) => {
  const out = process.argv[2];
  const top = async (n) => p.locator('#top').screenshot({ path: out + '/pe-' + n + '.png' });
  await p.evaluate(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); Object.assign(G.flags, { intro: 1, starter: 1, gabLeft: 1 }); G.party = [new Mon('ajolotin', 8)]; WORLD = new World(); Scenes.push(WORLD); linkInteriors(); WORLD.load('pitch_nicole', 3, 4, 'up'); Fade.a = 0; Banner.t = 0; });
  await p.evaluate(() => { WORLD.player.dir = 'up'; WORLD.lock++; S.nicole().then(() => WORLD.lock--); });
  await p.waitForTimeout(2500); await top('1nicole');
  await p.evaluate(() => { Scenes.stack.length = 1; WORLD.lock = 0; WORLD.load('pitch', 8, 10, 'right'); Banner.t = 0; });
  await p.waitForTimeout(400); await top('2pitch');
  await p.evaluate(() => { WORLD.load('pitch_ale', 3, 3, 'up'); Banner.t = 0; });
  await p.waitForTimeout(400); await top('3ale');
  await p.evaluate(() => { WORLD.load('sb_studio', 5, 4, 'up'); Banner.t = 0; });
  await p.waitForTimeout(400); await top('4tamara');
  await p.evaluate(() => { WORLD.lock++; startBattle({ wild: new Mon('ajolord', 20), bg: 'feudal' }); });
  await p.waitForTimeout(4000); await top('5ajolord');
};
