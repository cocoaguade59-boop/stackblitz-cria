// Utilidades de prueba: conducir el juego respondiendo diálogos y combates.
module.exports = (p, key, shot) => {
  const ev = (f, a) => p.evaluate(f, a);
  const state = () => ev(() => {
    const t = Scenes.top(); const b = Scenes.stack.find((s) => s instanceof Battle);
    return { t: t.constructor.name, lock: WORLD ? WORLD.lock : 0, choices: t.choices || null, text: t.pages ? t.pages.flat().join(' ') : '', mode: b && t === b ? b.mode : null, inBattle: !!b };
  });
  // policy(state) → tecla a presionar o null para terminar
  const drive = async (policy, max = 400) => {
    for (let i = 0; i < max; i++) {
      const s = await state();
      const k = await policy(s, i);
      if (k === null) return s;
      if (k === 'wait') { await p.waitForTimeout(120); continue; }
      await key(k, 1, 90);
    }
    return state();
  };
  const def = (s) => {
    if (s.t === 'DialogScene') { if (s.choices && /mote/i.test(s.text)) return 'KeyX'; if (s.choices && /olvid|Olvida/.test(s.text)) return 'KeyZ'; return 'KeyZ'; }
    if (s.t === 'PartyScene') return 'KeyZ';
    if (s.t === 'ListScene') return 'KeyZ';
    if (s.inBattle && s.mode === 'cmd') return 'KeyZ';
    if (s.inBattle && s.mode === 'moves') return 'KeyZ';
    if (s.t === 'EvoScene') return 'wait';
    if (s.t === 'NameScene') return 'Enter';
    if (s.t === 'World' && s.lock === 0) return null;
    return 'wait';
  };
  return { ev, state, drive, untilFree: () => drive(def) };
};
