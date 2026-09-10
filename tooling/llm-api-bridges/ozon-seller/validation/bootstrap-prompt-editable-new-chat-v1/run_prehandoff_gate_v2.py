#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
V1_PATH = HERE / "run_prehandoff_gate.py"
V2_MATERIALIZER = HERE.parents[1] / "development/bootstrap-prompt-editable-new-chat-2026-09-10/materialize_bootstrap_prompt_patch_v2.py"

spec = importlib.util.spec_from_file_location("ozon_bootstrap_prehandoff_v1", V1_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load prehandoff gate authority")
v1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v1)


def main() -> None:
    v1.run(["git", "merge-base", "--is-ancestor", v1.BASE, "HEAD"])
    v1.assert_prefx_target_failure()
    v1.run(["python", str(V2_MATERIALIZER)])
    v1.run(["git", "diff", "--check"])
    v1.verify_scope()
    v1.syntax_check(v1.DIST)
    refresh_state = v1.run_shared_regressions(v1.DIST)
    inventory_rows = v1.dependency_inventory()
    v1.build_package(refresh_state, inventory_rows)
    print("BOOTSTRAP_PROMPT_PREHANDOFF_RUNNER_V2_PASS")


if __name__ == "__main__":
    main()
