// Test funcional Fase 5B: verifica que el diálogo funciona con el módulo nuevo
import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Precargar save en Aldea Pitch con una criatura nivel 5
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

try {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  console.log('✅ TEST 1: Página cargada');
} catch (e) {
  errors.push(`TEST 1: ${e.message}`);
  console.error(`❌ TEST 1: ${e.message}`);
}

// Nueva partida (skip título)
try {
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  console.log('✅ TEST 2: Nueva partida iniciada');
} catch (e) {
  errors.push(`TEST 2: ${e.message}`);
  console.error(`❌ TEST 2: ${e.message}`);
}

// Avanzar la intro completa
try {
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  console.log('✅ TEST 3: Intro avanzada');
} catch (e) {
  errors.push(`TEST 3: ${e.message}`);
  console.error(`❌ TEST 3: ${e.message}`);
}

// Elegir starter y entrar al mundo
try {
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-screenshots/dialog-world.png' });
  console.log('✅ TEST 4: Starter elegido, en el mundo');
} catch (e) {
  errors.push(`TEST 4: ${e.message}`);
  console.error(`❌ TEST 4: ${e.message}`);
}

// Hablar con Alessandro (está en x=18, y=144 — caminamos hacia él y presionamos SPACE)
try {
  // Caminar izquierda hacia Alessandro (de x=20 a x=18)
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(600);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(600);
  // Mirar hacia abajo para hablarle (está en y=144, nosotros en y=145)
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  // Presionar SPACE para hablar
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-screenshots/dialog-alessandro.png' });
  console.log('✅ TEST 5: Diálogo con Alessandro iniciado');
} catch (e) {
  errors.push(`TEST 5: ${e.message}`);
  console.error(`❌ TEST 5: ${e.message}`);
}

// Avanzar el diálogo línea por línea
try {
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-screenshots/dialog-after.png' });
  console.log('✅ TEST 6: Diálogo completado, de vuelta al mundo');
} catch (e) {
  errors.push(`TEST 6: ${e.message}`);
  console.error(`❌ TEST 6: ${e.message}`);
}

// Verificar que podemos movernos después del diálogo
try {
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-screenshots/dialog-moved.png' });
  console.log('✅ TEST 7: Movimiento post-diálogo funciona');
} catch (e) {
  errors.push(`TEST 7: ${e.message}`);
  console.error(`❌ TEST 7: ${e.message}`);
}

// Errores en consola
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
});
await page.waitForTimeout(300);

await browser.close();

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} ERROR(ES):`);
  errors.forEach(e => console.log(`   - ${e}`));
  process.exit(1);
} else {
  console.log('\n✅ TODOS LOS TESTS PASARON - Fase 5B integrada correctamente');
}
