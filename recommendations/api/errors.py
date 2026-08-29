"""Contract response helpers and non-leaking API exceptions."""

from __future__ import annotations

import json
from typing import Any

from starlette.responses import Response

API_VERSION = "v1"
JSON_CONTENT_TYPE = "application/json; charset=utf-8"


class ContractJSONResponse(Response):
    media_type = None

    def __init__(self, content: Any, status_code: int = 200, headers: dict[str, str] | None = None) -> None:
        super().__init__(
            content=json.dumps(content, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
            status_code=status_code,
            headers=headers,
            media_type=None,
        )
        self.headers["content-type"] = JSON_CONTENT_TYPE


class APIError(Exception):
    def __init__(self, status_code: int, code: str, message: str, headers: dict[str, str] | None = None) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.headers = headers or {}


def error_response(request: Any, status_code: int, code: str, message: str, headers: dict[str, str] | None = None) -> ContractJSONResponse:
    request.state.error_code = code
    return ContractJSONResponse({"api_version": API_VERSION, "error": {"code": code, "message": message}}, status_code, headers)


def project_error(request: Any, error: APIError) -> ContractJSONResponse:
    return error_response(request, error.status_code, error.code, error.message, error.headers)
