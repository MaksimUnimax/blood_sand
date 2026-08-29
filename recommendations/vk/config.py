from __future__ import annotations

from dataclasses import dataclass
import os


class VKConfigurationError(ValueError):
    pass


@dataclass(frozen=True)
class VKMiniAppConfig:
    """Opt-in Mini App settings; deliberately separate from Bot credentials."""
    enabled: bool = False
    app_id: int = 54743026
    owner_id: int | None = None
    protected_key: str | None = None
    handoff_secret: str | None = None
    handoff_ttl_seconds: int = 600
    session_ttl_seconds: int = 900
    public_url: str | None = None

    @classmethod
    def from_environment(cls) -> "VKMiniAppConfig":
        enabled = os.environ.get("KIP_VK_MINIAPP_ENABLED", "false").lower() in {"1", "true", "yes"}
        raw = {name: os.environ.get("KIP_VK_MINIAPP_" + name) for name in ("APP_ID", "OWNER_ID", "PROTECTED_KEY", "HANDOFF_SECRET", "HANDOFF_TTL_SECONDS", "SESSION_TTL_SECONDS", "PUBLIC_URL")}
        if not enabled:
            return cls(enabled=False, app_id=int(raw["APP_ID"] or 54743026), handoff_ttl_seconds=int(raw["HANDOFF_TTL_SECONDS"] or 600), session_ttl_seconds=int(raw["SESSION_TTL_SECONDS"] or 900), public_url=raw["PUBLIC_URL"])
        if any(not raw[name] for name in raw):
            raise VKConfigurationError("enabled Mini App requires all Mini App security and identity values")
        try:
            app_id, owner_id, handoff_ttl, session_ttl = int(raw["APP_ID"]), int(raw["OWNER_ID"]), int(raw["HANDOFF_TTL_SECONDS"]), int(raw["SESSION_TTL_SECONDS"])
        except ValueError as exc:
            raise VKConfigurationError("Mini App identity and TTL values must be integers") from exc
        if app_id != 54743026 or owner_id == 0 or handoff_ttl <= 0 or session_ttl <= 0:
            raise VKConfigurationError("Mini App configuration is invalid")
        return cls(True, app_id, owner_id, raw["PROTECTED_KEY"], raw["HANDOFF_SECRET"], handoff_ttl, session_ttl, raw["PUBLIC_URL"])


@dataclass(frozen=True)
class VKRuntimeConfig:
    group_id: int
    group_token: str
    callback_secret: str
    confirmation_code: str
    state_db_path: str
    api_version: str = "5.199"
    callback_max_body_bytes: int = 65536  # application policy, not a VK limit
    retry_delay_seconds: int = 5          # bounded application policy
    claim_lease_seconds: int = 300
    raw_payload_retention_seconds: int = 86400
    session_retention_seconds: int = 86400
    worker_poll_seconds: float = 1.0

    @classmethod
    def from_environment(cls) -> "VKRuntimeConfig | None":
        if os.environ.get("KIP_VK_ENABLED", "false").lower() not in {"1", "true", "yes"}:
            return None
        values = {k: os.environ.get("KIP_" + k) or os.environ.get(k) for k in (
            "VK_GROUP_ID", "VK_GROUP_TOKEN", "VK_CALLBACK_SECRET", "VK_CALLBACK_CONFIRMATION_CODE", "VK_STATE_DB_PATH"
        )}
        if any(not value for value in values.values()):
            raise VKConfigurationError("VK runtime requires all configured values")
        policy = {name: os.environ.get("KIP_" + name) for name in ("VK_CLAIM_LEASE_SECONDS", "VK_RAW_PAYLOAD_RETENTION_SECONDS", "VK_SESSION_RETENTION_SECONDS", "VK_WORKER_POLL_SECONDS")}
        if any(not value for value in policy.values()):
            raise VKConfigurationError("VK runtime requires explicit retention and claim lease policies")
        version = os.environ.get("KIP_VK_API_VERSION", os.environ.get("VK_API_VERSION", "5.199"))
        if version != "5.199":
            raise VKConfigurationError("VK API version must be 5.199")
        try:
            group_id = int(values["VK_GROUP_ID"])
        except (TypeError, ValueError) as exc:
            raise VKConfigurationError("VK group id must be an integer") from exc
        if group_id <= 0 or not values["VK_STATE_DB_PATH"]:
            raise VKConfigurationError("VK group id and state DB path are required")
        try:
            lease, retention, session_retention = (int(policy["VK_CLAIM_LEASE_SECONDS"]), int(policy["VK_RAW_PAYLOAD_RETENTION_SECONDS"]), int(policy["VK_SESSION_RETENTION_SECONDS"]))
            poll = float(policy["VK_WORKER_POLL_SECONDS"])
        except ValueError as exc:
            raise VKConfigurationError("VK runtime policies must be integers") from exc
        if lease <= 0 or retention <= 0 or session_retention <= 0 or poll <= 0 or poll > 60:
            raise VKConfigurationError("VK runtime policies must be positive")
        return cls(group_id, values["VK_GROUP_TOKEN"], values["VK_CALLBACK_SECRET"], values["VK_CALLBACK_CONFIRMATION_CODE"], values["VK_STATE_DB_PATH"], version, 65536, 5, lease, retention, session_retention, poll)
