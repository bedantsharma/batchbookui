import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { toastEmitter } from '../lib/toastEmitter';

/**
 * Shared axios instance for all BatchBook API calls.
 *
 * - Base URL reads from VITE_API_BASE_URL (defaults to localhost:8000 for dev).
 * - Request interceptor auto-attaches the Supabase JWT.
 * - Response interceptor shows a global error toast for non-401 failures.
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

// Show a global error toast for any non-401 failure
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      toastEmitter.emit('Failed to load data. Please try again.');
    }
    return Promise.reject(error);
  },
);

export default api;
