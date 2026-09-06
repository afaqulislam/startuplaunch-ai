"""Rate limiting for the auth and analyze endpoints.

Two interchangeable backends:
- SlidingWindowRateLimiter: in-process, good for a single worker / dev.
- RedisRateLimiter: shared across processes, for multi-worker production.

Both are used through the same async interface, so routing code doesn't care
which one is active. Set REDIS_URL to switch to Redis (the 'redis' package is
required then); otherwise the in-memory backend is used.
"""
import os
import time
import threading
import uuid
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status

try:
    from redis import asyncio as aioredis
except ImportError:  # pragma: no cover - depends on optional dependency
    aioredis = None


class RateLimiter:
    async def is_allowed(self, key: str) -> bool:  # pragma: no cover - interface
        raise NotImplementedError

    async def clear(self) -> None:  # pragma: no cover - interface
        raise NotImplementedError


class SlidingWindowRateLimiter(RateLimiter):
    # Bound memory: when the tracked-key map grows past this size, drop any keys
    # that no longer have hits inside their window.
    MAX_TRACKED_KEYS = 10_000

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

    def _evict_stale_keys(self) -> None:
        if len(self._hits) <= self.MAX_TRACKED_KEYS:
            return
        self._hits = defaultdict(deque, {k: v for k, v in self._hits.items() if v})

    async def is_allowed(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            self._evict_stale_keys()
            self._prune(key, now)
            hits = self._hits[key]
            if len(hits) >= self.max_requests:
                return False
            hits.append(now)
            return True

    async def clear(self) -> None:
        with self._lock:
            self._hits.clear()


class RedisRateLimiter(RateLimiter):
    """Sliding-window limiter backed by a Redis sorted set.

    Every attempt is stored as a score member; members older than the window
    are dropped and the remaining count is checked. Keys self-expire so memory
    never grows unbounded.
    """

    KEY_PREFIX = "sl_ratelimit"

    def __init__(self, max_requests: int, window_seconds: int, client):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._client = client

    def _rkey(self, key: str) -> str:
        return f"{self.KEY_PREFIX}:{self.max_requests}:{self.window_seconds}:{key}"

    async def is_allowed(self, key: str) -> bool:
        try:
            rkey = self._rkey(key)
            now = time.time()
            window_start = now - self.window_seconds
            member = f"{now:.6f}:{uuid.uuid4().hex}"
            pipe = self._client.pipeline()
            pipe.zremrangebyscore(rkey, 0, window_start)
            pipe.zadd(rkey, {member: now})
            pipe.zcard(rkey)
            pipe.expire(rkey, self.window_seconds)
            results = await pipe.execute()
            return results[2] <= self.max_requests
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                "Redis rate limiter unavailable (%s: %s); allowing request.",
                type(e).__name__,
                str(e)[:120],
            )
            # Fail open: rate limiting is best-effort. If Redis is down the
            # whole server should still serve requests rather than crash.
            return True

    async def clear(self) -> None:
        async for key in self._client.scan_iter(f"{self.KEY_PREFIX}:*"):
            await self._client.delete(key)


# Module-level Redis client (lazy; None when REDIS_URL is unset).
_redis_client = None


def _get_redis_client():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    url = os.environ.get("REDIS_URL", "")
    if url:
        if aioredis is None:
            import logging

            logging.getLogger(__name__).warning(
                "REDIS_URL is set but the 'redis' package is not installed; "
                "falling back to in-memory rate limiting."
            )
            return None
        _redis_client = aioredis.from_url(url, decode_responses=True)
        import logging

        logging.getLogger(__name__).info("Using Redis-backed rate limiting")
    return _redis_client


def _make_limiter(max_requests: int, window_seconds: int) -> RateLimiter:
    client = _get_redis_client()
    if client is not None:
        return RedisRateLimiter(max_requests, window_seconds, client)
    return SlidingWindowRateLimiter(max_requests, window_seconds)


# Limits: 10 attempts per 15 minutes per IP, and 5 per email per 15 minutes.
# Analysis dispatch is capped per user so a single account can't burn unlimited
# LLM credits through repeated swarm runs.
login_ip_limiter = _make_limiter(max_requests=10, window_seconds=900)
login_email_limiter = _make_limiter(max_requests=5, window_seconds=900)
register_limiter = _make_limiter(max_requests=10, window_seconds=900)
register_email_limiter = _make_limiter(max_requests=5, window_seconds=900)
analyze_limiter = _make_limiter(max_requests=5, window_seconds=900)


async def rate_limit(limiter: RateLimiter, key: str) -> None:
    if not await limiter.is_allowed(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please try again later.",
        )


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"
