'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Clock, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { AgentTimelineStep } from '@/lib/types';
import { useTheme } from '@/lib/theme-context';

interface ApprovalGatesBarProps {
  timelineSteps: AgentTimelineStep[];
  requiresApproval: boolean;
  activeStepIndex: number;
  isAdvancingStep: boolean;
  stepAdvancingMsg: string;
  onConfirmStep: (stepNumber: number) => void;
}

export function ApprovalGatesBar({
  timelineSteps,
  requiresApproval,
  activeStepIndex,
  isAdvancingStep,
  stepAdvancingMsg,
  onConfirmStep,
}: ApprovalGatesBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  const agentSteps = timelineSteps.filter((s) => s.step <= 4);

  // Badge styling per specification:
  // - Completed: bg-emerald-500/10 text-emerald-400 border border-emerald-500/30
  // - Active: bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse
  // - Locked: subtle muted styling
  const getBadgeClass = (status: string) => {
    if (isMorning) {
      if (status === 'completed') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      if (status === 'awaiting_input') return 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse';
      return 'bg-stone-100 text-stone-500 border border-stone-200';
    }
    if (status === 'completed') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
    }
    if (status === 'awaiting_input') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.25)]';
    }
    return 'bg-white/[0.04] text-slate-500 border border-white/5';
  };

  const getStatusText = (status: string) => {
    if (status === 'completed') return 'Complete';
    if (status === 'awaiting_input') return 'Active';
    return 'Locked';
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ease-in-out border overflow-hidden ${
        isMorning
          ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
          : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
      }`}
    >
      {/* Default State: Single-Line Compact Horizontal Summary Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Bar Title + Stage Pills */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-white/10">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                isMorning
                  ? 'bg-rose-50 border-rose-200 text-[#c51636]'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Approval Gates
              </span>
            </div>
          </div>

          {/* Gate Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {agentSteps.map((step) => {
              const badgeStyle = getBadgeClass(step.status);
              const statusLabel = getStatusText(step.status);
              const isCompleted = step.status === 'completed';
              const isAwaiting = step.status === 'awaiting_input';

              return (
                <div
                  key={step.step}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all ${badgeStyle}`}
                  title={`${step.agent} - ${statusLabel}`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  ) : isAwaiting ? (
                    <Clock className="h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <Lock className="h-2.5 w-2.5" />
                  )}
                  <span>
                    Gate {step.step}: {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action / Expand Toggle Icon */}
        <div className="flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0 border-t md:border-t-0 border-white/10">
          <div className={`text-[11px] font-mono hidden sm:block ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            {requiresApproval
              ? `Step ${activeStepIndex}/4: Human Verification Required`
              : 'All 4 Gates Auto-Verified'}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 active:scale-95 border ${
              isMorning
                ? 'bg-stone-100 hover:bg-stone-200 text-[#1c1917] border-stone-200'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border-white/10 hover:border-white/20'
            }`}
          >
            <span>{isExpanded ? '[ Collapse Gate Details ▴ ]' : '[ Expand Gate Details ▾ ]'}</span>
          </button>
        </div>
      </div>

      {/* Expanded State: Smoothly Expands Downwards (max-h-[700px] opacity-100) revealing detailed logs */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[700px] opacity-100 border-t' : 'max-h-0 opacity-0'
        } ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}
      >
        <div className="p-4 sm:p-5 space-y-4">
          {/* Responsive 4-Column Grid for the 4 Gates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {agentSteps.map((step) => {
              const isCompleted = step.status === 'completed';
              const isAwaiting = step.status === 'awaiting_input';

              return (
                <div
                  key={step.step}
                  className={`rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 border ${
                    isAwaiting
                      ? isMorning
                        ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                        : 'bg-white/[0.04] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : isCompleted
                      ? isMorning
                        ? 'bg-white/80 border-[#eadbce]'
                        : 'bg-white/[0.02] border-emerald-500/30'
                      : isMorning
                      ? 'bg-white/40 border-stone-200/60 opacity-60'
                      : 'bg-white/[0.01] border-white/5 opacity-60'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                        Gate {step.step}: {step.agent}
                      </span>
                      <span className={`text-[10px] font-mono shrink-0 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                        {step.duration}
                      </span>
                    </div>

                    <div className={`text-[11px] font-mono mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
                      {step.role} · {step.timestamp}
                    </div>

                    <p className={`text-xs leading-relaxed mt-2 line-clamp-3 ${isMorning ? 'text-[#57534e]' : 'text-slate-300'}`}>
                      {step.description}
                    </p>

                    {/* Step Reasoning Snippets if available */}
                    {step.reasoningDetails && step.reasoningDetails.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {step.reasoningDetails.slice(0, 2).map((detail, dIdx) => (
                          <div
                            key={dIdx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border line-clamp-1 ${
                              isMorning
                                ? 'bg-stone-50 border-stone-200 text-stone-600'
                                : 'bg-slate-900/40 border-white/5 text-slate-400'
                            }`}
                          >
                            • {detail}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer / Human Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${getBadgeClass(step.status)}`}>
                        {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {step.badge}
                      </span>

                      {isCompleted && step.confirmedByHuman && (
                        <span className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>
                          <Check className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Action Confirmation Button if awaiting human checkpoint */}
                    {requiresApproval && isAwaiting && step.step <= 4 && (
                      <button
                        onClick={() => onConfirmStep(step.step)}
                        disabled={isAdvancingStep}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
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
                            <span>{step.confirmLabel || `Confirm Gate ${step.step}`}</span>
                            <ArrowRight className="h-3 w-3 ml-0.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Telemetry Bar */}
          <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
            isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>4-Agent Cognitive Architecture • SHA-256 HMAC Sealed Ledger</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[11px] hover:underline"
            >
              Collapse details ▴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
