import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
  const { data, error } = await supabase.from('internships').select('*');
  console.log('Error:', error);
  console.log('All internships in DB count:', data?.length);
  if (data) {
    data.forEach(d => {
      console.log(`- ID: ${d.id} | Title: "${d.title}" | Status: ${d.status} | Deadline: ${d.application_deadline}`);
    });
  }
}

listAll();
