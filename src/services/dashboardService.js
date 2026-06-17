// ─── BatchBook Dashboard Service ────────────────────────────────────────────
// Calls real backend APIs for all student-facing data.
// Auth is handled by api.js (Supabase JWT attached automatically).
// student_id is read from localStorage (set after parent OTP verification).

import api from './api';

const CURRENT_MONTH = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const TODAY = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function getStoredStudentId() {
  return localStorage.getItem('bb_student_id');
}

export function getStoredStudentName() {
  return localStorage.getItem('bb_student_name');
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export async function getStudentProfile() {
  const [parentRes, attendanceItems] = await Promise.all([
    api.get('/parent/me'),
    getAttendance(),
  ]);

  const parent = parentRes.data;
  const studentId = parseInt(getStoredStudentId(), 10);
  const child = parent.children?.find((c) => c.id === studentId) ?? parent.children?.[0];

  const name = child?.name ?? parent.name ?? 'Student';
  const initials = name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  const feeRecords = await getFeeStatus();
  const hasUnpaidFee = feeRecords.some(
    (f) => f.status === 'NOT_PAID' || f.status === 'PARTIALLY_PAID',
  );
  const paymentLink =
    feeRecords.find(
      (f) => (f.status === 'NOT_PAID' || f.status === 'PARTIALLY_PAID') && f.payment_link,
    )?.payment_link ?? null;

  const batchNames = attendanceItems.items?.map((a) => a.batch_name) ?? [];
  const subjects = attendanceItems.items?.map((a) => a.subject) ?? [];

  return {
    id: studentId,
    name,
    initials,
    phone: parent.phone_number ? `+91 ${parent.phone_number}` : '',
    institute: '',
    enrolledYear: new Date().getFullYear().toString(),
    batch: batchNames[0] ?? '',
    subjects: [...new Set(subjects)],
    feeDue: hasUnpaidFee,
    paymentLink,
    avatarUrl: null,
  };
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function getAttendance(month = CURRENT_MONTH()) {
  const studentId = getStoredStudentId();
  if (!studentId) return { present: 0, total: 0, streak: 0, month: '', items: [] };

  const { data } = await api.get('/student/me/attendance', {
    params: { student_id: studentId, month },
  });

  const totalPresent = data.reduce((sum, item) => sum + item.present, 0);
  const totalSessions = data.reduce((sum, item) => sum + item.total, 0);

  const monthLabel = new Date(`${month}-01`).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return {
    present: totalPresent,
    total: totalSessions,
    streak: 0,
    month: monthLabel,
    items: data,
  };
}

// ─── Fee Status ───────────────────────────────────────────────────────────────

export async function getFeeStatus(month = CURRENT_MONTH()) {
  const studentId = getStoredStudentId();
  if (!studentId) return [];

  const { data } = await api.get('/student/me/fee', {
    params: { student_id: studentId, month },
  });

  return data;
}

// ─── Upcoming Events ──────────────────────────────────────────────────────────

export async function getUpcomingEvents(limit = 10) {
  const studentId = getStoredStudentId();
  if (!studentId) return [];

  const { data } = await api.get('/student/me/upcoming-events', {
    params: { student_id: studentId, limit },
  });

  const today = TODAY();
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return data.map((event) => {
    const isoDate = event.date;
    let day;
    if (isoDate === today) {
      day = 'Today';
    } else if (isoDate === tomorrow) {
      day = 'Tomorrow';
    } else {
      day = new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }

    const startFmt = event.start_time
      ? new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';

    return {
      id: event.session_id,
      type: 'class',
      label: event.batch_name,
      day,
      time: startFmt,
      sub: event.topic ?? event.subject,
    };
  });
}

// ─── Unread notification count (not yet backed by real API) ──────────────────

export async function getUnreadNotificationCount() {
  return 0;
}

// ─── Today's Schedule ─────────────────────────────────────────────────────────

export async function getTodaySchedule() {
  const studentId = getStoredStudentId();
  if (!studentId) return [];

  const { data } = await api.get('/student/me/schedule', {
    params: { student_id: studentId, date: TODAY() },
  });

  return data.map((s) => {
    const startFmt = s.start_time
      ? new Date(`1970-01-01T${s.start_time}`).toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';
    const endFmt = s.end_time
      ? new Date(`1970-01-01T${s.end_time}`).toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';
    return {
      id: s.session_id,
      subject: s.subject,
      batchName: s.batch_name,
      time: startFmt && endFmt ? `${startFmt}–${endFmt}` : startFmt,
      topic: s.topic ?? '',
      attendanceStatus: s.attendance_status,
    };
  });
}
