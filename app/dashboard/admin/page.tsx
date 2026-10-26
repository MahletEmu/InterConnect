'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import AdminGuard from '@/components/auth/AdminGuard';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import {
  fetchAdminStats,
  fetchAdminCompanies,
  verifyCompanyProfile,
  fetchAdminInternships,
  updateAdminInternshipStatus,
  createAdminInternship,
  fetchAdminApplications,
  moderateApplicationStatus,
  fetchApplicationHistory,
  AdminStats,
  AdminCompanyRecord,
} from '@/lib/services/adminService';
import { Internship, Application } from '@/types';
import {
  ShieldCheck,
  Building2,
  Briefcase,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Plus,
  ExternalLink,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Info,
  Check,
  X,
  History,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Active tab: 'overview' | 'companies' | 'internships' | 'applications'
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'internships' | 'applications'>('overview');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [companies, setCompanies] = useState<AdminCompanyRecord[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Filters & Search
  const [companySearch, setCompanySearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [internshipFilter, setInternshipFilter] = useState<'all' | 'published' | 'closed' | 'draft'>('all');
  const [internshipSearch, setInternshipSearch] = useState('');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');

  // Modals & Panels
  const [verificationModalCompany, setVerificationModalCompany] = useState<AdminCompanyRecord | null>(null);
  const [verificationNotesInput, setVerificationNotesInput] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newInternship, setNewInternship] = useState({
    companyProfileId: '',
    title: '',
    department: 'Software Engineering',
    location: 'Addis Ababa, Ethiopia',
    workplaceType: 'hybrid' as 'remote' | 'hybrid' | 'onsite',
    duration: '3 Months',
    stipend: 'Competitive Ethiopian Birr stipend',
    applicationDeadline: '',
    description: '',
    requirements: '',
    responsibilities: '',
    status: 'published' as 'published' | 'draft',
  });

  const [moderationModalApp, setModerationModalApp] = useState<Application | null>(null);
  const [moderationStatus, setModerationStatus] = useState<string>('reviewing');
  const [moderationReason, setModerationReason] = useState<string>('');
  const [historyModalApp, setHistoryModalApp] = useState<Application | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load Admin Data
  const loadAllAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [statsRes, companiesRes, internshipsRes, appsRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminCompanies(),
        fetchAdminInternships(),
        fetchAdminApplications(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
      if (internshipsRes.data) setInternships(internshipsRes.data);
      if (appsRes.data) setApplications(appsRes.data);

      if (statsRes.error || companiesRes.error || internshipsRes.error || appsRes.error) {
        const anyErr = statsRes.error || companiesRes.error || internshipsRes.error || appsRes.error;
        console.warn('Admin data load warning:', anyErr);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize administrative dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.industry.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.location.toLowerCase().includes(companySearch.toLowerCase());

      if (!matchesSearch) return false;
      if (companyFilter === 'verified') return c.isVerified;
      if (companyFilter === 'pending') return !c.isVerified;
      return true;
    });
  }, [companies, companySearch, companyFilter]);

  // Filtered Internships
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const companyName = item.company?.name || '';
      const matchesSearch =
        item.title.toLowerCase().includes(internshipSearch.toLowerCase()) ||
        companyName.toLowerCase().includes(internshipSearch.toLowerCase()) ||
        item.department.toLowerCase().includes(internshipSearch.toLowerCase());

      if (!matchesSearch) return false;

      const isClosedOrExpired = item.status === 'closed' || Boolean(item.isExpired);
      if (internshipFilter === 'published') return item.status === 'published' && !item.isExpired;
      if (internshipFilter === 'closed') return isClosedOrExpired;
      if (internshipFilter === 'draft') return item.status === 'draft';
      return true;
    });
  }, [internships, internshipSearch, internshipFilter]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const studentName = (app as any).studentName || (app as any).applicantName || 'Student';
      const companyName = (app as any).companyName || '';
      const matchesSearch =
        studentName.toLowerCase().includes(applicationSearch.toLowerCase()) ||
        companyName.toLowerCase().includes(applicationSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (applicationFilter === 'all') return true;
      return (app.status || '').toLowerCase() === applicationFilter.toLowerCase();
    });
  }, [applications, applicationSearch, applicationFilter]);

  // Handle Verification Action
  const handleToggleVerification = async (company: AdminCompanyRecord, newStatus: boolean) => {
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const res = await verifyCompanyProfile(
      company.id,
      newStatus,
      verificationNotesInput || undefined,
      user?.id
    );

    setActionLoading(false);
    if (!res.success) {
      setErrorMessage(`Verification update failed: ${res.error}. Ensure database migration has been applied.`);
    } else {
      setSuccessNotice(`Company "${company.name}" has been marked as ${newStatus ? 'VERIFIED' : 'PENDING'}.`);
      setVerificationModalCompany(null);
      setVerificationNotesInput('');
      await loadAllAdminData();
    }
  };

  // Handle Internship Status Change (Publish / Close)
  const handleUpdateInternshipStatus = async (internshipId: string, newStatus: 'published' | 'closed' | 'draft') => {
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const res = await updateAdminInternshipStatus(internshipId, newStatus);
    setActionLoading(false);

    if (!res.success) {
      setErrorMessage(`Failed to update listing: ${res.error}`);
    } else {
      setSuccessNotice(`Internship position updated to "${newStatus.toUpperCase()}".`);
      await loadAllAdminData();
    }
  };

  // Handle Create Internship
  const handleCreateInternshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternship.title.trim()) {
      setErrorMessage('Internship title is required.');
      return;
    }
    if (!newInternship.companyProfileId) {
      setErrorMessage('Please select a company to associate with this listing.');
      return;
    }
    if (!newInternship.applicationDeadline) {
      setErrorMessage('An application deadline is required.');
      return;
    }

    const deadlineDate = new Date(newInternship.applicationDeadline);
    if (deadlineDate <= new Date()) {
      setErrorMessage('Application deadline must be a future date.');
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const reqsList = newInternship.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const respsList = newInternship.responsibilities
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const res = await createAdminInternship({
      companyProfileId: newInternship.companyProfileId,
      title: newInternship.title.trim(),
      department: newInternship.department,
      location: newInternship.location,
      workplaceType: newInternship.workplaceType,
      duration: newInternship.duration,
      stipend: newInternship.stipend,
      applicationDeadline: newInternship.applicationDeadline,
      description: newInternship.description.trim(),
      requirements: reqsList,
      responsibilities: respsList,
      status: newInternship.status,
    });

    setActionLoading(false);
    if (res.error) {
      setErrorMessage(`Failed to create listing: ${res.error}`);
    } else {
      setSuccessNotice(`Internship "${newInternship.title}" successfully created!`);
      setCreateModalOpen(false);
      setNewInternship({
        companyProfileId: '',
        title: '',
        department: 'Software Engineering',
        location: 'Addis Ababa, Ethiopia',
        workplaceType: 'hybrid',
        duration: '3 Months',
        stipend: 'Competitive Ethiopian Birr stipend',
        applicationDeadline: '',
        description: '',
        requirements: '',
        responsibilities: '',
        status: 'published',
      });
      await loadAllAdminData();
    }
  };

  // Handle Application Moderation
  const handleModerateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderationModalApp) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const res = await moderateApplicationStatus(
      moderationModalApp.id,
      moderationStatus as any,
      user?.id,
      moderationReason
    );

    setActionLoading(false);
    if (!res.success) {
      setErrorMessage(`Moderation update failed: ${res.error}`);
    } else {
      setSuccessNotice(`Application status updated to "${moderationStatus.toUpperCase()}". Recorded in status history.`);
      setModerationModalApp(null);
      setModerationReason('');
      await loadAllAdminData();
    }
  };

  // Open History Modal
  const openHistoryModal = async (app: Application) => {
    setHistoryModalApp(app);
    setLoadingHistory(true);
    const res = await fetchApplicationHistory(app.id);
    setLoadingHistory(false);
    setHistoryList(res.data);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-canvas flex">
        {/* Sidebar */}
        <DashboardSidebar
          mobileOpen={mobileSidebar}
          onCloseMobile={() => setMobileSidebar(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <DashboardTopbar onToggleMobileMenu={() => setMobileSidebar(!mobileSidebar)} />

          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-brand-border shadow-soft">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-sky flex items-center justify-center text-white shadow-subtle shrink-0">
                  <ShieldCheck className="w-7 h-7 text-brand-sky" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      Restricted Access
                    </span>
                    <span className="text-xs font-bold text-brand-muted">
                      Admin: {user?.email}
                    </span>
                  </div>
                  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mt-1">
                    Administration & Verification Portal
                  </h1>
                  <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                    Stage F: Company verification, genuine internship listings, and honest application status moderation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto">
                <button
                  type="button"
                  onClick={loadAllAdminData}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl border border-brand-border bg-brand-canvas hover:bg-brand-tint/60 text-xs font-bold text-brand-navy flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Real Data</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed flex-1">
                  <span className="font-bold">Notice:</span> {errorMessage}
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {successNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed flex-1">
                  <span className="font-bold">Success:</span> {successNotice}
                </div>
                <button
                  onClick={() => setSuccessNotice(null)}
                  className="text-emerald-500 hover:text-emerald-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-brand-border pb-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'text-brand-muted hover:text-brand-navy hover:bg-white'
                }`}
              >
                <span>Analytics Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('companies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'companies'
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'text-brand-muted hover:text-brand-navy hover:bg-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Company Verification</span>
                <span className="bg-brand-sky/20 text-brand-navy text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {companies.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('internships')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'internships'
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'text-brand-muted hover:text-brand-navy hover:bg-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Internship Listings</span>
                <span className="bg-brand-sky/20 text-brand-navy text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {internships.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'applications'
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'text-brand-muted hover:text-brand-navy hover:bg-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Application Moderation</span>
                <span className="bg-brand-sky/20 text-brand-navy text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {applications.length}
                </span>
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Real Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-muted">
                        Total Companies
                      </p>
                      <h3 className="text-2xl font-black text-brand-navy mt-0.5">
                        {stats?.totalCompanies ?? companies.length}
                      </h3>
                      <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        {stats?.verifiedCompanies ?? companies.filter((c) => c.isVerified).length} verified presence
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-muted">
                        Open Internships
                      </p>
                      <h3 className="text-2xl font-black text-brand-navy mt-0.5">
                        {stats?.publishedInternships ?? 0}
                      </h3>
                      <p className="text-[11px] text-brand-muted font-bold mt-0.5">
                        {stats?.closedInternships ?? 0} closed/expired
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-muted">
                        Total Applications
                      </p>
                      <h3 className="text-2xl font-black text-brand-navy mt-0.5">
                        {stats?.totalApplications ?? applications.length}
                      </h3>
                      <p className="text-[11px] text-brand-muted font-bold mt-0.5">
                        Across all Ethiopian student accounts
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-soft flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-muted">
                        Pending Verification
                      </p>
                      <h3 className="text-2xl font-black text-brand-navy mt-0.5">
                        {companies.filter((c) => !c.isVerified).length}
                      </h3>
                      <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                        Awaiting administrator review
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety & Honest Platform Guidelines */}
                <div className="bg-gradient-to-br from-brand-sky/10 via-brand-tint/30 to-white rounded-3xl p-6 border border-brand-sky/30 space-y-3">
                  <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                    <Info className="w-4 h-4 text-brand-sky" />
                    <span>Administrator Ethics & Safety Policy</span>
                  </div>
                  <ul className="text-xs text-brand-muted space-y-1.5 list-disc pl-5">
                    <li>
                      <strong>Genuine Companies Only:</strong> Never mark a company as verified unless you have checked its Ethiopian presence, legal or physical address, and official domain/contact.
                    </li>
                    <li>
                      <strong>Zero Fabricated Vacancies:</strong> Never invent fake internship positions or fabricated salaries. Only publish roles backed by confirmed opportunities.
                    </li>
                    <li>
                      <strong>Moderation Transparency:</strong> Status moderation on InterConnect serves as administrative application record-keeping since companies do not have accounts in the initial release. Status changes must never be claimed to be direct employer promises.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. COMPANIES TAB */}
            {activeTab === 'companies' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search company by name, industry, or city..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs focus:outline-none focus:border-brand-sky"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-muted font-bold shrink-0">Status:</span>
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs font-bold text-brand-navy focus:outline-none"
                    >
                      <option value="all">All Companies ({companies.length})</option>
                      <option value="verified">Verified Only ({companies.filter((c) => c.isVerified).length})</option>
                      <option value="pending">Pending Verification ({companies.filter((c) => !c.isVerified).length})</option>
                    </select>
                  </div>
                </div>

                {/* Companies List Table */}
                <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-canvas/60 text-[11px] font-extrabold uppercase tracking-wider text-brand-muted">
                          <th className="py-3 px-5">Company</th>
                          <th className="py-3 px-4">Industry & City</th>
                          <th className="py-3 px-4">Official Website</th>
                          <th className="py-3 px-4">Verification Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {filteredCompanies.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-brand-muted">
                              No companies match the current search or filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredCompanies.map((comp) => (
                            <tr key={comp.id} className="hover:bg-brand-canvas/40 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-brand-tint flex items-center justify-center text-lg font-bold shrink-0">
                                    {comp.logo.startsWith('http') ? (
                                      <img src={comp.logo} alt={comp.name} className="w-8 h-8 rounded-lg object-contain" />
                                    ) : (
                                      comp.logo
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-brand-navy flex items-center gap-1.5">
                                      <span>{comp.name}</span>
                                      {comp.isVerified && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      )}
                                    </div>
                                    <span className="text-[11px] text-brand-muted">
                                      {comp.companySize || 'Size not stated'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-brand-navy font-semibold">{comp.industry}</div>
                                <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-brand-sky shrink-0" />
                                  <span>{comp.location}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                {comp.website ? (
                                  <a
                                    href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-sky hover:underline flex items-center gap-1 font-semibold"
                                  >
                                    <span className="truncate max-w-[150px]">{comp.website.replace(/^https?:\/\//, '')}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-brand-muted text-[11px]">No official domain</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {comp.isVerified ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Verified
                                    </span>
                                    {comp.verificationNotes && (
                                      <p className="text-[10px] text-brand-muted line-clamp-1 italic">
                                        "{comp.verificationNotes}"
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    Pending Review
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {comp.profileId === 'verified-directory-partner' ? (
                                    <span className="text-[11px] text-brand-muted italic">
                                      Directory Partner
                                    </span>
                                  ) : comp.isVerified ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVerification(comp, false)}
                                      disabled={actionLoading}
                                      className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors"
                                    >
                                      Revoke
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVerificationModalCompany(comp);
                                        setVerificationNotesInput('');
                                      }}
                                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                                    >
                                      Verify
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INTERNSHIPS TAB */}
            {activeTab === 'internships' && (
              <div className="space-y-4">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search listings by title, employer, or field..."
                      value={internshipSearch}
                      onChange={(e) => setInternshipSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs focus:outline-none focus:border-brand-sky"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={internshipFilter}
                      onChange={(e) => setInternshipFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs font-bold text-brand-navy focus:outline-none"
                    >
                      <option value="all">All Listings ({internships.length})</option>
                      <option value="published">Published / Open</option>
                      <option value="closed">Closed / Expired</option>
                      <option value="draft">Drafts</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold flex items-center gap-1.5 shadow-soft transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-sky" />
                      <span>Post Verified Listing</span>
                    </button>
                  </div>
                </div>

                {/* Internships Table */}
                <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-canvas/60 text-[11px] font-extrabold uppercase tracking-wider text-brand-muted">
                          <th className="py-3 px-5">Position & Company</th>
                          <th className="py-3 px-4">Field & Location</th>
                          <th className="py-3 px-4">Application Deadline</th>
                          <th className="py-3 px-4">Current Status</th>
                          <th className="py-3 px-4 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {filteredInternships.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-brand-muted">
                              No internship listings found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredInternships.map((internship) => {
                            const isPastDeadline = Boolean(
                              internship.applicationDeadline &&
                              new Date(internship.applicationDeadline) < new Date()
                            );

                            return (
                              <tr key={internship.id} className="hover:bg-brand-canvas/40 transition-colors">
                                <td className="py-3.5 px-5">
                                  <div className="font-bold text-brand-navy">{internship.title}</div>
                                  <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3 text-brand-sky" />
                                    <span>{internship.company?.name || 'Partner Company'}</span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="text-brand-navy font-semibold">{internship.department}</div>
                                  <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-brand-sky" />
                                    <span>
                                      {internship.location} • {internship.type}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-brand-muted" />
                                    <span
                                      className={`font-semibold ${
                                        isPastDeadline ? 'text-rose-600 line-through' : 'text-brand-navy'
                                      }`}
                                    >
                                      {internship.applicationDeadline
                                        ? new Date(internship.applicationDeadline).toLocaleDateString()
                                        : 'Open until filled'}
                                    </span>
                                  </div>
                                  {isPastDeadline && (
                                    <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                                      Passed Deadline
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  {internship.status === 'published' && !isPastDeadline ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Published (Open)
                                    </span>
                                  ) : internship.status === 'closed' || isPastDeadline ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">
                                      <XCircle className="w-3 h-3" />
                                      Closed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3 h-3" />
                                      Draft
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {internship.status !== 'published' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateInternshipStatus(internship.id, 'published')}
                                        disabled={actionLoading || isPastDeadline}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors disabled:opacity-40"
                                      >
                                        Publish
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateInternshipStatus(internship.id, 'closed')}
                                        disabled={actionLoading}
                                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-bold transition-colors"
                                      >
                                        Close
                                      </button>
                                    )}

                                    <Link
                                      href={`/internships/${internship.id}`}
                                      target="_blank"
                                      className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas transition-colors"
                                      title="Preview Listing"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPLICATIONS MODERATION TAB */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {/* Moderation Transparency Notice */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wide block mb-0.5">
                      Administrative Application Moderation Notice
                    </span>
                    Because companies do not have accounts in this initial student-first release, status changes recorded here are administrative tracking actions on student records, not direct employer feedback. All changes are logged in the <code>application_status_history</code> audit trail.
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search applications by student name or employer..."
                      value={applicationSearch}
                      onChange={(e) => setApplicationSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs focus:outline-none focus:border-brand-sky"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={applicationFilter}
                      onChange={(e) => setApplicationFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-brand-canvas border border-brand-border text-xs font-bold text-brand-navy focus:outline-none"
                    >
                      <option value="all">All Application Statuses ({applications.length})</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview Scheduled</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-canvas/60 text-[11px] font-extrabold uppercase tracking-wider text-brand-muted">
                          <th className="py-3 px-5">Student Applicant</th>
                          <th className="py-3 px-4">Target Opportunity</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4">Current Status</th>
                          <th className="py-3 px-4 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border text-xs">
                        {filteredApplications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-brand-muted">
                              No student applications found.
                            </td>
                          </tr>
                        ) : (
                          filteredApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-brand-canvas/40 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="font-bold text-brand-navy">
                                  {(app as any).studentName || (app as any).applicantName || 'Student Applicant'}
                                </div>
                                <div className="text-[11px] text-brand-muted">
                                  {(app as any).studentUniversity || 'Ethiopian University'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-brand-navy">
                                  {(app as any).internshipTitle || 'Internship Position'}
                                </div>
                                <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-brand-sky" />
                                  <span>{(app as any).companyName || 'Registered Partner'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-brand-navy">
                                  {app.submittedAt
                                    ? new Date(app.submittedAt).toLocaleDateString()
                                    : 'Recent'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-tint text-brand-navy">
                                  {app.status || 'Submitted'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openHistoryModal(app)}
                                    className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas transition-colors"
                                    title="View Status History"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModerationModalApp(app);
                                      setModerationStatus(app.status?.toLowerCase() || 'reviewing');
                                      setModerationReason('');
                                    }}
                                    className="px-3 py-1 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white text-[11px] font-bold shadow-2xs transition-colors"
                                  >
                                    Update Status
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: COMPANY VERIFICATION */}
            {verificationModalCompany && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-brand-border shadow-float space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                        Verify Company Presence
                      </h3>
                    </div>
                    <button
                      onClick={() => setVerificationModalCompany(null)}
                      className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-brand-canvas rounded-2xl p-4 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-brand-navy">Company:</span>{' '}
                      {verificationModalCompany.name}
                    </div>
                    <div>
                      <span className="font-bold text-brand-navy">Industry:</span>{' '}
                      {verificationModalCompany.industry}
                    </div>
                    <div>
                      <span className="font-bold text-brand-navy">Location:</span>{' '}
                      {verificationModalCompany.location}
                    </div>
                    <div>
                      <span className="font-bold text-brand-navy">Website:</span>{' '}
                      {verificationModalCompany.website || 'No website supplied'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Verification Evidence & Audit Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={verificationNotesInput}
                      onChange={(e) => setVerificationNotesInput(e.target.value)}
                      placeholder="e.g. Verified official business domain, physical headquarters in Bole, Addis Ababa, and public registry."
                      className="w-full p-3 rounded-xl bg-brand-canvas border border-brand-border text-xs focus:outline-none focus:border-brand-sky"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerificationModalCompany(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:bg-brand-canvas"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleVerification(verificationModalCompany, true)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-colors disabled:opacity-50"
                    >
                      Confirm Verification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: CREATE VERIFIED INTERNSHIP */}
            {createModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-brand-border shadow-float space-y-4 my-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-brand-sky" />
                      <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                        Post Verified Internship Opportunity
                      </h3>
                    </div>
                    <button
                      onClick={() => setCreateModalOpen(false)}
                      className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateInternshipSubmit} className="space-y-4 text-xs">
                    {/* Company Selection */}
                    <div>
                      <label className="block font-bold text-brand-navy mb-1">
                        Select Employer / Company *
                      </label>
                      <select
                        value={newInternship.companyProfileId}
                        onChange={(e) =>
                          setNewInternship({ ...newInternship, companyProfileId: e.target.value })
                        }
                        required
                        className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold text-brand-navy focus:outline-none focus:border-brand-sky"
                      >
                        <option value="">-- Choose registered company --</option>
                        {companies
                          .filter((c) => c.profileId !== 'verified-directory-partner')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.isVerified ? '✓ (Verified)' : '(Pending Verification)'}
                            </option>
                          ))}
                      </select>
                      <p className="text-[10px] text-brand-muted mt-1">
                        Select a company profile created in Supabase database.
                      </p>
                    </div>

                    {/* Title & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-brand-navy mb-1">Position Title *</label>
                        <input
                          type="text"
                          required
                          value={newInternship.title}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, title: e.target.value })
                          }
                          placeholder="e.g. Junior Frontend Engineering Intern"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-brand-navy mb-1">Field / Department *</label>
                        <select
                          value={newInternship.department}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, department: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        >
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Accounting & Finance">Accounting & Finance</option>
                          <option value="Management">Management</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Economics">Economics</option>
                          <option value="Law">Law</option>
                          <option value="Health Sciences">Health Sciences</option>
                        </select>
                      </div>
                    </div>

                    {/* Location, Type, Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-brand-navy mb-1">Location *</label>
                        <input
                          type="text"
                          required
                          value={newInternship.location}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, location: e.target.value })
                          }
                          placeholder="e.g. Addis Ababa, Ethiopia"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-brand-navy mb-1">Work Arrangement</label>
                        <select
                          value={newInternship.workplaceType}
                          onChange={(e) =>
                            setNewInternship({
                              ...newInternship,
                              workplaceType: e.target.value as any,
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        >
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">On-Site</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-brand-navy mb-1">Duration</label>
                        <input
                          type="text"
                          value={newInternship.duration}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, duration: e.target.value })
                          }
                          placeholder="e.g. 3 Months"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                    </div>

                    {/* Deadline & Stipend */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-brand-navy mb-1">
                          Application Deadline *
                        </label>
                        <input
                          type="date"
                          required
                          value={newInternship.applicationDeadline}
                          onChange={(e) =>
                            setNewInternship({
                              ...newInternship,
                              applicationDeadline: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-brand-navy mb-1">
                          Compensation / Stipend
                        </label>
                        <input
                          type="text"
                          value={newInternship.stipend}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, stipend: e.target.value })
                          }
                          placeholder="e.g. 4,000 ETB / month or Unpaid"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-semibold focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-bold text-brand-navy mb-1">Role Description *</label>
                      <textarea
                        rows={3}
                        required
                        value={newInternship.description}
                        onChange={(e) =>
                          setNewInternship({ ...newInternship, description: e.target.value })
                        }
                        placeholder="Detailed overview of the internship role..."
                        className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border focus:outline-none focus:border-brand-sky"
                      />
                    </div>

                    {/* Requirements & Responsibilities (one per line) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-brand-navy mb-1">
                          Requirements (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={newInternship.requirements}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, requirements: e.target.value })
                          }
                          placeholder="Proficiency in React / TypeScript&#10;Current university student in Ethiopia"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border focus:outline-none focus:border-brand-sky"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-brand-navy mb-1">
                          Responsibilities (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={newInternship.responsibilities}
                          onChange={(e) =>
                            setNewInternship({ ...newInternship, responsibilities: e.target.value })
                          }
                          placeholder="Collaborate with engineering team&#10;Build responsive UI components"
                          className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                    </div>

                    {/* Initial Status */}
                    <div className="flex items-center gap-4 pt-1">
                      <span className="font-bold text-brand-navy">Initial Status:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="listingStatus"
                          checked={newInternship.status === 'published'}
                          onChange={() => setNewInternship({ ...newInternship, status: 'published' })}
                        />
                        <span>Publish immediately (Open)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="listingStatus"
                          checked={newInternship.status === 'draft'}
                          onChange={() => setNewInternship({ ...newInternship, status: 'draft' })}
                        />
                        <span>Save as Draft</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                      <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        className="px-4 py-2 rounded-xl font-bold text-brand-muted hover:bg-brand-canvas"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-bold shadow-soft transition-colors disabled:opacity-50"
                      >
                        Save & Post Opportunity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: APPLICATION MODERATION */}
            {moderationModalApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-brand-border shadow-float space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-brand-navy" />
                      <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                        Moderate Application Status
                      </h3>
                    </div>
                    <button
                      onClick={() => setModerationModalApp(null)}
                      className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleModerateApplication} className="space-y-4 text-xs">
                    <div className="bg-brand-canvas rounded-2xl p-4 space-y-1.5">
                      <div>
                        <span className="font-bold text-brand-navy">Applicant:</span>{' '}
                        {(moderationModalApp as any).studentName || 'Student'}
                      </div>
                      <div>
                        <span className="font-bold text-brand-navy">Opportunity:</span>{' '}
                        {(moderationModalApp as any).internshipTitle || 'Position'}
                      </div>
                      <div>
                        <span className="font-bold text-brand-navy">Current Status:</span>{' '}
                        <span className="uppercase font-extrabold text-brand-sky">
                          {moderationModalApp.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-brand-navy mb-1.5">
                        New Application Status *
                      </label>
                      <select
                        value={moderationStatus}
                        onChange={(e) => setModerationStatus(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border font-bold text-brand-navy focus:outline-none focus:border-brand-sky"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewing">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview Scheduled</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-brand-navy mb-1.5">
                        Internal Moderation Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        placeholder="Audit reasoning for moderation action..."
                        className="w-full p-2.5 rounded-xl bg-brand-canvas border border-brand-border focus:outline-none focus:border-brand-sky"
                      />
                    </div>

                    <p className="text-[10px] text-brand-muted leading-relaxed italic">
                      This change will be appended to <code>application_status_history</code> and visible in the student's application tracking timeline.
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                      <button
                        type="button"
                        onClick={() => setModerationModalApp(null)}
                        className="px-4 py-2 rounded-xl font-bold text-brand-muted hover:bg-brand-canvas"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-bold shadow-soft transition-colors disabled:opacity-50"
                      >
                        Update & Log Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: APPLICATION STATUS HISTORY AUDIT */}
            {historyModalApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-brand-border shadow-float space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-brand-navy" />
                      <h3 className="font-heading font-extrabold text-base text-brand-navy">
                        Application Status Audit Trail
                      </h3>
                    </div>
                    <button
                      onClick={() => setHistoryModalApp(null)}
                      className="p-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-canvas"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loadingHistory ? (
                    <div className="py-8 text-center text-xs text-brand-muted">
                      Loading audit trail from database...
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-brand-muted">
                      No status transitions recorded yet for this application.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {historyList.map((hist) => (
                        <div
                          key={hist.id}
                          className="p-3 rounded-2xl bg-brand-canvas border border-brand-border text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black uppercase tracking-wider text-brand-navy">
                              {hist.new_status}
                            </span>
                            <span className="text-[10px] text-brand-muted">
                              {new Date(hist.changed_at).toLocaleString()}
                            </span>
                          </div>
                          {hist.old_status && (
                            <p className="text-[11px] text-brand-muted">
                              Transitioned from: <span className="font-semibold">{hist.old_status}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-brand-border">
                    <button
                      type="button"
                      onClick={() => setHistoryModalApp(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-canvas hover:bg-brand-border text-brand-navy"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
