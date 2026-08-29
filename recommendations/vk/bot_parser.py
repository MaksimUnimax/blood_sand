from __future__ import annotations
import re
from dataclasses import dataclass
from recommendations.core import validate_birth_date, RecommendationInputError

DATE = re.compile(r"(?<!\d)(\d{2})([./-])(\d{2})(?:\2(\d{4}))?(?!\d)")
@dataclass(frozen=True)
class ParsedDate: day: int; month: int; year: int | None
def parse_dates(text: str | None) -> list[ParsedDate]:
    results=[]
    for match in DATE.finditer(text or ""):
        day, month, year = int(match[1]), int(match[3]), int(match[4]) if match[4] else None
        try: validate_birth_date(day, month, year)
        except RecommendationInputError: continue
        results.append(ParsedDate(day, month, year))
    return results
def parse_gender(text: str | None) -> str | None:
    return {"мужчине":"male", "male":"male", "женщине":"female", "female":"female"}.get((text or "").strip().lower())
def is_restart(text: str | None) -> bool: return (text or "").strip().lower() == "подобрать снова"
