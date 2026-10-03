"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addTeacher(formData: FormData) {
  const email = (formData.get("email") as string) || `teacher_${Date.now()}_${Math.random().toString(36).substring(2,7)}@school.internal`;
  const password = (formData.get("password") as string) || `Pass_${Date.now()}_${Math.random().toString(36).substring(2,8)}`;
  const fullName = formData.get("fullName") as string;
  const phone = (formData.get("phone") as string) || "";
  const subject = (formData.get("subject") as string) || "عام";
  const phase = (formData.get("phase") as string) || "secondary";
  const monthlyFee = parseInt((formData.get("monthlyFee") as string) || "0");

  const cookieStore = await cookies();

  // We must use the SERVICE_ROLE_KEY to create a user without logging out the admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Do nothing on server actions
        },
      },
    }
  );

  try {
    // 1. Get Manager's school if available
    const { data: schools } = await supabase.from('schools').select('id').limit(1);
    const schoolId = schools?.[0]?.id || null;

    // 2. Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm
      user_metadata: { full_name: fullName, role: 'teacher' }
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "فشل في إنشاء حساب الأستاذ" };
    }

    // 3. Upsert profile with role 'teacher'
    await supabase.from('profiles').upsert([{
      id: authData.user.id,
      full_name: fullName,
      phone: phone,
      role: 'teacher'
    }], { onConflict: 'id' });

    // 4. Upsert teacher_profiles with school_id, subject, phase
    await supabase.from('teacher_profiles').upsert([{
      user_id: authData.user.id,
      school_id: schoolId,
      subject: subject,
      phase: phase,
      monthly_fee: monthlyFee
    }], { onConflict: 'user_id' });

    revalidatePath("/teachers");
    revalidatePath("/admin/teachers");
    return { success: true };

  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع" };
  }
}

export async function deleteTeacher(teacherId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    // Delete groups and cascading records
    await supabase.from('groups').delete().eq('teacher_id', teacherId);
    await supabase.from('teacher_profiles').delete().eq('user_id', teacherId);
    await supabase.from('profiles').delete().eq('id', teacherId);
    await supabase.auth.admin.deleteUser(teacherId).catch(() => {});

    revalidatePath("/teachers");
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "فشل حذف الأستاذ" };
  }
}

export async function addPayment(formData: FormData) {
  const teacherId = formData.get("teacherId") as string;
  const amount = parseInt(formData.get("amount") as string);
  const paymentDate = formData.get("paymentDate") as string;
  const monthCovered = formData.get("monthCovered") as string;
  const method = formData.get("method") as string;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    const { error } = await supabase.from("payments").insert({
      teacher_id: teacherId,
      amount,
      payment_date: paymentDate,
      month_covered: monthCovered,
      method,
    });

    if (error) return { error: error.message };
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "فشل تسجيل الدفعة" };
  }
}

export async function addSchool(formData: FormData) {
  const schoolName = formData.get("schoolName") as string;
  const address = (formData.get("address") as string) || "";
  const managerName = formData.get("managerName") as string;
  const managerPhone = (formData.get("managerPhone") as string) || "";
  const managerEmail = (formData.get("managerEmail") as string) || `manager_${Date.now()}@school.internal`;
  const managerPassword = (formData.get("managerPassword") as string) || `Pass_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    // 1. Create Manager Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: managerEmail,
      password: managerPassword,
      email_confirm: true,
      user_metadata: { full_name: managerName, role: 'manager' }
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "فشل إنشاء حساب المدير" };

    // 2. Upsert profile for manager
    await supabase.from('profiles').upsert([{
      id: authData.user.id,
      full_name: managerName,
      phone: managerPhone,
      role: 'manager'
    }], { onConflict: 'id' });

    // 3. Create school
    const { data: schoolData, error: schoolError } = await supabase.from('schools').insert([{
      name: schoolName,
      address: address,
      manager_id: authData.user.id
    }]).select().single();

    if (schoolError) return { error: schoolError.message };

    revalidatePath("/admin/schools");
    revalidatePath("/admin");
    return { success: true, school: schoolData };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ أثناء إضافة المدرسة" };
  }
}

export async function deleteSchool(schoolId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    // Delete school and cascading groups/data
    await supabase.from('schools').delete().eq('id', schoolId);
    revalidatePath("/admin/schools");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "فشل حذف المدرسة" };
  }
}
