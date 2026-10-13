'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Sparkles, FolderGit2, GraduationCap, Award, Compass } from 'lucide-react';

export default function ForStudentsSection() {
  const features = [
    'Personalized algorithmic recommendations',
    'Streamlined multi-stage applications',
    'Real-time transparent application tracking',
    'Comprehensive portfolio & GitHub integration',
    'Direct pairing interview invitations',
    'Bookmarks & saved opportunities manager',
    'Direct, two-way messaging with engineering leads',
  ];

  return (
    <section className="relative py-12 sm:py-14 bg-white border-b border-brand-border/60 overflow-hidden">
      {/* Decorative background curve */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-tint/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Asymmetric Profile UI Mockup */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md bg-brand-canvas rounded-3xl p-5 sm:p-6 shadow-float border border-brand-border">

              {/* Header Profile Summary */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-brand-border">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-sky shadow-subtle shrink-0">
                  <Image
                    src="/images/hero-student.jpg"
                    alt="Alex Morgan"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-extrabold text-base text-brand-navy truncate">
                      Alex Morgan
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-brand-muted truncate">Computer Science · Junior</p>
                  <p className="text-[11px] font-semibold text-brand-sky flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Addis Ababa Institute of Technology</span>
                  </p>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className="my-3.5 p-3.5 rounded-2xl bg-white border border-brand-border shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-brand-navy flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
                    Profile Strength
                  </span>
                  <span className="text-brand-sky font-extrabold">87% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-brand-canvas overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-navy w-[87%]" />
                </div>
                <p className="text-[10px] text-brand-muted mt-1.5">
                  Add 1 verified GitHub repository to reach 100% and unlock priority company recommendations.
                </p>
              </div>

              {/* Skills Tags */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
                  Verified Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['TypeScript', 'React', 'Python', 'Figma', 'SQL', 'Docker'].map((sk) => (
                    <span
                      key={sk}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-brand-navy border border-brand-border shadow-2xs"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects Snippet */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                  Featured Project
                </span>
                <div className="p-3 rounded-xl bg-white border border-brand-border text-left shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-brand-sky" />
                      CRDT Real-Time Canvas
                    </span>
                    <span className="text-[10px] font-bold text-brand-sky bg-brand-tint px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Multi-user vector whiteboard with WebSockets & sub-15ms sync latency.
                  </p>
                </div>
              </div>

              {/* Floating Pill Tag */}
              <div className="absolute -bottom-3.5 right-4 bg-brand-navy text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-card flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-sky" />
                <span>Open to Internships</span>
              </div>

            </div>
          </div>

          {/* Right: Copy & Feature Bullet Points */}
          <div className="lg:col-span-6 flex flex-col items-start order-1 lg:order-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20 mb-3">
              Student Platform
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy leading-tight tracking-tight mb-3">
              Your First Opportunity Should Open Doors.
            </h2>
            <p className="text-brand-muted text-sm sm:text-base leading-relaxed mb-6">
              Build a profile that shows far more than a static PDF resume. Discover high-growth internships where your technical skills, intellectual curiosity, and ambitions actually fit.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
              {features.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-tint flex items-center justify-center text-brand-sky shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-brand-text">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/register?role=student"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-sky hover:bg-brand-skyHover shadow-subtle hover:shadow-glow transition-all"
              >
                <span>Create Your Student Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-brand-navy hover:bg-brand-canvas transition-colors"
              >
                <span>Explore Student Dashboard</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
