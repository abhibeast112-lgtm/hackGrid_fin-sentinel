'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Search, ChevronDown, Command } from 'lucide-react';

export function Navbar() {
  const [fastApiConnected, setFastApiConnected] = useState<boolean | null>(null);

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
    <header className="sticky top-0 z-40 w-full border-b border-[#233c46] bg-[#132228]/95 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between px-6">
        {/* Brand & Organization */}
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-[#F5EED2] hover:opacity-90 transition-opacity">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#172a31] border border-[#233c46] text-[#EBAE29]">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#F5EED2]">
              Fin-Sentinel
            </span>
          </Link>

          {/* Org Selector (Linear/Vercel style) */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#233c46]">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#172a31] border border-[#233c46] text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#589C80]" />
              <span className="text-[#8aa1aa] text-[11px]">ORG</span>
              <span className="font-medium text-[#F5EED2]">
                Acme Manufacturing Pvt. Ltd.
              </span>
              <ChevronDown className="h-3 w-3 text-[#8aa1aa]" />
            </div>
          </div>
        </div>

        {/* Center Search Input (Stripe / Linear style) */}
        <div className="hidden md:flex items-center">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8aa1aa]" />
            <input
              type="text"
              placeholder="Search exceptions, vendors, invoices..."
              className="w-full h-7 pl-8 pr-10 rounded-sm bg-[#0e181c] border border-[#233c46] text-xs text-[#F5EED2] placeholder:text-[#6c858f] focus:outline-none focus:border-[#EBAE29] transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-sm bg-[#172a31] border border-[#233c46] text-[10px] font-mono text-[#8aa1aa]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Status & Profile */}
        <div className="flex items-center gap-4">
          {/* Live Engine Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#0e181c] border border-[#233c46] text-[11px] font-mono">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                fastApiConnected ? 'bg-[#589C80]' : 'bg-[#EBAE29]'
              }`}
            />
            <span className="text-[#8aa1aa]">
              {fastApiConnected ? 'API :8000' : 'LOCAL CACHE'}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#233c46]">
            <div className="h-6 w-6 rounded-sm bg-[#172a31] border border-[#233c46] flex items-center justify-center text-[10px] font-mono font-medium text-[#EBAE29]">
              FC
            </div>
            <span className="hidden xl:inline text-xs font-medium text-[#F5EED2]">
              Abhinav K.
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
