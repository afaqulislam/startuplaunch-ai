"""Orchestrator: dispatches the three specialists and the executive verdict."""
import asyncio

import pytest

from agents import executive, specialized
from agents.orchestrator import orchestrator


def test_run_analysis_returns_full_report(monkeypatch):
    async def market_run(idea):
        return {"target_market": "X"}

    async def competitor_run(idea):
        return {"direct_competitors": ["Acme"]}

    async def risk_run(idea):
        return {"technical_risks": ["R"]}

    async def exec_run(idea):
        return {"recommendation": "Go", "executive_summary": "summary"}

    monkeypatch.setattr(specialized.market_agent, "run", market_run)
    monkeypatch.setattr(specialized.competitor_agent, "run", competitor_run)
    monkeypatch.setattr(specialized.risk_agent, "run", risk_run)
    monkeypatch.setattr(executive.executive_agent, "run", exec_run)

    report = asyncio.run(orchestrator.run_analysis("A startup idea"))

    assert report == {
        "market_analysis": {"target_market": "X"},
        "competitor_analysis": {"direct_competitors": ["Acme"]},
        "risk_analysis": {"technical_risks": ["R"]},
        "executive_decision": {"recommendation": "Go", "executive_summary": "summary"},
    }


def test_run_analysis_propagates_specialist_failure(monkeypatch):
    async def boom(idea):
        raise RuntimeError("GROQ rate limited")

    for agent in (specialized.market_agent, specialized.competitor_agent, specialized.risk_agent):
        monkeypatch.setattr(agent, "run", boom)

    with pytest.raises(RuntimeError, match="GROQ rate limited"):
        asyncio.run(orchestrator.run_analysis("A startup idea"))


def test_run_analysis_propagates_executive_failure(monkeypatch):
    async def ok(idea):
        return {"key": "value"}

    async def boom(idea):
        raise RuntimeError("executive agent down")

    for agent in (specialized.market_agent, specialized.competitor_agent, specialized.risk_agent):
        monkeypatch.setattr(agent, "run", ok)
    monkeypatch.setattr(executive.executive_agent, "run", boom)

    with pytest.raises(RuntimeError, match="executive agent down"):
        asyncio.run(orchestrator.run_analysis("A startup idea"))
