'use client';

import React, { useEffect, useState } from 'react';
import { Users, Building, Briefcase, Sparkles } from 'lucide-react';
import { getPlatformPublicStats, PlatformPublicStats } from '@/lib/services/statsService';

export default function TrustSection() {
  const [stats, setStats] = useState<PlatformPublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const res = await getPlatformPublicStats();
        if (isMounted) {
          if (res.success) {
            setStats(res.data);
          } else {
            setStats(null);
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setStats(null);
          setIsLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const logos = [
    { name: 'Ethio Telecom', symbol: 'ET', industry: 'Telecommunications & ICT' },
    { name: 'Ethiopian Airlines', symbol: 'EA', industry: 'Aviation & Engineering' },
    { name: 'Commercial Bank of Ethiopia', symbol: 'CBE', industry: 'Banking & Finance' },
    { name: 'Chapa', symbol: 'CP', industry: 'Fintech & Payments' },
    { name: 'Gebeya', symbol: 'GB', industry: 'EdTech & Software' },
    { name: 'Dashen Bank', symbol: 'DB', industry: 'Banking & Digital Finance' },
  ];

  return (
    <section className="relative py-10 sm:py-12 bg-white border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Company Logos Grid */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest font-extrabold text-brand-muted mb-4">
            Connecting ambitious Ethiopian university talent with verified organizations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-center justify-center">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl hover:bg-brand-canvas transition-all duration-300 border border-transparent hover:border-brand-border cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base text-brand-sky font-bold group-hover:scale-110 transition-transform">
                    {logo.symbol}
                  </span>
                  <span className="font-heading font-extrabold text-sm text-brand-navy tracking-tight group-hover:text-brand-sky transition-colors">
                    {logo.name}
                  </span>
                </div>
                <span className="text-[10px] text-brand-muted mt-0.5">{logo.industry}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Bar - Real Supabase Counts & Honest Community Metrics */}
        <div className="mt-8 pt-8 border-t border-brand-border/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center">

            {/* 1. Active Students & Grads */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Users className="w-5 h-5" />
              </div>
              {isLoading ? (
                <div className="space-y-2 py-1">
                  <div className="w-16 h-8 bg-brand-tint/60 rounded-xl animate-pulse mx-auto" />
                  <div className="w-24 h-4 bg-brand-canvas rounded-lg animate-pulse mx-auto" />
                </div>
              ) : stats && stats.studentsCount > 0 ? (
                <>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                    {stats.studentsCount}
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    {stats.studentsCount === 1 ? 'Student Innovator' : 'Student Innovators'}
                  </span>
                  <span className="text-xs text-brand-muted">Active university talent</span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Active
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    Student Talent
                  </span>
                  <span className="text-xs text-brand-muted">University innovators</span>
                </>
              )}
            </div>

            {/* 2. Forward-Thinking Companies */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Building className="w-5 h-5" />
              </div>
              {isLoading ? (
                <div className="space-y-2 py-1">
                  <div className="w-16 h-8 bg-brand-tint/60 rounded-xl animate-pulse mx-auto" />
                  <div className="w-24 h-4 bg-brand-canvas rounded-lg animate-pulse mx-auto" />
                </div>
              ) : stats && stats.companiesCount > 0 ? (
                <>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                    {stats.companiesCount}
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    {stats.companiesCount === 1 ? 'Hiring Partner' : 'Hiring Partners'}
                  </span>
                  <span className="text-xs text-brand-muted">Verified tech employers</span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Verified
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    Hiring Partners
                  </span>
                  <span className="text-xs text-brand-muted">Forward-thinking teams</span>
                </>
              )}
            </div>

            {/* 3. Curated Internships */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Briefcase className="w-5 h-5" />
              </div>
              {isLoading ? (
                <div className="space-y-2 py-1">
                  <div className="w-16 h-8 bg-brand-tint/60 rounded-xl animate-pulse mx-auto" />
                  <div className="w-24 h-4 bg-brand-canvas rounded-lg animate-pulse mx-auto" />
                </div>
              ) : stats && stats.internshipsCount > 0 ? (
                <>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">
                    {stats.internshipsCount}
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    {stats.internshipsCount === 1 ? 'Curated Opportunity' : 'Curated Internships'}
                  </span>
                  <span className="text-xs text-brand-muted">Published & verified roles</span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Curated
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    Open Positions
                  </span>
                  <span className="text-xs text-brand-muted">High-impact cohorts</span>
                </>
              )}
            </div>

            {/* 4. Matching & Tracking Commitment */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Sparkles className="w-5 h-5 text-brand-sky" />
              </div>
              {isLoading ? (
                <div className="space-y-2 py-1">
                  <div className="w-16 h-8 bg-brand-tint/60 rounded-xl animate-pulse mx-auto" />
                  <div className="w-24 h-4 bg-brand-canvas rounded-lg animate-pulse mx-auto" />
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>100%</span>
                  </div>
                  <span className="text-sm font-bold text-brand-navy mt-1">
                    Status Transparency
                  </span>
                  <span className="text-xs text-brand-muted">Zero applicant black holes</span>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
