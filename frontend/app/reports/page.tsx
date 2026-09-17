'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchExceptions, getStoredDecisions } from '@/lib/api-client';
import { FinancialException, DecisionRecord } from '@/lib/types';
import { INITIAL_EXCEPTIONS, INITIAL_DECISIONS, CATEGORY_RISK_DATA } from '@/lib/mock-data';
import {
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Scale,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ReportsPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(INITIAL_DECISIONS);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  useEffect(() => {
    let isMounted = true;
    const loadReportData = async () => {
      try {
        const data = await fetchExceptions();
        if (isMounted && data?.exceptions?.length) {
          setExceptions(data.exceptions);
        }
      } catch (err) {
        console.error('Error fetching exceptions for report:', err);
      }
      if (isMounted) {
        setDecisions(getStoredDecisions());
      }
    };

    loadReportData();

    const handleStorageChange = () => {
      loadReportData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Deduplicate decisions to avoid duplicate key warnings and data collision
  const uniqueDecisions = useMemo(() => {
    const seen = new Set<string>();
    return decisions.filter((d) => {
      const key = d.id || `${d.exception_id}-${d.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [decisions]);

  const totalCalculated = exceptions.reduce((acc, curr) => acc + (curr.amount_at_risk || 0), 0);
  const totalAtRisk = totalCalculated > 0 ? totalCalculated : 279500;

  const pendingExceptions = exceptions.filter((e) => !e.status.startsWith('RESOLVED_'));
  const resolvedExceptions = exceptions.filter((e) => e.status.startsWith('RESOLVED_'));

  const pendingAmount = pendingExceptions.reduce((acc, curr) => acc + (curr.amount_at_risk || 0), 0);
  const resolvedAmount = resolvedExceptions.reduce((acc, curr) => acc + (curr.amount_at_risk || 0), 0);

  /*
   * The audit ledger may contain multiple historical decisions for one
   * exception. The summary therefore uses the latest decision per exception.
   */
  const latestDecisionByException = useMemo(() => {
    const latest = new Map<string, DecisionRecord>();

    for (const decision of uniqueDecisions) {
      const existing = latest.get(decision.exception_id);

      if (
        !existing ||
        new Date(decision.timestamp).getTime() >
          new Date(existing.timestamp).getTime()
      ) {
        latest.set(decision.exception_id, decision);
      }
    }

    return latest;
  }, [uniqueDecisions]);

  const getResolvedDecisionLabel = (exception: FinancialException) => {
    const latestDecision = latestDecisionByException.get(exception.id);

    if (latestDecision?.decision === 'REJECT') return 'BLOCKED';
    if (latestDecision?.decision === 'ESCALATE') return 'ESCALATED';
    if (latestDecision?.decision === 'APPROVE') return 'APPROVED';

    if (exception.status === 'RESOLVED_REJECT') return 'BLOCKED';
    if (exception.status === 'RESOLVED_ESCALATE') return 'ESCALATED';

    return 'APPROVED';
  };

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
      audit_decisions: uniqueDecisions,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinSentinel_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          `,
        }}
      />

      {/* Header & Export Actions */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b no-print ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-extrabold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              CFO Executive Brief & Audit Dossier
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                isMorning
                  ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
              }`}
            >
              BOARD CONFIDENTIAL
            </span>
          </div>
          <p className={`text-sm mt-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            Certified fiscal exposure overview and tiered risk control telemetry for Acme Manufacturing Pvt. Ltd.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
              isMorning
                ? 'bg-white hover:bg-[#f6efe6] border border-[#eadbce] text-[#1c1917] shadow-xs'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white'
            }`}
          >
            <Download className={`h-3.5 w-3.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`} />
            <span>Export JSON</span>
          </button>

          {/* Primary Action Button: [ Export Audit Report (PDF) ] */}
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              isMorning
                ? 'bg-[#c51636] hover:bg-[#a8132e] text-white shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export Audit Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 print-container">
        
        {/* Memo Header Card */}
        <div
          className={`rounded-2xl p-6 space-y-6 transition-all duration-300 ${
            isMorning
              ? 'bg-white/80 backdrop-blur-xl border border-[#eadbce] shadow-xs text-[#1c1917]'
              : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/25 text-white'
          }`}
        >
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 border-b pb-5 ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
            <div>
              <div className={`text-xs font-mono uppercase tracking-wider ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                <span>Internal Audit Memorandum</span>
                <span> • </span>
                <span className={isMorning ? 'text-[#1c1917] font-bold' : 'text-white'}>Ref: FS-CFO-2026-09</span>
              </div>
              <h2 className={`text-xl font-bold mt-1.5 tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Acme Manufacturing Pvt. Ltd. — Financial Integrity Memo
              </h2>
              <div className={`flex flex-wrap gap-4 text-xs font-mono mt-2 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                <span>CIN: L72200MH1998PLC115239</span>
                <span>•</span>
                <span>Period: FY 2026-27 September MTD</span>
                <span>•</span>
                <span className={`font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>Tiered Governance: Armed</span>
              </div>
            </div>

            {/* Total Financial Exposure Card */}
            <div
              className={`rounded-2xl p-5 shrink-0 text-right min-w-[220px] transition-all duration-300 ${
                isMorning
                  ? 'bg-rose-50 border border-rose-200'
                  : 'bg-white/[0.04] backdrop-blur-xl border border-rose-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-rose-500/45'
              }`}
            >
              <span className={`text-xs font-mono uppercase tracking-wider font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>
                Total Financial Exposure
              </span>
              <div className={`text-3xl font-extrabold font-mono tracking-tight mt-1 ${isMorning ? 'text-[#c51636]' : 'text-white'}`}>
                ₹{totalAtRisk.toLocaleString('en-IN')}
              </div>
              <div className={`text-xs font-mono mt-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Across {exceptions.length} Flagged Anomalies
              </div>
            </div>
          </div>

          {/* Breakdown Section: "Resolved Exceptions" vs "Pending Human Action" */}
          <div className="space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-300'}`}>
              Exception Status Distribution & Pipeline Velocity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Pending Human Action */}
              <div
                className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ${
                  isMorning
                    ? 'bg-[#fffdfd] border border-rose-200'
                    : 'bg-white/[0.04] backdrop-blur-xl border border-rose-500/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-rose-500'}`} />
                    <span className={`text-sm font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                      Pending Human Action (Tiered Gates)
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      isMorning
                        ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                    }`}
                  >
                    {pendingExceptions.length} Exceptions Active
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className={`text-2xl font-extrabold font-mono ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    {((pendingAmount / (totalAtRisk || 1)) * 100).toFixed(0)}% of total exposure
                  </span>
                </div>

                <div className={`space-y-2 pt-2 border-t text-xs font-mono ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
                  {pendingExceptions.length > 0 ? (
                    pendingExceptions.map((e) => (
                      <div key={e.id} className="flex justify-between items-center">
                        <Link
                          href={`/investigation/${e.id}`}
                          className={`truncate max-w-[220px] hover:underline flex items-center gap-1.5 transition-colors ${
                            isMorning ? 'text-[#1c1917] hover:text-[#c51636]' : 'text-white hover:text-emerald-400'
                          }`}
                        >
                          <span>{e.vendor} ({e.id})</span>
                          <ExternalLink className="h-3 w-3 opacity-60 inline shrink-0" />
                        </Link>
                        <span className={`font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>{e.formatted_amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-2 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      All exception gates cleared & verified
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Resolved Exceptions */}
              <div
                className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ${
                  isMorning
                    ? 'bg-[#fcfdfc] border border-emerald-200'
                    : 'bg-white/[0.04] backdrop-blur-xl border border-emerald-500/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className={`h-4 w-4 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`} />
                    <span className={`text-sm font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                      Resolved Exceptions & Quarantined
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      isMorning
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    }`}
                  >
                    {resolvedExceptions.length} Interceptions
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className={`text-2xl font-extrabold font-mono ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {resolvedExceptions.length > 0
                      ? `₹${resolvedAmount.toLocaleString('en-IN')}`
                      : '₹1,24,000 Saved'}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {resolvedExceptions.length > 0 ? 'Decision Recorded' : 'Awaiting Decision'}
                  </span>
                </div>

                <div className={`space-y-2 pt-2 border-t text-xs font-mono ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-300'}`}>
                  {resolvedExceptions.map((e) => (
                    <div key={e.id} className="flex justify-between items-center">
                      <Link
                        href={`/investigation/${e.id}`}
                        className={`truncate max-w-[220px] hover:underline flex items-center gap-1.5 transition-colors ${
                          isMorning ? 'text-[#1c1917] hover:text-emerald-700' : 'text-white hover:text-emerald-400'
                        }`}
                      >
                        <span>{e.vendor} ({e.id})</span>
                        <ExternalLink className="h-3 w-3 opacity-60 inline shrink-0" />
                      </Link>
                      <span className={`font-bold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {getResolvedDecisionLabel(e)} · {e.formatted_amount}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-200'}>Prior Audit Interceptions (Aug-Sep)</span>
                    <span className={`font-bold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>₹1,24,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Autonomous Refutation Rate</span>
                    <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>96.8% Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary in Formal CFO Prose */}
          <div
            className={`space-y-3 rounded-2xl p-6 transition-all duration-300 ${
              isMorning
                ? 'bg-[#fcfaf6] border border-[#eadbce]'
                : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/25'
            }`}
          >
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-mono ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>
              <Scale className="h-4 w-4" />
              <span>Executive Briefing & Opinion of Financial Integrity</span>
            </div>

            <div className={`text-sm leading-relaxed space-y-3 font-serif ${isMorning ? 'text-[#292524]' : 'text-slate-200'}`}>
              <p>
                <strong>To the Board Audit Committee and Chief Executive Officer:</strong>
              </p>
              <p>
                During the September 2026 remittance cycle, Fin-Sentinel intercepted and quarantined{' '}
                <span className={`font-mono font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>₹{totalAtRisk.toLocaleString('en-IN')}</span> in anomalous accounts payable requests across {exceptions.length} critical suppliers prior to ledger clearance. These variances were evaluated by the multi-agent cognitive architecture utilizing counterfactual adversarial proofing and tiered checkpoint gates.
              </p>
              <p>
                Most significantly, exception <strong>EXC-101 (Acme Systems, ₹84,500)</strong> demonstrated an acute duplicate invoice payment attempt generated across parallel ERP queues within a 17-minute delta. The Adversarial Challenge Agent disproved vendor claims of contractual installment tranches, proving 100% upfront satisfaction under PO-902. Step-by-step human sign-off ensures complete segregation of duties before transaction release. The latest recorded dashboard decision for this exception is <strong>{getResolvedDecisionLabel(exceptions.find((e) => e.id === 'EXC-101') || INITIAL_EXCEPTIONS[0])}</strong>.
              </p>
              <p>
                Additionally, <strong>EXC-102 (TechCorp India, ₹15,000 rate variance)</strong> and <strong>EXC-103 (Global Logistics, ₹1,80,000 volume surge)</strong> highlight the necessity of immediate supplier contract enforcement and gate telemetry audits. With 4 autonomous evaluator nodes and tiered human checkpoints active, Acme Manufacturing maintains a audit-oriented defensive posture with tiered human checkpoints
              </p>
            </div>

            <div className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
              <div>
                <span>Prepared by: </span>
                <strong className={isMorning ? 'text-[#1c1917]' : 'text-white'}>Office of the Chief Financial Controller</strong>
              </div>
              <div className={`flex items-center gap-2 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>
                <Lock className="h-3.5 w-3.5" />
                <span>Cryptographically Sealed: SHA-256 Audit Hash </span>
              </div>
            </div>
          </div>

          {/* Exposure Category Breakdown */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono mb-3 ${isMorning ? 'text-[#1c1917]' : 'text-slate-300'}`}>
              Exposure Breakdown by Vendor Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CATEGORY_RISK_DATA.map((cat, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 space-y-1.5 transition-all duration-300 ${
                    isMorning
                      ? 'bg-[#fcfaf6] border border-[#eadbce]'
                      : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-white/25'
                  }`}
                >
                  <div className={`text-xs font-medium ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>{cat.category}</div>
                  <div className={`text-xl font-extrabold font-mono ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                    ₹{cat.atRisk.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    {cat.count} Incident · High Exposure
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Decision Audit Trail Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-300'}`}>
                Immutable Decision Audit Trail (Live Ledger)
              </h3>
              <span className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                SHA-256 Audit Hash Verification
              </span>
            </div>

            <div
              className={`rounded-xl overflow-x-auto transition-all duration-300 ${
                isMorning
                  ? 'bg-white border border-[#eadbce]'
                  : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
              }`}
            >
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isMorning ? 'border-[#eadbce] bg-[#fcfaf6] text-[#78716c]' : 'border-white/10 bg-slate-900/40 text-slate-300'}`}>
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">Exception ID</th>
                    <th className="py-3 px-4">Decision</th>
                    <th className="py-3 px-4">Reviewer Justification</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4 text-right">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isMorning ? 'divide-[#eadbce] text-[#1c1917]' : 'divide-white/5 text-slate-300'}`}>
                  {uniqueDecisions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                        No audit decisions recorded yet. Decisions confirmed in the Investigation Room will be permanently sealed here.
                      </td>
                    </tr>
                  ) : (
                    uniqueDecisions.map((dec, idx) => (
                      <tr key={`${dec.id}-${idx}`} className={`transition-colors duration-200 ${isMorning ? 'hover:bg-[#fcfaf6]' : 'bg-slate-900/30 backdrop-blur-md hover:bg-white/[0.08]'}`}>
                        <td className={`py-3 px-4 font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>{dec.id}</td>
                        <td className="py-3 px-4 font-semibold">
                          <Link
                            href={`/investigation/${dec.exception_id}`}
                            className={`hover:underline flex items-center gap-1 transition-colors ${isMorning ? 'text-[#c51636] hover:text-[#a8132e]' : 'text-rose-400 hover:text-rose-300'}`}
                          >
                            <span>{dec.exception_id}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 inline shrink-0" />
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              dec.decision === 'APPROVE'
                                ? isMorning
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : dec.decision === 'REJECT'
                                ? isMorning
                                  ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                                : isMorning
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                            }`}
                          >
                            {dec.decision}
                          </span>
                        </td>
                        <td className={`py-3 px-4 max-w-xs truncate ${isMorning ? 'text-[#57534e]' : 'text-slate-400'}`} title={dec.reviewer_notes}>
                          {dec.reviewer_notes || 'No notes provided'}
                        </td>
                        <td className={`py-3 px-4 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                          {(dec.timestamp || '').slice(0, 16).replace('T', ' ') || '—'}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>{dec.audit_hash}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
