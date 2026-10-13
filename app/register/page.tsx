'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  GraduationCap,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'company' ? 'company' : 'student';

  const { signUp } = useAuth();
  const { switchRole } = useInterConnect();
  const [role, setRole] = useState<'student' | 'company'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentUniversity, setStudentUniversity] = useState('');
  const [studentField, setStudentField] = useState('');
  const [studentGradYear, setStudentGradYear] = useState('2026');

  // Company form state
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Enterprise Software & Cloud');
  const [companySize, setCompanySize] = useState('100 - 250 employees');
  const [companyLocation, setCompanyLocation] = useState('');

  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setIsSubmitting(true);

    try {
      let res;
      if (role === 'student') {
        res = await signUp({
          email: studentEmail,
          password,
          role: 'student',
          fullName: studentName,
          university: studentUniversity,
          fieldOfStudy: studentField,
          graduationYear: studentGradYear,
        });
      } else {
        res = await signUp({
          email: companyEmail,
          password,
          role: 'company',
          fullName: companyName,
          companyName: companyName,
          industry: companyIndustry,
          companySize: companySize,
          location: companyLocation,
        });
      }

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete registration.');
        setIsSubmitting(false);
        return;
      }

      if (res.requiresEmailConfirmation) {
        setSuccessInfo('Registration successful! Please check your email inbox to confirm your account.');
        setIsSubmitting(false);
        return;
      }

      switchRole(role);
      if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/company');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during signup.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-6 px-5 sm:px-8 shadow-float rounded-3xl border border-brand-border">
      {/* Role Choice Switcher */}
      <div className="flex p-1 rounded-2xl bg-brand-canvas border border-brand-border mb-4">
        <button
          type="button"
          onClick={() => {
            setRole('student');
            setErrorMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            role === 'student'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-muted hover:text-brand-navy'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>I&apos;m a Student / Intern</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('company');
            setErrorMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            role === 'company'
              ? 'bg-brand-navy text-white shadow-2xs'
              : 'text-brand-muted hover:text-brand-navy'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>I&apos;m a Company / Recruiter</span>
        </button>
      </div>

      {/* Error and Success alerts */}
      {errorMessage && (
        <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo && (
        <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successInfo}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        {role === 'student' ? (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g., Mahlet Abebe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                University Email
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g., mahlet@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  University
                </label>
                <input
                  type="text"
                  required
                  value={studentUniversity}
                  onChange={(e) => setStudentUniversity(e.target.value)}
                  placeholder="e.g., Bahir Dar University"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Major / Field
                </label>
                <input
                  type="text"
                  required
                  value={studentField}
                  onChange={(e) => setStudentField(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Expected Graduation Year
              </label>
              <select
                value={studentGradYear}
                onChange={(e) => setStudentGradYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., SoftNock Technologies"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="e.g., recruiting@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Industry
                </label>
                <select
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                >
                  <option value="Enterprise Software & Cloud">Enterprise Software & Cloud</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Design & HCI">Design & HCI</option>
                  <option value="Fintech">Fintech</option>
                  <option value="CleanTech">CleanTech</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Company Size
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                >
                  <option value="1 - 50 employees">1 - 50 employees</option>
                  <option value="50 - 250 employees">50 - 250 employees</option>
                  <option value="250 - 1000 employees">250 - 1000 employees</option>
                  <option value="1000+ employees">1000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                Primary Office Location
              </label>
              <input
                type="text"
                required
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="e.g., Addis Ababa, Ethiopia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password (min 6 chars)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
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

        <p className="text-[11px] text-brand-muted">
          By creating an account, you agree to InterConnect’s Terms of Service and Privacy Policy.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-brand-navy hover:bg-brand-navyLight disabled:opacity-75 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
              <span>Creating Your Profile...</span>
            </>
          ) : (
            <>
              <span>{role === 'student' ? 'Create Student Profile' : 'Register Company Profile'}</span>
              <ArrowRight className="w-4 h-4 text-brand-sky" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-brand-muted">
        Already registered?{' '}
        <Link href="/login" className="font-bold text-brand-sky hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-8 sm:py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-tint/60 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-sky/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
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
          Join InterConnect
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-brand-muted">
          Connect your talent with top forward-thinking companies
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center p-8 text-brand-muted">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
