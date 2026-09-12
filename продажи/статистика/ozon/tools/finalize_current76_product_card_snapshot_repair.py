#!/usr/bin/env python3
"""Generate canonical README/manifest/repair-report from a verified CURRENT76 repaired bundle.

No provider/network calls. The script re-reads the repaired bundle parts, performs an independent
round-trip validation, then writes candidate authority documents. Legacy broken files are never
deleted or overwritten by this tool.
"""
from __future__ import annotations

import argparse
import base64
import csv
import gzip
import hashlib
import json
from pathlib import Path

EXPECTED_COUNT = 76
FORBIDDEN_SKU = 1608153316
INFO_REQUEST_ID = "b3040c6e-34dd-4ce0-ae73-e7a1585f589d"
ATTR_REQUEST_ID = "49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1"
PART_PREFIX = "CURRENT76_PRODUCT_CARDS_NORMALIZED_REPAIRED_2026-09-12.jsonl_bundle.gz.b64.part"
LEGACY_NORMALIZED_SHA = "771f99b1eca6396ded8765bbdd253230f09de647a03c04aac0aa25c9b74c47c0"
LEGACY_NORMALIZED_DECLARED_BYTES = 546409
LEGACY_NORMALIZED_PARTS = 4
LEGACY_CAPTURE_SHA = "7985fade8bf263a15cefc31f678cf3475a5bb7e6ec5056fdc631a23865db5e11"
LEGACY_CAPTURE_DECLARED_BYTES = 905948
LEGACY_CAPTURE_PARTS = 6


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_metadata(repair_dir: Path) -> dict:
    path = repair_dir / "REPAIR_METADATA_2026-09-12.json"
    if not path.is_file():
        raise RuntimeError(f"missing repair metadata: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("status") != "REPAIRED_SOURCE_QA_PASS":
        raise RuntimeError(f"repair metadata status is not PASS: {data.get('status')}")
    return data


def load_parts(repair_dir: Path) -> tuple[list[Path], str]:
    parts = sorted(repair_dir.glob(PART_PREFIX + "*"))
    if not parts:
        raise RuntimeError("no repaired Base64 parts found")
    expected_names = [f"{PART_PREFIX}{i:02d}" for i in range(1, len(parts) + 1)]
    actual_names = [p.name for p in parts]
    if actual_names != expected_names:
        raise RuntimeError(f"non-contiguous/incorrect part names: {actual_names}")
    joined = "".join(p.read_text(encoding="ascii") for p in parts)
    return parts, joined


def independent_validate(repair_dir: Path, metadata: dict) -> dict:
    parts, joined = load_parts(repair_dir)
    compressed = base64.b64decode(joined.encode("ascii"), validate=True)
    raw = gzip.decompress(compressed)
    rows = [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]
    if len(rows) != EXPECTED_COUNT:
        raise RuntimeError(f"JSONL record count expected {EXPECTED_COUNT}, got {len(rows)}")
    ordinals = [r.get("ordinal") for r in rows]
    if ordinals != list(range(1, EXPECTED_COUNT + 1)):
        raise RuntimeError("ordinals are not exactly 1..76")
    skus = [int(r.get("sku")) for r in rows]
    pids = [int(r.get("product_id")) for r in rows]
    if len(set(skus)) != EXPECTED_COUNT or len(set(pids)) != EXPECTED_COUNT:
        raise RuntimeError("SKU/product_id values are not unique")
    if FORBIDDEN_SKU in skus:
        raise RuntimeError(f"forbidden historical SKU {FORBIDDEN_SKU} present")
    desc = sum(bool(r.get("description_4191_present")) for r in rows)
    if desc != EXPECTED_COUNT:
        raise RuntimeError(f"description_4191 coverage expected 76, got {desc}")
    if any(r.get("product_info_request_id") != INFO_REQUEST_ID for r in rows):
        raise RuntimeError("unexpected product_info_request_id in JSONL")
    if any(r.get("product_attributes_request_id") != ATTR_REQUEST_ID for r in rows):
        raise RuntimeError("unexpected product_attributes_request_id in JSONL")

    actual = {
        "part_count": len(parts),
        "part_names": [p.name for p in parts],
        "base64_chars": len(joined),
        "compressed_bytes": len(compressed),
        "compressed_sha256": sha256(compressed),
        "uncompressed_bytes": len(raw),
        "uncompressed_sha256": sha256(raw),
        "jsonl_records": len(rows),
        "unique_skus": len(set(skus)),
        "unique_product_ids": len(set(pids)),
        "description_4191_count": desc,
    }
    for key in (
        "part_count", "base64_chars", "compressed_bytes", "compressed_sha256",
        "uncompressed_bytes", "uncompressed_sha256", "jsonl_records",
    ):
        if str(actual[key]) != str(metadata.get(key)):
            raise RuntimeError(
                f"metadata mismatch {key}: actual={actual[key]} metadata={metadata.get(key)}"
            )
    return actual


def read_canonical(canonical_path: Path) -> tuple[int, str]:
    raw = canonical_path.read_bytes()
    with canonical_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))
    if len(rows) != EXPECTED_COUNT:
        raise RuntimeError(f"canonical TSV expected 76 rows, got {len(rows)}")
    return len(rows), sha256(raw)


def render_readme(q: dict, metadata: dict, remote_pass: bool) -> str:
    lines = "\n".join(f"{i}. `{name}`" for i, name in enumerate(q["part_names"], 1))
    state = (
        "REPAIRED_NORMALIZED_VERIFIED__REMOTE_READBACK_PASS"
        if remote_pass else
        "REPAIRED_NORMALIZED_VERIFIED__REMOTE_READBACK_PENDING"
    )
    return f'''# Ozon current product-card snapshot — repaired authority — 2026-09-12

## Scope

Current product-card snapshot for the canonical 76 Ozon products used by the search-query collection in this period directory.

Canonical target authority: `../CANONICAL_CURRENT76_2026-09-11.tsv`.

## Successful preserved Bridge reads

- product info request: `{INFO_REQUEST_ID}` — HTTP 200 — 76/76;
- product attributes request: `{ATTR_REQUEST_ID}` — HTTP 200 — 76/76;
- long-description attribute `4191`: 76/76.

No new Ozon API collection was performed for this repair. The repaired authority was reconstructed from the already-successful preserved Bridge export and reconciled to the canonical 76-SKU target.

## Canonical repaired normalized bundle

Concatenate these files exactly in lexical order:

{lines}

Then strict Base64-decode and gzip-decompress the concatenated text.

- Base64 characters: `{q['base64_chars']}`
- compressed bytes: `{q['compressed_bytes']}`
- compressed SHA-256: `{q['compressed_sha256']}`
- uncompressed bytes: `{q['uncompressed_bytes']}`
- uncompressed SHA-256: `{q['uncompressed_sha256']}`
- JSONL records: `{q['jsonl_records']}`
- unique SKUs: `{q['unique_skus']}`
- unique product IDs: `{q['unique_product_ids']}`
- description `4191` coverage: `{q['description_4191_count']}/76`
- forbidden historical SKU `{FORBIDDEN_SKU}`: absent

Each JSONL record preserves canonical identity/provenance plus the complete product-info and product-attributes objects used by the repair.

## Legacy broken artifacts

The earlier four-part normalized bundle and six-part recovered capture remain immutable forensic evidence, but integrity validation proved them truncated/corrupt. They are **not analytical authorities** and must not be used for Phase A or downstream semantic analysis.

Legacy declared normalized SHA: `{LEGACY_NORMALIZED_SHA}`; declared bytes: `{LEGACY_NORMALIZED_DECLARED_BYTES}`; parts: `{LEGACY_NORMALIZED_PARTS}`.

Legacy declared capture SHA: `{LEGACY_CAPTURE_SHA}`; declared bytes: `{LEGACY_CAPTURE_DECLARED_BYTES}`; parts: `{LEGACY_CAPTURE_PARTS}`.

## Provenance

Source provenance: `chat_export_reconstruction_from_successful_bridge_result__repaired_verified`.

Source Bridge-export SHA-256: `{metadata.get('source_bridge_export_sha256', 'UNKNOWN')}`.
Canonical TSV SHA-256 captured during repair: `{metadata.get('canonical_tsv_sha256', 'UNKNOWN')}`.

## State

`CURRENT76_PRODUCT_INFO = HTTP200 / 76-of-76`

`CURRENT76_PRODUCT_ATTRIBUTES = HTTP200 / 76-of-76`

`CURRENT76_DESCRIPTION_ATTRIBUTE_4191 = 76-of-76`

`CURRENT76_REPAIRED_NORMALIZED_BUNDLE = {state}`
'''


def render_manifest(q: dict, metadata: dict, remote_pass: bool) -> str:
    status = (
        "REPAIRED_NORMALIZED_VERIFIED__REMOTE_READBACK_PASS"
        if remote_pass else
        "REPAIRED_NORMALIZED_VERIFIED__REMOTE_READBACK_PENDING"
    )
    header = [
        "snapshot_date", "canonical_target_count", "info_request_id", "info_http_status",
        "info_returned_count", "attributes_request_id", "attributes_http_status",
        "attributes_returned_count", "description_attribute_id", "description_coverage_count",
        "source_provenance", "source_bridge_export_sha256", "canonical_tsv_sha256",
        "normalized_bundle_sha256", "normalized_compressed_sha256", "normalized_uncompressed_bytes",
        "normalized_compressed_bytes", "normalized_base64_chars", "normalized_bundle_part_count",
        "legacy_normalized_status", "legacy_capture_status", "status",
    ]
    row = [
        "2026-09-12", "76", INFO_REQUEST_ID, "200", "76", ATTR_REQUEST_ID, "200", "76",
        "4191", "76", "chat_export_reconstruction_from_successful_bridge_result__repaired_verified",
        str(metadata.get("source_bridge_export_sha256", "")), str(metadata.get("canonical_tsv_sha256", "")),
        q["uncompressed_sha256"], q["compressed_sha256"], str(q["uncompressed_bytes"]),
        str(q["compressed_bytes"]), str(q["base64_chars"]), str(q["part_count"]),
        "LEGACY_TRUNCATED_NOT_AUTHORITY", "LEGACY_TRUNCATED_NOT_AUTHORITY", status,
    ]
    return "\t".join(header) + "\n" + "\t".join(row) + "\n"


def render_report(q: dict, metadata: dict, canonical_sha: str, remote_pass: bool) -> str:
    remote = "PASS" if remote_pass else "PENDING"
    return f'''# CURRENT76 product-card snapshot repair report — 2026-09-12

## Verdict

`LOCAL_REPAIR_QA = PASS`

`REMOTE_READBACK = {remote}`

`OZON_RECOLLECTION_REQUIRED = NO`

## Source authorities

- canonical SKU count: 76
- product info request: `{INFO_REQUEST_ID}`
- product attributes request: `{ATTR_REQUEST_ID}`
- source Bridge-export SHA-256: `{metadata.get('source_bridge_export_sha256', 'UNKNOWN')}`
- canonical TSV SHA-256 from current validation: `{canonical_sha}`
- canonical TSV SHA-256 captured by materializer: `{metadata.get('canonical_tsv_sha256', 'UNKNOWN')}`

## Independent repaired-bundle QA

- part count: {q['part_count']}
- Base64 chars: {q['base64_chars']}
- strict Base64 decode: PASS
- compressed bytes: {q['compressed_bytes']}
- compressed SHA-256: `{q['compressed_sha256']}`
- gzip full decompression: PASS
- uncompressed bytes: {q['uncompressed_bytes']}
- uncompressed SHA-256: `{q['uncompressed_sha256']}`
- JSONL records: {q['jsonl_records']}
- ordinals: 1..76
- unique SKUs: {q['unique_skus']}
- unique product IDs: {q['unique_product_ids']}
- description `4191`: {q['description_4191_count']}/76
- forbidden SKU `{FORBIDDEN_SKU}`: 0
- request-ID provenance in every record: PASS

## Legacy boundary

The previously published normalized/capture artifacts were proven truncated. They remain forensic evidence only and are superseded as analytical authority by the repaired normalized bundle after remote readback passes.

## Gate

Phase A may be changed from `BLOCKED_SOURCE_INTEGRITY` only after the repaired parts, README, manifest, and this report are read back from the remote target branch and the bundle is reconstructed again from those remote bytes with identical hashes and counts.
'''


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repair-dir", type=Path, required=True)
    ap.add_argument("--canonical-tsv", type=Path, required=True)
    ap.add_argument("--output-dir", type=Path, required=True)
    ap.add_argument("--remote-readback-pass", action="store_true")
    ap.add_argument("--overwrite", action="store_true")
    args = ap.parse_args()

    metadata = load_metadata(args.repair_dir)
    q = independent_validate(args.repair_dir, metadata)
    count, canonical_sha = read_canonical(args.canonical_tsv)
    if count != EXPECTED_COUNT:
        raise RuntimeError("canonical count gate failed")
    if metadata.get("canonical_tsv_sha256") != canonical_sha:
        raise RuntimeError(
            "canonical TSV hash drift since materialization: "
            f"materializer={metadata.get('canonical_tsv_sha256')} current={canonical_sha}"
        )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    outputs = {
        "README.md": render_readme(q, metadata, args.remote_readback_pass),
        "product_card_snapshot_manifest_2026-09-12.tsv": render_manifest(q, metadata, args.remote_readback_pass),
        "PRODUCT_CARD_SNAPSHOT_REPAIR_REPORT_2026-09-12.md": render_report(
            q, metadata, canonical_sha, args.remote_readback_pass
        ),
    }
    for name, content in outputs.items():
        path = args.output_dir / name
        if path.exists() and not args.overwrite:
            raise RuntimeError(f"refusing to overwrite {path} without --overwrite")
        path.write_text(content, encoding="utf-8")

    print(json.dumps({
        "status": "FINALIZER_QA_PASS",
        "remote_readback_flag": bool(args.remote_readback_pass),
        "outputs": sorted(outputs),
        **q,
    }, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
