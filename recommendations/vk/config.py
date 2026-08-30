from __future__ import annotations

from dataclasses import dataclass
import os
from urllib.parse import urlsplit


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
    allowed_origins: tuple[str, ...] = ()
    launch_max_age_seconds: int = 300
    launch_future_clock_skew_seconds: int = 60

    @staticmethod
    def _origin(value: str, *, allow_http: bool = False) -> str:
        try:
            parsed = urlsplit(value)
            if (parsed.scheme not in ({"https", "http"} if allow_http else {"https"}) or not parsed.netloc
                    or parsed.path not in ("", "/") or parsed.query or parsed.fragment
                    or parsed.username or parsed.password):
                raise ValueError
            host = parsed.hostname
            if not host or "*" in host:
                raise ValueError
            port = parsed.port
            if (parsed.scheme == "https" and port == 443) or (parsed.scheme == "http" and port == 80):
                port = None
            return f"{parsed.scheme}://{host}" + (f":{port}" if port else "")
        except (TypeError, ValueError):
            raise VKConfigurationError("Mini App allowed origin is invalid") from None

    @classmethod
    def from_environment(cls) -> "VKMiniAppConfig":
        enabled = os.environ.get("KIP_VK_MINIAPP_ENABLED", "false").lower() in {"1", "true", "yes"}
        if not enabled:
            # Disabled M5 deliberately has no configuration dependency, including
            # on malformed historical M6 handoff values.
            return cls(enabled=False)
        raw = {name: os.environ.get("KIP_VK_MINIAPP_" + name) for name in (
            "APP_ID", "PROTECTED_KEY", "SESSION_TTL_SECONDS", "ALLOWED_ORIGINS",
            "LAUNCH_MAX_AGE_SECONDS", "LAUNCH_FUTURE_CLOCK_SKEW_SECONDS",
        )}
        required = ("APP_ID", "PROTECTED_KEY", "SESSION_TTL_SECONDS", "ALLOWED_ORIGINS", "LAUNCH_MAX_AGE_SECONDS", "LAUNCH_FUTURE_CLOCK_SKEW_SECONDS")
        if any(not raw[name] for name in required):
            raise VKConfigurationError("enabled Mini App requires standalone security configuration")
        try:
            app_id = int(raw["APP_ID"])
            session_ttl = int(raw["SESSION_TTL_SECONDS"])
            max_age = int(raw["LAUNCH_MAX_AGE_SECONDS"])
            skew = int(raw["LAUNCH_FUTURE_CLOCK_SKEW_SECONDS"])
        except ValueError as exc:
            raise VKConfigurationError("Mini App identity and TTL values must be integers") from exc
        if app_id != 54743026 or session_ttl != 900 or max_age != 300 or skew != 60:
            raise VKConfigurationError("Mini App configuration is invalid")
        origins = tuple(cls._origin(item.strip()) for item in raw["ALLOWED_ORIGINS"].split(",") if item.strip())
        if not origins or len(origins) != len(set(origins)):
            raise VKConfigurationError("Mini App allowed origins are invalid")
        # OWNER_ID and handoff values remain constructor fields for historical
        # M6-compatible callers, but are never read by standalone M5.
        return cls(True, app_id, None, raw["PROTECTED_KEY"], None, 600, session_ttl, None, origins, max_age, skew)


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
    recommendation_images_enabled: bool = False
    product_illustrations_path: str | None = None
    product_illustrations: dict[str, str] | None = None

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
        images_enabled = os.environ.get("KIP_VK_RECOMMENDATION_IMAGES_ENABLED", "false").lower() in {"1", "true", "yes"}
        illustrations_path = os.environ.get("KIP_VK_PRODUCT_ILLUSTRATIONS_PATH")
        attachments = None
        if images_enabled:
            if not illustrations_path:
                raise VKConfigurationError("enabled recommendation images require an illustration registry path")
            from .illustrations import VKIllustrationConfigurationError, load_runtime_attachments
            try:
                attachments = load_runtime_attachments(illustrations_path)
            except VKIllustrationConfigurationError as exc:
                raise VKConfigurationError("recommendation illustration registry is invalid") from exc
        return cls(group_id, values["VK_GROUP_TOKEN"], values["VK_CALLBACK_SECRET"], values["VK_CALLBACK_CONFIRMATION_CODE"], values["VK_STATE_DB_PATH"], version, 65536, 5, lease, retention, session_retention, poll, images_enabled, illustrations_path, attachments)
