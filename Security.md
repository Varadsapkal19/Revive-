# Security Architecture & Threat Model — REVIVE
## Zero-Trust Guardrails & Financial Integrity Specification

**Version:** 1.0.0  
**Classification:** Financial Systems Security Standard  

---

## 1. Threat Modeling in Autonomous FinTech

Autonomous financial systems introduce novel attack surfaces beyond standard web applications. REVIVE addresses five primary attack vectors:

| Threat Vector | Description | Risk | Mitigation Strategy |
|---|---|---|---|
| **Prompt Injection / Agent Manipulation** | Adversary attempts to manipulate LLM diagnostician or strategist to grant unauthorized discounts or cancel charges. | Critical | **Hard Deterministic Guardrail Isolation:** LLMs cannot execute actions directly. All actions pass through a pure mathematical code barrier that limits discounts to $\le 10\%$. |
| **Webhook Spoofing & Replay** | Attacker simulates `payment.failed` or `order.paid` webhooks to trigger erroneous workflows. | High | **HMAC-SHA256 Signature Verification:** Every incoming Razorpay payload is cryptographically validated using the merchant's webhook secret before processing. |
| **PII & Cardholder Data Exposure** | Accidental logging or LLM transmission of customer PANs, CVVs, or unmasked credentials. | High | **Strict Payload Sanitization:** Card numbers and sensitive identifiers are masked at the network perimeter before entering application memory or agent context. |
| **Idempotency & Double Debit / Spam** | Network retries cause multiple payment links or repeated messages to the end user. | Medium | **Distributed Redis Idempotency Keys:** Every event is assigned a unique idempotency hash based on `event_id + merchant_id + timestamp`. |
| **Audit Ledger Tampering** | Malicious or rogue actors attempt to alter decision history to conceal errors. | High | **Append-Only Hash-Chained Audit Ledger:** Every audit entry contains a cryptographic hash of its predecessor, creating a verifiable chain of custody. |

---

## 2. The Zero-Trust Deterministic Guardrail Engine

The core security tenet of REVIVE is: **The AI Agent is an advisory engine; the Deterministic Engine is the sole execution authority.**

```
┌─────────────────────────────────┐
│     Agent Recommendation        │
│ Action: INCENTIVIZED_OFFER      │
│ Discount: 25% (Hallucination)   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Deterministic Policy Engine   │
│ Rule: max_discount_pct <= 10.0  │
│ Result: [VIOLATION DETECTED]    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Action Execution VETOED    │
│ Fallback: SMART_RETRY (0% Disc) │
│ Logged to Security Audit Ledger │
└─────────────────────────────────┘
```

### Deterministic Invariants (Non-Overridable)
1. **Discount Cap:** No intervention may ever apply a discount exceeding the merchant's configured ceiling (default: $10.0\%$).
2. **Frequency Cap:** No customer may receive more than 1 automated outbound notification within a rolling 8-hour window.
3. **Retry Exhaustion:** No automated retry may be triggered if the transaction has experienced $\ge 3$ prior attempts.
4. **Hard Decline Lockout:** Fraud alerts, stolen card flags, and permanent account closures are immediately blocked from automated retries and routed exclusively to manual FinOps review.

---

## 3. Webhook Authentication (HMAC-SHA256)

Incoming webhooks from Razorpay must include the `X-Razorpay-Signature` header. The backend validates this signature prior to parsing the request body:

```python
import hmac
import hashlib

def verify_razorpay_webhook_signature(
    raw_body: bytes,
    signature: str,
    secret: str
) -> bool:
    """
    Verifies that incoming webhook is cryptographically signed by Razorpay.
    Prevents unauthorized forgery and MITM injection.
    """
    if not signature or not secret:
        return False
    expected_signature = hmac.new(
        key=secret.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)
```

---

## 4. Sensitive Data Sanitization & PII Masking

Before payment event context is forwarded to any AI model or logged to standard output, it undergoes automated field masking:

- **Credit Card / Debit Card Numbers:** Only the last 4 digits are retained (e.g., `•••• •••• •••• 4242`).
- **Phone Numbers:** Masked to show country code and final 3 digits (e.g., `+91 ••••• ••890`).
- **Customer Email Addresses:** Local part masked (e.g., `j•••••@example.com`).
- **CVV / Expiry:** Stripped immediately at gateway interface; never ingested into REVIVE DB.

---

## 5. Rate Limiting & Denial of Service Protection

- **API Rate Limiter:** Backed by Redis sliding window counter:
  - Public Webhook endpoints: $1,000\text{ requests / minute}$ per IP.
  - Management API endpoints: $100\text{ requests / minute}$ per authenticated merchant token.
- **Circuit Breaker:** If external notification providers (WhatsApp/Email) experience error rates $> 15\%$, the circuit breaker opens, queuing requests locally in Redis rather than cascading failures.

---

## 6. Cryptographic Audit Ledger Integrity

To ensure non-repudiation in audit logs, each entry is hashed with the previous entry's signature:

$$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{Timestamp} \parallel \text{CaseID} \parallel \text{Action} \parallel \text{Verdict})$$

Any retroactive alteration of historical decisions invalidates downstream hashes, making unauthorized tampering immediately detectable.
