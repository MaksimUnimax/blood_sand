#!/usr/bin/env python3
from __future__ import annotations

import argparse
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
    if changed != MERGED_FILES:
        raise AssertionError(f"unexpected candidate production delta: {changed}")

    print("V2_B1_B49_SALVAGE_THREE_FILE_BOUNDARY_PASS")
    print(out)


if __name__ == "__main__":
    main()
