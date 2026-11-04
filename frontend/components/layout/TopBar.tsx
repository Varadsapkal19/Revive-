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
    label: "Enterprise Payroll — High Urgency Corporate Mandate",
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
    <header className="h-16 border-b border-[#E6E1D7] bg-[#FFFDF8]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 sm:px-8">
      {/* Left: Environment & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#F5F2E9] text-[#202522] border border-[#E6E1D7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-pulse" />
          <span>Live System</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-[#777B76]">
          <span>Webhook Ingestion: <span className="font-semibold text-[#202522] font-mono">:8000</span></span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#777B76]">
          <span>&bull;</span>
          <span>Guardrails: <span className="font-semibold text-[#202522]">100% Deterministic</span></span>
        </div>
      </div>

      {/* Right: Actions & Operator Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIngestOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Simulate Event
        </button>

        <div className="h-5 w-px bg-[#E6E1D7]" />

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5F2E9] border border-[#E6E1D7] text-[#202522] flex items-center justify-center font-bold text-xs shadow-2xs">
            AS
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-[#202522] leading-none block">Aarav Sharma</span>
            <span className="text-[10px] font-medium text-[#777B76]">FinOps Lead</span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign out of console"
            className="flex items-center gap-1.5 text-xs text-[#777B76] hover:text-[#202522] border border-[#E6E1D7] hover:border-[#202522]/30 bg-[#FFFDF8] px-2.5 py-1.5 rounded-xl transition-all ml-2"
          >
            <LogOut className="w-3.5 h-3.5 text-[#777B76]" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Realistic Ingest Modal with Presets */}
      {ingestOpen && (
        <div className="fixed inset-0 bg-[#202522]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF8] rounded-[24px] shadow-2xl border border-[#E6E1D7] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E6E1D7] flex items-center justify-between bg-[#F5F2E9]/50">
              <div>
                <h3 className="font-bold text-base text-[#202522]">Simulate Payment Failure Event</h3>
                <p className="text-xs text-[#777B76] mt-0.5">
                  Generates an authentic payment failure event into the REVIVE multi-agent pipeline.
                </p>
              </div>
              <button
                onClick={() => setIngestOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#777B76] hover:text-[#202522] hover:bg-[#E6E1D7]/50 text-xs font-semibold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Presets Selector */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5 uppercase tracking-wider">
                  Select Real-World Failure Scenario:
                </label>
                <div className="space-y-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPreset(i)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        selectedPreset === i
                          ? "border-[#202522] bg-[#F5F2E9] font-semibold text-[#202522] shadow-2xs ring-1 ring-[#FFD45C]"
                          : "border-[#E6E1D7] hover:border-[#202522]/30 text-[#202522] bg-[#FFFDF8]"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="block truncate font-medium">{p.label}</span>
                        <span className="text-[11px] text-[#777B76] font-normal">{p.bank} &bull; {p.method}</span>
                      </div>
                      <span className="font-mono font-bold text-[#202522] shrink-0">
                        ₹{p.amount.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E6E1D7]">
                <div>
                  <label className="block text-xs font-medium text-[#777B76] mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#E6E1D7] focus:border-[#202522] rounded-xl text-xs text-[#202522] outline-hidden transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#777B76] mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#E6E1D7] focus:border-[#202522] rounded-xl text-xs font-mono font-bold text-[#202522] outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-[#16A36A]/10 border border-[#16A36A]/30 text-[#16A36A] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                  {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#E6E1D7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIngestOpen(false)}
                  className="px-4 py-2 border border-[#E6E1D7] rounded-xl text-xs font-semibold text-[#777B76] hover:text-[#202522] hover:bg-[#F5F2E9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSimulateEvent}
                  className="px-5 py-2.5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#202522]/30 border-t-[#202522] rounded-full animate-spin" />
                      Executing Multi-Agent Graph...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-[#202522]" />
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
