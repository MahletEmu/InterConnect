'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ApplicationWizard from '@/components/application/ApplicationWizard';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { fetchInternshipById } from '@/lib/services/internshipService';
import { mapDbInternshipToFrontend } from '@/lib/services/mapper';
import { Internship } from '@/types';
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Sparkles,
  CheckCircle2,
  Building,
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Users,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { internships, isSaved, toggleSaveInternship } = useInterConnect();

  const [showWizard, setShowWizard] = useState(false);
  const [dbInternship, setDbInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchPosition() {
      if (!params.id) {
        setIsLoading(false);
        return;
      }
      const existing = internships.find((i) => i.id === params.id);
      if (existing) {
        setDbInternship(existing);
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await fetchInternshipById(params.id as string);
        if (data && isMounted) {
          setDbInternship(mapDbInternshipToFrontend(data));
        }
      } catch (err) {
        console.error('Error fetching position from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchPosition();
    return () => { isMounted = false; };
  }, [params.id, internships]);

  const internship = dbInternship || internships.find((i) => i.id === params.id) || null;

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-brand-sky animate-spin mb-3" />
          <p className="text-sm font-bold text-brand-navy">Loading internship details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!internship) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-tint border border-brand-sky/20 flex items-center justify-center text-brand-sky mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-brand-navy mb-2">
            Internship Position Not Found
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            This internship opportunity does not exist or may have been closed by the hiring organization.
          </p>
          <Link
            href="/internships"
            className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
          >
            Explore Active Internships
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const similarInternships = internships.filter(
    (i) => i.id !== internship.id && (i.industry === internship.industry || i.type === internship.type)
  ).slice(0, 3);

  const saved = isSaved(internship.id);

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      {/* Hero Header Card with integrated Breadcrumb */}
      <section className="py-6 sm:py-8 bg-white border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-navy transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Internships</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-black text-2xl shadow-soft shrink-0">
                {internship.company.logo}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-brand-sky hover:underline">
                    <Link href={`/companies/${internship.company.id}`}>
                      {internship.company.name}
                    </Link>
                  </span>
                  <span className="text-brand-border">•</span>
                  <span className="text-xs text-brand-muted">{internship.department}</span>
                  <span className="text-brand-border">•</span>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Employer</span>
                  </div>
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-3.5xl text-brand-navy mb-2">
                  {internship.title}
                </h1>

                {/* Tag Pills */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-brand-muted font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                    {internship.type} · {internship.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-sky" />
                    {internship.duration}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-brand-navy">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    {internship.stipend}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Score & CTA Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-tint border border-brand-sky/30 text-xs font-bold text-brand-navy shadow-subtle">
                <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
                <span>{internship.matchScore}% Match for Your Profile</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => toggleSaveInternship(internship.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                    saved
                      ? 'bg-brand-tint text-brand-sky border-brand-sky'
                      : 'bg-white text-brand-muted border-brand-border hover:bg-brand-canvas'
                  }`}
                  aria-label="Save"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-brand-sky' : ''}`} />
                </button>

                <button
                  onClick={() => setShowWizard(true)}
                  className="flex-1 sm:flex-initial px-6 sm:px-7 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 text-brand-sky" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Body */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* Left Content (Col 1-8) */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">

              {/* Match Breakdown Card */}
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-brand-tint/30 border border-brand-sky/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand-sky" />
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy">
                    Why You Match This Role ({internship.matchScore}%)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-brand-muted block font-semibold">Skills Match</span>
                    <span className="font-black text-base sm:text-lg text-brand-navy">{internship.matchBreakdown.skills}%</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-brand-muted block font-semibold">Education</span>
                    <span className="font-black text-base sm:text-lg text-brand-navy">{internship.matchBreakdown.education}%</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-brand-muted block font-semibold">Location Type</span>
                    <span className="font-black text-base sm:text-lg text-brand-navy">{internship.matchBreakdown.location}%</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-brand-muted block font-semibold">Interests</span>
                    <span className="font-black text-base sm:text-lg text-brand-navy">{internship.matchBreakdown.interests}%</span>
                  </div>
                </div>

                {internship.matchReasons && (
                  <ul className="text-xs text-brand-text space-y-1">
                    {internship.matchReasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* About Role */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
                  About the Role
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {internship.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
                  Key Responsibilities
                </h3>
                <ul className="space-y-2.5">
                  {internship.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-muted leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0 mt-2" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
                  Qualifications & Requirements
                </h3>
                <ul className="space-y-2.5">
                  {internship.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-muted leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-brand-sky shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required & Preferred Skills */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
                  Technical Stack & Skills
                </h3>

                <div className="mb-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-2">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {internship.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-tint text-brand-navy border border-brand-sky/30"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-2">
                    Preferred Skills (Nice to Have)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {internship.preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-canvas text-brand-muted border border-brand-border"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy mb-3">
                  Benefits & Growth Opportunities
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {internship.benefits.map((b, i) => (
                    <li key={i} className="p-3 rounded-xl bg-brand-canvas border border-brand-border text-xs font-medium text-brand-text flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Sticky Sidebar (Col 9-12) */}
            <div className="lg:col-span-4 space-y-5">

              {/* Sticky Action Card */}
              <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft sticky top-24">
                <h4 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">
                  Apply for this Position
                </h4>
                <p className="text-xs text-brand-muted mb-3.5">
                  Submitting directly notifies the hiring manager at {internship.company.name}.
                </p>

                <button
                  onClick={() => setShowWizard(true)}
                  className="w-full py-3 px-4 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2 mb-2.5"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 text-brand-sky" />
                </button>

                <button
                  onClick={() => toggleSaveInternship(internship.id)}
                  className={`w-full py-2 px-4 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    saved
                      ? 'bg-brand-tint text-brand-sky border-brand-sky'
                      : 'bg-white text-brand-navy border-brand-border hover:bg-brand-canvas'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-brand-sky' : ''}`} />
                  <span>{saved ? 'Saved to Your List' : 'Save for Later'}</span>
                </button>

                <div className="h-px bg-brand-border/60 my-3.5" />

                {/* Company Mini Card */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-black text-lg">
                      {internship.company.logo}
                    </div>
                    <div>
                      <h5 className="font-heading font-extrabold text-xs sm:text-sm text-brand-navy">
                        {internship.company.name}
                      </h5>
                      <span className="text-[11px] text-brand-muted">{internship.company.industry}</span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">
                    {internship.company.about}
                  </p>

                  <Link
                    href={`/companies/${internship.company.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-sky hover:underline"
                  >
                    <span>View Company Profile & Culture</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Similar Internships Section */}
          <div className="mt-10 pt-8 border-t border-brand-border/60">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mb-4">
              Similar Opportunities You Might Like
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {similarInternships.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white p-5 rounded-2xl border border-brand-border hover:border-brand-sky/40 shadow-soft hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-bold">
                      {sim.company.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-brand-navy">{sim.company.name}</h4>
                      <span className="text-[11px] text-brand-muted">{sim.type}</span>
                    </div>
                  </div>

                  <Link href={`/internships/${sim.id}`} className="block">
                    <h5 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy hover:text-brand-sky transition-colors mb-1.5 line-clamp-1">
                      {sim.title}
                    </h5>
                  </Link>

                  <div className="text-xs font-bold text-brand-sky mb-3">
                    {sim.matchScore}% Match
                  </div>

                  <Link
                    href={`/internships/${sim.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-brand-sky"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Application Wizard Modal */}
      {showWizard && (
        <ApplicationWizard
          internship={internship}
          onClose={() => setShowWizard(false)}
        />
      )}

      <Footer />
    </main>
  );
}
