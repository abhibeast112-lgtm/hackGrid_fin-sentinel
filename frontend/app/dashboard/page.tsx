'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CashflowTrendChart } from '@/components/dashboard/CashflowTrendChart';
import { ExceptionsTable } from '@/components/dashboard/ExceptionsTable';
import { fetchExceptions } from '@/lib/api-client';
import { FinancialException } from '@/lib/types';
import { INITIAL_EXCEPTIONS } from '@/lib/mock-data';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const data = await fetchExceptions();
      if (data?.exceptions?.length) {
        setExceptions(data.exceptions);
      }
    } catch (e) {
      console.error('Error fetching exceptions', e);
    } finally {
      setLoading(false);
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

  // Count active pending exceptions
  const activeExceptionsCount = exceptions.filter(
    (e) => !e.status.startsWith('RESOLVED_')
  ).length;

  const totalAtRisk = exceptions
    .filter((e) => !e.status.startsWith('RESOLVED_'))
    .reduce((sum, e) => sum + e.amount_at_risk, 0);

  return (
    <AppLayout>
      {/* Top Banner / Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-[family-name:var(--font-display)]">
              Executive Financial Control Tower
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Continuous Surveillance Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-agent reconciliation monitoring Acme Manufacturing Pvt. Ltd. treasury and AP pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Feed'}</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#021C4F] to-[#C50337] text-white text-xs font-mono font-semibold shadow-md flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-rose-300" />
            <span>AI Autonomous Mode</span>
          </div>
        </div>
      </div>

      {/* Screen 1: Top Metric Cards (4 Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cash Position */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg transition-all hover:border-slate-700 group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL CASH POSITION</span>
            <span className="flex items-center text-emerald-400 text-[11px] font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +4.2%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              ₹42.8 L
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Liquid Reserves</span>
            <span className="font-mono text-slate-300">HDFC + ICICI Pools</span>
          </div>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg transition-all hover:border-slate-700 group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>MONTHLY REVENUE</span>
            <span className="flex items-center text-emerald-400 text-[11px] font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +12.4%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              ₹1.82 Cr
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: ₹1.62 Cr</span>
            <span className="font-mono text-emerald-400">On Track</span>
          </div>
        </div>

        {/* Card 3: Monthly Expenses (Amber warning badge) */}
        <div className="relative overflow-hidden rounded-xl border border-amber-900/40 bg-slate-900/90 p-4 shadow-lg transition-all hover:border-amber-700/60 group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-amber-500/15 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>MONTHLY EXPENSES</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              +18.4%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-100">
              ₹1.31 Cr
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-amber-400/90 font-medium">Spike Warning</span>
            <span className="font-mono text-slate-300">+₹20.4 L over budget</span>
          </div>
        </div>

        {/* Card 4: Active Exceptions Flagged (Red pulse badge) */}
        <div className="relative overflow-hidden rounded-xl border border-[#C50337]/50 bg-gradient-to-br from-slate-900 via-slate-900 to-[#C50337]/10 p-4 shadow-lg shadow-[#C50337]/10 transition-all hover:border-[#C50337] group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-[#C50337]/25 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE EXCEPTIONS</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C50337]/30 border border-[#C50337]/60 text-rose-300 text-[11px] font-bold shadow-sm">
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C50337]" />
              </span>
              3 Critical
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
              {activeExceptionsCount} Pending
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              ₹{(totalAtRisk / 1000).toFixed(1)}k At Risk
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-rose-400">Immediate Action Required</span>
            <span className="font-mono text-slate-300">1 Duplicate · 1 Cap · 1 Spike</span>
          </div>
        </div>
      </div>

      {/* Cashflow Trend Telemetry Chart */}
      <CashflowTrendChart />

      {/* Critical Exceptions Table (Main Component) */}
      <ExceptionsTable exceptions={exceptions} onRefresh={loadData} />
    </AppLayout>
  );
}
