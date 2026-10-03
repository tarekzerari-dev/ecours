"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const fullName = formData.get("fullName") as string;
  
  if (fullName) {
    // 1. Update Auth Meta Data
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    
    if (authError) return { error: authError.message };

    // 2. Update Teacher Profile Table (if they are a teacher)
    // We try to update, if they are admin it might fail silently or not match, which is fine
    await supabase
      .from('teacher_profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const newPassword = formData.get("newPassword") as string;

  if (newPassword && newPassword.length >= 6) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) return { error: error.message };
  } else {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }

  return { success: true };
}
