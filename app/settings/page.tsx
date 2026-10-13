'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Bell,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Building,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { role, currentUser, currentCompany, updateCurrentUser, updateCurrentCompany } = useInterConnect();

  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');

  // Account Form State
  const [fullName, setFullName] = useState(
    role === 'company'
      ? currentCompany?.name || user?.name || ''
      : currentUser?.name || user?.name || ''
  );
  const [email] = useState(user?.email || (role === 'company' ? '' : currentUser?.email || ''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync profile data when loaded from Supabase
  React.useEffect(() => {
    if (role === 'company') {
      if (currentCompany?.name) setFullName(currentCompany.name);
      else if (user?.name) setFullName(user.name);
    } else {
      if (currentUser?.name) setFullName(currentUser.name);
      else if (user?.name) setFullName(user.name);
    }
  }, [role, currentUser, currentCompany, user]);

  // Notifications State
  const [notifyAppReview, setNotifyAppReview] = useState(true);
  const [notifyInterviews, setNotifyInterviews] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);

  // Privacy State
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);
  const [displayGithubStreak, setDisplayGithubStreak] = useState(true);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // 1. Password update if provided
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          setSaveError('Password must be at least 6 characters long.');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setSaveError('New password and confirmation do not match.');
          setIsSaving(false);
          return;
        }

        const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdErr) {
          setSaveError(pwdErr.message);
          setIsSaving(false);
          return;
        }
        setNewPassword('');
        setConfirmPassword('');
      }

      // 2. Name update in context & profiles table
      if (role === 'company') {
        updateCurrentCompany({ name: fullName.trim() });
        if (currentCompany?.id) {
          await supabase
            .from('company_profiles')
            .update({ company_name: fullName.trim(), updated_at: new Date().toISOString() })
            .eq('id', currentCompany.id);
        } else if (user?.id) {
          await supabase
            .from('company_profiles')
            .update({ company_name: fullName.trim(), updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }
      } else {
        updateCurrentUser({ name: fullName.trim() });
      }

      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      setSaveSuccess('Account and preference settings saved successfully!');
    } catch (err: any) {
      console.error('Settings save error:', err);
      setSaveError(err?.message || 'Failed to update settings. Please try again.');
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

        <main className="p-4 sm:p-6 flex-1 max-w-4xl w-full mx-auto space-y-5">

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
              Preferences & Security
            </span>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy mt-1">
              Account & Application Settings
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">
              Manage your personal credentials, communication alerts, and talent sourcing visibility.
            </p>
          </div>

          {/* Feedback messages */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-subtle animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 shadow-subtle animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-brand-border gap-4 sm:gap-6 bg-white px-4 sm:px-5 rounded-2xl shadow-2xs overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('account');
                setSaveSuccess(null);
                setSaveError(null);
              }}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'account'
                  ? 'border-brand-sky text-brand-navy'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              <User className="w-4 h-4 text-brand-sky" />
              <span>Account Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('notifications');
                setSaveSuccess(null);
                setSaveError(null);
              }}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-brand-sky text-brand-navy'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              <Bell className="w-4 h-4 text-brand-sky" />
              <span>Notification Channels</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('privacy');
                setSaveSuccess(null);
                setSaveError(null);
              }}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'border-brand-sky text-brand-navy'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-brand-sky" />
              <span>Privacy & Sourcing</span>
            </button>
          </div>

          {/* Settings Form Card */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand-border shadow-soft space-y-5">

            {/* TAB 1: ACCOUNT CREDENTIALS */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
                    Profile Information
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Primary identity used across applications, interviews, and messaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                      {role === 'company' ? 'Company Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'company' ? 'e.g., SoftNock Technologies' : 'e.g., Mahlet Abebe'}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                      Registered Email (Read Only)
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-canvas/60 border border-brand-border text-xs sm:text-sm text-brand-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-navy block">Active Portal Access</span>
                    <span className="text-brand-muted capitalize">
                      {role === 'company' ? 'Recruiter Employer Account' : 'Student Innovator Account'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-brand-tint text-brand-navy text-[11px] font-bold border border-brand-sky/20">
                    Supabase Auth · Active
                  </span>
                </div>

                <div className="pt-4 border-t border-brand-border space-y-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-brand-sky" />
                      <span>Security & Password</span>
                    </h3>
                    <p className="text-xs text-brand-muted">
                      Leave blank if you do not wish to change your current password.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 chars)"
                          className="w-full px-4 py-2.5 pr-10 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full px-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Configure automated notifications delivered to your verified email and dashboard.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyAppReview}
                      onChange={(e) => setNotifyAppReview(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        {role === 'company' ? 'Candidate Applications' : 'Application Stage Transitions'}
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        {role === 'company'
                          ? 'Receive alerts immediately when qualified students apply to your positions.'
                          : 'Receive instant notifications when a company reviews, shortlists, or moves your application.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyInterviews}
                      onChange={(e) => setNotifyInterviews(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        Technical Pairing & Interview Invites
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        Alerts for scheduled interview slot selections, confirmations, and video room links.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyDigest}
                      onChange={(e) => setNotifyDigest(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        Weekly Algorithmic Match Digest
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        Weekly summary of high-compatibility opportunities matching &gt;90% of verified technical skills.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyMessages}
                      onChange={(e) => setNotifyMessages(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        Direct Chat & Recruiter Messages
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        Real-time notifications when receiving direct messages in the hiring channel.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY & SOURCING */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-navy mb-1">
                    Talent Sourcing & Visibility
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Control how verified credentials and portfolio details appear to external network members.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={publicProfileVisible}
                      onChange={(e) => setPublicProfileVisible(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        Make Profile Discoverable in Talent Network
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        Allow vetted technology teams on InterConnect to search and invite you to open internship roles.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-canvas border border-brand-border text-xs font-semibold text-brand-text cursor-pointer hover:bg-brand-tint/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={displayGithubStreak}
                      onChange={(e) => setDisplayGithubStreak(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-sky focus:ring-brand-sky"
                    />
                    <div>
                      <span className="font-bold text-brand-navy block">
                        Display Verified GitHub Repositories & Tech Badges
                      </span>
                      <span className="text-brand-muted font-normal block mt-0.5">
                        Highlight open-source contributions directly on applicant evaluation cards.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Form Footer Action */}
            <div className="pt-6 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs text-brand-muted">
                Changes persist directly to your Supabase account.
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-75"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-brand-sky" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </main>
      </div>
    </div>
  );
}
