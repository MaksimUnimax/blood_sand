#!/usr/bin/env python3
"""Build the immutable Step 7 Ozon Seller Swagger authority carrier."""
from __future__ import annotations
import argparse, base64, hashlib, json, lzma, shutil
from pathlib import Path

RAW_BYTES = 3_933_043
RAW_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
XZ_BYTES = 227_752
XZ_SHA256 = "c7916a68ef192702fdb27c45d3571409e2d39c8697e164be04532063ea6cc267"
B64_BYTES = 303_672
B64_SHA256 = "c0960c97716423077e0825b3445254801fdaf077f33538c3088615e2be13dc27"
CHUNK_BYTES = 8_192
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(ok: bool, message: str) -> None:
    if not ok:
        raise SystemExit(message)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--root", required=True, type=Path)
    args = ap.parse_args()

    raw = args.input.read_bytes()
    require(len(raw) == RAW_BYTES, f"STEP7_RAW_BYTES_FAIL:{len(raw)}")
    require(sha256(raw) == RAW_SHA256, f"STEP7_RAW_SHA256_FAIL:{sha256(raw)}")
    spec = json.loads(raw.decode("utf-8"))
    paths = spec.get("paths")
    require(isinstance(paths, dict), "STEP7_PATHS_TYPE_FAIL")
    operations = sum(1 for item in paths.values() if isinstance(item, dict) for method in item if method.lower() in HTTP_METHODS)
    require(spec.get("openapi") == "3.0.0", f"STEP7_OPENAPI_FAIL:{spec.get('openapi')}")
    require(len(paths) == 463, f"STEP7_PATH_COUNT_FAIL:{len(paths)}")
    require(operations == 463, f"STEP7_OPERATION_COUNT_FAIL:{operations}")

    packed = lzma.compress(raw, format=lzma.FORMAT_XZ, preset=9 | lzma.PRESET_EXTREME)
    encoded = base64.b64encode(packed)
    require((len(packed), sha256(packed)) == (XZ_BYTES, XZ_SHA256), "STEP7_DETERMINISTIC_XZ_FAIL")
    require((len(encoded), sha256(encoded)) == (B64_BYTES, B64_SHA256), "STEP7_DETERMINISTIC_BASE64_FAIL")

    root = args.root
    fragments = root / "fragments"
    if fragments.exists():
        shutil.rmtree(fragments)
    fragments.mkdir(parents=True)
    entries = []
    for index, start in enumerate(range(0, len(encoded), CHUNK_BYTES), 1):
        chunk = encoded[start:start + CHUNK_BYTES]
        rel = f"fragments/seller-swagger-2026-08-25.json.xz.b64.part{index:04d}.txt"
        (root / rel).write_bytes(chunk)
        entries.append({"index": index, "name": rel, "bytes": len(chunk), "sha256": sha256(chunk)})

    manifest = {
        "schema": "ozon.seller.exact-swagger.transport.v2",
        "schema_version": 1,
        "created_on": "2026-08-30",
        "authority": {
            "source_url": "https://docs.ozon.ru/api/seller/swagger.json",
            "capture_date": "2026-08-25",
            "raw_filename": "seller-swagger-2026-08-25.json",
            "bytes": RAW_BYTES,
            "sha256": RAW_SHA256,
            "openapi": "3.0.0",
            "info_title": spec.get("info", {}).get("title"),
            "info_version": spec.get("info", {}).get("version"),
            "server_urls": [x.get("url") for x in spec.get("servers", []) if isinstance(x, dict)],
            "path_count": len(paths),
            "operation_count": operations,
            "http_methods": sorted(HTTP_METHODS),
        },
        "transport": {
            "compression": {"format": "xz", "preset_label": "9e", "check": "crc64", "bytes": XZ_BYTES, "sha256": XZ_SHA256},
            "encoding": {"format": "base64", "line_wrapping": "none", "bytes": B64_BYTES, "sha256": B64_SHA256},
            "fragments": {"directory": "fragments", "filename_pattern": "seller-swagger-2026-08-25.json.xz.b64.partNNNN.txt", "count": len(entries), "max_bytes": max(x["bytes"] for x in entries), "entries": entries},
        },
    }
    root.mkdir(parents=True, exist_ok=True)
    (root / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (root / "README.md").write_text(f"""# Step 7 exact Seller Swagger authority transport v2

Fail-closed, byte-safe carrier for the accepted Ozon Seller Swagger authority used by Step 7.

- raw bytes: `{RAW_BYTES}`
- raw SHA-256: `{RAW_SHA256}`
- OpenAPI: `3.0.0`
- paths / operations: `463 / 463`
- XZ bytes / SHA-256: `{XZ_BYTES}` / `{XZ_SHA256}`
- Base64 bytes / SHA-256: `{B64_BYTES}` / `{B64_SHA256}`
- ordered fragments: `{len(entries)}`; maximum `{max(x['bytes'] for x in entries)}` bytes

Verify:

```bash
python3 tooling/llm-api-bridges/ozon-seller/validation/step7-authority-v2/reconstruct_exact_swagger.py
```

The older truncated `OZON_SELLER_EXACT_SWAGGER_2026-08-30...` carrier remains quarantined and is not an input to this transport. Passing this verifier closes only the immutable-authority prerequisite; it does not by itself complete Seller 463/463 acceptance.
""", encoding="utf-8")
    (root / "STEP7_EXACT_SWAGGER_AUTHORITY_ACCEPTED_2026-08-30.md").write_text(f"""# Step 7 exact Swagger authority v2 — accepted prerequisite

Date: 2026-08-30

The immutable raw Swagger prerequisite is accepted with no weakened invariant:

- bytes: `{RAW_BYTES}`
- SHA-256: `{RAW_SHA256}`
- OpenAPI: `3.0.0`
- title: `{spec.get('info', {}).get('title')}`
- version: `{spec.get('info', {}).get('version')}`
- paths: `463`
- operations: `463`
- server: `{manifest['authority']['server_urls'][0]}`

Transport identity:

- XZ: `{XZ_BYTES}` bytes, `{XZ_SHA256}`
- Base64: `{B64_BYTES}` bytes, `{B64_SHA256}`
- fragments: `{len(entries)}`, maximum `{max(x['bytes'] for x in entries)}` bytes

Decision: `STEP7_EXACT_SWAGGER_AUTHORITY_V2_PASS`.

Boundary: the next roadmap item remains the frozen 463-operation terminal matrix and exhaustive replay/evidence ledger.
""", encoding="utf-8")

    print(f"STEP7_AUTHORITY_BUILD_PASS fragments={len(entries)} raw={RAW_SHA256}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
