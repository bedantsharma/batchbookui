// batchbookui/src/services/dashboardService.js
import api from './api';

const getStudentId = () => {
  const id = localStorage.getItem('bb_student_id');
  if (!id) throw new Error('No student session. Please log in again.');
  return Number(id);
};

const todayIso = () => new Date().toISOString().split('T')[0];
const currentMonthIso = () => new Date().toISOString().substring(0, 7);

export async function getStudentProfile() {
  const { data } = await api.get('/parent/me');
  const child = data.children?.[0] ?? null;
  return {
    id: child?.id ?? null,
    name: child?.name ?? data.name ?? 'Student',
    initials: ((child?.name ?? data.name) || '?').charAt(0).toUpperCase(),
    phone: data.phone_number,
    feeDue: child?.fees_status === 'NOT_PAID' || child?.fees_status === 'PARTIALLY_PAID',
    avatarUrl: null,
  };
}

export async function getAttendance() {
  const studentId = getStudentId();
  const month = currentMonthIso();
  const { data } = await api.get('/student/me/attendance', {
    params: { student_id: studentId, month },
  });
  const totalPresent = data.reduce((s, b) => s + b.present, 0);
  const totalSessions = data.reduce((s, b) => s + b.total, 0);
  return {
    present: totalPresent,
    total: totalSessions,
    streak: 0,
    month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    batches: data,
  };
}

export async function getUpcomingEvents() {
  const studentId = getStudentId();
  const { data } = await api.get('/student/me/upcoming-events', {
    params: { student_id: studentId, limit: 10 },
  });
  return data.map(e => ({
    id: e.session_id,
    type: 'class',
    label: e.subject,
    day: new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    }),
    time: e.start_time.substring(0, 5),
    sub: e.batch_name,
    topic: e.topic ?? '',
  }));
}

export async function getTodaySchedule() {
  const studentId = getStudentId();
  const { data } = await api.get('/student/me/schedule', {
    params: { student_id: studentId, date: todayIso() },
  });
  return data.map(s => ({
    id: s.session_id,
    batchName: s.batch_name,
    subject: s.subject,
    time: `${s.start_time.substring(0, 5)}–${s.end_time.substring(0, 5)}`,
    topic: s.topic ?? '',
    attendanceStatus: s.attendance_status,
  }));
}

export async function getUnreadNotificationCount() {
  return 0;
}
