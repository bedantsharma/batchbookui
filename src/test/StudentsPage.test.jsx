import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentsPage from '../pages/owner/StudentsPage';

vi.mock('../services/ownerService', () => ({
  getBatches: vi.fn(),
  getEnrollmentsByBatch: vi.fn(),
  removeEnrollment: vi.fn(),
}));

import { getBatches, getEnrollmentsByBatch } from '../services/ownerService';

const BATCH = { id: 1, name: 'Class 10 Maths', status: 'ACTIVE' };

function makeEnrollment(overrides = {}) {
  return {
    id: 1,
    student_id: 10,
    student_name: 'Rahul Sharma',
    is_active: true,
    due_day: 5,
    first_month_amount: '1500.00',
    fee_status: 'NOT_PAID',
    parent_is_verified: true,
    last_notification_status: null,
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <StudentsPage />
    </MemoryRouter>
  );
}

describe('StudentsPage — parent unverified badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows warning badge when parent_is_verified is false', async () => {
    getBatches.mockResolvedValue([BATCH]);
    getEnrollmentsByBatch.mockResolvedValue([makeEnrollment({ parent_is_verified: false })]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/parent not verified/i)).toBeInTheDocument();
    });
  });

  it('shows warning badge when last_notification_status is SKIPPED_UNVERIFIED', async () => {
    getBatches.mockResolvedValue([BATCH]);
    getEnrollmentsByBatch.mockResolvedValue([
      makeEnrollment({ parent_is_verified: false, last_notification_status: 'SKIPPED_UNVERIFIED' }),
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/parent not verified/i)).toBeInTheDocument();
    });
  });

  it('does NOT show warning badge when parent is verified and status is not SKIPPED_UNVERIFIED', async () => {
    getBatches.mockResolvedValue([BATCH]);
    getEnrollmentsByBatch.mockResolvedValue([
      makeEnrollment({ parent_is_verified: true, last_notification_status: null }),
    ]);

    renderPage();

    // Wait for the student name to be rendered first (confirming render is complete)
    await waitFor(() => {
      expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    });

    expect(screen.queryByText(/parent not verified/i)).not.toBeInTheDocument();
  });
});
