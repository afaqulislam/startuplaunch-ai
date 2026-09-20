from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file before anything else reads env vars

import logging

# Configure logging before importing routers/agents that emit INFO at import
# time (e.g. the rate limiter announcing its Redis backend), so those messages
# are not silently dropped by the default WARNING level.
logging.basicConfig(level=logging.INFO)

from datetime import datetime, timezone, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import update, or_, text, inspect as sa_inspect

from api.routers import auth, admin, projects, reports
from core.security import ACCESS_TOKEN_COOKIE_NAME
from database import engine, Base, SessionLocal, _is_sqlite
from models import Project, User

logger = logging.getLogger(__name__)


async def _recover_stuck_runs() -> None:
    """Mark projects stuck in "analyzing" after a crash/restart as failed so
    users can re-dispatch the swarm. Uses the same stale-run timeout as the
    analyze endpoint, so a run that is still legitimately in progress is never
    touched."""
    from api.routers.projects import ANALYSIS_TIMEOUT_SECONDS

    threshold = datetime.now(timezone.utc) - timedelta(seconds=ANALYSIS_TIMEOUT_SECONDS)
    threshold_value = threshold.replace(tzinfo=None) if _is_sqlite else threshold
    try:
        async with SessionLocal() as db:
            await db.execute(
                update(Project)
                .where(
                    Project.status == "analyzing",
                    or_(
                        Project.analysis_started_at.is_(None),
                        Project.analysis_started_at < threshold_value,
                    ),
                )
                .values(status="failed", analysis_started_at=None)
            )
            await db.commit()
    except Exception:
        logger.exception("Startup recovery sweep failed")


async def _ensure_token_version_column() -> None:
    """Dev-only schema compatibility.

    create_all() never adds columns to an *existing* database, so a SQLite or
    Postgres DB created before the token_version column would crash every
    authenticated request. Add the column if it's missing. The existence check
    keeps this idempotent; the guarded ALTER works on both dialects. Clean
    installs and production schema changes should still go through alembic.
    """
    try:
        async with engine.begin() as conn:
            columns = await conn.run_sync(
                lambda sync_conn: {
                    col["name"] for col in sa_inspect(sync_conn).get_columns("users")
                }
            )
            if "token_version" not in columns:
                await conn.execute(
                    text("ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0")
                )
                logger.info("Added missing 'token_version' column to users table")
    except Exception:
        logger.exception("Failed to apply token_version schema compatibility")


async def _ensure_role_column() -> None:
    """Dev-only schema compatibility.

    Mirrors _ensure_token_version_column for the role column so databases
    created before RBAC do not crash on the first query that selects role."
    """
    try:
        async with engine.begin() as conn:
            columns = await conn.run_sync(
                lambda sync_conn: {
                    col["name"] for col in sa_inspect(sync_conn).get_columns("users")
                }
            )
            if "role" not in columns:
                await conn.execute(
                    text("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user'")
                )
                logger.info("Added missing 'role' column to users table")
    except Exception:
        logger.exception("Failed to apply role schema compatibility")


async def _promote_admins() -> None:
    """Promote existing users listed in ADMIN_EMAILS (comma-separated) to the
    admin role at startup. Config-driven and idempotent; users not listed are
    left untouched."""
    emails = [
        email.strip().lower() for email in os.environ.get("ADMIN_EMAILS", "").split(",") if email.strip()
    ]
    if not emails:
        return
    try:
        async with SessionLocal() as db:
            result = await db.execute(
                update(User).where(User.email.in_(emails)).values(role="admin")
            )
            if result.rowcount:
                logger.info("Promoted %d user(s) to admin via ADMIN_EMAILS", result.rowcount)
            await db.commit()
    except Exception:
        logger.exception("Failed to promote admins via ADMIN_EMAILS")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # In a real production app, use Alembic migrations instead of create_all.
    # For initial dev setup, we'll auto-create tables.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Keep dev databases from the pre-token_version/pre-role era working.
    await _ensure_token_version_column()
    await _ensure_role_column()
    # Apply admin promotions configured via ADMIN_EMAILS.
    await _promote_admins()
    # Self-heal any runs left "analyzing" by an unclean shutdown.
    await _recover_stuck_runs()
    yield


app = FastAPI(title="StartupLaunch AI API", lifespan=lifespan)

# Configure CORS for the Next.js frontend (comma-separated origins via env).
cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return response


UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
# Credential-based, unauthenticated auth flows are exempt from the Origin
# check: they either don't rely on the session cookie (register/login set it
# fresh) or only clear it (logout). change-password stays protected because it
# is an authenticated state-changing call.
CSRF_EXEMPT_PATHS = {"/api/auth/login", "/api/auth/register", "/api/auth/logout"}


@app.middleware("http")
async def csrf_origin_check(request, call_next):
    # CSRF defence for cookie-authenticated sessions: an unsafe request that
    # carries the session cookie AND relies on it (no Authorization header)
    # must come from one of the allowed frontend origins. SameSite=Lax already
    # stops cross-site cookie sending in modern browsers; the Origin check also
    # covers older clients. Header-authenticated requests never fall under this
    # check even if a cookie happens to be present.
    if (
        request.method in UNSAFE_METHODS
        and "authorization" not in request.headers
        and ACCESS_TOKEN_COOKIE_NAME in request.cookies
        and request.url.path not in CSRF_EXEMPT_PATHS
    ):
        origin = request.headers.get("origin")
        if origin is None or origin not in cors_origins:
            return JSONResponse({"detail": "Invalid request origin"}, status_code=403)
    return await call_next(request)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/")
def read_root():
    return {"message": "Welcome to StartupLaunch AI API"}
