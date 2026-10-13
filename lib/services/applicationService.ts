import { supabase } from '@/lib/supabase';

// =====================================================
// APPLICATION SERVICE
// =====================================================

/**
 * Submit a new application for an internship.
 */
export async function submitApplication(payload: {
  student_profile_id: string;
  internship_id: string;
  resume_url?: string;
  cover_letter?: string;
}) {
  // Check for duplicate application
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_profile_id', payload.student_profile_id)
    .eq('internship_id', payload.internship_id)
    .single();

  if (existing) {
    return { data: null, error: { message: 'You have already applied to this internship.' } };
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({ ...payload, status: 'submitted' })
    .select()
    .single();

  if (error) {
    console.error('submitApplication error:', error);
    return { data: null, error };
  }

  // Insert initial status history entry
  await supabase.from('application_status_history').insert({
    application_id: data.id,
    old_status: null,
    new_status: 'submitted',
  });

  return { data, error: null };
}

/**
 * Fetch all applications for a student.
 */
export async function fetchStudentApplications(studentProfileId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships (
        id,
        title,
        location,
        workplace_type,
        duration,
        stipend,
        company_profiles (
          id,
          company_name,
          logo_url,
          industry
        )
      )
    `)
    .eq('student_profile_id', studentProfileId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('fetchStudentApplications error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Fetch all applications for a company's internships.
 */
export async function fetchCompanyApplications(companyProfileId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      internships!inner (
        id,
        title,
        company_profile_id
      ),
      student_profiles (
        id,
        bio,
        university,
        field_of_study,
        graduation_year,
        location,
        github_url,
        linkedin_url,
        portfolio_url,
        resume_url,
        profiles (
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq('internships.company_profile_id', companyProfileId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('fetchCompanyApplications error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Update an application status (company action).
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected',
  changedByProfileId?: string
) {
  // Get current status first for history
  const { data: current } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single();

  const { data, error } = await supabase
    .from('applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('updateApplicationStatus error:', error);
    return { data: null, error };
  }

  // Record in history
  await supabase.from('application_status_history').insert({
    application_id: applicationId,
    old_status: current?.status || null,
    new_status: newStatus,
    changed_by: changedByProfileId || null,
  });

  return { data, error: null };
}

/**
 * Fetch the status history for a specific application.
 */
export async function fetchApplicationStatusHistory(applicationId: string) {
  const { data, error } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: true });

  if (error) {
    console.error('fetchApplicationStatusHistory error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Check if a student has already applied to an internship.
 */
export async function checkHasApplied(studentProfileId: string, internshipId: string): Promise<boolean> {
  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('student_profile_id', studentProfileId)
    .eq('internship_id', internshipId)
    .single();

  return !!data;
}
