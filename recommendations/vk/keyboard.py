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
