import { supabase } from '@/lib/supabase';

// =====================================================
// INTERVIEWS SERVICE
// =====================================================

/**
 * Schedule a new interview for an application.
 */
export async function createInterview(payload: {
  application_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  meeting_url?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('interviews')
    .insert({ ...payload, status: 'scheduled' })
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch interviews for a student (via their applications).
 */
export async function fetchStudentInterviews(studentProfileId: string) {
  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications (
        id,
        status,
        internships (
          id,
          title,
          company_profiles (
            id,
            company_name,
            logo_url
          )
        )
      )
    `)
    .eq('applications.student_profile_id', studentProfileId)
    .order('scheduled_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch interviews for a company (via their internships).
 */
export async function fetchCompanyInterviews(companyProfileId: string) {
  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications (
        id,
        status,
        internships!inner (
          id,
          title,
          company_profile_id
        ),
        student_profiles (
          id,
          profiles (id, full_name, email, avatar_url)
        )
      )
    `)
    .eq('applications.internships.company_profile_id', companyProfileId)
    .order('scheduled_at', { ascending: true });

  return { data: data || [], error };
}

/**
 * Update interview status.
 */
export async function updateInterviewStatus(
  interviewId: string,
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
  updates?: { scheduled_at?: string; meeting_url?: string; notes?: string }
) {
  const { data, error } = await supabase
    .from('interviews')
    .update({ status, ...updates, updated_at: new Date().toISOString() })
    .eq('id', interviewId)
    .select()
    .single();

  return { data, error };
}
