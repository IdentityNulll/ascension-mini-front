import axios from 'axios';

// All requests go through Vite's /api proxy to the Express server.
export const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});
