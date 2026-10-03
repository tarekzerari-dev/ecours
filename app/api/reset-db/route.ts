import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // We must delete in reverse order of foreign key dependencies to avoid constraint violations
    // We use .not('id', 'is', null) which safely matches everything regardless of UUID or String type
    // We MUST use .throwOnError() to catch actual DB errors

    console.log("Deleting payments...");
    await supabase.from('payments').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting attendance...");
    await supabase.from('attendance').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting sessions...");
    await supabase.from('sessions').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting student_groups...");
    // student_groups uses composite keys, so we check student_id
    await supabase.from('student_groups').delete().not('student_id', 'is', null).throwOnError();

    console.log("Deleting students...");
    await supabase.from('students').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting groups...");
    await supabase.from('groups').delete().not('id', 'is', null).throwOnError();

    // teacher_profiles exists, we should delete it before profiles!
    console.log("Deleting teacher_profiles...");
    await supabase.from('teacher_profiles').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting schools...");
    await supabase.from('schools').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting profiles...");
    await supabase.from('profiles').delete().not('id', 'is', null).throwOnError();

    console.log("Deleting Auth users...");
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw listErr;
    
    if (users && users.users) {
      for (const user of users.users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

    return NextResponse.json({ message: "تم حذف جميع البيانات بنجاح!" });
  } catch (err: any) {
    console.error("Reset DB Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حذف البيانات" }, { status: 500 });
  }
}
