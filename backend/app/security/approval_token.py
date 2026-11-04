"""
REVIVE Cryptographic Execution Approval Token Module
Enforces Section 8 AI Agent Security:
Every financial intervention executed by the Executor Agent must be backed by a
cryptographically signed, short-lived, replay-protected approval issued strictly by
the Deterministic Policy Engine.
"""

import os
import hmac
import hashlib
import json
import uuid
import time
import base64
from typing import Dict, Any, Set

APPROVAL_SECRET_KEY = os.getenv("APPROVAL_SECRET_KEY", "revive_deterministic_agent_guardrail_approval_secret_2026")
APPROVAL_VALIDITY_SECONDS = 300  # 5 minutes validity

# In-memory consumed nonces cache to prevent replay attacks (in production backed by Redis)
CONSUMED_APPROVAL_NONCES: Set[str] = set()

class ApprovalValidationError(Exception):
    """Raised when an execution approval token fails cryptographic or invariant checks."""
    pass

def compute_payload_hash(payload: Dict[str, Any]) -> str:
    """Computes deterministic SHA-256 hash of canonical JSON payload."""
    serialized = json.dumps(payload or {}, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

def issue_execution_approval(
    merchant_id: str,
    case_id: str,
    action_type: str,
    action_payload: Dict[str, Any],
    policy_version: int = 1
) -> str:
    """
    Generates a cryptographically signed execution approval token binding:
    - Merchant ID
    - Case ID
    - Action Type
    - Payload Hash
    - Policy Version
    - Unique Nonce
    - Expiration Timestamp
    """
    now = int(time.time())
    expires_at = now + APPROVAL_VALIDITY_SECONDS
    nonce = f"appr_nonce_{uuid.uuid4().hex}"
    
    payload_hash = compute_payload_hash(action_payload)
    
    claim_data = {
        "merchant_id": merchant_id,
        "case_id": case_id,
        "action_type": action_type,
        "payload_hash": payload_hash,
        "policy_version": policy_version,
        "nonce": nonce,
        "iat": now,
        "exp": expires_at
    }
    
    serialized = json.dumps(claim_data, separators=(",", ":"))
    b64_claim = base64.urlsafe_b64encode(serialized.encode("utf-8")).decode("utf-8").rstrip("=")
    
    signature = hmac.new(
        key=APPROVAL_SECRET_KEY.encode("utf-8"),
        msg=b64_claim.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    return f"{b64_claim}.{signature}"

def verify_execution_approval(
    approval_token: str,
    expected_merchant_id: str,
    expected_case_id: str,
    executed_action_type: str,
    executed_action_payload: Dict[str, Any]
) -> bool:
    """
    Independently verifies the execution approval:
    1. Cryptographic HMAC signature check (constant-time)
    2. Expiration check
    3. Replay protection via Nonce check
    4. Merchant ID & Case ID match
    5. Action type match
    6. Executed payload hash matches approved payload hash
    """
    if not approval_token or "." not in approval_token:
        raise ApprovalValidationError("Missing or malformed execution approval token.")
    
    parts = approval_token.split(".")
    if len(parts) != 2:
        raise ApprovalValidationError("Invalid approval token format.")
    
    b64_claim, signature = parts[0], parts[1]
    
    # Verify cryptographic signature
    expected_sig = hmac.new(
        key=APPROVAL_SECRET_KEY.encode("utf-8"),
        msg=b64_claim.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_sig):
        raise ApprovalValidationError("Cryptographic signature verification failed on execution approval.")
    
    # Decode claim
    try:
        padded = b64_claim + "=" * ((4 - len(b64_claim) % 4) % 4)
        raw_json = base64.urlsafe_b64decode(padded).decode("utf-8")
        claim = json.loads(raw_json)
    except Exception as e:
        raise ApprovalValidationError(f"Failed to parse approval token payload: {str(e)}")
    
    # 1. Expiration check
    now = int(time.time())
    if now > claim.get("exp", 0):
        raise ApprovalValidationError("Execution approval token has expired.")
    
    # 2. Nonce replay check
    nonce = claim.get("nonce", "")
    if not nonce or nonce in CONSUMED_APPROVAL_NONCES:
        raise ApprovalValidationError(f"Execution approval nonce '{nonce}' has already been consumed or is invalid (replay attack blocked).")
    
    # 3. Tenant and resource match
    if claim.get("merchant_id") != expected_merchant_id:
        raise ApprovalValidationError(
            f"Approval tenant mismatch: token={claim.get('merchant_id')} vs expected={expected_merchant_id}"
        )
    
    if claim.get("case_id") != expected_case_id:
        raise ApprovalValidationError(
            f"Approval case mismatch: token={claim.get('case_id')} vs expected={expected_case_id}"
        )
    
    # 4. Action type match
    if claim.get("action_type") != executed_action_type:
        raise ApprovalValidationError(
            f"Approval action mismatch: token={claim.get('action_type')} vs executed={executed_action_type}"
        )
    
    # 5. Payload hash match (ensures the LLM or caller did not tamper with discount, amount, or parameters)
    executed_hash = compute_payload_hash(executed_action_payload)
    if claim.get("payload_hash") != executed_hash:
        raise ApprovalValidationError(
            f"Approval payload tampering detected: hash mismatch between approved plan and executed payload."
        )
    
    # Consume nonce
    CONSUMED_APPROVAL_NONCES.add(nonce)
    return True
