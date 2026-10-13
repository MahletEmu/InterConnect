'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Users, Building2, Briefcase } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative py-8 sm:py-12 lg:py-14 overflow-hidden bg-brand-canvas">
      {/* Background Organic Curved Shapes (Inspired by Cakap Reference) */}
      <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-bl from-brand-tint/90 via-brand-tint/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/4 -translate-y-12" />
      <div className="absolute top-48 left-0 w-[450px] h-[450px] bg-brand-sky/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* SVG Connecting Flow Lines Motif */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-50 200C250 150 400 450 750 350C1100 250 1250 500 1500 400"
            stroke="#4DB7D8"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <path
            d="M100 650C350 550 600 700 950 500C1250 350 1350 200 1550 150"
            stroke="#8EDFF0"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-tint border border-brand-sky/30 shadow-subtle mb-4 animate-pulseGlow">
              <span className="w-2 h-2 rounded-full bg-brand-sky animate-ping" />
              <span className="text-xs font-bold text-brand-navy tracking-wide uppercase">
                #1 Platform for Tech & Design Internships
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-5.5xl text-brand-navy leading-[1.12] tracking-tight mb-4">
              Connect Talent.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky via-brand-navy to-brand-sky">
                Build the Future.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-6 max-w-xl font-normal">
              InterConnect brings ambitious students and forward-thinking companies together through meaningful internship opportunities, verified skill matching, and transparent recruitment.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-6">
              <Link
                href="/internships"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-card hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Briefcase className="w-4 h-4 text-brand-sky" />
                <span>Find an Internship</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/companies"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-brand-navy bg-white hover:bg-brand-tint border border-brand-border shadow-soft hover:shadow-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Building2 className="w-4 h-4 text-brand-sky" />
                <span>Find Talent</span>
              </Link>
            </div>

            {/* Social Proof Subtext */}
            <div className="flex items-center gap-5 pt-1 text-xs font-semibold text-brand-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-sky" />
                <span>Zero spam applications</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-sky" />
                <span>Built for students & universities</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cakap-Inspired Asymmetrical Layered Composition */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px] h-[440px] sm:h-[480px]">

              {/* Outer Decorative Glow Rings */}
              <div className="absolute inset-0 m-auto w-[340px] h-[340px] sm:w-[390px] sm:h-[390px] rounded-full border border-dashed border-brand-sky/40 animate-spin" style={{ animationDuration: '40s' }} />
              <div className="absolute inset-0 m-auto w-[400px] h-[400px] sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tr from-brand-tint/60 to-brand-sky/20 -z-10" />

              {/* Central Circular Hero Image (Alex Morgan / Student) */}
              <div className="absolute inset-0 m-auto w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] rounded-full overflow-hidden p-2.5 bg-white shadow-float border-4 border-brand-tint z-10">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-brand-navy">
                  <Image
                    src="/images/hero-student.jpg"
                    alt="InterConnect Student Innovator"
                    fill
                    className="object-cover object-top scale-105"
                    priority
                  />
                </div>
              </div>

              {/* Satellite Avatar Bubble 1: Maya (Stanford CS) */}
              <div className="absolute top-6 left-6 w-14 h-14 rounded-full p-1 bg-white shadow-card border-2 border-brand-sky z-20 hover:scale-110 transition-transform">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/images/testimonial-student.jpg"
                    alt="Maya Tesfaye"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Satellite Avatar Bubble 2: Daniel (Recruiter) */}
              <div className="absolute bottom-10 right-4 w-14 h-14 rounded-full p-1 bg-white shadow-card border-2 border-brand-navy z-20 hover:scale-110 transition-transform">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/images/testimonial-recruiter.jpg"
                    alt="Daniel Carter - Recruiter"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Floating Card 1: Top Right - Match Indicator */}
              <div className="absolute -top-2 right-2 sm:right-6 glass-card p-3.5 rounded-2xl shadow-float z-30 max-w-[210px] animate-float-card border border-brand-sky/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-accentGreen animate-pulse" />
                  <span className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">
                    New Match
                  </span>
                  <span className="ml-auto text-xs font-black text-brand-navy bg-brand-tint px-2 py-0.5 rounded-full">
                    94%
                  </span>
                </div>
                <p className="text-xs font-bold text-brand-text truncate">Software Engineer Intern</p>
                <p className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                  <span>Nova Systems</span> · <span>Remote</span>
                </p>
              </div>

              {/* Floating Card 2: Bottom Left - Application Accepted */}
              <div className="absolute bottom-6 left-1 sm:left-0 glass-card p-4 rounded-2xl shadow-float z-30 max-w-[240px] animate-float-reverse border border-brand-sky/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center text-brand-navy font-black text-base shadow-inner">
                    ▲
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                        Accepted
                      </span>
                    </div>
                    <p className="text-xs font-bold text-brand-navy truncate mt-0.5">TechNova • Applied AI</p>
                    <p className="text-[10px] text-brand-muted">Interview scheduled</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 3: Middle Right - Applicant Count Badge */}
              <div className="absolute top-1/2 -right-2 sm:-right-6 transform -translate-y-1/2 bg-brand-navy text-white p-3 rounded-2xl shadow-card z-30 flex items-center gap-3 border border-brand-navyLight animate-float-card">
                <div className="w-8 h-8 rounded-full bg-brand-sky/20 flex items-center justify-center text-brand-sky">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">12 New Applicants</div>
                  <div className="text-[10px] text-brand-tint/70">Top 5% verified match</div>
                </div>
              </div>

              {/* Small Stipend Pill Tag */}
              <div className="absolute top-24 left-1 sm:-left-6 bg-white px-3 py-1.5 rounded-full shadow-subtle border border-brand-border flex items-center gap-1.5 text-xs font-bold text-brand-navy z-20">
                <span className="w-2 h-2 rounded-full bg-brand-sky" />
                <span>$800 - $1,500/mo</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
