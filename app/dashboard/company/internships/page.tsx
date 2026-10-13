'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  Briefcase,
  Plus,
  Users,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { deleteInternship } from '@/lib/services/internshipService';

export default function CompanyInternshipsPage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { currentCompany, companyProfileId, internships, createPosition, refreshData } = useInterConnect();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the internship posting "${title}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await deleteInternship(id);
      if (res.success) {
        await refreshData();
      } else {
        alert(res.error?.message || 'Failed to delete position.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete position.');
    } finally {
      setDeletingId(null);
    }
  };

  // Form State
  const [title, setTitle] = useState('');
  const [workplaceType, setWorkplaceType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [stipend, setStipend] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and role description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const res = await createPosition({
        title: title.trim(),
        workplace_type: workplaceType,
        location: location.trim(),
        duration: duration.trim(),
        stipend: stipend.trim(),
        description: description.trim(),
        responsibilities,
        requirements,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create internship.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Opportunity created as Draft & submitted for verification!');
      setIsSubmitting(false);
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMessage(null);
        setTitle('');
        setLocation('');
        setDuration('');
        setStipend('');
        setDescription('');
        setResponsibilitiesText('');
        setRequirementsText('');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating internship.');
      setIsSubmitting(false);
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

        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                Position Management
              </span>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mt-0.5">
                Your Managed Internships
              </h1>
            </div>

            <button
              onClick={() => {
                setShowCreateModal(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-brand-sky" />
              <span>Create New Position</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {internships.length === 0 ? (
              <div className="col-span-full bg-white p-8 sm:p-10 rounded-2xl sm:rounded-3xl border border-dashed border-brand-border text-center shadow-soft">
                <div className="w-14 h-14 rounded-xl bg-brand-canvas border border-brand-border flex items-center justify-center text-brand-sky mx-auto mb-3">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-navy mb-1.5">
                  No managed internships yet
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto mb-5">
                  You have not created any internship postings yet. Click &ldquo;Create New Position&rdquo; above to submit your first opportunity.
                </p>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-brand-sky" />
                  <span>Create Your First Position</span>
                </button>
              </div>
            ) : (
              internships.map((intern) => (
              <div
                key={intern.id}
                className="bg-white rounded-2xl p-5 border border-brand-border shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-brand-sky">{intern.department}</span>
                    {intern.status === 'published' ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Published
                      </span>
                    ) : intern.status === 'closed' ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Closed
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1.5">
                    {intern.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-1.5 text-xs text-brand-muted mb-3 font-medium">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                      {intern.type}
                    </span>
                    <span className="flex items-center gap-1 truncate font-bold text-brand-navy">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {intern.stipend.split('/')[0]}
                    </span>
                  </div>

                  <div className="p-2.5 bg-brand-canvas rounded-xl border border-brand-border/60 text-xs flex items-center justify-between mb-3">
                    <span className="text-brand-muted">Applications received:</span>
                    <span className="font-black text-brand-navy">{intern.applicantsCount} candidates</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-brand-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/internships/${intern.id}`}
                      className="text-xs font-bold text-brand-muted hover:text-brand-navy"
                    >
                      Public View
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === intern.id}
                      onClick={() => handleDelete(intern.id, intern.title)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 disabled:opacity-50"
                      title="Delete internship"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === intern.id ? '...' : 'Delete'}</span>
                    </button>
                  </div>

                  <Link
                    href="/dashboard/company/applications"
                    className="px-3.5 py-1.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1"
                  >
                    <span>View ATS Flow</span>
                    <ArrowRight className="w-3 h-3 text-brand-sky" />
                  </Link>
                </div>
              </div>
            )))}
          </div>

        </main>
      </div>

      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-float border border-brand-border overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-brand-canvas border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-base text-brand-navy">
                  Create & Publish New Internship
                </h3>
                <p className="text-[11px] text-brand-muted">
                  Post a verified opportunity directly into the InterConnect talent pool
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
                className="w-7 h-7 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-navy transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineering Intern"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Workplace Type
                  </label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    className="w-full px-4 py-3 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 3 Months (Summer Cohort)"
                    className="w-full px-4 py-3 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Monthly Stipend
                  </label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g., $1,500 / month"
                    className="w-full px-4 py-3 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Role Description & Scope *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the internship role, mentorship framework, and expected deliverables..."
                  className="w-full p-4 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Key Responsibilities (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    placeholder="e.g., Collaborate with senior developers on production code&#10;Participate in daily stand-ups and code reviews"
                    className="w-full p-3 rounded-2xl bg-brand-canvas border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Candidate Requirements (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="e.g., Pursuing Computer Science or related degree&#10;Proficiency with TypeScript and React"
                    className="w-full p-3 rounded-2xl bg-brand-canvas border border-brand-border text-xs text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight disabled:opacity-75 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
                      <span>Publishing Position...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-brand-sky" />
                      <span>Publish to Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
