const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTrigger() {
  console.log("🚀 Testing user creation to see detailed error...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_trigger_error@ecours.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Test',
      role: 'teacher'
    }
  });

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Success! User created:", data.user.id);
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}

testTrigger();
