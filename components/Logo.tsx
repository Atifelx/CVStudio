'use client';

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * CV Studio Logo - Modern, Creative Studio Vibe
 * 
 * Design concept: A stylized document with creative flowing lines
 * representing the transformation of raw text into polished resumes.
 * The gradient gives it a modern SaaS feel.
 */
export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CV Studio Logo"
      role="img"
    >
      <defs>
        {/* Main gradient - vibrant blue to purple */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        
        {/* Accent gradient for creative elements */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        
        {/* Shadow for depth */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3B82F6" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Background rounded rectangle - document shape */}
      <rect
        x="8"
        y="4"
        width="40"
        height="52"
        rx="4"
        fill="url(#logoGradient)"
        filter="url(#shadow)"
      />
      
      {/* Folded corner effect */}
      <path
        d="M36 4 L48 4 L48 16 L36 16 Z"
        fill="#1E40AF"
        opacity="0.3"
      />
      <path
        d="M36 4 L48 16 L36 16 Z"
        fill="white"
        opacity="0.4"
      />
      
      {/* Text lines representing resume content */}
      <rect x="14" y="22" width="22" height="3" rx="1.5" fill="white" opacity="0.95"/>
      <rect x="14" y="29" width="18" height="2" rx="1" fill="white" opacity="0.7"/>
      <rect x="14" y="35" width="20" height="2" rx="1" fill="white" opacity="0.7"/>
      <rect x="14" y="41" width="16" height="2" rx="1" fill="white" opacity="0.7"/>
      
      {/* Creative "S" for Studio - flowing curve */}
      <path
        d="M50 20 C58 20 62 28 54 32 C46 36 50 44 58 44"
        stroke="url(#accentGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Sparkle dots - creative studio vibe */}
      <circle cx="54" cy="12" r="2" fill="#06B6D4" opacity="0.8"/>
      <circle cx="60" cy="20" r="1.5" fill="#8B5CF6" opacity="0.6"/>
      <circle cx="58" cy="50" r="1.5" fill="#3B82F6" opacity="0.7"/>
    </svg>
  );
}

/**
 * Simplified Logo for small sizes (favicon, etc.)
 */
export function LogoSimple({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CV Studio"
      role="img"
    >
      <defs>
        <linearGradient id="logoGradientSimple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Document */}
      <rect x="4" y="2" width="20" height="26" rx="2" fill="url(#logoGradientSimple)"/>
      
      {/* Folded corner */}
      <path d="M18 2 L24 8 L18 8 Z" fill="white" opacity="0.4"/>
      
      {/* Lines */}
      <rect x="7" y="12" width="12" height="2" rx="1" fill="white" opacity="0.9"/>
      <rect x="7" y="16" width="10" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
      <rect x="7" y="20" width="8" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
      
      {/* Studio S accent */}
      <path
        d="M25 10 C29 10 31 14 27 16 C23 18 25 22 29 22"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
