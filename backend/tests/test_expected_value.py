"""
Unit Tests for the REVIVE Expected Value (E[V]) & Probabilistic Model.
"""

from app.ml.engine import ml_engine

def test_expected_value_monotonicity():
    """Higher recovery probability must yield higher expected value for identical invoice amount."""
    amount = 5000.0
    ev_high, _ = ml_engine.calculate_expected_value(amount=amount, recovery_prob=0.80, action_type="SMART_RETRY")
    ev_low, _ = ml_engine.calculate_expected_value(amount=amount, recovery_prob=0.30, action_type="SMART_RETRY")
    assert ev_high > ev_low

def test_discount_reduces_net_yield():
    """Applying a retention discount slightly reduces net financial yield."""
    amount = 5000.0
    prob = 0.70
    ev_no_disc, _ = ml_engine.calculate_expected_value(amount=amount, recovery_prob=prob, action_type="INCENTIVIZED_OFFER", discount_pct=0.0)
    ev_with_disc, _ = ml_engine.calculate_expected_value(amount=amount, recovery_prob=prob, action_type="INCENTIVIZED_OFFER", discount_pct=10.0)
    assert ev_no_disc > ev_with_disc

def test_fast_classifier_accuracy():
    """Verify deterministic fast path for core error codes."""
    cause1, conf1 = ml_engine.classify_root_cause_fast("BAD_REQUEST_INSUFFICIENT_FUNDS", "low balance")
    assert cause1 == "INSUFFICIENT_FUNDS"
    assert conf1 >= 0.90

    cause2, conf2 = ml_engine.classify_root_cause_fast("GATEWAY_TIMEOUT", "server error 504")
    assert cause2 == "NETWORK_TIMEOUT"
    assert conf2 >= 0.90

    cause3, conf3 = ml_engine.classify_root_cause_fast("INVALID_CARD_EXPIRY", "card expired")
    assert cause3 == "CARD_EXPIRED"
    assert conf3 >= 0.90
