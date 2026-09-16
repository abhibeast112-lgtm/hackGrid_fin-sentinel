'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-context';

export function BusinessBackground() {
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  if (isMorning) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300">
        {/* Morning Mode: Warm Cream Background with Soft Red / Crimson Lighting */}
        <div className="absolute inset-0 bg-[#fbf8f2]" />

        {/* Ambient Warm Red & Amber Spotlights */}
        <div className="absolute -top-32 -left-32 w-[750px] h-[750px] rounded-full bg-[#c51636]/[0.05] blur-[140px]" />
        <div className="absolute top-12 right-[-10%] w-[800px] h-[800px] rounded-full bg-rose-500/[0.04] blur-[160px]" />
        <div className="absolute top-[40%] left-[25%] w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[700px] h-[700px] rounded-full bg-[#c51636]/[0.04] blur-[160px]" />

        {/* Top Horizon Red Sheen */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c51636]/25 to-transparent" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[90px] bg-gradient-to-b from-[#c51636]/[0.04] via-transparent to-transparent blur-xl" />

        {/* Flowing Red/Terracotta Financial Ledger Waves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.18]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <linearGradient id="morningWave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c51636" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#e11d48" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="morningWave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c51636" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <path
            d="M-100 250 C 300 120, 600 380, 1100 210 C 1500 80, 1800 290, 2200 190"
            stroke="url(#morningWave1)"
            strokeWidth="1.5"
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
            strokeWidth="1.5"
          />
          <path
            d="M-100 620 C 450 490, 750 740, 1250 580 C 1650 460, 1950 660, 2300 550"
            stroke="url(#morningWave2)"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Cream Precision Grid with Subtle Red Crosshairs */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.22]"
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
                stroke="#c51636"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
              <circle cx="32" cy="32" r="0.75" fill="#c51636" fillOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#morningGrid)" />
        </svg>

        {/* Soft Cream Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(251,248,242,0.65)_100%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300">
      {/* Dark Mode Background */}
      <div className="absolute inset-0 bg-[#0b0d13]" />

      {/* Ambient Lighting Aura */}
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-emerald-500/[0.08] blur-[150px]" />
      <div className="absolute top-10 right-[-15%] w-[850px] h-[850px] rounded-full bg-indigo-600/[0.09] blur-[170px]" />
      <div className="absolute top-[45%] left-[20%] w-[650px] h-[650px] rounded-full bg-cyan-600/[0.05] blur-[160px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[750px] h-[750px] rounded-full bg-emerald-600/[0.06] blur-[180px]" />

      {/* Top Horizon Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Institutional Finance Waves */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14] stroke-slate-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <path
          d="M-100 250 C 300 120, 600 380, 1100 210 C 1500 80, 1800 290, 2200 190"
          stroke="url(#waveGradient1)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M-100 290 C 350 160, 650 420, 1150 250 C 1550 120, 1850 330, 2200 230"
          stroke="url(#waveGradient1)"
          strokeWidth="1"
          strokeOpacity="0.7"
        />
        <path
          d="M-100 580 C 400 450, 700 700, 1200 540 C 1600 420, 1900 620, 2300 510"
          stroke="url(#waveGradient2)"
          strokeWidth="1.5"
        />
        <path
          d="M-100 620 C 450 490, 750 740, 1250 580 C 1650 460, 1950 660, 2300 550"
          stroke="url(#waveGradient2)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.18]"
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
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M 0 3 L 0 -3 M -3 0 L 3 0"
              stroke="rgba(16, 185, 129, 0.45)"
              strokeWidth="1"
            />
            <circle cx="32" cy="32" r="0.75" fill="rgba(255, 255, 255, 0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#enterpriseGrid)" />
      </svg>

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,13,19,0.7)_100%)]" />
    </div>
  );
}
