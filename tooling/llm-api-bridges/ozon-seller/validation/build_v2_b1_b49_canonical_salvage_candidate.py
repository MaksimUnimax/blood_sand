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

CANONICAL_SECTION_OVERRIDES = {
    "warehouse_fbs_return_mile_check": (
        "/v1/warehouse/fbs/return-mile/check",
        "logistics_settings",
        "warehouse_diagnostics",
    ),
    "warehouse_fbs_return_mile_info": (
        "/v1/warehouse/fbs/return-mile/info",
        "logistics_settings",
        "warehouse_diagnostics",
    ),
    "warehouse_operation_status": (
        "/v1/warehouse/operation/status",
        "logistics_settings",
        "warehouse_diagnostics",
    ),
    "supplier_available_warehouses": (
        "/v1/supplier/available_warehouses",
        "warehouses",
        "ozon_warehouses",
    ),
}

SUPPLY_ORDER_GET_PATH = "/v3/supply-order/get"


@dataclass(frozen=True)
class ConstDecl:
    name: str
    start: int
    end: int
    text: str


def merge_file(ours: Path, base: Path, theirs: Path) -> None:
    subprocess.run(
        ["git", "merge-file", "--ours", str(ours), str(base), str(theirs)],
        check=True,
    )


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


def _balanced_object_end(text: str, open_brace: int, key: str) -> int:
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
    raise AssertionError(f"unterminated object block for {key}")


def _find_object_property_blocks(text: str, key: str) -> list[tuple[int, int]]:
    pattern = re.compile(rf"(?m)^\s*(?:['\"])?{re.escape(key)}(?:['\"])?\s*:\s*\{{\s*$")
    blocks: list[tuple[int, int]] = []
    for match in pattern.finditer(text):
        open_brace = text.find("{", match.start(), match.end())
        if open_brace < 0:
            raise AssertionError(f"missing opening brace for {key}")
        blocks.append((match.start(), _balanced_object_end(text, open_brace, key)))
    return blocks


def _enclosing_top_level_const(text: str, offset: int) -> str | None:
    matches = [decl.name for decl in scan_top_level_const_declarations(text) if decl.start <= offset < decl.end]
    if len(matches) > 1:
        raise AssertionError(f"offset {offset} is enclosed by multiple top-level const declarations: {matches}")
    return matches[0] if matches else None


def _find_operation_block(text: str, key: str, expected_path: str) -> tuple[int, int]:
    all_same_key = _find_object_property_blocks(text, key)
    candidates: list[tuple[int, int, str | None]] = []
    path_patterns = [f"path: '{expected_path}'", f'path: "{expected_path}"']
    provider_patterns = ["provider: 'seller_api'", 'provider: "seller_api"']
    for start, end in all_same_key:
        block = text[start:end]
        has_path = any(pattern in block for pattern in path_patterns)
        has_provider = any(pattern in block for pattern in provider_patterns)
        if has_path and has_provider:
            candidates.append((start, end, _enclosing_top_level_const(text, start)))

    authoritative = [(start, end) for start, end, parent in candidates if parent == "OPERATIONS"]
    if len(authoritative) == 1:
        return authoritative[0]
    if len(authoritative) > 1:
        raise AssertionError(f"multiple OPERATIONS blocks for {key} {expected_path}: {len(authoritative)}")
    if len(candidates) == 1:
        start, end, _ = candidates[0]
        return start, end

    parents = [parent for _, _, parent in candidates]
    raise AssertionError(
        f"expected exactly one authoritative seller operation block for {key} {expected_path}; "
        f"filtered={len(candidates)} same_key={len(all_same_key)} enclosing_consts={parents}"
    )


def rewrite_operation_section(path: Path, alias: str, expected_path: str, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    start, end = _find_operation_block(text, alias, expected_path)
    block = text[start:end]
    patterns = [f"section: '{old}'", f'section: "{old}"']
    count = sum(block.count(p) for p in patterns)
    if count != 1:
        raise AssertionError(f"{alias}: expected one section {old}, found {count}")
    block = block.replace(f"section: '{old}'", f"section: '{new}'")
    block = block.replace(f'section: "{old}"', f'section: "{new}"')
    path.write_text(text[:start] + block + text[end:], encoding="utf-8")
    print(f"V2_B1_B49_CANONICAL_SECTION_OVERRIDE_PASS {alias} {old}->{new}")


def rewrite_supply_order_get_template(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    start, end = _find_operation_block(text, "supply_order_get", SUPPLY_ORDER_GET_PATH)
    block = text[start:end]
    pattern = re.compile(r"order_ids\s*:\s*\[\s*(['\"])1\1\s*\]")
    matches = list(pattern.finditer(block))
    if len(matches) != 1:
        raise AssertionError(f"supply_order_get: expected one string order_ids template, found {len(matches)}")
    block = pattern.sub("order_ids: [1]", block, count=1)
    path.write_text(text[:start] + block + text[end:], encoding="utf-8")
    print("V2_B1_B49_CANONICAL_SUPPLY_ORDER_GET_NUMERIC_TEMPLATE_PASS")


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

    # Textual three-way merge can retain identical independent top-level const additions from both sides.
    # Parse complete const declaration blocks and remove only exact duplicate pairs; any differing collision is fatal.
    deduped: list[str] = []
    for rel in MERGED_FILES:
        deduped.extend(dedupe_exact_top_level_const_overlaps(out / rel))
    missing_known = sorted(KNOWN_EXACT_OVERLAPS - set(deduped))
    if missing_known:
        raise AssertionError(f"expected proven exact overlaps not found: {missing_known}; actual={sorted(deduped)}")

    registry = out / "shared/ozon_operation_registry.js"
    for alias, (expected_path, old, new) in CANONICAL_SECTION_OVERRIDES.items():
        rewrite_operation_section(registry, alias, expected_path, old, new)
    rewrite_supply_order_get_template(registry)
    reclassify_rating_registry(registry)

    # Hard boundary: only the three merge-authorized files may differ from canonical B1.
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
