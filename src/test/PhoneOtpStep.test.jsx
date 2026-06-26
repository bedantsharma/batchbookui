import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhoneOtpStep from '../components/onboarding/PhoneOtpStep';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      setSession: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('PhoneOtpStep — name in verify_otp body', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('includes name in verify_otp request body when name prop is provided', async () => {
    // 1st call: generate_otp (auto-sent for pre-filled phone)
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // 2nd call: verify_otp
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ auth_token: 'tok', refresh_token: 'ref', children: [] }),
    });

    const onSuccess = vi.fn();
    render(
      <PhoneOtpStep phone="9876543210" name="Priya Devi" label="Parent's phone" onSuccess={onSuccess} />
    );

    // Auto-OTP is sent for pre-filled phone; wait for OTP entry step
    await waitFor(() => expect(screen.getByLabelText(/6-digit otp/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/6-digit otp/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const verifyCall = global.fetch.mock.calls[1];
      const body = JSON.parse(verifyCall[1].body);
      expect(body).toMatchObject({ phone: '9876543210', token: '123456', name: 'Priya Devi' });
    });
  });

  it('omits name from verify_otp body when name prop is absent', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ auth_token: 'tok', refresh_token: 'ref', children: [] }),
    });

    const onSuccess = vi.fn();
    render(<PhoneOtpStep phone="9876543210" label="Parent's phone" onSuccess={onSuccess} />);

    await waitFor(() => expect(screen.getByLabelText(/6-digit otp/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/6-digit otp/i), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      const verifyCall = global.fetch.mock.calls[1];
      const body = JSON.parse(verifyCall[1].body);
      expect(body.name).toBeUndefined();
    });
  });
});
