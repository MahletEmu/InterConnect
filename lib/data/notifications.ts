import { NotificationItem } from '@/types';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Interview Invitation Received',
    message: 'Nova Systems invited you to schedule a technical pairing interview for Software Engineering Intern.',
    type: 'interview',
    timestamp: '25 mins ago',
    isRead: false,
    link: '/dashboard/student/interviews',
  },
  {
    id: 'notif-2',
    title: 'Application Shortlisted 🎉',
    message: 'Your application for AI Research & ML Systems Intern at TechNova was moved to Shortlisted.',
    type: 'status',
    timestamp: '2 hours ago',
    isRead: false,
    link: '/dashboard/student/applications',
  },
  {
    id: 'notif-3',
    title: 'New 96% Match Discovered',
    message: 'TechNova posted an AI Research internship strongly matching your skills in Python, PyTorch, and algorithms.',
    type: 'match',
    timestamp: '1 day ago',
    isRead: true,
    link: '/internships/intern-4',
  },
  {
    id: 'notif-4',
    title: 'Profile Strength Reminder',
    message: 'Your profile is 87% complete. Add a verified certificate or GitHub repo to reach 100% and unlock priority employer matching.',
    type: 'system',
    timestamp: '2 days ago',
    isRead: true,
    link: '/dashboard/student/profile',
  },
  {
    id: 'notif-5',
    title: 'Vertex Labs Viewed Your Profile',
    message: 'A talent scout from Vertex Labs visited your student portfolio.',
    type: 'system',
    timestamp: '3 days ago',
    isRead: true,
    link: '/dashboard/student/profile',
  },
];
