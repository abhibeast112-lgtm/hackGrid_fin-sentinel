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

export function CashflowTrendChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#172a31] rounded-md border border-[#233c46]">
        <span className="text-xs font-mono text-[#8aa1aa]">Loading telemetry...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#233c46] bg-[#172a31] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#233c46]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F5EED2]">
              Cash Outflow & Anomaly Envelope
            </h3>
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
              +18.4% Variance
            </span>
          </div>
          <p className="text-xs text-[#8aa1aa] mt-1">
            FY 2026-27 YTD Remittance volume compared to predictive baseline
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#589C80]" />
            <span className="text-[#8aa1aa]">Revenue (Cr)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#EBAE29]" />
            <span className="text-[#8aa1aa]">Expenses (Cr)</span>
          </div>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CASHFLOW_TREND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EBAE29" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EBAE29" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#589C80" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#589C80" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#233c46" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#6c858f"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#233c46' }}
            />
            <YAxis
              stroke="#6c858f"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#233c46' }}
              tickFormatter={(v) => `₹${v}Cr`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0e181c',
                borderColor: '#233c46',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#F5EED2',
                fontFamily: 'monospace',
              }}
              formatter={(value: any, name: any) => [
                name === 'anomalies' ? `₹${value} L` : `₹${value} Cr`,
                name === 'revenue' ? 'Revenue' : 'Expenses'
              ]}
            />
            <ReferenceLine
              x="Sep (MTD)"
              stroke="#EBAE29"
              strokeDasharray="3 3"
              label={{
                value: 'OUTLIER DETECTED',
                fill: '#EBAE29',
                fontSize: 10,
                position: 'top',
                fontFamily: 'monospace'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#589C80"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#EBAE29"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#233c46] flex flex-wrap items-center justify-between text-xs font-mono text-[#8aa1aa]">
        <span>Outflow increased ₹20.4L over target due to duplicate invoice batching</span>
        <span className="text-[#F5EED2]">Continuous Feed: 142 tx/min</span>
      </div>
    </div>
  );
}
