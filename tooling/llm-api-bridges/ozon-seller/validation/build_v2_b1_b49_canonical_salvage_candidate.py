#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
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


def merge_file(ours: Path, base: Path, theirs: Path) -> None:
    subprocess.run(
        ["git", "merge-file", "--ours", str(ours), str(base), str(theirs)],
        check=True,
    )


def dedupe_exact_top_level_const_overlaps(path: Path) -> list[str]:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    by_name: dict[str, list[tuple[int, str]]] = {}
    pattern = re.compile(r"^  const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=.*;\s*$")
    for i, line in enumerate(lines):
        m = pattern.match(line.rstrip("\r\n"))
        if m:
            by_name.setdefault(m.group(1), []).append((i, line))

    remove_indexes: set[int] = set()
    deduped: list[str] = []
    for name, matches in sorted(by_name.items()):
        if len(matches) == 1:
            continue
        stripped = {line.strip() for _, line in matches}
        if len(matches) != 2 or len(stripped) != 1:
            rendered = " | ".join(line.strip() for _, line in matches)
            raise AssertionError(f"non-identical or non-pair top-level const overlap {name}: {rendered}")
        remove_indexes.add(matches[1][0])
        deduped.append(name)

    if remove_indexes:
        lines = [line for i, line in enumerate(lines) if i not in remove_indexes]
        path.write_text("".join(lines), encoding="utf-8")
    for name in deduped:
        print(f"V2_B1_B49_EXACT_TOP_LEVEL_CONST_OVERLAP_DEDUP_PASS {name}")
    return deduped


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
    # Remove only exact duplicate pairs at the IIFE top level; any non-identical collision remains fail-closed.
    deduped: list[str] = []
    for rel in MERGED_FILES:
        deduped.extend(dedupe_exact_top_level_const_overlaps(out / rel))
    if "DELIVERY_METHOD_SORT_DIR" not in deduped or "DELIVERY_METHOD_STATUSES" not in deduped:
        raise AssertionError(f"expected proven warehouse/logistics const overlaps not found: {deduped}")

    reclassify_rating_registry(out / "shared/ozon_operation_registry.js")

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
