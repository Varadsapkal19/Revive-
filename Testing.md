# Testing & Evaluation Strategy — REVIVE
## Verification Framework & The REVIVE-Bench Evaluation Suite

**Version:** 1.0.0  
**Test Coverage Target:** $\ge 85\%$ backend line coverage, $100\%$ guardrail invariant coverage  

---

## 1. Testing Pyramid Overview

REVIVE uses a multi-layered verification strategy designed for autonomous financial operations:

```
                   ▲
                  / \
                 /   \
                / E2E \       Level 4: REVIVE-Bench (10,000 Synthetic Cases)
               /-------\
              / Integr. \     Level 3: Webhook & FastAPI Endpoint Tests (TestClient)
             /-----------\
            / Multi-Agent \   Level 2: StateGraph Transitions & Guardrail Invariants
           /---------------\
          /   Unit Tests    \ Level 1: Deterministic Math, Risk Formulas & Parsers
         /-------------------\
```

---

## 2. Unit & Guardrail Invariant Testing

### 2.1 Guardrail Policy Invariant Suite
Every merchant policy invariant must be tested against intentional boundary and adversarial violations:

```python
import pytest
from app.policy.guardrail_engine import GuardrailEngine, PolicyViolationException

def test_guardrail_blocks_excessive_discount():
    engine = GuardrailEngine(max_discount_pct=10.0, max_retries=3)
    candidate_action = {
        "action_type": "INCENTIVIZED_OFFER",
        "discount_pct": 15.0,  # Exceeds 10%
        "target_channel": "EMAIL"
    }
    
    with pytest.raises(PolicyViolationException) as exc_info:
        engine.validate_action(candidate_action, previous_attempts=1)
    
    assert "exceeds maximum allowed threshold" in str(exc_info.value)

def test_guardrail_blocks_retries_exceeding_limit():
    engine = GuardrailEngine(max_discount_pct=10.0, max_retries=3)
    candidate_action = {
        "action_type": "SMART_RETRY",
        "discount_pct": 0.0
    }
    
    with pytest.raises(PolicyViolationException):
        engine.validate_action(candidate_action, previous_attempts=3)
```

### 2.2 Expected Value Formula Unit Tests
- Verify mathematical properties: when intervention cost exceeds recoverable value, action score is penalized.
- Verify monotonicity: higher recovery probability strictly produces higher expected value for identical invoice amounts.

---

## 3. Multi-Agent & State Transition Testing

- **Mock LLM Provider:** Agent tests run with a deterministic `MockOllamaClient` returning pre-configured diagnostic responses, guaranteeing zero network dependencies and sub-second execution in CI.
- **Graceful Fallback Test:** Simulate connection drops to port 11434; verify that the system gracefully falls back to deterministic classification without raising unhandled exceptions.

---

## 4. Integration & Webhook Verification Testing

- **FastAPI TestClient:** Validate all endpoints with synthetic payloads.
- **HMAC Webhook Invalidation Test:** Verify that altered payloads or mismatched signatures return `401 Unauthorized`.
- **Idempotency Replay Test:** Submit the same `event_id` 5 times in parallel; verify that only 1 recovery case is created and 4 requests return cached status `200 OK`.

---

## 5. REVIVE-Bench: The ML & System Benchmark

To evaluate performance objectively, REVIVE includes a dedicated benchmark suite: `REVIVE-Bench`.

### 5.1 Dataset Characteristics
- **Total Cases:** 10,000 synthetic payment failure events.
- **Split:** 70% Train / 15% Validation / 15% Held-Out Test Set.
- **Error Distribution:**
  - 40% Insufficient Funds (Soft Decline)
  - 25% Gateway Timeout / Bank Outage (Transient)
  - 15% Authentication / OTP Drop-off (Frictional)
  - 10% Expired Card / Invalid Mandate (Structural)
  - 10% Fraud Risk / Hard Decline (Strict Lockout)

### 5.2 Benchmark Evaluation Metrics & Thresholds

| Metric | Target | Formula / Description |
|---|---|---|
| **Root Cause Classification Accuracy** | $\ge 92.0\%$ | Precision/Recall across all 7 standardized diagnostic classes |
| **Guardrail Violation Rate** | **$0.00\%$** | Zero approved actions violating merchant rules ($100\%$ compliance) |
| **Model Calibration (Brier Score)** | $\le 0.12$ | $\frac{1}{N}\sum_{t=1}^N (f_t - o_t)^2$ measuring probability calibration |
| **ROC-AUC** | $\ge 0.88$ | Distinguishing recoverable vs. non-recoverable churn |
| **Recovery Rate Uplift vs. Baseline** | $\ge +30\%$ | Counterfactual delta against naive 24h static retries |

---

## 6. Execution Commands

### Run Backend Unit & Integration Tests:
```bash
pytest backend/tests -v --cov=app --cov-report=term-missing
```

### Run Guardrail Invariant Check:
```bash
pytest backend/tests/test_guardrails.py -v
```

### Run REVIVE-Bench Benchmark:
```bash
python ml/evaluation/run_benchmark.py --dataset ml/datasets/revive_bench_10k.json
```

### Run Frontend Unit Tests:
```bash
cd frontend && npm run test
```
