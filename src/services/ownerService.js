/**
 * ownerService.js — API service layer for all owner-facing operations.
 *
 * Wraps api.js (the shared axios instance with Supabase JWT interceptor).
 * All functions correspond to BatchBook backend endpoints.
 */

import api from './api';

// ─── Batch API (/batch/*) ─────────────────────────────────────────────────────

export async function getBatches() {
  const { data } = await api.get('/batch/');
  return data;
}

export async function createBatch(batchData) {
  const { data } = await api.post('/batch/', batchData);
  return data;
}

export async function getBatch(batchId) {
  const { data } = await api.get(`/batch/${batchId}`);
  return data;
}

export async function updateBatch(batchId, updates) {
  const { data } = await api.patch(`/batch/${batchId}`, updates);
  return data;
}

export async function deleteBatch(batchId) {
  await api.delete(`/batch/${batchId}`);
}

// ─── Enrollment API (/enrollment/*) ──────────────────────────────────────────

export async function getEnrollmentsByBatch(batchId) {
  const { data } = await api.get(`/enrollment/batch/${batchId}`);
  return data;
}

export async function enrollStudent(enrollmentData) {
  const { data } = await api.post('/enrollment/', enrollmentData);
  return data;
}

export async function updateEnrollment(enrollmentId, updates) {
  const { data } = await api.patch(`/enrollment/${enrollmentId}`, updates);
  return data;
}

export async function removeEnrollment(enrollmentId) {
  await api.delete(`/enrollment/${enrollmentId}`);
}

// ─── Student API (/student/*) ─────────────────────────────────────────────────

export async function createStudent(studentData) {
  const { data } = await api.post('/student/', studentData);
  return data;
}

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

/**
 * Get the institute-wide fee dashboard for a given month.
 * @param {string} month - "YYYY-MM"
 * @returns {Promise<FeeDashboardResponse>}
 */
export async function getFeeDashboard(month) {
  const { data } = await api.get('/fee/dashboard', { params: { month } });
  return data;
}

/**
 * Get fee records for all students in a batch for a given month.
 * @param {number} batchId
 * @param {string} month - "YYYY-MM"
 * @returns {Promise<FeeRecordResponse[]>}
 */
export async function getBatchFees(batchId, month) {
  const { data } = await api.get(`/fee/batch/${batchId}`, { params: { month } });
  return data;
}

/**
 * Get the fee structure for a batch (monthly amount).
 * Throws 404 if no structure exists yet.
 * @param {number} batchId
 * @returns {Promise<FeeStructureResponse>}
 */
export async function getFeeStructure(batchId) {
  const { data } = await api.get(`/fee/structure/${batchId}`);
  return data;
}

/**
 * Set or overwrite the monthly fee amount for a batch.
 * @param {number} batchId
 * @param {number} monthlyAmount
 * @returns {Promise<FeeStructureResponse>}
 */
export async function setupFeeStructure(batchId, monthlyAmount) {
  const { data } = await api.post('/fee/structure', {
    batch_id: batchId,
    monthly_amount: monthlyAmount,
  });
  return data;
}

/**
 * Generate one FeeRecord per active enrolled student for the given month.
 * Idempotent — students who already have a record are skipped.
 * @param {number} batchId
 * @param {string} month - "YYYY-MM"
 * @returns {Promise<FeeRecordResponse[]>}
 */
export async function generateMonthlyRecords(batchId, month) {
  const { data } = await api.post(`/fee/generate/${batchId}`, null, {
    params: { month },
  });
  return data;
}

/**
 * Record a payment against a fee record.
 * Status is derived automatically: 0 → NOT_PAID, partial → PARTIALLY_PAID, full → FULLY_PAID.
 * @param {number} recordId
 * @param {number} amountPaid
 * @param {string|null} reference
 * @returns {Promise<FeeRecordResponse>}
 */
export async function markPayment(recordId, amountPaid, reference) {
  const { data } = await api.patch(`/fee/record/${recordId}/pay`, {
    amount_paid: amountPaid,
    reference: reference ?? null,
  });
  return data;
}
