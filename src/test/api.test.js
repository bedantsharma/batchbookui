import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

/**
 * We import `api` AFTER mocking supabase so the interceptor captures
 * the mock version of supabase.auth.getSession.
 */

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

    // Spy on the request interceptor by inspecting what the interceptor does
    // We mock axios.create's request to verify header injection
    const config = { headers: {} };
    // Run the interceptor manually — it's the first request interceptor added
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
});
