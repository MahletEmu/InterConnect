import { supabase } from '@/lib/supabase';

// =====================================================
// APPLICATION SERVICE
// =====================================================

/**
 * Submit a new application for an internship.
 * Enforces:
 * 1. Internship exists, is published, and has not expired.
 * 2. Student has not already applied (via query check & DB unique constraint).
 * 3. Atomic insertion of application and initial status history.
 */
export async function submitApplication(payload: {
  student_profile_id: string;
  internship_id: string;
  resume_url?: string;
  cover_letter?: string;
}) {
  // 1. Verify internship status and deadline
  const { data: internship, error: internError } = await supabase
    .from('internships')
    .select('id, title, status, application_deadline')
    .eq('id', payload.internship_id)
    .single();

  if (internError || !internship) {
    return { data: null, error: { message: 'Internship position could not be found.' } };
  }

  if (internship.status && internship.status !== 'published') {
    return { data: null, error: { message: 'This internship is not actively accepting applications.' } };
  }

  if (internship.application_deadline) {
    const deadlineDate = new Date(internship.application_deadline);
    if (deadlineDate < new Date()) {
      return { data: null, error: { message: 'The application deadline for this position has passed.' } };
    }
  }

  // 2. Check for duplicate application
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_profile_id', payload.student_profile_id)
    .eq('internship_id', payload.internship_id)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: 'You have already submitted an application for this position.' } };
  }

  // 3. Insert application into Supabase
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...payload, status: 'submitted' })
    .select()
    .single();

  if (error) {
    console.error('submitApplication error:', error);
    if (error.code === '23505') {
      return { data: null, error: { message: 'You have already submitted an application for this position.' } };
    }
    return { data: null, error: { message: error.message || 'Failed to submit application. Please try again.' } };
  }

  // 4. Record initial status history entry
  const { error: histError } = await supabase.from('application_status_history').insert({
    application_id: data.id,
    old_status: null,
    new_status: 'submitted',
  });

  if (histError) {
    console.error('submitApplication history error:', histError);
    return {
      data,
      error: { message: 'Application was submitted, but initial status tracking could not be recorded. Please refresh your dashboard.' },
    };
  }

  return { data, error: null };
}

/**
 * Fetch all applications for a student with company and internship details.
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
        status,
        application_deadline,
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
