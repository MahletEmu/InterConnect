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
    { name: 'TechNova', symbol: '▲', industry: 'Applied AI' },
    { name: 'Nova Systems', symbol: '⚡', industry: 'Cloud Infrastructure' },
    { name: 'Vertex Labs', symbol: '◈', industry: 'HCI & UX Design' },
    { name: 'BluePeak', symbol: '◆', industry: 'Fintech Payments' },
    { name: 'Nexora', symbol: '✦', industry: 'Renewable CleanTech' },
    { name: 'CloudWorks', symbol: '☁', industry: 'DevOps & SRE' },
  ];

  return (
    <section className="relative py-10 sm:py-12 bg-white border-y border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Company Logos Grid */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest font-extrabold text-brand-muted mb-4">
            Trusted by ambitious teams and future professionals worldwide
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
              <div className="w-11 h-11 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-2 shadow-subtle">
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
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    {stats.studentsCount === 1 ? 'Active Student Innovator' : 'Active Students & Grads'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Growing
                  </span>
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    Growing our community
                  </span>
                </>
              )}
            </div>

            {/* 2. Forward-Thinking Companies */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Building className="w-6 h-6" />
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
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    {stats.companiesCount === 1 ? 'Forward-Thinking Employer' : 'Forward-Thinking Companies'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Growing
                  </span>
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    Growing our community
                  </span>
                </>
              )}
            </div>

            {/* 3. Curated Internships */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Briefcase className="w-6 h-6" />
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
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    {stats.internshipsCount === 1 ? 'Curated Opportunity' : 'Curated Internships'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
                    Growing
                  </span>
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    Growing our community
                  </span>
                </>
              )}
            </div>

            {/* 4. Honest Platform Metric (Replacing fabricated satisfaction percentage) */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3 shadow-subtle">
                <Sparkles className="w-6 h-6 text-brand-sky" />
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
                    <span>Active Cohort</span>
                  </div>
                  <span className="text-sm font-semibold text-brand-muted mt-1">
                    Growing our community
                  </span>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
