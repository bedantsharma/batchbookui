import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../pages/owner/SettingsPage';

vi.mock('../services/ownerService', () => ({
  getRazorpayPayoutStatus: vi.fn(),
  saveRazorpayCredentials: vi.fn(),
  getOwnerStats: vi.fn().mockResolvedValue({
    enrolled_students: 0,
    fees_collected_this_month: '0',
    avg_attendance_this_month: 0,
  }),
}));

import { getRazorpayPayoutStatus, saveRazorpayCredentials } from '../services/ownerService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SettingsPage — Payouts', () => {
  it('shows Not Connected status by default', async () => {
    getRazorpayPayoutStatus.mockResolvedValue({
      status: 'NOT_CONNECTED', key_id: null, secret_configured: false,
    });

    render(<SettingsPage />);

    await waitFor(() => expect(getRazorpayPayoutStatus).toHaveBeenCalledOnce());
    expect(await screen.findByText(/not connected/i)).toBeInTheDocument();
  });

  it('shows Connected status and existing key id when already configured', async () => {
    getRazorpayPayoutStatus.mockResolvedValue({
      status: 'CONNECTED', key_id: 'rzp_live_abc123', secret_configured: true,
    });

    render(<SettingsPage />);

    expect(await screen.findByText(/^connected$/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('rzp_live_abc123')).toBeInTheDocument();
  });

  it('saving valid credentials calls saveRazorpayCredentials and updates status', async () => {
    getRazorpayPayoutStatus.mockResolvedValue({
      status: 'NOT_CONNECTED', key_id: null, secret_configured: false,
    });
    saveRazorpayCredentials.mockResolvedValue({
      status: 'CONNECTED', key_id: 'rzp_live_new', secret_configured: true,
    });

    render(<SettingsPage />);
    await waitFor(() => screen.getByLabelText(/key id/i));

    fireEvent.change(screen.getByLabelText(/key id/i), { target: { value: 'rzp_live_new' } });
    fireEvent.change(screen.getByLabelText(/key secret/i), { target: { value: 'topsecretvalue' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(saveRazorpayCredentials).toHaveBeenCalledWith('rzp_live_new', 'topsecretvalue')
    );
    expect(await screen.findByText(/^connected$/i)).toBeInTheDocument();
  });

  it('shows an error message when saving fails', async () => {
    getRazorpayPayoutStatus.mockResolvedValue({
      status: 'NOT_CONNECTED', key_id: null, secret_configured: false,
    });
    saveRazorpayCredentials.mockRejectedValue({
      response: { data: { detail: 'No institute found for this owner' } },
    });

    render(<SettingsPage />);
    await waitFor(() => screen.getByLabelText(/key id/i));

    fireEvent.change(screen.getByLabelText(/key id/i), { target: { value: 'rzp_live_new' } });
    fireEvent.change(screen.getByLabelText(/key secret/i), { target: { value: 'topsecretvalue' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/no institute found for this owner/i)).toBeInTheDocument();
  });
});

describe('SettingsPage — OwnerDashboard integration', () => {
  it('Settings nav item is rendered in OwnerDashboard', async () => {
    const { default: OwnerDashboard } = await import('../pages/owner/OwnerDashboard');
    const { AuthProvider } = await import('../context/AuthContext');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <MemoryRouter>
        <AuthProvider>
          <OwnerDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());
  });
});
