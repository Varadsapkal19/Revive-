"""
Synthetic Payment Event Generator for REVIVE Simulator and Benchmarks.
Generates realistic payment failure distributions.
"""

import random
import uuid
from typing import Any

DISTRIBUTION_PROFILES = {
    "BALANCED": {
        "INSUFFICIENT_FUNDS": 0.40,
        "NETWORK_TIMEOUT": 0.25,
        "AUTHENTICATION_FAILED": 0.15,
        "CARD_EXPIRED": 0.10,
        "GATEWAY_DOWNTIME": 0.05,
        "FRAUD_ALERT": 0.05,
    },
    "HIGH_INSUFFICIENT_FUNDS": {
        "INSUFFICIENT_FUNDS": 0.70,
        "NETWORK_TIMEOUT": 0.10,
        "AUTHENTICATION_FAILED": 0.10,
        "CARD_EXPIRED": 0.05,
        "GATEWAY_DOWNTIME": 0.03,
        "FRAUD_ALERT": 0.02,
    },
    "HIGH_GATEWAY_OUTAGE": {
        "NETWORK_TIMEOUT": 0.45,
        "GATEWAY_DOWNTIME": 0.35,
        "INSUFFICIENT_FUNDS": 0.10,
        "AUTHENTICATION_FAILED": 0.05,
        "CARD_EXPIRED": 0.03,
        "FRAUD_ALERT": 0.02,
    },
    "HARD_DECLINES": {
        "FRAUD_ALERT": 0.40,
        "CARD_EXPIRED": 0.30,
        "INSUFFICIENT_FUNDS": 0.15,
        "AUTHENTICATION_FAILED": 0.10,
        "NETWORK_TIMEOUT": 0.05,
    }
}

CUSTOMER_NAMES = [
    "Rajesh Sharma", "Priya Patel", "Vikram Malhotra", "Sunita Nair", "Arjun Verma",
    "Deepika Rao", "Ananya Deshmukh", "Rohan Gupta", "Kavita Iyer", "Siddharth Jain"
]

TIERS = ["STANDARD", "STANDARD", "STANDARD", "PREMIUM", "ENTERPRISE"]

class SyntheticEventGenerator:
    @staticmethod
    def generate_event(distribution: str = "BALANCED") -> dict[str, Any]:
        profile = DISTRIBUTION_PROFILES.get(distribution, DISTRIBUTION_PROFILES["BALANCED"])
        causes = list(profile.keys())
        weights = list(profile.values())

        chosen_cause = random.choices(causes, weights=weights, k=1)[0]
        customer_name = random.choice(CUSTOMER_NAMES)
        tier = random.choice(TIERS)
        amount = round(random.uniform(250.0, 15000.0), 2)

        # Realistic error codes
        code_map = {
            "INSUFFICIENT_FUNDS": ("BAD_REQUEST_INSUFFICIENT_FUNDS", "Account balance insufficient for debit"),
            "NETWORK_TIMEOUT": ("GATEWAY_TIMEOUT", "Bank network timed out during authorization"),
            "AUTHENTICATION_FAILED": ("AUTH_OTP_DROP", "Customer abandoned 3DS OTP verification"),
            "CARD_EXPIRED": ("INVALID_CARD_EXPIRY", "Card expiration date has lapsed"),
            "GATEWAY_DOWNTIME": ("ISSUER_DOWNTIME", "Card issuing bank core banking network is offline"),
            "FRAUD_ALERT": ("RISK_THRESHOLD_EXCEEDED", "Transaction flagged by risk rules"),
            "LIMIT_EXCEEDED": ("VELOCITY_LIMIT_EXCEEDED", "Daily spend velocity limit reached on card")
        }

        err_code, err_desc = code_map.get(chosen_cause, ("PAYMENT_FAILED", "Transaction failed"))

        return {
            "id": f"evt_sim_{uuid.uuid4().hex[:12]}",
            "amount": amount,
            "currency": "INR",
            "customer_name": customer_name,
            "customer_tier": tier,
            "error_code": err_code,
            "error_description": err_desc,
            "true_root_cause": chosen_cause,
            "retry_count": random.choice([0, 0, 0, 1, 2]),
            "hours_since_last_contact": random.uniform(2.0, 48.0)
        }

    @staticmethod
    def generate_batch(count: int = 500, distribution: str = "BALANCED") -> list[dict[str, Any]]:
        return [SyntheticEventGenerator.generate_event(distribution) for _ in range(count)]

synthetic_generator = SyntheticEventGenerator()
