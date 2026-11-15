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

const FILE = 'dist-app/index.html';
if (!existsSync(FILE)) {
  console.error(`No existe ${FILE}. Corré primero: vite build --mode app`);
  process.exit(1);
}

let html = readFileSync(FILE, 'utf8');
const before = html.length;

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
  return doc.replace(/[ \t]*<\/body>/, `${bloque}\n  </body>`);
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

// 6) verificación: el <canvas> tiene que existir antes de que corra el script
const posCanvas = html.indexOf('<canvas');
const posScript = html.indexOf('<script>');
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

writeFileSync(FILE, html, 'utf8');

const kb = (html.length / 1024).toFixed(0);
console.log(`✓ ${FILE} listo para doble clic (${kb} KB)`);
console.log(`  scripts clásicos: ${scripts.length}`);
console.log(`  type="module" restantes: ${(html.match(/type="module"/g) || []).length}`);
console.log(`  rutas absolutas: 0`);
