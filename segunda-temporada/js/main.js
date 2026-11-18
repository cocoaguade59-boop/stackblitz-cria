'use strict';
// =====================================================================
//  ARRANQUE: título, partida nueva, guardado y carga
// =====================================================================
const SAVE_KEY = 'criaturas_st_save_v1';
function newGameState(name, look) {
  return {
    name, look, party: [], box: [], bag: {}, money: 500, dex: { seen: {}, caught: {} }, flags: {}, steps: 0,
    opts: { fast: false, shift: true }, pos: { map: 'pitch', x: 10, y: 18, dir: 'up' }, lastHeal: { map: 'pitch_proa', x: 5, y: 3 }, incense: null,
  };
}
function saveGame() {
  try { G.pos = { map: WORLD.map.id, x: WORLD.player.x, y: WORLD.player.y, dir: WORLD.player.dir }; localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; } catch (e) { console.warn(e); return false; }
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if (!raw) return null;
    const d = JSON.parse(raw);
    d.party = d.party.map((m) => Mon.from(m)); d.box = d.box.map((m) => Mon.from(m));
    d.opts = d.opts || { fast: false, shift: true };
    return d;
  } catch (e) { console.warn('Partida dañada', e); return null; }
}

// ---------- pantalla de título ----------
class TitleScene {
  constructor() { this.opaque = true; this.t = 0; this.sel = 0; this.save = loadSave(); this.parade = shuffle(DEX_ORDER.filter((id) => id !== 'taquillon')); }
  buttons() { const b = []; if (this.save) b.push({ k: 'cont', l: 'CONTINUAR', c: '#48a858' }); b.push({ k: 'new', l: 'NUEVA PARTIDA', c: '#e05048' }); return b.map((q, i) => ({ ...q, x: 28, y: 60 + i * 46, w: 200, h: 38 })); }
  update() {
    this.t++;
    const bs = this.buttons();
    if (Input.rep.up || Input.rep.down) { this.sel = (this.sel + 1) % bs.length; sfx('blip'); }
    let k = null;
    if (Input.A || Input.START) k = bs[this.sel].k;
    for (const b of bs) if (hit(b)) k = b.k;
    if (k) { sfx('select'); this.go(k); }
  }
  async go(k) {
    if (this.busy) return; this.busy = true;
    if (k === 'new' && this.save && (await ask('Ya hay una partida guardada. Si empezás otra, se va a perder al guardar. ¿Seguro?', ['Empezar de cero', 'Mejor no'], null, 1)) !== 0) { this.busy = false; return; }
    await fadeTo(1, 20);
    Scenes.remove(this);
    if (k === 'cont') {
      G = this.save;
      WORLD = new World(); Scenes.push(WORLD);
      WORLD.load(G.pos.map, G.pos.x, G.pos.y, G.pos.dir);
      await fadeTo(0, 20);
      await say('¡Bienvenido de vuelta, {P}! ' + currentObjective());
    } else await newGame();
  }
  drawTop(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1850'); g.addColorStop(0.6, '#c85878'); g.addColorStop(1, '#f8b868'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { ctx.fillStyle = (i + (this.t >> 4)) % 7 ? '#ffffff80' : '#fff'; ctx.fillRect((hash2(i, 9) * W) | 0, (hash2(i, 8) * 90) | 0, 1, 1); }
    // castillo en el horizonte
    ctx.fillStyle = '#3a2048'; ctx.fillRect(104, 92, 48, 40); ctx.fillRect(96, 80, 14, 52); ctx.fillRect(146, 80, 14, 52); ctx.fillRect(122, 70, 12, 22);
    ctx.fillStyle = '#f8d870'; ctx.fillRect(126, 104, 4, 6); ctx.fillRect(100, 92, 3, 4); ctx.fillRect(152, 92, 3, 4);
    ctx.fillStyle = '#4a2a50'; ctx.beginPath(); ctx.moveTo(0, 130); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, 124 + Math.sin(x * 0.04) * 6); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    // desfile de criaturas
    const n = this.parade.length, sp = 100, off = (this.t * 0.6) % (sp * n);
    for (let i = 0; i < n; i++) { const x = W - ((off + i * sp) % (sp * n)) + 20; if (x < -80 || x > W) continue; ctx.drawImage(creatureSprite(this.parade[i]), x, 108 + ((this.t >> 3) + i) % 2); }
    // logo
    const bob = Math.round(Math.sin(this.t / 30) * 2);
    ctx.save(); ctx.font = FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const logo = (s, y, sc, col) => { ctx.save(); ctx.translate(128, y + bob); ctx.scale(sc, sc); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [2, 2]]) { ctx.fillStyle = '#20102c'; ctx.fillText(s, dx, dy); } ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); };
    logo('CRIATURAS', 14, 3, '#f8d040'); logo('DEL REINO', 42, 2, '#ffffff'); logo('~ SEGUNDA TEMPORADA ~', 64, 1, '#f8a8c8');
    ctx.restore();
    if ((this.t >> 5) & 1) txt(ctx, 'PULSÁ A / TOCÁ ABAJO', 128, 178, '#fff', '#000', 'center');
  }
  drawBot(ctx) {
    botBackdrop(ctx, '#2a1d44', '#33244f');
    txt(ctx, 'Una aventura en el Reino', 128, 16, '#f8d8e8', '#000', 'center');
    txt(ctx, 'de las criaturas y el cine', 128, 28, '#f8d8e8', '#000', 'center');
    this.buttons().forEach((b, i) => pill(ctx, b.x, b.y, b.w, b.h, b.c, b.l, { sel: i === this.sel }));
    if (this.save) txt(ctx, this.save.name + ' · ' + DIPLOMAS.filter((d) => this.save.flags['dip_' + d.id]).length + ' diplomas · ' + Object.keys(this.save.dex.caught).length + ' vínculos', 128, 160, '#c8d0e8', '#000', 'center');
    txt(ctx, 'M: silenciar  ' + (Sound.muted ? '(silencio)' : ''), 128, 178, '#8890b0', '#000', 'center');
  }
}

// ---------- intro: Alessandro presenta el reino ----------
class IntroBg {
  constructor() { this.opaque = true; this.t = 0; this.who = 'alessandro'; this.mon = 'zumbaflor'; this.looks = null; this.sel = 0; }
  update() {
    this.t++;
    if (this.looks) {
      if (Input.rep.left) { this.sel = (this.sel + 2) % 3; sfx('blip'); }
      if (Input.rep.right) { this.sel = (this.sel + 1) % 3; sfx('blip'); }
      if (Input.A) { sfx('select'); this.pickDone(this.sel); }
      for (let i = 0; i < 3; i++) if (hit({ x: 6 + i * 84, y: 30, w: 78, h: 130 })) { if (i === this.sel) { sfx('select'); this.pickDone(i); } else { this.sel = i; sfx('blip'); } }
    }
  }
  drawTop(ctx) {
    const g = ctx.createRadialGradient(128, 80, 10, 128, 80, 180); g.addColorStop(0, '#fff8e8'); g.addColorStop(1, '#88a8d8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff50'; ctx.beginPath(); ctx.ellipse(128, 128, 90, 14, 0, 0, Math.PI * 2); ctx.fill();
    if (this.looks) {
      this.looks.forEach((lk, i) => { drawSpriteScaled(ctx, personSprite(lk, 0, ((this.t >> 4) & 1) && i === this.sel ? 1 : 0), 22 + i * 76, 40, 4); if (i === this.sel) cursorArrow(ctx, 50 + i * 76, 30, '#e05048'); });
      return;
    }
    if (this.who) drawSpriteScaled(ctx, personSprite(this.who, 0, 0), 76, 38, 4);
    if (this.mon) ctx.drawImage(creatureSprite(this.mon), 140, 54 + ((this.t >> 4) & 1));
  }
  drawBot(ctx) {
    botBackdrop(ctx);
    if (this.looks) { this.looks.forEach((lk, i) => { pill(ctx, 6 + i * 84, 30, 78, 130, i === this.sel ? '#5878d0' : '#46507a', null, { sel: i === this.sel }); drawSpriteScaled(ctx, personSprite(lk, 0, 0), 21 + i * 84, 46, 3); }); txt(ctx, 'Elegí tu look', 128, 12, '#fff', '#000', 'center'); }
  }
}
async function newGame() {
  G = newGameState('Viajero', 'p_cap');
  const bg = new IntroBg(); Scenes.push(bg);
  Sound.play('town');
  await fadeTo(0, 30);
  await say(['¡Hola, hola! ¡Bienvenido al Reino! Me llamo Alessandro. Algunos me dicen "el guía". Otros, "el que habla mucho". Los dos tienen razón.',
    'Este reino está habitado por criaturas mágicas. Las personas viven con ellas, las entrenan y forman equipos. Como un elenco, pero con más plumas y escamas.',
    'Acá todo tiene que ver con contar historias: los pueblos se llaman como las etapas de una película. Pitch, Storyboard, Rodaje, Última Toma, Montaje...',
    'Y en el Castillo Difusión vive el Rey Navarrete, el gran desafío. Para llegar, vas a necesitar cuatro diplomas. Y paciencia. Y buenos amigos.',
    'Pero antes de todo eso... ¡contame de vos!'], 'Alessandro');
  bg.looks = ['p_cap', 'p_pony', 'p_bun']; bg.who = null; bg.mon = null;
  const li = await new Promise((r) => { bg.pickDone = r; });
  G.look = bg.looks[li]; bg.looks = null; bg.who = G.look;
  const name = await nameEntry('¿Cómo te llamás?', 'Viajero', 10);
  G.name = name;
  bg.who = 'alessandro'; bg.mon = 'zumbaflor';
  await say(['¡' + name + '! ¡Qué buen nombre! Suena a protagonista. A protagonista de segunda temporada, que es cuando la historia se pone buena.',
    'Te espero en Aldea Pitch. Mi amigo marinero te va a llevar en su barco. Si te mareás, mirá el horizonte. Si te sigue mareando, mirá para otro lado.',
    '¡Que empiece la aventura!'], 'Alessandro');
  await fadeTo(1, 30);
  Scenes.remove(bg);
  WORLD = new World(); Scenes.push(WORLD);
  linkInteriors();
  WORLD.load('pitch', 10, 18, 'up');
  await fadeTo(0, 30);
  WORLD.lock++;
  try { await S.intro(); } finally { WORLD.lock--; }
}

// ---------- arranque ----------
function showFatal(msg) {
  const b = document.getElementById('boot');
  b.style.display = 'flex'; b.style.background = '#200'; b.style.color = '#fbb'; b.style.padding = '20px'; b.style.whiteSpace = 'pre-wrap'; b.style.fontSize = '12px';
  b.textContent = 'Ups, algo falló:\n\n' + msg + '\n\nRecargá la página. Si sigue, avisá con este mensaje.';
}
window.addEventListener('error', (e) => showFatal(e.message + '\n' + (e.filename || '') + ':' + (e.lineno || '')));
window.addEventListener('unhandledrejection', (e) => showFatal(String(e.reason && e.reason.stack || e.reason)));
(async function boot() {
  try { await loadFont(); } catch (e) { console.warn('Sin fuente', e); }
  linkInteriors();
  fitScreens();
  document.getElementById('boot').style.display = 'none';
  Scenes.push(new TitleScene());
  requestAnimationFrame(loop);
})();
