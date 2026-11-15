// Test de diagnóstico: captura errores reales de consola
import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const consoleErrors = [];
const consoleWarns = [];

page.on('pageerror', err => consoleErrors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push('[console.error] ' + msg.text());
  if (msg.type() === 'warning') consoleWarns.push('[console.warn] ' + msg.text());
});

// Precargar save
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

try {
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('✅ Página cargada');
  
  // Esperar que el juego se inicialice completamente
  await page.waitForTimeout(3000);
  
  if (consoleErrors.length > 0) {
    console.log(`❌ ${consoleErrors.length} ERRORES DE CONSOLA:`);
    consoleErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('✅ Sin errores de consola');
  }
  
  if (consoleWarns.length > 0) {
    console.log(`⚠️ ${consoleWarns.length} warnings:`);
    consoleWarns.slice(0, 10).forEach(w => console.log('  ' + w));
  }

  // Tomar screenshot del título
  await page.screenshot({ path: 'test-screenshots/diag-title.png' });
  console.log('✅ Screenshot título tomado');
  
  // Verificar errores después del SPACE
  const afterSpaceErrors = consoleErrors.length;
  console.log(`✅ SPACE presionado, errores totales: ${afterSpaceErrors}`);
  
  await page.screenshot({ path: 'test-screenshots/diag-after-space.png' });
  
} catch (e) {
  console.error('❌ Error:', e.message);
}

await browser.close();
