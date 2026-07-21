// C1.5b-1: test completo entrada + salida de interiores
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
  const server = await createServer({ root: __dirname, server: { port: 5208 } });
  await server.listen();
  let ok = false;
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    const msgs = [];
    page.on('console', m => msgs.push(m.text()));

    await page.goto('http://localhost:5208', { waitUntil: 'domcontentloaded' });
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

    let st = await page.evaluate(() => {
      const G = window.__G; return G ? `scr=${G.scr} curMap=${G.curMap}` : '?';
    });
    if (st.includes('starter')) { await press(page, ' '); await sleep(1200); }

    // Teleport a puerta building pitch_home_1: door at (50,281)
    await page.evaluate(() => {
      const G = window.__G; if (!G) return;
      G.pl.x = 50; G.pl.y = 281; G.pl.d = 3;
      G.pl.moving = false; G.pl.stepTarget = null;
    });
    await sleep(400);

    // ─── ENTRADA ───
    msgs.length = 0;
    await page.keyboard.down('ArrowUp');
    await sleep(500);
    await page.keyboard.up('ArrowUp');
    await sleep(800);

    const inside = await page.evaluate(() => window.__G?.curMap || '?');
    const errs = msgs.filter(m => m.includes('ERROR'));
    if (inside !== 'interior') {
      console.log('❌ No entró. curMap:', inside, '| Errores:', errs.join('; '));
    } else {
      console.log('✅ Entrada OK');

      // ─── SALIDA ───
      // El spawn interior es (cols/2, rows-2) mirando arriba. 
      // La puerta está en (cols/2, rows-1). Bajar 1-3 tiles.
      await press(page, 'ArrowDown', 80); // girar abajo
      await sleep(200);
      for (let i = 0; i < 4; i++) {
        await page.keyboard.down('ArrowDown');
        await sleep(120);
        await page.keyboard.up('ArrowDown');
        await sleep(50);
      }
      await sleep(200);
      // Intentar salir (kh('ArrowDown') en tile 42)
      await page.keyboard.down('ArrowDown');
      await sleep(400);
      await page.keyboard.up('ArrowDown');
      await sleep(800);

      const outside = await page.evaluate(() => window.__G?.curMap || '?');
      if (outside === 'world') {
        console.log('✅ Salida OK');
        ok = true;
      } else {
        console.log('❌ No salió. curMap:', outside);
      }
    }

    console.log('\n' + (ok ? '✅ C1.5b-1: Entrada y salida FUNCIONAN' : '❌ FALLÓ'));
    await browser.close();
  } finally { await server.close(); }
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
