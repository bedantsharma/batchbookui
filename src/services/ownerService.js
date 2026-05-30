/**
 * ownerService.js — API service layer for owner-facing attendance operations.
 *
 * Wraps api.js (the shared axios instance with Supabase JWT interceptor).
 * Functions map to BatchBook backend endpoints under /attendance.
 */

import api from './api';

// ─── Attendance functions ──────────────────────────────────────────────────────

/**
 * Create a class session and pre-populate ABSENT attendance for all active enrollments.
 * @param {{
 *   batch_id: number,
 *   date: string,         // "YYYY-MM-DD"
 *   start_time: string,   // "HH:MM:SS"
 *   end_time: string,
 *   topic?: string|null,
 * }} sessionData
 * @returns {Promise<ClassSessionResponse>}
 */
export async function createSession(sessionData) {
  const { data } = await api.post('/attendance/session', sessionData);
  return data;
}

/**
 * Mark attendance for a session.
 * Supply the enrollment IDs for students who were PRESENT; all others become ABSENT.
 * @param {number} sessionId
 * @param {number[]} presentEnrollmentIds
 * @returns {Promise<AttendanceResponse[]>}
 */
export async function markAttendance(sessionId, presentEnrollmentIds) {
  const { data } = await api.post(`/attendance/session/${sessionId}/mark`, {
    present_enrollment_ids: presentEnrollmentIds,
  });
  return data;
}

/**
 * Get full attendance for a session.
 * @param {number} sessionId
 * @returns {Promise<AttendanceResponse[]>}
 */
export async function getSessionAttendance(sessionId) {
  const { data } = await api.get(`/attendance/session/${sessionId}`);
  return data;
}

/**
 * List all sessions for a batch (ordered by date descending).
 * @param {number} batchId
 * @returns {Promise<ClassSessionResponse[]>}
 */
export async function getBatchSessions(batchId) {
  const { data } = await api.get(`/attendance/batch/${batchId}`);
  return data;
}

/**
 * Monthly attendance summary for a single enrollment.
 * @param {number} enrollmentId
 * @param {string} month - "YYYY-MM"
 * @returns {Promise<{ present: number, total: number, percentage: number }>}
 */
export async function getStudentAttendanceSummary(enrollmentId, month) {
  const { data } = await api.get(`/attendance/student/${enrollmentId}`, {
    params: { month },
  });
  return data;
}

// ─── Batch functions (used by AttendancePage to populate the batch selector) ──

/**
 * Fetch all batches for the authenticated owner's institute.
 * @returns {Promise<BatchResponse[]>}
 */
export async function getBatches() {
  const { data } = await api.get('/batch/');
  return data;
}

/**
 * List all enrollments (active + inactive) for a batch.
 * @param {number} batchId
 * @returns {Promise<EnrollmentResponse[]>}
 */
export async function getEnrollmentsByBatch(batchId) {
  const { data } = await api.get(`/enrollment/batch/${batchId}`);
  return data;
}
