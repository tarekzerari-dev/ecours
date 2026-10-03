"use server";

import { createClient } from '@supabase/supabase-js';
import { Group, Session, AttendanceRecord, StudentPayment } from '@/lib/types';
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

const getAdminDb = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// ============================================================================
// Groups
// ============================================================================
export async function addGroupAction(group: Partial<Group>, userId: string, managerSchoolId: string | null) {
  const supabase = getAdminDb();
  const newGroup = {
    name: group.name,
    teacher_id: group.teacherId || userId,
    monthly_price: group.monthlyPrice || 0,
    school_id: managerSchoolId || null,
  };
  
  const { data, error } = await supabase.from('groups').insert([newGroup]).select('*, students:student_groups(count)').single();
  if (error) throw error;
  return mapGroup(data);
}

export async function deleteGroupAction(id: string) {
  const supabase = getAdminDb();
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
}

export async function updateGroupAction(id: string, updates: Partial<Group>) {
  const supabase = getAdminDb();
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.monthlyPrice !== undefined) dbUpdates.monthly_price = updates.monthlyPrice;
  
  const { error } = await supabase.from('groups').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

// ============================================================================
// Students
// ============================================================================
export async function addStudentAction(student: any, groupId: string, userId: string, managerSchoolId: string | null) {
  const supabase = getAdminDb();
  
  const newStudent = {
    full_name: student.fullName,
    parent_phone: student.parentPhone,
    qr_code: student.qrCode || `QR_${Date.now()}`,
    school_id: managerSchoolId || null,
    independent_teacher_id: managerSchoolId ? null : userId
  };

  // 1. Insert student
  const { data: insertedStudent, error: studentError } = await supabase
    .from('students')
    .insert([newStudent])
    .select()
    .single();
    
  if (studentError) throw studentError;

  // 2. Enroll in group
  if (insertedStudent && groupId) {
    const { error: enrollError } = await supabase
      .from('student_groups')
      .insert([{ student_id: insertedStudent.id, group_id: groupId }]);
    if (enrollError) throw enrollError;
  }
  return insertedStudent;
}

export async function deleteStudentAction(id: string) {
  const supabase = getAdminDb();
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// Sessions & Attendance
// ============================================================================
export async function addSessionAction(session: Partial<Session>, registeredBy: string) {
  const supabase = getAdminDb();
  let validRegisteredBy = registeredBy;
  if (registeredBy === 'admin' || !registeredBy) {
    const { data: g } = await supabase.from('groups').select('teacher_id').eq('id', session.groupId).single();
    validRegisteredBy = g?.teacher_id || null; // Will fail if null and column is NOT NULL, but it shouldn't be null
  }

  const newSession = {
    group_id: session.groupId,
    date: session.date,
    start_time: session.startedAt?.split('T')[1]?.substring(0, 5) || '14:00',
    end_time: session.endedAt?.split('T')[1]?.substring(0, 5) || '16:00',
    registered_by: validRegisteredBy
  };
  
  const { data, error } = await supabase.from('sessions').insert([newSession]).select('*, groups(name), attendance(status)').single();
  if (error) throw error;
  return mapSession(data);
}

export async function recordAttendanceAction(records: Partial<AttendanceRecord>[], registeredBy: string) {
  const supabase = getAdminDb();
  let validRegisteredBy = registeredBy;
  if (registeredBy === 'admin' || !registeredBy) {
    if (records.length > 0 && records[0].sessionId) {
      const { data: sess } = await supabase.from('sessions').select('group_id').eq('id', records[0].sessionId).single();
      if (sess?.group_id) {
        const { data: g } = await supabase.from('groups').select('teacher_id').eq('id', sess.group_id).single();
        validRegisteredBy = g?.teacher_id || null;
      }
    }
  }

  const dbRecords = records.map(r => ({
    session_id: r.sessionId,
    student_id: r.studentId,
    status: r.status || 'present',
    registered_by: validRegisteredBy
  }));
  
  const { error } = await supabase.from('attendance').upsert(dbRecords, { onConflict: 'session_id, student_id' });
  if (error) throw error;
}

// ============================================================================
// Payments
// ============================================================================
export async function addPaymentAction(payment: any, receivedBy: string) {
  const supabase = getAdminDb();
  let validReceivedBy = receivedBy;
  if (receivedBy === 'admin' || !receivedBy) {
    const { data: g } = await supabase.from('groups').select('teacher_id').eq('id', payment.groupId).single();
    validReceivedBy = g?.teacher_id || null;
  }

  const newPayment = {
     student_id: payment.studentId,
     group_id: payment.groupId,
     amount: payment.amount,
     month_covered: payment.monthCovered,
     received_by: validReceivedBy
  };
  const { data, error } = await supabase.from('payments').insert([newPayment]).select('*, students(full_name), groups(name)').single();
  if (error) throw error;
  return mapPayment(data);
}

export async function deletePaymentAction(id: string) {
  const supabase = getAdminDb();
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
}
