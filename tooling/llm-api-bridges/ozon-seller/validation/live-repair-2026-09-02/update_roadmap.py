#!/usr/bin/env python3
"""Update the persistent Ozon live-repair roadmap after a completed step."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


HERE = Path(__file__).resolve().parent
OZON_ROOT = HERE.parents[1]
ROADMAP = OZON_ROOT / "OZON_CURRENT_SWAGGER_CLUSTER_AD_LIVE_REPAIR_ROADMAP_2026-09-02.md"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--step", type=int, required=True, choices=range(1, 8))
    parser.add_argument("--status", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--detail", action="append", default=[])
    parser.add_argument("--marker", default="")
    args = parser.parse_args()

    text = ROADMAP.read_text(encoding="utf-8")
    row = re.compile(rf"^(\|\s*{args.step}\s*\|[^\n|]*\|)\s*[^\n|]*\s*(\|[^\n]*\|)$", re.MULTILINE)
    matches = list(row.finditer(text))
    if len(matches) != 1:
        raise SystemExit(f"step {args.step}: expected exactly one roadmap row, found {len(matches)}")
    text = row.sub(lambda match: f"{match.group(1)} {args.status} {match.group(2)}", text, count=1)

    marker = args.marker.strip() or f"ROADMAP-STEP-{args.step}-{re.sub(r'[^A-Z0-9]+', '-', args.status.upper()).strip('-')}"
    marker_text = f"<!-- {marker} -->"
    if marker_text not in text:
        details = "\n".join(f"- {item}" for item in args.detail) or "- No additional detail."
        text += (
            f"\n\n{marker_text}\n"
            f"### 2026-09-02 — Step {args.step}: {args.title}\n\n"
            f"Status: **{args.status}**\n\n"
            f"{details}\n"
        )

    ROADMAP.write_text(text, encoding="utf-8", newline="\n")
    print(f"OZON_ROADMAP_STEP_{args.step}_{args.status.upper().replace(' ', '_')}_RECORDED")


if __name__ == "__main__":
    main()
