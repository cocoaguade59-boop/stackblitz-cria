module.exports = async (p) => {
  const r = await p.evaluate(() => {
    G = newGameState('T', 'p_cap'); WORLD = new World(); linkInteriors();
    const probs = [];
    for (const id of Object.keys(MAPS)) {
      const m = MAPS[id]; WORLD.load(id, 0, 0, 'down'); WORLD.ents = []; // ignorar NPCs
      const ok = (x, y) => { const c = WORLD.ch(x, y); if (c == null) return false; if (c === 'v') return false; return !WORLD.solid(x, y) || (WORLD.bldAt(x, y) && WORLD.bldAt(x, y).door.x === x && WORLD.bldAt(x, y).door.y === y); };
      // semillas: bordes abiertos, entrada, salida
      const seeds = [];
      for (let x = 0; x < m.w; x++) { if (ok(x, 0)) seeds.push([x, 0, 'N']); if (ok(x, m.h - 1)) seeds.push([x, m.h - 1, 'S']); }
      if (m.entry) seeds.push([m.entry.x, m.entry.y, 'entry']);
      if (!seeds.length) { probs.push(id + ': sin semillas'); continue; }
      const seen = new Set([seeds[0][0] + ',' + seeds[0][1]]); const q = [seeds[0]];
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let nx = x + dx, ny = y + dy; if (dy === 1 && WORLD.ch(nx, ny) === 'v') ny++; const k = nx + ',' + ny; if (seen.has(k) || !ok(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } }
      for (const s of seeds) if (!seen.has(s[0] + ',' + s[1])) probs.push(id + ': no llega a ' + s);
      for (const b of m.buildings) if (b.to && !seen.has(b.door.x + ',' + b.door.y)) probs.push(id + ': puerta inaccesible ' + b.to);
      for (const b of m.buildings) if (b.to && !MAPS[b.to]) probs.push(id + ': interior inexistente ' + b.to);
      for (const f of m.finds) { const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((f.x + dx) + ',' + (f.y + dy))); if (!adj) probs.push(id + ': hallazgo inalcanzable ' + f.x + ',' + f.y); if (!f.hidden && WORLD.ch(f.x, f.y) !== null && LEGEND[WORLD.ch(f.x, f.y)][1]) probs.push(id + ': hallazgo sobre sólido ' + f.x + ',' + f.y); if (f.hidden && LEGEND[WORLD.ch(f.x, f.y)][1]) probs.push(id + ': oculto en sólido ' + f.x + ',' + f.y); }
      for (const d of m.npcs) { const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((d.x + dx) + ',' + (d.y + dy)) || (WORLD.ch(d.x + dx, d.y + dy) === 'C' && seen.has((d.x + 2 * dx) + ',' + (d.y + 2 * dy)))); if (!adj) probs.push(id + ': npc inalcanzable ' + d.id); if (LEGEND[WORLD.ch(d.x, d.y)] && LEGEND[WORLD.ch(d.x, d.y)][1]) probs.push(id + ': npc sobre sólido ' + d.id); if (WORLD.bldAt(d.x, d.y)) probs.push(id + ': npc dentro de edificio ' + d.id); }
      for (const [k, L] of Object.entries(m.links || {})) { const T = MAPS[L.to]; if (!T) probs.push(id + ' link roto ' + k); else { for (let x = 0; x < m.w; x++) { const y = k === 'n' ? 0 : m.h - 1; if ((k === 'n' || k === 's') && ok(x, y)) { const tx = x + (L.d || 0), ty = k === 'n' ? T.h - 1 : 0; const c = T.rows[ty] && T.rows[ty][tx]; if (!c || LEGEND[c][1]) probs.push(id + ' ' + k + ': x' + x + ' cae en sólido de ' + L.to + ' (' + tx + ')'); } } } }
      for (const w of m.warps) if (!MAPS[w.to]) probs.push(id + ' warp roto'); 
      if (m.inside && !m.out && id !== 'torre2' && !/torre[2-5]/.test(id)) probs.push(id + ': interior sin salida');
    }
    return probs;
  });
  console.log(r.join('\n') || 'MAPAS OK');
};
