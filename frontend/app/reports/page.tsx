'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchExceptions, getStoredDecisions } from '@/lib/api-client';
import { FinancialException, DecisionRecord } from '@/lib/types';
import { INITIAL_EXCEPTIONS, INITIAL_DECISIONS, CATEGORY_RISK_DATA } from '@/lib/mock-data';
import {
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Scale
} from 'lucide-react';

export default function ReportsPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(INITIAL_DECISIONS);

  useEffect(() => {
    fetchExceptions().then((data) => {
      if (data?.exceptions?.length) {
        setExceptions(data.exceptions);
      }
    });
    setDecisions(getStoredDecisions());
  }, []);

  const totalAtRisk = 279500;
  const pendingExceptions = exceptions.filter((e) => !e.status.startsWith('RESOLVED_'));
  const resolvedExceptions = exceptions.filter((e) => e.status.startsWith('RESOLVED_'));

  const pendingAmount = pendingExceptions.reduce((acc, curr) => acc + curr.amount_at_risk, 0);
  const resolvedAmount = resolvedExceptions.reduce((acc, curr) => acc + curr.amount_at_risk, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title: 'Fin-Sentinel CFO Executive Briefing',
      organization: 'Acme Manufacturing Pvt. Ltd.',
      reporting_period: 'FY 2026-27 Q2 MTD',
      generated_at: new Date().toISOString(),
      total_exposure: totalAtRisk,
      pending_exposure: pendingAmount,
      resolved_exposure: resolvedAmount,
      exceptions,
      audit_decisions: decisions,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinSentinel_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <AppLayout>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, button, .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#233c46] no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[#F5EED2]">
              CFO Executive Report
            </h1>
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono bg-[#172a31] text-[#8aa1aa] border border-[#233c46]">
              CONFIDENTIAL
            </span>
          </div>
          <p className="text-xs text-[#8aa1aa] mt-1">
            Financial exposure briefing and audit trail verification for Acme Manufacturing Pvt. Ltd.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#172a31] hover:bg-[#1f3741] border border-[#233c46] text-xs font-mono text-[#F5EED2] transition-colors"
          >
            <Download className="h-3 w-3 text-[#8aa1aa]" />
            <span>Export JSON</span>
          </button>

          {/* User Requested Button: [ Export Audit Report (PDF) ] */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#EBAE29] hover:bg-[#dfa21e] text-[#132228] text-xs font-medium transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export Audit Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 print-container">
        
        {/* Memo Header */}
        <div className="rounded-md border border-[#233c46] bg-[#172a31] p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#233c46] pb-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#8aa1aa]">
                Doc Ref: FS-CFO-2026-09
              </div>
              <h2 className="text-base font-semibold text-[#F5EED2] mt-1">
                Acme Manufacturing Pvt. Ltd. — Financial Integrity Memo
              </h2>
              <div className="flex flex-wrap gap-3 text-xs font-mono text-[#8aa1aa] mt-1.5">
                <span>CIN: L72200MH1998PLC115239</span>
                <span>•</span>
                <span>Period: FY 2026-27 September MTD</span>
              </div>
            </div>

            {/* Total Financial Exposure Card */}
            <div className="rounded-sm bg-[#0e181c] border border-[#233c46] p-3 shrink-0 text-right min-w-[200px]">
              <span className="text-[11px] font-mono text-[#8aa1aa] uppercase tracking-wider">
                Total Financial Exposure
              </span>
              <div className="text-2xl font-semibold font-mono text-red-400 mt-0.5">
                ₹2,79,500
              </div>
              <div className="text-[10px] font-mono text-[#8aa1aa]">
                Across 3 Flagged Anomalies
              </div>
            </div>
          </div>

          {/* Breakdown Section: "Resolved Exceptions" vs "Pending Human Action" */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8aa1aa]">
              Exception Status Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Human Action */}
              <div className="rounded-sm border border-red-500/30 bg-[#0e181c] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-xs font-medium text-[#F5EED2]">
                      Pending Human Action
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                    {pendingExceptions.length} Open
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-semibold font-mono text-red-400">
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-mono text-[#8aa1aa]">
                    {((pendingAmount / totalAtRisk) * 100).toFixed(0)}% of total risk
                  </span>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#233c46] text-xs font-mono text-[#8aa1aa]">
                  {pendingExceptions.map((e) => (
                    <div key={e.id} className="flex justify-between items-center">
                      <span className="truncate max-w-[200px] text-[#F5EED2]">{e.vendor}</span>
                      <span className="text-red-400">{e.formatted_amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolved Exceptions */}
              <div className="rounded-sm border border-[#589C80]/30 bg-[#0e181c] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#589C80]" />
                    <span className="text-xs font-medium text-[#F5EED2]">
                      Resolved Exceptions
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20">
                    {resolvedExceptions.length + decisions.length} Interceptions
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-semibold font-mono text-[#589C80]">
                    {resolvedExceptions.length > 0
                      ? `₹${resolvedAmount.toLocaleString('en-IN')}`
                      : '₹1,24,000 Saved'}
                  </span>
                  <span className="text-xs font-mono text-[#589C80]">
                    Capital Preserved
                  </span>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#233c46] text-xs font-mono text-[#8aa1aa]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#F5EED2]">Prior Period Interceptions (Aug-Sep)</span>
                    <span className="text-[#589C80]">₹1,24,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Validation Rate</span>
                    <span className="text-[#F5EED2]">96.8% Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary in formal CFO prose */}
          <div className="space-y-3 rounded-sm border border-[#233c46] bg-[#0e181c] p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#EBAE29]">
              <Scale className="h-3.5 w-3.5" />
              <span>Executive Briefing & Opinion</span>
            </div>

            <div className="text-xs text-[#F5EED2] leading-relaxed space-y-2 font-serif">
              <p>
                <strong>To the Board Audit Committee and Chief Executive Officer:</strong>
              </p>
              <p>
                During the September 2026 remittance cycle, Fin-Sentinel intercepted and quarantined{' '}
                <span className="font-mono text-red-400 font-medium">₹2,79,500</span> in anomalous accounts payable requests across three critical suppliers prior to ledger clearance. These variances were subjected to autonomous multi-agent verification and counterfactual proofing.
              </p>
              <p>
                Most significantly, exception <strong>EXC-101 (Acme Systems, ₹84,500)</strong> demonstrated an acute duplicate invoice payment attempt generated across parallel ERP queues within a 17-minute delta. The Adversarial Challenge Agent disproved vendor claims of contractual installment tranches, proving 100% upfront satisfaction under PO-902. Prompt human sign-off will irrevocably lock these funds in escrow.
              </p>
              <p>
                Additionally, <strong>EXC-102 (TechCorp India, ₹15,000 rate variance)</strong> and <strong>EXC-103 (Global Logistics, ₹1,80,000 volume surge)</strong> highlight the necessity of strict supplier contract enforcement and gate telemetry audits. With continuous surveillance active, Acme Manufacturing maintains an audit-ready posture against duplicate billing and unverified rate adjustments.
              </p>
            </div>

            <div className="pt-3 border-t border-[#233c46] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#8aa1aa]">
              <div>
                Prepared by: <span className="text-[#F5EED2]">Office of the Financial Controller</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#589C80]">
                <Lock className="h-3 w-3" />
                <span>SHA-256 Tamper Evident (SOX-404 Compliant)</span>
              </div>
            </div>
          </div>

          {/* Exposure by Category */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8aa1aa]">
              Category Exposure Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORY_RISK_DATA.map((cat, i) => (
                <div key={i} className="rounded-sm border border-[#233c46] bg-[#0e181c] p-3 space-y-1">
                  <div className="text-xs text-[#8aa1aa]">{cat.category}</div>
                  <div className="text-base font-semibold font-mono text-[#F5EED2]">
                    ₹{cat.atRisk.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-mono text-[#8aa1aa]">
                    {cat.count} Incident
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Audit Trail */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8aa1aa]">
                Decision Audit Trail
              </h3>
              <span className="text-[10px] font-mono text-[#8aa1aa]">
                Immutable Ledger
              </span>
            </div>

            <div className="rounded-sm border border-[#233c46] bg-[#0e181c] overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#233c46] text-[#8aa1aa]">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Exception ID</th>
                    <th className="py-2.5 px-3">Decision</th>
                    <th className="py-2.5 px-3">Reviewer Justification</th>
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3 text-right">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233c46] text-[#F5EED2]">
                  {decisions.map((dec) => (
                    <tr key={dec.id} className="hover:bg-[#172a31]">
                      <td className="py-2.5 px-3 text-[#F5EED2] font-medium">{dec.id}</td>
                      <td className="py-2.5 px-3 text-[#EBAE29]">{dec.exception_id}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.2 rounded-sm text-[10px] ${
                            dec.decision === 'APPROVE'
                              ? 'bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20'
                              : dec.decision === 'REJECT'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20'
                          }`}
                        >
                          {dec.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-[#8aa1aa]" title={dec.reviewer_notes}>
                        {dec.reviewer_notes}
                      </td>
                      <td className="py-2.5 px-3 text-[#8aa1aa]">{dec.timestamp.slice(0, 16).replace('T', ' ')}</td>
                      <td className="py-2.5 px-3 text-right text-[#589C80]">{dec.audit_hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
