'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Internship, Application } from '@/types';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { useAuth } from '@/lib/context/AuthContext';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Send,
  Loader2,
  Lock,
} from 'lucide-react';

interface ApplicationWizardProps {
  internship: Internship;
  onClose: () => void;
}

export default function ApplicationWizard({ internship, onClose }: ApplicationWizardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentUser, submitApplication } = useInterConnect();

  const [step, setStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');

  const [university, setUniversity] = useState(currentUser?.university || '');
  const [degree, setDegree] = useState(currentUser?.degree || '');
  const [gradYear, setGradYear] = useState(currentUser?.gradYear ? String(currentUser.gradYear) : '2026');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(internship.requiredSkills);

  const [resumeName, setResumeName] = useState(
    currentUser?.resumeUrl ? (currentUser.name ? `${currentUser.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Uploaded_Resume.pdf') : ''
  );
  const [coverLetter, setCoverLetter] = useState('');

  // Sync with genuine user profile if loaded dynamically
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.email && !email) setEmail(currentUser.email);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.location && !location) setLocation(currentUser.location);
      if (currentUser.university && !university) setUniversity(currentUser.university);
      if (currentUser.degree && !degree) setDegree(currentUser.degree);
      if (currentUser.gradYear && !gradYear) setGradYear(String(currentUser.gradYear));
      if (currentUser.resumeUrl && !resumeName) {
        setResumeName(currentUser.name ? `${currentUser.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Uploaded_Resume.pdf');
      }
    }
  }, [currentUser]);

  const stepsTitle = [
    'Personal Info',
    'Education',
    'Skills Match',
    'Resume File',
    'Cover Note',
    'Review Submission',
  ];

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const app = await submitApplication(internship.id, {
          fullName,
          email,
          phone,
          university,
          degree,
          gradYear,
          skills: selectedSkills,
          resumeName,
          coverLetter,
          resumeFile: selectedFile || undefined,
        });
        setSubmittedApp(app);
        setStep(7); // Success step
      } catch (err) {
        console.error('Application submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-4xl shadow-float border border-brand-border p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-tint text-brand-sky flex items-center justify-center mx-auto mb-2">
            <Lock className="w-7 h-7 text-brand-sky" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-brand-navy">
            Student Sign-In Required
          </h3>
          <p className="text-xs text-brand-muted leading-relaxed">
            Please log in or register as a student to apply directly to <strong>{internship.title}</strong> at {internship.company.name}.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/login?redirect=/internships/${internship.id}`}
              className="w-full py-3 rounded-full bg-brand-navy text-white text-xs font-bold shadow-soft hover:bg-brand-navyLight transition-colors text-center"
            >
              Sign In to Apply
            </Link>
            <Link
              href={`/register?role=student&redirect=/internships/${internship.id}`}
              className="w-full py-3 rounded-full bg-brand-tint text-brand-navy border border-brand-border text-xs font-bold hover:bg-brand-sky/20 transition-colors text-center"
            >
              Create Free Student Account
            </Link>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-brand-muted hover:text-brand-navy pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-float border border-brand-border overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-brand-canvas border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-navy font-bold text-base shadow-2xs">
              {internship.company.logo}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xs sm:text-sm text-brand-navy leading-tight">
                Apply: {internship.title}
              </h3>
              <p className="text-[11px] text-brand-muted">{internship.company.name} · {internship.type}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close application wizard"
            className="w-7 h-7 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-navy transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 6) */}
        {step <= 6 && (
          <div className="px-4 sm:px-6 pt-2.5 sm:pt-3 pb-1.5 bg-white">
            <div className="flex items-center justify-between text-xs font-bold text-brand-muted mb-1.5">
              <span className="text-brand-navy">
                Step {step} of 6: <span className="text-brand-sky">{stepsTitle[step - 1]}</span>
              </span>
              <span>{Math.round((step / 6) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-brand-canvas overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-sky to-brand-navy transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-3.5">
              <h4 className="font-heading font-extrabold text-lg text-brand-navy">Personal Details</h4>
              <p className="text-xs text-brand-muted">
                Confirm your contact details so the hiring team can reach out directly.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Mahlet Abebe"
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., mahlet@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +251 91 234 5678"
                    className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Location & Availability
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Addis Ababa, Ethiopia"
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-heading font-extrabold text-xl text-brand-navy">Academic Education</h4>
              <p className="text-xs text-brand-muted">
                Your university credentials help verify eligibility for this student cohort.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g., Bahir Dar University"
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Degree & Major
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g., B.Sc. in Computer Science"
                    className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g., 2026"
                    className="w-full px-4 py-2.5 rounded-2xl bg-brand-canvas border border-brand-border text-sm font-medium focus:outline-none focus:border-brand-sky"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-heading font-extrabold text-xl text-brand-navy">Required Skills Match</h4>
              <p className="text-xs text-brand-muted">
                Select your verified skills that match the requirements for this position:
              </p>

              <div className="p-4 rounded-2xl bg-brand-tint/40 border border-brand-sky/20">
                <span className="text-xs font-bold text-brand-navy block mb-2">Role Requirements:</span>
                <div className="flex flex-wrap gap-2">
                  {internship.requiredSkills.map((sk) => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => {
                          setSelectedSkills((prev) =>
                            prev.includes(sk) ? prev.filter((i) => i !== sk) : [...prev, sk]
                          );
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-brand-navy text-white shadow-2xs'
                            : 'bg-white text-brand-muted border border-brand-border'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-sky" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-brand-canvas rounded-xl text-xs text-brand-muted">
                💡 Having all required skills verified boosts your candidate ranking in the recruiter ATS.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-heading font-extrabold text-xl text-brand-navy">Resume Attachment</h4>
              <p className="text-xs text-brand-muted">
                Attach your PDF resume or portfolio summary.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-sky/40 rounded-3xl p-8 text-center bg-brand-canvas hover:bg-white transition-colors cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setResumeName(file.name);
                    }
                  }}
                />
                <UploadCloud className="w-10 h-10 text-brand-sky mx-auto mb-2" />
                <span className="text-sm font-bold text-brand-navy block">
                  Click to select or drag & drop resume
                </span>
                <span className="text-xs text-brand-muted">PDF or DOCX (Max 10MB)</span>
              </div>

              {resumeName ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-brand-border shadow-2xs">
                  <FileText className="w-6 h-6 text-brand-sky shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-brand-navy block truncate">{resumeName}</span>
                    <span className="text-[10px] text-brand-muted">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Ready for secure upload` : 'Attached application resume document'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedFile ? 'Selected' : 'Attached'}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-brand-canvas rounded-2xl border border-dashed border-brand-border text-center text-xs text-brand-muted">
                  No resume attached yet. Click the upload box above to attach your CV document.
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-heading font-extrabold text-xl text-brand-navy">Note to the Hiring Team</h4>
              <p className="text-xs text-brand-muted">
                Why are you excited to join {internship.company.name}? Highlight specific interest in this role.
              </p>

              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Briefly describe your career goals, relevant experience, and why you are interested in this position..."
                className="w-full p-4 rounded-2xl bg-brand-canvas border border-brand-border text-sm text-brand-text focus:outline-none focus:border-brand-sky"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h4 className="font-heading font-extrabold text-xl text-brand-navy">Review Your Application</h4>
              <p className="text-xs text-brand-muted">
                Please double check all information before submitting to {internship.company.name}.
              </p>

              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border space-y-3 text-xs">
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Applicant:</span>
                  <span className="font-bold text-brand-navy">{fullName} ({email})</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Education:</span>
                  <span className="font-bold text-brand-navy">{degree} · {university}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-muted">Resume:</span>
                  <span className="font-bold text-brand-navy">{resumeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Match Score:</span>
                  <span className="font-bold text-brand-sky">{internship.matchScore}% Match</span>
                </div>
              </div>
            </div>
          )}

          {step === 7 && submittedApp && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-subtle">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-heading font-black text-2xl text-brand-navy mb-2">
                Application Submitted 🎉
              </h4>
              <p className="text-sm text-brand-muted max-w-md mx-auto mb-6">
                Your application for <span className="font-bold text-brand-navy">{internship.title}</span> has been transmitted to {internship.company.name}.
              </p>

              <div className="p-4 rounded-2xl bg-brand-canvas border border-brand-border max-w-sm mx-auto text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Application ID:</span>
                  <span className="font-mono font-bold text-brand-navy">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Status:</span>
                  <span className="font-bold text-brand-sky">Submitted & In Queue</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Submitted:</span>
                  <span className="font-bold text-brand-navy">Today</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/dashboard/student/applications');
                  }}
                  className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-card transition-all"
                >
                  Track in Applications Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-brand-canvas hover:bg-brand-border text-brand-navy text-xs font-bold transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step <= 6 && (
          <div className="p-3.5 sm:p-4 bg-brand-canvas border-t border-brand-border flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-full text-xs font-bold text-brand-navy bg-white border border-brand-border hover:bg-brand-tint transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight disabled:opacity-75 shadow-card hover:shadow-glow transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
                  <span>Transmitting Application...</span>
                </>
              ) : (
                <>
                  <span>{step === 6 ? 'Submit Application' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4 text-brand-sky" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
