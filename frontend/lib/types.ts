export interface DashboardMetrics {
  total_arr_at_risk: number;
  total_arr_recovered: number;
  overall_recovery_rate: number;
  active_cases_count: number;
  avg_resolution_hours: number;
  policy_compliance_rate: number;
  uplift_vs_baseline_pct: number;
  monthly_trend: Array<{ month: string; at_risk: number; recovered: number; rate: number }>;
  root_cause_distribution: Array<{ name: string; value: number }>;
  recent_activity: Array<{
    id: string;
    amount: number;
    cause: string;
    action: string;
    status: string;
    risk: number;
    time: string;
  }>;
}

export interface CandidateAction {
  action_type: string;
  expected_value: number;
  recovery_probability: number;
  estimated_cost: number;
  discount_pct: number;
  channel: string;
  schedule_delay_hours: number;
  rationale: string;
}

export interface GuardrailChecks {
  approved: boolean;
  violations: string[];
  checked_rules: Array<{
    rule?: string;
    name: string;
    attempted?: any;
    threshold?: any;
    passed: boolean;
    advisory?: string;
  }>;
}

export interface RecoveryCase {
  id: string;
  amount: number;
  currency: string;
  risk_score: number;
  urgency: string;
  diagnosed_root_cause: string;
  diagnostic_confidence?: number;
  status: string;
  selected_action?: string;
  recovered_amount: number;
  created_at: string;
}

export interface CaseDetail extends RecoveryCase {
  customer_name?: string;
  customer_email?: string;
  customer_tier?: string;
  diagnostic_reasoning?: string;
  action_details?: {
    action_type?: string;
    razorpay_payment_link?: string;
    payment_link_id?: string;
    channel?: string;
    status?: string;
    mock?: boolean;
    scheduled_retry_delay_hours?: number;
  };
  retry_count: number;
  candidate_actions: CandidateAction[];
  guardrail_checks?: GuardrailChecks;
  audit_trail: Array<{
    agent: string;
    stage: string;
    verdict: string;
    hash: string;
    created_at: string;
  }>;
}

export interface MerchantPolicy {
  merchant_id: string;
  max_retries: number;
  max_discount_pct: number;
  cooldown_hours: number;
  auto_whatsapp_enabled: boolean;
  auto_email_enabled: boolean;
  auto_upi_switch_enabled: boolean;
  human_escalation_threshold: number;
}

export interface SimulationResult {
  simulated_cases: number;
  baseline_recovered_count: number;
  baseline_recovery_rate: number;
  revive_recovered_count: number;
  revive_recovery_rate: number;
  net_uplift_pct: number;
  total_revenue_processed: number;
  baseline_recovered_revenue: number;
  revive_recovered_revenue: number;
  net_recovered_dollar_lift: number;
  guardrail_violations_prevented: number;
  breakdown_by_cause: Record<string, {
    total_count: number;
    baseline_recovered: number;
    revive_recovered: number;
    total_amount: number;
    revive_amount: number;
  }>;
  execution_time_ms: number;
}

export interface AuditLog {
  id: string;
  case_id?: string;
  agent_name: string;
  stage: string;
  state_snapshot?: any;
  decision_rationale?: string;
  guardrail_verdict: string;
  entry_hash: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  baseline_action: string;
  treatment_action: string;
  cases_count: number;
  baseline_recovery_rate: number;
  treatment_recovery_rate: number;
  net_uplift_pct: number;
  p_value: number;
  status: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  merchant_id: string;
  auth_provider: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

