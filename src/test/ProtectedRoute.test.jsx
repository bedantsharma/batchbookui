import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function setupAuthMock(session) {
  supabase.auth.getSession.mockResolvedValue({ data: { session } });
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
}

function renderWithRouter(ui, { initialEntries = ['/protected'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/phone-login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={<ProtectedRoute>{ui}</ProtectedRoute>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while auth state is resolving', () => {
    // Never resolves during this test
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}));
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    renderWithRouter(<div>Protected Content</div>);

    // MUI CircularProgress renders with role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /phone-login when there is no session', async () => {
    setupAuthMock(null);

    renderWithRouter(<div>Protected Content</div>);

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when a valid session exists', async () => {
    setupAuthMock({ user: { id: 'u1' }, access_token: 'token' });

    renderWithRouter(<div>Protected Content</div>);

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
