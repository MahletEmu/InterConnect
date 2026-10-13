-- InterConnect Full-Stack PostgreSQL Database Schema & RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'company')),
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    university VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_year VARCHAR(10),
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    profile_completion INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPANY PROFILES
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    industry VARCHAR(255),
    company_size VARCHAR(50),
    location VARCHAR(255),
    website TEXT,
    description TEXT,
    mission TEXT,
    culture TEXT,
    founded_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_profile_id, skill_id)
);

-- 6. EDUCATION
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_year INT,
    end_year INT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT[],
    project_url TEXT,
    github_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    issue_date DATE,
    credential_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INTERNSHIPS
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_profile_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    location VARCHAR(255),
    workplace_type VARCHAR(50) CHECK (workplace_type IN ('remote', 'hybrid', 'onsite')),
    internship_type VARCHAR(50) DEFAULT 'Full-time',
    duration VARCHAR(50),
    stipend VARCHAR(100),
    application_deadline DATE,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INTERNSHIP SKILLS
CREATE TABLE IF NOT EXISTS public.internship_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    UNIQUE(internship_id, skill_id)
);

-- 11. SAVED INTERNSHIPS
CREATE TABLE IF NOT EXISTS public.saved_internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_profile_id, internship_id)
);

-- 12. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_profile_id, internship_id)
);

-- 13. APPLICATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES public.profiles(id)
);

-- 14. INTERVIEWS
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 45,
    meeting_url TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CONVERSATION MEMBERS
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, user_id)
);

-- 17. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view profiles, users edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Student Profiles
CREATE POLICY "Student profiles viewable by everyone" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Students manage own profile" ON public.student_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = student_profiles.profile_id AND profiles.user_id = auth.uid())
);

-- Company Profiles
CREATE POLICY "Company profiles viewable by everyone" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Companies manage own profile" ON public.company_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = company_profiles.profile_id AND profiles.user_id = auth.uid())
);

-- Skills & Internship Skills
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Internship skills viewable by everyone" ON public.internship_skills FOR SELECT USING (true);

-- Internships: Viewable by everyone, managed by company owner
CREATE POLICY "Internships viewable by everyone" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Companies manage own internships" ON public.internships FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.company_profiles cp
        JOIN public.profiles p ON p.id = cp.profile_id
        WHERE cp.id = internships.company_profile_id AND p.user_id = auth.uid()
    )
);

-- Saved Internships: Students manage their saved internships
CREATE POLICY "Students manage saved internships" ON public.saved_internships FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.student_profiles sp
        JOIN public.profiles p ON p.id = sp.profile_id
        WHERE sp.id = saved_internships.student_profile_id AND p.user_id = auth.uid()
    )
);

-- Applications: Viewable by student applicant and target company
CREATE POLICY "Applications viewable by applicant or target company" ON public.applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.student_profiles sp
        JOIN public.profiles p ON p.id = sp.profile_id
        WHERE sp.id = applications.student_profile_id AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.internships i
        JOIN public.company_profiles cp ON cp.id = i.company_profile_id
        JOIN public.profiles p ON p.id = cp.profile_id
        WHERE i.id = applications.internship_id AND p.user_id = auth.uid()
    )
);

CREATE POLICY "Students insert applications" ON public.applications FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_profiles sp
        JOIN public.profiles p ON p.id = sp.profile_id
        WHERE sp.id = applications.student_profile_id AND p.user_id = auth.uid()
    )
);

CREATE POLICY "Companies update applications for their internships" ON public.applications FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.internships i
        JOIN public.company_profiles cp ON cp.id = i.company_profile_id
        JOIN public.profiles p ON p.id = cp.profile_id
        WHERE i.id = applications.internship_id AND p.user_id = auth.uid()
    )
);

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = notifications.user_id AND profiles.user_id = auth.uid())
);
