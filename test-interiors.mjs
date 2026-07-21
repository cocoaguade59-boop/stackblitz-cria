// C2.1 test: verificar edificios nuevos en Pitch (molino + casa NO)
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const press = async (page, key, ms = 120) => {
  await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); await sleep(80);
};

async function testBuilding(page, doorX, doorY, label) {
  await page.evaluate(([dx, dy]) => {
    const G = window.__G; if (!G) return;
    G.pl.x = dx; G.pl.y = dy; G.pl.d = 3;
    G.pl.moving = false; G.pl.stepTarget = null;
  }, [doorX, doorY]);
  await sleep(300);
  await page.keyboard.down('ArrowUp');
  await sleep(600);
  await page.keyboard.up('ArrowUp');
  await sleep(800);
  const r = await page.evaluate(() => window.__G?.curMap || '?');
  const ok = r === 'interior';
  if (ok) {
    // salir
    await press(page, 'ArrowDown', 80);
    await sleep(150);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.down('ArrowDown'); await sleep(100); await page.keyboard.up('ArrowDown'); await sleep(50);
    }
    await page.keyboard.down('ArrowDown'); await sleep(350); await page.keyboard.up('ArrowDown');
    await sleep(700);
    const e = await page.evaluate(() => window.__G?.curMap || '?');
    console.log(`   ${label}: entrada ✅ salida ${e === 'world' ? '✅' : '❌'}`);
    return e === 'world';
  }
  console.log(`   ${label}: ❌ no entró (curMap=${r})`);
  return false;
}

async function main() {
  const server = await createServer({ root: __dirname, server: { port: 5210 } });
  await server.listen();
  let failed = 0;
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.goto('http://localhost:5210', { waitUntil: 'domcontentloaded' });
    await sleep(4500);

    await press(page, ' ');
    await sleep(2500);
    for (let i = 0; i < 20; i++) {
      const s = await page.evaluate(() => window.__G?.scr || '?');
      if (s === 'starter') { await press(page, ' '); await sleep(1200); break; }
      if (s === 'world') break;
      await press(page, ' ');
      await sleep(100);
    }
    let st = await page.evaluate(() => window.__G ? `${window.__G.scr}/${window.__G.curMap}` : '?');
    if (st.includes('starter')) { await press(page, ' '); await sleep(1200); }

    // Test 1: Molino (door 72,287)
    console.log('─── Molino 5×9 ───');
    if (!await testBuilding(page, 72, 287, 'Molino')) failed++;

    // Test 2: Casa NO (door 40,278)
    console.log('─── Casa NO ───');
    if (!await testBuilding(page, 40, 278, 'Casa NO')) failed++;

    // Test 3: Casa NE (door 78,278)
    console.log('─── Casa NE ───');
    if (!await testBuilding(page, 78, 278, 'Casa NE')) failed++;

    // Test 4: Casa SO (door 40,295)
    console.log('─── Casa SO ───');
    if (!await testBuilding(page, 40, 295, 'Casa SO')) failed++;

    // Test 5: Casa SE (door 50,295)
    console.log('─── Casa SE ───');
    if (!await testBuilding(page, 50, 295, 'Casa SE')) failed++;

    console.log('\n' + (failed === 0 ? '✅ C2.1: 5/5 edificios funcionando' : `❌ ${failed} fallo(s)`));
    await browser.close();
  } finally { await server.close(); }
  process.exit(failed > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
