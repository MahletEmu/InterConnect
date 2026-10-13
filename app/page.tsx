'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustSection from '@/components/landing/TrustSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import SmartMatchSection from '@/components/landing/SmartMatchSection';
import ForStudentsSection from '@/components/landing/ForStudentsSection';
import ForCompaniesSection from '@/components/landing/ForCompaniesSection';
import InternshipDiscovery from '@/components/landing/InternshipDiscovery';
import CompanyDiscovery from '@/components/landing/CompanyDiscovery';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ImpactSection from '@/components/landing/ImpactSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-canvas selection:bg-brand-tint selection:text-brand-navy">
      {/* 1. Sticky Glass Navbar */}
      <Navbar />

      {/* 2. Asymmetric Hero Section with Floating Cards & Connection Motifs */}
      <HeroSection />

      {/* 3 & 4. Social Proof Company Logos & Animated Stats */}
      <TrustSection />

      {/* 5. Core Platform Features (Cakap Services Inspired Rhythm) */}
      <FeaturesSection />

      {/* 6. Interactive How It Works with Student / Company Toggle */}
      <HowItWorksSection />

      {/* 7. Smart Matching Simulator with Granular Compatibility Metrics */}
      <SmartMatchSection />

      {/* 8. For Students with Profile Studio Mockup & Checklist */}
      <ForStudentsSection />

      {/* 9. For Companies with ATS Pipeline Dashboard Preview */}
      <ForCompaniesSection />

      {/* 10. Internship Discovery Marketplace Live Preview */}
      <InternshipDiscovery />

      {/* 11. Company Discovery Showcase */}
      <CompanyDiscovery />

      {/* 12. Success Stories Interactive Testimonial Slider */}
      <TestimonialsSection />

      {/* 13. Platform Impact Numbers Bar */}
      <ImpactSection />

      {/* 14. Curved Light-Blue Call To Action with Wave Transitions */}
      <CTASection />

      {/* 15. Dark Navy Comprehensive Footer */}
      <Footer />
    </main>
  );
}
