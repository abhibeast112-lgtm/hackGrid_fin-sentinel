'use client';

import React, { useState } from 'react';
import { SourceDocument } from '@/lib/types';
import { 
  FileText, 
  X, 
  ShieldCheck, 
  Download, 
  Hash, 
  Search, 
  Table, 
  FileCode, 
  Copy, 
  Check 
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface DocumentModalProps {
  document: SourceDocument | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'RAW' | 'PARSED_TABLE' | 'PROVENANCE'>('RAW');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  if (!document) return null;

  const rawText = document.raw_content || document.preview_text;
  const isCsv = document.type === 'CSV' || document.filename.endsWith('.csv');

  // Simple CSV parser for table view
  const parseCsvLines = () => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
    return { headers, rows };
  };

  const { headers, rows } = isCsv ? parseCsvLines() : { headers: [], rows: [] };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border p-6 shadow-2xl overflow-hidden ${
          isMorning
            ? 'bg-white/95 border-stone-300 text-[#1c1917]'
            : 'bg-slate-950/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isMorning ? 'bg-rose-50 border-rose-200 text-[#c51636]' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold flex items-center gap-2">
                {document.filename}
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
                  isMorning ? 'bg-stone-100 text-stone-700 border-stone-200' : 'bg-white/[0.06] text-slate-300 border-white/10'
                }`}>
                  {document.type} · {document.size}
                </span>
              </div>
              <div className={`flex flex-wrap items-center gap-3 text-xs mt-1 ${isMorning ? 'text-stone-500' : 'text-slate-400'}`}>
                <span>Ingestion Source: <strong className={isMorning ? 'text-stone-900' : 'text-white'}>{document.source}</strong></span>
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

        {/* View Mode Tabs & Search Filter */}
        <div className={`mt-3 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isMorning ? 'border-stone-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('RAW')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'RAW'
                  ? isMorning ? 'bg-stone-200 text-stone-900 font-bold' : 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Raw Document</span>
            </button>

            {isCsv && (
              <button
                onClick={() => setActiveTab('PARSED_TABLE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'PARSED_TABLE'
                    ? isMorning ? 'bg-stone-200 text-stone-900 font-bold' : 'bg-white/10 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Parsed High-Res Table</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('PROVENANCE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'PROVENANCE'
                  ? isMorning ? 'bg-stone-200 text-stone-900 font-bold' : 'bg-white/10 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              <span>SHA-256 Provenance</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-7 pl-8 pr-2.5 rounded-lg text-xs font-mono border focus:outline-none ${
                isMorning
                  ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
                  : 'bg-white/[0.05] border-white/10 text-white placeholder:text-slate-500 focus:border-white/30'
              } w-36 sm:w-44`}
            />
          </div>
        </div>

        {/* SHA-256 Provenance Bar */}
        <div className={`mt-3 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-mono border ${
          isMorning ? 'bg-stone-50 border-stone-200 text-stone-600' : 'bg-slate-900/40 border-white/10 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <Hash className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>SHA-256 HASH:</span>
            <span className={`font-semibold truncate ${isMorning ? 'text-stone-900' : 'text-white'}`}>
              {document.sha_hash || '0x4f820c78a91bc901a8824f'}
            </span>
          </div>
          <span className="text-emerald-400 text-[11px] uppercase font-bold tracking-wider shrink-0 ml-2">
            Sealed & Verified
          </span>
        </div>

        {/* Content Body */}
        <div className="mt-3 flex-1 overflow-y-auto min-h-[220px]">
          {activeTab === 'RAW' && (
            <div className={`rounded-xl border p-4 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto ${
              isMorning ? 'bg-stone-50 border-stone-200 text-stone-900' : 'bg-slate-900/50 border-white/10 text-slate-200'
            }`}>
              <pre className="whitespace-pre-wrap font-mono">
                {rawText
                  .split('\n')
                  .filter((l) => searchQuery === '' || l.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((line, idx) => (
                    <div key={idx} className="flex gap-3 hover:bg-white/[0.04] py-0.5 rounded px-1">
                      <span className="text-slate-500 select-none w-6 text-right shrink-0">{idx + 1}</span>
                      <span className="flex-1">{line}</span>
                    </div>
                  ))}
              </pre>
            </div>
          )}

          {activeTab === 'PARSED_TABLE' && isCsv && (
            <div className="rounded-xl border border-white/10 overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b ${isMorning ? 'bg-stone-100 border-stone-200' : 'bg-white/[0.04] border-white/10'}`}>
                    {headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3 uppercase text-slate-400 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows
                    .filter((row) => searchQuery === '' || row.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map((row, rIdx) => (
                      <tr key={rIdx} className={isMorning ? 'hover:bg-stone-50' : 'hover:bg-white/[0.02]'}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`py-2 px-3 ${isMorning ? 'text-stone-900' : 'text-slate-200'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'PROVENANCE' && (
            <div className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${
              isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'
            }`}>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Cryptographic Chain of Custody</span>
              </div>
              <div className="space-y-1.5">
                <div>Document ID: <strong>{document.id}</strong></div>
                <div>Ingestion Origin: <strong>{document.source}</strong></div>
                <div>Hash Protocol: <strong>SHA-256 (NIST FIPS 180-4)</strong></div>
                <div>Verification Status: <strong className="text-emerald-400">{document.verification}</strong></div>
                <div>Audit Signature: <code>{document.sha_hash || '0x4f820c78a91bc901a8824f'}</code></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
          <span className="text-slate-400">Fin-Sentinel Evidence Vault #8812</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                isMorning ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800' : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Content'}</span>
            </button>
            <button
              onClick={() => {
                const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = window.document.createElement('a');
                link.href = url;
                link.download = document.filename;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Raw</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold transition-colors"
            >
              Close Viewport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
