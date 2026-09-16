'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FinancialException } from '@/lib/types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileSearch,
  Check,
  Building2
} from 'lucide-react';

interface ExceptionsTableProps {
  exceptions: FinancialException[];
  onRefresh?: () => void;
}

export function ExceptionsTable({ exceptions, onRefresh }: ExceptionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

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

  const getRiskBadge = (score: number, level: string) => {
    if (score >= 90) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/70 border border-rose-600/50 text-rose-300 shadow-sm shadow-rose-950">
            {level} ({score}%)
          </span>
        </div>
      );
    }
    if (score >= 80) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/50 border border-rose-500/40 text-rose-300">
            {level} ({score}%)
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300">
          {level} ({score}%)
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('Resolved: REJECT') || status.includes('RESOLVED_REJECT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-900/30 text-rose-300 border border-rose-800">
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
          Blocked / Rejected
        </span>
      );
    }
    if (status.includes('Resolved: APPROVE') || status.includes('RESOLVED_APPROVE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-900/30 text-emerald-300 border border-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Approved by Controller
        </span>
      );
    }
    if (status.includes('Resolved: ESCALATE') || status.includes('RESOLVED_ESCALATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-900/30 text-amber-300 border border-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Escalated to CFO
        </span>
      );
    }

    if (status === 'Challenge Phase') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-700/60">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Challenge Phase
        </span>
      );
    }

    if (status === 'Evidence Ready') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-700/60">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Evidence Ready
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800/80 text-amber-300 border border-amber-600/40">
        <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
        Awaiting Review
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-100 font-[family-name:var(--font-display)] tracking-wide">
              Critical Exceptions Table
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#C50337]/20 border border-[#C50337]/40 text-rose-300 font-bold">
              {filteredExceptions.length} Anomaly Events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active cross-ledger variances intercepted by Autonomous Sentinel Agents prior to ERP clearing.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Risk Level Toggles */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedRisk('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRisk === 'ALL'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedRisk('HIGH')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRisk === 'HIGH'
                  ? 'bg-rose-900/80 text-rose-200 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              High Risk (&gt;80%)
            </button>
            <button
              onClick={() => setSelectedRisk('MED')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRisk === 'MED'
                  ? 'bg-amber-900/80 text-amber-200 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Med Risk
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter vendor / invoice..."
              className="h-8 pl-8 pr-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#C50337] w-44 lg:w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
              <th className="py-3 px-4 font-semibold">Risk Level</th>
              <th className="py-3 px-4 font-semibold">Exception Type</th>
              <th className="py-3 px-4 font-semibold">Affected Vendor</th>
              <th className="py-3 px-4 font-semibold">Amount at Risk</th>
              <th className="py-3 px-4 font-semibold">Agent Pipeline Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-[family-name:var(--font-sans)]">
            {filteredExceptions.map((exc) => {
              const isResolved = exc.status.startsWith('RESOLVED_');

              return (
                <tr
                  key={exc.id}
                  className={`group transition-colors ${
                    isResolved
                      ? 'bg-slate-950/30 text-slate-400 hover:bg-slate-900/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Risk Level */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getRiskBadge(exc.risk_score, exc.risk_level)}
                      <div className="text-[10px] font-mono text-slate-400 pl-3.5">
                        ID: {exc.id}
                      </div>
                    </div>
                  </td>

                  {/* Exception Type */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-100 font-[family-name:var(--font-display)] flex items-center gap-1.5 text-sm">
                        {exc.exception_type}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                        {exc.summary}
                      </p>
                    </div>
                  </td>

                  {/* Affected Vendor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-xs">
                          {exc.vendor}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {exc.vendor_code} · Inv: {exc.invoice_no}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount at Risk */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono text-sm font-bold text-rose-300 tracking-tight">
                      {exc.formatted_amount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      INR {exc.amount_at_risk.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Agent Pipeline Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(exc.agent_pipeline_status)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <Link
                      href={`/investigation/${exc.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-md bg-gradient-to-r from-[#021C4F] to-[#C50337] hover:from-[#032970] hover:to-[#df043f] border border-[#C50337]/50 group-hover:shadow-[#C50337]/25"
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
      <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          Showing <span className="text-slate-200 font-bold">{filteredExceptions.length}</span> of{' '}
          <span className="text-slate-200">{exceptions.length}</span> intercepted exceptions
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Autonomous Interceptor SLA: &lt;200ms
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-400">Ledger Hash Sync: Ingested</span>
        </div>
      </div>
    </div>
  );
}
