"use server";

import { createClient } from '@supabase/supabase-js';
import {
  MOCK_ADMIN_OVERVIEW,
  MOCK_ADMIN_SCHOOLS,
  MOCK_ADMIN_TEACHERS,
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_STUDENTS,
  MOCK_ADMIN_BILLING,
} from '@/lib/mock-admin-data';

// Helper to quickly failover if Supabase is offline / unreachable
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Supabase query timeout")), timeoutMs))
  ]);
};

// Create a Supabase client with the Service Role Key to bypass RLS for Admin queries
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

export async function getAdminOverviewAction() {
  try {
    const supabase = getAdminDb();
    const [schoolsRes, managersRes, teachersRes, groupsRes, studentsRes, paymentsRes] = await withTimeout(Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount'),
    ]));

    const schoolsCount = schoolsRes.count ?? 0;
    const managersCount = managersRes.count ?? 0;
    const teachersCount = teachersRes.count ?? 0;
    const groupsCount = groupsRes.count ?? 0;
    const studentsCount = studentsRes.count ?? 0;
    const totalRevenue = (paymentsRes.data || []).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

    if (schoolsCount > 0 || teachersCount > 0 || groupsCount > 0 || studentsCount > 0) {
      return {
        schoolsCount,
        managersCount,
        teachersCount,
        groupsCount,
        studentsCount,
        totalRevenue,
      };
    }

    return MOCK_ADMIN_OVERVIEW;
  } catch (e) {
    return MOCK_ADMIN_OVERVIEW;
  }
}

export async function getAdminSchoolsAction() {
  try {
    const supabase = getAdminDb();
    const [schoolsRes, profilesRes, groupsRes, studentsRes] = await withTimeout(Promise.all([
      supabase.from('schools').select('id, name, address, manager_id, created_at').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, phone'),
      supabase.from('groups').select('id, school_id'),
      supabase.from('students').select('id, school_id')
    ]));

    if (!schoolsRes.error && schoolsRes.data && schoolsRes.data.length > 0) {
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const groupCountMap = new Map<string, number>();
      (groupsRes.data || []).forEach(g => {
        if (g.school_id) {
          groupCountMap.set(g.school_id, (groupCountMap.get(g.school_id) || 0) + 1);
        }
      });
      const studentCountMap = new Map<string, number>();
      (studentsRes.data || []).forEach(s => {
        if (s.school_id) {
          studentCountMap.set(s.school_id, (studentCountMap.get(s.school_id) || 0) + 1);
        }
      });

      return (schoolsRes.data || []).map((s: any) => {
        const p = profileMap.get(s.manager_id);
        return {
          id: s.id,
          name: s.name,
          address: s.address || 'غير محدد',
          managerId: s.manager_id,
          managerName: p?.full_name || 'غير محدد',
          managerPhone: p?.phone || '—',
          groupsCount: groupCountMap.get(s.id) || 0,
          studentsCount: studentCountMap.get(s.id) || 0,
          createdAt: s.created_at,
        };
      });
    }

    return MOCK_ADMIN_SCHOOLS;
  } catch (e) {
    return MOCK_ADMIN_SCHOOLS;
  }
}

export async function getAdminTeachersAction() {
  try {
    const supabase = getAdminDb();
    const [teachersRes, schoolsRes, tpRes, groupsRes] = await withTimeout(Promise.all([
      supabase.from('profiles').select('id, full_name, phone, created_at').eq('role', 'teacher').order('created_at', { ascending: false }),
      supabase.from('schools').select('id, name'),
      supabase.from('teacher_profiles').select('user_id, school_id, subject, phase, monthly_fee, is_active'),
      supabase.from('groups').select('id, teacher_id')
    ]));

    if (!teachersRes.error && teachersRes.data && teachersRes.data.length > 0) {
      const schoolMap = new Map((schoolsRes.data || []).map(s => [s.id, s.name]));
      const tpMap = new Map((tpRes.data || []).map(tp => [tp.user_id, tp]));
      const groupCountMap = new Map<string, number>();
      (groupsRes.data || []).forEach(g => {
        if (g.teacher_id) {
          groupCountMap.set(g.teacher_id, (groupCountMap.get(g.teacher_id) || 0) + 1);
        }
      });

      return (teachersRes.data || []).map((t: any) => {
        const tp: any = tpMap.get(t.id) || {};
        const isIndependent = !tp.school_id;
        const schoolName = tp.school_id ? (schoolMap.get(tp.school_id) || null) : null;
        return {
          id: t.id,
          fullName: t.full_name,
          phone: t.phone || '—',
          subject: tp.subject || 'عام',
          phase: tp.phase || 'secondary',
          monthlyFee: Number(tp.monthly_fee || 0),
          isActive: tp.is_active !== false,
          isIndependent: isIndependent,
          schoolId: tp.school_id || null,
          schoolName: schoolName,
          groupsCount: groupCountMap.get(t.id) || 0,
          createdAt: t.created_at,
        };
      });
    }

    return MOCK_ADMIN_TEACHERS;
  } catch (e) {
    return MOCK_ADMIN_TEACHERS;
  }
}

export async function getAdminGroupsAction() {
  try {
    const supabase = getAdminDb();
    const [groupsRes, profilesRes, schoolsRes, sgRes] = await withTimeout(Promise.all([
      supabase.from('groups').select('id, name, monthly_price, created_at, teacher_id, school_id').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('schools').select('id, name'),
      supabase.from('student_groups').select('group_id')
    ]));

    if (!groupsRes.error && groupsRes.data && groupsRes.data.length > 0) {
      const teacherMap = new Map((profilesRes.data || []).map(p => [p.id, p.full_name]));
      const schoolMap = new Map((schoolsRes.data || []).map(s => [s.id, s.name]));
      const studentCountMap = new Map<string, number>();
      (sgRes.data || []).forEach(sg => {
        if (sg.group_id) {
          studentCountMap.set(sg.group_id, (studentCountMap.get(sg.group_id) || 0) + 1);
        }
      });

      return (groupsRes.data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        teacherId: g.teacher_id,
        teacherName: teacherMap.get(g.teacher_id) || 'غير معروف',
        schoolId: g.school_id,
        schoolName: g.school_id ? (schoolMap.get(g.school_id) || 'مدرسة') : 'مستقل',
        monthlyPrice: Number(g.monthly_price || 0),
        studentCount: studentCountMap.get(g.id) || 0,
        createdAt: g.created_at,
      }));
    }

    return MOCK_ADMIN_GROUPS;
  } catch (e) {
    return MOCK_ADMIN_GROUPS;
  }
}

export async function getAdminStudentsAction() {
  try {
    const supabase = getAdminDb();
    const [studentsRes, schoolsRes, sgRes, groupsRes] = await withTimeout(Promise.all([
      supabase.from('students').select('id, full_name, phone_number, parent_phone, qr_code, created_at, school_id').order('created_at', { ascending: false }),
      supabase.from('schools').select('id, name'),
      supabase.from('student_groups').select('student_id, group_id'),
      supabase.from('groups').select('id, name')
    ]));

    if (!studentsRes.error && studentsRes.data && studentsRes.data.length > 0) {
      const schoolMap = new Map((schoolsRes.data || []).map(s => [s.id, s.name]));
      const groupNameMap = new Map((groupsRes.data || []).map(g => [g.id, g.name]));
      
      const studentGroupsMap = new Map<string, string[]>();
      (sgRes.data || []).forEach(sg => {
        const gName = groupNameMap.get(sg.group_id);
        if (gName) {
          const list = studentGroupsMap.get(sg.student_id) || [];
          list.push(gName);
          studentGroupsMap.set(sg.student_id, list);
        }
      });

      return (studentsRes.data || []).map((s: any) => ({
        id: s.id,
        fullName: s.full_name,
        phoneNumber: s.phone_number || '—',
        parentPhone: s.parent_phone || '—',
        qrCode: s.qr_code || '—',
        schoolId: s.school_id,
        schoolName: s.school_id ? (schoolMap.get(s.school_id) || 'مدرسة') : 'مستقل',
        groups: studentGroupsMap.get(s.id) || [],
        createdAt: s.created_at,
      }));
    }

    return MOCK_ADMIN_STUDENTS;
  } catch (e) {
    return MOCK_ADMIN_STUDENTS;
  }
}

export async function getAdminBillingAction() {
  try {
    const supabase = getAdminDb();
    const [paymentsRes, studentsRes, groupsRes, profilesRes, schoolsRes] = await withTimeout(Promise.all([
      supabase.from('payments').select('id, amount, month_covered, created_at, student_id, group_id, received_by').order('created_at', { ascending: false }),
      supabase.from('students').select('id, full_name'),
      supabase.from('groups').select('id, name, teacher_id, school_id'),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('schools').select('id, name')
    ]));

    if (!paymentsRes.error && paymentsRes.data && paymentsRes.data.length > 0) {
      const studentMap = new Map((studentsRes.data || []).map(s => [s.id, s.full_name]));
      const groupMap = new Map((groupsRes.data || []).map(g => [g.id, g]));
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p.full_name]));
      const schoolMap = new Map((schoolsRes.data || []).map(s => [s.id, s.name]));

      return (paymentsRes.data || []).map((p: any) => {
        const grp = groupMap.get(p.group_id);
        const teacherName = grp?.teacher_id ? (profileMap.get(grp.teacher_id) || 'غير محدد') : (profileMap.get(p.received_by) || 'غير محدد');
        const schoolName = grp?.school_id ? (schoolMap.get(grp.school_id) || 'مدرسة') : 'مستقل';

        return {
          id: p.id,
          amount: Number(p.amount || 0),
          monthCovered: p.month_covered || '—',
          createdAt: p.created_at,
          studentId: p.student_id,
          studentName: studentMap.get(p.student_id) || 'طالب غير مسجل',
          groupId: p.group_id,
          groupName: grp?.name || 'فوج عام',
          teacherName: teacherName,
          schoolName: schoolName,
        };
      });
    }

    return MOCK_ADMIN_BILLING;
  } catch (e) {
    return MOCK_ADMIN_BILLING;
  }
}
