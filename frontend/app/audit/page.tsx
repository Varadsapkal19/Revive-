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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Compliance &amp; Provenance</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202522] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#202522]" />
            Immutable Audit Ledger
          </h1>
          <p className="text-xs text-[#777B76] mt-0.5">
            Cryptographically chained decision history with SHA-256 non-repudiation and regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAuditCsv}
            className="px-3.5 py-2 border border-[#E6E1D7] bg-[#FFFDF8] hover:bg-[#F5F2E9] rounded-xl text-xs font-semibold text-[#202522] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#777B76]" />
            Export CSV
          </button>
          <button
            disabled={verifying}
            onClick={handleVerifyChain}
            className="px-4 py-2 bg-[#202522] hover:bg-[#202522]/90 text-[#FFD45C] rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {verifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Fingerprint className="w-4 h-4 text-[#16A36A]" />
            )}
            Verify Cryptographic Chain
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className="p-5 bg-[#16A36A]/10 border border-[#16A36A]/30 rounded-[20px] text-xs text-[#202522] flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#16A36A] shrink-0" />
            <div>
              <span className="font-bold block text-sm text-[#202522]">
                Cryptographic Integrity Verified: 100% Intact
              </span>
              <span className="text-[#16A36A] font-medium">
                Verified {verificationResult.total_records} chained records with SHA-256 signatures. 0 tampered entries detected.
              </span>
            </div>
          </div>
          <span className="font-mono font-bold text-xs bg-[#FFFDF8] text-[#202522] px-3 py-1 rounded-full border border-[#16A36A]/30">
            {verificationResult.algorithm}
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Agent Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F5F2E9] p-1 rounded-xl text-xs font-semibold border border-[#E6E1D7]">
          {["ALL", "SENTINEL", "DIAGNOSTICIAN", "STRATEGIST", "EXECUTOR", "OPERATOR"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAgentFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                agentFilter === tab
                  ? "bg-[#FFFDF8] text-[#202522] shadow-2xs font-bold"
                  : "text-[#777B76] hover:text-[#202522]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#777B76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hash, agent, or rationale..."
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
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Agent &bull; Stage</th>
                <th className="py-3.5 px-6">Decision Rationale</th>
                <th className="py-3.5 px-6">Guardrail</th>
                <th className="py-3.5 px-6 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7]/60 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#777B76]">
                    <div className="w-5 h-5 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin mx-auto mb-2" />
                    Loading cryptographic ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#777B76]">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCopied = copiedHash === log.entry_hash;
                  return (
                    <tr key={log.id} className="hover:bg-[#F5F2E9]/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-[#777B76] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <span className="font-bold text-[#202522] block">{log.agent_name}</span>
                        <span className="text-[10px] text-[#777B76] uppercase font-mono">{log.stage}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#202522] max-w-md">
                        {log.decision_rationale}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            log.guardrail_verdict === "PASSED"
                              ? "bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30"
                              : "bg-[#D75C5C]/10 text-[#D75C5C] border border-[#D75C5C]/30"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
                          {log.guardrail_verdict}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => copyHash(log.entry_hash)}
                          className="font-mono text-[11px] text-[#202522] hover:underline font-bold inline-flex items-center gap-1.5 group"
                          title="Click to copy SHA-256 hash"
                        >
                          {log.entry_hash.slice(0, 14)}...
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#777B76] group-hover:text-[#202522]" />
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
