# Ozon Bridge v0.1.19 — repair V2 patch-context correction

Date: 2026-08-18
Status: `V2_PATCH_CONTEXT_CORRECTED_PREFREEZE_RECHECK_REQUIRED`

## Authority

Frozen Step-4 production base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Frozen repair scope:

`4a20160ca5b39ccb99c30cc3ac887d9e488f2b92`

Failed pre-freeze engineering report:

- branch `engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18`
- report commit `f659739938dc87588411a5ff1f288a23cfec3c2e`
- verdict `PREFREEZE_CHECK_FAILED`

The report proved exact frozen Step-4 reconstruction `17/17` and exact V1 raw transport, then stopped because V1 patch application failed before any repaired candidate existed.

## Exact failure cause

V1 first worker hunk expected this adjacency:

`ANALYTICS_MIN_INTERVAL_MS` -> delivery single-flight comment.

That adjacency existed before Step 4, but frozen Step 4 already has two accepted cache constants between them:

- `PROVIDER_RESULT_CACHE_SCHEMA_VERSION = 1`
- `ANALYTICS_CACHE_TTL_MS = 60_000`

Therefore V1 unified-diff context was stale even though the intended added line and repair semantics were unchanged.

This is classified as a patch-packaging/context defect, not a discovered defect in quota/countdown semantics.

## V2 correction

Only `patch-parts/00.patch.part` first hunk context was rebased onto exact frozen Step-4 context.

The repair-added line is unchanged:

`const ANALYTICS_QUOTA_LAUNCH_SAFETY_MS = 5_000;`

The two existing Step-4 cache constants are now retained as context immediately after it.

No production behavior was added, removed, or altered relative to the intended V1 repair.

Parts `01.patch.part` and `02.patch.part` are byte-identical to V1.

## V2 integrity

Current part metadata:

- part 00: bytes `4846`, SHA-256 `0163659825c2a20cd51bda19bf851746fc7bc1e0f0d888b92c4b9e551328d232`, Git blob `2a56745a2e9c4870e9bea4212254d28d14810928`
- part 01: bytes `4775`, SHA-256 `7402568c52814d002c649e75f98d00db272c060f7bcc02e94f74564b0572f1e0`, Git blob `11d22c70b1986f9be8aeb375da8e7d9dc5eddcc8`
- part 02: bytes `2851`, SHA-256 `dbe2b2c9426eb9259488ab7d1eb7645fe7286176d5cb23da078cdace89d5b8e0`, Git blob `3248494436d109174e02f7eb309cc66be37014f2`

V2 lexical concat:

- bytes `12472`
- SHA-256 `8333f70403fb8bd4d1b81900ab6e16110633f68290e0d88db0fd164507810e7d`

Local parser result:

- `service_worker.js`: +38 / -2
- `content_script.js`: +103 / -0
- exactly two production files represented.

Live GitHub fetch-back confirmed part-00 blob `2a56745a...` and the exact frozen Step-4 cache constants in the corrected first hunk.

## Safety and scope

Unchanged repair semantics remain:

- nominal analytics interval `60000 ms`;
- fixed internal launch safety `5000 ms`;
- effective not-before launch boundary `65000 ms`;
- old persisted quota boundary migration guard;
- Retry-After extension-only;
- zero automatic retry;
- public durable quota-wait state without credential/account identifiers;
- visible owner-scoped Russian countdown and due-state copy;
- no cache-semantic change;
- no capability/query-planner/provider-surface/delivery-FSM rewrite.

`REAL_OZON_REQUESTS = 0`

## Gate consequence

V1 concat SHA `b30a91128fbb...` is permanently superseded and must never be frozen or validated.

V2 concat SHA `8333f70403fb...` is the only current repair patch candidate.

V2 is still NOT frozen. It requires a new exact detached pre-freeze reconstruction/apply check against the same frozen Step-4 base. The new check must not fuzz, manually edit, or repair V2 if application fails.