import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestsPage from '../pages/owner/TestsPage';

// ─── Mock ownerService ────────────────────────────────────────────────────────
vi.mock('../services/ownerService', () => ({
  getBatches: vi.fn(),
  getEnrollmentsByBatch: vi.fn(),
  getStudentScores: vi.fn(),
  createTestScore: vi.fn(),
}));

import {
  getBatches,
  getEnrollmentsByBatch,
  getStudentScores,
  createTestScore,
} from '../services/ownerService';

const BATCHES = [{ id: 1, name: 'Class 10', subject: 'Maths' }];
const ENROLLMENTS = [{ id: 3, student_id: 42, batch_id: 1, is_active: true }];
const SCORES_RESPONSE = {
  enrollment_id: 3,
  scores: [
    { id: 1, test_name: 'Unit Test 1', subject: 'Maths', date: '2026-05-01', max_marks: 100, obtained_marks: 75, percentage: 75.0 },
  ],
  needs_attention: false,
};

beforeEach(() => {
  getBatches.mockResolvedValue(BATCHES);
  getEnrollmentsByBatch.mockResolvedValue(ENROLLMENTS);
  getStudentScores.mockResolvedValue(SCORES_RESPONSE);
  createTestScore.mockResolvedValue({
    id: 2, enrollment_id: 3, test_name: 'Unit Test 2', subject: 'Maths',
    date: '2026-05-15', max_marks: 100, obtained_marks: 80, percentage: 80.0,
  });
});

describe('TestsPage', () => {
  it('renders heading and batch selector', async () => {
    render(<TestsPage />);
    expect(screen.getByText('Test Scores')).toBeInTheDocument();
    await waitFor(() => expect(getBatches).toHaveBeenCalledOnce());
  });

  it('loads enrollments after batch is selected', async () => {
    render(<TestsPage />);
    await waitFor(() => screen.getByRole('combobox'));

    // MUI Select: open + pick batch 1
    const batchSelect = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(batchSelect);
    await waitFor(() => screen.getByText('Class 10 (Maths)'));
    fireEvent.click(screen.getByText('Class 10 (Maths)'));

    await waitFor(() => expect(getEnrollmentsByBatch).toHaveBeenCalledWith(1));
  });

  it('shows needs_attention alert when flag is true', async () => {
    getStudentScores.mockResolvedValueOnce({ ...SCORES_RESPONSE, needs_attention: true });
    render(<TestsPage />);

    // Select batch
    await waitFor(() => screen.getAllByRole('combobox'));
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    await waitFor(() => screen.getByText('Class 10 (Maths)'));
    fireEvent.click(screen.getByText('Class 10 (Maths)'));

    // Select student
    await waitFor(() => screen.getAllByRole('combobox').length > 1);
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    await waitFor(() => screen.getByText('Student #42'));
    fireEvent.click(screen.getByText('Student #42'));

    await waitFor(() =>
      expect(screen.getByText(/needs attention/i)).toBeInTheDocument()
    );
  });

  it('renders score table after student is selected', async () => {
    render(<TestsPage />);

    // Select batch
    await waitFor(() => screen.getAllByRole('combobox'));
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    await waitFor(() => screen.getByText('Class 10 (Maths)'));
    fireEvent.click(screen.getByText('Class 10 (Maths)'));

    // Select student
    await waitFor(() => screen.getAllByRole('combobox').length > 1);
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    await waitFor(() => screen.getByText('Student #42'));
    fireEvent.click(screen.getByText('Student #42'));

    await waitFor(() =>
      expect(screen.getByText('Unit Test 1')).toBeInTheDocument()
    );
  });
});

describe('TestsPage — OwnerDashboard integration', () => {
  it('Tests nav item is rendered in OwnerDashboard', async () => {
    const { default: OwnerDashboard } = await import('../pages/owner/OwnerDashboard');
    const { AuthProvider } = await import('../context/AuthContext');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <MemoryRouter>
        <AuthProvider>
          <OwnerDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Tests')).toBeInTheDocument());
  });
});
