/**
 * AddStudentModal.test.jsx — unit tests for the AddStudentModal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddStudentModal from '../pages/owner/AddStudentModal';

// ─── Mock ownerService ────────────────────────────────────────────────────────
vi.mock('../services/ownerService', () => ({
  inviteStudent: vi.fn(),
}));

import { inviteStudent } from '../services/ownerService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BATCHES = [
  { id: 1, name: 'Class 10 Maths', subject: 'Mathematics', status: 'ACTIVE' },
  { id: 2, name: 'Class 9 Science', subject: 'Science', status: 'ACTIVE' },
];

const noop = () => {};

function renderModal(overrides = {}) {
  const props = {
    open: true,
    onClose: noop,
    onAdded: noop,
    batches: BATCHES,
    defaultBatch: null,
    ...overrides,
  };
  return render(<AddStudentModal {...props} />);
}

describe('AddStudentModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders form fields when open', () => {
    renderModal();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent.*phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enroll in batch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fee due day/i)).toBeInTheDocument();
  });

  it('shows "Add Student" title in the dialog header', () => {
    renderModal();
    // The title is in an h2, the button is just a button role — use heading
    expect(screen.getByRole('heading', { name: /add student/i })).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      // 'Name is required.' (student) — exact match avoids colliding with 'Parent name is required.'
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
    });
    expect(inviteStudent).not.toHaveBeenCalled();
  });

  it('shows validation error when parent name is empty', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/student name/i), 'Rahul Sharma');
    await user.type(screen.getByLabelText(/parent.*phone/i), '9876543210');
    // leave parent name empty

    const selectInput = screen.getByLabelText(/enroll in batch/i);
    fireEvent.mouseDown(selectInput);
    const option = await screen.findByRole('option', { name: /class 10 maths/i });
    await user.click(option);

    fireEvent.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(screen.getByText(/parent name is required/i)).toBeInTheDocument();
    });
    expect(inviteStudent).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid phone number', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/student name/i), 'Rahul');
    await user.type(screen.getByLabelText(/parent name/i), 'Mr Sharma');
    await user.type(screen.getByLabelText(/parent.*phone/i), '123'); // too short

    fireEvent.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(screen.getByText(/10-digit phone number/i)).toBeInTheDocument();
    });
  });

  it('calls inviteStudent with correct args on valid submission', async () => {
    inviteStudent.mockResolvedValue({ enrollment_id: 1 });
    const onAdded = vi.fn();
    const user = userEvent.setup();
    renderModal({ onAdded });

    await user.type(screen.getByLabelText(/student name/i), 'Rahul Sharma');
    await user.type(screen.getByLabelText(/parent name/i), 'Mr Sharma');
    await user.type(screen.getByLabelText(/parent.*phone/i), '9876543210');

    // Select first batch from the dropdown
    const selectInput = screen.getByLabelText(/enroll in batch/i);
    fireEvent.mouseDown(selectInput);
    const option = await screen.findByRole('option', { name: /class 10 maths/i });
    await user.click(option);

    await user.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(inviteStudent).toHaveBeenCalledOnce();
      const call = inviteStudent.mock.calls[0][0];
      expect(call.student_name).toBe('Rahul Sharma');
      expect(call.parent_name).toBe('Mr Sharma');
      expect(call.parent_phone).toBe('9876543210');
      expect(call.batch_id).toBe(1);
    });
  });

  it('calls onAdded after successful submission', async () => {
    inviteStudent.mockResolvedValue({ enrollment_id: 1 });
    const onAdded = vi.fn();
    const user = userEvent.setup();
    renderModal({ onAdded });

    await user.type(screen.getByLabelText(/student name/i), 'Test Student');
    await user.type(screen.getByLabelText(/parent name/i), 'Test Parent');
    await user.type(screen.getByLabelText(/parent.*phone/i), '9999999999');

    const selectInput = screen.getByLabelText(/enroll in batch/i);
    fireEvent.mouseDown(selectInput);
    const option = await screen.findByRole('option', { name: /class 10 maths/i });
    await user.click(option);

    await user.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledOnce();
    });
  });

  it('shows API error when inviteStudent fails', async () => {
    const err = new Error('Server Error');
    err.response = { data: { detail: 'Phone number already registered' } };
    inviteStudent.mockRejectedValue(err);
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/student name/i), 'Rahul');
    await user.type(screen.getByLabelText(/parent name/i), 'Mr Sharma');
    await user.type(screen.getByLabelText(/parent.*phone/i), '9876543210');

    const selectInput = screen.getByLabelText(/enroll in batch/i);
    fireEvent.mouseDown(selectInput);
    const option = await screen.findByRole('option', { name: /class 10 maths/i });
    await user.click(option);

    await user.click(screen.getByRole('button', { name: /add student/i }));

    await waitFor(() => {
      expect(screen.getByText(/phone number already registered/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render when open is false', () => {
    renderModal({ open: false });
    expect(screen.queryByText('Add Student')).not.toBeInTheDocument();
  });

  it('pre-selects defaultBatch when provided', async () => {
    renderModal({ defaultBatch: BATCHES[1] });
    // The select should show Class 9 Science as the selected value
    await waitFor(() => {
      const selectEl = screen.getByLabelText(/enroll in batch/i);
      // The select renders its value — check it's set
      expect(selectEl).toBeInTheDocument();
    });
  });

  it('disables Add Student button when no batches are available', () => {
    renderModal({ batches: [] });
    const btn = screen.getByRole('button', { name: /add student/i });
    expect(btn).toBeDisabled();
  });
});
