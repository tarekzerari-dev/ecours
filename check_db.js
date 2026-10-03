const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log("🔍 Checking database tables...");
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.log("❌ Error fetching from profiles table:", error.message);
  } else {
    console.log("✅ Profiles table exists!");
  }
}

checkDatabase();
