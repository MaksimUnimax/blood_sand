#!/usr/bin/env python3
"""Fail-closed verifier/reconstructor for the accepted Ozon Seller Swagger authority."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import lzma
import os
import tempfile
from pathlib import Path
from typing import Any

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


class VerificationError(RuntimeError):
    """Raised when any transport or authority invariant fails."""


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerificationError(message)


def load_manifest(root: Path) -> dict[str, Any]:
    path = root / "manifest.json"
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise VerificationError(f"cannot load manifest {path}: {exc}") from exc
    require(isinstance(value, dict), "manifest root must be an object")
    require(value.get("schema") == "ozon.seller.exact-swagger.transport.v2", "unexpected manifest schema")
    require(value.get("schema_version") == 1, "unexpected manifest schema_version")
    return value


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp_name, path)
    except BaseException:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise


def verify(root: Path, output: Path | None) -> dict[str, Any]:
    manifest = load_manifest(root)
    authority = manifest["authority"]
    transport = manifest["transport"]
    fragment_meta = transport["fragments"]
    entries = fragment_meta["entries"]

    require(isinstance(entries, list) and entries, "fragment entry list is empty")
    require(len(entries) == fragment_meta["count"], "fragment count does not match manifest")
    require(fragment_meta["max_bytes"] <= 9000, "manifest fragment ceiling exceeds 9 KB")

    expected_names = [entry["name"] for entry in entries]
    require(len(expected_names) == len(set(expected_names)), "duplicate fragment names in manifest")
    require([entry["index"] for entry in entries] == list(range(1, len(entries) + 1)), "fragment indices are not contiguous")

    fragments_dir = root / fragment_meta["directory"]
    actual_names = sorted(
        str(path.relative_to(root)).replace(os.sep, "/")
        for path in fragments_dir.glob("*.txt")
        if path.is_file()
    )
    require(actual_names == sorted(expected_names), "fragment directory has missing, extra, or renamed files")

    payload_parts: list[bytes] = []
    for entry in entries:
        path = root / entry["name"]
        data = path.read_bytes()
        require(len(data) == entry["bytes"], f"fragment size mismatch: {entry['name']}")
        require(len(data) <= fragment_meta["max_bytes"], f"fragment exceeds declared ceiling: {entry['name']}")
        require(len(data) <= 9000, f"fragment exceeds 9 KB hard ceiling: {entry['name']}")
        require(digest(data) == entry["sha256"], f"fragment SHA-256 mismatch: {entry['name']}")
        payload_parts.append(data)

    encoded = b"".join(payload_parts)
    encoding = transport["encoding"]
    require(len(encoded) == encoding["bytes"], "encoded payload size mismatch")
    require(digest(encoded) == encoding["sha256"], "encoded payload SHA-256 mismatch")
    try:
        compressed = base64.b64decode(encoded, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise VerificationError(f"strict base64 decode failed: {exc}") from exc

    compression = transport["compression"]
    require(len(compressed) == compression["bytes"], "compressed payload size mismatch")
    require(digest(compressed) == compression["sha256"], "compressed payload SHA-256 mismatch")
    try:
        raw = lzma.decompress(compressed, format=lzma.FORMAT_XZ)
    except lzma.LZMAError as exc:
        raise VerificationError(f"XZ decompression failed: {exc}") from exc

    require(len(raw) == authority["bytes"], "raw authority size mismatch")
    require(digest(raw) == authority["sha256"], "raw authority SHA-256 mismatch")

    preset = compression.get("python_lzma_preset")
    require(isinstance(preset, int), "missing deterministic Python LZMA preset")
    recompressed = lzma.compress(raw, format=lzma.FORMAT_XZ, preset=preset)
    require(recompressed == compressed, "deterministic XZ recompression mismatch")
    require(base64.b64encode(recompressed) == encoded, "deterministic base64 re-encoding mismatch")

    try:
        spec = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise VerificationError(f"raw authority is not valid UTF-8 JSON: {exc}") from exc

    require(spec.get("openapi") == authority["openapi"], "OpenAPI version mismatch")
    info = spec.get("info") or {}
    require(info.get("title") == authority["info_title"], "info.title mismatch")
    require(info.get("version") == authority["info_version"], "info.version mismatch")
    servers = [entry.get("url") for entry in (spec.get("servers") or []) if isinstance(entry, dict)]
    require(servers == authority["server_urls"], "server URL list mismatch")
    paths = spec.get("paths")
    require(isinstance(paths, dict), "paths must be an object")
    path_count = len(paths)
    operation_count = sum(
        1
        for item in paths.values()
        if isinstance(item, dict)
        for method in item
        if method.lower() in HTTP_METHODS
    )
    require(path_count == authority["path_count"], "path count mismatch")
    require(operation_count == authority["operation_count"], "operation count mismatch")

    if output is not None:
        atomic_write(output, raw)

    return {
        "status": "PASS",
        "raw_bytes": len(raw),
        "raw_sha256": digest(raw),
        "openapi": spec["openapi"],
        "info_title": info["title"],
        "info_version": info["version"],
        "path_count": path_count,
        "operation_count": operation_count,
        "fragment_count": len(entries),
        "max_fragment_bytes": max(entry["bytes"] for entry in entries),
        "output_written": output is not None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent, help="transport directory")
    parser.add_argument("--output", type=Path, help="atomically write the verified raw Swagger JSON")
    parser.add_argument("--json", action="store_true", help="print the verification result as JSON")
    parser.add_argument("--json-output", type=Path, help="atomically write a canonical UTF-8 JSON verification report")
    args = parser.parse_args()
    try:
        result = verify(args.root.resolve(), args.output.resolve() if args.output else None)
    except (OSError, KeyError, TypeError, VerificationError) as exc:
        print(f"STEP7_EXACT_SWAGGER_AUTHORITY_V2_FAIL: {exc}")
        return 1

    rendered_json = json.dumps(result, ensure_ascii=False, sort_keys=True) + "\n"
    if args.json_output:
        atomic_write(args.json_output.resolve(), rendered_json.encode("utf-8"))
    if args.json:
        print(rendered_json, end="")
    elif not args.json_output:
        print(f"raw_bytes={result['raw_bytes']}")
        print(f"raw_sha256={result['raw_sha256']}")
        print(f"openapi={result['openapi']}")
        print(f"paths={result['path_count']}")
        print(f"operations={result['operation_count']}")
        print(f"fragments={result['fragment_count']}")
        print(f"max_fragment_bytes={result['max_fragment_bytes']}")
        print("STEP7_EXACT_SWAGGER_AUTHORITY_V2_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
