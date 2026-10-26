'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Company } from '@/types';
import { fetchDirectoryCompanies } from '@/lib/services/companyService';
import { ETHIOPIAN_CITIES } from '@/lib/data/ethiopia';
import { DIRECTORY_INDUSTRY_OPTIONS } from '@/lib/data/verifiedCompanies';
import {
  Building2,
  Briefcase,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCompanies() {
      setIsLoading(true);
      try {
        const res = await fetchDirectoryCompanies({
          search: searchTerm,
          industry: selectedIndustry,
          city: selectedCity,
        });
        if (isMounted) {
          setCompanies(res.companies);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCompanies();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, selectedIndustry, selectedCity]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('All');
    setSelectedCity('All');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedIndustry !== 'All' || selectedCity !== 'All';

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      {/* Header Banner */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-brand-navy to-brand-navyDark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navyLight border border-brand-sky/30 text-xs font-extrabold uppercase tracking-widest text-brand-sky mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Verified Ethiopian Employers Directory
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-white tracking-tight leading-[1.2] mb-3.5">
            Discover Legitimate Companies in Ethiopia
          </h1>
          <p className="text-sm sm:text-base text-brand-tint/80 leading-relaxed max-w-2xl mx-auto mb-6">
            Research verified organizations, technology enterprises, financial institutions, and public agencies across Ethiopia.
          </p>

          {/* Quick action for students */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-brand-sky hover:bg-brand-skyLight shadow-glow transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Open Internships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white border border-brand-navyLight hover:bg-brand-navyLight transition-all"
            >
              <span>Create Free Student Profile</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Directory Search & Filters */}
      <section className="py-8 sm:py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-border shadow-soft mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
              {/* Search Box */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company name, keywords, or department..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:border-brand-sky"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Industry Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-navy focus:outline-none focus:border-brand-sky"
                >
                  <option value="All">All Industries</option>
                  {DIRECTORY_INDUSTRY_OPTIONS.filter((i) => i !== 'All').map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-navy focus:outline-none focus:border-brand-sky"
                >
                  <option value="All">All Cities in Ethiopia</option>
                  {ETHIOPIAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Summary & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border/60 text-xs text-brand-muted font-medium">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-sky" />
                <span>
                  Showing <strong className="text-brand-navy font-bold">{companies.length}</strong> verified organization{companies.length === 1 ? '' : 's'}
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-brand-sky hover:text-brand-navy underline transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-brand-sky border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-brand-muted">Loading verified organizations...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-brand-border p-8 max-w-md mx-auto">
              <Building2 className="w-10 h-10 text-brand-muted mx-auto mb-3" />
              <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
                No matching organizations found
              </h3>
              <p className="text-xs text-brand-muted mb-4">
                Try adjusting your search keywords, industry selection, or city filter.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight transition-all"
              >
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-3xl p-6 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-canvas group-hover:bg-brand-tint border border-brand-border flex items-center justify-center text-brand-navy font-black text-xl shadow-2xs transition-colors">
                        {comp.logo}
                      </div>
                      {comp.verified ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified Presence</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <span>Pending Verification</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-heading font-extrabold text-lg text-brand-navy group-hover:text-brand-sky transition-colors mb-1">
                      {comp.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-sky mb-2">{comp.industry}</p>
                    <p className="text-xs sm:text-sm text-brand-muted line-clamp-2 leading-relaxed mb-4">
                      &ldquo;{comp.about}&rdquo;
                    </p>

                    {/* Location & Status */}
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center gap-1.5 text-brand-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span className="truncate">{comp.location}</span>
                      </div>

                      {/* Clear Distinction: Active Internship vs Company Profile */}
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            comp.openPositionsCount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-brand-canvas text-brand-muted border border-brand-border'
                          }`}
                        >
                          <Briefcase className="w-3 h-3 text-brand-sky" />
                          <span>
                            {comp.openPositionsCount > 0
                              ? `${comp.openPositionsCount} Active Internship${comp.openPositionsCount === 1 ? '' : 's'}`
                              : '0 Active Internships on Platform'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Internship fields tags */}
                    {comp.internshipFields && comp.internshipFields.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
                          Relevant Departments:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {comp.internshipFields.slice(0, 3).map((field) => (
                            <span
                              key={field}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-canvas text-brand-navy border border-brand-border/80"
                            >
                              {field}
                            </span>
                          ))}
                          {comp.internshipFields.length > 3 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-canvas text-brand-muted">
                              +{comp.internshipFields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-brand-border/60 flex items-center gap-2">
                    <Link
                      href={`/companies/${comp.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                    </Link>
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        title="Official Website"
                        className="p-2.5 rounded-xl bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy transition-all"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-sky" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
