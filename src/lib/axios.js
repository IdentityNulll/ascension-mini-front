import axios from 'axios';

// ┌──────────────────────────────────────────────────────────────────┐
// │  WHERE THE BACKEND URL COMES FROM                                  │
// │  Set it in  client/.env  →  VITE_API_URL                           │
// │  (falls back to http://localhost:4000 for local development).      │
// │  This is the single source of truth — every request goes here.     │
// └──────────────────────────────────────────────────────────────────┘
// Accept VITE_API_URL with or without a trailing slash OR an existing /api
// suffix, so we can never accidentally produce `/api/api`.
const RAW = (import.meta.env.VITE_API_URL || 'https://ascension-mini-back-production.up.railway.app').trim();
const ORIGIN = RAW.replace(/\/+$/, '').replace(/\/api\/?$/i, '');

/** Full API root, e.g. https://your-backend/api */
export const API_URL = `${ORIGIN}/api`;

export const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
