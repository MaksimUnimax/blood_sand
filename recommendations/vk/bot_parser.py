from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime, time, timezone

from dateparser import parse as dateparser_parse

DATEPARSER_SETTINGS = {
    "DATE_ORDER": "DMY",
    "PREFER_LOCALE_DATE_ORDER": False,
    "STRICT_PARSING": True,
    "REQUIRE_PARTS": ["day", "month", "year"],
    "PARSERS": ["absolute-time"],
}


def parse_birth_date(text: str | None, *, today: date) -> date | None:
    """Parse only a complete absolute date using dateparser's strict configuration."""
    if not isinstance(text, str) or not text.strip():
        return None
    try:
        result = dateparser_parse(
            text, languages=["ru", "en"],
            settings={**DATEPARSER_SETTINGS, "RELATIVE_BASE": datetime.combine(today, time.min, tzinfo=timezone.utc)},
        )
    except (TypeError, ValueError, OverflowError):
        return None
    return result.date() if result is not None else None


@dataclass(frozen=True)
class ParsedDate:
    day: int
    month: int
    year: int


def parse_dates(text: str | None) -> list[ParsedDate]:
    """Compatibility helper for tests; production injects its reference date."""
    result = parse_birth_date(text, today=date.today())
    return [] if result is None else [ParsedDate(result.day, result.month, result.year)]


def parse_gender(text: str | None) -> str | None:
    return {"мужчине": "male", "male": "male", "женщине": "female", "female": "female"}.get((text or "").strip().lower())


def is_restart(text: str | None) -> bool:
    return (text or "").strip().lower() == "подобрать снова"


def menu_text_action(text: str | None):
    return {"Подобрать оберег": ("menu", "recommend"), "Задать вопрос": ("menu", "human")}.get(text)


def parse_keyboard_payload(payload, text: str | None):
    """Return a whitelisted active semantic tuple, or None."""
    if not isinstance(payload, str):
        return None
    try:
        value = json.loads(payload)
    except (TypeError, json.JSONDecodeError):
        return None
    if not isinstance(value, dict):
        return None
    if set(value) == {"kip", "value", "v"} and value.get("kip") == "gender" and value.get("v") == 1 and value.get("value") in {"male", "female"}:
        expected = {"male": "Мужчине", "female": "Женщине"}[value["value"]]
        return ("gender", value["value"]) if text == expected else None
    if set(value) == {"kip", "v"} and value == {"kip": "restart", "v": 1}:
        return ("restart", None) if text == "Подобрать снова" else None
    if set(value) == {"kip", "value", "v"} and value.get("kip") == "menu" and value.get("v") == 1 and value.get("value") in {"recommend", "human"}:
        expected = {"recommend": "Подобрать оберег", "human": "Задать вопрос"}[value["value"]]
        return ("menu", value["value"]) if text == expected else None
    return None
