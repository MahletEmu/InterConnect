'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react';

interface DashboardTopbarProps {
  onToggleMobileMenu: () => void;
}

export default function DashboardTopbar({ onToggleMobileMenu }: DashboardTopbarProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    role,
    currentUser,
    currentCompany,
    notifications,
    markNotificationAsRead,
    unreadCount,
  } = useInterConnect();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (role === 'company') {
        router.push(`/dashboard/company/candidates`);
      } else {
        router.push(`/internships`);
      }
    }
  };

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await signOut();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-brand-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

      {/* Left: Mobile hamburger + Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-brand-navy hover:bg-brand-canvas lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={
              role === 'company'
                ? 'Search applicants, verified skills, universities...'
                : 'Search opportunities, companies, skills...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-brand-canvas border border-brand-border text-xs text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-sky focus:bg-white"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">

        {/* Messages Shortcut */}
        <Link
          href={role === 'company' ? '/dashboard/company/messages' : '/dashboard/student/messages'}
          className="p-2.5 rounded-2xl bg-brand-canvas hover:bg-brand-tint text-brand-navy border border-brand-border transition-colors relative"
          aria-label="Messages"
        >
          <MessageSquare className="w-4 h-4 text-brand-sky" />
          <span className="w-2 h-2 rounded-full bg-brand-sky absolute top-2 right-2 ring-2 ring-white" />
        </Link>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2.5 rounded-2xl bg-brand-canvas hover:bg-brand-tint text-brand-navy border border-brand-border transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-brand-sky" />
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black absolute -top-1 -right-1 flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {notifDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-float border border-brand-border p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-3">
                  <span className="font-heading font-extrabold text-sm text-brand-navy">
                    Notifications
                  </span>
                  <span className="text-[11px] font-bold text-brand-sky">
                    {unreadCount} unread
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationAsRead(item.id)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer ${
                        item.isRead
                          ? 'bg-brand-canvas/60 opacity-80'
                          : 'bg-brand-tint/40 border border-brand-sky/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-xs text-brand-navy">{item.title}</h5>
                        <span className="text-[10px] text-brand-muted shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-brand-muted mt-1 leading-snug">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-brand-border mt-3 text-center">
                  <Link
                    href={role === 'company' ? '/dashboard/company/applications' : '/dashboard/student/applications'}
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs font-bold text-brand-sky hover:underline"
                  >
                    View All Application Updates
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar & Name */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-brand-canvas transition-colors"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-brand-sky bg-brand-navy shrink-0">
              {role === 'company' ? (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  ⚡
                </div>
              ) : (
                <Image
                  src={currentUser?.avatar || '/images/hero-student.jpg'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-brand-navy leading-tight">
                {role === 'company' ? currentCompany?.name : currentUser?.name}
              </span>
              <span className="text-[10px] text-brand-muted block capitalize">
                {role === 'company' ? 'Recruiting Team' : 'AAiT CS Junior'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-brand-muted hidden md:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-3 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-float border border-brand-border p-2 z-50">
                <div className="p-3 border-b border-brand-border/60">
                  <p className="text-xs font-bold text-brand-navy">Signed in as</p>
                  <p className="text-[11px] text-brand-muted truncate">
                    {role === 'company' ? 'recruiting@novasystems.io' : currentUser?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href={role === 'company' ? '/dashboard/company/internships' : '/dashboard/student/profile'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-canvas rounded-xl transition-colors"
                  >
                    {role === 'company' ? 'Manage Positions' : 'View Portfolio Profile'}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-canvas rounded-xl transition-colors"
                  >
                    Account Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-brand-border/60">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left block px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
