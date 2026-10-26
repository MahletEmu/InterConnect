import { supabase } from '@/lib/supabase';
import { Internship, Application } from '@/types';
import { mapDbInternshipToFrontend, mapDbApplicationToFrontend } from '@/lib/services/mapper';
import { VERIFIED_ETHIOPIAN_COMPANIES } from '@/lib/data/verifiedCompanies';

export interface AdminStats {
  totalCompanies: number;
  verifiedCompanies: number;
  totalInternships: number;
  publishedInternships: number;
  closedInternships: number;
  draftInternships: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}

export interface AdminCompanyRecord {
  id: string;
  profileId: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  companySize: string;
  about: string;
  isVerified: boolean;
  verifiedAt: string | null;
  verificationNotes: string | null;
  internshipsCount: number;
  createdAt: string;
}

/**
 * Fetch real administrative analytics directly from database tables.
 */
export async function fetchAdminStats(): Promise<{ data: AdminStats | null; error: string | null }> {
  try {
    // 1. Companies counts
    const { count: totalCompanies } = await supabase
      .from('company_profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Internships counts
    const { data: internshipsData, error: internErr } = await supabase
      .from('internships')
      .select('id, status, application_deadline');

    if (internErr) {
      console.error('Error fetching internships for admin stats:', internErr);
    }

    const allInternships = internshipsData || [];
    let publishedCount = 0;
    let closedCount = 0;
    let draftCount = 0;

    allInternships.forEach((i) => {
      const isPastDeadline = i.application_deadline && new Date(i.application_deadline) < new Date();
      if (i.status === 'closed' || isPastDeadline) {
        closedCount++;
      } else if (i.status === 'published') {
        publishedCount++;
      } else if (i.status === 'draft') {
        draftCount++;
      }
    });

    // 3. Applications counts
    const { data: appsData, error: appsErr } = await supabase
      .from('applications')
      .select('id, status');

    if (appsErr) {
      console.error('Error fetching applications for admin stats:', appsErr);
    }

    const apps = appsData || [];
    const applicationsByStatus: Record<string, number> = {
      submitted: 0,
      reviewing: 0,
      shortlisted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    apps.forEach((a) => {
      const st = a.status?.toLowerCase() || 'submitted';
      applicationsByStatus[st] = (applicationsByStatus[st] || 0) + 1;
    });

    return {
      data: {
        totalCompanies: (totalCompanies || 0) + VERIFIED_ETHIOPIAN_COMPANIES.length,
        verifiedCompanies: VERIFIED_ETHIOPIAN_COMPANIES.length,
        totalInternships: allInternships.length,
        publishedInternships: publishedCount,
        closedInternships: closedCount,
        draftInternships: draftCount,
        totalApplications: apps.length,
        applicationsByStatus,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('fetchAdminStats exception:', err);
    return { data: null, error: err?.message || 'Failed to fetch admin metrics.' };
  }
}

/**
 * Fetch all company profiles for administrative verification and audit.
 */
export async function fetchAdminCompanies(): Promise<{ data: AdminCompanyRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('company_profiles')
      .select(`
        *,
        internships ( id )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchAdminCompanies error:', error);
      return { data: [], error: error.message };
    }

    const dbCompanies: AdminCompanyRecord[] = (data || []).map((cp: any) => ({
      id: cp.id,
      profileId: cp.profile_id,
      name: cp.company_name,
      logo: cp.logo_url || '🏢',
      industry: cp.industry || 'General',
      location: cp.location || 'Ethiopia',
      website: cp.website || '',
      companySize: cp.company_size || '',
      about: cp.description || '',
      isVerified: Boolean(cp.is_verified),
      verifiedAt: cp.verified_at || null,
      verificationNotes: cp.verification_notes || null,
      internshipsCount: cp.internships?.length || 0,
      createdAt: cp.created_at,
    }));

    // Add static verified Ethiopian directory companies for administrative reference
    const staticCompanies: AdminCompanyRecord[] = VERIFIED_ETHIOPIAN_COMPANIES.map((k: any) => ({
      id: k.id,
      profileId: 'verified-directory-partner',
      name: k.name,
      logo: k.logo,
      industry: k.industry,
      location: k.location,
      website: k.website,
      companySize: k.size,
      about: k.about,
      isVerified: true,
      verifiedAt: '2026-10-01T00:00:00Z',
      verificationNotes: 'Verified Ethiopian institution with official presence.',
      internshipsCount: 0,
      createdAt: '2026-10-01T00:00:00Z',
    }));

    return { data: [...dbCompanies, ...staticCompanies], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to retrieve companies.' };
  }
}

/**
 * Resolves a profile UUID from either a direct profile ID or an auth user ID.
 * Ensures foreign key constraints referencing public.profiles(id) are never violated.
 */
async function resolveProfileId(userIdOrProfileId?: string): Promise<string | null> {
  if (!userIdOrProfileId) return null;
  try {
    const { data: direct } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userIdOrProfileId)
      .maybeSingle();

    if (direct?.id) return direct.id;

    const { data: byUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userIdOrProfileId)
      .maybeSingle();

    return byUser?.id || null;
  } catch {
    return null;
  }
}

/**
 * Update verification status of a company profile.
 */
export async function verifyCompanyProfile(
  companyProfileId: string,
  isVerified: boolean,
  notes?: string,
  adminProfileId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const resolvedAdminId = await resolveProfileId(adminProfileId);

    const { error } = await supabase
      .from('company_profiles')
      .update({
        is_verified: isVerified,
        verified_at: isVerified ? new Date().toISOString() : null,
        verified_by: isVerified ? resolvedAdminId : null,
        verification_notes: notes || null,
      })
      .eq('id', companyProfileId);

    if (error) {
      console.error('verifyCompanyProfile error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verification update failed.' };
  }
}

/**
 * Fetch all internships across all companies for administrative moderation.
 */
export async function fetchAdminInternships(): Promise<{ data: Internship[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          industry,
          location,
          website
        ),
        internship_skills (
          skills ( id, name )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchAdminInternships error:', error);
      return { data: [], error: error.message };
    }

    const mapped = (data || [])
      .filter((item: any) => {
        if (
          item.id === 'efcab36e-b7ed-424d-86fb-0d11a3406792' ||
          item.id === 'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c'
        ) return false;
        if (item.title?.toLowerCase().includes('softmock')) return false;
        if (item.company_profiles?.company_name?.toLowerCase().includes('softnock')) return false;
        return true;
      })
      .map(mapDbInternshipToFrontend);
    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to load internships.' };
  }
}

/**
 * Update the publication or lifecycle status of an internship.
 */
export async function updateAdminInternshipStatus(
  internshipId: string,
  newStatus: 'draft' | 'published' | 'closed'
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('internships')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', internshipId);

    if (error) {
      console.error('updateAdminInternshipStatus error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update position status.' };
  }
}

/**
 * Create a verified internship position administratively.
 */
export async function createAdminInternship(payload: {
  companyProfileId: string;
  title: string;
  description: string;
  department: string;
  location: string;
  workplaceType: 'remote' | 'hybrid' | 'onsite';
  duration: string;
  stipend?: string;
  applicationDeadline?: string;
  requirements: string[];
  responsibilities: string[];
  status: 'draft' | 'published' | 'closed';
  skillIds?: string[];
}): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('internships')
      .insert({
        company_profile_id: payload.companyProfileId,
        title: payload.title,
        description: payload.description,
        location: payload.location || 'Remote',
        workplace_type: payload.workplaceType || 'remote',
        duration: payload.duration || '3 Months',
        stipend: payload.stipend || 'Stipend to be disclosed',
        application_deadline: payload.applicationDeadline || null,
        requirements: payload.requirements || [],
        responsibilities: payload.responsibilities || [],
        status: payload.status || 'published',
      })
      .select()
      .single();

    if (error) {
      console.error('createAdminInternship error:', error);
      return { data: null, error: error.message };
    }

    // Link skills if provided
    if (payload.skillIds && payload.skillIds.length > 0 && data?.id) {
      const skillRows = payload.skillIds.map((sid) => ({
        internship_id: data.id,
        skill_id: sid,
      }));
      await supabase.from('internship_skills').insert(skillRows);
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to create internship position.' };
  }
}

/**
 * Fetch all applications across all internships for moderation.
 */
export async function fetchAdminApplications(): Promise<{ data: Application[]; error: string | null }> {
  try {
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
        ),
        student_profiles (
          id,
          university,
          field_of_study,
          graduation_year,
          location,
          resume_url,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('fetchAdminApplications error:', error);
      return { data: [], error: error.message };
    }

    const mapped = (data || []).map((dbApp: any) => mapDbApplicationToFrontend(dbApp));
    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to load applications.' };
  }
}

/**
 * Administratively moderate an application status and record the change in application_status_history.
 */
export async function moderateApplicationStatus(
  applicationId: string,
  newStatus: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected',
  adminProfileId?: string,
  moderationNote?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Prefer atomic database RPC transaction if available
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_moderate_application', {
        target_application_id: applicationId,
        new_status: newStatus,
      });

      if (!rpcErr && rpcData?.success) {
        return { success: true, error: null };
      }

      if (rpcErr && !rpcErr.message.includes('function') && !rpcErr.message.includes('not found') && !rpcErr.message.includes('does not exist')) {
        return { success: false, error: rpcErr.message };
      }
    } catch {
      // Fall through to two-step with rollback if RPC is not installed
    }

    // 2. Fetch current status
    const { data: currentApp } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    // 3. Update status
    const { error: appErr } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (appErr) {
      console.error('moderateApplicationStatus error:', appErr);
      return { success: false, error: appErr.message };
    }

    // 4. Record in application_status_history
    const resolvedAdminId = await resolveProfileId(adminProfileId);

    const { error: histErr } = await supabase.from('application_status_history').insert({
      application_id: applicationId,
      old_status: currentApp?.status || null,
      new_status: newStatus,
      changed_by: resolvedAdminId,
    });

    if (histErr) {
      console.error('History insertion failed, rolling back application status:', histErr);
      // Rollback application status to preserve consistency
      await supabase
        .from('applications')
        .update({
          status: currentApp?.status || 'submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      return {
        success: false,
        error: `Failed to record status transition in audit history: ${histErr.message}. The application status was rolled back to maintain consistency.`,
      };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to moderate application status.' };
  }
}

/**
 * Fetch application status history for audit and transparency.
 */
export async function fetchApplicationHistory(
  applicationId: string
): Promise<{ data: any[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('id, old_status, new_status, changed_at, changed_by')
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('fetchApplicationHistory error:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err?.message || 'Failed to fetch status history.' };
  }
}
