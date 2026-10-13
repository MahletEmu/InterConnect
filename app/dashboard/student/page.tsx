'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  Sparkles,
  Send,
  Clock,
  Calendar,
  Award,
  ArrowRight,
  Bookmark,
  MapPin,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { currentUser, internships, applications, isSaved, toggleSaveInternship } = useInterConnect();

  // Recommendations sorted by match score
  const recommended = [...internships].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  // Metrics derived from real applications
  const appliedCount = applications.length;
  const inReviewCount = applications.filter((a) => a.status === 'Reviewing' || a.status === 'Submitted').length;
  const interviewsCount = applications.filter((a) => a.status === 'Interview').length;
  const offersCount = applications.filter((a) => a.status === 'Offered').length;

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">

          {/* Greeting Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
                Good morning, {currentUser?.name?.split(' ')[0] || 'Student'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                Here are curated opportunities and application updates selected for you today.
              </p>
            </div>

            <Link
              href="/internships"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all self-start md:self-auto"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
            </Link>
          </div>

          {/* Top Grid: Profile Completion Card + Stats Counter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

            {/* Profile Completion Card (Col 1-5) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-brand-sky/20 via-brand-tint/60 to-white rounded-2xl sm:rounded-3xl p-5 border border-brand-sky/30 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-sky" />
                    Profile Strength
                  </span>
                  <span className="text-xs font-black text-brand-navy bg-white px-2.5 py-0.5 rounded-full shadow-2xs">
                    {currentUser?.completionRate || 87}% Complete
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">
                  Complete your profile to boost employer visibility.
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed mb-3">
                  Students with 100% completed profiles and verified GitHub repos receive 3.4x more interview invitations.
                </p>

                <div className="w-full h-2 rounded-full bg-white overflow-hidden shadow-inner mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-navy"
                    style={{ width: `${currentUser?.completionRate || 87}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-sky/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-navy">
                  Next: Add verified certificate
                </span>
                <Link
                  href="/dashboard/student/profile"
                  className="text-xs font-bold text-brand-navy hover:text-brand-sky hover:underline"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>

            {/* Application Pipeline Status Cards (Col 6-12) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2">
                  <Send className="w-4 h-4 text-brand-sky" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy">{appliedCount}</span>
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">Applied</span>
                </div>
                <span className="text-[10px] text-brand-muted mt-1.5">All time</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2">
                  <Clock className="w-4 h-4 text-brand-accentYellow" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy">{inReviewCount}</span>
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">In Review</span>
                </div>
                <span className="text-[10px] text-brand-muted mt-1.5">Active queue</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2">
                  <Calendar className="w-4 h-4 text-brand-sky" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy">{interviewsCount}</span>
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">Interviews</span>
                </div>
                <span className="text-[10px] text-brand-sky font-bold mt-1.5">Upcoming</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-600">{offersCount}</span>
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">Offers</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1.5">Pending RSVP</span>
              </div>
            </div>

          </div>

          {/* Recommended Internships Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-brand-navy">
                  Recommended Opportunities for You
                </h2>
                <p className="text-xs text-brand-muted">
                  Ranked by verified skills in TypeScript, React, Python, and Systems Design
                </p>
              </div>

              <Link
                href="/internships"
                className="text-xs font-bold text-brand-sky hover:underline"
              >
                View all ({internships.length}) →
              </Link>
            </div>

            {recommended.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-brand-border rounded-2xl bg-white shadow-soft">
                <p className="text-xs text-brand-muted mb-2.5">No matching internships published at the moment.</p>
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
                >
                  <span>Explore All Positions</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {recommended.map((item) => {
                  const saved = isSaved(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-bold text-base">
                              {item.company.logo}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-brand-navy">{item.company.name}</h4>
                              <span className="text-[10px] text-brand-muted">{item.type}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSaveInternship(item.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              saved ? 'bg-brand-tint text-brand-sky' : 'bg-brand-canvas text-brand-muted'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-brand-sky' : ''}`} />
                          </button>
                        </div>

                        <Link href={`/internships/${item.id}`} className="block mb-1.5">
                          <h3 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy group-hover:text-brand-sky transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-tint text-brand-navy text-[11px] font-black mb-2.5">
                          <Sparkles className="w-3 h-3 text-brand-sky" />
                          <span>{item.matchScore}% Match</span>
                        </div>

                        <div className="text-xs font-bold text-emerald-600 mb-3">
                          {item.stipend}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.requiredSkills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-canvas text-brand-text border border-brand-border/60"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-between">
                        <span className="text-[11px] text-brand-muted">{item.duration.split('(')[0]}</span>
                        <Link
                          href={`/internships/${item.id}`}
                          className="text-xs font-bold text-brand-navy hover:text-brand-sky flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Application Status Tracker Snippet */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Active Application Status
                </h3>
                <p className="text-xs text-brand-muted">
                  Real-time timeline tracking your latest recruiter interactions
                </p>
              </div>

              <Link
                href="/dashboard/student/applications"
                className="text-xs font-bold text-brand-sky hover:underline"
              >
                View Full Tracking Table →
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-brand-border rounded-2xl bg-brand-canvas/50">
                <p className="text-xs text-brand-muted mb-2.5">You haven&apos;t submitted any applications yet.</p>
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
                >
                  <span>Explore Open Internships</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                </Link>
              </div>
            ) : (
              applications.slice(0, 2).map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-brand-canvas border border-brand-border mb-3 last:mb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center font-bold text-base text-brand-navy">
                        {app.internship.company.logo}
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-xs sm:text-sm text-brand-navy">
                          {app.internship.title}
                        </h4>
                        <p className="text-[11px] text-brand-muted">
                          {app.internship.company.name} · Submitted {app.submittedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          app.status === 'Interview'
                            ? 'bg-brand-sky/20 text-brand-navy border border-brand-sky/30'
                            : app.status === 'Shortlisted'
                            ? 'bg-brand-tint text-brand-navy'
                            : 'bg-white text-brand-muted'
                        }`}
                      >
                        Status: {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-brand-border/60">
                    {app.timeline.slice(0, 4).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            step.completed
                              ? 'bg-emerald-500 text-white'
                              : step.current
                              ? 'bg-brand-sky text-brand-navy animate-pulse'
                              : 'bg-brand-border text-brand-muted'
                          }`}
                        >
                          {step.completed ? '✓' : idx + 1}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-brand-navy block truncate text-[11px]">
                            {step.status}
                          </span>
                          <span className="text-[10px] text-brand-muted block truncate">{step.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
