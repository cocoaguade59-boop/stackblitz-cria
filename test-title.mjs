import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });

// SIN save
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForTimeout(3500);

console.log(`Frame count after 3.5s, scr=${await page.evaluate(()=>window.G?.scr)}`);
console.log(`hasSave=${await page.evaluate(()=>window.G?.hasSave)}`);
console.log(`tFr=${await page.evaluate(()=>window.G?.tFr)}`);

await page.screenshot({ path: 'test-screenshots/title-debug.png' });
console.log('Screenshot saved');

// Try pressing SPACE
await page.keyboard.press('Space');
await page.waitForTimeout(1000);
console.log(`After SPACE scr=${await page.evaluate(()=>window.G?.scr)}`);

await page.screenshot({ path: 'test-screenshots/title-after-space.png' });

if (errs.length) { console.log('ERRORS:', errs.slice(0,10)); process.exit(1); }
console.log('OK - zero errors');
await browser.close();
