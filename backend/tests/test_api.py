"""
Integration Tests for FastAPI API Router.
"""

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.services import SeederService

# Initialize database tables and demo seed for tests
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    SeederService.seed_initial_demo_data(db)

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["guardrail_engine"] == "ACTIVE_DETERMINISTIC"

def test_get_dashboard_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_arr_at_risk" in data
    assert "overall_recovery_rate" in data
    assert data["policy_compliance_rate"] == 100.0

def test_list_cases():
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert isinstance(cases, list)

def test_policy_endpoints():
    # Fetch policy
    resp = client.get("/api/policies")
    assert resp.status_code == 200
    policy = resp.json()
    assert policy["max_discount_pct"] == 10.0

    # Test policy guardrail sandbox
    test_payload = {
        "action_type": "INCENTIVIZED_OFFER",
        "discount_pct": 20.0,  # Exceeds limit
        "current_retry_count": 0,
        "hours_since_last_contact": 24.0,
        "amount": 1000.0
    }
    test_resp = client.post("/api/policies/test", json=test_payload)
    assert test_resp.status_code == 200
    test_data = test_resp.json()
    assert test_data["approved"] is False
    assert len(test_data["violations"]) > 0

def test_simulator_batch_endpoint():
    payload = {
        "num_cases": 100,
        "distribution": "BALANCED",
        "use_llm": False
    }
    resp = client.post("/api/simulator/run", json=payload)
    assert resp.status_code == 200
    sim_data = resp.json()
    assert sim_data["simulated_cases"] == 100
    assert sim_data["revive_recovery_rate"] > sim_data["baseline_recovery_rate"]
    assert sim_data["net_uplift_pct"] > 0

def test_execute_case_action():
    # Ingest event if empty to ensure case exists
    ingest_resp = client.post("/api/events", json={
        "merchant_id": "default_merchant",
        "customer_id": "cust_test_123",
        "amount": 2500.0,
        "currency": "INR",
        "error_code": "BAD_REQUEST_INSUFFICIENT_FUNDS",
        "error_description": "Insufficient balance in account"
    })
    if ingest_resp.status_code != 200:
        print("INGEST ERROR:", ingest_resp.text)
    assert ingest_resp.status_code == 200

    case_id = ingest_resp.json()["case_id"]

    # Trigger manual mark recovered
    act_resp = client.post(f"/api/cases/{case_id}/action", json={"action_type": "MARK_RECOVERED"})
    assert act_resp.status_code == 200
    updated = act_resp.json()
    assert updated["status"] == "RECOVERED"
    assert updated["recovered_amount"] == updated["amount"]

def test_verify_audit_ledger():
    resp = client.post("/api/audit/verify")
    assert resp.status_code == 200
    data = resp.json()
    assert data["verified"] is True
    assert data["tampered_records"] == 0
    assert data["algorithm"] == "SHA-256"

def test_auth_endpoints():
    # 1. Credentials login
    cred_resp = client.post("/api/auth/login", json={"login_id": "test_lead@acme.com", "password": "password123"})
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
    google_resp = client.post("/api/auth/google", json={"email": "operator@acme.com", "name": "Test Operator"})
    assert google_resp.status_code == 200
    assert "access_token" in google_resp.json()

