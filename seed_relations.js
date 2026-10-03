const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedRelations() {
  console.log("🔗 Linking Managers to Schools and Teachers...");
  
  // 1. Get profiles
  const { data: profiles } = await supabase.from('profiles').select('*');
  
  const manager = profiles.find(p => p.full_name === 'مدير مدرسة النجاح');
  const teacher = profiles.find(p => p.full_name === 'الأستاذ أحمد (مستقل)');

  if (!manager) return console.log("Missing manager");
  if (!teacher) return console.log("Missing teacher");

  // 2. Create Schools
  const { data: school1 } = await supabase.from('schools').insert({ manager_id: manager.id, name: 'مدرسة النجاح' }).select().single();
  
  console.log("🏫 Created Schools");

  // 3. Create Teacher Profiles
  await supabase.from('teacher_profiles').insert([
    { user_id: teacher.id, school_id: null, subject: 'رياضيات', phase: 'secondary' }, // Independent
  ]);

  console.log("👨‍🏫 Created Teacher Profiles");
  
  // 4. Create dummy groups for testing
  const { data: g1 } = await supabase.from('groups').insert({ name: 'الفوج الأول - رياضيات', teacher_id: teacher.id, monthly_price: 2500 }).select().single();
  
  console.log("👥 Created Dummy Groups");

  console.log("✅ All Relations Seeded!");
}

seedRelations();
