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
      <div className="py-24 text-center text-sm text-slate-500 font-medium">
        Loading merchant policy engine configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Deterministic Policy Center
          </h1>
          <p className="text-sm text-slate-500">
            Define merchant governance boundaries. REVIVE agents are strictly prohibited from violating these invariants.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <span className="text-slate-400 px-2">Presets:</span>
          <button
            onClick={() => applyPreset("conservative")}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            Conservative
          </button>
          <button
            onClick={() => applyPreset("standard")}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            Standard (Recommended)
          </button>
          <button
            onClick={() => applyPreset("aggressive")}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            Aggressive
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>You have unsaved policy modifications. Remember to save to update live guardrails.</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Merchant Policy Configuration Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Active Merchant Invariants
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Maximum Discount Ceiling</label>
                <span className="font-mono text-xs font-bold text-blue-600">{policy.max_discount_pct}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={policy.max_discount_pct}
                onChange={(e) => setPolicy({ ...policy, max_discount_pct: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Any autonomous action attempting a higher discount will be strictly blocked.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Maximum Automated Retries</label>
                <span className="font-mono text-xs font-bold text-blue-600">{policy.max_retries} attempts</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.max_retries}
                onChange={(e) => setPolicy({ ...policy, max_retries: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Caps automated attempts to prevent gateway throttling and issuer fees.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Customer Contact Cooldown</label>
                <span className="font-mono text-xs font-bold text-blue-600">{policy.cooldown_hours} hours</span>
              </div>
              <input
                type="number"
                min="1"
                max="72"
                value={policy.cooldown_hours}
                onChange={(e) => setPolicy({ ...policy, cooldown_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Enforces minimum elapsed time between outbound emails or WhatsApp notifications.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Approved Automated Outbound Channels
              </span>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={policy.auto_whatsapp_enabled}
                  onChange={(e) => setPolicy({ ...policy, auto_whatsapp_enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Automated WhatsApp Razorpay Payment Links
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={policy.auto_email_enabled}
                  onChange={(e) => setPolicy({ ...policy, auto_email_enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Automated Email Invoice Updates &amp; Recovery Links
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Policy rules updated!
              </span>
            ) : <span />}

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Persisting Rules..." : "Save Merchant Policy"}
            </button>
          </div>
        </div>

        {/* Live Guardrail Evaluation Sandbox */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Interactive Guardrail Testing Sandbox
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate an action proposal to see the deterministic engine accept or veto it.
            </p>
          </div>

          {/* Test Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
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
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
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
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
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
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
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
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
              >
                Compliant 5% Discount
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Proposed Action</label>
              <select
                value={testAction}
                onChange={(e) => setTestAction(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="INCENTIVIZED_OFFER">INCENTIVIZED_OFFER (Retention Incentive)</option>
                <option value="SMART_RETRY">SMART_RETRY (Bank Gateway Retry)</option>
                <option value="PAYMENT_LINK_WHATSAPP">PAYMENT_LINK_WHATSAPP</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proposed Discount (%)</label>
                <input
                  type="number"
                  value={testDiscount}
                  onChange={(e) => setTestDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Prior Retry Count</label>
                <input
                  type="number"
                  value={testRetries}
                  onChange={(e) => setTestRetries(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleTestSandbox}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all mt-3"
            >
              <Play className="w-3.5 h-3.5" />
              Evaluate Against Active Policy
            </button>
          </div>

          {/* Output Verdict */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
                testResult.approved
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.approved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ACTION APPROVED BY GUARDRAIL ENGINE
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    ACTION VETOED BY GUARDRAIL ENGINE
                  </>
                )}
              </div>

              {testResult.violations?.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 list-disc list-inside font-semibold text-red-700">
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
