'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CashflowTrendChart } from '@/components/dashboard/CashflowTrendChart';
import { ExceptionsTable } from '@/components/dashboard/ExceptionsTable';
import { fetchExceptions } from '@/lib/api-client';
import { FinancialException } from '@/lib/types';
import { INITIAL_EXCEPTIONS } from '@/lib/mock-data';
import { 
  ArrowUpRight, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function DashboardPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { theme } = useTheme();
  const isMorning = theme === 'morning';

  const loadData = async () => {
    try {
      const data = await fetchExceptions();
      if (data?.exceptions?.length) {
        setExceptions(data.exceptions);
      }
    } catch (e) {
      console.error('Error fetching exceptions', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
    }, 400);
  };

  const activeExceptionsCount = exceptions.filter(
    (e) => !e.status.startsWith('RESOLVED_')
  ).length;

  const totalAtRisk = exceptions
    .filter((e) => !e.status.startsWith('RESOLVED_'))
    .reduce((sum, e) => sum + e.amount_at_risk, 0);

  return (
    <AppLayout>
      {/* Top Header & Surveillance Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              Executive Control Tower
            </h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                isMorning
                  ? 'bg-stone-100 text-stone-700 border border-stone-200'
                  : 'bg-slate-800/80 text-slate-300 border border-white/10'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-stone-500' : 'bg-emerald-500'}`} />
              Surveillance Mesh Active
            </span>
          </div>
          <p className={`text-sm mt-1 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            Real-time multi-agent reconciliation monitoring Acme Manufacturing Pvt. Ltd. treasury and AP pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all active:scale-95 disabled:opacity-50 ${
              isMorning
                ? 'bg-white hover:bg-[#f6efe6] border border-[#eadbce] text-[#1c1917] shadow-xs'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isMorning ? 'text-[#78716c]' : 'text-slate-400'} ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Screen 1: Metric Cards (4 Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Cash Position */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${
            isMorning
              ? 'bg-white border-[#eadbce] shadow-xs hover:border-[#dfcebe]'
              : 'bg-slate-900/60 border-white/10 shadow-sm hover:border-white/20'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            <span>TOTAL CASH POSITION</span>
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                isMorning
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-800/90 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +4.2%
            </span>
          </div>
          <div className={`mt-3 text-3xl font-extrabold font-mono tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
            ₹42.8 L
          </div>
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
            <span>Liquid Reserves</span>
            <span className={`font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-200'}`}>HDFC + ICICI Pools</span>
          </div>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${
            isMorning
              ? 'bg-white border-[#eadbce] shadow-xs hover:border-[#dfcebe]'
              : 'bg-slate-900/60 border-white/10 shadow-sm hover:border-white/20'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            <span>MONTHLY REVENUE</span>
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                isMorning
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-800/90 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +12.4%
            </span>
          </div>
          <div className={`mt-3 text-3xl font-extrabold font-mono tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
            ₹1.82 Cr
          </div>
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
            <span>Target: ₹1.62 Cr</span>
            <span className={`font-mono font-medium ${isMorning ? 'text-emerald-700' : 'text-emerald-400'}`}>112% Target</span>
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${
            isMorning
              ? 'bg-white border-[#eadbce] shadow-xs hover:border-[#dfcebe]'
              : 'bg-slate-900/60 border-white/10 shadow-sm hover:border-white/20'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            <span>MONTHLY EXPENSES</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isMorning
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-800/90 text-amber-400 border border-amber-500/20'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              +18.4%
            </span>
          </div>
          <div className={`mt-3 text-3xl font-extrabold font-mono tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
            ₹1.31 Cr
          </div>
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
            <span className={isMorning ? 'text-amber-800 font-medium' : 'text-amber-400 font-medium'}>Budget Inflection</span>
            <span className={`font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-200'}`}>+₹20.4 L delta</span>
          </div>
        </div>

        {/* Card 4: Active Exceptions Flagged */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all group ${
            isMorning
              ? 'bg-white border-[#eadbce] shadow-xs hover:border-[#dfcebe]'
              : 'bg-slate-900/60 border-white/10 shadow-sm hover:border-white/20'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-mono ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
            <span>ACTIVE EXCEPTIONS</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isMorning
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-slate-800/90 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-rose-600' : 'bg-rose-500'}`} />
              3 Critical
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              {activeExceptionsCount} Pending
            </span>
            <span className={`text-xs font-mono font-medium ${isMorning ? 'text-[#78716c]' : 'text-slate-400'}`}>
              ₹{(totalAtRisk / 1000).toFixed(1)}k At Risk
            </span>
          </div>
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${isMorning ? 'border-[#eadbce] text-[#78716c]' : 'border-white/10 text-slate-400'}`}>
            <span className={isMorning ? 'text-rose-800 font-medium' : 'text-rose-400 font-medium'}>Tiered Gates Armed</span>
            <span className={`font-mono ${isMorning ? 'text-[#1c1917]' : 'text-slate-200'}`}>SOX Escalation</span>
          </div>
        </div>

      </div>

      {/* Cashflow Trend Telemetry Chart */}
      <CashflowTrendChart />

      {/* Critical Exceptions Table */}
      <ExceptionsTable exceptions={exceptions} onRefresh={loadData} />
    </AppLayout>
  );
}
