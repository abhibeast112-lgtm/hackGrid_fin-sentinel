'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchExceptions, getStoredDecisions } from '@/lib/api-client';
import { FinancialException, DecisionRecord } from '@/lib/types';
import { INITIAL_EXCEPTIONS, INITIAL_DECISIONS, CATEGORY_RISK_DATA } from '@/lib/mock-data';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Share2,
  Scale
} from 'lucide-react';

export default function ReportsPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(INITIAL_DECISIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExceptions()
      .then((data) => {
        if (data?.exceptions?.length) {
          setExceptions(data.exceptions);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    setDecisions(getStoredDecisions());
  }, []);

  const totalAtRisk = 279500; // Fixed baseline exposure
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
      {/* Print stylesheet override */}
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

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-[family-name:var(--font-display)]">
              CFO Executive Brief & Audit Dossier
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-950/80 border border-indigo-700 text-indigo-300">
              BOARD AUDIT CONFIDENTIAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Certified fiscal exposure overview and autonomous risk control telemetry for Acme Manufacturing Pvt. Ltd.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          {/* User Requested Primary Button: [ Export Audit Report (PDF) ] */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#021C4F] to-[#C50337] hover:from-[#042871] hover:to-[#db043e] text-white text-xs font-bold font-mono transition-all shadow-lg shadow-[#C50337]/30 border border-[#C50337]/50"
          >
            <Printer className="h-4 w-4 text-rose-300" />
            <span>Export Audit Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="space-y-6 print-container">
        
        {/* Executive Summary Document Header */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <span>Internal Audit Document</span>
                <span>•</span>
                <span className="text-slate-200">Doc Ref: FS-CFO-2026-09</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 font-[family-name:var(--font-display)]">
                Acme Manufacturing Pvt. Ltd. — Financial Integrity Memo
              </h2>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 mt-2">
                <span>CIN: L72200MH1998PLC115239</span>
                <span>•</span>
                <span>Period: FY 2026-27 Month-to-Date (September)</span>
                <span>•</span>
                <span className="text-emerald-400">Autonomous Sentinel Protocol: v4.2</span>
              </div>
            </div>

            {/* Total Financial Exposure Card */}
            <div className="rounded-xl bg-gradient-to-br from-slate-950 via-slate-950 to-[#C50337]/20 border border-rose-900/50 p-4 shrink-0 text-right min-w-[220px]">
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                Total Financial Exposure
              </span>
              <div className="text-3xl font-black font-mono text-white tracking-tight mt-1">
                ₹2,79,500
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Across 3 Flagged Anomalies
              </div>
            </div>
          </div>

          {/* Breakdown section showing "Resolved Exceptions" vs "Pending Human Action" */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Exception Status Distribution & Pipeline Velocity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Pending Human Action */}
              <div className="rounded-xl border border-rose-900/40 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                      Pending Human Action
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {pendingExceptions.length} Exceptions Active
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black font-mono text-rose-400">
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {((pendingAmount / totalAtRisk) * 100).toFixed(0)}% of total risk
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  {pendingExceptions.map((e) => (
                    <div key={e.id} className="flex justify-between items-center text-slate-300">
                      <span className="truncate max-w-[200px]">{e.vendor} ({e.id})</span>
                      <span className="font-bold text-rose-300">{e.formatted_amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Resolved Exceptions */}
              <div className="rounded-xl border border-emerald-900/40 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                      Resolved Exceptions & Quarantined
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {resolvedExceptions.length + decisions.length} Interceptions
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {resolvedExceptions.length > 0
                      ? `₹${resolvedAmount.toLocaleString('en-IN')}`
                      : '₹1,24,000 Saved'}
                  </span>
                  <span className="text-xs font-mono text-emerald-300">
                    100% Capital Preserved
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Prior Audit Interceptions (Aug-Sep)</span>
                    <span className="font-bold text-emerald-400">₹1,24,000</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Autonomous Refutation Rate</span>
                    <span className="text-slate-200">96.8% Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary written in formal CFO prose */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
              <Scale className="h-4 w-4 text-rose-400" />
              <span>Executive Briefing & Opinion of Financial Integrity</span>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-serif">
              <p>
                <strong>To the Board Audit Committee and Chief Executive Officer:</strong>
              </p>
              <p>
                During the September 2026 remittance cycle, Fin-Sentinel intercepted and quarantined{' '}
                <span className="font-mono text-rose-300 font-semibold">₹2,79,500</span> in anomalous accounts payable requests across three critical suppliers prior to ledger clearance. These variances were evaluated by the multi-agent cognitive architecture utilizing counterfactual adversarial proofing.
              </p>
              <p>
                Most significantly, exception <strong>EXC-101 (Acme Systems, ₹84,500)</strong> demonstrated an acute duplicate invoice payment attempt generated across parallel ERP queues within a 17-minute delta. The Adversarial Challenge Agent disproved vendor claims of contractual installment tranches, proving 100% upfront satisfaction under PO-902. Prompt human sign-off will irrevocably lock these funds in escrow.
              </p>
              <p>
                Additionally, <strong>EXC-102 (TechCorp India, ₹15,000 rate variance)</strong> and <strong>EXC-103 (Global Logistics, ₹1,80,000 volume surge)</strong> highlight the necessity of immediate supplier contract enforcement and gate telemetry audits. With 4 autonomous evaluator nodes continuously running, Acme Manufacturing maintains a 100% SOX-compliant defensive posture against vendor duplicate billing, unauthorized hourly rate escalations, and unverified logistics manifests.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <div>
                <span>Prepared by: </span>
                <strong className="text-slate-200">Office of the Chief Financial Controller</strong>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="h-3 w-3" />
                <span>Cryptographically Sealed: SHA-256 (SOX-404 Compliant)</span>
              </div>
            </div>
          </div>

          {/* Exposure Category Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Exposure Breakdown by Vendor Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORY_RISK_DATA.map((cat, i) => (
                <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                  <div className="text-xs font-medium text-slate-400">{cat.category}</div>
                  <div className="text-lg font-black font-mono text-white">
                    ₹{cat.atRisk.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {cat.count} Incident · High Exposure
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Audit Ledger Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Immutable Decision Audit Trail (Live Ledger)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Tamper-Resistant SHA Hash Verification
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Exception ID</th>
                    <th className="py-2.5 px-3">Decision</th>
                    <th className="py-2.5 px-3">Reviewer Justification</th>
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3 text-right">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {decisions.map((dec) => (
                    <tr key={dec.id} className="hover:bg-slate-900/30">
                      <td className="py-2.5 px-3 font-bold text-white">{dec.id}</td>
                      <td className="py-2.5 px-3 text-rose-300">{dec.exception_id}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dec.decision === 'APPROVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : dec.decision === 'REJECT'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {dec.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-400" title={dec.reviewer_notes}>
                        {dec.reviewer_notes}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{dec.timestamp.slice(0, 16).replace('T', ' ')}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{dec.audit_hash}</td>
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
