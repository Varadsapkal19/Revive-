<div align="center">

<!-- Animated typing header -->
<a href="#"><img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=42&duration=3500&pause=800&color=FFD04F&center=true&vCenter=true&multiline=true&repeat=true&width=750&height=110&lines=REVIVE;Revenue+Recovery+Intelligence" alt="REVIVE — Revenue Recovery Intelligence" /></a>

<br/>

<img src="frontend/public/logo.svg" alt="REVIVE Logo" width="72" />

<br/>

**Autonomous AI-Powered Revenue Recovery Layer for the Razorpay Ecosystem**

<br/>

<!-- Animated badges -->
[![Live Demo](https://img.shields.io/badge/Live_Demo-revive--plum.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://revive-plum.vercel.app)
[![Build](https://img.shields.io/badge/build-passing-16A36A?style=for-the-badge&logo=githubactions&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi_Agent-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](#)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode-0C68FF?style=for-the-badge&logo=razorpay&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-FFD04F?style=for-the-badge)](#)

<br/>

<a href="https://revive-plum.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/%F0%9F%9A%80_OPEN_LIVE_APPLICATION-revive--plum.vercel.app-FFD04F?style=for-the-badge&labelColor=171D19&color=FFD04F" alt="Launch Live App" />
</a>

<br/>

<br/>

<!-- Quick stats row -->
<img src="https://img.shields.io/badge/Recovery_Rate-+34.8%25_Uplift-16A36A?style=flat-square" alt="Recovery Uplift" />
&nbsp;
<img src="https://img.shields.io/badge/Policy_Compliance-100%25-16A36A?style=flat-square" alt="Policy Compliance" />
&nbsp;
<img src="https://img.shields.io/badge/Root_Cause_Accuracy-92.4%25-3776AB?style=flat-square" alt="Root Cause Accuracy" />
&nbsp;
<img src="https://img.shields.io/badge/Guardrail_Violations-Zero-FFD04F?style=flat-square" alt="Zero Violations" />

---

[**Getting Started**](#-quickstart) · [**Architecture**](#-how-it-works) · [**Features**](#-feature-overview) · [**Dashboard**](#-dashboard-screens) · [**Security**](#-enterprise-security) · [**Docs**](#-documentation)

</div>

---

## 🧠 What is REVIVE?

**REVIVE** (Revenue Recovery Intelligence & Value Engine) is a closed-loop, autonomous revenue recovery system built for the **Razorpay Buildathon**. It transforms failed payments from silent revenue leaks into high-precision, AI-optimized recovery opportunities — without a single human in the loop.

> **The core idea:** Every failed payment triggers a multi-agent cognitive pipeline that _detects → diagnoses → strategizes → governs → executes → audits_ the recovery intervention, all within deterministic guardrails that prevent AI hallucinations from ever touching real money.

<br/>

<div align="center">

```
          ╭──────────────────────────────────────────╮
          │       ⚡ Failed Payment Event             │
          │    (Razorpay Webhook / Synthetic)         │
          ╰────────────────┬─────────────────────────╯
                           ▼
   ╔═══════════════════════════════════════════════════╗
   ║         REVIVE Multi-Agent Intelligence           ║
   ║                                                   ║
   ║   🛡️ Sentinel ──▶ 🔬 Diagnostician ──▶ 📊 Strategist ║
   ║  (Risk Score)    (Root Cause)      (Exp. Value)   ║
   ╚═══════════════════╤═══════════════════════════════╝
                       ▼
   ╔═══════════════════════════════════════════════════╗
   ║       🔒 Deterministic Guardrail Engine           ║
   ║   Max Discount ≤ 10%  ·  Cooldown ≥ 8h           ║
   ║   Max Retries ≤ 3     ·  Hard Decline Lockout     ║
   ╚═══════════════════╤═══════════════════════════════╝
                       ▼
   ╔═══════════════════════════════════════════════════╗
   ║   ⚙️ Executor ──▶ Razorpay Link / Smart Retry     ║
   ║   📜 Auditor  ──▶ Immutable Cryptographic Ledger  ║
   ╚═══════════════════════════════════════════════════╝
```

</div>

---

## ✨ Feature Overview

<table>
<tr>
<td width="50%">

### 🤖 AI & Intelligence
- **6-Agent LangGraph Pipeline** — Sentinel → Diagnostician → Strategist → Guardrail → Executor → Auditor
- **XGBoost Risk Scoring** with Brier-calibrated probabilities
- **LLM-Augmented Reasoning** via Ollama (Qwen 2.5 / Llama 3) with deterministic fallback
- **Expected Value Optimization** ranking recovery actions by net revenue

</td>
<td width="50%">

### 🔒 Governance & Compliance
- **Zero-Hallucination Guardrails** — deterministic Python, no LLM in the loop
- **Cryptographic Audit Ledger** — SHA-256 hash-chained, tamper-evident
- **HMAC-SHA256 Webhook Verification** with replay & idempotency protection
- **Execution Approval Tokens** — signed, nonce-protected, time-bound

</td>
</tr>
<tr>
<td>

### 📊 Analytics & Operations
- **Revenue War Room** dashboard with real-time metrics
- **A/B Experiment Framework** — REVIVE vs. industry baseline
- **Batch Simulator** — run 100–5,000 synthetic cases in seconds
- **Judge Mode** — "Why this action?" explainer with counterfactuals

</td>
<td>

### 🏗️ Architecture
- **FastAPI** async backend with Pydantic v2 schemas
- **Next.js 14** App Router with TypeScript & Tailwind CSS
- **Multi-Tenant Isolation** — RBAC + server-side tenant enforcement
- **Docker Compose** — one-command production deployment

</td>
</tr>
</table>

---

## 🚀 Quickstart

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Docker Desktop** | Latest | Required |
| **Git** | 2.x+ | Required |
| **Ollama** _(optional)_ | Latest | For LLM reasoning. REVIVE auto-degrades to deterministic engine if absent |

### One-Command Launch

```bash
# Clone
git clone https://github.com/Varadsapkal19/Revive-.git
cd Revive-

# Configure
cp .env.example .env

# Launch all services
docker compose up --build
```

### Access Points

| Service | URL | Description |
|---|---|---|
| 🌐 **Live Cloud Production** | [`https://revive-plum.vercel.app`](https://revive-plum.vercel.app) | Production SaaS Dashboard on Vercel |
| 🐍 **Live Backend API** | [`https://revive-qs5r.onrender.com`](https://revive-qs5r.onrender.com) | FastAPI Backend Engine on Render |
| 📡 **API Docs (Swagger)** | [`https://revive-qs5r.onrender.com/docs`](https://revive-qs5r.onrender.com/docs) | Interactive OpenAPI Documentation |
| 💚 **API Health Check** | [`https://revive-qs5r.onrender.com/health`](https://revive-qs5r.onrender.com/health) | Live Production Liveness Probe |
| 🖥️ **Local Dashboard** | [`http://localhost:3000`](http://localhost:3000) | Local REVIVE Web Application |

### Local Development (Without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
python ../run_backend.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🖥️ Dashboard Screens

REVIVE ships with **8 dedicated operational views**, each designed for a specific FinOps workflow:

| # | Screen | Route | Purpose |
|---|---|---|---|
| 1 | **Revenue War Room** | `/dashboard` | Primary cockpit — ARR at risk, recovered volume, recovery funnels, live activity stream |
| 2 | **Risk Radar** | `/revenue-risk` | Prioritized risk matrix with urgency/error-code/tier filters |
| 3 | **Recovery Cases** | `/cases` | End-to-end case inspector with agent reasoning trace & action comparison |
| 4 | **Batch Simulator** | `/simulator` | Run 100–5,000 synthetic failures with live animated conversion funnels |
| 5 | **A/B Experiments** | `/experiments` | REVIVE vs. industry baseline (24h static retries) comparative analytics |
| 6 | **Policy Center** | `/policies` | Configure max discount %, retry caps, cooldown windows, channel permissions |
| 7 | **Audit Ledger** | `/audit` | Immutable, tamper-evident cryptographic log of every decision |
| 8 | **Judge Mode** | `/judge-mode` | "WHY THIS ACTION?" — mathematical models, rejections, policy validations |

---

## 🔒 Enterprise Security

<details>
<summary><strong>🛡️ Authentication & Session Management</strong></summary>

- **Argon2id** password hashing (RFC 9106 / OWASP parameters)
- 12-character minimum with complexity + breached password checks
- **TOTP MFA** (RFC 6238) with SHA-256 hashed recovery codes
- **JWT** access + refresh tokens with issuer/audience/session binding
- Account lockout after 5 failed attempts (15-min progressive delay)
- Session revocation on password change/reset
- Login history with IP + User-Agent audit trail

</details>

<details>
<summary><strong>🔐 Authorization & Multi-Tenancy</strong></summary>

- 7-tier RBAC — Super Admin → Merchant Owner → Admin → FinOps → Developer → Analyst → Auditor
- Fine-grained permission matrix (cases:read, policies:write, audit:verify, etc.)
- Server-side tenant extraction from JWT — no client-supplied tenant IDs
- Anti-IDOR tenant ownership verification on every resource access

</details>

<details>
<summary><strong>🌐 API & Webhook Security</strong></summary>

- Sliding-window rate limiting (Redis-backed with in-memory fallback)
- HMAC-SHA256 Razorpay webhook signature verification
- Idempotency protection — duplicate webhook replay blocked
- Cryptographic execution approval tokens with nonce replay prevention
- CORS, security headers, and `no-new-privileges` container hardening

</details>

---

## 🔬 Guardrail Engine

> _In financial operations, AI hallucinations cost real capital._

REVIVE enforces **strict, non-negotiable guardrails** in pure deterministic Python. No LLM can override them.

| Rule | Constraint | Effect |
|---|---|---|
| **Discount Cap** | ≤ 10% | LLM-proposed discounts above ceiling → instant veto |
| **Cooldown** | ≥ 8 hours | Prevents customer notification fatigue |
| **Retry Limit** | ≤ 3 attempts | Protects gateway reputation & avoids issuer penalties |
| **Hard Decline** | Fraud / Stolen Card | Auto-escalate to human — never retry |
| **High Value** | ≥ ₹10,000 or Enterprise tier | Advisory escalation to human team |

---

## 📈 Benchmarks (REVIVE-Bench)

Evaluated against a **10,000-case synthetic dataset** mirroring real Razorpay transaction distributions:

<div align="center">

| Metric | Score |
|---|---|
| **Root Cause Accuracy** | 92.4% |
| **Policy Compliance** | **100.00%** (0 violations) |
| **Brier Calibration** | 0.089 |
| **Recovery Rate Uplift** | **+34.8%** vs. naive static retry |

</div>

---

## 📁 Project Structure

```
revive/
├── frontend/               # Next.js 14 · TypeScript · Tailwind · Recharts
│   ├── app/                # App Router pages (8 screens)
│   ├── components/         # UI components (layout, auth, shared)
│   └── lib/                # API client, types, utilities
├── backend/                # FastAPI · Pydantic v2 · SQLAlchemy
│   └── app/
│       ├── agents/         # Sentinel, Diagnostician, Strategist, Executor, Auditor
│       ├── api/            # REST endpoints & Razorpay webhooks
│       ├── models/         # SQLAlchemy ORM entities
│       ├── policy/         # Deterministic Guardrail Engine
│       ├── security/       # JWT, Argon2id, TOTP, RBAC, Rate Limiter
│       ├── services/       # Core business logic
│       └── simulation/     # Synthetic batch runner
├── ml/                     # REVIVE-Bench dataset & evaluation
├── docs/                   # Architecture diagrams & specs
├── docker-compose.yml      # One-command multi-container orchestration
├── .env.example            # Configuration template
└── README.md               # ← You are here
```

---

## 🧪 Testing

```bash
# Backend unit tests + guardrail invariant verification
cd backend
pytest tests/ -v

# Frontend type check
cd frontend
npx tsc --noEmit
```

---

## 📖 Documentation

| Document | Description |
|---|---|
| [`PRD.md`](./PRD.md) | Product Requirements Document |
| [`AGENT.md`](./AGENT.md) | Multi-Agent Architecture & Pipeline |
| [`Architecture.md`](./Architecture.md) | System Architecture & Data Flow |
| [`Security.md`](./Security.md) | Security Model & Threat Analysis |
| [`Design_System.md`](./Design_System.md) | UI Design Tokens & Component Library |
| [`Code_Style.md`](./Code_Style.md) | Code Standards & Conventions |
| [`Testing.md`](./Testing.md) | Test Strategy & Benchmark Methodology |

---

## ⚙️ Tech Stack

<div align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![LangChain](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C68FF?style=for-the-badge&logo=razorpay&logoColor=white)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=500&size=16&duration=4000&pause=1000&color=777B76&center=true&vCenter=true&repeat=true&width=500&lines=Built+for+the+Razorpay+Buildathon+%F0%9F%9A%80;AI+that+recovers+revenue%2C+not+hallucinations+%F0%9F%94%92;Every+decision+audited.+Every+guardrail+enforced.+%E2%9C%85" alt="Footer typing" />

<br/>

**[⬆ Back to Top](#)**

</div>
