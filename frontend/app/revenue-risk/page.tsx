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
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Radar className="w-6 h-6 text-blue-600" />
            Revenue Risk Radar
          </h1>
          <p className="text-sm text-slate-500">
            Real-time multi-dimensional risk triage based on LTV, failure severity, and customer recency.
          </p>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter by Min Risk Score:</span>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={minRisk}
            onChange={(e) => setMinRisk(parseFloat(e.target.value))}
            className="w-36 accent-blue-600 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            &gt;= {minRisk.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            {selectedIds.length === cases.length && cases.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            Select All ({cases.length})
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkAction("RETRY_GATEWAY")}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                ⚡ Bulk Retry ({selectedIds.length})
              </button>
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkAction("MARK_RECOVERED")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
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
          <div className="col-span-full py-16 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Scanning active transaction stream...
          </div>
        ) : cases.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-dashed rounded-xl p-8">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No At-Risk Cases Above Threshold</h4>
            <p className="text-xs text-slate-500 mt-1">Lower the minimum risk filter to inspect moderate risk cases.</p>
          </div>
        ) : (
          cases.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/20"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(c.id)}
                      className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 hover:text-slate-900"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      #{c.id.slice(0, 8)}
                    </button>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        c.urgency === "CRITICAL"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : c.urgency === "HIGH"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </div>

                  <div className="text-xl font-bold font-mono text-slate-900 mb-2">
                    {formatCurrency(c.amount)}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Diagnosed Cause:</span>
                      <span className="font-medium text-slate-800">{c.diagnosed_root_cause?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Score:</span>
                      <span className="font-mono font-bold text-slate-900">{(c.risk_score * 100).toFixed(1)} / 100</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.risk_score >= 0.75 ? "bg-red-500" : c.risk_score >= 0.45 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${c.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">● {c.status}</span>
                  <Link
                    href={`/cases/${c.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
