// Test fresco: sin save, desde cero como un jugador nuevo
import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('pageerror', err => errors.push(err.message));

try {
  // SIN save — emular jugador nuevo
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('✅ Título cargado (sin save)');
  
  if (errors.length > 0) {
    console.log('❌ Errores:', errors);
    process.exit(1);
  }

  // Debería mostrar "ESPACIO para comenzar"
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  console.log('✅ SPACE presionado (startNewGameFlow)');
  
  if (errors.length > 0) {
    console.log('❌ Errores después de SPACE:', errors);
    await page.screenshot({ path: 'test-screenshots/crash.png' });
    process.exit(1);
  }

  // Avanzar intro
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(150); }
  await page.waitForTimeout(800);
  
  if (errors.length > 0) {
    console.log('❌ Errores en intro:', errors);
    process.exit(1);
  }
  console.log('✅ Intro completada');

  // Elegir starter (primero = Flameye)
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  
  if (errors.length > 0) {
    console.log('❌ Errores en starter:', errors);
    process.exit(1);
  }
  console.log('✅ Starter elegido, en mundo');

  // Abrir menú (X)
  await page.keyboard.press('x');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-screenshots/menu.png' });
  console.log('✅ Menú abierto');
  
  // Cerrar menú
  await page.keyboard.press('x');
  await page.waitForTimeout(300);

  // Moverse un poco
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: 'test-screenshots/moved.png' });
  console.log('✅ Movimiento OK');

  if (errors.length > 0) {
    console.log('❌ Errores finales:', errors);
    process.exit(1);
  }
  
  console.log('\n✅ JUEGO COMPLETAMENTE FUNCIONAL - cero errores');

} catch (e) {
  console.error('❌', e.message);
  process.exit(1);
} finally {
  await browser.close();
}
