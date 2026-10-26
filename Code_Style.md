# Code Style & Engineering Standards — REVIVE
## Standardized Conventions for Backend, Frontend, and Agent Workflows

**Version:** 1.0.0  
**Enforcement:** Automated via linters and pre-commit hooks  

---

## 1. Python & FastAPI Backend Standards

### 1.1 Python Language Standards
- **Version:** Python 3.11+ strictly.
- **Type Annotations:** 100% type annotations on all function signatures, parameters, and return types. Use built-in generics (`list[str]`, `dict[str, Any]`, `tuple[int, ...]`, `T | None`) instead of importing from `typing`.
- **Formater & Linter:** `ruff` for linting and formatting (line length: 88 characters).

### 1.2 Pydantic v2 Patterns
- All external API request and response bodies must inherit from `pydantic.BaseModel`.
- Enable strict validation where feasible; use `Field(...)` with descriptions for automatic OpenAPI documentation.

```python
from pydantic import BaseModel, Field
from datetime import datetime

class RiskAssessmentResponse(BaseModel):
    case_id: str = Field(..., description="Unique UUID of the recovery case")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score")
    urgency: str = Field(..., description="Triage urgency tier: LOW | MEDIUM | HIGH | CRITICAL")
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 1.3 Service Layer & Dependency Injection
- Never put database queries or raw business logic directly inside FastAPI route handlers.
- Route handlers only parse parameters, call the injected service, and return schemas.
- Use FastAPI `Depends()` for database sessions, services, and authorization.

---

## 2. Next.js 14 & TypeScript Frontend Standards

### 2.1 TypeScript Standards
- **Strict Mode:** `"strict": true` in `tsconfig.json`. No usage of `any` without an explicit explanatory comment.
- **Explicit Interfaces:** Define all API models, component props, and state shapes in `/lib/types.ts`.
- **PascalCase** for component names (`MetricCard.tsx`, `RecoveryFunnel.tsx`).
- **camelCase** for utilities, hooks, and helper functions (`useRecoveryStats.ts`, `formatCurrency.ts`).

### 2.2 Component Hierarchy & Server vs. Client Components
- Keep leaf components as Server Components whenever possible for optimal SEO and performance.
- Add `'use client'` directive exclusively at the top of components that:
  - Utilize React hooks (`useState`, `useEffect`, `useCallback`).
  - Listen for DOM events (`onClick`, `onChange`).
  - Render interactive charts via Recharts.

### 2.3 Tailwind CSS Conventions
- Use Tailwind utility classes directly in `className`.
- Use `clsx` and `tailwind-merge` (via `cn()` helper in `lib/utils.ts`) for conditional classes.
- Follow class grouping order: Layout $\rightarrow$ Sizing $\rightarrow$ Spacing $\rightarrow$ Typography $\rightarrow$ Backgrounds/Borders $\rightarrow$ Effects/Transitions.

```tsx
// Good: Structured, readable className composition
<div
  className={cn(
    "flex items-center justify-between p-4 rounded-xl border bg-white shadow-xs transition-all",
    isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
  )}
>
  <span className="text-sm font-medium text-slate-900">{label}</span>
</div>
```

---

## 3. Error Handling & Exception Management

### 3.1 Backend HTTP Exceptions
- Catch unexpected lower-level exceptions and translate them into standardized JSON error responses using custom exception handlers:
```json
{
  "error": {
    "code": "POLICY_VIOLATION",
    "message": "Proposed discount of 15% exceeds merchant limit of 10%",
    "details": { "rule": "max_discount_pct", "attempted": 15.0, "ceiling": 10.0 }
  }
}
```

### 3.2 Frontend Error Boundaries & Fallbacks
- Wrap charts and complex table widgets in React Error Boundaries.
- Show localized retry states instead of crashing the entire dashboard view.

---

## 4. Git Commit Standards (Conventional Commits)

All commits must follow the conventional commit format: `<type>(<scope>): <subject>`

- `feat`: A new feature (e.g., `feat(agent): implement strategist expected value formula`)
- `fix`: A bug fix (e.g., `fix(webhook): correct HMAC-SHA256 signature byte comparison`)
- `docs`: Documentation updates (e.g., `docs(prd): expand success criteria metrics`)
- `perf`: Performance improvement (e.g., `perf(simulator): vectorize synthetic event batch processing`)
- `refactor`: Code reorganization with no functional change
- `test`: Adding or updating test suites
