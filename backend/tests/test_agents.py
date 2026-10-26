"""
Unit Tests for Multi-Agent Workflow and State Graph Transitions.
"""

import pytest
from app.agents.state import RecoveryAgentState
from app.agents.sentinel import sentinel_agent
from app.agents.strategist import strategist_agent
from app.agents.orchestrator import agent_orchestrator

def test_sentinel_risk_scoring():
    state: RecoveryAgentState = {
        "case_id": "test_1",
        "event_id": "evt_1",
        "merchant_id": "m_1",
        "customer_id": "c_1",
        "customer_name": "Test Customer",
        "customer_tier": "ENTERPRISE",
        "amount": 25000.0,
        "currency": "INR",
        "error_code": "BAD_REQUEST_INSUFFICIENT_FUNDS",
        "error_description": "Insufficient funds",
        "retry_count": 2,
        "hours_since_last_contact": 24.0,
        "raw_payload": {},
        "risk_score": None,
        "urgency": None,
        "risk_factors": None,
        "diagnosed_root_cause": None,
        "diagnostic_confidence": None,
        "diagnostic_reasoning": None,
        "candidate_actions": [],
        "selected_action": None,
        "guardrail_approved": None,
        "guardrail_violations": [],
        "guardrail_checks": [],
        "execution_receipt": None,
        "status": "DETECTED",
        "audit_id": None,
        "error_log": []
    }

    result = sentinel_agent.process(state)
    assert result["risk_score"] is not None
    assert result["risk_score"] >= 0.50  # Enterprise + 25k should have high risk
    assert result["urgency"] in ("CRITICAL", "HIGH")

def test_strategist_ranks_actions():
    state: RecoveryAgentState = {
        "case_id": "test_2",
        "event_id": "evt_2",
        "merchant_id": "m_1",
        "customer_id": "c_1",
        "customer_name": "Test Customer",
        "customer_tier": "STANDARD",
        "amount": 1500.0,
        "currency": "INR",
        "error_code": "NETWORK_TIMEOUT",
        "error_description": "Network timeout",
        "retry_count": 0,
        "hours_since_last_contact": 24.0,
        "raw_payload": {},
        "risk_score": 0.4,
        "urgency": "MEDIUM",
        "risk_factors": {},
        "diagnosed_root_cause": "NETWORK_TIMEOUT",
        "diagnostic_confidence": 0.95,
        "diagnostic_reasoning": "Timeout",
        "candidate_actions": [],
        "selected_action": None,
        "guardrail_approved": None,
        "guardrail_violations": [],
        "guardrail_checks": [],
        "execution_receipt": None,
        "status": "DIAGNOSED",
        "audit_id": None,
        "error_log": []
    }

    result = strategist_agent.process(state)
    candidates = result["candidate_actions"]
    assert len(candidates) > 0
    # For NETWORK_TIMEOUT, SMART_RETRY should have highest or near highest EV
    assert any(c["action_type"] == "SMART_RETRY" for c in candidates)

@pytest.mark.asyncio
async def test_full_agent_orchestration_cycle():
    state: RecoveryAgentState = {
        "case_id": "test_3",
        "event_id": "evt_3",
        "merchant_id": "default_merchant",
        "customer_id": "c_1",
        "customer_name": "Test Customer",
        "customer_tier": "STANDARD",
        "amount": 3500.0,
        "currency": "INR",
        "error_code": "GATEWAY_TIMEOUT",
        "error_description": "Bank network timed out",
        "retry_count": 0,
        "hours_since_last_contact": 24.0,
        "raw_payload": {},
        "risk_score": None,
        "urgency": None,
        "risk_factors": None,
        "diagnosed_root_cause": None,
        "diagnostic_confidence": None,
        "diagnostic_reasoning": None,
        "candidate_actions": [],
        "selected_action": None,
        "guardrail_approved": None,
        "guardrail_violations": [],
        "guardrail_checks": [],
        "execution_receipt": None,
        "status": "DETECTED",
        "audit_id": None,
        "error_log": []
    }

    final_state = await agent_orchestrator.run_pipeline(state)
    assert final_state["diagnosed_root_cause"] == "NETWORK_TIMEOUT"
    assert final_state["guardrail_approved"] is True
    assert final_state["status"] in ("IN_RECOVERY", "STRATEGY_FORMULATED")
    assert final_state["audit_id"] is not None
