"""
REVIVE Distributed Rate Limiting & Abuse Prevention Module
Provides sliding window rate limiting backed by Redis with thread-safe in-memory fallback.
Protects against brute force, enumeration, and resource exhaustion.
"""

import time
import threading
from typing import Dict, List, Tuple, Optional
from fastapi import Request, HTTPException, status
from app.config import settings

class RateLimitExceeded(HTTPException):
    def __init__(self, detail: str = "Rate limit exceeded. Please slow down and try again later.", retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers={"Retry-After": str(retry_after)}
        )

class SlidingWindowRateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        # In-memory store: { key: [(timestamp1), (timestamp2), ...] }
        self._buckets: Dict[str, List[float]] = {}
        self._redis_client = None
        self._redis_attempted = False

    def _get_redis(self):
        if not self._redis_attempted:
            self._redis_attempted = True
            try:
                # If Redis is explicitly disabled or default local URL without live Redis, fallback directly to in-memory
                if "localhost" in settings.REDIS_URL or "127.0.0.1" in settings.REDIS_URL:
                    import socket
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(0.1)
                    res = sock.connect_ex(("127.0.0.1", 6379))
                    sock.close()
                    if res != 0:
                        self._redis_client = None
                        return None

                import redis
                r = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_timeout=0.2,
                    socket_connect_timeout=0.2
                )
                r.ping()
                self._redis_client = r
            except Exception:
                self._redis_client = None
        return self._redis_client

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        """
        Evaluates sliding window:
        Returns (is_allowed, remaining_quota).
        """
        now = time.time()
        window_start = now - window_seconds

        # Attempt Redis sliding window
        r = self._get_redis()
        if r:
            try:
                pipe = r.pipeline()
                redis_key = f"rl:{key}"
                pipe.zremrangebyscore(redis_key, 0, window_start)
                pipe.zadd(redis_key, {str(now): now})
                pipe.zcard(redis_key)
                pipe.expire(redis_key, window_seconds + 5)
                results = pipe.execute()
                current_count = results[2]
                if current_count > max_requests:
                    return False, 0
                return True, max_requests - current_count
            except Exception:
                pass  # Fallback to in-memory

        # In-memory sliding window implementation
        with self._lock:
            timestamps = self._buckets.get(key, [])
            # Prune out-of-window timestamps
            valid_timestamps = [ts for ts in timestamps if ts > window_start]
            
            if len(valid_timestamps) >= max_requests:
                self._buckets[key] = valid_timestamps
                return False, 0
            
            valid_timestamps.append(now)
            self._buckets[key] = valid_timestamps
            return True, max_requests - len(valid_timestamps)

    def check_or_raise(self, key: str, max_requests: int, window_seconds: int, action_name: str = "request") -> None:
        allowed, remaining = self.is_allowed(key, max_requests, window_seconds)
        if not allowed:
            raise RateLimitExceeded(
                detail=f"Rate limit exceeded for {action_name}. Maximum {max_requests} attempts allowed per {window_seconds}s.",
                retry_after=window_seconds
            )

rate_limiter = SlidingWindowRateLimiter()

def get_client_ip(request: Request) -> str:
    """Extracts client IP safely without blindly trusting forged headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the leftmost untrusted IP or first hop
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"
