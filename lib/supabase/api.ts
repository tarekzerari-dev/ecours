import { createClient } from './client';
import type { Teacher, Group, Student, Session, AttendanceRecord, StudentPayment } from '../types';

// Helper: map DB snake_case to app camelCase
const mapGroup = (g: any): Group => ({
  id: g.id,
  teacherId: g.teacher_id,
  teacherName: g.profiles?.full_name || '',
  name: g.name,
  level: 'عام', // Assuming level is embedded in name or we default it since schema lacks it
  monthlyPrice: Number(g.monthly_price || 0),
  sessionPrice: 0, // Schema lacks this, can be inferred or defaulted
  studentCount: g.students?.[0]?.count || 0, // Requires join count
  createdAt: g.created_at,
});

const mapStudent = (s: any): Student => ({
  id: s.id,
  fullName: s.full_name,
  parentPhone: s.parent_phone || '',
  groupId: s.student_groups?.[0]?.group_id || '', // Simple fallback, usually need a join
  groupName: s.student_groups?.[0]?.groups?.name || '',
  qrCode: s.qr_code || '',
  totalAbsences: s.attendance?.filter((a: any) => a.status === 'absent').length || 0,
  totalPresences: s.attendance?.filter((a: any) => a.status === 'present' || a.status === 'late').length || 0,
  createdAt: s.created_at,
});

const mapSession = (s: any): Session => ({
  id: s.id,
  groupId: s.group_id,
  groupName: s.groups?.name || '',
  date: s.date,
  startedAt: s.start_time,
  endedAt: s.end_time,
  presentCount: s.attendance?.filter((a: any) => a.status === 'present' || a.status === 'late').length || 0,
  absentCount: s.attendance?.filter((a: any) => a.status === 'absent').length || 0,
});

const mapAttendance = (a: any): AttendanceRecord => ({
  id: a.id,
  sessionId: a.session_id,
  studentId: a.student_id,
  studentName: a.students?.full_name || '',
  status: a.status,
  scannedAt: a.created_at,
});

const mapPayment = (p: any): StudentPayment => ({
  id: p.id,
  studentId: p.student_id,
  studentName: p.students?.full_name || '',
  groupId: p.group_id,
  groupName: p.groups?.name || '',
  amount: Number(p.amount),
  monthCovered: p.month_covered,
  paymentDate: p.created_at,
  method: 'cash', // DB schema doesn't have method currently
});


export const api = {
  // Helper to get manager's school ID for filtering
  async getManagerSchoolId(supabase: any): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    let currentRole = 'teacher';
    
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) currentRole = profile.role;
      
      if (currentRole === 'manager') {
         const { data: school } = await supabase.from('schools').select('id').eq('manager_id', user.id).single();
         return school ? school.id : null;
      }
    } else if (typeof window !== 'undefined') {
      currentRole = localStorage.getItem('dev_mock_role') || 'teacher';
      if (currentRole === 'manager') {
         const { data: school } = await supabase.from('schools').select('id').limit(1).single();
         return school ? school.id : null;
      }
    }
    return null;
  },

  // --- Profiles & Roles ---
  async getProfile(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teacher_profiles(*), schools(*)')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getTeachers() {
    const mockRole = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_role') : null;
    const { getTeachersAction } = await import('@/app/actions/queries');
    return await getTeachersAction(mockRole);
  },

  // --- Groups ---
  async getGroups(teacherId?: string): Promise<Group[]> {
    const mockRole = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_role') : null;
    const { getGroupsAction } = await import('@/app/actions/queries');
    return await getGroupsAction(teacherId, mockRole);
  },

  async getGroupById(groupId: string): Promise<Group | null> {
    const { getGroupByIdAction } = await import('@/app/actions/queries');
    return await getGroupByIdAction(groupId);
  },

  async addGroup(group: Partial<Group>) {
    const supabase = createClient();
    const managerSchoolId = await this.getManagerSchoolId(supabase);
    const { data: { user } } = await supabase.auth.getUser();
    const { addGroupAction } = await import('@/app/actions/mutations');
    return await addGroupAction(group, user?.id as string, managerSchoolId);
  },

  async deleteGroup(id: string) {
    const { deleteGroupAction } = await import('@/app/actions/mutations');
    await deleteGroupAction(id);
  },

  async updateGroup(id: string, updates: Partial<Group>) {
    const { updateGroupAction } = await import('@/app/actions/mutations');
    await updateGroupAction(id, updates);
  },

  // --- Students ---
  async getStudents(groupId?: string): Promise<Student[]> {
    const mockRole = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_role') : null;
    const { getStudentsAction } = await import('@/app/actions/queries');
    return await getStudentsAction(groupId, mockRole);
  },

  async addStudent(student: any, groupId: string) {
    const supabase = createClient();
    const managerSchoolId = await this.getManagerSchoolId(supabase);
    const { data: { user } } = await supabase.auth.getUser();
    const { addStudentAction } = await import('@/app/actions/mutations');
    return await addStudentAction(student, groupId, user?.id as string, managerSchoolId);
  },
  
  async deleteStudent(id: string) {
    const { deleteStudentAction } = await import('@/app/actions/mutations');
    await deleteStudentAction(id);
  },

  // --- Attendance & Sessions ---
  async getSessions(groupId?: string): Promise<Session[]> {
    const mockRole = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_role') : null;
    const { getSessionsAction } = await import('@/app/actions/queries');
    return await getSessionsAction(groupId, mockRole);
  },
  
  async getAttendanceBySession(sessionId: string): Promise<AttendanceRecord[]> {
    const { getAttendanceBySessionAction } = await import('@/app/actions/queries');
    return await getAttendanceBySessionAction(sessionId);
  },
  
  async addSession(session: Partial<Session>, registeredBy: string) {
     const { addSessionAction } = await import('@/app/actions/mutations');
     return await addSessionAction(session, registeredBy);
  },

  async recordAttendance(records: Partial<AttendanceRecord>[], registeredBy: string) {
     const { recordAttendanceAction } = await import('@/app/actions/mutations');
     await recordAttendanceAction(records, registeredBy);
  },

  // --- Payments ---
  async getPayments(groupId?: string): Promise<StudentPayment[]> {
    const mockRole = typeof window !== 'undefined' ? localStorage.getItem('dev_mock_role') : null;
    const { getPaymentsAction } = await import('@/app/actions/queries');
    return await getPaymentsAction(groupId, mockRole) as StudentPayment[];
  },
  
  async addPayment(payment: any, receivedBy: string) {
    const { addPaymentAction } = await import('@/app/actions/mutations');
    return await addPaymentAction(payment, receivedBy);
  },
  
  async deletePayment(id: string) {
    const { deletePaymentAction } = await import('@/app/actions/mutations');
    await deletePaymentAction(id);
  },

  // --- Registration Links ---
  async generateRegistrationLink(createdBy: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('registration_links')
      .insert([{ created_by: createdBy }])
      .select('token')
      .single();
    if (error) throw error;
    return data.token;
  },

  async validateRegistrationLink(token: string): Promise<boolean> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('registration_links')
      .select('is_used')
      .eq('token', token)
      .single();
    if (error || !data) return false;
    return !data.is_used;
  },

  async markRegistrationLinkAsUsed(token: string, email: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('registration_links')
      .update({ is_used: true, used_by_email: email })
      .eq('token', token);
    if (error) throw error;
  },

  // ==============================================================================
  // --- SUPER ADMIN (System-Wide Overview & Management) ---
  // ==============================================================================
  async getAdminOverview() {
    const { getAdminOverviewAction } = await import('@/app/actions/admin');
    return await getAdminOverviewAction();
  },

  async getAdminSchools() {
    const { getAdminSchoolsAction } = await import('@/app/actions/admin');
    return await getAdminSchoolsAction();
  },

  async getAdminTeachers() {
    const { getAdminTeachersAction } = await import('@/app/actions/admin');
    return await getAdminTeachersAction();
  },

  async getAdminGroups() {
    const { getAdminGroupsAction } = await import('@/app/actions/admin');
    return await getAdminGroupsAction();
  },

  async getAdminStudents() {
    const { getAdminStudentsAction } = await import('@/app/actions/admin');
    return await getAdminStudentsAction();
  },

  async getAdminBilling() {
    const { getAdminBillingAction } = await import('@/app/actions/admin');
    return await getAdminBillingAction();
  }
};
