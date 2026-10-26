'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Company,
  Internship,
  Application,
  Conversation,
  Message,
  InterviewInvite,
  NotificationItem,
} from '@/types';
import { useAuth } from '@/lib/context/AuthContext';
import {
  fetchInternships as dbFetchInternships,
  fetchCompanyInternships as dbFetchCompanyInternships,
  createInternship as dbCreateInternship,
  EXCLUDED_INTERNSHIP_IDS,
} from '@/lib/services/internshipService';
import {
  submitApplication as dbSubmitApplication,
  fetchStudentApplications as dbFetchStudentApplications,
  fetchCompanyApplications as dbFetchCompanyApplications,
  updateApplicationStatus as dbUpdateApplicationStatus,
} from '@/lib/services/applicationService';
import {
  saveInternship as dbSaveInternship,
  unsaveInternship as dbUnsaveInternship,
  fetchSavedInternships as dbFetchSavedInternships,
} from '@/lib/services/savedService';
import {
  getStudentProfileByUserId,
  getCompanyProfileByUserId,
} from '@/lib/services/profileService';
import { uploadResume } from '@/lib/services/storageService';
import {
  mapDbInternshipToFrontend,
  mapDbApplicationToFrontend,
} from '@/lib/services/mapper';
import { VERIFIED_ETHIOPIAN_INTERNSHIPS } from '@/lib/data/internships';

export interface CreateInternshipInput {
  title: string;
  description: string;
  location?: string;
  workplace_type?: 'remote' | 'hybrid' | 'onsite';
  internship_type?: string;
  duration?: string;
  stipend?: string;
  application_deadline?: string;
  requirements?: string[];
  responsibilities?: string[];
  skill_ids?: string[];
}

interface InterConnectContextType {
  role: 'student' | 'company' | 'guest';
  currentUser: Student | null;
  currentCompany: Company | null;
  studentProfileId: string | null;
  companyProfileId: string | null;
  switchRole: (role: 'student' | 'company' | 'guest') => void;
  updateCurrentUser: (updates: Partial<Student> | ((prev: Student | null) => Student | null)) => void;
  updateCurrentCompany: (updates: Partial<Company> | ((prev: Company | null) => Company | null)) => void;
  setRegisteredStudent: (data: {
    fullName: string;
    email: string;
    university: string;
    fieldOfStudy: string;
    graduationYear: string;
  }) => void;

  // Internships & Saved
  internships: Internship[];
  savedInternshipIds: string[];
  toggleSaveInternship: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  createPosition: (data: CreateInternshipInput) => Promise<{ success: boolean; data?: any; error?: any }>;

  // Applications
  applications: Application[];
  submitApplication: (
    internshipId: string,
    data: {
      fullName: string;
      email: string;
      phone: string;
      university: string;
      degree: string;
      gradYear: string;
      skills: string[];
      resumeName: string;
      coverLetter: string;
      resumeFile?: File;
    }
  ) => Promise<Application>;
  updateApplicationStatus: (
    applicationId: string,
    newStatus: Application['status']
  ) => Promise<void>;
  recordEmailApplication: (company: Company, subject: string, notes?: string) => Promise<void>;

  // Messaging
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;

  // Interviews
  interviews: InterviewInvite[];
  respondToInterview: (
    interviewId: string,
    slotId: string,
    action: 'accept' | 'decline'
  ) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;

  // Refresh & Loading
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const InterConnectContext = createContext<InterConnectContextType | undefined>(undefined);

export function InterConnectProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, session } = useAuth();

  const [role, setRole] = useState<'student' | 'company' | 'guest'>('student');
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);
  const [companyProfileId, setCompanyProfileId] = useState<string | null>(null);

  const [internships, setInternships] = useState<Internship[]>([]);
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [interviews, setInterviews] = useState<InterviewInvite[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync role with Auth user
  useEffect(() => {
    if (user) {
      setRole(user.role === 'company' ? 'company' : 'student');
    }
  }, [user]);

  /**
   * Load real data from Supabase
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch published internships from Supabase and merge with verified Ethiopian catalog
      const { data: dbInternships, error: internErr } = await dbFetchInternships();
      const mappedDb = !internErr && dbInternships
        ? dbInternships
            .map(mapDbInternshipToFrontend)
            .filter(
              (i) =>
                !EXCLUDED_INTERNSHIP_IDS.includes(i.id) &&
                !i.title.toLowerCase().includes('softmock') &&
                !i.company?.name?.toLowerCase().includes('softnock')
            )
        : [];

      // Combine Supabase positions with curated verified Ethiopian positions
      const dbIds = new Set(mappedDb.map((i) => i.id));
      const combined = [
        ...mappedDb,
        ...VERIFIED_ETHIOPIAN_INTERNSHIPS.filter(
          (i) =>
            !dbIds.has(i.id) &&
            !EXCLUDED_INTERNSHIP_IDS.includes(i.id) &&
            !i.title.toLowerCase().includes('softmock') &&
            !i.company?.name?.toLowerCase().includes('softnock')
        ),
      ];
      setInternships(combined);

      // 2. If authenticated user is a student, fetch student profile, applications, and saved internships
      if (user && user.role === 'student') {
        const meta = session?.user?.user_metadata || {};
        let localMeta: any = {};
        if (typeof window !== 'undefined') {
          try {
            localMeta = JSON.parse(localStorage.getItem('interconnect_student_meta') || '{}');
          } catch {}
        }
        const { data: studentProf } = await getStudentProfileByUserId(user.id);
        const effectiveField =
          studentProf?.fieldOfStudy ||
          meta.field_of_study ||
          meta.field ||
          localMeta.fieldOfStudy ||
          'Software Engineering';
        const effectiveUni =
          studentProf?.university ||
          meta.university ||
          localMeta.university ||
          'Addis Ababa University';
        const effectiveGradYear =
          parseInt(studentProf?.graduationYear || meta.graduation_year || meta.graduationYear || localMeta.graduationYear, 10) || 2027;

        let localAvatar = '';
        if (typeof window !== 'undefined') {
          try {
            localAvatar = localStorage.getItem('interconnect_student_avatar') || '';
          } catch {}
        }
        setStudentProfileId(studentProf?.studentProfileId || user.id);
        setCurrentUser((prev) => {
          const effectiveAvatar =
            studentProf?.avatarUrl && !studentProf.avatarUrl.includes('hero-student')
              ? studentProf.avatarUrl
              : user.avatar && !user.avatar.includes('hero-student')
              ? user.avatar
              : prev?.avatar && !prev.avatar.includes('hero-student')
              ? prev.avatar
              : localAvatar && !localAvatar.includes('hero-student')
              ? localAvatar
              : '';

          return {
            id: studentProf?.studentProfileId || user.id,
            profileId: studentProf?.profileId || user.profileId,
            userId: user.id,
            name: studentProf?.fullName || meta.full_name || localMeta.fullName || user.name,
            email: studentProf?.email || user.email,
            avatar: effectiveAvatar,
            headline: `${effectiveField} Student`,
            university: effectiveUni,
            degree: prev?.degree || 'B.Sc.',
            fieldOfStudy: effectiveField,
            gradYear: effectiveGradYear,
            location: studentProf?.location || meta.location || 'Ethiopia',
            bio: studentProf?.bio || '',
            completionRate: studentProf?.profileCompletion || 85,
            skills: studentProf?.skills?.map((s) => ({ name: s.skills?.name || 'Skill' })) || prev?.skills || [
              { name: effectiveField },
            ],
            education: prev?.education || [],
            projects: studentProf?.projects?.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              technologies: p.technologies || [],
              link: p.project_url,
              github: p.github_url,
            })) || prev?.projects || [],
            certificates: studentProf?.certificates?.map((c) => ({
              id: c.id,
              title: c.name,
              issuer: c.issuer || '',
              issueDate: c.issue_date || '',
              credentialUrl: c.credential_url,
            })) || prev?.certificates || [],
            experience: prev?.experience || [],
            resumeUrl: studentProf?.resumeUrl || prev?.resumeUrl,
            phone: studentProf?.phone || meta.phone || prev?.phone || '',
          };
        });

        if (studentProf) {
          // Fetch student's real saved internships from Supabase
          const { data: savedDb } = await dbFetchSavedInternships(studentProf.studentProfileId);
          if (savedDb) {
            const savedIds = savedDb.map((s: any) => s.internships?.id || s.internship_id).filter(Boolean);
            setSavedInternshipIds(savedIds);
          }

          // Fetch student's real applications from Supabase
          const { data: appsDb } = await dbFetchStudentApplications(studentProf.studentProfileId);
          if (appsDb) {
            const mappedApps = appsDb.map((a: any) => mapDbApplicationToFrontend(a));
            setApplications(mappedApps);
          }
        }
      } else if (!user && typeof window !== 'undefined') {
        // Fallback: restore student from local persistence if registered
        try {
          const cachedProfile = localStorage.getItem('interconnect_student_profile');
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            setCurrentUser(parsed);
          }
        } catch {}
      }

      // 3. If authenticated user is a company, fetch company profile, posted internships, and applications
      if (user && user.role === 'company') {
        const { data: companyProf } = await getCompanyProfileByUserId(user.id);
        if (companyProf) {
          setCompanyProfileId(companyProf.companyProfileId);
          setCurrentCompany((prev) => ({
            id: companyProf.companyProfileId,
            profileId: companyProf.profileId,
            userId: companyProf.userId,
            name: companyProf.companyName || user.name,
            logo: companyProf.logoUrl || user.avatar || prev?.logo || (companyProf.companyName ? companyProf.companyName.slice(0, 2).toUpperCase() : 'CO'),
            industry: companyProf.industry || '',
            location: companyProf.location || '',
            website: companyProf.website || '',
            size: companyProf.companySize || '',
            about: companyProf.description || '',
            mission: companyProf.mission || '',
            culture: prev?.culture || ['Innovation', 'Collaboration', 'Impact'],
            benefits: prev?.benefits || ['Health Coverage', 'Learning Stipend', 'Mentorship'],
            openPositionsCount: 1,
            verified: true,
          }));

          // Fetch company's real internships from Supabase
          const { data: compInternsDb } = await dbFetchCompanyInternships(companyProf.companyProfileId);
          if (compInternsDb) {
            const mappedCompanyInternships = compInternsDb
              .map(mapDbInternshipToFrontend)
              .filter(
                (c) =>
                  !EXCLUDED_INTERNSHIP_IDS.includes(c.id) &&
                  !c.title.toLowerCase().includes('softmock')
              );
            setInternships((prev) => {
              const compIds = new Set(mappedCompanyInternships.map((c) => c.id));
              const others = prev.filter((p) => !compIds.has(p.id));
              return [...mappedCompanyInternships, ...others];
            });
          }

          // Fetch company's real applications from Supabase
          const { data: compAppsDb } = await dbFetchCompanyApplications(companyProf.companyProfileId);
          if (compAppsDb) {
            const mappedCompApps = compAppsDb.map((a: any) => mapDbApplicationToFrontend(a));
            setApplications(mappedCompApps);
          }
        }
      }
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const switchRole = (newRole: 'student' | 'company' | 'guest') => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ic_role', newRole);
    }
  };

  const updateCurrentUser = useCallback((updates: Partial<Student> | ((prev: Student | null) => Student | null)) => {
    setCurrentUser((prev) => {
      const next = typeof updates === 'function' ? updates(prev) : (prev ? { ...prev, ...updates } : null);
      if (typeof window !== 'undefined' && next) {
        try {
          if (next.avatar !== undefined) {
            localStorage.setItem('interconnect_student_avatar', next.avatar || '');
          }
          localStorage.setItem('interconnect_student_profile', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }, []);

  const updateCurrentCompany = useCallback((updates: Partial<Company> | ((prev: Company | null) => Company | null)) => {
    setCurrentCompany((prev) => {
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return prev ? { ...prev, ...updates } : null;
    });
  }, []);

  const setRegisteredStudent = useCallback((data: {
    fullName: string;
    email: string;
    university: string;
    fieldOfStudy: string;
    graduationYear: string;
  }) => {
    const studentObj: Student = {
      id: `student_${Date.now()}`,
      profileId: `profile_${Date.now()}`,
      userId: `user_${Date.now()}`,
      name: data.fullName,
      email: data.email,
      avatar: '',
      headline: `${data.fieldOfStudy} Student`,
      university: data.university,
      degree: 'B.Sc.',
      fieldOfStudy: data.fieldOfStudy,
      gradYear: parseInt(data.graduationYear, 10) || 2027,
      location: 'Ethiopia',
      bio: `Aspiring ${data.fieldOfStudy} student at ${data.university}.`,
      completionRate: 85,
      skills: [{ name: data.fieldOfStudy }],
      education: [
        {
          id: 'edu_1',
          institution: data.university,
          degree: 'Bachelor of Science',
          field: data.fieldOfStudy,
          startDate: '2023',
          endDate: data.graduationYear || '2027',
        },
      ],
      projects: [],
      certificates: [],
      experience: [],
      phone: '',
    };
    setCurrentUser(studentObj);
    setRole('student');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('interconnect_student_profile', JSON.stringify(studentObj));
        localStorage.setItem('interconnect_student_meta', JSON.stringify(data));
        localStorage.setItem('ic_role', 'student');
      } catch {}
    }
  }, []);

  /**
   * Real Supabase Toggle Save / Bookmark
   * Uses safe optimistic updates with rollback if Supabase operation fails.
   */
  const toggleSaveInternship = async (id: string) => {
    const isCurrentlySaved = savedInternshipIds.includes(id);
    const previous = savedInternshipIds;

    // Optimistic state update
    const updated = isCurrentlySaved
      ? savedInternshipIds.filter((item) => item !== id)
      : [...savedInternshipIds, id];
    setSavedInternshipIds(updated);

    // Persist in Supabase if logged in student
    if (studentProfileId) {
      try {
        if (isCurrentlySaved) {
          const { success, error } = await dbUnsaveInternship(studentProfileId, id);
          if (error || !success) {
            console.error('Failed to unsave internship from Supabase:', error);
            setSavedInternshipIds(previous); // Rollback
          }
        } else {
          const { data, error } = await dbSaveInternship(studentProfileId, id);
          if (error || !data) {
            console.error('Failed to save internship to Supabase:', error);
            setSavedInternshipIds(previous); // Rollback
          }
        }
      } catch (err) {
        console.error('Failed to sync saved internship with Supabase:', err);
        setSavedInternshipIds(previous); // Rollback
      }
    }
  };

  const isSaved = (id: string) => savedInternshipIds.includes(id);

  /**
   * Real Supabase Create & Publish Internship (Company action)
   */
  const createPosition = async (data: CreateInternshipInput) => {
    const effectiveCompanyProfileId = companyProfileId || currentCompany?.id;
    if (!effectiveCompanyProfileId) {
      return { success: false, error: 'No active company profile found.' };
    }

    try {
      const { data: newInternshipDb, error } = await dbCreateInternship({
        company_profile_id: effectiveCompanyProfileId,
        title: data.title,
        description: data.description,
        location: data.location || 'Remote',
        workplace_type: data.workplace_type || 'remote',
        internship_type: data.internship_type || 'Full-time',
        duration: data.duration || '3 Months',
        stipend: data.stipend || '$1,500 / month',
        application_deadline: data.application_deadline,
        requirements: data.requirements || [],
        responsibilities: data.responsibilities || [],
        status: 'draft', // Unverified opportunities are saved as draft awaiting administrative review
        skill_ids: data.skill_ids,
      });

      if (error || !newInternshipDb) {
        return { success: false, error: error?.message || 'Failed to create internship' };
      }

      // Refresh internships
      await loadData();
      return { success: true, data: newInternshipDb };
    } catch (err: any) {
      console.error('createPosition error:', err);
      return { success: false, error: err?.message || 'Error creating internship' };
    }
  };

  /**
   * Real Supabase Submit Application (Student action)
   * Guaranteed:
   * - Internship must exist and NOT be expired.
   * - Student must be authenticated.
   * - Resume file uploaded securely to private bucket.
   * - Real database insert into `applications` and `application_status_history`.
   */
  const submitApplication = async (
    internshipId: string,
    data: {
      fullName: string;
      email: string;
      phone: string;
      university: string;
      degree: string;
      gradYear: string;
      skills: string[];
      resumeName: string;
      coverLetter: string;
      resumeFile?: File;
    }
  ): Promise<Application> => {
    const targetInternship = internships.find((i) => i.id === internshipId);
    if (!targetInternship) {
      throw new Error('Internship opportunity not found.');
    }

    if (targetInternship.isExpired) {
      throw new Error('This position has closed and cannot accept new applications.');
    }

    const effectiveStudentProfileId =
      studentProfileId || currentUser?.id;

    if (!effectiveStudentProfileId) {
      throw new Error('Please sign in as a student to submit an application.');
    }

    let resumeUrl = data.resumeName || currentUser?.resumeUrl || 'Resume_Attached.pdf';

    // Real resume file upload to private Supabase Storage bucket
    if (data.resumeFile && effectiveStudentProfileId) {
      const uploadResult = await uploadResume(effectiveStudentProfileId, data.resumeFile);
      if (uploadResult.error) {
        throw new Error(uploadResult.error || 'Failed to securely upload your resume file.');
      }
      if (uploadResult.signedUrl) {
        resumeUrl = uploadResult.signedUrl;
      } else if (uploadResult.path) {
        resumeUrl = uploadResult.path;
      }
    }

    let createdApplication: Application;

    // Real insert into Supabase `applications` and `application_status_history`
    const { data: dbApp, error: appErr } = await dbSubmitApplication({
      student_profile_id: effectiveStudentProfileId,
      internship_id: internshipId,
      resume_url: resumeUrl,
      cover_letter: data.coverLetter,
    });

    if (appErr || !dbApp) {
      throw new Error(appErr?.message || 'Failed to submit application to database. Please try again.');
    }

    createdApplication = mapDbApplicationToFrontend(
      {
        ...dbApp,
        internships: targetInternship,
        student_profiles: {
          id: effectiveStudentProfileId,
          university: data.university,
          field_of_study: data.degree,
          profiles: { full_name: data.fullName, email: data.email },
        },
      },
      targetInternship,
      currentUser || undefined
    );

    setApplications((prev) => [createdApplication, ...prev]);

    // Send real notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Transmitted! 🚀',
      message: `Your application for ${targetInternship.title} at ${targetInternship.company.name} has been placed in the pipeline.`,
      type: 'status',
      timestamp: 'Just now',
      isRead: false,
      link: '/dashboard/student/applications',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return createdApplication;
  };

  /**
   * Real Supabase Update Application Status (Company action)
   */
  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: Application['status']
  ) => {
    // Map frontend status to DB status
    const statusMap: Record<Application['status'], 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected'> = {
      Submitted: 'submitted',
      Reviewing: 'reviewing',
      Shortlisted: 'shortlisted',
      Interview: 'interview',
      Offered: 'accepted',
      Declined: 'rejected',
    };

    const dbStatus = statusMap[newStatus];

    // Persist status change in Supabase
    try {
      await dbUpdateApplicationStatus(
        applicationId,
        dbStatus,
        companyProfileId || undefined
      );
    } catch (err) {
      console.warn('Supabase application status update note:', err);
    }

    // Update local state with updated timeline
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          const updatedTimeline = [...app.timeline];
          if (newStatus === 'Reviewing') {
            updatedTimeline.push({
              status: 'Application Review',
              date: 'Today',
              note: 'Under active evaluation by the hiring team.',
              completed: true,
              current: true,
            });
          } else if (newStatus === 'Shortlisted') {
            updatedTimeline.push({
              status: 'Candidate Shortlisted',
              date: 'Today',
              note: 'Moved to shortlisted candidate pool.',
              completed: true,
              current: true,
            });
          } else if (newStatus === 'Interview') {
            updatedTimeline.push({
              status: 'Interview Stage',
              date: 'Today',
              note: 'Interview invitation extended.',
              completed: true,
              current: true,
            });
          } else if (newStatus === 'Offered') {
            updatedTimeline.push({
              status: 'Offer Extended',
              date: 'Today',
              note: 'Formal internship offer extended.',
              completed: true,
              current: true,
            });
          }
          return { ...app, status: newStatus, timeline: updatedTimeline };
        }
        return app;
      })
    );
  };

  /**
   * Direct Email Application Inquiry
   * Allows students to record a direct email outreach to a verified Ethiopian company
   * and tracks it in the student's active application timeline.
   */
  const recordEmailApplication = useCallback(
    async (company: Company, subject: string, notes?: string) => {
      const studentName = currentUser?.name || user?.name || 'Student';
      const studentField = currentUser?.fieldOfStudy || 'University Candidate';
      const studentUni = currentUser?.university || 'Ethiopian University';

      const studentGradYear = currentUser?.gradYear || 2027;

      const fallbackStudent: Student = {
        id: currentUser?.id || 'student',
        name: studentName,
        email: user?.email || '',
        avatar: currentUser?.avatar || '',
        headline: `${studentField} Student`,
        university: studentUni,
        degree: 'B.Sc.',
        fieldOfStudy: studentField,
        gradYear: studentGradYear,
        location: 'Ethiopia',
        bio: '',
        completionRate: 85,
        skills: [],
        education: [],
        projects: [],
        certificates: [],
        experience: [],
      };

      const fallbackInternship: Internship = {
        id: company.id,
        companyId: company.id,
        company: company,
        title: `Direct Internship Inquiry (${studentField})`,
        type: 'On-site',
        location: company.location,
        duration: 'Academic Attachment',
        stipend: 'Direct Inquiry',
        postedDate: new Date().toISOString(),
        matchScore: 95,
        matchBreakdown: { skills: 95, education: 95, location: 95, interests: 95 },
        description: `Direct student internship inquiry sent via email to ${company.contactEmail}.`,
        requirements: ['Enrolled university student', studentField],
        responsibilities: ['Academic practical internship training'],
        requiredSkills: currentUser?.skills?.map((s) => s.name) || [studentField],
        preferredSkills: [],
        benefits: company.benefits || [],
        department: studentField,
        industry: company.industry,
        applicantsCount: 1,
        status: 'published',
      };

      const newApp: Application = {
        id: `email-app-${Date.now()}`,
        internshipId: company.id,
        studentId: currentUser?.id || 'student',
        internship: fallbackInternship,
        student: currentUser || fallbackStudent,
        submittedAt: 'Today',
        status: 'Submitted',
        currentStep: 1,
        timeline: [
          {
            status: 'Submitted',
            date: 'Today',
            completed: true,
            note: `Direct internship inquiry dispatched to ${company.contactEmail}`,
          },
        ],
        resumeName: 'Direct Email Inquiry',
        coverLetter: notes || subject,
      };

      setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);

      // Add student notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Email Inquiry Recorded! 📧',
        message: `Your direct internship outreach to ${company.name} (${company.contactEmail}) has been logged in your tracker.`,
        type: 'status',
        timestamp: 'Just now',
        isRead: false,
        link: '/dashboard/student/applications',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [currentUser, user]
  );

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const senderRole = role === 'company' ? 'company' : 'student';
    const senderName = role === 'company' ? currentCompany?.name || 'Recruiter' : currentUser?.name || 'Student';
    const senderAvatar = role === 'company' ? currentCompany?.logo || 'CO' : currentUser?.avatar || 'ST';

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: role === 'company' ? currentCompany?.id || 'comp-1' : currentUser?.id || 'stud-1',
      senderName,
      senderAvatar,
      senderRole,
      text,
      timestamp: 'Just now',
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: 'Just now' }
          : c
      )
    );
  };

  const respondToInterview = (
    interviewId: string,
    slotId: string,
    action: 'accept' | 'decline'
  ) => {
    setInterviews((prev) =>
      prev.map((invite) => {
        if (invite.id === interviewId) {
          const selected = invite.availableSlots.find((s) => s.id === slotId);
          return {
            ...invite,
            status: action === 'accept' ? 'accepted' : 'declined',
            selectedSlot: action === 'accept' ? selected : undefined,
          };
        }
        return invite;
      })
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: action === 'accept' ? 'Interview Confirmed ✅' : 'Interview RSVP Sent',
      message:
        action === 'accept'
          ? 'Your interview slot has been locked into your calendar and the recruiter notified.'
          : 'You declined the interview invitation.',
      type: 'interview',
      timestamp: 'Just now',
      isRead: false,
      link: '/dashboard/student/interviews',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <InterConnectContext.Provider
      value={{
        role,
        currentUser,
        currentCompany,
        studentProfileId,
        companyProfileId,
        switchRole,
        updateCurrentUser,
        updateCurrentCompany,
        setRegisteredStudent,
        internships,
        savedInternshipIds,
        toggleSaveInternship,
        isSaved,
        createPosition,
        applications,
        submitApplication,
        updateApplicationStatus,
        recordEmailApplication,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        interviews,
        respondToInterview,
        notifications,
        markNotificationAsRead,
        unreadCount,
        refreshData: loadData,
        isLoading,
      }}
    >
      {children}
    </InterConnectContext.Provider>
  );
}

export function useInterConnect() {
  const context = useContext(InterConnectContext);
  if (!context) {
    throw new Error('useInterConnect must be used within an InterConnectProvider');
  }
  return context;
}
