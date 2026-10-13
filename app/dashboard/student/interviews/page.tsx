'use client';

import React, { useState } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function StudentInterviewsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { interviews, respondToInterview } = useInterConnect();
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-1');

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Interview Management
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              Interview Invitations & Confirmed Sessions
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Review meeting invites, lock in preferred pairing slots, and access video meeting rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

            {/* List of Interview Invitations (Col 1-8) */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5">
              {interviews.length === 0 ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-dashed border-brand-border text-center space-y-2.5 shadow-soft">
                  <div className="w-14 h-14 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
                    <CalendarIcon className="w-7 h-7 text-brand-sky" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy">
                    No Interview Invitations Yet
                  </h3>
                  <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
                    When employer teams review your submitted applications and schedule technical pairing sessions, your calendar slots and video meeting links will appear directly here.
                  </p>
                </div>
              ) : (
                interviews.map((invite) => {
                const isAccepted = invite.status === 'accepted';
                return (
                  <div
                    key={invite.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-brand-border">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center font-bold text-lg text-brand-navy">
                          {invite.companyLogo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-sky">{invite.companyName}</span>
                            <span className="text-brand-border">•</span>
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isAccepted
                                   ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-brand-tint text-brand-navy'
                              }`}
                            >
                              {invite.status === 'accepted' ? 'Confirmed ✅' : 'Pending Selection'}
                            </span>
                          </div>
                          <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                            {invite.roleTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="text-xs text-brand-muted flex items-center gap-1 font-medium">
                        <Clock className="w-4 h-4 text-brand-sky" />
                        <span>{invite.duration} Pairing Session</span>
                      </div>
                    </div>

                    {/* Interviewer details */}
                    <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-brand-muted block">Lead Interviewer:</span>
                        <span className="font-bold text-brand-navy">
                          {invite.interviewerName} ({invite.interviewerRole})
                        </span>
                      </div>
                      {invite.notes && (
                        <p className="text-brand-muted text-[11px] sm:max-w-xs">{invite.notes}</p>
                      )}
                    </div>

                    {/* Available Slots Selector (If pending) */}
                    {!isAccepted ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                          Select Available Time Slot:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {invite.availableSlots.map((slot) => {
                            const isSelected = selectedSlotId === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`p-3.5 rounded-xl text-left border transition-all ${
                                  isSelected
                                    ? 'bg-brand-tint border-brand-sky text-brand-navy shadow-2xs font-bold ring-2 ring-brand-sky/20'
                                    : 'bg-white border-brand-border text-brand-text hover:bg-brand-canvas font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <CalendarIcon className="w-3.5 h-3.5 text-brand-sky" />
                                  <span className="text-xs">{slot.date}</span>
                                </div>
                                <span className="text-xs block text-brand-muted">{slot.time}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => respondToInterview(invite.id, selectedSlotId, 'accept')}
                            className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Confirm Selected Slot</span>
                          </button>

                          <button
                            onClick={() => respondToInterview(invite.id, selectedSlotId, 'decline')}
                            className="px-4 py-2.5 rounded-full bg-brand-canvas hover:bg-rose-50 text-brand-muted hover:text-rose-600 text-xs font-bold transition-all"
                          >
                            <span>Decline Invitation</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* If already accepted */
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Interview Time Confirmed: {invite.selectedSlot?.date} ({invite.selectedSlot?.time})</span>
                        </div>
                        <p className="text-emerald-700 text-[11px]">
                          Calendar invites with calendar .ics files have been delivered to your student email.
                        </p>
                        {invite.meetingLink && (
                          <div className="pt-1.5">
                            <a
                              href={invite.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
                            >
                              <Video className="w-4 h-4 text-emerald-600" />
                              <span>Join Live Video Room</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>

            {/* Preparation Tips Sidebar (Col 9-12) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-brand-sky" />
                  <h4 className="font-heading font-extrabold text-base text-brand-navy">
                    Technical Interview Tips
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-brand-muted leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0 mt-1.5" />
                    <span>Have your local IDE ready with Node.js and TypeScript initialized.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0 mt-1.5" />
                    <span>Prepare a 2-minute walkthrough of your featured capstone project repository.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0 mt-1.5" />
                    <span>Think out loud during live pairing questions—engineers value communication clarity over syntax memorization.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
