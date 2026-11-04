import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, JSON, Text, ForeignKey, UniqueConstraint, Index
)
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    razorpay_key_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, unique=True, index=True)
    phone = Column(String(50), nullable=True, unique=True, index=True)
    role = Column(String(50), default="FINOPS_MANAGER")  # SUPER_ADMIN, MERCHANT_OWNER, MERCHANT_ADMIN, FINOPS_MANAGER, DEVELOPER, ANALYST, AUDITOR
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(50), default="LOCAL")  # LOCAL, GOOGLE, PHONE
    avatar_url = Column(String(500), nullable=True)
    
    # Account Security & Lockout
    status = Column(String(50), default="ACTIVE")  # ACTIVE, LOCKED, SUSPENDED
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # Multi-Factor Authentication (TOTP)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(100), nullable=True)
    mfa_recovery_codes = Column(JSON, nullable=True)  # List of SHA-256 hashes
    
    # Verification & Recovery
    email_verified = Column(Boolean, default=True)
    verification_token = Column(String(100), nullable=True)
    reset_password_token = Column(String(100), nullable=True)
    reset_password_expires_at = Column(DateTime, nullable=True)
    
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSession(Base):
    """Tracks active authenticated user sessions for device management and revocation."""
    __tablename__ = "user_sessions"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    merchant_id = Column(String(36), nullable=False, index=True)
    refresh_token_hash = Column(String(64), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, index=True)

class LoginHistory(Base):
    """Immutable audit trail of authentication attempts for brute force detection."""
    __tablename__ = "login_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    email_attempted = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)  # SUCCESS, FAILED_INVALID_CREDENTIALS, FAILED_LOCKED, FAILED_MFA
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class WebhookEvent(Base):
    """Enforces strict webhook idempotency and replay protection."""
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(100), nullable=False, unique=True, index=True)
    merchant_id = Column(String(36), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)
    signature = Column(String(128), nullable=True)
    status = Column(String(50), default="PROCESSED")  # PROCESSED, DUPLICATE_BLOCKED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    tier = Column(String(50), default="STANDARD")  # STANDARD, PREMIUM, ENTERPRISE
    ltv = Column(Float, default=500.0)
    failure_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="FAILED")  # FAILED, RECOVERED, PENDING
    razorpay_payment_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RevenueEvent(Base):
    __tablename__ = "revenue_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), default="default_merchant", nullable=False, index=True)
    customer_id = Column(String(36), nullable=True)
    payment_id = Column(String(36), nullable=True)
    event_type = Column(String(100), default="payment.failed")
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    error_code = Column(String(100), nullable=True)
    error_description = Column(Text, nullable=True)
    raw_payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RecoveryCase(Base):
    __tablename__ = "recovery_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), nullable=True)
    merchant_id = Column(String(36), default="default_merchant", nullable=False, index=True)
    customer_id = Column(String(36), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    risk_score = Column(Float, default=0.5)
    urgency = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    diagnosed_root_cause = Column(String(100), nullable=True)
    diagnostic_confidence = Column(Float, default=0.0)
    diagnostic_reasoning = Column(Text, nullable=True)
    status = Column(String(50), default="DETECTED")  # DETECTED, TRIAGED, STRATEGY_CHOSEN, IN_RECOVERY, RECOVERED, CHURNED, BLOCKED
    selected_action = Column(String(100), nullable=True)
    action_details = Column(JSON, nullable=True)
    retry_count = Column(Integer, default=0)
    recovered_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("recovery_cases.id"), nullable=False)
    action_type = Column(String(100), nullable=False)
    expected_value = Column(Float, default=0.0)
    recovery_probability = Column(Float, default=0.0)
    discount_pct = Column(Float, default=0.0)
    target_channel = Column(String(50), nullable=True)  # EMAIL, WHATSAPP, SMS, GATEWAY
    execution_details = Column(JSON, nullable=True)
    status = Column(String(50), default="EXECUTED")  # EXECUTED, BLOCKED, FAILED
    guardrail_approved = Column(Boolean, default=True)
    guardrail_notes = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)

class RecoveryOutcome(Base):
    __tablename__ = "recovery_outcomes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("recovery_cases.id"), nullable=False)
    action_id = Column(String(36), nullable=True)
    success = Column(Boolean, default=False)
    recovered_amount = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    net_value = Column(Float, default=0.0)
    resolved_at = Column(DateTime, default=datetime.utcnow)

class MerchantPolicy(Base):
    __tablename__ = "merchant_policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), default="default_merchant", unique=True, index=True)
    policy_version = Column(Integer, default=1)
    max_retries = Column(Integer, default=3)
    max_discount_pct = Column(Float, default=10.0)
    cooldown_hours = Column(Integer, default=8)
    auto_whatsapp_enabled = Column(Boolean, default=True)
    auto_email_enabled = Column(Boolean, default=True)
    auto_upi_switch_enabled = Column(Boolean, default=True)
    human_escalation_threshold = Column(Float, default=10000.0)  # INR or currency
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), default="default_merchant", nullable=False, index=True)
    case_id = Column(String(36), nullable=True)
    agent_name = Column(String(50), nullable=False)
    stage = Column(String(50), nullable=False)
    state_snapshot = Column(JSON, nullable=True)
    decision_rationale = Column(Text, nullable=True)
    guardrail_verdict = Column(String(50), default="PASSED")
    previous_hash = Column(String(64), nullable=True)
    entry_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), default="default_merchant", nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    baseline_action = Column(String(100), default="STATIC_RETRY_24H")
    treatment_action = Column(String(100), default="REVIVE_AUTONOMOUS_OPTIMIZATION")
    cases_count = Column(Integer, default=0)
    baseline_recovered = Column(Integer, default=0)
    treatment_recovered = Column(Integer, default=0)
    baseline_recovery_rate = Column(Float, default=21.4)
    treatment_recovery_rate = Column(Float, default=52.8)
    net_uplift_pct = Column(Float, default=31.4)
    p_value = Column(Float, default=0.001)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
