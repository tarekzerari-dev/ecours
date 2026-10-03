
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("--- Fetching Students ---");
  let query = supabase.from('students').select(`
      id, full_name,
      student_groups!inner (
        group_id,
        groups (name)
      )
    `);
  
  const { data, error } = await query;
  console.log("Teacher sees total students: ", data ? data.length : error);

  console.log("--- Fetching Payments ---");
  let pQuery = supabase.from('payments').select('id, amount, groups!inner(name, school_id)');
  const { data: pData, error: pError } = await pQuery;
  console.log("Teacher sees total payments: ", pData ? pData.length : pError);
}
run();
