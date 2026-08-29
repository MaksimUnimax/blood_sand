from __future__ import annotations
from typing import Any
from .contracts import VKInboundEvent

class VKNormalizationError(ValueError): pass

def normalize_callback(payload: dict[str, Any]) -> VKInboundEvent:
    try:
        event_type, obj = payload["type"], payload["object"]
        if not isinstance(payload["event_id"], str) or not payload["event_id"] or not isinstance(payload["v"], str) or not isinstance(payload["group_id"], int) or isinstance(payload["group_id"], bool) or not isinstance(event_type, str):
            raise ValueError("invalid callback identity")
        base = dict(transport="callback", event_id=payload["event_id"], api_version=payload["v"], group_id=payload["group_id"], event_type=event_type)
    except (KeyError, TypeError, ValueError) as exc: raise VKNormalizationError("invalid callback envelope") from exc
    if event_type != "message_new": return VKInboundEvent(**base)
    if not isinstance(obj, dict) or not isinstance(obj.get("message"), dict): raise VKNormalizationError("message_new requires object.message")
    message, info = obj["message"], obj.get("client_info", {})
    if not isinstance(info, dict): raise VKNormalizationError("client_info must be an object")
    normalized_info = {"button_actions": info.get("button_actions", []), "keyboard": bool(info.get("keyboard")), "inline_keyboard": bool(info.get("inline_keyboard")), "carousel": bool(info.get("carousel")), "lang_id": info.get("lang_id")}
    ids = {key: message.get(key) for key in ("peer_id", "from_id", "id", "conversation_message_id")}
    if any(not isinstance(value, int) or isinstance(value, bool) for value in ids.values()):
        raise VKNormalizationError("message identifiers must be integers")
    if message.get("text") is not None and not isinstance(message.get("text"), str):
        raise VKNormalizationError("message text must be a string")
    return VKInboundEvent(**base, peer_id=ids["peer_id"], from_id=ids["from_id"], message_id=ids["id"], conversation_message_id=ids["conversation_message_id"], text=message.get("text"), payload=message.get("payload"), client_info=normalized_info)

def redact_callback(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in payload.items() if key not in {"secret", "access_token", "token", "group_token", "confirmation_code"}}
