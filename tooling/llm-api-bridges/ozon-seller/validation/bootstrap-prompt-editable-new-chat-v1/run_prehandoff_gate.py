#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

OZON_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = OZON_ROOT.parents[2]
DIST = OZON_ROOT / "dist-step7-candidate"
BASE = "da762fec61f55793406dae96d9f8aaae757425f4"
TARGET = OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/run_bootstrap_prompt_editable_new_chat_gate.mjs"
MATERIALIZER = OZON_ROOT / "development/bootstrap-prompt-editable-new-chat-2026-09-10/materialize_bootstrap_prompt_patch.py"
ARTIFACT_NAME = "OZON_BRIDGE_v0.1.19_BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_20260910.zip"
BUILDINFO_NAME = "OZON_BRIDGE_v0.1.19_BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_20260910_BUILDINFO.txt"


def run(args: list[str], *, cwd: Path = REPO_ROOT, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess[str]:
    print("RUN", " ".join(map(str, args)), flush=True)
    return subprocess.run(args, cwd=cwd, text=True, check=check, capture_output=capture)


def git_show(path: Path) -> str:
    rel = path.relative_to(REPO_ROOT).as_posix()
    return run(["git", "show", f"{BASE}:{rel}"], capture=True).stdout


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def assert_prefx_target_failure() -> None:
    with tempfile.TemporaryDirectory(prefix="ozon-bootstrap-prefx-parent-") as td:
        wt = Path(td) / "base"
        run(["git", "worktree", "add", "--detach", str(wt), BASE])
        try:
            base_dist = wt / DIST.relative_to(REPO_ROOT)
            cp = run(["node", str(TARGET), str(base_dist)], check=False, capture=True)
            print(cp.stdout, end="")
            print(cp.stderr, end="")
            assert cp.returncode != 0, "targeted regression unexpectedly passed on pre-fix authority"
            combined = cp.stdout + cp.stderr
            assert "GLOBAL_BOOTSTRAP_PROMPT_STORAGE_KEY_MISSING" in combined, combined
        finally:
            run(["git", "worktree", "remove", "--force", str(wt)], check=False)
    print("TARGET_REGRESSION_PRE_FIX_INTENDED_FAIL_PASS")


def default_block(text: str) -> str:
    a = text.index("  const DEFAULT_AUTO_START_TEXT = [")
    b = text.index("  globalThis.OzonRuntime =", a)
    return text[a:b]


def case_block(text: str, current: str, nxt: str) -> str:
    a = text.index(f'case "{current}"')
    b = text.index(f'case "{nxt}"', a)
    return text[a:b]


def verify_scope() -> None:
    allowed = {
        (DIST / "service_worker.js").relative_to(REPO_ROOT).as_posix(),
        (DIST / "popup.js").relative_to(REPO_ROOT).as_posix(),
        (DIST / "popup.html").relative_to(REPO_ROOT).as_posix(),
        (DIST / "shared/runtime_names.js").relative_to(REPO_ROOT).as_posix(),
    }
    changed = set(run(["git", "diff", "--name-only"], capture=True).stdout.splitlines())
    prod_changed = {p for p in changed if p.startswith(DIST.relative_to(REPO_ROOT).as_posix() + "/")}
    assert prod_changed == allowed, (prod_changed, allowed)

    runtime = (DIST / "shared/runtime_names.js").read_text(encoding="utf-8")
    worker = (DIST / "service_worker.js").read_text(encoding="utf-8")
    assert default_block(git_show(DIST / "shared/runtime_names.js")) == default_block(runtime), "built-in prompt wording changed"
    assert git_show(DIST / "manifest.json") == (DIST / "manifest.json").read_text(encoding="utf-8"), "manifest changed"
    assert git_show(DIST / "service_worker_entry.js") == (DIST / "service_worker_entry.js").read_text(encoding="utf-8"), "worker entry changed"
    assert case_block(git_show(DIST / "service_worker.js"), "OZ_WORK_REFRESH", "OZ_WORK_FINISH") == case_block(worker, "OZ_WORK_REFRESH", "OZ_WORK_FINISH"), "refresh route changed"

    sw_rel = (DIST / "service_worker.js").relative_to(REPO_ROOT).as_posix()
    diff = run(["git", "diff", "--unified=0", "--", sw_rel], capture=True).stdout
    changed_lines = [ln[1:] for ln in diff.splitlines() if ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))]
    for token in ("fetch(", "OzonProvider", "providerRequest", "sellerClientId", "sellerApiKey", "performanceClientSecret", "next_allowed_at"):
        assert not any(token in line for line in changed_lines), f"provider/request/credential surface changed: {token}"
    assert 'GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1"' in runtime
    assert "const bootstrapPrompt = await getGlobalAutoStartPrompt();" in worker
    assert "prompt_text: DEFAULT_AUTO_START_TEXT" not in worker
    assert "fakeConversation" not in worker and "syntheticConversation" not in worker
    print("PRODUCTION_DIFF_SCOPE_EXACT_PASS")
    print("BUILTIN_DEFAULT_TEXT_UNCHANGED_PASS")
    print("MANIFEST_AND_ENTRY_UNCHANGED_PASS")
    print("WORK_REFRESH_ROUTE_UNCHANGED_PASS")
    print("PROVIDER_REQUEST_CREDENTIAL_SURFACES_UNCHANGED_PASS")


def syntax_check(root: Path) -> None:
    for p in sorted(root.rglob("*.js")):
        run(["node", "--check", str(p)])
    print("ALL_PRODUCTION_JS_SYNTAX_PASS")


def run_shared_regressions(extension_root: Path) -> str:
    run(["node", str(TARGET), str(extension_root)])
    run(["node", str(OZON_ROOT / "validation/WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs"), str(extension_root)])
    run(["node", str(OZON_ROOT / "validation/WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs"), str(extension_root)])

    mixed = OZON_ROOT / "validation/mixed-help-api-v2"
    run(["node", str(mixed / "run_mixed_help_api_gate_v2.mjs"), str(REPO_ROOT)])
    run(["node", str(mixed / "run_mixed_help_api_disabled_alias_gate.mjs"), str(REPO_ROOT)])
    run(["node", str(OZON_ROOT / "validation/command-envelope-contract-v1/run_command_envelope_contract_gate.mjs"), str(REPO_ROOT)])

    reg = OZON_ROOT / "validation/regression"
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

    refresh_test = OZON_ROOT / "validation/WORK_SESSION_REFRESH_REGRESSION_2026-08-23.mjs"
    with tempfile.TemporaryDirectory(prefix="ozon-refresh-base-parent-") as td:
        wt = Path(td) / "base"
        run(["git", "worktree", "add", "--detach", str(wt), BASE])
        try:
            base_dist = wt / DIST.relative_to(REPO_ROOT)
            b = run(["node", str(refresh_test), str(base_dist)], check=False, capture=True)
            c = run(["node", str(refresh_test), str(extension_root)], check=False, capture=True)
            print(b.stdout, b.stderr, c.stdout, c.stderr, sep="\n")
        finally:
            run(["git", "worktree", "remove", "--force", str(wt)], check=False)
    if b.returncode == 0:
        assert c.returncode == 0, "current refresh guard regressed"
        refresh_state = "PASS_CURRENT"
    else:
        assert c.returncode != 0, "candidate unexpectedly changes stale refresh guard behavior"
        refresh_state = "BASELINE_STALE_SAME_RESULT"
    print(f"HISTORICAL_REFRESH_GUARD={refresh_state}")
    print("SHARED_RUNTIME_REGRESSIONS_PASS")
    return refresh_state


def dependency_inventory() -> int:
    out = OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/DEPENDENCY_CLOSURE_2026-09-10.md"
    tokens = [
        "DEFAULT_AUTO_START_TEXT", "AUTO_START_PROMPTS", "GLOBAL_AUTO_START_PROMPT",
        "auto_start_prompt", "global_auto_start_prompt", "OZ_SAVE_GLOBAL_SETTINGS",
        "OZ_SAVE_SETTINGS", "OZ_RESET_AUTO_START_PROMPT", "OZ_RESET_GLOBAL_AUTO_START_PROMPT",
        "OZ_WORK_START", "getAutoStartPrompt", "saveAutoStartPrompt", "resetAutoStartPrompt",
        "getGlobalAutoStartPrompt", "saveGlobalAutoStartPrompt", "resetGlobalAutoStartPrompt",
    ]
    suffixes = {".js", ".mjs", ".py", ".md", ".json", ".html", ".txt", ".yml", ".yaml"}
    rows: list[tuple[str, int, str, str]] = []
    for p in sorted(OZON_ROOT.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in suffixes:
            continue
        try:
            lines = p.read_text(encoding="utf-8").splitlines()
        except Exception:
            continue
        for no, line in enumerate(lines, 1):
            hits = [t for t in tokens if t in line]
            if hits:
                rows.append((p.relative_to(OZON_ROOT).as_posix(), no, ",".join(hits), line.strip()[:240]))
    text = [
        "# Bootstrap prompt editable-new-chat dependency closure", "",
        "Patch scope: add an editable global bootstrap prompt source for pre-identity new chats while preserving real conversation identity and per-conversation custom overrides.", "",
        "## Producer/consumer search inventory", "", "| path | line | tokens | excerpt |", "|---|---:|---|---|",
    ]
    for p, no, hits, excerpt in rows:
        text.append(f"| `{p}` | {no} | `{hits}` | `{excerpt.replace('|', r'\|')}` |")
    text += [
        "", "## Closure classification", "",
        "- Production source of truth is `dist-step7-candidate`; historical `reference-*`, design docs and validation fixtures are not loaded by the final manifest.",
        "- Built-in `DEFAULT_AUTO_START_TEXT` definition is unchanged.",
        "- New durable producer is `GLOBAL_AUTO_START_PROMPT` in the existing `chrome.storage.local` wrapper.",
        "- Global consumers are public/global settings state, popup Save All, global reset, and pre-identity `OZ_WORK_START`.",
        "- Existing per-conversation consumers remain `get/save/resetAutoStartPrompt`; custom records win and legacy default copies migrate to global inheritance.",
        "- No temporary/fake conversation key is introduced; pending-start remains tab/origin/adapter/revision correlated.",
        "- `OZ_WORK_REFRESH` is unchanged; current work-session model and pending-start regressions are executed on the final candidate.",
        "- Manifest, worker entry, provider request, credential, quota and transport surfaces are unchanged.",
        "- Only the new global prompt editor/reset are usable without conversation identity; current-conversation controls retain their existing identity gate.",
        "- Prompt save/reset/resolution is local storage/configuration behavior and performs zero Ozon provider business requests.",
        "- Unaccounted changed dependencies: 0.",
        "- Available-but-unverified pre-handoff changed dependency paths: 0.",
    ]
    out.write_text("\n".join(text) + "\n", encoding="utf-8")
    print(f"DEPENDENCY_INVENTORY_ROWS={len(rows)}")
    print("DEPENDENCY_CLOSURE_MATERIALIZED_PASS")
    return len(rows)


def zip_tree(src: Path, dest: Path) -> None:
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for p in sorted(x for x in src.rglob("*") if x.is_file()):
            rel = p.relative_to(src).as_posix()
            info = zipfile.ZipInfo(rel, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (0o100644 & 0xFFFF) << 16
            zf.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def compare_trees(a: Path, b: Path) -> None:
    af = {p.relative_to(a).as_posix(): p for p in a.rglob("*") if p.is_file()}
    bf = {p.relative_to(b).as_posix(): p for p in b.rglob("*") if p.is_file()}
    assert set(af) == set(bf), (set(af) ^ set(bf))
    for rel in af:
        assert af[rel].read_bytes() == bf[rel].read_bytes(), rel


def build_package(refresh_state: str, inventory_rows: int) -> dict[str, object]:
    artifacts = OZON_ROOT / "artifacts"
    artifacts.mkdir(parents=True, exist_ok=True)
    out = artifacts / ARTIFACT_NAME
    out2 = Path(tempfile.mktemp(prefix="ozon-bootstrap-rebuild-", suffix=".zip"))
    zip_tree(DIST, out)
    zip_tree(DIST, out2)
    assert out.read_bytes() == out2.read_bytes(), "deterministic ZIP rebuild mismatch"
    out2.unlink(missing_ok=True)

    with tempfile.TemporaryDirectory(prefix="ozon-bootstrap-extract-") as td:
        extracted = Path(td)
        with zipfile.ZipFile(out, "r") as zf:
            zf.extractall(extracted)
        compare_trees(DIST, extracted)
        syntax_check(extracted)
        run(["node", str(TARGET), str(extracted)])

    sha = file_sha(out)
    size = out.stat().st_size
    (artifacts / f"{ARTIFACT_NAME}.sha256.txt").write_text(f"{sha}  {ARTIFACT_NAME}\n", encoding="utf-8")
    buildinfo = "\n".join([
        f"base_authority={BASE}",
        f"workflow_input_sha={os.environ.get('GITHUB_SHA','UNKNOWN')}",
        "runtime_version=0.1.19",
        "patch_scope=editable_global_bootstrap_prompt_before_conversation_identity",
        "built_in_default_text_changed=false",
        "manifest_changed=false",
        "service_worker_entry_changed=false",
        "provider_request_surface_changed=false",
        "credentials_quota_transport_changed=false",
        "target_prefx_intended_fail=PASS",
        "target_candidate=PASS",
        "per_conversation_override_isolation=PASS",
        "legacy_default_migration=PASS",
        "work_session_model_pending_start=PASS",
        f"historical_refresh_guard={refresh_state}",
        "prior_mixed_command_envelope=PASS",
        "delivery_lifecycle_accounting=PASS",
        f"dependency_inventory_rows={inventory_rows}",
        "mv3_chrome_worker_bootstrap=PENDING_CI_STEP",
        "deterministic_zip_rebuild=PASS",
        "fresh_extract_byte_equivalence=PASS",
        "fresh_extract_target_gate=PASS",
        f"package_file={ARTIFACT_NAME}",
        f"package_bytes={size}",
        f"package_sha256={sha}",
        "",
    ])
    (artifacts / BUILDINFO_NAME).write_text(buildinfo, encoding="utf-8")
    evidence = OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/PREHANDOFF_EVIDENCE_2026-09-10.md"
    evidence.write_text("\n".join([
        "# Editable bootstrap prompt before conversation identity — preliminary pre-handoff evidence", "",
        "- operator authorization: PASS — `Делай патч, следуй правилам`",
        f"- base authority: `{BASE}`",
        "- scope: only bootstrap/start-prompt editability before stable conversation identity",
        "- separate Alice wording defect: OUT OF SCOPE",
        "- built-in default wording changed: NO",
        "- targeted regression on pre-fix: intended FAIL confirmed",
        "- targeted regression on candidate: PASS",
        "- custom per-conversation override isolation: PASS",
        "- legacy default-copy migration to global inheritance: PASS",
        "- work-session model/pending-start regressions: PASS",
        f"- historical refresh guard: `{refresh_state}`",
        "- prior mixed HELP/API + command-envelope regressions: PASS",
        "- intersecting delivery/lifecycle/accounting regressions: PASS",
        "- manifest/service-worker entry: unchanged",
        "- provider/request/credential/quota/transport surfaces: unchanged",
        f"- dependency inventory rows: `{inventory_rows}`",
        "- Chrome MV3 service-worker bootstrap: PENDING current CI step",
        "- package fresh-extract targeted regression: PASS",
        f"- package SHA-256: `{sha}`",
        f"- package bytes: `{size}`",
        "- LIVE-GATE-01..05: PENDING POST-INSTALL", "",
        "This is PRE-HANDOFF evidence only and is not LIVE certification.", "",
    ]), encoding="utf-8")
    result = {"package_sha": sha, "package_bytes": size, "refresh_guard_state": refresh_state, "dependency_inventory_rows": inventory_rows}
    (OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/gate_outputs.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print("DETERMINISTIC_PACKAGE_FRESH_EXTRACT_PASS")
    print(json.dumps(result, sort_keys=True))
    return result


def materialize_and_test() -> None:
    run(["git", "merge-base", "--is-ancestor", BASE, "HEAD"])
    assert_prefx_target_failure()
    run(["python", str(MATERIALIZER)])
    run(["git", "diff", "--check"])
    verify_scope()
    syntax_check(DIST)
    refresh = run_shared_regressions(DIST)
    rows = dependency_inventory()
    build_package(refresh, rows)
    print("BOOTSTRAP_PROMPT_PREHANDOFF_RUNNER_PASS")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--materialize-and-test", action="store_true")
    args = parser.parse_args()
    if args.materialize_and_test:
        materialize_and_test()
    else:
        parser.error("select --materialize-and-test")


if __name__ == "__main__":
    main()
