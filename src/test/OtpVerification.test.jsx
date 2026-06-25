import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OtpVerification from '../components/OtpVerification';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      setSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// Helper: render with a phone number in router state
function renderOtpPage(phoneNumber = '9876543210') {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/otp-verification', state: { phoneNumber } }]}
    >
      <OtpVerification />
    </MemoryRouter>
  );
}

describe('OtpVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('re-enables OTP inputs after successful resend (timer pre-expired)', async () => {
    vi.useFakeTimers();

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderOtpPage();

    // Advance the 60s countdown to 0 and flush React state updates
    await act(async () => {
      vi.advanceTimersByTime(61000);
    });

    // The Resend OTP button should now be visible
    const resendBtn = screen.getByRole('button', { name: /resend otp/i });
    expect(resendBtn).toBeDefined();

    // Click resend and let the fetch promise resolve and React state flush
    await act(async () => {
      fireEvent.click(resendBtn);
    });

    // All 6 OTP input fields should be enabled (isResending=false after success)
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).not.toBeDisabled();
    });

    // The OTP value must be cleared (all inputs show empty string)
    inputs.forEach(input => {
      expect(input.value).toBe('');
    });

    vi.useRealTimers();
  });
});
