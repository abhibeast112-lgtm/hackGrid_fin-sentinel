'use client';

import React from 'react';
import { SourceDocument } from '@/lib/types';
import { FileText, X, CheckCircle2, ShieldCheck, Download, ExternalLink, Hash } from 'lucide-react';

interface DocumentModalProps {
  document: SourceDocument | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#021C4F] border border-blue-800 text-blue-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] flex items-center gap-2">
                {document.filename}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {document.type} · {document.size}
                </span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Ingestion Source: <strong className="text-slate-200">{document.source}</strong></span>
                <span>•</span>
                <span className="flex items-center text-emerald-400 font-mono text-[11px]">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {document.verification}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cryptographic Hash Bar */}
        <div className="mt-3 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Hash className="h-3 w-3 text-cyan-400" />
            <span>SHA-256 PROVENANCE:</span>
            <span className="text-slate-200">{document.sha_hash || '0x4f820c78a91bc901a'}</span>
          </div>
          <span className="text-emerald-400 text-[10px] uppercase font-bold">Tamper Proof</span>
        </div>

        {/* OCR / Document Content Preview */}
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Extracted Telemetry & OCR Text Segment
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
            {document.raw_content || document.preview_text}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono">
          <span className="text-slate-500">Fin-Sentinel Evidence Vault #8812</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Close Artifact
            </button>
            <button
              onClick={() => {
                alert(`Downloaded verification payload for ${document.filename}`);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#021C4F] to-[#C50337] text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
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
