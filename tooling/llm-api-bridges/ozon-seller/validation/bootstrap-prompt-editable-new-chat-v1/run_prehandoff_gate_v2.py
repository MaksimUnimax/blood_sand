#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
V1_PATH = HERE / "run_prehandoff_gate.py"
V2_MATERIALIZER = HERE.parents[1] / "development/bootstrap-prompt-editable-new-chat-2026-09-10/materialize_bootstrap_prompt_patch_v2.py"
CURRENT_VISIBILITY_GATE = HERE / "run_current_work_session_pending_visibility_gate.mjs"

spec = importlib.util.spec_from_file_location("ozon_bootstrap_prehandoff_v1", V1_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load prehandoff gate authority")
v1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v1)


def verify_scope_exact() -> None:
    allowed = {
        (v1.DIST / "service_worker.js").relative_to(v1.REPO_ROOT).as_posix(),
        (v1.DIST / "popup.js").relative_to(v1.REPO_ROOT).as_posix(),
        (v1.DIST / "popup.html").relative_to(v1.REPO_ROOT).as_posix(),
        (v1.DIST / "shared/runtime_names.js").relative_to(v1.REPO_ROOT).as_posix(),
    }
    changed = set(v1.run(["git", "diff", "--name-only"], capture=True).stdout.splitlines())
    prod_changed = {p for p in changed if p.startswith(v1.DIST.relative_to(v1.REPO_ROOT).as_posix() + "/")}
    assert prod_changed == allowed, (prod_changed, allowed)

    runtime_path = v1.DIST / "shared/runtime_names.js"
    worker_path = v1.DIST / "service_worker.js"
    manifest_path = v1.DIST / "manifest.json"
    entry_path = v1.DIST / "service_worker_entry.js"
    new_runtime = runtime_path.read_text(encoding="utf-8")
    new_worker = worker_path.read_text(encoding="utf-8")
    old_worker = v1.git_show(worker_path)

    assert v1.default_block(v1.git_show(runtime_path)) == v1.default_block(new_runtime), "built-in prompt wording changed"
    assert v1.git_show(manifest_path) == manifest_path.read_text(encoding="utf-8"), "manifest changed"
    assert v1.git_show(entry_path) == entry_path.read_text(encoding="utf-8"), "service-worker entry changed"

    # Compare each protected lifecycle case only to its actual immediate next switch case.
    # SHOW is followed by REFRESH; REFRESH is followed by START; HIDE is followed by FINISH.
    # Comparing SHOW all the way to HIDE would incorrectly include the authorized START repair.
    assert v1.case_block(old_worker, "OZ_WORK_SHOW", "OZ_WORK_REFRESH") == v1.case_block(new_worker, "OZ_WORK_SHOW", "OZ_WORK_REFRESH"), "show case changed"
    assert v1.case_block(old_worker, "OZ_WORK_REFRESH", "OZ_WORK_START") == v1.case_block(new_worker, "OZ_WORK_REFRESH", "OZ_WORK_START"), "refresh case changed"
    assert v1.case_block(old_worker, "OZ_WORK_HIDE", "OZ_WORK_FINISH") == v1.case_block(new_worker, "OZ_WORK_HIDE", "OZ_WORK_FINISH"), "hide case changed"

    sw_rel = worker_path.relative_to(v1.REPO_ROOT).as_posix()
    diff = v1.run(["git", "diff", "--unified=0", "--", sw_rel], capture=True).stdout
    changed_lines = [ln[1:] for ln in diff.splitlines() if ln.startswith(("+", "-")) and not ln.startswith(("+++", "---"))]
    for token in ("fetch(", "OzonProvider", "providerRequest", "sellerClientId", "sellerApiKey", "performanceClientSecret", "next_allowed_at"):
        assert not any(token in line for line in changed_lines), f"provider/request/credential surface changed: {token}"

    assert 'GLOBAL_AUTO_START_PROMPT: "ozmb_global_auto_start_prompt_v1"' in new_runtime
    assert "const bootstrapPrompt = await getGlobalAutoStartPrompt();" in new_worker
    assert "prompt_text: DEFAULT_AUTO_START_TEXT" not in new_worker
    assert "fakeConversation" not in new_worker and "syntheticConversation" not in new_worker
    print("PRODUCTION_DIFF_SCOPE_EXACT_PASS")
    print("BUILTIN_DEFAULT_TEXT_UNCHANGED_PASS")
    print("MANIFEST_AND_ENTRY_UNCHANGED_PASS")
    print("WORK_SHOW_EXACT_CASE_UNCHANGED_PASS")
    print("WORK_REFRESH_EXACT_CASE_UNCHANGED_PASS")
    print("WORK_HIDE_EXACT_CASE_UNCHANGED_PASS")
    print("PROVIDER_REQUEST_CREDENTIAL_SURFACES_UNCHANGED_PASS")


def classify_pending_start_and_run_current_guard(extension_root: Path) -> str:
    historical = v1.OZON_ROOT / "validation/WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs"
    expected_error = "show/hide UI lifecycle route missing"
    expected_prefix_markers = (
        "WORK_SESSION_NEW_CHAT_PENDING_TRANSACTION_PASS",
        "WORK_SESSION_PENDING_START_SINGLE_FLIGHT_PASS",
        "WORK_SESSION_PENDING_IDENTITY_COMPLETION_GUARDED_PASS",
        "WORK_SESSION_CORRELATION_WRONG_INTENT_REVISION_ORIGIN_ADAPTER_REJECTED_PASS",
        "WORK_SESSION_PROMPT_FAILURE_TERMINAL_ERROR_PASS",
        "WORK_SESSION_TAB_CLOSE_AND_DELAYED_EVENT_FAIL_CLOSED_PASS",
    )
    with tempfile.TemporaryDirectory(prefix="ozon-pending-base-parent-") as td:
        wt = Path(td) / "base"
        v1.run(["git", "worktree", "add", "--detach", str(wt), v1.BASE])
        try:
            base_dist = wt / v1.DIST.relative_to(v1.REPO_ROOT)
            before = v1.run(["node", str(historical), str(base_dist)], check=False, capture=True)
            after = v1.run(["node", str(historical), str(extension_root)], check=False, capture=True)
            before_text = before.stdout + before.stderr
            after_text = after.stdout + after.stderr
            print(before_text, after_text, sep="\n--- HISTORICAL PENDING BASE/CANDIDATE ---\n")

            if before.returncode == 0:
                assert after.returncode == 0, "historical pending-start guard passed base but regressed candidate"
                historical_state = "PASS_CURRENT"
            else:
                assert after.returncode != 0, "candidate unexpectedly changes stale historical pending-start guard outcome"
                assert expected_error in before_text and expected_error in after_text, "historical pending-start base/candidate do not fail at the same stale show/hide assertion"
                for marker in expected_prefix_markers:
                    assert marker in before_text and marker in after_text, f"historical pending-start failed before preserved safety marker: {marker}"
                historical_state = "BASELINE_STALE_SAME_RESULT"

            v1.run(["node", str(CURRENT_VISIBILITY_GATE), str(base_dist)])
            v1.run(["node", str(CURRENT_VISIBILITY_GATE), str(extension_root)])
        finally:
            v1.run(["git", "worktree", "remove", "--force", str(wt)], check=False)

    print(f"HISTORICAL_PENDING_START_GUARD={historical_state}")
    print("CURRENT_PENDING_START_VISIBILITY_BASE_AND_CANDIDATE_PASS")
    return historical_state


def run_shared_regressions_exact(extension_root: Path) -> tuple[str, str]:
    v1.run(["node", str(v1.TARGET), str(extension_root)])
    v1.run([
        "node",
        str(v1.OZON_ROOT / "validation/WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs"),
        str(extension_root / "shared/work_session_model.js"),
    ])
    pending_state = classify_pending_start_and_run_current_guard(extension_root)

    mixed = v1.OZON_ROOT / "validation/mixed-help-api-v2"
    v1.run(["node", str(mixed / "run_mixed_help_api_gate_v2.mjs"), str(v1.REPO_ROOT)])
    v1.run(["node", str(mixed / "run_mixed_help_api_disabled_alias_gate.mjs"), str(v1.REPO_ROOT)])
    v1.run(["node", str(v1.OZON_ROOT / "validation/command-envelope-contract-v1/run_command_envelope_contract_gate.mjs"), str(v1.REPO_ROOT)])

    reg = v1.OZON_ROOT / "validation/regression"
    for name in (
        "run_file_delivery_capture_accounting.mjs",
        "run_file_delivery_port_worker_state_machine.mjs",
        "run_file_delivery_mixed_batch_policy.mjs",
        "run_file_delivery_adapter_gate_policy.mjs",
        "run_file_delivery_wake_lifecycle.mjs",
        "run_file_delivery_live_stop_repro.mjs",
        "run_direct_binary_provider_attachment_gate.mjs",
    ):
        v1.run(["node", str(reg / name)])

    refresh_test = v1.OZON_ROOT / "validation/WORK_SESSION_REFRESH_REGRESSION_2026-08-23.mjs"
    with tempfile.TemporaryDirectory(prefix="ozon-refresh-base-parent-") as td:
        wt = Path(td) / "base"
        v1.run(["git", "worktree", "add", "--detach", str(wt), v1.BASE])
        try:
            base_dist = wt / v1.DIST.relative_to(v1.REPO_ROOT)
            before = v1.run(["node", str(refresh_test), str(base_dist)], check=False, capture=True)
            after = v1.run(["node", str(refresh_test), str(extension_root)], check=False, capture=True)
            before_text = before.stdout + before.stderr
            after_text = after.stdout + after.stderr
            print(before_text, after_text, sep="\n--- HISTORICAL REFRESH BASE/CANDIDATE ---\n")
        finally:
            v1.run(["git", "worktree", "remove", "--force", str(wt)], check=False)
    if before.returncode == 0:
        assert after.returncode == 0, "current refresh guard regressed"
        refresh_state = "PASS_CURRENT"
    else:
        assert after.returncode != 0, "candidate unexpectedly changes stale refresh guard behavior"
        refresh_state = "BASELINE_STALE_SAME_RESULT"
    print(f"HISTORICAL_REFRESH_GUARD={refresh_state}")
    print("SHARED_RUNTIME_REGRESSIONS_EXACT_ARGV_PASS")
    return refresh_state, pending_state


def persist_guard_classifications(refresh_state: str, pending_state: str) -> None:
    outputs_path = v1.OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/gate_outputs.json"
    outputs = json.loads(outputs_path.read_text(encoding="utf-8"))
    outputs["refresh_guard_state"] = refresh_state
    outputs["pending_start_guard_state"] = pending_state
    outputs_path.write_text(json.dumps(outputs, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    buildinfo = v1.OZON_ROOT / "artifacts" / v1.BUILDINFO_NAME
    text = buildinfo.read_text(encoding="utf-8")
    if "historical_pending_start_guard=" not in text:
        text = text.replace(
            f"historical_refresh_guard={refresh_state}\n",
            f"historical_refresh_guard={refresh_state}\nhistorical_pending_start_guard={pending_state}\ncurrent_pending_start_visibility_guard=PASS_BASE_AND_CANDIDATE\n",
        )
    buildinfo.write_text(text, encoding="utf-8")

    evidence = v1.OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/PREHANDOFF_EVIDENCE_2026-09-10.md"
    text = evidence.read_text(encoding="utf-8")
    needle = f"- historical refresh guard: `{refresh_state}`\n"
    if "historical pending-start guard:" not in text:
        text = text.replace(
            needle,
            needle + f"- historical pending-start guard: `{pending_state}`\n- current pending-start/show-hide visibility guard: `PASS_BASE_AND_CANDIDATE`\n",
        )
    evidence.write_text(text, encoding="utf-8")
    print("HISTORICAL_GUARD_CLASSIFICATIONS_PERSISTED_PASS")


def main() -> None:
    v1.run(["git", "merge-base", "--is-ancestor", v1.BASE, "HEAD"])
    v1.assert_prefx_target_failure()
    v1.run(["python", str(V2_MATERIALIZER)])
    v1.run(["git", "diff", "--check"])
    verify_scope_exact()
    v1.syntax_check(v1.DIST)
    refresh_state, pending_state = run_shared_regressions_exact(v1.DIST)
    inventory_rows = v1.dependency_inventory()
    v1.build_package(refresh_state, inventory_rows)
    persist_guard_classifications(refresh_state, pending_state)
    print("BOOTSTRAP_PROMPT_PREHANDOFF_RUNNER_V2_PASS")


if __name__ == "__main__":
    main()
