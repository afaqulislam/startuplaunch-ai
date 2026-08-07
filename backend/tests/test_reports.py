from tests.helpers import register_and_login, auth_headers


def test_report_ownership_enforced(client, direct_db):
    token_a = register_and_login(client, "reporter_a@example.com")
    token_b = register_and_login(client, "reporter_b@example.com")

    project_id = client.post(
        "/api/projects/",
        json={"title": "Reported", "description": "Description"},
        headers=auth_headers(token_a),
    ).json()["id"]

    content = {
        "market_analysis": {"target_market": "Devs", "market_size": {"tam": "$1B", "sam": "$100M", "som": "$10M"}, "trends": []},
        "competitor_analysis": {"direct_competitors": [], "indirect_competitors": [], "differentiators": []},
        "risk_analysis": {"technical_risks": [], "market_risks": [], "execution_risks": [], "mitigation_strategies": []},
        "executive_decision": {"executive_summary": "Good", "recommendation": "Go", "key_takeaways": []},
    }
    report_id = direct_db["insert_report"](project_id, content)

    res = client.get(f"/api/reports/{report_id}", headers=auth_headers(token_b))
    assert res.status_code == 403

    res = client.get(f"/api/reports/{report_id}", headers=auth_headers(token_a))
    assert res.status_code == 200
    assert res.json()["content"]["executive_decision"]["recommendation"] == "Go"


def test_report_not_found(client):
    token = register_and_login(client, "report_missing@example.com")
    res = client.get("/api/reports/9999", headers=auth_headers(token))
    assert res.status_code == 404


def test_report_requires_auth(client):
    assert client.get("/api/reports/1").status_code == 401
