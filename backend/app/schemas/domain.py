from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field, EmailStr

# --- Event Schemas ---
class EventIngestRequest(BaseModel):
    merchant_id: str = Field(default="default_merchant")
    customer_id: str | None = None
    customer_name: str | None = "Acme Corp Customer"
    customer_email: str | None = "billing@acme.com"
    amount: float = Field(..., gt=0, description="Amount of failed payment")
    currency: str = Field(default="INR")
    error_code: str = Field(default="INSUFFICIENT_FUNDS")
    error_description: str | None = "The customer's bank account has insufficient funds"
    raw_payload: dict[str, Any] | None = None

class RevenueEventResponse(BaseModel):
    id: str
    merchant_id: str | None
    customer_id: str | None
    event_type: str
    amount: float
    currency: str
    error_code: str | None
    error_description: str | None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Risk & Case Schemas ---
class RiskAssessment(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    urgency: str  # CRITICAL, HIGH, MEDIUM, LOW
    factors: dict[str, float] = Field(default_factory=dict)
    rationale: str

class CandidateAction(BaseModel):
    action_type: str
    expected_value: float
    recovery_probability: float
    estimated_cost: float
    discount_pct: float = 0.0
    channel: str = "EMAIL"
    schedule_delay_hours: int = 0
    rationale: str

class GuardrailCheckResult(BaseModel):
    approved: bool
    violations: list[str] = Field(default_factory=list)
    checked_rules: list[dict[str, Any]] = Field(default_factory=list)

class CaseDetailResponse(BaseModel):
    id: str
    event_id: str | None
    merchant_id: str | None
    customer_id: str | None
    customer_name: str | None = None
    customer_email: str | None = None
    customer_tier: str | None = "STANDARD"
    amount: float
    currency: str
    risk_score: float
    urgency: str
    diagnosed_root_cause: str | None
    diagnostic_confidence: float
    diagnostic_reasoning: str | None
    status: str
    selected_action: str | None
    action_details: dict[str, Any] | None
    retry_count: int
    recovered_amount: float
    candidate_actions: list[CandidateAction] = Field(default_factory=list)
    guardrail_checks: GuardrailCheckResult | None = None
    audit_trail: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True

# --- Policy Schemas ---
class MerchantPolicySchema(BaseModel):
    merchant_id: str = "default_merchant"
    policy_version: int = 1
    max_retries: int = Field(default=3, ge=1, le=10)
    max_discount_pct: float = Field(default=10.0, ge=0.0, le=50.0)
    cooldown_hours: int = Field(default=8, ge=1, le=72)
    auto_whatsapp_enabled: bool = True
    auto_email_enabled: bool = True
    auto_upi_switch_enabled: bool = True
    human_escalation_threshold: float = 10000.0

    class Config:
        from_attributes = True

class PolicyTestRequest(BaseModel):
    action_type: str
    discount_pct: float = 0.0
    current_retry_count: int = 0
    hours_since_last_contact: float = 24.0
    amount: float = 1500.0

# --- Simulator Schemas ---
class SimulatorRunRequest(BaseModel):
    num_cases: int = Field(default=500, ge=10, le=10000)
    distribution: str = Field(default="BALANCED")  # BALANCED, HIGH_INSUFFICIENT_FUNDS, HIGH_GATEWAY_OUTAGE, HARD_DECLINES
    use_llm: bool = Field(default=False)

class SimulatorRunResponse(BaseModel):
    simulated_cases: int
    baseline_recovered_count: int
    baseline_recovery_rate: float
    revive_recovered_count: int
    revive_recovery_rate: float
    net_uplift_pct: float
    total_revenue_processed: float
    baseline_recovered_revenue: float
    revive_recovered_revenue: float
    net_recovered_dollar_lift: float
    guardrail_violations_prevented: int
    breakdown_by_cause: dict[str, dict[str, Any]]
    execution_time_ms: float

# --- Audit & Metrics Schemas ---
class AuditLogResponse(BaseModel):
    id: str
    merchant_id: str
    case_id: str | None
    agent_name: str
    stage: str
    state_snapshot: dict[str, Any] | None
    decision_rationale: str | None
    guardrail_verdict: str
    entry_hash: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    total_arr_at_risk: float
    total_arr_recovered: float
    overall_recovery_rate: float
    active_cases_count: int
    avg_resolution_hours: float
    policy_compliance_rate: float
    uplift_vs_baseline_pct: float
    monthly_trend: list[dict[str, Any]]
    root_cause_distribution: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]

class ExperimentResponse(BaseModel):
    id: str
    merchant_id: str
    name: str
    description: str | None
    baseline_action: str
    treatment_action: str
    cases_count: int
    baseline_recovery_rate: float
    treatment_recovery_rate: float
    net_uplift_pct: float
    p_value: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Authentication & Enterprise User Management Schemas ---
class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="Corporate email address")
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    password: str = Field(..., min_length=12, description="Password (min 12 chars with complexity)")
    merchant_name: Optional[str] = "Acme Payments Inc."
    role: Optional[str] = "FINOPS_MANAGER"

class LoginCredentialsRequest(BaseModel):
    login_id: str = Field(..., description="Email address or Merchant Login ID")
    password: str = Field(..., description="Account password")
    totp_code: Optional[str] = Field(None, min_length=6, max_length=9, description="Optional 6-digit TOTP or backup code")

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PhoneOtpSendRequest(BaseModel):
    phone_number: str = Field(..., description="Mobile number with country code e.g. +91 98765 43210")

class PhoneOtpVerifyRequest(BaseModel):
    phone_number: str = Field(..., description="Mobile number")
    otp_code: str = Field(..., min_length=4, max_length=6, description="4 or 6-digit OTP code")

class GoogleAuthRequest(BaseModel):
    id_token: str | None = None
    email: str
    name: str
    avatar_url: str | None = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=12)

class MfaSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    recovery_codes: List[str]

class MfaVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=9)

class UserProfile(BaseModel):
    id: str
    name: str
    email: str | None
    phone: str | None
    role: str
    merchant_id: str
    auth_provider: str
    mfa_enabled: bool = False
    avatar_url: str | None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    mfa_required: bool = False
    user: UserProfile

class UserSessionResponse(BaseModel):
    id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
