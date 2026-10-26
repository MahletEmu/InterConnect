'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Company, Internship } from '@/types';
import { fetchCompanyDirectoryById } from '@/lib/services/companyService';
import {
  MapPin,
  Building,
  Globe,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import EmailApplicationModal from '@/components/student/EmailApplicationModal';

export default function CompanyDetailPage() {
  const params = useParams();
  const { currentUser } = useInterConnect();
  const [company, setCompany] = useState<Company | null>(null);
  const [activeInternships, setActiveInternships] = useState<Internship[]>([]);
  const [expiredInternships, setExpiredInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCompany() {
      if (!params.id) return;
      setIsLoading(true);
      try {
        const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetchCompanyDirectoryById(idStr);
        if (isMounted) {
          setCompany(res.company);
          setActiveInternships(res.activeInternships);
          setExpiredInternships(res.expiredInternships);
        }
      } catch (err) {
        console.error('Error loading company details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCompany();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-brand-sky animate-spin mb-3" />
          <p className="text-sm font-bold text-brand-navy">Loading verified organization profile...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!company) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-tint border border-brand-sky/20 flex items-center justify-center text-brand-sky mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-brand-navy mb-2">
            Company Profile Not Found
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            The organization you are looking for does not exist in our directory or has been updated.
          </p>
          <Link
            href="/companies"
            className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
          >
            Return to Companies Directory
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas">
      <Navbar />

      {/* Header Banner */}
      <section className="py-8 sm:py-10 bg-white border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-navy transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Companies Directory</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-black text-2xl shadow-soft">
                {company.logo}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy">
                    {company.name}
                  </h1>
                  {company.verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Ethiopian Presence</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-brand-sky mb-2">{company.industry}</p>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-brand-muted font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                    <span>{company.location}</span>
                  </span>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-brand-sky hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>{company.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-sky to-brand-navy hover:opacity-95 text-white text-xs font-bold shadow-card flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Internship Request</span>
              </button>

              {company.careersUrl && (
                <a
                  href={company.careersUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-card transition-all flex items-center gap-1.5"
                >
                  <span>Official Careers Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-sky" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Details */}
      <section className="py-8 sm:py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* Main Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. About Company */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-3">
                  About {company.name}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-4">
                  {company.about}
                </p>

                {company.mission && (
                  <>
                    <h4 className="font-heading font-extrabold text-sm text-brand-navy mb-1.5">
                      Mission & Impact
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                      {company.mission}
                    </p>
                  </>
                )}
              </div>

              {/* 2. Internship Fields / Target Departments */}
              {company.internshipFields && company.internshipFields.length > 0 && (
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft">
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-2">
                    Internship Fields & Eligible University Departments
                  </h3>
                  <p className="text-xs text-brand-muted mb-3">
                    Students from the following Ethiopian university fields commonly qualify for training, attachment, and project cohorts at this organization:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {company.internshipFields.map((field) => (
                      <span
                        key={field}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-brand-canvas text-brand-navy border border-brand-border"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Team Culture & Student Environment */}
              {company.culture && company.culture.length > 0 && (
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft">
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-3">
                    Work Culture & Professional Standards
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {company.culture.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-medium text-brand-navy flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-sky shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Active & Open Internships Section */}
              <div id="openings" className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                    Active Internship Openings
                  </h3>
                  <span className="text-xs font-bold text-brand-sky">
                    {activeInternships.length} Open Position{activeInternships.length === 1 ? '' : 's'}
                  </span>
                </div>

                {activeInternships.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-brand-canvas border border-dashed border-brand-border text-center">
                    <Briefcase className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                    <h4 className="font-heading font-bold text-sm text-brand-navy mb-1">
                      No Active Internships Currently Open on InterConnect
                    </h4>
                    <p className="text-xs text-brand-muted max-w-md mx-auto mb-4">
                      {company.name} does not have an active opening published on InterConnect right now. You can check their official careers portal directly or explore other verified opportunities.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {company.careersUrl && (
                        <a
                          href={company.careersUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navyLight transition-all"
                        >
                          <span>Visit {company.name} Careers</span>
                          <ExternalLink className="w-3.5 h-3.5 text-brand-sky" />
                        </a>
                      )}
                      <Link
                        href="/internships"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-brand-border text-brand-navy text-xs font-bold hover:bg-brand-tint transition-all"
                      >
                        <span>Browse All Open Internships</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-sky" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeInternships.map((intern) => (
                      <div
                        key={intern.id}
                        className="p-4 rounded-2xl bg-brand-canvas border border-brand-border hover:border-brand-sky/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                      >
                        <div>
                          <Link href={`/internships/${intern.id}`}>
                            <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy hover:text-brand-sky transition-colors">
                              {intern.title}
                            </h4>
                          </Link>
                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-brand-muted mt-1">
                            <span>{intern.type}</span>
                            <span>•</span>
                            <span>{intern.duration}</span>
                            <span>•</span>
                            <span className="font-bold text-brand-navy">{intern.stipend}</span>
                          </div>
                        </div>

                        <Link
                          href={`/internships/${intern.id}`}
                          className="px-4 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all text-center"
                        >
                          View & Apply
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expired Internships Archive (if any) */}
                {expiredInternships.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-brand-border/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-3">
                      Recently Closed / Past Opportunities:
                    </span>
                    <div className="space-y-2 opacity-75">
                      {expiredInternships.map((intern) => (
                        <div
                          key={intern.id}
                          className="p-3 rounded-xl bg-brand-canvas/60 border border-brand-border flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-brand-navy">{intern.title}</span>
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Application Closed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar Column (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Verified Information Box */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-soft space-y-4">
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy">
                  Verified Organization Details
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                      Organization Size
                    </span>
                    <span className="font-semibold text-brand-navy">{company.size}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                      Headquarters
                    </span>
                    <span className="font-semibold text-brand-navy">{company.location}</span>
                  </div>

                  {company.contactEmail && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                        Official Contact Email
                      </span>
                      <a
                        href={`mailto:${company.contactEmail}`}
                        className="font-semibold text-brand-sky hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{company.contactEmail}</span>
                      </a>
                    </div>
                  )}

                  {company.contactPhone && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                        Public Phone / Hotline
                      </span>
                      <a
                        href={`tel:${company.contactPhone}`}
                        className="font-semibold text-brand-navy flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span>{company.contactPhone}</span>
                      </a>
                    </div>
                  )}

                  {company.website && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                        Official Website
                      </span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand-sky hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{company.website}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-brand-border/60">
                  <div className="p-3 rounded-2xl bg-brand-tint/60 border border-brand-sky/20 text-[11px] text-brand-navy font-medium leading-relaxed">
                    <span className="font-bold block mb-0.5">Directory Authenticity</span>
                    This profile presents public, verified information for Ethiopian university students. No company account is required for legitimate organizations to appear.
                  </div>
                </div>
              </div>

              {/* Student Action Box */}
              <div className="bg-gradient-to-br from-brand-navy to-brand-navyDark text-white p-5 sm:p-6 rounded-3xl shadow-card">
                <h4 className="font-heading font-extrabold text-base mb-2">
                  Preparing to Apply?
                </h4>
                <p className="text-xs text-brand-tint/80 leading-relaxed mb-4">
                  Make sure your student profile is up to date with your university department, skills, and projects before sending an application.
                </p>
                <Link
                  href="/dashboard/student/profile"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-sky hover:bg-brand-skyHover text-brand-navy text-xs font-bold transition-all text-center block shadow-soft"
                >
                  Update Student Profile
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Direct Email Application Modal */}
      <EmailApplicationModal
        company={company}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        student={currentUser}
      />

      <Footer />
    </main>
  );
}
