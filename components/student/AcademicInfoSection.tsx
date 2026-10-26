'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Building,
  Check,
  X,
} from 'lucide-react';
import AcademicCombobox from './AcademicCombobox';
import {
  ETHIOPIAN_UNIVERSITIES,
  ETHIOPIAN_DEPARTMENTS,
} from '@/lib/data/ethiopia';
import { updateStudentProfileInfo } from '@/lib/services/profileService';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { useAuth } from '@/lib/context/AuthContext';

interface AcademicInfoSectionProps {
  onSaved?: () => void;
  className?: string;
}

export default function AcademicInfoSection({
  onSaved,
  className = '',
}: AcademicInfoSectionProps) {
  const { user, refreshProfile } = useAuth();
  const { currentUser, studentProfileId, updateCurrentUser, refreshData } = useInterConnect();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // University state
  const [selectedUni, setSelectedUni] = useState<string>('');
  const [customUni, setCustomUni] = useState<string>('');

  // Department state
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [customDept, setCustomDept] = useState<string>('');

  // Field errors
  const [uniError, setUniError] = useState<string | null>(null);
  const [deptError, setDeptError] = useState<string | null>(null);

  // Initialize or re-sync with currentUser
  const syncWithProfile = () => {
    const currentUni = currentUser?.university || '';
    const currentDept = currentUser?.fieldOfStudy || '';

    // University initialization
    if (!currentUni) {
      setSelectedUni('');
      setCustomUni('');
    } else if ((ETHIOPIAN_UNIVERSITIES as readonly string[]).includes(currentUni)) {
      setSelectedUni(currentUni);
      setCustomUni('');
    } else {
      setSelectedUni('Other University / College');
      setCustomUni(currentUni);
    }

    // Department initialization
    if (!currentDept) {
      setSelectedDept('');
      setCustomDept('');
    } else if ((ETHIOPIAN_DEPARTMENTS as readonly string[]).includes(currentDept)) {
      setSelectedDept(currentDept);
      setCustomDept('');
    } else {
      setSelectedDept('Other');
      setCustomDept(currentDept);
    }

    setUniError(null);
    setDeptError(null);
  };

  useEffect(() => {
    syncWithProfile();
  }, [currentUser]);

  // Determine effective values
  const effectiveUniversity =
    selectedUni === 'Other University / College'
      ? customUni.trim()
      : selectedUni.trim();

  const effectiveDepartment =
    selectedDept === 'Other'
      ? customDept.trim()
      : selectedDept.trim();

  const isProfileIncomplete = !currentUser?.university || !currentUser?.fieldOfStudy;

  const handleStartEdit = () => {
    syncWithProfile();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    syncWithProfile();
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setUniError(null);
    setDeptError(null);

    // Validation
    let hasError = false;
    if (!effectiveUniversity) {
      setUniError('Please select your university or enter your institution name.');
      hasError = true;
    }
    if (!effectiveDepartment) {
      setDeptError('Please select your department or enter your field of study.');
      hasError = true;
    }

    if (hasError) return;

    setIsSaving(true);

    try {
      const targetUserId = user?.id || currentUser?.userId;
      const targetStudentProfId = studentProfileId || currentUser?.id;
      const targetProfileId = currentUser?.profileId || user?.profileId || targetStudentProfId;

      if (targetProfileId && targetStudentProfId) {
        const res = await updateStudentProfileInfo({
          profileId: targetProfileId,
          studentProfileId: targetStudentProfId,
          university: effectiveUniversity,
          fieldOfStudy: effectiveDepartment,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Failed to save academic information.');
          setIsSaving(false);
          return;
        }
      }

      // Update local context state
      updateCurrentUser({
        university: effectiveUniversity,
        fieldOfStudy: effectiveDepartment,
      });

      // Background sync
      await refreshData();
      if (refreshProfile) await refreshProfile();

      setSuccessMessage('Academic details saved successfully!');
      setIsEditing(false);
      if (onSaved) onSaved();

      // Dismiss success notice after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Academic info update error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft p-5 sm:p-6 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-tint text-brand-navy flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-brand-sky" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                Academic Information
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Primary Focus
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              Ethiopian higher education institution and field of study
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="px-3.5 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-tint text-brand-navy hover:text-brand-navyLight text-xs font-bold border border-brand-border transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Edit2 className="w-3 h-3 text-brand-sky" />
            <span>{isProfileIncomplete ? 'Set Up Details' : 'Edit Details'}</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Display Mode */}
      {!isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* University Display */}
            <div className="p-3.5 rounded-2xl bg-brand-canvas/70 border border-brand-border/80 flex items-start gap-3">
              <Building className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-0.5">
                  University / Institution
                </span>
                {currentUser?.university ? (
                  <p className="font-heading font-bold text-xs sm:text-sm text-brand-navy truncate">
                    {currentUser.university}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 font-semibold italic">
                    Not set yet · Click &ldquo;Set Up Details&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Department Display */}
            <div className="p-3.5 rounded-2xl bg-brand-canvas/70 border border-brand-border/80 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-brand-sky mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-0.5">
                  Department / Field of Study
                </span>
                {currentUser?.fieldOfStudy ? (
                  <p className="font-heading font-bold text-xs sm:text-sm text-brand-navy truncate">
                    {currentUser.fieldOfStudy}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 font-semibold italic">
                    Not set yet · Click &ldquo;Set Up Details&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {isProfileIncomplete && (
            <div className="p-3 rounded-xl bg-brand-tint/60 border border-brand-sky/20 flex items-center justify-between gap-3 text-xs">
              <span className="text-brand-navy font-medium">
                Setting your university and department unlocks accurate internship recommendations.
              </span>
              <button
                type="button"
                onClick={handleStartEdit}
                className="font-bold text-brand-sky hover:underline whitespace-nowrap"
              >
                Complete now →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Edit Form Mode */
        <form onSubmit={handleSave} className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* University Combobox */}
            <AcademicCombobox
              id="academic-uni-select"
              label="University / Institution"
              required={true}
              value={selectedUni}
              customValue={customUni}
              options={ETHIOPIAN_UNIVERSITIES}
              otherOptionLabel="Other University / College"
              placeholder="Select or search Ethiopian university..."
              customPlaceholder="Enter your university or college name (e.g., Wolaita Sodo, St. Mary's)"
              icon={<Building className="w-4 h-4" />}
              helperText="Accredited Ethiopian universities & colleges"
              error={uniError}
              onSelect={(opt) => {
                setSelectedUni(opt);
                setUniError(null);
              }}
              onCustomChange={(text) => {
                setCustomUni(text);
                setUniError(null);
              }}
            />

            {/* Department Combobox */}
            <AcademicCombobox
              id="academic-dept-select"
              label="Department / Field of Study"
              required={true}
              value={selectedDept}
              customValue={customDept}
              options={ETHIOPIAN_DEPARTMENTS}
              otherOptionLabel="Other"
              placeholder="Select or search your department..."
              customPlaceholder="Enter your field of study or department (e.g., Data Science, Architecture)"
              icon={<BookOpen className="w-4 h-4" />}
              helperText="Program of study"
              error={deptError}
              onSelect={(opt) => {
                setSelectedDept(opt);
                setDeptError(null);
              }}
              onCustomChange={(text) => {
                setCustomDept(text);
                setDeptError(null);
              }}
            />
          </div>

          {/* Form Action Controls */}
          <div className="pt-3 border-t border-brand-border flex items-center justify-between gap-3">
            <span className="text-[11px] text-brand-muted">
              * University and Department are required for internship matching.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-muted hover:text-brand-navy hover:bg-brand-canvas transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                    <span>Saving Academic Info...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-sky" />
                    <span>Save Academic Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
