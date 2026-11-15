#!/usr/bin/env node
/**
 * Convierte dist-app/index.html (generado por vite --mode app) en un archivo
 * que funciona con DOBLE CLIC bajo el protocolo file://.
 *
 * Por qué hace falta:
 *   Vite emite <script type="module">. Los módulos ES no cargan desde file://
 *   (el navegador los bloquea por CORS), así que el archivo abre en blanco.
 *   El bundle ya está en formato iife (sin import/export), así que basta con
 *   quitar los atributos type="module" y crossorigin del script inline.
 *
 * También verifica que no hayan quedado rutas absolutas, que romperían
 * cualquier apertura local.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const FILE = 'dist-app/index.html';
if (!existsSync(FILE)) {
  console.error(`No existe ${FILE}. Corré primero: vite build --mode app`);
  process.exit(1);
}

let html = readFileSync(FILE, 'utf8');
const before = html.length;

// Idempotencia: si ya fue procesado, no volver a mover nada.
// Después de la primera pasada el bundle contiene "</body>" dentro de strings
// SVG, así que reemplazar por /<\/body>/ otra vez lo rompería.
if (html.includes('<script data-juego')) {
  console.log(`✓ ${FILE} ya estaba listo (nada que hacer)`);
  process.exit(0);
}

/**
 * Saca los <script> del <head> y los reinserta justo antes de </body>,
 * después del <canvas>. Devuelve el HTML con el orden corregido.
 */
function moverScriptAlFinal(doc) {
  const scripts = [];
  doc = doc.replace(/[ \t]*<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>[ \t]*\r?\n?/g, (full, code) => {
    scripts.push(code);
    return '';
  });
  if (!scripts.length) return doc;
  const bloque = scripts.map((c) => `    <script>${c}</script>`).join('\n');
  // Función de reemplazo, NO cadena: el bundle contiene expresiones como
  // `!$` y `$&` dentro de strings SVG. Con una cadena, String.replace las
  // expande ($& = texto encontrado) y mete "</body>" DENTRO del JavaScript.
  // Se ancla al ÚLTIMO </body> (el real, el del documento). El bundle ya
  // puede contener la cadena "</body>" dentro de un string SVG.
  const pos = doc.lastIndexOf('</body>');
  if (pos === -1) return doc;
  const antes = doc.slice(0, pos).replace(/[ \t]*$/, '');
  return `${antes}${bloque}\n  </body>` + doc.slice(pos + '</body>'.length);
}

// 1) script inline → script clásico
html = html.replace(/<script type="module" crossorigin>/g, '<script>');
html = html.replace(/<script type="module">/g, '<script>');
html = html.replace(/ crossorigin(?=[\s>])/g, '');

// 2) EL SCRIPT TIENE QUE IR AL FINAL DEL BODY.
//    Vite lo deja en el <head>. Un script clásico (sin type="module") NO es
//    diferido: se ejecuta en el instante en que el navegador lo lee. Si está
//    en el <head>, el <canvas id="c"> todavía no existe, y src/core/canvas.js
//    revienta con "Cannot read properties of null (reading 'getContext')".
//    Resultado: recuadro negro que nunca dibuja nada. Con type="module" no
//    pasaba porque los módulos sí son diferidos; al volverlo clásico para
//    file:// heredamos el problema.
html = moverScriptAlFinal(html);

// 3) atributos modulepreload no sirven en file:// (y ya no hay nada que precargar)
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');

// 4) verificación: nada de rutas absolutas
const absolutas = [...html.matchAll(/(?:src|href)="\/(?!\/)[^"]*"/g)].map((m) => m[0]);
if (absolutas.length) {
  console.error('ERROR: quedaron rutas absolutas (rompen file://):');
  absolutas.forEach((a) => console.error('  ' + a));
  process.exit(1);
}

// 5) verificación: el script no debe tener import/export de ESM
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const esm = scripts.filter((s) => /(^|\s)(import|export)\s*[\{\(\*"']/.test(s.slice(0, 2000)));
if (esm.length) {
  console.error('ERROR: el bundle inline todavía usa sintaxis ESM.');
  process.exit(1);
}

// 6) red de seguridad visible: si algo revienta al arrancar, que se VEA.
//    Un canvas negro no dice nada. Un mensaje en pantalla con el error y qué
//    hacer convierte "no anda" en un reporte útil.
//    Va ANTES que el script del juego para poder capturar su excepción.
const AVISO = readFileSync(new URL('./error-overlay.html', import.meta.url), 'utf8').trim();

// La red de seguridad tiene que ejecutarse ANTES que el juego: si el juego
// lanza al correr, el listener 'error' ya tiene que estar registrado.
// Se inserta justo antes del <script> del juego (que ya está antes de </body>).
// El overlay NO usa el canvas, así que puede ir antes. Se marca para que la
// verificación de orden de abajo no lo confunda con el script del juego.
// OJO con el orden: primero se marca el <script> del juego, DESPUÉS se
// inserta el overlay. Al revés, el overlay queda como PRIMER <script> y la
// siguiente pasada del regex le come la primera letra al bundle ("var" → "ar").
html = html.replace(/[ \t]*<script>/, '<script data-juego>');
// Se usa una FUNCIÓN de reemplazo, no una cadena.
// String.replace interpreta $ en el reemplazo: $& = el texto encontrado,
// $' = todo lo que sigue. El bundle tiene expresiones como !$|| (negación de
// la variable $), y con una cadena el HTML terminaba metido DENTRO del código:
//     !    </body>&_&&(t.fillStyle=...
// Usar una función desactiva ese parseo.
html = html.replace(/<script data-juego>/, () => AVISO.trim() + '\n    <script data-juego>');

// 7) verificación: el <canvas> tiene que existir antes de que corra el script
const posCanvas = html.indexOf('<canvas');
const posScript = html.indexOf('<script data-juego>');
if (posCanvas === -1) {
  console.error('ERROR: no hay <canvas> en el HTML generado.');
  process.exit(1);
}
if (posScript !== -1 && posScript < posCanvas) {
  console.error('ERROR: el <script> quedó antes del <canvas>.');
  console.error('  Un script clásico no es diferido: corre antes de que exista');
  console.error('  el canvas y el juego muere con "reading \'getContext\'".');
  process.exit(1);
}

// 8) verificación: el bundle tiene que ser JavaScript VÁLIDO.
//    Un `String.replace` con cadena de reemplazo expande $& y $' — el bundle
//    tiene expresiones como !$ y strings SVG con "</body>", así que un
//    reemplazo mal escrito mete HTML dentro del código y el juego no arranca
//    con "Unexpected token '<'". Compilarlo acá lo detecta antes de entregar.
try {
  const tag = '<script data-juego>';
  const inicio = html.indexOf(tag) + tag.length;
  new vm.Script(html.slice(inicio, html.lastIndexOf('</script>')));
  console.log('  bundle compila: OK');
} catch (e) {
  console.error('ERROR: el bundle generado no es JavaScript válido: ' + e.message);
  console.error('  Casi siempre es un String.replace con $& o $\' en el reemplazo.');
  process.exit(1);
}

writeFileSync(FILE, html, 'utf8');

const kb = (html.length / 1024).toFixed(0);
console.log(`✓ ${FILE} listo para doble clic (${kb} KB)`);
console.log(`  scripts clásicos: ${scripts.length}`);
console.log(`  type="module" restantes: ${(html.match(/type="module"/g) || []).length}`);
console.log(`  rutas absolutas: 0`);
