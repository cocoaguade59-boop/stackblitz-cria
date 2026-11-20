'use strict';
// =====================================================================
//  MUNDO: mapas por tiles, movimiento, NPCs, entrenadores, encuentros
// =====================================================================
const MAPS = {};
// carácter → [tile, sólido, extra]
const LEGEND = {
  '.': ['grass'], ',': ['tall', 0, 'enc'], ':': ['path'], ';': ['sand'], 'q': ['quarry'], '+': ['plaza'], '~': ['water', 1], 'T': ['tree', 1], 'Y': ['pine', 1],
  'f': ['flower'], 'F': ['fence', 1], 'r': ['rock', 1], 'v': ['ledge', 1, 'ledge'], 'S': ['sign', 1, 'sign'], '=': ['bridge'],
  'c': ['cave', 0, 'cave'], 'W': ['cwall', 1], 'l': ['lava', 1], 'o': ['boulder', 1], 'x': ['crystal', 1],
  'k': ['kfloor'], 'K': ['kwall', 1], 'R': ['carpet'], 'P': ['pillar', 1], 'D': ['ldoor', 1, 'lock'],
  'n': ['floor'], 'w': ['iwall', 1], 'i': ['iwall2', 1], 'm': ['mat', 0, 'exit'], 'b': ['bed', 1], 't': ['table', 1], 'p': ['pot', 1], 'h': ['shelf', 1],
  'A': ['hay', 1], 'O': ['well', 1], 'B': ['barrel', 1], 'E': ['runestone', 1], 'J': ['fire', 1], 'N': ['corn', 1], 'u': ['incawall_o', 1], 'g': ['sunstela', 1],
  'C': ['counter', 1, 'counter'], 'Q': ['pc', 1, 'pc'], 'H': ['heal', 1], 'z': ['stage'], 'Z': ['curtain', 1], 's': ['seat', 1], 'e': ['tilefloor'], '^': ['stairs', 0, 'stairs'], ' ': ['void', 1],
};
const DIRS = { down: [0, 1, 0], up: [0, -1, 1], left: [-1, 0, 2], right: [1, 0, 3] };
const DIR_BY_I = ['down', 'up', 'left', 'right'];
const OPP = { down: 'up', up: 'down', left: 'right', right: 'left' };

// Registro de mapas: completa ancho/alto, salidas de interiores y huellas de edificios
function registerMap(id, m) {
  m.id = id; m.h = m.rows.length; m.w = m.rows[0].length;
  m.rows.forEach((r, i) => { if (r.length !== m.w) console.warn('Fila mal medida', id, i, r.length, m.w); });
  m.buildings = m.buildings || []; m.npcs = m.npcs || []; m.warps = m.warps || []; m.signs = m.signs || []; m.finds = m.finds || []; m.events = m.events || [];
  MAPS[id] = m;
}
function linkInteriors() {
  for (const m of Object.values(MAPS)) for (const b of m.buildings) {
    b.door = { x: b.x + Math.floor(b.w / 2), y: b.y + b.h - 1 };
    if (b.to && MAPS[b.to]) { MAPS[b.to].out = { map: m.id, x: b.door.x, y: b.door.y + 1 }; if (!MAPS[b.to].theme) MAPS[b.to].theme = m.theme; }
  }
}

// ---------- entidades ----------
class Ent {
  constructor(def) { Object.assign(this, { x: def.x, y: def.y, dir: def.dir || 'down', look: def.look, def, ox: 0, oy: 0, moving: 0, step: 0, jump: 0, bubble: 0 }); }
}

class World {
  constructor() { this.opaque = true; this.lock = 0; this.menuOpen = false; this.menuSel = 0; this.ents = []; this.player = null; this.map = null; this.camX = 0; this.camY = 0; this.anim = 0; this.stepToggle = 0; }
  // ---------- carga ----------
  load(id, x, y, dir) {
    this.releaseEnts();
    const m = MAPS[id]; this.map = m;
    G.pos = { map: id, x, y, dir };
    this.player = new Ent({ x, y, dir, look: G.look }); this.player.isPlayer = true;
    this.ents = m.npcs.filter((d) => !d.cond || d.cond()).map((d) => new Ent(d));
    this.solidCache = null;
    Sound.play(mapMusic());
    if (m.name && !m.inside) showBanner(m.name);
    this.snapCam();
  }
  refreshNpcs() { const keep = new Set(this.ents.map((e) => e.def)); this.ents = this.ents.filter((e) => !e.def.cond || e.def.cond()); for (const d of this.map.npcs) if (!keep.has(d) && (!d.cond || d.cond())) this.ents.push(new Ent(d)); }
  // ---------- consultas de tiles ----------
  ch(x, y) { const m = this.map; if (x < 0 || y < 0 || x >= m.w || y >= m.h) return null; return m.rows[y][x]; }
  bldAt(x, y) { return this.map.buildings.find((b) => (!b.cond || b.cond()) && x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h); }
  entAt(x, y) { return this.ents.find((e) => e.x === x && e.y === y); }
  solid(x, y, forEnt) {
    const c = this.ch(x, y); if (c == null) return true;
    const L = LEGEND[c] || ['grass'];
    if (L[1]) { if (L[2] === 'lock' && hasItem('llave')) return false; return true; }
    const b = this.bldAt(x, y); if (b && !(b.door.x === x && b.door.y === y && b.to)) return true;
    if (this.finds().some((f) => !f.hidden && f.x === x && f.y === y)) return true;
    const e = this.entAt(x, y); if (e && e !== forEnt) return true;
    if (forEnt && forEnt !== this.player && this.player.x === x && this.player.y === y) return true;
    return false;
  }
  finds() { return this.map.finds.filter((f) => !flag('find_' + this.map.id + '_' + f.x + '_' + f.y)); }
  // ---------- cámara ----------
  pxOf(e) { return [e.x * TS + e.ox, e.y * TS + e.oy]; }
  snapCam() { const [px, py] = this.pxOf(this.player); this.camX = this.clampCam(px + 8 - W / 2, this.map.w * TS, W); this.camY = this.clampCam(py + 8 - H / 2, this.map.h * TS, H); }
  clampCam(v, size, view) { return size <= view ? (size - view) / 2 : clamp(v, 0, size - view); }
  // ---------- actualización ----------
  update() {
    this.anim++;
    for (const e of this.ents) this.stepEnt(e);
    this.stepEnt(this.player);
    if (this.player.moving) return this.snapCam();
    this.snapCam();
    const idle = this.lock > 0 && Scenes.top() === this && !Timers.length && !this.ents.some((e) => e.moving) && Fade.a < 0.01;
    this.stuck = idle ? (this.stuck || 0) + 1 : 0;
    if (this.stuck > 240) { console.warn('Mundo destrabado (lock=' + this.lock + ')'); this.lock = 0; this.stuck = 0; }
    if (this.lock || Scenes.top() !== this) return;
    // menú en pantalla inferior
    if (this.menuOpen) return this.updateMenu();
    if (Input.START) { this.menuOpen = true; this.menuSel = 0; sfx('select'); return; }
    if (Input.tap) { const b = this.menuButtons().find((r) => hit(r)); if (b) { this.menuSel = this.menuButtons().indexOf(b); return this.menuAction(b.k); } }
    if (Input.A || Input.tapTop) return this.interact();
    const d = Input.dir();
    if (d) this.tryMove(d, Input.held.run || Input.held.b);
    // vagabundeo de NPCs
    if (this.anim % 30 === 0) for (const e of this.ents) {
      if (e.def.move === 'wander' && !e.moving && chance(0.35)) { const d2 = pick(DIR_BY_I); e.dir = d2; const [dx, dy] = DIRS[d2]; const h = e.def.home || (e.def.home = { x: e.def.x, y: e.def.y }); if (Math.abs(e.x + dx - h.x) <= 2 && Math.abs(e.y + dy - h.y) <= 2 && !this.solid(e.x + dx, e.y + dy, e)) this.beginMove(e, d2, 1); }
      else if (e.def.move === 'turn' && chance(0.3)) e.dir = pick(DIR_BY_I);
    }
  }
  stepEnt(e) {
    if (!e.moving) return;
    const [dx, dy] = DIRS[e.dir];
    e.prog += e.speed;
    const dist = e.jump ? 32 : 16;
    if (e.prog >= dist) { e.x += dx * (e.jump ? 2 : 1); e.y += dy * (e.jump ? 2 : 1); e.ox = e.oy = 0; e.moving = 0; e.jumpY = 0; const j = e.jump; e.jump = 0; if (e.onArrive) { const f = e.onArrive; e.onArrive = null; f(j); } return; }
    e.ox = dx * e.prog; e.oy = dy * e.prog;
    if (e.jump) e.jumpY = -Math.sin((e.prog / dist) * Math.PI) * 10;
  }
  beginMove(e, dir, speed, jump = false) {
    // si ya se estaba moviendo, se cierra el paso anterior para que ningún guion quede esperando
    if (e.moving && e.onArrive) { const f = e.onArrive; e.onArrive = null; e.x += DIRS[e.dir][0] * (e.jump ? 2 : 1); e.y += DIRS[e.dir][1] * (e.jump ? 2 : 1); e.ox = e.oy = 0; e.moving = 0; e.jump = 0; f(); }
    return new Promise((res) => { e.dir = dir; e.moving = 1; e.prog = 0; e.speed = speed; e.jump = jump; e.step = (e.step % 2) + 1; e.onArrive = res; });
  }
  // al cambiar de mapa, las entidades viejas sueltan sus esperas
  releaseEnts() { for (const e of this.ents.concat(this.player ? [this.player] : [])) if (e.onArrive) { const f = e.onArrive; e.onArrive = null; e.moving = 0; f(); } }
  async tryMove(d, run) {
    const p = this.player; p.dir = d;
    const [dx, dy] = DIRS[d], nx = p.x + dx, ny = p.y + dy;
    // borde del mapa → mapa vecino
    if (nx < 0 || ny < 0 || nx >= this.map.w || ny >= this.map.h) {
      const k = { up: 'n', down: 's', left: 'w', right: 'e' }[d], L = this.map.links && this.map.links[k];
      if (L) return this.edgeTravel(L, d, nx, ny);
      return this.bump();
    }
    const c = this.ch(nx, ny);
    // escalón: sólo se salta hacia abajo
    if (c === 'v') { if (d === 'down' && !this.solid(nx, ny + 1, p)) { this.lock++; sfx('bump'); await this.beginMove(p, d, 2.4, true); this.lock--; return this.afterStep(); } return this.bump(); }
    // puerta de edificio
    const b = this.bldAt(nx, ny);
    if (b && b.to && b.door.x === nx && b.door.y === ny && d === 'up') { sfx('door'); return this.warp(b.to, MAPS[b.to].entry.x, MAPS[b.to].entry.y, 'up'); }
    if (this.solid(nx, ny, p)) {
      const L = LEGEND[c]; if (L && L[2] === 'lock') { this.lock++; await say('La puerta está cerrada con llave. Una llave grande, real y dramática.'); this.lock--; }
      return this.bump();
    }
    this.lock++;
    await this.beginMove(p, d, run ? 3.2 : 1.6);
    this.lock--;
    await this.afterStep();
  }
  bump() { if (this.anim - (this.lastBump || 0) > 18) { sfx('bump'); this.lastBump = this.anim; } }
  async edgeTravel(L, d, nx, ny) {
    const T = MAPS[L.to];
    let tx = nx, ty = ny;
    if (d === 'up') { ty = T.h - 1; tx = nx + (L.d || 0); }
    if (d === 'down') { ty = 0; tx = nx + (L.d || 0); }
    if (d === 'left') { tx = T.w - 1; ty = ny + (L.d || 0); }
    if (d === 'right') { tx = 0; ty = ny + (L.d || 0); }
    await this.warp(L.to, tx, ty, d, true);
  }
  async warp(id, x, y, dir, quick = false) {
    this.lock++;
    await fadeTo(1, quick ? 8 : 12);
    this.load(id, x, y, dir || this.player.dir);
    await wait(2);
    await fadeTo(0, quick ? 8 : 12);
    this.lock--;
    if (this.map.onEnter) { this.lock++; try { await this.map.onEnter(); } finally { this.lock--; } }
  }
  // ---------- tras cada paso ----------
  async afterStep() {
    const p = this.player, m = this.map, c = this.ch(p.x, p.y);
    G.steps++;
    G.pos.x = p.x; G.pos.y = p.y; G.pos.dir = p.dir;
    if (G.incense && G.incense.steps > 0) { G.incense.steps--; if (G.incense.steps === 0) { this.lock++; await say('El aroma del incienso se desvaneció.'); this.lock--; } }
    // salida de interior
    if (c === 'm' && m.out) { sfx('door'); return this.warp(m.out.map, m.out.x, m.out.y, 'down'); }
    const w = m.warps.find((q) => q.x === p.x && q.y === p.y);
    if (w) { sfx('door'); return this.warp(w.to, w.tx, w.ty, w.dir); }
    // eventos por pisada
    for (const ev of m.events) if ((ev.x == null || ev.x === p.x) && ev.y === p.y && (!ev.cond || ev.cond())) { this.lock++; try { await ev.run(); } finally { this.lock--; } return; }
    if (await this.checkTrainers()) return;
    // encuentros
    const L = LEGEND[c] || [];
    const rate = L[2] === 'enc' ? 1 / 9 : L[2] === 'cave' ? 1 / 13 : 0;
    if (rate && m.enc && Math.random() < rate) {
      const table = L[2] === 'cave' ? m.enc.cave || m.enc.grass : m.enc.grass;
      if (table && table.length) await this.encounter(table);
    }
  }
  async encounter(table) {
    let tbl = table;
    if (G.incense && G.incense.steps > 0) { const t = table.filter(([id]) => SPECIES[id].t === G.incense.t); if (t.length && chance(0.65)) tbl = t; }
    const tot = tbl.reduce((a, r) => a + r[3], 0); let r = Math.random() * tot, row = tbl[0];
    for (const q of tbl) { r -= q[3]; if (r <= 0) { row = q; break; } }
    const mon = new Mon(row[0], rint(row[1], row[2]));
    this.lock++;
    try { await doBattle({ wild: mon, bg: this.map.bg }); } finally { this.lock--; }
  }
  async checkTrainers() {
    const p = this.player;
    for (const e of this.ents) {
      const t = e.def.trainer; if (!t || flag('tr_' + t.id) || !(t.sight > 0)) continue;
      if (e.def.cond && !e.def.cond()) continue;
      const [dx, dy] = DIRS[e.dir];
      for (let i = 1; i <= t.sight; i++) {
        const x = e.x + dx * i, y = e.y + dy * i;
        if (x === p.x && y === p.y) { this.lock++; try { await this.trainerSpots(e, i); } finally { this.lock--; } return true; }
        if (this.solid(x, y, e)) break;
      }
    }
    return false;
  }
  async trainerSpots(e, dist) {
    sfx('exclaim'); e.bubble = 40; Sound.play(null);
    await wait(40);
    for (let i = 1; i < dist; i++) await this.beginMove(e, e.dir, 1.6);
    this.player.dir = OPP[e.dir];
    await trainerBattle(e);
  }
  // ---------- interacción ----------
  async interact() {
    const p = this.player, [dx, dy] = DIRS[p.dir];
    let tx = p.x + dx, ty = p.y + dy;
    if (this.ch(tx, ty) === 'C') { tx += dx; ty += dy; } // hablar por encima del mostrador
    const e = this.entAt(tx, ty);
    this.lock++;
    try {
      if (e) return await talkTo(e);
      const f = this.finds().find((q) => q.x === p.x + dx && q.y === p.y + dy);
      if (f) { setFlag('find_' + this.map.id + '_' + f.x + '_' + f.y); sfx('item'); addItem(f.item, f.n || 1); return await say((f.hidden ? '¡Hallazgo! ' : '') + '¡Encontraste ' + (f.n > 1 ? f.n + ' ' : '') + ITEMS[f.item].n + '!'); }
      const c = this.ch(p.x + dx, p.y + dy);
      if (c === 'S') { const s = this.map.signs.find((q) => q.x === p.x + dx && q.y === p.y + dy); return await say(s ? (typeof s.text === 'function' ? s.text() : s.text) : 'El cartel está borroso.'); }
      if (c === 'Q') return await proaMenu();
      if (c === 'h') return await say(pick(['Libros de guion. Uno se llama "Cómo ganarle a un Proa sin llorar".', 'Una colección de DVDs. Todos de comedias románticas. Nadie juzga.', 'Revistas de cine. Una tiene un crucigrama a medio hacer.']));
      if (c === 'b' && this.map.id === 'pitch_nicole') return await S.cama();
      if (c === 'b') return await say('Una cama. Se ve cómoda. Mejor no te acuestes en camas ajenas.');
      if (c === '~') return await say('El agua está clarita. Hay criaturas nadando, pero acá no pican.');
      if (c === 'Z') return await say('El telón. Huele a polvo y a sueños.');
    } finally { this.lock--; }
  }
  // ---------- menú de la Claqueta (pantalla inferior) ----------
  menuButtons() {
    return [
      { k: 'party', l: 'EQUIPO', c: '#48a858', x: 6, y: 92, w: 120, h: 30 }, { k: 'bag', l: 'BOLSA', c: '#e0a030', x: 130, y: 92, w: 120, h: 30 },
      { k: 'dex', l: 'CRIATURARIO', c: '#e05048', x: 6, y: 126, w: 120, h: 30 }, { k: 'save', l: 'GUARDAR', c: '#4878d8', x: 130, y: 126, w: 120, h: 30 },
      { k: 'opts', l: 'OPCIONES', c: '#8060c0', x: 6, y: 160, w: 120, h: 28 }, { k: 'close', l: 'CERRAR', c: '#606878', x: 130, y: 160, w: 120, h: 28 },
    ];
  }
  updateMenu() {
    const n = 6;
    if (Input.rep.left || Input.rep.right) { this.menuSel ^= 1; sfx('blip'); }
    if (Input.rep.up) { this.menuSel = (this.menuSel + n - 2) % n; sfx('blip'); }
    if (Input.rep.down) { this.menuSel = (this.menuSel + 2) % n; sfx('blip'); }
    if (Input.B || Input.START) { this.menuOpen = false; sfx('back'); return; }
    if (Input.A) return this.menuAction(this.menuButtons()[this.menuSel].k);
    if (Input.tap) { const b = this.menuButtons().find((r) => hit(r)); if (b) return this.menuAction(b.k); }
  }
  async menuAction(k) {
    sfx('select');
    this.menuOpen = false;
    if (k === 'close') return;
    this.lock++;
    try {
      if (k === 'party') await partyMenu('view');
      if (k === 'bag') await fieldBag();
      if (k === 'dex') await dexMenu();
      if (k === 'save') { if ((await ask('¿Guardar la partida? Se va a sobrescribir la anterior.', ['Guardar', 'No'])) === 0) { saveGame(); sfx('heal'); await say('Partida guardada. Tu progreso está a salvo, como un buen backup.'); } }
      if (k === 'opts') {
        for (;;) {
          const r = await ask('Opciones', ['Texto: ' + (G.opts.fast ? 'Rápido' : 'Normal'), 'Sonido: ' + (Sound.muted ? 'Apagado' : 'Prendido'), 'Cambio tras K.O.: ' + (G.opts.shift !== false ? 'Sí' : 'No'), 'Listo']);
          if (r === 0) G.opts.fast = !G.opts.fast; else if (r === 1) Sound.toggleMute(); else if (r === 2) G.opts.shift = G.opts.shift === false; else break;
        }
      }
    } finally { this.lock--; }
  }
  // ---------- dibujo ----------
  drawTop(ctx) {
    const m = this.map, cx = Math.round(this.camX), cy = Math.round(this.camY);
    const fr = (this.anim >> 5) & 1, fr4 = (this.anim >> 4) & 3;
    const outside = !m.inside && m.kind !== 'cave';
    ctx.fillStyle = m.inside ? '#101018' : m.kind === 'cave' ? '#201810' : '#2c6a30'; ctx.fillRect(0, 0, W, H);
    const x0 = Math.floor(cx / TS) - 1, y0 = Math.floor(cy / TS) - 1;
    const items = [];
    for (let y = y0; y <= y0 + 14; y++) for (let x = x0; x <= x0 + 17; x++) {
      let c = this.ch(x, y);
      if (c == null) { if (m.inside || m.kind === 'cave') continue; c = m.border || 'T'; }
      const L = LEGEND[c] || ['grass'];
      const frame = L[0] === 'water' || L[0] === 'lava' ? fr4 : L[0] === 'flower' || L[0] === 'pc' || L[0] === 'heal' || L[0] === 'tall' || L[0] === 'fire' ? fr : 0;
      const sx = x * TS - cx, sy = y * TS - cy;
      if (DECOR_TILES.has(L[0])) ctx.drawImage(tileCanvas(m.ground || 'grass', ((x * 7 + y * 13) & 7), 0), sx, sy);
      ctx.drawImage(themeTileCanvas(themedTile(L[0], m.theme), ((x * 7 + y * 13) & 7), frame), sx, sy);
      if (EDGE_GROUP[c]) drawEdges(ctx, c, [this.ch(x, y - 1), this.ch(x, y + 1), this.ch(x - 1, y), this.ch(x + 1, y)], sx, sy, fr);
      if (L[0] === 'tree' || L[0] === 'pine') { const v = (x * 5 + y * 3) & 7, kind = L[0]; items.push({ y: (y + 1) * TS - 0.5, draw: () => ctx.drawImage(treeSprite(kind, v), sx - 2, sy - 14) }); }
    }
    // sombras proyectadas de los edificios
    ctx.fillStyle = '#00000030';
    for (const b of m.buildings) if (!b.cond || b.cond()) { const bx = b.x * TS - cx, by = b.y * TS - cy; ctx.fillRect(bx + b.w * TS, by + 10, 4, b.h * TS - 8); ctx.fillRect(bx + 4, by + b.h * TS, b.w * TS, 3); }
    // hallazgos visibles + brillos de los ocultos
    for (const f of this.finds()) {
      const sx = f.x * TS - cx, sy = f.y * TS - cy;
      if (!f.hidden) { ctx.fillStyle = '#00000040'; ctx.fillRect(sx + 3, sy + 12, 10, 3); drawSpriteScaled(ctx, itemIcon('cristal'), sx, sy - 2 + ((this.anim >> 4) & 1), 1); }
      else if ((this.anim + f.x * 13) % 90 < 8) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + 7, sy + 4, 2, 8); ctx.fillRect(sx + 4, sy + 7, 8, 2); }
    }
    // edificios + árboles + entidades ordenados por profundidad
    for (const b of m.buildings) if (!b.cond || b.cond()) items.push({ y: (b.y + b.h) * TS, draw: () => { const cv = buildingCanvas({ ...b, theme: b.theme || m.theme, broken: typeof b.broken === 'function' ? b.broken() : b.broken }); ctx.drawImage(cv, b.x * TS - cx - (cv.padX || 0), (b.y + b.h) * TS - cv.height - cy); } });
    for (const e of this.ents.concat([this.player])) items.push({ y: e.y * TS + e.oy + 1 + (e.isPlayer ? 0.5 : 0), draw: () => this.drawEnt(ctx, e, cx, cy) });
    items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
    // noche
    if (outside) {
      const h = new Date().getHours();
      if (h >= 20 || h < 6) { ctx.fillStyle = 'rgba(20,30,90,0.32)'; ctx.fillRect(0, 0, W, H); }
      else if (h >= 18) { ctx.fillStyle = 'rgba(240,120,60,0.13)'; ctx.fillRect(0, 0, W, H); }
    }
    if (m.kind === 'cave') { const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,5,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    drawBanner(ctx);
  }
  drawEnt(ctx, e, cx, cy) {
    const sx = e.x * TS + e.ox - cx, sy = e.y * TS + e.oy - cy + (e.jumpY || 0);
    const di = DIRS[e.dir][2];
    const step = e.moving ? (e.prog < 8 || e.jump ? e.step : 0) : 0;
    ctx.fillStyle = '#00000038'; ctx.beginPath(); ctx.ellipse(sx + 8, e.y * TS + e.oy - cy + 14, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    const look = e.isPlayer ? G.look : e.look;
    if (e.def && e.def.mon) { const b = (this.anim >> 4) & 1; ctx.drawImage(creatureIcon(e.def.mon), sx - 8, sy - 18 - b); }
    else ctx.drawImage(personSprite(look, di, step), sx, sy - 7);
    // pasto alto tapa los pies
    const c = this.ch(Math.round((e.x * TS + e.ox) / TS), Math.round((e.y * TS + e.oy) / TS));
    if (c === ',' && !e.jump) { const t = tileCanvas('tall', 0, (this.anim >> 5) & 1); ctx.drawImage(t, 0, 9, 16, 7, sx, sy + 9, 16, 7); }
    if (e.bubble > 0) { e.bubble--; box(ctx, sx + 2, sy - 22, 12, 14, '#fff', '#c03030', '#f8f8f8'); ctx.fillStyle = '#e03030'; ctx.fillRect(sx + 7, sy - 19, 2, 5); ctx.fillRect(sx + 7, sy - 12, 2, 2); }
    if (e.def && e.def.mark && e.def.mark()) { const o = (this.anim >> 3) & 1; ctx.fillStyle = '#f8d040'; ctx.fillRect(sx + 6, sy - 16 - o, 4, 6); ctx.fillRect(sx + 6, sy - 9 - o, 4, 2); }
  }
  drawBot(ctx) {
    botBackdrop(ctx, '#1f2a44', '#253252');
    // cabecera
    ctx.fillStyle = '#141a2c'; ctx.fillRect(0, 0, W, 20); ctx.fillStyle = '#f0c040'; ctx.fillRect(0, 20, W, 1);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#f8f8f8' : '#202020'; ctx.fillRect(i * 10, 0, 10, 4); }
    txt(ctx, (this.map.name || '').slice(0, 17), 86, 7, '#fff', '#000');
    const d = new Date(); txt(ctx, String(d.getHours()).padStart(2, '0') + (d.getSeconds() & 1 ? ':' : ' ') + String(d.getMinutes()).padStart(2, '0'), W - 6, 7, COL.gold, '#000', 'right');
    // diplomas
    DIPLOMAS.forEach((dp, i) => {
      const x = 8 + i * 30, y = 26, has = flag('dip_' + dp.id);
      ctx.fillStyle = has ? dp.c : '#ffffff18'; ctx.fillRect(x, y, 24, 18);
      if (has) { ctx.fillStyle = '#fff'; ctx.fillRect(x + 3, y + 4, 18, 2); ctx.fillRect(x + 3, y + 8, 14, 2); ctx.fillStyle = '#e04040'; ctx.fillRect(x + 17, y + 11, 5, 5); }
      else txt(ctx, '?', x + 9, y + 5, '#ffffff40', null);
    });
    // equipo
    G.party.forEach((m, i) => { const x = 128 + i * 21; ctx.drawImage(creatureIcon(m.id), x - 6, 20, 30, 30); ctx.fillStyle = '#000'; ctx.fillRect(x, 46, 18, 3); ctx.fillStyle = m.fainted ? '#555' : m.hp / m.maxhp > 0.5 ? '#48d048' : m.hp / m.maxhp > 0.2 ? '#f0c030' : '#f04838'; ctx.fillRect(x, 46, Math.ceil(18 * m.hp / m.maxhp), 3); });
    // objetivo
    ctx.fillStyle = '#00000050'; ctx.fillRect(6, 54, 244, 34);
    txt(ctx, 'OBJETIVO', 10, 57, COL.gold, '#000');
    wrapText(currentObjective(), 29).slice(0, 2).forEach((l, i) => txt(ctx, l, 10, 67 + i * 10, '#e8ecf8', '#000'));
    this.menuButtons().forEach((b, i) => pill(ctx, b.x, b.y, b.w, b.h, b.c, b.l, { sel: this.menuOpen && i === this.menuSel }));
    if (!this.menuOpen) { ctx.fillStyle = '#00000048'; ctx.fillRect(0, 90, W, 102); }
  }
}
let WORLD = null;
function mapMusic() { const m = WORLD && WORLD.map; if (!m) return 'town'; return typeof m.music === 'function' ? m.music() : m.music || 'town'; }

// ---------- utilidades de guion ----------
const npc = (id) => WORLD.ents.find((e) => e.def.id === id);
function face(e, target) { const dx = target.x - e.x, dy = target.y - e.y; e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; }
async function walk(e, path, speed = 1.6) { // path: "uurrd" o array
  for (const ch of path) {
    const d = { u: 'up', d: 'down', l: 'left', r: 'right' }[ch]; if (!d) continue;
    if (e !== WORLD.player && !WORLD.ents.includes(e)) return; // cambió el mapa: la caminata se cancela
    await WORLD.beginMove(e, d, speed); WORLD.snapCam();
  }
}
const P = () => WORLD.player;
async function exclaim(e) { sfx('exclaim'); e.bubble = 36; await wait(36); }
async function giveItem(id, n = 1, quiet) { addItem(id, n); sfx('item'); if (!quiet) await say('¡Recibiste ' + (n > 1 ? n + ' ' : '') + ITEMS[id].n + '!'); }
async function healParty(who = 'Luas') {
  for (const m of G.party) m.heal();
  G.lastHeal = { map: WORLD.map.id, x: P().x, y: P().y };
  Sound.play(null); sfx('heal'); await fadeTo(0.6, 20, '#fff'); await wait(40); await fadeTo(0, 20, '#fff');
  Sound.curName = null; Sound.play(mapMusic());
  void who;
}
async function talkTo(e) {
  const d = e.def;
  if (!d.still) face(e, P());
  if (d.trainer && !flag('tr_' + d.trainer.id)) return trainerBattle(e);
  if (d.talk) return d.talk(e);
  if (d.trainer && d.trainer.after) return say(d.trainer.after, d.name);
  if (d.text) return say(typeof d.text === 'function' ? d.text() : d.text, d.name);
}
function makeTeam(list) { return list.map((q) => (q instanceof Mon ? q : new Mon(q[0], q[1], q[2] ? { moves: q[2] } : {}))); }
async function trainerBattle(e, opts = {}) {
  const t = typeof e.def.trainer === 'function' ? e.def.trainer() : e.def.trainer;
  const tr = { ...t, name: t.name || e.def.name, look: e.look, team: makeTeam(typeof t.team === 'function' ? t.team() : t.team) };
  const won = await doBattle({ trainer: tr, bg: t.bg || WORLD.map.bg, ...opts });
  if (won === 'win') { setFlag('tr_' + t.id); if (t.onWin) await t.onWin(); return true; }
  return false;
}
async function doBattle(o) {
  const prevMusic = Sound.curName;
  const res = await startBattle(o);
  if (res === 'lose' && !o.rehearsal && !o.friendly) {
    for (const m of G.party) m.heal();
    const h = G.lastHeal || { map: 'pitch_proa', x: 4, y: 4 };
    WORLD.load(h.map, h.x, h.y, 'down');
    await fadeTo(0, 24);
    await say('Luas: Te encontraron tirado en el camino y te trajeron. Tus criaturas ya están bien. Vos... tomá agua.', 'Luas');
    return 'lose';
  }
  void prevMusic; Sound.curName = null; Sound.play(mapMusic());
  await fadeTo(0, 14);
  if (WORLD.map.afterBattle) await WORLD.map.afterBattle();
  return res;
}
