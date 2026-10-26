-- ============================================================
-- InterConnect Migration: User-Isolated Avatar Storage Policies
-- Migration: 20261014_avatar_storage_policies.sql
-- 
-- Instructions:
-- Run this migration in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New query -> Paste & Run
-- ============================================================

-- 1. Ensure 'avatars' and 'company-logos' buckets exist and are public for read
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing loose or legacy policies on avatars
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users update avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users update avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Public Read: Any visitor or recruiter can view profile pictures and logos
CREATE POLICY "Public avatars access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- 4. User-Isolated Insert: Authenticated users can ONLY upload to their own user-id folder:
-- `${auth.uid()}/avatar-...`
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. User-Isolated Update: Authenticated users can ONLY update files in their own user-id folder
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 6. User-Isolated Delete: Authenticated users can ONLY delete their own avatar files
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
