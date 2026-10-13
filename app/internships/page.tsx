'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useInterConnect } from '@/lib/context/InterConnectContext';
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
  ChevronDown,
} from 'lucide-react';

export default function InternshipsPage() {
  const { internships, isSaved, toggleSaveInternship } = useInterConnect();

  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'newest'>('match');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allSkills = ['TypeScript', 'React', 'Python', 'SQL', 'Figma', 'Docker', 'Machine Learning'];
  const allTypes = ['Remote', 'Hybrid', 'On-site'];
  const allIndustries = [
    'Enterprise Software & Cloud',
    'Design & Human-Computer Interaction',
    'Artificial Intelligence & Robotics',
    'Fintech & Modern Banking',
    'CleanTech & Renewable Energy Systems',
  ];

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t]));
  };

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) => (prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]));
  };

  const toggleSkill = (sk: string) => {
    setSelectedSkills((prev) => (prev.includes(sk) ? prev.filter((i) => i !== sk) : [...prev, sk]));
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedTypes([]);
    setSelectedIndustries([]);
    setSelectedSkills([]);
  };

  const activeFilterCount =
    (keyword ? 1 : 0) + selectedTypes.length + selectedIndustries.length + selectedSkills.length;

  // Filter logic
  const filtered = internships
    .filter((intern) => {
      // Keyword
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const matchesTitle = intern.title.toLowerCase().includes(q);
        const matchesComp = intern.company.name.toLowerCase().includes(q);
        const matchesSkill = intern.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesSkill) return false;
      }

      // Type
      if (selectedTypes.length > 0 && !selectedTypes.includes(intern.type)) {
        return false;
      }

      // Industry
      if (selectedIndustries.length > 0 && !selectedIndustries.includes(intern.industry)) {
        return false;
      }

      // Skills
      if (
        selectedSkills.length > 0 &&
        !selectedSkills.some((s) => intern.requiredSkills.includes(s))
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
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
              Verified Marketplace
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
              Discover Open Internships
            </h1>
            <p className="text-brand-muted text-sm sm:text-base">
              Find positions actively hiring with verified compensation, structured mentorship, and transparent tracking.
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
                placeholder="Search by role, company, or skill (e.g. React, Python, Cloud)..."
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
                  onChange={(e) => setSortBy(e.target.value as 'match' | 'newest')}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-brand-navy focus:outline-none"
                >
                  <option value="match">Highest Match Score</option>
                  <option value="newest">Most Recent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
              <span className="text-xs font-bold text-brand-muted">Active Filters:</span>

              {selectedTypes.map((t) => (
                <span
                  key={t}
                  onClick={() => toggleType(t)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy text-white text-xs font-bold cursor-pointer hover:bg-brand-navyLight"
                >
                  <span>{t}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}

              {selectedSkills.map((s) => (
                <span
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sky text-brand-navy text-xs font-bold cursor-pointer hover:bg-brand-skyHover"
                >
                  <span>{s}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}

              {selectedIndustries.map((ind) => (
                <span
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint text-brand-navy border border-brand-sky/30 text-xs font-bold cursor-pointer"
                >
                  <span className="truncate max-w-[150px]">{ind}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}

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
            <div className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-brand-border shadow-soft sticky top-20">
              <div className="flex items-center justify-between pb-3.5 border-b border-brand-border mb-4">
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

              {/* Work Type Filter */}
              <div className="mb-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2.5">
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

              {/* Skills Filter */}
              <div className="mb-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2.5">
                  Required Skills
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

              {/* Industry Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2.5">
                  Industry Focus
                </h4>
                <div className="space-y-1.5">
                  {allIndustries.map((ind) => (
                    <label key={ind} className="flex items-center gap-2 text-xs font-semibold text-brand-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(ind)}
                        onChange={() => toggleIndustry(ind)}
                        className="rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                      />
                      <span className="truncate">{ind}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Cards List (Col 4-12) */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-brand-navy">
                  Showing <span className="text-brand-sky">{filtered.length}</span> verified internships
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border text-center shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-brand-tint flex items-center justify-center text-brand-sky mx-auto mb-3">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-brand-navy mb-1.5">
                    No matching internships found
                  </h3>
                  <p className="text-sm text-brand-muted max-w-md mx-auto mb-5">
                    Try adjusting your search terms, removing filters, or clearing the work type selection.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filtered.map((item) => {
                    const saved = isSaved(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-5 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
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

                          {/* Match score bar */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-tint text-brand-navy text-xs font-bold mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
                            <span>{item.matchScore}% Match Score</span>
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-brand-muted mb-3 font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                              <span className="truncate">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Clock className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                              <span className="truncate">{item.duration.split('(')[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate col-span-2 text-brand-navy font-bold">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{item.stipend}</span>
                            </div>
                          </div>

                          {/* Skills */}
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
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-brand-muted">
                            {item.applicantsCount} applicants
                          </span>
                          <Link
                            href={`/internships/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight px-3.5 py-1.5 rounded-full transition-all shadow-subtle"
                          >
                            <span>View & Apply</span>
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
              {/* Work Arrangement */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-2.5">
                  Work Arrangement
                </h4>
                <div className="space-y-2.5">
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

              {/* Required Skills */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-3">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
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

              {/* Industry Focus */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-muted mb-3">
                  Industry Focus
                </h4>
                <div className="space-y-2.5">
                  {allIndustries.map((ind) => (
                    <label key={ind} className="flex items-center gap-2.5 text-xs font-semibold text-brand-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(ind)}
                        onChange={() => toggleIndustry(ind)}
                        className="rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                      />
                      <span className="truncate">{ind}</span>
                    </label>
                  ))}
                </div>
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
