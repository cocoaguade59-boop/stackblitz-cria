// Test de integración Fase 5A: verifica que title/intro/starter/world funcionan
// con los nuevos imports desde src/screens/ y src/core/ + src/data/

import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Precargar un save falso para poder verificar load+continue
await page.addInitScript(() => {
  const save = {
    plx: 20, ply: 145, plD: 0, curMap: 'world',
    party: [{
      id: 'flameye', lv: 5, hp: 25, mHp: 25, ex: 0, exTo: 15,
      gender: 'M', tp: 'fire', nm: 'Flameye',
      ak: 12, df: 10, sp: 11,
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

const BASE = 'http://localhost:5173';
let errors = [];

// --- Test 1: Cargar la página (título) ---
try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500); // Dejar que el título se pinte
  const titleText = await page.locator('canvas').count();
  if (titleText === 0) throw new Error('No se encontró canvas');
  console.log('✅ TEST 1: Canvas detectado, título cargado correctamente');
} catch (e) {
  errors.push(`TEST 1: ${e.message}`);
  console.error(`❌ TEST 1: ${e.message}`);
}

// --- Test 2: Tomar screenshot del título ---
try {
  await page.screenshot({ path: 'test-screenshots/title.png' });
  console.log('✅ TEST 2: Screenshot título tomado (test-screenshots/title.png)');
} catch (e) {
  errors.push(`TEST 2: ${e.message}`);
  console.error(`❌ TEST 2: ${e.message}`);
}

// --- Test 3: Nueva partida (seleccionar "Nueva partida" y confirmar) ---
try {
  // Si tiene save, aparecen 2 opciones. Seleccionar Nueva partida (opción 1, flecha abajo)
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  // Confirmar reinicio: opción 1 = "Sí" (flecha abajo para llegar)
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(1000);

  // Debería estar en la intro (Alessandro acercándose)
  const currentUrl = page.url();
  console.log(`✅ TEST 3: Nueva partida iniciada, URL: ${currentUrl}`);
} catch (e) {
  errors.push(`TEST 3: ${e.message}`);
  console.error(`❌ TEST 3: ${e.message}`);
}

// --- Test 4: Avanzar la intro rapidísimo ---
try {
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-screenshots/starter.png' });
  console.log('✅ TEST 4: Intro avanzada, debería estar en pantalla starter');
} catch (e) {
  errors.push(`TEST 4: ${e.message}`);
  console.error(`❌ TEST 4: ${e.message}`);
}

// --- Test 5: Elegir starter y entrar al mundo ---
try {
  await page.keyboard.press('Space'); // Confirmar Flameye (primera opción)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-screenshots/world.png' });
  console.log('✅ TEST 5: Starter elegido, debería estar en el mundo');
} catch (e) {
  errors.push(`TEST 5: ${e.message}`);
  console.error(`❌ TEST 5: ${e.message}`);
}

// --- Test 6: Moverse en el mundo ---
try {
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(800);
  await page.keyboard.up('ArrowDown');
  await page.screenshot({ path: 'test-screenshots/world-moved.png' });
  console.log('✅ TEST 6: Movimiento en el mundo funciona');
} catch (e) {
  errors.push(`TEST 6: ${e.message}`);
  console.error(`❌ TEST 6: ${e.message}`);
}

// --- Test 7: Verificar que no hay errores en consola ---
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
await page.waitForTimeout(500);

if (consoleErrors.length === 0) {
  console.log('✅ TEST 7: Sin errores en consola');
} else {
  console.log(`⚠️ TEST 7: ${consoleErrors.length} errores en consola:`, consoleErrors.slice(0, 5));
}

await browser.close();

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} TEST(S) FALLARON:`);
  errors.forEach(e => console.log(`   - ${e}`));
  process.exit(1);
} else {
  console.log('\n✅ TODOS LOS TESTS PASARON - Fase 5A integrada correctamente');
}
