import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OwnerSetup from '../pages/owner/OwnerSetup';
import { AuthProvider } from '../context/AuthContext';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
  },
}));

// ─── Mock api.js ─────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../services/api';

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderSetup() {
  return render(
    <MemoryRouter initialEntries={['/owner/setup']}>
      <AuthProvider>
        <Routes>
          <Route path="/owner/setup" element={<OwnerSetup />} />
          <Route path="/owner/dashboard" element={<div>Owner Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('OwnerSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with institute name and city fields', () => {
    renderSetup();
    expect(screen.getByLabelText(/institute name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save & continue/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    renderSetup();
    fireEvent.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/institute name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/city is required/i)).toBeInTheDocument();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls POST /owner/institute with correct data on valid submit', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    const user = userEvent.setup();

    renderSetup();

    await user.type(screen.getByLabelText(/institute name/i), 'Sharma Classes');
    await user.type(screen.getByLabelText(/city/i), 'Gurugram');
    await user.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/owner/institute', {
        name: 'Sharma Classes',
        city: 'Gurugram',
      });
    });
  });

  it('navigates to /owner/dashboard on successful submission', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    const user = userEvent.setup();

    renderSetup();

    await user.type(screen.getByLabelText(/institute name/i), 'Sharma Classes');
    await user.type(screen.getByLabelText(/city/i), 'Gurugram');
    await user.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    });
  });

  it('navigates to /owner/dashboard on 409 (institute already exists)', async () => {
    const err = new Error('Conflict');
    err.response = { status: 409 };
    api.post.mockRejectedValue(err);
    const user = userEvent.setup();

    renderSetup();

    await user.type(screen.getByLabelText(/institute name/i), 'Existing Classes');
    await user.type(screen.getByLabelText(/city/i), 'Delhi');
    await user.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    });
  });

  it('shows an error message on non-409 API failure', async () => {
    const err = new Error('Server Error');
    err.response = { status: 500, data: { detail: 'Internal server error' } };
    api.post.mockRejectedValue(err);
    const user = userEvent.setup();

    renderSetup();

    await user.type(screen.getByLabelText(/institute name/i), 'Test Classes');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Owner Dashboard')).not.toBeInTheDocument();
  });

  it('trims whitespace from input values before submitting', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    const user = userEvent.setup();

    renderSetup();

    await user.type(screen.getByLabelText(/institute name/i), '  Allen Classes  ');
    await user.type(screen.getByLabelText(/city/i), '  Kota  ');
    await user.click(screen.getByRole('button', { name: /save & continue/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/owner/institute', {
        name: 'Allen Classes',
        city: 'Kota',
      });
    });
  });
});
