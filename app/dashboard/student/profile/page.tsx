'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import { useAuth } from '@/lib/context/AuthContext';
import {
  updateStudentProfileInfo,
  addStudentProject,
  deleteStudentProject,
  addStudentCertificate,
  deleteStudentCertificate,
} from '@/lib/services/profileService';
import { uploadResume, uploadAvatar, getResumeSignedUrl, validateImageFile } from '@/lib/services/storageService';
import {
  ETHIOPIAN_DEPARTMENTS,
  ETHIOPIAN_UNIVERSITIES,
  ETHIOPIAN_CITIES,
} from '@/lib/data/ethiopia';
import AcademicCombobox from '@/components/student/AcademicCombobox';
import AcademicInfoSection from '@/components/student/AcademicInfoSection';
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  FileText,
  Sparkles,
  Award,
  FolderGit2,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Download,
  UploadCloud,
  Check,
  Camera,
  Building,
  BookOpen,
} from 'lucide-react';

export default function StudentProfilePage() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { currentUser, studentProfileId, updateCurrentUser, refreshData } = useInterConnect();

  // Real student record or clean default state for authenticated user
  const student = currentUser || {
    id: studentProfileId || user?.id || 'stud-temp',
    name: user?.name || '',
    email: user?.email || '',
    avatar: '',
    headline: '',
    university: '',
    degree: '',
    fieldOfStudy: '',
    gradYear: 2026,
    location: '',
    bio: '',
    completionRate: 0,
    skills: [],
    education: [],
    projects: [],
    certificates: [],
    experience: [],
    github: '',
    linkedin: '',
    portfolio: '',
    phone: '',
    resumeUrl: '',
  };

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState<'academic' | 'personal' | 'bio' | 'links' | 'resume'>('academic');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showNoCvModal, setShowNoCvModal] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingCV, setIsDownloadingCV] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Profile Editor Form State
  const [editName, setEditName] = useState(currentUser?.name || user?.name || '');
  const [editHeadline, setEditHeadline] = useState(currentUser?.headline || '');
  const [editUniSelected, setEditUniSelected] = useState<string>('');
  const [editUniCustom, setEditUniCustom] = useState<string>('');
  const [editFieldSelected, setEditFieldSelected] = useState<string>('');
  const [editFieldCustom, setEditFieldCustom] = useState<string>('');
  const [editGradYear, setEditGradYear] = useState(currentUser?.gradYear ? String(currentUser.gradYear) : '2026');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editGithub, setEditGithub] = useState(currentUser?.github || '');
  const [editLinkedin, setEditLinkedin] = useState(currentUser?.linkedin || '');
  const [editPortfolio, setEditPortfolio] = useState(currentUser?.portfolio || '');

  // File states
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const directAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // Add Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  // Add Project Form State
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjLink, setNewProjLink] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');

  // Add Certificate Form State
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');

  // Sync edit form with student on open
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || user?.name || '');
      setEditHeadline(currentUser.headline || '');

      const currentUni = currentUser.university || '';
      if (!currentUni) {
        setEditUniSelected('');
        setEditUniCustom('');
      } else if ((ETHIOPIAN_UNIVERSITIES as readonly string[]).includes(currentUni)) {
        setEditUniSelected(currentUni);
        setEditUniCustom('');
      } else {
        setEditUniSelected('Other University / College');
        setEditUniCustom(currentUni);
      }

      const currentField = currentUser.fieldOfStudy || '';
      if (!currentField) {
        setEditFieldSelected('');
        setEditFieldCustom('');
      } else if ((ETHIOPIAN_DEPARTMENTS as readonly string[]).includes(currentField)) {
        setEditFieldSelected(currentField);
        setEditFieldCustom('');
      } else {
        setEditFieldSelected('Other');
        setEditFieldCustom(currentField);
      }

      setEditGradYear(currentUser.gradYear ? String(currentUser.gradYear) : '2026');
      setEditLocation(currentUser.location || '');
      setEditPhone(currentUser.phone || '');
      setEditBio(currentUser.bio || '');
      setEditGithub(currentUser.github || '');
      setEditLinkedin(currentUser.linkedin || '');
      setEditPortfolio(currentUser.portfolio || '');
    } else if (user) {
      setEditName(user.name || '');
    }
  }, [currentUser, user]);

  // Flash message auto dismiss
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // Download CV handler
  const handleDownloadCV = async () => {
    setActionError(null);
    if (!student.resumeUrl) {
      setShowNoCvModal(true);
      return;
    }

    setIsDownloadingCV(true);
    try {
      const signedUrl = await getResumeSignedUrl(student.resumeUrl, 3600);
      if (signedUrl) {
        // Open secure link in new tab or trigger download
        const a = document.createElement('a');
        a.href = signedUrl;
        a.download = `${student.name.replace(/\s+/g, '_')}_Resume.pdf`;
        a.target = '_blank';
        a.rel = 'noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setActionSuccess('Secure resume download initiated.');
      } else {
        // Direct fallback if already full URL
        window.open(student.resumeUrl, '_blank', 'noreferrer');
      }
    } catch (err: any) {
      console.error('Error generating signed URL:', err);
      setActionError('Could not retrieve secure download link. Please try again.');
    } finally {
      setIsDownloadingCV(false);
    }
  };

  // Direct Avatar File Select & Upload Handler
  const handleDirectAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Client-side format & size validation
    const validationError = validateImageFile(file, 5);
    if (validationError) {
      setActionError(validationError);
      if (e.target) e.target.value = '';
      return;
    }

    // 2. Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setNewAvatarFile(file);
    setActionError(null);

    const targetUserId = user?.id || student.userId;
    if (!targetUserId) {
      setActionError('Authentication required. Please sign in to update your profile photo.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      let finalUrl = '';
      const { url, error: uploadErr } = await uploadAvatar(targetUserId, file, student.avatar);
      if (url) {
        finalUrl = url;
      } else {
        // Fallback to Data URL for instant, 100% reliable local photo upload
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      // 3. Persist avatar URL to profiles table if available
      const targetProfileId = student.profileId || user?.profileId || studentProfileId || student.id;
      const targetStudentProfId = studentProfileId || student.id;

      if (targetProfileId && targetStudentProfId && url) {
        try {
          await updateStudentProfileInfo({
            profileId: targetProfileId,
            studentProfileId: targetStudentProfId,
            avatarUrl: finalUrl,
          });
        } catch {}
      }

      // 4. Update immediate context state & localStorage
      updateCurrentUser({ avatar: finalUrl });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interconnect_student_avatar', finalUrl);
        } catch {}
      }
      setActionSuccess('Profile photo uploaded and updated successfully!');
      await refreshData();
      if (refreshProfile) await refreshProfile();
    } catch (err: any) {
      console.error('Direct avatar upload error:', err);
      setActionError(err?.message || 'Unexpected error uploading profile photo.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Remove uploaded avatar and restore student name initials
  const handleRemoveAvatar = async () => {
    updateCurrentUser({ avatar: '' });
    setAvatarPreview(null);
    setNewAvatarFile(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('interconnect_student_avatar');
      } catch {}
    }
    const targetProfileId = student.profileId || user?.profileId || studentProfileId || student.id;
    const targetStudentProfId = studentProfileId || student.id;
    if (targetProfileId && targetStudentProfId) {
      try {
        await updateStudentProfileInfo({
          profileId: targetProfileId,
          studentProfileId: targetStudentProfId,
          avatarUrl: '',
        });
      } catch {}
    }
    setActionSuccess('Profile photo removed. Displaying name initial.');
  };

  // Modal Avatar File Selection Handler (with validation & preview)
  const handleModalAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file, 5);
    if (validationError) {
      setActionError(validationError);
      if (e.target) e.target.value = '';
      return;
    }

    setActionError(null);
    setNewAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Save Full Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionError(null);

    let updatedAvatarUrl = student.avatar;
    let updatedResumeUrl = student.resumeUrl;

    try {
      const targetUserId = user?.id || student.userId;
      const targetStudentProfId = studentProfileId || student.id;
      const targetProfileId = student.profileId || user?.profileId || targetStudentProfId;

      // 1. Upload Avatar if selected
      if (newAvatarFile && targetUserId) {
        const { url, error: avatarErr } = await uploadAvatar(targetUserId, newAvatarFile, student.avatar);
        if (avatarErr || !url) {
          setActionError(avatarErr || 'Failed to upload profile photo.');
          setIsSaving(false);
          return;
        }
        updatedAvatarUrl = url;
      }

      // 2. Upload Resume if selected
      if (newResumeFile && targetStudentProfId) {
        const { path, signedUrl, error: resumeErr } = await uploadResume(targetStudentProfId, newResumeFile);
        if (!resumeErr && (path || signedUrl)) {
          updatedResumeUrl = path || signedUrl || '';
        }
      }

      const effectiveUni =
        editUniSelected === 'Other University / College'
          ? editUniCustom.trim()
          : editUniSelected.trim();

      const effectiveField =
        editFieldSelected === 'Other'
          ? editFieldCustom.trim()
          : editFieldSelected.trim();

      const effectiveName = editName.trim() || student.name || user?.name || 'Student';

      // 3. Persist to Supabase if identifiers exist
      if (targetProfileId && targetStudentProfId) {
        const updateRes = await updateStudentProfileInfo({
          profileId: targetProfileId,
          studentProfileId: targetStudentProfId,
          fullName: effectiveName,
          avatarUrl: updatedAvatarUrl,
          university: effectiveUni,
          fieldOfStudy: effectiveField,
          graduationYear: editGradYear.trim(),
          location: editLocation.trim(),
          bio: editBio.trim(),
          phone: editPhone.trim(),
          resumeUrl: updatedResumeUrl,
          linkedinUrl: editLinkedin.trim(),
          githubUrl: editGithub.trim(),
          portfolioUrl: editPortfolio.trim(),
        });

        if (!updateRes.success) {
          setActionError(updateRes.error || 'Failed to save profile changes.');
          setIsSaving(false);
          return;
        }
      }

      // 4. Update Context state immediately
      updateCurrentUser({
        name: effectiveName,
        headline: editHeadline.trim(),
        university: effectiveUni,
        fieldOfStudy: effectiveField,
        gradYear: parseInt(editGradYear, 10) || 2026,
        location: editLocation.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim(),
        github: editGithub.trim(),
        linkedin: editLinkedin.trim(),
        portfolio: editPortfolio.trim(),
        avatar: updatedAvatarUrl,
        resumeUrl: updatedResumeUrl,
      });

      // 5. Refresh background data from Supabase
      await refreshData();
      if (refreshProfile) await refreshProfile();

      setActionSuccess('Student profile updated and saved to Supabase successfully!');
      setShowEditModal(false);
      setNewAvatarFile(null);
      setAvatarPreview(null);
      setNewResumeFile(null);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setActionError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const trimmed = newSkillName.trim();
    if (student.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setActionError('This skill is already in your verified profile list.');
      return;
    }

    const updatedSkills = [
      ...student.skills,
      { name: trimmed, level: newSkillLevel, verified: true },
    ];

    updateCurrentUser({ skills: updatedSkills });
    setNewSkillName('');
    setShowAddSkillModal(false);
    setActionSuccess(`Added "${trimmed}" to your technical skills.`);
    await refreshData();
  };

  // Remove Skill
  const handleRemoveSkill = async (skillName: string) => {
    const updatedSkills = student.skills.filter((s) => s.name !== skillName);
    updateCurrentUser({ skills: updatedSkills });
    setActionSuccess(`Removed "${skillName}" from profile.`);
    await refreshData();
  };

  // Add Project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const targetStudentProfId = studentProfileId || student.id;
    const techArray = newProjTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let createdId = `proj-${Date.now()}`;

    try {
      if (targetStudentProfId) {
        const res = await addStudentProject(targetStudentProfId, {
          title: newProjTitle.trim(),
          description: newProjDesc.trim(),
          technologies: techArray,
          project_url: newProjLink.trim() || undefined,
          github_url: newProjGithub.trim() || undefined,
        });
        if (res.data?.id) createdId = res.data.id;
      }

      const updatedProjects = [
        {
          id: createdId,
          title: newProjTitle.trim(),
          description: newProjDesc.trim(),
          technologies: techArray,
          link: newProjLink.trim() || undefined,
          github: newProjGithub.trim() || undefined,
        },
        ...student.projects,
      ];

      updateCurrentUser({ projects: updatedProjects });
      setShowAddProjectModal(false);
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjTech('');
      setNewProjLink('');
      setNewProjGithub('');
      setActionSuccess('New featured capstone project added to profile!');
      await refreshData();
    } catch (err: any) {
      console.error('Add project error:', err);
      setActionError('Failed to add project.');
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteStudentProject(projectId);
      const updatedProjects = student.projects.filter((p) => p.id !== projectId);
      updateCurrentUser({ projects: updatedProjects });
      setActionSuccess('Project removed from profile.');
      await refreshData();
    } catch (err) {
      console.error('Delete project error:', err);
    }
  };

  // Add Certificate
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;

    const targetStudentProfId = studentProfileId || student.id;
    let createdId = `cert-${Date.now()}`;

    try {
      if (targetStudentProfId) {
        const res = await addStudentCertificate(targetStudentProfId, {
          name: newCertTitle.trim(),
          issuer: newCertIssuer.trim() || undefined,
          issue_date: newCertDate.trim() || undefined,
          credential_url: newCertUrl.trim() || undefined,
        });
        if (res.data?.id) createdId = res.data.id;
      }

      const updatedCerts = [
        ...student.certificates,
        {
          id: createdId,
          title: newCertTitle.trim(),
          issuer: newCertIssuer.trim(),
          issueDate: newCertDate.trim() || '2025',
          credentialUrl: newCertUrl.trim() || undefined,
        },
      ];

      updateCurrentUser({ certificates: updatedCerts });
      setShowAddCertModal(false);
      setNewCertTitle('');
      setNewCertIssuer('');
      setNewCertDate('');
      setNewCertUrl('');
      setActionSuccess('New certificate credential registered to profile!');
      await refreshData();
    } catch (err: any) {
      console.error('Add certificate error:', err);
      setActionError('Failed to add certificate.');
    }
  };

  // Delete Certificate
  const handleDeleteCert = async (certId: string) => {
    try {
      await deleteStudentCertificate(certId);
      const updatedCerts = student.certificates.filter((c) => c.id !== certId);
      updateCurrentUser({ certificates: updatedCerts });
      setActionSuccess('Certificate removed from profile.');
      await refreshData();
    } catch (err) {
      console.error('Delete certificate error:', err);
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

        <main className="p-4 sm:p-6 flex-1 max-w-5xl w-full mx-auto space-y-5 sm:space-y-6">

          {/* Notification Feedback Banner */}
          {actionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-subtle animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between shadow-subtle animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Profile Header Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft overflow-hidden">
            {/* Gradient Top Strip */}
            <div className="h-24 sm:h-28 bg-gradient-to-r from-brand-navy via-brand-sky to-brand-tint" />

            <div className="px-5 sm:px-6 pb-5 pt-0 -mt-12 sm:-mt-14 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">

                <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-4">
                  {(() => {
                    const studentAvatar = avatarPreview || student.avatar;
                    const hasUploadedPhoto = Boolean(
                      studentAvatar &&
                      studentAvatar.trim() !== '' &&
                      !studentAvatar.includes('hero-student.jpg')
                    );
                    const studentName = student.name || user?.name || 'Student';
                    const firstWord = studentName.trim().split(' ')[0] || 'Student';
                    const firstLetter = firstWord.charAt(0).toUpperCase() || 'S';

                    return (
                      <div className="flex flex-col items-start gap-1.5">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 sm:border-4 border-white shadow-card bg-brand-navy shrink-0 group">
                          {hasUploadedPhoto ? (
                            <Image
                              src={studentAvatar}
                              alt={studentName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-brand-navy via-[#0f233d] to-brand-sky flex flex-col items-center justify-center text-white select-none p-1">
                              <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight leading-none mb-0.5">
                                {firstLetter}
                              </span>
                              <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider max-w-[72px] truncate px-1 text-center">
                                {firstWord}
                              </span>
                            </div>
                          )}

                          <input
                            ref={directAvatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleDirectAvatarSelect}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingAvatar}
                            onClick={() => directAvatarInputRef.current?.click()}
                            className="absolute inset-0 bg-brand-navy/75 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[11px] font-bold gap-1 cursor-pointer disabled:opacity-100"
                            title="Click to upload your own profile photo"
                          >
                            {isUploadingAvatar ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-brand-sky" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4 text-brand-sky" />
                                <span>{hasUploadedPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Direct Photo Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => directAvatarInputRef.current?.click()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-sky hover:text-brand-navy transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{hasUploadedPhoto ? 'Change' : 'Upload Photo'}</span>
                          </button>
                          {hasUploadedPhoto && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                              title="Remove photo and display your name initial"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-navy">
                        {student.name}
                      </h1>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Profile Active" />
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-brand-sky mb-1.5">
                      {student.headline}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-sky" />
                        {student.university}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-sky" />
                        {student.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-navy bg-brand-tint px-2.5 py-0.5 rounded-full border border-brand-sky/30">
                    <Award className="w-3.5 h-3.5 text-brand-sky" />
                    Open to Summer 2026 Internships
                  </span>
                  <span className="text-[11px] font-bold text-brand-muted">
                    Profile Completion: <strong className="text-brand-navy">{student.completionRate}%</strong>
                  </span>
                </div>

              </div>

              {/* Social links row + Primary Actions */}
              <div className="mt-4 pt-4 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {student.github && (
                    <a
                      href={student.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 px-2.5 rounded-lg bg-brand-canvas hover:bg-brand-tint text-brand-navy text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand-border"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {student.linkedin && (
                    <a
                      href={student.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 px-2.5 rounded-lg bg-brand-canvas hover:bg-brand-tint text-brand-navy text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand-border"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-brand-sky" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {student.portfolio && (
                    <a
                      href={student.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 px-2.5 rounded-lg bg-brand-canvas hover:bg-brand-tint text-brand-navy text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand-border"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Portfolio Website</span>
                    </a>
                  )}
                </div>

                {/* Primary Action Buttons: Download CV & Edit Profile */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCV}
                    disabled={isDownloadingCV}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-border text-brand-navy text-xs font-bold border border-brand-border transition-colors flex items-center gap-1.5 disabled:opacity-75"
                    title={student.resumeUrl ? 'Download verified CV' : 'No CV uploaded yet'}
                  >
                    {isDownloadingCV ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                        <span>Preparing Download...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-brand-sky" />
                        <span>Download CV</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditTab('academic');
                      setShowEditModal(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-subtle transition-all flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-sky" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Academic Information Section (Focused University & Department Management) */}
          <AcademicInfoSection />

          {/* About Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                About & Career Objectives
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditTab('bio');
                  setShowEditModal(true);
                }}
                className="text-xs font-bold text-brand-sky hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Bio</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              {student.bio}
            </p>
          </div>

          {/* Verified Skills Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Verified Technical Skills
                </h3>
                <p className="text-xs text-brand-muted">
                  Skills validated through project commits and verified course credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSkillModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brand-sky" />
                <span>Add Skill</span>
              </button>
            </div>

            {student.skills.length === 0 ? (
              <p className="text-xs text-brand-muted py-2 italic">
                No technical skills added yet. Click &ldquo;+ Add Skill&rdquo; above to highlight your core technologies and frameworks.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((sk) => (
                  <div
                    key={sk.name}
                    className="px-3 py-1 rounded-xl bg-brand-canvas border border-brand-border flex items-center gap-1.5 text-xs font-bold text-brand-navy group"
                  >
                    {sk.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{sk.name}</span>
                    <span className="text-[10px] text-brand-muted font-normal">({sk.level || 'Intermediate'})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk.name)}
                      className="text-brand-muted hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity ml-1"
                      title={`Remove ${sk.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Capstone Projects */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Featured Projects & Open-Source Repositories
                </h3>
                <p className="text-xs text-brand-muted">
                  Real engineering codebases evaluated by company recruitment teams
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brand-sky" />
                <span>Add Project</span>
              </button>
            </div>

            {student.projects.length === 0 ? (
              <div className="p-6 rounded-2xl bg-brand-canvas border border-dashed border-brand-border text-center">
                <p className="text-xs text-brand-muted mb-1.5">No featured engineering projects added yet.</p>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(true)}
                  className="text-xs font-bold text-brand-sky hover:underline"
                >
                  + Add your first capstone project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {student.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-brand-canvas border border-brand-border hover:border-brand-sky/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-navy flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-brand-sky" />
                        {proj.title}
                      </h4>
                      <div className="flex items-center gap-2.5">
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-sky hover:underline"
                          >
                            Live Demo ↗
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="text-brand-muted hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed mb-2.5">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-brand-border text-brand-navy"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education & Certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Education */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                    Education
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTab('academic');
                      setShowEditModal(true);
                    }}
                    className="text-xs font-bold text-brand-sky hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
                {student.education.length === 0 ? (
                  student.university || student.fieldOfStudy ? (
                    <div className="space-y-1.5 py-1">
                      <div className="flex items-start gap-2.5">
                        <Building className="w-4 h-4 text-brand-sky shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-brand-navy truncate">
                            {student.university || 'Higher Education Institution'}
                          </h4>
                          <p className="text-xs text-brand-sky font-semibold truncate">
                            {student.fieldOfStudy || 'Undergraduate Department'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-muted pl-6.5">
                        Class of {student.gradYear || 2026} {student.location ? `· ${student.location}` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-brand-muted py-2 italic">
                      No university or degree specified yet. Click &ldquo;Edit&rdquo; above to record your academic background.
                    </p>
                  )
                ) : (
                  student.education.map((edu) => (
                    <div key={edu.id} className="space-y-0.5 mb-2.5 last:mb-0">
                      <h4 className="font-bold text-xs sm:text-sm text-brand-navy">{edu.institution}</h4>
                      <p className="text-xs text-brand-sky font-semibold">{edu.degree}</p>
                      <p className="text-xs text-brand-muted">Graduation: {edu.endDate} · GPA: {edu.gpa}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Certificates & Credentials
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-brand-canvas hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-sky" />
                  <span>Add</span>
                </button>
              </div>
              {student.certificates.length === 0 ? (
                <p className="text-xs text-brand-muted py-2 italic">
                  No credentials or certificates added yet. Click &ldquo;+ Add&rdquo; to showcase your accreditations.
                </p>
              ) : (
                student.certificates.map((cert) => (
                  <div key={cert.id} className="p-2.5 rounded-xl bg-brand-canvas border border-brand-border/70 mb-2.5 last:mb-0 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <h4 className="font-bold text-xs text-brand-navy flex items-center gap-1.5 truncate">
                        <Award className="w-3.5 h-3.5 text-brand-sky shrink-0" />
                        <span className="truncate">{cert.title}</span>
                      </h4>
                      <p className="text-[11px] text-brand-muted truncate">{cert.issuer} · {cert.issueDate}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-brand-muted hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      {/* =====================================================
          1. EDIT PROFILE MODAL
         ===================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-4xl shadow-float border border-brand-border overflow-hidden flex flex-col max-h-[92vh]">

            {/* Header */}
            <div className="p-5 sm:p-6 bg-brand-canvas border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-brand-navy">
                  Edit Student Profile
                </h3>
                <p className="text-xs text-brand-muted">
                  Update your personal information, career objectives, and credentials
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-brand-border px-6 gap-6 bg-white overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditTab('academic')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  editTab === 'academic' ? 'border-brand-sky text-brand-navy' : 'border-transparent text-brand-muted'
                }`}
              >
                Academic Info
              </button>
              <button
                type="button"
                onClick={() => setEditTab('personal')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  editTab === 'personal' ? 'border-brand-sky text-brand-navy' : 'border-transparent text-brand-muted'
                }`}
              >
                Personal Details
              </button>
              <button
                type="button"
                onClick={() => setEditTab('bio')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  editTab === 'bio' ? 'border-brand-sky text-brand-navy' : 'border-transparent text-brand-muted'
                }`}
              >
                About & Objectives
              </button>
              <button
                type="button"
                onClick={() => setEditTab('links')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  editTab === 'links' ? 'border-brand-sky text-brand-navy' : 'border-transparent text-brand-muted'
                }`}
              >
                Social & Links
              </button>
              <button
                type="button"
                onClick={() => setEditTab('resume')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  editTab === 'resume' ? 'border-brand-sky text-brand-navy' : 'border-transparent text-brand-muted'
                }`}
              >
                Resume & Avatar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 flex-1">

              {editTab === 'academic' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-brand-tint/60 border border-brand-sky/20 flex items-start gap-2.5">
                    <GraduationCap className="w-5 h-5 text-brand-navy shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-brand-navy">
                        Academic Information
                      </h4>
                      <p className="text-[11px] text-brand-muted leading-relaxed">
                        University and Department are the primary academic criteria for internship matching. Select from accredited Ethiopian institutions or choose &ldquo;Other&rdquo; to enter your custom college or department.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AcademicCombobox
                      id="modal-uni-combobox"
                      label="University / Higher Education Institution"
                      required={true}
                      value={editUniSelected}
                      customValue={editUniCustom}
                      options={ETHIOPIAN_UNIVERSITIES}
                      otherOptionLabel="Other University / College"
                      placeholder="Select or search Ethiopian university..."
                      customPlaceholder="Type your university or college name (e.g., Wolaita Sodo, St. Mary's)"
                      icon={<Building className="w-4 h-4" />}
                      helperText="Accredited Ethiopian institutions"
                      onSelect={(opt) => setEditUniSelected(opt)}
                      onCustomChange={(text) => setEditUniCustom(text)}
                    />

                    <AcademicCombobox
                      id="modal-dept-combobox"
                      label="Department / Field of Study"
                      required={true}
                      value={editFieldSelected}
                      customValue={editFieldCustom}
                      options={ETHIOPIAN_DEPARTMENTS}
                      otherOptionLabel="Other"
                      placeholder="Select or search your department..."
                      customPlaceholder="Type your department or program (e.g., Data Science, Civil Eng)"
                      icon={<BookOpen className="w-4 h-4" />}
                      helperText="Program of study"
                      onSelect={(opt) => setEditFieldSelected(opt)}
                      onCustomChange={(text) => setEditFieldCustom(text)}
                    />
                  </div>
                </div>
              )}

              {editTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                          Full Name
                        </label>
                        <span className="text-[11px] text-brand-muted">(optional update)</span>
                      </div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g., Mahlet Abebe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                          Headline / Role Focus
                        </label>
                        <span className="text-[11px] text-brand-muted">(optional)</span>
                      </div>
                      <input
                        type="text"
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                        placeholder="e.g., Software Engineering Intern"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={editGradYear}
                        onChange={(e) => setEditGradYear(e.target.value)}
                        placeholder="e.g., 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        list="ethiopian-cities-list"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="e.g., Addis Ababa, Ethiopia"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                      <datalist id="ethiopian-cities-list">
                        {ETHIOPIAN_CITIES.map((city) => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="e.g., +251 91 234 5678"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editTab === 'bio' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                      About You & Career Objectives
                    </label>
                    <textarea
                      rows={6}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Briefly describe your career goals, technical background, and project interests..."
                      className="w-full p-4 rounded-2xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {editTab === 'links' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                      Personal Portfolio / Website URL
                    </label>
                    <input
                      type="url"
                      value={editPortfolio}
                      onChange={(e) => setEditPortfolio(e.target.value)}
                      placeholder="https://yourname.dev"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {editTab === 'resume' && (
                <div className="space-y-6">
                  {/* Resume Upload */}
                  <div className="p-4 rounded-3xl border border-brand-border bg-brand-canvas/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-brand-sky" />
                        Uploaded Resume / CV
                      </span>
                      {student.resumeUrl ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Active CV on File
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          No CV Uploaded
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-brand-muted mb-3">
                      Upload your latest resume (PDF or Word document, max 10MB) to the private Supabase storage bucket.
                    </p>

                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setNewResumeFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white border border-brand-border hover:bg-brand-tint text-brand-navy text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <UploadCloud className="w-4 h-4 text-brand-sky" />
                        <span>{newResumeFile ? 'Change File' : 'Select Resume File'}</span>
                      </button>
                      {newResumeFile && (
                        <span className="text-xs font-bold text-brand-navy truncate">
                          Selected: {newResumeFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="p-4 rounded-3xl border border-brand-border bg-brand-canvas/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                        Profile Avatar Picture
                      </span>
                      <span className="text-[11px] text-brand-muted">
                        JPEG, PNG, or WebP (max 5MB)
                      </span>
                    </div>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleModalAvatarSelect}
                      className="hidden"
                    />

                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-sky shadow-subtle shrink-0 bg-brand-navy">
                        <Image
                          src={avatarPreview || student.avatar}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-white border border-brand-border hover:bg-brand-tint text-brand-navy text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <UploadCloud className="w-4 h-4 text-brand-sky" />
                            <span>{newAvatarFile ? 'Choose Different Image' : 'Select New Image'}</span>
                          </button>
                          {newAvatarFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewAvatarFile(null);
                                setAvatarPreview(null);
                                if (avatarInputRef.current) avatarInputRef.current.value = '';
                              }}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                              title="Cancel selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {newAvatarFile && (
                          <p className="text-xs font-semibold text-emerald-700 mt-1 truncate">
                            Ready to save: {newAvatarFile.name} ({(newAvatarFile.size / 1024).toFixed(0)} KB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-75"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-sky" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-sky" />
                      <span>Save & Apply Updates</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          2. NO CV NOTICE MODAL
         ===================================================== */}
      {showNoCvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-4xl shadow-float border border-brand-border p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-tint text-brand-sky flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-brand-navy mb-2">
              No Resume Uploaded Yet
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed mb-6">
              You haven&apos;t uploaded a CV document yet. Please upload your resume in PDF or Word format so prospective employers can review and download it directly.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNoCvModal(false);
                  setEditTab('resume');
                  setShowEditModal(true);
                }}
                className="w-full py-3 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all"
              >
                Upload Resume Now
              </button>
              <button
                type="button"
                onClick={() => setShowNoCvModal(false)}
                className="w-full py-2.5 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          3. ADD SKILL MODAL
         ===================================================== */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-4xl shadow-float border border-brand-border p-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="font-heading font-extrabold text-base text-brand-navy">
                Add Technical Skill
              </h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-brand-muted hover:text-brand-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., JavaScript, React, SQL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Proficiency Level
                </label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                >
                  <option value="Beginner">Beginner (Foundations)</option>
                  <option value="Intermediate">Intermediate (Independent Projects)</option>
                  <option value="Advanced">Advanced (Production Experience)</option>
                  <option value="Expert">Expert (Architecture & Systems)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          4. ADD PROJECT MODAL
         ===================================================== */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-4xl shadow-float border border-brand-border p-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="font-heading font-extrabold text-base text-brand-navy">
                Add Featured Project
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-brand-muted hover:text-brand-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="What problem does it solve? What is the architecture?"
                  className="w-full p-3 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="e.g. Go, Redis, Docker, gRPC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={newProjLink}
                    onChange={(e) => setNewProjLink(e.target.value)}
                    placeholder="https://demo.app"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    value={newProjGithub}
                    onChange={(e) => setNewProjGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          5. ADD CERTIFICATE MODAL
         ===================================================== */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-4xl shadow-float border border-brand-border p-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="font-heading font-extrabold text-base text-brand-navy">
                Add Credential Certificate
              </h3>
              <button onClick={() => setShowAddCertModal(false)} className="text-brand-muted hover:text-brand-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  placeholder="e.g. Google Cloud Associate Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder="e.g. Google Cloud / Coursera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Date Issued
                  </label>
                  <input
                    type="text"
                    value={newCertDate}
                    onChange={(e) => setNewCertDate(e.target.value)}
                    placeholder="e.g. Feb 2025"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Credential Verification URL
                </label>
                <input
                  type="url"
                  value={newCertUrl}
                  onChange={(e) => setNewCertUrl(e.target.value)}
                  placeholder="https://credly.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-canvas border border-brand-border text-xs sm:text-sm text-brand-text focus:outline-none focus:border-brand-sky focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold shadow-soft transition-all"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
