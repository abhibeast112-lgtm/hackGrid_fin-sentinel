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
  AlertTriangle
} from 'lucide-react';

interface ExceptionsTableProps {
  exceptions: FinancialException[];
  onRefresh?: () => void;
}

export function ExceptionsTable({ exceptions }: ExceptionsTableProps) {
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

  const renderRiskBadge = (score: number, level: string) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          {level} ({score}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono font-medium bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20">
        <span className="h-1.5 w-1.5 rounded-full bg-[#EBAE29]" />
        {level} ({score}%)
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    if (status.includes('Resolved: REJECT') || status.includes('RESOLVED_REJECT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="h-3 w-3" />
          Blocked
        </span>
      );
    }
    if (status.includes('Resolved: APPROVE') || status.includes('RESOLVED_APPROVE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-mono bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </span>
      );
    }
    if (status.includes('Resolved: ESCALATE') || status.includes('RESOLVED_ESCALATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-mono bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20">
          <AlertTriangle className="h-3 w-3" />
          Escalated
        </span>
      );
    }
    if (status === 'Challenge Phase') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EBAE29]" />
          Challenge Phase
        </span>
      );
    }
    if (status === 'Evidence Ready') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#589C80]" />
          Evidence Ready
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-mono bg-[#172a31] text-[#8aa1aa] border border-[#233c46]">
        <Clock className="h-3 w-3 text-[#8aa1aa]" />
        Awaiting Review
      </span>
    );
  };

  return (
    <div className="rounded-md border border-[#233c46] bg-[#172a31] overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-[#233c46] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#F5EED2]">
              Critical Exceptions Table
            </h2>
            <span className="px-2 py-0.2 rounded-sm text-[11px] font-mono bg-[#132228] text-[#8aa1aa] border border-[#233c46]">
              {filteredExceptions.length} Anomaly Events
            </span>
          </div>
          <p className="text-xs text-[#8aa1aa] mt-0.5">
            Active variances intercepted prior to payment clearing
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Risk Level Toggles */}
          <div className="flex items-center rounded-sm bg-[#0e181c] p-0.5 border border-[#233c46] text-xs font-mono">
            <button
              onClick={() => setSelectedRisk('ALL')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                selectedRisk === 'ALL'
                  ? 'bg-[#172a31] text-[#F5EED2] font-medium'
                  : 'text-[#8aa1aa] hover:text-[#F5EED2]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedRisk('HIGH')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                selectedRisk === 'HIGH'
                  ? 'bg-red-500/10 text-red-400 font-medium'
                  : 'text-[#8aa1aa] hover:text-red-400'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setSelectedRisk('MED')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                selectedRisk === 'MED'
                  ? 'bg-[#EBAE29]/10 text-[#EBAE29] font-medium'
                  : 'text-[#8aa1aa] hover:text-[#EBAE29]'
              }`}
            >
              Med Risk
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8aa1aa]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter table..."
              className="h-7 pl-8 pr-3 rounded-sm bg-[#0e181c] border border-[#233c46] text-xs text-[#F5EED2] placeholder:text-[#6c858f] focus:outline-none focus:border-[#EBAE29] w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Table with comfortable spacing and flat styling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#233c46] bg-[#0e181c] text-[#8aa1aa] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Risk Level</th>
              <th className="py-3 px-4 font-medium">Exception Type</th>
              <th className="py-3 px-4 font-medium">Affected Vendor</th>
              <th className="py-3 px-4 font-medium">Amount at Risk</th>
              <th className="py-3 px-4 font-medium">Agent Pipeline Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233c46]">
            {filteredExceptions.map((exc) => {
              return (
                <tr
                  key={exc.id}
                  className="hover:bg-[#1b3038] transition-colors group"
                >
                  {/* Risk Level */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      {renderRiskBadge(exc.risk_score, exc.risk_level)}
                      <div className="text-[10px] font-mono text-[#8aa1aa] mt-1">
                        {exc.id}
                      </div>
                    </div>
                  </td>

                  {/* Exception Type */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-medium text-[#F5EED2] text-xs">
                        {exc.exception_type}
                      </div>
                      <p className="text-[11px] text-[#8aa1aa] line-clamp-1 max-w-sm mt-0.5">
                        {exc.summary}
                      </p>
                    </div>
                  </td>

                  {/* Affected Vendor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-sm bg-[#0e181c] border border-[#233c46] flex items-center justify-center text-[#8aa1aa]">
                        <Building2 className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium text-[#F5EED2]">
                          {exc.vendor}
                        </div>
                        <div className="text-[10px] font-mono text-[#8aa1aa]">
                          {exc.vendor_code} · {exc.invoice_no}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount at Risk */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono text-xs font-semibold text-[#F5EED2]">
                      {exc.formatted_amount}
                    </div>
                    <div className="text-[10px] font-mono text-[#8aa1aa]">
                      INR {exc.amount_at_risk.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Agent Pipeline Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(exc.agent_pipeline_status)}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <Link
                      href={`/investigation/${exc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium text-[#132228] bg-[#EBAE29] hover:bg-[#dfa21e] active:scale-[0.98] transition-all"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-[#0e181c] border-t border-[#233c46] flex items-center justify-between text-xs text-[#8aa1aa] font-mono">
        <div>
          Showing {filteredExceptions.length} of {exceptions.length} exceptions
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#589C80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#589C80]" />
            Interceptor active
          </span>
          <span>•</span>
          <span>Hash verification ready</span>
        </div>
      </div>
    </div>
  );
}
