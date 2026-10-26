
import {
  Internship,
  Application,
  Student,
  Company,
  TimelineStep,
  SkillItem,
  MatchBreakdown,
} from '@/types';

export function mapDbInternshipToFrontend(db: any): Internship {
  const companyProfile = db.company_profiles || {};
  const companyName = companyProfile.company_name || 'Partner Company';
  const logo = companyProfile.logo_url || companyName.slice(0, 2).toUpperCase();

  const company: Company = {
    id: companyProfile.id || db.company_profile_id || 'company-default',
    profileId: companyProfile.profile_id,
    name: companyName,
    logo,
    industry: companyProfile.industry || 'Technology',
    location: companyProfile.location || db.location || 'Remote',
    website: companyProfile.website || '',
    size: companyProfile.company_size || '50-200 employees',
    about: companyProfile.description || 'Forward-thinking tech organization offering mentorship and real-world projects.',
    mission: companyProfile.mission || 'Empowering the next generation of industry leaders.',
    culture: ['Innovation', 'Inclusive', 'Fast-paced'],
    benefits: ['Competitive Stipend', 'Mentorship', 'Remote Work Flexibility'],
    openPositionsCount: 1,
    verified: true,
  };

  const workplaceTypeMap: Record<string, 'Remote' | 'Hybrid' | 'On-site'> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  };

  const skills: string[] = Array.isArray(db.internship_skills)
    ? db.internship_skills
        .map((s: any) => s.skills?.name)
        .filter((n: any): n is string => Boolean(n))
    : [];

  return {
    id: db.id,
    companyId: company.id,
    company,
    title: db.title || 'Internship Position',
    type: workplaceTypeMap[db.workplace_type?.toLowerCase()] || 'Remote',
    location: db.location || 'Location Unspecified',
    duration: db.duration || 'Flexible Duration',
    stipend: db.stipend || 'Stipend to be disclosed',
    postedDate: db.created_at ? new Date(db.created_at).toLocaleDateString() : '',
    applicationDeadline: db.application_deadline || undefined,
    isExpired: db.status === 'closed'
      ? true
      : db.application_deadline
      ? new Date(db.application_deadline).getTime() < new Date().setHours(0, 0, 0, 0) && db.status !== 'published'
      : false,
    matchScore: 0,
    matchBreakdown: { skills: 0, education: 0, location: 0, interests: 0 },
    matchReasons: [],
    description: db.description || 'No detailed description provided for this opportunity.',
    responsibilities: Array.isArray(db.responsibilities) ? db.responsibilities : [],
    requirements: Array.isArray(db.requirements) ? db.requirements : [],
    requiredSkills: skills,
    preferredSkills: [],
    benefits: Array.isArray(db.benefits) ? db.benefits : [],
    department: db.internship_type || companyProfile.industry || 'General',
    industry: companyProfile.industry || 'Technology',
    applicantsCount: 0,
    featured: Boolean(db.featured),
    status: db.status || 'draft',
  };
}

export function mapDbApplicationToFrontend(
  db: any,
  fallbackInternship?: Internship,
  fallbackStudent?: Student
): Application {
  const statusMap: Record<string, Application['status']> = {
    submitted: 'Submitted',
    reviewing: 'Reviewing',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    accepted: 'Offered',
    rejected: 'Declined',
  };

  const currentStatus = statusMap[db.status?.toLowerCase()] || 'Submitted';

  const stepMap: Record<Application['status'], number> = {
    Submitted: 1,
    Reviewing: 2,
    Shortlisted: 3,
    Interview: 4,
    Offered: 5,
    Declined: 5,
  };

  const internship: Internship = db.internships
    ? mapDbInternshipToFrontend(db.internships)
    : fallbackInternship || {
        id: db.internship_id || 'unknown',
        companyId: db.company_profile_id || 'company-unknown',
        title: 'Internship Opportunity',
        company: {
          id: db.company_profile_id || 'company-unknown',
          name: 'Hiring Organization',
          logo: '🏢',
          industry: 'Technology',
          location: 'Remote',
          website: '',
          size: '10-50 employees',
          about: '',
          mission: '',
          culture: ['Innovation'],
          benefits: ['Mentorship'],
          openPositionsCount: 0,
          verified: true,
        },
        department: 'Engineering',
        industry: 'Technology',
        type: 'Remote',
        location: 'Remote',
        duration: 'Flexible',
        stipend: 'Competitive',
        postedDate: '',
        matchScore: 85,
        matchBreakdown: { skills: 85, education: 80, location: 90, interests: 85 },
        applicantsCount: 0,
        description: '',
        responsibilities: [],
        requirements: [],
        requiredSkills: [],
        preferredSkills: [],
        benefits: [],
      };

  const studentProfile = db.student_profiles || {};
  const profile = studentProfile.profiles || {};

  const student: Student = {
    id: studentProfile.id || db.student_profile_id || 'student-fallback',
    profileId: studentProfile.profile_id,
    name: profile.full_name || fallbackStudent?.name || 'Applicant Student',
    email: profile.email || fallbackStudent?.email || 'student@university.edu',
    avatar: profile.avatar_url || fallbackStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    headline: `${studentProfile.field_of_study || 'Software Engineering'} Student`,
    university: studentProfile.university || fallbackStudent?.university || 'University',
    degree: 'B.Sc.',
    fieldOfStudy: studentProfile.field_of_study || fallbackStudent?.fieldOfStudy || 'Computer Science',
    gradYear: parseInt(studentProfile.graduation_year || '2026', 10) || 2026,
    location: studentProfile.location || fallbackStudent?.location || 'Remote',
    bio: studentProfile.bio || '',
    completionRate: studentProfile.profile_completion || 85,
    skills: fallbackStudent?.skills || [{ name: 'JavaScript' }, { name: 'React' }],
    education: fallbackStudent?.education || [],
    projects: fallbackStudent?.projects || [],
    certificates: fallbackStudent?.certificates || [],
    experience: fallbackStudent?.experience || [],
    resumeUrl: db.resume_url || studentProfile.resume_url,
    phone: studentProfile.phone || '',
  };

  const timeline: TimelineStep[] = [
    {
      status: 'Application Submitted',
      date: db.applied_at ? new Date(db.applied_at).toLocaleDateString() : 'Recently',
      note: `Successfully received by ${internship.company.name} recruitment portal.`,
      completed: true,
      current: currentStatus === 'Submitted',
    },
    {
      status: 'Application Review',
      date: currentStatus !== 'Submitted' ? 'In Progress' : 'Pending',
      note: currentStatus === 'Reviewing'
        ? 'Under active evaluation by hiring team.'
        : currentStatus !== 'Submitted'
        ? 'Completed initial profile screening.'
        : 'Awaiting recruiter review.',
      completed: ['Reviewing', 'Shortlisted', 'Interview', 'Offered'].includes(currentStatus),
      current: currentStatus === 'Reviewing',
    },
    {
      status: 'Candidate Shortlisted',
      date: ['Shortlisted', 'Interview', 'Offered'].includes(currentStatus) ? 'Qualified' : 'Pending',
      note: ['Shortlisted', 'Interview', 'Offered'].includes(currentStatus)
        ? 'Advanced to shortlisted candidate pool.'
        : 'Awaiting shortlisting decision.',
      completed: ['Shortlisted', 'Interview', 'Offered'].includes(currentStatus),
      current: currentStatus === 'Shortlisted',
    },
    {
      status: 'Interview Stage',
      date: ['Interview', 'Offered'].includes(currentStatus) ? 'Scheduled' : 'Pending',
      note: ['Interview', 'Offered'].includes(currentStatus)
        ? 'Interview stage in progress with the engineering team.'
        : 'Interview scheduling pending.',
      completed: ['Interview', 'Offered'].includes(currentStatus),
      current: currentStatus === 'Interview',
    },
    {
      status: currentStatus === 'Declined' ? 'Declined' : 'Offer Extended',
      date: ['Offered', 'Declined'].includes(currentStatus) ? 'Final' : 'Pending',
      note: currentStatus === 'Offered'
        ? 'Congratulations! Formal internship offer extended.'
        : currentStatus === 'Declined'
        ? 'Application was not selected for this cohort.'
        : 'Awaiting final hiring decision.',
      completed: ['Offered', 'Declined'].includes(currentStatus),
      current: ['Offered', 'Declined'].includes(currentStatus),
    },
  ];

  return {
    id: db.id,
    internshipId: db.internship_id,
    studentId: db.student_profile_id,
    internship,
    student,
    submittedAt: db.applied_at ? new Date(db.applied_at).toLocaleDateString() : 'Recently',
    status: currentStatus,
    currentStep: stepMap[currentStatus] || 1,
    timeline,
    resumeName: db.resume_url ? db.resume_url.split('/').pop() || 'Resume_Attached.pdf' : 'Resume_Attached.pdf',
    coverLetter: db.cover_letter || '',
  };
}
