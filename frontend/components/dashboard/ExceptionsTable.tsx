'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FinancialException } from '@/lib/types';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2,
  AlertTriangle,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface ExceptionsTableProps {
  exceptions: FinancialException[];
  onRefresh?: () => void;
}

export function ExceptionsTable({ exceptions }: ExceptionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  const filteredExceptions = exceptions.filter((exc) => {
    const matchesSearch =
      exc.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.exception_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.invoice_no.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRisk === 'ALL' ||
      (selectedRisk === 'HIGH' && exc.risk_score >= 80) ||
      (selectedRisk === 'MED' && exc.risk_score >= 70 && exc.risk_score < 80);

    return matchesSearch && matchesRisk;
  });

  const renderRiskBadge = (score: number, level: string) => {
    if (score >= 80) {
      return (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${
            isMorning
              ? 'bg-rose-100 text-[#c51636] border border-rose-200'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-rose-500'}`} />
          {level} ({score}%)
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${
          isMorning
            ? 'bg-amber-100 text-amber-800 border border-amber-200'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-amber-600' : 'bg-amber-400'}`} />
        {level} ({score}%)
      </span>
    );
  };

  const renderStatusBadge = (status: string, requiresApproval: boolean, currentStep: number) => {
    if (status.includes('Resolved: REJECT') || status.includes('RESOLVED_REJECT')) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
            isMorning
              ? 'bg-rose-100 text-[#c51636] border border-rose-200'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <XCircle className="h-3.5 w-3.5" />
          Blocked & Quarantined
        </span>
      );
    }
    if (status.includes('Resolved: APPROVE') || status.includes('RESOLVED_APPROVE')) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
            isMorning
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved by Controller
        </span>
      );
    }
    if (status.includes('Resolved: ESCALATE') || status.includes('RESOLVED_ESCALATE')) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
            isMorning
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Escalated to CFO
        </span>
      );
    }

    if (requiresApproval) {
      return (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              isMorning
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-amber-600' : 'bg-amber-400'}`} />
            Gate {currentStep}/4 Paused
          </span>
          <span className={`text-[11px] font-mono pl-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            Tiered Checkpoint Required
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
            isMorning
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          All 4 Gates Auto-Verified
        </span>
        <span className={`text-[11px] font-mono pl-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
          Awaiting Final Sign-off
        </span>
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md overflow-hidden transition-all ${
        isMorning
          ? 'bg-white/85 border-[#eadbce] shadow-[0_4px_20px_rgba(197,22,54,0.05)] text-[#1c1917]'
          : 'bg-slate-900/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-white'
      }`}
    >
      {/* Table Header & Controls */}
      <div className={`p-6 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isMorning
                  ? 'bg-rose-50 border border-rose-200 text-[#c51636]'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Critical Financial Exceptions
              </h2>
              <p className={`text-xs mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Active cross-ledger variances intercepted prior to payment clearing
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                isMorning
                  ? 'bg-[#fcfaf6] border-[#eadbce] text-[#78716c]'
                  : 'bg-white/[0.06] border-white/10 text-slate-300'
              }`}
            >
              {filteredExceptions.length} Events Flagged
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Risk Level Toggles */}
          <div
            className={`flex items-center rounded-xl p-1 border text-xs font-mono ${
              isMorning
                ? 'bg-[#fcfaf6] border-[#eadbce]'
                : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <button
              onClick={() => setSelectedRisk('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRisk === 'ALL'
                  ? isMorning
                    ? 'bg-white text-[#1c1917] font-bold shadow-xs border border-[#eadbce]'
                    : 'bg-white/10 text-white font-bold shadow-sm'
                  : isMorning
                  ? 'text-[#78716c] hover:text-[#1c1917]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Anomalies
            </button>
            <button
              onClick={() => setSelectedRisk('HIGH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRisk === 'HIGH'
                  ? isMorning
                    ? 'bg-rose-100 text-[#c51636] font-bold border border-rose-200'
                    : 'bg-rose-500/20 text-rose-300 font-bold shadow-sm'
                  : isMorning
                  ? 'text-[#78716c] hover:text-[#c51636]'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              High Risk (&gt;80%)
            </button>
            <button
              onClick={() => setSelectedRisk('MED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRisk === 'MED'
                  ? isMorning
                    ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200'
                    : 'bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                  : isMorning
                  ? 'text-[#78716c] hover:text-amber-800'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Med Risk
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isMorning ? 'text-[#a8a29e]' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor or invoice..."
              className={`h-9 pl-10 pr-3 rounded-xl text-xs focus:outline-none transition-all ${
                isMorning
                  ? 'bg-[#fcfaf6] border border-[#eadbce] text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#c51636] focus:bg-white'
                  : 'bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
              } w-44 lg:w-56`}
            />
          </div>
        </div>
      </div>

      {/* Spaced-Out Table Rows */}
      <div className="overflow-x-auto p-3">
        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className={`font-mono text-xs uppercase tracking-wider ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
              <th className="py-3 px-4 font-semibold">Risk Level</th>
              <th className="py-3 px-4 font-semibold">Exception Type</th>
              <th className="py-3 px-4 font-semibold">Affected Vendor</th>
              <th className="py-3 px-4 font-semibold">Amount at Risk</th>
              <th className="py-3 px-4 font-semibold">Pipeline & Approval Gate</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.map((exc) => {
              return (
                <tr
                  key={exc.id}
                  className={`border rounded-xl transition-all group ${
                    isMorning
                      ? 'bg-white hover:bg-rose-50/30 border-[#eadbce] shadow-xs'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                  }`}
                >
                  {/* Risk Level */}
                  <td className="py-4 px-4 whitespace-nowrap rounded-l-xl">
                    <div className="space-y-1">
                      {renderRiskBadge(exc.risk_score, exc.risk_level)}
                      <div className={`text-xs font-mono pl-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                        ID: {exc.id}
                      </div>
                    </div>
                  </td>

                  {/* Exception Type */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className={`font-bold text-sm ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                        {exc.exception_type}
                      </div>
                      <p className={`text-xs line-clamp-1 max-w-sm ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                        {exc.summary}
                      </p>
                    </div>
                  </td>

                  {/* Affected Vendor */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                          isMorning
                            ? 'bg-[#fcfaf6] border border-[#eadbce] text-[#78716c]'
                            : 'bg-white/[0.05] border border-white/10 text-slate-300'
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                          {exc.vendor}
                        </div>
                        <div className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                          {exc.vendor_code} · {exc.invoice_no}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount at Risk */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className={`font-mono text-base font-bold tracking-tight ${isMorning ? 'text-[#c51636]' : 'text-white'}`}>
                      {exc.formatted_amount}
                    </div>
                    <div className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                      INR {exc.amount_at_risk.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Pipeline Status & Tiered Gate */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {renderStatusBadge(exc.agent_pipeline_status, exc.requires_approval, exc.current_step)}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 whitespace-nowrap text-right rounded-r-xl">
                    <Link
                      href={`/investigation/${exc.id}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                        isMorning
                          ? 'bg-[#c51636] hover:bg-[#a8132e] shadow-sm'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      <span>Investigate</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className={`px-6 py-4 border-t flex items-center justify-between text-xs font-mono ${isMorning ? 'border-[#eadbce] bg-[#fcfaf6] text-[#78716c]' : 'border-white/10 bg-white/[0.02] text-slate-400'}`}>
        <div>
          Displaying <span className={`font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>{filteredExceptions.length}</span> exceptions monitored by Autonomous Sentinel
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-medium flex items-center gap-1.5 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>
            <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'}`} />
            Tiered Checkpoint Enforcement Active
          </span>
        </div>
      </div>
    </div>
  );
}
