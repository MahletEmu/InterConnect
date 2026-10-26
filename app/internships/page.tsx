'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { evaluateHonestMatch } from '@/lib/services/matchingService';
import { ETHIOPIAN_DEPARTMENTS, ETHIOPIAN_CITIES, matchesEthiopianCity } from '@/lib/data/ethiopia';
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  SlidersHorizontal,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

type CompensationOption = 'All' | 'Paid' | 'Unpaid' | 'Unspecified';

function classifyCompensation(stipend?: string): 'Paid' | 'Unpaid' | 'Unspecified' {
  if (!stipend) return 'Unspecified';
  const s = stipend.toLowerCase().trim();
  if (s === '' || s === 'unspecified' || s === 'stipend to be disclosed' || s.includes('disclosed')) {
    return 'Unspecified';
  }
  if (s.includes('unpaid') || s.includes('volunteer') || s === 'none' || s === '0') {
    return 'Unpaid';
  }
  if (/\d/.test(s) || s.includes('etb') || s.includes('birr') || s.includes('$')) {
    return 'Paid';
  }
  return 'Unspecified';
}

export default function InternshipsPage() {
  const { internships, isSaved, toggleSaveInternship, currentUser } = useInterConnect();

  const [keyword, setKeyword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [compensation, setCompensation] = useState<CompensationOption>('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'deadline'>('newest');
  const [showClosed, setShowClosed] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allSkills = ['TypeScript', 'React', 'Python', 'SQL', 'Figma', 'Docker', 'Machine Learning', 'Java', 'Git'];
  const allTypes = ['Remote', 'Hybrid', 'On-site'];

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t]));
  };

  const toggleSkill = (sk: string) => {
    setSelectedSkills((prev) => (prev.includes(sk) ? prev.filter((i) => i !== sk) : [...prev, sk]));
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedDepartment('All');
    setSelectedCity('All');
    setSelectedTypes([]);
    setCompensation('All');
    setSelectedSkills([]);
    setShowClosed(false);
  };

  const activeFilterCount =
    (keyword ? 1 : 0) +
    (selectedDepartment !== 'All' ? 1 : 0) +
    (selectedCity !== 'All' ? 1 : 0) +
    selectedTypes.length +
    (compensation !== 'All' ? 1 : 0) +
    selectedSkills.length +
    (showClosed ? 1 : 0);

  // Filter logic
  const filtered = internships
    .filter((intern) => {
      // 1. Expiration & Status Check: By default only show published, non-expired positions
      if (!showClosed) {
        if (intern.isExpired) return false;
        if (intern.status && intern.status !== 'published') return false;
      }

      // 2. Keyword Search: title, company name, skill, department, description, company fields
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchesTitle = intern.title.toLowerCase().includes(q);
        const matchesComp = intern.company.name.toLowerCase().includes(q);
        const matchesSkill = intern.requiredSkills.some((s) => s.toLowerCase().includes(q));
        const matchesDept = intern.department.toLowerCase().includes(q);
        const matchesDesc = intern.description.toLowerCase().includes(q);
        const matchesCompanyField = (intern.company.internshipFields || []).some((f) => f.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesSkill && !matchesDept && !matchesDesc && !matchesCompanyField) {
          return false;
        }
      }

      // 3. Department / Field of Study Filter
      if (selectedDepartment !== 'All') {
        const deptLower = selectedDepartment.toLowerCase().trim();
        const internDeptLower = (intern.department || '').toLowerCase().trim();
        const companyFields = (intern.company.internshipFields || []).map((f) => f.toLowerCase().trim());

        const directMatch =
          internDeptLower === deptLower ||
          internDeptLower.includes(deptLower) ||
          deptLower.includes(internDeptLower) ||
          companyFields.some((f) => f === deptLower || f.includes(deptLower) || deptLower.includes(f));

        // Semantic synonym matches across Ethiopian curricula
        let semanticMatch = false;
        if (deptLower.includes('soft') && (internDeptLower.includes('comp') || internDeptLower.includes('info') || companyFields.some((f) => f.includes('comp') || f.includes('soft')))) semanticMatch = true;
        if (deptLower.includes('comp') && (internDeptLower.includes('soft') || internDeptLower.includes('info') || companyFields.some((f) => f.includes('soft') || f.includes('comp')))) semanticMatch = true;
        if ((deptLower.includes('health') || deptLower.includes('med')) && (internDeptLower.includes('med') || internDeptLower.includes('health') || internDeptLower.includes('nurs') || internDeptLower.includes('pharm'))) semanticMatch = true;
        if (deptLower.includes('civil') && (internDeptLower.includes('construct') || internDeptLower.includes('struct') || companyFields.some((f) => f.includes('civil')))) semanticMatch = true;
        if (deptLower.includes('acc') && (internDeptLower.includes('fin') || internDeptLower.includes('bank') || companyFields.some((f) => f.includes('acc') || f.includes('fin')))) semanticMatch = true;

        if (!directMatch && !semanticMatch) return false;
      }

      // 4. Ethiopian City Filter
      if (selectedCity !== 'All') {
        const isRemoteMatch = selectedCity.includes('Remote') && intern.type === 'Remote';
        const isCityMatch = matchesEthiopianCity(
          { city: intern.company.city, location: intern.location || intern.company.location },
          selectedCity
        );
        if (!isRemoteMatch && !isCityMatch) return false;
      }

      // 5. Work Arrangement (Workplace Type)
      if (selectedTypes.length > 0 && !selectedTypes.includes(intern.type)) {
        return false;
      }

      // 6. Compensation Filter
      if (compensation !== 'All') {
        const compClass = classifyCompensation(intern.stipend);
        if (compClass !== compensation) return false;
      }

      // 7. Skills Filter
      if (selectedSkills.length > 0) {
        const hasSkill = selectedSkills.some((s) =>
          intern.requiredSkills.some((req) => req.toLowerCase().includes(s.toLowerCase()))
        );
        if (!hasSkill) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Prioritize actively open over expired/closed
      if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;

      // Sort criteria
      if (sortBy === 'relevance') {
        const matchA = evaluateHonestMatch(currentUser, a);
        const matchB = evaluateHonestMatch(currentUser, b);
        return (matchB.score || 0) - (matchA.score || 0);
      }
      if (sortBy === 'deadline') {
        if (!a.applicationDeadline) return 1;
        if (!b.applicationDeadline) return -1;
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      }
      // 'newest' default
      return 0;
    });

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      {/* Header Banner */}
      <section className="py-8 sm:py-10 bg-gradient-to-b from-brand-tint/60 via-brand-canvas to-brand-canvas border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
              Verified Marketplace · Ethiopia
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
              Discover Verified Internships
            </h1>
            <p className="text-brand-muted text-sm sm:text-base">
              Find genuine positions open to Ethiopian university students with transparent compensation, verifiable deadlines, and honest profile alignment.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-5 bg-white p-2.5 rounded-2xl sm:rounded-full shadow-soft border border-brand-border flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex items-center gap-3 px-3.5 py-1 w-full sm:flex-1">
              <Search className="w-4 h-4 text-brand-muted shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by role, company, department, or skill (e.g. Python, Accounting, Remote)..."
                className="w-full text-xs sm:text-sm text-brand-text bg-transparent placeholder:text-brand-muted focus:outline-none"
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="p-1 text-brand-muted hover:text-brand-navy">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto px-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="sm:hidden flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-brand-tint text-brand-navy text-xs font-bold w-full"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-sky" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-brand-muted">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none"
                >
                  <option value="newest">Most Recent</option>
                  <option value="relevance">Profile Relevance</option>
                  <option value="deadline">Application Deadline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
              <span className="text-xs font-bold text-brand-muted">Active Filters:</span>

              {selectedDepartment !== 'All' && (
                <span
                  onClick={() => setSelectedDepartment('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy text-white text-xs font-bold cursor-pointer hover:bg-brand-navyLight"
                >
                  <span>Dept: {selectedDepartment}</span>
                  <X className="w-3 h-3" />
                </span>
              )}

              {selectedCity !== 'All' && (
                <span
                  onClick={() => setSelectedCity('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy text-white text-xs font-bold cursor-pointer hover:bg-brand-navyLight"
                >
                  <span>City: {selectedCity}</span>
                  <X className="w-3 h-3" />
                </span>
              )}

              {selectedTypes.map((t) => (
                <span
                  key={t}
                  onClick={() => toggleType(t)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint text-brand-navy border border-brand-sky/30 text-xs font-bold cursor-pointer"
                >
                  <span>{t}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}

              {compensation !== 'All' && (
                <span
                  onClick={() => setCompensation('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sky text-brand-navy text-xs font-bold cursor-pointer"
                >
                  <span>Comp: {compensation}</span>
                  <X className="w-3 h-3" />
                </span>
              )}

              {selectedSkills.map((s) => (
                <span
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-canvas text-brand-navy border border-brand-border text-xs font-bold cursor-pointer"
                >
                  <span>{s}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}

              {showClosed && (
                <span
                  onClick={() => setShowClosed(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  <span>Including Closed</span>
                  <X className="w-3 h-3" />
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-xs font-bold text-brand-sky hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content: Sidebar Filters + Cards */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Desktop Filter Sidebar (Col 1-3) */}
            <div className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-brand-border shadow-soft sticky top-20 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-brand-border">
                <div className="flex items-center gap-2 text-sm font-extrabold text-brand-navy">
                  <SlidersHorizontal className="w-4 h-4 text-brand-sky" />
                  <span>Filter Roles</span>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-bold text-brand-sky hover:underline">
                    Reset
                  </button>
                )}
              </div>

              {/* Department / Field of Study Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Academic Department
                </h4>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none focus:border-brand-sky"
                >
                  <option value="All">All Departments</option>
                  {ETHIOPIAN_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ethiopian City Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Ethiopian City
                </h4>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none focus:border-brand-sky"
                >
                  <option value="All">All Locations / Nationwide</option>
                  {ETHIOPIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Arrangement Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Work Arrangement
                </h4>
                <div className="space-y-1.5">
                  {allTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs font-semibold text-brand-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Compensation Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Compensation
                </h4>
                <select
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value as CompensationOption)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none focus:border-brand-sky"
                >
                  <option value="All">All Compensation Types</option>
                  <option value="Paid">Paid / With Stipend</option>
                  <option value="Unpaid">Unpaid / Attachment</option>
                  <option value="Unspecified">Stipend Unspecified / To Be Disclosed</option>
                </select>
                <span className="text-[10px] text-brand-muted block mt-1">
                  Never assumed paid/unpaid unless explicitly confirmed.
                </span>
              </div>

              {/* Skills Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-brand-navy text-white'
                          : 'bg-brand-canvas text-brand-muted hover:bg-brand-tint border border-brand-border'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Closed Vacancies Toggle */}
              <div className="pt-3 border-t border-brand-border/60">
                <label className="flex items-start gap-2 text-xs font-semibold text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showClosed}
                    onChange={(e) => setShowClosed(e.target.checked)}
                    className="rounded border-brand-border text-brand-sky focus:ring-brand-sky mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-brand-navy block">Include Closed Vacancies</span>
                    <span className="text-[11px] text-brand-muted">Show past roles with closed deadlines</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Cards List (Col 4-12) */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-brand-navy">
                  Showing <span className="text-brand-sky">{filtered.length}</span> {showClosed ? 'total' : 'actively open'} opportunities
                </span>
                {!showClosed && (
                  <span className="text-xs text-brand-muted flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Expired postings filtered out
                  </span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border text-center shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-brand-tint flex items-center justify-center text-brand-sky mx-auto mb-3">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-brand-navy mb-1.5">
                    {activeFilterCount > 0
                      ? 'No internships match your selected filters'
                      : 'No Active Internships Currently Open on InterConnect'}
                  </h3>
                  <p className="text-sm text-brand-muted max-w-md mx-auto mb-5 leading-relaxed">
                    {activeFilterCount > 0
                      ? 'Try clearing specific filters (such as department, city, or work arrangement) to view available listings.'
                      : 'There are currently no active vacancies published directly on the platform. All past opportunities have reached their application deadlines.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {activeFilterCount > 0 ? (
                      <button
                        onClick={clearFilters}
                        className="px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight transition-all"
                      >
                        Reset All Filters
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/companies"
                          className="px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight transition-all shadow-subtle flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5 text-brand-sky" />
                          <span>Explore Verified Employers</span>
                        </Link>
                        <Link
                          href="/dashboard/student/profile"
                          className="px-5 py-2.5 rounded-full bg-white border border-brand-border text-brand-navy text-xs font-bold hover:bg-brand-tint transition-all"
                        >
                          Update Student Profile
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filtered.map((item) => {
                    const saved = isSaved(item.id);
                    const match = evaluateHonestMatch(currentUser, item);
                    const compClassification = classifyCompensation(item.stipend);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl p-5 border shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group ${
                          item.isExpired ? 'border-zinc-200 bg-zinc-50/50 opacity-90' : 'border-brand-border hover:border-brand-sky/40'
                        }`}
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-brand-canvas border border-brand-border/60 flex items-center justify-center text-brand-navy font-black text-lg shadow-2xs">
                                {item.company.logo}
                              </div>
                              <div>
                                <h4 className="font-heading font-extrabold text-xs sm:text-sm text-brand-navy group-hover:text-brand-sky transition-colors">
                                  {item.company.name}
                                </h4>
                                <span className="text-[11px] text-brand-muted">{item.company.industry}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSaveInternship(item.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                saved
                                  ? 'bg-brand-tint text-brand-sky'
                                  : 'bg-brand-canvas text-brand-muted hover:text-brand-navy'
                              }`}
                              aria-label="Save Internship"
                            >
                              <Bookmark className={`w-4 h-4 ${saved ? 'fill-brand-sky' : ''}`} />
                            </button>
                          </div>

                          {/* Title */}
                          <Link href={`/internships/${item.id}`} className="block mb-1.5">
                            <h3 className="font-heading font-extrabold text-base text-brand-navy group-hover:text-brand-sky transition-colors leading-snug line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>

                          {/* Honest Status & Match Evaluation Badges */}
                          <div className="space-y-1.5 mb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.isExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Applications Closed</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Actively Accepting Applications</span>
                                </span>
                              )}

                              {/* Honest Profile Relevance Badge */}
                              {currentUser && match.isEvaluated && match.score !== null && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-tint border border-brand-sky/30 text-brand-navy text-[11px] font-bold">
                                  <Sparkles className="w-3 h-3 text-brand-sky" />
                                  <span>{match.label} ({match.score}%)</span>
                                </span>
                              )}
                            </div>

                            {/* Match explanation fact */}
                            {currentUser && match.reasons.length > 0 && (
                              <p className="text-[11px] text-brand-muted line-clamp-1 font-medium">
                                ✓ {match.reasons[0]}
                              </p>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-brand-muted mb-3 font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                              <span className="truncate">{item.type} {item.location ? `· ${item.location}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Clock className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                              <span className="truncate">{item.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate col-span-2 text-brand-navy font-bold">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {compClassification === 'Paid'
                                  ? item.stipend
                                  : compClassification === 'Unpaid'
                                  ? 'Unpaid Academic Attachment'
                                  : 'Stipend to be disclosed'}
                              </span>
                            </div>
                          </div>

                          {/* Skills */}
                          {item.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {item.requiredSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-canvas text-brand-text border border-brand-border/60"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-brand-muted">
                            {item.department}
                          </span>
                          <Link
                            href={`/internships/${item.id}`}
                            className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                              item.isExpired
                                ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
                                : 'text-white bg-brand-navy hover:bg-brand-navyLight shadow-subtle'
                            }`}
                          >
                            <span>{item.isExpired ? 'View Details (Closed)' : 'View & Apply'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-float border border-brand-border z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-top-4">
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-canvas/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-sky" />
                <h3 className="font-heading font-extrabold text-base text-brand-navy">
                  Filter Opportunities
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-navy"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Academic Department */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Academic Department
                </h4>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  {ETHIOPIAN_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ethiopian City */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Ethiopian City
                </h4>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none"
                >
                  <option value="All">All Locations / Nationwide</option>
                  {ETHIOPIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Arrangement */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2.5">
                  Work Arrangement
                </h4>
                <div className="space-y-2">
                  {allTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Compensation */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2">
                  Compensation
                </h4>
                <select
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value as CompensationOption)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none"
                >
                  <option value="All">All Compensation Types</option>
                  <option value="Paid">Paid / With Stipend</option>
                  <option value="Unpaid">Unpaid / Attachment</option>
                  <option value="Unspecified">Stipend Unspecified / To Be Disclosed</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="pt-3 border-t border-brand-border/60">
                <label className="flex items-start gap-2.5 text-xs font-semibold text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showClosed}
                    onChange={(e) => setShowClosed(e.target.checked)}
                    className="rounded border-brand-border text-brand-sky focus:ring-brand-sky mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-brand-navy block">Include Closed Vacancies</span>
                    <span className="text-[11px] text-brand-muted">Show past roles with closed deadlines</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-brand-border bg-brand-canvas/50 flex items-center justify-between gap-3">
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-brand-sky hover:underline px-2 py-2"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold shadow-soft hover:bg-brand-navyLight"
              >
                Apply ({filtered.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
