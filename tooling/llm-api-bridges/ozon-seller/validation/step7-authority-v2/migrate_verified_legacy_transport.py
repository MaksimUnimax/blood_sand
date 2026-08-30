#!/usr/bin/env python3
"""Migrate the byte-verified legacy Seller Swagger carrier to v2 fragments <= 9 KB."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import lzma
import shutil
from pathlib import Path
from typing import Any

LEGACY_MANIFEST = "OZON_SELLER_EXACT_SWAGGER_TRANSPORT_2026-08-30_MANIFEST.json"
EXPECTED_RAW_BYTES = 3_933_043
EXPECTED_RAW_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
EXPECTED_XZ_BYTES = 227_752
EXPECTED_XZ_SHA256 = "c7916a68ef192702fdb27c45d3571409e2d39c8697e164be04532063ea6cc267"
EXPECTED_ENCODING_BYTES = 303_672
EXPECTED_ENCODING_SHA256 = "c0960c97716423077e0825b3445254801fdaf077f33538c3088615e2be13dc27"
EXPECTED_CANONICAL_LF_BYTES = 303_673
EXPECTED_CANONICAL_LF_SHA256 = "6da7d7e5bfdcc9d52643ffe3824d4399584f3c44c61d60a2062b8146d9879cc0"
FRAGMENT_BYTES = 8_192
HARD_LIMIT_BYTES = 9_000
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validation-dir", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    validation_dir = args.validation_dir.resolve()
    out_dir = args.out_dir.resolve()

    legacy = json.loads((validation_dir / LEGACY_MANIFEST).read_text(encoding="utf-8"))
    require(legacy.get("schema") == "OZON_SELLER_EXACT_SWAGGER_TRANSPORT_V1", "STEP7_LEGACY_SCHEMA_FAIL")
    require(legacy["raw"]["bytes"] == EXPECTED_RAW_BYTES, "STEP7_LEGACY_RAW_BYTES_CONTRACT_FAIL")
    require(legacy["raw"]["sha256"] == EXPECTED_RAW_SHA256, "STEP7_LEGACY_RAW_SHA_CONTRACT_FAIL")
    require(legacy["xz"]["bytes"] == EXPECTED_XZ_BYTES, "STEP7_LEGACY_XZ_BYTES_CONTRACT_FAIL")
    require(legacy["xz"]["sha256"] == EXPECTED_XZ_SHA256, "STEP7_LEGACY_XZ_SHA_CONTRACT_FAIL")
    require(legacy["carrier"]["canonical_lf_bytes"] == EXPECTED_CANONICAL_LF_BYTES, "STEP7_LEGACY_CARRIER_BYTES_CONTRACT_FAIL")
    require(legacy["carrier"]["canonical_lf_sha256"] == EXPECTED_CANONICAL_LF_SHA256, "STEP7_LEGACY_CARRIER_SHA_CONTRACT_FAIL")

    chunks: list[bytes] = []
    for index, entry in enumerate(legacy["carrier"]["parts"], start=1):
        path = validation_dir / entry["file"]
        data = path.read_bytes()
        require(b"\r" not in data and b"\n" not in data, f"STEP7_LEGACY_PART_LINE_ENDING_FAIL:{index}")
        require(len(data) == entry["bytes"], f"STEP7_LEGACY_PART_BYTES_FAIL:{index}:{len(data)}")
        require(digest(data) == entry["sha256"], f"STEP7_LEGACY_PART_SHA_FAIL:{index}:{digest(data)}")
        chunks.append(data)
        print(f"STEP7_LEGACY_PART_{index}_IDENTITY_PASS")

    encoded = b"".join(chunks)
    canonical_lf = encoded + b"\n"
    require(len(encoded) == EXPECTED_ENCODING_BYTES, f"STEP7_ENCODING_BYTES_FAIL:{len(encoded)}")
    require(digest(encoded) == EXPECTED_ENCODING_SHA256, f"STEP7_ENCODING_SHA_FAIL:{digest(encoded)}")
    require(len(canonical_lf) == EXPECTED_CANONICAL_LF_BYTES, "STEP7_CANONICAL_LF_BYTES_FAIL")
    require(digest(canonical_lf) == EXPECTED_CANONICAL_LF_SHA256, "STEP7_CANONICAL_LF_SHA_FAIL")
    print("STEP7_LEGACY_CANONICAL_CARRIER_IDENTITY_PASS")

    try:
        packed = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise SystemExit(f"STEP7_STRICT_BASE64_FAIL:{exc}") from exc
    require(len(packed) == EXPECTED_XZ_BYTES, f"STEP7_XZ_BYTES_FAIL:{len(packed)}")
    require(digest(packed) == EXPECTED_XZ_SHA256, f"STEP7_XZ_SHA_FAIL:{digest(packed)}")
    raw = lzma.decompress(packed, format=lzma.FORMAT_XZ)
    require(len(raw) == EXPECTED_RAW_BYTES, f"STEP7_RAW_BYTES_FAIL:{len(raw)}")
    require(digest(raw) == EXPECTED_RAW_SHA256, f"STEP7_RAW_SHA_FAIL:{digest(raw)}")

    spec = json.loads(raw.decode("utf-8"))
    paths = spec.get("paths")
    require(spec.get("openapi") == "3.0.0", "STEP7_OPENAPI_FAIL")
    require(isinstance(paths, dict) and len(paths) == 463, "STEP7_PATH_COUNT_FAIL")
    operations = sum(
        1
        for item in paths.values()
        if isinstance(item, dict)
        for method in item
        if method.lower() in HTTP_METHODS
    )
    require(operations == 463, f"STEP7_OPERATION_COUNT_FAIL:{operations}")
    print("STEP7_EXACT_SWAGGER_AUTHORITY_PASS")

    fragments_dir = out_dir / "fragments"
    if fragments_dir.exists():
        shutil.rmtree(fragments_dir)
    fragments_dir.mkdir(parents=True, exist_ok=True)

    entries: list[dict[str, Any]] = []
    for index, offset in enumerate(range(0, len(encoded), FRAGMENT_BYTES), start=1):
        data = encoded[offset : offset + FRAGMENT_BYTES]
        name = f"seller-swagger-2026-08-25.json.xz.b64.part{index:04d}.txt"
        path = fragments_dir / name
        path.write_bytes(data)
        entries.append(
            {
                "index": index,
                "name": f"fragments/{name}",
                "bytes": len(data),
                "sha256": digest(data),
            }
        )

    require(len(entries) == 38, f"STEP7_FRAGMENT_COUNT_FAIL:{len(entries)}")
    require(max(entry["bytes"] for entry in entries) == FRAGMENT_BYTES, "STEP7_FRAGMENT_MAX_FAIL")
    require(all(entry["bytes"] <= HARD_LIMIT_BYTES for entry in entries), "STEP7_FRAGMENT_HARD_LIMIT_FAIL")

    info = spec.get("info") or {}
    servers = [entry.get("url") for entry in (spec.get("servers") or []) if isinstance(entry, dict)]
    manifest = {
        "schema": "ozon.seller.exact-swagger.transport.v2",
        "schema_version": 1,
        "authority": {
            "source_url": "https://docs.ozon.ru/api/seller/swagger.json",
            "capture_date": "2026-08-25",
            "raw_filename": "seller-swagger-2026-08-25.json",
            "bytes": len(raw),
            "sha256": digest(raw),
            "openapi": spec["openapi"],
            "info_title": info.get("title"),
            "info_version": info.get("version"),
            "server_urls": servers,
            "path_count": len(paths),
            "operation_count": operations,
            "http_methods": sorted(HTTP_METHODS),
        },
        "transport": {
            "compression": {
                "format": "xz",
                "preset_label": "legacy-verified-byte-identity",
                "check": "crc64",
                "bytes": len(packed),
                "sha256": digest(packed),
            },
            "encoding": {
                "format": "base64",
                "line_wrapping": "none",
                "bytes": len(encoded),
                "sha256": digest(encoded),
            },
            "fragments": {
                "directory": "fragments",
                "count": len(entries),
                "max_bytes": FRAGMENT_BYTES,
                "entries": entries,
            },
        },
        "provenance": {
            "migration": "verified legacy immutable carrier to byte-safe v2 fragments",
            "legacy_manifest": LEGACY_MANIFEST,
            "legacy_canonical_lf_bytes": len(canonical_lf),
            "legacy_canonical_lf_sha256": digest(canonical_lf),
            "network_used": False,
        },
    }
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    (out_dir / "manifest.json").write_bytes(manifest_bytes)
    print(f"STEP7_FRAGMENT_COUNT={len(entries)}")
    print(f"STEP7_FRAGMENT_MAX_BYTES={max(entry['bytes'] for entry in entries)}")
    print(f"STEP7_MANIFEST_BYTES={len(manifest_bytes)}")
    print("STEP7_EXACT_SWAGGER_TRANSPORT_V2_MIGRATION_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
