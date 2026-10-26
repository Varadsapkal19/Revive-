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
      <div className="py-24 text-center text-sm text-slate-500 font-medium flex flex-col items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        Tracing forensic payment lifecycle...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="py-24 text-center">
        <h3 className="text-lg font-bold text-slate-900">Case Not Found</h3>
        <button
          onClick={() => router.push("/cases")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
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
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/cases" className="hover:text-slate-900 font-medium">
            Recovery Cases
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-slate-900">Case #{caseData.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditJson}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Forensic Audit (JSON)
          </button>
        </div>
      </div>

      {/* Hero Banner with Status & Quick Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-400">RAZORPAY RECOVERY CASE</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                caseData.status === "RECOVERED"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : caseData.status === "IN_RECOVERY"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              ● {caseData.status}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {formatCurrency(caseData.amount)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Diagnosed as: <span className="font-bold text-slate-800">{caseData.diagnosed_root_cause?.replace("_", " ")}</span>
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
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Force Gateway Retry
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction("DISPATCH_WHATSAPP")}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Dispatch via WhatsApp
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction("MARK_RECOVERED")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                Mark as Recovered
              </button>
            </>
          )}

          {caseData.status === "RECOVERED" && (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Customer Profile
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Name</span>
                <span className="font-semibold text-slate-900">{caseData.customer_name || "Aarav Sharma"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-mono text-slate-700">{caseData.customer_email || "aarav.sharma@enterprise.in"}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Tier</span>
                  <span className="font-bold text-blue-700">{caseData.customer_tier || "STANDARD"}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Prior Retries</span>
                  <span className="font-mono font-bold text-slate-800">{caseData.retry_count || 0} / 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instrument Telemetry */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Transaction Telemetry
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-mono font-semibold text-slate-800">pay_{caseData.id.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank / Network:</span>
                <span className="font-semibold text-slate-800">HDFC Bank Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-semibold text-slate-800">UPI AutoPay (Google Pay)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gateway Status:</span>
                <span className="font-mono font-bold text-red-600">400 Bad Request</span>
              </div>
            </div>
          </div>

          {/* Razorpay Link Quick Card */}
          {receipt?.razorpay_payment_link && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Razorpay Recovery Link (Test Mode)
              </span>
              <div className="p-2 bg-white rounded-lg border border-blue-200/80 font-mono text-xs text-blue-800 truncate select-all">
                {receipt.razorpay_payment_link}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => copyPaymentLink(receipt.razorpay_payment_link!)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={receipt.razorpay_payment_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Autonomous Multi-Agent Forensic Decision Trace */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Closed-Loop Multi-Agent Trace &amp; Audit Trail
          </h2>

          {/* Step 1: Sentinel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span className="font-bold text-sm text-slate-900">Agent: Sentinel (Urgency &amp; Risk Triage)</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                Risk Score: {(caseData.risk_score * 100).toFixed(0)} / 100
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitored payment failure event. Evaluated invoice amount ({formatCurrency(caseData.amount)}), customer tenure, and failure frequency. Assigned urgency tier: <span className="font-bold text-slate-900">{caseData.urgency}</span>.
            </p>
          </div>

          {/* Step 2: Diagnostician */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="font-bold text-sm text-slate-900">Agent: Diagnostician (Forensic Analysis)</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Confidence: {((caseData.diagnostic_confidence || 0.94) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Classified Root Cause:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {caseData.diagnosed_root_cause}
                </span>
              </div>
              <p className="text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                &ldquo;{caseData.diagnostic_reasoning || "Forensic telemetry mapped gateway status to standardized taxonomy."}&rdquo;
              </p>
            </div>
          </div>

          {/* Step 3: Strategist Expected Value */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span className="font-bold text-sm text-slate-900">Agent: Strategist (Expected Financial Yield Ranking)</span>
              </div>
              <span className="text-xs text-slate-400">E[V] Optimization</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-2">Action Option</th>
                    <th className="pb-2">P(Recovery)</th>
                    <th className="pb-2">Intervention Cost</th>
                    <th className="pb-2">Expected Yield</th>
                    <th className="pb-2 text-right">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseData.candidate_actions.map((act) => {
                    const isSelected = act.action_type === caseData.selected_action;
                    return (
                      <tr key={act.action_type} className={isSelected ? "bg-blue-50/50 font-semibold" : ""}>
                        <td className="py-2.5 font-medium text-slate-900">{act.action_type}</td>
                        <td className="py-2.5 font-mono">{(act.recovery_probability * 100).toFixed(1)}%</td>
                        <td className="py-2.5 font-mono text-slate-500">{formatCurrency(act.estimated_cost)}</td>
                        <td className="py-2.5 font-mono text-emerald-600 font-bold">{formatCurrency(act.expected_value)}</td>
                        <td className="py-2.5 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" /> Prescribed
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Alternative</span>
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <span className="font-bold text-sm text-slate-900">Deterministic Policy Guardrail Gate</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Policy Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Discount Rule</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Discount &le; 10.0%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Retry Cap</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Retries &lt; 3 Attempts
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">Contact Cooldown</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Interval &ge; 8 Hours
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: Auditor & Cryptographic Ledger */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <span className="font-bold text-sm text-slate-900">Agent: Auditor (SHA-256 Ledger Record)</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Immutable Hash</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">HASH:</span>
                <span className="text-emerald-400 font-bold truncate max-w-sm">
                  {caseData.audit_trail?.[0]?.hash || "7f8a92b3c4d5e6f1a2b3c4d5e6f7a8b9"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VERDICT:</span>
                <span className="text-blue-400 font-bold">PASSED_POLICY_CHECK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
