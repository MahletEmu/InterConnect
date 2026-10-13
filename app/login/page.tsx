'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { switchRole } = useInterConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleSelection, setRoleSelection] = useState<'student' | 'company'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const target = forgotEmail.trim() || email.trim();
      const { error } = await supabase.auth.resetPasswordForEmail(target);
      if (error) {
        setForgotError(error.message);
      } else {
        setForgotSuccess(`Password recovery email dispatched to ${target}. Please check your inbox.`);
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to dispatch recovery email.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid login credentials. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const resolvedRole: 'student' | 'company' = res.user?.role === 'company' ? 'company' : (res.user?.role === 'student' ? 'student' : roleSelection);
      switchRole(resolvedRole);
      if (resolvedRole === 'company') {
        router.push('/dashboard/company');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (role: 'student' | 'company') => {
    setRoleSelection(role);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-8 sm:py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-tint/60 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-sky/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-sky flex items-center justify-center shadow-subtle">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              <circle cx="6" cy="12" r="3" fill="#DDF5FB" />
              <circle cx="18" cy="6" r="3" fill="#4DB7D8" />
              <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
              <path d="M8.5 10.5L15.5 7.5M8.5 13.5L15.5 16.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy tracking-tight">
            Inter<span className="text-brand-sky">Connect</span>
          </span>
        </Link>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-brand-muted">
          Access your personalized opportunities and recruiter pipeline
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-float rounded-3xl border border-brand-border">

          {/* Role Segmented Switcher */}
          <div className="flex p-1 rounded-2xl bg-brand-canvas border border-brand-border mb-4">
            <button
              type="button"
              onClick={() => handlePresetSelect('student')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleSelection === 'student'
                  ? 'bg-brand-navy text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student / Intern</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('company')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roleSelection === 'company'
                  ? 'bg-brand-navy text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Company / Recruiter</span>
            </button>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g., mahlet@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                    setForgotSuccess(null);
                    setForgotError(null);
                  }}
                  className="text-xs font-semibold text-brand-sky hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-brand-border text-brand-sky focus:ring-brand-sky" />
                <span className="text-brand-muted font-medium">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-brand-navy hover:bg-brand-navyLight disabled:opacity-70 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2 mt-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to InterConnect</span>
                  <ArrowRight className="w-4 h-4 text-brand-sky" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-brand-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-brand-sky hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-4xl shadow-float border border-brand-border p-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="font-heading font-extrabold text-base text-brand-navy">
                Reset Account Password
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-brand-muted hover:text-brand-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g., mahlet@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <p className="text-xs text-brand-muted leading-relaxed">
                We will dispatch a secure password reset link to your email via Supabase Auth.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-75"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Email</span>
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
