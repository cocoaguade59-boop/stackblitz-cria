'use strict';
// =====================================================================
//  INTERFAZ: diálogos, listas, equipo, bolsa, criaturario, Proa, tienda
// =====================================================================
let G = null; // estado de la partida (ver main.js → newGameState)

// ---------- bolsa ----------
const addItem = (id, n = 1) => { G.bag[id] = (G.bag[id] || 0) + n; };
const hasItem = (id, n = 1) => (G.bag[id] || 0) >= n;
const takeItem = (id, n = 1) => { G.bag[id] = Math.max(0, (G.bag[id] || 0) - n); if (!G.bag[id]) delete G.bag[id]; };
const flag = (k) => !!G.flags[k];
const setFlag = (k, v = true) => { G.flags[k] = v; };
function markSeen(id) { G.dex.seen[id] = true; }
function markCaught(id) { G.dex.seen[id] = true; G.dex.caught[id] = true; }

// ---------- diálogo ----------
const TB = { x: 4, y: 140, w: 248, h: 50, chars: 29, lines: 3 };
class DialogScene {
  constructor(text, o = {}) {
    const lines = wrapText(text, TB.chars);
    this.pages = [];
    for (let i = 0; i < lines.length; i += TB.lines) this.pages.push(lines.slice(i, i + TB.lines));
    this.page = 0; this.chars = 0; this.name = o.name; this.choices = o.choices; this.sel = 0;
    this.cancel = o.cancel; this.auto = o.auto; this.timer = 0;
  }
  get full() { return this.pages[this.page].join('\n'); }
  update() {
    const total = this.full.length;
    if (this.chars < total) {
      this.chars += G && G.opts.fast ? 3 : 1.5;
      if (Input.A || Input.tapTop || Input.tap || Input.B) this.chars = total;
      return;
    }
    const last = this.page === this.pages.length - 1;
    if (this.choices && last) {
      const n = this.choices.length;
      if (Input.rep.up) { this.sel = (this.sel + n - 1) % n; sfx('blip'); }
      if (Input.rep.down) { this.sel = (this.sel + 1) % n; sfx('blip'); }
      if (Input.A) { sfx('select'); return this.done(this.sel); }
      if (Input.B && this.cancel != null) { sfx('back'); return this.done(this.cancel); }
      const r = this.choiceRects();
      for (let i = 0; i < n; i++) if (hit(r[i])) { sfx('select'); return this.done(i); }
      return;
    }
    if (this.auto) { if (++this.timer > this.auto) this.next(); return; }
    if (Input.A || Input.B || Input.tapTop || Input.tap) { sfx('blip'); this.next(); }
  }
  next() { if (this.page < this.pages.length - 1) { this.page++; this.chars = 0; } else this.done(); }
  choiceRects() {
    const n = this.choices.length, h = Math.min(30, Math.floor(150 / n) - 4);
    const y0 = (H - n * (h + 4)) / 2;
    return this.choices.map((c, i) => ({ x: 28, y: y0 + i * (h + 4), w: 200, h }));
  }
  drawTop(ctx) {
    box(ctx, TB.x, TB.y, TB.w, TB.h);
    if (this.name) {
      const w = txtW(this.name) + 12;
      box(ctx, TB.x + 4, TB.y - 13, w, 15, '#f8f8f8', '#48506a');
      txt(ctx, this.name, TB.x + 10, TB.y - 9, '#3060c0');
    }
    const shown = this.full.slice(0, Math.floor(this.chars));
    shown.split('\n').forEach((l, i) => txt(ctx, l, TB.x + 9, TB.y + 8 + i * 12));
    const last = this.page === this.pages.length - 1;
    if (this.chars >= this.full.length && !(this.choices && last) && !this.auto && (FRAME >> 4) & 1) {
      ctx.fillStyle = '#e05048'; ctx.fillRect(TB.x + TB.w - 14, TB.y + TB.h - 10, 6, 2); ctx.fillRect(TB.x + TB.w - 13, TB.y + TB.h - 8, 4, 1); ctx.fillRect(TB.x + TB.w - 12, TB.y + TB.h - 7, 2, 1);
    }
    if (this.choices && last && this.chars >= this.full.length) {
      const w = Math.max(...this.choices.map((c) => txtW(c))) + 26, h = this.choices.length * 13 + 9;
      const x = W - w - 4, y = TB.y - h - 2;
      box(ctx, x, y, w, h);
      this.choices.forEach((c, i) => { txt(ctx, c, x + 18, y + 6 + i * 13); if (i === this.sel) cursorArrow(ctx, x + 7, y + 6 + i * 13, '#e05048'); });
    }
  }
  drawBot(ctx) {
    if (!(this.choices && this.page === this.pages.length - 1 && this.chars >= this.full.length)) return this.below(ctx);
    botBackdrop(ctx);
    this.choiceRects().forEach((r, i) => pill(ctx, r.x, r.y, r.w, r.h, i === this.sel ? '#5878d0' : '#46507a', this.choices[i], { sel: i === this.sel }));
  }
  below(ctx) { // dibuja la pantalla inferior de la escena de abajo
    const st = Scenes.stack, i = st.indexOf(this);
    for (let k = i - 1; k >= 0; k--) if (st[k].drawBot) return st[k].drawBot(ctx);
  }
}
async function say(text, name) {
  const pages = Array.isArray(text) ? text : [text];
  for (const t of pages) await open(new DialogScene(fill(t), { name }));
}
function ask(text, choices, name, cancel = choices.length - 1) { return open(new DialogScene(fill(text), { name, choices, cancel })); }
const fill = (t) => String(t).replace(/\{P\}/g, G ? G.name : 'Viajero');

// ---------- lista genérica (pantalla inferior) ----------
class ListScene {
  constructor(o) { this.o = o; this.sel = o.start || 0; this.scroll = 0; this.opaque = !!o.top; }
  get items() { return typeof this.o.items === 'function' ? this.o.items() : this.o.items; }
  update() {
    const items = this.items, n = items.length;
    if (this.o.tick) this.o.tick(this);
    if (n) {
      if (Input.rep.up) { this.sel = (this.sel + n - 1) % n; sfx('blip'); }
      if (Input.rep.down) { this.sel = (this.sel + 1) % n; sfx('blip'); }
      if (Input.rep.left && n > 6) { this.sel = Math.max(0, this.sel - 6); sfx('blip'); }
      if (Input.rep.right && n > 6) { this.sel = Math.min(n - 1, this.sel + 6); sfx('blip'); }
    }
    this.sel = clamp(this.sel, 0, Math.max(0, n - 1));
    if (this.sel < this.scroll) this.scroll = this.sel;
    if (this.sel >= this.scroll + 6) this.scroll = this.sel - 5;
    if (Input.A && n) return this.choose(this.sel);
    if (Input.B && this.o.cancel !== false) { sfx('back'); return this.done(-1); }
    if (Input.tap) {
      for (let i = 0; i < 6; i++) { const r = { x: 6, y: 22 + i * 24, w: 222, h: 22 }; if (hit(r) && this.scroll + i < n) { if (this.sel === this.scroll + i || IS_TOUCH) return this.choose(this.scroll + i); this.sel = this.scroll + i; sfx('blip'); } }
      if (hit({ x: 232, y: 22, w: 22, h: 70 })) this.sel = Math.max(0, this.sel - 6);
      if (hit({ x: 232, y: 96, w: 22, h: 70 })) this.sel = Math.min(n - 1, this.sel + 6);
      if (hit({ x: 168, y: 170, w: 84, h: 20 }) && this.o.cancel !== false) { sfx('back'); return this.done(-1); }
    }
  }
  choose(i) { const it = this.items[i]; if (it.disabled) { sfx('wrong'); return; } sfx('select'); this.done(i); }
  drawTop(ctx) { if (this.o.top) this.o.top(ctx, this.items[this.sel], this.sel); }
  drawBot(ctx) {
    botBackdrop(ctx);
    ctx.fillStyle = '#1c2238'; ctx.fillRect(0, 0, W, 18);
    txt(ctx, this.o.title || '', 6, 5, '#f8f8f8', '#000');
    if (this.o.headerRight) txt(ctx, this.o.headerRight(), W - 6, 5, COL.gold, '#000', 'right');
    const items = this.items;
    for (let i = 0; i < 6; i++) {
      const k = this.scroll + i; if (k >= items.length) break;
      const it = items[k], y = 22 + i * 24, sel = k === this.sel;
      pill(ctx, 6, y, 222, 22, it.disabled ? '#585868' : it.col || (sel ? '#5878d0' : '#46507a'), null, { sel });
      if (it.icon) ctx.drawImage(it.icon, 8, y - 6, 28, 28);
      txt(ctx, it.label, it.icon ? 38 : 14, y + 7, '#fff', '#00000080');
      if (it.sub != null) txt(ctx, it.sub, 222, y + 7, it.subCol || '#f8e8a0', '#00000080', 'right');
    }
    if (items.length > 6) {
      pill(ctx, 232, 22, 20, 70, '#46507a', '▲'); pill(ctx, 232, 96, 20, 70, '#46507a', '▼');
      ctx.fillStyle = '#f8f8f8'; const sh = 140 * (6 / items.length); ctx.fillRect(250, 22 + 140 * (this.scroll / items.length), 2, sh);
    }
    if (!items.length) txt(ctx, this.o.empty || 'No hay nada acá.', W / 2, 80, '#c8d0e8', '#000', 'center');
    if (this.o.cancel !== false) pill(ctx, 168, 170, 84, 20, '#c05050', 'VOLVER');
    if (this.o.footer) txt(ctx, this.o.footer, 8, 176, '#c8d0e8', '#000');
  }
}
const listMenu = (o) => open(new ListScene(o));

// ---------- panel superior de detalles de criatura ----------
function drawMonInfo(ctx, m, o = {}) {
  ctx.fillStyle = '#e8f0f8'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = TYPES[m.type].c; ctx.fillRect(0, 0, W, 22);
  ctx.fillStyle = shade(TYPES[m.type].c, 0.3); ctx.fillRect(0, 22, W, 2);
  txt(ctx, m.name, 8, 7, '#fff', shade(TYPES[m.type].c, -0.5));
  txt(ctx, 'Nv' + m.lv, W - 8, 7, '#fff', shade(TYPES[m.type].c, -0.5), 'right');
  ctx.fillStyle = '#d0dce8'; ctx.beginPath(); ctx.ellipse(48, 104, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
  const bob = (FRAME >> 4) & 1;
  ctx.drawImage(creatureSprite(m.id), 8, 28 + bob);
  typeBadge(ctx, m.type, 8, 118);
  statusBadge(ctx, m.status, 52, 118);
  const x0 = 100;
  txt(ctx, 'PS', x0, 32); hpBar(ctx, x0 + 22, 33, 80, m.hp / m.maxhp);
  txt(ctx, m.hp + '/' + m.maxhp, W - 8, 42, COL.ink, COL.inkSh, 'right');
  [['Ataque', m.atk], ['Defensa', m.def], ['Velocidad', m.spe]].forEach(([n, v], i) => { txt(ctx, n, x0, 56 + i * 12); txt(ctx, v, W - 8, 56 + i * 12, COL.ink, COL.inkSh, 'right'); });
  const need = xpFor(m.lv + 1) - xpFor(m.lv), have = m.xp - xpFor(m.lv);
  txt(ctx, 'EXP', x0, 94, '#4870c8');
  ctx.fillStyle = '#303040'; ctx.fillRect(x0 + 28, 96, 118, 4); ctx.fillStyle = '#58b8f8'; ctx.fillRect(x0 + 29, 97, Math.round(116 * clamp(have / need, 0, 1)), 2);
  const ev = m.sp.evo; if (ev) txt(ctx, 'Evoluciona Nv' + ev[1], x0, 106, COL.dim, null);
  m.moves.forEach((mv, i) => {
    const M = MOVES[mv.id], x = 4 + (i % 2) * 126, y = 134 + Math.floor(i / 2) * 28;
    pill(ctx, x, y, 122, 26, TYPES[M.t].c, null);
    txt(ctx, M.n.slice(0, 14), x + 6, y + 4, '#fff', '#00000070');
    txt(ctx, 'PP ' + mv.pp + '/' + M.pp, x + 116, y + 15, '#fff', '#00000070', 'right');
  });
  if (o.note) { box(ctx, 4, 116, 248, 18); txt(ctx, o.note, 10, 121); }
}

// ---------- EQUIPO ----------
class PartyScene {
  constructor(mode = 'view', o = {}) { this.mode = mode; this.o = o; this.sel = 0; this.swap = -1; this.opaque = true; this.msg = o.msg || null; }
  rects() { const r = []; for (let i = 0; i < 6; i++) r.push({ x: 4 + (i % 2) * 126, y: 22 + Math.floor(i / 2) * 50, w: 122, h: 46 }); return r; }
  update() {
    const n = G.party.length;
    if (Input.rep.left || Input.rep.right) { this.sel ^= 1; if (this.sel >= n) this.sel = n - 1; sfx('blip'); }
    if (Input.rep.up) { this.sel = (this.sel - 2 + 8) % 8; if (this.sel >= n) this.sel = n - 1; if (this.sel < 0) this.sel = 0; sfx('blip'); }
    if (Input.rep.down) { this.sel += 2; if (this.sel >= n) this.sel = this.sel % 2 < n ? this.sel % 2 : 0; sfx('blip'); }
    if (Input.A) return this.choose(this.sel);
    if (Input.B && !this.o.forced) { sfx('back'); if (this.swap >= 0) { this.swap = -1; return; } return this.done(-1); }
    if (Input.tap) {
      this.rects().forEach((r, i) => { if (i < n && hit(r)) { if (this.sel === i || IS_TOUCH) this.choose(i); else { this.sel = i; sfx('blip'); } } });
      if (!this.o.forced && hit({ x: 168, y: 172, w: 84, h: 18 })) { sfx('back'); this.done(-1); }
    }
  }
  async choose(i) {
    if (this.busy) return;
    const m = G.party[i];
    if (this.swap >= 0) { [G.party[this.swap], G.party[i]] = [G.party[i], G.party[this.swap]]; this.swap = -1; sfx('select'); return; }
    if (this.mode === 'select') {
      const why = this.o.filter ? this.o.filter(m, i) : null;
      if (why) { sfx('wrong'); this.msg = why; return; }
      sfx('select'); return this.done(i);
    }
    sfx('select');
    this.busy = true;
    const r = await ask('¿Qué haces con ' + m.name + '?', ['Mover', 'Ponerle mote', 'Nada']);
    this.busy = false;
    if (r === 0) { this.swap = i; this.msg = 'Elige con quién cambiar.'; }
    if (r === 1) { const nm = await nameEntry('Mote para ' + m.sp.n, m.nick || m.sp.n, 10); m.nick = nm && nm !== m.sp.n ? nm : null; }
  }
  drawTop(ctx) { const m = G.party[this.sel]; if (m) drawMonInfo(ctx, m); }
  drawBot(ctx) {
    botBackdrop(ctx, '#284030', '#2e4a38');
    ctx.fillStyle = '#18281c'; ctx.fillRect(0, 0, W, 18);
    txt(ctx, this.o.title || 'EQUIPO', 6, 5, '#fff', '#000');
    this.rects().forEach((r, i) => {
      const m = G.party[i];
      if (!m) { ctx.fillStyle = '#ffffff10'; ctx.fillRect(r.x, r.y, r.w, r.h); return; }
      const sel = i === this.sel, col = m.fainted ? '#784040' : i === this.swap ? '#c09030' : sel ? '#58a070' : '#3c6c4c';
      pill(ctx, r.x, r.y, r.w, r.h, col, null, { sel });
      ctx.drawImage(creatureIcon(m.id), r.x + 1, r.y + 2 + (sel && (FRAME >> 3) & 1 ? -1 : 0));
      txt(ctx, m.name.slice(0, 10), r.x + 34, r.y + 5, '#fff', '#00000080');
      txt(ctx, 'Nv' + m.lv, r.x + 34, r.y + 16, '#f8f0c0', '#00000080');
      statusBadge(ctx, m.status, r.x + 88, r.y + 15);
      hpBar(ctx, r.x + 34, r.y + 28, 80, m.hp / m.maxhp);
      txt(ctx, m.hp + '/' + m.maxhp, r.x + 116, r.y + 35, '#fff', '#00000080', 'right');
    });
    if (this.msg) txt(ctx, this.msg.slice(0, 20), 6, 178, '#f8f0c0', '#000');
    if (!this.o.forced) pill(ctx, 168, 172, 84, 18, '#c05050', 'VOLVER');
  }
}
const partyMenu = (mode, o) => open(new PartyScene(mode, o));

// ---------- BOLSA ----------
const KIND_ORDER = ['heal', 'status', 'revive', 'pp', 'ball', 'lvl', 'incense', 'mat', 'key'];
function itemIcon(id) {
  const k = 'it:' + id; if (ICON_CACHE[k]) return ICON_CACHE[k];
  const I = ITEMS[id], P = new Painter(16, 16);
  const col = { heal: '#a06030', status: '#58b058', revive: '#f0c040', pp: '#58a8f0', ball: '#58c8f8', lvl: '#f8f0c0', incense: TYPES[I.t || 'normal'].c, mat: '#88d8f8', key: '#e8b040' }[I.k];
  if (I.k === 'heal') { P.rect(4, 6, 8, 8, '#f8f8f8'); P.rect(5, 6, 6, 3, col, { noOutline: true }); P.line(12, 9, 14, 9, 1, '#f8f8f8'); }
  else if (I.k === 'ball' || I.k === 'mat') { P.poly([[8, 1], [14, 7], [8, 15], [2, 7]], id === 'cristalest' || id === 'fragoro' ? '#f8d040' : col); }
  else if (I.k === 'incense') { P.rect(5, 6, 6, 9, col); P.line(8, 5, 8, 1, 0.6, '#d0d0d0', { flat: true }); }
  else if (I.k === 'lvl') { P.rect(3, 2, 10, 12, col); P.line(5, 6, 11, 6, 0.4, '#806040', { flat: true }); P.line(5, 9, 11, 9, 0.4, '#806040', { flat: true }); }
  else if (I.k === 'revive') { P.rect(2, 4, 12, 9, '#303030'); P.rect(2, 3, 12, 3, '#f8f8f8'); }
  else if (I.k === 'key') { P.ell(5, 6, 3, 3, col); P.line(7, 8, 13, 14, 1, col); }
  else P.ell(8, 9, 5, 6, col);
  ICON_CACHE[k] = P.toCanvas(); return ICON_CACHE[k];
}
function bagItems(mode) {
  return Object.keys(G.bag).filter((id) => G.bag[id] > 0 && (mode !== 'battle' || ['heal', 'status', 'revive', 'pp', 'ball'].includes(ITEMS[id].k)))
    .sort((a, b) => KIND_ORDER.indexOf(ITEMS[a].k) - KIND_ORDER.indexOf(ITEMS[b].k));
}
function itemTop(ctx, id) {
  ctx.fillStyle = '#f0e8d8'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#c89048'; ctx.fillRect(0, 0, W, 22); txt(ctx, 'BOLSA', 8, 7, '#fff', '#704818');
  txt(ctx, '$' + G.money, W - 8, 7, '#fff', '#704818', 'right');
  if (!id) return;
  const I = ITEMS[id];
  drawSpriteScaled(ctx, itemIcon(id), 16, 34, 3);
  txt(ctx, I.n, 72, 40); txt(ctx, 'x' + (G.bag[id] || 0), 72, 54, '#4870c8');
  box(ctx, 4, 96, 248, 60);
  wrapText(I.d, 29).forEach((l, i) => txt(ctx, l, 12, 104 + i * 12));
  if (G.incense && G.incense.steps > 0) txt(ctx, 'Incienso activo: ' + G.incense.steps + ' pasos', 8, 168, '#a05090', null);
}
async function bagMenu(mode = 'field') {
  const ids = () => bagItems(mode);
  const i = await listMenu({
    title: mode === 'battle' ? 'BOLSA (COMBATE)' : 'BOLSA', items: () => ids().map((id) => ({ label: ITEMS[id].n.slice(0, 16), sub: 'x' + G.bag[id], icon: null })),
    top: (ctx, it, k) => itemTop(ctx, ids()[k]), empty: 'La bolsa está vacía.',
  });
  return i < 0 ? null : ids()[i];
}
// usar un objeto en una criatura (fuera o dentro de combate). Devuelve true si se gastó
async function useItemOn(id, m, inBattle = false) {
  const I = ITEMS[id];
  if (I.k === 'heal') {
    if (m.fainted) { await say(m.name + ' está debilitado. Necesita un Toma Dos.'); return false; }
    if (m.hp >= m.maxhp) { await say('No va a tener efecto. ' + m.name + ' está como nuevo.'); return false; }
    const before = m.hp; m.hp = Math.min(m.maxhp, m.hp + I.v); sfx('heal');
    if (!inBattle) await say(m.name + ' recuperó ' + (m.hp - before) + ' PS.');
    return true;
  }
  if (I.k === 'status') {
    if (!m.status) { await say(m.name + ' no tiene ningún problema de estado.'); return false; }
    m.status = null; m.slp = 0; sfx('heal'); if (!inBattle) await say(m.name + ' se curó. Tecito y a seguir.'); return true;
  }
  if (I.k === 'revive') {
    if (!m.fainted) { await say(m.name + ' no está debilitado. Guárdalo para después.'); return false; }
    m.hp = Math.floor(m.maxhp / 2); m.status = null; sfx('heal'); if (!inBattle) await say('¡Toma dos! ' + m.name + ' volvió a escena.'); return true;
  }
  if (I.k === 'pp') { for (const mv of m.moves) mv.pp = Math.min(MOVES[mv.id].pp, mv.pp + I.v); sfx('heal'); if (!inBattle) await say(m.name + ' se hidrató. Recuperó PP.'); return true; }
  if (I.k === 'lvl') {
    if (m.lv >= 100) { await say('Ya sabe todo. No hay spoilers posibles.'); return false; }
    m.xp = xpFor(m.lv + 1); await levelUpFlow(m, null); await checkEvolutions([m]); return true;
  }
  return false;
}
async function fieldBag() {
  for (;;) {
    const id = await bagMenu('field'); if (!id) return;
    const I = ITEMS[id];
    if (['heal', 'status', 'revive', 'pp', 'lvl'].includes(I.k)) {
      const i = await partyMenu('select', { title: 'USAR ' + I.n.toUpperCase().slice(0, 18) });
      if (i >= 0 && (await useItemOn(id, G.party[i]))) takeItem(id);
    } else if (I.k === 'incense') {
      if (G.incense && G.incense.steps > 0 && (await ask('Ya hay un incienso activo. ¿Reemplazarlo?', ['Sí', 'No'])) !== 0) continue;
      takeItem(id); G.incense = { t: I.t, steps: 120 }; sfx('item');
      await say('Encendiste el ' + I.n + '. Huele a ' + TYPES[I.t].n.toLowerCase() + '... y a aventura.');
    } else if (I.k === 'ball') await say('Los cristales se usan en combate, frente a una criatura salvaje.');
    else await say(I.d);
  }
}

// ---------- CRIATURARIO ----------
async function dexMenu() {
  const items = () => DEX_ORDER.map((id, i) => {
    const seen = G.dex.seen[id], caught = G.dex.caught[id];
    return { label: String(i + 1).padStart(3, '0') + ' ' + (seen ? SPECIES[id].n : '-----'), sub: caught ? '●' : seen ? '○' : '', subCol: caught ? '#f87070' : '#c0c0c0' };
  });
  const nSeen = Object.keys(G.dex.seen).length, nCaught = Object.keys(G.dex.caught).length;
  await listMenu({
    title: 'CRIATURARIO', items, headerRight: () => nCaught + '/' + DEX_ORDER.length,
    top: (ctx, it, k) => {
      const id = DEX_ORDER[k], seen = G.dex.seen[id], caught = G.dex.caught[id];
      ctx.fillStyle = '#e83848'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#f8f0f0'; ctx.fillRect(6, 24, W - 12, H - 30);
      txt(ctx, 'CRIATURARIO DEL REINO', 8, 8, '#fff', '#801828');
      txt(ctx, 'Vistas ' + nSeen + '  Vínculos ' + nCaught, 10, 30, COL.dim, null);
      ctx.fillStyle = '#dde4ee'; ctx.fillRect(12, 44, 84, 84);
      if (seen) ctx.drawImage(caught ? creatureSprite(id) : silhouette(id), 14, 46); else txt(ctx, '?', 54, 80, '#a0a8b8', null, 'center');
      txt(ctx, '#' + String(k + 1).padStart(3, '0'), 104, 48, COL.dim, null);
      txt(ctx, seen ? SPECIES[id].n : '?????', 104, 62);
      if (seen) typeBadge(ctx, SPECIES[id].t, 104, 76);
      if (caught) wrapText(SPECIES[id].d, 29).slice(0, 4).forEach((l, i) => txt(ctx, l, 12, 136 + i * 12, COL.ink, null));
      else txt(ctx, seen ? 'Crea un vínculo para saber más.' : 'Todavía no la viste.', 12, 140, COL.dim, null);
    },
  });
}

// ---------- PROA (almacén) ----------
async function proaMenu() {
  sfx('select');
  for (;;) {
    const r = await ask('Terminal de la Proa. Aquí descansan tus criaturas. ' + G.box.length + ' en reposo.', ['Retirar', 'Depositar', 'Taller', 'Salir']);
    if (r === 0) {
      if (!G.box.length) { await say('No hay criaturas descansando.'); continue; }
      const i = await listMenu({ title: 'RETIRAR', items: () => G.box.map((m) => ({ label: m.name.slice(0, 12), sub: 'Nv' + m.lv, icon: creatureIcon(m.id) })), top: (ctx, it, k) => G.box[k] && drawMonInfo(ctx, G.box[k]) });
      if (i < 0) continue;
      if (G.party.length >= 6) { await say('Tu equipo está lleno. Seis es multitud.'); continue; }
      const m = G.box.splice(i, 1)[0]; m.heal(); G.party.push(m); await say(m.name + ' se sumó al equipo.');
    } else if (r === 1) {
      if (G.party.length <= 1) { await say('No puedes quedarte sin compañía. Es peligroso y triste.'); continue; }
      const i = await partyMenu('select', { title: 'DEPOSITAR', filter: (m) => (G.party.filter((x) => !x.fainted).length <= 1 && !m.fainted ? 'Es tu único en pie.' : null) });
      if (i < 0) continue;
      const m = G.party.splice(i, 1)[0]; m.heal(); G.box.push(m); await say(m.name + ' se fue a descansar a la Proa. Se lo ganó.');
    } else if (r === 2) await craftMenu();
    else return;
  }
}
async function craftMenu() {
  const recipes = [
    { out: 'cristal', n: 1, need: [['fragmento', 3]], label: 'Cristal Vínculo' },
    { out: 'cristalest', n: 1, need: [['cristal', 2], ['fragoro', 1]], label: 'Cristal Estelar' },
    { out: 'cafedoble', n: 1, need: [['cafe', 3]], label: 'Café Doble' },
  ];
  for (;;) {
    const can = (r) => r.need.every(([id, q]) => hasItem(id, q));
    const i = await listMenu({
      title: 'TALLER DE CRISTALES', items: recipes.map((r) => ({ label: r.label, sub: can(r) ? 'OK' : '--', disabled: !can(r) })),
      top: (ctx, it, k) => {
        itemTop(ctx, recipes[k].out);
        box(ctx, 4, 96, 248, 60);
        txt(ctx, 'Necesitas:', 12, 104);
        recipes[k].need.forEach(([id, q], j) => txt(ctx, q + 'x ' + ITEMS[id].n + ' (' + (G.bag[id] || 0) + ')', 12, 118 + j * 12, hasItem(id, q) ? COL.ink : COL.red));
      },
    });
    if (i < 0) return;
    const r = recipes[i];
    r.need.forEach(([id, q]) => takeItem(id, q)); addItem(r.out, r.n); sfx('item');
    await say('¡Fabricaste ' + ITEMS[r.out].n + '! Manos de materializador.');
  }
}

// ---------- TIENDA ----------
async function shopMenu(stock, clerk = 'Vendedor') {
  await say('¡Bienvenido! Todo a precio de productora independiente.', clerk);
  for (;;) {
    const i = await listMenu({
      title: 'TIENDA', headerRight: () => '$' + G.money,
      items: stock.map((id) => ({ label: ITEMS[id].n.slice(0, 16), sub: '$' + ITEMS[id].price })), top: (ctx, it, k) => itemTop(ctx, stock[k]),
    });
    if (i < 0) { await say('¡Vuelve pronto! Y trae amigos con plata.', clerk); return; }
    const id = stock[i], price = ITEMS[id].price;
    const max = Math.min(99, Math.floor(G.money / price));
    if (max < 1) { await say('Te falta plata. Gánale a alguien y vuelve.', clerk); continue; }
    const q = await qtyPicker(id, max);
    if (q > 0) { G.money -= q * price; addItem(id, q); sfx('item'); if (id === 'cristal' && q >= 10) { addItem('cristalest', 1); await say('¡Por comprar diez, te regalo un Cristal Estelar! No le digas al jefe.', clerk); } else await say('¡Gracias! Acá tienes tus ' + q + ' ' + ITEMS[id].n + '.', clerk); }
  }
}
class QtyScene {
  constructor(id, max) { this.id = id; this.max = max; this.q = 1; }
  update() {
    if (Input.rep.up || Input.rep.right) { this.q = this.q >= this.max ? 1 : this.q + 1; sfx('blip'); }
    if (Input.rep.down || Input.rep.left) { this.q = this.q <= 1 ? this.max : this.q - 1; sfx('blip'); }
    if (Input.A || hit({ x: 140, y: 120, w: 100, h: 30 })) { sfx('select'); this.done(this.q); }
    if (Input.B || hit({ x: 16, y: 120, w: 100, h: 30 })) { sfx('back'); this.done(0); }
    if (hit({ x: 180, y: 60, w: 50, h: 40 })) { this.q = Math.min(this.max, this.q + 1); }
    if (hit({ x: 26, y: 60, w: 50, h: 40 })) { this.q = Math.max(1, this.q - 1); }
  }
  drawTop(ctx) { box(ctx, 4, TB.y, 248, 50); txt(ctx, '¿Cuántos ' + ITEMS[this.id].n + '?', 12, TB.y + 10); txt(ctx, 'Total: $' + this.q * ITEMS[this.id].price, 12, TB.y + 26, '#3060c0'); }
  drawBot(ctx) {
    botBackdrop(ctx); pill(ctx, 26, 60, 50, 40, '#46507a', '-'); pill(ctx, 180, 60, 50, 40, '#46507a', '+');
    box(ctx, 88, 60, 80, 40); txt(ctx, 'x' + this.q, 128, 76, COL.ink, COL.inkSh, 'center');
    pill(ctx, 16, 120, 100, 30, '#c05050', 'CANCELAR'); pill(ctx, 140, 120, 100, 30, '#48a060', 'COMPRAR');
  }
}
const qtyPicker = (id, max) => open(new QtyScene(id, max));

// ---------- ENTRADA DE NOMBRE ----------
class NameScene {
  constructor(title, def, max) { this.title = title; this.v = ''; this.def = def; this.max = max; this.sel = 0; this.caps = true; }
  enter() {
    this.t0 = performance.now();
    Input.textHandler = (e) => {
      if (performance.now() - this.t0 < 400) return;
      if (e.key === 'Enter') return this.finish();
      if (e.key === 'Backspace') { this.v = this.v.slice(0, -1); return; }
      if (e.key === 'Escape') return this.finish();
      if (e.key.length === 1 && /[\p{L}\p{N} .'\-]/u.test(e.key) && this.v.length < this.max) { this.v += e.key; sfx('blip'); }
    };
  }
  keys() { const k = (this.caps ? 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' : 'abcdefghijklmnñopqrstuvwxyz').split(''); return k.concat(['á', 'é', 'í', 'ó', 'ú', '-', '⇧', '←', 'OK']); }
  finish() { Input.textHandler = null; sfx('select'); this.done(this.v.trim() || this.def); }
  update() {
    const ks = this.keys();
    if (Input.tap) ks.forEach((k, i) => { const x = 8 + (i % 9) * 27, y = 50 + Math.floor(i / 9) * 30; if (hit({ x, y, w: 25, h: 26 })) this.press(k); });
  }
  press(k) {
    sfx('blip');
    if (k === 'OK') return this.finish();
    if (k === '←') { this.v = this.v.slice(0, -1); return; }
    if (k === '⇧') { this.caps = !this.caps; return; }
    if (this.v.length < this.max) { this.v += k; if (this.caps && this.v.length === 1) this.caps = false; }
  }
  drawTop(ctx) {
    box(ctx, 16, 60, 224, 64);
    txt(ctx, this.title, 128, 70, '#3060c0', COL.inkSh, 'center');
    const s = this.v + ((FRAME >> 4) & 1 ? '_' : ' ');
    txt(ctx, s, 128, 92, COL.ink, COL.inkSh, 'center');
    txt(ctx, 'Escribe con el teclado. ENTER = listo', 128, 110, COL.dim, null, 'center');
  }
  drawBot(ctx) {
    botBackdrop(ctx); txt(ctx, 'Toca las letras', 128, 20, '#fff', '#000', 'center');
    this.keys().forEach((k, i) => { const x = 8 + (i % 9) * 27, y = 50 + Math.floor(i / 9) * 30; pill(ctx, x, y, 25, 26, k === 'OK' ? '#48a060' : k === '←' ? '#c05050' : '#46507a', k); });
  }
}
const nameEntry = (title, def, max = 10) => open(new NameScene(title, def, max));

// ---------- banner de lugar (estilo BW2) ----------
const Banner = { text: '', t: 0 };
function showBanner(t) { Banner.text = t; Banner.t = 150; }
function drawBanner(ctx) {
  if (Banner.t <= 0) return;
  Banner.t--;
  const k = Banner.t > 130 ? (150 - Banner.t) / 20 : Banner.t < 20 ? Banner.t / 20 : 1;
  const w = txtW(Banner.text) + 24, x = -w + Math.round(k * (w + 4));
  ctx.fillStyle = '#283048'; ctx.fillRect(x, 6, w, 18); ctx.fillStyle = '#f0c040'; ctx.fillRect(x, 6, w, 2); ctx.fillRect(x, 22, w, 2);
  txt(ctx, Banner.text, x + 12, 11, '#fff', '#000');
}
