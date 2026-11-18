module.exports = async (p, key, shot) => {
  const ids = ['pitch', 'ruta1', 'storyboard', 'ruta2', 'rodaje', 'cueva', 'feria', 'ruta4', 'montaje', 'ruta5', 'castillo', 'ft_teatro', 'pm_proa', 'sb_studio'];
  const data = await p.evaluate((ids) => {
    G = newGameState('T', 'p_cap'); WORLD = new World();
    const out = {};
    for (const id of ids) {
      const m = MAPS[id]; WORLD.load(id, 1, 1, 'down'); WORLD.ents.forEach((e) => {});
      const c = document.createElement('canvas'); c.width = m.w * 16; c.height = m.h * 16 + 24; const x = c.getContext('2d');
      x.translate(0, 24);
      for (let y = 0; y < m.h; y++) for (let xx = 0; xx < m.w; xx++) { const L = LEGEND[m.rows[y][xx]] || ['grass']; x.drawImage(tileCanvas(L[0], (xx * 7 + y * 13) & 7, 0), xx * 16, y * 16); }
      for (const b of m.buildings) { const cv = buildingCanvas({ ...b, broken: typeof b.broken === 'function' ? b.broken() : b.broken }); x.drawImage(cv, b.x * 16, (b.y + b.h) * 16 - cv.height); }
      for (const d of m.npcs) { if (d.mon) continue; x.drawImage(personSprite(d.look, 0, 0), d.x * 16, d.y * 16 - 7); }
      for (const f of m.finds) { x.fillStyle = f.hidden ? '#f0f' : '#0ff'; x.fillRect(f.x * 16 + 5, f.y * 16 + 5, 6, 6); }
      out[id] = c.toDataURL();
    }
    return out;
  }, ids);
  const fs = require('fs');
  for (const id of ids) fs.writeFileSync(process.argv[2] + '/map-' + id + '.png', Buffer.from(data[id].split(',')[1], 'base64'));
};
