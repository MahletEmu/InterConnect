'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { useAuth } from '@/lib/context/AuthContext';
import { updateCompanyProfileInfo } from '@/lib/services/profileService';
import {
  Building,
  Globe,
  MapPin,
  Users,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CompanyProfilePage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user } = useAuth();
  const { currentCompany, companyProfileId, refreshData } = useInterConnect();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('10-50 employees');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [mission, setMission] = useState('');

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form with loaded company profile
  useEffect(() => {
    if (currentCompany) {
      setCompanyName(currentCompany.name || user?.name || '');
      setIndustry(currentCompany.industry || '');
      setCompanySize(currentCompany.size || '10-50 employees');
      setLocation(currentCompany.location || '');
      setWebsite(currentCompany.website || '');
      setDescription(currentCompany.about || '');
      setMission(currentCompany.mission || '');
    } else if (user) {
      setCompanyName(user.name || '');
    }
  }, [currentCompany, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setSaveError('Company name is required.');
      return;
    }

    const effectiveCompanyId = companyProfileId || currentCompany?.id;
    const effectiveProfileId = currentCompany?.profileId || user?.id;

    if (!effectiveCompanyId || !effectiveProfileId) {
      setSaveError('No active company profile found to update.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await updateCompanyProfileInfo({
        profileId: effectiveProfileId,
        companyProfileId: effectiveCompanyId,
        companyName: companyName.trim(),
        industry: industry.trim(),
        companySize,
        location: location.trim(),
        website: website.trim(),
        description: description.trim(),
        mission: mission.trim(),
      });

      if (!res.success) {
        setSaveError(res.error || 'Failed to update company profile.');
      } else {
        setSaveSuccess('Company profile successfully updated!');
        await refreshData();
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Unexpected error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex">
      <DashboardSidebar
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

        <main className="p-4 sm:p-6 flex-1 max-w-5xl w-full mx-auto space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Employer Presence
              </span>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mt-0.5">
                Company Profile Management
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                Manage your public employer brand, culture, and overview seen by student applicants.
              </p>
            </div>

            {currentCompany?.id && (
              <Link
                href={`/companies/${currentCompany.id}`}
                target="_blank"
                className="px-4 py-2 rounded-full bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-sky" />
              </Link>
            )}
          </div>

          {/* Feedback alerts */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft overflow-hidden">

            {/* Banner Strip */}
            <div className="h-20 sm:h-24 bg-gradient-to-r from-brand-navy via-brand-sky to-brand-tint" />

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 -mt-10 sm:-mt-12 space-y-5">

              {/* Logo / Badge */}
              <div className="flex items-end gap-4 mb-2">
                <div className="w-20 h-20 rounded-2xl bg-brand-canvas border-4 border-white shadow-card flex items-center justify-center font-heading font-black text-2xl text-brand-navy">
                  {currentCompany?.logo?.length === 2 ? currentCompany.logo : (companyName ? companyName.slice(0, 2).toUpperCase() : 'CO')}
                </div>
                <div className="pb-2">
                  <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                    {companyName || 'Your Enterprise Brand'}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-sky">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Hiring Partner</span>
                  </div>
                </div>
              </div>

              {/* Grid 1: Name & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                    Industry Domain
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Software & Cloud Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                  />
                </div>
              </div>

              {/* Grid 2: Location, Size, Website */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                    Primary Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Addis Ababa / Remote"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-sky"
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="10-50 employees">10-50 employees</option>
                    <option value="50-200 employees">50-200 employees</option>
                    <option value="200-1000 employees">200-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                  About Company / Organization Overview
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of your organization, engineering culture, and internship mentorship framework..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                />
              </div>

              {/* Mission */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                  Mission Statement
                </label>
                <input
                  type="text"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="e.g. Empowering next-generation software innovators with production-grade experience."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs sm:text-sm text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-sky"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-brand-sky" />
                      <span>Save Company Profile</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>
    </div>
  );
}
