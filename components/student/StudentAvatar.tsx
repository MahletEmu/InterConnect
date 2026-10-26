'use client';

import React from 'react';
import Image from 'next/image';

interface StudentAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFirstWord?: boolean;
}

export default function StudentAvatar({
  avatar,
  name,
  size = 'md',
  className = '',
  showFirstWord = false,
}: StudentAvatarProps) {
  const effectiveName = (name || 'Student').trim();
  const firstWord = effectiveName.split(' ')[0] || 'Student';
  const firstLetter = firstWord.charAt(0).toUpperCase();

  const isRealPhoto = Boolean(
    avatar &&
    avatar.trim() !== '' &&
    !avatar.includes('hero-student.jpg')
  );

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full text-xs font-bold',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold',
    lg: 'w-12 h-12 rounded-2xl text-base font-extrabold',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-2xl sm:text-3xl font-extrabold',
  }[size];

  if (isRealPhoto && avatar) {
    return (
      <div className={`relative overflow-hidden shrink-0 ${sizeClasses} ${className}`}>
        <Image
          src={avatar}
          alt={effectiveName}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Display Student's First Word / Initial Avatar
  return (
    <div
      className={`relative overflow-hidden shrink-0 bg-gradient-to-tr from-brand-navy via-[#0f233d] to-brand-sky text-white flex flex-col items-center justify-center select-none shadow-2xs border border-white/20 ${sizeClasses} ${className}`}
      title={effectiveName}
    >
      <span className="leading-none tracking-tight">{firstLetter}</span>
      {showFirstWord && (
        <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider max-w-[72px] truncate px-1 mt-1 text-center">
          {firstWord}
        </span>
      )}
    </div>
  );
}
