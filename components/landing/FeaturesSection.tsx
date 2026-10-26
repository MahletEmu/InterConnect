'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, UserCheck, Building2, Sparkles, ArrowRight } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Discover Internships',
      description:
        'Find internships matched directly to your skills, university field, interests, and long-term career aspirations across Ethiopia.',
      icon: Compass,
      tag: 'For Students',
      highlighted: true,
      href: '/internships',
    },
    {
      title: 'Build Your Profile',
      description:
        'Show companies who you really are through verified skills, live capstone projects, university credentials, certificates, and code repositories.',
      icon: UserCheck,
      tag: 'Portfolio Studio',
      highlighted: false,
      href: '/dashboard/student/profile',
    },
    {
      title: 'Explore Companies',
      description:
        'Research legitimate Ethiopian employers, tech enterprises, financial institutions, and innovative startups offering verified student internships.',
      icon: Building2,
      tag: 'Company Directory',
      highlighted: false,
      href: '/companies',
    },
    {
      title: 'Smart Matching',
      description:
        'Get intelligent internship recommendations with transparent compatibility breakdown across your department, skills, and location.',
      icon: Sparkles,
      tag: 'Matching Engine',
      highlighted: false,
      href: '/#matching',
    },
  ];

  return (
    <section className="relative py-12 sm:py-14 bg-brand-canvas overflow-hidden">
      {/* Background Organic Wave/Blob (Cakap reference styling) */}
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-brand-tint/60 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3" />
      <div className="absolute left-0 bottom-10 w-[400px] h-[400px] bg-brand-sky/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Platform Capabilities
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4xl text-brand-navy mt-2.5 mb-2.5 tracking-tight">
            Everything You Need to Make the Right Connection
          </h2>
          <p className="text-brand-muted text-sm sm:text-base max-w-xl mx-auto">
            Purpose-built tools for Ethiopian university students to launch high-impact careers and connect with verified employers.
          </p>
        </div>

        {/* 4 Premium Cards Grid (Inspired by Cakap Services Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.title}
                className={`relative group rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                  feat.highlighted
                    ? 'bg-gradient-to-br from-brand-sky to-brand-navy text-white shadow-card hover:shadow-glow'
                    : 'bg-white border border-brand-border hover:border-brand-sky/40 text-brand-text shadow-soft hover:shadow-card'
                }`}
              >
                {/* Floating pill badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      feat.highlighted
                        ? 'bg-white/20 text-white backdrop-blur-sm'
                        : 'bg-brand-tint text-brand-sky'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      feat.highlighted
                        ? 'bg-white/15 text-brand-tint'
                        : 'bg-brand-canvas text-brand-muted border border-brand-border'
                    }`}
                  >
                    {feat.tag}
                  </span>
                </div>

                <h3
                  className={`font-heading font-extrabold text-xl sm:text-2xl tracking-tight mb-2 ${
                    feat.highlighted ? 'text-white' : 'text-brand-navy'
                  }`}
                >
                  {feat.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    feat.highlighted ? 'text-white/80' : 'text-brand-muted'
                  }`}
                >
                  {feat.description}
                </p>

                <Link
                  href={feat.href}
                  className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                    feat.highlighted
                      ? 'text-white hover:text-brand-tint'
                      : 'text-brand-sky hover:text-brand-navy'
                  }`}
                >
                  <span>Explore {feat.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
