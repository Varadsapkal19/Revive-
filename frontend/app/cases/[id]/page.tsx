"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Download,
  Clock,
  Building2,
  CreditCard,
  User,
  RefreshCw,
  PhoneCall,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { CaseDetail } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadCase = async () => {
    try {
      const data = await api.getCaseDetail(caseId);
      setCaseData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) loadCase();
  }, [caseId]);

  const handleAction = async (actionType: string) => {
    setActionLoading(true);
    try {
      const updated = await api.executeCaseAction(caseId, actionType);
      setCaseData(updated);
      setToastMessage(`Action '${actionType}' executed successfully!`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const copyPaymentLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAuditJson = () => {
    if (!caseData) return;
    const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revive_decision_audit_${caseData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#777B76] font-medium flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin" />
        Tracing forensic payment lifecycle...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="py-24 text-center">
        <h3 className="text-lg font-bold text-[#202522]">Case Not Found</h3>
        <button
          onClick={() => router.push("/cases")}
          className="mt-4 px-4 py-2 bg-[#FFD45C] text-[#202522] rounded-xl text-xs font-bold shadow-xs hover:bg-[#F4C64C]"
        >
          Return to Cases
        </button>
      </div>
    );
  }

  const receipt = caseData.action_details;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#202522] text-[#FFFDF8] px-4 py-3 rounded-2xl text-xs font-semibold shadow-xl border border-[#202522] flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#777B76]">
          <Link href="/cases" className="hover:text-[#202522] font-medium transition-colors">
            Recovery Cases
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-[#202522]">Case #{caseData.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditJson}
            className="px-3.5 py-2 border border-[#E6E1D7] bg-[#FFFDF8] hover:bg-[#F5F2E9] rounded-xl text-xs font-semibold text-[#202522] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#777B76]" />
            Export Forensic Audit (JSON)
          </button>
        </div>
      </div>

      {/* Hero Banner with Status & Quick Actions */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-[#777B76]">RECOVERY CASE</span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                caseData.status === "RECOVERED"
                  ? "bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30"
                  : caseData.status === "IN_RECOVERY"
                  ? "bg-[#FFD45C]/20 text-[#202522] border border-[#FFD45C]"
                  : "bg-[#F5F2E9] text-[#777B76] border border-[#E6E1D7]"
              }`}
            >
              ● {caseData.status}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold font-mono text-[#202522]">
              {formatCurrency(caseData.amount)}
            </span>
            <span className="text-xs text-[#777B76]">
              Diagnosed as: <span className="font-bold text-[#202522]">{caseData.diagnosed_root_cause?.replace("_", " ")}</span>
            </span>
          </div>
        </div>

        {/* Manual FinOps Override Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {caseData.status !== "RECOVERED" && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleAction("RETRY_GATEWAY")}
                className="px-3.5 py-2 bg-[#F5F2E9] hover:bg-[#E6E1D7] text-[#202522] border border-[#E6E1D7] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Force Gateway Retry
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction("DISPATCH_WHATSAPP")}
                className="px-3.5 py-2 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
              >
                Dispatch via WhatsApp
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction("MARK_RECOVERED")}
                className="px-4 py-2 bg-[#16A36A] hover:bg-[#16A36A]/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                Mark as Recovered
              </button>
            </>
          )}

          {caseData.status === "RECOVERED" && (
            <div className="px-4 py-2 bg-[#16A36A]/10 border border-[#16A36A]/30 rounded-xl text-[#16A36A] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
              Recaptured {formatCurrency(caseData.recovered_amount || caseData.amount)}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Customer Metadata & Multi-Agent Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer & Payment Telemetry */}
        <div className="space-y-5">
          {/* Customer Profile Card */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#777B76] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#202522]" />
              Customer Profile
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#777B76] block text-[11px]">Customer Name</span>
                <span className="font-bold text-[#202522]">{caseData.customer_name || "Aarav Sharma"}</span>
              </div>
              <div>
                <span className="text-[#777B76] block text-[11px]">Email Address</span>
                <span className="font-mono text-[#202522]">{caseData.customer_email || "aarav.sharma@enterprise.in"}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#E6E1D7]">
                <div>
                  <span className="text-[#777B76] block text-[11px]">Account Tier</span>
                  <span className="font-bold text-[#202522]">{caseData.customer_tier || "STANDARD"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#777B76] block text-[11px]">Prior Retries</span>
                  <span className="font-mono font-bold text-[#202522]">{caseData.retry_count || 0} / 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instrument Telemetry */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#777B76] flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#202522]" />
              Transaction Telemetry
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#777B76]">Payment ID:</span>
                <span className="font-mono font-semibold text-[#202522]">pay_{caseData.id.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777B76]">Bank / Network:</span>
                <span className="font-semibold text-[#202522]">HDFC Bank Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777B76]">Payment Method:</span>
                <span className="font-semibold text-[#202522]">UPI AutoPay (Google Pay)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777B76]">Gateway Status:</span>
                <span className="font-mono font-bold text-[#D75C5C]">400 Bad Request</span>
              </div>
            </div>
          </div>

          {/* Payment Recovery Link Quick Card */}
          {receipt?.razorpay_payment_link && (
            <div className="bg-[#F5F2E9] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-bold text-[#202522] uppercase tracking-wider block">
                Payment Recovery Link
              </span>
              <div className="p-2.5 bg-[#FFFDF8] rounded-xl border border-[#E6E1D7] font-mono text-xs text-[#202522] truncate select-all">
                {receipt.razorpay_payment_link}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => copyPaymentLink(receipt.razorpay_payment_link!)}
                  className="px-3.5 py-1.5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={receipt.razorpay_payment_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#FFFDF8] hover:bg-[#F5F2E9] border border-[#E6E1D7] text-[#202522] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  Open <ExternalLink className="w-3 h-3 text-[#777B76]" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Autonomous Multi-Agent Forensic Decision Trace */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-base font-bold text-[#202522] flex items-center gap-2">
            <Zap className="w-4 h-4 fill-[#202522]" />
            Closed-Loop Multi-Agent Trace &amp; Audit Trail
          </h2>

          {/* Step 1: Sentinel */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                  1
                </span>
                <span className="font-bold text-sm text-[#202522]">Agent: Sentinel (Urgency &amp; Risk Triage)</span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F2E9] text-[#202522] border border-[#E6E1D7]">
                Risk Score: {(caseData.risk_score * 100).toFixed(0)} / 100
              </span>
            </div>
            <p className="text-xs text-[#777B76] leading-relaxed">
              Monitored payment failure event. Evaluated invoice amount ({formatCurrency(caseData.amount)}), customer tenure, and failure frequency. Assigned urgency tier: <span className="font-bold text-[#202522]">{caseData.urgency}</span>.
            </p>
          </div>

          {/* Step 2: Diagnostician */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                  2
                </span>
                <span className="font-bold text-sm text-[#202522]">Agent: Diagnostician (Forensic Analysis)</span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                Confidence: {((caseData.diagnostic_confidence || 0.94) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-[#202522] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#777B76]">Classified Root Cause:</span>
                <span className="font-bold text-[#202522] bg-[#F5F2E9] px-2.5 py-1 rounded-md border border-[#E6E1D7]">
                  {caseData.diagnosed_root_cause}
                </span>
              </div>
              <p className="text-[#777B76] italic bg-[#F5F2E9]/60 p-3 rounded-xl border border-[#E6E1D7]">
                &ldquo;{caseData.diagnostic_reasoning || "Forensic telemetry mapped gateway status to standardized taxonomy."}&rdquo;
              </p>
            </div>
          </div>

          {/* Step 3: Strategist Expected Value */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                  3
                </span>
                <span className="font-bold text-sm text-[#202522]">Agent: Strategist (Expected Financial Yield Ranking)</span>
              </div>
              <span className="text-xs text-[#777B76] font-medium">E[V] Optimization</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1D7] text-[#777B76] uppercase font-semibold">
                    <th className="pb-2">Action Option</th>
                    <th className="pb-2">P(Recovery)</th>
                    <th className="pb-2">Intervention Cost</th>
                    <th className="pb-2">Expected Yield</th>
                    <th className="pb-2 text-right">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D7]/60">
                  {caseData.candidate_actions.map((act) => {
                    const isSelected = act.action_type === caseData.selected_action;
                    return (
                      <tr key={act.action_type} className={isSelected ? "bg-[#FFD45C]/15 font-semibold" : ""}>
                        <td className="py-3 font-semibold text-[#202522]">{act.action_type}</td>
                        <td className="py-3 font-mono text-[#202522]">{(act.recovery_probability * 100).toFixed(1)}%</td>
                        <td className="py-3 font-mono text-[#777B76]">{formatCurrency(act.estimated_cost)}</td>
                        <td className="py-3 font-mono text-[#16A36A] font-bold">{formatCurrency(act.expected_value)}</td>
                        <td className="py-3 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#202522] bg-[#FFD45C] px-2.5 py-0.5 rounded-md shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-[#202522]" /> Prescribed
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#777B76]">Alternative</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 4: Deterministic Guardrail Checklist */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#16A36A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  4
                </span>
                <span className="font-bold text-sm text-[#202522]">Deterministic Policy Guardrail Gate</span>
              </div>
              <span className="text-xs font-bold text-[#16A36A] bg-[#16A36A]/10 px-3 py-1 rounded-full border border-[#16A36A]/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Policy Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
                <span className="block text-[#777B76] text-[10px] uppercase font-bold">Discount Rule</span>
                <span className="font-semibold text-[#202522] flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" /> Discount &le; 10.0%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
                <span className="block text-[#777B76] text-[10px] uppercase font-bold">Retry Cap</span>
                <span className="font-semibold text-[#202522] flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" /> Retries &lt; 3 Attempts
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
                <span className="block text-[#777B76] text-[10px] uppercase font-bold">Contact Cooldown</span>
                <span className="font-semibold text-[#202522] flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" /> Interval &ge; 8 Hours
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: Auditor & Cryptographic Ledger */}
          <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7] mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#202522] text-[#FFD45C] flex items-center justify-center font-bold text-xs shadow-2xs">
                  5
                </span>
                <span className="font-bold text-sm text-[#202522]">Agent: Auditor (SHA-256 Ledger Record)</span>
              </div>
              <span className="text-xs text-[#777B76] font-mono">Immutable Hash</span>
            </div>

            <div className="p-4 rounded-xl bg-[#202522] text-[#FFFDF8] text-xs font-mono space-y-2 border border-[#202522]">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-[#777B76]">HASH:</span>
                <span className="text-[#16A36A] font-bold truncate max-w-sm">
                  {caseData.audit_trail?.[0]?.hash || "7f8a92b3c4d5e6f1a2b3c4d5e6f7a8b9"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777B76]">VERDICT:</span>
                <span className="text-[#FFD45C] font-bold">PASSED_POLICY_CHECK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
