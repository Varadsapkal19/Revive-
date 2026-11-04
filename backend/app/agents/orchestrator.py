"""
REVIVE Multi-Agent Orchestrator
Coordinates Sentinel -> Diagnostician -> Strategist -> Guardrail Gate -> Cryptographic Approval -> Executor -> Auditor.
Enforces Section 8 AI Agent Security: The deterministic policy engine is the sole approval authority.
"""

import logging
from typing import Any
from app.agents.state import RecoveryAgentState
from app.agents.sentinel import sentinel_agent
from app.agents.diagnostician import diagnostician_agent
from app.agents.strategist import strategist_agent
from app.agents.executor import executor_agent
from app.agents.auditor import auditor_agent
from app.policy.guardrail_engine import GuardrailEngine
from app.security.approval_token import issue_execution_approval

logger = logging.getLogger("revive.orchestrator")

class AgentOrchestrator:
    def __init__(self, guardrail_engine: GuardrailEngine | None = None):
        self.guardrail_engine = guardrail_engine or GuardrailEngine()

    async def run_pipeline(self, initial_state: RecoveryAgentState) -> RecoveryAgentState:
        """
        Executes the full recovery cycle across all 5 agents and deterministic guardrails.
        """
        state = initial_state

        # 1. Sentinel Triage (Anomaly detection & event hygiene)
        state = sentinel_agent.process(state)

        # 2. Diagnostician Root Cause Analysis (Sanitized LLM context)
        state = await diagnostician_agent.process(state)

        # 3. Strategist Expected Value Ranking (Proposal generation only)
        state = strategist_agent.process(state)

        # 4. Deterministic Guardrail Evaluation Gate
        # Top candidate actions evaluated in rank order until one passes deterministic invariants
        candidates = state.get("candidate_actions", [])
        chosen_action = None
        guardrail_result = None

        context = {
            "retry_count": state.get("retry_count", 0),
            "hours_since_last_contact": state.get("hours_since_last_contact", 24.0),
            "root_cause": state.get("diagnosed_root_cause", ""),
            "amount": state.get("amount", 0.0),
            "customer_tier": state.get("customer_tier", "STANDARD")
        }

        for candidate in candidates:
            eval_res = self.guardrail_engine.evaluate_action(candidate, context)
            if eval_res.approved:
                chosen_action = candidate
                guardrail_result = eval_res
                break
            else:
                logger.info(
                    f"Candidate action '{candidate.get('action_type')}' vetoed by guardrails: "
                    f"{eval_res.violations}"
                )

        if chosen_action is None:
            # Safe deterministic fallback if all automated actions fail guardrails
            fallback = {
                "action_type": "HUMAN_ESCALATION",
                "expected_value": 0.0,
                "recovery_probability": 0.35,
                "estimated_cost": 50.0,
                "discount_pct": 0.0,
                "channel": "INTERNAL",
                "schedule_delay_hours": 0,
                "rationale": "Automated actions vetoed by merchant policy; routing for manual FinOps review."
            }
            chosen_action = fallback
            guardrail_result = self.guardrail_engine.evaluate_action(fallback, context)

        state["selected_action"] = chosen_action
        state["guardrail_approved"] = guardrail_result.approved if guardrail_result else False
        state["guardrail_violations"] = guardrail_result.violations if guardrail_result else []
        state["guardrail_checks"] = guardrail_result.checked_rules if guardrail_result else []

        # 5. Issue Cryptographic Execution Approval Token (Section 8)
        # Binds (merchant_id, case_id, action_type, payload_hash, policy_version, nonce, expires_at)
        if state["guardrail_approved"] and chosen_action:
            action_payload = {
                "amount": state.get("amount", 0.0),
                "discount_pct": chosen_action.get("discount_pct", 0.0),
                "channel": chosen_action.get("channel", "EMAIL")
            }
            approval_token = issue_execution_approval(
                merchant_id=state.get("merchant_id") or "default_merchant",
                case_id=state.get("case_id") or "unknown_case",
                action_type=chosen_action.get("action_type", "HUMAN_ESCALATION"),
                action_payload=action_payload,
                policy_version=1
            )
            state["execution_approval_token"] = approval_token
            state["action_payload"] = action_payload
        else:
            state["execution_approval_token"] = None

        # 6. Executor Governed Dispatch (Verifies Cryptographic Approval)
        state = await executor_agent.process(state)

        # 7. Auditor Immutable Cryptographic Logging (Hash chaining)
        state = auditor_agent.process(state)

        return state

agent_orchestrator = AgentOrchestrator()
