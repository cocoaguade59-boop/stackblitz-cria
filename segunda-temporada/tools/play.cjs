// Prueba automática: arranca el juego y ejecuta un guion de acciones.
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || '.';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 600, height: 820 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message + '\n' + e.stack));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.waitForTimeout(1200);
  const shot = async (n) => p.screenshot({ path: out + '/' + n + '.png' });
  const key = async (k, n = 1, d = 60) => { for (let i = 0; i < n; i++) { await p.keyboard.down(k); await p.waitForTimeout(40); await p.keyboard.up(k); await p.waitForTimeout(d); } };
  global.P = p; global.key = key; global.shot = shot;
  const script = require(require('path').resolve(process.argv[3] || 'tools/flow-basic.cjs'));
  try { await script(p, key, shot); } catch (e) { errs.push('SCRIPT ' + e.stack); }
  console.log(errs.join('\n') || 'SIN ERRORES');
  await b.close();
})();
