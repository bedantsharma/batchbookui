import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OwnerDashboard from '../pages/owner/OwnerDashboard';
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
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

// ─── Mock matchMedia (used by MUI useMediaQuery) ──────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,   // desktop mode by default
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/owner/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/phone-login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('OwnerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply mock for each test
    vi.mocked(window.matchMedia).mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders the sidebar with all 4 navigation items', async () => {
    renderDashboard();

    await waitFor(() => {
      // "Students" appears in both sidebar nav and main content heading — use getAllByText
      expect(screen.getAllByText('Students').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Batches').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Fees').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Attendance').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the BatchBook brand in the sidebar', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByText('BatchBook').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Owner Dashboard').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows the Students section content by default (description in main area)', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/manage enrolled students/i)).toBeInTheDocument();
    });
  });

  it('switches to Batches section when clicking Batches nav item', async () => {
    renderDashboard();
    await waitFor(() => screen.getAllByText('Batches'));

    // Click the first match (the sidebar nav item)
    fireEvent.click(screen.getAllByText('Batches')[0]);

    await waitFor(() => {
      // Main content should now show Batches description
      expect(screen.getByText(/manage class batches/i)).toBeInTheDocument();
    });
  });

  it('switches to Fees section when clicking Fees nav item', async () => {
    // FeesPage is now rendered for the fees section — it renders "Fee Management" heading
    // Mock the service calls FeesPage makes on mount
    vi.mock('../services/ownerService', () => ({
      getBatches: vi.fn().mockResolvedValue([]),
      getFeeDashboard: vi.fn().mockResolvedValue({
        total_due: '0',
        total_collected: '0',
        total_pending: '0',
        collection_rate: 0,
        records: [],
      }),
      getFeeStructure: vi.fn(),
      getBatchFees: vi.fn(),
      setupFeeStructure: vi.fn(),
      generateMonthlyRecords: vi.fn(),
      markPayment: vi.fn(),
    }));

    renderDashboard();
    await waitFor(() => screen.getAllByText('Fees'));

    fireEvent.click(screen.getAllByText('Fees')[0]);

    await waitFor(() => {
      expect(screen.getByText('Fee Management')).toBeInTheDocument();
    });
  });

  it('switches to Attendance section when clicking Attendance nav item', async () => {
    renderDashboard();
    await waitFor(() => screen.getAllByText('Attendance'));

    fireEvent.click(screen.getAllByText('Attendance')[0]);

    await waitFor(() => {
      expect(screen.getByText(/mark class attendance/i)).toBeInTheDocument();
    });
  });

  it('renders a Sign Out button in the sidebar', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByText('Sign Out').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls signOut and navigates to /phone-login when Sign Out is clicked', async () => {
    const { supabase } = await import('../lib/supabaseClient');
    renderDashboard();

    await waitFor(() => screen.getAllByText('Sign Out'));
    fireEvent.click(screen.getAllByText('Sign Out')[0]);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
