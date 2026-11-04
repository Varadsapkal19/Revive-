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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Incident Lifecycle</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202522] flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#202522]" />
            Payment Recovery Cases
          </h1>
          <p className="text-xs text-[#777B76] mt-0.5">
            End-to-end audit of detected payment failures, autonomous diagnoses, and execution status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F5F2E9] p-1 rounded-xl text-xs font-semibold border border-[#E6E1D7]">
          {["ALL", "IN_RECOVERY", "RECOVERED", "DETECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                filter === tab
                  ? "bg-[#FFFDF8] text-[#202522] shadow-2xs font-bold"
                  : "text-[#777B76] hover:text-[#202522]"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#777B76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case ID, cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FFFDF8] border border-[#E6E1D7] rounded-xl text-xs text-[#202522] placeholder-[#777B76] focus:border-[#202522] outline-hidden transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F5F2E9]/60 border-b border-[#E6E1D7] text-xs font-semibold uppercase tracking-wider text-[#777B76]">
                <th className="py-3.5 px-6">Case Reference</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Diagnosed Cause</th>
                <th className="py-3.5 px-6">Strategy Selected</th>
                <th className="py-3.5 px-6">Risk Tier</th>
                <th className="py-3.5 px-6">Recovery Status</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#777B76]">
                    <div className="w-5 h-5 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin mx-auto mb-2" />
                    Loading recovery cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#777B76]">
                    No cases match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCases.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F5F2E9]/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#202522]">
                      #{row.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6 font-mono font-extrabold text-[#202522]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#202522]">
                      <span className="px-2.5 py-1 rounded-md bg-[#F5F2E9] font-medium border border-[#E6E1D7]">
                        {row.diagnosed_root_cause?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-[#202522]">
                      {row.selected_action?.replace("_", " ")}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          row.urgency === "CRITICAL"
                            ? "bg-[#D75C5C]/10 text-[#D75C5C] border border-[#D75C5C]/30"
                            : row.urgency === "HIGH"
                            ? "bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30"
                            : "bg-[#202522]/5 text-[#202522] border border-[#E6E1D7]"
                        }`}
                      >
                        {row.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          row.status === "RECOVERED"
                            ? "bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30"
                            : row.status === "IN_RECOVERY"
                            ? "bg-[#FFD45C]/20 text-[#202522] border border-[#FFD45C]"
                            : "bg-[#F5F2E9] text-[#777B76] border border-[#E6E1D7]"
                        }`}
                      >
                        {row.status === "RECOVERED" && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />}
                        ● {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/cases/${row.id}`}
                        className="text-xs font-bold text-[#202522] hover:underline inline-flex items-center gap-1"
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
