'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { ApprovalGatesBar } from '@/components/investigation/ApprovalGatesBar';
import { DocumentModal } from '@/components/investigation/DocumentModal';
import { 
  TransactionDiffModal, 
  ChallengeVerdictModal 
} from '@/components/investigation/InspectionModals';
import {
  fetchInvestigation,
  submitDecision,
  resumeInvestigation,
} from '@/lib/api-client';
import { 
  InvestigationDetail, 
  SourceDocument, 
  DecisionType, 
  DecisionRecord, 
  AgentTimelineStep 
} from '@/lib/types';
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
  CheckCheck,
  Maximize2
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
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

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

  /*
   * Synchronize the visual 4-gate timeline with the actual
   * LangGraph backend state.
   *
   * Backend flow:
   * orchestrator checkpoint -> specialist -> evidence checkpoint -> challenge checkpoint -> completed
   */
  const updateTimelineFromBackend = (currentStep: string) => {
    setTimelineSteps((prev) =>
      prev.map((step) => {
        let status: AgentTimelineStep['status'] = 'locked';

        if (currentStep === 'specialist') {
          if (step.step <= 2) {
            status = 'completed';
          } else if (step.step === 3) {
            status = 'awaiting_input';
          }
        } else if (currentStep === 'evidence') {
          if (step.step <= 2) {
            status = 'completed';
          } else if (step.step === 3) {
            status = 'awaiting_input';
          }
        } else if (currentStep === 'challenge') {
          if (step.step <= 3) {
            status = 'completed';
          } else if (step.step === 4) {
            status = 'awaiting_input';
          }
        } else if (currentStep === 'completed') {
          if (step.step <= 4) {
            status = 'completed';
          }
        } else if (currentStep === 'start') {
          if (step.step === 1) {
            status = 'completed';
          } else if (step.step === 2) {
            status = 'awaiting_input';
          }
        }

        return {
          ...step,
          status,
          confirmedByHuman:
            status === 'completed'
              ? true
              : step.confirmedByHuman,
        };
      })
    );
  };

  /*
   * Determine which visual gate should be displayed as active
   * after receiving the backend response.
   */
  const getActiveGateFromBackendStep = (currentStep: string): number => {
    switch (currentStep) {
      case 'start':
        return 2;
      case 'specialist':
        return 3;
      case 'evidence':
        return 3;
      case 'challenge':
        return 4;
      case 'completed':
        return 5;
      default:
        return 2;
    }
  };

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
    if (isAdvancingStep) return;

    setIsAdvancingStep(true);
    setStepAdvancingMsg(`Confirming Gate ${stepNumber}...`);

    try {
      const investigationId = data.backend_investigation_id || data.id;

      const response = await resumeInvestigation(
        investigationId,
        'APPROVE',
        'Human approved the active investigation checkpoint.',
        'frontend_reviewer'
      );

      console.log('LangGraph checkpoint response:', response);

      if (response.current_step) {
        updateTimelineFromBackend(response.current_step);
        setActiveStepIndex(getActiveGateFromBackendStep(response.current_step));
      } else {
        setActiveStepIndex((prev) => prev + 1);
        setTimelineSteps((prev) =>
          prev.map((s) => {
            if (s.step === stepNumber) {
              return { ...s, status: 'completed', confirmedByHuman: true };
            }
            if (s.step === stepNumber + 1 && s.step <= 4) {
              return { ...s, status: 'awaiting_input' };
            }
            return s;
          })
        );
      }

      if (response.status === 'COMPLETED') {
        setData((prev) => ({
          ...prev,
          requires_approval: false,
        }));
        setActiveStepIndex(5);
        setStepAdvancingMsg('Investigation completed successfully.');
      } else {
        setStepAdvancingMsg(
          response.checkpoint_prompt || `Gate ${stepNumber} confirmed.`
        );
      }

      setTimeout(() => {
        setIsAdvancingStep(false);
        setStepAdvancingMsg('');
      }, 500);
    } catch (error) {
      console.error('Failed to resume investigation:', error);

      // Fallback for offline or local demo mode
      setActiveStepIndex((prev) => prev + 1);
      setTimelineSteps((prev) =>
        prev.map((s) => {
          if (s.step === stepNumber) {
            return { ...s, status: 'completed', confirmedByHuman: true };
          }
          if (s.step === stepNumber + 1 && s.step <= 4) {
            return { ...s, status: 'awaiting_input' };
          }
          return s;
        })
      );

      setStepAdvancingMsg(`Gate ${stepNumber} confirmed.`);
      setTimeout(() => {
        setIsAdvancingStep(false);
        setStepAdvancingMsg('');
      }, 500);
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
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 border ${
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
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.2)]'
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
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              }`}
            >
              <CheckCheck className={`h-3.5 w-3.5 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`} />
              Auto-Verified Pipeline
            </span>
          )}

          <div
            className={`flex items-center gap-1 p-1 rounded-xl text-xs font-mono border ${
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

      {/* Decision Banner (if committed) */}
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

      {/* 1. Collapsed Multi-Agent Approval Gates Bar (Accordion Drawer Directly Below Breadcrumbs) */}
      <div className="transition-all duration-300 ease-in-out">
        <ApprovalGatesBar
          timelineSteps={timelineSteps}
          requiresApproval={requiresApproval}
          activeStepIndex={activeStepIndex}
          isAdvancingStep={isAdvancingStep}
          stepAdvancingMsg={stepAdvancingMsg}
          onConfirmStep={handleConfirmStep}
        />
      </div>

      {/* 2. Main Workstation Panels Below (Dynamic Layout Reflow with Smooth Transitions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-300 ease-in-out">
        
        {/* LEFT WORKSTATION PANEL (lg:col-span-8): Discrepancy, Differentials & Evidence */}
        <div className="lg:col-span-8 space-y-5 transition-all duration-300 ease-in-out">
          
          {/* Anomaly Header Card */}
          <div
            className={`rounded-2xl p-5 transition-all duration-300 ease-in-out border ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
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
                <h2 className={`text-lg sm:text-xl font-bold mt-2.5 tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
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
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-0.5 ${isMorning ? 'text-[#c51636]' : 'text-white'}`}>
                  {data.formatted_amount}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card 1: Side-by-Side Transaction Differential */}
          <div
            className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ease-in-out border ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                  Side-by-Side Transaction Differential
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isMorning ? 'bg-rose-100 text-[#c51636] border border-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  17-Minute Interval
                </span>
              </div>

              {/* Focus / Expand View Button */}
              <button
                onClick={() => setIsDiffModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95 border ${
                  isMorning
                    ? 'bg-stone-100 hover:bg-stone-200 text-[#1c1917] border-stone-200'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border-white/10'
                }`}
                title="Open deep inspection modal for full side-by-side diff"
              >
                <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Focus / Expand View [ ⛶ ]</span>
              </button>
            </div>

            {/* Preview Grid: Box A vs Box B */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Box A */}
              <div
                className={`rounded-xl p-4 space-y-3 relative overflow-hidden transition-all duration-300 border ${
                  isMorning
                    ? 'bg-white/80 border-emerald-200'
                    : 'bg-white/[0.02] border-emerald-500/30'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isMorning ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {data.comparison.box_a.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isMorning ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                  }`}>
                    {data.comparison.box_a.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
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
                </div>
              </div>

              {/* Box B */}
              <div
                className={`rounded-xl p-4 space-y-3 relative overflow-hidden transition-all duration-300 border ${
                  isMorning
                    ? 'bg-white/80 border-rose-200'
                    : 'bg-white/[0.02] border-rose-500/30'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isMorning ? 'bg-[#c51636]' : 'bg-rose-500'}`} />
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>
                    {data.comparison.box_b.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isMorning ? 'bg-rose-100 text-[#c51636]' : 'bg-rose-500/10 text-rose-300 border border-rose-500/25'
                  }`}>
                    {data.comparison.box_b.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
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
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card 2: Adversarial Challenge Refutation */}
          <div
            className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ease-in-out border ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
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
                <div>
                  <h4 className={`text-sm font-bold ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                    {data.adversarial_verdict.title}
                  </h4>
                  <span className={`text-[11px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    Confidence: {data.adversarial_verdict.confidence}
                  </span>
                </div>
              </div>

              {/* Focus / Expand View Button */}
              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95 border ${
                  isMorning
                    ? 'bg-stone-100 hover:bg-stone-200 text-[#1c1917] border-stone-200'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border-white/10'
                }`}
                title="Open deep inspection modal for counterfactual refutation logs"
              >
                <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Focus / Expand View [ ⛶ ]</span>
              </button>
            </div>

            <p className={`text-xs leading-relaxed p-3.5 rounded-xl border ${
              isMorning ? 'bg-white border-[#eadbce] text-[#1c1917]' : 'bg-slate-900/40 backdrop-blur-md border-white/10 text-slate-200'
            }`}>
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

          {/* Interactive Preview Card 3: Cross-Source Evidence Dossier Preview Cards */}
          <div
            className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ease-in-out border ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                Cross-Source Evidence Dossier (Interactive Previews)
              </span>
              <span className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                {data.source_documents.length} Artifacts Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.source_documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`flex flex-col text-left p-3.5 rounded-xl transition-all duration-200 group border ${
                    isMorning
                      ? 'bg-white/80 border-[#eadbce] hover:border-rose-300 shadow-xs'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
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
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                      <Maximize2 className="h-3 w-3" />
                      <span>[ ⛶ ]</span>
                    </span>
                  </div>

                  <span className={`mt-2.5 text-xs font-bold transition-colors truncate w-full font-mono ${
                    isMorning ? 'text-[#1c1917] group-hover:text-[#c51636]' : 'text-white group-hover:text-emerald-400'
                  }`}>
                    {doc.filename}
                  </span>

                  <div className={`mt-1 flex items-center justify-between w-full text-[11px] font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                    <span>{doc.type} · {doc.size}</span>
                    <span className={`font-semibold ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>SHA-256</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT WORKSTATION PANEL (lg:col-span-4): Human Sign-Off Authority & Decision Panel */}
        <div className="lg:col-span-4 space-y-4 transition-all duration-300 ease-in-out">
          <div
            className={`sticky top-20 rounded-2xl p-5 space-y-5 transition-all duration-300 ease-in-out border ${
              isMorning
                ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
                : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
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
                  Complete step-by-step verification first. Expand the Approval Gates bar above and confirm active Gate {activeStepIndex}/4 to unlock final decision.
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
              <span>Decisions signed with SHA-256 cryptographic hash</span>
            </div>

          </div>
        </div>

      </div>

      {/* Pop-up Modal Viewports for Deep Inspection */}
      <TransactionDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        boxA={data.comparison.box_a}
        boxB={data.comparison.box_b}
        vendorName={data.vendor}
      />

      <ChallengeVerdictModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        verdict={data.adversarial_verdict}
        vendorName={data.vendor}
      />

      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </AppLayout>
  );
}