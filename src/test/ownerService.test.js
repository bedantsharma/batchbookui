/**
 * ownerService.test.js — unit tests for the ownerService API service layer.
 *
 * All axios calls go through the `api` module which is mocked here.
 * We test that each service function:
 *   1. Calls the right HTTP method + path
 *   2. Passes the right payload
 *   3. Returns the response data
 *   4. Propagates errors from the API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock api.js ──────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../services/api';
import {
  getBatches,
  createBatch,
  getBatch,
  updateBatch,
  deleteBatch,
  getEnrollmentsByBatch,
  enrollStudent,
  updateEnrollment,
  removeEnrollment,
  createStudent,
  addStudentAndEnroll,
} from '../services/ownerService';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BATCH = {
  id: 1,
  institute_id: 1,
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
  created_at: '2026-01-01T00:00:00',
};

const ENROLLMENT = {
  id: 1,
  student_id: 5,
  batch_id: 1,
  enrolled_at: '2026-05-01T00:00:00',
  is_active: true,
  due_day: 5,
  first_month_amount: '750.00',
  created_at: '2026-05-01T00:00:00',
};

const STUDENT = {
  id: 5,
  name: 'Rahul Sharma',
  phone_number: '9876543210',
  fees_status: 'NOT_PAID',
};

describe('ownerService — batch functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getBatches() calls GET /batch/ and returns data', async () => {
    api.get.mockResolvedValue({ data: [BATCH] });
    const result = await getBatches();
    expect(api.get).toHaveBeenCalledWith('/batch/');
    expect(result).toEqual([BATCH]);
  });

  it('createBatch() calls POST /batch/ with the payload', async () => {
    api.post.mockResolvedValue({ data: BATCH });
    const payload = {
      name: 'Class 10 Maths',
      subject: 'Mathematics',
      grade: '10',
      start_time: '16:00',
      end_time: '17:00',
      days_of_week: ['MON', 'WED', 'FRI'],
      max_capacity: 30,
      start_date: '2026-05-27',
      end_date: '2026-12-31',
    };
    const result = await createBatch(payload);
    expect(api.post).toHaveBeenCalledWith('/batch/', payload);
    expect(result).toEqual(BATCH);
  });

  it('getBatch() calls GET /batch/:id', async () => {
    api.get.mockResolvedValue({ data: BATCH });
    const result = await getBatch(1);
    expect(api.get).toHaveBeenCalledWith('/batch/1');
    expect(result).toEqual(BATCH);
  });

  it('updateBatch() calls PATCH /batch/:id with updates', async () => {
    const updated = { ...BATCH, name: 'Updated Batch' };
    api.patch.mockResolvedValue({ data: updated });
    const result = await updateBatch(1, { name: 'Updated Batch' });
    expect(api.patch).toHaveBeenCalledWith('/batch/1', { name: 'Updated Batch' });
    expect(result).toEqual(updated);
  });

  it('deleteBatch() calls DELETE /batch/:id', async () => {
    api.delete.mockResolvedValue({});
    await deleteBatch(1);
    expect(api.delete).toHaveBeenCalledWith('/batch/1');
  });

  it('getBatches() propagates API errors', async () => {
    const err = new Error('Network Error');
    api.get.mockRejectedValue(err);
    await expect(getBatches()).rejects.toThrow('Network Error');
  });
});

describe('ownerService — enrollment functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getEnrollmentsByBatch() calls GET /enrollment/batch/:id', async () => {
    api.get.mockResolvedValue({ data: [ENROLLMENT] });
    const result = await getEnrollmentsByBatch(1);
    expect(api.get).toHaveBeenCalledWith('/enrollment/batch/1');
    expect(result).toEqual([ENROLLMENT]);
  });

  it('enrollStudent() calls POST /enrollment/ with the payload', async () => {
    api.post.mockResolvedValue({ data: ENROLLMENT });
    const payload = { student_id: 5, batch_id: 1, due_day: 5, first_month_amount: 750 };
    const result = await enrollStudent(payload);
    expect(api.post).toHaveBeenCalledWith('/enrollment/', payload);
    expect(result).toEqual(ENROLLMENT);
  });

  it('updateEnrollment() calls PATCH /enrollment/:id', async () => {
    api.patch.mockResolvedValue({ data: { ...ENROLLMENT, due_day: 10 } });
    const result = await updateEnrollment(1, { due_day: 10 });
    expect(api.patch).toHaveBeenCalledWith('/enrollment/1', { due_day: 10 });
    expect(result.due_day).toBe(10);
  });

  it('removeEnrollment() calls DELETE /enrollment/:id', async () => {
    api.delete.mockResolvedValue({});
    await removeEnrollment(1);
    expect(api.delete).toHaveBeenCalledWith('/enrollment/1');
  });
});

describe('ownerService — student functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createStudent() calls POST /student/ with the payload', async () => {
    api.post.mockResolvedValue({ data: STUDENT });
    const result = await createStudent({ name: 'Rahul Sharma', phone_number: '9876543210' });
    expect(api.post).toHaveBeenCalledWith('/student/', {
      name: 'Rahul Sharma',
      phone_number: '9876543210',
    });
    expect(result).toEqual(STUDENT);
  });

  it('addStudentAndEnroll() creates student then enrolls them', async () => {
    api.post
      .mockResolvedValueOnce({ data: STUDENT })     // createStudent
      .mockResolvedValueOnce({ data: ENROLLMENT }); // enrollStudent

    const result = await addStudentAndEnroll({
      name: 'Rahul Sharma',
      phone_number: '9876543210',
      batch_id: 1,
      due_day: 5,
      first_month_amount: 750,
    });

    // First call: create student
    expect(api.post).toHaveBeenNthCalledWith(1, '/student/', {
      name: 'Rahul Sharma',
      phone_number: '9876543210',
      email: undefined,
    });

    // Second call: enroll student
    expect(api.post).toHaveBeenNthCalledWith(2, '/enrollment/', {
      student_id: 5,
      batch_id: 1,
      due_day: 5,
      first_month_amount: 750,
    });

    expect(result.student).toEqual(STUDENT);
    expect(result.enrollment).toEqual(ENROLLMENT);
  });

  it('addStudentAndEnroll() passes undefined for first_month_amount when null', async () => {
    api.post
      .mockResolvedValueOnce({ data: STUDENT })
      .mockResolvedValueOnce({ data: ENROLLMENT });

    await addStudentAndEnroll({
      name: 'Test',
      phone_number: '9999999999',
      batch_id: 2,
      due_day: 1,
      first_month_amount: null,
    });

    expect(api.post).toHaveBeenNthCalledWith(2, '/enrollment/', {
      student_id: 5,
      batch_id: 2,
      due_day: 1,
      first_month_amount: undefined,
    });
  });

  it('addStudentAndEnroll() propagates error if createStudent fails', async () => {
    const err = new Error('Duplicate phone');
    api.post.mockRejectedValue(err);

    await expect(
      addStudentAndEnroll({ name: 'X', phone_number: '1234567890', batch_id: 1 })
    ).rejects.toThrow('Duplicate phone');

    // enrollStudent should NOT have been called
    expect(api.post).toHaveBeenCalledOnce();
  });
});
