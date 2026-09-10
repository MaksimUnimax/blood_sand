#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT.parents[2]
DIST = ROOT / "dist-step7-candidate"
GATE_DIR = Path(__file__).resolve().parent
ARTIFACT = ROOT / "artifacts/OZON_BRIDGE_v0.1.19_BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_20260910.zip"


def run(args: list[str]) -> None:
    print("RUN", " ".join(map(str, args)), flush=True)
    subprocess.run(args, cwd=REPO, check=True)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def gates(extension_root: Path) -> None:
    for p in sorted(extension_root.rglob("*.js")):
        run(["node", "--check", str(p)])
    run(["node", str(GATE_DIR / "run_bootstrap_prompt_editable_new_chat_gate.mjs"), str(extension_root)])
    run(["node", str(GATE_DIR / "run_current_work_session_pending_visibility_gate.mjs"), str(extension_root)])
    run(["node", str(GATE_DIR / "run_prompt_override_save_contract_gate.mjs"), str(extension_root)])
    run(["node", str(ROOT / "validation/WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs"), str(extension_root / "shared/work_session_model.js")])
    run(["node", str(ROOT / "validation/mixed-help-api-v2/run_mixed_help_api_gate_v2.mjs"), str(REPO)])
    run(["node", str(ROOT / "validation/mixed-help-api-v2/run_mixed_help_api_disabled_alias_gate.mjs"), str(REPO)])
    run(["node", str(ROOT / "validation/command-envelope-contract-v1/run_command_envelope_contract_gate.mjs"), str(REPO)])
    reg = ROOT / "validation/regression"
    for name in (
        "run_file_delivery_capture_accounting.mjs",
        "run_file_delivery_port_worker_state_machine.mjs",
        "run_file_delivery_mixed_batch_policy.mjs",
        "run_file_delivery_adapter_gate_policy.mjs",
        "run_file_delivery_wake_lifecycle.mjs",
        "run_file_delivery_live_stop_repro.mjs",
        "run_direct_binary_provider_attachment_gate.mjs",
    ):
        run(["node", str(reg / name)])


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--source-sha", required=True)
    p.add_argument("--package-sha", required=True)
    a = p.parse_args()
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=REPO, text=True).strip()
    assert head == a.source_sha, (head, a.source_sha)
    gates(DIST)
    actual = sha256(ARTIFACT)
    assert actual == a.package_sha.lower(), (actual, a.package_sha)
    sidecar = ARTIFACT.with_name(ARTIFACT.name + ".sha256.txt").read_text(encoding="utf-8").split()[0].lower()
    assert sidecar == actual, (sidecar, actual)
    with tempfile.TemporaryDirectory(prefix="ozon-bootstrap-win-extract-") as td:
        extracted = Path(td)
        with zipfile.ZipFile(ARTIFACT, "r") as zf:
            zf.extractall(extracted)
        gates(extracted)
    print(f"WINDOWS_EXACT_SOURCE_SHA={head}")
    print(f"WINDOWS_PACKAGE_SHA256={actual}")
    print("WINDOWS_EXACT_SOURCE_AND_PACKAGE_FULL_GATE_PASS")


if __name__ == "__main__":
    main()
