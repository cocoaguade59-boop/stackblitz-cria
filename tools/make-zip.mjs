#!/usr/bin/env node
/**
 * Arma dist-app/CriaturasDelReino.zip: la carpeta que se le manda a alguien
 * que solo quiere jugar. Contiene el HTML compilado y los lanzadores, con la
 * MISMA estructura de rutas que el repo (dist-app/index.html), para que los
 * lanzadores funcionen sin cambios.
 */
import { mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const OUT = 'dist-app/CriaturasDelReino.zip';
const TMP = 'dist-app/.zip-tmp';
const RAIZ = join(TMP, 'Criaturas del Reino');

if (!existsSync('dist-app/index.html')) {
  console.error('Falta dist-app/index.html. Corré: npm run build:app');
  process.exit(1);
}

rmSync(TMP, { recursive: true, force: true });
mkdirSync(join(RAIZ, 'dist-app'), { recursive: true });

cpSync('dist-app/index.html', join(RAIZ, 'dist-app', 'index.html'));
for (const dir of ['1-WINDOWS', '2-MAC', '3-LINUX']) {
  if (existsSync(dir)) cpSync(dir, join(RAIZ, dir), { recursive: true });
}

writeFileSync(join(RAIZ, 'LEEME.txt'), `CRIATURAS DEL REINO
===================

WINDOWS
  Doble clic en:  JUGAR-AQUI-WINDOWS.bat

  Si no aparece, abri esta ruta a mano (doble clic):
      dist-app\\index.html

  El juego esta ENTERO dentro de ese archivo: codigo, graficos y fuente.
  No necesita internet, ni instalar nada, ni StackBlitz.


SI VES UN RECUADRO NEGRO QUE NO SE MUEVE
  Era un bug de la version anterior (el juego se moria al arrancar), ya
  corregido. Asegurate de estar abriendo ESTE archivo y no uno viejo.
  Si igual pasa: F12 -> pestaña "Console" -> mandame el texto en rojo.


SI WINDOWS DICE "Windows protegio tu PC"
  Es porque el .bat no tiene firma digital, no porque tenga virus.
  "Mas informacion" -> "Ejecutar de todas formas".


MAC
  Doble clic en 2-MAC/Jugar-en-Mac.command
  (la 1ra vez: clic derecho -> Abrir)

LINUX
  ./3-LINUX/jugar-en-Linux.sh


¿QUERES CAMBIAR EL JUEGO?
  dist-app/index.html es la version COMPILADA: editarlo no sirve.
  Para tocar el codigo necesitas el repositorio y Node.js.
  Ver COMO-JUGAR.md.
`);

// acceso directo en la raíz del zip, como en el repo
cpSync('JUGAR-AQUI-WINDOWS.bat', join(RAIZ, 'JUGAR-AQUI-WINDOWS.bat'));

rmSync(OUT, { force: true });
execFileSync('zip', ['-qr', OUT.replace('dist-app/', ''), 'Criaturas del Reino'], {
  cwd: TMP,
  stdio: 'inherit',
});
// el zip quedó en TMP; lo movemos al lugar definitivo
execFileSync('mv', [join(TMP, OUT.replace('dist-app/', '')), OUT]);
rmSync(TMP, { recursive: true, force: true });

const kb = (readFileSync(OUT).length / 1024).toFixed(1);
console.log(`✓ ${OUT} (${kb} KB)`);
