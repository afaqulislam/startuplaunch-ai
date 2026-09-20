from tests.conftest import DB_PATH
from tests.helpers import register_and_login, auth_headers


def test_admin_summary_denied_for_regular_user(client):
    token = register_and_login(client, "admin-user@example.com")
    res = client.get("/api/admin/summary", headers=auth_headers(token))
    assert res.status_code == 403
    assert res.json()["detail"] == "Insufficient permissions"


def test_admin_summary_requires_auth(client):
    res = client.get("/api/admin/summary")
    assert res.status_code == 401


def test_admin_summary_returns_counts_for_admin(client, direct_db):
    token = register_and_login(client, "admin-boss@example.com")
    direct_db["run"]("UPDATE users SET role = 'admin' WHERE email = ?", ("admin-boss@example.com",))

    client.post(
        "/api/projects/",
        headers=auth_headers(token),
        json={"title": "Idea A", "description": "First idea"},
    )
    client.post(
        "/api/projects/",
        headers=auth_headers(token),
        json={"title": "Idea B", "description": "Second idea"},
    )

    login = client.post(
        "/api/auth/login",
        data={"username": "admin-boss@example.com", "password": "supersecret123"},
    )
    admin_token = login.json()["access_token"]

    res = client.get("/api/admin/summary", headers=auth_headers(admin_token))
    assert res.status_code == 200
    body = res.json()
    # The test DB is shared across the session, so assert relative behavior
    # (at least the projects this test created) rather than exact global counts.
    assert body["users"] >= 1
    assert body["projects"] >= 2
    assert set(body["projects_by_status"]) == {"completed", "analyzing", "failed", "pending"}
    assert body["projects_by_status"]["pending"] >= 2


def test_admin_role_check_is_server_side_not_client_side(client):
    # A forged token claiming role=admin must still be rejected because the
    # role in the dependency comes from the DB row, never the token claim.
    token = register_and_login(client, "forger@example.com")
    from jose import jwt
    from core.security import SECRET_KEY, ALGORITHM

    forged = jwt.encode({"sub": "forger@example.com", "ver": 0, "role": "admin"}, SECRET_KEY, algorithm=ALGORITHM)
    res = client.get("/api/admin/summary", headers=auth_headers(forged))
    assert res.status_code == 403


def test_me_returns_role(client):
    token = register_and_login(client, "me-check@example.com")
    res = client.get("/api/auth/me", headers=auth_headers(token))
    assert res.status_code == 200
    assert res.json()["email"] == "me-check@example.com"
    assert res.json()["role"] == "user"


def test_me_requires_auth(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401