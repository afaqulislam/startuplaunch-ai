from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
import os
import re

# Create an SQLite database for initial development, we can switch to Postgres later if needed or configured.
# We'll use async sqlite for simplicity initially unless PG is explicitly configured.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./startuplaunch.db")

# SQLAlchemy maps a bare "postgresql://" URL to the sync psycopg2 driver, but
# this app only uses async engines, so force the asyncpg driver instead.
SQLALCHEMY_DATABASE_URL = re.sub(r"^postgresql://", "postgresql+asyncpg://", SQLALCHEMY_DATABASE_URL)
# asyncpg (and its SQLAlchemy dialect) does not accept libpq-only URL
# parameters such as sslmode or channel_binding. asyncpg defaults to
# sslmode=prefer over TCP, so dropping them is safe even for SSL-required hosts.
SQLALCHEMY_DATABASE_URL = re.sub(r"[?&](?:sslmode|channel_binding)=[^&]*", "", SQLALCHEMY_DATABASE_URL)

_is_sqlite = "sqlite" in SQLALCHEMY_DATABASE_URL

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)


# SQLite does not enforce foreign keys by default. Turn them on per-connection
# so ON DELETE CASCADE (used by Project -> Report) actually fires.
if _is_sqlite:

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session
