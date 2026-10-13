import { supabase } from '@/lib/supabase';

export interface PlatformPublicStats {
  studentsCount: number;
  companiesCount: number;
  internshipsCount: number;
}

/**
 * Fetches real platform counts from Supabase database.
 * Uses exact HEAD count queries on individual tables to prevent duplicate counting
 * from table joins and to respect Row Level Security (RLS).
 */
export async function getPlatformPublicStats(): Promise<{
  success: boolean;
  data: PlatformPublicStats;
  error?: string;
}> {
  try {
    const [studentsRes, companiesRes, internshipsRes] = await Promise.all([
      // Real database count of registered student profiles
      supabase.from('student_profiles').select('id', { count: 'exact', head: true }),
      // Real database count of verified company profiles
      supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
      // Real database count of eligible published internships (excluding drafts/closed)
      supabase.from('internships').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]);

    if (studentsRes.error) {
      console.warn('Supabase student_profiles count notice:', studentsRes.error.message);
    }
    if (companiesRes.error) {
      console.warn('Supabase company_profiles count notice:', companiesRes.error.message);
    }
    if (internshipsRes.error) {
      console.warn('Supabase internships count notice:', internshipsRes.error.message);
    }

    const studentsCount = studentsRes.count ?? 0;
    const companiesCount = companiesRes.count ?? 0;
    const internshipsCount = internshipsRes.count ?? 0;

    return {
      success: !studentsRes.error && !companiesRes.error && !internshipsRes.error,
      data: {
        studentsCount,
        companiesCount,
        internshipsCount,
      },
    };
  } catch (err: any) {
    console.error('Error fetching platform statistics from Supabase:', err);
    return {
      success: false,
      data: {
        studentsCount: 0,
        companiesCount: 0,
        internshipsCount: 0,
      },
      error: err?.message || 'Failed to fetch platform counts',
    };
  }
}
