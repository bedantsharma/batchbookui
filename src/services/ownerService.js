/**
 * ownerService.js — API service layer for owner-facing operations.
 *
 * Wraps api.js (the shared axios instance with Supabase JWT interceptor).
 * Covers batch lookup, enrollment lookup, and test score management.
 */

import api from './api';

// ─── Batch ────────────────────────────────────────────────────────────────────

export async function getBatches() {
  const { data } = await api.get('/batch/');
  return data;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export async function getEnrollmentsByBatch(batchId) {
  const { data } = await api.get(`/enrollment/batch/${batchId}`);
  return data;
}

// ─── Test scores ──────────────────────────────────────────────────────────────

/**
 * Fetch all test scores for a student's enrollment.
 * Response includes a `needs_attention` flag (true when last-3 avg < 60%).
 * @param {number} enrollmentId
 * @returns {Promise<{ enrollment_id: number, scores: TestScore[], needs_attention: boolean }>}
 */
export async function getStudentScores(enrollmentId) {
  const { data } = await api.get(`/scores/student/${enrollmentId}`);
  return data;
}

/**
 * Record a test score for a student.
 * @param {{
 *   enrollment_id: number,
 *   test_name: string,
 *   subject: string,
 *   date: string,          // "YYYY-MM-DD"
 *   max_marks: number,
 *   obtained_marks: number,
 * }} scoreData
 * @returns {Promise<TestScore>}
 */
export async function createTestScore(scoreData) {
  const { data } = await api.post('/scores/', scoreData);
  return data;
}
