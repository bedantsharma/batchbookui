/**
 * BatchesPage.test.jsx — unit tests for the BatchesPage component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BatchesPage from '../pages/owner/BatchesPage';

// ─── Mock ownerService ────────────────────────────────────────────────────────
vi.mock('../services/ownerService', () => ({
  getBatches: vi.fn(),
  getEnrollmentsByBatch: vi.fn(),
  createBatch: vi.fn(),
}));

// Mock the CreateBatchModal so we don't render it fully in these tests
vi.mock('../pages/owner/CreateBatchModal', () => ({
  default: ({ open, onClose, onCreated }) =>
    open ? (
      <div data-testid="create-batch-modal">
        <button onClick={onClose}>close-modal</button>
        <button onClick={() => onCreated({ id: 99, name: 'New Batch', status: 'ACTIVE' })}>
          mock-create
        </button>
      </div>
    ) : null,
}));

import { getBatches, getEnrollmentsByBatch } from '../services/ownerService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BATCH_ACTIVE = {
  id: 1,
  name: 'Class 10 Maths',
  subject: 'Mathematics',
  grade: '10',
  start_time: '16:00:00',
  end_time: '17:00:00',
  days_of_week: ['MON', 'WED', 'FRI'],
  max_capacity: 30,
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  status: 'ACTIVE',
};

const BATCH_ARCHIVED = {
  id: 2,
  name: 'Old Batch',
  subject: 'Science',
  grade: null,
  start_time: '10:00:00',
  end_time: '11:00:00',
  days_of_week: ['TUE', 'THU'],
  max_capacity: 20,
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  status: 'ARCHIVED',
};

const ENROLLMENTS = [
  { id: 1, student_id: 5, batch_id: 1, is_active: true },
  { id: 2, student_id: 6, batch_id: 1, is_active: true },
  { id: 3, student_id: 7, batch_id: 1, is_active: false }, // inactive — should not count
];

describe('BatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEnrollmentsByBatch.mockResolvedValue(ENROLLMENTS);
  });

  it('shows a loading skeleton while fetching batches', () => {
    // getBatches never resolves in this test
    getBatches.mockReturnValue(new Promise(() => {}));
    render(<BatchesPage onAddStudent={() => {}} />);
    // Skeleton elements should be present during loading
    // (the LoadingGrid renders 3 skeleton cards)
    expect(screen.getByText(/loading…/i)).toBeInTheDocument();
  });

  it('renders batch cards after loading', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Class 10 Maths')).toBeInTheDocument();
    });
    expect(screen.getByText(/mathematics/i)).toBeInTheDocument();
  });

  it('renders status chip for each batch', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE, BATCH_ARCHIVED]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('ARCHIVED')).toBeInTheDocument();
    });
  });

  it('shows empty state when there are no batches', async () => {
    getBatches.mockResolvedValue([]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/no batches yet/i)).toBeInTheDocument();
    });
  });

  it('shows error alert when API call fails', async () => {
    const err = new Error('Server error');
    err.response = { data: { detail: 'Institute not found' } };
    getBatches.mockRejectedValue(err);

    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/institute not found/i)).toBeInTheDocument();
    });
  });

  it('shows correct batch count in the header', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE, BATCH_ARCHIVED]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('2 batches')).toBeInTheDocument();
    });
  });

  it('shows "New Batch" button', async () => {
    getBatches.mockResolvedValue([]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new batch/i })).toBeInTheDocument();
    });
  });

  it('opens CreateBatchModal when "New Batch" is clicked', async () => {
    getBatches.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => screen.getByRole('button', { name: /new batch/i }));
    await user.click(screen.getByRole('button', { name: /new batch/i }));

    await waitFor(() => {
      expect(screen.getByTestId('create-batch-modal')).toBeInTheDocument();
    });
  });

  it('adds new batch to the list when onCreated is called from modal', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE]);
    const user = userEvent.setup();
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => screen.getByText('Class 10 Maths'));

    // Open modal
    await user.click(screen.getByRole('button', { name: /new batch/i }));
    // Trigger the mock creation
    await user.click(screen.getByRole('button', { name: 'mock-create' }));

    await waitFor(() => {
      // "New Batch" appears in both the button and the card — check for 2+ instances
      expect(screen.getAllByText('New Batch').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('calls onAddStudent with batch when "Add Student" button is clicked', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE]);
    const onAddStudent = vi.fn();
    render(<BatchesPage onAddStudent={onAddStudent} />);

    await waitFor(() => screen.getByText('Class 10 Maths'));

    // Wait for enrollments to load too
    await waitFor(() => screen.getByRole('button', { name: /add student/i }));
    await userEvent.setup().click(screen.getByRole('button', { name: /add student/i }));

    expect(onAddStudent).toHaveBeenCalledWith(BATCH_ACTIVE);
  });

  it('shows Mon / Wed / Fri labels for days', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/mon \/ wed \/ fri/i)).toBeInTheDocument();
    });
  });

  it('shows formatted time range', async () => {
    getBatches.mockResolvedValue([BATCH_ACTIVE]);
    render(<BatchesPage onAddStudent={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/4:00 PM – 5:00 PM/i)).toBeInTheDocument();
    });
  });
});
