'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, DollarSign, Bookmark, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { useInterConnect } from '@/lib/context/InterConnectContext';

export default function InternshipDiscovery() {
  const { internships, isSaved, toggleSaveInternship } = useInterConnect();
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('All');

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesWorkType =
      workTypeFilter === 'All' ? true : internship.type.toLowerCase() === workTypeFilter.toLowerCase();

    return matchesSearch && matchesWorkType;
  });

  return (
    <section className="relative py-12 sm:py-14 bg-brand-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Marketplace Preview
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
            Find Where You Belong.
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            Explore verified opportunities at startups and industry leaders shaping tomorrow.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white p-2 rounded-full shadow-soft border border-brand-border flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-3 px-3.5 py-1.5 w-full sm:flex-1">
              <Search className="w-4 h-4 text-brand-muted shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search internships, companies, skills (e.g. React, Python)..."
                className="w-full text-xs sm:text-sm text-brand-text bg-transparent placeholder:text-brand-muted focus:outline-none"
              />
            </div>

            {/* Quick Work Type Filter Pills */}
            <div className="flex items-center gap-1.5 px-2 pb-1 sm:pb-0 w-full sm:w-auto justify-center">
              {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => (
                <button
                  key={type}
                  onClick={() => setWorkTypeFilter(type)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                    workTypeFilter === type
                      ? 'bg-brand-navy text-white shadow-2xs'
                      : 'bg-brand-canvas text-brand-muted hover:text-brand-navy'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Internship Cards Grid */}
        {filteredInternships.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-brand-border p-6 max-w-xl mx-auto shadow-soft">
            <p className="text-sm font-bold text-brand-navy mb-1">
              {searchTerm ? 'No matching opportunities found' : 'No published internships yet'}
            </p>
            <p className="text-xs text-brand-muted">
              {searchTerm
                ? 'Try adjusting your search criteria or clearing filters to see open roles.'
                : 'Check back soon as verified employer partners publish new internship cohorts.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInternships.slice(0, 6).map((item) => {
            const saved = isSaved(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Company info & Bookmark */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-brand-canvas border border-brand-border/60 flex items-center justify-center text-brand-navy font-black text-lg shadow-2xs">
                        {item.company.logo}
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-brand-navy group-hover:text-brand-sky transition-colors">
                          {item.company.name}
                        </h4>
                        <span className="text-[11px] text-brand-muted">{item.company.industry}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveInternship(item.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        saved
                          ? 'bg-brand-tint text-brand-sky'
                          : 'bg-brand-canvas text-brand-muted hover:text-brand-navy'
                      }`}
                      aria-label="Save Internship"
                    >
                      <Bookmark className={`w-4 h-4 ${saved ? 'fill-brand-sky' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Match Score Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/internships/${item.id}`} className="block">
                      <h3 className="font-heading font-extrabold text-base text-brand-navy group-hover:text-brand-sky transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </Link>
                  </div>

                  {/* Match score bar */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-tint text-brand-navy text-[11px] font-bold mb-3">
                    <Sparkles className="w-3 h-3 text-brand-sky" />
                    <span>{item.matchScore}% Match Score</span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-brand-muted mb-3 font-medium">
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

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.requiredSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-canvas text-brand-text border border-brand-border/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {item.requiredSkills.length > 3 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-tint text-brand-navy">
                        +{item.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-brand-muted">
                    Posted {item.postedDate}
                  </span>
                  <Link
                    href={`/internships/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-sky hover:text-brand-navy transition-colors"
                  >
                    <span>View Opening</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* View All Marketplace CTA */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-card hover:shadow-glow transition-all"
          >
            <span>Explore All Open Internships</span>
            <ArrowRight className="w-4 h-4 text-brand-sky" />
          </Link>
        </div>

      </div>
    </section>
  );
}
