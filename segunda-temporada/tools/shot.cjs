const { chromium } = require('playwright');
(async()=>{
const [,, file, hash, out] = process.argv;
const b = await chromium.launch(); const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type()==='error') console.log('CONSOLE', m.text()); });
await p.goto('file://' + process.cwd() + '/' + file + (hash ? '#' + hash : ''));
await p.waitForFunction(() => document.title === 'ok', null, { timeout: 15000 }).catch(e => console.log('timeout'));
await p.locator('#sheet').screenshot({ path: out });
await b.close();
})();
