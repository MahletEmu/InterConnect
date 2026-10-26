'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
  Moon,
} from 'lucide-react';
import {
  ETHIOPIAN_UNIVERSITIES,
  ETHIOPIAN_DEPARTMENTS,
  normalizeEthiopianUniversity,
  normalizeEthiopianDepartment,
  getMatchingUniversities,
  getMatchingDepartments,
} from '@/lib/data/ethiopia';

function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { switchRole, setRegisteredStudent } = useInterConnect();

  // Multi-step progressive flow: Step 1 (Account Essentials), Step 2 (Academic Details)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Account credentials
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: University & Department (Direct typing or Custom Other typing)
  const [studentUniversity, setStudentUniversity] = useState('');
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [customUni, setCustomUni] = useState('');

  const [studentDepartment, setStudentDepartment] = useState('');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDept, setCustomDept] = useState('');

  const [studentGradYear, setStudentGradYear] = useState('');

  // Search matches as user types
  const uniMatches = getMatchingUniversities(studentUniversity, 4);
  const deptMatches = getMatchingDepartments(studentDepartment, 4);

  // Password validation checks (must use at least 4 character types + min length 8)
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  // Validation & status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Validate step 1 and advance to step 2 with strict data type checking
  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    // 1. Full Name Validation: letters, spaces, hyphens only - no numbers or symbols
    const trimmedName = studentName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (trimmedName.length < 3) {
      setErrorMessage('Full name must be at least 3 characters long.');
      return;
    }
    if (/\d/.test(trimmedName)) {
      setErrorMessage('Full name cannot contain numbers. Please enter a valid name.');
      return;
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(trimmedName)) {
      setErrorMessage('Full name can only contain letters, spaces, and hyphens.');
      return;
    }

    // 2. Email Address Validation: strict email pattern
    const trimmedEmail = studentEmail.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 3. Password Validation: must be at least 8 chars and use all 4 character types
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setErrorMessage('Please use a strong password.');
      return;
    }

    setStep(2);
  };

  // Submit complete registration with strict Ethiopian University & Department verification
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    // 1. University Validation: must be an accredited/recognized Ethiopian university or a valid custom entry
    let effectiveUni = isCustomUni ? customUni.trim() : studentUniversity.trim();
    if (!effectiveUni) {
      setErrorMessage('Please enter your university or college.');
      return;
    }
    if (
      effectiveUni.toLowerCase() === 'other' ||
      effectiveUni.toLowerCase().startsWith('other university') ||
      effectiveUni.toLowerCase().startsWith('other college')
    ) {
      setIsCustomUni(true);
      setCustomUni('');
      setErrorMessage('Please type your actual university name.');
      return;
    }

    if (isCustomUni) {
      if (effectiveUni.length < 3) {
        setErrorMessage('University name must be at least 3 characters.');
        return;
      }
      if (/^\d+$/.test(effectiveUni)) {
        setErrorMessage('University name cannot be numbers only.');
        return;
      }
      if (!/[A-Za-z]/.test(effectiveUni)) {
        setErrorMessage('University name must contain letters.');
        return;
      }
    } else {
      const normalizedUni = normalizeEthiopianUniversity(effectiveUni);
      if (!normalizedUni) {
        setErrorMessage(
          "Please type Ethiopian university."
        );
        return;
      }
      effectiveUni = normalizedUni;
    }

    // 2. Department Validation: must be a recognized Ethiopian department or a valid custom entry
    let effectiveDept = isCustomDept ? customDept.trim() : studentDepartment.trim();
    if (!effectiveDept) {
      setErrorMessage('Please enter your department.');
      return;
    }
    if (effectiveDept.toLowerCase() === 'other') {
      setIsCustomDept(true);
      setCustomDept('');
      setErrorMessage('Please type your department.');
      return;
    }

    if (isCustomDept) {
      if (effectiveDept.length < 2) {
        setErrorMessage('Department name must be at least 2 characters.');
        return;
      }
      if (/^\d+$/.test(effectiveDept)) {
        setErrorMessage('Department name cannot be numbers only.');
        return;
      }
      if (!/[A-Za-z]/.test(effectiveDept)) {
        setErrorMessage('Department name must contain letters.');
        return;
      }
    } else {
      const normalizedDept = normalizeEthiopianDepartment(effectiveDept);
      if (!normalizedDept) {
        setErrorMessage(
          'Please type Ethiopian department.'
        );
        return;
      }
      effectiveDept = normalizedDept;
    }

    // 3. Graduation Year Validation: must be 2027 or later
    const trimmedYear = studentGradYear.trim();
    if (!trimmedYear) {
      setErrorMessage('Enter expected graduation year.');
      return;
    }
    if (!/^\d{4}$/.test(trimmedYear)) {
      setErrorMessage('Graduation year must be a 4-digit year.');
      return;
    }
    const yearVal = parseInt(trimmedYear, 10);
    if (yearVal < 2027) {
      setErrorMessage('Graduation year must be 2027 or later.');
      return;
    }
    if (yearVal > 2035) {
      setErrorMessage('Please enter a valid graduation year.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp({
        email: studentEmail.trim(),
        password,
        role: 'student',
        fullName: studentName.trim(),
        university: effectiveUni,
        fieldOfStudy: effectiveDept,
        graduationYear: studentGradYear.trim(),
        location: 'Ethiopia',
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete registration.');
        setIsSubmitting(false);
        return;
      }

      // Initialize student session in context with exact department & academic details
      setRegisteredStudent({
        fullName: studentName.trim(),
        email: studentEmail.trim(),
        university: effectiveUni,
        fieldOfStudy: effectiveDept,
        graduationYear: studentGradYear.trim(),
      });

      switchRole('student');
      router.push('/dashboard/student');
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during signup.');
      setIsSubmitting(false);
    }
  };

  // Social OAuth Handler with gentle feedback (no raw error popups)
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    const provName = provider === 'google' ? 'Google' : 'GitHub';

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/student` : undefined,
        },
      });

      if (error) {
        setSuccessInfo(`${provName} sign-in will be enabled soon. Please continue with email and password.`);
      }
    } catch {
      setSuccessInfo(`${provName} sign-in will be enabled soon. Please continue with email and password.`);
    }
  };

  return (
    <div className="bg-[#0e1424]/95 backdrop-blur-2xl border border-slate-800/90 py-7 px-6 sm:px-9 shadow-2xl shadow-black/80 rounded-3xl relative">
      {/* Error and Success alerts */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo && (
        <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* STEP 1: Account Essentials */}
      {step === 1 && (
        <form onSubmit={handleContinueToStep2} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Continue Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#00c5ff] hover:bg-[#1cd2ff] active:scale-[0.99] text-slate-950 font-bold text-sm shadow-[0_0_24px_rgba(0,197,255,0.35)] transition-all flex items-center justify-center gap-2 mt-5"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0e1424] px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Social Auth Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#070b14] hover:bg-[#131b2e] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#070b14] hover:bg-[#131b2e] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Link */}
          <div className="mt-6 pt-1 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#00c5ff] hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: University & Department (Clean Direct Typing - No Dropdowns or Slashing) */}
      {step === 2 && (
        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in-50 duration-200">
          {/* University - Direct input with Ethiopian autocomplete & Custom Other support */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                University
              </label>
              {isCustomUni ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomUni(false);
                    setCustomUni('');
                    setStudentUniversity('');
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  ← Choose from recognized list
                </button>
              ) : (
                <span className="text-[10px] text-cyan-400/80 font-medium">Ethiopian Institution</span>
              )}
            </div>

            {isCustomUni ? (
              <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                <div className="relative">
                  <Building className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customUni}
                    onChange={(e) => {
                      setCustomUni(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Type your university or college name (e.g. CPU College, Unity, St. Mary's)"
                    className="w-full bg-[#070b14] border border-cyan-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Enter your accredited Ethiopian college or university name.
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    list="ethiopian-universities-list"
                    autoComplete="off"
                    value={studentUniversity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val.toLowerCase() === 'other' ||
                        val.toLowerCase().startsWith('other university') ||
                        val.toLowerCase().startsWith('other college')
                      ) {
                        setIsCustomUni(true);
                        setCustomUni('');
                        setStudentUniversity('');
                      } else {
                        setStudentUniversity(val);
                      }
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Addis Ababa University (AAU) or AASTU"
                    className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
                  />
                  <datalist id="ethiopian-universities-list">
                    {ETHIOPIAN_UNIVERSITIES.filter((u) => u !== 'Other University / College').map((uni) => (
                      <option key={uni} value={uni} />
                    ))}
                  </datalist>
                </div>

                {/* Quick interactive search matches + Other button */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {uniMatches.map((matched) => (
                    <button
                      key={matched}
                      type="button"
                      onClick={() => {
                        setStudentUniversity(matched);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#11192e] hover:bg-[#1a2542] text-cyan-300 border border-cyan-800/40 transition-all text-left truncate max-w-full"
                    >
                      + {matched}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomUni(true);
                      setCustomUni('');
                      setStudentUniversity('');
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                  >
                    + Other (Type custom)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Department - Direct input with Ethiopian autocomplete & Custom Other support */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Department
              </label>
              {isCustomDept ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDept(false);
                    setCustomDept('');
                    setStudentDepartment('');
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  ← Choose from recognized list
                </button>
              ) : (
                <span className="text-[10px] text-cyan-400/80 font-medium">Academic Program</span>
              )}
            </div>

            {isCustomDept ? (
              <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customDept}
                    onChange={(e) => {
                      setCustomDept(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Type your specific field of study (e.g. Data Science, Mechatronics)"
                    className="w-full bg-[#070b14] border border-cyan-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Enter your field of study or department for matching internships.
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    list="ethiopian-departments-list"
                    autoComplete="off"
                    value={studentDepartment}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.toLowerCase() === 'other') {
                        setIsCustomDept(true);
                        setCustomDept('');
                        setStudentDepartment('');
                      } else {
                        setStudentDepartment(val);
                      }
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Software Engineering or Computer Science"
                    className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
                  />
                  <datalist id="ethiopian-departments-list">
                    {ETHIOPIAN_DEPARTMENTS.filter((d) => d !== 'Other').map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                {/* Quick interactive search matches + Other button */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {deptMatches.map((matched) => (
                    <button
                      key={matched}
                      type="button"
                      onClick={() => {
                        setStudentDepartment(matched);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#11192e] hover:bg-[#1a2542] text-cyan-300 border border-cyan-800/40 transition-all text-left truncate max-w-full"
                    >
                      + {matched}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDept(true);
                      setCustomDept('');
                      setStudentDepartment('');
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                  >
                    + Other (Type custom)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Graduation Year - Direct typing without dropdown, placeholder only, numeric-only */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Graduation Year
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                value={studentGradYear}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setStudentGradYear(digitsOnly);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. 2027"
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00c5ff] focus:ring-1 focus:ring-[#00c5ff] transition-all"
              />
            </div>
          </div>

          {/* Action Buttons: Back & Complete Registration */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep(1);
              }}
              className="px-4 py-3 rounded-xl bg-[#070b14] hover:bg-[#131b2e] border border-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-xl bg-[#00c5ff] hover:bg-[#1cd2ff] active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,197,255,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-10 sm:py-14 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00c5ff]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Moon toggle icon */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20">
        <button
          type="button"
          aria-label="Theme mode"
          className="w-10 h-10 rounded-full bg-[#0d1424] border border-slate-800 flex items-center justify-center text-[#00c5ff] shadow-sm hover:border-slate-700 transition-colors"
        >
          <Moon className="w-4 h-4 text-[#00c5ff]" />
        </button>
      </div>

      {/* Center Branding & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        {/* Brand Pill matching screenshot */}
        <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
          <div className="bg-white py-2 px-5 rounded-2xl shadow-lg inline-flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0a192f] to-[#00c5ff] flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                <circle cx="6" cy="12" r="3" fill="#DDF5FB" />
                <circle cx="18" cy="6" r="3" fill="#00C5FF" />
                <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
                <path d="M8.5 10.5L15.5 7.5M8.5 13.5L15.5 16.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="font-heading font-black text-sm tracking-tight text-slate-900">
                Inter<span className="text-[#00c5ff]">Connect</span>
              </span>
              <span className="text-[7.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                CONNECT · LEARN · GROW
              </span>
            </div>
          </div>
        </Link>

        {/* Title & Subtitle */}
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight mb-2">
          Student Registration
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-normal mb-6">
          Create your account to discover opportunities.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <Suspense fallback={<div className="text-center p-8 text-slate-400">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
