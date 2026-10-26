import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '88285788-f38f-4f24-b04d-8424794cbb21');
  console.log('Profile:', data, error);
}

check();
