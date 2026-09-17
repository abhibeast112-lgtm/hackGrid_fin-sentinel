'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, ChevronDown, Command, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function Navbar() {
  const [fastApiConnected, setFastApiConnected] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isMorning = theme === 'morning';

  useEffect(() => {
    const checkFastAPI = async () => {
      try {
        const res = await fetch('http://localhost:8000/health', {
          method: 'GET',
          signal: AbortSignal.timeout(1200),
        });
        setFastApiConnected(res.ok);
      } catch {
        setFastApiConnected(false);
      }
    };
    checkFastAPI();
    const probe = setInterval(checkFastAPI, 10000);
    return () => clearInterval(probe);
  }, []);

  return (
    <header className="sticky top-3 z-40 mx-4 md:mx-6 my-2">
      <div
        className={`flex h-14 items-center justify-between px-3.5 md:px-5 rounded-2xl transition-all liquid-glass ${
          isMorning ? 'text-[#1c1917]' : 'text-white'
        }`}
      >
        {/* Brand & Organization Title Cards */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Main Brand Title Card */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl liquid-glass-pill group transition-all hover:scale-[1.02]"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all shadow-inner ${
                isMorning
                  ? 'bg-rose-50/80 border border-rose-200/80 text-[#c51636]'
                  : 'bg-gradient-to-br from-white/15 to-white/5 border border-white/20 text-white'
              }`}
            >
              <Shield className="h-4 w-4 drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Fin-Sentinel
                <span
                  className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] ${
                    isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'
                  }`}
                />
              </span>
              <span className={`text-[10px] font-mono tracking-wider uppercase -mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-300/80'}`}>
                Financial Control Tower
              </span>
            </div>
          </Link>

          {/* Org Selector Title Card */}
          <div className="hidden sm:flex items-center">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer liquid-glass-pill hover:scale-[1.02]"
            >
              <span className={`text-[10px] font-mono font-bold tracking-wider ${isMorning ? 'text-[#78716c]' : 'text-slate-300/90'}`}>
                ORG:
              </span>
              <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Acme Manufacturing Pvt. Ltd.
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Center Search Liquid Glass Pill */}
        <div className="hidden md:flex items-center">
          <div className="relative w-72 lg:w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isMorning ? 'text-[#a8a29e]' : 'text-slate-300/80'}`} />
            <input
              type="text"
              placeholder="Search exceptions, invoices, POs..."
              className={`w-full h-8 pl-10 pr-12 rounded-xl text-xs transition-all focus:outline-none liquid-glass-pill ${
                isMorning
                  ? 'text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#c51636]'
                  : 'text-white placeholder:text-slate-400 focus:border-white/40'
              }`}
            />
            <kbd
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                isMorning
                  ? 'bg-black/5 text-[#78716c]'
                  : 'bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Command className="h-2.5 w-2.5 inline mr-0.5" />K
            </kbd>
          </div>
        </div>

        {/* Right Controls & Theme Switcher Title Cards */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Morning / Dark Mode Switcher Pill */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all liquid-glass-pill hover:scale-105 active:scale-95 ${
              isMorning
                ? 'text-[#c51636]'
                : 'text-amber-300'
            }`}
            title={isMorning ? 'Switch to Night Mode' : 'Switch to Morning Mode (Red & Cream)'}
          >
            {isMorning ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#c51636]" />
                <span className="font-mono text-[11px]">Morning</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-amber-300" />
                <span className="font-mono text-[11px]">Night</span>
              </>
            )}
          </button>

          {/* Engine Status Title Card */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono liquid-glass-pill"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)] ${
                isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'
              }`}
            />
            <span className={isMorning ? 'text-[#c51636]' : 'text-emerald-400'}>
              {fastApiConnected ? 'API :8000' : 'LOCAL CACHE'}
            </span>
          </div>

          {/* User Profile Title Card */}
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl liquid-glass-pill cursor-pointer hover:scale-[1.02]">
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-inner ${
                isMorning
                  ? 'bg-rose-100/90 text-[#c51636] border border-rose-200'
                  : 'bg-gradient-to-tr from-emerald-500/25 via-indigo-500/30 to-purple-500/25 border border-white/20 text-white'
              }`}
            >
              FC
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className={`text-xs font-semibold leading-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>Obama bin ladden</span>
              <span className={`text-[10px] font-mono leading-tight ${isMorning ? 'text-[#78716c]' : 'text-slate-300/80'}`}>Chief Controller</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
