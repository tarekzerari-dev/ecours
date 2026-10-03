"use server";

import { createClient } from '@supabase/supabase-js';
import { Group, Student, Session, AttendanceRecord, StudentPayment } from '@/lib/types';
import {
  MOCK_ADMIN_TEACHERS,
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_STUDENTS,
  MOCK_ADMIN_BILLING,
} from '@/lib/mock-admin-data';

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Supabase query timeout")), timeoutMs))
  ]);
};

const getAdminDb = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 1200);
          return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
        }
      }
    }
  );
};

// Map helpers
const mapGroup = (g: any): Group => ({
  id: g.id,
  name: g.name,
  teacherId: g.teacher_id,
  teacherName: g.profiles?.full_name || '',
  monthlyPrice: Number(g.monthly_price) || 0,
  level: g.level || '',
  sessionPrice: Number(g.session_price) || 0,
  studentCount: g.students?.[0]?.count || 0,
  createdAt: g.created_at || new Date().toISOString(),
});

const mapStudent = (s: any): Student => {
  const firstGroup = s.student_groups?.[0];
  const present = (s.attendance || []).filter((a: any) => a.status === 'present').length;
  const absent = (s.attendance || []).filter((a: any) => a.status === 'absent').length;
  
  return {
    id: s.id,
    fullName: s.full_name,
    parentPhone: s.parent_phone,
    qrCode: s.qr_code,
    groupId: firstGroup?.group_id || '',
    groupName: firstGroup?.groups?.name || '',
    totalPresences: present,
    totalAbsences: absent,
    createdAt: s.created_at || new Date().toISOString(),
  };
};

const mapSession = (s: any): Session => ({
  id: s.id,
  groupId: s.group_id,
  groupName: s.groups?.name || '',
  date: s.date,
  startedAt: s.start_time,
  endedAt: s.end_time,
  presentCount: (s.attendance || []).filter((a: any) => a.status === 'present').length,
  absentCount: (s.attendance || []).filter((a: any) => a.status === 'absent').length,
});

const mapPayment = (p: any): StudentPayment => ({
  id: p.id,
  studentId: p.student_id,
  studentName: p.students?.full_name || '',
  groupId: p.group_id,
  groupName: p.groups?.name || '',
  amount: Number(p.amount),
  monthCovered: p.month_covered,
  paymentDate: p.created_at || new Date().toISOString(),
  method: p.method || 'cash',
});

// Helper for Manager School ID
async function getManagerSchoolIdAction(mockRole: string | null): Promise<string | null> {
  try {
    const supabase = getAdminDb();
    if (mockRole === 'manager') {
      const { data: school } = await withTimeout(supabase.from('schools').select('id').limit(1).maybeSingle(), 800);
      return school ? school.id : null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Actions
export async function getTeachersAction(mockRole: string | null) {
  try {
    const supabase = getAdminDb();
    const managerSchoolId = await getManagerSchoolIdAction(mockRole);
    
    let query = supabase.from('profiles').select('*, teacher_profiles!inner(*)').eq('role', 'teacher');
    if (managerSchoolId) {
      query = query.eq('teacher_profiles.school_id', managerSchoolId);
    } else if (mockRole === 'manager') {
      query = query.eq('teacher_profiles.school_id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await withTimeout(query, 1000);
    if (!error && data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.id,
        fullName: t.full_name,
        email: '', 
        phone: t.phone,
        subject: t.teacher_profiles?.[0]?.subject || 'غير محدد',
        phase: t.teacher_profiles?.[0]?.phase || 'secondary',
        createdAt: t.created_at
      }));
    }
  } catch (e) {}

  return MOCK_ADMIN_TEACHERS.map(t => ({
    id: t.id,
    fullName: t.fullName,
    email: '',
    phone: t.phone,
    subject: t.subject,
    phase: t.phase,
    createdAt: t.createdAt
  }));
}

export async function getGroupsAction(teacherId: string | undefined, mockRole: string | null): Promise<Group[]> {
  try {
    const supabase = getAdminDb();
    const managerSchoolId = await getManagerSchoolIdAction(mockRole);
    
    let query = supabase.from('groups').select('*, profiles:teacher_id(full_name), students:student_groups(count)');
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (managerSchoolId) {
      query = query.eq('school_id', managerSchoolId);
    } else if (mockRole === 'manager') {
      query = query.eq('school_id', '00000000-0000-0000-0000-000000000000');
    }
    
    const { data, error } = await withTimeout(query, 1000);
    if (!error && data && data.length > 0) {
      return data.map(mapGroup);
    }
  } catch (e) {}

  let filtered = MOCK_ADMIN_GROUPS;
  if (teacherId) {
    filtered = filtered.filter(g => g.teacherId === teacherId);
  }
  return filtered.map(g => ({
    id: g.id,
    name: g.name,
    teacherId: g.teacherId,
    teacherName: g.teacherName,
    monthlyPrice: g.monthlyPrice,
    level: '3AS',
    sessionPrice: 0,
    studentCount: g.studentCount,
    createdAt: g.createdAt,
  }));
}

export async function getGroupByIdAction(groupId: string): Promise<Group | null> {
  try {
    const supabase = getAdminDb();
    const { data, error } = await withTimeout(
      supabase
        .from('groups')
        .select('*, profiles:teacher_id(full_name), students:student_groups(count)')
        .eq('id', groupId)
        .maybeSingle(),
      1000
    );
    if (!error && data) return mapGroup(data);
  } catch (e) {}

  const mock = MOCK_ADMIN_GROUPS.find(g => g.id === groupId);
  if (mock) {
    return {
      id: mock.id,
      name: mock.name,
      teacherId: mock.teacherId,
      teacherName: mock.teacherName,
      monthlyPrice: mock.monthlyPrice,
      level: '3AS',
      sessionPrice: 0,
      studentCount: mock.studentCount,
      createdAt: mock.createdAt,
    };
  }
  return null;
}

export async function getStudentsAction(groupId: string | undefined, mockRole: string | null): Promise<Student[]> {
  try {
    const supabase = getAdminDb();
    const managerSchoolId = await getManagerSchoolIdAction(mockRole);
    
    let query = supabase.from('students').select(`
      *,
      attendance(*),
      student_groups (
        group_id,
        groups (name)
      )
    `);
    
    if (groupId) {
      const { data: sgs } = await withTimeout(supabase.from('student_groups').select('student_id').eq('group_id', groupId), 800);
      const sids = (sgs || []).map(s => s.student_id);
      if (sids.length > 0) {
        query = query.in('id', sids);
      } else {
        return [];
      }
    }
    
    if (managerSchoolId) {
      query = query.eq('school_id', managerSchoolId);
    } else if (mockRole === 'manager') {
      query = query.eq('school_id', '00000000-0000-0000-0000-000000000000');
    } else if (!groupId && mockRole === 'teacher') {
      const { data: prof } = await withTimeout(supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).maybeSingle(), 800);
      if (prof) query = query.eq('independent_teacher_id', prof.id);
    }
    
    const { data, error } = await withTimeout(query, 1000);
    if (!error && data && data.length > 0) {
      return data.map(mapStudent);
    }
  } catch (e) {}

  let filtered = MOCK_ADMIN_STUDENTS;
  if (groupId) {
    const grp = MOCK_ADMIN_GROUPS.find(g => g.id === groupId);
    if (grp) {
      filtered = filtered.filter(s => s.groups.includes(grp.name));
    }
  }

  return filtered.map((s, idx) => ({
    id: s.id,
    fullName: s.fullName,
    parentPhone: s.parentPhone,
    qrCode: s.qrCode,
    groupId: groupId || "grp-1",
    groupName: s.groups[0] || "فوج عام",
    totalPresences: 10 + (idx % 6),
    totalAbsences: idx % 3,
    createdAt: s.createdAt,
  }));
}

export async function getSessionsAction(groupId: string | undefined, mockRole: string | null): Promise<Session[]> {
  try {
    const supabase = getAdminDb();
    let query = supabase.from('sessions').select('*, attendance(count)').order('date', { ascending: false });
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (mockRole === 'manager') {
      const managerSchoolId = await getManagerSchoolIdAction(mockRole);
      if (managerSchoolId) {
        const { data: groups } = await withTimeout(supabase.from('groups').select('id').eq('school_id', managerSchoolId), 800);
        if (groups && groups.length > 0) {
          query = query.in('group_id', groups.map(g => g.id));
        } else {
          return [];
        }
      }
    } else if (mockRole === 'teacher') {
      const { data: prof } = await withTimeout(supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).maybeSingle(), 800);
      if (prof) {
        const { data: groups } = await withTimeout(supabase.from('groups').select('id').eq('teacher_id', prof.id), 800);
        if (groups && groups.length > 0) {
          query = query.in('group_id', groups.map(g => g.id));
        } else {
          return [];
        }
      }
    }
    
    const { data, error } = await withTimeout(query, 1000);
    if (!error && data && data.length > 0) {
      return data.map(mapSession);
    }
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: "ses-1",
      groupId: groupId || "grp-1",
      groupName: "رياضيات 3 ثانوي - علوم تجريبية (فوج A)",
      date: today,
      startedAt: "14:00",
      endedAt: "16:00",
      presentCount: 9,
      absentCount: 1,
    },
    {
      id: "ses-2",
      groupId: groupId || "grp-1",
      groupName: "رياضيات 3 ثانوي - علوم تجريبية (فوج A)",
      date: "2026-08-20",
      startedAt: "14:00",
      endedAt: "16:00",
      presentCount: 10,
      absentCount: 0,
    },
    {
      id: "ses-3",
      groupId: groupId || "grp-4",
      groupName: "فيزياء 3 ثانوي - حلول البكالوريا السابقة",
      date: "2026-08-21",
      startedAt: "09:00",
      endedAt: "11:00",
      presentCount: 8,
      absentCount: 1,
    }
  ];
}

export async function getAttendanceBySessionAction(sessionId: string): Promise<AttendanceRecord[]> {
  try {
    const supabase = getAdminDb();
    const { data, error } = await withTimeout(
      supabase
        .from('attendance')
        .select('*, students(full_name)')
        .eq('session_id', sessionId),
      1000
    );
      
    if (!error && data && data.length > 0) {
      return data.map((a: any): AttendanceRecord => ({
        id: a.id,
        sessionId: a.session_id,
        studentId: a.student_id,
        studentName: a.students?.full_name || '',
        status: a.status as any,
        note: a.notes,
      }));
    }
  } catch (e) {}

  return MOCK_ADMIN_STUDENTS.slice(0, 8).map((s, idx) => ({
    id: `att-${sessionId}-${s.id}`,
    sessionId: sessionId,
    studentId: s.id,
    studentName: s.fullName,
    status: idx === 2 ? 'absent' : 'present',
    scannedAt: new Date().toISOString(),
  }));
}

export async function getPaymentsAction(groupId: string | undefined, mockRole: string | null): Promise<StudentPayment[]> {
  try {
    const supabase = getAdminDb();
    let query = supabase.from('payments').select('*, students(full_name), groups(name)').order('created_at', { ascending: false });
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (mockRole === 'manager') {
      const managerSchoolId = await getManagerSchoolIdAction(mockRole);
      if (managerSchoolId) {
        const { data: groups } = await withTimeout(supabase.from('groups').select('id').eq('school_id', managerSchoolId), 800);
        if (groups && groups.length > 0) {
          query = query.in('group_id', groups.map(g => g.id));
        } else {
          return [];
        }
      }
    } else if (mockRole === 'teacher') {
      const { data: prof } = await withTimeout(supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).maybeSingle(), 800);
      if (prof) {
        const { data: groups } = await withTimeout(supabase.from('groups').select('id').eq('teacher_id', prof.id), 800);
        if (groups && groups.length > 0) {
          query = query.in('group_id', groups.map(g => g.id));
        } else {
          return [];
        }
      }
    }

    const { data, error } = await withTimeout(query, 1000);
    if (!error && data && data.length > 0) {
      return data.map(mapPayment);
    }
  } catch (e) {}

  let filtered = MOCK_ADMIN_BILLING;
  if (groupId) {
    filtered = filtered.filter(p => p.groupId === groupId);
  }

  return filtered.map(p => ({
    id: p.id,
    studentId: p.studentId,
    studentName: p.studentName,
    groupId: p.groupId,
    groupName: p.groupName,
    amount: p.amount,
    monthCovered: p.monthCovered,
    paymentDate: p.createdAt,
    method: 'cash',
  }));
}
