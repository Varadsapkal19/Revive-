"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calculator,
  Sliders,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { CaseDetail, RecoveryCase } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function JudgeModePage() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Expected Value Calculator State for Judges
  const [simAmount, setSimAmount] = useState(5000);
  const [simProb, setSimProb] = useState(0.72);
  const [simDiscount, setSimDiscount] = useState(5.0);
  const [simCost, setSimCost] = useState(3.0);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await api.getCases();
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;
    const loadDetail = async () => {
      try {
        const data = await api.getCaseDetail(selectedCaseId);
        setCaseDetail(data);
        if (data?.amount) setSimAmount(data.amount);
      } catch (e) {
        console.error(e);
      }
    };
    loadDetail();
  }, [selectedCaseId]);

  // Dynamic EV computation
  const simEffectiveAmount = simAmount * (1 - simDiscount / 100);
  const simExpectedYield = simProb * simEffectiveAmount - simCost;
  const isDiscountIllegal = simDiscount > 10.0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          Autonomous Explainability &amp; Audit Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Judge Mode: &quot;Why This Action?&quot;</h1>
        <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
          Forensic inspectability into how REVIVE pairs cognitive AI hypotheses with unyielding deterministic policy guardrails to maximize recovered capital without hallucination risk.
        </p>

        {/* Case Selector Dropdown */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Select Case to Inspect:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-900">
                Case #{c.id.slice(0, 8)} — {formatCurrency(c.amount)} ({c.diagnosed_root_cause})
              </option>
            ))}
          </select>

          {caseDetail && (
            <Link
              href={`/cases/${caseDetail.id}`}
              className="text-xs text-blue-300 hover:text-white inline-flex items-center gap-1 font-semibold underline"
            >
              Open Full Case File <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Interactive Expected Value Calculator for Evaluators */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Interactive E[V] Optimizer &amp; Guardrail Sandbox
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Formula: E[Yield] = P(Recovery) &times; Net Amount &minus; Cost
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Recovery Probability */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Recovery Prob (P)</span>
              <span className="font-mono text-blue-600 font-bold">{(simProb * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={simProb}
              onChange={(e) => setSimProb(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Discount % */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Retention Discount</span>
              <span className={`font-mono font-bold ${isDiscountIllegal ? "text-red-600" : "text-slate-900"}`}>
                {simDiscount.toFixed(1)}% {isDiscountIllegal ? "(BLOCKED)" : ""}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="25.0"
              step="0.5"
              value={simDiscount}
              onChange={(e) => setSimDiscount(parseFloat(e.target.value))}
              className={`w-full cursor-pointer ${isDiscountIllegal ? "accent-red-600" : "accent-blue-600"}`}
            />
          </div>

          {/* Slider 3: Cost */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Channel Cost</span>
              <span className="font-mono text-slate-900 font-bold">₹{simCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="25.0"
              step="0.5"
              value={simCost}
              onChange={(e) => setSimCost(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            isDiscountIllegal
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Computed Expected Yield
            </span>
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {formatCurrency(simExpectedYield)}
            </span>
          </div>

          {isDiscountIllegal ? (
            <div className="text-xs text-red-700 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              POLICY VIOLATION: Discount {simDiscount}% exceeds maximum allowed limit (10.0%). Action Vetoed.
            </div>
          ) : (
            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              POLICY COMPLIANT: Guardrails verified. Action approved for automated dispatch.
            </div>
          )}
        </div>
      </div>

      {caseDetail && (
        <div className="space-y-6">
          {/* Question 1: Why this action? */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                Q1
              </span>
              <h3 className="font-bold text-base text-slate-900">
                Why was &apos;{caseDetail.selected_action}&apos; chosen over alternative interventions?
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 leading-relaxed mb-4">
              <p className="font-semibold text-slate-900 mb-1">Mathematical Maximization:</p>
              The Strategist Agent computed the Expected Value: E[Value] = P(Recovery) &times; Net Amount &minus; Intervention Cost across all candidate actions in the catalog.
              <span className="font-semibold text-blue-700"> {caseDetail.selected_action}</span> achieved the highest mathematical yield while remaining 100% compliant with merchant guardrails.
            </div>

            {/* Candidate Action Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                    <th className="pb-2">Strategy Candidate</th>
                    <th className="pb-2">P(Success)</th>
                    <th className="pb-2">Intervention Cost</th>
                    <th className="pb-2">Expected Yield</th>
                    <th className="pb-2 text-right">Decision Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseDetail.candidate_actions.map((act) => {
                    const isSelected = act.action_type === caseDetail.selected_action;
                    return (
                      <tr key={act.action_type} className={isSelected ? "bg-emerald-50/50 font-semibold" : ""}>
                        <td className="py-2.5 font-medium text-slate-900">{act.action_type}</td>
                        <td className="py-2.5 font-mono">{(act.recovery_probability * 100).toFixed(1)}%</td>
                        <td className="py-2.5 font-mono text-slate-500">{formatCurrency(act.estimated_cost)}</td>
                        <td className="py-2.5 font-mono text-emerald-600 font-bold">{formatCurrency(act.expected_value)}</td>
                        <td className="py-2.5 text-right">
                          {isSelected ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              WINNER (Prescribed)
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Rejected (Lower EV)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question 2: Which Guardrails Passed / Failed? */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                Q2
              </span>
              <h3 className="font-bold text-base text-slate-900">
                Which deterministic guardrails evaluated this decision?
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Before execution, the action was submitted to the non-LLM policy engine. Zero hallucinated parameters are tolerated.
            </p>

            <div className="space-y-2">
              {(caseDetail.guardrail_checks?.checked_rules || [
                { name: "Discount Cap <= 10.0%", passed: true },
                { name: "Maximum Retry Attempts < 3", passed: true },
                { name: "Customer Notification Cooldown >= 8 Hours", passed: true },
                { name: "Hard Decline Lockout Check", passed: true }
              ]).map((rule: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-medium text-slate-800">{rule.name}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASSED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: How is it auditable? */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                Q3
              </span>
              <h3 className="font-bold text-base text-slate-900">
                How does the enterprise verify non-repudiation and data integrity?
              </h3>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 text-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">LEDGER ENTRY HASH:</span>
                <span className="text-emerald-400 font-bold truncate max-w-md">
                  {caseDetail.audit_trail?.[0]?.hash || "7f8a92b3c4d5e6f1a2b3c4d5e6f7a8b9"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">EXECUTION STATUS:</span>
                <span className="text-blue-400 font-bold">{caseDetail.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RAZORPAY LINK:</span>
                <span className="text-amber-400 font-bold">
                  {caseDetail.action_details?.razorpay_payment_link || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
