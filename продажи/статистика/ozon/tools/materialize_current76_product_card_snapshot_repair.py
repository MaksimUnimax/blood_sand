#!/usr/bin/env python3
"""Rebuild the Ozon CURRENT76 normalized product-card snapshot from a preserved Bridge chat export.

This script performs NO network/provider calls. It extracts the two already-successful Ozon Bridge
results by exact request_id, reconciles them to the canonical 76-SKU authority, writes deterministic
JSONL, gzip-compresses it with mtime=0, Base64-encodes it, splits it into GitHub-safe text parts,
and immediately round-trip verifies the published payload.
"""
from __future__ import annotations

import argparse
import base64
import csv
import gzip
import hashlib
import json
import re
import sys
from pathlib import Path

INFO_REQUEST_ID = "b3040c6e-34dd-4ce0-ae73-e7a1585f589d"
ATTR_REQUEST_ID = "49acdfc1-53e8-49b5-a5fd-1dfc1bc733c1"
FORBIDDEN_SKU = "1608153316"
EXPECTED_COUNT = 76
KNOWN_PRIOR_REPAIRED_UNCOMPRESSED_SHA256 = (
    "0cf18f2b4594990c43ae023c7aff86ca7a0f144efefa379b6305748620999551"
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def strip_markdown_escape_artifacts(text: str) -> str:
    """Undo Markdown escape characters that are not legal JSON escapes.

    Chat export surfaces can insert a backslash before Markdown punctuation inside JSON-like text.
    We only remove escapes that JSON itself never uses. Standard JSON escapes remain untouched.
    """
    return re.sub(r"\\([_<>\[\]()#*`~])", r"\1", text)


def extract_balanced_json(text: str, brace_pos: int) -> str:
    if brace_pos < 0 or brace_pos >= len(text) or text[brace_pos] != "{":
        raise ValueError("brace_pos must point to '{'")
    depth = 0
    in_string = False
    escaped = False
    for i in range(brace_pos, len(text)):
        ch = text[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[brace_pos : i + 1]
    raise ValueError("Unterminated JSON object after OZON_RESULT_V1 marker")


def iter_ozon_result_objects(raw_text: str):
    marker = "OZON_RESULT_V1"
    pos = 0
    while True:
        idx = raw_text.find(marker, pos)
        if idx < 0:
            break
        brace = raw_text.find("{", idx + len(marker))
        if brace < 0:
            break
        candidate = extract_balanced_json(raw_text, brace)
        yield candidate
        pos = brace + len(candidate)


def tolerant_json_loads(candidate: str) -> dict:
    variants = [candidate, strip_markdown_escape_artifacts(candidate)]
    errors = []
    for value in variants:
        try:
            return json.loads(value)
        except json.JSONDecodeError as exc:
            errors.append(str(exc))
    raise ValueError("Could not parse OZON_RESULT_V1 JSON: " + " | ".join(errors))


def load_exact_bridge_result(export_path: Path, request_id: str) -> dict:
    raw = export_path.read_text(encoding="utf-8", errors="replace")
    seen = []
    parse_errors = []
    for candidate in iter_ozon_result_objects(raw):
        # Cheap request-id filter before tolerant parsing keeps giant exports tractable.
        if request_id not in candidate:
            continue
        try:
            obj = tolerant_json_loads(candidate)
        except Exception as exc:  # preserve context for a hard gate failure
            parse_errors.append(str(exc))
            continue
        seen.append(obj)
    exact = [o for o in seen if o.get("request_id") == request_id]
    if not exact:
        detail = f"exact_matches=0 parsed_candidates={len(seen)}"
        if parse_errors:
            detail += f" parse_errors={parse_errors[:3]}"
        raise RuntimeError(f"No Bridge result found for {request_id}; {detail}")

    # Chat/recovery exports can quote the same provider result more than once. Identical
    # repeats are harmless provenance duplicates; conflicting repeats are a hard failure.
    canonical_forms = {
        json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":")) for o in exact
    }
    if len(canonical_forms) != 1:
        raise RuntimeError(
            f"Conflicting duplicate Bridge results for {request_id}: occurrences={len(exact)} "
            f"unique_payloads={len(canonical_forms)}"
        )
    obj = exact[0]
    if obj.get("http_status") != 200:
        raise RuntimeError(f"Bridge result {request_id} is not HTTP200: {obj.get('http_status')}")
    return obj


def load_canonical(canonical_path: Path) -> list[dict[str, str]]:
    with canonical_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter="\t"))
    required = {"ordinal", "product_id", "sku", "source_request_id"}
    if not rows or not required.issubset(rows[0].keys()):
        raise RuntimeError(f"Canonical TSV missing required columns: {sorted(required)}")
    if len(rows) != EXPECTED_COUNT:
        raise RuntimeError(f"Canonical target count must be {EXPECTED_COUNT}, got {len(rows)}")
    ordinals = [int(r["ordinal"]) for r in rows]
    if ordinals != list(range(1, EXPECTED_COUNT + 1)):
        raise RuntimeError("Canonical ordinals are not exactly 1..76")
    skus = [r["sku"] for r in rows]
    pids = [r["product_id"] for r in rows]
    if len(set(skus)) != EXPECTED_COUNT or len(set(pids)) != EXPECTED_COUNT:
        raise RuntimeError("Canonical SKU/product_id values are not unique")
    if FORBIDDEN_SKU in skus:
        raise RuntimeError(f"Forbidden historical SKU {FORBIDDEN_SKU} present in canonical target")
    return rows


def extract_info_items(obj: dict) -> list[dict]:
    items = obj.get("result", {}).get("items")
    if not isinstance(items, list):
        raise RuntimeError("product-info Bridge result missing result.items[]")
    return items


def extract_attribute_items(obj: dict) -> list[dict]:
    items = obj.get("result", {}).get("result")
    if not isinstance(items, list):
        raise RuntimeError("product-attributes Bridge result missing result.result[]")
    return items


def attr_values(item: dict, attr_id: int) -> list[str]:
    out = []
    for attr in item.get("attributes") or []:
        if attr.get("id") != attr_id:
            continue
        for value in attr.get("values") or []:
            v = value.get("value")
            if isinstance(v, str) and v.strip():
                out.append(v)
    return out


def normalize_records(canonical: list[dict[str, str]], info_obj: dict, attrs_obj: dict) -> list[dict]:
    info_items = extract_info_items(info_obj)
    attrs_items = extract_attribute_items(attrs_obj)
    if len(info_items) != EXPECTED_COUNT:
        raise RuntimeError(f"product_info_count expected 76, got {len(info_items)}")
    if len(attrs_items) != EXPECTED_COUNT:
        raise RuntimeError(f"product_attributes_count expected 76, got {len(attrs_items)}")

    info_by_pid = {str(x.get("id")): x for x in info_items}
    attr_by_pid = {str(x.get("id")): x for x in attrs_items}
    if len(info_by_pid) != EXPECTED_COUNT or len(attr_by_pid) != EXPECTED_COUNT:
        raise RuntimeError("Duplicate/missing product IDs inside provider results")

    canonical_pids = {r["product_id"] for r in canonical}
    if set(info_by_pid) != canonical_pids:
        raise RuntimeError(
            "product-info product_id set differs from canonical: "
            f"missing={sorted(canonical_pids - set(info_by_pid))} "
            f"extra={sorted(set(info_by_pid) - canonical_pids)}"
        )
    if set(attr_by_pid) != canonical_pids:
        raise RuntimeError(
            "product-attributes product_id set differs from canonical: "
            f"missing={sorted(canonical_pids - set(attr_by_pid))} "
            f"extra={sorted(set(attr_by_pid) - canonical_pids)}"
        )

    records = []
    description_count = 0
    seen_skus = set()
    for row in canonical:
        pid = row["product_id"]
        sku = row["sku"]
        info = info_by_pid[pid]
        attrs = attr_by_pid[pid]

        info_sku = str(info.get("sku", ""))
        attr_sku = str(attrs.get("sku", ""))
        if info_sku != sku:
            raise RuntimeError(f"product-info SKU mismatch for product_id {pid}: {info_sku} != {sku}")
        if attr_sku != sku:
            raise RuntimeError(f"product-attributes SKU mismatch for product_id {pid}: {attr_sku} != {sku}")
        if sku == FORBIDDEN_SKU:
            raise RuntimeError(f"Forbidden SKU {FORBIDDEN_SKU} present in provider results")
        if sku in seen_skus:
            raise RuntimeError(f"Duplicate SKU in normalized records: {sku}")
        seen_skus.add(sku)

        desc = attr_values(attrs, 4191)
        if desc:
            description_count += 1

        # Lossless record: retain both complete provider objects plus canonical identity/provenance.
        # sort_keys at serialization makes the byte representation deterministic.
        records.append(
            {
                "ordinal": int(row["ordinal"]),
                "product_id": int(pid),
                "sku": int(sku),
                "canonical_source_request_id": row["source_request_id"],
                "product_info_request_id": INFO_REQUEST_ID,
                "product_attributes_request_id": ATTR_REQUEST_ID,
                "description_4191_present": bool(desc),
                "product_info": info,
                "product_attributes": attrs,
            }
        )

    if description_count != EXPECTED_COUNT:
        missing = [str(r["sku"]) for r in records if not r["description_4191_present"]]
        raise RuntimeError(f"description_4191_count expected 76, got {description_count}; missing={missing}")
    return records


def serialize_jsonl(records: list[dict]) -> bytes:
    lines = [
        json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        for r in records
    ]
    return ("\n".join(lines) + "\n").encode("utf-8")


def gzip_deterministic(data: bytes) -> bytes:
    return gzip.compress(data, compresslevel=9, mtime=0)


def split_text(text: str, part_size: int) -> list[str]:
    return [text[i : i + part_size] for i in range(0, len(text), part_size)]


def verify_round_trip(parts: list[str], expected_uncompressed: bytes) -> dict:
    joined = "".join(parts)
    try:
        compressed = base64.b64decode(joined.encode("ascii"), validate=True)
    except Exception as exc:
        raise RuntimeError(f"Strict Base64 decode failed: {exc}") from exc
    try:
        recovered = gzip.decompress(compressed)
    except Exception as exc:
        raise RuntimeError(f"gzip round-trip failed: {exc}") from exc
    if recovered != expected_uncompressed:
        raise RuntimeError("Round-trip bytes differ from materialized JSONL")
    # JSONL structural validation after round trip.
    lines = recovered.decode("utf-8").splitlines()
    parsed = [json.loads(line) for line in lines if line.strip()]
    if len(parsed) != EXPECTED_COUNT:
        raise RuntimeError(f"Round-trip JSONL count expected 76, got {len(parsed)}")
    return {
        "base64_chars": len(joined),
        "compressed_bytes": len(compressed),
        "uncompressed_bytes": len(recovered),
        "uncompressed_sha256": sha256_bytes(recovered),
        "compressed_sha256": sha256_bytes(compressed),
        "jsonl_records": len(parsed),
        "part_count": len(parts),
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--bridge-export", type=Path, required=True)
    p.add_argument("--canonical-tsv", type=Path, required=True)
    p.add_argument("--output-dir", type=Path, required=True)
    p.add_argument("--part-size", type=int, default=18000)
    p.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow replacing prior repaired outputs in output-dir after all QA gates pass.",
    )
    p.add_argument(
        "--expected-prior-sha256",
        default=None,
        help=(
            "Optional regression gate against a previously verified uncompressed SHA-256. "
            "Known prior repair was " + KNOWN_PRIOR_REPAIRED_UNCOMPRESSED_SHA256
        ),
    )
    args = p.parse_args()

    if args.part_size <= 0:
        raise SystemExit("--part-size must be > 0")
    if not args.bridge_export.is_file():
        raise SystemExit(f"Bridge export not found: {args.bridge_export}")
    if not args.canonical_tsv.is_file():
        raise SystemExit(f"Canonical TSV not found: {args.canonical_tsv}")

    bridge_export_bytes = args.bridge_export.read_bytes()
    canonical_bytes = args.canonical_tsv.read_bytes()
    canonical = load_canonical(args.canonical_tsv)
    info_obj = load_exact_bridge_result(args.bridge_export, INFO_REQUEST_ID)
    attrs_obj = load_exact_bridge_result(args.bridge_export, ATTR_REQUEST_ID)
    records = normalize_records(canonical, info_obj, attrs_obj)
    jsonl = serialize_jsonl(records)
    gz = gzip_deterministic(jsonl)
    b64 = base64.b64encode(gz).decode("ascii")
    parts = split_text(b64, args.part_size)
    qa = verify_round_trip(parts, jsonl)

    if args.expected_prior_sha256 and qa["uncompressed_sha256"] != args.expected_prior_sha256:
        raise RuntimeError(
            "Materialized SHA-256 does not match the supplied prior repair authority: "
            f"actual={qa['uncompressed_sha256']} expected={args.expected_prior_sha256}"
        )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    prefix = "CURRENT76_PRODUCT_CARDS_NORMALIZED_REPAIRED_2026-09-12.jsonl_bundle.gz.b64"
    existing = list(args.output_dir.glob(prefix + ".part*"))
    existing += [
        args.output_dir / "CURRENT76_PRODUCT_CARDS_NORMALIZED_REPAIRED_2026-09-12.jsonl",
        args.output_dir / "REPAIR_METADATA_2026-09-12.json",
    ]
    existing = [p for p in existing if p.exists()]
    if existing and not args.overwrite:
        raise RuntimeError(
            "Refusing to overwrite prior repaired outputs without --overwrite: "
            + ", ".join(str(p) for p in existing)
        )
    for old in existing:
        old.unlink()
    for i, part in enumerate(parts, 1):
        (args.output_dir / f"{prefix}.part{i:02d}").write_text(part, encoding="ascii")
    (args.output_dir / "CURRENT76_PRODUCT_CARDS_NORMALIZED_REPAIRED_2026-09-12.jsonl").write_bytes(jsonl)

    metadata = {
        "status": "REPAIRED_SOURCE_QA_PASS",
        "source_bridge_export": str(args.bridge_export),
        "source_bridge_export_sha256": sha256_bytes(bridge_export_bytes),
        "canonical_tsv": str(args.canonical_tsv),
        "canonical_tsv_sha256": sha256_bytes(canonical_bytes),
        "product_info_request_id": INFO_REQUEST_ID,
        "product_attributes_request_id": ATTR_REQUEST_ID,
        "canonical_sku_count": EXPECTED_COUNT,
        "product_info_count": EXPECTED_COUNT,
        "product_attributes_count": EXPECTED_COUNT,
        "description_4191_count": EXPECTED_COUNT,
        "forbidden_sku_present": False,
        "part_size_chars": args.part_size,
        "known_prior_repaired_uncompressed_sha256": KNOWN_PRIOR_REPAIRED_UNCOMPRESSED_SHA256,
        **qa,
    }
    (args.output_dir / "REPAIR_METADATA_2026-09-12.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(metadata, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"REPAIR_FAILED: {exc}", file=sys.stderr)
        raise
