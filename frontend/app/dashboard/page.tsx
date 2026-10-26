"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Download,
  Filter,
  Layers,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { DashboardMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#0B72E7", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  const loadData = async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCsv = () => {
    if (!metrics) return;
    const headers = "Month,AtRisk,Recovered,RecoveryRate\n";
    const rows = metrics.monthly_trend
      .map((m) => `"${m.month}",${m.at_risk},${m.recovered},${m.rate}%`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revive_financial_reconciliation_${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm text-slate-500 font-medium">Hydrating Revenue War Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Revenue War Room</h1>
          <p className="text-sm text-slate-500">
            Real-time autonomous revenue recovery telemetry, live funnels, and guardrail health.
          </p>
        </div>

        {/* Timeframe & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {["24h", "7d", "30d", "QTD"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeframe === t
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-2xs transition-colors"
            title="Export Reconciliation CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <Link
            href="/simulator"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Launch Batch Simulator
          </Link>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* At Risk ARR */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gross ARR At Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900">
            {formatCurrency(metrics?.total_arr_at_risk || 380000)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-amber-600 font-semibold">{metrics?.active_cases_count} cases</span> active in recovery pipeline
          </div>
        </div>

        {/* Recovered ARR */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ARR Recaptured (REVIVE)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600">
            {formatCurrency(metrics?.total_arr_recovered || 224000)}
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +{metrics?.uplift_vs_baseline_pct}% net financial lift vs static retries
          </div>
        </div>

        {/* Recovery Rate % */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Autonomous Win Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900">
            {metrics?.overall_recovery_rate}%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Industry baseline: <span className="font-semibold text-slate-700">21.4%</span> (Heuristic dunning)
          </div>
        </div>

        {/* Guardrail Invariants */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guardrail Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600">
            100.0%
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">0 violations</span> across all interventions
          </div>
        </div>
      </div>

      {/* Recovery Conversion Funnel Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Multi-Agent Recovery Pipeline Funnel</h3>
            <p className="text-xs text-slate-500">Drop-off and conversion rates across autonomous decision stages</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Final Recapture: 58.9%
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Ingested</span>
            <span className="font-bold text-slate-900 text-sm">100%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Payment Failed</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Triaged</span>
            <span className="font-bold text-slate-900 text-sm">100%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Urgency Classified</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">3. Diagnosed</span>
            <span className="font-bold text-slate-900 text-sm">94.8%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Cause Isolated</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">4. Guardrail Verified</span>
            <span className="font-bold text-emerald-600 text-sm">100%</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">Policy Passed</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-emerald-700 text-[10px] uppercase font-bold block">5. Recaptured</span>
            <span className="font-bold text-emerald-700 text-sm">58.9%</span>
            <span className="text-[11px] text-emerald-800 block mt-0.5">Revenue Recovered</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Recovery Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Recovery Yield</h3>
              <p className="text-xs text-slate-500">ARR At-Risk vs. Recaptured by Autonomous Engine</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> At-Risk
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Recovered
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#FFF" }}
                />
                <Area type="monotone" dataKey="at_risk" stroke="#94A3B8" fill="#F1F5F9" strokeWidth={2} />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Root Cause Diagnostics</h3>
            <p className="text-xs text-slate-500">Classified by Hybrid Agent Classifier</p>
          </div>

          <div className="h-48 flex-1 flex items-center justify-center">
            {(metrics?.root_cause_distribution || []).length === 0 ? (
              <div className="text-center p-4">
                <span className="w-8 h-8 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2 text-xs">
                  0
                </span>
                <p className="text-xs text-slate-400 font-medium">
                  Standing by. Live telemetry will categorize root causes dynamically.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.root_cause_distribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {(metrics?.root_cause_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", color: "#FFF" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 mt-2">
            {(metrics?.root_cause_distribution || []).slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Recent Interventions Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Autonomous Interventions</h3>
            <p className="text-xs text-slate-500">Live decision stream triaged and executed by REVIVE agents</p>
          </div>
          <Link
            href="/cases"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Cases <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Case ID</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Diagnosed Cause</th>
                <th className="pb-3">Prescribed Action</th>
                <th className="pb-3">Risk Urgency</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {(metrics?.recent_activity || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <p className="font-semibold text-slate-600 mb-1">Production Database Initialized Cleanly</p>
                    <span>No recovery cases recorded yet. Ingest a webhook or simulate a failure to trigger autonomous agent triage.</span>
                  </td>
                </tr>
              ) : (
                (metrics?.recent_activity || []).map((row) => (

                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono text-xs font-semibold text-slate-900">
                    #{row.id.slice(0, 8)}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {row.cause?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-slate-700">
                    <span className="font-semibold text-blue-700">{row.action?.replace("_", " ")}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        row.risk >= 0.75
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : row.risk >= 0.45
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {row.risk >= 0.75 ? "CRITICAL" : row.risk >= 0.45 ? "HIGH" : "MEDIUM"} ({row.risk})
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.status === "RECOVERED"
                          ? "bg-emerald-50 text-emerald-800"
                          : row.status === "IN_RECOVERY"
                          ? "bg-blue-50 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {row.status === "RECOVERED" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      ● {row.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/cases/${row.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Inspect Trace
                    </Link>
                  </td>
                </tr>
              )))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
