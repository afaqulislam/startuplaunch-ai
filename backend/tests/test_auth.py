from tests.helpers import register_and_login


def test_register_and_login(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "supersecret123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "new@example.com"
    # Password hash must never be serialized
    assert "hashed_password" not in data

    login = client.post(
        "/api/auth/login",
        data={"username": "new@example.com", "password": "supersecret123"},
    )
    assert login.status_code == 200
    body = login.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "password": "supersecret123"},
    )
    res = client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "password": "anotherpass123"},
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Email already registered"


def test_email_matching_is_case_insensitive(client):
    # Mixed-case registrations are normalized to lowercase...
    res = client.post(
        "/api/auth/register",
        json={"email": "Case@Example.com", "password": "supersecret123"},
    )
    assert res.status_code == 200
    assert res.json()["email"] == "case@example.com"

    # ...so a differently-cased duplicate is rejected...
    res = client.post(
        "/api/auth/register",
        json={"email": "CASE@EXAMPLE.COM", "password": "anotherpass123"},
    )
    assert res.status_code == 400
    assert res.json()["detail"] == "Email already registered"

    # ...and login works with any casing.
    for username in ("case@example.com", "CASE@example.com", "Case@Example.COM"):
        login = client.post(
            "/api/auth/login",
            data={"username": username, "password": "supersecret123"},
        )
        assert login.status_code == 200, f"login failed for {username}"
        assert login.json()["access_token"]


def test_register_rejects_weak_password(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert res.status_code == 422


def test_register_rejects_invalid_email(client):
    res = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "supersecret123"},
    )
    assert res.status_code == 422


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"email": "wrongpw@example.com", "password": "supersecret123"},
    )
    res = client.post(
        "/api/auth/login",
        data={"username": "wrongpw@example.com", "password": "nope"},
    )
    assert res.status_code == 401


def test_login_unknown_user(client):
    res = client.post(
        "/api/auth/login",
        data={"username": "ghost@example.com", "password": "whatever123"},
    )
    assert res.status_code == 401


def test_login_inactive_user_rejected(client, direct_db):
    token = register_and_login(client, "inactive@example.com")
    assert token

    direct_db["run"]("UPDATE users SET is_active = 0 WHERE email = ?", ("inactive@example.com",))

    res = client.post(
        "/api/auth/login",
        data={"username": "inactive@example.com", "password": "supersecret123"},
    )
    assert res.status_code == 401


def test_change_password_requires_auth(client):
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "x", "new_password": "newpassword456"},
    )
    assert res.status_code == 401


def test_change_password_revokes_existing_tokens(client):
    from tests.helpers import auth_headers

    token = register_and_login(client, "changepw@example.com")
    headers = auth_headers(token)

    # Wrong current password rejected
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "wrongpass", "new_password": "newpassword456"},
        headers=headers,
    )
    assert res.status_code == 400

    # Re-using the current password rejected
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "supersecret123", "new_password": "supersecret123"},
        headers=headers,
    )
    assert res.status_code == 400

    # Successful change
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "supersecret123", "new_password": "newpassword456"},
        headers=headers,
    )
    assert res.status_code == 200

    # Every previously-issued token is now revoked
    assert client.get("/api/projects/", headers=headers).status_code == 401

    # Old password fails, new password works
    assert client.post(
        "/api/auth/login",
        data={"username": "changepw@example.com", "password": "supersecret123"},
    ).status_code == 401
    new_token = client.post(
        "/api/auth/login",
        data={"username": "changepw@example.com", "password": "newpassword456"},
    ).json()["access_token"]
    assert client.get("/api/projects/", headers=auth_headers(new_token)).status_code == 200
