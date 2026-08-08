import asyncio
import json
from agents.specialized import market_agent, competitor_agent, risk_agent
from agents.executive import executive_agent

# Hard cap on a single swarm run so a hung LLM call can never block forever.
SWARM_TIMEOUT_SECONDS = 120


class Orchestrator:
    async def run_analysis(self, startup_idea: str) -> dict:
        async def run_all():
            market_task = market_agent.run(startup_idea)
            competitor_task = competitor_agent.run(startup_idea)
            risk_task = risk_agent.run(startup_idea)

            market_res, competitor_res, risk_res = await asyncio.gather(
                market_task, competitor_task, risk_task
            )

            combined_report = {
                "market_research": market_res,
                "competitor_analysis": competitor_res,
                "risk_assessment": risk_res,
            }

            # Run executive agent with combined reports
            executive_input = json.dumps(combined_report)
            executive_res = await executive_agent.run(executive_input)

            return {
                "market_analysis": market_res,
                "competitor_analysis": competitor_res,
                "risk_analysis": risk_res,
                "executive_decision": executive_res,
            }

        return await asyncio.wait_for(run_all(), timeout=SWARM_TIMEOUT_SECONDS)


orchestrator = Orchestrator()
