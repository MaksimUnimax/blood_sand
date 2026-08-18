# Standalone independent Codex acceptance plan — Ozon Bridge live repair

Status: plan only; do not execute in this task.  
Repository: `MaksimUnimax/blood_sand`  
Development branch: `dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18`

## Frozen target

Run independent validation only from this exact post-PASS evidence commit:

`66bc4ac712b345d499b10982e7f5124279265b88`

The full SHA is the commit that immediately precedes this plan commit. The frozen production authority remains Step-4 base `4ce190c8bbdc438dcdf407ab4be4dbecd846736df` plus exact V3 candidate `88a20984c55da1f813ca1184bd90089823f51883`.

Expected repaired hashes:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

## Independent acceptance rules

1. Start from the exact frozen target; verify clean tree, candidate hashes, manifest and protected-file integrity.
2. Use the existing accepted Windows launcher and environment only: Node `v24.12.0`, Puppeteer `25.4.0`, CFT `151.0.7922.47`, dedicated QA profile, zero operator actions.
3. Use sanitized/mock credentials and provider mocks only until a separately authorized controlled live run exists. `REAL_OZON_REQUESTS` and `REAL_PERFORMANCE_REQUESTS` must remain `0` for this plan.
4. Re-run worker and Step-1–4 regression matrices from the frozen evidence.
5. Independently verify the public contract/capability boundary, planner/projection behavior, quota ownership/recovery, verified cache-hit-before-quota behavior, and delivery isolation.
6. Independently verify the quota UI: Russian wait plate, decreasing MM:SS, absolute HH:MM:SS, due sending state, disabled duplicate interaction, durable restart restore, two-owner isolation, ChatGPT and Alice bindings, native Copy independence, and zero cross-owner delivery.
7. Record exact commands, versions, hashes, stdout/stderr, provider-call counters, and classification. Any actual assertion failure after production execution is `PRODUCTION_BEHAVIOR_FAILURE`; harness/environment failures remain separately classified.
8. Do not repair production, create V4, modify the frozen target, promote a release, or execute live acceptance without a new explicit authorization.

## Output and stop condition

Publish one independent acceptance report/decision from the frozen target. A PASS unlocks only the next separately authorized controlled live acceptance; it does not itself promote a release. Stop after publishing the independent result.
