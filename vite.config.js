import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

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
    plugins: single ? [viteSingleFile()] : [],
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
