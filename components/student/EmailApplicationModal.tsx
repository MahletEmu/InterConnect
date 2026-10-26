'use client';

import React, { useState, useEffect } from 'react';
import { Company, Student } from '@/types';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';

interface EmailApplicationModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSent?: (company: Company) => void;
}

export default function EmailApplicationModal({
  company,
  isOpen,
  onClose,
  student,
  onSent,
}: EmailApplicationModalProps) {
  const { recordEmailApplication } = useInterConnect();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [sentChannel, setSentChannel] = useState<'gmail' | 'outlook' | 'default' | null>(null);

  // Initialize pre-filled subject and professional body when company or student changes
  useEffect(() => {
    if (company && student) {
      const studentName = student.name || 'University Student';
      const studentDept = student.fieldOfStudy || 'Undergraduate Student';
      const studentUni = student.university || 'Ethiopian University';
      const studentYear = student.gradYear ? `Class of ${student.gradYear}` : 'Prospective Graduate';
      const studentEmail = student.email || '';
      const studentPhone = student.phone || '';
      const skillsList = student.skills && student.skills.length > 0
        ? student.skills.map((s) => s.name).join(', ')
        : 'Relevant coursework and academic projects';

      const defaultSubject = `Internship Application: ${studentName} - ${studentDept} (${studentUni})`;

      const defaultBody = `Dear Hiring & HR Team at ${company.name},

I hope this email finds you well.

My name is ${studentName}, and I am currently a university student studying ${studentDept} at ${studentUni} (${studentYear}).

I am writing to formally express my strong interest in pursuing a student internship / practical academic attachment with ${company.name}. Having closely followed your organization's impactful work and industry leadership in Ethiopia, I am enthusiastic about the opportunity to contribute my dedication, technical skills, and academic foundation to your projects while gaining real-world mentorship from your team.

Summary of Academic & Technical Qualifications:
• University: ${studentUni}
• Department / Field of Study: ${studentDept}
• Verified Skills & Areas of Focus: ${skillsList}
• Contact Email: ${studentEmail}
${studentPhone ? `• Phone: ${studentPhone}` : ''}

I have prepared my updated Curriculum Vitae (CV) and official university recommendation letter, which I am ready to furnish upon your request.

Thank you very much for your time, consideration, and commitment to supporting university talent in Ethiopia. I look forward to the possibility of discussing how I can add value to ${company.name}.

Sincerely,
${studentName}
${studentEmail}
${studentPhone ? `${studentPhone}\n` : ''}${studentUni}`;

      setSubject(defaultSubject);
      setBody(defaultBody);
      setIsSent(false);
      setSentChannel(null);
    }
  }, [company, student]);

  if (!isOpen || !company) return null;

  const targetEmail = company.contactEmail || 'careers@ethiopia.et';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(targetEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (err) {
      console.error('Failed to copy email', err);
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const recordAndNotify = async (channel: 'gmail' | 'outlook' | 'default') => {
    if (recordEmailApplication) {
      try {
        await recordEmailApplication(company, subject, body);
      } catch (err) {
        console.error('Error recording application status:', err);
      }
    }
    if (onSent) onSent(company);
    setIsSent(true);
    setSentChannel(channel);
  };

  // Launch Gmail Web compose directly in new tab with recipient, subject & body
  const handleOpenGmail = async () => {
    await recordAndNotify('gmail');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      targetEmail
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // Launch Outlook Web compose
  const handleOpenOutlookWeb = async () => {
    await recordAndNotify('outlook');
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
      targetEmail
    )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  };

  // Launch default mail client via mailto
  const handleOpenDefaultMail = async () => {
    await recordAndNotify('default');
    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-float border border-brand-border flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-canvas via-white to-brand-tint/30 border-b border-brand-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-tint border border-brand-sky/30 flex items-center justify-center text-brand-navy font-black text-lg shadow-2xs">
              {company.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-brand-navy">
                  Send Internship Request
                </h3>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">
                Direct application to <strong className="text-brand-navy">{company.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-brand-muted hover:text-brand-navy hover:bg-brand-canvas transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* Dispatch Status Banner */}
          {isSent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium space-y-1.5 animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs sm:text-sm">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {sentChannel === 'gmail'
                    ? 'Gmail Compose opened in a new tab!'
                    : sentChannel === 'outlook'
                    ? 'Outlook Web opened in a new tab!'
                    : 'Email application launched!'}
                </span>
              </div>
              <p className="text-emerald-700 leading-relaxed pl-6">
                <strong>Next Step:</strong> Check your email tab, review your pre-filled letter, attach your CV or University Attachment/Support letter, and press <strong>&quot;Send&quot;</strong> in your email to deliver it directly to <strong>{targetEmail}</strong>.
              </p>
            </div>
          )}

          {/* Recipient Email Address Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Company Official HR / Careers Email
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-brand-sky absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  readOnly
                  value={targetEmail}
                  className="w-full bg-brand-canvas border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-brand-navy focus:outline-none select-all"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-3.5 py-2.5 rounded-xl border border-brand-border bg-white hover:bg-brand-tint text-xs font-bold text-brand-navy flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-sky" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject Line Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-brand-navy focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition-all"
            />
          </div>

          {/* Pre-written Professional Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                Pre-Filled Cover Message
              </label>
              <button
                type="button"
                onClick={handleCopyBody}
                className="text-[11px] font-bold text-brand-sky hover:underline flex items-center gap-1"
              >
                {copiedBody ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied message!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-brand-canvas/60 border border-brand-border rounded-2xl p-3.5 text-xs leading-relaxed text-brand-text font-normal focus:outline-none focus:border-brand-sky focus:bg-white transition-all resize-y"
            />
          </div>

          {/* Clear Explanation of the Process */}
          <div className="p-3.5 rounded-2xl bg-brand-tint/50 border border-brand-sky/30 text-xs text-brand-navy space-y-1">
            <div className="flex items-center gap-2 font-bold text-brand-navy">
              <Sparkles className="w-4 h-4 text-brand-sky shrink-0" />
              <span>How this reaches the company:</span>
            </div>
            <p className="text-brand-muted pl-6 leading-relaxed">
              Clicking <strong>&quot;Open in Gmail Web&quot;</strong> opens your Gmail in a new tab with the recipient (<strong>{targetEmail}</strong>), subject, and formal application pre-filled. You can attach your CV or University Recommendation Letter, and hit <strong>Send</strong>. The company will receive it directly from your email address.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-brand-canvas border-t border-brand-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-brand-border text-brand-muted hover:text-brand-navy text-xs font-bold transition-colors"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyBody}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-brand-sky" />
              <span>{copiedBody ? 'Copied' : 'Copy Message'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenDefaultMail}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-brand-tint border border-brand-border text-brand-navy text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
              title="Open default mail app like Outlook or Apple Mail"
            >
              <Mail className="w-3.5 h-3.5 text-brand-navy" />
              <span>Mail App</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGmail}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-card hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>Open in Gmail Web</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
