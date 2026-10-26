import {
  DashboardMetrics, RecoveryCase, CaseDetail, MerchantPolicy,
  SimulationResult, AuditLog, Experiment
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error ${res.status}: ${err}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getMetrics: () => fetchJson<DashboardMetrics>("/api/metrics"),
  getCases: (status?: string) => fetchJson<RecoveryCase[]>(`/api/cases${status ? `?status=${status}` : ""}`),
  getCaseDetail: (id: string) => fetchJson<CaseDetail>(`/api/cases/${id}`),
  getRiskRadar: (minRisk = 0.0) => fetchJson<RecoveryCase[]>(`/api/risk?min_risk=${minRisk}`),
  getPolicies: () => fetchJson<MerchantPolicy>("/api/policies"),
  updatePolicies: (policy: MerchantPolicy) =>
    fetchJson<MerchantPolicy>("/api/policies", {
      method: "PUT",
      body: JSON.stringify(policy),
    }),
  testPolicy: (data: { action_type: string; discount_pct: number; current_retry_count: number; hours_since_last_contact: number; amount: number }) =>
    fetchJson<any>("/api/policies/test", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  runSimulator: (numCases: number, distribution: string, useLLM = false) =>
    fetchJson<SimulationResult>("/api/simulator/run", {
      method: "POST",
      body: JSON.stringify({ num_cases: numCases, distribution, use_llm: useLLM }),
    }),
  getAuditLogs: () => fetchJson<AuditLog[]>("/api/audit"),
  verifyAuditLedger: () => fetchJson<{ verified: boolean; total_records: number; tampered_records: number; valid_records: number; integrity_status: string; algorithm: string; timestamp: string }>("/api/audit/verify", { method: "POST" }),
  getExperiments: () => fetchJson<Experiment[]>("/api/experiments"),
  executeCaseAction: (caseId: string, actionType: string, notes?: string) =>
    fetchJson<CaseDetail>(`/api/cases/${caseId}/action`, {
      method: "POST",
      body: JSON.stringify({ action_type: actionType, notes }),
    }),
    executeBulkAction: (caseIds: string[], actionType: string) =>
    fetchJson<{ updated_count: number; action: string }>("/api/cases/bulk-action", {
      method: "POST",
      body: JSON.stringify({ case_ids: caseIds, action_type: actionType }),
    }),
  loginWithCredentials: (login_id: string, password: string) =>
    fetchJson<{ access_token: string; token_type: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id, password }),
    }),
  sendPhoneOtp: (phone_number: string) =>
    fetchJson<{ status: string; phone: string; demo_otp: string; message: string }>("/api/auth/phone/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone_number }),
    }),
  verifyPhoneOtp: (phone_number: string, otp_code: string) =>
    fetchJson<{ access_token: string; token_type: string; user: any }>("/api/auth/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone_number, otp_code }),
    }),
  loginWithGoogle: (email: string, name: string, avatar_url?: string) =>
    fetchJson<{ access_token: string; token_type: string; user: any }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ email, name, avatar_url }),
    }),
  getCurrentUser: () => fetchJson<any>("/api/auth/me"),
};

