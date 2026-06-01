/**
 * ownerService.js — API service layer for all owner-facing operations.
 *
 * Wraps api.js (the shared axios instance with Supabase JWT interceptor).
 * All functions correspond to BatchBook backend endpoints under /batch,
 * /enrollment, and /student.
 *
 * Batch API  → /batch/*
 * Enrollment API → /enrollment/*
 * Student API    → /student/*
 */

import api from './api';

// ─── Batch functions ──────────────────────────────────────────────────────────

/**
 * Fetch all batches for the authenticated owner's institute.
 * @returns {Promise<BatchResponse[]>}
 */
export async function getBatches() {
  const { data } = await api.get('/batch/');
  return data;
}

/**
 * Create a new batch for the owner's institute.
 * @param {{
 *   name: string,
 *   subject: string,
 *   grade?: string|null,
 *   start_time: string,   // "HH:MM:SS" or "HH:MM"
 *   end_time: string,
 *   days_of_week: string[],  // ["MON","WED","FRI"]
 *   max_capacity: number,
 *   start_date?: string,  // "YYYY-MM-DD", defaults to today on backend
 *   end_date: string,     // "YYYY-MM-DD"
 * }} batchData
 * @returns {Promise<BatchResponse>}
 */
export async function createBatch(batchData) {
  const { data } = await api.post('/batch/', batchData);
  return data;
}

/**
 * Fetch a single batch by ID.
 * @param {number} batchId
 * @returns {Promise<BatchResponse>}
 */
export async function getBatch(batchId) {
  const { data } = await api.get(`/batch/${batchId}`);
  return data;
}

/**
 * Update batch details (name, subject, timing, capacity, end_date, etc.).
 * Only the fields provided will be updated.
 * @param {number} batchId
 * @param {Partial<BatchResponse>} updates
 * @returns {Promise<BatchResponse>}
 */
export async function updateBatch(batchId, updates) {
  const { data } = await api.patch(`/batch/${batchId}`, updates);
  return data;
}

/**
 * Delete a batch (only succeeds if there are no active enrollments).
 * @param {number} batchId
 * @returns {Promise<void>}
 */
export async function deleteBatch(batchId) {
  await api.delete(`/batch/${batchId}`);
}

// ─── Enrollment functions ─────────────────────────────────────────────────────

/**
 * List all enrollments (active + inactive) for a batch.
 * @param {number} batchId
 * @returns {Promise<EnrollmentResponse[]>}
 */
export async function getEnrollmentsByBatch(batchId) {
  const { data } = await api.get(`/enrollment/batch/${batchId}`);
  return data;
}

/**
 * Enroll a student in a batch.
 * @param {{
 *   student_id: number,
 *   batch_id: number,
 *   due_day?: number,              // 1–28, defaults to today's day-of-month
 *   first_month_amount?: number,   // pro-rated fee for joining month
 * }} enrollmentData
 * @returns {Promise<EnrollmentResponse>}
 */
export async function enrollStudent(enrollmentData) {
  const { data } = await api.post('/enrollment/', enrollmentData);
  return data;
}

/**
 * Update the fee configuration for an enrollment (due_day, first_month_amount).
 * @param {number} enrollmentId
 * @param {{ due_day?: number, first_month_amount?: number }} updates
 * @returns {Promise<EnrollmentResponse>}
 */
export async function updateEnrollment(enrollmentId, updates) {
  const { data } = await api.patch(`/enrollment/${enrollmentId}`, updates);
  return data;
}

/**
 * Soft-delete an enrollment (sets is_active = false).
 * @param {number} enrollmentId
 * @returns {Promise<void>}
 */
export async function removeEnrollment(enrollmentId) {
  await api.delete(`/enrollment/${enrollmentId}`);
}

// ─── Student functions ────────────────────────────────────────────────────────

/**
 * Create a new student record.
 * Call this before enrollStudent() when adding a brand-new student.
 *
 * The backend POST /student/ endpoint creates a student directly (admin use).
 * Fields: name (required), phone_number (required), email (optional).
 *
 * @param {{
 *   name: string,
 *   phone_number: string,
 *   email?: string,
 * }} studentData
 * @returns {Promise<StudentResponse>}
 */
export async function createStudent(studentData) {
  const { data } = await api.post('/student/', studentData);
  return data;
}

/**
 * Convenience: create a student record and immediately enroll them in a batch.
 *
 * @param {{
 *   name: string,
 *   phone_number: string,
 *   email?: string,
 *   batch_id: number,
 *   due_day?: number,
 *   first_month_amount?: number,
 * }} params
 * @returns {Promise<{ student: StudentResponse, enrollment: EnrollmentResponse }>}
 */
export async function addStudentAndEnroll({
  name,
  phone_number,
  email,
  batch_id,
  due_day,
  first_month_amount,
}) {
  const student = await createStudent({ name, phone_number, email });
  const enrollment = await enrollStudent({
    student_id: student.id,
    batch_id,
    due_day,
    first_month_amount: first_month_amount != null ? Number(first_month_amount) : undefined,
  });
  return { student, enrollment };
}

// ─── Fee API (/fee/*) ─────────────────────────────────────────────────────────

/** @param {string} month - "YYYY-MM" */
export async function getFeeDashboard(month) {
  const { data } = await api.get('/fee/dashboard', { params: { month } });
  return data;
}

/** @param {number} batchId @param {string} month - "YYYY-MM" */
export async function getBatchFees(batchId, month) {
  const { data } = await api.get(`/fee/batch/${batchId}`, { params: { month } });
  return data;
}

/** @param {number} batchId */
export async function getFeeStructure(batchId) {
  const { data } = await api.get(`/fee/structure/${batchId}`);
  return data;
}

/** @param {number} batchId @param {number} monthlyAmount */
export async function setupFeeStructure(batchId, monthlyAmount) {
  const { data } = await api.post('/fee/structure', {
    batch_id: batchId,
    monthly_amount: monthlyAmount,
  });
  return data;
}

/** @param {number} batchId @param {string} month - "YYYY-MM" */
export async function generateMonthlyRecords(batchId, month) {
  const { data } = await api.post(`/fee/generate/${batchId}`, null, { params: { month } });
  return data;
}

/** @param {number} recordId @param {number} amountPaid @param {string|null} reference */
export async function markPayment(recordId, amountPaid, reference) {
  const { data } = await api.patch(`/fee/record/${recordId}/pay`, {
    amount_paid: amountPaid,
    reference: reference ?? null,
  });
  return data;
}
