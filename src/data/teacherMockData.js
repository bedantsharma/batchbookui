export const OWNER = { name: 'Rohan Sharma', initials: 'RS', institute: 'Sharma Classes', city: 'Gurugram' };

export const KPIS = {
  attendanceToday: { value: 89, prev: 84, label: "Today's attendance", suffix: '%' },
  attendanceWeek:  { value: 92, prev: 88, label: 'This week', suffix: '%' },
  feesCollected:   { value: 284500, label: 'Collected this month', currency: true },
  feesPending:     { value: 47200,  label: 'Pending', currency: true, warn: true },
};

export const FEE_HISTORY = [
  { m: 'Nov', collected: 218, target: 260 },
  { m: 'Dec', collected: 246, target: 260 },
  { m: 'Jan', collected: 271, target: 280 },
  { m: 'Feb', collected: 258, target: 280 },
  { m: 'Mar', collected: 295, target: 300 },
  { m: 'Apr', collected: 285, target: 320, partial: true },
];

export const TODAY_SCHEDULE = [
  { time: '8:00',  end: '9:30',  batch: 'Class 10 · Maths A',  room: 'Room 1', students: 24, status: 'done' },
  { time: '10:00', end: '11:30', batch: 'Class 12 · Physics',  room: 'Room 2', students: 18, status: 'live' },
  { time: '12:30', end: '14:00', batch: 'Class 9 · Science',   room: 'Room 1', students: 22, status: 'next' },
  { time: '16:00', end: '17:30', batch: 'Class 10 · Maths B',  room: 'Room 1', students: 26, status: 'upcoming' },
  { time: '18:00', end: '19:30', batch: 'Class 11 · Maths',    room: 'Room 2', students: 19, status: 'upcoming' },
];

export const STUDENTS_AT_RISK = [
  { name: 'Aanya Verma',   cls: 'Class 10', issue: 'attendance', detail: '54% attendance',   batch: 'Maths A',  avatarColor: '#F48FB1' },
  { name: 'Kabir Singh',   cls: 'Class 12', issue: 'fees',       detail: '₹8,400 overdue',   batch: 'Physics',  avatarColor: '#90CAF9' },
  { name: 'Ishaan Kapoor', cls: 'Class 9',  issue: 'both',       detail: '61% · ₹4,200 due', batch: 'Science',  avatarColor: '#FFCC80' },
  { name: 'Rhea Bansal',   cls: 'Class 11', issue: 'attendance', detail: '58% attendance',   batch: 'Maths',    avatarColor: '#A5D6A7' },
  { name: 'Vivaan Mehta',  cls: 'Class 10', issue: 'fees',       detail: '₹6,800 overdue',   batch: 'Maths B',  avatarColor: '#CE93D8' },
];

export const BATCHES = [
  { name: 'Class 10 · Maths A', students: 24, attendance: 94, fees: 96, color: '#BB86FC' },
  { name: 'Class 10 · Maths B', students: 26, attendance: 88, fees: 91, color: '#03DAC6' },
  { name: 'Class 11 · Maths',   students: 19, attendance: 85, fees: 82, color: '#FFAB40' },
  { name: 'Class 12 · Physics', students: 18, attendance: 78, fees: 74, color: '#F48FB1' },
  { name: 'Class 9 · Science',  students: 22, attendance: 91, fees: 88, color: '#80DEEA' },
];

export const RECENT_PAYMENTS = [
  { name: 'Diya Joshi',    amount: 5500, when: '2h ago'   },
  { name: 'Yash Malhotra', amount: 7200, when: '5h ago'   },
  { name: 'Naina Roy',     amount: 6000, when: 'Today'    },
];
