'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { fetchApplicationStatusHistory } from '@/lib/services/applicationService';
import { getResumeSignedUrl } from '@/lib/services/storageService';
import { Application } from '@/types';
import {
  Send,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  ArrowRight,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Inbox,
  Sparkles,
} from 'lucide-react';

const STATUS_FILTERS: Array<'All' | Application['status']> = [
  'All',
  'Submitted',
  'Reviewing',
  'Shortlisted',
  'Interview',
  'Offered',
  'Declined',
];

const STATUS_BADGE_STYLES: Record<Application['status'], string> = {
  Submitted: 'bg-brand-tint text-brand-navy border border-brand-sky/30',
  Reviewing: 'bg-amber-50 text-amber-800 border border-amber-200',
  Shortlisted: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  Interview: 'bg-purple-50 text-purple-800 border border-purple-200',
  Offered: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  Declined: 'bg-rose-50 text-rose-800 border border-rose-200',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  submitted: 'Application received and securely registered in the employer pipeline.',
  reviewing: 'Application materials and qualifications are under active review by the hiring team.',
  shortlisted: 'Candidate profile advanced to the shortlisted candidate pool.',
  interview: 'Candidate selected for an interview stage.',
  accepted: 'Congratulations! An internship offer has been extended.',
  rejected: 'Application was not selected for this cohort.',
};

export default function StudentApplicationsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { applications, isLoading } = useInterConnect();

  const [statusFilter, setStatusFilter] = useState<'All' | Application['status']>('All');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isPreviewingResume, setIsPreviewingResume] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);

  // Filter applications by status
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  // Selected application
  const selectedApp =
    filteredApplications.find((a) => a.id === selectedAppId) || filteredApplications[0] || null;

  // Auto-sync selection when filter changes
  useEffect(() => {
    if (filteredApplications.length > 0 && !filteredApplications.some((a) => a.id === selectedAppId)) {
      setSelectedAppId(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedAppId]);

  // Load genuine status history from Supabase when selected application changes
  useEffect(() => {
    if (!selectedApp) {
      setStatusHistory([]);
      return;
    }
    let isMounted = true;
    setIsLoadingHistory(true);
    fetchApplicationStatusHistory(selectedApp.id).then(({ data, error }) => {
      if (isMounted) {
        if (!error && data) {
          setStatusHistory(data);
        } else {
          setStatusHistory([]);
        }
        setIsLoadingHistory(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedApp?.id]);

  // Handle secure preview of private resume document
  const handlePreviewResume = async () => {
    if (!selectedApp) return;
    setIsPreviewingResume(true);
    setPreviewNotice(null);

    try {
      const resumeTarget = selectedApp.resumeUrl || selectedApp.student?.resumeUrl;
      if (resumeTarget && (resumeTarget.startsWith('http') || resumeTarget.includes('/'))) {
        const signedUrl = await getResumeSignedUrl(resumeTarget);
        if (signedUrl) {
          window.open(signedUrl, '_blank', 'noreferrer');
          setIsPreviewingResume(false);
          return;
        }
      }
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

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Real-Time Application Tracking
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
                Your Applications & Recruitment Pipeline
              </h1>
              <p className="text-xs text-brand-muted mt-1">
                Track verified submissions and genuine status updates recorded in Supabase.
              </p>
            </div>

            <Link
              href="/internships"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle self-start sm:self-auto"
            >
              <span>Browse Open Positions</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
            </Link>
          </div>

          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-brand-border shadow-2xs">
            {STATUS_FILTERS.map((f) => {
              const count =
                f === 'All'
                  ? applications.length
                  : applications.filter((a) => a.status === f).length;
              const isActive = statusFilter === f;

              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-2xs'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-brand-canvas'
                  }`}
                >
                  <span>{f === 'Reviewing' ? 'In Review' : f}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-canvas text-brand-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-brand-border p-8">
              <Loader2 className="w-8 h-8 text-brand-sky animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-brand-navy">Loading your applications...</p>
              <p className="text-xs text-brand-muted mt-1">Fetching application records and timeline history from Supabase.</p>
            </div>
          ) : applications.length === 0 ? (
            /* Empty State: 0 total applications */
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-brand-border p-8 max-w-xl mx-auto shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-brand-tint border border-brand-sky/20 flex items-center justify-center text-brand-sky mx-auto mb-4">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-1.5">
                No Applications Submitted Yet
              </h3>
              <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed mb-6">
                You have not submitted an application to any internship cohort yet. Explore open positions to apply with your student profile and verified skills.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-card transition-all"
                >
                  <Briefcase className="w-4 h-4 text-brand-sky" />
                  <span>Discover Open Internships</span>
                </Link>
                <Link
                  href="/companies"
                  className="px-5 py-2.5 rounded-full bg-brand-canvas hover:bg-brand-border/40 text-brand-navy border border-brand-border text-xs font-bold transition-all"
                >
                  Explore Verified Companies
                </Link>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            /* Empty Filter State */
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-brand-border p-6 max-w-md mx-auto">
              <p className="text-sm font-bold text-brand-navy mb-1">
                No Applications in &quot;{statusFilter}&quot;
              </p>
              <p className="text-xs text-brand-muted mb-4">
                You do not currently have any applications under this status filter.
              </p>
              <button
                onClick={() => setStatusFilter('All')}
                className="px-4 py-2 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight transition-all shadow-subtle"
              >
                Show All Applications ({applications.length})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

              {/* Left Column: Applications List (Col 1-5) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-muted px-1">
                  <span>Showing {filteredApplications.length} Position{filteredApplications.length === 1 ? '' : 's'}</span>
                  {statusFilter !== 'All' && <span>Filter: {statusFilter}</span>}
                </div>

                <div className="space-y-2.5">
                  {filteredApplications.map((app) => {
                    const isSelected = app.id === selectedApp?.id;
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
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center font-bold text-base text-brand-navy shrink-0">
                              {app.internship.company.logo}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-brand-navy truncate">
                                {app.internship.title}
                              </h4>
                              <span className="text-xs text-brand-muted truncate block">
                                {app.internship.company.name} · {app.internship.type}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                              STATUS_BADGE_STYLES[app.status] || 'bg-brand-canvas text-brand-muted'
                            }`}
                          >
                            {app.status === 'Reviewing' ? 'In Review' : app.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-brand-muted pt-2 border-t border-brand-border/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand-sky" />
                            Submitted {app.submittedAt}
                          </span>
                          <span className="font-mono text-[10px] text-brand-muted">
                            {app.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Timeline & Status History View (Col 6-12) */}
              <div className="lg:col-span-7">
                {selectedApp ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft space-y-5">

                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-brand-sky">
                            ID: {selectedApp.id.slice(0, 13)}...
                          </span>
                          <span className="text-brand-border">•</span>
                          <span className="text-xs text-brand-muted">
                            Submitted {selectedApp.submittedAt}
                          </span>
                        </div>
                        <h2 className="font-heading font-extrabold text-xl text-brand-navy">
                          {selectedApp.internship.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-brand-navy">
                            {selectedApp.internship.company.name}
                          </span>
                          <span className="text-brand-border">•</span>
                          <span className="text-xs text-brand-muted">
                            {selectedApp.internship.type} · {selectedApp.internship.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={selectedApp.internship.company?.id ? `/companies/${selectedApp.internship.company.id}` : `/internships/${selectedApp.internshipId}`}
                          className="px-3 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-tint text-brand-navy border border-brand-border transition-colors text-xs font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Organization</span>
                        </Link>
                      </div>
                    </div>

                    {/* Current Status Overview Banner */}
                    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${STATUS_BADGE_STYLES[selectedApp.status]}`}>
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-extrabold text-xs uppercase tracking-wider">Current Status:</span>
                          <span className="font-black text-sm">{selectedApp.status === 'Reviewing' ? 'Under Review' : selectedApp.status}</span>
                        </div>
                        <p className="text-xs mt-1 leading-relaxed opacity-90">
                          {STATUS_DESCRIPTIONS[selectedApp.status.toLowerCase()] ||
                            'Your application has been received and logged in the recruiter candidate queue.'}
                        </p>
                      </div>
                    </div>

                    {/* Genuine Status History Timeline */}
                    <div>
                      <h3 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-sky" />
                        <span>Recruitment History & Logged Milestones</span>
                      </h3>

                      {isLoadingHistory ? (
                        <div className="p-6 text-center bg-brand-canvas rounded-2xl border border-brand-border">
                          <Loader2 className="w-5 h-5 text-brand-sky animate-spin mx-auto mb-2" />
                          <span className="text-xs text-brand-muted">Retrieving recorded status history...</span>
                        </div>
                      ) : statusHistory.length > 0 ? (
                        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
                          {statusHistory.map((hist, idx) => {
                            const isLatest = idx === statusHistory.length - 1;
                            const statusKey = hist.new_status?.toLowerCase();
                            const formattedDate = hist.changed_at
                              ? new Date(hist.changed_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : selectedApp.submittedAt;

                            return (
                              <div key={hist.id || idx} className="relative">
                                <div
                                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                                    isLatest ? 'bg-brand-sky text-brand-navy' : 'bg-emerald-500 text-white'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>

                                <div className="bg-brand-canvas p-3.5 rounded-xl border border-brand-border/80">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-heading font-bold text-xs text-brand-navy capitalize">
                                      {hist.new_status === 'submitted'
                                        ? 'Application Submitted'
                                        : hist.new_status === 'reviewing'
                                        ? 'Under Active Review'
                                        : hist.new_status}
                                    </h4>
                                    <span className="text-[10px] font-semibold text-brand-muted">
                                      {formattedDate}
                                    </span>
                                  </div>
                                  <p className="text-xs text-brand-muted">
                                    {STATUS_DESCRIPTIONS[statusKey] || 'Status recorded in hiring workflow.'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center ring-4 ring-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="bg-brand-canvas p-3.5 rounded-xl border border-brand-border/80">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-heading font-bold text-xs text-brand-navy">
                                  Application Submitted
                                </h4>
                                <span className="text-[10px] font-semibold text-brand-muted">
                                  {selectedApp.submittedAt}
                                </span>
                              </div>
                              <p className="text-xs text-brand-muted">
                                Your application has been logged into the hiring database. Further status updates will appear here when the organization reviews your candidacy.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Statement of Purpose / Cover Letter Note */}
                    {selectedApp.coverLetter && (
                      <div className="bg-brand-canvas p-4 rounded-2xl border border-brand-border">
                        <span className="text-xs font-bold text-brand-navy uppercase tracking-wider block mb-1.5">
                          Submitted Cover Note to Recruiter:
                        </span>
                        <p className="text-xs text-brand-muted leading-relaxed whitespace-pre-line italic">
                          &quot;{selectedApp.coverLetter}&quot;
                        </p>
                      </div>
                    )}

                    {/* Attached Resume Document */}
                    <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-brand-sky shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-brand-navy block truncate">
                            {selectedApp.resumeName}
                          </span>
                          <span className="text-[10px] text-brand-muted">
                            Attached resume document for this submission
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handlePreviewResume}
                        disabled={isPreviewingResume}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-brand-tint text-brand-navy border border-brand-border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-75"
                      >
                        {isPreviewingResume ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                            <span>Opening...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3.5 h-3.5 text-brand-sky" />
                            <span>Preview Resume</span>
                          </>
                        )}
                      </button>
                    </div>

                    {previewNotice && (
                      <div className="p-3 rounded-2xl bg-brand-tint/60 border border-brand-sky/30 text-xs text-brand-navy flex items-center justify-between animate-in fade-in">
                        <span>{previewNotice}</span>
                        <button
                          onClick={() => setPreviewNotice(null)}
                          className="text-brand-muted hover:text-brand-navy"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-brand-border">
                    <p className="text-brand-muted text-sm">Select an application from the left to view details</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
