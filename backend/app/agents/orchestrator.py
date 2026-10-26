"""
REVIVE Multi-Agent Orchestrator
Coordinates Sentinel -> Diagnostician -> Strategist -> Guardrail Gate -> Executor -> Auditor.
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

logger = logging.getLogger("revive.orchestrator")

class AgentOrchestrator:
    def __init__(self, guardrail_engine: GuardrailEngine | None = None):
        self.guardrail_engine = guardrail_engine or GuardrailEngine()

    async def run_pipeline(self, initial_state: RecoveryAgentState) -> RecoveryAgentState:
        """
        Executes the full recovery cycle across all 5 agents and deterministic guardrails.
        """
        state = initial_state

        # 1. Sentinel Triage
        state = sentinel_agent.process(state)

        # 2. Diagnostician Root Cause Analysis
        state = await diagnostician_agent.process(state)

        # 3. Strategist Expected Value Ranking
        state = strategist_agent.process(state)

        # 4. Deterministic Guardrail Evaluation Gate
        # Attempt top candidate actions in rank order until one passes guardrails
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
            # Fallback to safe HUMAN_ESCALATION if all automated interventions fail guardrails
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

        # 5. Executor Governed Dispatch
        state = await executor_agent.process(state)

        # 6. Auditor Immutable Cryptographic Logging
        state = auditor_agent.process(state)

        return state

agent_orchestrator = AgentOrchestrator()
