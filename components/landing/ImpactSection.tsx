'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Building, ShieldCheck, HeartHandshake } from 'lucide-react';
import { getPlatformPublicStats, PlatformPublicStats } from '@/lib/services/statsService';

export default function ImpactSection() {
  const [stats, setStats] = useState<PlatformPublicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await getPlatformPublicStats();
        if (isMounted) {
          if (res.success) {
            setStats(res.data);
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = [
    {
      label: 'Verified Students',
      val: isLoading ? '...' : stats && stats.studentsCount > 0 ? `${stats.studentsCount}` : 'Growing',
      icon: Users,
      sub: 'Active university innovators',
    },
    {
      label: 'Partner Employers',
      val: isLoading ? '...' : stats && stats.companiesCount > 0 ? `${stats.companiesCount}` : 'Growing',
      icon: Building,
      sub: 'Verified hiring partners',
    },
    {
      label: 'Curated Openings',
      val: isLoading ? '...' : stats && stats.internshipsCount > 0 ? `${stats.internshipsCount}` : 'Growing',
      icon: TrendingUp,
      sub: 'Published & eligible roles',
    },
    {
      label: 'Direct Tracking',
      val: '100%',
      icon: ShieldCheck,
      sub: 'Zero corporate black holes',
    },
    {
      label: 'Community Cohort',
      val: 'Active',
      icon: HeartHandshake,
      sub: 'Growing talent network',
    },
  ];

  return (
    <section className="relative py-10 sm:py-12 bg-white border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4 text-center">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`p-4 sm:p-5 rounded-2xl bg-brand-canvas border border-brand-border/80 shadow-2xs ${
                  idx === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center text-brand-sky mx-auto mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-heading font-black text-2xl sm:text-2.5xl text-brand-navy tracking-tight">
                  {m.val}
                </div>
                <div className="text-xs font-bold text-brand-navy mt-1">{m.label}</div>
                <div className="text-[10px] text-brand-muted mt-0.5">{m.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
