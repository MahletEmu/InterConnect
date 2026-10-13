'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { supabase } from '@/lib/supabase';
import { Company } from '@/types';
import {
  MapPin,
  Building,
  Globe,
  Users,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const { internships } = useInterConnect();
  const [dbCompany, setDbCompany] = React.useState<Company | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchCompany() {
      if (!params.id) return;
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('id', params.id)
          .maybeSingle();

        if (data && isMounted) {
          setDbCompany({
            id: data.id,
            profileId: data.profile_id,
            name: data.company_name || 'Partner Company',
            logo: data.logo_url || (data.company_name ? data.company_name.slice(0, 2).toUpperCase() : 'CO'),
            industry: data.industry || 'Technology',
            location: data.location || 'Remote',
            website: data.website || '',
            size: data.company_size || '10-50 employees',
            about: data.description || 'Verified enterprise hiring partner committed to technical student mentorship.',
            mission: data.mission || 'Building the future of technology and early-career talent.',
            culture: data.culture ? [data.culture] : ['Innovation', 'Collaboration', 'Impact'],
            benefits: ['Competitive Stipend', 'Mentorship', 'Remote Work Flexibility'],
            openPositionsCount: 1,
            verified: true,
          });
        }
      } catch (err) {
        console.error('Error loading company from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCompany();
    return () => { isMounted = false; };
  }, [params.id]);

  const company = dbCompany;

  const companyInternships = company
    ? internships.filter(
        (i) => i.company.name.toLowerCase() === company.name.toLowerCase() || i.companyId === company.id
      )
    : [];

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-canvas">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-brand-sky animate-spin mb-3" />
          <p className="text-sm font-bold text-brand-navy">Loading verified company profile...</p>
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
            The company organization you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/companies"
            className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle"
          >
            Explore Companies Directory
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
            <span>Back to Companies</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-navy font-black text-2xl shadow-soft">
                {company.logo}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-brand-sky mb-2.5">{company.industry}</p>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-brand-muted font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                    {company.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-sky" />
                    {company.size}
                  </span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-sky hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {company.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="#openings"
                className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-card transition-all"
              >
                View {company.openPositionsCount} Open Positions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              {/* About & Mission */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-3">
                  About {company.name}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-4">
                  {company.about}
                </p>

                <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy mb-1.5">
                  Our Mission
                </h4>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {company.mission}
                </p>
              </div>

              {/* Culture */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-3">
                  Team Culture & Engineering Values
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.culture.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-brand-canvas border border-brand-border text-xs font-medium text-brand-navy flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-sky shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-3">
                  Intern Perks & Benefits
                </h3>
                <ul className="space-y-2.5">
                  {company.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-medium text-brand-text">
                      <Sparkles className="w-3.5 h-3.5 text-brand-sky shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Open Positions List */}
              <div id="openings" className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h3 className="font-heading font-extrabold text-lg text-brand-navy mb-4">
                  Open Positions at {company.name}
                </h3>

                <div className="space-y-3">
                  {companyInternships.map((intern) => (
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

                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-black text-brand-navy bg-brand-tint px-2.5 py-1 rounded-full">
                          {intern.matchScore}% Match
                        </span>
                        <Link
                          href={`/internships/${intern.id}`}
                          className="px-4 py-1.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all"
                        >
                          View Role
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy mb-3">
                  Recruiter Contact
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center text-brand-navy font-bold text-sm">
                    DC
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-brand-navy">Daniel Carter</h5>
                    <p className="text-xs text-brand-muted">Lead Talent Scout</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/student/messages"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-tint text-brand-navy hover:bg-brand-tintHover font-bold text-xs transition-all text-center block"
                >
                  Send Direct Inquiry
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
