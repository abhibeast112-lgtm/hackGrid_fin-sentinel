'use client';

import React from 'react';
import { SourceDocument } from '@/lib/types';
import { FileText, X, ShieldCheck, Download, Hash } from 'lucide-react';

interface DocumentModalProps {
  document: SourceDocument | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                {document.filename}
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/[0.06] text-slate-300 border border-white/10">
                  {document.type} · {document.size}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Ingestion Source: <strong className="text-white">{document.source}</strong></span>
                <span>•</span>
                <span className="flex items-center text-emerald-400 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  {document.verification}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SHA-256 Provenance Bar */}
        <div className="mt-4 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Hash className="h-3.5 w-3.5 text-indigo-400" />
            <span>SHA-256 PROVENANCE:</span>
            <span className="text-white font-semibold">{document.sha_hash || '0x4f820c78a91bc901a'}</span>
          </div>
          <span className="text-emerald-400 text-[11px] uppercase font-bold tracking-wider">
            Verified Seal
          </span>
        </div>

        {/* Extracted Telemetry & OCR Text Segment */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Extracted Telemetry & Raw Document Fragment
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
            {document.raw_content || document.preview_text}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
          <span className="text-slate-400">Fin-Sentinel Evidence Vault #8812</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-colors"
            >
              Close Artifact
            </button>
            <button
              onClick={() => alert(`Downloaded verification payload for ${document.filename}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Download RAW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
