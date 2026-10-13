import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Github, Linkedin, Twitter, Youtube, Instagram, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-brand-navy text-white overflow-hidden pt-12 sm:pt-14 pb-8 border-t border-brand-navyLight">
      {/* Background Network Graphic Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-nodes" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#4DB7D8" />
              <circle cx="60" cy="60" r="2" fill="#DDF5FB" />
              <path d="M20 20L60 60" stroke="#4DB7D8" strokeWidth="0.5" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-nodes)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 border-b border-brand-navyLight">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-sky to-brand-tint flex items-center justify-center shadow-glow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-brand-navy"
                >
                  <circle cx="6" cy="12" r="3" fill="#0D2B40" />
                  <circle cx="18" cy="6" r="3" fill="#0D2B40" />
                  <circle cx="18" cy="18" r="3" fill="#0D2B40" />
                  <path
                    d="M8.5 10.5L15.5 7.5M8.5 13.5L15.5 16.5"
                    stroke="#0D2B40"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Inter<span className="text-brand-sky">Connect</span>
              </span>
            </Link>

            <p className="text-brand-tint/70 text-sm leading-relaxed max-w-sm">
              Connecting ambitious talent with companies building the future. A smart, transparent platform bridging high-growth tech companies with university student innovators.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navyLight text-brand-skyLight text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-sky" />
                Verified Talent Network
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navyLight text-brand-tint text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-sky" />
                Direct ATS Tracking
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-brand-navyLight hover:bg-brand-sky transition-colors flex items-center justify-center text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-brand-navyLight hover:bg-brand-sky transition-colors flex items-center justify-center text-white"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-brand-navyLight hover:bg-brand-sky transition-colors flex items-center justify-center text-white"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-brand-navyLight hover:bg-brand-sky transition-colors flex items-center justify-center text-white"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-brand-navyLight hover:bg-brand-sky transition-colors flex items-center justify-center text-white"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: PLATFORM */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-brand-sky font-bold mb-4">
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-tint/70">
              <li>
                <Link href="/students" className="hover:text-white transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/internships" className="hover:text-white transition-colors">
                  Internships Marketplace
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/company" className="hover:text-white transition-colors">
                  Employer ATS
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: RESOURCES */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-brand-sky font-bold mb-4">
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-tint/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Career Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Interview Mastery Tips
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student/profile" className="hover:text-white transition-colors">
                  Resume & Portfolio Studio
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  Employer Hiring Playbook
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-brand-sky font-bold mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-tint/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Mission & Values
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/internships" className="hover:text-white transition-colors">
                  Careers at InterConnect
                </Link>
              </li>
              <li>
                <Link href="/about#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-tint/60 gap-4">
          <p>© 2026 InterConnect Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Designed for Modern Career Acceleration</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-sky" />
            <span>Addis Ababa · San Francisco · Global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
