from __future__ import annotations
import json

MONTHS = ("Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь")

def _payload(**value): return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
def _button(label, payload, color="secondary"): return {"action":{"type":"text","label":label,"payload":_payload(**payload)},"color":color}
def _picker(rows): return {"one_time":False,"inline":True,"buttons":rows}
def _rows(buttons, width=4): return [buttons[i:i + width] for i in range(0, len(buttons), width)]

def year_ranges_keyboard(current_year: int) -> dict:
    ranges = [(1900, 1919)] + [(year, min(year + 9, current_year)) for year in range(1920, current_year + 1, 10)]
    ranges = [(start, end) for start, end in ranges if start <= end]
    buttons = [_button(f"{start}–{end}", {"kip":"date","step":"year_range","start":start,"end":end,"v":1}, "primary") for start, end in ranges]
    return _picker(_rows(buttons))

def years_keyboard(start: int, end: int) -> dict:
    buttons = [_button(str(year), {"kip":"date","step":"year","value":year,"v":1}, "primary") for year in range(start, end + 1)]
    buttons.append(_button("← Назад", {"kip":"date","step":"back","to":"year_range","v":1}))
    return _picker(_rows(buttons))

def months_keyboard(max_month: int = 12) -> dict:
    buttons = [_button(name, {"kip":"date","step":"month","value":number,"v":1}, "primary") for number, name in enumerate(MONTHS[:max_month], 1)]
    buttons.append(_button("← Назад", {"kip":"date","step":"back","to":"year","v":1}))
    return _picker(_rows(buttons))

def days_keyboard(last_day: int) -> dict:
    buttons = [_button(str(day), {"kip":"date","step":"day","value":day,"v":1}, "primary") for day in range(1, min(20, last_day) + 1)]
    if last_day > 20: buttons.append(_button(f"21–{last_day}", {"kip":"date","step":"day_tail","last":last_day,"v":1}, "primary"))
    buttons.append(_button("← Назад", {"kip":"date","step":"back","to":"month","v":1}))
    return _picker(_rows(buttons))

def day_tail_keyboard(last_day: int) -> dict:
    buttons = [_button(str(day), {"kip":"date","step":"day_tail","value":day,"v":1}, "primary") for day in range(21, last_day + 1)]
    buttons.append(_button("← Назад", {"kip":"date","step":"back","to":"day","v":1}))
    return _picker(_rows(buttons))


def gender_keyboard() -> dict:
    return {
        "one_time": False,
        "inline": True,
        "buttons": [[
            {"action": {"type": "text", "label": "Мужчине", "payload": '{"kip":"gender","value":"male","v":1}'}, "color": "primary"},
            {"action": {"type": "text", "label": "Женщине", "payload": '{"kip":"gender","value":"female","v":1}'}, "color": "secondary"},
        ]],
    }


def main_menu_keyboard() -> dict:
    """The sole persistent, non-inline navigation keyboard for the bot."""
    return {
        "one_time": False,
        "inline": False,
        "buttons": [
            [{"action": {"type": "text", "label": "Подобрать оберег", "payload": '{"kip":"menu","value":"recommend","v":1}'}, "color": "primary"}],
            [{"action": {"type": "text", "label": "Задать вопрос", "payload": '{"kip":"menu","value":"human","v":1}'}, "color": "secondary"}],
        ],
    }


def restart_keyboard() -> dict:
    return {
        "one_time": True,
        "inline": False,
        "buttons": [[
            {"action": {"type": "text", "label": "Подобрать снова", "payload": '{"kip":"restart","v":1}'}, "color": "primary"},
        ]],
    }


def calendar_keyboard(app_id: int, owner_id: int, handoff_token: str) -> dict:
    if not isinstance(app_id, int) or isinstance(app_id, bool) or app_id <= 0:
        raise ValueError("calendar app_id is required")
    if not isinstance(owner_id, int) or isinstance(owner_id, bool) or owner_id == 0:
        raise ValueError("calendar owner_id is required")
    if not isinstance(handoff_token, str) or not handoff_token:
        raise ValueError("calendar handoff token is required")
    return {"inline": True, "one_time": False, "buttons": [[{"action": {"type": "open_app", "app_id": app_id, "owner_id": owner_id, "label": "📅 Выбрать дату", "hash": handoff_token}}]]}
