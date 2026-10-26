# Agent Architecture Specification — REVIVE Multi-Agent System
## Autonomous Revenue Recovery Decision Engine

**Version:** 1.0.0  
**Framework:** LangGraph / StateGraph Orchestration  
**Inference Engine:** Hybrid (Ollama Qwen2.5/Llama3 + Rule-Based Fast-Path Fallback)  

---

## 1. System Philosophy: Hybrid Deterministic & Cognitive AI

REVIVE rejects the unconstrained "black-box agent" paradigm for financial systems. In payment recovery:
- **Hallucinations cost actual capital** (e.g., unauthorized 50% discounts or duplicate bank debits).
- **Compliance is non-negotiable** (e.g., maximum contact frequency and cooldown intervals).

Therefore, REVIVE implements a **Constrained Multi-Agent State Machine**:
1. Agents propose and reason about hypotheses.
2. An unyielding **Deterministic Guardrail Engine** holds absolute veto power over execution.
3. Every step in the decision graph is auditable, idempotent, and stateful.

---

## 2. Multi-Agent Topology & State Graph

```
                                  [ Revenue Event Ingested ]
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │  Agent 1: Sentinel │
                                    │ (Risk & Urgency)  │
                                    └─────────┬─────────┘
                                              │ Risk Score >= Threshold
                                              ▼
                                 ┌─────────────────────────┐
                                 │  Agent 2: Diagnostician │
                                 │  (Hybrid Root Cause)    │
                                 └────────────┬────────────┘
                                              │ Root Cause + Confidence
                                              ▼
                                   ┌────────────────────┐
                                   │ Agent 3: Strategist│
                                   │ (Expected Value)   │
                                   └──────────┬─────────┘
                                              │ Candidate Actions Ranked
                                              ▼
                                  ┌───────────────────────┐
                         No       │ Deterministic Policy  │
             ┌────────────────────┤   Guardrail Filter    │
             │                    └───────────┬───────────┘
             ▼                                │ Approved Action
     [ Reject / Escalate ]                    ▼
             │                     ┌────────────────────┐
             │                     │  Agent 4: Executor │
             │                     │ (Razorpay/Channel) │
             │                     └──────────┬─────────┘
             │                                │ Execution Result
             └───────────────────────┬────────┘
                                     ▼
                           ┌───────────────────┐
                           │  Agent 5: Auditor │
                           │(Immutable Ledger) │
                           └───────────────────┘
```

---

## 3. Agent Specifications

### Agent 1: `Sentinel` (The Watchdog & Triage Specialist)
- **Role:** Real-time event consumption, feature hydration, and instantaneous risk triage.
- **Inputs:** `RawPaymentEvent`, historical customer profile, subscription status.
- **Outputs:** `RiskAssessment` containing:
  - `risk_score` $\in [0.0, 1.0]$: Quantifies urgency and likelihood of permanent churn.
  - `revenue_at_risk`: Normalized monetary value in INR / USD.
  - `urgency_tier`: `CRITICAL` (Grace period $< 24\text{h}$ or high LTV), `HIGH`, `MEDIUM`, `LOW`.
- **Logic:**
  $$Risk = w_1 \cdot \text{FailureSeverity} + w_2 \cdot \text{CustomerLTVScore} + w_3 \cdot \text{ChurnProbability} + w_4 \cdot \text{RecencyWeight}$$
  If $Risk < 0.20$ and error is transient network blip, marks for automatic zero-friction silent background retry. Otherwise, routes to Diagnostician.

---

### Agent 2: `Diagnostician` (Root Cause Investigator)
- **Role:** Deep forensic analysis of failure context.
- **Inference Mode:**
  - *Tier 1 (Instant Deterministic Classifier):* Evaluates Razorpay `error_code`, `error_source`, and `error_step`. If code matches unequivocal patterns (e.g., `GATEWAY_TIMEOUT`, `BAD_REQUEST_AUTHENTICATION`), assigns category with 0.99 confidence.
  - *Tier 2 (Cognitive LLM Evaluator via Ollama):* If the failure reason is ambiguous (e.g., `PAYMENT_FAILED_GENERIC`, recurring mandate halts), prompts local LLM with transaction history, customer tenure, past failure patterns, and device info.
- **Output:** `DiagnosticReport`
  - `root_cause`: `INSUFFICIENT_FUNDS` | `NETWORK_TIMEOUT` | `CARD_EXPIRED` | `AUTHENTICATION_FAILED` | `GATEWAY_DOWNTIME` | `FRAUD_ALERT` | `TECHNICAL_GLITCH`
  - `confidence`: Confidence score $[0.0, 1.0]$
  - `reasoning_summary`: Plain-text explanation formatted for FinOps operators.

---

### Agent 3: `Strategist` (Expected Value Optimizer)
- **Role:** Evaluates action alternatives, estimates recovery likelihood, and ranks strategies.
- **Action Search Space:**
  1. `SMART_RETRY`: Schedule automatic gateway retry at peak liquidity window (e.g., salary days 1st/5th of month or 08:30 AM bank clearing).
  2. `PAYMENT_LINK_WHATSAPP`: Issue personalized interactive Razorpay payment link with deep-link UPI options.
  3. `PAYMENT_LINK_EMAIL`: Send branded payment update notification with zero friction.
  4. `METHOD_SWITCH_UPI`: Prompt customer directly to swap expired mandate/card to instant UPI auto-debit.
  5. `INCENTIVIZED_OFFER`: Apply minimal retention discount ($\le 10\%$) if churn risk is acute and LTV justifies cost.
  6. `HUMAN_ESCALATION`: Flag account for dedicated account executive outreach.
- **Decision Formula:**
  $$\mathbb{E}[\text{Action}] = P(\text{Success} \mid \text{Action}, \text{Cause}, \text{Customer}) \times \text{InvoiceAmount} - \text{DirectCost}(\text{Action}) - \text{FrictionCost}$$
- **Output:** Ranked list of `ActionCandidate` objects with mathematical rationale.

---

### Agent 4: `Executor` (The Governed Dispatcher)
- **Role:** Executes approved interventions through the external integration layer.
- **Critical Prerequisite:** *Cannot execute any action without cryptographic/boolean approval token from Policy Guardrail Engine.*
- **Capabilities:**
  - Calls Razorpay API to generate live payment links (`razorpay.payment_link.create`).
  - Dispatches notifications via mock/real SMS, WhatsApp, and Email gateways.
  - Enqueues delayed background retry jobs in Redis task queue.
- **Output:** `ExecutionReceipt` with payload, third-party transaction reference, latency, and status (`SUCCESS`, `PENDING`, `THROTTLED`).

---

### Agent 5: `Auditor` (The Immutable Ledger Recorder)
- **Role:** Ensures complete explainability, transparency, and traceability for compliance and analytics.
- **Operations:**
  - Persists full execution telemetry to `audit_logs` and `recovery_cases` tables.
  - Records counterfactual choices: logs which actions were considered, why lower-ranked ones were rejected, and which guardrails were evaluated.
  - Updates live dashboard metrics in Redis cache (`recovered_revenue`, `active_cases`, `win_rate`).

---

## 4. State Graph Definition (LangGraph Implementation)

```python
class RecoveryState(TypedDict):
    event_id: str
    merchant_id: str
    customer_id: str
    amount: float
    currency: str
    raw_error: dict
    risk_assessment: dict | None
    diagnostic_report: dict | None
    candidate_actions: list[dict]
    selected_action: dict | None
    guardrail_verdict: dict | None
    execution_receipt: dict | None
    audit_id: str | None
    error: str | None
```

### Graph Execution Nodes
1. `node_sentinel`: Assesses risk score; routes to `node_diagnostician` or short-circuits low-risk events.
2. `node_diagnostician`: Computes root cause via rule tree or Ollama LLM prompt.
3. `node_strategist`: Computes Expected Value for each viable intervention.
4. `node_guardrail_check`: Pure deterministic function evaluating merchant policies. If passes, routes to `node_executor`; if fails, backtracks to next highest candidate action or routes to `node_human_fallback`.
5. `node_executor`: Dispatches action via Razorpay client or Redis scheduler.
6. `node_auditor`: Saves immutable state trace and triggers WebSocket/SSE updates to Next.js frontend.

---

## 5. Graceful Degradation & Fallback Strategy

REVIVE guarantees **100% operational availability** regardless of local LLM environment status:

| Dependency State | Mode | Behavior |
|---|---|---|
| **Ollama Active + GPU** | Full Cognitive Mode | LLM performs nuanced contextual diagnostics and generates personalized communication copy. |
| **Ollama Active + CPU** | Standard Cognitive Mode | LLM runs with reduced token window ($256$ max tokens) for fast sub-second classification. |
| **Ollama Offline / Unreachable** | Deterministic Fallback Mode | Instantaneous fallback to regex bank error mapping + deterministic rule scoring. Zero errors thrown. UI reflects `Engine: Rule-Based Fallback`. |

---

## 6. Prompt Engineering & Guardrail Templates

### Diagnostician System Prompt:
```text
You are REVIVE-Diagnostician, an expert FinOps payment failure investigator.
Analyze the provided payment transaction metadata and determine the root cause of failure.
Output STRICT JSON matching the diagnostic schema. Do not include markdown codeblocks or conversational filler.
Fields required: root_cause, confidence (0.0-1.0), reasoning (1-2 sentences).
```

### Strategist System Prompt:
```text
You are REVIVE-Strategist. Based on the diagnosed root cause and customer context, rank recovery strategies by expected financial recovery rate.
You MUST respect merchant constraints: Max discount <= 10%, Maximum 3 retries.
Output STRICT JSON matching the CandidateActions array schema.
```
