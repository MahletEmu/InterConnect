import { createClient } from '@supabase/supabase-js';

// Next.js exposes env vars prefixed with NEXT_PUBLIC_ to the browser via process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * True when real Supabase credentials are present.
 * When false the application falls back to the local mock auth layer.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
