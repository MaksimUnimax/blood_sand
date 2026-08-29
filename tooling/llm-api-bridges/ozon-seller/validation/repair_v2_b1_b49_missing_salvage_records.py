#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import build_v2_b1_b49_canonical_salvage_candidate as builder

EXPECTED_HISTORICAL_ALIAS_COUNT = 201
EXPECTED_CANONICAL_ALIAS_COUNT = 42
EXPECTED_MISSING_HISTORICAL_ONLY_OPERATIONS = 43
EXPECTED_ENTITLEMENT_GAP = {
    "POST /v1/posting/fbp/list",
    "POST /v1/posting/fbp/get",
}
RATING_ALIASES = {
    "seller_rating_summary",
    "seller_rating_history",
    "seller_fbs_error_index",
    "seller_fbs_error_postings",
}


def _operation_map(text: str) -> tuple[list[builder.PropertyBlock], dict[str, builder.PropertyBlock]]:
    blocks = builder._property_blocks_in_const(text, "OPERATIONS")
    by_alias = {block.key: block for block in blocks}
    if len(by_alias) != len(blocks):
        raise AssertionError("duplicate operation aliases while computing salvage gap")
    return blocks, by_alias


def _insert_after_const_open(text: str, const_name: str, payload: str) -> str:
    decl = builder._top_level_const(text, const_name)
    open_brace = text.find("{", decl.start, decl.end)
    if open_brace < 0:
        raise AssertionError(f"opening object brace not found for {const_name}")
    insert_at = open_brace + 1
    if text[insert_at:insert_at + 2] == "\r\n":
        insert_at += 2
    elif text[insert_at:insert_at + 1] == "\n":
        insert_at += 1
    return text[:insert_at] + payload + text[insert_at:]


def restore_historical_operations(candidate_path: Path, canonical_path: Path, historical_path: Path) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    canonical_text = canonical_path.read_text(encoding="utf-8")
    historical_text = historical_path.read_text(encoding="utf-8")

    historical_blocks, historical = _operation_map(historical_text)
    _, canonical = _operation_map(canonical_text)
    _, candidate = _operation_map(candidate_text)

    if len(historical) != EXPECTED_HISTORICAL_ALIAS_COUNT:
        raise AssertionError(f"historical B49 alias count changed: {len(historical)}")
    if len(canonical) != EXPECTED_CANONICAL_ALIAS_COUNT:
        raise AssertionError(f"corrected canonical B1 alias count changed: {len(canonical)}")

    missing = [block.key for block in historical_blocks if block.key not in candidate]
    if len(missing) != EXPECTED_MISSING_HISTORICAL_ONLY_OPERATIONS:
        raise AssertionError(
            "historical-only operation gap changed: "
            f"expected={EXPECTED_MISSING_HISTORICAL_ONLY_OPERATIONS} actual={len(missing)} aliases={missing}"
        )
    if set(missing) & set(canonical):
        raise AssertionError(f"canonical aliases unexpectedly missing from candidate: {sorted(set(missing) & set(canonical))}")
    if set(missing) & RATING_ALIASES:
        raise AssertionError(f"rating aliases unexpectedly in late salvage gap: {sorted(set(missing) & RATING_ALIASES)}")

    non_seller = []
    for alias in missing:
        core = historical[alias].core_text
        if not re.search(r"provider:\s*['\"]seller_api['\"]", core):
            non_seller.append(alias)
    if non_seller:
        raise AssertionError(f"late historical operation gap contains non-Seller aliases: {non_seller}")

    payload = "".join(historical[alias].full_text for alias in missing)
    candidate_text = _insert_after_const_open(candidate_text, "OPERATIONS", payload)
    candidate_path.write_text(candidate_text, encoding="utf-8")

    final_blocks, final = _operation_map(candidate_text)
    if len(final_blocks) != len(final):
        raise AssertionError("duplicate operation aliases after historical gap restoration")
    still_missing = [alias for alias in historical if alias not in final]
    if still_missing:
        raise AssertionError(f"historical aliases still missing after restoration: {still_missing}")
    for alias in missing:
        if final[alias].core_text != historical[alias].core_text:
            raise AssertionError(f"restored operation block is not byte-exact historical B49: {alias}")

    print(f"V2_B1_B49_PROVEN_MISSING_HISTORICAL_SELLER_OPERATION_BLOCKS_RESTORED_PASS {len(missing)}")
    print(f"V2_B1_B49_POST_RESTORE_REGISTRY_ALIAS_COUNT_PASS {len(final)}")


def _snapshot_operations_span(text: str) -> tuple[int, int, int]:
    match = re.search(r"(?m)^\s{4}operations:\s*\{\s*$", text)
    if not match:
        raise AssertionError("BUNDLED_SNAPSHOT operations object not found")
    open_brace = text.find("{", match.start(), match.end())
    if open_brace < 0:
        raise AssertionError("BUNDLED_SNAPSHOT operations opening brace not found")
    end = builder._scan_balanced_end(text, open_brace, "BUNDLED_SNAPSHOT.operations")
    return match.start(), open_brace, end


def _entitlement_rule_lines(text: str) -> dict[str, str]:
    _, open_brace, end = _snapshot_operations_span(text)
    segment = text[open_brace + 1:end - 1]
    pattern = re.compile(r'(?m)^(\s{6}("(?:[^"\\]|\\.)+"):\s*\{[^\r\n]*\},?\r?\n)')
    out: dict[str, str] = {}
    for match in pattern.finditer(segment):
        key = json.loads(match.group(2))
        if key in out:
            raise AssertionError(f"duplicate entitlement operation rule: {key}")
        out[key] = match.group(1)
    return out


def restore_proven_entitlement_gap(candidate_path: Path, historical_path: Path) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    historical_text = historical_path.read_text(encoding="utf-8")
    historical = _entitlement_rule_lines(historical_text)
    candidate = _entitlement_rule_lines(candidate_text)

    absent_expected = {key for key in EXPECTED_ENTITLEMENT_GAP if key not in candidate}
    if absent_expected != EXPECTED_ENTITLEMENT_GAP:
        raise AssertionError(
            "proven entitlement gap changed before restoration: "
            f"expected_absent={sorted(EXPECTED_ENTITLEMENT_GAP)} actual_absent={sorted(absent_expected)}"
        )
    missing_from_historical = EXPECTED_ENTITLEMENT_GAP - set(historical)
    if missing_from_historical:
        raise AssertionError(f"accepted B49 lacks expected entitlement rules: {sorted(missing_from_historical)}")

    _, open_brace, _ = _snapshot_operations_span(candidate_text)
    insert_at = open_brace + 1
    if candidate_text[insert_at:insert_at + 2] == "\r\n":
        insert_at += 2
    elif candidate_text[insert_at:insert_at + 1] == "\n":
        insert_at += 1
    payload = "".join(historical[key] for key in sorted(EXPECTED_ENTITLEMENT_GAP))
    candidate_text = candidate_text[:insert_at] + payload + candidate_text[insert_at:]
    candidate_path.write_text(candidate_text, encoding="utf-8")

    final = _entitlement_rule_lines(candidate_text)
    for key in EXPECTED_ENTITLEMENT_GAP:
        if final.get(key) != historical[key]:
            raise AssertionError(f"restored entitlement rule is not byte-exact historical B49: {key}")
    print(f"V2_B1_B49_PROVEN_ENTITLEMENT_RULE_GAP_RESTORED_PASS {len(EXPECTED_ENTITLEMENT_GAP)}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidate", required=True)
    ap.add_argument("--canonical-b1", required=True)
    ap.add_argument("--historical-b49", required=True)
    args = ap.parse_args()

    candidate = Path(args.candidate).resolve()
    canonical = Path(args.canonical_b1).resolve()
    historical = Path(args.historical_b49).resolve()

    registry_rel = Path("shared/ozon_operation_registry.js")
    entitlement_rel = Path("shared/ozon_entitlements.js")
    for root in (candidate, canonical, historical):
        if not (root / registry_rel).is_file() or not (root / entitlement_rel).is_file():
            raise SystemExit(f"invalid production root: {root}")

    restore_historical_operations(candidate / registry_rel, canonical / registry_rel, historical / registry_rel)
    restore_proven_entitlement_gap(candidate / entitlement_rel, historical / entitlement_rel)

    builder.node_check(candidate / registry_rel)
    builder.node_check(candidate / entitlement_rel)
    print("V2_B1_B49_MISSING_SALVAGE_RECORD_REPAIR_PASS")


if __name__ == "__main__":
    main()
