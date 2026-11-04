"""
REVIVE Enterprise Security Middleware
Implements OWASP Security Headers, Request Correlation IDs, Request Size Limits,
and Safe Sanitized Exception Handling.
"""

import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.types import ASGIApp

logger = logging.getLogger("revive.security.middleware")

MAX_REQUEST_BODY_SIZE = 2 * 1024 * 1024  # 2 Megabytes limit

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Enforce Correlation ID
        correlation_id = request.headers.get("x-correlation-id") or str(uuid.uuid4())
        
        # 2. Enforce Content-Length / Request Size Limit
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length_int = int(content_length)
                if length_int > MAX_REQUEST_BODY_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={"error": "Payload Too Large", "detail": "Request body exceeds maximum size of 2MB."}
                    )
            except ValueError:
                pass

        try:
            response: Response = await call_next(request)
        except Exception as exc:
            logger.error(f"[CorrelationID: {correlation_id}] Unhandled error: {exc}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "InternalServerError",
                    "message": "An unexpected security or processing error occurred. Incident has been recorded.",
                    "correlation_id": correlation_id
                }
            )

        # 3. Inject Production Hardened Security Headers
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "frame-ancestors 'none';"
        )
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        
        return response
