import {
  DashboardMetrics, RecoveryCase, CaseDetail, MerchantPolicy,
  SimulationResult, AuditLog, Experiment
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("revive_token") : null;
  
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // Transmit HttpOnly secure session cookies
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options?.headers,
      },
      cache: "no-store",
    });

    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("revive_token");
      localStorage.removeItem("revive_user");
      window.location.href = "/login";
    }

    if (!res.ok) {
      let errDetail = "Request failed";
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new Error(errDetail);
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
  register: (data: { email: string; name: string; password: string; merchant_name?: string }) =>
    fetchJson<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  loginWithCredentials: (login_id: string, password: string, totp_code?: string) =>
    fetchJson<{ access_token: string; refresh_token?: string; token_type: string; mfa_required?: boolean; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id, password, totp_code }),
    }),
  logout: () =>
    fetchJson<any>("/api/auth/logout", {
      method: "POST",
    }),
  logoutAll: () =>
    fetchJson<any>("/api/auth/logout-all", {
      method: "POST",
    }),
  setupMfa: () =>
    fetchJson<{ secret: string; provisioning_uri: string; recovery_codes: string[] }>("/api/auth/mfa/setup", {
      method: "POST",
    }),
  verifyMfa: (code: string) =>
    fetchJson<{ status: string; message: string }>("/api/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
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
