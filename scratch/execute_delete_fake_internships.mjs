import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function remove() {
  const targetIds = [
    'efcab36e-b7ed-424d-86fb-0d11a3406792',
    'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c'
  ];

  console.log('Attempting to delete target internships:', targetIds);
  const { data, error } = await supabase
    .from('internships')
    .delete()
    .in('id', targetIds)
    .select();

  console.log('Delete result data:', data);
  console.log('Delete error:', error);

  // If RLS blocked anon delete, check whether we can update status to closed or if we need another approach
  const { data: remaining } = await supabase.from('internships').select('*');
  console.log('Remaining in DB:', remaining);
}

remove();
