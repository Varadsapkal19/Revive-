"""
REVIVE Enterprise Password Security Module
Implements Argon2id password hashing, policy validation (min 12 chars, complexity),
and breached password dictionary checks.
"""

import os
import base64
import hmac
import re
from typing import Tuple
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from cryptography.exceptions import InvalidKey

# Argon2id Recommended Parameters (RFC 9106 / OWASP)
ARGON2_MEMORY_COST = 65536  # 64 MB
ARGON2_TIME_COST = 2        # 2 iterations
ARGON2_PARALLELISM = 4      # 4 parallel lanes
ARGON2_KEY_LENGTH = 32      # 32 bytes derived key
ARGON2_SALT_LENGTH = 16     # 16 bytes random salt

# Common breached passwords blacklist (sample of highly common breached passwords >= 12 chars)
COMMON_BREACHED_PASSWORDS = {
    "password123456", "password12345678", "admin12345678", "welcome123456",
    "qwerty12345678", "letmein123456", "changeme123456", "iloveyou123456",
    "administrator123", "companyadmin123", "financialops123", "reviveadmin123"
}

class PasswordPolicyError(ValueError):
    """Raised when password violates complexity or security rules."""
    pass

def validate_password_strength(password: str) -> None:
    """
    Enforces enterprise password requirements:
    - Minimum length: 12 characters.
    - At least 1 uppercase letter.
    - At least 1 lowercase letter.
    - At least 1 numerical digit.
    - At least 1 special character.
    - Not in known breached password list.
    """
    if not password or len(password) < 12:
        raise PasswordPolicyError("Password must be at least 12 characters in length.")

    if len(password) > 128:
        raise PasswordPolicyError("Password must not exceed 128 characters.")

    if not re.search(r"[A-Z]", password):
        raise PasswordPolicyError("Password must include at least one uppercase letter (A-Z).")

    if not re.search(r"[a-z]", password):
        raise PasswordPolicyError("Password must include at least one lowercase letter (a-z).")

    if not re.search(r"[0-9]", password):
        raise PasswordPolicyError("Password must include at least one number (0-9).")

    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]", password):
        raise PasswordPolicyError("Password must include at least one special character.")

    if password.lower() in COMMON_BREACHED_PASSWORDS:
        raise PasswordPolicyError("Password is commonly breached and insecure. Please choose a different password.")

def hash_password(password: str) -> str:
    """
    Hashes password using Argon2id with cryptographically secure random salt.
    Returns standard PHC formatted string:
    $argon2id$v=19$m=65536,t=2,p=4$<b64salt>$<b64hash>
    """
    salt = os.urandom(ARGON2_SALT_LENGTH)
    kdf = Argon2id(
        salt=salt,
        length=ARGON2_KEY_LENGTH,
        iterations=ARGON2_TIME_COST,
        lanes=ARGON2_PARALLELISM,
        memory_cost=ARGON2_MEMORY_COST,
    )
    derived = kdf.derive(password.encode("utf-8"))
    
    salt_b64 = base64.b64encode(salt).decode("utf-8").rstrip("=")
    derived_b64 = base64.b64encode(derived).decode("utf-8").rstrip("=")
    
    return f"$argon2id$v=19$m={ARGON2_MEMORY_COST},t={ARGON2_TIME_COST},p={ARGON2_PARALLELISM}${salt_b64}${derived_b64}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies plain password against Argon2id hash using constant-time comparison.
    Supports backward-compatibility with fallback checks.
    """
    if not hashed_password or not plain_password:
        return False

    try:
        if hashed_password.startswith("$argon2id$"):
            # Parse parameters: $argon2id$v=19$m=65536,t=2,p=4$salt$hash
            parts = hashed_password.split("$")
            if len(parts) < 6:
                return False
            
            # parts[1] = "argon2id", parts[2] = "v=19", parts[3] = "m=65536,t=2,p=4"
            params_str = parts[3]
            params = dict(item.split("=") for item in params_str.split(","))
            memory_cost = int(params.get("m", ARGON2_MEMORY_COST))
            time_cost = int(params.get("t", ARGON2_TIME_COST))
            lanes = int(params.get("p", ARGON2_PARALLELISM))
            
            salt_b64 = parts[4]
            # Pad base64 if needed
            salt_b64 += "=" * ((4 - len(salt_b64) % 4) % 4)
            salt = base64.b64decode(salt_b64)
            
            expected_hash_b64 = parts[5]
            expected_hash_b64 += "=" * ((4 - len(expected_hash_b64) % 4) % 4)
            expected_hash = base64.b64decode(expected_hash_b64)
            
            kdf = Argon2id(
                salt=salt,
                length=len(expected_hash),
                iterations=time_cost,
                lanes=lanes,
                memory_cost=memory_cost,
            )
            derived = kdf.derive(plain_password.encode("utf-8"))
            return hmac.compare_digest(derived, expected_hash)
            
        elif hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            # Bcrypt fallback
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
            
        else:
            # Fallback comparison for demo legacy seeds during migration
            return hmac.compare_digest(plain_password, hashed_password)
            
    except Exception:
        return False
