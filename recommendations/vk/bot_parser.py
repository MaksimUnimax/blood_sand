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
def menu_text_action(text: str | None):
    return {"Подобрать оберег": ("menu", "recommend"), "Задать вопрос": ("menu", "human")}.get(text)

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
    if set(value) == {"kip", "value", "v"} and value.get("kip") == "menu" and value.get("v") == 1 and value.get("value") in {"recommend", "human"}:
        expected = {"recommend": "Подобрать оберег", "human": "Задать вопрос"}[value["value"]]
        return ("menu", value["value"]) if text == expected else None
    if value.get("kip") != "date" or value.get("v") != 1: return None
    step = value.get("step")
    if step == "year_range" and set(value) == {"kip","step","start","end","v"} and all(isinstance(value[x], int) and not isinstance(value[x], bool) for x in ("start","end")) and text == f"{value['start']}–{value['end']}": return ("date", value)
    if step in {"year","month","day"} and set(value) == {"kip","step","value","v"} and isinstance(value.get("value"), int) and not isinstance(value.get("value"), bool):
        labels = {"year":str(value['value']), "month": ("Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"), "day":str(value['value'])}
        expected = labels[step][value['value'] - 1] if step == "month" and 1 <= value['value'] <= 12 else labels[step] if step != "month" else None
        return ("date", value) if expected == text else None
    if step == "day_tail" and set(value) == {"kip","step","last","v"} and isinstance(value.get("last"),int) and not isinstance(value.get("last"),bool) and text == f"21–{value['last']}": return ("date", value)
    if step == "day_tail" and set(value) == {"kip","step","value","v"} and isinstance(value.get("value"),int) and not isinstance(value.get("value"),bool) and text == str(value['value']): return ("date", value)
    if step == "back" and set(value) == {"kip","step","to","v"} and value.get("to") in {"year_range","year","month","day"} and text == "← Назад": return ("date", value)
    return None
