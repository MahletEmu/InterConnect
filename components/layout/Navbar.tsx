'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Sparkles, User, Building, Compass, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useInterConnect } from '@/lib/context/InterConnectContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const { role, currentUser } = useInterConnect();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Find Internships', href: '/internships' },
    { name: 'Explore Companies', href: '/companies' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300 ${
        scrolled
          ? 'py-3 shadow-soft'
          : 'py-4 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-sky flex items-center justify-center shadow-subtle group-hover:shadow-glow transition-all duration-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
              >
                <circle cx="6" cy="12" r="3" fill="#DDF5FB" />
                <circle cx="18" cy="6" r="3" fill="#4DB7D8" />
                <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
                <path
                  d="M8.5 10.5L15.5 7.5M8.5 13.5L15.5 16.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-brand-navy">
                Inter<span className="text-brand-sky">Connect</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-muted -mt-1 font-semibold">
                Ethiopia Internship Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-sky font-bold'
                      : 'text-brand-text/80 hover:text-brand-sky'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  href={
                    user?.role === 'admin'
                      ? '/dashboard/admin'
                      : user?.role === 'company'
                      ? '/dashboard/company'
                      : '/dashboard/student'
                  }
                  className="text-xs font-bold px-4 py-2 rounded-full bg-brand-navy text-white hover:bg-brand-navyLight transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  {user?.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-sky" />
                      <span>Admin Portal</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5 text-brand-sky" />
                      <span>{user?.role === 'company' ? 'Company Dashboard' : 'Student Dashboard'}</span>
                    </>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm font-bold text-brand-navy hover:text-brand-sky bg-white hover:bg-brand-tint/40 border border-brand-border hover:border-brand-sky/50 px-4 py-2 rounded-full shadow-2xs transition-all duration-200"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center text-sm font-bold text-white bg-gradient-to-r from-brand-sky to-brand-navy px-5 py-2 rounded-full shadow-subtle hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href={
                isAuthenticated
                  ? user?.role === 'admin'
                    ? '/dashboard/admin'
                    : user?.role === 'company'
                    ? '/dashboard/company'
                    : '/dashboard/student'
                  : '/login'
              }
              className="text-xs font-bold px-3 py-1 rounded-full bg-brand-tint text-brand-navy"
            >
              {isAuthenticated ? (user?.role === 'admin' ? 'Admin' : 'Dashboard') : 'Login'}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-brand-navy hover:bg-brand-tint/60 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-brand-border/80 px-4 pt-4 pb-6 mt-3 max-h-[calc(100vh-5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200 shadow-soft">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-brand-text hover:text-brand-sky py-2 px-3 rounded-lg hover:bg-brand-tint/40 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-brand-border/60 my-2" />

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={
                    user?.role === 'admin'
                      ? '/dashboard/admin'
                      : user?.role === 'company'
                      ? '/dashboard/company'
                      : '/dashboard/student'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-brand-navy rounded-full"
                >
                  {user?.role === 'admin' ? 'Admin Management Portal' : user?.role === 'company' ? 'Company Dashboard' : 'Go to Student Dashboard'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-center py-2.5 text-sm font-bold text-rose-600 border border-rose-200 rounded-full hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-brand-navy border border-brand-border rounded-full hover:bg-brand-tint/30 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-sky to-brand-navy rounded-full shadow-subtle"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
