"""BaseAgent: strict JSON extraction from LLM responses and default model."""
import json

import pytest

from agents.base import BaseAgent, _extract_json_object


def test_extract_json_object_parses_plain_json():
    assert _extract_json_object('{"a": 1}') == {"a": 1}


def test_extract_json_object_strips_markdown_fence():
    content = '```json\n{"target_market": "EdTech"}\n```'
    assert _extract_json_object(content) == {"target_market": "EdTech"}


def test_extract_json_object_finds_object_in_prose():
    content = 'Here is the analysis:\n{"a": 1}\nDone.'
    assert _extract_json_object(content) == {"a": 1}


def test_extract_json_object_empty_raises():
    with pytest.raises(ValueError):
        _extract_json_object("")


def test_extract_json_object_no_braces_raises():
    with pytest.raises(ValueError):
        _extract_json_object("just plain text with no json")


def test_extract_json_object_invalid_json_raises():
    with pytest.raises(json.JSONDecodeError):
        _extract_json_object('{"a": }')


def test_base_agent_default_model():
    assert BaseAgent("Test", "instructions").model == "openai/gpt-oss-120b"
