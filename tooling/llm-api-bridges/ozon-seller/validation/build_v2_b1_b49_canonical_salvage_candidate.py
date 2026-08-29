#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

MERGED_FILES = [
    "shared/ozon_operation_registry.js",
    "shared/ozon_contract.js",
    "shared/ozon_entitlements.js",
]

RATING_ALIASES = [
    "seller_rating_summary",
    "seller_rating_history",
    "seller_fbs_error_index",
    "seller_fbs_error_postings",
]

KNOWN_EXACT_OVERLAPS = {
    "DELIVERY_METHOD_SORT_DIR",
    "DELIVERY_METHOD_STATUSES",
    "STOCK_ITEM_TAGS",
    "STOCK_PLACEMENT_ZONES",
    "STOCK_TURNOVER_GRADES",
    "OZON_WAREHOUSE_TYPES",
}

EXPECTED_CANONICAL_B1_ALIAS_COUNT = 42

CANONICAL_CONTRACT_FUNCTION_OVERRIDES = {
    "normalizeFboStockByWarehouseParams",
    "normalizeFbsStockByWarehouseParams",
    "normalizePostingFboListParams",
    "normalizeSellerWarehouseListParams",
    "normalizeStockAnalyticsParams",
    "normalizeSupplyOrderDetailsParams",
    "normalizeSupplyOrderGetParams",
}

HISTORICAL_SHARED_FUNCTION_OVERRIDES = {
    "shouldRedactResultField",
    "validateOperationMeta",
}

EXPECTED_COMMON_CONTRACT_FUNCTION_DIFFERENCES = (
    CANONICAL_CONTRACT_FUNCTION_OVERRIDES | HISTORICAL_SHARED_FUNCTION_OVERRIDES
)


@dataclass(frozen=True)
class ConstDecl:
    name: str
    start: int
    end: int
    text: str


@dataclass(frozen=True)
class PropertyBlock:
    key: str
    start: int
    core_end: int
    full_end: int
    core_text: str
    full_text: str


@dataclass(frozen=True)
class FunctionDecl:
    name: str
    start: int
    core_end: int
    full_end: int
    core_text: str


def merge_file(ours: Path, base: Path, theirs: Path) -> None:
    subprocess.run(
        ["git", "merge-file", "--ours", str(ours), str(base), str(theirs)],
        check=True,
    )


def _scan_balanced_end(text: str, open_brace: int, label: str) -> int:
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    i = open_brace
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""
        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue
        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue
        if quote is not None:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue
        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue
        if ch in ("'", '"', "`"):
            quote = ch
            i += 1
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise AssertionError(f"unterminated balanced block for {label}")


def _find_decl_end(text: str, expr_start: int) -> int:
    paren = bracket = brace = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    i = expr_start
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""

        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue
        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue
        if quote is not None:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            i += 1
            continue

        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue
        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue
        if ch in ("'", '"', "`"):
            quote = ch
            i += 1
            continue

        if ch == "(":
            paren += 1
        elif ch == ")":
            paren -= 1
        elif ch == "[":
            bracket += 1
        elif ch == "]":
            bracket -= 1
        elif ch == "{":
            brace += 1
        elif ch == "}":
            brace -= 1
        elif ch == ";" and paren == 0 and bracket == 0 and brace == 0:
            return i + 1

        if min(paren, bracket, brace) < 0:
            raise AssertionError(f"unbalanced top-level const expression near byte {i}")
        i += 1

    raise AssertionError("unterminated top-level const declaration")


def scan_top_level_const_declarations(text: str) -> list[ConstDecl]:
    pattern = re.compile(r"(?m)^  const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=")
    out: list[ConstDecl] = []
    for match in pattern.finditer(text):
        line_start = match.start()
        end = _find_decl_end(text, match.end())
        out.append(ConstDecl(match.group(1), line_start, end, text[line_start:end]))
    return out


def _top_level_const(text: str, name: str) -> ConstDecl:
    matches = [decl for decl in scan_top_level_const_declarations(text) if decl.name == name]
    if len(matches) != 1:
        raise AssertionError(f"expected exactly one top-level const {name}, found {len(matches)}")
    return matches[0]


def dedupe_exact_top_level_const_overlaps(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    by_name: dict[str, list[ConstDecl]] = {}
    for decl in scan_top_level_const_declarations(text):
        by_name.setdefault(decl.name, []).append(decl)

    removals: list[tuple[int, int]] = []
    deduped: list[str] = []
    for name, decls in sorted(by_name.items()):
        if len(decls) == 1:
            continue
        if len(decls) != 2:
            raise AssertionError(f"top-level const overlap {name} occurs {len(decls)} times, expected exactly 2")
        if decls[0].text != decls[1].text:
            raise AssertionError(
                "non-identical top-level const overlap " + name + ":\n--- first ---\n" + decls[0].text + "\n--- second ---\n" + decls[1].text
            )
        removals.append((decls[1].start, decls[1].end))
        deduped.append(name)

    for start, end in sorted(removals, reverse=True):
        if end < len(text) and text[end:end + 2] == "\r\n":
            end += 2
        elif end < len(text) and text[end] == "\n":
            end += 1
        text = text[:start] + text[end:]

    if removals:
        path.write_text(text, encoding="utf-8")
    for name in deduped:
        print(f"V2_B1_B49_EXACT_TOP_LEVEL_CONST_OVERLAP_DEDUP_PASS {name}")
    return deduped


def _extend_property_end(text: str, core_end: int) -> int:
    i = core_end
    while i < len(text) and text[i] in " \t":
        i += 1
    if i < len(text) and text[i] == ",":
        i += 1
    if text[i:i + 2] == "\r\n":
        i += 2
    elif i < len(text) and text[i] == "\n":
        i += 1
    return i


def _extend_function_end(text: str, core_end: int) -> int:
    i = core_end
    while i < len(text) and text[i] in " \t":
        i += 1
    if text[i:i + 2] == "\r\n":
        i += 2
    elif i < len(text) and text[i] == "\n":
        i += 1
    return i


def _property_blocks_in_const(text: str, const_name: str) -> list[PropertyBlock]:
    decl = _top_level_const(text, const_name)
    pattern = re.compile(r"(?m)^\s*(?:['\"])?([A-Za-z_$][A-Za-z0-9_$]*)(?:['\"])?\s*:\s*\{\s*$")
    out: list[PropertyBlock] = []
    for match in pattern.finditer(text, decl.start, decl.end):
        open_brace = text.find("{", match.start(), match.end())
        if open_brace < 0:
            continue
        core_end = _scan_balanced_end(text, open_brace, match.group(1))
        core_text = text[match.start():core_end]
        if "provider:" not in core_text or "path:" not in core_text or "effect:" not in core_text:
            continue
        full_end = _extend_property_end(text, core_end)
        out.append(
            PropertyBlock(
                key=match.group(1),
                start=match.start(),
                core_end=core_end,
                full_end=full_end,
                core_text=core_text,
                full_text=text[match.start():full_end],
            )
        )
    return out


def scan_function_declarations(text: str) -> list[FunctionDecl]:
    pattern = re.compile(r"(?m)^  function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(")
    out: list[FunctionDecl] = []
    for match in pattern.finditer(text):
        open_brace = text.find("{", match.end())
        if open_brace < 0:
            raise AssertionError(f"missing function body for {match.group(1)}")
        core_end = _scan_balanced_end(text, open_brace, match.group(1))
        full_end = _extend_function_end(text, core_end)
        out.append(
            FunctionDecl(
                name=match.group(1),
                start=match.start(),
                core_end=core_end,
                full_end=full_end,
                core_text=text[match.start():core_end],
            )
        )
    return out


def restore_canonical_operation_overlaps(candidate_path: Path, canonical_path: Path) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    canonical_text = canonical_path.read_text(encoding="utf-8")

    canonical_blocks = _property_blocks_in_const(canonical_text, "OPERATIONS")
    if len(canonical_blocks) != EXPECTED_CANONICAL_B1_ALIAS_COUNT:
        raise AssertionError(
            f"corrected canonical B1 OPERATIONS count {len(canonical_blocks)} != {EXPECTED_CANONICAL_B1_ALIAS_COUNT}"
        )
    canonical_by_alias = {block.key: block for block in canonical_blocks}
    if len(canonical_by_alias) != EXPECTED_CANONICAL_B1_ALIAS_COUNT:
        raise AssertionError("corrected canonical B1 contains duplicate operation aliases")

    candidate_blocks = _property_blocks_in_const(candidate_text, "OPERATIONS")
    candidate_by_alias: dict[str, list[PropertyBlock]] = {}
    for block in candidate_blocks:
        candidate_by_alias.setdefault(block.key, []).append(block)

    replacements: list[tuple[int, int, str]] = []
    overlap_counts: dict[str, int] = {}
    for alias, canonical_block in sorted(canonical_by_alias.items()):
        merged = candidate_by_alias.get(alias, [])
        if not merged:
            raise AssertionError(f"canonical B1 alias missing from merged OPERATIONS: {alias}")
        if len(merged) > 2:
            raise AssertionError(f"canonical B1 alias appears more than twice after merge: {alias} -> {len(merged)}")
        overlap_counts[alias] = len(merged)
        first = merged[0]
        replacements.append((first.start, first.core_end, canonical_block.core_text))
        for extra in merged[1:]:
            replacements.append((extra.start, extra.full_end, ""))

    for start, end, replacement in sorted(replacements, key=lambda item: item[0], reverse=True):
        candidate_text = candidate_text[:start] + replacement + candidate_text[end:]

    candidate_path.write_text(candidate_text, encoding="utf-8")
    duplicate_overlaps = sorted(alias for alias, count in overlap_counts.items() if count == 2)
    print(f"V2_B1_B49_CANONICAL_OPERATION_OVERLAY_COUNT_PASS {len(canonical_by_alias)}")
    print(f"V2_B1_B49_CANONICAL_DUPLICATE_OVERLAPS_COLLAPSED_PASS {len(duplicate_overlaps)}")


def restore_contract_function_overlaps(candidate_path: Path, canonical_path: Path, historical_path: Path) -> None:
    candidate_text = candidate_path.read_text(encoding="utf-8")
    canonical_text = canonical_path.read_text(encoding="utf-8")
    historical_text = historical_path.read_text(encoding="utf-8")

    canonical_funcs = {decl.name: decl for decl in scan_function_declarations(canonical_text)}
    historical_funcs = {decl.name: decl for decl in scan_function_declarations(historical_text)}
    common = set(canonical_funcs) & set(historical_funcs)
    differences = {name for name in common if canonical_funcs[name].core_text != historical_funcs[name].core_text}
    if differences != EXPECTED_COMMON_CONTRACT_FUNCTION_DIFFERENCES:
        raise AssertionError(
            "unexpected corrected-B1/B49 common contract function differences: "
            f"expected={sorted(EXPECTED_COMMON_CONTRACT_FUNCTION_DIFFERENCES)} actual={sorted(differences)}"
        )

    candidate_by_name: dict[str, list[FunctionDecl]] = {}
    for decl in scan_function_declarations(candidate_text):
        candidate_by_name.setdefault(decl.name, []).append(decl)

    replacements: list[tuple[int, int, str]] = []
    for name in sorted(EXPECTED_COMMON_CONTRACT_FUNCTION_DIFFERENCES):
        merged = candidate_by_name.get(name, [])
        if not merged:
            raise AssertionError(f"contract overlap function missing from candidate: {name}")
        if len(merged) > 2:
            raise AssertionError(f"contract overlap function occurs more than twice: {name} -> {len(merged)}")
        source = canonical_funcs[name] if name in CANONICAL_CONTRACT_FUNCTION_OVERRIDES else historical_funcs[name]
        first = merged[0]
        replacements.append((first.start, first.core_end, source.core_text))
        for extra in merged[1:]:
            replacements.append((extra.start, extra.full_end, ""))

    for start, end, replacement in sorted(replacements, key=lambda item: item[0], reverse=True):
        candidate_text = candidate_text[:start] + replacement + candidate_text[end:]

    candidate_path.write_text(candidate_text, encoding="utf-8")

    final_funcs: dict[str, list[FunctionDecl]] = {}
    for decl in scan_function_declarations(candidate_text):
        final_funcs.setdefault(decl.name, []).append(decl)
    for name in sorted(EXPECTED_COMMON_CONTRACT_FUNCTION_DIFFERENCES):
        decls = final_funcs.get(name, [])
        if len(decls) != 1:
            raise AssertionError(f"resolved contract function count {name} -> {len(decls)}")
        expected = canonical_funcs[name].core_text if name in CANONICAL_CONTRACT_FUNCTION_OVERRIDES else historical_funcs[name].core_text
        if decls[0].core_text != expected:
            raise AssertionError(f"resolved contract function source mismatch: {name}")

    print(f"V2_B1_B49_CANONICAL_CONTRACT_FUNCTION_OVERRIDES_PASS {len(CANONICAL_CONTRACT_FUNCTION_OVERRIDES)}")
    print(f"V2_B1_B49_HISTORICAL_SHARED_SAFETY_FUNCTIONS_PRESERVED_PASS {len(HISTORICAL_SHARED_FUNCTION_OVERRIDES)}")


def remove_legacy_cluster_block(text: str, key: str) -> str:
    lines = text.splitlines(keepends=True)
    starts = [i for i, line in enumerate(lines) if re.match(rf"^\s*{re.escape(key)}\s*:\s*\{{\s*$", line.rstrip("\r\n"))]
    if len(starts) != 1:
        raise AssertionError(f"expected exactly one legacy {key} cluster definition, found {len(starts)}")
    start = starts[0]
    depth = 0
    end = None
    for i in range(start, len(lines)):
        depth += lines[i].count("{") - lines[i].count("}")
        if depth == 0:
            end = i
            break
    if end is None:
        raise AssertionError(f"unterminated legacy {key} cluster definition")
    if not re.match(r"^\s*}\s*,?\s*$", lines[end].rstrip("\r\n")):
        raise AssertionError(f"unexpected legacy {key} cluster terminator: {lines[end].rstrip()}")
    del lines[start:end + 1]
    return "".join(lines)


def reclassify_rating_registry(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    before = text
    cluster_count = text.count("cluster: 'seller_health'") + text.count('cluster: "seller_health"')
    if cluster_count != 4:
        raise AssertionError(f"expected exactly 4 seller_health registry entries, found {cluster_count}")
    text = text.replace("cluster: 'seller_health'", "cluster: 'sales_analytics'")
    text = text.replace('cluster: "seller_health"', 'cluster: "sales_analytics"')

    ratings_count = text.count("section: 'ratings'") + text.count('section: "ratings"')
    fbs_count = text.count("section: 'fbs_error_index'") + text.count('section: "fbs_error_index"')
    if ratings_count != 2 or fbs_count != 2:
        raise AssertionError(f"unexpected B10 section counts: ratings={ratings_count}, fbs_error_index={fbs_count}")
    text = text.replace("section: 'ratings'", "section: 'delivery_returns_cancellations_metrics'")
    text = text.replace('section: "ratings"', 'section: "delivery_returns_cancellations_metrics"')
    text = text.replace("section: 'fbs_error_index'", "section: 'delivery_returns_cancellations_metrics'")
    text = text.replace('section: "fbs_error_index"', 'section: "delivery_returns_cancellations_metrics"')

    text = remove_legacy_cluster_block(text, "seller_health")

    residual = [(i, line.rstrip()) for i, line in enumerate(text.splitlines(), 1) if "seller_health" in line]
    if residual:
        details = "\n".join(f"line {i}: {line}" for i, line in residual)
        raise AssertionError(f"unauthorized seller_health taxonomy remains after reclassification:\n{details}")
    for alias in RATING_ALIASES:
        if alias not in text:
            raise AssertionError(f"rating alias missing after merge: {alias}")
    if text == before:
        raise AssertionError("rating registry reclassification made no change")
    path.write_text(text, encoding="utf-8")


def node_check(path: Path) -> None:
    result = subprocess.run(
        ["node", "--check", str(path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0:
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="")
        raise AssertionError(f"node --check failed for {path}")
    print(f"V2_B1_B49_NODE_CHECK_PASS {path.name}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--b0", required=True)
    ap.add_argument("--canonical-b1", required=True)
    ap.add_argument("--historical-b49", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    b0 = Path(args.b0).resolve()
    canonical = Path(args.canonical_b1).resolve()
    historical = Path(args.historical_b49).resolve()
    out = Path(args.out).resolve()

    for root in (b0, canonical, historical):
        if not (root / "shared/ozon_operation_registry.js").is_file():
            raise SystemExit(f"invalid production root: {root}")

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(canonical, out)

    for rel in MERGED_FILES:
        merge_file(out / rel, b0 / rel, historical / rel)

    deduped: list[str] = []
    for rel in MERGED_FILES:
        deduped.extend(dedupe_exact_top_level_const_overlaps(out / rel))
    missing_known = sorted(KNOWN_EXACT_OVERLAPS - set(deduped))
    if missing_known:
        raise AssertionError(f"expected proven exact overlaps not found: {missing_known}; actual={sorted(deduped)}")

    registry = out / "shared/ozon_operation_registry.js"
    restore_canonical_operation_overlaps(registry, canonical / "shared/ozon_operation_registry.js")
    reclassify_rating_registry(registry)

    contract = out / "shared/ozon_contract.js"
    restore_contract_function_overlaps(
        contract,
        canonical / "shared/ozon_contract.js",
        historical / "shared/ozon_contract.js",
    )

    node_check(registry)
    node_check(contract)
    node_check(out / "shared/ozon_entitlements.js")

    canonical_files = sorted(p.relative_to(canonical) for p in canonical.rglob("*") if p.is_file())
    out_files = sorted(p.relative_to(out) for p in out.rglob("*") if p.is_file())
    if canonical_files != out_files:
        raise AssertionError("candidate file set differs from accepted canonical B1")
    changed = []
    for rel in canonical_files:
        if (canonical / rel).read_bytes() != (out / rel).read_bytes():
            changed.append(rel.as_posix())
    if changed != sorted(MERGED_FILES):
        raise AssertionError(f"unexpected candidate production delta: {changed}")

    print("V2_B1_B49_LEGACY_SELLER_HEALTH_CLUSTER_REMOVED_PASS")
    print("V2_B1_B49_SALVAGE_THREE_FILE_BOUNDARY_PASS")
    print(out)


if __name__ == "__main__":
    main()
