import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FeesPage from '../pages/owner/FeesPage';
import FeeSetupModal from '../pages/owner/FeeSetupModal';
import MarkPaymentModal from '../pages/owner/MarkPaymentModal';

// ─── Mock ownerService ────────────────────────────────────────────────────────
vi.mock('../services/ownerService', () => ({
  getBatches: vi.fn(),
  getFeeDashboard: vi.fn(),
  getBatchFees: vi.fn(),
  getFeeStructure: vi.fn(),
  setupFeeStructure: vi.fn(),
  generateMonthlyRecords: vi.fn(),
  markPayment: vi.fn(),
  getOwnerStats: vi.fn().mockResolvedValue({ enrolled_students: 0, fees_collected_this_month: 0, avg_attendance_this_month: 0 }),
}));

import {
  getBatches,
  getFeeDashboard,
  getBatchFees,
  getFeeStructure,
  setupFeeStructure,
  generateMonthlyRecords,
  markPayment,
} from '../services/ownerService';

// ─── Mock matchMedia ──────────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── Test data ────────────────────────────────────────────────────────────────

const BATCH_A = { id: 1, name: 'Class 10 Maths', status: 'ACTIVE', max_capacity: 30 };
const BATCH_B = { id: 2, name: 'Class 9 Science', status: 'ACTIVE', max_capacity: 25 };

const DASHBOARD = {
  total_due: '3000.00',
  total_collected: '1500.00',
  total_pending: '1500.00',
  collection_rate: 50.0,
  records: [],
};

const FEE_STRUCTURE = { id: 1, batch_id: 1, monthly_amount: '1500.00', created_at: '2026-05-01T00:00:00' };

const FEE_RECORDS = [
  {
    id: 10,
    enrollment_id: 1,
    student_name: 'Rahul Sharma',
    batch_name: 'Class 10 Maths',
    month: '2026-05-01',
    amount_due: '1500.00',
    amount_paid: '0.00',
    status: 'NOT_PAID',
    paid_at: null,
    payment_reference: null,
    payment_link: null,
    created_at: '2026-05-01T00:00:00',
  },
  {
    id: 11,
    enrollment_id: 2,
    student_name: 'Priya Singh',
    batch_name: 'Class 10 Maths',
    month: '2026-05-01',
    amount_due: '1500.00',
    amount_paid: '1500.00',
    status: 'FULLY_PAID',
    paid_at: '2026-05-03T00:00:00',
    payment_reference: 'UPI123',
    payment_link: null,
    created_at: '2026-05-01T00:00:00',
  },
];

function renderFeesPage() {
  return render(
    <MemoryRouter>
      <FeesPage />
    </MemoryRouter>
  );
}

// ─── FeesPage tests ───────────────────────────────────────────────────────────

describe('FeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', async () => {
    getBatches.mockResolvedValue([]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);

    renderFeesPage();

    expect(screen.getByText('Fee Management')).toBeInTheDocument();
  });

  it('renders all four summary cards with dashboard data', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByText('Total Due')).toBeInTheDocument();
      expect(screen.getByText('Collected')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Collection Rate')).toBeInTheDocument();
    });
  });

  it('shows "no active batches" message when there are no batches', async () => {
    getBatches.mockResolvedValue([]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByText(/no active batches found/i)).toBeInTheDocument();
    });
  });

  it('renders batch tabs for each active batch', async () => {
    getBatches.mockResolvedValue([BATCH_A, BATCH_B]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Class 10 Maths' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Class 9 Science' })).toBeInTheDocument();
    });
  });

  it('shows "Set Monthly Fee" button when no fee structure exists for the batch', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockRejectedValue({ response: { status: 404 } });
    getBatchFees.mockResolvedValue([]);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /set monthly fee/i })).toBeInTheDocument();
    });
  });

  it('renders fee records table when structure and records exist', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
      expect(screen.getByText('Priya Singh')).toBeInTheDocument();
    });
  });

  it('shows "Unpaid" chip for NOT_PAID records', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByText('Unpaid')).toBeInTheDocument();
    });
  });

  it('shows "Paid" chip for FULLY_PAID records', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  it('does not show payment button for FULLY_PAID records', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => screen.getByText('Priya Singh'));

    // Only one payment button — for Rahul (NOT_PAID), not Priya (FULLY_PAID)
    const payBtns = screen.queryAllByRole('button', { name: /record payment/i });
    // There can be 0 or 1 (for Rahul); Priya's row should NOT have one
    // We verify by checking counts
    const rows = screen.getAllByRole('row');
    const priyaRow = rows.find((r) => within(r).queryByText('Priya Singh'));
    if (priyaRow) {
      expect(within(priyaRow).queryByTitle('Record payment')).toBeNull();
    }
    // Ensure total payment buttons ≤ 1
    expect(payBtns.length).toBeLessThanOrEqual(1);
  });

  it('shows "Generate Records" button when structure exists but no records', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue([]);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate records/i })).toBeInTheDocument();
    });
  });

  it('calls generateMonthlyRecords and refreshes when Generate Records is clicked', async () => {
    getBatches.mockResolvedValue([BATCH_A]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValueOnce([]).mockResolvedValue(FEE_RECORDS);
    generateMonthlyRecords.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => screen.getByRole('button', { name: /generate records/i }));

    fireEvent.click(screen.getByRole('button', { name: /generate records/i }));

    await waitFor(() => {
      expect(generateMonthlyRecords).toHaveBeenCalledOnce();
    });
  });

  it('filters out ARCHIVED batches', async () => {
    const archivedBatch = { ...BATCH_A, id: 3, name: 'Old Batch', status: 'ARCHIVED' };
    getBatches.mockResolvedValue([BATCH_A, archivedBatch]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);
    getFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    getBatchFees.mockResolvedValue(FEE_RECORDS);

    renderFeesPage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Class 10 Maths' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Old Batch' })).not.toBeInTheDocument();
    });
  });
});

// ─── FeeSetupModal tests ──────────────────────────────────────────────────────

describe('FeeSetupModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderSetupModal(props = {}) {
    return render(
      <FeeSetupModal
        open={true}
        onClose={vi.fn()}
        batch={BATCH_A}
        month="2026-05"
        onSuccess={vi.fn()}
        existing={null}
        {...props}
      />
    );
  }

  it('renders the modal title', () => {
    renderSetupModal();
    expect(screen.getByText('Set Monthly Fee')).toBeInTheDocument();
  });

  it('shows the batch name', () => {
    renderSetupModal();
    expect(screen.getByText('Class 10 Maths')).toBeInTheDocument();
  });

  it('shows validation error for empty amount', async () => {
    renderSetupModal();
    fireEvent.click(screen.getByRole('button', { name: /save & generate/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid monthly fee/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for zero amount', async () => {
    renderSetupModal();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /save & generate/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid monthly fee/i)).toBeInTheDocument();
    });
  });

  it('calls setupFeeStructure and generateMonthlyRecords on valid submit', async () => {
    setupFeeStructure.mockResolvedValue(FEE_STRUCTURE);
    generateMonthlyRecords.mockResolvedValue(FEE_RECORDS);
    const onSuccess = vi.fn();

    renderSetupModal({ onSuccess });

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: /save & generate/i }));

    await waitFor(() => {
      expect(setupFeeStructure).toHaveBeenCalledWith(BATCH_A.id, 1500);
      expect(generateMonthlyRecords).toHaveBeenCalledWith(BATCH_A.id, '2026-05');
      expect(onSuccess).toHaveBeenCalledWith(FEE_STRUCTURE);
    });
  });

  it('shows "Update fee" title and pre-fills amount when editing', () => {
    renderSetupModal({ existing: FEE_STRUCTURE });
    expect(screen.getByText('Update Fee')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1500.00')).toBeInTheDocument();
  });

  it('shows API error when setupFeeStructure fails', async () => {
    setupFeeStructure.mockRejectedValue({
      response: { data: { detail: 'Server error' } },
    });

    renderSetupModal();

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: /save & generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});

// ─── MarkPaymentModal tests ───────────────────────────────────────────────────

describe('MarkPaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const RECORD = FEE_RECORDS[0]; // Rahul — NOT_PAID, ₹1500

  function renderPayModal(props = {}) {
    return render(
      <MarkPaymentModal
        open={true}
        onClose={vi.fn()}
        record={RECORD}
        onSuccess={vi.fn()}
        {...props}
      />
    );
  }

  it('renders the modal title', () => {
    renderPayModal();
    expect(screen.getByText('Mark Payment')).toBeInTheDocument();
  });

  it('shows student name', () => {
    renderPayModal();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
  });

  it('pre-fills amount with outstanding balance', () => {
    renderPayModal();
    // Outstanding = 1500 - 0 = 1500
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
  });

  it('shows validation error for negative amount', async () => {
    renderPayModal();
    fireEvent.change(screen.getByLabelText(/amount paid/i), { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid amount/i)).toBeInTheDocument();
    });
  });

  it('calls markPayment with correct args on submit', async () => {
    const updatedRecord = { ...RECORD, amount_paid: '1500.00', status: 'FULLY_PAID' };
    markPayment.mockResolvedValue(updatedRecord);
    const onSuccess = vi.fn();

    renderPayModal({ onSuccess });

    fireEvent.change(screen.getByLabelText(/amount paid/i), { target: { value: '1500' } });
    const refInput = screen.getByLabelText(/reference/i);
    fireEvent.change(refInput, { target: { value: 'Cash' } });

    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(markPayment).toHaveBeenCalledWith(RECORD.id, 1500, 'Cash');
      expect(onSuccess).toHaveBeenCalledWith(updatedRecord);
    });
  });

  it('passes null reference when reference field is empty', async () => {
    const updatedRecord = { ...RECORD, amount_paid: '1500.00', status: 'FULLY_PAID' };
    markPayment.mockResolvedValue(updatedRecord);

    renderPayModal();

    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(markPayment).toHaveBeenCalledWith(RECORD.id, 1500, null);
    });
  });

  it('shows API error when markPayment fails', async () => {
    markPayment.mockRejectedValue({
      response: { data: { detail: 'Payment failed' } },
    });

    renderPayModal();

    fireEvent.click(screen.getByRole('button', { name: /confirm payment/i }));

    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
  });

  it('returns null when record prop is null', () => {
    const { container } = render(
      <MarkPaymentModal open={true} onClose={vi.fn()} record={null} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});

// ─── OwnerDashboard integration: Fees section ────────────────────────────────

describe('OwnerDashboard → Fees section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders FeesPage when Fees nav item is clicked', async () => {
    // Import here to get the mocked version
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

    getBatches.mockResolvedValue([]);
    getFeeDashboard.mockResolvedValue(DASHBOARD);

    const { default: OwnerDashboard } = await import('../pages/owner/OwnerDashboard');
    const { AuthProvider } = await import('../context/AuthContext');
    const { Routes, Route } = await import('react-router-dom');

    render(
      <MemoryRouter initialEntries={['/owner/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => screen.getAllByText('Fees'));
    fireEvent.click(screen.getAllByText('Fees')[0]);

    await waitFor(() => {
      expect(screen.getByText('Fee Management')).toBeInTheDocument();
    });
  });
});
