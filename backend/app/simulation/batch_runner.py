"""
REVIVE Batch Simulation Runner
Simulates recovery performance comparing Baseline (naive static 24h retry) vs. REVIVE.
"""

import time
import random
from typing import Any
from app.simulation.generator import synthetic_generator
from app.policy.guardrail_engine import GuardrailEngine
from app.ml.engine import ml_engine

class BatchSimulatorRunner:
    @staticmethod
    def run_simulation(
        num_cases: int = 500,
        distribution: str = "BALANCED",
        use_llm: bool = False
    ) -> dict[str, Any]:
        start_time = time.time()
        events = synthetic_generator.generate_batch(num_cases, distribution)
        guardrail = GuardrailEngine()

        total_revenue = 0.0
        baseline_recovered_count = 0
        baseline_recovered_revenue = 0.0

        revive_recovered_count = 0
        revive_recovered_revenue = 0.0
        guardrail_violations_prevented = 0

        breakdown_by_cause: dict[str, dict[str, Any]] = {}

        for ev in events:
            amount = ev["amount"]
            cause = ev["true_root_cause"]
            total_revenue += amount

            if cause not in breakdown_by_cause:
                breakdown_by_cause[cause] = {
                    "total_count": 0,
                    "baseline_recovered": 0,
                    "revive_recovered": 0,
                    "total_amount": 0.0,
                    "revive_amount": 0.0
                }

            breakdown_by_cause[cause]["total_count"] += 1
            breakdown_by_cause[cause]["total_amount"] += amount

            # --- Baseline Model (Naive static retry after 24h) ---
            # Baseline only works reasonably on transient network timeouts
            if cause == "NETWORK_TIMEOUT":
                baseline_prob = 0.55
            elif cause == "GATEWAY_DOWNTIME":
                baseline_prob = 0.50
            elif cause == "INSUFFICIENT_FUNDS":
                baseline_prob = 0.18
            else:
                baseline_prob = 0.02  # Cards expired, fraud, or auth drops fail completely on blind retry

            baseline_success = random.random() < baseline_prob
            if baseline_success:
                baseline_recovered_count += 1
                baseline_recovered_revenue += amount
                breakdown_by_cause[cause]["baseline_recovered"] += 1

            # --- REVIVE Model (Agent Strategy + Guardrail Engine) ---
            # Determine optimal action
            if cause in ("NETWORK_TIMEOUT", "GATEWAY_DOWNTIME"):
                action = "SMART_RETRY"
                discount = 0.0
            elif cause in ("AUTHENTICATION_FAILED", "CARD_EXPIRED"):
                action = "METHOD_SWITCH_UPI"
                discount = 0.0
            elif cause == "INSUFFICIENT_FUNDS":
                action = "PAYMENT_LINK_WHATSAPP"
                discount = 0.0
            elif cause == "FRAUD_ALERT":
                action = "HUMAN_ESCALATION"
                discount = 0.0
            else:
                action = "PAYMENT_LINK_EMAIL"
                discount = 0.0

            # Guardrail check
            eval_res = guardrail.evaluate_action(
                {"action_type": action, "discount_pct": discount},
                {"retry_count": ev["retry_count"], "root_cause": cause, "amount": amount}
            )

            # In simulation, test if naive LLM would have hallucinated high discount
            if random.random() < 0.08:  # 8% chance of rogue discount attempt
                rogue_check = guardrail.evaluate_action(
                    {"action_type": "INCENTIVIZED_OFFER", "discount_pct": 25.0},
                    {"retry_count": ev["retry_count"]}
                )
                if not rogue_check.approved:
                    guardrail_violations_prevented += 1

            if eval_res.approved:
                revive_prob = ml_engine.predict_recovery_probability(
                    action_type=action,
                    root_cause=cause,
                    amount=amount,
                    customer_tier=ev["customer_tier"],
                    retry_count=ev["retry_count"]
                )
            else:
                revive_prob = 0.0

            revive_success = random.random() < revive_prob
            if revive_success:
                revive_recovered_count += 1
                revive_recovered_revenue += amount
                breakdown_by_cause[cause]["revive_recovered"] += 1
                breakdown_by_cause[cause]["revive_amount"] += amount

        baseline_recovery_rate = round((baseline_recovered_count / num_cases) * 100, 2)
        revive_recovery_rate = round((revive_recovered_count / num_cases) * 100, 2)
        net_uplift_pct = round(revive_recovery_rate - baseline_recovery_rate, 2)
        net_dollar_lift = round(revive_recovered_revenue - baseline_recovered_revenue, 2)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "simulated_cases": num_cases,
            "baseline_recovered_count": baseline_recovered_count,
            "baseline_recovery_rate": baseline_recovery_rate,
            "revive_recovered_count": revive_recovered_count,
            "revive_recovery_rate": revive_recovery_rate,
            "net_uplift_pct": net_uplift_pct,
            "total_revenue_processed": round(total_revenue, 2),
            "baseline_recovered_revenue": round(baseline_recovered_revenue, 2),
            "revive_recovered_revenue": round(revive_recovered_revenue, 2),
            "net_recovered_dollar_lift": net_dollar_lift,
            "guardrail_violations_prevented": guardrail_violations_prevented,
            "breakdown_by_cause": breakdown_by_cause,
            "execution_time_ms": elapsed_ms
        }

batch_simulator = BatchSimulatorRunner()
