'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Strict Route Guard for Administrator Workflows.
 * Ensures:
 * 1. User must be fully authenticated with a valid Supabase session.
 * 2. User profile in database must have verified role === 'admin'.
 * 3. Never trusts client-side storage or URL query spoofing.
 * 4. Unauthorized users are blocked from rendering admin UI or triggering actions.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
      return;
    }

    if (user.role !== 'admin') {
      // Non-admin authenticated users are prevented from accessing admin panel
      router.replace(user.role === 'company' ? '/dashboard/company' : '/dashboard/student');
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-canvas flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center shadow-soft">
            <Loader2 className="w-6 h-6 text-brand-sky animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-brand-navy">Verifying administrative credentials...</p>
            <p className="text-xs text-brand-muted">Connecting securely to InterConnect</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-border shadow-float text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-brand-navy">
            Access Restricted
          </h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            Your account ({user.email}) does not have administrative permissions on InterConnect.
          </p>
          <Link
            href="/dashboard/student"
            className="inline-block px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold shadow-subtle hover:bg-brand-navyLight transition-colors"
          >
            Return to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
