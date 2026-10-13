'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase, ShieldCheck, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/types';

export default function CompanyDiscovery() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCompanies() {
      try {
        const { data } = await supabase
          .from('company_profiles')
          .select('id, company_name, logo_url, industry, location, description, website')
          .limit(6);

        if (data && isMounted) {
          const mapped: Company[] = data.map((cp: any) => ({
            id: cp.id,
            name: cp.company_name,
            logo: cp.logo_url || cp.company_name.slice(0, 2).toUpperCase(),
            industry: cp.industry || 'Technology',
            location: cp.location || 'Addis Ababa, Ethiopia',
            website: cp.website || '',
            size: cp.company_size || '10-50 employees',
            about: cp.description || 'Verified hiring partner offering mentorship-driven student internships.',
            mission: cp.mission || 'Fostering the next generation of engineers.',
            culture: ['Innovation', 'Collaboration', 'Impact'],
            benefits: ['Mentorship', 'Competitive Stipend'],
            openPositionsCount: 1,
            verified: true,
          }));
          setCompanies(mapped);
        }
      } catch (err) {
        console.error('Error fetching companies for discovery:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative py-12 sm:py-14 bg-white border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Featured Employers
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
            Don&apos;t Just Find an Internship.{' '}
            <span className="text-brand-sky">Find Your Company.</span>
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            Connect with teams committed to student mentorship, technical excellence, and early career acceleration.
          </p>
        </div>

        {/* Company Cards Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-10 bg-brand-canvas rounded-3xl border border-dashed border-brand-border p-6 max-w-xl mx-auto">
            <Building className="w-10 h-10 text-brand-sky mx-auto mb-2.5" />
            <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
              Hiring Partners Joining Daily
            </h3>
            <p className="text-xs text-brand-muted mb-3.5">
              Be among the forward-thinking companies connecting directly with university talent cohorts.
            </p>
            <Link
              href="/register?role=company"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
            >
              <span>Register Your Organization</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {companies.map((comp) => (
              <div
                key={comp.id}
                className="bg-brand-canvas hover:bg-white rounded-3xl p-5 sm:p-6 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-brand-tint border border-brand-border flex items-center justify-center text-brand-navy font-black text-xl shadow-2xs transition-colors">
                      {comp.logo}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-brand-navy group-hover:text-brand-sky transition-colors mb-0.5">
                    {comp.name}
                  </h3>

                  <p className="text-xs font-semibold text-brand-sky mb-2">{comp.industry}</p>

                  <p className="text-xs sm:text-sm text-brand-muted line-clamp-2 leading-relaxed mb-3.5">
                    &ldquo;{comp.about}&rdquo;
                  </p>

                  <div className="flex items-center gap-3.5 text-xs text-brand-muted font-medium mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                      {comp.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-brand-navy">
                      <Briefcase className="w-3.5 h-3.5 text-brand-sky" />
                      {comp.openPositionsCount} Open Roles
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-brand-border/60">
                  <Link
                    href={`/companies/${comp.id}`}
                    className="w-full py-2 px-3.5 rounded-xl bg-white group-hover:bg-brand-navy text-brand-navy group-hover:text-white border border-brand-border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Explore Company & Culture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
