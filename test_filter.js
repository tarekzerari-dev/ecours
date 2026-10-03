require('dotenv').config({path: '../../../../scratch/ecours/.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const teacherId = 'cb1ce363-2394-4d87-9b27-561b369527ec'; // a known teacher id from previous tests or auth
  
  let query = supabase.from('students').select(`
      id, full_name,
      student_groups!inner (
        group_id,
        groups!inner (name, teacher_id)
      )
    `).eq('student_groups.groups.teacher_id', teacherId);
  
  const { data, error } = await query;
  console.log("Teacher sees total students: ", data ? data.length : error);
}
run();
