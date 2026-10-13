import { supabase } from '@/lib/supabase';

// =====================================================
// PROFILE SERVICE — Student & Company Profile Management
// =====================================================

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
}

export interface StudentSkillRelation {
  id: string;
  proficiency: string;
  skill_id: string;
  skills: SkillItem;
}

export interface ProjectRecord {
  id: string;
  student_profile_id: string;
  title: string;
  description?: string;
  technologies?: string[];
  project_url?: string;
  github_url?: string;
  image_url?: string;
  created_at?: string;
}

export interface CertificateRecord {
  id: string;
  student_profile_id: string;
  name: string;
  issuer?: string;
  issue_date?: string;
  credential_url?: string;
  created_at?: string;
}

export interface FullStudentProfileData {
  profileId: string;
  studentProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: 'student';
  university: string;
  fieldOfStudy: string;
  graduationYear: string;
  bio: string;
  location: string;
  phone: string;
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  profileCompletion: number;
  skills: StudentSkillRelation[];
  projects: ProjectRecord[];
  certificates: CertificateRecord[];
}

export interface FullCompanyProfileData {
  profileId: string;
  companyProfileId: string;
  userId: string;
  fullName: string;
  email: string;
  role: 'company';
  companyName: string;
  logoUrl: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
  mission: string;
  culture: string;
  foundedYear?: number;
  profileCompletion: number;
}

// =====================================================
// PROFILE COMPLETION CALCULATORS
// =====================================================

export function calculateStudentProfileCompletion(data: {
  avatarUrl?: string;
  bio?: string;
  university?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  location?: string;
  skillsCount?: number;
  projectsCount?: number;
  resumeUrl?: string;
}): { percentage: number; missingFields: string[] } {
  const fields = [
    { label: 'Profile Photo', done: Boolean(data.avatarUrl && data.avatarUrl.trim()), weight: 10 },
    { label: 'Bio / Professional Summary', done: Boolean(data.bio && data.bio.trim().length > 15), weight: 15 },
    { label: 'University / College', done: Boolean(data.university && data.university.trim()), weight: 15 },
    { label: 'Field of Study', done: Boolean(data.fieldOfStudy && data.fieldOfStudy.trim()), weight: 10 },
    { label: 'Graduation Year', done: Boolean(data.graduationYear && data.graduationYear.trim()), weight: 10 },
    { label: 'Location', done: Boolean(data.location && data.location.trim()), weight: 10 },
    { label: 'Skills (at least 3)', done: Boolean((data.skillsCount || 0) >= 3), weight: 15 },
    { label: 'Project Portfolio', done: Boolean((data.projectsCount || 0) >= 1), weight: 10 },
    { label: 'Resume', done: Boolean(data.resumeUrl && data.resumeUrl.trim()), weight: 5 },
  ];

  let earned = 0;
  const missingFields: string[] = [];

  for (const f of fields) {
    if (f.done) {
      earned += f.weight;
    } else {
      missingFields.push(f.label);
    }
  }

  return { percentage: Math.min(100, earned), missingFields };
}

export function calculateCompanyProfileCompletion(data: {
  logoUrl?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  website?: string;
  description?: string;
}): { percentage: number; missingFields: string[] } {
  const fields = [
    { label: 'Company Logo', done: Boolean(data.logoUrl && data.logoUrl.trim()), weight: 15 },
    { label: 'Company Name', done: Boolean(data.companyName && data.companyName.trim()), weight: 20 },
    { label: 'Industry', done: Boolean(data.industry && data.industry.trim()), weight: 15 },
    { label: 'Company Size', done: Boolean(data.companySize && data.companySize.trim()), weight: 10 },
    { label: 'Location / HQ', done: Boolean(data.location && data.location.trim()), weight: 15 },
    { label: 'Website URL', done: Boolean(data.website && data.website.trim()), weight: 10 },
    { label: 'About / Description', done: Boolean(data.description && data.description.trim().length > 20), weight: 15 },
  ];

  let earned = 0;
  const missingFields: string[] = [];

  for (const f of fields) {
    if (f.done) {
      earned += f.weight;
    } else {
      missingFields.push(f.label);
    }
  }

  return { percentage: Math.min(100, earned), missingFields };
}

// =====================================================
// FETCH PROFILE DATA
// =====================================================

/**
 * Fetch complete student profile data by auth user_id or profile_id.
 */
export async function getStudentProfileByUserId(
  userId: string
): Promise<{ data: FullStudentProfileData | null; error: string | null }> {
  try {
    // 1. Fetch base profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return { data: null, error: profileErr?.message || 'Profile not found' };
    }

    // 2. Fetch or initialize student_profiles row
    let { data: studentProfile, error: studentErr } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (!studentProfile) {
      // Auto-create student_profiles if missing
      const { data: newStudent, error: createErr } = await supabase
        .from('student_profiles')
        .insert({ profile_id: profile.id })
        .select()
        .single();

      if (createErr) {
        return { data: null, error: createErr.message };
      }
      studentProfile = newStudent;
    }

    // 3. Fetch skills, projects, and certificates in parallel
    const [skillsRes, projectsRes, certsRes] = await Promise.all([
      supabase
        .from('student_skills')
        .select('id, proficiency, skill_id, skills(id, name, category)')
        .eq('student_profile_id', studentProfile.id),
      supabase
        .from('projects')
        .select('*')
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('certificates')
        .select('*')
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false }),
    ]);

    const skills = (skillsRes.data as any) || [];
    const projects = (projectsRes.data as ProjectRecord[]) || [];
    const certificates = (certsRes.data as CertificateRecord[]) || [];

    const completion = calculateStudentProfileCompletion({
      avatarUrl: profile.avatar_url,
      bio: studentProfile.bio,
      university: studentProfile.university,
      fieldOfStudy: studentProfile.field_of_study,
      graduationYear: studentProfile.graduation_year,
      location: studentProfile.location,
      skillsCount: skills.length,
      projectsCount: projects.length,
      resumeUrl: studentProfile.resume_url,
    });

    return {
      data: {
        profileId: profile.id,
        studentProfileId: studentProfile.id,
        userId: profile.user_id,
        fullName: profile.full_name || '',
        email: profile.email || '',
        avatarUrl: profile.avatar_url || '',
        role: 'student',
        university: studentProfile.university || '',
        fieldOfStudy: studentProfile.field_of_study || '',
        graduationYear: studentProfile.graduation_year || '',
        bio: studentProfile.bio || '',
        location: studentProfile.location || '',
        phone: studentProfile.phone || '',
        resumeUrl: studentProfile.resume_url || '',
        linkedinUrl: studentProfile.linkedin_url || '',
        githubUrl: studentProfile.github_url || '',
        portfolioUrl: studentProfile.portfolio_url || '',
        profileCompletion: completion.percentage,
        skills,
        projects,
        certificates,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('getStudentProfileByUserId exception:', err);
    return { data: null, error: err?.message || 'Failed to load profile' };
  }
}

/**
 * Fetch complete company profile data by auth user_id.
 */
export async function getCompanyProfileByUserId(
  userId: string
): Promise<{ data: FullCompanyProfileData | null; error: string | null }> {
  try {
    // 1. Fetch base profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return { data: null, error: profileErr?.message || 'Profile not found' };
    }

    // 2. Fetch or initialize company_profiles row
    let { data: companyProfile, error: companyErr } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (!companyProfile) {
      // Auto-create company_profiles if missing
      const { data: newCompany, error: createErr } = await supabase
        .from('company_profiles')
        .insert({
          profile_id: profile.id,
          company_name: profile.full_name || 'My Company',
        })
        .select()
        .single();

      if (createErr) {
        return { data: null, error: createErr.message };
      }
      companyProfile = newCompany;
    }

    const completion = calculateCompanyProfileCompletion({
      logoUrl: companyProfile.logo_url,
      companyName: companyProfile.company_name,
      industry: companyProfile.industry,
      companySize: companyProfile.company_size,
      location: companyProfile.location,
      website: companyProfile.website,
      description: companyProfile.description,
    });

    return {
      data: {
        profileId: profile.id,
        companyProfileId: companyProfile.id,
        userId: profile.user_id,
        fullName: profile.full_name || '',
        email: profile.email || '',
        role: 'company',
        companyName: companyProfile.company_name || profile.full_name || '',
        logoUrl: companyProfile.logo_url || '',
        industry: companyProfile.industry || '',
        companySize: companyProfile.company_size || '',
        location: companyProfile.location || '',
        website: companyProfile.website || '',
        description: companyProfile.description || '',
        mission: companyProfile.mission || '',
        culture: companyProfile.culture || '',
        foundedYear: companyProfile.founded_year,
        profileCompletion: completion.percentage,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('getCompanyProfileByUserId exception:', err);
    return { data: null, error: err?.message || 'Failed to load company profile' };
  }
}

// =====================================================
// UPDATE PROFILES
// =====================================================

/**
 * Update student profile information (base profile + student profile).
 */
export async function updateStudentProfileInfo(params: {
  profileId: string;
  studentProfileId: string;
  fullName?: string;
  avatarUrl?: string;
  university?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  location?: string;
  bio?: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  profileCompletion?: number;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Update base profile if full_name or avatar_url changed
    const baseUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (params.fullName !== undefined) baseUpdates.full_name = params.fullName.trim();
    if (params.avatarUrl !== undefined) baseUpdates.avatar_url = params.avatarUrl;

    const { error: baseErr } = await supabase
      .from('profiles')
      .update(baseUpdates)
      .eq('id', params.profileId);

    if (baseErr) {
      return { success: false, error: baseErr.message };
    }

    // 2. Update student profile table
    const studentUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (params.university !== undefined) studentUpdates.university = params.university.trim();
    if (params.fieldOfStudy !== undefined) studentUpdates.field_of_study = params.fieldOfStudy.trim();
    if (params.graduationYear !== undefined) studentUpdates.graduation_year = params.graduationYear.trim();
    if (params.location !== undefined) studentUpdates.location = params.location.trim();
    if (params.bio !== undefined) studentUpdates.bio = params.bio.trim();
    if (params.phone !== undefined) studentUpdates.phone = params.phone.trim();
    if (params.resumeUrl !== undefined) studentUpdates.resume_url = params.resumeUrl;
    if (params.linkedinUrl !== undefined) studentUpdates.linkedin_url = params.linkedinUrl.trim();
    if (params.githubUrl !== undefined) studentUpdates.github_url = params.githubUrl.trim();
    if (params.portfolioUrl !== undefined) studentUpdates.portfolio_url = params.portfolioUrl.trim();
    if (params.profileCompletion !== undefined) studentUpdates.profile_completion = params.profileCompletion;

    const { error: studentErr } = await supabase
      .from('student_profiles')
      .update(studentUpdates)
      .eq('id', params.studentProfileId);

    if (studentErr) {
      return { success: false, error: studentErr.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update student profile.' };
  }
}

/**
 * Update company profile information.
 */
export async function updateCompanyProfileInfo(params: {
  profileId: string;
  companyProfileId: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  website?: string;
  description?: string;
  mission?: string;
  culture?: string;
  foundedYear?: number;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    // 1. Update base profile
    const { error: baseErr } = await supabase
      .from('profiles')
      .update({
        full_name: params.companyName.trim(),
        avatar_url: params.logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.profileId);

    if (baseErr) {
      return { success: false, error: baseErr.message };
    }

    // 2. Update company_profiles
    const updates: Record<string, any> = {
      company_name: params.companyName.trim(),
      updated_at: new Date().toISOString(),
    };
    if (params.logoUrl !== undefined) updates.logo_url = params.logoUrl;
    if (params.industry !== undefined) updates.industry = params.industry.trim();
    if (params.companySize !== undefined) updates.company_size = params.companySize;
    if (params.location !== undefined) updates.location = params.location.trim();
    if (params.website !== undefined) updates.website = params.website.trim();
    if (params.description !== undefined) updates.description = params.description.trim();
    if (params.mission !== undefined) updates.mission = params.mission.trim();
    if (params.culture !== undefined) updates.culture = params.culture.trim();
    if (params.foundedYear !== undefined) updates.founded_year = params.foundedYear;

    const { error: companyErr } = await supabase
      .from('company_profiles')
      .update(updates)
      .eq('id', params.companyProfileId);

    if (companyErr) {
      return { success: false, error: companyErr.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update company profile.' };
  }
}

// =====================================================
// SKILLS MANAGEMENT
// =====================================================

export async function fetchAllSkills(): Promise<SkillItem[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('id, name, category')
    .order('name');

  if (error || !data) return [];
  return data;
}

export async function searchSkills(query: string): Promise<SkillItem[]> {
  if (!query || !query.trim()) return [];
  const { data, error } = await supabase
    .from('skills')
    .select('id, name, category')
    .ilike('name', `%${query.trim()}%`)
    .limit(15);

  if (error || !data) return [];
  return data;
}

export async function addStudentSkill(
  studentProfileId: string,
  skillId: string,
  proficiency = 'Intermediate'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('student_skills')
      .insert({
        student_profile_id: studentProfileId,
        skill_id: skillId,
        proficiency,
      })
      .select('id, proficiency, skill_id, skills(id, name, category)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Skill is already added to your profile.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add skill.' };
  }
}

export async function removeStudentSkill(studentSkillId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('student_skills')
      .delete()
      .eq('id', studentSkillId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to remove skill.' };
  }
}

// =====================================================
// PROJECTS MANAGEMENT
// =====================================================

export async function addStudentProject(
  studentProfileId: string,
  project: {
    title: string;
    description?: string;
    technologies?: string[];
    project_url?: string;
    github_url?: string;
    image_url?: string;
  }
): Promise<{ success: boolean; data?: ProjectRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        student_profile_id: studentProfileId,
        title: project.title.trim(),
        description: project.description?.trim() || null,
        technologies: project.technologies || [],
        project_url: project.project_url?.trim() || null,
        github_url: project.github_url?.trim() || null,
        image_url: project.image_url || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add project.' };
  }
}

export async function updateStudentProject(
  projectId: string,
  project: Partial<{
    title: string;
    description: string;
    technologies: string[];
    project_url: string;
    github_url: string;
    image_url: string;
  }>
): Promise<{ success: boolean; data?: ProjectRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', projectId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update project.' };
  }
}

export async function deleteStudentProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete project.' };
  }
}

// =====================================================
// CERTIFICATES MANAGEMENT
// =====================================================

export async function addStudentCertificate(
  studentProfileId: string,
  cert: {
    name: string;
    issuer?: string;
    issue_date?: string;
    credential_url?: string;
  }
): Promise<{ success: boolean; data?: CertificateRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        student_profile_id: studentProfileId,
        name: cert.name.trim(),
        issuer: cert.issuer?.trim() || null,
        issue_date: cert.issue_date || null,
        credential_url: cert.credential_url?.trim() || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add certificate.' };
  }
}

export async function updateStudentCertificate(
  certificateId: string,
  cert: Partial<{
    name: string;
    issuer: string;
    issue_date: string;
    credential_url: string;
  }>
): Promise<{ success: boolean; data?: CertificateRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .update(cert)
      .eq('id', certificateId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update certificate.' };
  }
}

export async function deleteStudentCertificate(
  certificateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('certificates').delete().eq('id', certificateId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete certificate.' };
  }
}
