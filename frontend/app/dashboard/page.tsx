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
  ArrowDownRight,
  AlertTriangle, 
  RefreshCw,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [exceptions, setExceptions] = useState<FinancialException[]>(INITIAL_EXCEPTIONS);
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
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#233c46]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[#F5EED2]">
              Financial Control Tower
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-mono bg-[#589C80]/10 text-[#589C80] border border-[#589C80]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#589C80]" />
              Surveillance Active
            </span>
          </div>
          <p className="text-xs text-[#8aa1aa] mt-1">
            Real-time exception interception and ledger reconciliation for Acme Manufacturing Pvt. Ltd.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#172a31] hover:bg-[#1f3741] border border-[#233c46] text-xs font-mono text-[#F5EED2] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 text-[#8aa1aa] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Screen 1: Top Metric Cards (4 Grid Layout) - Flat, Clean, Stripe/Linear style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cash Position */}
        <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#8aa1aa] text-xs font-mono">
            <span>TOTAL CASH POSITION</span>
            <span className="inline-flex items-center text-[#589C80] text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +4.2%
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tracking-tight text-[#F5EED2]">
            ₹42.8 L
          </div>
          <div className="text-[11px] text-[#8aa1aa] pt-1 border-t border-[#233c46] flex justify-between">
            <span>Liquid Reserves</span>
            <span className="font-mono text-[#F5EED2]">HDFC + ICICI</span>
          </div>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#8aa1aa] text-xs font-mono">
            <span>MONTHLY REVENUE</span>
            <span className="inline-flex items-center text-[#589C80] text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              +12.4%
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tracking-tight text-[#F5EED2]">
            ₹1.82 Cr
          </div>
          <div className="text-[11px] text-[#8aa1aa] pt-1 border-t border-[#233c46] flex justify-between">
            <span>Target: ₹1.62 Cr</span>
            <span className="font-mono text-[#589C80]">On Target</span>
          </div>
        </div>

        {/* Card 3: Monthly Expenses (Amber warning badge) */}
        <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#8aa1aa] text-xs font-mono">
            <span>MONTHLY EXPENSES</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#EBAE29]/10 text-[#EBAE29] border border-[#EBAE29]/20 text-[11px] font-medium">
              <AlertTriangle className="h-3 w-3" />
              +18.4%
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tracking-tight text-[#F5EED2]">
            ₹1.31 Cr
          </div>
          <div className="text-[11px] text-[#8aa1aa] pt-1 border-t border-[#233c46] flex justify-between">
            <span className="text-[#EBAE29]">Budget Alert</span>
            <span className="font-mono text-[#F5EED2]">+₹20.4 L</span>
          </div>
        </div>

        {/* Card 4: Active Exceptions Flagged (Red pulse / flat badge) */}
        <div className="rounded-md border border-[#233c46] bg-[#172a31] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#8aa1aa] text-xs font-mono">
            <span>ACTIVE EXCEPTIONS</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              3 Critical
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tracking-tight text-red-400">
            {activeExceptionsCount} Pending
          </div>
          <div className="text-[11px] text-[#8aa1aa] pt-1 border-t border-[#233c46] flex justify-between">
            <span>Exposure</span>
            <span className="font-mono text-[#F5EED2]">₹{(totalAtRisk / 1000).toFixed(1)}k at risk</span>
          </div>
        </div>
      </div>

      {/* Cashflow Trend Chart */}
      <CashflowTrendChart />

      {/* Critical Exceptions Table */}
      <ExceptionsTable exceptions={exceptions} onRefresh={loadData} />
    </AppLayout>
  );
}
