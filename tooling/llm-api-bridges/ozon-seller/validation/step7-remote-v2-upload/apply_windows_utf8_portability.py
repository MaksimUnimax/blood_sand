#!/usr/bin/env python3
from __future__ import annotations

import argparse
import py_compile
from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count == 0 and new in text:
        return
    if count != 1:
        raise RuntimeError(f"expected one portability patch point in {path}, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8", newline="\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, required=True)
    args = parser.parse_args()
    root = args.repo_root.resolve()

    full_gate = root / "tooling/llm-api-bridges/ozon-seller/validation/step7-remote-v2/run_full_gate.py"
    runtime = root / "tooling/llm-api-bridges/ozon-seller/validation/step7-runtime-v1/run_step7_runtime.py"
    regression = root / "tooling/llm-api-bridges/ozon-seller/validation/step7-regression-v1/run_step7_regression.py"

    replace_once(
        full_gate,
        '        text=True,\n        stdout=subprocess.PIPE,',
        '        text=True,\n        encoding="utf-8",\n        errors="strict",\n        stdout=subprocess.PIPE,',
    )
    replace_once(
        runtime,
        '            text=True,\n            bufsize=1,',
        '            text=True,\n            encoding="utf-8",\n            errors="strict",\n            bufsize=1,',
    )
    replace_once(
        regression,
        '        text=True,\n        stdout=subprocess.PIPE,',
        '        text=True,\n        encoding="utf-8",\n        errors="strict",\n        stdout=subprocess.PIPE,',
    )

    for path in (full_gate, runtime, regression):
        py_compile.compile(str(path), doraise=True)
        patched = path.read_text(encoding="utf-8")
        if 'encoding="utf-8"' not in patched or 'errors="strict"' not in patched:
            raise RuntimeError(f"UTF-8 portability marker missing from {path}")
    print("STEP7_WINDOWS_UTF8_SUBPROCESS_PORTABILITY_PASS")


if __name__ == "__main__":
    main()
