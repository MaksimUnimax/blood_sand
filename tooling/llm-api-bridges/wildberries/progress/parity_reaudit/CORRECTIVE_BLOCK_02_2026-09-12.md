# Corrective parity — block 02
Date: 2026-09-12
Status: BASELINES VERIFIED / CODE COMPARISON NEXT / NOT A RELEASE
Previous checkpoint: CORRECTIVE_BLOCK_01_2026-09-12.md, commit e0fb33e8e479cf712e7e6f30702f2d4cece671ea; remote readback matched blob 549c77b27cfe5c20fedf24f44d9c1118db3ecd99.

## Actual local materialization
Workspace: `/mnt/data/wb_parity_corrective_2026-09-12`.
`prepare.py` verifies input digests and rejects absolute/traversal ZIP members before extraction. `INPUT_MANIFEST.json` records every archive member.
- WB021: `WB_BRIDGE_v0.2.1.zip`, 128734 bytes, SHA256 ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23, 29 production files. Extracted untouched under `wb021/wildberries-bridge-v0.2.1/`.
- Ozon reference: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`, 245479 bytes, SHA256 a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83, 30 production files. Extracted untouched under `ozon_reference/`. This does not claim identity to later Ozon branches.
- Prior work/test archive: `WB_v0.2.1_WORK_AND_TESTS.zip`, 1511072 bytes, SHA256 ddc73abea43e681277493b0decf1c5f61b6a1b50e1033c1adca40bc27fea1399, 736 files. Extracted under `previous_work/`; archived PASS not reused as parity PASS.

## Ozon rule sources inspected
Immutable Ozon ref: 97f1abc0ecaa04c6e24d0c32f8525b126b05d0e1.
- `tooling/llm-api-bridges/ozon-seller/README.md`, full, blob 5b368e248bd2a09d41d7ddbf4dea7a955dabe4e1.
- `OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`, blob cca7e27fec0420110f74e43a28fcdff973961bad. Initial large response truncated; covered remainder through explicit reads 151–269 and 270–EOF. Rules used: exact baseline and dependency map before production changes; smallest coherent correction; RED/GREEN when practical; non-browser checks first; each assertion persisted immediately; test/harness failures distinguished; no unrelated historical full reruns; original reference snapshots immutable; exact-candidate packaging; live facts not proven by synthetic QA.

Protected boundaries: one extension-owned top-level Shadow DOM overlay; native Copy structurally anchors selected block, not command cardinality; exact conversation ownership; no arbitrary assistant-supplied hosts/auth/method; no hidden request retry/fan-out/polling; UI recovery must not reset quota/cache or replay provider. WB-specific registry and 172 enabled/16 disabled remain unchanged. Codex prompts are not being issued in this pass.

## Next action
Inspect exact Ozon/WB popup HTML/CSS/JS, current WB worker early-throw path and existing test harness. Resolve any additional patch-gate file referenced by current sources. Persist causal comparison plus red-test runner/results before implementation. Finish unread re-audit sections only as their dependent blocks are entered, with ranges recorded; not an all-history completion claim.

Runtime production changes: 0. New test runs: 0. Marketplace calls: 0. Business mutations: 0.
