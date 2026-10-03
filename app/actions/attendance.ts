"use server";

import { createClient } from '@supabase/supabase-js';

const getAdminDb = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

function getSimilarity(s1: string, s2: string): number {
  // Normalize strings: lowercase, remove extra spaces
  const clean1 = s1.toLowerCase().trim().replace(/\s+/g, ' ');
  const clean2 = s2.toLowerCase().trim().replace(/\s+/g, ' ');
  
  if (clean1 === clean2) return 100;
  if (clean1.length === 0 || clean2.length === 0) return 0;
  
  const distance = levenshteinDistance(clean1, clean2);
  const maxLength = Math.max(clean1.length, clean2.length);
  return ((maxLength - distance) / maxLength) * 100;
}

export async function submitSelfScanAttendance(sessionId: string, studentName: string) {
  try {
    const supabase = getAdminDb();
    
    // 1. Get session details to find group_id
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select('group_id')
      .eq('id', sessionId)
      .single();
      
    if (sessionErr || !session) {
      return { success: false, error: 'الجلسة غير موجودة أو انتهت صلاحيتها' };
    }
    
    // 2. Get students in this group
    const { data: sgs, error: sgsErr } = await supabase
      .from('student_groups')
      .select('student_id, students(id, full_name)')
      .eq('group_id', session.group_id);
      
    if (sgsErr || !sgs || sgs.length === 0) {
      return { success: false, error: 'لا يوجد طلبة مسجلين في هذا الفوج' };
    }
    
    // 3. Find the best match
    let bestMatch = null;
    let highestScore = 0;
    
    for (const sg of sgs) {
      const student = sg.students as any;
      if (!student) continue;
      
      const score = getSimilarity(student.full_name, studentName);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = student;
      }
    }
    
    // Threshold of 70% similarity
    if (highestScore < 70 || !bestMatch) {
      return { 
        success: false, 
        error: 'لم يتم العثور على اسم مطابق في قائمة هذا الفوج. الرجاء التأكد من كتابة الاسم بشكل صحيح.',
        debug: { highestScore } // useful for local testing
      };
    }
    
    // Get teacher_id for registered_by
    const { data: g } = await supabase.from('groups').select('teacher_id').eq('id', session.group_id).single();
    
    // 4. Register attendance
    const { error: attErr } = await supabase
      .from('attendance')
      .upsert({
        session_id: sessionId,
        student_id: bestMatch.id,
        status: 'present',
        registered_by: g?.teacher_id || null
      }, { onConflict: 'session_id, student_id' });
      
    if (attErr) {
      return { success: false, error: 'حدث خطأ أثناء تسجيل الحضور في قاعدة البيانات' };
    }
    
    return { success: true, studentName: bestMatch.full_name };
    
  } catch (error: any) {
    console.error("Self-scan attendance error:", error);
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
}
