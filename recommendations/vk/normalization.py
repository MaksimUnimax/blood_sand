from __future__ import annotations
from typing import Any
from .contracts import VKInboundEvent

class VKNormalizationError(ValueError): pass

def normalize_callback(payload: dict[str, Any]) -> VKInboundEvent:
    try:
        event_type, obj = payload["type"], payload["object"]
        base = dict(transport="callback", event_id=str(payload["event_id"]), api_version=str(payload["v"]), group_id=int(payload["group_id"]), event_type=event_type)
    except (KeyError, TypeError, ValueError) as exc: raise VKNormalizationError("invalid callback envelope") from exc
    if event_type != "message_new": return VKInboundEvent(**base)
    if not isinstance(obj, dict) or not isinstance(obj.get("message"), dict): raise VKNormalizationError("message_new requires object.message")
    message, info = obj["message"], obj.get("client_info", {})
    if not isinstance(info, dict): raise VKNormalizationError("client_info must be an object")
    normalized_info = {"button_actions": info.get("button_actions", []), "keyboard": bool(info.get("keyboard")), "inline_keyboard": bool(info.get("inline_keyboard")), "carousel": bool(info.get("carousel")), "lang_id": info.get("lang_id")}
    return VKInboundEvent(**base, peer_id=message.get("peer_id"), from_id=message.get("from_id"), message_id=message.get("id"), conversation_message_id=message.get("conversation_message_id"), text=message.get("text"), payload=message.get("payload"), client_info=normalized_info)

def redact_callback(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in payload.items() if key not in {"secret", "access_token", "token"}}
