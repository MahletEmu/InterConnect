'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Check, ArrowRight, Zap, Target, Cpu, ShieldCheck } from 'lucide-react';

export default function SmartMatchSection() {
  const [selectedCandidate, setSelectedCandidate] = useState<'alex' | 'maya'>('alex');

  const matchData = {
    alex: {
      studentName: 'Alex Morgan',
      role: 'B.Sc. Computer Science',
      avatar: '/images/hero-student.jpg',
      targetRole: 'Software Engineering Intern',
      targetCompany: 'Nova Systems',
      targetLogo: '⚡',
      score: 94,
      breakdown: [
        { label: 'Skills Match (TS, React, Python, SQL)', pct: 96 },
        { label: 'Education & Degree Level (CS Junior)', pct: 94 },
        { label: 'Location & Work Preference (Remote)', pct: 92 },
        { label: 'Interest & Capstone Alignment (Systems)', pct: 94 },
      ],
      tags: ['TypeScript', 'React', 'Python', 'PostgreSQL', 'Docker'],
      reasons: [
        'Demonstrated GitHub project in CRDT real-time systems',
        'Academic coursework in Distributed Systems & Databases',
        'Preference for remote distributed workflows',
      ],
    },
    maya: {
      studentName: 'Maya Tesfaye',
      role: 'B.S. Computer Science (Stanford)',
      avatar: '/images/testimonial-student.jpg',
      targetRole: 'AI Research & ML Systems Intern',
      targetCompany: 'TechNova',
      targetLogo: '▲',
      score: 96,
      breakdown: [
        { label: 'Skills Match (Python, PyTorch, RAG)', pct: 98 },
        { label: 'Education & Academic Record (GPA 3.92)', pct: 96 },
        { label: 'Location Preference (Hybrid / SF)', pct: 95 },
        { label: 'Research Trajectory Alignment', pct: 95 },
      ],
      tags: ['PyTorch', 'Python', 'Transformers', 'Algorithms', 'Linear Algebra'],
      reasons: [
        'Hands-on experience profiling neural inference pipelines',
        'Verified university math and optimization background',
        'Strong publication and open-source contributions',
      ],
    },
  };

  const active = matchData[selectedCandidate];

  return (
    <section id="matching" className="relative py-12 sm:py-14 bg-brand-canvas overflow-hidden">
      {/* Background radial gradient blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-brand-tint/60 via-brand-sky/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint border border-brand-sky/20 text-xs font-extrabold uppercase tracking-widest text-brand-sky">
            <Sparkles className="w-3.5 h-3.5" />
            Deterministic Precision
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2.5 tracking-tight">
            Stop Searching. <span className="text-brand-sky">Start Matching.</span>
          </h2>
          <p className="text-brand-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            InterConnect analyzes verified technical proficiencies, course specializations, project repositories, and working preferences to connect the right candidate with the ideal team.
          </p>

          {/* Candidate selector pills */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            <span className="text-xs font-bold text-brand-muted mr-1">Simulate Match:</span>
            <button
              onClick={() => setSelectedCandidate('alex')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                selectedCandidate === 'alex'
                  ? 'bg-brand-navy text-white shadow-card'
                  : 'bg-white text-brand-text border border-brand-border hover:bg-brand-tint'
              }`}
            >
              Alex Morgan (Software Eng)
            </button>
            <button
              onClick={() => setSelectedCandidate('maya')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                selectedCandidate === 'maya'
                  ? 'bg-brand-navy text-white shadow-card'
                  : 'bg-white text-brand-text border border-brand-border hover:bg-brand-tint'
              }`}
            >
              Maya Tesfaye (AI Research)
            </button>
          </div>
        </div>

        {/* The Animated Matching Interface Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-float border border-brand-border relative">

          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 sm:gap-6 items-center">

            {/* Student Preview (Col 1-4) */}
            <div className="md:col-span-4 bg-brand-canvas p-4 sm:p-5 rounded-2xl border border-brand-border/80 flex flex-col items-center text-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-sky mb-3 shadow-card">
                <Image
                  src={active.avatar}
                  alt={active.studentName}
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="font-heading font-extrabold text-base text-brand-navy">{active.studentName}</h4>
              <p className="text-xs text-brand-muted font-medium mb-3">{active.role}</p>

              {/* Verified Skill Pills */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {active.tags.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-brand-navy border border-brand-border shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Connecting Match Engine (Col 5-7) */}
            <div className="md:col-span-3 flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-sky to-brand-navy flex items-center justify-center text-white shadow-glow animate-pulse">
                <Zap className="w-5 h-5" />
              </div>

              <div className="my-2 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-muted">
                  InterConnect Algorithm
                </span>
                <span className="font-heading font-black text-3xl text-brand-navy tracking-tight mt-0.5">
                  {active.score}%
                </span>
                <span className="text-xs font-bold text-brand-sky">Strong Compatibility</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Match</span>
              </div>
            </div>

            {/* Company Opening (Col 8-11) */}
            <div className="md:col-span-4 bg-brand-tint/40 p-4 sm:p-5 rounded-2xl border border-brand-sky/30 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-navy text-brand-sky font-black text-2xl flex items-center justify-center mb-3 shadow-card">
                {active.targetLogo}
              </div>
              <h4 className="font-heading font-extrabold text-base text-brand-navy">{active.targetRole}</h4>
              <p className="text-xs text-brand-sky font-bold mb-3">{active.targetCompany}</p>

              <div className="w-full bg-white p-2.5 rounded-xl text-left border border-brand-border/60">
                <span className="text-[10px] font-extrabold uppercase text-brand-muted block mb-1">
                  Why this role matches:
                </span>
                <ul className="text-[11px] text-brand-text space-y-1">
                  {active.reasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-brand-sky shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Granular Match Meters */}
          <div className="mt-6 pt-5 border-t border-brand-border/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 text-center">
              Granular Compatibility Breakdown
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {active.breakdown.map((item) => (
                <div key={item.label} className="bg-brand-canvas p-3 rounded-xl border border-brand-border/60">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-brand-text">{item.label}</span>
                    <span className="text-brand-navy font-black">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-navy transition-all duration-700"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct CTA */}
          <div className="mt-6 text-center">
            <Link
              href="/internships/intern-1"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyLight px-6 py-2.5 rounded-full shadow-card hover:shadow-glow transition-all"
            >
              <span>Explore This Matched Opportunity</span>
              <ArrowRight className="w-4 h-4 text-brand-sky" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
