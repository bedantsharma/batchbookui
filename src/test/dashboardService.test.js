import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { handlers: [] },
      response: { handlers: [] },
    },
  },
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

vi.mock('../lib/toastEmitter', () => ({
  toastEmitter: { emit: vi.fn() },
}));

import api from '../services/api';
import {
  getAttendance,
  getFeeStatus,
  getTodaySchedule,
  getUpcomingEvents,
  getStoredStudentId,
} from '../services/dashboardService';

describe('dashboardService — real API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('bb_student_id', '42');
    localStorage.setItem('bb_student_name', 'Test Student');
  });

  afterEach(() => {
    localStorage.removeItem('bb_student_id');
    localStorage.removeItem('bb_student_name');
  });

  it('getStoredStudentId returns the value stored in localStorage', () => {
    expect(getStoredStudentId()).toBe('42');
  });

  it('getStoredStudentId returns null when not set', () => {
    localStorage.removeItem('bb_student_id');
    expect(getStoredStudentId()).toBeNull();
  });

  it('getAttendance calls the right endpoint and returns summary', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ enrollment_id: 1, batch_id: 5, batch_name: 'Maths', subject: 'Maths', present: 18, total: 22, percentage: 81.8 }],
    });

    const result = await getAttendance('2026-05');

    expect(api.get).toHaveBeenCalledWith('/student/me/attendance', {
      params: { student_id: '42', month: '2026-05' },
    });
    expect(result.present).toBe(18);
    expect(result.total).toBe(22);
    expect(result.month).toContain('May');
  });

  it('getAttendance returns zeros when no student id stored', async () => {
    localStorage.removeItem('bb_student_id');
    const result = await getAttendance('2026-05');
    expect(api.get).not.toHaveBeenCalled();
    expect(result.present).toBe(0);
    expect(result.total).toBe(0);
  });

  it('getAttendance aggregates multiple enrollments', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { enrollment_id: 1, batch_id: 5, batch_name: 'Maths', subject: 'Maths', present: 10, total: 12, percentage: 83.3 },
        { enrollment_id: 2, batch_id: 6, batch_name: 'Physics', subject: 'Physics', present: 8, total: 10, percentage: 80.0 },
      ],
    });

    const result = await getAttendance('2026-05');
    expect(result.present).toBe(18);
    expect(result.total).toBe(22);
  });

  it('getFeeStatus calls the right endpoint', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ enrollment_id: 1, batch_id: 5, batch_name: 'Maths', subject: 'Maths', month: '2026-05-01', amount_due: '1500.00', amount_paid: '0', status: 'NOT_PAID', paid_at: null, payment_reference: null, payment_link: null }],
    });

    const result = await getFeeStatus('2026-05');

    expect(api.get).toHaveBeenCalledWith('/student/me/fee', {
      params: { student_id: '42', month: '2026-05' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('NOT_PAID');
  });

  it('getFeeStatus returns empty array when no student id', async () => {
    localStorage.removeItem('bb_student_id');
    const result = await getFeeStatus('2026-05');
    expect(api.get).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('getTodaySchedule calls the right endpoint', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ session_id: 100, batch_id: 5, batch_name: 'Maths', subject: 'Maths', date: '2026-06-02', start_time: '16:00:00', end_time: '17:30:00', topic: 'Algebra', attendance_status: 'PRESENT' }],
    });

    const result = await getTodaySchedule();

    expect(api.get).toHaveBeenCalledWith('/student/me/schedule', expect.objectContaining({
      params: expect.objectContaining({ student_id: '42' }),
    }));
    expect(result).toHaveLength(1);
    expect(result[0].batchName).toBe('Maths');
    expect(result[0].attendanceStatus).toBe('PRESENT');
  });

  it('getTodaySchedule returns empty array when no student id', async () => {
    localStorage.removeItem('bb_student_id');
    const result = await getTodaySchedule();
    expect(api.get).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('getUpcomingEvents calls the right endpoint and formats dates', async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    api.get.mockResolvedValueOnce({
      data: [{ session_id: 200, batch_id: 5, batch_name: 'Chemistry', subject: 'Chemistry', date: todayStr, start_time: '17:00:00', end_time: '18:30:00', topic: 'Organic' }],
    });

    const result = await getUpcomingEvents(5);

    expect(api.get).toHaveBeenCalledWith('/student/me/upcoming-events', {
      params: { student_id: '42', limit: 5 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].day).toBe('Today');
    expect(result[0].label).toBe('Chemistry');
  });

  it('getUpcomingEvents returns empty array when no student id', async () => {
    localStorage.removeItem('bb_student_id');
    const result = await getUpcomingEvents();
    expect(api.get).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
