from __future__ import annotations
from dataclasses import asdict, dataclass
from typing import Any

@dataclass(frozen=True)
class VKInboundEvent:
    transport: str; event_id: str; api_version: str; group_id: int; event_type: str
    peer_id: int | None = None; from_id: int | None = None; message_id: int | None = None
    conversation_message_id: int | None = None; text: str | None = None
    payload: Any = None; client_info: dict[str, Any] | None = None
    def as_dict(self) -> dict[str, Any]: return asdict(self)
