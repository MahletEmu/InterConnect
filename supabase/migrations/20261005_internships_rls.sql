-- ============================================================
-- Migration: Internship Marketplace RLS & Policies (Stage 9C)
-- Run this in Supabase SQL Editor if existing RLS is incomplete.
-- All policies use DROP IF EXISTS first to be idempotent.
-- ============================================================

-- -------------------------
-- 1. INTERNSHIPS
-- -------------------------
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Internships viewable by everyone"        ON public.internships;
  DROP POLICY IF EXISTS "Published internships or own viewable"   ON public.internships;
  DROP POLICY IF EXISTS "Companies manage own internships"        ON public.internships;
  DROP POLICY IF EXISTS "Companies insert own internships"        ON public.internships;
  DROP POLICY IF EXISTS "Companies update own internships"        ON public.internships;
  DROP POLICY IF EXISTS "Companies delete own internships"        ON public.internships;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Public/anonymous users can view only published internships.
-- Owning companies can view all of their own internships (including drafts/closed).
CREATE POLICY "Published internships or own viewable"
  ON public.internships FOR SELECT USING (
    status = 'published'
    OR
    EXISTS (
      SELECT 1 FROM public.company_profiles cp
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE cp.id = internships.company_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- Company can INSERT only if they own the company_profile_id they supply
CREATE POLICY "Companies insert own internships"
  ON public.internships FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles cp
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE cp.id = internships.company_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- Company can UPDATE only their own internships
CREATE POLICY "Companies update own internships"
  ON public.internships FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles cp
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE cp.id = internships.company_profile_id
        AND p.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_profiles cp
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE cp.id = internships.company_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- Company can DELETE only their own internships
CREATE POLICY "Companies delete own internships"
  ON public.internships FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.company_profiles cp
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE cp.id = internships.company_profile_id
        AND p.user_id = auth.uid()
    )
  );

-- -------------------------
-- 2. INTERNSHIP_SKILLS
-- -------------------------
ALTER TABLE public.internship_skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Internship skills viewable by everyone"       ON public.internship_skills;
  DROP POLICY IF EXISTS "Companies manage own internship skills"        ON public.internship_skills;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Internship skills viewable by everyone"
  ON public.internship_skills FOR SELECT USING (true);

-- Company can manage skill tags for their own internships
CREATE POLICY "Companies manage own internship skills"
  ON public.internship_skills FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.company_profiles cp ON cp.id = i.company_profile_id
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE i.id = internship_skills.internship_id
        AND p.user_id = auth.uid()
    )
  );

-- -------------------------
-- 3. APPLICATIONS
-- -------------------------
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Applications viewable by applicant or target company" ON public.applications;
  DROP POLICY IF EXISTS "Students insert applications"                         ON public.applications;
  DROP POLICY IF EXISTS "Companies update applications for their internships"  ON public.applications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Student sees own applications; company sees applications to their internships
CREATE POLICY "Applications viewable by applicant or target company"
  ON public.applications FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      JOIN public.profiles p ON p.id = sp.profile_id
      WHERE sp.id = applications.student_profile_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.company_profiles cp ON cp.id = i.company_profile_id
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE i.id = applications.internship_id AND p.user_id = auth.uid()
    )
  );

-- Students can only insert applications for their own student_profile_id
CREATE POLICY "Students insert applications"
  ON public.applications FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      JOIN public.profiles p ON p.id = sp.profile_id
      WHERE sp.id = applications.student_profile_id AND p.user_id = auth.uid()
    )
  );

-- Companies can update applications for their own internships.
-- USING checks that the existing row belongs to an internship owned by the authenticated company.
-- WITH CHECK ensures the updated row cannot reassign the application to a different internship or ownership hierarchy.
CREATE POLICY "Companies update applications for their internships"
  ON public.applications FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.company_profiles cp ON cp.id = i.company_profile_id
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE i.id = applications.internship_id AND p.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.internships i
      JOIN public.company_profiles cp ON cp.id = i.company_profile_id
      JOIN public.profiles p ON p.id = cp.profile_id
      WHERE i.id = applications.internship_id AND p.user_id = auth.uid()
    )
  );

-- -------------------------
-- 4. SAVED_INTERNSHIPS
-- -------------------------
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Students manage saved internships" ON public.saved_internships;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Students manage saved internships"
  ON public.saved_internships FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles sp
      JOIN public.profiles p ON p.id = sp.profile_id
      WHERE sp.id = saved_internships.student_profile_id AND p.user_id = auth.uid()
    )
  );

-- -------------------------
-- 5. APPLICATION_STATUS_HISTORY
-- -------------------------
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Status history viewable by involved parties" ON public.application_status_history;
  DROP POLICY IF EXISTS "Authenticated users insert status history"   ON public.application_status_history;
  DROP POLICY IF EXISTS "Involved parties insert status history"       ON public.application_status_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Status history viewable by involved parties"
  ON public.application_status_history FOR SELECT USING (
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

-- Only users actively involved with the application (the applicant student or the hosting company)
-- are allowed to insert a status history record, ensuring it is tied to an authentic application.
CREATE POLICY "Involved parties insert status history"
  ON public.application_status_history FOR INSERT WITH CHECK (
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
