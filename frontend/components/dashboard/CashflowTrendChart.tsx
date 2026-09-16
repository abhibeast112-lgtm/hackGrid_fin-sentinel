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
import { TrendingUp, AlertTriangle } from 'lucide-react';

export function CashflowTrendChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800">
        <span className="text-xs font-mono text-slate-500 animate-pulse">Initializing Telemetry Stream...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-[family-name:var(--font-display)] tracking-wide">
              Cashflow Outflow & Anomaly Detection Envelope
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              +18.4% Outlier Alert
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            FY 2026-27 YTD Remittance Volume vs. Predictive Baseline with 3-Sigma Anomaly Bounds
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300">Revenue (Cr)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#C50337]" />
            <span className="text-slate-300">Expenses (Cr)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            <span className="text-amber-300">Flagged Risk (₹ L)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CASHFLOW_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              {/* Gradient from #021C4F to #C50337 for expenses */}
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C50337" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#021C4F" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `₹${v}Cr`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1222',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                color: '#f8fafc',
                fontFamily: 'monospace',
              }}
              formatter={(value: any, name: any) => [
                name === 'anomalies' ? `₹${value} L` : `₹${value} Cr`,
                name === 'revenue' ? 'Monthly Revenue' : name === 'expenses' ? 'Monthly Expenses' : 'Anomalies Flagged'
              ]}
            />
            <ReferenceLine
              x="Sep (MTD)"
              stroke="#C50337"
              strokeDasharray="4 4"
              label={{
                value: 'SPIKE DETECTED',
                fill: '#f43f5e',
                fontSize: 10,
                position: 'top',
                fontFamily: 'monospace'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#C50337"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>Noticeable September inflection: AP disbursements increased 18.4% with 3 pending multi-agent hold exceptions.</span>
        </div>
        <span className="text-slate-300 font-semibold">Continuous Ingestion Rate: 142 tx/min</span>
      </div>
    </div>
  );
}
