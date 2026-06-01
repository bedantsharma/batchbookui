/**
 * CreateBatchModal.test.jsx — unit tests for the CreateBatchModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBatchModal from '../pages/owner/CreateBatchModal';

// ─── Mock ownerService ────────────────────────────────────────────────────────
vi.mock('../services/ownerService', () => ({
  createBatch: vi.fn(),
}));

import { createBatch } from '../services/ownerService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BATCH_RESPONSE = {
  id: 1,
  institute_id: 1,
  name: 'Class 10 Maths',
  subject: 'Mathematics',
  grade: '10',
  start_time: '16:00:00',
  end_time: '17:00:00',
  days_of_week: ['MON', 'WED', 'FRI'],
  max_capacity: 30,
  start_date: '2026-05-27',
  end_date: '2026-12-31',
  status: 'ACTIVE',
  created_at: '2026-05-27T00:00:00',
};

// Render helpers
const noop = () => {};

function renderModal(overrides = {}) {
  const props = {
    open: true,
    onClose: noop,
    onCreated: noop,
    ...overrides,
  };
  return render(<CreateBatchModal {...props} />);
}

describe('CreateBatchModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all required form fields when open', () => {
    renderModal();
    expect(screen.getByLabelText(/batch name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max capacity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('renders day-of-week checkboxes', () => {
    renderModal();
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('shows "Create New Batch" title', () => {
    renderModal();
    expect(screen.getByText('Create New Batch')).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /create batch/i }));

    await waitFor(() => {
      expect(screen.getByText(/batch name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      expect(screen.getByText(/select at least one day/i)).toBeInTheDocument();
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
    });
    expect(createBatch).not.toHaveBeenCalled();
  });

  it('calls createBatch with correct payload on valid submission', async () => {
    createBatch.mockResolvedValue(BATCH_RESPONSE);
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderModal({ onCreated });

    await user.type(screen.getByLabelText(/batch name/i), 'Class 10 Maths');
    await user.type(screen.getByLabelText(/^subject/i), 'Mathematics');
    // Grade (optional) — skip
    // Start/end time — pre-filled to 16:00 / 17:00

    // Check MON, WED, FRI
    await user.click(screen.getByRole('checkbox', { name: /^mon$/i }));
    await user.click(screen.getByRole('checkbox', { name: /^wed$/i }));
    await user.click(screen.getByRole('checkbox', { name: /^fri$/i }));

    await user.clear(screen.getByLabelText(/max capacity/i));
    await user.type(screen.getByLabelText(/max capacity/i), '30');

    // Set end date
    const endDateInput = screen.getByLabelText(/end date/i);
    await user.clear(endDateInput);
    fireEvent.change(endDateInput, { target: { value: '2026-12-31' } });

    await user.click(screen.getByRole('button', { name: /create batch/i }));

    await waitFor(() => {
      expect(createBatch).toHaveBeenCalledOnce();
      const call = createBatch.mock.calls[0][0];
      expect(call.name).toBe('Class 10 Maths');
      expect(call.subject).toBe('Mathematics');
      expect(call.days_of_week).toEqual(expect.arrayContaining(['MON', 'WED', 'FRI']));
      expect(call.max_capacity).toBe(30);
      expect(call.end_date).toBe('2026-12-31');
    });
  });

  it('calls onCreated with the new batch on success', async () => {
    createBatch.mockResolvedValue(BATCH_RESPONSE);
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderModal({ onCreated });

    await user.type(screen.getByLabelText(/batch name/i), 'New Batch');
    await user.type(screen.getByLabelText(/^subject/i), 'Science');
    await user.click(screen.getByRole('checkbox', { name: /^mon$/i }));
    await user.clear(screen.getByLabelText(/max capacity/i));
    await user.type(screen.getByLabelText(/max capacity/i), '20');
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-12-31' } });

    await user.click(screen.getByRole('button', { name: /create batch/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(BATCH_RESPONSE);
    });
  });

  it('shows API error message when createBatch fails', async () => {
    const err = new Error('Failed');
    err.response = { data: { detail: 'Institute not found' } };
    createBatch.mockRejectedValue(err);
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/batch name/i), 'New Batch');
    await user.type(screen.getByLabelText(/^subject/i), 'Science');
    await user.click(screen.getByRole('checkbox', { name: /^mon$/i }));
    await user.clear(screen.getByLabelText(/max capacity/i));
    await user.type(screen.getByLabelText(/max capacity/i), '20');
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-12-31' } });

    await user.click(screen.getByRole('button', { name: /create batch/i }));

    await waitFor(() => {
      expect(screen.getByText(/institute not found/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByText('Create New Batch')).not.toBeInTheDocument();
  });
});
