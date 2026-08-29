#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import build_v2_b1_b49_canonical_salvage_candidate as builder

EXPECTED_REMAINING_HISTORICAL_ENTITLEMENT_GAP = 43


def entitlement_rules(text: str) -> dict[str, list[str]]:
    match = re.search(r"(?m)^\s{4}operations:\s*\{\s*$", text)
    if not match:
        raise AssertionError("BUNDLED_SNAPSHOT operations object not found")
    open_brace = text.find("{", match.start(), match.end())
    if open_brace < 0:
        raise AssertionError("BUNDLED_SNAPSHOT operations opening brace not found")
    end = builder._scan_balanced_end(text, open_brace, "BUNDLED_SNAPSHOT.operations")
    segment = text[open_brace + 1:end - 1]
    pattern = re.compile(r'(?m)^(\s{6}("(?:[^"\\]|\\.)+"):\s*\{[^\r\n]*\},?\r?\n)')
    out: dict[str, list[str]] = {}
    for item in pattern.finditer(segment):
        key = json.loads(item.group(2))
        out.setdefault(key, []).append(item.group(1))
    return out


def operation_entitlement_map(registry_text: str) -> dict[str, list[tuple[str, str]]]:
    out: dict[str, list[tuple[str, str]]] = {}
    for block in builder._property_blocks_in_const(registry_text, "OPERATIONS"):
        provider = re.search(r"provider:\s*['\"]([^'\"]+)['\"]", block.core_text)
        entitlement = re.search(r"entitlement_key:\s*['\"]([^'\"]+)['\"]", block.core_text)
        if not provider or not entitlement:
            raise AssertionError(f"operation metadata lacks provider/entitlement_key: {block.key}")
        out.setdefault(entitlement.group(1), []).append((block.key, provider.group(1)))
    return out


def insert_rules(text: str, payload: str) -> str:
    match = re.search(r"(?m)^\s{4}operations:\s*\{\s*$", text)
    if not match:
        raise AssertionError("BUNDLED_SNAPSHOT operations object not found")
    open_brace = text.find("{", match.start(), match.end())
    insert_at = open_brace + 1
    if text[insert_at:insert_at + 2] == "\r\n":
        insert_at += 2
    elif text[insert_at:insert_at + 1] == "\n":
        insert_at += 1
    return text[:insert_at] + payload + text[insert_at:]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidate", required=True)
    ap.add_argument("--canonical-b1", required=True)
    ap.add_argument("--historical-b49", required=True)
    args = ap.parse_args()

    candidate = Path(args.candidate).resolve()
    canonical = Path(args.canonical_b1).resolve()
    historical = Path(args.historical_b49).resolve()
    ent_rel = Path("shared/ozon_entitlements.js")
    reg_rel = Path("shared/ozon_operation_registry.js")

    candidate_text = (candidate / ent_rel).read_text(encoding="utf-8")
    historical_text = (historical / ent_rel).read_text(encoding="utf-8")
    historical_rules = entitlement_rules(historical_text)
    candidate_rules = entitlement_rules(candidate_text)
    missing = [key for key in historical_rules if not candidate_rules.get(key)]

    if len(missing) != EXPECTED_REMAINING_HISTORICAL_ENTITLEMENT_GAP:
        raise AssertionError(
            "remaining historical entitlement gap changed: "
            f"expected={EXPECTED_REMAINING_HISTORICAL_ENTITLEMENT_GAP} actual={len(missing)} keys={missing}"
        )

    historical_ops = operation_entitlement_map((historical / reg_rel).read_text(encoding="utf-8"))
    canonical_ops = operation_entitlement_map((canonical / reg_rel).read_text(encoding="utf-8"))
    for key in missing:
        owners = historical_ops.get(key, [])
        if not owners:
            raise AssertionError(f"missing entitlement rule has no historical operation owner: {key}")
        if any(provider != "seller_api" for _, provider in owners):
            raise AssertionError(f"missing entitlement rule is not Seller-only: {key} owners={owners}")
        if key in canonical_ops:
            raise AssertionError(f"canonical B1 entitlement key unexpectedly missing from candidate: {key}")
        if len(historical_rules[key]) != 1:
            raise AssertionError(f"historical entitlement source count {key}: {len(historical_rules[key])}")

    payload = "".join(historical_rules[key][0] for key in missing)
    candidate_text = insert_rules(candidate_text, payload)
    (candidate / ent_rel).write_text(candidate_text, encoding="utf-8")

    final_rules = entitlement_rules(candidate_text)
    for key in missing:
        lines = final_rules.get(key, [])
        if len(lines) != 1 or lines[0] != historical_rules[key][0]:
            raise AssertionError(f"restored entitlement is not single byte-exact B49 rule: {key}")
    still_missing = [key for key in historical_rules if not final_rules.get(key)]
    if still_missing:
        raise AssertionError(f"historical entitlement rules still missing: {still_missing}")

    builder.node_check(candidate / ent_rel)
    print(f"V2_B1_B49_REMAINING_HISTORICAL_SELLER_ENTITLEMENTS_RESTORED_PASS {len(missing)}")
    print("V2_B1_B49_HISTORICAL_ENTITLEMENT_RULE_COVERAGE_PASS")


if __name__ == "__main__":
    main()
