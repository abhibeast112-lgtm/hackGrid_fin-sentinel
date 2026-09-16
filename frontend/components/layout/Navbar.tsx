'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, Bell, Activity, RefreshCw, CheckCircle2, ChevronDown, Command } from 'lucide-react';

export function Navbar() {
  const [fastApiConnected, setFastApiConnected] = useState<boolean | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if FastAPI backend is reachable on port 8000
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top micro-gradient indicator bar with the exact #021C4F to #C50337 gradient */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#021C4F] via-[#75113d] to-[#C50337]" />

      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand & Organization */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            {/* Custom Shield emblem with Fin-Sentinel gradient background */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#021C4F] to-[#C50337] p-0.5 shadow-lg shadow-[#C50337]/20 transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-slate-950/70">
                <Shield className="h-5 w-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white font-[family-name:var(--font-display)] flex items-center gap-1.5">
                Fin-Sentinel
                <span className="text-sm">🛡️</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-rose-400 font-mono">
                AI Financial Control Tower
              </span>
            </div>
          </Link>

          {/* Org Switcher / Indicator */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-[11px]">ACTIVE ORG:</span>
              <span className="font-semibold text-slate-100 font-[family-name:var(--font-display)]">
                Acme Manufacturing Pvt. Ltd.
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              CIN: L72200MH1998PLC115239
            </span>
          </div>
        </div>

        {/* Center Search / Command bar */}
        <div className="hidden lg:flex items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search exceptions, invoices, POs, vendors..."
              className="w-full h-8 pl-9 pr-12 rounded-md bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#C50337] focus:ring-1 focus:ring-[#C50337] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-400">
              <Command className="h-2.5 w-2.5" /> K
            </div>
          </div>
        </div>

        {/* Right Status Indicators & User Profile */}
        <div className="flex items-center gap-3">
          {/* Live System Clock & Backend status */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span className="text-slate-400">PIPELINE:</span>
              <span className="text-emerald-400 font-semibold">4 AGENTS ACTIVE</span>
            </div>

            {/* FastAPI Engine Status Pill */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                fastApiConnected === true
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title={fastApiConnected ? 'Connected to FastAPI :8000' : 'Operating with in-memory Next.js engine'}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  fastApiConnected ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
              <span className="text-[10px]">
                {fastApiConnected ? 'FASTAPI :8000' : 'LOCAL ENGINE'}
              </span>
            </div>

            <div className="px-2 py-1 rounded bg-slate-900/50 border border-slate-800 text-[11px] font-mono text-slate-400">
              {currentTime || '21:30:00'} IST
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#021C4F] to-[#C50337] p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-rose-300 font-mono">
                FC
              </div>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200">Abhinav K.</span>
              <span className="text-[10px] text-slate-400">Financial Controller</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
