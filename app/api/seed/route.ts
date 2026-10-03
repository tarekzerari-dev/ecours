import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 1. Get the manager account
    const { data: managerProfile, error: mErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'manager')
      .limit(1)
      .single();

    if (mErr || !managerProfile) {
      return NextResponse.json({ error: "Manager profile not found" }, { status: 400 });
    }
    const managerId = managerProfile.id;

    // 2. Create School for Manager
    let { data: school, error: sErr } = await supabase
      .from('schools')
      .select('*')
      .eq('manager_id', managerId)
      .limit(1)
      .single();

    if (!school) {
      const { data: newSchool, error: nsErr } = await supabase
        .from('schools')
        .insert([{ manager_id: managerId, name: 'مدرسة التفوق' }])
        .select().single();
      if (nsErr) throw nsErr;
      school = newSchool;
    }

    // 3. Create Teachers (Affiliated and Independent)
    const teachersData = [
      { email: 'teacher1@ecours.com', password: 'password123', name: 'الأستاذ أحمد (تابع للمدرسة)', role: 'teacher', subject: 'رياضيات', phase: 'secondary', isIndependent: false },
      { email: 'teacher2@ecours.com', password: 'password123', name: 'الأستاذة سارة (تابعة للمدرسة)', role: 'teacher', subject: 'فيزياء', phase: 'secondary', isIndependent: false },
      { email: 'teacher_ind1@ecours.com', password: 'password123', name: 'الأستاذ خالد (مستقل)', role: 'teacher', subject: 'لغة إنجليزية', phase: 'middle', isIndependent: true },
      { email: 'teacher_ind2@ecours.com', password: 'password123', name: 'الأستاذة مريم (مستقلة)', role: 'teacher', subject: 'علوم', phase: 'secondary', isIndependent: true }
    ];
    
    const teacherProfiles = [];
    const indTeacherProfiles = [];
    
    for (const t of teachersData) {
      const { data: users, error: checkErr } = await supabase.auth.admin.listUsers();
      let user = users?.users?.find(u => u.email === t.email);
      
      if (!user) {
        const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
          email: t.email, password: t.password, email_confirm: true,
          user_metadata: { full_name: t.name, role: t.role }
        });
        if (uErr) throw uErr;
        user = newUser.user;
      }
      
      await supabase.from('teacher_profiles').upsert([{
        user_id: user.id,
        school_id: t.isIndependent ? null : school.id,
        subject: t.subject,
        phase: t.phase
      }], { onConflict: 'user_id' });
      
      if (t.isIndependent) {
        indTeacherProfiles.push(user.id);
      } else {
        teacherProfiles.push(user.id);
      }
    }

    // 4. Create Groups
    const groupsToInsert = [
      // Affiliated groups
      { name: 'الفوج الأول - بكالوريا', teacher_id: teacherProfiles[0], school_id: school.id, monthly_price: 3000 },
      { name: 'فوج الدعم - 2 ثانوي', teacher_id: teacherProfiles[0], school_id: school.id, monthly_price: 2500 },
      { name: 'الفوج الأول - BEM', teacher_id: teacherProfiles[1], school_id: school.id, monthly_price: 2500 },
      // Independent groups
      { name: 'إنجليزية عامة - مستقل', teacher_id: indTeacherProfiles[0], school_id: null, monthly_price: 1500 },
      { name: 'علوم بكالوريا - مستقل', teacher_id: indTeacherProfiles[1], school_id: null, monthly_price: 3500 },
    ];
    
    await supabase.from('groups').delete().eq('school_id', school.id);
    await supabase.from('groups').delete().is('school_id', null);
    
    const { data: groups, error: gErr } = await supabase.from('groups').insert(groupsToInsert).select();
    if (gErr) throw gErr;

    // 5. Create Students & Enroll them
    const arabicNames = ['محمد', 'أحمد', 'سارة', 'فاطمة', 'ياسين', 'أمينة', 'خالد', 'كريم', 'مريم', 'يوسف', 'عمر', 'علي', 'زينب', 'خديجة', 'بلال'];
    const lastNames = ['بن علي', 'منصور', 'خالد', 'سعيد', 'عبد الله', 'سليمان', 'إبراهيم', 'مصطفى', 'عثمان', 'عبد الرحمن'];
    
    const allStudents = [];
    for (const group of groups) {
      for (let i = 0; i < 5; i++) {
        const firstName = arabicNames[Math.floor(Math.random() * arabicNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        allStudents.push({
          full_name: `${firstName} ${lastName}`,
          parent_phone: `0555${Math.floor(Math.random() * 900000 + 100000)}`,
          qr_code: `QR_${group.id.substring(0,8)}_${i}`,
          school_id: group.school_id, // If null, student is independent
          independent_teacher_id: group.school_id ? null : group.teacher_id
        });
      }
    }
    
    const { data: insertedStudents, error: stuErr } = await supabase.from('students').insert(allStudents).select();
    if (stuErr) throw stuErr;
    
    const enrollments = [];
    let sIdx = 0;
    for (const group of groups) {
      for (let i = 0; i < 5; i++) {
        enrollments.push({
          student_id: insertedStudents[sIdx].id,
          group_id: group.id
        });
        sIdx++;
      }
    }
    await supabase.from('student_groups').insert(enrollments);

    // 6. Create Finances (Payments)
    const payments = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    for (const student of insertedStudents) {
      if (Math.random() > 0.3) {
        const enrollment = enrollments.find(e => e.student_id === student.id);
        if (!enrollment) continue;
        const group = groups.find(g => g.id === enrollment.group_id);
        if (!group) continue;
        
        payments.push({
          student_id: student.id,
          group_id: group.id,
          amount: group.monthly_price,
          month_covered: currentMonth,
          received_by: managerId
        });
      }
    }
    if (payments.length > 0) {
       await supabase.from('payments').insert(payments);
    }

    // 7. Create Sessions & Attendance
    for (const group of groups) {
      const { data: session, error: sesErr } = await supabase.from('sessions').insert([{
        group_id: group.id,
        date: new Date().toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '16:00',
        registered_by: managerId
      }]).select().single();
      if (sesErr) throw sesErr;

      const groupStudents = enrollments.filter(e => e.group_id === group.id).map(e => e.student_id);
      const attendance = groupStudents.map(stuId => ({
        session_id: session.id,
        student_id: stuId,
        status: Math.random() > 0.2 ? 'present' : 'absent',
        registered_by: managerId
      }));
      
      await supabase.from('attendance').insert(attendance);
    }

    return NextResponse.json({ success: true, message: "Data seeded successfully" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
