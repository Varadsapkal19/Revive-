# REVIVE Design System & UI Specification
## Visual Identity & Design Tokens for Autonomous Revenue Recovery

**Target Framework:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Lucide Icons + Recharts  
**Inspiration:** Razorpay Merchant Dashboard, Linear, Vercel FinOps  

---

## 1. Design Philosophy

REVIVE handles mission-critical financial events where clarity, precision, and trust are paramount.
- **Data-Dense Yet Legible:** High information density without visual clutter.
- **Deterministic Transparency:** Clear differentiation between system decisions, AI inferences, and guardrail overrides.
- **Financial Credibility:** Crisp borders, subtle neutral surfaces, unmistakable status indicators, and Razorpay-aligned enterprise aesthetics.
- **Persistent State Awareness:** Clear indicator of environment state (e.g., `● TEST MODE`, `● LIVE SIMULATOR`, `● OLLAMA CONNECTED`).

---

## 2. Color Palette & Semantic Tokens

### 2.1 Primary Brand & Neutral Palette
```css
/* Core Palette */
--background: #FAFAFC;           /* Crisp light canvas */
--foreground: #0F172A;           /* Deep slate body text */
--card: #FFFFFF;                 /* Pure white surface */
--card-foreground: #0F172A;      
--popover: #FFFFFF;
--popover-foreground: #0F172A;

/* Razorpay & FinTech Accents */
--primary: #0C2340;              /* Deep Razorpay Midnight Navy */
--primary-foreground: #FFFFFF;
--brand-blue: #0B72E7;           /* Vibrant Razorpay Action Blue */
--brand-blue-hover: #0959B6;
--brand-blue-subtle: #EFF6FF;    /* Blue tint for badge backgrounds */

/* Functional & Status Tokens */
--success: #10B981;              /* Recovery Emerald */
--success-foreground: #FFFFFF;
--success-subtle: #ECFDF5;
--warning: #F59E0B;              /* At-Risk Amber */
--warning-foreground: #FFFFFF;
--warning-subtle: #FFFBEB;
--destructive: #EF4444;          /* Failure / Hard Decline Crimson */
--destructive-foreground: #FFFFFF;
--destructive-subtle: #FEF2F2;

/* Structural Borders & Neutrals */
--border: #E2E8F0;               /* Clean structural border */
--input: #E2E8F0;
--ring: #0B72E7;
--muted: #F1F5F9;                /* Subdued background */
--muted-foreground: #64748B;     /* Secondary helper text */
```

### 2.2 Status Badges & Chips

| Status | Badge Background | Text Color | Border Color | Example Use Case |
|---|---|---|---|---|
| **RECOVERED** | `#ECFDF5` (`bg-emerald-50`) | `#065F46` (`text-emerald-800`) | `#A7F3D0` | Case resolved, revenue recaptured |
| **IN_RECOVERY** | `#EFF6FF` (`bg-blue-50`) | `#1E40AF` (`text-blue-800`) | `#BFDBFE` | Active retry or link dispatched |
| **AT_RISK** | `#FFFBEB` (`bg-amber-50`) | `#92400E` (`text-amber-800`) | `#FDE68A` | High churn risk detected |
| **FAILED / CHURNED** | `#FEF2F2` (`bg-red-50`) | `#991B1B` (`text-red-800`) | `#FECACA` | Retries exhausted, permanent drop |
| **GUARDRAIL_BLOCKED**| `#F3E8FF` (`bg-purple-50`)| `#6B21A8` (`text-purple-800`)| `#E9D5FF` | Action vetoed by policy engine |

---

## 3. Typography Hierarchy

Using **Inter** or **Geist Sans** for interface text and **JetBrains Mono** for monetary amounts, transaction IDs, and code traces.

- **Display Header (H1):** `text-2xl font-bold tracking-tight text-slate-900`
- **Section Title (H2):** `text-lg font-semibold text-slate-900`
- **Metric Value (Hero KPI):** `font-mono text-3xl font-extrabold text-slate-900`
- **Body Regular:** `text-sm font-normal text-slate-700 leading-relaxed`
- **Subtext / Helper:** `text-xs font-medium text-slate-500`
- **Code / Reference Pill:** `font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-800`

---

## 4. UI Layout & Screen Structure

### 4.1 Global Layout Topology
```
┌────────────────────────────────────────────────────────────────────────┐
│ TopBar: [REVIVE Logo] | Search | System Health | [● TEST MODE] | User  │
├─────────────┬──────────────────────────────────────────────────────────┤
│             │ Header: Screen Title + Primary Action Button(s)          │
│ Sidebar     ├──────────────────────────────────────────────────────────┤
│ - War Room  │                                                          │
│ - Risk      │ Main Content Viewport                                    │
│ - Cases     │ (Grid / Tables / Charts / Drawer)                        │
│ - Simulator │                                                          │
│ - Policies  │                                                          │
│ - Audit     │                                                          │
│ - Judge     │                                                          │
│             │                                                          │
└─────────────┴──────────────────────────────────────────────────────────┘
```

### 4.2 Core Component Specifications

#### A. Metric KPI Card (`MetricCard`)
- **Structure:** Metric title with info tooltip, primary currency/percentage value, trend indicator pill ($\pm X\%$ vs baseline), secondary caption.
- **Card Surface:** `bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all`.

#### B. Recovery Funnel & Sankey Visualizer (`RecoveryFunnel`)
- **Structure:** Multi-stage horizontal bar or step indicator showing:
  `Failed Payment Ingested` $\rightarrow$ `Risk Triaged` $\rightarrow$ `Strategy Formulated` $\rightarrow$ `Guardrail Verified` $\rightarrow$ `Action Dispatched` $\rightarrow$ `Revenue Recaptured`.
- **Interactivity:** Hovering over stages reveals drop-off count and conversion percentage.

#### C. Decision Trace Accordion (`DecisionTrace`)
- **Structure:** Vertical step-by-step audit log used in Case Detail and Judge Mode:
  - Step 1: Ingestion metadata with raw payload preview.
  - Step 2: Risk score calculation formula breakdown.
  - Step 3: Diagnostic reasoning with LLM confidence.
  - Step 4: Considered actions matrix with expected value rankings.
  - Step 5: Guardrail compliance checklist (Green checkmarks / Red crosses).
  - Step 6: Dispatch receipt with live Razorpay link.

#### D. Batch Simulator Controls (`SimulatorControls`)
- **Controls:**
  - Case Count Slider ($100$ to $5,000$ cases).
  - Failure Distribution Selector (`Balanced`, `High Insufficient Funds`, `High Gateway Outage`).
  - LLM Reasoning Toggle (`Cognitive LLM` vs `Fast Deterministic`).
  - Primary CTA: `Run Batch Simulation` with live animated progress bar.

---

## 5. Charting & Data Visualization Tokens (Recharts)

```typescript
export const chartColors = {
  primary: '#0B72E7',      // Razorpay Blue
  recovered: '#10B981',    // Emerald Green
  atRisk: '#F59E0B',       // Amber
  failed: '#EF4444',       // Crimson Red
  baseline: '#94A3B8',     // Muted Slate for A/B comparison
  grid: '#E2E8F0',         // Subdued Grid Line
  tooltipBg: '#0F172A',    // Dark obsidian tooltip
  tooltipText: '#FFFFFF',
};
```

---

## 6. Accessibility & Responsive Standards

- **Color Contrast:** All text must strictly satisfy WCAG 2.1 AA standards ($4.5:1$ contrast ratio for regular text, $3:1$ for large text).
- **Keyboard Navigation:** Full tab order and enter/space activation on all interactive case cards, filter tabs, and action buttons.
- **Responsive Breakpoints:**
  - Desktop-first enterprise layout ($>1280\text{px}$) with persistent sidebar.
  - Tablet layout ($768\text{px} - 1279\text{px}$) with collapsible icon sidebar.
  - Mobile layout ($<768\text{px}$) with slide-out sheet drawer.
