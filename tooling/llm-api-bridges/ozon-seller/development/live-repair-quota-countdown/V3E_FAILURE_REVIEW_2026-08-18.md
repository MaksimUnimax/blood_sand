# Ozon Bridge v0.1.19 — V3E failure review

Date: 2026-08-18
Status: engineering review only; no production changes, no freeze, no live-provider authorization.

## Authority

- Frozen Step-4 base: `4ce190c8bbdc438dcdf407abbe4dbecd846736df`
- Exact V3 candidate: `88a20984c55da1f813ca1184bd90089823f51883`
- Repaired worker SHA-256: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- Repaired content SHA-256: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`
- V3E report commit: `754f81d4e4f237ea79e4ab4727c67dd7e9cb5dc8`
- `REAL_OZON_REQUESTS = 0`
- `REAL_PERFORMANCE_REQUESTS = 0`

## What V3E established

V3E fixed the prior integrity ambiguity. All five Git-object identities passed one-to-one. The worker runner applied only the permitted test race correction (`last=now-64800` -> `last=now-57000`) and the actual repaired worker still did not expose `quota_waiting` within the harness's 3-second observation window. Manual public state, autorun public state, and privacy had already passed before that point.

The browser path still did not execute production assertions. The V3E runner failed with `EPERM` while trying to create a relocated `.mjs` file inside the existing Puppeteer QA project root. This is an environment/write-location failure, not browser-production evidence.

## Why the worker failure is not yet enough for a production patch

The timeout only says the harness did not observe `manual_operation.batch.request_state === "quota_waiting"`. It does not reveal what the actual durable owner state became instead.

Before changing production, the next diagnostic must print the exact durable manual operation, quota state, cache state, diagnostics, and mocked provider-call list at timeout.

The accepted Step-1 retest is relevant: universal analytics (`revenue`) was explicitly validated as a zero-capability-probe case, so the current command should not need a seller-info capability probe merely to reach the quota layer.

## V3F diagnostic decision

No V4 is justified yet.

V3F is test-only and does two things:

1. Worker diagnostic runner:
   - validates exact source harness Git blob `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`;
   - applies only the same +8s race correction;
   - adds timeout diagnostics only;
   - prints durable manual operation, provider quota state, result cache state, diagnostics, and mocked provider calls before rethrowing the timeout.

2. Browser junction runner:
   - validates exact browser harness Git blob `841429741d5ff9144a8a40506e657dc4392fe37c`;
   - copies the exact bytes into a writable temporary directory;
   - creates a test-only `node_modules` junction to the existing Puppeteer QA project's `node_modules`;
   - executes the unmodified browser harness from that writable temporary directory.

V3F changes no production byte and authorizes no real Ozon/Performance request.
