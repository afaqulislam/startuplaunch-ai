import asyncio
import sqlite3
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from jose import jwt

from api.deps import require_role
from core.security import SECRET_KEY, ALGORITHM
from main import app
from tests.conftest import DB_PATH
from tests.helpers import register_and_login


def _role_of(token):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("role")


def _fetch_scalar(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    try:
        row = conn.execute(query, params).fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def test_register_defaults_to_user_role(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "rbac-user@example.com", "password": "supersecret123"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "user"
    # Role is stored in the DB, not just echoed from the request.
    assert _fetch_scalar("SELECT role FROM users WHERE email = ?", ("rbac-user@example.com",)) == "user"


def test_login_token_carries_role_claim(client):
    token = register_and_login(client, "rbac-claim@example.com")
    assert _role_of(token) == "user"


def test_promoted_admin_role_reflects_in_new_token(client, direct_db):
    register_and_login(client, "promoted@example.com")
    direct_db["run"]("UPDATE users SET role = 'admin' WHERE email = ?", ("promoted@example.com",))
    login = client.post(
        "/api/auth/login",
        data={"username": "promoted@example.com", "password": "supersecret123"},
    )
    assert login.status_code == 200
    assert _role_of(login.json()["access_token"]) == "admin"


def test_admin_emails_env_promotes_existing_users(client, monkeypatch):
    client.post(
        "/api/auth/register",
        json={"email": "envadmin@example.com", "password": "supersecret123"},
    )
    assert _fetch_scalar("SELECT role FROM users WHERE email = ?", ("envadmin@example.com",)) == "user"

    monkeypatch.setenv("ADMIN_EMAILS", "envadmin@example.com, ghost@example.com")
    with TestClient(app):
        pass

    assert _fetch_scalar("SELECT role FROM users WHERE email = ?", ("envadmin@example.com",)) == "admin"


def test_require_role_allows_matching_role():
    user = SimpleNamespace(role="admin")
    assert asyncio.run(require_role("admin")(current_user=user)) is user


def test_require_role_allows_any_of_multiple_roles():
    user = SimpleNamespace(role="user")
    assert asyncio.run(require_role("user", "editor")(current_user=user)).role == "user"


def test_require_role_denies_wrong_role():
    user = SimpleNamespace(role="user")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(require_role("admin")(current_user=user))
    assert exc.value.status_code == 403
    assert exc.value.detail == "Insufficient permissions"