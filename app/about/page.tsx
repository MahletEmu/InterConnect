'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Sparkles, Users, Target, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      <section className="py-10 sm:py-14 bg-gradient-to-b from-brand-tint/60 via-brand-canvas to-brand-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint border border-brand-sky/30 text-xs font-extrabold uppercase tracking-widest text-brand-navy mb-4">
            <Sparkles className="w-4 h-4 text-brand-sky" />
            Our Mission & Story
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy tracking-tight leading-[1.2] mb-3.5">
            Bridging Ambitious Talent With High-Growth Opportunities.
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            InterConnect was founded on a simple conviction: the transition from university classroom to impactful technology career shouldn&apos;t depend on family nepotism, opaque algorithms, or luck.
          </p>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-10 sm:py-12 bg-white border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-brand-canvas border border-brand-border/80">
              <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-1.5">
                Skills Over Pedigree
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                We believe what you can build matters far more than arbitrary resume keywords. Our platform spotlights verified technical repositories and practical capstone projects.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-brand-canvas border border-brand-border/80">
              <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-1.5">
                Radical Transparency
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                No candidate should ever submit their hard work into a silent void. Every applicant receives clear stage updates and direct feedback channels.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-brand-canvas border border-brand-border/80">
              <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-1.5">
                Human Mentorship
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                Great internships are built on mentorship. We curate employer partners who commit to genuine one-on-one professional guidance and meaningful responsibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy & Terms Section */}
      <section id="privacy" className="py-10 sm:py-12 bg-brand-canvas scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-brand-border shadow-soft space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Trust & Data Governance
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
              Privacy Policy & Security Standards
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              At InterConnect, protecting candidate confidentiality and proprietary corporate listings is paramount. All resume documents and private portfolio assets are stored in isolated, access-restricted Supabase storage buckets protected by database Row Level Security (RLS). We never sell your personal information or academic records to third-party data brokers.
            </p>
          </div>

          <div id="terms" className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-brand-border shadow-soft space-y-3 scroll-mt-20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Platform Rules
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
              Terms of Service & Verified Employer Charter
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              InterConnect mandates that all published internships provide genuine compensation, mentorship oversight, and accurate technical descriptions. Students maintain complete ownership of their intellectual property, capstone repositories, and submitted application materials.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
