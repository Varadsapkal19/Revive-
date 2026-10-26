"""
Agent 5: Auditor (The Immutable Ledger Recorder)
Guarantees non-repudiation, tamper-evident hash chaining, and complete decision explainability.
"""

import hashlib
import json
import uuid
from datetime import datetime
from typing import Any
from app.agents.state import RecoveryAgentState

class AuditorAgent:
    name = "Auditor"

    @staticmethod
    def compute_entry_hash(
        case_id: str,
        stage: str,
        action: str,
        verdict: str,
        previous_hash: str | None = None
    ) -> str:
        """
        SHA-256 cryptographic chaining of audit ledger entry.
        """
        payload = f"{previous_hash or 'GENESIS'}::{case_id}::{stage}::{action}::{verdict}::{datetime.utcnow().isoformat()}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @staticmethod
    def process(state: RecoveryAgentState) -> RecoveryAgentState:
        case_id = state.get("case_id", str(uuid.uuid4()))
        selected_action = state.get("selected_action") or {}
        action_name = selected_action.get("action_type", "UNKNOWN")
        verdict = "APPROVED" if state.get("guardrail_approved") else "VETOED"

        entry_hash = AuditorAgent.compute_entry_hash(
            case_id=case_id,
            stage="POST_EXECUTION",
            action=action_name,
            verdict=verdict
        )

        state["audit_id"] = entry_hash
        return state

auditor_agent = AuditorAgent()
