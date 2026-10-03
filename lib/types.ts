// ===================================================
// eCours — Core Data Types
// ===================================================

export interface Teacher {
  id: string;
  fullName: string;
  subject: string;           // The single subject this teacher teaches
  phase: 'primary' | 'middle' | 'secondary'; // Educational phase
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  teacherId: string;         // Link to the teacher
  teacherName?: string;      // Teacher full name
  name: string;
  level: string;
  monthlyPrice: number;
  sessionPrice: number;
  studentCount: number;
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  parentPhone: string;
  groupId: string;
  groupName: string;
  qrCode: string;           // Unique QR identifier
  totalAbsences: number;
  totalPresences: number;
  createdAt: string;
}

export interface Session {
  id: string;
  groupId: string;
  groupName: string;
  date: string;              // ISO date string
  startedAt: string;
  endedAt?: string;
  presentCount: number;
  absentCount: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late';
  scannedAt?: string;
  note?: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  amount: number;
  monthCovered: string;      // e.g. "2026-08"
  paymentDate: string;
  method: 'cash' | 'ccp';
}

export interface ParentNotification {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  absenceCount: number;
  message: string;
  sentAt: string;
  sentVia: 'whatsapp' | 'sms' | 'copied';
}

// Helper type for debt tracking
export interface StudentDebt {
  student: Student;
  groupName: string;
  monthlyPrice: number;
  totalDue: number;          // Total amount owed
  totalPaid: number;         // Total amount paid
  balance: number;           // totalDue - totalPaid (positive = owes money)
  status: 'paid' | 'partial' | 'unpaid';
}

// Dashboard stats
export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  attendanceRate: number;    // percentage 0-100
  pendingPayments: number;   // count of students with unpaid dues
  totalRevenue: number;
  totalDebt: number;
}
