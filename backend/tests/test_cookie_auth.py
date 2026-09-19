"""HttpOnly cookie session tests: login sets the cookie, cookie-only requests
authenticate, CSRF blocks cookie-authenticated unsafe requests from foreign
origins, and logout clears the session."""

from tests.helpers import auth_headers, register_and_login

# Origin the app is configured to accept (CORS_ORIGINS default).
ALLOWED_ORIGIN = "http://localhost:3000"
FOREIGN_ORIGIN = "https://evil.example.com"


def test_login_sets_http_only_cookie(client):
    client.post(
        "/api/auth/register",
        json={"email": "cookielogin@example.com", "password": "supersecret123"},
    )
    res = client.post(
        "/api/auth/login",
        data={"username": "cookielogin@example.com", "password": "supersecret123"},
    )
    assert res.status_code == 200
    set_cookie = res.headers.get("set-cookie", "")
    assert "access_token=" in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Path=/" in set_cookie
    # JSON token is still returned for Authorization-header clients.
    assert res.json()["access_token"]


def test_cookie_authenticated_request_works(client):
    register_and_login(client, "cookiedefault@example.com")
    res = client.get("/api/projects/")
    assert res.status_code == 200


def test_cookie_authenticated_state_changing_request_needs_origin(client):
    register_and_login(client, "cookiecsrf@example.com")
    client.post(
        "/api/projects/",
        json={
            "title": "CSRF project",
            "description": "State-changing request via cookie only",
        },
        headers={"Origin": ALLOWED_ORIGIN},
    )
    # Send an unsafe POST relying on the cookie but from a foreign origin.
    res = client.post(
        "/api/projects/9/analyze",
        headers={"Origin": FOREIGN_ORIGIN},
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "Invalid request origin"


def test_cookie_authenticated_request_without_origin_rejected(client):
    register_and_login(client, "cookienoorigin@example.com")
    res = client.post(
        "/api/projects/",
        json={"title": "T", "description": "D"},
    )
    assert res.status_code == 403


def test_header_authenticated_request_ignores_csrf_check(client):
    # Even though the cookie jar may hold a valid cookie, a request carrying an
    # Authorization header must not be subject to the Origin check.
    token = register_and_login(client, "csrfheader@example.com")
    res = client.post(
        "/api/projects/",
        json={"title": "Header auth", "description": "Works without Origin"},
        headers=auth_headers(token),
    )
    assert res.status_code == 200


def test_logout_clears_session_cookie(client):
    register_and_login(client, "cookieout@example.com")
    assert client.get("/api/projects/").status_code == 200

    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    set_cookie = res.headers.get("set-cookie", "")
    assert "access_token=" in set_cookie
    assert "Path=/" in set_cookie

    # Cookie is gone, so the previously-working cookie-only requests now 401.
    assert client.get("/api/projects/").status_code == 401