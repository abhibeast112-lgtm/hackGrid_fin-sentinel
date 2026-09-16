'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentModal } from '@/components/investigation/DocumentModal';
import { fetchInvestigation, submitDecision } from '@/lib/api-client';
import { InvestigationDetail, SourceDocument, DecisionType, DecisionRecord } from '@/lib/types';
import { INVESTIGATION_DATABASE } from '@/lib/mock-data';
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Lock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function InvestigationRoomPage() {
  const params = useParams();
  const rawId = (params?.id as string) || 'EXC-101';
  const id = rawId.toUpperCase();

  const [data, setData] = useState<InvestigationDetail>(
    INVESTIGATION_DATABASE[id] || INVESTIGATION_DATABASE['EXC-101']
  );
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionRecord, setDecisionRecord] = useState<DecisionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchInvestigation(id)
      .then((detail) => {
        if (isMounted && detail) {
          setData(detail);
        }
      })
      .catch((err) => {
        console.error('Error fetching investigation:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDecision = async (decision: DecisionType) => {
    if (isSubmitting) return;

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
          `Decision [${decision}] recorded to audit trail with cryptographic hash ${response.record.audit_hash}.`
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
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#233c46]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#172a31] hover:bg-[#1f3741] border border-[#233c46] text-[#8aa1aa] hover:text-[#F5EED2] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8aa1aa]">
              <span>INVESTIGATION</span>
              <span>/</span>
              <span className="text-[#EBAE29] font-medium">{data.id}</span>
            </div>
            <h1 className="text-base font-semibold text-[#F5EED2] mt-0.5">
              {data.vendor} · {data.title}
            </h1>
          </div>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#0e181c] border border-[#233c46] text-xs font-mono">
          <span className="text-[#8aa1aa] px-2 text-[10px] uppercase">Case:</span>
          {['EXC-101', 'EXC-102', 'EXC-103'].map((caseId) => (
            <Link
              key={caseId}
              href={`/investigation/${caseId}`}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                id === caseId
                  ? 'bg-[#172a31] text-[#F5EED2] font-medium'
                  : 'text-[#8aa1aa] hover:text-[#F5EED2]'
              }`}
            >
              {caseId}
            </Link>
          ))}
        </div>
      </div>

      {/* Flat Decision Confirmation Banner */}
      {toastMessage && (
        <div className="rounded-md border border-[#589C80]/40 bg-[#589C80]/10 p-3.5 text-xs text-[#F5EED2]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-[#589C80] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-[#F5EED2]">Audit Record Committed</div>
                <p className="text-[#8aa1aa]">{toastMessage}</p>
                {decisionRecord && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#8aa1aa] pt-1">
                    <span>Audit ID: <span className="text-[#F5EED2]">{decisionRecord.id}</span></span>
                    <span>Decision: <span className="text-[#F5EED2]">{decisionRecord.decision}</span></span>
                    <span className="flex items-center gap-1">
                      Hash: <span className="text-[#F5EED2] bg-[#0e181c] px-1 py-0.2 rounded-sm border border-[#233c46]">{decisionRecord.audit_hash}</span>
                      <button onClick={() => copyHash(decisionRecord.audit_hash)} className="text-[#8aa1aa] hover:text-[#F5EED2]">
                        {copiedHash ? <Check className="h-3 w-3 text-[#589C80]" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#8aa1aa] hover:text-[#F5EED2] text-sm"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Split View Layout with Comfortable Spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1 (Left - 25% width / lg:col-span-3): Live Multi-Agent Investigation Trace */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#233c46]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8aa1aa] font-mono">
                Agent Pipeline Trace
              </h3>
              <span className="text-[10px] font-mono text-[#589C80]">4.56s Total</span>
            </div>

            {/* Vertical Timeline / Stepper */}
            <div className="mt-4 space-y-4 text-xs">
              {data.timeline.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isAwaiting = step.status === 'awaiting_input';

                return (
                  <div key={idx} className="relative flex items-start gap-3">
                    {/* Step Icon */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-mono mt-0.5 ${
                        isCompleted
                          ? 'bg-[#589C80]/15 text-[#589C80] border border-[#589C80]/30'
                          : isAwaiting
                          ? 'bg-[#EBAE29]/15 text-[#EBAE29] border border-[#EBAE29]/30'
                          : 'bg-[#0e181c] text-[#8aa1aa] border border-[#233c46]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : isAwaiting ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <span>{step.step}</span>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#F5EED2]">
                          {step.agent}
                        </span>
                        <span className="text-[10px] font-mono text-[#8aa1aa]">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8aa1aa] leading-relaxed">
                        {step.description}
                      </p>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${
                            isCompleted
                              ? 'bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20'
                              : 'bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20'
                          }`}
                        >
                          {step.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline Telemetry Footer */}
            <div className="mt-5 pt-3 border-t border-[#233c46] text-[11px] font-mono text-[#8aa1aa] space-y-1">
              <div className="flex justify-between">
                <span>Model Engine:</span>
                <span className="text-[#F5EED2]">Sentinel-v4</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="text-red-400 font-medium">{data.risk_score}% Anomaly</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (Middle - 45% width / lg:col-span-5): Discrepancy & Evidence Viewer */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* High-level Anomaly Header */}
          <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                  {data.risk_level} · Score: {data.risk_score}/100
                </span>
                <h2 className="text-sm font-semibold text-[#F5EED2] mt-2">
                  {data.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#8aa1aa] mt-1">
                  <span>Vendor: {data.vendor}</span>
                  <span>•</span>
                  <span>Category: {data.vendor_category}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-[#8aa1aa] uppercase">Exposure</div>
                <div className="text-lg font-semibold font-mono text-red-400">
                  {data.formatted_amount}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards (Box A vs Box B) */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8aa1aa]">
              Transaction Differential
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box A (Recorded Payment 1) */}
              <div className="rounded-md border border-[#233c46] bg-[#172a31] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#589C80]">
                    {data.comparison.box_a.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20">
                    {data.comparison.box_a.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Txn ID:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_a.txn_id}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Date:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_a.date}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Amount:</span>
                    <span className="text-[#589C80] font-medium">{data.comparison.box_a.amount}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Invoice:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_a.invoice_ref}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Account:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_a.beneficiary_account}</span>
                  </div>
                </div>
              </div>

              {/* Box B (Flagged Payment 2) */}
              <div className="rounded-md border border-red-500/30 bg-[#172a31] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-red-400">
                    {data.comparison.box_b.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                    {data.comparison.box_b.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Txn ID:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_b.txn_id}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Date:</span>
                    <span className="text-red-400">{data.comparison.box_b.date}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Amount:</span>
                    <span className="text-red-400 font-medium">{data.comparison.box_b.amount}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Invoice:</span>
                    <span className="text-red-400">{data.comparison.box_b.invoice_ref}</span>
                  </div>
                  <div className="flex justify-between text-[#8aa1aa]">
                    <span>Account:</span>
                    <span className="text-[#F5EED2]">{data.comparison.box_b.beneficiary_account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adversarial Challenge Verdict Box */}
          <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#EBAE29]" />
                <h4 className="text-xs font-semibold text-[#F5EED2]">
                  {data.adversarial_verdict.title}
                </h4>
              </div>
              <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20">
                Confidence: {data.adversarial_verdict.confidence}
              </span>
            </div>

            <p className="text-xs text-[#F5EED2] leading-relaxed bg-[#0e181c] p-3 rounded-sm border border-[#233c46]">
              &ldquo;{data.adversarial_verdict.verdict}&rdquo;
            </p>

            <div className="flex flex-wrap gap-1.5">
              {data.adversarial_verdict.flags.map((flag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#0e181c] border border-[#233c46] text-[#8aa1aa]"
                >
                  • {flag}
                </span>
              ))}
            </div>
          </div>

          {/* Source Document Link Cards */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8aa1aa]">
              Source Documents (Click to View)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.source_documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex flex-col text-left p-3 rounded-sm border border-[#233c46] bg-[#172a31] hover:bg-[#1b3038] hover:border-[#305361] transition-colors"
                >
                  <div className="flex items-center justify-between w-full">
                    <FileText className="h-4 w-4 text-[#EBAE29]" />
                    <span className="text-[9px] font-mono text-[#8aa1aa]">
                      {doc.type}
                    </span>
                  </div>

                  <span className="mt-2 text-xs font-medium text-[#F5EED2] truncate w-full font-mono">
                    {doc.filename}
                  </span>

                  <div className="mt-1 flex items-center justify-between w-full text-[10px] font-mono text-[#8aa1aa]">
                    <span>{doc.size}</span>
                    <span className="text-[#589C80]">Verified</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3 (Right - 30% width / lg:col-span-4): Human Checkpoint & Action Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-[#233c46] bg-[#172a31] p-5 space-y-4 sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#233c46] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F5EED2]">
                  Human Decision Required
                </h3>
                <span className="text-[11px] font-mono text-[#8aa1aa]">
                  SLA: 02h 14m Remaining
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#EBAE29]" />
            </div>

            {/* Reviewer Profile */}
            <div className="rounded-sm bg-[#0e181c] p-2.5 border border-[#233c46] text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#8aa1aa]">
                <span>Reviewer:</span>
                <span className="text-[#F5EED2]">Abhinav K.</span>
              </div>
              <div className="flex justify-between text-[#8aa1aa]">
                <span>Role:</span>
                <span className="text-[#EBAE29]">Financial Controller</span>
              </div>
            </div>

            {/* Reviewer Notes Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#F5EED2] block">
                Reviewer Notes / Escalation Reason
              </label>

              {/* Preset suggestion pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Confirmed Duplicate - Block Immediately',
                  'Violates Rate Cap in Signed MSA',
                  'Escalate to CFO'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewerNotes(preset)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#0e181c] hover:bg-[#132228] text-[#8aa1aa] hover:text-[#F5EED2] border border-[#233c46] transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter justification notes..."
                rows={4}
                className="w-full rounded-sm bg-[#0e181c] border border-[#233c46] p-2.5 text-xs text-[#F5EED2] placeholder:text-[#6c858f] focus:outline-none focus:border-[#EBAE29] font-mono transition-colors"
              />
            </div>

            {/* Action Buttons (Large, high contrast, clean flat SaaS style) */}
            <div className="space-y-2 pt-2">
              {/* Red Button: [ Reject & Block Transaction ] */}
              <button
                type="button"
                onClick={() => handleDecision('REJECT')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm font-medium text-xs text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject & Block Transaction</span>
              </button>

              {/* Amber Button: [ Escalate to CFO ] */}
              <button
                type="button"
                onClick={() => handleDecision('ESCALATE')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm font-medium text-xs text-[#132228] bg-[#EBAE29] hover:bg-[#dfa21e] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Escalate to CFO</span>
              </button>

              {/* Green Button: [ Approve Payment ] */}
              <button
                type="button"
                onClick={() => handleDecision('APPROVE')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm font-medium text-xs text-white bg-[#589C80] hover:bg-[#4d8a71] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve Payment</span>
              </button>
            </div>

            {/* Audit Notice */}
            <div className="pt-2 border-t border-[#233c46] text-[10px] font-mono text-[#8aa1aa] flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-[#589C80]" />
              <span>Decisions logged to SOX-compliant audit trail</span>
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
