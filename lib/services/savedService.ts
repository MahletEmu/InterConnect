import { supabase } from '@/lib/supabase';

// =====================================================
// SAVED INTERNSHIPS SERVICE
// =====================================================

/**
 * Save an internship for a student.
 */
export async function saveInternship(studentProfileId: string, internshipId: string) {
  const { data, error } = await supabase
    .from('saved_internships')
    .insert({ student_profile_id: studentProfileId, internship_id: internshipId })
    .select()
    .single();

  if (error) {
    console.error('saveInternship error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Unsave an internship.
 */
export async function unsaveInternship(studentProfileId: string, internshipId: string) {
  const { error } = await supabase
    .from('saved_internships')
    .delete()
    .eq('student_profile_id', studentProfileId)
    .eq('internship_id', internshipId);

  if (error) {
    console.error('unsaveInternship error:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Fetch all saved internships for a student.
 */
export async function fetchSavedInternships(studentProfileId: string) {
  const { data, error } = await supabase
    .from('saved_internships')
    .select(`
      id,
      created_at,
      internships (
        id,
        title,
        location,
        workplace_type,
        duration,
        stipend,
        application_deadline,
        status,
        company_profiles (
          id,
          company_name,
          logo_url,
          industry
        )
      )
    `)
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchSavedInternships error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Check if an internship is saved by a student.
 */
export async function checkIsSaved(studentProfileId: string, internshipId: string): Promise<boolean> {
  const { data } = await supabase
    .from('saved_internships')
    .select('id')
    .eq('student_profile_id', studentProfileId)
    .eq('internship_id', internshipId)
    .single();

  return !!data;
}
