#!/usr/bin/env python3
"""Negative tamper tests for the Step 7 exact Seller Swagger authority carrier."""

from __future__ import annotations

import argparse
import json
import shutil
import tempfile
from pathlib import Path
from typing import Callable

from reconstruct_exact_swagger import VerificationError, verify

Mutation = Callable[[Path], None]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def first_fragment(root: Path) -> Path:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    return root / manifest["transport"]["fragments"]["entries"][0]["name"]


def last_fragment(root: Path) -> Path:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    return root / manifest["transport"]["fragments"]["entries"][-1]["name"]


def mutate_fragment(root: Path) -> None:
    path = first_fragment(root)
    data = bytearray(path.read_bytes())
    require(bool(data), "first fragment unexpectedly empty")
    data[0] = ord("A") if data[0] != ord("A") else ord("B")
    path.write_bytes(bytes(data))


def remove_fragment(root: Path) -> None:
    last_fragment(root).unlink()


def add_fragment(root: Path) -> None:
    (root / "fragments" / "unexpected-extra.txt").write_text("unexpected", encoding="utf-8")


def rename_fragment(root: Path) -> None:
    path = first_fragment(root)
    path.rename(path.with_name(path.name + ".renamed.txt"))


def mix_fragment(root: Path) -> None:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    entries = manifest["transport"]["fragments"]["entries"]
    first = root / entries[0]["name"]
    second = root / entries[1]["name"]
    first.write_bytes(second.read_bytes())


def corrupt_manifest_hash(root: Path) -> None:
    path = root / "manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    manifest["transport"]["fragments"]["entries"][0]["sha256"] = "0" * 64
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def reorder_manifest_entries(root: Path) -> None:
    path = root / "manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    entries = manifest["transport"]["fragments"]["entries"]
    entries[0], entries[1] = entries[1], entries[0]
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def expect_rejected(source: Path, label: str, mutation: Mutation) -> None:
    with tempfile.TemporaryDirectory(prefix=f"step7-{label}-") as temp_dir:
        candidate = Path(temp_dir) / "authority"
        shutil.copytree(source, candidate)
        mutation(candidate)
        output = Path(temp_dir) / "must-not-exist.json"
        try:
            verify(candidate, output)
        except (OSError, KeyError, TypeError, VerificationError):
            require(not output.exists(), f"{label}: verifier wrote output before all checks passed")
            print(f"STEP7_AUTHORITY_NEGATIVE_{label.upper()}_PASS")
            return
        raise RuntimeError(f"{label}: tampered carrier was accepted")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    root = args.root.resolve()

    baseline = verify(root, None)
    require(baseline["raw_sha256"] == "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40", "baseline authority mismatch")

    cases: tuple[tuple[str, Mutation], ...] = (
        ("mutated_fragment", mutate_fragment),
        ("missing_fragment", remove_fragment),
        ("extra_fragment", add_fragment),
        ("renamed_fragment", rename_fragment),
        ("mixed_fragment", mix_fragment),
        ("manifest_hash", corrupt_manifest_hash),
        ("manifest_order", reorder_manifest_entries),
    )
    for label, mutation in cases:
        expect_rejected(root, label, mutation)

    print("STEP7_EXACT_SWAGGER_TRANSPORT_V2_FAIL_CLOSED_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
