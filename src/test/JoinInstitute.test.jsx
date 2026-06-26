import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JoinInstitute from '../components/onboarding/JoinInstitute';

// ─── Mock Supabase ────────────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      setSession: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn(),
    },
  },
}));

// ─── Mock fetch (PhoneOtpStep calls fetch for generate_otp) ──────────────────
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
));

// ─── Helper: render the /join/:joinCode route via MemoryRouter ────────────────
function renderJoin(initialEntry = '/join/ABC123?student=Riya') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/join/:joinCode" element={<JoinInstitute />} />
        <Route path="/dashboard/student" element={<div>Student Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('JoinInstitute', () => {
  it('renders the join component at /join/:joinCode', () => {
    renderJoin();
    // The card should be present — look for the "Verify your number" subheading
    // (always present regardless of student param)
    expect(screen.getByText(/Verify your phone to view/i)).toBeInTheDocument();
  });

  it('prefills student name from ?student= query param', () => {
    renderJoin('/join/ABC123?student=Riya');
    expect(screen.getByText(/Riya/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Riya's parent!/i)).toBeInTheDocument();
  });

  it('shows generic heading when ?student is absent', () => {
    renderJoin('/join/ABC123');
    // The h6 card heading should say "Verify your number" (exact match, not the PhoneOtpStep sub-text)
    expect(screen.getByRole('heading', { name: /Verify your number/i })).toBeInTheDocument();
    // Must NOT render "undefined" anywhere
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

  it('renders the PhoneOtpStep (phone input visible)', () => {
    renderJoin();
    // PhoneOtpStep renders a phone text field
    expect(screen.getByPlaceholderText(/10-digit mobile number/i)).toBeInTheDocument();
  });

  it('uses the joinCode from the URL param', () => {
    // Smoke test: component mounts without error for a different join code
    renderJoin('/join/XYZ999?student=Arjun');
    expect(screen.getByText(/Arjun/i)).toBeInTheDocument();
  });
});
