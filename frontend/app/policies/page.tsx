"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { MerchantPolicy } from "@/lib/types";

export default function PolicyCenterPage() {
  const [policy, setPolicy] = useState<MerchantPolicy | null>(null);
  const [initialPolicy, setInitialPolicy] = useState<MerchantPolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sandbox testing state
  const [testAction, setTestAction] = useState("INCENTIVIZED_OFFER");
  const [testDiscount, setTestDiscount] = useState(25.0); // Illegal proposal to demonstrate guardrail
  const [testRetries, setTestRetries] = useState(1);
  const [testCooldown, setTestCooldown] = useState(12.0);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const data = await api.getPolicies();
        setPolicy(data);
        setInitialPolicy(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPolicy();
  }, []);

  const isDirty = JSON.stringify(policy) !== JSON.stringify(initialPolicy);

  const applyPreset = (preset: "conservative" | "standard" | "aggressive") => {
    if (!policy) return;
    if (preset === "conservative") {
      setPolicy({
        ...policy,
        max_discount_pct: 5.0,
        max_retries: 2,
        cooldown_hours: 12,
        auto_whatsapp_enabled: true,
        auto_email_enabled: true,
      });
    } else if (preset === "standard") {
      setPolicy({
        ...policy,
        max_discount_pct: 10.0,
        max_retries: 3,
        cooldown_hours: 8,
        auto_whatsapp_enabled: true,
        auto_email_enabled: true,
      });
    } else if (preset === "aggressive") {
      setPolicy({
        ...policy,
        max_discount_pct: 15.0,
        max_retries: 4,
        cooldown_hours: 6,
        auto_whatsapp_enabled: true,
        auto_email_enabled: true,
      });
    }
  };

  const handleSave = async () => {
    if (!policy) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updatePolicies(policy);
      setPolicy(updated);
      setInitialPolicy(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSandbox = async () => {
    try {
      const res = await api.testPolicy({
        action_type: testAction,
        discount_pct: Number(testDiscount),
        current_retry_count: Number(testRetries),
        hours_since_last_contact: Number(testCooldown),
        amount: 2500.0,
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (!policy) {
    return (
      <div className="py-24 text-center text-xs text-[#777B76] font-medium flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin" />
        Loading merchant policy engine configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Governance Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202522] flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#16A36A]" />
            Deterministic Policy Center
          </h1>
          <p className="text-xs text-[#777B76] mt-0.5">
            Define merchant governance boundaries. REVIVE agents are strictly prohibited from violating these invariants.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-[#F5F2E9] p-1.5 rounded-xl text-xs font-semibold border border-[#E6E1D7]">
          <span className="text-[#777B76] px-2 text-[11px]">Presets:</span>
          <button
            onClick={() => applyPreset("conservative")}
            className="px-3 py-1 rounded-lg bg-[#FFFDF8] hover:bg-[#F5F2E9] text-[#202522] shadow-2xs transition-colors"
          >
            Conservative
          </button>
          <button
            onClick={() => applyPreset("standard")}
            className="px-3 py-1 rounded-lg bg-[#FFFDF8] hover:bg-[#F5F2E9] text-[#202522] font-bold shadow-2xs transition-colors"
          >
            Standard (Recommended)
          </button>
          <button
            onClick={() => applyPreset("aggressive")}
            className="px-3 py-1 rounded-lg bg-[#FFFDF8] hover:bg-[#F5F2E9] text-[#202522] shadow-2xs transition-colors"
          >
            Aggressive
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-4 bg-[#D9A441]/15 border border-[#D9A441]/40 text-[#202522] rounded-[20px] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D9A441]" />
            <span>You have unsaved policy modifications. Remember to save to update live guardrails.</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 bg-[#202522] hover:bg-[#202522]/90 text-[#FFD45C] rounded-xl text-xs font-bold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Policy Configuration Form */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs space-y-5">
          <h2 className="font-bold text-sm text-[#202522] border-b border-[#E6E1D7] pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#202522]" />
            Active Merchant Invariants
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#202522]">Maximum Discount Ceiling</label>
                <span className="font-mono text-xs font-bold text-[#202522] bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">{policy.max_discount_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={policy.max_discount_pct}
                onChange={(e) => setPolicy({ ...policy, max_discount_pct: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-sm font-mono text-[#202522] bg-[#FFFDF8] focus:border-[#202522] outline-hidden transition-colors"
              />
              <span className="text-[11px] text-[#777B76] mt-1 block">
                Any autonomous action attempting a higher discount will be strictly blocked.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#202522]">Maximum Automated Retries</label>
                <span className="font-mono text-xs font-bold text-[#202522] bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">{policy.max_retries} attempts</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.max_retries}
                onChange={(e) => setPolicy({ ...policy, max_retries: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-sm font-mono text-[#202522] bg-[#FFFDF8] focus:border-[#202522] outline-hidden transition-colors"
              />
              <span className="text-[11px] text-[#777B76] mt-1 block">
                Caps automated attempts to prevent gateway throttling and issuer fees.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#202522]">Customer Contact Cooldown</label>
                <span className="font-mono text-xs font-bold text-[#202522] bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">{policy.cooldown_hours} hours</span>
              </div>
              <input
                type="number"
                min="1"
                max="72"
                value={policy.cooldown_hours}
                onChange={(e) => setPolicy({ ...policy, cooldown_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-sm font-mono text-[#202522] bg-[#FFFDF8] focus:border-[#202522] outline-hidden transition-colors"
              />
              <span className="text-[11px] text-[#777B76] mt-1 block">
                Enforces minimum elapsed time between outbound emails or WhatsApp notifications.
              </span>
            </div>

            <div className="pt-3 border-t border-[#E6E1D7] space-y-2.5">
              <span className="block text-xs font-bold text-[#202522] uppercase tracking-wider">
                Approved Automated Outbound Channels
              </span>
              <label className="flex items-center gap-2.5 text-xs text-[#202522] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={policy.auto_whatsapp_enabled}
                  onChange={(e) => setPolicy({ ...policy, auto_whatsapp_enabled: e.target.checked })}
                  className="rounded text-[#202522] accent-[#202522] w-4 h-4"
                />
                Automated WhatsApp Payment Recovery Links
              </label>
              <label className="flex items-center gap-2.5 text-xs text-[#202522] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={policy.auto_email_enabled}
                  onChange={(e) => setPolicy({ ...policy, auto_email_enabled: e.target.checked })}
                  className="rounded text-[#202522] accent-[#202522] w-4 h-4"
                />
                Automated Email Invoice Updates &amp; Recovery Links
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E1D7] flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-bold text-[#16A36A] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Policy rules updated!
              </span>
            ) : <span />}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5 fill-[#202522]" />
              {saving ? "Persisting Rules..." : "Save Merchant Policy"}
            </button>
          </div>
        </div>

        {/* Live Guardrail Evaluation Sandbox */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs space-y-5">
          <div className="border-b border-[#E6E1D7] pb-3">
            <h2 className="font-bold text-sm text-[#202522] flex items-center gap-2">
              <Play className="w-4 h-4 text-[#16A36A] fill-[#16A36A]" />
              Interactive Guardrail Testing Sandbox
            </h2>
            <p className="text-xs text-[#777B76] mt-0.5">
              Simulate an action proposal to see the deterministic engine accept or veto it.
            </p>
          </div>

          {/* Test Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#777B76] uppercase tracking-wider block">
              Quick Test Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTestAction("INCENTIVIZED_OFFER");
                  setTestDiscount(25.0);
                  setTestRetries(1);
                  setTestCooldown(12.0);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F5F2E9] hover:bg-[#E6E1D7] text-[#202522] text-[11px] font-medium border border-[#E6E1D7]"
              >
                Rogue 25% Discount
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestAction("SMART_RETRY");
                  setTestDiscount(0.0);
                  setTestRetries(3);
                  setTestCooldown(24.0);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F5F2E9] hover:bg-[#E6E1D7] text-[#202522] text-[11px] font-medium border border-[#E6E1D7]"
              >
                Exceeded 4th Retry
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestAction("PAYMENT_LINK_WHATSAPP");
                  setTestDiscount(0.0);
                  setTestRetries(0);
                  setTestCooldown(2.0);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F5F2E9] hover:bg-[#E6E1D7] text-[#202522] text-[11px] font-medium border border-[#E6E1D7]"
              >
                Cooldown Breach (2h ago)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestAction("INCENTIVIZED_OFFER");
                  setTestDiscount(5.0);
                  setTestRetries(1);
                  setTestCooldown(14.0);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F5F2E9] hover:bg-[#E6E1D7] text-[#202522] text-[11px] font-medium border border-[#E6E1D7]"
              >
                Compliant 5% Discount
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#202522] mb-1">Proposed Action</label>
              <select
                value={testAction}
                onChange={(e) => setTestAction(e.target.value)}
                className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FFFDF8] text-[#202522] focus:border-[#202522] outline-hidden transition-colors"
              >
                <option value="INCENTIVIZED_OFFER">INCENTIVIZED_OFFER (Retention Incentive)</option>
                <option value="SMART_RETRY">SMART_RETRY (Bank Gateway Retry)</option>
                <option value="PAYMENT_LINK_WHATSAPP">PAYMENT_LINK_WHATSAPP</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202522] mb-1">Proposed Discount (%)</label>
                <input
                  type="number"
                  value={testDiscount}
                  onChange={(e) => setTestDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs font-mono font-bold text-[#202522] bg-[#FFFDF8] focus:border-[#202522] outline-hidden transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#202522] mb-1">Prior Retry Count</label>
                <input
                  type="number"
                  value={testRetries}
                  onChange={(e) => setTestRetries(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs font-mono font-bold text-[#202522] bg-[#FFFDF8] focus:border-[#202522] outline-hidden transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleTestSandbox}
              className="w-full py-2.5 bg-[#202522] hover:bg-[#202522]/90 text-[#FFFDF8] rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Play className="w-3.5 h-3.5 fill-[#FFD45C] text-[#FFD45C]" />
              Evaluate Against Active Policy
            </button>
          </div>

          {/* Output Verdict */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                testResult.approved
                  ? "bg-[#16A36A]/10 border-[#16A36A]/30 text-[#16A36A]"
                  : "bg-[#D75C5C]/10 border-[#D75C5C]/30 text-[#D75C5C]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.approved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                    ACTION APPROVED BY GUARDRAIL ENGINE
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#D75C5C]" />
                    ACTION VETOED BY GUARDRAIL ENGINE
                  </>
                )}
              </div>

              {testResult.violations?.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 list-disc list-inside font-semibold text-[#D75C5C]">
                  {testResult.violations.map((v: string, i: number) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
