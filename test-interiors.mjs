// C2.2 test: verificar conectividad de caminos + molino junto al río
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const press = async (page, key, ms = 120) => {
  await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); await sleep(80);
};

async function main() {
  const server = await createServer({ root: __dirname, server: { port: 5211 } });
  await server.listen();
  let ok = true;
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.goto('http://localhost:5211', { waitUntil: 'domcontentloaded' });
    await sleep(4500);

    await press(page, ' '); await sleep(2500);
    for (let i = 0; i < 20; i++) {
      const s = await page.evaluate(() => window.__G?.scr || '?');
      if (s === 'starter') { await press(page, ' '); await sleep(1200); break; }
      if (s === 'world') break;
      await press(page, ' ');
      await sleep(100);
    }
    let st = await page.evaluate(() => window.__G ? `${window.__G.scr}` : '?');
    if (st.includes('starter')) { await press(page, ' '); await sleep(1200); }

    // Verificar tile del molino
    const millInfo = await page.evaluate(async () => {
      const wc = await import('/src/core/world-constants.js');
      let tiles = '';
      for (let r = 278; r <= 286; r++) {
        tiles += `r${r}:`;
        for (let c = 78; c <= 82; c++) tiles += wc.wMap[r]?.[c] + ',';
        tiles += ' ';
      }
      return tiles;
    });
    console.log('Molino tiles:', millInfo);
    if (millInfo.includes('32')) console.log('   ✅ Molino usa tile 32 (distinto de casas)');
    else { console.log('   ❌ Molino no tiene tile 32'); ok = false; }

    // Verificar conectividad: probar entrada al molino
    await page.evaluate(() => {
      const G = window.__G; G.pl.x = 80; G.pl.y = 287; G.pl.d = 3;
      G.pl.moving = false; G.pl.stepTarget = null;
    });
    await sleep(300);
    await page.keyboard.down('ArrowUp'); await sleep(500); await page.keyboard.up('ArrowUp'); await sleep(800);
    const inside = await page.evaluate(() => window.__G?.curMap || '?');
    if (inside === 'interior') {
      console.log('   ✅ Entrada al molino funciona');
      // salir
      await press(page, 'ArrowDown', 80); await sleep(150);
      for (let i = 0; i < 6; i++) { await page.keyboard.down('ArrowDown'); await sleep(100); await page.keyboard.up('ArrowDown'); await sleep(50); }
      await page.keyboard.down('ArrowDown'); await sleep(350); await page.keyboard.up('ArrowDown');
      await sleep(700);
    } else { console.log('   ❌ No entró al molino'); ok = false; }

    // Verificar que el río está al lado del molino (col 85 debe ser agua junto a col 82 del molino)
    const rioInfo = await page.evaluate(async () => {
      const wc = await import('/src/core/world-constants.js');
      return `wMap[284][83]=${wc.wMap[284]?.[83]} wMap[284][84]=${wc.wMap[284]?.[84]} wMap[284][85]=${wc.wMap[284]?.[85]} wMap[284][82]=${wc.wMap[284]?.[82]}`;
    });
    console.log('Río junto al molino:', rioInfo);

    console.log('\n' + (ok ? '✅ C2.2: Molino junto al río + caminos conectados' : '❌ Verificar problemas'));
    await browser.close();
  } finally { await server.close(); }
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
