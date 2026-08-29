from __future__ import annotations


def gender_keyboard() -> dict:
    return {
        "one_time": True,
        "inline": False,
        "buttons": [[
            {"action": {"type": "text", "label": "Мужчине", "payload": '{"kip":"gender","value":"male","v":1}'}, "color": "primary"},
            {"action": {"type": "text", "label": "Женщине", "payload": '{"kip":"gender","value":"female","v":1}'}, "color": "secondary"},
        ]],
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
