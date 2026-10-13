'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
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

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to the appropriate dashboard for their actual role
      if (user.role === 'company') {
        router.replace('/dashboard/company');
      } else {
        router.replace('/dashboard/student');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5FBFD] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0D2B40] to-[#4DB7D8] flex items-center justify-center shadow-lg shadow-[#0D2B40]/10">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#0D2B40]">Verifying session...</p>
            <p className="text-xs text-[#476C85]">Connecting to InterConnect</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
