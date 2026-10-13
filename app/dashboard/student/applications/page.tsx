'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { getResumeSignedUrl } from '@/lib/services/storageService';
import { Application } from '@/types';
import {
  Send,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

export default function StudentApplicationsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { applications } = useInterConnect();
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || 'app-101');
  const [isPreviewingResume, setIsPreviewingResume] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handlePreviewResume = async () => {
    if (!selectedApp) return;
    setIsPreviewingResume(true);
    setPreviewNotice(null);

    try {
      const resumeTarget = selectedApp.resumeUrl || selectedApp.student?.resumeUrl;
      if (resumeTarget) {
        const signedUrl = await getResumeSignedUrl(resumeTarget);
        if (signedUrl) {
          window.open(signedUrl, '_blank', 'noreferrer');
          setIsPreviewingResume(false);
          return;
        }
      }
      // If mock or no direct signed URL
      setPreviewNotice(`Resume "${selectedApp.resumeName}" is attached to this application record (ID: ${selectedApp.id}).`);
    } catch {
      setPreviewNotice(`Could not fetch secure link for ${selectedApp.resumeName}.`);
    } finally {
      setIsPreviewingResume(false);
    }
  };

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
              Application Tracker
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              Your Applications & Recruitment Timelines
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Track real-time progress across each hiring team with complete stage transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

            {/* Applications List (Col 1-5) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1">
                Active Applications ({applications.length})
              </span>

              {applications.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-brand-border">
                  <p className="text-xs text-brand-muted mb-3">No active applications found.</p>
                  <Link
                    href="/internships"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
                  >
                    <span>Browse Internships</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                  </Link>
                </div>
              ) : (
                applications.map((app) => {
                  const isSelected = app.id === selectedAppId;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-brand-sky shadow-card ring-2 ring-brand-sky/20'
                          : 'bg-white/80 border-brand-border hover:bg-white hover:border-brand-sky/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center font-bold text-base text-brand-navy">
                            {app.internship.company.logo}
                          </div>
                          <div>
                            <h4 className="font-heading font-extrabold text-sm text-brand-navy">
                              {app.internship.title}
                            </h4>
                            <span className="text-xs text-brand-muted">{app.internship.company.name}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                            app.status === 'Interview'
                              ? 'bg-brand-sky/20 text-brand-navy border border-brand-sky/30'
                              : app.status === 'Shortlisted'
                              ? 'bg-brand-tint text-brand-navy'
                              : 'bg-brand-canvas text-brand-muted'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-brand-muted pt-2 border-t border-brand-border/60">
                        <span>Submitted: {app.submittedAt}</span>
                        <span className="font-mono text-brand-navy font-bold">{app.id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Detailed Timeline View for Selected Application (Col 6-12) */}
            <div className="lg:col-span-7">
              {selectedApp ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft space-y-5">

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-brand-sky">
                          {selectedApp.id}
                        </span>
                        <span className="text-brand-border">•</span>
                        <span className="text-xs text-brand-muted">
                          Applied {selectedApp.submittedAt}
                        </span>
                      </div>
                      <h2 className="font-heading font-extrabold text-xl text-brand-navy">
                        {selectedApp.internship.title}
                      </h2>
                      <p className="text-xs font-semibold text-brand-sky">
                        {selectedApp.internship.company.name} · {selectedApp.internship.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/internships/${selectedApp.internshipId}`}
                        className="p-2 rounded-xl bg-brand-canvas hover:bg-brand-tint text-brand-navy border border-brand-border transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Role</span>
                      </Link>

                      <Link
                        href="/dashboard/student/messages"
                        className="p-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white transition-colors text-xs font-bold flex items-center gap-1 shadow-subtle"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-sky" />
                        <span>Message Recruiter</span>
                      </Link>
                    </div>
                  </div>

                  {/* Visual Stage Progress Timeline */}
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-brand-navy mb-3">
                      Hiring Stage Timeline
                    </h3>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-border">
                      {selectedApp.timeline.map((step, idx) => (
                        <div key={idx} className="relative group">
                          {/* Circle bullet point */}
                          <div
                            className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                              step.completed
                                ? 'bg-emerald-500 text-white'
                                : step.current
                                ? 'bg-brand-sky text-brand-navy animate-pulse'
                                : 'bg-brand-border text-brand-muted'
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <span className="text-[10px] font-black">{idx + 1}</span>
                            )}
                          </div>

                          <div className="bg-brand-canvas p-3.5 rounded-xl border border-brand-border/80">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-heading font-bold text-xs text-brand-navy">
                                {step.status}
                              </h4>
                              <span className="text-[10px] font-semibold text-brand-muted">
                                {step.date}
                              </span>
                            </div>
                            <p className="text-xs text-brand-muted">{step.note}</p>

                            {step.current && selectedApp.status === 'Interview' && (
                              <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between">
                                <span className="text-[11px] font-bold text-brand-navy">
                                  Interview slots pending confirmation
                                </span>
                                <Link
                                  href="/dashboard/student/interviews"
                                  className="text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight px-4 py-1.5 rounded-full transition-all flex items-center gap-1"
                                >
                                  <span>Select Slot</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attached Documents */}
                  <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-brand-sky" />
                      <div>
                        <span className="text-xs font-bold text-brand-navy block">
                          {selectedApp.resumeName}
                        </span>
                        <span className="text-[10px] text-brand-muted">
                          Attached application resume document
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePreviewResume}
                      disabled={isPreviewingResume}
                      className="text-xs font-bold text-brand-sky hover:underline flex items-center gap-1 disabled:opacity-75"
                    >
                      {isPreviewingResume ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <span>Preview File</span>
                      )}
                    </button>
                  </div>

                  {previewNotice && (
                    <div className="p-3 rounded-2xl bg-brand-tint/60 border border-brand-sky/30 text-xs text-brand-navy flex items-center justify-between">
                      <span>{previewNotice}</span>
                      <button onClick={() => setPreviewNotice(null)} className="text-brand-muted hover:text-brand-navy">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-brand-border">
                  <p className="text-brand-muted text-sm">Select an application to view timeline</p>
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
