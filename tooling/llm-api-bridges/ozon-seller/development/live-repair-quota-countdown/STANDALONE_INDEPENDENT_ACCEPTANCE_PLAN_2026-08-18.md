# Standalone independent Codex acceptance plan — Ozon Bridge live repair

Status: plan only; independent acceptance is the next separate task.  
Repository: `MaksimUnimax/blood_sand`  
Development branch: `dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18`

## Authority correction

The post-PASS freeze evidence commit `66bc4ac712b345d499b10982e7f5124279265b88` contains a transcription typo in the displayed Step-4 base SHA (`4ce190c8bbdc438dcdf407ab4be4dbecd846736df`). That typo is documentation-only and MUST NOT be used as authority.

The authoritative frozen Step-4 base is exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

The frozen repair target remains unchanged:

`66bc4ac712b345d499b10982e7f5124279265b88`

The exact V3 production candidate remains:

`88a20984c55da1f813ca1184bd90089823f51883`

This corrected plan supersedes the earlier plan commit `e9a9f4b6f6a91f5c765083906b53b4be5a6fb74f` only for plan text/authority correction; it does not modify the frozen target or any production bytes.

## Frozen target

Run independent validation only from this exact post-PASS evidence commit:

`66bc4ac712b345d499b10982e7f5124279265b88`

Frozen production authority:

- Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`

Expected repaired hashes:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

## Independent acceptance rules

1. Start from the exact frozen target `66bc4ac712b345d499b10982e7f5124279265b88`; verify clean tree, candidate hashes, manifest and protected-file integrity. Do not validate from the later development-branch plan commits.
2. Reconstruct/verify the authoritative Step-4 base only as `4ce190c8bbdc438dcdf407abbe4dbecd846736df`. Treat the typo recorded above as non-authoritative negative documentation evidence.
3. Use the existing accepted Windows launcher and environment only: Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, `D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`, dedicated QA profile, zero operator actions. Do not redesign the launcher.
4. Use sanitized/mock credentials and provider mocks only. `REAL_OZON_REQUESTS=0` and `REAL_PERFORMANCE_REQUESTS=0` are mandatory for this independent synthetic acceptance.
5. Independently re-run the worker quota matrix and Step-1–4 regression matrix from the frozen target. Do not reuse a prior PASS as the acceptance result.
6. Independently verify the public contract/capability boundary, planner/projection behavior, quota ownership/recovery, verified cache-hit-before-quota behavior, one-provider-at-due behavior, 429 no-retry/replay behavior, Retry-After extension-only behavior, and delivery isolation.
7. Independently verify the quota UI using actual frozen production code: Russian wait plate, decreasing MM:SS, absolute HH:MM:SS, due sending state, disabled duplicate interaction, durable restart restore, two-owner isolation, ChatGPT and Alice bindings, native Copy independence, and zero cross-owner delivery.
8. Record exact commands, environment versions, production hashes, stdout/stderr, provider-call counters, operator actions, and classification. Any actual assertion failure after frozen production execution is `PRODUCTION_BEHAVIOR_FAILURE`; harness/environment failures remain separately classified and do not authorize a production repair.
9. Do not repair production, create V4, modify the frozen target, promote a release, or execute any real/live provider acceptance in this task.

## Report-only lineage

Create the independent acceptance branch FROM EXACT:

`66bc4ac712b345d499b10982e7f5124279265b88`

Required branch:

`validation/ozon-live-repair-independent-acceptance-2026-08-18`

The branch must remain report-only relative to the exact frozen target: merge base exact frozen target, `behind_by=0`, and only one acceptance report commit/file may be added.

Required report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_LIVE_REPAIR_INDEPENDENT_ACCEPTANCE_2026-08-18.md`

The report must include a full PASS/FAIL matrix for integrity, worker, Step-1–4 carry-forward, browser UI, network counters, operator actions, and failure classification.

## PASS condition and stop condition

Independent acceptance PASS requires all mandatory matrices to pass on the exact frozen target with:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- no production changes
- report-only lineage

A PASS unlocks only a separately authorized controlled live acceptance. It does not promote a release and does not authorize live provider actions in this task.

After publishing exactly one independent acceptance report commit, STOP.

Return exactly:

`OZON_LIVE_REPAIR_INDEPENDENT_ACCEPTANCE_RESULT`

with tested frozen target, corrected authoritative Step-4 base, integrity/worker/regression/browser matrices, real request counters, report branch, report commit, failure classification, and final verdict.