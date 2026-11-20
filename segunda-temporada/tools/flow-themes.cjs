module.exports = async (p) => {
  const out = process.argv[2];
  const top = async (n) => p.locator('#top').screenshot({ path: out + '/th-' + n + '.png' });
  const go = async (n, map, x, y) => { await p.evaluate(([m, x, y]) => { WORLD.load(m, x, y, 'down'); Banner.t = 0; Fade.a = 0; }, [map, x, y]); await p.waitForTimeout(250); await top(n); };
  await p.evaluate(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); G.party = [new Mon('flameye', 8)]; WORLD = new World(); Scenes.push(WORLD); linkInteriors(); });
  await go('1pitch', 'pitch', 11, 9); await go('2pitch2', 'pitch', 15, 6);
  await go('3story', 'storyboard', 11, 8); await go('4rodaje', 'rodaje', 11, 8); await go('5feria', 'feria', 14, 9);
  await go('6montaje', 'montaje', 13, 8); await go('7montaje2', 'montaje', 11, 16);
  await go('8ruta5', 'ruta5', 7, 9); await go('9castillo', 'castillo', 10, 8);
  await go('a_ale', 'pitch_ale', 4, 5); await go('b_sbst', 'sb_studio', 5, 6); await go('c_pmcasa', 'pm_casa', 4, 5);
  for (const bg of ['feudal', 'viking', 'native', 'andes', 'inca']) {
    const url = await p.evaluate((bg) => { const cv = mkCanvas(256, 192), c = cv.getContext('2d'); c.drawImage(battleBg(bg), 0, 0); platform(c, 190, 96, 50, 11, bg); platform(c, 70, 152, 66, 13, bg); c.drawImage(creatureSprite('salamandro'), 150, 18); drawSpriteScaled(c, creatureSprite('flameye', true), 6, 24, 2); return cv.toDataURL(); }, bg);
    require('fs').writeFileSync(out + '/th-z' + bg + '.png', Buffer.from(url.split(',')[1], 'base64'));
  }
};
