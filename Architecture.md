# System Architecture Document — REVIVE
## Revenue Recovery Intelligence & Value Engine

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Environment:** Local Docker Compose / Cloud Ready  

---

## 1. High-Level Architecture Overview

REVIVE uses a **hybrid micro-service architecture** that decouples user interaction, asynchronous event processing, deterministic policy governance, and cognitive AI reasoning.

```
                      ┌────────────────────────────────────────┐
                      │          Next.js 14 Frontend           │
                      │  (TypeScript, Tailwind, shadcn, Recharts)│
                      │               Port: 3000               │
                      └───────────────────┬────────────────────┘
                                          │
                                   REST / WebSocket
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          FastAPI Backend Core          │
                      │    (Python 3.11, Pydantic, SQLAlchemy)  │
                      │               Port: 8000               │
                      └───────┬───────────┬────────────┬───────┘
                              │           │            │
            ┌─────────────────┘           │            └──────────────────┐
            ▼                             ▼                               ▼
┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│ PostgreSQL 16 (Relational)│   │       Redis 7 (Cache)     │   │   Ollama Local LLM (Opt)  │
│ - Events & Cases      │   │ - Idempotency Locks       │   │ - Qwen2.5 / Llama3       │
│ - Merchant Policies   │   │ - Fast Risk Queues        │   │ - Port: 11434             │
│ - Immutable Audit Logs│   │ - Pub/Sub Event Broadcast │   │ - Fallback to Rule Engine │
│ Port: 5432            │   │ Port: 6379                │   │                           │
└───────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Next.js 14 Web Application
- **Server/Client Hybrid:** Utilizes Next.js App Router for server-rendered dashboards and dynamic client-side state for the batch simulator.
- **Real-Time Polling & WebSockets:** Subscribes to case updates and simulation batch streams to animate funnels in real-time.
- **Client-Side Simulation Cache:** Maintains local filtering for rapid tabular sorting without saturating backend DB.

### 2.2 FastAPI Backend Core
- **Async API Router:** Manages endpoints for events, risk, cases, policies, simulations, and audit logs.
- **LangGraph Multi-Agent Orchestrator:** Manages execution graph state across the 5 agents (`Sentinel`, `Diagnostician`, `Strategist`, `Executor`, `Auditor`).
- **Deterministic Policy Guardrail Engine:** A standalone, non-LLM validation gate that evaluates merchant-defined rules prior to dispatch.
- **Synthetic Simulator Engine:** High-performance vectorized generator producing realistic payment failure scenarios at scale ($>500\text{ records/sec}$).
- **Razorpay Integration Gateway:** Verifies HMAC-SHA256 signatures on incoming webhooks and interfaces with Razorpay Test Mode REST API.

### 2.3 Storage Layer
- **PostgreSQL 16:** ACID-compliant relational persistence with indexed queries on `merchant_id`, `created_at`, `status`, and `risk_score`.
- **Alembic:** Database migrations for deterministic schema provisioning.
- **Redis 7:** In-memory queue for task scheduling, rate limiting, distributed lock management, and real-time metric counters.

---

## 3. End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Gateway
    participant Razorpay as Razorpay / Webhook Ingest
    participant Backend as FastAPI Ingestion Router
    participant Agent as LangGraph Agent Workflow
    participant Guardrail as Deterministic Policy Engine
    participant DB as PostgreSQL & Redis
    participant UI as Next.js Dashboard

    Customer->>Razorpay: Payment Failed Event
    Razorpay->>Backend: POST /api/webhooks/razorpay (HMAC Verified)
    Backend->>DB: Persist Raw Event & Check Idempotency Key
    Backend->>Agent: Launch Recovery State Graph
    Agent->>Agent: Sentinel: Compute Multidimensional Risk Score
    Agent->>Agent: Diagnostician: Classify Root Cause (Rule/LLM)
    Agent->>Agent: Strategist: Rank Actions by Expected Value
    Agent->>Guardrail: Validate Top Candidate Action against Merchant Policy
    alt Guardrail Passes
        Guardrail-->>Agent: Action Approved
        Agent->>Razorpay: Executor: Dispatch Payment Link / Schedule Retry
        Agent->>DB: Auditor: Append to Immutable Audit Ledger
    else Guardrail Vetoes
        Guardrail-->>Agent: Policy Violation (e.g., Exceeded Discount Limit)
        Agent->>Agent: Strategist: Select Fallback Action or Human Escalate
        Agent->>DB: Auditor: Log Vetoed Action + Reason
    end
    DB-->>UI: Real-Time Stream (Case Status Updated)
```

---

## 4. Database Schema & Data Models

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    MERCHANTS ||--o{ CUSTOMERS : has
    MERCHANTS ||--o{ MERCHANT_POLICIES : configures
    CUSTOMERS ||--o{ PAYMENTS : initiates
    PAYMENTS ||--o{ REVENUE_EVENTS : generates
    REVENUE_EVENTS ||--o{ RECOVERY_CASES : triggers
    RECOVERY_CASES ||--o{ RECOVERY_ACTIONS : produces
    RECOVERY_ACTIONS ||--o{ RECOVERY_OUTCOMES : resolves
    RECOVERY_CASES ||--o{ AUDIT_LOGS : records

    MERCHANTS {
        uuid id PK
        string name
        string email
        string razorpay_key_id
        timestamp created_at
    }

    REVENUE_EVENTS {
        uuid id PK
        uuid merchant_id FK
        uuid customer_id FK
        string event_type
        decimal amount
        string currency
        string error_code
        string error_description
        jsonb raw_payload
        timestamp created_at
    }

    RECOVERY_CASES {
        uuid id PK
        uuid event_id FK
        uuid merchant_id FK
        decimal risk_score
        string diagnosed_root_cause
        float diagnostic_confidence
        string status
        decimal recovered_amount
        timestamp created_at
        timestamp resolved_at
    }

    RECOVERY_ACTIONS {
        uuid id PK
        uuid case_id FK
        string action_type
        decimal expected_value
        decimal discount_pct
        jsonb execution_details
        string status
        timestamp executed_at
    }

    MERCHANT_POLICIES {
        uuid id PK
        uuid merchant_id FK
        int max_retries
        decimal max_discount_pct
        int cooldown_hours
        boolean auto_whatsapp_enabled
        boolean auto_email_enabled
        timestamp updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid case_id FK
        string agent_name
        string stage
        jsonb state_snapshot
        jsonb decision_rationale
        timestamp created_at
    }
```

---

## 5. API Specification & Route Inventory

| Route | Method | Description |
|---|---|---|
| `/health` | `GET` | Health status of backend, DB, Redis, and Ollama |
| `/api/events` | `POST` | Ingest arbitrary payment failure event |
| `/api/risk` | `GET` | List at-risk cases filtered by risk score threshold |
| `/api/cases` | `GET` | Query recovery cases with pagination and filters |
| `/api/cases/{id}` | `GET` | Retrieve case detail including full step-by-step decision trace |
| `/api/simulator/run`| `POST` | Trigger synchronous or streamed batch simulation |
| `/api/policies` | `GET` | Fetch active merchant guardrail configuration |
| `/api/policies` | `PUT` | Update merchant guardrail parameters with validation |
| `/api/audit` | `GET` | Query immutable audit log with cryptographic hash checks |
| `/api/metrics` | `GET` | Primary KPI aggregates (ARR at risk, recovered volume, win rate) |
| `/api/experiments` | `GET` | Real-time results of heuristic vs. REVIVE A/B runs |
| `/api/webhooks/razorpay` | `POST` | Razorpay webhook consumer with HMAC signature verification |

---

## 6. Hybrid Reasoning Engine Mechanics

```
                  ┌────────────────────────────────────────┐
                  │    Diagnostician Incoming Payload      │
                  └───────────────────┬────────────────────┘
                                      │
                         Is error_code unequivocally mapped?
                                      │
                     ┌────────────────┴────────────────┐
                     ▼ YES                             ▼ NO / AMBIGUOUS
        ┌──────────────────────────┐     ┌───────────────────────────┐
        │ Instant Deterministic    │     │ Ollama Local LLM Prompt   │
        │ Fast Path (<5ms)         │     │ (Contextual Reasoning)    │
        └────────────┬─────────────┘     └─────────────┬─────────────┘
                     │                                 │
                     └────────────────┬────────────────┘
                                      ▼
                        Standardized Diagnostic Report
```

1. **Deterministic Fast Path:** Evaluates explicit gateway codes (e.g., `BAD_REQUEST_ERROR`, `GATEWAY_ERROR`, `INSUFFICIENT_FUNDS`). If mapped, produces classification instantaneously with zero LLM overhead.
2. **Cognitive Fallback Path:** If Ollama is available, evaluates subtle failure combinations (e.g., recurring mandate halt with low customer engagement).
3. **Graceful Fail-Safe:** If Ollama is down, cognitive fallback seamlessly reverts to rule-based fallback with zero service interruption.
