module.exports = async (p, key) => {
  const ev = (f) => p.evaluate(f);
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_pony'); Object.assign(G.flags, { intro: 1, starter: 1, gabLeft: 1 }); G.party = [new Mon('flameye', 8)]; WORLD = new World(); Scenes.push(WORLD); linkInteriors(); WORLD.load('pitch', 11, 9, 'down'); Fade.a = 0; });
  const pos = () => ev(() => WORLD.player.x + ',' + WORLD.player.y + ' lock=' + WORLD.lock + ' menu=' + WORLD.menuOpen + ' top=' + Scenes.top().constructor.name);
  // 1) ENTER → EQUIPO → volver con X → caminar
  await key('Enter', 1, 200); await key('KeyZ', 1, 400); await key('KeyX', 1, 400);
  console.log('tras menú:', await pos());
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(700); await p.keyboard.up('ArrowDown'); await p.waitForTimeout(300);
  console.log('después de caminar:', await pos());
  // 2) guion esperando a un NPC que cambia de mapa a mitad de camino
  await ev(() => { WORLD.lock++; const k = npc('kid'); walk(k, 'rrrrrr').then(() => { WORLD.lock--; window.W1 = 'ok'; }); setTimeout(() => WORLD.load('ruta1', 8, 30, 'up'), 50); });
  await p.waitForTimeout(800);
  console.log('guion interrumpido:', await ev(() => window.W1), await pos());
  // 3) bloqueo huérfano: el salvavidas lo libera
  await ev(() => { WORLD.lock = 3; });
  await p.waitForTimeout(5000);
  console.log('salvavidas:', await pos());
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(300);
  console.log('camina otra vez:', await pos());
};
