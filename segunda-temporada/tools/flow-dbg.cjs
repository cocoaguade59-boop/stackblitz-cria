module.exports = async (p, key, shot) => {
  const ev = (f) => p.evaluate(f);
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); WORLD = new World(); Scenes.push(WORLD); WORLD.load('pitch', 10, 18, 'up'); Fade.a = 0; WORLD.lock++; S.intro().then(() => WORLD.lock--, (e) => { window.ERR = String(e.stack); }); });
  for (let i = 0; i < 30; i++) { await key('KeyZ', 1, 150); }
  await p.waitForTimeout(3000);
  console.log(await ev(() => JSON.stringify({ lock: WORLD.lock, err: window.ERR, ents: WORLD.ents.map((e) => [e.def.id, e.x, e.y, e.moving]), boot: document.getElementById('boot').textContent.slice(0, 300) })));
};
