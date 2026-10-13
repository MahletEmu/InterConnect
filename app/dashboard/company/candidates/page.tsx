'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types';
import {
  Search,
  Users,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  MapPin,
  MessageSquare,
  ArrowRight,
  Filter,
  Loader2,
} from 'lucide-react';

export default function CompanyCandidatesPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [query, setQuery] = useState('');
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [dbStudents, setDbStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchRealCandidates() {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select(`
            id,
            profile_id,
            university,
            field_of_study,
            graduation_year,
            location,
            bio,
            resume_url,
            profile_completion,
            profiles (id, full_name, email, avatar_url),
            student_skills (skills (name))
          `);

        if (data && isMounted) {
          const mapped: Student[] = data.map((sp: any) => ({
            id: sp.id,
            profileId: sp.profile_id,
            name: sp.profiles?.full_name || 'Student Candidate',
            email: sp.profiles?.email || '',
            avatar: sp.profiles?.avatar_url || '/images/hero-student.jpg',
            headline: sp.field_of_study ? `${sp.field_of_study} Student` : 'Student Innovator',
            university: sp.university || 'University Student',
            degree: sp.field_of_study || 'B.Sc. Student',
            fieldOfStudy: sp.field_of_study || '',
            gradYear: parseInt(sp.graduation_year, 10) || 2026,
            location: sp.location || 'Remote',
            bio: sp.bio || 'Dedicated student eager to contribute technical skills to production software.',
            completionRate: sp.profile_completion || 75,
            skills: Array.isArray(sp.student_skills)
              ? sp.student_skills.map((sk: any) => ({ name: sk.skills?.name || 'Skill' })).filter((s: any) => Boolean(s.name))
              : [],
            education: [],
            projects: [],
            certificates: [],
            experience: [],
            resumeUrl: sp.resume_url,
          }));
          setDbStudents(mapped);
        }
      } catch (err) {
        console.error('Error fetching real candidates:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchRealCandidates();
    return () => { isMounted = false; };
  }, []);

  const candidates = dbStudents;

  const toggleShortlist = (id: string) => {
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredStudents = candidates.filter((stud) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      stud.name.toLowerCase().includes(q) ||
      stud.university.toLowerCase().includes(q) ||
      stud.skills.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Talent Sourcing
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
                Verified Candidate Talent Network
              </h1>
              <p className="text-xs text-brand-muted mt-1">
                Search students by verified skill credentials, universities, and algorithmic match scores.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-soft border border-brand-border flex items-center gap-3">
            <Search className="w-5 h-5 text-brand-muted shrink-0 ml-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by candidate name, skill (Python, React, TypeScript), or university..."
              className="w-full text-xs sm:text-sm text-brand-text bg-transparent placeholder:text-brand-muted focus:outline-none"
            />
          </div>

          {/* Candidates Grid */}
          {isLoading ? (
            <div className="bg-white p-10 rounded-2xl sm:rounded-3xl border border-brand-border text-center shadow-soft flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-sky animate-spin mb-3" />
              <p className="text-sm font-bold text-brand-navy">Loading verified candidate directory...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl sm:rounded-3xl border border-dashed border-brand-border text-center shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-sky mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-navy mb-1.5">
                {query.trim() ? 'No matching candidates found' : 'No registered student profiles yet'}
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
                {query.trim()
                  ? 'Try searching with different keywords, alternative skills, or clear your query.'
                  : 'As students join the network and complete their technical profiles, you can discover and contact them directly here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredStudents.map((stud) => {
              const isShortlisted = shortlistedIds.includes(stud.id);
              return (
                <div
                  key={stud.id}
                  className="bg-white rounded-2xl p-5 border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-brand-sky bg-brand-navy shrink-0 shadow-2xs">
                          <Image
                            src={stud.avatar}
                            alt={stud.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-heading font-extrabold text-base text-brand-navy">
                            {stud.name}
                          </h3>
                          <span className="text-xs text-brand-sky font-semibold block">
                            {stud.degree.split('in')[1] || stud.degree}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black bg-brand-tint text-brand-navy px-2.5 py-1 rounded-full shrink-0">
                        {stud.completionRate}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-brand-muted mb-2.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span className="truncate">{stud.university}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span className="truncate">{stud.location}</span>
                      </p>
                    </div>

                    <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-3">
                      {stud.bio}
                    </p>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                      {stud.skills.slice(0, 4).map((sk) => (
                        <span
                          key={sk.name}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-canvas text-brand-navy border border-brand-border flex items-center gap-1"
                        >
                          {sk.verified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                          <span>{sk.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-border/60 flex items-center gap-2">
                    <button
                      onClick={() => toggleShortlist(stud.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isShortlisted
                          ? 'bg-brand-tint text-brand-navy border border-brand-sky'
                          : 'bg-brand-canvas text-brand-navy border border-brand-border hover:bg-white'
                      }`}
                    >
                      {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                    </button>

                    <Link
                      href="/dashboard/company/messages"
                      className="p-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white transition-colors"
                      title="Direct Message"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-sky" />
                    </Link>
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
