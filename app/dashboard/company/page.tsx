'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { supabase } from '@/lib/supabase';
import {
  Briefcase,
  Users,
  Send,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export default function CompanyDashboardPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { currentCompany, internships, applications } = useInterConnect();
  const [candidates, setCandidates] = useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadCandidates() {
      try {
        const { data } = await supabase
          .from('student_profiles')
          .select(`
            id,
            university,
            field_of_study,
            profile_completion,
            profiles (full_name, avatar_url),
            student_skills (skills (name))
          `)
          .limit(3);

        if (data && isMounted) {
          const mapped = data.map((sp: any) => ({
            id: sp.id,
            name: sp.profiles?.full_name || 'Student Candidate',
            avatar: sp.profiles?.avatar_url || '/images/hero-student.jpg',
            university: sp.university || 'University Student',
            completionRate: sp.profile_completion || 80,
            skills: Array.isArray(sp.student_skills)
              ? sp.student_skills.map((sk: any) => ({ name: sk.skills?.name || 'Skill' })).filter((s: any) => Boolean(s.name))
              : [],
          }));
          setCandidates(mapped);
        }
      } catch (err) {
        console.error('Error loading candidates:', err);
      }
    }
    loadCandidates();
    return () => { isMounted = false; };
  }, []);

  const positionsCount = internships.length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviewsCount = applications.filter((a) => a.status === 'Interview').length;
  const reviewingCount = applications.filter((a) => a.status === 'Reviewing' || a.status === 'Submitted').length;
  const offeredCount = applications.filter((a) => a.status === 'Offered').length;

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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-brand-sky">
                  Recruiter ATS
                </span>
                <span className="text-brand-border">•</span>
                <span className="text-xs text-brand-muted">Summer 2026 Cohort</span>
              </div>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
                Good morning, {currentCompany?.name || 'Hiring Partner'}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/company/candidates"
                className="px-4 py-2 rounded-full bg-white border border-brand-border hover:bg-brand-canvas text-brand-navy text-xs font-bold transition-all"
              >
                Search Talent
              </Link>
              <Link
                href="/dashboard/company/internships"
                className="px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-brand-sky" />
                <span>Post New Position</span>
              </Link>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2.5">
                <Briefcase className="w-4 h-4 text-brand-sky" />
              </div>
              <span className="text-xs font-bold text-brand-muted block">Active Positions</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy mt-0.5 block">{positionsCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">
                Live recruitment postings
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2.5">
                <Send className="w-4 h-4 text-brand-sky" />
              </div>
              <span className="text-xs font-bold text-brand-muted block">Applications</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-sky mt-0.5 block">{totalAppsCount}</span>
              <span className="text-[10px] text-brand-muted mt-1.5 block">Candidates in active ATS pipeline</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2.5">
                <Users className="w-4 h-4 text-brand-sky" />
              </div>
              <span className="text-xs font-bold text-brand-muted block">Shortlisted</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy mt-0.5 block">{shortlistedCount}</span>
              <span className="text-[10px] text-brand-muted mt-1.5 block">Ready for technical review</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs font-bold text-brand-muted block">Interviews</span>
              <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-600 mt-0.5 block">{interviewsCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">
                Technical pairing scheduled
              </span>
            </div>
          </div>

          {/* Candidate Pipeline Overview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Candidate Pipeline Funnel
                </h3>
                <p className="text-xs text-brand-muted">
                  Applied ({totalAppsCount}) → Reviewing ({reviewingCount}) → Shortlisted ({shortlistedCount}) → Interview ({interviewsCount}) → Offers ({offeredCount})
                </p>
              </div>

              <Link
                href="/dashboard/company/applications"
                className="text-xs font-bold text-brand-sky hover:underline"
              >
                Open Kanban ATS Board →
              </Link>
            </div>

            {/* Visual Pipeline Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-center">
              <div className="p-3 rounded-xl bg-brand-canvas border border-brand-border">
                <span className="text-[11px] font-bold text-brand-muted block">Applied</span>
                <span className="font-heading font-black text-lg sm:text-xl text-brand-navy mt-0.5 block">{totalAppsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tint/30 border border-brand-sky/20">
                <span className="text-[11px] font-bold text-brand-sky block">Reviewing</span>
                <span className="font-heading font-black text-lg sm:text-xl text-brand-navy mt-0.5 block">{reviewingCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tint/60 border border-brand-sky/30">
                <span className="text-[11px] font-bold text-brand-navy block">Shortlisted</span>
                <span className="font-heading font-black text-lg sm:text-xl text-brand-navy mt-0.5 block">{shortlistedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-sky/20 border border-brand-sky/40">
                <span className="text-[11px] font-bold text-brand-navy block">Interview</span>
                <span className="font-heading font-black text-lg sm:text-xl text-brand-navy mt-0.5 block">{interviewsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-emerald-800 block">Accepted</span>
                <span className="font-heading font-black text-lg sm:text-xl text-emerald-600 mt-0.5 block">{offeredCount}</span>
              </div>
            </div>
          </div>

          {/* Top Matched Candidates Snippet */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  High-Priority Matched Candidates
                </h3>
                <p className="text-xs text-brand-muted">
                  Candidates with verified technical capabilities matching your active positions
                </p>
              </div>

              <Link
                href="/dashboard/company/candidates"
                className="text-xs font-bold text-brand-sky hover:underline"
              >
                View all candidates →
              </Link>
            </div>

            {candidates.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-brand-border rounded-2xl bg-brand-canvas/50">
                <p className="text-xs text-brand-muted mb-2.5">No student profiles registered in the network yet.</p>
                <Link
                  href="/dashboard/company/internships"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
                >
                  <span>Publish an Internship</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 sm:p-5 rounded-2xl bg-brand-canvas border border-brand-border hover:border-brand-sky/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-brand-sky">
                          <Image
                            src={candidate.avatar}
                            alt={candidate.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-black bg-brand-tint text-brand-navy px-2 py-0.5 rounded-full">
                          {candidate.completionRate}% Profile
                        </span>
                      </div>

                      <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy">
                        {candidate.name}
                      </h4>
                      <p className="text-xs text-brand-muted truncate mb-2">{candidate.university}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 3).map((sk: any) => (
                          <span
                            key={sk.name}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-brand-navy border border-brand-border"
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-between gap-2">
                      <Link
                        href="/dashboard/company/candidates"
                        className="flex-1 py-1.5 rounded-xl bg-white text-brand-navy border border-brand-border text-center text-xs font-bold hover:bg-brand-tint transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        href="/dashboard/company/messages"
                        className="flex-1 py-1.5 rounded-xl bg-brand-navy text-white text-center text-xs font-bold hover:bg-brand-navyLight transition-colors"
                      >
                        Contact
                      </Link>
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
