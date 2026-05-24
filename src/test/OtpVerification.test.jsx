import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OtpVerification from '../components/OtpVerification';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderOtpVerification({ phoneNumber = '+919876543210' } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/otp-verification', state: { phoneNumber } }]}
    >
      <Routes>
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/phone-login" element={<div data-testid="phone-login">Phone Login</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

/** Helper: fill in all 6 OTP digit inputs */
async function fillOtp(digits) {
  const inputs = screen.getAllByRole('textbox');
  for (let i = 0; i < 6; i++) {
    fireEvent.change(inputs[i], { target: { value: digits[i] } });
  }
}

describe('OtpVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 6 digit inputs and a Verify OTP button', () => {
    renderOtpVerification();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getByRole('button', { name: /verify otp/i })).toBeInTheDocument();
  });

  it('shows the phone number sent from router state', () => {
    renderOtpVerification({ phoneNumber: '+919876543210' });
    expect(screen.getByText('+919876543210')).toBeInTheDocument();
  });

  it('redirects to /phone-login when no phone number is in router state', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/otp-verification', state: {} }]}>
        <Routes>
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/phone-login" element={<div data-testid="phone-login">Phone Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('phone-login')).toBeInTheDocument();
    });
  });

  it('shows validation error when Verify OTP is clicked with fewer than 6 digits', async () => {
    renderOtpVerification();
    // Fill only 3 digits
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });

    // Submit via the form element directly (button is disabled when < 6 digits)
    const form = inputs[0].closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/please enter a 6-digit otp/i)).toBeInTheDocument();
    });
    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it('calls supabase.auth.verifyOtp with correct params on submit', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderOtpVerification({ phoneNumber: '+919876543210' });

    // Fill all 6 inputs via userEvent
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }

    await user.click(screen.getByRole('button', { name: /verify otp/i }));

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        phone: '+919876543210',
        token: '123456',
        type: 'sms',
      });
    });
  });

  it('navigates to /dashboard on successful OTP verification', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderOtpVerification();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }
    await user.click(screen.getByRole('button', { name: /verify otp/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('shows error message when Supabase verifyOtp returns an error', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({
      error: { message: 'Token has expired or is invalid' },
    });
    const user = userEvent.setup();

    renderOtpVerification();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }
    await user.click(screen.getByRole('button', { name: /verify otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/token has expired or is invalid/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('calls supabase.auth.signInWithOtp when Resend OTP is clicked', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    // Render with resend timer mocked to 0 so the button is visible immediately
    renderOtpVerification({ phoneNumber: '+919876543210' });

    // The resend button is visible when not in resending state and timer > 0 is false
    // Initially resendTimer = 60 and isResending = false → button IS shown
    const resendBtn = screen.getByRole('button', { name: /resend otp/i });
    await user.click(resendBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+919876543210',
      });
    });
  });

  it('shows error when resend fails', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    });
    const user = userEvent.setup();

    renderOtpVerification({ phoneNumber: '+919876543210' });

    await user.click(screen.getByRole('button', { name: /resend otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('disables Verify OTP button until 6 digits are entered', () => {
    renderOtpVerification();
    const verifyBtn = screen.getByRole('button', { name: /verify otp/i });
    // Initially disabled
    expect(verifyBtn).toBeDisabled();

    // Fill 5 digits — still disabled
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 5; i++) {
      fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
    }
    expect(verifyBtn).toBeDisabled();

    // Fill last digit — now enabled
    fireEvent.change(inputs[5], { target: { value: '6' } });
    expect(verifyBtn).not.toBeDisabled();
  });
});
