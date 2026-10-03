// ===================================================
// eCours — Client-side Data Store (localStorage)
// ===================================================
// This module provides a simple CRUD interface backed by localStorage.
// It serves as the primary data layer for the teacher dashboard.

import type { Group, Student, Session, AttendanceRecord, StudentPayment, ParentNotification } from './types';

const KEYS = {
  teachers: 'ecours_teachers',
  groups: 'ecours_teacher_groups',
  students: 'ecours_students',
  sessions: 'ecours_sessions',
  attendance: 'ecours_attendance',
  payments: 'ecours_student_payments',
  notifications: 'ecours_notifications',
} as const;

function get<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// ── Teachers ─────────────────────────────────────────
export const teachersStore = {
  getAll: () => get<any>(KEYS.teachers), // using any to avoid circular import if Teacher isn't fully updated yet, but we will import it properly
  getById: (id: string) => get<any>(KEYS.teachers).find(t => t.id === id),
  add: (teacher: any) => {
    const all = get<any>(KEYS.teachers);
    set(KEYS.teachers, [teacher, ...all]);
  },
  update: (id: string, updates: any) => {
    const all = get<any>(KEYS.teachers).map(t => t.id === id ? { ...t, ...updates } : t);
    set(KEYS.teachers, all);
  },
  remove: (id: string) => {
    set(KEYS.teachers, get<any>(KEYS.teachers).filter(t => t.id !== id));
  }
};

// ── Groups ──────────────────────────────────────────
export const groupsStore = {
  getAll: (): Group[] => get<Group>(KEYS.groups),

  getById: (id: string): Group | undefined =>
    get<Group>(KEYS.groups).find(g => g.id === id),

  add: (group: Group): void => {
    const all = get<Group>(KEYS.groups);
    set(KEYS.groups, [group, ...all]);
  },

  update: (id: string, updates: Partial<Group>): void => {
    const all = get<Group>(KEYS.groups).map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    set(KEYS.groups, all);
  },

  remove: (id: string): void => {
    set(KEYS.groups, get<Group>(KEYS.groups).filter(g => g.id !== id));
    // Also remove associated students, sessions, attendance, payments
    set(KEYS.students, get<Student>(KEYS.students).filter(s => s.groupId !== id));
    const sessionIds = get<Session>(KEYS.sessions).filter(s => s.groupId === id).map(s => s.id);
    set(KEYS.sessions, get<Session>(KEYS.sessions).filter(s => s.groupId !== id));
    set(KEYS.attendance, get<AttendanceRecord>(KEYS.attendance).filter(a => !sessionIds.includes(a.sessionId)));
  },

  recalculateStudentCount: (groupId: string): void => {
    const count = get<Student>(KEYS.students).filter(s => s.groupId === groupId).length;
    groupsStore.update(groupId, { studentCount: count });
  },
};

// ── Students ────────────────────────────────────────
export const studentsStore = {
  getAll: (): Student[] => get<Student>(KEYS.students),

  getById: (id: string): Student | undefined =>
    get<Student>(KEYS.students).find(s => s.id === id),

  getByGroup: (groupId: string): Student[] =>
    get<Student>(KEYS.students).filter(s => s.groupId === groupId),

  getByQr: (qrCode: string): Student | undefined =>
    get<Student>(KEYS.students).find(s => s.qrCode === qrCode),

  add: (student: Student): void => {
    const all = get<Student>(KEYS.students);
    set(KEYS.students, [student, ...all]);
    groupsStore.recalculateStudentCount(student.groupId);
  },

  update: (id: string, updates: Partial<Student>): void => {
    const all = get<Student>(KEYS.students).map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    set(KEYS.students, all);
  },

  remove: (id: string): void => {
    const student = studentsStore.getById(id);
    set(KEYS.students, get<Student>(KEYS.students).filter(s => s.id !== id));
    // Remove associated attendance and payments
    set(KEYS.attendance, get<AttendanceRecord>(KEYS.attendance).filter(a => a.studentId !== id));
    set(KEYS.payments, get<StudentPayment>(KEYS.payments).filter(p => p.studentId !== id));
    if (student) groupsStore.recalculateStudentCount(student.groupId);
  },
};

// ── Sessions ────────────────────────────────────────
export const sessionsStore = {
  getAll: (): Session[] => get<Session>(KEYS.sessions),

  getByGroup: (groupId: string): Session[] =>
    get<Session>(KEYS.sessions).filter(s => s.groupId === groupId),

  add: (session: Session): void => {
    const all = get<Session>(KEYS.sessions);
    set(KEYS.sessions, [session, ...all]);
  },

  update: (id: string, updates: Partial<Session>): void => {
    const all = get<Session>(KEYS.sessions).map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    set(KEYS.sessions, all);
  },

  getById: (id: string): Session | undefined =>
    get<Session>(KEYS.sessions).find(s => s.id === id),
};

// ── Attendance ──────────────────────────────────────
export const attendanceStore = {
  getAll: (): AttendanceRecord[] => get<AttendanceRecord>(KEYS.attendance),

  getBySession: (sessionId: string): AttendanceRecord[] =>
    get<AttendanceRecord>(KEYS.attendance).filter(a => a.sessionId === sessionId),

  getByStudent: (studentId: string): AttendanceRecord[] =>
    get<AttendanceRecord>(KEYS.attendance).filter(a => a.studentId === studentId),

  add: (record: AttendanceRecord): void => {
    const all = get<AttendanceRecord>(KEYS.attendance);
    // Prevent duplicates for same session + student
    const exists = all.find(a => a.sessionId === record.sessionId && a.studentId === record.studentId);
    if (exists) return;
    set(KEYS.attendance, [record, ...all]);

    // Update student stats
    const student = studentsStore.getById(record.studentId);
    if (student) {
      if (record.status === 'present' || record.status === 'late') {
        studentsStore.update(record.studentId, { totalPresences: student.totalPresences + 1 });
      } else {
        studentsStore.update(record.studentId, { totalAbsences: student.totalAbsences + 1 });
      }
    }

    // Update session counts
    const sessionRecords = attendanceStore.getBySession(record.sessionId);
    const session = sessionsStore.getById(record.sessionId);
    if (session) {
      sessionsStore.update(record.sessionId, {
        presentCount: sessionRecords.filter(r => r.status === 'present' || r.status === 'late').length,
        absentCount: sessionRecords.filter(r => r.status === 'absent').length,
      });
    }
  },

  updateStatus: (id: string, status: AttendanceRecord['status']): void => {
    const all = get<AttendanceRecord>(KEYS.attendance).map(a =>
      a.id === id ? { ...a, status } : a
    );
    set(KEYS.attendance, all);
  },
};

// ── Payments ────────────────────────────────────────
export const paymentsStore = {
  getAll: (): StudentPayment[] => get<StudentPayment>(KEYS.payments),

  getByStudent: (studentId: string): StudentPayment[] =>
    get<StudentPayment>(KEYS.payments).filter(p => p.studentId === studentId),

  getByGroup: (groupId: string): StudentPayment[] =>
    get<StudentPayment>(KEYS.payments).filter(p => p.groupId === groupId),

  add: (payment: StudentPayment): void => {
    const all = get<StudentPayment>(KEYS.payments);
    set(KEYS.payments, [payment, ...all]);
  },

  remove: (id: string): void => {
    set(KEYS.payments, get<StudentPayment>(KEYS.payments).filter(p => p.id !== id));
  },
};

// ── Notifications ───────────────────────────────────
export const notificationsStore = {
  getAll: (): ParentNotification[] => get<ParentNotification>(KEYS.notifications),

  add: (notification: ParentNotification): void => {
    const all = get<ParentNotification>(KEYS.notifications);
    set(KEYS.notifications, [notification, ...all]);
  },
};

// ── Mock Data Seeder ────────────────────────────────
export const seedMockData = () => {
  if (get(KEYS.teachers).length > 0) return; // Only seed if empty

  const now = new Date().toISOString();
  const currentMonth = now.slice(0, 7); // YYYY-MM

  // 1. Create Teachers
  const mockTeachers = [
    { id: 't_1', fullName: 'الأستاذ أحمد', subject: 'رياضيات', phase: 'secondary' as const, email: 'ahmed@ecours.com', createdAt: now },
    { id: 't_2', fullName: 'الأستاذة سارة', subject: 'فيزياء', phase: 'secondary' as const, email: 'sara@ecours.com', createdAt: now },
    { id: 't_3', fullName: 'الأستاذ كريم', subject: 'لغة إنجليزية', phase: 'middle' as const, email: 'karim@ecours.com', createdAt: now },
  ];
  mockTeachers.forEach(t => teachersStore.add(t));

  // 2. Create Groups
  const mockGroups: Group[] = [
    { id: 'g_1', teacherId: 't_1', name: 'الفوج الأول - بكالوريا', level: 'بكالوريا', monthlyPrice: 3000, sessionPrice: 500, studentCount: 0, createdAt: now },
    { id: 'g_2', teacherId: 't_1', name: 'فوج الدعم - 2 ثانوي', level: 'ثانية ثانوي', monthlyPrice: 2500, sessionPrice: 400, studentCount: 0, createdAt: now },
    { id: 'g_3', teacherId: 't_2', name: 'الفوج الأول - BEM', level: 'رابعة متوسط', monthlyPrice: 2500, sessionPrice: 400, studentCount: 0, createdAt: now },
    { id: 'g_4', teacherId: 't_2', name: 'فوج التفوق', level: 'ثالثة متوسط', monthlyPrice: 2000, sessionPrice: 350, studentCount: 0, createdAt: now },
    { id: 'g_5', teacherId: 't_3', name: 'إنجليزية عامة - مبتدئين', level: 'عام', monthlyPrice: 1500, sessionPrice: 300, studentCount: 0, createdAt: now },
  ];
  mockGroups.forEach(g => groupsStore.add(g));

  // 3. Create Students (10 per group)
  const arabicNames = ['محمد', 'أحمد', 'سارة', 'فاطمة', 'ياسين', 'أمينة', 'خالد', 'كريم', 'مريم', 'يوسف', 'عمر', 'علي', 'زينب', 'خديجة', 'بلال'];
  const lastNames = ['بن علي', 'منصور', 'خالد', 'سعيد', 'عبد الله', 'سليمان', 'إبراهيم', 'مصطفى', 'عثمان', 'عبد الرحمن'];
  
  const mockStudents: Student[] = [];
  mockGroups.forEach(group => {
    for (let i = 0; i < 10; i++) {
      const firstName = arabicNames[Math.floor(Math.random() * arabicNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockStudents.push({
        id: `s_${group.id}_${i}`,
        fullName: `${firstName} ${lastName}`,
        groupId: group.id,
        groupName: group.name,
        qrCode: `QR_${group.id}_${i}`,
        parentPhone: `0555${Math.floor(Math.random() * 900000 + 100000)}`,
        totalPresences: Math.floor(Math.random() * 5),
        totalAbsences: Math.floor(Math.random() * 2),
        createdAt: now
      });
    }
  });
  mockStudents.forEach(s => studentsStore.add(s));

  // 4. Create Finances (Payments)
  const mockPayments: StudentPayment[] = [];
  mockStudents.forEach((student, index) => {
    if (index % 3 !== 0) { // 2/3 of students have paid something
      const group = mockGroups.find(g => g.id === student.groupId)!;
      mockPayments.push({
        id: `p_${student.id}`,
        studentId: student.id,
        studentName: student.fullName,
        groupId: student.groupId,
        groupName: student.groupName,
        amount: group.monthlyPrice,
        paymentDate: now.split('T')[0],
        monthCovered: currentMonth,
        method: index % 4 === 0 ? 'ccp' : 'cash'
      });
    }
  });
  mockPayments.forEach(p => paymentsStore.add(p));

  // 5. Create Sessions and Attendance
  mockGroups.forEach(group => {
    const session: Session = {
      id: `ses_${group.id}_1`,
      groupId: group.id,
      groupName: group.name,
      date: now.split('T')[0],
      startedAt: now,
      endedAt: now,
      presentCount: 8,
      absentCount: 2
    };
    sessionsStore.add(session);
    
    // Add attendance for this session
    const groupStudents = mockStudents.filter(s => s.groupId === group.id);
    groupStudents.forEach((student, idx) => {
      attendanceStore.add({
        id: `att_${session.id}_${student.id}`,
        sessionId: session.id,
        studentId: student.id,
        studentName: student.fullName,
        status: idx < 8 ? 'present' : 'absent',
        scannedAt: now
      });
    });
  });

  console.log("Heavy Mock data seeded successfully!");
};
