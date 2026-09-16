'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Cpu, 
  Lock,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  const isDashboard = pathname === '/dashboard';
  const isInvestigation = pathname.startsWith('/investigation');
  const isReports = pathname.startsWith('/reports');

  const navItems = [
    {
      label: 'Executive Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: isDashboard,
      badge: null,
    },
    {
      label: 'Investigation Room',
      href: '/investigation/EXC-101',
      icon: Search,
      active: isInvestigation,
      badge: '3 Critical',
      badgeClass: isMorning
        ? 'bg-rose-100 text-[#c51636] border border-rose-200'
        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      label: 'CFO Executive Report',
      href: '/reports',
      icon: FileText,
      active: isReports,
      badge: 'SOX Ready',
      badgeClass: isMorning
        ? ' border border-emerald-200'
        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
  ];

  return (
    <aside
      className={`w-64 shrink-0 mx-4 md:ml-6 md:mr-0 my-2 rounded-2xl backdrop-blur-xl flex flex-col justify-between p-4 select-none transition-all ${
        isMorning
          ? 'bg-white border border-[#eadbce] shadow-xs text-[#1c1917]'
          : 'bg-slate-900/1 border border-white/10 shadow-sm text-white'
      }`}
    >
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            Navigation
          </div>
          <nav className="mt-2 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    item.active
                      ? isMorning
                        ? 'bg-rose-50 text-[#c51636] border border-rose-200 shadow-sm'
                        : 'bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-transparent text-white border border-white/15'
                      : isMorning
                      ? 'text-[#57534e] hover:text-[#1c1917] hover:bg-[#f6efe6] border border-transparent'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        item.active
                          ? isMorning
                            ? 'bg-[#c51636] text-white'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isMorning
                          ? 'bg-[#fcfaf6] text-[#78716c] border border-[#eadbce]'
                          : 'bg-white/[0.04] text-slate-400 group-hover:text-white border border-white/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="tracking-tight text-[13px]">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Real-time Agent Mesh Card */}
        <div
          className={`rounded-xl p-3.5 space-y-2.5 border ${
            isMorning
              ? 'bg-[#fcfaf6] border-[#eadbce]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-xs font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              <Cpu className={`h-4 w-4 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`} />
              <span>Agent Core Mesh</span>
            </div>
            
          </div>

          <div className={`space-y-1.5 text-xs font-mono pt-1 border-t ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/5 text-slate-400'}`}>
            <div className="flex justify-between items-center">
              <span>Orchestrator:</span>
              <span className={`font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>Online (120ms)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Risk Investigator:</span>
              <span className={`font-semibold ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>94% Confidence</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Evidence Agent:</span>
              <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-indigo-400'}`}>3 Sources</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Challenge Agent:</span>
              <span className={`font-semibold ${isMorning ? 'text-amber-700' : 'text-amber-400'}`}>Gated</span>
            </div>
          </div>
        </div>

        {/* Active Exceptions Shortcut List */}
        <div>
          <div className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            Pending Gates
          </div>
          <div className="mt-2 space-y-1.5">
            <Link
              href="/investigation/EXC-101"
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                isMorning
                  ? 'bg-[#fcfaf6] hover:bg-rose-50/60 border-[#eadbce]'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/10'
              }`}
            >
              <div>
                <div className={`font-mono text-xs font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                  EXC-101 · ₹84,500
                </div>
                <div className={`text-[11px] truncate max-w-[130px] ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  Acme Systems (Duplicate)
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-rose-100 text-[#c51636] border border-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                Gate 2
              </span>
            </Link>

            <Link
              href="/investigation/EXC-102"
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                isMorning
                  ? 'bg-[#fcfaf6] hover:bg-amber-50/60 border-[#eadbce]'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/10'
              }`}
            >
              <div>
                <div className={`font-mono text-xs font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                  EXC-102 · ₹15,000
                </div>
                <div className={`text-[11px] truncate max-w-[130px] ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  TechCorp (Rate Variance)
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                Gate 3
              </span>
            </Link>

            <Link
              href="/investigation/EXC-103"
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                isMorning
                  ? 'bg-[#fcfaf6] hover:bg-emerald-50/60 border-[#eadbce]'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/10'
              }`}
            >
              <div>
                <div className={`font-mono text-xs font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                  EXC-103 · ₹1,80,000
                </div>
                <div className={`text-[11px] truncate max-w-[130px] ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  Global Logistics (Spike)
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                Direct
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t pt-3.5 text-xs font-mono ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Lock className={`h-3.5 w-3.5 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`} />
            <span>SOX / SOC-2 Type II</span>
          </div>
          <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>v4.2</span>
        </div>
      </div>
    </aside>
  );
}
