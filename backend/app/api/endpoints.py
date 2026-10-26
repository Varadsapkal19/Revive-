"""
REVIVE FastAPI API Router Endpoints
Provides all 12 REST routes for frontend, webhooks, simulator, and metrics.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Any

from app.database import get_db
from app.models.entities import RecoveryCase, AuditLog, Experiment
from app.schemas.domain import (
    EventIngestRequest, CaseDetailResponse, MerchantPolicySchema,
    PolicyTestRequest, SimulatorRunRequest, SimulatorRunResponse,
    AuditLogResponse, DashboardMetricsResponse, ExperimentResponse,
    LoginCredentialsRequest, PhoneOtpSendRequest, PhoneOtpVerifyRequest,
    GoogleAuthRequest, AuthResponse, UserProfile
)
from app.services.services import (
    RecoveryService, PolicyService, MetricsService, AuditService, AuthService
)
from app.simulation.batch_runner import batch_simulator
from app.razorpay.client import razorpay_client

router = APIRouter()

# --- Health Check ---
@router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "REVIVE Autonomous Revenue Recovery Engine",
        "version": "1.0.0",
        "guardrail_engine": "ACTIVE_DETERMINISTIC",
        "mock_mode": razorpay_client.mock_mode
    }

# --- Event Ingestion & Recovery Pipeline ---
@router.post("/api/events", tags=["Events & Cases"])
async def ingest_event(
    event_in: EventIngestRequest,
    db: Session = Depends(get_db)
):
    """
    Ingests a payment failure event and triggers the closed-loop multi-agent recovery workflow.
    """
    try:
        case = await RecoveryService.process_new_event(db, event_in)
        return {"status": "SUCCESS", "case_id": case.id, "case_status": case.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Risk Radar ---
@router.get("/api/risk", tags=["Risk Radar"])
def get_risk_radar(
    min_risk: float = 0.0,
    urgency: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(RecoveryCase).filter(RecoveryCase.risk_score >= min_risk)
    if urgency:
        query = query.filter(RecoveryCase.urgency == urgency.upper())
    cases = query.order_by(desc(RecoveryCase.risk_score)).limit(limit).all()
    return [
        {
            "id": c.id,
            "amount": c.amount,
            "currency": c.currency,
            "risk_score": c.risk_score,
            "urgency": c.urgency,
            "diagnosed_root_cause": c.diagnosed_root_cause,
            "status": c.status,
            "created_at": c.created_at
        } for c in cases
    ]

# --- Cases Management ---
@router.get("/api/cases", tags=["Events & Cases"])
def list_cases(
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    cases = RecoveryService.get_cases(db, status=status, limit=limit)
    return [
        {
            "id": c.id,
            "amount": c.amount,
            "currency": c.currency,
            "risk_score": c.risk_score,
            "urgency": c.urgency,
            "diagnosed_root_cause": c.diagnosed_root_cause,
            "diagnostic_confidence": c.diagnostic_confidence,
            "status": c.status,
            "selected_action": c.selected_action,
            "recovered_amount": c.recovered_amount,
            "created_at": c.created_at
        } for c in cases
    ]

@router.get("/api/cases/{case_id}", response_model=CaseDetailResponse, tags=["Events & Cases"])
def get_case(case_id: str, db: Session = Depends(get_db)):
    detail = RecoveryService.get_case_detail(db, case_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Recovery case not found")
    return detail

@router.post("/api/cases/{case_id}/action", response_model=CaseDetailResponse, tags=["Events & Cases"])
def execute_case_action(
    case_id: str,
    action_data: dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Manually triggers an operator action or override on a specific recovery case.
    """
    action_type = action_data.get("action_type", "MARK_RECOVERED")
    notes = action_data.get("notes")
    try:
        updated = RecoveryService.execute_manual_action(db, case_id, action_type, notes)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/cases/bulk-action", tags=["Events & Cases"])
def execute_bulk_cases_action(
    bulk_data: dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Executes a bulk batch intervention across selected recovery cases.
    """
    case_ids = bulk_data.get("case_ids", [])
    action_type = bulk_data.get("action_type", "RETRY_GATEWAY")
    return RecoveryService.bulk_action(db, case_ids, action_type)

@router.post("/api/audit/verify", tags=["Audit Center"])
def verify_audit_ledger(db: Session = Depends(get_db)):
    """
    Cryptographically verifies the SHA-256 chain of custody across all audit logs.
    """
    return AuditService.verify_chain(db)

# --- Simulator ---
@router.post("/api/simulator/run", response_model=SimulatorRunResponse, tags=["Simulator"])
def run_simulator(
    sim_in: SimulatorRunRequest
):
    """
    Executes a high-throughput synthetic batch simulation comparing Baseline vs. REVIVE.
    """
    results = batch_simulator.run_simulation(
        num_cases=sim_in.num_cases,
        distribution=sim_in.distribution,
        use_llm=sim_in.use_llm
    )
    return results

# --- Merchant Policies & Guardrails ---
@router.get("/api/policies", response_model=MerchantPolicySchema, tags=["Policy Center"])
def get_policies(merchant_id: str = "default_merchant", db: Session = Depends(get_db)):
    return PolicyService.get_policy(db, merchant_id)

@router.put("/api/policies", response_model=MerchantPolicySchema, tags=["Policy Center"])
def update_policies(policy_in: MerchantPolicySchema, db: Session = Depends(get_db)):
    return PolicyService.update_policy(db, policy_in)

@router.post("/api/policies/test", tags=["Policy Center"])
def test_policy_guardrail(
    test_in: PolicyTestRequest,
    merchant_id: str = "default_merchant",
    db: Session = Depends(get_db)
):
    policy = PolicyService.get_policy(db, merchant_id)
    return PolicyService.test_guardrails(test_in, policy)

# --- Audit Ledger ---
@router.get("/api/audit", response_model=list[AuditLogResponse], tags=["Audit Center"])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    return logs

# --- Dashboard Metrics ---
@router.get("/api/metrics", response_model=DashboardMetricsResponse, tags=["Dashboard"])
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return MetricsService.get_dashboard_metrics(db)

# --- Experiments ---
@router.get("/api/experiments", response_model=list[ExperimentResponse], tags=["Experiments"])
def get_experiments(db: Session = Depends(get_db)):
    return db.query(Experiment).all()

# --- Authentication Routes ---
@router.post("/api/auth/login", response_model=AuthResponse, tags=["Authentication"])
def login_with_credentials(
    login_in: LoginCredentialsRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate via Login ID and Password.
    """
    return AuthService.login_with_credentials(db, login_in.login_id, login_in.password)

@router.post("/api/auth/phone/send-otp", tags=["Authentication"])
def send_phone_otp(
    otp_in: PhoneOtpSendRequest
):
    """
    Dispatches a one-time verification code to the merchant phone number.
    """
    return AuthService.send_phone_otp(otp_in.phone_number)

@router.post("/api/auth/phone/verify-otp", response_model=AuthResponse, tags=["Authentication"])
def verify_phone_otp(
    verify_in: PhoneOtpVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies phone OTP and returns authenticated merchant session.
    """
    try:
        return AuthService.verify_phone_otp(db, verify_in.phone_number, verify_in.otp_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/auth/google", response_model=AuthResponse, tags=["Authentication"])
def login_with_google(
    google_in: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticates via Google OAuth Workspace credentials.
    """
    return AuthService.login_with_google(db, google_in.email, google_in.name, google_in.avatar_url)

@router.get("/api/auth/me", response_model=UserProfile, tags=["Authentication"])
def get_current_user(
    db: Session = Depends(get_db)
):
    """
    Returns the active merchant operator profile.
    """
    return {
        "id": "usr_active_admin",
        "name": "Aarav Sharma (FinOps Lead)",
        "email": "aarav.sharma@acme.com",
        "phone": "+91 98201 48210",
        "role": "FINOPS_ADMIN",
        "merchant_id": "MID_4821",
        "auth_provider": "LOCAL",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
    }

# --- Razorpay Webhooks ---
@router.post("/api/webhooks/razorpay", tags=["Razorpay Webhooks"])
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(None),
    db: Session = Depends(get_db)
):
    """
    Ingests and cryptographically verifies webhooks from Razorpay.
    """
    raw_body = await request.body()

    # Validate HMAC signature
    is_valid = razorpay_client.verify_webhook_signature(raw_body, x_razorpay_signature or "")
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid HMAC-SHA256 signature")

    payload = await request.json()
    event_type = payload.get("event", "payment.failed")

    if event_type == "payment.failed":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        amount = float(payment_entity.get("amount", 10000)) / 100.0  # Paise to Rupees
        error_code = payment_entity.get("error_code", "PAYMENT_FAILED")
        error_desc = payment_entity.get("error_description", "Payment transaction failed")

        event_in = EventIngestRequest(
            merchant_id="default_merchant",
            amount=amount,
            currency=payment_entity.get("currency", "INR"),
            error_code=error_code,
            error_description=error_desc,
            raw_payload=payload
        )
        case = await RecoveryService.process_new_event(db, event_in)
        return {"status": "INGESTED", "case_id": case.id}

    return {"status": "IGNORED_EVENT_TYPE", "event": event_type}
