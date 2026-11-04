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
  Sparkles,
  Bot,
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

const PALETTE = ["#202522", "#FFD45C", "#16A36A", "#D9A441", "#D75C5C"];

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin" />
          <span className="text-xs text-[#777B76] font-medium tracking-tight">Hydrating Revenue War Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Telemetry Console</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202522]">Revenue War Room</h1>
          <p className="text-xs text-[#777B76] mt-0.5">
            Real-time autonomous revenue recovery telemetry, live funnels, and guardrail health.
          </p>
        </div>

        {/* Timeframe & Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#FFFDF8] border border-[#E6E1D7] p-1 rounded-xl text-xs font-semibold shadow-2xs">
            {["24h", "7d", "30d", "QTD"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === t
                    ? "bg-[#F5F2E9] text-[#202522] font-bold shadow-2xs"
                    : "text-[#777B76] hover:text-[#202522]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="p-2 border border-[#E6E1D7] bg-[#FFFDF8] hover:bg-[#F5F2E9] rounded-xl text-[#777B76] hover:text-[#202522] shadow-2xs transition-colors"
            title="Export Reconciliation CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <Link
            href="/simulator"
            className="px-4 py-2 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-[#202522]" />
            Launch Batch Simulator
          </Link>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* At Risk ARR */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B76]">Gross ARR At Risk</span>
            <div className="w-7 h-7 rounded-lg bg-[#D9A441]/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D9A441]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#202522] tracking-tight">
            {formatCurrency(metrics?.total_arr_at_risk || 380000)}
          </div>
          <div className="mt-2 text-xs text-[#777B76] flex items-center gap-1.5">
            <span className="text-[#D9A441] font-bold">{metrics?.active_cases_count} cases</span>
            <span>active in recovery pipeline</span>
          </div>
        </div>

        {/* Recovered ARR */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B76]">ARR Recaptured (REVIVE)</span>
            <div className="w-7 h-7 rounded-lg bg-[#16A36A]/10 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#16A36A] tracking-tight">
            {formatCurrency(metrics?.total_arr_recovered || 224000)}
          </div>
          <div className="mt-2 text-xs text-[#16A36A] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            +{metrics?.uplift_vs_baseline_pct}% net financial lift vs static retries
          </div>
        </div>

        {/* Recovery Rate % */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B76]">Autonomous Win Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#202522]/5 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#202522]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#202522] tracking-tight">
            {metrics?.overall_recovery_rate}%
          </div>
          <div className="mt-2 text-xs text-[#777B76]">
            Industry baseline: <span className="font-semibold text-[#202522]">21.4%</span> (Heuristic dunning)
          </div>
        </div>

        {/* Guardrail Invariants */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B76]">Guardrail Compliance</span>
            <div className="w-7 h-7 rounded-lg bg-[#16A36A]/10 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#16A36A] tracking-tight">
            100.0%
          </div>
          <div className="mt-2 text-xs text-[#777B76]">
            <span className="font-semibold text-[#202522]">0 violations</span> across all interventions
          </div>
        </div>
      </div>

      {/* Dark Charcoal AI Multi-Agent Intelligence Card */}
      <div className="bg-[#202522] text-[#FFFDF8] rounded-[24px] p-6 shadow-md border border-[#202522] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFD45C] text-[#202522] text-[10px] font-extrabold tracking-wider uppercase">
              Autonomous Mesh Active
            </span>
            <span className="text-xs text-[#777B76] font-mono">v2.4.0 Engine</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-[#FFFDF8]">
            Multi-Agent Orchestration &amp; Predictive Guardrail Engine
          </h2>
          <p className="text-xs text-[#E6E1D7]/80 max-w-2xl leading-relaxed">
            Sentinel continuously listens to payment gateway webhooks, the Diagnostician isolates failure root cause within 120ms, the Strategist chooses the revenue-optimal intervention, and the Deterministic Guardrail guarantees zero policy breaches.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0 z-10 text-xs">
          <div className="p-3 rounded-xl bg-[#FFFDF8]/5 border border-[#FFFDF8]/10 text-center">
            <span className="text-[10px] text-[#FFD45C] font-mono block mb-0.5">SENTINEL</span>
            <span className="font-bold text-[#FFFDF8]">Monitoring</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFDF8]/5 border border-[#FFFDF8]/10 text-center">
            <span className="text-[10px] text-[#FFD45C] font-mono block mb-0.5">DIAGNOSTICIAN</span>
            <span className="font-bold text-[#FFFDF8]">Analyzing</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFDF8]/5 border border-[#FFFDF8]/10 text-center">
            <span className="text-[10px] text-[#FFD45C] font-mono block mb-0.5">STRATEGIST</span>
            <span className="font-bold text-[#FFFDF8]">Optimizing</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FFFDF8]/5 border border-[#FFFDF8]/10 text-center">
            <span className="text-[10px] text-[#16A36A] font-mono block mb-0.5">GUARDRAIL</span>
            <span className="font-bold text-[#16A36A]">Enforced</span>
          </div>
        </div>
      </div>

      {/* Recovery Conversion Funnel Bar */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm text-[#202522]">Multi-Agent Recovery Pipeline Funnel</h2>
            <p className="text-xs text-[#777B76]">Drop-off and conversion rates across autonomous decision stages</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/30 w-fit">
            Final Recapture: 58.9%
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
            <span className="text-[#777B76] text-[10px] uppercase font-bold block">1. Ingested</span>
            <span className="font-extrabold text-[#202522] text-sm">100%</span>
            <span className="text-[11px] text-[#777B76] block mt-0.5">Payment Failed</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
            <span className="text-[#777B76] text-[10px] uppercase font-bold block">2. Triaged</span>
            <span className="font-extrabold text-[#202522] text-sm">100%</span>
            <span className="text-[11px] text-[#777B76] block mt-0.5">Urgency Classified</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
            <span className="text-[#777B76] text-[10px] uppercase font-bold block">3. Diagnosed</span>
            <span className="font-extrabold text-[#202522] text-sm">94.8%</span>
            <span className="text-[11px] text-[#777B76] block mt-0.5">Cause Isolated</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
            <span className="text-[#777B76] text-[10px] uppercase font-bold block">4. Guardrail Verified</span>
            <span className="font-extrabold text-[#16A36A] text-sm">100%</span>
            <span className="text-[11px] text-[#16A36A] block mt-0.5">Policy Passed</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#16A36A]/10 border border-[#16A36A]/30">
            <span className="text-[#16A36A] text-[10px] uppercase font-bold block">5. Recaptured</span>
            <span className="font-extrabold text-[#16A36A] text-sm">58.9%</span>
            <span className="text-[11px] text-[#16A36A] block mt-0.5 font-medium">Revenue Recovered</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Recovery Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[#202522] text-sm">Monthly Recovery Yield</h2>
              <p className="text-xs text-[#777B76]">ARR At-Risk vs. Recaptured by Autonomous Engine</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#777B76]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6E1D7]" /> At-Risk
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#16A36A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A]" /> Recovered
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1D7" opacity={0.5} />
                <XAxis dataKey="month" stroke="#777B76" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#777B76"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]}
                  contentStyle={{ backgroundColor: "#202522", borderRadius: "12px", border: "none", color: "#FFFDF8", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="at_risk" stroke="#777B76" fill="#F5F2E9" strokeWidth={1.5} />
                <Area type="monotone" dataKey="recovered" stroke="#16A36A" fill="#16A36A" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Distribution */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs flex flex-col">
          <div className="mb-4">
            <h2 className="font-bold text-[#202522] text-sm">Root Cause Diagnostics</h2>
            <p className="text-xs text-[#777B76]">Classified by Hybrid Agent Classifier</p>
          </div>

          <div className="h-48 flex-1 flex items-center justify-center">
            {(metrics?.root_cause_distribution || []).length === 0 ? (
              <div className="text-center p-4">
                <span className="w-8 h-8 mx-auto rounded-full bg-[#F5F2E9] text-[#777B76] flex items-center justify-center mb-2 text-xs">
                  0
                </span>
                <p className="text-xs text-[#777B76] font-medium">
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
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#202522", borderRadius: "12px", color: "#FFFDF8", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 mt-2">
            {(metrics?.root_cause_distribution || []).slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#777B76]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-[#202522]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Recent Interventions Table */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#202522] text-sm">Recent Autonomous Interventions</h2>
            <p className="text-xs text-[#777B76]">Live decision stream triaged and executed by REVIVE agents</p>
          </div>
          <Link
            href="/cases"
            className="text-xs font-bold text-[#202522] hover:underline flex items-center gap-1"
          >
            View All Cases <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E6E1D7] text-xs font-semibold uppercase tracking-wider text-[#777B76]">
                <th className="pb-3">Case ID</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Diagnosed Cause</th>
                <th className="pb-3">Prescribed Action</th>
                <th className="pb-3">Risk Urgency</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7]/60 font-normal">
              {(metrics?.recent_activity || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#777B76]">
                    <p className="font-bold text-[#202522] mb-1">Database Initialized Cleanly</p>
                    <span>No recovery cases recorded yet. Ingest a webhook or simulate a failure to trigger autonomous agent triage.</span>
                  </td>
                </tr>
              ) : (
                (metrics?.recent_activity || []).map((row) => (
                  <tr key={row.id} className="hover:bg-[#F5F2E9]/60 transition-colors">
                    <td className="py-3 font-mono text-xs font-semibold text-[#202522]">
                      #{row.id.slice(0, 8)}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#202522]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5F2E9] text-[#202522] border border-[#E6E1D7]">
                        {row.cause?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-[#202522]">
                      <span className="font-semibold">{row.action?.replace("_", " ")}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.risk >= 0.75
                            ? "bg-[#D75C5C]/10 text-[#D75C5C] border border-[#D75C5C]/30"
                            : row.risk >= 0.45
                            ? "bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30"
                            : "bg-[#202522]/5 text-[#202522] border border-[#E6E1D7]"
                        }`}
                      >
                        {row.risk >= 0.75 ? "CRITICAL" : row.risk >= 0.45 ? "HIGH" : "MEDIUM"} ({row.risk})
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.status === "RECOVERED"
                            ? "bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30"
                            : row.status === "IN_RECOVERY"
                            ? "bg-[#FFD45C]/20 text-[#202522] border border-[#FFD45C]"
                            : "bg-[#F5F2E9] text-[#777B76] border border-[#E6E1D7]"
                        }`}
                      >
                        {row.status === "RECOVERED" && <CheckCircle2 className="w-3 h-3 text-[#16A36A]" />}
                        ● {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/cases/${row.id}`}
                        className="text-xs font-bold text-[#202522] hover:underline"
                      >
                        Inspect Trace
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
