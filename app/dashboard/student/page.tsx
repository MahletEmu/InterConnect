'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { Company, Internship } from '@/types';
import { getCompaniesMatchingDepartment } from '@/lib/data/verifiedCompanies';
import { ETHIOPIAN_DEPARTMENTS } from '@/lib/data/ethiopia';
import EmailApplicationModal from '@/components/student/EmailApplicationModal';
import {
  Sparkles,
  Send,
  Clock,
  Calendar,
  Award,
  ArrowRight,
  Bookmark,
  MapPin,
  Building,
  Mail,
  ExternalLink,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
} from 'lucide-react';

import { evaluateHonestMatch } from '@/lib/services/matchingService';

export default function StudentDashboardPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { currentUser, internships, applications, isSaved, toggleSaveInternship } = useInterConnect();

  // Email Application Modal State
  const [selectedCompanyForEmail, setSelectedCompanyForEmail] = useState<Company | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Department filter: default to registered student's department or 'Software Engineering'
  const studentDepartment = currentUser?.fieldOfStudy || 'Software Engineering';
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('');
  const activeDepartment = selectedDeptFilter || studentDepartment;

  // Tab: 'companies' (Direct Email Request) or 'positions' (Open roles in DB)
  const [activeTab, setActiveTab] = useState<'companies' | 'positions'>('companies');

  // Matched Companies based on active department
  const matchedCompanies = getCompaniesMatchingDepartment(activeDepartment);

  // Filtered internships for active department (excluding closed and expired deadlines)
  const matchedInternships = internships.filter((item) => {
    if (!item) return false;
    if (item.status === 'closed' || item.status === 'draft') return false;
    if (item.applicationDeadline) {
      const deadline = new Date(item.applicationDeadline).getTime();
      if (!isNaN(deadline) && deadline < Date.now()) return false;
    }
    const itemDept = (item.department || '').toLowerCase();
    const itemTitle = (item.title || '').toLowerCase();
    const activeLow = activeDepartment.toLowerCase();
    return itemDept.includes(activeLow) || activeLow.includes(itemDept) || itemTitle.includes(activeLow);
  });

  // Display internships: matched ones, or all active open positions if none match department
  const activeInternships = internships.filter((item) => {
    if (!item || item.status === 'closed' || item.status === 'draft') return false;
    if (item.applicationDeadline) {
      const deadline = new Date(item.applicationDeadline).getTime();
      if (!isNaN(deadline) && deadline < Date.now()) return false;
    }
    return true;
  });
  const displayInternships = matchedInternships.length > 0 ? matchedInternships : activeInternships;

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-brand-border shadow-soft">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
                  Welcome, {currentUser?.name?.split(' ')[0] || 'Student'} 👋
                </h1>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-brand-tint text-brand-navy border border-brand-sky/30">
                  {currentUser?.fieldOfStudy || 'All Departments'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-brand-muted">
                {currentUser?.university ? `${currentUser.university} · ` : ''}
                Verified Ethiopian employers accepting student internship requests in your field.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link
                href="/dashboard/student/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-border hover:bg-brand-canvas text-brand-navy text-xs font-bold transition-all shadow-2xs"
              >
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/internships"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all"
              >
                <span>Browse All Roles</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
              </Link>
            </div>
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
                    {currentUser?.completionRate || 85}% Complete
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">
                  Keep your academic background and CV updated.
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed mb-3">
                  Employers evaluate your verified Ethiopian university credentials and department attachment requirements.
                </p>

                <div className="w-full h-2 rounded-full bg-white overflow-hidden shadow-inner mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-navy"
                    style={{ width: `${currentUser?.completionRate || 85}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-sky/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-navy">
                  Field: {currentUser?.fieldOfStudy || 'Not set'}
                </span>
                <Link
                  href="/dashboard/student/profile"
                  className="text-xs font-bold text-brand-navy hover:text-brand-sky hover:underline"
                >
                  Update Profile →
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
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">Applied / Outreached</span>
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
                <span className="text-[10px] text-brand-sky font-bold mt-1.5">Scheduled</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-brand-canvas flex items-center justify-center text-brand-navy mb-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-600">{offersCount}</span>
                  <span className="text-xs font-bold text-brand-muted block mt-0.5">Offers</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1.5">Confirmed</span>
              </div>
            </div>

          </div>

          {/* Department-Filtered Companies & Opportunities Section */}
          <div className="space-y-4">
            
            {/* Section Header with Department Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-brand-border shadow-soft">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading font-extrabold text-lg sm:text-xl text-brand-navy">
                    Matching Employers & Opportunities
                  </h2>
                  <span className="text-xs font-bold text-brand-sky bg-brand-tint px-2.5 py-0.5 rounded-full border border-brand-sky/30">
                    {matchedCompanies.length} Verified Employers
                  </span>
                </div>
                <p className="text-xs text-brand-muted mt-0.5">
                  Filtered for <strong className="text-brand-navy">{activeDepartment}</strong> students. Click <em>&quot;Send Internship Request&quot;</em> to apply directly via official email.
                </p>
              </div>

              {/* Department Dropdown Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                <span className="text-xs font-bold text-brand-muted shrink-0">Field:</span>
                <select
                  value={activeDepartment}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none focus:border-brand-sky shadow-2xs cursor-pointer max-w-[220px] truncate"
                >
                  <option value={studentDepartment}>My Field ({studentDepartment})</option>
                  {ETHIOPIAN_DEPARTMENTS.filter((d) => d !== 'Other' && d !== studentDepartment).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-brand-border pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('companies')}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'companies'
                    ? 'bg-brand-navy text-white shadow-card'
                    : 'bg-white text-brand-muted hover:text-brand-navy border border-brand-border shadow-2xs'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-brand-sky" />
                <span>Verified Organizations ({matchedCompanies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('positions')}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'positions'
                    ? 'bg-brand-navy text-white shadow-card'
                    : 'bg-white text-brand-muted hover:text-brand-navy border border-brand-border shadow-2xs'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-brand-sky" />
                <span>Published Internships ({displayInternships.length})</span>
              </button>
            </div>

            {/* TAB 1: Matched Verified Organizations with Direct Email Action */}
            {activeTab === 'companies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {matchedCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white rounded-3xl p-5 border border-brand-border hover:border-brand-sky/50 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Company Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-brand-tint border border-brand-sky/20 flex items-center justify-center text-brand-navy font-black text-base shadow-2xs group-hover:bg-brand-sky group-hover:text-brand-navy transition-colors">
                            {comp.logo}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-heading font-extrabold text-sm text-brand-navy truncate group-hover:text-brand-sky transition-colors">
                              {comp.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-brand-sky truncate">{comp.industry}</p>
                          </div>
                        </div>

                        {comp.verified && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      {/* Department Matching Pill & Intake Status */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-navy bg-brand-tint/60 px-2.5 py-1 rounded-xl border border-brand-sky/20">
                          <Sparkles className="w-3 h-3 text-brand-sky" />
                          <span>Accepts {activeDepartment}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Intake Open</span>
                        </span>
                      </div>

                      {/* Official Contact Email */}
                      {comp.contactEmail && (
                        <div className="mb-3 p-2.5 rounded-xl bg-brand-canvas border border-brand-border/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0 text-brand-muted">
                            <Mail className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                            <span className="truncate font-semibold text-brand-navy text-[11px]">{comp.contactEmail}</span>
                          </div>
                          <span className="text-[9.5px] uppercase font-bold text-brand-muted bg-white px-1.5 py-0.5 rounded border border-brand-border shrink-0">
                            HR Email
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">
                        {comp.about}
                      </p>
                    </div>

                    {/* Bottom Actions: Send Email Request + Profile Link */}
                    <div className="pt-3 border-t border-brand-border/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompanyForEmail(comp);
                          setIsEmailModalOpen(true);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-full bg-gradient-to-r from-brand-sky to-brand-navy hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold shadow-subtle hover:shadow-glow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Internship Request</span>
                      </button>

                      <Link
                        href={`/companies/${comp.id}`}
                        className="p-2.5 rounded-full bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold transition-colors"
                        title="View Organization Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Published Open Positions in Database */}
            {activeTab === 'positions' && (
              <div>
                {displayInternships.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-brand-border rounded-3xl bg-white shadow-soft">
                    <Briefcase className="w-8 h-8 text-brand-sky mx-auto mb-2" />
                    <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
                      No published cohort openings for {activeDepartment} currently
                    </h3>
                    <p className="text-xs text-brand-muted max-w-md mx-auto mb-4">
                      However, you can directly send your university internship request to the verified organizations above via official HR email!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('companies')}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold shadow-soft"
                    >
                      <span>View Verified Employers for {activeDepartment}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {displayInternships.map((item) => {
                      const saved = isSaved(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl p-5 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-bold text-base">
                                  {item.company.logo}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-brand-navy truncate">{item.company.name}</h4>
                                  <span className="text-[10px] text-brand-muted">{item.type}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleSaveInternship(item.id)}
                                className={`p-1.5 rounded-xl transition-colors ${
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

                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-tint text-brand-navy text-[11px] font-bold mb-2.5">
                              <Sparkles className="w-3 h-3 text-brand-sky" />
                              <span>{item.department || activeDepartment}</span>
                            </div>

                            <div className="text-xs font-bold text-emerald-600 mb-3">
                              {item.stipend || 'Stipend Disclosed upon Selection'}
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
                              <span>Details & Apply</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Active Application Status Tracker Snippet */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Active Application Status
                </h3>
                <p className="text-xs text-brand-muted">
                  Real-time timeline tracking your direct company inquiries and recruiter interactions
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
                <p className="text-xs text-brand-muted mb-2.5">You haven&apos;t submitted any internship requests yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('companies')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
                >
                  <span>Select an Employer Above to Apply</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                </button>
              </div>
            ) : (
              applications.slice(0, 3).map((app) => (
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
                          {app.internship.company.name} · Submitted {app.submittedAt || 'Today'}
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
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
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

      {/* Direct Email Application Modal */}
      <EmailApplicationModal
        company={selectedCompanyForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        student={currentUser}
      />
    </div>
  );
}
