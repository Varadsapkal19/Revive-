"""
Agent 2: Diagnostician (Forensic Root Cause Analyst)
Hybrid diagnostic engine: fast-path deterministic classifier + contextual LLM reasoning fallback.
Includes strict prompt injection defense and input sanitization (Section 8 AI Security).
"""

import re
import httpx
import logging
from app.config import settings
from app.ml.engine import ml_engine
from app.agents.state import RecoveryAgentState

logger = logging.getLogger("revive.diagnostician")

# Prompt injection filters
INJECTION_PATTERNS = [
    r"ignore\s+all\s+previous\s+instructions",
    r"disregard\s+all\s+prior",
    r"system\s*:",
    r"<\|im_start\|>",
    r"<\|im_end\|>",
    r"\[inst\]",
    r"admin\s+override",
    r"grant\s+discount",
    r"bypass\s+guardrails"
]

def sanitize_untrusted_text(text: str | None, max_len: int = 200) -> str:
    """Sanitizes customer-controlled text before passing into model context."""
    if not text:
        return ""
    clean = text.strip()
    # Mask card numbers (13-19 digits)
    clean = re.sub(r"\b(?:\d[ -]*?){13,19}\b", "[CARD_REDACTED]", clean)
    # Filter prompt injection phrases
    for pattern in INJECTION_PATTERNS:
        clean = re.sub(pattern, "[UNTRUSTED_CONTENT_FILTERED]", clean, flags=re.IGNORECASE)
    # Limit length
    return clean[:max_len]

class DiagnosticianAgent:
    name = "Diagnostician"

    @staticmethod
    async def process(state: RecoveryAgentState) -> RecoveryAgentState:
        error_code = sanitize_untrusted_text(state.get("error_code"), 50)
        error_description = sanitize_untrusted_text(state.get("error_description"), 150)
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
                        f"Context: FinOps payment failure diagnostic.\n"
                        f"Amount: {float(amount)}\n"
                        f"Tier: {customer_tier}\n"
                        f"Error Code: {error_code}\n"
                        f"Error Detail: {error_description}\n"
                        f"Provide a single factual root cause sentence."
                    )
                    resp = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "prompt": prompt,
                            "stream": False,
                            "options": {"num_predict": 45, "temperature": 0.1}
                        }
                    )
                    if resp.status_code == 200:
                        llm_out = resp.json().get("response", "").strip()
                        # Sanitize LLM output
                        if llm_out and not any(re.search(pat, llm_out, re.I) for pat in INJECTION_PATTERNS):
                            reasoning = f"[Cognitive LLM]: {llm_out[:250]}"
                            confidence = min(0.98, confidence + 0.05)
            except Exception as e:
                logger.debug(f"Ollama reasoning skipped/offline ({e}); using deterministic diagnosis.")

        state["diagnosed_root_cause"] = root_cause
        state["diagnostic_confidence"] = confidence
        state["diagnostic_reasoning"] = reasoning
        state["status"] = "DIAGNOSED"
        return state

diagnostician_agent = DiagnosticianAgent()
