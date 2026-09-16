'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-context';

export function BusinessBackground() {
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  if (isMorning) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300">
        {/* Morning Mode: Warm Cream Background (Flat, clean, no red glow) */}
        <div className="absolute inset-0 bg-[#fbf8f2]" />

        {/* Top Horizon Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#eadbce]" />

        {/* Institutional Flow Lines (Warm Taupe/Stone, non-glowing) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.14]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <linearGradient id="morningWave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c7b5a3" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#bfaea0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a89688" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="morningWave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bfaea0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c7b5a3" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <path
            d="M-100 250 C 300 120, 600 380, 1100 210 C 1500 80, 1800 290, 2200 190"
            stroke="url(#morningWave1)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M-100 290 C 350 160, 650 420, 1150 250 C 1550 120, 1850 330, 2200 230"
            stroke="url(#morningWave1)"
            strokeWidth="1"
          />
          <path
            d="M-100 580 C 400 450, 700 700, 1200 540 C 1600 420, 1900 620, 2300 510"
            stroke="url(#morningWave2)"
            strokeWidth="1.2"
          />
          <path
            d="M-100 620 C 450 490, 750 740, 1250 580 C 1650 460, 1950 660, 2300 550"
            stroke="url(#morningWave2)"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Cream Precision Grid with Neutral Stone Crosshairs */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.2]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="morningGrid"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="#eadbce"
                strokeWidth="0.8"
              />
              <path
                d="M 0 3 L 0 -3 M -3 0 L 3 0"
                stroke="#bfaea0"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />
              <circle cx="32" cy="32" r="0.6" fill="#bfaea0" fillOpacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#morningGrid)" />
        </svg>

        {/* Subtle Edge Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(251,248,242,0.5)_100%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300">
      {/* Dark Mode Background (Pure flat neutral charcoal, zero emerald glow) */}
      <div className="absolute inset-0 bg-[#0b0d13]" />

      {/* Top Horizon Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      {/* Institutional Finance Waves (Neutral Monochromatic Slate) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#334155" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <path
          d="M-100 250 C 300 120, 600 380, 1100 210 C 1500 80, 1800 290, 2200 190"
          stroke="url(#waveGradient1)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path
          d="M-100 290 C 350 160, 650 420, 1150 250 C 1550 120, 1850 330, 2200 230"
          stroke="url(#waveGradient1)"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <path
          d="M-100 580 C 400 450, 700 700, 1200 540 C 1600 420, 1900 620, 2300 510"
          stroke="url(#waveGradient2)"
          strokeWidth="1.2"
        />
        <path
          d="M-100 620 C 450 490, 750 740, 1250 580 C 1650 460, 1950 660, 2300 550"
          stroke="url(#waveGradient2)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Grid Pattern with Neutral Subtle Crosshairs */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="enterpriseGrid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="0.75"
            />
            <path
              d="M 0 3 L 0 -3 M -3 0 L 3 0"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="0.8"
            />
            <circle cx="32" cy="32" r="0.6" fill="rgba(255, 255, 255, 0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#enterpriseGrid)" />
      </svg>

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,13,19,0.7)_100%)]" />
    </div>
  );
}
