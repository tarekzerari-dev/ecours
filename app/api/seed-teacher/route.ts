import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Seed data for TEACHER role: groups + students + sessions + payments for their account
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const body = await req.json().catch(() => ({}));
  let teacherId: string | undefined = body.teacherId;

  try {
    // Resolve a real teacher user if teacherId is missing or invalid
    let validTeacher = null;
    if (teacherId && teacherId !== 'dev_user_123' && teacherId !== '00000000-0000-0000-0000-000000000000') {
      const { data: prof } = await supabase.from('profiles').select('id').eq('id', teacherId).maybeSingle();
      if (prof) validTeacher = prof.id;
    }

    if (!validTeacher) {
      // Find an existing teacher profile
      const { data: existingProf } = await supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).maybeSingle();
      if (existingProf) {
        validTeacher = existingProf.id;
      } else {
        // Create a teacher user
        const { data: users } = await supabase.auth.admin.listUsers();
        let user = users?.users?.find(u => u.email === 'ahmed@ecours.com' || u.email?.includes('teacher'));
        if (!user) {
          const { data: newUser, error: uErr } = await supabase.auth.admin.createUser({
            email: 'ahmed@ecours.com',
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: 'الأستاذ أحمد', role: 'teacher' }
          });
          if (uErr) throw uErr;
          user = newUser.user;
        }
        await supabase.from('profiles').upsert([{ id: user.id, full_name: 'الأستاذ أحمد', role: 'teacher' }], { onConflict: 'id' });
        await supabase.from('teacher_profiles').upsert([{ user_id: user.id, subject: 'رياضيات', phase: 'secondary' }], { onConflict: 'user_id' });
        validTeacher = user.id;
      }
    }

    teacherId = validTeacher;

    const arabicFirstNames = ['محمد', 'أحمد', 'سارة', 'فاطمة', 'ياسين', 'أمينة', 'خالد', 'كريم', 'مريم', 'يوسف', 'عمر', 'علي', 'زينب', 'نور', 'بلال'];
    const arabicLastNames = ['بن علي', 'منصور', 'خالد', 'سعيد', 'عبد الله', 'سليمان', 'إبراهيم', 'مصطفى', 'عثمان', 'عبد الرحمن'];

    const groupsData = [
      { name: 'فوج بكالوريا 1', monthly_price: 3000 },
      { name: 'فوج 3 ثانوي أ', monthly_price: 2500 },
      { name: 'فوج الدعم - BEM', monthly_price: 2000 },
    ];

    // Clean up existing data first
    const { data: existingGroups } = await supabase
      .from('groups')
      .select('id')
      .eq('teacher_id', teacherId);

    if (existingGroups && existingGroups.length > 0) {
      const groupIds = existingGroups.map(g => g.id);
      await supabase.from('payments').delete().in('group_id', groupIds);
      const { data: sessions } = await supabase.from('sessions').select('id').in('group_id', groupIds);
      if (sessions?.length) {
        await supabase.from('attendance').delete().in('session_id', sessions.map(s => s.id));
      }
      await supabase.from('sessions').delete().in('group_id', groupIds);
      const { data: enrollments } = await supabase.from('student_groups').select('student_id').in('group_id', groupIds);
      if (enrollments?.length) {
        await supabase.from('student_groups').delete().in('group_id', groupIds);
        await supabase.from('students').delete().in('id', enrollments.map(e => e.student_id));
      }
      await supabase.from('groups').delete().in('id', groupIds);
    }

    // Create groups
    const { data: groups, error: gErr } = await supabase
      .from('groups')
      .insert(groupsData.map(g => ({ ...g, teacher_id: teacherId, school_id: null })))
      .select();
    if (gErr) throw gErr;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    for (const group of groups) {
      const studentCount = 6 + Math.floor(Math.random() * 5);
      const studentInserts = Array.from({ length: studentCount }, () => {
        const fn = arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)];
        const ln = arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];
        return {
          full_name: `${fn} ${ln}`,
          parent_phone: `0555${Math.floor(Math.random() * 900000 + 100000)}`,
          qr_code: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          school_id: null,
          independent_teacher_id: teacherId,
        };
      });

      const { data: students, error: sErr } = await supabase.from('students').insert(studentInserts).select();
      if (sErr) throw sErr;

      await supabase.from('student_groups').insert(students.map(s => ({ student_id: s.id, group_id: group.id })));

      // Sessions (3 past sessions)
      for (let i = 2; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        const { data: session } = await supabase.from('sessions').insert([{
          group_id: group.id,
          date: date.toISOString().split('T')[0],
          start_time: '14:00',
          end_time: '16:00',
          registered_by: teacherId
        }]).select().single();

        if (session) {
          await supabase.from('attendance').insert(students.map(s => ({
            session_id: session.id,
            student_id: s.id,
            status: Math.random() > 0.15 ? 'present' : 'absent',
            registered_by: teacherId,
          })));
        }
      }

      // Payments: ~70% paid this month, ~85% paid last month
      const payments = [];
      for (const student of students) {
        if (Math.random() > 0.3) {
          payments.push({ student_id: student.id, group_id: group.id, amount: group.monthly_price, month_covered: currentMonth, received_by: teacherId });
        }
        if (Math.random() > 0.15) {
          payments.push({ student_id: student.id, group_id: group.id, amount: group.monthly_price, month_covered: prevMonth, received_by: teacherId });
        }
      }
      if (payments.length > 0) await supabase.from('payments').insert(payments);
    }

    return NextResponse.json({ success: true, message: `تم إنشاء ${groups.length} أفواج بنجاح` });
  } catch (error: any) {
    console.error('Teacher seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
