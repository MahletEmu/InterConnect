'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  Compass,
  Bookmark,
  Send,
  MessageSquare,
  Calendar,
  User,
  Settings,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart2,
  Building,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react';

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ mobileOpen, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { role, switchRole, currentUser, currentCompany, savedInternshipIds, unreadCount } = useInterConnect();

  const studentLinks = [
    { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Discover Internships', href: '/internships', icon: Compass },
    { name: 'Applications', href: '/dashboard/student/applications', icon: Send },
    {
      name: 'Saved Internships',
      href: '/dashboard/student/saved',
      icon: Bookmark,
      badge: savedInternshipIds.length > 0 ? savedInternshipIds.length : undefined,
    },
    {
      name: 'Messages',
      href: '/dashboard/student/messages',
      icon: MessageSquare,
      badge: 1,
    },
    { name: 'Interviews', href: '/dashboard/student/interviews', icon: Calendar },
    { name: 'Student Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const companyLinks = [
    { name: 'Overview', href: '/dashboard/company', icon: LayoutDashboard },
    { name: 'Internship Positions', href: '/dashboard/company/internships', icon: Briefcase },
    { name: 'Candidates Search', href: '/dashboard/company/candidates', icon: Users },
    { name: 'Applications (ATS)', href: '/dashboard/company/applications', icon: Send },
    { name: 'Messages', href: '/dashboard/company/messages', icon: MessageSquare, badge: 1 },
    { name: 'Interviews', href: '/dashboard/company/interviews', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/company/analytics', icon: BarChart2 },
    { name: 'Company Profile', href: '/dashboard/company/profile', icon: Building },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const links = role === 'company' ? companyLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-brand-border">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-sky flex items-center justify-center shadow-subtle">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                  <circle cx="6" cy="12" r="3" fill="#DDF5FB" />
                  <circle cx="18" cy="6" r="3" fill="#4DB7D8" />
                  <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
                  <path d="M8.5 10.5L15.5 7.5M8.5 13.5L15.5 16.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-lg text-brand-navy tracking-tight">
                Inter<span className="text-brand-sky">Connect</span>
              </span>
            </Link>
          </div>

          {/* Quick Role Toggle Bar */}
          <div className="p-3 border-b border-brand-border bg-brand-canvas/50">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-extrabold uppercase tracking-wider text-brand-muted text-[10px]">
                Active Role Portal
              </span>
              {user ? (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  Verified
                </span>
              ) : (
                <button
                  onClick={() => {
                    const nextRole = role === 'student' ? 'company' : 'student';
                    switchRole(nextRole);
                    router.push(nextRole === 'company' ? '/dashboard/company' : '/dashboard/student');
                  }}
                  className="text-[10px] font-bold text-brand-sky flex items-center gap-1 hover:underline"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Switch</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-brand-border shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-brand-tint flex items-center justify-center text-brand-navy font-bold text-[11px]">
                {role === 'company' ? '⚡' : 'AM'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-navy truncate">
                  {role === 'company' ? currentCompany?.name : currentUser?.name}
                </p>
                <p className="text-[10px] text-brand-muted truncate capitalize">
                  {role === 'company' ? 'Recruiter ATS' : 'Student Innovator'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-240px)]">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-soft'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-brand-canvas'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-sky' : 'text-brand-muted'}`} />
                    <span>{link.name}</span>
                  </div>

                  {link.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-brand-sky text-brand-navy'
                          : 'bg-brand-tint text-brand-navy'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-brand-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-brand-muted hover:text-brand-navy rounded-xl hover:bg-brand-canvas transition-colors"
          >
            <Compass className="w-4 h-4 text-brand-sky" />
            <span>Return to Public Site</span>
          </Link>
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
