'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentModal } from '@/components/investigation/DocumentModal';
import { fetchInvestigation, submitDecision } from '@/lib/api-client';
import { InvestigationDetail, SourceDocument, DecisionType, DecisionRecord } from '@/lib/types';
import { INVESTIGATION_DATABASE } from '@/lib/mock-data';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Scale,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Lock,
  ChevronRight,
  ExternalLink,
  Zap,
  Sparkles,
  ArrowLeft,
  Calendar,
  CreditCard,
  Hash,
  AlertCircle
} from 'lucide-react';

export default function InvestigationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'EXC-101';
  const id = rawId.toUpperCase();

  const [data, setData] = useState<InvestigationDetail>(
    INVESTIGATION_DATABASE[id] || INVESTIGATION_DATABASE['EXC-101']
  );
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(null);

  // Reviewer notes state
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionRecord, setDecisionRecord] = useState<DecisionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Load investigation data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchInvestigation(id)
      .then((detail) => {
        if (isMounted && detail) {
          setData(detail);
        }
      })
      .catch((err) => {
        console.error('Error fetching investigation:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle human action decisions
  const handleDecision = async (decision: DecisionType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const finalNotes = reviewerNotes.trim() || getDefaultNotes(decision, data.title);

    try {
      const response = await submitDecision({
        exception_id: data.id,
        decision,
        reviewer_notes: finalNotes,
      });

      if (response.success) {
        setDecisionRecord(response.record);
        setToastMessage(
          `Action [${decision}] successfully executed and permanently sealed to SOX Audit Trail with SHA hash ${response.record.audit_hash}.`
        );
      }
    } catch (err) {
      console.error('Decision submission error:', err);
      setToastMessage('Error recording decision. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultNotes = (decision: DecisionType, title: string) => {
    if (decision === 'REJECT') {
      return `Transaction blocked based on Adversarial Agent refutation. Unreconciled anomaly violating financial control policy for ${data.vendor}.`;
    }
    if (decision === 'APPROVE') {
      return `Override approved by Controller after verified cross-matching with master ERP ledger.`;
    }
    return `Escalated for CFO Executive Review due to material variance exposure of ${data.formatted_amount}.`;
  };

  const copyHashToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <AppLayout>
      {/* Top Breadcrumb & Exception Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">CONTROL TOWER / INVESTIGATION ROOM</span>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs font-mono font-bold text-rose-400">{data.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-[family-name:var(--font-display)] flex items-center gap-2">
                {data.vendor} · {data.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Exception Switcher Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 px-2 text-[10px] uppercase font-bold">Cases:</span>
          {['EXC-101', 'EXC-102', 'EXC-103'].map((caseId) => (
            <Link
              key={caseId}
              href={`/investigation/${caseId}`}
              className={`px-2.5 py-1 rounded transition-all font-semibold ${
                id === caseId
                  ? 'bg-gradient-to-r from-[#021C4F] to-[#C50337] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {caseId}
            </Link>
          ))}
        </div>
      </div>

      {/* High-Impact Success Toast / Banner if Decision Recorded */}
      {toastMessage && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300 font-[family-name:var(--font-display)] flex items-center gap-2">
                  Decision Committed to Audit Trail
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 border border-emerald-700 text-emerald-200">
                    STATUS: SEALED
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">{toastMessage}</p>
                {decisionRecord && (
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-400/90">
                    <span>Audit ID: <strong className="text-white">{decisionRecord.id}</strong></span>
                    <span>Decision: <strong className="text-white">{decisionRecord.decision}</strong></span>
                    <span className="flex items-center gap-1">
                      Hash: <span className="text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-800/80">{decisionRecord.audit_hash}</span>
                      <button
                        onClick={() => copyHashToClipboard(decisionRecord.audit_hash)}
                        className="hover:text-white transition-colors"
                        title="Copy Hash"
                      >
                        {copiedHash ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 text-slate-400" />}
                      </button>
                    </span>
                    <span>Signer: <strong className="text-white">{decisionRecord.reviewer}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/reports"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold font-mono transition-colors"
              >
                View in CFO Report &rarr;
              </Link>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Split View layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            COLUMN 1 (Left - 25% width / lg:col-span-3): Live Multi-Agent Investigation Trace
            ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#021C4F] to-[#C50337] text-white">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                  Agent Pipeline Trace
                </h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            </div>

            {/* Vertical Timeline / Stepper showing real-time agent handoffs */}
            <div className="relative mt-4 pl-3 space-y-6 before:absolute before:left-5 before:top-2 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-amber-500">
              {data.timeline.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isAwaiting = step.status === 'awaiting_input';

                return (
                  <div key={idx} className="relative flex items-start gap-3 group">
                    {/* Stepper Node Icon */}
                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-110 ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-900 shadow-sm shadow-emerald-500/50'
                          : isAwaiting
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 ring-4 ring-slate-900'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : isAwaiting ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <span>{step.step}</span>
                      )}
                    </div>

                    {/* Stepper Content */}
                    <div className="flex-1 space-y-1 rounded-lg p-2 transition-colors bg-slate-950/40 border border-slate-800/80 group-hover:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 font-[family-name:var(--font-display)]">
                          {step.step}. {step.agent}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {step.duration}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>{step.role}</span>
                        <span className="text-slate-400">{step.timestamp}</span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug pt-1">
                        {step.description}
                      </p>

                      {/* Status Badge */}
                      <div className="pt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isCompleted
                              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                              : 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                          )}
                          {step.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline Telemetry Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Total Pipeline Latency:</span>
                <span className="text-slate-200 font-semibold">4.56s</span>
              </div>
              <div className="flex justify-between">
                <span>Evaluator Ensemble:</span>
                <span className="text-cyan-400 font-semibold">4 Autonomous Nodes</span>
              </div>
              <div className="flex justify-between">
                <span>Consensus Vector:</span>
                <span className="text-rose-400 font-semibold">{data.risk_score}% Anomaly</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2 (Middle - 45% width / lg:col-span-5): Discrepancy & Evidence Viewer
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* High-level Anomaly Header */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                  {data.risk_level} · Risk Score: {data.risk_score}/100
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-2 font-[family-name:var(--font-display)]">
                  {data.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Vendor: {data.vendor}
                  </span>
                  <span>•</span>
                  <span>Category: {data.vendor_category}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Amount at Risk</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 tracking-tight">
                  {data.formatted_amount}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards (Box A vs Box B) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Side-by-Side Transaction Differential
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                17-Min Interception Gap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box A (Recorded Payment 1) */}
              <div className="rounded-xl border border-emerald-800/60 bg-slate-900/90 p-4 shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-[family-name:var(--font-display)]">
                    {data.comparison.box_a.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                    {data.comparison.box_a.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Txn Ref:</span>
                    <span className="text-white font-bold">{data.comparison.box_a.txn_id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timestamp:</span>
                    <span className="text-slate-200">{data.comparison.box_a.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remitted Amount:</span>
                    <span className="text-emerald-400 font-bold">{data.comparison.box_a.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Invoice Ref:</span>
                    <span className="text-slate-300">{data.comparison.box_a.invoice_ref}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Disbursement Route:</span>
                    <span className="text-slate-300">{data.comparison.box_a.channel}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Beneficiary A/C:</span>
                    <span className="text-slate-200">{data.comparison.box_a.beneficiary_account}</span>
                  </div>
                </div>
              </div>

              {/* Box B (Flagged Payment 2) */}
              <div className="rounded-xl border border-rose-800/70 bg-slate-900/90 p-4 shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#021C4F] to-[#C50337]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 font-[family-name:var(--font-display)]">
                    {data.comparison.box_b.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-700 text-rose-300 animate-pulse">
                    {data.comparison.box_b.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Txn Ref:</span>
                    <span className="text-white font-bold">{data.comparison.box_b.txn_id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Timestamp:</span>
                    <span className="text-rose-300 font-semibold">{data.comparison.box_b.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Flagged Amount:</span>
                    <span className="text-rose-400 font-bold">{data.comparison.box_b.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Invoice Ref:</span>
                    <span className="text-rose-300 font-semibold">{data.comparison.box_b.invoice_ref}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Queue Channel:</span>
                    <span className="text-slate-300">{data.comparison.box_b.channel}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Beneficiary A/C:</span>
                    <span className="text-slate-200">{data.comparison.box_b.beneficiary_account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adversarial Challenge Verdict Box (Highlighted card with shield icon) */}
          <div className="relative overflow-hidden rounded-xl border border-rose-600/60 bg-gradient-to-br from-[#021C4F]/90 via-slate-900 to-[#C50337]/30 p-4 shadow-xl border-sentinel-glow">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C50337] text-white shadow-lg shadow-[#C50337]/30">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-[family-name:var(--font-display)] flex items-center gap-2">
                    {data.adversarial_verdict.title}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C50337]/30 border border-rose-500 text-rose-200">
                      Confidence: {data.adversarial_verdict.confidence}
                    </span>
                  </h4>
                  <span className="text-[11px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    Test: {data.adversarial_verdict.test_result}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  &ldquo;{data.adversarial_verdict.verdict}&rdquo;
                </p>

                {/* Counterfactual Flags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.adversarial_verdict.flags.map((flag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-rose-900/60 text-rose-300"
                    >
                      • {flag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Source Document Link Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Cross-Source Evidence Dossier (Click to Inspect)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                3 Artifacts Attached
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.source_documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex flex-col text-left p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 transition-all hover:scale-[1.02] group shadow-md"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#021C4F] border border-blue-900 text-blue-300 group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {doc.type}
                    </span>
                  </div>

                  <span className="mt-2 text-xs font-bold text-slate-200 group-hover:text-rose-300 transition-colors truncate w-full font-mono">
                    {doc.filename}
                  </span>

                  <div className="mt-1 flex items-center justify-between w-full text-[10px] font-mono text-slate-400">
                    <span>{doc.size}</span>
                    <span className="text-emerald-400">Verified</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 3 (Right - 30% width / lg:col-span-4): Human Checkpoint & Action Panel
            ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-20 rounded-xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#021C4F] to-[#C50337] text-white">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                    Human Decision Required
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">
                    SLA Window: 02h : 14m Remaining
                  </span>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 relative mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            </div>

            {/* Reviewer Profile Card */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Active Reviewer:</span>
                <span className="text-white font-bold">Abhinav K.</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Role Authority:</span>
                <span className="text-rose-400">Chief Financial Controller</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Signing Certificate:</span>
                <span className="text-slate-300">FC-8812-SOX</span>
              </div>
            </div>

            {/* Quick Presets for Reviewer Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 font-mono block mb-1.5">
                Reviewer Notes / Escalation Reason
              </label>
              
              {/* Preset suggestion pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Confirmed Duplicate - Block Immediately',
                  'Violates Rate Cap in Signed MSA',
                  'Escalate to CFO for Legal Audit',
                  'Vendor Contacted for Correction'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewerNotes(preset)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter formal justification notes for audit log..."
                rows={4}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#C50337] focus:ring-1 focus:ring-[#C50337] font-mono transition-all"
              />
            </div>

            {/* Action Buttons (Large, high contrast) */}
            <div className="space-y-2.5 pt-2">
              {/* Red Button: [ Reject & Block Transaction ] */}
              <button
                type="button"
                onClick={() => handleDecision('REJECT')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#C50337] hover:bg-[#a5022e] active:scale-[0.99] transition-all shadow-lg shadow-[#C50337]/30 border border-rose-500/50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject & Block Transaction</span>
              </button>

              {/* Amber Button: [ Escalate to CFO ] */}
              <button
                type="button"
                onClick={() => handleDecision('ESCALATE')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 border border-amber-300 disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4 text-amber-950" />
                <span>Escalate to CFO</span>
              </button>

              {/* Green Button: [ Approve Payment ] */}
              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/20 border border-emerald-300 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 text-emerald-950" />
                <span>Approve Payment</span>
              </button>
            </div>

            {/* Audit Trail Disclaimer */}
            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>All decisions signed with cryptographic tamper-evident hash</span>
              </div>
              <p className="text-slate-400 leading-tight">
                Authorizations directly broadcast to ERP Ledger AP pipeline via REST webhook.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Document Inspection Modal */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </AppLayout>
  );
}
