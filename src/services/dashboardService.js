// ─── BatchBook Dashboard Service ───────────────────────────────────────────
// All functions are async and return mock data.
// Replace each function body with the real API call when the backend is ready.
// Suggested base URL pattern: /api/v1/students/{studentId}/<resource>

const MOCK_DELAY = 300;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Student Profile ──────────────────────────────────────────────────────────
/**
 * Fetch logged-in student's profile.
 * TODO: GET /api/v1/students/me
 */
export async function getStudentProfile() {
  await delay(MOCK_DELAY);
  return {
    id:          'stu_001',
    name:        'Bedant Sharma',
    initials:    'BS',
    phone:       '+91 98765 43210',
    institute:   'Allen Career Institute',
    enrolledYear:'2024',
    batch:       'Science Batch B',           // TODO: from API
    subjects:    ['Physics', 'Chemistry', 'Maths'], // TODO: from API
    feeDue:      false,                       // TODO: from API — true shows fee alert
    avatarUrl:   null,
  };
}

// ─── Attendance ───────────────────────────────────────────────────────────────
/**
 * Fetch student's attendance for the current month.
 * TODO: GET /api/v1/students/me/attendance?month=<YYYY-MM>
 */
export async function getAttendance() {
  await delay(MOCK_DELAY);
  return {
    present: 19,       // TODO: from API
    total:   23,       // TODO: from API
    streak:  7,        // TODO: from API — consecutive days attended
    month:   'May 2026', // TODO: derive from API response date
  };
}

// ─── Upcoming Events ──────────────────────────────────────────────────────────
/**
 * Fetch upcoming classes, tests, and holidays for the student.
 * TODO: GET /api/v1/students/me/events?limit=10
 *
 * Event types: 'class' | 'test' | 'holiday'
 * `day` values: 'Today' | 'Tomorrow' | 'Wed, 7 May' | etc.
 */
export async function getUpcomingEvents() {
  await delay(MOCK_DELAY);
  return [
    { id: 1, type: 'class',   label: 'Physics',        day: 'Today',     time: '5:00 PM',  sub: 'Electrostatics' },
    { id: 2, type: 'class',   label: 'Chemistry',      day: 'Tomorrow',  time: '4:00 PM',  sub: 'Organic Rxns' },
    { id: 3, type: 'test',    label: 'Maths Test',     day: 'Wed, 7 May',time: '3:30 PM',  sub: 'Calculus unit 2' },
    { id: 4, type: 'holiday', label: 'No class',       day: 'Thu, 8 May',time: 'All day',  sub: 'Eid holiday' },
    { id: 5, type: 'test',    label: 'Chemistry Test', day: 'Fri, 9 May',time: '4:00 PM',  sub: 'Organic chapter' },
  ];
}

// ─── Notifications (unread count) ─────────────────────────────────────────────
/**
 * TODO: GET /api/v1/students/me/notifications/unread-count
 */
export async function getUnreadNotificationCount() {
  await delay(MOCK_DELAY / 2);
  return 3;
}

// ─── Schedule (full timetable) ────────────────────────────────────────────────
/**
 * TODO: GET /api/v1/students/me/schedule?date=<YYYY-MM-DD>
 */
export async function getTodaySchedule() {
  await delay(MOCK_DELAY);
  return [
    { id: 'ses_001', batchName: 'Physics',   time: '5:00–6:30 PM',  room: 'Room 4A' },
    { id: 'ses_002', batchName: 'Chemistry', time: '4:00–5:30 PM',  room: 'Room 2B' },
  ];
}
