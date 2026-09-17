'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export interface BreakdownItem {
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: 'emerald' | 'amber' | 'rose';
}

export interface MetricKpiCardProps {
  id: string;
  title: string;
  value: string;
  badgeText: string;
  badgeType: 'emerald' | 'amber' | 'rose';
  footerLabel: string;
  footerValue: string;
  sparklineData: number[];
  sparklineColor: string;
  breakdownItems: BreakdownItem[];
  deltaDescription: string;
  isInitiallyExpanded?: boolean;
}

export function MetricKpiCard({
  title,
  value,
  badgeText,
  badgeType,
  footerLabel,
  footerValue,
  sparklineData,
  sparklineColor,
  breakdownItems,
  deltaDescription,
  isInitiallyExpanded = false,
}: MetricKpiCardProps) {
  const [expanded, setExpanded] = useState(isInitiallyExpanded);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  // Badge styles according to spec:
  // - Completed/positive: bg-emerald-500/10 text-emerald-400 border border-emerald-500/30
  // - Active/alert: bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse
  // - Critical: bg-rose-500/10 text-rose-400 border border-rose-500/30
  const getBadgeStyle = () => {
    if (isMorning) {
      if (badgeType === 'emerald') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      if (badgeType === 'amber') return 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse';
      return 'bg-rose-100 text-[#c51636] border border-rose-200';
    }
    if (badgeType === 'emerald') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
    }
    if (badgeType === 'amber') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
  };

  // Generate SVG path for sparkline
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 160;
  const height = 44;
  const padding = 4;

  const points = sparklineData.map((val, idx) => {
    const x = padding + (idx / (sparklineData.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`group cursor-pointer relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-in-out border ${
        isMorning
          ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] hover:border-[#dfcebe] shadow-xs'
          : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
      } ${expanded ? (isMorning ? 'ring-2 ring-[#c51636]/20' : 'ring-1 ring-white/20 bg-white/[0.06]') : ''}`}
    >
      {/* Top Row: Title + Status Pill + Toggle */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-mono tracking-wider uppercase font-semibold ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${getBadgeStyle()}`}>
            {badgeText}
          </span>
          <button
            type="button"
            aria-label={expanded ? 'Collapse card details' : 'Expand card details'}
            className={`p-1 rounded-lg transition-transform duration-200 ${
              isMorning ? 'text-[#78716c] hover:bg-stone-100' : 'text-slate-400 hover:bg-white/10'
            } ${expanded ? 'rotate-180' : ''}`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-3xl font-extrabold font-mono tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
          {value}
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-mono ${
        isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'
      }`}>
        <span>{footerLabel}</span>
        <span className={`font-semibold ${isMorning ? 'text-[#1c1917]' : 'text-slate-200'}`}>
          {footerValue}
        </span>
      </div>

      {/* Expandable Accordion Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[380px] opacity-100 mt-4 pt-3 border-t' : 'max-h-0 opacity-0'
        } ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}
      >
        {/* Nested Sparkline & Delta Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={isMorning ? 'text-[#78716c]' : 'text-slate-400'}>Trajectory (6M)</span>
            <span className={`font-bold ${
              badgeType === 'emerald' ? (isMorning ? 'text-emerald-700' : 'text-emerald-400') :
              badgeType === 'amber' ? (isMorning ? 'text-amber-800' : 'text-amber-400') :
              (isMorning ? 'text-[#c51636]' : 'text-rose-400')
            }`}>
              {deltaDescription}
            </span>
          </div>

          {/* Sparkline Canvas */}
          <div className={`w-full py-1 px-2 rounded-xl border flex items-center justify-center ${
            isMorning ? 'bg-stone-50/70 border-stone-200' : 'bg-slate-900/40 border-white/5'
          }`}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 overflow-visible">
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#grad-${title.replace(/\s+/g, '')})`} />
              <path d={linePath} fill="none" stroke={sparklineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Highlight last point */}
              {points.length > 0 && (
                <circle
                  cx={parseFloat(points[points.length - 1].split(',')[0])}
                  cy={parseFloat(points[points.length - 1].split(',')[1])}
                  r="3.5"
                  fill={sparklineColor}
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          {/* Breakdown Sub-metrics */}
          <div className="space-y-1.5 pt-1">
            {breakdownItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between text-xs font-mono py-1 px-2 rounded-lg ${
                  isMorning ? 'bg-stone-100/50' : 'bg-white/[0.02]'
                }`}
              >
                <span className={isMorning ? 'text-[#78716c]' : 'text-slate-400'}>
                  {item.label}
                </span>
                <span
                  className={`font-semibold ${
                    item.highlightColor === 'emerald'
                      ? isMorning ? 'text-emerald-700' : 'text-emerald-400'
                      : item.highlightColor === 'amber'
                      ? isMorning ? 'text-amber-800' : 'text-amber-400'
                      : item.highlightColor === 'rose'
                      ? isMorning ? 'text-[#c51636]' : 'text-rose-400'
                      : isMorning ? 'text-[#1c1917]' : 'text-white'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Collapsible toggle hint */}
          <div className={`text-center pt-1 text-[10px] font-mono ${isMorning ? 'text-stone-400' : 'text-slate-500'}`}>
            Click card to collapse view ▴
          </div>
        </div>
      </div>
    </div>
  );
}
