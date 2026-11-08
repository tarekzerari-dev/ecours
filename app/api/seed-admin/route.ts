import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Comprehensive Seed Data for SUPERADMIN:
// 1. Schools & Managers
// 2. Affiliated Teachers (with groups, students, sessions, payments under schools)
// 3. Independent Teachers (with groups, students, sessions, payments, independent_teacher_id)
export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userMap = new Map((existingUsers?.users || []).map(u => [u.email, u]));

    const getOrCreateUser = async (email: string, fullName: string, role: 'superadmin' | 'manager' | 'teacher') => {
      let user = userMap.get(email);
      if (!user) {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email,
          password: 'DemoPass123!',
          email_confirm: true,
          user_metadata: { full_name: fullName, role }
        });
        if (error) throw new Error(`User creation failed for ${email}: ${error.message}`);
        user = newUser.user;
        userMap.set(email, user);
      }

      await supabase.from('profiles').upsert([{
        id: user.id,
        full_name: fullName,
        role: role,
        phone: '0550' + Math.floor(100000 + Math.random() * 900000)
      }], { onConflict: 'id' });

      return user;
    };

    // 0. Super Admin (System Administrator)
    await getOrCreateUser('admin@ecours.com', 'المدير العام للمنصة', 'superadmin');

    let totalSchools = 0;
    let totalTeachers = 0;
    let totalGroups = 0;
    let totalStudents = 0;
    let totalPayments = 0;

    const studentFirstNames = [
      'يوسف', 'أمينة', 'محمد أمين', 'خديجة', 'عبد الرحيم', 'سارة', 'أنس', 'نورهان',
      'صهيب', 'إيناس', 'رمزي', 'مروة', 'إسلام', 'سلمى', 'وليد', 'فاطمة الزهراء',
      'أيمن', 'هاجر', 'بلال', 'ريان', 'ياسمين', 'حمزة', 'أسماء', 'زكرياء'
    ];

    const studentLastNames = [
      'بلقاسم', 'طاهري', 'شريف', 'حمدي', 'زايدي', 'بن عمار', 'بوزيد', 'قاسم',
      'بوزيان', 'عيساوي', 'بن عبد الله', 'قندوز', 'بوجلال', 'قاسي', 'منصوري', 'علوي',
      'عماري', 'مساعدية', 'بوعلام', 'دريدي', 'سليماني', 'سعيدي', 'رحماني', 'مقداد'
    ];

    // -------------------------------------------------------------
    // 1. Schools, Managers, and Affiliated Teachers
    // -------------------------------------------------------------
    const schoolsData = [
      {
        managerEmail: 'manager_algiers@ecours.demo',
        managerName: 'أحمد بن سالم',
        managerPhone: '0550112233',
        schoolName: 'أكاديمية النجاح التعليمية',
        schoolAddress: 'الجزائر العاصمة - القبة',
        teachers: [
          {
            email: 'teacher_mourad@ecours.demo',
            name: 'الأستاذ مراد قادري',
            phone: '0661223344',
            subject: 'الرياضيات',
            phase: 'secondary' as const,
            fee: 3500,
            groups: [
              { name: 'رياضيات 3 ثانوي - شعبة علوم تجريبية', level: '3AS', price: 2500, count: 6 },
              { name: 'رياضيات 2 ثانوي - شعبة رياضيات', level: '2AS', price: 2200, count: 5 }
            ]
          },
          {
            email: 'teacher_meriem@ecours.demo',
            name: 'الأستاذة مريم علام',
            phone: '0770334455',
            subject: 'علوم الطبيعة والحياة',
            phase: 'secondary' as const,
            fee: 3000,
            groups: [
              { name: 'علوم طبيعية 3 ثانوي - بكالوريا', level: '3AS', price: 2400, count: 6 }
            ]
          }
        ]
      },
      {
        managerEmail: 'manager_oran@ecours.demo',
        managerName: 'كمال تواتي',
        managerPhone: '0555889900',
        schoolName: 'معهد النخبة للدروس واللغات',
        schoolAddress: 'وهران - الصديقية',
        teachers: [
          {
            email: 'teacher_radouane@ecours.demo',
            name: 'الأستاذ رضوان يحيى',
            phone: '0663778899',
            subject: 'الفيزياء',
            phase: 'secondary' as const,
            fee: 4000,
            groups: [
              { name: 'فيزياء 3 ثانوي - مراجعة شاملة', level: '3AS', price: 2600, count: 6 },
              { name: 'فيزياء 4 متوسط - BEM', level: '4AM', price: 2000, count: 5 }
            ]
          },
          {
            email: 'teacher_yasmine@ecours.demo',
            name: 'الأستاذة ياسمين بوحفص',
            phone: '0775112244',
            subject: 'اللغة الإنجليزية',
            phase: 'middle' as const,
            fee: 2500,
            groups: [
              { name: 'إنجليزية 4 متوسط - تحضير BEM', level: '4AM', price: 1800, count: 5 }
            ]
          }
        ]
      }
    ];

    let studentIndexCounter = 1;

    for (const sData of schoolsData) {
      const managerUser = await getOrCreateUser(sData.managerEmail, sData.managerName, 'manager');
      
      let { data: school } = await supabase.from('schools').select('*').eq('manager_id', managerUser.id).limit(1).maybeSingle();
      if (!school) {
        const { data: newSchool, error: sErr } = await supabase.from('schools').insert([{
          manager_id: managerUser.id,
          name: sData.schoolName,
          address: sData.schoolAddress
        }]).select().single();
        if (sErr) throw new Error(`School creation failed: ${sErr.message}`);
        school = newSchool;
      }
      totalSchools++;

      for (const tData of sData.teachers) {
        const teacherUser = await getOrCreateUser(tData.email, tData.name, 'teacher');
        await supabase.from('teacher_profiles').upsert([{
          user_id: teacherUser.id,
          school_id: school.id, // Affiliated Teacher
          subject: tData.subject,
          phase: tData.phase,
          monthly_fee: tData.fee,
          is_active: true
        }], { onConflict: 'user_id' });
        totalTeachers++;

        for (const gData of tData.groups) {
          let { data: existingGroup } = await supabase.from('groups').select('id').eq('teacher_id', teacherUser.id).eq('name', gData.name).limit(1).maybeSingle();
          let groupId = existingGroup?.id;

          if (!groupId) {
            const { data: newGroup, error: gErr } = await supabase.from('groups').insert([{
              name: gData.name,
              teacher_id: teacherUser.id,
              school_id: school.id,
              monthly_price: gData.price
            }]).select().single();
            if (gErr) {
              console.error("Group creation error:", gErr);
              throw new Error(`Failed to create group ${gData.name}: ${gErr.message}`);
            }
            groupId = newGroup.id;
          }
          totalGroups++;

          for (let i = 0; i < gData.count; i++) {
            const firstName = studentFirstNames[studentIndexCounter % studentFirstNames.length];
            const lastName = studentLastNames[(studentIndexCounter * 3) % studentLastNames.length];
            const fullName = `${firstName} ${lastName}`;
            const qrCode = `QR_${school.id.substring(0, 4)}_${groupId.substring(0, 4)}_${i + 1}`;
            studentIndexCounter++;

            let { data: existingStudent } = await supabase.from('students').select('id').eq('qr_code', qrCode).limit(1).maybeSingle();
            let studentId = existingStudent?.id;

            if (!studentId) {
              const { data: newStudent, error: stErr } = await supabase.from('students').insert([{
                full_name: fullName,
                phone_number: `0655${Math.floor(100000 + Math.random() * 900000)}`,
                parent_phone: `0550${Math.floor(100000 + Math.random() * 900000)}`,
                school_id: school.id,
                qr_code: qrCode
              }]).select().single();
              if (stErr) {
                console.error("Student creation error:", stErr);
                throw new Error(`Failed to create student ${fullName}: ${stErr.message}`);
              }
              studentId = newStudent.id;
            }
            totalStudents++;

            // Link to student_groups
            await supabase.from('student_groups').upsert([{
              student_id: studentId,
              group_id: groupId
            }], { onConflict: 'student_id,group_id' });

            // Create payment
            await supabase.from('payments').insert([{
              student_id: studentId,
              group_id: groupId,
              amount: gData.price,
              month_covered: '2026-08',
              received_by: managerUser.id
            }]);
            totalPayments++;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // 2. Independent Teachers (school_id = NULL)
    // -------------------------------------------------------------
    const independentTeachersData = [
      {
        email: 'independent_mansouri@ecours.demo',
        name: 'الأستاذ عبد الرحمن منصوري',
        phone: '0661998877',
        subject: 'الرياضيات المتقدمة',
        phase: 'secondary' as const,
        groups: [
          { name: 'نخبة الرياضيات - بكالوريا حر', level: '3AS', price: 3000, count: 6 },
          { name: 'دوال وتحليل رياضي 2 ثانوي', level: '2AS', price: 2500, count: 5 }
        ]
      },
      {
        email: 'independent_sarah@ecours.demo',
        name: 'الأستاذة سارة بلال',
        phone: '0770556677',
        subject: 'اللغة الفرنسية والأدب',
        phase: 'secondary' as const,
        groups: [
          { name: 'الفرنسية للمقبلين على البكالوريا', level: '3AS', price: 2800, count: 6 }
        ]
      }
    ];

    for (const tData of independentTeachersData) {
      const teacherUser = await getOrCreateUser(tData.email, tData.name, 'teacher');
      
      // Independent Teacher: school_id is NULL
      await supabase.from('teacher_profiles').upsert([{
        user_id: teacherUser.id,
        school_id: null,
        subject: tData.subject,
        phase: tData.phase,
        monthly_fee: 0,
        is_active: true
      }], { onConflict: 'user_id' });
      totalTeachers++;

      for (const gData of tData.groups) {
        let { data: existingGroup } = await supabase.from('groups').select('id').eq('teacher_id', teacherUser.id).eq('name', gData.name).limit(1).maybeSingle();
        let groupId = existingGroup?.id;

        if (!groupId) {
          const { data: newGroup, error: gErr } = await supabase.from('groups').insert([{
            name: gData.name,
            teacher_id: teacherUser.id,
            school_id: null, // Independent group
            monthly_price: gData.price
          }]).select().single();
          if (gErr) {
            console.error("Independent group creation error:", gErr);
            throw new Error(`Failed to create independent group ${gData.name}: ${gErr.message}`);
          }
          groupId = newGroup.id;
        }
        totalGroups++;

        for (let i = 0; i < gData.count; i++) {
          const firstName = studentFirstNames[(studentIndexCounter + 5) % studentFirstNames.length];
          const lastName = studentLastNames[(studentIndexCounter * 7) % studentLastNames.length];
          const fullName = `${firstName} ${lastName}`;
          const qrCode = `QR_IND_${teacherUser.id.substring(0, 4)}_${groupId.substring(0, 4)}_${i + 1}`;
          studentIndexCounter++;

          let { data: existingStudent } = await supabase.from('students').select('id').eq('qr_code', qrCode).limit(1).maybeSingle();
          let studentId = existingStudent?.id;

          if (!studentId) {
            const { data: newStudent, error: stErr } = await supabase.from('students').insert([{
              full_name: fullName,
              phone_number: `0677${Math.floor(100000 + Math.random() * 900000)}`,
              parent_phone: `0660${Math.floor(100000 + Math.random() * 900000)}`,
              school_id: null,
              independent_teacher_id: teacherUser.id,
              qr_code: qrCode
            }]).select().single();
            if (stErr) {
              console.error("Independent student creation error:", stErr);
              throw new Error(`Failed to create independent student ${fullName}: ${stErr.message}`);
            }
            studentId = newStudent.id;
          }
          totalStudents++;

          // Link to student_groups
          await supabase.from('student_groups').upsert([{
            student_id: studentId,
            group_id: groupId
          }], { onConflict: 'student_id,group_id' });

          // Payment received by independent teacher directly
          await supabase.from('payments').insert([{
            student_id: studentId,
            group_id: groupId,
            amount: gData.price,
            month_covered: '2026-08',
            received_by: teacherUser.id
          }]);
          totalPayments++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم تهيئة البيانات التجريبية للمنصة بنجاح:\n• ${totalSchools} مدارس\n• ${totalTeachers} أساتذة (تابعون ومستقلون)\n• ${totalGroups} أفواج دراسية\n• ${totalStudents} طالب مسجل\n• ${totalPayments} عملية دفع`,
      stats: { totalSchools, totalTeachers, totalGroups, totalStudents, totalPayments }
    });

  } catch (error: any) {
    console.error('Superadmin seed error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تهيئة البيانات' },
      { status: 500 }
    );
  }
}
