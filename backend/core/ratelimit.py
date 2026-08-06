"""Lightweight in-memory rate limiting for the auth endpoints.

This is sufficient for a single-process dev deployment. For multi-worker
production deployments replace it with a shared store (e.g. Redis).
"""
import time
import threading
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def _prune(self, key: str, now: float) -> None:
        window_start = now - self.window_seconds
        hits = self._hits[key]
        while hits and hits[0] <= window_start:
            hits.popleft()

    def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            self._prune(key, now)
            hits = self._hits[key]
            if len(hits) >= self.max_requests:
                return False
            hits.append(now)
            return True

    def clear(self) -> None:
        with self._lock:
            self._hits.clear()


# Limits: 10 attempts per 15 minutes per IP, and 5 per email per 15 minutes.
login_ip_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=900)
login_email_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=900)
register_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=900)


def rate_limit(limiter: SlidingWindowRateLimiter, key: str) -> None:
    if not limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please try again later.",
        )


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"
