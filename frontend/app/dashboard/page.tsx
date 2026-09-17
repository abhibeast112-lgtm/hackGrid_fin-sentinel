'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CashflowTrendChart } from '@/components/dashboard/CashflowTrendChart';
import { ExceptionsTable } from '@/components/dashboard/ExceptionsTable';
import { MetricKpiCard } from '@/components/dashboard/MetricKpiCard';
import { fetchExceptions } from '@/lib/api-client';
import { FinancialException } from '@/lib/types';
import { INITIAL_EXCEPTIONS } from '@/lib/mock-data';
import { RefreshCw } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 transition-all duration-300 ease-in-out">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isMorning ? 'text-[#1c1917]' : 'text-white'}`}>
              Executive Control Tower
            </h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${
                isMorning
                  ? 'bg-stone-100 text-stone-700 border border-stone-200'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isMorning ? 'bg-stone-500' : 'bg-emerald-400'}`} />
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95 disabled:opacity-50 ${
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

      {/* Screen 1: Interactive Metric KPI Accordions (4 Grid Layout with Dynamic Layout Reflows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ease-in-out">
        {/* Card 1: Total Cash Position */}
        <MetricKpiCard
          id="kpi-cash"
          title="TOTAL CASH POSITION"
          value="₹42.8 L"
          badgeText="+4.2%"
          badgeType="emerald"
          footerLabel="Liquid Reserves"
          footerValue="HDFC + ICICI Pools"
          sparklineData={[38.2, 39.5, 40.1, 41.2, 41.8, 42.8]}
          sparklineColor="#10b981"
          deltaDescription="+₹1.8L vs Target"
          breakdownItems={[
            { label: 'HDFC Corporate Treasury', value: '₹28.5 L', highlightColor: 'emerald' },
            { label: 'ICICI Operations Escrow', value: '₹14.3 L' },
            { label: 'Coverage Runway Ratio', value: '48 Days' },
          ]}
        />

        {/* Card 2: Monthly Revenue */}
        <MetricKpiCard
          id="kpi-revenue"
          title="MONTHLY REVENUE"
          value="₹1.82 Cr"
          badgeText="+12.4%"
          badgeType="emerald"
          footerLabel="Target: ₹1.62 Cr"
          footerValue="112% Target"
          sparklineData={[1.45, 1.52, 1.64, 1.58, 1.71, 1.82]}
          sparklineColor="#10b981"
          deltaDescription="+₹20L Above Plan"
          breakdownItems={[
            { label: 'Domestic Supply Billing', value: '₹1.24 Cr', highlightColor: 'emerald' },
            { label: 'Direct Exports Wire', value: '₹0.58 Cr' },
            { label: 'Collection Realization', value: '96.2%' },
          ]}
        />

        {/* Card 3: Monthly Expenses */}
        <MetricKpiCard
          id="kpi-expenses"
          title="MONTHLY EXPENSES"
          value="₹1.31 Cr"
          badgeText="+18.4%"
          badgeType="amber"
          footerLabel="Budget Inflection"
          footerValue="+₹20.4 L delta"
          sparklineData={[1.05, 1.10, 1.18, 1.12, 1.20, 1.31]}
          sparklineColor="#f59e0b"
          deltaDescription="Breached Limit"
          breakdownItems={[
            { label: 'Vendor AP Invoices', value: '₹89.2 L', highlightColor: 'amber' },
            { label: 'Operational Freight', value: '₹41.8 L' },
            { label: 'Duplicate Surcharge Spike', value: '+₹20.4 L', highlightColor: 'rose' },
          ]}
        />

        {/* Card 4: Active Exceptions */}
        <MetricKpiCard
          id="kpi-exceptions"
          title="ACTIVE EXCEPTIONS"
          value={`${activeExceptionsCount} Pending`}
          badgeText="3 Critical"
          badgeType="rose"
          footerLabel="Tiered Gates Armed"
          footerValue={`₹${(totalAtRisk / 1000).toFixed(1)}k At Risk`}
          sparklineData={[5, 4, 6, 3, 4, 3]}
          sparklineColor="#f43f5e"
          deltaDescription="Quarantined"
          breakdownItems={[
            { label: 'EXC-101 Duplicate Pay', value: '₹84,500', highlightColor: 'rose' },
            { label: 'EXC-102 Rate Variance', value: '₹15,000', highlightColor: 'amber' },
            { label: 'EXC-103 Logistics Spike', value: '₹1,80,000', highlightColor: 'amber' },
          ]}
        />
      </div>

      {/* Cashflow Trend Telemetry Chart with Dynamic Spatial Resizing & Viewport */}
      <div className="transition-all duration-300 ease-in-out">
        <CashflowTrendChart />
      </div>

      {/* Critical Exceptions Table */}
      <div className="transition-all duration-300 ease-in-out">
        <ExceptionsTable exceptions={exceptions} onRefresh={loadData} />
      </div>
    </AppLayout>
  );
}
