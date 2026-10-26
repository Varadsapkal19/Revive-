"""
Unit Tests for the REVIVE Deterministic Guardrail Engine
Verifies absolute compliance with non-negotiable policy invariants.
"""

import pytest
from app.policy.guardrail_engine import GuardrailEngine, PolicyViolationException

def test_guardrail_blocks_excessive_discount():
    """Verify that any discount above merchant ceiling (10%) is strictly blocked."""
    engine = GuardrailEngine(max_discount_pct=10.0)
    action = {
        "action_type": "INCENTIVIZED_OFFER",
        "discount_pct": 15.0,  # Violates 10% cap
        "channel": "EMAIL"
    }
    result = engine.evaluate_action(action)
    assert not result.approved
    assert any("exceeds merchant ceiling" in v for v in result.violations)

def test_guardrail_allows_compliant_discount():
    """Verify that compliant discounts (<= 10%) pass."""
    engine = GuardrailEngine(max_discount_pct=10.0)
    action = {
        "action_type": "INCENTIVIZED_OFFER",
        "discount_pct": 5.0,
        "channel": "EMAIL"
    }
    result = engine.evaluate_action(action)
    assert result.approved

def test_guardrail_blocks_retries_exceeding_limit():
    """Verify that retries are blocked when max retries ceiling is reached."""
    engine = GuardrailEngine(max_retries=3)
    action = {"action_type": "SMART_RETRY", "discount_pct": 0.0}
    context = {"retry_count": 3}  # Already at limit
    result = engine.evaluate_action(action, context)
    assert not result.approved
    assert any("reached max retry attempts" in v for v in result.violations)

def test_guardrail_enforces_cooldown_period():
    """Verify customer contact cooldown (e.g., 8 hours)."""
    engine = GuardrailEngine(cooldown_hours=8)
    action = {"action_type": "PAYMENT_LINK_WHATSAPP", "channel": "WHATSAPP"}
    context = {"hours_since_last_contact": 3.5}  # Too soon
    result = engine.evaluate_action(action, context)
    assert not result.approved
    assert any("cooldown requires" in v for v in result.violations)

def test_guardrail_blocks_automated_retry_on_hard_declines():
    """Verify that fraud alerts or stolen cards never trigger automated bank retries."""
    engine = GuardrailEngine()
    action = {"action_type": "SMART_RETRY", "discount_pct": 0.0}
    context = {"root_cause": "FRAUD_ALERT"}
    result = engine.evaluate_action(action, context)
    assert not result.approved
    assert any("Hard decline cause" in v for v in result.violations)

def test_validate_action_raises_exception():
    """Verify that validate_action raises PolicyViolationException when invalid."""
    engine = GuardrailEngine(max_discount_pct=10.0)
    action = {"action_type": "INCENTIVIZED_OFFER", "discount_pct": 25.0}
    with pytest.raises(PolicyViolationException):
        engine.validate_action(action)
