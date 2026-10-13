import { InterviewInvite } from '@/types';

export const mockInterviews: InterviewInvite[] = [
  {
    id: 'int-1',
    applicationId: 'app-101',
    companyName: 'Nova Systems',
    companyLogo: '⚡',
    roleTitle: 'Software Engineering Intern',
    interviewerName: 'Marcus Vance',
    interviewerRole: 'Principal Systems Architect',
    duration: '45 mins',
    meetingLink: 'https://meet.interconnect.io/nova-systems-pairing-882',
    status: 'pending',
    notes: 'Please ensure you have a code editor ready for a lightweight live coding and system design pairing discussion.',
    availableSlots: [
      { id: 'slot-1', date: 'Monday, Oct 12', time: '10:00 AM - 10:45 AM GMT' },
      { id: 'slot-2', date: 'Monday, Oct 12', time: '02:00 PM - 02:45 PM GMT' },
      { id: 'slot-3', date: 'Tuesday, Oct 13', time: '11:30 AM - 12:15 PM GMT' },
      { id: 'slot-4', date: 'Tuesday, Oct 13', time: '03:30 PM - 04:15 PM GMT' },
    ],
  },
  {
    id: 'int-2',
    applicationId: 'app-102',
    companyName: 'TechNova',
    companyLogo: '▲',
    roleTitle: 'AI Research & ML Systems Intern',
    interviewerName: 'Dr. Sarah Lin',
    interviewerRole: 'Senior Research Scientist',
    duration: '60 mins',
    meetingLink: 'https://meet.interconnect.io/technova-research-519',
    status: 'accepted',
    selectedSlot: { id: 'slot-prev', date: 'Thursday, Oct 15', time: '01:00 PM - 02:00 PM GMT' },
    notes: 'Discussion of foundational telemetry modeling and PyTorch optimization.',
    availableSlots: [],
  },
];
