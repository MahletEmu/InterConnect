import { Application } from '@/types';
import { mockInternships } from './internships';
import { mockStudents } from './students';

export const mockApplications: Application[] = [
  {
    id: 'app-101',
    internshipId: 'intern-1',
    studentId: 'stud-1',
    internship: mockInternships[0], // Nova Systems SWE
    student: mockStudents[0], // Alex Morgan
    submittedAt: 'Oct 2, 2026',
    status: 'Interview',
    currentStep: 4,
    resumeName: 'Alex_Morgan_Resume_2026.pdf',
    coverLetter: 'I am deeply enthusiastic about Nova Systems’ mission in developer infrastructure. With my background in TypeScript, React, and distributed systems, I am excited to contribute immediately to the platform team.',
    timeline: [
      {
        status: 'Application Submitted',
        date: 'Oct 2, 2026 · 10:30 AM',
        note: 'Application successfully received and assigned to Tech Talent Review.',
        completed: true,
      },
      {
        status: 'Application Reviewed',
        date: 'Oct 3, 2026 · 02:15 PM',
        note: 'Portfolio and GitHub repos reviewed by Principal Staff Engineer.',
        completed: true,
      },
      {
        status: 'Candidate Shortlisted',
        date: 'Oct 4, 2026 · 11:00 AM',
        note: 'Top 5% candidate match score (94%). Advanced to technical round.',
        completed: true,
      },
      {
        status: 'Technical Interview',
        date: 'Oct 8, 2026 · 10:00 AM (Upcoming)',
        note: '45-minute live pairing session with Senior Systems Architect.',
        completed: false,
        current: true,
      },
      {
        status: 'Final Decision',
        date: 'Estimated Oct 12, 2026',
        note: 'Formal offer package deliberation and team placement.',
        completed: false,
      },
    ],
  },
  {
    id: 'app-102',
    internshipId: 'intern-4',
    studentId: 'stud-1',
    internship: mockInternships[3], // TechNova AI
    student: mockStudents[0], // Alex Morgan
    submittedAt: 'Oct 4, 2026',
    status: 'Shortlisted',
    currentStep: 3,
    resumeName: 'Alex_Morgan_Resume_2026.pdf',
    coverLetter: 'TechNova’s work in foundation intelligence benchmarks aligns directly with my research interests. I have worked on time-series telemetry and machine learning backtesting pipelines.',
    timeline: [
      {
        status: 'Application Submitted',
        date: 'Oct 4, 2026 · 04:20 PM',
        note: 'Received by TechNova AI Recruiting Team.',
        completed: true,
      },
      {
        status: 'Screening Completed',
        date: 'Oct 5, 2026 · 01:10 PM',
        note: 'Academic background and Python/PyTorch proficiency verified.',
        completed: true,
      },
      {
        status: 'Shortlisted for Interview',
        date: 'Oct 6, 2026 · 09:45 AM',
        note: 'Invitation to schedule technical interview pending slot confirmation.',
        completed: false,
        current: true,
      },
      {
        status: 'Technical Assessment',
        date: 'Pending schedule',
        note: 'Machine learning problem solving discussion.',
        completed: false,
      },
      {
        status: 'Final Decision',
        date: 'TBD',
        note: 'Offer extension.',
        completed: false,
      },
    ],
  },
  {
    id: 'app-103',
    internshipId: 'intern-2',
    studentId: 'stud-1',
    internship: mockInternships[1], // Vertex Labs UI/UX
    student: mockStudents[0],
    submittedAt: 'Sep 28, 2026',
    status: 'Reviewing',
    currentStep: 2,
    resumeName: 'Alex_Morgan_Resume_2026.pdf',
    timeline: [
      {
        status: 'Application Submitted',
        date: 'Sep 28, 2026 · 08:12 AM',
        note: 'Application entered design review queue.',
        completed: true,
      },
      {
        status: 'Under Review',
        date: 'Sep 30, 2026 · 11:30 AM',
        note: 'Design portfolio and Figma prototypes under evaluation.',
        completed: false,
        current: true,
      },
      {
        status: 'Design Challenge',
        date: 'TBD',
        note: 'Practical design critique round.',
        completed: false,
      },
      {
        status: 'Final Decision',
        date: 'TBD',
        note: 'Offer decision.',
        completed: false,
      },
    ],
  },
];
