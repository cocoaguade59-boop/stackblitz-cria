import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const all = [];
page.on('console', m => all.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => all.push(`[PAGE ERROR] ${e.message}`));

await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 10000 });
await page.waitForTimeout(2000);

const errors = all.filter(l => l.includes('[error]') || l.includes('[PAGE ERROR]'));
const warns = all.filter(l => l.includes('[warning]'));

console.log('=== ALL CONSOLE OUTPUT ===');
all.slice(0, 30).forEach(l => console.log(l));

if (errors.length) {
  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(e));
} else if (warns.length) {
  console.log('\n=== WARNINGS ===');
  warns.forEach(w => console.log(w));
}

console.log(`\nG exists: ${await page.evaluate(() => typeof window.G)}`);
console.log(`scr: ${await page.evaluate(() => window.G?.scr)}`);

await browser.close();
