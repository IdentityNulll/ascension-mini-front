import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend during development.
      // changeOrigin rewrites the Host header, required when proxying to a
      // remote https host (e.g. Railway). Point target at http://localhost:4000
      // to use a locally running server instead.
      '/api': {
        target: 'https://ascension-mini-back-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
