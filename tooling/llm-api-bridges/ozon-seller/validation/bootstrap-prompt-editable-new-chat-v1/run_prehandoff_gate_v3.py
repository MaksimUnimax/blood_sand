#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
V2_RUNNER = HERE / "run_prehandoff_gate_v2.py"
V3_MATERIALIZER = HERE.parents[1] / "development/bootstrap-prompt-editable-new-chat-2026-09-10/materialize_bootstrap_prompt_patch_v3.py"
OVERRIDE_GATE = HERE / "run_prompt_override_save_contract_gate.mjs"

spec = importlib.util.spec_from_file_location("ozon_bootstrap_prehandoff_v2", V2_RUNNER)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load prehandoff v2 authority")
v2 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v2)
v1 = v2.v1


def main() -> None:
    v1.run(["git", "merge-base", "--is-ancestor", v1.BASE, "HEAD"])
    v1.assert_prefx_target_failure()
    v1.run(["python", str(V3_MATERIALIZER)])
    v1.run(["git", "diff", "--check"])
    v2.verify_scope_exact()
    v1.syntax_check(v1.DIST)
    refresh_state, pending_state = v2.run_shared_regressions_exact(v1.DIST)
    v1.run(["node", str(OVERRIDE_GATE), str(v1.DIST)])
    inventory_rows = v1.dependency_inventory()
    v1.build_package(refresh_state, inventory_rows)
    v2.persist_guard_classifications(refresh_state, pending_state)

    buildinfo = v1.OZON_ROOT / "artifacts" / v1.BUILDINFO_NAME
    text = buildinfo.read_text(encoding="utf-8")
    if "explicit_local_override_save_contract=PASS" not in text:
        text = text.replace("per_conversation_override_isolation=PASS\n", "per_conversation_override_isolation=PASS\nexplicit_local_override_save_contract=PASS\n")
    buildinfo.write_text(text, encoding="utf-8")

    evidence = v1.OZON_ROOT / "validation/bootstrap-prompt-editable-new-chat-v1/PREHANDOFF_EVIDENCE_2026-09-10.md"
    text = evidence.read_text(encoding="utf-8")
    if "explicit per-dialog override Save All contract" not in text:
        text = text.replace("- custom per-conversation override isolation: PASS\n", "- custom per-conversation override isolation: PASS\n- explicit per-dialog override Save All contract: PASS; ordinary Save All cannot create an override while opt-in is OFF\n")
    evidence.write_text(text, encoding="utf-8")

    print("BOOTSTRAP_PROMPT_EXPLICIT_OVERRIDE_DEPENDENCY_CLOSURE_PASS")
    print("BOOTSTRAP_PROMPT_PREHANDOFF_RUNNER_V3_PASS")


if __name__ == "__main__":
    main()
