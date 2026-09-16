'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Lock,
  ArrowRight
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
      badge: '3 Open',
      badgeClass: 'bg-red-500/10 text-red-400 border border-red-500/20',
    },
    {
      label: 'CFO Executive Report',
      href: '/reports',
      icon: FileText,
      active: isReports,
      badge: 'SOX Ready',
      badgeClass: 'bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20',
    },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-[#233c46] bg-[#132228] flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-[#8aa1aa]">
            Views
          </div>
          <nav className="mt-1.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    item.active
                      ? 'bg-[#172a31] text-[#F5EED2] border border-[#233c46]'
                      : 'text-[#8aa1aa] hover:text-[#F5EED2] hover:bg-[#172a31]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${item.active ? 'text-[#EBAE29]' : 'text-[#8aa1aa] group-hover:text-[#F5EED2]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pipeline Telemetry - Clean Minimalist Box */}
        <div className="rounded-sm border border-[#233c46] bg-[#172a31]/50 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#F5EED2]">
              <Cpu className="h-3 w-3 text-[#589C80]" />
              <span>Pipeline Status</span>
            </div>
            <span className="text-[10px] font-mono text-[#589C80]">4 Active</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-[#8aa1aa] pt-1 border-t border-[#233c46]">
            <div className="flex justify-between">
              <span>Orchestrator:</span>
              <span className="text-[#F5EED2]">Online</span>
            </div>
            <div className="flex justify-between">
              <span>Investigator:</span>
              <span className="text-[#589C80]">Ready</span>
            </div>
            <div className="flex justify-between">
              <span>Evidence Agent:</span>
              <span className="text-[#F5EED2]">3 Feeds</span>
            </div>
            <div className="flex justify-between">
              <span>Challenge Agent:</span>
              <span className="text-[#EBAE29]">Refuting H1</span>
            </div>
          </div>
        </div>

        {/* Pending Exceptions Quick List */}
        <div>
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-[#8aa1aa]">
            Pending Review
          </div>
          <div className="mt-1 space-y-1">
            <Link
              href="/investigation/EXC-101"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-[#172a31]/30 hover:bg-[#172a31] border border-[#233c46] text-xs transition-colors"
            >
              <div>
                <div className="font-mono text-xs text-[#F5EED2]">EXC-101</div>
                <div className="text-[10px] text-[#8aa1aa] truncate max-w-[120px]">Acme Systems</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-red-400">₹84.5k</div>
                <div className="text-[10px] font-mono text-[#8aa1aa]">94%</div>
              </div>
            </Link>

            <Link
              href="/investigation/EXC-102"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-[#172a31]/30 hover:bg-[#172a31] border border-[#233c46] text-xs transition-colors"
            >
              <div>
                <div className="font-mono text-xs text-[#F5EED2]">EXC-102</div>
                <div className="text-[10px] text-[#8aa1aa] truncate max-w-[120px]">TechCorp</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-red-400">₹15k</div>
                <div className="text-[10px] font-mono text-[#8aa1aa]">82%</div>
              </div>
            </Link>

            <Link
              href="/investigation/EXC-103"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-sm bg-[#172a31]/30 hover:bg-[#172a31] border border-[#233c46] text-xs transition-colors"
            >
              <div>
                <div className="font-mono text-xs text-[#F5EED2]">EXC-103</div>
                <div className="text-[10px] text-[#8aa1aa] truncate max-w-[120px]">Global Logistics</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-[#EBAE29]">₹1.8L</div>
                <div className="text-[10px] font-mono text-[#8aa1aa]">76%</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#233c46] pt-3 text-[11px] font-mono text-[#8aa1aa] flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-[#589C80]" />
          <span>SOX / SOC-2</span>
        </div>
        <span>v4.2</span>
      </div>
    </aside>
  );
}
