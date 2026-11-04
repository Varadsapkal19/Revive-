"""
Agent 4: Executor (The Governed Dispatcher)
Executes interventions ONLY after independent cryptographic approval token verification.
Enforces Section 8 AI Agent Security.
"""

from typing import Any
from datetime import datetime
import logging
from app.razorpay.client import razorpay_client
from app.agents.state import RecoveryAgentState
from app.security.approval_token import verify_execution_approval, ApprovalValidationError

logger = logging.getLogger("revive.agent.executor")

class ExecutorAgent:
    name = "Executor"

    @staticmethod
    async def process(state: RecoveryAgentState) -> RecoveryAgentState:
        # 1. Absolute safety check: Never execute if guardrail failed
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
        merchant_id = state.get("merchant_id") or "default_merchant"
        case_id = state.get("case_id") or "unknown_case"
        approval_token = state.get("execution_approval_token")
        action_payload = state.get("action_payload") or {
            "amount": state.get("amount", 0.0),
            "discount_pct": selected_action.get("discount_pct", 0.0),
            "channel": selected_action.get("channel", "EMAIL")
        }

        # 2. Section 8 Cryptographic Approval Verification
        try:
            if not approval_token:
                raise ApprovalValidationError("Missing execution approval token.")
            
            verify_execution_approval(
                approval_token=approval_token,
                expected_merchant_id=merchant_id,
                expected_case_id=case_id,
                executed_action_type=action_type,
                executed_action_payload=action_payload
            )
        except ApprovalValidationError as e:
            logger.error(f"[SECURITY VETO] Executor rejected action due to approval verification failure: {e}")
            state["status"] = "APPROVAL_VERIFICATION_FAILED"
            state["execution_receipt"] = {
                "status": "VETOED",
                "reason": f"Cryptographic execution approval validation failed: {str(e)}"
            }
            return state

        # 3. Governed Financial Dispatch
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
            "status": "SUCCESS",
            "approval_verified": True
        }

        if "LINK" in action_type or action_type in ("METHOD_SWITCH_UPI", "INCENTIVIZED_OFFER"):
            # Call payment client to generate payment link with discount cap applied
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
