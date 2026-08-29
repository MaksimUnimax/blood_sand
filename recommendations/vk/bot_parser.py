from __future__ import annotations
import re
import json
from dataclasses import dataclass
from recommendations.core import validate_birth_date, RecommendationInputError

DATE = re.compile(r"(?<!\d)(\d{2})([./-])(\d{2})(?:\2(\d{4}))?(?!\d)")
@dataclass(frozen=True)
class ParsedDate: day: int; month: int; year: int | None
def parse_dates(text: str | None) -> list[ParsedDate]:
    # Count lexical candidates before Gregorian validation.  Otherwise an
    # invalid first candidate could make a later valid one look unambiguous.
    matches = list(DATE.finditer(text or ""))
    if len(matches) != 1:
        return []
    results=[]
    for match in matches:
        day, month, year = int(match[1]), int(match[3]), int(match[4]) if match[4] else None
        try: validate_birth_date(day, month, year)
        except RecommendationInputError: continue
        results.append(ParsedDate(day, month, year))
    return results
def parse_gender(text: str | None) -> str | None:
    return {"мужчине":"male", "male":"male", "женщине":"female", "female":"female"}.get((text or "").strip().lower())
def is_restart(text: str | None) -> bool: return (text or "").strip().lower() == "подобрать снова"

def parse_keyboard_payload(payload, text: str | None):
    """Return a whitelisted semantic tuple, or None.  Never infer from bad payload."""
    if not isinstance(payload, str): return None
    try: value = json.loads(payload)
    except (TypeError, json.JSONDecodeError): return None
    if not isinstance(value, dict): return None
    if set(value) == {"kip", "value", "v"} and value.get("kip") == "gender" and value.get("v") == 1 and value.get("value") in {"male", "female"}:
        expected = {"male": "Мужчине", "female": "Женщине"}[value["value"]]
        return ("gender", value["value"]) if text == expected else None
    if set(value) == {"kip", "v"} and value == {"kip": "restart", "v": 1}:
        return ("restart", None) if text == "Подобрать снова" else None
    return None
