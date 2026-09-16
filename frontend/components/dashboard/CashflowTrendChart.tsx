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
  ReferenceLine
} from 'recharts';
import { CASHFLOW_TREND_DATA } from '@/lib/mock-data';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function CashflowTrendChart() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-72 flex items-center justify-center rounded-2xl border ${isMorning ? 'border-[#eadbce] bg-white/80' : 'border-white/15 bg-white/[0.04] backdrop-blur-xl'}`}>
        <span className={`text-sm font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>Loading telemetry stream...</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 ${
        isMorning
          ? 'bg-white/80 backdrop-blur-xl border border-[#eadbce] shadow-xs text-[#1c1917]'
          : 'bg-white/[0.04] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/[0.08] hover:border-white/25 text-white'
      }`}
    >
      {/* Chart Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b ${isMorning ? 'border-[#eadbce]' : 'border-white/10'}`}>
        <div>
          <div className="flex items-center gap-3">
            <h3 className={`text-base font-bold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              Cash Outflow & Anomaly Envelope
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
                isMorning
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-slate-800/90 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-rose-600' : 'bg-rose-500'}`} />
              +18.4% Variance Detected
            </span>
          </div>
          <p className={`text-sm mt-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            FY 2026-27 YTD Remittance volume vs. predictive bounds across AP pipelines
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-md ${isMorning ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
            <span className={isMorning ? 'text-[#57534e]' : 'text-slate-300'}>Revenue (Cr)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-md ${isMorning ? 'bg-[#c51636]' : 'bg-indigo-400'}`} />
            <span className={isMorning ? 'text-[#57534e]' : 'text-slate-300'}>Expenses (Cr)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CASHFLOW_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isMorning ? '#059669' : '#10b981'} stopOpacity={isMorning ? 0.15 : 0.14} />
                <stop offset="95%" stopColor={isMorning ? '#059669' : '#10b981'} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isMorning ? '#c51636' : '#6366f1'} stopOpacity={isMorning ? 0.15 : 0.14} />
                <stop offset="95%" stopColor={isMorning ? '#c51636' : '#6366f1'} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.06)'} vertical={false} />
            <XAxis
              dataKey="month"
              stroke={isMorning ? '#78716c' : '#64748b'}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              stroke={isMorning ? '#78716c' : '#64748b'}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.1)' }}
              tickFormatter={(v) => `₹${v}Cr`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isMorning ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                borderColor: isMorning ? '#eadbce' : 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                fontSize: '13px',
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
                fontSize: 11,
                position: 'top',
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={isMorning ? '#059669' : '#10b981'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={isMorning ? '#c51636' : '#6366f1'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={`mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
        <div className={`flex items-center gap-2 ${isMorning ? 'text-[#1c1917]' : 'text-slate-300'}`}>
          <AlertTriangle className={`h-4 w-4 shrink-0 ${isMorning ? 'text-[#c51636]' : 'text-amber-400'}`} />
          <span>Outflow increased ₹20.4L above baseline due to duplicate ERP batch generation</span>
        </div>
        <span className={`font-medium flex items-center gap-1.5 ${isMorning ? 'text-stone-600' : 'text-slate-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-stone-500' : 'bg-emerald-500'}`} />
          Surveillance Stream Active: 142 tx/min
        </span>
      </div>
    </div>
  );
}
