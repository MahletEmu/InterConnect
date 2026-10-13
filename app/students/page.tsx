'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ForStudentsSection from '@/components/landing/ForStudentsSection';
import SmartMatchSection from '@/components/landing/SmartMatchSection';
import InternshipDiscovery from '@/components/landing/InternshipDiscovery';
import { ArrowRight, Sparkles, GraduationCap, Code, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function StudentsPage() {
  const perks = [
    {
      title: 'Real Engineering, No Busywork',
      desc: 'All openings on InterConnect must submit verified capstone expectations and production tech stacks.',
      icon: Code,
    },
    {
      title: 'Guaranteed Transparent Tracking',
      desc: 'See exactly who has viewed your application, whether you are shortlisted, and live interview status.',
      icon: ShieldCheck,
    },
    {
      title: 'Verified Skill Badges',
      desc: 'Demonstrate proficiency through GitHub project links, code commits, and academic course records.',
      icon: GraduationCap,
    },
    {
      title: '1-Click Direct Applications',
      desc: 'Store your verified student profile once and apply to multiple top-tier opportunities in seconds.',
      icon: FileText,
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      {/* Hero Header */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-brand-tint/50 via-brand-canvas to-brand-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint border border-brand-sky/30 text-xs font-extrabold uppercase tracking-widest text-brand-navy mb-4">
            <GraduationCap className="w-4 h-4 text-brand-sky" />
            Designed For Ambitious Students
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy tracking-tight leading-[1.2] mb-3.5">
            Launch Your Career Where Your Skills Actually Matter.
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-6">
            Stop sending hundreds of cold resumes into corporate ATS voids. InterConnect connects your verified coding and design skills directly with companies that value early-career talent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register?role=student"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-sky hover:bg-brand-skyHover shadow-subtle hover:shadow-glow transition-all"
            >
              <span>Build Free Student Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-white hover:bg-brand-tint border border-brand-border shadow-2xs transition-all"
            >
              <span>Browse Open Internships</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-10 sm:py-12 bg-white border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {perks.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="p-5 rounded-2xl sm:rounded-3xl bg-brand-canvas border border-brand-border/80">
                  <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy mb-1.5">{p.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ForStudentsSection />
      <SmartMatchSection />
      <InternshipDiscovery />

      <Footer />
    </main>
  );
}
