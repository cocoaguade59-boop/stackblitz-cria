module.exports = async (p, key, shot) => {
  await shot('01-title');
  await key('KeyZ'); await p.waitForTimeout(800);
  for (let i = 0; i < 12; i++) await key('KeyZ', 1, 250);
  await shot('02-intro');
  for (let i = 0; i < 10; i++) await key('KeyZ', 1, 250);
  await shot('03-look');
  await key('KeyZ'); await p.waitForTimeout(500);
  await p.keyboard.type('Sol'); await key('Enter'); await p.waitForTimeout(500);
  for (let i = 0; i < 8; i++) await key('KeyZ', 1, 300);
  await p.waitForTimeout(1500);
  await shot('04-pitch');
  for (let i = 0; i < 10; i++) await key('KeyZ', 1, 300);
  await p.waitForTimeout(3000);
  await shot('05-after-intro');
  console.log(await p.evaluate(() => JSON.stringify({ pos: G.pos, flags: G.flags, top: Scenes.top().constructor.name, lock: WORLD.lock })));
};
