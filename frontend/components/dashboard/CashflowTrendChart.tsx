'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { CASHFLOW_TREND_DATA } from '@/lib/mock-data';
import { 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal, 
  X, 
  TrendingUp, 
  Filter, 
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function CashflowTrendChart() {
  const [mounted, setMounted] = useState(false);
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtering states for the Full Viewport Modal (Option B)
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | 'YTD'>('6M');
  const [showRevenue, setShowRevenue] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter data according to timeRange
  const getFilteredData = () => {
    if (timeRange === '1M') return CASHFLOW_TREND_DATA.slice(-1);
    if (timeRange === '3M') return CASHFLOW_TREND_DATA.slice(-3);
    return CASHFLOW_TREND_DATA;
  };

  const chartData = getFilteredData();

  if (!mounted) {
    return (
      <div className={`h-48 flex items-center justify-center rounded-2xl border ${
        isMorning ? 'border-[#eadbce] bg-white/80' : 'border-white/10 bg-white/[0.03] backdrop-blur-xl'
      }`}>
        <span className={`text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>Loading telemetry stream...</span>
      </div>
    );
  }

  return (
    <>
      {/* Primary Chart Card */}
      <div
        className={`rounded-2xl transition-all duration-300 ease-in-out border ${
          isMorning
            ? 'bg-white/80 backdrop-blur-xl border-[#eadbce] shadow-xs text-[#1c1917]'
            : 'bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
        } ${isInlineExpanded ? 'p-6' : 'p-4 sm:p-5'}`}
      >
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
                Cash Outflow & Anomaly Envelope
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5 ${
                  isMorning
                    ? 'bg-rose-100 text-[#c51636] border border-rose-200'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-[#c51636]' : 'bg-amber-400'}`} />
                +18.4% Variance Detected
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
              YTD AP remittance outflow volume vs. predictive bounds across AP pipelines
            </p>
          </div>

          {/* Action Toolbar & Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            {/* Legend indicators */}
            <div className="hidden md:flex items-center gap-3 pr-2 border-r border-white/10">
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${isMorning ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                <span className={isMorning ? 'text-[#57534e]' : 'text-slate-300'}>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${isMorning ? 'bg-[#c51636]' : 'bg-indigo-400'}`} />
                <span className={isMorning ? 'text-[#57534e]' : 'text-slate-300'}>Expenses</span>
              </div>
            </div>

            {/* Option A: In-Line Toggle Button */}
            <button
              onClick={() => setIsInlineExpanded(!isInlineExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95 border ${
                isMorning
                  ? 'bg-stone-100 hover:bg-stone-200 text-[#1c1917] border-stone-200'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border-white/10'
              }`}
              title={isInlineExpanded ? 'Collapse to compact view' : 'Expand in-line (Option A)'}
            >
              {isInlineExpanded ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>⛶ Expand Chart</span>
                </>
              )}
            </button>

            {/* Option B: Modal Viewport Launch Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 active:scale-95 ${
                isMorning
                  ? 'bg-[#c51636] hover:bg-[#a8132e] text-white shadow-xs'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              }`}
              title="Launch full-screen analytics modal with deep filtering (Option B)"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Deep Filter Viewport</span>
              <span className="sm:hidden">Filters</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas: Compact default (180px, ~40% less vertical height) vs In-Line Expanded (480px) */}
        <div
          className={`w-full transition-all duration-300 ease-in-out ${
            isInlineExpanded ? 'h-[420px]' : 'h-44'
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CASHFLOW_TREND_DATA} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="chartRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isMorning ? '#059669' : '#10b981'} stopOpacity={isMorning ? 0.2 : 0.22} />
                  <stop offset="95%" stopColor={isMorning ? '#059669' : '#10b981'} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isMorning ? '#c51636' : '#6366f1'} stopOpacity={isMorning ? 0.2 : 0.22} />
                  <stop offset="95%" stopColor={isMorning ? '#c51636' : '#6366f1'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.05)'} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={isMorning ? '#78716c' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.1)' }}
              />
              <YAxis
                stroke={isMorning ? '#78716c' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.1)' }}
                tickFormatter={(v) => `₹${v}Cr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isMorning ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                  borderColor: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: isMorning ? '#1c1917' : '#ffffff',
                  fontFamily: 'monospace',
                  boxShadow: isMorning ? '0 4px 12px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.4)',
                }}
                formatter={(value: any, name: any) => [
                  name === 'anomalies' ? `₹${value} L` : `₹${value} Cr`,
                  name === 'revenue' ? 'Monthly Revenue' : 'Monthly Outflow'
                ]}
              />
              <ReferenceLine
                x="Sep (MTD)"
                stroke={isMorning ? '#c51636' : '#f43f5e'}
                strokeDasharray="4 4"
                label={{
                  value: 'OUTLIER INTERCEPTED',
                  fill: isMorning ? '#c51636' : '#f43f5e',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={isMorning ? '#059669' : '#10b981'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartRevenue)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={isMorning ? '#c51636' : '#6366f1'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* In-Line Expanded Analytics Strip (Shown only in In-Line Expansion mode) */}
        {isInlineExpanded && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
            <div className={`p-3 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-white/[0.02] border-white/10'}`}>
              <div className="text-[11px] font-mono text-slate-400">Baseline Variance Band</div>
              <div className={`text-base font-bold font-mono mt-1 ${isMorning ? 'text-amber-800' : 'text-amber-400'}`}>+18.4% (Threshold: 10%)</div>
              <p className="text-[11px] text-slate-400 mt-1">Outflow velocity breached upper control limit on Sep 12 batch generation.</p>
            </div>
            <div className={`p-3 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-white/[0.02] border-white/10'}`}>
              <div className="text-[11px] font-mono text-slate-400">Total Intercepted Amount</div>
              <div className={`text-base font-bold font-mono mt-1 ${isMorning ? 'text-[#c51636]' : 'text-rose-400'}`}>₹2,79,500</div>
              <p className="text-[11px] text-slate-400 mt-1">3 active exceptions quarantined prior to HDFC/ICICI clearing windows.</p>
            </div>
            <div className={`p-3 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-white/[0.02] border-white/10'}`}>
              <div className="text-[11px] font-mono text-slate-400">Predictive Month-End Net Cash</div>
              <div className={`text-base font-bold font-mono mt-1 ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>+₹51.0 L Net Surplus</div>
              <p className="text-[11px] text-slate-400 mt-1">Assumes blocked anomaly funds are permanently rejected by Controller.</p>
            </div>
          </div>
        )}

        {/* Compact Footer telemetry strip */}
        <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${
          isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${isMorning ? 'text-[#c51636]' : 'text-amber-400'}`} />
            <span>Outflow increased ₹20.4L above baseline due to duplicate ERP batch generation</span>
          </div>
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-stone-500' : 'bg-emerald-500'}`} />
            142 tx/min telemetry
          </span>
        </div>
      </div>

      {/* Option B: Modal Overlay - Full-Screen Liquid Glass Analytics Viewport */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border overflow-hidden shadow-2xl ${
              isMorning
                ? 'bg-white/95 border-stone-300 text-[#1c1917]'
                : 'bg-slate-950/80 backdrop-blur-2xl border-white/20 shadow-2xl text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${isMorning ? 'bg-rose-50 border-rose-200 text-[#c51636]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">
                      Full-Scale Liquid Glass Analytics Viewport
                    </h2>
                    <p className={`text-xs ${isMorning ? 'text-stone-500' : 'text-slate-400'}`}>
                      Multi-dimensional financial telemetry, anomaly bounds, and deep filtering
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl transition-colors border ${
                  isMorning
                    ? 'hover:bg-stone-100 border-stone-200 text-stone-600'
                    : 'hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Deep Filtering Controls Bar */}
            <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
              isMorning ? 'bg-stone-50/80 border-stone-200' : 'bg-white/[0.02] border-white/10'
            }`}>
              {/* Time Range Buttons */}
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] uppercase mr-1 ${isMorning ? 'text-stone-500' : 'text-slate-400'}`}>
                  Horizon:
                </span>
                {(['1M', '3M', '6M', 'YTD'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                      timeRange === r
                        ? isMorning
                          ? 'bg-[#c51636] text-white shadow-xs'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isMorning
                        ? 'text-stone-600 hover:bg-stone-200'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Metric Series Toggles */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRevenue}
                    onChange={(e) => setShowRevenue(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="text-emerald-400 font-semibold">Revenue</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showExpenses}
                    onChange={(e) => setShowExpenses(e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className={isMorning ? 'text-[#c51636]' : 'text-indigo-400'}>Expenses</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showAnomalies}
                    onChange={(e) => setShowAnomalies(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span className="text-rose-400 font-semibold">Anomaly Envelope</span>
                </label>
              </div>
            </div>

            {/* Modal Body: High-Res Chart + Drilldown Sidebar */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* High-Res Chart Canvas */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="modalRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="modalExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.08)'} vertical={false} />
                    <XAxis dataKey="month" stroke={isMorning ? '#78716c' : '#94a3b8'} fontSize={12} />
                    <YAxis stroke={isMorning ? '#78716c' : '#94a3b8'} fontSize={12} tickFormatter={(v) => `₹${v}Cr`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isMorning ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        borderColor: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(v: any, name: any) => [`₹${v} Cr`, name === 'revenue' ? 'Revenue' : 'Expenses']}
                    />
                    {showRevenue && (
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#modalRevenue)"
                      />
                    )}
                    {showExpenses && (
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#modalExpense)"
                      />
                    )}
                    {showAnomalies && (
                      <ReferenceLine
                        x="Sep (MTD)"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        label={{
                          value: 'DUPLICATE BATCH VARIANCE (+₹20.4L)',
                          fill: '#f43f5e',
                          fontSize: 11,
                          position: 'top',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Drilldown Analytical Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className={`p-4 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'}`}>
                  <div className="text-xs font-mono font-bold flex items-center justify-between text-slate-400">
                    <span>AP BATCH VELOCITY</span>
                    <span className="text-emerald-400">+12% MoM</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono">1,842 Batches</div>
                  <p className="mt-1 text-xs text-slate-400">Aggregated payments routed through HDFC and ICICI payment gateways.</p>
                </div>

                <div className={`p-4 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'}`}>
                  <div className="text-xs font-mono font-bold flex items-center justify-between text-slate-400">
                    <span>UNRECONCILED SURCHARGE</span>
                    <span className="text-rose-400">+₹20.4 L</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-rose-400">₹20,40,000</div>
                  <p className="mt-1 text-xs text-slate-400">Spike directly mapped to duplicate ERP billing batches under investigation.</p>
                </div>

                <div className={`p-4 rounded-xl border ${isMorning ? 'bg-stone-50 border-stone-200' : 'bg-slate-900/40 border-white/10'}`}>
                  <div className="text-xs font-mono font-bold flex items-center justify-between text-slate-400">
                    <span>AGENT RECOVERY RATE</span>
                    <span className="text-emerald-400">100% Secured</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">₹2.79 L Blocked</div>
                  <p className="mt-1 text-xs text-slate-400">100% of detected suspicious transactions halted prior to ledger settlement.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Fin-Sentinel Dynamic Analytics Engine • SOC-2 Audited</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold transition-all"
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
