'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Briefcase, Building2 } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative pt-10 sm:pt-14 pb-0 bg-brand-canvas overflow-hidden">
      {/* Top Wave Transition SVG (Cakap wave transition style) */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none -translate-y-[1px]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-10 text-white fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
        {/* Large Curved Light-Blue Card Container */}
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-tint via-brand-tintHover to-[#C6EFF9] p-8 sm:p-12 lg:p-14 shadow-float border border-brand-sky/30 overflow-hidden text-center">

          {/* Subtle Abstract Connection Network Graphic Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply">
            <Image
              src="/images/connection-network.jpg"
              alt="Connection network graphic"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative max-w-3xl mx-auto z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-brand-sky/40 text-xs font-extrabold uppercase tracking-widest text-brand-navy mb-4 shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
              <span>Launch Your Journey Today</span>
            </div>

            {/* Main CTA Heading */}
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy tracking-tight leading-[1.15] mb-3">
              Your Next Opportunity Starts With a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-navy">
                Connection.
              </span>
            </h2>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-brand-text/80 leading-relaxed mb-6 max-w-2xl mx-auto font-normal">
              Whether you&apos;re looking for your first career-defining internship or your next high-impact engineering intern, InterConnect helps you make the right connection.
            </p>

            {/* Dual Role Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/internships"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-card hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Briefcase className="w-4 h-4 text-brand-sky" />
                <span>I&apos;m Looking for an Internship</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/register?role=company"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-brand-navy bg-white hover:bg-white/90 border border-brand-sky/30 shadow-soft hover:shadow-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Building2 className="w-4 h-4 text-brand-sky" />
                <span>I&apos;m Hiring Interns</span>
              </Link>
            </div>

            <p className="text-[11px] font-semibold text-brand-muted mt-4">
              No credit card required · Free for university students · Verified hiring network
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Wave Transition into Dark Navy Footer */}
      <div className="w-full overflow-hidden leading-none mt-10 mb-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-14 text-brand-navy fill-current"
        >
          <path d="M0,0 C300,90 600,0 900,60 C1050,90 1150,40 1200,20 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </section>
  );
}
