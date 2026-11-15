import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });

await page.goto('http://localhost:4173', { waitUntil: 'load', timeout: 10000 });
await page.waitForTimeout(3000);

const gExists = await page.evaluate(() => typeof window.G);
const scr = await page.evaluate(() => window.G?.scr);
console.log(`G exists: ${gExists}, scr: ${scr}`);

// Check for errors
if (errs.length) {
  console.log('ERRORS:', errs.slice(0, 10));
} else {
  console.log('No errors');
}

await page.screenshot({ path: 'test-screenshots/dist-title.png' });
console.log('Screenshot saved');

await browser.close();
