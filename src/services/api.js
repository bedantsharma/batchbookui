import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

/**
 * Shared axios instance for all BatchBook API calls.
 *
 * - Base URL reads from VITE_API_BASE_URL (defaults to localhost:8000 for dev).
 * - A request interceptor automatically attaches the current Supabase JWT
 *   so every authenticated endpoint receives a valid Authorization header.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT to every outgoing request
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
