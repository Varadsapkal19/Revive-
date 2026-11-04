"""
REVIVE Enterprise Security Test Suite
Covers Argon2id password security, account lockout, JWT session verification,
RBAC authorization, multi-tenant IDOR isolation, webhook HMAC & idempotency,
cryptographic approval tokens, and security headers.
"""

import hmac
import hashlib
import time
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.services import SeederService, AuthService, RecoveryService
from app.schemas.domain import UserRegisterRequest, EventIngestRequest
from app.security.password import (
    hash_password, verify_password, validate_password_strength, PasswordPolicyError
)
from app.security.jwt import create_access_token, decode_access_token, TokenExpiredError, TokenInvalidError
from app.security.approval_token import (
    issue_execution_approval, verify_execution_approval, ApprovalValidationError
)
from app.security.rbac import Role, Permission, check_permission

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    SeederService.seed_initial_demo_data(db)

client = TestClient(app)

# --- 1. Password Security & Argon2id Tests ---
def test_password_policy_enforcement():
    # Length < 12 must fail
    with pytest.raises(PasswordPolicyError):
        validate_password_strength("Short1!")

    # Missing uppercase must fail
    with pytest.raises(PasswordPolicyError):
        validate_password_strength("nouppercasehere123!")

    # Missing digit must fail
    with pytest.raises(PasswordPolicyError):
        validate_password_strength("NoDigitsInThisPassword!")

    # Missing special char must fail
    with pytest.raises(PasswordPolicyError):
        validate_password_strength("NoSpecialCharInPassword123")

    # Common breached password must fail
    with pytest.raises(PasswordPolicyError):
        validate_password_strength("password123456")

    # Compliant password passes
    validate_password_strength("CompliantSecur3Passw0rd!")

def test_argon2id_hashing_and_verification():
    pw = "SuperSecureFinOps2026!#"
    hashed = hash_password(pw)
    assert hashed.startswith("$argon2id$")
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False

# --- 2. Account Lockout Protection ---
def test_account_lockout_after_failed_attempts():
    email = "lockout_victim@enterprise.io"
    with SessionLocal() as db:
        try:
            AuthService.register_user(db, UserRegisterRequest(
                email=email,
                name="Lockout Victim",
                password="ValidPassword2026!#",
                merchant_name="Lockout Corp",
                role="FINOPS_MANAGER"
            ))
        except ValueError:
            pass

    # 4 failed attempts should fail with invalid credentials
    for _ in range(4):
        resp = client.post("/api/auth/login", json={"login_id": email, "password": "WrongPassword1!"})
        assert resp.status_code == 401

    # 5th attempt locks the account
    resp_5 = client.post("/api/auth/login", json={"login_id": email, "password": "WrongPassword1!"})
    assert resp_5.status_code == 401

    # 6th attempt with correct password should be blocked due to account lockout
    resp_locked = client.post("/api/auth/login", json={"login_id": email, "password": "ValidPassword2026!#"})
    assert resp_locked.status_code == 401
    assert "locked" in resp_locked.json()["detail"].lower()

# --- 3. JWT Security & Validation ---
def test_jwt_validation_and_tampering():
    token = create_access_token(
        user_id="usr_test_jwt",
        merchant_id="MID_TEST",
        role="FINOPS_MANAGER",
        session_id="sess_1"
    )
    claims = decode_access_token(token)
    assert claims["sub"] == "usr_test_jwt"
    assert claims["iss"] == "revive-auth"
    assert claims["aud"] == "revive-api"

    # Tampered token signature must fail
    tampered = token[:-4] + "fake"
    with pytest.raises(TokenInvalidError):
        decode_access_token(tampered)

# --- 4. RBAC Authorization & Least Privilege ---
def test_rbac_least_privilege_enforcement():
    # Analyst cannot execute actions
    assert check_permission(Role.ANALYST, Permission.CASES_READ) is True
    assert check_permission(Role.ANALYST, Permission.CASES_EXECUTE) is False
    assert check_permission(Role.ANALYST, Permission.POLICIES_WRITE) is False

    # Auditor can read and verify audit, but cannot write policies
    assert check_permission(Role.AUDITOR, Permission.AUDIT_READ) is True
    assert check_permission(Role.AUDITOR, Permission.AUDIT_VERIFY) is True
    assert check_permission(Role.AUDITOR, Permission.POLICIES_WRITE) is False

    # FinOps Manager can execute cases
    assert check_permission(Role.FINOPS_MANAGER, Permission.CASES_EXECUTE) is True

def test_rbac_endpoint_access_control():
    # Create Analyst Token
    analyst_token = create_access_token(
        user_id="usr_analyst_test",
        merchant_id="MID_ANALYST",
        role="ANALYST",
        session_id="sess_analyst"
    )
    headers = {"Authorization": f"Bearer {analyst_token}"}

    # Analyst attempting policy update -> Must be 403 Forbidden
    resp = client.put("/api/policies", json={"merchant_id": "MID_ANALYST", "max_discount_pct": 5.0}, headers=headers)
    assert resp.status_code == 403

# --- 5. Multi-Tenant Data Isolation (Anti-IDOR) ---
def test_multi_tenant_isolation_cross_tenant_access_blocked():
    with SessionLocal() as db:
        # Create case for Merchant Alpha
        event_alpha = EventIngestRequest(
            merchant_id="MID_ALPHA",
            amount=5000.0,
            currency="INR",
            error_code="INSUFFICIENT_FUNDS"
        )
        import asyncio
        case_alpha = asyncio.run(RecoveryService.process_new_event(db, event_alpha, auth_merchant_id="MID_ALPHA"))
        case_id = case_alpha.id

    # Create token for Merchant Beta
    token_beta = create_access_token(
        user_id="usr_beta_admin",
        merchant_id="MID_BETA",
        role="FINOPS_MANAGER",
        session_id="sess_beta"
    )
    headers_beta = {"Authorization": f"Bearer {token_beta}"}

    # Merchant Beta attempts to access Merchant Alpha's case -> Must be 404 (IDOR prevented)
    resp = client.get(f"/api/cases/{case_id}", headers=headers_beta)
    assert resp.status_code == 404

    # Merchant Beta attempts to execute action on Merchant Alpha's case -> Must be 404
    act_resp = client.post(f"/api/cases/{case_id}/action", json={"action_type": "MARK_RECOVERED"}, headers=headers_beta)
    assert act_resp.status_code == 404

# --- 6. Razorpay Webhook HMAC & Idempotency ---
def test_webhook_hmac_and_idempotency():
    secret = "REVIVE_PROD_WEBHOOK_SECRET"
    raw_payload = b'{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_test_idemp_123","amount":50000,"currency":"INR","error_code":"BAD_REQUEST"}}}}'
    
    # 1. Valid signature
    valid_sig = hmac.new(secret.encode("utf-8"), raw_payload, hashlib.sha256).hexdigest()
    resp1 = client.post(
        "/api/webhooks/razorpay",
        content=raw_payload,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": valid_sig}
    )
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "INGESTED"

    # 2. Replay duplicate event delivery -> Must be detected and ignored
    resp_dup = client.post(
        "/api/webhooks/razorpay",
        content=raw_payload,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": valid_sig}
    )
    assert resp_dup.status_code == 200
    assert resp_dup.json()["status"] == "DUPLICATE_EVENT_IGNORED"

    # 3. Invalid signature -> Must be 401 Unauthorized
    resp_invalid = client.post(
        "/api/webhooks/razorpay",
        content=raw_payload,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": "forged_signature_attack"}
    )
    assert resp_invalid.status_code == 401

# --- 7. Cryptographic Execution Approval Token (Section 8) ---
def test_cryptographic_approval_token_security():
    m_id = "MID_CORP_99"
    c_id = "case_fin_123"
    act = "INCENTIVIZED_OFFER"
    payload = {"amount": 2500.0, "discount_pct": 5.0, "channel": "EMAIL"}

    token = issue_execution_approval(m_id, c_id, act, payload)
    
    # Valid approval passes
    assert verify_execution_approval(token, m_id, c_id, act, payload) is True

    # Replay of same token is blocked
    with pytest.raises(ApprovalValidationError):
        verify_execution_approval(token, m_id, c_id, act, payload)

    # Tampered discount percentage (e.g. LLM hallucinates 20% discount) is blocked
    token_fresh = issue_execution_approval(m_id, c_id, act, payload)
    tampered_payload = {"amount": 2500.0, "discount_pct": 20.0, "channel": "EMAIL"}
    with pytest.raises(ApprovalValidationError):
        verify_execution_approval(token_fresh, m_id, c_id, act, tampered_payload)

# --- 8. Security Headers Verification ---
def test_security_headers_present():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert "Strict-Transport-Security" in resp.headers
    assert "Content-Security-Policy" in resp.headers
    assert "X-Correlation-ID" in resp.headers
