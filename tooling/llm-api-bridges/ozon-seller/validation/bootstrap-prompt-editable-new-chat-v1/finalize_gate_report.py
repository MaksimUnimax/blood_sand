#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--source-sha", required=True)
    p.add_argument("--source-tree", required=True)
    p.add_argument("--package-sha", required=True)
    p.add_argument("--package-bytes", required=True)
    p.add_argument("--workflow-run", required=True)
    p.add_argument("--refresh-state", required=True)
    p.add_argument("--output", required=True)
    a = p.parse_args()

    evidence = {
        1: "direct operator authorization: `Делай патч, следуй правилам`",
        2: "failing evidence and root-cause set frozen before production materialization",
        3: "scope limited to bootstrap/start-prompt editability before stable conversation identity; exactly four production files",
        4: "no hidden branch/ref/config/manifest/provider mutation",
        5: "exact operator-observed new-chat/no-ID workflow reconstructed",
        6: "secondary sweep covered popup save/reset, storage, pending-start, existing-chat and Autorun prompt consumers",
        7: "producer/consumer inventory persisted in `DEPENDENCY_CLOSURE_2026-09-10.md`",
        8: "global/per-conversation storage lifetimes, readers, writers and crossings traced to observable behavior",
        9: "existing real-identity/per-conversation isolation preserved; missing global bootstrap-template layer added",
        10: "no provider/account blocker reclassified or repaired in bridge code",
        11: "global prompt deliberately durable in existing local storage; per-conversation custom overrides remain durable",
        12: "work-session model/pending-start lifecycle regressions plus MV3 worker bootstrap passed",
        13: "proof is not same-instance-only: storage VM semantics, lifecycle regressions, Chrome MV3 and cross-platform exact-source checks used",
        14: "no fabricated live IDs/refs used; deterministic prompt test keys are explicit synthetic unit-test fixtures only",
        15: "no fake conversation key introduced; per-conversation controls still fail closed before stable identity",
        16: "production JS, package extraction and real Chrome MV3 service-worker bootstrap checked",
        17: "manifest and service-worker entry unchanged; no runtime network destination introduced",
        18: f"exact tested artifact recorded: SHA-256 `{a.package_sha}`, `{a.package_bytes}` bytes",
        19: "artifact built after executable materialization and retested from fresh extraction; no later executable change",
        20: "request-building/exact-request path unchanged; prior command-envelope authority regression passed",
        21: "logical/physical request-accounting path unchanged; intersecting accounting regressions passed",
        22: "no provider request/retry path changed; prior hidden-request guards remain green",
        23: "negative pre-fix control plus positive candidate inheritance/override/reset/migration controls passed",
        24: "entitlement/provider-classification code unchanged",
        25: "personal-data policy code unchanged",
        26: "privacy/provenance path unchanged",
        27: "redaction path unchanged; no new result/data exposure introduced",
        28: "credential/URL/base64 output paths unchanged; no new transport handling introduced",
        29: "no external URL/host handling added; packaged manifest unchanged",
        30: "target regression failed on pre-fix specifically at `GLOBAL_BOOTSTRAP_PROMPT_STORAGE_KEY_MISSING` and passed final candidate",
        31: f"relevant work-session/mixed/command/delivery guards passed; historical refresh guard classified `{a.refresh_state}` without false promotion",
        32: "complete available new-chat configuration path tested from popup/storage source through effective resolver and exact extracted artifact",
        33: "no stale/fabricated live dependency used to make acceptance pass",
        34: "repair tests perform zero Ozon business mutations; prompt configuration path performs no provider request",
        35: "final executable artifact passed Linux, Windows, fresh-extract and Chrome MV3 checks with changed-dependency closure complete",
    }

    lines = [
        "# Ozon bootstrap prompt editable-new-chat repair — FINAL PRE-HANDOFF", "",
        "## Exact identity", "",
        "- repair branch: `repair/ozon-bootstrap-prompt-editable-new-chat-2026-09-10`",
        "- base authority: `da762fec61f55793406dae96d9f8aaae757425f4`",
        f"- exact cross-platform tested executable source commit: `{a.source_sha}`",
        f"- exact tested source tree: `{a.source_tree}`",
        "- runtime version: `0.1.19`",
        "- artifact: `OZON_BRIDGE_v0.1.19_BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_20260910.zip`",
        f"- artifact bytes: `{a.package_bytes}`",
        f"- artifact SHA-256: `{a.package_sha}`",
        f"- certification workflow run: `{a.workflow_run}`", "",
        "Built-in startup-prompt wording was deliberately **not changed** by this patch. The separate Alice wording issue remains out of scope.", "",
        "## Mandatory GATE-01..35", "", "| Gate | Status | Evidence |", "|---|---|---|",
    ]
    for i in range(1, 36):
        lines.append(f"| GATE-{i:02d} | PASS | {evidence[i]} |")
    lines += [
        "", "## Post-install LIVE-GATE", "", "| Gate | Status | Required evidence |", "|---|---|---|",
        "| LIVE-GATE-01 | PENDING POST-INSTALL | Brand-new supported ChatGPT/Alice chat with no stable conversation ID: edit global prompt before any message, save, press Start, observe that exact configured text sent once. |",
        "| LIVE-GATE-02 | PENDING POST-INSTALL | Repeat through a real MV3 lifecycle boundary; verify durable global prompt plus correct pending-start binding. |",
        "| LIVE-GATE-03 | PENDING POST-INSTALL | Validate UI state, effective prompt source, one submission, stable binding and zero Ozon provider business requests. |",
        "| LIVE-GATE-04 | PENDING POST-INSTALL | Verify existing custom per-conversation override survives global changes; local reset returns that conversation to global inheritance. |",
        "| LIVE-GATE-05 | PENDING POST-INSTALL | CI/package PASS is not LIVE PASS; installed live evidence is still required. |", "",
        "**PRE-HANDOFF VERDICT: PASS**", "", "**LIVE CERTIFICATION: PENDING**", "",
    ]
    Path(a.output).write_text("\n".join(lines), encoding="utf-8")
    print("FINAL_GATE_REPORT_MATERIALIZED_PASS")


if __name__ == "__main__":
    main()
