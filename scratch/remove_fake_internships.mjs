import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebabmayrlruxbuchhllw.supabase.co';
const supabaseKey = 'sb_publishable_s-KgjFgi9zYtShj_T1W86w_PdYeDVC2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const targetIds = [
    'efcab36e-b7ed-424d-86fb-0d11a3406792',
    'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c'
  ];

  console.log('Checking target internships:', targetIds);
  const { data: interns, error: intErr } = await supabase
    .from('internships')
    .select('*')
    .in('id', targetIds);
  console.log('Found internships:', interns);

  // Check saved_internships
  const { data: saved, error: savErr } = await supabase
    .from('saved_internships')
    .select('*')
    .in('internship_id', targetIds);
  console.log('Referencing saved_internships:', saved?.length, savErr || '');

  // Check applications
  const { data: apps, error: appErr } = await supabase
    .from('applications')
    .select('*')
    .in('internship_id', targetIds);
  console.log('Referencing applications:', apps?.length, appErr || '');

  // Check internship_skills
  const { data: skills, error: sklErr } = await supabase
    .from('internship_skills')
    .select('*')
    .in('internship_id', targetIds);
  console.log('Referencing internship_skills:', skills?.length, sklErr || '');
}

inspect();
