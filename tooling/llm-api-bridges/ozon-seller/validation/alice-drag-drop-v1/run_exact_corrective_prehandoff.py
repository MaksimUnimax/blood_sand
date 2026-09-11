#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
OZON_ROOT = HERE.parents[1]
REPO_ROOT = HERE.parents[4]
DIST = OZON_ROOT / "dist-step7-candidate"
ARTIFACT_NAME = "OZON_BRIDGE_v0.1.19_ALICE_DRAG_DROP_CORRECTIVE_20260911.zip"
ARTIFACT = OZON_ROOT / "artifacts" / ARTIFACT_NAME


def run(args, *, capture=False):
    print("+", " ".join(map(str, args)))
    return subprocess.run([str(x) for x in args], cwd=REPO_ROOT, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.STDOUT if capture else None)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_exact_executable(source_sha: str) -> None:
    run(["git", "merge-base", "--is-ancestor", source_sha, "HEAD"])
    diff = run(["git", "diff", "--name-only", f"{source_sha}..HEAD", "--", DIST.relative_to(REPO_ROOT)], capture=True).stdout.strip()
    if diff:
        raise AssertionError(f"production drift after exact executable commit:\n{diff}")
    if run(["git", "status", "--porcelain", "--", DIST.relative_to(REPO_ROOT)], capture=True).stdout.strip():
        raise AssertionError("working-tree production drift before final gate")
    print("ALICE_DND_EXACT_EXECUTABLE_NO_PRODUCTION_DRIFT_PASS")


def syntax_and_regressions() -> None:
    for path in sorted(DIST.rglob("*.js")):
        run(["node", "--check", path])
    print("ALL_PRODUCTION_JS_SYNTAX_PASS")
    commands = [
        ["node", HERE / "run_alice_drag_drop_runtime_gate.mjs", REPO_ROOT, DIST],
        ["node", OZON_ROOT / "validation/alice-large-result-v1/run_alice_large_result_delivery_gate.mjs", DIST],
        ["node", OZON_ROOT / "validation/alice-large-result-v1/run_alice_large_result_delivery_gate_v2.mjs", REPO_ROOT, DIST],
        ["node", OZON_ROOT / "validation/regression/run_file_delivery_adapter_gate_policy.mjs"],
        *[["node", OZON_ROOT / "validation/regression" / name] for name in (
            "run_file_delivery_capture_accounting.mjs",
            "run_file_delivery_port_worker_state_machine.mjs",
            "run_file_delivery_mixed_batch_policy.mjs",
            "run_file_delivery_wake_lifecycle.mjs",
            "run_file_delivery_live_stop_repro.mjs",
            "run_direct_binary_provider_attachment_gate.mjs",
        )],
        ["node", OZON_ROOT / "validation/mixed-help-api-v2/run_mixed_help_api_gate_v2.mjs", REPO_ROOT],
        ["node", OZON_ROOT / "validation/mixed-help-api-v2/run_mixed_help_api_disabled_alias_gate.mjs", REPO_ROOT],
        ["node", OZON_ROOT / "validation/command-envelope-contract-v1/run_command_envelope_contract_gate.mjs", REPO_ROOT],
    ]
    for command in commands:
        run(command)
    print("ALICE_DND_TARGETED_AND_SHARED_REGRESSIONS_PASS")


def chrome_dump(chrome: Path, html: Path, expected_title: str, expected_marker: str) -> None:
    dumped = run([
        chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-background-networking",
        "--allow-file-access-from-files", "--virtual-time-budget=2500", "--dump-dom", html.resolve().as_uri()
    ], capture=True).stdout
    if f"<title>{expected_title}</title>" not in dumped or expected_marker not in dumped:
        raise AssertionError(f"browser fixture failed: {html.name}\n" + dumped[-12000:])


def browser_and_mv3(chrome: Path) -> None:
    chrome_dump(chrome, HERE / "alice_drag_drop_transport_probe.html", "ALICE_DND_PROBE_PASS", 'data-probe-result="PASS"')
    chrome_dump(chrome, HERE / "alice_drag_drop_adapter_fixture.html", "ALICE_DND_ADAPTER_PASS", 'data-ozon-test="PASS"')
    run(["node", OZON_ROOT / "validation/regression/run_file_attachment_browser_primitive.mjs", chrome])
    run(["xvfb-run", "-a", "node", OZON_ROOT / "validation/regression/run_file_delivery_extension_worker_smoke.mjs", chrome, DIST])
    print("ALICE_DND_BROWSER_AND_MV3_EXACT_SOURCE_PASS")


def active_closed_set() -> None:
    caps = (DIST / "shared/ai_delivery_capabilities.js").read_text(encoding="utf-8")
    adapters = (DIST / "shared/ai_adapters.js").read_text(encoding="utf-8")
    port = (DIST / "attachment_delivery_port_content.js").read_text(encoding="utf-8")
    policy = (DIST / "shared/file_delivery_model_policy.js").read_text(encoding="utf-8")
    worker = (DIST / "shared/file_delivery_port_worker.js").read_text(encoding="utf-8")
    web = (DIST / "shared/web_file_attachment.js").read_text(encoding="utf-8")
    required = [
        ('Alice strategy', 'attachment_strategy: "drag_drop_v1"', caps),
        ('ChatGPT strategy', 'attachment_strategy: "file_input_v1"', caps),
        ('policy strategy set', '["file_input_v1", "drag_drop_v1"]', policy),
        ('worker strategy set', '["file_input_v1", "drag_drop_v1"]', worker),
        ('content strategy set', '["file_input_v1", "drag_drop_v1"]', port),
        ('Alice attachFiles', 'function aliceAttachFiles(', adapters),
        ('Alice plus marker', 'InputControls-Plus-Button', adapters),
        ('drop primitive', 'function dispatchFileDrop(', web),
    ]
    for label, token, source in required:
        if token not in source:
            raise AssertionError(f"missing active closed-set requirement: {label}")
    forbidden = [
        ('Alice persistent file input resolver', 'function aliceFileInput(', adapters),
        ('generic port direct input binding', 'surfaceBeforeCommit.input', port),
        ('generic port direct setInputFiles', 'setInputFiles(surfaceBeforeCommit', port),
    ]
    for label, token, source in forbidden:
        if token in source:
            raise AssertionError(f"stale active assumption remains: {label}")
    print("ALICE_DND_SECONDARY_CLOSED_SET_SWEEP_PASS")


def build_package() -> dict:
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in DIST.rglob("*") if p.is_file())
    with zipfile.ZipFile(ARTIFACT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path in files:
            info = zipfile.ZipInfo(path.relative_to(DIST).as_posix(), date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    digest = sha256(ARTIFACT)
    size = ARTIFACT.stat().st_size
    sha_file = ARTIFACT.parent / (ARTIFACT_NAME + ".sha256.txt")
    sha_file.write_text(f"{digest}  {ARTIFACT_NAME}\n", encoding="utf-8")
    return {"package_name": ARTIFACT_NAME, "package_sha": digest, "package_bytes": size, "production_files": len(files)}


def fresh_extraction(chrome: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="ozon-alice-dnd-package-") as td:
        target = Path(td)
        with zipfile.ZipFile(ARTIFACT, "r") as z:
            bad = z.testzip()
            if bad:
                raise AssertionError(f"bad ZIP member: {bad}")
            z.extractall(target)
        original = {p.relative_to(DIST).as_posix(): sha256(p) for p in DIST.rglob("*") if p.is_file()}
        extracted = {p.relative_to(target).as_posix(): sha256(p) for p in target.rglob("*") if p.is_file()}
        if original != extracted:
            raise AssertionError("fresh extraction differs from exact tested dist")
        run(["node", HERE / "run_alice_drag_drop_runtime_gate.mjs", REPO_ROOT, target])
        run(["xvfb-run", "-a", "node", OZON_ROOT / "validation/regression/run_file_delivery_extension_worker_smoke.mjs", chrome, target])
    print("ALICE_DND_DETERMINISTIC_ZIP_FRESH_EXTRACTION_PASS")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("chrome")
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--source-tree", required=True)
    args = parser.parse_args()
    chrome = Path(args.chrome).resolve()
    actual_tree = run(["git", "show", "-s", "--format=%T", args.source_sha], capture=True).stdout.strip()
    if actual_tree != args.source_tree:
        raise AssertionError(f"source tree mismatch: {actual_tree} != {args.source_tree}")
    verify_exact_executable(args.source_sha)
    syntax_and_regressions()
    browser_and_mv3(chrome)
    active_closed_set()
    outputs = build_package()
    fresh_extraction(chrome)
    outputs.update({"source_sha": args.source_sha, "source_tree": args.source_tree, "provider_calls": 0})
    (HERE / "gate_outputs_corrective.json").write_text(json.dumps(outputs, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(outputs, sort_keys=True))
    print("ALICE_DND_EXACT_CORRECTIVE_PREHANDOFF_RUNNER_PASS")


if __name__ == "__main__":
    main()
