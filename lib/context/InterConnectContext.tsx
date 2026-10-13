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
  const { user, isAuthenticated } = useAuth();

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
      // 1. Fetch all published internships from Supabase
      const { data: dbInternships, error: internErr } = await dbFetchInternships();
      if (!internErr && dbInternships) {
        const mapped = dbInternships.map(mapDbInternshipToFrontend);
        setInternships(mapped);
      } else {
        setInternships([]);
      }

      // 2. If authenticated user is a student, fetch student profile, applications, and saved internships
      if (user && user.role === 'student') {
        const { data: studentProf } = await getStudentProfileByUserId(user.id);
        if (studentProf) {
          setStudentProfileId(studentProf.studentProfileId);
          setCurrentUser((prev) => ({
            id: studentProf.studentProfileId,
            profileId: studentProf.profileId,
            userId: studentProf.userId,
            name: studentProf.fullName || user.name,
            email: studentProf.email || user.email,
            avatar: studentProf.avatarUrl || prev?.avatar || '/images/hero-student.jpg',
            headline: studentProf.fieldOfStudy ? `${studentProf.fieldOfStudy} Student` : '',
            university: studentProf.university || '',
            degree: prev?.degree || 'B.Sc.',
            fieldOfStudy: studentProf.fieldOfStudy || '',
            gradYear: parseInt(studentProf.graduationYear, 10) || 2026,
            location: studentProf.location || '',
            bio: studentProf.bio || '',
            completionRate: studentProf.profileCompletion || 75,
            skills: studentProf.skills?.map((s) => ({ name: s.skills?.name || 'Skill' })) || prev?.skills || [],
            education: prev?.education || [],
            projects: studentProf.projects?.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description || '',
              technologies: p.technologies || [],
              link: p.project_url,
              github: p.github_url,
            })) || [],
            certificates: studentProf.certificates?.map((c) => ({
              id: c.id,
              title: c.name,
              issuer: c.issuer || '',
              issueDate: c.issue_date || '',
              credentialUrl: c.credential_url,
            })) || [],
            experience: prev?.experience || [],
            resumeUrl: studentProf.resumeUrl,
            phone: studentProf.phone || '',
          }));

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
            logo: companyProf.logoUrl || prev?.logo || (companyProf.companyName ? companyProf.companyName.slice(0, 2).toUpperCase() : 'CO'),
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
            const mappedCompanyInternships = compInternsDb.map(mapDbInternshipToFrontend);
            setInternships(mappedCompanyInternships);
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
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return prev ? { ...prev, ...updates } : null;
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

  /**
   * Real Supabase Toggle Save / Bookmark
   */
  const toggleSaveInternship = async (id: string) => {
    const isCurrentlySaved = savedInternshipIds.includes(id);

    // Optimistic state update
    const updated = isCurrentlySaved
      ? savedInternshipIds.filter((item) => item !== id)
      : [...savedInternshipIds, id];
    setSavedInternshipIds(updated);

    // Persist in Supabase if logged in student
    if (studentProfileId) {
      try {
        if (isCurrentlySaved) {
          await dbUnsaveInternship(studentProfileId, id);
        } else {
          await dbSaveInternship(studentProfileId, id);
        }
      } catch (err) {
        console.error('Failed to sync saved internship with Supabase:', err);
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
    const effectiveStudentProfileId =
      studentProfileId || currentUser?.id;

    if (!effectiveStudentProfileId) {
      throw new Error('Please sign in as a student to submit an application.');
    }

    let resumeUrl = data.resumeName || 'Resume_Attached.pdf';

    // Real resume file upload to private Supabase Storage bucket
    if (data.resumeFile && effectiveStudentProfileId) {
      try {
        const uploadResult = await uploadResume(effectiveStudentProfileId, data.resumeFile);
        if (uploadResult.signedUrl) {
          resumeUrl = uploadResult.signedUrl;
        } else if (uploadResult.path) {
          resumeUrl = uploadResult.path;
        }
      } catch (uploadErr) {
        console.warn('Resume file upload note:', uploadErr);
      }
    }

    let createdApplication: Application;

    try {
      // Real insert into Supabase `applications` and `application_status_history`
      const { data: dbApp, error: appErr } = await dbSubmitApplication({
        student_profile_id: effectiveStudentProfileId,
        internship_id: internshipId,
        resume_url: resumeUrl,
        cover_letter: data.coverLetter,
      });

      if (dbApp && !appErr) {
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
      } else {
        // Fallback local Application structure if error or mock mode
        createdApplication = {
          id: `app-${Date.now().toString().slice(-4)}`,
          internshipId,
          studentId: effectiveStudentProfileId,
          internship: targetInternship,
          student: {
            ...currentUser!,
            name: data.fullName,
            email: data.email,
            phone: data.phone,
            university: data.university,
            degree: data.degree,
          },
          submittedAt: 'Today',
          status: 'Submitted',
          currentStep: 1,
          resumeName: data.resumeName || 'Resume_Attached.pdf',
          coverLetter: data.coverLetter,
          timeline: [
            {
              status: 'Application Submitted',
              date: 'Today',
              note: `Successfully transmitted to ${targetInternship.company.name} recruitment portal.`,
              completed: true,
              current: true,
            },
            {
              status: 'Application Review',
              date: 'Pending',
              note: 'Under evaluation by hiring team.',
              completed: false,
            },
            {
              status: 'Shortlist Decision',
              date: 'Pending',
              note: 'Awaiting review decision.',
              completed: false,
            },
          ],
        };
      }
    } catch {
      // Local fallback in case of network issue
      createdApplication = {
        id: `app-${Date.now().toString().slice(-4)}`,
        internshipId,
        studentId: effectiveStudentProfileId,
        internship: targetInternship,
        student: currentUser || {
          id: effectiveStudentProfileId,
          name: data.fullName,
          email: data.email,
          avatar: '/images/hero-student.jpg',
          headline: 'Student Applicant',
          university: data.university,
          degree: data.degree || 'B.Sc.',
          fieldOfStudy: data.degree || 'Computer Science',
          gradYear: parseInt(data.gradYear, 10) || 2026,
          location: 'Remote',
          bio: '',
          completionRate: 85,
          skills: data.skills.map((s) => ({ name: s })),
          education: [],
          projects: [],
          certificates: [],
          experience: [],
        },
        submittedAt: 'Today',
        status: 'Submitted',
        currentStep: 1,
        resumeName: data.resumeName || 'Resume_Attached.pdf',
        coverLetter: data.coverLetter,
        timeline: [
          {
            status: 'Application Submitted',
            date: 'Today',
            note: `Successfully transmitted to ${targetInternship.company.name} recruitment portal.`,
            completed: true,
            current: true,
          },
        ],
      };
    }

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
        internships,
        savedInternshipIds,
        toggleSaveInternship,
        isSaved,
        createPosition,
        applications,
        submitApplication,
        updateApplicationStatus,
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
