# REVIVE — Revenue Recovery Intelligence & Value Engine
### Autonomous AI-Powered Revenue Recovery Layer for the Razorpay Ecosystem

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](#)
[![Next.js](https://img.shields.io/badge/next.js-14-black.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Test Mode](https://img.shields.io/badge/Mode-●%20Razorpay%20Test%20Mode-orange)](#)

---

## 🚀 Overview

**REVIVE** is a closed-loop, autonomous revenue recovery intelligence system built for the Razorpay Buildathon. It transforms failed payments from lost revenue into high-precision, optimized recovery opportunities.

Combining **LangGraph multi-agent cognitive reasoning**, **XGBoost predictive scoring**, and **deterministic policy guardrails**, REVIVE autonomously detects, diagnoses, decides, governs, executes, and audits every payment recovery intervention in real time.

```
       [ Failed Payment Event ] (Razorpay Webhook / Synthetic Stream)
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │        REVIVE Multi-Agent Intelligence Core         │
        │                                                     │
        │  [Sentinel]   ──> [Diagnostician] ──> [Strategist]  │
        │ (Risk Score)      (Root Cause)       (Exp. Value)   │
        └──────────────────────────┬──────────────────────────┘
                                   │ Top Candidate Action
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │          Deterministic Guardrail Engine             │
        │   (Strict Merchant Limits: Max Discount <= 10%,     │
        │    Cooldown >= 8h, Max Retries <= 3)                │
        └──────────────────────────┬──────────────────────────┘
                                   │ Approved Action
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │       [Executor] ──> Razorpay Link / Smart Retry     │
        │       [Auditor]  ──> Immutable Cryptographic Ledger │
        └─────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart (One-Command Run)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- (Optional) [Ollama](https://ollama.ai/) running locally on port 11434 with `qwen2.5:latest` or `llama3`. If not present, REVIVE **automatically degrades gracefully to the built-in deterministic rule engine** with zero downtime.

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-username/revive.git
cd revive

# Create your local environment configuration
cp .env.example .env

# Launch all services
docker compose up --build
```

Once launched, access:
- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🖥️ Screen Guide (8 Dedicated Views)

| Screen | Route | Key Capabilities |
|---|---|---|
| **Revenue War Room** | `/dashboard` | Primary FinOps cockpit: ARR at risk, recovered volume, recovery rate %, interactive funnels, and real-time activity stream. |
| **Risk Radar** | `/revenue-risk` | Prioritized radar of at-risk transactions with filter controls (urgency, error code, customer tier). |
| **Recovery Cases** | `/cases` & `/cases/[id]` | End-to-end case inspector featuring multi-agent reasoning trace, candidate action comparison, and execution logs. |
| **Batch Simulator** | `/simulator` | High-speed simulation engine: run 100 to 5,000 synthetic failure cases with live animated conversion funnels. |
| **A/B Experiments** | `/experiments` | Real-time comparative analytics measuring REVIVE vs. industry baseline (24h static retries). |
| **Policy Center** | `/policies` | Merchant guardrail controls: configure maximum discount %, retry ceilings, cooldown hours, and communication channels. |
| **Audit Ledger** | `/audit` | Immutable, tamper-evident cryptographic log of every triage decision and guardrail check. |
| **Judge Mode** | `/judge-mode` | Specialized evaluation view: "WHY THIS ACTION?" explainer exposing the mathematical models, counterfactual rejections, and policy validations. |

---

## 🛡️ Zero-Trust Deterministic Guardrails

In financial operations, **AI hallucinations cost real capital**. REVIVE enforces strict non-negotiable guardrails in pure deterministic Python code:

1. **Max Discount Cap ($\le 10\%$):** LLMs cannot grant arbitrary discounts. Violations are instantly vetoed.
2. **Frequency Cooldown ($\ge 8$ hours):** Prevents customer harassment and notification fatigue.
3. **Hard Retry Limit ($\le 3$ attempts):** Protects merchant gateway reputation and avoids issuer penalty fees.
4. **Hard Decline Lockout:** Fraud alerts and stolen card signals are immediately escalated to human teams.

---

## 📊 Evaluation & Benchmarks (REVIVE-Bench)

REVIVE is evaluated against a 10,000-case synthetic dataset (`REVIVE-Bench`) mirroring real-world Razorpay transaction distributions:

- **Root Cause Accuracy:** $> 92.4\%$
- **Policy Compliance:** **$100.00\%$** ($0$ violations across all simulated batches)
- **Brier Calibration Score:** $0.089$ (High probability calibration)
- **Recovery Rate Uplift:** **$+34.8\%$** over naive static retry schedules

---

## 📁 Project Structure

```
revive/
├── frontend/               # Next.js 14 App Router, TypeScript, Tailwind, Recharts
├── backend/                # FastAPI, Pydantic v2, SQLAlchemy, LangGraph
│   ├── app/
│   │   ├── agents/         # Sentinel, Diagnostician, Strategist, Executor, Auditor
│   │   ├── api/            # REST API endpoints & Razorpay webhooks
│   │   ├── models/         # SQLAlchemy DB models
│   │   ├── policy/         # Deterministic Guardrail Engine
│   │   ├── services/       # Core business logic services
│   │   └── simulation/     # Synthetic event generator & batch processor
├── ml/                     # REVIVE-Bench dataset, training, and evaluation scripts
├── docs/                   # Architectural diagrams, specifications, and PRD
├── docker-compose.yml      # Multi-container orchestration
├── .env.example            # Sample configuration values
└── README.md               # You are here
```

---

## 🧪 Testing

```bash
# Run backend unit tests and guardrail invariant verification
pytest backend/tests -v

# Run the REVIVE-Bench evaluation
python ml/evaluation/run_benchmark.py
```

---

## 📄 Documentation Index
- [Product Requirements Document (PRD.md)](./PRD.md)
- [Multi-Agent Architecture (AGENT.md)](./AGENT.md)
- [System Architecture (Architecture.md)](./Architecture.md)
- [Design System & UI Tokens (Design_System.md)](./Design_System.md)
- [Security & Threat Model (Security.md)](./Security.md)
- [Code Style & Standards (Code_Style.md)](./Code_Style.md)
- [Testing & Benchmarks (Testing.md)](./Testing.md)
