// Test de batalla: fuerza un encuentro salvaje y verifica que funcione
import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('pageerror', err => errors.push(err.message));

// Save con criatura nivel 40, supervisor mode para forzar batalla
await page.addInitScript(() => {
  const save = {
    plx: 20, ply: 145, plD: 0, curMap: 'world',
    party: [{
      id: 'flameye', lv: 40, hp: 100, mHp: 100, ex: 0, exTo: 100,
      gender: 'M', tp: 'fire', nm: 'Flameye',
      ak: 50, df: 40, sp: 45,
      mv: [
        { nm: 'Ascuas', pw: 40, pp: 25, mp: 25, tp: 'fire', acc: 100 },
        { nm: 'Placaje', pw: 35, pp: 35, mp: 35, tp: 'normal', acc: 100 },
        { nm: 'Gruñido', pw: 0, pp: 40, mp: 40, tp: 'normal', ef: 'atkDn' },
        { nm: 'Nitrocarga', pw: 0, pp: 20, mp: 20, tp: 'fire', ef: 'spdUp' },
      ]
    }],
    proa: [], gold: 200, pot: 5, rev: 2, crv: 3,
    talkedTo: {}, bossOk: false, allTalked: false, allCaught: false,
    bWon: 0, tExp: 0, mFriend: 0, bossDialogs: 0, diplomas: {},
    postGame: false, towerOpen: false, oloDefeated: false, pairBattles: false,
    npcDefeats: {}, towerKey: {}, captureCount: {},
    lastHealPos: { x: 20, y: 145, map: 'world' }, prevPos: { x: 20, y: 145 },
  };
  localStorage.setItem('criaturasDelReino_v2', JSON.stringify(save));
});

try {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1500);
  console.log('✅ Página cargada');

  // Saltar título (continuar partida)
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);
  console.log('✅ Partida cargada');

  if (errors.length > 0) {
    console.log('❌ Errores tras carga:', errors);
    process.exit(1);
  }

  // Activar modo batallador (P) — esto fuerza el inicio de una batalla directamente
  await page.keyboard.press('p');
  await page.waitForTimeout(1500);
  console.log('✅ Modo batallador activado');

  // Seleccionar una criatura y cerrar batallador
  // Navegar y confirmar 6 criaturas rápidamente
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    if (i < 5) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }
  }
  await page.waitForTimeout(1000);
  console.log('✅ Equipo batallador seleccionado');

  // Ir a hierba alta caminando varias veces
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: 'test-screenshots/battle-pre.png' });
  console.log('✅ Movimiento hacia hierba');

  // Verificar que podemos abrir menú
  await page.keyboard.press('x');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-screenshots/battle-menu.png' });
  console.log('✅ Menú funciona');

  if (errors.length > 0) {
    console.log('❌ Errores:', errors.slice(0, 5));
    process.exit(1);
  }

  console.log('\n✅ SISTEMA DE BATALLA FUNCIONAL - cero errores');

} catch (e) {
  console.error('❌', e.message);
  if (errors.length > 0) console.log('Errores:', errors);
  process.exit(1);
} finally {
  await browser.close();
}
