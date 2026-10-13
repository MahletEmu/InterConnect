'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ForCompaniesSection from '@/components/landing/ForCompaniesSection';
import TrustSection from '@/components/landing/TrustSection';
import { ArrowRight, Building2, Users, Target, ShieldCheck, Zap } from 'lucide-react';

export default function CompaniesPage() {
  const benefits = [
    {
      title: 'Pre-Screened Technical Talent',
      desc: 'Evaluate candidates by real GitHub repositories, verified skill assessments, and faculty recommendations rather than buzzword resumes.',
      icon: ShieldCheck,
    },
    {
      title: '70% Faster Recruitment Velocity',
      desc: 'Move candidates from discovery to first pairing interview in under 48 hours with automated smart matching.',
      icon: Zap,
    },
    {
      title: 'Zero Recruiting Agency Fees',
      desc: 'Transparent software subscription tiers without extortionate percentage placement fees for student interns.',
      icon: Target,
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      <section className="py-10 sm:py-14 bg-gradient-to-b from-brand-navy to-brand-navyDark text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navyLight border border-brand-sky/30 text-xs font-extrabold uppercase tracking-widest text-brand-sky mb-4">
            <Building2 className="w-3.5 h-3.5" />
            University & Tech Recruitment Platform
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-white tracking-tight leading-[1.2] mb-3.5">
            The Modern Way to Hire Your Next Engineering Cohort.
          </h1>
          <p className="text-sm sm:text-base text-brand-tint/80 leading-relaxed mb-6">
            Access thousands of verified university students and recent graduates from top computing and design departments. Eliminate sourcing fatigue with intelligent compatibility matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register?role=company"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-brand-sky hover:bg-brand-skyLight shadow-glow transition-all"
            >
              <span>Publish Your First Internship</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/company"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-white border border-brand-navyLight hover:bg-brand-navyLight transition-all"
            >
              <span>Explore ATS Demo Portal</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-white border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-brand-canvas border border-brand-border/80">
                  <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ForCompaniesSection />
      <TrustSection />

      <Footer />
    </main>
  );
}
