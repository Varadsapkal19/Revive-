"""
REVIVE Deterministic Guardrail Engine
Zero-Hallucination Policy Verification Layer.
AI models propose actions; this deterministic engine has absolute veto power.
"""

from typing import Any
from app.schemas.domain import GuardrailCheckResult

class PolicyViolationException(Exception):
    def __init__(self, message: str, rule: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.message = message
        self.rule = rule
        self.details = details or {}

class GuardrailEngine:
    def __init__(
        self,
        max_discount_pct: float = 10.0,
        max_retries: int = 3,
        cooldown_hours: int = 8,
        auto_whatsapp_enabled: bool = True,
        auto_email_enabled: bool = True,
        auto_upi_switch_enabled: bool = True,
        human_escalation_threshold: float = 10000.0,
    ):
        self.max_discount_pct = float(max_discount_pct)
        self.max_retries = int(max_retries)
        self.cooldown_hours = int(cooldown_hours)
        self.auto_whatsapp_enabled = auto_whatsapp_enabled
        self.auto_email_enabled = auto_email_enabled
        self.auto_upi_switch_enabled = auto_upi_switch_enabled
        self.human_escalation_threshold = float(human_escalation_threshold)

    def evaluate_action(
        self,
        action: dict[str, Any],
        context: dict[str, Any] | None = None
    ) -> GuardrailCheckResult:
        """
        Evaluates a candidate recovery action against merchant policy rules.
        Returns GuardrailCheckResult with pass/fail and breakdown of checked rules.
        """
        context = context or {}
        violations: list[str] = []
        checked_rules: list[dict[str, Any]] = []

        action_type = action.get("action_type", "")
        discount_pct = float(action.get("discount_pct", 0.0))
        channel = str(action.get("channel", "EMAIL")).upper()
        current_retry_count = int(context.get("retry_count", 0))
        hours_since_last_contact = float(context.get("hours_since_last_contact", 24.0))
        root_cause = str(context.get("root_cause", "")).upper()
        amount = float(context.get("amount", 0.0))
        customer_tier = str(context.get("customer_tier", "STANDARD")).upper()

        # Rule 1: Discount Cap Check
        rule_discount_passed = discount_pct <= self.max_discount_pct
        checked_rules.append({
            "rule": "DISCOUNT_CAP",
            "name": f"Maximum Discount <= {self.max_discount_pct}%",
            "attempted": discount_pct,
            "threshold": self.max_discount_pct,
            "passed": rule_discount_passed,
        })
        if not rule_discount_passed:
            violations.append(
                f"Proposed discount {discount_pct}% exceeds merchant ceiling of {self.max_discount_pct}%"
            )

        # Rule 2: Retry Count Cap Check
        if action_type in ("SMART_RETRY", "GATEWAY_RETRY"):
            rule_retry_passed = current_retry_count < self.max_retries
            checked_rules.append({
                "rule": "RETRY_LIMIT",
                "name": f"Maximum Retries < {self.max_retries}",
                "attempted": current_retry_count + 1,
                "threshold": self.max_retries,
                "passed": rule_retry_passed,
            })
            if not rule_retry_passed:
                violations.append(
                    f"Transaction has already reached max retry attempts ({current_retry_count}/{self.max_retries})"
                )

        # Rule 3: Customer Notification Cooldown
        if channel in ("EMAIL", "WHATSAPP", "SMS") and "LINK" in action_type:
            rule_cooldown_passed = hours_since_last_contact >= self.cooldown_hours
            checked_rules.append({
                "rule": "COOLDOWN_WINDOW",
                "name": f"Contact Cooldown >= {self.cooldown_hours} hours",
                "attempted": hours_since_last_contact,
                "threshold": self.cooldown_hours,
                "passed": rule_cooldown_passed,
            })
            if not rule_cooldown_passed:
                violations.append(
                    f"Customer contacted {hours_since_last_contact:.1f}h ago; cooldown requires at least {self.cooldown_hours}h"
                )

        # Rule 4: Hard Decline Lockout
        if root_cause in ("FRAUD_ALERT", "STOLEN_CARD", "ACCOUNT_CLOSED"):
            if action_type in ("SMART_RETRY", "INCENTIVIZED_OFFER"):
                checked_rules.append({
                    "rule": "HARD_DECLINE_LOCKOUT",
                    "name": "Hard Decline Prohibits Automated Retry or Incentives",
                    "attempted": action_type,
                    "threshold": "HUMAN_ESCALATION_ONLY",
                    "passed": False,
                })
                violations.append(
                    f"Hard decline cause ({root_cause}) prohibits automated retries; requires manual audit."
                )

        # Rule 5: Channel Permission Check
        if channel == "WHATSAPP" and not self.auto_whatsapp_enabled:
            checked_rules.append({
                "rule": "CHANNEL_WHATSAPP_ENABLED",
                "name": "Merchant WhatsApp Outbound Enabled",
                "attempted": channel,
                "threshold": True,
                "passed": False,
            })
            violations.append("Merchant has disabled automated WhatsApp notifications.")

        if channel == "EMAIL" and not self.auto_email_enabled:
            checked_rules.append({
                "rule": "CHANNEL_EMAIL_ENABLED",
                "name": "Merchant Email Outbound Enabled",
                "attempted": channel,
                "threshold": True,
                "passed": False,
            })
            violations.append("Merchant has disabled automated Email notifications.")

        # Rule 6: High-Value Human Escalation Advisory
        is_high_value = (amount >= self.human_escalation_threshold) or (customer_tier == "ENTERPRISE")
        if is_high_value and action_type not in ("HUMAN_ESCALATION", "ESCALATE_TO_SUPPORT"):
            checked_rules.append({
                "rule": "HIGH_VALUE_THRESHOLD",
                "name": f"High Value (Amount >= {self.human_escalation_threshold} or Enterprise Tier)",
                "attempted": amount,
                "threshold": self.human_escalation_threshold,
                "passed": True,  # Advisory rule
                "advisory": "High value account: human escalation is strongly recommended"
            })

        return GuardrailCheckResult(
            approved=len(violations) == 0,
            violations=violations,
            checked_rules=checked_rules
        )

    def validate_action(
        self,
        action: dict[str, Any],
        context: dict[str, Any] | None = None
    ) -> None:
        """
        Validates action and raises PolicyViolationException if blocked.
        """
        result = self.evaluate_action(action, context)
        if not result.approved:
            first_violation = result.violations[0]
            raise PolicyViolationException(
                message=f"Action '{action.get('action_type')}' blocked: {first_violation}",
                rule="GUARDRAIL_POLICY_VIOLATION",
                details={"violations": result.violations}
            )
