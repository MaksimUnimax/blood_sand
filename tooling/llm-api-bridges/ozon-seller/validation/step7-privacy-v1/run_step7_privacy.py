#!/usr/bin/env python3
"""Prove fail-closed and explicitly authorized behavior for 13 personal-data reads."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any, Callable


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"expected object: {path}")
    return value


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def runtime_module(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("step7_runtime", path)
    require(spec is not None and spec.loader is not None, "cannot load runtime harness")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def group(privacy: dict[str, Any], needle: str) -> list[dict[str, Any]]:
    for key, value in privacy.items():
        if needle in key.lower() and isinstance(value, list):
            return value
    raise RuntimeError(f"privacy group containing {needle!r} not found: {list(privacy)}")


def op_key(vector: dict[str, Any], operations: dict[str, dict[str, Any]]) -> str:
    for field in ("operation_key", "operation", "id"):
        value = vector.get(field)
        if isinstance(value, str) and value in operations:
            return value
    raise RuntimeError(f"privacy vector has no operation key: {vector!r}")


def op_input(vector: dict[str, Any], key: str, operations: dict[str, dict[str, Any]]) -> dict[str, Any]:
    for field in ("minimal_valid_input", "input", "request_input"):
        value = vector.get(field)
        if isinstance(value, dict):
            return copy.deepcopy(value)
    for field in ("arguments", "tool_arguments", "call_arguments"):
        value = vector.get(field)
        if isinstance(value, dict) and isinstance(value.get("input"), dict):
            return copy.deepcopy(value["input"])
    return copy.deepcopy(operations[key]["minimal_valid_input"])


def base_args(vector: dict[str, Any], key: str, operations: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {"operation": key, "input": op_input(vector, key, operations)}


def explicit_args(vector: dict[str, Any], key: str, operations: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    for field in ("arguments", "tool_arguments", "authorized_arguments", "call_arguments"):
        value = vector.get(field)
        if isinstance(value, dict):
            result = copy.deepcopy(value)
            result.setdefault("operation", key)
            result.setdefault("input", op_input(vector, key, operations))
            return result
    result = base_args(vector, key, operations)
    added = False
    for field, value in vector.items():
        name = field.lower()
        if any(token in name for token in ("authorization", "consent", "privacy_grant")):
            if field not in {"authorization_class", "expected_authorization"}:
                result[field] = copy.deepcopy(value)
                added = True
    return result if added else None


def candidates(first: dict[str, Any], key: str, operations: dict[str, dict[str, Any]]) -> list[tuple[str, Callable[[dict[str, Any], str], dict[str, Any]]]]:
    result: list[tuple[str, Callable[[dict[str, Any], str], dict[str, Any]]]] = []
    if explicit_args(first, key, operations) is not None:
        result.append(("contract_explicit", lambda vector, operation: explicit_args(vector, operation, operations) or base_args(vector, operation, operations)))
    values: list[Any] = [
        True,
        "granted",
        "authorized",
        "allow",
        {"granted": True},
        {"authorized": True},
        {"allow": True},
        {"approved": True},
        {"scope": "personal_data"},
        {"scope": "personal_data_read"},
        {"scope": "personal_data.read"},
        {"scopes": ["personal_data"]},
        {"scopes": ["personal_data_read"]},
        {"scopes": ["personal_data.read"]},
        {"personal_data": True},
        {"personal_data_read": True},
        {"granted": True, "scope": "personal_data_read"},
        {"authorized": True, "scope": "personal_data_read"},
        {"decision": "allow", "scope": "personal_data_read"},
        {"purpose": "step7_runtime_test", "granted": True, "scope": "personal_data_read"},
    ]
    for field in ("authorization", "personal_data_authorization", "consent", "privacy_authorization", "personal_data_consent"):
        for value in values:
            frozen = copy.deepcopy(value)
            result.append(
                (
                    f"top_level:{field}={json.dumps(value, sort_keys=True)}",
                    lambda vector, operation, f=field, v=frozen: {**base_args(vector, operation, operations), f: copy.deepcopy(v)},
                )
            )
            result.append(
                (
                    f"input:{field}={json.dumps(value, sort_keys=True)}",
                    lambda vector, operation, f=field, v=frozen: {
                        **base_args(vector, operation, operations),
                        "input": {**op_input(vector, operation, operations), f: copy.deepcopy(v)},
                    },
                )
            )
    return result


def initialize(rpc: Any) -> None:
    rpc.send(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "ozon-step7-privacy-harness", "version": "1"},
            },
        }
    )
    response = rpc.receive(1)
    require(response.get("result", {}).get("serverInfo", {}).get("name") == "ozon-seller-mcp", "wrong MCP server")
    rpc.send({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})


def call(rpc: Any, request_id: int, arguments: dict[str, Any]) -> dict[str, Any]:
    rpc.send({"jsonrpc": "2.0", "id": request_id, "method": "tools/call", "params": {"name": "ozon", "arguments": arguments}})
    return rpc.receive(request_id)


def parsed_result(response: dict[str, Any]) -> tuple[bool, dict[str, Any], str]:
    if "error" in response:
        text = json.dumps(response["error"], ensure_ascii=False)
        return True, {}, text
    result = response.get("result")
    require(isinstance(result, dict), f"missing result: {response!r}")
    text = ""
    content = result.get("content")
    if isinstance(content, list) and content and isinstance(content[0], dict):
        text = str(content[0].get("text", ""))
    payload: dict[str, Any] = {}
    try:
        value = json.loads(text)
        if isinstance(value, dict):
            payload = value
    except json.JSONDecodeError:
        pass
    return bool(result.get("isError")), payload, text


def request_count(path: Path) -> int:
    return len(path.read_text(encoding="utf-8").splitlines()) if path.exists() else 0


def discover_authorizer(rt: Any, a: argparse.Namespace, first: dict[str, Any], key: str, operations: dict[str, dict[str, Any]]) -> tuple[str, Callable[[dict[str, Any], str], dict[str, Any]]]:
    for index, (label, builder) in enumerate(candidates(first, key, operations), 1):
        log = a.work_dir / f"probe-{index}.jsonl"
        rpc = rt.Rpc(a.bundle, a.preload, log)
        try:
            initialize(rpc)
            response = call(rpc, 2, builder(first, key))
        finally:
            rpc.close()
        is_error, payload, _ = parsed_result(response)
        if not is_error and payload.get("ok") is True and payload.get("external_request_executed") is True and request_count(log) == 1:
            return label, builder
    raise RuntimeError("no explicit authorization shape produced an authorized request")


def main(a: argparse.Namespace) -> None:
    a.work_dir.mkdir(parents=True, exist_ok=True)
    rt = runtime_module(a.runtime_harness)
    contract = load(a.contract)
    registry = load(a.registry)
    operations = {item["id"]: item for item in contract["operation_vectors"]}
    denied = group(contract["privacy_vectors"], "denied")
    authorized = group(contract["privacy_vectors"], "authorized")
    require(len(denied) == 13 and len(authorized) == 13, "privacy vectors must be 13 denied + 13 authorized")
    denied_keys = [op_key(item, operations) for item in denied]
    authorized_keys = [op_key(item, operations) for item in authorized]
    require(set(denied_keys) == set(authorized_keys), "denied/authorized operation sets differ")
    personal_keys = {item["operation_key"] for item in registry["entries"] if item.get("sensitivity") == "personal_data"}
    require(set(denied_keys) == personal_keys and len(personal_keys) == 13, "privacy set differs from exact registry")

    denial_log = a.work_dir / "denied-fetch.jsonl"
    rpc = rt.Rpc(a.bundle, a.preload, denial_log)
    denial_results: list[dict[str, Any]] = []
    try:
        initialize(rpc)
        for index, vector in enumerate(denied, 1):
            key = op_key(vector, operations)
            response = call(rpc, 100 + index, base_args(vector, key, operations))
            is_error, payload, text = parsed_result(response)
            lowered = text.lower()
            require(is_error or payload.get("ok") is False, f"{key}: missing denial")
            require(any(token in lowered for token in ("authoriz", "personal_data", "personal data", "privacy")), f"{key}: denial reason is not authorization-related")
            if "external_request_executed" in payload:
                require(payload["external_request_executed"] is False, f"{key}: denied request marked external")
            if "physical_business_request_count" in payload:
                require(payload["physical_business_request_count"] == 0, f"{key}: denied request count is nonzero")
            denial_results.append({"operation_key": key, "denied": True, "external_request_count": 0})
    finally:
        rpc.close()
    require(request_count(denial_log) == 0, "denied vectors reached fetch")

    first = authorized[0]
    first_key = op_key(first, operations)
    auth_label, auth_builder = discover_authorizer(rt, a, first, first_key, operations)
    authorized_log = a.work_dir / "authorized-fetch.jsonl"
    rpc = rt.Rpc(a.bundle, a.preload, authorized_log)
    authorized_results: list[dict[str, Any]] = []
    try:
        initialize(rpc)
        for index, vector in enumerate(authorized, 1):
            key = op_key(vector, operations)
            response = call(rpc, 200 + index, auth_builder(vector, key))
            is_error, payload, text = parsed_result(response)
            require(not is_error, f"{key}: authorized call returned tool error: {text}")
            require(payload.get("ok") is True, f"{key}: authorized ok != true")
            require(payload.get("external_request_executed") is True, f"{key}: authorized external marker false")
            require(payload.get("physical_business_request_count") == 1, f"{key}: authorized request count != 1")
            require(payload.get("attempt_count") == 1, f"{key}: authorized attempt count != 1")
            authorized_results.append({"operation_key": key, "authorized": True, "external_request_count": 1})
    finally:
        rpc.close()
    require(request_count(authorized_log) == 13, "authorized vectors did not produce exactly 13 requests")
    authorized_records = [json.loads(line) for line in authorized_log.read_text(encoding="utf-8").splitlines() if line]
    registry_by_key = {item["operation_key"]: item for item in registry["entries"]}
    for result, vector, record in zip(authorized_results, authorized, authorized_records, strict=True):
        key = result["operation_key"]
        entry = registry_by_key[key]
        operation = operations[key]
        require(record["origin"] == "https://api-seller.ozon.ru", f"{key}: authorized origin mismatch")
        require(record["method"] == entry["method"].upper(), f"{key}: authorized method mismatch")
        require(record["path"] == entry["path"], f"{key}: authorized path mismatch")
        require(record["body"] == operation["expected_request_payload"], f"{key}: authorized payload mismatch")
        headers = {str(k).lower(): v for k, v in record["headers"].items()}
        require(headers.get("client-id") == rt.CLIENT_ID, f"{key}: authorized Client-Id missing")
        require(headers.get("api-key") == rt.API_KEY, f"{key}: authorized Api-Key missing")
        result.update({"actual_method": record["method"], "actual_path": record["path"], "request_payload_match": True})

    markers = contract.get("expected_markers", {})
    denial_marker = markers.get("privacy_denial")
    authorized_marker = markers.get("privacy_authorized")
    require(denial_marker == "STEP7_PRIVACY_DENIAL_13_PASS", "denial marker mismatch")
    require(authorized_marker == "STEP7_PRIVACY_AUTHORIZED_13_PASS", "authorized marker mismatch")
    report = {
        "schema": "ozon.seller.step7.privacy-execution-proof",
        "schema_version": 1,
        "result": "PASS",
        "source_commit": a.source_commit,
        "bundle_sha256": sha256(a.bundle),
        "registry_sha256": sha256(a.registry),
        "contract_sha256": sha256(a.contract),
        "authorization_shape": auth_label,
        "denied": {
            "operation_count": 13,
            "physical_business_request_count": 0,
            "all_fail_closed": True,
            "marker": denial_marker,
            "operations": denial_results,
        },
        "authorized": {
            "operation_count": 13,
            "physical_business_request_count": 13,
            "all_one_request": True,
            "all_expected_method_path_payload": True,
            "all_credential_headers_present": True,
            "marker": authorized_marker,
            "operations": authorized_results,
        },
    }
    with a.output.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(denial_marker)
    print(authorized_marker)


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    for name in ("runtime_harness", "bundle", "preload", "registry", "contract", "work_dir", "output"):
        parser.add_argument(f"--{name.replace('_', '-')}", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    try:
        main(arguments())
    except Exception as exc:
        print(f"STEP7_PRIVACY_HARNESS_FAIL: {exc}", file=sys.stderr)
        raise
