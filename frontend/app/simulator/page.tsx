"use client";

import { useState } from "react";
import {
  PlayCircle,
  Zap,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Download,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { SimulationResult } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function SimulatorPage() {
  const [numCases, setNumCases] = useState(1000);
  const [distribution, setDistribution] = useState("BALANCED");
  const [useLLM, setUseLLM] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setProgress(15);
    setLogs(["[00:01] Initializing simulation stream for " + numCases.toLocaleString() + " cases..."]);

    const timer1 = setTimeout(() => {
      setProgress(45);
      setLogs((prev) => [
        ...prev,
        "[00:02] Sentinel triaged transaction urgency & hydrated customer profiles...",
        "[00:02] Diagnostician evaluating failure error codes & bank telemetry...",
      ]);
    }, 300);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setLogs((prev) => [
        ...prev,
        "[00:03] Strategist calculating Expected Values across Smart Retries & Payment Links...",
        "[00:03] Deterministic Guardrail Engine validating merchant policy rules...",
      ]);
    }, 600);

    try {
      const data = await api.runSimulator(numCases, distribution, useLLM);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgress(100);
      setLogs((prev) => [
        ...prev,
        `[00:04] Intercepted ${data.guardrail_violations_prevented} illegal actions via Guardrail Gate.`,
        `[00:04] Batch complete: +${data.net_uplift_pct}% financial uplift achieved!`,
      ]);
      setResult(data);
    } catch (e) {
      console.error(e);
      setLogs((prev) => [...prev, "[ERROR] Batch simulation interrupted."]);
    } finally {
      setRunning(false);
    }
  };

  const exportSimulationData = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revive_simulation_${numCases}_cases.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-blue-600" />
            Autonomous Batch Simulator
          </h1>
          <p className="text-sm text-slate-500">
            Stress-test REVIVE against 100 to 5,000 synthetic Razorpay failure scenarios at 90,000+ cases/sec.
          </p>
        </div>

        {result && (
          <button
            onClick={exportSimulationData}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Results (JSON)
          </button>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Configure Synthetic Stream
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Case Volume Slider */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Batch Volume: <span className="font-mono font-bold text-blue-600">{numCases.toLocaleString()} transactions</span>
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={numCases}
              onChange={(e) => setNumCases(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>100</span>
              <span>2,500</span>
              <span>5,000</span>
            </div>
          </div>

          {/* Failure Scenario */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Scenario Distribution</label>
            <select
              value={distribution}
              onChange={(e) => setDistribution(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="BALANCED">Balanced Real-World Indian eCommerce</option>
              <option value="HIGH_INSUFFICIENT_FUNDS">Salary Cycle Dip (High Insufficient Funds)</option>
              <option value="HIGH_GATEWAY_OUTAGE">Major Bank Flap (High Network Timeouts)</option>
              <option value="HARD_DECLINES">Risk &amp; Security Spike (Hard Declines)</option>
            </select>
          </div>

          {/* Inference Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Inference Speed</label>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setUseLLM(!useLLM)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  useLLM ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    useLLM ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700">
                {useLLM ? "Cognitive Mode (Ollama)" : "Fast Deterministic (>90k cases/s)"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar when running */}
        {running && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Executing Autonomous State Graph...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Simulates dynamic recovery, SMS/WhatsApp delivery costs, and deterministic policy enforcement.
          </span>
          <button
            disabled={running}
            onClick={handleRun}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Batch Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Telemetry Stream */}
      {logs.length > 0 && (
        <div className="bg-slate-950 text-slate-300 rounded-xl p-4 font-mono text-xs shadow-md border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-800 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>REAL-TIME SIMULATION TELEMETRY CONSOLE</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="text-emerald-400">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Comparison KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Gross Processed</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {formatCurrency(result.total_revenue_processed)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {result.simulated_cases.toLocaleString()} cases in {result.execution_time_ms}ms
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Control (24h Blind Retry)</span>
              <div className="text-2xl font-bold font-mono text-slate-500 mt-1">
                {result.baseline_recovery_rate}%
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Recaptured: {formatCurrency(result.baseline_recovered_revenue)}
              </span>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs bg-blue-50/30">
              <span className="text-xs font-semibold text-blue-700">REVIVE Multi-Agent System</span>
              <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                {result.revive_recovery_rate}%
              </div>
              <span className="text-xs text-blue-800 font-semibold mt-1 block">
                Recaptured: {formatCurrency(result.revive_recovered_revenue)}
              </span>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs bg-emerald-50/30">
              <span className="text-xs font-semibold text-emerald-700">Net Dollar Lift</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" />
                +{result.net_uplift_pct}%
              </div>
              <span className="text-xs text-emerald-800 font-bold mt-1 block">
                +{formatCurrency(result.net_recovered_dollar_lift)} net lift
              </span>
            </div>
          </div>

          {/* Guardrail Invariant Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Deterministic Policy Invariants</h4>
                <p className="text-xs text-slate-500">
                  Vetoed <span className="font-bold text-slate-900">{result.guardrail_violations_prevented} illegal actions</span> (e.g. excessive discount attempts).
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              100% Policy Compliance
            </span>
          </div>

          {/* Granular Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4">
              Recovery Performance by Diagnosed Root Cause
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Root Cause</th>
                    <th className="pb-3">Sample Volume</th>
                    <th className="pb-3">Baseline Win Rate</th>
                    <th className="pb-3">REVIVE Win Rate</th>
                    <th className="pb-3 text-right">Net Uplift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(result.breakdown_by_cause).map(([cause, stats]) => {
                    const bRate = stats.total_count > 0 ? (stats.baseline_recovered / stats.total_count) * 100 : 0;
                    const rRate = stats.total_count > 0 ? (stats.revive_recovered / stats.total_count) * 100 : 0;
                    const diff = rRate - bRate;
                    return (
                      <tr key={cause} className="hover:bg-slate-50/80">
                        <td className="py-3 font-semibold text-slate-900">{cause.replace("_", " ")}</td>
                        <td className="py-3 font-mono text-slate-600">{stats.total_count.toLocaleString()}</td>
                        <td className="py-3 font-mono text-slate-400">{bRate.toFixed(1)}%</td>
                        <td className="py-3 font-mono font-bold text-blue-600">{rRate.toFixed(1)}%</td>
                        <td className="py-3 font-mono font-bold text-emerald-600 text-right">
                          +{diff.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
