'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  fetchExceptions,
  getStoredDecisions,
} from '@/lib/api-client';
import {
  FinancialException,
  DecisionRecord,
} from '@/lib/types';
import {
  INITIAL_EXCEPTIONS,
  INITIAL_DECISIONS,
} from '@/lib/mock-data';
import {
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ReportsPage() {
  const [exceptions, setExceptions] =
    useState<FinancialException[]>(INITIAL_EXCEPTIONS);

  const [decisions, setDecisions] =
    useState<DecisionRecord[]>(INITIAL_DECISIONS);

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
        console.error(
          'Error fetching exceptions for report:',
          err
        );
      }

      if (isMounted) {
        setDecisions(getStoredDecisions());
      }
    };

    loadReportData();

    const handleStorageChange = () => {
      loadReportData();
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    window.addEventListener(
      'focus',
      handleStorageChange
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        'storage',
        handleStorageChange
      );

      window.removeEventListener(
        'focus',
        handleStorageChange
      );
    };
  }, []);

  const uniqueDecisions = useMemo(() => {
    const seen = new Set<string>();

    return decisions.filter((decision) => {
      const key =
        decision.id ||
        `${decision.exception_id}-${decision.timestamp}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [decisions]);

  const totalAtRisk = exceptions.reduce(
    (sum, exception) =>
      sum + (exception.amount_at_risk || 0),
    0
  );

  const pendingAmount = exceptions
    .filter(
      (exception) =>
        !exception.status.startsWith('RESOLVED_')
    )
    .reduce(
      (sum, exception) =>
        sum + (exception.amount_at_risk || 0),
      0
    );

  const resolvedAmount = exceptions
    .filter((exception) =>
      exception.status.startsWith('RESOLVED_')
    )
    .reduce(
      (sum, exception) =>
        sum + (exception.amount_at_risk || 0),
      0
    );

  const resolvedCount = exceptions.filter(
    (exception) =>
      exception.status.startsWith('RESOLVED_')
  ).length;

  const pendingCount =
    exceptions.length - resolvedCount;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title:
        'Fin-Sentinel CFO Executive Briefing',
      organization:
        'Acme Manufacturing Pvt. Ltd.',
      reporting_period:
        'FY 2026-27 Q2 MTD',
      generated_at:
        new Date().toISOString(),
      total_exposure: totalAtRisk,
      pending_exposure: pendingAmount,
      resolved_exposure: resolvedAmount,
      exceptions,
      audit_decisions: uniqueDecisions,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          reportData,
          null,
          2
        ),
      ],
      {
        type: 'application/json',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download =
      `fin-sentinel-audit-report-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div
        className={`space-y-6 ${
          isMorning
            ? 'text-[#1c1917]'
            : 'text-white'
        }`}
      >
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                CFO Executive Report
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                  isMorning
                    ? 'bg-stone-100 text-stone-700 border border-stone-200'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Audit Ready
              </span>
            </div>

            <p
              className={`mt-2 text-sm ${
                isMorning
                  ? 'text-[#78716c]'
                  : 'text-slate-400'
              }`}
            >
              CFO executive briefing and
              decision audit dossier for
              Acme Manufacturing Pvt. Ltd.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all duration-200 active:scale-95 ${
                isMorning
                  ? 'bg-white hover:bg-[#f6efe6] border border-[#eadbce] text-[#1c1917] shadow-xs'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </button>

            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all duration-200 active:scale-95 ${
                isMorning
                  ? 'bg-[#1c1917] text-white hover:bg-black'
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              <Printer className="h-3.5 w-3.5" />
              Export Audit Report (PDF)
            </button>
          </div>
        </div>

        {/* EXECUTIVE SUMMARY */}
        <section
          className={`rounded-2xl border p-6 ${
            isMorning
              ? 'bg-white border-[#eadbce]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <Scale className="h-5 w-5" />
            <h2 className="text-lg font-bold">
              Executive Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`rounded-xl border p-4 ${
                isMorning
                  ? 'border-[#eadbce] bg-[#faf7f3]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className="text-xs font-mono opacity-60">
                TOTAL EXPOSURE
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₹
                {totalAtRisk.toLocaleString(
                  'en-IN'
                )}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isMorning
                  ? 'border-[#eadbce] bg-[#faf7f3]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className="text-xs font-mono opacity-60">
                PENDING EXPOSURE
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₹
                {pendingAmount.toLocaleString(
                  'en-IN'
                )}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isMorning
                  ? 'border-[#eadbce] bg-[#faf7f3]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className="text-xs font-mono opacity-60">
                RESOLVED EXPOSURE
              </p>

              <p className="mt-2 text-2xl font-bold">
                ₹
                {resolvedAmount.toLocaleString(
                  'en-IN'
                )}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isMorning
                  ? 'border-[#eadbce] bg-[#faf7f3]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className="text-xs font-mono opacity-60">
                EXCEPTIONS
              </p>

              <p className="mt-2 text-2xl font-bold">
                {exceptions.length}
              </p>

              <p className="text-xs opacity-60 mt-1">
                {resolvedCount} resolved ·{' '}
                {pendingCount} pending
              </p>
            </div>
          </div>
        </section>

        {/* DECISION AUDIT TRAIL */}
        <section
          className={`rounded-2xl border overflow-hidden ${
            isMorning
              ? 'bg-white border-[#eadbce]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div
            className={`px-6 py-5 border-b ${
              isMorning
                ? 'border-[#eadbce]'
                : 'border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />

                  <h2 className="text-lg font-bold">
                    Immutable Decision Audit Trail
                  </h2>
                </div>

                <p className="mt-1 text-xs opacity-60">
                  Live ledger of investigation
                  decisions and checkpoint outcomes.
                </p>
              </div>

              <span className="text-xs font-mono opacity-60">
                {uniqueDecisions.length} recorded
              </span>
            </div>
          </div>

          {uniqueDecisions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm opacity-60">
                No decisions recorded yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {uniqueDecisions.map(
                (decision) => (
                  <div
                    key={
                      decision.id ||
                      `${decision.exception_id}-${decision.timestamp}`
                    }
                    className="px-6 py-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-semibold">
                            {decision.exception_id}
                          </span>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              decision.decision ===
                              'APPROVE'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : decision.decision ===
                                  'REJECT'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {decision.decision ===
                            'ESCALATE'
                              ? 'ESCALATED'
                              : decision.decision}
                          </span>
                        </div>

                        <p className="mt-2 text-xs opacity-60">
                          {decision.timestamp
                            ? new Date(
                                decision.timestamp
                              ).toLocaleString(
                                'en-IN'
                              )
                            : 'Timestamp unavailable'}
                        </p>

                        {decision.reviewer_notes && (
                          <p className="mt-3 text-sm opacity-80">
                            {decision.reviewer_notes}
                          </p>
                        )}
                      </div>

                      <div className="lg:text-right">
                        <p className="text-[10px] font-mono opacity-50 uppercase">
                          Audit Hash
                        </p>

                        <p className="mt-1 max-w-[320px] break-all font-mono text-[10px] opacity-70">
                          {decision.audit_hash ||
                            'SHA-256 hash unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* EXCEPTIONS */}
        <section
          className={`rounded-2xl border overflow-hidden ${
            isMorning
              ? 'bg-white border-[#eadbce]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div
            className={`px-6 py-5 border-b ${
              isMorning
                ? 'border-[#eadbce]'
                : 'border-white/10'
            }`}
          >
            <h2 className="text-lg font-bold">
              Exception Register
            </h2>

            <p className="mt-1 text-xs opacity-60">
              Exceptions included in this audit
              reporting period.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    isMorning
                      ? 'bg-[#faf7f3]'
                      : 'bg-white/[0.02]'
                  }`}
                >
                  <th className="px-6 py-4">
                    Exception
                  </th>
                  <th className="px-6 py-4">
                    Vendor
                  </th>
                  <th className="px-6 py-4">
                    Amount
                  </th>
                  <th className="px-6 py-4">
                    Risk
                  </th>
                  <th className="px-6 py-4">
                    Status
                  </th>
                  <th className="px-6 py-4">
                    Investigation
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {exceptions.map(
                  (exception) => (
                    <tr
                      key={exception.id}
                      className="text-sm"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold">
                          {exception.id}
                        </div>

                        <div className="mt-1 opacity-60 text-xs">
                          {exception.exception_type}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {exception.vendor}
                        </div>

                        <div className="text-xs opacity-50 font-mono">
                          {exception.vendor_code}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono">
                        {exception.formatted_amount ||
                          `₹${(
                            exception.amount_at_risk ||
                            0
                          ).toLocaleString(
                            'en-IN'
                          )}`}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold">
                          {exception.risk_level}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-mono">
                          {exception.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/investigation/${exception.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono underline underline-offset-4"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AUDIT POSTURE */}
        <section
          className={`rounded-2xl border p-6 ${
            isMorning
              ? 'bg-white border-[#eadbce]'
              : 'bg-white/[0.03] border-white/10'
          }`}
        >
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 mt-0.5 shrink-0" />

            <div>
              <h2 className="font-bold">
                Audit Control Posture
              </h2>

              <p className="mt-2 text-sm opacity-70 leading-relaxed">
                Fin-Sentinel maintains an
                audit-oriented defensive posture
                with tiered human checkpoints.
                Investigation decisions are recorded
                in the decision audit trail and sealed
                using SHA-256 audit hashes.
              </p>

              <p className="mt-3 text-xs font-mono opacity-50">
                Cryptographically Sealed: SHA-256
                Audit Hash
              </p>
            </div>
          </div>
        </section>

        {/* PRINT FOOTER */}
        <div className="hidden print:block text-xs text-black pt-8 border-t border-black/20">
          Fin-Sentinel CFO Executive Briefing ·
          Generated {new Date().toLocaleString('en-IN')}
        </div>
      </div>
    </AppLayout>
  );
}