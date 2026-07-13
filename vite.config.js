import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
