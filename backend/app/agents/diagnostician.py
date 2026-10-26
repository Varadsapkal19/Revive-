"""
Agent 2: Diagnostician (Forensic Root Cause Analyst)
Hybrid diagnostic engine: fast-path deterministic classifier + contextual LLM reasoning fallback.
"""

import httpx
import logging
from app.config import settings
from app.ml.engine import ml_engine
from app.agents.state import RecoveryAgentState

logger = logging.getLogger("revive.diagnostician")

class DiagnosticianAgent:
    name = "Diagnostician"

    @staticmethod
    async def process(state: RecoveryAgentState) -> RecoveryAgentState:
        error_code = state.get("error_code")
        error_description = state.get("error_description")
        customer_tier = state.get("customer_tier", "STANDARD")
        amount = state.get("amount", 0.0)

        # Step 1: Fast deterministic classification
        root_cause, confidence = ml_engine.classify_root_cause_fast(error_code, error_description)
        reasoning = (
            f"Diagnosed as {root_cause} with {confidence*100:.0f}% confidence based on "
            f"gateway error code '{error_code}' and contextual signals."
        )

        # Step 2: Contextual LLM reasoning (if enabled, reachable, and ambiguity exists)
        if settings.ENABLE_LLM_REASONING and confidence < 0.95:
            try:
                async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
                    prompt = (
                        f"You are a FinOps payment failure analyst. Analyze this failure:\n"
                        f"- Amount: {amount}\n"
                        f"- Tier: {customer_tier}\n"
                        f"- Error Code: {error_code}\n"
                        f"- Error Description: {error_description}\n"
                        f"Provide a 1-sentence diagnostic root cause summary."
                    )
                    resp = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "prompt": prompt,
                            "stream": False,
                            "options": {"num_predict": 60, "temperature": 0.2}
                        }
                    )
                    if resp.status_code == 200:
                        llm_out = resp.json().get("response", "").strip()
                        if llm_out:
                            reasoning = f"[Cognitive LLM]: {llm_out}"
                            confidence = min(0.98, confidence + 0.05)
            except Exception as e:
                logger.debug(f"Ollama reasoning skipped/offline ({e}); using deterministic diagnosis.")

        state["diagnosed_root_cause"] = root_cause
        state["diagnostic_confidence"] = confidence
        state["diagnostic_reasoning"] = reasoning
        state["status"] = "DIAGNOSED"
        return state

diagnostician_agent = DiagnosticianAgent()
