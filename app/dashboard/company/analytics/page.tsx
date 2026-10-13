'use client';

import React, { useState } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { BarChart2, TrendingUp, Users, Target, Clock, ArrowUpRight, GraduationCap } from 'lucide-react';

export default function CompanyAnalyticsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { applications } = useInterConnect();

  const totalApps = applications.length;
  const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviews = applications.filter((a) => a.status === 'Interview').length;
  const offered = applications.filter((a) => a.status === 'Offered').length;

  // University distribution from actual applications
  const uniMap: Record<string, number> = {};
  applications.forEach((a) => {
    const uni = a.student?.university || 'University Candidate';
    uniMap[uni] = (uniMap[uni] || 0) + 1;
  });
  const universityStats = Object.entries(uniMap).map(([school, count]) => ({
    school,
    applicants: count,
  }));

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
              Cohort Intelligence
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              Recruitment Analytics & Sourcing Channels
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Real-time pipeline metrics and verified candidate sourcing channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <span className="text-xs font-bold text-brand-muted block">Total Applications</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy mt-1.5 block">{totalApps}</span>
              <span className="text-[11px] text-brand-sky font-bold mt-1.5 block">Direct marketplace submissions</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <span className="text-xs font-bold text-brand-muted block">Shortlisted Candidates</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy mt-1.5 block">{shortlisted}</span>
              <span className="text-[11px] text-brand-muted mt-1.5 block">Selected for further review</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <span className="text-xs font-bold text-brand-muted block">Interview Stage</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-sky mt-1.5 block">{interviews}</span>
              <span className="text-[11px] text-brand-muted mt-1.5 block">Technical pairing sessions</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <span className="text-xs font-bold text-brand-muted block">Offers Extended</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-600 mt-1.5 block">{offered}</span>
              <span className="text-[11px] text-brand-muted mt-1.5 block">Final placement stage</span>
            </div>
          </div>

          {/* Sourcing Channels by University */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft">
            <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
              Top University Sourcing Pipelines
            </h3>

            {universityStats.length === 0 ? (
              <div className="p-6 text-center bg-brand-canvas rounded-xl border border-brand-border/60">
                <GraduationCap className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-bold text-brand-navy mb-1">
                  No university sourcing data yet
                </p>
                <p className="text-xs text-brand-muted max-w-md mx-auto">
                  Once students apply to your published internship positions, your university talent distribution and sourcing metrics will automatically populate here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {universityStats.map((item) => (
                  <div key={item.school} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-brand-navy">{item.school}</span>
                      <span className="text-brand-muted font-normal">
                        <strong className="text-brand-navy font-bold">{item.applicants}</strong> applicants
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-brand-canvas overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-sky to-brand-navy rounded-full"
                        style={{
                          width: `${Math.min(100, (item.applicants / Math.max(1, totalApps)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
