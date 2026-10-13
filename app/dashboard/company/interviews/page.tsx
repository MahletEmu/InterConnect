'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { Calendar, Clock, Video, Plus, CheckCircle2, User } from 'lucide-react';

export default function CompanyInterviewsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { interviews } = useInterConnect();

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Technical Pairing Sprints
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
                Scheduled Interviews & Slot Allocations
              </h1>
            </div>

            <Link
              href="/dashboard/company/candidates"
              className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-brand-sky" />
              <span>Invite New Candidate</span>
            </Link>
          </div>

          <div className="space-y-3.5">
            {interviews.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 border border-dashed border-brand-border text-center space-y-2.5 shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
                  <Calendar className="w-7 h-7 text-brand-sky" />
                </div>
                <h3 className="font-heading font-extrabold text-base text-brand-navy">
                  No Scheduled Interviews Yet
                </h3>
                <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
                  When you advance candidates in your ATS pipeline or invite talent to technical pairing sessions, scheduled interviews will appear directly here.
                </p>
              </div>
            ) : (
              interviews.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center font-bold text-lg text-brand-navy">
                    {item.companyLogo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-base text-brand-navy">
                        {item.roleTitle}
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-tint text-brand-navy">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted">
                      Interviewer: <span className="font-semibold text-brand-navy">{item.interviewerName}</span> ({item.interviewerRole})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-sky" />
                    {item.duration}
                  </span>
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5 text-brand-sky" />
                      <span>Launch Room</span>
                    </a>
                  )}
                </div>
              </div>
            )))}
          </div>
        </main>
      </div>
    </div>
  );
}
