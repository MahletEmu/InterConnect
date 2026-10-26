'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Users, Briefcase, Calendar, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ForCompaniesSection() {
  const companyFeatures = [
    'Publish & syndicate verified internship postings',
    'Algorithmic applicant ranking & match scoring',
    'Granular technical candidate search & filtering',
    'Interactive Kanban applicant tracking system (ATS)',
    '1-click candidate shortlisting & candidate notes',
    'Frictionless interview scheduling with calendar sync',
    'Direct real-time messaging with applicants',
    'Customizable employer brand & culture profile',
  ];

  return (
    <section className="relative py-12 sm:py-14 bg-brand-navy text-white overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-sky/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-tint/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Text & Feature Checklist */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-navyLight px-3 py-1 rounded-full border border-brand-sky/20 mb-3">
              Enterprise & Startup Recruitment
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4xl text-white leading-tight tracking-tight mb-3">
              Meet the Talent Behind Tomorrow.
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
              Find motivated student innovators before they become everyone else&apos;s top candidate. Source from top academic departments with verified coding skills and proven project repositories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
              {companyFeatures.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-navyLight flex items-center justify-center text-brand-sky shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-brand-tint/90">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/register?role=company"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-navy bg-brand-sky hover:bg-brand-skyLight shadow-glow transition-all"
              >
                <span>Post an Internship</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/company"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-white border border-brand-navyLight hover:bg-brand-navyLight transition-colors"
              >
                <span>View ATS Dashboard Preview</span>
              </Link>
            </div>
          </div>

          {/* Right: Employer ATS Dashboard Preview Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-brand-navyDark/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-brand-navyLight shadow-float text-white">

              {/* ATS Header */}
              <div className="flex items-center justify-between pb-4 border-b border-brand-navyLight">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-sky to-brand-tint flex items-center justify-center text-brand-navy font-black text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-white">Nova Systems</h4>
                    <span className="text-[10px] text-brand-tint/70">Recruiter Overview · Active Sprint</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-navyLight text-brand-sky">
                  Live ATS
                </span>
              </div>

              {/* 4 Overview Metric Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                <div className="bg-brand-navy/80 p-2.5 rounded-xl border border-brand-navyLight/60">
                  <span className="text-[10px] text-brand-tint/60 block font-semibold">Active Positions</span>
                  <span className="font-heading font-black text-xl text-white mt-0.5 block">12</span>
                </div>
                <div className="bg-brand-navy/80 p-2.5 rounded-xl border border-brand-navyLight/60">
                  <span className="text-[10px] text-brand-tint/60 block font-semibold">Applications</span>
                  <span className="font-heading font-black text-xl text-brand-sky mt-0.5 block">248</span>
                </div>
                <div className="bg-brand-navy/80 p-2.5 rounded-xl border border-brand-navyLight/60">
                  <span className="text-[10px] text-brand-tint/60 block font-semibold">Shortlisted</span>
                  <span className="font-heading font-black text-xl text-white mt-0.5 block">36</span>
                </div>
                <div className="bg-brand-navy/80 p-2.5 rounded-xl border border-brand-navyLight/60">
                  <span className="text-[10px] text-brand-tint/60 block font-semibold">Interviews</span>
                  <span className="font-heading font-black text-xl text-emerald-400 mt-0.5 block">18</span>
                </div>
              </div>

              {/* Candidate Card Snippet */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-brand-tint/60">
                    Top Matched Applicant
                  </span>
                  <span className="text-[11px] text-brand-sky font-bold">12 mins ago</span>
                </div>

                <div className="bg-brand-navy/90 p-4 rounded-2xl border border-brand-navyLight hover:border-brand-sky/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-brand-sky shrink-0">
                        <Image
                          src="/images/student-2.jpg"
                          alt="Sarah Johnson"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="font-heading font-extrabold text-sm text-white">Sarah Johnson</h5>
                        <p className="text-xs text-brand-tint/70">Computer Science · Junior</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block text-xs font-black bg-brand-sky/20 text-brand-skyLight px-2.5 py-0.5 rounded-full border border-brand-sky/30">
                        93% Match
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['Python', 'React', 'Machine Learning', 'SQL'].map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-navyLight text-brand-tint"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-brand-navyLight/60">
                    <button className="flex-1 py-1.5 rounded-xl bg-brand-navyLight hover:bg-brand-navyLight/80 text-xs font-bold text-white transition-colors">
                      View Profile
                    </button>
                    <button className="flex-1 py-1.5 rounded-xl bg-brand-sky hover:bg-brand-skyHover text-xs font-bold text-brand-navy transition-colors">
                      Shortlist Candidate
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
