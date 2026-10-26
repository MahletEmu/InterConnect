'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, HeartHandshake, TrendingUp } from 'lucide-react';

export default function ImpactSection() {
  const pillars = [
    {
      title: 'Verified Technical Skills',
      desc: 'Proven GitHub repositories, live projects, and academic coursework.',
      icon: ShieldCheck,
      badge: 'Skill Integrity',
    },
    {
      title: 'Direct Application Tracking',
      desc: 'Real-time status updates at every stage. Zero application black holes.',
      icon: CheckCircle2,
      badge: 'Transparency',
    },
    {
      title: 'Mentorship-Driven Roles',
      desc: 'Curated internships structured for rapid learning and engineering impact.',
      icon: HeartHandshake,
      badge: 'Growth Focus',
    },
    {
      title: 'Early Career Acceleration',
      desc: 'Helping forward-thinking teams convert standout interns into full-time engineers.',
      icon: TrendingUp,
      badge: 'Career Pipeline',
    },
  ];

  return (
    <section className="relative py-10 sm:py-12 bg-white border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-brand-canvas border border-brand-border/80 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sky bg-white px-2 py-0.5 rounded-full border border-brand-border">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
