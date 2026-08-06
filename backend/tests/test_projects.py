from tests.helpers import register_and_login, auth_headers


async def _noop_workflow(project_id):
    return None


def test_project_lifecycle(client, monkeypatch):
    # Keep the background task from touching the LLM API during tests.
    monkeypatch.setattr("services.workflow.analyze_project_workflow", _noop_workflow)

    token = register_and_login(client, "owner@example.com")
    headers = auth_headers(token)

    res = client.post(
        "/api/projects/",
        json={
            "title": "Acme AI",
            "description": "An AI-powered thing",
            "target_audience": "Developers",
            "industry": "DevTools",
        },
        headers=headers,
    )
    assert res.status_code == 200
    project_id = res.json()["id"]

    # List returns it
    res = client.get("/api/projects/", headers=headers)
    assert res.status_code == 200
    assert any(p["id"] == project_id for p in res.json())

    # Detail returns it with a report: null
    res = client.get(f"/api/projects/{project_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Acme AI"
    assert res.json()["report"] is None

    # Analyze flips it to analyzing
    res = client.post(f"/api/projects/{project_id}/analyze", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "Analysis started"

    res = client.get(f"/api/projects/{project_id}", headers=headers)
    assert res.json()["status"] == "analyzing"

    # Second analyze while active run -> 400
    res = client.post(f"/api/projects/{project_id}/analyze", headers=headers)
    assert res.status_code == 400

    # Delete then 404
    res = client.delete(f"/api/projects/{project_id}", headers=headers)
    assert res.status_code == 200
    assert client.get(f"/api/projects/{project_id}", headers=headers).status_code == 404


def test_stale_analyzing_run_can_be_restarted(client, monkeypatch):
    monkeypatch.setattr("services.workflow.analyze_project_workflow", _noop_workflow)

    token = register_and_login(client, "stale@example.com")
    headers = auth_headers(token)

    project_id = client.post(
        "/api/projects/",
        json={"title": "Stale", "description": "Description"},
        headers=headers,
    ).json()["id"]

    client.post(f"/api/projects/{project_id}/analyze", headers=headers)

    # Simulate a crash: backdate analysis_started_at beyond the timeout
    from api.routers import projects as projects_router

    too_old = projects_router.ANALYSIS_TIMEOUT_SECONDS + 60
    from datetime import datetime, timezone, timedelta

    stale_ts = (datetime.now(timezone.utc) - timedelta(seconds=too_old)).strftime("%Y-%m-%d %H:%M:%S")

    import sqlite3

    conn = sqlite3.connect("test_startuplaunch.db")
    conn.execute("UPDATE projects SET analysis_started_at = ? WHERE id = ?", (stale_ts, project_id))
    conn.commit()
    conn.close()

    # Re-analysis is now allowed
    res = client.post(f"/api/projects/{project_id}/analyze", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "Analysis started"


def test_unauthenticated_requests_are_rejected(client):
    assert client.get("/api/projects/").status_code == 401
    assert client.get("/api/projects/1").status_code == 401
    assert (
        client.post("/api/projects/", json={"title": "x", "description": "y"}).status_code
        == 401
    )
    assert client.post("/api/projects/1/analyze").status_code == 401


def test_user_cannot_access_others_projects(client, monkeypatch):
    monkeypatch.setattr("services.workflow.analyze_project_workflow", _noop_workflow)

    token_a = register_and_login(client, "owner_a@example.com")
    token_b = register_and_login(client, "owner_b@example.com")

    project_id = client.post(
        "/api/projects/",
        json={"title": "Secret", "description": "Private"},
        headers=auth_headers(token_a),
    ).json()["id"]

    # B cannot read, delete, or analyze A's project
    assert client.get(f"/api/projects/{project_id}", headers=auth_headers(token_b)).status_code == 404
    assert client.delete(f"/api/projects/{project_id}", headers=auth_headers(token_b)).status_code == 404
    assert client.post(f"/api/projects/{project_id}/analyze", headers=auth_headers(token_b)).status_code == 404

    # B's list only contains B's projects
    list_res = client.get("/api/projects/", headers=auth_headers(token_b))
    assert project_id not in [p["id"] for p in list_res.json()]
