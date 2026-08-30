"""Durable, sanitized runtime audit helpers.

AUDIT_DATA_IS_OBSERVABILITY_ONLY: callers must never use this data for
recommendation decisions, authentication, state/CAS validation, or retries.
"""
from __future__ import annotations


def sanitize_keyboard_audit(keyboard: dict | None) -> dict | None:
    """Return an allowlisted keyboard summary; never copy payloads or hashes."""
    if keyboard is None:
        return None
    result = {"inline": bool(keyboard.get("inline", False)), "one_time": bool(keyboard.get("one_time", False)), "actions": []}
    for row in keyboard.get("buttons", []):
        for button in row:
            action = button.get("action", {}) if isinstance(button, dict) else {}
            item = {"type": action.get("type"), "label": action.get("label")}
            if action.get("type") == "open_app":
                item.update({"app_id": action.get("app_id"), "owner_id": action.get("owner_id"), "hash_present": bool(action.get("hash"))})
            result["actions"].append(item)
    return result
