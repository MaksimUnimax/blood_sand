#!/usr/bin/env python3
import argparse
import base64
import hashlib
import json
import lzma
from pathlib import Path

MANIFEST_FILE = "OZON_SELLER_EXACT_SWAGGER_TRANSPORT_2026-08-30_MANIFEST.json"
CARRIER_BYTES = 303673
CARRIER_SHA256 = "6da7d7e5bfdcc9d52643ffe3824d4399584f3c44c61d60a2062b8146d9879cc0"
XZ_BYTES = 227752
XZ_SHA256 = "c7916a68ef192702fdb27c45d3571409e2d39c8697e164be04532063ea6cc267"
RAW_BYTES = 3933043
RAW_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
PARTS = [
    ("OZON_SELLER_EXACT_SWAGGER_2026-08-30.json.xz.b64.part1", 75918, "641ff03e6ac22afd64d8dfa1d831b5a2a0de3387b75d87dc06cda766af2eeda1"),
    ("OZON_SELLER_EXACT_SWAGGER_2026-08-30.json.xz.b64.part2", 75918, "2a0263091c09c3a0024f5119278723879b59d9bba47616a0b7b036b4198c9e3e"),
    ("OZON_SELLER_EXACT_SWAGGER_2026-08-30.json.xz.b64.part3", 75918, "ebbca02ba07e376516370ca030c93858e1609014ea5edd931ec86e4578f8bbd1"),
    ("OZON_SELLER_EXACT_SWAGGER_2026-08-30.json.xz.b64.part4", 75918, "f01d97e3259cdb124ab9fbaaf6842888d34d7c3bf282f953b61477289df5d0c8"),
]


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--validation-dir", default=str(Path(__file__).resolve().parent))
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    validation_dir = Path(args.validation_dir)
    manifest = json.loads((validation_dir / MANIFEST_FILE).read_text(encoding="utf-8"))
    if manifest["raw"]["bytes"] != RAW_BYTES or manifest["raw"]["sha256"] != RAW_SHA256:
        raise SystemExit("SELLER_SWAGGER_TRANSPORT_MANIFEST_RAW_IDENTITY_FAIL")
    if manifest["xz"]["bytes"] != XZ_BYTES or manifest["xz"]["sha256"] != XZ_SHA256:
        raise SystemExit("SELLER_SWAGGER_TRANSPORT_MANIFEST_XZ_IDENTITY_FAIL")
    if manifest["carrier"]["canonical_lf_bytes"] != CARRIER_BYTES or manifest["carrier"]["canonical_lf_sha256"] != CARRIER_SHA256:
        raise SystemExit("SELLER_SWAGGER_TRANSPORT_MANIFEST_CARRIER_IDENTITY_FAIL")

    manifest_parts = manifest["carrier"].get("parts", [])
    if len(manifest_parts) != len(PARTS):
        raise SystemExit("SELLER_SWAGGER_TRANSPORT_MANIFEST_PART_COUNT_FAIL")
    chunks = []
    for idx, (name, expected_bytes, expected_sha) in enumerate(PARTS):
        m = manifest_parts[idx]
        if m.get("file") != name or m.get("bytes") != expected_bytes or m.get("sha256") != expected_sha:
            raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_MANIFEST_PART_IDENTITY_FAIL:{idx + 1}")
        data = (validation_dir / name).read_bytes()
        if b"\r" in data or b"\n" in data:
            raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_PART_LINE_ENDING_FAIL:{idx + 1}")
        if len(data) != expected_bytes or digest(data) != expected_sha:
            raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_PART_IDENTITY_FAIL:{idx + 1}:{len(data)}:{digest(data)}")
        chunks.append(data)
        print(f"SELLER_SWAGGER_TRANSPORT_PART_{idx + 1}_IDENTITY_PASS")

    canonical = b"".join(chunks) + b"\n"
    if len(canonical) != CARRIER_BYTES or digest(canonical) != CARRIER_SHA256:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_CANONICAL_CARRIER_IDENTITY_FAIL:{len(canonical)}:{digest(canonical)}")
    print("SELLER_SWAGGER_TRANSPORT_CANONICAL_CARRIER_IDENTITY_PASS")

    try:
        packed = base64.b64decode(canonical, validate=True)
    except Exception as exc:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_BASE64_DECODE_FAIL:{exc}")
    if len(packed) != XZ_BYTES or digest(packed) != XZ_SHA256:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_XZ_IDENTITY_FAIL:{len(packed)}:{digest(packed)}")
    print("SELLER_SWAGGER_TRANSPORT_XZ_IDENTITY_PASS")

    try:
        raw = lzma.decompress(packed, format=lzma.FORMAT_XZ)
    except Exception as exc:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_XZ_DECODE_FAIL:{exc}")
    if len(raw) != RAW_BYTES or digest(raw) != RAW_SHA256:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_RAW_IDENTITY_FAIL:{len(raw)}:{digest(raw)}")
    print("SELLER_SWAGGER_TRANSPORT_RAW_IDENTITY_PASS")

    swagger = json.loads(raw)
    methods = {"get", "post", "put", "patch", "delete"}
    ops = sum(1 for item in swagger.get("paths", {}).values() for method in item if method.lower() in methods)
    if swagger.get("openapi") != "3.0.0" or len(swagger.get("paths", {})) != 463 or ops != 463:
        raise SystemExit(f"SELLER_SWAGGER_TRANSPORT_SHAPE_FAIL:{swagger.get('openapi')}:{len(swagger.get('paths', {}))}:{ops}")
    print("SELLER_SWAGGER_TRANSPORT_OPENAPI_463_PASS")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(raw)
    print(str(out))
    print("OZON_SELLER_EXACT_SWAGGER_TRANSPORT_MATERIALIZATION_PASS")


if __name__ == "__main__":
    main()
