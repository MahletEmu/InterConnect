import { supabase } from '@/lib/supabase';
import { Company, Internship } from '@/types';
import { VERIFIED_ETHIOPIAN_COMPANIES, matchesCompanySector } from '@/lib/data/verifiedCompanies';
import { matchesEthiopianCity } from '@/lib/data/ethiopia';
import { mapDbInternshipToFrontend } from '@/lib/services/mapper';

export interface CompanyDirectoryFilters {
  search?: string;
  industry?: string;
  city?: string;
}

/**
 * Checks whether an internship is currently active and not expired.
 */
export function isInternshipActive(internship: { status?: string; application_deadline?: string | null }): boolean {
  if (internship.status && internship.status !== 'published') return false;
  if (!internship.application_deadline) return true;
  const deadline = new Date(internship.application_deadline);
  if (isNaN(deadline.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline.getTime() >= today.getTime();
}

/**
 * Fetch all directory companies (merging verified Ethiopian organizations and registered Supabase company profiles).
 * Computes active non-expired open positions accurately without inventing statistics.
 */
export async function fetchDirectoryCompanies(filters: CompanyDirectoryFilters = {}): Promise<{
  companies: Company[];
  total: number;
}> {
  const { search = '', industry = '', city = '' } = filters;

  // 1. Fetch real published internships to calculate legitimate open positions
  const activeInternshipCounts: Record<string, number> = {};
  const activeInternshipNames: Record<string, number> = {};

  try {
    const { data: dbInternships } = await supabase
      .from('internships')
      .select('id, company_profile_id, status, application_deadline, company_profiles(company_name)')
      .eq('status', 'published');

    if (dbInternships && Array.isArray(dbInternships)) {
      dbInternships.forEach((item) => {
        // Exclude fake test internships
        if (
          item.id === 'efcab36e-b7ed-424d-86fb-0d11a3406792' ||
          item.id === 'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c'
        ) {
          return;
        }
        const cName = (item.company_profiles as any)?.company_name?.toLowerCase();
        if (cName === 'softnock') {
          return;
        }

        if (isInternshipActive(item)) {
          if (item.company_profile_id) {
            activeInternshipCounts[item.company_profile_id] = (activeInternshipCounts[item.company_profile_id] || 0) + 1;
          }
          if (cName) {
            activeInternshipNames[cName] = (activeInternshipNames[cName] || 0) + 1;
          }
        }
      });
    }
  } catch (err) {
    console.warn('Error checking active internship counts:', err);
  }

  // 2. Fetch registered company profiles from Supabase
  const dbCompanies: Company[] = [];
  try {
    const { data: profiles, error } = await supabase
      .from('company_profiles')
      .select('*')
      .order('company_name', { ascending: true });

    if (profiles && !error) {
      profiles.forEach((cp: any) => {
        const cNameLower = cp.company_name?.toLowerCase() || '';
        // Exclude fake test company profile
        if (cp.id === '0defc809-1884-4a2e-aa35-13a56940462f' || cNameLower === 'softnock') {
          return;
        }

        const openCount =
          activeInternshipCounts[cp.id] ||
          activeInternshipNames[cNameLower] ||
          0;

        dbCompanies.push({
          id: cp.id,
          profileId: cp.profile_id,
          name: cp.company_name,
          logo: cp.logo_url || (cp.company_name ? cp.company_name.slice(0, 2).toUpperCase() : 'CO'),
          industry: cp.industry || 'Technology',
          location: cp.location || 'Location Not Specified',
          city: cp.location?.trim() ? (cp.location.includes('Addis') ? 'Addis Ababa' : cp.location) : 'Unspecified',
          website: cp.website || '',
          careersUrl: cp.website || '',
          contactEmail: '',
          contactPhone: '',
          size: cp.company_size || 'Size Unspecified',
          about: cp.description || 'No company description provided.',
          mission: cp.mission || '',
          culture: cp.culture ? [cp.culture] : [],
          benefits: [],
          openPositionsCount: openCount,
          verified: Boolean(cp.is_verified),
          isClaimed: true,
        });
      });
    }
  } catch (err) {
    console.warn('Error fetching Supabase company_profiles:', err);
  }

  // 3. Merge verified Ethiopian organizations (avoiding duplicates by name)
  const dbNameSet = new Set(dbCompanies.map((c) => c.name.toLowerCase().trim()));
  const verifiedList: Company[] = VERIFIED_ETHIOPIAN_COMPANIES.map((vc) => {
    const openCount = activeInternshipNames[vc.name.toLowerCase().trim()] || 0;
    return {
      ...vc,
      openPositionsCount: openCount,
    };
  }).filter((vc) => !dbNameSet.has(vc.name.toLowerCase().trim()));

  const allCompanies = [...dbCompanies, ...verifiedList];

  // 4. Apply search & filter criteria
  const filtered = allCompanies.filter((comp) => {
    // Search match (name, industry, about, internship fields)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const nameMatch = comp.name.toLowerCase().includes(q);
      const industryMatch = comp.industry.toLowerCase().includes(q);
      const aboutMatch = comp.about.toLowerCase().includes(q);
      const fieldMatch = comp.internshipFields?.some((f) => f.toLowerCase().includes(q)) ?? false;
      if (!nameMatch && !industryMatch && !aboutMatch && !fieldMatch) {
        return false;
      }
    }

    // Industry sector filter
    if (industry && industry !== 'All') {
      if (!matchesCompanySector(comp, industry)) {
        return false;
      }
    }

    // City filter
    if (city && city !== 'All') {
      if (!matchesEthiopianCity(comp, city)) {
        return false;
      }
    }

    return true;
  });

  return {
    companies: filtered,
    total: filtered.length,
  };
}

/**
 * Fetch a single company profile by ID with its active and non-expired internships.
 */
export async function fetchCompanyDirectoryById(id: string): Promise<{
  company: Company | null;
  activeInternships: Internship[];
  expiredInternships: Internship[];
}> {
  let targetCompany: Company | null = null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // 1. Check if ID matches Supabase company_profiles
  if (isUuid) {
    try {
      const { data: cp, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (cp && !error) {
        targetCompany = {
          id: cp.id,
          profileId: cp.profile_id,
          name: cp.company_name,
          logo: cp.logo_url || (cp.company_name ? cp.company_name.slice(0, 2).toUpperCase() : 'CO'),
          industry: cp.industry || 'Technology',
          location: cp.location || 'Location Not Specified',
          city: cp.location?.trim() ? (cp.location.includes('Addis') ? 'Addis Ababa' : cp.location) : 'Unspecified',
          website: cp.website || '',
          careersUrl: cp.website || '',
          contactEmail: '',
          contactPhone: '',
          size: cp.company_size || 'Size Unspecified',
          about: cp.description || 'No company description provided.',
          mission: cp.mission || '',
          culture: cp.culture ? [cp.culture] : [],
          benefits: [],
          openPositionsCount: 0,
          verified: Boolean(cp.is_verified),
          isClaimed: true,
        };
      }
    } catch (err) {
      console.warn('Error fetching company by ID from Supabase:', err);
    }
  }

  // 2. If not found in Supabase, search verified Ethiopian directory
  if (!targetCompany) {
    const matched = VERIFIED_ETHIOPIAN_COMPANIES.find(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase()
    );
    if (matched) {
      targetCompany = { ...matched };
    }
  }

  if (!targetCompany || targetCompany.id === '0defc809-1884-4a2e-aa35-13a56940462f' || targetCompany.name.toLowerCase() === 'softnock') {
    return { company: null, activeInternships: [], expiredInternships: [] };
  }

  // 3. Query legitimate internships associated with this company
  const activeInternships: Internship[] = [];
  const expiredInternships: Internship[] = [];

  try {
    // Only query DB by UUID if targetCompany.id is a UUID, or find matching profile by name
    let queryProfileId: string | null = isUuid ? targetCompany.id : null;
    if (!queryProfileId) {
      const { data: matchedProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .ilike('company_name', targetCompany.name)
        .maybeSingle();
      if (matchedProfile?.id) {
        queryProfileId = matchedProfile.id;
      }
    }

    if (queryProfileId) {
      const { data: dbInternships } = await supabase
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
            description,
            company_size
          ),
          internship_skills (
            skills (id, name, category)
          )
        `)
        .eq('company_profile_id', queryProfileId);

      if (dbInternships && Array.isArray(dbInternships)) {
        dbInternships.forEach((item) => {
          if (
            item.id === 'efcab36e-b7ed-424d-86fb-0d11a3406792' ||
            item.id === 'a64a4ddd-b6d2-48f2-85ef-da0bfd12ee2c' ||
            item.title?.toLowerCase().includes('softmock')
          ) {
            return;
          }
          const mapped = mapDbInternshipToFrontend(item);
          if (mapped.isExpired || (mapped.status && mapped.status !== 'published')) {
            expiredInternships.push(mapped);
          } else {
            activeInternships.push(mapped);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching internships for company:', err);
  }

  // Update open positions count to strictly reflect active internships
  targetCompany.openPositionsCount = activeInternships.length;

  return {
    company: targetCompany,
    activeInternships,
    expiredInternships,
  };
}
