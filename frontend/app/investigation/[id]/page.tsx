'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentModal } from '@/components/investigation/DocumentModal';
import {
  fetchInvestigation,
  submitDecision,
  resumeInvestigation,
} from '@/lib/api-client';
import { InvestigationDetail, SourceDocument, DecisionType, DecisionRecord, AgentTimelineStep } from '@/lib/types';
import { INVESTIGATION_DATABASE } from '@/lib/mock-data';
import {
  Shield,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function InvestigationRoomPage() {
  const params = useParams();
  const rawId = (params?.id as string) || 'EXC-101';
  const id = rawId.toUpperCase();
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  const [data, setData] = useState<InvestigationDetail>(
    INVESTIGATION_DATABASE[id] || INVESTIGATION_DATABASE['EXC-101']
  );
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionRecord, setDecisionRecord] = useState<DecisionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Tiered Human Checkpoint States
  const [timelineSteps, setTimelineSteps] = useState<AgentTimelineStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2);
  const [isAdvancingStep, setIsAdvancingStep] = useState<boolean>(false);
  const [stepAdvancingMsg, setStepAdvancingMsg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    fetchInvestigation(id)
      .then((detail) => {
        if (isMounted && detail) {
          setData(detail);
          setTimelineSteps(detail.timeline);
          setActiveStepIndex(detail.current_step || 2);
        }
      })
      .catch((err) => {
        console.error('Error fetching investigation:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const requiresApproval = data.requires_approval;
  const agentSteps = timelineSteps.filter((s) => s.step <= 4);
  const allGatesCompleted = !requiresApproval || agentSteps.every((s) => s.status === 'completed');

const handleConfirmStep = async (stepNumber: number) => {
  setIsAdvancingStep(true);
  setStepAdvancingMsg(`Confirming Gate ${stepNumber}...`);

  try {
    /*
     * The frontend step number is only a UI concept.
     * LangGraph itself decides which checkpoint comes next.
     *
     * The backend investigation ID is required here.
     */
    const investigationId =
      data.backend_investigation_id || data.id;

    const response = await resumeInvestigation(
      investigationId,
      'APPROVE',
      `Human approved checkpoint ${stepNumber}.`,
      'frontend_reviewer'
    );

    console.log(
      'LangGraph checkpoint response:',
      response
    );

    /*
     * Backend has actually resumed the graph.
     * Update the UI using the backend response.
     */
    setActiveStepIndex((prev) => prev + 1);

    if (response.status === 'COMPLETED') {
      setStepAdvancingMsg(
        'Investigation completed successfully.'
      );
    } else {
      setStepAdvancingMsg(
        response.checkpoint_prompt ||
          `Gate ${stepNumber} confirmed.`
      );
    }

    /*
     * Give the UI a short moment to display the result.
     */
    setTimeout(() => {
      setIsAdvancingStep(false);
      setStepAdvancingMsg('');
    }, 500);
  } catch (error) {
    console.error(
      'Failed to resume investigation:',
      error
    );

    setStepAdvancingMsg(
      error instanceof Error
        ? error.message
        : 'Failed to contact investigation backend.'
    );

    setIsAdvancingStep(false);
  }
};

  const handleDecision = async (decision: DecisionType) => {
    if (isSubmitting || !allGatesCompleted) return;

    setIsSubmitting(true);
    const finalNotes = reviewerNotes.trim() || getDefaultNotes(decision);

    try {
      const response = await submitDecision({
        exception_id: data.id,
        decision,
        reviewer_notes: finalNotes,
      });

      if (response.success) {
        setDecisionRecord(response.record);
        setToastMessage(
          `Decision [${decision}] permanently sealed to audit trail with cryptographic hash ${response.record.audit_hash}.`
        );
      }
    } catch (err) {
      console.error('Decision error:', err);
      setToastMessage('Error recording decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultNotes = (decision: DecisionType) => {
    if (decision === 'REJECT') {
      return `Transaction blocked based on refutation of installment hypothesis. Unreconciled anomaly for ${data.vendor}.`;
    }
    if (decision === 'APPROVE') {
      return `Override approved by Controller following manual verification of ERP ledger.`;
    }
    return `Escalated to CFO due to material exposure of ${data.formatted_amount}.`;
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <AppLayout>
      {/* Top Header & Quick Switcher */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors border ${
              isMorning
                ? 'bg-white hover:bg-[#f6efe6] border-[#eadbce] text-[#1c1917]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className={`flex items-center gap-2 text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
              <span>CONTROL TOWER</span>
              <span>/</span>
              <span>INVESTIGATION</span>
              <span>/</span>
              <span className={`font-bold ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>{data.id}</span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 flex items-center gap-3 ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              {data.vendor} · {data.title}
            </h1>
          </div>
        </div>

        {/* Case Switcher & Mode Pill */}
        <div className="flex items-center gap-3">
          {requiresApproval ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isMorning
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-amber-600' : 'bg-amber-400'}`} />
              Tiered Human Checkpoints Enforced
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isMorning
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              }`}
            >
              <CheckCheck className={`h-3.5 w-3.5 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`} />
              Auto-Verified Pipeline
            </span>
          )}

          <div
            className={`flex items-center gap-1.5 p-1 rounded-xl text-xs font-mono border ${
              isMorning
                ? 'bg-white border-[#eadbce]'
                : 'bg-white/[0.04] border-white/10'
            }`}
          >
            <span className={`px-2 text-[11px] uppercase font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>Cases:</span>
            {['EXC-101', 'EXC-102', 'EXC-103'].map((caseId) => (
              <Link
                key={caseId}
                href={`/investigation/${caseId}`}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  id === caseId
                    ? isMorning
                      ? 'bg-[#c51636] text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : isMorning
                    ? 'text-[#78716c] hover:text-[#1c1917] hover:bg-[#f6efe6]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {caseId}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Banner */}
      {toastMessage && (
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300 ${
            isMorning
              ? 'bg-emerald-50 border-emerald-200 text-[#1c1917]'
              : 'border-emerald-500/40 bg-emerald-950/40 text-white'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                  isMorning ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  Action Executed & Sealed
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-900/60 border border-emerald-600 text-emerald-300'}`}>
                    STATUS: COMMITTED
                  </span>
                </h4>
                <p className={`text-xs ${isMorning ? 'text-[#57534e]' : 'text-slate-300'}`}>{toastMessage}</p>
                {decisionRecord && (
                  <div className={`mt-2 flex flex-wrap items-center gap-4 text-xs font-mono ${isMorning ? 'text-[#57534e]' : 'text-emerald-300'}`}>
                    <span>Audit ID: <strong className={isMorning ? 'text-[#1c1917]' : 'text-white'}>{decisionRecord.id}</strong></span>
                    <span>Decision: <strong className={isMorning ? 'text-[#1c1917]' : 'text-white'}>{decisionRecord.decision}</strong></span>
                    <span className="flex items-center gap-1.5">
                      Hash: <span className={`px-2 py-0.5 rounded-md border font-bold ${isMorning ? 'bg-white border-[#eadbce] text-[#c51636]' : 'bg-slate-900/80 border-emerald-500/30 text-white'}`}>{decisionRecord.audit_hash}</span>
                      <button onClick={() => copyHash(decisionRecord.audit_hash)} className="hover:opacity-75 transition-opacity">
                        {copiedHash ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                    <span>Signer: <strong className={isMorning ? 'text-[#1c1917]' : 'text-white'}>{decisionRecord.reviewer}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/reports"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  isMorning ? 'bg-[#c51636] text-white hover:bg-[#a8132e]' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                View Audit Report &rarr;
              </Link>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:opacity-75 p-1 text-sm">
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1 (Left - 30% width / lg:col-span-4): Tiered Multi-Agent Stepper Gates */}
        <div className="lg:col-span-4 space-y-4">
          <div
            className={`rounded-2xl p-5 transition-all duration-300 ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/25 text-white'
            }`}
          >
            
            {/* Stepper Header */}
            <div className={`flex items-center justify-between pb-4 border-b ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                    isMorning
                      ? 'bg-rose-50 border-rose-200 text-[#c51636]'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                    Multi-Agent Approval Gates
                  </h3>
                  <span className={`text-[11px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    {requiresApproval ? 'Step-by-Step Human Verification' : 'Autonomous Trace Completed'}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${isMorning ? 'bg-[#fcfaf6] border-[#eadbce] text-[#78716c]' : 'bg-white/[0.06] text-slate-300 border border-white/10'}`}>
                4 Gates
              </span>
            </div>

            {/* Stepper Steps */}
            <div className={`relative mt-5 space-y-5 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-[2px] ${isMorning ? 'before:bg-[#eadbce]' : 'before:bg-white/10'}`}>
              {timelineSteps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isAwaiting = step.status === 'awaiting_input';

                return (
                  <div key={step.step} className="relative flex items-start gap-3.5">
                    {/* Stepper Node Icon */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? isMorning
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : isAwaiting
                          ? isMorning
                            ? 'bg-[#c51636] text-white animate-amber-ring'
                            : 'bg-amber-400 text-slate-950 animate-amber-ring shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : isMorning
                          ? 'bg-[#fcfaf6] text-[#a8a29e] border border-[#eadbce]'
                          : 'bg-slate-800/80 text-slate-500 border border-white/10'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : isAwaiting ? (
                        <Clock className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Step Card */}
                    <div
                      className={`flex-1 rounded-xl p-3.5 transition-all duration-300 backdrop-blur-xl border ${
                        isAwaiting
                          ? isMorning
                            ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                            : 'bg-white/[0.04] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : isCompleted
                          ? isMorning
                            ? 'bg-white/80 border-[#eadbce]'
                            : 'bg-white/[0.04] border-emerald-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
                          : isMorning
                          ? 'bg-white/40 border-[#eadbce]/50 opacity-60'
                          : 'bg-white/[0.02] border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                          Gate {step.step}: {step.agent}
                        </span>
                        <span className={`text-[10px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                          {step.duration}
                        </span>
                      </div>

                      <div className={`text-[11px] font-mono mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                        {step.role} · {step.timestamp}
                      </div>

                      <p className={`text-xs leading-relaxed mt-1.5 ${isMorning ? 'text-[#57534e]' : 'text-slate-300'}`}>
                        {step.description}
                      </p>

                      {/* Badge */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? isMorning
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isAwaiting
                              ? isMorning
                                ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isMorning
                              ? 'bg-stone-100 text-stone-500 border border-stone-200'
                              : 'bg-white/[0.04] text-slate-500 border border-white/5'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Clock className={`h-3 w-3 ${isMorning ? 'text-[#c51636]' : 'text-amber-400'}`} />
                          )}
                          {step.badge}
                        </span>

                        {isCompleted && step.confirmedByHuman && (
                          <span className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                            <Check className="h-2.5 w-2.5" /> Human Verified
                          </span>
                        )}
                      </div>

                      {/* Action Button under active step */}
                      {requiresApproval && isAwaiting && step.step <= 4 && (
                        <div className={`mt-3 pt-3 border-t ${isMorning ? 'border-rose-200' : 'border-amber-500/20'}`}>
                          <button
                            onClick={() => handleConfirmStep(step.step)}
                            disabled={isAdvancingStep}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                              isMorning
                                ? 'bg-[#c51636] hover:bg-[#a8132e] text-white shadow-sm'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-lg shadow-[0_4px_16px_rgba(16,185,129,0.15)]'
                            }`}
                          >
                            {isAdvancingStep ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>{stepAdvancingMsg}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>{step.confirmLabel || `Confirm Gate ${step.step} Finding`}</span>
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Telemetry Footer */}
            <div className={`mt-6 pt-4 border-t text-xs font-mono space-y-1.5 ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
              <div className="flex justify-between">
                <span>Ensemble Architecture:</span>
                <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>4 Cognitive Nodes</span>
              </div>
              <div className="flex justify-between">
                <span>Pipeline Integrity:</span>
                <span className={`font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>SHA-256 HMAC Sealed</span>
              </div>
            </div>

          </div>
        </div>

        {/* COLUMN 2 (Middle - 45% width / lg:col-span-5): Discrepancy & Evidence Viewer */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Anomaly Header Card */}
          <div
            className={`rounded-2xl p-5 transition-all duration-300 ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-white/25 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    isMorning
                      ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                  }`}
                >
                  {data.risk_level} · Risk Score: {data.risk_score}/100
                </span>
                <h2 className={`text-lg font-bold mt-2.5 tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                  {data.title}
                </h2>
                <div className={`flex flex-wrap items-center gap-3 mt-1.5 text-xs ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  <span className={`flex items-center gap-1.5 font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-200'}`}>
                    <Building2 className={`h-3.5 w-3.5 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`} />
                    Vendor: {data.vendor}
                  </span>
                  <span>•</span>
                  <span>Category: {data.vendor_category}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className={`text-[11px] font-mono uppercase font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  Amount at Risk
                </div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight mt-0.5 ${isMorning ? 'text-[#c51636]' : 'text-white'}`}>
                  {data.formatted_amount}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards (Box A vs Box B) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Side-by-Side Transaction Differential
              </span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${isMorning ? 'bg-rose-100 text-[#c51636] border border-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                17-Minute Interval
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box A (Recorded Payment 1) */}
              <div
                className={`rounded-2xl p-4 space-y-3 relative overflow-hidden transition-all duration-300 ${
                  isMorning
                    ? 'bg-white/80 border border-emerald-200 shadow-xs'
                    : 'bg-white/[0.04] backdrop-blur-xl border border-emerald-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-emerald-500/45'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isMorning ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {data.comparison.box_a.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'}`}>
                    {data.comparison.box_a.status}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Txn Ref:</span>
                    <span className={`font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>{data.comparison.box_a.txn_id}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Date:</span>
                    <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-200'}>{data.comparison.box_a.date}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Amount:</span>
                    <span className={`font-bold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>{data.comparison.box_a.amount}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Invoice:</span>
                    <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-200'}>{data.comparison.box_a.invoice_ref}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Beneficiary:</span>
                    <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-200'}>{data.comparison.box_a.beneficiary_account}</span>
                  </div>
                </div>
              </div>

              {/* Box B (Flagged Payment 2) */}
              <div
                className={`rounded-2xl p-4 space-y-3 relative overflow-hidden transition-all duration-300 ${
                  isMorning
                    ? 'bg-white/80 border border-rose-200 shadow-xs'
                    : 'bg-white/[0.04] backdrop-blur-xl border border-rose-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-rose-500/45'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isMorning ? 'bg-[#c51636]' : 'bg-rose-500'}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>
                    {data.comparison.box_b.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isMorning ? 'bg-rose-100 text-[#c51636] border border-rose-200' : 'bg-rose-500/10 text-rose-300 border border-rose-500/25'}`}>
                    {data.comparison.box_b.status}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Txn Ref:</span>
                    <span className={`font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>{data.comparison.box_b.txn_id}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Date:</span>
                    <span className={`font-semibold ${isMorning ? 'text-[#c51636]' : 'text-rose-300'}`}>{data.comparison.box_b.date}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Amount:</span>
                    <span className={`font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>{data.comparison.box_b.amount}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Invoice:</span>
                    <span className={`font-semibold ${isMorning ? 'text-[#c51636]' : 'text-rose-300'}`}>{data.comparison.box_b.invoice_ref}</span>
                  </div>
                  <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>Beneficiary:</span>
                    <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-200'}>{data.comparison.box_b.beneficiary_account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adversarial Challenge Verdict Box */}
          <div
            className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ${
              isMorning
                ? 'bg-rose-50/40 border border-rose-200 text-[#1c1917]'
                : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-white/25 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                    isMorning
                      ? 'bg-rose-100 border-rose-200 text-[#c51636]'
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                </div>
                <h4 className={`text-sm font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                  {data.adversarial_verdict.title}
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${isMorning ? 'bg-rose-100 text-[#c51636] border-rose-200' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25'}`}>
                Confidence: {data.adversarial_verdict.confidence}
              </span>
            </div>

            <p className={`text-xs leading-relaxed p-3.5 rounded-xl border ${isMorning ? 'bg-white border-[#eadbce] text-[#1c1917]' : 'bg-slate-900/40 backdrop-blur-md border-white/10 text-slate-200'}`}>
              &ldquo;{data.adversarial_verdict.verdict}&rdquo;
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {data.adversarial_verdict.flags.map((flag, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
                    isMorning
                      ? 'bg-white border-[#eadbce] text-[#57534e]'
                      : 'bg-white/[0.04] border-white/10 text-slate-300'
                  }`}
                >
                  • {flag}
                </span>
              ))}
            </div>
          </div>

          {/* Source Document Link Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Cross-Source Evidence Dossier (Click to Inspect)
              </span>
              <span className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                3 Artifacts Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.source_documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`flex flex-col text-left p-3.5 rounded-2xl transition-all duration-300 group ${
                    isMorning
                      ? 'bg-white/80 border border-[#eadbce] hover:border-rose-300 shadow-xs'
                      : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                        isMorning
                          ? 'bg-rose-50 border-rose-200 text-[#c51636]'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isMorning ? 'bg-[#fcfaf6] border-[#eadbce] text-[#78716c]' : 'bg-white/[0.06] text-slate-300 border border-white/10'}`}>
                      {doc.type}
                    </span>
                  </div>

                  <span className={`mt-2.5 text-xs font-bold transition-colors truncate w-full font-mono ${isMorning ? 'text-[#1c1917] group-hover:text-[#c51636]' : 'text-white group-hover:text-emerald-400'}`}>
                    {doc.filename}
                  </span>

                  <div className={`mt-1 flex items-center justify-between w-full text-[11px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>{doc.size}</span>
                    <span className={`font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>SHA-256</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 3 (Right - 25% width / lg:col-span-3): Human Checkpoint & Action Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className={`sticky top-20 rounded-2xl p-5 space-y-5 transition-all duration-300 ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/25 text-white'
            }`}
          >
            
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                    isMorning
                      ? 'bg-rose-50 border-rose-200 text-[#c51636]'
                      : 'bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border-white/15 text-white'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                    Final Sign-off Authority
                  </h3>
                  <span className={`text-[11px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    SLA: 02h 14m Remaining
                  </span>
                </div>
              </div>
              <span className={`h-2 w-2 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-emerald-400'}`} />
            </div>

            {/* Status Banner */}
            {!allGatesCompleted ? (
              <div className={`rounded-xl p-3.5 space-y-1.5 border ${isMorning ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <Lock className={`h-3.5 w-3.5 ${isMorning ? 'text-amber-800' : 'text-amber-400'}`} />
                  <span>Decision Panel Locked</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Complete step-by-step verification first. Confirm active Gate {activeStepIndex}/4 in the trace timeline to unlock final decision.
                </p>
              </div>
            ) : (
              <div className={`rounded-xl p-3.5 space-y-1 border ${isMorning ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <Unlock className={`h-3.5 w-3.5 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`} />
                  <span>All Gates Verified — Armed</span>
                </div>
                <p className="text-[11px]">
                  All 4 multi-agent checkpoints confirmed. You may now commit the final decision.
                </p>
              </div>
            )}

            {/* Reviewer Profile */}
            <div className={`rounded-xl p-3 border text-xs font-mono space-y-1.5 ${isMorning ? 'bg-[#fcfaf6] border-[#eadbce]' : 'bg-slate-900/30 backdrop-blur-md border-white/10'}`}>
              <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                <span>Active Reviewer:</span>
                <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>Abhinav K.</span>
              </div>
              <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                <span>Role Authority:</span>
                <span className={`font-semibold ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`}>Financial Controller</span>
              </div>
              <div className={`flex justify-between ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                <span>Certificate:</span>
                <span className={isMorning ? 'text-[#1c1917]' : 'text-slate-300'}>FC-8812-SOX</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Reviewer Notes / Escalation Reason
              </label>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Confirmed Duplicate - Block',
                  'MSA Rate Non-Compliant',
                  'Escalate to CFO'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewerNotes(preset)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                      isMorning
                        ? 'bg-[#fcfaf6] hover:bg-white text-[#57534e] hover:text-[#1c1917] border-[#eadbce]'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter justification notes..."
                rows={3}
                className={`w-full rounded-xl p-3 text-xs font-mono transition-colors focus:outline-none ${
                  isMorning
                    ? 'bg-[#fcfaf6] border border-[#eadbce] text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#c51636] focus:bg-white'
                    : 'bg-slate-900/30 backdrop-blur-md border border-white/15 text-white placeholder:text-slate-500 focus:border-emerald-500/50'
                }`}
              />
            </div>

            {/* Final Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Red Button: [ Reject & Block Transaction ] */}
              <button
                type="button"
                onClick={() => handleDecision('REJECT')}
                disabled={isSubmitting || !allGatesCompleted}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                  allGatesCompleted
                    ? isMorning
                      ? 'text-white bg-[#c51636] hover:bg-[#a8132e] shadow-sm active:scale-[0.98]'
                      : 'text-white bg-rose-600 hover:bg-rose-500 shadow-sm active:scale-[0.98]'
                    : isMorning
                    ? 'text-[#a8a29e] bg-stone-100 border border-stone-200 cursor-not-allowed'
                    : 'text-slate-500 bg-white/[0.04] border border-white/5 cursor-not-allowed'
                }`}
              >
                <XCircle className="h-4 w-4" />
                <span>Reject & Block Transaction</span>
              </button>

              {/* Amber Button: [ Escalate to CFO ] */}
              <button
                type="button"
                onClick={() => handleDecision('ESCALATE')}
                disabled={isSubmitting || !allGatesCompleted}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                  allGatesCompleted
                    ? isMorning
                      ? 'text-white bg-amber-600 hover:bg-amber-700 shadow-sm active:scale-[0.98]'
                      : 'text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-sm active:scale-[0.98]'
                    : isMorning
                    ? 'text-[#a8a29e] bg-stone-100 border border-stone-200 cursor-not-allowed'
                    : 'text-slate-500 bg-white/[0.04] border border-white/5 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Escalate to CFO</span>
              </button>

              {/* Green Button: [ Approve Payment ] */}
              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                disabled={isSubmitting || !allGatesCompleted}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                  allGatesCompleted
                    ? isMorning
                      ? 'text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm active:scale-[0.98]'
                      : 'text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm active:scale-[0.98]'
                    : isMorning
                    ? 'text-[#a8a29e] bg-stone-100 border border-stone-200 cursor-not-allowed'
                    : 'text-slate-500 bg-white/[0.04] border border-white/5 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Payment</span>
              </button>
            </div>

            {/* Audit Notice */}
            <div className={`pt-2 border-t text-[10px] font-mono flex items-center gap-1.5 ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
              <Lock className={`h-3 w-3 ${isMorning ? 'text-[#c51636]' : 'text-emerald-400'}`} />
              <span>Decisions signed with cryptographic hash</span>
            </div>

          </div>
        </div>

      </div>

      {/* Source Document Modal */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </AppLayout>
  );
}
