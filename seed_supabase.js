const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedData() {
  console.log("🚀 Seeding Manager Platform Data...");

  try {
    // 1. Get the manager account
    const { data: managerProfile, error: mErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'manager')
      .limit(1)
      .single();

    if (mErr || !managerProfile) {
      console.log("❌ Manager profile not found. Please run the original seed script first.");
      return;
    }
    const managerId = managerProfile.id;
    console.log(`✅ Found Manager: ${managerProfile.full_name} (${managerId})`);

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
    console.log(`✅ School: ${school.name}`);

    // 3. Create Teachers (And auth users for them? Or just use existing profile?)
    // Let's create fake profiles just for teachers without auth.users, BUT wait, profiles has a foreign key to auth.users!
    // We MUST create auth users first.
    console.log("👨‍🏫 Creating 3 Teachers...");
    const teachersData = [
      { email: 'teacher1@ecours.com', password: 'password123', name: 'الأستاذ أحمد', role: 'teacher', subject: 'رياضيات', phase: 'secondary' },
      { email: 'teacher2@ecours.com', password: 'password123', name: 'الأستاذة سارة', role: 'teacher', subject: 'فيزياء', phase: 'secondary' },
      { email: 'teacher3@ecours.com', password: 'password123', name: 'الأستاذ كريم', role: 'teacher', subject: 'لغة إنجليزية', phase: 'middle' }
    ];
    
    const teacherProfiles = [];
    for (const t of teachersData) {
      // Check if user exists first to avoid errors
      const { data: users, error: checkErr } = await supabase.auth.admin.listUsers();
      let user = users?.users.find(u => u.email === t.email);
      
      if (!user) {
        const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
          email: t.email, password: t.password, email_confirm: true,
          user_metadata: { full_name: t.name, role: t.role }
        });
        if (uErr) throw uErr;
        user = newUser.user;
      }
      
      // Upsert teacher profile
      await supabase.from('teacher_profiles').upsert([{
        user_id: user.id,
        school_id: school.id,
        subject: t.subject,
        phase: t.phase
      }], { onConflict: 'user_id' });
      
      teacherProfiles.push(user.id);
    }
    console.log("✅ 3 Teachers Created.");

    // 4. Create Groups
    console.log("📚 Creating Groups...");
    const groupsToInsert = [
      { name: 'الفوج الأول - بكالوريا', teacher_id: teacherProfiles[0], school_id: school.id, monthly_price: 3000 },
      { name: 'فوج الدعم - 2 ثانوي', teacher_id: teacherProfiles[0], school_id: school.id, monthly_price: 2500 },
      { name: 'الفوج الأول - BEM', teacher_id: teacherProfiles[1], school_id: school.id, monthly_price: 2500 },
      { name: 'إنجليزية عامة - مبتدئين', teacher_id: teacherProfiles[2], school_id: school.id, monthly_price: 1500 },
    ];
    
    // Clear old groups
    await supabase.from('groups').delete().eq('school_id', school.id);

    const { data: groups, error: gErr } = await supabase.from('groups').insert(groupsToInsert).select();
    if (gErr) throw gErr;
    console.log(`✅ ${groups.length} Groups Created.`);

    // 5. Create Students & Enroll them
    console.log("👨‍🎓 Creating Students...");
    const arabicNames = ['محمد', 'أحمد', 'سارة', 'فاطمة', 'ياسين', 'أمينة', 'خالد', 'كريم', 'مريم', 'يوسف', 'عمر', 'علي', 'زينب', 'خديجة', 'بلال'];
    const lastNames = ['بن علي', 'منصور', 'خالد', 'سعيد', 'عبد الله', 'سليمان', 'إبراهيم', 'مصطفى', 'عثمان', 'عبد الرحمن'];
    
    // Create 5 students per group
    const allStudents = [];
    for (const group of groups) {
      for (let i = 0; i < 5; i++) {
        const firstName = arabicNames[Math.floor(Math.random() * arabicNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        allStudents.push({
          full_name: `${firstName} ${lastName}`,
          parent_phone: `0555${Math.floor(Math.random() * 900000 + 100000)}`,
          qr_code: `QR_${group.id.substring(0,8)}_${i}`,
          school_id: school.id
        });
      }
    }
    
    const { data: insertedStudents, error: stuErr } = await supabase.from('students').insert(allStudents).select();
    if (stuErr) throw stuErr;
    
    // Enroll
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
    console.log(`✅ ${insertedStudents.length} Students Created and Enrolled.`);

    // 6. Create Finances (Payments)
    console.log("💰 Recording Payments...");
    const payments = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    for (const student of insertedStudents) {
      // 70% chance to have paid
      if (Math.random() > 0.3) {
        const enrollment = enrollments.find(e => e.student_id === student.id);
        const group = groups.find(g => g.id === enrollment.group_id);
        
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
    console.log(`✅ ${payments.length} Payments Recorded.`);

    // 7. Create Sessions & Attendance
    console.log("📅 Creating Sessions and Attendance...");
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
    console.log(`✅ Sessions & Attendance Recorded.`);

    console.log("🎉 ALL MOCK DATA SEEDED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedData();
