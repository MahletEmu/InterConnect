import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://whqdfovnuyndbkwbdfes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocWRmb3ZudXluZGJrd2JkZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNDUwNjMsImV4cCI6MjA1NTYyMTA2M30.6iY5zT2yD4dEslg_BvC_L_7s_W79i_wXg6qVvQeRk4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('internships').select('*, company_profiles(*)');
  console.log('Error:', error);
  console.log('Count of internships in DB:', data?.length);
  if (data && data.length > 0) {
    data.forEach(d => {
      console.log(`- [${d.id}] ${d.title} (${d.status}) Dept: ${d.department} Deadline: ${d.application_deadline}`);
    });
  }
}

check();
