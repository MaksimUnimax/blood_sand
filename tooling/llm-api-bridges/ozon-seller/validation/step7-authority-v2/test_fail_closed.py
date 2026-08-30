#!/usr/bin/env python3
"""Negative tests proving the Step 7 authority transport fails closed."""

from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path


def load_verifier(root: Path):
    path = root / "reconstruct_exact_swagger.py"
    spec = importlib.util.spec_from_file_location("step7_reconstruct", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load verifier")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def require_failure(module, root: Path, label: str) -> None:
    try:
        module.verify(root, None)
    except (OSError, KeyError, TypeError, module.VerificationError):
        print(f"STEP7_FAIL_CLOSED_{label}_PASS")
        return
    raise RuntimeError(f"negative case unexpectedly passed: {label}")


def load_manifest(root: Path) -> tuple[Path, dict]:
    path = root / "manifest.json"
    return path, json.loads(path.read_text(encoding="utf-8"))


def write_manifest(path: Path, manifest: dict) -> None:
    path.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    source = args.root.resolve()
    verifier = load_verifier(source)
    verifier.verify(source, None)
    print("STEP7_FAIL_CLOSED_BASELINE_PASS")

    with tempfile.TemporaryDirectory(prefix="step7-fail-closed-") as temp:
        base = Path(temp)

        missing = base / "missing"
        shutil.copytree(source, missing)
        _, manifest = load_manifest(missing)
        first = manifest["transport"]["fragments"]["entries"][0]["name"]
        (missing / first).unlink()
        require_failure(verifier, missing, "MISSING_FRAGMENT")

        tampered = base / "tampered"
        shutil.copytree(source, tampered)
        _, manifest = load_manifest(tampered)
        target = tampered / manifest["transport"]["fragments"]["entries"][1]["name"]
        data = bytearray(target.read_bytes())
        data[len(data) // 2] ^= 1
        target.write_bytes(data)
        require_failure(verifier, tampered, "TAMPERED_FRAGMENT")

        reordered = base / "reordered"
        shutil.copytree(source, reordered)
        manifest_path, manifest = load_manifest(reordered)
        entries = manifest["transport"]["fragments"]["entries"]
        entries[0], entries[1] = entries[1], entries[0]
        write_manifest(manifest_path, manifest)
        require_failure(verifier, reordered, "REORDERED_MANIFEST")

        renamed = base / "renamed"
        shutil.copytree(source, renamed)
        manifest_path, manifest = load_manifest(renamed)
        entry = manifest["transport"]["fragments"]["entries"][0]
        old = renamed / entry["name"]
        new_name = "fragments/renamed-fragment.txt"
        old.rename(renamed / new_name)
        entry["name"] = new_name
        write_manifest(manifest_path, manifest)
        require_failure(verifier, renamed, "COHERENT_RENAME")

        extra = base / "extra"
        shutil.copytree(source, extra)
        (extra / "fragments" / "unexpected.bin").write_bytes(b"unexpected")
        require_failure(verifier, extra, "EXTRA_FRAGMENT")

        newline = base / "newline"
        shutil.copytree(source, newline)
        _, manifest = load_manifest(newline)
        target = newline / manifest["transport"]["fragments"]["entries"][2]["name"]
        target.write_bytes(target.read_bytes() + b"\n")
        require_failure(verifier, newline, "LINE_ENDING_MUTATION")

        authority = base / "authority"
        shutil.copytree(source, authority)
        manifest_path, manifest = load_manifest(authority)
        manifest["authority"]["sha256"] = "0" * 64
        write_manifest(manifest_path, manifest)
        require_failure(verifier, authority, "AUTHORITY_MISMATCH")

        encoding = base / "encoding"
        shutil.copytree(source, encoding)
        manifest_path, manifest = load_manifest(encoding)
        manifest["transport"]["encoding"]["sha256"] = "0" * 64
        write_manifest(manifest_path, manifest)
        require_failure(verifier, encoding, "ENCODING_IDENTITY_MISMATCH")

    print("STEP7_EXACT_SWAGGER_TRANSPORT_V2_FAIL_CLOSED_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
