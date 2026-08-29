"""Translate Core's snake-case semantic result into the frozen HTTP shape."""

from __future__ import annotations

from typing import Any

from .errors import API_VERSION
from .models import ResolveRequest


VERSION_KEYS = (
    "calendar_version",
    "product_policy_version",
    "matrix_version",
    "marketplace_override_version",
    "copy_version",
)


def serialize_success(request_model: ResolveRequest, semantic_result: dict[str, Any]) -> dict[str, Any]:
    supplied = request_model.model_dump(exclude_unset=True)
    return {
        "api_version": API_VERSION,
        "input": supplied,
        "versions": {key: semantic_result[key] for key in VERSION_KEYS},
        "birth_date": semantic_result["birth_date"],
        "chertog": semantic_result["chertog"],
        "gender": semantic_result["gender"],
        "marketplace": semantic_result["marketplace"],
        "recommendation": semantic_result["recommendation"],
    }
