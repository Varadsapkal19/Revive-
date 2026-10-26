"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowUpRight, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { RecoveryCase } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function CasesPage() {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const data = await api.getCases(filter === "ALL" ? undefined : filter);
        setCases(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [filter]);

  const filteredCases = cases.filter((c) =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.diagnosed_root_cause?.toLowerCase().includes(search.toLowerCase()) ||
    c.selected_action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Payment Recovery Cases
          </h1>
          <p className="text-sm text-slate-500">
            End-to-end audit of detected payment failures, autonomous diagnoses, and execution status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {["ALL", "IN_RECOVERY", "RECOVERED", "DETECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filter === tab
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case ID, cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Case Reference</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Diagnosed Cause</th>
                <th className="py-3 px-5">Strategy Selected</th>
                <th className="py-3 px-5">Risk Tier</th>
                <th className="py-3 px-5">Recovery Status</th>
                <th className="py-3 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    Loading recovery cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    No cases match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCases.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-900">
                      #{row.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {row.diagnosed_root_cause?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold text-blue-700">
                      {row.selected_action?.replace("_", " ")}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          row.urgency === "CRITICAL"
                            ? "bg-red-50 text-red-700"
                            : row.urgency === "HIGH"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {row.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === "RECOVERED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : row.status === "IN_RECOVERY"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.status === "RECOVERED" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/cases/${row.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
