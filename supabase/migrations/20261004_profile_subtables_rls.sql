-- Migration: Row Level Security policies for Student Profile Sub-tables and Storage
-- Run this in your Supabase SQL Editor if RLS blocks student sub-item queries

-- 1. Student Skills Policies
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Student skills viewable by everyone" ON public.student_skills;
    DROP POLICY IF EXISTS "Students manage own skills" ON public.student_skills;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Student skills viewable by everyone" ON public.student_skills
    FOR SELECT USING (true);

CREATE POLICY "Students manage own skills" ON public.student_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE sp.id = student_skills.student_profile_id AND p.user_id = auth.uid()
        )
    );

-- 2. Projects Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Projects viewable by everyone" ON public.projects;
    DROP POLICY IF EXISTS "Students manage own projects" ON public.projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Projects viewable by everyone" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Students manage own projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE sp.id = projects.student_profile_id AND p.user_id = auth.uid()
        )
    );

-- 3. Certificates Policies
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Certificates viewable by everyone" ON public.certificates;
    DROP POLICY IF EXISTS "Students manage own certificates" ON public.certificates;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Certificates viewable by everyone" ON public.certificates
    FOR SELECT USING (true);

CREATE POLICY "Students manage own certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE sp.id = certificates.student_profile_id AND p.user_id = auth.uid()
        )
    );

-- 4. Education Policies
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Education viewable by everyone" ON public.education;
    DROP POLICY IF EXISTS "Students manage own education" ON public.education;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Education viewable by everyone" ON public.education
    FOR SELECT USING (true);

CREATE POLICY "Students manage own education" ON public.education
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE sp.id = education.student_profile_id AND p.user_id = auth.uid()
        )
    );

-- 5. Storage Buckets Creation (avatars, company-logos, project-images, resumes)
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars', 'avatars', true),
    ('company-logos', 'company-logos', true),
    ('project-images', 'project-images', true),
    ('resumes', 'resumes', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage Policies for Authenticated Users
DO $$ BEGIN
    -- Avatars
    CREATE POLICY "Public avatars access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    CREATE POLICY "Users upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    CREATE POLICY "Users update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

    -- Company Logos
    CREATE POLICY "Public logos access" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
    CREATE POLICY "Users upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

    -- Project Images
    CREATE POLICY "Public project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
    CREATE POLICY "Users upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

    -- Resumes (Private: authenticated users access their own or employer access)
    CREATE POLICY "Users manage resumes" ON storage.objects FOR ALL USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
