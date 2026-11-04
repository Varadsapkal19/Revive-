"""
Integration Tests for FastAPI API Router.
Verifies authenticated endpoints, RBAC permissions, and multi-tenant workflows.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.services import SeederService, AuthService
from app.schemas.domain import UserRegisterRequest

# Initialize database tables and demo seed for tests
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    SeederService.seed_initial_demo_data(db)

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_headers():
    """Provides authenticated FinOps Manager credentials for protected routes."""
    with SessionLocal() as db:
        # Register or login test operator
        try:
            reg_in = UserRegisterRequest(
                email="finops_test_admin@enterprise.io",
                name="FinOps Test Admin",
                password="TestAdminSecure2026!#",
                merchant_name="Enterprise Test Corp",
                role="FINOPS_MANAGER"
            )
            res = AuthService.register_user(db, reg_in)
            token = res["access_token"]
        except ValueError:
            login_res = AuthService.login_with_credentials(
                db, "finops_test_admin@enterprise.io", "TestAdminSecure2026!#"
            )
            token = login_res["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    # Verify security headers are injected
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"

def test_unauthenticated_protected_routes():
    # Attempt accessing protected routes without token -> Expect 401
    resp = client.get("/api/cases")
    assert resp.status_code == 401

    resp_metrics = client.get("/api/metrics")
    assert resp_metrics.status_code == 401

def test_get_dashboard_metrics(auth_headers):
    response = client.get("/api/metrics", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_arr_at_risk" in data
    assert "overall_recovery_rate" in data
    assert data["policy_compliance_rate"] == 100.0

def test_list_cases(auth_headers):
    response = client.get("/api/cases", headers=auth_headers)
    assert response.status_code == 200
    cases = response.json()
    assert isinstance(cases, list)

def test_policy_endpoints(auth_headers):
    # Fetch policy
    resp = client.get("/api/policies", headers=auth_headers)
    assert resp.status_code == 200
    policy = resp.json()
    assert policy["max_discount_pct"] <= 10.0

    # Test policy guardrail sandbox
    test_payload = {
        "action_type": "INCENTIVIZED_OFFER",
        "discount_pct": 20.0,  # Exceeds limit
        "current_retry_count": 0,
        "hours_since_last_contact": 24.0,
        "amount": 1000.0
    }
    test_resp = client.post("/api/policies/test", json=test_payload, headers=auth_headers)
    assert test_resp.status_code == 200
    test_data = test_resp.json()
    assert test_data["approved"] is False
    assert len(test_data["violations"]) > 0

def test_simulator_batch_endpoint(auth_headers):
    payload = {
        "num_cases": 100,
        "distribution": "BALANCED",
        "use_llm": False
    }
    resp = client.post("/api/simulator/run", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    sim_data = resp.json()
    assert sim_data["simulated_cases"] == 100
    assert sim_data["revive_recovery_rate"] > sim_data["baseline_recovery_rate"]
    assert sim_data["net_uplift_pct"] > 0

def test_execute_case_action(auth_headers):
    # Ingest event first
    ingest_resp = client.post("/api/events", json={
        "merchant_id": "default_merchant",
        "customer_id": "cust_test_123",
        "amount": 2500.0,
        "currency": "INR",
        "error_code": "BAD_REQUEST_INSUFFICIENT_FUNDS",
        "error_description": "Insufficient balance in account"
    }, headers=auth_headers)
    assert ingest_resp.status_code == 200

    case_id = ingest_resp.json()["case_id"]

    # Trigger manual mark recovered
    act_resp = client.post(f"/api/cases/{case_id}/action", json={"action_type": "MARK_RECOVERED"}, headers=auth_headers)
    assert act_resp.status_code == 200
    updated = act_resp.json()
    assert updated["status"] == "RECOVERED"
    assert updated["recovered_amount"] == updated["amount"]

def test_verify_audit_ledger(auth_headers):
    resp = client.post("/api/audit/verify", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["verified"] is True
    assert data["tampered_records"] == 0
    assert data["algorithm"] == "SHA-256"

def test_auth_endpoints():
    # 1. Credentials login with migration password
    cred_resp = client.post("/api/auth/login", json={"login_id": "aarav.sharma@acme.com", "password": "••••••••••••"})
    assert cred_resp.status_code == 200
    assert "access_token" in cred_resp.json()

    # 2. Phone OTP flow
    otp_resp = client.post("/api/auth/phone/send-otp", json={"phone_number": "+919820148210"})
    assert otp_resp.status_code == 200
    assert otp_resp.json()["status"] == "OTP_SENT"

    verify_resp = client.post("/api/auth/phone/verify-otp", json={"phone_number": "+919820148210", "otp_code": "482190"})
    assert verify_resp.status_code == 200
    assert "access_token" in verify_resp.json()

    # 3. Google SSO flow
    google_resp = client.post("/api/auth/google", json={"email": "operator_sso@acme.com", "name": "SSO Operator"})
    assert google_resp.status_code == 200
    assert "access_token" in google_resp.json()
