import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
await page.waitForTimeout(3500);

// Check game state via the canvas and any globals  
const state = await page.evaluate(() => {
  // Try to find the game loop state by checking canvas content
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  // Sample pixels from different regions of the canvas
  const titleArea = ctx.getImageData(320, 400, 1, 1).data; // where menu text should be
  const skyArea = ctx.getImageData(320, 100, 1, 1).data;  // sky area
  
  return {
    titleAreaRGBA: Array.from(titleArea),
    skyAreaRGBA: Array.from(skyArea),
    canvasHTML: document.body.innerHTML.substring(0, 200),
    scriptsCount: document.scripts.length,
  };
});

console.log('State:', JSON.stringify(state, null, 2));

// Try to find any global references
const hasInit = await page.evaluate(() => typeof init);
const hasLoop = await page.evaluate(() => typeof loop);
console.log('init:', hasInit, 'loop:', hasLoop);
await browser.close();
