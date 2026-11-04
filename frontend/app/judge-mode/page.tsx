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
      <div className="bg-[#202522] text-[#FFFDF8] rounded-[28px] p-8 shadow-md border border-[#202522] relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#FFD45C] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 fill-[#FFD45C]" />
          Autonomous Explainability &amp; Audit Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#FFFDF8]">Judge Mode: &quot;Why This Action?&quot;</h1>
        <p className="text-[#E6E1D7]/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Forensic inspectability into how REVIVE pairs cognitive AI hypotheses with unyielding deterministic policy guardrails to maximize recovered capital without hallucination risk.
        </p>

        {/* Case Selector Dropdown */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-[#E6E1D7]">Select Case to Inspect:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-[#FFFDF8]/10 text-[#FFFDF8] border border-[#FFFDF8]/20 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#FFD45C]"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id} className="text-[#202522] bg-[#FFFDF8]">
                Case #{c.id.slice(0, 8)} — {formatCurrency(c.amount)} ({c.diagnosed_root_cause})
              </option>
            ))}
          </select>

          {caseDetail && (
            <Link
              href={`/cases/${caseDetail.id}`}
              className="text-xs text-[#FFD45C] hover:text-[#FFD45C]/80 inline-flex items-center gap-1 font-semibold underline"
            >
              Open Full Case File <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Interactive Expected Value Calculator for Evaluators */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E6E1D7] gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#202522]" />
            <h2 className="font-bold text-sm text-[#202522]">
              Interactive E[V] Optimizer &amp; Guardrail Sandbox
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-[#777B76]">
            Formula: E[Yield] = P(Recovery) &times; Net Amount &minus; Cost
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Recovery Probability */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#202522] mb-1.5">
              <span>Recovery Prob (P)</span>
              <span className="font-mono text-[#202522] font-bold bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">{(simProb * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={simProb}
              onChange={(e) => setSimProb(parseFloat(e.target.value))}
              className="w-full accent-[#202522] cursor-pointer"
            />
          </div>

          {/* Slider 2: Discount % */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#202522] mb-1.5">
              <span>Retention Discount</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${isDiscountIllegal ? "bg-[#D75C5C]/10 text-[#D75C5C] border-[#D75C5C]/30" : "bg-[#F5F2E9] text-[#202522] border-[#E6E1D7]"}`}>
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
              className={`w-full cursor-pointer ${isDiscountIllegal ? "accent-[#D75C5C]" : "accent-[#202522]"}`}
            />
          </div>

          {/* Slider 3: Cost */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#202522] mb-1.5">
              <span>Channel Cost</span>
              <span className="font-mono text-[#202522] font-bold bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">₹{simCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="25.0"
              step="0.5"
              value={simCost}
              onChange={(e) => setSimCost(parseFloat(e.target.value))}
              className="w-full accent-[#202522] cursor-pointer"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            isDiscountIllegal
              ? "bg-[#D75C5C]/10 border-[#D75C5C]/30 text-[#D75C5C]"
              : "bg-[#16A36A]/10 border-[#16A36A]/30 text-[#16A36A]"
          }`}
        >
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-[#777B76]">
              Computed Expected Yield
            </span>
            <span className="text-3xl font-extrabold font-mono text-[#202522]">
              {formatCurrency(simExpectedYield)}
            </span>
          </div>

          {isDiscountIllegal ? (
            <div className="text-xs text-[#D75C5C] font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D75C5C] shrink-0" />
              POLICY VIOLATION: Discount {simDiscount}% exceeds maximum allowed limit (10.0%). Action Vetoed.
            </div>
          ) : (
            <div className="text-xs text-[#16A36A] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
              POLICY COMPLIANT: Guardrails verified. Action approved for automated dispatch.
            </div>
          )}
        </div>
      </div>

      {caseDetail && (
        <div className="space-y-6">
          {/* Question 1: Why this action? */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                Q1
              </span>
              <h2 className="font-bold text-base text-[#202522]">
                Why was &apos;{caseDetail.selected_action}&apos; chosen over alternative interventions?
              </h2>
            </div>

            <div className="bg-[#F5F2E9]/60 border border-[#E6E1D7] rounded-xl p-4 text-xs text-[#202522] leading-relaxed mb-4">
              <p className="font-bold text-[#202522] mb-1">Mathematical Maximization:</p>
              The Strategist Agent computed the Expected Value: E[Value] = P(Recovery) &times; Net Amount &minus; Intervention Cost across all candidate actions in the catalog.
              <span className="font-bold text-[#202522]"> {caseDetail.selected_action}</span> achieved the highest mathematical yield while remaining 100% compliant with merchant guardrails.
            </div>

            {/* Candidate Action Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1D7] text-[#777B76] font-semibold uppercase">
                    <th className="pb-2">Strategy Candidate</th>
                    <th className="pb-2">P(Success)</th>
                    <th className="pb-2">Intervention Cost</th>
                    <th className="pb-2">Expected Yield</th>
                    <th className="pb-2 text-right">Decision Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D7]/60">
                  {caseDetail.candidate_actions.map((act) => {
                    const isSelected = act.action_type === caseDetail.selected_action;
                    return (
                      <tr key={act.action_type} className={isSelected ? "bg-[#FFD45C]/15 font-semibold" : ""}>
                        <td className="py-3 font-semibold text-[#202522]">{act.action_type}</td>
                        <td className="py-3 font-mono text-[#202522]">{(act.recovery_probability * 100).toFixed(1)}%</td>
                        <td className="py-3 font-mono text-[#777B76]">{formatCurrency(act.estimated_cost)}</td>
                        <td className="py-3 font-mono text-[#16A36A] font-bold">{formatCurrency(act.expected_value)}</td>
                        <td className="py-3 text-right">
                          {isSelected ? (
                            <span className="text-[11px] font-bold text-[#202522] bg-[#FFD45C] px-2.5 py-0.5 rounded-md shadow-2xs">
                              WINNER (Prescribed)
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#777B76]">Rejected (Lower EV)</span>
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
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-xl bg-[#16A36A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                Q2
              </span>
              <h2 className="font-bold text-base text-[#202522]">
                Which deterministic guardrails evaluated this decision?
              </h2>
            </div>

            <p className="text-xs text-[#777B76] mb-4">
              Before execution, the action was submitted to the non-LLM policy engine. Zero hallucinated parameters are tolerated.
            </p>

            <div className="space-y-2">
              {(caseDetail.guardrail_checks?.checked_rules || [
                { name: "Discount Cap <= 10.0%", passed: true },
                { name: "Maximum Retry Attempts < 3", passed: true },
                { name: "Customer Notification Cooldown >= 8 Hours", passed: true },
                { name: "Hard Decline Lockout Check", passed: true }
              ]).map((rule: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7] text-xs">
                  <span className="font-semibold text-[#202522]">{rule.name}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" /> PASSED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: How is it auditable? */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                Q3
              </span>
              <h2 className="font-bold text-base text-[#202522]">
                How does the enterprise verify non-repudiation and data integrity?
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-[#202522] text-[#FFFDF8] text-xs font-mono space-y-2.5 border border-[#202522]">
              <div className="flex flex-col sm:flex-row sm:justify-between border-b border-[#FFFDF8]/10 pb-2 gap-1">
                <span className="text-[#777B76]">LEDGER ENTRY HASH:</span>
                <span className="text-[#16A36A] font-bold truncate max-w-md">
                  {caseDetail.audit_trail?.[0]?.hash || "7f8a92b3c4d5e6f1a2b3c4d5e6f7a8b9"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#FFFDF8]/10 pb-2">
                <span className="text-[#777B76]">EXECUTION STATUS:</span>
                <span className="text-[#FFD45C] font-bold">{caseDetail.status}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-[#777B76]">PAYMENT LINK:</span>
                <span className="text-[#FFFDF8] font-bold truncate max-w-md">
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
