import { supabase } from '@/lib/supabase';

// =====================================================
// INTERNSHIP SERVICE
// =====================================================

export interface InternshipFilters {
  search?: string;
  workplace_type?: 'remote' | 'hybrid' | 'onsite' | null;
  location?: string;
  stipend?: string;
  duration?: string;
  skills?: string[];
  sortBy?: 'newest' | 'deadline' | 'title';
  page?: number;
  pageSize?: number;
}

export const EXCLUDED_INTERNSHIP_IDS = [
  'efcab36e-b7ed-424d-86fb-0d11a3406792',
  'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c',
];

/**
 * Fetch published internships with optional search/filter/pagination.
 * Falls back to mock data if Supabase is not configured.
 */
export async function fetchInternships(filters: InternshipFilters = {}) {
  const {
    search = '',
    workplace_type,
    location,
    skills = [],
    sortBy = 'newest',
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from('internships')
    .select(`
      id,
      title,
      description,
      location,
      workplace_type,
      internship_type,
      duration,
      stipend,
      application_deadline,
      status,
      created_at,
      company_profiles (
        id,
        company_name,
        logo_url,
        industry,
        location
      ),
      internship_skills (
        skills (id, name, category)
      )
    `)
    .eq('status', 'published');

  // Filter out fake test data
  query = query.not('id', 'in', `(${EXCLUDED_INTERNSHIP_IDS.join(',')})`);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (workplace_type) {
    query = query.eq('workplace_type', workplace_type);
  }

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  // Sort
  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'deadline') {
    query = query.order('application_deadline', { ascending: true });
  } else {
    query = query.order('title', { ascending: true });
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('fetchInternships error:', error);
    return { data: [], count: 0, error };
  }

  const cleanData = (data || []).filter((item: any) => {
    if (EXCLUDED_INTERNSHIP_IDS.includes(item.id)) return false;
    const titleLower = item.title?.toLowerCase() || '';
    const companyLower = item.company_profiles?.company_name?.toLowerCase() || '';
    if (titleLower.includes('softmock') || companyLower.includes('softnock')) return false;
    return true;
  });

  return { data: cleanData, count: cleanData.length, error: null };
}

/**
 * Fetch a single internship by ID.
 */
export async function fetchInternshipById(id: string) {
  if (EXCLUDED_INTERNSHIP_IDS.includes(id)) {
    return { data: null, error: { message: 'Internship not found' } };
  }

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
        website,
        description
      ),
      internship_skills (
        skills (id, name, category)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('fetchInternshipById error:', error);
    return { data: null, error };
  }

  if (
    data?.title?.toLowerCase().includes('softmock') ||
    (data?.company_profiles as any)?.company_name?.toLowerCase().includes('softnock')
  ) {
    return { data: null, error: { message: 'Internship not found' } };
  }

  return { data, error: null };
}

/**
 * Create a new internship (company only).
 */
export async function createInternship(internship: {
  company_profile_id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  workplace_type?: 'remote' | 'hybrid' | 'onsite';
  internship_type?: string;
  duration?: string;
  stipend?: string;
  application_deadline?: string;
  status?: 'draft' | 'published';
  skill_ids?: string[];
}) {
  const { skill_ids, ...internshipData } = internship;

  const { data, error } = await supabase
    .from('internships')
    .insert(internshipData)
    .select()
    .single();

  if (error) {
    console.error('createInternship error:', error);
    return { data: null, error };
  }

  // Link skills
  if (skill_ids && skill_ids.length > 0 && data) {
    const skillLinks = skill_ids.map((skill_id) => ({
      internship_id: data.id,
      skill_id,
    }));
    await supabase.from('internship_skills').insert(skillLinks);
  }

  return { data, error: null };
}

/**
 * Update an existing internship (company only).
 */
export async function updateInternship(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    workplace_type: 'remote' | 'hybrid' | 'onsite';
    internship_type: string;
    duration: string;
    stipend: string;
    application_deadline: string;
    status: 'draft' | 'published' | 'closed';
  }>
) {
  const { data, error } = await supabase
    .from('internships')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateInternship error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete an internship by ID (company only).
 */
export async function deleteInternship(id: string) {
  const { error } = await supabase
    .from('internships')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteInternship error:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Fetch internships posted by a specific company.
 */
export async function fetchCompanyInternships(companyProfileId: string) {
  const { data, error } = await supabase
    .from('internships')
    .select(`
      *,
      internship_skills (
        skills (id, name)
      )
    `)
    .eq('company_profile_id', companyProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchCompanyInternships error:', error);
    return { data: [], error };
  }

  const cleanData = (data || []).filter((item: any) => {
    if (EXCLUDED_INTERNSHIP_IDS.includes(item.id)) return false;
    const titleLower = item.title?.toLowerCase() || '';
    if (titleLower.includes('softmock')) return false;
    return true;
  });

  return { data: cleanData, error: null };
}
