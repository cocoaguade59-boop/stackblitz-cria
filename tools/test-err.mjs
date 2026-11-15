import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Catch ALL errors
await page.addInitScript(() => {
  window._errors = [];
  window.addEventListener('error', e => window._errors.push(e.message));
  window.onerror = (msg) => window._errors.push(msg?.message || msg);
});

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForTimeout(4000);

const errs = await page.evaluate(() => window._errors);
console.log('Errors:', errs.length ? errs : 'NONE');

// Check if canvas has content
const canvasData = await page.evaluate(() => {
  const c = document.getElementById('c');
  return c ? `${c.width}x${c.height}` : 'NO CANVAS';
});
console.log('Canvas:', canvasData);

// Take screenshot
await page.screenshot({ path: 'test-screenshots/err-check.png' });
console.log('Screenshot saved');

await browser.close();
