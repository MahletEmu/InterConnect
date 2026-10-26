'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { evaluateHonestMatch } from '@/lib/services/matchingService';
import {
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Trash2,
  Compass,
} from 'lucide-react';

export default function StudentSavedPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { internships, savedInternshipIds, toggleSaveInternship, currentUser } = useInterConnect();

  const savedList = internships.filter((i) => savedInternshipIds.includes(i.id));

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Saved Bookmarks
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              Your Saved Internships ({savedList.length})
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Opportunities bookmarked for future review and application.
            </p>
          </div>

          {savedList.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 text-center border border-brand-border shadow-soft max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-brand-tint flex items-center justify-center text-brand-sky mx-auto mb-3">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-navy mb-1.5">
                Your next opportunity could be here.
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed mb-5">
                You haven&apos;t saved any internships yet. Explore the marketplace to find and bookmark matching positions.
              </p>
              <Link
                href="/internships"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-card transition-all"
              >
                <Compass className="w-4 h-4 text-brand-sky" />
                <span>Explore Internships</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {savedList.map((item) => {
                const match = evaluateHonestMatch(currentUser, item);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-brand-border shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-bold text-base">
                          {item.company.logo}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-brand-navy">{item.company.name}</h4>
                          <span className="text-[10px] text-brand-muted">{item.company.industry}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSaveInternship(item.id)}
                        className="p-1.5 rounded-xl text-brand-muted hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link href={`/internships/${item.id}`} className="block mb-2">
                      <h3 className="font-heading font-extrabold text-base text-brand-navy group-hover:text-brand-sky transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>

                    {item.isExpired ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-3">
                        <Clock className="w-3 h-3 text-rose-500" />
                        <span>Closed ({item.applicationDeadline || 'Deadline passed'})</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-tint text-brand-navy text-xs font-bold mb-3">
                        <Sparkles className="w-3 h-3 text-brand-sky" />
                        <span>{match.score !== null ? `${match.score}% Fit · ${match.label}` : item.department || 'Verified Role'}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-brand-muted mb-3 font-medium">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        {item.type}
                      </span>
                      <span className="flex items-center gap-1 truncate font-bold text-brand-navy">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {item.stipend.split('/')[0]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.requiredSkills.slice(0, 3).map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-canvas text-brand-text border border-brand-border/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-brand-muted">{item.duration.split('(')[0]}</span>
                    {item.isExpired ? (
                      <Link
                        href={`/internships/${item.id}`}
                        className="px-3.5 py-1.5 rounded-full bg-brand-canvas hover:bg-brand-border/40 text-brand-muted text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span>View Archive</span>
                        <ArrowRight className="w-3 h-3 text-brand-muted" />
                      </Link>
                    ) : (
                      <Link
                        href={`/internships/${item.id}`}
                        className="px-4 py-1.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1"
                      >
                        <span>View & Apply</span>
                        <ArrowRight className="w-3 h-3 text-brand-sky" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
