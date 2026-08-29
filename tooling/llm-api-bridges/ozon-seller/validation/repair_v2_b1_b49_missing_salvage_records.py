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


def restore_historical_operations(candidate_path: Path, canonical_path: Path, historical_path: Path) -> list[str]:
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
    return missing


def _binding_lines(text: str) -> dict[str, list[str]]:
    decl = builder._top_level_const(text, "IMPLEMENTATION_BINDINGS")
    pattern = re.compile(
        r"(?m)^(\s{4}([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*\{\s*normalizeParams:\s*[A-Za-z_$][A-Za-z0-9_$]*,\s*sanitizeResult:\s*[A-Za-z_$][A-Za-z0-9_$]*,\s*contract_state:\s*['\"][^'\"]+['\"]\s*\},?\r?\n)"
    )
    out: dict[str, list[str]] = {}
    for match in pattern.finditer(text, decl.start, decl.end):
        out.setdefault(match.group(2), []).append(match.group(1))
    return out


def _insert_before_first_function(text: str, payload: str) -> str:
    match = re.search(r"(?m)^  function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(", text)
    if not match:
        raise AssertionError("no top-level factory function anchor found")
    return text[:match.start()] + payload + text[match.start():]


def _insert_before_function(text: str, function_name: str, payload: str) -> str:
    match = re.search(rf"(?m)^  function\s+{re.escape(function_name)}\s*\(", text)
    if not match:
        raise AssertionError(f"contract function anchor not found: {function_name}")
    return text[:match.start()] + payload + text[match.start():]


def restore_historical_contract_support(
    candidate_path: Path,
    canonical_path: Path,
    historical_path: Path,
    restored_operation_aliases: list[str],
) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    canonical_text = canonical_path.read_text(encoding="utf-8")
    historical_text = historical_path.read_text(encoding="utf-8")

    historical_consts = builder.scan_top_level_const_declarations(historical_text)
    candidate_const_names = {decl.name for decl in builder.scan_top_level_const_declarations(candidate_text)}
    protected_structural_consts = {"IMPLEMENTATION_BINDINGS", "OPERATION_METADATA", "OPERATIONS", "OzonContract"}
    missing_consts = [decl for decl in historical_consts if decl.name not in candidate_const_names and decl.name not in protected_structural_consts]
    if missing_consts:
        payload = "".join(decl.text + "\n" for decl in missing_consts) + "\n"
        candidate_text = _insert_before_first_function(candidate_text, payload)
    final_const_names = {decl.name for decl in builder.scan_top_level_const_declarations(candidate_text)}
    unresolved_consts = [decl.name for decl in missing_consts if decl.name not in final_const_names]
    if unresolved_consts:
        raise AssertionError(f"historical contract consts still missing: {unresolved_consts}")
    print(f"V2_B1_B49_MISSING_HISTORICAL_CONTRACT_CONSTS_RESTORED_PASS {len(missing_consts)}")

    historical_funcs = builder.scan_function_declarations(historical_text)
    candidate_func_names = {decl.name for decl in builder.scan_function_declarations(candidate_text)}
    missing_funcs = [decl for decl in historical_funcs if decl.name not in candidate_func_names]
    if missing_funcs:
        payload = "\n".join(decl.core_text for decl in missing_funcs) + "\n\n"
        candidate_text = _insert_before_function(candidate_text, "validateOperationMeta", payload)
    final_func_names = {decl.name for decl in builder.scan_function_declarations(candidate_text)}
    unresolved_funcs = [decl.name for decl in missing_funcs if decl.name not in final_func_names]
    if unresolved_funcs:
        raise AssertionError(f"historical contract functions still missing: {unresolved_funcs}")
    print(f"V2_B1_B49_MISSING_HISTORICAL_CONTRACT_FUNCTIONS_RESTORED_PASS {len(missing_funcs)}")

    canonical_bindings = _binding_lines(canonical_text)
    historical_bindings = _binding_lines(historical_text)
    candidate_bindings = _binding_lines(candidate_text)
    if len(canonical_bindings) != EXPECTED_CANONICAL_ALIAS_COUNT:
        raise AssertionError(f"canonical IMPLEMENTATION_BINDINGS count changed: {len(canonical_bindings)}")
    if len(historical_bindings) != EXPECTED_HISTORICAL_ALIAS_COUNT:
        raise AssertionError(f"historical IMPLEMENTATION_BINDINGS count changed: {len(historical_bindings)}")

    canonical_binding_gaps = sorted(alias for alias in canonical_bindings if not candidate_bindings.get(alias))
    if canonical_binding_gaps:
        raise AssertionError(f"canonical contract bindings missing after merge: {canonical_binding_gaps}")

    missing_bindings = [alias for alias in historical_bindings if not candidate_bindings.get(alias)]
    unexpected_missing_bindings = sorted(set(missing_bindings) - set(restored_operation_aliases))
    missing_operation_bindings = sorted(set(restored_operation_aliases) - set(missing_bindings))
    if unexpected_missing_bindings or missing_operation_bindings:
        raise AssertionError(
            "historical contract binding gap differs from proven restored operation gap: "
            f"extra={unexpected_missing_bindings} absent_from_binding_gap={missing_operation_bindings}"
        )
    for alias in missing_bindings:
        if len(historical_bindings[alias]) != 1:
            raise AssertionError(f"historical binding count {alias}: {len(historical_bindings[alias])}")

    if missing_bindings:
        payload = "".join(historical_bindings[alias][0] for alias in missing_bindings)
        candidate_text = _insert_after_const_open(candidate_text, "IMPLEMENTATION_BINDINGS", payload)
    candidate_path.write_text(candidate_text, encoding="utf-8")

    final_bindings = _binding_lines(candidate_text)
    for alias in missing_bindings:
        lines = final_bindings.get(alias, [])
        if len(lines) != 1 or lines[0] != historical_bindings[alias][0]:
            raise AssertionError(f"restored contract binding is not single byte-exact historical B49 record: {alias}")
    for alias in historical_bindings:
        if not final_bindings.get(alias):
            raise AssertionError(f"historical contract binding still missing: {alias}")
    print(f"V2_B1_B49_PROVEN_MISSING_HISTORICAL_CONTRACT_BINDINGS_RESTORED_PASS {len(missing_bindings)}")


def _snapshot_operations_span(text: str) -> tuple[int, int, int]:
    match = re.search(r"(?m)^\s{4}operations:\s*\{\s*$", text)
    if not match:
        raise AssertionError("BUNDLED_SNAPSHOT operations object not found")
    open_brace = text.find("{", match.start(), match.end())
    if open_brace < 0:
        raise AssertionError("BUNDLED_SNAPSHOT operations opening brace not found")
    end = builder._scan_balanced_end(text, open_brace, "BUNDLED_SNAPSHOT.operations")
    return match.start(), open_brace, end


def _entitlement_rule_lines(text: str) -> dict[str, list[str]]:
    _, open_brace, end = _snapshot_operations_span(text)
    segment = text[open_brace + 1:end - 1]
    pattern = re.compile(r'(?m)^(\s{6}("(?:[^"\\]|\\.)+"):\s*\{[^\r\n]*\},?\r?\n)')
    out: dict[str, list[str]] = {}
    for match in pattern.finditer(segment):
        key = json.loads(match.group(2))
        out.setdefault(key, []).append(match.group(1))
    return out


def restore_proven_entitlement_gap(candidate_path: Path, historical_path: Path) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    historical_text = historical_path.read_text(encoding="utf-8")
    historical = _entitlement_rule_lines(historical_text)
    candidate = _entitlement_rule_lines(candidate_text)

    absent_expected = {key for key in EXPECTED_ENTITLEMENT_GAP if len(candidate.get(key, [])) == 0}
    if absent_expected != EXPECTED_ENTITLEMENT_GAP:
        counts = {key: len(candidate.get(key, [])) for key in sorted(EXPECTED_ENTITLEMENT_GAP)}
        raise AssertionError(
            "proven entitlement gap changed before restoration: "
            f"expected_absent={sorted(EXPECTED_ENTITLEMENT_GAP)} actual_absent={sorted(absent_expected)} counts={counts}"
        )
    for key in EXPECTED_ENTITLEMENT_GAP:
        if len(historical.get(key, [])) != 1:
            raise AssertionError(f"accepted B49 entitlement rule count {key}: {len(historical.get(key, []))}")

    _, open_brace, _ = _snapshot_operations_span(candidate_text)
    insert_at = open_brace + 1
    if candidate_text[insert_at:insert_at + 2] == "\r\n":
        insert_at += 2
    elif candidate_text[insert_at:insert_at + 1] == "\n":
        insert_at += 1
    payload = "".join(historical[key][0] for key in sorted(EXPECTED_ENTITLEMENT_GAP))
    candidate_text = candidate_text[:insert_at] + payload + candidate_text[insert_at:]
    candidate_path.write_text(candidate_text, encoding="utf-8")

    final = _entitlement_rule_lines(candidate_text)
    for key in EXPECTED_ENTITLEMENT_GAP:
        lines = final.get(key, [])
        if len(lines) != 1 or lines[0] != historical[key][0]:
            raise AssertionError(f"restored entitlement rule is not single byte-exact historical B49 record: {key}")
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
    contract_rel = Path("shared/ozon_contract.js")
    entitlement_rel = Path("shared/ozon_entitlements.js")
    for root in (candidate, canonical, historical):
        for rel in (registry_rel, contract_rel, entitlement_rel):
            if not (root / rel).is_file():
                raise SystemExit(f"invalid production root/file: {root / rel}")

    restored_aliases = restore_historical_operations(candidate / registry_rel, canonical / registry_rel, historical / registry_rel)
    restore_historical_contract_support(candidate / contract_rel, canonical / contract_rel, historical / contract_rel, restored_aliases)
    restore_proven_entitlement_gap(candidate / entitlement_rel, historical / entitlement_rel)

    builder.node_check(candidate / registry_rel)
    builder.node_check(candidate / contract_rel)
    builder.node_check(candidate / entitlement_rel)
    print("V2_B1_B49_MISSING_SALVAGE_RECORD_REPAIR_PASS")


if __name__ == "__main__":
    main()
