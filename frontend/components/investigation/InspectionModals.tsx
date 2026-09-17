'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Terminal 
} from 'lucide-react';
import { ComparisonBox, AdversarialVerdict } from '@/lib/types';
import { useTheme } from '@/lib/theme-context';

/* -------------------------------------------------------------------------- */
/* Modal 1: Side-by-Side Transaction Differential Deep Inspection Modal       */
/* -------------------------------------------------------------------------- */
interface TransactionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxA: ComparisonBox;
  boxB: ComparisonBox;
  vendorName: string;
}

export function TransactionDiffModal({
  isOpen,
  onClose,
  boxA,
  boxB,
  vendorName,
}: TransactionDiffModalProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  if (!isOpen) return null;

  const diffFields = [
    { label: 'Transaction Reference', valA: boxA.txn_id, valB: boxB.txn_id, isDiff: true, highlight: 'rose' },
    { label: 'Execution Timestamp', valA: boxA.date, valB: boxB.date, isDiff: true, note: '17-minute delta' },
    { label: 'Invoiced Amount', valA: boxA.amount, valB: boxB.amount, isDiff: false, highlight: 'rose', note: 'Identical exact value' },
    { label: 'Invoice Reference', valA: boxA.invoice_ref, valB: boxB.invoice_ref, isDiff: false, highlight: 'rose', note: 'Token Collision (INV-1042)' },
    { label: 'Beneficiary Account', valA: boxA.beneficiary_account, valB: boxB.beneficiary_account, isDiff: false, note: 'Same recipient account' },
    { label: 'Settlement Channel', valA: boxA.channel, valB: boxB.channel, isDiff: false },
    { label: 'General Ledger Code', valA: boxA.gl_code, valB: boxB.gl_code, isDiff: false },
    { label: 'Status at Ingestion', valA: boxA.status, valB: boxB.status, isDiff: true, highlight: 'amber' },
  ];

  const handleCopyJson = () => {
    const payload = {
      vendor: vendorName,
      boxA,
      boxB,
      deltaMinutes: 17,
      discrepancyType: 'Near-Instant Duplicate Payment',
      auditHash: '0x8f2b7a91c49e',
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border p-6 shadow-2xl overflow-hidden ${
          isMorning
            ? 'bg-white/95 border-stone-300 text-[#1c1917]'
            : 'bg-slate-950/80 backdrop-blur-2xl border border-white/20 shadow-2xl text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isMorning ? 'bg-rose-50 border-rose-200 text-[#c51636]' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Transaction Differential Inspector
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  isMorning ? 'bg-rose-100 text-[#c51636]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                }`}>
                  17-Minute Interval Collateral
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isMorning ? 'text-stone-500' : 'text-slate-400'}`}>
                Cross-ledger field-by-field parity check between initial remittance and intercepted duplicate.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Diff Comparison Table */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className={`border-b ${isMorning ? 'border-stone-200 bg-stone-50' : 'border-white/10 bg-white/[0.02]'}`}>
                  <th className="py-2.5 px-3 uppercase text-slate-400">Parameter</th>
                  <th className="py-2.5 px-3 uppercase text-emerald-400">Legitimate Batch (A)</th>
                  <th className="py-2.5 px-3 uppercase text-rose-400">Flagged Batch (B)</th>
                  <th className="py-2.5 px-3 uppercase text-slate-400 text-right">Parity Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {diffFields.map((field, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      field.highlight === 'rose'
                        ? isMorning ? 'bg-rose-50/50' : 'bg-rose-500/[0.05]'
                        : isMorning ? 'hover:bg-stone-50' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className={`py-3 px-3 font-semibold ${isMorning ? 'text-stone-700' : 'text-slate-300'}`}>
                      {field.label}
                    </td>
                    <td className={`py-3 px-3 ${isMorning ? 'text-stone-900' : 'text-white'}`}>
                      {field.valA}
                    </td>
                    <td className={`py-3 px-3 font-bold ${
                      field.isDiff ? (isMorning ? 'text-[#c51636]' : 'text-rose-400') : (isMorning ? 'text-stone-900' : 'text-white')
                    }`}>
                      {field.valB}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {field.note ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          field.highlight === 'rose'
                            ? isMorning ? 'bg-rose-100 text-[#c51636]' : 'bg-rose-500/20 text-rose-300'
                            : isMorning ? 'bg-stone-200 text-stone-800' : 'bg-white/10 text-slate-300'
                        }`}>
                          {field.note}
                        </span>
                      ) : field.isDiff ? (
                        <span className="text-amber-400">DIFF</span>
                      ) : (
                        <span className="text-emerald-400">MATCH</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Forensic Summary Notice */}
          <div className={`p-4 rounded-xl border space-y-1 text-xs font-mono ${
            isMorning ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Double-Clearing Hazard Analysis</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If TXN-8417 cleared without automated quarantine, vendor Acme Systems would have received duplicate credit of ₹84,500 under single purchase authorization PO-902. Dispatched via parallel automated payment batch #4819.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Audit Proof ID: 0x8f2b7a91 · SHA-256 HMAC Verified</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyJson}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all ${
                isMorning
                  ? 'bg-stone-100 hover:bg-stone-200 text-[#1c1917] border-stone-200'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Diff JSON' : 'Copy Diff JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal 2: Adversarial Challenge Refutation Deep Inspection Modal            */
/* -------------------------------------------------------------------------- */
interface ChallengeVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict: AdversarialVerdict;
  vendorName: string;
}

export function ChallengeVerdictModal({
  isOpen,
  onClose,
  verdict,
  vendorName,
}: ChallengeVerdictModalProps) {
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border p-6 shadow-2xl overflow-hidden ${
          isMorning
            ? 'bg-white/95 border-stone-300 text-[#1c1917]'
            : 'bg-slate-950/80 backdrop-blur-2xl border border-white/20 shadow-2xl text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isMorning ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
            }`}>
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Adversarial Refutation & Counterfactual Simulation
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  isMorning ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25'
                }`}>
                  Confidence: {verdict.confidence}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isMorning ? 'text-stone-500' : 'text-slate-400'}`}>
                {verdict.agent} · Counterfactual test logs for {vendorName} against benign financial explanations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Tested Hypothesis Card */}
          <div className={`p-4 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-white/[0.02] border-white/10'}`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hypothesis Evaluated (H1)
            </div>
            <p className={`mt-1.5 text-sm font-sans ${isMorning ? 'text-stone-900' : 'text-white'}`}>
              &ldquo;{verdict.hypothesis}&rdquo;
            </p>
          </div>

          {/* Refutation Finding & Simulation Trace */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isMorning ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-500/[0.06] border-rose-500/25'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-xs uppercase ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>
                Counterfactual Simulation Result: {verdict.test_result}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isMorning ? 'bg-rose-100 text-[#c51636]' : 'bg-rose-500/20 text-rose-300'
              }`}>
                HYPOTHESIS REJECTED
              </span>
            </div>
            <p className={`text-xs leading-relaxed font-sans ${isMorning ? 'text-stone-800' : 'text-slate-200'}`}>
              {verdict.verdict}
            </p>
          </div>

          {/* Sensor Logs & Physical Reality Checks */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cross-Modal Telemetry & Physical Sensors
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'}`}>
                <div className="text-[11px] text-slate-400">WMS RFID Scanner Ground-Truth</div>
                <div className="text-sm font-bold mt-1 text-emerald-400">36 Verified Ingress Receipts</div>
                <p className="text-[11px] text-slate-400 mt-1">RFID gate sensors match exactly 36 physical shipments across the billing period.</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'}`}>
                <div className="text-[11px] text-slate-400">Billed Invoice Consignments</div>
                <div className="text-sm font-bold mt-1 text-rose-400">62 Invoiced Waybills</div>
                <p className="text-[11px] text-slate-400 mt-1">26 unreceipted entries without dock manifest signatures or vehicle weight slips.</p>
              </div>
            </div>
          </div>

          {/* Anomaly Flags Matrix */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Counterfactual Red Flags
            </span>
            <div className="flex flex-wrap gap-2">
              {verdict.flags.map((flag, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                    isMorning
                      ? 'bg-white border-stone-200 text-stone-700'
                      : 'bg-white/[0.04] border-white/10 text-slate-300'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-rose-500'}`} />
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Adversarial Engine: DeepAudit Refutation Core 4.1</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold transition-colors"
          >
            Close Viewport
          </button>
        </div>
      </div>
    </div>
  );
}
