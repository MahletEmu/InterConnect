'use client';

import React, { useState } from 'react';
import { User, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'student' | 'company'>('student');

  const studentSteps = [
    {
      num: '01',
      title: 'Create Your Profile',
      desc: 'Build your comprehensive professional identity highlighting verified skills, GitHub projects, university achievements, and career passions.',
      detail: '87% average profile completion takes under 5 minutes.',
    },
    {
      num: '02',
      title: 'Discover Opportunities',
      desc: 'Explore curated internships intelligently matched to your verified tech stack, academic concentration, and preferred remote/on-site location.',
      detail: 'Live match scores with transparent score reasons.',
    },
    {
      num: '03',
      title: 'Apply Seamlessly',
      desc: 'Submit your tailored application in seconds using our streamlined multi-stage flow with instant application status tracking.',
      detail: 'Direct transmission to hiring managers, zero black holes.',
    },
    {
      num: '04',
      title: 'Get Connected & Hired',
      desc: 'Communicate directly with company tech leads, schedule live pairing interviews with one click, and receive offers.',
      detail: 'Built-in chat, calendar scheduler, and offer notifications.',
    },
  ];

  const companySteps = [
    {
      num: '01',
      title: 'Create Company Profile',
      desc: 'Showcase your team culture, engineering stack, tech leadership, and growth opportunities to attract ambitious student innovators.',
      detail: 'Verified employer badge and customized culture page.',
    },
    {
      num: '02',
      title: 'Publish Internship Openings',
      desc: 'Specify required skills, hybrid/remote requirements, stipend tiers, and capstone project expectations with clarity.',
      detail: 'Automated skill tag extraction and smart match indexing.',
    },
    {
      num: '03',
      title: 'Discover & Shortlist Candidates',
      desc: 'Access verified student portfolios, filter by verified technical capabilities, and review candidate match scores instantly.',
      detail: 'Kanban ATS pipeline with one-click status transitions.',
    },
    {
      num: '04',
      title: 'Hire Future Leaders',
      desc: 'Send interview calendar invitations, chat directly with promising students, and convert top interns into future full-time engineers.',
      detail: 'Direct calendar integration and offer workflows.',
    },
  ];

  const steps = activeTab === 'student' ? studentSteps : companySteps;

  return (
    <section id="how-it-works" className="relative py-12 sm:py-14 bg-white border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Simple 4-Step Process
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
            How InterConnect Works
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            A frictionless, transparent path from first connection to signed offer letter.
          </p>

          {/* Interactive Toggle */}
          <div className="inline-flex p-1 rounded-full bg-brand-canvas border border-brand-border mt-5 shadow-inner">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === 'student'
                  ? 'bg-brand-navy text-white shadow-card'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>I&apos;m a Student</span>
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === 'company'
                  ? 'bg-brand-navy text-white shadow-card'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>I&apos;m a Company</span>
            </button>
          </div>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative mt-8">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-brand-tint via-brand-sky/30 to-brand-tint -z-0 transform -translate-y-12" />

          {steps.map((step, idx) => (
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

        {/* Bottom CTA for the selected role */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href={activeTab === 'student' ? '/register?role=student' : '/register?role=company'}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-brand-sky hover:bg-brand-skyHover shadow-subtle hover:shadow-glow transition-all"
          >
            <span>{activeTab === 'student' ? 'Start Your Student Profile' : 'Post an Internship Opening'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
