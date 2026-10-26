"""
Agent 3: Strategist (Expected Financial Value Optimizer)
Evaluates action space, calculates Expected Value (E[V]), and ranks candidate recovery strategies.
"""

from typing import Any
from app.ml.engine import ml_engine, ACTION_METADATA
from app.agents.state import RecoveryAgentState

class StrategistAgent:
    name = "Strategist"

    @staticmethod
    def process(state: RecoveryAgentState) -> RecoveryAgentState:
        root_cause = state.get("diagnosed_root_cause") or "INSUFFICIENT_FUNDS"
        amount = state.get("amount", 0.0)
        customer_tier = state.get("customer_tier", "STANDARD")
        retry_count = state.get("retry_count", 0)

        candidate_actions: list[dict[str, Any]] = []

        # Available action catalog
        viable_actions = [
            ("SMART_RETRY", 0.0, "GATEWAY", 12),
            ("PAYMENT_LINK_WHATSAPP", 0.0, "WHATSAPP", 0),
            ("METHOD_SWITCH_UPI", 0.0, "WHATSAPP", 0),
            ("PAYMENT_LINK_EMAIL", 0.0, "EMAIL", 0),
            ("INCENTIVIZED_OFFER", 5.0, "EMAIL", 0),
            ("HUMAN_ESCALATION", 0.0, "INTERNAL", 0)
        ]

        for action_type, discount_pct, channel, delay in viable_actions:
            prob = ml_engine.predict_recovery_probability(
                action_type=action_type,
                root_cause=root_cause,
                amount=amount,
                customer_tier=customer_tier,
                retry_count=retry_count
            )
            ev, cost = ml_engine.calculate_expected_value(
                amount=amount,
                recovery_prob=prob,
                action_type=action_type,
                discount_pct=discount_pct
            )

            rationale = (
                f"P(Rec)={prob*100:.1f}%, Expected Yield = ₹{ev:.2f} "
                f"(Intervention Cost: ₹{cost:.2f})"
            )

            candidate_actions.append({
                "action_type": action_type,
                "expected_value": ev,
                "recovery_probability": prob,
                "estimated_cost": cost,
                "discount_pct": discount_pct,
                "channel": channel,
                "schedule_delay_hours": delay,
                "rationale": rationale
            })

        # Rank candidates strictly by descending Expected Value
        candidate_actions.sort(key=lambda a: a["expected_value"], reverse=True)

        state["candidate_actions"] = candidate_actions
        state["selected_action"] = candidate_actions[0] if candidate_actions else None
        state["status"] = "STRATEGY_FORMULATED"
        return state

strategist_agent = StrategistAgent()
