'use client';

import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRoles={['company']}>{children}</AuthGuard>;
}
