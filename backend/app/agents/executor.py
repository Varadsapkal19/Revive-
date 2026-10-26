"""
Agent 4: Executor (The Governed Dispatcher)
Executes interventions ONLY after deterministic guardrail verification passes.
"""

from typing import Any
from datetime import datetime
from app.razorpay.client import razorpay_client
from app.agents.state import RecoveryAgentState

class ExecutorAgent:
    name = "Executor"

    @staticmethod
    async def process(state: RecoveryAgentState) -> RecoveryAgentState:
        # Absolute safety check: Never execute if guardrail failed
        if not state.get("guardrail_approved", False):
            state["status"] = "GUARDRAIL_BLOCKED"
            state["execution_receipt"] = {
                "status": "BLOCKED",
                "reason": "Policy guardrail violations prevented automated dispatch",
                "violations": state.get("guardrail_violations", [])
            }
            return state

        selected_action = state.get("selected_action") or {}
        action_type = selected_action.get("action_type", "SMART_RETRY")
        amount = state.get("amount", 0.0)
        currency = state.get("currency", "INR")
        discount_pct = selected_action.get("discount_pct", 0.0)
        customer = {
            "name": state.get("customer_name") or "Valued Customer",
            "email": state.get("raw_payload", {}).get("customer_email") or "customer@example.com"
        }

        receipt: dict[str, Any] = {
            "action_type": action_type,
            "dispatched_at": datetime.utcnow().isoformat(),
            "status": "SUCCESS"
        }

        if "LINK" in action_type or action_type in ("METHOD_SWITCH_UPI", "INCENTIVIZED_OFFER"):
            # Call Razorpay to generate live/mock payment link
            plink_res = await razorpay_client.create_payment_link(
                amount=amount,
                currency=currency,
                customer=customer,
                discount_pct=discount_pct
            )
            receipt["razorpay_payment_link"] = plink_res.get("short_url")
            receipt["payment_link_id"] = plink_res.get("id")
            receipt["channel"] = selected_action.get("channel", "EMAIL")
            receipt["mock"] = plink_res.get("mock", True)
        elif action_type == "SMART_RETRY":
            delay = selected_action.get("schedule_delay_hours", 12)
            receipt["scheduled_retry_delay_hours"] = delay
            receipt["target_retry_window"] = f"+{delay}h Bank Settlement Window"
        elif action_type == "HUMAN_ESCALATION":
            receipt["escalation_team"] = "Enterprise Tier FinOps"
            receipt["priority"] = "P1_URGENT"

        state["execution_receipt"] = receipt
        state["status"] = "IN_RECOVERY"
        return state

executor_agent = ExecutorAgent()
