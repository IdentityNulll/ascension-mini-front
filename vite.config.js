import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend URL is NOT configured here anymore.
// It lives in one place: client/.env → VITE_API_URL (read by src/lib/axios.js).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
