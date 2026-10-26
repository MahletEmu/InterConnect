'use client';

import React from 'react';
import { UserCheck, Compass, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Build Your Student Profile',
      desc: 'Select your Ethiopian university and department, list your verified technical or business skills, and showcase your capstone projects.',
      detail: 'Free student registration in under 3 minutes.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Discover Verified Internships',
      desc: 'Explore active internships matched to your field of study, preferred location (Addis Ababa, regional hubs, remote), and career goals.',
      detail: 'Clear qualifications, duties, and stipend details.',
      icon: Compass,
    },
    {
      num: '03',
      title: 'Apply Directly & Transparently',
      desc: 'Submit your profile and tailored application directly to employers with zero application black holes or hidden paywalls.',
      detail: 'Instant application tracking on your dashboard.',
      icon: Send,
    },
    {
      num: '04',
      title: 'Connect & Secure Placement',
      desc: 'Receive direct updates, schedule interview calls with company mentors, and accept internship offers to kickstart your career.',
      detail: 'Real-time status updates from verified teams.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-12 sm:py-14 bg-white border-b border-brand-border/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Simple 4-Step Process
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4xl text-brand-navy mt-2.5 mb-2 tracking-tight">
            How InterConnect Works
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            A transparent, student-centered pathway from Ethiopian university classrooms to verified internships.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-brand-tint via-brand-sky/30 to-brand-tint -z-0 transform -translate-y-12" />

          {steps.map((step) => (
            <div
              key={step.num}
              className="relative bg-brand-canvas hover:bg-white rounded-3xl p-5 sm:p-6 border border-brand-border hover:border-brand-sky/40 transition-all duration-300 shadow-soft hover:shadow-card hover:-translate-y-1.5 z-10 flex flex-col justify-between group"
            >
              <div>
                {/* Step Number Bubble */}
                <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-brand-tint border border-brand-border flex items-center justify-center font-heading font-black text-lg text-brand-navy group-hover:text-brand-sky shadow-subtle mb-4 transition-colors">
                  {step.num}
                </div>

                <h3 className="font-heading font-extrabold text-lg text-brand-navy tracking-tight mb-1.5">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-3">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-brand-border/60">
                <span className="text-[11px] font-semibold text-brand-sky flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA for students */}
        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-brand-navy hover:bg-brand-navyLight shadow-card hover:shadow-glow transition-all"
          >
            <span>Create Your Free Student Profile</span>
            <ArrowRight className="w-4 h-4 text-brand-sky" />
          </Link>
        </div>

      </div>
    </section>
  );
}
