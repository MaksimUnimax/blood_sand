#!/usr/bin/env python3
"""Build the Ozon full API master checklist from pinned audited operation indexes.

This generator intentionally does NOT use the bundled mirror OpenAPI JSON as schema
contract authority. The project has separately accepted exact Swagger byte identities,
while the currently bundled mirror JSON has different byte sizes. The pinned indexes
are used only to reconstruct the complete method+path operation universe.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path

SELLER_COUNT = 463
PERFORMANCE_COUNT = 48
PERFORMANCE_PATH_COUNT = 47
SELLER_INDEX_GIT_BLOB = "5ac977ff7758b7042de44523d702860d70fa2a44"
PERFORMANCE_INDEX_GIT_BLOB = "34405f2b4e0ec067b72254665d6e49a3ea0ce8c6"
PINNED_MIRROR_COMMIT = "1953152c36955225b459cf55963a2c3a7a234661"

SELLER_EXACT = {
    "bytes": 3933043,
    "sha256": "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40",
    "openapi": "3.0.0",
    "operations": 463,
}
PERFORMANCE_EXACT = {
    "bytes": 304771,
    "sha256": "7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec",
    "openapi": "3.0.0",
    "paths": 47,
    "operations": 48,
}

EXPECTED_CURRENT_REGISTRY_OUTSIDE_INVENTORY = [
    ("performance_api", "GET /api/client/statistics/campaign/product/json", "performance_campaign_product"),
    ("performance_api", "GET /api/client/statistics/daily/json", "performance_daily"),
    ("performance_api", "GET /api/client/statistics/expense/json", "performance_expense"),
]

HEADER_RE = re.compile(r"^##\s+(?P<title>.*?)\s+\(`(?P<tag>[^`]+)`,\s*(?P<count>\d+)\)")
OP_RE = re.compile(r"^-\s+`(?P<method>[A-Z]+)\s+(?P<path>/[^`]+)`\s+—\s+(?P<purpose>.*)$")


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def parse_index(path: Path, provider: str):
    data = path.read_bytes()
    text = data.decode("utf-8")
    rows = []
    section_title = None
    section_tag = None
    declared_count = None
    section_seen = 0
    section_counts = []

    def close_section():
        nonlocal section_seen
        if section_tag is not None:
            section_counts.append((section_tag, declared_count, section_seen))
        section_seen = 0

    for raw in text.splitlines():
        hm = HEADER_RE.match(raw)
        if hm:
            close_section()
            section_title = hm.group("title").strip()
            section_tag = hm.group("tag").strip()
            declared_count = int(hm.group("count"))
            continue
        om = OP_RE.match(raw)
        if not om:
            continue
        if not section_tag:
            raise AssertionError(f"operation outside category: {raw}")
        method = om.group("method").upper()
        fixed_path = om.group("path").strip()
        purpose = om.group("purpose").strip()
        section_seen += 1
        rows.append({
            "provider": provider,
            "http_method": method,
            "fixed_path": fixed_path,
            "operation_key": f"{method} {fixed_path}",
            "source_category_tag": section_tag,
            "source_category_title": section_title,
            "purpose": purpose,
        })
    close_section()

    for tag, expected, actual in section_counts:
        if expected != actual:
            raise AssertionError(f"{provider} category {tag}: declared {expected}, parsed {actual}")

    keys = [r["operation_key"] for r in rows]
    if len(keys) != len(set(keys)):
        dupes = sorted({k for k in keys if keys.count(k) > 1})
        raise AssertionError(f"duplicate {provider} operation keys: {dupes}")
    return data, rows, section_counts


def normalize_registry_provider(value: str | None) -> str | None:
    if not value:
        return None
    v = value.lower()
    if "performance" in v:
        return "performance_api"
    if "seller" in v or v == "ozon":
        return "seller_api"
    return value


def load_current_registry(path: Path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, dict) and "operations" in raw:
        raw = raw["operations"]
    if not isinstance(raw, dict):
        raise AssertionError("current registry dump must be an object keyed by alias")
    by_key = {}
    for alias, meta in raw.items():
        if not isinstance(meta, dict):
            continue
        method = str(meta.get("method") or meta.get("http_method") or "").upper()
        fixed_path = meta.get("path") or meta.get("fixed_path")
        provider = normalize_registry_provider(meta.get("provider"))
        if not method or not fixed_path or provider not in {"seller_api", "performance_api"}:
            continue
        key = (provider, f"{method} {fixed_path}")
        by_key.setdefault(key, []).append((alias, meta))
    return by_key


def currentness_from_purpose(purpose: str) -> str:
    p = purpose.lower()
    if "deprecated" in p or "устар" in p:
        return "DEPRECATED_CANDIDATE_REVIEW"
    return "CURRENT_INDEX_ENTRY"


def enrich(rows, registry):
    out = []
    for row in rows:
        provider = row["provider"]
        hits = registry.get((provider, row["operation_key"]), [])
        aliases = sorted(alias for alias, _ in hits)
        metas = [m for _, m in hits]
        implemented = bool(hits)
        effects = sorted({str(m.get("effect")) for m in metas if m.get("effect")})
        workflow_roles = sorted({str(m.get("workflow_role")) for m in metas if m.get("workflow_role")})
        privacy = sorted({str(m.get("privacy_policy")) for m in metas if m.get("privacy_policy")})
        entitlements = sorted({str(m.get("entitlement_key")) for m in metas if m.get("entitlement_key")})
        quotas = sorted({str(m.get("quota_class")) for m in metas if m.get("quota_class")})
        pagination = sorted({str(m.get("pagination_model")) for m in metas if m.get("pagination_model")})
        clusters = sorted({str(m.get("cluster")) for m in metas if m.get("cluster")})
        sections = sorted({str(m.get("section")) for m in metas if m.get("section")})

        classification = "UNRESOLVED"
        if implemented and effects == ["READ"]:
            classification = "READ_WORKFLOW" if any(r not in {"single_read", "single_request"} for r in workflow_roles) else "READ"

        out.append({
            **row,
            "currentness": currentness_from_purpose(row["purpose"]),
            "classification": classification,
            "bridge_implemented_current_canonical": implemented,
            "bridge_aliases": aliases,
            "bridge_effects": effects,
            "accepted_or_current_source": "repair/ozon-v2-b1-stocks-warehouse-2026-08-29@d27362052dfd5af2aea49778adc989a5d9288850" if implemented else None,
            "personal_data_requirement": privacy if privacy else "UNRESOLVED",
            "entitlement_rule": entitlements if entitlements else "UNRESOLVED",
            "quota_rule": quotas if quotas else "UNRESOLVED",
            "pagination_model": pagination if pagination else "UNRESOLVED",
            "workflow_role": workflow_roles if workflow_roles else "UNRESOLVED",
            "current_canonical_clusters": clusters,
            "current_canonical_sections": sections,
            "schema_contract_verification": "REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT",
            "final_action": "KEEP_CURRENT_CANONICAL" if implemented else "RESEARCH",
        })
    return out


def registry_outside_inventory(registry, rows):
    inventory_keys = {(r["provider"], r["operation_key"]) for r in rows}
    extras = []
    for (provider, operation_key), hits in sorted(registry.items()):
        if (provider, operation_key) in inventory_keys:
            continue
        aliases = sorted(alias for alias, _ in hits)
        metas = [m for _, m in hits]
        extras.append({
            "provider": provider,
            "operation_key": operation_key,
            "aliases": aliases,
            "effects": sorted({str(m.get("effect")) for m in metas if m.get("effect")}),
            "execution_enabled": sorted({bool(m.get("execution_enabled")) for m in metas}),
            "reason": "PRESERVED_LEGACY_COMPATIBILITY_ROUTE_OUTSIDE_CURRENT_PINNED_API_INDEX",
            "source": "accepted B0/B6 compatibility surface carried by canonical B1",
            "final_action": "PRESERVE_COMPATIBILITY_AND_DO_NOT_COUNT_AS_CURRENT_48_OPERATION_PERFORMANCE_INVENTORY",
        })
    signature = sorted(
        (x["provider"], x["operation_key"], alias)
        for x in extras
        for alias in x["aliases"]
    )
    assert signature == EXPECTED_CURRENT_REGISTRY_OUTSIDE_INVENTORY, signature
    return extras


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seller-index", required=True)
    ap.add_argument("--performance-index", required=True)
    ap.add_argument("--registry-json", required=True)
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-csv", required=True)
    ap.add_argument("--out-summary", required=True)
    args = ap.parse_args()

    seller_data, seller, seller_sections = parse_index(Path(args.seller_index), "seller_api")
    perf_data, perf, perf_sections = parse_index(Path(args.performance_index), "performance_api")

    assert git_blob_sha1(seller_data) == SELLER_INDEX_GIT_BLOB
    assert git_blob_sha1(perf_data) == PERFORMANCE_INDEX_GIT_BLOB
    assert len(seller) == SELLER_COUNT, len(seller)
    assert len(perf) == PERFORMANCE_COUNT, len(perf)
    assert len({r["fixed_path"] for r in perf}) == PERFORMANCE_PATH_COUNT

    registry = load_current_registry(Path(args.registry_json))
    rows = enrich(seller + perf, registry)
    assert len(rows) == 511
    assert len({(r["provider"], r["operation_key"]) for r in rows}) == 511

    registry_alias_count = sum(len(hits) for hits in registry.values())
    assert registry_alias_count == 42, registry_alias_count
    extras = registry_outside_inventory(registry, rows)
    assert len(extras) == 3

    payload = {
        "schema": "OZON_FULL_API_MASTER_CHECKLIST_V2",
        "as_of": "2026-08-29",
        "roadmap_step": 2,
        "status": "OPERATION_UNIVERSE_BUILT_EXACT_SCHEMA_RECONCILIATION_PENDING",
        "sources": {
            "seller_exact_contract_authority": SELLER_EXACT,
            "performance_exact_contract_authority": PERFORMANCE_EXACT,
            "operation_pair_inventory": {
                "repository": "MissiaL/ozon-api",
                "commit": PINNED_MIRROR_COMMIT,
                "seller_index_path": "references/index.md",
                "seller_index_git_blob": SELLER_INDEX_GIT_BLOB,
                "performance_index_path": "references/index-performance.md",
                "performance_index_git_blob": PERFORMANCE_INDEX_GIT_BLOB,
                "role": "method+path+purpose inventory only; not exact schema-byte authority",
            },
            "important_caveat": "Bundled mirror OpenAPI JSON bytes at the pinned commit do not match the project-accepted exact Swagger byte identities. No request/response schema decision may be made from the mirror JSON alone.",
        },
        "counts": {
            "seller": len(seller),
            "performance": len(perf),
            "total": len(rows),
            "seller_categories": len(seller_sections),
            "performance_categories": len(perf_sections),
            "current_registry_aliases_total": registry_alias_count,
            "current_canonical_in_current_inventory": sum(1 for r in rows if r["bridge_implemented_current_canonical"]),
            "current_registry_outside_current_inventory": len(extras),
            "classification_unresolved": sum(1 for r in rows if r["classification"] == "UNRESOLVED"),
        },
        "current_registry_outside_current_inventory": extras,
        "rows": rows,
    }

    out_json = Path(args.out_json)
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    columns = [
        "provider", "http_method", "fixed_path", "operation_key", "source_category_tag", "source_category_title", "purpose",
        "currentness", "classification", "bridge_implemented_current_canonical", "bridge_aliases", "bridge_effects",
        "accepted_or_current_source", "personal_data_requirement", "entitlement_rule", "quota_rule", "pagination_model",
        "workflow_role", "current_canonical_clusters", "current_canonical_sections", "schema_contract_verification", "final_action",
    ]
    with Path(args.out_csv).open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            flat = dict(row)
            for key in columns:
                if isinstance(flat.get(key), (list, dict)):
                    flat[key] = json.dumps(flat[key], ensure_ascii=False, separators=(",", ":"))
            writer.writerow({k: flat.get(k) for k in columns})

    implemented = payload["counts"]["current_canonical_in_current_inventory"]
    unresolved = payload["counts"]["classification_unresolved"]
    extra_lines = "\n".join(
        f"- `{x['aliases'][0]}` → `{x['operation_key']}`"
        for x in extras
    )
    summary = f"""# Ozon full API master checklist — generated inventory\n\nDate: 2026-08-29  \nRoadmap step: 2\n\n## Result\n\n- Seller operation rows: **{len(seller)}**\n- Performance operation rows: **{len(perf)}**\n- Total current API rows: **{len(rows)}**\n- Performance unique paths: **{len({r['fixed_path'] for r in perf})}**\n- Current canonical registry aliases total: **{registry_alias_count}**\n- Current API rows already present in the canonical registry: **{implemented}**\n- Preserved current-registry compatibility routes outside the current API inventory: **{len(extras)}**\n- Rows still requiring semantic/exact-schema classification: **{unresolved}**\n\nThe current operation universe is complete at method+path level: 463 Seller + 48 Performance = 511 current API rows. It was reconstructed from pinned audited GitHub indexes whose blob identities are verified by the generator.\n\n## Preserved compatibility routes outside the current 48-operation Performance inventory\n\n{extra_lines}\n\nThese three routes remain part of the accepted compatibility registry, but they are not counted as additional current Performance Swagger operations. They are tracked separately so the 42-alias canonical registry reconciles cleanly as 39 current-inventory matches + 3 compatibility routes.\n\n## Critical provenance rule\n\nThe project-accepted exact Swagger identities remain:\n\n- Seller: 3,933,043 bytes; SHA-256 `{SELLER_EXACT['sha256']}`; 463 operations.\n- Performance: 304,771 bytes; SHA-256 `{PERFORMANCE_EXACT['sha256']}`; 47 paths / 48 operations.\n\nThe bundled OpenAPI JSON files in the pinned public mirror are **not byte-identical** to those accepted snapshots. Therefore the pinned indexes are used only for the complete `method + path + purpose` universe. Exact schema, request, response, deprecation, workflow and safety decisions must be reconciled against the accepted exact Swagger evidence/snapshot before implementation or final terminal classification.\n\nNo Ozon business API request is made by this generator.\n"""
    Path(args.out_summary).write_text(summary, encoding="utf-8")

    print(json.dumps(payload["counts"], ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
