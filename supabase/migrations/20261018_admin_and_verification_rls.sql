-- ============================================================
-- InterConnect Migration: Administrator Role, Company Verification & RLS
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================

-- 1. UPDATE ROLE CHECK CONSTRAINT ON PROFILES
-- Allows 'admin' as a valid role alongside 'student' and 'company'.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'company', 'admin'));

-- 2. ADD VERIFICATION COLUMNS TO COMPANY PROFILES
ALTER TABLE public.company_profiles 
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 3. HELPER FUNCTION: CHECK IF CURRENT AUTH USER IS AN ADMIN
-- Using SECURITY DEFINER and STABLE to prevent RLS recursion.
-- Fixed search_path prevents search-path hijacking.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

-- 4. ADMINISTRATOR RLS POLICIES FOR COMPANY PROFILES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage all company profiles" ON public.company_profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins manage all company profiles"
    ON public.company_profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. ADMINISTRATOR RLS POLICIES FOR INTERNSHIPS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage all internships" ON public.internships;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins manage all internships"
    ON public.internships FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. ADMINISTRATOR RLS POLICIES FOR APPLICATIONS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage all applications" ON public.applications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins manage all applications"
    ON public.applications FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. ADMINISTRATOR RLS POLICIES FOR APPLICATION STATUS HISTORY
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage all status history" ON public.application_status_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins manage all status history"
    ON public.application_status_history FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. SECURITY HARDENING: PREVENT ROLE SPOOFING & PRIVILEGE ESCALATION ON PROFILES
-- Prevent regular authenticated users from setting or altering their role to 'admin' via Supabase REST API

-- Trigger to guard updates to profiles.role at the database engine level
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow direct database superusers (e.g. Supabase SQL Editor), service_role, or existing verified admins
        IF NOT (
            current_user IN ('postgres', 'supabase_admin') 
            OR auth.role() = 'service_role' 
            OR public.is_admin()
        ) THEN
            RAISE EXCEPTION 'Access Denied: Regular users cannot change account roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_role();

-- Trigger to guard new profile inserts from claiming 'admin'
CREATE OR REPLACE FUNCTION public.protect_profile_insert_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role = 'admin' THEN
        -- Allow direct database superusers (e.g. Supabase SQL Editor), service_role, or existing verified admins
        IF NOT (
            current_user IN ('postgres', 'supabase_admin') 
            OR auth.role() = 'service_role' 
            OR public.is_admin()
        ) THEN
            RAISE EXCEPTION 'Access Denied: Administrative accounts cannot be registered via public signup.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_insert_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_insert_role
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_insert_role();

-- 9. ADMINISTRATOR RLS POLICIES FOR PROFILES
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 10. ATOMIC TRANSACTION RPC: ADMIN APPLICATION MODERATION
-- Guarantees application status update and status history logging occur in a single atomic database transaction.
CREATE OR REPLACE FUNCTION public.admin_moderate_application(
    target_application_id UUID,
    new_status VARCHAR(50),
    moderator_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    old_app_status VARCHAR(50);
    mod_profile_id UUID;
    result JSONB;
BEGIN
    -- 1. Ensure caller is an authorized admin
    IF NOT (public.is_admin() OR auth.role() = 'service_role' OR current_user IN ('postgres', 'supabase_admin')) THEN
        RAISE EXCEPTION 'Access Denied: Only authorized administrators can moderate applications.';
    END IF;

    -- 2. Fetch current status
    SELECT status INTO old_app_status
    FROM public.applications
    WHERE id = target_application_id;

    IF old_app_status IS NULL THEN
        RAISE EXCEPTION 'Application not found with ID %', target_application_id;
    END IF;

    -- 3. Resolve moderator's profile ID
    SELECT id INTO mod_profile_id
    FROM public.profiles
    WHERE user_id = moderator_user_id
    LIMIT 1;

    -- 4. Update the application status
    UPDATE public.applications
    SET status = new_status,
        updated_at = NOW()
    WHERE id = target_application_id;

    -- 5. Insert history record in the same atomic transaction
    INSERT INTO public.application_status_history (
        application_id,
        old_status,
        new_status,
        changed_at,
        changed_by
    ) VALUES (
        target_application_id,
        old_app_status,
        new_status,
        NOW(),
        mod_profile_id
    );

    result := jsonb_build_object(
        'success', true,
        'application_id', target_application_id,
        'old_status', old_app_status,
        'new_status', new_status
    );

    RETURN result;
END;
$$;

-- 11. EXPLICIT FUNCTION EXECUTION PERMISSIONS
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_moderate_application(UUID, VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_moderate_application(UUID, VARCHAR, UUID) TO authenticated, service_role;


