"""
REVIVE Enterprise JWT Session & Token Management Module
Enforces strict issuer, audience, algorithm allowlist, expiration, and session binding.
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from jose import jwt, JWTError
from app.config import settings

# Enforce JWT Secrets from environment or secure fallback
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "revive_enterprise_jwt_super_secret_signing_key_2026_at_least_32_chars")
JWT_ALGORITHM = "HS256"
JWT_ISSUER = "revive-auth"
JWT_AUDIENCE = "revive-api"

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

class JWTException(Exception):
    """Base exception for JWT validation failures."""
    pass

class TokenExpiredError(JWTException):
    pass

class TokenInvalidError(JWTException):
    pass

def create_access_token(
    user_id: str,
    merchant_id: str,
    role: str,
    session_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a cryptographically signed access JWT bound to user, merchant, role, and active session.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    payload: Dict[str, Any] = {
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "sub": user_id,
        "merchant_id": merchant_id,
        "role": role,
        "session_id": session_id,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4())
    }
    
    encoded_jwt = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    user_id: str,
    session_id: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a signed refresh token with longer expiration for session rotation.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    
    payload: Dict[str, Any] = {
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "sub": user_id,
        "session_id": session_id,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4())
    }
    
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates JWT claims:
    - Verifies cryptographic signature using HS256 allowlist only.
    - Validates issuer and audience.
    - Checks expiration and not-before timestamps.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_aud": True,
                "verify_iss": True,
                "require_exp": True,
                "require_iat": True,
                "require_sub": True,
            }
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError("Access token has expired. Please refresh session or re-authenticate.")
    except JWTError as e:
        raise TokenInvalidError(f"Access token validation failed: {str(e)}")
