import os
from openai import AsyncOpenAI
import json
import logging
import re

logger = logging.getLogger(__name__)


def _extract_json_object(content: str) -> dict:
    """Parse a JSON object from an LLM response, tolerating markdown fences."""
    if not content:
        raise ValueError("Agent returned an empty response")

    stripped = content.strip()
    # Strip ```json ... ``` fences if present
    fence = re.search(r"```(?:json)?\s*(.*?)```", stripped, re.DOTALL)
    if fence:
        stripped = fence.group(1).strip()

    start, end = stripped.find("{"), stripped.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"Agent response did not contain a JSON object: {content[:200]!r}")

    return json.loads(stripped[start : end + 1])


class BaseAgent:
    def __init__(self, name: str, instructions: str, model: str = "openai/gpt-oss-120b"):
        self.name = name
        self.instructions = instructions
        self.model = model

    def _get_client(self) -> AsyncOpenAI:
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to the .env file so the agent swarm can run."
            )
        return AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )

    async def run(self, input_data: str) -> dict:
        # Agents must fail loudly rather than silently return fabricated data.
        # A failed run marks the project as "failed" so the user knows the
        # analysis did not complete.
        client = self._get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.instructions},
                {"role": "user", "content": input_data}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        result = _extract_json_object(content)
        if "error" in result and "agent" in result:
            raise Exception(result["error"])
        return result
