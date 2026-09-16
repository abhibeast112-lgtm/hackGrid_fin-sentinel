'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  LayoutDashboard, 
  Search, 
  Scale, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  Lock,
  ArrowUpRight
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

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
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse',
    },
    {
      label: 'CFO Executive Report',
      href: '/reports',
      icon: FileText,
      active: isReports,
      badge: 'SOX Ready',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Control Tower Views
          </div>
          <nav className="mt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    item.active
                      ? 'bg-gradient-to-r from-[#021C4F]/90 to-[#C50337]/30 text-white border border-[#C50337]/50 shadow-md shadow-[#C50337]/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        item.active
                          ? 'bg-[#C50337] text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-[family-name:var(--font-display)] tracking-wide">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Real-Time Agent Mesh Status */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200 font-[family-name:var(--font-display)]">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              Agent Core Status
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Orchestrator:</span>
              <span className="text-emerald-400 font-medium">ONLINE (0.1s)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Risk Investigator:</span>
              <span className="text-emerald-400 font-medium">READY (94% conf)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Evidence Harvester:</span>
              <span className="text-emerald-400 font-medium">3 STREAMS</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Adversarial Engine:</span>
              <span className="text-rose-400 font-medium">REFUTING H1</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Audit Protocol</span>
            <span className="text-slate-300 font-mono">SHA-256 HMAC</span>
          </div>
        </div>

        {/* Quick Anomaly Shortcuts */}
        <div>
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Pending Human Action
          </div>
          <div className="mt-1 space-y-1">
            <Link
              href="/investigation/EXC-101"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/30 hover:bg-slate-900 border border-slate-800/60 text-xs transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-mono text-rose-400 font-semibold group-hover:underline flex items-center gap-1">
                  EXC-101 · ₹84,500
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  Acme Systems (Duplicate)
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded">
                94%
              </span>
            </Link>

            <Link
              href="/investigation/EXC-102"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/30 hover:bg-slate-900 border border-slate-800/60 text-xs transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-mono text-rose-400 font-semibold group-hover:underline flex items-center gap-1">
                  EXC-102 · ₹15,000
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  TechCorp (Rate Variance)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                82%
              </span>
            </Link>

            <Link
              href="/investigation/EXC-103"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/30 hover:bg-slate-900 border border-slate-800/60 text-xs transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-mono text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                  EXC-103 · ₹1,80,000
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  Global Logistics (Spike)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                76%
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Compliance & Terminal Footnote */}
      <div className="border-t border-slate-800/80 pt-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>SOX / SOC-2 Type II</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v4.2-ENT</span>
        </div>
        <div className="px-2.5 py-1.5 rounded bg-gradient-to-r from-[#021C4F]/60 to-[#C50337]/30 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-mono">
          <span>CONTROL TERMINAL</span>
          <span className="text-emerald-400 font-bold">ARMED</span>
        </div>
      </div>
    </aside>
  );
}
