"""
State definition for the REVIVE Multi-Agent State Machine.
"""

from typing import TypedDict, Any

class RecoveryAgentState(TypedDict):
    case_id: str
    event_id: str
    merchant_id: str
    customer_id: str | None
    customer_name: str | None
    customer_tier: str
    amount: float
    currency: str
    error_code: str | None
    error_description: str | None
    retry_count: int
    hours_since_last_contact: float
    raw_payload: dict[str, Any]

    # Agent outputs
    risk_score: float | None
    urgency: str | None
    risk_factors: dict[str, float] | None

    diagnosed_root_cause: str | None
    diagnostic_confidence: float | None
    diagnostic_reasoning: str | None

    candidate_actions: list[dict[str, Any]]
    selected_action: dict[str, Any] | None

    guardrail_approved: bool | None
    guardrail_violations: list[str]
    guardrail_checks: list[dict[str, Any]]

    execution_receipt: dict[str, Any] | None
    status: str
    audit_id: str | None
    error_log: list[str]
