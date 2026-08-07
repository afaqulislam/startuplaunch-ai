import os
import sqlite3
import json

# Configure the app for tests BEFORE importing it so database.py picks up the
# test database URL and core.security picks up a test SECRET_KEY.
os.environ["SECRET_KEY"] = "test-secret-key-for-tests-only"
os.environ["GROQ_API_KEY"] = "test-dummy-key"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_startuplaunch.db"

import pytest
from fastapi.testclient import TestClient

from main import app

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "test_startuplaunch.db")


@pytest.fixture(scope="session")
def client():
    # Start from a clean database every test session.
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except PermissionError:
            pass
    # Entering the context manager runs the app lifespan (create_all) on the
    # test database.
    with TestClient(app) as c:
        yield c
    # Close pooled connections before removing the DB file (Windows locks it).
    import asyncio

    from database import engine

    asyncio.run(engine.dispose())
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except PermissionError:
            pass


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    """The rate limiter (in-memory or Redis) is process-global; reset it between
    tests so each test starts from a clean slate."""
    import asyncio

    from core.ratelimit import (
        login_ip_limiter,
        login_email_limiter,
        register_limiter,
        register_email_limiter,
        analyze_limiter,
    )

    for limiter in (
        login_ip_limiter,
        login_email_limiter,
        register_limiter,
        register_email_limiter,
        analyze_limiter,
    ):
        asyncio.run(limiter.clear())
    yield


@pytest.fixture
def direct_db():
    """Run raw SQL against the test SQLite file (used for setup/teardown that
    the public API can't express, e.g. inserting a report row)."""

    def run(query, params=()):
        conn = sqlite3.connect(DB_PATH)
        try:
            cur = conn.execute(query, params)
            conn.commit()
            return cur.lastrowid
        finally:
            conn.close()

    def insert_report(project_id, content, executive_summary="Test summary"):
        return run(
            "INSERT INTO reports (project_id, content, executive_summary) VALUES (?, ?, ?)",
            (project_id, json.dumps(content), executive_summary),
        )

    return {"run": run, "insert_report": insert_report}
