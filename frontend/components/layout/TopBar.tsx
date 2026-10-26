"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  Building2,
  CreditCard,
  Wifi,
  ExternalLink,
  LogOut,
} from "lucide-react";


const PRESETS = [
  {
    label: "Swiggy Dineout — Soft Decline (Insufficient Funds)",
    amount: 1850,
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@gmail.com",
    errorCode: "BAD_REQUEST_INSUFFICIENT_FUNDS",
    errorDesc: "Customer bank account has insufficient funds for immediate debit",
    tier: "STANDARD",
    bank: "HDFC Bank Ltd",
    method: "UPI AutoPay",
  },
  {
    label: "Zepto Express — Network Timeout (Gateway Blip)",
    amount: 740,
    customerName: "Sneha Kulkarni",
    customerEmail: "sneha.k@outlook.com",
    errorCode: "GATEWAY_TIMEOUT",
    errorDesc: "Acquiring bank network timed out during 2-phase authorization",
    tier: "PREMIUM",
    bank: "ICICI Bank Ltd",
    method: "Visa Platinum Debit Card (•••• 4821)",
  },
  {
    label: "Razorpay Payroll — High Urgency Enterprise Mandate",
    amount: 85000,
    customerName: "Aditya Nair (CTO)",
    customerEmail: "aditya@zenithtech.io",
    errorCode: "INVALID_CARD_EXPIRY",
    errorDesc: "Standing mandate card expiration date has lapsed",
    tier: "ENTERPRISE",
    bank: "State Bank of India",
    method: "Mastercard Corporate Credit Card (•••• 9012)",
  },
  {
    label: "Zomato Gold — OTP Verification Drop-off",
    amount: 2499,
    customerName: "Ananya Singhania",
    customerEmail: "ananya.s@zomato.in",
    errorCode: "AUTH_OTP_DROP",
    errorDesc: "Customer abandoned 3D-Secure SMS OTP page before confirmation",
    tier: "STANDARD",
    bank: "Axis Bank Ltd",
    method: "Axis NetBanking",
  },
  {
    label: "Enterprise SaaS — Suspected Fraud Flag (Lockout)",
    amount: 45000,
    customerName: "Vikram Malhotra",
    customerEmail: "vikram@malhotracorp.com",
    errorCode: "RISK_THRESHOLD_EXCEEDED",
    errorDesc: "Issuer fraud scoring triggered velocity breach rule",
    tier: "ENTERPRISE",
    bank: "Kotak Mahindra Bank",
    method: "Commercial Credit Line",
  },
];

export function TopBar() {
  const [ingestOpen, setIngestOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [amount, setAmount] = useState(PRESETS[0].amount);
  const [customerName, setCustomerName] = useState(PRESETS[0].customerName);
  const [customerEmail, setCustomerEmail] = useState(PRESETS[0].customerEmail);
  const [errorCode, setErrorCode] = useState(PRESETS[0].errorCode);
  const [errorDesc, setErrorDesc] = useState(PRESETS[0].errorDesc);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setAmount(p.amount);
    setCustomerName(p.customerName);
    setCustomerEmail(p.customerEmail);
    setErrorCode(p.errorCode);
    setErrorDesc(p.errorDesc);
  };

  const handleSimulateEvent = async () => {
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch("http://localhost:8000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "INR",
          customer_name: customerName,
          customer_email: customerEmail,
          error_code: errorCode,
          error_description: errorDesc,
          merchant_id: "default_merchant",
          raw_payload: {
            bank: PRESETS[selectedPreset]?.bank || "HDFC Bank",
            payment_method: PRESETS[selectedPreset]?.method || "UPI AutoPay",
            tier: PRESETS[selectedPreset]?.tier || "STANDARD",
          },
        }),
      });
      const data = await res.json();
      setSuccessMsg(`Autonomous Case #${data.case_id?.slice(0, 8)} created & triaged!`);
      setTimeout(() => {
        setIngestOpen(false);
        setSuccessMsg("");
        window.location.reload();
      }, 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("revive_token");
    localStorage.removeItem("revive_user");
    window.location.href = "/login";
  };

  return (
    <header className="h-14 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8">
      {/* Left: Environment & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-50 text-zinc-800 border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Live System</span>
        </div>


        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500">
          <span>Webhook Ingestion: <span className="font-medium text-zinc-800">:8000</span></span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-zinc-500">
          <span>&bull;</span>
          <span>Guardrails: <span className="font-medium text-zinc-800">100% Deterministic</span></span>
        </div>
      </div>

      {/* Right: Actions & Operator Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIngestOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Simulate Event
        </button>

        <div className="h-4 w-px bg-zinc-200" />

        {/* Operator Profile */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center font-semibold text-xs">
            AS
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-zinc-900 leading-none block">Aarav Sharma</span>
            <span className="text-[10px] text-zinc-400">FinOps Lead</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign out of console"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white px-2 py-1 rounded-md transition-colors ml-2"
          >
            <LogOut className="w-3 h-3 text-zinc-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>



      {/* Realistic Ingest Modal with Presets */}
      {ingestOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Simulate Payment Failure Event</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generates an authentic Razorpay webhook event into the REVIVE multi-agent pipeline.
                </p>
              </div>
              <button
                onClick={() => setIngestOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Presets Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Select Real-World Failure Scenario:
                </label>
                <div className="space-y-1.5">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(i)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        selectedPreset === i
                          ? "border-blue-600 bg-blue-50/60 font-semibold text-blue-900 ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="block truncate">{p.label}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{p.bank} &bull; {p.method}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ₹{p.amount.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIngestOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSimulateEvent}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Executing Multi-Agent Graph...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      Ingest Webhook &amp; Recover
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
