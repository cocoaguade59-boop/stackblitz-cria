module.exports = async (p, key, shot) => {
  const { ev, drive } = require(require('path').resolve('tools/lib.cjs'))(p, key, shot);
  const ANS = ['Alessandro', 'Agua', 'Fotografía Estética', 'André', 'De su techo', 'Hada', 'En la Proa', 'Golpes superefectivos'];
  const policy = async (s) => {
    if (s.t === 'DialogScene' && s.choices) {
      if (/Pregunta/.test(s.text)) { const i = s.choices.findIndex((c) => ANS.includes(c)); for (let k = 0; k < i; k++) await key('ArrowDown', 1, 60); return 'KeyZ'; }
      if (/mote|apodo|Cambias/.test(s.text)) return 'KeyX';
      return 'KeyZ';
    }
    if (s.t === 'World' && s.lock === 0) return null;
    if (['DialogScene', 'ListScene', 'PartyScene', 'StarterScene', 'CreditsScene'].includes(s.t) || (s.inBattle && s.mode)) return 'KeyZ';
    if (s.t === 'NameScene') return 'Enter';
    return 'wait';
  };
  const run = async (label, setup) => {
    await ev(setup);
    const s = await drive(policy, 900);
    const info = await ev(() => JSON.stringify({ map: WORLD.map.id, dips: DIPLOMAS.filter((d) => flag('dip_' + d.id)).map((d) => d.id), money: G.money, top: Scenes.top().constructor.name }));
    console.log(label, '→', s.t, info);
  };
  await ev(() => { Scenes.stack.length = 0; G = newGameState('Sol', 'p_bun'); Object.assign(G.flags, { intro: 1, starter: 1, gabLeft: 1, gabStarter: 'gorilan', myStarter: 'flameye' });
    G.party = [new Mon('inferpavo', 70), new Mon('glaciolote', 70), new Mon('gorilegend', 70)]; WORLD = new World(); Scenes.push(WORLD); Fade.a = 0; });
  const at = (map, x, y) => `WORLD.load('${map}', ${x}, ${y}, 'up'); Fade.a = 0;`;
  await run('tamara', new Function(at('sb_studio', 5, 3) + 'WORLD.lock++; S.tamara().then(()=>WORLD.lock--); setTimeout(()=>{},0);'));
  await run('tamara2', new Function(at('sb_studio', 5, 3) + 'WORLD.lock++; S.tamara().then(()=>WORLD.lock--);'));
  await run('gab2', new Function(at('ruta2', 9, 6) + 'WORLD.lock++; S.gabriela2().then(()=>WORLD.lock--);'));
  await run('luchito1', new Function(at('rd_studio', 5, 3) + 'WORLD.lock++; S.luchito().then(()=>WORLD.lock--);'));
  await run('luchito2', new Function(at('rd_studio', 5, 3) + 'G.flags.luchitoHits=3; WORLD.lock++; S.luchito().then(()=>WORLD.lock--);'));
  await run('gonchi', new Function(at('rodaje', 10, 15) + 'WORLD.lock++; S.gonchi().then(()=>WORLD.lock--);'));
  await run('pachi', new Function(at('feria', 20, 10) + 'WORLD.lock++; S.pachiOut().then(()=>WORLD.lock--);'));
  await run('teatro', new Function(at('ft_teatro', 6, 3) + 'WORLD.lock++; S.teatro().then(()=>WORLD.lock--);'));
  await run('andrea', new Function(at('ft_studio', 5, 3) + 'WORLD.lock++; S.andrea().then(()=>WORLD.lock--);'));
  await run('andrea2', new Function(at('ft_studio', 5, 3) + 'WORLD.lock++; S.andrea().then(()=>WORLD.lock--);'));
  await run('dan1', new Function(at('pm_studio', 5, 3) + 'WORLD.lock++; S.dan().then(()=>WORLD.lock--);'));
  for (const n of [1, 2, 3]) await run('chisme' + n, new Function(at('montaje', 5, 5) + `WORLD.lock++; S.chisme(${n}).then(()=>WORLD.lock--);`));
  await run('dan2', new Function(at('pm_studio', 5, 3) + 'WORLD.lock++; S.dan().then(()=>WORLD.lock--);'));
  await run('oscar', new Function(at('montaje', 3, 11) + 'WORLD.lock++; S.oscar().then(()=>WORLD.lock--);'));
  await run('gab3', new Function(at('ruta5', 7, 11) + 'WORLD.lock++; S.gabriela3().then(()=>WORLD.lock--);'));
  await run('yam0', new Function(at('castillo', 16, 7) + 'WORLD.lock++; S.yam().then(()=>WORLD.lock--);'));
  await run('andre', new Function(at('castillo', 4, 7) + 'WORLD.lock++; S.andreCastle().then(()=>WORLD.lock--);'));
  await run('yam', new Function(at('castillo', 16, 7) + 'WORLD.lock++; S.yam().then(()=>WORLD.lock--);'));
  console.log('llave', await ev(() => hasItem('llave') + ' solid door ' + (WORLD.load('castillo', 10, 5, 'up'), WORLD.solid(10, 4))));
  await shot('30-castle');
  await run('rey', new Function(at('castillo', 10, 2) + 'WORLD.lock++; S.rey().then(()=>WORLD.lock--);'));
  await shot('31-post');
  await run('nicole-teja', new Function(at('pitch_nicole', 3, 3) + 'WORLD.lock++; S.nicole().then(()=>WORLD.lock--);'));
  await run('nicole-teja2', new Function(at('pitch_nicole', 3, 3) + 'WORLD.lock++; S.nicole().then(()=>WORLD.lock--);'));
  await run('edison', new Function(at('storyboard', 13, 12) + 'WORLD.lock++; S.edison().then(()=>WORLD.lock--);'));
  await run('gabpost', new Function(at('pitch', 12, 11) + 'WORLD.lock++; S.gabrielaPost().then(()=>WORLD.lock--);'));
  for (let i = 1; i <= 5; i++) await run('torre' + i, new Function(at('torre' + i, 5, 4) + `WORLD.lock++; trainerBattle(npc('tw${i}')).then(()=>WORLD.lock--);`));
  await run('taquillon', new Function(at('torre_top', 5, 3) + 'G.bag.cristalest=99; WORLD.lock++; S.taquillon().then(()=>WORLD.lock--);'));
  await run('tutor', new Function(at('ft_tutor', 4, 3) + 'G.money=99999; WORLD.lock++; S.tutor().then(()=>WORLD.lock--);'));
  await run('proa', new Function(at('pitch_proa', 9, 3) + 'G.bag.fragmento=6; WORLD.lock++; proaMenu().then(()=>WORLD.lock--);'));
  await run('save', new Function('saveGame(); const d = loadSave(); window.OK = d.party.length + " " + d.name;'));
  console.log(await ev(() => JSON.stringify({ ok: window.OK, flags: Object.keys(G.flags).length, dex: Object.keys(G.dex.caught).length, party: G.party.map((m) => m.id + m.lv), bag: G.bag })));
};
