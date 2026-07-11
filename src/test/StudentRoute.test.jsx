import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StudentRoute from '../components/StudentRoute';

// `mockAuthState` is mutated between renders (and read live by the `useAuth`
// mock below) so tests can simulate session state changing mid-test — e.g.
// a session invalidating while a `/parent/me` fetch is still in flight.
let mockAuthState = { session: { access_token: 'tok' }, loading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));
import api from '../services/api';

function guardedTree() {
  return (
    <MemoryRouter initialEntries={['/dashboard/student']}>
      <Routes>
        <Route path="/dashboard/student" element={<StudentRoute><div>Dashboard</div></StudentRoute>} />
        <Route path="/complete-profile" element={<div>Complete profile page</div>} />
        <Route path="/onboarding" element={<div>Onboarding page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderGuarded() {
  return render(guardedTree());
}

describe('StudentRoute — session-restore fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuthState = { session: { access_token: 'tok' }, loading: false };
  });

  it('restores role via /parent/me and renders the guarded page when profile is complete', async () => {
    api.get.mockResolvedValue({
      data: { id: 1, name: 'Priya', phone_number: '9876543210', children: [{ id: 10, name: 'Kid', email: 'kid@test.com' }] },
    });

    renderGuarded();

    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    expect(localStorage.getItem('bb_role')).toBe('student');
    expect(localStorage.getItem('bb_student_id')).toBe('10');
  });

  it('redirects to /complete-profile when the restored profile is missing fields', async () => {
    api.get.mockResolvedValue({
      data: { id: 1, name: null, phone_number: '9876543210', children: [{ id: 10, name: 'Kid', email: null }] },
    });

    renderGuarded();

    await waitFor(() => expect(screen.getByText('Complete profile page')).toBeInTheDocument());
  });

  it('falls back to /onboarding when /parent/me fails', async () => {
    api.get.mockRejectedValue(new Error('401'));

    renderGuarded();

    await waitFor(() => expect(screen.getByText('Onboarding page')).toBeInTheDocument());
  });

  it('does not get stuck on the spinner if the session invalidates while /parent/me is still in flight', async () => {
    let resolveFetch;
    api.get.mockImplementation(() => new Promise((resolve) => { resolveFetch = resolve; }));

    const { rerender } = renderGuarded();

    // The restore fetch is in flight — spinner is showing.
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());

    // Session invalidates mid-request (e.g. token expiry / logout) before the
    // /parent/me promise ever settles.
    mockAuthState = { session: null, loading: false };
    rerender(guardedTree());

    // The component must fall through to the /onboarding redirect instead of
    // being stuck showing the spinner forever.
    await waitFor(() => expect(screen.getByText('Onboarding page')).toBeInTheDocument());
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    // Letting the stale fetch settle afterwards must not resurrect the spinner
    // or otherwise disturb the already-settled redirect.
    resolveFetch({
      data: { id: 1, name: 'Priya', phone_number: '9876543210', children: [{ id: 10, name: 'Kid', email: 'kid@test.com' }] },
    });
    await waitFor(() => expect(screen.getByText('Onboarding page')).toBeInTheDocument());
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
