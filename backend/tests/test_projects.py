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


def test_read_projects_validates_pagination(client):
    token = register_and_login(client, "paging@example.com")
    headers = auth_headers(token)

    assert client.get("/api/projects/?limit=0", headers=headers).status_code == 422
    assert client.get("/api/projects/?limit=1000", headers=headers).status_code == 422
    assert client.get("/api/projects/?skip=-1", headers=headers).status_code == 422
    assert client.get("/api/projects/?limit=50", headers=headers).status_code == 200


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


def test_startup_recovery_sweep_marks_stale_runs_failed(client, monkeypatch):
    monkeypatch.setattr("services.workflow.analyze_project_workflow", _noop_workflow)

    token = register_and_login(client, "sweep@example.com")
    headers = auth_headers(token)

    project_id = client.post(
        "/api/projects/",
        json={"title": "Crashed", "description": "Description"},
        headers=headers,
    ).json()["id"]

    # The run is in progress
    client.post(f"/api/projects/{project_id}/analyze", headers=headers)
    assert client.get(f"/api/projects/{project_id}", headers=headers).json()["status"] == "analyzing"

    # Simulate an unclean shutdown: backdate analysis_started_at past the timeout.
    from datetime import datetime, timezone, timedelta
    from api.routers import projects as projects_router

    too_old = projects_router.ANALYSIS_TIMEOUT_SECONDS + 60
    stale_ts = (datetime.now(timezone.utc) - timedelta(seconds=too_old)).strftime("%Y-%m-%d %H:%M:%S")

    import sqlite3

    conn = sqlite3.connect("test_startuplaunch.db")
    conn.execute("UPDATE projects SET analysis_started_at = ? WHERE id = ?", (stale_ts, project_id))
    conn.commit()
    conn.close()

    # The startup sweep runs on boot; invoke it directly.
    import asyncio
    from main import _recover_stuck_runs

    asyncio.run(_recover_stuck_runs())

    # Stale run is marked failed (not silently deleted) and can be re-dispatched.
    assert client.get(f"/api/projects/{project_id}", headers=headers).json()["status"] == "failed"
    assert client.post(f"/api/projects/{project_id}/analyze", headers=headers).status_code == 200


def test_startup_recovery_sweep_skips_recent_runs(client, monkeypatch):
    monkeypatch.setattr("services.workflow.analyze_project_workflow", _noop_workflow)

    token = register_and_login(client, "fresh_run@example.com")
    headers = auth_headers(token)

    project_id = client.post(
        "/api/projects/",
        json={"title": "Fresh", "description": "Description"},
        headers=headers,
    ).json()["id"]

    client.post(f"/api/projects/{project_id}/analyze", headers=headers)

    import asyncio
    from main import _recover_stuck_runs

    asyncio.run(_recover_stuck_runs())

    # A legitimately in-progress run must never be touched by the sweep.
    assert client.get(f"/api/projects/{project_id}", headers=headers).json()["status"] == "analyzing"


def test_read_projects_server_side_search_and_status(client):
    token = register_and_login(client, "search@example.com")
    headers = auth_headers(token)

    def create(title, description, industry):
        return client.post(
            "/api/projects/",
            json={"title": title, "description": description, "industry": industry},
            headers=headers,
        ).json()["id"]

    acme_id = create("Acme AI", "An AI-powered CRM", "DevTools")
    food_id = create("Burger Bot", "Robotic kitchen assistant", "FoodTech")

    # Give the status filter something to work with.
    import sqlite3

    conn = sqlite3.connect("test_startuplaunch.db")
    conn.execute("UPDATE projects SET status = 'failed' WHERE id = ?", (acme_id,))
    conn.commit()
    conn.close()

    # Search matches title, description, and industry.
    assert [p["id"] for p in client.get("/api/projects/?search=acme", headers=headers).json()] == [acme_id]
    assert [p["id"] for p in client.get("/api/projects/?search=kitchen", headers=headers).json()] == [food_id]
    assert [p["id"] for p in client.get("/api/projects/?search=FoodTech", headers=headers).json()] == [food_id]

    # Status filter.
    assert [p["id"] for p in client.get("/api/projects/?status=failed", headers=headers).json()] == [acme_id]

    # Combined search + status.
    assert [p["id"] for p in client.get("/api/projects/?search=acme&status=failed", headers=headers).json()] == [acme_id]
    assert client.get("/api/projects/?search=acme&status=pending", headers=headers).json() == []

    # Search composes with pagination.
    res = client.get("/api/projects/?search=bur", headers=headers)
    assert [p["id"] for p in res.json()] == [food_id]


def test_partial_report_is_saved(client, monkeypatch):
    # One specialist "fails"; the others succeed. The report must still be saved
    # and flagged as partial instead of discarding the successful work.
    async def fake_run(idea):
        return {
            "market_analysis": {"target_market": "X"},
            "competitor_analysis": {"direct_competitors": ["Acme"]},
            "_partial": True,
            "_agent_errors": {"risk_analysis": "GROQ down"},
        }

    from agents.orchestrator import orchestrator as orch

    monkeypatch.setattr(orch, "run_analysis", fake_run)

    token = register_and_login(client, "partial@example.com")
    headers = auth_headers(token)

    project_id = client.post(
        "/api/projects/",
        json={"title": "Partial", "description": "Description"},
        headers=headers,
    ).json()["id"]

    assert client.post(f"/api/projects/{project_id}/analyze", headers=headers).status_code == 200

    detail = client.get(f"/api/projects/{project_id}", headers=headers).json()
    assert detail["status"] == "completed"
    content = detail["report"]["content"]
    assert content["_partial"] is True
    assert content["market_analysis"] == {"target_market": "X"}


def test_analyze_is_rate_limited_per_user(client, monkeypatch):
    from api.routers import projects as projects_router

    # Tighten the window so the test doesn't need 6 real analyze calls.
    monkeypatch.setattr(projects_router.analyze_limiter, "max_requests", 2)

    token = register_and_login(client, "rl@example.com")
    headers = auth_headers(token)

    project_id = client.post(
        "/api/projects/",
        json={"title": "Rl", "description": "Description"},
        headers=headers,
    ).json()["id"]

    def _unstick():
        # Backdate analysis_started_at so the endpoint accepts a re-dispatch.
        import sqlite3

        conn = sqlite3.connect("test_startuplaunch.db")
        conn.execute(
            "UPDATE projects SET analysis_started_at = NULL WHERE id = ?",
            (project_id,),
        )
        conn.commit()
        conn.close()

    assert client.post(f"/api/projects/{project_id}/analyze", headers=headers).status_code == 200
    _unstick()
    assert client.post(f"/api/projects/{project_id}/analyze", headers=headers).status_code == 200
    _unstick()
    # Third dispatch exceeds the per-user cap -> 429
    assert client.post(f"/api/projects/{project_id}/analyze", headers=headers).status_code == 429
