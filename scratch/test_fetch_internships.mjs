import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('internships').select('*');
  console.log('Error:', error);
  console.log('Internships in DB:', data);
}

check();
