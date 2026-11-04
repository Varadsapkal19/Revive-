"""
REVIVE RFC 6238 TOTP Multi-Factor Authentication Module
Provides standard time-based one-time password generation, verification with drift,
and secure single-use recovery code management.
"""

import time
import hmac
import hashlib
import struct
import base64
import secrets
from typing import List, Tuple

TOTP_INTERVAL = 30  # 30-second window
TOTP_DIGITS = 6
RECOVERY_CODE_COUNT = 8

class TOTPManager:
    @staticmethod
    def generate_secret() -> str:
        """Generates a high-entropy 160-bit Base32 TOTP secret."""
        raw_bytes = secrets.token_bytes(20)
        return base64.b32encode(raw_bytes).decode("utf-8").replace("=", "")

    @staticmethod
    def get_provisioning_uri(secret: str, user_email: str, issuer: str = "REVIVE-AI") -> str:
        """Returns standard otpauth:// URI for Google Authenticator / Authy / 1Password."""
        clean_email = user_email.strip().replace(":", "")
        return f"otpauth://totp/{issuer}:{clean_email}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits={TOTP_DIGITS}&period={TOTP_INTERVAL}"

    @classmethod
    def generate_code(cls, secret: str, for_time: float | None = None) -> str:
        """Generates a 6-digit TOTP code for a specific timestamp (defaults to current time)."""
        t = time.time() if for_time is None else for_time
        time_step = int(t // TOTP_INTERVAL)
        
        # Pad secret to valid Base32 length
        padded_secret = secret.upper()
        padded_secret += "=" * ((8 - len(padded_secret) % 8) % 8)
        key = base64.b32decode(padded_secret, casefold=True)
        
        msg = struct.pack(">Q", time_step)
        h = hmac.new(key, msg, hashlib.sha1).digest()
        offset = h[19] & 0x0F
        code_int = (struct.unpack(">I", h[offset:offset + 4])[0] & 0x7FFFFFFF) % (10 ** TOTP_DIGITS)
        return f"{code_int:0{TOTP_DIGITS}d}"

    @classmethod
    def verify_code(cls, secret: str, code: str, window: int = 1) -> bool:
        """
        Verifies a 6-digit TOTP code against secret.
        Window of 1 allows +/- 30 seconds to handle client clock drift.
        """
        if not code or len(code) != TOTP_DIGITS or not code.isdigit():
            return False

        current_time = time.time()
        current_step = int(current_time // TOTP_INTERVAL)
        
        for offset in range(-window, window + 1):
            expected = cls.generate_code(secret, (current_step + offset) * TOTP_INTERVAL)
            if hmac.compare_digest(code.strip(), expected):
                return True
        return False

    @staticmethod
    def generate_recovery_codes(count: int = RECOVERY_CODE_COUNT) -> Tuple[List[str], List[str]]:
        """
        Generates human-readable recovery codes formatted 'xxxx-xxxx'.
        Returns (plain_codes, hashed_codes) where hashes should be stored in DB.
        """
        plain_codes = []
        hashed_codes = []
        for _ in range(count):
            part1 = secrets.token_hex(2)
            part2 = secrets.token_hex(2)
            code = f"{part1}-{part2}".upper()
            plain_codes.append(code)
            # Store SHA-256 hash of recovery code
            code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
            hashed_codes.append(code_hash)
        return plain_codes, hashed_codes

    @staticmethod
    def verify_recovery_code(code: str, hashed_codes: List[str]) -> Tuple[bool, List[str]]:
        """
        Verifies a single-use recovery code. If valid, consumes it and returns (True, updated_hashes).
        """
        formatted = code.strip().upper()
        target_hash = hashlib.sha256(formatted.encode("utf-8")).hexdigest()
        
        for idx, h in enumerate(hashed_codes):
            if hmac.compare_digest(target_hash, h):
                # Consume the recovery code (single use)
                remaining = [c for i, c in enumerate(hashed_codes) if i != idx]
                return True, remaining
        return False, hashed_codes

totp_manager = TOTPManager()
