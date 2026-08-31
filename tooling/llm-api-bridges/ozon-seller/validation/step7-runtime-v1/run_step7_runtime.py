#!/usr/bin/env python3
"""Execute all 26 admitted Ozon Seller reads through the built MCP bundle."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import queue
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Any

CLIENT_ID = "step7-runtime-client"
API_KEY = "step7-runtime-api-key"


def fail(message: str) -> None:
    raise RuntimeError(message)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pump(stream: Any, target: queue.Queue[str]) -> None:
    for line in stream:
        target.put(line.rstrip("\n"))


class Rpc:
    def __init__(self, bundle: Path, preload: Path, fetch_log: Path) -> None:
        fetch_log.unlink(missing_ok=True)
        env = os.environ.copy()
        env.update(
            {
                "OZON_CLIENT_ID": CLIENT_ID,
                "OZON_API_KEY": API_KEY,
                "OZON_REQUEST_TIMEOUT_MS": "5000",
                "OZON_MAX_RETRIES": "0",
                "OZON_RETRY_BASE_MS": "1",
                "OZON_MAX_IN_FLIGHT": "1",
                "STEP7_MOCK_FETCH_LOG": str(fetch_log),
            }
        )
        self.proc = subprocess.Popen(
            ["node", "--require", str(preload), str(bundle)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            env=env,
        )
        require(self.proc.stdout is not None and self.proc.stderr is not None, "stdio unavailable")
        self.out: queue.Queue[str] = queue.Queue()
        self.err: queue.Queue[str] = queue.Queue()
        threading.Thread(target=pump, args=(self.proc.stdout, self.out), daemon=True).start()
        threading.Thread(target=pump, args=(self.proc.stderr, self.err), daemon=True).start()

    def send(self, message: dict[str, Any]) -> None:
        require(self.proc.stdin is not None, "stdin unavailable")
        self.proc.stdin.write(json.dumps(message, separators=(",", ":")) + "\n")
        self.proc.stdin.flush()

    def receive(self, request_id: int, timeout: float = 20.0) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            try:
                line = self.out.get(timeout=0.2)
            except queue.Empty:
                require(self.proc.poll() is None, f"server exited: {list(self.err.queue)!r}")
                continue
            message = json.loads(line)
            if message.get("id") == request_id:
                return message
        fail(f"timeout waiting for id={request_id}; stderr={list(self.err.queue)!r}")

    def close(self) -> list[str]:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.terminate()
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()
            self.proc.wait(timeout=5)
        return list(self.err.queue)


def tool_payload(response: dict[str, Any], operation: str) -> dict[str, Any]:
    require("error" not in response, f"{operation}: JSON-RPC error {response.get('error')!r}")
    result = response.get("result")
    require(isinstance(result, dict) and not result.get("isError"), f"{operation}: tool error {result!r}")
    content = result.get("content")
    require(isinstance(content, list) and content, f"{operation}: missing content")
    first = content[0]
    require(first.get("type") == "text" and isinstance(first.get("text"), str), f"{operation}: bad content")
    payload = json.loads(first["text"])
    require(isinstance(payload, dict), f"{operation}: non-object payload")
    return payload


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"expected object: {path}")
    return value


def main(a: argparse.Namespace) -> None:
    paths = [a.bundle, a.preload, a.registry, a.contract]
    require(all(path.is_file() for path in paths), f"missing input file: {paths!r}")
    registry = load(a.registry)
    contract = load(a.contract)
    entries = registry.get("entries")
    vectors = contract.get("operation_vectors")
    require(isinstance(entries, list) and len(entries) == 26, "registry must contain 26 entries")
    require(isinstance(vectors, list) and len(vectors) == 26, "contract must contain 26 vectors")
    by_key = {entry["operation_key"]: entry for entry in entries}
    vector_by_key = {vector["id"]: vector for vector in vectors}
    require(set(by_key) == set(vector_by_key), "registry/contract operation sets differ")

    rpc = Rpc(a.bundle, a.preload, a.fetch_log)
    operation_results: list[dict[str, Any]] = []
    stderr_lines: list[str] = []
    try:
        rpc.send(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "ozon-step7-runtime-harness", "version": "1"},
                },
            }
        )
        init = rpc.receive(1)
        require(init.get("result", {}).get("serverInfo", {}).get("name") == "ozon-seller-mcp", "wrong server")
        rpc.send({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})
        rpc.send({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        tools = rpc.receive(2).get("result", {}).get("tools", [])
        require("ozon" in [tool.get("name") for tool in tools], "ozon tool missing")

        for ordinal, vector in enumerate(vectors, 1):
            key = vector["id"]
            rpc.send(
                {
                    "jsonrpc": "2.0",
                    "id": 100 + ordinal,
                    "method": "tools/call",
                    "params": {
                        "name": "ozon",
                        "arguments": {"operation": key, "input": vector["minimal_valid_input"]},
                    },
                }
            )
            payload = tool_payload(rpc.receive(100 + ordinal), key)
            require(payload.get("ok") is True, f"{key}: ok != true")
            require(payload.get("operation") == key, f"{key}: operation echo mismatch")
            require(payload.get("physical_business_request_count") == 1, f"{key}: request count != 1")
            require(payload.get("external_request_executed") is True, f"{key}: request not executed")
            require(payload.get("attempt_count") == 1, f"{key}: attempt count != 1")
            entry = by_key[key]
            operation_results.append(
                {
                    "ordinal": ordinal,
                    "operation_key": key,
                    "operation_uid": entry["operation_uid"],
                    "expected_method": entry["method"].upper(),
                    "expected_path": entry["path"],
                    "tool_ok": True,
                    "physical_business_request_count": 1,
                    "external_request_executed": True,
                    "attempt_count": 1,
                }
            )
    finally:
        stderr_lines = rpc.close()
        a.stderr_output.parent.mkdir(parents=True, exist_ok=True)
        with a.stderr_output.open("w", encoding="utf-8", newline="\n") as fh:
            fh.write("\n".join(stderr_lines) + ("\n" if stderr_lines else ""))

    records = [json.loads(line) for line in a.fetch_log.read_text(encoding="utf-8").splitlines() if line]
    require(len(records) == 26, f"mock saw {len(records)} requests, expected 26")
    for result, record in zip(operation_results, records, strict=True):
        key = result["operation_key"]
        vector = vector_by_key[key]
        require(record["ordinal"] == result["ordinal"], f"{key}: request order mismatch")
        require(record["origin"] == "https://api-seller.ozon.ru", f"{key}: origin mismatch")
        require(record["method"] == result["expected_method"], f"{key}: method mismatch")
        require(record["path"] == result["expected_path"], f"{key}: path mismatch")
        require(record["body"] == vector["expected_request_payload"], f"{key}: payload mismatch")
        headers = {str(k).lower(): v for k, v in record["headers"].items()}
        require(headers.get("client-id") == CLIENT_ID, f"{key}: Client-Id missing")
        require(headers.get("api-key") == API_KEY, f"{key}: Api-Key missing")
        require("application/json" in headers.get("content-type", ""), f"{key}: content type mismatch")
        result.update(
            {
                "actual_method": record["method"],
                "actual_path": record["path"],
                "request_payload_match": True,
                "credential_headers_present": True,
            }
        )

    marker = contract.get("expected_markers", {}).get("operation_runtime")
    require(marker == "STEP7_READ_RUNTIME_26_PASS", "runtime marker contract mismatch")
    report = {
        "schema": "ozon.seller.step7.runtime-execution-proof",
        "schema_version": 1,
        "result": "PASS",
        "marker": marker,
        "source_commit": a.source_commit,
        "bundle": {
            "repository_path": "tooling/llm-api-bridges/ozon-seller/dist/ozon-seller-mcp-nodebundle.js",
            "sha256": sha256(a.bundle),
            "bytes": a.bundle.stat().st_size,
        },
        "registry": {
            "repository_path": "tooling/llm-api-bridges/ozon-seller/inventory/OZON_SELLER_EXACT_READ_REGISTRY.json",
            "sha256": sha256(a.registry),
            "admitted_read_count": 26,
        },
        "runtime_contract": {
            "repository_path": "tooling/llm-api-bridges/ozon-seller/OZON_STEP7_RUNTIME_TEST_ARTIFACT_2026-08-30.json",
            "sha256": sha256(a.contract),
            "operation_vector_count": 26,
        },
        "mcp": {"server_name": "ozon-seller-mcp", "tool_name": "ozon", "protocol_version": "2024-11-05"},
        "execution": {
            "operation_count": 26,
            "physical_business_request_count": 26,
            "all_operations_ok": True,
            "all_one_request": True,
            "all_external_request_executed": True,
            "all_expected_method_path_payload": True,
            "all_credential_headers_present": True,
        },
        "operations": operation_results,
    }
    a.output.parent.mkdir(parents=True, exist_ok=True)
    with a.output.open("w", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(marker)
    print(json.dumps(report["execution"], sort_keys=True))


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    for name in ("bundle", "preload", "registry", "contract", "fetch_log", "stderr_output", "output"):
        parser.add_argument(f"--{name.replace('_', '-')}", type=Path, required=True)
    parser.add_argument("--source-commit", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    try:
        main(arguments())
    except Exception as exc:
        print(f"STEP7_RUNTIME_HARNESS_FAIL: {exc}", file=sys.stderr)
        raise
