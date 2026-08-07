"""Orchestrator edge cases: partial swarm failures must be preserved, not
thrown away."""
import asyncio

import pytest

from agents import specialized, executive
from agents.orchestrator import orchestrator


def test_partial_run_keeps_successful_sections(monkeypatch):
    async def market_run(idea):
        return {"target_market": "X"}

    async def competitor_run(idea):
        return {"direct_competitors": ["Acme"]}

    async def risk_run(idea):
        raise RuntimeError("GROQ rate limited")

    async def exec_run(idea):
        return {"recommendation": "Go"}

    monkeypatch.setattr(specialized.market_agent, "run", market_run)
    monkeypatch.setattr(specialized.competitor_agent, "run", competitor_run)
    monkeypatch.setattr(specialized.risk_agent, "run", risk_run)
    monkeypatch.setattr(executive.executive_agent, "run", exec_run)

    report = asyncio.run(orchestrator.run_analysis("A startup idea"))

    # Successful sections and the executive verdict are preserved...
    assert report["market_analysis"] == {"target_market": "X"}
    assert report["competitor_analysis"] == {"direct_competitors": ["Acme"]}
    assert report["executive_decision"] == {"recommendation": "Go"}
    # ...the failed section is flagged, not fabricated...
    assert "risk_analysis" not in report
    assert report["_partial"] is True
    assert "risk_analysis" in report["_agent_errors"]


def test_run_raises_when_all_specialists_fail(monkeypatch):
    async def boom(idea):
        raise RuntimeError("all agents down")

    for agent in (specialized.market_agent, specialized.competitor_agent, specialized.risk_agent):
        monkeypatch.setattr(agent, "run", boom)

    with pytest.raises(RuntimeError):
        asyncio.run(orchestrator.run_analysis("A startup idea"))


def test_executive_failure_yields_partial(monkeypatch):
    async def ok(idea):
        return {"key": "value"}

    async def boom(idea):
        raise RuntimeError("executive agent down")

    for agent in (specialized.market_agent, specialized.competitor_agent, specialized.risk_agent):
        monkeypatch.setattr(agent, "run", ok)
    monkeypatch.setattr(executive.executive_agent, "run", boom)

    report = asyncio.run(orchestrator.run_analysis("A startup idea"))

    # The three specialist sections survive even when the verdict step fails.
    assert report["market_analysis"] == {"key": "value"}
    assert report["_partial"] is True
    assert "executive_decision" not in report
    assert "executive_decision" in report["_agent_errors"]


def test_non_dict_agent_output_is_treated_as_failure(monkeypatch):
    async def string_run(idea):
        return "not a structured report"

    async def ok(idea):
        return {"key": "value"}

    monkeypatch.setattr(specialized.market_agent, "run", string_run)
    monkeypatch.setattr(specialized.competitor_agent, "run", ok)
    monkeypatch.setattr(specialized.risk_agent, "run", ok)
    monkeypatch.setattr(executive.executive_agent, "run", ok)

    report = asyncio.run(orchestrator.run_analysis("A startup idea"))

    assert report["_partial"] is True
    assert "market_analysis" not in report
    assert "market_analysis" in report["_agent_errors"]
