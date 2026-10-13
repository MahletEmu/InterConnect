'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { Application } from '@/types';
import {
  Sparkles,
  Search,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function CompanyApplicationsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { applications, updateApplicationStatus } = useInterConnect();

  const stages: Application['status'][] = [
    'Submitted',
    'Reviewing',
    'Shortlisted',
    'Interview',
    'Offered',
  ];

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Applicant Tracking System (ATS)
              </span>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mt-0.5">
                Candidate Pipeline & Stage Workflow
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-muted">
                Total candidates in flow: <strong className="text-brand-navy">{applications.length}</strong>
              </span>
            </div>
          </div>

          {/* Kanban Board Columns Horizontal Scroll */}
          <div className="flex gap-3.5 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage);

              return (
                <div
                  key={stage}
                  className="bg-brand-canvas rounded-2xl p-3.5 border border-brand-border flex flex-col min-w-[260px] flex-1 shrink-0"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
                    <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-brand-navy">
                      {stage === 'Submitted' ? 'Applied' : stage}
                    </h3>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white text-brand-navy border border-brand-border shadow-2xs">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Candidate Cards within this column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageApps.length === 0 ? (
                      <div className="p-6 text-center text-xs text-brand-muted border border-dashed border-brand-border rounded-2xl bg-white/40">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded-2xl p-4 border border-brand-border shadow-soft hover:shadow-card transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-brand-sky shrink-0 bg-brand-navy">
                                <Image
                                  src={app.student.avatar}
                                  alt={app.student.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-heading font-extrabold text-xs text-brand-navy truncate">
                                  {app.student.name}
                                </h4>
                                <span className="text-[10px] text-brand-muted truncate block">
                                  {app.student.university.split(' ')[0]}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-black text-brand-navy bg-brand-tint px-2 py-0.5 rounded-full shrink-0">
                              {app.internship.matchScore}%
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-brand-sky truncate">
                            {app.internship.title}
                          </div>

                          {/* Skill badges */}
                          <div className="flex flex-wrap gap-1">
                            {app.student.skills.slice(0, 2).map((sk) => (
                              <span
                                key={sk.name}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-canvas text-brand-text border border-brand-border"
                              >
                                {sk.name}
                              </span>
                            ))}
                          </div>

                          {/* Stage Transition Control Buttons */}
                          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-1">
                            {stage !== 'Submitted' && (
                              <button
                                onClick={() => {
                                  const idx = stages.indexOf(stage);
                                  if (idx > 0) updateApplicationStatus(app.id, stages[idx - 1]);
                                }}
                                className="p-1 rounded text-brand-muted hover:text-brand-navy"
                                title="Move Previous"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span className="text-[9px] font-semibold text-brand-muted truncate text-center flex-1">
                              {app.id}
                            </span>

                            {stage !== 'Offered' && (
                              <button
                                onClick={() => {
                                  const idx = stages.indexOf(stage);
                                  if (idx < stages.length - 1)
                                    updateApplicationStatus(app.id, stages[idx + 1]);
                                }}
                                className="p-1 rounded text-brand-sky hover:text-brand-navy font-bold flex items-center gap-0.5"
                                title="Advance Stage"
                              >
                                <span className="text-[9px]">Advance</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}
