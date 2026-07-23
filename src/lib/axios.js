import axios from 'axios';

// ┌──────────────────────────────────────────────────────────────────┐
// │  WHERE THE BACKEND URL COMES FROM                                  │
// │  Set it in  client/.env  →  VITE_API_URL                           │
// │  (falls back to http://localhost:4000 for local development).      │
// │  This is the single source of truth — every request goes here.     │
// └──────────────────────────────────────────────────────────────────┘
const API_BASE = (import.meta.env.VITE_API_URL || 'https://ascension-mini-back-production.up.railway.app').replace(/\/+$/, '');

/** Full API root, e.g. https://your-backend/api */
export const API_URL = `${API_BASE}/api`;

export const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
