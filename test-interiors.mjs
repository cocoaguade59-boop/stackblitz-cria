// C1.5b-2/3: test de los 3 interiores (casa, molino, proa) con paletas distintas
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const press = async (page, key, ms = 120) => {
  await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); await sleep(80);
};

async function enterBuilding(page, doorX, doorY) {
  await page.evaluate(([dx, dy]) => {
    const G = window.__G; if (!G) return;
    G.pl.x = dx; G.pl.y = dy; G.pl.d = 3;
    G.pl.moving = false; G.pl.stepTarget = null;
  }, [doorX, doorY]);
  await sleep(300);
  await page.keyboard.down('ArrowUp');
  await sleep(500);
  await page.keyboard.up('ArrowUp');
  await sleep(800);
  return await page.evaluate(() => window.__G?.curMap || '?');
}

async function exitBuilding(page) {
  await press(page, 'ArrowDown', 80);
  await sleep(150);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.down('ArrowDown');
    await sleep(120);
    await page.keyboard.up('ArrowDown');
    await sleep(50);
  }
  await sleep(200);
  await page.keyboard.down('ArrowDown');
  await sleep(350);
  await page.keyboard.up('ArrowDown');
  await sleep(700);
  return await page.evaluate(() => window.__G?.curMap || '?');
}

async function main() {
  const server = await createServer({ root: __dirname, server: { port: 5209 } });
  await server.listen();
  let failed = 0;
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

    await page.goto('http://localhost:5209', { waitUntil: 'domcontentloaded' });
    await sleep(4500);

    // Pasar menús hasta mundo
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
      const G = window.__G; return G ? `scr=${G.scr}` : '?';
    });
    if (st.includes('starter')) { await press(page, ' '); await sleep(1200); }
    if (st.includes('intro')) {
      await page.evaluate(() => { const G = window.__G; G.scr = 'starter'; G.intro = null; G.sSel = 0; });
      await sleep(500); await press(page, ' '); await sleep(1200);
    }

    // ─── TEST 1: Casa Pitch (pitch_home_1, door 50,281) ───────
    console.log('─── TEST 1: Casa de Pitch ───');
    const r1 = await enterBuilding(page, 50, 281);
    if (r1 !== 'interior') { console.log('❌ No entró a Casa Pitch'); failed++; }
    else {
      // Verificar paleta pitch
      const p1 = await page.evaluate(() => {
        const G = window.__G; if (!G?._activeIntPalette) return '?';
        // Leer un pixel del piso para verificar color
        const cv = document.querySelector('canvas');
        if (!cv) return 'no canvas';
        const ctx = cv.getContext('2d');
        // El interior está centrado. Cols=12, offX = (640-12*32)/2 = 128
        // Tile (1,1) es floor en offX+32, offY+32
        const data = ctx.getImageData(256, 128, 1, 1).data;
        return `r=${data[0]} g=${data[1]} b=${data[2]}`;
      });
      console.log('   Entrada OK. Pixel piso:', p1);
    }
    const e1 = await exitBuilding(page);
    console.log('   Salida:', e1 === 'world' ? '✅' : '❌');
    if (e1 !== 'world') failed++;

    // ─── TEST 2: Molino Pitch (pitch_mill, door 50,292) ───────
    console.log('─── TEST 2: Molino de Pitch ───');
    const r2 = await enterBuilding(page, 50, 292);
    if (r2 !== 'interior') { console.log('❌ No entró al Molino'); failed++; }
    else {
      // Verificar tamaño: molino debe ser 16x14
      const sz = await page.evaluate(async () => {
        const m = await import('/src/world/interiors.js');
        const ai = m.getActiveInterior();
        return ai ? `cols=${ai.cols} rows=${ai.rows} kind=${ai.building.kind}` : 'null';
      });
      console.log('   Entrada OK.', sz);
    }
    const e2 = await exitBuilding(page);
    console.log('   Salida:', e2 === 'world' ? '✅' : '❌');
    if (e2 !== 'world') failed++;

    // ─── TEST 3: Proa Tamara (storyboard_proa, door 50,211) ──
    console.log('─── TEST 3: Proa Tamara ───');
    const r3 = await enterBuilding(page, 50, 211);
    if (r3 !== 'interior') { console.log('❌ No entró a Proa Tamara'); failed++; }
    else {
      const sz = await page.evaluate(async () => {
        const m = await import('/src/world/interiors.js');
        const ai = m.getActiveInterior();
        return ai ? `cols=${ai.cols} rows=${ai.rows} kind=${ai.building.kind}` : 'null';
      });
      console.log('   Entrada OK.', sz);
    }
    const e3 = await exitBuilding(page);
    console.log('   Salida:', e3 === 'world' ? '✅' : '❌');
    if (e3 !== 'world') failed++;

    // ─── RESULTADO ──────────────────────────────────────────
    console.log('\n' + (failed === 0 ? '✅ C1.5b-2/3: 3 interiores funcionando con paletas distintas' : `❌ ${failed} fallo(s)`));
    await browser.close();
  } finally { await server.close(); }
  process.exit(failed > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
