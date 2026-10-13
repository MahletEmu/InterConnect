-- SEED DATA: Realistic InterConnect Development Data
-- Run this AFTER the initial schema migration

-- =====================================================
-- SEED: SKILLS
-- =====================================================
INSERT INTO public.skills (id, name, category) VALUES
  ('11111111-0000-0000-0000-000000000001', 'JavaScript', 'Programming'),
  ('11111111-0000-0000-0000-000000000002', 'TypeScript', 'Programming'),
  ('11111111-0000-0000-0000-000000000003', 'Python', 'Programming'),
  ('11111111-0000-0000-0000-000000000004', 'Java', 'Programming'),
  ('11111111-0000-0000-0000-000000000005', 'React', 'Frontend'),
  ('11111111-0000-0000-0000-000000000006', 'Next.js', 'Frontend'),
  ('11111111-0000-0000-0000-000000000007', 'Vue.js', 'Frontend'),
  ('11111111-0000-0000-0000-000000000008', 'Node.js', 'Backend'),
  ('11111111-0000-0000-0000-000000000009', 'Express.js', 'Backend'),
  ('11111111-0000-0000-0000-000000000010', 'Django', 'Backend'),
  ('11111111-0000-0000-0000-000000000011', 'FastAPI', 'Backend'),
  ('11111111-0000-0000-0000-000000000012', 'PostgreSQL', 'Database'),
  ('11111111-0000-0000-0000-000000000013', 'MongoDB', 'Database'),
  ('11111111-0000-0000-0000-000000000014', 'Redis', 'Database'),
  ('11111111-0000-0000-0000-000000000015', 'Docker', 'DevOps'),
  ('11111111-0000-0000-0000-000000000016', 'Kubernetes', 'DevOps'),
  ('11111111-0000-0000-0000-000000000017', 'AWS', 'Cloud'),
  ('11111111-0000-0000-0000-000000000018', 'Git', 'Tools'),
  ('11111111-0000-0000-0000-000000000019', 'Figma', 'Design'),
  ('11111111-0000-0000-0000-000000000020', 'UI/UX Design', 'Design'),
  ('11111111-0000-0000-0000-000000000021', 'Machine Learning', 'Data Science'),
  ('11111111-0000-0000-0000-000000000022', 'TensorFlow', 'Data Science'),
  ('11111111-0000-0000-0000-000000000023', 'SQL', 'Database'),
  ('11111111-0000-0000-0000-000000000024', 'GraphQL', 'Backend'),
  ('11111111-0000-0000-0000-000000000025', 'Tailwind CSS', 'Frontend')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- NOTE: Companies and Internships below use placeholder
-- profile UUIDs. Real seeding requires actual auth.users rows.
-- These records are safe to insert after creating company
-- accounts in Supabase Auth and inserting their profiles.
-- =====================================================

-- =====================================================
-- SEED: INTERNSHIPS (reference real company_profile_id after sign-up)
-- =====================================================
-- Example internship insert template:
/*
INSERT INTO public.internships (
  id,
  company_profile_id,
  title,
  description,
  requirements,
  responsibilities,
  location,
  workplace_type,
  internship_type,
  duration,
  stipend,
  application_deadline,
  status
) VALUES (
  uuid_generate_v4(),
  'REPLACE_WITH_REAL_COMPANY_PROFILE_ID',
  'Frontend Engineer Intern',
  'Work with our product team building user-facing features in React and TypeScript.',
  ARRAY['React', 'TypeScript', '1+ year experience'],
  ARRAY['Build reusable UI components', 'Write unit tests', 'Collaborate in sprint planning'],
  'Addis Ababa, Ethiopia',
  'hybrid',
  'Full-time',
  '3 months',
  '$800/month',
  '2027-01-31',
  'published'
);
*/
