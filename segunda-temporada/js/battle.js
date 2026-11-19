'use strict';
// =====================================================================
//  COMBATE POR TURNOS (estilo BW: comandos en la pantalla inferior)
// =====================================================================
const STAT_N = { atk: 'ataque', def: 'defensa', spe: 'velocidad', acc: 'precisión' };
const msgB = (t, auto = 0) => open(new DialogScene(fill(t), { auto }));

class Battle {
  constructor(o) {
    this.o = o; this.opaque = true;
    this.wild = !!o.wild; this.tr = o.trainer || null;
    this.foeTeam = this.wild ? [o.wild] : this.tr.team;
    this.foe = this.foeTeam[0];
    this.me = G.party.find((m) => !m.fainted);
    this.bg = o.bg || 'grass';
    this.mode = 'idle'; this.sel = 0; this.msel = 0;
    this.st = { me: this.blankStages(), foe: this.blankStages() };
    this.part = new Set([this.me]);
    this.fx = { me: { dx: -200, dy: 0, a: 1, hide: false, sc: 1 }, foe: { dx: 200, dy: 0, a: 1, hide: false, sc: 1 } };
    this.hpShow = { me: this.me.hp, foe: this.foe.hp }; this.xpShow = this.me.xp;
    this.parts = []; this.shake = 0; this.flash = 0;
    this.trainerX = 200; this.showTrainer = !this.wild; this.ball = null; this.runTries = 0;
    for (const m of this.foeTeam) markSeen(m.id);
  }
  blankStages() { return { atk: 0, def: 0, spe: 0, acc: 0 }; }
  // ---------- entrada del jugador ----------
  wait(mode) { this.mode = mode; return new Promise((r) => { this.resolve = r; }); }
  answer(v) { const r = this.resolve; this.resolve = null; this.mode = 'idle'; sfx(v === -1 ? 'back' : 'select'); r(v); }
  cmdRects() { return [{ x: 40, y: 14, w: 176, h: 96, k: 'fight' }, { x: 6, y: 126, w: 78, h: 44, k: 'bag' }, { x: 89, y: 140, w: 78, h: 44, k: 'run' }, { x: 172, y: 126, w: 78, h: 44, k: 'party' }]; }
  moveRects() { return [0, 1, 2, 3].map((i) => ({ x: 6 + (i % 2) * 124, y: 14 + Math.floor(i / 2) * 64, w: 120, h: 58 })); }
  update() {
    if (this.mode === 'cmd') {
      const order = ['fight', 'bag', 'run', 'party'];
      if (Input.rep.left) { this.sel = this.sel === 3 ? 2 : this.sel === 2 ? 1 : this.sel; sfx('blip'); }
      if (Input.rep.right) { this.sel = this.sel === 1 ? 2 : this.sel === 2 ? 3 : this.sel; sfx('blip'); }
      if (Input.rep.down && this.sel === 0) { this.sel = 2; sfx('blip'); }
      if (Input.rep.up && this.sel > 0) { this.sel = 0; sfx('blip'); }
      if (Input.A) return this.answer(order[this.sel]);
      if (Input.B && this.sel !== 2) { this.sel = 2; sfx('blip'); }
      for (const r of this.cmdRects()) if (hit(r)) return this.answer(r.k);
    } else if (this.mode === 'moves') {
      const n = this.me.moves.length;
      if (Input.rep.left || Input.rep.right) { this.msel ^= 1; sfx('blip'); }
      if (Input.rep.up || Input.rep.down) { this.msel ^= 2; sfx('blip'); }
      if (this.msel >= n) this.msel = n - 1;
      if (Input.A) return this.answer(this.msel);
      if (Input.B) return this.answer(-1);
      this.moveRects().forEach((r, i) => { if (i < n && hit(r)) this.answer(i); });
      if (hit({ x: 168, y: 150, w: 84, h: 36 })) this.answer(-1);
    }
    // partículas
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.life--; }
    this.parts = this.parts.filter((p) => p.life > 0);
    if (this.shake > 0) this.shake--;
    if (this.flash > 0) this.flash--;
  }
  // ---------- dibujo ----------
  drawTop(ctx) {
    const sx = this.shake ? ((FRAME & 2) - 1) * 2 : 0;
    ctx.save(); ctx.translate(sx, 0);
    ctx.drawImage(battleBg(this.bg), 0, 0);
    platform(ctx, 190 + this.fx.foe.dx * 0, 96, 50, 11, this.bg);
    platform(ctx, 70, 152, 66, 13, this.bg);
    ctx.fillStyle = '#00000038';
    if (!this.showTrainer && !this.fx.foe.hide) { ctx.beginPath(); ctx.ellipse(190 + this.fx.foe.dx, 95, 26 * this.fx.foe.sc, 5 * this.fx.foe.sc, 0, 0, Math.PI * 2); ctx.fill(); }
    const bob = (FRAME >> 4) & 1;
    // rival
    if (this.showTrainer) {
      const looks = this.tr.looks || [this.tr.look];
      looks.forEach((lk, i) => drawSpriteScaled(ctx, personSprite(lk, 0, 0), 166 + this.trainerX - 200 + i * 30 - (looks.length - 1) * 15, 30, 3));
    } else if (!this.fx.foe.hide && this.foe) {
      const f = this.fx.foe; ctx.globalAlpha = f.a;
      const cv = creatureSprite(this.foe.id);
      if (f.sc !== 1) drawSpriteScaled(ctx, cv, 190 - 40 * f.sc + f.dx, 98 - 80 * f.sc + f.dy, f.sc);
      else ctx.drawImage(cv, 150 + f.dx, 18 + f.dy + (this.mode === 'cmd' ? bob : 0));
      ctx.globalAlpha = 1;
    }
    // crisal lanzado
    if (this.ball) { const b = this.ball; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r || 0); drawSpriteScaled(ctx, itemIcon(b.id), -8, -8, 1); ctx.restore(); }
    // propio
    if (!this.fx.me.hide && this.me) {
      const f = this.fx.me; ctx.globalAlpha = f.a;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 150 + Math.max(0, -f.dy)); ctx.clip();
      drawSpriteScaled(ctx, creatureSprite(this.me.id, true), 6 + f.dx, 24 + f.dy + (this.mode === 'cmd' ? 1 - bob : 0), 2);
      ctx.restore(); ctx.globalAlpha = 1;
    }
    for (const p of this.parts) { ctx.fillStyle = p.col; const s = p.s || 2; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); }
    ctx.restore();
    if (this.flash) { ctx.fillStyle = `rgba(255,255,255,${this.flash / 10})`; ctx.fillRect(0, 0, W, H); }
    // cajas de PS
    if (!this.showTrainer && this.foe && this.fx.foe.dx < 100) this.hpBox(ctx, this.foe, 'foe', 0, 10);
    if (this.me && this.fx.me.dx > -100) this.hpBox(ctx, this.me, 'me', 0, 96);
    if (this.mode === 'cmd' || this.mode === 'moves') {
      box(ctx, TB.x, TB.y, TB.w, TB.h);
      txt(ctx, '¿Qué hará ' + this.me.name + '?', TB.x + 9, TB.y + 8);
      if (this.mode === 'moves') { const M = MOVES[this.me.moves[this.msel].id]; txt(ctx, M.d.slice(0, 29), TB.x + 9, TB.y + 22, COL.dim, null); if (M.p) txt(ctx, 'Potencia ' + M.p + '  Precisión ' + (M.a || '--'), TB.x + 9, TB.y + 34, COL.dim, null); }
    }
  }
  hpBox(ctx, m, side, x, y) {
    // placa estilo BW: oscura, con corte en diagonal hacia el centro de la pantalla
    const me = side === 'me', w = 142, h = me ? 38 : 30;
    const x0 = me ? W - w : 0, y0 = y;
    const slant = 10;
    const path = () => { ctx.beginPath(); if (me) { ctx.moveTo(x0 + slant, y0); ctx.lineTo(W, y0); ctx.lineTo(W, y0 + h); ctx.lineTo(x0, y0 + h); } else { ctx.moveTo(0, y0); ctx.lineTo(x0 + w, y0); ctx.lineTo(x0 + w - slant, y0 + h); ctx.lineTo(0, y0 + h); } ctx.closePath(); };
    ctx.save(); ctx.translate(0, 2); ctx.fillStyle = '#00000050'; path(); ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#4a5878'); g.addColorStop(0.5, '#2c3650'); g.addColorStop(1, '#1e2638');
    ctx.fillStyle = g; path(); ctx.fill();
    ctx.strokeStyle = '#8898c0'; ctx.lineWidth = 1; ctx.save(); ctx.translate(0.5, 0.5); path(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = TYPES[m.type].c; ctx.fillRect(me ? x0 + slant + 2 : 2, y0 + 3, 3, 9);
    const tx = me ? x0 + slant + 8 : 8;
    const lvS = 'Nv' + m.lv, maxC = Math.floor((w - slant - 14 - txtW(lvS) - 4) / 8);
    txt(ctx, m.name.slice(0, maxC), tx, y0 + 4, '#ffffff', '#101420');
    txt(ctx, 'Nv' + m.lv, (me ? W : x0 + w - slant) - 4, y0 + 4, '#f8e8a0', '#101420', 'right');
    const shown = (this.hpShow[side] += (m.hp - this.hpShow[side]) * 0.12);
    if (Math.abs(shown - m.hp) < 0.5) this.hpShow[side] = m.hp;
    const bx = tx + 18, by = y0 + 17, bw = 92;
    txt(ctx, 'PS', tx, by - 2, '#f8c040', '#101420');
    hpBar(ctx, bx, by, bw, clamp(this.hpShow[side] / m.maxhp, 0, 1));
    if (me) statusBadge(ctx, m.status, x0 + slant + 6, y0 + 25); else if (m.status) statusBadge(ctx, m.status, x0 + w - 34, y0 + h + 2);
    if (me) {
      txt(ctx, Math.round(this.hpShow.me) + '/' + m.maxhp, W - 6, y0 + 25, '#ffffff', '#101420', 'right');
      const need = xpFor(m.lv + 1) - xpFor(m.lv);
      this.xpShow += (m.xp - this.xpShow) * 0.1;
      const fr = clamp((this.xpShow - xpFor(m.lv)) / need, 0, 1);
      ctx.fillStyle = '#101420'; ctx.fillRect(x0 + 6, y0 + h - 4, w - 10, 3); ctx.fillStyle = '#58c0ff'; ctx.fillRect(x0 + 7, y0 + h - 3, Math.round((w - 12) * fr), 1);
    }
  }
  drawBot(ctx) {
    botBackdrop(ctx, '#203048', '#263a56');
    if (this.mode === 'cmd') {
      const lab = { fight: 'LUCHAR', bag: 'BOLSA', run: 'HUIR', party: 'EQUIPO' }, col = { fight: '#e05048', bag: '#e8a830', run: '#4880d8', party: '#48a858' };
      const order = ['fight', 'bag', 'run', 'party'];
      for (const r of this.cmdRects()) { const sel = order[this.sel] === r.k; pill(ctx, r.x, r.y, r.w, r.h, col[r.k], lab[r.k], { sel }); }
      ctx.drawImage(creatureIcon(this.me.id), 112, 54);
    } else if (this.mode === 'moves') {
      this.moveRects().forEach((r, i) => {
        const mv = this.me.moves[i]; if (!mv) { ctx.fillStyle = '#ffffff10'; ctx.fillRect(r.x, r.y, r.w, r.h); return; }
        const M = MOVES[mv.id], sel = i === this.msel;
        pill(ctx, r.x, r.y, r.w, r.h, mv.pp ? TYPES[M.t].c : '#686870', null, { sel });
        txt(ctx, M.n.slice(0, 14), r.x + r.w / 2, r.y + 12, '#fff', '#00000080', 'center');
        txt(ctx, TYPES[M.t].n, r.x + 8, r.y + 36, '#ffffffd0', '#00000060');
        txt(ctx, mv.pp + '/' + M.pp, r.x + r.w - 8, r.y + 36, '#fff', '#00000080', 'right');
        const e = M.p ? eff(M.t, this.foe.type) : 1;
        if (M.p && e !== 1) txt(ctx, e > 1 ? '▲ Eficaz' : e === 0 ? '✕ Nulo' : '▼ Poco', r.x + 8, r.y + 24, e > 1 ? '#f8f8a0' : '#e0e0e0', '#00000080');
      });
      pill(ctx, 168, 150, 84, 36, '#c05050', 'VOLVER');
    } else {
      ctx.fillStyle = '#ffffff10'; ctx.fillRect(20, 60, 216, 72);
      txt(ctx, this.wild ? 'Combate salvaje' : (this.tr.name || ''), 128, 74, '#c8d4f0', '#000', 'center');
      const alive = this.foeTeam.filter((m) => !m.fainted).length;
      if (!this.wild) for (let i = 0; i < this.foeTeam.length; i++) { ctx.fillStyle = this.foeTeam[i].fainted ? '#505060' : '#e05048'; ctx.beginPath(); ctx.arc(128 - (this.foeTeam.length - 1) * 8 + i * 16, 98, 5, 0, Math.PI * 2); ctx.fill(); }
      for (let i = 0; i < G.party.length; i++) { ctx.fillStyle = G.party[i].fainted ? '#505060' : '#48c060'; ctx.beginPath(); ctx.arc(128 - (G.party.length - 1) * 8 + i * 16, 118, 5, 0, Math.PI * 2); ctx.fill(); }
      void alive;
    }
  }
  // ---------- efectos visuales ----------
  burst(side, type, n = 18) {
    const cx = side === 'foe' ? 190 : 70, cy = side === 'foe' ? 58 : 100;
    const c = TYPES[type].c, c2 = shade(c, 0.5);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 2.5;
      const p = { x: cx + Math.cos(a) * 6, y: cy + Math.sin(a) * 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 18 + rnd(12), col: i % 2 ? c : c2, s: 2 + rnd(3) };
      if (type === 'fire') { p.vy = -1 - Math.random() * 2; p.vx *= 0.5; }
      if (type === 'water') { p.g = 0.15; p.vy -= 2; }
      if (type === 'plant') { p.g = 0.05; }
      if (type === 'fairy') { p.s = 2; p.col = i % 3 ? '#ffffff' : c; }
      this.parts.push(p);
    }
  }
  arrows(side, up) {
    const cx = side === 'foe' ? 190 : 70, cy = side === 'foe' ? 60 : 100;
    for (let i = 0; i < 14; i++) this.parts.push({ x: cx - 30 + Math.random() * 60, y: cy + (up ? 30 : -30) + Math.random() * 20, vx: 0, vy: up ? -1.6 : 1.6, life: 30, col: up ? '#f87050' : '#5890f0', s: 3 });
  }
  async lunge(side) { const f = this.fx[side], d = side === 'me' ? 12 : -12; await tween(6, (t) => { f.dx = d * t; }); await tween(6, (t) => { f.dx = d * (1 - t); }); }
  async blink(side) { const f = this.fx[side]; for (let i = 0; i < 6; i++) { f.hide = !f.hide; await wait(4); } f.hide = false; }
  async hpSettle(side) { const m = side === 'me' ? this.me : this.foe; for (let i = 0; i < 90 && Math.abs(this.hpShow[side] - m.hp) > 0.5; i++) await wait(1); }
  async faintAnim(side) { const f = this.fx[side]; sfx('faint'); await tween(22, (t) => { f.dy = 70 * t; f.a = 1 - t; }); f.hide = true; f.dy = 0; f.a = 1; }
  async sendOut(side, m, say = true) {
    const f = this.fx[side];
    if (side === 'me') { this.me = m; this.st.me = this.blankStages(); this.part.add(m); this.hpShow.me = m.hp; this.xpShow = m.xp; }
    else { this.foe = m; this.st.foe = this.blankStages(); this.hpShow.foe = m.hp; markSeen(m.id); }
    f.hide = false; f.a = 1; f.dy = 0; f.dx = 0; f.sc = 0.05;
    if (say) { const t = side === 'me' ? '¡Adelante, ' + m.name + '!' : this.tr.name + ' sacó a ' + m.name + '.'; const p = msgB(t, 30); await tween(14, (k) => { f.sc = 0.05 + 0.95 * k; }); f.sc = 1; this.flash = 4; await p; }
    else { await tween(14, (k) => { f.sc = 0.05 + 0.95 * k; }); f.sc = 1; }
  }
  // ---------- flujo principal ----------
  async run() {
    Sound.play(this.o.music || (this.tr ? (this.tr.boss ? 'king' : this.tr.leader ? 'leader' : 'battle') : 'battle'));
    // entrada
    this.fx.me.hide = true;
    if (this.wild) {
      await tween(26, (t) => { this.fx.foe.dx = 200 * (1 - t); });
      await msgB('¡Un ' + this.foe.name + ' salvaje apareció!');
    } else {
      await tween(26, (t) => { this.trainerX = 360 - 160 * t; });
      this.trainerX = 200;
      if (this.tr.intro) await say(this.tr.intro, this.tr.name);
      await msgB('¡' + this.tr.name + (this.tr.looks ? ' te desafían' : ' te desafía') + '!');
      await tween(16, (t) => { this.trainerX = 200 + 160 * t; });
      this.showTrainer = false;
      await this.sendOut('foe', this.foe);
    }
    this.fx.me.dx = 0;
    await this.sendOut('me', this.me);
    // bucle de turnos
    for (;;) {
      const res = await this.playerTurn();
      if (res) return this.finish(res);
    }
  }
  async playerTurn() {
    for (;;) {
      const c = await this.wait('cmd');
      if (c === 'fight') {
        if (this.me.moves.every((m) => m.pp <= 0)) { await msgB(this.me.name + ' no tiene PP... ¡pelea a lo bruto!'); return this.resolveTurn({ k: 'struggle' }); }
        const i = await this.wait('moves');
        if (i < 0) continue;
        if (this.me.moves[i].pp <= 0) { await msgB('¡No quedan PP para ese movimiento!'); continue; }
        return this.resolveTurn({ k: 'move', i });
      }
      if (c === 'party') {
        const i = await partyMenu('select', { title: 'CAMBIAR', filter: (m) => (m.fainted ? m.name + ' no puede pelear.' : m === this.me ? '¡Ya está en escena!' : null) });
        if (i < 0) continue;
        return this.resolveTurn({ k: 'switch', i });
      }
      if (c === 'bag') {
        const id = await bagMenu('battle');
        if (!id) continue;
        const I = ITEMS[id];
        if (I.k === 'ball') {
          if (!this.wild) { await msgB('¡No se roban criaturas ajenas! ¿Qué clase de crianza tuviste?'); continue; }
          if (this.o.noCatch) { await msgB('Esta criatura no se deja vincular así nomás.'); continue; }
          takeItem(id);
          return this.resolveTurn({ k: 'ball', id });
        }
        const i = await partyMenu('select', { title: 'USAR ' + I.n.toUpperCase().slice(0, 18) });
        if (i < 0) continue;
        if (!(await useItemOn(id, G.party[i], true))) continue;
        takeItem(id);
        await msgB('Usaste ' + I.n + ' en ' + G.party[i].name + '.');
        return this.resolveTurn({ k: 'item' });
      }
      if (c === 'run') {
        if (!this.wild) { await msgB(this.o.rehearsal ? '¿Abandonar el ensayo? ¡El show debe continuar!' : '¡No se huye de un combate entre personas! Sería de muy mala educación.'); if (this.o.rehearsal && (await ask('¿Salir del ensayo?', ['Sí', 'No'])) === 0) return 'run'; continue; }
        this.runTries++;
        if (this.me.spe >= this.foe.spe || chance(0.5 + this.runTries * 0.15)) { sfx('run'); await msgB('¡Escapaste sin problemas!'); return 'run'; }
        await msgB('¡No pudiste escapar!');
        return this.resolveTurn({ k: 'none' });
      }
    }
  }
  foeChoice() {
    const f = this.foe, usable = f.moves.map((m, i) => i).filter((i) => f.moves[i].pp > 0);
    if (!usable.length) return -1;
    if (this.wild && !this.tr) return pick(usable);
    let best = usable[0], bs = -1;
    for (const i of usable) {
      const M = MOVES[f.moves[i].id], e = M.e || {};
      let s;
      if (M.p) s = M.p * eff(M.t, this.me.type) * (M.t === f.type ? 1.5 : 1) * ((M.a || 100) / 100);
      else if (e.heal) s = f.hp < f.maxhp * 0.4 ? 140 : 5;
      else if (e.st) s = this.me.status ? 0 : 55;
      else if (e.me) s = this.st.foe.atk < 2 && f.hp > f.maxhp * 0.6 ? 50 : 8;
      else s = 30;
      s *= 0.8 + Math.random() * 0.4;
      if (s > bs) { bs = s; best = i; }
    }
    return best;
  }
  speedOf(side) { const m = side === 'me' ? this.me : this.foe; return m.spe * STAGE_MUL(this.st[side].spe) * (m.status === 'par' ? 0.5 : 1); }
  async resolveTurn(act) {
    // acciones previas del jugador
    if (act.k === 'switch') {
      await msgB('¡Volvé, ' + this.me.name + '!', 25);
      await tween(10, (t) => { this.fx.me.dx = -180 * t; }); this.fx.me.dx = 0;
      await this.sendOut('me', G.party[act.i]);
    }
    if (act.k === 'ball') { const r = await this.throwBall(act.id); if (r) return r; }
    const fi = this.foeChoice();
    const acts = [];
    if (act.k === 'move' || act.k === 'struggle') acts.push({ side: 'me', i: act.k === 'move' ? act.i : -1, prio: act.k === 'move' ? (MOVES[this.me.moves[act.i].id].e || {}).prio || 0 : 0 });
    acts.push({ side: 'foe', i: fi, prio: fi >= 0 ? (MOVES[this.foe.moves[fi].id].e || {}).prio || 0 : 0 });
    acts.sort((a, b) => b.prio - a.prio || this.speedOf(b.side) - this.speedOf(a.side) || Math.random() - 0.5);
    for (const a of acts) {
      const user = a.side === 'me' ? this.me : this.foe;
      if (user.fainted) continue;
      await this.useMove(a.side, a.i);
      const r = await this.checkFaints();
      if (r) return r;
      if (r === false) break; // alguien cayó: el que entra no actúa
    }
    // fin de turno: quemaduras
    for (const side of ['me', 'foe']) {
      const m = side === 'me' ? this.me : this.foe;
      if (m.status === 'brn' && !m.fainted) {
        m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(m.maxhp / 16)));
        this.burst(side, 'fire', 10); await msgB(m.name + ' sufre por la quemadura.', 30); await this.hpSettle(side);
        const r = await this.checkFaints(); if (r) return r;
      }
    }
    return null;
  }
  // devuelve: resultado final, false si alguien cayó y se reemplazó, null si nada
  async checkFaints() {
    let swapped = null;
    if (this.foe.fainted && !this.fx.foe.hide) {
      await this.faintAnim('foe');
      await msgB((this.wild ? '¡El ' : '¡') + this.foe.name + (this.wild ? ' salvaje' : ' de ' + this.tr.name) + ' se debilitó!');
      await this.giveXp(this.foe);
      const next = this.foeTeam.find((m) => !m.fainted);
      if (!next) return 'win';
      if (!this.me.fainted && G.party.filter((m) => !m.fainted).length > 1 && G.opts.shift !== false) {
        const r = await ask(this.tr.name + ' va a sacar a ' + next.name + '. ¿Cambiás de criatura?', ['Sí', 'No'], null, 1);
        if (r === 0) { const i = await partyMenu('select', { title: 'CAMBIAR', filter: (m) => (m.fainted ? 'No puede pelear.' : m === this.me ? 'Ya está en escena.' : null) }); if (i >= 0) { await tween(10, (t) => { this.fx.me.dx = -180 * t; }); this.fx.me.dx = 0; await this.sendOut('me', G.party[i], false); } }
      }
      await this.sendOut('foe', next);
      swapped = false;
    }
    if (this.me.fainted && !this.fx.me.hide) {
      await this.faintAnim('me');
      await msgB('¡' + this.me.name + ' se debilitó!');
      if (!G.party.some((m) => !m.fainted)) return 'lose';
      const i = await partyMenu('select', { title: '¿QUIÉN SIGUE?', forced: true, filter: (m) => (m.fainted ? m.name + ' no puede pelear.' : null) });
      await this.sendOut('me', G.party[i]);
      swapped = false;
    }
    return swapped;
  }
  async giveXp(foe) {
    const base = Math.floor((foe.sp.xp * foe.lv) / 6 * (this.wild ? 1 : 1.5) * (this.o.rehearsal ? 0.7 : 1));
    for (const m of G.party) {
      if (m.fainted || m.lv >= 100) continue;
      const gain = this.part.has(m) ? base : Math.floor(base / 2);
      if (gain <= 0) continue;
      m.xp += gain;
      if (this.part.has(m)) await msgB(m.name + ' ganó ' + gain + ' puntos de experiencia.');
      if (m === this.me) for (let i = 0; i < 40 && Math.abs(this.xpShow - Math.min(m.xp, xpFor(m.lv + 1))) > 1; i++) await wait(1);
      await levelUpFlow(m, this);
    }
    const shared = G.party.filter((m) => !m.fainted && !this.part.has(m));
    if (shared.length) await msgB('El resto del equipo también aprendió algo mirando.', 40);
    this.part = new Set([this.me]);
  }
  async useMove(side, idx) {
    const A = side === 'me' ? this.me : this.foe, D = side === 'me' ? this.foe : this.me, ts = side === 'me' ? 'foe' : 'me';
    const SA = this.st[side], SD = this.st[ts];
    // estados que impiden moverse
    if (A.status === 'slp') {
      A.slp--;
      if (A.slp > 0) { await msgB(A.name + ' está durmiendo. Zzz...', 35); return; }
      A.status = null; await msgB('¡' + A.name + ' se despertó!', 30);
    }
    if (A.status === 'par' && chance(0.25)) { sfx('status'); await msgB('¡' + A.name + ' está paralizado! No se puede mover.', 40); return; }
    const mvObj = idx >= 0 ? A.moves[idx] : null;
    const id = mvObj ? mvObj.id : 'placaje';
    const M = MOVES[id], e = M.e || {};
    if (mvObj) mvObj.pp = Math.max(0, mvObj.pp - 1);
    await msgB((side === 'foe' && this.wild ? 'El ' + A.name + ' salvaje' : A.name) + ' usó ' + M.n + '.', 26);
    // precisión
    if (M.a) {
      const acc = M.a * STAGE_MUL(SA.acc);
      if (Math.random() * 100 >= acc) { await msgB('¡Pero falló!', 35); return; }
    }
    if (M.p) {
      await this.lunge(side);
      const ef = eff(M.t, D.type);
      if (ef === 0) { await msgB('No afecta a ' + D.name + '...', 40); return; }
      const crit = Math.random() < (e.crit ? 1 / 8 : 1 / 16);
      const atk = A.atk * STAGE_MUL(SA.atk) * (A.status === 'brn' ? 0.5 : 1);
      const def = D.def * STAGE_MUL(crit ? Math.min(0, SD.def) : SD.def);
      let dmg = Math.floor(Math.floor((Math.floor((2 * A.lv) / 5 + 2) * M.p * atk) / def) / 50) + 2;
      dmg = Math.floor(dmg * (M.t === A.type ? 1.5 : 1) * ef * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15));
      if (!mvObj) dmg = Math.max(1, Math.floor(dmg * 0.6));
      dmg = Math.max(1, Math.min(dmg, D.hp));
      this.burst(ts, M.t); sfx(ef > 1 ? 'super' : ef < 1 ? 'weak' : 'hit');
      if (ef > 1) this.shake = 12;
      D.hp -= dmg;
      await this.blink(ts); await this.hpSettle(ts);
      if (crit) await msgB('¡Un golpe crítico!', 30);
      if (ef > 1) await msgB('¡Es superefectivo!', 30);
      if (ef < 1) await msgB('No es muy efectivo...', 30);
      if (ef > 1 && side === 'me' && flag('luchitoActive') && !flag('dip_docu')) {
        G.flags.luchitoHits = (G.flags.luchitoHits || 0) + 1;
        if (G.flags.luchitoHits <= 3) await msgB('(Luchito anotó tu golpe: ' + G.flags.luchitoHits + '/3)', 40);
      }
      if (e.drain && A.hp < A.maxhp) { A.hp = Math.min(A.maxhp, A.hp + Math.max(1, Math.floor((dmg * e.drain) / 100))); await this.hpSettle(side); await msgB(D.name + ' perdió energía.', 26); }
      if (e.recoil || !mvObj) { A.hp = Math.max(0, A.hp - Math.max(1, Math.floor((dmg * (e.recoil || 25)) / 100))); await this.hpSettle(side); await msgB(A.name + ' también se lastimó.', 26); }
      if (!D.fainted && e.st && chance(e.st[1] / 100)) await this.applyStatus(D, ts, e.st[0]);
      if (!D.fainted && e.foe && chance(e.foe[1] / 100)) for (const [s, n] of e.foe[0].length ? [e.foe[0]] : []) await this.stage(ts, D, s, n);
      if (e.me && (!e.meChance || chance(e.meChance / 100))) for (const [s, n] of e.me) await this.stage(side, A, s, n);
    } else {
      if (e.heal) {
        if (A.hp >= A.maxhp) { await msgB('¡Pero ya tenía todos sus PS!', 30); return; }
        A.hp = Math.min(A.maxhp, A.hp + Math.floor((A.maxhp * e.heal) / 100)); sfx('heal'); this.arrows(side, true);
        await this.hpSettle(side); await msgB(A.name + ' se echó una siestita y recuperó energía.', 35);
      }
      if (e.st) { if (D.status) await msgB('¡Pero no tuvo efecto!', 30); else await this.applyStatus(D, ts, e.st[0], true); }
      if (e.foe) for (const [s, n] of [e.foe[0]]) await this.stage(ts, D, s, n);
      if (e.me) for (const [s, n] of e.me) await this.stage(side, A, s, n);
    }
  }
  async applyStatus(m, side, st, loud) {
    if (m.status) return;
    if (st === 'brn' && m.type === 'fire') { if (loud) await msgB(m.name + ' es de fuego. Una quemadura le da cosquillas.', 35); return; }
    m.status = st; if (st === 'slp') m.slp = 1 + rint(1, 3);
    sfx('status'); this.burst(side, st === 'brn' ? 'fire' : st === 'par' ? 'normal' : 'fairy', 12);
    const t = { brn: '¡' + m.name + ' se quemó!', par: '¡' + m.name + ' quedó paralizado! Puede que no se mueva.', slp: '¡' + m.name + ' se quedó dormido!' }[st];
    await msgB(t, 40);
  }
  async stage(side, m, s, n) {
    const S = this.st[side], old = S[s];
    S[s] = clamp(old + n, -6, 6);
    if (S[s] === old) { await msgB('¡' + STAT_N[s][0].toUpperCase() + STAT_N[s].slice(1) + ' de ' + m.name + ' no puede ' + (n > 0 ? 'subir' : 'bajar') + ' más!', 30); return; }
    sfx(n > 0 ? 'stat_up' : 'stat_down'); this.arrows(side, n > 0);
    await msgB('¡' + (s === 'acc' ? 'La ' : 'El ') + STAT_N[s] + ' de ' + m.name + (Math.abs(n) > 1 ? ' subió mucho!' : ' subió!').replace('subió', n > 0 ? 'subió' : 'bajó'), 35);
  }
  async throwBall(id) {
    const f = this.foe, I = ITEMS[id];
    await msgB('¡Lanzaste un ' + I.n + '!', 20);
    sfx('throw');
    this.ball = { id, x: 40, y: 120, r: 0 };
    await tween(24, (t) => { this.ball.x = 40 + 150 * t; this.ball.y = 120 - 110 * Math.sin(t * Math.PI * 0.85) + t * 10; this.ball.r = t * 12; });
    this.flash = 8;
    await tween(10, (t) => { this.fx.foe.sc = 1 - t * 0.95; this.fx.foe.a = 1 - t; });
    this.fx.foe.hide = true; this.fx.foe.sc = 1; this.fx.foe.a = 1;
    this.ball.r = 0;
    await tween(10, (t) => { this.ball.y = 40 + 50 * t; });
    const a = (((3 * f.maxhp - 2 * f.hp) * f.sp.cr * I.v) / (3 * f.maxhp)) * (f.status === 'slp' ? 2 : f.status ? 1.5 : 1);
    const p = Math.min(1, a / 255), each = Math.pow(p, 0.25);
    let shakes = 0;
    while (shakes < 3 && Math.random() < each) shakes++;
    const ok = shakes === 3 && Math.random() < each;
    for (let i = 0; i < Math.min(3, ok ? 3 : shakes); i++) {
      await wait(18); sfx('shake');
      await tween(12, (t) => { this.ball.r = Math.sin(t * Math.PI * 2) * 0.5; });
    }
    await wait(14);
    if (ok) {
      sfx('caught');
      for (let i = 0; i < 10; i++) this.parts.push({ x: this.ball.x, y: this.ball.y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2, life: 30, col: '#f8e070', s: 2 });
      Sound.play('victory');
      await msgB('¡Listo! ¡Creaste un vínculo con ' + f.name + '!');
      const isNew = !G.dex.caught[f.id];
      markCaught(f.id);
      if (isNew) await msgB('Se registraron los datos de ' + f.name + ' en el Criaturario.');
      if ((await ask('¿Le ponés un mote a ' + f.name + '?', ['Sí', 'No'], null, 1)) === 0) { const nm = await nameEntry('Mote para ' + f.sp.n, f.sp.n, 10); if (nm && nm !== f.sp.n) f.nick = nm; }
      f.status = null; f.slp = 0;
      if (G.party.length < 6) G.party.push(f);
      else { f.heal(); G.box.push(f); await msgB(f.name + ' se fue a descansar a la Proa. Tu equipo ya está completo.'); }
      this.ball = null;
      return 'caught';
    }
    this.ball = null; this.flash = 6; this.fx.foe.hide = false;
    await msgB(['¡Oh, no! ¡Se escapó!', '¡Uf! Casi, casi...', '¡Argh! ¡Faltó un pelito!', '¡Noooo! ¡Ya estaba!'][Math.min(3, shakes)]);
    return null;
  }
  async finish(res) {
    if (res === 'win' && this.tr) {
      Sound.play('victory');
      this.showTrainer = true; this.trainerX = 360;
      await tween(18, (t) => { this.trainerX = 360 - 160 * t; });
      if (this.tr.lose) await say(this.tr.lose, this.tr.name);
      if (this.tr.money && !this.o.rehearsal) { G.money += this.tr.money; await msgB('Ganaste $' + this.tr.money + '. Cachet de combate.'); }
    } else if (res === 'win') Sound.play('victory');
    if (res === 'lose') {
      if (this.o.rehearsal) await msgB('¡Corte! El ensayo terminó. Nadie se lastimó de verdad.');
      else if (this.o.friendly) await msgB('¡Buen intento! Era solo una práctica entre amigos.');
      else {
        const lost = this.tr ? Math.floor(G.money / 4) : Math.floor(G.money / 8);
        G.money -= lost;
        await msgB('No te quedan criaturas en pie...');
        await msgB(lost ? 'En el apuro se te cayeron $' + lost + '. Todo se ve borroso...' : 'Todo se ve borroso...');
      }
    }
    if (this.o.rehearsal || this.o.friendly) for (const m of G.party) m.heal();
    await fadeTo(1, 18);
    this.done(res);
    if (res !== 'lose') await checkEvolutions(G.party);
    return res;
  }
}
async function startBattle(o) {
  sfx('exclaim');
  // transición: barras
  await fadeTo(1, 6, '#fff'); await fadeTo(0, 6, '#fff'); await fadeTo(1, 6, '#fff'); await fadeTo(0, 4, '#fff');
  await fadeTo(1, 14);
  const b = new Battle(o);
  const p = open(b);
  await fadeTo(0, 12);
  const res = await b.run();
  await p;
  return res;
}

// ---------- subir de nivel / aprender / evolucionar ----------
async function levelUpFlow(m, battle) {
  while (m.lv < 100 && m.xp >= xpFor(m.lv + 1)) {
    const old = { hp: m.maxhp, atk: m.atk, def: m.def, spe: m.spe };
    m.lv++; m.calc(); sfx('levelup');
    if (battle && m === battle.me) battle.xpShow = xpFor(m.lv);
    await say('¡' + m.name + ' subió al nivel ' + m.lv + '!  PS +' + (m.maxhp - old.hp) + '  Atq +' + (m.atk - old.atk) + '  Def +' + (m.def - old.def) + '  Vel +' + (m.spe - old.spe));
    for (const mv of m.movesAt(m.lv)) await learnMove(m, mv);
  }
}
async function learnMove(m, id) {
  if (m.moves.some((x) => x.id === id)) return;
  const M = MOVES[id];
  if (m.moves.length < 4) { m.moves.push({ id, pp: M.pp }); sfx('item'); await say('¡' + m.name + ' aprendió ' + M.n + '!'); return true; }
  for (;;) {
    const r = await ask(m.name + ' quiere aprender ' + M.n + ', pero ya sabe cuatro movimientos. ¿Olvida uno?', ['Sí', 'No'], null, 1);
    if (r === 1) { if ((await ask('¿Seguro que no aprende ' + M.n + '?', ['Seguro', 'No, esperá'], null, 1)) === 0) { await say(m.name + ' no aprendió ' + M.n + '.'); return false; } continue; }
    const i = await listMenu({
      title: '¿QUÉ OLVIDA?', items: m.moves.map((mv) => ({ label: MOVES[mv.id].n, sub: TYPES[MOVES[mv.id].t].n.slice(0, 6), col: shade(TYPES[MOVES[mv.id].t].c, -0.2) })),
      top: (ctx, it, k) => { drawMonInfo(ctx, m); box(ctx, 4, 116, 248, 18); txt(ctx, 'Nuevo: ' + M.n + ' (' + TYPES[M.t].n + ' ' + (M.p || '--') + ')', 10, 121); },
    });
    if (i < 0) continue;
    const old = MOVES[m.moves[i].id].n;
    m.moves[i] = { id, pp: M.pp };
    sfx('item');
    await say('1, 2 y... ¡puf! ' + m.name + ' olvidó ' + old + ' y aprendió ' + M.n + '.');
    return true;
  }
}
class EvoScene {
  constructor(m, to) { this.m = m; this.to = to; this.t = 0; this.opaque = true; this.phase = 0; this.cancel = false; }
  update() { this.t++; if (Input.B && this.phase === 1) this.cancel = true; }
  drawTop(ctx) {
    const g = ctx.createRadialGradient(128, 90, 10, 128, 90, 160); g.addColorStop(0, '#f8f0ff'); g.addColorStop(1, '#5848a0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + this.t * 0.02; ctx.fillStyle = '#ffffff60'; ctx.fillRect(128 + Math.cos(a) * (60 + (this.t * 2 + i * 7) % 60), 80 + Math.sin(a) * (40 + (this.t + i * 5) % 50), 2, 2); }
    let id = this.m.id;
    if (this.phase === 1) { const sp = Math.max(3, 20 - Math.floor(this.t / 12)); id = Math.floor(this.t / sp) % 2 ? this.to : this.m.id; }
    if (this.phase === 2) id = this.to;
    const cv = this.phase === 1 ? silhouette(id) : creatureSprite(id);
    if (this.phase === 1) { const c = mkCanvas(80, 80), x = c.getContext('2d'); x.drawImage(cv, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, 80, 80); drawSpriteScaled(ctx, c, 48, 10, 2); }
    else drawSpriteScaled(ctx, cv, 48, 10, 2);
  }
}
async function checkEvolutions(list) {
  for (const m of list) {
    const ev = m.sp.evo;
    if (!ev || m.lv < ev[1] || m.fainted) continue;
    Sound.stop();
    const sc = new EvoScene(m, ev[0]);
    const p = open(sc);
    await fadeTo(0, 10);
    await say('¿Qué? ¡' + m.name + ' está evolucionando!');
    sc.phase = 1; sc.t = 0; sfx('evolve');
    for (let i = 0; i < 260 && !sc.cancel; i++) { await wait(1); if (i % 60 === 59) sfx('evolve'); }
    if (sc.cancel) { sc.phase = 0; await say('¿Eh? ' + m.name + ' dejó de evolucionar. Le gusta cómo está. Respetamos.'); sc.done(); await p; continue; }
    const oldName = m.name; const hadNick = !!m.nick;
    sc.phase = 2; sc.t = 0; Sound.play('victory'); markCaught(ev[0]);
    m.id = ev[0]; m.calc();
    await say('¡Felicitaciones! ¡' + oldName + ' evolucionó en ' + SPECIES[ev[0]].n + '!' + (hadNick ? '' : ''));
    for (const mv of m.movesAt(m.lv)) await learnMove(m, mv);
    sc.done(); await p;
  }
}
