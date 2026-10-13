-- ============================================================
-- InterConnect Migration: Storage Buckets & Missing RLS Policies
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================

-- 1. PROVISION STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars', 'avatars', true),
    ('company-logos', 'company-logos', true),
    ('project-images', 'project-images', true),
    ('resumes', 'resumes', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage Objects Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Public company logos access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users upload logos" ON storage.objects;
    DROP POLICY IF EXISTS "Public project images access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users upload project images" ON storage.objects;
    DROP POLICY IF EXISTS "Students upload resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Resume owners and target employers view resumes" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Avatars: Public read, authenticated user write
CREATE POLICY "Public avatars access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update avatars"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Company Logos: Public read, authenticated user write
CREATE POLICY "Public company logos access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users upload logos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

-- Project Images: Public read, authenticated user write
CREATE POLICY "Public project images access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users upload project images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- Resumes (Private): Authenticated users upload, signed URLs / owners read
CREATE POLICY "Students upload resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Resume owners and target employers view resumes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');


-- 2. APPLICATION STATUS HISTORY POLICIES
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Application history viewable by applicant or target company" ON public.application_status_history;
    DROP POLICY IF EXISTS "Authenticated users insert status history" ON public.application_status_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Application history viewable by applicant or target company"
    ON public.application_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.student_profiles sp ON sp.id = a.student_profile_id
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE a.id = application_status_history.application_id AND p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.internships i ON i.id = a.internship_id
            JOIN public.company_profiles cp ON cp.id = i.company_profile_id
            JOIN public.profiles p ON p.id = cp.profile_id
            WHERE a.id = application_status_history.application_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users insert status history"
    ON public.application_status_history FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');


-- 3. INTERVIEWS POLICIES
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Interviews viewable by applicant or employer" ON public.interviews;
    DROP POLICY IF EXISTS "Companies manage interviews" ON public.interviews;
    DROP POLICY IF EXISTS "Students RSVP to interviews" ON public.interviews;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Interviews viewable by applicant or employer"
    ON public.interviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.student_profiles sp ON sp.id = a.student_profile_id
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE a.id = interviews.application_id AND p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.internships i ON i.id = a.internship_id
            JOIN public.company_profiles cp ON cp.id = i.company_profile_id
            JOIN public.profiles p ON p.id = cp.profile_id
            WHERE a.id = interviews.application_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Companies manage interviews"
    ON public.interviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.internships i ON i.id = a.internship_id
            JOIN public.company_profiles cp ON cp.id = i.company_profile_id
            JOIN public.profiles p ON p.id = cp.profile_id
            WHERE a.id = interviews.application_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Students RSVP to interviews"
    ON public.interviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.student_profiles sp ON sp.id = a.student_profile_id
            JOIN public.profiles p ON p.id = sp.profile_id
            WHERE a.id = interviews.application_id AND p.user_id = auth.uid()
        )
    );


-- 4. CONVERSATIONS & MESSAGES POLICIES
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Members view their conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Authenticated users create conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Members view conversation participants" ON public.conversation_members;
    DROP POLICY IF EXISTS "Authenticated users join conversations" ON public.conversation_members;
    DROP POLICY IF EXISTS "Members view messages" ON public.messages;
    DROP POLICY IF EXISTS "Members send messages" ON public.messages;
    DROP POLICY IF EXISTS "Members mark messages as read" ON public.messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Members view their conversations"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            JOIN public.profiles p ON p.id = cm.user_id
            WHERE cm.conversation_id = conversations.id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members view conversation participants"
    ON public.conversation_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm2
            JOIN public.profiles p ON p.id = cm2.user_id
            WHERE cm2.conversation_id = conversation_members.conversation_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users join conversations"
    ON public.conversation_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members view messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            JOIN public.profiles p ON p.id = cm.user_id
            WHERE cm.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Members send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            JOIN public.profiles p ON p.id = cm.user_id
            WHERE cm.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Members mark messages as read"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            JOIN public.profiles p ON p.id = cm.user_id
            WHERE cm.conversation_id = messages.conversation_id AND p.user_id = auth.uid()
        )
    );
