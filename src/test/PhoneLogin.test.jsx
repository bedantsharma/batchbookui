import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PhoneLogin from '../components/PhoneLogin';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderPhoneLogin() {
  return render(
    <MemoryRouter initialEntries={['/phone-login']}>
      <Routes>
        <Route path="/phone-login" element={<PhoneLogin />} />
        <Route
          path="/otp-verification"
          element={<div data-testid="otp-page">OTP Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PhoneLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders phone input and Get OTP button', () => {
    renderPhoneLogin();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get otp/i })).toBeInTheDocument();
  });

  it('shows validation error when submitted with less than 10 digits', async () => {
    renderPhoneLogin();
    const input = screen.getByLabelText(/phone number/i);

    fireEvent.change(input, { target: { value: '98765' } });
    fireEvent.click(screen.getByRole('button', { name: /get otp/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid 10-digit indian phone number/i)
      ).toBeInTheDocument();
    });
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('shows validation error when submitted with empty input', async () => {
    renderPhoneLogin();
    fireEvent.click(screen.getByRole('button', { name: /get otp/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid 10-digit indian phone number/i)
      ).toBeInTheDocument();
    });
  });

  it('calls supabase.auth.signInWithOtp with E.164 number on valid submit', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderPhoneLogin();
    await user.type(screen.getByLabelText(/phone number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /get otp/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+919876543210',
      });
    });
  });

  it('navigates to /otp-verification on successful OTP send', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderPhoneLogin();
    await user.type(screen.getByLabelText(/phone number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /get otp/i }));

    await waitFor(() => {
      expect(screen.getByTestId('otp-page')).toBeInTheDocument();
    });
  });

  it('shows error message when Supabase returns an error', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      error: { message: 'Phone number is invalid' },
    });
    const user = userEvent.setup();

    renderPhoneLogin();
    await user.type(screen.getByLabelText(/phone number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /get otp/i }));

    await waitFor(() => {
      expect(screen.getByText(/phone number is invalid/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('otp-page')).not.toBeInTheDocument();
  });

  it('strips non-digit characters from phone input', async () => {
    renderPhoneLogin();
    const input = screen.getByLabelText(/phone number/i);
    // Typing letters + digits — only digits should remain
    fireEvent.change(input, { target: { value: 'abc9876543210' } });
    expect(input.value).toBe('9876543210');
  });

  it('clamps phone input to 10 digits', async () => {
    renderPhoneLogin();
    const input = screen.getByLabelText(/phone number/i);
    fireEvent.change(input, { target: { value: '12345678901234' } });
    expect(input.value).toBe('1234567890');
  });

  it('shows a loading spinner and disables the button while loading', async () => {
    // Never resolves — simulates an in-flight request
    supabase.auth.signInWithOtp.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    renderPhoneLogin();
    await user.type(screen.getByLabelText(/phone number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /get otp/i }));

    // Button should be disabled and show a spinner while the promise is pending
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // The submit button (type=submit) should be disabled
      const submitBtn = screen.getByRole('button');
      expect(submitBtn).toBeDisabled();
    });
  });
});
