"""
Agent 1: Sentinel (The Watchdog & Triage Specialist)
Ingests failure event, extracts contextual features, and scores revenue risk.
"""

from typing import Any
from app.agents.state import RecoveryAgentState

class SentinelAgent:
    name = "Sentinel"

    @staticmethod
    def process(state: RecoveryAgentState) -> RecoveryAgentState:
        amount = state.get("amount", 0.0)
        customer_tier = state.get("customer_tier", "STANDARD")
        retry_count = state.get("retry_count", 0)
        error_code = str(state.get("error_code") or "").upper()

        # Multi-factor risk calculation
        # 1. Amount Factor: higher amount = higher financial impact
        amount_factor = min(1.0, amount / 10000.0)

        # 2. Tier Factor: Enterprise accounts have high retention sensitivity
        tier_weight = {
            "ENTERPRISE": 0.90,
            "PREMIUM": 0.60,
            "STANDARD": 0.35
        }.get(customer_tier, 0.35)

        # 3. Retry Exhaustion Factor
        retry_factor = min(1.0, retry_count / 3.0)

        # 4. Error Severity Factor
        if any(h in error_code for h in ["FRAUD", "STOLEN", "CLOSED"]):
            error_severity = 0.95
        elif any(s in error_code for s in ["EXPIRED", "AUTH", "3DS"]):
            error_severity = 0.65
        else:
            error_severity = 0.40

        # Weighted aggregate risk score [0.0 - 1.0]
        risk_score = round(
            (0.35 * amount_factor) +
            (0.25 * tier_weight) +
            (0.20 * retry_factor) +
            (0.20 * error_severity),
            3
        )

        # Assign urgency
        if risk_score >= 0.75:
            urgency = "CRITICAL"
        elif risk_score >= 0.50:
            urgency = "HIGH"
        elif risk_score >= 0.25:
            urgency = "MEDIUM"
        else:
            urgency = "LOW"

        state["risk_score"] = risk_score
        state["urgency"] = urgency
        state["risk_factors"] = {
            "amount_factor": round(amount_factor, 2),
            "tier_weight": round(tier_weight, 2),
            "retry_factor": round(retry_factor, 2),
            "error_severity": round(error_severity, 2)
        }
        state["status"] = "TRIAGED"
        return state

sentinel_agent = SentinelAgent()
