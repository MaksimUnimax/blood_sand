from __future__ import annotations
import json

VK_INLINE_MAX_BUTTONS = 10
DATE_PICKER_MAX_BUTTONS = 10
MONTHS = ("Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь")

def _payload(**value): return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
def _button(label, payload, color="secondary"): return {"action":{"type":"text","label":label,"payload":_payload(**payload)},"color":color}
def _rows(buttons, width=4): return [buttons[i:i + width] for i in range(0, len(buttons), width)]

def validate_inline_keyboard(keyboard: dict) -> dict:
    """Application transport guard: invalid keyboards never enter the outbox."""
    if not isinstance(keyboard, dict) or keyboard.get("inline") is not True or keyboard.get("one_time") is not False:
        raise ValueError("VK_INLINE_KEYBOARD_INVALID_SHAPE")
    rows = keyboard.get("buttons")
    if not isinstance(rows, list) or any(not isinstance(row, list) or len(row) > 5 for row in rows):
        raise ValueError("VK_INLINE_KEYBOARD_INVALID_ROWS")
    total = sum(len(row) for row in rows)
    if total > VK_INLINE_MAX_BUTTONS:
        raise ValueError(f"VK_INLINE_KEYBOARD_BUTTON_LIMIT_EXCEEDED:{total}>{VK_INLINE_MAX_BUTTONS}")
    return keyboard

def _picker(buttons): return validate_inline_keyboard({"one_time":False,"inline":True,"buttons":_rows(buttons)})
def year_ranges(current_year): return [(year, min(year + 9, current_year)) for year in range(1900, current_year + 1, 10)]

def year_ranges_keyboard(current_year: int, page: int = 0) -> dict:
    # Modern years first: normal users avoid a pagination click.
    ranges = list(reversed(year_ranges(current_year)))
    pages = [ranges[:8], ranges[8:]]
    if page not in range(len(pages)) or not pages[page]: raise ValueError("invalid year-range page")
    buttons = [_button(f"{a}–{b}", {"kip":"date","step":"year_range","start":a,"end":b,"v":1}, "primary") for a,b in pages[page]]
    if page == 0 and len(pages) > 1: buttons.append(_button("Раньше →", {"kip":"date","step":"year_range_page","page":1,"v":1}))
    if page == 1: buttons.append(_button("← Новее", {"kip":"date","step":"year_range_page","page":0,"v":1}))
    return _picker(buttons)

def years_keyboard(start: int, end: int) -> dict:
    return _picker([_button(str(year), {"kip":"date","step":"year","value":year,"v":1}, "primary") for year in range(start, end + 1)])

def months_keyboard(max_month: int = 12, page: int = 0) -> dict:
    months = list(range(1, max_month + 1)); chunks = [months[:6], months[6:]]
    if page not in range(len(chunks)) or not chunks[page]: raise ValueError("invalid month page")
    buttons = [_button(MONTHS[m-1], {"kip":"date","step":"month","value":m,"v":1}, "primary") for m in chunks[page]]
    if page == 0 and chunks[1]: buttons.append(_button("Июль–Декабрь →", {"kip":"date","step":"month_page","page":1,"v":1}))
    if page == 1: buttons.append(_button("← Январь–Июнь", {"kip":"date","step":"month_page","page":0,"v":1}))
    return _picker(buttons)

def day_bands_keyboard(last_day: int) -> dict:
    buttons=[]
    for start,end in ((1,10),(11,20),(21,30)):
        if start <= last_day: buttons.append(_button(f"{start}–{min(end,last_day)}", {"kip":"date","step":"day_band","start":start,"end":min(end,last_day),"v":1}, "primary"))
    if last_day == 31: buttons.append(_button("31", {"kip":"date","step":"day","value":31,"v":1}, "primary"))
    return _picker(buttons)

def days_keyboard(start: int, end: int) -> dict:
    return _picker([_button(str(day), {"kip":"date","step":"day","value":day,"v":1}, "primary") for day in range(start, end + 1)])

def gender_keyboard() -> dict:
    return _picker([_button("Мужчине", {"kip":"gender","value":"male","v":1}, "primary"), _button("Женщине", {"kip":"gender","value":"female","v":1})])

def main_menu_keyboard() -> dict:
    return {"one_time":False,"inline":False,"buttons":[[_button("Подобрать оберег", {"kip":"menu","value":"recommend","v":1}, "primary")],[_button("Задать вопрос", {"kip":"menu","value":"human","v":1})]]}

def restart_keyboard() -> dict: return {"one_time":True,"inline":False,"buttons":[[_button("Подобрать снова", {"kip":"restart","v":1}, "primary")]]}

def recommendation_marketplace_keyboard(product_key: str, links: dict) -> dict:
    """One-link-per-row URL keyboard; links are resolved once before the outbox insert."""
    # Live VK API 5.199 probe: a row containing three open_link buttons is
    # rejected with error 911; the identical three buttons on separate rows pass.
    keyboard = {"one_time": False, "inline": True, "buttons": [
        [{"action": {"type": "open_link", "label": "VK", "link": links["vk"]}}],
        [{"action": {"type": "open_link", "label": "Ozon", "link": links["ozon"]}}],
        [{"action": {"type": "open_link", "label": "Wildberries", "link": links["wildberries"]}}],
    ]}
    return validate_inline_keyboard(keyboard)

def calendar_keyboard(app_id: int, owner_id: int, handoff_token: str) -> dict:
    if not isinstance(app_id, int) or isinstance(app_id, bool) or app_id <= 0: raise ValueError("calendar app_id is required")
    if not isinstance(owner_id, int) or isinstance(owner_id, bool) or owner_id == 0: raise ValueError("calendar owner_id is required")
    if not isinstance(handoff_token, str) or not handoff_token: raise ValueError("calendar handoff token is required")
    return {"inline":True,"one_time":False,"buttons":[[{"action":{"type":"open_app","app_id":app_id,"owner_id":owner_id,"label":"📅 Выбрать дату","hash":handoff_token}}]]}
