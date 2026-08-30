"""VK recommendation illustration presentation configuration.

The repository file intentionally declares only the supported product keys.
Actual VK attachment IDs are protected, environment-specific runtime state.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from recommendations.core.configuration import DATA_DIR, load_configuration

REGISTRY_VERSION = "KIP_VK_PRODUCT_ILLUSTRATIONS_V1"
ATTACHMENT_RE = re.compile(r"^photo-?\d+_\d+(?:_[A-Za-z0-9]+)?$")


class VKIllustrationConfigurationError(ValueError):
    pass


def active_product_keys() -> frozenset[str]:
    configuration = load_configuration()
    return frozenset(row["product_key"] for row in configuration["matrix"]["base_rows"] if row["active"])


def _load_json(path: Path, label: str) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise VKIllustrationConfigurationError(f"cannot load {label}") from exc
    if not isinstance(value, dict):
        raise VKIllustrationConfigurationError(f"{label} must be an object")
    return value


def repository_product_keys(path: Path = DATA_DIR / "vk_product_illustrations.v1.json") -> frozenset[str]:
    registry = _load_json(path, "repository illustration registry")
    if set(registry) != {"illustration_registry_version", "product_keys"} or registry.get("illustration_registry_version") != REGISTRY_VERSION:
        raise VKIllustrationConfigurationError("repository illustration registry version or shape is invalid")
    keys = registry["product_keys"]
    if not isinstance(keys, list) or not keys or any(not isinstance(key, str) or not key for key in keys) or len(keys) != len(set(keys)):
        raise VKIllustrationConfigurationError("repository illustration registry product keys are invalid")
    return frozenset(keys)


def validate_attachment(value: object) -> str:
    if not isinstance(value, str) or not ATTACHMENT_RE.fullmatch(value):
        raise VKIllustrationConfigurationError("VK illustration attachment must be a normalized photo attachment")
    return value


def load_runtime_attachments(path: str | Path) -> dict[str, str]:
    expected = active_product_keys()
    if repository_product_keys() != expected:
        raise VKIllustrationConfigurationError("repository illustration registry does not match active recommendation matrix")
    registry = _load_json(Path(path), "runtime illustration registry")
    if set(registry) != {"version", "attachments"} or registry.get("version") != 1 or not isinstance(registry["attachments"], dict):
        raise VKIllustrationConfigurationError("runtime illustration registry version or shape is invalid")
    attachments = registry["attachments"]
    if set(attachments) != expected:
        raise VKIllustrationConfigurationError("runtime illustration registry must cover exactly active recommendation products")
    return {key: validate_attachment(attachments[key]) for key in sorted(expected)}
