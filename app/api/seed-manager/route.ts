import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Seed data for MANAGER role: teachers + groups + students + sessions + payments for their school
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const body = await req.json().catch(() => ({}));
  let managerId: string | undefined = body.managerId;

  try {
    // Resolve a real manager user if managerId is missing or invalid
    let validManager = null;
    if (managerId && managerId !== 'dev_user_123') {
      const { data: prof } = await supabase.from('profiles').select('id').eq('id', managerId).maybeSingle();
      if (prof) validManager = prof.id;
    }

    if (!validManager) {
      const { data: existingProf } = await supabase.from('profiles').select('id').eq('role', 'manager').limit(1).maybeSingle();
      if (existingProf) {
        validManager = existingProf.id;
      } else {
        const { data: users } = await supabase.auth.admin.listUsers();
        let user = users?.users?.find(u => u.email === 'manager@ecours.com');
        if (!user) {
          const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
            email: 'manager@ecours.com',
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: 'مدير المدرسة', role: 'manager' }
          });
          if (uErr) throw uErr;
          user = newUser.user;
        }
        await supabase.from('profiles').upsert([{ id: user.id, full_name: 'مدير المدرسة', role: 'manager' }], { onConflict: 'id' });
        validManager = user.id;
      }
    }

    managerId = validManager;

    const arabicFirstNames = ['محمد', 'أحمد', 'سارة', 'فاطمة', 'ياسين', 'أمينة', 'خالد', 'كريم', 'مريم', 'يوسف', 'عمر', 'علي', 'زينب', 'نور', 'بلال', 'لينة', 'رياض', 'إيمان'];
    const arabicLastNames = ['بن علي', 'منصور', 'خالد', 'سعيد', 'عبد الله', 'سليمان', 'إبراهيم', 'مصطفى', 'عثمان', 'عبد الرحمن', 'بوعلام', 'حمزة'];

    // 1. Get or create school
    let { data: school } = await supabase.from('schools').select('*').eq('manager_id', managerId).limit(1).maybeSingle();
    if (!school) {
      const { data: newSchool, error: nsErr } = await supabase.from('schools').insert([{
        manager_id: managerId, name: 'مدرسة الإبداع والتفوق'
      }]).select().single();
      if (nsErr) throw nsErr;
      school = newSchool;
    }

    // 2. Create or find 2 teachers for this school
    const teachersConfig = [
      { email: `demo_teacher_a_${managerId!.substring(0, 8)}@ecours.demo`, name: 'الأستاذ أحمد بن سالم', subject: 'رياضيات', phase: 'secondary' },
      { email: `demo_teacher_b_${managerId!.substring(0, 8)}@ecours.demo`, name: 'الأستاذة سارة مرابط', subject: 'فيزياء وكيمياء', phase: 'secondary' },
    ];

    const teacherIds: string[] = [];
    for (const tc of teachersConfig) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      let user = existingUsers?.users?.find(u => u.email === tc.email);
      if (!user) {
        const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
          email: tc.email, password: 'DemoPass123!', email_confirm: true,
          user_metadata: { full_name: tc.name, role: 'teacher' }
        });
        if (uErr) throw uErr;
        user = newUser.user;
        // Profile is auto-created via trigger, but upsert for safety
        await supabase.from('profiles').upsert([{ id: user.id, full_name: tc.name, role: 'teacher' }], { onConflict: 'id' });
      }
      await supabase.from('teacher_profiles').upsert([{
        user_id: user.id, school_id: school.id, subject: tc.subject, phase: tc.phase
      }], { onConflict: 'user_id' });
      teacherIds.push(user.id);
    }

    // 3. Clean previous demo groups for this school
    const { data: oldGroups } = await supabase.from('groups').select('id').eq('school_id', school.id);
    if (oldGroups?.length) {
      const oldGroupIds = oldGroups.map(g => g.id);
      await supabase.from('payments').delete().in('group_id', oldGroupIds);
      const { data: oldSessions } = await supabase.from('sessions').select('id').in('group_id', oldGroupIds);
      if (oldSessions?.length) await supabase.from('attendance').delete().in('session_id', oldSessions.map(s => s.id));
      await supabase.from('sessions').delete().in('group_id', oldGroupIds);
      const { data: oldEnrollments } = await supabase.from('student_groups').select('student_id').in('group_id', oldGroupIds);
      if (oldEnrollments?.length) {
        await supabase.from('student_groups').delete().in('group_id', oldGroupIds);
        await supabase.from('students').delete().in('id', oldEnrollments.map(e => e.student_id));
      }
      await supabase.from('groups').delete().in('id', oldGroupIds);
    }

    // 4. Create groups (2 per teacher)
    const groupsToCreate = [
      { name: 'فوج بكالوريا أ - رياضيات', teacher_id: teacherIds[0], monthly_price: 3500, school_id: school.id },
      { name: 'فوج الدعم - 3 ثانوي', teacher_id: teacherIds[0], monthly_price: 2500, school_id: school.id },
      { name: 'فوج بكالوريا ب - فيزياء', teacher_id: teacherIds[1], monthly_price: 3500, school_id: school.id },
      { name: 'فوج الدعم - BEM', teacher_id: teacherIds[1], monthly_price: 2000, school_id: school.id },
    ];

    const { data: groups, error: gErr } = await supabase.from('groups').insert(groupsToCreate).select();
    if (gErr) throw gErr;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    let totalStudents = 0;

    for (const group of groups) {
      const studentCount = 8 + Math.floor(Math.random() * 6);
      totalStudents += studentCount;
      const studentInserts = Array.from({ length: studentCount }, () => ({
        full_name: `${arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)]} ${arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)]}`,
        parent_phone: `0555${Math.floor(Math.random() * 900000 + 100000)}`,
        qr_code: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        school_id: school.id,
        independent_teacher_id: null,
      }));

      const { data: students, error: sErr } = await supabase.from('students').insert(studentInserts).select();
      if (sErr) throw sErr;

      await supabase.from('student_groups').insert(students.map(s => ({ student_id: s.id, group_id: group.id })));

      // 4 sessions per group
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        const { data: session } = await supabase.from('sessions').insert([{
          group_id: group.id,
          date: date.toISOString().split('T')[0],
          start_time: '14:00', end_time: '16:00',
          registered_by: group.teacher_id
        }]).select().single();

        if (session) {
          await supabase.from('attendance').insert(students.map(s => ({
            session_id: session.id, student_id: s.id,
            status: Math.random() > 0.12 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent'),
            registered_by: group.teacher_id,
          })));
        }
      }

      // Payments
      const payments = [];
      for (const student of students) {
        if (Math.random() > 0.25) payments.push({ student_id: student.id, group_id: group.id, amount: group.monthly_price, month_covered: currentMonth, received_by: managerId });
        if (Math.random() > 0.1) payments.push({ student_id: student.id, group_id: group.id, amount: group.monthly_price, month_covered: prevMonth, received_by: managerId });
      }
      if (payments.length > 0) await supabase.from('payments').insert(payments);
    }

    return NextResponse.json({
      success: true,
      message: `تم إنشاء ${groups.length} أفواج و${totalStudents} طالب و${teacherIds.length} أستاذ`
    });
  } catch (error: any) {
    console.error('Manager seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
