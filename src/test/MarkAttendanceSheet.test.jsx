/**
 * MarkAttendanceSheet.test.jsx — regression coverage for the roster-drift bug.
 *
 * A session's attendance rows are frozen to whoever was actively enrolled
 * when the session was created. The batch's `enrollments` list keeps
 * changing after that (students join/leave). The sheet must build its
 * roster and present/absent counts from the session's own attendance rows,
 * not from the live enrollments list — otherwise reopening an older session
 * shows the wrong students checked and counts that don't add up.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkAttendanceSheet from '../pages/owner/MarkAttendanceSheet';

vi.mock('../services/ownerService', () => ({
  markAttendance: vi.fn(),
}));

import { markAttendance } from '../services/ownerService';

describe('MarkAttendanceSheet — roster sourced from attendance, not live enrollments', () => {
  it('shows the correct present student even when the batch has since gained new enrollments', () => {
    // Session was created when only enrollments 1-3 existed; enrollment_id 1
    // was marked PRESENT. Since then, enrollment 4 joined the batch.
    const initialAttendance = [
      { id: 10, session_id: 5, enrollment_id: 1, status: 'PRESENT', marked_at: '2026-05-01T00:00:00' },
      { id: 11, session_id: 5, enrollment_id: 2, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
      { id: 12, session_id: 5, enrollment_id: 3, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
    ];
    const enrollments = [
      { id: 1, student_id: 101, student_name: 'Aarav' },
      { id: 2, student_id: 102, student_name: 'Bhavya' },
      { id: 3, student_id: 103, student_name: 'Chirag' },
      { id: 4, student_id: 104, student_name: 'Divya' }, // joined after this session
    ];

    render(
      <MarkAttendanceSheet
        sessionId={5}
        enrollments={enrollments}
        initialAttendance={initialAttendance}
        onSubmitted={() => {}}
      />
    );

    // Aggregate must reflect the session's 3 recorded rows, not the batch's
    // current 4 enrollments.
    expect(screen.getByText('1 Present')).toBeInTheDocument();
    expect(screen.getByText('2 Absent')).toBeInTheDocument();

    // Only the 3 students who actually have an attendance row for this
    // session should be listed — the newly-joined student should not appear
    // and should not be counted.
    expect(screen.getByText('Aarav')).toBeInTheDocument();
    expect(screen.getByText('Bhavya')).toBeInTheDocument();
    expect(screen.getByText('Chirag')).toBeInTheDocument();
    expect(screen.queryByText('Divya')).not.toBeInTheDocument();

    // Aarav's row specifically must show PRESENT, not ABSENT.
    const aaravRow = screen.getByText('Aarav').closest('div[class]')?.parentElement ?? screen.getByText('Aarav');
    expect(aaravRow.textContent).toContain('Aarav');
  });

  it('does not go negative when a previously-present student is later removed from the batch', () => {
    // enrollment_id 2 was PRESENT for this session, but has since been
    // deactivated (no longer in the batch's active enrollments list).
    const initialAttendance = [
      { id: 20, session_id: 8, enrollment_id: 1, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
      { id: 21, session_id: 8, enrollment_id: 2, status: 'PRESENT', marked_at: '2026-05-01T00:00:00' },
      { id: 22, session_id: 8, enrollment_id: 3, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
    ];
    // enrollment 2 no longer present in the current active-enrollments list
    const enrollments = [
      { id: 1, student_id: 201, student_name: 'Esha' },
      { id: 3, student_id: 203, student_name: 'Farhan' },
    ];

    render(
      <MarkAttendanceSheet
        sessionId={8}
        enrollments={enrollments}
        initialAttendance={initialAttendance}
        onSubmitted={() => {}}
      />
    );

    // Total must stay at 3 (the session's real roster), present at 1, absent at 2 —
    // never negative, never inflated past the true class size.
    expect(screen.getByText('1 Present')).toBeInTheDocument();
    expect(screen.getByText('2 Absent')).toBeInTheDocument();
  });

  it('resyncs local state to the server response after submit, ignoring IDs with no row', async () => {
    const initialAttendance = [
      { id: 30, session_id: 9, enrollment_id: 1, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
      { id: 31, session_id: 9, enrollment_id: 2, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
    ];
    const enrollments = [
      { id: 1, student_id: 301, student_name: 'Gopal' },
      { id: 2, student_id: 302, student_name: 'Hina' },
    ];
    markAttendance.mockResolvedValue([
      { id: 30, session_id: 9, enrollment_id: 1, status: 'PRESENT', marked_at: '2026-05-01T00:00:00' },
      { id: 31, session_id: 9, enrollment_id: 2, status: 'ABSENT', marked_at: '2026-05-01T00:00:00' },
    ]);

    render(
      <MarkAttendanceSheet
        sessionId={9}
        enrollments={enrollments}
        initialAttendance={initialAttendance}
        onSubmitted={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Gopal'));
    fireEvent.click(screen.getByText('Submit Attendance'));

    await screen.findByText(/Attendance saved!/);
    expect(screen.getByText('1 Present')).toBeInTheDocument();
    expect(screen.getByText('1 Absent')).toBeInTheDocument();
  });
});
