# Security Architecture & Implementation Specification — REVIVE
## Enterprise Zero-Trust Guardrails & Financial Integrity Specification

**Version:** 2.0.0 (Enterprise Hardened)  
**Classification:** Financial Systems Security Standard  
**Security Status:** Audited & Fully Implemented  

---

## 1. Threat Modeling in Autonomous FinTech

Autonomous financial systems introduce novel attack surfaces beyond standard web applications. REVIVE enforces active cryptographic and architectural controls across all primary fintech threat vectors:

| Threat Vector | Description | Risk | Implemented Production Control | Exact Source File |
|---|---|---|---|---|
| **Prompt Injection / Agent Manipulation** | Adversary attempts to manipulate LLM to grant unauthorized discounts, bypass limits, or execute arbitrary payments. | Critical | **Cryptographic Execution Approval Gate & Hard Invariant Ceiling:** The LLM cannot execute financial actions. All proposals pass through deterministic guardrails that strictly clamp discounts to $\le 10\%$. Executor independently verifies an HMAC-SHA256 signed approval token binding payload hash, nonce, and expiration before dispatch. | `backend/app/security/approval_token.py`<br>`backend/app/agents/executor.py`<br>`backend/app/agents/diagnostician.py` |
| **Credential Theft & Brute Force** | Attackers attempt dictionary attacks, credential stuffing, or session hijacking on FinOps accounts. | Critical | **Argon2id Password Hashing, Account Lockout, and RFC 6238 TOTP MFA:** Passwords hashed with Argon2id ($m=65536, t=2, p=4$) with min 12-char complexity and breached dictionary check. 5 consecutive failed logins trigger a 15-minute account lockout. MFA backed by TOTP with backup codes. | `backend/app/security/password.py`<br>`backend/app/security/totp.py`<br>`backend/app/services/services.py` |
| **Cross-Tenant IDOR & Data Leakage** | A rogue merchant attempts to access another merchant's transactions, cases, or audit trail. | High | **Server-Side Tenant Extraction & Multi-Tenant Query Scoping:** Merchant ID is extracted strictly from the cryptographically verified JWT session. Database queries and mutations are isolated by `merchant_id`. Insecure direct object references (IDOR) return 404 to prevent resource enumeration. | `backend/app/security/tenant.py`<br>`backend/app/api/endpoints.py` |
| **Privilege Escalation** | Low-privilege users (e.g. Analysts or Developers) trigger unauthorized financial interventions. | High | **Centralized Role-Based Access Control (RBAC):** Server-side enforcement with 7 enterprise roles (`SUPER_ADMIN`, `MERCHANT_OWNER`, `MERCHANT_ADMIN`, `FINOPS_MANAGER`, `DEVELOPER`, `ANALYST`, `AUDITOR`). Read-only roles are blocked from mutating policies or executing recoveries. | `backend/app/security/rbac.py`<br>`backend/app/api/endpoints.py` |
| **Webhook Spoofing & Replay Attacks** | Adversary crafts fake `payment.failed` payloads or replays legitimate webhooks to trigger duplicate recovery actions. | High | **HMAC-SHA256 Signature Verification & Database Idempotency:** Validates `X-Razorpay-Signature` against raw body in constant time. Every event ID is recorded in the `webhook_events` table; duplicate delivery is rejected with `DUPLICATE_EVENT_IGNORED`. | `backend/app/api/endpoints.py`<br>`backend/app/models/entities.py`<br>`backend/app/razorpay/client.py` |
| **Session Hijacking & XSS** | Attackers compromise client tokens to hijack user sessions. | High | **HttpOnly Secure Session Cookies & Active Session Revocation:** Tokens transmitted via HttpOnly, SameSite cookies and signed JWTs with strict `iss`, `aud`, `exp`, and `jti` claims. Session tracking allows immediate revocation of specific sessions or logout from all devices. | `backend/app/security/jwt.py`<br>`backend/app/models/entities.py` |
| **Infrastructure Exposure & Container Escape** | PostgreSQL or Redis exposed to internet; containers run as root with privileged capabilities. | High | **Hardened Docker & Network Segmentation:** Postgres and Redis have no published host ports and reside on an isolated internal network. Application containers run as unprivileged `appuser` / `nextjs` with dropped capabilities (`ALL`) and `no-new-privileges:true`. | `docker-compose.yml`<br>`backend/Dockerfile`<br>`frontend/Dockerfile` |

---

## 2. Authentication & Session Architecture

### Password Security (Argon2id)
- **Algorithm:** Argon2id (RFC 9106 / OWASP recommended).
- **Parameters:** Memory cost: 64 MB ($m=65536$), Iterations: 2 ($t=2$), Parallelism: 4 ($p=4$), Key length: 32 bytes, Salt length: 16 bytes.
- **Complexity Requirements:** Min 12 chars, $\ge 1$ uppercase, $\ge 1$ lowercase, $\ge 1$ digit, $\ge 1$ special symbol.
- **Breached Dictionary Defense:** Automatic rejection of common breached passwords.
- **Brute Force Lockout:** 5 failed login attempts trigger an automatic 15-minute account lockout.
- **Login History Trail:** Structured recording of IP, User-Agent, and authentication verdict.

### Multi-Factor Authentication (TOTP)
- **Standard:** RFC 6238 Time-Based One-Time Password algorithm.
- **Secret:** 160-bit cryptographically secure Base32 secret.
- **Drift Tolerance:** $\pm 1$ step (30 seconds) window allowance.
- **Backup Recovery Codes:** 8 cryptographically generated one-time recovery codes (`xxxx-xxxx`), hashed with SHA-256 before database persistence.

### JWT & Session Management
- **Signing Algorithm:** HS256 allowlist only.
- **Required Claims:** `iss: "revive-auth"`, `aud: "revive-api"`, `sub: user_id`, `merchant_id`, `role`, `session_id`, `iat`, `exp`, `jti`.
- **Access Token TTL:** 30 minutes.
- **Refresh Token TTL:** 7 days with session rotation and revocation tracking.

---

## 3. Centralized RBAC Permission Matrix

| Role | Cases Read | Cases Write | Cases Execute | Policies Read | Policies Write | Audit Read | Audit Verify | Metrics Read | Simulator Run | Users Manage |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Merchant Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Merchant Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **FinOps Manager** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Developer** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Analyst** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Auditor** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 4. AI Agent Security & Cryptographic Approval Gate (Section 8)

The AI diagnostic and strategist agents are strictly advisory. The execution workflow is governed by a multi-layered cryptographic gate:

```
┌──────────────────────────────────────────────┐
│  Agent Proposals (Sentinel/Diagnostician)    │
│  Untrusted Input Sanitized & PII Masked      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Deterministic Guardrail Engine         │
│  Non-overridable Invariant Enforcement:       │
│  - max_discount_pct <= 10.0%                 │
│  - max_retries <= 3 attempts                 │
│  - cooldown_hours >= 8 hours                 │
│  - Hard decline / stolen card lockout        │
└──────────────────────┬───────────────────────┘
                       │ Guardrail Passed
                       ▼
┌──────────────────────────────────────────────┐
│    Cryptographic Approval Token Issuer       │
│  Issues HMAC-SHA256 signed approval binding: │
│  (merchant_id, case_id, action_type,         │
│   payload_hash, policy_version, nonce, exp)  │
└──────────────────────┬───────────────────────┘
                       │ Signed Token
                       ▼
┌──────────────────────────────────────────────┐
│              Executor Agent                  │
│  1. Verifies HMAC-SHA256 signature           │
│  2. Checks timestamp expiration (< 300s)     │
│  3. Replay protection: Checks & burns nonce  │
│  4. Validates payload hash matches plan      │
│  5. Dispatches governed financial action     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         Append-Only Audit Ledger             │
│  Cryptographic SHA-256 Hash Chaining         │
└──────────────────────────────────────────────┘
```

---

## 5. Webhook Security & Idempotency

Incoming Razorpay webhooks undergo three-tier validation:
1. **Raw Body Cryptographic HMAC-SHA256 Verification:** `hmac.compare_digest(computed, x_razorpay_signature)`.
2. **Event Idempotency Guarantee:** Deduplication against `webhook_events` table using `(merchant_id, event_id)` unique constraint.
3. **Replay Protection:** Re-delivered events are acknowledged with `DUPLICATE_EVENT_IGNORED` without re-executing recovery agents.

---

## 6. OWASP Production Security Headers

Every response from the REVIVE API includes the following hardened headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`
- `X-Correlation-ID: <uuid4>`
