import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

// Los PNG del juego se cargan en RUNTIME con `new Image().src = 'assets/...'`,
// así que Vite no los ve y no los inlinea: el archivo abierto con doble clic
// no los encuentra y se pierden el sprite de hydrapom, los retratos de los NPC
// y el fondo de batalla del bosque.
//
// Este plugin los mete en el bundle como data: URIs, sin tocar el código:
// intercepta el `new Image()` + `.src` y, si el archivo existe en assets/,
// lo sustituye por su base64 ANTES de intentar la red. Los 6 PNG son ~2 MB,
// que en base64 quedan ~2,7 MB — aceptable para un archivo que se abre solo.
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif' };
const PALABRA = '__INLINE_ASSETS__';

function inlineAssetImages() {
  return {
    name: 'inline-asset-images',
    apply: 'build',
    // Los assets entran al HTML como texto. Hay que hacerlo en
    // generateBundle para que el chunk ya esté armado.
    generateBundle(_options, bundle) {
      const mapa = {};
      for (const name of ['hydrapom', 'npcs/alejandro', 'npcs/alessandro',
                          'trainers/alejandro', 'trainers/alessandro']) {
        const ruta = `assets/sprites/${name}.png`;
        const buf = readFileSync(ruta);
        mapa[`assets/sprites/${name}.png`] = `data:${MIME[extname(ruta)] || 'image/png'};base64,${buf.toString('base64')}`;
      }
      const fondo = 'assets/battle/forest-encounter.png';
      const buf = readFileSync(fondo);
      mapa[fondo] = `data:${MIME[extname(fondo)]};base64,${buf.toString('base64')}`;

      for (const file of Object.values(bundle)) {
        if (file.type !== 'chunk') continue;
        // el código arranca con la variable; el valor se inyecta abajo
        file.code = `var ${PALABRA}=${JSON.stringify(mapa)};\n` + file.code;
      }
    },
  };
}

// Dos builds distintos conviven acá:
//
//   npm run build      → dist/ multi-archivo, para servidor (GitHub Pages,
//                        Netlify, cualquier hosting).
//   npm run build:app  → dist-app/index.html, UN SOLO ARCHIVO de ~480 kB que
//                        funciona con doble clic desde el escritorio, sin
//                        servidor y sin internet (la fuente va embebida).
//
// `viteSingleFile` inlinea el JS y el CSS en el HTML.
// `format: 'iife'` evita dejar `type="module"`, que es justo lo que hace
// fallar los módulos ES bajo el protocolo file:// (CORS). Sin esa opción el
// archivo abre en un servidor pero no con doble clic.
export default defineConfig(({ mode }) => {
  const single = mode === 'app';

  return {
    base: './',
    server: {
      host: '0.0.0.0',
      port: 5173,
      // El preview corre bajo un host proxeado (*.e2b.app) que cambia por
      // sesión. Sin esto, Vite responde 403 "Blocked request".
      allowedHosts: true,
    },
    plugins: single ? [inlineAssetImages(), viteSingleFile()] : [],
    build: {
      outDir: single ? 'dist-app' : 'dist',
      target: single ? 'es2018' : 'modules',
      // Lo único que se necesita para el juego en un archivo.
      assetsInlineLimit: single ? 100_000_000 : 4096,
      cssCodeSplit: !single,
      rollupOptions: single
        ? {
            output: {
              // iife = script clásico, sin import/export. Clave para file://.
              format: 'iife',
              inlineDynamicImports: true,
            },
          }
        : {},
    },
  };
});
