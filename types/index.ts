export type UserRole = 'student' | 'company' | 'admin';

export interface User {
  id: string;
  profileId?: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  avatar?: string;
}

export interface SkillItem {
  name: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Student {
  id: string;
  profileId?: string;
  userId?: string;
  name: string;
  email: string;
  avatar: string;
  headline: string;
  university: string;
  degree: string;
  fieldOfStudy: string;
  gradYear: number;
  location: string;
  bio: string;
  completionRate: number;
  skills: SkillItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  experience: ExperienceItem[];
  resumeUrl?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  phone?: string;
}

export interface Company {
  id: string;
  profileId?: string;
  userId?: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  city?: string;
  website: string;
  careersUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  size: string;
  about: string;
  mission: string;
  culture: string[];
  benefits: string[];
  internshipFields?: string[];
  openPositionsCount: number;
  verified: boolean;
  isClaimed?: boolean;
  coverImage?: string;
}

export interface MatchBreakdown {
  skills: number;
  education: number;
  location: number;
  interests: number;
}

export interface Internship {
  id: string;
  companyId: string;
  company: Company;
  title: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  duration: string;
  stipend: string;
  postedDate: string;
  applicationDeadline?: string;
  isExpired?: boolean;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  matchReasons?: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  preferredSkills?: string[];
  benefits: string[];
  department: string;
  industry: string;
  applicantsCount: number;
  featured?: boolean;
  status?: 'draft' | 'pending_approval' | 'published' | 'closed';
}

export interface TimelineStep {
  status: string;
  date: string;
  note: string;
  completed: boolean;
  current?: boolean;
}

export interface Application {
  id: string;
  internshipId: string;
  studentId: string;
  internship: Internship;
  student: Student;
  submittedAt: string;
  status: 'Submitted' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Offered' | 'Declined';
  currentStep: number;
  timeline: TimelineStep[];
  resumeName: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface MessageAttachment {
  name: string;
  size: string;
  url?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'student' | 'company';
  text: string;
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  roleTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface InterviewSlot {
  id: string;
  date: string;
  time: string;
}

export interface InterviewInvite {
  id: string;
  applicationId: string;
  companyName: string;
  companyLogo: string;
  roleTitle: string;
  interviewerName: string;
  interviewerRole: string;
  duration: string;
  meetingLink?: string;
  status: 'pending' | 'accepted' | 'declined' | 'rescheduled';
  availableSlots: InterviewSlot[];
  selectedSlot?: InterviewSlot;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'interview' | 'status' | 'message' | 'system';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface FilterState {
  keyword: string;
  location: string;
  workType: string[];
  industry: string[];
  duration: string[];
  skills: string[];
  minPay: string;
  sortBy: 'match' | 'newest' | 'popular';
}
