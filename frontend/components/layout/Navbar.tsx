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
        const res = await fetch('http://localhost:8000/api/exceptions', {
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
        className={`flex h-14 items-center justify-between px-5 rounded-2xl backdrop-blur-xl transition-all ${
          isMorning
            ? 'bg-white/85 border border-[#eadbce] shadow-[0_4px_20px_rgba(197,22,54,0.05)] text-[#1c1917]'
            : 'bg-slate-900/60 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-white'
        }`}
      >
        {/* Brand & Organization */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                isMorning
                  ? 'bg-rose-50 border border-rose-200 text-[#c51636]'
                  : 'bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Fin-Sentinel
                <span
                  className={`h-2 w-2 rounded-full ${
                    isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'
                  }`}
                />
              </span>
              <span className={`text-[11px] font-medium -mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Financial Control Tower
              </span>
            </div>
          </Link>

          {/* Org Selector Pill */}
          <div className={`hidden sm:flex items-center gap-2 pl-4 border-l ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs transition-colors cursor-pointer ${
                isMorning
                  ? 'bg-[#fcfaf6] hover:bg-[#f6efe6] border border-[#eadbce]'
                  : 'bg-white/[0.04] hover:bg-white/[0.07] border border-white/10'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'}`} />
              <span className={`text-[11px] font-medium ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>ORG:</span>
              <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Acme Manufacturing Pvt. Ltd.
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="hidden md:flex items-center">
          <div className="relative w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isMorning ? 'text-[#a8a29e]' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search exceptions, invoices, POs..."
              className={`w-full h-8 pl-10 pr-12 rounded-xl text-xs transition-all focus:outline-none ${
                isMorning
                  ? 'bg-[#fcfaf6] border border-[#eadbce] text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#c51636] focus:bg-white'
                  : 'bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:bg-white/[0.06]'
              }`}
            />
            <kbd
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                isMorning
                  ? 'bg-[#f6efe6] border border-[#eadbce] text-[#78716c]'
                  : 'bg-white/[0.06] border border-white/10 text-slate-400'
              }`}
            >
              <Command className="h-2.5 w-2.5 inline mr-0.5" />K
            </kbd>
          </div>
        </div>

        {/* Right Controls & Theme Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Morning / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
              isMorning
                ? 'bg-rose-50 text-[#c51636] border-rose-200 hover:bg-rose-100'
                : 'bg-white/[0.05] text-amber-300 border-white/10 hover:bg-white/[0.08]'
            }`}
            title={isMorning ? 'Switch to Night Mode' : 'Switch to Morning Mode (Red & Cream)'}
          >
            {isMorning ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#c51636]" />
                <span className="font-mono text-[11px]">Morning Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-amber-300" />
                <span className="font-mono text-[11px]">Night Mode</span>
              </>
            )}
          </button>

          {/* Engine Status */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono ${
              isMorning
                ? 'bg-rose-50 border border-rose-200 text-[#c51636]'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'
              }`}
            />
            <span>{fastApiConnected ? 'API :8000' : 'LOCAL CACHE'}</span>
          </div>

          {/* User Profile */}
          <div className={`flex items-center gap-2 pl-2 border-l ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                isMorning
                  ? 'bg-rose-50 text-[#c51636] border border-rose-200'
                  : 'bg-gradient-to-tr from-emerald-500/20 to-indigo-500/30 border border-white/15 text-white'
              }`}
            >
              FC
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className={`text-xs font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>Abhinav K.</span>
              <span className={`text-[10px] ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>Chief Controller</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
