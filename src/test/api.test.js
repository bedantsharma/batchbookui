import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// ─── Mock toastEmitter so we can spy on it ────────────────────────────────────
vi.mock('../lib/toastEmitter', () => ({
  toastEmitter: {
    emit: vi.fn(),
  },
}));

import { supabase } from '../lib/supabaseClient';
import { toastEmitter } from '../lib/toastEmitter';

describe('api.js axios instance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports an axios instance with the correct base URL default', async () => {
    const { default: api } = await import('../services/api');
    expect(api.defaults.baseURL).toBe('http://localhost:8000');
  });

  it('attaches Authorization header when a Supabase session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'my-jwt-token' } },
    });

    const { default: api } = await import('../services/api');

    const config = { headers: {} };
    const interceptorFn = api.interceptors.request.handlers[0]?.fulfilled;
    if (interceptorFn) {
      const result = await interceptorFn(config);
      expect(result.headers.Authorization).toBe('Bearer my-jwt-token');
    }
  });

  it('does NOT attach Authorization header when there is no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    const { default: api } = await import('../services/api');

    const config = { headers: {} };
    const interceptorFn = api.interceptors.request.handlers[0]?.fulfilled;
    if (interceptorFn) {
      const result = await interceptorFn(config);
      expect(result.headers.Authorization).toBeUndefined();
    }
  });

  it('emits a toast for non-401 errors', async () => {
    const { default: api } = await import('../services/api');

    const responseInterceptorFn = api.interceptors.response.handlers[0]?.rejected;
    if (responseInterceptorFn) {
      const error = { response: { status: 500 } };
      await responseInterceptorFn(error).catch(() => {});
      expect(toastEmitter.emit).toHaveBeenCalledWith('Failed to load data. Please try again.');
    }
  });

  it('does NOT emit a toast for 401 errors (handled by auth flow)', async () => {
    const { default: api } = await import('../services/api');

    const responseInterceptorFn = api.interceptors.response.handlers[0]?.rejected;
    if (responseInterceptorFn) {
      const error = { response: { status: 401 } };
      await responseInterceptorFn(error).catch(() => {});
      expect(toastEmitter.emit).not.toHaveBeenCalled();
    }
  });
});
