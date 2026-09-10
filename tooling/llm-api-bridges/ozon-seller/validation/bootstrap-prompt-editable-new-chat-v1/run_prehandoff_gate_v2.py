#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
V1_PATH = HERE / "run_prehandoff_gate.py"
V2_MATERIALIZER = HERE.parents[1] / "development/bootstrap-prompt-editable-new-chat-2026-09-10/materialize_bootstrap_prompt_patch_v2.py"

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
    assert v1.case_block(old_worker, "OZ_WORK_REFRESH", "OZ_WORK_START") == v1.case_block(new_worker, "OZ_WORK_REFRESH", "OZ_WORK_START"), "refresh case changed"

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
    print("WORK_REFRESH_EXACT_CASE_UNCHANGED_PASS")
    print("PROVIDER_REQUEST_CREDENTIAL_SURFACES_UNCHANGED_PASS")


def run_shared_regressions_exact(extension_root: Path) -> str:
    # These historical harnesses have different argv contracts; preserve each exact contract.
    v1.run(["node", str(v1.TARGET), str(extension_root)])
    v1.run([
        "node",
        str(v1.OZON_ROOT / "validation/WORK_SESSION_MODEL_REGRESSION_2026-08-21.mjs"),
        str(extension_root / "shared/work_session_model.js"),
    ])
    v1.run([
        "node",
        str(v1.OZON_ROOT / "validation/WORK_SESSION_PENDING_START_REGRESSION_2026-08-21.mjs"),
        str(extension_root),
    ])

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
            print(before.stdout, before.stderr, after.stdout, after.stderr, sep="\n")
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
    return refresh_state


def main() -> None:
    v1.run(["git", "merge-base", "--is-ancestor", v1.BASE, "HEAD"])
    v1.assert_prefx_target_failure()
    v1.run(["python", str(V2_MATERIALIZER)])
    v1.run(["git", "diff", "--check"])
    verify_scope_exact()
    v1.syntax_check(v1.DIST)
    refresh_state = run_shared_regressions_exact(v1.DIST)
    inventory_rows = v1.dependency_inventory()
    v1.build_package(refresh_state, inventory_rows)
    print("BOOTSTRAP_PROMPT_PREHANDOFF_RUNNER_V2_PASS")


if __name__ == "__main__":
    main()
