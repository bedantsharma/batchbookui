import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StudentRoute from '../components/StudentRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: { access_token: 'tok' }, loading: false }),
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));
import api from '../services/api';

function renderGuarded() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/student']}>
      <Routes>
        <Route path="/dashboard/student" element={<StudentRoute><div>Dashboard</div></StudentRoute>} />
        <Route path="/complete-profile" element={<div>Complete profile page</div>} />
        <Route path="/onboarding" element={<div>Onboarding page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('StudentRoute — session-restore fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
});
