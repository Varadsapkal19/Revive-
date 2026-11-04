"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radar,
  AlertCircle,
  ArrowUpRight,
  Filter,
  ShieldAlert,
  Zap,
  CheckSquare,
  Square,
  RefreshCw,
  Building2,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { RecoveryCase } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function RiskRadarPage() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [minRisk, setMinRisk] = useState(0.3);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadRiskCases = async () => {
    setLoading(true);
    try {
      const data = await api.getRiskRadar(minRisk);
      setCases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskCases();
  }, [minRisk]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === cases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cases.map((c) => c.id));
    }
  };

  const handleBulkAction = async (actionType: string) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await api.executeBulkAction(selectedIds, actionType);
      setToastMessage(`Executed '${actionType}' on ${res.updated_count} cases!`);
      setSelectedIds([]);
      loadRiskCases();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#202522] text-[#FFFDF8] px-4 py-3 rounded-2xl text-xs font-semibold shadow-xl border border-[#202522] flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Urgency Triaging</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202522] flex items-center gap-2.5">
            <Radar className="w-6 h-6 text-[#202522]" />
            Revenue Risk Radar
          </h1>
          <p className="text-xs text-[#777B76] mt-0.5">
            Real-time multi-dimensional risk triage based on LTV, failure severity, and customer recency.
          </p>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#777B76]" />
          <span className="text-xs font-semibold text-[#202522]">Filter by Min Risk Score:</span>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={minRisk}
            onChange={(e) => setMinRisk(parseFloat(e.target.value))}
            className="w-36 accent-[#202522] cursor-pointer"
          />
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F2E9] text-[#202522] border border-[#E6E1D7]">
            &gt;= {minRisk.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-xs font-semibold text-[#777B76] hover:text-[#202522] flex items-center gap-1.5 transition-colors"
          >
            {selectedIds.length === cases.length && cases.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#202522]" />
            ) : (
              <Square className="w-4 h-4 text-[#777B76]" />
            )}
            Select All ({cases.length})
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkAction("RETRY_GATEWAY")}
                className="px-3.5 py-1.5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202522] rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ⚡ Bulk Retry ({selectedIds.length})
              </button>
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkAction("MARK_RECOVERED")}
                className="px-3.5 py-1.5 bg-[#16A36A] hover:bg-[#16A36A]/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ✓ Mark Recovered ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#777B76] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin" />
            <span>Scanning active transaction stream...</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#FFFDF8] border border-dashed border-[#E6E1D7] rounded-[24px] p-8">
            <ShieldAlert className="w-8 h-8 text-[#777B76] mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-[#202522]">No At-Risk Cases Above Threshold</h4>
            <p className="text-xs text-[#777B76] mt-1">Lower the minimum risk filter to inspect moderate risk cases.</p>
          </div>
        ) : (
          cases.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                className={`bg-[#FFFDF8] border rounded-[24px] p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-[#202522] ring-2 ring-[#FFD45C] bg-[#F5F2E9]/40"
                    : "border-[#E6E1D7] hover:border-[#202522]/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(c.id)}
                      className="flex items-center gap-2 text-xs font-mono font-bold text-[#202522] hover:opacity-80 transition-opacity"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#202522]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#777B76]" />
                      )}
                      #{c.id.slice(0, 8)}
                    </button>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.urgency === "CRITICAL"
                          ? "bg-[#D75C5C]/10 text-[#D75C5C] border border-[#D75C5C]/30"
                          : c.urgency === "HIGH"
                          ? "bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30"
                          : "bg-[#202522]/5 text-[#202522] border border-[#E6E1D7]"
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold font-mono text-[#202522] mb-3">
                    {formatCurrency(c.amount)}
                  </div>

                  <div className="space-y-2 text-xs text-[#777B76] mb-4">
                    <div className="flex justify-between items-center">
                      <span>Diagnosed Cause:</span>
                      <span className="font-semibold text-[#202522] bg-[#F5F2E9] px-2 py-0.5 rounded-md border border-[#E6E1D7]">
                        {c.diagnosed_root_cause?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Score:</span>
                      <span className="font-mono font-bold text-[#202522]">{(c.risk_score * 100).toFixed(1)} / 100</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#F5F2E9] rounded-full h-1.5 mb-4 overflow-hidden border border-[#E6E1D7]/40">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.risk_score >= 0.75 ? "bg-[#D75C5C]" : c.risk_score >= 0.45 ? "bg-[#D9A441]" : "bg-[#202522]"
                      }`}
                      style={{ width: `${c.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6E1D7] flex items-center justify-between">
                  <span className="text-xs text-[#777B76] font-medium">● {c.status}</span>
                  <Link
                    href={`/cases/${c.id}`}
                    className="text-xs font-bold text-[#202522] hover:underline flex items-center gap-1"
                  >
                    Inspect Trace <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
