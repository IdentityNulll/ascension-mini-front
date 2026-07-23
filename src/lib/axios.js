import axios from 'axios';

// In development we use Vite's `/api` proxy (see vite.config.js).
// In a production build there is no proxy, so point at the deployed backend
// via VITE_API_URL (e.g. https://ascension-mini-back-production.up.railway.app).
const apiRoot = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const http = axios.create({
  baseURL: apiRoot,
  headers: { 'Content-Type': 'application/json' },
});
