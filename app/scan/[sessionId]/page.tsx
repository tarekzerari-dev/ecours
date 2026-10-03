import { createClient } from '@supabase/supabase-js';
import ScanClient from './scan-client';
import { notFound } from 'next/navigation';

// Initialize Supabase admin client
const getAdminDb = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export default async function ScanSessionPage({ params }: { params: { sessionId: string } }) {
  const supabase = getAdminDb();
  
  // Fetch session and group details
  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, date, start_time, groups(name)')
    .eq('id', params.sessionId)
    .single();

  if (error || !session) {
    return notFound();
  }

  const groupName = (session.groups as any)?.name || 'فوج غير معروف';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <ScanClient sessionId={session.id} groupName={groupName} date={session.date} />
    </main>
  );
}
