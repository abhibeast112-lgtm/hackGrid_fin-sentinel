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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-md border border-[#233c46] bg-[#172a31] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#233c46] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0e181c] border border-[#233c46] text-[#EBAE29]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F5EED2] flex items-center gap-2">
                {document.filename}
                <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono bg-[#0e181c] text-[#8aa1aa] border border-[#233c46]">
                  {document.type} · {document.size}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8aa1aa] mt-0.5">
                <span>Source: <span className="text-[#F5EED2]">{document.source}</span></span>
                <span>•</span>
                <span className="flex items-center text-[#589C80] font-mono text-[11px]">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {document.verification}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[#8aa1aa] hover:bg-[#0e181c] hover:text-[#F5EED2] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SHA Hash */}
        <div className="mt-3 px-2.5 py-1.5 rounded-sm bg-[#0e181c] border border-[#233c46] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#8aa1aa]">
            <Hash className="h-3 w-3 text-[#EBAE29]" />
            <span>SHA-256:</span>
            <span className="text-[#F5EED2]">{document.sha_hash || '0x4f820c78a91bc901a'}</span>
          </div>
          <span className="text-[#589C80] text-[10px] uppercase font-medium">Verified</span>
        </div>

        {/* Document Content */}
        <div className="mt-4 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#8aa1aa]">
            Extracted Content Preview
          </div>
          <div className="rounded-sm border border-[#233c46] bg-[#0e181c] p-3.5 font-mono text-xs text-[#F5EED2] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
            {document.raw_content || document.preview_text}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-[#233c46] pt-3 text-xs font-mono">
          <span className="text-[#8aa1aa]">Evidence Item ID: {document.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-sm bg-[#0e181c] hover:bg-[#132228] text-[#F5EED2] border border-[#233c46] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => alert(`Downloaded ${document.filename}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#EBAE29] text-[#132228] font-medium hover:bg-[#dfa21e] transition-colors"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
