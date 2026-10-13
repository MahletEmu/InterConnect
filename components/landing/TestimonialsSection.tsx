'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote:
        'I applied to internships for months without knowing which companies were actually a good fit. InterConnect helped me discover an opportunity that matched my skills perfectly. I received an offer from TechNova within two weeks of applying.',
      name: 'Maya Tesfaye',
      role: 'Computer Science Student',
      university: 'Stanford University (Formerly AAiT)',
      image: '/images/testimonial-student.jpg',
      badge: 'Student Success Story',
    },
    {
      id: 2,
      quote:
        'InterConnect helped us reduce the time we spend searching for qualified interns while giving us access to students we would have never found through traditional recruitment. The verified skills and project links make screening effortless.',
      name: 'Daniel Carter',
      role: 'Head of Technical Talent',
      university: 'Nova Systems',
      image: '/images/testimonial-recruiter.jpg',
      badge: 'Employer Spotlight',
    },
    {
      id: 3,
      quote:
        'The transparent application timeline and built-in interview calendar removed all the anxiety from recruitment. You never have to wonder if your application disappeared into a corporate black hole.',
      name: 'Alex Morgan',
      role: 'Full-Stack Developer Intern',
      university: 'Addis Ababa Institute of Technology',
      image: '/images/hero-student.jpg',
      badge: 'Intern Perspective',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? testimonials.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === testimonials.length - 1 ? 0 : prevIdx + 1));
  };

  const active = testimonials[currentIndex];

  return (
    <section className="relative py-12 sm:py-14 bg-brand-canvas overflow-hidden">
      {/* Background organic wave shapes */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[700px] h-[350px] bg-brand-tint/60 rounded-t-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-sky bg-brand-tint px-3 py-1 rounded-full border border-brand-sky/20">
            Real Stories & Impact
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-4.5xl text-brand-navy mt-2.5 mb-2 tracking-tight">
            What Happens When Talent Meets Opportunity
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            Hear from students building their careers and the recruitment leaders discovering them.
          </p>
        </div>

        {/* The Large Featured Testimonial Card (Inspired directly by Cakap Testimonial Card) */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-float border border-brand-border relative">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">

            {/* Person Image with circular/rounded crop */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-card border-4 border-brand-tint">
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Testimonial Content & Quote */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-tint text-brand-sky flex items-center justify-center">
                    <Quote className="w-4 h-4 fill-brand-sky" />
                  </div>
                  <span className="text-xs font-bold text-brand-navy bg-brand-canvas px-3 py-1 rounded-full border border-brand-border">
                    {active.badge}
                  </span>
                </div>

                <p className="font-heading text-base sm:text-lg text-brand-navy leading-relaxed italic mb-4">
                  &ldquo;{active.quote}&rdquo;
                </p>
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-base text-brand-navy">
                  {active.name}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-brand-sky">{active.role}</p>
                <p className="text-xs text-brand-muted">{active.university}</p>
              </div>

            </div>

          </div>

          {/* Interactive Navigation Controls (Arrows) */}
          <div className="flex items-center justify-between sm:justify-end gap-3 mt-6 pt-4 border-t border-brand-border/60">
            <span className="text-xs font-bold text-brand-muted sm:hidden">
              Story {currentIndex + 1} of {testimonials.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full bg-brand-canvas hover:bg-brand-tint text-brand-navy border border-brand-border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full bg-brand-navy hover:bg-brand-navyLight text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-subtle"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
