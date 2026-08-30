#!/usr/bin/env python3
"""Fail-closed verifier/reconstructor for the accepted Ozon Seller Swagger authority."""

from __future__ import annotations

import argparse
import base64
import binascii
import hashlib
import json
import lzma
import os
import tempfile
from pathlib import Path
from typing import Any

EXPECTED_SCHEMA = "ozon.seller.exact-swagger.transport.v2"
EXPECTED_SCHEMA_VERSION = 1
EXPECTED_RAW_BYTES = 3_933_043
EXPECTED_RAW_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
EXPECTED_XZ_BYTES = 227_752
EXPECTED_XZ_SHA256 = "c7916a68ef192702fdb27c45d3571409e2d39c8697e164be04532063ea6cc267"
EXPECTED_ENCODING_BYTES = 303_672
EXPECTED_ENCODING_SHA256 = "c0960c97716423077e0825b3445254801fdaf077f33538c3088615e2be13dc27"
EXPECTED_OPENAPI = "3.0.0"
EXPECTED_INFO_TITLE = "Документация Ozon Seller API"
EXPECTED_INFO_VERSION = 2.1
EXPECTED_SERVER_URLS = ["//api-seller.ozon.ru"]
EXPECTED_PATH_COUNT = 463
EXPECTED_OPERATION_COUNT = 463
EXPECTED_FRAGMENT_COUNT = 38
EXPECTED_FRAGMENT_MAX_BYTES = 8_192
EXPECTED_LAST_FRAGMENT_BYTES = 568
HARD_FRAGMENT_LIMIT_BYTES = 9_000
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}
EXPECTED_FRAGMENT_NAMES = [
    f"fragments/seller-swagger-2026-08-25.json.xz.b64.part{index:04d}.txt"
    for index in range(1, EXPECTED_FRAGMENT_COUNT + 1)
]


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
    require(value.get("schema") == EXPECTED_SCHEMA, "unexpected manifest schema")
    require(value.get("schema_version") == EXPECTED_SCHEMA_VERSION, "unexpected manifest schema_version")
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
    compression = transport["compression"]
    encoding = transport["encoding"]
    fragment_meta = transport["fragments"]
    entries = fragment_meta["entries"]

    # The manifest describes the carrier, but it is not allowed to redefine authority.
    require(authority.get("bytes") == EXPECTED_RAW_BYTES, "manifest raw byte identity changed")
    require(authority.get("sha256") == EXPECTED_RAW_SHA256, "manifest raw SHA-256 identity changed")
    require(authority.get("openapi") == EXPECTED_OPENAPI, "manifest OpenAPI identity changed")
    require(authority.get("info_title") == EXPECTED_INFO_TITLE, "manifest info.title identity changed")
    require(authority.get("info_version") == EXPECTED_INFO_VERSION, "manifest info.version identity changed")
    require(authority.get("server_urls") == EXPECTED_SERVER_URLS, "manifest server identity changed")
    require(authority.get("path_count") == EXPECTED_PATH_COUNT, "manifest path count changed")
    require(authority.get("operation_count") == EXPECTED_OPERATION_COUNT, "manifest operation count changed")
    require(compression.get("format") == "xz", "manifest compression format changed")
    require(compression.get("bytes") == EXPECTED_XZ_BYTES, "manifest XZ byte identity changed")
    require(compression.get("sha256") == EXPECTED_XZ_SHA256, "manifest XZ SHA-256 identity changed")
    require(encoding.get("format") == "base64", "manifest encoding format changed")
    require(encoding.get("line_wrapping") == "none", "manifest line-wrapping contract changed")
    require(encoding.get("bytes") == EXPECTED_ENCODING_BYTES, "manifest encoded byte identity changed")
    require(encoding.get("sha256") == EXPECTED_ENCODING_SHA256, "manifest encoded SHA-256 identity changed")

    require(isinstance(entries, list) and entries, "fragment entry list is empty")
    require(fragment_meta.get("directory") == "fragments", "fragment directory contract changed")
    require(fragment_meta.get("count") == EXPECTED_FRAGMENT_COUNT, "manifest fragment count changed")
    require(len(entries) == EXPECTED_FRAGMENT_COUNT, "fragment entry count changed")
    require(fragment_meta.get("max_bytes") == EXPECTED_FRAGMENT_MAX_BYTES, "manifest fragment ceiling changed")
    require(EXPECTED_FRAGMENT_MAX_BYTES <= HARD_FRAGMENT_LIMIT_BYTES, "frozen fragment ceiling exceeds 9 KB")

    expected_names = [entry["name"] for entry in entries]
    require(expected_names == EXPECTED_FRAGMENT_NAMES, "fragment names or ordering changed")
    require([entry["index"] for entry in entries] == list(range(1, EXPECTED_FRAGMENT_COUNT + 1)), "fragment indices changed")
    expected_sizes = [EXPECTED_FRAGMENT_MAX_BYTES] * (EXPECTED_FRAGMENT_COUNT - 1) + [EXPECTED_LAST_FRAGMENT_BYTES]
    require([entry["bytes"] for entry in entries] == expected_sizes, "fragment size partition changed")
    require(len(expected_names) == len(set(expected_names)), "duplicate fragment names in manifest")

    fragments_dir = root / "fragments"
    require(fragments_dir.is_dir() and not fragments_dir.is_symlink(), "fragment directory missing or unsafe")
    nodes = list(fragments_dir.rglob("*"))
    require(all(path.is_file() and not path.is_symlink() for path in nodes), "fragment directory contains a directory or symlink")
    actual_names = sorted(str(path.relative_to(root)).replace(os.sep, "/") for path in nodes)
    require(actual_names == sorted(EXPECTED_FRAGMENT_NAMES), "fragment directory has missing, extra, or renamed files")

    payload_parts: list[bytes] = []
    for entry in entries:
        path = root / entry["name"]
        data = path.read_bytes()
        require(b"\r" not in data and b"\n" not in data, f"fragment contains line ending: {entry['name']}")
        require(len(data) == entry["bytes"], f"fragment size mismatch: {entry['name']}")
        require(len(data) <= EXPECTED_FRAGMENT_MAX_BYTES, f"fragment exceeds frozen ceiling: {entry['name']}")
        require(len(data) <= HARD_FRAGMENT_LIMIT_BYTES, f"fragment exceeds 9 KB hard ceiling: {entry['name']}")
        require(digest(data) == entry["sha256"], f"fragment SHA-256 mismatch: {entry['name']}")
        payload_parts.append(data)

    encoded = b"".join(payload_parts)
    require(len(encoded) == EXPECTED_ENCODING_BYTES, "encoded payload size mismatch")
    require(digest(encoded) == EXPECTED_ENCODING_SHA256, "encoded payload SHA-256 mismatch")
    try:
        compressed = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise VerificationError(f"strict base64 decode failed: {exc}") from exc

    require(len(compressed) == EXPECTED_XZ_BYTES, "compressed payload size mismatch")
    require(digest(compressed) == EXPECTED_XZ_SHA256, "compressed payload SHA-256 mismatch")
    try:
        raw = lzma.decompress(compressed, format=lzma.FORMAT_XZ)
    except lzma.LZMAError as exc:
        raise VerificationError(f"XZ decompression failed: {exc}") from exc

    require(len(raw) == EXPECTED_RAW_BYTES, "raw authority size mismatch")
    require(digest(raw) == EXPECTED_RAW_SHA256, "raw authority SHA-256 mismatch")
    try:
        spec = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise VerificationError(f"raw authority is not valid UTF-8 JSON: {exc}") from exc

    require(spec.get("openapi") == EXPECTED_OPENAPI, "OpenAPI version mismatch")
    info = spec.get("info") or {}
    require(info.get("title") == EXPECTED_INFO_TITLE, "info.title mismatch")
    require(info.get("version") == EXPECTED_INFO_VERSION, "info.version mismatch")
    servers = [entry.get("url") for entry in (spec.get("servers") or []) if isinstance(entry, dict)]
    require(servers == EXPECTED_SERVER_URLS, "server URL list mismatch")
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
    require(path_count == EXPECTED_PATH_COUNT, "path count mismatch")
    require(operation_count == EXPECTED_OPERATION_COUNT, "operation count mismatch")

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
        "output": str(output) if output is not None else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent, help="transport directory")
    parser.add_argument("--output", type=Path, help="atomically write the verified raw Swagger JSON")
    parser.add_argument("--json", action="store_true", help="print the verification result as JSON")
    args = parser.parse_args()
    try:
        result = verify(args.root.resolve(), args.output.resolve() if args.output else None)
    except (OSError, KeyError, TypeError, VerificationError) as exc:
        print(f"STEP7_EXACT_SWAGGER_AUTHORITY_V2_FAIL: {exc}")
        return 1

    if args.json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    else:
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
