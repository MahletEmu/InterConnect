import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('id', '0defc809-1884-4a2e-aa35-13a56940462f');
  console.log('Company profile:', data, error);
}

check();
