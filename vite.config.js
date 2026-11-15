import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    // El preview corre bajo un host proxeado (*.e2b.app) que cambia por sesión.
    // Sin esto, Vite responde 403 "Blocked request" y el juego no carga.
    allowedHosts: true,
  },
});
