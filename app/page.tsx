'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import InternshipDiscovery from '@/components/landing/InternshipDiscovery';
import CompanyDiscovery from '@/components/landing/CompanyDiscovery';
import SmartMatchSection from '@/components/landing/SmartMatchSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas selection:bg-brand-tint selection:text-brand-navy">
      {/* 1. Sticky Glass Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Live Internship Opportunities Marketplace */}
      <InternshipDiscovery />

      {/* 4. Verified Employers Directory Preview */}
      <CompanyDiscovery />

      {/* 5. Smart Matching Simulator */}
      <SmartMatchSection />

      {/* 6. Call To Action */}
      <CTASection />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
