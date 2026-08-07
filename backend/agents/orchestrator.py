import asyncio
import json
from agents.specialized import market_agent, competitor_agent, risk_agent
from agents.executive import executive_agent

# Hard cap on a single swarm run so a hung LLM call can never block forever.
# Generous enough to also cover per-agent retries with backoff.
SWARM_TIMEOUT_SECONDS = 300


class Orchestrator:
    async def run_analysis(self, startup_idea: str) -> dict:
        async def run_all():
            market_task = market_agent.run(startup_idea)
            competitor_task = competitor_agent.run(startup_idea)
            risk_task = risk_agent.run(startup_idea)

            # Gather with return_exceptions so one failing agent doesn't discard
            # the work the other two already did. Partial runs are still useful
            # to the user and far better than throwing everything away.
            results = await asyncio.gather(
                market_task, competitor_task, risk_task, return_exceptions=True
            )

            sections: dict = {}
            errors: dict = {}
            for name, result in zip(
                ("market_analysis", "competitor_analysis", "risk_analysis"), results
            ):
                if isinstance(result, BaseException):
                    errors[name] = str(result)
                elif isinstance(result, dict):
                    sections[name] = result
                else:
                    errors[name] = f"Agent returned unexpected type: {type(result).__name__}"

            if not sections:
                # Every specialist failed; nothing meaningful to merge or have the
                # executive verdict over. Fail the run so the user can retry.
                raise RuntimeError(f"All swarm agents failed: {errors}")

            # The executive agent ingests the *successful* specialist reports.
            combined_report = {
                "market_research": sections.get("market_analysis"),
                "competitor_analysis": sections.get("competitor_analysis"),
                "risk_assessment": sections.get("risk_analysis"),
            }
            try:
                executive_input = json.dumps(combined_report)
                executive_res = await executive_agent.run(executive_input)
                if isinstance(executive_res, dict):
                    sections["executive_decision"] = executive_res
                else:
                    errors["executive_decision"] = (
                        f"Executive agent returned unexpected type: {type(executive_res).__name__}"
                    )
            except Exception as e:
                errors["executive_decision"] = str(e)

            if errors:
                # Metadata flags so consumers (and the UI) can show "partial"
                # instead of treating a degraded report as a complete one.
                sections["_partial"] = True
                sections["_agent_errors"] = errors

            return sections

        return await asyncio.wait_for(run_all(), timeout=SWARM_TIMEOUT_SECONDS)


orchestrator = Orchestrator()
