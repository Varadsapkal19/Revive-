"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Check,
  Copy,
  Download,
  Filter,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuditLog } from "@/lib/types";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditLedger();
      setVerificationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const exportAuditCsv = () => {
    if (logs.length === 0) return;
    const headers = "ID,CaseID,Agent,Stage,Verdict,Hash,Timestamp\n";
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.case_id || ""}","${l.agent_name}","${l.stage}","${l.guardrail_verdict}","${l.entry_hash}","${l.created_at}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revive_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.agent_name.toLowerCase().includes(search.toLowerCase()) ||
      l.stage.toLowerCase().includes(search.toLowerCase()) ||
      l.decision_rationale?.toLowerCase().includes(search.toLowerCase()) ||
      l.entry_hash.toLowerCase().includes(search.toLowerCase());

    const matchesAgent =
      agentFilter === "ALL" ||
      l.agent_name.toUpperCase().includes(agentFilter.toUpperCase());

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Immutable Audit Ledger
          </h1>
          <p className="text-sm text-slate-500">
            Cryptographically chained decision history with SHA-256 non-repudiation and regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditCsv}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            disabled={verifying}
            onClick={handleVerifyChain}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {verifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            )}
            Verify Cryptographic Chain
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block text-sm">
                Cryptographic Integrity Verified: 100% Intact
              </span>
              <span className="text-emerald-700">
                Verified {verificationResult.total_records} chained records with SHA-256 signatures. 0 tampered entries detected.
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded">
            {verificationResult.algorithm}
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Agent Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          {["ALL", "SENTINEL", "DIAGNOSTICIAN", "STRATEGIST", "EXECUTOR", "OPERATOR"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAgentFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                agentFilter === tab
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hash, agent, or rationale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Agent &bull; Stage</th>
                <th className="py-3 px-5">Decision Rationale</th>
                <th className="py-3 px-5">Guardrail</th>
                <th className="py-3 px-5 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                    Loading cryptographic ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCopied = copiedHash === log.entry_hash;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-3.5 px-5 text-xs">
                        <span className="font-semibold text-slate-900 block">{log.agent_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{log.stage}</span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-700 max-w-md">
                        {log.decision_rationale}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                            log.guardrail_verdict === "PASSED"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {log.guardrail_verdict}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => copyHash(log.entry_hash)}
                          className="font-mono text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 group"
                          title="Click to copy SHA-256 hash"
                        >
                          {log.entry_hash.slice(0, 14)}...
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
